# Section 1: Types as a Language — Turing Completeness

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Arithmetic at the Type Level](./02-arithmetik-auf-type-level.md)

---

## What you'll learn here

- Why TypeScript's type system is a **language in its own right**
- What **Turing completeness** at the type level means and why it matters
- The fundamental building blocks: Conditional Types, Recursion, and Mapped Types as control flow
- When type-level programming is worthwhile — and when it becomes over-engineering

---

## The type system is a language

Over the past 36 lessons you've used TypeScript's type system to catch
errors. But here's the surprising truth: the type system itself is a
**complete programming language**. It has variables (type aliases),
conditionals (Conditional Types), loops (recursion), data structures
(tuples and objects), and functions (generic types).

Imagine you've laid two sheets of paper on top of each other. The
bottom sheet is JavaScript — the code that runs at runtime. The top
sheet is the type system — a completely separate program that lives
only at compile time. Both sheets follow their own rules, their own
control flow operators, their own data structures. When you write
`T extends string ? A : B`, you're programming the top sheet — and the
TypeScript compiler is your interpreter.

> **Why you should learn this at all:**
>
> You do **NOT** need to write type-level programming to build good
> Angular or React apps. Most developers go their entire career without
> `infer` or recursive Conditional Types.
>
> **BUT:** Once you understand these concepts:
> - You can read library code (Zod, tRPC, React Hook Form) like plain text
> - You know WHY `Partial<User>` works, not just THAT it works
> - You can tell when a library is misusing type-level magic
> - You can build your own utility types instead of waiting for ready-made ones
>
> **This lesson is therefore not a "you must know this" but a
> "do you understand the tools you use every day".**

> 📖 **Background: How TypeScript's type system became Turing complete**
>
> When Anders Hejlsberg designed TypeScript in 2012, the type system was
> intentionally simple: interfaces, union types, a few generics. But with
> every version, features were added — Conditional Types (2018),
> Recursive Type Aliases (2020), Template Literal Types (2020),
> Variadic Tuple Types (2020). At some point the system crossed a
> critical threshold: it became **Turing complete**. That wasn't a
> design goal — it happened as a side effect of giving users ever more
> powerful type tools. Today there are people who have implemented a
> chess computer, a JSON parser, and even a SQL interpreter purely at
> the type level.
>
> The pivotal moment came with **TypeScript 2.8 (2018)**: Conditional
> Types and `infer` made the type system fully expressive for conditional
> logic for the first time. Before that you could only describe types;
> now you could **compute** types. The community recognized the potential
> immediately — within weeks, type-level libraries like `type-fest`
> (Sindre Sorhus) and `ts-toolbelt` (Pierre-Antoine Mills) emerged.
> Today these techniques are built into the core libraries of tRPC,
> Zod, and Prisma.

### What does "Turing complete" mean?

A system is Turing complete if it can **express any computable function**.
For TypeScript's type system that means:

```typescript annotated
// "Variable" — a type alias stores a value
type Message = "Hello";
// ^ Like: const message = "Hello"

// "Conditional" — a Conditional Type is an if/else
type IsString<T> = T extends string ? true : false;
// ^ Like: function isString(t) { return typeof t === "string" }

// "Loop" — recursion replaces for/while
type Repeat<S extends string, N extends number, Acc extends string[] = []> =
  Acc["length"] extends N ? Acc : Repeat<S, N, [...Acc, S]>;
// ^ Like: function repeat(s, n) { while(arr.length < n) arr.push(s); }

// "Data structure" — tuples are arrays, objects are maps
type Pair = [string, number];
type Dict = { [K: string]: boolean };
```

### The parallels to the value level

| Value level (JavaScript)        | Type level (TypeScript)             |
|---------------------------------|-------------------------------------|
| `const x = 42`                  | `type X = 42`                       |
| `if (cond) a else b`            | `T extends U ? A : B`              |
| `while (...) { ... }`           | Recursive type                      |
| `[1, 2, 3]`                     | `[1, 2, 3]` (Tuple)                |
| `{ key: value }`                | `{ key: Type }`                     |
| `function f(x) { ... }`         | `type F<X> = ...`                   |
| `...arr` (Spread)               | `[...T, ...U]` (Variadic Tuples)   |

> 🧠 **Explain it to yourself:** Why is `T extends U ? A : B` the
> most fundamental tool for type-level programming? What role does
> `infer` play in that?
> **Key points:** Conditional Types are the only control flow at the
> type level | `infer` extracts parts of a type into variables |
> Together with recursion this yields a complete language

---

## The three pillars of type-level programming

### 1. Conditional Types as control flow

Conditional Types are your `if/else`. With `infer` they become
pattern matching — similar to `match` in Rust or Scala:

```typescript annotated
// Pattern matching: extract the return type of a function
type ReturnOf<T> =
  T extends (...args: any[]) => infer R  // Check whether T is a function
    ? R                                   // Yes → extract return type R
    : never;                              // No → impossible case
// ^ This is ReturnType<T> from the standard library!

type A = ReturnOf<() => string>;           // string
type B = ReturnOf<(x: number) => boolean>; // boolean
type C = ReturnOf<42>;                     // never — 42 is not a function
```

### 2. Recursion as iteration

The type level has no `for` or `while`. Instead: **recursion**.
A type calls itself until a termination condition is reached:

```typescript annotated
// Remove all 'readonly' modifiers — even nested ones
type DeepMutable<T> =
  T extends ReadonlyArray<infer U>       // Is T a readonly array?
    ? Array<DeepMutable<U>>               // → Make it mutable, go deeper
    : T extends object                    // Is T an object?
      ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
      // ^ -readonly removes readonly, recursive call for values
      : T;                                // Primitive → done
```

### 3. Mapped Types as transformation

