/**
 * Lesson 30 — Pre-Test Questions: Review Challenge Phase 3
 *
 * 3 questions per section. Mix of knowledge and self-assessment questions.
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
  // ─── Section 1: Phase 3 Overview ─────────────────────────────────────

  {
    sectionIndex: 1,
    question: "What are the three red threads of Phase 3? (L21-L29)",
    options: [
      "Performance, Testing, Deployment",
      "Type safety by design, abstraction/reuse, integration/configuration",
      "Classes, Functions, Modules",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "Type safety by design (L21,L24,L25), abstraction (L22,L23,L26), integration (L27,L28,L29).",
  },
  {
    sectionIndex: 1,
    question: "What does 'Make Illegal States Unrepresentable' mean?",
    options: [
      "All states must be documented",
      "The type system prevents invalid state at compile time",
      "Runtime validation for everything",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "If the type system CANNOT represent invalid state, you don't need runtime checks.",
  },
  {
    sectionIndex: 1,
    question: "What is the difference between Phase 2 and Phase 3?",
    options: [
      "Phase 2: transform types. Phase 3: design with types.",
      "No difference",
      "Phase 3 is easier",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Phase 2: 'How do I transform types?' Phase 3: 'How do I design with types?' — from user to architect.",
  },

  // ─── Section 2: Pattern Combination ─────────────────────────────────────

  {
    sectionIndex: 2,
    question: "Can you combine Branded Types (L24) and the Result pattern (L25)?",
    options: [
      "Yes, definitely",
      "I think so",
      "Unsure",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Smart Constructor returns Result<BrandedType, ValidationError>. The brand is only assigned on success.",
  },
  {
    sectionIndex: 2,
    question: "Do you understand why ReadRepository<out T> is covariant? (L22)",
    options: [
      "Yes, T only appears in return positions",
      "Partially",
      "No",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "ReadRepository returns T (out-position). ReadRepository<Dog> is assignable to ReadRepository<Animal>.",
  },
  {
    sectionIndex: 2,
    question: "Can you use Phantom Types for state machines? (L26)",
    options: [
      "Yes, definitely",
      "I think so",
      "Unsure",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Document<Draft> → Document<Review> → Document<Published>. Invalid transitions = compile error.",
  },

  // ─── Section 3: Type-Level Programming ────────────────────────────────

  {
    sectionIndex: 3,
    question: "Can you write recursive Conditional Types? (L23 + L17)",
    options: [
      "Partially",
      "Yes",
      "No",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "DeepReadonly, DeepBrand, Flatten — recursive types that reference themselves.",
  },
  {
    sectionIndex: 3,
    question: "Do you understand how Template Literal Types extract route parameters? (L18 + L23)",
    options: [
      "Partially",
      "Yes",
      "No",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "ExtractParams<'/users/:id'> uses infer in Template Literals: `${string}:${infer Param}` → 'id'.",
  },
  {
    sectionIndex: 3,
    question: "Where is the limit of type-level programming?",
    options: [
      "At 10 type parameters",
      "There is no limit",
      "At compile time and readability — overly complex type logic becomes unreadable",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "TypeScript's type system is Turing-complete, but: compile time explodes and error messages become unreadable.",
  },

  // ─── Section 4: Framework Integration ───────────────────────────────────

  {
    sectionIndex: 4,
    question: "Which Phase 3 concept has the best effort-to-benefit ratio for an existing project?",
    options: [
      "Decorators (L28) — only for new features",
      "Phantom Types (L26) — major refactor",
      "tsconfig flags (L29) — 5 minutes, fewer bugs immediately",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "Enabling strict: true + noUncheckedIndexedAccess takes 5 minutes and finds bugs right away.",
  },
  {
    sectionIndex: 4,
    question: "Are Discriminated Unions usable as both NgRx Actions AND React Reducer Actions?",
    options: [
      "Only in React",
      "Only in Angular",
      "Yes, the pattern is framework-agnostic",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "Discriminated Unions are pure TypeScript. { type: 'SET_ADDRESS', address } works identically in NgRx and useReducer.",
  },
  {
    sectionIndex: 4,
    question: "Why does Angular have noEmit: false but React noEmit: true? (L29)",
    options: [
      "React doesn't need JS output",
      "No reason, coincidence",
      "The Angular CLI manages the build differently than Vite — Angular needs TypeScript output for templates",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "React/Vite: esbuild transpiles. Angular: the Angular compiler needs TypeScript output for the template compiler.",
  },

  // ─── Section 5: Final Challenge ─────────────────────────────────────

  {
    sectionIndex: 5,
    question: "Can you combine all Phase 3 concepts in a single domain model?",
    options: [
      "I don't know",
      "I think so",
      "Unsure",
      "Yes, definitely",
    ],
    correct: 3,
    briefExplanation: "Branded IDs (L24) + Phantom States (L26) + Result Errors (L25) + Recursive Trees (L23) + Repository (L21+L22) + Augmentation (L27) + tsconfig (L29).",
  },
  {
    sectionIndex: 5,
    question: "Would you rate your TypeScript level as 'advanced' or 'expert'?",
    options: [
      "I'm not sure",
      "Advanced — most concepts feel solid, some need review",
      "Beginner — much of this is still new",
      "Expert — I can explain and apply all Phase 3 concepts",
    ],
    correct: 3,
    briefExplanation: "Honest self-assessment is the first step toward mastery. Use the review runner for repetition.",
  },
  {
    sectionIndex: 5,
    question: "Which Phase 4 lesson are you most looking forward to?",
    options: [
      "L40: Capstone Project",
      "L33: Testing TypeScript",
      "L37: Type-Level Programming",
      "L32: Type-safe APIs (tRPC, Zod)",
    ],
    correct: 3,
    briefExplanation: "All are great choices! L32 and L33 are the most immediately useful for day-to-day work.",
  },
];