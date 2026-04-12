# Section 2: Higher-Order Types

> Estimated reading time: **15 minutes**
>
> Previous section: [01 - Generics Recap & Limits](./01-generics-recap-und-grenzen.md)
> Next section: [03 - Understanding Variance](./03-varianz-verstehen.md)

---

## What you'll learn here

- What **Higher-Kinded Types** (HKTs) are — and why they differ from "Type Constructors"
- Why TypeScript has **no native HKTs** (and what that means)
- How the **URI-to-Kind pattern** works as a workaround
- That URI-to-Kind is just **one** of several solutions
- Where HKTs become relevant in practice (RxJS, fp-ts, generic abstractions)

---

## The conceptual problem: What IS a Higher-Kinded Type?
<!-- section:summary -->
Before we talk about code, we need a mental picture of what a
Higher-Kinded Type **actually** is.

<!-- depth:standard -->
Imagine you have different kinds of "tools":

**Level 0 — Values:**

These are the things you work with. `"hello"`, `42`, `true`.
Concrete data.

**Level 1 — Types:**

These are shapes for values. `string` describes all strings, `number`
describes all numbers. A type is a category of values.

**Level 2 — Type Constructors:**

A Type Constructor is a "shape" that isn't finished yet. `Array`
alone is not a type — `Array<string>` is. `Promise` alone is
nothing — `Promise<number>` is something. The constructor needs an argument:

```typescript
// Level 0: Values
const text = "hello";
const num = 42;

// Level 1: Types
let a: string = text;
let b: number = num;

// Level 2: Type Constructors
let c: Array<string> = ["hello"];
let d: Promise<number> = Promise.resolve(42);
// ^^^ Array and Promise are not types — they BECOME types
//     when you give them an argument.
```

**Level 3 — Higher-Kinded Types:**

Now it gets interesting. A Higher-Kinded Type is a type that
itself takes a **Type Constructor** as a parameter.

```typescript
// What we'd like to write:
interface Functor<F> {
  // F is NOT a concrete type here — F is a Type Constructor!
  // F could be Array, or Promise, or Option, or Set.
  map<A, B>(fa: F<A>, fn: (a: A) => B): F<B>;
}
// ^^^ F is the Higher-Kinded Type parameter.
//     It takes F (e.g. Array) and A (e.g. string) → F<A> becomes Array<string>.
```

---

### Three analogies that make this clear

**Analogy 1: Functions vs. Higher-Order Functions**

A normal function takes values:

```typescript
function add(x: number, y: number): number { return x + y; }
add(3, 5); // values as arguments
```

A Higher-Order Function takes other functions:

```typescript
function compose<A, B, C>(
  f: (x: B) => C,
  g: (x: A) => B
): (x: A) => C {
  return (x) => f(g(x));
}
compose(f, g); // functions as arguments
```

Now transfer that to types:

- **Normal types** take values and describe them (`string` describes `"hello"`)
- **Type Constructors** take types and produce new types (`Array<string>`)
- **Higher-Kinded Types** take Type Constructors as parameters (`Functor<Array>`)

**Analogy 2: Mathematical functions**

```
f(x) = x²          -- takes a number, returns a number   → "normal type"
g(f, x) = f(f(x))  -- takes A FUNCTION and a number      → "higher-kinded"
```

`g` can't just take "any value" — it needs something that
itself transforms. Likewise, a `Functor<F>` can't just take a type — it
needs a Type Constructor `F`.

**Analogy 3: Tools and tool holders**

```
A screwdriver          → needs a screw              → Type Constructor
A toolbox compartment  → needs A type of tool        → Higher-Kinded Type
```

The compartment doesn't need to know WHETHER it holds a flat-head or cross-head
screwdriver — it's abstract enough for BOTH. A `Functor<F>` doesn't need to
know whether `F` is an Array or Promise — it works for BOTH.

---

> 🧠 **Self-Explanation:** Why can't a normal `map` function abstract over
> "every container"? Why does it need to know whether to call
> `.map()` (Array), `.subscribe()` (Observable), or `.then()` (Promise)?
> What does that mean at the type level?
>
> **Key points:** At the value level, each container calls a DIFFERENT method |
> At the type level, we want ONE interface for ALL containers |
> That's only possible if we pass the container type itself as a parameter

