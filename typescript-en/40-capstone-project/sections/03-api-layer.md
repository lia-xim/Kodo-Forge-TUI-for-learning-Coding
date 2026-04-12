# Section 3: API Layer — Type-safe REST and Validation

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Domain Modeling](./02-domain-modeling.md)
> Next section: [04 - Business Logic](./04-business-logic.md)

---

## What you'll learn here

- How to build a **type-safe API layer** that connects route, method, request, and response
- **Route definition as single source of truth** — one type for everything
- **Validation at the system boundary** with type guards (no external dependencies)
- How **error responses are modeled as types**

---

## Layer 2: The API

The API layer is the **defensive shell** (L39). This is where
external data comes in — and where it must be validated.

```typescript annotated
// ── API Contract: One Type Defines EVERYTHING ────────────────────────

interface ApiRoute<
  Method extends "GET" | "POST" | "PUT" | "DELETE",
  Path extends string,
  RequestBody,
  ResponseBody,
  ErrorBody
> {
  method: Method;
  path: Path;
  // Phantom Types (L26): These properties exist only in the type
  _request: RequestBody;
  _response: ResponseBody;
  _error: ErrorBody;
}

// Concrete routes:
type GetUserRoute = ApiRoute<
  "GET",
  "/api/users/:userId",
  never,                                    // GET has no body
  { id: UserId; name: string; email: string },
  { code: "NOT_FOUND"; message: string }
>;

type CreateOrderRoute = ApiRoute<
  "POST",
  "/api/orders",
  { userId: UserId; items: { productId: string; quantity: number }[] },
  { orderId: OrderId; status: "draft" },
  { code: "VALIDATION_ERROR"; fields: Record<string, string> }
>;
```

> 📖 **Background: API Contracts as Types**
>
> Libraries like tRPC, Hono, and Elysia use exactly this pattern:
> The API route definition IS the type. This means client and server
> share the same type — changes on the server cause compile errors
> on the client. That's the end-to-end type safety that traditional
> REST APIs don't provide. In our project we demonstrate the core
> idea without external dependencies.

---

## Route Parameter Extraction (L37)

```typescript annotated
// Use type-level programming (L37) for route parameters:
type ExtractRouteParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

// Test:
type UserRouteParams = ExtractRouteParams<"/api/users/:userId">;
// ^ { userId: string }

// Type-safe route handler:
type RouteHandler<R extends ApiRoute<any, any, any, any, any>> =
  R extends ApiRoute<infer _M, infer Path, infer Req, infer Res, infer Err>
    ? (ctx: {
        params: ExtractRouteParams<Path>;
        body: Req;
      }) => Promise<
        | { ok: true; data: Res; status: 200 | 201 }
        | { ok: false; error: Err; status: 400 | 404 | 500 }
      >
    : never;
```

### Implementing the handler

```typescript annotated
// The handler for GET /api/users/:userId:
const getUserHandler: RouteHandler<GetUserRoute> = async (ctx) => {
  // ctx.params.userId is string — autocomplete works!
  const userId = createUserId(ctx.params.userId);
  const user = await userRepository.findById(userId);

  if (!user) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: `User ${ctx.params.userId} not found` },
      status: 404,
    };
  }

  return {
    ok: true,
    data: { id: user.id, name: user.name, email: user.email },
    status: 200,
  };
};
```

> 🧠 **Explain it to yourself:** Why do we define error types as part
> of the route rather than having them globally? What's the advantage?
> **Key points:** Each route has specific errors | GET /users:
> NOT_FOUND | POST /orders: VALIDATION_ERROR | Global error types
> would be too broad — you wouldn't know which errors are possible |
> Specific error types = better client-side error handling

---

## Validation at the System Boundary

