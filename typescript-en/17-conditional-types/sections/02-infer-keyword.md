# Section 2: The infer Keyword — Extracting Types from Types

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - The extends Condition](./01-extends-bedingung.md)
> Next section: [03 - Distributive Conditional Types](./03-distributive-types.md)

---

## What you'll learn here

- What `infer` means and what problem it solves
- How to use `infer` to extract return types, parameters, and array elements
- The most important built-in utility types (`ReturnType`, `Parameters`, `Awaited`) — and how they work internally
- Multiple `infer` variables in a single pattern

---

## The problem: types hiding in the dark

Imagine you receive a function from the outside — from a library, another team, or auto-generated code. You know what the function does, but you don't know its return type by heart. You want to reuse that return type in your code — without importing the library or manually reconstructing the type.

```typescript
// A function from a library — you don't know the return type by heart:
function createSession(userId: string, role: "admin" | "user") {
  return {
    id: Math.random().toString(36),
    userId,
    role,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600_000),
  };
}

// You want: type Session = ???
// You could copy the type manually, but that's error-prone.
// If the function changes, the type needs to be updated too.
```

The elegant solution: tell TypeScript to figure out the return type itself. That's exactly what `infer` is for.

---

## Background: the birth of infer

`infer` was introduced together with conditional types in TypeScript 2.8. The team faced a design problem: conditional types allow you to ask "Is T an array?" — but how do you get the **element type of the array** without having to specify it explicitly?

The original idea was to be able to bind type variables on the right-hand sides of conditional types. The keyword `infer` (meaning "to deduce", "to conclude") expresses what TypeScript does: it **infers the type** from context.

The name was actually controversial. Alternatives like `bind`, `capture`, or `let` were discussed. `infer` won because it most clearly describes what happens: the compiler infers (deduces) the type.

Without `infer`, `ReturnType<T>`, `Parameters<T>`, `Awaited<T>` would not have existed — or they would have had to rely on hacks using `any`.

---

## The core idea: infer as a placeholder

```typescript annotated
type UnpackArray<T> = T extends (infer U)[]
//                                     ^
//                              infer U: "If T is an array of SOMETHING,
//                              call that SOMETHING U"
  ? U      // Return U (the element type)
  : T;     // T is not an array: return T directly

type A = UnpackArray<string[]>;    // string  — U was inferred as string
type B = UnpackArray<number[]>;    // number  — U was inferred as number
type C = UnpackArray<boolean[][]>; // boolean[] — only one level unpacked
type D = UnpackArray<string>;      // string  — not an array, else branch
```

Think of `infer U` as a "placeholder name": TypeScript fills it in as soon as it has matched the pattern. U is not a type you provide — it's a type TypeScript **discovers**.

---

## Annotated code: infer in various positions

```typescript annotated
// 1. Extract return type (this is how ReturnType<T> is implemented):
type MyReturnType<T> =
  T extends (...args: any[]) => infer R
  //        ^^^^^^^^^^^^^^^^^^^^^^^^^^
  //        Pattern: "Any function that returns something"
  //                                                      ^
  //                                              infer R: the return type
  ? R       // Return the return type
  : never;  // T is not a function

type A = MyReturnType<() => string>;           // string
type B = MyReturnType<(x: number) => boolean>; // boolean
type C = MyReturnType<string>;                 // never

// 2. Extract parameters (this is how Parameters<T> is implemented):
type MyParameters<T> =
  T extends (...args: infer P) => any
  //                       ^
  //              infer P: all parameters as a tuple
  ? P
  : never;

type D = MyParameters<(a: string, b: number) => void>; // [a: string, b: number]
type E = MyParameters<() => void>;                     // []

// 3. Extract Promise contents:
type UnpackPromise<T> =
  T extends Promise<infer U>
  //                      ^
  //              infer U: the type inside the Promise
  ? U
  : T;

type F = UnpackPromise<Promise<string>>; // string
type G = UnpackPromise<Promise<number>>; // number
type H = UnpackPromise<string>;          // string (not a Promise, else branch)
```

---

## The built-in utility types — under the hood

TypeScript ships several utility types that are built with `infer`. You may have used them already without knowing how they work:

```typescript annotated
// ReturnType<T> — from the TypeScript standard library:
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
//                                    ^^^
//                           infer R: the return type is "captured"

// Parameters<T> — from the TypeScript standard library:
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
//                           ^
//              infer P: the parameter tuple is "captured"

// Awaited<T> — slightly simplified (TS 4.5, correct version is recursive):
type Awaited<T> =
  T extends null | undefined ? T :           // pass through null/undefined
  T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
  //                                                        ^
  //                                  infer F: the callback type of the then() method
    ? F extends ((value: infer V, ...args: infer _) => any)
      ? Awaited<V>   // Recursive: the resolved value
      : never
    : T;             // Not a thenable: return directly
```

