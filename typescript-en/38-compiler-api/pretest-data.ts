// pretest-data.ts — L38: Compiler API
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: ts.createProgram and AST ────────────────────────────────

  {
    sectionId: 1,
    question: "What is an Abstract Syntax Tree (AST)?",
    options: [
      "A tree structure that represents the syntax of source code",
      "A debugging tool",
      "A type of database",
      "I don't know",
    ],
    correct: 0,
    explanation: "The AST represents code as a tree — each node stands for a syntax element (function, variable, expression, etc.).",
  },
  {
    sectionId: 1,
    question: "Can the TypeScript compiler be used programmatically in your own code?",
    options: [
      "No, tsc is only a CLI tool",
      "Yes, via the Compiler API (import * as ts from 'typescript')",
      "Only with special plugins",
      "I don't know",
    ],
    correct: 1,
    explanation: "The Compiler API is included in the 'typescript' npm package and can be imported directly.",
  },
  {
    sectionId: 1,
    question: "What is the difference between Node, Symbol, and Type in the Compiler API?",
    options: [
      "All the same — different names for AST nodes",
      "Node = syntax, Symbol = named entity, Type = type information",
      "Node = file, Symbol = function, Type = variable",
      "I don't know",
    ],
    correct: 1,
    explanation: "Three layers: Node (where is it), Symbol (what does the name mean), Type (what type).",
  },

  // ─── Section 2: Traversing nodes ──────────────────────────────────────

  {
    sectionId: 2,
    question: "What does ts.forEachChild do?",
    options: [
      "Visits all nodes in the entire AST",
      "Visits only the direct children of a node",
      "Visits only identifier nodes",
      "I don't know",
    ],
    correct: 1,
    explanation: "forEachChild visits only direct children. For the entire tree you need recursive calls.",
  },
  {
    sectionId: 2,
    question: "What is the Visitor pattern in the context of ASTs?",
    options: [
      "A pattern where an object handles different node types differently",
      "A pattern for parallel processing",
      "A pattern for error handling",
      "I don't know",
    ],
    correct: 0,
    explanation: "The visitor traverses the tree and reacts to specific node types with specific actions.",
  },
  {
    sectionId: 2,
    question: "Why does TypeScript's AST not have a generic 'children' array?",
    options: [
      "That would be too slow",
      "Each node type has specific properties — forEachChild knows the structure",
      "TypeScript's AST is not a real tree",
      "I don't know",
    ],
    correct: 1,
    explanation: "FunctionDeclaration has .name, .parameters, .body as specific properties instead of a generic children array.",
  },

  // ─── Section 3: Type Checker API ────────────────────────────────────────

  {
    sectionId: 3,
    question: "What does checker.getTypeAtLocation(node) return?",
    options: [
      "A string with the type name",
      "The resolved type (after inference and narrowing) as a Type object",
      "A boolean indicating whether the node is typed",
      "I don't know",
    ],
    correct: 1,
    explanation: "getTypeAtLocation returns a Type object representing the fully resolved type.",
  },
  {
    sectionId: 3,
    question: "What is checker.getSymbolAtLocation useful for?",
    options: [
      "To find out where a name was declared — the basis for 'Go to Definition'",
      "To get the type of an expression",
      "To traverse the AST",
      "I don't know",
    ],
    correct: 0,
    explanation: "getSymbolAtLocation resolves a name (identifier) to its declaration — including import resolution.",
  },
  {
    sectionId: 3,
    question: "Why is the Type Checker the most expensive compiler component?",
    options: [
      "Because it reads many files",
      "Because it generates JavaScript",
      "Because it computes all types for all expressions — inference, generics, narrowing",
      "I don't know",
    ],
    correct: 2,
    explanation: "The Type Checker computes types, resolves generics, performs narrowing, and checks compatibility — ~50,000 lines of code.",
  },

  // ─── Section 4: Custom Transformers ─────────────────────────────────────

  {
    sectionId: 4,
    question: "What is a Custom Transformer in TypeScript?",
    options: [
      "A function that modifies the AST before JavaScript is emitted",
      "A plugin for VS Code",
      "A tsconfig option",
      "I don't know",
    ],
    correct: 0,
    explanation: "Custom Transformers modify the AST — e.g. injecting, removing, or rewriting code — before output.",
  },
  {
    sectionId: 4,
    question: "Why are AST nodes in TypeScript immutable?",
    options: [
      "Because JavaScript does not support object mutation",
      "Because it is faster than mutable nodes",
      "So that multiple transformers can run in sequence without interfering with each other",
      "I don't know",
    ],
    correct: 2,
    explanation: "Immutability ensures that each transformer receives the correct input — no side effects between transformers.",
  },
  {
    sectionId: 4,
    question: "What is ts.factory?",
    options: [
      "A build tool for TypeScript projects",
      "A module for file operations",
      "An API for creating new AST nodes",
      "I don't know",
    ],
    correct: 2,
    explanation: "ts.factory.createStringLiteral(), ts.factory.createCallExpression() etc. create new immutable AST nodes.",
  },

  // ─── Section 5: Diagnostics and Language Service ────────────────────────

  {
    sectionId: 5,
    question: "What does a TypeScript Diagnostic object contain?",
    options: [
      "Only the error message",
      "The entire source code",
      "File, position, category (Error/Warning), error code, and message",
      "I don't know",
    ],
    correct: 2,
    explanation: "Diagnostics are structured: position, length, category, code, and message — not just a string.",
  },
  {
    sectionId: 5,
    question: "What distinguishes the Language Service from createProgram?",
    options: [
      "The Language Service cannot check types",
      "I don't know",
      "The Language Service is only for .d.ts files",
      "The Language Service works incrementally — ideal for IDEs",
    ],
    correct: 3,
    explanation: "The Language Service caches results and only updates changed files — fast enough for every keystroke.",
  },
  {
    sectionId: 5,
    question: "How does VS Code use the TypeScript Compiler API?",
    options: [
      "It starts tsc as a separate process",
      "I don't know",
      "It does not use the API — VS Code has its own parser",
      "It uses the Language Service for autocomplete, hover, rename, and quick fixes",
    ],
    correct: 3,
    explanation: "VS Code starts a tsserver process that hosts the Language Service. Every IDE action is delegated to the Language Service.",
  },

  // ─── Section 6: Practice ─────────────────────────────────────────────────

  {
    sectionId: 6,
    question: "Can a linter using the Compiler API enforce rules that ESLint cannot?",
    options: [
      "No, ESLint can do everything the Compiler API can",
      "I don't know",
      "Only for TypeScript-specific syntax",
      "Yes, type-based rules that need the resolved type of an expression",
    ],
    correct: 3,
    explanation: "Rules like 'is the return value a Promise?' require the Type Checker. That is why @typescript-eslint uses the Compiler API.",
  },
  {
    sectionId: 6,
    question: "What is a realistic use case for code generation with the Compiler API?",
    options: [
      "Generating CSS files",
      "I don't know",
      "Compiling HTML templates",
      "Automatically generating validation functions from TypeScript interfaces",
    ],
    correct: 3,
    explanation: "Read an interface → extract properties and types → generate runtime validation code. Like Zod, but from existing interfaces.",
  },
  {
    sectionId: 6,
    question: "When should you NOT use the Compiler API directly?",
    options: [
      "For simple linting rules that ESLint already covers",
      "For type-based analysis",
      "For code generation from types",
      "I don't know",
    ],
    correct: 0,
    explanation: "For standard linting rules ESLint is better — it has a plugin system, community rules, and simpler configuration.",
  },
];