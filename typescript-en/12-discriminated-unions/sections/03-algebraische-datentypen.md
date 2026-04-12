# Section 3: Algebraic Data Types

> Estimated reading time: **12 minutes**
>
> Previous section: [02 - Pattern Matching](./02-pattern-matching.md)
> Next section: [04 - Option and Result Pattern](./04-option-und-result-pattern.md)

---

## What you'll learn here

- What **Algebraic Data Types (ADTs)** are and why they matter
- How TypeScript adopts ADTs from Haskell and Rust
- **Sum Types** (OR) vs. **Product Types** (AND)
- The historical roots in type theory
- Why TypeScript needs no new syntax for this

---

## Background: Where does this come from?

Discriminated Unions are not a TypeScript invention. They come from
**functional programming** and have been a cornerstone of type theory
since the 1970s.

### The lineage

```
ML (1973)          →  Haskell (1990)     →  Rust (2010)      →  TypeScript (2016)
"datatype"             "data"                "enum"               Discriminated Unions
```

**ML** (Meta Language) introduced algebraic data types in 1973.
**Haskell** perfected them with pattern matching.
**Rust** made them mainstream with `enum` and `match`.
**TypeScript** brought them into the JavaScript world — not as a
new language feature, but as a clever use of existing features
(Union Types + Literal Types + Control Flow Analysis).

> **What makes TypeScript special:** No new syntax needed! ADTs
> emerge from combining features you already know.

---

## Sum Types and Product Types

In type theory there are two fundamental ways to compose types:

### Product Types (AND)

A Product Type combines values with AND — **all** fields are
present simultaneously:

```typescript annotated
// Product Type: x AND y AND z — all at once
type Point3D = { x: number; y: number; z: number };
// Possible values = number × number × number (multiplication)
```

The name "Product" comes from the fact that the number of possible values
is the **product** of the individual types.

#### Why "product"? The cardinality math

Let's look at the possible values of a Product Type mathematically:

```typescript
type Bool = true | false;                    // 2 possible values
type TriState = "low" | "medium" | "high";   // 3 possible values
```

Combined into a Product Type:

```typescript
type Config = { flag: Bool; level: TriState };
// Possible values: 2 × 3 = 6
// (true,low), (true,medium), (true,high), (false,low), (false,medium), (false,high)
```

The cardinality is the **product** of the individual types: `|A × B| = |A| × |B|`.

> **Analogy 1 — Meal combo:** A menu has a starter AND a main course AND a dessert.
> With 3 starters, 5 mains and 4 desserts there are
> `3 × 5 × 4 = 60` combos. Combining multiplies the choices.

#### Product types in everyday code

Every interface in TypeScript is a Product Type:

```typescript
interface User { id: number; name: string; isActive: boolean; }
// Total: |number| × |string| × 2
```

> **Think pause (30 sec.):** How many values does `{a: boolean; b: boolean}` have?
>
> **Answer:** 2 × 2 = 4: `{a:T,b:T}`, `{a:T,b:F}`, `{a:F,b:T}`, `{a:F,b:F}`

---

### Sum Types (OR)

A Sum Type combines variants with OR — **exactly one** is active at a time:

```typescript annotated
// Sum Type: Circle OR Rectangle OR Triangle — exactly one
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };
// Possible values = Circle + Rectangle + Triangle (addition)
```

The name "Sum" comes from the fact that the number of possible values
is the **sum** of the variants.

#### Why "sum"? The cardinality math

With a Sum Type you choose **one** variant — never multiple:

```typescript
type EmailStatus = "sent" | "draft" | "failed";
// Cardinality: 1 + 1 + 1 = 3 — never two at the same time
```

With additional data:

```typescript annotated
type LoginState =
  | { status: "loggedOut" }                  // 1 possibility
  | { status: "loggedIn"; user: User }       // |User| possibilities
  | { status: "error"; message: string };    // |string| possibilities
// Total: 1 + |User| + |string| = addition!
```

The cardinality is the **sum**: `|A + B| = |A| + |B|`.

> **Analogy 2 — Restaurant menu:** You may choose **exactly one** dish —
> either soup OR salad OR pasta. With 3 soups,
> 4 salads, 5 pastas: `3 + 4 + 5 = 12` choices.

> **Analogy 3 — Traffic light:** A traffic light shows **exactly one** colour:
> Red OR Yellow OR Green. The state is a Sum Type with three variants.

