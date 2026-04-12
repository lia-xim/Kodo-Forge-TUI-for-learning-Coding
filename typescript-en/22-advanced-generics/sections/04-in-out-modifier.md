# Section 4: in/out Modifiers (TS 4.7)

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Understanding Variance](./03-varianz-verstehen.md)
> Next section: [05 - Advanced Constraints](./05-fortgeschrittene-constraints.md)

---

## What you'll learn here

- The `out` annotation for **covariance** and `in` for **contravariance**
- When and why to use `in out` for **invariance**
- How the modifiers **improve performance** (no structural variance computation)
- The relationship to C#'s `in`/`out` and why TypeScript adopted them

---

## The Problem: Implicit Variance
<!-- section:summary -->
In section 3 you learned that variance depends on WHERE a

<!-- depth:standard -->
In section 3 you learned that variance depends on WHERE a
type parameter is used. TypeScript computes this automatically:

```typescript annotated
interface Producer<T> {
  get(): T;          // T in Output → covariant
}

interface Consumer<T> {
  accept(item: T): void;  // T in Input → contravariant
}

interface MutableBox<T> {
  get(): T;            // Output → covariant
  set(value: T): void; // Input → contravariant
  // ^^^ Together: invariant
}
// TypeScript computes variance STRUCTURALLY:
// It looks at each member and checks where T appears.
```

This works, but has two drawbacks:

1. **Performance:** For complex types with many members, structural
   computation is expensive. TypeScript has to check EVERY member.
2. **Clarity:** The interface doesn't show what variance it has.
   You have to analyze the entire type.

---

> 📖 **Background: From C# to TypeScript**
>
> C# 4.0 (April 2010) introduced `in`/`out` modifiers for generic
> interfaces and delegates. Anders Hejlsberg — who designed both C# and
> TypeScript — adopted the idea 12 years later for
> TypeScript 4.7 (May 2022).
>
> In C# the motivation was clear: `IEnumerable<out T>` (covariant) vs
> `IComparer<in T>` (contravariant). The modifiers made code safer
> and intent clearer. In TypeScript an additional advantage emerged:
> performance. Since TypeScript's type system is structural (not nominal
> like C#), variance normally has to be recomputed for each comparison.
> With explicit modifiers that overhead disappears.
>
> The TypeScript 4.7 release blog called the modifiers "optional variance
> annotations" — optional, because TypeScript can compute variance without
> them. But with them it's faster and clearer.

---

<!-- /depth -->
## The Syntax: `out` for Covariance
<!-- section:summary -->
The `out` modifier declares: "This type parameter only

<!-- depth:standard -->
```typescript annotated
// WITHOUT modifier (works, but implicit):
interface ProducerOld<T> {
  get(): T;
}

// WITH modifier (explicit and checked):
interface Producer<out T> {
  get(): T;
}
// ^^^ "out T" says: T only appears in OUTPUT position.
//     TypeScript CHECKS this! If you use T in input position:

interface BadProducer<out T> {
  get(): T;
  set(value: T): void; // ERROR! T in input position violates "out"
}
// ^^^ TypeScript gives an error:
//     "Type 'T' is not assignable to type 'T'.
//      Variance annotations must match the variance
//      of the type parameter."
```

The `out` modifier declares: "This type parameter is only
**produced**. The type is covariant in T."

---

<!-- /depth -->
## The Syntax: `in` for Contravariance

```typescript annotated
// Contravariant: T only appears in INPUT position.
interface Consumer<in T> {
  accept(item: T): void;   // OK: T in parameter (input)
  process(item: T): boolean; // OK: T in parameter (input)
}

// What's NOT allowed:
interface BadConsumer<in T> {
  accept(item: T): void;
  get(): T;  // ERROR! T in output position violates "in"
}
// ^^^ "in T" says: T is only CONSUMED, never PRODUCED.
```

---

## Invariance: `in out` Together

```typescript annotated
// Invariant: T is both read AND written.
interface MutableBox<in out T> {
  get(): T;             // Output
  set(value: T): void;  // Input
}
// ^^^ "in out T" says explicitly: This type is invariant.
//     MutableBox<Cat> is NOT assignable to MutableBox<Animal>.

// What happens if we use "out" with MutableBox?
interface WrongBox<out T> {
  get(): T;
  set(value: T): void; // ERROR! T in input position.
}
// ^^^ TypeScript enforces the annotation!
```

> 🧠 **Explain it to yourself:** Why is `interface Producer<out T>` covariant?
> Think about where T appears: `get(): T`. T is the return type — output position.
> A Producer<Cat> produces cats. Wherever an animal is expected,
> a cat is acceptable. So: Producer<Cat> extends Producer<Animal>.
>
> **Key points:** `out` = Output = return type | Covariance = subtype direction
> preserved | Producer<Cat> "fits" into Producer<Animal> because a cat is an animal

---

> 🤔 **Think about it:** Can a type parameter be both `in` and `out` at the same time?
> What would that mean?
>
> Yes! `<in out T>` is valid syntax and declares invariance.
> It means: T is both read and written. No
> subtype relationship in either direction.

