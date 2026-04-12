# Lesson 02: Primitive Types in TypeScript

> **Prerequisite:** Lesson 01 (Setup) completed, `tsc` and `tsx` are working.
> **Goal:** Understand and confidently apply all primitive types in TypeScript.
> **Core question of this lesson:** What happens to TypeScript types at runtime — and
> why does that question matter so much?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approximately 10 minutes and ends with a clear pause point. You can stop
after any section and continue later.

### Sections

| # | Section | Duration | What you'll learn |
|---|---|---|---|
| 01 | [The Type System at a Glance](./sections/01-das-typsystem-ueberblick.md) | ~10 min | Type erasure, type hierarchy, compile time vs runtime |
| 02 | [string, number, boolean](./sections/02-string-number-boolean.md) | ~10 min | The three basics with IEEE 754, NaN, Template Literal Types |
| 03 | [null and undefined](./sections/03-null-und-undefined.md) | ~10 min | Billion Dollar Mistake, strictNullChecks, ?? vs \|\| |
| 04 | [any vs unknown](./sections/04-any-vs-unknown.md) | ~10 min | The most critical decision: type system on vs off |
| 05 | [never, void, symbol, bigint](./sections/05-never-void-symbol-bigint.md) | ~10 min | The specialists: exhaustive checks, unique keys, large numbers |
| 06 | [Type Widening](./sections/06-type-widening.md) | ~10 min | let vs const, Literal Types, as const |

---

## Recommended Learning Path

```
Read sections 01-06 (~10 min each, breaks in between are fine)
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
Compare with solutions in solutions/
        |
        v
Keep cheatsheet (cheatsheet.md) as a quick reference
```

---

## File Structure

```
02-primitive-types/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-das-typsystem-ueberblick.md
│   ├── 02-string-number-boolean.md
│   ├── 03-null-und-undefined.md
│   ├── 04-any-vs-unknown.md
│   ├── 05-never-void-symbol-bigint.md
│   └── 06-type-widening.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-string-number-boolean.ts
│   ├── 02-null-und-undefined.ts
│   ├── 03-any-vs-unknown.ts
│   ├── 04-never-und-void.ts
│   ├── 05-symbol-und-bigint.ts
│   └── 06-type-widening-und-literal-types.ts
├── exercises/                <-- Exercises with TODOs
├── solutions/                <-- Solutions to the exercises
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Key Insights (Spoiler!)

Read this AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **Type Erasure**: TypeScript types exist ONLY at compile time.
   At runtime, everything is JavaScript.

2. **Always lowercase**: `string`, not `String`. The
   capitalized variants are wrapper objects.

3. **`strict: true` is mandatory**: Without `strictNullChecks`, half the
   type system is worthless.

4. **`unknown` > `any`**: Always prefer `unknown`. `any` disables
   the type system and is contagious.

5. **`null` vs `undefined`**: `undefined` = "not set",
   `null` = "intentionally empty". Be consistent.

6. **`never` is the bottom type**: Especially useful for exhaustive checks
   in switch statements.

7. **`void` is not `undefined`**: `void` = "no meaningful
   return value", `undefined` = a concrete value.

8. **Type Widening**: `const` produces Literal Types, `let` produces
   wider types. Not by accident — by design.

9. **Literal Types are subtypes**: `"GET"` is a subtype of `string`.
   The foundation for Union Types.

10. **The type hierarchy**: `unknown` (top) > primitive types >
    `never` (bottom). `any` breaks the rules.

</details>

---

> **Start here:** [Section 01 - The Type System at a Glance](./sections/01-das-typsystem-ueberblick.md)
>
> **Next lesson:** 03 - Type Annotations and Type Inference —
> When do you need to declare types explicitly, and when does TypeScript figure them out on its own?