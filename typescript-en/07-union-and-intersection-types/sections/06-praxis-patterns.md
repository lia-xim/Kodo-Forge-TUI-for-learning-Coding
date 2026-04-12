# Section 6: Practical Patterns — Union & Intersection in the Real World

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Union vs Intersection](./05-union-vs-intersection.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- How to model **state machines** with Discriminated Unions
- The **Result pattern** for type-safe error handling
- What **API response types** look like in practice
- **Event systems** and **command patterns** with Union & Intersection

---

## Pattern 1: State Machines

One of the strongest use cases for Discriminated Unions:
**state machines**. The compiler prevents invalid states:

```typescript annotated
// ─── States of an order ──────────────────────────
type OrderState =
  | { status: "draft"; items: CartItem[] }
  | { status: "submitted"; items: CartItem[]; submittedAt: Date }
  | { status: "paid"; items: CartItem[]; submittedAt: Date; paidAt: Date; paymentId: string }
  | { status: "shipped"; items: CartItem[]; submittedAt: Date; paidAt: Date; paymentId: string; trackingNumber: string }
  | { status: "delivered"; items: CartItem[]; submittedAt: Date; paidAt: Date; paymentId: string; trackingNumber: string; deliveredAt: Date };

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

// ─── State transitions: Only valid transitions ────
function submitOrder(order: Extract<OrderState, { status: "draft" }>): Extract<OrderState, { status: "submitted" }> {
  return {
    ...order,
    status: "submitted",
    submittedAt: new Date(),
  };
}

function payOrder(
  order: Extract<OrderState, { status: "submitted" }>,
  paymentId: string
): Extract<OrderState, { status: "paid" }> {
  return {
    ...order,
    status: "paid",
    paidAt: new Date(),
    paymentId,
  };
}

// TypeScript PREVENTS invalid transitions:
// payOrder(draftOrder, "pay-123");
// Error! "draft" is not "submitted"
```

> 📖 **Background: State machines and illegal states**
>
> The principle "Make illegal states unrepresentable" comes from
> Yaron Minsky (Jane Street, OCaml). The idea: if your type system
> can't even express invalid states, you don't need runtime checks
> for them.
>
> Example: A "paid order without a payment ID" is **impossible** with
> the type above — the `paymentId` field only exists in the `"paid"`
> state. No `if (order.paymentId)` needed!

> 🧠 **Explain it to yourself:** Why is the state machine with a
> Discriminated Union safer than a single interface with optional
> properties (`paymentId?: string, trackingNumber?: string`)?
> **Key points:** Optional properties allow invalid combinations |
> e.g. trackingNumber without paymentId | Discriminated Union enforces
> valid combinations | Compiler guarantees consistency

---

## Pattern 2: Result Type — Error Handling Without Exceptions

Instead of throwing exceptions, model success and failure as a **type**:

```typescript annotated
// ─── Generic Result type ──────────────────────────
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ─── Helper functions ─────────────────────────────
function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ─── Usage ────────────────────────────────────────
interface ValidationError {
  field: string;
  message: string;
}

function parseAge(input: string): Result<number, ValidationError> {
  const age = parseInt(input, 10);
  if (Number.isNaN(age)) {
    return err({ field: "age", message: "Not a valid number" });
  }
  if (age < 0 || age > 150) {
    return err({ field: "age", message: "Age must be between 0 and 150" });
  }
  return ok(age);
}

// ─── Safe handling of the result ──────────────────
const result = parseAge("25");
if (result.ok) {
  // result.value: number — TypeScript knows it!
  console.log(`Age: ${result.value}`);
} else {
  // result.error: ValidationError
  console.log(`Error in ${result.error.field}: ${result.error.message}`);
}
```

> ⚡ **Practical tip:** This pattern is inspired by Rust's `Result<T, E>`
> and Haskell's `Either<L, R>`. In Angular/React you see it in:
> - Form validation (errors as data, not exceptions)
> - API calls (success/error as a union, not try/catch)
> - State management (NgRx actions as Discriminated Unions)

---

## Pattern 3: API Response Types

Combine Discriminated Unions with generics for a **type-safe API layer**:

```typescript annotated
// ─── Generic API response ─────────────────────────
type ApiResponse<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T; timestamp: Date }
  | { status: "error"; error: string; statusCode: number };

// ─── Type-safe rendering ──────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
}

function renderUserList(response: ApiResponse<User[]>): string {
  switch (response.status) {
    case "idle":
      return "No data loaded yet.";
    case "loading":
      return "Loading...";
    case "success":
      // response.data: User[] — ONLY available here!
      return response.data
        .map(u => `${u.name} (${u.email})`)
        .join("\n");
    case "error":
      // response.error and response.statusCode — ONLY available here!
      return `Error ${response.statusCode}: ${response.error}`;
  }
}
```

### Pagination with Intersection

Extend the response with Intersection for **paginated data**:

```typescript annotated
interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

type PaginatedResponse<T> = Extract<ApiResponse<T[]>, { status: "success" }> & {
  pagination: PaginationMeta;
};
// Has: status: "success", data: T[], timestamp: Date, pagination: PaginationMeta

function renderPaginated(response: PaginatedResponse<User>): string {
  return `Page ${response.pagination.page} of ${response.pagination.totalPages}:\n` +
    response.data.map(u => u.name).join(", ");
}
```

---

## Pattern 4: Event System

Union types for **type-safe events** with automatic payload inference:

```typescript annotated
// ─── Event definitions ────────────────────────────
type AppEvent =
  | { type: "USER_LOGIN"; payload: { userId: string; timestamp: Date } }
  | { type: "USER_LOGOUT"; payload: { userId: string } }
  | { type: "ITEM_ADDED"; payload: { itemId: string; quantity: number } }
  | { type: "ITEM_REMOVED"; payload: { itemId: string } }
  | { type: "ORDER_PLACED"; payload: { orderId: string; total: number } };

// ─── Type-safe event handler ──────────────────────
type EventHandler<T extends AppEvent["type"]> = (
  payload: Extract<AppEvent, { type: T }>["payload"]
) => void;

// Handlers automatically receive the correct payload type:
const handleLogin: EventHandler<"USER_LOGIN"> = (payload) => {
  // payload: { userId: string; timestamp: Date } — automatically inferred!
  console.log(`User ${payload.userId} logged in at ${payload.timestamp}`);
};

const handleItemAdded: EventHandler<"ITEM_ADDED"> = (payload) => {
  // payload: { itemId: string; quantity: number }
  console.log(`${payload.quantity}x ${payload.itemId} added`);
};

// ─── Event dispatcher ─────────────────────────────
function dispatch(event: AppEvent): void {
  switch (event.type) {
    case "USER_LOGIN":
      console.log(`Login: ${event.payload.userId}`);
      break;
    case "USER_LOGOUT":
      console.log(`Logout: ${event.payload.userId}`);
      break;
    case "ITEM_ADDED":
      console.log(`Item: ${event.payload.itemId} x${event.payload.quantity}`);
      break;
    // ... more handlers
  }
}
```

> 💭 **Think about it:** Why is this event system more type-safe than
> a simple `{ type: string; payload: any }`?
>
> **Answer:** With `any`, any payload could match any event type.
> With the Discriminated Union, TypeScript **enforces** that `USER_LOGIN`
> always has `userId` and `timestamp`. Typos are caught immediately,
> and the IDE provides autocomplete for the payload.

---

## Pattern 5: Command Pattern with Intersection

Combine a **base interface** with event-specific data:

```typescript annotated
// ─── Base for all commands ────────────────────────
interface CommandBase {
  id: string;
  timestamp: Date;
  userId: string;
}

// ─── Specific commands via Intersection ───────────
type CreateUserCommand = CommandBase & {
  type: "CREATE_USER";
  data: { name: string; email: string };
};

type UpdateUserCommand = CommandBase & {
  type: "UPDATE_USER";
  data: { userId: string; changes: Partial<{ name: string; email: string }> };
};

type DeleteUserCommand = CommandBase & {
  type: "DELETE_USER";
  data: { userId: string; reason: string };
};

// ─── Union of all commands ────────────────────────
type UserCommand = CreateUserCommand | UpdateUserCommand | DeleteUserCommand;

function executeCommand(command: UserCommand): void {
  // Every command has: id, timestamp, userId (from CommandBase)
  console.log(`[${command.timestamp.toISOString()}] User ${command.userId}:`);

  switch (command.type) {
    case "CREATE_USER":
      console.log(`Creating: ${command.data.name}`);
      break;
    case "UPDATE_USER":
      console.log(`Updating: ${command.data.userId}`);
      break;
    case "DELETE_USER":
      console.log(`Deleting: ${command.data.userId} — Reason: ${command.data.reason}`);
      break;
  }
}
```

Here you see Union AND Intersection working together:
- **Intersection** (`&`): Every command inherits from `CommandBase`
- **Union** (`|`): All commands together form `UserCommand`
- **Discriminated Union**: `type` is the discriminator

---

## Summary: The Five Practical Patterns

| Pattern | Technique | Use case |
|---|---|---|
| State Machine | Discriminated Union | State-based logic (orders, forms, auth) |
| Result Type | Discriminated Union | Error handling without exceptions |
| API Response | Discriminated Union + Generic | HTTP response handling |
| Event System | Discriminated Union + Extract | Type-safe events/actions |
| Command Pattern | Intersection + Discriminated Union | CQRS, message passing |

---

## What you've learned

- **State machines** with Discriminated Unions make invalid states unrepresentable
- The **Result pattern** replaces exceptions with type-safe return values
- **API response types** combine Discriminated Unions with generics
- **Event systems** use `Extract` for automatic payload inference
- **Union + Intersection** together produce powerful patterns (Command Pattern)

**Core concept to remember:** The combination of Union (variants) and Intersection (extension) is one of the most powerful tools in TypeScript. Most professional TypeScript codebases use these patterns extensively.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> type Result<T, E = string> =
>   | { ok: true;  value: T }
>   | { ok: false; error: E };
>
> function ok<T>(value: T): Result<T, never> {
>   return { ok: true, value };
> }
> function err<E>(error: E): Result<never, E> {
>   return { ok: false, error };
> }
>
> function divide(a: number, b: number): Result<number, string> {
>   // Implement here: error when b === 0
> }
>
> const r1 = divide(10, 3);
> if (r1.ok) {
>   console.log(r1.value.toFixed(2));  // What is the type of r1.value?
> } else {
>   console.log(r1.error);             // What is the type of r1.error?
> }
> ```
> Implement `divide` so that it returns `err("Division by zero")`
> when `b === 0`. Notice: TypeScript knows exactly which properties
> are available inside the `if (r1.ok)` branch!

---

## The 10 most important insights from this lesson

<details>
<summary>Expand summary (read AFTER completing all 6 sections)</summary>

1. **Union Types (`|`)** = "Either A or B" — the set of values grows larger
2. **Intersection Types (`&`)** = "Both A and B" — the set of values grows smaller
3. **Narrowing** constrains Union Types: typeof, instanceof, in, truthiness, assignment
4. **TS 5.5 Inferred Type Predicates**: `.filter(x => x !== null)` automatically infers the correct type
5. **Discriminated Unions** with a tag property + exhaustive check = compiler-guaranteed completeness
6. **assertNever** provides both compile-time and runtime protection
7. **Conflicts** with `&` produce `never` (silently), with `extends` produce compile errors
8. **Literal Unions** are usually better than enums (no runtime code, composable)
9. **Distributive law**: `(A | B) & C = (A & C) | (B & C)`
10. **Union + Intersection together** enable patterns like state machines, Result types, and event systems

</details>

---

> **End of Lesson 07** — You've mastered Union and Intersection Types!
> Now work through the examples, exercises, and quiz.
>
> **Next lesson:** 08 - Type Aliases and Mapped Types