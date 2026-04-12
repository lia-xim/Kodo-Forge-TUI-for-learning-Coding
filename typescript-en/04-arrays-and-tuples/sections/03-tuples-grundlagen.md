# Section 3: Tuples — Fundamentals

> **Estimated reading time:** ~10 minutes
>
> **What you'll learn here:**
> - What a Tuple really is — and what it is not
> - Named/Labeled Tuples for better readability
> - Optional Tuple elements and rest elements
> - How the `.length` type differs between arrays and Tuples
> - Why React's `useState` returns a Tuple (and not an Object)

---

## What is a Tuple?

A Tuple is an array with a **fixed length** and a **defined type per
position**.

```typescript
// Tuple: exactly 2 elements, string at position 0, number at position 1
let person: [string, number] = ["Alice", 30];

// Access — TypeScript knows the type of each position!
const name: string = person[0];    // string
const alter: number = person[1];   // number

// ERROR: Too many / too few elements
// let falsch1: [string, number] = ["Alice"];            // Error!
// let falsch2: [string, number] = ["Alice", 30, true];  // Error!
```

> **Background: Tuples in other languages.** In Python, Tuples are a
> distinct data type that is **immutable** — once created, you cannot
> change them. In TypeScript, a Tuple is **not its own data type**.
> It is a perfectly normal JavaScript array to which TypeScript enforces
> a fixed structure at the type level. This means: a TypeScript Tuple is
> **mutable** by default (you can overwrite elements), unless you
> explicitly make it `readonly`. This surprises developers coming
> from Python.

### The fundamental principle

A Tuple is **not an array with a restricted length**. Conceptually it is
something entirely different: a Tuple is a **positionally typed structure** —
similar to an Object, but with numeric indices instead of named keys.

```typescript annotated
// Tuple and Object express similar things:
type PersonTuple = [string, number, boolean];  // ← Type per position (index 0, 1, 2)
type PersonObject = { name: string; alter: number; aktiv: boolean }; // ← Type per named key

// Tuple access is position-based:
const p: PersonTuple = ["Alice", 30, true];
const name: string = p[0];   // ← Position 0 is always string
const alter: number = p[1];  // ← Position 1 is always number — no guessing needed
// p[3];                      // ← ERROR: Index 3 does not exist in the Tuple
```

**Explain to yourself:** What is the conceptual difference between a Tuple and an array — even though both are JavaScript arrays at runtime?
- An array is a **homogeneous list**: arbitrary length, all elements of the same type
- A Tuple is a **positionally typed structure**: fixed length, each position has its own type
- TypeScript enforces the Tuple type only at compile time — at runtime both are plain JavaScript arrays

### Tuple vs Array — the key difference

```typescript
const arr: string[] = ["Alice", "30"];
//    arr[0] is string
//    arr[1] is string
//    arr[99] is string  (no error, just undefined at runtime)

const tup: [string, number] = ["Alice", 30];
//    tup[0] is string
//    tup[1] is number
//    tup[2]  // Error! Tuple type has no element at index '2'
```

**The `.length` type is also different:**

```typescript
const arr: string[] = ["a", "b"];
const tup: [string, number] = ["a", 1];

type ArrLen = typeof arr.length;  // number  (can be anything)
type TupLen = typeof tup.length;  // 2       (literal type!)
```

> **Deep dive:** The fact that `.length` is a literal type for Tuples has
> practical consequences. TypeScript can use it to statically verify
> whether you are accessing a valid index. For arrays, `.length` is just
> `number` — TypeScript does not know how many elements are actually
> present.

---

## Named / Labeled Tuples

Since TypeScript 4.0, Tuple elements can be named. This greatly improves
readability and IDE support:

```typescript
// Without labels — what is what?
type Punkt = [number, number];

// With labels — much clearer!
type PunktBenannt = [x: number, y: number];

// Another example:
type HTTPAntwort = [status: number, body: string, headers: Record<string, string>];
```

The labels have **no effect on the type** — they are purely
documentary. But they appear in error messages and IDE tooltips:

```typescript
function getUser(): [id: number, name: string, active: boolean] {
  return [1, "Alice", true];
}

const [id, name, active] = getUser();
//     ^-- IDE shows: id: number
//          ^-- IDE shows: name: string
//                  ^-- IDE shows: active: boolean
```

> **Experiment:** Write the following in your IDE:
> ```typescript
> function getUser(): [id: number, name: string] {
>   return [1, "Alice"];
> }
> const result = getUser();
> ```
> Hover over `result` — do you see the labels `id` and `name` in the tooltip?
> Now remove the labels from the signature and hover again. Notice
> the difference in the IDE display: without labels, you only see `[number, string]`.

