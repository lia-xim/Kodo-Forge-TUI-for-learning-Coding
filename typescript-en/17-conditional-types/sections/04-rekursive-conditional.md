# Section 4: Recursive Conditional Types — Types That Call Themselves

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Distributive Conditional Types](./03-distributive-types.md)
> Next section: [05 - Practical Patterns](./05-praxis-patterns.md)

---

## What you'll learn here

- What recursive types are and why TypeScript needs them
- How to build `Flatten`, `DeepAwaited`, and `DeepPartial`
- The JSON type as an example of self-reference without Conditional Types
- TypeScript's recursion limits — and what to do when you hit them
- Performance considerations with deep recursion

---

## The core idea: A type that calls itself

You're familiar with recursive functions: a function that calls itself until a termination condition kicks in. Recursive types work the same way — just at the type level.

```typescript
// Recursive function (runtime):
function sum(n: number): number {
  if (n <= 0) return 0;        // termination
  return n + sum(n - 1);       // self-call
}

// Recursive type (compile time):
type Flatten<T> = T extends (infer U)[]
  ? Flatten<U>    // self-call: go deeper into the array
  : T;            // termination: no more array found
```

The mechanism is identical: a condition (is T an array?), a recursive branch, and a terminating branch.

---

## Background: Recursive types in TypeScript 4.1

Recursive conditional types existed before, but in TypeScript **4.1** (November 2020) they were massively improved. The team added "tail recursion optimization for conditional types" — a term from functional programming.

Before 4.1, TypeScript couldn't evaluate deep recursion efficiently and would bail out early with the error `"Type instantiation is excessively deep and possibly infinite"`. After 4.1, TypeScript can process many common patterns more efficiently.

At the same time, **Template Literal Types** were introduced in 4.1 — and they rely heavily on recursion. Without the improvements in 4.1, `TrimLeft<" hello ">` wouldn't have been possible.

The RFC for this change came from Ryan Cavanaugh (the TypeScript team lead), who recognized that the old implementation built a stack that grew linearly with recursion depth — a clear performance bottleneck.

---

## Flatten: Resolving nested arrays

The prime example of recursive types is `Flatten` — a type that reduces arbitrarily deep arrays down to their element type:

```typescript annotated
type Flatten<T> =
  T extends (infer U)[]   // Is T an array? If so, capture the element type as U
  ? Flatten<U>            // Call Flatten recursively with the element type
  : T;                    // No more array: terminate and return T

// Trace for Flatten<string[][]>:
// Flatten<string[][]>
//   -> Flatten<string[]>   (U = string[])
//   -> Flatten<string>     (U = string)
//   -> string              (not an array, termination)

type A = Flatten<string[]>;          // string
type B = Flatten<string[][]>;        // string
type C = Flatten<string[][][]>;      // string
type D = Flatten<number[][]>;        // number
type E = Flatten<string>;            // string (not an array: pass-through)
type F = Flatten<(string | number)[]>; // string | number
```

Note: `Flatten` resolves **arbitrarily deep** arrays. There's no limit at two or three levels — it goes as deep as TypeScript can trace the recursion.

---

## Annotated code: DeepPartial

`Partial<T>` makes all properties optional — but only one level deep. `DeepPartial<T>` does this recursively for all nested objects:

```typescript annotated
type DeepPartial<T> =
  T extends object              // Is T an object?
    ? T extends Function        //   Is it a function?
      ? T                       //     Leave functions unchanged
      : {                       //     Otherwise: Mapped Type with recursion
          [K in keyof T]?:      //     Make each property optional
            DeepPartial<T[K]>;  //     Recurse into the property type
        }
    : T;                        // Not an object (primitive): unchanged

// Example: A config structure with nesting:
interface AppConfig {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    url: string;
    poolSize: number;
  };
  debug: boolean;
}

type PartialConfig = DeepPartial<AppConfig>;
// {
//   server?: {
//     host?: string;
//     port?: number;
//     ssl?: {
//       enabled?: boolean;  <- three levels deep and optional!
//       cert?: string;
//     };
//   };
//   database?: { url?: string; poolSize?: number };
//   debug?: boolean;
// }

// Useful for config merging:
function mergeConfig(base: AppConfig, override: PartialConfig): AppConfig {
  return { ...base, ...override } as AppConfig; // simplified
}
```

