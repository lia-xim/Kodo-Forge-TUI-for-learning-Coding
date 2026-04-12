/**
 * Lesson 23 — Quiz Data: Recursive Types
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 *
 * correct-index distribution: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "23";
export const lessonTitle = "Recursive Types";

export const questions: QuizQuestion[] = [
  // --- Question 1: Basics (correct: 0) ---
  {
    question: "What is a recursive type in TypeScript?",
    options: [
      "A type that references itself in its own definition",
      "A type that uses generic parameters to transform other types",
      "A type that only exists at runtime and cannot be statically analyzed",
      "A type that is created with typeof and extracts the type of a variable",
    ],
    correct: 0,
    explanation:
      "A recursive type references itself in its own definition, " +
      "e.g. type LinkedList<T> = { value: T; next: LinkedList<T> | null }. " +
      "The key is self-reference combined with a base case.",
    elaboratedFeedback: {
      whyCorrect:
        "Recursive types are characterized by self-reference — " +
        "the type name appears in its own definition. " +
        "LinkedList, Tree and the JSON type are classic examples.",
      commonMistake:
        "Generics alone do not make a type recursive. " +
        "type Wrapper<T> = { value: T } is generic, but not recursive.",
    },
  },

  // --- Question 2: LinkedList (correct: 1) ---
  {
    question: "What is the base case of type LinkedList<T> = { value: T; next: LinkedList<T> | null }?",
    options: [
      "The empty array [] that marks the end of the list",
      "The union member null (next can be null)",
      "The generic parameter T that limits the recursion",
      "There is no base case, the recursion is endless",
    ],
    correct: 1,
    explanation:
      "| null is the base case. When next = null, " +
      "the recursion ends. Without | null the chain would be endless " +
      "and no finite object could satisfy the type.",
    elaboratedFeedback: {
      whyCorrect:
        "The null in the union LinkedList<T> | null marks the " +
        "end of the chain. It is the equivalent of the base case " +
        "in a recursive function.",
      commonMistake:
        "Some think the generic parameter T is the base case. " +
        "But T is only the value type, not the recursion terminator.",
    },
  },

  // --- Question 3: JSON type (correct: 2) ---
  {
    question: "What type of recursion does the JSON type demonstrate (JsonValue → JsonArray → JsonValue)?",
    options: [
      "Direct recursion",
      "No recursion",
      "Indirect recursion (via another type)",
      "Lazy recursion",
    ],
    correct: 2,
    explanation:
      "JsonValue does not directly reference itself, but " +
      "goes through JsonArray and JsonObject, which in turn " +
      "reference JsonValue. This is indirect recursion (A → B → A).",
    elaboratedFeedback: {
      whyCorrect:
        "Indirect recursion means: type A references type B, " +
        "and type B references back to type A. JsonValue → JsonArray → JsonValue " +
        "is a classic example of this.",
      commonMistake:
        "Direct recursion would be type X = { child: X | null }. " +
        "With the JSON type, the reference goes through intermediate types.",
    },
  },

  // --- Question 4: DeepPartial (correct: 3) ---
  {
    question: "Why does TypeScript not have a built-in DeepPartial<T>?",
    options: [
      "Because TypeScript does not support recursive types and marks them as errors",
      "Because DeepPartial would be too slow for the compiler and crashes the IDE",
      "Because DeepPartial represents a security risk and potentially creates infinite loops",
      "Because the semantics are context-dependent (Arrays, Date, Map, etc.)",
    ],
    correct: 3,
    explanation:
      "The TypeScript team deliberately decided not to include DeepPartial. " +
      "The reason: should Date be resolved? Should Map<K,V> be treated recursively? " +
      "Every project has different requirements. TypeScript provides the " +
      "building blocks (Mapped Types + Conditional Types + Recursion), not the finished solution.",
    elaboratedFeedback: {
      whyCorrect:
        "Anders Hejlsberg has explained in GitHub issues that deep operations " +
        "are project-specific. There is no universally correct answer to " +
        "'How does DeepPartial handle Arrays/Date/Map?'.",
      commonMistake:
        "TypeScript definitely supports recursive types (since TS 3.7+). " +
        "The absence of DeepPartial is a deliberate design decision.",
    },
  },

  // --- Question 5: Array problem (correct: 0) ---
  {
    question:
      "What happens with type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] } " +
      "on an array field (e.g. tags: string[])?",
    options: [
      "The array is treated as an object and its properties (length, push, etc.) are resolved",
      "The array remains unchanged and is simply passed through",
      "There is a compile error because arrays are not compatible with mapped types",
      "The array becomes a tuple with fixed length and optional elements",
    ],
    correct: 0,
    explanation:
      "Arrays are objects in JavaScript (typeof [] === 'object'). " +
      "Without special array handling, DeepPartial will treat the array properties " +
      "(length, push, pop, etc.) as optional fields. " +
      "The solution: catch arrays separately with (infer U)[].",
    elaboratedFeedback: {
      whyCorrect:
        "Since extends object evaluates to true for arrays, DeepPartial " +
        "is applied recursively to the array. This produces an object with " +
        "optional length?, push?, etc. instead of an array.",
      commonMistake:
        "Many expect arrays to simply remain unchanged. " +
        "You must explicitly detect arrays with (infer U)[] and handle them separately.",
    },
  },

  // --- Question 6: Paths (correct: 1) ---
  {
    question: "What does Paths<{ a: { b: string }; c: number }> compute?",
    options: [
      "'a' | 'b' | 'c'",
      "'a' | 'a.b' | 'c'",
      "'a.b' | 'c'",
      "'a' | 'c'",
    ],
    correct: 1,
    explanation:
      "Paths computes ALL possible dot-separated paths: " +
      "'a' (the object itself), 'a.b' (the property within it), " +
      "and 'c' (a primitive value at the top level). " +
      "'b' alone is not a valid path on the root object.",
    elaboratedFeedback: {
      whyCorrect:
        "Paths generates both intermediate paths ('a') and " +
        "leaf paths ('a.b', 'c'). Every key at every " +
        "level is mapped with its full path.",
      commonMistake:
        "Some forget the intermediate paths: 'a' is a valid " +
        "path that points to the nested object {b: string}.",
    },
  },

  // --- Question 7: PathValue (correct: 2) ---
  {
    question: "What does PathValue<{ x: { y: { z: boolean } } }, 'x.y.z'> evaluate to?",
    options: [
      "{ z: boolean }",
      "{ y: { z: boolean } }",
      "boolean",
      "string",
    ],
    correct: 2,
    explanation:
      "PathValue recursively breaks down the path 'x.y.z': " +
      "x → { y: { z: boolean } } → y → { z: boolean } → z → boolean. " +
      "At the end, the leaf type remains: boolean.",
    elaboratedFeedback: {
      whyCorrect:
        "PathValue uses template literal types to split the path at dots " +
        "and navigates step by step deeper into the type. " +
        "For 'x.y.z' three recursion steps are performed.",
      commonMistake:
        "Some confuse PathValue with the type of the intermediate node. " +
        "PathValue<T, 'x.y'> would be { z: boolean }, but 'x.y.z' goes down to the leaf.",
    },
  },

  // --- Question 8: Recursion limit (correct: 3) ---
  {
    question: "What is the default recursion limit for TypeScript types (without tail recursion)?",
    options: [
      "10 levels",
      "100 levels",
      "Unlimited",
      "Approximately 50 levels",
    ],
    correct: 3,
    explanation:
      "TypeScript aborts at approximately 50 recursion levels with the message " +
      "'Type instantiation is excessively deep and possibly infinite'. " +
      "With tail recursion optimization (TS 4.5+) this increases to ~1000.",
    elaboratedFeedback: {
      whyCorrect:
        "The limit of ~50 is hard-coded in the TypeScript compiler " +
        "and protects against infinite loops and memory overflow " +
        "during stack-based type evaluation.",
      commonMistake:
        "The limit is NOT configurable via tsconfig.json. " +
        "It is an internal compiler limit.",
    },
  },

  // --- Question 9: Tail Recursion (correct: 0) ---
  {
    question: "When does TypeScript (from 4.5) use tail recursion optimization for types?",
    options: [
      "When the recursive call is in tail position (last expression in the conditional branch)",
      "Always with recursive conditional types without additional restrictions",
      "Only with mapped types with recursion and an explicit tail keyword",
      "Only when a special compiler flag is activated in tsconfig.json",
    ],
    correct: 0,
    explanation:
      "Tail recursion optimization kicks in automatically when the recursive " +
      "type call is the LAST thing that happens in the true/false branch of a conditional " +
      "type. Then TypeScript can reuse the stack frame " +
      "and recurse up to ~1000 levels.",
    elaboratedFeedback: {
      whyCorrect:
        "Just like with runtime functions: when nothing happens after the recursive " +
        "call (tail position), the current frame can be reused " +
        "instead of building a new one.",
      commonMistake:
        "It is not an opt-in feature — it is detected automatically. " +
        "But the call MUST be in tail position.",
    },
  },

  // --- Question 10: Flatten (correct: 1) ---
  {
    question: "What does Flatten<number[][]> evaluate to with type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T?",
    options: [
      "number[][]",
      "number",
      "number[]",
      "never",
    ],
    correct: 1,
    explanation:
      "Flatten removes ALL array levels recursively: " +
      "number[][] → Flatten<number[]> → Flatten<number> → number. " +
      "Since number is not an array, the base case is reached.",
    elaboratedFeedback: {
      whyCorrect:
        "Flatten recursively checks whether T is an array, extracts the element type " +
        "and checks again. number[][] → number[] → number → no array anymore → done.",
      commonMistake:
        "Some expect number[] (only one level removed). But Flatten " +
        "recurses down to the non-array type. For one level you need FlatN<T, 1>.",
    },
  },

  // --- Question 11: Performance (correct: 2) ---
  {
    question: "Which pattern leads to exponential compile time with recursive types?",
    options: [
      "Mapped types with recursion that iterate over all properties",
      "Tail-recursive conditional types that terminate in one step",
      "Distributive conditional types with recursion",
      "DeepPartial on flat objects without nested structures",
    ],
    correct: 2,
    explanation:
      "Distributive conditional types distribute over union members. " +
      "With T extends object ? Foo<T[keyof T]> : T, T[keyof T] (a union " +
      "of all values) is distributively split — each member is SEPARATELY " +
      "recursed, leading to exponential growth.",
    elaboratedFeedback: {
      whyCorrect:
        "Distribution + recursion = exponential. If an object has 3 properties " +
        "and is 5 levels deep, distribution produces 3^5 = 243 separate " +
        "type evaluations instead of 3*5 = 15 with a mapped type.",
      commonMistake:
        "Mapped types with recursion are NOT exponential — they iterate " +
        "linearly over keys. The problem arises through distribution.",
    },
  },

  // --- Question 12: z.lazy (correct: 3) ---
  {
    question: "Why does Zod need z.lazy() for recursive schemas?",
    options: [
      "Because TypeScript does not support recursive types and rejects them",
      "Because z.lazy() is faster than a direct reference and uses less memory",
      "Because Zod internally only uses strings and does not know object structures",
      "Because runtime objects are created immediately and cannot reference themselves before being fully defined",
    ],
    correct: 3,
    explanation:
      "TypeScript types are evaluated lazily. " +
      "But JavaScript objects are created immediately. " +
      "Without z.lazy(), the schema would reference itself " +
      "before it is fully defined — an infinite loop.",
    elaboratedFeedback: {
      whyCorrect:
        "The fundamental difference: types only exist at compile time " +
        "and are unfolded on demand. Schemas are runtime objects that " +
        "must resolve all references when created. z.lazy(() => schema) " +
        "defers this resolution.",
      commonMistake:
        "TypeScript supports recursive types very well. The problem " +
        "is not with TypeScript, but with the runtime nature of schemas.",
    },
  },

  // --- Question 13: Direct circularity (correct: 2) ---
  {
    question: "What happens with type X = X | string?",
    options: [
      "X resolves to string and the union simplifies automatically",
      "X becomes never because the self-reference has no valid base",
      "TypeScript reports 'Type alias circularly references itself'",
      "X becomes unknown and thus accepts every possible value",
    ],
    correct: 2,
    explanation:
      "Direct circularity without a conditional type is forbidden. " +
      "type X = X | string is not a recursive type — it is an " +
      "invalid circular reference. Recursion requires a " +
      "conditional or mapped type as a 'brake'.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript only allows recursion in certain contexts: " +
        "property types, conditional types, mapped types. " +
        "Direct union self-reference (type X = X | Y) is forbidden.",
      commonMistake:
        "Some think X would simply resolve to string. " +
        "But TypeScript cannot compute this and reports an error.",
    },
  },

  // --- Question 14: Tuple counter (correct: 1) ---
  {
    question: "How do you implement type-level arithmetic (e.g. addition) in TypeScript?",
    options: [
      "With the + operator at the type level",
      "Via tuple length: spreading tuples together and reading .length",
      "With a special compiler API",
      "That is not possible in TypeScript",
    ],
    correct: 1,
    explanation:
      "TypeScript has no real arithmetic at the type level. The workaround: " +
      "use tuples as counters. Add<3, 4> = [...BuildTuple<3>, ...BuildTuple<4>]['length'] = 7. " +
      "The length of a tuple is a number literal that TypeScript knows.",
    elaboratedFeedback: {
      whyCorrect:
        "The tuple trick exploits the fact that TypeScript tracks the exact length " +
        "of tuples. [unknown, unknown, unknown]['length'] = 3. " +
        "By spreading two tuples you can 'add' them.",
      commonMistake:
        "There is no + operator for types. The tuple trick is the " +
        "only way for arithmetic at the type level.",
    },
  },

  // --- Question 15: Practical decision (correct: 0) ---
  {
    question: "When should you NOT use recursive types?",
    options: [
      "When the IDE noticeably slows down due to the type or colleagues cannot understand it",
      "When you want to type JSON data that has a nested structure",
      "When you are modeling nested configurations that reference themselves",
      "When you need DeepPartial or DeepReadonly for complex objects",
    ],
    correct: 0,
    explanation:
      "Recursive types should be avoided when they slow down the IDE " +
      "or are too complex for the team. JSON, " +
      "configurations and deep utilities are on the other hand classic " +
      "and sensible use cases.",
    elaboratedFeedback: {
      whyCorrect:
        "The rule of thumb: if the type noticeably increases compile time " +
        "or nobody on the team understands it, it is too complex. " +
        "Type safety is worthless if it slows the team down.",
      commonMistake:
        "JSON, configurations and deep utilities are exactly the " +
        "cases where recursive types shine. They become problematic " +
        "with excessive type-level programming.",
    },
  },

  // ─── New Question Formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  // --- Question 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the pattern called where a type does NOT directly reference itself, " +
      "but goes through another type (A → B → A)?",
    expectedAnswer: "Indirect Recursion",
    acceptableAnswers: [
      "Indirect Recursion", "indirect recursion", "Indirect recursion",
      "Mutual Recursion", "mutual recursion",
    ],
    explanation:
      "With indirect recursion, type A references type B, and type B " +
      "references back to type A. The classic example is the JSON type: " +
      "JsonValue → JsonArray → JsonValue.",
  },

  // --- Question 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Approximately how high is the default recursion limit for TypeScript types " +
      "WITHOUT tail recursion optimization? (Give a number)",
    expectedAnswer: "50",
    acceptableAnswers: ["50", "~50", "approx. 50", "circa 50", "approximately 50"],
    explanation:
      "TypeScript aborts at approximately 50 recursion levels with " +
      "'Type instantiation is excessively deep and possibly infinite'. " +
      "With tail recursion optimization (TS 4.5+) this rises to ~1000.",
  },

  // --- Question 18: Predict-Output ---
  {
    type: "predict-output",
    question: "What type does `Flatten<string[][][]>` evaluate to?",
    code:
      "type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;\n" +
      "type Result = Flatten<string[][][]>;",
    expectedAnswer: "string",
    acceptableAnswers: ["string", "String"],
    explanation:
      "Flatten removes ALL array levels recursively: " +
      "string[][][] → Flatten<string[][]> → Flatten<string[]> → " +
      "Flatten<string> → string (no array anymore → base case).",
  },

  // --- Question 19: Predict-Output ---
  {
    type: "predict-output",
    question: "Does this code compile or is there an error?",
    code: "type X = X | string;",
    expectedAnswer: "Error",
    acceptableAnswers: [
      "Error", "error", "Compile Error", "Compile-Error", "No",
      "Type alias circularly references itself",
    ],
    explanation:
      "Direct circularity without a conditional or mapped type is forbidden. " +
      "'type X = X | string' is not a recursive type, but an invalid " +
      "circular reference. TypeScript reports: 'Type alias circularly references itself'.",
  },

  // --- Question 20: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which Zod function is needed to define recursive schemas " +
      "because JavaScript objects are not lazily evaluated like TypeScript types?",
    expectedAnswer: "z.lazy",
    acceptableAnswers: [
      "z.lazy", "z.lazy()", "lazy", "Lazy",
    ],
    explanation:
      "z.lazy(() => schema) defers the evaluation of the schema. " +
      "Without z.lazy(), the schema would reference itself while being created " +
      "before it is fully defined — an infinite loop.",
  },

  // --- Question 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why do distributive conditional types in combination with recursion " +
      "lead to exponential growth in compile time, while mapped types with " +
      "recursion remain linear?",
    modelAnswer:
      "Distributive conditional types distribute over union members: " +
      "each member is SEPARATELY recursed. For an object with 3 properties " +
      "and 5 levels of depth, this produces 3^5 = 243 separate evaluations. " +
      "Mapped types on the other hand iterate linearly over keys and produce " +
      "only 3*5 = 15 evaluations, because they process all keys in one pass.",
    keyPoints: [
      "Distribution splits unions into separate evaluations",
      "Exponential growth through recursion over distributed unions",
      "Mapped types iterate linearly over keys",
      "Solution: [T] wrapping prevents distribution",
    ],
  },
];