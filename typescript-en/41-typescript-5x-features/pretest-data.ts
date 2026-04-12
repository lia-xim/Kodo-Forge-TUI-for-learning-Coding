/**
 * Lesson 41 — Pre-Test Questions: TypeScript 5.x Features
 *
 * 3 questions per section, presented BEFORE reading.
 * Goal: "Prime" the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section this question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Short explanation (only becomes relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: The TypeScript 5.x Era ──────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Which version was the first major release of TypeScript since 2.x?",
    options: [
      "TypeScript 3.0",
      "TypeScript 4.0",
      "TypeScript 5.0",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "TypeScript 5.0 (March 2023) was the first new major release after the long 4.x series — " +
      "even though it brought almost no breaking changes.",
  },
  {
    sectionIndex: 1,
    question:
      "What was the main theme of TypeScript 5.0?",
    options: [
      "A completely new module system",
      "Decorators (ECMAScript standard) and moduleResolution: bundler",
      "Removal of enum and namespace",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TS 5.0 standardized Decorators (TC39 Stage 3) and introduced " +
      "moduleResolution: bundler for modern build tools.",
  },
  {
    sectionIndex: 1,
    question:
      "How frequently does the TypeScript team release new versions?",
    options: [
      "Once a year (like Node.js LTS)",
      "Approximately every 3 months",
      "Once a month",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript follows a quarterly release cadence: a new minor version with new features " +
      "appears approximately every 3 months.",
  },

  // ─── Section 2: Modern Modules — verbatimModuleSyntax and bundler ────────

  {
    sectionIndex: 2,
    question:
      "What does `import type { User } from './types'` do?",
    options: [
      "Imports User both as a type and as a runtime value",
      "Imports User only for type information — no runtime import",
      "Is identical to a normal import",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "`import type` produces no JavaScript code in the output. " +
      "The bundler can remove it entirely — ideal for tree-shaking.",
  },
  {
    sectionIndex: 2,
    question:
      "What is the main problem that `verbatimModuleSyntax: true` solves?",
    options: [
      "TypeScript syntax that is not compatible with JavaScript",
      "Accidental runtime imports of pure types",
      "Too-slow bundling due to missing parallelization",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Without verbatimModuleSyntax, types could appear as normal imports. " +
      "The option enforces explicitly marking type imports as such.",
  },
  {
    sectionIndex: 2,
    question:
      "Which module resolution mode do you need for Vite projects?",
    options: [
      "node",
      "node16",
      "bundler",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "`moduleResolution: 'bundler'` (TS 5.0) mirrors the behavior of modern " +
      "bundlers such as Vite, esbuild, and webpack 5.",
  },

  // ─── Section 3: Inferred Type Predicates and NoInfer ────────────────────

  {
    sectionIndex: 3,
    question:
      "What was the problem with `arr.filter(x => x !== null)` before TypeScript 5.5?",
    code: "const nums: (number | null)[] = [1, null, 2];\nconst result = nums.filter(x => x !== null);",
    options: [
      "It didn't work at all — you needed reduce",
      "result had type (number | null)[] instead of number[]",
      "null was replaced by undefined instead of being removed",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript could not infer the type predicate before 5.5. " +
      "You had to write explicitly: `.filter((x): x is number => x !== null)`.",
  },
  {
    sectionIndex: 3,
    question:
      "What is a 'type predicate' in TypeScript?",
    options: [
      "A condition in a WHERE clause for type-level queries",
      "A function that converts one type into another",
      "A function with return type `param is Type` that informs TypeScript about narrowing",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Type predicates (`x is string`) tell TypeScript: 'if this function returns true, " +
      "then x is of type string.' This makes narrowing work in filter, find, and other " +
      "higher-order functions.",
  },
  {
    sectionIndex: 3,
    question:
      "What does the 'No' in `NoInfer<T>` stand for?",
    options: [
      "T should NOT be used for inference from this parameter",
      "T must not be null or undefined",
      "T is a negative type (complement type)",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`NoInfer<T>` prevents this parameter from influencing the inference of T. " +
      "T is inferred from other parameters and then only validated here.",
  },

  // ─── Section 4: Array and Control Flow Improvements ─────────────────────

  {
    sectionIndex: 4,
    question:
      "What does `using` mean in TypeScript 5.2?",
    options: [
      "Automatically calling `Symbol.dispose` at the end of a block",
      "A new import syntax for namespaces",
      "An abbreviation for using strict",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`using` implements the Explicit Resource Management pattern (TC39). " +
      "At the end of the block, `[Symbol.dispose]()` is called automatically.",
  },
  {
    sectionIndex: 4,
    question:
      "What is the difference between `using` and `await using`?",
    options: [
      "await using calls `Symbol.asyncDispose` and waits for the promise",
      "await using waits for the next microtask before dispose is called",
      "There is no difference",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`await using` uses `Symbol.asyncDispose` instead of `Symbol.dispose`. " +
      "It waits for the returned promise — for asynchronous cleanup such as DB connections.",
  },
  {
    sectionIndex: 4,
    question:
      "What changes with `noUncheckedIndexedAccess: true` for `arr[0]`?",
    options: [
      "arr[0] has type T | undefined instead of T",
      "arr[0] immediately throws an error if arr is empty",
      "Negative index access is forbidden",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "With `noUncheckedIndexedAccess`, TypeScript returns `T | undefined` for every " +
      "index access — because the array could be empty at runtime.",
  },

  // ─── Section 5: Performance and Editor Features ──────────────────────────

  {
    sectionIndex: 5,
    question:
      "What does `skipLibCheck: true` do in tsconfig.json?",
    options: [
      "Skips checking your own TypeScript files",
      "I don't know",
      "Disables library-specific compiler warnings",
      "Skips checking .d.ts files (including node_modules)",
    ],
    correct: 3,
    briefExplanation:
      "`skipLibCheck: true` provides significant performance gains in large projects. " +
      "The trade-off: errors in the type definitions of dependencies go undetected.",
  },
  {
    sectionIndex: 5,
    question:
      "What does 'LSP' stand for in 'TypeScript Language Server Protocol'?",
    options: [
      "The program that provides autocomplete and error messages in the editor",
      "A protocol for distributed TypeScript compilation over a network",
      "A library for serializing TypeScript ASTs",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "The language server (tsserver) communicates with your editor via the Language " +
      "Server Protocol. It computes autocomplete, go-to-definition, and type errors.",
  },
  {
    sectionIndex: 5,
    question:
      "When is `isolatedDeclarations: true` useful?",
    options: [
      "Always — it makes TypeScript stricter and safer",
      "I don't know",
      "In large Angular applications with many components",
      "For npm libraries that want to enable parallel .d.ts generation by other tools",
    ],
    correct: 3,
    briefExplanation:
      "`isolatedDeclarations` enforces explicit types on exports. " +
      "This allows any tool (esbuild, swc) to generate .d.ts files — " +
      "without needing the full TypeScript compiler.",
  },

  // ─── Section 6: The Upgrade Path and the Future of TypeScript ────────────

  {
    sectionIndex: 6,
    question:
      "What does `\"typescript\": \"~5.7.0\"` mean in package.json?",
    options: [
      "Exactly version 5.7.0 — no more, no less",
      "At least 5.7.0, less than 6.0.0",
      "At least 5.7.0, only patch updates allowed (5.7.x)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Tilde (~) allows only patch versions. `~5.7.0` = >=5.7.0 <5.8.0. " +
      "This is safer than caret (^) because TypeScript can have behavioral breaking changes " +
      "in minor versions.",
  },
  {
    sectionIndex: 6,
    question:
      "What is `@ts-expect-error` and how does it differ from `@ts-ignore`?",
    options: [
      "Both are identical — they are aliases",
      "I don't know",
      "@ts-expect-error only works in test files",
      "@ts-expect-error itself produces an error when no error exists on the next line; @ts-ignore is always silent",
    ],
    correct: 3,
    briefExplanation:
      "`@ts-expect-error` is more honest: it produces an error when the next line has no error. " +
      "This forces you to remove it once the original error is fixed. " +
      "`@ts-ignore` is easy to forget about.",
  },
  {
    sectionIndex: 6,
    question:
      "From which TC39 stage does TypeScript normally implement new JavaScript features?",
    options: [
      "Stage 1 — as soon as the proposal champion shows an implementation",
      "Stage 2 — when the first specification is available",
      "I don't know",
      "Stage 3 — when syntax and semantics are frozen",
    ],
    correct: 3,
    briefExplanation:
      "Stage 3 means frozen syntax. TypeScript learned (through Decorators) that early " +
      "implementations lead to breaking changes when the proposal still changes.",
  },
];