---

<!-- /depth -->
## Why TypeScript has no native HKTs
<!-- section:summary -->
Other languages can do this — TypeScript can't. Why?

<!-- depth:standard -->
In languages with real HKT support you write:

```haskell
-- Haskell (since the 1990s)
class Functor f where
  fmap :: (a -> b) -> f a -> f b

-- f is a Higher-Kinded Type parameter.
-- The compiler knows: f has the "kind" (* -> *).
```

```scala
// Scala
trait Functor[F[_]] {
  def map[A, B](fa: F[A])(f: A => B): F[B]
}
// F[_] says: F is a Type Constructor that takes ONE argument.
```

```typescript
// TypeScript — THIS DOESN'T WORK:
interface Functor<F> {  // ERROR: F is not generic!
  map<A, B>(fa: F<A>, fn: (a: A) => B): F<B>;
}
// TypeScript only allows concrete types as type parameters.
// F<A> where F is a type parameter — that doesn't exist.
```

**Why not?** TypeScript was designed as a JavaScript superset, not
as an academic language. The type system must:

1. Be **backwards-compatible** with existing JavaScript
2. **Compile fast** — even with millions of lines
3. Deliver **understandable errors** — not "kind mismatch at type level"
4. Be **learnable** — most JS developers have no type theory background

A native HKT system would make all four points harder. The TypeScript team
deliberately decided against it — Issue #1213 has been open since 2014.

> 📖 **Historical background:**
>
> Haskell got HKTs officially in 2006 (via GHC 6.6), after the community
> had needed them since the 1990s. Scala had them from the start (2004).
> Both languages were built with academic type theory as a foundation.
>
> TypeScript (2012) had a different priority: migrating from JavaScript.
> Generics came in 2014, Conditional Types in 2018, Variadic Tuple Types in 2020.
> Each feature was evaluated pragmatically — HKTs were so far "too complex
> for the benefit."

---

> 🤔 **Think about it:** If TypeScript had HKTs, how would your
> daily work change? What could you write that isn't possible now?
>
> **Prompt:** Think about generic library interfaces, ORM abstractions,
> or test helpers that should work with "any container type."

---

<!-- /depth -->
## The workarounds: How the community emulates HKTs
<!-- section:summary -->
Because TypeScript has no native HKTs, clever developers have
invented workarounds. There are MULTIPLE approaches.

<!-- depth:standard -->
You saw in Section 1 that we wanted to write a `map` function
that works for both Array AND Set. Without HKTs that's not directly possible.
But we can **emulate** it.

### Workaround 1: Conditional Type Dispatch (simple, closed)

```typescript
type MapOver<Container, NewItem> =
  Container extends Array<any> ? Array<NewItem>
  : Container extends Set<any> ? Set<NewItem>
  : Container extends Promise<any> ? Promise<NewItem>
  : never;
// ^^^ Simple, but NOT extensible.
//     Every new container = a new branch.
//     You as a user can't add your own container.

type Test1 = MapOver<string[], number>;        // number[]
type Test2 = MapOver<Set<string>, boolean>;    // Set<boolean>
```

This is like a large `switch` statement at the type level. It works,
but you need to know every case upfront.

### Workaround 2: URI-to-Kind (extensible, the "fp-ts pattern")

This is the approach fp-ts uses. The idea is clever: instead of passing a
Type Constructor as a parameter, we use a **string** as a key and a **map**
that maps each key to a Type Constructor.

```typescript
// Step 1: A map from string keys to concrete types
interface URItoKind<A> {
  Array: Array<A>;      // "Array" → Array<A>
  Promise: Promise<A>;  // "Promise" → Promise<A>
  Set: Set<A>;          // "Set" → Set<A>
}
// ^^^ The interface is the "lookup map."
//     The string key stands for the Type Constructor.
//     A is passed through — that's why we get Array<A>, not Array.

// Step 2: All known URIs as a union
type URIS = keyof URItoKind<any>;
// URIS = "Array" | "Promise" | "Set"

// Step 3: The "Apply" type
type Kind<URI extends URIS, A> = URItoKind<A>[URI];
// ^^^ Kind<"Array", string> → Array<string>
//     Kind<"Promise", number> → Promise<number>
```

**Important to understand:** This is NOT the one true way. It is
_one_ solution. Other libraries do it differently.

