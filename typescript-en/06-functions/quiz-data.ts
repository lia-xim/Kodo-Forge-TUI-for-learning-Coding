/**
 * Lesson 06 — Quiz Data: Functions
 *
 * 15 questions on parameter types, return types, overloads, callbacks,
 * this parameters, arrow vs function, type guards, assertion functions.
 *
 * Exports only the questions (without calling runQuiz),
 * so that the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "06";
export const lessonTitle = "Functions";

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const questions: QuizQuestion[] = [
  // --- Question 1: Return Type Inference ---
  {
    question: "Do you have to explicitly annotate the return type of a recursive function?",
    options: [
      "No, TypeScript infers it like any other function",
      "Yes, because TypeScript cannot derive the type from a circular reference",
      "Only when the function is exported",
      "Only when there is more than one recursive call",
    ],
    correct: 1,
    explanation:
      "For recursive functions, a circular problem arises: the return type " +
      "depends on the return value, which contains a call to the function itself. " +
      "TypeScript cannot resolve this circularity and requires an explicit annotation.",
  },

  // --- Question 2: void vs undefined ---
  {
    question: "What is the difference between `void` and `undefined` as a return type?",
    options: [
      "void means 'return value is irrelevant', undefined means 'explicitly returns undefined'",
      "No difference — both mean 'no return value'",
      "undefined is deprecated, void is the modern variant",
      "void is for callbacks, undefined for regular functions",
    ],
    correct: 0,
    explanation:
      "void says 'the return value is irrelevant' — especially important for callbacks, " +
      "where void callbacks are still allowed to return values. undefined is a concrete " +
      "value type. A variable of type void CANNOT be assigned to undefined.",
  },

  // --- Question 3: Optional Parameters ---
  {
    question: "What is the difference between `x?: string` and `x: string | undefined`?",
    options: [
      "No difference",
      "x?: string also accepts null",
      "With x?: string you can omit the argument, with x: string | undefined you must pass it",
      "x: string | undefined is only allowed in interfaces",
    ],
    correct: 2,
    explanation:
      "With x?: string the caller can omit the argument entirely: f(). " +
      "With x: string | undefined you MUST pass it: f(undefined). " +
      "Both make x internally string | undefined, but the call signature differs.",
  },

  // --- Question 4: Default Parameters ---
  {
    question: "What happens with `function f(x?: number = 42) {}`?",
    options: [
      "x has type number and default 42",
      "x has type number | undefined",
      "Compile error: a parameter cannot be both optional and have a default",
      "x has type 42 (literal type)",
    ],
    correct: 2,
    explanation:
      "A parameter cannot simultaneously have `?` (optional) and a default value. " +
      "A default value automatically makes the parameter optional — the `?` is redundant " +
      "and TypeScript forbids the combination.",
  },

  // --- Question 5: Rest Parameters ---
  {
    question: "What type does `args` have in `function log(...args: string[])`?",
    options: [
      "string",
      "...string[]",
      "Array<string> | string",
      "string[]",
    ],
    correct: 3,
    explanation:
      "Rest parameters collect all passed arguments into an array. " +
      "The type of args is string[] — a normal array. The spread syntax " +
      "(...) is part of the parameter declaration, not the type.",
  },

  // --- Question 6: Function Type Expression ---
  {
    question: "Do the parameter names in the function type have to match the implementation?",
    code: "type Formatter = (input: string) => string;\nconst shout: Formatter = (text) => text.toUpperCase();",
    options: [
      "Yes, 'text' must be called 'input'",
      "No, only the types must match, names don't matter",
      "Yes, except with arrow functions",
      "Only with exported functions",
    ],
    correct: 1,
    explanation:
      "Parameter names in function type expressions are only documentation — they do not " +
      "need to match the implementation. TypeScript only checks " +
      "type compatibility (parameter types and return type).",
  },

  // --- Question 7: Overload Signature ---
  {
    question: "Can a caller directly call the implementation signature of an overloaded function?",
    code: "function format(x: string): string;\nfunction format(x: number): string;\nfunction format(x: string | number): string { return String(x); }\n\nformat(true); // ???",
    options: [
      "No, the implementation signature is invisible to callers",
      "Yes, the implementation accepts string | number so also boolean",
      "Yes, if you explicitly cast",
      "Only within the same module",
    ],
    correct: 0,
    explanation:
      "The implementation signature is invisible to callers. Only the overload signatures " +
      "define how the function can be called. format(true) fails " +
      "because no overload accepts boolean — even though the implementation theoretically " +
      "contains string | number.",
  },

  // --- Question 8: Overload Order ---
  {
    question: "In what order should overload signatures be written?",
    options: [
      "Broadest first, most specific last",
      "Order doesn't matter",
      "Most specific first, broadest last",
      "Alphabetically by parameter type",
    ],
    correct: 2,
    explanation:
      "TypeScript checks overloads top-to-bottom and takes the first match. " +
      "Specific overloads must come BEFORE broader ones, otherwise the broad " +
      "overload would match first and swallow the specific type.",
  },

  // --- Question 9: void Callback ---
  {
    question: "Does this code compile?",
    code: "type VoidCallback = () => void;\nconst fn: VoidCallback = () => 42;",
    options: [
      "No, 42 is not void",
      "Only with an explicit return",
      "Only when VoidCallback is defined as an interface",
      "Yes, void callbacks may return values — the value is ignored",
    ],
    correct: 3,
    explanation:
      "Void callbacks are intentionally tolerant: they may return values. " +
      "This is based on the Substitutability Principle — a function that can do 'more' " +
      "(returns a value) is usable anywhere 'less' is expected. " +
      "Without this rule, forEach(n => arr.push(n)) would be an error.",
  },

  // --- Question 10: void in Declarations ---
  {
    question: "Does `function doSomething(): void { return 42; }` compile?",
    options: [
      "No, with a direct function declaration void is STRICT",
      "Yes, void allows any return value",
      "Yes, but only in strict mode",
      "No, void functions may not have a return statement",
    ],
    correct: 0,
    explanation:
      "With DIRECT function declarations, void is strict — return 42 is an error. " +
      "Only with callback types (e.g. type Cb = () => void) is void tolerant. " +
      "The difference: with declarations YOU control the return type, " +
      "with callbacks someone ELSE defines the interface.",
  },

  // --- Question 11: this Parameter ---
  {
    question: "What happens to the this parameter at runtime?",
    code: "function greet(this: { name: string }): string {\n  return `Hallo, ${this.name}`;\n}",
    options: [
      "It is passed as a regular first parameter",
      "It becomes a property on the function object",
      "It is converted into a closure",
      "It disappears completely (type erasure)",
    ],
    correct: 3,
    explanation:
      "The this parameter is a compile-time-only feature. Through type erasure " +
      "it disappears completely in the compiled JavaScript. It only serves to " +
      "tell TypeScript the type of this — without any runtime overhead.",
  },

  // --- Question 12: Arrow vs Regular Function ---
  {
    question: "Why do arrow functions inherit `this` from the surrounding scope?",
    options: [
      "Because they have a hidden this parameter",
      "Because they don't bind their own this — this is resolved lexically",
      "Because they automatically call .bind(this)",
      "Because arrow functions always run in strict mode",
    ],
    correct: 1,
    explanation:
      "Arrow functions have no own this binding. Instead, this is " +
      "resolved lexically — it comes from the surrounding scope. That is the " +
      "main reason for their introduction in ES2015: to solve the this problem.",
  },

  // --- Question 13: Type Guard ---
  {
    question: "What does `value is string` mean as a return type of a function?",
    code: "function isString(value: unknown): value is string {\n  return typeof value === 'string';\n}",
    options: [
      "When the function returns true, TypeScript knows that value is a string",
      "The function returns a string",
      "The function throws an error if value is not a string",
      "value is converted to a string at runtime",
    ],
    correct: 0,
    explanation:
      "A type guard with 'value is Type' tells TypeScript: 'If this function " +
      "returns true, value is of this type.' The compiler trusts the guard " +
      "and automatically narrows the type after an if-check. Note: TypeScript " +
      "does NOT check whether the guard is correctly implemented!",
  },

  // --- Question 14: Assertion Function ---
  {
    question: "What is the difference between a type guard and an assertion function?",
    options: [
      "No difference, just different syntax",
      "Type guard is for primitives, assertion function for objects",
      "Type guard returns boolean (if-branching), assertion function throws on failure",
      "Assertion functions only exist from TS 5.0 onwards",
    ],
    correct: 2,
    explanation:
      "A type guard returns boolean — the caller decides with if/else. " +
      "An assertion function (asserts value is T) throws an error on failure — " +
      "the code after it only runs on success. Type guards for branching, " +
      "assertion functions for guarantees.",
  },

  // --- Question 15: Currying ---
  {
    question: "What does `curriedAdd(5)` return?",
    code: "function curriedAdd(a: number): (b: number) => number {\n  return (b) => a + b;\n}",
    options: [
      "5",
      "A function of type (b: number) => number",
      "NaN",
      "undefined",
    ],
    correct: 1,
    explanation:
      "Currying returns a new function that expects the next parameter. " +
      "curriedAdd(5) returns (b: number) => number — a function that computes 5 + b. " +
      "TypeScript infers all intermediate types automatically.",
  },

  // ─── Additional Formats ────────────────────────────────────────────────────

  // --- Question 16: Short-Answer — void vs undefined ---
  {
    type: "short-answer",
    question: "Which return type signals 'the return value is irrelevant' — void or undefined?",
    expectedAnswer: "void",
    acceptableAnswers: ["void", "void"],
    explanation:
      "void means 'the return value is irrelevant'. undefined is a concrete value type. " +
      "For callbacks, void is especially important because void callbacks are still allowed to return values.",
  },

  // --- Question 17: Short-Answer — Rest Parameters ---
  {
    type: "short-answer",
    question: "What type does `args` have in `function log(...args: string[])`?",
    expectedAnswer: "string[]",
    acceptableAnswers: ["string[]", "Array<string>", "string array", "Array string"],
    explanation:
      "Rest parameters collect all passed arguments into an array. " +
      "The spread syntax (...) is part of the declaration, not the type. " +
      "The actual type is a normal string[].",
  },

  // --- Question 18: Short-Answer — this Parameter ---
  {
    type: "short-answer",
    question: "What happens to the this parameter of a function at runtime in compiled JavaScript?",
    expectedAnswer: "It disappears",
    acceptableAnswers: ["It disappears", "disappears", "Type Erasure", "gets removed", "doesn't exist", "gone"],
    explanation:
      "The this parameter is a compile-time-only feature. Through type erasure " +
      "it disappears completely in the compiled JavaScript — no runtime overhead.",
  },

  // --- Question 19: Predict-Output — void Callback ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "type VoidCb = () => void;\nconst fn: VoidCb = () => 42;\nconst result = fn();\nconsole.log(typeof result);",
    expectedAnswer: "number",
    acceptableAnswers: ["number", "\"number\"", "'number'"],
    explanation:
      "Void callbacks may return values — the value is ignored by the type system, " +
      "but exists at runtime. fn() returns 42, typeof 42 is 'number'. " +
      "TypeScript says void, JavaScript sees the 42.",
  },

  // --- Question 20: Predict-Output — Currying ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "function multiply(a: number) {\n  return (b: number) => a * b;\n}\nconst double = multiply(2);\nconsole.log(double(5));",
    expectedAnswer: "10",
    acceptableAnswers: ["10"],
    explanation:
      "multiply(2) returns a function that computes b => 2 * b. " +
      "double(5) computes 2 * 5 = 10. That is currying — the outer function " +
      "closes over the parameter a (closure).",
  },

  // --- Question 21: Explain-Why — Type Guards ---
  {
    type: "explain-why",
    question: "Why does TypeScript NOT check whether a custom type guard is correctly implemented?",
    modelAnswer:
      "TypeScript trusts the developer with type guards. The compiler cannot generally " +
      "prove that an arbitrary runtime check correctly identifies a type. " +
      "Type guards are a contract: the developer guarantees correctness, " +
      "TypeScript uses the information for narrowing.",
    keyPoints: [
      "Compiler cannot generally prove correctness",
      "Contract between developer and compiler",
      "Responsibility lies with the developer",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Recursive functions create a circular reference: the return type " +
      "depends on the return value, which contains a call to the same function. " +
      "The compiler needs the type it is currently trying to determine.",
    commonMistake:
      "Many think TypeScript can always resolve recursive types. " +
      "For type definitions (type Tree = ...) this works, but not for return type inference.",
  },
  1: {
    whyCorrect:
      "void = return value irrelevant (callback compatibility). " +
      "undefined = concrete value. void for side-effect functions, " +
      "undefined when the caller needs the value.",
    commonMistake:
      "Most treat void and undefined as synonyms. " +
      "The difference only becomes relevant with callbacks, where void callbacks " +
      "are allowed to return values.",
  },
  2: {
    whyCorrect:
      "x?: string makes the argument omittable: f(). " +
      "x: string | undefined forces an argument: f(undefined). " +
      "Both result in string | undefined internally, but the call site differs.",
    commonMistake:
      "Many consider both notations identical. " +
      "The difference is in the call signature, not the internal type.",
  },
  3: {
    whyCorrect:
      "A default value automatically makes the parameter optional — " +
      "the ? is redundant. TypeScript forbids the combination " +
      "to avoid confusion.",
    commonMistake:
      "Some think ? + default gives the parameter two 'layers' " +
      "of optionality. In reality they are the same thing.",
  },
  4: {
    whyCorrect:
      "Rest parameters collect all passed arguments into a real array. " +
      "The type is string[] — the spread syntax is part of the declaration, not the type.",
    commonMistake:
      "Some confuse the rest parameter type with the spread operator " +
      "and expect a special spread type.",
  },
  5: {
    whyCorrect:
      "Parameter names in function type expressions are pure documentation. " +
      "TypeScript only checks type compatibility, not names.",
    commonMistake:
      "Developers coming from Java/C# expect parameter names to match. " +
      "In TypeScript they are freely chosen.",
  },
  6: {
    whyCorrect:
      "The implementation signature is invisible to callers — it " +
      "only serves the internal implementation. Callers only see the overload signatures.",
    commonMistake:
      "Many think the implementation signature extends the " +
      "callable types. But it is purely internal.",
  },
  7: {
    whyCorrect:
      "TypeScript checks overloads top-down. Most specific first prevents " +
      "a broad overload from swallowing more precise types.",
    commonMistake:
      "Some write overloads in arbitrary order. " +
      "This can cause the wrong overload to match.",
  },
  8: {
    whyCorrect:
      "Void callbacks are based on the Substitutability Principle: " +
      "a function that can do 'more' (returns a value) substitutes one " +
      "that can do 'less' (void).",
    commonMistake:
      "The void tolerance for callbacks vs. void strictness for " +
      "declarations confuses many developers. Remember: context decides.",
  },
  9: {
    whyCorrect:
      "With direct function declarations YOU control the return type. " +
      "If you say void, you mean it. With callbacks someone " +
      "ELSE defines the interface.",
    commonMistake:
      "Those who know void callback tolerance mistakenly apply it " +
      "to direct function declarations as well.",
  },
  10: {
    whyCorrect:
      "The this parameter is a compile-time-only feature (type erasure). " +
      "It disappears in the JavaScript — no runtime overhead.",
    commonMistake:
      "Some expect the this parameter to appear as the first function parameter " +
      "in the generated JavaScript. That is not the case.",
  },
  11: {
    whyCorrect:
      "Arrow functions have no own this. They resolve this " +
      "lexically — from the surrounding scope. That was the main reason " +
      "for their introduction in ES2015.",
    commonMistake:
      "Some think arrow functions call .bind(this) internally. " +
      "In reality they have no this binding at all.",
  },
  12: {
    whyCorrect:
      "value is Type is a contract: 'If true, then value is of this type.' " +
      "TypeScript trusts the guard blindly — correctness is the developer's responsibility.",
    commonMistake:
      "Many believe TypeScript checks whether the type guard is correct. " +
      "It does not — return true would always be accepted as a guard.",
  },
  13: {
    whyCorrect:
      "Type Guard = boolean (if-branching). " +
      "Assertion Function = throws on failure. " +
      "Different control flow strategies.",
    commonMistake:
      "Some confuse asserts with assert libraries. " +
      "asserts is a TypeScript keyword for the compiler, " +
      "not an external library.",
  },
  14: {
    whyCorrect:
      "Currying returns a new function. TypeScript infers " +
      "the type (b: number) => number automatically. Configuration and " +
      "execution are separated.",
    commonMistake:
      "Beginners expect a value instead of a function. " +
      "Currying always returns a function until all parameters are set.",
  },
};