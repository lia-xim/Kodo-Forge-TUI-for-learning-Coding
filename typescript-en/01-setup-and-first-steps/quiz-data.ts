```typescript
/**
 * Lektion 01 — Quiz-Daten: Setup & Erste Schritte
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "01";
export const lessonTitle = "Setup & First Steps";

export const questions: QuizQuestion[] = [
  // -----------------------------------------------------------
  // Frage 1: Was erzeugt der TypeScript-Compiler?
  // -----------------------------------------------------------
  {
    question: "What does the TypeScript compiler (tsc) produce as output?",
    options: [
      "Machine code that is executed directly by the processor",
      "Bytecode for the Node.js Virtual Machine",
      "JavaScript code with all type annotations removed",
      "An executable .exe file",
    ],
    correct: 2,
    explanation:
      "TypeScript is a transpiler: it translates TypeScript into JavaScript. " +
      "All type annotations, interfaces, and other TypeScript-specific " +
      "constructs are completely removed in the process (Type Erasure). The result " +
      "is normal JavaScript code that runs in any JS environment.",
  },

  // -----------------------------------------------------------
  // Frage 2: Type Erasure -- Tiefes Verstaendnis
  // -----------------------------------------------------------
  {
    question:
      "You have this code:\n" +
      "  interface Logger { log(msg: string): void; }\n" +
      "  class ConsoleLogger implements Logger {\n" +
      "    log(msg: string) { console.log(msg); }\n" +
      "  }\n" +
      "  const x = new ConsoleLogger();\n\n" +
      "Which of these checks works at runtime?",
    options: [
      "x instanceof Logger",
      "x instanceof ConsoleLogger",
      "typeof x === 'Logger'",
      "None of them work",
    ],
    correct: 1,
    explanation:
      "'x instanceof ConsoleLogger' works because classes exist at runtime " +
      "(they are JavaScript features). 'x instanceof Logger' does NOT " +
      "work because Logger is an interface and does not exist at runtime. " +
      "'typeof x' returns 'object', not 'Logger' — " +
      "JavaScript only knows primitive typeof results.",
  },

  // -----------------------------------------------------------
  // Frage 3: Compiler-Pipeline
  // -----------------------------------------------------------
  {
    question: "In what order does the TypeScript compiler operate?",
    options: [
      "Type Checking --> Parsing --> Emit",
      "Parsing --> Emit --> Type Checking",
      "Parsing --> Type Checking --> Emit",
      "Emit --> Type Checking --> Parsing",
    ],
    correct: 2,
    explanation:
      "First, the source code is parsed into an Abstract Syntax Tree (AST). " +
      "Then the type checker traverses the AST and checks the types. " +
      "Finally, the emitter produces the JavaScript output. Important: " +
      "Type Checking and Emit are independent — the Emit can occur even when " +
      "there are type errors.",
  },

  // -----------------------------------------------------------
  // Frage 4: Denkfrage -- Compiler-Verhalten bei Fehlern
  // -----------------------------------------------------------
  {
    question:
      "TypeScript generates JavaScript by default, even when type errors " +
      "are present. What is the DEEPER reason for this?",
    options: [
      "It is a bug in the compiler that was never fixed",
      "Because types do not affect runtime behavior — Type Checking " +
        "and code generation are conceptually independent",
      "So that beginners can get started more easily",
      "Because JavaScript does not support types",
    ],
    correct: 1,
    explanation:
      "This is not a bug, but a fundamental design decision. " +
      "Since TypeScript types do not exist at runtime (Type Erasure), " +
      "type errors have no influence on the generated JavaScript code. " +
      "The JavaScript output is identical with or without type errors. " +
      "If you don't want this behavior, set 'noEmitOnError: true'.",
  },

  // -----------------------------------------------------------
  // Frage 5: Laufzeit-Szenario
  // -----------------------------------------------------------
  {
    question:
      "You have a function 'function add(a: number, b: number): number'. " +
      "Someone calls it at runtime with add('hello', 'world') " +
      "(e.g. through unchecked API data). What happens?",
    options: [
      "A runtime error: 'TypeError: string is not a number'",
      "TypeScript prevents the call automatically",
      "The function returns NaN",
      "The function returns 'helloworld' (string concatenation)",
    ],
    correct: 3,
    explanation:
      "At runtime, TypeScript types do not exist! The function " +
      "is simply 'function add(a, b) { return a + b; }'. JavaScript " +
      "uses the + operator, and with two strings it performs " +
      "string concatenation: 'hello' + 'world' = 'helloworld'. TypeScript " +
      "would have reported the error at compile time, but at runtime " +
      "there is no protection. That is why validation for external data " +
      "(API responses, user input) is still necessary!",
  },

  // -----------------------------------------------------------
  // Frage 6: tsconfig -- strict
  // -----------------------------------------------------------
  {
    question:
      "Why do all TypeScript experts recommend 'strict: true'? " +
      "What is the single most important reason?",
    options: [
      "It makes the code faster",
      "It enables strictNullChecks, which catches null/undefined errors — " +
        "the most common source of errors in JavaScript",
      "It prevents the use of var instead of const",
      "It requires all variables to have a type",
    ],
    correct: 1,
    explanation:
      "Although strict: true activates many checks, strictNullChecks " +
      "is the most valuable individual option. Without it, EVERY variable can be null or " +
      "undefined without TypeScript warning. 'Cannot read property " +
      "of undefined' is the most common JavaScript error of all. " +
      "strictNullChecks forces you to explicitly handle null cases.",
  },

  // -----------------------------------------------------------
  // Frage 7: Werkzeuge
  // -----------------------------------------------------------
  {
    question:
      "You are working on a Next.js project. Which tool handles " +
      "the TypeScript compilation?",
    options: [
      "tsc compiles the entire code",
      "tsx runs the code directly",
      "SWC removes the types; tsc runs separately only for Type Checking",
      "esbuild compiles and checks simultaneously",
    ],
    correct: 2,
    explanation:
      "Next.js uses SWC (a compiler written in Rust) for " +
      "the actual compilation. SWC is extremely fast but does NOT " +
      "perform Type Checking — it only removes TypeScript syntax. " +
      "tsc runs separately (via 'tsc --noEmit' or in the editor) only for " +
      "type checking. This is the same approach used by tsx/esbuild.",
  },

  // -----------------------------------------------------------
  // Frage 8: Denkfrage -- Source Maps
  // -----------------------------------------------------------
  {
    question:
      "Why do you need Source Maps, even though you write TypeScript " +
      "and not JavaScript?",
    options: [
      "Source Maps make the code faster",
      "Because the browser/Node.js executes JavaScript, not TypeScript. " +
        "Without Source Maps, error messages point to lines in .js files " +
        "that you never wrote",
      "Source Maps are only needed for legacy browsers",
      "Without Source Maps, TypeScript does not work",
    ],
    correct: 1,
    explanation:
      "At runtime, JavaScript is executed, not TypeScript. If " +
      "an error occurs on line 47 of user.js, you need to figure out " +
      "which line in user.ts that corresponds to. Source Maps solve exactly this " +
      "problem: they map each line in the .js output to the corresponding " +
      "line in the .ts source code. Browser DevTools and Node.js use " +
      "this information automatically.",
  },

  // -----------------------------------------------------------
  // Frage 9: Denkfrage -- Type Assertion
  // -----------------------------------------------------------
  {
    question:
      "What is the difference between 'as string' (Type Assertion) " +
      "and String() (conversion)?",
    options: [
      "No difference — both convert the value to a string",
      "'as string' is faster than String()",
      "'as string' only exists at compile time and does not change the value; " +
        "String() is a real runtime conversion",
      "'as string' is safer than String()",
    ],
    correct: 2,
    explanation:
      "'as string' is a Type Assertion — it tells the compiler " +
      "'trust me, this is a string', but does NOT change the value at " +
      "runtime. If the value is not a string, the code crashes. " +
      "String() is a JavaScript function that actually " +
      "converts the value to a string. Type Assertions are a common " +
      "pitfall: they are removed by Type Erasure and offer " +
      "NO runtime protection.",
  },

  // -----------------------------------------------------------
  // Frage 10: Praxis-Szenario -- tsconfig
  // -----------------------------------------------------------
  {
    question:
      "You set 'target: \"ES5\"' in tsconfig.json. " +
      "Your code uses Array.prototype.flat() (ES2019). " +
      "What happens?",
    options: [
      "TypeScript reports an error: flat() does not exist in ES5",
      "TypeScript converts flat() into ES5-compatible code",
      "The code compiles without errors, but crashes at runtime " +
        "in older environments that do not have flat()",
      "TypeScript automatically adds a polyfill for flat()",
    ],
    correct: 0,
    explanation:
      "With target: ES5, TypeScript only knows the APIs available " +
      "in ES5. Array.flat() (ES2019) is not among them, so " +
      "the compiler reports an error. The target determines which " +
      "lib declarations are loaded. Solution: set target higher, " +
      "or explicitly specify 'lib: [\"ES2019\"]'. IMPORTANT: TypeScript " +
      "converts SYNTAX (const -> var, => -> function), but not APIS. " +
      "Polyfills are not TypeScript's job.",
  },

  // -----------------------------------------------------------
  // Frage 11: Declaration Files
  // -----------------------------------------------------------
  {
    question:
      "What are .d.ts files (Declaration Files) used for?",
    options: [
      "They make the code faster",
      "They provide type information for JavaScript libraries, " +
        "so that TypeScript users get autocomplete and type checking",
      "They are the compiled versions of .ts files",
      "They are only needed for internal projects",
    ],
    correct: 1,
    explanation:
      ".d.ts files contain ONLY type information — no " +
      "executable code. They serve as an 'interface description' " +
      "for JavaScript libraries. That is why @types/react and " +
      "@types/node exist: React and Node.js are written in JS, but " +
      "the .d.ts files supply the types. When you write your own " +
      "library, you generate .d.ts files with 'declaration: true'.",
  },

  // -----------------------------------------------------------
  // Frage 12: Gesamtverstaendnis
  // -----------------------------------------------------------
  {
    question:
      "A colleague says: 'TypeScript adds runtime type checks, " +
      "so our code is safer.' What do you reply?",
    options: [
      "Exactly right!",
      "Partially correct — only for enums and classes",
      "Wrong. TypeScript checks types ONLY at compile time. At runtime " +
        "everything is pure JavaScript without any type checks. The code is " +
        "still safer because errors are found BEFORE execution",
      "Wrong. TypeScript makes the code neither safer nor less safe",
    ],
    correct: 2,
    explanation:
      "This is the most common misconception about TypeScript! " +
      "TypeScript adds NO runtime checks. All types " +
      "are removed at compilation (Type Erasure). The code " +
      "is still safer because the compiler finds errors BEFORE " +
      "execution — similar to how a spell checker " +
      "finds errors before the text is sent. But at " +
      "runtime there is no safety net anymore.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Neue Formate: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 13: Short-Answer — Compiler-Pipeline ---
  {
    type: "short-answer",
    question:
      "In which phase of the TypeScript compiler pipeline are types checked? " +
      "(Parsing, Type Checking, or Emit)",
    expectedAnswer: "Type Checking",
    acceptableAnswers: ["Type Checking", "type checking", "typechecking", "Type Check", "type check", "Typechecking"],
    explanation:
      "The pipeline is: Parsing (source code -> AST), then Type Checking (checking types), " +
      "then Emit (generating JavaScript). Type Checking and Emit are independent — " +
      "the Emit can occur even when there are type errors.",
  },

  // --- Frage 14: Short-Answer — tsconfig-Option ---
  {
    type: "short-answer",
    question:
      "Which tsconfig option prevents JavaScript from being generated when type errors are present?",
    expectedAnswer: "noEmitOnError",
    acceptableAnswers: ["noEmitOnError", "noEmitOnError: true", "\"noEmitOnError\": true", "noemitonerror"],
    explanation:
      "By default, TypeScript generates JavaScript even with type errors (Type Checking and Emit " +
      "are independent). With 'noEmitOnError: true' in tsconfig.json, this is suppressed — " +
      "no output on errors.",
  },

  // --- Frage 15: Short-Answer — Type Erasure ---
  {
    type: "short-answer",
    question: "What is the term for the concept that TypeScript types are completely removed during compilation?",
    expectedAnswer: "Type Erasure",
    acceptableAnswers: ["Type Erasure", "type erasure", "TypeErasure", "Erasure", "erasure"],
    explanation:
      "Type Erasure means that ALL TypeScript-specific constructs (type annotations, " +
      "interfaces, type aliases, generics) are completely removed during compilation. " +
      "At runtime, only pure JavaScript remains.",
  },

  // --- Frage 16: Predict-Output — String-Verkettung ---
  {
    type: "predict-output",
    question: "TypeScript compiles this code despite the type error. What does it output at runtime?",
    code: `function multiply(a: number, b: number): number {\n  return a * b;\n}\n// Called with strings at runtime:\nconsole.log((multiply as any)("3", "4"));`,
    expectedAnswer: "12",
    acceptableAnswers: ["12", "NaN", "\"12\""],
    explanation:
      "JavaScript's * operator automatically converts strings to numbers: " +
      "'3' * '4' = 12. Unlike +, which concatenates strings, * forces " +
      "a numeric conversion. TypeScript would have reported the error at compile time, " +
      "but 'as any' bypasses the check.",
  },

  // --- Frage 17: Predict-Output — typeof bei Klassen ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: `interface Animal { name: string; }\nclass Dog implements Animal {\n  constructor(public name: string) {}\n}\nconst d = new Dog("Rex");\nconsole.log(typeof d);`,
    expectedAnswer: "object",
    acceptableAnswers: ["object", "'object'", "\"object\""],
    explanation:
      "typeof returns 'object' for all objects (including class instances). " +
      "There is no 'Dog' or 'Animal' — typeof only knows the 7 JavaScript primitive types " +
      "plus 'object' and 'function'. For class checks, use 'instanceof'.",
  },

  // --- Frage 18: Explain-Why — Type Erasure Konsequenzen ---
  {
    type: "explain-why",
    question:
      "Why is TypeScript alone NOT sufficient to secure API data, " +
      "even when interfaces have been defined for the API response?",
    modelAnswer:
      "TypeScript interfaces only exist at compile time and are completely removed during compilation " +
      "(Type Erasure). At runtime there is no type checking. If an " +
      "API delivers different data than the interface promises (e.g. a field is missing or has a " +
      "different type), TypeScript does not notice — the code only crashes later. " +
      "That is why additional runtime validation is needed (e.g. Zod, io-ts, or manual checks).",
    keyPoints: [
      "Type Erasure: interfaces do not exist at runtime",
      "No automatic runtime validation by TypeScript",
      "External data (APIs, user input) can deviate from the interface",
      "Runtime validation (Zod, io-ts) needed as a supplement",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Zusaetzliche Erklaerungen fuer jede Frage: Warum die richtige Antwort
// richtig ist und welche Fehlkonzeption am haeufigsten vorkommt.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "TypeScript is a transpiler: it translates TypeScript code into JavaScript code. " +
      "In the process, all type annotations, interfaces, and other TS-specific constructs " +
      "are completely removed (Type Erasure). The result is normal JavaScript code.",
    commonMistake:
      "Many think TypeScript generates machine code or bytecode, similar to Java or C#. " +
      "In reality, TypeScript is 'only' a type layer over JavaScript — the output is always JS.",
  },
  1: {
    whyCorrect:
      "`x instanceof ConsoleLogger` works because classes exist at runtime — " +
      "they are real JavaScript features with a prototype chain. Interfaces, on the other hand, " +
      "are pure compile-time constructs and completely disappear with Type Erasure.",
    commonMistake:
      "The most common mistake is writing `x instanceof Logger`. " +
      "In languages like Java this works because interfaces exist at runtime. " +
      "In TypeScript they do not — interfaces are NOT JavaScript values.",
  },
  2: {
    whyCorrect:
      "The compiler pipeline is: Parsing (source code → AST), then Type Checking " +
      "(analyzing the AST and checking types), then Emit (AST → JavaScript). " +
      "The emitter can run without the type checker — that is why output works even with errors.",
    commonMistake:
      "Many assume Type Checking comes before Parsing. But the compiler " +
      "must first understand the code (parse it) before it can check types.",
  },
  3: {
    whyCorrect:
      "Since TypeScript types do not exist at runtime (Type Erasure), type errors " +
      "have no influence on the generated JavaScript code. The JS output is identical with or without " +
      "type errors. Type Checking and code generation are conceptually independent.",
    commonMistake:
      "The reflex is to think 'errors = no output'. In most compilers that is true, " +
      "but TypeScript deliberately separates checking and output. `noEmitOnError: true` changes that.",
  },
  4: {
    whyCorrect:
      "At runtime the function is `function add(a, b) { return a + b; }`. " +
      "JavaScript's + operator performs string concatenation with two strings: " +
      "'hello' + 'world' = 'helloworld'. TypeScript would have reported the error at compile time, " +
      "but at runtime there is no protection.",
    commonMistake:
      "Many expect a TypeError or NaN. But JavaScript's + is polymorphic: " +
      "with strings it concatenates, with numbers it adds. No runtime error!",
  },
  5: {
    whyCorrect:
      "`strictNullChecks` is the most valuable individual option: without it, EVERY variable " +
      "can be null or undefined without TypeScript warning. 'Cannot read property of undefined' " +
      "is the most common JavaScript error of all.",
    commonMistake:
      "Many think `strict: true` requires type annotations everywhere. " +
      "It activates several checks, but the most important single effect is strictNullChecks.",
  },
  6: {
    whyCorrect:
      "Next.js uses SWC for compilation (fast, but no Type Checking). " +
      "`tsc` runs separately with `--noEmit` only for type checking. " +
      "This principle (fast compiler + separate Type Checking) is widely used.",
    commonMistake:
      "The most common misconception: `tsc` does everything. In modern projects, " +
      "compilation (SWC/esbuild/swc) and Type Checking (tsc) are separated for better performance.",
  },
  7: {
    whyCorrect:
      "At runtime, JavaScript is executed. When an error occurs on line 47 of user.js, " +
      "the Source Map points to the corresponding line in user.ts. " +
      "Browser DevTools and Node.js use this mapping automatically.",
    commonMistake:
      "Some think Source Maps make the code faster or are only for old browsers. " +
      "They are a pure debugging tool that maps TS lines to JS lines.",
  },
  8: {
    whyCorrect:
      "`as string` is a Type Assertion that ONLY tells the compiler 'trust me'. " +
      "It is removed at compilation and does NOT change the value. " +
      "`String()` is a real JavaScript function that converts the value.",
    commonMistake:
      "The reflex from other languages: 'casting converts the value'. " +
      "In TypeScript, a cast (Type Assertion) is not a conversion, " +
      "but a compile-time directive that does not exist at runtime.",
  },
  9: {
    whyCorrect:
      "With target: ES5, TypeScript only loads the ES5 lib declarations. " +
      "Array.flat() (ES2019) is not among them, so the compiler reports an error. " +
      "TypeScript converts SYNTAX (const → var), but not APIS — polyfills are not TS' job.",
    commonMistake:
      "Many expect TypeScript to add polyfills. " +
      "TypeScript is not a polyfill system — it only converts syntax. " +
      "For missing APIs, you need core-js or other polyfill libraries.",
  },
  10: {
    whyCorrect:
      ".d.ts files contain ONLY type information — no executable code. " +
      "They serve as an 'interface description' for JavaScript libraries. " +
      "@types/react supplies types for React, which is written in JS.",
    commonMistake:
      "The most common misconception: .d.ts files are the compiled versions of .ts files. " +
      "They are the opposite: they contain ONLY the types, the code is removed.",
  },
  11: {
    whyCorrect:
      "TypeScript checks types ONLY at compile time. All types are removed at compilation " +
      "(Type Erasure). The code is still safer because errors are found BEFORE " +
      "execution — but there is no runtime protection.",
    commonMistake:
      "The most common misconception about TypeScript! Many believe TS adds " +
      "automatic runtime checks. In reality, at runtime " +
      "everything is pure JavaScript without any type checking.",
  },
};
```