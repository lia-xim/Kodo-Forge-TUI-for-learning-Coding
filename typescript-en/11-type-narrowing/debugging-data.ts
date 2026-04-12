/**
 * Lesson 11 — Debugging Challenges: Type Narrowing
 *
 * 5 challenges on narrowing errors:
 * typeof null, truthiness trap, faulty Type Guards,
 * narrowing across function boundaries, missing exhaustive check.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: typeof null Narrowing ─────────────────────────────────
  {
    id: "L11-D1",
    title: "Forgetting typeof null",
    buggyCode: [
      "function getKeys(value: object | string | null): string[] {",
      "  if (typeof value === 'object') {",
      "    return Object.keys(value);",
      "  }",
      "  return [];",
      "}",
      "",
      "console.log(getKeys({ a: 1 }));  // expected: ['a']",
      "console.log(getKeys(null));       // expected: [] — crashes!",
    ].join("\n"),
    errorMessage: "TypeError: Cannot convert null to object",
    bugType: "runtime-error",
    bugLine: 3,
    options: [
      "Object.keys does not work with plain objects",
      "typeof null returns 'object' — null passes through the check",
      "The return type string[] is wrong",
      "typeof value === 'object' is never true",
    ],
    correctOption: 1,
    hints: [
      "What does typeof null return? Is it 'null' or something else?",
      "typeof null === 'object' is true — a historical JavaScript bug.",
      "Add a null check: if (typeof value === 'object' && value !== null).",
    ],
    fixedCode: [
      "function getKeys(value: object | string | null): string[] {",
      "  if (typeof value === 'object' && value !== null) {",
      "    return Object.keys(value);",
      "  }",
      "  return [];",
      "}",
      "",
      "console.log(getKeys({ a: 1 }));  // ['a']",
      "console.log(getKeys(null));       // []",
    ].join("\n"),
    explanation:
      "typeof null returns 'object' — a notorious JavaScript bug " +
      "since 1995. TypeScript narrows after typeof === 'object' to object | null, " +
      "not just object. You must ALWAYS check for null separately.",
    concept: "typeof-null",
    difficulty: 1,
  },

  // ─── Challenge 2: Truthiness trap with 0 ───────────────────────────────
  {
    id: "L11-D2",
    title: "Truthiness eliminates valid values",
    buggyCode: [
      "interface Settings {",
      "  volume: number;",
      "  brightness: number;",
      "}",
      "",
      "function applySettings(s: Partial<Settings>): Settings {",
      "  return {",
      "    volume: s.volume || 50,",
      "    brightness: s.brightness || 75,",
      "  };",
      "}",
      "",
      "const result = applySettings({ volume: 0, brightness: 0 });",
      "console.log(result.volume);     // expected: 0, gets: 50",
      "console.log(result.brightness); // expected: 0, gets: 75",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 8,
    options: [
      "Partial always makes values undefined",
      "|| treats 0 as falsy and takes the fallback value",
      "volume and brightness cannot be 0",
      "The order of properties is wrong",
    ],
    correctOption: 1,
    hints: [
      "Which values are 'falsy' in JavaScript? Is 0 one of them?",
      "0 is falsy! 0 || 50 yields 50. 0 ?? 50 yields 0.",
      "Replace || with ?? (Nullish Coalescing) — it only checks for null/undefined.",
    ],
    fixedCode: [
      "interface Settings {",
      "  volume: number;",
      "  brightness: number;",
      "}",
      "",
      "function applySettings(s: Partial<Settings>): Settings {",
      "  return {",
      "    volume: s.volume ?? 50,",
      "    brightness: s.brightness ?? 75,",
      "  };",
      "}",
      "",
      "const result = applySettings({ volume: 0, brightness: 0 });",
      "console.log(result.volume);     // 0",
      "console.log(result.brightness); // 0",
    ].join("\n"),
    explanation:
      "The || operator checks for all falsy values (0, '', false, null, " +
      "undefined, NaN). Since 0 is falsy, 0 || 50 returns 50. " +
      "The ?? operator (Nullish Coalescing) only checks for null/undefined, " +
      "so 0 ?? 50 correctly returns 0.",
    concept: "truthiness-narrowing",
    difficulty: 2,
  },

  // ─── Challenge 3: Narrowing does not survive function calls ──────────
  {
    id: "L11-D3",
    title: "Narrowing across function boundaries",
    buggyCode: [
      "function isString(value: unknown): boolean {",
      "  return typeof value === 'string';",
      "}",
      "",
      "function process(input: string | number) {",
      "  if (isString(input)) {",
      "    console.log(input.toUpperCase());",
      "  }",
      "}",
    ].join("\n"),
    errorMessage: "Property 'toUpperCase' does not exist on type 'string | number'",
    bugType: "type-error",
    bugLine: 7,
    options: [
      "isString returns the wrong value",
      "TypeScript does not narrow through regular boolean functions — a Type Guard is needed",
      "input must be unknown first",
      "toUpperCase is not a valid method",
    ],
    correctOption: 1,
    hints: [
      "What is the return type of isString? Just boolean — no narrowing!",
      "TypeScript only sees 'boolean', not WHICH check was performed.",
      "Change the return type to 'value is string' — that is a Type Predicate.",
    ],
    fixedCode: [
      "function isString(value: unknown): value is string {",
      "  return typeof value === 'string';",
      "}",
      "",
      "function process(input: string | number) {",
      "  if (isString(input)) {",
      "    console.log(input.toUpperCase()); // input: string",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript does NOT narrow through regular function calls. A function " +
      "that returns boolean tells the compiler nothing about the type of the " +
      "parameter. You must use a Type Predicate (value is string) " +
      "so TypeScript can narrow the parameter after the call.",
    concept: "type-predicates",
    difficulty: 3,
  },

  // ─── Challenge 4: Incomplete Type Guard ──────────────────────────────
  {
    id: "L11-D4",
    title: "Type Guard does not check all fields",
    buggyCode: [
      "interface Product {",
      "  id: number;",
      "  name: string;",
      "  price: number;",
      "}",
      "",
      "function isProduct(data: unknown): data is Product {",
      "  return typeof data === 'object' && data !== null && 'name' in data;",
      "}",
      "",
      "const apiData: unknown = { name: 'Laptop' };",
      "if (isProduct(apiData)) {",
      "  console.log(apiData.price.toFixed(2)); // Crash!",
      "}",
    ].join("\n"),
    errorMessage: "TypeError: Cannot read property 'toFixed' of undefined",
    bugType: "runtime-error",
    bugLine: 8,
    options: [
      "The in operator does not work with unknown",
      "The Type Guard only checks 'name', not 'id' and 'price' — incomplete",
      "toFixed does not work with the Product type",
      "typeof data === 'object' does not exclude arrays",
    ],
    correctOption: 1,
    hints: [
      "Which properties does isProduct check? And which ones does Product require?",
      "isProduct only checks 'name'. 'id' and 'price' are not checked.",
      "Check all fields: 'id' in data, 'name' in data, 'price' in data, plus typeof checks.",
    ],
    fixedCode: [
      "interface Product {",
      "  id: number;",
      "  name: string;",
      "  price: number;",
      "}",
      "",
      "function isProduct(data: unknown): data is Product {",
      "  if (typeof data !== 'object' || data === null) return false;",
      "  const obj = data as Record<string, unknown>;",
      "  return (",
      "    typeof obj.id === 'number' &&",
      "    typeof obj.name === 'string' &&",
      "    typeof obj.price === 'number'",
      "  );",
      "}",
      "",
      "const apiData: unknown = { name: 'Laptop' };",
      "if (isProduct(apiData)) {",
      "  console.log(apiData.price.toFixed(2));",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript trusts Type Guards blindly. If the guard only checks 'name' " +
      "but not 'id' and 'price', the object is considered a complete Product " +
      "by TypeScript — even though 'price' is missing. " +
      "apiData.price is undefined, .toFixed() crashes. " +
      "ALL fields must be checked in a Type Guard.",
    concept: "type-predicates",
    difficulty: 3,
  },

  // ─── Challenge 5: Missing Exhaustive Check ──────────────────────────
  {
    id: "L11-D5",
    title: "New union value without a case",
    buggyCode: [
      "type Status = 'active' | 'inactive' | 'suspended' | 'deleted';",
      "",
      "function getLabel(status: Status): string {",
      "  switch (status) {",
      "    case 'active':    return 'Active';",
      "    case 'inactive':  return 'Inactive';",
      "    case 'suspended': return 'Suspended';",
      "    // 'deleted' forgotten!",
      "  }",
      "  // What gets returned for 'deleted'?",
      "}",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 9,
    options: [
      "TypeScript automatically reports that 'deleted' is missing",
      "The function returns undefined for 'deleted' — no compile error",
      "switch does not work with union types",
      "'deleted' is treated as 'active'",
    ],
    correctOption: 1,
    hints: [
      "What happens when no case matches and no default exists?",
      "The function falls through the switch and implicitly returns undefined.",
      "Add a default with assertNever: default: return assertNever(status);",
    ],
    fixedCode: [
      "function assertNever(value: never): never {",
      "  throw new Error(`Unhandled case: ${value}`);",
      "}",
      "",
      "type Status = 'active' | 'inactive' | 'suspended' | 'deleted';",
      "",
      "function getLabel(status: Status): string {",
      "  switch (status) {",
      "    case 'active':    return 'Active';",
      "    case 'inactive':  return 'Inactive';",
      "    case 'suspended': return 'Suspended';",
      "    case 'deleted':   return 'Deleted';",
      "    default:          return assertNever(status);",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "Without assertNever in the default, TypeScript does not guarantee " +
      "an error for missing cases. The function implicitly returns undefined " +
      "for 'deleted' — even though the return type is string. " +
      "With assertNever, TypeScript immediately reports: " +
      "'Type \"deleted\" is not assignable to type \"never\"'.",
    concept: "exhaustive-checks",
    difficulty: 2,
  },
];