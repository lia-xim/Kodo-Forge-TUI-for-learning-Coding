/**
 * Lesson 09 — Quiz Data: Enums & Literal Types
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "09";
export const lessonTitle = "Enums & Literal Types";

export const questions: QuizQuestion[] = [
  // --- Question 1: Literal Types Basics ---
  {
    question: "What is the type of `const x = 'hello'` in TypeScript?",
    options: [
      "string",
      '"hello"',
      "any",
      "unknown",
    ],
    correct: 1,
    explanation:
      "const variables with primitive values get a Literal Type. " +
      "Since const can never change, the type is exactly \"hello\" — not string. " +
      "With let the type would be string (Type Widening).",
  },

  // --- Question 2: as const Effects ---
  {
    question: "What does `as const` do to an array?",
    options: [
      "Only readonly (no mutations)",
      "Only Literal Types (precise values)",
      "readonly + Literal Types + Tuple (fixed length)",
      "Nothing, as const only applies to objects",
    ],
    correct: 2,
    explanation:
      "as const has three effects: (1) The array becomes readonly, " +
      "(2) all elements get Literal Types, (3) it becomes a Tuple " +
      "with a fixed length. `['a', 'b']` becomes `readonly ['a', 'b']`.",
    code: 'const arr = ["GET", "POST"] as const;\n// Type: readonly ["GET", "POST"]',
  },

  // --- Question 3: Enum Reverse Mapping ---
  {
    question: "What does `Direction[0]` return when `enum Direction { Up, Down, Left, Right }`?",
    options: [
      '"Up"',
      "0",
      "undefined",
      "Error — Enums don't support index access",
    ],
    correct: 0,
    explanation:
      "Numeric enums have Reverse Mapping: Direction[0] returns the " +
      "string name 'Up'. The generated JavaScript object has " +
      "double entries: { 0: 'Up', Up: 0, 1: 'Down', Down: 1, ... }.",
    code: "enum Direction { Up, Down, Left, Right }\nconsole.log(Direction[0]); // ???",
  },

  // --- Question 4: String Enum Comparison ---
  {
    question: "Which assignment compiles WITHOUT errors?",
    options: [
      'const s: StatusEnum = "ACTIVE";',
      "const s: StatusEnum = StatusEnum.Active;",
      "const s: StatusEnum = 42;",
      'const s: StatusEnum = StatusEnum.Active as "ACTIVE";',
    ],
    correct: 1,
    explanation:
      "String Enums are nominally typed — only enum members can be " +
      "assigned. Direct strings ('ACTIVE'), numbers and assertions " +
      "don't work. This distinguishes Enums from Union Literal Types.",
    code: 'enum StatusEnum { Active = "ACTIVE", Inactive = "INACTIVE" }',
  },

  // --- Question 5: Numeric Enum Soundness ---
  {
    question: "Does `const d: Direction = 42` compile? (enum Direction { Up, Down, Left, Right })",
    options: [
      "No, 42 is not a valid Direction value",
      "Only with an as-assertion",
      "Only if 42 were a defined value",
      "Yes, TypeScript allows any number for numeric enums",
    ],
    correct: 3,
    explanation:
      "This is a well-known soundness hole: TypeScript allows ANY number " +
      "as a numeric enum value. The reason: Bitwise flags like " +
      "`Permission.Read | Permission.Write` produce values not defined in the " +
      "enum (e.g. 3). String Enums don't have this problem.",
    code: "enum Direction { Up, Down, Left, Right }\nconst d: Direction = 42; // ???",
  },

  // --- Question 6: Object.keys for numeric enum ---
  {
    question: "How many entries does `Object.keys(Color)` have for `enum Color { Red, Green, Blue }`?",
    options: [
      "3 — only the names",
      "9 — names, values and reverse mappings",
      "6 — names and numeric values",
      "0 — Enums have no keys",
    ],
    correct: 2,
    explanation:
      "Numeric enums have DOUBLE entries in the generated object: " +
      "The names as keys (Red, Green, Blue) AND the numbers as keys (0, 1, 2). " +
      "Object.keys therefore returns 6: ['0', '1', '2', 'Red', 'Green', 'Blue']. " +
      "With String Enums it would only be 3.",
    code: "enum Color { Red, Green, Blue }\nconsole.log(Object.keys(Color).length); // ???",
  },

  // --- Question 7: Union Type from as const ---
  {
    question: "Which expression derives the union type from an as const array?",
    options: [
      "typeof arr",
      "typeof arr[0]",
      "typeof arr[number]",
      "keyof typeof arr",
    ],
    correct: 2,
    explanation:
      "typeof arr[number] uses the index type 'number' to access ALL " +
      "positions of the tuple and produces the union of all elements. " +
      "typeof arr would be the entire tuple type, typeof arr[0] only the first " +
      "element, keyof typeof arr the tuple methods and index keys.",
    code: 'const arr = ["GET", "POST", "PUT"] as const;\ntype Method = typeof arr[number]; // ???',
  },

  // --- Question 8: Template Literal Types ---
  {
    question: "How many members does the type `\\`${A}-${B}\\`` have when A has 3 and B has 4 values?",
    options: [
      "7 (3 + 4)",
      "12 (3 × 4)",
      "3 (only A)",
      "4 (only B)",
    ],
    correct: 1,
    explanation:
      "Template Literal Types produce the Cartesian product of all " +
      "combinations. With 3 A-values and 4 B-values that gives 3 × 4 = 12 " +
      "unique string literal types. This is distributive — each " +
      "combination is generated individually.",
  },

  // --- Question 9: Capitalize<T> ---
  {
    question: 'What is the type of `Capitalize<"click" | "scroll">`?',
    options: [
      '"Click" | "Scroll"',
      '"CLICK" | "SCROLL"',
      '"Click" | "click" | "Scroll" | "scroll"',
      '"clickClick" | "scrollScroll"',
    ],
    correct: 0,
    explanation:
      "Capitalize only uppercases the first letter. It is applied distributively " +
      "to each union member individually: 'click' becomes 'Click', " +
      "'scroll' becomes 'Scroll'. The number of members stays the same. " +
      "For ALL caps: Uppercase<T>.",
  },

  // --- Question 10: const enum ---
  {
    question: "What is the main problem with `const enum`?",
    options: [
      "It is not compatible with isolatedModules",
      "It generates too much runtime code",
      "It does not support string values",
      "It has no reverse mapping",
    ],
    correct: 0,
    explanation:
      "const enum is inlined — the compiler must know the " +
      "enum definition in the source file to insert the value inline. " +
      "With isolatedModules (default in Vite, esbuild, swc, Next.js) each file is " +
      "compiled individually — cross-file const enum doesn't work then. " +
      "The alternative: as const objects.",
  },

  // --- Question 11: Branding ---
  {
    question: "What does a Branded Type like `type EUR = number & { __brand: 'EUR' }` prevent?",
    options: [
      "The value from becoming negative",
      "A plain number from being used as EUR",
      "The value from being changed at runtime",
      "The value from being serialized",
    ],
    correct: 1,
    explanation:
      "Branded Types prevent semantically different values from being " +
      "confused. A plain number is not assignable as 'EUR' — " +
      "you must explicitly go through a constructor function. " +
      "At runtime the __brand property doesn't exist — it is purely " +
      "a compile-time mechanism.",
    code: "type EUR = number & { __brand: 'EUR' };\nconst betrag: EUR = 100; // Error!",
  },

  // --- Question 12: Enum vs Union Literal ---
  {
    question: "Which advantage belongs to Union Literal Types, NOT to Enums?",
    options: [
      "Reverse Mapping (value to name)",
      "Nominal typing",
      "No runtime code (Tree-Shakeable)",
      "Iteration over all values",
    ],
    correct: 2,
    explanation:
      "Union Literal Types generate NO JavaScript code — they disappear " +
      "completely during compilation (Type Erasure). This makes them " +
      "Tree-Shakeable. Enums generate a runtime object. Reverse Mapping " +
      "and iteration are enum advantages. Nominal typing is also " +
      "an enum feature.",
  },

  // --- Question 13: as const Object ---
  {
    question: "Can a value and a type in TypeScript have the same name?",
    options: [
      "No, that creates a naming conflict",
      "Only with enums",
      "Only with classes",
      "Yes, they live in separate namespaces",
    ],
    correct: 3,
    explanation:
      "TypeScript has separate namespaces for values and types. " +
      "You can declare `const X = { ... } as const` and `type X = typeof X[...]` " +
      "— TypeScript knows from context which one is meant. " +
      "Enums and classes use the same principle: they are simultaneously " +
      "a value and a type.",
    code: "const Status = { Active: 'ACTIVE' } as const;\ntype Status = typeof Status[keyof typeof Status];",
  },

  // --- Question 14: String Enum Iteration ---
  {
    question: "How many entries does `Object.keys()` have for a String Enum with 5 members?",
    options: [
      "5",
      "10",
      "0",
      "Depends on the values",
    ],
    correct: 0,
    explanation:
      "String Enums have NO Reverse Mapping. The generated object has " +
      "only one-way entries: Name -> Value. With 5 members " +
      "Object.keys() returns exactly 5. This is a major advantage over " +
      "numeric enums (which would return 10).",
  },

  // --- Question 15: Template Literal Type Pattern ---
  {
    question: "What best describes the type `\\`on${string}\\``?",
    options: [
      'Only the string "on"',
      'Any string that contains "on"',
      'Only "onClick", "onScroll", "onFocus"',
      'Any string that starts with "on"',
    ],
    correct: 3,
    explanation:
      "`on${string}` is a Template Literal Type that accepts ANY string " +
      "starting with 'on'. ${string} is a wildcard for " +
      "arbitrary string suffixes. 'onClick', 'onFoo', 'on' — all match. " +
      "'click' or 'myOnClick' do NOT match.",
    code: 'type EventName = `on${string}`;\nconst a: EventName = "onClick";  // OK\n// const b: EventName = "click"; // Error!',
  },

  // ─── Additional Formats ────────────────────────────────────────────────────

  // --- Question 16: Short-Answer — const Literal Type ---
  {
    type: "short-answer",
    question: "Which type is assigned to `const x = 'hello'` — string or \"hello\"?",
    expectedAnswer: '"hello"',
    acceptableAnswers: ['"hello"', "'hello'", "hello", "Literal Type hello", "\"hello\" (Literal Type)"],
    explanation:
      "const variables with primitive values get a Literal Type. " +
      "Since const can never change, the type is exactly \"hello\" — not string. " +
      "With let the type would be string (Type Widening).",
  },

  // --- Question 17: Short-Answer — as const Effects ---
  {
    type: "short-answer",
    question: "Name the three effects of `as const` on an array (keywords are sufficient).",
    expectedAnswer: "readonly, Literal Types, Tuple",
    acceptableAnswers: [
      "readonly, Literal Types, Tuple",
      "readonly, literal, tuple",
      "Tuple, readonly, Literal Types",
      "readonly Tuple with Literal Types",
      "immutable, literal types, tuple",
    ],
    explanation:
      "as const has three simultaneous effects: (1) readonly — no mutations, " +
      "(2) Literal Types — precise values instead of broad types, " +
      "(3) Tuple — fixed length instead of dynamic array.",
  },

  // --- Question 18: Short-Answer — Enum Soundness ---
  {
    type: "short-answer",
    question: "Which type of enum has a soundness hole where any number can be assigned — string or numeric?",
    expectedAnswer: "numeric",
    acceptableAnswers: ["numeric", "numerical", "Numeric", "numeric enums", "number"],
    explanation:
      "Numeric enums allow ANY number — even values not defined in the enum. " +
      "The reason: Bitwise flags produce values outside the enum definition. " +
      "String Enums by contrast are nominally typed and don't have this problem.",
  },

  // --- Question 19: Predict-Output — Reverse Mapping ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "enum Color { Red, Green, Blue }\nconsole.log(Color[1]);",
    expectedAnswer: "Green",
    acceptableAnswers: ["Green", "'Green'", "\"Green\""],
    explanation:
      "Numeric enums have Reverse Mapping: Color[1] returns the string name 'Green'. " +
      "The generated JavaScript object has double entries — " +
      "both Name→Value and Value→Name.",
  },

  // --- Question 20: Predict-Output — Object.keys for numeric enum ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "enum Dir { Up, Down }\nconsole.log(Object.keys(Dir).length);",
    expectedAnswer: "4",
    acceptableAnswers: ["4"],
    explanation:
      "Numeric enums have double entries through Reverse Mapping: " +
      "The names (Up, Down) AND the numbers (0, 1) as keys. " +
      "2 members × 2 = 4 keys: ['0', '1', 'Up', 'Down'].",
  },

  // --- Question 21: Explain-Why — as const vs Enum ---
  {
    type: "explain-why",
    question: "Why do many teams recommend `as const` objects over enums? What advantages do they offer?",
    modelAnswer:
      "as const objects avoid the special rules of enums: no Reverse Mapping, " +
      "no soundness hole with numbers, compatible with isolatedModules/esbuild/Vite. " +
      "They generate normal JavaScript that is Tree-Shakeable. You can derive " +
      "the union type with typeof obj[keyof typeof obj] and still have " +
      "a runtime object for iteration.",
    keyPoints: [
      "Compatible with isolatedModules and modern build tools",
      "No soundness hole like numeric enums",
      "Tree-Shakeable, normal JavaScript",
      "Union type derivable with typeof",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Additional explanations for each question: Why the correct answer
// is correct and which misconception is most common.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "const variables with primitive values get a Literal Type because " +
      "their value can never change. TypeScript uses the most precise " +
      "typing possible.",
    commonMistake:
      "Many expect 'string' because text is just strings. " +
      "But the Literal Type '\"hello\"' is a SUBTYPE of string — more precise.",
  },
  1: {
    whyCorrect:
      "as const has three simultaneous effects: readonly, Literal Types, and " +
      "Tuple instead of Array. All three together make the value completely " +
      "immutable and precisely typed.",
    commonMistake:
      "Many think as const only makes things readonly. The Literal Type preservation " +
      "and Tuple conversion are often overlooked.",
  },
  2: {
    whyCorrect:
      "Numeric enums have Reverse Mapping: The generated object " +
      "contains both Name→Value and Value→Name entries. " +
      "Direction[0] accesses the Reverse Mapping.",
    commonMistake:
      "Some expect 0 (the value itself) or undefined. " +
      "Reverse Mapping is unique to numeric enums — " +
      "String Enums don't have it.",
  },
  3: {
    whyCorrect:
      "String Enums are nominally typed. Only enum members " +
      "(StatusEnum.Active) can be assigned. Direct strings " +
      "are not compatible, even if the value is identical.",
    commonMistake:
      "Many expect '\"ACTIVE\"' to work because the enum value " +
      "is exactly 'ACTIVE'. But enums are nominal — the name counts, " +
      "not the structure.",
  },
  4: {
    whyCorrect:
      "Numeric enums allow any number — a deliberate concession " +
      "for bitwise flag combinations. This is a well-known soundness hole.",
    commonMistake:
      "Almost everyone expects an error. The soundness hole exists " +
      "deliberately for bitwise operations and is the main reason " +
      "String Enums are preferred.",
  },
  5: {
    whyCorrect:
      "Numeric enums have double entries through Reverse Mapping. " +
      "3 names + 3 numbers = 6 keys. String Enums would only have 3.",
    commonMistake:
      "Most expect 3 because they think of the 3 colors. " +
      "Reverse Mapping is often forgotten.",
  },
  6: {
    whyCorrect:
      "typeof arr[number] uses the index type 'number' to access ALL " +
      "positions. The result is the union of all elements.",
    commonMistake:
      "Many confuse typeof arr (the entire tuple type) with " +
      "typeof arr[number] (union of elements). keyof typeof arr returns " +
      "the tuple methods, not the values.",
  },
  7: {
    whyCorrect:
      "Template Literal Types are distributive — they produce the " +
      "Cartesian product of all combinations. 3 × 4 = 12.",
    commonMistake:
      "Many think addition (7) instead of multiplication (12). " +
      "Each A-variant is combined with every B-variant.",
  },
  8: {
    whyCorrect:
      "Capitalize ONLY uppercases the first letter. It is applied " +
      "distributively to each union member.",
    commonMistake:
      "Capitalize is confused with Uppercase. " +
      "Capitalize: first letter uppercase. Uppercase: EVERYTHING uppercase.",
  },
  9: {
    whyCorrect:
      "const enum is incompatible with isolatedModules because the " +
      "compiler would need to read the definition from another file " +
      "to inline the value.",
    commonMistake:
      "Some think const enum generates too much code. " +
      "The opposite is true — it generates NO code (inlined). " +
      "The problem is build tool compatibility.",
  },
  10: {
    whyCorrect:
      "Branded Types use a __brand intersection that distinguishes " +
      "different semantic types at compile time " +
      "but doesn't exist at runtime.",
    commonMistake:
      "Many think the __brand property exists at runtime. " +
      "It is purely a compile-time mechanism — the value remains " +
      "a normal number/string.",
  },
  11: {
    whyCorrect:
      "Union Literal Types disappear completely during compilation " +
      "(Type Erasure). They generate zero bytes of JavaScript code.",
    commonMistake:
      "Some believe Union Types also generate runtime code. " +
      "Only Enums and as const objects have runtime representations.",
  },
  12: {
    whyCorrect:
      "TypeScript has separate namespaces for values and types. " +
      "From context the compiler knows whether the value or the type is meant.",
    commonMistake:
      "Many expect a naming conflict. This works the same way with " +
      "enums — every enum is simultaneously a value and a type.",
  },
  13: {
    whyCorrect:
      "String Enums have no Reverse Mapping. The object has only " +
      "one-way entries: 5 members = 5 keys.",
    commonMistake:
      "Experienced developers who know numeric enums expect " +
      "10. Reverse Mapping only exists for numeric enums.",
  },
  14: {
    whyCorrect:
      "`on${string}` accepts any string with the prefix 'on'. " +
      "${string} is a wildcard — not limited to specific events.",
    commonMistake:
      "Some think ${string} only accepts known event names. " +
      "${string} is completely open — it accepts ANY string as a suffix.",
  },
};