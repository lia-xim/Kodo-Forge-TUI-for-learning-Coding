# Section 2: any vs unknown vs never — The Decision Tree

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - The 10 Most Common Mistakes](./01-haeufigste-fehler.md)
> Next section: [03 - Avoiding Overengineering](./03-overengineering-vermeiden.md)

---

## What you'll learn here

- The **precise difference** between `any`, `unknown`, and `never` in every situation
- A **decision tree** you can apply in every code review
- Why `unknown` is the right choice in **95% of cases** when you want to write `any`
- The remaining **5%** where `any` is actually justified

---

## The cost of any — a real story

Imagine: A team migrates an Angular app from JavaScript to
TypeScript. Under time pressure, they annotate all unknown data
with `any`. The code compiles, all tests pass, the team is
happy. Six months later the app has mysterious runtime crashes
in production. After a long search, it turns out: an `any`-
annotated utility function changed its return type from `string` to
`string | null`, but nobody noticed because `any`
swallows every error. 23 components had been using this value
as a plain `string` — not a single one with a null check.

This is **any-drift**: The type travels through the code, infects
every variable it touches, and eventually ends up as a runtime
crash somewhere that seemingly has nothing to do with the original
`any`.

## The three special types compared

You've known these types since L02. Now, with 39 lessons of experience,
you understand them more deeply:

```typescript annotated
// any: Disables the type system COMPLETELY
let a: any = "hello";
a.toFixed(2);    // No error — even though string has no toFixed
a();              // No error — even though string is not a function
a.foo.bar.baz;   // No error — everything passes through
// ^ any is bidirectional: anything can become any, any can become anything

// unknown: Safe — enforces checking before access
let u: unknown = "hello";
// u.toFixed(2);  // ERROR: Object is of type 'unknown'
if (typeof u === "string") {
  u.toUpperCase();  // OK — after narrowing
}
// ^ unknown is the top type: anything can become unknown, but
//   unknown can become NOTHING without checking

// never: The impossible type — no value exists
function crash(): never { throw new Error("!"); }
// let n: never = "x";  // ERROR: Nothing can be assigned to never
// ^ never is the bottom type: never can be assigned to anything,
//   but nothing can become never
```

> 📖 **Background: Why TypeScript needs three "special types"**
>
> In mathematical type theory there is the top type (all
> values) and the bottom type (no value). TypeScript has both:
> `unknown` (top) and `never` (bottom). `any` is neither —
> it is an **opt-out** from the type system. Anders
> Hejlsberg introduced `any` because TypeScript was meant to be a **superset of
> JavaScript**: existing JS code had to compile without
> changes. `unknown` only arrived in TS 3.0
> (2018) as a safe alternative. Today there is no reason
> to use `any` anymore — except in the few cases we'll
> discuss shortly.

---

## The Decision Tree

```
Do you need a type for "anything"?
│
├── Data from outside (API, JSON.parse, user input)?
│     └── unknown ✓
│         (Then: narrowing or Zod/io-ts for validation)
│
├── Generic container (Box<T>, Result<T>)?
│     └── Generic T ✓
│         (Then: T is concretized at call site)
│
├── Function that never returns (throw, process.exit)?
│     └── never ✓
│
├── Callback with arbitrary type you never read?
│     └── unknown ✓
│         (e.g. function log(msg: unknown): void)
│
├── TypeScript migration (JS → TS, step by step)?
│     └── any (temporary!) ✓
│         (With TODO comment and ESLint suppression)
│
├── Type system boundary (e.g. type guard return)?
│     └── any in ONE line ✓
│         (e.g. return value as any as TargetType)
│
└── Otherwise?
      └── unknown ✓
          (When in doubt: unknown. Always.)
```

> 🧠 **Explain to yourself:** Why is `unknown` better than `any` in
> almost all cases? What exactly does `unknown` enforce that `any`
> does not?
> **Key points:** unknown enforces narrowing before access | any
> allows everything without checking | unknown errors are compile errors |
> any errors are runtime crashes | unknown is "safely ignorant",
> any is "unsafely indifferent"

