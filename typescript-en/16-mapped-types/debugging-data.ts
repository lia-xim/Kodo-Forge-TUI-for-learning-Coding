/**
 * Lesson 16 — Debugging Challenges: Mapped Types
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L16-D1",
    title: "never in the Value Instead of the Key",
    buggyCode: [
      "// Goal: Remove all string properties",
      "type RemoveStrings<T> = {",
      "  [K in keyof T]: T[K] extends string ? never : T[K];",
      "};",
      "",
      "interface User { id: number; name: string; email: string; }",
      "type NoStrings = RemoveStrings<User>;",
      "// Expected: { id: number; }",
      "// Result: { id: number; name: never; email: never; }",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 3,
    options: [
      "never is in the value type instead of key remapping — properties remain with type never",
      "extends string is incorrect",
      "keyof T returns the wrong type",
      "The conditional type is in the wrong order",
    ],
    correctOption: 0,
    hints: [
      "What happens when never is a value type vs. a key in remapping?",
      "never as a value makes the property unusable but does not remove it.",
      "Use key remapping with as: [K in keyof T as T[K] extends string ? never : K]",
    ],
    fixedCode: [
      "type RemoveStrings<T> = {",
      "  [K in keyof T as T[K] extends string ? never : K]: T[K];",
      "};",
    ].join("\n"),
    explanation:
      "never in the VALUE type creates a property with type never — it still exists " +
      "but nothing can be assigned to it. never in the KEY remapping (as clause) removes " +
      "the property completely from the type.",
    concept: "never-key-vs-value",
    difficulty: 3,
  },
  {
    id: "L16-D2",
    title: "Template Literal Without string Intersection",
    buggyCode: [
      "type Getters<T> = {",
      "  [K in keyof T as `get${Capitalize<K>}`]: () => T[K];",
      "};",
      "",
      "// Error: Type 'K' does not satisfy the constraint 'string'",
    ].join("\n"),
    errorMessage: "Type 'K' does not satisfy the constraint 'string'. Type 'string | number | symbol' is not assignable to type 'string'.",
    bugType: "type-error",
    bugLine: 2,
    options: [
      "K can also be number or symbol — Capitalize requires string",
      "Capitalize does not work with mapped types",
      "as clause is not allowed in mapped types",
      "keyof T always returns string",
    ],
    correctOption: 0,
    hints: [
      "What does keyof T return? Only string?",
      "keyof can be string | number | symbol. Capitalize expects string.",
      "Use `string & K` to restrict to string keys.",
    ],
    fixedCode: [
      "type Getters<T> = {",
      "  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];",
      "};",
    ].join("\n"),
    explanation:
      "keyof T returns string | number | symbol. Capitalize<T> expects a string type. " +
      "The intersection `string & K` filters to string keys — number and symbol keys " +
      "become never and are thus filtered out.",
    concept: "keyof-string-intersection",
    difficulty: 2,
  },
  {
    id: "L16-D3",
    title: "DeepPartial Without Function Guard",
    buggyCode: [
      "type DeepPartial<T> = {",
      "  [K in keyof T]?: T[K] extends object",
      "    ? DeepPartial<T[K]>",
      "    : T[K];",
      "};",
      "",
      "interface Service {",
      "  config: { timeout: number };",
      "  process: (data: string) => void;",
      "}",
      "",
      "type DP = DeepPartial<Service>;",
      "// process becomes DeepPartial<(data: string) => void> — broken!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 3,
    options: [
      "Functions are also 'object' — without a guard, DeepPartial is applied to functions",
      "extends object does not check correctly",
      "DeepPartial cannot be recursive",
      "The ? is in the wrong place",
    ],
    correctOption: 0,
    hints: [
      "typeof (() => {}) === 'object'? No, but in the type system: Function extends object = true!",
      "Add a function check before the recursion.",
      "T[K] extends Function ? T[K] : DeepPartial<T[K]>",
    ],
    fixedCode: [
      "type DeepPartial<T> = {",
      "  [K in keyof T]?: T[K] extends object",
      "    ? T[K] extends Function",
      "      ? T[K]",
      "      : DeepPartial<T[K]>",
      "    : T[K];",
      "};",
    ].join("\n"),
    explanation:
      "In TypeScript's type system, Function extends object. Without the function guard, " +
      "DeepPartial is applied recursively to functions, creating nonsensical types. " +
      "The solution: check for functions first and pass them through directly.",
    concept: "deep-recursive-function-guard",
    difficulty: 3,
  },
  {
    id: "L16-D4",
    title: "Non-homomorphic Mapped Type Loses Modifiers",
    buggyCode: [
      "interface Config {",
      "  readonly host: string;",
      "  port?: number;",
      "}",
      "",
      "type Keys = keyof Config; // 'host' | 'port'",
      "",
      "// Attempt to copy Config:",
      "type ConfigCopy = {",
      "  [K in Keys]: Config[K];",
      "};",
      "",
      "// ConfigCopy.host is NOT readonly!",
      "// ConfigCopy.port is NOT optional!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 10,
    options: [
      "String union instead of keyof T makes the mapped type non-homomorphic — modifiers are lost",
      "Keys is incorrectly defined",
      "Config[K] returns the wrong type",
      "Mapped types cannot preserve modifiers",
    ],
    correctOption: 0,
    hints: [
      "What is the difference between [K in keyof Config] and [K in Keys]?",
      "Only keyof T DIRECTLY in the mapped type syntax preserves modifiers (homomorphic).",
      "Use [K in keyof Config] instead of [K in Keys].",
    ],
    fixedCode: [
      "type ConfigCopy = {",
      "  [K in keyof Config]: Config[K];",
      "};",
      "// Now: readonly host, optional port — correct!",
    ].join("\n"),
    explanation:
      "Homomorphic mapped types must use `keyof T` DIRECTLY. When the union is extracted " +
      "into a variable beforehand (`type Keys = keyof Config`), the mapped type loses the " +
      "information about the modifiers. `[K in keyof Config]` preserves readonly and optional, " +
      "`[K in Keys]` does not.",
    concept: "homomorphic-mapped-types",
    difficulty: 4,
  },
  {
    id: "L16-D5",
    title: "PartialBy With Wrong Combination",
    buggyCode: [
      "// Goal: Make only 'id' optional",
      "type PartialBy<T, K extends keyof T> = Partial<T> & Pick<T, K>;",
      "",
      "interface User { id: number; name: string; email: string; }",
      "type Draft = PartialBy<User, 'id'>;",
      "// Expected: { name: string; email: string; id?: number; }",
      "// Result: All optional + id required — reversed!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "Partial and Pick are swapped — Partial makes EVERYTHING optional, Pick makes K required",
      "Omit is missing",
      "& is the wrong operator",
      "K extends keyof T is incorrect",
    ],
    correctOption: 0,
    hints: [
      "What does Partial<T> do? What does Pick<T, K> do?",
      "Partial<T> & Pick<T, K> = everything optional, but K required anyway — the opposite!",
      "Correct: Omit<T, K> & Partial<Pick<T, K>> — keep the rest, make only K optional.",
    ],
    fixedCode: [
      "type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;",
    ].join("\n"),
    explanation:
      "The correct combination is Omit<T, K> (everything EXCEPT K as required) & " +
      "Partial<Pick<T, K>> (only K as optional). The original version makes everything " +
      "optional with Partial and then makes K required again with Pick — exactly reversed.",
    concept: "utility-type-composition",
    difficulty: 3,
  },
];