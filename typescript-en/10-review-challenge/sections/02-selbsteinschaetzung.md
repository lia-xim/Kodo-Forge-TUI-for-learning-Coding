# 02 -- Self-Assessment: How Confident Are You?

> Estimated reading time: ~10 minutes

## How to Use This Self-Check

Go through the 20 questions slowly. For each question: **Can you give the answer WITHOUT
looking it up?** Be honest with yourself -- no one is grading you. Questions where you feel
unsure show you exactly which lesson you should revisit.

Rating scale per question:
- **Confident** -- You could explain it to someone else
- **Roughly** -- You know the direction, but details are missing
- **Unsure** -- You would need to look it up

---

## The 20 Questions

### Basics (L01-L03)

**Question 1** -- What does `strict: true` in tsconfig.json do, and why should you
ALWAYS enable it?
> Lesson: L01 -- Setup

**Question 2** -- What is the difference between `any` and `unknown`? When is `unknown`
the right choice?
> Lesson: L02 -- Primitive Types

**Question 3** -- When should you write an explicit type annotation, and when is
type inference sufficient? Name two situations for each.
> Lesson: L03 -- Annotations & Inference

**Question 4** -- What is the difference between `null` and `undefined` in TypeScript with
`strictNullChecks`?
> Lesson: L02 -- Primitive Types

---

### Data Structures (L04-L05)

**Question 5** -- What is the difference between `number[]` and `[number, number]`?
> Lesson: L04 -- Arrays & Tuples

**Question 6** -- What happens when you pass a `readonly` array to a function that
expects `number[]`? Why?
> Lesson: L04 -- Arrays & Tuples

**Question 7** -- Explain structural typing in one sentence. Why can an object with MORE
properties be assigned to a type with FEWER properties?
> Lesson: L05 -- Objects & Interfaces

**Question 8** -- When does the excess property check apply -- and when does it NOT?
> Lesson: L05 -- Objects & Interfaces

**Question 9** -- What is an index signature and when do you need one?
> Lesson: L05 -- Objects & Interfaces

---

### Functions (L06)

**Question 10** -- Write a function with an optional parameter, a default value, and a
rest parameter -- in your head, without an IDE.
> Lesson: L06 -- Functions

**Question 11** -- What is a function overload? When is it better than a union in the
return type?
> Lesson: L06 -- Functions

**Question 12** -- What is the difference between `void` and `never` as a return type?
> Lesson: L06 -- Functions

---

### Combining Types (L07-L08)

**Question 13** -- What is the difference between `A | B` and `A & B`? Explain with
a concrete example.
> Lesson: L07 -- Union & Intersection

**Question 14** -- What is a discriminated union? What three ingredients does it require?
> Lesson: L07 -- Union & Intersection

**Question 15** -- Name three cases where `type` fits better than `interface`, and
three cases for the opposite.
> Lesson: L08 -- Type Aliases vs Interfaces

**Question 16** -- What is declaration merging and why is it relevant for library authors?
> Lesson: L08 -- Type Aliases vs Interfaces

---

### Enums & Literal Types (L09)

**Question 17** -- Why do many teams recommend `as const` instead of `enum`? Name at least
two reasons.
> Lesson: L09 -- Enums & Literal Types

**Question 18** -- What exactly does `as const` do? What changes about the type of an object or
array?
> Lesson: L09 -- Enums & Literal Types

**Question 19** -- Write an exhaustive check with `never` -- in your head. What happens
if you forget a case?
> Lesson: L09 -- Enums & Literal Types

---

### Integration

**Question 20** -- You receive a REST API that delivers user data. Describe which
TypeScript concepts you would use to process the response in a type-safe way
(type definition, validation, error handling, state modeling).
> Lesson: ALL -- If you can answer this question fluently, you are ready
> for Phase 2.

---

## Evaluation

Count your answers:

| Result | Meaning |
|--------|---------|
| 18-20 "Confident" | You are ready for Phase 2 |
| 14-17 "Confident" | Solid foundation, revisit the lessons you were unsure about |
| 10-13 "Confident" | Repeat the relevant lessons before moving on |
| Below 10 | Take the time to work through Phase 1 again -- it's worth it! |

> **Important:** It is completely okay if you cannot answer everything "Confidently".
> This review is exactly what it's there for -- to surface gaps. Better now than in the middle of
> Phase 2, when generics are built on a shaky foundation.

---

## Recommended Action Plan

For each "Unsure" question:

1. Go back to the corresponding lesson
2. Read the relevant section again
3. Retake the lesson quiz
4. Try an exercise from the lesson
5. Then come back to this lesson's challenges