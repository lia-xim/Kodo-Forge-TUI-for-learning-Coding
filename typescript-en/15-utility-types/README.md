# Lesson 15: Utility Types

> **Prerequisite:** Lessons 13-14 (Generics) completed.
> **Goal:** Confidently master TypeScript's built-in Utility Types, build your own, and combine them deliberately.
> **Core question of this lesson:** How do I transform existing types instead of rewriting them manually?
> **Total duration:** ~60 minutes (6 sections × ~10 minutes)

---

## Learning Path

This lesson is divided into **six sections**. Each section takes
approx. 10 minutes and has a clear stopping point at the end. You can stop after
each section and continue later.

### Sections

| # | Section | Duration | What you learn |
|---|---|---|---|
| 01 | [Partial, Required, Readonly](./sections/01-partial-required-readonly.md) | ~10 min | The three "modifier" utility types, when to use which |
| 02 | [Pick, Omit, Record](./sections/02-pick-omit-record.md) | ~10 min | Object transformation, Record\<K,V\> as dictionary, StrictOmit |
| 03 | [Extract, Exclude, NonNullable](./sections/03-extract-exclude-nonnullable.md) | ~10 min | Union type manipulation, filtering of types |
| 04 | [ReturnType, Parameters, Awaited](./sections/04-returntype-parameters-awaited.md) | ~10 min | Function-related utility types, Awaited\<Promise\<T\>\> |
| 05 | [Custom Utility Types](./sections/05-eigene-utility-types.md) | ~10 min | Building DeepPartial, DeepReadonly, Mutable, RequiredKeys |
| 06 | [Combining Utility Types](./sections/06-utility-types-kombinieren.md) | ~10 min | Composition: Pick + Partial, Omit + Required, patterns for forms/APIs |

---

## Recommended Learning Path

```
Read sections 01-06 (~10 min each, breaks in between possible)
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
15-utility-types/
├── README.md                 <-- You are here (overview + navigation)
├── sections/
│   ├── 01-partial-required-readonly.md
│   ├── 02-pick-omit-record.md
│   ├── 03-extract-exclude-nonnullable.md
│   ├── 04-returntype-parameters-awaited.md
│   ├── 05-eigene-utility-types.md
│   └── 06-utility-types-kombinieren.md
├── examples/                 <-- Runnable examples (npx tsx examples/01-...)
│   ├── 01-partial-required-readonly.ts
│   ├── 02-pick-omit-record.ts
│   ├── 03-extract-exclude-nonnullable.ts
│   ├── 04-returntype-parameters-awaited.ts
│   ├── 05-eigene-utility-types.ts
│   └── 06-utility-types-kombinieren.ts
├── exercises/                <-- Exercises with TODOs
│   ├── 01-partial-required-readonly.ts
│   ├── 02-pick-omit-record.ts
│   ├── 03-extract-exclude-nonnullable.ts
│   ├── 04-returntype-parameters-awaited.ts
│   ├── 05-eigene-utility-types.ts
│   └── 06-utility-types-kombinieren.ts
├── solutions/                <-- Solutions to the exercises
├── quiz.ts                   <-- Knowledge quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- Quiz questions + elaborated feedback
├── pretest-data.ts           <-- Pre-test per section
├── misconceptions.ts         <-- Misconceptions
├── completion-problems.ts    <-- Code gaps
├── debugging-data.ts         <-- Debugging challenges
├── parsons-data.ts           <-- Parsons problems
├── tracing-data.ts           <-- Code tracing
├── transfer-data.ts          <-- Transfer tasks
├── hints.json                <-- Graduated hints
└── cheatsheet.md             <-- Quick reference
```

---

## The 10 Most Important Insights (Spoiler!)

Read this AFTER the sections — it's your summary:

<details>
<summary>Expand summary</summary>

1. **Utility Types transform existing types**: Instead of duplicating types manually,
   you derive new types from existing ones.

2. **Partial\<T\> makes all properties optional**: Ideal for update operations
   where only changed fields are sent.

3. **Required\<T\> is the opposite of Partial**: Makes all optional
   properties mandatory — useful for validated data.

4. **Readonly\<T\> protects against mutation**: But only shallowly — for deep
   immutability you need DeepReadonly.

5. **Pick and Omit select properties**: Pick chooses, Omit excludes.
   Omit is NOT type-safe — it accepts arbitrary strings.

6. **Record\<K,V\> replaces index signatures**: More type-safe than
   `{ [key: string]: V }` and enforces specific keys.

7. **Extract and Exclude filter union types**: Extract keeps members,
   Exclude removes them. Both use conditional types internally.

8. **ReturnType and Parameters extract function signatures**:
   Indispensable when you want to use a function's type
   without defining it separately.

9. **Awaited\<T\> unwraps Promises recursively**: Since TypeScript 4.5 — no
   more manual `T extends Promise<infer U>` needed.

10. **Composition is the key**: The true power lies in combining:
    `Pick<T, K> & Partial<Omit<T, K>>` — certain fields required,
    rest optional. That's the pattern for forms and APIs.

</details>

---

> **Start here:** [Section 01 - Partial, Required, Readonly](./sections/01-partial-required-readonly.md)
>
> **Next lesson:** 16 — Mapped Types & Conditional Types —
> How you use the type system as a complete programming language.