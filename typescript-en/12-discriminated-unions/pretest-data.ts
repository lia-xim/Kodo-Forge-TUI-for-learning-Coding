/**
 * Lesson 12 — Pre-Test Questions: Discriminated Unions
 *
 * 3 questions per section (5 sections = 15 questions).
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
  // ═══ Section 1: Tagged Unions ════════════════════════════════════════════
  {
    sectionIndex: 1,
    question: "What is the discriminant in a Discriminated Union?",
    options: [
      "Any property",
      "A property with a literal type that uniquely identifies each variant",
      "The first property of the object",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "The discriminant must be a literal type (string, number, boolean) and must have a different value in each variant.",
  },
  {
    sectionIndex: 1,
    question: "Which literal types are valid as a discriminant?",
    options: [
      "Strings only",
      "String, number, and boolean literals",
      "All types",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "String, number, and boolean literals all work as discriminants. Best practice: use string literals.",
  },
  {
    sectionIndex: 1,
    question: "What are the three ingredients of a Discriminated Union?",
    options: [
      "class, interface, type",
      "Tag property with literal type, union type, narrowing",
      "extends, implements, typeof",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "Three ingredients: (1) shared tag property with literal values, (2) union type, (3) narrowing via the discriminant.",
  },

  // ═══ Section 2: Pattern Matching ════════════════════════════════════════
  {
    sectionIndex: 2,
    question: "What does assertNever(value: never) do in the default branch of a switch?",
    options: [
      "Returns a default value",
      "Produces a compile error if not all cases are handled",
      "Logs the value",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "assertNever expects 'never'. If a case is missing, the value still has a concrete type — compile error!",
  },
  {
    sectionIndex: 2,
    question: "What is the 'Early Return Pattern' with Discriminated Unions?",
    options: [
      "Check each case with if + return — flat code instead of nested if/else",
      "Handle all cases with switch",
      "Exit the function immediately",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Instead of nested if/else: check each status with if and return immediately. TypeScript narrows by elimination.",
  },
  {
    sectionIndex: 2,
    question: "Does narrowing work after destructuring the discriminant?",
    code: 'const { kind } = shape;\nif (kind === "circle") { /* shape.radius? */ }',
    options: [
      "No — TypeScript loses the connection to the original object",
      "Yes, exactly like directly",
      "Only with const",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Destructuring breaks narrowing. TypeScript cannot trace the separate variable back to the object.",
  },

  // ═══ Section 3: Algebraic Data Types ════════════════════════════════════
  {
    sectionIndex: 3,
    question: "What is a sum type?",
    options: [
      "A type that represents exactly one variant (OR)",
      "A type that has multiple properties (AND)",
      "A mathematical type",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Sum type = OR: exactly one variant is active. The opposite is product type (AND) = interface.",
  },
  {
    sectionIndex: 3,
    question: "What does Option<T> model?",
    code: 'type Option<T> = { tag: "some"; value: T } | { tag: "none" };',
    options: [
      "A value that may be present (Some) or absent (None) — a type-safe null alternative",
      "An optional parameter",
      "A checkbox",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Option<T> forces you to check whether a value is present. More type-safe than T | null.",
  },
  {
    sectionIndex: 3,
    question: "What is the advantage of Result<T, E> over try/catch?",
    options: [
      "Faster",
      "Works without async",
      "The error type E is part of the signature — the caller knows what can go wrong",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "With try/catch the error is 'unknown'. With Result<T, E> the error type is explicit in the signature.",
  },

  // ═══ Section 4: State Modeling ══════════════════════════════════════════
  {
    sectionIndex: 4,
    question: 'What does "Make impossible states impossible" mean?',
    options: [
      "Catch all exceptions",
      "Validate all inputs",
      "Model states so that invalid combinations cannot be represented",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "Discriminated unions instead of booleans: only valid states are representable as a type.",
  },
  {
    sectionIndex: 4,
    question: "How many meaningless states does { isLoading: boolean; isError: boolean; data: T | null; error: string | null } allow?",
    options: [
      "0",
      "4",
      "12 (of 16 combinations only 4 are meaningful)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "2^4 = 16 combinations, but only ~4 are meaningful (idle, loading, error, success). That's 12 nonsensical states!",
  },
  {
    sectionIndex: 4,
    question: "Is AsyncState<T> framework-dependent?",
    options: [
      "Yes, only for React",
      "Yes, only for Angular",
      "No — the same type works in React, Angular, Vue, and plain TypeScript",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "AsyncState<T> is a pure TypeScript type — framework-agnostic. Works everywhere.",
  },

  // ═══ Section 5: Practical Patterns ══════════════════════════════════════
  {
    sectionIndex: 5,
    question: "What is the discriminant for Redux/NgRx actions?",
    options: [
      '"payload"',
      "I don't know",
      '"action"',
      '"type"',
    ],
    correct: 3,
    briefExplanation: "Redux/NgRx conventionally use 'type' as the discriminant for actions.",
  },
  {
    sectionIndex: 5,
    question: "What does Extract<Shape, { kind: 'circle' }> do?",
    options: [
      "Removes the circle variant",
      "I don't know",
      "Creates a new circle type",
      "Extracts the circle variant from the union",
    ],
    correct: 3,
    briefExplanation: "Extract filters the union to variants that match the second argument. Exclude does the opposite.",
  },
  {
    sectionIndex: 5,
    question: "How do you model different API error types in a type-safe way?",
    options: [
      "One error object with many optional properties",
      "I don't know",
      "try/catch with instanceof",
      "A discriminated union with one variant per error type",
    ],
    correct: 3,
    briefExplanation: "Each error type as its own variant with a tag and specific properties. The switch covers all cases.",
  },
];