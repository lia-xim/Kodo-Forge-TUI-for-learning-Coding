# Section 2: Pattern Matching with Discriminated Unions

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Tagged Unions](./01-tagged-unions.md)
> Next section: [03 - Algebraic Data Types](./03-algebraische-datentypen.md)

---

## What you'll learn here

- Why **switch/case** is the natural pattern for Discriminated Unions
- How the **Exhaustive Check** works and why it saves you
- if/else chains as an alternative
- How `never` exposes unhandled cases

---

## switch/case: The Natural Partner

Discriminated Unions and switch/case are made for each other.
The discriminator becomes the switch value, and each case branch narrows
the type automatically:

```typescript annotated
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      // shape: { kind: "circle"; radius: number }
      return `Circle with radius ${shape.radius}`;

    case "rectangle":
      // shape: { kind: "rectangle"; width: number; height: number }
      return `Rectangle ${shape.width}x${shape.height}`;

    case "triangle":
      // shape: { kind: "triangle"; base: number; height: number }
      return `Triangle with base ${shape.base}`;
  }
}
```

Each `case` branch knows the exact type. That's no coincidence —
TypeScript uses control flow (Control Flow Analysis from L11)
to narrow the type.

---

## The Exhaustive Check: Your Safety Net

What happens when you add a new Shape type but forget to update the
switch? **TypeScript can warn you.**

### Method 1: Return type enforces completeness

```typescript annotated
// With an explicit return type:
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    // "triangle" is missing!
    // Error: Function lacks ending return statement
    // and return type does not include 'undefined'.
  }
}
```

When you specify the return type (`number`), TypeScript notices
that not all paths return a value.

### Method 2: The never trick (Exhaustive Check)

The more powerful method: use `never` to catch unhandled cases
at **compile time**:

```typescript annotated
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // When all cases are handled, shape has type never.
      // If a case is missing, shape is NOT never -> Compile error!
      return assertNever(shape);
  }
}
```

> **Why does this work?** After all known `case` branches have been
> exhausted, only what matched no case remains in the `default` branch.
> When all cases are covered, **nothing remains** — the type is `never`.
> If a case is missing, a concrete type remains, and `assertNever(shape)` won't compile.

---

## In Practice: Adding a New Type

Imagine you add `Pentagon` to the Shape union:

```typescript annotated
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number }
  | { kind: "pentagon"; sideLength: number };  // NEW!

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);
      //                 ^^^^^
      // Error: Argument of type '{ kind: "pentagon"; sideLength: number }'
      //        is not assignable to parameter of type 'never'.
  }
}
```

**The compiler shows you exactly which case is missing.** This is extremely
valuable in large codebases with many switch statements.

> **Explain to yourself:** What is the difference between the
> "return type" approach and the "never" approach? When is each one better?
> **Key points:** Return type only warns in functions with a return | never warns everywhere | never shows the missing type in the error message

---

## if/else as an Alternative

Not every situation needs a switch. With few variants or
complex conditions, if/else chains are often more readable:

```typescript annotated
type Result =
  | { success: true; data: string[] }
  | { success: false; error: string };

function handleResult(result: Result) {
  if (result.success) {
    // result: { success: true; data: string[] }
    console.log(`${result.data.length} entries loaded`);
  } else {
    // result: { success: false; error: string }
    console.log(`Error: ${result.error}`);
  }
}
```

TypeScript also narrows with `if/else` based on the discriminator.
For `boolean` discriminators, if/else is even more natural than switch.

---

## Narrowing Through Assignment

A subtle but useful feature: TypeScript also narrows on
**variable assignment**:

```typescript annotated
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; offset: number };

function logEvent(event: Event) {
  const { type } = event;

  if (type === "click") {
    // event is still Event — NOT narrowed!
    // Why? Because TypeScript loses the connection between
    // the destructured variable and the original.
  }

  // Instead: check directly on event.type
  if (event.type === "click") {
    // event: { type: "click"; x: number; y: number }
    console.log(`Click at ${event.x}, ${event.y}`);
  }
}
```

