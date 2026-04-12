# Section 5: Type Predicates

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Equality and Truthiness](./04-equality-und-truthiness.md)
> Next section: [06 - Exhaustive Checks](./06-exhaustive-checks.md)

---

## What you'll learn here

- Creating custom type guards with the `is` keyword
- Declaring assertion functions with `asserts`
- **TS 5.5 Inferred Type Predicates**: `filter()` now narrows automatically!
- When to use which tool

---

## The Problem: Limits of Built-in Narrowing Mechanisms

Sometimes typeof, instanceof, and in aren't enough:

```typescript
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function move(animal: Fish | Bird) {
  // How do we narrow here?
  // typeof? No — both are "object"
  // instanceof? No — these are interfaces, not classes
  // "swim" in animal? Works, but gets unwieldy with complex checks
}
```

For complex validations you need **Custom Type Guards** — functions that
tell the compiler: "If I return true, the value has this type."

---

## Custom Type Guards: The is Keyword

A type guard is a function with a special return type:
`parameter is Type`.

```typescript annotated
function isFish(animal: Fish | Bird): animal is Fish {
  // ^ "animal is Fish" is a TYPE PREDICATE
  return (animal as Fish).swim !== undefined;
  // ^ We cast to check the property — the cast is safe here
  //   because we're only checking whether the property exists
}

function move(animal: Fish | Bird) {
  if (isFish(animal)) {
    // ^ TypeScript trusts the type guard: animal is Fish
    animal.swim();
  } else {
    // animal: Bird
    animal.fly();
  }
}
```

### How Type Predicates Work

1. The function returns `boolean` (true or false)
2. The return type `parameter is Type` tells TypeScript:
   "If this function returns true, `parameter` is of type `Type`"
3. TypeScript trusts you — it does NOT verify that your logic is correct!

> 💭 **Think about it:** Type predicates require YOU to implement the logic
> correctly. What happens if you write a faulty type guard that always
> returns `true`?
>
> **Answer:** TypeScript trusts the guard blindly. A faulty guard leads
> to runtime errors — just like an incorrect `as`.
> That's why you should test type guards thoroughly!

---

## Practical Example: Validating API Data

Type guards are ideal for validating external data:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
}

function isUser(data: unknown): data is User {
  // ^ Type predicate with unknown — the safest variant
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    typeof (data as Record<string, unknown>).id === "number" &&
    "name" in data &&
    typeof (data as Record<string, unknown>).name === "string" &&
    "email" in data &&
    typeof (data as Record<string, unknown>).email === "string"
  );
}

// Usage:
function processResponse(data: unknown) {
  if (isUser(data)) {
    // data: User — all properties are safely accessible
    console.log(`${data.name} (${data.email})`);
  } else {
    console.log("Invalid data!");
  }
}
```

> 🔍 **Deeper Knowledge: Type Guards vs. Zod/Valibot**
>
> In production code, type guards are often replaced by validation libraries.
> Zod, Valibot, or io-ts generate type guards automatically from a schema.
> Instead of writing the validation manually, you define a schema and get
> the type guard for free:
>
> ```typescript
> import { z } from "zod";
> const UserSchema = z.object({
>   id: z.number(),
>   name: z.string(),
>   email: z.string().email(),
> });
> type User = z.infer<typeof UserSchema>;
> // UserSchema.parse(data) — throws on error
> // UserSchema.safeParse(data) — returns { success, data, error }
> ```

---

## Assertion Functions: asserts

Assertion functions are type guards that don't return a `boolean`,
but instead throw an error if the condition is not met:

```typescript annotated
function assertIsString(value: unknown): asserts value is string {
  // ^ "asserts value is string" — if the function does NOT throw,
  //   value is a string
  if (typeof value !== "string") {
    throw new Error(`Expected: string, received: ${typeof value}`);
  }
}

function process(input: unknown) {
  assertIsString(input);
  // ^ If we reach this point, assertIsString did NOT throw
  // input: string — from here on for the rest of the scope!
  console.log(input.toUpperCase());
}
```

### Assertion Functions vs. Type Guards

| | Type Guard (`is`) | Assertion (`asserts`) |
|---|---|---|
| Return value | `boolean` | `void` (or throws error) |
| Usage | In `if` conditions | As a standalone statement |
| On failure | Returns `false` | **Throws an error** |
| Narrowing applies | In the if-block | From the call site for the entire scope |

```typescript
// Type guard — the caller decides what happens on false
if (isUser(data)) {
  // narrowed only here
}

