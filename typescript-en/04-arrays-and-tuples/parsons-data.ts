```typescript
/**
 * Lektion 04 — Parson's Problems: Arrays & Tuples
 *
 * 3 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: filter mit Type Predicate, Tuple-Destructuring, readonly-Funktion
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: filter mit Type Predicate ───────────────────────────────
  {
    id: "L04-P1",
    title: "Array.filter with Type Predicate",
    description:
      "Arrange the lines to create a function that filters null values " +
      "from an array and TypeScript correctly recognizes the " +
      "filtered type.",
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
      "Without a type predicate (value is T), TypeScript doesn't recognize the filtered " +
      "type — the result stays (string | null)[]. The function must have " +
      "'value is T' instead of 'boolean' as the return type.",
    concept: "type-predicate",
    difficulty: 3,
  },

  // ─── Problem 2: Tuple-Destructuring ─────────────────────────────────────
  {
    id: "L04-P2",
    title: "Tuple with Named Destructuring",
    description:
      "Arrange the lines to define a tuple type for HTTP responses " +
      "and use it via destructuring.",
    correctOrder: [
      "type HttpResponse = [status: number, body: string, ok: boolean];",
      "",
      "function fetchData(): HttpResponse {",
      "  return [200, '{\"data\": 42}', true];",
      "}",
      "",
      "const [status, body, ok] = fetchData();",
      "console.log(`Status ${status}: ${ok ? body : 'Fehler'}`);",
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

  // ─── Problem 3: readonly-Funktion ───────────────────────────────────────
  {
    id: "L04-P3",
    title: "Function with readonly Parameter",
    description:
      "Arrange the lines to create a function that accepts a " +
      "readonly array and calculates the sum — without " +
      "modifying the original array.",
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
      "  numbers.push(0); // Initialisierung",
    ],
    hint:
      "readonly number[] prevents the function from modifying the array " +
      "(no push, pop, splice, etc.). The parameter type number[] without readonly " +
      "would allow mutations.",
    concept: "readonly-arrays",
    difficulty: 2,
  },
];
```