/**
 * Lesson 08 — Debugging Challenges: Type Aliases vs Interfaces
 *
 * 5 challenges on Declaration Merging, extends conflicts,
 * Intersection-never, implements misconceptions, Mapped Types.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L08-D1",
    title: "Silent never property through intersection conflict",
    buggyCode: [
      "type ApiUser = { id: string; role: 'user' };",
      "type DbUser = { id: number; role: string; createdAt: Date };",
      "type FullUser = ApiUser & DbUser;",
      "",
      "const user: FullUser = {",
      "  id: '123', // Error — but why?",
      "  role: 'user',",
      "  createdAt: new Date(),",
      "};",
    ].join("\n"),
    errorMessage: "Type 'string' is not assignable to type 'never'.",
    bugType: "type-error",
    bugLine: 3,
    options: [
      "id is string & number = never — intersection conflict without warning at the type definition",
      "FullUser cannot be created from two type aliases",
      "createdAt must be optional",
      "role must be an enum",
    ],
    correctOption: 0,
    hints: [
      "What does string & number evaluate to?",
      "Intersection conflicts produce no error at the definition — only at the usage site.",
      "id is string & number = never. Use extends instead of & to catch conflicts early.",
    ],
    fixedCode: [
      "interface BaseUser { id: string; role: string; }",
      "interface ApiUser extends BaseUser { role: 'user'; }",
      "interface FullUser extends ApiUser { createdAt: Date; }",
    ].join("\n"),
    explanation:
      "ApiUser.id is string, DbUser.id is number. The intersection " +
      "results in id: string & number = never. TypeScript only reports this " +
      "at the assignment, not at the type definition. extends would have " +
      "flagged the conflict as an error immediately.",
    concept: "intersection-conflict",
    difficulty: 4,
  },

  {
    id: "L08-D2",
    title: "Unexpected declaration merging — duplicate interface",
    buggyCode: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "}",
      "",
      "// In another file or further below:",
      "interface Config {",
      "  port: string; // Different type!",
      "  debug: boolean;",
      "}",
    ].join("\n"),
    errorMessage:
      "Subsequent property declarations must have the same type. " +
      "Property 'port' must be of type 'number', but here has type 'string'.",
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Declaration merging does not allow incompatible property types for the same key",
      "An interface may not be declared twice",
      "Config must be declared as a type",
      "debug must be in the first declaration",
    ],
    correctOption: 0,
    hints: [
      "What happens when declaration merging finds the same key with different types?",
      "port is number in the first declaration and string in the second — conflict!",
      "With declaration merging, shared properties must have the same type.",
    ],
    fixedCode: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "}",
      "interface Config {",
      "  port: number; // Must be the same type!",
      "  debug: boolean;",
      "}",
    ].join("\n"),
    explanation:
      "Declaration merging adds new properties, but SHARED " +
      "properties must have the same type. port: number in the first " +
      "and port: string in the second declaration is an error.",
    concept: "declaration-merging-conflict",
    difficulty: 3,
  },

  {
    id: "L08-D3",
    title: "implements does not inherit implementation",
    buggyCode: [
      "interface Logger {",
      "  log(message: string): void;",
      "  warn(message: string): void;",
      "}",
      "",
      "class AppLogger implements Logger {",
      "  log(message: string): void {",
      "    console.log(message);",
      "  }",
      "  // warn() is missing — but shouldn't implements bring it along?",
      "}",
    ].join("\n"),
    errorMessage:
      "Class 'AppLogger' incorrectly implements interface 'Logger'. " +
      "Property 'warn' is missing.",
    bugType: "type-error",
    bugLine: 6,
    options: [
      "implements only checks whether the class satisfies the shape — it does NOT inherit any implementation",
      "Logger must be declared as an abstract class",
      "warn must be optional (?)",
      "AppLogger needs a constructor",
    ],
    correctOption: 0,
    hints: [
      "What exactly does implements do?",
      "implements is a pure compile-time check — it inherits nothing.",
      "The class must implement ALL interface methods itself.",
    ],
    fixedCode: [
      "class AppLogger implements Logger {",
      "  log(message: string): void { console.log(message); }",
      "  warn(message: string): void { console.warn(message); }",
      "}",
    ].join("\n"),
    explanation:
      "implements does not inherit methods — it only checks whether the class " +
      "has the correct shape. Every method from the interface must be " +
      "implemented in the class. For inheritance use extends (on classes).",
    concept: "implements-no-inheritance",
    difficulty: 2,
  },

  {
    id: "L08-D4",
    title: "Mapped type inside an interface — not allowed",
    buggyCode: [
      "interface User {",
      "  name: string;",
      "  age: number;",
      "}",
      "",
      "// Attempt: mapped type inside an interface",
      "interface ReadonlyUser {",
      "  readonly [K in keyof User]: User[K];",
      "}",
    ].join("\n"),
    errorMessage: "A mapped type may not declare properties or methods.",
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Mapped types only work with type, not with interface",
      "readonly is not allowed in interfaces",
      "keyof does not work with interfaces",
      "User must be declared as a type",
    ],
    correctOption: 0,
    hints: [
      "Which keyword supports mapped types?",
      "The [K in keyof T] syntax is a mapped type — only usable with type.",
      "Solution: type ReadonlyUser = Readonly<User>; or type ReadonlyUser = { readonly [K in keyof User]: User[K] };",
    ],
    fixedCode: [
      "type ReadonlyUser = {",
      "  readonly [K in keyof User]: User[K];",
      "};",
      "// Or shorter: type ReadonlyUser = Readonly<User>;",
    ].join("\n"),
    explanation:
      "Mapped types ([K in keyof T]) are a type-only feature. " +
      "Interfaces do not support this syntax. Use type " +
      "or the built-in utility type Readonly<User>.",
    concept: "mapped-type-type-only",
    difficulty: 2,
  },

  {
    id: "L08-D5",
    title: "extends with an incompatible property",
    buggyCode: [
      "interface Animal {",
      "  name: string;",
      "  legs: number;",
      "}",
      "",
      "interface Snake extends Animal {",
      "  legs: 0; // Snake has no legs",
      "  venomous: boolean;",
      "}",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 7,
    options: [
      "legs: 0 is a subtype of number — this actually works!",
      "extends does not allow literal types for inherited properties",
      "Snake cannot extend Animal",
      "legs must be declared as optional",
    ],
    correctOption: 0,
    hints: [
      "Is the literal type 0 compatible with number?",
      "0 is a subtype of number — extends allows NARROWING of the type.",
      "This code actually compiles! extends permits compatible overrides.",
    ],
    fixedCode: [
      "// This code is correct!",
      "interface Snake extends Animal {",
      "  legs: 0; // 0 is a subtype of number — allowed!",
      "  venomous: boolean;",
      "}",
      "",
      "const cobra: Snake = { name: 'Cobra', legs: 0, venomous: true };",
    ].join("\n"),
    explanation:
      "Surprise: this code is CORRECT! 0 (literal type) is " +
      "a subtype of number. extends allows narrowing of " +
      "inherited properties — as long as the new type is a subtype. " +
      "legs: string would be an error, but legs: 0 is allowed.",
    concept: "extends-narrowing",
    difficulty: 3,
  },
];