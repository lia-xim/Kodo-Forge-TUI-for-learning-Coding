# Section 3: Enabling Strict Mode Incrementally

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - allowJs and checkJs Strategy](./02-allowjs-und-checkjs.md)
> Next section: [04 - Declaration Files for Legacy Code](./04-declaration-files-fuer-legacy.md)

---

## What you'll learn here

- What **strict: true** actually enables under the hood (9 flags!)
- In what **order** you should enable the strict flags
- Why **strictNullChecks** is the most important and most painful flag
- How to **manage the error count** when enabling flags incrementally

---

## Background: What is Strict Mode, really?

> **Origin Story: The Evolution of Strict**
>
> When TypeScript 2.0 (2016) introduced `strictNullChecks`, the community
> was divided. Some loved it ("Finally no more null errors!"), others
> hated it ("Thousands of errors in my project!"). With each TypeScript
> version, new strict flags were added. To keep track of everything,
> TypeScript 2.3 (2017) introduced the meta-flag `strict: true` — it
> activates ALL current AND FUTURE strict flags.
>
> This means: if you enable `strict: true` today and tomorrow a new
> TypeScript release introduces a new strict flag, it will automatically
> become active. This is intentional — but you should read the release
> notes when upgrading.
>
> A good example: TypeScript 4.9 added `useUnknownInCatchVariables`
> (catch variables become `unknown` instead of `any`). All projects with
> `strict: true` got this flag automatically on upgrade. That felt
> surprising to some teams — but it was exactly the right decision,
> because caught errors really are `unknown`.

**Why is Strict Mode so important?** Non-strict TypeScript gives you
30–40% of the possible protection. Strict TypeScript gives you 90%+.
The difference mostly comes down to `strictNullChecks`: without this flag,
`null` or `undefined` can infect any type without TypeScript complaining.
The notorious "Cannot read property of null" crashes in JavaScript are
almost always cases that `strictNullChecks` would have caught.

`strict: true` is not a single flag — it is a **bundle** of
9 individual flags (as of TypeScript 5.x):

```typescript annotated
// strict: true enables ALL of these flags:
{
  "compilerOptions": {
    "strict": true
    // ↓ Equivalent to:
    // "strictNullChecks": true,        // null/undefined are their own types
    // "strictFunctionTypes": true,     // Strict function parameter types
    // "strictBindCallApply": true,     // Strict bind/call/apply checking
    // "strictPropertyInitialization": true, // Class properties must be initialized
    // "noImplicitAny": true,           // No implicit 'any'
    // "noImplicitThis": true,          // 'this' must be typed
    // "alwaysStrict": true,            // "use strict" in every file
    // "useUnknownInCatchVariables": true, // catch(e) → e is unknown instead of any
    // "exactOptionalPropertyTypes": true  // Since TS 4.4
  }
}
```

> 🧠 **Explain it to yourself:** Why is `strict: true` better than listing all flags individually? What happens on a TypeScript update?
> **Key points:** strict: true automatically includes new flags | Individual flags miss future improvements | strict: true is the recommended default setting | You can override individual flags with false: strict: true + strictNullChecks: false

---

## The Activation Order

Not all strict flags are equally difficult to enable. Here is the
recommended order — from easiest to hardest:

```
  Phase 1 (easy):      alwaysStrict
                        strictBindCallApply
                        noImplicitThis
                        → Few errors, simple fixes

  Phase 2 (medium):    noImplicitAny
                        strictFunctionTypes
                        → More errors, but mechanically solvable

  Phase 3 (hard):      strictNullChecks
                        strictPropertyInitialization
                        useUnknownInCatchVariables
                        → Many errors, requires thought

  Phase 4 (goal):      strict: true
                        → All flags active, remove individual flags
```

```typescript annotated
// Phase 1: tsconfig.json
{
  "compilerOptions": {
    "alwaysStrict": true,
    // ^ Adds "use strict" — almost never a problem
    "strictBindCallApply": true,
    // ^ Checks bind/call/apply arguments — rarely used, few errors
    "noImplicitThis": true
    // ^ Requires explicit 'this' in functions — easy to fix
  }
}
// Typical error count: 0-20
// Typical fix time: 1-2 hours
```

---

> 💭 **Think about it:** You enable Phase 1 and see 0 errors. Is that good?
> Or should you be suspicious?
>
> **Answer:** 0 errors in Phase 1 is normal and expected. The "easy"
> flags (alwaysStrict, strictBindCallApply) affect patterns that rarely
> appear in modern code. This is not a sign that your code is well-typed
> — it is just a gentle warm-up. The real work begins in Phases 2 and 3.

## Phase 2: noImplicitAny

This is the flag with the best effort-to-benefit ratio:

```typescript annotated
// BEFORE (noImplicitAny: false):
function processData(data) {
  // ^ 'data' implicitly has type 'any' — no checking!
  return data.map(item => item.name);
  // ^ No error, even if data is not an array
}

// AFTER (noImplicitAny: true):
function processData(data) {
  // ^ ERROR: Parameter 'data' implicitly has an 'any' type
  // Fix 1: Add type annotation
  // function processData(data: User[]): string[] {
  // Fix 2: Temporarily mark with any (to fix later)
  // function processData(data: any) {
  return data.map(item => item.name);
}
```

> 💭 **Think about it:** If noImplicitAny shows 200 errors in your project,
> should you fix them all immediately? Or is there a better strategy?
>
> **Answer:** Not all at once! Strategy: (1) Annotate obvious types
> immediately (parameters that are clear). (2) Mark complex cases with
> explicit `: any` — this is BETTER than implicit any because it
> documents a conscious decision. (3) Work through the `: any` spots
> over the following weeks.

---