---

## The 5%: When any is justified

### Case 1: Type system boundaries (double cast)

```typescript annotated
// Sometimes you know more than the compiler:
function convertLegacy(old: OldFormat): NewFormat {
  // OldFormat and NewFormat are not directly compatible,
  // but you know the data fits:
  return old as any as NewFormat;
  // ^ "Double cast" — the only place where any is acceptable
  // ^ Document WHY with a comment!
}
```

### Case 2: Generic type manipulation in libraries

```typescript annotated
// In library code where you "bend" types:
function createProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj: any, prop: string) {
      // any here is necessary because Proxy's handler types are too restrictive
      return Reflect.get(obj, prop);
    },
  }) as T;
  // ^ The result has the correct type T — any is only internal
}
```

### Case 3: Temporary migration

```typescript annotated
// During JS→TS migration:
// TODO: Add type once UserService is migrated
function processUser(user: any): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
  // Legacy code — will be typed later
}
```

> ⚡ **Angular connection:** In Angular projects you often find `any`
> in legacy services that haven't been fully migrated yet.
> The rule: always mark `any` with a `// TODO: Type this` comment
> and create a GitHub issue. Without tracking, "temporary" `any`
> annotations drift permanently into the codebase.
>
> For event handlers in Angular templates there is a common
> trap: `(click)="handle($event)"` passes an `Event` object
> but many developers type the handler as `handle(event: any)`.
> The correct annotation is `handle(event: MouseEvent)`.
>
> In React the equivalent in event handlers is even more widespread:
> `onChange={(e: any) => ...}` appears in almost every beginner project.
> The correct solution: `onChange={(e: React.ChangeEvent<HTMLInputElement>) => ...}`.
> Yes, it's longer — but it shows you exactly which properties
> `e` has (e.g. `e.target.value`, `e.target.checked`).

---

## The any infection chain — visualized

```typescript annotated
// Step 1: any enters the code
function parseConfig(raw: any) {
  return raw.settings;  // Type: any
  // ^ settings is any because raw is any
}

// Step 2: any infects the next function
function getTimeout(config: ReturnType<typeof parseConfig>) {
  return config.timeout;  // Type: any
  // ^ ReturnType of parseConfig is any → timeout is any
}

// Step 3: any ends up in a calculation
const delay = getTimeout(config) * 1000;
// delay: any (any * number = any!)

// Step 4: any ends up in a conditional
if (delay > 5000) {  // any > number: always allowed, never safe
  // ...
}

// Result: Four lines of code from the source, still any
// TypeScript has not complained about any of this.
```

This is **any-drift** in action. A single `any` at the entry point
infects every value that is ever calculated, compared, or returned
using it.

---

## unknown as a drop-in replacement for any

The easiest step to get rid of `any` is: replace `any` with
`unknown` and let the compiler tell you where you need checks.
This is not theoretical advice — it is a concrete workflow:

```typescript annotated
// Starting state: any everywhere
function parseApiResponse(data: any): any {
  return data.users.map((u: any) => u.name);
}

// Step 1: Replace outer any with unknown
function parseApiResponse(data: unknown): unknown {
  // ^ Immediately: error! data.users is not allowed on unknown
  // ^ TypeScript shows you exactly where checks are missing
}

// Step 2: Add checks
function parseApiResponse(data: unknown): string[] {
  if (
    typeof data === "object" &&
    data !== null &&
    "users" in data &&
    Array.isArray((data as Record<string, unknown>).users)
  ) {
    const users = (data as { users: unknown[] }).users;
    return users.filter(
      (u): u is { name: string } =>
        typeof u === "object" && u !== null && "name" in u &&
        typeof (u as Record<string, unknown>).name === "string"
    ).map(u => u.name);
  }
  return [];
}
// ^ More code, but EVERY error case is explicitly handled
// ^ No more runtime crash when the API delivers unexpected data
```

