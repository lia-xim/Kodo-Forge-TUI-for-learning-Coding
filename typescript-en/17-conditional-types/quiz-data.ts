/**
 * Lesson 17 — Quiz Data: Conditional Types
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "17";
export const lessonTitle = "Conditional Types";

export const questions: QuizQuestion[] = [
  { question: "What does `T extends U ? X : Y` describe?", options: ["Runtime check", "Compile-time decision: if T is a subtype of U, choose X, else Y", "Type Guard", "Type conversion"], correct: 1, explanation: "Conditional Types are ternary operators at the type level. extends checks the subtype relationship at compile time." },
  { question: "What does the `infer` keyword do?", options: ["Infers variable types", "Declares a type variable in the conditional that TypeScript extracts from the pattern", "Creates type guards", "Converts types"], correct: 1, explanation: "infer declares a placeholder type that TypeScript derives from the extends pattern." },
  { question: "What does `T extends Promise<infer U> ? U : T` return for `Promise<string>`?", options: ["Promise<string>", "string", "never", "unknown"], correct: 1, explanation: "Promise<string> matches the pattern Promise<infer U>, so U = string and is returned." },
  { question: "What happens with `IsString<string | number>` given `type IsString<T> = T extends string ? true : false`?", options: ["true", "false", "true | false (distributive)", "boolean"], correct: 2, explanation: "Distributive: IsString<string> = true, IsString<number> = false. Result: true | false." },
  { question: "How do you prevent distribution in Conditional Types?", options: ["With as const", "With [T] extends [U] — tuple wrapping", "With readonly", "Not possible"], correct: 1, explanation: "[T] extends [U] wraps T in a tuple. The conditional is then not distributed over union members." },
  { question: "What is `IsString<never>` given `type IsString<T> = T extends string ? true : false`?", options: ["true", "false", "never", "boolean"], correct: 2, explanation: "never is the empty union. Distribution over an empty union = never. An important special rule!" },
  { question: "How do you reliably detect never?", options: ["T extends never", "[T] extends [never] ? true : false", "typeof T === 'never'", "T === never"], correct: 1, explanation: "[T] extends [never] prevents distribution and checks whether T is actually never." },
  { question: "What does `type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T` do?", options: ["Removes one array level", "Unwraps arrays RECURSIVELY until no array remains", "Makes T an array", "Returns never"], correct: 1, explanation: "Recursion: as long as T is an array, it keeps unwrapping. The recursion terminates only when T is no longer an array." },
  { question: "How do you extract the return type of a function?", options: ["typeof fn()", "T extends (...args: any[]) => infer R ? R : never", "ReturnType is built-in, no pattern needed", "fn.returnType"], correct: 1, explanation: "infer R at the return position extracts the return type. TypeScript's built-in ReturnType uses exactly this pattern." },
  { question: "What does `type Methods<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] }` do?", options: ["Removes all methods", "Keeps only function properties and filters out data properties", "Makes all properties functions", "Copies T"], correct: 1, explanation: "Conditional in key remapping: keep function properties (K), remove others (never)." },
  { question: "What does `type FirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never` extract?", options: ["All parameters", "The first parameter of a function", "The return type", "The function itself"], correct: 1, explanation: "infer P at the position of the first parameter extracts exactly that type." },
  { question: "What is the difference between Extract<T, U> and Exclude<T, U>?", options: ["No difference", "Extract KEEPS U members, Exclude REMOVES U members — both distributive", "Extract is recursive, Exclude is not", "Extract for objects, Exclude for unions"], correct: 1, explanation: "Extract = T extends U ? T : never (keep). Exclude = T extends U ? never : T (remove). Both use distribution." },
  { question: "What does `type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T` do?", options: ["Unwraps one Promise level", "Unwraps NESTED Promises recursively until no Promise remains", "Returns Promise<T>", "Produces an error"], correct: 1, explanation: "Recursion: Promise<Promise<Promise<string>>> -> DeepAwaited<Promise<Promise<string>>> -> ... -> string." },
  { question: "What happens when a recursive type goes too deep?", options: ["Stack Overflow", "TypeScript throws the error 'Type instantiation is excessively deep'", "Automatically never", "No problem"], correct: 1, explanation: "TypeScript has a recursion limit (~50-100 levels). Exceeding it causes a compile error." },
  { question: "What does `type Promisify<T> = { [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : T[K] }` combine?", options: ["Mapped Types alone", "Mapped Types + Conditional Types + infer — converts methods to async versions", "Only Conditional Types", "Runtime transformation"], correct: 1, explanation: "Mapped Type iterates, Conditional checks whether Function, infer extracts args and return, Promise<R> wraps the return type." },

  // ─── New question formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  {
    type: "short-answer",
    question: "Which keyword declares a type variable inside a Conditional Type that TypeScript fills via pattern matching?",
    expectedAnswer: "infer",
    acceptableAnswers: ["infer", "infer keyword", "the infer keyword"],
    explanation: "infer declares a placeholder in the extends pattern. TypeScript extracts the concrete type through pattern matching.",
  },
  {
    type: "short-answer",
    question: "How do you prevent the distributive property of Conditional Types? (Describe the technique in 1-2 words)",
    expectedAnswer: "Tuple wrapping",
    acceptableAnswers: ["Tuple wrapping", "Tuple-wrapping", "[T] extends [U]", "wrap in tuple", "Tuple"],
    explanation: "[T] extends [U] wraps T in a tuple. Tuples do not distribute over union members — the union is checked as a whole.",
  },
  {
    type: "short-answer",
    question: "What is the result of `IsString<never>` with distributive `type IsString<T> = T extends string ? true : false`?",
    expectedAnswer: "never",
    acceptableAnswers: ["never", "type never", "never (empty union)"],
    explanation: "never is the empty union type. Distribution over an empty union always yields never — an important special rule to know.",
  },
  {
    type: "predict-output",
    question: "What is the resulting type?",
    code: "type ExtractReturn<T> = T extends (...args: any[]) => infer R ? R : never;\ntype Result = ExtractReturn<(x: number, y: string) => boolean[]>;",
    expectedAnswer: "boolean[]",
    acceptableAnswers: ["boolean[]", "Array<boolean>", "boolean array"],
    explanation: "infer R at the return position extracts the return type. The function returns boolean[], so R = boolean[].",
  },
  {
    type: "predict-output",
    question: "What is the resulting type?",
    code: "type Flatten<T> = T extends (infer U)[] ? U : T;\ntype Result = Flatten<string | number[]>;",
    expectedAnswer: "string | number",
    acceptableAnswers: ["string | number", "number | string"],
    explanation: "Distributive: Flatten<string> = string (not an array, else branch). Flatten<number[]> = number (array, unwrapped). Combined: string | number.",
  },
  {
    type: "explain-why",
    question: "Why is the combination of Mapped Types, Conditional Types, and infer so powerful for type-level programming?",
    modelAnswer: "The three concepts complement each other: Mapped Types iterate over all properties of an object, Conditional Types enable branching at the type level, and infer extracts type parts through pattern matching. Together they allow expressing arbitrarily complex type transformations — e.g. converting all methods of an object to async versions, filtering properties by their type, or extracting and transforming return types.",
    keyPoints: ["Mapped Types for iterating over properties", "Conditional Types for branching logic", "infer for pattern matching and type extraction", "Combination enables arbitrarily complex transformations"],
  },
];

export interface ElaboratedFeedback { whyCorrect: string; commonMistake: string; }

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "extends at the type level is NOT runtime. It checks subtype relationships at compile time.", commonMistake: "Confusion with instanceof/typeof. Conditional Types generate no code." },
  1: { whyCorrect: "infer is like a placeholder/wildcard that TypeScript fills with the concrete type.", commonMistake: "Trying to use infer outside of Conditional Types — that doesn't work." },
  2: { whyCorrect: "Pattern matching: Promise<string> matches Promise<infer U>, so U = string.", commonMistake: "Forgetting that for non-matching types the else branch (T) applies." },
  3: { whyCorrect: "Distribution: each union member is evaluated individually, results are reunited.", commonMistake: "Expecting the union to be checked as a whole. Distributive conditionals distribute!" },
  4: { whyCorrect: "[T] wraps T in a tuple. Tuples do not distribute — the union is checked as a whole.", commonMistake: "Other attempts like T & {} work for some cases, but [T] is reliable." },
  5: { whyCorrect: "never = empty union. Distribution over nothing = nothing = never.", commonMistake: "Expecting never extends string to yield false. With distribution, the answer is never." },
  6: { whyCorrect: "[T] extends [never] prevents distribution and checks T directly against never.", commonMistake: "Using T extends never directly — that distributes and always returns never for never." },
  7: { whyCorrect: "Recursion terminates when T is no longer an array. Arbitrary nesting depth.", commonMistake: "Unwrapping only one level without recursion — nested arrays remain." },
  8: { whyCorrect: "infer R at the return position is THE standard pattern for return type extraction.", commonMistake: "Calling typeof fn() — that executes the function! ReturnType uses purely static analysis." },
  9: { whyCorrect: "Conditional in key remapping (as) filters properties. never = property removed.", commonMistake: "Conditional in the value type instead of key remapping — that changes the type but doesn't remove." },
  10: { whyCorrect: "infer P at the desired position in the function pattern extracts exactly that type.", commonMistake: "Forgetting that with no parameter (e.g. () => void) the else branch (never) applies." },
  11: { whyCorrect: "Extract keeps union members that match U. Exclude removes them. Both are distributive.", commonMistake: "Confusing the direction: Extract keeps, Exclude removes. The names help as a mnemonic." },
  12: { whyCorrect: "Recursion unwraps layer by layer until the base case (no Promise) is reached.", commonMistake: "Unwrapping only one level. Without recursion, Promise<Promise<T>> stops at Promise<T>." },
  13: { whyCorrect: "TypeScript protects against infinite recursion with a built-in limit.", commonMistake: "Assuming TypeScript can recurse indefinitely. In practice 3-5 levels are sufficient." },
  14: { whyCorrect: "Three concepts combined: Mapped Types iterate, Conditional checks, infer extracts.", commonMistake: "Trying to solve everything with only one concept. The power lies in the combination." },
};