```typescript annotated
// ── Validator for CreateOrderRoute ─────────────────────────────
// No external dependencies — pure TypeScript type guards:

interface CreateOrderInput {
  userId: string;
  items: { productId: string; quantity: number }[];
}

function isCreateOrderInput(data: unknown): data is CreateOrderInput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.userId !== "string") return false;
  if (!Array.isArray(obj.items)) return false;

  return obj.items.every(item => {
    if (typeof item !== "object" || item === null) return false;
    const i = item as Record<string, unknown>;
    return typeof i.productId === "string" &&
           typeof i.quantity === "number" &&
           Number.isInteger(i.quantity) &&
           i.quantity > 0;
  });
}

// Usage in the handler:
const createOrderHandler: RouteHandler<CreateOrderRoute> = async (ctx) => {
  // ctx.body is treated as unknown by the API framework
  // The type says CreateOrderInput, but we validate anyway:
  if (!isCreateOrderInput(ctx.body)) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", fields: { body: "Invalid input" } },
      status: 400,
    };
  }

  const userId = createUserId(ctx.body.userId);
  const orderId = createOrderId();
  // ... create order
  return { ok: true, data: { orderId, status: "draft" }, status: 201 };
};
```

> ⚡ **Framework reference:** In Angular, validation would happen in an
> HTTP interceptor or in the service. The route definitions could be
> registered as Angular DI tokens. In Next.js the route handlers would
> live in `app/api/users/[userId]/route.ts` — with the type definitions
> in a shared file. The pattern is identical; only the integration differs.

> 💭 **Think about it:** We validate `ctx.body` even though the type
> already says `CreateOrderInput`. Isn't that redundant?
>
> **Answer:** No! The type comes from the route definition — it is
> a DECLARATION, not a guarantee. The actual data comes from outside
> (the HTTP request). Without validation you could treat `{ foo: "bar" }`
> as a CreateOrderInput. Validation is the defensive shell — the type
> is the offensive core.

---

## Error Handling: Result Pattern (L25)

```typescript annotated
// ── Result type for the API layer ─────────────────────────────
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// API-specific errors:
type ApiError =
  | { code: "NOT_FOUND"; resource: string; id: string }
  | { code: "VALIDATION_ERROR"; fields: Record<string, string> }
  | { code: "UNAUTHORIZED"; message: string }
  | { code: "INTERNAL"; message: string };

// Type-safe error response builder:
function errorResponse(error: ApiError, status: number): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Exhaustive error mapping:
function mapErrorToStatus(error: ApiError): number {
  switch (error.code) {
    case "NOT_FOUND": return 404;
    case "VALIDATION_ERROR": return 400;
    case "UNAUTHORIZED": return 401;
    case "INTERNAL": return 500;
    default: {
      const _: never = error;
      return 500;
    }
  }
}
```

---

## Experiment: Extend the API

```typescript
// Task 1: Define an UpdateOrderStatusRoute:
// PUT /api/orders/:orderId/status
// Body: { status: "paid"; paymentId: string } | { status: "cancelled"; reason: string }
// Response: Order (updated)
// Error: NOT_FOUND | INVALID_TRANSITION

// Task 2: Build a type-safe API client:
// type ApiClient = {
//   getUser(userId: string): Promise<Result<GetUserRoute["_response"], GetUserRoute["_error"]>>;
//   createOrder(input: CreateOrderRoute["_request"]): Promise<Result<...>>;
// };
// The types come directly from the route definitions!

// Task 3: What happens when you change the error type of a route?
// Which places in the code need to be updated?
// (Answer: The compiler shows you every affected location!)
```

---

## What you've learned

- **API routes as types** connect method, path, request, response, and error in a single definition
- **Route parameter extraction** (L37) makes URL params type-safe
- **Validation at the system boundary** with type guards — the defensive shell in action
- **Error types as a discriminated union** with exhaustive status mapping
- The API contract is the **single source of truth** for client and server

> 🧠 **Explain it to yourself:** Which lessons are embedded in this
> API layer? Count them: Generics (L13), Template Literal Types (L18),
> Type-Level Programming (L37), Result (L25), Discriminated Unions
> (L12), Exhaustive Checks (L12), Type Guards (L11), Branded Types
> (L24). How many can you find?
> **Key points:** At least 8 concepts | The API layer is the most
> complex because it connects everything | But every individual
> building block is already familiar to you

**Core concept to remember:** The API is the boundary between "trusted" and "untrusted". Everything coming in is `unknown` until validated. Everything going out has a precise type. That is the essence of the defensive shell.

---

> **Pause point** — The API layer is in place. Next layer:
> Business logic with generics and patterns.
>
> Continue with: [Section 04: Business Logic](./04-business-logic.md)