/**
 * Lesson 15 — Parson's Problems: Utility Types
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L15-P1",
    title: "Implementing StrictOmit",
    description: "Arrange the lines into a type-safe StrictOmit that only accepts existing keys.",
    correctOrder: [
      "type StrictOmit<T, K extends keyof T> = Omit<T, K>;",
      "",
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  password: string;",
      "}",
      "",
      "type SafeUser = StrictOmit<User, 'password'>;",
      "// { id: number; name: string }",
    ],
    distractors: [
      "type StrictOmit<T, K extends string> = Omit<T, K>;",
      "type SafeUser = Omit<User, 'pasword'>;",
    ],
    hint: "K must extend keyof T (not string) so that only existing keys are accepted. StrictOmit then catches typos.",
    concept: "strict-omit",
    difficulty: 2,
  },

  {
    id: "L15-P2",
    title: "Implementing DeepPartial",
    description: "Arrange the lines into a recursive DeepPartial type.",
    correctOrder: [
      "type DeepPartial<T> = T extends (infer U)[]",
      "  ? DeepPartial<U>[]",
      "  : T extends object",
      "    ? { [P in keyof T]?: DeepPartial<T[P]> }",
      "    : T;",
    ],
    distractors: [
      "  ? Partial<U>[]",
      "    ? { [P in keyof T]: DeepPartial<T[P]> }",
    ],
    hint: "Arrays must be handled separately (infer U). Objects need ? for optional AND recursion. Primitives remain unchanged.",
    concept: "deep-partial",
    difficulty: 4,
  },

  {
    id: "L15-P3",
    title: "Building the PartialExcept Pattern",
    description: "Arrange the lines into the PartialExcept pattern: K stays required, the rest becomes optional.",
    correctOrder: [
      "type PartialExcept<T, K extends keyof T> =",
      "  Pick<T, K> & Partial<Omit<T, K>>;",
      "",
      "interface Task {",
      "  id: number;",
      "  title: string;",
      "  done: boolean;",
      "}",
      "",
      "type TaskUpdate = PartialExcept<Task, 'id'>;",
      "// { id: number } & { title?: string; done?: boolean }",
    ],
    distractors: [
      "  Omit<T, K> & Partial<Pick<T, K>>;",
      "type TaskUpdate = Partial<Task>;",
    ],
    hint: "Pick<T, K> keeps K as required. Partial<Omit<T, K>> makes the REST optional. The intersection (&) combines both.",
    concept: "partial-except-pattern",
    difficulty: 3,
  },

  {
    id: "L15-P4",
    title: "Awaited + ReturnType for async Function",
    description: "Arrange the lines to extract the 'true' return type of an async function.",
    correctOrder: [
      "async function fetchProducts() {",
      "  return [",
      "    { id: 1, name: 'Widget', price: 9.99 },",
      "    { id: 2, name: 'Gadget', price: 19.99 },",
      "  ];",
      "}",
      "",
      "type Products = Awaited<ReturnType<typeof fetchProducts>>;",
      "// { id: number; name: string; price: number }[]",
    ],
    distractors: [
      "type Products = ReturnType<typeof fetchProducts>;",
      "type Products = Awaited<typeof fetchProducts>;",
    ],
    hint: "ReturnType alone returns Promise<...>. typeof is needed because fetchProducts is a value. Awaited unwraps the Promise.",
    concept: "awaited-returntype",
    difficulty: 2,
  },
];