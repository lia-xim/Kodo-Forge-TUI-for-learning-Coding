/**
 * Lesson 01 — Pre-Test Questions: Setup & First Steps
 *
 * 3 questions per section, asked BEFORE reading.
 * Goal: "Prime" the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section this question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Brief explanation (only becomes relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: What is TypeScript? (Compiler, Transpiler) ───────────────

  {
    sectionIndex: 1,
    question:
      "TypeScript code runs in a different language. " +
      "What do you think — which one?",
    options: [
      "TypeScript has its own runtime environment",
      "TypeScript is converted to JavaScript",
      "TypeScript is compiled to machine code",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript is a transpiler — it translates TS to JS. " +
      "At runtime, not a single TypeScript type exists anymore.",
  },
  {
    sectionIndex: 1,
    question:
      "If TypeScript compiles to another language — " +
      "what do you think happens to type annotations like `: string`?",
    options: [
      "They are converted into runtime checks",
      "They are preserved as comments",
      "They are completely removed",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Type Erasure: ALL TypeScript types are completely removed during compilation. " +
      "The JavaScript output contains no trace of them.",
  },
  {
    sectionIndex: 1,
    question:
      "Imagine you define an `interface User { name: string }`. " +
      "Can you check at runtime whether an object satisfies this interface?",
    options: [
      "Yes, with `obj instanceof User`",
      "Yes, TypeScript adds automatic checks",
      "No, interfaces don't exist at runtime",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Interfaces are purely compile-time constructs. They disappear " +
      "during compilation — instanceof only works with classes.",
  },

  // ─── Section 2: Compiler Pipeline & tsconfig ─────────────────────────────

  {
    sectionIndex: 2,
    question:
      "If your TypeScript code has a type error — " +
      "will JavaScript still be generated?",
    options: [
      "No, nothing is generated when there are errors",
      "Yes, TypeScript still generates JavaScript",
      "Only if you set a special flag",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "By default, tsc generates JavaScript even with type errors. " +
      "Type checking and emit are conceptually independent. " +
      "You can change this with `noEmitOnError: true`.",
  },
  {
    sectionIndex: 2,
    question:
      "What do you think — what does `strict: true` do in tsconfig.json?",
    options: [
      "It enables strict type checking (e.g. null checks)",
      "It makes the code faster",
      "It prevents the use of `var`",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`strict: true` enables a set of strict checks, " +
      "including strictNullChecks — the single most important option, " +
      "because it catches null/undefined errors.",
  },
  {
    sectionIndex: 2,
    question:
      "In what order does a compiler normally work?",
    options: [
      "Read code (parse) → Check → Generate output",
      "Check → Read code → Generate output",
      "Generate output → Read code → Check",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "The TypeScript compiler pipeline: Parsing (generate AST) → " +
      "Type Checking (check types) → Emit (generate JavaScript).",
  },

  // ─── Section 3: Tools & Output Files ─────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "When debugging an error in the browser, you normally see " +
      "the JavaScript file. How do you find the location in your TypeScript source?",
    options: [
      "Source maps map JS lines to TS lines",
      "You have to compare manually",
      "Browsers can read TypeScript directly",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Source maps (.js.map) are JSON files that map each line in the " +
      "JavaScript output to the corresponding line in the TypeScript source. " +
      "Browsers and Node.js use them automatically.",
  },
  {
    sectionIndex: 3,
    question:
      "What do you think — what are `.d.ts` files (declaration files) for?",
    options: [
      "They contain the compiled JavaScript code",
      "I don't know",
      "They are configuration files for the compiler",
      "They provide type information for other developers/libraries",
    ],
    correct: 3,
    briefExplanation:
      ".d.ts files contain ONLY types, no executable code. " +
      "They serve as interface descriptions, e.g. @types/react " +
      "for React.",
  },
  {
    sectionIndex: 3,
    question:
      "When `as string` appears in code — what happens to it at runtime?",
    code: "const value = someData as string;",
    options: [
      "The value is converted to a string",
      "It is checked whether the value is a string",
      "I don't know",
      "It is completely removed — the value does not change",
    ],
    correct: 3,
    briefExplanation:
      "Type assertions (`as string`) only exist at compile time. " +
      "They are removed during type erasure and do NOT change the value. " +
      "For actual conversion you need `String(value)`.",
  },
];