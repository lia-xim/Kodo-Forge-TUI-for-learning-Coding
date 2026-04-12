The file path isn't specified — I'll translate the content directly and output the full file:

```typescript
/**
 * Lesson 02 — Tracing Exercises: Primitive Types
 *
 * Topics:
 *  - typeof null, NaN === NaN, 0.1 + 0.2
 *  - Type Narrowing with unknown
 *  - ?? vs || with falsy values
 *  - never and void
 *
 * Increasing difficulty: 1 → 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: JavaScript quirks with primitives ───────────────────────
  {
    id: "02-primitive-gotchas",
    title: "Primitive Gotchas — typeof, NaN, Floating Point",
    description:
      "Trace the surprising results of typeof null, " +
      "NaN comparisons, and floating-point arithmetic.",
    code: [
      "const a = typeof null;",
      "const b = typeof undefined;",
      "const c = NaN === NaN;",
      "const d = 0.1 + 0.2 === 0.3;",
      "const e = 0.1 + 0.2;",
      "",
      "console.log(a);",
      "console.log(b);",
      "console.log(c);",
      "console.log(d);",
      "console.log(e);",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "What is the value of 'a' (typeof null)?",
        expectedAnswer: "object",
        variables: { "a": "object" },
        explanation:
          "typeof null returns 'object' — a historical bug from " +
          "JavaScript 1.0 (1995). It was never fixed because too much " +
          "existing code depends on it.",
      },
      {
        lineIndex: 1,
        question: "What is the value of 'b' (typeof undefined)?",
        expectedAnswer: "undefined",
        variables: { "a": "object", "b": "undefined" },
        explanation:
          "typeof undefined correctly returns 'undefined'. " +
          "Unlike with null, typeof behaves as expected for undefined.",
      },
      {
        lineIndex: 2,
        question: "What is the value of 'c' (NaN === NaN)?",
        expectedAnswer: "false",
        variables: { "a": "object", "b": "undefined", "c": "false" },
        explanation:
          "NaN is the only value in JavaScript that is NOT equal to " +
          "itself. NaN === NaN is false. " +
          "Use Number.isNaN() to check for NaN.",
      },
      {
        lineIndex: 3,
        question: "What is the value of 'd' (0.1 + 0.2 === 0.3)?",
        expectedAnswer: "false",
        variables: { "a": "object", "b": "undefined", "c": "false", "d": "false" },
        explanation:
          "IEEE 754 floating point: 0.1 + 0.2 yields 0.30000000000000004, " +
          "not exactly 0.3. Therefore the comparison is false. " +
          "For monetary values, use integers (cents) instead.",
      },
      {
        lineIndex: 4,
        question: "What is the exact value of 'e' (0.1 + 0.2)?",
        expectedAnswer: "0.30000000000000004",
        variables: { "a": "object", "b": "undefined", "c": "false", "d": "false", "e": "0.30000000000000004" },
        explanation:
          "This is the actual IEEE 754 floating-point value. " +
          "The tiny deviation occurs because 0.1 and 0.2 " +
          "cannot be represented exactly in binary.",
      },
    ],
    concept: "primitive-types",
    difficulty: 1,
  },

  // ─── Exercise 2: Type Narrowing with unknown ─────────────────────────────
  {
    id: "02-typeof-narrowing",
    title: "Type Narrowing with typeof",
    description:
      "Trace the TypeScript type of variable x through each " +
      "control flow branch.",
    code: [
      "function process(x: string | number | null) {",
      "  // x has type: string | number | null",
      "  if (x === null) {",
      "    return 'nichts';",
      "  }",
      "  // x now has type: ???",
      "  if (typeof x === 'string') {",
      "    console.log(x.toUpperCase());",
      "    // x has type: ???",
      "  } else {",
      "    console.log(x.toFixed(2));",
      "    // x has type: ???",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "What TypeScript type does x have at the start of the function?",
        expectedAnswer: "string | number | null",
        variables: { "x": "string | number | null" },
        explanation:
          "The parameter x is declared as a union type: " +
          "string | number | null. TypeScript does not yet know the " +
          "concrete value.",
      },
      {
        lineIndex: 5,
        question:
          "What type does x have AFTER the null check in lines 3-4? " +
          "(When we reach line 6)",
        expectedAnswer: "string | number",
        variables: { "x": "string | number" },
        explanation:
          "The null check with early return eliminates null from the union type. " +
          "TypeScript's Control Flow Analysis recognizes: if we get here, " +
          "x cannot be null. So: string | number.",
      },
      {
        lineIndex: 8,
        question:
          "What type does x have in the if-branch (typeof x === 'string')?",
        expectedAnswer: "string",
        variables: { "x": "string" },
        explanation:
          "The typeof check narrows the type further. In the if-branch " +
          "TypeScript knows: x is a string. Therefore " +
          "x.toUpperCase() is allowed without error.",
      },
      {
        lineIndex: 11,
        question:
          "What type does x have in the else-branch?",
        expectedAnswer: "number",
        variables: { "x": "number" },
        explanation:
          "In the else-branch, TypeScript eliminates string (that was the " +
          "if-case) and null (that was the early return). " +
          "What remains: number. Therefore x.toFixed(2) is allowed.",
      },
    ],
    concept: "type-narrowing",
    difficulty: 2,
  },

  // ─── Exercise 3: ?? vs || with falsy values ──────────────────────────────
  {
    id: "02-nullish-vs-or",
    title: "Nullish Coalescing (??) vs. Logical OR (||)",
    description:
      "Trace the difference between ?? and || with " +
      "falsy values like 0, '' and false.",
    code: [
      "const a = 0 || 'fallback';",
      "const b = 0 ?? 'fallback';",
      "const c = '' || 'fallback';",
      "const d = '' ?? 'fallback';",
      "const e = false || 'fallback';",
      "const f = false ?? 'fallback';",
      "const g = null || 'fallback';",
      "const h = null ?? 'fallback';",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "What is the value of 'a'? (0 || 'fallback')",
        expectedAnswer: "fallback",
        variables: { "a": "fallback" },
        explanation:
          "|| checks for 'falsy'. 0 is falsy in JavaScript, " +
          "so 'fallback' is returned. " +
          "This is often unintended when 0 is a valid value.",
      },
      {
        lineIndex: 1,
        question:
          "What is the value of 'b'? (0 ?? 'fallback')",
        expectedAnswer: "0",
        variables: { "a": "fallback", "b": "0" },
        explanation:
          "?? checks ONLY for null and undefined. 0 is neither null " +
          "nor undefined, so the value stays 0. " +
          "This is the great advantage of ?? with numeric values.",
      },
      {
        lineIndex: 2,
        question:
          "What is the value of 'c'? ('' || 'fallback')",
        expectedAnswer: "fallback",
        variables: { "a": "fallback", "b": "0", "c": "fallback" },
        explanation:
          "An empty string '' is falsy. || therefore returns 'fallback'. " +
          "This can be problematic when an empty string " +
          "is a valid input value.",
      },
      {
        lineIndex: 3,
        question:
          "What is the value of 'd'? ('' ?? 'fallback')",
        expectedAnswer: "",
        variables: { "a": "fallback", "b": "0", "c": "fallback", "d": "" },
        explanation:
          "'' is neither null nor undefined. ?? keeps the " +
          "empty string. Rule of thumb: ?? for null/undefined checks, " +
          "|| for general falsy checks.",
      },
      {
        lineIndex: 6,
        question:
          "What is the value of 'g'? (null || 'fallback') " +
          "And what is the value of 'h'? (null ?? 'fallback')",
        expectedAnswer: "Both: fallback",
        variables: {
          "e": "fallback",
          "f": "false",
          "g": "fallback",
          "h": "fallback",
        },
        explanation:
          "With null (and undefined), || and ?? behave identically: " +
          "both return 'fallback'. The difference only shows " +
          "with 0, '' and false.",
      },
    ],
    concept: "nullish-coalescing",
    difficulty: 2,
  },

  // ─── Exercise 4: unknown — forced narrowing ──────────────────────────────
  {
    id: "02-unknown-narrowing",
    title: "unknown — Narrowing Step by Step",
    description:
      "Trace how an unknown value is progressively narrowed " +
      "through various checks.",
    code: [
      "function handleInput(val: unknown) {",
      "  // val has type: unknown",
      "  if (typeof val === 'object') {",
      "    // val has type: ???",
      "    if (val !== null) {",
      "      // val has type: ???",
      "      console.log(Object.keys(val));",
      "    }",
      "  }",
      "  if (typeof val === 'string') {",
      "    // val has type: ???",
      "    console.log(val.length);",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "What type does val have at the start?",
        expectedAnswer: "unknown",
        variables: { "val": "unknown" },
        explanation:
          "unknown is the safe 'top type'. Any value can be " +
          "assigned to it, but you can't do anything with it " +
          "without first narrowing the type.",
      },
      {
        lineIndex: 3,
        question:
          "What type does val have after 'typeof val === \"object\"'?",
        expectedAnswer: "object | null",
        variables: { "val": "object | null" },
        explanation:
          "typeof returns 'object' for objects AND for null " +
          "(the historical bug). Therefore val after this check " +
          "has type 'object | null' — null is not yet excluded!",
      },
      {
        lineIndex: 5,
        question:
          "What type does val have after the additional null check?",
        expectedAnswer: "object",
        variables: { "val": "object" },
        explanation:
          "After 'val !== null', null is eliminated. Now val has " +
          "type 'object'. Only now is Object.keys(val) safe. " +
          "Without the null check, TypeScript would report an error.",
      },
      {
        lineIndex: 10,
        question:
          "What type does val have in the string check (line 10)?",
        expectedAnswer: "string",
        variables: { "val": "string" },
        explanation:
          "Each typeof check in its own if-block narrows independently. " +
          "Here val is narrowed to 'string'. " +
          "val.length is now safe to call.",
      },
    ],
    concept: "type-narrowing",
    difficulty: 3,
  },

  // ─── Exercise 5: never and exhaustive checks ─────────────────────────────
  {
    id: "02-never-exhaustive",
    title: "never — Exhaustive Type Checking",
    description:
      "Trace how TypeScript uses the never type to ensure " +
      "that all cases are covered.",
    code: [
      "type Shape = 'circle' | 'square' | 'triangle';",
      "",
      "function area(shape: Shape): number {",
      "  switch (shape) {",
      "    case 'circle':",
      "      return Math.PI * 10 * 10;",
      "    case 'square':",
      "      return 10 * 10;",
      "    case 'triangle':",
      "      return (10 * 10) / 2;",
      "    default:",
      "      const _exhaustive: never = shape;",
      "      return _exhaustive;",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "What type does 'shape' have in the switch statement " +
          "before the case checks?",
        expectedAnswer: "circle | square | triangle",
        variables: { "shape": "circle | square | triangle" },
        explanation:
          "Shape is a union type of three string literals. " +
          "TypeScript knows all possible values.",
      },
      {
        lineIndex: 6,
        question:
          "What type does 'shape' have after case 'circle'? " +
          "(In the remaining code)",
        expectedAnswer: "square | triangle",
        variables: { "shape": "square | triangle" },
        explanation:
          "The case 'circle' with return eliminates 'circle' from the " +
          "union type. TypeScript knows: if we continue here, " +
          "shape cannot be 'circle'.",
      },
      {
        lineIndex: 11,
        question:
          "What type does 'shape' have in the default branch, " +
          "when all three cases are covered?",
        expectedAnswer: "never",
        variables: { "shape": "never" },
        explanation:
          "After all three values (circle, square, triangle) have been " +
          "covered by case branches, nothing remains. " +
          "TypeScript infers 'never' — the type for 'impossible'.",
      },
      {
        lineIndex: 11,
        question:
          "What happens if someone adds 'rectangle' to the Shape type " +
          "but doesn't add a case for it?",
        expectedAnswer: "Compile error: 'rectangle' is not assignable to 'never'",
        variables: { "shape": "rectangle (not never!)" },
        explanation:
          "That's the trick: when a new value is added to the union " +
          "and no case exists for it, shape has type 'rectangle' in the default. " +
          "The assignment to 'never' fails — " +
          "TypeScript reports the error. Exhaustive check!",
      },
    ],
    concept: "never-type",
    difficulty: 4,
  },
];
```