# Section 4: Callback Types

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Function Overloads](./03-function-overloads.md)
> Next section: [05 - The this Parameter](./05-this-parameter.md)

---

## What you'll learn here

- How to make **callbacks type-safe** — the right way
- The special meaning of **void callbacks** and why they may return values
- The difference between **callback type aliases** and **inline types**
- How to work with **generic callbacks**

---

## Callbacks: Functions as Arguments

Callbacks are functions passed as arguments to other functions.
They are one of the most common patterns in JavaScript/TypeScript:

```typescript annotated
// Array.map expects a callback: (element, index, array) => newValue
const names = ["Max", "Anna", "Bob"];
const lengths = names.map((name) => name.length);
//                         ^^^^    ^^^^^^^^^^^
//                         Param   Callback body
// lengths: number[] — TypeScript infers this from the callback return
```

### Explicitly typing callbacks

```typescript annotated
type TransformFn = (value: string, index: number) => string;
//                  ^^^^^^^^^^^^^  ^^^^^^^^^^^^      ^^^^^^
//                  First param    Second param      Return

function transformAll(items: string[], fn: TransformFn): string[] {
//                                     ^^^^^^^^^^^^^^
//                                     Callback parameter with named type
  return items.map((item, i) => fn(item, i));
}

const shouted = transformAll(["hello", "world"], (s) => s.toUpperCase());
// ["HELLO", "WORLD"]

const numbered = transformAll(["a", "b"], (s, i) => `${i}: ${s}`);
// ["0: a", "1: b"]
```

---

## The void Callback Rule

This is one of the **most surprising** rules in TypeScript:

> **A callback with return type `void` may still return a value.
> The value is simply ignored.**

```typescript annotated
type VoidCallback = (value: string) => void;
//                                     ^^^^ void = "return value doesn't matter"

const callbacks: VoidCallback[] = [];

// ALL of these are valid:
callbacks.push((s) => { console.log(s); });           // returns undefined
callbacks.push((s) => { return s.length; });          // returns number — OK!
callbacks.push((s) => s.toUpperCase());               // returns string — OK!
```

### Why is this the case?

This solves a real problem:

```typescript annotated
const numbers: number[] = [];

// forEach expects: (value) => void
// push returns: number (the new array length)
[1, 2, 3].forEach(n => numbers.push(n));
//                      ^^^^^^^^^^^
//                      push() returns number — but forEach expects void
//                      Still works! Because void callbacks may return values.
```

If void callbacks weren't allowed to return values, this
everyday pattern would be a compiler error. TypeScript is
**intentionally lenient** here.

> 📖 **Background: Substitutability Principle**
>
> This behavior is based on the **Liskov Substitution Principle** (LSP):
> A function that can do "more" (returns a value) should be
> usable everywhere a function that does "less" is expected
> (returns nothing). A function `() => number` IS a
> `() => void` function — it simply does more than promised.
>
> Barbara Liskov formulated this principle in 1987 — it is one of the
> SOLID principles and fundamental to object-oriented design.

### CAUTION: void with direct return annotation

```typescript annotated
// With a DIRECT function declaration, void is STRICT:
function doSomething(): void {
  return 42;
//^^^^^^ Error! Type 'number' is not assignable to type 'void'
}

// Only with CALLBACK TYPES is void LENIENT:
type Callback = () => void;
const fn: Callback = () => 42;  // OK! Callback void is lenient
```

> 💭 **Food for thought:** Why does TypeScript distinguish between "void in
> function declarations" (strict) and "void in callback types" (lenient)?
>
> **Answer:** With a function declaration, YOU control the
> return type — if you say void, you mean it. With a callback
> type, SOMEONE ELSE defines the interface and is only saying
> "I don't care about the return value." These two situations have
> different intentions.

---

## Callbacks with Multiple Signatures

Sometimes a callback needs different forms:

```typescript annotated
type EventHandler =
  | ((event: MouseEvent) => void)
  | ((event: KeyboardEvent) => void);
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//  Union of callback types

// BUT: This is almost never useful, because you then can't
// call the function with EITHER of the two event types.
// Better: generics or overloads.
```

---

## Generic Callbacks

For flexible, reusable callbacks:

```typescript annotated
// Generic callback: type is determined at the call site
type Mapper<T, U> = (item: T, index: number) => U;
//          ^^^^    ^^^^^^^^  ^^^^^^^^^^^^     ^
//          Generics Parameter Index info       Return generic

function mapArray<T, U>(items: T[], mapper: Mapper<T, U>): U[] {
//                ^^^^                       ^^^^^^^^^^^
//                Generic parameters          Callback with generics
  return items.map((item, index) => mapper(item, index));
}

// TypeScript infers T and U from the arguments:
const lengths = mapArray(["hello", "world"], (s) => s.length);
//    ^^^^^^^ number[]
// T = string (inferred from the array)
// U = number (inferred from the callback return)

const doubled = mapArray([1, 2, 3], (n) => n * 2);
//    ^^^^^^^ number[]
// T = number, U = number
```

