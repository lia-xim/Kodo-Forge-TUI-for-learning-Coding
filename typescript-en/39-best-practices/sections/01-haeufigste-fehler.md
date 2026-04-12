# Section 1: The 10 Most Common TypeScript Mistakes

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - any vs unknown vs never](./02-any-unknown-never.md)

---

## What you'll learn here

- The **10 most common mistakes** professional developers make with TypeScript
- Why each mistake is problematic and how to **recognize** it
- Concrete **fixes** with code examples
- Which mistakes you've probably **already** made yourself

---

## Why this list?

In 39 lessons you've learned TypeScript from the ground up. But
knowledge alone doesn't prevent mistakes — **habits** do.
This list is based on an analysis of thousands of TypeScript
projects and code reviews.

> 📖 **Background: Data behind the list**
>
> Microsoft's TypeScript team published a 2023 analysis
> of the most common compiler errors in npm packages. The top 3:
> TS2322 (Type not assignable), TS2345 (Argument not assignable)
> and TS7006 (Parameter implicitly has 'any'). But compiler errors
> are just the tip of the iceberg — the worst mistakes are
> the ones the compiler does NOT find: unsafe casts, missing
> narrowing checks, and over-engineering with types. These mistakes
> are the foundation of this lesson.

There's a pattern that recurs in almost all mistakes: The
developer wanted to **quickly silence the compiler**.
`as User`, `any`, `!` — these aren't solutions, they're
suppressions. The compiler stops complaining, but the bug
keeps lurking. Only in production does it reveal itself —
and by then it's ten times more expensive to fix.

---

## The Top 10

### Mistake 1: `as` instead of Narrowing

```typescript annotated
// BAD: Type Assertion (Trust me, Compiler)
const user = apiResponse as User;
// ^ If apiResponse isn't a User, you'll get a runtime error
// ^ The compiler believes you BLINDLY

// GOOD: Type Narrowing (Prove it, Compiler)
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "email" in data
  );
}
if (isUser(apiResponse)) {
  // Here apiResponse is guaranteed to be User
}
```

### Mistake 2: `any` instead of `unknown` for external data

```typescript annotated
// BAD: any disables the type system
function handleApiResponse(data: any) {
  data.name.toUpperCase();  // No error — but runtime crash possible!
}

// GOOD: unknown forces a check
function handleApiResponse(data: unknown) {
  if (typeof data === "object" && data !== null && "name" in data) {
    const name = (data as { name: string }).name;
    // ^ Safe: we've already checked
  }
}
```

### Mistake 3: Non-exhaustive switch

```typescript annotated
type Status = "idle" | "loading" | "success" | "error";

// BAD: New status "cancelled" goes unnoticed
function handle(status: Status): string {
  switch (status) {
    case "idle": return "Waiting...";
    case "loading": return "Loading...";
    case "success": return "Done!";
    // "error" is missing — no compiler error!
  }
  return "???";  // Fallback hides the bug
}

// GOOD: Exhaustive check with never
function handleSafe(status: Status): string {
  switch (status) {
    case "idle": return "Waiting...";
    case "loading": return "Loading...";
    case "success": return "Done!";
    case "error": return "Error!";
    default: {
      const _exhaustive: never = status;
      // ^ Compiler error if a case is missing!
      return _exhaustive;
    }
  }
}
```

> 🧠 **Explain it to yourself:** Why does the exhaustive check
> work with `never`? What happens if you add a new status
> and forget the case?
> **Key points:** After all cases, status is narrowed to never |
> New status "cancelled" would be "cancelled" in default, not never |
> Assignment to never fails → compile error

### Mistake 4: Implicit return types on public functions

```typescript annotated
// BAD: Return type is inferred — changes during refactoring
export function getUser(id: string) {
  return db.users.find(u => u.id === id);
  // ^ Inferred: User | undefined
  // If someone changes the implementation, the return type changes!
}

// GOOD: Explicit return type for exported functions
export function getUser(id: string): User | undefined {
  return db.users.find(u => u.id === id);
  // ^ The return type is a CONTRACT — if the implementation changes,
  //   the author gets a compile error
}
```

This actually happened in production code: A team refactored
`getUser()` so that instead of returning `User | undefined` it
returned `Promise<User>`. Since there was no explicit return type,
nobody noticed the breaking change — all callers kept running, just
with a Promise object instead of a User. The `user.name` became
a Promise object's string name. A mistake that cost four hours of
debugging and could have been prevented by a single type annotation.

> ⚡ **Angular connection:** This mistake is especially common in
> Angular services. A service method without an explicit return type can
> silently change its return type when refactoring restructures the
> implementation. In Angular services, ALWAYS write:
> `getUsers(): Observable<User[]>` — never just `getUsers()`.
> In React, the equivalent is with custom hooks: `function useAuth():
> AuthState` makes the contract explicit so nobody accidentally
> breaks the return type. ESLint rule: `@typescript-eslint/explicit-module-boundary-types`
> enforces this automatically.

### Mistake 5: Non-null assertion as a quick fix

