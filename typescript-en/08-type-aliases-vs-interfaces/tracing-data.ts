/**
 * Lesson 08 — Tracing Exercises: Type Aliases vs Interfaces
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  {
    id: "08-declaration-merging",
    title: "Declaration Merging — Interfaces Merging Together",
    description: "Trace how Declaration Merging combines two interface declarations.",
    code: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "}",
      "",
      "interface Config {",
      "  debug: boolean;",
      "  logLevel: 'info' | 'warn' | 'error';",
      "}",
      "",
      "const config: Config = {",
      "  host: 'localhost',",
      "  port: 3000,",
      "  debug: true,",
      "  logLevel: 'info',",
      "};",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "What properties does Config have after the first declaration?",
        expectedAnswer: "host: string, port: number",
        variables: { "Config": "{ host: string; port: number }" },
        explanation: "The first declaration defines host and port.",
      },
      {
        lineIndex: 5,
        question: "What properties does Config have after the second declaration?",
        expectedAnswer: "host, port, debug, logLevel — all four merged together",
        variables: { "Config": "{ host: string; port: number; debug: boolean; logLevel: 'info' | 'warn' | 'error' }" },
        explanation:
          "Declaration Merging adds the properties of the second declaration " +
          "to the first. Config now has all four properties.",
      },
      {
        lineIndex: 10,
        question: "Would it compile if 'debug: true' is missing?",
        expectedAnswer: "No — all properties from both declarations are required",
        variables: {},
        explanation:
          "After merging, Config has all four properties as required fields. " +
          "A missing field is a compile error.",
      },
    ],
    concept: "declaration-merging",
    difficulty: 2,
  },

  {
    id: "08-extends-vs-intersection",
    title: "extends vs & — Conflict Detection",
    description: "Compare how extends and & react to property conflicts.",
    code: [
      "// Variant 1: extends",
      "interface A { x: string; }",
      "// interface B extends A { x: number; }  // ERROR!",
      "",
      "// Variant 2: &",
      "type C = { x: string };",
      "type D = C & { x: number }; // No error at definition!",
      "",
      "// But when used:",
      "// const d: D = { x: 'hello' }; // ERROR: string is not never",
    ],
    steps: [
      {
        lineIndex: 2,
        question: "What happens with interface B extends A { x: number; }?",
        expectedAnswer: "Compile-Error: Types of property 'x' are incompatible",
        variables: {},
        explanation:
          "extends reports the conflict IMMEDIATELY as an error. " +
          "string and number are not compatible.",
      },
      {
        lineIndex: 6,
        question: "What is the type of D.x with type D = C & { x: number }?",
        expectedAnswer: "string & number = never",
        variables: { "D.x": "(Type: string & number = never)" },
        explanation:
          "& produces NO error at the definition! D.x becomes " +
          "string & number = never — a silent bug.",
      },
      {
        lineIndex: 9,
        question: "When does the error with & become visible?",
        expectedAnswer: "Only when used — when you try to assign a value",
        variables: {},
        explanation:
          "The error only shows up when you try to create a value " +
          "of type D. No value can satisfy x: never. " +
          "extends is safer here because it reports the error early.",
      },
    ],
    concept: "extends-vs-intersection-conflicts",
    difficulty: 3,
  },

  {
    id: "08-implements-check",
    title: "implements checks the shape",
    description: "Trace how implements works as a compile-time check.",
    code: [
      "interface Serializable {",
      "  serialize(): string;",
      "  deserialize(data: string): void;",
      "}",
      "",
      "class User implements Serializable {",
      "  name: string;",
      "  constructor(name: string) { this.name = name; }",
      "  serialize(): string { return JSON.stringify({ name: this.name }); }",
      "  deserialize(data: string): void { this.name = JSON.parse(data).name; }",
      "}",
    ],
    steps: [
      {
        lineIndex: 5,
        question: "What does 'implements Serializable' check?",
        expectedAnswer: "Whether User correctly implements serialize() and deserialize()",
        variables: {},
        explanation:
          "implements is a compile-time check: Does User have all methods " +
          "from Serializable with the correct signatures?",
      },
      {
        lineIndex: 8,
        question: "Does implements inherit the serialize method?",
        expectedAnswer: "No — the class must implement it itself",
        variables: {},
        explanation:
          "implements inherits NOTHING. The method must be written in the class " +
          "itself. implements only checks the shape.",
      },
      {
        lineIndex: 5,
        question: "What would happen if deserialize() were missing?",
        expectedAnswer: "Compile-Error: Class incorrectly implements interface",
        variables: {},
        explanation:
          "Without deserialize, User does not satisfy the Serializable shape. " +
          "TypeScript reports the error immediately.",
      },
    ],
    concept: "implements-compile-check",
    difficulty: 2,
  },

  {
    id: "08-type-alias-transparency",
    title: "Type Alias is transparent — no new type",
    description: "Trace how Type Aliases are structurally identical to their target type.",
    code: [
      "type UserID = string;",
      "type ProductID = string;",
      "",
      "function findUser(id: UserID): void {",
      "  console.log('Finding user:', id);",
      "}",
      "",
      "const productId: ProductID = 'prod-123';",
      "findUser(productId); // Does this work?",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Is UserID a standalone type?",
        expectedAnswer: "No — UserID is just an alias (nickname) for string",
        variables: { "UserID": "= string (Alias)" },
        explanation:
          "type UserID = string does not create a new type. " +
          "UserID IS string — just with a different name.",
      },
      {
        lineIndex: 8,
        question: "Can you pass ProductID to a function that expects UserID?",
        expectedAnswer: "Yes — both are string, TypeScript sees no difference",
        variables: {},
        explanation:
          "TypeScript is structurally typed. UserID and ProductID " +
          "are both string — completely interchangeable. " +
          "For real distinction, you need Branded Types.",
      },
    ],
    concept: "type-alias-structural",
    difficulty: 1,
  },
];