/**
 * Lesson 20 — Quiz data: Review Challenge Phase 2
 */
import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "20";
export const lessonTitle = "Review Challenge Phase 2";

export const questions: QuizQuestion[] = [
  { question: "What makes a Discriminated Union type-safe? (L12)", options: ["Runtime checks", "A shared literal field (tag) that TypeScript uses for exhaustive checks", "Generics", "any type"], correct: 1, explanation: "The tag field (e.g. type: 'circle') allows TypeScript to determine the exact type in switch/if statements." },
  { question: "What is the main advantage of generics over any? (L13)", options: ["Performance", "Type safety with flexibility — errors at compile time instead of runtime", "Shorter code", "Runtime checks"], correct: 1, explanation: "Generics preserve type information. any discards it and loses all compiler checks." },
  { question: "What makes pipe() with overloads type-safe? (L14)", options: ["A single type parameter T", "Separate type parameters per step: A->B->C, each transition checked", "Runtime validation", "any casts"], correct: 1, explanation: "Each overload defines the type transitions for a specific length. TypeScript checks every step." },
  { question: "What does Partial<T> do internally? (L15-L16)", options: ["Removes properties", "Mapped type: { [K in keyof T]?: T[K] } — all properties optional", "Copies T", "Removes readonly"], correct: 1, explanation: "Partial is a mapped type that adds ? to every property." },
  { question: "What is key remapping with as? (L16)", options: ["Type assertion", "Renaming or filtering keys in a mapped type: as `get${Capitalize<K>}`", "Runtime rename", "Import alias"], correct: 1, explanation: "The as clause enables key transformation: renaming, filtering (never), or template-literal-based generation." },
  { question: "What does infer extract in a conditional type? (L17)", options: ["Variable values", "Type parts from a pattern: T extends Promise<infer U> -> U = inner type", "Runtime types", "Modules"], correct: 1, explanation: "infer declares a placeholder that TypeScript fills via pattern matching." },
  { question: "What happens with distributive conditional types and unions? (L17)", options: ["Nothing special", "The conditional is evaluated for EACH union member individually", "Compile error", "Only the first member"], correct: 1, explanation: "Distribution: IsString<string | number> becomes IsString<string> | IsString<number>." },
  { question: "What does `\\`${A}${B}\\`` produce when A and B are unions? (L18)", options: ["A | B", "Cartesian product of all combinations", "A & B", "Error"], correct: 1, explanation: "2 values in A x 3 in B = 6 string combinations as a union." },
  { question: "What does declare do in TypeScript? (L19)", options: ["Declares a variable", "Informs TypeScript about values that exist elsewhere — generates no code", "Creates classes", "Exports modules"], correct: 1, explanation: "declare says: 'This value exists, but not in my TypeScript code.' No JS output." },
  { question: "Why does module augmentation need `export {}`? (L19)", options: ["For the export", "So the file is treated as a module — declare global only works in modules", "Performance", "Best practice"], correct: 1, explanation: "Without export/import, the file is a script. declare global and declare module require module context." },
  { question: "What is the difference between never in the key vs. in the value of a mapped type? (L16)", options: ["No difference", "In the key: property is removed. In the value: property exists with type never", "Both remove the property", "Both produce an error"], correct: 1, explanation: "never in key remapping (as never) removes the key. never as a value makes the property unusable but does not remove it." },
  { question: "What is [T] extends [never] and why are the tuples needed? (L17)", options: ["Syntactic sugar", "Prevents distribution — checks whether T is truly never instead of distributing over an empty union", "Performance", "Not needed"], correct: 1, explanation: "Without [T], distribution would kick in for never and always yield never. [T] wraps T in a tuple and prevents that." },
  { question: "How do you generate event handler names from properties? (L16+L18)", options: ["Manually", "Template literal in key remapping: [K in keyof T as `on${Capitalize<K>}Change`]", "Runtime code", "Not possible"], correct: 1, explanation: "Mapped types + key remapping + template literal types + Capitalize = automatic event handler generation." },
  { question: "What does DeepPartial do differently than Partial? (L16)", options: ["Nothing", "Applies recursively to nested objects — all levels optional", "Removes properties", "Makes readonly"], correct: 1, explanation: "DeepPartial checks whether T[K] is an object and then applies itself recursively. Partial is only one level deep." },
  { question: "Which three concepts form the 'triumvirate' of the type system? (L16-L18)", options: ["Generics, Interfaces, Enums", "Mapped Types, Conditional Types, Template Literal Types", "Classes, Functions, Modules", "Union, Intersection, Literal"], correct: 1, explanation: "Mapped types + conditional types + template literal types together enable arbitrarily complex type transformations." },

  // ─── New question formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  {
    type: "short-answer",
    question: "What shared field makes a discriminated union exhaustively checkable? (L12)",
    expectedAnswer: "Tag field",
    acceptableAnswers: ["Tag field", "Tag", "Discriminant", "Discriminator", "type field", "kind", "Literal field", "tag"],
    explanation: "A shared literal field (e.g. type: 'circle' | type: 'rect') serves as the tag/discriminator. TypeScript can use it to determine the exact type in switch/if statements.",
  },
  {
    type: "short-answer",
    question: "What does `never` in the key remapping of a mapped type produce? (L16)",
    expectedAnswer: "Property is removed",
    acceptableAnswers: ["Property is removed", "removed", "Property removed", "Key is removed", "filtered", "filtered out"],
    explanation: "never in key remapping (as never) removes the key completely from the type. In contrast: never as a value type leaves the property in place but makes it unusable.",
  },
  {
    type: "predict-output",
    question: "What is the resulting type?",
    code: "type IsString<T> = [T] extends [string] ? true : false;\ntype Result = IsString<string | number>;",
    expectedAnswer: "false",
    acceptableAnswers: ["false", "type false"],
    explanation: "The [T] tuple-wrapping prevents distribution. string | number as a whole does NOT extend string, so the result is: false. Without the tuple it would be true | false.",
  },
  {
    type: "predict-output",
    question: "What is the resulting type?",
    code: "type EventHandler<T> = {\n  [K in keyof T as `on${Capitalize<string & K>}Change`]: (val: T[K]) => void;\n};\ntype Result = EventHandler<{ name: string; age: number }>;",
    expectedAnswer: "{ onNameChange: (val: string) => void; onAgeChange: (val: number) => void }",
    acceptableAnswers: ["{ onNameChange: (val: string) => void; onAgeChange: (val: number) => void }", "onNameChange: (val: string) => void, onAgeChange: (val: number) => void"],
    explanation: "Mapped type + key remapping + template literal + Capitalize: an event handler is generated for each property. name -> onNameChange, age -> onAgeChange.",
  },
  {
    type: "short-answer",
    question: "What is the keyword used to inform TypeScript about externally existing values without generating code? (L19)",
    expectedAnswer: "declare",
    acceptableAnswers: ["declare", "declare keyword"],
    explanation: "declare tells TypeScript that a value exists elsewhere. It generates no JavaScript output — it is purely for the compiler.",
  },
  {
    type: "explain-why",
    question: "Why is the combination of discriminated unions (L12), generics (L13), and the triumvirate (L16-18) so central to professional TypeScript?",
    modelAnswer: "Together these concepts form a complete type-level programming system. Discriminated unions model safe state machines with exhaustive checks. Generics enable reusable, type-safe abstractions. Mapped types transform object types, conditional types enable branching logic, and template literal types make string APIs type-safe. Together they allow you to express arbitrarily complex domain models that catch errors at compile time instead of runtime.",
    keyPoints: ["Discriminated unions for safe state modeling", "Generics for reusable abstractions", "The triumvirate for arbitrarily complex type transformations", "Compile-time safety instead of runtime errors"],
  },
];