```typescript annotated
// BAD: ! as an escape from null handling
const username = user!.profile!.settings!.username!;
// ^ Four exclamation marks = four potential runtime crashes
// ^ If any link in the chain is null → TypeError

// GOOD: Optional chaining + fallback
const username = user?.profile?.settings?.username ?? "Anonymous";
// ^ Safe: if anything is null → fallback value
// ^ Readable: the "happy path" is clearly visible
```

**Why `!` is dangerous:** It's an assertion to the compiler
that isn't verified. `user!` says: "I swear, user is never
null." But in a web app, almost anything can become null — a
logged-out user, a slow API, a cleared cache. The `!`
shifts the error from compile time to runtime. And at runtime
it usually happens exactly when a user wants to do something
important.

### Mistakes 6–10 in detail

**Mistake 6: `Object` instead of `object`** — `Object` (capitalized) is almost
like `any`: it accepts all non-null values. `object` (lowercase)
accepts only objects. For "any object" write
`Record<string, unknown>` — that's explicit and safe.

**Mistake 7: `interface` vs `type` holy war** — Teams spend
hours debating whether `interface User {}` or `type User = {}`
is better. The answer: it doesn't matter. What counts is consistency in
the project. Our recommendation: `interface` for objects you can
extend (`extends`), `type` for unions and aliases.

**Mistake 8: No `strict: true`** — Without `strictNullChecks`,
`null` can silently sneak into any type. That's like driving without
a seatbelt. Enable `strict: true` in `tsconfig.json` for every
new project. For existing projects: Gradually hide legacy files
with `// @ts-nocheck` while you migrate.

**Mistake 9: Pointless generics** — `function log<T>(msg: T): void`
is no more type-safe than `function log(msg: unknown): void`.
A generic that only appears once provides no added value. Generics
have costs: compile time, readability, IntelliSense complexity.

**Mistake 10: Thoughtless barrel exports** — An `index.ts` with 50
re-exports sounds convenient, but leads to circular dependencies
and prevents tree-shaking. Large Angular apps become noticeably
slower when everything goes through barrel files. Direct imports
(`import { UserService } from './services/user.service'`) are
often the better choice.

> 💭 **Think about it:** Which of these 10 mistakes have you
> probably already made yourself? Which one would you flag first
> in a code review?
>
> **Answer:** The most common are `as` casts (#1) and `any` (#2) —
> because they're the quickest "solution" when the compiler complains.
> In code reviews, `any` should be an immediate red flag. A
> single `any` can "flow" through the entire codebase and
> make the type system worthless. Look at your last Angular or
> React project: how many `as` and `any` can you find? Every
> one of them is a potential time bomb.

---

## Experiment: Error Detector

Look at this code block and find all 10 mistakes (one per category):

```typescript
// Broken user management — how many problems do you see?

interface UserStore {
  [key: string]: any;  // Mistake 6+9: Object with any
}

function fetchUser(id: any): any {  // Mistake 2: any instead of unknown/string
  const raw = localStorage.getItem("user_" + id);
  return JSON.parse(raw!) as User;  // Mistake 1+5: as + !
}

export function processUser(store: UserStore) {  // Mistake 4: no return type
  const user = fetchUser(store.currentId);
  
  // Mistake 3: Non-exhaustive switch
  switch (user.status) {
    case "active": return user.name.toUpperCase();
    case "inactive": return "Inactive";
    // "banned" is missing — what happens when a new status comes?
  }
}

// Mistake 7: inconsistent type definitions
interface UserProfile { name: String; age: Number; }
// ^ String/Number (capitalized) are the wrapper objects, not the primitives!
// Correct: name: string; age: number;
```

Now go into your own Angular or React project and look for the same
patterns. Three minutes searching for `": any"` and `" as "` will
show you more than any code review theory ever could.

---

## What you've learned

- The **10 most common TypeScript mistakes** — from `as` casts to over-generics
- `as` is a **trust me** to the compiler — use narrowing instead (**prove it**)
- `any` is **contagious** — a single `any` can spread through the entire codebase
- **Exhaustive checks** with `never` catch missing cases at compile time
- Explicit return types on public functions are a **contract**
- Non-null assertions (`!`) shift null errors from compile time to runtime
- `strict: true` in tsconfig.json is not optional, it's mandatory
- Barrel exports cost performance and create circular dependencies

> 🧠 **Explain it to yourself:** Why is `any` "contagious"? If you
> write `const x: any = ...` and then `const y = x.foo` — what
> type does `y` have?
> **Key points:** y is also `any` | Every access on `any` yields
> `any` | This spreads through the entire call chain |
> That's why a single `any` in a utility function is so
> dangerous | In Angular: a single `any` in an HttpClient service infects
> all components that use that service

**Core concept to remember:** The compiler is your partner, not your enemy. When it complains, it's usually right. `as`, `any`, and `!` are not solutions — they're suppression of symptoms. The symptom disappears, the bug remains.

---

> **Pause point** — You know the most common mistakes. Next
> step: The three special types `any`, `unknown`, and `never` in detail.
>
> Continue with: [Section 02: any vs unknown vs never](./02-any-unknown-never.md)