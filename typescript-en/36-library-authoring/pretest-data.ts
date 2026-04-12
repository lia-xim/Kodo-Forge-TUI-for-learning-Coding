// pretest-data.ts — L36: Library Authoring
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Package.json exports und types ──────────────────────────

  {
    sectionId: 1,
    question: "What does the 'exports' field in package.json define?",
    options: [
      "Which paths can be imported by consumers",
      "Which files TypeScript compiles",
      "Which dependencies are installed",
      "I don't know",
    ],
    correct: 0,
    explanation: "The exports field precisely defines which entry points are importable — everything else is private.",
  },
  {
    sectionId: 1,
    question: "Where does TypeScript look for type information for an imported library?",
    options: [
      "In the 'types' condition of the exports field or in the top-level 'types' field",
      "Always in node_modules/@types",
      "In the consumer's tsconfig",
      "I don't know",
    ],
    correct: 0,
    explanation: "TypeScript checks exports.'.'.types first, then the top-level types field, then @types.",
  },
  {
    sectionId: 1,
    question: "What does 'type: module' in package.json mean?",
    options: [
      ".js files are interpreted as ES Modules",
      "TypeScript types are enabled",
      "The package is only for Node.js",
      "I don't know",
    ],
    correct: 0,
    explanation: "Without 'type: module', .js files are CommonJS. With 'type: module', they are treated as ES Modules.",
  },

  // ─── Sektion 2: Declaration Files generieren ────────────────────────────

  {
    sectionId: 2,
    question: "What does 'declaration: true' in tsconfig generate?",
    options: [
      ".d.ts files with type declarations",
      "JavaScript files with embedded types",
      "A separate type database",
      "I don't know",
    ],
    correct: 0,
    explanation: "declaration: true generates .d.ts files — type declarations without implementation.",
  },
  {
    sectionId: 2,
    question: "What does 'declarationMap: true' enable?",
    options: [
      "'Go to Definition' jumps to the source code instead of the .d.ts",
      "Faster compilation",
      "Automatic refactoring",
      "I don't know",
    ],
    correct: 0,
    explanation: "Declaration Maps link .d.ts with .ts — 'Go to Definition' shows the source code instead of the declaration.",
  },
  {
    sectionId: 2,
    question: "When do you use 'emitDeclarationOnly: true'?",
    options: [
      "When you don't need any JavaScript files",
      "When a bundler generates the JavaScript output and tsc is only responsible for .d.ts",
      "When you only want to run tests",
      "I don't know",
    ],
    correct: 1,
    explanation: "emitDeclarationOnly generates only .d.ts — the bundler (tsup, esbuild) generates the JS output faster.",
  },

  // ─── Sektion 3: Dual Package (CJS + ESM) ───────────────────────────────

  {
    sectionId: 3,
    question: "Why do some libraries need to ship both CJS and ESM?",
    options: [
      "Because npm only supports CJS",
      "Because consumers use both formats (older projects CJS, newer ESM)",
      "Because TypeScript only understands ESM",
      "I don't know",
    ],
    correct: 1,
    explanation: "The JS ecosystem is transitioning from CJS to ESM. Dual packages serve both worlds.",
  },
  {
    sectionId: 3,
    question: "What is the Dual Package Hazard?",
    options: [
      "The package is twice as large",
      "CJS and ESM load different module instances — internal state is not shared",
      "Node.js cannot decide which format to load",
      "I don't know",
    ],
    correct: 1,
    explanation: "When both formats are loaded, two independent instances are created — caches and singletons are not shared.",
  },
  {
    sectionId: 3,
    question: "What file extension does a CommonJS JavaScript file have?",
    options: [
      ".common.js",
      ".cjs",
      ".node.js",
      "I don't know",
    ],
    correct: 1,
    explanation: ".cjs is always CommonJS, .mjs is always ES Module — regardless of the 'type' field in package.json.",
  },

  // ─── Sektion 4: Generische Library-Patterns ─────────────────────────────

  {
    sectionId: 4,
    question: "What is the advantage of overloads in library APIs?",
    options: [
      "Faster execution at runtime",
      "Different signatures for different call variants with precise types",
      "Less code in the implementation",
      "I don't know",
    ],
    correct: 1,
    explanation: "Overloads allow different parameter/return type combinations — the IDE shows the matching signature.",
  },
  {
    sectionId: 4,
    question: "What is the 'Schema = Type' pattern (known from Zod)?",
    options: [
      "Types are checked at runtime",
      "JSON schemas replace TypeScript types",
      "TypeScript types are automatically derived from a runtime schema definition",
      "I don't know",
    ],
    correct: 2,
    explanation: "Zod's pattern: The schema defines both the runtime validation and the TypeScript type — a single source of truth.",
  },
  {
    sectionId: 4,
    question: "Is 'as any' acceptable in the implementation of a library function?",
    options: [
      "Only in test files",
      "No, 'as any' is always wrong",
      "Yes, as long as the public types (overloads, generics) are correct",
      "I don't know",
    ],
    correct: 2,
    explanation: "The implementation is an implementation detail — the consumer doesn't see it. 'as any' internally is OK when the API types are correct.",
  },

  // ─── Sektion 5: Versionierung und Breaking Changes ─────────────────────

  {
    sectionId: 5,
    question: "Is removing a property from a return type a breaking change?",
    options: [
      "Only for libraries with strict: true",
      "No — types are not part of the API",
      "Yes — consumers accessing the property will get a compile error",
      "I don't know",
    ],
    correct: 2,
    explanation: "Any type change that breaks consumer code is a breaking change — requires a major version.",
  },
  {
    sectionId: 5,
    question: "What is a non-breaking type update?",
    options: [
      "Changing the return type from T to T | null",
      "Removing a required property",
      "Adding a new optional property to the return type",
      "I don't know",
    ],
    correct: 2,
    explanation: "New optional properties break nothing — existing code simply ignores them. This is a minor update.",
  },
  {
    sectionId: 5,
    question: "Is raising the minimum TypeScript version a breaking change?",
    options: [
      "I don't know",
      "No — TypeScript versions are backwards compatible",
      "Only for major TypeScript updates",
      "Yes — consumers on the old TS version can no longer use the library",
    ],
    correct: 3,
    explanation: "Consumers who cannot update will break. Raising the TS version = major version of the library.",
  },

  // ─── Sektion 6: Praxis — Utility-Library ───────────────────────────────

  {
    sectionId: 6,
    question: "What does 'npm pack' do in the context of library development?",
    options: [
      "I don't know",
      "Optimizes the package size",
      "Publishes the package to npm",
      "Generates a .tgz file that matches the npm package — for local testing",
    ],
    correct: 3,
    explanation: "npm pack generates locally exactly what npm publish would upload — ideal for testing before publishing.",
  },
  {
    sectionId: 6,
    question: "Should libraries be published minified?",
    options: [
      "I don't know",
      "Yes — for smaller packages",
      "Only the ESM version",
      "No — minification is the consumer bundler's responsibility",
    ],
    correct: 3,
    explanation: "The consumer's bundler minifies everything together. Pre-minification prevents debugging and tree-shaking.",
  },
  {
    sectionId: 6,
    question: "What does 'prepublishOnly' in the scripts field of package.json do?",
    options: [
      "I don't know",
      "It prevents accidental publishing",
      "It automatically creates a Git tag",
      "It runs automatically before every npm publish — ideal for build + tests",
    ],
    correct: 3,
    explanation: "prepublishOnly is automatically executed before npm publish. Typical: 'npm run build && npm test' — ensures that only tested code is published.",
  },
];