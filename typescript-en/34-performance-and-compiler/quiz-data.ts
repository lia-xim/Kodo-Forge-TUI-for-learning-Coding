// quiz-data.ts — L34: Performance & Compiler
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Questions
// MC correct-Index Distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "34";
export const lessonTitle = "Performance & Compiler";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Questions, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 1: Compiler Phases — correct: 0 ---
  {
    question: "Which phase of the TypeScript compiler typically consumes 60-80% of compile time?",
    options: [
      "The Type Checker",
      "The Parser (AST creation) — reading and structuring source code into a syntax tree",
      "The Emitter (JavaScript generation) — converting the AST into executable JavaScript code",
      "The Scanner (Lexing) — breaking down source text into individual tokens and keywords",
    ],
    correct: 0,
    explanation:
      "The Type Checker (checker.ts, over 50,000 lines) must calculate the type for every expression, " +
      "check assignability, instantiate generics, and resolve overloads. This is by far " +
      "the most expensive phase.",
    elaboratedFeedback: {
      whyCorrect: "Scanner and Parser are essentially linear passes — fast. The Emitter just outputs the AST as text. But the Checker must perform complex type calculations that can grow exponentially.",
      commonMistake: "Many think parsing is expensive (because it 'looks complex'). In practice, parsing is extremely fast — compiler authors have been optimizing parsers for decades."
    }
  },

  // --- Question 2: AST — correct: 0 ---
  {
    question: "What is the Abstract Syntax Tree (AST) in the TypeScript compiler?",
    options: [
      "A tree structure representing the hierarchical structure of source code",
      "A flat list of all types in the program that the compiler uses for assignability checking",
      "The generated JavaScript output in tree form — the compiler creates it as an intermediate step",
      "An optimization format that TypeScript uses internally for caching and speeds up the build",
    ],
    correct: 0,
    explanation:
      "The AST is created by the Parser and represents the hierarchical structure " +
      "of the program. Each node has a 'kind' (e.g. VariableDeclaration), position, " +
      "and children. It is the central data structure for Binder, Checker, and Emitter.",
    elaboratedFeedback: {
      whyCorrect: "The AST transforms linear text into a tree structure. 'const x: number = 42' becomes: VariableStatement → VariableDeclarationList → VariableDeclaration with children Identifier('x'), TypeAnnotation, Initializer.",
      commonMistake: "The AST is NOT the type information — that comes from the Checker. The AST represents the SYNTAX, not the SEMANTICS."
    }
  },

  // --- Question 3: Type Instantiation — correct: 0 ---
  {
    question: "Why can recursive types generate exponentially many type instantiations?",
    options: [
      "Because each recursion level doubles or multiplies the number of instantiations",
      "Because TypeScript cannot cache recursive types and recomputes them on every use",
      "Because the Scanner slows down with recursion and must generate more tokens",
      "Because .d.ts files grow larger with recursion and occupy more memory",
    ],
    correct: 0,
    explanation:
      "A type like Tree<T> with left: Tree<T> and right: Tree<T> doubles the " +
      "instantiations per level: 1, 2, 4, 8, 16... At depth 20, that's over " +
      "a million. This is the reason for the depth limit of 50.",
    elaboratedFeedback: {
      whyCorrect: "Exponential growth arises from branching: each node creates 2+ new instantiations. 2^50 = 1,125,899,906,842,624 — far above the instantiation limit.",
      commonMistake: "Not ALL recursive types are problematic. Linear recursion (e.g. TrimLeft<string>) only grows linearly. Only branching recursion explodes."
    }
  },

  // --- Question 4: skipLibCheck — correct: 0 ---
  {
    question: "What does the tsconfig option 'skipLibCheck: true' do?",
    options: [
      "It skips type-checking of .d.ts files and saves 10-30% of compile time",
      "It skips all type checking and only generates JavaScript without any type checking",
      "It ignores all node_modules when compiling and treats them as external dependencies",
      "It disables checking of library imports and allows implicit any types from libraries",
    ],
    correct: 0,
    explanation:
      "skipLibCheck skips type checking of declaration files (.d.ts). " +
      "Since @types packages and library declarations rarely have errors, this is safe in almost " +
      "all projects and saves significant compile time.",
    elaboratedFeedback: {
      whyCorrect: "The compiler normally checks .d.ts files from node_modules/@types too. skipLibCheck says: 'Trust these files'. This is correct in 99.9% of cases.",
      commonMistake: "skipLibCheck does not skip the checking of YOUR code against the library types. It only skips the internal consistency checking of the library files themselves."
    }
  },

  // --- Question 5: Interface vs Intersection — correct: 1 ---
  {
    question: "Why is 'interface A extends B, C {}' faster than 'type A = B & C'?",
    options: [
      "Intersections produce smaller .d.ts files because they can be serialized more compactly",
      "Interfaces are eagerly evaluated and cached by the compiler; Intersections are lazily recalculated on every use",
      "Interfaces need less memory at runtime because they become simple JavaScript objects",
      "Intersections cannot be used with generics because they don't correctly resolve type parameters",
    ],
    correct: 1,
    explanation:
      "The compiler calculates the property list of an interface once and stores it. " +
      "With Intersection Types, the compiler must re-merge the properties on every assignability check " +
      "— without a cache.",
    elaboratedFeedback: {
      whyCorrect: "Interface properties are stored in a fixed list. With 'type A = B & C & D', the checker must on every use: read B-properties + read C-properties + read D-properties + merge + resolve conflicts. This happens EVERY time.",
      commonMistake: "For small types (2-3 properties) the difference is negligible. The effect only becomes measurable with many properties or frequent use."
    }
  },

  // --- Question 6: generateTrace — correct: 1 ---
  {
    question: "In which format does --generateTrace store the analysis data?",
    options: [
      "In a TypeScript-specific binary format that can only be read with tsc --analyze",
      "In the Chrome Trace Event Format (JSON), readable with chrome://tracing",
      "As an HTML report with charts and interactive visualizations of compiler performance",
      "As a CSV file for Excel analysis that can be automatically evaluated by CI/CD tools",
    ],
    correct: 1,
    explanation:
      "--generateTrace generates trace.json in the Chrome Trace Event Format. You can " +
      "open it in chrome://tracing or Perfetto and see a timeline of all compiler " +
      "operations — per file, per type, per instantiation.",
    elaboratedFeedback: {
      whyCorrect: "The Chrome Trace Format is an industry standard. The TypeScript team didn't need to build their own visualization tool — Chrome DevTools, Perfetto, and other tools can read it directly.",
      commonMistake: "The trace.json can become very large (100MB+). For large projects, Perfetto is better than chrome://tracing because it handles large files more efficiently."
    }
  },

  // --- Question 7: tsBuildInfo — correct: 1 ---
  {
    question: "What two types of hashes does the .tsBuildInfo file store per file?",
    options: [
      "Source code hash and file size hash — together they form a reliable fingerprint",
      "Version hash (file content) and Signature hash (public API)",
      "Import hash and Export hash — the dependencies and exported symbols are hashed separately",
      "TypeScript version hash and Compiler options hash — to make build environments reproducible",
    ],
    correct: 1,
    explanation:
      "The version hash changes with every file modification. The signature hash " +
      "only changes when the public API (.d.ts) changes. Changes in the " +
      "function body change the version but not the signature — dependents do NOT " +
      "need to be recompiled.",
    elaboratedFeedback: {
      whyCorrect: "This separation is the key: if you change the body of a function but the signature stays the same, all importing files do not need to be rechecked. This saves an enormous amount of work.",
      commonMistake: "Many commit .tsbuildinfo to Git. This is wrong — the file is machine-specific and should be in .gitignore. In CI it is cached, not committed."
    }
  },

  // --- Question 8: Depth Limit — correct: 1 ---
  {
    question: "What is the TypeScript error when a recursive type exceeds the depth limit?",
    options: [
      "TS1337: Maximum call stack size exceeded",
      "TS2589: Type instantiation is excessively deep and possibly infinite",
      "TS7023: Type too complex to represent — the compiler can no longer calculate the type",
      "TS2321: Recursive type reference detected — circular dependency between types detected",
    ],
    correct: 1,
    explanation:
      "TS2589 is the standard error for excessively deep type recursion. The depth limit is " +
      "50. The error says: 'This type might be infinite — I stop after 50 levels.'",
    elaboratedFeedback: {
      whyCorrect: "TS2589 is specific to type recursion. The error text 'excessively deep and possibly infinite' is a hint that the compiler is not sure whether the type ever terminates.",
      commonMistake: "TS2589 is not a bug in your code — it is a safety mechanism. Sometimes the type is correct but simply too deep. Solutions: counter-based cutoff or tail recursion."
    }
  },

  // --- Question 9: Union Performance — correct: 2 ---
  {
    question: "Why are large Union Types a performance problem for the Checker?",
    options: [
      "Unions need more memory than interfaces because they keep each member separately in memory",
      "Unions cannot be written in .d.ts files and therefore break declaration generation",
      "Assignability checks for Unions are O(n*m) — every member against every other",
      "The Scanner must parse Unions character by character which slows the Lexing phase and stalls the build",
    ],
    correct: 2,
    explanation:
      "When the Checker tests whether Union A is assignable to Union B, it must check every " +
      "member of A against every member of B. With 100 members: 100 * 100 = " +
      "10,000 comparisons. With Mapped Types it would be a single lookup.",
    elaboratedFeedback: {
      whyCorrect: "O(n*m) means: the runtime grows with the product of both union sizes. 50-member union against 50-member union = 2,500 comparisons. This adds up with frequent use.",
      commonMistake: "Small unions (5-10 members) are no problem. Performance only becomes noticeable at 50+ members. The solution: grouped sub-unions or Mapped Types with lookup."
    }
  },

  // --- Question 10: isolatedModules — correct: 2 ---
  {
    question: "What does the option 'isolatedModules: true' enable?",
    options: [
      "It isolates modules from each other so they cannot access each other and avoids side effects",
      "It generates separate JavaScript bundles per module for optimized code-splitting in the browser",
      "It enforces constraints that fast transpilers like esbuild and swc support",
      "It disables Module Resolution and uses relative paths for all imports instead",
    ],
    correct: 2,
    explanation:
      "isolatedModules enforces that each file can be transpiled independently. " +
      "This is a prerequisite for esbuild, swc, and Babel — these tools transpile " +
      "file by file without cross-file analysis.",
    elaboratedFeedback: {
      whyCorrect: "esbuild and swc are 10-100x faster than tsc because they do no type analysis. But they need the guarantee that each file can stand alone — isolatedModules gives this guarantee.",
      commonMistake: "isolatedModules does not make tsc itself faster. But it enables the workflow: esbuild for fast transpilation + tsc --noEmit for type checking."
    }
  },

  // --- Question 11: Conditional Types — correct: 2 ---
  {
    question: "What is a more performant alternative to nested Conditional Types for property access?",
    options: [
      "Switch statements at the type level — they allow conditional type selection without Conditional Types",
      "Recursive Mapped Types — they iterate over properties and add conditions",
      "Constraints with direct lookup (T extends { id: unknown } → T['id'])",
      "Template Literal Types with Pattern Matching — they decompose types into parts and reassemble them",
    ],
    correct: 2,
    explanation:
      "If you know that T has a specific property, use a Constraint " +
      "(extends) and access it directly (T['id']). This is a lookup instead of a " +
      "Conditional — no branching, no infer resolution.",
    elaboratedFeedback: {
      whyCorrect: "type ExtractId<T extends { id: unknown }> = T['id'] is a direct lookup. type ExtractId<T> = T extends { id: infer Id } ? Id : never needs: Pattern-Match + infer + Conditional-Evaluation. Lookup is always faster.",
      commonMistake: "Conditional Types are not 'bad' — they are necessary for cases where you cannot constrain the type with a Constraint. But when a Constraint is possible, prefer it."
    }
  },

  // --- Question 12: Project References — correct: 2 ---
  {
    question: "What is the prerequisite for a project to be used as a Project Reference?",
    options: [
      "It must have 'incremental: true' in the tsconfig to support incremental builds",
      "It must have a package.json with a 'main' field for module resolution to work",
      "'composite: true' must be set in the tsconfig",
      "It must export at least one .d.ts file so other projects can import the types",
    ],
    correct: 2,
    explanation:
      "composite: true is mandatory for referenced projects. It enforces " +
      "declaration: true and ensures that all files are listed in 'include' " +
      "— the compiler needs these guarantees for incremental builds.",
    elaboratedFeedback: {
      whyCorrect: "composite: true tells the compiler: 'This project is a standalone compilation unit with defined inputs/outputs.' Without it, tsc --build cannot determine whether a rebuild is necessary.",
      commonMistake: "composite: true implies declaration: true — you don't need to set it separately. But you need an 'outDir', otherwise .d.ts files end up alongside the .ts files."
    }
  },

  // --- Question 13: noEmit — correct: 3 ---
  {
    question: "What is the recommended workflow for fast development with TypeScript?",
    options: [
      "tsc --watch for type checking and JavaScript generation simultaneously in a single process",
      "Use only esbuild and skip type checking — the IDE finds most errors",
      "Replace TypeScript with Babel and check types manually — that is the recommended enterprise approach",
      "esbuild/swc for fast transpilation + tsc --noEmit for type checking in the background",
    ],
    correct: 3,
    explanation:
      "Fast transpilers (esbuild, swc) generate JavaScript in milliseconds " +
      "but do not check types. tsc --noEmit checks types without generating JavaScript. " +
      "Together: fast hot reload + safe types.",
    elaboratedFeedback: {
      whyCorrect: "Vite (React), Next.js (SWC), and Angular 17+ (esbuild) all use this approach. Transpilation is 10-100x faster because it does no type analysis. Type checking runs in parallel in the background.",
      commonMistake: "Some skip tsc --noEmit entirely and rely only on the IDE. This is risky — IDE errors are sometimes incomplete. tsc --noEmit in CI is a must."
    }
  },

  // --- Question 14: Compile-Time Share — correct: 3 ---
  {
    question: "If --extendedDiagnostics shows 'Check time: 40s' and 'Total time: 50s', what is the Checker's share?",
    options: [
      "40%",
      "50%",
      "90%",
      "80%",
    ],
    correct: 3,
    explanation:
      "40s out of 50s = 80%. This means: the Checker dominates compile time. " +
      "Optimizations to the Checker (more performant types) have the greatest effect. " +
      "The remaining 20% is distributed across Scanner, Parser, Binder, and Emitter.",
    elaboratedFeedback: {
      whyCorrect: "40/50 = 0.8 = 80%. In typical projects, the Checker's share is between 60% and 80%. If it exceeds 80%, you probably have especially complex types.",
      commonMistake: "Some confuse Check time with Total time. Check time is a PART of Total time — the other phases are added on top."
    }
  },

  // --- Question 15: tsc --build — correct: 3 ---
  {
    question: "What does 'tsc --build' do differently from regular 'tsc'?",
    options: [
      "It compiles only JavaScript without type checking — that is the main purpose of the build command",
      "It generates optimized JavaScript with tree-shaking and removes unused code automatically",
      "It automatically activates the strictest Strict Mode and overrides tsconfig settings",
      "It builds projects in dependency order and skips unchanged ones",
    ],
    correct: 3,
    explanation:
      "tsc --build (or tsc -b) uses Project References to analyze the dependency graph. " +
      "Projects are built in the correct order, and " +
      "unchanged projects are skipped (incrementally).",
    elaboratedFeedback: {
      whyCorrect: "In a monorepo with shared → api → web, tsc --build builds: first shared, then api (because it needs shared), then web. If only web was changed: shared and api are skipped.",
      commonMistake: "tsc --build ONLY works with Project References. Without 'references' and 'composite' in the tsconfigs, it behaves like regular tsc."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "What is the name of the file that TypeScript generates with 'incremental: true' to store build info?",
    expectedAnswer: ".tsbuildinfo",
    acceptableAnswers: [".tsbuildinfo", "tsbuildinfo", "*.tsbuildinfo"],
    explanation:
      "The .tsbuildinfo file stores hashes and diagnostics per file. " +
      "On the next build, the compiler compares the current hashes with the stored ones " +
      "and only recompiles changed files.",
  },

  {
    type: "short-answer",
    question: "What is the TypeScript error number for 'Type instantiation is excessively deep'?",
    expectedAnswer: "TS2589",
    acceptableAnswers: ["TS2589", "2589", "ts2589"],
    explanation:
      "TS2589 is the error that occurs with excessively deep type recursion. " +
      "The depth limit is 50 recursion levels. Tail-recursive types " +
      "can bypass this limit (since TypeScript 4.5).",
  },

  {
    type: "short-answer",
    question: "What value is the depth limit for type recursion in TypeScript set to?",
    expectedAnswer: "50",
    acceptableAnswers: ["50", "fifty"],
    explanation:
      "The depth limit of 50 protects the compiler from infinite recursion. " +
      "In practice, you rarely need more than 5-10 levels. If you approach 50, " +
      "the type is probably too complex.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Does this type compile without errors? Answer with 'Yes' or 'No'.",
    code:
      "type Repeat<S extends string, N extends number, Acc extends string = '', C extends 0[] = []> =\n" +
      "  C['length'] extends N ? Acc : Repeat<S, N, `${Acc}${S}`, [...C, 0]>;\n" +
      "type Result = Repeat<'a', 5>;",
    expectedAnswer: "Yes",
    acceptableAnswers: ["Yes", "yes", "Ja", "ja"],
    explanation:
      "Repeat<'a', 5> generates 'aaaaa'. The recursion depth is 5 — far below the " +
      "limit of 50. The counter C grows from [] to [0,0,0,0,0] and then stops.",
  },

  {
    type: "predict-output",
    question: "What does '--extendedDiagnostics' show as the most expensive element in a typical project?",
    code:
      "// npx tsc --extendedDiagnostics\n" +
      "// Parse time:  0.52s\n" +
      "// Bind time:   0.21s\n" +
      "// Check time:  8.34s\n" +
      "// Emit time:   0.89s\n" +
      "// Total time:  9.96s",
    expectedAnswer: "Check time",
    acceptableAnswers: ["Check time", "check time", "Checker", "checker", "Check", "check"],
    explanation:
      "Check time: 8.34s out of 9.96s total = 83.7%. The Type Checker dominates compile time. " +
      "Optimizations should start here: more performant types, skipLibCheck, Project References.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Question)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is 'interface A extends B, C, D {}' more performant than 'type A = B & C & D', " +
      "even though both produce the same result?",
    modelAnswer:
      "Interface extends is eagerly evaluated by the compiler: the property list is calculated once " +
      "and stored in a cache. On every use of A, the compiler accesses the cache. " +
      "Intersection Types (B & C & D) are lazily evaluated: on every " +
      "assignability check, the compiler must re-merge the properties of B, C, and D. " +
      "In a project with 100 uses of A, this means: 1 calculation vs. 100 merge operations.",
    keyPoints: [
      "Interface: eagerly evaluated, property list cached",
      "Intersection: lazily evaluated, re-merged on every use",
      "The difference becomes measurable with frequent use",
      "In large projects, this can reduce Checker load by 10-20%",
    ],
  },
];