export interface ElaboratedFeedback { whyCorrect: string; commonMistake: string; }
export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "The tag field is the discriminator that lets TypeScript determine the exact union member.", commonMistake: "Using a union without a tag field and then casting manually." },
  1: { whyCorrect: "Generics preserve type information throughout the entire call.", commonMistake: "Using any because it's 'easier' — loses all type checks." },
  2: { whyCorrect: "Overloads define the exact type transitions for each pipe length.", commonMistake: "A single type parameter T for all steps — then all steps must share the same type." },
  3: { whyCorrect: "Partial is a mapped type with the ? modifier. No magic, pure syntax.", commonMistake: "Thinking Partial is a built-in keyword rather than a mapped type." },
  4: { whyCorrect: "The as clause enables key transformation and filtering in the mapped type.", commonMistake: "Confusing it with type assertion (value as Type)." },
  5: { whyCorrect: "infer is a placeholder filled via pattern matching.", commonMistake: "Trying to use infer outside of extends — that doesn't work." },
  6: { whyCorrect: "Distribution automatically distributes over each union member individually.", commonMistake: "Expecting the union to be checked as a whole." },
  7: { whyCorrect: "Cartesian product: every combination of A and B is formed.", commonMistake: "Expecting a simple union A | B." },
  8: { whyCorrect: "declare generates no code — it only informs the compiler.", commonMistake: "Confusing declare with const and expecting code output." },
  9: { whyCorrect: "Module context is required for augmentation to be merged correctly.", commonMistake: "Forgetting export {} and wondering why the types don't take effect." },
  10: { whyCorrect: "never in the key = property gone. never in the value = property exists with an impossible type.", commonMistake: "Confusing the two and using never in the value for filtering." },
  11: { whyCorrect: "[T] prevents distribution and enables a true never check.", commonMistake: "Writing T extends never directly — that distributes over never and always yields never." },
  12: { whyCorrect: "The three features combined = a powerful code-generation system at the type level.", commonMistake: "Understanding the features individually but never combining them." },
  13: { whyCorrect: "Recursion is the key: DeepPartial applies itself to object properties.", commonMistake: "Thinking Partial is already deep — it is only one level." },
  14: { whyCorrect: "The triumvirate together enables type-level programming like no other language.", commonMistake: "Using only one or two of the three features instead of combining them." },
};