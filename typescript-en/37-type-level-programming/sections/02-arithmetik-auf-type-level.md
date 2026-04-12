# Section 2: Arithmetic at the Type Level — The Tuple-Length Trick

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Types as a Language](./01-types-als-sprache.md)
> Next section: [03 - String Parsing at the Type Level](./03-string-parsing-auf-type-level.md)

---

## What you'll learn here

- How to **represent numbers at the type level** — with tuples instead of values
- The **tuple-length trick** for addition, subtraction, and comparisons
- How to build **length-typed arrays** (e.g. `Vector<3>`)
- Practical application: `NTuple<T, N>` for fixed array lengths

---

## The problem: numbers don't exist at the type level

At the value level you compute: `3 + 4 = 7`. At the type level you
can't — TypeScript has no `+` operator for types. But there's a
trick: **tuple lengths**.

Think of it like a child learning to count: they pile stones on a heap
and count them. Each stone is an `unknown` in the tuple, the heap is
the array, and the number of stones is `["length"]`. The type system
doesn't calculate with symbols — it **counts concrete objects**.

> 📖 **Background: The Tuple-Length Trick and Peano Arithmetic**
>
> This trick comes from functional programming and is similar to
> **Peano arithmetic** — a number system that knows only two
> concepts: zero and successor. The number 3 is
> "successor of successor of successor of zero". In TypeScript:
> A tuple `[any, any, any]` has length `3`. This length is
> a **literal type** — the compiler knows it at compile time.
> Giuseppe Peano formulated this system in 1889, and it remains
> the foundation for type-level arithmetic in many languages
> (Haskell, Idris, TypeScript).
>
> In **Idris** and **Agda** (dependently typed languages),
> length-typed arithmetic is a standard tool: vectors of
> length N, matrices of dimension MxN. TypeScript achieves the same
> without language support — using only the tuple trick. This is
> remarkable because TypeScript was not designed as a dependently-typed
> language. The community forced it in after the fact.

### The core principle

```typescript annotated
type Three = [unknown, unknown, unknown];
type Len = Three["length"];
// ^ Len = 3 (not number, but the literal 3!)
// TypeScript knows the EXACT length of tuple types

// For comparison:
type Arr = unknown[];
type ArrLen = Arr["length"];
// ^ ArrLen = number (not specific — not a tuple!)
```

The idea: instead of computing with numbers, manipulate tuples and
read the length at the end.

---

## Addition: joining tuples together

```typescript annotated
// Build a tuple with N elements:
type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N    // Do we have enough elements?
    ? Acc                     // Yes → done
    : BuildTuple<N, [...Acc, unknown]>;  // No → one more element
// ^ Recursion: add one element until length = N

// Addition: join two tuples together
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];
// ^ Spread both tuples, read the total length

// Testing:
type Sum = Add<3, 4>;     // 7
type Zero = Add<0, 0>;    // 0
type Big = Add<50, 50>;   // 100
```

> 🧠 **Explain to yourself:** Why does `BuildTuple` need the
> accumulator `Acc`? What would happen if you wrote
> `[unknown, ...BuildTuple<N-1>]` instead?
> **Key points:** TypeScript cannot compute `N-1` at the type level |
> The accumulator counts via its length | Tail recursion is
> more efficient for the compiler

---

## Subtraction: removing elements

```typescript annotated
// Subtraction: remove B elements from an A-tuple
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
    // ^ Pattern matching: A-tuple = B-tuple + Rest?
    ? Rest["length"]  // Yes → length of Rest = A - B
    : never;          // No → B > A, undefined
// ^ Like: "take 3 elements away, count what's left"

type Diff1 = Subtract<7, 3>;  // 4
type Diff2 = Subtract<5, 5>;  // 0
type Diff3 = Subtract<2, 5>;  // never (negative not possible)
```

### Comparisons: greater than, less than, equal

