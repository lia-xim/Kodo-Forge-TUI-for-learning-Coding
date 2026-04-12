# Lesson 16: Mapped Types

> **Prerequisite:** Lesson 15 (Utility Types) completed.
> **Goal:** Understand Mapped Types, build your own, and apply them in real-world scenarios (forms, APIs, configurations).
> **Core question of this lesson:** How do I systematically transform ALL properties of a type according to a rule?
> **Total duration:** ~50 minutes (5 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **five sections**. Each section takes
approx. 10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [Fundamentals](./sections/01-grundlagen.md) | ~10 min | Syntax [K in keyof T], readonly/optional modifiers |
| 02 | [Key Remapping](./sections/02-key-remapping.md) | ~10 min | as-clause, Template Literal Keys, key filtering |
| 03 | [Custom Utility Types](./sections/03-eigene-utility-types.md) | ~10 min | Building your own Mapped Types (Mutable, Nullable, etc.) |
| 04 | [Conditional Mapped Types](./sections/04-bedingte-mapped-types.md) | ~10 min | Conditional Types inside Mapped Types |
| 05 | [Practical Patterns](./sections/05-praxis-patterns.md) | ~10 min | Form types, API transformations, configurations |

---

## Recommended Learning Path

```
Read sections 01-05 (approx. ~10 min each, pauses possible in between)
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
Compare with solutions in solutions/
        |
        v
Keep cheatsheet (cheatsheet.md) as a quick reference
```

---

## File Structure

```
16-mapped-types/
+-- README.md                 <-- You are here (overview + navigation)
+-- sections/
|   +-- 01-grundlagen.md
|   +-- 02-key-remapping.md
|   +-- 03-eigene-utility-types.md
|   +-- 04-bedingte-mapped-types.md
|   +-- 05-praxis-patterns.md
+-- examples/                 <-- Runnable examples (npx tsx examples/01-...)
+-- exercises/                <-- Exercises with TODOs
+-- solutions/                <-- Solutions to the exercises
+-- quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
+-- cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **Mapped Types iterate over keys**: `{ [K in keyof T]: ... }` applies a transformation to EVERY property.

2. **Modifiers (+/-) control readonly and optional**: `+readonly` adds readonly, `-?` removes optional.

3. **Key Remapping with `as`**: `[K in keyof T as NewKey]` renames keys or filters them.

4. **Template Literal Keys generate new keys**: `` [K in keyof T as `get${Capitalize<K>}`] `` generates getter names.

5. **Custom Utility Types are Mapped Types**: Partial, Required, Readonly — all are Mapped Types internally.

6. **Conditional Types inside Mapped Types enable selective transformation**: Change only certain properties, pass others through unchanged.

7. **never in Key Remapping filters out keys**: `as K extends 'id' ? never : K` removes the key 'id'.

8. **Homomorphic Mapped Types preserve modifiers**: `{ [K in keyof T]: ... }` carries over readonly and optional from the original.

9. **Form types are THE practical use case**: FormErrors\<T\>, FormTouched\<T\>, FormDirty\<T\> — all Mapped Types.

10. **API transformations with Mapped Types avoid duplication**: One type, many derivations (Create, Update, Response).

</details>

---

> **Start here:** [Section 01 - Fundamentals](./sections/01-grundlagen.md)
>
> **Next lesson:** 17 — Conditional Types —
> How to work with `T extends U ? X : Y` and the `infer` keyword.