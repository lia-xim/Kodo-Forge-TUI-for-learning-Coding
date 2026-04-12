/**
 * Lesson 02 -- Transfer Tasks: Primitive Types
 *
 * These tasks take the concepts from the Primitive Types lesson and apply
 * them in completely new contexts:
 *
 *  1. Correctly modeling monetary amounts (number pitfalls)
 *  2. Refactoring API data from any to unknown
 *  3. Input validation with type safety
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Modeling monetary amounts ──────────────────────────────────
  {
    id: "02-geldbetraege",
    title: "Correctly Modeling Monetary Amounts",
    prerequisiteLessons: [2],
    scenario:
      "You are working on an online shop. A customer complains that " +
      "their order costs 19.99 + 5.01 = 25.009999999999998 euros. " +
      "Another developer used 'number' everywhere for monetary amounts " +
      "and calculates in euros with decimal places.",
    task:
      "Model monetary amounts in a type-safe way in TypeScript.\n\n" +
      "1. Why is 'number' dangerous for money? (IEEE 754)\n" +
      "2. Create a type 'Cents' that represents monetary amounts as whole " +
      "   numbers in cents (1999 instead of 19.99)\n" +
      "3. Write a function 'addMoney' that adds two cent values\n" +
      "4. Write a function 'formatEuro' that formats cents as a euro string " +
      "   (e.g. 1999 -> '19,99 EUR')\n" +
      "5. Bonus: Could 'bigint' help here? When would you use it?",
    starterCode: [
      "// Your type for monetary amounts",
      "type Cents = ???;",
      "",
      "function addMoney(a: Cents, b: Cents): Cents {",
      "  // TODO",
      "}",
      "",
      "function formatEuro(cents: Cents): string {",
      "  // TODO: 1999 -> '19,99 EUR'",
      "}",
      "",
      "// Test:",
      "// addMoney(1999, 501)  should return 2500",
      "// formatEuro(2500)     should return '25,00 EUR'",
    ].join("\n"),
    solutionCode: [
      "// ═══ Why number is Dangerous for Money ═══",
      "// JavaScript uses IEEE 754 double-precision floats.",
      "// 0.1 + 0.2 === 0.30000000000000004  (not 0.3!)",
      "// 19.99 + 5.01 === 25.009999999999998 (not 25.00!)",
      "//",
      "// Solution: Always calculate in the smallest unit (cents).",
      "// Integers do not have this problem.",
      "",
      "// Branded Type: Prevents accidental confusion",
      "// with regular numbers",
      "type Cents = number & { readonly __brand: 'Cents' };",
      "",
      "// Helper to mark a number as Cents",
      "function asCents(value: number): Cents {",
      "  if (!Number.isInteger(value)) {",
      "    throw new Error('Cents must be integers: ' + value);",
      "  }",
      "  return value as Cents;",
      "}",
      "",
      "function addMoney(a: Cents, b: Cents): Cents {",
      "  return asCents(a + b);",
      "}",
      "",
      "function formatEuro(cents: Cents): string {",
      "  const euro = Math.floor(cents / 100);",
      "  const rest = Math.abs(cents % 100);",
      "  const restStr = rest < 10 ? '0' + rest : '' + rest;",
      "  return euro + ',' + restStr + ' EUR';",
      "}",
      "",
      "// ═══ Test ═══",
      "// const preis = asCents(1999);",
      "// const versand = asCents(501);",
      "// const total = addMoney(preis, versand); // 2500",
      "// formatEuro(total); // '25,00 EUR'",
      "",
      "// ═══ When bigint? ═══",
      "// For very large amounts (e.g. cryptocurrencies,",
      "// interbank transfers). number is safe up to",
      "// Number.MAX_SAFE_INTEGER (9007199254740991 cents =",
      "// approx. 90 trillion euros). For most apps, number is sufficient.",
    ].join("\n"),
    conceptsBridged: [
      "number / IEEE 754",
      "Branded Types",
      "bigint vs number",
      "Integer Arithmetic",
    ],
    hints: [
      "Think about IEEE 754: Why is 0.1 + 0.2 !== 0.3 in JavaScript? What consequence does this have for monetary amounts?",
      "If you calculate in cents (integers), you completely bypass the floating-point problem. 1999 cents instead of 19.99 euros.",
      "A 'Branded Type' (type Cents = number & { __brand: 'Cents' }) prevents you from accidentally treating regular numbers as Cents.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: API data any to unknown ──────────────────────────────────
  {
    id: "02-any-zu-unknown",
    title: "API Data: Refactoring from any to unknown",
    prerequisiteLessons: [2],
    scenario:
      "You are taking over a project where the fetch calls look like this:\n" +
      "  const data: any = await response.json();\n" +
      "  showUser(data.name, data.age);\n\n" +
      "Last week there was a bug: The API renamed the field 'name' to " +
      "'displayName'. Nobody noticed the error until " +
      "customers saw 'undefined' on their screen.",
    task:
      "Refactor the code from 'any' to 'unknown' and add " +
      "safe validation.\n\n" +
      "1. Why did 'any' hide the bug?\n" +
      "2. Write a function 'parseUser' that takes an unknown value " +
      "   and returns either a validated User or " +
      "   an error\n" +
      "3. Use type guards (typeof, 'in' operator) to check the structure " +
      "   at runtime\n" +
      "4. Explain why unknown is better here than any",
    starterCode: [
      "interface User {",
      "  displayName: string;",
      "  age: number;",
      "  email: string;",
      "}",
      "",
      "// BEFORE (unsafe):",
      "// const data: any = await response.json();",
      "// showUser(data.name, data.age); // Bug: name -> displayName",
      "",
      "// AFTER (safe):",
      "function parseUser(data: unknown): User {",
      "  // TODO: Validate that data is a User",
      "  // Throw an error if the structure does not match",
      "}",
    ].join("\n"),
    solutionCode: [
      "interface User {",
      "  displayName: string;",
      "  age: number;",
      "  email: string;",
      "}",
      "",
      "// ═══ Why any Hides the Bug ═══",
      "// 'any' completely disables the type system.",
      "// data.name -> no error, even though 'name' does not exist",
      "// data.wasAuchImmer -> no error, TypeScript checks nothing",
      "//",
      "// 'unknown', on the other hand, enforces a check BEFORE access.",
      "// You MUST prove that the data has the correct structure.",
      "",
      "function isObject(value: unknown): value is Record<string, unknown> {",
      "  return typeof value === 'object' && value !== null && !Array.isArray(value);",
      "}",
      "",
      "function parseUser(data: unknown): User {",
      "  if (!isObject(data)) {",
      "    throw new Error('User data must be an object, received: ' + typeof data);",
      "  }",
      "",
      "  if (typeof data.displayName !== 'string') {",
      "    throw new Error('displayName is missing or not a string');",
      "  }",
      "  if (typeof data.age !== 'number' || !Number.isFinite(data.age)) {",
      "    throw new Error('age is missing or not a valid number');",
      "  }",
      "  if (typeof data.email !== 'string') {",
      "    throw new Error('email is missing or not a string');",
      "  }",
      "",
      "  return {",
      "    displayName: data.displayName,",
      "    age: data.age,",
      "    email: data.email,",
      "  };",
      "}",
      "",
      "// ═══ Why unknown is Better ═══",
      "// 1. unknown enforces validation — no access without checking",
      "// 2. Errors are caught immediately, not only when customers see them",
      "// 3. The error messages say exactly WHAT is missing",
      "// 4. The compiler helps: data.name would give an error",
    ].join("\n"),
    conceptsBridged: [
      "any vs unknown",
      "Type Guards",
      "Runtime Validation",
      "typeof / in-Operator",
    ],
    hints: [
      "any disables the type system — you can access any field without errors. unknown, on the other hand, requires a check before every access.",
      "Before you can access fields, you must prove that it is an object (typeof === 'object' && !== null). Then you can check individual fields.",
      "Use typeof for primitives (string, number) and the 'in' operator or direct field checks for object properties.",
    ],
    difficulty: 3,
  },

  // ─── Task 3: Input validation ───────────────────────────────────────
  {
    id: "02-eingabe-validierung",
    title: "Form Validation with Type Narrowing",
    prerequisiteLessons: [2],
    scenario:
      "You are building a registration form. The inputs come as " +
      "strings from the input fields. Before saving the data, " +
      "you need to ensure: age is a valid number (16-120), " +
      "email contains an @, password has at least 8 characters. " +
      "Currently the app only returns 'Invalid input' — " +
      "no user knows what is wrong.",
    task:
      "Build a type-safe validation that gives specific error messages.\n\n" +
      "1. Define a result type: either success (with data) " +
      "   or failure (with error list)\n" +
      "2. Write a validate function that checks all fields\n" +
      "3. Use null/undefined correctly with strictNullChecks\n" +
      "4. Show how the caller can safely use the result " +
      "   (type narrowing on the result)",
    starterCode: [
      "// Define a result type: success or failure",
      "type ValidationResult = ???;",
      "",
      "interface RegistrationData {",
      "  username: string;",
      "  age: number;",
      "  email: string;",
      "}",
      "",
      "function validateRegistration(",
      "  username: string | null,",
      "  ageStr: string | null,",
      "  email: string | null,",
      "  password: string | null",
      "): ValidationResult {",
      "  // TODO: Validate all fields, collect all errors",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Discriminated Union for the Result ═══",
      "type ValidationResult =",
      "  | { success: true; data: RegistrationData }",
      "  | { success: false; errors: string[] };",
      "",
      "interface RegistrationData {",
      "  username: string;",
      "  age: number;",
      "  email: string;",
      "}",
      "",
      "function validateRegistration(",
      "  username: string | null,",
      "  ageStr: string | null,",
      "  email: string | null,",
      "  password: string | null",
      "): ValidationResult {",
      "  const errors: string[] = [];",
      "",
      "  // Username: not null, not empty",
      "  if (username === null || username === undefined || username.trim().length === 0) {",
      "    errors.push('Username must not be empty');",
      "  }",
      "",
      "  // Age: valid number between 16 and 120",
      "  let age: number | undefined;",
      "  if (ageStr === null || ageStr === undefined) {",
      "    errors.push('Age is required');",
      "  } else {",
      "    age = Number(ageStr);",
      "    if (Number.isNaN(age)) {",
      "      errors.push('Age must be a number');",
      "    } else if (age < 16 || age > 120) {",
      "      errors.push('Age must be between 16 and 120');",
      "    }",
      "  }",
      "",
      "  // Email: not null, must contain @",
      "  if (email === null || email === undefined) {",
      "    errors.push('Email is required');",
      "  } else if (!email.includes('@')) {",
      "    errors.push('Email must contain an @ symbol');",
      "  }",
      "",
      "  // Password: at least 8 characters",
      "  if (password === null || password === undefined) {",
      "    errors.push('Password is required');",
      "  } else if (password.length < 8) {",
      "    errors.push('Password must be at least 8 characters');",
      "  }",
      "",
      "  if (errors.length > 0) {",
      "    return { success: false, errors };",
      "  }",
      "",
      "  // TypeScript doesn't know yet that all values are present.",
      "  // But we know, because we caught all errors above.",
      "  return {",
      "    success: true,",
      "    data: {",
      "      username: username!.trim(),",
      "      age: age!,",
      "      email: email!,",
      "    },",
      "  };",
      "}",
      "",
      "// ═══ Usage with Type Narrowing ═══",
      "// const result = validateRegistration('Anna', '25', 'anna@mail.de', 'geheim123');",
      "// if (result.success) {",
      "//   // TypeScript knows: result.data exists",
      "//   console.log(result.data.username);",
      "// } else {",
      "//   // TypeScript knows: result.errors exists",
      "//   console.log(result.errors.join(', '));",
      "// }",
    ].join("\n"),
    conceptsBridged: [
      "null / undefined",
      "strictNullChecks",
      "Discriminated Unions",
      "Type Narrowing",
      "string | null Parameter",
    ],
    hints: [
      "Define the result as a Discriminated Union: { success: true, data: ... } | { success: false, errors: string[] }. The shared field 'success' allows safe narrowing.",
      "Each parameter is string | null. You must first check if the value is null before accessing string methods like .includes() or .trim().",
    ],
    difficulty: 3,
  },
];