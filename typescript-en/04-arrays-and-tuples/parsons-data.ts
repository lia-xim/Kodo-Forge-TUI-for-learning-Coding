/**
 * Lesson 04 — Parson's Problems: Arrays & Tuples
 *
 * 3 problems for ordering lines of code.
 * Concepts: filter with Type Predicate, Tuple-Destructuring, readonly function
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: filter with Type Predicate ──────────────────────────────
  {
    id: "L04-P1",
    title: "Array.filter with Type Predicate",
    description:
      "Order the lines so that a function is created that " +
      "filters null values out of an array and TypeScript " +
      "correctly recognizes the filtered type.",
    correctOrder: [
      "function isNotNull<T>(value: T | null): value is T {",
      "  return value !== null;",
      "}",
      "",
      "const mixed: (string | null)[] = ['hello', null, 'world'];",
      "const strings: string[] = mixed.filter(isNotNull);",
    ],
    distractors: [
      "function isNotNull<T>(value: T | null): boolean {",
      "const strings = mixed.filter(v => v !== null);",
    ],
    hint:
      "Without a Type Predicate (value is T) TypeScript does not recognize the filtered " +
      "type — the result stays (string | null)[]. The function must use " +
      "'value is T' instead of 'boolean' as the return type.",
    concept: "type-predicate",
    difficulty: 3,
  },

  // ─── Problem 2: Tuple-Destructuring ─────────────────────────────────────
  {
    id: "L04-P2",
    title: "Tuple with Named Destructuring",
    description:
      "Order the lines so that a tuple type for HTTP responses " +
      "is defined and used via destructuring.",
    correctOrder: [
      "type HttpResponse = [status: number, body: string, ok: boolean];",
      "",
      "function fetchData(): HttpResponse {",
      "  return [200, '{\"data\": 42}', true];",
      "}",
      "",
      "const [status, body, ok] = fetchData();",
      "console.log(`Status ${status}: ${ok ? body : 'Error'}`);",
    ],
    distractors: [
      "type HttpResponse = { status: number; body: string; ok: boolean };",
      "const { status, body, ok } = fetchData();",
    ],
    hint:
      "Tuples use array syntax [a, b, c] — not object syntax { a, b, c }. " +
      "Tuple destructuring uses square brackets, object destructuring uses curly braces.",
    concept: "tuple-destructuring",
    difficulty: 2,
  },

  // ─── Problem 3: readonly function ───────────────────────────────────────
  {
    id: "L04-P3",
    title: "Function with readonly Parameter",
    description:
      "Order the lines so that a function is created that " +
      "accepts a readonly array and computes the sum — without " +
      "mutating the original array.",
    correctOrder: [
      "function sum(numbers: readonly number[]): number {",
      "  let total = 0;",
      "  for (const n of numbers) {",
      "    total += n;",
      "  }",
      "  return total;",
      "}",
    ],
    distractors: [
      "function sum(numbers: number[]): number {",
      "  numbers.push(0); // initialization",
    ],
    hint:
      "readonly number[] prevents the function from mutating the array " +
      "(no push, pop, splice, etc.). The parameter type number[] without readonly " +
      "would allow mutations.",
    concept: "readonly-arrays",
    difficulty: 2,
  },
];