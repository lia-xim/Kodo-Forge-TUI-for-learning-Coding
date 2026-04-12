/**
 * Lesson 41 — Quiz Data: TypeScript 5.x Features
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 *
 * correct-index distribution: 0=2, 1=2, 2=2, 3=2 (for MC questions)
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "41";
export const lessonTitle = "TypeScript 5.x Features";

export const questions: QuizQuestion[] = [
  // --- Question 1: verbatimModuleSyntax (correct: 0) ---
  {
    question: "What happens when `verbatimModuleSyntax: true` is set and you write `import { Component } from '@angular/core'`, even though Component is only used as a type?",
    options: [
      "TypeScript throws an error: you must write `import type { Component }`",
      "TypeScript removes the import automatically in the output — it is a silent fix without an error message",
      "The import is converted to require() — TypeScript treats it as a CommonJS import",
      "No difference — verbatimModuleSyntax changes nothing about imports, only about exports",
    ],
    correct: 0,
    explanation:
      "With verbatimModuleSyntax, TypeScript checks whether an import only imports types. " +
      "If so, it must be written as `import type`. " +
      "Otherwise a runtime import would be produced that is not tree-shakeable.",
    elaboratedFeedback: {
      whyCorrect:
        "`verbatimModuleSyntax` means: TypeScript does not modify import statements. " +
        "What you write appears 1:1 in the output. If you write a type import without `type`, " +
        "unnecessary runtime imports end up in the bundle — an error is enforced.",
      commonMistake:
        "Many assume TypeScript removes type imports automatically. That is true without " +
        "verbatimModuleSyntax — with this option, that behaviour is disabled.",
    },
  },

  // --- Question 2: moduleResolution bundler (correct: 1) ---
  {
    question: "How does `moduleResolution: 'bundler'` (TS 5.0) differ from `'node'`?",
    options: [
      "bundler only works with esbuild; node works with all tools and is the default",
      "bundler allows imports without file extensions and with package exports fields; node requires extensions for ESM",
      "bundler is slower but more precise than node — it analyses code more deeply",
      "There is no difference — bundler is just an alias for node16",
    ],
    correct: 1,
    explanation:
      "The 'bundler' mode mirrors how Vite, webpack, and esbuild resolve imports: " +
      "without mandatory file extensions, with support for package.json 'exports' fields " +
      "and 'imports' fields. 'node16' requires explicit .js extensions for ESM even on " +
      "TypeScript files — that does not fit bundler workflows.",
    elaboratedFeedback: {
      whyCorrect:
        "Bundlers read package.json 'exports' and resolve imports like Vite/webpack. " +
        "TypeScript must replicate this to type-check correctly. 'node' does not know about 'exports'.",
      commonMistake:
        "Many set 'node16' or 'nodenext' when they are actually using a bundler. " +
        "This leads to errors like 'Relative imports must use .js extensions'.",
    },
  },

  // --- Question 3: Inferred Type Predicates (correct: 2) ---
  {
    question: "What changes in TypeScript 5.5 for `filter(x => x !== null)`?",
    options: [
      "Nothing — this has always worked; TypeScript automatically infers the correct type",
      "TypeScript throws an error because null checks must be explicit and are no longer detected automatically",
      "TypeScript automatically infers `x is NonNullable<T>` as the return type of the callback function",
      "filter now never returns undefined, even without an explicit type predicate — it is always type-safe",
    ],
    correct: 2,
    explanation:
      "Inferred Type Predicates (TS 5.5): when TypeScript detects that the return type of a " +
      "function is always a narrowing condition on the parameter, it automatically infers a " +
      "type predicate. This means `arr.filter(x => x !== null)` returns `T[]` instead of `(T | null)[]`.",
    elaboratedFeedback: {
      whyCorrect:
        "Before TS 5.5 you had to write: `.filter((x): x is NonNullable<T> => x !== null)`. " +
        "That was boilerplate. Now TypeScript recognises the pattern itself.",
      commonMistake:
        "Many still write type predicates manually. From TS 5.5 onwards that is unnecessary for " +
        "simple null checks. Complex predicates still require manual annotation.",
    },
  },

  // --- Question 4: NoInfer<T> (correct: 3) ---
  {
    question: "What does `NoInfer<T>` do in a generic function?",
    code: `function setDefault<T>(values: T[], defaultValue: NoInfer<T>): T[] {
  return values.length ? values : [defaultValue];
}`,
    options: [
      "T is not inferred — it must always be specified explicitly; NoInfer disables automatic detection",
      "NoInfer<T> makes T an optional type parameter that does not have to be provided",
      "defaultValue is not used for the type inference of T, but must still be T",
      "Both parameters are used for inference; NoInfer is documentation only",
    ],
    correct: 3,
    explanation:
      "Incorrect! `NoInfer<T>` (TS 5.4) prevents the wrapped parameter from contributing to " +
      "the inference of T. T is inferred ONLY from `values`. " +
      "However, defaultValue must still be T — it just does not 'pull' T from itself.",
    elaboratedFeedback: {
      whyCorrect:
        "Without NoInfer: `setDefault(['a','b'], 42)` would infer T = string | number " +
        "and compile without error. With NoInfer: T = string (from values), " +
        "and 42 is not a string — error! That is the desired behaviour.",
      commonMistake:
        "The correct answer is actually option C. NoInfer prevents inference contribution " +
        "BUT defaultValue must still match the inferred T.",
    },
  },

  // --- Question 5: using keyword (correct: 0) ---
  {
    question: "What happens when you write `using conn = getConnection()` and the block ends?",
    options: [
      "`conn[Symbol.dispose]()` is called automatically — even if an exception is thrown",
      "`conn.close()` is called if and only if no error occurred — it behaves like try/catch",
      "`conn` is set to null and the garbage collector runs immediately — it is a memory optimisation",
      "Nothing happens automatically — using is only a hint to the developer and has no runtime effect",
    ],
    correct: 0,
    explanation:
      "`using` (Explicit Resource Management, TS 5.2) registers the object for " +
      "automatic disposal at the end of the block. `Symbol.dispose` is guaranteed to be called " +
      "regardless of whether exceptions occurred — similar to `finally`.",
    elaboratedFeedback: {
      whyCorrect:
        "This is the core advantage of `using`: it is safer than try/finally because you " +
        "cannot forget to call dispose. The compiler inserts it automatically.",
      commonMistake:
        "Some confuse `using` with `.close()`. The object must implement `Symbol.dispose`. " +
        "`.close()` has nothing to do with it — you define `[Symbol.dispose]()` " +
        "and can call close() inside it if needed.",
    },
  },

  // --- Question 6: isolatedDeclarations (correct: 1) ---
  {
    question: "For which use case is `isolatedDeclarations: true` most appropriate?",
    options: [
      "For large Angular applications with many components that need declarative types",
      "For npm libraries that want to generate .d.ts files in parallel with other files",
      "For micro-frontends with Module Federation that require isolated builds",
      "For all TypeScript projects — it has no downsides and should always be enabled",
    ],
    correct: 1,
    explanation:
      "`isolatedDeclarations` enforces explicit types on all exports. " +
      "This enables parallel .d.ts generation without a full TypeScript compiler pass. " +
      "In an app (Angular/React) there is no external API that needs typing — " +
      "the overhead of explicit types provides no benefit.",
    elaboratedFeedback: {
      whyCorrect:
        "Libraries need .d.ts files for their consumers. With isolatedDeclarations, " +
        "esbuild or swc can generate these in parallel — much faster than tsc alone.",
      commonMistake:
        "Some enable isolatedDeclarations for apps because it sounds 'stricter'. " +
        "It then requires explicit types for every export — including internal helper " +
        "functions. That is unnecessary and tedious.",
    },
  },

  // --- Question 7: skipLibCheck risk (correct: 2) ---
  {
    question: "What risk arises when `skipLibCheck: true` is set?",
    options: [
      "TypeScript compiles more slowly because more cache management is needed for the skipped files",
      "Your own .ts files are also no longer checked — the compiler ignores the entire source code",
      "Errors in type definitions of dependencies are silently ignored",
      "The project can no longer be compiled with --strict — the option is incompatible with strict",
    ],
    correct: 2,
    explanation:
      "`skipLibCheck: true` skips the checking of all .d.ts files. " +
      "This affects node_modules but also your own generated .d.ts files. " +
      "If a library has incorrect types they will not be caught — " +
      "runtime errors can be the consequence.",
    elaboratedFeedback: {
      whyCorrect:
        "The trade-off is intentional: less build time in exchange for less safety with " +
        "library types. For well-maintained libraries (Angular, React) this is acceptable.",
      commonMistake:
        "Some think skipLibCheck only affects external libraries. But your own " +
        ".d.ts files (from declaration: true) are also skipped.",
    },
  },

  // --- Question 8: Tilde vs Caret (correct: 3) ---
  {
    question: "Why is `\"typescript\": \"~5.7.0\"` safer than `\"typescript\": \"^5.0.0\"` in package.json?",
    options: [
      "Tilde is generally safer for all npm packages — it prevents major updates automatically",
      "Caret ranges do not work with TypeScript — they are only intended for JavaScript packages",
      "Tilde allows patch updates, caret allows minor updates — but TypeScript has no breaking changes in minor versions",
      "Tilde allows only bugfix patches; caret allows minor versions that can contain behavioral breaking changes",
    ],
    correct: 3,
    explanation:
      "TypeScript sometimes changes type inference in minor versions ('behavioral " +
      "breaking changes'). A `^5.0.0` could automatically install TypeScript " +
      "5.5 on `npm install` even though you tested with 5.0 — generating new red code. " +
      "`~5.7.0` allows only 5.7.x — bugfixes only, no inference changes.",
    elaboratedFeedback: {
      whyCorrect:
        "The TypeScript team recommends tilde ranges in production projects. " +
        "Upgrades should be deliberate, not automatic on npm install.",
      commonMistake:
        "Many project templates use `^` because that is the npm default. With TypeScript " +
        "this is riskier than with other packages due to the behavioral breaking changes.",
    },
  },

  // ─── New question formats ────────────────────────────────────────────────

  // --- Question 9: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the name of the TypeScript 5.4 utility type that prevents a type parameter " +
      "from being used to infer another type parameter?",
    expectedAnswer: "NoInfer",
    acceptableAnswers: [
      "NoInfer", "NoInfer<T>", "NoInfer<>", "noinfer",
    ],
    explanation:
      "`NoInfer<T>` (TypeScript 5.4) is a utility type that excludes the wrapped type " +
      "from inference. It allows you to build functions that infer T only from " +
      "specific parameters.",
  },

  // --- Question 10: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which TypeScript 5.0 compiler option value for `moduleResolution` is specifically " +
      "intended for projects using Vite, webpack, or esbuild?",
    expectedAnswer: "bundler",
    acceptableAnswers: [
      "bundler", "\"bundler\"", "'bundler'",
    ],
    explanation:
      "`moduleResolution: 'bundler'` (TS 5.0) mirrors how modern bundlers resolve imports: " +
      "no mandatory file extensions, package.json exports fields are respected. " +
      "This makes working with Vite and other modern tools much easier.",
  },

  // --- Question 11: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the name of the JavaScript symbol (Symbol.*) that must be implemented " +
      "so that an object can be used with `using`?",
    expectedAnswer: "Symbol.dispose",
    acceptableAnswers: [
      "Symbol.dispose", "symbol.dispose", "[Symbol.dispose]",
    ],
    explanation:
      "The Explicit Resource Management protocol (TC39 / TS 5.2) requires that " +
      "objects implement `[Symbol.dispose](): void` to be used with `using`. " +
      "For asynchronous resources there is `[Symbol.asyncDispose]()`.",
  },

  // --- Question 12: Predict-Output ---
  {
    type: "predict-output",
    question: "What type does `result` have after this TypeScript 5.5 code?",
    code:
      "const values: (string | null)[] = ['a', null, 'b', null, 'c'];\n" +
      "const result = values.filter(x => x !== null);",
    expectedAnswer: "string[]",
    acceptableAnswers: [
      "string[]", "Array<string>",
    ],
    explanation:
      "Inferred Type Predicates (TS 5.5): TypeScript recognises that `x => x !== null` " +
      "is a type predicate `x is NonNullable<string | null>` = `x is string`. " +
      "Therefore `.filter(...)` has the return type `string[]` instead of `(string | null)[]`. " +
      "Before TS 5.5 you had to write `filter((x): x is string => x !== null)`.",
  },

  // --- Question 13: Predict-Output ---
  {
    type: "predict-output",
    question: "What is the type of `b` in this TypeScript 5.4 code?",
    code:
      "function setup<T>(items: T[], defaultItem: NoInfer<T>): T {\n" +
      "  return items[0] ?? defaultItem;\n" +
      "}\n" +
      "const b = setup(['hello', 'world'], 42);",
    expectedAnswer: "Compile-Error",
    acceptableAnswers: [
      "Compile-Error", "Error", "compile error", "type error",
    ],
    explanation:
      "T is inferred from `items` as `string` (first parameter, no NoInfer restriction). " +
      "`defaultItem` is `NoInfer<string>` — it must be a string, but 42 is a number. " +
      "TypeScript throws an error: 'Argument of type number is not assignable to parameter " +
      "of type string'. Without NoInfer, T would be inferred as `string | number`.",
  },

  // --- Question 14: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why does `verbatimModuleSyntax: true` combined with Angular lead to better " +
      "bundle size? Explain the relationship between import syntax and tree-shaking.",
    modelAnswer:
      "Without verbatimModuleSyntax, TypeScript can compile type imports into empty imports " +
      "that the bundler cannot remove. With verbatimModuleSyntax, what you write stays as-is — " +
      "`import type` is removed entirely, a regular import remains. This forces developers to " +
      "mark type imports as `import type`. The bundler then clearly sees: this import is types-only, " +
      "remove it. Fewer runtime imports mean smaller bundles and better tree-shaking.",
    keyPoints: [
      "import type is removed entirely by the bundler",
      "A regular import without type could have side effects — the bundler cannot remove it",
      "verbatimModuleSyntax enforces this distinction in the code",
      "Angular Standalone Components benefit through cleaner dependency declarations",
    ],
  },

  // --- Question 15: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why does TypeScript only implement TC39 proposals from Stage 3 onwards, and not " +
      "from Stage 1 or 2? What was the historical lesson behind this?",
    modelAnswer:
      "Stage 3 means: syntax and semantics are frozen. The TC39 committee has decided the " +
      "final API. Before Stage 3 everything can change — syntax, semantics, the feature name. " +
      "TypeScript once implemented a Stage 2 proposal (decorators in their old form) that was " +
      "then completely redesigned. The result was a breaking change in TypeScript 3.x and widespread " +
      "confusion. Since then the informal rule is: implement only from Stage 3 onwards. This prevents " +
      "TypeScript users from building on features that might still be removed or changed.",
    keyPoints: [
      "Stage 3 = frozen syntax and semantics",
      "Before Stage 3 proposals can change completely",
      "Historical lesson: old decorator implementation had to be changed in a breaking way",
      "TypeScript wants to avoid unstable churn in the type system",
    ],
  },
];