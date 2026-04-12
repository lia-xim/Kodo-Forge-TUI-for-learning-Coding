# Lesson 25: Type-safe Error Handling

> **Prerequisite:** L12 (Discriminated Unions) + L24 (Branded Types)
> **Goal:** Model errors as types instead of exceptions — for compile-time safe error handling.
> **Core question of this lesson:** How do you model errors as types instead of exceptions?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approx. 10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [The Exception Problem](./sections/01-das-exception-problem.md) | ~10 min | Why throw creates invisible dependencies, expected vs unexpected errors |
| 02 | [The Result Pattern](./sections/02-das-result-pattern.md) | ~10 min | Result<T,E> as a Discriminated Union, ok/err helpers, mapResult |
| 03 | [Option/Maybe Pattern](./sections/03-option-maybe-pattern.md) | ~10 min | T \| null as Option, fromNullable, mapMaybe, getOrElse |
| 04 | [Exhaustive Error Handling](./sections/04-exhaustive-error-handling.md) | ~10 min | assertNever, satisfies Record, switch exhaustiveness |
| 05 | [Error Type Patterns](./sections/05-error-typen-patterns.md) | ~10 min | Union types for errors, error hierarchies, error conversion |
| 06 | [Error Handling in Practice](./sections/06-error-handling-praxis.md) | ~10 min | Angular/React integration, fetch wrapper, when to use throw vs Result |

---

## Recommended Learning Path

```
Read sections 01-06 (approx. ~10 min each, pauses in between possible)
        |
        v
Work through examples in examples/ and experiment
        |
        v
Solve exercises in exercises/ (TODO tasks)
        |
        v
Test knowledge with "npx tsx quiz.ts"
        |
        v
Compare with solutions in solutions/
        |
        v
Keep cheatsheet (cheatsheet.md) as a quick reference
```

---

## File Structure

```
25-type-safe-error-handling/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-das-exception-problem.md
│   ├── 02-das-result-pattern.md
│   ├── 03-option-maybe-pattern.md
│   ├── 04-exhaustive-error-handling.md
│   ├── 05-error-typen-patterns.md
│   └── 06-error-handling-praxis.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-exception-problem.ts
│   ├── 02-result-pattern.ts
│   ├── 03-option-maybe.ts
│   ├── 04-exhaustive.ts
│   └── 05-error-types.ts
├── exercises/                <-- Exercises with TODOs
│   ├── 01-result-implementieren.ts
│   ├── 02-exhaustive-handling.ts
│   ├── 03-option-chaining.ts
│   ├── 04-error-conversion.ts
│   └── 05-fetch-wrapper.ts
├── solutions/                <-- Solutions to the exercises
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- 15 quiz questions with elaborated feedback
├── pretest-data.ts           <-- Pre-test (18 questions, 3 per section)
├── misconceptions.ts         <-- 8 common misconceptions
├── completion-problems.ts    <-- 6 fill-in-the-blank problems
├── debugging-data.ts         <-- 5 debugging challenges
├── parsons-data.ts           <-- 4 Parson's problems
├── tracing-data.ts           <-- 4 code-tracing exercises
├── transfer-data.ts          <-- 3 transfer tasks
├── hints.json                <-- Progressive hints for exercises
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **throw lies in the type system**: `function parseUser(): User` promises
   to always return a User. If it throws, it breaks that promise.

2. **Result<T, E> makes errors visible**: The return type FORCES
   the caller to handle errors — compile-time instead of runtime.

3. **Discriminant ok: true/false**: The key to TypeScript narrowing.
   Use `as const` or helper functions for literal types.

4. **Option vs Result**: null = normal absence (findUser).
   Result = error with details (createUser).

5. **assertNever enforces exhaustiveness**: In the default branch:
   if a union case is missing, you get a compile error.

6. **satisfies Record<K, V>**: Checks completeness AND
   retains specific literal types.

7. **Error conversion between layers**: DB error → domain error
   → HTTP error. Each layer speaks its own language.

8. **throw remains for bugs**: Invariant violations, missing env vars,
   unrecoverable states — that's what throw is for.

9. **mapResult/flatMapResult**: Functional composition instead of
   nested if blocks.

10. **strictNullChecks = built-in Option system**: With strict: true,
    TypeScript already enforces explicit null handling.

</details>

---

> **Start here:** [Section 01 - The Exception Problem](./sections/01-das-exception-problem.md)
>
> **Next lesson:** 26 — Not yet available