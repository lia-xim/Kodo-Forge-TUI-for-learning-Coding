/**
 * Lesson 13 — Tracing Exercises: Generics Basics
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  {
    id: "13-inference-flow",
    title: "Type Inference with Generic Functions",
    description: "Trace how TypeScript infers type parameters from the arguments.",
    code: [
      "function wrap<T>(value: T): { wrapped: T } {",
      "  return { wrapped: value };",
      "}",
      "",
      "const a = wrap('hello');",
      "const b = wrap(42);",
      "const c = wrap({ name: 'Max', age: 30 });",
      "const d = wrap<boolean>(true);",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "What is T and what type does a have?",
        expectedAnswer: "T = string, a: { wrapped: string }",
        variables: { "T": "string", "a": "{ wrapped: 'hello' } (type: { wrapped: string })" },
        explanation: "TypeScript infers T = string from the argument 'hello'.",
      },
      {
        lineIndex: 5,
        question: "What is T and what type does b have?",
        expectedAnswer: "T = number, b: { wrapped: number }",
        variables: { "T": "number", "b": "{ wrapped: 42 } (type: { wrapped: number })" },
        explanation: "TypeScript infers T = number from the argument 42.",
      },
      {
        lineIndex: 6,
        question: "What is T and what type does c have?",
        expectedAnswer: "T = { name: string; age: number }, c: { wrapped: { name: string; age: number } }",
        variables: { "T": "{ name: string; age: number }" },
        explanation: "TypeScript also infers complex object types from the arguments.",
      },
      {
        lineIndex: 7,
        question: "What is T when specified explicitly? What type does d have?",
        expectedAnswer: "T = boolean (explicit), d: { wrapped: boolean }",
        variables: { "T": "boolean (explicitly specified)", "d": "{ wrapped: true } (type: { wrapped: boolean })" },
        explanation: "With an explicit <boolean>, T is not inferred but set directly.",
      },
    ],
    concept: "generic-type-inference",
    difficulty: 1,
  },

  {
    id: "13-constraint-narrowing",
    title: "Constraints and the Inferred Type",
    description: "Trace how constraints do NOT narrow the inferred type — T retains all properties.",
    code: [
      "interface HasId { id: number; }",
      "",
      "function process<T extends HasId>(entity: T): T {",
      "  console.log(`Processing ${entity.id}`);",
      "  return entity;",
      "}",
      "",
      "const user = { id: 1, name: 'Max', email: 'max@test.de' };",
      "const result = process(user);",
      "console.log(result.name);",
      "console.log(result.email);",
    ],
    steps: [
      {
        lineIndex: 8,
        question: "What is T after process(user)? HasId or the full type?",
        expectedAnswer: "T = { id: number; name: string; email: string } — the FULL type, not HasId",
        variables: { "T": "{ id: number; name: string; email: string }" },
        explanation: "The constraint is the minimum requirement. T retains the FULL type of the argument.",
      },
      {
        lineIndex: 9,
        question: "Does result.name work? What type does it have?",
        expectedAnswer: "Yes — result has the full type. result.name is string.",
        variables: { "result.name": "'Max' (type: string)" },
        explanation: "T retains all properties — not just those of the constraint.",
      },
      {
        lineIndex: 10,
        question: "Does result.email work?",
        expectedAnswer: "Yes — result.email is string. T is the full type.",
        variables: { "result.email": "'max@test.de' (type: string)" },
        explanation: "The constraint guarantees id, but T has everything the caller passes in.",
      },
    ],
    concept: "constraint-preserves-full-type",
    difficulty: 2,
  },

  {
    id: "13-keyof-indexed-access",
    title: "keyof and Indexed Access Types",
    description: "Trace how K extends keyof T returns the precise property type.",
    code: [
      "function get<T, K extends keyof T>(obj: T, key: K): T[K] {",
      "  return obj[key];",
      "}",
      "",
      "const config = { host: 'localhost', port: 3000, debug: true };",
      "const host = get(config, 'host');",
      "const port = get(config, 'port');",
      "const debug = get(config, 'debug');",
    ],
    steps: [
      {
        lineIndex: 5,
        question: "What is K and what type does host have?",
        expectedAnswer: "K = 'host', T[K] = T['host'] = string",
        variables: { "K": "'host'", "T[K]": "string", "host": "'localhost' (type: string)" },
        explanation: "K is inferred as the literal 'host'. T['host'] is string.",
      },
      {
        lineIndex: 6,
        question: "What is K and what type does port have?",
        expectedAnswer: "K = 'port', T[K] = T['port'] = number",
        variables: { "K": "'port'", "T[K]": "number", "port": "3000 (type: number)" },
        explanation: "K = 'port', T['port'] = number. Each key has its precise type.",
      },
      {
        lineIndex: 7,
        question: "What is K and what type does debug have?",
        expectedAnswer: "K = 'debug', T[K] = T['debug'] = boolean",
        variables: { "K": "'debug'", "T[K]": "boolean", "debug": "true (type: boolean)" },
        explanation: "Indexed Access T[K] returns the PRECISE type for each key — not the union of all types.",
      },
    ],
    concept: "keyof-indexed-access-precision",
    difficulty: 3,
  },

  {
    id: "13-multiple-type-params",
    title: "Multiple Type Parameters — map Function",
    description: "Trace how T and U are inferred in a map function.",
    code: [
      "function myMap<T, U>(arr: T[], fn: (item: T) => U): U[] {",
      "  return arr.map(fn);",
      "}",
      "",
      "const nums = [1, 2, 3];",
      "const strings = myMap(nums, n => String(n));",
      "const objects = myMap(nums, n => ({ value: n, doubled: n * 2 }));",
    ],
    steps: [
      {
        lineIndex: 5,
        question: "What are T and U? What type does strings have?",
        expectedAnswer: "T = number (from nums), U = string (from String(n)). strings: string[]",
        variables: { "T": "number", "U": "string", "strings": "['1', '2', '3'] (type: string[])" },
        explanation: "T is inferred from the array, U from the return type of the callback function.",
      },
      {
        lineIndex: 6,
        question: "What are T and U in the second call?",
        expectedAnswer: "T = number, U = { value: number; doubled: number }. objects: { value: number; doubled: number }[]",
        variables: { "T": "number", "U": "{ value: number; doubled: number }" },
        explanation: "TypeScript infers the complex object type from the callback's return type.",
      },
    ],
    concept: "multiple-type-param-inference",
    difficulty: 2,
  },
];