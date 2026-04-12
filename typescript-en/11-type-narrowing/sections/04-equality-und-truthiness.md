# Section 4: Equality and Truthiness Narrowing

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - instanceof and in](./03-instanceof-und-in.md)
> Next section: [05 - Type Predicates](./05-type-predicates.md)

---

## What you'll learn here

- How `===`, `!==`, `==` and `!=` narrow types
- Equality Narrowing: Both sides of a comparison are narrowed
- Truthiness Narrowing: `if (x)` excludes null, undefined, 0, "" and false
- Why truthiness checks can be dangerous with 0 and ""
- Nullish Narrowing with `??` and `?.`

---

## Equality Narrowing

### Strict equality (===, !==)

Strict equality narrows **both sides** of the comparison to the
common type:

```typescript annotated
function compare(a: string | number, b: string | boolean) {
  if (a === b) {
    // ^ Only common type: string
    // a: string, b: string
    console.log(a.toUpperCase());  // OK!
    console.log(b.toUpperCase());  // OK!
  }
}
```

TypeScript analyzes: `a` can be string or number, `b` can be string or
boolean. The only type where `===` can be true is `string`.
So BOTH variables are narrowed to string.

### Checking null and undefined with ===

```typescript annotated
function safe(value: string | null | undefined) {
  if (value !== null && value !== undefined) {
    // value: string — both eliminated
    console.log(value.toUpperCase());
  }

  // Shorter alternative:
  if (value != null) {
    // ^ Note: LOOSE equality (==) !
    // value: string — null AND undefined eliminated
    console.log(value.toUpperCase());
  }
}
```

> 📖 **Background: The only good use of == (loose equality)**
>
> In JavaScript, `null == undefined` is `true`, but `null == 0`,
> `null == ""` and `null == false` are all `false`. This means:
> `x != null` is a safe shorthand for `x !== null && x !== undefined`.
>
> This is one of the few cases where loose equality (`==`) is intentionally
> useful. Most style guides allow `== null` as an exception
> to the "always ===" rule. ESLint's `eqeqeq` rule even has a
> special option `"allow-null"` for this.

---

## Equality Narrowing in Practice

### switch statements

`switch` uses `===` internally, so narrowing works perfectly:

```typescript annotated
type Status = "loading" | "success" | "error";

function showStatus(status: Status) {
  switch (status) {
    case "loading":
      // status: "loading"
      console.log("Loading...");
      break;
    case "success":
      // status: "success"
      console.log("Done!");
      break;
    case "error":
      // status: "error"
      console.log("Error!");
      break;
  }
}
```

### Comparison with a constant

```typescript annotated
function isAdmin(role: "admin" | "user" | "guest"): boolean {
  // Comparison with a literal narrows the type:
  if (role === "admin") {
    // role: "admin"
    return true;
  }
  // role: "user" | "guest"
  return false;
}
```

---

## Truthiness Narrowing

In JavaScript, certain values are "falsy" — they evaluate to `false` in a
boolean context:

```
Falsy values: false, 0, -0, 0n, "", null, undefined, NaN
Everything else is "truthy".
```

TypeScript uses truthiness checks for narrowing:

```typescript annotated
function print(value: string | null | undefined) {
  if (value) {
    // ^ Truthiness check: null, undefined AND "" are gone
    // value: string  (but NOT the empty string!)
    console.log(value.toUpperCase());
  }
}
```

> 💭 **Think about it:** Why is `if (value)` NOT the same as
> `if (value !== null && value !== undefined)`? Which case is
> incorrectly excluded?
>
> **Answer:** `if (value)` also excludes `""` (empty string), `0`
> and `false`! If you only want to eliminate null/undefined,
> use `if (value != null)` or `if (value !== null && value !== undefined)`.

### The truthiness trap with 0 and ""

