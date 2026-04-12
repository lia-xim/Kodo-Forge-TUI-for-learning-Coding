# Section 6: Practice — Type-safe Router and Query Builder

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Recursive Type Challenges](./05-recursive-type-challenges.md)
> Next section: [Lesson 38 - Compiler API](../../38-compiler-api/sections/01-createprogram-und-ast.md)

---

## What you'll learn here

- How to build a **complete type-safe router** at the type level
- A **SQL query builder** that validates SQL syntax at compile time
- How **union-to-intersection** works and when you need it
- The balance between **type-level magic and readability**

---

## Project 1: Type-safe Router

Let's build a router that parses URL paths at compile time and
enforces type-safe handlers. This combines everything from the
previous sections:

```typescript annotated
// Step 1: Extract parameters from a path segment
type ParseSegment<S extends string> =
  S extends `:${infer Param}`   // Starts with ":"?
    ? { [K in Param]: string }   // Yes → parameter object
    : {};                         // No → no parameter

// Step 2: Process all segments
type ParsePath<Path extends string> =
  Path extends `/${infer Segment}/${infer Rest}`
    ? ParseSegment<Segment> & ParsePath<`/${Rest}`>
    // ^ Combine first segment with rest (recursively)
    : Path extends `/${infer Segment}`
      ? ParseSegment<Segment>
      // ^ Last segment
      : {};

// Step 3: Union-to-intersection (for clean types)
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;
// ^ This trick uses contravariant position: function parameters
//   are merged from union into intersection

// Step 4: The router
type RouteParams<Path extends string> =
  UnionToIntersection<ParsePath<Path>> extends infer R
    ? { [K in keyof R]: R[K] }  // "Flatten" for clean display
    : never;

// Tests:
type T1 = RouteParams<"/users/:id">;
// ^ { id: string }

type T2 = RouteParams<"/users/:userId/posts/:postId">;
// ^ { userId: string; postId: string }

type T3 = RouteParams<"/about">;
// ^ {}
```

> 📖 **Background: UnionToIntersection — the most famous type trick**
>
> `UnionToIntersection<A | B>` yields `A & B`. How does it work?
> It exploits a property of function parameters: they are
> **contravariant** (L22). When you have a union `(x: A) => void |
> (x: B) => void` and extract the parameter with `infer`, the
> inferred type must satisfy both A and B — hence `A & B`. This
> trick was discovered in 2018 by jcalz on StackOverflow and has
> since appeared in every type-level library.
>
> Why do we need it in the router? Because `ParsePath` produces a
> separate object type for each parameter, these get collected as
> a union, and only `UnionToIntersection` merges them into a single
> object: `{ userId: string } | { postId: string }` becomes
> `{ userId: string } & { postId: string }` — which is what the
> developer expects to see as `params`.

### The complete router

```typescript annotated
interface RouteDefinition<Path extends string> {
  path: Path;
  handler: (params: RouteParams<Path>) => Response;
}

function defineRoute<Path extends string>(
  path: Path,
  handler: (params: RouteParams<Path>) => Response
): RouteDefinition<Path> {
  return { path, handler };
}

// Usage — fully type-safe!
const userRoute = defineRoute(
  "/users/:userId/posts/:postId",
  (params) => {
    params.userId;   // string — autocomplete!
    params.postId;   // string — autocomplete!
    // params.foo;   // ERROR!
    return new Response("OK");
  }
);
```

> ⚡ **Framework connection:** Next.js App Router extracts parameters
> from `[id]` folder names. Angular's Router has `paramMap.get('id')`.
> But neither can parse the string `/users/:id` at compile time.
> Libraries like `typesafe-routes` and `remix-typedjson` use exactly
> this pattern to fill that gap.

---

## Project 2: SQL Query Builder at the Type Level

A query builder that knows the table schema and only allows valid
columns:

```typescript annotated
// Schema definition:
interface DB {
  users: { id: number; name: string; email: string; active: boolean };
  posts: { id: number; userId: number; title: string; body: string };
  comments: { id: number; postId: number; text: string };
}

// Query builder with step interfaces (L26):
type SelectStep<Schema> = {
  from<T extends keyof Schema & string>(table: T): WhereStep<Schema, T>;
};

type WhereStep<Schema, Table extends keyof Schema & string> = {
  where<Col extends keyof Schema[Table] & string>(
    column: Col,
    op: "=" | "!=" | ">" | "<",
    value: Schema[Table][Col]
    // ^ The value type depends on the column!
  ): WhereStep<Schema, Table>;
  select<Cols extends (keyof Schema[Table] & string)[]>(
    ...columns: Cols
  ): ResultStep<Pick<Schema[Table], Cols[number]>>;
  selectAll(): ResultStep<Schema[Table]>;
};

type ResultStep<Row> = {
  limit(n: number): ResultStep<Row>;
  toSQL(): string;
  execute(): Promise<Row[]>;
};
```

### Usage

```typescript
declare function query<S = DB>(): SelectStep<S>;

// Full type safety:
const result = query()
  .from("users")                      // Only "users" | "posts" | "comments"
  .where("active", "=", true)         // active is boolean → true OK
  // .where("active", "=", "yes")     // ERROR: string ≠ boolean
  .select("id", "name")              // Only valid columns
  // .select("id", "foo")             // ERROR: "foo" ∉ keyof users
  .limit(10);
```

The key insight: the value type in the `where()` call depends directly
on the column. `where("active", "=", true)` is allowed because `active`
is a `boolean`. `where("id", "=", "abc")` would be an error because `id`
is a `number`. This kind of argument correlation isn't achievable with
simple generics — only step interfaces make it possible.

