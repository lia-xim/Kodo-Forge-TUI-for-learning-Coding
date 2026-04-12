# Section 2: Type Guards and Narrowing

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Union Types Fundamentals](./01-union-types-grundlagen.md)
> Next section: [03 - Discriminated Unions](./03-discriminated-unions.md)

---

## What you'll learn here

- How TypeScript **automatically narrows types** (Control Flow Analysis)
- The five narrowing techniques: `typeof`, `instanceof`, `in`, truthiness, assignment
- Why TS 5.5 **Inferred Type Predicates** are a game changer for `.filter()`
- How to write **custom type guards** (`value is Type`)

> **Note:** Custom type guards (`value is Type`) are introduced here for the first time.
> In **Lesson 11 (Type Narrowing)** you'll learn them in depth —
> with all variants, best practices, and pitfalls.
> For now, it's enough to know: you can explicitly tell TypeScript
> "this value has this type" — and the compiler will trust you.

---

## The problem: union types are too broad

In Section 1 you saw that with a `string | number` value, TypeScript only
allows operations common to both types. But you often want to do
type-specific things. The solution: **narrowing**.

```typescript annotated
function padLeft(value: string | number, padding: number): string {
  // BEFORE: value is string | number
  if (typeof value === "string") {
    // AFTER: value is string (TypeScript has "narrowed" it)
    return value.padStart(padding);
    //     ^^^^^ TypeScript knows: this is a string
  }
  // AFTER: value is number (string has been ruled out)
  return String(value).padStart(padding);
  //            ^^^^^ TypeScript knows: this is a number
}
```

TypeScript's **Control Flow Analysis** tracks the type through every
branch of your code. This is no magic — it's a sophisticated
algorithm that understands `if`, `switch`, `return`, `throw`, and more.

---

## Technique 1: typeof guard

The simplest and most common guard. Works for **primitive types**:

```typescript annotated
function stringify(value: string | number | boolean): string {
  if (typeof value === "string") {
    // value: string
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    // value: number
    return value.toFixed(2);
  }
  // value: boolean (the only remaining option)
  return value ? "yes" : "no";
}
```

**typeof returns:** `"string"`, `"number"`, `"boolean"`, `"symbol"`,
`"bigint"`, `"undefined"`, `"function"`, `"object"`

> 💭 **Think about it:** Why isn't `typeof` enough to distinguish between `null`
> and an object?
>
> **Answer:** Because `typeof null === "object"` (the historic bug from
> Lesson 02). That's why for `null` you need an explicit
> comparison: `value === null`.

---

## Technique 2: instanceof guard

