# Section 3: Generic Higher-Order Functions

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Generic Collections](./02-generic-collections.md)
> Next section: [04 - Advanced Constraints](./04-generic-constraints-advanced.md)

---

## What you'll learn here

- What makes Higher-Order Functions (HOFs) even more powerful with generics
- `pipe()` — chaining functions with type safety
- `compose()` — reversing the order of execution
- Generic map/filter for custom structures beyond arrays
- Currying and partial application with full type inference

---

## Background: How RxJS Married Generics and HOFs

In 2015, RxJS 5 brought one of the most elegant generic HOF implementations to the JavaScript world. Every RxJS operator — `map`, `filter`, `switchMap`, `catchError` — is a higher-order function that takes a function and returns a transformed `Observable<T>`.

The brilliant part: TypeScript tracks the type through EVERY transformation. `observable.pipe(map(x => x.toString()))` knows that if `x` is a `number`, the output is a `string` — without a single explicit type annotation. That was revolutionary in 2015 and is the standard today.

What you learn in this section is exactly the foundation of RxJS, Redux Middleware, and all modern React HOCs: functions that transform functions, while fully preserving the type.

---

## Higher-Order Functions: The Short Version

A Higher-Order Function (HOF) is a function that takes another function as an argument OR returns a function. You know this from `Array.map()`, `Array.filter()`, `Array.reduce()`.

With generics, custom HOFs become fully type-safe — the compiler tracks the type through EVERY level of nesting.

---

## pipe() — Routing Values Through Function Chains

`pipe()` takes a value and routes it through a series of functions. The output of each function becomes the input of the next.

```typescript annotated
// Simple version with 2 functions:
function pipe2<A, B>(value: A, fn1: (a: A) => B): B {
  return fn1(value);
}

function pipe3<A, B, C>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C
): C {
  return fn2(fn1(value));
}
```

### Pipe with Overloads for Variable Lengths

In practice, you need more than 2 steps:

```typescript annotated
function pipe<A, B>(v: A, f1: (a: A) => B): B;
function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;
function pipe<A, B, C, D>(
  v: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D
): D;
function pipe<A, B, C, D, E>(
  v: A, f1: (a: A) => B, f2: (b: B) => C,
  f3: (c: C) => D, f4: (d: D) => E
): E;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((v, fn) => fn(v), value);
}

// Every step is type-checked:
const result = pipe(
  "  Hello World  ",
  (s) => s.trim(),               // string -> string
  (s) => s.split(" "),            // string -> string[]
  (arr) => arr.length,            // string[] -> number
  (n) => `${n} words`             // number -> string
);
// ^ Type: string — "2 words"
```

> 🧠 **Explain to yourself:** Why do you need overloads instead of a single generic type? Can TypeScript use the length of a rest parameter list for type inference?
> **Key points:** Each step has a DIFFERENT type | TypeScript cannot infer arbitrarily many type parameters from rest parameters | Overloads are the workaround for a variable number of type transitions

> ⚡ **Angular connection:** You know the `pipe()` pattern as RxJS `observable.pipe(operator1, operator2, ...)`. Every RxJS operator is a HOF: it takes `Observable<T>` and returns `Observable<U>`. TypeScript tracks `T` -> `U` -> `V` through the entire chain — exactly like the overloads here. When you write `http.get<User[]>('/api').pipe(map(users => users.length))`, TypeScript infers the final type `number` automatically.

---

## compose() — Reversed Order

`compose()` is the mathematical counterpart to `pipe()`. Functions are applied from right to left: `compose(f, g)(x)` = `f(g(x))`.

```typescript annotated
function compose<A, B>(f1: (a: A) => B): (a: A) => B;
function compose<A, B, C>(
  f2: (b: B) => C,
  f1: (a: A) => B
): (a: A) => C;
function compose<A, B, C, D>(
  f3: (c: C) => D,
  f2: (b: B) => C,
  f1: (a: A) => B
): (a: A) => D;
function compose(...fns: Function[]): Function {
  return (value: unknown) =>
    fns.reduceRight((v, fn) => fn(v), value);
}

// Creating a reusable pipeline:
const processName = compose(
  (s: string) => s.toUpperCase(),     // Step 2
  (s: string) => s.trim()             // Step 1
);

console.log(processName("  alice  ")); // "ALICE"
```

