/**
 * Lesson 15 — Debugging Challenges: Utility Types
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L15-D1",
    title: "Readonly does not protect nested objects",
    buggyCode: [
      "interface Config {",
      "  server: { host: string; port: number };",
      "  debug: boolean;",
      "}",
      "",
      "function freeze(config: Readonly<Config>): void {",
      "  // Should NOT be able to change anything!",
      "  config.server.port = 9999;  // No error?!",
      "  console.log(`Port: ${config.server.port}`);",
      "}",
      "",
      "const c: Config = { server: { host: 'localhost', port: 3000 }, debug: false };",
      "freeze(c);",
      "// c.server.port is now 9999 — even though Readonly was used!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 8,
    options: [
      "Readonly is shallow — nested objects are not protected",
      "config must be declared as const",
      "freeze must return a new Config",
      "Readonly does not work with function parameters",
    ],
    correctOption: 0,
    hints: [
      "Which level does Readonly<T> protect?",
      "Readonly only makes the properties of the FIRST level readonly.",
      "Solution: Use a custom DeepReadonly<T>.",
    ],
    fixedCode: [
      "type DeepReadonly<T> = T extends object",
      "  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }",
      "  : T;",
      "",
      "function freeze(config: DeepReadonly<Config>): void {",
      "  // config.server.port = 9999;  // Now: Error!",
      "  console.log(`Port: ${config.server.port}`);",
      "}",
    ].join("\n"),
    explanation:
      "Readonly<T> is shallow — only the first level is readonly. " +
      "config.server is readonly (reference), but config.server.port is not. " +
      "DeepReadonly<T> with recursion solves the problem.",
    concept: "readonly-shallow",
    difficulty: 2,
  },

  {
    id: "L15-D2",
    title: "Omit with typo removes nothing",
    buggyCode: [
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "  password: string;",
      "}",
      "",
      "// Should remove password:",
      "type SafeUser = Omit<User, 'pasword'>; // Typo!",
      "",
      "function toSafe(user: User): SafeUser {",
      "  return user; // No error — but password is still there!",
      "}",
      "",
      "const safe = toSafe({ id: 1, name: 'Max', email: 'max@test.com', password: 'secret' });",
      "console.log(safe); // { id, name, email, password } — Oops!",
    ].join("\n"),
    errorMessage: "No error — that's the bug! Omit accepts any string.",
    bugType: "logic-error",
    bugLine: 9,
    options: [
      "Omit accepts any string — the typo goes undetected",
      "User has no password field",
      "Omit does not work with interfaces",
      "toSafe must destructure the User",
    ],
    correctOption: 0,
    hints: [
      "What happens when you give Omit a non-existent key?",
      "Omit<T, K> only requires K extends string — not K extends keyof T.",
      "Use StrictOmit<T, K extends keyof T> = Omit<T, K> instead.",
    ],
    fixedCode: [
      "type StrictOmit<T, K extends keyof T> = Omit<T, K>;",
      "",
      "type SafeUser = StrictOmit<User, 'password'>; // A typo would be an error!",
    ].join("\n"),
    explanation:
      "Omit is not type-safe for keys. 'pasword' (typo) is accepted, " +
      "but since the key does not exist, nothing is removed. " +
      "StrictOmit with K extends keyof T catches the error.",
    concept: "omit-not-typesafe",
    difficulty: 3,
  },

  {
    id: "L15-D3",
    title: "ReturnType on async function returns Promise",
    buggyCode: [
      "async function fetchUser(id: number) {",
      "  return { id, name: 'Max', email: 'max@test.com' };",
      "}",
      "",
      "type User = ReturnType<typeof fetchUser>;",
      "// Expected: { id: number; name: string; email: string }",
      "// Actual: Promise<{ id: number; name: string; email: string }>",
      "",
      "function displayUser(user: User): void {",
      "  console.log(user.name); // Error! Property 'name' does not exist on type 'Promise<...>'",
      "}",
    ].join("\n"),
    errorMessage: "Property 'name' does not exist on type 'Promise<{ id: number; name: string; email: string }>'.",
    bugType: "type-error",
    bugLine: 5,
    options: [
      "ReturnType on async functions returns Promise<...> — you need Awaited as well",
      "fetchUser must be synchronous",
      "typeof is wrong here",
      "ReturnType does not work with async",
    ],
    correctOption: 0,
    hints: [
      "What does an async function return?",
      "Async functions ALWAYS return a Promise.",
      "Awaited<ReturnType<typeof fn>> unwraps the Promise.",
    ],
    fixedCode: [
      "type User = Awaited<ReturnType<typeof fetchUser>>;",
      "// ^ { id: number; name: string; email: string } — without Promise!",
    ].join("\n"),
    explanation:
      "Async functions always return a Promise. ReturnType extracts " +
      "the actual return type (Promise<...>). " +
      "Awaited unwraps the Promise to the inner type.",
    concept: "returntype-async-awaited",
    difficulty: 2,
  },

  {
    id: "L15-D4",
    title: "Exclude instead of Omit for object properties",
    buggyCode: [
      "interface Product {",
      "  id: number;",
      "  name: string;",
      "  price: number;",
      "}",
      "",
      "// Should remove id:",
      "type CreateInput = Exclude<Product, 'id'>;",
      "// Expected: { name: string; price: number }",
      "// Actual: Product (unchanged!)",
      "",
      "function create(input: CreateInput): void {",
      "  // input.id still exists!",
      "  console.log(input);",
      "}",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Exclude operates on union members, not on object properties — Omit is correct",
      "Exclude needs the full property type",
      "Product must be a union",
      "CreateInput must be generic",
    ],
    correctOption: 0,
    hints: [
      "What does Exclude operate on? Unions or object properties?",
      "Exclude<Product, 'id'> checks: Is Product assignable to type 'id'? No — so Product remains.",
      "For object properties: Omit<Product, 'id'>.",
    ],
    fixedCode: [
      "type CreateInput = Omit<Product, 'id'>;",
      "// ^ { name: string; price: number } — correct!",
    ].join("\n"),
    explanation:
      "Exclude<T, U> operates on UNION members — it removes members from T " +
      "that are assignable to U. An object type is not a string, so nothing happens. " +
      "For object properties: Omit<T, K>.",
    concept: "exclude-vs-omit",
    difficulty: 3,
  },

  {
    id: "L15-D5",
    title: "Using Partial property without narrowing",
    buggyCode: [
      "interface User {",
      "  name: string;",
      "  email: string;",
      "}",
      "",
      "function greet(update: Partial<User>): string {",
      "  return `Hello ${update.name.toUpperCase()}`;",
      "  // Error! update.name could be undefined!",
      "}",
    ].join("\n"),
    errorMessage: "Object is possibly 'undefined'.",
    bugType: "type-error",
    bugLine: 7,
    options: [
      "Partial makes properties optional — name could be undefined and needs narrowing",
      "toUpperCase does not work with Partial",
      "Partial removes the string methods",
      "greet must take the User as Required<User>",
    ],
    correctOption: 0,
    hints: [
      "What is the type of update.name with Partial<User>?",
      "string | undefined — because name? is optional.",
      "Check with if (update.name) or use update.name ?? 'Guest'.",
    ],
    fixedCode: [
      "function greet(update: Partial<User>): string {",
      "  return `Hello ${(update.name ?? 'Guest').toUpperCase()}`;",
      "}",
    ].join("\n"),
    explanation:
      "Partial<T> makes all properties optional: name?: string. " +
      "This means name has the type string | undefined. " +
      "You must use narrowing (if-check, ??, !) before calling " +
      "string methods like toUpperCase().",
    concept: "partial-optional-undefined",
    difficulty: 2,
  },
];