// pretest-data.ts — L39: Best Practices & Anti-Patterns
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: Most Common Mistakes ──────────────────────────────────────

  {
    sectionId: 1,
    question: "What is the problem with 'as User' on API responses?",
    options: [
      "The compiler doesn't check whether the data is really a User — runtime crash possible",
      "It is slower than a type guard",
      "It doesn't work with strict: true",
      "I don't know",
    ],
    correct: 0,
    explanation: "'as' is a 'Trust me' to the compiler. If the API returns something different, the code crashes at runtime.",
  },
  {
    sectionId: 1,
    question: "What happens when you use 'any' for a variable and then access a property on it?",
    options: [
      "TypeScript checks the access and issues a warning",
      "The access yields 'any' again — no checking, 'any' is contagious",
      "The access yields 'unknown'",
      "I don't know",
    ],
    correct: 1,
    explanation: "Every access on any yields any. This spreads throughout the entire call chain.",
  },
  {
    sectionId: 1,
    question: "How do you enforce that a switch statement covers all cases of a union?",
    options: [
      "With a special compiler option",
      "With a default case that assigns the value to 'never' — compile error for a missing case",
      "That's not possible in TypeScript",
      "I don't know",
    ],
    correct: 1,
    explanation: "The never trick: const _: never = value in the default. If a case is missing, value is not never → compile error.",
  },

  // ─── Section 2: any vs unknown vs never ─────────────────────────────────

  {
    sectionId: 2,
    question: "When should you use 'unknown' instead of 'any'?",
    options: [
      "Only for function parameters",
      "Almost always — unknown enforces checking, any does not",
      "Only for API responses",
      "I don't know",
    ],
    correct: 1,
    explanation: "In 95% of cases where you would write any, unknown is the right choice. The 5% exceptions: migration, double cast, library internals.",
  },
  {
    sectionId: 2,
    question: "What are the three main roles of 'never' in TypeScript?",
    options: [
      "Error handling, logging, testing",
      "Exhaustive checks, impossible functions, type-level filtering",
      "Validation, parsing, serialization",
      "I don't know",
    ],
    correct: 1,
    explanation: "never: (1) Exhaustive switch, (2) functions that never return (throw), (3) filtering types (T extends string ? never : T).",
  },
  {
    sectionId: 2,
    question: "What decision tree exists for 'any vs unknown vs never'?",
    options: [
      "Always use unknown",
      "External data → unknown, generic containers → Generic T, never returns → never, otherwise → unknown",
      "Always use any and refactor later",
      "I don't know",
    ],
    correct: 1,
    explanation: "The decision tree: unknown for unknown data, Generic T for containers, never for the impossible, any only during migration.",
  },

  // ─── Section 3: Avoiding Overengineering ───────────────────────────────

  {
    sectionId: 3,
    question: "When is a generic overengineering?",
    options: [
      "When the type parameter T only appears once (no relationship between input and output)",
      "When it has a constraint",
      "When it is used with extends",
      "I don't know",
    ],
    correct: 0,
    explanation: "A generic that only appears once connects nothing. function log<T>(msg: T): void → better: function log(msg: unknown): void.",
  },
  {
    sectionId: 3,
    question: "What is YAGNI?",
    options: [
      "You Aren't Gonna Need It — don't implement complexity you don't need right now",
      "A TypeScript compiler option",
      "Yet Another Generic Naming Issue",
      "I don't know",
    ],
    correct: 0,
    explanation: "YAGNI applies to types too: a simple interface is better than a nested conditional type if both get the job done.",
  },
  {
    sectionId: 3,
    question: "When are branded types overengineering?",
    options: [
      "For local form fields that only exist within a single component",
      "Always",
      "For entity IDs like UserId and OrderId",
      "I don't know",
    ],
    correct: 0,
    explanation: "Branded types are worth it when confusion causes real bugs. Local form fields are not exchanged between modules.",
  },

  // ─── Section 4: Type Assertions vs Type Guards ─────────────────────────

  {
    sectionId: 4,
    question: "What is the fundamental difference between 'as User' and a type guard?",
    options: [
      "'as' is a 'Trust me' (no checking), type guard is a 'Prove it' (runtime checking)",
      "'as' checks at runtime, type guard checks at compile time",
      "No difference",
      "I don't know",
    ],
    correct: 0,
    explanation: "Type assertion = compiler believes you blindly. Type guard = you provide the proof with runtime checks.",
  },
  {
    sectionId: 4,
    question: "What makes 'asserts value is T' different from 'value is T'?",
    options: [
      "No difference",
      "'asserts' is only for classes",
      "'asserts' throws on failure — the type applies directly afterwards without an if",
      "I don't know",
    ],
    correct: 2,
    explanation: "is → boolean (for if/else). asserts → void or throw. After asserts, the type applies immediately in scope.",
  },
  {
    sectionId: 4,
    question: "When is 'as' (type assertion) acceptable?",
    options: [
      "For every API response",
      "Whenever the compiler complains",
      "In test code (mocks), for DOM access (getElementById), and at type system boundaries",
      "I don't know",
    ],
    correct: 2,
    explanation: "In tests, partial mocks are fine. With the DOM you know which element it is. At type boundaries: double cast with a comment.",
  },

  // ─── Section 5: Defensive vs Offensive Typing ──────────────────────────

  {
    sectionId: 5,
    question: "What is the 'defensive shell, offensive core' architecture?",
    options: [
      "Type everything defensively",
      "Only write tests defensively",
      "Runtime-validate at system boundaries, trust the type system in the core",
      "I don't know",
    ],
    correct: 2,
    explanation: "System boundaries (API, user input): unknown + validation. Core (services, logic): the type system is sufficient.",
  },
  {
    sectionId: 5,
    question: "Is HttpClient.get<User>() in Angular real type safety?",
    options: [
      "Yes, the generic validates the response",
      "Only with strict: true",
      "No, it is a disguised assertion — the API could return something different",
      "I don't know",
    ],
    correct: 2,
    explanation: "<User> is erased at runtime (type erasure). It is a 'Trust me' to the compiler, not a check.",
  },
  {
    sectionId: 5,
    question: "What does 'Parse, Don't Validate' mean?",
    options: [
      "Use JSON.parse instead of regular expressions",
      "I don't know",
      "Parsing is always faster than validation",
      "Validate AND transform into a stronger type — the type proves the validation",
    ],
    correct: 3,
    explanation: "parseEmail(s): Email instead of validateEmail(s): boolean. After the parse, the type itself IS the proof.",
  },

  // ─── Section 6: Practice ─────────────────────────────────────────────────

  {
    sectionId: 6,
    question: "What is the most important metric for TypeScript quality?",
    options: [
      "Number of generics",
      "I don't know",
      "Number of files",
      "any density: number of 'any' per 1000 lines (target: < 1)",
    ],
    correct: 3,
    explanation: "any density is directly measurable and correlates with the number of runtime bugs caused by missing type checks.",
  },
  {
    sectionId: 6,
    question: "Which refactoring pattern has the greatest impact?",
    options: [
      "Brand all strings with branded types",
      "I don't know",
      "Remove all comments",
      "Replace boolean flags with discriminated unions (prevents impossible states)",
    ],
    correct: 3,
    explanation: "Boolean flags → DU eliminates entire classes of bugs: impossible states, correlated nullability, forgotten cases.",
  },
  {
    sectionId: 6,
    question: "What is the single most important TypeScript best practice?",
    options: [
      "Use as many generics as possible",
      "I don't know",
      "Annotate every variable explicitly",
      "Trust the compiler and don't use 'as'/'any' as a solution",
    ],
    correct: 3,
    explanation: "The compiler is your partner. When it complains, it is usually right. 'as' and 'any' only suppress symptoms.",
  },
];