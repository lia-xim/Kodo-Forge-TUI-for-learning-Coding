// quiz-data.ts — L37: Type-Level Programming
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 questions
// MC correct-index distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "37";
export const lessonTitle = "Type-Level Programming";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 questions, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 1: Turing-completeness — correct: 0 ---
  {
    question: "What does it mean that TypeScript's type system is Turing-complete?",
    options: [
      "It can express any computable function as a type — using Conditional Types, recursion, and Mapped Types",
      "It can execute JavaScript code faster than other compilers because it optimizes at compile time",
      "It supports all JavaScript features without restrictions — there are no gaps in the type system",
      "It can perform runtime type checks — types are verified at runtime",
    ],
    correct: 0,
    explanation:
      "Turing-completeness means the type system has variables (Type Aliases), " +
      "conditions (Conditional Types), loops (recursion), and data structures (Tuples).",
    elaboratedFeedback: {
      whyCorrect: "The type system has all the building blocks of a programming language: variables, conditions, loops, data structures, and functions. It can theoretically express any algorithm.",
      commonMistake: "Turing-completeness has nothing to do with runtime performance. It is a property of the type system, not the runtime."
    }
  },

  // --- Question 2: Tuple-length trick — correct: 0 ---
  {
    question: "How are numbers represented at the type level in TypeScript?",
    options: [
      "Through tuple lengths — a tuple [unknown, unknown, unknown] has the literal length 3",
      "Through numeric literal types like type Three = 3 — TypeScript computes directly with numbers",
      "Through string parsing of numeric values — the string representation is parsed at the type level",
      "TypeScript cannot represent numbers at the type level — external libraries are required for that",
    ],
    correct: 0,
    explanation:
      "The tuple-length trick exploits the fact that TypeScript knows the exact length of " +
      "tuples. By manipulating tuple length (adding/removing elements) " +
      "arithmetic can be simulated.",
    elaboratedFeedback: {
      whyCorrect: "Tuples have literal lengths: [unknown, unknown]['length'] = 2 (not number). Addition = concatenating tuples, subtraction = removing elements via infer.",
      commonMistake: "Numeric literal types (type Three = 3) represent the number, but you cannot compute with them. 3 + 4 does not work directly — only via tuples."
    }
  },

  // --- Question 3: String parsing — correct: 0 ---
  {
    question: "Which TypeScript features enable string parsing at the type level?",
    options: [
      "Template Literal Types combined with infer in Conditional Types",
      "Regular expressions at the type level — TypeScript supports regex pattern matching directly in the type system",
      "The String.prototype methods in Type Utilities — TypeScript maps them to the type level",
      "Special compiler flags for string analysis — these must be explicitly enabled in tsconfig",
    ],
    correct: 0,
    explanation:
      "Template Literal Types + infer is the combination: " +
      "S extends `${infer Head}/${infer Tail}` splits a string at '/'. " +
      "Recursion enables arbitrarily deep parsing.",
    elaboratedFeedback: {
      whyCorrect: "Template Literal Types make strings structural: `${infer A}:${infer B}` matches 'key:value' and extracts A='key', B='value'. Combined with recursion, full parsers can be built.",
      commonMistake: "TypeScript has no RegExp at the type level. String parsing works exclusively through Template Literal Types and pattern matching with infer."
    }
  },

  // --- Question 4: BuildTuple — correct: 0 ---
  {
    question: "Why does BuildTuple<N> need an accumulator parameter?",
    options: [
      "Because TypeScript cannot compute N-1 at the type level — the accumulator counts via its length",
      "Because TypeScript does not support recursion without an accumulator — every recursive type needs a starting value",
      "Because the accumulator improves performance and increases the recursion depth to the maximum",
      "Because the compiler cannot perform type inference otherwise — the accumulator provides the direction",
    ],
    correct: 0,
    explanation:
      "TypeScript cannot compute 'N minus 1'. Instead the accumulator adds " +
      "one element per recursion step and checks whether Acc['length'] === N.",
    elaboratedFeedback: {
      whyCorrect: "BuildTuple<5> starts with Acc=[]. Each step: [...Acc, unknown]. Stops when Acc['length'] extends 5. This works around the missing subtraction at the type level.",
      commonMistake: "The accumulator does not improve performance directly — it enables tail-call optimization by the compiler (since TS 4.5), which increases recursion depth from ~50 to ~1000."
    }
  },

  // --- Question 5: infer — correct: 1 ---
  {
    question: "What is the difference between `T extends U ? X : Y` and `T extends infer U ? X : Y`?",
    options: [
      "There is no difference — infer is just syntactic sugar for conditional type assignments",
      "Without infer you check against a known type U — with infer, U is extracted from T",
      "infer makes the type nullable and allows undefined as an additional possible value",
      "infer is only available for function types — on other types it produces a compile error",
    ],
    correct: 1,
    explanation:
      "Without infer, U is a fixed type for comparison. With infer, U becomes a type variable " +
      "extracted from the structure of T — like destructuring at the type level.",
    elaboratedFeedback: {
      whyCorrect: "T extends Array<infer U> extracts U from T. T extends Array<string> only checks whether T is a string array. infer = 'bind this variable to the matching type'.",
      commonMistake: "infer is not restricted to function types. It works everywhere in Conditional Types: arrays, objects, template literals, tuples."
    }
  },

  // --- Question 6: infer with constraint — correct: 1 ---
  {
    question: "What does `infer K extends string` do (since TypeScript 4.7)?",
    options: [
      "It enforces that K must be a string literal — generic strings are rejected",
      "K is inferred AND must simultaneously satisfy the constraint string",
      "It is syntactic sugar for a union with string — both variants are identical",
      "It limits recursion depth and thereby prevents 'Type instantiation is excessively deep' errors",
    ],
    correct: 1,
    explanation:
      "infer K extends string combines inference and constraint in one line. " +
      "Without the constraint: `infer K` followed by `K extends string ? K : never`.",
    elaboratedFeedback: {
      whyCorrect: "Instead of two nested Conditional Types (infer K, then K extends string), one suffices. The compiler checks the constraint directly during inference.",
      commonMistake: "It does not enforce that K is a string LITERAL — it enforces that K is assignable to the type string. This includes string literals, but also the type string itself."
    }
  },

  // --- Question 7: Recursion limit — correct: 1 ---
  {
    question: "Since which TypeScript version was the recursion depth for types increased from ~50 to ~1000?",
    options: [
      "TypeScript 4.1 with Template Literal Types — that was the first step toward type-level string parsing",
      "TypeScript 4.5 with Tail-Call Elimination for Conditional Types",
      "TypeScript 5.0 with Decorators — the new decorator syntax also brought performance improvements",
      "TypeScript 3.7 with Recursive Type Aliases — that first allowed recursive type definitions",
    ],
    correct: 1,
    explanation:
      "TypeScript 4.5 introduced Tail-Call Elimination for Conditional Types. " +
      "When the recursive call is the last operation, the compiler optimizes.",
    elaboratedFeedback: {
      whyCorrect: "TS 4.5 recognizes tail-recursive Conditional Types and avoids stack buildup. Before this, recursion broke at ~50. The accumulator pattern benefits directly from this.",
      commonMistake: "TS 3.7 allowed recursive type aliases, but depth stayed at ~50. TS 4.1 brought template literals. Only TS 4.5 brought the depth optimization."
    }
  },

  // --- Question 8: PathOf — correct: 1 ---
  {
    question: "What does PathOf<{ a: { b: { c: string } } }> produce?",
    options: [
      "Only the deepest path: 'a.b.c'",
      "All paths as a union: 'a' | 'a.b' | 'a.b.c'",
      "An array of all paths: ['a', 'a.b', 'a.b.c']",
      "Only the leaves: 'c'",
    ],
    correct: 1,
    explanation:
      "PathOf produces a union of all possible paths — from the root to every " +
      "nested property. This enables autocomplete for get(obj, 'a.b.c').",
    elaboratedFeedback: {
      whyCorrect: "PathOf is recursive: for each property, both the current path ('a') and the nested paths ('a.b', 'a.b.c') are included in the union.",
      commonMistake: "PathOf does not return arrays — it produces a string literal union. This is important for type narrowing and autocomplete in IDEs."
    }
  },

  // --- Question 9: NTuple — correct: 2 ---
  {
    question: "What is the type of NTuple<number, 3>?",
    options: [
      "number[] — an array of arbitrary length, since TypeScript cannot determine the exact count",
      "Array<number> — identical to number[], TypeScript infers the most general possible type",
      "[number, number, number]",
      "[3, 3, 3] — a tuple with three literal values instead of three number slots",
    ],
    correct: 2,
    explanation:
      "NTuple<T, N> produces a tuple with exactly N elements of type T. " +
      "NTuple<number, 3> = [number, number, number] — a tuple, not an array.",
    elaboratedFeedback: {
      whyCorrect: "The difference is crucial: [number, number, number] has the literal length 3. number[] has the length 'number' (unknown). Only tuples enforce the exact element count.",
      commonMistake: "Some confuse [3, 3, 3] (a tuple with three literal values 3) with [number, number, number] (a tuple with three number slots). NTuple produces the latter."
    }
  },

  // --- Question 10: UnionToIntersection — correct: 2 ---
  {
    question: "How does UnionToIntersection<A | B> work technically?",
    options: [
      "Through special compiler support for union types — the compiler has a built-in function",
      "Through Mapped Types that iterate over the union and extract each member individually",
      "Through contravariant position — function parameters turn a union into an intersection",
      "Through Template Literal Types that merge unions and form an intersection from them",
    ],
    correct: 2,
    explanation:
      "Function parameters are contravariant. (x: A) => void | (x: B) => void yields " +
      "via infer: x must satisfy both A and B → A & B.",
    elaboratedFeedback: {
      whyCorrect: "The trick uses variance (L22): in a contravariant position, a union becomes an intersection. This is not a bug — it is mathematically correct and intended by the compiler.",
      commonMistake: "Many think UnionToIntersection is a special compiler trick. It is pure type-system behavior based on contravariance — no magic, just mathematics."
    }
  },

  // --- Question 11: Replace — correct: 2 ---
  {
    question: "What does Replace<'hello-world-foo', '-', '_'> produce?",
    options: [
      "'hello_world_foo' — all occurrences replaced",
      "'hello_world-foo' — only first occurrence replaced",
      "'hello-world_foo' — only last occurrence replaced",
      "A compile error",
    ],
    correct: 1,
    explanation:
      "Replace replaces only the FIRST occurrence. For all occurrences you need " +
      "ReplaceAll with recursion: after replacing, continue searching until nothing matches.",
    elaboratedFeedback: {
      whyCorrect: "S extends `${infer Before}-${infer After}` matches the FIRST '-'. Before='hello', After='world-foo'. Result: 'hello_world-foo'. For all: recursion needed.",
      commonMistake: "Many expect Replace to replace all occurrences — like String.replaceAll(). No: the pattern matches only the first occurrence. ReplaceAll requires explicit recursion."
    }
  },

  // --- Question 12: DeepReadonly — correct: 2 ---
  {
    question: "Why must functions be excluded from DeepReadonly<T>?",
    options: [
      "Because functions cannot be readonly — the readonly keyword only works on object properties",
      "Because the compiler cannot process functions recursively — they abort type inference",
      "Because DeepReadonly would break the function signature (length, name properties)",
      "Because functions are always immutable — there is no way to modify them after the fact",
    ],
    correct: 2,
    explanation:
      "Functions have properties like length and name. DeepReadonly would alter their " +
      "signature and render them unusable. Functions are passed through as-is.",
    elaboratedFeedback: {
      whyCorrect: "Treating a function as an 'object' would produce { readonly length: number; readonly name: string; readonly [Symbol.hasInstance]: ... } — that is no longer a callable function.",
      commonMistake: "Functions are NOT automatically immutable. You can write fn.customProp = 'x'. But DeepReadonly is meant to protect data objects, not restructure functions."
    }
  },

  // --- Question 13: Tail-call — correct: 3 ---
  {
    question: "What is the difference between `[...Reverse<Rest>, First]` and `Reverse<Rest, [First, ...Acc]>`?",
    options: [
      "No difference — both produce the same result and have identical performance characteristics",
      "The first is faster, the second is correct — the first has a bug with empty arrays",
      "The first works only with arrays, the second with tuples — the difference lies in the input type",
      "The first is not tail-recursive, the second is — enabling ~20x greater recursion depth",
    ],
    correct: 3,
    explanation:
      "With [...Reverse<Rest>, First] the result is still processed (spread). " +
      "With Reverse<Rest, [First, ...Acc]> the recursion is the last operation — " +
      "the compiler recognizes the tail-call and optimizes.",
    elaboratedFeedback: {
      whyCorrect: "Tail-call = the recursive call IS the result. When [..., First] still happens around it, it is not a tail-call. With an accumulator the result moves into the parameter.",
      commonMistake: "Both produce the same result — the difference is recursion depth. Without TCO: ~50, with TCO: ~1000. For long lists this is the difference between works and compile error."
    }
  },

  // --- Question 14: Practical use — correct: 3 ---
  {
    question: "Which type-level pattern has the highest ROI in a typical Angular/React project?",
    options: [
      "Type-level SQL parser for database access",
      "Arithmetic at the type level for mathematical operations",
      "Recursive DeepReadonly for all objects",
      "Route parameter extraction from URL path strings",
    ],
    correct: 3,
    explanation:
      "Extracting route parameters from path strings is immediately usable, has " +
      "low complexity overhead, and prevents real bugs (typos in " +
      "parameter names). The other options are either over-engineering or too niche.",
    elaboratedFeedback: {
      whyCorrect: "Every Angular/React app has routes. Parameter extraction prevents bugs that would only surface at runtime. Libraries like typesafe-routes do exactly this.",
      commonMistake: "DeepReadonly for ALL objects is over-engineering. It slows the compiler and makes code inflexible. Targeted use on configs and state is better."
    }
  },

  // --- Question 15: Type-level limits — correct: 3 ---
  {
    question: "What is the most important rule of thumb for type-level programming in production?",
    options: [
      "Move as much logic as possible to the type level for maximum safety",
      "Only use type-level code when it fits in 5 lines",
      "Only use it for internal APIs, never for public ones",
      "Type interfaces (APIs, routers, ORMs), not business logic",
    ],
    correct: 3,
    explanation:
      "Type-level programming has the highest ROI at interfaces — where " +
      "different parts of the system communicate. Business logic belongs at " +
      "the value level with simple types.",
    elaboratedFeedback: {
      whyCorrect: "Interfaces are stable and called frequently — type-level safety there prevents entire categories of bugs. Business logic changes often — complex types there slow development.",
      commonMistake: "Maximum type safety everywhere sounds good but is counterproductive. The compiler becomes slow, error messages become unreadable, new developers cannot understand the code."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which keyword extracts parts of a type in Conditional Types?",
    expectedAnswer: "infer",
    acceptableAnswers: ["infer"],
    explanation:
      "infer is the TypeScript keyword for type-level pattern matching. " +
      "T extends Array<infer U> extracts the element type U from an array type.",
  },

  {
    type: "short-answer",
    question: "What is the name of the mathematical number system that knows only zero and successor, forming the basis for type-level arithmetic?",
    expectedAnswer: "Peano arithmetic",
    acceptableAnswers: ["Peano arithmetic", "Peano-arithmetic", "Peano", "peano"],
    explanation:
      "Peano arithmetic defines natural numbers via zero and the successor function. " +
      "In TypeScript: an empty tuple is 0, each added element is a successor.",
  },

  {
    type: "short-answer",
    question: "Which utility type converts a union A | B into an intersection A & B?",
    expectedAnswer: "UnionToIntersection",
    acceptableAnswers: ["UnionToIntersection", "uniontointersection"],
    explanation:
      "UnionToIntersection uses contravariant function parameters: " +
      "(x: A) => void | (x: B) => void yields via infer: A & B.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "What type does Result have?",
    code:
      "type Split<S extends string, D extends string> =\n" +
      "  S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];\n\n" +
      "type Result = Split<'a/b/c', '/'>;",
    expectedAnswer: "[\"a\", \"b\", \"c\"]",
    acceptableAnswers: [
      "[\"a\", \"b\", \"c\"]",
      "['a', 'b', 'c']",
      "[a, b, c]",
    ],
    explanation:
      "Split breaks 'a/b/c' at '/': H='a', T='b/c'. Recursively: H='b', T='c'. " +
      "Base case: [S]=['c']. Result: ['a', 'b', 'c'].",
  },

  {
    type: "predict-output",
    question: "What type does Sum have?",
    code:
      "type BuildTuple<N extends number, A extends unknown[] = []> =\n" +
      "  A['length'] extends N ? A : BuildTuple<N, [...A, unknown]>;\n\n" +
      "type Add<A extends number, B extends number> =\n" +
      "  [...BuildTuple<A>, ...BuildTuple<B>]['length'];\n\n" +
      "type Sum = Add<5, 3>;",
    expectedAnswer: "8",
    acceptableAnswers: ["8"],
    explanation:
      "BuildTuple<5> = [unknown x5], BuildTuple<3> = [unknown x3]. " +
      "Combined: [unknown x8]. Length: 8.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 question)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is type-level programming most valuable at interfaces (APIs, routers, ORMs) " +
      "and not for business logic?",
    modelAnswer:
      "Interfaces are stable, called frequently, and error-prone (typos, " +
      "wrong types). Type-level safety there prevents entire categories of bugs. " +
      "Business logic changes often — complex types there slow development, " +
      "make refactoring harder, and produce unreadable error messages. " +
      "Additionally, complex type computations slow the compiler. The rule of thumb: " +
      "the more stable and public an interface, the more worthwhile type-level work is.",
    keyPoints: [
      "Interfaces are stable — type-level investment pays off for a long time",
      "Business logic changes often — complex types hinder refactoring",
      "Compiler performance suffers with deep type recursion",
      "Unreadable error messages degrade the developer experience",
    ],
  },
];