---

## The JSON type: Recursion without Conditional Types

Not all recursive types need Conditional Types. Sometimes a direct self-reference in a union is enough:

```typescript annotated
// JSON can contain the following values:
type JsonValue =
  | string                        // "hello"
  | number                        // 42
  | boolean                       // true
  | null                          // null
  | JsonValue[]                   // [1, "two", [3, 4]]  — array of JsonValue!
  | { [key: string]: JsonValue }; // { a: 1, b: { c: 2 } } — object of JsonValue!
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//   These two lines are the recursion: JsonValue contains JsonValue

// TypeScript resolves this correctly:
const data: JsonValue = {
  name: "Max",
  age: 30,
  tags: ["admin", "user"],
  address: {               // Nested object: also JsonValue
    city: "Berlin",
  },
};
```

The interesting part: TypeScript has no problem with this kind of recursion because it's **productive** — each level is an actual value, not an infinite loop.

---

## Recursive string manipulation

Template Literal Types can use recursion to perform string operations at the type level:

```typescript annotated
// TrimLeft: remove leading whitespace (type level):
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}`  // Does S start with a space?
  ? TrimLeft<Rest>            // Yes: remove it and check the rest
  : S;                        // No: done

// Trace for TrimLeft<"   hello">:
// "   hello" -> ` ${"  hello"}` matches -> TrimLeft<"  hello">
// "  hello"  -> ` ${" hello"}`  matches -> TrimLeft<" hello">
// " hello"   -> ` ${"hello"}`   matches -> TrimLeft<"hello">
// "hello"    -> no match        -> "hello"  (termination)

type A = TrimLeft<"   hello">;  // "hello"
type B = TrimLeft<"hello">;     // "hello"
type C = TrimLeft<"  x  ">;     // "x  "  (left side only!)

// TrimRight: same logic, different pattern:
type TrimRight<S extends string> =
  S extends `${infer Rest} ` ? TrimRight<Rest> : S;

// Trim: both combined:
type Trim<S extends string> = TrimLeft<TrimRight<S>>;
type D = Trim<"  hello  ">;  // "hello"
```

This isn't just a novelty: TypeScript's built-in utility types `Uppercase<S>`, `Lowercase<S>` etc. use the same mechanism.

---

## Experiment: Building DeepReadonly

> **Experiment:** Build a `DeepReadonly<T>` type in the TypeScript Playground:
>
> ```typescript
> // Your task: build DeepReadonly
> // Hint: Similar to DeepPartial, but use readonly instead of optional properties
>
> type DeepReadonly<T> =
>   T extends object
>     ? T extends Function
>       ? T
>       : { readonly [K in keyof T]: DeepReadonly<T[K]> }
>       //  ^^^^^^^^ This is the difference from DeepPartial
>     : T;
>
> interface Config {
>   server: {
>     host: string;
>     port: number;
>   };
>   debug: boolean;
> }
>
> type FrozenConfig = DeepReadonly<Config>;
>
> const config: FrozenConfig = {
>   server: { host: "localhost", port: 3000 },
>   debug: false,
> };
>
> // Try these lines — which ones produce errors?
> config.debug = true;              // ?
> config.server.host = "example";  // ?
> ```
>
> Explain why `Readonly<Config>` isn't enough and why `DeepReadonly<Config>` is the solution.

---

## Explain it to yourself

> **Explain it to yourself:** Why does `DeepPartial` need to handle the `T extends Function` case separately? What would happen if you left out this check?
> **Key points:** Functions are objects in JavaScript (typeof function === "object") | Without the check: `{ [K in keyof T]?: DeepPartial<T[K]> }` would be applied to function properties | This would tear apart some functions (their properties would be made optional) | With the check: functions are passed through unchanged

---

## Recursion limits: What to do when it breaks

TypeScript has a built-in recursion limit. In practice it sits at around 50–100 levels, depending on the complexity of the type. When you hit it, this error appears:

```
Type instantiation is excessively deep and possibly infinite.
```

```typescript annotated
// You hit the limit with very deep recursion:
type Repeat<S extends string, N extends number, Acc extends string = ""> =
  Acc["length"] extends N
  ? Acc               // termination: Acc has N characters
  : Repeat<S, N, `${Acc}${S}`>; // recursion: add a character

