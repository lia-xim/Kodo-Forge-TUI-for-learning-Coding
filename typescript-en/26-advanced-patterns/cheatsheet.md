# Cheatsheet: Advanced Patterns

Quick reference for Lesson 26.

---

## Builder Pattern (type-safe)

```typescript
// Generic accumulates set fields:
class TypedBuilder<Set extends string = never> {
  host(h: string): TypedBuilder<Set | "host"> { /* ... */ return this as any; }
  port(p: number): TypedBuilder<Set | "port"> { /* ... */ return this as any; }

  // build() only when all required fields are set:
  build(this: TypedBuilder<"host" | "port">): Config {
    return this.config as Config;
  }
}

new TypedBuilder().host("x").port(80).build(); // OK
new TypedBuilder().host("x").build();          // COMPILE-ERROR
```

---

## State Machine Pattern

```typescript
// Discriminated Union for states:
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// Transition Map for allowed transitions:
type Transitions = {
  idle:    "loading";
  loading: "success" | "error";
  success: "idle";
  error:   "loading" | "idle";
};

function transition<C extends keyof Transitions>(
  current: C, next: Transitions[C]
): void {}
```

---

## Phantom Types

```typescript
// Phantom type wrapper:
type Phantom<Base, Tag> = Base & { readonly __phantom: Tag };

// Semantically distinct types:
type Email   = Phantom<string, "Email">;
type Subject = Phantom<string, "Subject">;

function sendEmail(to: Email, subject: Subject): void {}
// sendEmail(subject, email) → COMPILE-ERROR
```

---

## Fluent API (type-safe with Step Interfaces)

```typescript
interface SelectStep { select(cols: string): FromStep; }
interface FromStep   { from(table: string): WhereOrBuildStep; }
interface WhereOrBuildStep {
  where(cond: string): BuildStep;
  build(): string;
}
interface BuildStep  { build(): string; }

// createQuery().select("*").from("users").build(); // OK
// createQuery().from("users");  // COMPILE-ERROR: from() not on SelectStep
```

---

## Newtype Pattern

```typescript
// With unique symbol for unique brands:
declare const UserIdBrand: unique symbol;
type UserId = string & { readonly [UserIdBrand]: typeof UserIdBrand };

// Smart Constructor (validates + casts):
function UserId(raw: string): UserId {
  if (!raw.startsWith("user-")) throw new Error("Invalid");
  return raw as UserId;
}

// Custom operations:
declare const CentsBrand: unique symbol;
type Cents = number & { readonly [CentsBrand]: typeof CentsBrand };

function addCents(a: Cents, b: Cents): Cents {
  return ((a as number) + (b as number)) as Cents;
}
```

---

## Opaque Types

```typescript
// user-id.ts — Only this module can create UserId
declare const brand: unique symbol;
export type UserId = string & { readonly [brand]: "UserId" };
export function createUserId(raw: string): UserId { /* validate */ return raw as UserId; }
// Other modules: can use UserId but not create it (convention)
```

---

## Decision Tree

```
Prevent confusion?
├── Simple IDs → Branded Type
└── Values with operations → Newtype

Model states?
├── With data per state → Discriminated Union
└── Invisible (Draft/Published) → Phantom Type

Incremental construction?
├── Enforce required fields → Builder
└── Enforce order → Fluent API with Steps

Pragmatic rule:
→ Branded Types + Discriminated Unions cover 90% of cases
```

---

## Which Pattern for Which Situation?

| Situation | Recommendation |
|---|---|
| Entity IDs (UserId, OrderId) | Branded Type |
| Currency amounts, units | Newtype |
| Loading/Error/Success state | Discriminated Union |
| Article lifecycle (Draft→Published) | Phantom Type |
| SQL/Query builder | Fluent API |
| Config with required + optional fields | Builder |
| 3 fields, all required | Simple Interface! |

---

## Common Mistakes

| Mistake | Problem | Solution |
|---|---|---|
| Boolean flags for state | 2^n impossible states | Discriminated Union |
| `as BrandedType` everywhere | Bypasses validation | Smart Constructor |
| Builder for 3 fields | Over-engineering | Simple Interface |
| Combining all patterns | Unreadable code | Choose pragmatically |
| `return this` instead of Steps | No order enforcement | Step Interfaces |