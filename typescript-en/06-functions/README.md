# Lesson 06: Functions in TypeScript

> **Prerequisite:** Lesson 05 (Objects and Interfaces) completed.
> **Goal:** Fully understand functions in TypeScript — from basic type annotations
> through overloads to advanced patterns.
> **Core question of this lesson:** How do you describe a function's behavior
> precisely at the type level — and why is that the key to safe code?
> **Total duration:** ~60 minutes (6 sections of ~10 minutes each)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes approximately
10 minutes and has a clear stopping point at the end. You can stop after
any section and continue later.

### Sections

| # | Section | Duration | What you'll learn |
|---|---|---|---|
| 01 | [Function Types Basics](./sections/01-funktionstypen-basics.md) | ~10 min | Parameter types, return types, arrow functions, `void` |
| 02 | [Optional and Default Parameters](./sections/02-optionale-und-default-parameter.md) | ~10 min | `?` parameters, default values, rest parameters, destructuring |
| 03 | [Function Overloads](./sections/03-function-overloads.md) | ~10 min | Overload signatures, implementation signature, when overloads make sense |
| 04 | [Callback Types](./sections/04-callback-typen.md) | ~10 min | Typing callbacks, `void` callbacks, generic callbacks |
| 05 | [The this Parameter](./sections/05-this-parameter.md) | ~10 min | `this` type in functions, `ThisParameterType`, method binding |
| 06 | [Function Patterns](./sections/06-funktions-patterns.md) | ~10 min | Type guards, assertion functions, constructor signatures, factories |

---

## Recommended Learning Path

```
Read sections 01–06 (approx. 10 min each, breaks in between are fine)
        |
        v
Work through the examples in examples/ and experiment
        |
        v
Solve exercises in exercises/ (TODO tasks)
        |
        v
Test your knowledge with "npx tsx quiz.ts"
        |
        v
Compare your answers with solutions in solutions/
        |
        v
Keep cheatsheet.md as a quick reference
```

---

## File Structure

```
06-functions/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-funktionstypen-basics.md
│   ├── 02-optionale-und-default-parameter.md
│   ├── 03-function-overloads.md
│   ├── 04-callback-typen.md
│   ├── 05-this-parameter.md
│   └── 06-funktions-patterns.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-funktionstypen-basics.ts
│   ├── 02-optionale-und-default-parameter.ts
│   ├── 03-function-overloads.ts
│   ├── 04-callback-typen.ts
│   └── 05-funktions-patterns.ts
├── exercises/                <-- Exercises with TODOs
│   ├── 01-parameter-und-return-typen.ts
│   ├── 02-overloads-und-callbacks.ts
│   ├── 03-type-guards-und-assertions.ts
│   ├── 04-praxis-szenarien.ts
│   └── 05-predict-the-output.ts
├── solutions/                <-- Solutions to the exercises
│   ├── 01-parameter-und-return-typen.ts
│   ├── 02-overloads-und-callbacks.ts
│   ├── 03-type-guards-und-assertions.ts
│   ├── 04-praxis-szenarien.ts
│   └── 05-predict-the-output.ts
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- Quiz questions
├── pretest-data.ts           <-- Pre-test questions per section
├── misconceptions.ts         <-- Common misconceptions
├── completion-problems.ts    <-- Fill-in-the-blank exercises
├── debugging-data.ts         <-- Debugging challenges
├── parsons-data.ts           <-- Parsons problems
├── tracing-data.ts           <-- Code tracing exercises
├── transfer-data.ts          <-- Transfer tasks
├── hints.json                <-- Progressive hints
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this only AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **Function types are contracts**: Parameter types and the return type
   define a contract that every caller must honor.

2. **Let the return type be inferred — with exceptions**: TypeScript often
   infers the return type correctly. Specify it explicitly for public APIs.

3. **Optional parameters come last**: `?` parameters must appear after
   all required parameters. Default values make `?` unnecessary.

4. **Rest parameters are type-safe varargs**: Use `...args: number[]`
   instead of the unsafe `arguments` object.

5. **Overloads are a precision tool**: They describe multiple calling
   variants — the implementation must cover ALL of them.

6. **void callbacks may return values**: This explains why
   `arr.forEach(v => arr.push(v))` works.

7. **this has a type in TypeScript**: The `this` parameter (in the first
   position) is checked at compile time and disappears in the JavaScript output.

8. **Type guards are user-defined type narrowing**: With `value is Type`
   you can write your own narrowing functions.

9. **Assertion functions say "or throw!"**: `asserts value is Type`
   means: "After this call, the type is guaranteed — or an error was thrown."

10. **Function types are first-class**: Functions are values with types.
    `type Fn = (x: number) => string` is a fully valid type.

</details>

---

> **Start here:** [Section 01 - Function Types Basics](./sections/01-funktionstypen-basics.md)
>
> **Next lesson:** 07 - Union and Intersection Types —
> How to combine types and create powerful patterns with them.