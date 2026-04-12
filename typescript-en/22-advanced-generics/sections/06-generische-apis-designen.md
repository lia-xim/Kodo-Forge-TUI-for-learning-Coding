# Section 6: Designing Generic APIs

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Advanced Constraints](./05-fortgeschrittene-constraints.md)
> Next section: [07 - NoInfer and Inference Control](./07-noinfer-und-inferenz-kontrolle.md)

---

## What you'll learn here

- The **Rule of Two**: When a type parameter is useful and when it isn't
- **Overloads vs Generics**: When to use which tool
- How TypeScript's **inference heuristics** work and how to guide them
- **Default type parameters** and their interaction with inference
- Practical principles for **ergonomic** generic APIs

---

## "Generics are a tool, not a goal"
<!-- section:summary -->
The most common mistake among advanced TypeScript developers: Too

<!-- depth:standard -->
The most common mistake among advanced TypeScript developers: Too
many generics. You've learned this powerful tool and want to use it
everywhere. But generics that don't establish a relationship only add
complexity.

```typescript annotated
// ANTI-PATTERN: T only appears once
function logValue<T>(value: T): void {
  console.log(value);
}
// ^^^ T is only used as a parameter, never in the return type.
//     Nothing is correlated — T carries no information.
//     Identical to: function logValue(value: unknown): void

// GOOD: T appears twice (Input → Output)
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
// ^^^ T connects the array element type with the return type.
//     THAT is the purpose of generics: establishing relationships.

// GOOD: T appears twice (multiple parameters)
function merge<T>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}
// ^^^ T connects target and source — source must match target.
```

---

> 📖 **Background: "Generics are a tool, not a goal"**
>
> This phrase comes from the official TypeScript documentation. The
> TypeScript team observed that developers, after learning generics,
> tend to use them everywhere — even where they add no value.
>
> The rule is simple: A type parameter must appear at least **twice**
> to be useful. Once in the input and once in the output
> (or in two different parameters). If it only appears once,
> it can be replaced with `unknown` or a concrete type.
>
> This is called the **"Rule of Two"**. It's the simplest test to
> decide whether a generic is worthwhile.

---

<!-- /depth -->
## Overloads vs Generics
<!-- section:summary -->
When should you use function overloads and when generics?

<!-- depth:standard -->
When should you use function overloads and when generics?

```typescript annotated
// OVERLOADS: Fixed set of discrete input-output relationships
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number): string | number {
  if (typeof input === "string") return parseInt(input, 10);
  return String(input);
}
// ^^^ Two discrete cases: string→number and number→string.
//     This is a MAPPING, not a parametric relationship.

// GENERICS: Parametric relationship — the output type DEPENDS on the input
function identity<T>(value: T): T {
  return value;
}
// ^^^ For EVERY type T: input and output have the same type.
//     This is a general rule, not a discrete mapping.

// WRONG: Generic where overload would be better
function badParse<T extends string | number>(input: T): T extends string ? number : string {
  // Complex, hard to read, and the implementation
  // requires type assertions...
  return (typeof input === "string" ? parseInt(input as string, 10) : String(input)) as any;
}
// ^^^ The generic version is WORSE: harder to read,
//     requires type assertions, and offers no advantage.
```

| Criterion | Overloads | Generics |
|---|---|---|
| Finite cases | Yes (2-5 overloads) | No |
| Parametric relationship | No | Yes |
| Implementation | Simpler | Can be complex |
| Extensibility | Add new overload | New types automatically |
| Error messages | Clear | Sometimes cryptic |

---

> 🧠 **Explain it to yourself:** When is a function overload better than a
> generic? Think of a concrete example from your code.
>
> **Key points:** Overload = "if A, then B; if C, then D" (discrete) |
> Generic = "for all T: f(T) → T" (parametric) |
> Overloads for event handlers (click → MouseEvent, keydown → KeyboardEvent) |
> Generics for containers (Array<T>.map → Array<U>)

---

