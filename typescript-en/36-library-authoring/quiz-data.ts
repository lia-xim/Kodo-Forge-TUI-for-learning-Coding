// quiz-data.ts — L36: Library Authoring
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 questions
// MC correct-index distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "36";
export const lessonTitle = "Library Authoring";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 questions, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 1: exports field — correct: 0 ---
  {
    question: "Why must 'types' in the exports field come BEFORE 'import' and 'require'?",
    options: [
      "TypeScript reads the exports object from top to bottom — the first matching condition wins",
      "Node.js sorts the fields alphabetically and ignores the order in the JSON object",
      "'types' overrides the other fields — it takes precedence over all other conditions",
      "It's a convention, but technically irrelevant — the order has no effect on behavior",
    ],
    correct: 0,
    explanation:
      "The exports field is evaluated from top to bottom. If 'import' comes before 'types', " +
      "TypeScript finds no type information because it stops at 'import'. 'types' must " +
      "be the first condition.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript and Node.js use a 'first match wins' algorithm. 'types' is a TypeScript-specific condition — Node.js ignores it. If 'types' doesn't come first, TypeScript only sees the .js path.",
      commonMistake: "Some think the order doesn't matter, like with JSON objects. With 'exports', the order of conditions is crucial — it's an ordered matching."
    }
  },

  // --- Question 2: declaration — correct: 0 ---
  {
    question: "What does 'declaration: true' in the tsconfig generate?",
    options: [
      ".d.ts files that describe the public API as type declarations",
      "Automatic JSDoc comments in the JavaScript output — the compiler generates them from the type annotations",
      "A package.json with the correct types field — the configuration is automatically adjusted",
      "Type-safe test files for the library — so consumers can validate the API",
    ],
    correct: 0,
    explanation:
      "declaration: true generates .d.ts files alongside the .js files. These contain " +
      "only type information (interfaces, function signatures) — no executable code.",
    elaboratedFeedback: {
      whyCorrect: ".d.ts files are like header files in C/C++: They describe the interface, not the implementation. Consumers need them for autocomplete, type checking, and error detection.",
      commonMistake: ".d.ts files are NOT the complete TypeScript files. They contain no implementations, no private functions, no internal types."
    }
  },

  // --- Question 3: Dual Package Hazard — correct: 0 ---
  {
    question: "What is the 'Dual Package Hazard'?",
    options: [
      "CJS and ESM load different instances of the same module — internal state is not shared",
      "The package is twice as large because it contains two formats and both land in the npm package",
      "TypeScript cannot decide which format to use and randomly picks one",
      "npm installs two copies of the package — once for CJS and once for ESM consumers",
    ],
    correct: 0,
    explanation:
      "When a consumer loads both CJS and ESM of the same package, two separate module " +
      "instances are created. Internal state (caches, singletons) is not shared — " +
      "this leads to subtle bugs.",
    elaboratedFeedback: {
      whyCorrect: "Node.js treats CJS and ESM as different modules. An import and a require of the same package create two independent instances. Stateless libraries (pure functions) are not affected.",
      commonMistake: "Many think Node.js would recognize it's the same package. No — CJS and ESM have separate module registries. They are truly two independent instances."
    }
  },

  // --- Question 4: Breaking Change — correct: 0 ---
  {
    question: "Is removing an optional property from a return type a breaking change?",
    options: [
      "Yes — consumers that access the property get a compile error",
      "No — optional properties can be removed at any time without it being considered a breaking change",
      "Only if the property was required — optional properties are not an API guarantee",
      "Only for libraries with strict: true — without strict mode it's not a breaking change",
    ],
    correct: 0,
    explanation:
      "Even optional properties can be used by consumers. If they are removed, " +
      "any code that accesses the property breaks (user.email? → Property does not exist). " +
      "This requires a major version.",
    elaboratedFeedback: {
      whyCorrect: "Optional properties are part of the API: if (result.email) { send(result.email); }. If email is removed, this code breaks — even if email was optional.",
      commonMistake: "Many think 'optional' means 'unimportant'. No — optional just means it MAY be absent. It can still be heavily used."
    }
  },

  // --- Question 5: declarationMap — correct: 1 ---
  {
    question: "What does 'declarationMap: true' enable for consumers of your library?",
    options: [
      "Faster compile times for consumers because fewer file operations are performed",
      "'Go to Definition' jumps to the TypeScript source code instead of the .d.ts file",
      "Automatic refactoring across package boundaries — VS Code can refactor the library",
      "Type checking of library internals by consumers — they see the complete source code",
    ],
    correct: 1,
    explanation:
      "Declaration Maps (.d.ts.map) link .d.ts files with the .ts source files. " +
      "When a consumer presses 'Go to Definition', the IDE jumps to the source code " +
      "instead of the generated .d.ts — much more helpful.",
    elaboratedFeedback: {
      whyCorrect: "Without Declaration Map: 'Go to Definition' on createUser() → dist/index.d.ts → 'export declare function createUser(...)'. With Declaration Map: → src/index.ts → full source code with comments.",
      commonMistake: "Declaration Maps require that the source code is included (files: ['src']). Without source code the map is useless — it points to nothing."
    }
  },

  // --- Question 6: emitDeclarationOnly — correct: 1 ---
  {
    question: "When do you use 'emitDeclarationOnly: true'?",
    options: [
      "When you don't need .d.ts files — they are only relevant for library authors",
      "When a bundler (tsup, esbuild) generates the JavaScript output and tsc is only responsible for .d.ts",
      "When you want to deliver only JavaScript without TypeScript types — the .d.ts files are optional",
      "When the project doesn't use generics — then you don't need type declarations",
    ],
    correct: 1,
    explanation:
      "When tsup/esbuild generates the .js output (faster than tsc), you only need tsc " +
      "for .d.ts generation. emitDeclarationOnly tells tsc: 'Generate ONLY .d.ts, no .js.'",
    elaboratedFeedback: {
      whyCorrect: "The typical library build workflow: 1) tsup/esbuild generates .js (fast). 2) tsc --emitDeclarationOnly generates .d.ts (correct). Best of both worlds.",
      commonMistake: "emitDeclarationOnly alone generates no JavaScript output. Without a separate bundler you only have .d.ts files — nobody can execute those."
    }
  },

  // --- Question 7: Overloads — correct: 1 ---
  {
    question: "Why can't the consumer see the implementation signature of an overloaded function?",
    options: [
      "The implementation is automatically removed — the compiler filters it out from the .d.ts files",
      "The implementation is too broad — only the precise overload signatures are useful for consumers",
      "TypeScript prohibits access to implementations — they are marked as internal",
      "Overloads replace the implementation at compile time — the compiler removes it automatically",
    ],
    correct: 1,
    explanation:
      "The implementation signature must cover all overloads and is therefore too broad " +
      "(e.g. string | Config instead of precise). Consumers should only see the precise " +
      "overloads — this gives better autocomplete and clearer error messages.",
    elaboratedFeedback: {
      whyCorrect: "Overloads: createClient(url: string) and createClient(config: Config). Implementation: createClient(input: string | Config). The implementation is a union — less informative than the individual overloads.",
      commonMistake: "Some think overloads are just 'syntactic sugar'. No — they are the only way to define DIFFERENT return types for different parameter combinations."
    }
  },

  // --- Question 8: Version 0.x — correct: 1 ---
  {
    question: "What does version 0.x.y signal for an npm package?",
    options: [
      "The package is deprecated and should no longer be used — 0.x signals outdated code",
      "The package is in the development phase — the API can change at any time",
      "The package has no tests — that's why no stable version is published",
      "The package only supports Node.js (not the browser) — 0.x is a Node.js-specific flag",
    ],
    correct: 1,
    explanation:
      "In Semantic Versioning, 0.x means: 'The public API is not stable.' " +
      "Every 0.x version can contain breaking changes. Not until 1.0.0 do you promise " +
      "API stability.",
    elaboratedFeedback: {
      whyCorrect: "SemVer specification: '0.y.z is for initial development. Anything MAY change at any time. The public API SHOULD NOT be considered stable.' Many successful packages stay on 0.x for months.",
      commonMistake: "0.x doesn't mean 'bad' or 'unfinished'. It means: 'I'm still learning what the best API is.' Zod was on 0.x for months before it became stable."
    }
  },

  // --- Question 9: Conditional Return — correct: 2 ---
  {
    question: "What is the advantage of Conditional Return Types in library APIs?",
    options: [
      "They make the library faster at runtime because conditional types are evaluated at compile time",
      "They reduce the bundle size because unused code paths are automatically removed",
      "The return type automatically adapts to the input — more precise than a fixed type",
      "They completely replace generics — conditional types are the more modern alternative",
    ],
    correct: 2,
    explanation:
      "Conditional Return Types like 'T extends string ? number : boolean' compute the " +
      "most precise return type based on the input. The consumer gets exact types " +
      "without having to annotate manually.",
    elaboratedFeedback: {
      whyCorrect: "parse('42') → number, parse('true') → boolean, parse('hello') → string. Without Conditional Types the return type would be 'string | number | boolean' — much less useful.",
      commonMistake: "Conditional Return Types are NOT needed for every case. Simple generics (Array<T> → T) are often enough. Conditional Types are worthwhile when the output type depends on the input value."
    }
  },

  // --- Question 10: files field — correct: 2 ---
  {
    question: "What does the 'files' field in package.json control?",
    options: [
      "Which files TypeScript compiles — it's the include list for the compiler",
      "Which files are in .gitignore — the files field synchronizes with Git",
      "Which files are included in the npm package (when running npm publish)",
      "Which files contain tests — only test files are marked for package distribution",
    ],
    correct: 2,
    explanation:
      "The files field is a whitelist: Only the listed files/folders end up in the " +
      "npm package. Everything else is not published. Typical: ['dist', 'src'] — " +
      "build output and source code (for Declaration Maps).",
    elaboratedFeedback: {
      whyCorrect: "Without the files field, (almost) everything is published — including tests, configuration, etc. With files: ['dist'] only the build output is published. Add 'src' if you use Declaration Maps.",
      commonMistake: "package.json and README.md are ALWAYS included, even if they're not in 'files'. node_modules is ALWAYS excluded."
    }
  },

  // --- Question 11: peerDependencies — correct: 2 ---
  {
    question: "Why should React and Angular be declared as peerDependencies?",
    options: [
      "Because they are too large to be bundled — that would massively inflate the bundle",
      "Because npm installs them automatically and they're not needed as a dependency",
      "So the consumer's project has only ONE instance of the framework — not two",
      "Because frameworks cannot be normal dependencies — they have special requirements",
    ],
    correct: 2,
    explanation:
      "If React were a normal dependency in the bundle, the consumer would have two React instances " +
      "(theirs and yours). This leads to errors ('Invalid Hook Call'). peerDependencies say: " +
      "'The consumer must have React installed themselves.'",
    elaboratedFeedback: {
      whyCorrect: "React hooks break when two React instances exist. Angular DI breaks when two Angular instances exist. peerDependencies guarantee a single instance throughout the entire project.",
      commonMistake: "Many forget peerDependencies and include React/Angular as a normal dependency. This leads to subtle runtime errors that are hard to debug."
    }
  },

  // --- Question 12: npm pack — correct: 2 ---
  {
    question: "Why should you run 'npm pack' before 'npm publish'?",
    options: [
      "npm pack optimizes the package size — it automatically removes unnecessary files",
      "npm pack is required before npm publish — without a .tgz file it cannot be published",
      "npm pack generates a local .tgz file that EXACTLY matches the npm package — for testing",
      "npm pack installs missing dependencies — it checks the package.json for completeness",
    ],
    correct: 2,
    explanation:
      "npm pack generates a .tgz file that you can install locally in a test project. " +
      "This lets you test the EXACT package structure before publishing — exports, types, " +
      "files are all verified.",
    elaboratedFeedback: {
      whyCorrect: "Local imports from source code do NOT test the package structure. npm pack + local installation tests: Are all files in the package? Do the exports work? Are the types correct?",
      commonMistake: "Many publish directly and then test with 'npm install package@latest'. If something is missing, they have to publish a new version. npm pack prevents that."
    }
  },

  // --- Question 13: Minification — correct: 3 ---
  {
    question: "Why should libraries NOT be published minified?",
    options: [
      "Minified code is slower — readability suffers and execution speed decreases",
      "TypeScript cannot read minified code — type information is lost during minification",
      "npm rejects minified packages — the registry only accepts readable source code",
      "Minification is the job of the consumer's bundler — library code should remain readable and debuggable",
    ],
    correct: 3,
    explanation:
      "The consumer uses a bundler (webpack, Vite, esbuild) that minifies ALL dependencies. " +
      "If the library is already minified: errors in stack traces are unreadable, " +
      "source maps break, and consumers cannot inspect the code.",
    elaboratedFeedback: {
      whyCorrect: "Libraries are consumed by bundlers. The bundler minifies, tree-shakes, and bundles everything together. Pre-minification prevents effective tree-shaking and makes debugging impossible.",
      commonMistake: "Some minify because they think it makes the package smaller. npm packages are NOT loaded in the browser — the package size on npm is secondary. Only the bundle size matters."
    }
  },

  // --- Question 14: SemVer types — correct: 3 ---
  {
    question: "Which change requires a major version for a TypeScript library?",
    options: [
      "Adding a new optional property to the return type",
      "Adding a new export",
      "Changing a JSDoc comment",
      "Raising the minimum TypeScript version from 4.5 to 5.0",
    ],
    correct: 3,
    explanation:
      "Consumers on TypeScript 4.5 can no longer use the library after the update. " +
      "That's a breaking change — regardless of whether the code changes. The TS version " +
      "is part of the compatibility guarantee.",
    elaboratedFeedback: {
      whyCorrect: "New optional properties and new exports are minor changes (nothing breaks). Raising the TS version breaks ALL consumers on the old version — that's definitely a major change.",
      commonMistake: "Many raise the minimum TS version in a minor release. That breaks consumers who can't update immediately — especially in companies with lockdown policies."
    }
  },

  // --- Question 15: type: module — correct: 3 ---
  {
    question: "What does '\"type\": \"module\"' in package.json do?",
    options: [
      "It activates TypeScript types for the package — without this field .d.ts files don't work",
      "It disables CommonJS completely — the package can only be used as an ES Module",
      "It sets strict mode for all files — all .js files get strict type checks",
      ".js files are interpreted as ES Modules instead of CommonJS",
    ],
    correct: 3,
    explanation:
      "Without 'type: module', Node.js interprets .js files as CommonJS. " +
      "With 'type: module' they are interpreted as ES Modules (import/export). " +
      ".cjs files always remain CommonJS, .mjs always remain ESM — regardless of 'type'.",
    elaboratedFeedback: {
      whyCorrect: "The file extension alone is not enough: .js can be CJS or ESM. 'type: module' resolves the ambiguity. .cjs and .mjs are ALWAYS unambiguous — they ignore 'type'.",
      commonMistake: "Many forget 'type: module' and wonder why 'import' doesn't work in .js files. Without 'type: module', Node.js expects require()."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which build tool is recommended for dual-package libraries (CJS + ESM + .d.ts)?",
    expectedAnswer: "tsup",
    acceptableAnswers: ["tsup", "TSUP"],
    explanation:
      "tsup generates CJS (.cjs), ESM (.js), and .d.ts in a single build step. " +
      "It is based on esbuild for fast transpilation and uses tsc for " +
      "declaration generation.",
  },

  {
    type: "short-answer",
    question: "What file extension does a TypeScript declaration file for CommonJS have?",
    expectedAnswer: ".d.cts",
    acceptableAnswers: [".d.cts", "d.cts"],
    explanation:
      ".d.cts is the declaration equivalent of .cjs. TypeScript 4.7+ distinguishes " +
      "between .d.ts (for .js/ESM) and .d.cts (for .cjs/CommonJS) to support different " +
      "export signatures.",
  },

  {
    type: "short-answer",
    question: "Which npm command generates a local .tgz file for testing the package?",
    expectedAnswer: "npm pack",
    acceptableAnswers: ["npm pack", "pack"],
    explanation:
      "npm pack generates a .tgz file that EXACTLY corresponds to what npm publish " +
      "would upload. You can install it in a test project: " +
      "npm install ./package-1.0.0.tgz",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Will this import work when 'exports' defines ONLY '.'? Answer 'Yes' or 'No'.",
    code:
      '// package.json: { "exports": { ".": { "import": "./dist/index.js" } } }\n' +
      '// Consumer code:\n' +
      'import { helper } from "my-lib/utils";',
    expectedAnswer: "No",
    acceptableAnswers: ["No", "no"],
    explanation:
      "The exports field defines EXACTLY what can be imported. Only '.' is defined — " +
      "'./utils' does not exist in exports. The import fails with: " +
      "'Package subpath ./utils is not defined by exports'.",
  },

  {
    type: "predict-output",
    question: "What type does 'result' have in this overload call?",
    code:
      "declare function parse(input: string): string;\n" +
      "declare function parse(input: number): boolean;\n" +
      "const result = parse(42);",
    expectedAnswer: "boolean",
    acceptableAnswers: ["boolean", "Boolean"],
    explanation:
      "TypeScript matches the call parse(42) against the overloads. 42 is number → " +
      "the second signature matches: parse(input: number): boolean. " +
      "result has type boolean.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 question)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is changing a return type from 'User' to 'User | null' a " +
      "breaking change, even though it 'only' adds a possible value?",
    modelAnswer:
      "Consumer code that directly uses the return value (user.name, user.email) " +
      "no longer compiles with strictNullChecks, because null has no properties. " +
      "The consumer must now add a null check — this is a forced code change. " +
      "Adding null to the return type NARROWS the guarantee (before: 'always User', " +
      "now: 'maybe User, maybe null'). " +
      "Less guarantee = breaking change.",
    keyPoints: [
      "user.name → ERROR: 'Object is possibly null'",
      "Consumers must change code (if (user) {...})",
      "Less guarantee in the return type = breaking change",
      "Only applies with strictNullChecks — but most projects use it",
    ],
  },
];