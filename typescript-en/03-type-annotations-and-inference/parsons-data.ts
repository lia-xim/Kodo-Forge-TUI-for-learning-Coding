/**
 * Lesson 03 — Parson's Problems: Type Annotations & Inference
 *
 * 4 problems for ordering lines of code.
 * Concepts: Generic with Constraint, satisfies + as const, Contextual Typing
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Generic with Constraint ──────────────────────────────────
  {
    id: "L03-P1",
    title: "Generic Function with extends Constraint",
    description:
      "Arrange the lines to form a generic function that only accepts " +
      "objects with an 'id' property and returns the ID.",
    correctOrder: [
      "function getId<T extends { id: number }>(item: T): number {",
      "  return item.id;",
      "}",
      "",
      "const user = { id: 1, name: 'Alice' };",
      "const result = getId(user); // number",
    ],
    distractors: [
      "function getId<T>(item: T): number {",
      "function getId(item: { id: number }): number {",
    ],
    hint:
      "T extends { id: number } is a generic constraint — it ensures that " +
      "T has at least an 'id' property, but preserves the full type of T.",
    concept: "generic-constraint",
    difficulty: 3,
  },

  // ─── Problem 2: satisfies + as const ────────────────────────────────────
  {
    id: "L03-P2",
    title: "satisfies with as const for Type-Safe Configuration",
    description:
      "Arrange the lines to form a configuration that is both type-checked " +
      "(satisfies) and retains literal types (as const).",
    correctOrder: [
      "type Route = {",
      "  path: string;",
      "  method: 'GET' | 'POST';",
      "};",
      "",
      "const routes = {",
      "  home: { path: '/', method: 'GET' },",
      "  login: { path: '/login', method: 'POST' },",
      "} as const satisfies Record<string, Route>;",
    ],
    distractors: [
      "} satisfies Record<string, Route> as const;",
      "} as Record<string, Route>;",
    ],
    hint:
      "'as const' must come BEFORE 'satisfies'. The order is: " +
      "value as const satisfies Type. 'as Record' would lose the literal type.",
    concept: "satisfies-as-const",
    difficulty: 3,
  },

  // ─── Problem 3: Contextual Typing in Callbacks ─────────────────────────
  {
    id: "L03-P3",
    title: "Contextual Typing in Array Methods",
    description:
      "Arrange the lines to make use of contextual typing — " +
      "TypeScript automatically infers the parameter types in the callback.",
    correctOrder: [
      "const names: string[] = ['Alice', 'Bob', 'Charlie'];",
      "",
      "const lengths = names.map(name => {",
      "  return name.length;",
      "});",
      "",
      "const upper = names.filter(n => n.startsWith('A'));",
    ],
    distractors: [
      "const lengths = names.map((name: any) => {",
    ],
    hint:
      "With contextual typing, TypeScript infers the type of 'name' from the " +
      "array type (string[]). Explicit type annotations like ': any' are " +
      "unnecessary and counterproductive.",
    concept: "contextual-typing",
    difficulty: 2,
  },

  // ─── Problem 4: Generic Identity with Explicit Type ─────────────────────
  {
    id: "L03-P4",
    title: "Generic Function with Type Argument and Inference",
    description:
      "Arrange the lines to define a generic function and call it " +
      "both with an explicit type argument and with inference.",
    correctOrder: [
      "function wrap<T>(value: T): { wrapped: T } {",
      "  return { wrapped: value };",
      "}",
      "",
      "const a = wrap<string>('hello');  // explicit",
      "const b = wrap(42);               // Inference: T = number",
    ],
    distractors: [
      "function wrap<T>(value: any): { wrapped: T } {",
      "const a = wrap('hello' as string);",
    ],
    hint:
      "With generics, T is inferred from the argument type (inference). " +
      "You CAN specify the type explicitly (wrap<string>), but don't have to. " +
      "'value: any' would break the connection between the parameter and return type.",
    concept: "generic-inference",
    difficulty: 3,
  },
];