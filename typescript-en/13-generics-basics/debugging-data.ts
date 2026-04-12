/**
 * Lesson 13 — Debugging Challenges: Generics Basics
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L13-D1",
    title: "T has no properties without constraint",
    buggyCode: [
      "function getLength<T>(arg: T): number {",
      "  return arg.length;",
      "}",
      "",
      "console.log(getLength('hallo')); // Should be 5",
    ].join("\n"),
    errorMessage: "Property 'length' does not exist on type 'T'.",
    bugType: "type-error",
    bugLine: 2,
    options: [
      "T is unconstrained — TypeScript doesn't know if T has .length",
      "getLength cannot be called with strings",
      "length is not a valid property",
      "T must be replaced with string",
    ],
    correctOption: 0,
    hints: [
      "What does TypeScript know about T without a constraint?",
      "Without extends, T can be anything — even number (which has no .length).",
      "Solution: T extends { length: number } as a constraint.",
    ],
    fixedCode: [
      "function getLength<T extends { length: number }>(arg: T): number {",
      "  return arg.length; // OK — T is guaranteed to have .length",
      "}",
    ].join("\n"),
    explanation:
      "Without a constraint, TypeScript knows nothing about T. T could be number, " +
      "boolean, or any other type. With `T extends { length: number }` " +
      "you guarantee that T has at least .length.",
    concept: "constraint-missing",
    difficulty: 2,
  },

  {
    id: "L13-D2",
    title: "Type parameter cannot be inferred",
    buggyCode: [
      "function createArray<T>(): T[] {",
      "  return [];",
      "}",
      "",
      "const arr = createArray();",
      "arr.push('hallo');",
      "// arr is unknown[] — not string[]!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 5,
    options: [
      "T cannot be inferred from arguments — there are no arguments",
      "createArray is incorrectly implemented",
      "push doesn't work with generics",
      "Empty arrays always have the type unknown[]",
    ],
    correctOption: 0,
    hints: [
      "From what does TypeScript infer the type parameter T?",
      "T only appears in the return type — not in the parameters.",
      "Solution: Explicit type annotation: createArray<string>().",
    ],
    fixedCode: [
      "function createArray<T>(): T[] {",
      "  return [];",
      "}",
      "",
      "const arr = createArray<string>(); // Specify T explicitly!",
      "arr.push('hallo'); // OK — arr is string[]",
    ].join("\n"),
    explanation:
      "TypeScript infers type parameters from the ARGUMENTS. If T only " +
      "appears in the return type and the function has no arguments, " +
      "TypeScript cannot infer T. Then T must be specified explicitly.",
    concept: "inference-limitation",
    difficulty: 2,
  },

  {
    id: "L13-D3",
    title: "Invalid key despite keyof",
    buggyCode: [
      "function getProperty<T>(obj: T, key: string): unknown {",
      "  return obj[key];",
      "}",
      "",
      "const user = { name: 'Max', age: 30 };",
      "const email = getProperty(user, 'email');",
      "// No error — but 'email' doesn't exist!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 1,
    options: [
      "key is string instead of K extends keyof T — no key check",
      "obj[key] doesn't work with generics",
      "user has no email property",
      "getProperty needs a return type",
    ],
    correctOption: 0,
    hints: [
      "What is the type of key? Is it checked whether it's valid?",
      "key: string accepts ANY string — even invalid keys.",
      "Solution: Use a second type parameter K extends keyof T.",
    ],
    fixedCode: [
      "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {",
      "  return obj[key];",
      "}",
      "",
      "const user = { name: 'Max', age: 30 };",
      "// getProperty(user, 'email'); // Error! 'email' is not in keyof user",
      "const name = getProperty(user, 'name'); // string",
    ].join("\n"),
    explanation:
      "With key: string any arbitrary string can be passed — " +
      "even keys that don't exist. K extends keyof T forces only " +
      "valid keys to be accepted AND the return type " +
      "T[K] is precise instead of unknown.",
    concept: "keyof-constraint-missing",
    difficulty: 3,
  },

  {
    id: "L13-D4",
    title: "Default type violates constraint",
    buggyCode: [
      "interface Repository<T extends { id: number } = string> {",
      "  findById(id: number): T | null;",
      "  save(entity: T): void;",
      "}",
      "",
      "// Error in the interface definition!",
    ].join("\n"),
    errorMessage: "Type 'string' does not satisfy the constraint '{ id: number }'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "The default type string does not satisfy the constraint { id: number }",
      "Interfaces cannot have defaults",
      "Repository needs two type parameters",
      "findById must be generic",
    ],
    correctOption: 0,
    hints: [
      "What constraint does T have? Does string satisfy this constraint?",
      "T extends { id: number } — string has no .id!",
      "The default type must satisfy the constraint. Use e.g. { id: number; name: string }.",
    ],
    fixedCode: [
      "interface Repository<T extends { id: number } = { id: number; name: string }> {",
      "  findById(id: number): T | null;",
      "  save(entity: T): void;",
      "}",
    ].join("\n"),
    explanation:
      "The default type MUST satisfy the constraint. string has no " +
      "id property and therefore does not satisfy { id: number }. " +
      "The default must be a type that has at least { id: number }.",
    concept: "default-violates-constraint",
    difficulty: 3,
  },

  {
    id: "L13-D5",
    title: "Type parameter used only once — anti-pattern",
    buggyCode: [
      "function logValue<T>(value: T): void {",
      "  console.log(value);",
      "}",
      "",
      "function logArray<T>(arr: T[]): void {",
      "  arr.forEach(item => console.log(item));",
      "}",
      "",
      "// Works — but why is it an anti-pattern?",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 1,
    options: [
      "T is only used once — it establishes no type relationship",
      "logValue and logArray are incorrectly implemented",
      "void cannot be used with generics",
      "forEach doesn't work with generic arrays",
    ],
    correctOption: 0,
    hints: [
      "How many times does T appear in each function? Only in the parameter or also in the return type?",
      "T only appears in the parameter in each case. There is no return type that uses T.",
      "Replace T with unknown — the code works identically.",
    ],
    fixedCode: [
      "// Better: unknown instead of unnecessary type parameter",
      "function logValue(value: unknown): void {",
      "  console.log(value);",
      "}",
      "",
      "function logArray(arr: unknown[]): void {",
      "  arr.forEach(item => console.log(item));",
      "}",
    ].join("\n"),
    explanation:
      "A type parameter that only appears ONCE connects nothing. " +
      "It could be replaced by unknown without loss of information. " +
      "Generics should establish a RELATIONSHIP — e.g. input type = output type. " +
      "Use at least twice!",
    concept: "unnecessary-type-parameter",
    difficulty: 2,
  },
];