# Section 1: The extends Condition — Types That Make Decisions

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start of lesson)
> Next section: [02 - The infer Keyword](./02-infer-keyword.md)

---

## What you'll learn here

- What Conditional Types are and why they're a quantum leap in the type system
- The basic syntax `T extends U ? X : Y` and how TypeScript evaluates it
- How Conditional Types fundamentally differ from runtime checks (`typeof`, `instanceof`)
- When Conditional Types make sense — and when they're overkill

---

## The idea: Types that make decisions

Imagine you're building a library. Your function should accept `string` and return `string[]` — but when the user passes `number`, it should return `number[]`. With simple generics you'd hit a wall: `T[]` works fine, but what if you want *completely different* outputs depending on the input type?

This is exactly where Conditional Types come in. They allow you to make the **return type of a function dependent on the input type** — at compile time, with no runtime code.

The ternary operator (`a > 0 ? "positive" : "negative"`) is familiar to you. Conditional Types are the same idea, but at the type level:

```typescript
// Runtime ternary:
const label = value > 0 ? "positive" : "negative";

// Type-level ternary (Conditional Type):
type IsString<T> = T extends string ? "yes" : "no";
```

The parallel is exact: a condition on the left, two branches on the right. The only difference: instead of comparing values, we're comparing **types**.

---

## Background: How Conditional Types came to be in TypeScript

Conditional Types were introduced by Anders Hejlsberg in **TypeScript 2.8** (February 2018). The associated RFC and GitHub discussion show that the feature was based on real pain points in the community: developers wanted to write type-safe wrapper functions whose return type depended on the input type — but the type system offered no way to do it.

The concrete example from the original RFC was `Promise.resolve()`:

> When you call `Promise.resolve(42)`, you get `Promise<number>`.
> When you call `Promise.resolve(Promise.resolve(42))`, you get... still `Promise<number>`, because promises are automatically unwrapped.

To type this correctly, you need: "If T is a Promise, unwrap it — otherwise take T directly." That's `Awaited<T>` — and Awaited is impossible to write without Conditional Types.

With 2.8, TypeScript opened the door to an entire cosmos of type system possibilities. The library `ts-toolbelt` (over 200 utility types) would be unthinkable without Conditional Types.

---

## The syntax in detail

```typescript annotated
type IsString<T> = T extends string ? true : false;
//   ^^^^^^^^   ^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//   Name       | This is the Conditional Type
//   of type    |
//              T extends string  -> Condition: "Is T a subtype of string?"
//              ? true            -> If yes: this type
//              : false           -> If no: this type
```

The `extends` operator in Conditional Types means **"is a subtype of"** — not "inherits from" as in classes. This is the set-theoretic definition: if every value of type T is also a valid value of type U, then `T extends U` holds.

```typescript annotated
type A = IsString<string>;    // true  — string is a subtype of string
type B = IsString<"hello">;   // true  — "hello" (literal) is a subtype of string
type C = IsString<number>;    // false — number is not a subtype of string
type D = IsString<string | number>; // boolean — surprising! (covered in Section 3)
```

The last line is a preview of Distributive Conditional Types — the behavior with unions is not intuitive and is the topic of the third section.

---

## Nested Conditional Types: Type switches

In JavaScript and TypeScript you know `switch` statements. Conditional Types can branch just as well by nesting them — like an if-else-if tree:

```typescript annotated
type TypeName<T> =
  T extends string    ? "string"    :  // 1. Check if T is string
  T extends number    ? "number"    :  // 2. Check if T is number
  T extends boolean   ? "boolean"   :  // 3. Check if T is boolean
  T extends undefined ? "undefined" :  // 4. Check if T is undefined
  T extends Function  ? "function"  :  // 5. Check if T is a function
  "object";                            // 6. Otherwise: must be an object

// TypeScript evaluates top to bottom and takes the first match:
type A = TypeName<string>;       // "string"
type B = TypeName<42>;           // "number"  (42 is a literal subtype of number)
type C = TypeName<() => void>;   // "function"
type D = TypeName<{ x: 1 }>;    // "object"
type E = TypeName<undefined>;    // "undefined"
```

This is almost identical to a runtime `typeof` switch — just at the type level. TypeScript evaluates the branches top to bottom and takes the first match.

> **Explain it to yourself:** What does `TypeName<string | number>` return? Is it `"string" | "number"`, or something else? Think about it before reading on.
> **Key points:** Unions are distributed (each member evaluated individually) | string → "string", number → "number" | Result: "string" | "number" | This is called distribution and is the topic of the next sections

---

## The fundamental difference from runtime checks

A common line of thinking: "Conditional Types are like `typeof` — I can combine them!" That's not true, and the difference is fundamental.

```typescript annotated
// Runtime check (typeof): tests the VALUE at runtime
function processRuntime(x: unknown) {
  if (typeof x === "string") {
    // Here JS knows: x is a string
    return x.toUpperCase(); // works
  }
}

// Conditional Type: tests the TYPE at compile time
type Process<T> = T extends string ? string : number;
//                                            ^^^^^^
// This is just a type — no runtime behavior!

// This function looks reasonable, but does NOT compile:
function processType<T>(x: T): Process<T> {
  if (typeof x === "string") {
    return x.toUpperCase(); // Error: Type 'string' is not assignable to 'Process<T>'
    //                      TypeScript cannot narrow T through control flow!
  }
  return 0; // Error: Type 'number' is not assignable to 'Process<T>'
}
```

TypeScript **cannot narrow Conditional Types through control flow**. This is a deliberate design constraint: the compiler cannot prove that `typeof x === "string"` implies that `T extends string` takes the true branch in the Conditional Type. The solution is overloads or type assertions — but that's advanced territory.

