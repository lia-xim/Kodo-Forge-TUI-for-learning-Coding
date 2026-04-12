# Lesson 05: Objects & Interfaces

## What This Is About

In the previous lessons you worked with primitive types, arrays, and tuples.
But real programs are made up of **objects** — users, products, orders,
configurations. In this lesson you'll learn how TypeScript types object structures,
and you'll encounter one of the most important concepts in the entire language: **Structural Typing**.

**What you'll be able to do by the end of this lesson:**

- Define object types inline and as interfaces
- Understand WHY TypeScript uses structural rather than nominal typing
- Recognize Excess Property Checking and use it deliberately
- Apply `readonly`, `optional`, and Index Signatures with confidence
- Use Intersection Types and the most important Utility Types
- Apply practical patterns for Angular and React

---

## Sections (~10 minutes per section)

The lesson is split into 7 bite-sized pieces. Work through them in order —
each section builds on the previous one. You can pause after any section.

| # | Section | Topic | Duration |
|---|---------|-------|----------|
| 01 | [Object Type Basics](sections/01-objekt-typen-basics.md) | Object Type Literals, nested objects, first interfaces | ~10 min |
| 02 | [Interfaces & Declaration](sections/02-interfaces-deklaration.md) | Interface syntax, `extends`, Declaration Merging, Interface vs Type | ~10 min |
| 03 | [Structural Typing](sections/03-structural-typing.md) | Duck Typing, Width Subtyping, the design decision behind TS | ~12 min |
| 04 | [Excess Property Checking](sections/04-excess-property-checking.md) | The big gotcha, "fresh" object literals, workarounds | ~10 min |
| 05 | [Readonly & Optional](sections/05-readonly-und-optional.md) | `readonly` (shallow!), `optional`, destructuring with types | ~10 min |
| 06 | [Index Signatures](sections/06-index-signatures.md) | Dynamic keys, Record<K,V>, mixed patterns | ~10 min |
| 07 | [Intersection & Utility Types](sections/07-intersection-und-utility-types.md) | `&` operator, Partial, Pick, Omit, practical patterns | ~12 min |

---

## After the Sections

1. Run the **Examples**: `npx tsx examples/01-object-types.ts`
2. Work through the **Exercises** — the TODOs will guide you
3. Take the **Quiz**: `npx tsx quiz.ts`
4. Use the **Cheatsheet** as a reference: [cheatsheet.md](cheatsheet.md)

---

## Quick Navigation

```
05-objects-und-interfaces/
  README.md                     <-- You are here
  sections/
    01-objekt-typen-basics.md
    02-interfaces-deklaration.md
    03-structural-typing.md
    04-excess-property-checking.md
    05-readonly-und-optional.md
    06-index-signatures.md
    07-intersection-und-utility-types.md
  examples/
  exercises/
  solutions/
  quiz.ts
  cheatsheet.md
```

---

**Next lesson:** [Lesson 06 — Functions](../06-functions/)