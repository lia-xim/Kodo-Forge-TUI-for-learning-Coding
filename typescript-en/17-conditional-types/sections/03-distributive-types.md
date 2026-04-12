# Section 3: Distributive Conditional Types — When Unions Split Apart

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - The infer Keyword](./02-infer-keyword.md)
> Next section: [04 - Recursive Conditional Types](./04-rekursive-conditional.md)

---

## What you'll learn here

- The surprising behavior of Conditional Types with union types
- What "distribution" means and why TypeScript works that way
- How to deliberately prevent distribution using the `[T]` technique
- The `never` special rule: why `never` always stays `never` with distribution
- How `Extract<T, U>` and `Exclude<T, U>` are built on distribution

---

## The Surprise

Let's start with an experiment. What do you think the following type returns?

```typescript
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string>;           // ?
type B = ToArray<string | number>;  // ?
```

Intuitively you'd expect: `(string | number)[]` — an array that contains either strings or numbers.

But TypeScript returns something different:

```typescript
type A = ToArray<string>;           // string[]          — as expected
type B = ToArray<string | number>;  // string[] | number[] — NOT (string | number)[]!
```

This is **distribution**: when the type parameter T is a union type, the Conditional Type is **evaluated separately for each union member** and the results are merged back into a union.

---

## Background: Why Does TypeScript Do This?

This sounds like a bug at first, but it's a deliberate design decision by Anders Hejlsberg and the TypeScript team.

The motivation comes from practice. Imagine you have `Extract<T, U>` — a utility type that keeps only the members from a union that match a certain type:

```typescript
type MyExtract<T, U> = T extends U ? T : never;
type A = MyExtract<string | number | boolean, string | number>; // ?
```

Without distribution, this would have to be `never` (because `string | number | boolean` as a whole is not `string | number`). That would be useless.

With distribution: TypeScript checks each member individually:
- `string extends string | number` → `string` (kept)
- `number extends string | number` → `number` (kept)
- `boolean extends string | number` → `never` (removed)
- Result: `string | number`

That's exactly the desired behavior. Distribution turns Conditional Types into a powerful tool for **filtering unions**.

The decision was a trade-off: yes, the behavior is surprising for newcomers. But it's what makes `Extract` and `Exclude` possible — and those are irreplaceable.

---

## Distribution Step by Step

```typescript annotated
type IsString<T> = T extends string ? "yes" : "no";

type Result = IsString<string | number>;
//
// TypeScript sees a union type parameter and distributes:
//
// Step 1: IsString<string>  → "yes"   (string extends string = true)
// Step 2: IsString<number>  → "no"    (number extends string = false)
//
// Both results are merged into a union:
// "yes" | "no"
//
// This is called: Distributive Conditional Type
```

Distribution happens **automatically** when two conditions are met:
1. T is a **naked type parameter** — i.e. `T`, not `T[]`, not `[T]`, not `Readonly<T>`
2. T is instantiated with a **union type**

---

## Annotated Code: Distribution in Action

```typescript annotated
// Distributive (naked type parameter):
type Wrap<T> = T extends any ? { value: T } : never;
//             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//             T is naked — distribution takes place

type A = Wrap<string | number>;
// Distribution:
// Wrap<string> = { value: string }
// Wrap<number> = { value: number }
// Result: { value: string } | { value: number }

// This is NOT equivalent to:
type WrongWrap = { value: string | number };
// { value: string } | { value: number } is broader!
// (The first does not accept mixed values)

// Non-distributive (T is wrapped in a tuple):
type WrapND<T> = [T] extends [any] ? { value: T } : never;
//              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//              [T] — T is no longer a naked parameter

type B = WrapND<string | number>;
// Distribution does NOT take place
// [string | number] extends [any] is checked as a WHOLE
// Result: { value: string | number }
```

---

## Preventing Distribution: The [T] Technique

There are situations where you want to check the union as a whole — not distributed. The technique: wrap T in a tuple:

```typescript annotated
// Uses distributive conditional types to check if T is exactly "string":
type IsExactlyString<T> = T extends string ? true : false;

type A = IsExactlyString<string>;        // true  — correct
type B = IsExactlyString<"hello">;       // true  — correct (literal is subtype)
type C = IsExactlyString<string | null>; // boolean  — WRONG! (true | false)
//                                        Distribution: string→true, null→false

// Non-distributive version:
type IsExactlyStringND<T> = [T] extends [string] ? true : false;
//                          ^^^         ^^^^^^
//                          Wrap both sides in tuples

type D = IsExactlyStringND<string>;        // true
type E = IsExactlyStringND<"hello">;       // true
type F = IsExactlyStringND<string | null>; // false  — CORRECT!
//                          [string | null] extends [string] is false
//                          because null is not a subtype of string
```

When do you need the `[T]` technique?
- When you want to check a union as an **atomic unit**
- When you want to build an `IsExactly<T, U>` type
- When you want to prevent `never` from "short-circuiting" the check (more on that next)