### Callback with Constraints

```typescript annotated
type Comparable<T> = (a: T, b: T) => number;

function sortBy<T>(items: T[], compare: Comparable<T>): T[] {
  return [...items].sort(compare);
//       ^^^^^^^^^^^ Create a copy, don't mutate the original
}

const sorted = sortBy(
  [{ name: "Charlie" }, { name: "Anna" }, { name: "Bob" }],
  (a, b) => a.name.localeCompare(b.name)
);
// [{ name: "Anna" }, { name: "Bob" }, { name: "Charlie" }]
```

---

## Common Callback Patterns

### 1. Error-First Callbacks (Node.js Style)

```typescript annotated
type NodeCallback<T> = (error: Error | null, data?: T) => void;
//                      ^^^^^^^^^^^^^^^^        ^^^^
//                      First param = Error    Second = Data (optional)

function readFile(path: string, callback: NodeCallback<string>): void {
  // Simulates async reading
  try {
    const content = "File content...";
    callback(null, content);     // Success: error = null, data = content
  } catch (e) {
    callback(e as Error);        // Error: error = Error, data = undefined
  }
}
```

### 2. Event Listener Pattern

```typescript
type EventListener<T> = (event: T) => void;
type Unsubscribe = () => void;

function on<T>(eventName: string, listener: EventListener<T>): Unsubscribe {
  // Register listener...
  return () => {
    // Remove listener...
  };
}

const unsub = on<MouseEvent>("click", (e) => {
  console.log(e.clientX, e.clientY);
});

// Later: remove listener
unsub();
```

### 3. Middleware Pattern (Express Style)

```typescript
type Middleware = (
  req: { url: string; method: string },
  res: { send: (body: string) => void },
  next: () => void,
) => void;

const logger: Middleware = (req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();  // Call next middleware
};
```

> 🧠 **Explain to yourself:** Why does `forEach` specify the return type `void` for its callback, even though `.map()` uses the return value? What would be the problem if forEach paid attention to the return type?
> **Key points:** forEach intentionally ignores the return value | map needs it to build the new array | If forEach paid attention to the return, you couldn't use `push` as a callback | void = "I don't care what you return"

---

## What you've learned

- Callbacks are typed with **function type expressions**: `(param: T) => U`
- **void callbacks** may return values — the value is ignored (substitutability)
- With **direct function declarations**, void is **strict** — only lenient with callback types
- **Generic callbacks** (`Mapper<T, U>`) make callback types reusable
- The most common patterns: Error-First, Event Listener, Middleware

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> type Predicate<T> = (item: T) => boolean;
>
> function filterArray<T>(items: T[], predicate: Predicate<T>): T[] {
>   return items.filter(predicate);
> }
>
> // Test it:
> const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
> const even = filterArray(numbers, n => n % 2 === 0);
> console.log(even);  // [2, 4, 6, 8, 10]
>
> // What is the type of 'even'? Why does TypeScript infer number[]
> // and not (number | undefined)[] ?
> ```
>
> TypeScript infers `T = number` from the first argument and therefore knows
> that `filterArray` returns a `number[]`. The `Predicate<T>` type
> carries no information about the return type — only about the input.

**In your Angular project:** RxJS operators are built entirely from generic
callbacks. Every time you use `pipe()`, you're working with
the same patterns:

```typescript
import { map, filter } from 'rxjs/operators';

// map() internally is a generic callback type: Mapper<T, U>
this.users$.pipe(
  filter((user: User) => user.active),   // Predicate<User>
  map((user: User) => user.name),        // Mapper<User, string>
).subscribe((name: string) => {          // VoidCallback with string
  console.log(name);
});

// TypeScript infers the entire type flow:
// Observable<User> → filter → Observable<User> → map → Observable<string>
```

In React you see the same with `Array.prototype` methods on state:
`users.filter(u => u.active).map(u => u.name)` — all types flow through.

**Key concept to remember:** void in callbacks means "I don't care what you return" — not "no return value may exist".

---

> **Pause point** — Callbacks are the bread and butter of JavaScript.
> Next up: The `this` parameter — one of the most confusing topics.
>
> Continue with: [Section 05: The this Parameter](./05-this-parameter.md)