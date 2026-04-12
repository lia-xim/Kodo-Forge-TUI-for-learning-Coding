/**
 * Lesson 07 — Quiz Data: Union & Intersection Types
 *
 * 15 questions on | operator, Type Guards, Discriminated Unions,
 * & operator, Union vs Intersection, practical patterns.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "07";
export const lessonTitle = "Union & Intersection Types";

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const questions: QuizQuestion[] = [
  // --- Question 1: Union Basics ---
  {
    question: "Which operations are allowed on `string | number`?",
    options: [
      "All string methods AND all number methods",
      "Only operations that BOTH types share",
      "No operations — you must narrow first",
      "Only typeof checks",
    ],
    correct: 1,
    explanation:
      "With a union type, TypeScript only allows operations that are safe for ALL " +
      "members of the union. toString() works, but toUpperCase() does not — " +
      "because number has no toUpperCase(). You must narrow first.",
  },

  // --- Question 2: typeof Narrowing ---
  {
    question: "What is the type of `x` after `if (typeof x === 'string')`?",
    code: "function f(x: string | number) {\n  if (typeof x === 'string') {\n    // x is ???\n  }\n}",
    options: [
      "string",
      "string | number",
      "unknown",
      "any",
    ],
    correct: 0,
    explanation:
      "TypeScript's Control Flow Analysis narrows the type automatically. " +
      "After typeof x === 'string', TypeScript knows that x MUST be a string. " +
      "This is called Type Narrowing.",
  },

  // --- Question 3: Discriminated Union ---
  {
    question: "What is a Discriminated Union?",
    options: [
      "A union of primitives with literal types",
      "A union that is automatically discriminated",
      "A union of objects with a common tag property that identifies the type",
      "A union with more than 3 members",
    ],
    correct: 2,
    explanation:
      "A Discriminated Union consists of object types that share a common " +
      "tag property (discriminant) — e.g. { type: 'circle', radius: number } | " +
      "{ type: 'rect', width: number }. The tag uniquely identifies which type is present.",
  },

  // --- Question 4: Exhaustive Check ---
  {
    question: "What happens when you use the never trick in the default case and add a new union member?",
    code: "function area(shape: Shape): number {\n  switch (shape.type) {\n    case 'circle': return ...;\n    case 'rect': return ...;\n    default: const _exhaustive: never = shape; // ???\n  }\n}",
    options: [
      "Nothing — the code continues to work",
      "Runtime error in the default case",
      "TypeScript ignores the never check",
      "Compile error: The new member is not assignable to 'never'",
    ],
    correct: 3,
    explanation:
      "When all cases are handled, shape in the default block is 'never'. " +
      "If you add a new member (e.g. 'triangle'), shape in the " +
      "default block is NO LONGER never — and the assignment to never fails. " +
      "This forces you to handle the new case. Compile-time safety net!",
  },

  // --- Question 5: Intersection Basics ---
  {
    question: "What does `{ name: string } & { age: number }` produce?",
    options: [
      "Either name OR age",
      "An object that MUST have BOTH name and age",
      "An empty object",
      "never — the types are incompatible",
    ],
    correct: 1,
    explanation:
      "Intersection types (&) combine all properties: The resulting object " +
      "must have ALL properties from BOTH types. It is the intersection of " +
      "VALUES — a value must satisfy both types simultaneously.",
  },

  // --- Question 6: Intersection Conflict ---
  {
    question: "What does `string & number` produce?",
    options: [
      "never — no value is both string AND number at the same time",
      "string | number",
      "any",
      "unknown",
    ],
    correct: 0,
    explanation:
      "No value can be string AND number at the same time. The intersection " +
      "of incompatible primitives yields 'never' — the empty type that " +
      "contains no values.",
  },

  // --- Question 7: in-Operator Narrowing ---
  {
    question: "What happens to the type after `if ('email' in user)`?",
    code: "type User = { name: string } | { name: string; email: string };\nfunction f(user: User) {\n  if ('email' in user) { /* user is ??? */ }\n}",
    options: [
      "User — unchanged",
      "{ email: string } — only the email property",
      "{ name: string; email: string } — the type with email",
      "never",
    ],
    correct: 2,
    explanation:
      "The 'in' operator narrows to the union member that has the " +
      "checked property. After 'email' in user, TypeScript knows " +
      "that user must be the type with email.",
  },

  // --- Question 8: TS 5.5 Inferred Type Predicates ---
  {
    question: "What is new with filter() in TypeScript 5.5+?",
    code: "const arr = [1, null, 2, null, 3];\nconst filtered = arr.filter(x => x !== null);",
    options: [
      "filter() did not exist before",
      "filter() now returns a Set",
      "Nothing — you never needed a type guard",
      "TypeScript automatically infers the type guard — filtered is number[]",
    ],
    correct: 3,
    explanation:
      "From TS 5.5 onwards, TypeScript automatically recognizes type predicates in filter callbacks. " +
      "x => x !== null is recognized as a type guard — filtered is number[] instead of " +
      "(number | null)[]. Previously you needed an explicit type guard.",
  },

  // --- Question 9: Union on Values vs Properties ---
  {
    question: "What is the difference between union on values and properties?",
    options: [
      "No difference",
      "Union makes the set of values LARGER but the accessible properties FEWER",
      "Union makes both larger",
      "Union makes both smaller",
    ],
    correct: 1,
    explanation:
      "Union types make the set of values LARGER (more values fit), " +
      "but the accessible properties FEWER (only shared properties). " +
      "Intersection is the opposite: FEWER values fit, but MORE properties " +
      "are accessible.",
  },

  // --- Question 10: extends vs & ---
  {
    question: "What is the main difference between `interface B extends A` and `type B = A & Extra`?",
    options: [
      "No difference",
      "extends only works with classes",
      "extends is faster for the compiler and reports conflicts as errors",
      "& is deprecated since TS 5.0",
    ],
    correct: 2,
    explanation:
      "extends is more efficient for the compiler and reports property conflicts " +
      "directly as errors. & silently produces 'never' properties on conflicts. " +
      "For object extension, extends is better; & is for ad-hoc combinations.",
  },

  // --- Question 11: Literal Union ---
  {
    question: "Which type is more precise and safer?",
    code: "type A = string;\ntype B = 'GET' | 'POST' | 'PUT' | 'DELETE';",
    options: [
      "A — accepts more values",
      "Both equal — TypeScript treats them identically",
      "A — less typing effort",
      "B — only valid HTTP methods allowed, autocomplete included",
    ],
    correct: 3,
    explanation:
      "Literal unions like 'GET' | 'POST' | 'PUT' | 'DELETE' are more precise " +
      "than string. They only allow valid values, provide IDE autocomplete, " +
      "and catch typos at compile time.",
  },

  // --- Question 12: Truthiness Narrowing ---
  {
    question: "What is the type of `name` after `if (name)`?",
    code: "function f(name: string | null | undefined) {\n  if (name) {\n    // name is ???\n  }\n}",
    options: [
      "string — null, undefined, and '' are falsy",
      "string | null | undefined",
      "string | null",
      "unknown",
    ],
    correct: 0,
    explanation:
      "Truthiness check removes all falsy values: null, undefined, '' (empty string), " +
      "0, and false. After if (name), name is of type string. " +
      "Note: The empty string '' is also filtered out!",
  },

  // --- Question 13: Result Pattern ---
  {
    question: "What is the Result Pattern?",
    code: "type Result<T> = { success: true; data: T } | { success: false; error: string };",
    options: [
      "A pattern for asynchronous operations",
      "A Discriminated Union that models success and failure in a type-safe way",
      "A design pattern from Java",
      "A pattern only for API responses",
    ],
    correct: 1,
    explanation:
      "The Result Pattern is a Discriminated Union with 'success' as the discriminant. " +
      "When success is true, data exists; when success is false, error exists. " +
      "TypeScript narrows the type automatically after the check — type-safe error handling.",
  },

  // --- Question 14: Distributive Behavior ---
  {
    question: "What does `(A | B) & C` produce with object types?",
    options: [
      "(A & C) | (B & C) — distributive",
      "A | B | C",
      "never",
      "(A | B) & C — remains unchanged",
    ],
    correct: 0,
    explanation:
      "Intersection distributes over union (distributive law): " +
      "(A | B) & C = (A & C) | (B & C). Each union member is " +
      "combined individually with C. This is a mathematical law " +
      "from set theory.",
  },

  // --- Question 15: State Machine Pattern ---
  {
    question: "Why are Discriminated Unions ideal for State Machines?",
    options: [
      "Because they are faster than classes",
      "Because State Machines always have exactly 2 states",
      "Because the compiler prevents invalid states and missing state handling",
      "Because TypeScript natively supports State Machines",
    ],
    correct: 2,
    explanation:
      "Discriminated Unions model states as separate types with " +
      "state-specific properties. The compiler prevents access to " +
      "properties that don't exist in the current state, and the " +
      "exhaustive check ensures that ALL states are handled.",
  },

  // ─── Additional Formats ────────────────────────────────────────────────────

  // --- Question 16: Short-Answer — Intersection Primitives ---
  {
    type: "short-answer",
    question: "What type results from `string & number`?",
    expectedAnswer: "never",
    acceptableAnswers: ["never"],
    explanation:
      "No value can be string AND number at the same time. The intersection " +
      "of incompatible primitives yields 'never' — the empty type with no values.",
  },

  // --- Question 17: Short-Answer — Union Operations ---
  {
    type: "short-answer",
    question: "Can you call `.toUpperCase()` directly on `string | number` — yes or no?",
    expectedAnswer: "no",
    acceptableAnswers: ["no", "No", "no, you need to narrow", "No, only after narrowing"],
    explanation:
      "With union types, only operations that are safe for ALL members are allowed. " +
      "toUpperCase() only exists on string, not on number. You must narrow first with " +
      "typeof.",
  },

  // --- Question 18: Short-Answer — Distributive Law ---
  {
    type: "short-answer",
    question: "How does `(A | B) & C` simplify with object types? Write the result.",
    expectedAnswer: "(A & C) | (B & C)",
    acceptableAnswers: ["(A & C) | (B & C)", "(A&C) | (B&C)", "(B & C) | (A & C)", "A & C | B & C"],
    explanation:
      "Intersection distributes over union — the distributive law from set theory. " +
      "Each union member is combined individually with C.",
  },

  // --- Question 19: Predict-Output — typeof Narrowing ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "function describe(x: string | number): string {\n  if (typeof x === 'string') {\n    return x.toUpperCase();\n  }\n  return x.toFixed(2);\n}\nconsole.log(describe(3.14159));",
    expectedAnswer: "3.14",
    acceptableAnswers: ["3.14", "\"3.14\"", "'3.14'"],
    explanation:
      "3.14159 is a number, so the code goes into the else branch. " +
      "toFixed(2) rounds to 2 decimal places and returns the string '3.14'. " +
      "TypeScript knows through typeof narrowing that x is a number in the else block.",
  },

  // --- Question 20: Predict-Output — Truthiness Narrowing ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "function greet(name: string | null): string {\n  if (name) {\n    return `Hallo ${name}`;\n  }\n  return 'Hallo Gast';\n}\nconsole.log(greet(''));",
    expectedAnswer: "Hallo Gast",
    acceptableAnswers: ["Hallo Gast", "'Hallo Gast'", "\"Hallo Gast\""],
    explanation:
      "The empty string '' is a falsy value in JavaScript. Although '' is technically a string, " +
      "if (name) evaluates to false. Truthiness narrowing filters ALL falsy values — " +
      "including the empty string. This is a common source of errors!",
  },

  // --- Question 21: Explain-Why — Union vs Intersection on Properties ---
  {
    type: "explain-why",
    question: "Why does a union type make the set of values LARGER, but the accessible properties FEWER?",
    modelAnswer:
      "A union A | B accepts any value that is either A OR B — so more values. " +
      "But TypeScript can only allow properties that safely exist on ALL members. " +
      "More possible values means fewer guarantees about shared properties. " +
      "Intersection is the opposite: fewer values fit, but more properties are guaranteed.",
    keyPoints: [
      "Union = more values, fewer shared properties",
      "Only shared operations are safe",
      "Intersection is the dual opposite",
    ],
  },
];

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "With unions, only shared operations are safe. TypeScript must ensure " +
      "for EVERY possible type in the union that the " +
      "operation exists.",
    commonMistake:
      "Many think a union gives access to ALL methods of both types. " +
      "The opposite is true — only the intersection of methods.",
  },
  1: {
    whyCorrect:
      "Control Flow Analysis tracks the type through if/else blocks. " +
      "typeof === 'string' narrows string | number to string.",
    commonMistake:
      "Some expect the type to remain unchanged. TypeScript " +
      "analyzes control flow and narrows automatically.",
  },
  2: {
    whyCorrect:
      "The tag property (e.g. type: 'circle') uniquely identifies " +
      "which type is present. TypeScript recognizes this and narrows automatically.",
    commonMistake:
      "Many confuse Discriminated Unions with regular unions. " +
      "The key is the shared tag property with literal types.",
  },
  3: {
    whyCorrect:
      "When all cases are handled, the type in the default block is 'never'. " +
      "A new member breaks this — compile-time warning.",
    commonMistake:
      "Some think the never check is optional. It is the most important " +
      "safety net with Discriminated Unions.",
  },
  4: {
    whyCorrect:
      "Intersection combines all properties. A value must satisfy ALL types " +
      "simultaneously — that is the intersection of values.",
    commonMistake:
      "The intuition of 'intersection' is misleading: it is the " +
      "intersection of VALUES, not properties. More properties " +
      "= fewer valid values.",
  },
  5: {
    whyCorrect:
      "No value can be string AND number at the same time. " +
      "The intersection of incompatible primitives yields never.",
    commonMistake:
      "Some expect string | number as the result. " +
      "& is not | — it is AND, not OR.",
  },
  6: {
    whyCorrect:
      "The in operator narrows to the union member that has the property. " +
      "TypeScript recognizes which members declare the property.",
    commonMistake:
      "Some confuse in-narrowing with typeof-narrowing. " +
      "in checks properties, typeof checks primitives.",
  },
  7: {
    whyCorrect:
      "TS 5.5 automatically recognizes type predicates in filter callbacks. " +
      "x => x !== null is recognized as (x): x is NonNullable<T>.",
    commonMistake:
      "Before TS 5.5 you needed an explicit type guard or a cast. " +
      "Many are not yet aware of the new feature.",
  },
  8: {
    whyCorrect:
      "Union = more values, fewer properties. " +
      "Intersection = fewer values, more properties. " +
      "That is the dual relationship.",
    commonMistake:
      "The intuition is reversed: 'union = unite = more properties'. " +
      "Wrong! Union unites the VALUES, not the properties.",
  },
  9: {
    whyCorrect:
      "extends is statically resolvable and reports conflicts. " +
      "& silently produces never properties on conflicts.",
    commonMistake:
      "Many think extends and & are interchangeable. " +
      "extends is better optimizable for the compiler.",
  },
  10: {
    whyCorrect:
      "Literal unions only allow valid values and provide " +
      "IDE autocomplete. Typos are caught at compile time.",
    commonMistake:
      "Some prefer string because it is 'simpler'. " +
      "But string also accepts typos — 'GETT' would be valid.",
  },
  11: {
    whyCorrect:
      "Truthiness removes null, undefined, '', 0, false, and NaN. " +
      "After if (name), name is guaranteed to be a non-empty string.",
    commonMistake:
      "Many forget that '' (empty string) is also falsy. " +
      "Truthiness narrowing filters MORE than just null/undefined.",
  },
  12: {
    whyCorrect:
      "The Result Pattern uses Discriminated Unions: success " +
      "as the tag determines whether data or error exists.",
    commonMistake:
      "Some confuse it with try/catch. The Result Pattern " +
      "is an alternative that models errors explicitly in the type system.",
  },
  13: {
    whyCorrect:
      "Intersection distributes over union — the distributive law. " +
      "Each union member is individually combined with the intersection type.",
    commonMistake:
      "Many expect (A | B) & C to simply stay 'flat'. " +
      "The distributive resolution is important for type analysis.",
  },
  14: {
    whyCorrect:
      "Discriminated Unions model states with state-specific " +
      "properties. The compiler prevents invalid accesses and " +
      "the exhaustive check enforces completeness.",
    commonMistake:
      "Some model State Machines with optional properties " +
      "instead of Discriminated Unions. This loses type safety.",
  },
};