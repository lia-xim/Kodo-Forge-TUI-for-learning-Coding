# Lesson 13: Generics Basics

> **Prerequisite:** Lesson 09 (Enums & Literal Types) completed, Interfaces and Type Aliases known.
> **Goal:** Confidently master generic functions, interfaces, constraints, and default types — and understand why Generics are the heart of TypeScript.
> **Core question of this lesson:** How do you write code that works with ANY type without losing type safety?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approx. 10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you'll learn |
|---|---|---|---|
| 01 | [Why Generics](./sections/01-why-generics.md) | ~10 min | The problem: code duplication vs any, the solution: type parameters \<T\> |
| 02 | [Generic Functions](./sections/02-generic-functions.md) | ~10 min | function identity\<T\>(arg: T): T, inference on function calls |
| 03 | [Generic Interfaces and Types](./sections/03-generic-interfaces-and-types.md) | ~10 min | Generic Interfaces, Generic Type Aliases, Array\<T\> as an example |
| 04 | [Constraints](./sections/04-constraints.md) | ~10 min | extends keyword, keyof constraint, multiple constraints |
| 05 | [Default Type Parameters](./sections/05-default-type-parameters.md) | ~10 min | Default types \<T = string\>, when useful, patterns |
| 06 | [Generics in Practice](./sections/06-generics-in-practice.md) | ~10 min | React useState\<T\>, Angular HttpClient\<T\>, Promise\<T\>, Map\<K,V\> |

---

## Recommended Learning Path

```
Read sections 01-06 (each ~10 min, breaks in between possible)
        |
        v
Work through examples in examples/ and experiment
        |
        v
Solve exercises in exercises/ (TODO tasks)
        |
        v
Test your knowledge with "npx tsx quiz.ts"
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
13-generics-basics/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-why-generics.md
│   ├── 02-generic-functions.md
│   ├── 03-generic-interfaces-and-types.md
│   ├── 04-constraints.md
│   ├── 05-default-type-parameters.md
│   └── 06-generics-in-practice.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-why-generics.ts
│   ├── 02-generic-functions.ts
│   ├── 03-generic-interfaces.ts
│   ├── 04-constraints.ts
│   ├── 05-default-type-parameters.ts
│   └── 06-generics-practice.ts
├── exercises/                <-- Exercises with TODOs
│   ├── 01-first-generic-function.ts
│   ├── 02-generic-interfaces.ts
│   ├── 03-constraints.ts
│   ├── 04-default-type-parameters.ts
│   ├── 05-utility-functions.ts
│   └── 06-practice-integration.ts
├── solutions/                <-- Solutions to the exercises
│   ├── 01-first-generic-function.ts
│   ├── 02-generic-interfaces.ts
│   ├── 03-constraints.ts
│   ├── 04-default-type-parameters.ts
│   ├── 05-utility-functions.ts
│   └── 06-practice-integration.ts
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- Quiz questions (15 + elaborated feedback)
├── pretest-data.ts           <-- Pre-test (18 questions, 3 per section)
├── misconceptions.ts         <-- 8 common misconceptions
├── completion-problems.ts    <-- 6 fill-in-the-blank problems
├── debugging-data.ts         <-- 5 debugging challenges
├── parsons-data.ts           <-- 4 Parson's problems
├── tracing-data.ts           <-- 4 code-tracing exercises
├── transfer-data.ts          <-- 3 transfer tasks
├── hints.json                <-- Graduated hints for exercises
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **Generics solve the duplication-vs-any dilemma**: One function,
   every type, full type safety. No copy-paste, no any.

2. **T is a placeholder, not a type**: Type parameters are replaced by
   concrete types at call time — just like value parameters in functions.

3. **Inference is powerful**: TypeScript usually detects T automatically
   from the arguments. Only specify it explicitly when arguments are missing.

4. **Generic interfaces are templates**: Box\<string\> and
   Box\<number\> are different types from the same blueprint.

5. **Array\<T\> = T[]**: You've been using Generics longer than you think.
   Arrays, Promises, Maps — all generic.

6. **Constraints with extends**: T extends { length: number } guarantees
   that T has at least .length — without losing the full type.

7. **keyof is the key**: K extends keyof T + T[K] yields
   type-safe property access with precise return types.

8. **Defaults for API design**: \<T = string\> makes the simple
   case simple while keeping the complex case possible.

9. **Use T at least twice**: A type parameter that appears only once
   is useless — it might as well be unknown.

10. **Generics are the heart**: React useState, Angular HttpClient,
    Promise, Map, Array — everything is based on Generics. Understanding
    them is not optional, it's a prerequisite.

</details>

---

> **Start here:** [Section 01 - Why Generics](./sections/01-why-generics.md)
>
> **Next lesson:** 14 — Advanced Generics —
> Conditional Types, infer, Mapped Types, and the most powerful patterns.