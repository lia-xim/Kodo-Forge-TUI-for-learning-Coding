# Section 3: Inferred Type Predicates — TypeScript 5.5

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Modern Modules](./02-moderne-module-verbatim-bundler.md)
> Next section: [04 - Array and Control Flow](./04-array-und-controlflow-improvements.md)

---

## What you'll learn here

- Why `.filter(x => x !== null)` **returned the wrong type for years**
- What **type predicates** are and how TypeScript now **infers them automatically**
- How TypeScript 5.5 analyzes this behavior and what the **limits** of the system are
- Why this feature is especially useful in **Angular Signals** and **React**

---

## The long-standing annoyance

If you ask TypeScript developers which type limitation annoyed them the most,
many will give the same answer:

```typescript
const numbers = [1, null, 2, null, 3];
const filtered = numbers.filter(x => x !== null);
// What is the type of filtered?

// EXPECTATION: number[]
// REALITY (before TS 5.5): (number | null)[]
```

Wait. You just explicitly filtered out `null`. TypeScript saw that.
And yet TypeScript still claims `null` could be in there?

Yes. And it had a reason — a poor one, but understandable.

### Why TypeScript didn't know

The problem lies in how `Array.prototype.filter` is typed:

```typescript
// The naive signature of filter() (simplified):
filter(predicate: (value: T) => boolean): T[];
//                              ^^^^^^^ boolean — not enough information!
```

The return type `boolean` tells TypeScript: "This function returns true or false."
But it does **not** say: "When this function returns true, the value is not null."

To type this correctly, you need a **type predicate** — a special signature
that says: "If true, then x is of type T":

```typescript
// Manual type predicate (required before TS 5.5):
function isNotNull<T>(x: T | null): x is T {
  //                                ^^^^^^ Type predicate!
  return x !== null;
}

const filtered = numbers.filter(isNotNull);
// Now: filtered is number[] -- correct!
// But: You had to write isNotNull manually. Annoying.
```

That was the world before TypeScript 5.5: you wrote type predicate helper functions
or ignored the problem (and lived with `(number | null)[]`).

> 📖 **Background: 3,000 upvotes in the issue tracker**
>
> This problem existed for years as a GitHub issue in the TypeScript repository.
> The issue titled "Improve type inference for filter() callbacks" gathered
> over 3,000 upvotes — one of the highest-rated feature requests.
>
> Why did it take so long? The problem is algorithmically non-trivial.
> TypeScript has to analyze a function and decide: "Does this function
> enforce a type constraint?" That requires **control flow analysis** inside
> the callback function — and doing that correctly for all cases is complex.
>
> The TypeScript 5.5 team, led by Dan Vanderkam (author of
> "Effective TypeScript"), finally implemented an algorithm that solves this
> correctly for the most common patterns. An elegant solution to a years-long problem.

---

## TypeScript 5.5: The solution

Starting with TypeScript 5.5, the compiler automatically analyzes a filter callback
and infers the type predicate:

```typescript
// TypeScript 5.5+:
const numbers = [1, null, 2, null, 3];
const filtered = numbers.filter(x => x !== null);
// filtered: number[]   ← CORRECT! TypeScript infers automatically

// What TypeScript does internally:
// 1. Analyze the callback: (x) => x !== null
// 2. Recognize: if this function returns true, then x is not null
// 3. Infer the implicit type predicate: (x: number | null): x is number
// 4. Apply the predicate to filter(): result is number[]
```

The nice part: you don't need to **change anything**. Your existing code simply
gets typed correctly. That's a TypeScript 5.5 upgrade with no migration.

---

## How the algorithm works

TypeScript 5.5 analyzes the function and checks whether its `true` branch narrows
a type. Specifically:

