# Cheatsheet: Functions

## Function Types -- Quick Reference

```typescript
// Function Declaration
function add(a: number, b: number): number { return a + b; }

// Arrow Function
const add = (a: number, b: number): number => a + b;

// Function Type Expression
type MathOp = (a: number, b: number) => number;

// Optional Parameter
function greet(name: string, greeting?: string): string { ... }

// Default Parameter (makes ? unnecessary)
function greet(name: string, greeting: string = "Hello"): string { ... }

// Rest Parameter
function sum(...numbers: number[]): number { ... }

// Destructuring Parameter (type AFTER the pattern!)
function f({ name, age }: { name: string; age: number }): void { ... }
```

---

## void vs undefined

| Context | void | undefined |
|---------|------|-----------|
| Meaning | Return value irrelevant | Concrete value undefined |
| In declarations | **Strict** (no return allowed) | `return undefined;` required |
| In callback types | **Tolerant** (may return a value) | -- |
| Assignment | `void !== undefined` | `undefined` is a concrete type |

---

## Function Overloads

```typescript
// Specific overloads FIRST
function format(x: string): string;    // Overload 1
function format(x: number): string;    // Overload 2
function format(x: string | number): string {  // Implementation (invisible)
  return String(x);
}
```

**Rules:**
1. The implementation signature is **invisible** to callers
2. The implementation must cover **all** overloads
3. Specific overloads **first**, broad ones last
4. Only use when the return type depends on the argument **value**

---

## Callbacks

```typescript
// Callback type
type Callback = (value: string) => void;

// Generic callback
type Mapper<T, U> = (item: T, index: number) => U;

// void callback: may return values!
type VoidCb = () => void;
const fn: VoidCb = () => 42;  // OK!
```

---

## this Parameter

```typescript
// this parameter (disappears in JS — Type Erasure)
function greet(this: { name: string }): string {
  return this.name;
}
greet.call({ name: "Max" });

// Arrow Function: inherits this lexically
class Timer {
  seconds = 0;
  start() {
    setInterval(() => { this.seconds++; }, 1000);
  }
}
```

---

## Type Guards & Assertion Functions

```typescript
// Type Guard: boolean + if-branching
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Assertion Function: throws on failure
function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Error("Not a string");
}

// Usage:
if (isString(x)) { x.toUpperCase(); }       // Type Guard
assertString(x); x.toUpperCase();             // Assertion Function
```

---

## Currying

```typescript
function createFormatter(locale: string): (amount: number) => string {
  return (amount) => new Intl.NumberFormat(locale).format(amount);
}
const fmt = createFormatter("en-US");
fmt(1234.56); // "1,234.56"
```

---

## Decision Guide: When to Use What?

| Situation | Recommendation |
|-----------|----------------|
| Return type varies by input | **Overloads** |
| Same return type for all inputs | **Union types** |
| Many optional parameters | **Options object pattern** |
| Callback with `this` access | **Arrow function** |
| Method on prototype | **Regular method** |
| Custom narrowing | **Type guard** |
| Guarantee or throw | **Assertion function** |
| Separate configuration + execution | **Currying** |