# Cheatsheet: Arrays & Tuples

> Quick reference for Lesson 04. For looking things up, not for first-time learning.

---

## Array Syntax Comparison

| Syntax               | Example                     | When to use?                          |
|----------------------|-----------------------------|---------------------------------------|
| `T[]`                | `string[]`                  | Standard for simple types             |
| `Array<T>`           | `Array<string>`             | With complex union types              |
| `readonly T[]`       | `readonly number[]`         | Immutable arrays                      |
| `ReadonlyArray<T>`   | `ReadonlyArray<number>`     | Alternative readonly syntax           |

### When to use `Array<T>` instead of `T[]`?

```typescript
// AMBIGUOUS — is this string OR number[]?
let a: string | number[];

// CLEAR — Array of string | number
let b: Array<string | number>;

// ALSO CLEAR — with parentheses
let c: (string | number)[];
```

### Array\<T\> is a generic type

```typescript
// Array<T> is defined in lib.es5.d.ts:
interface Array<T> {
  length: number;
  push(...items: T[]): number;
  map<U>(fn: (value: T) => U): U[];
  filter(fn: (value: T) => boolean): T[];
  find(fn: (value: T) => boolean): T | undefined;
  // ...
}
// string[] === Array<string> — exactly the same type!
```

---

## Tuple Syntax Reference

| Concept              | Syntax                                  | Example                               |
|----------------------|-----------------------------------------|---------------------------------------|
| Basic tuple          | `[T1, T2, ...]`                         | `[string, number]`                    |
| Named tuple          | `[label: T, ...]`                       | `[name: string, age: number]`         |
| Optional             | `[T1, T2?]`                             | `[string, number?]`                   |
| Rest at end          | `[T1, ...T2[]]`                         | `[string, ...number[]]`              |
| Rest in middle       | `[T1, ...T2[], T3]`                     | `[string, ...number[], boolean]`     |
| Readonly             | `readonly [T1, T2]`                     | `readonly [string, number]`           |
| Spread               | `[...Tuple1, ...Tuple2]`                | `[...Head, ...Tail]`                  |
| as const             | `[...] as const`                        | `[1, "hi"] as const`                  |

---

## Fundamental Differences: Array vs Tuple

```
  Property          Array                Tuple
  ─────────────     ─────                ─────
  Length            variable             fixed (compile-time)
  Element types     all same/union       defined per position
  .length type      number               literal (e.g. 3)
  Inference         automatic            NEVER automatic
  Index access      always same type     position-dependent
```

---

## Covariance with Arrays

```typescript
// string is a subtype of string | number
// => string[] is a subtype of (string | number)[]  (covariance)
const a: string[] = ["x"];
const b: (string | number)[] = a;  // OK
b.push(42);     // OK — but a now contains 42 as well!
// UNSOUND! readonly solves this problem.
```

---

## Readonly: Allowed vs. Blocked Methods

### Allowed (reading / creating new arrays)

```
length    [index]    includes()    indexOf()
find()    findIndex()    filter()    map()
forEach()    some()    every()    reduce()
slice()    concat()    join()    flat()
flatMap()    entries()    keys()    values()
```

### Blocked (mutating)

```
push()    pop()    shift()    unshift()
sort()    reverse()    splice()    fill()
copyWithin()    [index] = value
```

---

## Common Patterns

### useState-style return value

```typescript
function useCounter(init: number): [count: number, inc: () => void] {
  let count = init;
  return [count, () => { count++; }];
}
const [count, increment] = useCounter(0);
```

### Error handling (Go-style)

```typescript
type Result<T> = [data: T, error: null] | [data: null, error: Error];

function parse(json: string): Result<unknown> {
  try { return [JSON.parse(json), null]; }
  catch (e) { return [null, e as Error]; }
}
```

### Deriving a union from as const

```typescript
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number];
// => "admin" | "user" | "guest"
```

### as const + satisfies (TS 5.0+)

```typescript
interface Config { port: number; host: string }
const config = { port: 8080, host: "localhost" } as const satisfies Config;
// config.port is type 8080 (literal!) AND type-checked
```

### Spread for function arguments

```typescript
function log(msg: string, level: number): void { /* ... */ }
const args: [string, number] = ["Error", 3];
log(...args);
```

### Swapping tuple elements

