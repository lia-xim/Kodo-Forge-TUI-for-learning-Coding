# Section 2: typeof Guards

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - What is Narrowing?](./01-was-ist-narrowing.md)
> Next section: [03 - instanceof and in](./03-instanceof-und-in.md)

---

## What you'll learn here

- How the `typeof` operator works as a type guard
- Which types typeof recognizes: string, number, boolean, object, function, undefined, symbol, bigint
- The notorious pitfall: `typeof null === "object"`
- When typeof works and when you need something else

---

## typeof as a Narrowing Tool

You know `typeof` from JavaScript — it returns a string describing the
runtime type of a value. TypeScript uses this operator as a
**narrowing mechanism**:

```typescript annotated
function describe(value: string | number | boolean) {
  if (typeof value === "string") {
    // ^ typeof check: TypeScript narrows value to string
    return `Text: "${value}"`;
    // ^ value is string here — all string methods available
  }
  if (typeof value === "number") {
    return `Number: ${value.toFixed(2)}`;
    // ^ value is number here — toFixed() is available
  }
  // TypeScript infers: boolean is what's left
  return `Boolean: ${value}`;
  // ^ value is boolean here
}
```

### All typeof Results

The `typeof` operator can return exactly **eight different strings**:

| typeof result | Narrows to | Example values |
|---|---|---|
| `"string"` | `string` | `"hello"`, `""`, `` `template` `` |
| `"number"` | `number` | `42`, `3.14`, `NaN`, `Infinity` |
| `"boolean"` | `boolean` | `true`, `false` |
| `"undefined"` | `undefined` | `undefined` |
| `"object"` | `object \| null` | `{}`, `[]`, `null` (!) |
| `"function"` | `Function` | `() => {}`, `function() {}` |
| `"symbol"` | `symbol` | `Symbol("id")` |
| `"bigint"` | `bigint` | `42n`, `BigInt(100)` |

> 💭 **Think about it:** Why is there no `typeof x === "null"` and no
> `typeof x === "array"`? How do you check for null and arrays instead?
>
> **Answer:** `typeof null` returns `"object"` (a historical bug).
> Arrays are objects in JavaScript, so `typeof [] === "object"`.
> For null: `x === null`. For arrays: `Array.isArray(x)`.

---

## The typeof-null Trap

This is the most important pitfall with typeof — and it directly affects you
when narrowing:

```typescript annotated
function process(value: string | object | null) {
  if (typeof value === "object") {
    // CAUTION! value is: object | null here
    // ^ typeof null returns "object"!
    // value.toString();  // DANGER: null.toString() crashes!
  }
}
```

TypeScript **knows** about this bug and accounts for it. After
`typeof x === "object"`, the type is `object | null`, not just `object`.
You must exclude null separately:

```typescript annotated
function processSafely(value: string | object | null) {
  if (typeof value === "object") {
    // value: object | null
    if (value !== null) {
      // value: object — safe now!
      console.log(Object.keys(value));
    }
  }
}

// Or more elegantly: exclude null first
function processBetter(value: string | object | null) {
  if (value === null) return;
  // value: string | object  (null gone)

  if (typeof value === "object") {
    // value: object — null is already gone!
    console.log(Object.keys(value));
  }
}
```

> 📖 **Background: Why typeof null === "object"?**
>
> In the very first JavaScript implementation (1995, Brendan Eich at
> Netscape), values were stored internally as a type tag + data. The
> type tag for objects was 0. `null` was represented as a NULL pointer
> — with the type tag 0. So `typeof null` returned `"object"`.
> Fixing this bug would have broken existing code, so it stayed forever.
> A TC39 proposal (typeof null === "null") was submitted in 2006 and
> rejected in 2013.

---

## typeof in Different Contexts

### typeof in a switch Statement

```typescript annotated
function format(value: string | number | boolean | undefined) {
  switch (typeof value) {
    case "string":
      // value: string
      return value.toUpperCase();
    case "number":
      // value: number
      return value.toFixed(2);
    case "boolean":
      // value: boolean
      return value ? "Yes" : "No";
    case "undefined":
      // value: undefined
      return "(empty)";
  }
}
```

### typeof with Logical Operators

```typescript annotated
function length(value: string | null | undefined): number {
  // typeof also works in &&-chains:
  if (typeof value === "string" && value.length > 0) {
    // ^ value is string here AND has length > 0
    return value.length;
  }
  return 0;
}
```

### typeof with Negation

```typescript annotated
function notString(value: string | number) {
  if (typeof value !== "string") {
    // ^ Negation! value is number here
    return value * 2;
  }
  // value is string here
  return value.toUpperCase();
}
```

---

## Limits of typeof

typeof only works for **primitive types** and `function`. For more complex
distinctions you need other tools:

```typescript
// typeof CANNOT distinguish between:
typeof {} === "object"        // true
typeof [] === "object"        // true  (arrays are objects!)
typeof null === "object"      // true  (bug!)
typeof new Date() === "object" // true  (all objects)
typeof /regex/ === "object"   // true  (also objects)

// For those you need:
Array.isArray([])             // true — for arrays
x === null                    // for null
x instanceof Date             // for class instances (Section 03)
"prop" in x                   // for property checks (Section 03)
```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> function safe(value: string | object | null) {
>   if (value === null) {
>     console.log("null detected");
>     return;
>   }
>   // value: string | object — null is gone!
>   if (typeof value === "object") {
>     console.log(`Object with keys: ${Object.keys(value).join(", ")}`);
>   } else {
>     console.log(`String: "${value}"`);
>   }
> }
> ```
> Comment out the null check (`if (value === null) return;`) and observe what errors TypeScript reports on `typeof value === "object"`. Then add `undefined` to the union type.

---

## typeof and unknown

`typeof` is the **primary tool** for narrowing `unknown` values:

```typescript annotated
function processSecurely(data: unknown): string {
  if (typeof data === "string") {
    // data: string
    return data.toUpperCase();
  }
  if (typeof data === "number") {
    // data: number
    return data.toString();
  }
  if (typeof data === "boolean") {
    // data: boolean
    return data ? "true" : "false";
  }
  // data: unknown — still unknown
  return String(data);
}
```

> 🧠 **Explain to yourself:** Why does the type in the last `return`
> remain `unknown` instead of becoming `never`? What would need to happen
> for it to become `never`?
> **Key points:** unknown encompasses ALL types | We've only checked 3 |
> There are still object, null, undefined, symbol, bigint, function |
> Only when ALL possibilities are eliminated does it become never

---

## What you've learned

- `typeof` is the most fundamental narrowing tool for primitive types
- There are exactly 8 possible typeof results (string, number, boolean, undefined, object, function, symbol, bigint)
- `typeof null === "object"` is a historical bug — TypeScript accounts for it
- typeof works in if, switch, logical operators, and with negation
- typeof cannot distinguish between different object types (for that: instanceof, in)

**Core concept to remember:** typeof is like a coarse sieve — it reliably
separates primitive types, but for finer distinctions
(which object? which interface?) you need other tools.

---

> **Pause point** -- typeof is your daily bread. In the next
> section you'll learn instanceof and in — the tools for object narrowing.
>
> Continue with: [Section 03: instanceof and in](./03-instanceof-und-in.md)