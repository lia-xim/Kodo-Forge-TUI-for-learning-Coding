/**
 * Lesson 03 -- Transfer Tasks: Type Annotations & Inference
 *
 * These tasks take the concepts from the Annotations/Inference lesson
 * and apply them in completely new contexts:
 *
 *  1. Config object with multiple environments (satisfies, as const)
 *  2. Function refactoring for better inference
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Config Object with Environments ───────────────────────────
  {
    id: "03-config-environments",
    title: "Type-safe App Configuration with Environments",
    prerequisiteLessons: [3],
    scenario:
      "Your app runs in three environments: development, staging, production. " +
      "Each has its own API URL, log level, and feature flags. " +
      "Currently the config is one big 'any' object, and last week " +
      "someone enabled debug mode in production because there was no " +
      "type system to catch the mistake.",
    task:
      "Create a type-safe configuration using TypeScript inference.\n\n" +
      "1. Define a Config interface with the fields: apiUrl (string), " +
      "   logLevel ('debug' | 'info' | 'warn' | 'error'), " +
      "   features (object with boolean flags)\n" +
      "2. Create a configs object with 'as const satisfies' that contains all " +
      "   three environments\n" +
      "3. Explain: Why 'as const satisfies' instead of just 'as const' or " +
      "   just a type annotation?\n" +
      "4. Write a getConfig function that returns the correct environment " +
      "   — with full literal type precision",
    starterCode: [
      "// Your Config interface",
      "interface AppConfig {",
      "  // TODO",
      "}",
      "",
      "// Configuration for all environments",
      "const configs = {",
      "  development: { /* TODO */ },",
      "  staging:     { /* TODO */ },",
      "  production:  { /* TODO */ },",
      "};",
      "",
      "// Function that returns config for an environment",
      "function getConfig(env: ???) {",
      "  // TODO",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Config Interface: The Structure Definition ═══",
      "interface AppConfig {",
      "  apiUrl: string;",
      "  logLevel: 'debug' | 'info' | 'warn' | 'error';",
      "  features: {",
      "    darkMode: boolean;",
      "    betaFeatures: boolean;",
      "    analytics: boolean;",
      "  };",
      "}",
      "",
      "// ═══ as const satisfies: Safety + Precision ═══",
      "const configs = {",
      "  development: {",
      "    apiUrl: 'http://localhost:3000',",
      "    logLevel: 'debug',",
      "    features: { darkMode: true, betaFeatures: true, analytics: false },",
      "  },",
      "  staging: {",
      "    apiUrl: 'https://staging.example.com',",
      "    logLevel: 'info',",
      "    features: { darkMode: true, betaFeatures: true, analytics: true },",
      "  },",
      "  production: {",
      "    apiUrl: 'https://api.example.com',",
      "    logLevel: 'warn',",
      "    features: { darkMode: true, betaFeatures: false, analytics: true },",
      "  },",
      "} as const satisfies Record<string, AppConfig>;",
      "",
      "// ═══ Why 'as const satisfies'? ═══",
      "//",
      "// Only 'as const':",
      "//   + Literal types are preserved ('debug' instead of string)",
      "//   - No check whether the structure is correct",
      "//   - Typos like 'logLeve' go undetected",
      "//",
      "// Only type annotation (: Record<string, AppConfig>):",
      "//   + Structure is checked",
      "//   - Literal types are lost ('debug' becomes string)",
      "//   - Environment names become string (no autocomplete)",
      "//",
      "// 'as const satisfies':",
      "//   + Structure is checked (satisfies)",
      "//   + Literal types are preserved (as const)",
      "//   + Best of both worlds",
      "",
      "// ═══ Type-safe getConfig function ═══",
      "type Environment = keyof typeof configs;",
      "",
      "function getConfig<E extends Environment>(env: E): typeof configs[E] {",
      "  return configs[env];",
      "}",
      "",
      "// Usage:",
      "// const dev = getConfig('development');",
      "// dev.logLevel  // Type: 'debug' (not string!)",
      "// dev.apiUrl    // Type: 'http://localhost:3000' (not string!)",
      "",
      "// getConfig('invalid');  // Compile error!",
    ].join("\n"),
    conceptsBridged: [
      "as const",
      "satisfies operator",
      "Literal Types",
      "keyof typeof",
      "Generics with Inference",
      "Avoiding Widening",
    ],
    hints: [
      "The problem with a plain type annotation (const configs: Record<string, AppConfig>) is widening: 'debug' becomes string, 'development' becomes string. You lose precision.",
      "'as const' alone preserves the literal types, but does not check whether the structure matches the interface. 'as const satisfies Record<string, AppConfig>' does both.",
      "For the getConfig function: use a generic parameter E extends keyof typeof configs. The return type is then typeof configs[E] — with full literal precision.",
    ],
    difficulty: 4,
  },

  // ─── Task 2: Function Refactoring for Inference ────────────────────────
  {
    id: "03-inference-refactoring",
    title: "Trimming an Over-annotated Function",
    prerequisiteLessons: [3],
    scenario:
      "A junior developer wrote a utility library. " +
      "Every function has explicit type annotations at EVERY point — " +
      "variables, return types, even obvious literal assignments. " +
      "The code is three times longer than necessary and hard to maintain " +
      "because every change has to be updated in three places.",
    task:
      "Refactor the following code: remove unnecessary annotations " +
      "and keep only those that are truly needed.\n\n" +
      "1. Which annotations can TypeScript infer on its own?\n" +
      "2. Where are annotations indispensable?\n" +
      "3. Apply the principle 'Annotate at boundaries, infer inside'\n" +
      "4. Ensure that the resulting code is EQUALLY type-safe",
    starterCode: [
      "// BEFORE: Over-annotated",
      "function filterPositive(numbers: number[]): number[] {",
      "  const result: number[] = [];",
      "  const length: number = numbers.length;",
      "  for (let i: number = 0; i < length; i++) {",
      "    const current: number = numbers[i];",
      "    const isPositive: boolean = current > 0;",
      "    if (isPositive) {",
      "      result.push(current);",
      "    }",
      "  }",
      "  return result;",
      "}",
      "",
      "function createPair(first: string, second: number): { first: string; second: number } {",
      "  const pair: { first: string; second: number } = {",
      "    first: first,",
      "    second: second",
      "  };",
      "  return pair;",
      "}",
      "",
      "function getStatus(code: number): string {",
      "  const isOk: boolean = code >= 200 && code < 300;",
      "  const statusText: string = isOk ? 'OK' : 'Error';",
      "  return statusText;",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ AFTER: Only Necessary Annotations ═══",
      "",
      "// Parameter types: KEEP (boundary rule)",
      "// Return type: KEEP (public API)",
      "// Local variables: REMOVED (inference is sufficient)",
      "function filterPositive(numbers: number[]): number[] {",
      "  return numbers.filter(n => n > 0);",
      "}",
      "",
      "// Parameter types: KEEP (boundary)",
      "// Return type: REMOVED (correctly inferred)",
      "// Local variable 'pair': REMOVED (redundant)",
      "function createPair(first: string, second: number) {",
      "  return { first, second };",
      "}",
      "// Inferred return type: { first: string; second: number }",
      "",
      "// Parameter type: KEEP (boundary)",
      "// Return type: KEEP (public API, makes intent clear)",
      "// Local variables: REMOVED",
      "function getStatus(code: number): string {",
      "  return code >= 200 && code < 300 ? 'OK' : 'Error';",
      "}",
      "",
      "// ═══ The Golden Rule ═══",
      "// 'Annotate at boundaries, infer inside'",
      "//",
      "// KEEP:                            REMOVE:",
      "// - Function parameters            - Local variables",
      "// - Exported return types          - Obvious assignments",
      "// - Interface/type definitions     - Temporary values",
      "// - Public API contracts           - Literals (const x = 5)",
      "//",
      "// Why?",
      "// - Less code = easier to maintain",
      "// - Inference is more precise than manual annotations",
      "// - Changes only need to be made in one place",
      "// - The compiler catches errors that manual types miss",
    ].join("\n"),
    conceptsBridged: [
      "Type Inference",
      "Boundary Rule",
      "Over-annotation",
      "Return-Type Inference",
      "Maintainability",
    ],
    hints: [
      "Ask for every annotation: 'Would TypeScript infer the same type here if I remove the annotation?' If yes, it is redundant.",
      "The boundary rule: parameters need annotations (TypeScript cannot infer them). Local variables initialized from expressions almost never need annotations.",
    ],
    difficulty: 2,
  },
];