/**
 * Lesson 07 — Pre-Test Questions: Union & Intersection Types
 *
 * 3 questions per section (6 sections = 18 questions).
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ═══ Section 1: Union Types Basics ══════════════════════════════════
  {
    sectionIndex: 1,
    question: "What does `string | number` mean in TypeScript?",
    options: [
      "A new type that combines string and number",
      "A value that can be EITHER string OR number",
      "string is converted to number",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "The | operator creates a Union Type: a value can have one of several types.",
  },
  {
    sectionIndex: 1,
    question: "Can you call toUpperCase() on a `string | number` value?",
    options: [
      "Yes, TypeScript just tries it",
      "No, only operations common to ALL members are allowed",
      "Yes, if you disable strict mode",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "With unions, only operations that exist for ALL members are allowed. You must narrow first.",
  },
  {
    sectionIndex: 1,
    question: "What is a Literal Union?",
    code: "type Direction = 'north' | 'south' | 'east' | 'west';",
    options: [
      "A union of strings",
      "A union of concrete values — only these 4 strings are allowed",
      "An enum with strings",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "Literal unions only allow the specified concrete values — with IDE autocomplete.",
  },

  // ═══ Section 2: Type Guards and Narrowing ═══════════════════════════════
  {
    sectionIndex: 2,
    question: "What does TypeScript do after `if (typeof x === 'string')`?",
    options: [
      "Nothing — the type stays the same",
      "Narrows the type of x to string (Type Narrowing)",
      "Converts x to a string",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "TypeScript's Control Flow Analysis automatically narrows the type based on checks.",
  },
  {
    sectionIndex: 2,
    question: "What is new with filter() in TS 5.5?",
    options: [
      "filter() now returns Sets",
      "TypeScript automatically recognizes Type Guards in filter callbacks",
      "filter() has become faster",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "Inferred Type Predicates: x => x !== null is recognized as a Type Guard — no explicit guard needed.",
  },
  {
    sectionIndex: 2,
    question: "Which narrowing techniques does TypeScript support?",
    options: [
      "typeof, instanceof, in, Truthiness, Assignment",
      "Only typeof",
      "Only typeof and instanceof",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "TypeScript has 5 built-in narrowing techniques plus custom Type Guards.",
  },

  // ═══ Section 3: Discriminated Unions ═════════════════════════════════════
  {
    sectionIndex: 3,
    question: "What does a Discriminated Union require?",
    options: [
      "A common tag property with different literal types",
      "At least 3 union members",
      "An exhaustive check",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "The tag property (e.g. type: 'circle') uniquely identifies which type is present.",
  },
  {
    sectionIndex: 3,
    question: "What does `const _: never = shape` do in the default case?",
    options: [
      "An exhaustive check — compile error if a case is missing",
      "Nothing — it is dead code",
      "It prevents runtime errors",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "When all cases are handled, shape is 'never'. A new member breaks this — compile error.",
  },
  {
    sectionIndex: 3,
    question: "What are Algebraic Data Types (ADTs)?",
    options: [
      "Types composed of sum types (Union) and product types (objects)",
      "Data types for mathematical calculations",
      "A special TypeScript feature",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "ADTs come from functional programming. Discriminated Unions are sum types.",
  },

  // ═══ Section 4: Intersection Types ══════════════════════════════════════
  {
    sectionIndex: 4,
    question: "What does `A & B` mean for object types?",
    options: [
      "An object that must have ALL properties from A AND B",
      "Either A or B",
      "Only the shared properties",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Intersection combines all properties. A value must satisfy both types simultaneously.",
  },
  {
    sectionIndex: 4,
    question: "What does `string & number` result in?",
    options: [
      "string | number",
      "any",
      "never — no value is both at the same time",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "Incompatible primitives result in never. No value can be both string AND number at the same time.",
  },
  {
    sectionIndex: 4,
    question: "What happens with property conflicts in Intersections?",
    code: "type A = { x: string };\ntype B = { x: number };\ntype AB = A & B;",
    options: [
      "Compile error",
      "x becomes string | number",
      "x becomes string & number = never (no error, but unusable)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "Intersection conflicts produce no error! The property becomes never — silently and unusably.",
  },

  // ═══ Section 5: Union vs Intersection ════════════════════════════════════
  {
    sectionIndex: 5,
    question: "What is the difference between | and & in terms of the value set?",
    options: [
      "No difference",
      "| makes it smaller, & makes it larger",
      "| makes the value set larger, & makes it smaller",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "Union = more values fit. Intersection = fewer values fit (must satisfy more).",
  },
  {
    sectionIndex: 5,
    question: "What is faster for the compiler: extends or &?",
    options: [
      "No difference",
      "& is faster",
      "extends is faster and reports conflicts better",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "extends is more efficient for the compiler and reports conflicts directly as errors.",
  },
  {
    sectionIndex: 5,
    question: "What does (A | B) & C result in?",
    options: [
      "A | B | C",
      "I don't know",
      "never",
      "(A & C) | (B & C) — distributive",
    ],
    correct: 3,
    briefExplanation: "Intersection distributes over union: the distributive law from set theory.",
  },

  // ═══ Section 6: Practical Patterns ═════════════════════════════════════
  {
    sectionIndex: 6,
    question: "Which pattern models success/error in a type-safe way?",
    options: [
      "try/catch",
      "I don't know",
      "Optional properties",
      "The Result pattern with Discriminated Union",
    ],
    correct: 3,
    briefExplanation: "The Result pattern uses Discriminated Unions: success has data, error has error info.",
  },
  {
    sectionIndex: 6,
    question: "Why are Discriminated Unions ideal for State Machines?",
    options: [
      "Because they are faster",
      "I don't know",
      "Because they require less code",
      "Because the compiler prevents invalid states and missing handling",
    ],
    correct: 3,
    briefExplanation: "Each state has its own properties. The compiler prevents access to properties belonging to other states.",
  },
  {
    sectionIndex: 6,
    question: "What is the Command Pattern with Discriminated Unions?",
    options: [
      "A pattern for CLI tools",
      "I don't know",
      "A replacement for functions",
      "Different actions as a union with type-specific payloads",
    ],
    correct: 3,
    briefExplanation: "Each action is a union member with its own payload type — type-safe and extensible.",
  },
];