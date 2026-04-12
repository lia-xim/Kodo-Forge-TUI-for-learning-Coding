# Section 5: Practical Patterns — Conditional Types in Real Code

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Recursive Conditional Types](./04-rekursive-conditional.md)

---

## What you'll learn here

- How to combine Conditional Types with Mapped Types (the most powerful pattern)
- Type-safe API responses and event handlers
- When Conditional Types go too far — and how to draw boundaries
- Performance considerations and when the compiler complains
- A synthesis of all concepts from this lesson

---

## From Theory to Practice

The previous sections explained the mechanics. This section shows the patterns that appear again and again in real projects. Three core questions guide us:

1. How do I combine Conditional Types with other type system features?
2. Where do you draw the line between useful type safety and overly complex code?
3. What happens when TypeScript itself starts to struggle?

---

## Background: TypeScript as a Turing-Complete Type System

A surprising fact: The TypeScript type system (with Conditional Types, Mapped Types, and Template Literals) is **Turing-complete**. This means: any computable function can theoretically be implemented at the type level.

This was proven by the community in 2019. Developers implemented Fibonacci numbers, Brainfuck interpreters, and even a simple lambda calculus at the type level — using only TypeScript types, without a single byte of runtime code.

This is a double-edged sword. On one hand, it demonstrates the power of the system. On the other, it warns: "Just because you *can*, doesn't mean you should." Types that compute Fibonacci will never be needed in a real project. The goal is **productivity and error prevention** — not type-system-theoretical virtuosity.

Drawing that line is a matter of professionalism. This section helps you draw it.

---

## Pattern 1: Combining Conditional Types with Mapped Types

The most powerful pattern in TypeScript utility types is the combination of Conditional Types with Mapped Types. The key: **`as` clause in Mapped Types**.

```typescript annotated
// Extract only methods from an interface:
type Methods<T> = {
  [K in keyof T
    as T[K] extends Function ? K : never  // <- Conditional in the key mapping
  ]: T[K];
//                               ^^^^^^^
//  as X: the key is renamed to X. never-keys are removed from the type!
};

// Only data properties (no methods):
type Data<T> = {
  [K in keyof T
    as T[K] extends Function ? never : K  // <- Reversed logic
  ]: T[K];
};

// A real service interface:
interface UserService {
  id: string;
  name: string;
  email: string;
  lastLogin: Date;
  save(): Promise<void>;
  validate(): boolean;
  delete(): Promise<void>;
}

type ServiceMethods = Methods<UserService>;
// { save: () => Promise<void>; validate: () => boolean; delete: () => Promise<void> }

type ServiceData = Data<UserService>;
// { id: string; name: string; email: string; lastLogin: Date }
```

The `as T[K] extends Function ? K : never` clause is elegant: `never`-keys are automatically removed from the resulting type — they "disappear".

---

## Pattern 2: Smart Return Types

Sometimes you want the return type of a function to depend on the **runtime value** of the argument — not just the type. With overloads and Conditional Types, this is possible:

```typescript annotated
// Conditional Type defines the logic:
type ParseResult<T extends string> =
  T extends `${number}` ? number :    // Looks like a number?
  T extends "true" | "false" ? boolean : // Looks like a boolean?
  string;                               // Otherwise: stays string

// Function with overloads for type narrowing:
function parse<T extends string>(input: T): ParseResult<T>;
function parse(input: string): number | boolean | string {
  if (input === "true") return true;
  if (input === "false") return false;
  const num = Number(input);
  if (!isNaN(num)) return num;
  return input;
}

// TypeScript correctly infers the return type:
const a = parse("42");      // number
const b = parse("true");    // boolean
const c = parse("hello");   // string
const d = parse("3.14");    // number

// TypeScript knows exactly:
a.toFixed(2);   // OK — a is number
b.valueOf();    // OK — b is boolean
c.toUpperCase(); // OK — c is string
```

---

## Pattern 3: Type-Safe Unwrapping of API Response Types

In real projects, API responses often have a wrapper structure. With `infer` you can automatically extract the payload type:

