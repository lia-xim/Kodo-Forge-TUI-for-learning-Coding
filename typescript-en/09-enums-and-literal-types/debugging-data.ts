/**
 * Lesson 09 — Debugging Challenges: Enums & Literal Types
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L09-D1",
    title: "Numeric enum accepts any number",
    buggyCode: [
      "enum Permission { Read = 1, Write = 2, Execute = 4 }",
      "",
      "function checkPermission(p: Permission): string {",
      "  if (p === Permission.Read) return 'read';",
      "  if (p === Permission.Write) return 'write';",
      "  if (p === Permission.Execute) return 'execute';",
      "  return 'unknown';",
      "}",
      "",
      "console.log(checkPermission(999)); // 'unknown' — but no compile error!",
    ].join("\n"),
    bugType: "soundness-hole",
    bugLine: 10,
    options: [
      "Numeric enums allow ANY number — TypeScript does not check the values",
      "checkPermission must be async",
      "Permission needs a default case",
      "999 is automatically coerced to Permission.Read",
    ],
    correctOption: 0,
    hints: [
      "Which numbers does a numeric enum accept?",
      "TypeScript allows any number — because of bitwise flags (Read | Write = 3).",
      "Use string enums or union literal types for real type safety.",
    ],
    fixedCode: [
      "// String enum — no soundness hole!",
      "enum Permission { Read = 'READ', Write = 'WRITE', Execute = 'EXECUTE' }",
    ].join("\n"),
    explanation:
      "Numeric enums have a soundness hole: ANY number is a valid value. " +
      "This exists for bitwise flags (Read | Write = 3). " +
      "String enums and union literal types do not have this problem.",
    concept: "numeric-enum-soundness",
    difficulty: 3,
  },

  {
    id: "L09-D2",
    title: "Object.keys counts reverse mapping entries",
    buggyCode: [
      "enum Direction { North, South, East, West }",
      "",
      "const allDirections = Object.keys(Direction);",
      "console.log(`${allDirections.length} directions`);",
      "// Expected: '4 directions'",
      "// Actual: '8 directions'!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 3,
    options: [
      "Object.keys also counts the reverse-mapping entries (number→name)",
      "Direction secretly has 8 members",
      "Object.keys does not work with enums",
      "const allDirections has the wrong type",
    ],
    correctOption: 0,
    hints: [
      "What does TypeScript generate for a numeric enum?",
      "The generated object has: { 0: 'North', North: 0, 1: 'South', South: 1, ... }",
      "Solution: Object.keys(Direction).filter(k => isNaN(Number(k))) for names only.",
    ],
    fixedCode: [
      "const names = Object.keys(Direction).filter(k => isNaN(Number(k)));",
      "console.log(`${names.length} directions`); // '4 directions'",
    ].join("\n"),
    explanation:
      "Numeric enums have duplicate entries due to reverse mapping. " +
      "Object.keys counts name→value AND value→name. " +
      "Filtering with isNaN(Number(k)) returns only the string names.",
    concept: "reverse-mapping-object-keys",
    difficulty: 3,
  },

  {
    id: "L09-D3",
    title: "let loses the literal type",
    buggyCode: [
      "function fetchData(method: 'GET' | 'POST', url: string): void {",
      "  console.log(`${method} ${url}`);",
      "}",
      "",
      "let method = 'GET';",
      "fetchData(method, '/api/users');",
      "// Error: string is not assignable to 'GET' | 'POST'!",
    ].join("\n"),
    errorMessage: "Argument of type 'string' is not assignable to parameter of type '\"GET\" | \"POST\"'.",
    bugType: "type-error",
    bugLine: 5,
    options: [
      "let widened 'GET' to string — the literal type is lost",
      "fetchData does not accept variables",
      "method must be defined as an enum",
      "'GET' is not a valid string",
    ],
    correctOption: 0,
    hints: [
      "What type does let method = 'GET' have?",
      "let widens to string. const would have kept the literal type 'GET'.",
      "Three solutions: const instead of let, 'GET' as const, or let method: 'GET' | 'POST' = 'GET'.",
    ],
    fixedCode: [
      "// Solution 1: const",
      "const method = 'GET';",
      "",
      "// Solution 2: as const",
      "let method = 'GET' as const;",
      "",
      "// Solution 3: explicit annotation",
      "let method: 'GET' | 'POST' = 'GET';",
    ].join("\n"),
    explanation:
      "let widens literal values to the general type (string). " +
      "fetchData expects the literal type 'GET' | 'POST'. " +
      "const, as const, or an explicit annotation fix this.",
    concept: "literal-widening-let",
    difficulty: 2,
  },

  {
    id: "L09-D4",
    title: "const enum with isolatedModules",
    buggyCode: [
      "// constants.ts",
      "export const enum Color { Red = 'RED', Green = 'GREEN', Blue = 'BLUE' }",
      "",
      "// app.ts",
      "import { Color } from './constants';",
      "console.log(Color.Red);",
      "// Error with isolatedModules: const enum not allowed",
    ].join("\n"),
    errorMessage: "Cannot access ambient const enums when 'isolatedModules' flag is provided.",
    bugType: "type-error",
    bugLine: 2,
    options: [
      "const enum is not compatible with isolatedModules (Vite, esbuild, Next.js)",
      "export does not work with const enum",
      "Color needs a default export",
      "const enum does not exist in TypeScript",
    ],
    correctOption: 0,
    hints: [
      "What does isolatedModules do?",
      "isolatedModules compiles each file independently — cross-file const enum does not work.",
      "Use a regular enum or an as const object instead.",
    ],
    fixedCode: [
      "// Solution: as const object instead of const enum",
      "export const Color = { Red: 'RED', Green: 'GREEN', Blue: 'BLUE' } as const;",
      "export type Color = typeof Color[keyof typeof Color];",
    ].join("\n"),
    explanation:
      "const enum is inlined by the compiler — it needs the definition available. " +
      "With isolatedModules (the default in modern build tools), each file is " +
      "compiled independently — cross-file const enum does not work. " +
      "as const objects are the modern alternative.",
    concept: "const-enum-isolated-modules",
    difficulty: 4,
  },

  {
    id: "L09-D5",
    title: "Branded type without constructor function",
    buggyCode: [
      "type EUR = number & { __brand: 'EUR' };",
      "",
      "const price: EUR = 9.99;",
      "// Error: number is not assignable to EUR!",
    ].join("\n"),
    errorMessage: "Type 'number' is not assignable to type 'EUR'.",
    bugType: "type-error",
    bugLine: 3,
    options: [
      "A constructor function or as-cast is required — direct assignment does not work",
      "EUR must be defined as an interface",
      "__brand must be a Symbol",
      "Branded types do not work with number",
    ],
    correctOption: 0,
    hints: [
      "Why can't a plain number be assigned to a branded type?",
      "9.99 has type number — not number & { __brand: 'EUR' }.",
      "Create a constructor function: function eur(n: number): EUR { return n as EUR; }",
    ],
    fixedCode: [
      "type EUR = number & { __brand: 'EUR' };",
      "",
      "function eur(amount: number): EUR { return amount as EUR; }",
      "const price = eur(9.99); // OK!",
    ].join("\n"),
    explanation:
      "Branded types require an explicit 'entry point' — " +
      "a constructor function or as-cast. Directly assigning a " +
      "plain number does not work because number does not have the __brand property. " +
      "This is intentional — it prevents accidental mix-ups.",
    concept: "branded-type-constructor",
    difficulty: 3,
  },
];