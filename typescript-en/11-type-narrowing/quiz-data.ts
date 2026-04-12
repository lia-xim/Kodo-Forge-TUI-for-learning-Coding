/**
 * Lesson 11 — Quiz Data: Type Narrowing
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "11";
export const lessonTitle = "Type Narrowing";

export const questions: QuizQuestion[] = [
  // --- Question 1: Basic Concept ---
  {
    question: "What is Type Narrowing in TypeScript?",
    options: [
      "Converting a type to another using 'as'",
      "Narrowing a type within a code block through checks",
      "Creating new types from existing ones",
      "Removing types at runtime (Type Erasure)",
    ],
    correct: 1,
    explanation:
      "Type Narrowing is the process by which TypeScript narrows the type of a variable " +
      "within a code block — based on runtime checks like " +
      "typeof, instanceof, or equality. It is not type casting (as).",
  },

  // --- Question 2: typeof Results ---
  {
    question: "What value does typeof null return?",
    options: [
      '"null"',
      '"undefined"',
      '"object"',
      '"boolean"',
    ],
    correct: 2,
    explanation:
      'typeof null returns "object" — a famously notorious bug from ' +
      "JavaScript 1.0 (1995). TypeScript accounts for this: after " +
      'typeof x === "object" the type is object | null, not just object.',
  },

  // --- Question 3: typeof Narrowing ---
  {
    question: "What type does 'wert' have in the else branch?",
    options: [
      "string | number",
      "string",
      "never",
      "number",
    ],
    correct: 3,
    explanation:
      "In the if branch, string is handled (typeof === 'string'). " +
      "In the else branch, only number remains — TypeScript eliminates " +
      "string from the union type.",
    code:
      "function f(wert: string | number) {\n" +
      "  if (typeof wert === 'string') {\n" +
      "    // wert: string\n" +
      "  } else {\n" +
      "    // wert: ???\n" +
      "  }\n" +
      "}",
  },

  // --- Question 4: instanceof ---
  {
    question: "Why doesn't instanceof work with interfaces?",
    options: [
      "Interfaces have no prototype — they only exist at compile time",
      "instanceof only works with primitive types",
      "Interfaces cannot be used in instanceof expressions (syntax error)",
      "instanceof only checks the typeof value",
    ],
    correct: 0,
    explanation:
      "Interfaces are removed during compilation (Type Erasure). " +
      "At runtime there is no interface object that instanceof " +
      "could check against. instanceof requires a class with a prototype chain.",
  },

  // --- Question 5: in Operator ---
  {
    question: "What is the type of 'form' after the in-check?",
    options: [
      "Kreis",
      "Kreis | Rechteck",
      "Rechteck",
      "object",
    ],
    correct: 0,
    explanation:
      'The in operator checks whether "radius" exists on the object. ' +
      "Only Kreis has a radius property, so TypeScript narrows to Kreis.",
    code:
      "interface Kreis { radius: number }\n" +
      "interface Rechteck { breite: number; hoehe: number }\n" +
      "type Form = Kreis | Rechteck;\n\n" +
      "function f(form: Form) {\n" +
      '  if ("radius" in form) {\n' +
      "    // form: ???\n" +
      "  }\n" +
      "}",
  },

  // --- Question 6: Equality Narrowing ---
  {
    question: "What happens with 'if (a === b)' when a: string | number and b: string | boolean?",
    options: [
      "Both become unknown",
      "Both become string (only shared type)",
      "Only a is narrowed",
      "TypeScript reports an error",
    ],
    correct: 1,
    explanation:
      "With ===, TypeScript analyzes which types can overlap on both sides. " +
      "string is the only shared type, " +
      "so BOTH sides are narrowed to string.",
  },

  // --- Question 7: Truthiness Trap ---
  {
    question: "Which valid port number is incorrectly excluded by 'if (port)'?",
    options: [
      "0",
      "1",
      "80",
      "None — all numbers are truthy",
    ],
    correct: 0,
    explanation:
      "0 is falsy in JavaScript! 'if (port)' excludes port 0, " +
      "even though 0 is a valid port (OS selects a free port). " +
      "Use 'if (port !== null && port !== undefined)' or 'port ?? 3000'.",
    code: "function start(port: number | null) {\n  if (port) {\n    listen(port);\n  }\n}",
  },

  // --- Question 8: != null ---
  {
    question: "What does 'x != null' check in TypeScript?",
    options: [
      "Only whether x is not null",
      "Whether x is neither null NOR undefined",
      "Whether x is truthy",
      "Whether x is an object",
    ],
    correct: 1,
    explanation:
      "Loose equality (==) treats null and undefined as equal: " +
      "null == undefined is true. Therefore 'x != null' checks for BOTH. " +
      "This is one of the few good use cases for ==.",
  },

  // --- Question 9: Type Predicate ---
  {
    question: "What does the return type 'x is string' mean?",
    options: [
      "The function returns a string",
      "The function throws when x is not a string",
      "When the function returns true, x is a string",
      "x is converted to string at runtime",
    ],
    correct: 2,
    explanation:
      "A Type Predicate (parameter is Type) tells TypeScript: " +
      "'If this function returns true, parameter has type Type.' " +
      "TypeScript trusts you — it does not verify whether your logic is correct.",
  },

  // --- Question 10: Assertion Function ---
  {
    question: "What is the difference between 'x is string' and 'asserts x is string'?",
    options: [
      "No difference — both are type guards",
      "'asserts' is deprecated since TS 5.0",
      "'is' only works with typeof, 'asserts' with everything",
      "'is' returns boolean, 'asserts' throws an error or returns void",
    ],
    correct: 3,
    explanation:
      "Type guards (is) return boolean and are used in if conditions. " +
      "Assertion functions (asserts) return void or throw an error. " +
      "The advantage: asserts narrows the entire remaining scope, not just an if block.",
  },

  // --- Question 11: TS 5.5 Inferred Type Predicates ---
  {
    question: "What is the type of 'result' in this code (TS 5.5+)?",
    options: [
      "(string | null)[]",
      "string[]",
      "(string | undefined)[]",
      "unknown[]",
    ],
    correct: 1,
    explanation:
      "Starting with TypeScript 5.5, the compiler automatically recognizes that " +
      "filter(x => x !== null) is a type predicate. The resulting type " +
      "is string[] — null is automatically removed. Previously it was " +
      "(string | null)[] and you had to cast manually.",
    code:
      "const items: (string | null)[] = ['a', null, 'b'];\n" +
      "const result = items.filter(x => x !== null);\n" +
      "// Typ von result in TS 5.5+?",
  },

  // --- Question 12: never and Exhaustive Checks ---
  {
    question: "What happens when you add a new value to the union but no case?",
    options: [
      "No error — the default catches everything",
      "Runtime error for the new value",
      "Compile error: the new value is not assignable to 'never'",
      "TypeScript ignores the new value",
    ],
    correct: 2,
    explanation:
      "When a new value is added to the union and no case exists for it, " +
      "the variable in the default does NOT have type never — but the new value instead. " +
      "The assignment to never fails, and TypeScript reports the error " +
      "with the exact type that is missing.",
    code:
      "type T = 'a' | 'b' | 'c';\n" +
      "function f(x: T) {\n" +
      "  switch (x) {\n" +
      "    case 'a': return 1;\n" +
      "    case 'b': return 2;\n" +
      "    // case 'c' fehlt!\n" +
      "    default: const _: never = x; // Fehler?\n" +
      "  }\n" +
      "}",
  },

  // --- Question 13: assertNever ---
  {
    question: "Why is assertNever better than an empty default branch?",
    options: [
      "assertNever provides compile-time protection AND runtime protection",
      "assertNever is faster",
      "assertNever is the only way to do exhaustive checks",
      "assertNever is enforced by ESLint",
    ],
    correct: 0,
    explanation:
      "assertNever provides TWO safety nets: (1) a compile error when a " +
      "case is missing from the union, (2) a runtime error when an unexpected value " +
      "(e.g. from an API) comes through. An empty default provides neither.",
  },

  // --- Question 14: Control Flow Analysis ---
  {
    question: "What type does 'x' have after the return statement?",
    options: [
      "string | null",
      "null",
      "never",
      "string",
    ],
    correct: 3,
    explanation:
      "After the early return (if x === null), TypeScript knows: if we " +
      "continue in the code, x cannot be null. So: string. " +
      "This is 'Narrowing by Elimination' — the basis of CFA.",
    code:
      "function f(x: string | null) {\n" +
      "  if (x === null) return;\n" +
      "  // x hat hier welchen Typ?\n" +
      "}",
  },

  // --- Question 15: Narrowing vs. as ---
  {
    question: "What is the fundamental difference between Narrowing and 'as' (Type Assertion)?",
    options: [
      "Narrowing is slower because it performs runtime checks",
      "as only works with primitive types",
      "Narrowing is proof (runtime check), as is a promise (no check)",
      "Narrowing only works in if statements",
    ],
    correct: 2,
    explanation:
      "Narrowing performs a real runtime check and PROVES the type to the compiler. " +
      "'as' is a promise to the compiler without a runtime check. " +
      "If the promise is wrong, the code crashes at runtime. " +
      "Narrowing can never be wrong — it is always safe.",
  },

  // ─── Additional Question Formats ────────────────────────────────────────────

  // --- Question 16: Short-Answer ---
  {
    type: "short-answer",
    question: "Which operator checks whether a property exists on an object and thus triggers narrowing?",
    expectedAnswer: "in",
    acceptableAnswers: ["in", "in operator", "the in operator"],
    explanation:
      "The in operator checks whether a property exists on an object. " +
      "TypeScript uses this for narrowing: if 'radius' in form, " +
      "then form is a Kreis (provided only Kreis has that property).",
  },

  // --- Question 17: Short-Answer ---
  {
    type: "short-answer",
    question: "What is the special type in TypeScript that represents 'no possible value' and is used for exhaustive checks?",
    expectedAnswer: "never",
    acceptableAnswers: ["never", "never type", "the never type"],
    explanation:
      "never is the bottom type — it has no possible values. " +
      "When all cases in a switch are handled, only never remains in the default. " +
      "That is why assertNever works as an exhaustive check.",
  },

  // --- Question 18: Short-Answer ---
  {
    type: "short-answer",
    question: "What return type does an Assertion Function have (e.g. assertIsString)?",
    expectedAnswer: "void",
    acceptableAnswers: ["void", "asserts x is string", "asserts", "void (or throws)"],
    explanation:
      "Assertion functions return void or throw an error. " +
      "The return type is 'asserts x is Type'. Unlike type guards " +
      "(which return boolean) they narrow the entire remaining scope.",
  },

  // --- Question 19: Predict-Output ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "function check(x: string | number | boolean) {\n  if (typeof x === 'string') {\n    console.log('A');\n  } else if (typeof x === 'number') {\n    console.log('B');\n  } else {\n    console.log(typeof x);\n  }\n}\ncheck(true);",
    expectedAnswer: "boolean",
    acceptableAnswers: ["boolean", "'boolean'", "\"boolean\""],
    explanation:
      "The first if handles string, the second number. " +
      "In the else only boolean remains. typeof true returns 'boolean'. " +
      "This is cumulative narrowing — TypeScript eliminates step by step.",
  },

  // --- Question 20: Predict-Output ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "const items: (string | null)[] = ['a', null, 'b', null, 'c'];\nconst filtered = items.filter(x => x !== null);\nconsole.log(filtered.length);",
    expectedAnswer: "3",
    acceptableAnswers: ["3"],
    explanation:
      "filter(x => x !== null) removes the two null values. " +
      "'a', 'b', and 'c' remain — so length 3. " +
      "From TS 5.5 the compiler also recognizes the type as string[] (Inferred Type Predicates).",
  },

  // --- Question 21: Explain-Why ---
  {
    type: "explain-why",
    question: "Why is narrowing with typeof a particular challenge for null values? What should you keep in mind?",
    modelAnswer:
      "typeof null returns 'object' — a historical bug from JavaScript 1.0. " +
      "After typeof x === 'object' the type is therefore object | null, not just object. " +
      "You always need an additional null check: if (x !== null && typeof x === 'object').",
    keyPoints: [
      "typeof null === 'object' (historical bug)",
      "After typeof check, null remains in the type",
      "Additional null check required",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Narrowing narrows a union type within a block. TypeScript's " +
      "Control Flow Analysis recognizes typeof, instanceof, in, === and " +
      "other checks and adjusts the type automatically.",
    commonMistake:
      "Many confuse narrowing with type assertions (as). " +
      "as is not narrowing — it skips the check.",
  },
  1: {
    whyCorrect:
      'typeof null returns "object" — a historical bug. ' +
      "TypeScript accounts for this and narrows after typeof === 'object' " +
      "to object | null, not just object.",
    commonMistake:
      "Many forget the null check after typeof === 'object' and " +
      "access properties, which crashes on null.",
  },
  2: {
    whyCorrect:
      "TypeScript eliminates string from the union (it was handled in the if). " +
      "In the else only number remains. This is cumulative narrowing.",
    commonMistake:
      "Some think the type in the else is still string | number. " +
      "But TypeScript remembers what was already handled in the if.",
  },
  3: {
    whyCorrect:
      "Interfaces are removed by type erasure. At runtime there is " +
      "no interface object. instanceof requires a class with a prototype.",
    commonMistake:
      "Coming from Java/C#, many expect instanceof to work with " +
      "interfaces too. In TypeScript you must use the in " +
      "operator or custom type guards instead.",
  },
  4: {
    whyCorrect:
      "The in operator checks whether a property exists. Only Kreis has " +
      "radius, so TypeScript narrows the type to Kreis.",
    commonMistake:
      "Some think in checks the value of the property. It only checks " +
      "EXISTENCE — even undefined properties are found.",
  },
  5: {
    whyCorrect:
      "With ===, TypeScript analyzes the intersection of types on both " +
      "sides. The only type that appears in both string | number and " +
      "string | boolean is string.",
    commonMistake:
      "Many think only one side is narrowed. In fact " +
      "BOTH sides are constrained to the shared type.",
  },
  6: {
    whyCorrect:
      "0 is falsy in JavaScript. if (port) excludes 0, even though " +
      "port 0 is valid. Use port != null or port ?? 3000.",
    commonMistake:
      "The truthiness trap is one of the most common bugs. " +
      "Many use if (x) as a shorthand for null checks, " +
      "forgetting that 0, '', and false are also falsy.",
  },
  7: {
    whyCorrect:
      "In JavaScript null == undefined is true (loose equality). " +
      "x != null therefore checks for both null and undefined.",
    commonMistake:
      "Some think != null only checks for null. It checks for both " +
      "due to the special rule of == for null and undefined.",
  },
  8: {
    whyCorrect:
      "A type predicate is a contract: 'If true, then x is of type T.' " +
      "TypeScript trusts the contract and narrows accordingly.",
    commonMistake:
      "Many think TypeScript CHECKS whether the type guard is correct. " +
      "It does NOT — you are responsible for correctness.",
  },
  9: {
    whyCorrect:
      "'is' returns boolean (if condition). 'asserts' returns void " +
      "or throws (precondition). asserts narrows the entire scope.",
    commonMistake:
      "Many get confused about when to use which. is: when the caller " +
      "should decide. asserts: when the error case should be an error.",
  },
  10: {
    whyCorrect:
      "TS 5.5 automatically recognizes filter(x => x !== null) as a type predicate. " +
      "Previously you had to manually write (x): x is string => x !== null.",
    commonMistake:
      "Some think this always worked. Before TS 5.5 the " +
      "type after filter was still (string | null)[] — a frequent pain point.",
  },
  11: {
    whyCorrect:
      "When a case is missing, the variable in the default is not never, but " +
      "the missing type. The assignment to never fails — compile error.",
    commonMistake:
      "Some think assertNever only fires at runtime. The main benefit " +
      "is the COMPILE error — it shows exactly which case is missing.",
  },
  12: {
    whyCorrect:
      "assertNever provides compile-time protection (missing case) AND runtime protection " +
      "(unexpected value from API). Double safety net.",
    commonMistake:
      "Some simply omit the default branch. That gives no " +
      "compile error for missing cases and no runtime protection.",
  },
  13: {
    whyCorrect:
      "Early return eliminates null from the union. After that x can no " +
      "longer be null — TypeScript's CFA recognizes this automatically.",
    commonMistake:
      "Some think you need to check again after the return. " +
      "TypeScript remembers: if we get here, null was already eliminated.",
  },
  14: {
    whyCorrect:
      "Narrowing performs a runtime check and proves the type. " +
      "as skips the check — if it is wrong, it crashes.",
    commonMistake:
      "Many use as out of convenience instead of narrowing. " +
      "That is like a promise without proof — dangerous.",
  },
};