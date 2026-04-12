/**
 * Lesson 11 — Parson's Problems: Type Narrowing
 *
 * 4 problems for arranging lines of code.
 * Concepts: typeof Guard, in-Operator, Type Predicate, Exhaustive Switch
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: typeof Narrowing Chain ──────────────────────────────────
  {
    id: "L11-P1",
    title: "typeof Narrowing Chain for unknown",
    description:
      "Arrange the lines so that an unknown value is narrowed step by step through " +
      "typeof checks. Note: null must be checked BEFORE typeof " +
      "object!",
    correctOrder: [
      "function describe(value: unknown): string {",
      "  if (value === null) return 'null';",
      "  if (typeof value === 'string') return `String: ${value}`;",
      "  if (typeof value === 'number') return `Number: ${value}`;",
      "  if (typeof value === 'object') return 'Object';",
      "  return 'Other';",
      "}",
    ],
    distractors: [
      "  if (typeof value === 'null') return 'null';",
      "  if (value instanceof string) return `String: ${value}`;",
    ],
    hint:
      "typeof null returns 'object', not 'null'. " +
      "And instanceof doesn't work with primitive types — " +
      "use typeof for string, number, etc.",
    concept: "typeof-narrowing",
    difficulty: 2,
  },

  // ─── Problem 2: Discriminated Union with in-Operator ──────────────────────
  {
    id: "L11-P2",
    title: "Discriminated Union with in-Operator",
    description:
      "Arrange the lines so that the area of various shapes is " +
      "calculated. Use the in-operator for narrowing.",
    correctOrder: [
      "interface Circle { radius: number }",
      "interface Rect { width: number; height: number }",
      "type Shape = Circle | Rect;",
      "function area(shape: Shape): number {",
      "  if ('radius' in shape) {",
      "    return Math.PI * shape.radius ** 2;",
      "  }",
      "  return shape.width * shape.height;",
      "}",
    ],
    distractors: [
      "  if (shape instanceof Circle) {",
      "  if (typeof shape === 'Circle') {",
    ],
    hint:
      "Circle is an interface, not a class — instanceof doesn't work. " +
      "typeof always returns 'object' for objects, not " +
      "the interface name. Use the in-operator!",
    concept: "in-operator",
    difficulty: 2,
  },

  // ─── Problem 3: Custom Type Guard ────────────────────────────────────────
  {
    id: "L11-P3",
    title: "Custom Type Guard for API Data",
    description:
      "Arrange the lines so that a type guard is created that " +
      "validates unknown data as a User.",
    correctOrder: [
      "interface User { name: string; age: number }",
      "function isUser(data: unknown): data is User {",
      "  if (typeof data !== 'object' || data === null) return false;",
      "  const obj = data as Record<string, unknown>;",
      "  return typeof obj.name === 'string' && typeof obj.age === 'number';",
      "}",
    ],
    distractors: [
      "function isUser(data: unknown): boolean {",
      "  return data instanceof User;",
    ],
    hint:
      "A type guard must have 'data is User' as its return type, " +
      "not just boolean — otherwise TypeScript won't narrow. " +
      "And instanceof doesn't work with interfaces!",
    concept: "type-predicates",
    difficulty: 3,
  },

  // ─── Problem 4: Exhaustive Switch with assertNever ────────────────────────
  {
    id: "L11-P4",
    title: "Exhaustive Switch with assertNever",
    description:
      "Arrange the lines so that an exhaustive switch is created. " +
      "The default branch with assertNever ensures that " +
      "all cases are covered.",
    correctOrder: [
      "function assertNever(value: never): never {",
      "  throw new Error(`Unhandled: ${value}`);",
      "}",
      "type Status = 'active' | 'paused' | 'stopped';",
      "function icon(status: Status): string {",
      "  switch (status) {",
      "    case 'active':  return '▶';",
      "    case 'paused':  return '⏸';",
      "    case 'stopped': return '⏹';",
      "    default: return assertNever(status);",
      "  }",
      "}",
    ],
    distractors: [
      "    default: return 'unknown';",
      "    default: throw new Error(status);",
    ],
    hint:
      "assertNever expects never as a parameter — this only works " +
      "when all cases are covered. A simple default " +
      "with string or Error provides NO compile-time protection for " +
      "new union values.",
    concept: "exhaustive-checks",
    difficulty: 3,
  },
];