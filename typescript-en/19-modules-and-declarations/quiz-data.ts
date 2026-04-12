/**
 * Lesson 19 — Quiz Data: Modules & Declarations
 */
import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "19";
export const lessonTitle = "Modules & Declarations";

export const questions: QuizQuestion[] = [
  { question: "What is the difference between Named Exports and Default Exports?", options: ["No difference", "Named: fixed name, Default: name can be freely chosen on import", "Default is faster", "Named only works with interfaces"], correct: 1, explanation: "Named Exports have a fixed name. Default Exports can be renamed on import — this can lead to inconsistencies." },
  { question: "What does `import type { User } from './types'` do?", options: ["Imports User as a value", "Imports User ONLY as a type — completely removed during compilation", "Imports User as a class", "Creates a copy of User"], correct: 1, explanation: "Type-Only Imports are removed during compilation and generate no JavaScript code." },
  { question: "What is a Barrel File?", options: ["A compressed file", "An index.ts that re-exports exports from multiple modules", "A configuration file", "A test file"], correct: 1, explanation: "Barrel Files bundle the exports of a directory in an index.ts for easier importing." },
  { question: "What does `esModuleInterop: true` do in tsconfig.json?", options: ["Disables modules", "Enables default imports from CommonJS modules", "Enables ES2020", "Disables type-checking"], correct: 1, explanation: "esModuleInterop adds helper code that treats CJS module.exports as a default export." },
  { question: "What is `moduleResolution: 'bundler'`?", options: ["For browsers", "Modern module resolution that uses package.json 'exports', optimized for bundlers", "Deprecated", "Only for Node.js"], correct: 1, explanation: "bundler is the recommended resolution for projects using Vite, Webpack, etc." },
  { question: "What is a .d.ts file?", options: ["A TypeScript file", "A declaration file — describes types without implementation", "A JavaScript file", "A config file"], correct: 1, explanation: ".d.ts files contain only type definitions, no executable code." },
  { question: "What does `declare const API_URL: string` do?", options: ["Declares a variable", "Tells TypeScript that API_URL exists but is defined elsewhere", "Creates a constant", "Exports API_URL"], correct: 1, explanation: "declare tells TypeScript that a value exists without implementing it. Useful for global variables." },
  { question: "How do you install types for a library without built-in types?", options: ["npm install types", "npm install @types/library-name", "Not possible", "npm install --types library-name"], correct: 1, explanation: "@types/library-name installs community-maintained types from DefinitelyTyped." },
  { question: "What does `declare module 'my-lib' { ... }` do?", options: ["Installs the library", "Creates type definitions for an external module", "Creates a new module", "Removes the library"], correct: 1, explanation: "declare module defines or extends the type signature of an external module." },
  { question: "How do you extend the Express Request object with custom properties?", options: ["Inheritance", "Module Augmentation: declare module 'express' { interface Request { user: ... } }", "Monkey-Patching", "Not possible"], correct: 1, explanation: "Module Augmentation uses Interface Merging to extend existing types with new properties." },
  { question: "Why does an augmentation file need `export {}`?", options: ["Best practice", "So the file is treated as a module — otherwise declare global does not work", "For performance", "For importing"], correct: 1, explanation: "Without import/export, the file is treated as a script. declare global and declare module only work in modules." },
  { question: "What is Interface Merging?", options: ["Merging two interfaces", "TypeScript automatically merges interfaces with the same name — the foundation for augmentation", "A design pattern", "A form of inheritance"], correct: 1, explanation: "Interfaces with the same name are automatically merged. This also works across file boundaries." },
  { question: "What is DefinitelyTyped?", options: ["A TypeScript version", "The largest community repository for type definitions (@types)", "A linter", "A compiler plugin"], correct: 1, explanation: "DefinitelyTyped on GitHub maintains over 10,000 @types packages for untyped libraries." },
  { question: "When should you NOT use Barrel Files?", options: ["Never", "When tree-shaking matters — barrels can import everything even if only parts are needed", "Always", "For small projects"], correct: 1, explanation: "Barrel Files can impair tree-shaking because the bundler must load all exports in order to analyze them." },
  { question: "What is `declare module '*.css' { ... }`?", options: ["Importing CSS", "Wildcard Declaration — defines types for all .css imports", "CSS-in-JS", "Styled Components"], correct: 1, explanation: "Wildcard Declarations (*) define types for all imports matching the pattern." },

  // ─── New Question Formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  {
    type: "short-answer",
    question: "What file extension do TypeScript Declaration Files have?",
    expectedAnswer: ".d.ts",
    acceptableAnswers: [".d.ts", "d.ts", ".d.ts file"],
    explanation: ".d.ts files contain only type definitions without implementation. They are the bridge between JavaScript libraries and TypeScript.",
  },
  {
    type: "short-answer",
    question: "What is the NPM scope under which community types from DefinitelyTyped are published?",
    expectedAnswer: "@types",
    acceptableAnswers: ["@types", "@types/", "types"],
    explanation: "@types is the standard scope for DefinitelyTyped packages. Install with npm install @types/library-name.",
  },
  {
    type: "short-answer",
    question: "Which TypeScript feature allows extending existing interfaces across file boundaries with new properties?",
    expectedAnswer: "Interface Merging",
    acceptableAnswers: ["Interface Merging", "Declaration Merging", "Module Augmentation", "interface merging"],
    explanation: "Interface Merging automatically combines interfaces with the same name. Together with Module Augmentation, it can be used to extend external types.",
  },
  {
    type: "predict-output",
    question: "Will this code compile? If yes, why? If not, why not?",
    code: "// augment.d.ts\ndeclare module 'express' {\n  interface Request {\n    userId: string;\n  }\n}\n// Note: The file has NO export {}",
    expectedAnswer: "No",
    acceptableAnswers: ["No", "no", "Error", "does not work", "No, missing export"],
    explanation: "Without export {} or another import/export, the file is treated as a script. declare module works differently in scripts — it declares an ambient module instead of an augmentation. For Module Augmentation, the file must be a module (add export {}).",
  },
  {
    type: "predict-output",
    question: "What happens when `import type { User } from './types'` is compiled? What appears in the JavaScript output for this line?",
    code: "import type { User } from './types';\n\nconst name: User['name'] = 'Max';",
    expectedAnswer: "Nothing",
    acceptableAnswers: ["Nothing", "nothing", "is removed", "empty line", "no output", "the line disappears"],
    explanation: "Type-Only Imports are completely removed during compilation. No import statement for User appears in the JavaScript output — only const name = 'Max';",
  },
  {
    type: "explain-why",
    question: "Why can Barrel Files (index.ts with re-exports) negatively affect tree-shaking in bundlers?",
    modelAnswer: "When a consumer imports only a single function from a Barrel File, the bundler still has to analyze all re-exports. For modules with side effects (e.g., top-level code), the bundler cannot safely decide what can be removed, potentially leaving unused code in the bundle. Additionally, Barrel Files lead to longer import chains, making static analysis harder for the bundler.",
    keyPoints: ["Bundler must load and analyze all re-exports", "Side effects prevent safe removal", "Longer import chains make static analysis harder", "Direct imports bypass the problem"],
  },
];

