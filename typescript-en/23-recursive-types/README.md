# Lesson 23: Recursive Types in TypeScript

> **Prerequisites:** Lessons 13-18 (Generics, Utility Types, Mapped Types, Conditional Types, Template Literals) and L21-L22 (Classes, Advanced Generics).
> **Goal:** Understand and safely apply recursive types — from LinkedList to DeepPartial to type-safe paths.
> **Core question of this lesson:** How do you model data structures with arbitrary nesting depth, and where are the limits?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes approximately
10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you'll learn |
|---|---|---|---|
| 01 | [What are recursive types?](./sections/01-was-sind-rekursive-typen.md) | ~10 min | Self-reference, LinkedList, Tree, termination conditions |
| 02 | [Typing tree structures](./sections/02-baumstrukturen-typen.md) | ~10 min | JSON type, DOM, ASTs, nested menus |
| 03 | [Deep operations](./sections/03-deep-operationen.md) | ~10 min | DeepPartial, DeepReadonly, DeepRequired, array handling |
| 04 | [Recursive Conditional Types](./sections/04-rekursive-conditional-types.md) | ~10 min | Flatten, Paths, PathValue, string manipulation |
| 05 | [Limits and Performance](./sections/05-grenzen-und-performance.md) | ~10 min | Recursion limit, Tail Recursion, tuple arithmetic |
| 06 | [Practical Patterns](./sections/06-praxis-patterns.md) | ~10 min | Zod, Prisma, deep-get, Router types |

---

## Recommended Learning Path

```
Read sections 01-06 (each ~10 min, pauses in between possible)
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
23-recursive-types/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-was-sind-rekursive-typen.md
│   ├── 02-baumstrukturen-typen.md
│   ├── 03-deep-operationen.md
│   ├── 04-rekursive-conditional-types.md
│   ├── 05-grenzen-und-performance.md
│   └── 06-praxis-patterns.md
├── examples/                 <-- Executable examples (npx tsx examples/01-...)
│   ├── 01-linked-list-tree.ts
│   ├── 02-json-typ.ts
│   ├── 03-deep-operations.ts
│   ├── 04-paths-and-values.ts
│   ├── 05-recursion-limits.ts
│   └── 06-praxis-deep-get.ts
├── exercises/                <-- Exercises with TODOs
│   ├── 01-linked-list.ts
│   ├── 02-json-validator.ts
│   ├── 03-deep-partial.ts
│   ├── 04-flatten-type.ts
│   ├── 05-type-safe-paths.ts
│   └── 06-recursive-tree-ops.ts
├── solutions/                <-- Solutions to the exercises
│   ├── 01-linked-list.ts
│   ├── 02-json-validator.ts
│   ├── 03-deep-partial.ts
│   ├── 04-flatten-type.ts
│   ├── 05-type-safe-paths.ts
│   └── 06-recursive-tree-ops.ts
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- 15 questions with elaborated feedback
├── pretest-data.ts           <-- 18 pre-test questions (3 per section)
├── misconceptions.ts         <-- 8 common misconceptions
├── completion-problems.ts    <-- 6 fill-in-the-blank exercises
├── debugging-data.ts         <-- 5 debugging challenges
├── parsons-data.ts           <-- 4 code ordering problems
├── tracing-data.ts           <-- 4 code tracing exercises
├── transfer-data.ts          <-- 3 transfer tasks
├── hints.json                <-- Progressive hints for exercises
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **Recursive types** reference themselves in their definition
   and require a termination condition (| null, [], never).

2. **JSON is recursive by definition** — the most important recursive
   type you use every day.

3. **DeepPartial/DeepReadonly** combine Mapped Types with
   recursion. Arrays require special handling.

4. **Paths\<T\>** computes all dot-separated paths of an object.
   React Hook Form uses exactly this pattern.

5. **PathValue\<T, P\>** determines the type of the value at a path.
   Template Literal Types + recursion make this possible.

6. **Recursion limit** is ~50 levels (default) or ~1000 (with
   Tail Recursion Optimization since TS 4.5).

7. **Tail Recursion** applies when the recursive call is in
   tail position (last expression in the conditional branch).

8. **Tuple length** is the only way for type-level arithmetic.

9. **Distributive Conditional Types + recursion** leads to
   exponential growth. Mapped Types are linear.

10. **The rule of thumb:** Recursive types for naturally recursive
    data (JSON, trees). Not for everything you could "compute" at the type level.

</details>

---

> **Start here:** [Section 01 - What are recursive types?](./sections/01-was-sind-rekursive-typen.md)
>
> **Next lesson:** 24 - Type-Level Programming —
> String parsers, state machines, and complete programs at the type level.