> 🧠 **Explain it to yourself:** Why is the type-level query builder
> safer than a string-based query builder like Knex.js?
> What can the type-level approach prevent that Knex cannot?
> **Key points:** Column names are validated at compile time |
> Value types match the column (boolean for boolean columns) |
> Typos in column names are compile errors instead of runtime errors |
> Knex validates columns only when the query is executed

> 💭 **Think about it:** Would you implement the entire query builder
> at the type level in a real project? Where is the line between
> "sensible type safety" and "over-engineering"?
>
> **Answer:** The step interfaces and column validation are
> production-ready — Drizzle ORM actually uses this. But parsing
> SQL syntax at the type level (e.g., `type Parse<"SELECT * FROM
> users WHERE id = 1">`) would be over-engineering. The rule: type
> the **interface** (which columns, which types), not the
> **implementation** (SQL string generation).

---

## The balance: When is enough enough?

```
Type-level complexity
│
│  ▲ Diminishing Returns
│  │
│  │  ┌─────────────────────────────┐
│  │  │ Full SQL parser at          │ ← Over-engineering
│  │  │ the type level              │
│  │  └─────────────────────────────┘
│  │  ┌─────────────────────────────┐
│  │  │ Query builder with          │ ← Sweet spot for libraries
│  │  │ step interfaces + schema    │
│  │  └─────────────────────────────┘
│  │  ┌─────────────────────────────┐
│  │  │ Extracting route params     │ ← Sweet spot for projects
│  │  │ from path strings           │
│  │  └─────────────────────────────┘
│  │  ┌─────────────────────────────┐
│  │  │ Generics + conditional      │ ← Standard for every TS dev
│  │  │ types for APIs              │
│  │  └─────────────────────────────┘
│  │
│  └──────────────────────────────────→ Practical value
```

### The checklist for type-level code

1. **Does the user actually need this type safety?** (Not: "Is it cool?")
2. **Can I explain the type in 30 seconds?** (If not: too complex)
3. **Is there a simpler alternative?** (Overloads? Union types?)
4. **How are the error messages?** (Unreadable errors = bad DX)
5. **Will the type survive a TypeScript update?** (Avoid undocumented behavior)

---

## Experiment: Extend the router

Extend the router with query parameters and HTTP methods:

```typescript
// Goal: GET /users/:id?fields=name,email
// → { method: "GET"; params: { id: string }; query: { fields: string } }

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RouteConfig<
  Method extends HttpMethod,
  Path extends string,
  Query extends Record<string, string> = {}
> = {
  method: Method;
  params: RouteParams<Path>;
  query: Query;
};

// Experiment 1: Build a defined route type for:
// POST /api/users/:userId/comments with query { page: string; limit: string }

// Experiment 2: Can you parse the query string "page=1&limit=10" at the type level
// and derive { page: string; limit: string } from it?
// (Hint: You have the ParseQuery type from section 3!)
```

---

## The real world: Libraries that use this

Understanding these techniques in a learning context is one thing.
Seeing that professional libraries do the same is another. Here's a
brief overview:

| Library | Type-level technique | Purpose |
|---|---|---|
| **tRPC** | Template literal types | Parse procedure names (`"user.getById"`) |
| **Zod** | Inferred output types | Schema to TypeScript type |
| **Drizzle ORM** | Step interfaces + schemas | Type SQL queries |
| **Prisma** | Code generation + types | DB schema to TypeScript |
| **React Hook Form** | PathOf-like pattern | Type form paths |
| **type-fest** | Utility types collection | DeepReadonly, PathOf etc. |

The important part: all these libraries hide the complexity behind
simple APIs. The user sees `query().from("users")`, not the 50 lines
of step interface types behind it. That's good type-level design:
**the library carries the complexity, not the user.**

> ⚡ **Angular framework connection (Standalone):** In modern Angular
> apps with standalone components, you'll often combine `inject()` with
> service tokens. With type-level types you could build a type-safe
> dependency injection container:
>
> ```typescript
> // Concept: type-safe DI container
> type TokenMap = {
>   "http": HttpClient;
>   "router": Router;
>   "auth": AuthService;
> };
>
> declare function injectByName<K extends keyof TokenMap>(
>   name: K
> ): TokenMap[K];
>
> const http = injectByName("http");    // HttpClient
> const auth = injectByName("auth");    // AuthService
> // injectByName("foo");               // ERROR: "foo" ∉ keyof TokenMap
> ```

---

## What you've learned

- A **type-safe router** that extracts URL parameters at compile time — ready for production
- A **SQL query builder** that validates tables, columns, and value types at compile time
- **UnionToIntersection** — the most important utility type for type-level libraries
- The **checklist** for balancing type safety against complexity
- Real libraries (tRPC, Drizzle, Zod, React Hook Form) use the same techniques in production
- Type-level programming is most valuable at **interfaces** (APIs, routers, ORMs)

> 🧠 **Explain it to yourself:** You've now learned all the tools of
> type-level programming: arithmetic, string parsing, pattern matching,
> recursion, practical projects. Which single tool would you reach for
> first in your Angular project?
> **Key points:** Route parameter types are immediately usable |
> PathOf for deeply nested config objects | DeepReadonly for
> immutable state objects | Easiest starting point: utility types
> like DeepReadonly that require no API changes

**Core concept of the entire lesson:** Type-level programming is a language within the language. Use it deliberately for interfaces and libraries — that's where the ROI is highest. For business logic, stick to simple types. The best type-level systems hide their complexity — the user only sees simple, type-safe APIs.

---

> **Pause point** — You've mastered type-level programming.
> The next lesson shows you the other side: how the TypeScript
> compiler itself works and how to use its API.
>
> Continue with: [Lesson 38: Compiler API](../../38-compiler-api/sections/01-createprogram-und-ast.md)