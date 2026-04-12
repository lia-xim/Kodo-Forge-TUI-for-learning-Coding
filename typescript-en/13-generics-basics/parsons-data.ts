/**
 * Lesson 13 — Parson's Problems: Generics Basics
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L13-P1",
    title: "Generic identity Function",
    description: "Arrange the lines into a generic identity function with a call.",
    correctOrder: [
      "function identity<T>(arg: T): T {",
      "  return arg;",
      "}",
      "",
      "const str = identity('hallo');",
      "const num = identity(42);",
    ],
    distractors: [
      "function identity(arg: any): any {",
      "const str = identity<any>('hallo');",
    ],
    hint: "The generic version uses <T> instead of any. When calling it, no explicit type is needed — TypeScript infers it.",
    concept: "generic-function-basics",
    difficulty: 1,
  },

  {
    id: "L13-P2",
    title: "Generic Interface with Constraint",
    description: "Arrange the lines into a Repository interface with HasId constraint.",
    correctOrder: [
      "interface HasId {",
      "  id: number;",
      "}",
      "",
      "interface Repository<T extends HasId> {",
      "  findById(id: number): T | null;",
      "  findAll(): T[];",
      "  save(entity: T): void;",
      "}",
    ],
    distractors: [
      "interface Repository<T> {",
      "interface Repository<T extends string> {",
    ],
    hint: "T extends HasId ensures that every entity has an id. Without the constraint, T could be anything.",
    concept: "generic-interface-constraint",
    difficulty: 2,
  },

  {
    id: "L13-P3",
    title: "Type-safe Property Access with keyof",
    description: "Arrange the lines into a getProperty function with keyof constraint.",
    correctOrder: [
      "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {",
      "  return obj[key];",
      "}",
      "",
      "const user = { name: 'Max', age: 30, active: true };",
      "const name = getProperty(user, 'name');",
      "const age = getProperty(user, 'age');",
    ],
    distractors: [
      "function getProperty<T>(obj: T, key: string): unknown {",
      "function getProperty<T, K>(obj: T, key: K): T[K] {",
    ],
    hint: "K extends keyof T enforces valid keys. Without extends keyof T, K would be an arbitrary type.",
    concept: "keyof-constraint-pattern",
    difficulty: 3,
  },

  {
    id: "L13-P4",
    title: "Generic groupBy with Constraint",
    description: "Arrange the lines into a generic groupBy function.",
    correctOrder: [
      "function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {",
      "  const result: Record<string, T[]> = {};",
      "  for (const item of items) {",
      "    const key = keyFn(item);",
      "    if (!result[key]) result[key] = [];",
      "    result[key].push(item);",
      "  }",
      "  return result;",
      "}",
    ],
    distractors: [
      "function groupBy(items: any[], keyFn: (item: any) => string): Record<string, any[]> {",
      "  const result: Record<string, unknown[]> = {};",
    ],
    hint: "The generic version preserves the type T throughout the entire function. The any version loses the type.",
    concept: "generic-utility-function",
    difficulty: 3,
  },
];