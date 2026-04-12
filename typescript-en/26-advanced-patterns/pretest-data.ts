// pretest-data.ts — L26: Advanced Patterns
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: Builder Pattern ──────────────────────────────────────────

  {
    sectionId: 1,
    question: "What does a Builder Pattern do?",
    options: [
      "It creates complex objects step by step",
      "It copies objects into other objects",
      "It sorts arrays by type",
      "I don't know",
    ],
    correct: 0,
    explanation: "The Builder Pattern separates the construction of a complex object from its representation.",
  },
  {
    sectionId: 1,
    question: "Could TypeScript check whether all required fields of a builder have been set?",
    options: [
      "No, that's only possible at runtime",
      "Yes, with generics that track which fields have been set",
      "Only with external validation libraries",
      "I don't know",
    ],
    correct: 1,
    explanation: "With generics as 'memory', the builder type can track which fields have been set.",
  },
  {
    sectionId: 1,
    question: "What happens when you use Partial<Config> for optional fields?",
    options: [
      "Everything becomes readonly",
      "All fields become optional — including required fields",
      "TypeScript infers the types automatically",
      "I don't know",
    ],
    correct: 1,
    explanation: "Partial<T> makes ALL fields optional. Required fields are lost.",
  },

  // ─── Section 2: State Machine Pattern ────────────────────────────────────

  {
    sectionId: 2,
    question: "What is the problem with { isLoading: boolean; isError: boolean }?",
    options: [
      "TypeScript does not support boolean properties",
      "Impossible combinations like isLoading=true AND isError=true are allowed",
      "Booleans are slower than strings",
      "I don't know",
    ],
    correct: 1,
    explanation: "Boolean flags generate 2^n combinations, most of which are invalid.",
  },
  {
    sectionId: 2,
    question: "How can you model in TypeScript that only certain state transitions are allowed?",
    options: [
      "With try/catch for each transition",
      "That's not possible in TypeScript",
      "With a type-level transition map and generic functions",
      "I don't know",
    ],
    correct: 2,
    explanation: "A transition map as a type defines allowed transitions. The compiler checks automatically.",
  },
  {
    sectionId: 2,
    question: "What does 'Make impossible states impossible' mean?",
    options: [
      "All errors should be thrown at runtime",
      "Impossible states should not be expressible in the type system",
      "You should use as little state as possible",
      "I don't know",
    ],
    correct: 1,
    explanation: "Instead of checking impossible states at runtime, you model types so they cannot occur in the first place.",
  },

  // ─── Section 3: Phantom Types ───────────────────────────────────────────

  {
    sectionId: 3,
    question: "What is a Phantom Type?",
    options: [
      "A type that causes errors at runtime",
      "A type parameter that does not appear in the value but exists in the type",
      "A type that is only used in tests",
      "I don't know",
    ],
    correct: 1,
    explanation: "Phantom Types carry type information that does not exist at runtime — like a 'ghost' in the type system.",
  },
  {
    sectionId: 3,
    question: "How are Branded Types and Phantom Types related?",
    options: [
      "Branded Types are a simple form of Phantom Types",
      "They are completely different concepts",
      "Phantom Types replace Branded Types",
      "I don't know",
    ],
    correct: 0,
    explanation: "The __brand property in Branded Types is a phantom — it only exists in the type, not at runtime.",
  },
  {
    sectionId: 3,
    question: "Why do you need a __phantom property in TypeScript for Phantom Types?",
    options: [
      "Because TypeScript would otherwise ignore the unused type parameter (structural type system)",
      "So that the value knows its type at runtime",
      "Because TypeScript does not natively support Phantom Types",
      "I don't know",
    ],
    correct: 0,
    explanation: "TypeScript's structural type system ignores unused type parameters. The __phantom property anchors the type.",
  },

  // ─── Section 4: Fluent API Pattern ──────────────────────────────────────

  {
    sectionId: 4,
    question: "What is Method Chaining?",
    options: [
      "Methods return 'this', so you can chain calls",
      "A method that calls other methods",
      "An inheritance chain of methods",
      "I don't know",
    ],
    correct: 0,
    explanation: "builder.host('x').port(80).build() — each method returns the builder, so the next call can follow directly.",
  },
  {
    sectionId: 4,
    question: "Can TypeScript enforce the order of method chaining calls?",
    options: [
      "No, method chaining has no order",
      "Only with runtime assertions",
      "Yes, with step interfaces that offer only allowed methods per step",
      "I don't know",
    ],
    correct: 2,
    explanation: "Step interfaces return a different type at each step — only with the methods that are allowed in the current step.",
  },
  {
    sectionId: 4,
    question: "Why is 'this' as a return type better than the concrete class name?",
    options: [
      "'this' is faster",
      "I don't know",
      "'this' is a special TypeScript type that enables chaining",
      "'this' is polymorphic — with inheritance it returns the subclass type",
    ],
    correct: 3,
    explanation: "'this' in a base class becomes the subclass type when inherited. The class name would pin the base type.",
  },

  // ─── Section 5: Newtype Pattern ─────────────────────────────────────────

  {
    sectionId: 5,
    question: "What is 'Primitive Obsession'?",
    options: [
      "The overuse of string and number for everything",
      "The preference for classes over interfaces",
      "The use of any instead of unknown",
      "I don't know",
    ],
    correct: 0,
    explanation: "Primitive Obsession: UserId, ProductId, Amount — all string/number. Mixing them up is easy.",
  },
  {
    sectionId: 5,
    question: "What is a Smart Constructor?",
    options: [
      "A TypeScript compiler feature for automatic type detection",
      "I don't know",
      "A constructor that automatically infers generics",
      "A function that validates and returns a Branded/Newtype",
    ],
    correct: 3,
    explanation: "Smart Constructors validate the raw value and are the official way to create a Newtype.",
  },
  {
    sectionId: 5,
    question: "Does a Newtype have runtime overhead in TypeScript?",
    options: [
      "Yes, the wrapper type requires memory",
      "I don't know",
      "Only when using unique symbol",
      "No, at runtime it is a normal primitive value (Type Erasure)",
    ],
    correct: 3,
    explanation: "Newtypes use Type Erasure: at runtime they are normal string/number values. No overhead.",
  },

  // ─── Section 6: Practical Combination ──────────────────────────────────────

  {
    sectionId: 6,
    question: "When is it worth combining multiple patterns?",
    options: [
      "Always — more patterns = more safety",
      "Never — one pattern per problem is enough",
      "For public APIs or security-critical code",
      "I don't know",
    ],
    correct: 2,
    explanation: "Combining patterns is worth it for public APIs, libraries, or security-critical code. Simpler approaches are sufficient for internal code.",
  },
  {
    sectionId: 6,
    question: "Which two patterns cover 90% of cases in Angular/React?",
    options: [
      "Builder + Fluent API",
      "Phantom Types + State Machine",
      "Branded Types + Discriminated Unions",
      "I don't know",
    ],
    correct: 2,
    explanation: "Branded Types for IDs + Discriminated Unions for state cover most everyday requirements.",
  },
  {
    sectionId: 6,
    question: "What is a sign of over-engineering with type patterns?",
    options: [
      "The code has fewer than 100 lines",
      "I don't know",
      "More than 2 interfaces are used",
      "The type complexity exceeds the business value",
    ],
    correct: 3,
    explanation: "When the type system is more complicated than the business logic, it's over-engineering. KISS applies to types too.",
  },
];