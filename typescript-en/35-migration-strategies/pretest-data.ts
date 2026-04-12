// pretest-data.ts — L35: Migration Strategies
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: Migration Paths Overview ───────────────────────────

  {
    sectionId: 1,
    question: "What is a 'Big Bang' migration?",
    options: [
      "Converting all files from JavaScript to TypeScript at once",
      "Only migrating the most important files",
      "Ignoring TypeScript errors",
      "I don't know",
    ],
    correct: 0,
    explanation: "Big Bang means: convert everything at once — high effort, high risk, but a clean cut.",
  },
  {
    sectionId: 1,
    question: "In what order should you migrate files?",
    options: [
      "Largest files first",
      "Leaves first (files with no dependencies)",
      "Randomly",
      "I don't know",
    ],
    correct: 1,
    explanation: "Leaves first — they have no untyped dependencies and improve types for all their importers.",
  },
  {
    sectionId: 1,
    question: "When does a Big Bang migration make sense?",
    options: [
      "For small projects with fewer than 50 files",
      "For large monorepos with 500+ files",
      "Never — incremental migration is always better",
      "I don't know",
    ],
    correct: 0,
    explanation: "For small projects, Big Bang is feasible — the migration can be done in a single day.",
  },

  // ─── Section 2: allowJs and checkJs ─────────────────────────────────────

  {
    sectionId: 2,
    question: "What does 'allowJs: true' do in the tsconfig?",
    options: [
      "Allows .js and .ts files in the same project",
      "Automatically converts .js files to .ts",
      "Disables TypeScript errors",
      "I don't know",
    ],
    correct: 0,
    explanation: "allowJs enables mixed projects — the foundation for incremental migration.",
  },
  {
    sectionId: 2,
    question: "What does the '@ts-check' comment at the top of a .js file do?",
    options: [
      "Converts the file to TypeScript",
      "Enables type checking for that specific .js file",
      "Disables all warnings",
      "I don't know",
    ],
    correct: 1,
    explanation: "@ts-check enables TypeScript checking for a single .js file — more precise than enabling checkJs globally.",
  },
  {
    sectionId: 2,
    question: "Can you add types to JavaScript files without renaming them?",
    options: [
      "No, that only works in .ts files",
      "Yes, using JSDoc comments (@param, @returns, etc.)",
      "Yes, using special TypeScript comments",
      "I don't know",
    ],
    correct: 1,
    explanation: "JSDoc annotations give JavaScript real types — TypeScript recognizes @param, @returns, @type, and more.",
  },

  // ─── Section 3: Enabling Strict Mode Incrementally ──────────────────────

  {
    sectionId: 3,
    question: "What does 'strict: true' enable in TypeScript?",
    options: [
      "Only strictNullChecks",
      "All strict flags at once (9 of them)",
      "Only noImplicitAny",
      "I don't know",
    ],
    correct: 1,
    explanation: "strict: true bundles 9 individual flags and automatically includes future new strict flags.",
  },
  {
    sectionId: 3,
    question: "What does strictNullChecks change about type handling?",
    options: [
      "null and undefined become their own types instead of being implicitly included in every type",
      "null is forbidden",
      "Variables can no longer be null",
      "I don't know",
    ],
    correct: 0,
    explanation: "Without strictNullChecks, undefined is included in EVERY type. With strictNullChecks, it must be declared explicitly.",
  },
  {
    sectionId: 3,
    question: "Which strict flag typically causes the most errors during migration?",
    options: [
      "alwaysStrict",
      "strictBindCallApply",
      "strictNullChecks",
      "I don't know",
    ],
    correct: 2,
    explanation: "strictNullChecks affects every place where null/undefined is possible — find(), getElementById(), optional properties.",
  },

  // ─── Section 4: Declaration Files for Legacy Code ──────────────────────

  {
    sectionId: 4,
    question: "What is a .d.ts file?",
    options: [
      "A type declaration file that describes types without implementation",
      "A compressed TypeScript file",
      "A debug file for TypeScript",
      "I don't know",
    ],
    correct: 0,
    explanation: ".d.ts files declare types without implementation — like a contract between TypeScript and untyped code.",
  },
  {
    sectionId: 4,
    question: "How do you give an untyped npm package minimal types?",
    options: [
      "Edit the package in node_modules",
      "declare module 'packagename'; in a .d.ts file",
      "Uninstall the package",
      "I don't know",
    ],
    correct: 1,
    explanation: "declare module 'packagename'; makes all imports resolve to 'any' — the minimum for typeless packages.",
  },
  {
    sectionId: 4,
    question: "What is needed at the end of a .d.ts file that uses 'declare global'?",
    options: [
      "Nothing special",
      "export default — for the default export",
      "export {} — to make the file a module",
      "I don't know",
    ],
    correct: 2,
    explanation: "declare global only works in module files. export {} is the shortest way to make a file a module.",
  },

  // ─── Section 5: Common Migration Problems ─────────────────────────────

  {
    sectionId: 5,
    question: "What is the most common problem in JS→TS migrations?",
    options: [
      "Missing npm packages",
      "Files that are too large",
      "Dynamic property access (obj.newProp = value)",
      "I don't know",
    ],
    correct: 2,
    explanation: "JavaScript allows dynamic properties, TypeScript does not. This causes the most errors during migration.",
  },
  {
    sectionId: 5,
    question: "What does 'esModuleInterop: true' fix?",
    options: [
      "Enables tree-shaking",
      "Converts CommonJS to ES Modules",
      "Allows default imports from CommonJS modules",
      "I don't know",
    ],
    correct: 2,
    explanation: "esModuleInterop allows 'import x from \"pkg\"' instead of 'import * as x from \"pkg\"' for CommonJS modules.",
  },
  {
    sectionId: 5,
    question: "Why does Object.keys() return string[] instead of (keyof T)[]?",
    options: [
      "I don't know",
      "Because TypeScript doesn't know about Object.keys",
      "Because it's a bug in TypeScript",
      "Because objects can have additional properties at runtime (structural type system)",
    ],
    correct: 3,
    explanation: "TypeScript's structural type system allows additional properties. string[] is technically correct — conservative but safe.",
  },

  // ─── Section 6: In Practice — Framework Migration ───────────────────────

  {
    sectionId: 6,
    question: "Where is the biggest 'Type-Free Zone' in Angular projects?",
    options: [
      "I don't know",
      "In the services",
      "In the routing files",
      "In the templates — without strictTemplates there is no type checking there",
    ],
    correct: 3,
    explanation: "Without strictTemplates, Angular templates are a type-free zone — property bindings and events are not checked.",
  },
  {
    sectionId: 6,
    question: "What happens with useState(null) in React without an explicit type parameter?",
    options: [
      "I don't know",
      "TypeScript infers any",
      "TypeScript infers unknown",
      "TypeScript infers null instead of User | null",
    ],
    correct: 3,
    explanation: "TypeScript infers the narrowest type: null. You must write useState<User | null>(null).",
  },
  {
    sectionId: 6,
    question: "What is the final goal of a successful migration?",
    options: [
      "I don't know",
      "As many .ts files as possible",
      "No compile errors",
      "strict: true and allowJs: false — full type safety",
    ],
    correct: 3,
    explanation: "strict: true (maximum safety) + allowJs: false (no more .js files) = migration complete.",
  },
];