**Important restriction:** If a Tuple has labels, **all**
elements must have labels, or none at all. Mixing is not allowed:

```typescript
// type Falsch = [name: string, number]; // ERROR: Either all or none!
type Richtig = [name: string, age: number];
```

> **Practical tip:** Use Named Tuples generously — they cost nothing
> (labels are removed during compilation) and make error messages
> significantly clearer. Labels are especially valuable for functions
> that return Tuples.

---

## Optional Tuple Elements

Tuple elements can be made optional with `?`:

```typescript
type FlexiblerPunkt = [x: number, y: number, z?: number];

const punkt2D: FlexiblerPunkt = [10, 20];        // ok
const punkt3D: FlexiblerPunkt = [10, 20, 30];    // ok
// const falsch: FlexiblerPunkt = [10];           // Error! y is missing
```

**Important:** Optional elements must come **at the end** — just like
optional function parameters:

```typescript
// type Falsch = [a?: string, b: number]; // Error!
```

**What happens to `.length`?** With optional elements, the
length type becomes a union:

```typescript
type FlexPunkt = [number, number, number?];
type FlexLen = FlexPunkt["length"]; // 2 | 3
```

---

## Rest Elements in Tuples

With `...`, Tuples can have a variable number of elements at the end:

```typescript
// First value is string, followed by any number of numbers
type StringUndZahlen = [string, ...number[]];

const a: StringUndZahlen = ["summe", 1, 2, 3];        // ok
const b: StringUndZahlen = ["leer"];                   // ok (0 numbers)
const c: StringUndZahlen = ["mix", 1, 2, 3, 4, 5];   // ok
```

**Since TypeScript 4.2:** Rest elements can also appear **in the middle**:

```typescript
type Sandwich = [string, ...number[], string];

const s: Sandwich = ["start", 1, 2, 3, "end"];  // ok
```

> **Background:** This capability was a major step forward. Previously
> rest elements could only appear at the end. Expanding to middle
> positions made it possible to express patterns like "a header, arbitrary
> data, a footer" at the type level.

### Spread Operator with Tuple Types

```typescript
type Head = [string, number];
type Tail = [boolean, string];

// Spread combines Tuples:
type Combined = [...Head, ...Tail];
// Result: [string, number, boolean, string]

// Practical for function parameters:
function logAll(...args: [string, number, ...boolean[]]): void {
  const [name, count, ...flags] = args;
  console.log(name, count, flags);
}

logAll("test", 5, true, false, true);
```

---

> **Think about it:** If you have a Tuple `[string, ...number[], boolean]` —
> how can TypeScript recognize the last position as `boolean` when the
> middle is of arbitrary length?
>
> **Answer:** TypeScript checks from **both ends** simultaneously. It knows:
> position 0 is `string`, the last position is `boolean`, and everything
> in between must be `number`. This is similar to a regex with start and
> end anchors: `^string, ...numbers, boolean$`.

## Why useState Returns a Tuple

> **Background: A design decision that defined a pattern.**
>
> React's `useState` could have returned an Object:
> ```typescript
> // Hypothetical: useState with Object return
> const { value: count, setValue: setCount } = useState(0);
> ```
>
> The team deliberately chose to return a Tuple:
> ```typescript
> // Actual: useState with Tuple return
> const [count, setCount] = useState(0);
> ```
>
> **Why?** Because of **free naming when destructuring**. With an
> Object you would always have `value` and `setValue` (or need to use
> aliasing). With a Tuple you choose the names freely:
> ```typescript
> const [count, setCount] = useState(0);
> const [name, setName] = useState("");
> const [isOpen, setIsOpen] = useState(false);
> ```
>
> This pattern proved so successful that it is now considered a standard
> convention: **When a function returns exactly two related values (a value
> and an action on it), use a Tuple.**
> Angular's `signal()` took a different approach (an object with a `.set()`
> method), because Signals can do more than just get/set.

---

## What you've learned

- A Tuple is a **positionally typed structure** with a fixed length
  and type per position
- TypeScript Tuples are **not their own data type** — at runtime they are
  plain arrays
- Unlike Python Tuples, they are **mutable by default**
- Named Tuples improve IDE support and error messages, but have no
  effect on the type
- Optional elements must come at the end, changing the `.length` type to
  a union
- Rest elements allow variable length even in Tuples (also in the middle
  since TS 4.2)
- The Tuple return pattern (as with `useState`) enables free
  naming when destructuring

**Pause point:** The next section covers advanced Tuple
features: variadic Tuples, `as const`, and `satisfies`.

---

[<-- Previous Section: Readonly Arrays](02-readonly-arrays.md) | [Back to Overview](../README.md) | [Next Section: Advanced Tuples -->](04-fortgeschrittene-tuples.md)