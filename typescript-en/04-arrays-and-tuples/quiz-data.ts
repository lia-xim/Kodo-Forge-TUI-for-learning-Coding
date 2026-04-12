```typescript
/**
 * Lesson 04 — Quiz Data: Arrays & Tuples
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "04";
export const lessonTitle = "Arrays & Tuples";

export const questions: QuizQuestion[] = [
  // --- Question 1: Identifying Array vs Tuple ---
  {
    question: "Which type is a tuple?",
    options: [
      "string[]",
      "Array<number>",
      "[string, number, boolean]",
      "(string | number)[]",
    ],
    correct: 2,
    explanation:
      "[string, number, boolean] is a tuple — it has a fixed length (3) " +
      "and each position has its own type. The others are all arrays " +
      "with variable length.",
  },

  // --- Question 2: Inference with mixed values ---
  {
    question: "What type does TypeScript infer for this variable?",
    code: 'const arr = [1, "hello", true];',
    options: [
      "[number, string, boolean]",
      "readonly [1, \"hello\", true]",
      "(string | number | boolean)[]",
      "any[]",
    ],
    correct: 2,
    explanation:
      "Without an explicit annotation or 'as const', TypeScript infers an " +
      "array with a union type: (string | number | boolean)[]. NO tuple is " +
      "inferred! This is a deliberate design decision: TypeScript " +
      "assumes you want a flexible array.",
  },

  // --- Question 3: readonly behavior ---
  {
    question: "Which operation is allowed on a 'readonly string[]'?",
    options: [
      "arr.push('new')",
      "arr.sort()",
      "arr.filter(x => x.length > 3)",
      "arr[0] = 'changed'",
    ],
    correct: 2,
    explanation:
      "filter() is allowed because it returns a NEW array and does not " +
      "modify the original. push(), sort(), and index assignment are " +
      "blocked because they would mutate the array.",
  },

  // --- Question 4: T[] vs Array<T> ---
  {
    question: "What is the difference between 'number[]' and 'Array<number>'?",
    options: [
      "number[] is faster at runtime",
      "Array<number> supports more methods",
      "There is no difference — both produce the same type",
      "number[] is a tuple, Array<number> is an array",
    ],
    correct: 2,
    explanation:
      "number[] and Array<number> are exactly the same type. number[] is " +
      "syntactic sugar for Array<number>. Array<T> is a generic " +
      "interface in lib.es5.d.ts — so you are already using generics " +
      "when you write string[]!",
  },

  // --- Question 5: Tuple push problem ---
  {
    question: "What happens with this code?",
    code: "const pair: [string, number] = [\"hello\", 42];\npair.push(true);",
    options: [
      "Compile error: push is not allowed on tuples",
      "Compile error: true is not string | number",
      "No error — TypeScript allows push on mutable tuples",
      "Runtime error",
    ],
    correct: 1,
    explanation:
      "push() is allowed on mutable tuples, but the argument type is " +
      "checked. push only accepts 'string | number' (the union of the " +
      "tuple elements), and 'true' (boolean) does not belong to that. " +
      "Use 'readonly' tuples to block push entirely!",
  },

  // --- Question 6: as const behavior ---
  {
    question: "What type does 'x' have?",
    code: 'const x = ["a", 1] as const;',
    options: [
      "(string | number)[]",
      "[string, number]",
      "readonly [string, number]",
      'readonly ["a", 1]',
    ],
    correct: 3,
    explanation:
      "'as const' does two things: (1) The array becomes a readonly " +
      "tuple and (2) all values become literal types. Therefore the " +
      'type is readonly ["a", 1] — not readonly [string, number]! ' +
      "Preventing widening (string instead of \"a\") is the core of as const.",
  },

  // --- Question 7: Rest elements ---
  {
    question: "Which values are valid for the type [string, ...number[]]?",
    code: "type T = [string, ...number[]];",
    options: [
      '["hello", 1, 2, 3] only — at least one number required',
      '["hello"] only — rest element can be empty',
      '["hello"], ["hello", 1], ["hello", 1, 2, 3] — all valid',
      '[] — empty array is also valid',
    ],
    correct: 2,
    explanation:
      "A rest element (...number[]) can also be empty (0 elements). " +
      'Therefore all variants are valid: ["hello"] with 0 numbers, ' +
      '["hello", 1] with 1 number, ["hello", 1, 2, 3] with 3 numbers, etc. ' +
      "Only the first element (string) is required. An empty array is " +
      "invalid because the string is missing.",
  },

  // --- Question 8: Readonly assignment ---
  {
    question: "Which assignment is allowed?",
    code:
      "const mutable: string[] = [\"A\", \"B\"];\n" +
      "const readonly1: readonly string[] = [\"X\"];\n" +
      "// Which assignment works?",
    options: [
      "const a: string[] = readonly1;",
      "const b: readonly string[] = mutable;",
      "Both work",
      "Neither works",
    ],
    correct: 1,
    explanation:
      "mutable -> readonly is allowed (giving fewer rights is safe). " +
      "readonly -> mutable is NOT allowed (you could then mutate, " +
      "even though the original type prohibits it). Think of it like a " +
      "one-way street: you can take away capabilities, but not add them.",
  },

  // --- Question 9: Labeled tuple ---
  {
    question: "What do labels in a tuple type do?",
    code: "type Point = [x: number, y: number];",
    options: [
      "They create properties — you can write point.x",
      "They change the type — [x: number, y: number] is not equal to [number, number]",
      "They are purely documentary — improve IDE tooltips and error messages",
      "They make the tuple readonly",
    ],
    correct: 2,
    explanation:
      "Labels in tuples are purely documentary. They do not affect the type — " +
      "[x: number, y: number] and [number, number] are identical. " +
      "But they improve the developer experience: IDE tooltips show the " +
      "label names, and error messages become more understandable.",
  },

  // --- Question 10: Spread and tuple type ---
  {
    question: "What type does 'result' have?",
    code:
      "const tuple: [string, number] = [\"hello\", 42];\n" +
      "const result = [...tuple];",
    options: [
      "[string, number]",
      "readonly [string, number]",
      "(string | number)[]",
      "[\"hello\", 42]",
    ],
    correct: 2,
    explanation:
      "When a tuple is copied with the spread operator into a new array, " +
      "it LOSES its tuple type! TypeScript instead infers " +
      "a regular array with a union type: (string | number)[]. " +
      "To preserve the tuple type, an explicit annotation is required.",
  },

  // --- Question 11: Understanding covariance ---
  {
    question: "Why is this code problematic even though it compiles?",
    code:
      "const admins: (\"admin\" | \"mod\")[] = [\"admin\", \"mod\"];\n" +
      "const users: string[] = admins;\n" +
      "users.push(\"hacker\");",
    options: [
      "This code does not compile — string[] is not compatible with (\"admin\" | \"mod\")[]",
      "users.push() throws a runtime error",
      "admins now contains \"hacker\", but its type says (\"admin\" | \"mod\")[]",
      "The code is correct and has no problem",
    ],
    correct: 2,
    explanation:
      "This is a covariance problem: (\"admin\" | \"mod\")[] is a subtype " +
      "of string[] (covariance). But after the assignment, both point to " +
      "the same array. Through 'users' you can push \"hacker\" — which then " +
      "also ends up in 'admins', even though the type does not allow it. " +
      "TypeScript permits this out of pragmatism, but it is technically unsound. " +
      "readonly arrays solve this problem.",
  },

  // --- Question 12: .length type for tuples vs arrays ---
  {
    question: "What is the type of 'len'?",
    code:
      "const tup: [string, number, boolean] = [\"a\", 1, true];\n" +
      "const len = tup.length;",
    options: [
      "number",
      "3",
      "1 | 2 | 3",
      "number | undefined",
    ],
    correct: 1,
    explanation:
      "For tuples, .length is a literal type! [string, number, boolean] " +
      "always has exactly 3 elements, so tup.length is of type 3 (not number). " +
      "For a regular array, .length would be of type number. " +
      "This is another fundamental difference between arrays and tuples.",
  },

  // --- Question 13: noUncheckedIndexedAccess ---
  {
    question: "With 'noUncheckedIndexedAccess: true' — what type does 'val' have?",
    code:
      "const arr: string[] = [\"hello\"];\n" +
      "const val = arr[0];",
    options: [
      "string",
      "string | undefined",
      "string | null",
      "\"hello\"",
    ],
    correct: 1,
    explanation:
      "With noUncheckedIndexedAccess, EVERY array index access is treated as " +
      "potentially undefined. arr[0] then has the type " +
      "string | undefined, even if we can see the element exists. " +
      "BUT: For tuples, known positions are NOT affected — a " +
      "tuple [string, number] always has type string at position 0 (without | undefined).",
  },

  // --- Question 14: filter with type predicate ---
  {
    question: "What type does 'result' have?",
    code:
      "const arr: (string | number)[] = [\"a\", 1, \"b\", 2];\n" +
      "const result = arr.filter(x => typeof x === \"string\");",
    options: [
      "string[]",
      "(string | number)[]",
      "(string | number | undefined)[]",
      "never[]",
    ],
    correct: 0,
    explanation:
      "Since TypeScript 5.5, filter() automatically recognizes type predicates for " +
      "simple typeof checks. The callback `x => typeof x === \"string\"` " +
      "is inferred as a type guard, so the result is string[]. " +
      "In older TypeScript versions (before 5.5) the result would be " +
      "(string | number)[] and an explicit type predicate was needed: " +
      "arr.filter((x): x is string => typeof x === \"string\").",
  },

  // --- Question 15: Deep understanding — Why doesn't TS infer a tuple? ---
  {
    question: "WHY does TypeScript infer 'number[]' instead of a tuple for 'const p = [1, 2]'?",
    code: "const p = [1, 2]; // Type: number[], not [number, number]",
    options: [
      "Because TypeScript doesn't know tuples — you always have to annotate",
      "Because arrays are mutable and their length can change",
      "Because square brackets always create arrays, never tuples",
      "Because const only protects the reference, not the content",
    ],
    correct: 1,
    explanation:
      "TypeScript infers number[] instead of [number, number] because arrays " +
      "are MUTABLE by default. You could later call p.push(3) or " +
      "p.pop(). A tuple type would then be too restrictive and would " +
      "block many common operations. 'const' protects the " +
      "variable (you cannot reassign p), but the CONTENT of the array " +
      "remains changeable. Only 'as const' tells TypeScript: 'Treat this " +
      "as immutable and use the narrowest possible types.'",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // New formats: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 16: Short-Answer — readonly methods ---
  {
    type: "short-answer",
    question:
      "Which array method is allowed on 'readonly string[]': push(), sort(), or filter()?",
    expectedAnswer: "filter",
    acceptableAnswers: ["filter", "filter()", ".filter()", ".filter"],
    explanation:
      "filter() is allowed on readonly arrays because it returns a NEW array and " +
      "does not modify the original. push() and sort() mutate the original and are " +
      "therefore blocked on readonly arrays. In general: only non-mutating methods " +
      "(filter, map, slice, concat, etc.) are available on readonly arrays.",
  },

  // --- Question 17: Short-Answer — Tuple length ---
  {
    type: "short-answer",
    question:
      "What type does .length have for a tuple of type [string, number, boolean]? " +
      "(Give the exact type, not 'number')",
    expectedAnswer: "3",
    acceptableAnswers: ["3", "Literal 3", "literal 3"],
    explanation:
      "For tuples, .length is a literal type! Since [string, number, boolean] always " +
      "has exactly 3 elements, tup.length is of type 3 (not number). For a regular array " +
      ".length would be of type number. This is a fundamental difference between " +
      "arrays and tuples.",
  },

  // --- Question 18: Predict-Output — Spread loss ---
  {
    type: "predict-output",
    question:
      "What is the type inferred by TypeScript for 'copy'? " +
      "(Give the type, e.g. 'string[]' or '[string, number]')",
    code: `const original: [string, number] = ["hello", 42];\nconst copy = [...original];`,
    expectedAnswer: "(string | number)[]",
    acceptableAnswers: ["(string | number)[]", "Array<string | number>", "(string|number)[]", "string | number[]"],
    explanation:
      "When a tuple is copied with the spread operator, it LOSES its tuple type! " +
      "TypeScript instead infers a regular array with a union type: (string | number)[]. " +
      "The fixed length and position-specific types are lost. " +
      "An explicit annotation is required to preserve the tuple type.",
  },

  // --- Question 19: Predict-Output — as const ---
  {
    type: "predict-output",
    question: "What is the type of 'x[1]' according to TypeScript?",
    code: `const x = ["hallo", 99, true] as const;\n// typeof x[1] = ???`,
    expectedAnswer: "99",
    acceptableAnswers: ["99", "Literal 99", "literal 99"],
    explanation:
      "'as const' makes the array a readonly tuple with literal types: " +
      "readonly ['hallo', 99, true]. At position 1 is the literal type 99 " +
      "(not number!). Preventing widening is the core of 'as const'.",
  },

  // --- Question 20: Short-Answer — noUncheckedIndexedAccess ---
  {
    type: "short-answer",
    question:
      "Which tsconfig option makes array index accesses 'T | undefined' instead of just 'T'?",
    expectedAnswer: "noUncheckedIndexedAccess",
    acceptableAnswers: ["noUncheckedIndexedAccess", "noUncheckedIndexedAccess: true", "nouncheckedindexedaccess"],
    explanation:
      "With noUncheckedIndexedAccess, EVERY array index access is treated as potentially " +
      "undefined. arr[0] then has type T | undefined. This is safer " +
      "because the index could be outside the array bounds. " +
      "For tuples, known positions are NOT affected by this.",
  },

  // --- Question 21: Explain-Why — Why no tuple for array literals? ---
  {
    type: "explain-why",
    question:
      "Why does TypeScript infer the type number[] for 'const p = [1, 2]' " +
      "instead of [number, number], even though const is used?",
    modelAnswer:
      "const only protects the variable binding (p cannot be reassigned), " +
      "but not the contents of the array. You could run p.push(3), p.pop(), or p[0] = 99. " +
      "A tuple type [number, number] would be too restrictive and would block many " +
      "common array operations. TypeScript therefore chooses the more flexible " +
      "number[] type. Only 'as const' signals: 'Treat this as immutable " +
      "and use the narrowest possible types.'",
    keyPoints: [
      "const protects the variable, not the array contents",
      "push(), pop(), splice() would be blocked on a tuple type",
      "TypeScript pragmatically chooses the more flexible array type",
      "'as const' is needed for true tuple inference with literal types",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Elaborated feedback — deeper explanations per question
// ═══════════════════════════════════════════════════════════════════════════════

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  // Question 1: Array vs Tuple identification
  0: {
    whyCorrect:
      "A tuple has a FIXED length and each position has its own type. " +
      "[string, number, boolean] defines exactly 3 positions. The other " +
      "options (string[], Array<number>, (string | number)[]) all describe " +
      "arrays with variable length and a uniform element type.",
    commonMistake:
      "Many confuse (string | number | boolean)[] with a tuple. " +
      "But a union array allows any number of elements in any " +
      "order — a tuple enforces the exact structure.",
  },

  // Question 2: Inference with mixed values
  1: {
    whyCorrect:
      "TypeScript ALWAYS infers an array from array literals, never a tuple. " +
      "The values 1, 'hello', true are combined into the union (string | number | boolean). " +
      "This is a deliberate design decision: since arrays " +
      "are mutable, a tuple type would be too restrictive.",
    commonMistake:
      "Confusion with [number, string, boolean] is tempting — " +
      "the values DO look like a tuple. But TS looks at the " +
      "intended usage: a mutable array, not a fixed structure. " +
      "For a tuple you need 'as const' or an explicit annotation.",
  },

  // Question 3: readonly behavior
  2: {
    whyCorrect:
      "filter() creates a NEW array from elements that pass the test. " +
      "The original is not modified — that's why it is allowed on readonly. " +
      "The ReadonlyArray definition in lib.es5.d.ts includes filter(), map(), " +
      "slice() etc., but NOT push(), sort(), or pop().",
    commonMistake:
      "sort() seems harmless because you 'get the result back'. " +
      "But sort() sorts IN-PLACE and returns the same array — " +
      "it mutates the original! Therefore it is forbidden on readonly.",
  },

  // Question 4: T[] vs Array<T>
  3: {
    whyCorrect:
      "number[] is purely syntactic sugar. The TypeScript compiler " +
      "treats both forms identically — they produce exactly the same " +
      "type in the type system. In lib.es5.d.ts, Array<T> is defined as a generic " +
      "interface, and T[] is a shorthand for it.",
    commonMistake:
      "Some believe Array<T> is 'more modern' or 'better'. In reality " +
      "it is a matter of taste. T[] is more compact for simple types, " +
      "Array<T> is more readable for complex types like Array<string | number>.",
  },

  // Question 5: Tuple push problem
  4: {
    whyCorrect:
      "push() on mutable tuples accepts the union of all element types. " +
      "For [string, number], push() only accepts string | number. " +
      "true is boolean — that doesn't belong to the union, so an error occurs. " +
      "pair.push('world') or pair.push(99) would compile.",
    commonMistake:
      "Many think push() is completely forbidden on tuples. That is only " +
      "true for READONLY tuples. Mutable tuples allow push(), but with " +
      "a type check on the element union. This is a known weakness — " +
      "the tuple then has more elements than its type promises.",
  },

  // Question 6: as const behavior
  5: {
    whyCorrect:
      "'as const' has THREE effects: (1) readonly — the array becomes a tuple " +
      "and is no longer mutable. (2) Literal narrowing — 'a' stays " +
      "the literal type 'a' (not string), and 1 stays the literal type 1 " +
      "(not number). (3) Fixed length — the array is treated as a tuple with " +
      "exact length. Together this gives: readonly ['a', 1].",
    commonMistake:
      "readonly [string, number] forgets the literal narrowing effect. " +
      "Many know that 'as const' makes things readonly, but overlook " +
      "that it also narrows types to literals. That is the actual " +
      "core feature of 'as const'.",
  },

  // Question 7: Rest elements
  6: {
    whyCorrect:
      "A rest element (...number[]) means '0 or more elements'. " +
      "It is like a spread in reverse — it collects any number of " +
      "(even zero) values. Only the fixed positions before it are " +
      "required — here the string at position 0.",
    commonMistake:
      "Many assume at least one element must be present in the rest. " +
      "But ...number[] is number[] — and an empty array is a " +
      "valid number[]. The string at the beginning is required, the numbers after it are not.",
  },

  // Question 8: Readonly assignment
  7: {
    whyCorrect:
      "mutable -> readonly is like 'taking away rights': You give someone " +
      "read access to something you could also write. That is safe. " +
      "readonly -> mutable would be 'adding rights': The array could then " +
      "be mutated even though it was declared as readonly. Unsafe!",
    commonMistake:
      "The thinking 'readonly is a different type, so no direction " +
      "works' leads to option D. But readonly is a subtype relationship: " +
      "string[] is a subtype of readonly string[] (has more capabilities).",
  },

  // Question 9: Labeled tuple
  8: {
    whyCorrect:
      "Labels in tuples exist ONLY for documentation. They are " +
      "preserved in the .d.ts file and appear in IDE tooltips, " +
      "but they do NOT create properties. point.x does not exist — " +
      "it stays at point[0]. The type [x: number, y: number] is " +
      "structurally identical to [number, number].",
    commonMistake:
      "The name 'label' suggests property access like with objects. " +
      "But tuples remain internally arrays with numeric indices. " +
      "If you need .x, use an object { x: number, y: number }.",
  },

  // Question 10: Spread and tuple type
  9: {
    whyCorrect:
      "The spread operator creates a NEW array. TypeScript cannot " +
      "guarantee that the new array has the same fixed length as the " +
      "original (multiple spreads could be combined, for example). Therefore it " +
      "falls back to the safest common type: (string | number)[].",
    commonMistake:
      "Expecting [string, number] is tempting — you are just copying after all. " +
      "But TypeScript treats [...tuple] like a fresh array literal. " +
      "Since TS 4.0 there are better tuple spreads in generic contexts, " +
      "but for concrete values it remains an array.",
  },

  // Question 11: Understanding covariance
  10: {
    whyCorrect:
      "After the assignment, admins and users point to THE SAME array object " +
      "in memory. Through users (type string[]) you can push arbitrary strings. " +
      "These also end up in admins, even though the type ('admin' | 'mod')[] " +
      "only allows these two values. TypeScript recognizes the problem but permits " +
      "it out of pragmatism — too much existing code would break.",
    commonMistake:
      "Option A assumes the assignment itself fails. But covariance " +
      "allows the assignment (narrower type -> wider type). " +
      "The problem lies in the subsequent MUTATION, not in the assignment.",
  },

  // Question 12: .length type for tuples
  11: {
    whyCorrect:
      "TypeScript knows the exact length of a tuple. Since [string, number, boolean] " +
      "always has exactly 3 elements, .length is the literal type 3. This is a " +
      "fundamental difference from arrays (type number), because in arrays the " +
      "length is variable.",
    commonMistake:
      "'number' is the intuitive answer — .length does return a number. " +
      "But TypeScript is more precise than you might think. For tuples, .length " +
      "becomes a literal type. This can be very useful in conditional types and mapped types.",
  },

  // Question 13: noUncheckedIndexedAccess
  12: {
    whyCorrect:
      "noUncheckedIndexedAccess changes the behavior of index accesses: " +
      "Every access to arr[n] has type T | undefined (instead of just T). " +
      "This is safer because the index could be outside the bounds. " +
      "BUT: For tuples, known positions are not affected — " +
      "tup[0] for a [string, number] remains string.",
    commonMistake:
      "'string' without undefined is the default assumption of many developers. " +
      "Without the option, that is also correct. But with the option, TypeScript " +
      "becomes more cautious — which is more correct at runtime.",
  },

  // Question 14: filter with type predicate
  13: {
    whyCorrect:
      "Since TypeScript 5.5, filter() automatically recognizes inferred type predicates for simple typeof checks. " +
      "The callback `x => typeof x === \"string\"` is " +
      "inferred as a type guard, so the result is string[]. " +
      "For more complex conditions, explicit type predicates are still needed.",
    commonMistake:
      "(string | number)[] was the correct answer before TS 5.5. " +
      "Those who learned with older TypeScript versions still expect the old behavior. " +
      "From 5.5 onwards, the compiler is smarter about simple typeof/instanceof checks in filter().",
  },

  // Question 15: Why no tuple?
  14: {
    whyCorrect:
      "TypeScript assumes that arrays will be modified after declaration. " +
      "push(), pop(), splice() would fail on a tuple type. " +
      "'const' only protects the variable itself (p = [3, 4] is not allowed), " +
      "but not the content (p.push(3) is fine). 'as const' does both: " +
      "readonly tuple with literal types.",
    commonMistake:
      "Confusing const (variable binding) with immutability " +
      "(content) is one of the most common misconceptions. In JavaScript, " +
      "const is like a nameplate fixed to the wall — " +
      "but the object behind it can still change.",
  },
};
```