```typescript annotated
// TypeScript 5.5 infers type predicates for these patterns:

// Pattern 1: Explicit inequality against null/undefined
const withoutNull = items.filter(x => x !== null);
// Infers: (x: T | null): x is T

const withoutUndefined = items.filter(x => x !== undefined);
// Infers: (x: T | undefined): x is T

const withoutNullOrUndefined = items.filter(x => x != null);
// ^ Double != checks for BOTH (null AND undefined)
// Infers: (x: T | null | undefined): x is T

// Pattern 2: typeof checks
const strings = mixed.filter(x => typeof x === 'string');
// Infers: (x: string | number): x is string

// Pattern 3: instanceof checks
const errors = results.filter(x => x instanceof Error);
// Infers: (x: Error | Result): x is Error

// Pattern 4: Truthy checks
const nonEmpty = items.filter(Boolean);
// Infers: removes null, undefined, 0, '' -- and with TypeScript 5.5
// the concrete type is inferred correctly (no boolean-blur)
```

```typescript annotated
// Practical example: more complex types
interface User { id: string; name: string; }
interface Admin extends User { level: number; }

const users: (User | Admin | null)[] = [
  { id: '1', name: 'Alice', level: 3 },
  null,
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie', level: 1 },
];

// Step 1: Remove nulls
const activeUsers = users.filter(u => u !== null);
// activeUsers: (User | Admin)[]   ← null is gone!

// Step 2: Filter only admins
const admins = activeUsers.filter(u => 'level' in u);
// admins: Admin[]   ← TypeScript understands "in" checks as type predicates!
```

> 🧠 **Explain to yourself:** Why does `'level' in u` work as a type predicate?
> What does TypeScript need to know about the object's type and the property for
> this to work correctly?
>
> **Key points:** TypeScript knows: User has no `level` property | Admin has `level` |
> the `in` operator checks property existence | TypeScript 5.5 connects:
> "If `level in u` is true, then u must be Admin" | Works because union types
> can be distinguished by property existence

---

## Type predicates outside of filter()

Inferred type predicates don't only work in `.filter()` — they apply everywhere
a boolean-returning function serves as a type guard:

```typescript annotated
// Custom isAdmin function — no manual type predicate needed!
function isAdmin(user: User | Admin): user is Admin {
  // Before TS 5.5: you HAD to write "user is Admin" manually
  return 'level' in user;
}
// After TS 5.5: TypeScript infers "user is Admin" automatically
// when it's clear the function distinguishes Admin from User

// Usage:
const user: User | Admin = getUser();
if (isAdmin(user)) {
  console.log(user.level);  // TypeScript knows: user is Admin!
}

// Inline in if conditions:
function processResult(result: string | Error) {
  if (result instanceof Error) {
    console.error(result.message); // result: Error
  } else {
    console.log(result.toUpperCase()); // result: string
  }
}
// This already worked before (instanceof narrowing)
// But now it also works in more complex callback scenarios
```

---

## Experiment box: Before/After

Here is the direct comparison between TypeScript 4.x and 5.5:

```typescript
// === BEFORE (TypeScript < 5.5) ===

const ids: (string | null)[] = ['a', null, 'b', null, 'c'];

// Problem: filtered still has (string | null)[]
const filtered = ids.filter(id => id !== null);
// filtered.map(id => id.toUpperCase())
//                       ^^^^^^^^^^^ Error! id could be null

// Workaround 1: Manual type predicate
function isString(x: string | null): x is string {
  return x !== null;
}
const filteredV1 = ids.filter(isString); // string[] -- correct, but extra function

// Workaround 2: Type assertion (dangerous!)
const filteredV2 = ids.filter(id => id !== null) as string[]; // Not recommended

// === AFTER (TypeScript 5.5+) ===

const filteredNew = ids.filter(id => id !== null);
// filteredNew: string[]   ← Correct! No helper function needed
filteredNew.map(id => id.toUpperCase()); // Works without issues!
```

This is one of those moments where TypeScript feels "smarter." The compiler
understands what you mean, not just what you write.

---

## The limits: When TypeScript doesn't recognize it

