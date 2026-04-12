/**
 * Lesson 29 — Quiz Data: tsconfig Deep Dive
 *
 * 15 MC + 5 Short-Answer + 2 Predict-Output + 1 Explain-Why = 23 questions
 * correct indices MC: 4x0, 4x1, 4x2, 3x3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "29";
export const lessonTitle = "tsconfig Deep Dive";

export const questions: QuizQuestion[] = [
  // ─── MC: correct: 0 (4x) ──────────────────────────────────────────────

  {
    question: "What happens to `include` when a child tsconfig uses `extends` and sets its own `include`?",
    options: [
      "The parent file's `include` is completely overridden",
      "Both `include` lists are merged and both apply",
      "The child `include` is ignored and only the parent list is used",
      "TypeScript throws an error because include cannot be overridden"
    ],
    correct: 0,
    explanation: "Unlike compilerOptions (which are merged), include/exclude/files are COMPLETELY overridden when using extends. The parent list is ignored.",
  },

  {
    question: "Which flag is REQUIRED for a project that is referenced with Project References (`references`)?",
    options: [
      "`composite: true` — enables incremental builds and enforces declaration",
      "`incremental: true` — for faster builds by caching compiler information",
      "`declaration: true` — for .d.ts generation that provides types for other projects",
      "`noEmit: true` — for type-checking only without JavaScript output"
    ],
    correct: 0,
    explanation: "composite: true is required for referenced projects. It automatically enables incremental and enforces declaration: true.",
  },

  {
    question: "What does `noEmit: true` do in tsconfig?",
    options: [
      "TypeScript checks types but generates NO files — ideal when esbuild/Vite transpiles",
      "TypeScript only generates .d.ts files and skips JavaScript generation entirely",
      "TypeScript skips type-checking and relies exclusively on the bundler",
      "TypeScript generates minified output that can be used directly in the browser"
    ],
    correct: 0,
    explanation: "noEmit turns TypeScript into a pure type-checker. No .js, no .d.ts — only error messages. The bundler handles transpilation.",
  },

  {
    question: "What does `verbatimModuleSyntax` do differently than `isolatedModules`?",
    options: [
      "It enforces explicit `import type` for pure type imports and replaces three older flags",
      "It is just an alias for isolatedModules and changes nothing about existing behavior",
      "It disables module resolution entirely and uses only relative paths",
      "It enforces CommonJS syntax and prevents the use of ES Modules"
    ],
    correct: 0,
    explanation: "verbatimModuleSyntax (TS 5.0) replaces isolatedModules + preserveValueImports + importsNotUsedAsValues. The rule: import type is deleted, import remains.",
  },

  // ─── MC: correct: 1 (4x) ──────────────────────────────────────────────

  {
    question: "What does `strict: true` enable in TypeScript?",
    options: [
      "Only strictNullChecks and noImplicitAny",
      "11 individual strict flags simultaneously as a bundle",
      "All possible compiler flags at their strictest setting",
      "Only the flags that don't break existing code"
    ],
    correct: 1,
    explanation: "strict is a meta-flag that bundles 11 flags: strictNullChecks, strictFunctionTypes, noImplicitAny, strictPropertyInitialization, and more.",
  },

  {
    question: "Why does `moduleResolution: 'nodenext'` require the `.js` extension in imports?",
    options: [
      "Because TypeScript can only read .js files",
      "Because the import must match the output format — Node.js only sees .js",
      "Because .ts extensions are forbidden by Node.js",
      "Because nodenext only supports CommonJS"
    ],
    correct: 1,
    explanation: "TypeScript does NOT rewrite import paths. The path must work in the JavaScript output. Since Node.js only sees .js, the import must point to .js.",
  },

  {
    question: "What is the difference between `target` and `lib`?",
    options: [
      "`target` determines which APIs are available, `lib` determines syntax transformation",
      "`target` determines syntax transformation, `lib` determines the available API types",
      "There is no difference between target and lib — they are completely interchangeable",
      "`target` is exclusively for browser projects, `lib` is only relevant for Node.js"
    ],
    correct: 1,
    explanation: "target controls WHICH syntax is downleveled (e.g. class → function). lib controls WHICH APIs TypeScript knows about (e.g. DOM, ES2023).",
  },

  {
    question: "What does `skipLibCheck: true` do?",
    options: [
      "Skips checking all imported modules and treats them as trusted",
      "Skips checking .d.ts files — your own code is still fully checked",
      "Disables TypeScript completely for external libraries and treats them as any",
      "Skips checking .ts files in node_modules but not .d.ts files"
    ],
    correct: 1,
    explanation: "skipLibCheck does not check .d.ts files INTERNALLY, but your code is still checked AGAINST those .d.ts files. Only conflicts within the .d.ts are ignored.",
  },

  // ─── MC: correct: 2 (4x) ──────────────────────────────────────────────

  {
    question: "Why is `const enum` incompatible with `isolatedModules`?",
    options: [
      "const enum is generally outdated and should no longer be used in modern projects",
      "const enum generates too much code and significantly increases build time",
      "const enum requires cross-file context — but esbuild/swc only process individual files",
      "const enum only works with CommonJS and is not compatible with ES Modules"
    ],
    correct: 2,
    explanation: "const enum is replaced inline (the value is inlined). esbuild processes files individually and cannot look up values from other files.",
  },

  {
    question: "What does `esModuleInterop: true` do?",
    options: [
      "Allows ES Modules in CommonJS projects and converts them automatically at runtime",
      "Disables module checking and allows arbitrary import syntax without validation",
      "Enables default imports from CommonJS modules via helper functions",
      "Converts all imports to require() and removes ES Module syntax entirely"
    ],
    correct: 2,
    explanation: "CommonJS has no default export concept. esModuleInterop inserts helper functions that wrap module.exports so that import x from 'pkg' works.",
  },

  {
    question: "In Angular: Why is tsconfig split into app and spec?",
    options: [
      "Performance — a smaller tsconfig means faster builds and less memory usage",
      "Angular CLI requires this structure and refuses to build without it",
      "Test isolation — `types: ['jasmine']` only in tests, not in production code",
      "Historical reasons with no practical benefit, kept for compatibility"
    ],
    correct: 2,
    explanation: "Without the split, describe(), it(), expect() would be available in production code. The types option controls which global types are visible.",
  },

  {
    question: "What does `noUncheckedIndexedAccess: true` do?",
    options: [
      "Forbids index access on arrays entirely and enforces the use of methods",
      "Enforces bounds checks at runtime that throw an exception on invalid access",
      "Array/object access by index returns `T | undefined` instead of just `T`",
      "Enables strict array types that only allow specific elements instead of any"
    ],
    correct: 2,
    explanation: "With this flag, arr[5] returns number | undefined instead of number. This prevents array out-of-bounds errors at compile time.",
  },

  // ─── MC: correct: 3 (3x) ──────────────────────────────────────────────

  {
    question: "What is the main advantage of `moduleResolution: 'bundler'` over `'node'`?",
    options: [
      "Faster compilation",
      "Compatibility with CommonJS",
      "Automatic .js extensions",
      "Supports package.json `exports` field and does not require file extensions in imports"
    ],
    correct: 3,
    explanation: "bundler understands modern package.json features (exports, imports) and does not require .js extensions — because the bundler handles file resolution.",
  },

  {
    question: "What happens when you explicitly set `lib` in a tsconfig?",
    options: [
      "The specified libs are added to the default",
      "Only the first lib is loaded",
      "TypeScript ignores the lib option when target is set",
      "The target-based default is COMPLETELY overridden — if you forget DOM, there is no document"
    ],
    correct: 3,
    explanation: "lib completely overrides the default. If you specify ES2022 but forget DOM, TypeScript knows neither document nor window nor fetch.",
  },

  {
    question: "What does `declarationMap: true` generate?",
    options: [
      "Source maps for JavaScript files",
      "An overview of all type declarations",
      "A map of module dependencies",
      ".d.ts.map files that allow 'Go to Definition' to jump to the original source instead of .d.ts"
    ],
    correct: 3,
    explanation: "declarationMap generates .d.ts.map files. In the IDE, 'Go to Definition' then jumps to the original .ts file instead of the generated .d.ts.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // New formats: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which tsconfig flag turns TypeScript into a pure type-checker with no JavaScript output?",
    expectedAnswer: "noEmit",
    acceptableAnswers: ["noEmit", "noEmit: true", "\"noEmit\": true"],
    explanation: "noEmit: true prevents any output. TypeScript checks types but generates no .js or .d.ts files. Ideal when esbuild/Vite/SWC handles transpilation.",
  },

  {
    type: "short-answer",
    question: "How many individual flags does `strict: true` enable in TypeScript 5.6+?",
    expectedAnswer: "11",
    acceptableAnswers: ["11", "eleven"],
    explanation: "strict bundles 11 flags: strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitAny, noImplicitThis, alwaysStrict, useUnknownInCatchVariables, exactOptionalPropertyTypes, noImplicitOverride, strictBuiltinIteratorReturn.",
  },

  {
    type: "short-answer",
    question: "Which flag is required for projects referenced with `references` in a monorepo?",
    expectedAnswer: "composite",
    acceptableAnswers: ["composite", "composite: true", "\"composite\": true"],
    explanation: "composite: true enables incremental builds, enforces declaration: true, and generates .tsbuildinfo. It is required for every project listed in references.",
  },

  {
    type: "short-answer",
    question: "Which moduleResolution strategy is recommended for projects using Webpack, Vite, or esbuild?",
    expectedAnswer: "bundler",
    acceptableAnswers: ["bundler", "\"bundler\"", "moduleResolution: bundler"],
    explanation: "bundler understands package.json exports, does not require .js extensions, and is optimized for bundlers that have their own module resolution.",
  },

  {
    type: "predict-output",
    question: "What type does `x` have with `noUncheckedIndexedAccess: true`?",
    code: "const arr: number[] = [1, 2, 3];\nconst x = arr[0];",
    expectedAnswer: "number | undefined",
    acceptableAnswers: ["number | undefined", "number|undefined"],
    explanation: "With noUncheckedIndexedAccess, index access returns T | undefined. arr[0] is number | undefined because TypeScript cannot guarantee that index 0 exists.",
  },

  {
    type: "predict-output",
    question: "What happens to this import with `verbatimModuleSyntax: true`?",
    code: "import type { User } from './types';\nimport { formatDate } from './utils';\n// Which import remains in the JavaScript output?",
    expectedAnswer: "formatDate",
    acceptableAnswers: ["formatDate", "import { formatDate } from './utils'", "only formatDate", "the second one"],
    explanation: "import type is completely removed. import (without type) remains in the output. verbatimModuleSyntax makes this behavior explicit and enforceable.",
  },

  {
    type: "explain-why",
    question: "Why is the trend 'TypeScript as type-checker rather than compiler' (noEmit + esbuild/swc) so dominant? What are the advantages of this architecture?",
    modelAnswer:
      "esbuild and SWC are written in Go and Rust respectively and transpile 10-100x faster than tsc. " +
      "Since TypeScript type information disappears at runtime anyway (type erasure), transpilation " +
      "does not need a type-checker — it just needs to strip type annotations. esbuild can do this " +
      "trivially. TypeScript remains responsible for correctness checking as a type-checker, " +
      "while the faster transpiler generates the output. The result: faster builds with " +
      "the same type safety.",
    keyPoints: [
      "esbuild/swc are 10-100x faster than tsc at transpilation",
      "Transpilation requires no type information (type erasure)",
      "TypeScript remains responsible for type-checking",
      "isolatedModules/verbatimModuleSyntax ensure compatibility",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect: "include/exclude/files are COMPLETELY overridden when using extends, not merged. Only compilerOptions are merged.",
    commonMistake: "Assuming include is merged like compilerOptions — then files suddenly go missing from the build.",
  },
  1: {
    whyCorrect: "composite: true is the prerequisite for Project References. It enables incremental and enforces declaration.",
    commonMistake: "Relying on declaration: true alone — without composite, tsc --build will not work.",
  },
  2: {
    whyCorrect: "noEmit turns TypeScript into a pure type-checker. No output — ideal when Vite/esbuild handles transpilation.",
    commonMistake: "Thinking noEmit also disables type-checking. No — it only disables output.",
  },
  3: {
    whyCorrect: "verbatimModuleSyntax makes import vs import type explicit. What is marked as import type is deleted, everything else remains.",
    commonMistake: "Thinking verbatimModuleSyntax is just a rename of isolatedModules. It is stricter and replaces three flags.",
  },
  4: {
    whyCorrect: "strict is a meta-flag that bundles 11 individual flags. With each TS release, new flags can be added.",
    commonMistake: "Thinking strict enables ALL compiler flags. No — only the safety-relevant strict flags.",
  },
  5: {
    whyCorrect: "TypeScript does not rewrite import paths. The import must work in the JS output — and there only .js exists.",
    commonMistake: "Viewing the .js extension as a 'bug' or 'nonsense'. It is logically consistent: emit fidelity.",
  },
  6: {
    whyCorrect: "target controls syntax downleveling (class → function, async → generators). lib controls which API types are loaded.",
    commonMistake: "Treating target and lib as the same thing. They are independent — you can have target ES2015 with lib ES2023.",
  },
  7: {
    whyCorrect: "skipLibCheck only skips the INTERNAL checking of .d.ts. Your code is still checked against the .d.ts types.",
    commonMistake: "Thinking skipLibCheck disables all type-checking for external libraries.",
  },
  8: {
    whyCorrect: "const enum is replaced inline — the value is inlined directly. But esbuild only knows the current file.",
    commonMistake: "Regular enums are also blocked by isolatedModules — not true, they generate a runtime object.",
  },
  9: {
    whyCorrect: "esModuleInterop inserts __importDefault helper functions that wrap module.exports as a default export.",
    commonMistake: "Confusing with allowSyntheticDefaultImports — that only allows the syntax, it does not insert helper functions.",
  },
  10: {
    whyCorrect: "The types option controls global types. In tsconfig.spec.json: types: ['jasmine']. In tsconfig.app.json: types: [].",
    commonMistake: "Thinking the split is only for clarity — it actually has a real effect on type visibility.",
  },
  11: {
    whyCorrect: "noUncheckedIndexedAccess returns T | undefined for index access. arr[0] is number | undefined instead of just number.",
    commonMistake: "Confusing this flag with strict. noUncheckedIndexedAccess is NOT part of strict!",
  },
  12: {
    whyCorrect: "bundler understands exports/imports in package.json and does not require .js extensions. The bundler resolves files.",
    commonMistake: "Confusing bundler with node. node does NOT understand the exports field in package.json.",
  },
  13: {
    whyCorrect: "lib completely overrides the default. Without DOM, document/window/fetch are unknown.",
    commonMistake: "Assuming lib is added to the default. No — explicit lib = NO default anymore.",
  },
  14: {
    whyCorrect: "declarationMap enables Go-to-Definition to the original source instead of the generated .d.ts.",
    commonMistake: "Confusing declarationMap with sourceMap. sourceMap is for JS debugging, declarationMap is for type navigation.",
  },
};