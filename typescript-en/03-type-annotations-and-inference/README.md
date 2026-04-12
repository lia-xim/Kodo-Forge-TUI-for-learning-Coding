# Lesson 03: Type Annotations & Type Inference

## Learning Objectives

After this lesson you will understand:
- **Why** TypeScript has inference and what would happen without it
- When you should explicitly annotate types and when not to -- and **why** the answer is what it is
- How the inference algorithm **actually works** (Best Common Type, Contextual Typing, Control Flow Analysis)
- What **widening** is and why `let` and `const` produce different types
- How `as const` and the **satisfies operator** let you precisely control inference
- Where inference **fails** and why -- and how to recognize these cases
- The principle **"Annotate at boundaries, infer inside"** and why it's the best strategy

---

## Sections (~10 min per section)

This lesson is divided into seven sections. Each section is a self-contained learning unit you can work through in about 10 minutes. Work through them in order -- each section builds on the previous one.

| # | Section | What you'll learn | Duration |
|---|---------|---------------|:-----:|
| 1 | [Why Inference Exists](./sections/01-warum-inference-existiert.md) | The core problem, Hindley-Milner, TypeScript's design philosophy | ~10 min |
| 2 | [Explicit Annotations](./sections/02-explizite-annotationen.md) | Annotation syntax, decision tree, why over-annotating is harmful | ~10 min |
| 3 | [How Inference Works](./sections/03-wie-inference-funktioniert.md) | The 6 inference rules: Initialization, Best Common Type, Return Types, Contextual Typing, Generics, Control Flow | ~12 min |
| 4 | [Widening and const](./sections/04-widening-und-const.md) | `let` vs `const`, object widening, `as const`, enum replacement patterns | ~10 min |
| 5 | [Contextual Typing and Control Flow](./sections/05-contextual-typing.md) | Backwards inference, narrowing guards, discriminated unions, CFA limits | ~12 min |
| 6 | [The satisfies Operator](./sections/06-satisfies-operator.md) | The story behind satisfies, safety + precision, `as const satisfies` | ~10 min |
| 7 | [Where Inference Falls Short](./sections/07-wo-inference-versagt.md) | 6 systematic weak spots, Object.keys() design, golden rules | ~10 min |

**Total theory time:** ~75 minutes

---

## The Guiding Principle of This Lesson

```
  +---------------------------------------------------------+
  |  OUTSIDE: Annotate                                      |
  |                                                         |
  |  - Function parameters                                  |
  |  - Exported return types                                |
  |  - API responses / JSON.parse                           |
  |  - Empty arrays                                         |
  |  - Variables without an initial value                   |
  |                                                         |
  |  +---------------------------------------------------+  |
  |  |  INSIDE: Let inference do the work               |  |
  |  |                                                   |  |
  |  |  - Local variables with a value                   |  |
  |  |  - Callback parameters (Contextual Typing)        |  |
  |  |  - Intermediate results                           |  |
  |  |  - const values                                   |  |
  |  +---------------------------------------------------+  |
  |                                                         |
  |  SPECIAL: satisfies / as const                          |
  |  - Config objects: satisfies                            |
  |  - Enum replacement: as const                           |
  |  - Maximum precision: as const satisfies                |
  +---------------------------------------------------------+
```

---

## Practice Material

After working through the sections:

### Examples (for experimenting)

| File | Topic |
|-------|-------|
| `examples/01-explizite-annotationen.ts` | All annotation syntax variants |
| `examples/02-type-inference.ts` | Inference in action -- hover over variables! |
| `examples/03-widening-und-const.ts` | Widening, `let` vs `const`, `as const`, `satisfies` |
| `examples/04-contextual-typing.ts` | Contextual Typing with callbacks and more |
| `examples/05-control-flow-analysis.ts` | Control Flow Narrowing and Inference |
| `examples/06-satisfies-deep-dive.ts` | `satisfies` vs annotation vs inference |

### Exercises (to do yourself)

| File | Task |
|-------|---------|
| `exercises/01-annotieren-oder-infern.ts` | 15 scenarios: annotation needed or not? |
| `exercises/02-inference-vorhersagen.ts` | 15 type predictions with type-level tests |
| `exercises/03-satisfies-und-control-flow.ts` | Apply satisfies, leverage Control Flow |
| `exercises/04-predict-the-type.ts` | Predict 12 surprising inference cases |
| `exercises/05-fehlermeldungen-lesen.ts` | Correctly interpret 6 inference error messages |

Solutions are in `solutions/`.

### Quiz

```bash
npx tsx 03-type-annotations-und-inference/quiz.ts
```

### Reference

The [Cheatsheet](./cheatsheet.md) summarizes all the rules on a single page.

---

## How to Work Through This Lesson

1. Read **sections 1-7** in order (with breaks in between)
2. Open the **Examples** and experiment (hover over variables!)
3. Work through the **Exercises** on your own
4. Compare with the **Solutions**
5. Complete the **Quiz**: `npx tsx 03-type-annotations-und-inference/quiz.ts`
6. Keep the **Cheatsheet** as a reference