Mapped Types iterate over keys — the equivalent of `map()`:

```typescript
type Transform<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
};

// Extract only the method names:
type MethodKeys<T> = Transform<T>[keyof T];
```

> 💭 **Think about it:** If the type system is Turing complete, you
> could theoretically express any algorithm in it. Why should you
> still NOT do that in practice?
>
> **Answer:** Because type-level code is extremely hard to read, debug,
> and maintain. TypeScript also has a **recursion depth of ~1000** and
> compiler performance suffers with complex types. Type-level
> programming is for **library authors** and **critical APIs** —
> not for business logic.

---

## When is type-level programming worth it?

The golden rule: **Use type-level programming when the alternative
would be unsafe code.**

```
Worth it:                               Not worth it:
├── Making library APIs type-safe       ├── Business logic at the type level
├── Router types (URL → parameters)     ├── Computations that belong at runtime
├── Query builders (SQL at type level)  ├── When a simple interface suffices
├── Validation schemas                  └── "Because it's cool"
└── Framework types (Angular/React)
```

The best test: if you're building a type and ask yourself "could I
solve this with a simple generic?" — then do it. Type-level programming
is a tool, not a style statement.

> ⚡ **Angular framework connection:** Angular's `Signal<T>` computes
> the type of `computed()` based on the return type of the passed
> function. That is type-level programming in its purest form:
>
> ```typescript
> // Angular internally — simplified:
> declare function computed<T>(computation: () => T): Signal<T>;
> // ^ T is inferred from the return type of the function
>
> const count = signal(0);
> const doubled = computed(() => count() * 2);
> // ^ doubled: Signal<number> — TypeScript computes this automatically
> ```
>
> This is the same pattern as `ReturnOf<T>` from the code example above.

> ⚡ **React framework connection:** React's `ComponentProps<typeof MyComponent>`
> extracts prop types from a component — without you needing to export
> a separate interface:
>
> ```typescript
> // Instead of: props: ButtonProps (manually exported)
> // Better:
> type ButtonProps = React.ComponentProps<typeof Button>;
> // ^ Extracted automatically from the component definition
>
> // And for HTML elements:
> type DivProps = React.ComponentPropsWithRef<"div">;
> // ^ All native div attributes with correct types
> ```
>
> You've already used this type magic — now you'll learn to build it.

---

## Experiment: Your first type-level algorithm

Build a type that checks whether a string literal starts with a given
prefix:

```typescript
// Step 1: Conditional Type with Template Literal
type StartsWith<S extends string, Prefix extends string> =
  S extends `${Prefix}${string}` ? true : false;

// Test it:
type A = StartsWith<"hello world", "hello">;  // true
type B = StartsWith<"hello world", "world">;  // false
type C = StartsWith<"", "x">;                 // false

// Step 2: Extend it — extract the remainder after the prefix
type AfterPrefix<S extends string, Prefix extends string> =
  S extends `${Prefix}${infer Rest}` ? Rest : never;

type D = AfterPrefix<"api/users/123", "api/">;  // "users/123"
type E = AfterPrefix<"api/users/123", "admin/">; // never

// Experiment: What happens when you apply AfterPrefix to itself?
// type Nested = AfterPrefix<AfterPrefix<"a/b/c", "a/">, "b/">;
// Try it out and think: is this already recursion?
```

Change the `Prefix` type to a union: `"api/" | "admin/"`.
What happens with `StartsWith<"api/users", "api/" | "admin/">`?
Observe the distributivity!

---

## Keeping the language's limits in view

Before you dive into the details, some important context: although the
type system is Turing complete, it has specific constraints you need
to know.

| Constraint | Value | Consequence |
|---|---|---|
| Recursion depth | ~1000 (with TCO) | Deep algorithms need the accumulator pattern |
| Instantiation depth | ~100 levels of nesting | Deeply nested generics will fail |
| Union width | A few thousand members | Large string unions become slow |
| Compile time | Grows quadratically | Complex types slow down the editor |

> 💭 **Think about it:** If TypeScript's type system is Turing complete
> and can theoretically express any algorithm — why do type-level
> libraries like `ts-toolbelt` and `type-fest` still exist? What do
> they add?
>
> **Answer:** Three things: First, **tested implementations** —
> edge-case handling for `never`, `any`, and `unknown` is non-trivial.
> Second, **documentation** — type-level code is hard to read; good
> libraries explain every type. Third, **performance** — optimized
> implementations that push the recursion limit without exceeding it.

---

## What you've learned

- TypeScript's type system is a **Turing-complete language** with variables, conditionals, loops, and data structures
- The three pillars: **Conditional Types** (control flow), **Recursion** (iteration), **Mapped Types** (transformation)
- `infer` is the key to pattern matching at the type level
- Type-level programming pays off for **library APIs and critical interfaces** — not for business logic
- The language has limits: recursion depth, compile time, readability — knowing these is part of the craft

> 🧠 **Explain it to yourself:** When someone says "TypeScript's type
> system is a programming language", what exactly do they mean? What
> limitations does this "language" have compared to JavaScript?
> **Key points:** All building blocks of a programming language are
> present | Limitations: recursion depth, no I/O, no side effects,
> hard to debug | Compile time only, not runtime | No debugging tool
> like console.log — only hover types in the editor

**Core concept to remember:** The type system has two layers — the simple one (annotations, interfaces) and the programmatic one (Conditional Types, recursion, infer). The programmatic layer is a language within the language. Use it where it delivers real value: at the boundaries between units of code.

---

> **Pause point** — You've understood the mental model: types are not
> just annotations, they are a program. From here on it's about
> concrete techniques.
>
> Continue with: [Section 02: Arithmetic at the Type Level](./02-arithmetik-auf-type-level.md)