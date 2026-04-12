# Cheatsheet: Capstone Project — Everything Together

Quick reference for Lesson 40 and the entire course.

---

## Architecture Principles

```
1. Defensive shell, offensive core
   → Validate at the boundaries, trust the core

2. Make Impossible States Impossible
   → Discriminated Unions instead of Boolean flags

3. Parse, Don't Validate
   → Smart Constructors return the stronger type
```

---

## Domain Model

```typescript
// Branded IDs:
declare const UserIdBrand: unique symbol;
type UserId = string & { readonly [UserIdBrand]: typeof UserIdBrand };
function createUserId(raw: string): UserId { /* validate */ return raw as UserId; }

// Money (Cents):
declare const CentsBrand: unique symbol;
type Cents = number & { readonly [CentsBrand]: typeof CentsBrand };
function cents(n: number): Cents { return n as Cents; }
function addMoney(a: Cents, b: Cents): Cents { return ((a as number) + (b as number)) as Cents; }

// Order Status (Discriminated Union + Transition Map):
type Order =
  | { status: "draft"; id: OrderId; items: CartItem[] }
  | { status: "pending"; id: OrderId; items: CartItem[]; total: Cents }
  | { status: "paid"; id: OrderId; items: CartItem[]; total: Cents; paymentId: string }
  | { status: "shipped"; id: OrderId; items: CartItem[]; total: Cents; paymentId: string; trackingId: string }
  | { status: "cancelled"; id: OrderId; reason: string };

type OrderTransitions = {
  draft: "pending" | "cancelled";
  pending: "paid" | "cancelled";
  paid: "shipped";
  shipped: never;
  cancelled: never;
};
```

---

## API Layer

```typescript
// Route definition as single source of truth:
interface ApiRoute<Method, Path, Req, Res, Err> {
  method: Method; path: Path;
  _request: Req; _response: Res; _error: Err;
}

// Extract route parameters (type-level programming):
type ExtractRouteParams<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : P extends `${string}:${infer Param}`
      ? { [K in Param]: string } : {};

// Validation at the system boundary:
function isCreateOrderInput(data: unknown): data is CreateOrderInput { /* ... */ }
```

---

## Business Logic

```typescript
// Generic repository:
interface Repository<T extends Entity<unknown>> {
  findById(id: T["id"]): Promise<T | undefined>;
  findAll(): Promise<readonly T[]>;
  create(entity: Omit<T, "id">): Promise<T>;
  update(id: T["id"], patch: Partial<Omit<T, "id">>): Promise<T | undefined>;
  delete(id: T["id"]): Promise<boolean>;
}

// Event system:
type EventHandler<E extends DomainEvent["type"]> =
  (event: Extract<DomainEvent, { type: E }>) => Promise<void>;

// Result pattern:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

---

## Concept Reference: 40 Lessons

| # | Lesson | Core Takeaway |
|---|--------|--------------|
| 02 | Primitives | Type Erasure — types disappear at runtime |
| 07 | Unions | Combining types with \| and & |
| 11 | Narrowing | typeof, instanceof, in — narrowing types |
| 12 | Discriminated Unions | Eliminating impossible states |
| 13 | Generics | Reusable type-safe APIs |
| 15 | Utility Types | Partial, Pick, Omit, Extract, Exclude |
| 16 | Mapped Types | Custom type transformations |
| 17 | Conditional Types | Computing types dynamically |
| 22 | Advanced Generics | Variance, in/out modifiers |
| 24 | Branded Types | Preventing mix-ups, Smart Constructors |
| 25 | Error Handling | Result<T,E>, errors as types |
| 26 | Advanced Patterns | Builder, State Machine, Phantom Types |
| 37 | Type-Level Prog. | Router types, Query Builder |
| 39 | Best Practices | any-audit, defensive shell |

---

## The Golden Rule

> **Write the simplest type that gets the job done.**
> Complex only when it prevents real bugs.
> The compiler is your partner, not your enemy.