---

> 🔬 **Inline experiment:** Open the TypeScript Playground and type:
>
> ```typescript
> interface URItoKind<A> {
>   Array: Array<A>;
> }
> type Kind<URI extends keyof URItoKind<any>, A> = URItoKind<A>[URI];
> type Result = Kind<"Array", string>;
> // ^^^ Hover over Result — what do you see?
> ```
>
> Now delete the interface and write `type Result = ???`.
> Without the map there's no way to use "Array" as a type.

---

<!-- /depth -->
## Practical example: Generic `map` with URI-to-Kind
<!-- section:summary -->
Now we can write the `map` function that wasn't possible in Section 1.

<!-- depth:standard -->
```typescript annotated
interface URItoKind<A> {
  Array: Array<A>;
  Set: Set<A>;
}
type URIS = keyof URItoKind<any>;
type Kind<URI extends URIS, A> = URItoKind<A>[URI];

// Abstract interface: "Any type that supports map"
interface Mappable<URI extends URIS> {
  map<A, B>(fa: Kind<URI, A>, fn: (a: A) => B): Kind<URI, B>;
}
// ^^^ Read it like this: "Take a container of URI type with content A,
//      transform with fn, return container of URI type with content B."
//      The URI stays the same — Array becomes Array, Set becomes Set.

// Concrete implementation for Array:
const arrayMappable: Mappable<"Array"> = {
  map: <A, B>(fa: A[], fn: (a: A) => B): B[] => fa.map(fn),
};

// Concrete implementation for Set:
const setMappable: Mappable<"Set"> = {
  map: <A, B>(fa: Set<A>, fn: (a: A) => B): Set<B> =>
    new Set([...fa].map(fn)),
};

// Usage:
const result1 = arrayMappable.map([1, 2, 3], x => x * 2);
// result1: number[]
const result2 = setMappable.map(new Set([1, 2, 3]), x => x.toString());
// result2: Set<string>
```

> 🧠 **Self-Explanation:** Why do we have to implement `arrayMappable` and
> `setMappable` separately? Why can't TypeScript generate that automatically?
>
> **Key points:** The type (URI-to-Kind) only says WHAT the container is |
> The implementation must KNOW how the container works |
> Array has `.map()`, Set needs `[...set].map()`, Promise needs `.then()` |
> Type emulation ≠ automatic implementation

---

<!-- /depth -->
## Extensibility: Declaration Merging
<!-- section:summary -->
The nice thing about the interface-map pattern: it's extensible! Thanks to

<!-- depth:standard -->
TypeScript's Declaration Merging, any file, module, or library can
register new containers:

```typescript annotated
// In your app:
interface URItoKind<A> {
  Array: Array<A>;
}

// In another file (e.g. rxjs-mapper.ts):
interface URItoKind<A> {
  Observable: Observable<A>;
}
// ^^^ Declaration Merging! TypeScript merges both declarations together.
//     URIS is now automatically "Array" | "Observable".

// An external module registers its own container:
interface URItoKind<A> {
  Either<L, A>: Either<L, A>;  // Two parameters!
}
// ^^^ That works too — with a second type parameter.
```

---

> 🔬 **Experiment:** Register your own `Maybe` container:
>
> ```typescript
> class Maybe<A> {
>   constructor(private value: A | null) {}
>   map<B>(fn: (a: A) => B): Maybe<B> {
>     return this.value !== null
>       ? new Maybe(fn(this.value))
>       : new Maybe<B>(null);
>   }
>   static of<A>(a: A): Maybe<A> { return new Maybe(a); }
> }
>
> interface URItoKind<A> {
>   Maybe: Maybe<A>;
> }
>
> // Test:
> type Test = Kind<"Maybe", string>;
> // ^^^ Should be Maybe<string> — hover to verify!
> ```

---

<!-- /depth -->
## Other approaches: URI-to-Kind isn't everything
<!-- section:summary -->
Not every library uses the URI pattern. Here are alternatives:

<!-- depth:standard -->
### Variant: Type Lambda Pattern (`@gcanti/fp-ts` v2 alternative)

Some libraries use an abstract "Type Lambda" structure:

