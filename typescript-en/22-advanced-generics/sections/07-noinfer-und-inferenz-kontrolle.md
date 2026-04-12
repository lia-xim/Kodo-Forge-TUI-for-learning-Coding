# Section 7: NoInfer and Inference Control

> Estimated reading time: **10 minutes**
>
> Previous section: [06 - Designing Generic APIs](./06-generische-apis-designen.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- Why TypeScript sometimes **infers too much** — and what damage that can cause
- How `NoInfer<T>` (TS 5.4) deliberately **disables** an inference site
- How `infer T extends X` (TS 4.7) expresses a **constraint directly in the infer clause**
- When you need these tools in **Angular Signal APIs and generic forms**

---

## The Problem: TypeScript Infers Too Much
<!-- section:summary -->
In the last section we learned how to *guide* inference.

<!-- depth:standard -->
In the last section we learned how to *guide* inference.
Now we go one step further: sometimes you need to *suppress* inference
at a specific location.

Imagine you're designing a helper function for a configuration:

```typescript
function makeDefault<T = string>(options: {
  parse: (raw: string) => T;
  defaultValue?: T;
}): T {
  // Implementation...
  return options.parse("");
}
```

The intent is clear: `T` should be inferred from the `parse` function.
`defaultValue` is an optional fallback — it *must* match `T`,
but it should not *define* `T`.

What happens in practice?

```typescript
// Expected behavior:
const num = makeDefault({ parse: (s) => parseInt(s, 10) });
// T = number, correctly inferred from parse()

// Unexpected behavior:
const broken = makeDefault({
  parse: (s) => parseInt(s, 10),
  defaultValue: "fallback",   // Oops — a string!
});
// T = string | number — TypeScript uses BOTH inference sites!
// No error, but T is now too wide!
```

TypeScript sees two places that could define `T`:
`parse`'s return type and `defaultValue`. It **unifies both** into
`string | number`. This is technically correct, but semantically wrong
— `defaultValue` should *confirm* `T`, not *shape* it.

---

> 📖 **Background: How the TypeScript team encountered the problem**
>
> The problem is not new — it appeared in many libraries.
> A classic example: `lodash.defaultTo(value, defaultValue)`.
> When TypeScript uses both `value` and `defaultValue` as
> inference sources for `T`, it unnecessarily widens the type.
>
> In 2023, the TypeScript team opened an internal issue titled
> **"Controlling inference sites"**. The solution was meant to be simple:
> a wrapper type that tells a site: "You may use T,
> but not *define* it." The result was `NoInfer<T>`, released with
> **TypeScript 5.4** (March 2024).
>
> What's special: `NoInfer<T>` is not a complex mapped type —
> it's an **intrinsic type** understood directly by the compiler.
> Similar to `Awaited<T>` or `ReturnType<T>`, it is declared
> in `lib.es5.d.ts` as `type NoInfer<T> = intrinsic`.
> You can't replicate it yourself — it's built in.

---

<!-- /depth -->
## `NoInfer<T>` — The TS 5.4 Solution
<!-- section:summary -->
The rule is simple: **`NoInfer<T>` tells the compiler that this

<!-- depth:standard -->
```typescript annotated
function makeDefault<T = string>(options: {
  parse: (raw: string) => T;
  defaultValue?: NoInfer<T>;   // T must NOT be inferred here
}): T {
  return options.parse("");
}

// Now:
const num = makeDefault({
  parse: (s) => parseInt(s, 10),
  defaultValue: 42,              // OK: 42 is number, matches T = number
});
// T = number — inferred only from parse(). ✓

const broken = makeDefault({
  parse: (s) => parseInt(s, 10),
  defaultValue: "fallback",      // ERROR! string != number
  //             ~~~~~~~~~
  // Argument of type 'string' is not assignable to parameter
  // of type 'NoInfer<number>'
});
// T = number, defaultValue must be number. ✓ TypeScript protects us!
```

The rule is simple: **`NoInfer<T>` tells the compiler that this
location may *use* `T`, but not *define* it.**

> 🧠 **Explain to yourself:** Why can't you replicate `NoInfer<T>` with
> a conditional type, e.g. `T extends T ? T : never`?
>
> **Key points:** Conditional types are evaluated *after* inference
> | The compiler has already inferred T before evaluating the conditional
> | `NoInfer` acts *during* inference, not after it | It is a signal
> to the inference algorithm itself, not a retroactive type transformation

---

<!-- /depth -->
## Practical Patterns with `NoInfer<T>`
<!-- section:summary -->
The pattern appears whenever there is a **primary inference source**

<!-- depth:standard -->
The pattern appears whenever there is a **primary inference source**
and **secondary sites** that only *receive* `T`, not *determine* it:

```typescript annotated
// Pattern 1: Event handler with typed payload
function createEventEmitter<TEvent>(
  events: {
    [K in keyof TEvent]: (payload: TEvent[K]) => void
  },
  fallback?: NoInfer<Partial<TEvent>>  // Fallbacks don't define T
) { /* ... */ }

// Pattern 2: Store with reducer
function createStore<TState>(
  reducer: (state: TState, action: unknown) => TState,
  preloadedState?: NoInfer<Partial<TState>>  // Preloaded state follows T, doesn't shape it
) { /* ... */ }
// ^^^ Without NoInfer: preloadedState: { count: 0 } would infer TState as
//     { count: number } — even if the reducer expects a different interface.

// Pattern 3: Form fields
function createFormField<TValue>(
  validator: (v: TValue) => boolean,
  initialValue?: NoInfer<TValue>  // Initial value doesn't define the type
) { /* ... */ }
```

> 💭 **Think about it:** Imagine you're writing a function
> `withDefault<T>(value: T | null, fallback: T): T`. Should `fallback`
> be a `NoInfer<T>` — or not?
>
> Think for a moment: What is the *primary* inference source here?
>
> **Answer:** In this case, `value` is the primary source. `fallback`
> should *confirm* `T`. If someone writes
> `withDefault(null, "default")`, we want TypeScript to infer `T`
> from context (the type of the variable receiving the result) —
> not from `"default"`.
> So: `withDefault<T>(value: T | null, fallback: NoInfer<T>): T`.
> This forces the caller to specify the type explicitly or have it
> inferred from context.

---

<!-- /depth -->
## `infer T extends X` — Constraints in Infer Clauses
<!-- section:summary -->
Besides `NoInfer<T>`, there is a second, older tool for

<!-- depth:standard -->
Besides `NoInfer<T>`, there is a second, older tool for
inference control: **constraints directly in `infer` clauses**.

Before TypeScript 4.7, this was cumbersome:

```typescript annotated
// BEFORE TS 4.7: Two-step check required
type GetFirstString<T> =
  T extends readonly [infer U, ...unknown[]]
    ? U extends string   // <-- extra conditional just for the constraint
      ? U
      : never
    : never;

// SINCE TS 4.7: Constraint directly in the infer clause
type GetFirstString<T> =
  T extends readonly [infer U extends string, ...unknown[]]
  //                            ^^^^^^^^^^^^^^
  //                            Constraint directly here!
    ? U   // U is guaranteed to be string — no extra conditional needed
    : never;

// Comparison:
type A = GetFirstString<[string, number]>;  // string ✓
type B = GetFirstString<[number, string]>;  // never  ✓ (first element not a string)
type C = GetFirstString<["hello", number]>; // "hello" ✓ (literal inferred!)
```

The difference is subtle but important: in the old style, the
*outer* conditional `U extends string` returns `U`. In the new style,
`U` is *already* constrained to `string` — TypeScript infers `U`
**as the part of T that is string**, not the full type.

---

> 🔬 **Experiment: Understanding infer with constraints**
>
> Work through this code mentally (or in the TypeScript Playground):
>
> ```typescript
> // What is the difference between A and B?
> type ExtractNumA<T> =
>   T extends { value: infer U }
>     ? U extends number ? U : never
>     : never;
>
> type ExtractNumB<T> =
>   T extends { value: infer U extends number }
>     ? U
>     : never;
>
> type R1 = ExtractNumA<{ value: 42 }>;  // ?
> type R2 = ExtractNumB<{ value: 42 }>;  // ?
> type R3 = ExtractNumA<{ value: "hello" }>;  // ?
> type R4 = ExtractNumB<{ value: "hello" }>;  // ?
> ```
>
> **Resolution:**
> - `R1`: `42` (literal type, because U extends number returns U)
> - `R2`: `42` (identical — but the constraint is directly in infer)
> - `R3`: `never` (string extends number = false)
> - `R4`: `never` (string is not a subtype of number)
>
> In simple cases they are equivalent. The difference shows up
> with distributive conditional types and when `U` appears in multiple
> places in the true branch — then the direct constraint
> is more precise and avoids double evaluation.

---

<!-- /depth -->
## `infer extends` for Template Literal and Enum Extraction
<!-- section:summary -->
A particularly useful pattern: safely extracting numeric strings.

<!-- depth:standard -->
A particularly useful pattern: safely extracting numeric strings.

```typescript annotated
// Problem: Template literal types infer as string
type ParsePort<T extends string> =
  T extends `${infer Port}`
    ? Port   // Port is string, not number!
    : never;

// Solution: infer with extends
type ParsePort<T extends string> =
  T extends `${infer Port extends number}`
  //                    ^^^^^^^^^^^^^^^^
  //                    Only strings parseable as numbers!
    ? Port   // Port is now number (the numeric literal type)
    : never;

type Port80   = ParsePort<"80">;    // 80 (number literal) ✓
type Port443  = ParsePort<"443">;   // 443 (number literal) ✓
type PortNaN  = ParsePort<"abc">;   // never ✓ (not a valid number string)

// Practical use: parsing route parameters
type RouteParams<T extends string> =
  T extends `${string}/:${infer Param extends string}/${infer Rest}`
    ? Param | RouteParams<`/${Rest}`>
    : T extends `${string}/:${infer Param extends string}`
      ? Param
      : never;

type Params = RouteParams<"/users/:userId/posts/:postId">;
// "userId" | "postId" ✓
```

---

<!-- /depth -->
## The Framework Connection

> 🅰️ **In Angular projects** you encounter the problem of unwanted
> inference with the new Signal API (Angular 17+). The `input<T>()`
> API for Signal inputs solved exactly this problem:
>
> ```typescript annotated
> // Angular input() simplified:
> function input<T>(initialValue: T): InputSignal<T>;
> function input<T>(): InputSignal<T | undefined>;
>
> // The problem: required: true should infer T without undefined
> // (simplified representation of the internal design)
> function inputRequired<T>(options?: {
>   transform?: (v: unknown) => T;
>   alias?: NoInfer<string>;   // alias doesn't define T, just string
> }): InputSignal<T> { /* ... */ }
> // ^^^ alias is always string — but it must not infer T.
> //     The Signal team used NoInfer exactly for this.
>
> // inject() is similar:
> // inject<T>(token: ProviderToken<T>): T
> // T is inferred EXCLUSIVELY from the token.
> // No second parameter can accidentally shape T.
> const service = inject(UserService); // T = UserService, automatically
> ```
>
> The pattern is the same: there is a **primary source** (`transform`
> or the token type), and everything else may only *receive* `T`.
> `NoInfer` makes this intent explicit and unbreakable.

---

## What you've learned

- TypeScript infers `T` from **all** locations where `T` appears —
  this can lead to unintentionally wide types
- `NoInfer<T>` (TS 5.4) is an **intrinsic type** that excludes a
  usage site from inference. `T` is checked there, but not determined
- `infer U extends X` (TS 4.7) adds a **constraint directly into the
  infer clause** — cleaner than two-step conditionals and more
  precise for literal type inference
- Both tools solve the same fundamental problem: **control over
  who is allowed to define `T`**

> **Core concept:** Inference is a one-way street that must be
> consciously steered. `NoInfer<T>` says: "This parameter *receives* T."
> `infer U extends X` says: "This inferred type *must* be X."
> Together they give you complete control over how
> TypeScript interprets your generic APIs.

---

> **Pause point** — You've now learned all the central tools of
> Advanced Generics: from higher-order types through
> variance and constraints to fine-grained inference control.
>
> Continue with: [Lesson 23 - Recursive Types](../../23-recursive-types/README.md)