export interface ElaboratedFeedback { whyCorrect: string; commonMistake: string; }
export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Named Exports are safer to refactor because the name is fixed.", commonMistake: "Using Default Exports and then using different names on import." },
  1: { whyCorrect: "Type-Only Imports prevent unwanted side effects and reduce bundle size.", commonMistake: "Making all imports regular and relying on the bundler." },
  2: { whyCorrect: "Barrel Files simplify imports: one import instead of many individual ones.", commonMistake: "Using too many Barrel Files that impair tree-shaking." },
  3: { whyCorrect: "esModuleInterop makes CJS modules compatible with ESM default import syntax.", commonMistake: "Forgetting to enable esModuleInterop and using namespace imports (import * as) everywhere." },
  4: { whyCorrect: "bundler is optimized for Vite, Webpack, and similar tools.", commonMistake: "Using node instead of bundler for projects that use a bundler." },
  5: { whyCorrect: ".d.ts files are the bridge between JavaScript libraries and TypeScript.", commonMistake: "Writing implementation code in .d.ts files." },
  6: { whyCorrect: "declare informs TypeScript about values that exist outside of TS.", commonMistake: "Confusing declare with const — declare generates NO code." },
  7: { whyCorrect: "@types/ is the standard package naming scheme for DefinitelyTyped.", commonMistake: "Writing custom types when @types already exists." },
  8: { whyCorrect: "declare module creates or extends types for external modules.", commonMistake: "Not marking the file as a module (forgetting export {})." },
  9: { whyCorrect: "Module Augmentation + Interface Merging = type-safe extension of existing types.", commonMistake: "Using as any casts instead of augmentation." },
  10: { whyCorrect: "Without export/import, the file is a script — declare global does not work.", commonMistake: "Forgetting export {} and wondering why the augmentation does not take effect." },
  11: { whyCorrect: "Interface Merging is automatic and fundamental to the TypeScript type system.", commonMistake: "Thinking that Interface Merging only works with declare module." },
  12: { whyCorrect: "DefinitelyTyped is the largest collection of community-maintained types.", commonMistake: "Not knowing that @types exists and writing everything yourself." },
  13: { whyCorrect: "Barrel Files transitively import everything — this can impair tree-shaking.", commonMistake: "Using Barrel Files everywhere without thinking about bundle size." },
  14: { whyCorrect: "Wildcard Declarations cover all imports matching a pattern.", commonMistake: "Writing a separate declaration for each CSS file." },
};