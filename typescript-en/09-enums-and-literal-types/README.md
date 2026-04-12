# Lesson 09: Enums & Literal Types

> **Prerequisite:** Lesson 06 (Functions) completed, Union Types familiar.
> **Goal:** Confidently master Literal Types, Enums, and their alternatives — and make the right choice for every situation.
> **Core question of this lesson:** When do I need an Enum, when is a Union Literal Type enough, and when is `as const` the best choice?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approx. 10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [Literal Types](./sections/01-literal-types.md) | ~10 min | String/Number/Boolean Literals, const Assertions, as const |
| 02 | [Numeric Enums](./sections/02-numerische-enums.md) | ~10 min | Basics, Reverse Mapping, Auto-Increment, Pitfalls |
| 03 | [String Enums](./sections/03-string-enums.md) | ~10 min | String Enums, no Reverse Mapping, Advantages |
| 04 | [Enums vs Union Literals](./sections/04-enums-vs-union-literals.md) | ~10 min | Big comparison, as const Objects, decision guide |
| 05 | [Template Literal Types](./sections/05-template-literal-types.md) | ~10 min | String manipulation at the type level, Uppercase\<T\>, Autocomplete |
| 06 | [Patterns and Alternatives](./sections/06-patterns-und-alternativen.md) | ~10 min | const enum, isolatedModules, as const pattern, Branding |

---

## Recommended Learning Path

```
Read sections 01-06 (~10 min each, breaks possible in between)
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
09-enums-und-literal-types/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-literal-types.md
│   ├── 02-numerische-enums.md
│   ├── 03-string-enums.md
│   ├── 04-enums-vs-union-literals.md
│   ├── 05-template-literal-types.md
│   └── 06-patterns-und-alternativen.md
├── examples/                 <-- Executable examples (npx tsx examples/01-...)
│   ├── 01-literal-types.ts
│   ├── 02-numerische-enums.ts
│   ├── 03-string-enums.ts
│   ├── 04-as-const-objects.ts
│   └── 05-template-literal-types.ts
├── exercises/                <-- Exercises with TODOs
├── solutions/                <-- Solutions to the exercises
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this only AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **Literal Types are subtypes**: `"GET"` is a subtype of `string`.
   TypeScript uses the most precise type with `const`.

2. **`as const` freezes everything**: Three effects — readonly, Literal Types,
   Tuple instead of Array. The most important assertion in TypeScript.

3. **Numeric Enums have Reverse Mapping**: `Direction[0]` returns the
   name. This is powerful, but also a source of bugs.

4. **String Enums are safer**: No Reverse Mapping, but in return
   readable debug output and no accidental assignment of numbers.

5. **Union Literal Types > Enums (mostly)**: No runtime code,
   tree-shakeable, easier to understand, full IDE support.

6. **`as const` Objects combine the best of both**: Runtime values AND
   inferred types without Enum overhead.

7. **Template Literal Types are string algebra**: TypeScript can
   manipulate strings at the type level — more powerful than any other
   typed language.

8. **`const enum` is a special case**: Gets fully inlined,
   but BREAKS with `isolatedModules` (and therefore most
   modern build tools).

9. **Branding with Literal Types**: `type EUR = number & { __brand: "EUR" }`
   prevents mix-ups between semantically different numbers.

10. **The decision is context-dependent**: No pattern is always
    correct. Enums for stable APIs, Union Literals for local types,
    `as const` Objects for the best of both worlds.

</details>

---

> **Start here:** [Section 01 - Literal Types](./sections/01-literal-types.md)
>
> **Next lesson:** 10 — Generics —
> How to write functions and types that work with ANY type.