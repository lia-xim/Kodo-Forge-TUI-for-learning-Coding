# Cheatsheet: Enums & Literal Types

## Literal Types

```typescript
const x = "hello";   // Type: "hello" (Literal)
let y = "hello";     // Type: string  (Widening!)

// Force literal type with let:
let z = "hello" as const;        // Type: "hello"
let w: "hello" | "bye" = "hello"; // Explicit annotation
```

---

## as const — Triple Effect

```typescript
const arr = ["GET", "POST"] as const;
// (1) readonly  (2) Literal Types  (3) Tuple
// Type: readonly ["GET", "POST"]

const obj = { method: "GET" } as const;
// obj.method has type "GET" (not string)
```

---

## Deriving a Union from as const

```typescript
// Array:
const METHODS = ["GET", "POST", "PUT"] as const;
type Method = typeof METHODS[number]; // "GET" | "POST" | "PUT"

// Object:
const Status = { Active: "ACTIVE", Inactive: "INACTIVE" } as const;
type Status = typeof Status[keyof typeof Status]; // "ACTIVE" | "INACTIVE"
```

---

## Enums

```typescript
// Numeric enum (auto-increment)
enum Direction { Up, Down, Left, Right } // 0, 1, 2, 3
Direction[0]; // "Up" (Reverse Mapping!)

// String enum (explicit values)
enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }
// NO reverse mapping, NOMINALLY typed

// const enum (inlined, NOT compatible with isolatedModules!)
const enum Color { Red = "RED" }
```

---

## Comparison: Enum vs Union vs as const

| Feature | Enum | Union Literal | as const Object |
|---------|------|---------------|-----------------|
| Runtime code | Yes | No | Yes (object) |
| Tree-shakeable | No | Yes | Partially |
| Iteration | Yes | No | Yes |
| Reverse mapping | Numeric only | No | Manual |
| isolatedModules | Yes (not const) | Yes | Yes |
| Nominal | String enum | No | No |

---

## Template Literal Types

```typescript
type Size = "sm" | "md" | "lg";
type Color = "red" | "blue";

type Token = `${Size}-${Color}`;
// 6 combinations (3 x 2): "sm-red" | "sm-blue" | ...

// String manipulation:
Capitalize<"hello">  // "Hello"
Uppercase<"hello">   // "HELLO"
Lowercase<"HELLO">   // "hello"
Uncapitalize<"Hello"> // "hello"
```

---

## Branded Types

```typescript
type EUR = number & { __brand: "EUR" };
type USD = number & { __brand: "USD" };

function eur(amount: number): EUR { return amount as EUR; }

const a = eur(9.99);
const b = eur(1.90);
// eur(9.99) + eur(1.90) → Requires cast to number first!
```

---

## Recommendations

| Situation | Recommendation |
|-----------|----------------|
| Fixed values without runtime need | **Union Literal** |
| Runtime access + literal types | **as const Object** |
| Nominal typing | **String Enum** |
| Bitwise flags | **Numeric Enum** |
| Semantic distinction | **Branded Types** |
| Generated string patterns | **Template Literal Types** |