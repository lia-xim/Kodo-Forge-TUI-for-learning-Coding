# Lesson 08: Type Aliases vs Interfaces

> **Prerequisite:** Lessons 01-07 completed, especially the basics of
> types, union types, and object types.
> **Goal:** Understand the differences between `type` and `interface` and make
> an informed decision about when to use which construct.
> **Core question of this lesson:** When do I use `type`, when do I use `interface` — and
> why is the answer not as simple as "always use interface"?
> **Total duration:** ~50 minutes (5 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **five sections**. Each section takes
approx. 10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [Type Aliases Deep Dive](./sections/01-type-aliases-deep-dive.md) | ~10 min | type keyword, primitive aliases, union/intersection, mapped types |
| 02 | [Interfaces Deep Dive](./sections/02-interfaces-deep-dive.md) | ~10 min | Declaration merging, extends chains, implements, reopening |
| 03 | [The Big Comparison](./sections/03-der-grosse-vergleich.md) | ~10 min | Table of all differences, performance (extends vs &) |
| 04 | [Decision Matrix](./sections/04-entscheidungsmatrix.md) | ~10 min | Flowchart: When type, when interface? Clear rules |
| 05 | [Patterns and Best Practices](./sections/05-patterns-und-best-practices.md) | ~10 min | Angular vs React conventions, team standards |

---

## Recommended Learning Path

```
Read sections 01-05 (~10 min each, breaks in between possible)
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
08-type-aliases-vs-interfaces/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-type-aliases-deep-dive.md
│   ├── 02-interfaces-deep-dive.md
│   ├── 03-der-grosse-vergleich.md
│   ├── 04-entscheidungsmatrix.md
│   └── 05-patterns-und-best-practices.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-type-alias-grundlagen.ts
│   ├── 02-interface-grundlagen.ts
│   ├── 03-unterschiede-in-aktion.ts
│   ├── 04-mapped-und-utility-types.ts
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

1. **Type aliases are more versatile**: `type` can express unions, intersections,
   primitive aliases, tuples, mapped types, and conditional types.
   `interface` cannot.

2. **Interfaces are extensible**: Only `interface` supports declaration
   merging — the same interface can be declared multiple times and will
   be merged automatically.

3. **extends is faster than &**: Interfaces with `extends` are cached better
   by the compiler than intersection types with `&`. In large projects
   this can affect compile time.

4. **interface for objects, type for everything else**: The simplest
   rule of thumb, correct in 90% of cases.

5. **Declaration merging is intentional**: Libraries like Express or
   Mongoose use declaration merging deliberately so that users can
   extend the types.

6. **implements works with both**: Classes can implement both
   interfaces and type aliases (as long as it is an object type).

7. **Union types are type-exclusive**: `type Result = Success | Error`
   is not possible with `interface`. This is the most common reason
   to choose `type`.

8. **Mapped types are type-exclusive**: `type Readonly<T> = { readonly [K in keyof T]: T[K] }`
   only works with `type`, not with `interface`.

9. **Angular prefers interfaces**: The Angular team recommends
   `interface` for DTOs and service contracts.

10. **React prefers types**: The React community and the official
    React team predominantly use `type` for props and state.

</details>

---

> **Start here:** [Section 01 - Type Aliases Deep Dive](./sections/01-type-aliases-deep-dive.md)
>
> **Next lesson:** 09 — Union Types and Discriminated Unions —
> How to express powerful pattern matching in TypeScript
> with union types.