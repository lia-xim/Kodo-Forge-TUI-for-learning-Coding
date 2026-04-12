// quiz-data.ts — L38: Compiler API
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "38";
export const lessonTitle = "Compiler API";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: AST — correct: 0 ---
  {
    question: "What is the Abstract Syntax Tree (AST)?",
    options: [
      "A tree structure that represents the syntax of source code — the common language of all tools",
      "A debugging tool for the TypeScript compiler that analyzes code at runtime",
      "A database that stores type information and is updated with every build",
      "A build artifact that is created during compilation and stored on disk",
    ],
    correct: 0,
    explanation:
      "The AST represents code as a tree. Every node has a type " +
      "(SyntaxKind), position, and children. All tools — Type Checker, Emitter, ESLint, " +
      "VS Code — work on this tree.",
    elaboratedFeedback: {
      whyCorrect: "Source code is a string — unstructured. The AST makes structure explicit: which function contains which statements, which expressions have which operands. This is the foundation of all code analysis.",
      commonMistake: "The AST is not a build artifact — it only exists in memory during compilation. It is not written to disk (unlike .js or .d.ts files)."
    }
  },

  // --- Frage 2: createProgram — correct: 0 ---
  {
    question: "What does ts.createProgram return?",
    options: [
      "A Program object with access to SourceFiles, TypeChecker, and Diagnostics",
      "The compiled JavaScript code as a string — the output of the compiler",
      "A list of all files in the project sorted by dependencies",
      "A Promise that waits for compilation and then delivers the result",
    ],
    correct: 0,
    explanation:
      "createProgram creates a Program object. From it you get SourceFiles (ASTs), " +
      "the TypeChecker (type information), and Diagnostics (errors/warnings).",
    elaboratedFeedback: {
      whyCorrect: "The Program is the central entry point: program.getSourceFile() for ASTs, program.getTypeChecker() for types, ts.getPreEmitDiagnostics(program) for errors.",
      commonMistake: "createProgram is synchronous — no Promise. It reads all files and builds the AST immediately. For large projects this can take seconds."
    }
  },

  // --- Frage 3: Node vs Symbol vs Type — correct: 0 ---
  {
    question: "What is the difference between Node, Symbol, and Type in the Compiler API?",
    options: [
      "Node = Syntax (where in code), Symbol = Semantics (what the name means), Type = type information",
      "Node = file, Symbol = function, Type = variable — the three main elements of a program",
      "Node = expression, Symbol = statement, Type = declaration — the hierarchy of AST elements",
      "All three are synonyms for AST nodes — they describe the same concept from different perspectives",
    ],
    correct: 0,
    explanation:
      "Node is a syntax node (position in the AST). Symbol is a named entity " +
      "(variable, function — resolves imports). Type is the resolved type.",
    elaboratedFeedback: {
      whyCorrect: "An Identifier node 'x' points to a Symbol. The Symbol has a declaration and a Type. Three levels: Syntax → Semantics → Type. VS Code's 'Go to Definition' uses all three.",
      commonMistake: "Not every Node has a Symbol — only identifiers and declarations. And not every Symbol has a meaningful Type (e.g. namespaces)."
    }
  },

  // --- Frage 4: forEachChild — correct: 0 ---
  {
    question: "What is the limitation of ts.forEachChild?",
    options: [
      "It only visits direct children — for deeper nodes you need your own recursion",
      "It can only visit SourceFile nodes — other node types are ignored",
      "It is slower than manual iteration because it calls a callback for every node",
      "It does not work with ClassDeclaration nodes — they have a special structure",
    ],
    correct: 0,
    explanation:
      "forEachChild only visits immediate children. For a complete traversal " +
      "of the tree you need recursive calls to forEachChild inside the callback function.",
    elaboratedFeedback: {
      whyCorrect: "SourceFile has top-level statements as children. A FunctionDeclaration has name, parameters, body as children. But statements INSIDE the body are grandchildren — you need recursion for those.",
      commonMistake: "Many expect a children array like in other AST libraries (Babel). TypeScript's AST has specific properties per node type. forEachChild knows the structure."
    }
  },

  // --- Frage 5: visitEachChild — correct: 1 ---
  {
    question: "What is ts.visitEachChild designed for?",
    options: [
      "For reading AST nodes in the correct order — from root to leaves",
      "For AST transformations — it returns new nodes instead of modifying existing ones",
      "For counting nodes in the AST — it iterates over the entire tree and sums them up",
      "For searching for specific node types — you can filter by SyntaxKind",
    ],
    correct: 1,
    explanation:
      "visitEachChild visits children and returns a NEW node with the " +
      "transformed children. The AST is immutable — changes create new trees.",
    elaboratedFeedback: {
      whyCorrect: "Immutability is central: Multiple transformers can run in sequence without interfering. Each transformer receives the AST from the previous one and returns a new one.",
      commonMistake: "visitEachChild is NOT for analysis — forEachChild is better for that (no new tree needed). visitEachChild is for custom transformers that modify the AST."
    }
  },

  // --- Frage 6: Type Checker — correct: 1 ---
  {
    question: "What does checker.getTypeAtLocation(node) return?",
    options: [
      "The annotated type as written in source code — what the developer wrote",
      "The resolved type after inference, narrowing, and generics resolution",
      "A string with the type name — e.g. 'string[]' instead of the internal Type object",
      "A boolean whether the node has a type — true for declared types, false for implicit ones",
    ],
    correct: 1,
    explanation:
      "getTypeAtLocation returns the RESOLVED type. For `const x = [1, 2]` " +
      "that is `number[]`, not the literal `[1, 2]`. It also accounts for narrowing.",
    elaboratedFeedback: {
      whyCorrect: "The resolved type contains all compiler calculations: inference (no type annotated → inferred), narrowing (restricted in if-block), generics (T becomes concrete type).",
      commonMistake: "It does not return a string — but a Type object. For a string: checker.typeToString(type). The Type object has methods like isUnion(), getProperties() etc."
    }
  },

  // --- Frage 7: Custom Transformer — correct: 1 ---
  {
    question: "What is a Before transformer?",
    options: [
      "A transformer that runs before parsing and modifies raw source code before the AST is created",
      "A transformer that runs BEFORE type erasure and has access to TypeScript syntax",
      "A transformer that modifies source code before the compiler — like a preprocessor",
      "A transformer that only modifies .d.ts files and ignores JavaScript output",
    ],
    correct: 1,
    explanation:
      "Before transformers run before type erasure. They see the full " +
      "TypeScript AST including type annotations and interfaces. After transformers " +
      "only see the JavaScript AST.",
    elaboratedFeedback: {
      whyCorrect: "Before = TypeScript AST (with types), After = JavaScript AST (without types). If your transformer needs type information (e.g. 'Is X an Observable?'), it must be a Before transformer.",
      commonMistake: "Before transformers do NOT run before parsing. The AST must already exist. They run after parsing, before JavaScript generation."
    }
  },

  // --- Frage 8: Diagnostics — correct: 1 ---
  {
    question: "What information does a Diagnostic object contain?",
    options: [
      "Only the error message as a string — a Diagnostic provides no further information",
      "File, position, length, category (Error/Warning), code, and message",
      "The entire AST of the erroneous file — allowing you to precisely locate the position in code",
      "Only the error code and line number — the column is not stored",
    ],
    correct: 1,
    explanation:
      "Diagnostics are structured: file (SourceFile), start (offset), length, " +
      "category (Error/Warning/Message/Suggestion), code (e.g. 2322), and messageText.",
    elaboratedFeedback: {
      whyCorrect: "The structured form enables precise error display: underline in the editor (start + length), filtering by severity (category), searching for specific errors (code).",
      commonMistake: "Diagnostics are not only errors — they can also be warnings (Warning), messages (Message), or suggestions (Suggestion)."
    }
  },

  // --- Frage 9: Language Service — correct: 2 ---
  {
    question: "What distinguishes the Language Service from ts.createProgram?",
    options: [
      "The Language Service is faster because it checks less and only finds obvious errors",
      "The Language Service has no access to the Type Checker — it only works at the AST level",
      "The Language Service works incrementally — it only updates changed files",
      "The Language Service can only read .d.ts files — it is limited to library types",
    ],
    correct: 2,
    explanation:
      "The Language Service is for interactive use (IDE). It caches results " +
      "and only updates what has changed. createProgram recalculates everything.",
    elaboratedFeedback: {
      whyCorrect: "VS Code sends requests to the Language Service on every keystroke. Through incremental parsing and caching it responds in under 100ms — even for large projects.",
      commonMistake: "The Language Service DOES have access to the Type Checker — it uses it for hover tooltips, autocomplete, and refactoring. It is not 'less' than createProgram, but 'smarter'."
    }
  },

  // --- Frage 10: SyntaxKind — correct: 2 ---
  {
    question: "What is ts.SyntaxKind?",
    options: [
      "An interface for user-defined node types — you can define your own SyntaxKind values",
      "A string that contains the file name and is used for error output",
      "An enum with over 300 entries — one for every possible AST node type",
      "A configuration option for the parser that determines how strictly syntax is checked",
    ],
    correct: 2,
    explanation:
      "SyntaxKind is a large enum: FunctionDeclaration, ClassDeclaration, " +
      "Identifier, StringLiteral, CallExpression, etc. Every node has a `.kind`.",
    elaboratedFeedback: {
      whyCorrect: "node.kind === ts.SyntaxKind.FunctionDeclaration checks the node type. Type guards like ts.isFunctionDeclaration(node) do the same but are type-safe.",
      commonMistake: "You don't need to know all 300+ kinds. The most common 20-30 are sufficient for 95% of use cases. Type guards are more convenient than .kind comparisons."
    }
  },

  // --- Frage 11: checker.ts — correct: 2 ---
  {
    question: "Why is checker.ts (~50,000 lines) the largest file in the TypeScript compiler?",
    options: [
      "Because it is poorly refactored — the code comes from different eras of TypeScript development",
      "Because it also contains the parser — both are combined in one file",
      "Because the Type Checker is the most complex component — it resolves generics, narrowing, assignment compatibility, and more",
      "Because it contains code for all target platforms — ES5, ES6, ESNext, and more",
    ],
    correct: 2,
    explanation:
      "The Type Checker calculates types for every expression, resolves generics, " +
      "performs narrowing, checks assignment compatibility and overload resolution. " +
      "This is the most complex task of the compiler.",
    elaboratedFeedback: {
      whyCorrect: "Type inference, conditional types, template literal types, variance checking, mapped types — all of this is calculated in checker.ts. It is the intelligence of the compiler.",
      commonMistake: "The size is not bad design — it is the complexity of the type system. Every new feature (Conditional Types, infer, Template Literals) adds thousands of lines."
    }
  },

  // --- Frage 12: ts.factory — correct: 2 ---
  {
    question: "What is ts.factory?",
    options: [
      "A build tool configuration that sets TypeScript compiler options for different environments",
      "A module for file operations — it provides functions for reading and writing files",
      "An API for creating new immutable AST nodes for custom transformers",
      "A pattern for dependency injection in the compiler — it manages dependencies between modules",
    ],
    correct: 2,
    explanation:
      "ts.factory provides methods like createStringLiteral(), createCallExpression(), " +
      "createFunctionDeclaration() — everything you need to create new AST nodes.",
    elaboratedFeedback: {
      whyCorrect: "factory.createCallExpression(expr, typeArgs, args) creates a new CallExpression node. Since AST nodes are immutable, you MUST use factory instead of modifying existing nodes.",
      commonMistake: "Before TS 4.0 you used ts.createXxx() directly. Since TS 4.0 everything is bundled under ts.factory. Old tutorials still use the old API."
    }
  },

  // --- Frage 13: Trivia — correct: 3 ---
  {
    question: "Where are comments in the TypeScript AST?",
    options: [
      "As their own nodes in the AST — comments have their own SyntaxKind like all other code elements",
      "In the Symbol of every declaration — they are attached to the named entity as metadata",
      "In the Type Checker as metadata — they are relevant for type inference",
      "Attached to nodes as 'trivia' — accessible via getLeadingCommentRanges",
    ],
    correct: 3,
    explanation:
      "Comments are not their own nodes. They are 'trivia' and attached to " +
      "the next relevant node. Accessed via getLeadingCommentRanges().",
    elaboratedFeedback: {
      whyCorrect: "TypeScript's AST distinguishes between 'significant' nodes (code) and 'trivia' (whitespace, comments). Trivia is semantically irrelevant but important for tools (docs, linter).",
      commonMistake: "In some AST formats (e.g. Babel) comments are standalone nodes. In TypeScript they are not — you must explicitly call getLeadingCommentRanges()."
    }
  },

  // --- Frage 14: Praxis — correct: 3 ---
  {
    question: "Which tool does NOT use the TypeScript Compiler API?",
    options: [
      "VS Code (Language Service for autocomplete)",
      "ESLint with @typescript-eslint (Type Checker for rules)",
      "Angular CLI (custom transformers for templates)",
      "Prettier (formatting only — needs no Type Checker)",
    ],
    correct: 3,
    explanation:
      "Prettier formats code based on syntax alone — it uses its own " +
      "parser and needs no type information. VS Code, ESLint, and Angular use " +
      "the Compiler API.",
    elaboratedFeedback: {
      whyCorrect: "Prettier's philosophy: 'opinionated formatter' — it makes formatting decisions based on AST structure alone, never on types. That's why it's so fast.",
      commonMistake: "Prettier does parse TypeScript — but with its own parser, not ts.createProgram. It does not use the TypeScript Compiler API."
    }
  },

  // --- Frage 15: Architektur — correct: 3 ---
  {
    question: "What is the best use case for directly using the Compiler API?",
    options: [
      "Simple syntax linting rules (e.g. naming conventions) — the Compiler API is optimized for this",
      "Formatting TypeScript code — the Compiler API provides AST-based formatting functions",
      "Unit tests for TypeScript functions — the API can automatically generate test cases",
      "Type-based code analysis and code generation that ESLint rules don't cover",
    ],
    correct: 3,
    explanation:
      "The Compiler API is worthwhile for type-based analysis (e.g. finding all places " +
      "where a Promise is not awaited) and code generation from types. For simple " +
      "linting ESLint suffices, for formatting Prettier.",
    elaboratedFeedback: {
      whyCorrect: "The Compiler API gives access to the Type Checker — the only tool that knows the full type of every expression. For everything that requires type knowledge, the API is indispensable.",
      commonMistake: "Using the API directly for things already covered by ESLint rules is over-engineering. @typescript-eslint has 100+ rules — check first whether one exists."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which method creates a Program object from TypeScript files?",
    expectedAnswer: "ts.createProgram",
    acceptableAnswers: ["ts.createProgram", "createProgram"],
    explanation:
      "ts.createProgram(fileNames, compilerOptions) reads the files, builds the AST, " +
      "and provides Type Checker and Diagnostics.",
  },

  {
    type: "short-answer",
    question: "What is the method called that returns the resolved type of an AST node?",
    expectedAnswer: "getTypeAtLocation",
    acceptableAnswers: ["getTypeAtLocation", "checker.getTypeAtLocation"],
    explanation:
      "checker.getTypeAtLocation(node) returns the type after inference, narrowing, and " +
      "generics resolution.",
  },

  {
    type: "short-answer",
    question: "What are comments and whitespace called in the TypeScript AST?",
    expectedAnswer: "Trivia",
    acceptableAnswers: ["Trivia", "trivia"],
    explanation:
      "Comments and whitespace are 'trivia' — they are not their own nodes, " +
      "but are attached to the next relevant node.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "What does this code output? (Simplified)",
    code:
      "const src = ts.createSourceFile('x.ts', 'const a = 1;', ts.ScriptTarget.Latest, true);\n" +
      "let count = 0;\n" +
      "ts.forEachChild(src, () => { count++; });\n" +
      "console.log(count);",
    expectedAnswer: "1",
    acceptableAnswers: ["1"],
    explanation:
      "'const a = 1;' creates a SourceFile with one direct child: " +
      "VariableStatement. forEachChild only visits direct children, not grandchildren.",
  },

  {
    type: "predict-output",
    question: "What is the SyntaxKind of the innermost node in 'const x = 42;'?",
    code:
      "// AST for 'const x = 42;':\n" +
      "// SourceFile → VariableStatement → VariableDeclarationList\n" +
      "//   → VariableDeclaration → Identifier('x') + NumericLiteral('42')\n" +
      "// Question: What is the SyntaxKind of '42'?",
    expectedAnswer: "NumericLiteral",
    acceptableAnswers: ["NumericLiteral", "ts.SyntaxKind.NumericLiteral", "SyntaxKind.NumericLiteral"],
    explanation:
      "The number 42 is represented in the AST as a NumericLiteral. " +
      "Other literals: StringLiteral, TrueKeyword, FalseKeyword, NullKeyword.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is the TypeScript Compiler API the foundation of the entire TypeScript ecosystem " +
      "(VS Code, ESLint, Angular CLI)?",
    modelAnswer:
      "The Compiler API provides three essential things: 1) The AST as a structured " +
      "representation of code (syntax). 2) The Type Checker that knows the resolved type " +
      "of every expression (semantics). 3) The Language Service for interactive IDE features " +
      "(autocomplete, rename, quick fixes). Without this API every tool would have to build " +
      "its own TypeScript parser and Type Checker — impossible given the complexity of the " +
      "type system. VS Code uses the Language Service, ESLint uses the Type Checker, Angular uses " +
      "the AST + custom transformers. The API is the shared foundation.",
    keyPoints: [
      "AST: Structured code representation for all tools",
      "Type Checker: Resolved types that no other tool can calculate",
      "Language Service: Incremental IDE features in under 100ms",
      "Without the API every tool would have to build its own TypeScript parser",
    ],
  },
];