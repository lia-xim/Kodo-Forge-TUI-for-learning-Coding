/**
 * Lektion 15 — Quiz-Daten: Utility Types
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "15";
export const lessonTitle = "Utility Types";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Partial Grundlagen ---
  {
    question: "What does `Partial<User>` do to the User interface?",
    options: [
      "Makes all properties optional",
      "Removes all properties",
      "Makes all properties readonly",
      "Makes all properties strings",
    ],
    correct: 0,
    explanation:
      "Partial<T> makes ALL properties optional (adds ?). " +
      "This is ideal for update operations where only changed fields are sent. " +
      "Internally: { [P in keyof T]?: T[P] }.",
  },

  // --- Frage 2: Required Effekt ---
  {
    question: "What happens with `Required<{ name?: string; age?: number }>`?",
    options: [
      "Everything becomes readonly",
      "Everything becomes nullable",
      "All optional properties become required fields",
      "Nothing — Required has no effect on optional properties",
    ],
    correct: 2,
    explanation:
      "Required<T> removes the ? from all properties. name and age become " +
      "required fields (string and number instead of string | undefined and number | undefined). " +
      "Internally: { [P in keyof T]-?: T[P] }.",
  },

  // --- Frage 3: Readonly shallow ---
  {
    question: "Is `Readonly<T>` deep or shallow?",
    options: [
      "Deep — all nested properties become readonly",
      "Depends on strictNullChecks",
      "Neither — Readonly only protects primitives",
      "Shallow — only the first level becomes readonly",
    ],
    correct: 3,
    explanation:
      "Readonly<T> is SHALLOW — it only makes properties at the first level " +
      "readonly. Nested objects can still be modified. " +
      "For deep immutability, DeepReadonly is needed.",
    code: "const x: Readonly<{ a: { b: string } }> = { a: { b: 'hi' } };\nx.a.b = 'changed'; // NO Error!",
  },

  // --- Frage 4: Pick vs Omit ---
  {
    question: "Which Utility Type is NOT type-safe with its keys?",
    options: [
      "Omit<T, K>",
      "Pick<T, K>",
      "Record<K, V>",
      "Required<T>",
    ],
    correct: 0,
    explanation:
      "Omit<T, K> accepts ANY strings as K — not just keys of T. " +
      "This means: Omit<User, 'typo'> does not produce an error! " +
      "Pick<T, K>, on the other hand, enforces K extends keyof T. " +
      "Solution: StrictOmit<T, K extends keyof T> = Omit<T, K>.",
    code: "type Broken = Omit<User, 'passwort'>; // Typo — no Error!",
  },

  // --- Frage 5: Record Grundlagen ---
  {
    question: "What best describes `Record<'a' | 'b' | 'c', number>`?",
    options: [
      "An array with 3 elements",
      "An object with exactly the keys 'a', 'b', 'c' and number values",
      "A union of 3 number types",
      "A Map with string keys",
    ],
    correct: 1,
    explanation:
      "Record<K, V> creates an object with the specified keys and value type V. " +
      "With Record<'a'|'b'|'c', number>, exactly three properties must be present " +
      "— all with number values. If a key is missing or an extra key is added, " +
      "it is a compile error.",
  },

  // --- Frage 6: Exclude Mechanismus ---
  {
    question: "What is the result of `Exclude<'a' | 'b' | 'c', 'a' | 'c'>`?",
    options: [
      '"a" | "c"',
      '"a" | "b" | "c"',
      'never',
      '"b"',
    ],
    correct: 3,
    explanation:
      "Exclude removes the specified members from the union. " +
      "'a' and 'c' are removed, 'b' remains. " +
      "Internally: T extends U ? never : T — applied distributively to each member.",
  },

  // --- Frage 7: Extract vs Exclude ---
  {
    question: "What is `Extract<string | number | boolean, string | number>`?",
    options: [
      "boolean",
      "string | number",
      "string | number | boolean",
      "never",
    ],
    correct: 1,
    explanation:
      "Extract keeps only the members that are assignable to the second type. " +
      "string is assignable to string (kept), number is assignable to number (kept), " +
      "boolean is assignable to neither string nor number (removed).",
  },

  // --- Frage 8: NonNullable ---
  {
    question: "What is `NonNullable<string | null | undefined | number>`?",
    options: [
      "string | null | number",
      "string | number",
      "string",
      "null | undefined",
    ],
    correct: 1,
    explanation:
      "NonNullable<T> removes null AND undefined from the type. " +
      "It is a special case of Exclude: Exclude<T, null | undefined>. " +
      "string and number remain, null and undefined are removed.",
  },

  // --- Frage 9: ReturnType + typeof ---
  {
    question: "Why is `typeof` needed in `ReturnType<typeof myFunc>`?",
    options: [
      "ReturnType expects a TYPE, not a value — typeof extracts the type",
      "typeof is optional — both forms work",
      "typeof makes the function async",
      "typeof is a runtime operator",
    ],
    correct: 0,
    explanation:
      "ReturnType<T> expects a function TYPE as a type parameter. " +
      "myFunc is a value (the function itself). typeof extracts the " +
      "TypeScript type from a value. Without typeof, TypeScript would " +
      "interpret myFunc as a value — an error in a type position.",
    code: "function f() { return 42; }\ntype R = ReturnType<typeof f>; // number\n// type R = ReturnType<f>;       // Error!",
  },

  // --- Frage 10: Awaited verschachtelt ---
  {
    question: "What is `Awaited<Promise<Promise<string>>>`?",
    options: [
      "Promise<string>",
      "Promise<Promise<string>>",
      "string",
      "Error — nested Promises not supported",
    ],
    correct: 2,
    explanation:
      "Awaited<T> unwraps Promises RECURSIVELY — not just one level. " +
      "Promise<Promise<string>> becomes string. " +
      "Even Promise<Promise<Promise<number>>> becomes number. " +
      "Non-Promises remain unchanged: Awaited<string> is string.",
  },

  // --- Frage 11: Parameters Rueckgabe ---
  {
    question: "What does `Parameters<typeof fn>` return when fn = (a: string, b: number) => void?",
    options: [
      "string | number",
      "[a: string, b: number]",
      "{ a: string; b: number }",
      "void",
    ],
    correct: 1,
    explanation:
      "Parameters<T> returns the parameters as a TUPLE — not as a union or object. " +
      "Tuples preserve order and length. " +
      "Parameters<typeof fn>[0] would be string, [1] would be number.",
  },

  // --- Frage 12: DeepPartial Rekursion ---
  {
    question: "Why does DeepPartial need a special case for arrays?",
    options: [
      "Arrays are not objects in TypeScript",
      "TypeScript cannot handle recursive types",
      "Without special handling, the array itself would be treated as an object and its methods made optional",
      "Arrays cannot be partial",
    ],
    correct: 2,
    explanation:
      "Arrays are technically objects. Without special handling, " +
      "DeepPartial would make the array methods (push, pop, etc.) optional " +
      "instead of recursively transforming the ELEMENT type. " +
      "Hence: T extends (infer U)[] ? DeepPartial<U>[] : ...",
  },

  // --- Frage 13: Mutable Modifier ---
  {
    question: "What does `-readonly` mean in a Mapped Type?",
    options: [
      "Adds readonly",
      "Makes the property negative",
      "Syntax error — there is no -readonly",
      "Removes readonly from all properties",
    ],
    correct: 3,
    explanation:
      "The minus sign (-) REMOVES a modifier. " +
      "-readonly removes readonly, -? removes optional. " +
      "Required<T> uses -? internally: { [P in keyof T]-?: T[P] }. " +
      "Mutable<T> uses -readonly: { -readonly [P in keyof T]: T[P] }.",
  },

  // --- Frage 14: Composition Pattern ---
  {
    question: "What best describes `Pick<T, K> & Partial<Omit<T, K>>`?",
    options: [
      "All properties required",
      "All properties optional",
      "K stays as in the original, rest becomes optional",
      "K is removed, rest remains",
    ],
    correct: 2,
    explanation:
      "Pick<T, K> keeps K with the original type (required if it was required). " +
      "Partial<Omit<T, K>> makes the entire rest optional. " +
      "The intersection (&) combines both. " +
      "This is THE pattern for 'id required, rest optional' in update operations.",
    code: "type Update = Pick<User, 'id'> & Partial<Omit<User, 'id'>>;\n// id: required, rest: optional",
  },

  // --- Frage 15: Awaited + ReturnType ---
  {
    question: "What is the standard pattern to get the 'real' return type of an async function?",
    options: [
      "Awaited<ReturnType<typeof fn>>",
      "Awaited<typeof fn>",
      "ReturnType<typeof fn>",
      "Parameters<typeof fn>",
    ],
    correct: 0,
    explanation:
      "ReturnType<typeof fn> returns Promise<...> for async functions. " +
      "Awaited unwraps the Promise. The combination Awaited<ReturnType<typeof fn>> " +
      "gives the 'true' return type — without the Promise wrapper. " +
      "This is one of the most common patterns in TypeScript projects.",
    code: "async function fetchUser() { return { name: 'Max' }; }\ntype User = Awaited<ReturnType<typeof fetchUser>>;\n// { name: string }",
  },

  // ─── Zusaetzliche Frageformate ────────────────────────────────────────────

  // --- Frage 16: Short-Answer ---
  {
    type: "short-answer",
    question: "Which Utility Type is used to make all properties optional?",
    expectedAnswer: "Partial",
    acceptableAnswers: ["Partial", "Partial<T>"],
    explanation:
      "Partial<T> makes all properties of T optional. " +
      "Internally: { [P in keyof T]?: T[P] }. Ideal for update operations " +
      "where only changed fields are sent.",
  },

  // --- Frage 17: Short-Answer ---
  {
    type: "short-answer",
    question: "What does the minus sign mean in { -readonly [P in keyof T]: T[P] }? What is the resulting type called?",
    expectedAnswer: "Mutable",
    acceptableAnswers: ["Mutable", "Mutable<T>", "removes readonly", "remove modifier"],
    explanation:
      "The minus sign (-) REMOVES a modifier. -readonly removes " +
      "readonly from all properties. The resulting type is often called Mutable<T> " +
      "— the opposite of Readonly<T>.",
  },

  // --- Frage 18: Short-Answer ---
  {
    type: "short-answer",
    question: "Which Utility Type removes null and undefined from a union type?",
    expectedAnswer: "NonNullable",
    acceptableAnswers: ["NonNullable", "NonNullable<T>"],
    explanation:
      "NonNullable<T> is a special case of Exclude: Exclude<T, null | undefined>. " +
      "It removes both null and undefined from the type. " +
      "NonNullable<string | null | undefined> results in string.",
  },

  // --- Frage 19: Predict-Output ---
  {
    type: "predict-output",
    question: "What type does result have? Give the precise type.",
    code: "type User = { name: string; age: number; email: string };\ntype Result = Pick<User, 'name' | 'email'>;\n// What are the properties of Result?",
    expectedAnswer: "{ name: string; email: string }",
    acceptableAnswers: ["{ name: string; email: string }", "name: string, email: string", "name and email"],
    explanation:
      "Pick<User, 'name' | 'email'> selects only the properties 'name' and 'email' " +
      "from User. age is not included. Pick is type-safe — " +
      "Pick<User, 'typo'> would be a compile error.",
  },

  // --- Frage 20: Predict-Output ---
  {
    type: "predict-output",
    question: "What type does X have? Give the precise type.",
    code: "type X = Exclude<'a' | 'b' | 'c' | 'd', 'b' | 'd'>;",
    expectedAnswer: "'a' | 'c'",
    acceptableAnswers: ["'a' | 'c'", "\"a\" | \"c\"", "a | c"],
    explanation:
      "Exclude removes distributively: 'a' remains (not in 'b'|'d'), " +
      "'b' is removed, 'c' remains, 'd' is removed. " +
      "Result: 'a' | 'c'. Exclude works member by member.",
  },

  // --- Frage 21: Explain-Why ---
  {
    type: "explain-why",
    question: "Why is Readonly<T> in TypeScript only shallow and not deep? What consequence does this have for nested objects?",
    modelAnswer:
      "Readonly<T> uses { readonly [P in keyof T]: T[P] } — it only acts on " +
      "the direct level. Nested objects are their own references that are not " +
      "captured by Readonly. This means: obj.nested.prop = 'new' is allowed, " +
      "even though obj is readonly. For deep immutability, a recursive " +
      "DeepReadonly<T> is needed that applies itself to every level.",
    keyPoints: [
      "Mapped Types only act on one level",
      "Nested objects remain mutable",
      "DeepReadonly<T> is needed for deep immutability",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Zusaetzliche Erklaerungen fuer jede Frage: Warum die richtige Antwort
// richtig ist und welche Fehlkonzeption am haeufigsten vorkommt.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Partial<T> iterates over all keys of T and adds ? to each. " +
      "This is a Mapped Type: { [P in keyof T]?: T[P] }.",
    commonMistake:
      "Many confuse Partial with Pick — Partial makes ALL optional, " +
      "Pick selects specific ones.",
  },
  1: {
    whyCorrect:
      "Required<T> removes the ? with the -? modifier. " +
      "Each optional property becomes a required property.",
    commonMistake:
      "Some think Required adds new properties. " +
      "It only changes the modifier (optional -> required).",
  },
  2: {
    whyCorrect:
      "Readonly<T> uses { readonly [P in keyof T]: T[P] } — this only acts " +
      "on the direct level. Nested objects are separate references.",
    commonMistake:
      "Almost everyone assumes Readonly is deep. This is the most common " +
      "Utility Type misconception. For deep: build your own DeepReadonly.",
  },
  3: {
    whyCorrect:
      "Omit is defined as Omit<T, K extends string | number | symbol> — " +
      "K does not need to be a key of T. This was designed for flexibility.",
    commonMistake:
      "Most expect Omit to only accept existing keys. " +
      "StrictOmit<T, K extends keyof T> is the safe alternative.",
  },
  4: {
    whyCorrect:
      "Record<K, V> with a union as K creates an object with exactly " +
      "those keys. If one is missing or an extra one is added, there is an error.",
    commonMistake:
      "Record is confused with Map. Record is a type alias for an object, " +
      "Map is a runtime data structure.",
  },
  5: {
    whyCorrect:
      "Exclude is distributive: Each member is checked individually. " +
      "'a' extends 'a'|'c'? never. 'b' extends 'a'|'c'? 'b'. 'c' extends 'a'|'c'? never.",
    commonMistake:
      "Some confuse Exclude with Extract. " +
      "Exclude REMOVES, Extract KEEPS.",
  },
  6: {
    whyCorrect:
      "Extract keeps members that are assignable to the target type. " +
      "string is assignable to string, number is assignable to number, boolean is neither.",
    commonMistake:
      "Extract and Exclude are confused. " +
      "Mnemonic: Extract = keep (extract), Exclude = remove (exclude).",
  },
  7: {
    whyCorrect:
      "NonNullable is Exclude<T, null | undefined>. " +
      "It removes both nullable types from the union.",
    commonMistake:
      "Some think NonNullable only removes null, not undefined. " +
      "It removes BOTH.",
  },
  8: {
    whyCorrect:
      "TypeScript strictly distinguishes between values and types. " +
      "typeof is the bridge: it extracts the type from a value.",
    commonMistake:
      "Many forget typeof and then get the error " +
      "'myFunc refers to a value, but is being used as a type here'.",
  },
  9: {
    whyCorrect:
      "Awaited unwraps recursively — it calls itself until no " +
      "Promise remains. This was introduced in TS 4.5.",
    commonMistake:
      "Before TS 4.5, unwrapping had to be done manually. Nested Promises " +
      "required multiple applications. Awaited solves this.",
  },
  10: {
    whyCorrect:
      "Parameters returns a tuple — ordered, with fixed length. " +
      "This preserves parameter order and enables spread syntax.",
    commonMistake:
      "Some expect an object with named properties. " +
      "Function parameters have no 'keys' — only positions.",
  },
  11: {
    whyCorrect:
      "Arrays inherit from Object. Without special handling, keyof " +
      "would iterate over array methods instead of the element type.",
    commonMistake:
      "Many forget the array special case and wonder " +
      "why push, pop, etc. become optional.",
  },
  12: {
    whyCorrect:
      "- is the modifier remover. -readonly removes readonly, " +
      "-? removes optional. + is the default (add).",
    commonMistake:
      "Some consider -readonly to be invalid. It is an official " +
      "TypeScript feature since TS 2.8.",
  },
  13: {
    whyCorrect:
      "The intersection (&) combines Pick (required keys) with " +
      "Partial<Omit> (optional rest). This yields the PartialExcept pattern.",
    commonMistake:
      "The order is confused: Pick<T,K> & Partial<Omit<T,K>> " +
      "(K required) vs Partial<T> & Required<Pick<T,K>> (K explicitly required).",
  },
  14: {
    whyCorrect:
      "ReturnType returns Promise<X>, Awaited unwraps to X. " +
      "The combination is standard for async function type extraction.",
    commonMistake:
      "Many forget Awaited and then work with Promise<...> instead of " +
      "the unwrapped type. Or they use ReturnType alone.",
  },
};