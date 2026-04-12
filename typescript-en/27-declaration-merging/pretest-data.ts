// pretest-data.ts — L27: Declaration Merging
// 15 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: Interface Merging Basics ─────────────────────────────────

  {
    sectionId: 1,
    question: "What do you think happens when two interfaces have the same name?",
    options: [
      "Compile error due to duplicate declaration",
      "They are automatically merged",
      "The second one overwrites the first",
      "I don't know",
    ],
    correct: 1,
    explanation: "TypeScript automatically merges interfaces with the same name into one.",
  },
  {
    sectionId: 1,
    question: "Can 'type' declarations be merged like interfaces?",
    options: [
      "Yes, all declarations can be merged",
      "No, only 'interface' supports merging — 'type' gives an error on duplicate declaration",
      "Only with special compiler flags",
      "I don't know",
    ],
    correct: 1,
    explanation: "'interface' is open (extensible), 'type' is closed (single assignment).",
  },
  {
    sectionId: 1,
    question: "What happens when the same property has different types during interface merging?",
    options: [
      "TypeScript forms a union of both types",
      "The later type wins",
      "Compile error — properties must have the same type",
      "I don't know",
    ],
    correct: 2,
    explanation: "Identical properties must have the same type. Different types → compile error.",
  },

  // ─── Section 2: Module Augmentation ──────────────────────────────────────

  {
    sectionId: 2,
    question: "How can you extend the types of an npm package in TypeScript?",
    options: [
      "Edit the .d.ts file in node_modules directly",
      "Using 'declare module \"packagename\"' and interface merging",
      "You can't — npm types are immutable",
      "I don't know",
    ],
    correct: 1,
    explanation: "Module augmentation with 'declare module' extends foreign modules without changing their files.",
  },
  {
    sectionId: 2,
    question: "Express has a Request interface. How do you add 'user' to it?",
    options: [
      "interface Request extends Express.Request { user: User }",
      "declare module 'express-serve-static-core' { interface Request { user: User } }",
      "(req as any).user = currentUser",
      "I don't know",
    ],
    correct: 1,
    explanation: "Module augmentation on 'express-serve-static-core' extends the Request interface.",
  },
  {
    sectionId: 2,
    question: "What happens if the module name in 'declare module' is wrong?",
    options: [
      "A new, separate module is created — no merging",
      "Compile error",
      "TypeScript corrects the name automatically",
      "I don't know",
    ],
    correct: 0,
    explanation: "Wrong name: no error, but also no merging. A new module is created instead.",
  },

  // ─── Section 3: Global Augmentation ──────────────────────────────────────

  {
    sectionId: 3,
    question: "How do you extend window with custom properties in TypeScript?",
    options: [
      "declare global { interface Window { myProp: string } }",
      "(window as any).myProp = value",
      "window.myProp is automatically typed",
      "I don't know",
    ],
    correct: 0,
    explanation: "Global augmentation with 'declare global' extends the Window interface in a type-safe way.",
  },
  {
    sectionId: 3,
    question: "Which keyword is required for global variables inside 'declare global'?",
    options: [
      "const",
      "let",
      "var",
      "I don't know",
    ],
    correct: 2,
    explanation: "'var' is the correct syntax for global variables — let/const are block-scoped.",
  },
  {
    sectionId: 3,
    question: "Can you make process.env type-safe in TypeScript?",
    options: [
      "Yes, with global augmentation on NodeJS.ProcessEnv",
      "No, process.env is always Record<string, string | undefined>",
      "Only with a validation library like zod",
      "I don't know",
    ],
    correct: 0,
    explanation: "declare global { namespace NodeJS { interface ProcessEnv { ... } } } makes env type-safe.",
  },

  // ─── Section 4: Declaration Files (.d.ts) ───────────────────────────────

  {
    sectionId: 4,
    question: "What is a .d.ts file?",
    options: [
      "A pure type declaration file with no implementation",
      "A compiled TypeScript file",
      "A debug file for TypeScript",
      "I don't know",
    ],
    correct: 0,
    explanation: ".d.ts files contain only type declarations — no executable code.",
  },
  {
    sectionId: 4,
    question: "What does the 'declare' keyword before a function in a .d.ts file mean?",
    options: [
      "It exports the function",
      "It makes the function abstract",
      "It says: 'This function exists elsewhere — only the type is defined here'",
      "I don't know",
    ],
    correct: 2,
    explanation: "'declare' describes what exists without implementing it.",
  },
  {
    sectionId: 4,
    question: "What is DefinitelyTyped (@types/*)?",
    options: [
      "TypeScript's own compiler",
      "A testing framework",
      "A community collection of .d.ts files for JavaScript libraries",
      "I don't know",
    ],
    correct: 2,
    explanation: "DefinitelyTyped provides @types/* packages — type definitions for thousands of JS libraries.",
  },

  // ─── Section 5: Practice (extending Express/React) ────────────────────────

  {
    sectionId: 5,
    question: "Why is '(req as any).user' bad practice?",
    options: [
      "It is slower than typed access",
      "I don't know",
      "Express forbids casts on Request",
      "'as any' disables type safety — typos are not caught",
    ],
    correct: 3,
    explanation: "'as any' disables all type checking. req.usr (typo) → no error.",
  },
  {
    sectionId: 5,
    question: "What is the first debugging step when an augmentation is not working?",
    options: [
      "Reinstall TypeScript",
      "I don't know",
      "Capitalize the module name",
      "Check whether the .d.ts file is included in tsconfig.json",
    ],
    correct: 3,
    explanation: "The most common cause: the .d.ts file is not in the 'include' path of tsconfig.json.",
  },
  {
    sectionId: 5,
    question: "How do you type custom web components in React/JSX?",
    options: [
      "With a special JSX compiler option",
      "I don't know",
      "Custom elements don't need typing",
      "declare module 'react' { namespace JSX { interface IntrinsicElements { ... } } }",
    ],
    correct: 3,
    explanation: "Extend JSX.IntrinsicElements via module augmentation on 'react'.",
  },
];