```typescript
// Idea: every Type Constructor is a "function" A → F<A>
interface TypeLambda {
  readonly type: unknown; // F<A> is encoded as an opaque type
}

// Each container implements an interface:
interface ArrayHKT extends TypeLambda {
  type: Array<this["A"]>;
}
// ^^^ Instead of strings, the Type Constructor is encoded directly as an interface.
//     No string lookup, but slightly more complex to write.
```

### Variant: Structural HKTs (Type Classes via Constraints)

```typescript
// Instead of URIs, abstract over structure:
interface Mappable<T> {
  map<A, B>(fn: (a: A) => B): Mappable<B>;
}

// Works for anything that has .map():
function transform<T extends Mappable<any>>(container: T) {
  return container.map(x => x);
}
// ^^^ This is duck typing at the type level.
//     Weaker than real HKTs, but sufficient for many cases.
```

### Variant: Module Augmentation (Angular DI pattern)

Angular's Dependency Injection uses a similar idea:

```typescript
// InjectionToken<T> is a Type Constructor:
const USER_SERVICE = new InjectionToken<UserService>('UserService');
// InjectionToken<UserService> is the concrete type.

// inject<T>() infers T from the token:
const service = inject(USER_SERVICE);
// service: UserService — no explicit <UserService> needed.
```

This isn't an HKT in the academic sense, but the same principle:
an abstract mechanism that takes a Type Constructor as a parameter.

---

## Framework connection: Where HKTs appear in everyday work

> ⚛️ **React:** `ComponentPropsWithRef<T>` is a Higher-Order Type:
> it takes a component type T and extracts its props.
> Internally, React uses Conditional Types as an HKT substitute:
>
> ```typescript
> type ComponentPropsWithRef<T extends ElementType> =
>   T extends new (props: infer P) => any ? P & { ref?: Ref<InstanceType<T>> }
>   : T extends (props: infer P) => any ? P
>   : never;
> ```
>
> The `T` here is a Type Constructor — `ComponentPropsWithRef` takes
> a component type and returns a props type. That's HKT thinking,
> even if technically it uses Conditional Types.

> 🔭 **RxJS:** Operators like `pipe()` behave like HKTs:
>
> ```typescript
> const op = pipe(
>   filter(x => x > 0),      // Observable<T> → Observable<T>
>   map(x => x * 2),         // Observable<T> → Observable<U>
>   take(5),                 // Observable<T> → Observable<T>
> );
> ```
>
> Each operator is a "type function" that takes `Observable<T>` and
> returns `Observable<U>`. The `pipe` signature is essentially:
>
> ```typescript
> function pipe<A, B, C>(
>   op1: OperatorFunction<A, B>,
>   op2: OperatorFunction<B, C>
> ): OperatorFunction<A, C>;
> ```
>
> That's a Higher-Order Type pattern — even if RxJS doesn't call it that.

> 🅰️ **Angular:** The DI container uses `InjectionToken<T>` as a
> Type Constructor. The `inject<T>()` function infers T from the token.
> The same pattern: an abstract type that uses a Type Constructor
> as a parameter.

---

## What you've learned

- **Higher-Kinded Types** are types that take Type Constructors as parameters
  — analogous to Higher-Order Functions that take functions as parameters
- **Type Constructors** (`Array`, `Promise`, `Set`) are incomplete types
  that need an argument to become concrete
- TypeScript has **no native HKTs** because its type system was designed
  pragmatically — not academically
- The **URI-to-Kind pattern** is a workaround that uses strings as proxies for
  Type Constructors: `Kind<"Array", string>` instead of `Array<string>`
- **Conditional Type Dispatch** is the simpler alternative for
  closed sets of containers
- **Declaration Merging** makes the URI pattern extensible — any library
  can register new containers
- **RxJS operators**, **React props extraction**, and **Angular DI** all use
  HKT-like patterns, even if they don't call them that

> **Core concept:** HKTs are not exotic theory — they simply describe
> the pattern "type that takes a Type Constructor." TypeScript
> emulates this through indirection (URI-to-Kind) rather than supporting it natively.

---

> ⏸️ **Pause point:** Good time for a short break.
> The next section covers **Variance** — a fundamental concept that
> explains when `Container<Cat>` is a `Container<Animal>`
> (and when it isn't).
>
> **Continue:** [Section 03 - Understanding Variance →](./03-varianz-verstehen.md)