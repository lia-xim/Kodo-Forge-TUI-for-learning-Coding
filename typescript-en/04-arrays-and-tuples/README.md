# Lesson 04: Arrays & Tuples

> **Learning Goal:** You understand the fundamental difference between arrays and tuples
> at the type system level, can type both correctly and safely, know the
> type safety gaps and how to avoid them. You understand covariance,
> `as const`, variadic tuples and the connection to generics.

---

## How This Lesson Is Organized

This lesson is split into **6 sections**, each taking approximately 10 minutes
to work through. You can pause after each section and continue later.

| # | Section | Reading time | What you'll learn |
|---|---------|----------|---------------|
| 1 | [Array Basics](sections/01-array-grundlagen.md) | ~10 min | Mental model, `T[]` vs `Array<T>`, inference, connection to Generics |
| 2 | [Readonly Arrays](sections/02-readonly-arrays.md) | ~10 min | Preventing mutation, `readonly`, compile-time vs runtime |
| 3 | [Tuple Basics](sections/03-tuples-grundlagen.md) | ~10 min | Positionally typed, Named Tuples, optional/rest elements |
| 4 | [Advanced Tuples](sections/04-fortgeschrittene-tuples.md) | ~12 min | Variadic Tuples, `as const`, `satisfies`, union derivation |
| 5 | [Covariance and Safety](sections/05-kovarianz-und-sicherheit.md) | ~12 min | Covariance, type safety gaps, `noUncheckedIndexedAccess` |
| 6 | [Practical Patterns](sections/06-praxis-patterns.md) | ~12 min | 7 patterns, 6 pitfalls, decision guide |

**Total reading time:** ~65 minutes

---

## Quick Overview: What This Lesson Covers

```
  Arrays                          Tuples
  ┌─────────────────────┐         ┌─────────────────────────┐
  │ string[]             │         │ [string, number]        │
  │ Array<T>             │         │ Named Tuples            │
  │ readonly T[]         │         │ Optionale Elemente      │
  │ Inferenz             │         │ Rest-Elemente           │
  │ Kovarianz            │         │ Variadic Tuples         │
  │ Typsicherheits-      │         │ as const                │
  │   luecken            │         │ satisfies + as const    │
  └─────────────────────┘         └─────────────────────────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │  Praxis-Patterns    │
                    │  Stolperfallen      │
                    │  noUncheckedIndex   │
                    │  Entscheidungshilfe │
                    └─────────────────────┘
```

---

## The Core Analogy

- **Array** = **Shopping list** — any number of entries, all of the same type
- **Tuple** = **Form** — fixed number of fields, each with a specific type

---

## Core Concepts to Remember

1. **TypeScript never infers tuples** — you must annotate or use `as const`
2. **`readonly` for array parameters** is almost always the right choice
3. **Covariance with mutable arrays** is unsound — `readonly` makes it safe
4. **`as const`** prevents widening and turns arrays into readonly tuples
5. **`noUncheckedIndexedAccess`** should be enabled in every project
6. **`Array<T>` is Generics** — you've been using Generics since Lesson 1

---

## Learning Material

| Material | Description |
|----------|-------------|
| `sections/` | The 6 learning sections (linked above) |
| `examples/` | 5 executable example files |
| `exercises/` | 3 exercise files with increasing difficulty |
| `solutions/` | Solutions to the exercises |
| `quiz.ts` | 15 questions from basics to deep understanding (`npx tsx quiz.ts`) |
| `cheatsheet.md` | Quick reference for looking things up |

---

## Recommended Learning Path

```
  Sektionen 1-6 durcharbeiten (mit Pausen)
       │
       ▼
  examples/ durchspielen (IDE-Hover nutzen!)
       │
       ▼
  exercises/ loesen
       │
       ▼
  quiz.ts machen (npx tsx quiz.ts)
       │
       ▼
  cheatsheet.md als Referenz speichern
```

> **Tip:** Work with your IDE — hover over variables to see the inferred
> types. This is especially helpful when learning about Arrays and Tuples!