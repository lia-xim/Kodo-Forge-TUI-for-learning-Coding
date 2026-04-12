// pretest-data.ts — L34: Performance & Compiler
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: How the Compiler Works ───────────────────────────────────

  {
    sectionId: 1,
    question: "Which phases does the TypeScript compiler go through?",
    options: [
      "Scanner, Parser, Binder, Checker, Emitter",
      "Lexer, Optimizer, Transpiler",
      "Parser, Bundler, Minifier",
      "I don't know",
    ],
    correct: 0,
    explanation: "The compiler has 5 phases: Scanner (tokenization), Parser (AST), Binder (symbols), Checker (types), Emitter (output).",
  },
  {
    sectionId: 1,
    question: "What is an AST (Abstract Syntax Tree)?",
    options: [
      "An optimization for faster compilation",
      "A tree structure that represents the program structure",
      "An alternative file format to JavaScript",
      "I don't know",
    ],
    correct: 1,
    explanation: "The AST represents source code as a hierarchical tree — the central data structure of the compiler.",
  },
  {
    sectionId: 1,
    question: "Which compiler phase consumes the most time?",
    options: [
      "The Parser",
      "The Emitter",
      "The Type Checker",
      "I don't know",
    ],
    correct: 2,
    explanation: "The Type Checker consumes 60-80% of compile time because it must compute and verify all types.",
  },

  // ─── Section 2: Type Instantiation and Depth Limits ─────────────────────

  {
    sectionId: 2,
    question: "What happens with 'Type instantiation is excessively deep'?",
    options: [
      "The compiler has reached the recursion limit of 50",
      "There are too many files in the project",
      "Memory is full",
      "I don't know",
    ],
    correct: 0,
    explanation: "TS2589 occurs when a recursive type exceeds the maximum depth of 50.",
  },
  {
    sectionId: 2,
    question: "What is a type instantiation?",
    options: [
      "Creating a class instance",
      "Substituting concrete types into a generic type",
      "Declaring a type variable",
      "I don't know",
    ],
    correct: 1,
    explanation: "When Array<string> is derived from Array<T>, that is an instantiation — T is replaced by string.",
  },
  {
    sectionId: 2,
    question: "Why is there a depth limit for recursive types?",
    options: [
      "To protect the compiler from infinite loops",
      "To save memory",
      "Because JavaScript does not support recursion",
      "I don't know",
    ],
    correct: 0,
    explanation: "Without a limit, recursive types could drive the compiler into an infinite loop.",
  },

  // ─── Section 3: Writing Performant Types ─────────────────────────────────

  {
    sectionId: 3,
    question: "Is 'interface A extends B {}' faster or slower than 'type A = B & { ... }'?",
    options: [
      "Slower — interfaces have more overhead",
      "The same speed",
      "Faster — interfaces are cached",
      "I don't know",
    ],
    correct: 2,
    explanation: "Interfaces are eagerly evaluated and cached. Intersections are recomputed on every use.",
  },
  {
    sectionId: 3,
    question: "What is a performant alternative to a conditional type for property access?",
    options: [
      "A runtime typeof check",
      "A constraint with direct lookup (T['id'])",
      "A switch statement in the type",
      "I don't know",
    ],
    correct: 1,
    explanation: "Constraints + lookup (T extends { id: X } => T['id']) is faster than conditional + infer.",
  },
  {
    sectionId: 3,
    question: "Why are large union types slow?",
    options: [
      "Because assignability checks are O(n*m)",
      "Because the parser cannot parse them efficiently",
      "Because unions cannot be cached",
      "I don't know",
    ],
    correct: 0,
    explanation: "Every member of one union type must be checked against every member of the other: O(n*m).",
  },

  // ─── Section 4: Measuring and Optimizing Compile Time ───────────────────

  {
    sectionId: 4,
    question: "Which flag measures compile time per phase?",
    options: [
      "--verbose",
      "--extendedDiagnostics",
      "--profile",
      "I don't know",
    ],
    correct: 1,
    explanation: "--extendedDiagnostics shows parse time, bind time, check time, emit time, and memory.",
  },
  {
    sectionId: 4,
    question: "What does 'skipLibCheck: true' do?",
    options: [
      "Skips type-checking of .d.ts files",
      "Ignores all node_modules",
      "Disables the entire type check",
      "I don't know",
    ],
    correct: 0,
    explanation: "skipLibCheck skips the checking of declaration files (.d.ts) and saves 10-30% of compile time.",
  },
  {
    sectionId: 4,
    question: "What is the advantage of 'tsc --noEmit'?",
    options: [
      "It only generates .d.ts files",
      "It generates JavaScript without checking types",
      "It checks types without generating JavaScript — ideal for CI",
      "I don't know",
    ],
    correct: 2,
    explanation: "tsc --noEmit only checks types without running the emitter phase — saves time when JavaScript is generated by esbuild/swc.",
  },

  // ─── Section 5: Incremental Compilation ──────────────────────────────────

  {
    sectionId: 5,
    question: "What does the .tsBuildInfo file store?",
    options: [
      "Compiled JavaScript as a cache",
      "Hashes and diagnostics per file for incremental builds",
      "The tsconfig options for the next build",
      "I don't know",
    ],
    correct: 1,
    explanation: "The .tsBuildInfo stores version hashes and signature hashes per file to detect what has changed.",
  },
  {
    sectionId: 5,
    question: "What is required for Project References?",
    options: [
      "npm workspaces must be configured",
      "I don't know",
      "All projects must use the same outDir",
      "composite: true in the tsconfig of the referenced project",
    ],
    correct: 3,
    explanation: "composite: true is mandatory — it enforces declaration: true and ensures all files are known.",
  },
  {
    sectionId: 5,
    question: "How do you start an incremental build with Project References?",
    options: [
      "npx tsc --incremental",
      "I don't know",
      "npx tsc --watch --fast",
      "npx tsc --build",
    ],
    correct: 3,
    explanation: "tsc --build (or tsc -b) builds projects in the correct dependency order and uses incremental builds.",
  },

  // ─── Section 6: Practice — Monorepo Performance ──────────────────────────

  {
    sectionId: 6,
    question: "Which build tool is recommended for Angular monorepos?",
    options: [
      "Webpack",
      "I don't know",
      "Rollup",
      "Nx",
    ],
    correct: 3,
    explanation: "Nx was built by the former Angular team and has first-class Angular support.",
  },
  {
    sectionId: 6,
    question: "Why should .tsBuildInfo be cached in CI?",
    options: [
      "Because CI would otherwise crash",
      "Because it speeds up the tests",
      "Because it makes the next build 50-90% faster",
      "I don't know",
    ],
    correct: 2,
    explanation: "The cached .tsBuildInfo enables incremental builds in CI — only changed files are checked.",
  },
  {
    sectionId: 6,
    question: "What is the optimal layering of a TypeScript monorepo?",
    options: [
      "I don't know",
      "Everything in one package",
      "One package per file",
      "Types → Utilities → Apps (three layers)",
    ],
    correct: 3,
    explanation: "Three layers: Shared Types (no logic), Shared Utilities, Apps. Changes in Apps do not trigger a rebuild of the lower layers.",
  },
];