**Why is noImplicitAny the flag with the best effort-to-benefit ratio?**
Because it resolves the most common cause of unintentional `any` propagation.
Implicit `any` is contagious: if a parameter is `any`, the return value
often becomes `any`, then the variable storing it becomes `any`, and
suddenly an entire call path is untyped. `noImplicitAny` cuts off this
cascade — every `any` occurrence must be explicit, therefore intentional and findable.

## Phase 3: strictNullChecks — the big one

This is the most important AND the most painful flag. It fundamentally
changes how TypeScript thinks about null and undefined:

```typescript annotated
// BEFORE (strictNullChecks: false):
function getUser(id: string): User {
  const user = users.find(u => u.id === id);
  return user;
  // ^ OK! find() returns User | undefined
  // ^ But without strictNullChecks, undefined is implicitly included in EVERY type
  // ^ → No error, but potential runtime crash
}

// AFTER (strictNullChecks: true):
function getUser(id: string): User {
  const user = users.find(u => u.id === id);
  return user;
  // ^ ERROR: Type 'User | undefined' is not assignable to type 'User'
  // ^ TypeScript says: "undefined is not User — what do you do with undefined?"
}

// Fix options:
function getUser(id: string): User | undefined {
  // ^ Option 1: Honest return type — callers must check
  return users.find(u => u.id === id);
}

function getUser(id: string): User {
  const user = users.find(u => u.id === id);
  if (!user) throw new Error(`User ${id} not found`);
  // ^ Option 2: Explicit error — clear contract
  return user;
}

function getUser(id: string): User {
  return users.find(u => u.id === id)!;
  // ^ Option 3: Non-null assertion (!) — DANGEROUS, only as a transition
  // ^ Mark with // TODO: Remove ! after migration
}
```

> ⚡ **Framework reference (Angular):** strictNullChecks has a massive impact
> on Angular templates. With `strictTemplates: true` (recommended!), Angular
> also checks templates for null safety:
>
> ```html
> <!-- Error with strictNullChecks: -->
> <div>{{ user.name }}</div>
> <!-- ^ 'user' is possibly undefined -->
>
> <!-- Fix: -->
> <div *ngIf="user">{{ user.name }}</div>
> <!-- Or with the new control flow: -->
> @if (user) { <div>{{ user.name }}</div> }
> ```
>
> In large Angular projects, strictNullChecks often causes 500+ errors
> in templates alone.

---

## Managing the Error Count

strictNullChecks can generate hundreds or thousands of errors. Here is
how to handle it:

```typescript annotated
// Strategy: "Fix forward" with non-null assertions
//
// Step 1: Enable strictNullChecks → 800 errors
// Step 2: Fix all errors with ! → 0 errors (but unsafe)
// Step 3: Replace 20 ! with real checks every week
// Step 4: CI rule: "No new ! in PRs"
//
// Advantage: The project is immediately "strict"
// Disadvantage: ! is unsafe — but it's MARKED and can be reduced over time

// Tool: ts-strictify (community tool)
// npx ts-strictify --check
// ^ Checks only CHANGED files against strictNullChecks
// ^ Existing files remain non-strict for now
// ^ New/changed files must be strict
```

> 🧪 **Experiment:** Count the errors that strictNullChecks generates in a
> project:
>
> ```bash
> # Without strictNullChecks:
> npx tsc --noEmit 2>&1 | wc -l
>
> # With strictNullChecks:
> npx tsc --noEmit --strictNullChecks 2>&1 | wc -l
>
> # The difference = errors caused by strictNullChecks
> # Typical: 30-50% of all errors come from strictNullChecks alone
> ```
>
> This gives you a sense of the effort involved before you enable the flag.

---

## Locking Strict Mode in CI

Once you have enabled a strict flag, you want to ensure it is not
accidentally reverted. And: you want to prevent new files from failing
to meet strict requirements:

```typescript annotated
// package.json scripts for progress protection:
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    // ^ Checks all files against the current tsconfig
    // ^ Runs in CI on every PR

    "typecheck:strict": "tsc --noEmit --strict",
    // ^ Checks whether the code is READY for strict: true
    // ^ Useful for measuring progress

    "typecheck:changed": "tsc --noEmit && git diff --name-only HEAD | grep '\\.ts' | xargs -I{} sh -c 'tsc --noEmit {}'",
    // ^ Simplified idea: check only changed files
    // ^ In practice: ts-strictify or eslint --rule "no-explicit-any"
  }
}
```

**Analogy:** Incrementally enabling strict flags is like putting on
protective gear: you can work without a helmet, but every safety element
you add reduces the risk. In the end you want the full kit — but you
don't force anyone to wear everything from day one.

## What you've learned

- `strict: true` bundles **9 individual flags** and automatically includes future ones
- Activation order: **alwaysStrict → noImplicitAny → strictNullChecks → strict**
- **strictNullChecks** is the most important and most effort-intensive flag — prevents "Cannot read property of null"
- Non-null assertions (`!`) are an acceptable **transition mechanism** (but phase them out!)
- `strict: true` with individual flags set to `false` is a valid intermediate step
- **CI integration** ensures that enabled flags are not reverted
- **noImplicitAny** has the best effort-to-benefit ratio: stops any propagation

**Core concept to remember:** Strict Mode is not a switch you flip once — it is a process. Enable the easy flags first, then the hard ones. strictNullChecks alone prevents more bugs than all other flags combined — but it also requires the most work. The goal is `strict: true` without any individual overrides — then and only then do you have the full TypeScript protection.

---

> **Pause point** -- Good moment for a break. You now know how to enable
> Strict Mode without chaos.
>
> Continue with: [Section 04: Declaration Files for Legacy Code](./04-declaration-files-fuer-legacy.md)