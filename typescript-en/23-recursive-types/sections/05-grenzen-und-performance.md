# Section 5: Limits and Performance

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Recursive Conditional Types](./04-rekursive-conditional-types.md)
> Next section: [06 - Practical Patterns](./06-praxis-patterns.md)

---

## What you'll learn here

- Why TypeScript has a **recursion limit of ~50 levels** and what happens when you hit it
- How to use **Tail Recursion Optimization** (TS 4.5) to recurse deeper
- How to use **tuple length as a counter** for type-level arithmetic
- When recursive types blow up **compile time** and how to avoid it

---

## The Recursion Limit: Why 50?
<!-- section:summary -->
TypeScript evaluates types on a **stack** — just like JavaScript

<!-- depth:standard -->
TypeScript evaluates types on a **stack** — just like JavaScript
function calls. And just like with functions, there's a limit:

```typescript
// This type counts from N down to 0:
type Countdown<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc
    : Countdown<N, [...Acc, unknown]>;

type Ten = Countdown<10>;    // OK: [unknown x10]
type Fifty = Countdown<50>;  // OK (just barely)
// type Hundred = Countdown<100>;
// Error: Type instantiation is excessively deep and possibly infinite.
```

<!-- depth:vollstaendig -->
> **Background: Why TypeScript has a recursion limit**
>
> The TypeScript compiler evaluates types **stack-based**.
> Each recursive type instantiation pushes a new frame
> onto the type evaluation stack. At around **50 levels**,
> TypeScript aborts with the error message: "Type instantiation is
> excessively deep and possibly infinite."
>
> The limit is **intentionally conservative**. It protects against:
> 1. **Infinite loops** (missing base case)
> 2. **Memory overflow** (each frame consumes memory)
> 3. **Extremely long compile times** (exponential type expansion)
>
> The limit is hard-coded in the compiler (in `checker.ts`) and
> cannot be configured.

---

<!-- /depth -->
## Understanding the Error Messages
<!-- section:summary -->
TypeScript has several error messages for recursion problems:

<!-- depth:standard -->
TypeScript has several error messages for recursion problems:

```typescript
// 1. "Type instantiation is excessively deep and possibly infinite"
//    → You've hit the ~50-level limit
type TooDeep = Countdown<100>;

// 2. "Type alias circularly references itself"
//    → Direct circularity without a conditional
type Bad = Bad | string;
// ^ ERROR! No conditional type to "brake" the recursion

// 3. "Type produces a union type that is too complex to represent"
//    → The recursion generates too many union members
type AllPaths<T> = /* ... deeply nested ... */;
// On very wide objects, the union can become ENORMOUS
```

---

<!-- /depth -->
## Explain It to Yourself: Why Can DeepPartial Crash?
<!-- section:summary -->
The problem is not just the **depth**, but also the **breadth**.

<!-- depth:standard -->
> **Explain it to yourself:**
>
> Why can `DeepPartial<ExtremelyDeep>` crash the compiler, even
> though DeepPartial "only" iterates over keys?
>
> Think about: What happens with an object that has 100 nested
> levels? And what about an object with 10 keys per level
> over 10 levels?
>
> *Think for 30 seconds.*

The problem is not just the **depth**, but also the **breadth**.
With 10 keys per level and 10 levels, `Paths<T>` generates a
union with 10 + 100 + 1000 + ... = ~11 billion paths. The depth
(stack) isn't a problem for DeepPartial (mapped types are
iterative), but `Paths<T>` is a conditional type that **explodes
on wide objects**.

---

<!-- /depth -->
## Tail Recursion Optimization (TS 4.5)
<!-- section:summary -->
TypeScript 4.5 (November 2021) introduced an important optimization:

<!-- depth:standard -->
TypeScript 4.5 (November 2021) introduced an important optimization:
**Tail Recursion** for conditional types.

