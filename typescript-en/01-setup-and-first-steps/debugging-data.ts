/**
 * Lesson 01 — Debugging Challenges: Setup & First Steps
 *
 * 4 challenges on type assertions, instanceof, tsconfig, strictNullChecks.
 * Focus: difference between compile time vs. runtime, type erasure.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: as string instead of Conversion ───────────────────────
  {
    id: "L01-D1",
    title: "Type Assertion Is Not a Runtime Cast",
    buggyCode: [
      "function toUpperCase(value: unknown): string {",
      "  const text = value as string;",
      "  return text.toUpperCase();",
      "}",
      "",
      "console.log(toUpperCase(42));",
    ].join("\n"),
    errorMessage: "TypeError: text.toUpperCase is not a function",
    bugType: "runtime-error",
    bugLine: 2,
    options: [
      "'as string' converts the value to a string at runtime",
      "'as string' is only a compile-time hint and changes nothing at runtime",
      "'as string' only works with objects, not with primitives",
      "The error is in toUpperCase(), not in the assertion",
    ],
    correctOption: 1,
    hints: [
      "Type assertions don't change the value — they only override the compiler.",
      "What happens to TypeScript types after compilation? (Type Erasure)",
      "At runtime, 'value as string' is identical to simply 'value'.",
    ],
    fixedCode: [
      "function toUpperCase(value: unknown): string {",
      "  if (typeof value === 'string') {",
      "    return value.toUpperCase();",
      "  }",
      "  return String(value).toUpperCase();",
      "}",
    ].join("\n"),
    explanation:
      "'as string' is a type assertion — it tells the compiler 'trust me, " +
      "this is a string', but changes NOTHING at runtime. After type erasure " +
      "the code is identical to: const text = value; If value is a number, " +
      "it has no .toUpperCase() method. Solution: typeof check or String() conversion.",
    concept: "type-assertion",
    difficulty: 1,
  },

  // ─── Challenge 2: instanceof with Interface ──────────────────────────────
  {
    id: "L01-D2",
    title: "instanceof Does Not Work with Interfaces",
    buggyCode: [
      "interface Animal {",
      "  name: string;",
      "  sound: string;",
      "}",
      "",
      "function isAnimal(value: unknown): boolean {",
      "  return value instanceof Animal;",
      "}",
    ].join("\n"),
    errorMessage: "'Animal' only refers to a type, but is being used as a value here.",
    bugType: "type-error",
    bugLine: 7,
    options: [
      "instanceof can only be used with classes, not with interfaces",
      "The parameter must be 'any' instead of 'unknown'",
      "You need to write 'typeof value === Animal'",
      "The interface needs an 'export' in front of it",
    ],
    correctOption: 0,
    hints: [
      "What happens to interfaces after TypeScript compilation?",
      "Interfaces don't exist at runtime — they are removed by type erasure.",
      "instanceof requires a constructor (class/function) as the right-hand operand.",
    ],
    fixedCode: [
      "interface Animal {",
      "  name: string;",
      "  sound: string;",
      "}",
      "",
      "function isAnimal(value: unknown): value is Animal {",
      "  return (",
      "    typeof value === 'object' &&",
      "    value !== null &&",
      "    'name' in value &&",
      "    'sound' in value",
      "  );",
      "}",
    ].join("\n"),
    explanation:
      "Interfaces exist ONLY at compile time. After type erasure there is no " +
      "'Animal' left in JavaScript. instanceof requires a class (a constructor) " +
      "that exists at runtime. For interfaces you must use property checks " +
      "('name' in value) and mark the function as a type predicate (value is Animal).",
    concept: "type-erasure",
    difficulty: 2,
  },

  // ─── Challenge 3: Wrong target in tsconfig ───────────────────────────────
  {
    id: "L01-D3",
    title: "Wrong target in tsconfig",
    buggyCode: [
      "// tsconfig.json:",
      '// { "compilerOptions": { "target": "ES5" } }',
      "",
      "const greet = (name: string) => `Hello ${name}!`;",
      "",
      "const nums = [1, 2, 3];",
      "const doubled = nums.map(n => n * 2);",
    ].join("\n"),
    errorMessage:
      "With target ES5: arrow functions and template literals are transpiled.",
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "ES5 doesn't support arrow functions, the code is rewritten to function() syntax",
      "ES5 cannot process strings",
      "map() doesn't exist in ES5, the code crashes",
      "Template literals work identically in ES5",
    ],
    correctOption: 0,
    hints: [
      "The 'target' in tsconfig determines which JavaScript version is compiled to.",
      "Arrow functions (=>) and template literals (`...`) only exist since ES2015/ES6.",
      "With ES5, tsc must replace these features with older syntax.",
    ],
    fixedCode: [
      "// tsconfig.json:",
      '// { "compilerOptions": { "target": "ES2022" } }',
      "",
      "const greet = (name: string) => `Hello ${name}!`;",
      "",
      "const nums = [1, 2, 3];",
      "const doubled = nums.map(n => n * 2);",
    ].join("\n"),
    explanation:
      "The 'target' in tsconfig.json determines the target JavaScript version. With ES5 " +
      "arrow functions become function() expressions and template literals become string " +
      "concatenation. This doesn't change the logic, but debugging becomes " +
      "harder and performance suffers. " +
      "Recommendation: At least ES2022 for modern Node.js projects.",
    concept: "tsconfig",
    difficulty: 1,
  },

  // ─── Challenge 4: Missing strictNullChecks ───────────────────────────────
  {
    id: "L01-D4",
    title: "Missing strictNullChecks",
    buggyCode: [
      "// tsconfig.json: { \"compilerOptions\": { \"strict\": false } }",
      "",
      "function getFirst(items: string[]): string {",
      "  return items[0];",
      "}",
      "",
      "const result = getFirst([]);",
      "console.log(result.toUpperCase());",
    ].join("\n"),
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
    bugType: "soundness-hole",
    bugLine: 1,
    options: [
      "items[0] on an empty array returns undefined, but the type says 'string'",
      "getFirst() always returns an empty string",
      "strict: false means TypeScript doesn't check at all",
      "The array must be declared with 'as const'",
    ],
    correctOption: 0,
    hints: [
      "What does items[0] return when items is an empty array?",
      "Without strictNullChecks, TypeScript does not treat undefined/null separately.",
      "The return type is 'string', but at runtime undefined is returned.",
    ],
    fixedCode: [
      "// tsconfig.json: { \"compilerOptions\": { \"strict\": true } }",
      "",
      "function getFirst(items: string[]): string | undefined {",
      "  return items[0];",
      "}",
      "",
      "const result = getFirst([]);",
      "if (result !== undefined) {",
      "  console.log(result.toUpperCase());",
      "}",
    ].join("\n"),
    explanation:
      "Without strictNullChecks, TypeScript does not recognize that items[0] on an " +
      "empty array is undefined. The type says 'string', but at runtime it is " +
      "undefined — a soundness hole. With strict: true and the correct " +
      "return type (string | undefined), TypeScript enforces a null check.",
    concept: "strict-mode",
    difficulty: 2,
  },
];