```typescript annotated
// Standard wrapper format of an API:
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
  timestamp: string;
};

type ApiError = {
  error: string;
  code: number;
};

// Extract the payload type:
type UnwrapResponse<T> =
  T extends ApiResponse<infer U> ? U :      // Normal response: payload
  T extends ApiError ? never :               // Error: never
  T;                                         // Unknown: unchanged

// Usage:
type UserApiResponse = ApiResponse<{ id: string; name: string }>;
type ProductApiResponse = ApiResponse<{ sku: string; price: number }>;

type UserPayload = UnwrapResponse<UserApiResponse>;     // { id: string; name: string }
type ProductPayload = UnwrapResponse<ProductApiResponse>; // { sku: string; price: number }
type ErrorPayload = UnwrapResponse<ApiError>;           // never

// Useful in a generic fetch function:
declare function fetchApi<T>(url: string): Promise<UnwrapResponse<T>>;

// Caller only needs to specify the response type:
const user = await fetchApi<UserApiResponse>("/api/users/1");
// user: { id: string; name: string } — automatically unwrapped!
```

---

## Annotated Code: Conditional + Mapped — The Complete Pattern

```typescript annotated
// This pattern creates an "Awaited" wrapper for all properties of an object:
type AwaitAllProps<T extends Record<string, any>> = {
  [K in keyof T]: Awaited<T[K]>;
//                ^^^^^^^
//                Awaited is a built-in Conditional Type
//                It resolves Promises and thenables
};

// Example: An object with Promise properties:
interface AsyncData {
  user: Promise<{ name: string }>;
  settings: Promise<{ theme: "dark" | "light" }>;
  count: number;  // not a Promise
}

type ResolvedData = AwaitAllProps<AsyncData>;
// {
//   user: { name: string };      <- Promise was resolved
//   settings: { theme: "dark" | "light" };
//   count: number;               <- unchanged (Awaited<number> = number)
// }

// In practice: useResolvedState hook for React/Angular
declare function resolveAll<T extends Record<string, Promise<unknown>>>(
  promises: T
): Promise<AwaitAllProps<T>>;

const result = await resolveAll({
  user: fetchUser(),
  settings: fetchSettings(),
});
// result.user — no longer a Promise!
// result.settings — no longer a Promise!
```

---

## Experiment: Understanding NonNullable

> **Experiment:** `NonNullable<T>` is a built-in Conditional Type. Rebuild it and understand how it works:
>
> ```typescript
> // TypeScript's built-in NonNullable:
> // type NonNullable<T> = T extends null | undefined ? never : T;
>
> // Rebuild it:
> type MyNonNullable<T> = T extends null | undefined ? never : T;
>
> type A = MyNonNullable<string>;              // ?
> type B = MyNonNullable<string | null>;       // ?
> type C = MyNonNullable<string | null | undefined>; // ?
> type D = MyNonNullable<null>;                // ?
>
> // Bonus: What is the difference between NonNullable<T> and Required<T>?
> // Hint: Experiment with:
> type E = Required<{ name?: string; age?: number }>;
> type F = NonNullable<string | null | number | undefined>;
> ```
>
> Explain in your own words: Why does `MyNonNullable<string | null>` return `string` — not `string | never`?

---

## Explain It to Yourself

> **Explain it to yourself:** What is the advantage of `type Methods<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] }` over the alternative of listing the methods manually?
> **Key points:** Automatically in sync: when the interface gets new methods, the type updates itself automatically | No copy-paste errors | Works with third-party interfaces you don't control | Runtime code remains untouched (type-level operation) | The cost: higher cognitive load when reading

---

## When Conditional Types Go Too Far

The Turing-completeness principle is also a warning. Here are signals that you've gone too far:

```typescript annotated
// ❌ Too far: TypeScript needed 5+ seconds to evaluate this type
type Fibonacci<N extends number, ...> = ...;  // 200 levels of recursion

// ❌ Too far: Nobody can understand this in 30 seconds
type X<T> = T extends A ? (T extends B ? (T extends C ? D : E) : F) : G;

// ❌ Too far: This could be solved more simply with a runtime check
type ParseQueryString<S extends string> = ...;  // 50 lines of recursive type

// ✅ Good: Clearly readable, solves a real problem
type NonNullable<T> = T extends null | undefined ? never : T;

// ✅ Good: Extraction without importing the library
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;

// ✅ Good: Type-safe union filtering
type Extract<T, U> = T extends U ? T : never;
```

**Rule of thumb:** If another developer can't understand the type in 30 seconds, simplify it. Types are documentation. Unreadable code is not documentation.

---

