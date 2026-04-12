/**
 * Lesson 03 — Quiz Data: Type Annotations & Type Inference
 *
 * Exports only the questions (without calling runQuiz),
 * so that the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "03";
export const lessonTitle = "Type Annotations & Type Inference";

export const questions: QuizQuestion[] = [

  // --- Question 1: Basic Inference ---
  {
    question: "What type does TypeScript infer for the variable `x`?",
    code: `const x = "hello";`,
    options: [
      'string',
      '"hello"',
      'any',
      'unknown',
    ],
    correct: 1,
    explanation:
      'With `const`, the literal type is preserved. Since "hello" is a string literal ' +
      'and the variable is const, the type is "hello" (not string).',
  },

  // --- Question 2: let vs const ---
  {
    question: "What type does the variable `y` have?",
    code: `let y = "hello";`,
    options: [
      '"hello"',
      'string',
      'any',
      'string | undefined',
    ],
    correct: 1,
    explanation:
      'With `let`, widening occurs: "hello" is widened to string ' +
      'because the variable could later hold a different string value.',
  },

  // --- Question 3: When to annotate? ---
  {
    question: "Which annotation is REDUNDANT here?",
    code: `function greet(name: string): void {\n  const msg: string = \`Hello \${name}\`;\n  console.log(msg);\n}`,
    options: [
      'name: string',
      ': void',
      'msg: string',
      'None -- all are necessary',
    ],
    correct: 2,
    explanation:
      '`msg: string` is redundant because TS infers the type from the template literal. ' +
      'Parameter annotations (name: string) are mandatory, and the return type ' +
      '(: void) is best practice for exported functions.',
  },

  // --- Question 4: Object Widening ---
  {
    question: "What type does `config.host` have?",
    code: `const config = {\n  host: "localhost",\n  port: 3000,\n};`,
    options: [
      '"localhost"',
      'string',
      'string | undefined',
      'any',
    ],
    correct: 1,
    explanation:
      'Although `config` is const, object properties are widened. ' +
      'Properties can be changed (config.host = "other"). ' +
      'Therefore the type is string, not "localhost".',
  },

  // --- Question 5: as const ---
  {
    question: "What does `as const` do to an array?",
    code: `const colors = ["red", "green", "blue"] as const;`,
    options: [
      'The array becomes string[]',
      'The array becomes a readonly tuple with literal types',
      'The array becomes immutable, but the types remain string',
      'Nothing -- as const only works with primitives',
    ],
    correct: 1,
    explanation:
      '`as const` makes the array readonly ["red", "green", "blue"]. ' +
      'Each element keeps its literal type, and the entire array is readonly.',
  },

  // --- Question 6: Contextual Typing ---
  {
    question: "Why does `n` NOT need to be annotated here?",
    code: `const nums = [1, 2, 3];\nconst doubled = nums.map(n => n * 2);`,
    options: [
      'Because `n` is automatically `any`',
      'Because TypeScript infers the type from the array element (Contextual Typing)',
      'Because arrow functions do not need annotations',
      'Because `n` is always number in JavaScript',
    ],
    correct: 1,
    explanation:
      'TypeScript knows the type of nums (number[]) and knows that the ' +
      '.map() callback receives the element type as a parameter. ' +
      'This is called Contextual Typing.',
  },

  // --- Question 7: Empty Arrays ---
  {
    question: "What type does `items` have?",
    code: `const items = [];`,
    options: [
      'never[]',
      'unknown[]',
      'any[]',
      'undefined[]',
    ],
    correct: 2,
    explanation:
      'An empty array without annotation is inferred as any[]. ' +
      'This is one of the few cases where inference leads to an unsafe type. ' +
      'Therefore: always annotate empty arrays!',
  },

  // --- Question 8: Return Type Inference ---
  {
    question: "What return type does TypeScript infer?",
    code: `function transform(x: number) {\n  if (x > 0) return x.toString();\n  if (x === 0) return null;\n  return undefined;\n}`,
    options: [
      'string',
      'string | null',
      'string | null | undefined',
      'string | void',
    ],
    correct: 2,
    explanation:
      'TS analyzes ALL return paths: toString() gives string, ' +
      'then null, then undefined. The return type is the union ' +
      'of all possible return values: string | null | undefined.',
  },

  // --- Question 9: Widening at Function Return ---
  {
    question: "How do you preserve the literal type in the return value?",
    code: `function getStatus() {\n  return "active";\n}\n// Return type: string (widened!)`,
    options: [
      'You cannot prevent widening at returns',
      'Use `return "active" as const`',
      'Write `const` before `function`',
      'Use `return "active" as literal`',
    ],
    correct: 1,
    explanation:
      '`as const` on the return value prevents widening. ' +
      'Alternatively, you can explicitly annotate the return type: ' +
      '`function getStatus(): "active" { ... }`.',
  },

  // --- Question 10: satisfies vs Annotation ---
  {
    question: "What is the key difference between annotation (`: Type`) and `satisfies Type`?",
    code: `type Colors = Record<string, string | number[]>;\n\nconst a: Colors = { red: "#f00" };\nconst b = { red: "#f00" } satisfies Colors;`,
    options: [
      'There is no difference -- satisfies is just shorter syntax',
      'satisfies validates the type, but keeps the specific inferred types',
      'satisfies is stricter and does not allow extra properties',
      'satisfies only works with Record types',
    ],
    correct: 1,
    explanation:
      'With annotation (`: Colors`), a.red becomes `string | number[]` (the full union). ' +
      'With `satisfies`, b.red becomes `string` (the specific inferred type). ' +
      'satisfies validates against the schema, but the inferred type remains precise.',
  },

  // --- Question 11: Control Flow Narrowing ---
  {
    question: "What type does `value` have at the marked line?",
    code: `function process(value: string | number | null) {\n  if (value === null) return;\n  if (typeof value === "string") {\n    // <-- Here: what type?\n    console.log(value);\n  }\n}`,
    options: [
      'string | number | null',
      'string | number',
      'string',
      'string | null',
    ],
    correct: 2,
    explanation:
      'TS narrows the type step by step: ' +
      '1. After `if (value === null) return`, null is excluded --> string | number. ' +
      '2. In `if (typeof value === "string")`, it is further narrowed --> string. ' +
      'Control Flow Analysis tracks each step and narrows the type accordingly.',
  },

  // --- Question 12: Contextual Typing Lost ---
  {
    question: "Why does `event` have the type `any` in the following code?",
    code: `const handler = (event) => {\n  console.log(event.clientX);\n};\ndocument.addEventListener("click", handler);`,
    options: [
      'Because addEventListener does not know the event type',
      'Because handler is defined separately and TS does not have the context',
      'Because arrow functions have no implicit type for parameters',
      'Because the event type is explicitly defined as any',
    ],
    correct: 1,
    explanation:
      'Contextual Typing only works when the callback is passed DIRECTLY as ' +
      'an argument. When handler is defined separately, ' +
      'TS has no context at the definition site. The connection ' +
      'to addEventListener is established later -- too late for inference.',
  },

  // --- Question 13: Object.keys() ---
  {
    question: "Why does `Object.keys({ a: 1, b: 2 })` return the type `string[]`?",
    options: [
      'Because Object.keys() always returns strings in JavaScript',
      'This is a bug in TypeScript',
      'Because JS objects can have more properties at runtime than TS knows about',
      'Because "a" and "b" are not valid literal types',
    ],
    correct: 2,
    explanation:
      'TypeScript is deliberately conservative here. An object of type ' +
      '{ a: number; b: number } could also have properties ' +
      'like "c" or "toString" at runtime (e.g., through inheritance or dynamic ' +
      'assignment). Therefore `("a" | "b")[]` would be technically unsound.',
  },

  // --- Question 14: as const + satisfies ---
  {
    question: "What is the type of `route` after this definition?",
    code: `const ROUTES = {\n  home: "/",\n  users: "/users",\n} as const satisfies Record<string, string>;\n\ntype Route = (typeof ROUTES)[keyof typeof ROUTES];`,
    options: [
      'string',
      '"/" | "/users"',
      'string[]',
      '{ home: string; users: string }',
    ],
    correct: 1,
    explanation:
      '`as const` makes the values into literal types ("/" and "/users"). ' +
      '`satisfies` validates against Record<string, string> without losing the literal types. ' +
      '`(typeof ROUTES)[keyof typeof ROUTES]` then extracts the ' +
      'union of values: "/" | "/users".',
  },

  // --- Question 15: Understanding Best Practices ---
  {
    question: "A function has a complex return type (union of 5 types). " +
              "What is the best strategy?",
    code: `export function parseInput(input: string) {\n  if (...) return null;\n  if (...) return undefined;\n  if (...) return true;\n  if (...) return Number(input);\n  return input;\n}\n// Return: string | number | boolean | null | undefined`,
    options: [
      'Do nothing -- inference is always correct',
      'Write as const on every return value',
      'Explicitly annotate the return type to make the intention clear',
      'Convert the function to an any function',
    ],
    correct: 2,
    explanation:
      'For complex functions with many return paths, an explicit ' +
      'return type is best practice. It documents the intention (not just the ' +
      'result), gives better error messages, and prevents an implementation ' +
      'change from accidentally changing the public type. ' +
      'This is the "Annotate at boundaries" principle in action.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // New Formats: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 16: Short-Answer — Widening ---
  {
    type: "short-answer",
    question: "What type does TypeScript infer for 'let x = 42'? (Give only the type name)",
    expectedAnswer: "number",
    acceptableAnswers: ["number"],
    explanation:
      "With let, type widening occurs: the literal value 42 is widened to the broader type 'number' " +
      "because the variable could later hold a different numeric value. " +
      "With 'const x = 42', the type would instead be the literal type '42'.",
  },

  // --- Question 17: Short-Answer — satisfies ---
  {
    type: "short-answer",
    question:
      "Which TypeScript keyword validates a value against a type, " +
      "but keeps the specific inferred type?",
    expectedAnswer: "satisfies",
    acceptableAnswers: ["satisfies"],
    explanation:
      "satisfies (since TS 4.9) validates that a value matches a type " +
      "without overwriting the inferred type. With ': Type' (annotation), " +
      "the type is set to the broader type. satisfies is ideal for " +
      "configuration objects: validation + precise inference.",
  },

  // --- Question 18: Predict-Output — Contextual Typing ---
  {
    type: "predict-output",
    question: "What type does TypeScript infer for the parameter 'n'? (Give only the type name)",
    code: `const nums: number[] = [1, 2, 3];\nnums.forEach(n => {\n  // What type does n have?\n});`,
    expectedAnswer: "number",
    acceptableAnswers: ["number"],
    explanation:
      "Contextual Typing: TypeScript knows the type of nums (number[]) and knows that " +
      "the forEach callback receives the element type as a parameter. " +
      "n is automatically inferred as 'number' — no annotation needed.",
  },

  // --- Question 19: Predict-Output — const vs let with Objects ---
  {
    type: "predict-output",
    question: "What type does config.mode have according to TypeScript? (Give the type name)",
    code: `const config = {\n  mode: "production",\n  port: 3000,\n};\n// typeof config.mode = ???`,
    expectedAnswer: "string",
    acceptableAnswers: ["string"],
    explanation:
      "Although config is declared with const, widening occurs for object properties. " +
      "config.mode could be changed later " +
      "(config.mode = 'development'), so TypeScript infers 'string', " +
      "not the literal type 'production'. With 'as const' it would be 'production'.",
  },

  // --- Question 20: Short-Answer — Empty Arrays ---
  {
    type: "short-answer",
    question: "What type does TypeScript infer for an empty array without annotation: 'const arr = []'?",
    expectedAnswer: "any[]",
    acceptableAnswers: ["any[]", "Array<any>"],
    explanation:
      "An empty array without annotation is inferred as any[] — one of the few cases " +
      "where inference leads to an unsafe type. TypeScript cannot know which " +
      "elements will be added later. Therefore: always annotate empty arrays!",
  },

  // --- Question 21: Explain-Why — Annotate at Boundaries ---
  {
    type: "explain-why",
    question:
      "Why do TypeScript experts recommend placing type annotations primarily at " +
      "'boundaries' (function parameters, return types of exports) " +
      "rather than everywhere?",
    modelAnswer:
      "At boundaries (exports, public APIs), annotations serve as a contract between modules. " +
      "They document the intention, give better error messages (the error points to " +
      "the function, not the caller), and prevent implementation changes from " +
      "accidentally changing the public type. Internally, inference is often more precise than " +
      "manual annotations and avoids redundant 'type noise'.",
    keyPoints: [
      "Boundary annotations act as a contract between modules",
      "Better error messages with return type annotations",
      "Protection against accidental API changes through refactoring",
      "Internal inference is often more precise and less error-prone",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Additional explanations for each question: why the correct answer
// is correct and which misconception is most common.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      'With `const`, the literal type is preserved: `"hello"`. ' +
      "TypeScript knows the value can never change, so the narrowest possible " +
      "type is the exact value itself.",
    commonMistake:
      "Most answer `string`. That would be correct for `let`. " +
      "With `const` and primitive values, the literal type is more precise " +
      "and TypeScript uses it automatically.",
  },
  1: {
    whyCorrect:
      'With `let`, widening occurs: `"hello"` is widened to `string`. ' +
      "Since the variable could later hold a different value, " +
      "TypeScript chooses the broader type.",
    commonMistake:
      'Some think the type is `"hello"` like with const. ' +
      "Widening with let is fundamental: TypeScript must assume that " +
      "any other string could be assigned.",
  },
  2: {
    whyCorrect:
      "`msg: string` is redundant because TypeScript automatically recognizes the type of " +
      "the template literal as `string`. Parameter annotations (name: string) are mandatory " +
      "and the return type (: void) is best practice for exported functions.",
    commonMistake:
      'Many think ALL annotations are necessary. This leads to "annotation noise": ' +
      "redundant annotations make the code unreadable and can even " +
      "worsen inference (e.g., loss of literal types).",
  },
  3: {
    whyCorrect:
      "Although `config` is const, properties can be changed " +
      '(`config.host = "other"` would be allowed). Therefore TypeScript ' +
      'widens the type to `string`, not to the literal `"localhost"`.',
    commonMistake:
      'Almost everyone expects `"localhost"` (literal type). ' +
      "The const only protects the variable (no `config = ...`), " +
      "not the properties. Solution: `as const` on the object.",
  },
  4: {
    whyCorrect:
      "`as const` makes the array a readonly tuple with literal types: " +
      '`readonly ["red", "green", "blue"]`. Each element keeps its ' +
      "exact string value as type, and the array is immutable.",
    commonMistake:
      "Some think `as const` only makes things readonly. The preservation of literal types " +
      "and tuple conversion are the actual main benefits of `as const`.",
  },
  5: {
    whyCorrect:
      "Contextual Typing: TypeScript knows the type of `nums` (`number[]`) and knows that " +
      "the .map() callback receives a `number` as parameter. " +
      "The annotation `(n: number)` would be correct but redundant.",
    commonMistake:
      "Some think arrow functions always have `any` as an implicit parameter type. " +
      "That is only true without context. With array methods, the array type provides the context.",
  },
  6: {
    whyCorrect:
      "An empty array without annotation is inferred as `any[]`. " +
      "TypeScript cannot know which elements will be added later. " +
      "This is one of the few cases where inference leads to an unsafe type.",
    commonMistake:
      "Many expect `never[]` (logical: empty array, no elements). " +
      "TypeScript pragmatically chooses `any[]` because a `never[]` would be useless — " +
      "you could never add anything.",
  },
  7: {
    whyCorrect:
      "TypeScript analyzes ALL return paths and forms the union of all possible " +
      "return values: `toString()` gives `string`, the second path `null`, the third " +
      "`undefined`. Result: `string | null | undefined`.",
    commonMistake:
      "Some forget `undefined` — because `return undefined` is explicit, " +
      "it seems like a special case. But TypeScript treats it like any " +
      "other return value and adds it to the union.",
  },
  8: {
    whyCorrect:
      "`as const` on the return value prevents widening. " +
      '`return "active" as const` returns the type `"active"`, not `string`. ' +
      'Alternative: explicit return type `function getStatus(): "active"`.',
    commonMistake:
      "Many try to write `const` before the function. " +
      "`const function` is not valid syntax — `as const` must be on the value.",
  },
  9: {
    whyCorrect:
      "With annotation (`: Colors`), `a.red` becomes the full union type `string | number[]`. " +
      "With `satisfies`, `b.red` becomes the specific type `string`. " +
      "satisfies validates the type but keeps the precise inference.",
    commonMistake:
      "Many consider `satisfies` a pure syntactic variant of annotation. " +
      "The core difference: annotation OVERWRITES the type, " +
      "satisfies VALIDATES against the type and keeps the inferred type.",
  },
  10: {
    whyCorrect:
      'Control Flow Analysis: After `if (value === null) return`, null is excluded. ' +
      'In `if (typeof value === "string")`, it is further narrowed to `string`. ' +
      "TypeScript tracks every control flow step precisely.",
    commonMistake:
      'Some think TypeScript "forgets" earlier checks. ' +
      "Control Flow Analysis tracks ALL branches correctly — " +
      "even across multiple if-statements and return-statements.",
  },
  11: {
    whyCorrect:
      "Contextual Typing only works with DIRECT passing as an argument. " +
      "When `handler` is defined beforehand, TypeScript has no context at the " +
      "definition site — the connection is established too late.",
    commonMistake:
      '"TypeScript tracks the data flow." ' +
      "That is true for values (Control Flow), but for Contextual Typing " +
      "the context must be present at the DEFINITION SITE.",
  },
  12: {
    whyCorrect:
      "TypeScript is deliberately conservative: an object of type " +
      "`{ a: number; b: number }` could have additional properties at runtime " +
      '(inheritance, dynamic assignment). `("a" | "b")[]` would be technically unsound.',
    commonMistake:
      "Many consider it a bug. It is a deliberate design decision for type safety — " +
      "TypeScript prefers conservative, correct types over practical but potentially incorrect ones.",
  },
  13: {
    whyCorrect:
      "`as const` makes the values into literal types. `satisfies` validates the structure " +
      "without losing the literal types. `(typeof ROUTES)[keyof typeof ROUTES]` " +
      'then extracts the union of values: `"/" | "/users"`.',
    commonMistake:
      "Many know either `as const` or `satisfies`, but not the combination. " +
      "`as const satisfies X` is the most powerful pattern: " +
      "literal types + validation + readonly — all in one.",
  },
  14: {
    whyCorrect:
      "For complex functions with many return paths, an explicit return type documents " +
      "the intention. It gives better error messages (the error is IN " +
      "the function, not at the caller) and prevents accidental changes.",
    commonMistake:
      'Two extreme positions: "always annotate" (too much noise) or ' +
      '"never annotate" (API instability). The golden mean: ' +
      "annotate at boundaries (exports), trust inference internally.",
  },
};