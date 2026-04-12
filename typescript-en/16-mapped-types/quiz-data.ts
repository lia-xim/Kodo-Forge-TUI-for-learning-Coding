/**
 * Lesson 16 — Quiz Data: Mapped Types
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "16";
export const lessonTitle = "Mapped Types";

export const questions: QuizQuestion[] = [
  {
    question: "What does the syntax `{ [K in keyof T]: T[K] }` describe?",
    options: [
      "A Mapped Type that iterates over all keys of T and preserves the respective value type",
      "A for loop over an array",
      "A function that copies T",
      "An interface that extends T",
    ],
    correct: 0,
    explanation: "Mapped Types iterate with `K in keyof T` over all keys and create a property with type T[K] for each key.",
  },
  {
    question: "What does the modifier `-?` do in a Mapped Type?",
    options: [
      "Adds optional",
      "Removes optional — makes the property required",
      "Removes the property entirely",
      "Makes the property nullable",
    ],
    correct: 1,
    explanation: "Minus-question-mark (-?) removes the optional modifier. This is how Required<T> works internally: { [K in keyof T]-?: T[K] }.",
  },
  {
    question: "What does `-readonly` do in a Mapped Type?",
    options: [
      "Adds readonly",
      "Makes the property optional",
      "Removes readonly — makes the property writable again",
      "Produces an error",
    ],
    correct: 2,
    explanation: "-readonly removes the readonly modifier. This is the opposite of Readonly<T> — often used as Mutable<T>.",
  },
  {
    question: "What is a 'homomorphic' Mapped Type?",
    options: [
      "A Mapped Type that only accepts strings",
      "A Mapped Type that is recursive",
      "A Mapped Type without conditionals",
      "A Mapped Type that uses `keyof T` as source and preserves original modifiers",
    ],
    correct: 3,
    explanation: "Homomorphic Mapped Types use keyof T and thereby preserve readonly and optional from the original — unless you change them explicitly.",
  },
  {
    question: "What does the `as` clause do in `[K in keyof T as NewKey]`?",
    options: [
      "Type Assertion",
      "Key Remapping — renames the keys",
      "Type Guard",
      "Type conversion",
    ],
    correct: 1,
    explanation: "The as clause (TS 4.1) enables Key Remapping: rename keys, transform with Template Literals, or filter with never.",
  },
  {
    question: "What happens when Key Remapping results in `never`?",
    options: [
      "The property is completely removed",
      "The property gets the type never",
      "There is a compile error",
      "The property becomes optional",
    ],
    correct: 0,
    explanation: "never in Key Remapping filters out the key. This is like filter() for object keys at the type level.",
    code: "type NoStrings<T> = {\n  [K in keyof T as T[K] extends string ? never : K]: T[K];\n};",
  },
  {
    question: "What does `[K in keyof T as \\`get${Capitalize<string & K>}\\`]: () => T[K]` generate?",
    options: [
      "Properties with the prefix 'get'",
      "Getter methods: getName(), getEmail(), etc. with correct return type",
      "String properties",
      "A function get()",
    ],
    correct: 1,
    explanation: "Template Literal Types in Key Remapping generate new key names. Capitalize<K> capitalizes the first letter.",
  },
  {
    question: "Why is `string & K` needed in Template Literal Keys?",
    options: [
      "Performance optimization",
      "Because K is always a number",
      "Because keyof T can also contain number | symbol — the intersection filters to string",
      "Because TypeScript requires it",
    ],
    correct: 2,
    explanation: "keyof T returns string | number | symbol. Template Literal Types only work with string. `string & K` filters to string keys.",
  },
  {
    question: "How do you check if a property is optional?",
    options: [
      "T[K] extends undefined",
      "K extends optional",
      "typeof T[K] === 'undefined'",
      "`{} extends Pick<T, K>` — if true, K is optional",
    ],
    correct: 3,
    explanation: "If K is optional, {} (empty object without K) can be assigned to Pick<T, K>. This does not work for required fields.",
  },
  {
    question: "What is the difference between `Partial<T>` and `DeepPartial<T>`?",
    options: [
      "No difference",
      "Partial makes only the first level optional, DeepPartial recursively all levels",
      "DeepPartial is faster",
      "DeepPartial only works with arrays",
    ],
    correct: 1,
    explanation: "Partial<T> makes only the immediate level optional. DeepPartial checks whether T[K] is an object and then recursively applies itself.",
  },
  {
    question: "What does `type FormErrors<T> = { [K in keyof T]?: string }` produce?",
    options: [
      "A type where each property can optionally be an error message (string)",
      "A type where all properties are required strings",
      "A type that validates form data",
      "A type that converts T to string",
    ],
    correct: 0,
    explanation: "FormErrors<T> maps each property to an optional string. Perfect for form error messages: errors.name = 'Required field'.",
  },
  {
    question: "What does `type CreateDTO<T extends Entity> = Omit<T, keyof Entity>` do?",
    options: [
      "Removes all properties from T",
      "Adds Entity fields",
      "Removes the auto-generated Entity fields (id, createdAt, updatedAt) for POST requests",
      "Makes all properties optional",
    ],
    correct: 2,
    explanation: "Omit<T, keyof Entity> removes id, createdAt, updatedAt. The caller only provides the 'own' fields — the Entity fields are generated server-side.",
  },
  {
    question: "What is `type Documented<T> = { [K in keyof T]: { value: T[K]; description: string } }`?",
    options: [
      "A type that generates documentation",
      "An interface for JSDoc",
      "A runtime documentation system",
      "A Mapped Type that wraps each property into an object with value and description",
    ],
    correct: 3,
    explanation: "This Mapped Type 'wraps' each value in a metadata object. Useful for config systems with built-in documentation.",
  },
  {
    question: "What does `PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>` combine?",
    options: [
      "Makes ONLY the specified keys optional, all others remain required",
      "Makes all properties optional",
      "Removes the specified keys",
      "Makes the specified keys readonly",
    ],
    correct: 0,
    explanation: "Omit removes K, Partial+Pick makes only K optional, & combines both. Result: only K is optional.",
  },
  {
    question: "Which pattern is used for reactive systems with Mapped Types?",
    options: [
      "FormErrors<T>",
      "CreateDTO<T>",
      "EventMap<T> — generates {K}Changed events with previousValue/newValue for each property",
      "DeepReadonly<T>",
    ],
    correct: 2,
    explanation: "EventMap<T> automatically generates change events for each property. Template Literal Keys generate the event names.",
    code: "type EventMap<T> = {\n  [K in keyof T as `${string & K}Changed`]: {\n    previousValue: T[K]; newValue: T[K];\n  };\n};",
  },

  // ─── New Question Formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  {
    type: "short-answer",
    question: "With which keyword do you remap keys in a Mapped Type?",
    expectedAnswer: "as",
    acceptableAnswers: ["as", "as clause", "as-clause", "as Clause"],
    explanation: "Key Remapping with 'as' was introduced in TypeScript 4.1 and allows renaming, transforming, or filtering keys.",
  },
  {
    type: "short-answer",
    question: "Which modifier prefix removes 'optional' in a Mapped Type? (Write the character followed by the question mark)",
    expectedAnswer: "-?",
    acceptableAnswers: ["-?", "minus ?", "-? (minus optional)"],
    explanation: "The prefix '-' before '?' removes the optional modifier. This is how Required<T> works internally: { [K in keyof T]-?: T[K] }.",
  },
  {
    type: "short-answer",
    question: "What is a Mapped Type called that uses 'keyof T' as its source and preserves the original modifiers?",
    expectedAnswer: "homomorphic",
    acceptableAnswers: ["homomorphic", "homomorphic", "homomorphic Mapped Type", "homomorphic mapped type"],
    explanation: "Homomorphic Mapped Types use keyof T and thereby preserve readonly and optional from the original — unless you change them explicitly.",
  },
  {
    type: "predict-output",
    question: "What is the resulting type?",
    code: "type User = { name: string; age: number; active: boolean };\ntype NoStrings<T> = {\n  [K in keyof T as T[K] extends string ? never : K]: T[K];\n};\ntype Result = NoStrings<User>;",
    expectedAnswer: "{ age: number; active: boolean }",
    acceptableAnswers: ["{ age: number; active: boolean }", "{ age: number, active: boolean }", "age: number, active: boolean"],
    explanation: "Key Remapping with never filters out keys whose value type is string. 'name' (string) is removed, 'age' (number) and 'active' (boolean) remain.",
  },
  {
    type: "predict-output",
    question: "What is the resulting type?",
    code: "type Config = { host: string; port: number };\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\ntype Result = Getters<Config>;",
    expectedAnswer: "{ getHost: () => string; getPort: () => number }",
    acceptableAnswers: ["{ getHost: () => string; getPort: () => number }", "{ getHost(): string; getPort(): number }", "getHost: () => string, getPort: () => number"],
    explanation: "Capitalize capitalizes the first letter, the Template Literal prepends 'get'. Each key becomes a getter method with the original return type.",
  },
  {
    type: "explain-why",
    question: "Why do homomorphic Mapped Types preserve the modifiers (readonly, optional) of the original, while non-homomorphic ones do not?",
    modelAnswer: "Homomorphic Mapped Types use 'keyof T' as source and TypeScript recognizes this pattern. The compiler therefore knows that the new type structurally corresponds to the original and automatically transfers readonly/optional. With non-homomorphic Mapped Types (e.g., with a custom string union as source) this connection to the original type is missing — TypeScript cannot know which modifiers should apply.",
    keyPoints: ["keyof T as source establishes the connection to the original", "Compiler recognizes the homomorphic pattern and transfers modifiers", "String unions as source lose the modifier information"],
  },
];

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Mapped Types are an iteration over all keys of a type with transformation.", commonMistake: "Confusion with for-in loops. Mapped Types exist ONLY at the type level." },
  1: { whyCorrect: "-? removes optional. The + is implicit with ? (= +?). Minus is the opposite.", commonMistake: "Confusion: -? does NOT remove the property, only the optional modifier." },
  2: { whyCorrect: "-readonly makes properties writable again. Useful for reversing Readonly<T>.", commonMistake: "Some think -readonly would remove the property. It only removes the modifier." },
  3: { whyCorrect: "Homomorphic Mapped Types preserve the structure. keyof T as source is the key.", commonMistake: "Mapped Types with a string union instead of keyof T are NOT homomorphic and lose modifiers." },
  4: { whyCorrect: "The as clause enables powerful Key Remapping that was impossible before TS 4.1.", commonMistake: "Confusion with Type Assertions (value as Type). In the Mapped Type, as is for Key Remapping." },
  5: { whyCorrect: "never means 'not present'. A key that is never is removed from the type.", commonMistake: "Some expect the property to get the type never. No — it disappears completely." },
  6: { whyCorrect: "Template Literal Types + Capitalize generate dynamic getter names with the correct type.", commonMistake: "Forgetting string & K. Without the intersection, K could also be number or symbol." },
  7: { whyCorrect: "keyof can also contain number (array indices) and symbol (symbol keys).", commonMistake: "Assumption that keyof always returns string. For arrays there are also number keys." },
  8: { whyCorrect: "The {} extends Pick<T, K> trick uses TypeScript's assignability rules for optional properties.", commonMistake: "Trying to check with T[K] extends undefined — that does not work reliably." },
  9: { whyCorrect: "Recursion is the key: DeepPartial applies itself to nested objects.", commonMistake: "Forgetting to include the function check. Without it, methods are also recursively processed." },
  10: { whyCorrect: "The ? makes each error property optional — not every field needs to have an error.", commonMistake: "Making all properties required strings — then you would have to provide empty strings for error-free fields." },
  11: { whyCorrect: "Omit<T, keyof Entity> removes exactly the auto-generated fields for the API.", commonMistake: "Manually removing id instead of using keyof Entity. When Entity gets new fields, they are missing." },
  12: { whyCorrect: "Mapped Types can transform the value type arbitrarily — even into complex objects.", commonMistake: "Thinking that Mapped Types can only do simple type changes. They can generate arbitrarily complex types." },
  13: { whyCorrect: "Omit + Partial + Pick is the standard combination for selective optional.", commonMistake: "Trying to build a Mapped Type with a Conditional instead of the simple Omit+Partial+Pick combination." },
  14: { whyCorrect: "EventMap with Template Literal Keys is an elegant pattern for change tracking.", commonMistake: "Manually defining events instead of automatically deriving them from the data type." },
};