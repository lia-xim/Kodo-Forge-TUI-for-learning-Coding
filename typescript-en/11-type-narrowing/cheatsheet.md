# Cheatsheet: Type Narrowing in TypeScript

Quick reference for Lesson 11.

---

## All Narrowing Mechanisms at a Glance

| Mechanism | Syntax | Narrows to | Use case |
|---|---|---|---|
| `typeof` | `typeof x === "string"` | Primitive type | string, number, boolean, etc. |
| `instanceof` | `x instanceof Date` | Class instance | Classes (NOT interfaces!) |
| `in` | `"name" in obj` | Type with property | Discriminated unions, interfaces |
| `===` / `!==` | `x === null` | Literal / null | Exact value comparisons |
| `==` / `!=` null | `x != null` | Non-null/undefined | Eliminate null AND undefined |
| Truthiness | `if (x)` | Truthy values | Quick null check (caution!) |
| `is` | `x is string` | Custom type guard | Complex validation |
| `asserts` | `asserts x is T` | Assertion function | Preconditions |
| `never` | `const _: never = x` | Exhaustive check | Cover all cases |

---

## typeof — 8 Possible Results

```typescript
typeof "hello"   === "string"     // Strings
typeof 42        === "number"     // Numbers (incl. NaN, Infinity)
typeof true      === "boolean"    // Boolean values
typeof undefined === "undefined"  // undefined
typeof {}        === "object"     // Objects, arrays, AND null (!)
typeof (() => {}) === "function"  // Functions
typeof Symbol()  === "symbol"     // Symbols
typeof 42n       === "bigint"     // BigInts
```

**Pitfall:** `typeof null === "object"` — always check null separately!

---

## Narrowing Patterns

### typeof Guard

```typescript
function f(x: string | number) {
  if (typeof x === "string") {
    x.toUpperCase();  // x: string
  } else {
    x.toFixed(2);     // x: number
  }
}
```

### Early Return (eliminate null)

```typescript
function f(x: string | null) {
  if (x === null) return;
  x.toUpperCase();  // x: string (for the rest)
}
```

### in Operator (Discriminated Union)

```typescript
interface A { kind: "a"; propA: string }
interface B { kind: "b"; propB: number }
type AB = A | B;

function f(x: AB) {
  if ("propA" in x) {
    x.propA;  // x: A
  } else {
    x.propB;  // x: B
  }
}
```

### Custom Type Guard

```typescript
function isString(x: unknown): x is string {
  return typeof x === "string";
}

if (isString(value)) {
  value.toUpperCase();  // value: string
}
```

### Assertion Function

```typescript
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("Not a string!");
}

assertString(value);
value.toUpperCase();  // value: string (from here on)
```

### Exhaustive Switch

```typescript
function assertNever(x: never): never {
  throw new Error(`Unhandled: ${x}`);
}

type T = "a" | "b" | "c";
function f(x: T) {
  switch (x) {
    case "a": return 1;
    case "b": return 2;
    case "c": return 3;
    default: return assertNever(x);
  }
}
```

---

## TS 5.5: Inferred Type Predicates

```typescript
// From TS 5.5, filter() narrows automatically:
const items: (string | null)[] = ["a", null, "b"];

const clean = items.filter(x => x !== null);
// Type: string[] (no longer (string | null)[])

const nums = [1, "a", 2, "b"].filter(x => typeof x === "number");
// Type: number[]
```

---

## Truthiness vs. Nullish

| Check | Eliminates | Safe for 0, ""? |
|---|---|---|
| `if (x)` | null, undefined, 0, "", false, NaN | **No!** |
| `if (x != null)` | null, undefined | **Yes** |
| `if (x !== null)` | null | **Yes** |
| `x ?? default` | null, undefined | **Yes** |
| `x \|\| default` | All falsy values | **No!** |

**Rule of thumb:** When 0, "" or false are valid values, use
`!= null` or `??` instead of truthiness checks.

---

## typeof null Bug

```typescript
function sicher(x: object | null) {
  if (typeof x === "object") {
    // x: object | null — null is STILL there!
    if (x !== null) {
      // x: object — NOW safe
    }
  }
}

// Better: exclude null first
function besser(x: object | null) {
  if (x === null) return;
  // x: object — clean!
}
```

---

## instanceof vs. in vs. typeof

| Tool | Works with | Does NOT work with |
|---|---|---|
| `typeof` | Primitives, function | Different object types |
| `instanceof` | Classes | Interfaces, type aliases |
| `in` | Properties/interfaces | Primitive types |
| `Array.isArray` | Arrays | Other objects |

---

## Equality Narrowing

```typescript
// === narrows BOTH sides:
function f(a: string | number, b: string | boolean) {
  if (a === b) {
    // a: string, b: string (only shared type)
  }
}

// != null checks null AND undefined:
function g(x: string | null | undefined) {
  if (x != null) {
    x.toUpperCase();  // x: string
  }
}
```

---

## assertNever — Double Safety Net

```
Compile protection:  Missing case -> Type Error
                     "Type 'xyz' is not assignable to type 'never'"

Runtime protection: Unexpected value -> Error
                    "Unhandled case: xyz"
```

```typescript
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
```

---

## Type Guard vs. Assertion Function

| | Type Guard (`is`) | Assertion (`asserts`) |
|---|---|---|
| Return type | `boolean` | `void` (or throw) |
| Usage | `if (isX(val))` | `assertX(val); // narrows after` |
| Narrowing scope | In the if-block | Entire remaining scope |
| On error | Returns false | Throws error |

---

## Common Errors

| Error | Problem | Solution |
|---|---|---|
| `typeof null === "object"` | null passes through | Check `x === null` separately |
| `if (x)` with numbers | 0 is excluded | `if (x != null)` or `x ?? 0` |
| `instanceof Interface` | Compile error | `in` operator or type guard |
| `filter(x => x !== null)` | Type remains (TS <5.5) | TS 5.5+ or manual guard |
| No `assertNever` | Silent errors | Always use assertNever in default |
| Type guard always returns true | Incorrect narrowing | Check all fields + test |
| Narrowing via boolean function | No narrowing | Use `is` instead of `boolean` |