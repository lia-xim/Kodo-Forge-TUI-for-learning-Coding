// pretest-data.ts — L37: Type-Level Programming
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: Types as a Language ─────────────────────────────────────

  {
    sectionId: 1,
    question: "What does 'Turing-complete' mean for a type system?",
    options: [
      "It can express any computable function",
      "It can execute JavaScript code",
      "It supports all data types",
      "I don't know",
    ],
    correct: 0,
    explanation: "Turing-completeness means the system has variables, conditionals, loops, and data structures.",
  },
  {
    sectionId: 1,
    question: "Which three building blocks make TypeScript's type system a programming language?",
    options: [
      "Interfaces, Classes, Enums",
      "Conditional Types, Recursion, Mapped Types",
      "Generics, Unions, Intersections",
      "I don't know",
    ],
    correct: 1,
    explanation: "Conditional Types = conditionals, Recursion = loops, Mapped Types = iteration over data structures.",
  },
  {
    sectionId: 1,
    question: "What is the equivalent of 'if/else' at the type level?",
    options: [
      "Mapped Types",
      "Union Types",
      "Conditional Types (T extends U ? A : B)",
      "I don't know",
    ],
    correct: 2,
    explanation: "T extends U ? A : B checks a condition and returns different types based on the result.",
  },

  // ─── Section 2: Arithmetic at the Type Level ─────────────────────────────

  {
    sectionId: 2,
    question: "Why can't you simply write '3 + 4' at the type level?",
    options: [
      "TypeScript has no + operator for types",
      "Numbers don't exist at the type level",
      "It would be too slow",
      "I don't know",
    ],
    correct: 0,
    explanation: "There is no arithmetic operator at the type level. The tuple-length trick is used as a workaround.",
  },
  {
    sectionId: 2,
    question: "What is the 'tuple-length trick'?",
    options: [
      "Arrays are automatically sorted by length",
      "Numbers are represented by tuple lengths — [unknown, unknown, unknown]['length'] = 3",
      "Tuples can only have a certain length",
      "I don't know",
    ],
    correct: 1,
    explanation: "Tuples have literal lengths. By adding or removing elements, you simulate arithmetic.",
  },
  {
    sectionId: 2,
    question: "What is NTuple<string, 3>?",
    options: [
      "string[]",
      "[string, string, string]",
      "Array<3>",
      "I don't know",
    ],
    correct: 1,
    explanation: "NTuple creates a tuple with exactly N elements of type T. NTuple<string, 3> = [string, string, string].",
  },

  // ─── Section 3: String Parsing at the Type Level ───────────────────────

  {
    sectionId: 3,
    question: "Can TypeScript decompose strings at compile time?",
    options: [
      "No, strings are always 'string' at the type level",
      "Yes, with Template Literal Types and infer",
      "Only with external plugins",
      "I don't know",
    ],
    correct: 1,
    explanation: "Template Literal Types + infer enable pattern matching on strings: `${infer A}/${infer B}` splits 'a/b'.",
  },
  {
    sectionId: 3,
    question: "What could a type-level URL parser extract from '/users/:id'?",
    options: [
      "The string '/users/:id' unchanged",
      "The type { id: string }",
      "The URL as a number",
      "I don't know",
    ],
    correct: 1,
    explanation: "Template Literal Types can recognize :id and derive { id: string } from it — the foundation for type-safe routers.",
  },
  {
    sectionId: 3,
    question: "Which string operations can be implemented at the type level?",
    options: [
      "Split, Replace, Trim and more — all with Template Literals and recursion",
      "None — strings cannot be manipulated at compile time",
      "Only Uppercase and Lowercase",
      "I don't know",
    ],
    correct: 0,
    explanation: "With Template Literal Types + infer + recursion you can build Split, Replace, Trim, and arbitrarily complex string operations.",
  },

  // ─── Section 4: Pattern Matching ─────────────────────────────────────────

  {
    sectionId: 4,
    question: "What does 'infer' do in a Conditional Type?",
    options: [
      "It extracts parts of a type into variables — like destructuring at the type level",
      "It infers the return type of a function",
      "It makes a type optional",
      "I don't know",
    ],
    correct: 0,
    explanation: "infer binds a type variable to the matching part of the pattern. T extends [infer F, ...infer R] extracts the first element and the rest.",
  },
  {
    sectionId: 4,
    question: "Can you use multiple infer variables in a single Conditional Type?",
    options: [
      "No, only one per Conditional Type",
      "Only in nested Conditional Types",
      "Yes, any number — e.g. T extends (a: infer A, b: infer B) => infer R",
      "I don't know",
    ],
    correct: 2,
    explanation: "Multiple infer bindings allow complex destructuring in a single pattern.",
  },
  {
    sectionId: 4,
    question: "What is 'infer K extends string' (TypeScript 4.7+)?",
    options: [
      "K is fixed as string",
      "A syntax error",
      "K is inferred AND must satisfy the constraint string",
      "I don't know",
    ],
    correct: 2,
    explanation: "Combines inference and constraint: K is extracted, but only if it is assignable to string.",
  },

  // ─── Section 5: Recursive Type Challenges ──────────────────────────────

  {
    sectionId: 5,
    question: "What is TypeScript's recursion limit for types?",
    options: [
      "There is no limit",
      "Exactly 100",
      "Around 1000 with tail-call optimization (since TS 4.5)",
      "I don't know",
    ],
    correct: 2,
    explanation: "Since TS 4.5 the compiler recognizes tail-recursive Conditional Types and allows around 1000 recursion steps.",
  },
  {
    sectionId: 5,
    question: "What is PathOf<T>?",
    options: [
      "The file path of a TypeScript module",
      "I don't know",
      "A utility type for Node.js paths",
      "A type that generates all possible paths to nested properties as a union",
    ],
    correct: 3,
    explanation: "PathOf<{ a: { b: string } }> = 'a' | 'a.b' — all paths as a string literal union.",
  },
  {
    sectionId: 5,
    question: "What is the accumulator pattern at the type level?",
    options: [
      "A pattern that accumulates numbers",
      "I don't know",
      "A pattern for array reductions",
      "An additional type parameter that carries the intermediate result for tail-call optimization",
    ],
    correct: 3,
    explanation: "The accumulator carries the result in the parameter instead of building it up after recursion — this enables tail-call optimization.",
  },

  // ─── Section 6: Practice ───────────────────────────────────────────────

  {
    sectionId: 6,
    question: "What is UnionToIntersection?",
    options: [
      "A type that converts unions to intersections — e.g. A | B becomes A & B",
      "A type that converts intersections to unions",
      "A compiler feature for performance",
      "I don't know",
    ],
    correct: 0,
    explanation: "UnionToIntersection uses contravariant function parameters to turn A | B into A & B.",
  },
  {
    sectionId: 6,
    question: "When is type-level programming most worthwhile?",
    options: [
      "For all types in the project",
      "I don't know",
      "Only for tests",
      "At boundaries: APIs, routers, ORMs, libraries",
    ],
    correct: 3,
    explanation: "Boundaries are stable and called frequently — type-level safety there prevents entire categories of bugs.",
  },
  {
    sectionId: 6,
    question: "What is the most important question before using type-level programming?",
    options: [
      "Is it technically possible?",
      "I don't know",
      "How many lines does it save?",
      "Does the user actually need this type safety — or is it over-engineering?",
    ],
    correct: 3,
    explanation: "The question is not 'can I?' but 'should I?'. Type-level complexity must be justified by real benefit.",
  },
];