The real `Awaited<T>` is more complex than `T extends Promise<infer U> ? U : T`, because it doesn't just unwrap real Promises, but all **thenables** (objects with a `then` method) — which is the definition of a Promise-compatible object in JavaScript.

---

## Multiple infer in a single pattern

You can use multiple `infer` variables in a single conditional type:

```typescript annotated
// Extract all three parts of a function at once:
type FunctionSignature<T> =
  T extends (a: infer A, b: infer B) => infer R
  //                  ^            ^          ^
  //              First param   Second     Return
  ? {
      firstParam: A;
      secondParam: B;
      returnType: R;
    }
  : never;

function login(username: string, password: string): { token: string; userId: number } {
  return { token: "abc", userId: 1 };
}

type Sig = FunctionSignature<typeof login>;
// {
//   firstParam: string;
//   secondParam: string;
//   returnType: { token: string; userId: number };
// }
```

This is especially useful when you want to extract type metadata from functions — for example to build automatically generated wrappers or proxy types.

---

## Experiment: Build your own ReturnType

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> // Build your own ReturnType:
> type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
>
> function calculate(x: number, y: number): { sum: number; product: number } {
>   return { sum: x + y, product: x * y };
> }
>
> type Result = MyReturnType<typeof calculate>;
> // Hover over Result — what do you see?
>
> // Now change the function:
> function calculateString(x: number): string {
>   return x.toString();
> }
>
> type ResultString = MyReturnType<typeof calculateString>;
> // What changes?
>
> // Bonus: What happens if you pass something that isn't a function?
> type ResultNoFunction = MyReturnType<string>;
> ```
>
> Change the function and observe how the type updates automatically. This is the core benefit of `infer`: types stay in sync with the code, without manual upkeep.

---

## Explain it to yourself

> **Explain it to yourself:** Why does `UnpackPromise<string>` return `string` (not `never`), even though `string` is not a Promise?
> **Key points:** In the else branch (`T extends Promise<infer U> ? U : T`), T itself is returned | This is a design decision: "If not a Promise, pass through" | Alternatively, one could return never — but pass-through is more useful for many use cases (e.g. in recursive types)

---

## In React: automatically extracting component props

```typescript annotated
// React component — props type unknown or from a library:
import type { ComponentProps, ComponentType } from "react";

// ComponentProps<T> is built with infer:
// type ComponentProps<T> = T extends ComponentType<infer P> ? P : never;

// How you use it in practice:
import { DatePicker } from "some-ui-library"; // Props type not exported

type DatePickerProps = ComponentProps<typeof DatePicker>;
// TypeScript infers the props automatically — no manual reconstruction!

// Your own wrapper interface that extends the props:
type MyDatePickerProps = DatePickerProps & {
  onDateChange: (iso: string) => void;
  label: string;
};
```

This is a pattern that comes up frequently in large React projects: you wrap a third-party component and want to extend its props without copying the type manually.

---

## Think about it

> **Think about it:** `ReturnType<T>` uses `infer R` to capture the return type. Why do you need `infer` for this? Couldn't you just write: `type ReturnType<T extends () => any> = ???`?
>
> **Answer:** Without `infer`, there would be no way to **name** the return type and then return it. You could check whether T is a function — but to extract the return type, you need a mechanism that says "capture this part of the pattern and give it a name". That's exactly what `infer` does. Without `infer`, there would be no way to pull out parts of a complex type — you could only check whether a type matches a pattern, but not extract anything from it.

---

## What you've learned

- `infer U` declares a **type variable in the pattern** of a conditional type — TypeScript fills it in
- `infer` works in any position: return type, parameters, array elements, Promise contents, and more
- The most important built-in utility types (`ReturnType`, `Parameters`, `Awaited`) are all built with `infer`
- Multiple `infer` variables in a single pattern are possible
- `infer` makes types **maintainable**: they stay in sync with the code

**Core concept:** `infer` is the mechanism for "peeling" types out of other types. Where `extends` checks, **`infer` discovers**. Together they enable type transformations that would otherwise be impossible.

---

## Quick reference: common infer patterns

| What you want to extract | Pattern |
|--------------------------|---------|
| Return type of a function | `T extends (...args: any) => infer R ? R : never` |
| All parameters as a tuple | `T extends (...args: infer P) => any ? P : never` |
| Promise contents | `T extends Promise<infer U> ? U : T` |
| Array element type | `T extends (infer U)[] ? U : never` |
| First tuple element | `T extends [infer F, ...any[]] ? F : never` |

These patterns form the foundation of the TypeScript standard library. Once you understand them, you can rebuild any `ReturnType` and any `Parameters` — and write your own variants.

---

> **Pause point** — You now have two of the three central concepts: the `extends` condition and `infer`. The third concept — distribution over unions — is conceptually surprising and changes everything.
>
> Continue with: [Section 03: Distributive Conditional Types](./03-distributive-types.md)