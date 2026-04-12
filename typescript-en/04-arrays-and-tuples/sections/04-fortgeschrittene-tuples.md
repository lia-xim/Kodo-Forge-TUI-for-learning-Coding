# Section 4: Advanced Tuples

> **Estimated reading time:** ~12 minutes
>
> **What you'll learn here:**
> - Variadic Tuple Types — generic spreads in tuples
> - Why `Promise.all` has correct types thanks to Variadic Tuples
> - `as const` deeply understood: the three effects at once
> - `satisfies` + `as const`: the best of both worlds
> - How to derive union types from arrays (Single Source of Truth)

---

## Variadic Tuple Types

As of TypeScript 4.0, there are **Variadic Tuple Types** — generic spreads in
tuple positions. This sounds abstract, but it's one of the most powerful
features for library authors and advanced typing.

### The Basic Principle

A normal generics parameter `T` represents **one** type. With Variadic
Tuples, `T` can represent **an entire tuple** — meaning multiple types in
sequence:

```typescript annotated
type Prepend<T, Tuple extends readonly unknown[]> = [T, ...Tuple];
// ^ T: a single type  ^ Tuple: an ENTIRE tuple (multiple types)
// ^ ...Tuple: Spread -- unpacks the tuple at this position

type A = Prepend<number, [string, boolean]>;
// ^ Result: [number, string, boolean] -- number is prepended

type B = Prepend<string, []>;
// ^ Result: [string] -- empty tuple + string = [string]
```

**The analogy:** Think of Variadic Tuples like building blocks. You have
individual form sections (tuples), and Variadic Tuples allow you to
**generically combine** these sections — without knowing in advance how
long each section is.

### Why does this matter? — Real-World Applications

**1. Typing `concat`-like functions:**

```typescript
function concat<A extends readonly unknown[], B extends readonly unknown[]>(
  a: [...A],
  b: [...B]
): [...A, ...B] {
  return [...a, ...b] as [...A, ...B];
}

const result = concat([1, "hello"] as const, [true, 42] as const);
// Type: readonly [1, "hello", true, 42]
```

Without Variadic Tuples, you'd have to write a separate overload for every
combination of lengths. With them, it works generically for **any** tuple
length.

**2. How TypeScript types `Promise.all` internally:**

```typescript annotated
function all<T extends readonly unknown[]>(
// ^ T is a Variadic Tuple -- represents arbitrarily many types
  values: [...T]
// ^ ...T unpacks the tuple into the parameter list
): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
// ^ Mapped Type over tuple: unpacks each Promise type individually

const [user, posts] = await Promise.all([
  fetchUser(),
// ^ Promise<User> -- position 0 in the tuple
  fetchPosts(),
// ^ Promise<Post[]> -- position 1 in the tuple
]);
// ^ user: User, posts: Post[] -- types are preserved at each position!
```

> 🧠 **Explain to yourself:** Why did `Promise.all` need over 10 overloads before TypeScript 4.0? What changes with Variadic Tuple Types?
> **Key points:** Before: one overload per argument count (1-10) | Now: one generic signature with ...T | T represents an entire tuple | Works for any number of arguments

> **Deeper Knowledge:** Before TypeScript 4.0, `Promise.all` had over
> **10 overloads** in its type definition — one for 1 argument, one for 2,
> one for 3, and so on up to 10. Variadic Tuple Types reduced this to
> **a single** generic signature. The same applies to
> `Function.prototype.bind` and many RxJS operators like `combineLatest`.

**3. Partial Application / Tail Type:**

```typescript
type Tail<T extends readonly unknown[]> =
  T extends [unknown, ...infer Rest] ? Rest : [];

type TailResult = Tail<[string, number, boolean]>;
// Result: [number, boolean]
```

> **Practical Tip:** You don't have to write Variadic Tuples daily.
> But you should understand **why** `Promise.all` and `combineLatest`
> (RxJS in Angular) have correct types. The answer is always: Variadic
> Tuple Types working behind the scenes.