type Short = Repeat<"a", 5>;   // "aaaaa"   — works
type Long = Repeat<"a", 50>;   // possibly hits the limit
type TooLong = Repeat<"a", 100>; // almost certainly hits the limit

// TypeScript 4.5+ has tail recursion optimization for some patterns,
// which raises the effective limit for simple recursions.
```

**Practical rule of thumb:** In a real codebase, 3–5 levels of recursion cover almost every use case. If you need more, the design is probably over-engineered.

**What to do when you hit the limit?**
1. Simplify the type — do I really need arbitrary depth?
2. Build in a maximum depth (with a counter parameter)
3. Solve the problem at runtime (types are a tool, not an end in themselves)

---

## Think about it

> **Think about it:** `DeepPartial` makes all properties optional — all the way down. Is that always desirable? Can you think of cases where it could be dangerous?
>
> **Answer:** Yes, it can be dangerous. If a deeply nested property is "required" — for example a database URL in a config — `DeepPartial` makes it optional. The TypeScript compiler will no longer warn if it's missing. This can lead to runtime errors that are hard to debug. In practice, `DeepPartial` is better suited for "patch" objects (merging changes), not complete configurations. An alternative: use `Partial<T>` only at the top level and make certain sub-objects optional as a whole.

---

## In your Angular project: Forms with DeepPartial

```typescript annotated
// Angular Reactive Forms often have complex, nested structures.
// DeepPartial is ideal for form initial values:

interface UserForm {
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
  };
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      zip: string;
    };
  };
  preferences: {
    newsletter: boolean;
    language: "de" | "en";
  };
}

// Initial values: not all fields need to be filled in
type FormInitValue = DeepPartial<UserForm>;

@Component({ /* ... */ })
export class UserFormComponent {
  // Use DeepPartial for optional initial values:
  constructor(@Optional() @Inject(FORM_INIT) private init: FormInitValue) {}

  buildForm() {
    return this.fb.group({
      personal: this.fb.group({
        firstName: [this.init?.personal?.firstName ?? ""],
        // ^ Optional chaining + Nullish Coalescing — perfect with DeepPartial!
      }),
    });
  }
}
```

---

## What you've learned

- Recursive types **call themselves** — with a termination condition in the Conditional Type
- `Flatten<T>` resolves arbitrarily deep arrays, `DeepAwaited<T>` resolves nested Promises
- `DeepPartial<T>` combines Mapped Types with recursion — and must handle `Function` separately
- The JSON type shows that self-reference is also possible without Conditional Types
- TypeScript has a **recursion limit** (~50–100 levels) — in practice 3–5 levels are enough
- Template Literal Types (`TrimLeft`, `Trim`) use the same recursion mechanism

**Core concept:** Recursive Conditional Types are the tool when an operation needs to reach arbitrarily deep into a structure — like `DeepPartial`, `DeepReadonly`, or `Flatten`. The key: always have a clear termination condition, and keep the recursion limit in mind.

---

> **Pause point** — Recursive types are the most advanced concept in Conditional Types. If the `DeepPartial` code is still a bit unclear, take a break and go through it again — line by line. The investment is worth it, because this pattern comes up again and again in real projects.
>
> Continue with: [Section 05: Practical Patterns](./05-praxis-patterns.md)