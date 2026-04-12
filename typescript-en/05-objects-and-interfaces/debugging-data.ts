/**
 * Lesson 05 — Debugging Challenges: Objects & Interfaces
 *
 * 5 challenges on Excess Property Check bypass, readonly shallow,
 * Intersection-never, Omit typo, empty interface.
 * Focus: Object type system gaps and interface pitfalls.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: Excess Property Check bypassed ────────────────────────
  {
    id: "L05-D1",
    title: "Excess Property Check Bypassed via Variable",
    buggyCode: [
      "interface Point {",
      "  x: number;",
      "  y: number;",
      "}",
      "",
      "const data = { x: 1, y: 2, z: 3 };",
      "const point: Point = data; // No error!",
      "",
      "// Expected: Error due to excess property 'z'",
      "// Actually: TypeScript accepts it",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 7,
    options: [
      "Excess Property Checks only apply to object literals, not variables",
      "data has type { x: number; y: number; z: number } which is compatible with Point",
      "z is automatically removed on assignment",
      "const declaration disables Excess Property Checks",
    ],
    correctOption: 0,
    hints: [
      "Try assigning the object literal directly: const point: Point = { x: 1, y: 2, z: 3 };",
      "Excess Property Checks are a special mechanism that ONLY applies to " +
        "object literals. For variables, only structural compatibility applies.",
      "The intermediate variable 'data' bypasses the check — this is " +
        "intentional behavior in TypeScript.",
    ],
    fixedCode: [
      "interface Point {",
      "  x: number;",
      "  y: number;",
      "}",
      "",
      "// Variant 1: Assign directly (Excess Check applies)",
      "const point: Point = { x: 1, y: 2 };",
      "",
      "// Variant 2: Use satisfies",
      "const data = { x: 1, y: 2 } satisfies Point;",
      "",
      "// Variant 3: Exact types via Brand",
      "// Currently there are no native exact types in TypeScript",
    ].join("\n"),
    explanation:
      "Excess Property Checks are a special mechanism in TypeScript that ONLY " +
      "applies to object literals. If an object is first assigned to a variable " +
      "and then to a narrower type, TypeScript only checks structural compatibility " +
      "— and { x, y, z } is compatible with { x, y }. " +
      "This is not a bug but intentional: structural typing allows excess properties. " +
      "For safety: use satisfies or direct literal assignment.",
    concept: "excess-property-check",
    difficulty: 3,
  },

  // ─── Challenge 2: readonly is shallow ───────────────────────────────────
  {
    id: "L05-D2",
    title: "Readonly Is Shallow Only",
    buggyCode: [
      "interface Config {",
      "  readonly host: string;",
      "  readonly settings: {",
      "    port: number;",
      "    debug: boolean;",
      "  };",
      "}",
      "",
      "const config: Config = {",
      "  host: 'localhost',",
      "  settings: { port: 3000, debug: false },",
      "};",
      "",
      "// config.host = 'other'; // Correct: Error",
      "config.settings.port = 8080; // Expected: Error, actually: OK!",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 15,
    options: [
      "readonly on 'settings' only protects the reference, not the object's properties",
      "readonly does not work with nested objects",
      "port is not a readonly field",
      "config must be declared with 'as const'",
    ],
    correctOption: 0,
    hints: [
      "What exactly does 'readonly settings' mean?",
      "'readonly settings' means: you cannot reassign config.settings " +
        "(config.settings = {...}), but the properties OF settings are mutable.",
      "For deep readonly: declare readonly on each level, or use a recursive DeepReadonly type.",
    ],
    fixedCode: [
      "interface Config {",
      "  readonly host: string;",
      "  readonly settings: Readonly<{",
      "    port: number;",
      "    debug: boolean;",
      "  }>;",
      "}",
      "",
      "const config: Config = {",
      "  host: 'localhost',",
      "  settings: { port: 3000, debug: false },",
      "};",
      "",
      "// config.host = 'other';         // Error: readonly",
      "// config.settings.port = 8080;   // Error: readonly",
      "// config.settings = { ... };     // Error: readonly",
    ].join("\n"),
    explanation:
      "'readonly' in TypeScript is shallow. " +
      "'readonly settings: { port: number }' only means that 'settings' " +
      "cannot be reassigned — the properties inside settings are still mutable. " +
      "For deep readonly, each level must be marked readonly separately (Readonly<T>), " +
      "or a recursive DeepReadonly utility type must be used.",
    concept: "readonly-shallow",
    difficulty: 3,
  },

  // ─── Challenge 3: Intersection becomes never ───────────────────────────
  {
    id: "L05-D3",
    title: "Intersection of Incompatible Types Becomes never",
    buggyCode: [
      "type StringId = { id: string };",
      "type NumberId = { id: number };",
      "",
      "type Combined = StringId & NumberId;",
      "",
      "// Expected: Object with id that can be either",
      "// Actually: Combined['id'] is 'never'",
      "function create(): Combined {",
      "  return { id: 'abc' }; // Error!",
      "}",
    ].join("\n"),
    errorMessage: "Type 'string' is not assignable to type 'never'.",
    bugType: "type-error",
    bugLine: 4,
    options: [
      "Intersection of string & number for 'id' yields never — there is no value that is both",
      "StringId and NumberId cannot be combined",
      "Intersections only work with interfaces, not type aliases",
      "create() must use the Combined type as a generic",
    ],
    correctOption: 0,
    hints: [
      "What does string & number yield? Is there a value that is simultaneously string AND number?",
      "Intersection (&) for property types means: id must be SIMULTANEOUSLY " +
        "string and number. Since no value is both, it becomes never.",
      "Union (|) would be correct here: type Combined = StringId | NumberId; " +
        "Or: { id: string | number }.",
    ],
    fixedCode: [
      "type StringId = { id: string };",
      "type NumberId = { id: number };",
      "",
      "// Variant 1: Union instead of Intersection",
      "type Either = StringId | NumberId;",
      "",
      "// Variant 2: Flexible ID",
      "type Combined = { id: string | number };",
      "",
      "function create(): Combined {",
      "  return { id: 'abc' }; // OK",
      "}",
    ].join("\n"),
    explanation:
      "With an intersection (A & B), same-named properties are also intersected: " +
      "id becomes string & number. Since no value is simultaneously string AND number, " +
      "the type becomes never. The type Combined is not itself never (it may have further " +
      "properties), but the id property is never and can never be assigned. " +
      "Solution: use union (|) instead of intersection when properties should allow different types.",
    concept: "intersection-never",
    difficulty: 4,
  },

  // ─── Challenge 4: Omit with typo ────────────────────────────────────────
  {
    id: "L05-D4",
    title: "Omit Does Not Validate the Key String",
    buggyCode: [
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "  password: string;",
      "}",
      "",
      "type PublicUser = Omit<User, 'pasword'>; // Typo!",
      "",
      "const user: PublicUser = {",
      "  id: 1,",
      "  name: 'Alice',",
      "  email: 'alice@example.com',",
      "  password: 'secret', // Expected: Error. Actually: OK!",
      "};",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 8,
    options: [
      "Omit accepts any string as a key — typos are not caught",
      "Omit always removes all string properties",
      "password must be in quotes",
      "PublicUser needs an explicit property list",
    ],
    correctOption: 0,
    hints: [
      "Look closely at the key parameter of Omit: 'pasword' vs. 'password'.",
      "Omit<T, K> accepts K extends string — NOT K extends keyof T. " +
        "Any string is accepted.",
      "Tip: Write a type-safe StrictOmit: " +
        "type StrictOmit<T, K extends keyof T> = Omit<T, K>;",
    ],
    fixedCode: [
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "  password: string;",
      "}",
      "",
      "// Type-safe StrictOmit that only accepts valid keys",
      "type StrictOmit<T, K extends keyof T> = Omit<T, K>;",
      "",
      "type PublicUser = StrictOmit<User, 'password'>; // Typo is caught!",
      "",
      "const user: PublicUser = {",
      "  id: 1,",
      "  name: 'Alice',",
      "  email: 'alice@example.com',",
      "  // password correctly absent",
      "};",
    ].join("\n"),
    explanation:
      "Omit<T, K> has the signature K extends string — not K extends keyof T. " +
      "This means any string is accepted as a key, even typos. " +
      "'pasword' (with one 's') is not a key of User, so Omit removes nothing " +
      "and password remains in the type. " +
      "Solution: define a StrictOmit type that enforces K extends keyof T.",
    concept: "omit-typo",
    difficulty: 3,
  },

  // ─── Challenge 5: Empty interface accepts almost anything ───────────────
  {
    id: "L05-D5",
    title: "Empty Interface Accepts Almost Anything",
    buggyCode: [
      "interface Serializable {}",
      "",
      "function serialize(obj: Serializable): string {",
      "  return JSON.stringify(obj);",
      "}",
      "",
      "// All these calls compile without errors:",
      "serialize(42);",
      "serialize('hello');",
      "serialize(true);",
      "serialize({ anything: 'goes' });",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 1,
    options: [
      "An empty interface {} accepts every value except null and undefined",
      "Serializable is treated as 'any'",
      "JSON.stringify accepts all types",
      "The function has no return type and therefore ignores the parameter type",
    ],
    correctOption: 0,
    hints: [
      "Which TypeScript type does an empty interface correspond to?",
      "An empty interface {} is structurally equivalent to the type {} — " +
        "which accepts everything except null and undefined.",
      "For a meaningful Serializable interface, properties or methods must be declared, " +
        "e.g. toJSON(): unknown.",
    ],
    fixedCode: [
      "interface Serializable {",
      "  toJSON(): unknown;",
      "}",
      "",
      "function serialize(obj: Serializable): string {",
      "  return JSON.stringify(obj.toJSON());",
      "}",
      "",
      "// serialize(42);      // Error: number has no toJSON()",
      "// serialize('hello'); // Error: string has no toJSON()",
      "",
      "const data: Serializable = {",
      "  value: 42,",
      "  toJSON() { return { value: this.value }; },",
      "};",
      "serialize(data); // OK",
    ].join("\n"),
    explanation:
      "An empty interface {} in TypeScript is structurally compatible with " +
      "every type except null and undefined. This is due to structural typing: " +
      "a value is compatible with a type if it has all required properties. " +
      "An empty interface requires no properties, so everything is compatible. " +
      "This is a common design mistake with marker interfaces. " +
      "Solution: declare at least one property or method to meaningfully constrain the type.",
    concept: "empty-interface",
    difficulty: 4,
  },
];