<!-- /depth -->
## Guiding Inference
<!-- section:summary -->
TypeScript's type inference is powerful — but fragile. Good API designers

<!-- depth:standard -->
TypeScript's type inference is powerful — but fragile. Good API designers
know how to guide inference in the right direction:

```typescript annotated
// Problem: Inference conflict
function createPair<T>(a: T, b: T): [T, T] {
  return [a, b];
}

const pair1 = createPair("hello", "world"); // OK: T = string
const pair2 = createPair("hello", 42);
// ^^^ ERROR! "hello" and 42 have different types.
//     TypeScript cannot infer T as both string AND number simultaneously.

// Solution 1: Two type parameters
function createPair2<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
const pair3 = createPair2("hello", 42); // OK: A = string, B = number

// Solution 2: Inference at only ONE location
function createArrayOf<T>(item: T, count: number): T[] {
  return Array(count).fill(item);
}
// ^^^ T is only inferred from `item` — no conflicts.
//     `count` has its own type (number), independent of T.
```

---

<!-- /depth -->
## Default Type Parameters and Inference
<!-- section:summary -->
Defaults interact with inference according to a clear priority:

<!-- depth:standard -->
Defaults interact with inference according to a clear priority:

```typescript annotated
// Priority: Explicit > Inference > Default

function createBox<T = string>(value?: T): { value: T | undefined } {
  return { value };
}

// 1. EXPLICIT: Highest priority
const box1 = createBox<number>(42);     // T = number (explicit)
const box2 = createBox<number>();        // T = number (explicit, no argument)

// 2. INFERENCE: When derivable from arguments
const box3 = createBox(42);             // T = number (inferred from 42)
const box4 = createBox("hello");        // T = string (inferred)

// 3. DEFAULT: When no inference is possible
const box5 = createBox();              // T = string (Default!)
// ^^^ No argument, no explicit type → default kicks in.

// Conflict: Explicit vs Argument
// const box6 = createBox<number>("hello"); // ERROR: string != number
// ^^^ Explicit takes precedence — TypeScript checks whether the argument matches.
```

---

