/**
 * Lesson 13 — Quiz Data: Generics Basics
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "13";
export const lessonTitle = "Generics Basics";

export const questions: QuizQuestion[] = [
  // --- Question 1: Why Generics ---
  {
    question: "What is the main problem with `function firstAny(arr: any[]): any`?",
    options: [
      "The return type is any — TypeScript loses all type information",
      "The function is too slow",
      "any is an invalid type",
      "The function does not accept arrays",
    ],
    correct: 0,
    explanation:
      "any disables the TypeScript compiler for this value completely. " +
      "The return type is any — you can call .foo.bar.baz without errors. " +
      "This is as unsafe as pure JavaScript. Generics preserve the type.",
  },

  // --- Question 2: Type Parameter Syntax ---
  {
    question: "What does `<T>` mean in `function identity<T>(arg: T): T`?",
    options: [
      "T is a concrete type named T",
      "T is a type parameter — a placeholder that is replaced at call time",
      "T always stands for string",
      "T is a JavaScript value",
    ],
    correct: 1,
    explanation:
      "<T> declares a type parameter — like a parameter for values, " +
      "but for types. At call time, T is replaced by the concrete type: " +
      "identity<string>(\"hi\") makes T equal to string. " +
      "T is NOT a concrete type — it is a placeholder.",
    code: "function identity<T>(arg: T): T { return arg; }",
  },

  // --- Question 3: Type Inference ---
  {
    question: "What is the inferred type of `result` in `const result = identity(42)`?",
    options: [
      "any",
      "unknown",
      "number",
      "42",
    ],
    correct: 2,
    explanation:
      "TypeScript infers T from the argument: 42 has type number, so T = number. " +
      "The return type T also becomes number. You do not have to specify T explicitly — " +
      "TypeScript recognizes it automatically from the arguments.",
    code: "function identity<T>(arg: T): T { return arg; }\nconst result = identity(42);",
  },

  // --- Question 4: Explicit Type Specification ---
  {
    question: "When MUST you specify the type parameter explicitly?",
    options: [
      "Always — inference does not work with generics",
      "Only with arrow functions",
      "Only with multiple type parameters",
      "When T only appears in the return type and cannot be inferred from arguments",
    ],
    correct: 3,
    explanation:
      "When T appears in no parameter (e.g. function create<T>(): T[]), " +
      "TypeScript cannot derive T from the arguments. Then you must specify T " +
      "explicitly: create<string>(). With arguments, TypeScript infers automatically.",
    code: "function createArray<T>(): T[] { return []; }\n// createArray(); // Error!\nconst arr = createArray<string>(); // OK",
  },

  // --- Question 5: Multiple Type Parameters ---
  {
    question: "What is the type of `pair` in `const pair = makePair('Max', 30)`?",
    options: [
      "[any, any]",
      "[string, number]",
      "[string, string]",
      "{ first: string; second: number }",
    ],
    correct: 1,
    explanation:
      "TypeScript infers T = string (from 'Max') and U = number (from 30). " +
      "The return type [T, U] becomes [string, number]. Both type parameters " +
      "are inferred simultaneously from the arguments.",
    code: "function makePair<T, U>(a: T, b: U): [T, U] { return [a, b]; }\nconst pair = makePair('Max', 30);",
  },

  // --- Question 6: Generic Interface ---
  {
    question: "What does `ApiResponse<User>` describe?",
    options: [
      "An interface with data: User and all other properties of the base interface",
      "An interface with data: any",
      "A class that extends User",
      "A union type of Api, Response, and User",
    ],
    correct: 0,
    explanation:
      "ApiResponse<User> replaces T with User. If ApiResponse<T> has the properties " +
      "data: T, status: number, message: string, then ApiResponse<User> has " +
      "data: User, status: number, message: string. " +
      "The structure stays the same — only T is replaced.",
    code: "interface ApiResponse<T> { data: T; status: number; message: string; }",
  },

  // --- Question 7: Array<T> ---
  {
    question: "Which two notations are identical in TypeScript?",
    options: [
      "Array<number> and number()",
      "Array[number] and number[]",
      "number[] and Array<number>",
      "number<Array> and number[]",
    ],
    correct: 2,
    explanation:
      "number[] is syntactic sugar for Array<number>. Internally, " +
      "TypeScript translates number[] to Array<number>. Both are exactly the same type. " +
      "Array is a generic interface from the standard library.",
  },

  // --- Question 8: extends Constraint ---
  {
    question: "What does `T extends { length: number }` do for a type parameter?",
    options: [
      "T must have at least one property length: number",
      "T becomes { length: number }",
      "T may only be string",
      "T is restricted to number",
    ],
    correct: 0,
    explanation:
      "extends on type parameters is a constraint — a minimum requirement. " +
      "T can be any type that has AT LEAST { length: number }. " +
      "string, Array, { length: 5, extra: true } — all allowed. " +
      "number or boolean would be forbidden (no .length).",
    code: "function getLength<T extends { length: number }>(arg: T): number {\n  return arg.length; // OK!\n}",
  },

  // --- Question 9: keyof Constraint ---
  {
    question: "What does `getProperty(user, 'name')` return when user is `{ name: string; age: number }`?",
    options: [
      "string | number (union of all property types)",
      "unknown",
      "string (precisely the type of user.name)",
      "any",
    ],
    correct: 2,
    explanation:
      "K is inferred as 'name'. T[K] = T['name'] = string. " +
      "The indexed access type T[K] returns the PRECISE type of the respective " +
      "property — not the union of all possible property types. " +
      "This is the strength of the keyof constraint.",
    code: "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K]",
  },

  // --- Question 10: Multiple Constraints ---
  {
    question: "How do you combine multiple constraints for a type parameter?",
    options: [
      "T extends A, B",
      "T extends A | B",
      "T extends A extends B",
      "T extends A & B",
    ],
    correct: 3,
    explanation:
      "Intersection types (&) combine constraints. T extends A & B " +
      "means: T must fulfill BOTH A and B. Union (|) would mean " +
      "'either one is enough' — that is less restrictive. " +
      "There is only one extends per type parameter.",
    code: "function save<T extends HasId & Serializable>(entity: T): void",
  },

  // --- Question 11: Default Type Parameters ---
  {
    question: "What happens with `const c: Container = { value: 'hi', label: 'x' }` when Container has `<T = string>`?",
    options: [
      "Error — T must be specified",
      "T becomes string (the default type)",
      "T becomes any",
      "T becomes unknown",
    ],
    correct: 1,
    explanation:
      "Default type parameters work like default parameters in functions. " +
      "When T is not specified, the default applies. <T = string> makes " +
      "Container equivalent to Container<string>. " +
      "Container<number> overrides the default.",
    code: "interface Container<T = string> { value: T; label: string; }",
  },

  // --- Question 12: Default Order ---
  {
    question: "Is `interface Cache<K = string, V>` valid?",
    options: [
      "Yes — order does not matter",
      "Yes — but only for interfaces",
      "No — you cannot have two type parameters",
      "No — type parameters with defaults must come last",
    ],
    correct: 3,
    explanation:
      "Like function parameters: defaults must come last. " +
      "<K = string, V> is invalid because V (without default) comes after K (with default). " +
      "Correct would be <V, K = string> or <K = string, V = string>.",
  },

  // --- Question 13: Generics vs. any ---
  {
    question: "What is the fundamental difference between `function f<T>(x: T): T` and `function f(x: any): any`?",
    options: [
      "No difference — both accept any type",
      "Generics guarantee that input and output types are THE SAME",
      "any is faster at runtime",
      "Generics only work with objects",
    ],
    correct: 1,
    explanation:
      "Generics CONNECT input and output. When T = string, then " +
      "the return type is also string. With any, the input could be string " +
      "and the output number — any checks nothing. " +
      "Generics are 'type-safe any'.",
  },

  // --- Question 14: Unnecessary Type Parameters ---
  {
    question: "Why is `function log<T>(x: T): void` an anti-pattern?",
    options: [
      "T only appears once — it establishes no relationship",
      "T cannot be inferred",
      "void is not a valid return type",
      "Generics may not be used with void",
    ],
    correct: 0,
    explanation:
      "A type parameter should appear at least TWICE: in the parameter " +
      "AND in the return type (or in another parameter). When T only " +
      "appears once, it connects nothing — unknown would be just as good. " +
      "Generics only make sense when they establish a RELATIONSHIP.",
    code: "// Bad: T only once\nfunction log<T>(x: T): void { ... }\n\n// Good: T connects input and output\nfunction first<T>(arr: T[]): T | undefined { ... }",
  },

  // --- Question 15: Promise<T> ---
  {
    question: "Why must you specify the type explicitly with `http.get<User>(url)`?",
    options: [
      "Angular convention — there is no technical reason",
      "get() has no type parameter",
      "HTTP data arrives at runtime — TypeScript cannot infer the type",
      "You don't have to — TypeScript always infers",
    ],
    correct: 2,
    explanation:
      "TypeScript infers types from COMPILE-TIME information (arguments, " +
      "literals). HTTP data only arrives at runtime — the compiler has " +
      "no way to know what the API returns. That is why " +
      "you must specify T explicitly. With useState(0), inference works because " +
      "0 is a compile-time value.",
  },

  // ─── Additional Question Formats ────────────────────────────────────────────

  // --- Question 16: Short Answer ---
  {
    type: "short-answer",
    question: "What is the keyword that constrains a type parameter to a minimum type (e.g. T ___ { length: number })?",
    expectedAnswer: "extends",
    acceptableAnswers: ["extends", "extends keyword"],
    explanation:
      "extends on type parameters defines a constraint — a minimum requirement. " +
      "T extends { length: number } means: T must have at least a length property " +
      "of type number. Everything beyond that is allowed.",
  },

  // --- Question 17: Short Answer ---
  {
    type: "short-answer",
    question: "Which keyword produces a union type of all property names of a type T?",
    expectedAnswer: "keyof",
    acceptableAnswers: ["keyof", "keyof T", "keyof operator"],
    explanation:
      "keyof T produces a union of all keys of T. For { name: string; age: number } " +
      "keyof T yields the type 'name' | 'age'. In combination with extends " +
      "(K extends keyof T), only valid keys are accepted.",
  },

  // --- Question 18: Predict Output ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "function wrap<T>(value: T): { data: T } {\n  return { data: value };\n}\nconst result = wrap(42);\nconsole.log(typeof result.data);",
    expectedAnswer: "number",
    acceptableAnswers: ["number", "'number'", "\"number\""],
    explanation:
      "T is inferred as number (from the argument 42). wrap returns { data: 42 }. " +
      "typeof result.data is 'number'. Generics preserve the type — " +
      "with any, typeof result.data would also be 'number' at runtime, but " +
      "TypeScript would not know it.",
  },

  // --- Question 19: Predict Output ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "function first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\nconst result = first([]);\nconsole.log(result);",
    expectedAnswer: "undefined",
    acceptableAnswers: ["undefined"],
    explanation:
      "The array is empty, so arr[0] returns undefined. " +
      "The return type T | undefined expresses exactly that: " +
      "it could be an element or undefined if the array is empty.",
  },

  // --- Question 20: Short Answer ---
  {
    type: "short-answer",
    question: "A type parameter that appears only ONCE (e.g. function log<T>(x: T): void) is an anti-pattern. Which type could replace T?",
    expectedAnswer: "unknown",
    acceptableAnswers: ["unknown", "any", "unknown (or any)"],
    explanation:
      "When T only appears once, it establishes no relationship. " +
      "unknown would be just as good — and more honest. Generics only make sense " +
      "when they appear at least TWICE and establish a connection.",
  },

  // --- Question 21: Explain Why ---
  {
    type: "explain-why",
    question: "Why are generics 'type-safe any'? Explain the fundamental difference between generics and any using an example.",
    modelAnswer:
      "With function identity(x: any): any, the type information is lost — " +
      "the return type is always any, regardless of what comes in. " +
      "With function identity<T>(x: T): T, T is bound at call time: " +
      "identity('hello') has return type string. " +
      "Generics REMEMBER the type and ensure that input and output match.",
    keyPoints: [
      "any loses type information",
      "Generics preserve the input-output relationship",
      "T is bound to a concrete type at call time",
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
      "any disables the TypeScript compiler completely for this value. " +
      "Every operation is allowed — no property check, no type check.",
    commonMistake:
      "Many think any is 'flexible'. In reality it is 'unsafe' — " +
      "you lose all the benefits of TypeScript.",
  },
  1: {
    whyCorrect:
      "<T> declares a placeholder that is replaced by a concrete " +
      "type at call time. That is the core principle of generics.",
    commonMistake:
      "Some think T is a fixed type named 'T'. It is a PARAMETER — " +
      "like 'x' in function f(x).",
  },
  2: {
    whyCorrect:
      "TypeScript unifies the type of the argument (42 → number) with the " +
      "type parameter T. T = number → return type = number.",
    commonMistake:
      "Some expect 42 (literal type). Without as const, TypeScript infers " +
      "the wide type number, not the literal type.",
  },
  3: {
    whyCorrect:
      "Inference needs compile-time information. When T appears in no " +
      "parameter, there is nothing from which TypeScript could infer.",
    commonMistake:
      "Many forget that inference works ONLY from arguments. " +
      "No argument with T → no inference possible.",
  },
  4: {
    whyCorrect:
      "TypeScript infers each type parameter independently from the " +
      "corresponding argument. T from the first, U from the second.",
    commonMistake:
      "Some expect all type parameters to have the same type. " +
      "Each parameter is independent.",
  },
  5: {
    whyCorrect:
      "Generic interfaces are templates. T is replaced by the concrete " +
      "type — all properties that use T are updated.",
    commonMistake:
      "Some confuse generic interfaces with inheritance. " +
      "ApiResponse<User> does not 'inherit' from User — it CONTAINS User as data.",
  },
  6: {
    whyCorrect:
      "number[] is syntactic sugar that TypeScript internally translates to Array<number>. " +
      "No difference in behavior or type.",
    commonMistake:
      "Some think the Array<T> notation has different features. " +
      "Both are identical — only the syntax differs.",
  },
  7: {
    whyCorrect:
      "extends on type parameters defines a minimum requirement. " +
      "The type can have MORE, but it must fulfill AT LEAST the constraint.",
    commonMistake:
      "Some think extends restricts T to EXACTLY the constraint type. " +
      "No — T can be any subtype that fulfills the constraint.",
  },
  8: {
    whyCorrect:
      "K is inferred as the concrete literal 'name'. T['name'] yields " +
      "the precise type of that one property — not the union.",
    commonMistake:
      "Many expect string | number | boolean (union of all properties). " +
      "The indexed access type is precise PER key.",
  },
  9: {
    whyCorrect:
      "Intersection types (&) enforce that BOTH constraints are fulfilled. " +
      "That is stricter than union (|) where only one is sufficient.",
    commonMistake:
      "& is confused with |. A & B = must have both. " +
      "A | B = one is enough.",
  },
  10: {
    whyCorrect:
      "Default type parameters are used when the caller specifies no type. " +
      "Like default values in functions.",
    commonMistake:
      "Some think defaults override explicit specifications. " +
      "No — Container<number> ignores the default entirely.",
  },
  11: {
    whyCorrect:
      "TypeScript enforces the order: required before optional. " +
      "Otherwise it would be unclear which type parameter corresponds to which argument.",
    commonMistake:
      "Some think order does not matter for types. " +
      "It does — like function parameters: defaults must come last.",
  },
  12: {
    whyCorrect:
      "Generics CONNECT types: same type in and out. " +
      "any has no such connection — input and output are independent.",
    commonMistake:
      "Many see no difference because both 'accept any type'. " +
      "The difference: generics REMEMBER the type.",
  },
  13: {
    whyCorrect:
      "A type parameter that appears only once establishes no relationship. " +
      "It could be replaced by unknown without loss of information.",
    commonMistake:
      "Some think more generics = better. No — unnecessary type parameters " +
      "only make the code harder to read without added value.",
  },
  14: {
    whyCorrect:
      "TypeScript inference needs compile-time data. HTTP responses " +
      "arrive at runtime — TypeScript cannot 'look into the API'.",
    commonMistake:
      "Some think TypeScript could derive the type from the URL. " +
      "URLs are strings — TypeScript does not know what the API returns.",
  },
};