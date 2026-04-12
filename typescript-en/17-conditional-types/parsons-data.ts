/**
 * Lesson 17 — Parson's Problems: Conditional Types
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  { id: "L17-P1", title: "UnpackPromise with infer", description: "Arrange the lines into a type that extracts the inner type of a Promise.", correctOrder: ["type UnpackPromise<T> =", "  T extends Promise<infer U>", "    ? U", "    : T;"], distractors: ["  T extends Promise<T>", "    ? T"], hint: "infer U declares the variable. On match, U is returned, otherwise T.", concept: "infer-promise", difficulty: 2 },
  { id: "L17-P2", title: "Recursive Flatten", description: "Arrange the lines into a recursive array flatten type.", correctOrder: ["type Flatten<T> =", "  T extends (infer U)[]", "    ? Flatten<U>", "    : T;"], distractors: ["    ? U", "  T extends infer U[]"], hint: "Recursion: Flatten<U> calls itself. (infer U)[] — parentheses around infer U!", concept: "recursive-flatten", difficulty: 3 },
  { id: "L17-P3", title: "Rebuilding Extract", description: "Arrange the lines into the distributive Extract type.", correctOrder: ["type MyExtract<T, U> =", "  T extends U", "    ? T", "    : never;", "", "type Result = MyExtract<'a' | 'b' | 'c', 'a' | 'c'>;", "// 'a' | 'c'"], distractors: ["    ? U", "    ? never"], hint: "Extract KEEPS members that match U (returns T), removes others (never).", concept: "distributive-extract", difficulty: 2 },
];