# Section 1: What is Narrowing?

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - typeof Guards](./02-typeof-guards.md)

---

## What you'll learn here

- What Type Narrowing is and why TypeScript needs it
- How **Control Flow Analysis** works — TypeScript "reads" your code
- The fundamental relationship between narrowing and union types
- Why narrowing is the most important skill in Phase 2

---

## The Problem: Union Types are useless — without narrowing

In Phase 1 you learned about union types: `string | number`, `User | null`,
`"success" | "error"`. But imagine you have a variable of type
`string | number` — what can you do with it?

```typescript
function process(value: string | number) {
  // value.toUpperCase();   // Error! number has no toUpperCase
  // value.toFixed(2);       // Error! string has no toFixed
  // value + 1;              // Error! Operator '+' on string | number is ambiguous
}
```

**Nothing.** You can call neither string methods nor number methods.
TypeScript has to prepare for the "worst case" — and the
worst case is that the value could be the other type.

> 💭 **Think about it:** Why doesn't TypeScript just let you call `toUpperCase()`?
> At runtime it could be a string after all?
>
> **Answer:** TypeScript guarantees type safety at compile time. If the
> value is a number at runtime, `toUpperCase()` would cause a crash.
> TypeScript prevents this crash by requiring you to first
> PROVE that it's a string.

---

## The Solution: Type Narrowing

Type Narrowing is the process by which TypeScript **narrows the type of a variable
within a specific code block**. You write a check,
and TypeScript understands the consequence:

```typescript annotated
function process(value: string | number) {
  // Here value is: string | number

  if (typeof value === "string") {
    // ^ TypeScript recognizes: value is NOW string
    console.log(value.toUpperCase());
    // ^ toUpperCase() is allowed because value is string here
  } else {
    // ^ TypeScript concludes: value must be number
    console.log(value.toFixed(2));
    // ^ toFixed() is allowed because value is number here
  }
}
```

This is no magic — TypeScript **analyzes the control flow** of your
code and draws logical conclusions. This is called **Control Flow
Analysis** (CFA).

> 📖 **Background: The Birth of Control Flow Analysis**
>
> TypeScript didn't always have CFA. Before TypeScript 2.0 (2016) you had to
> cast types manually. Anders Hejlsberg (TypeScript's creator) introduced CFA
> in TypeScript 2.0 — inspired by research on "Flow-Sensitive
> Typing" from the 1990s. The idea: the compiler should be as smart
> as a human developer reading the same code.
>
> Facebook's Flow (a competitor to TypeScript) had a similar
> analysis, but TypeScript's implementation became the industry standard.
> Today Kotlin, Dart, and even Java (Pattern Matching since
> Java 16) have adopted similar mechanisms.

---

## How Control Flow Analysis Works

When compiling, TypeScript builds a **control flow graph** — a
map of all possible paths your code can take. At every point
TypeScript knows exactly which types a variable can have:

```
function demo(x: string | number | null) {
  // x: string | number | null
  |
  if (x === null) {
    // x: null
    return;
  }
  // x: string | number  <-- null was eliminated!
  |
  if (typeof x === "string") {
    // x: string
  } else {
    // x: number
  }
}
```

> 🧠 **Explain to yourself:** Why is `x` no longer `null` after the `if (x === null) { return; }`
> block? How can TypeScript know that?
>
> **Key points:** The return statement ends the function | If x were null,
> the function would already have ended | So x further along
> CANNOT be null | This is "Narrowing by Elimination"

### The Three Core Principles

1. **Narrowing is local**: The narrowed type only applies within the block
   where the check takes place — not after it.

2. **Narrowing is cumulative**: Multiple checks in sequence narrow the
   type further and further.

3. **Narrowing is eliminative**: Each check removes possibilities from
   the union type until a concrete type remains.

```typescript annotated
function demo(x: string | number | boolean | null) {
  // x: string | number | boolean | null

  if (x === null) return;
  // x: string | number | boolean  (null eliminated)

  if (typeof x === "boolean") return;
  // x: string | number  (boolean eliminated)

  if (typeof x === "string") {
    // x: string  (number eliminated)
    console.log(x.toUpperCase());
  } else {
    // x: number  (string eliminated)
    console.log(x.toFixed(2));
  }
}
```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> function demo(x: string | number | boolean | null) {
>   if (x === null) return;
>   // x: string | number | boolean (null eliminated)
>
>   if (typeof x === "boolean") return;
>   // x: string | number (boolean eliminated)
>
>   if (typeof x === "string") {
>     console.log(x.toUpperCase()); // x: string
>   } else {
>     console.log(x.toFixed(2)); // x: number
>   }
> }
> ```
> Comment out individual if-checks and hover over `x`. Each missing check makes the type wider.

---

## Narrowing Mechanisms: An Overview

TypeScript knows many ways to narrow. In the following sections
we'll go through each one individually:

| Mechanism | Example | Section |
|---|---|---|
| `typeof` Guards | `typeof x === "string"` | 02 |
| `instanceof` | `x instanceof Date` | 03 |
| `in` Operator | `"name" in obj` | 03 |
| Equality Checks | `x === null`, `x !== undefined` | 04 |
| Truthiness | `if (x)`, `if (!x)` | 04 |
| Type Predicates | `function isString(x): x is string` | 05 |
| Assertion Functions | `function assert(x): asserts x is string` | 05 |
| Exhaustive Checks | `const _: never = x` | 06 |

**Important:** Narrowing is not only for `if` statements. It also works
with `switch`, ternary operators (`? :`), `while` loops, and
logical operators (`&&`, `||`, `??`).

---

## Narrowing vs. Type Assertions (as)

There is an important difference between narrowing and type assertions:

```typescript
function dangerous(value: unknown) {
  // Type Assertion — YOU tell the compiler "trust me"
  const s = value as string;
  // If value is a number, this crashes at runtime!
  console.log(s.toUpperCase());
}

function safe(value: unknown) {
  // Type Narrowing — YOU prove it to the compiler
  if (typeof value === "string") {
    console.log(value.toUpperCase());
    // Here it is GUARANTEED to be a string
  }
}
```

**Narrowing is proof. Assertion is a promise.**
Proofs are safe. Promises can be broken.

> 🔍 **Deeper knowledge: Why do type assertions exist at all then?**
>
> Type assertions (`as`) are an escape hatch for situations where you
> know more about the code than the compiler does. For example, after a
> runtime validation by an external library like `zod`, or
> with DOM elements: `document.getElementById("app") as HTMLDivElement`.
> The rule: when you write `as`, you take on the responsibility of ensuring
> the cast is correct. When in doubt: use narrowing.

---

## What you've learned

- Type narrowing narrows the type of a variable within a code block
- Control Flow Analysis is the mechanism TypeScript uses to analyze your code flow
- Narrowing is **eliminative** (removes possibilities), **cumulative** (builds up), and **local** (applies within the block)
- Narrowing is safer than type assertions (`as`) because it is proof, not a promise

> 🧠 **Explain to yourself:** Why is narrowing safer than `as`?
> What could happen if you write `value as string`, but
> `value` is a number at runtime?
> **Key points:** as only convinces the compiler, not the runtime |
> Wrong as leads to runtime crashes | Narrowing checks at runtime |
> Narrowing can never be wrong

**Core concept to remember:** Narrowing is the bridge between the
general type (union) and the concrete type (string, number, etc.).
Without this bridge, union types are like locked doors.

---

> **Pause point** -- Good moment for a break. You've understood the fundamental
> concept. From here you'll learn the concrete tools.
>
> Continue with: [Section 02: typeof Guards](./02-typeof-guards.md)