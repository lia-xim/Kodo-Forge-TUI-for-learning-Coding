# Lesson 14: Generic Patterns

> **Prerequisite:** Lesson 13 (Generics Basics) completed.
> **Goal:** Confidently master advanced generic patterns — from factory functions to type-safe collections and real-world architecture patterns.
> **Core question of this lesson:** How do I use generics to build reusable, type-safe abstractions that work in real projects?
> **Total duration:** ~50 minutes (5 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **five sections**. Each section takes
approximately 10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [Generic Factories](./sections/01-generic-factories.md) | ~10 min | Factory Functions, createInstance\<T\>, Builder Pattern |
| 02 | [Generic Collections](./sections/02-generic-collections.md) | ~10 min | Stack\<T\>, Queue\<T\>, LinkedList\<T\>, type-safe containers |
| 03 | [Generic Higher-Order Functions](./sections/03-generic-hof.md) | ~10 min | pipe(), compose(), generic map/filter/reduce |
| 04 | [Advanced Constraints](./sections/04-generic-constraints-advanced.md) | ~10 min | Conditional Constraints, Recursive Constraints, const Type Parameters |
| 05 | [Real-World Generics](./sections/05-real-world-generics.md) | ~10 min | API Client\<T\>, Repository Pattern, Event Emitter, DI Container |

---

## Recommended Learning Path

```
Read sections 01-05 (~10 min each, breaks between sections possible)
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
14-generic-patterns/
+-- README.md                 <-- You are here (overview + navigation)
+-- sections/
|   +-- 01-generic-factories.md
|   +-- 02-generic-collections.md
|   +-- 03-generic-hof.md
|   +-- 04-generic-constraints-advanced.md
|   +-- 05-real-world-generics.md
+-- examples/                 <-- Runnable examples (npx tsx examples/01-...)
|   +-- 01-generic-factories.ts
|   +-- 02-generic-collections.ts
|   +-- 03-generic-hof.ts
|   +-- 04-advanced-constraints.ts
|   +-- 05-real-world-generics.ts
+-- exercises/                <-- Exercises with TODOs
+-- solutions/                <-- Solutions to the exercises
+-- quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
+-- cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it is your summary:

<details>
<summary>Expand summary</summary>

1. **Generic factories centralize object creation**: `createInstance<T>`
   separates creation from usage — the caller determines the type.

2. **The Builder Pattern benefits enormously from generics**: Fluent APIs with
   `Builder<T>` return the correct, extended type after every `.set()`.

3. **Type-safe collections prevent runtime errors**: `Stack<T>` and
   `Queue<T>` guarantee that only the correct type goes in and comes out.

4. **pipe() and compose() are the heart of functional programming**:
   With generics they check types between every step in the chain.

5. **Conditional constraints enable context-dependent types**:
   `T extends string ? X : Y` at the constraint level is more powerful than
   simple `extends` checks.

6. **Recursive constraints describe tree-like structures**: Types
   like `TreeNode<T>` or `DeepPartial<T>` reference themselves.

7. **const type parameters (TS 5.0) enforce literal inference**:
   `<const T>` prevents widening without requiring the caller to write `as const`.

8. **The Repository Pattern with generics is THE backend pattern**:
   `Repository<T>` defines CRUD once, typed for every entity.

9. **Type-safe event emitters prevent incorrect event data**:
   `EventEmitter<Events>` validates event names AND payload types.

10. **DI containers with generics are the foundation of modern frameworks**:
    `Container.resolve<T>()` returns the correct type without casts.

</details>

---

> **Start here:** [Section 01 - Generic Factories](./sections/01-generic-factories.md)
>
> **Next lesson:** 15 — Utility Types Deep Dive —
> How to work with Pick, Omit, Record, and custom utility types.