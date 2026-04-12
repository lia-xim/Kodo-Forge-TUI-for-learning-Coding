/**
 * Lesson 23 — Tracing Exercises: Recursive Types
 *
 * Topics:
 *  - LinkedList traversal
 *  - DeepPartial type resolution
 *  - Paths computation
 *  - Flatten recursion
 *
 * Difficulty increasing: 2 → 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: LinkedList Traversal ────────────────────────────────────
  {
    id: "23-linked-list-traverse",
    title: "Traverse LinkedList and collect values",
    description:
      "Trace how the toArray function traverses a linked list " +
      "and collects the values into an array.",
    code: [
      "type LinkedList<T> = { value: T; next: LinkedList<T> | null };",
      "",
      "const list: LinkedList<string> = {",
      "  value: 'a',",
      "  next: { value: 'b', next: { value: 'c', next: null } },",
      "};",
      "",
      "const result: string[] = [];",
      "let current: LinkedList<string> | null = list;",
      "while (current !== null) {",
      "  result.push(current.value);",
      "  current = current.next;",
      "}",
      "console.log(result);",
    ],
    steps: [
      {
        lineIndex: 8,
        question: "What is current.value after the first assignment?",
        expectedAnswer: "a",
        variables: { "current.value": "'a'", "result": "[]" },
        explanation:
          "current points to the first node in the list with value 'a'.",
      },
      {
        lineIndex: 10,
        question: "What does result contain after the first push?",
        expectedAnswer: "['a']",
        variables: { "current.value": "'a'", "result": "['a']" },
        explanation:
          "current.value ('a') is added to the array.",
      },
      {
        lineIndex: 11,
        question: "What is current.value after current = current.next?",
        expectedAnswer: "b",
        variables: { "current.value": "'b'", "result": "['a']" },
        explanation:
          "current now points to the second node with value 'b'.",
      },
      {
        lineIndex: 10,
        question: "What does result contain after the second push?",
        expectedAnswer: "['a', 'b']",
        variables: { "current.value": "'b'", "result": "['a', 'b']" },
        explanation:
          "current.value ('b') is appended. After the next next-step " +
          "and push, result will be ['a', 'b', 'c'], then current.next is null.",
      },
      {
        lineIndex: 13,
        question: "What does console.log(result) output?",
        expectedAnswer: "['a', 'b', 'c']",
        variables: { "current": "null", "result": "['a', 'b', 'c']" },
        explanation:
          "The loop has traversed all three nodes. " +
          "current is null → loop ends. result contains all values.",
      },
    ],
    concept: "recursive-data-traversal",
    difficulty: 2,
  },

  // ─── Exercise 2: DeepPartial Type Resolution ─────────────────────────────
  {
    id: "23-deep-partial-resolution",
    title: "Trace DeepPartial type resolution",
    description:
      "Trace how TypeScript resolves DeepPartial<T> step by step " +
      "for a nested object.",
    code: [
      "type DeepPartial<T> = {",
      "  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];",
      "};",
      "",
      "type Config = {",
      "  server: { host: string; port: number };",
      "  debug: boolean;",
      "};",
      "",
      "type Result = DeepPartial<Config>;",
      "// Step 1: K = 'server' → Config['server'] extends object → true",
      "// Step 2: Recursion on { host: string; port: number }",
      "// Step 3: K = 'debug' → boolean extends object → false",
    ],
    steps: [
      {
        lineIndex: 9,
        question: "What is the result for K='server'? (extends object = ?)",
        expectedAnswer: "true, so DeepPartial<{ host: string; port: number }>",
        variables: { "K": "'server'", "T[K]": "{ host: string; port: number }" },
        explanation:
          "{ host: string; port: number } extends object is true. " +
          "So DeepPartial is applied recursively to it.",
      },
      {
        lineIndex: 11,
        question: "What does DeepPartial<{ host: string; port: number }> produce?",
        expectedAnswer: "{ host?: string; port?: number }",
        variables: { "K": "'host' | 'port'", "extends object": "false for string and number" },
        explanation:
          "string extends object = false, number extends object = false. " +
          "So host and port are taken directly, just with ? (optional).",
      },
      {
        lineIndex: 12,
        question: "What is the result for K='debug'? (boolean extends object = ?)",
        expectedAnswer: "false, so boolean stays directly (with ?)",
        variables: { "K": "'debug'", "T[K]": "boolean" },
        explanation:
          "boolean extends object is false. So it becomes debug?: boolean.",
      },
      {
        lineIndex: 9,
        question: "What is the complete result type of DeepPartial<Config>?",
        expectedAnswer: "{ server?: { host?: string; port?: number }; debug?: boolean }",
        variables: {
          "Result": "{ server?: { host?: string; port?: number }; debug?: boolean }",
        },
        explanation:
          "All properties at all levels are now optional (?).",
      },
    ],
    concept: "deep-partial-resolution",
    difficulty: 3,
  },

  // ─── Exercise 3: Paths Computation ───────────────────────────────────────
  {
    id: "23-paths-computation",
    title: "Compute Paths<T> step by step",
    description:
      "Trace how Paths<T> computes the union of all dot-separated paths " +
      "of a nested object.",
    code: [
      "type Paths<T> = T extends object",
      "  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]",
      "  : never;",
      "",
      "type Data = {",
      "  a: { b: string };",
      "  c: number;",
      "};",
      "",
      "type Result = Paths<Data>;",
    ],
    steps: [
      {
        lineIndex: 9,
        question: "What does Paths compute for K='a'? (a: { b: string })",
        expectedAnswer: "'a' | `a.${Paths<{ b: string }>}`",
        variables: { "K": "'a'", "T[K]": "{ b: string }" },
        explanation:
          "For K='a': The path 'a' itself, plus all sub-paths " +
          "with 'a.' prefix.",
      },
      {
        lineIndex: 9,
        question: "What does Paths<{ b: string }> produce (the recursion for a)?",
        expectedAnswer: "'b'",
        variables: { "K": "'b'", "T[K]": "string" },
        explanation:
          "K='b', Paths<string> = never (not an object). " +
          "So: 'b' | `b.${never}` = 'b' | never = 'b'.",
      },
      {
        lineIndex: 9,
        question: "What does Paths compute for K='c'? (c: number)",
        expectedAnswer: "'c'",
        variables: { "K": "'c'", "T[K]": "number" },
        explanation:
          "Paths<number> = never (not an object). " +
          "So: 'c' | `c.${never}` = 'c' | never = 'c'.",
      },
      {
        lineIndex: 9,
        question: "What is the complete result type of Paths<Data>?",
        expectedAnswer: "'a' | 'a.b' | 'c'",
        variables: { "Result": "'a' | 'a.b' | 'c'" },
        explanation:
          "All paths combined: 'a' (object), 'a.b' (nested " +
          "string), 'c' (primitive value at top level).",
      },
    ],
    concept: "paths-computation",
    difficulty: 4,
  },

  // ─── Exercise 4: Flatten Recursion ───────────────────────────────────────
  {
    id: "23-flatten-recursion",
    title: "Trace Flatten<T> recursion steps",
    description:
      "Trace how the Flatten type resolves nested array types " +
      "step by step.",
    code: [
      "type Flatten<T> = T extends (infer U)[]",
      "  ? Flatten<U>",
      "  : T;",
      "",
      "type A = Flatten<number[][][]>;",
      "type B = Flatten<string>;",
      "type C = Flatten<(boolean | number[])[]>;",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "Step 1: Flatten<number[][][]> — is it an array?",
        expectedAnswer: "Yes, U = number[][], continue with Flatten<number[][]>",
        variables: { "T": "number[][][]", "U": "number[][]" },
        explanation:
          "number[][][] extends (infer U)[] is true, U = number[][].",
      },
      {
        lineIndex: 4,
        question: "Step 2: Flatten<number[][]> — is it an array?",
        expectedAnswer: "Yes, U = number[], continue with Flatten<number[]>",
        variables: { "T": "number[][]", "U": "number[]" },
        explanation:
          "number[][] extends (infer U)[] is true, U = number[].",
      },
      {
        lineIndex: 4,
        question: "Step 3: Flatten<number[]> — is it an array?",
        expectedAnswer: "Yes, U = number, continue with Flatten<number>",
        variables: { "T": "number[]", "U": "number" },
        explanation:
          "number[] extends (infer U)[] is true, U = number.",
      },
      {
        lineIndex: 4,
        question: "Step 4: Flatten<number> — is it an array?",
        expectedAnswer: "No! Base case reached. Result: number",
        variables: { "T": "number", "Result": "number" },
        explanation:
          "number extends (infer U)[] is false. Base case reached. " +
          "Flatten<number[][][]> = number.",
      },
    ],
    concept: "flatten-recursion",
    difficulty: 3,
  },
];