---

## `as const` — What It Really Does

`as const` is not a "trick" — it's a fundamental **type assertion** that
does **three things at once**:

```
  as const does:
  ┌─────────────────────────────────────────────────────────────────┐
  │ 1. Widening is prevented:   "hello" instead of string          │
  │                              42 instead of number              │
  │                              true instead of boolean           │
  │                                                                │
  │ 2. Arrays become readonly tuples:  [1, 2] -> readonly [1, 2]   │
  │                                                                │
  │ 3. Objects become deeply readonly:  all properties readonly    │
  └─────────────────────────────────────────────────────────────────┘
```

```typescript
// Without as const:
const farben = ["rot", "gruen", "blau"];
// Type: string[]

// With as const:
const farbenKonst = ["rot", "gruen", "blau"] as const;
// Type: readonly ["rot", "gruen", "blau"]
//       Every value is a string literal!

// Without as const:
const config = [true, "production", 8080];
// Type: (string | number | boolean)[]

// With as const:
const configKonst = [true, "production", 8080] as const;
// Type: readonly [true, "production", 8080]
//       true (not boolean), "production" (not string), 8080 (not number)
```

> **Background: Why does `as const` exist?** The problem it solves is called
> **Type Widening**. When you write `const x = "hello"`, TypeScript infers
> the type `"hello"` (literal). But with `const arr = ["hello"]`, TypeScript
> infers `string[]` — the literal type is lost, because TypeScript assumes
> you might call `arr.push("world")` later.
> `as const` says: "No, I won't change anything. Keep the literal types."

> **Experiment:** Compare these three variants in your IDE:
> ```typescript
> // Variant 1: let without as const
> let a = ["rot", "blau"];
> // Variant 2: const without as const
> const b = ["rot", "blau"];
> // Variant 3: const with as const
> const c = ["rot", "blau"] as const;
> ```
> Hover over `a`, `b`, and `c`. You'll see:
> - `a` is `string[]` (let = mutable variable, mutable array)
> - `b` is `string[]` (const = immutable binding, but the array is still mutable!)
> - `c` is `readonly ["rot", "blau"]` (const + as const = everything frozen)
>
> **Key insight:** `const` only protects the **variable** (binding),
> not the **contents** of the array. `as const` protects the contents.

---

## The Most Important Pattern: Deriving Union Types from Arrays

You'll find this pattern in almost every professional TypeScript project:

```typescript
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
// Type: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
```

**How does this work step by step?**

```
  1. typeof HTTP_METHODS
     -> readonly ["GET", "POST", "PUT", "DELETE", "PATCH"]

  2. (typeof HTTP_METHODS)[number]
     -> access with any numeric index
     -> union of all possible values
     -> "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
```

**Why not just a union type?** Because you can also work with the array **at
runtime**, while a `type` alias only exists at compile time:

```typescript
// Single Source of Truth: Array AND type from one source
const ROLLEN = ["admin", "user", "moderator"] as const;
type Rolle = (typeof ROLLEN)[number];

// Runtime validation (e.g. for API input):
function isValidRole(input: string): input is Rolle {
  return (ROLLEN as readonly string[]).includes(input);
}

// In Angular: for dropdown options
// <select>
//   @for (rolle of ROLLEN; track rolle) {
//     <option [value]="rolle">{{ rolle }}</option>
//   }
// </select>

// WITHOUT as const you'd have to maintain the values twice:
type Rolle2 = "admin" | "user" | "moderator";       // here...
const ROLLEN2 = ["admin", "user", "moderator"];      // ...and here (duplication!)
```

> **Practical Tip:** This pattern is the **standard solution** for
> enumerations in modern TypeScript. Many teams prefer it over `enum`,
> because it generates no runtime artifacts while simultaneously providing
> both type and runtime values.

