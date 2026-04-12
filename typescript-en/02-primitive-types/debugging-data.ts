/**
 * Lesson 02 — Debugging Challenges: Primitive Types
 *
 * 4 challenges on typeof null, NaN===NaN, any contamination, || vs ?? with 0.
 * Focus: JavaScript quirks that TypeScript does not catch.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: typeof null === "object" ──────────────────────────────
  {
    id: "L02-D1",
    title: "typeof null is not 'null'",
    buggyCode: [
      "function isNull(value: unknown): boolean {",
      "  return typeof value === 'null';",
      "}",
      "",
      "console.log(isNull(null));    // expected: true",
      "console.log(isNull('hello')); // expected: false",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "typeof null returns 'null' — the comparison is correct",
      "typeof null returns 'object' — a historical JavaScript bug",
      "typeof null returns 'undefined'",
      "null has no typeof value",
    ],
    correctOption: 1,
    hints: [
      "Run typeof null in a console. What does it return?",
      "This is a well-known JavaScript bug since 1995 — it will never be fixed.",
      "typeof null === 'object' is true. You need to check directly with value === null.",
    ],
    fixedCode: [
      "function isNull(value: unknown): boolean {",
      "  return value === null;",
      "}",
      "",
      "console.log(isNull(null));    // true",
      "console.log(isNull('hello')); // false",
    ].join("\n"),
    explanation:
      "typeof null returns 'object' — a design flaw from the early days of " +
      "JavaScript (1995) that was never fixed because too much code depends on it. " +
      "TypeScript does not warn about this because typeof null === 'null' " +
      "is always false but not a syntax error. The correct way to check for " +
      "null is with strict comparison: value === null.",
    concept: "typeof-null",
    difficulty: 1,
  },

  // ─── Challenge 2: NaN === NaN is false ──────────────────────────────────
  {
    id: "L02-D2",
    title: "NaN is not equal to NaN",
    buggyCode: [
      "function hasInvalidNumber(values: number[]): boolean {",
      "  return values.some(v => v === NaN);",
      "}",
      "",
      "console.log(hasInvalidNumber([1, NaN, 3])); // expected: true",
      "console.log(hasInvalidNumber([1, 2, 3]));    // expected: false",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "some() does not work with NaN",
      "NaN === NaN is false — NaN is the only value that is not equal to itself",
      "The comparison must use != instead of ===",
      "NaN is not a valid number value in TypeScript",
    ],
    correctOption: 1,
    hints: [
      "What does NaN === NaN evaluate to in JavaScript?",
      "NaN is, according to IEEE 754, the only value that is not equal to itself.",
      "Use Number.isNaN() or Object.is() instead of ===.",
    ],
    fixedCode: [
      "function hasInvalidNumber(values: number[]): boolean {",
      "  return values.some(v => Number.isNaN(v));",
      "}",
      "",
      "console.log(hasInvalidNumber([1, NaN, 3])); // true",
      "console.log(hasInvalidNumber([1, 2, 3]));    // false",
    ].join("\n"),
    explanation:
      "NaN === NaN evaluates to false — this is defined by the IEEE 754 standard. " +
      "TypeScript does not warn about this because the expression is syntactically correct. " +
      "Instead, Number.isNaN(v) must be used. Note: The global " +
      "isNaN() converts the value first (isNaN('hello') === true), while " +
      "Number.isNaN() only returns true for actual NaN.",
    concept: "NaN-vergleich",
    difficulty: 2,
  },

  // ─── Challenge 3: any contamination ─────────────────────────────────────
  {
    id: "L02-D3",
    title: "any infects other types",
    buggyCode: [
      "function getConfig(): any {",
      "  return { port: '3000' };",
      "}",
      "",
      "const config = getConfig();",
      "const port: number = config.port;",
      "const doubled = port * 2;",
      "",
      "console.log(doubled); // expected: 6000",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 6,
    options: [
      "config.port is '3000' (string), but is accepted as number without error",
      "getConfig() does not return a valid object",
      "port * 2 does not work with number",
      "console.log cannot output numbers",
    ],
    correctOption: 0,
    hints: [
      "What type does config have? And what does that mean for config.port?",
      "any spreads: config is any, so config.port is also any.",
      "'3000' * 2 yields 6000 in JavaScript (implicit conversion), " +
        "but '3000' + 2 would yield '30002' (string concatenation).",
    ],
    fixedCode: [
      "interface Config {",
      "  port: number;",
      "}",
      "",
      "function getConfig(): Config {",
      "  return { port: 3000 };",
      "}",
      "",
      "const config = getConfig();",
      "const doubled = config.port * 2;",
      "",
      "console.log(doubled); // 6000",
    ].join("\n"),
    explanation:
      "any is contagious: when getConfig() is typed as any, config.port is also " +
      "any. An any value can be assigned to any type without checking — " +
      "TypeScript reports no error. Here, port is a string ('3000') at runtime " +
      "but is treated as a number. With * this works by coincidence (implicit conversion), " +
      "but with + string concatenation instead of addition would occur. Solution: specify a concrete return type.",
    concept: "any-propagation",
    difficulty: 2,
  },

  // ─── Challenge 4: || vs ?? with 0 ───────────────────────────────────────
  {
    id: "L02-D4",
    title: "|| vs ?? with falsy values",
    buggyCode: [
      "interface Settings {",
      "  volume: number;",
      "  brightness: number;",
      "}",
      "",
      "function applySettings(partial: Partial<Settings>): Settings {",
      "  return {",
      "    volume: partial.volume || 50,",
      "    brightness: partial.brightness || 75,",
      "  };",
      "}",
      "",
      "const s = applySettings({ volume: 0, brightness: 0 });",
      "console.log(s.volume);     // expected: 0, actual: 50",
      "console.log(s.brightness); // expected: 0, actual: 75",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 8,
    options: [
      "|| treats 0 as falsy and uses the fallback value",
      "Partial makes the values undefined",
      "0 is not a valid number value",
      "|| cannot be used with numbers",
    ],
    correctOption: 0,
    hints: [
      "Which values are 'falsy' in JavaScript?",
      "falsy values: false, 0, '', null, undefined, NaN. The || operator uses " +
        "the right value for EVERY falsy value.",
      "The ?? operator (Nullish Coalescing) only checks for null and undefined.",
    ],
    fixedCode: [
      "interface Settings {",
      "  volume: number;",
      "  brightness: number;",
      "}",
      "",
      "function applySettings(partial: Partial<Settings>): Settings {",
      "  return {",
      "    volume: partial.volume ?? 50,",
      "    brightness: partial.brightness ?? 75,",
      "  };",
      "}",
      "",
      "const s = applySettings({ volume: 0, brightness: 0 });",
      "console.log(s.volume);     // 0",
      "console.log(s.brightness); // 0",
    ].join("\n"),
    explanation:
      "The || operator returns the right operand when the left is 'falsy'. " +
      "In JavaScript, 0 is a falsy value — so 0 || 50 becomes 50. " +
      "This is a common bug when 0 is a valid value (e.g. volume). " +
      "The ?? operator (Nullish Coalescing) only checks for null and undefined, " +
      "so 0 ?? 50 correctly returns 0.",
    concept: "nullish-coalescing",
    difficulty: 2,
  },
];