The first step — replacing `any` with `unknown` — takes less
than a minute. The second step (adding checks) is
work you would have had to do anyway — you just deferred it.

## never in practice

`never` is not only for exhaustive checks. It has three main roles:

```typescript annotated
// Role 1: Exhaustive check
type Shape = "circle" | "square" | "triangle";
function area(s: Shape): number {
  switch (s) {
    case "circle": return Math.PI;
    case "square": return 1;
    case "triangle": return 0.5;
    default: const _: never = s; return _;
    // ^ Compiler error if a case is missing
  }
}

// Role 2: Impossible function
function throwError(msg: string): never {
  throw new Error(msg);
}
// Can be used anywhere a value is expected:
const value: string = condition ? "ok" : throwError("not ok");
// ^ Works because never is assignable to every type

// Role 3: Type-level filtering
type NonString<T> = T extends string ? never : T;
type Result = NonString<string | number | boolean>;
// ^ number | boolean (string became never → disappears from the union)
```

> 💭 **Think about it:** If `never` is the "empty type" and no value
> has type `never`, why can you assign `never` to a `string`?
>
> **Answer:** Because the empty set is a subset of every set
> (set theory). "All elements of the empty set are strings" is
> **vacuously true** — there are no counterexamples because there are no
> elements. That is also why `never` disappears in unions:
> `string | never = string`.

---

## Experiment: any audit

Consider the decision matrix with concrete examples:

```typescript
// Task: For each 'any' below decide: unknown, never, generic, or any (with reason)?

// Case A:
function logError(err: any): void {
  console.error("Error:", err);
}
// → Your decision: ___
// → Solution: unknown — console.error accepts anything, no access needed

// Case B:
function parseJson<T>(text: string): T {
  return JSON.parse(text) as any as T;
  //                        ^^^^ inner any
}
// → Your decision for the inner any: ___
// → Solution: acceptable — double cast at type system boundary, JSON.parse returns any

// Case C:
const handler: (event: any) => void = (e) => {
  console.log(e.target.value);  // Accessing properties!
};
// → Your decision: ___
// → Solution: Event or MouseEvent/InputEvent — concrete type needed because of access

// Case D:
function assertDefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) throw new Error("Value is undefined");
}
// → No any here — what type is the return type de facto?
// → Solution: never (implicitly, when the assertion fails) / asserts returns void

// Bonus: Enable "@typescript-eslint/no-explicit-any": "warn"
// in your ESLint config and see how many hits you get.
// Categorize each hit according to the 5% rules.
```

---

## What you learned

- **any** disables the type system completely and is contagious — almost never the right choice
- **any-drift**: A single `any` infects every value that is calculated or compared with it
- **unknown** is the safe top type — enforces narrowing before access
- **never** is the bottom type — for exhaustive checks, impossible functions, and type filtering
- The **decision tree**: When in doubt, always `unknown`
- **5% of cases** where `any` is acceptable: double cast, library internals, temporary migration
- **Replacing any with unknown** is a concrete workflow, not a theoretical ideal

> 🧠 **Explain to yourself:** Someone says: "any and unknown are
> the same thing — you can assign any value to both." How do you respond?
> What is the decisive difference?
> **Key points:** Assignment TO the type: both accept everything |
> Access ON the type: unknown enforces checking, any does not |
> any is bidirectionally unsafe, unknown is unidirectionally safe |
> The difference shows when READING, not when WRITING |
> In Angular: `HttpClient.get<unknown>()` + validation instead of `get<User>()` (a disguised assertion)

**Core concept to remember:** unknown = "I don't know what this is, so I check." any = "I don't know what this is, so I ignore it." The difference is safety vs. convenience — and in production code, convenience is expensive.

---

> **Pause point** — You have internalized the decision tree.
> Next step: When types are too much of a good thing.
>
> Continue with: [Section 03: Avoiding Overengineering](./03-overengineering-vermeiden.md)