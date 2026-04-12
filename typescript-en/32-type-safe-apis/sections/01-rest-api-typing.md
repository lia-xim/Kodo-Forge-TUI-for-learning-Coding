# Section 1: REST API Typing — Request and Response Types

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Zod/Valibot Runtime Validation](./02-runtime-validierung.md)

---

## What you'll learn here

- How to define request and response types for REST APIs
- Why type parameters alone don't provide safety (the "trust me" problem from L31)
- How to build a central API type map that provides autocomplete and safety
- The "Shared Types" pattern between frontend and backend

---

## The Problem: Types End at the Network Boundary

In L31 we saw that `HttpClient.get<User[]>()` is a
"Trust me, compiler" statement. This problem exists in every HTTP client
— Angular, React, Node.js. The network boundary is a **type gap**.

Imagine two companies signing a contract in English —
but one company sends all documents in French. The contract
exists, but nobody checks whether the documents match it. That's exactly
what happens at the network boundary: your TypeScript type is the contract,
but JSON data can be anything:

```typescript
// THIS actually happens:
// 1. You define a type
interface User { id: string; name: string; email: string }

// 2. You use it in the HTTP call
const users = await fetch('/api/users').then(r => r.json()) as User[];

// 3. The API changes its schema (backend team refactors):
// { id: number, fullName: string, emailAddress: string }
//   ^ number!    ^ renamed!       ^ renamed!

// 4. Your code compiles WITHOUT ERRORS — but crashes at runtime
users[0].name  // undefined — field is now called fullName!
users[0].id.startsWith("user-")  // TypeError — id is now a number!
```

> 📖 **Background: The Type Boundary in Distributed Systems**
>
> The problem isn't TypeScript-specific. In distributed systems
> (microservices, client-server) there is always a boundary where
> types "break". Google's Protocol Buffers, Apache Thrift, and
> GraphQL were all invented to solve this problem — with
> schema definitions shared by both sides.
>
> In the TypeScript world there are several approaches: Shared Types
> (monorepo), OpenAPI/Swagger code generation, tRPC (end-to-end),
> and GraphQL code generation. Each has tradeoffs.

---

## Step 1: Solid Type Definitions

Start with clear, reusable type definitions:

```typescript annotated
// api-types.ts — Central type definitions

// Base entities
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
  // ^ Literal union instead of string — more precise!
  createdAt: string;
  // ^ ISO 8601 string — Date objects don't survive JSON
}

// Request types (what the client sends)
interface CreateUserRequest {
  name: string;
  email: string;
  role?: "admin" | "user" | "viewer";
  // ^ Optional — server sets default
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: "admin" | "user" | "viewer";
  // ^ Everything optional — partial update
}

// Response types (what the API returns)
interface ApiResponse<T> {
  data: T;
  // ^ Generic data type
  meta?: { page: number; total: number; perPage: number };
  // ^ Optional pagination metadata
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  // ^ Field-specific validation errors
}
```

### Derived Types Instead of Duplication

```typescript annotated
// BAD: Manually duplicated types
interface CreateUserRequest {
  name: string;
  email: string;
}
interface UpdateUserRequest {
  name?: string;
  email?: string;
}
// ^ If User gets a new field, you have to change 3 places!

// BETTER: Derived types with utility types
type CreateUserRequest = Pick<User, "name" | "email"> & {
  role?: User["role"];
  // ^ Role is optional on create, but uses the SAME type
};

type UpdateUserRequest = Partial<Pick<User, "name" | "email" | "role">>;
// ^ Partial + Pick — everything optional, only the changeable fields

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;
// ^ Generic response wrappers — consistent for all endpoints
```

> 🧠 **Explain it to yourself:** Why are derived types (Pick, Partial,
> Omit) better than manually defined request types? What happens when
> User gets a new required field?
>
> **Key points:** One change to the User type propagates automatically |
> Derived types can never go "out of sync" | Pick/Omit
> document the relationship to the base type | Manual types
> must be updated manually with every change

---

## Step 2: The API Type Map

For larger projects: a central map of all endpoints:

```typescript annotated
// api-routes.ts — Central route definition

interface ApiRoutes {
  "GET /api/users": {
    query?: { page?: number; role?: User["role"] };
    // ^ Query parameters with types
    response: ApiResponse<User[]>;
  };
  "GET /api/users/:id": {
    params: { id: string };
    // ^ Path parameters
    response: ApiResponse<User>;
  };
  "POST /api/users": {
    body: CreateUserRequest;
    // ^ Request body
    response: ApiResponse<User>;
  };
  "PUT /api/users/:id": {
    params: { id: string };
    body: UpdateUserRequest;
    response: ApiResponse<User>;
  };
  "DELETE /api/users/:id": {
    params: { id: string };
    response: ApiResponse<void>;
  };
}
```

