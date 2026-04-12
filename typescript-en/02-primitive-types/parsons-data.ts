/**
 * Lesson 02 — Parson's Problems: Primitive Types
 *
 * 3 problems for ordering code lines.
 * Concepts: Exhaustive Switch, Type Narrowing, null-safe Function
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Exhaustive Switch with never ─────────────────────────────
  {
    id: "L02-P1",
    title: "Exhaustive Switch with never",
    description:
      "Arrange the lines so that an exhaustive switch is formed " +
      "that covers all cases of a union type and produces a compile " +
      "error for new cases.",
    correctOrder: [
      "type Color = 'red' | 'green' | 'blue';",
      "function getHex(color: Color): string {",
      "  switch (color) {",
      "    case 'red': return '#ff0000';",
      "    case 'green': return '#00ff00';",
      "    case 'blue': return '#0000ff';",
      "    default: const _exhaustive: never = color; return _exhaustive;",
      "  }",
      "}",
    ],
    distractors: [
      "    default: return 'unknown';",
      "    default: throw new Error(color);",
    ],
    hint:
      "The never type ensures that the switch covers all cases — " +
      "a simple default with a string or error does not.",
    concept: "exhaustive-switch",
    difficulty: 2,
  },

  // ─── Problem 2: Type Narrowing Chain ─────────────────────────────────────
  {
    id: "L02-P2",
    title: "Type Narrowing Chain",
    description:
      "Arrange the lines so that the type is narrowed step by step: " +
      "from unknown through typeof checks to the concrete type.",
    correctOrder: [
      "function describe(value: unknown): string {",
      "  if (typeof value === 'string') {",
      "    return `String: ${value.toUpperCase()}`;",
      "  }",
      "  if (typeof value === 'number') {",
      "    return `Number: ${value.toFixed(2)}`;",
      "  }",
      "  return 'Unknown type';",
      "}",
    ],
    distractors: [
      "  if (value instanceof string) {",
    ],
    hint:
      "typeof checks primitive types (string, number). " +
      "instanceof only works with classes, not with primitive types.",
    concept: "type-narrowing",
    difficulty: 2,
  },

  // ─── Problem 3: null-safe Function ───────────────────────────────────────
  {
    id: "L02-P3",
    title: "null-safe Function",
    description:
      "Arrange the lines so that a function is created that null-safely " +
      "returns the length of a string — using the Nullish Coalescing Operator.",
    correctOrder: [
      "function safeLength(text: string | null): number {",
      "  return text?.length ?? 0;",
      "}",
    ],
    distractors: [
      "  return text.length || 0;",
      "  return text?.length ? text.length : 0;",
    ],
    hint:
      "The || operator treats 0 as falsy — for an empty string " +
      "text.length === 0, and || would still return 0. " +
      "The ?? operator only checks for null/undefined.",
    concept: "nullish-coalescing",
    difficulty: 2,
  },
];