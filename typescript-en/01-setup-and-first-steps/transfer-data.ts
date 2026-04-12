/**
 * Lesson 01 — Transfer Tasks: Setup & First Steps
 *
 * These tasks take the concepts from the setup lesson and apply
 * them in completely new contexts:
 *
 *  1. Migration of an existing JavaScript project
 *  2. Argumentation about TypeScript performance (Type Erasure)
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Migrate JS project ──────────────────────────────────────
  {
    id: "01-migration-strategy",
    title: "Migrate JavaScript Project",
    prerequisiteLessons: [1],
    scenario:
      "You inherit a JavaScript project with 50 files from a colleague " +
      "who has left the company. There are no tests, no documentation, " +
      "and some functions have subtle bugs that only appear at runtime. " +
      "Your manager wants you to make the project 'safer'.",
    task:
      "Create a step-by-step migration strategy from JavaScript to TypeScript.\n\n" +
      "Answer the following:\n" +
      "1. Which tsconfig.json options would you set in the FIRST step?\n" +
      "2. Why not enable `strict: true` immediately?\n" +
      "3. How do you use `allowJs` and `checkJs` for a smooth migration?\n" +
      "4. In what order would you migrate the 50 files?",
    starterCode: [
      "// tsconfig.json — Phase 1: Your Starting Point",
      "{",
      '  "compilerOptions": {',
      "    // TODO: Which options for a smooth start?",
      "  },",
      '  "include": ["src/**/*"]',
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Phase 1: Coexistence (Week 1-2) ═══",
      "// tsconfig.json",
      "{",
      '  "compilerOptions": {',
      '    "target": "ES2020",',
      '    "module": "commonjs",',
      '    "allowJs": true,         // JS files stay as JS for now',
      '    "checkJs": true,          // But TypeScript checks them anyway!',
      '    "strict": false,          // Not strict yet — too many errors',
      '    "noEmit": true,           // Only check, don\'t compile',
      '    "esModuleInterop": true',
      "  }",
      "}",
      "",
      "// ═══ Phase 2: Gradual Renaming (Week 3-6) ═══",
      "// Order: Utility files first (few dependencies),",
      "// then data models, then business logic, finally entry points.",
      "//",
      "// Per file:",
      "// 1. Rename .js → .ts",
      "// 2. Add obvious types (parameters, return types)",
      "// 3. `any` for unclear spots (for now)",
      "// 4. Test that everything still works",
      "",
      "// ═══ Phase 3: Strict Mode (Week 7+) ═══",
      "{",
      '  "compilerOptions": {',
      '    "strict": true,            // Enable now',
      '    "allowJs": false,          // All files are now .ts',
      '    "noImplicitAny": true,     // No hidden any anymore',
      '    "strictNullChecks": true   // null/undefined safety',
      "  }",
      "}",
      "",
      "// ═══ Why not strict right away? ═══",
      "// With 50 files, hundreds of errors would appear immediately.",
      "// That is demoralizing and makes code reviews impossible.",
      "// allowJs + checkJs gives immediate value (finding errors) without",
      "// having to touch every file.",
      "//",
      "// Core concept: TypeScript can be introduced INCREMENTALLY.",
      "// That is one of its greatest advantages over other",
      "// type systems.",
    ].join("\n"),
    conceptsBridged: [
      "allowJs",
      "checkJs",
      "strict mode",
      "tsconfig.json",
      "incremental migration",
    ],
    hints: [
      "Think about `allowJs` and `checkJs` — with these, TypeScript can check .js files without requiring you to rename them.",
      "Start with the files that have the fewest dependencies (utility functions, constants). Work your way 'up' toward the entry points.",
      "strict: true enables noImplicitAny, strictNullChecks, strictFunctionTypes, and more all at once. On a legacy project, that would generate hundreds of errors simultaneously.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: TypeScript performance argument ─────────────────────────
  {
    id: "01-typescript-performance",
    title: "TypeScript is slower than JavaScript — really?",
    prerequisiteLessons: [1],
    scenario:
      "In a team meeting your colleague says: 'TypeScript is slower than " +
      "JavaScript. We should stick with JavaScript because performance is " +
      "important for our app.' Some team members nod in agreement.",
    task:
      "Write a short, technically precise explanation (as a comment block) " +
      "of why this statement is wrong.\n\n" +
      "Explain:\n" +
      "1. What is Type Erasure and what does it mean for runtime?\n" +
      "2. What exactly happens during compilation?\n" +
      "3. Where could TypeScript actually be 'slower' (and why " +
      "   is that irrelevant for runtime performance)?\n" +
      "4. Are there cases where TypeScript even leads to BETTER code?",
    solutionCode: [
      "/**",
      " * Why 'TypeScript is slower' is wrong:",
      " *",
      " * 1. TYPE ERASURE — The core of the argument",
      " *    TypeScript code is COMPILED to JavaScript.",
      " *    In doing so, ALL type annotations, interfaces, type aliases",
      " *    and generic type parameters are COMPLETELY REMOVED.",
      " *",
      " *    This means: at runtime, no TypeScript exists anymore.",
      " *    What gets executed is pure JavaScript.",
      " *",
      " * 2. WHAT HAPPENS DURING COMPILATION",
      " *    Before:  function add(a: number, b: number): number { return a + b; }",
      " *    After:   function add(a, b) { return a + b; }",
      " *",
      " *    The types are removed — nothing else changes.",
      " *    The generated JS code is identical to hand-written JS.",
      " *",
      " * 3. WHERE TYPESCRIPT IS 'SLOWER'",
      " *    - Compile time: tsc takes time to check (seconds to minutes)",
      " *    - IDE: the language server needs RAM and CPU for type analysis",
      " *    - Build pipeline: one extra step in the CI/CD pipeline",
      " *",
      " *    But: all of this is DEVELOPMENT TIME, not RUNTIME.",
      " *    The user of the app notices none of it.",
      " *",
      " * 4. WHERE TYPESCRIPT ACTUALLY HELPS",
      " *    - Fewer runtime bugs = less error-handling code",
      " *    - Better IDE support = faster development",
      " *    - Earlier error detection = fewer debug sessions in production",
      " *    - Enforces clearer data structures = often more efficient code",
      " *",
      " * Conclusion: TypeScript has exactly the same runtime performance as",
      " * JavaScript, because at runtime it IS JavaScript.",
      " */",
    ].join("\n"),
    conceptsBridged: [
      "Type Erasure",
      "Compile time vs. runtime",
      "Transpilation",
    ],
    hints: [
      "Think about Type Erasure: what happens to the type annotations when TypeScript is compiled? What remains?",
      "Clearly distinguish between compile time (development) and runtime (production). TypeScript only exists during development.",
    ],
    difficulty: 2,
  },
];