---

## The never Special Rule

`never` is in type theory the **empty set** — a union with no members. When TypeScript distributes over an empty union, there are no members to process. The result is always `never`:

```typescript annotated
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"
type C = IsString<never>;   // never  — NOT "no"!
//
// Why? Distribution over never:
// never = empty union = no members
// For each member of never: (no members!)
// Result: never (empty union)
```

This is counterintuitive: logically one might expect `never extends string` to yield `"no"`. But distribution turns this into "for no member": no result, so `never`.

To test `never` explicitly, you need the `[T]` technique:

```typescript annotated
// Correct IsNever implementation:
type IsNever<T> = [T] extends [never] ? true : false;
//           ^^^        ^^^^^^
//           No distribution! Check never as a whole.

type A = IsNever<never>;     // true   — correct
type B = IsNever<string>;    // false  — correct
type C = IsNever<0>;         // false  — correct

// The same with distribution would be wrong:
type IsNeverBroken<T> = T extends never ? true : false;
type D = IsNeverBroken<never>;  // never  — not "true"!
```

---

## Experiment: Understanding Extract Yourself

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> // Build Extract and Exclude yourself:
> type MyExtract<T, U> = T extends U ? T : never;
> type MyExclude<T, U> = T extends U ? never : T;
>
> type Animal = "dog" | "cat" | "fish" | "bird";
>
> // Which animals are "pet"-like?
> type Pet = MyExtract<Animal, "dog" | "cat">;
> // Expected: "dog" | "cat"
>
> // Which are NOT dogs?
> type NotDog = MyExclude<Animal, "dog">;
> // Expected: "cat" | "fish" | "bird"
>
> // What happens with never?
> type Nothing = MyExtract<Animal, never>;
> // Expected: ???
>
> // Hover over each type to see the result.
> // Try to explain why each result is the way it is.
> ```
>
> Change `Animal` and add new types. Observe how Extract and Exclude react automatically — that's distributive Conditional Types in action.

---

## Explain It to Yourself

> **Explain it to yourself:** What is the difference between `ToArray<string | number>` (yields `string[] | number[]`) and a type that yields `(string | number)[]`? In which case would which result be more useful?
> **Key points:** `string[] | number[]` — either a string array OR a number array (never mixed) | `(string | number)[]` — an array that can contain both | The former is more precise: a function that returns string[] can't add numbers to it afterward | The latter is more flexible: for adding mixed data

---

## In Your Angular Project: Type-Safe Event Filtering

```typescript annotated
// Angular Material has various event types.
// With distribution you can filter specifically:

type AllEvents =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "focus"; target: string }
  | { type: "blur"; target: string };

// Extract only mouse events:
type MouseEvent = Extract<AllEvents, { type: "click" }>;
// { type: "click"; x: number; y: number }

// Extract all focus events:
type FocusEvents = Extract<AllEvents, { type: "focus" | "blur" }>;
// { type: "focus"; target: string } | { type: "blur"; target: string }

// In the component:
@Component({ /* ... */ })
export class EventDemoComponent {
  handleMouseEvent(event: MouseEvent) {
    // TypeScript knows: event has x and y — no type-check needed!
    console.log(event.x, event.y);
  }

  handleFocus(event: FocusEvents) {
    // TypeScript knows: event has target
    console.log(event.target);
  }
}
```

---

## Think About It

> **Think about it:** Why is `string[] | number[]` more precise than `(string | number)[]`?
>
> **Answer:** `string[] | number[]` means: "Either an array containing ONLY strings, OR an array containing ONLY numbers." That's an **either-or** at the array level. `(string | number)[]` means: "An array containing arbitrarily mixed strings and numbers." The second is looser — a `(string | number)[]` array could contain `["hello", 42, "world"]`, which would not be allowed with `string[] | number[]`.
>
> In practice: when a function returns `string[] | number[]`, you know: you get either all strings or all numbers. That's a stronger guarantee, which helps when processing the data.

---

## What You Learned

- When T is a **naked type parameter** and a union, the Conditional Type is **distributed**: evaluated separately for each member
- Distribution happens automatically — no explicit opt-in needed
- `[T] extends [U]` prevents distribution: T is checked as an atomic unit
- `never extends X` always yields `never` with distribution (empty union has no members)
- `IsNever<T>` must use `[T] extends [never]` — not `T extends never`
- `Extract<T, U>` and `Exclude<T, U>` are distributive Conditional Types — that's their core

**Core concept:** Distribution is not a bug, it's a feature — it turns Conditional Types into filter tools for unions. When you want to take a union apart, use distribution. When you want to check a union as a whole, use `[T] extends [U]`.

---

> **Pause point** — Distribution is the conceptually hardest concept in Conditional Types. If it hasn't quite clicked yet, take a short break and re-read the `IsNever` examples. The click moment comes when you think of `never` as an "empty set."
>
> Continue with: [Section 04: Recursive Conditional Types](./04-rekursive-conditional.md)