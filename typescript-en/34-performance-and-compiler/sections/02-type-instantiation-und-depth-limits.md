# Section 2: Type Instantiation and Depth Limits

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - How the Compiler Works](./01-wie-der-compiler-arbeitet.md)
> Next section: [03 - Writing Performant Types](./03-performante-typen-schreiben.md)

---

## What you'll learn here

- What **type instantiation** means and why it can grow exponentially
- Where the dreaded **"Type instantiation is excessively deep"** error comes from
- What **depth limits** and **instantiation limits** concretely are (with numbers!)
- How to **consciously work around** these limits instead of blindly running into them

---

## Background: Why do limits exist?

> **Origin Story: The Nightly Crash**
>
> In 2019, a PR in the TypeScript repository caused a strange bug: a certain
> type put the compiler into an infinite loop. The type wasn't obviously
> recursive — but the combination of conditional types and mapped types
> created an **implicit recursion** that the compiler kept resolving deeper
> and deeper until memory was exhausted.
>
> In response, the TypeScript team introduced hard limits: maximum recursion
> depth (50), maximum type instantiations (5,000,000 in modern versions).
> These limits protect the compiler from itself — and you from endless
> compile times.
>
> Interestingly, the trigger was a type from the lodash-types package.
> Someone had tried to fully type the overloaded `_.get()` functions —
> using template literal types for nested property paths. The result was
> a type tree with millions of branches that literally choked the compiler.
> This incident shows: even established library types can hit the compiler's
> limits.

Think of the checker as a machine that "computes" types. Some computations
are trivial (`string` is `string`), others are like a tree that grows new
branches at every step. Without limits, this tree would grow forever.

> 🌳 **Analogy: Fractals and Types**
>
> A recursive type is like a fractal in mathematics — a pattern that repeats
> itself at ever smaller scales. The Mandelbrot set is theoretically infinitely
> deep. In practice, you zoom in to a certain point and stop. The TypeScript
> compiler does exactly that: it "zooms" into recursive types, but stops at
> depth 50.
>
> Just as you can't render a fractal infinitely deep on a screen (your GPU
> would overheat), the compiler can't resolve infinite types to infinite
> depth. The limit is the type-checker's "maximum zoom."

---

> 🧠 **Explain it to yourself:** What is the difference between a generic
> type being instantiated and a recursive type being instantiated?
>
> **Key points:** Generic types produce ONE instance per use |
> Recursive types produce many instances (one per recursion level) |
> `Box<string>` = 1 instantiation | `DeepReadonly<{a:{b:{c:string}}}>` =
> 4 instantiations (1 + 3 nested)

---

## What is type instantiation?

Every time you use a generic type with concrete parameters, the compiler
**instantiates** that type:

```typescript annotated
type Box<T> = { value: T };

type StringBox = Box<string>;
// ^ 1 instantiation: Box<string> → { value: string }
type NumberBox = Box<number>;
// ^ 1 instantiation: Box<number> → { value: number }

type Pair<A, B> = { first: A; second: B };
type SP = Pair<string, number>;
// ^ 1 instantiation: Pair<string, number> → { first: string; second: number }
```

That's cheap. But look what happens when types use **other generic types**
as parameters:

```typescript annotated
type Wrapper<T> = {
  value: T;
  nested: Box<T>;
  // ^ instantiation of Box<T> for each T
  pair: Pair<T, T>;
  // ^ instantiation of Pair<T, T> for each T
};

type Deep = Wrapper<Box<Pair<string, number>>>;
// ^ Wrapper<...> → 1 instantiation
//   Box<Pair<string, number>> → 1 instantiation
//     Pair<string, number> → 1 instantiation
//   Pair<Box<Pair<...>>, Box<Pair<...>>> → further instantiations
// Already 5+ instantiations for a single type
```

> 💭 **Think about it:** If a type `Tree<T>` references itself
> (`left: Tree<T>; right: Tree<T>`), how many instantiations are created
> when the checker resolves the depth to level 5?
>
> **Answer:** 2^0 + 2^1 + 2^2 + 2^3 + 2^4 = 31 instantiations.
> At level 10 that would be 1,023. At level 20: over a million.
> Exponential growth is the reason for depth limits.