For **class instances** (not for interfaces — those don't exist at runtime!):

```typescript annotated
class Dog {
  bark() { return "Woof!"; }
}
class Cat {
  meow() { return "Meow!"; }
}

function makeSound(animal: Dog | Cat): string {
  if (animal instanceof Dog) {
    // animal: Dog
    return animal.bark();
  }
  // animal: Cat
  return animal.meow();
}
```

> **Important:** `instanceof` only works with classes (which exist at
> runtime). For interfaces and type aliases you need other techniques
> (see `in` guard and custom guards).

---

## Technique 3: in guard

The `in` operator checks whether a **property exists**. Especially
useful for objects without a shared class:

```typescript annotated
interface Fish {
  swim: () => void;
}
interface Bird {
  fly: () => void;
}

function move(animal: Fish | Bird): void {
  if ("swim" in animal) {
    // animal: Fish
    animal.swim();
  } else {
    // animal: Bird
    animal.fly();
  }
}
```

> 🧠 **Explain to yourself:** Why can TypeScript infer from
> `"swim" in animal` that `animal` is a `Fish`?
> **Key points:** Only Fish has `swim` | TypeScript knows the interfaces |
> If `swim` exists, it MUST be Fish | Bird has no `swim`

---

## Technique 4: Truthiness narrowing

TypeScript understands that `null`, `undefined`, `0`, `""`, `NaN`, and
`false` are considered **falsy**:

```typescript annotated
function printLength(text: string | null | undefined): void {
  if (text) {
    // text: string (null and undefined are falsy, so eliminated)
    console.log(text.length);
  } else {
    // text: string | null | undefined
    // WARNING: An empty string "" also ends up here!
    console.log("No text");
  }
}
```

> **Warning:** Truthiness narrowing also eliminates valid values
> like `0`, `""`, and `false`. For numbers and booleans,
> `!== null && !== undefined` is often safer:

```typescript
function getLength(value: string | null): number {
  // WRONG: "" (empty string) is treated as "no value"
  // if (value) { return value.length; }

  // CORRECT: Only null is excluded
  if (value !== null) {
    return value.length;  // value: string (including "")
  }
  return 0;
}
```

---

## Technique 5: Assignment narrowing

TypeScript also narrows the type on **assignment**:

```typescript annotated
let value: string | number;

value = "hello";
// value: string — TypeScript knows what was assigned
console.log(value.toUpperCase());  // OK

value = 42;
// value: number — after the new assignment
console.log(value.toFixed(2));     // OK
```

---

## Type predicates: custom type guards

Sometimes you need a **function** that acts as a guard. For this,
there are type predicates using `is`:

```typescript annotated
interface User {
  name: string;
  email: string;
}

// Type predicate: "value is User"
function isUser(value: unknown): value is User {
//                                ^^^^^^^^^^^^
//                                "If this function returns true,
//                                 then value is a User"
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value &&
    // SAFE: We cast to Record<string, unknown> instead of to User
    // — we're checking the type at runtime, we're NOT blindly trusting
    typeof (value as Record<string, unknown>).name === "string" &&
    typeof (value as Record<string, unknown>).email === "string"
  );
}

// Usage:
function greet(input: unknown): string {
  if (isUser(input)) {
    // input: User — TypeScript trusts the type predicate
    return `Hello, ${input.name}!`;
  }
  return "Unknown visitor";
}
```

> **Critical:** Why `(value as Record<string, unknown>)` instead of
> `(value as User)`? An `as User` cast would crash at runtime
> if `value` is not a User — the cast only convinces the compiler,
> it doesn't change the actual value.
> `Record<string, unknown>` is safer: we're only telling TypeScript
> "this value has string keys with unknown values" — and then check
> the type at runtime with `typeof`.
>
> In **Lesson 42 (TypeScript Security)** you'll learn why `as` casts
> are among the most common problems in TypeScript.
>
> **Rule of thumb:** A type guard MUST check the value at runtime.
> The return type `value is User` is only the *promise* to the
> compiler — the actual work is done by the `typeof`/`in` checks.

---

## TS 5.5: Inferred type predicates — the game changer

Before TypeScript 5.5 there was an **annoying problem** with `.filter()`:

```typescript
// BEFORE TS 5.5: filter() loses the type information
const mixed: (string | null)[] = ["hello", null, "world", null];

// The result should be string[], but...
const strings = mixed.filter(x => x !== null);
// Type of strings: (string | null)[]  -- WRONG! null has been filtered out!
```

You had to write an explicit type predicate:

```typescript
// WORKAROUND before TS 5.5:
const strings = mixed.filter((x): x is string => x !== null);
```

**From TypeScript 5.5 onward**, the compiler automatically recognizes that the
filter function is a type predicate:

```typescript annotated
// FROM TS 5.5: TypeScript infers the type predicate automatically!
const mixed: (string | null)[] = ["hello", null, "world", null];

const strings = mixed.filter(x => x !== null);
// Type of strings: string[]  -- CORRECT! TS 5.5+ recognizes this
//
// TypeScript internally infers: (x): x is string => x !== null
// This is called "Inferred Type Predicates"
```

> 📖 **Background: How inferred type predicates work**
>
> TypeScript 5.5 (May 2024) introduced a new feature: when a
> function with a single parameter returns a boolean
> AND the compiler can recognize that the return value constrains the type of
> the parameter, a type predicate is automatically inferred.
>
> The rules for this:
> 1. No explicit return type and no explicit type predicate
> 2. A single `return` expression (no implicit `return undefined`)
> 3. The parameter is not mutated
> 4. The function returns a boolean that narrows the parameter type
>
> This also works in array methods like `.filter()`, `.find()`,
> `.some()`, and `.every()`.

```typescript
// Further examples of inferred type predicates (TS 5.5+):
const numbers = [1, 2, undefined, 4, undefined];

// TS infers: (x): x is number => ...
const defined = numbers.filter(x => x !== undefined);
// Type: number[] -- correct!

// Also works with more complex filters:
interface User { name: string; age: number }
interface Admin extends User { role: "admin" }

const users: (User | Admin)[] = [/* ... */];
const admins = users.filter(u => "role" in u);
// Type: Admin[] -- TS 5.5+ recognizes the in-guard!
```

> ⚡ **Practical tip:** Check your `tsconfig.json`: if you're using TS 5.5+,
> you can remove many explicit type predicates from `.filter()` calls.
> Less code, same safety.

---

## Narrowing with switch

Especially elegant for union types with many members:

```typescript annotated
type Shape = "circle" | "square" | "triangle";

function getDescription(shape: Shape): string {
  switch (shape) {
    case "circle":
      // shape: "circle"
      return "A round circle";
    case "square":
      // shape: "square"
      return "A square with corners";
    case "triangle":
      // shape: "triangle"
      return "A pointy triangle";
  }
}
```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> type Shape = "circle" | "square" | "triangle";
>
> function getDescription(shape: Shape): string {
>   switch (shape) {
>     case "circle":   return "A round circle";
>     case "square":   return "A square with corners";
>     case "triangle": return "A pointy triangle";
>   }
> }
>
> // Now add "pentagon" to the type:
> // type Shape = "circle" | "square" | "triangle" | "pentagon";
> // What happens? TypeScript knows that getDescription()
> // has no return value for "pentagon".
> ```
> What error does TypeScript show after adding `"pentagon"`?
> How would a `default` branch with `const _x: never = shape` help?

---

## What you've learned

- TypeScript **narrows** union types automatically through control flow analysis
- **typeof** for primitives, **instanceof** for classes, **in** for properties
- **Truthiness** narrowing has traps with `0`, `""`, and `false`
- **Type predicates** (`value is Type`) for custom guards
- **TS 5.5 inferred type predicates**: `.filter(x => x !== null)` now automatically returns the correct type

> 🧠 **Explain to yourself:** What is the difference between
> `typeof x === "object"` and `x instanceof Object`? In which cases
> do they give different results?
> **Key points:** typeof null === "object" | instanceof checks the prototype chain |
> typeof is safer for primitives | instanceof doesn't work cross-realm

**Core concept to remember:** Type narrowing is the counterpart to union types. Union types make types **broader** (more possibilities), narrowing makes them **narrower** (fewer possibilities). Together they form a powerful system.

---

> **Pause point** — You now know all the fundamental narrowing techniques.
> In the next section you'll learn **Discriminated Unions** — the
> most powerful pattern for union types.
>
> Continue with: [Section 03: Discriminated Unions](./03-discriminated-unions.md)