/**
 * Lesson 10 — Debugging Challenges: Review Challenge
 *
 * 5 mixed challenges combining concepts from multiple lessons.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L10-D1",
    title: "Type Erasure + instanceof = Problem",
    buggyCode: [
      "interface Admin { name: string; role: 'admin'; }",
      "",
      "function isAdmin(data: unknown): boolean {",
      "  return data instanceof Admin;",
      "}",
    ].join("\n"),
    errorMessage: "'Admin' only refers to a type, but is being used as a value here.",
    bugType: "type-error",
    bugLine: 4,
    options: [
      "Interfaces don't exist at runtime — instanceof only works with classes",
      "Admin must be exported",
      "instanceof requires the new operator",
      "data must first be cast to Admin",
    ],
    correctOption: 0,
    hints: [
      "What happens to interfaces during compilation? (L02: Type Erasure)",
      "Interfaces disappear completely in JavaScript — there's nothing for instanceof to check against.",
      "Use a type guard: function isAdmin(data: unknown): data is Admin (L06).",
    ],
    fixedCode: [
      "function isAdmin(data: unknown): data is Admin {",
      "  return typeof data === 'object' && data !== null && 'role' in data && (data as Admin).role === 'admin';",
      "}",
    ].join("\n"),
    explanation:
      "Type Erasure (L02): Interfaces don't exist at runtime. " +
      "instanceof checks the prototype chain — since interfaces don't have one, " +
      "this is an error. Solution: Type guard with runtime checks (L06).",
    concept: "type-erasure-instanceof (L02+L06)",
    difficulty: 3,
  },

  {
    id: "L10-D2",
    title: "Shallow Readonly Creates a False Sense of Security",
    buggyCode: [
      "interface AppState {",
      "  readonly user: { name: string; loggedIn: boolean };",
      "  readonly settings: { theme: 'light' | 'dark' };",
      "}",
      "",
      "const state: AppState = {",
      "  user: { name: 'Max', loggedIn: true },",
      "  settings: { theme: 'light' },",
      "};",
      "",
      "state.user.loggedIn = false; // No error!",
      "// But: state.user = { ... } would be an error",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 11,
    options: [
      "readonly is shallow — it only protects the direct property, not nested objects",
      "loggedIn must also be readonly",
      "AppState needs Readonly<T>",
      "state must be defined with as const",
    ],
    correctOption: 0,
    hints: [
      "What exactly does readonly protect? (L04/L05)",
      "readonly protects the assignment of the property itself, not the mutation of its value.",
      "Solution: Apply Readonly<T> recursively or use as const for deep freeze.",
    ],
    fixedCode: [
      "const state = {",
      "  user: { name: 'Max', loggedIn: true },",
      "  settings: { theme: 'light' as const },",
      "} as const;",
      "// Now EVERYTHING is readonly — including nested properties",
    ].join("\n"),
    explanation:
      "readonly is shallow (L04/L05): state.user is protected, but " +
      "state.user.loggedIn is not. For deep readonly: as const (L09) " +
      "or a recursive DeepReadonly utility.",
    concept: "shallow-readonly (L04+L05+L09)",
    difficulty: 3,
  },

  {
    id: "L10-D3",
    title: "Excess Property Check Only on Fresh Literals",
    buggyCode: [
      "interface Config { host: string; port: number; }",
      "",
      "const rawConfig = { host: 'localhost', port: 3000, debug: true, verbose: true };",
      "const config: Config = rawConfig; // No error?!",
      "",
      "// But directly it would fail:",
      "// const config2: Config = { host: 'localhost', port: 3000, debug: true }; // Error!",
    ].join("\n"),
    bugType: "soundness-hole",
    bugLine: 4,
    options: [
      "Excess Property Check only applies to fresh object literals, not variables",
      "rawConfig automatically has type Config",
      "debug and verbose are ignored",
      "const prevents the check",
    ],
    correctOption: 0,
    hints: [
      "When does TypeScript check for 'extra' properties? (L05)",
      "Only on FRESH object literals — the check doesn't apply when using variables.",
      "Structural typing: rawConfig has host and port, which is enough for Config.",
    ],
    fixedCode: [
      "// Solution 1: satisfies (checks + keeps type)",
      "const config = { host: 'localhost', port: 3000 } satisfies Config;",
      "",
      "// Solution 2: Direct annotation",
      "const config: Config = { host: 'localhost', port: 3000 };",
    ].join("\n"),
    explanation:
      "The Excess Property Check (L05) only applies to fresh literals. " +
      "Through a variable, TypeScript only checks the structure — extra properties " +
      "are allowed with structural typing. satisfies (L03) is the modern solution.",
    concept: "excess-property-check (L05+L03)",
    difficulty: 4,
  },

  {
    id: "L10-D4",
    title: "Enum + typeof Confusion",
    buggyCode: [
      "enum Status { Active = 'ACTIVE', Inactive = 'INACTIVE' }",
      "",
      "function isActive(status: Status): boolean {",
      "  return typeof status === 'string' && status === 'ACTIVE';",
      "}",
      "",
      "isActive(Status.Active); // true? false?",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 4,
    options: [
      "status === 'ACTIVE' does NOT work — string enums are nominal, you must use Status.Active",
      "typeof Status is not 'string'",
      "isActive must be async",
      "Enums cannot be compared with ===",
    ],
    correctOption: 0,
    hints: [
      "How do you correctly compare string enum values? (L09)",
      "String enums are nominal — 'ACTIVE' (string literal) is not equal to Status.Active.",
      "Use status === Status.Active instead of status === 'ACTIVE'.",
    ],
    fixedCode: [
      "function isActive(status: Status): boolean {",
      "  return status === Status.Active;",
      "}",
    ].join("\n"),
    explanation:
      "String enums are nominally typed (L09): Status.Active is not " +
      "the string 'ACTIVE' in the type system. The comparison status === 'ACTIVE' " +
      "works at RUNTIME, but TypeScript would report an error " +
      "when strict enum comparisons are enforced. " +
      "Always use enum members for comparisons.",
    concept: "string-enum-nominal (L09)",
    difficulty: 3,
  },

  {
    id: "L10-D5",
    title: "Union without Narrowing — Shared Methods Missing",
    buggyCode: [
      "function processInput(input: string | string[]): string {",
      "  return input.join(', ');",
      "  // Error: Property 'join' does not exist on type 'string'",
      "}",
    ].join("\n"),
    errorMessage: "Property 'join' does not exist on type 'string'.",
    bugType: "type-error",
    bugLine: 2,
    options: [
      "join() only exists on arrays — with a union, you must narrow first",
      "join requires a generic type",
      "string[] must be written as Array<string>",
      "input must be sorted first",
    ],
    correctOption: 0,
    hints: [
      "Which operations are allowed on a union? (L07)",
      "Only operations that exist for ALL union members.",
      "Solution: if (Array.isArray(input)) { input.join(...) } else { input }",
    ],
    fixedCode: [
      "function processInput(input: string | string[]): string {",
      "  if (Array.isArray(input)) {",
      "    return input.join(', ');",
      "  }",
      "  return input;",
      "}",
    ].join("\n"),
    explanation:
      "With union types (L07), only shared operations are allowed. " +
      "join() exists on string[] but not on string. " +
      "Array.isArray() is the type guard that narrows to string[].",
    concept: "union-narrowing (L07+L06)",
    difficulty: 2,
  },
];