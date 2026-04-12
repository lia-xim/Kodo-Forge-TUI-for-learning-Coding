# Lesson 21: Classes & OOP in TypeScript

> **Prerequisite:** Lesson 02 (Primitive Types / Type Erasure), Lesson 13-14 (Generics).
> **Goal:** Master classes, inheritance, abstract classes, interfaces, and OOP patterns in TypeScript
> — and know when to use classes vs. functions.
> **Core question of this lesson:** What remains of TypeScript classes at runtime —
> and what disappears?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approx. 10 minutes and has a clear pause point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [Class Basics](./sections/01-class-basics.md) | ~10 min | class syntax, constructor, fields, methods, this context, structural typing |
| 02 | [Access Modifiers](./sections/02-access-modifiers.md) | ~10 min | public, private, protected, readonly, #private (ES2022), getters/setters |
| 03 | [Inheritance and Abstract Classes](./sections/03-inheritance-and-abstract.md) | ~10 min | extends, super(), abstract, override, method overriding |
| 04 | [Implementing Interfaces](./sections/04-implementing-interfaces.md) | ~10 min | implements, structural vs nominal typing, generic interfaces |
| 05 | [Static Members and Patterns](./sections/05-static-and-patterns.md) | ~10 min | static, parameter properties, singleton, factory, constructor types |
| 06 | [Classes in Practice](./sections/06-classes-in-practice.md) | ~10 min | class vs function, composition, mixins, this-binding solutions |

---

## Recommended Learning Path

```
Read sections 01-06 (approx. 10 min each, pauses in between possible)
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
21-classes-and-oop/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-class-basics.md
│   ├── 02-access-modifiers.md
│   ├── 03-inheritance-and-abstract.md
│   ├── 04-implementing-interfaces.md
│   ├── 05-static-and-patterns.md
│   └── 06-classes-in-practice.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-class-basics.ts
│   ├── 02-access-modifiers.ts
│   ├── 03-inheritance-abstract.ts
│   ├── 04-implements-interfaces.ts
│   ├── 05-static-factory.ts
│   └── 06-composition-vs-inheritance.ts
├── exercises/                <-- Exercises with TODOs
│   ├── 01-vehicle-hierarchy.ts
│   ├── 02-access-control.ts
│   ├── 03-interface-implementation.ts
│   ├── 04-static-registry.ts
│   ├── 05-mixin-pattern.ts
│   └── 06-refactoring-challenge.ts
├── solutions/                <-- Solutions to the exercises
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- 15 quiz questions
├── pretest-data.ts           <-- 18 pre-test questions
├── misconceptions.ts         <-- 8 misconceptions
├── completion-problems.ts    <-- 6 completion problems
├── debugging-data.ts         <-- 5 debugging challenges
├── parsons-data.ts           <-- 4 Parsons problems
├── tracing-data.ts           <-- 4 tracing exercises
├── transfer-data.ts          <-- 3 transfer tasks
├── hints.json                <-- Progressive hints for all exercises
└── cheatsheet.md             <-- Quick reference
```

---

## Exercises

| # | Exercise | Concept | Difficulty |
|---|---|---|---|
| 01 | Vehicle Hierarchy | Inheritance, extends, super, override | Medium |
| 02 | Access Control | private, #private, readonly, getters/setters | Medium |
| 03 | Interface Implementation | implements, generics, structural typing | Medium |
| 04 | Static Registry | static, factory pattern, private constructor | Medium-Hard |
| 05 | Mixin Pattern | Mixins, constructor type, composition | Hard |
| 06 | Refactoring Challenge | Composition over inheritance, strategy | Hard |

---

> **Start here:** [Section 01 - Class Basics](./sections/01-class-basics.md)
>
> **Next lesson:** 22 - Advanced Generics —
> Deepening generics: constraints, conditional types with generics, infer.