---

## `satisfies` + `as const` — The Best of Both Worlds (TS 4.9+)

### The Problem with `as const` Alone

```typescript
const config = {
  port: 8080,
  host: "localhost",
  modes: ["dev", "prod"],
} as const;
// No error if you e.g. type 'prot' instead of 'port' — there's no target type!
```

`as const` gives you precise literal types, but **no validation** against
an expected schema. You could have typos in the keys and no one would notice.

### The Solution: `satisfies` Validates, `as const` Preserves Literals

```typescript
interface AppConfig {
  port: number;
  host: string;
  modes: readonly string[];
}

const checkedConfig = {
  port: 8080,
  host: "localhost",
  modes: ["dev", "prod"],
} as const satisfies AppConfig;

// checkedConfig.port has type 8080 (not number!) — AND is type-checked!
// checkedConfig.modes has type readonly ["dev", "prod"] — AND satisfies AppConfig!
```

> **Think about it:**
> ```typescript
> const pair = [1, "hello"] as const;
> type PairType = typeof pair;
> ```
> What is `PairType`? Is it `readonly [number, string]` or
> `readonly [1, "hello"]`?
>
> **Answer:** It's `readonly [1, "hello"]` — `as const` infers the
> **literal types**, not the widened types. Position 0 is exactly `1`
> (not `number`) and position 1 is exactly `"hello"` (not `string`).

> **Rubber Duck Prompt:** Explain to someone else:
>
> 1. What's the difference between `as const` alone and
>    `as const satisfies Type`?
> 2. Why isn't `satisfies` alone enough to preserve literal types?
> 3. In what situation would you use `as const satisfies` in a
>    real project? (Hint: Think about configuration files
>    or route definitions.)
>
> If you can't answer point 2, re-read the section on
> Type Widening.

> 🧠 **Explain to yourself:** What's the difference between `as const` alone and `as const satisfies Type`? Why isn't `satisfies` alone enough to preserve literal types?
> **Key points:** as const alone: literal types + readonly, but no validation | satisfies alone: validation, but widening possible | combination: literal types + validation | order: freeze first, then validate

### Mind the Order

```typescript
// CORRECT: as const satisfies Type
const a = { x: 1 } as const satisfies { x: number };

// WRONG: satisfies as const — doesn't work!
// const b = { x: 1 } satisfies { x: number } as const;  // Syntax error
```

The order is `as const satisfies Type` — first enforce literal types,
then validate against the target type.

---

## The Interplay: `as const` + `typeof` + Indexed Access

This trio is a fundamental building block of professional TypeScript
architectures:

```typescript
// Step 1: Definition with as const
const STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// Step 2: Derive type from the values
type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];
// Type: 200 | 404 | 500

// Step 3: Derive type from the keys
type StatusName = keyof typeof STATUS_CODES;
// Type: "OK" | "NOT_FOUND" | "SERVER_ERROR"
```

```
  as const            typeof              [keyof typeof X]
  --------            ------              ----------------
  preserve            extract type        extract values
  literal types       from runtime value  as union
```

---

## What You Learned

- Variadic Tuple Types allow generic spreads in tuples — they're the reason
  `Promise.all` and RxJS `combineLatest` have correct types
- `as const` has three effects: prevents widening, turns arrays into readonly
  tuples, makes objects deeply readonly
- `(typeof ARR)[number]` derives a union type from an `as const` array —
  the standard pattern for enumerations
- `satisfies` + `as const` combines literal types with schema validation
- These patterns avoid duplication between the runtime and type level

**Pause point:** The next section covers covariance — a concept that explains
why some array assignments work and others don't, and where TypeScript is
deliberately unsound.

---

[<-- Previous Section: Tuple Basics](03-tuples-grundlagen.md) | [Back to Overview](../README.md) | [Next Section: Covariance and Type Safety -->](05-kovarianz-und-sicherheit.md)