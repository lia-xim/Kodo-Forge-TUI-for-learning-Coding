# Section 4: Pattern Matching with Conditional Types and infer

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - String Parsing at the Type Level](./03-string-parsing-auf-type-level.md)
> Next section: [05 - Recursive Type Challenges](./05-recursive-type-challenges.md)

---

## What you'll learn here

- How **pattern matching** works at the type level — deep understanding of `infer`
- **Multiple `infer`** in a single conditional type
- **`infer` with constraints**: `infer X extends string` (since TypeScript 4.7)
- Advanced patterns: type unpacking, function decomposition, promise unwrapping

---

## Pattern Matching: The Core Idea

In languages like Rust or Haskell, pattern matching is a central
feature: you describe the **shape** of a value, and the language
breaks it apart for you. TypeScript has the same thing at the type level:

```typescript annotated
// Pattern matching on a function type:
type DecomposeFunction<T> =
  T extends (first: infer A, ...rest: infer B) => infer R
    // ^ Pattern: "Something that looks like a function"
    // ^ infer A: first parameter
    // ^ infer B: remaining parameters as a tuple
    // ^ infer R: return type
    ? { firstParam: A; restParams: B; returnType: R }
    : never;

type D = DecomposeFunction<(name: string, age: number, active: boolean) => void>;
// ^ { firstParam: string; restParams: [age: number, active: boolean]; returnType: void }
```

Compare this to JavaScript destructuring:

```typescript
// Value level: destructuring a function doesn't exist directly.
// But pattern matching in Python (3.10+):
// match value:
//   case (first, *rest): ...

// TypeScript type level is conceptually the same — just on types:
// T extends (first: infer A, ...rest: infer B) => infer R
// The "pattern" describes the expected shape, infer "captures" parts.
```

