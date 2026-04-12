// quiz-data.ts — L27: Declaration Merging
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 questions
// MC correct-index distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "27";
export const lessonTitle = "Declaration Merging";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- correct: 0 ---
  {
    question: "What happens when you declare two interfaces with the same name in TypeScript?",
    options: [
      "They are automatically merged into one interface (Declaration Merging)",
      "TypeScript reports a compile error for duplicate declaration and refuses to compile",
      "The second interface completely overwrites the first and all properties are lost",
      "Both exist independently and must be explicitly merged",
    ],
    correct: 0,
    explanation:
      "TypeScript automatically merges interfaces with the same name. All properties from " +
      "both declarations are combined. This is an intentional design feature.",
    elaboratedFeedback: {
      whyCorrect: "Interface Merging is TypeScript's answer to JavaScript's dynamic nature. It allows extending types across file boundaries — without changing the original type.",
      commonMistake: "Many expect an error like with 'type' (duplicate declaration). But 'interface' is intentionally designed as 'open' — 'type' is 'closed'. This is not a bug, but a feature."
    }
  },

  {
    question: "Why does Module Augmentation require 'declare module' with the EXACT package name?",
    options: [
      "A wrong name creates a new, separate module instead of extending the existing one",
      "TypeScript completely ignores augmentations with wrong names and shows no warning",
      "Wrong names cause a compile error and prevent compilation",
      "The package name only needs to approximately match — TypeScript finds the correct module automatically",
    ],
    correct: 0,
    explanation:
      "With a wrong module name, TypeScript creates a NEW module with the wrong name. " +
      "There is no error — the augmentation simply exists in the wrong namespace " +
      "and has no effect on the target module.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript cannot know whether you want to declare a new module or extend an existing one. If the name doesn't match, it assumes you want a new module. No error, but also no merging.",
      commonMistake: "Most common error with Express: 'express' instead of 'express-serve-static-core'. The augmentation seems to work (no error), but req.user is still 'unknown'."
    }
  },

  {
    question: "What is the purpose of 'declare global { }' in TypeScript?",
    options: [
      "Extend the global scope (window, globalThis, process) from within a module",
      "Make all variables in the current file global and accessible from all modules",
      "Disable TypeScript's Strict Mode and turn off all type checks for the file",
      "Hide global variables from other modules and ensure encapsulation",
    ],
    correct: 0,
    explanation:
      "'declare global' is an 'escape hatch' from the module system. It adds " +
      "declarations to the global scope — useful for window.*, process.env, etc.",
    elaboratedFeedback: {
      whyCorrect: "Modules are isolated — declarations within a module are not globally visible. 'declare global' breaks out of this isolation and adds types to the global scope.",
      commonMistake: "Many forget 'export {}' in the file. Without import/export the file is a Script (already global), and 'declare global' makes no sense — TypeScript ignores it or shows an error."
    }
  },

  {
    question: "What does 'declare function add(a: number, b: number): number' do in a .d.ts file?",
    options: [
      "Declares the type of a function that is implemented ELSEWHERE — without a function body",
      "Implements and exports the add function with default logic for use",
      "Creates an abstract function that must later be overridden by a concrete class",
      "Declares a function that only exists in the type system (Phantom Function) and is never called",
    ],
    correct: 0,
    explanation:
      "'declare' means: 'This value exists at runtime, I am only describing the type.' " +
      "There is no implementation — it comes from JavaScript code or a library.",
    elaboratedFeedback: {
      whyCorrect: "'declare' is TypeScript's way of saying: 'Trust me, this function exists.' The implementation comes from outside (JavaScript file, global script, CDN library). The .d.ts only describes the type.",
      commonMistake: "Some try to write function bodies in .d.ts files. This causes an error — .d.ts files may only contain declarations, not implementations."
    }
  },

  // --- correct: 1 ---
  {
    question: "What happens when two interface declarations have the same property with DIFFERENT types?",
    options: [
      "The later type overwrites the earlier one",
      "TypeScript reports a compile error",
      "Both types are combined into a union",
      "TypeScript automatically selects the broader type",
    ],
    correct: 1,
    explanation:
      "When the same property has different types, it is a compile error. " +
      "Interface Merging only works if the same properties also have the same type. " +
      "This prevents accidental type conflicts.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript reports: 'Subsequent property declarations must have the same type.' This is a safety feature — silent type conflicts would be more dangerous than a loud error.",
      commonMistake: "Some expect TypeScript to form a union (string | number). No — properties must match exactly. Only for method overloads are declarations combined."
    }
  },

  {
    question: "Why must a file with 'declare module' or 'declare global' have at least one import/export?",
    options: [
      "TypeScript needs the import for type resolution",
      "Without import/export the file is a 'Script' (global) instead of a 'Module' (isolated)",
      "Only modules may contain declarations",
      "This is a bug in TypeScript that has not been fixed yet",
    ],
    correct: 1,
    explanation:
      "TypeScript distinguishes 'Scripts' (everything global) and 'Modules' (isolated). " +
      "declare global only makes sense in modules — in Scripts everything is already global. " +
      "'export {}' is the minimal way to make a file a module.",
    elaboratedFeedback: {
      whyCorrect: "In a Script, 'declare global' would be redundant — everything is already global. 'declare module' in a Script would create an Ambient Module Declaration (different behavior!). The 'export {}' trick explicitly makes the file a module.",
      commonMistake: "Many forget the 'export {}' and wonder why the augmentation doesn't work or behaves differently than expected."
    }
  },

  {
    question: "How do you correctly extend Express's Request interface?",
    options: [
      "declare module 'express' { interface Request { user: User } }",
      "declare module 'express-serve-static-core' { interface Request { user: User } }",
      "interface Express.Request { user: User }",
      "type Request = import('express').Request & { user: User }",
    ],
    correct: 1,
    explanation:
      "Express re-exports Request from 'express-serve-static-core'. You must extend the " +
      "SOURCE module, not the re-exporting one. Find the correct module name " +
      "in node_modules/@types/express/index.d.ts.",
    elaboratedFeedback: {
      whyCorrect: "In @types/express it says: import * as core from 'express-serve-static-core'. Request comes from core. If you augment 'express' instead of 'express-serve-static-core', you are hitting the wrong interface.",
      commonMistake: "The most common Express augmentation error. declare module 'express' creates a NEW Request interface in the express module that has nothing to do with the original."
    }
  },

  {
    question: "Which precedence rule applies to method overloads through Interface Merging?",
    options: [
      "The earlier declaration always takes precedence",
      "The later declaration takes precedence (overloads are prepended)",
      "TypeScript automatically selects the most specific overload",
      "The order is undefined and can vary",
    ],
    correct: 1,
    explanation:
      "With Interface Merging, method overloads of the later declaration are placed BEFORE " +
      "those of the earlier one. This makes sense: extensions (later) should " +
      "take precedence over originals (earlier).",
    elaboratedFeedback: {
      whyCorrect: "TypeScript prioritizes the extender over the creator. If a plugin adds an overload, it should be checked first — not hidden by the original overload.",
      commonMistake: "The reverse order is counterintuitive. Many expect 'first declared, first checked'. TypeScript does the opposite — for good reason."
    }
  },

  // --- correct: 2 ---
  {
    question: "What is the difference between Module Augmentation and Global Augmentation?",
    options: [
      "Module Augmentation is for npm packages, Global is for local files",
      "Module Augmentation needs import, Global does not and works in any file",
      "Module extends a specific package, Global extends window/process/globalThis",
      "There is no difference — both do the same thing and are interchangeable",
    ],
    correct: 2,
    explanation:
      "Module Augmentation (declare module 'x') extends a specific npm package. " +
      "Global Augmentation (declare global {}) extends the global scope (window, process).",
    elaboratedFeedback: {
      whyCorrect: "Express-Request → Module Augmentation (belongs to the Express package). window.analytics → Global Augmentation (belongs to the global browser scope). process.env → Global Augmentation (NodeJS global).",
      commonMistake: "Some use declare global for Express extensions. This does not work — Express-Request is not a global type, it belongs to the express module."
    }
  },

  {
    question: "What does 'declare module \"*.png\" { ... }' do in a .d.ts file?",
    options: [
      "It converts PNG files to TypeScript code and automatically creates type definitions",
      "It prevents importing PNG files and blocks all asset references",
      "It defines the type for all PNG imports (Wildcard Module Declaration)",
      "It automatically generates type files for PNG assets used in the project",
    ],
    correct: 2,
    explanation:
      "Wildcard Module Declarations type imports that are not TypeScript/JavaScript files. " +
      "*.png, *.svg, *.css — anything a bundler resolves can be typed this way.",
    elaboratedFeedback: {
      whyCorrect: "declare module '*.png' { const src: string; export default src; } — now import logo from './logo.png' returns a string (the URL). Without this declaration: compile error 'Cannot find module'.",
      commonMistake: "Some think the .d.ts generates code. No — it only describes what the bundler (Webpack, Vite) delivers at runtime. The type declaration must match the bundler output."
    }
  },

  {
    question: "Which TypeScript compiler flag automatically generates .d.ts files?",
    options: [
      "emitDeclarationOnly",
      "strict",
      "declaration: true",
      "noEmit",
    ],
    correct: 2,
    explanation:
      "'declaration: true' in tsconfig.json instructs the compiler to generate .d.ts files " +
      "alongside the .js files. 'declarationDir' controls the output folder. " +
      "'emitDeclarationOnly' generates ONLY .d.ts (no JavaScript).",
    elaboratedFeedback: {
      whyCorrect: "declaration: true → tsc generates .d.ts for each .ts file. The .d.ts contains only type information (function signatures, interfaces), no implementation.",
      commonMistake: "Some confuse 'declaration' with 'declarationMap'. declaration generates .d.ts files, declarationMap generates .d.ts.map files (source maps for type files — useful for IDE navigation)."
    }
  },

  {
    question: "What is DefinitelyTyped?",
    options: [
      "A TypeScript compiler plugin",
      "TypeScript's official testing environment",
      "A community repository with .d.ts files for thousands of JavaScript packages (@types/*)",
      "A linting tool for TypeScript declarations",
    ],
    correct: 2,
    explanation:
      "DefinitelyTyped is a GitHub repository with over 8,000 type definitions. " +
      "When you run 'npm install @types/express', you are installing types from " +
      "this repository.",
    elaboratedFeedback: {
      whyCorrect: "DefinitelyTyped enabled TypeScript's adoption: existing JavaScript libraries did not need to be rewritten. The community wrote the types — separate from the code.",
      commonMistake: "Some think @types packages are maintained by the library authors. Usually not — they are community contributions. That is why @types packages can be outdated or incomplete."
    }
  },

  // --- correct: 3 ---
  {
    question: "Why does Interface Merging only work with 'interface' and not 'type'?",
    options: [
      "type is faster than interface — merging would worsen compiler performance",
      "type was introduced before interface and has older rules that do not allow merging",
      "The TypeScript compiler does not support type merging yet, it is a known feature request",
      "interface is 'open' (extensible), type is 'closed' (single assignment)",
    ],
    correct: 3,
    explanation:
      "'interface' was intentionally designed as an open declaration — extensible across " +
      "file boundaries. 'type' is an assignment (like const) — once defined, done. " +
      "This makes type more predictable, but interface more flexible.",
    elaboratedFeedback: {
      whyCorrect: "interface User {} can be declared multiple times → Merging. type User = {} can only be declared once → Duplicate Error. This design decision makes interface ideal for extensible APIs.",
      commonMistake: "Some conclude: 'interface is always better than type because of merging.' No — merging is a niche feature. For most cases, type and interface are interchangeable. Merging is only relevant for library extensions."
    }
  },

  {
    question: "Which syntax declares a global variable in 'declare global'?",
    options: [
      "let DEBUG: boolean",
      "const DEBUG: boolean",
      "export var DEBUG: boolean",
      "var DEBUG: boolean",
    ],
    correct: 3,
    explanation:
      "Global variables must be declared with 'var'. 'let' and 'const' are " +
      "block-scoped and are NOT added to the global object (window/globalThis). " +
      "'var' in global scope becomes window.DEBUG.",
    elaboratedFeedback: {
      whyCorrect: "'var' in global scope → property on globalThis/window. 'let'/'const' in global scope → block-scoped, NOT on globalThis. In 'declare global' you describe what exists on the global object → var is correct.",
      commonMistake: "Many instinctively use 'const' or 'let' because 'var' is considered outdated. In 'declare global', 'var' is the only correct syntax — here it is a type declaration, not an actual var statement."
    }
  },

  {
    question: "Which Namespace Merging pattern allows a function that simultaneously has properties?",
    options: [
      "interface + class Merging combines the features of both declarations",
      "type + declare Merging creates new types with property access",
      "Generic Function with properties that can be automatically extended",
      "function + namespace Merging (like jQuery)",
    ],
    correct: 3,
    explanation:
      "function jQuery() {} + namespace jQuery { export const version = '3.7' } " +
      "→ jQuery is both: a callable function AND an object with properties. " +
      "This is exactly how real jQuery works.",
    elaboratedFeedback: {
      whyCorrect: "JavaScript allows functions with properties (typeof jQuery === 'function' && typeof jQuery.ajax === 'function'). TypeScript models this with function + namespace merging. Without this feature, jQuery-like APIs would not be typeable.",
      commonMistake: "Some think namespaces are outdated. For module organization, that is true. But Namespace Merging with functions/classes is still THE way to type JavaScript patterns like jQuery or Mocha."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which keyword do you use to extend a third-party npm package?",
    expectedAnswer: "declare module",
    acceptableAnswers: ["declare module", "declare module \"...\"", "declare module '...'"],
    explanation:
      "'declare module \"packagename\" { ... }' opens the module for extensions. " +
      "Interface Merging within declare module adds new properties.",
  },

  {
    type: "short-answer",
    question: "How do you make a .d.ts file a module (minimal syntax)?",
    expectedAnswer: "export {}",
    acceptableAnswers: ["export {}", "export{}", "export {};"],
    explanation:
      "'export {}' is the minimal way to make a file a module. " +
      "Without import/export, TypeScript treats the file as a Script (global).",
  },

  {
    type: "short-answer",
    question: "What is the name of the community repository for @types/* packages?",
    expectedAnswer: "DefinitelyTyped",
    acceptableAnswers: ["DefinitelyTyped", "definitelytyped", "Definitely Typed"],
    explanation:
      "DefinitelyTyped on GitHub is the largest collection of TypeScript type definitions. " +
      "Over 8,000 packages, maintained by the community.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "How many properties does the type 'Config' have after this code?",
    code:
      "interface Config { host: string; }\n" +
      "interface Config { port: number; }\n" +
      "interface Config { ssl: boolean; }",
    expectedAnswer: "3",
    acceptableAnswers: ["3", "three", "Three"],
    explanation:
      "All three interface declarations are merged: host (string) + port (number) + " +
      "ssl (boolean) = 3 properties. Interface Merging combines all declarations.",
  },

  {
    type: "predict-output",
    question: "Does this code compile? Answer with 'Yes' or 'No'.",
    code:
      "interface Settings { port: number; }\n" +
      "interface Settings { port: string; }",
    expectedAnswer: "No",
    acceptableAnswers: ["No", "no", "Compile-Error", "Error"],
    explanation:
      "Compile-Error: 'Subsequent property declarations must have the same type.' " +
      "port is declared as number — the second declaration tries string. " +
      "Same properties must have the SAME type.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 question)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why did TypeScript introduce Declaration Merging as a feature? " +
      "What would not be possible without Declaration Merging?",
    modelAnswer:
      "Declaration Merging was introduced because JavaScript libraries use patterns " +
      "that cannot be expressed in a single type declaration: functions with properties " +
      "(jQuery), objects that are extended at runtime (Express middleware), global " +
      "variables added by different scripts. Without Declaration Merging, " +
      "one would have to fall back on 'as any' or unsafe casts to type these patterns.",
    keyPoints: [
      "JavaScript patterns like jQuery (function + object) require merging",
      "Plugin systems (Express middleware) extend objects at runtime",
      "Third-party types must be extensible without forking",
      "Without merging: 'as any' — type safety is lost",
    ],
  },
];