Honesty matters: TypeScript 5.5 does **not** recognize all type predicate patterns.
More complex logic can exceed the inference algorithm's capabilities:

```typescript
// TypeScript 5.5 recognizes THESE patterns:
items.filter(x => x !== null)            // Direct null check ✓
items.filter(x => typeof x === 'string') // typeof check ✓
items.filter(x => x instanceof Error)   // instanceof check ✓
items.filter(x => Boolean(x))           // Truthy check ✓

// TypeScript 5.5 does NOT recognize these (no automatic predicate):
items.filter(x => {
  // Complex logic with multiple checks:
  if (someExternalCondition) return x !== null;
  return true;  // Hmm -- what's the predicate here?
});
// Result: (string | null)[]  -- no inference

// Solution for complex cases: Manual type predicate (as before 5.5)
items.filter((x): x is string => {
  if (someExternalCondition) return x !== null;
  return true;
});
```

> 💭 **Think about it:** Why can't TypeScript infer the predicate in the complex function?
> What is the compiler missing to decide "if this function returns true, then x is not null"?
>
> **Answer:** Because `return true` without a precondition says: "Even if x could be null,
> I still return true." That means there's no direct causal relationship between
> "return true" and "x is not null". TypeScript needs an unambiguous path: whenever
> true — then x is T. With an external condition, that guarantee breaks.

---

## Angular and React: Practical application

In your Angular project (and in React) you'll encounter this feature constantly:

```typescript annotated
// Angular: Signals with type predicates
import { Signal, computed, signal } from '@angular/core';

const userSignal = signal<User | null>(null);

// Before TS 5.5: userSignal() could be null -- constant null checks
// After TS 5.5 in computed:
const activeUsers = computed(() => {
  const users = usersSignal();
  return users.filter(u => u !== null);
  //                  ^^^^^^^^^^^^^ Type: User[] (not User | null[])
});
// activeUsers: Signal<User[]>   ← Correct without null!
```

```typescript annotated
// React: useState and data transformations
const [items, setItems] = useState<(Product | null)[]>([]);

// Component logic:
const validProducts = items
  .filter(item => item !== null)
  //              ^^^^^^^^^^^^^ TS 5.5: filteredProducts is Product[]
  .filter(item => item.price > 0);
  //              ^^^^ No more error! TypeScript knows: item is Product

// JSX rendering:
return (
  <ul>
    {validProducts.map(product => (
      <li key={product.id}>{product.name}</li>
      //   ^^^^^^^^^^^ Full autocomplete!
    ))}
  </ul>
);
```

```typescript
// Angular HTTP + Signals (realistic example):
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const responses = signal<ApiResponse<User>[]>([]);

// Extract all successful responses:
const successfulUsers = computed(() =>
  responses()
    .map(r => r.data)
    .filter(data => data !== null)
    // TS 5.5: data is now User[], not (User | null)[]
);
```

---

## What you learned

- Before TypeScript 5.5, `.filter(x => x !== null)` still returned `(T | null)[]`
  because `boolean` as a return type doesn't signal a type constraint
- TypeScript 5.5 analyzes callback functions and **automatically** infers the
  implicit type predicate — you write nothing extra
- The algorithm works for direct checks (`!== null`, `typeof`, `instanceof`,
  `in` operator, `Boolean`) but not for complex external conditions
- In Angular Signals and React `useState` pipelines, this feature makes filter chains
  significantly more type-safe — without any manual effort

**Core concept to remember:** TypeScript 5.5 now understands the *intent* of a callback.
`x => x !== null` is not a boolean function — it's a statement: "Only non-null values
may pass." That's a leap from syntax analysis to semantic understanding.

> **Pause point** — Good moment for a short break. Inferred type predicates
> are one of the biggest quality-of-life wins in TypeScript's history.
>
> Continue with: [Section 04: Array and Control Flow](./04-array-und-controlflow-improvements.md)