## Performance Limits: When TypeScript Complains

Conditional Types can slow down the TypeScript language server (the process powering your IDE). This happens with:

1. **Very deep recursion** — each level costs memory and time
2. **Large unions with distribution** — a union with 50 members is evaluated 50 times
3. **Nested Conditional Types over large structures**

```typescript annotated
// This can become slow:
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// On an interface with 100 properties and 5 levels of depth:
// 100 * 100 * 100 * 100 * 100 = 10 billion type instantiations
// This could crash TypeScript!

// In practice this is not a problem for normal structures (3-10 properties, 2-3 levels).
// But with auto-generated types (e.g., from database schema generators)
// it can lead to real performance issues.
```

**Approach for performance problems:**
- Make the type "shallower" (only 1-2 levels)
- Interfaces instead of type aliases (interfaces are lazily evaluated)
- Validate the type at runtime instead of transforming at compile time

---

## In React: Deriving Component Props Type-Safely

```typescript annotated
// React: Props type for different variants of a component
type ButtonVariant = "primary" | "secondary" | "danger";

// Conditional Type for variant-dependent props:
type ButtonProps<V extends ButtonVariant> =
  V extends "danger"
    ? {
        variant: V;
        confirmText: string;  // Required for "danger" — confirmation needed
        onConfirm: () => void;
      }
    : {
        variant: V;
        onClick: () => void;
        disabled?: boolean;
      };

// TypeScript enforces the correct props depending on variant:
declare function Button<V extends ButtonVariant>(props: ButtonProps<V>): JSX.Element;

// Correct — danger requires confirmText:
<Button variant="danger" confirmText="Really delete?" onConfirm={handleDelete} />

// Correct — primary requires onClick:
<Button variant="primary" onClick={handleSave} />

// TypeScript error — danger requires confirmText, not onClick:
<Button variant="danger" onClick={handleDelete} />
// Error: Property 'confirmText' is missing in type...
```

---

## Synthesis: All Concepts at a Glance

| Concept | Syntax | When | Example |
|---------|--------|------|---------|
| Basic condition | `T extends U ? X : Y` | Type-dependent return | `IsString<T>` |
| infer | `T extends X<infer U> ? U : T` | Extract type | `ReturnType<T>` |
| Distribution | naked `T` + union | Filter union | `Extract<T, U>` |
| [T] prevents | `[T] extends [U]` | Holistic check | `IsNever<T>` |
| Recursion | type calls itself | Deep structures | `DeepPartial<T>` |
| Mapped + Cond | `[K in keyof T as ...]` | Key filtering | `Methods<T>` |

---

## Think About It

> **Think about it:** You've now read five sections on Conditional Types. Which of the concepts do you find most useful for your day-to-day work as an Angular developer? Why?
>
> **For reflection:** `ReturnType<T>` and `Parameters<T>` are probably the most frequently used. They help synchronize types without maintaining them manually. `NonNullable<T>` often comes up in forms. `Extract` and `Exclude` help with discriminated unions (which are common in Angular services). `DeepPartial` is ideal for configuration merging.

---

## What You Learned in This Lesson

- Conditional Types are **type-level ternaries**: `T extends U ? X : Y`
- `infer` **discovers** types from patterns — it's the mechanism behind `ReturnType`, `Parameters`, `Awaited`
- **Distribution** spreads conditionals across unions — what makes `Extract` and `Exclude` possible
- `[T] extends [U]` **prevents distribution** and treats unions as a whole
- **Recursive types** reach arbitrarily deep into structures — with a termination condition
- **Conditional + Mapped Types** is the most powerful combination pattern (key filtering)
- The type system is Turing-complete — but **readability > power**

**Core concept:** Conditional Types transform the TypeScript type system from a collection of annotations into a complete **type transformation language**. The core question for every Conditional Type: Does this type make the code safer and more readable — or just more complicated?

---

> **Pause point — End of lesson** — Conditional Types are one of the most complex topics in TypeScript. If you now understand `T extends U ? X : Y`, `infer`, distribution, and recursion, you have a significant advantage over the majority of TypeScript developers.
>
> Now go into your Angular project and look for a place where `ReturnType<>` or `Parameters<>` could make code safer. That's the best way to consolidate what you've learned.
>
> Continue with: [Lesson 18 — Template Literal Types](../../18-template-literal-types/README.md)