```typescript annotated
// WITHOUT Tail Recursion (consumes stack):
type CountNaive<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc["length"]
    : CountNaive<N, [...Acc, unknown]>;
    // ^ The recursive call is the LAST thing that happens
    // ^ = "Tail Position" → TypeScript can optimize!

// WITH Tail Recursion TypeScript optimizes automatically:
// - Instead of building stack frames, the current frame is reused
// - Allows recursion up to ~1000 instead of ~50

type Thousand = CountNaive<999>;  // Works thanks to Tail Recursion!
```

**When does Tail Recursion kick in?**

The recursive call must be in one of two "tail positions":

```typescript
// Position 1: Directly in the true/false branch of a conditional type
type TailA<T> = T extends X ? TailA<...> : Result;
//                             ^^^^^^^^^ Tail Position

// Position 2: Directly as an element of a tuple spread
type TailB<T> = T extends X ? [...TailB<...>] : [];
//                              ^^^^^^^^^ Tail Position (Tuple Spread)

// NOT Tail Position (no optimization):
type NotTail<T> = T extends X ? [TailA<...>, string] : [];
//                               ^^^^^^^^^ Not at the end → no tail call
```

---

<!-- /depth -->
## Think Question: Countdown Type with Tuple Counter

> **Think question:**
>
> How do you build a countdown type that counts from N down to 0?
>
> Hint: You can use the **length of a tuple** as a counter:
> `[]["length"]` = 0, `[unknown]["length"]` = 1, `[unknown, unknown]["length"]` = 2
>
> ```typescript
> type NumToTuple<N extends number, Acc extends unknown[] = []> =
>   Acc["length"] extends N
>     ? Acc
>     : NumToTuple<N, [...Acc, unknown]>;
>
> type Three = NumToTuple<3>;  // [unknown, unknown, unknown]
> type Len = Three["length"];  // 3
> ```
>
> This tuple trick is the **only way** to count at the type level —
> TypeScript has no real arithmetic for types.

---

## Tuple Arithmetic: Add and Subtract
<!-- section:summary -->
With the tuple trick you can even build **addition and subtraction**

<!-- depth:standard -->
With the tuple trick you can even build **addition and subtraction**
at the type level:

```typescript annotated
// Build a tuple of N elements
type BuildTuple<N extends number, T extends unknown[] = []> =
  T["length"] extends N ? T : BuildTuple<N, [...T, unknown]>;

// Addition: Tuple A + Tuple B = combined tuple
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];
  // ^ Spread both tuples together and read the length
  // ^ [unknown x A, unknown x B]["length"] = A + B

type Sum = Add<3, 4>;  // 7

// Subtraction: Remove B elements from A
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
    ? Rest["length"]
    // ^ If A >= B: Rest has A-B elements
    : never;
    // ^ If A < B: subtraction not possible

type Diff = Subtract<10, 3>;  // 7
```

---

<!-- /depth -->
## Performance Pitfalls: What to Avoid
<!-- section:summary -->
Here are the most common performance killers:

<!-- depth:standard -->
Here are the most common performance killers:

```typescript
// ❌ WRONG: Distributive Conditional Types + Recursion
//    Each union member is recursed SEPARATELY → exponential growth
type BadPaths<T> = T extends object
  ? keyof T | `${keyof T & string}.${BadPaths<T[keyof T]>}`
  //                                  ^^^^^^^^^^^^^^^^^^
  //                                  T[keyof T] is a UNION of all values!
  //                                  For {a: X, b: Y}: BadPaths<X | Y>
  //                                  → BadPaths<X> | BadPaths<Y> (distributive!)
  : never;

// ✅ RIGHT: Mapped Type instead of distribution
type GoodPaths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${GoodPaths<T[K]>}` }[keyof T & string]
  : never;
  // ^ Mapped Type iterates key-by-key → linear instead of exponential
