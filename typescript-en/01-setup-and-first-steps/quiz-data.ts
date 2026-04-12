/**
 * Lesson 01 — Quiz Data: Setup & First Steps
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "01";
export const lessonTitle = "Setup & First Steps";

export const questions: QuizQuestion[] = [
  // -----------------------------------------------------------
  // Question 1: What does the TypeScript compiler produce?
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
  // Question 2: Type Erasure -- Deep Understanding
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
      "(they are JavaScript features). 'x instanceof Logger' does " +
      "NOT work because Logger is an interface and doesn't exist at runtime. " +
      "'typeof x' returns 'object', not 'Logger' -- " +
      "JavaScript only knows primitive typeof results.",
  },

  // -----------------------------------------------------------
  // Question 3: Compiler Pipeline
  // -----------------------------------------------------------
  {
    question: "In what order does the TypeScript compiler work?",
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
      "Finally, the emitter generates the JavaScript output. Important: " +
      "Type Checking and Emit are independent -- the Emit can happen even with " +
      "type errors.",
  },

  // -----------------------------------------------------------
  // Question 4: Thought question -- Compiler behavior on errors
  // -----------------------------------------------------------
  {
    question:
      "TypeScript generates JavaScript by default, even when type errors " +
      "are present. What is the DEEPER reason for this?",
    options: [
      "It's a bug in the compiler that was never fixed",
      "Because types don't affect runtime behavior -- Type Checking " +
        "and code generation are conceptually independent",
      "To make it easier for beginners to get started",
      "Because JavaScript doesn't support types",
    ],
    correct: 1,
    explanation:
      "This is not a bug, but a fundamental design decision. " +
      "Since TypeScript types don't exist at runtime (Type Erasure), " +
      "type errors have no effect on the generated JavaScript code. " +
      "The JavaScript output is identical with or without type errors. " +
      "If you don't want this behavior, set 'noEmitOnError: true'.",
  },

  // -----------------------------------------------------------
  // Question 5: Runtime Scenario
  // -----------------------------------------------------------
  {
    question:
      "You have a function 'function add(a: number, b: number): number'. " +
      "Someone calls it at runtime with add('hello', 'world') " +
      "(e.g. through unvalidated API data). What happens?",
    options: [
      "A runtime error: 'TypeError: string is not a number'",
      "TypeScript prevents the call automatically",
      "The function returns NaN",
      "The function returns 'helloworld' (string concatenation)",
    ],
    correct: 3,
    explanation:
      "At runtime, TypeScript types don't exist! The function " +
      "is simply 'function add(a, b) { return a + b; }'. JavaScript " +
      "uses the + operator, and with two strings it does " +
      "string concatenation: 'hello' + 'world' = 'helloworld'. TypeScript " +
      "would have reported the error at compile time, but at runtime " +
      "there is no protection. That's why validation for external data " +
      "(API responses, user input) is still necessary!",
  },

  // -----------------------------------------------------------
  // Question 6: tsconfig -- strict
  // -----------------------------------------------------------
  {
    question:
      "Why do all TypeScript experts recommend 'strict: true'? " +
      "What is the most important single reason?",
    options: [
      "It makes the code faster",
      "It enables strictNullChecks, which finds null/undefined errors -- " +
        "the most common source of errors in JavaScript",
      "It prevents the use of var instead of const",
      "It forces all variables to have a type",
    ],
    correct: 1,
    explanation:
      "Although strict: true activates many checks, strictNullChecks " +
      "is the most valuable single option. Without it, ANY variable can be null or " +
      "undefined without TypeScript warning. 'Cannot read property " +
      "of undefined' is the most common JavaScript error of all. " +
      "strictNullChecks forces you to explicitly handle null cases.",
  },

  // -----------------------------------------------------------
  // Question 7: Tools
  // -----------------------------------------------------------
  {
    question:
      "You're working on a Next.js project. Which tool handles " +
      "the TypeScript compilation?",
    options: [
      "tsc compiles all the code",
      "tsx executes the code directly",
      "SWC removes the types; tsc runs separately only for Type Checking",
      "esbuild compiles and checks simultaneously",
    ],
    correct: 2,
    explanation:
      "Next.js uses SWC (a compiler written in Rust) for " +
      "the actual compilation. SWC is extremely fast, but does " +
      "NOT perform Type Checking -- it only removes the TypeScript syntax. " +
      "tsc runs separately (via 'tsc --noEmit' or in the editor) only for " +
      "type checking. This is the same approach as with tsx/esbuild.",
  },

  // -----------------------------------------------------------
  // Question 8: Thought question -- Source Maps
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
      "Without Source Maps, TypeScript doesn't work",
    ],
    correct: 1,
    explanation:
      "At runtime, JavaScript is executed, not TypeScript. When " +
      "an error occurs in line 47 of user.js, you need to find out " +
      "which line in user.ts that corresponds to. Source Maps solve exactly this " +
      "problem: they map each line in the .js output to the corresponding " +
      "line in the .ts source code. Browser DevTools and Node.js use " +
      "this information automatically.",
  },

  // -----------------------------------------------------------
  // Question 9: Thought question -- Type Assertion
  // -----------------------------------------------------------
  {
    question:
      "What is the difference between 'as string' (Type Assertion) " +
      "and String() (conversion)?",
    options: [
      "No difference -- both convert the value to a string",
      "'as string' is faster than String()",
      "'as string' only exists at compile time and doesn't change the value; " +
        "String() is a real runtime conversion",
      "'as string' is safer than String()",
    ],
    correct: 2,
    explanation:
      "'as string' is a Type Assertion -- it tells the compiler " +
      "'trust me, this is a string', but does NOT change the value at " +
      "runtime. If the value is not a string, the code will crash. " +
      "String() is a JavaScript function that actually converts the value " +
      "to a string. Type Assertions are a common pitfall: they are removed " +
      "by Type Erasure and provide NO runtime protection.",
  },

  // -----------------------------------------------------------
  // Question 10: Practical Scenario -- tsconfig
  // -----------------------------------------------------------
  {
    question:
      "You set 'target: \"ES5\"' in tsconfig.json. " +
      "Your code uses Array.prototype.flat() (ES2019). " +
      "What happens?",
    options: [
      "TypeScript reports an error: flat() doesn't exist in ES5",
      "TypeScript converts flat() into ES5-compatible code",
      "The code compiles without errors, but crashes at runtime " +
        "in older environments that don't have flat()",
      "TypeScript automatically adds a polyfill for flat()",
    ],
    correct: 0,
    explanation:
      "With target: ES5, TypeScript only knows the APIs available in ES5. " +
      "Array.flat() (ES2019) is not among them, so " +
      "the compiler reports an error. The target determines which " +
      "lib declarations are loaded. Solution: set target higher, " +
      "or explicitly specify 'lib: [\"ES2019\"]'. IMPORTANT: TypeScript " +
      "converts SYNTAX (const -> var, => -> function), but not APIS. " +
      "Polyfills are not TypeScript's job.",
  },

  // -----------------------------------------------------------
  // Question 11: Declaration Files
  // -----------------------------------------------------------
  {
    question:
      "What are .d.ts files (Declaration Files) for?",
    options: [
      "They make the code faster",
      "They provide type information for JavaScript libraries, " +
        "so TypeScript users get autocomplete and type checking",
      "They are the compiled versions of .ts files",
      "They are only needed for internal projects",
    ],
    correct: 1,
    explanation:
      ".d.ts files contain ONLY type information -- no " +
      "executable code. They serve as 'interface descriptions' " +
      "for JavaScript libraries. That's why there are @types/react and " +
      "@types/node: React and Node.js are written in JS, but " +
      "the .d.ts files provide the types. If you write your own " +
      "library, you generate .d.ts files with 'declaration: true'.",
  },

  // -----------------------------------------------------------
  // Question 12: Overall Understanding
  // -----------------------------------------------------------
  {
    question:
      "A colleague says: 'TypeScript adds runtime type checking, " +
      "so our code is safer.' What do you say?",
    options: [
      "Exactly right!",
      "Partly true -- only for enums and classes",
      "Wrong. TypeScript checks types ONLY at compile time. At runtime, " +
        "everything is pure JavaScript without type checks. The code is " +
        "still safer because errors are found BEFORE execution",
      "Wrong. TypeScript makes the code neither safer nor less safe",
    ],
    correct: 2,
    explanation:
      "This is the most common misconception about TypeScript! " +
      "TypeScript adds NO runtime checks. All types " +
      "are removed during compilation (Type Erasure). The code " +
      "is still safer because the compiler finds errors BEFORE " +
      "execution -- similar to how a spell checker finds errors " +
      "before a text is sent. But at runtime " +
      "there is no safety net.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // New Formats: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 13: Short-Answer — Compiler Pipeline ---
  {
    type: "short-answer",
    question:
      "In which phase of the TypeScript compiler pipeline are types checked? " +
      "(Parsing, Type Checking, or Emit)",
    expectedAnswer: "Type Checking",
    acceptableAnswers: ["Type Checking", "type checking", "typechecking", "Type Check", "type check", "Typechecking"],
    explanation:
      "The pipeline is: Parsing (source code -> AST), then Type Checking (check types), " +
      "then Emit (generate JavaScript). Type Checking and Emit are independent — " +
      "the Emit can happen even with type errors.",
  },

  // --- Question 14: Short-Answer — tsconfig Option ---
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

  // --- Question 15: Short-Answer — Type Erasure ---
  {
    type: "short-answer",
    question: "What is the concept called where TypeScript types are completely removed during compilation?",
    expectedAnswer: "Type Erasure",
    acceptableAnswers: ["Type Erasure", "type erasure", "TypeErasure", "Erasure", "erasure"],
    explanation:
      "Type Erasure means that ALL TypeScript-specific constructs (type annotations, " +
      "interfaces, type aliases, generics) are completely removed during compilation. " +
      "At runtime, only pure JavaScript remains.",
  },

  // --- Question 16: Predict-Output — String Concatenation ---
  {
    type: "predict-output",
    question: "TypeScript compiles this code despite type errors. What does it output at runtime?",
    code: `function multiply(a: number, b: number): number {\n  return a * b;\n}\n// Called at runtime with strings:\nconsole.log((multiply as any)("3", "4"));`,
    expectedAnswer: "12",
    acceptableAnswers: ["12", "NaN", "\"12\""],
    explanation:
      "JavaScript's * operator automatically converts strings to numbers: " +
      "'3' * '4' = 12. Unlike +, which concatenates strings, * forces " +
      "a numeric conversion. TypeScript would have reported the error at compile time, " +
      "but 'as any' bypasses the check.",
  },

  // --- Question 17: Predict-Output — typeof with Classes ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: `interface Animal { name: string; }\nclass Dog implements Animal {\n  constructor(public name: string) {}\n}\nconst d = new Dog("Rex");\nconsole.log(typeof d);`,
    expectedAnswer: "object",
    acceptableAnswers: ["object", "'object'", "\"object\""],
    explanation:
      "typeof returns 'object' for all objects (including class instances). " +
      "There is NO 'Dog' or 'Animal' — typeof only knows the 7 JavaScript primitive types " +
      "plus 'object' and 'function'. For class checks, use 'instanceof'.",
  },

  // --- Question 18: Explain-Why — Type Erasure Consequences ---
  {
    type: "explain-why",
    question:
      "Why is TypeScript alone NOT sufficient to secure API data, " +
      "even though interfaces for the API response have been defined?",
    modelAnswer:
      "TypeScript interfaces only exist at compile time and are completely removed during compilation " +
      "(Type Erasure). At runtime, there is no type checking. If an " +
      "API delivers different data than the interface promises (e.g., a field is missing or has a " +
      "different type), TypeScript won't notice — the code only crashes later. " +
      "That's why additional runtime validation (e.g., Zod, io-ts, or manual checks) is needed.",
    keyPoints: [
      "Type Erasure: interfaces don't exist at runtime",
      "No automatic runtime validation by TypeScript",
      "External data (APIs, user input) can deviate from the interface",
      "Runtime validation (Zod, io-ts) needed as a supplement",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Additional explanations for each question: Why the correct answer
// is correct and which misconception is most common.

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
      "In reality, TypeScript is 'just' a type layer over JavaScript — the output is always JS.",
  },
  1: {
    whyCorrect:
      "`x instanceof ConsoleLogger` works because classes exist at runtime — " +
      "they are real JavaScript features with a prototype chain. Interfaces, on the other hand, " +
      "are purely compile-time constructs and completely disappear with Type Erasure.",
    commonMistake:
      "The most common mistake is writing `x instanceof Logger`. " +
      "In languages like Java this works because interfaces exist at runtime. " +
      "In TypeScript they don't — interfaces are NOT JavaScript values.",
  },
  2: {
    whyCorrect:
      "The compiler pipeline is: Parsing (source code → AST), then Type Checking " +
      "(analyze AST and check types), then Emit (AST → JavaScript). " +
      "The emitter can run without the type checker — that's why the output works even with errors.",
    commonMistake:
      "Many assume Type Checking comes before Parsing. But the compiler " +
      "must first understand the code (parse it) before it can check types.",
  },
  3: {
    whyCorrect:
      "Since TypeScript types don't exist at runtime (Type Erasure), type errors " +
      "have no effect on the generated JavaScript code. The JS output is identical with or without " +
      "type errors. Type Checking and code generation are conceptually independent.",
    commonMistake:
      "The reflex is to think 'error = no output'. In most compilers that's true, " +
      "but TypeScript deliberately separates checking and output. `noEmitOnError: true` changes this.",
  },
  4: {
    whyCorrect:
      "At runtime the function is `function add(a, b) { return a + b; }`. " +
      "JavaScript's + operator does string concatenation with two strings: " +
      "'hello' + 'world' = 'helloworld'. TypeScript would have reported the error at compile time, " +
      "but at runtime there is no protection.",
    commonMistake:
      "Many expect a TypeError or NaN. But JavaScript's + is polymorphic: " +
      "it concatenates strings, adds numbers. No runtime error!",
  },
  5: {
    whyCorrect:
      "`strictNullChecks` is the most valuable single option: without it, ANY variable " +
      "can be null or undefined without TypeScript warning. 'Cannot read property of undefined' " +
      "is the most common JavaScript error of all.",
    commonMistake:
      "Many think `strict: true` forces type annotations everywhere. " +
      "It activates several checks, but the most important single effect is strictNullChecks.",
  },
  6: {
    whyCorrect:
      "Next.js uses SWC for compilation (fast, but no Type Checking). " +
      "`tsc` runs separately with `--noEmit` only for type checking. " +
      "This principle (fast compiler + separate Type Checking) is widely used.",
    commonMistake:
      "The most common misconception: `tsc` does everything. In modern projects, " +
      "compilation (SWC/esbuild/swc) and type checking (tsc) are separated for better performance.",
  },
  7: {
    whyCorrect:
      "At runtime, JavaScript is executed. When an error occurs in line 47 of user.js, " +
      "the Source Map points to the corresponding line in user.ts. " +
      "Browser DevTools and Node.js use this mapping automatically.",
    commonMistake:
      "Some think Source Maps make the code faster or are only for old browsers. " +
      "They are a pure debugging tool that maps TS lines to JS lines.",
  },
  8: {
    whyCorrect:
      "`as string` is a Type Assertion that ONLY tells the compiler 'trust me'. " +
      "It is removed during compilation and does NOT change the value. " +
      "`String()` is a real JavaScript function that converts the value.",
    commonMistake:
      "The reflex from other languages: 'casting converts the value'. " +
      "In TypeScript, a cast (Type Assertion) is not a conversion, " +
      "but a compile-time instruction that doesn't exist at runtime.",
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
      "They serve as 'interface descriptions' for JavaScript libraries. " +
      "@types/react provides types for the JS-written React.",
    commonMistake:
      "The most common misconception: .d.ts files are the compiled versions of .ts files. " +
      "They are the opposite: they contain ONLY the types, the code is removed.",
  },
  11: {
    whyCorrect:
      "TypeScript checks types ONLY at compile time. All types are removed during compilation " +
      "(Type Erasure). The code is still safer because errors are found BEFORE " +
      "execution — but there is no runtime protection.",
    commonMistake:
      "The most common misconception about TypeScript! Many believe TS adds " +
      "automatic runtime checks. In reality, at runtime " +
      "everything is pure JavaScript without any type checking.",
  },
};