---

## Performance Benefits
<!-- section:summary -->
The modifiers aren't just for clarity — they improve

<!-- depth:standard -->
The modifiers aren't just for clarity — they improve
compile performance:

```typescript annotated
// WITHOUT modifier:
interface BigInterface<T> {
  method1(): T;
  method2(): T;
  method3(callback: (item: T) => void): void;
  method4(): { nested: T };
  method5(arr: T[]): T;
  // ... 20 more members
}
// ^^^ TypeScript has to check EVERY member to compute variance.
//     With 20+ members and nested types this is expensive.

// WITH modifier:
interface BigInterface<in out T> {
  method1(): T;
  method2(): T;
  method3(callback: (item: T) => void): void;
  method4(): { nested: T };
  method5(arr: T[]): T;
  // ... 20 more members
}
// ^^^ TypeScript reads the annotation: "invariant". Done.
//     No structural analysis needed.
//     In large projects: measurable compile-time improvements.
```

---

> 🔬 **Experiment:** Add `out` to an interface that both reads and writes T.
> What happens?
>
> ```typescript
> interface StateContainer<out T> {
>   getState(): T;
>   setState(newState: T): void; // What does TypeScript say?
> }
> ```
>
> TypeScript gives an error: T in `setState` is in input position,
> but `out` only allows output. Solution: Either use `in out T` or
> remove `setState`.

---

<!-- /depth -->
## Practical Example: ReadonlyArray vs Array

```typescript annotated
// ReadonlyArray is NATURALLY covariant:
// It only has read methods — T only appears in output position.
interface ReadonlyArray<out T> {
  readonly length: number;
  [index: number]: T;          // Read only
  map<U>(fn: (item: T) => U): U[];
  filter(fn: (item: T) => boolean): T[];
  // No push(), no splice() — no input!
}

// Array would be INVARIANT (read + write):
interface MutableArray<in out T> {
  [index: number]: T;
  push(item: T): number;       // Input
  pop(): T | undefined;         // Output
  map<U>(fn: (item: T) => U): U[];  // Output
}

// TypeScript's built-in Array<T> has NO modifier —
// it is implicitly invariant, but TypeScript allows covariant
// assignments (the well-known "unsoundness").
```

---

## When to Use Modifiers?
<!-- section:summary -->
| Library/API | Always use modifiers — clarity and performance |

<!-- depth:standard -->
| Situation | Recommendation |
|---|---|
| Library/API | Always use modifiers — clarity and performance |
| Internal code | Optional, but helpful for complex types |
| Existing code | Retrofit where possible — improves compile time |
| Readonly types | `out T` — they are naturally covariant |
| Mutable types | `in out T` — explicitly invariant |
| Handlers/Callbacks | `in T` — they consume T |

---

<!-- /depth -->
## The Framework Connection

> 🅰️ **Angular:** `ReadonlyArray<T>` is naturally covariant (`out T`).
> Angular's `WritableSignal<T>` (Angular 16+) would be invariant — you read
> AND write the signal value. A `WritableSignal<Cat>` cannot be
> assigned to a `WritableSignal<Animal>`. In contrast, a
> `Signal<T>` (readonly) would be covariant: `Signal<Cat>` is a `Signal<Animal>`.
>
> ⚛️ **React:** `Dispatch<SetStateAction<T>>` from `useState` is
> contravariant in T — it takes T as input. `T` itself in the
> state is invariant (read + write). This explains why
> `useState<Animal>` is not directly compatible with `useState<Cat>`.

---

## Summary of Modifier Syntax

```typescript
// Covariant: output only
interface Producer<out T> { get(): T; }

// Contravariant: input only
interface Consumer<in T> { accept(item: T): void; }

// Invariant: both
interface Box<in out T> { get(): T; set(value: T): void; }

// Multiple type parameters:
interface Transform<in A, out B> { run(input: A): B; }
// ^^^ A is contravariant (input), B is covariant (output).
//     Transform<Animal, Cat> extends Transform<Cat, Animal>!
```

---

## What you've learned

- **`out T`** declares covariance — T only appears in output position.
  TypeScript checks and enforces this.
- **`in T`** declares contravariance — T only appears in input position.
- **`in out T`** declares invariance — T in both positions.
- The modifiers improve **performance** (no structural computation)
  and **clarity** (variance is immediately visible).
- Inspired by **C# 4.0** (2010), introduced in **TypeScript 4.7** (2022).
- Different type parameters can have different modifiers:
  `<in A, out B>`.

> **Core concept:** `in`/`out` modifiers are variance ANNOTATIONS, not
> behavior changes. TypeScript computes variance anyway — the
> modifiers make the intent explicit and speed up the compiler.

---

> ⏸️ **Pause point:** Good time for a short break.
> The next section covers **advanced constraints**:
> intersection constraints, recursive constraints, and distributive
> behavior with conditional types.
>
> **Continue:** [Section 05 - Advanced Constraints →](./05-fortgeschrittene-constraints.md)