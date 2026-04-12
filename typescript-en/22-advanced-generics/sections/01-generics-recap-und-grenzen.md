# Section 1: Generics Recap & Limits

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Higher-Order Types](./02-higher-order-types.md)

---

## What you'll learn here

- Where lessons 13/14 left off and why simple generics **aren't enough**
- What **concrete problems** arise when you need "types over types"
- Why TypeScript's type system deliberately has **limits** — and how to work around them
- The **motivation** for higher-order types, variance, and advanced constraints

---

## The road so far
<!-- section:summary -->
In lesson 13 you learned about generics: `<T>`, `extends`, `keyof`,

<!-- depth:standard -->
In lesson 13 you learned about generics: `<T>`, `extends`, `keyof`,
default type parameters. In lesson 14 you saw patterns: factories,
collections, builder, fluent APIs. That was solid — but it was only the
beginning.

Imagine you have a toolbox. Lessons 13/14 gave you a hammer and
a screwdriver. Now you need precision instruments.

```typescript
// You already know this (L13):
function identity<T>(value: T): T {
  return value;
}

// And this (L14):
class TypedMap<K, V> {
  private store = new Map<K, V>();
  set(key: K, value: V): this { this.store.set(key, value); return this; }
  get(key: K): V | undefined { return this.store.get(key); }
}
```

All fine so far. But now comes a task that **can't be solved** with these tools.

---

<!-- /depth -->
## The problem: "some container"
<!-- section:summary -->
Imagine you're writing a utility function that should work with **various

<!-- depth:standard -->
Imagine you're writing a utility function that should work with **various
container types**: `Array<T>`, `Set<T>`, `Map<K,V>`,
`Promise<T>`. You want a `map` function that maps over *any*
container:

```typescript annotated
// What we want:
// map(container, transformFn) → same container type, new content

// For Array? No problem:
function mapArray<T, U>(arr: T[], fn: (x: T) => U): U[] {
  return arr.map(fn);
}
// ^^^ T and U are simple generics — this works.

// But what about "any container"?
// We want: map(someContainer, fn) → container with transformed content
// How do we write the type of "someContainer"?

// ATTEMPT 1: A simple generic
function mapContainer<C, T, U>(container: C, fn: (x: T) => U): ??? {
  // Problem 1: How do we get at T? C is a concrete type.
  // Problem 2: What's the return type? "C, but with U instead of T"?
  // This doesn't work with simple generics!
}
// ^^^ TypeScript can't express "C, but with different content".
```

The core problem: we need a type that is **itself generic**.
Not `Array<string>` (a concrete type), but `Array` as a concept —
a type constructor that only becomes a concrete type once you give it
an argument.

---

