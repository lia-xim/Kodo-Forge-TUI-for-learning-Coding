The file doesn't exist yet in the repo — I'll produce the translated content directly.

```typescript
/**
 * Lesson 02 — Debugging Challenges: Primitive Types
 *
 * 4 Challenges on typeof null, NaN===NaN, any-infection, || vs ?? with 0.
 * Focus: JavaScript quirks that TypeScript doesn't catch.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: typeof null === "object" ──────────────────────────────
  {
    id: "L02-D1",
    title: "typeof null Is Not 'null'",
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
      "This is a well-known JavaScript bug from 1995 — it will never be fixed.",
      "typeof null === 'object' is true. You must check value === null directly.",
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
      "is always false but is syntactically valid. The correct way to check for " +
      "null is a strict equality comparison: value === null.",
    concept: "typeof-null",
    difficulty: 1,
  },

  // ─── Challenge 2: NaN === NaN is false ─────────────────────────────────
  {
    id: "L02-D2",
    title: "NaN Is Not Equal to NaN",
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
      "NaN is the only value per IEEE 754 that is not equal to itself.",
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
      "TypeScript does not warn about this because the expression is syntactically valid. " +
      "Instead, Number.isNaN(v) must be used. Note: the global " +
      "isNaN() coerces the value first (isNaN('hello') === true), whereas " +
      "Number.isNaN() only returns true for actual NaN.",
    concept: "NaN-vergleich",
    difficulty: 2,
  },

  // ─── Challenge 3: any-infection ────────────────────────────────────────
  {
    id: "L02-D3",
    title: "any Infects Other Types",
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
      "config.port is '3000' (a string), but is accepted as number without an error",
      "getConfig() does not return a valid object",
      "port * 2 does not work with number",
      "console.log cannot output numbers",
    ],
    correctOption: 0,
    hints: [
      "What type does config have? And what does that mean for config.port?",
      "any spreads: config is any, so config.port is any as well.",
      "'3000' * 2 gives 6000 in JavaScript (implicit conversion), " +
        "but '3000' + 2 would give '30002' (string concatenation).",
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
      "any. An any value can be assigned to any type without a check — " +
      "TypeScript reports no error. Here port is a string ('3000') at runtime " +
      "but is treated as a number. With * this happens to work " +
      "(implicit conversion), but with + string concatenation would occur " +
      "instead of addition. Solution: specify a concrete return type.",
    concept: "any-propagation",
    difficulty: 2,
  },

  // ─── Challenge 4: || vs ?? with 0 ──────────────────────────────────────
  {
    id: "L02-D4",
    title: "|| vs ?? with Falsy Values",
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
      "|| treats 0 as falsy and takes the fallback value",
      "Partial makes the values undefined",
      "0 is not a valid number value",
      "|| cannot be used with numbers",
    ],
    correctOption: 0,
    hints: [
      "Which values are 'falsy' in JavaScript?",
      "Falsy values: false, 0, '', null, undefined, NaN. The || operator uses " +
        "the right-hand value for ANY falsy value.",
      "The ?? operator (nullish coalescing) only checks for null and undefined.",
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
      "The || operator returns the right-hand operand when the left-hand side is 'falsy'. " +
      "In JavaScript, 0 is a falsy value — so 0 || 50 evaluates to 50. " +
      "This is a common bug when 0 is a legitimate value (e.g. volume). " +
      "The ?? operator (nullish coalescing) only checks for null and undefined, " +
      "so 0 ?? 50 correctly returns 0.",
    concept: "nullish-coalescing",
    difficulty: 2,
  },
];
```