/**
 * Lesson 01 — Parson's Problems: Setup & First Steps
 *
 * 3 problems for ordering code lines.
 * Concepts: Type Guards, Interfaces, tsconfig.json
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Type Guard Function ──────────────────────────────────────
  {
    id: "L01-P1",
    title: "Type Guard Function",
    description:
      "Arrange the lines so that a type guard function is created " +
      "that checks whether a value is a string and returns its length.",
    correctOrder: [
      "function getLength(value: unknown): number {",
      "  if (typeof value === 'string') {",
      "    return value.length;",
      "  }",
      "  return 0;",
      "}",
    ],
    distractors: [
      "  if (value instanceof String) {",
      "  return value.size;",
    ],
    hint: "typeof checks primitive types — instanceof checks class instances.",
    concept: "type-guards",
    difficulty: 1,
  },

  // ─── Problem 2: Interface + Object ───────────────────────────────────────
  {
    id: "L01-P2",
    title: "Define and use an Interface",
    description:
      "Arrange the lines so that an interface 'User' is defined " +
      "and an object of it is created.",
    correctOrder: [
      "interface User {",
      "  name: string;",
      "  age: number;",
      "}",
      "const alice: User = {",
      "  name: 'Alice',",
      "  age: 30,",
      "};",
    ],
    distractors: [
      "class User {",
    ],
    hint: "Interfaces begin with the keyword 'interface', not 'class'.",
    concept: "interfaces",
    difficulty: 1,
  },

  // ─── Problem 3: tsconfig.json Structure ──────────────────────────────────
  {
    id: "L01-P3",
    title: "tsconfig.json Basic Structure",
    description:
      "Arrange the lines into a valid tsconfig.json with " +
      "strict mode and ES2022 target.",
    correctOrder: [
      "{",
      '  "compilerOptions": {',
      '    "target": "ES2022",',
      '    "strict": true,',
      '    "noEmit": true',
      "  }",
      "}",
    ],
    distractors: [
      '    "strict": "yes",',
      '  "options": {',
    ],
    hint: "'strict' is a boolean (true/false), not a string.",
    concept: "tsconfig",
    difficulty: 1,
  },
];