```typescript
function processLength(length: number | null): string {
  // DANGER: 0 is a valid length!
  if (length) {
    // length: number — but 0 was INCORRECTLY excluded!
    return `Length: ${length}`;
  }
  return "No length";
}

processLength(0);    // "No length" — WRONG! 0 is valid!
processLength(null); // "No length" — correct
processLength(5);    // "Length: 5"  — correct

// BETTER: Check explicitly for null
function processLengthSafe(length: number | null): string {
  if (length !== null) {
    return `Length: ${length}`;  // 0 is handled correctly
  }
  return "No length";
}
```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> function truthinessDemo(value: string | number | null | undefined) {
>   if (value) {
>     console.log(`Truthy: ${JSON.stringify(value)}`);
>   } else {
>     console.log(`Falsy: ${JSON.stringify(value)}`);
>   }
> }
>
> truthinessDemo("hello");  // Truthy
> truthinessDemo("");       // Falsy — WATCH OUT!
> truthinessDemo(0);        // Falsy — WATCH OUT!
> truthinessDemo(null);     // Falsy
> truthinessDemo(42);       // Truthy
> ```
> Which values end up unexpectedly in the falsy branch? Replace `if (value)` with `if (value != null)` — what changes?

---

## Truthiness with Logical Operators

TypeScript also narrows with `&&`, `||` and `!`:

```typescript annotated
function process(value: string | null) {
  // && narrows the left side before the right side is evaluated
  const result = value && value.toUpperCase();
  // ^ If value is null: result = null
  // ^ If value is string: result = value.toUpperCase()

  // ! (negation) reverses the narrowing
  if (!value) {
    // value: null (string is gone because it would be truthy)
    // Note: "" would also end up here!
    return;
  }
  // value: string
  console.log(value);
}
```

### The double exclamation mark trick

```typescript
// !! converts any value to boolean
const hasText = !!value;  // true if value is truthy

// TypeScript does NOT use this for narrowing:
if (!!value) {
  // TypeScript narrows here exactly the same as with if (value)
}
```

---

## Nullish Narrowing

The more modern nullish operators (`??`, `?.`) also narrow:

```typescript annotated
interface Config {
  port?: number;
  host?: string;
}

function start(config: Config) {
  // ?? narrows: if config.port is null/undefined, use 3000
  const port = config.port ?? 3000;
  // ^ port: number (no longer number | undefined)

  // ?. narrows indirectly:
  const length = config.host?.length;
  // ^ length: number | undefined
  // If config.host is undefined, ?.length becomes undefined
  // If config.host is a string, ?.length becomes number
}
```

### Combination: Truthiness + Nullish

```typescript annotated
function greet(name: string | null | undefined): string {
  // Step 1: Nullish coalescing for default value
  const safeName = name ?? "Guest";
  // ^ safeName: string (null/undefined eliminated)

  // Step 2: Truthiness for empty string
  if (safeName) {
    return `Hello, ${safeName}!`;
  }
  return "Hello!";
}
```

---

## Summary of Narrowing Operators

| Operator | Eliminates | Example | Caution |
|---|---|---|---|
| `=== null` | null | `if (x === null)` | Only null, not undefined |
| `!== null` | null | `if (x !== null)` | undefined remains |
| `!= null` | null + undefined | `if (x != null)` | Loose equality! |
| `if (x)` | all falsy values | `if (value)` | 0, "" and false are lost |
| `??` | null + undefined | `x ?? "default"` | Safe for 0 and "" |
| `?.` | null + undefined | `x?.prop` | Result can be undefined |

---

## What you've learned

- `===` narrows both sides of a comparison to the common type
- `!= null` is a safe shorthand for "neither null nor undefined"
- Truthiness (`if (x)`) eliminates null, undefined, 0, "", false and NaN — watch out for 0 and ""!
- `??` and `?.` are the safest tools for null/undefined handling
- switch statements narrow automatically through `===` semantics

> 🧠 **Explain it to yourself:** When would you use `if (x)` and
> when `if (x != null)`? Give an example where one is correct and
> the other is wrong.
> **Key points:** if (x) when 0/""/false are invalid (e.g. required field check) |
> if (x != null) when 0/""/false are valid (e.g. port number, nickname)

**Core concept to remember:** Truthiness is a blunt instrument —
it eliminates EVERYTHING that is falsy. If 0, "" or false are valid
values, use explicit null/undefined checks instead.

---

> **Pause point** -- The basics are complete. The next two sections
> show you advanced tools: Custom Type Guards and Exhaustive Checks.
>
> Continue with: [Section 05: Type Predicates](./05-type-predicates.md)