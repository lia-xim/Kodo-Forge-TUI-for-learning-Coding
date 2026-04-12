# Lesson 12: Discriminated Unions

> **Prerequisite:** Lesson 11 (Type Narrowing) completed, union types and literal types familiar.
> **Goal:** Understand and apply Discriminated Unions and use them as a central modeling tool.
> **Core question of this lesson:** How do I model complex states so that impossible states are prevented by the compiler?
> **Total duration:** ~50 minutes (5 sections, ~10 minutes each)

---

## Learning Path

This lesson is divided into **five sections**. Each section takes
approx. 10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you'll learn |
|---|---|---|---|
| 01 | [Tagged Unions](./sections/01-tagged-unions.md) | ~10 min | What are Discriminated Unions? The tag property, string literal as discriminator |
| 02 | [Pattern Matching](./sections/02-pattern-matching.md) | ~10 min | switch/case with exhaustive check, if/else chains, narrowing by discriminator |
| 03 | [Algebraic Data Types](./sections/03-algebraische-datentypen.md) | ~10 min | ADTs in TypeScript, Option/Result types, Background: Haskell/Rust |
| 04 | [State Modeling](./sections/04-zustandsmodellierung.md) | ~10 min | State machines as types, React state, Angular state, Loading/Error/Success |
| 05 | [Practical Patterns](./sections/05-praxis-patterns.md) | ~10 min | API responses, Action Types (Redux/NgRx), event systems, error hierarchies |

---

## Recommended Learning Path

```
Read sections 01-05 (approx. 10 min each, breaks between sections possible)
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
12-discriminated-unions/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-tagged-unions.md
│   ├── 02-pattern-matching.md
│   ├── 03-algebraische-datentypen.md
│   ├── 04-zustandsmodellierung.md
│   └── 05-praxis-patterns.md
├── examples/                 <-- Executable examples (npx tsx examples/01-...)
│   ├── 01-tagged-unions.ts
│   ├── 02-pattern-matching.ts
│   ├── 03-option-result.ts
│   ├── 04-state-modeling.ts
│   └── 05-praxis-patterns.ts
├── exercises/                <-- Exercises with TODOs
├── solutions/                <-- Solutions to the exercises
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **Three ingredients:** Tag property with literal type + union type + narrowing
   = Discriminated Union.

2. **The discriminator** must be a string, number, or boolean literal.
   Best practice: use string literals.

3. **switch/case is the natural partner:** Every case-branch narrows
   the type automatically. Together with the exhaustive check, unbeatable.

4. **assertNever in the default-branch** catches missing cases at compile time.
   Indispensable in large codebases.

5. **Discriminated Unions are sum types** from functional
   programming (Haskell, ML, Rust). TypeScript needs no new
   syntax for them.

6. **Option\<T\> and Result\<T, E\>** are the two most important ADT patterns.
   They replace null and try/catch in a type-safe way.

7. **"Make impossible states impossible."** Discriminated Unions instead of
   booleans eliminate impossible states.

8. **AsyncState\<T\>** (Loading/Error/Success) is the standard pattern
   for async data — framework-agnostic.

9. **Action Types** in Redux/NgRx are Discriminated Unions with the
   discriminator `type`. Each action has its own payload.

10. **Extract and Exclude** extract or exclude individual
    variants from a Discriminated Union.

</details>

---

> **Start here:** [Section 01 - Tagged Unions](./sections/01-tagged-unions.md)
>
> **Next lesson:** 13 — (to be defined)