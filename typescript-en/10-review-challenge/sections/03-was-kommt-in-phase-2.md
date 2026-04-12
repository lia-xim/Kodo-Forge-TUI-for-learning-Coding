# 03 -- What's Coming in Phase 2: Type System Core

> Estimated reading time: ~10 minutes

## The Jump from "Using TypeScript" to "Mastering TypeScript"

Phase 1 taught you the **vocabulary** of the TypeScript language. Phase 2 teaches you
the **grammar** -- how to combine that vocabulary into powerful, reusable code.

> **Analogy:** Phase 1 was like learning individual musical notes and chords. Phase 2 is
> like learning harmony and composition. You won't just be playing notes -- you'll be
> writing music.

---

## Preview: The Next 10 Lessons

### L11: Type Narrowing

You already know `typeof` and basic narrowing from L07. In Phase 2 you'll master ALL
narrowing techniques:

```typescript
// You already know:
function process(x: string | number) {
  if (typeof x === "string") { /* x is string */ }
}

// You will learn:
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "name" in obj;
}
// Custom Type Guards -- YOU define what makes up a type!
```

### L12: Discriminated Unions (Deep Dive)

You've already been introduced to Discriminated Unions. In Phase 2 you'll use them to
model **complex state machines** -- with guaranteed exhaustiveness:

```typescript
// State machine for an order process
type OrderState =
  | { status: "draft"; items: Item[] }
  | { status: "submitted"; items: Item[]; submittedAt: Date }
  | { status: "paid"; items: Item[]; paidAt: Date; transactionId: string }
  | { status: "shipped"; trackingNumber: string }
  | { status: "delivered"; deliveredAt: Date };
```

### L13-L14: Generics

The biggest new concept. Generics make types **reusable**:

```typescript
// Without Generics: one function per type
function firstString(arr: string[]): string | undefined { return arr[0]; }
function firstNumber(arr: number[]): number | undefined { return arr[0]; }

// With Generics: ONE function for ALL types
function first<T>(arr: T[]): T | undefined { return arr[0]; }

const s = first(["a", "b"]);  // string | undefined
const n = first([1, 2, 3]);   // number | undefined
```

**Why do you need Phase 1 for this?** Generics build directly on interfaces, unions, and
function types. Without that foundation you'd only be copying generics mechanically,
rather than understanding them.

### L15: Utility Types

TypeScript has built-in type transformations:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Omit<User, "password">;          // Without password
type UserUpdate = Partial<Omit<User, "id">>;       // Everything optional, without id
type UserKeys = keyof User;                        // "id" | "name" | "email" | "password"
type ReadonlyUser = Readonly<User>;                // Everything readonly
```

### L16: Mapped Types

You'll learn to build **your own** utility types:

```typescript
// How Readonly works internally:
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Or: make all properties optional and nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};
```

### L17: Conditional Types

Types that **make decisions**:

```typescript
// If T is an array, extract the element type
type Unwrap<T> = T extends Array<infer U> ? U : T;

type A = Unwrap<string[]>;  // string
type B = Unwrap<number>;    // number
```

### L18: Template Literal Types

String manipulation at the **type level**:

```typescript
type EventName = "click" | "focus" | "blur";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"
```

### L19: Modules & Declarations

How TypeScript organizes modules, how `.d.ts` files work, and how to provide
types for existing JavaScript libraries.

### L20: Review Challenge -- Phase 2

Just like this lesson -- but for everything from Phase 2.

---

## What Phase 1 Means for Phase 2

Every Phase 2 concept builds on Phase 1 knowledge:

```
Phase 1 Concept           →  Phase 2 Application
──────────────────────────────────────────────────
Interfaces (L05)          →  Generic Constraints
Union Types (L07)         →  Conditional Types
Literal Types (L09)       →  Template Literal Types
Type Aliases (L08)        →  Mapped Types
Function Overloads (L06)  →  Generic Overloads
as const (L09)            →  const Type Parameters
Structural Typing (L05)   →  Generic Variance
Narrowing (L07)           →  Custom Type Guards
```

**That's why this Review Challenge matters so much.** If you feel confident here, Phase 2
will be a natural next step. If not, it will be a struggle.

---

## Your Path Forward

1. **Now:** Complete the challenges in this lesson
2. **After that:** Check your self-assessment from Section 02
3. **If there are gaps:** Go back to the individual lessons
4. **When everything clicks:** Phase 2 begins with L11 -- Type Narrowing

> **Motivation:** After Phase 2 you'll be able to read and write TypeScript code that
> looks like black magic to most developers. But you'll know it's not magic -- it's a
> logical system built on the foundations you learned in Phase 1.