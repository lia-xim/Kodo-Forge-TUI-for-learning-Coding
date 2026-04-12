/**
 * Lesson 01 — Tracing Exercises: Setup & First Steps
 *
 * Topics:
 *  - Type Assertions and runtime behavior
 *  - Enum values at runtime
 *  - Type Erasure: What remains after compilation?
 *
 * Difficulty increasing: 1 → 3
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: Type Erasure — What remains after compilation? ──────────
  {
    id: "01-type-erasure-basics",
    title: "Type Erasure — What remains?",
    description:
      "Trace what the TypeScript compiler removes and what remains as " +
      "JavaScript code.",
    code: [
      "interface User {",
      "  name: string;",
      "  age: number;",
      "}",
      "",
      "const user: User = { name: 'Max', age: 25 };",
      "console.log(typeof user);",
      "console.log(user.name);",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "The 'User' interface is defined. Does it still exist after " +
          "compilation to JavaScript?",
        expectedAnswer: "No",
        variables: {},
        explanation:
          "Interfaces are purely compile-time constructs. They are completely " +
          "removed during type erasure. No interface exists in the JavaScript " +
          "output — only the object literal remains.",
      },
      {
        lineIndex: 5,
        question:
          "What type does the variable 'user' have in the JavaScript output? " +
          "Is the annotation ': User' preserved?",
        expectedAnswer: "No, the annotation is removed. user is a plain object.",
        variables: { "user": "{ name: 'Max', age: 25 }" },
        explanation:
          "The type annotation ': User' is removed during compilation. " +
          "The JavaScript only contains: const user = { name: 'Max', age: 25 }; " +
          "The value itself remains identical.",
      },
      {
        lineIndex: 6,
        question: "What does 'typeof user' output at runtime?",
        expectedAnswer: "object",
        variables: { "user": "{ name: 'Max', age: 25 }", "typeof user": "object" },
        explanation:
          "JavaScript's typeof operator does not know TypeScript types. " +
          "It returns 'object', not 'User'. The interface does not exist at runtime.",
      },
      {
        lineIndex: 7,
        question: "What does console.log(user.name) output?",
        expectedAnswer: "Max",
        variables: { "user": "{ name: 'Max', age: 25 }" },
        explanation:
          "Property access works normally — the object itself was not changed, " +
          "only the type information was removed.",
      },
    ],
    concept: "type-erasure",
    difficulty: 1,
  },

  // ─── Exercise 2: Enum Values at Runtime ───────────────────────────────────
  {
    id: "01-enum-runtime-values",
    title: "Enum Values — What exists at runtime?",
    description:
      "Trace what values an enum has at runtime and how numeric and " +
      "string enums differ.",
    code: [
      "enum Direction {",
      "  Up,",
      "  Down,",
      "  Left,",
      "  Right,",
      "}",
      "",
      "console.log(Direction.Up);",
      "console.log(Direction[0]);",
      "console.log(typeof Direction);",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "A numeric enum is defined. Unlike interfaces — does it exist after compilation?",
        expectedAnswer: "Yes",
        variables: {},
        explanation:
          "Enums are one of the few TypeScript constructs that exist at runtime. " +
          "The compiler generates a JavaScript object with the enum values. " +
          "Only 'const enum' is completely removed.",
      },
      {
        lineIndex: 7,
        question: "What does Direction.Up output? What value does it have?",
        expectedAnswer: "0",
        variables: { "Direction.Up": "0", "Direction.Down": "1", "Direction.Left": "2", "Direction.Right": "3" },
        explanation:
          "Numeric enums start at 0 (when no initial value is specified). " +
          "Up = 0, Down = 1, Left = 2, Right = 3. " +
          "These values exist as real JavaScript values.",
      },
      {
        lineIndex: 8,
        question:
          "What does Direction[0] output? (Reverse Mapping)",
        expectedAnswer: "Up",
        variables: { "Direction[0]": "Up" },
        explanation:
          "Numeric enums have a 'Reverse Mapping': you can use both " +
          "Direction.Up (= 0) and Direction[0] (= 'Up'). " +
          "String enums do NOT have this feature.",
      },
      {
        lineIndex: 9,
        question: "What does typeof Direction return?",
        expectedAnswer: "object",
        variables: { "typeof Direction": "object" },
        explanation:
          "At runtime, an enum is a normal JavaScript object. " +
          "typeof therefore returns 'object'. It is not a special " +
          "enum type — just an object with key-value pairs.",
      },
    ],
    concept: "enums",
    difficulty: 2,
  },

  // ─── Exercise 3: Type Assertions vs. Runtime ──────────────────────────────
  {
    id: "01-type-assertions-runtime",
    title: "Type Assertions — Compile Time vs. Runtime",
    description:
      "Trace what 'as' does at compile time and at runtime " +
      "and where the dangers lie.",
    code: [
      "const input: unknown = 42;",
      "const text = input as string;",
      "console.log(typeof text);",
      "console.log(text);",
      "// console.log(text.toUpperCase());",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "What TypeScript type does 'input' have?",
        expectedAnswer: "unknown",
        variables: { "input": "42 (type: unknown)" },
        explanation:
          "The variable is explicitly typed as 'unknown'. " +
          "The actual value is the number 42, but TypeScript " +
          "treats it as 'unknown'.",
      },
      {
        lineIndex: 1,
        question:
          "What TypeScript type does 'text' have after 'as string'? " +
          "And what runtime value?",
        expectedAnswer: "TypeScript type: string. Runtime value: 42 (number)",
        variables: { "input": "42", "text": "42 (TS thinks: string, actually: number)" },
        explanation:
          "'as string' is a type assertion — it only convinces the " +
          "compiler, NOT the runtime. The value remains 42 (a number). " +
          "TypeScript trusts you here, but does not verify.",
      },
      {
        lineIndex: 2,
        question: "What does typeof text output at runtime?",
        expectedAnswer: "number",
        variables: { "text": "42", "typeof text": "number" },
        explanation:
          "Here the contradiction becomes visible: TypeScript thinks text is " +
          "a 'string', but typeof returns 'number'. Type assertions do not " +
          "change the value — they only lie to the compiler.",
      },
      {
        lineIndex: 4,
        question:
          "What would happen if line 5 (text.toUpperCase()) is executed?",
        expectedAnswer: "Runtime Error: text.toUpperCase is not a function",
        variables: { "text": "42 (number)" },
        explanation:
          "Since text is actually a number, it has no toUpperCase() method. " +
          "TypeScript reports no error (it thinks text is a string), " +
          "but it crashes at runtime. This is why type assertions are dangerous.",
      },
    ],
    concept: "type-assertions",
    difficulty: 3,
  },

  // ─── Exercise 4: const enum vs. regular enum ──────────────────────────────
  {
    id: "01-const-enum-erasure",
    title: "const enum — Completely removed",
    description:
      "Compare what remains after compilation for a regular enum " +
      "versus a const enum.",
    code: [
      "const enum Color {",
      "  Red = 'RED',",
      "  Green = 'GREEN',",
      "  Blue = 'BLUE',",
      "}",
      "",
      "const myColor = Color.Red;",
      "console.log(myColor);",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "A 'const enum' is defined. Does it exist after compilation as an object?",
        expectedAnswer: "No",
        variables: {},
        explanation:
          "Unlike regular enums, a 'const enum' is completely removed during " +
          "compilation. No JavaScript object is generated.",
      },
      {
        lineIndex: 6,
        question:
          "What does the compiled JavaScript line for " +
          "'const myColor = Color.Red' look like?",
        expectedAnswer: "const myColor = 'RED';",
        variables: { "myColor": "RED" },
        explanation:
          "The compiler replaces Color.Red directly with the value 'RED' " +
          "(inlining). The JavaScript only contains: const myColor = 'RED'; " +
          "No reference to Color, no enum object.",
      },
      {
        lineIndex: 7,
        question: "What does console.log(myColor) output?",
        expectedAnswer: "RED",
        variables: { "myColor": "RED" },
        explanation:
          "Since the value was inlined, it simply outputs 'RED'. " +
          "The result is identical to a regular enum — " +
          "but the generated code is smaller and faster.",
      },
    ],
    concept: "type-erasure",
    difficulty: 2,
  },
];