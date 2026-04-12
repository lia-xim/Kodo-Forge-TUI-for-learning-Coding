# Cheatsheet: Phase 1 — Complete Reference

## L01: Setup

```typescript
// tsconfig.json — ALWAYS strict: true
{ "compilerOptions": { "strict": true, "target": "ES2022", "module": "NodeNext" } }
```

---

## L02: Primitive Types

| Type | Description |
|-----|-------------|
| `string`, `number`, `boolean` | Primitive types |
| `null`, `undefined` | Absence of values |
| `any` | Disables compiler (AVOID!) |
| `unknown` | Type-safe — enforces check before use |
| `never` | Empty type — no value possible |
| `void` | No meaningful return value |

**Type Erasure:** All types disappear at runtime!

---

## L03: Annotations & Inference

```typescript
const x = "hello";        // Type: "hello" (Literal — const)
let y = "hello";          // Type: string  (Widening — let)
const obj = { a: 1 };     // obj.a: number (Property Widening)
const obj2 = { a: 1 } as const;  // obj2.a: 1 (keep Literal)
```

**When to annotate?** Parameters: YES. Exported returns: YES. Local variables: NO.

---

## L04: Arrays & Tuples

```typescript
const arr: string[] = ["a", "b"];         // Array
const tuple: [string, number] = ["a", 1]; // Tuple (fixed length + types)
const ro: readonly string[] = ["a"];      // Readonly Array
```

---

## L05: Objects & Interfaces

```typescript
interface User { name: string; age?: number; readonly id: string; }
// Structural Typing: shape decides, not name
// Excess Property Check: Only with fresh literals
```

---

## L06: Functions

```typescript
// Overloads (specific first!)
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number { return x; }

// Type Guard
function isString(v: unknown): v is string { return typeof v === "string"; }

// Assertion Function
function assert(v: unknown): asserts v is string { if (typeof v !== "string") throw Error(); }

// void: Callback type tolerant, declaration strict
```

---

## L07: Union & Intersection

```typescript
type A = string | number;           // Union: either or
type B = { x: string } & { y: number }; // Intersection: all at once

// Discriminated Union + Exhaustive Check
type Shape = { type: "circle"; r: number } | { type: "rect"; w: number; h: number };
switch (shape.type) {
  case "circle": /* shape.r */ break;
  case "rect": /* shape.w, shape.h */ break;
  default: const _: never = shape; // Safety net!
}
```

---

## L08: Type Aliases vs Interfaces

| | `type` | `interface` |
|--|--------|-------------|
| Union/Mapped/Conditional | Yes | No |
| Declaration Merging | No | Yes |
| extends Performance | — | Faster |

**Rule:** Union → type. Object shape → either is fine. Consistency > perfect choice.

---

## L09: Enums & Literal Types

```typescript
// as const Object (modern enum alternative)
const Status = { Active: "ACTIVE", Inactive: "INACTIVE" } as const;
type Status = typeof Status[keyof typeof Status]; // "ACTIVE" | "INACTIVE"

// Template Literal Types
type Event = `on${Capitalize<"click" | "scroll">}`; // "onClick" | "onScroll"

// Branded Types
type EUR = number & { __brand: "EUR" };
function eur(n: number): EUR { return n as EUR; }
```

---

## Most Common Mistakes

1. `typeof null === "object"` — JavaScript bug since 1995
2. `readonly` is shallow — nested objects are not protected
3. Excess Property Check only with fresh literals
4. `any` instead of `unknown` — disables the compiler
5. Overloads in wrong order — specific first!
6. Intersection conflicts produce silent `never`
7. Numeric enums accept any number (soundness hole)
8. `const enum` not compatible with isolatedModules