> **Think about it:** Why can TypeScript not infer inside `if (typeof x === "string")` that `T` equals `string`? What would be needed for that to work?
>
> **Answer:** The problem is that `T` is a free type parameter — it could be `string | number`, and the typeof check only applies to part of it. TypeScript would need a way to "split" the type parameter, which would lead back to Conditional Types and require an exponentially complex type inference algorithm. Anders Hejlsberg drew this boundary intentionally to keep the compiler simple and fast.

---

## Experiment: Conditional Types in the Playground

> **Experiment:** Try the following in the TypeScript Playground (playground.typescriptlang.org):
>
> ```typescript
> type Describe<T> =
>   T extends null | undefined ? "nullish" :
>   T extends string           ? "text" :
>   T extends number           ? "number" :
>   T extends boolean          ? "boolean" :
>   T extends any[]            ? "list" :
>   "object";
>
> type A = Describe<null>;           // ?
> type B = Describe<undefined>;      // ?
> type C = Describe<string[]>;       // ?
> type D = Describe<{ x: 1 }>;      // ?
> type E = Describe<string | null>;  // ?
> ```
>
> Hover over the type aliases to see the resolved types. What happens with `string | null`? Is the result what you expected?

---

## In your Angular project: Smart service return types

Conditional Types shine when you design Angular services that deliver different data depending on the input:

```typescript annotated
// A service that loads resources of different types:
interface ResourceMap {
  user: User;
  product: Product;
  order: Order;
}

// Conditional Type: return type depends on the key
type LoadResult<K extends string> =
  K extends keyof ResourceMap
    ? ResourceMap[K]        // Known resource: concrete type
    : Record<string, unknown>; // Unknown resource: generic object

// The service can now be type-safe:
declare function loadResource<K extends string>(key: K): Promise<LoadResult<K>>;

const user = await loadResource("user");      // user: User
const product = await loadResource("product"); // product: Product
const unknown = await loadResource("xyz");    // unknown: Record<string, unknown>
```

Without Conditional Types you'd have to write overloads for every resource or fall back to `any`. With Conditional Types the code stays DRY and type-safe.

---

## The built-in Conditional Types of the standard library

TypeScript ships several built-in utility types that all build on `extends`. You may have used them already — now you'll recognize how they work:

```typescript annotated
// NonNullable<T> — removes null and undefined from a type:
type NonNullable<T> = T extends null | undefined ? never : T;
//                              ^^^^^^^^^^^^^^^^
//                              If T is null OR undefined -> never
//                              Otherwise -> T itself (pass-through)

type A = NonNullable<string | null>;            // string
type B = NonNullable<string | null | undefined>; // string
type C = NonNullable<null>;                     // never

// Conditional<T, U, True, False> — the fundamental pattern underlying all of these:
// true if T is a subtype of U, false otherwise.
// The type system uses it implicitly everywhere.
```

And then there are the specialists — types built with `infer` (next section):

```typescript annotated
// ReturnType<T> — extracts the return type of a function:
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
//                                    ^
//                             infer R: "capture" the return type

// Awaited<T> — resolves Promises (simplified):
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
//                                       ^
//                                 recursive! (more in Section 4)
```

These types from the standard library are your strongest allies. They save you many manual type annotations.

---

## Think about it

> **Think about it:** `TypeName<T>` returns `"function"` for `T = () => void`. But functions in JavaScript are also objects — they have properties like `name`, `length` and you can call `Object.keys()` on them. Why does `TypeName<() => void>` still return `"function"` and not `"object"`?
>
> **Answer:** Because the order in nested conditionals is decisive. `TypeName` checks `T extends Function` **before** it returns `"object"`. Since functions are a subtype of `Function`, the `"function"` branch fires first. This illustrates an important property of nested conditionals: the **order of checks** determines the result — exactly like `if-else if` chains.

---

## When to use Conditional Types?

| Situation | Solution |
|-----------|---------|
| Return type depends on input type | `T extends X ? A : B` |
| Extract a type from another type | `infer` (next section) |
| Filter union members | Distributive conditionals (Section 3) |
| Resolve nested structures | Recursion (Section 4) |
| Simple generics suffice | No Conditional Types needed! |

The last point matters: Conditional Types are powerful, but they increase complexity. Always ask yourself: "Do I really need this, or will a simple generic do?"

---

## What you've learned

- Conditional Types are **ternary operators for types**: `T extends U ? X : Y`
- `extends` in Conditional Types means "is a subtype of" (not inheritance)
- Nested Conditional Types create **type switches** — evaluated top to bottom
- Conditional Types exist **at compile time only** — they generate no runtime code
- TypeScript **cannot narrow Conditional Types through control flow** — this is a known constraint
- They shine when the **return type should depend on the input type**

**Core concept:** `T extends U ? X : Y` is a type expression evaluated at compile time — TypeScript chooses X or Y based on whether T is a subtype of U. This makes library APIs possible that return different output types depending on the input type.

---

## Quick reference: The most important points at a glance

| Concept | Syntax | Meaning |
|---------|--------|-----------|
| Basic condition | `T extends U ? X : Y` | If T is subtype of U: X, otherwise Y |
| Subtype | `"hello" extends string` | Literal types are subtypes of their base |
| Nested | `T extends A ? X : T extends B ? Y : Z` | If-else-if chain |
| Compile time | — | No runtime code, no control-flow narrowing |
| Use case | Return type dependency | When output type should depend on input type |

---

> **Pause point** — You've understood the foundation. Conditional Types are no longer a mystery, but a logical tool. Take a short break before moving on to the powerful `infer` keyword.
>
> Continue with: [Section 02: The infer Keyword](./02-infer-keyword.md)