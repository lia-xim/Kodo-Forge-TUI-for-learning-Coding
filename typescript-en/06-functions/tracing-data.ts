/**
 * Lesson 06 — Tracing Exercises: Functions
 *
 * Topics:
 *  - Overload resolution: Which overload matches?
 *  - void callback: What happens to the return value?
 *  - Currying: Step by step through the chain
 *  - Type narrowing with type guard
 *
 * Difficulty increasing: 2 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // --- Exercise 1: Overload Resolution ────────────────────────────────────
  {
    id: "06-overload-resolution",
    title: "Overload Resolution — which overload is selected?",
    description:
      "Trace how TypeScript selects the correct overload from top to bottom " +
      "for overloaded functions.",
    code: [
      "function format(x: string): string;",
      "function format(x: number): string;",
      "function format(x: string | number): string {",
      "  return `[${x}]`;",
      "}",
      "",
      "const a = format('hello');",
      "const b = format(42);",
    ],
    steps: [
      {
        lineIndex: 6,
        question: "What type does 'a' have? Which overload matches for format('hello')?",
        expectedAnswer: "string (Overload 1 matches: string -> string)",
        variables: { "a": "'[hello]' (type: string)" },
        explanation:
          "'hello' is a string. TypeScript checks from the top: Overload 1 " +
          "accepts string — match! The return type is string.",
      },
      {
        lineIndex: 7,
        question: "What type does 'b' have? Which overload matches for format(42)?",
        expectedAnswer: "string (Overload 2 matches: number -> string)",
        variables: { "a": "'[hello]' (type: string)", "b": "'[42]' (type: string)" },
        explanation:
          "42 is a number. Overload 1 (string) does not match. " +
          "Overload 2 (number) matches — return type is string.",
      },
    ],
    concept: "function-overloads",
    difficulty: 2,
  },

  // --- Exercise 2: void Callback Behavior ─────────────────────────────────
  {
    id: "06-void-callback-behavior",
    title: "void Callback — ignored return value",
    description:
      "Trace what happens when a void callback returns a value " +
      "and why forEach ignores the result.",
    code: [
      "const numbers: number[] = [];",
      "",
      "[1, 2, 3].forEach(n => numbers.push(n));",
      "",
      "console.log(numbers);",
      "console.log(numbers.length);",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "What type and value does numbers have after initialization?",
        expectedAnswer: "[] (empty number[])",
        variables: { "numbers": "[] (type: number[])" },
        explanation:
          "numbers is an empty array of type number[]. " +
          "The annotation is necessary because an empty array would otherwise be inferred as never[].",
      },
      {
        lineIndex: 2,
        question:
          "What does the callback n => numbers.push(n) return? " +
          "Is this a problem for forEach?",
        expectedAnswer: "push() returns number (new length), but forEach ignores it",
        variables: { "numbers": "[1, 2, 3] (type: number[])" },
        explanation:
          "push() returns the new array length (1, 2, 3). " +
          "forEach expects () => void — but void callbacks ARE ALLOWED to return " +
          "values. The value is simply ignored. Without this rule, " +
          "this everyday pattern would be a compile error.",
      },
      {
        lineIndex: 4,
        question: "What does console.log(numbers) output?",
        expectedAnswer: "[1, 2, 3]",
        variables: { "numbers": "[1, 2, 3]" },
        explanation:
          "All three values were successfully added via push.",
      },
    ],
    concept: "void-callback",
    difficulty: 2,
  },

  // --- Exercise 3: Currying Step by Step ──────────────────────────────────
  {
    id: "06-currying-steps",
    title: "Currying — Step by Step Through the Function Chain",
    description:
      "Trace how a currying function is first configured " +
      "and then called multiple times.",
    code: [
      "function multiply(factor: number): (x: number) => number {",
      "  return (x) => factor * x;",
      "}",
      "",
      "const double = multiply(2);",
      "const triple = multiply(3);",
      "",
      "const a = double(5);",
      "const b = triple(5);",
      "const c = double(triple(4));",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "What type does 'double' have? What is its value?",
        expectedAnswer: "(x: number) => number — a function that computes x * 2",
        variables: { "double": "(x) => 2 * x (type: (x: number) => number)" },
        explanation:
          "multiply(2) returns a new function that computes 2 * x. " +
          "factor = 2 is stored via closure.",
      },
      {
        lineIndex: 5,
        question: "What type does 'triple' have?",
        expectedAnswer: "(x: number) => number — a function that computes x * 3",
        variables: {
          "double": "(x) => 2 * x",
          "triple": "(x) => 3 * x (type: (x: number) => number)",
        },
        explanation:
          "multiply(3) returns a function that computes 3 * x. " +
          "Each call to multiply creates a NEW closure.",
      },
      {
        lineIndex: 7,
        question: "What is the value of 'a'?",
        expectedAnswer: "10 (double(5) = 2 * 5)",
        variables: { "a": "10 (type: number)" },
        explanation: "double(5) = 2 * 5 = 10. The closure uses factor = 2.",
      },
      {
        lineIndex: 8,
        question: "What is the value of 'b'?",
        expectedAnswer: "15 (triple(5) = 3 * 5)",
        variables: { "a": "10", "b": "15 (type: number)" },
        explanation: "triple(5) = 3 * 5 = 15. The closure uses factor = 3.",
      },
      {
        lineIndex: 9,
        question: "What is the value of 'c'? Compute from the inside out.",
        expectedAnswer: "24 (triple(4) = 12, then double(12) = 24)",
        variables: { "a": "10", "b": "15", "c": "24 (type: number)" },
        explanation:
          "From the inside out: triple(4) = 3 * 4 = 12. " +
          "Then: double(12) = 2 * 12 = 24. Currying functions " +
          "can be combined in any way.",
      },
    ],
    concept: "currying",
    difficulty: 3,
  },

  // --- Exercise 4: Type Guard and Narrowing ───────────────────────────────
  {
    id: "06-type-guard-narrowing",
    title: "Type Guard Narrows the Type Step by Step",
    description:
      "Trace how a type guard narrows the type of a variable " +
      "step by step.",
    code: [
      "function isString(value: unknown): value is string {",
      "  return typeof value === 'string';",
      "}",
      "",
      "function process(input: unknown) {",
      "  // input is unknown",
      "  if (isString(input)) {",
      "    // input is string",
      "    console.log(input.toUpperCase());",
      "  } else {",
      "    // input is still unknown",
      "    console.log('Not a string:', input);",
      "  }",
      "}",
      "",
      "process('hello');",
      "process(42);",
    ],
    steps: [
      {
        lineIndex: 6,
        question: "What type does 'input' have BEFORE the if check?",
        expectedAnswer: "unknown",
        variables: { "input": "(type: unknown)" },
        explanation:
          "Inside the process function, input is declared as unknown. " +
          "Without narrowing, nothing can be done with it.",
      },
      {
        lineIndex: 7,
        question: "What type does 'input' have INSIDE the if block after isString(input)?",
        expectedAnswer: "string",
        variables: { "input": "(type: string — narrowed by type guard)" },
        explanation:
          "isString has the return type 'value is string'. When the function " +
          "returns true, TypeScript narrows input to string. " +
          "This is why input.toUpperCase() works without error.",
      },
      {
        lineIndex: 10,
        question: "What type does 'input' have in the else block?",
        expectedAnswer: "unknown (the type guard only excluded string, but unknown minus string = unknown)",
        variables: { "input": "(type: unknown)" },
        explanation:
          "In the else block, TypeScript only knows that input is NOT a string. " +
          "Since input is declared as unknown and unknown minus string = unknown, " +
          "the type remains unknown.",
      },
      {
        lineIndex: 15,
        question: "What does process('hello') output?",
        expectedAnswer: "HELLO",
        variables: {},
        explanation:
          "'hello' is a string. isString returns true. " +
          "In the if block, 'hello'.toUpperCase() = 'HELLO' is output.",
      },
      {
        lineIndex: 16,
        question: "What does process(42) output?",
        expectedAnswer: "Not a string: 42",
        variables: {},
        explanation:
          "42 is not a string. isString returns false. " +
          "In the else block, 'Not a string: 42' is output.",
      },
    ],
    concept: "type-guard-narrowing",
    difficulty: 3,
  },
];