#### Why doesn't TypeScript have native Sum Types?

TypeScript has no `enum` pattern matching like Rust. Instead it
**simulates** Sum Types through three existing features:

```
Union Types (|)    +    Literal Types    +    Control Flow Analysis
  "One of these"         "Which one?"          "Compiler checks all"
```

No new keyword needed — but exhaustiveness checks require the `never` trick.

---

### Experiment: Calculate cardinality yourself

```typescript
// 1. Product: {a: bool; b: bool; c: bool} → 2 × 2 × 2 = 8
// 2. Sum: {kind:"a"} | {kind:"b"} | {kind:"c"} → 1 + 1 + 1 = 3
// 3. Combined: {type:"simple"} | {type:"flag"; v: boolean} → 1 + 2 = 3
```

> **Try it:** Create `{kind: "x"; v: 1|2|3}`. Cardinality? `1 × 3 = 3`.

---

### Self-explanation: Product vs. Sum

**Try to explain aloud:** Why is an interface called a "Product Type"
and a Discriminated Union a "Sum Type"?

**Key points:**
- Product = multiplication: `|{a:A; b:B}| = |A| × |B|`
- Sum = addition: `|A | B| = |A| + |B|`
- Both together = **Algebraic** Data Types (algebra = + and ×)

> **Analogy 4 — Lego:** Product Types = finished model, **all** pieces
> present at once. Sum Types = selection box, you play with **one** set.

---

## Historical excursion: From ML to TypeScript

### ML (1973) — The birth

Robin Milner developed ML in Edinburgh. The `datatype` keyword was
the first algebraic data type in a programming language:

```ml
(* ML, 1973 — datatype + Pattern Matching *)
datatype shape = Circle of real | Rectangle of real * real;
fun area (Circle r) = Math.pi * r * r
  | area (Rectangle (w, h)) = w * h;
```

ML proved: data variants + exhaustive checking = type-safe processing.

### Rust (2010) — ADTs for systems programming

Rust's `enum` is far more powerful than C enums:

```rust
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
}
fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
    }
}
```

Rust requires an exhaustive `match` — otherwise it won't compile.

### TypeScript (2016) — ADTs without new syntax

```typescript annotated
type Shape =                                    // Discriminated Union
  | { kind: "circle"; radius: number }          // Variant 1
  | { kind: "rectangle"; width: number; height: number }; // Variant 2

function area(shape: Shape): number {
  switch (shape.kind) {                         // Discriminant
    case "circle": return Math.PI * shape.radius ** 2;   // Narrowing active
    case "rectangle": return shape.width * shape.height; // Narrowing active
  }
}
```

**All four languages, the same concept.** Different syntax, same idea.

---

## ADTs in frameworks you know

### Angular: NgRx Actions

NgRx Actions are Discriminated Unions:

```typescript
type Action =
  | { type: "[User] Load" }
  | { type: "[User] Load Success"; user: User }
  | { type: "[User] Load Failure"; error: string };
```

The `type` string is the discriminant — separated in the reducer via `switch`.

### React: useReducer Actions

```typescript
type CounterAction =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "SET"; value: number };
```

> **Insight:** You've already been using ADTs — you just didn't know it.

---

## What you've learned

- **Algebraic Data Types (ADTs)** originate from ML (1973) and run through Haskell, Rust and TypeScript
- **Product Types** (interfaces): AND-combination, cardinality = product of individual types
- **Sum Types** (Discriminated Unions): OR-combination, cardinality = sum of variants
- TypeScript simulates Sum Types through Union Types + Literal Types + Control Flow Analysis
- **ADTs are everywhere:** NgRx Actions, React reducers, Rust enums, Haskell data declarations

**Core concept:** Sum Types make the impossible unrepresentable — TypeScript expresses this ancient concept from type theory without any new syntax.

---

## Self-explanation before moving on

**Take 2 minutes.** Answer from memory:

> *"What is the difference between a Sum Type and a Product Type?
> Explain it using cardinality with one TypeScript example each.
> Why are they called 'algebraic'?"*

If that's clear — move on to Section 4.

---

> **Pause point:** You now understand the theoretical foundations of ADTs.
> In the next section we apply this to two of the most practical
> patterns: Option (Some/None) and Result (Ok/Err).
>
> Continue: [Section 04 - Option and Result Pattern](./04-option-und-result-pattern.md)