```

**Rule of thumb for performance:**

| Pattern | Complexity | Problem |
|---------|------------|---------|
| Mapped Type + Recursion | O(keys × depth) | Usually OK |
| Distributive Conditional + Recursion | O(2^depth) | Exponential! |
| Paths on wide objects | O(keys^depth) | Can explode |
| Tail-recursive Conditional | O(depth) | Always OK |

---

<!-- /depth -->
## Experiment: Find the Recursion Limit

> **Experiment:**
>
> Test the recursion limit yourself:
>
> ```typescript
> // 1. Simple counter
> type Count<N extends number, Acc extends unknown[] = []> =
>   Acc["length"] extends N
>     ? Acc["length"]
>     : Count<N, [...Acc, unknown]>;
>
> // 2. Test different values:
> type A = Count<10>;   // 10 — OK
> type B = Count<50>;   // 50 — OK
> type C = Count<100>;  // ??? — Test it!
> type D = Count<500>;  // ??? — Test it!
> type E = Count<999>;  // ??? — Test it!
>
> // 3. Observation:
> // - Up to 50: Always OK (standard limit)
> // - 50-999: Works WITH Tail Recursion Optimization (TS 4.5+)
> // - From 1000: Even Tail Recursion has a limit
>
> // 4. Test WITHOUT Tail Position:
> type BadCount<N extends number, Acc extends unknown[] = []> =
>   Acc["length"] extends N
>     ? Acc["length"]
>     : [BadCount<N, [...Acc, unknown]>][0];
>     //  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>     //  Inside a tuple access: NOT Tail Position!
>     //  → No optimization → breaks at ~50
>
> type F = BadCount<100>;  // Error! Cannot be optimized
> ```
>
> This shows: **Tail Position** is decisive for deep recursion.

---

## When NOT to Use Recursive Types
<!-- section:summary -->
Recursive types are powerful, but not always the best solution:

<!-- depth:standard -->
Recursive types are powerful, but not always the best solution:

```typescript
// ❌ Too clever: Type-level Fibonacci
type Fib<N extends number> = /* 20 lines of complex recursion */;
// → Extremely slow compile time, hard to debug, nobody understands it

// ✅ Instead: Runtime calculation with a simple type
function fibonacci(n: number): number { /* ... */ }

// ❌ Too deep: Paths for unknown API responses
type ApiPaths = Paths<DeepApiResponse>;  // Hundreds of paths
// → IDE becomes slow, autocomplete takes seconds

// ✅ Instead: Only type the paths you actually need
type KnownPaths = "user.name" | "user.address.city";
```

---

<!-- /depth -->
## Framework Reference: Compile Time vs. Benefit

> **In Angular and React:**
>
> Recursive types have a real cost: **compile time**.
> In a large Angular project with 500+ components, an
> excessively recursive type can increase `ng build` time
> by seconds or even minutes.
>
> **Rule of thumb for projects:**
> - **DeepPartial/DeepReadonly:** Almost always OK (mapped types, linear)
> - **Paths\<T\> on your own types:** OK if types aren't too wide
> - **Paths\<T\> on external/generated types:** Caution!
> - **Type-level arithmetic:** Only in library code, never in app code
>
> ```typescript
> // Angular Service: DeepReadonly for store state → OK
> @Injectable({ providedIn: "root" })
> class StateService {
>   private state: DeepReadonly<AppState>;
>   // ^ Shallow enough that compile time is not a problem
> }
>
> // React: Paths for FormValues → OK if FormValues isn't huge
> const { register } = useForm<FormValues>();
> register("user.address.street");
> // ^ Paths<FormValues> is computed once and cached
> ```

---

## Summary

### What you learned

You now understand the **limits and performance** of recursive types:

- TypeScript has a **recursion limit of ~50** (standard) or **~1000** (tail-optimized)
- **Tail Recursion Optimization** (TS 4.5) allows deeper recursion when the recursive call is in tail position
- **Tuple length** is the only way to do type-level arithmetic
- **Distributive Conditional Types + Recursion** = exponential growth → avoid
- **Mapped Types + Recursion** = linear growth → usually OK

> **Core concept:** Recursive types have two enemies: **depth**
> (stack limit) and **breadth** (union explosion). Tail recursion
> helps with depth, but only deliberate design helps against breadth.
> The rule of thumb: if the type noticeably slows down the IDE,
> it's too complex.

---

> **Pause point** — You now know the limits. In the final
> section we put it all together: real practical patterns from
> libraries and projects.
>
> Continue: [Section 06 - Practical Patterns](./06-praxis-patterns.md)