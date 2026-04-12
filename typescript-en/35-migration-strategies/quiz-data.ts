// quiz-data.ts — L35: Migration Strategies
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "35";
export const lessonTitle = "Migration Strategies";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Strategie-Wahl — correct: 0 ---
  {
    question: "Which migration strategy is recommended for large projects with active feature work?",
    options: [
      "Gradual migration (allowJs + step-by-step .js→.ts)",
      "Big Bang (rename all files at once and fix all errors at once)",
      "Don't migrate at all — JavaScript is perfectly sufficient for modern web development",
      "Complete rewrite in TypeScript — that is the recommended approach for all projects",
    ],
    correct: 0,
    explanation:
      "Gradual migration allows feature work to continue in parallel with migration. Each PR is " +
      "small and reviewable. The risk is minimal — errors only affect migrated files.",
    elaboratedFeedback: {
      whyCorrect: "Big Bang blocks all other work and creates huge unreviwable PRs. Gradual migration lets both run in parallel: new features in .ts, existing files migrated step by step.",
      commonMistake: "Some think 'all at once' is faster. In reality it takes LONGER, because tracking down errors in a massive diff is much harder than in small PRs."
    }
  },

  // --- Frage 2: Migrationsreihenfolge — correct: 0 ---
  {
    question: "In what order should you convert files during a gradual migration?",
    options: [
      "Leaves first (files with no dependencies), then work inward",
      "The largest files first — they have the greatest impact on code quality",
      "Alphabetically by filename — that is neutral and prevents deliberate selection",
      "Randomly — order doesn't matter, all files are equally important",
    ],
    correct: 0,
    explanation:
      "Leaves (files without imports) first, because they have no untyped dependencies. " +
      "Each migrated file improves types for all files that import it.",
    elaboratedFeedback: {
      whyCorrect: "If you migrate types.ts first, ALL importing files immediately benefit from the types. If you migrate a root file (e.g. App.tsx) first, its imports are all still 'any'.",
      commonMistake: "Some migrate the 'most important' files first (e.g. the main component). That results in many any-imports. Better: work from the leaves toward the root."
    }
  },

  // --- Frage 3: allowJs — correct: 0 ---
  {
    question: "What does 'allowJs: true' in tsconfig enable?",
    options: [
      "JavaScript files (.js) and TypeScript files (.ts) can coexist in the same project",
      "JavaScript files are automatically converted to TypeScript without manual intervention",
      "TypeScript errors in .js files are ignored and not shown in the output",
      "JavaScript files are compiled with Strict Mode and receive full type safety",
    ],
    correct: 0,
    explanation:
      "allowJs enables mixed projects — .js and .ts files can import each other. " +
      "This is the foundation for gradual migration.",
    elaboratedFeedback: {
      whyCorrect: "Without allowJs the compiler ignores .js files completely. With allowJs they are included — imports work, TypeScript infers types (though often 'any').",
      commonMistake: "allowJs does NOT check .js files for type errors. For that you additionally need checkJs: true or @ts-check in individual files."
    }
  },

  // --- Frage 4: ts-expect-error — correct: 0 ---
  {
    question: "Why is '@ts-expect-error' better than '@ts-ignore' during migrations?",
    options: [
      "It reports an error when the suppressed line NO LONGER has an error — cleans itself up",
      "It is faster for the compiler because it generates less processing overhead",
      "It also works in JavaScript files — @ts-ignore only works in TypeScript files",
      "It only suppresses specific error types and still allows all other compiler errors",
    ],
    correct: 0,
    explanation:
      "@ts-expect-error EXPECTS an error. When the error is fixed (e.g. through migration), " +
      "TypeScript reports: 'Unused @ts-expect-error directive'. This way you automatically find " +
      "all places that no longer need to be suppressed.",
    elaboratedFeedback: {
      whyCorrect: "@ts-ignore stays silent forever — even when the error has long been fixed. @ts-expect-error actively tells you: 'There was a problem here that is now resolved — remove me.' That is invaluable during migrations.",
      commonMistake: "Many use @ts-ignore out of habit. In migration PRs @ts-expect-error should be used exclusively — every @ts-ignore is worth a code review comment."
    }
  },

  // --- Frage 5: JSDoc-Typen — correct: 1 ---
  {
    question: "Which JSDoc syntax gives a JavaScript function parameter types?",
    options: [
      "@type {function(string, number): boolean} — annotates the entire function signature at once",
      "@param {string} name — and @returns {boolean}",
      "@typedef {Object} FunctionType — defines a reusable function type",
      "@template T — for generic functions with dynamic type parameters",
    ],
    correct: 1,
    explanation:
      "@param {Type} name annotates individual parameters, @returns {Type} the return type. " +
      "TypeScript recognizes these JSDoc tags and uses them for type checking.",
    elaboratedFeedback: {
      whyCorrect: "/** @param {string} name @param {number} age @returns {User} */ — that is the standard JSDoc syntax TypeScript understands with checkJs. Even generics work with @template T.",
      commonMistake: "@type is used for variables, not function parameters. @typedef defines a reusable type, not a function signature."
    }
  },

  // --- Frage 6: strictNullChecks — correct: 1 ---
  {
    question: "Why is strictNullChecks the hardest strict flag during migrations?",
    options: [
      "It is only available for TypeScript 5.0+ and does not work in older versions",
      "It fundamentally changes how null/undefined are handled and generates the most errors",
      "It is incompatible with Angular projects and causes unsolvable template errors",
      "It slows compile time by 50% because more type checks need to be performed",
    ],
    correct: 1,
    explanation:
      "Without strictNullChecks, undefined is implicitly included in EVERY type. With strictNullChecks " +
      "every possible null/undefined location must be handled explicitly. This affects " +
      "find(), getElementById(), optional properties — everywhere.",
    elaboratedFeedback: {
      whyCorrect: "strictNullChecks makes null and undefined their own types instead of including them in every type. Array.find() returns T | undefined instead of T. That generates hundreds of errors in typical projects.",
      commonMistake: "Some think strictNullChecks is optional. It is the MOST IMPORTANT flag — it prevents the most common error class in JavaScript: 'Cannot read property of undefined'."
    }
  },

  // --- Frage 7: esModuleInterop — correct: 1 ---
  {
    question: "What does 'esModuleInterop: true' solve during migration?",
    options: [
      "It automatically converts CommonJS to ES Modules without manual adjustments",
      "It allows 'import x from \"pkg\"' instead of 'import * as x from \"pkg\"' for CommonJS modules",
      "It disables module resolution and exclusively uses relative paths instead",
      "It enables tree-shaking for CommonJS modules and automatically removes unused exports",
    ],
    correct: 1,
    explanation:
      "CommonJS modules have no 'default export'. Without esModuleInterop you must use " +
      "'import * as'. With esModuleInterop TypeScript generates a helper " +
      "that enables default imports.",
    elaboratedFeedback: {
      whyCorrect: "Express, Lodash and many other packages use module.exports (CommonJS). esModuleInterop generates an __importDefault helper that makes CommonJS exports available as default imports.",
      commonMistake: "esModuleInterop changes the generated JavaScript code (adds helpers). That is irrelevant for bundler projects (webpack, Vite), but matters when running directly with Node.js."
    }
  },

  // --- Frage 8: declare module — correct: 1 ---
  {
    question: "How do you give an untyped npm package minimal types?",
    options: [
      "Manually edit the package in node_modules and add the type definitions yourself",
      "'declare module \"packagename\";' in a .d.ts file — everything becomes 'any'",
      "Configure the TypeScript compiler with --ignorePackage to exclude the package",
      "Replace the package with a typed alternative — that is the only clean solution",
    ],
    correct: 1,
    explanation:
      "'declare module \"packagename\";' without a body makes all imports from that module 'any'. " +
      "That is the minimum — no type error, but also no type protection. Refine " +
      "incrementally with function declarations.",
    elaboratedFeedback: {
      whyCorrect: "A single line is enough to silence the compiler. You can then add types step by step: declare module \"pkg\" { export function x(s: string): void; }",
      commonMistake: "Some edit files in node_modules. That gets overwritten on the next npm install. Always declare in your own .d.ts file."
    }
  },

  // --- Frage 9: Strict-Reihenfolge — correct: 2 ---
  {
    question: "Which strict flag should you enable FIRST?",
    options: [
      "strictNullChecks (the most important) — it should be activated immediately for maximum safety",
      "noImplicitAny (the most common) — it affects the most places and delivers quick progress",
      "alwaysStrict (the easiest — almost never causes errors)",
      "strictPropertyInitialization (for classes) — it is the logical starting point for OOP projects",
    ],
    correct: 2,
    explanation:
      "alwaysStrict only adds 'use strict' — that almost never causes errors and is " +
      "standard in modern JavaScript anyway. Then: strictBindCallApply, noImplicitThis " +
      "(few errors), then noImplicitAny, then strictNullChecks.",
    elaboratedFeedback: {
      whyCorrect: "The order follows the principle 'Low Risk, High Value first': alwaysStrict has near-zero risk. strictNullChecks has the highest risk (most errors) and should come last.",
      commonMistake: "Some activate strict: true immediately and fight thousands of errors. Better: enable flag by flag, fix errors, next flag."
    }
  },

  // --- Frage 10: Non-null Assertion — correct: 2 ---
  {
    question: "When is the non-null assertion (!) an acceptable transitional mechanism?",
    options: [
      "Always — ! is safer than explicit checks because it costs nothing at runtime",
      "Never — ! should be generally banned because it completely bypasses type safety",
      "When activating strictNullChecks as a temporary solution with a TODO marker",
      "Only in test files — ! is generally not acceptable in production code",
    ],
    correct: 2,
    explanation:
      "When activating strictNullChecks hundreds of errors can appear. ! as a " +
      "temporary fix with '// TODO: Remove ! after migration' is acceptable — as long " +
      "as the ! locations are systematically eliminated.",
    elaboratedFeedback: {
      whyCorrect: "The alternative would be not activating strictNullChecks until ALL locations are fixed. That can take months. ! as a transitional step allows immediate activation with a planned removal.",
      commonMistake: "! without a TODO comment and without a removal plan is an antipattern. Every ! is technical debt — it must be tracked and prioritized."
    }
  },

  // --- Frage 11: checkJs — correct: 2 ---
  {
    question: "What is the difference between checkJs: true in tsconfig and @ts-check in a file?",
    options: [
      "checkJs is faster, @ts-check is more precise — both activate type checking in different ways",
      "There is no difference — both activate type checking for the same set of files",
      "checkJs activates checking for ALL .js files, @ts-check only for that one file",
      "checkJs only works with allowJs: false — @ts-check always works regardless",
    ],
    correct: 2,
    explanation:
      "checkJs: true checks ALL .js files globally. @ts-check activates checking only " +
      "for the specific file. During migration @ts-check per file is more precise — " +
      "you only enable it for already cleaned-up files.",
    elaboratedFeedback: {
      whyCorrect: "checkJs: true → all .js files → hundreds of errors immediately. @ts-check → one file → few, manageable errors. The file-by-file approach is more controlled.",
      commonMistake: "When checkJs: true is active, you can opt out individual files with @ts-nocheck. That is the inverse: globally on, individually off (instead of globally off, individually on)."
    }
  },

  // --- Frage 12: Dynamic Properties — correct: 2 ---
  {
    question: "What is the type-safe solution for dynamic property access during migration?",
    options: [
      "as any for the object — that is the simplest and most widely used workaround",
      "Use Object.defineProperty — that allows dynamic properties with full type safety",
      "Record<string, unknown> or an interface with an index signature",
      "eval() for dynamic expressions — that is the recommended solution in TypeScript projects",
    ],
    correct: 2,
    explanation:
      "Record<string, unknown> allows arbitrary string keys with the safe type 'unknown'. " +
      "For known + dynamic keys: interface with index signature and explicit properties.",
    elaboratedFeedback: {
      whyCorrect: "Record<string, unknown> is the safe variant: you can set arbitrary keys, but must check the value before using it (because unknown). Record<string, any> would be unsafe.",
      commonMistake: "Many use 'as any' as a quick fix. That completely disables the type check. Record<string, unknown> is equally flexible but safe."
    }
  },

  // --- Frage 13: Migration-Metriken — correct: 3 ---
  {
    question: "Which 4 metrics best measure migration progress?",
    options: [
      "Lines of code, commit frequency, build time, test coverage — classic metrics showing overall progress",
      "Number of files, number of classes, number of functions, number of imports — structural metrics measuring code size",
      "Compile time, bundle size, memory usage, CPU load — performance metrics showing build quality",
      "TS file ratio, any-count, ts-ignore-count, strict error count",
    ],
    correct: 3,
    explanation:
      "TS ratio shows overall progress. any-count shows type quality. ts-ignore/ts-expect-error " +
      "the suppressed errors. Strict error count the distance to the goal (strict: true).",
    elaboratedFeedback: {
      whyCorrect: "These 4 numbers give a complete picture: How much is migrated? How good is the quality? What is suppressed? How far to the goal? — Measurable, trackable, reportable.",
      commonMistake: "Lines of code or build time are not good migration metrics. A file can have 1000 lines and still be full of 'any'."
    }
  },

  // --- Frage 14: useState-Migration — correct: 3 ---
  {
    question: "Why does useState(null) in React need an explicit type parameter?",
    options: [
      "React hooks do not work with null — that is a React limitation affecting useState",
      "TypeScript cannot use null as a type — it always requires a concrete object type",
      "useState is not generic and therefore cannot infer union types with null",
      "TypeScript infers the type 'null' — not 'User | null' as intended",
    ],
    correct: 3,
    explanation:
      "TypeScript infers the narrowest type. useState(null) → type is 'null'. " +
      "You must write useState<User | null>(null) so TypeScript knows " +
      "that the state can later also hold User values.",
    elaboratedFeedback: {
      whyCorrect: "Inference is based on the initial value. null is null, not User | null. Without explicit generic: setUser(userData) → ERROR: 'User' is not assignable to 'null'.",
      commonMistake: "Same problem with useState([]): type is never[] instead of User[]. Solution: useState<User[]>([])."
    }
  },

  // --- Frage 15: Angular strictTemplates — correct: 3 ---
  {
    question: "What does Angular's 'strictTemplates: true' check that is NOT checked without this option?",
    options: [
      "The runtime performance of templates — how quickly they are rendered and updated",
      "Whether templates contain valid HTML — incorrect tags and attributes are caught at compile time",
      "The correctness of CSS classes in templates — invalid classes are reported by the compiler",
      "Property bindings, event handlers, and pipe return types in templates",
    ],
    correct: 3,
    explanation:
      "strictTemplates activates template type checking: [value]=\"expr\" is checked against " +
      "the correct type, (click)=\"handler($event)\" against the correct event signature, " +
      "and pipes against correct return types.",
    elaboratedFeedback: {
      whyCorrect: "Without strictTemplates Angular templates are a 'type-free zone' — everything is accepted, errors only appear at runtime. With strictTemplates the compiler checks templates like TypeScript code.",
      commonMistake: "strictTemplates is NOT the same as strict in tsconfig. strictTemplates is an Angular compiler option, strict is a TypeScript option. Both should be active."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which tsconfig flag allows JavaScript files (.js) in a TypeScript project?",
    expectedAnswer: "allowJs",
    acceptableAnswers: ["allowJs", "allowJs: true", "allow-js", "allowjs"],
    explanation:
      "allowJs: true enables mixed .js/.ts projects. It is the foundation " +
      "for gradual migration — without allowJs you would have to rename all files at once.",
  },

  {
    type: "short-answer",
    question: "Which JSDoc tag annotates a function parameter with a type?",
    expectedAnswer: "@param",
    acceptableAnswers: ["@param", "param", "@param {type} name"],
    explanation:
      "@param {Type} name — annotates a parameter with a type. " +
      "TypeScript recognizes this JSDoc tag and uses it for type checking in .js files.",
  },

  {
    type: "short-answer",
    question: "What is the name of the strict flag that makes null and undefined their own types?",
    expectedAnswer: "strictNullChecks",
    acceptableAnswers: ["strictNullChecks", "strict-null-checks", "strictnullchecks"],
    explanation:
      "strictNullChecks makes null and undefined independent types instead of " +
      "implicitly including them in every type. It is the most important and most demanding strict flag.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Does this code compile with strictNullChecks: true? Answer 'Yes' or 'No'.",
    code:
      "function getFirst(items: string[]): string {\n" +
      "  return items.find(i => i.startsWith('A'));\n" +
      "}",
    expectedAnswer: "No",
    acceptableAnswers: ["No", "no", "Nein", "nein"],
    explanation:
      "Array.find() returns string | undefined (with strictNullChecks). " +
      "The function promises string as its return type — undefined is not string. " +
      "Fix: change return type to string | undefined or use non-null assertion (!).",
  },

  {
    type: "predict-output",
    question: "What type does 'data' have in this JavaScript code with @ts-check?",
    code:
      "// @ts-check\n" +
      "function process(data) {\n" +
      "  return data.length;\n" +
      "}",
    expectedAnswer: "any",
    acceptableAnswers: ["any", "implicit any", "implicitly any"],
    explanation:
      "Without a JSDoc annotation or type inference source, 'data' is implicitly 'any'. " +
      "@ts-check alone is not enough — you need @param {string[]} data or similar " +
      "annotations for TypeScript to know the type.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is gradual migration (allowJs → checkJs → strict) safer " +
      "than a Big Bang (renaming all files at once)?",
    modelAnswer:
      "Gradual migration reduces risk through small, reviewable steps. Each PR migrates " +
      "a few files — errors are easy to localize. Feature work continues in parallel, " +
      "the team is not blocked. allowJs enables coexistence of .js and .ts so not " +
      "everything needs to change at once. With Big Bang a huge PR is created that cannot be meaningfully " +
      "reviewed, feature work is blocked, and regressions affect the entire codebase.",
    keyPoints: [
      "Small PRs are reviewable, large ones are not",
      "Feature work continues in parallel",
      "Errors only affect migrated files, not everything",
      "allowJs enables coexistence during migration",
      "Big Bang blocks the entire team for days/weeks",
    ],
  },
];