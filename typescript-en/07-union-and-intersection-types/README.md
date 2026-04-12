Here is the English translation of the Lektion 07 README:

---

# Lesson 07: Union & Intersection Types

> **Prerequisite:** Lessons 01–06 completed, especially Lesson 02
> (Primitive Types, type hierarchy, never) and Lesson 05 (Objects and Interfaces).
> **Goal:** Apply Union and Intersection Types confidently — from fundamentals
> to advanced patterns like State Machines and Result Types.
> **Core question of this lesson:** When do you model "either A or B" (Union)
> and when "both A and B" (Intersection) — and how do both work together?
> **Total duration:** ~60 minutes (6 sections, ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approximately 10 minutes and has a clear stopping point at the end. You can stop
after any section and continue later.

### Sections

| # | Section | Duration | What you'll learn |
|---|---|---|---|
| 01 | [Union Types Fundamentals](./sections/01-union-types-grundlagen.md) | ~10 min | `\|` operator, union from primitives, literal unions, union vs enum |
| 02 | [Type Guards and Narrowing](./sections/02-type-guards-und-narrowing.md) | ~10 min | typeof, instanceof, in, truthiness, assignment narrowing, TS 5.5 inferred type predicates |
| 03 | [Discriminated Unions](./sections/03-discriminated-unions.md) | ~10 min | Tag property, exhaustive switch, never check, ADTs |
| 04 | [Intersection Types](./sections/04-intersection-types.md) | ~10 min | `&` operator, object composition, conflicts (→ never), extends vs & |
| 05 | [Union vs Intersection](./sections/05-union-vs-intersection.md) | ~10 min | When to use which? Decision matrix, distributive law |
| 06 | [Practical Patterns](./sections/06-praxis-patterns.md) | ~10 min | State machines, error handling, API responses, event systems |

---

## Recommended Learning Path

```
Read sections 01–06 (each ~10 min, breaks in between are fine)
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
07-union-und-intersection-types/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-union-types-grundlagen.md
│   ├── 02-type-guards-und-narrowing.md
│   ├── 03-discriminated-unions.md
│   ├── 04-intersection-types.md
│   ├── 05-union-vs-intersection.md
│   └── 06-praxis-patterns.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-union-types.ts
│   ├── 02-type-guards.ts
│   ├── 03-discriminated-unions.ts
│   ├── 04-intersection-types.ts
│   ├── 05-union-vs-intersection.ts
│   └── 06-praxis-patterns.ts
├── exercises/                <-- Exercises with TODOs
├── solutions/                <-- Solutions to exercises
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- Quiz questions
├── pretest-data.ts           <-- Pre-test questions
├── misconceptions.ts         <-- Misconception exercises
├── completion-problems.ts    <-- Faded worked examples
├── debugging-data.ts         <-- Debugging challenges
├── parsons-data.ts           <-- Parson's problems
├── tracing-data.ts           <-- Tracing exercises
├── transfer-data.ts          <-- Transfer tasks
├── hints.json                <-- Step-by-step hints
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Takeaways (Spoilers!)

Read this only AFTER completing the sections — it serves as your summary:

<details>
<summary>Expand summary</summary>

1. **Union Types (`|`)** = "Either A or B" — the set of possible values grows larger.

2. **Intersection Types (`&`)** = "Both A and B" — the set of possible values
   shrinks, but each value has MORE properties.

3. **Narrowing** constricts union types back down: typeof, instanceof, in,
   truthiness, assignment — and custom type predicates.

4. **TS 5.5 Inferred Type Predicates**: `.filter(x => x !== null)` automatically
   produces the correct type — no manual type predicate needed.

5. **Discriminated Unions** with a tag property and exhaustive check
   are the most powerful pattern for states and variants.

6. **assertNever** provides both compile-time AND runtime safety. New union
   members automatically produce compile errors.

7. **Conflicts** with `&` silently produce `never`; with `extends` they
   produce compile errors. extends is stricter.

8. **Literal unions** are usually better than enums: no runtime code,
   composable, full type erasure.

9. **Distributive law**: `(A | B) & C = (A & C) | (B & C)`.
   Union and Intersection behave like + and * in algebra.

10. **Union + Intersection together** enable advanced patterns:
    State Machines, Result Types, Event Systems, Command Pattern.

</details>

---

> **Start here:** [Section 01 - Union Types Fundamentals](./sections/01-union-types-grundlagen.md)
>
> **Next lesson:** 08 - Type Aliases and Mapped Types —
> How to define your own types and transform existing ones.