> **Pipe vs Compose:** `pipe` reads like a data stream (top to bottom). `compose` reads mathematically (inside to outside). Both are functionally equivalent — choose whichever is more readable in your context.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C {
>   return f2(f1(v));
> }
>
> const result = pipe(
>   42,
>   (n) => n.toString(),    // number -> string
>   (s) => s.length         // string -> number
> );
> // Hover over result — what type does TypeScript recognize?
> // What happens if you swap the order of the functions?
> // Try: pipe("hello", (s) => s.length, (n) => n * 2)
> // Can you build a chain that always returns the input type?
> ```

---

## Generic map/filter for Custom Structures

`map` and `filter` are not limited to arrays. You can implement them for ANY data structure:

```typescript annotated
// Result type: Either success or failure
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// map for Result — transforms the success case
function mapResult<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result; // Pass the error case through unchanged
}

const parsed: Result<string> = { ok: true, value: "42" };
const asNumber = mapResult(parsed, parseInt);
// ^ Type: Result<number, Error>
```

### flatMap for Chained Operations

```typescript annotated
function flatMap<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) return fn(result.value);
  return result;
}

function parseAge(input: string): Result<number> {
  const n = parseInt(input);
  if (isNaN(n)) return { ok: false, error: new Error("Not a number") };
  if (n < 0 || n > 150) return { ok: false, error: new Error("Invalid age") };
  return { ok: true, value: n };
}

const ageResult = flatMap(
  { ok: true, value: "25" } as Result<string>,
  parseAge
);
// ^ Type: Result<number, Error>
```

> 📖 **Background: Result Types Come from Rust and Haskell**
>
> The `Result<T, E>` pattern is directly inspired by Rust (where it's called `Result<T, E>`) and Haskell (where it's called `Either`). The core idea: instead of exceptions (which blow invisibly through the call stack), errors are explicitly returned as values. `mapResult` and `flatMap` correspond to the functor and monad operations from functional programming — but you don't need these terms to use the pattern.
>
> In Angular projects you'll often see `catchError` in RxJS — conceptually the same thing: treating errors as values, not as exceptions.

> 💭 **Think about it:** A `Result<T, E>` forces the caller to handle the error case. An exception "explodes" and can be caught anywhere. In your Angular project you have HTTP calls with `catchError`. What type would the Observable have if you returned `Result<User, HttpError>` instead? What would that mean for template bindings?

---

## Currying with Generics

Currying transforms a function with multiple parameters into nested functions with one parameter each:

```typescript annotated
function curry<A, B, C>(
  fn: (a: A, b: B) => C
): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

const multiply = (a: number, b: number) => a * b;
const curriedMultiply = curry(multiply);
// ^ Type: (a: number) => (b: number) => number

const double = curriedMultiply(2);
// ^ Type: (b: number) => number

console.log(double(5));  // 10
console.log(double(21)); // 42
```

Practical use — configurable formatters:

```typescript annotated
const formatWith = curry(
  (prefix: string, value: string) => `[${prefix}] ${value}`
);

const logError = formatWith("ERROR");
const logInfo = formatWith("INFO");

console.log(logError("Disk full"));  // "[ERROR] Disk full"
console.log(logInfo("Server up"));   // "[INFO] Server up"
```

> ⚡ **React connection:** Currying appears everywhere in React projects. `useCallback((id: string) => (event: MouseEvent) => handleClick(id, event), [...])` is a curried event handler. The first argument fixes `id`, the second takes the event. TypeScript tracks both type parameters fully — including the concrete event type `MouseEvent`.

---

## What you've learned

- Higher-order functions become fully type-safe with generics — the compiler tracks every type transition
- `pipe()` routes values through function chains, connecting output to input
- `compose()` creates reusable pipelines in reverse order
- `mapResult()` and `flatMap()` show that HOFs are applicable to any data structure
- `curry()` transforms multi-parameter functions into type-safe partial applications

**Core concept:** A generic HOF doesn't just pass a type through a single function — it links the output type of one function to the input type of the next. That's why TypeScript can find type errors in RxJS and Redux before the code ever runs.

---

> **Pause point** — You've mastered the functional generic patterns. Next up: Advanced Constraints.
>
> Continue with: [Section 04 — Advanced Generic Constraints](./04-generic-constraints-advanced.md)