### Type-Safe Client from the Map

```typescript annotated
// Extract method and path from the key
type RouteKey = keyof ApiRoutes;
// ^ "GET /api/users" | "GET /api/users/:id" | "POST /api/users" | ...

type ExtractResponse<K extends RouteKey> = ApiRoutes[K]["response"];
// ^ Conditional access to the response type

// Simplified type-safe fetch
async function apiRequest<K extends RouteKey>(
  route: K,
  options?: Omit<ApiRoutes[K], "response">
): Promise<ExtractResponse<K>> {
  // ^ Return type is extracted from the map
  const [method, path] = (route as string).split(" ");
  // Implementation: fetch with method, path, options...
  const res = await fetch(path, { method });
  return res.json();
}

// Usage — full autocomplete!
const users = await apiRequest("GET /api/users");
// ^ users: ApiResponse<User[]>
const user = await apiRequest("POST /api/users", { body: { name: "Max", email: "max@test.de" } });
// ^ user: ApiResponse<User>
```

> 💭 **Think about it:** What is the advantage of a string-based
> route map ("GET /api/users") over separate functions
> (getUsers, createUser)? What are the disadvantages?
>
> **Answer:** Advantage: A single place for all routes,
> automatic consistency, easy code generation. Disadvantage:
> String-based keys are less ergonomic than function names.
> In practice: the map is the "source of truth", type-safe
> wrapper functions are built on top of it.

---

## Step 3: Path Parameter Typing

Path parameters like `:id` should be type-safe:

```typescript annotated
// Template literal type for path parameters
type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<Rest>
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};
// ^ Recursive conditional type — extracts all :param from the path

// Examples:
type P1 = ExtractParams<"/api/users/:id">;
// ^ { id: string }
type P2 = ExtractParams<"/api/users/:userId/posts/:postId">;
// ^ { userId: string } & { postId: string }
```

> ⚡ **Practical tip for Angular:** Angular's Router uses a
> similar pattern — `ActivatedRoute.params` is `Observable<Params>`
> where `Params` is a `Record<string, string>`. With a type map
> you can make this more type-safe:
>
> ```typescript
> // Instead of:
> const id = this.route.snapshot.params['id']; // string | undefined
>
> // Better: Type-safe wrapper
> type RouteParams = { '/users/:id': { id: string } };
> function getParam<P extends keyof RouteParams>(
>   route: ActivatedRouteSnapshot, path: P, param: keyof RouteParams[P]
> ): string {
>   return route.params[param as string];
> }
> ```

---

## The Shared Types Pattern

Shared types in monorepos are like a shared blueprint between
architect and builder: both sides — frontend and backend — work
from the same document. When a type changes, everyone notices immediately.

```typescript
// packages/shared-types/src/user.ts
export interface User { id: string; name: string; email: string; }
export type CreateUserRequest = Pick<User, "name" | "email">;
export type UpdateUserRequest = Partial<CreateUserRequest>;

// packages/backend/src/routes/users.ts
import type { User, CreateUserRequest } from '@myapp/shared-types';

// packages/frontend/src/services/user.service.ts
import type { User, CreateUserRequest } from '@myapp/shared-types';
```

> 🔬 **Experiment:** Define an API type map for a simple
> Todo app and build a type-safe client:
>
> ```typescript
> interface Todo { id: string; title: string; done: boolean; }
> type CreateTodo = Pick<Todo, "title">;
>
> interface TodoRoutes {
>   "GET /todos": { response: Todo[] };
>   "POST /todos": { body: CreateTodo; response: Todo };
>   "PUT /todos/:id": { body: Partial<Todo>; response: Todo };
>   "DELETE /todos/:id": { response: void };
> }
>
> // Question: What type does the result of
> // apiRequest("POST /todos", { body: { title: "Test" } }) have?
> // Answer: Todo — extracted from the map
> ```

---

## What you've learned

- REST API types need request types (body, query, params) AND response types
- Derived types (Pick, Partial, Omit) prevent duplication and inconsistency
- A central API type map provides autocomplete and consistency for all endpoints
- Template literal types can automatically extract path parameters
- Shared types in monorepos synchronize frontend and backend types

**Core concept to remember:** Types alone are not enough. They are a contract — but a contract is only as good as its enforcement. Without runtime validation it's like a game of telephone: somewhere between the server and your code the meaning can get lost, and you only notice it at runtime. The next section shows how runtime validation truly enforces the contract.

---

> **Pause point** — You now have the fundamentals of API typing.
> Next step: runtime validation.
>
> Continue with: [Section 02: Zod/Valibot Runtime Validation](./02-runtime-validierung.md)