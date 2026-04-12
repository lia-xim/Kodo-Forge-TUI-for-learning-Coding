/**
 * Lesson 07 — Debugging Challenges: Union & Intersection Types
 *
 * 5 challenges on typeof null, missing exhaustive check,
 * intersection conflicts, narrowing invalidation, in-operator.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L07-D1",
    title: "typeof null === 'object' — the JavaScript classic",
    buggyCode: [
      "function getLength(value: string | null): number {",
      "  if (typeof value === 'object') {",
      "    // value is safely an object here... or is it?",
      "    return 0; // null case",
      "  }",
      "  return value.length;",
      "}",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "typeof null === 'object' — null is incorrectly recognized as an object",
      "value.length does not work for strings",
      "The return type must be specified",
      "string has no typeof check",
    ],
    correctOption: 0,
    hints: [
      "What does typeof null return in JavaScript?",
      "typeof null === 'object' is a well-known JavaScript bug since 1995.",
      "Use value === null or value !== null instead of a typeof check.",
    ],
    fixedCode: [
      "function getLength(value: string | null): number {",
      "  if (value === null) {",
      "    return 0;",
      "  }",
      "  return value.length;",
      "}",
    ].join("\n"),
    explanation:
      "typeof null === 'object' is a notorious JavaScript bug. " +
      "The code enters the 'object' branch for null AND real objects. " +
      "Always use === null or !== null for null checks.",
    concept: "typeof-null-quirk",
    difficulty: 2,
  },

  {
    id: "L07-D2",
    title: "Missing exhaustive check — forgot a new union member",
    buggyCode: [
      "type Action =",
      "  | { type: 'increment' }",
      "  | { type: 'decrement' }",
      "  | { type: 'reset'; value: number };",
      "",
      "function reducer(state: number, action: Action): number {",
      "  switch (action.type) {",
      "    case 'increment': return state + 1;",
      "    case 'decrement': return state - 1;",
      "    // 'reset' forgotten!",
      "  }",
      "  return state; // fallback — but reset is never handled",
      "}",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 7,
    options: [
      "Without an exhaustive check, 'reset' is silently ignored",
      "The switch needs curly braces",
      "Action must be defined as an enum",
      "reducer must be async",
    ],
    correctOption: 0,
    hints: [
      "What happens when a new union member is added?",
      "Without an exhaustive check the code falls through to the fallback return.",
      "Add a default case with const _: never = action.",
    ],
    fixedCode: [
      "function reducer(state: number, action: Action): number {",
      "  switch (action.type) {",
      "    case 'increment': return state + 1;",
      "    case 'decrement': return state - 1;",
      "    case 'reset': return action.value;",
      "    default:",
      "      const _exhaustive: never = action;",
      "      return _exhaustive;",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "Without an exhaustive check (never in the default case), TypeScript does not notice " +
      "when a union member is left unhandled. 'reset' is silently " +
      "ignored. The never trick forces ALL cases to be handled.",
    concept: "exhaustive-check",
    difficulty: 3,
  },

  {
    id: "L07-D3",
    title: "Intersection conflict produces silent never",
    buggyCode: [
      "type Strict = { mode: 'strict'; level: number };",
      "type Loose = { mode: 'loose'; tolerance: number };",
      "type Config = Strict & Loose;",
      "",
      "const config: Config = {",
      "  mode: 'strict', // What is the type of mode?",
      "  level: 5,",
      "  tolerance: 0.1,",
      "};",
    ].join("\n"),
    errorMessage:
      "Type '\"strict\"' is not assignable to type 'never'.",
    bugType: "type-error",
    bugLine: 3,
    options: [
      "mode is 'strict' & 'loose' = never — no value can satisfy both literals at once",
      "Strict and Loose cannot be intersected",
      "Config needs a discriminator",
      "mode must be declared as optional",
    ],
    correctOption: 0,
    hints: [
      "What does 'strict' & 'loose' produce?",
      "Intersection of different literals = never. No value satisfies both.",
      "Use a union (Strict | Loose) instead of an intersection, or remove the mode conflict.",
    ],
    fixedCode: [
      "type Config = Strict | Loose;",
      "",
      "const config: Config = {",
      "  mode: 'strict',",
      "  level: 5,",
      "};",
    ].join("\n"),
    explanation:
      "Intersecting the literal types 'strict' & 'loose' produces never — " +
      "no value can simultaneously be 'strict' AND 'loose'. " +
      "TypeScript only reports this at the assignment, not at the type definition. " +
      "Use a union (|) instead of an intersection (&) for different variants.",
    concept: "intersection-literal-conflict",
    difficulty: 4,
  },

  {
    id: "L07-D4",
    title: "Narrowing is lost after a function call",
    buggyCode: [
      "let value: string | number = 'hello';",
      "",
      "function maybeChange() {",
      "  // Could change value...",
      "}",
      "",
      "if (typeof value === 'string') {",
      "  maybeChange();",
      "  console.log(value.toUpperCase()); // Error?",
      "}",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 9,
    options: [
      "TypeScript loses narrowing after a function call because the function could change value",
      "typeof does not work for let variables",
      "maybeChange must have a return type",
      "console.log changes the type",
    ],
    correctOption: 0,
    hints: [
      "What could maybeChange() do to value?",
      "Since value is declared with let, any function could change it.",
      "Solution: use const instead of let, or copy value into a local const variable.",
    ],
    fixedCode: [
      "let value: string | number = 'hello';",
      "",
      "function maybeChange() { /* ... */ }",
      "",
      "if (typeof value === 'string') {",
      "  const str = value; // Local copy retains the type",
      "  maybeChange();",
      "  console.log(str.toUpperCase()); // OK — str is const string",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript loses narrowing for let variables after " +
      "function calls, because the function could change the variable. " +
      "Solution: copy the value into a const variable or use const.",
    concept: "narrowing-invalidation",
    difficulty: 3,
  },

  {
    id: "L07-D5",
    title: "Discriminator uses string instead of a literal",
    buggyCode: [
      "interface Dog { kind: string; bark(): void; }",
      "interface Cat { kind: string; meow(): void; }",
      "type Animal = Dog | Cat;",
      "",
      "function handle(animal: Animal) {",
      "  if (animal.kind === 'dog') {",
      "    animal.bark(); // Error — why?",
      "  }",
      "}",
    ].join("\n"),
    errorMessage:
      "Property 'bark' does not exist on type 'Animal'.",
    bugType: "type-error",
    bugLine: 6,
    options: [
      "kind is string in both types — no unique discriminator for narrowing",
      "animal.bark() must be called with ?.",
      "Dog and Cat must be classes",
      "if statements do not work with unions",
    ],
    correctOption: 0,
    hints: [
      "What does a discriminated union need as its tag property?",
      "kind is 'string' in both interfaces — TypeScript cannot distinguish them.",
      "Change to kind: 'dog' and kind: 'cat' (literal types as discriminator).",
    ],
    fixedCode: [
      "interface Dog { kind: 'dog'; bark(): void; }",
      "interface Cat { kind: 'cat'; meow(): void; }",
      "type Animal = Dog | Cat;",
      "",
      "function handle(animal: Animal) {",
      "  if (animal.kind === 'dog') {",
      "    animal.bark(); // OK — TypeScript narrows to Dog",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "For discriminated unions the tag property MUST use literal types, " +
      "not string. kind: string can hold any value — TypeScript cannot " +
      "know whether 'dog' only appears in Dog. " +
      "With kind: 'dog' | kind: 'cat' TypeScript recognises the discriminator.",
    concept: "discriminated-union-literal-tag",
    difficulty: 3,
  },
];