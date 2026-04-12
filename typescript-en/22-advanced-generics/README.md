# Lesson 22: Advanced Generics

> **Prerequisite:** Lesson 13 (Generics Basics), Lesson 14 (Generic Patterns), Lesson 17 (Conditional Types) completed.
> **Goal:** Master generics at an advanced level — Higher-Order Types, variance, in/out modifiers, and API design.
> **Core question of this lesson:** How do you design generic types that are not only flexible, but also type-safe and maintainable?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approx. 10 minutes and has a clear pause point at the end. You can stop after
any section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [Generics Recap & Limits](./sections/01-generics-recap-und-grenzen.md) | ~10 min | Where L13/L14 left off, limits of simple generics, motivation for Advanced |
| 02 | [Higher-Order Types](./sections/02-higher-order-types.md) | ~10 min | Types that take types as parameters, generic over generic, HKT emulation |
| 03 | [Understanding Variance](./sections/03-varianz-verstehen.md) | ~10 min | Covariance, contravariance, invariance, bivariance — and why it matters |
| 04 | [in/out Modifiers](./sections/04-in-out-modifier.md) | ~10 min | Explicit variance annotations (TS 4.7), performance benefits |
| 05 | [Advanced Constraints](./sections/05-fortgeschrittene-constraints.md) | ~10 min | Intersection constraints, recursive constraints, distributive behavior |
| 06 | [Designing Generic APIs](./sections/06-generische-apis-designen.md) | ~10 min | API design principles, overloads vs generics, inference heuristics |

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
Test quiz with "npx tsx quiz.ts"
        |
        v
Compare with solutions in solutions/
        |
        v
Keep cheatsheet (cheatsheet.md) as quick reference
```

---

## File Structure

```
22-advanced-generics/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-generics-recap-und-grenzen.md
│   ├── 02-higher-order-types.md
│   ├── 03-varianz-verstehen.md
│   ├── 04-in-out-modifier.md
│   ├── 05-fortgeschrittene-constraints.md
│   └── 06-generische-apis-designen.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-generics-grenzen.ts
│   ├── 02-higher-order-types.ts
│   ├── 03-varianz-demo.ts
│   ├── 04-in-out-modifier.ts
│   ├── 05-advanced-constraints.ts
│   └── 06-api-design.ts
├── exercises/                <-- Exercises with TODOs
│   ├── 01-generic-container.ts
│   ├── 02-hkt-emulation.ts
│   ├── 03-varianz-pruefung.ts
│   ├── 04-variance-annotationen.ts
│   ├── 05-multi-constraint.ts
│   └── 06-api-redesign.ts
├── solutions/                <-- Solutions to the exercises
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- 15 quiz questions
├── pretest-data.ts           <-- 18 pre-test questions (3 per section)
├── misconceptions.ts         <-- 8 common misconceptions
├── completion-problems.ts    <-- 6 fill-in-the-blank exercises
├── debugging-data.ts         <-- 5 debugging challenges
├── parsons-data.ts           <-- 4 Parson's Problems
├── tracing-data.ts           <-- 4 code-tracing exercises
├── transfer-data.ts          <-- 3 transfer tasks
├── hints.json                <-- Progressive hints for all exercises
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it is your summary:

<details>
<summary>Expand summary</summary>

1. **Simple generics are often not enough:** As soon as you need types that
   are themselves generic (like "some container"), simple type parameters
   hit their limits.

2. **Higher-Order Types** emulate Higher-Kinded Types: TypeScript has
   no native HKT, but with interface maps and conditional types you can
   replicate the pattern.

3. **Covariance** (out position): If `Cat extends Animal`, then
   `Producer<Cat> extends Producer<Animal>`. The subtype direction is preserved.

4. **Contravariance** (in position): If `Cat extends Animal`, then
   `Consumer<Animal> extends Consumer<Cat>`. The subtype direction is reversed.

5. **Invariance** means: Neither covariance nor contravariance. An
   `Array<Cat>` is NOT an `Array<Animal>` if you can write to it.

6. **`in`/`out` modifiers (TS 4.7)** make variance explicit: `out T` for
   covariance, `in T` for contravariance. They also improve performance.

7. **Intersection constraints** (`T extends A & B`) are powerful: You
   can combine multiple requirements in a single constraint.

8. **Distributive conditional types** distribute over unions — but
   only when T is a "naked" type parameter. `[T] extends [U]` prevents this.

9. **Generics are a tool, not a goal:** Sometimes overloads or
   simple unions are the better choice. Less abstract = more readable.

10. **Inference is fragile:** TypeScript can only infer what it can see.
    Good API designers guide inference deliberately.

</details>

---

> **Start here:** [Section 01 - Generics Recap & Limits](./sections/01-generics-recap-und-grenzen.md)
>
> **Next lesson:** 23 - Recursive Types —
> Types that reference themselves: JSON, tree structures, and deep nesting.