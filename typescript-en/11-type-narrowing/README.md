# Lesson 11: Type Narrowing

> **Prerequisite:** Phase 1 (Lessons 01-10) completed. You know Union Types,
> Interfaces, Literal Types, and the fundamentals of the type system.
> **Goal:** Fully understand and confidently apply TypeScript's Type Narrowing —
> from simple typeof checks to Custom Type Guards and Exhaustive Checks.
> **Core question of this lesson:** How do you "prove" to the TypeScript compiler
> which concrete type a value has — and why is this the most important skill in Phase 2?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Welcome to Phase 2: Type System Core

This lesson is the **first lesson of Phase 2**. In Phase 1 you learned the
fundamentals — now we get into the heart of things. Type Narrowing is the
core of TypeScript: it is the mechanism through which the type system becomes
**useful**, not merely decorative.

Without Narrowing, Union Types like `string | number` would be useless — you
couldn't do anything meaningful with them. Narrowing is the proof you provide
to the compiler so it can trust you.

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approximately 10 minutes and has a clear stopping point at the end. You can stop
after each section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [What is Narrowing?](./sections/01-was-ist-narrowing.md) | ~10 min | Core concept, Control Flow Analysis, why TS needs Narrowing |
| 02 | [typeof Guards](./sections/02-typeof-guards.md) | ~10 min | typeof operator, what it narrows, pitfalls (typeof null) |
| 03 | [instanceof and in](./sections/03-instanceof-und-in.md) | ~10 min | instanceof for classes, in operator for properties |
| 04 | [Equality and Truthiness](./sections/04-equality-und-truthiness.md) | ~10 min | ===, !==, ==, !=, Truthiness Narrowing, Nullish Narrowing |
| 05 | [Type Predicates](./sections/05-type-predicates.md) | ~10 min | Custom Type Guards (is), Assertion Functions, TS 5.5 Inferred Predicates |
| 06 | [Exhaustive Checks](./sections/06-exhaustive-checks.md) | ~10 min | never as a safety net, exhaustive switch/if, assertNever |

---

## Recommended Learning Path

```
Read sections 01-06 (~10 min each, breaks possible in between)
        |
        v
Work through examples in examples/ and experiment
        |
        v
Solve exercises in exercises/ (TODO tasks)
        |
        v
Test with quiz using "npx tsx quiz.ts"
        |
        v
Compare solutions in solutions/
        |
        v
Keep cheatsheet (cheatsheet.md) as a quick reference
```

---

## File Structure

```
11-type-narrowing/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-was-ist-narrowing.md
│   ├── 02-typeof-guards.md
│   ├── 03-instanceof-und-in.md
│   ├── 04-equality-und-truthiness.md
│   ├── 05-type-predicates.md
│   └── 06-exhaustive-checks.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-narrowing-basics.ts
│   ├── 02-typeof-guards.ts
│   ├── 03-instanceof-und-in.ts
│   ├── 04-equality-und-truthiness.ts
│   ├── 05-type-predicates.ts
│   └── 06-exhaustive-checks.ts
├── exercises/                <-- Exercises with TODOs
│   ├── 01-narrowing-basics.ts
│   ├── 02-typeof-guards.ts
│   ├── 03-instanceof-und-in.ts
│   ├── 04-equality-und-truthiness.ts
│   ├── 05-type-predicates.ts
│   └── 06-exhaustive-checks.ts
├── solutions/                <-- Solutions to the exercises
├── quiz-data.ts              <-- 15 questions + elaboratedFeedback
├── quiz.ts                   <-- Start quiz (npx tsx quiz.ts)
├── pretest-data.ts           <-- Pre-Test (3 questions per section)
├── misconceptions.ts         <-- 8 common misconceptions
├── completion-problems.ts    <-- 6 fill-in-the-blank exercises
├── debugging-data.ts         <-- 5 Debugging Challenges
├── parsons-data.ts           <-- 4 Parson's Problems
├── tracing-data.ts           <-- 4 Code-Tracing Exercises
├── transfer-data.ts          <-- 3 Transfer Tasks
├── hints.json                <-- Progressive Hints
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it is your summary:

<details>
<summary>Expand summary</summary>

1. **Control Flow Analysis**: TypeScript analyzes your code flow and
   narrows types automatically after checks — that is Type Narrowing.

2. **typeof is your basic tool**: `typeof x === "string"` narrows x
   to string. But beware: `typeof null === "object"` is a pitfall.

3. **instanceof for classes**: `x instanceof Date` only works with
   classes (runtime constructs), not with Interfaces or Type Aliases.

4. **in operator for properties**: `"name" in obj` narrows to types that
   have a `name` property — ideal for Discriminated Unions.

5. **Equality narrows both sides**: `if (a === b)` narrows BOTH variables
   to the common type.

6. **Truthiness eliminates null/undefined**: `if (x)` excludes null,
   undefined, 0, "" and false — watch out for 0 and ""!

7. **Custom Type Guards**: `function isString(x: unknown): x is string`
   gives you full control over narrowing.

8. **TS 5.5 Inferred Type Predicates**: `arr.filter(x => x !== null)` now
   narrows the array type automatically — no manual Type Guard needed anymore.

9. **assertNever for Exhaustive Checks**: The never type ensures that
   all cases of a Union Type are handled.

10. **Narrowing is cumulative**: Every check narrows the type further. TypeScript
    forgets nothing — it builds on previous checks.

</details>

---

> **Start here:** [Section 01 - What is Narrowing?](./sections/01-was-ist-narrowing.md)
>
> **Next lesson:** 12 - Generics — How do you write functions and types
> that work with ANY type without losing type safety?