> 📖 **Background: infer as a Pattern Variable and Unification**
>
> The `infer` keyword was introduced in TypeScript 2.8 (2018),
> alongside conditional types. It was inspired by pattern
> matching in ML languages (OCaml, F#) — where you
> "destructure" values with patterns. In TypeScript's case, `infer` is a
> **type variable that is bound at compile time**. The compiler
> tries to "match" the type so that the infer variables are
> assigned consistently. This is essentially **unification** —
> the same algorithm used by Prolog and Haskell's type checker.
>
> Unification works like this: given `T = (x: string) => number`
> and the pattern `(x: infer A) => infer R`, the compiler tries
> to assign `A = string` and `R = number`. If a consistent
> assignment exists, the pattern matches — and the infer variables have
> their values. This happens for every single conditional type
> evaluation in the background, invisibly.

---

## Multiple infer: Complex Destructuring

You can use as many `infer` variables as you want in a single pattern:

```typescript annotated
// Break apart a Promise<Result<T, E>> into its parts:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type UnwrapPromiseResult<T> =
  T extends Promise<infer Inner>           // Is it a Promise?
    ? Inner extends Result<infer V, infer E>  // Does it contain a Result?
      ? { value: V; error: E }              // Both extracted!
      : { value: Inner; error: never }      // Promise without Result
    : never;

type A = UnwrapPromiseResult<Promise<Result<string, Error>>>;
// ^ { value: string; error: Error }

type B = UnwrapPromiseResult<Promise<number>>;
// ^ { value: number; error: never }
```

### infer with Constraints (TypeScript 4.7+)

Since TS 4.7, you can constrain `infer` variables:

```typescript annotated
// Extract only string keys from an object:
type StringKeyOf<T> =
  keyof T extends infer K extends string
    // ^ K is inferred AND must be a string
    ? K
    : never;

type Keys = StringKeyOf<{ name: string; age: number; 0: boolean }>;
// ^ "name" | "age" (0 is a number, excluded)

// Extract the event type from a handler:
type EventType<Handler> =
  Handler extends (event: infer E extends Event) => void
    // ^ E must be an Event
    ? E
    : never;

type Click = EventType<(event: MouseEvent) => void>;
// ^ MouseEvent
type NotAnEvent = EventType<(x: string) => void>;
// ^ never (string extends Event is false)
```

> 🧠 **Explain it to yourself:** What is the advantage of
> `infer K extends string` over `infer K` followed by
> `K extends string ? K : never`? Is there a semantic
> difference?
> **Key points:** No semantic difference, but shorter code |
> The constraint is checked directly during inference | Better
> compiler error messages | Less nested conditional types

---

## Advanced Patterns

### Pattern 1: Recursive Unwrapping

```typescript annotated
// Unwrap arbitrarily deeply nested Promises:
type DeepAwaited<T> =
  T extends Promise<infer Inner>  // Is it a Promise?
    ? DeepAwaited<Inner>          // Yes → recurse
    : T;                           // No → base type found

type D1 = DeepAwaited<Promise<Promise<Promise<string>>>>;
// ^ string (three layers removed)

// This is essentially what Awaited<T> does (since TS 4.5):
type D2 = Awaited<Promise<Promise<string>>>;
// ^ string
```

### Pattern 2: Tuple Operations

```typescript annotated
// First and last element of a tuple:
type First<T extends unknown[]> =
  T extends [infer F, ...unknown[]] ? F : never;

type Last<T extends unknown[]> =
  T extends [...unknown[], infer L] ? L : never;

// Tuple without the first element (Tail):
type Tail<T extends unknown[]> =
  T extends [unknown, ...infer Rest] ? Rest : [];

// Tuple without the last element (Init):
type Init<T extends unknown[]> =
  T extends [...infer Rest, unknown] ? Rest : [];

type F = First<[1, 2, 3]>;   // 1
type L = Last<[1, 2, 3]>;    // 3
type T = Tail<[1, 2, 3]>;    // [2, 3]
type I = Init<[1, 2, 3]>;    // [1, 2]
```

### Pattern 3: Object Transformation

```typescript annotated
// Extract all methods from an object:
type MethodsOf<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
  // ^ Key remapping (as): keep only keys whose value is a function
};

interface UserService {
  name: string;
  getUser(id: number): Promise<User>;
  deleteUser(id: number): Promise<void>;
  readonly version: number;
}

type Methods = MethodsOf<UserService>;
// ^ { getUser(id: number): Promise<User>; deleteUser(id: number): Promise<void> }
```

> ⚡ **Angular framework connection:** Angular's `inject()` uses pattern
> matching internally to extract the type from an `InjectionToken<T>`:
> `inject(HttpClient)` returns `HttpClient`
> because the compiler infers the type from the class constructor parameter:
>
> ```typescript
> // Angular's inject() — simplified type definition:
> declare function inject<T>(token: Type<T> | InjectionToken<T>): T;
> // ^ T is inferred through pattern matching from the token
>
> const http = inject(HttpClient);   // T = HttpClient
> const token = new InjectionToken<string>("MY_TOKEN");
> const value = inject(token);       // T = string
> ```
>
> The pattern `token: Type<T> | InjectionToken<T>` is the pattern
> the compiler "matches" — `T` is the infer variable.

> ⚡ **React framework connection:** React's `useContext` does the same
> with the `Context<T>` type:
>
> ```typescript
> // React's useContext() — simplified type definition:
> declare function useContext<T>(context: React.Context<T>): T;
> // ^ T is inferred from the Context type
>
> const ThemeContext = createContext<"light" | "dark">("light");
> const theme = useContext(ThemeContext);  // "light" | "dark"
> ```
>
> Both — Angular `inject()` and React `useContext()` — are
> examples of type-level pattern matching that you already use
> every day without noticing it.

> 💭 **Thought question:** Why is pattern matching at the type level
> more powerful than simple type constraints (`T extends SomeType`)?
> What can pattern matching do that constraints cannot?
>
> **Answer:** Constraints only check whether a type "fits". Pattern
> matching can **decompose** the type and extract parts. The
> difference is like `instanceof` (checks) vs destructuring
> (checks and extracts). `infer` is the destructuring of the
> type system.

---

## Experiment: Event System with Pattern Matching

Build a type-safe event system that maps event names to payloads:

```typescript
// Event map defines which events carry which data:
interface EventMap {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "item:added": { itemId: string; quantity: number };
}

// Extract the namespace from an event name:
type EventNamespace<E extends string> =
  E extends `${infer NS}:${string}` ? NS : never;

type NS = EventNamespace<"user:login">;  // "user"

// All events of a namespace:
type EventsOf<NS extends string, Map = EventMap> = {
  [K in keyof Map as K extends `${NS}:${string}` ? K : never]: Map[K];
};

type UserEvents = EventsOf<"user">;
// ^ { "user:login": {...}; "user:logout": {...} }

// Experiment: Build an emit() type that enforces the payload based on
// the event name:
// function emit<E extends keyof EventMap>(event: E, payload: EventMap[E]): void;
// emit("user:login", { userId: "123", timestamp: Date.now() }); // OK
// emit("user:login", { itemId: "x" }); // ERROR!
```

---

## Developing Pattern Matching Step by Step

A practical example of how to solve a pattern matching problem step
by step — the "first like this... then like this... finally"-principle:

```typescript annotated
// Task: Extract the value type from an RxJS Observable
// (or a similar wrapper type)

// Step 1: Simple version — only one level deep
type UnwrapSimple<T> =
  T extends Observable<infer V> ? V : T;

// Step 2: What if it's not an Observable?
// UnwrapSimple<string> → string  (good, passthrough)
// UnwrapSimple<Observable<string>> → string  (good)

// Step 3: What about nested Observables?
// Observable<Observable<string>>? Unusual, but...
type UnwrapDeep<T> =
  T extends Observable<infer V>
    ? UnwrapDeep<V>  // Recursion!
    : T;

// Step 4: What if T is an array of Observables?
type UnwrapAll<T> =
  T extends Observable<infer V>
    ? UnwrapDeep<V>
    : T extends Array<infer Item>
      ? Array<UnwrapAll<Item>>  // Search arrays too
      : T;

// Step 5: Refine with infer constraints (TS 4.7+):
type UnwrapSafe<T> =
  T extends Observable<infer V extends object>  // Only unwrap objects
    ? V
    : T;
```

> 💭 **Thought question:** What is the advantage of developing pattern
> matching step by step rather than writing the final solution right away?
>
> **Answer:** Type errors in type-level code are notoriously hard
> to debug — you have no `console.log`. When you develop step by step,
> you can test after each step whether the types are correct
> (by hovering in the editor). The code also becomes
> more maintainable because each stage has a clear purpose.

---

## What you learned

- **Pattern matching** with `infer` is TypeScript's equivalent to destructuring at the type level
- **Multiple `infer`** allows complex decomposition in a single conditional type
- **`infer` with constraints** (TS 4.7+) combines inference and type restriction
- Advanced patterns: recursive unwrapping, tuple operations, object transformation
- Developing pattern matching step by step — each step testable before moving to the next
- Pattern matching is the foundation for type-safe APIs in Angular `inject()` and React `useContext()`

> 🧠 **Explain it to yourself:** Compare pattern matching in JavaScript
> (destructuring: `const { a, b } = obj`) with pattern matching in
> TypeScript's type system (`T extends { a: infer A, b: infer B }`).
> What are the similarities, what are the differences?
> **Key points:** Both "decompose" a structure | JS destructuring
> at runtime, TS pattern matching at compile time | JS can only go
> one level deep, TS can match recursively | JS has defaults, TS has
> the else branch (`: never`) | TS pattern matching is based on
> unification — an algorithm that assigns type variables consistently

**Core concept to remember:** `infer` is the most powerful single keyword in the type system. It transforms conditional types from "check whether" to "check and extract" — that's the difference between `instanceof` and destructuring. You're already using `infer` indirectly in every `inject()` and `useContext()` call.

---

> **Pause point** — Pattern matching is understood. Now
> we combine everything into recursive type challenges.
>
> Continue with: [Section 05: Recursive Type Challenges](./05-recursive-type-challenges.md)