> 🤔 **Think about it:** You're designing an HTTP client function. Which design
> is better and why?
>
> ```typescript
> // Design A: One type parameter for everything
> function fetch<T>(url: string, options?: RequestInit): Promise<T>;
>
> // Design B: Derive T from the schema
> function fetch<T>(url: string, schema: Schema<T>): Promise<T>;
>
> // Design C: Overloads for known endpoints
> function fetch(url: "/users"): Promise<User[]>;
> function fetch(url: "/posts"): Promise<Post[]>;
> ```
>
> Analysis: Design A is unsafe (`T` is never checked — it's a cast).
> Design B is the safest (schema validates T at runtime).
> Design C is the most precise for known endpoints.

---

> 🔬 **Experiment:** Write a `pipe()` function with generics that
> chains up to 3 transformations:
>
> ```typescript
> function pipe<A, B>(value: A, fn1: (a: A) => B): B;
> function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
> function pipe<A, B, C, D>(
>   value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D
> ): D;
>
> // Test:
> const result = pipe(
>   "42",
>   s => parseInt(s, 10),  // string → number
>   n => n * 2,             // number → number
>   n => `Result: ${n}`     // number → string
> );
> // result should be "Result: 84"
> ```
>
> Note: Here overloads AND generics are combined! The overloads
> define the number of steps, the generics the types.

---

<!-- /depth -->
## Practical Design Principles
<!-- section:summary -->
Here are the most important rules for good generic API design:

<!-- depth:standard -->
Here are the most important rules for good generic API design:

```typescript annotated
// PRINCIPLE 1: Rule of Two
// Type parameter must appear at least 2x
function good<T>(arr: T[]): T { return arr[0]; }     // T: 2x ✓
function bad<T>(x: T): void { console.log(x); }       // T: 1x ✗

// PRINCIPLE 2: Fewer type parameters = better
// Maximum 3 type parameters for public APIs
function ok<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
function tooMuch<A, B, C, D, E>(a: A, b: B, c: C): D { /* ... */ }
// ^^^ 5 type parameters — hardly anyone understands the signature.

// PRINCIPLE 3: Inference where possible
// Users should not HAVE to specify type parameters
function wrap<T>(value: T): { value: T } { return { value }; }
wrap(42); // T = number, automatically inferred ✓
// wrap<number>(42); // Possible, but unnecessary

// PRINCIPLE 4: Good defaults
function createState<T = unknown>(initial?: T): State<T> { /* ... */ }
// ^^^ `unknown` is a safe default (better than `any`!)

// PRINCIPLE 5: Constraints as tight as needed, as wide as possible
function getId<T extends { id: number }>(item: T): number { return item.id; }
// ^^^ Only `id` is needed — not the entire entity interface.
//     The tighter the constraint, the more types fit.
```

---

<!-- /depth -->
## The Framework Connection

> ⚛️ **React:** `useQuery<TData, TError>` from React Query uses two
> default type parameters: `TData = unknown` and `TError = unknown`. Most
> users only need to specify TData — TError stays at its default.
> That's good API design: inference for the main case, defaults for
> the rest.
>
> 🅰️ **Angular:** `inject<T>(token: ProviderToken<T>): T` infers T
> from the token type. You write `inject(UserService)`, not
> `inject<UserService>(UserService)`. The inference site is clear:
> one parameter, one type parameter, perfect correlation.

---

## Anti-Patterns Summarized

```typescript annotated
// ❌ ANTI-PATTERN 1: T only once (Rule of Two violated)
function log<T>(x: T): void { }
// → Better: function log(x: unknown): void { }

// ❌ ANTI-PATTERN 2: Generic with immediate cast
function unsafeParse<T>(json: string): T {
  return JSON.parse(json) as T; // NO type safety!
}
// → Better: Schema-based validation (Zod, io-ts)

// ❌ ANTI-PATTERN 3: Too many type parameters
function transform<A, B, C, D, E>(input: A, f1: (a: A) => B, ...): E { }
// → Better: Split into smaller functions

// ❌ ANTI-PATTERN 4: any as default
function createStore<T = any>(): Store<T> { }
// → Better: <T = unknown> — safe!

// ❌ ANTI-PATTERN 5: Generic where union suffices
function format<T extends string | number>(value: T): string { }
// → Better: function format(value: string | number): string { }
//   (T is only used once)
```

---

## Checklist for Generic APIs
<!-- section:summary -->
Before you publish a generic function or generic type,

<!-- depth:standard -->
Before you publish a generic function or generic type,
check:

1. **Rule of Two:** Does every type parameter appear at least 2x?
2. **Inference:** Can TypeScript derive the type parameters automatically?
3. **Defaults:** Are there sensible default type parameters?
4. **Constraints:** Are they tight enough for safety, wide enough for
   flexibility?
5. **Variance:** Are `in`/`out` modifiers set (for interfaces)?
6. **Overloads:** Would overloads be clearer than a generic?
7. **Documentation:** Is the signature understandable without docs?

---

<!-- /depth -->
## What you've learned

- The **Rule of Two**: A type parameter must appear at least 2x
  (Input ↔ Output). Otherwise use `unknown` or a union.
- **Overloads vs Generics**: Overloads for discrete mappings (if A then B),
  generics for parametric relationships (for all T).
- **Inference** has priority: Explicit > Inference > Default.
  Good APIs rarely need explicit type parameters.
- **Default type parameters** with `unknown` (never `any`!) as fallback.
- **Anti-patterns**: T only once, immediate cast, too many parameters,
  generic where union suffices.

> **Core concept:** Generics are powerful, but power comes with
> responsibility. The best generic is the one the user never sees
> — because TypeScript infers everything automatically. "Generics are a
> tool, not a goal."

---

---

> **Break point** — Good moment for a break. You've internalized the
> core design principles for generic APIs.
>
> Continue with: [Section 07 - NoInfer and Inference Control](./07-noinfer-und-inferenz-kontrolle.md)