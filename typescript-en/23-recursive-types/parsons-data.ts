/**
 * Lesson 23 — Parson's Problems: Recursive Types
 *
 * 4 problems for ordering lines of code.
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: LinkedList traversal ─────────────────────────────────────
  {
    id: "L23-P1",
    title: "Convert LinkedList to Array",
    description:
      "Arrange the lines to create a function that collects all " +
      "values of a LinkedList into an array.",
    correctOrder: [
      "type LinkedList<T> = { value: T; next: LinkedList<T> | null };",
      "function toArray<T>(list: LinkedList<T>): T[] {",
      "  const result: T[] = [];",
      "  let current: LinkedList<T> | null = list;",
      "  while (current !== null) {",
      "    result.push(current.value);",
      "    current = current.next;",
      "  }",
      "  return result;",
      "}",
    ],
    distractors: [
      "  let current: LinkedList<T> = list.next;",
      "  while (current !== undefined) {",
    ],
    hint:
      "Traversal starts at the passed node (not at next). " +
      "The loop runs as long as current is not null.",
    concept: "linked-list-traversal",
    difficulty: 2,
  },

  // ─── Problem 2: DeepPartial ──────────────────────────────────────────────
  {
    id: "L23-P2",
    title: "DeepPartial with Array Handling",
    description:
      "Arrange the lines to create a DeepPartial type that " +
      "handles arrays correctly.",
    correctOrder: [
      "type DeepPartial<T> = {",
      "  [K in keyof T]?: T[K] extends (infer U)[]",
      "    ? DeepPartial<U>[]",
      "    : T[K] extends object",
      "      ? DeepPartial<T[K]>",
      "      : T[K];",
      "};",
    ],
    distractors: [
      "  [K in keyof T]?: T[K] extends object",
      "    ? DeepPartial<T[K]>[]",
    ],
    hint:
      "Arrays must be detected BEFORE the object check, " +
      "because arrays are also objects. The order of the " +
      "extends checks is crucial.",
    concept: "deep-partial-with-arrays",
    difficulty: 3,
  },

  // ─── Problem 3: Flatten Type ─────────────────────────────────────────────
  {
    id: "L23-P3",
    title: "Flatten Type with Depth Limit",
    description:
      "Arrange the lines to create a Flatten type with controllable " +
      "depth.",
    correctOrder: [
      "type MinusOne<N extends number> = [never, 0, 1, 2, 3, 4, 5][N];",
      "type FlatN<T, Depth extends number> =",
      "  Depth extends 0",
      "    ? T",
      "    : T extends readonly (infer Inner)[]",
      "      ? FlatN<Inner, MinusOne<Depth>>",
      "      : T;",
    ],
    distractors: [
      "    : T extends (infer Inner)",
      "      ? FlatN<Inner[], MinusOne<Depth>>",
    ],
    hint:
      "First the termination condition (Depth === 0), then the array check " +
      "with infer, then the recursion with reduced depth.",
    concept: "flatten-with-depth",
    difficulty: 3,
  },

  // ─── Problem 4: Type-safe deep-get ───────────────────────────────────────
  {
    id: "L23-P4",
    title: "Type-safe deep-get with Paths",
    description:
      "Arrange the lines to create a type-safe get function that " +
      "accesses nested object properties.",
    correctOrder: [
      "type Paths<T> = T extends object",
      "  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]",
      "  : never;",
      "type PathValue<T, P extends string> =",
      "  P extends `${infer H}.${infer R}` ? (H extends keyof T ? PathValue<T[H], R> : never)",
      "  : P extends keyof T ? T[P] : never;",
      "function get<T extends object, P extends Paths<T> & string>(obj: T, path: P): PathValue<T, P> {",
      "  return path.split('.').reduce((acc, key) => (acc as any)[key], obj as any) as PathValue<T, P>;",
      "}",
    ],
    distractors: [
      "  ? { [K in keyof T]: K | `${K}.${Paths<T[K]>}` }[keyof T]",
      "function get<T, P extends string>(obj: T, path: P): unknown {",
    ],
    hint:
      "First define Paths, then PathValue, then the get function. " +
      "Note: keyof T & string filters only string keys. " +
      "The get function constrains P to Paths<T> & string.",
    concept: "type-safe-deep-get",
    difficulty: 4,
  },
];