---

## The concrete limits

TypeScript has several hard boundaries:

| Limit | Value | Error when exceeded |
|-------|:-----:|---------------------|
| Type recursion depth | **50** | "Type instantiation is excessively deep and possibly infinite" |
| Type instantiations | **5,000,000** | Compiler becomes extremely slow (no explicit error) |
| Conditional type depth | **50** | Same error as recursion depth |
| Union type size | **100,000** | "Expression produces a union type that is too complex" |

> 💭 **Think about it:** TypeScript uses 5,000,000 as the instantiation limit.
> Why this specific number? Was it arbitrary?
>
> **Answer:** 5 million is an empirical value. The TypeScript team analyzed
> hundreds of real projects. Even the most complex types (e.g., GraphQL code
> generation with hundreds of queries) rarely need more than 1 million
> instantiations. 5 million gives enough buffer for real projects, but
> terminates infinite loops within seconds.

The most well-known error is **TS2589**:

```typescript annotated
// Recursive type that goes too deep:
type InfiniteArray<T> = [T, ...InfiniteArray<T>];
// ^ ERROR: TS2589 — "Type instantiation is excessively deep"
// The compiler tries to resolve [T, T, T, T, ...]
// At depth 50 it gives up

// Recursive conditional type:
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
// ^ Works for objects up to ~50 nesting levels
// ^ For more deeply nested structures: TS2589
```

> 🧠 **Explain it to yourself:** Why did the TypeScript team set the limit
> at exactly 50 and not 100 or 1000? What would be the downside of a higher limit?
> **Key points:** 50 is sufficient for all realistic use cases | Higher limit = longer compile times for broken types | The compiler must abort quickly even for infinite recursion

---

## When do you hit these limits?

In practice there are three main causes:

### 1. Recursive utility types

```typescript annotated
// DeepPartial — a classic that often causes problems:
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    // ^ Recursion: DeepPartial is called again for each property
    : T[K];
};

// With flat objects: no problem
type FlatConfig = DeepPartial<{ host: string; port: number }>;
// ^ 2 properties, 1 level — trivial

// With deeply nested: potential problem
type DeepConfig = DeepPartial<{
  server: { host: string; ssl: { cert: string; key: string } };
  database: { primary: { host: string; pool: { min: number; max: number } } };
}>;
// ^ 3 levels — still OK, but instantiations grow with each level
```

### 2. Distributive conditional types with large unions

```typescript annotated
type AllHTMLElements =
  | "div" | "span" | "p" | "a" | "button" | "input"
  | "form" | "table" | "tr" | "td" | "th" | "thead"
  | "tbody" | "ul" | "ol" | "li" | "h1" | "h2" | "h3"
  | "img" | "video" | "audio" | "canvas" | "svg";
// ^ 22 elements

type ElementProps<T extends string> = T extends "input"
  ? { type: string; value: string }
  : T extends "a"
  ? { href: string }
  : { children: string };

type AllProps = ElementProps<AllHTMLElements>;
// ^ Distributive: ElementProps is called for EACH union member
// ^ 22 separate evaluations of the conditional type
// ^ With more complex conditional types this explodes
```

### 3. Overloads + generics in library code

```typescript annotated
// Typical situation in RxJS, Lodash, or React Query:
declare function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
declare function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
declare function pipe<A, B, C, D>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): (a: A) => D;
// ^ Each overload is a separate type the checker must try
// ^ With 20 overloads * complex generics = expensive
```

> ⚡ **Framework note (React):** React's `createElement` and JSX types are
> notoriously expensive for the checker. The type `React.FC<Props>` triggers
> overload resolution for hundreds of HTML elements. In large React projects,
> JSX type-checking alone can account for 20–30% of compile time. That's why
> the React team now recommends avoiding `React.FC` and annotating props
> directly instead.