```typescript annotated
// Is A greater than B?
type GreaterThan<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, unknown, ...unknown[]]
    // ^ A-tuple is B-tuple + at least 1 element
    ? true
    : false;

type GT1 = GreaterThan<5, 3>;  // true
type GT2 = GreaterThan<3, 3>;  // false
type GT3 = GreaterThan<2, 3>;  // false

// Equality is even simpler — check both sides:
type Equal<A extends number, B extends number> =
  A extends B ? (B extends A ? true : false) : false;

type EQ1 = Equal<5, 5>;  // true
type EQ2 = Equal<3, 5>;  // false

// LessOrEqual = NOT GreaterThan:
type LessOrEqual<A extends number, B extends number> =
  GreaterThan<A, B> extends true ? false : true;

type LE1 = LessOrEqual<3, 5>;  // true
type LE2 = LessOrEqual<5, 5>;  // true
type LE3 = LessOrEqual<7, 5>;  // false
```

> 💭 **Think about it:** Tuple-length arithmetic has an upper bound
> of around 999 (TypeScript's recursion limit). Is that a problem
> in practice? When would you want to compute with larger numbers
> at the type level?
>
> **Answer:** In practice you rarely compute with large numbers
> at the type level. Typical uses: array lengths (4x4 matrix),
> string length limits (max. 255 characters), API pagination.
> For real computations you use the value level — the type system
> just ensures the dimensions are correct.

> 🧠 **Explain to yourself:** Why isn't `A extends B ? true : false`
> enough for `Equal<A, B>`? What's missing?
> **Key points:** `5 extends number` is `true`, but `5 !== number` |
> Bidirectional checking excludes subtype relationships |
> Both `A extends B` and `B extends A` together gives true equality

---

## In practice: length-typed arrays

The killer feature of tuple arithmetic: **arrays with a known length**.

```typescript annotated
// A tuple with exactly N elements of type T:
type NTuple<T, N extends number, Acc extends T[] = []> =
  Acc["length"] extends N
    ? Acc
    : NTuple<T, N, [...Acc, T]>;
// ^ Generic: any element type, any length

type Vector3 = NTuple<number, 3>;  // [number, number, number]
type RGB = NTuple<number, 3>;       // [number, number, number]
type Byte = NTuple<0 | 1, 8>;       // [0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]

// Function that expects exactly 3 elements:
function cross(a: Vector3, b: Vector3): Vector3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

cross([1, 2, 3], [4, 5, 6]);    // OK
// cross([1, 2], [4, 5, 6]);     // ERROR: [number, number] ≠ Vector3
```

> ⚡ **Angular connection:** In Angular projects you encounter
> length-typed arrays in matrix transformations in
> animations (`transform: matrix(a, b, c, d, tx, ty)` — exactly
> 6 parameters) or with CSS variable values for color channels.
>
> ```typescript
> // Type-safe CSS matrix function:
> type Matrix6 = NTuple<number, 6>;
> function cssMatrix(...values: Matrix6): string {
>   return `matrix(${values.join(", ")})`;
> }
> cssMatrix(1, 0, 0, 1, 0, 0);    // OK
> // cssMatrix(1, 0, 0, 1);        // ERROR: 4 arguments ≠ 6
> ```

> ⚡ **React connection:** In React projects with Three.js or
> Canvas APIs, `Vector3` (3D coordinates) and `Matrix4` (4x4 = 16
> values for 3D transformations) are everyday types. With `NTuple` the
> dimension is encoded in the types:
>
> ```typescript
> type Matrix4Flat = NTuple<number, 16>;  // column-major
>
> function applyTransform(
>   mesh: Mesh,
>   matrix: Matrix4Flat
> ): void { /* ... */ }
>
> // applyTransform(mesh, new Array(9).fill(0));  // ERROR!
> // applyTransform(mesh, new Array(16).fill(0)); // Still an error!
> // ^ NTuple is a tuple type, not an array type
> ```
>
> Without `NTuple`, `number[]` silently accepts `[1, 2]` where
> `[1, 2, 3]` is expected — a silent error that only surfaces at
> runtime.

---

## Experiment: type-safe pagination

Build a type that ensures `page` and `pageSize` together
don't exceed the limit:

```typescript
// Multiplication via repeated addition (works up to ~N=40)
type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc
    : BuildTuple<N, [...Acc, unknown]>;

type Multiply<A extends number, B extends number, Acc extends unknown[] = [], Count extends unknown[] = []> =
  Count["length"] extends B
    ? Acc["length"]
    : Multiply<A, B, [...Acc, ...BuildTuple<A>], [...Count, unknown]>;

// Tests:
type Product = Multiply<3, 4>;   // 12
type Product2 = Multiply<5, 5>;  // 25
type Product3 = Multiply<0, 5>;  // 0

// ⚠️ WARNING: Recursive types have a limit (~1000 instantiations).
// With large numbers TypeScript will abort with "Type instantiation is excessively
// deep and possibly infinite". In tsconfig:
//   "compilerOptions": { "typeParameterBoundedArity": 1000 }

// Experiment: Implement IsEven<N> that checks whether a number is even.
// Hint: An even number can be split into two equal halves.
// type IsEven<N extends number> = ???
// type E1 = IsEven<4>;  // true
// type E2 = IsEven<5>;  // false
```

Try it out: Can you implement `IsEven<N>` using the multiplication type?
What happens with `IsEven<0>`?

---

## Knowing the limits: where tuple arithmetic stops

Before we close, an honest look at the limitations:

```typescript
// Works well (small numbers):
type Sum1 = Add<10, 20>;    // 30 ✓
type Sum2 = Add<50, 50>;    // 100 ✓
type Sum3 = Add<200, 200>;  // 400 ✓

// Gets slow but still works:
type Sum4 = Add<400, 400>;  // 800 ✓ (but tsserver briefly hangs)

// Fails:
// type Sum5 = Add<500, 500>;  // "Type instantiation is excessively deep"
// ^ TypeScript gives up at ~1000 recursions

// The solution for large numbers: combine with runtime validation
function exactLength<N extends number>(
  arr: unknown[],
  expected: N
): arr is NTuple<unknown, N> {
  return arr.length === expected;
}

// Type level for the interface, runtime for validation:
function processVector(data: unknown[]): void {
  if (!exactLength(data, 3)) throw new Error("Expected 3 elements");
  const vec: NTuple<number, 3> = data as NTuple<number, 3>;
  // ^ Safe now
}
```

> 💭 **Think about it:** When would you recommend the tuple arithmetic
> approach to a colleague? And when would you say "a simple `number[]`
> is fine here"?
>
> **Answer:** Recommend it when the length is semantically meaningful
> and controllable by the caller (RGB always 3, matrix always 16).
> Don't recommend it when the length is variable or only known at
> runtime (API responses, user input). The rule of thumb:
> fixed length is a candidate for the type level; variable length
> belongs at runtime.

---

## What you've learned

- Numbers at the type level are represented by **tuple lengths** (Peano arithmetic)
- **Addition** = joining tuples, **subtraction** = removing elements via `infer`
- **Comparisons and equality** work through pattern matching on tuple lengths
- **NTuple<T, N>** produces arrays with an exact length — useful for vectors, matrices, RGB values
- The upper bound is around 999 due to TypeScript's recursion limit
- For numbers > 999: combine runtime validation instead of forcing the type level

> 🧠 **Explain to yourself:** Why is `[unknown, unknown, unknown]["length"]`
> the type `3` and not `number`? What would have to change for it to be
> `number`?
> **Key points:** Tuples have literal lengths because the compiler knows the
> exact count | Regular arrays (`unknown[]`) have `number` as their length
> because they are variable | This is the decisive difference between
> tuple and array at the type level

**Core concept to remember:** The tuple-length trick translates numbers into data structures. Instead of "compute 3+4" you say "join two groups and count". This is the foundation of all type-level arithmetic. Use it when the dimension of a data type is semantically meaningful.

---

> **Pause point** — Tuple arithmetic is the tool. Next comes the
> application: parsing strings at the type level.
>
> Continue with: [Section 03: String Parsing at the Type Level](./03-string-parsing-auf-type-level.md)