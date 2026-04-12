/**
 * Lesson 29 — Pre-Test Questions: tsconfig Deep Dive
 *
 * 3 questions per section, asked BEFORE reading.
 * Goal: "Prime" the brain for the upcoming explanation.
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
  // ─── Section 1: tsconfig Basic Structure ──────────────────────────────────

  {
    sectionIndex: 1,
    question: "What happens to `include` in a child tsconfig that uses `extends`?",
    options: [
      "It is merged with the parent include",
      "It completely overrides the parent include",
      "It is ignored",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "compilerOptions are merged, but include/exclude/files are completely overridden.",
  },
  {
    sectionIndex: 1,
    question: "What is `composite: true` in a tsconfig used for?",
    options: [
      "For faster compilation",
      "For Project References in monorepos",
      "For JSX support",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "composite: true is required for any project referenced in references. It enables incremental builds.",
  },
  {
    sectionIndex: 1,
    question: "If a file is in both `files` AND `exclude` — will it be compiled?",
    options: [
      "No, exclude takes priority",
      "Yes, files has absolute priority over exclude",
      "Error — having both simultaneously is invalid",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "files has the highest priority. exclude only filters include, never files.",
  },

  // ─── Section 2: Strict Mode Family ─────────────────────────────────────

  {
    sectionIndex: 2,
    question: "How many individual flags does `strict: true` enable?",
    options: [
      "3 flags",
      "11 flags",
      "All compiler flags",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "strict bundles 11 flags: strictNullChecks, noImplicitAny, strictFunctionTypes and 8 more.",
  },
  {
    sectionIndex: 2,
    question: "Which strict flag prevents null/undefined from 'infecting' every type?",
    options: [
      "noImplicitAny",
      "strictNullChecks",
      "strictFunctionTypes",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "strictNullChecks makes null and undefined their own types instead of hiding them inside every type.",
  },
  {
    sectionIndex: 2,
    question: "Can you set `strict: true` and disable individual flags?",
    options: [
      "Yes, individual flags can be overridden",
      "No, strict is all-or-nothing",
      "Only in tsconfig.base.json",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "strict: true enables all strict flags, but individual ones can be set to false afterward.",
  },

  // ─── Section 3: Module Resolution ───────────────────────────────────────

  {
    sectionIndex: 3,
    question: "What is `moduleResolution` — what does this flag control?",
    options: [
      "How TypeScript resolves import paths to files",
      "The output format (ESM vs CommonJS)",
      "Which modules are allowed to be exported",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "moduleResolution determines the algorithm TypeScript uses to resolve import paths to concrete files.",
  },
  {
    sectionIndex: 3,
    question: "Why must you write the .js extension in imports when using `moduleResolution: 'nodenext'`?",
    options: [
      "Because Node.js only sees .js at runtime and TypeScript does not rewrite imports",
      "Because TypeScript can only read .js files",
      "Because .ts imports are forbidden",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "TypeScript does not rewrite import paths. The import must work in the output — and there only .js exists.",
  },
  {
    sectionIndex: 3,
    question: "Is configuring `paths` in tsconfig enough for path aliases?",
    options: [
      "No, the bundler needs its own alias configuration",
      "Yes, TypeScript and the bundler use the same configuration",
      "paths does not exist in tsconfig",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "paths only resolves the TypeScript side. The bundler needs its own configuration (exception: Next.js reads paths directly).",
  },

  // ─── Section 4: Output Configuration ───────────────────────────────────

  {
    sectionIndex: 4,
    question: "What is the difference between `target` and `module`?",
    options: [
      "target = syntax level (ES5, ES2022), module = import/export format (ESM, CJS)",
      "No difference — both control the JavaScript version",
      "target = Node.js, module = browser",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "target determines the JavaScript syntax version. module determines the module format (import/export vs require/module.exports).",
  },
  {
    sectionIndex: 4,
    question: "What does `declaration: true` generate?",
    options: [
      "Source maps for debugging",
      "Minified JavaScript output",
      ".d.ts files with type information",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "declaration generates .d.ts files containing only type information — no JavaScript. Required for libraries.",
  },
  {
    sectionIndex: 4,
    question: "If you explicitly set `lib` and forget `DOM` — what happens?",
    options: [
      "TypeScript adds DOM automatically",
      "No effect",
      "TypeScript no longer knows about document, window, and fetch",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "lib completely overrides the default. Without DOM, TypeScript does not know any browser APIs.",
  },

  // ─── Section 5: Advanced Flags ──────────────────────────────────────────

  {
    sectionIndex: 5,
    question: "What does `skipLibCheck: true` NO LONGER check?",
    options: [
      "Your own code",
      "All imported modules",
      ".d.ts files (type definitions)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "skipLibCheck skips the INTERNAL checking of .d.ts files. Your code is still checked against the .d.ts types.",
  },
  {
    sectionIndex: 5,
    question: "Why is `isolatedModules` required for esbuild/swc/Vite?",
    options: [
      "Performance reasons",
      "I don't know",
      "Security reasons",
      "These tools process files individually — features that require cross-file context do not work",
    ],
    correct: 3,
    briefExplanation: "esbuild/swc only know the current file. const enum, re-export without type — these require context from other files.",
  },
  {
    sectionIndex: 5,
    question: "What is `esModuleInterop` and why do you need it?",
    options: [
      "For ES modules in old browsers",
      "I don't know",
      "For tree shaking",
      "For default imports from CommonJS modules (e.g. import express from 'express')",
    ],
    correct: 3,
    briefExplanation: "CommonJS has no default export. esModuleInterop adds helper functions that enable default imports from CommonJS modules.",
  },

  // ─── Section 6: Practical Configs ──────────────────────────────────────────

  {
    sectionIndex: 6,
    question: "Why does Angular have `experimentalDecorators: true` in its tsconfig?",
    options: [
      "For performance optimizations",
      "I don't know",
      "For template syntax",
      "Because Angular uses legacy decorators that existed before the TC39 standard",
    ],
    correct: 3,
    briefExplanation: "Angular has used experimental decorators (@Component, @Injectable) since 2016. The new standard decorators have different semantics.",
  },
  {
    sectionIndex: 6,
    question: "Why does a React/Vite tsconfig have `noEmit: true`?",
    options: [
      "React does not need JavaScript",
      "I don't know",
      "For Hot Module Replacement",
      "Vite/esbuild handles the transpilation — TypeScript only checks types",
    ],
    correct: 3,
    briefExplanation: "noEmit makes TypeScript a pure type-checker. Vite uses esbuild for fast transpilation.",
  },
  {
    sectionIndex: 6,
    question: "Which flag is missing from `strict: true` but still belongs in every professional tsconfig?",
    options: [
      "skipLibCheck",
      "esModuleInterop",
      "noUncheckedIndexedAccess",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "noUncheckedIndexedAccess is not part of strict, but yields T | undefined for index access — prevents array out-of-bounds errors.",
  },
];