> 📖 **Background: Generics in TypeScript 2.0 (2016)**
>
> When Anders Hejlsberg designed generics for TypeScript, he faced a
> decision: how powerful should the type system be? Languages like Haskell
> already had higher-kinded types — types over types over types. But
> Hejlsberg deliberately chose a simpler model.
>
> His vision: "Expressive types without runtime cost." The type system
> should be powerful enough for real JavaScript patterns, but not so
> complex that only type theorists could understand it. TypeScript 2.0 (September
> 2016) brought generics that could work with `extends` constraints and `keyof` —
> a good compromise.
>
> But the community wanted more. Libraries like `fp-ts` (functional
> programming in TypeScript) quickly hit the limits. The question
> "When are higher-kinded types coming?" has been one of the most
> discussed TypeScript issues on GitHub since 2016 (#1213, over 500 reactions).

---

<!-- /depth -->
## Why isn't `<T>` enough?
<!-- section:summary -->
Let's look at the limits systematically:

<!-- depth:standard -->
Let's look at the limits systematically:

```typescript annotated
// LIMIT 1: Type parameters cannot themselves be generic
type Apply<F, A> = F<A>;
// ^^^ ERROR: "Type 'F' is not generic."
// F is a concrete type, not a type constructor!

// LIMIT 2: You can't express "same container, different content"
type SwapContent<Container, NewContent> = ???;
// SwapContent<Array<string>, number> should yield Array<number>
// But how? Container is already "Array<string>" — a concrete type.

// LIMIT 3: Abstracting over container kinds
interface Functor<F> {
  map<A, B>(fa: F<A>, fn: (a: A) => B): F<B>;
  // ^^^ ERROR: F is not generic
}
// In Haskell: class Functor f where fmap :: (a -> b) -> f a -> f b
// In TypeScript: not directly possible.
```

> 🧠 **Explain it to yourself:** Why isn't `<T>` alone enough when you
> need a type that is *itself* generic? What is the fundamental
> difference between `string` (a concrete type) and `Array` (a
> type constructor)?
>
> **Key points:** `string` is immediately usable | `Array` needs an
> argument (`Array<string>`) | A type parameter like `T` always stands for
> a concrete type, never for a type constructor | That's the limit

---

<!-- /depth -->
## What TypeScript offers instead
<!-- section:summary -->
TypeScript has found creative ways to work around some of these limits:

<!-- depth:standard -->
TypeScript has found creative ways to work around some of these limits:

```typescript annotated
// SOLUTION 1: Conditional types as "pattern matching"
type Unwrap<T> = T extends Array<infer U> ? U
               : T extends Promise<infer U> ? U
               : T extends Set<infer U> ? U
               : T;
// ^^^ Works, but: we have to enumerate EVERY container individually.
//     Not extensible — new containers mean new branches.

type A = Unwrap<string[]>;       // string
type B = Unwrap<Promise<number>>; // number
type C = Unwrap<Set<boolean>>;    // boolean

// SOLUTION 2: Mapped types + keyof for object-based generics
type MakeOptional<T> = { [K in keyof T]?: T[K] };
// ^^^ Powerful for object transformations — but doesn't help with containers.

// SOLUTION 3: Overloads for a finite set of containers
function unwrap(container: string[]): string;
function unwrap(container: number[]): number;
function unwrap(container: unknown[]): unknown {
  return container[0];
}
// ^^^ Works, but doesn't scale.
```

None of these workarounds is truly satisfying. Conditional types
are not extensible, mapped types only help with objects, and
overloads explode with many cases. This shows: there is a real
hole in the type system that we'll close in the next sections.

---

<!-- /depth -->
## When do you hit the limits in practice?
<!-- section:summary -->
Here are typical scenarios where simple generics aren't enough:

<!-- depth:standard -->
Here are typical scenarios where simple generics aren't enough:

```typescript annotated
// Scenario 1: Generic HTTP service
// You want a service that works with ANY HTTP client
// (HttpClient, fetch, axios) — but the container type varies.
interface HttpService<Client> {
  get<T>(url: string): ???; // What's the return type?
  // HttpClient.get → Observable<T>
  // fetch → Promise<T>
  // We need "the container of Client, but with T"
}
// ^^^ Simple generics can't express "the container type of Client".

// Scenario 2: Data pipeline
// You want a pipeline that can pass through various wrapper types
// — Array, Promise, Observable, etc.
// pipe(getData, transform, validate, save)
// Each step should stay in the same wrapper.

// Scenario 3: Testing framework
// Mock<T> should use the same container type as the original
// but with test implementations.
```

We'll be able to solve these scenarios with the techniques in the next sections.

---

> 🔬 **Experiment:** Try writing a generic container type that
> works with `Array<T>`, `Map<K,V>`, and `Set<T>`. How far
> can you get with simple generics?
>
> ```typescript
> // Your attempt:
> interface Container<T> {
>   // Which methods can all three containers have?
>   // How do you handle Map<K,V>, which has TWO type parameters?
> }
> ```
>
> You'll find: there's no common interface that type-safely represents all three
> containers — at least not with simple generics.

---

<!-- /depth -->
## The framework connection

> 🅰️ **Angular:** `HttpClient.get<T>(url)` is a simple generic —
> T says what type the response has. But what if you want to write a service
> that works with **any HTTP wrapper** — `HttpClient`,
> `fetch` wrapper, `axios` wrapper? You need an abstraction over
> "HTTP client as a concept", not a concrete client. That's exactly
> the higher-kinded types problem.
>
> ⚛️ **React:** `useState<T>()` returns `[T, SetStateAction<T>]`.
> Simple generic. But libraries like `react-query` use very advanced
> generics internally: `useQuery<TData, TError, TQueryKey>` with
> default type parameters and conditional types. The goal: maximum
> type inference with minimal manual annotation.

---

## The three pillars of advanced generics
<!-- section:summary -->
In the next five sections you'll learn the tools that go beyond

<!-- depth:standard -->
In the next five sections you'll learn the tools that go beyond
simple generics:

| Section | Concept | Why it matters |
|---|---|---|
| 02 | Higher-Order Types | Types that take types as parameters |
| 03 | Variance | When is `Container<Cat>` a `Container<Animal>`? |
| 04 | in/out modifier | Declare variance explicitly (TS 4.7) |
| 05 | Advanced constraints | Intersection, recursive, conditional |
| 06 | API design | When generics, when overloads, when unions |

---

> 🤔 **Think about it:** You've now seen that TypeScript has no
> higher-kinded types. But TypeScript's type system is still
> Turing-complete. So why hasn't the TypeScript team added HKTs?
> What trade-offs would HKTs bring?
>
> Think about: complexity for users, compile times, error messages,
> and the "JavaScript superset" claim.

---

<!-- /depth -->
## What you've learned

- Simple generics (`<T>`, `extends`, `keyof`) have **concrete limits**:
  type parameters cannot themselves be generic
- The core problem: you can't directly express "any container" or "same container,
  different content"
- TypeScript offers workarounds (conditional types, overloads, mapped types),
  but no native higher-kinded types
- Advanced generics encompass: higher-order types, variance, in/out modifiers,
  advanced constraints, and API design

> **Core concept:** The limit of simple generics is reached when you
> need "types over types" — when the type parameter itself would need to be generic.
> This is where advanced generics begins.

---

> ⏸️ **Pause point:** Good time for a short break.
> In the next section we'll look at how to *emulate* higher-order types
> in TypeScript — despite the lack of native HKT support.
>
> **Continue:** [Section 02 - Higher-Order Types →](./02-higher-order-types.md)