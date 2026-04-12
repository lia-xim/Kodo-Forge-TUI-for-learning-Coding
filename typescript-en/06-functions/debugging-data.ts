/**
 * Lesson 06 — Debugging Challenges: Functions
 *
 * 5 challenges on overloads, void callbacks, this loss,
 * type guards, and destructuring typing.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: Overload Ordering ────────────────────────────────
  {
    id: "L06-D1",
    title: "Overload ordering leads to wrong type",
    buggyCode: [
      "function process(value: string | number): number;",
      "function process(value: string): string;",
      "function process(value: string | number): string | number {",
      "  if (typeof value === 'string') return value.toUpperCase();",
      "  return value * 2;",
      "}",
      "",
      "const result = process('hello');",
      "// result has type: number — but it's a string!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 1,
    options: [
      "The broad overload comes BEFORE the specific one — wrong order",
      "The implementation signature is incorrectly typed",
      "process needs a third overload for number",
      "typeof check is not reliable",
    ],
    correctOption: 0,
    hints: [
      "In what order does TypeScript check the overloads?",
      "TypeScript checks from top to bottom and takes the FIRST match.",
      "'string' matches 'string | number' — the broad overload matches first. " +
        "Solution: Put specific overloads FIRST.",
    ],
    fixedCode: [
      "function process(value: string): string;",
      "function process(value: string | number): number;",
      "function process(value: string | number): string | number {",
      "  if (typeof value === 'string') return value.toUpperCase();",
      "  return value * 2;",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript checks overloads from top to bottom. The broad overload " +
      "(string | number) matched 'hello' (a string) first. This caused " +
      "result to get type number instead of string. Rule: Always place specific overloads " +
      "BEFORE broader ones.",
    concept: "overload-ordering",
    difficulty: 3,
  },

  // ─── Challenge 2: this Loss in Event Handler ──────────────────────
  {
    id: "L06-D2",
    title: "this is lost when passed as an event handler",
    buggyCode: [
      "class Counter {",
      "  count = 0;",
      "",
      "  increment() {",
      "    this.count++;",
      "    console.log(`Count: ${this.count}`);",
      "  }",
      "}",
      "",
      "const counter = new Counter();",
      "const btn = document.querySelector('button');",
      "btn?.addEventListener('click', counter.increment);",
      "// Click -> 'Count: NaN' instead of 'Count: 1'",
    ].join("\n"),
    bugType: "runtime-error",
    bugLine: 12,
    options: [
      "counter.increment loses this when passed as a callback",
      "addEventListener expects no return value",
      "querySelector returns null",
      "count must be declared as static",
    ],
    correctOption: 0,
    hints: [
      "What is 'this' when a method is passed as a callback?",
      "When passing counter.increment, only the function is extracted — without a this binding.",
      "Solutions: Arrow function as wrapper, .bind(counter), or declare increment as an arrow property.",
    ],
    fixedCode: [
      "class Counter {",
      "  count = 0;",
      "",
      "  // Solution 1: Arrow Property (binds this automatically)",
      "  increment = () => {",
      "    this.count++;",
      "    console.log(`Count: ${this.count}`);",
      "  };",
      "}",
      "",
      "const counter = new Counter();",
      "const btn = document.querySelector('button');",
      "btn?.addEventListener('click', counter.increment);",
    ].join("\n"),
    explanation:
      "When passing counter.increment as a callback, only the function reference " +
      "is extracted — the this binding is lost. " +
      "When called by addEventListener, this is the button element, " +
      "not the Counter instance. Arrow functions as class properties " +
      "solve this problem because they bind this lexically.",
    concept: "this-binding-callbacks",
    difficulty: 3,
  },

  // ─── Challenge 3: Destructuring Type Wrong ────────────────────────────
  {
    id: "L06-D3",
    title: "Destructuring parameter incorrectly typed",
    buggyCode: [
      "function createUser({ name: string, age: number }) {",
      "  console.log(name, age);",
      "}",
      "",
      "createUser({ name: 'Max', age: 30 });",
    ].join("\n"),
    errorMessage:
      "Cannot find name 'name'. Cannot find name 'age'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "name: string is a RENAME, not a type — string becomes the variable",
      "Destructuring does not work in function parameters",
      "createUser needs a generic type",
      "name and age must be declared with let",
    ],
    correctOption: 0,
    hints: [
      "What does { key: value } mean in destructuring syntax?",
      "In destructuring, { name: string } is a RENAME: " +
        "the property 'name' is renamed to a variable called 'string'.",
      "Correct: { name, age }: { name: string; age: number }. " +
        "The type comes AFTER the entire destructuring pattern.",
    ],
    fixedCode: [
      "function createUser({ name, age }: { name: string; age: number }) {",
      "  console.log(name, age);",
      "}",
      "",
      "createUser({ name: 'Max', age: 30 });",
    ].join("\n"),
    explanation:
      "In JavaScript destructuring, { name: string } means the property " +
      "'name' is renamed to a variable called 'string' — it is NOT " +
      "a type annotation! The type must come AFTER the entire pattern: " +
      "{ name, age }: { name: string; age: number }.",
    concept: "destructuring-type-syntax",
    difficulty: 2,
  },

  // ─── Challenge 4: Type Guard Always Returns true ──────────────────────────
  {
    id: "L06-D4",
    title: "Faulty Type Guard — no runtime check",
    buggyCode: [
      "interface Admin {",
      "  name: string;",
      "  permissions: string[];",
      "}",
      "",
      "function isAdmin(user: unknown): user is Admin {",
      "  return typeof user === 'object' && user !== null;",
      "}",
      "",
      "const data: unknown = { name: 'Max' };",
      "if (isAdmin(data)) {",
      "  console.log(data.permissions.join(', '));",
      "  // Runtime error: Cannot read property 'join' of undefined",
      "}",
    ].join("\n"),
    bugType: "runtime-error",
    bugLine: 7,
    options: [
      "The type guard only checks if it's an object, not whether permissions exists",
      "isAdmin should be an assertion function",
      "unknown cannot be checked with typeof",
      "permissions must be declared as optional",
    ],
    correctOption: 0,
    hints: [
      "What does the type guard actually check?",
      "It only checks: Is it a non-null object? That is not enough for Admin.",
      "The guard must also check 'permissions' in value and verify the type " +
        "of permissions as an array.",
    ],
    fixedCode: [
      "function isAdmin(user: unknown): user is Admin {",
      "  return (",
      "    typeof user === 'object' &&",
      "    user !== null &&",
      "    'name' in user &&",
      "    'permissions' in user &&",
      "    Array.isArray((user as Admin).permissions)",
      "  );",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript does NOT check whether a type guard is correctly implemented. " +
      "It trusts the developer. The original guard only checks if " +
      "user is an object — but not whether it has the Admin properties. " +
      "A faulty guard leads to runtime errors that TypeScript cannot prevent.",
    concept: "type-guard-correctness",
    difficulty: 4,
  },

  // ─── Challenge 5: Default Parameter Position ──────────────────────────
  {
    id: "L06-D5",
    title: "Optional parameter before required parameter",
    buggyCode: [
      "function formatPrice(currency?: string, amount: number): string {",
      "  return `${amount} ${currency ?? 'EUR'}`;",
      "}",
      "",
      "formatPrice(9.99);",
      "// Expected: '9.99 EUR'",
    ].join("\n"),
    errorMessage:
      "A required parameter cannot follow an optional parameter.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "Optional parameters must come AFTER required parameters",
      "currency needs a default value instead of ?",
      "formatPrice must be written as an arrow function",
      "amount must also be optional",
    ],
    correctOption: 0,
    hints: [
      "In what order must optional and required parameters appear?",
      "JavaScript arguments are position-based. If an optional parameter " +
        "comes before a required one, you would have to pass undefined as a placeholder.",
      "Solution: Reverse the order or use an options object.",
    ],
    fixedCode: [
      "function formatPrice(amount: number, currency?: string): string {",
      "  return `${amount} ${currency ?? 'EUR'}`;",
      "}",
      "",
      "formatPrice(9.99); // '9.99 EUR'",
    ].join("\n"),
    explanation:
      "Optional parameters must come AFTER required parameters. JavaScript arguments " +
      "are position-based — if currency is optional and comes before amount, " +
      "you would have to write formatPrice(undefined, 9.99). TypeScript prevents " +
      "this anti-pattern. Alternative: options object.",
    concept: "parameter-ordering",
    difficulty: 2,
  },
];