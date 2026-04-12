# Cheatsheet: Discriminated Unions

## Basic Structure

```typescript
// 1. Tag property with literal types
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };

// 2. Union type
type Shape = Circle | Rectangle;

// 3. Narrowing
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
  }
}
```

---

## Exhaustive Check with assertNever

```typescript
function assertNever(value: never): never {
  throw new Error(`Unhandled: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    default: return assertNever(shape);
    // Compile error if a case is missing!
  }
}
```

---

## Valid Discriminator Types

```typescript
// String literal (most common):
type A = { type: "success"; data: string };

// Number literal:
type B = { code: 200; body: string };

// Boolean literal:
type C = { ok: true; value: number };

// NOT valid:
// type D = { type: string };     // Too broad!
// type E = { type: number };     // Too broad!
```

---

## Option\<T\> and Result\<T, E\>

```typescript
// Option: value or nothing
type Option<T> =
  | { tag: "some"; value: T }
  | { tag: "none" };

// Result: success or typed error
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

## AsyncState\<T\> (Loading/Error/Success)

```typescript
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// Render with switch:
function render<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case "idle": return "Ready";
    case "loading": return "Loading...";
    case "error": return `Error: ${state.error}`;
    case "success": return `OK: ${JSON.stringify(state.data)}`;
  }
}
```

---

## Action Types (Redux/NgRx)

```typescript
type Action =
  | { type: "INCREMENT" }
  | { type: "ADD"; payload: { amount: number } }
  | { type: "SET"; payload: { value: number } }
  | { type: "RESET" };

function reducer(count: number, action: Action): number {
  switch (action.type) {
    case "INCREMENT": return count + 1;
    case "ADD": return count + action.payload.amount;
    case "SET": return action.payload.value;
    case "RESET": return 0;
  }
}
```

---

## Extract and Exclude

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "tri"; base: number; height: number };

// Extract a single variant:
type OnlyCircle = Extract<Shape, { kind: "circle" }>;
// { kind: "circle"; radius: number }

// Exclude a single variant:
type NoCircle = Exclude<Shape, { kind: "circle" }>;
// rect | tri

// Extract all tag values:
type ShapeKind = Shape["kind"];
// "circle" | "rect" | "tri"
```

---

## Narrowing Methods

| Method | When to use |
|--------|-------------|
| **switch/case** | Multiple variants, exhaustive check possible |
| **if/else** | Few variants, boolean discriminators |
| **Early return** | Sequential checks, flat code |
| **Ternary** | Inline decisions, JSX |

---

## Common Mistakes

```typescript
// WRONG: Destructuring breaks narrowing
const { kind } = shape;
if (kind === "circle") { shape.radius } // Error!

// CORRECT: Check directly
if (shape.kind === "circle") { shape.radius } // OK!

// WRONG: Broad type as discriminator
type A = { type: string };  // No narrowing!

// CORRECT: Literal type as discriminator
type A = { type: "a" };     // Narrowing works!
```

---

## Recommendations

| Situation | Recommendation |
|-----------|---------------|
| Different object variants | **Discriminated Union** |
| Value or no value | **Option\<T\>** |
| Success or typed error | **Result\<T, E\>** |
| Async states | **AsyncState\<T\>** |
| Redux/NgRx actions | **Action Discriminated Union** |
| Extract a variant | **Extract\<T, U\>** |
| Exclude a variant | **Exclude\<T, U\>** |
| Cover all cases | **assertNever in default** |