// Assertion function — throws or narrows the entire scope
assertIsUser(data);
// narrowed from here — no if needed
console.log(data.name);
```

---

## TS 5.5: Inferred Type Predicates

**This is one of the most important additions in TypeScript 5.5 (June 2024).**

Previously you had to manually write a type guard with `Array.filter()`
to remove null values:

```typescript
// BEFORE TS 5.5 — filter does NOT narrow:
const mixed: (string | null)[] = ["hello", null, "world", null];

const oldResult = mixed.filter(x => x !== null);
// Type: (string | null)[]  — null is STILL in the type!
// You had to cast manually or write a type guard:
const oldManual = mixed.filter((x): x is string => x !== null);
```

**From TS 5.5 onwards** TypeScript automatically recognizes that the callback
function is a type predicate:

```typescript annotated
// FROM TS 5.5 — filter narrows AUTOMATICALLY:
const mixed: (string | null)[] = ["hello", null, "world", null];

const newResult = mixed.filter(x => x !== null);
// ^ Type: string[]  — null is AUTOMATICALLY gone!
// TypeScript infers: (x) => x is string

// Also works with undefined:
const withUndefined: (number | undefined)[] = [1, undefined, 3];
const onlyNumbers = withUndefined.filter(x => x !== undefined);
// ^ Type: number[]

// And even with more complex checks:
const values: (string | number | null)[] = ["a", 1, null, "b", 2];
const onlyStrings = values.filter(x => typeof x === "string");
// ^ Type: string[]  — TS 5.5 infers the type predicate!
```

> 📖 **Background: Why did this take so long?**
>
> Inferred type predicates were one of the most requested features in
> TypeScript. The problem was technically complex: the compiler had to
> recognize that a callback function represents a type constraint
> without the developer explicitly declaring it. The TypeScript team
> (particularly Dan Vanderkam) implemented this for TS 5.5 after years
> of discussion on GitHub (#16069).
>
> The rule: TypeScript infers a type predicate automatically when:
> 1. The function has no explicit return type
> 2. The function has a single return expression
> 3. The function does not mutate its parameter
> 4. The function returns a narrowing expression

> **Experiment:** Try the following in the TypeScript Playground (enable TypeScript 5.5+):
> ```typescript
> const mixed: (string | null)[] = ["hello", null, "world", null, "!"];
>
> // From TS 5.5 — filter narrows AUTOMATICALLY:
> const onlyStrings = mixed.filter(x => x !== null);
> // Type: string[]  (hover over onlyStrings to confirm!)
>
> const values: (string | number | null)[] = ["a", 1, null, "b", 2];
> const onlyNumbers = values.filter(x => typeof x === "number");
> // Type: number[]  (TS 5.5 infers the type predicate)
> ```
> Hover over `onlyStrings` and `onlyNumbers` — does the IDE show `string[]` and `number[]`? Change `5.5` to `5.4` in the Playground settings and observe the difference in types.

---

## When to Use Which Tool?

| Situation | Tool |
|---|---|
| Simple type check in if/switch | typeof, instanceof, in |
| Reusable validation logic | Custom type guard (`is`) |
| Precondition that MUST hold | Assertion function (`asserts`) |
| Filter null/undefined from array | Simply `filter(x => x !== null)` (TS 5.5+) |
| Validate external data (production) | Zod / Valibot + automatic guards |

---

## What You Learned

- Custom type guards (`parameter is Type`) give you full control over narrowing
- TypeScript trusts your type guards — make sure the logic is correct!
- Assertion functions (`asserts`) narrow the entire scope and throw on failure
- **TS 5.5 Inferred Type Predicates**: `filter(x => x !== null)` now narrows automatically
- Type guards are ideal for API validation and complex type distinctions

> 🧠 **Explain it to yourself:** What is the difference between
> `function check(x: unknown): x is string` and
> `function check(x: unknown): asserts x is string`?
> When do you use which variant?
> **Key points:** is returns boolean, asserts throws or void |
> is is used in if conditions, asserts as a precondition |
> is lets the caller decide, asserts enforces the happy path

**Core concept to remember:** Type predicates are "narrowing contracts" —
you promise the compiler that your check is correct. TS 5.5 makes
many manual type guards unnecessary.

---

> **Pause point** — Almost there! The final section shows you how to
> ensure you haven't missed ANY case: exhaustive checks with never.
>
> Continue with: [Section 06: Exhaustive Checks](./06-exhaustive-checks.md)