```typescript
function swap<A, B>(t: [A, B]): [B, A] {
  return [t[1], t[0]];
}
```

### Type predicate with filter()

```typescript
const mixed: (string | number)[] = ["a", 1, "b"];
// WRONG: const strs = mixed.filter(x => typeof x === "string"); // (string | number)[]
// RIGHT:
const strs = mixed.filter((x): x is string => typeof x === "string"); // string[]
```

### Type-safe event emitter

```typescript
interface Events {
  click: [x: number, y: number];
  logout: [];
}
function emit<K extends keyof Events>(e: K, ...args: Events[K]): void { }
emit("click", 100, 200);
emit("logout");
```

---

## Variadic Tuple Types

```typescript
// Prepend
type Prepend<E, T extends unknown[]> = [E, ...T];
type R1 = Prepend<number, [string]>; // [number, string]

// Append
type Append<T extends unknown[], E> = [...T, E];
type R2 = Append<[string], number>; // [string, number]

// Concat
type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];
type R3 = Concat<[string], [number]>; // [string, number]

// Head / Tail
type Head<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;
type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

// TupleToUnion
type TupleToUnion<T extends readonly unknown[]> = T[number];

// Length (literal!)
type Length<T extends readonly unknown[]> = T["length"];
```

---

## noUncheckedIndexedAccess

```typescript
// tsconfig.json: "noUncheckedIndexedAccess": true

const arr: string[] = ["a"];
const val = arr[0]; // string | undefined  (no longer just string!)

// Tuple positions are NOT affected:
const tup: [string, number] = ["a", 1];
const first = tup[0]; // string (no | undefined!)
```

---

## Gotchas (Common Pitfalls)

### 1. Array is inferred, not tuple

```typescript
const p = [10, 20];        // number[] — NOT a tuple!
const p2: [number, number] = [10, 20];  // tuple
const p3 = [10, 20] as const;           // readonly [10, 20]
```

### 2. push is allowed on mutable tuples

```typescript
const pair: [string, number] = ["a", 1];
pair.push(2);     // No error!  pair is now ["a", 1, 2]
// Solution: use readonly
```

### 3. Spread loses tuple type

```typescript
const tup: [string, number] = ["hi", 1];
const arr = [...tup]; // (string | number)[] — tuple type lost!
```

### 4. readonly -> mutable is not allowed

```typescript
const ro: readonly string[] = ["a"];
// const rw: string[] = ro;  // ERROR
const rw: string[] = [...ro]; // OK (copy)
```

### 5. Object.freeze is shallow

```typescript
const arr = Object.freeze([{ name: "Alice" }]);
arr[0].name = "Bob"; // No error — objects inside are still mutable!
```

### 6. Optional elements only at the end

```typescript
type Ok   = [string, number?];       // ok
// type Err = [string?, number];      // ERROR
```

### 7. Empty arrays become any[]

```typescript
const arr = [];           // any[] — bad!
const arr2: string[] = []; // string[] — good!
```

### 8. filter() doesn't narrow automatically

```typescript
const arr: (string | null)[] = ["a", null];
const wrong = arr.filter(x => x !== null);     // (string | null)[] — null is still there!
const right = arr.filter((x): x is string => x !== null); // string[]
```

### 9. Covariance mutation

```typescript
const strs: string[] = ["a"];
const wider: (string | number)[] = strs; // OK (covariance)
wider.push(42);  // OK — but strs now contains a number!
// Solution: use readonly in function parameters
```

---

## Decision Tree

```
Do you need a collection of values?
  |
  +-- All the same type, variable length?
  |     -> Array (string[], number[])
  |     |
  |     +-- Should it be immutable?
  |           -> readonly string[]
  |
  +-- Fixed length, different types per position?
  |     -> Tuple ([string, number])
  |     |
  |     +-- More than 3-4 fields?
  |     |     -> Better to use an object!
  |     |
  |     +-- Should it be immutable?
  |     |     -> readonly [string, number]
  |     |
  |     +-- Do you need literal types?
  |           -> as const
  |
  +-- Fixed values as a union type?
  |     -> as const + indexed access
  |     -> ["a", "b", "c"] as const
  |     -> (typeof x)[number]
  |
  +-- Do you need type checking AND literal types?
        -> as const satisfies InterfaceName
```