> ⚡ **Framework note (Angular):** Angular's dependency injection also creates
> expensive type instantiations. The type `Inject<T>` with nested provider
> configurations can lead to unexpectedly many instantiations in large modules
> (e.g., `AppModule` with 20+ providers). Particularly problematic: the
> `MultiProvider` pattern with injection tokens that themselves use generics.
> Angular teams report that switching from `useFactory` with complex generic
> return types to simple factory functions has reduced compile time by 10–15%.

---

## How to fix limit errors

When you get TS2589, you have three strategies:

```typescript annotated
// Strategy 1: Limit recursion with a counter
type DeepReadonly<T, Depth extends number[] = []> =
  Depth["length"] extends 10
    ? T  // Stop after 10 levels
    : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K], [...Depth, 0]> }
    : T;
// ^ The tuple Depth grows by 1 with each recursion
// ^ At length 10: abort → no TS2589

// Strategy 2: Tail recursion (TS 4.5+)
// TypeScript recognizes tail position and optimizes:
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;
// ^ Tail position: TrimLeft is the last expression
// ^ Compiler can resolve this iteratively instead of recursively
// ^ Allows much deeper "recursion" than 50

// Strategy 3: Cache the result with a type alias
type Cached = DeepReadonly<MyHugeType>;
// ^ Computed once, used multiple times
// ^ Without cache: recomputed on every use
```

> 🧠 **Explain it to yourself:** What happens when you use the same generic
> type in two different places in your code? Does the compiler compute it
> twice?
>
> **Key points:** Yes, by default it is re-instantiated on every use |
> A type alias `type Cached = GenericType<X>` is computed ONCE and the
> result is cached | If you write the generic type directly in 10 places:
> 10 computations | If you cache it once and use the cache: 1 computation

---

> 🧪 **Bonus experiment: Template literal types and performance**
>
> Template literal types can also hit limits:
>
> ```typescript
> type Join<Parts extends string[], Sep extends string = "-"> =
>   Parts extends [infer First extends string, ...infer Rest extends string[]]
>     ? Rest extends string[]
>       ? `${First}${Sep}${Join<Rest, Sep>}`
>       : First
>     : "";
>
> type CSS = Join<["bg", "red", "hover", "text", "lg"]>;
> // ^ "bg-red-hover-text-lg" — works
>
> type VeryLong = Join<[
>   "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
>   "k", "l", "m", "n", "o", "p", "q", "r", "s", "t"
> ]>;
> // ^ With 20 parts: template string recursion reaches depth 50+
> // ^ Because `${First}${Sep}${Join<...>}` creates TWO recursive branches
> ```
>
> The `${Sep}${Join<...>}` part implicitly creates two recursive branches —
> a hidden exponential pitfall.

> 🧪 **Experiment:** Try this type that intentionally reaches the limit:
>
> ```typescript
> type Repeat<S extends string, N extends number, Acc extends string = "", Counter extends 0[] = []> =
>   Counter["length"] extends N
>     ? Acc
>     : Repeat<S, N, `${Acc}${S}`, [...Counter, 0]>;
>
> type FiveAs = Repeat<"a", 5>;   // "aaaaa" — OK
> type FiftyAs = Repeat<"a", 50>; // Edge case!
> type HundredAs = Repeat<"a", 100>; // TS2589!
> ```
>
> Play with the value and observe where the compiler gives up.

---

## What you've learned

- **Type instantiation** happens every time you use a generic type with concrete parameters
- Recursive types can generate **exponentially** many instantiations
- The **depth limit** is 50, the instantiation limit is approximately 5 million
- **TS2589** is the error for recursion that's too deep — solvable with counters, tail recursion, or caching
- Large **unions + distributive conditional types** are a common performance killer

**Core concept to remember:** Every generic type you write is an instruction to the checker: "Compute this for me." Recursive types say: "Compute this again and again." Limits are not bugs — they protect you from types that would drive the compiler into an infinite loop.

---

> **Pause point** — Good moment for a break. You now know the limits of the
> compiler.
>
> Continue with: [Section 03: Writing Performant Types](./03-performante-typen-schreiben.md)