> **Warning:** Destructuring breaks narrowing! Always check
> directly on `obj.discriminator`, not on a destructured variable.
> (Exception: TypeScript 5.x has partial improvements here.)

---

## Return-Based Narrowing

An elegant pattern: instead of writing nested if/else,
return early:

```typescript annotated
type ApiResult =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: unknown };

function processResult(result: ApiResult): string {
  if (result.status === "loading") {
    return "Loading...";
  }

  if (result.status === "error") {
    return `Error: ${result.message}`;
  }

  // Here TypeScript knows: result is { status: "success"; data: unknown }
  // Without an explicit check — by eliminating the other cases!
  return `Data: ${JSON.stringify(result.data)}`;
}
```

This is **Narrowing by Elimination** — TypeScript excludes the
already-handled variants.

---

## satisfies for Better Type Checking

With the `satisfies` operator (TypeScript 5.0+) you can ensure
that an object literal conforms to a type without losing the inferred type:

```typescript annotated
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

// With satisfies, TypeScript checks the value AND keeps the literal type:
const myShape = {
  kind: "circle" as const,
  radius: 5,
} satisfies Shape;
// myShape.kind has type "circle" — not string!
```

> **Experiment:** Try the Exhaustive Check directly in the TypeScript Playground (typescriptlang.org/play):
>
> ```typescript
> function assertNever(value: never): never {
>   throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
> }
>
> type Shape =
>   | { kind: "circle"; radius: number }
>   | { kind: "rectangle"; width: number; height: number };
>
> function area(shape: Shape): number {
>   switch (shape.kind) {
>     case "circle": return Math.PI * shape.radius ** 2;
>     case "rectangle": return shape.width * shape.height;
>     default: return assertNever(shape);
>   }
> }
>
> // Now add a new variant to the union:
> // | { kind: "triangle"; base: number; height: number }
> ```
>
> What happens in the `default` branch after you add `triangle`? What error message does TypeScript output? What changes if you write `return 0` in the default instead?

---

**In your Angular project:** NgRx reducers are classic switch/case functions over an Action union. The Exhaustive Check is especially valuable here — if a colleague adds a new action but forgets the reducer, the compiler catches it immediately:

```typescript
import { createReducer, on } from '@ngrx/store';
import { loadUsers, loadUsersSuccess, loadUsersFailure } from './user.actions';

// With manual exhaustive pattern (without NgRx macros):
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case '[User] Load':
      return { ...state, loading: true, error: null };
    case '[User] Load Success':
      return { ...state, loading: false, users: action.users };
    case '[User] Load Failure':
      return { ...state, loading: false, error: action.error };
    default:
      // assertNever(action) here => Compile error if a new action is missing!
      return state;
  }
}
```

**In React:** The `useReducer` hook is the same pattern. Your reducer receives an Action union and returns new state — switch/case on the discriminator, assertNever in the default.

---

## What you've learned

- **switch/case** is the natural partner for Discriminated Unions — each case branch narrows the type automatically
- The **Exhaustive Check with `never`** catches missing cases at compile time and shows exactly which variant is missing
- **if/else with early return** ("Narrowing by Elimination") is often more readable than switch for a small number of variants
- **Destructuring breaks narrowing** — always check directly on `obj.tag`, not on a destructured variable
- The `satisfies` operator keeps the inferred literal type while simultaneously checking type conformance

**Core concept:** The Exhaustive Check with `assertNever` is your safety net in any large codebase — it turns forgetting a union variant from a runtime error into a compile error.

---

> **Pause point:** You now know how to handle Discriminated Unions safely
> and completely. In the next section we'll look at where this concept
> comes from — and why Haskell and Rust have been using it for decades.
>
> Next: [Section 03 - Algebraic Data Types](./03-algebraische-datentypen.md)