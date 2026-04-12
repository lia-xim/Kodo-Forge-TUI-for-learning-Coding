// quiz-data.ts — L39: Best Practices & Anti-Patterns
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 questions
// MC correct-index distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "39";
export const lessonTitle = "Best Practices & Anti-Patterns";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 questions, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 1: as-Casts — correct: 0 ---
  {
    question: "Why are Type Assertions (`as`) dangerous with external data (API responses)?",
    options: [
      "The compiler does NOT check whether the data actually matches the type — incorrect data leads to runtime crashes",
      "Type Assertions are slower than Type Guards because they need to check the type at runtime",
      "Type Assertions don't work with async/await — they break the Promise chain",
      "Type Assertions are compiled into JavaScript code and measurably slow down execution",
    ],
    correct: 0,
    explanation:
      "Type Assertions are purely compile-time directives. They don't exist at runtime. " +
      "If the API delivers a different format, the code won't notice — until something crashes.",
    elaboratedFeedback: {
      whyCorrect: "'as User' is a 'Trust me' to the compiler. If the API returns {error: string} instead of {name: string}, the code accesses undefined — without warning.",
      commonMistake: "Many think 'as' adds a runtime check. No — it is PURE type information and is completely removed during compilation (Type Erasure)."
    }
  },

  // --- Question 2: any Contagion — correct: 0 ---
  {
    question: "What does it mean that `any` is 'contagious'?",
    options: [
      "Every access to an any value yields any again — it spreads throughout the entire call chain",
      "any slows down the compiler for the entire project because type inference becomes more complex",
      "any prevents other files from being typed correctly — the error spreads through imports",
      "any turns all code into JavaScript — all type information is irreversibly deleted",
    ],
    correct: 0,
    explanation:
      "'const x: any = ...; const y = x.foo; const z = y.bar;' — y and z are also any. " +
      "A single any in a utility function can undermine the type system for hundreds of callers.",
    elaboratedFeedback: {
      whyCorrect: "any + any operation = any. This is different from unknown: unknown + operation = Compile-Error. any 'flows' through property accesses, function calls, and return values.",
      commonMistake: "Some think any is limited to the variable. No — it infects everything that interacts with it. That is why 'no-explicit-any' is the most important ESLint rule."
    }
  },

  // --- Question 3: Exhaustive Check — correct: 0 ---
  {
    question: "How do you enforce exhaustive switch statements with TypeScript?",
    options: [
      "With a default case that assigns the value to never — Compile-Error if a case is missing",
      "With a special compiler option 'exhaustiveSwitch' that must be enabled in tsconfig",
      "With @ts-expect-error above the switch — the compiler ignores missing cases",
      "This is only possible with ESLint, not with the compiler — TypeScript has no native support",
    ],
    correct: 0,
    explanation:
      "After all cases the type is narrowed to never. 'const _: never = value' " +
      "produces a Compile-Error if a case is missing — because the value is not never.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript's Control Flow Analysis narrows the type in each case. When all cases are covered, the remainder is never. A new union member immediately produces a Compile-Error.",
      commonMistake: "Simply 'default: return ...' is NOT an exhaustive check. It catches new cases, but the compiler does not warn. The never trick is the only way for compile-time safety."
    }
  },

  // --- Question 4: Return Types — correct: 0 ---
  {
    question: "Why should exported functions have an explicit return type?",
    options: [
      "The return type is a contract — implementation changes that alter the type are detected immediately",
      "TypeScript cannot infer return types — it always requires an explicit annotation",
      "Explicit return types make the code faster because the compiler has less inference work to do",
      "It is a pure convention without technical benefit — the compiler ignores explicit return types",
    ],
    correct: 0,
    explanation:
      "Without an explicit return type, the type silently changes when the implementation changes. " +
      "With an explicit type, the AUTHOR gets the error — not the callers.",
    elaboratedFeedback: {
      whyCorrect: "Explicit return types are a contract: 'This function returns User | undefined.' If someone changes the implementation and suddenly returns User[], the contract breaks visibly.",
      commonMistake: "For internal (non-exported) functions, inference is completely sufficient. The rule only applies to the public API — where other modules rely on the type."
    }
  },

  // --- Question 5: unknown vs any — correct: 1 ---
  {
    question: "When is unknown NOT the right choice and any acceptable?",
    options: [
      "For every API response — unknown is always the safest choice for external data",
      "During temporary JS→TS migration with a TODO comment and ESLint exception",
      "For all function parameters — unknown is always the better choice than any",
      "With Discriminated Unions — there any is sometimes needed for type inference",
    ],
    correct: 1,
    explanation:
      "During a gradual migration, temporary any is acceptable — " +
      "with a TODO comment, ESLint exception, and a plan to fix it later.",
    elaboratedFeedback: {
      whyCorrect: "Migration is a process. Typing everything immediately is unrealistic for large codebases. any with TODO is honest — it says 'there is still work here'. Without TODO it is negligence.",
      commonMistake: "Some never migrate — the TODO stays forever. Set a timeframe: 'TODO: Type by Q2 2024'. And enable 'no-explicit-any: warn' to keep it visible."
    }
  },

  // --- Question 6: Generic Rule of Thumb — correct: 1 ---
  {
    question: "When is a generic over-engineering?",
    options: [
      "When T appears in multiple parameters and in the return type — then it correctly connects the types",
      "When T only appears once and establishes no connection between input and output",
      "When T has a constraint — then a generic is always appropriate",
      "When the function has more than 2 parameters — then generics are needed for type safety",
    ],
    correct: 1,
    explanation:
      "A generic that only appears once establishes no connection. " +
      "'function log<T>(msg: T): void' — T is only used once. " +
      "'function log(msg: unknown): void' is simpler and equivalent.",
    elaboratedFeedback: {
      whyCorrect: "Generics connect types: input with output, parameters with each other. A single T has nothing to connect. It adds complexity without gaining type safety.",
      commonMistake: "Some use generics to appear 'generic'. But an unnecessary generic confuses: 'What is T? Why do I need it?' — Simplicity beats generality."
    }
  },

  // --- Question 7: YAGNI — correct: 1 ---
  {
    question: "What does YAGNI mean for TypeScript types?",
    options: [
      "TypeScript should not be used — YAGNI means 'use the simplest tool'",
      "Write the simplest type that does the job — not the most general one possible",
      "Never use generics — they are always over-engineering for most use cases",
      "Use only primitive types — complex types are a sign of poor design",
    ],
    correct: 1,
    explanation:
      "YAGNI = You Aren't Gonna Need It. Don't implement type complexity " +
      "you don't need right now. An interface is often sufficient where a Conditional Type would be overkill.",
    elaboratedFeedback: {
      whyCorrect: "Over-generic types have costs: compiler runtime, readability, error messages. A concrete interface is faster to understand than a nested Conditional Type.",
      commonMistake: "'But what if we later...' — then you refactor. TypeScript makes refactoring safe (the compiler shows all locations). Upfront engineering rarely pays off for types."
    }
  },

  // --- Question 8: Parse Don't Validate — correct: 1 ---
  {
    question: "What is the difference between 'Validate' and 'Parse' in the context of TypeScript?",
    options: [
      "No difference — both check data at compile time and runtime equally",
      "Validate returns boolean, Parse returns the stronger type — the type PROVES the validation",
      "Parse is for JSON, Validate is for forms — they have different areas of application",
      "Parse is faster, Validate is safer — they are trade-offs between performance and safety",
    ],
    correct: 1,
    explanation:
      "validateEmail(s): boolean — afterwards s is still string. " +
      "parseEmail(s): Email | null — the Email type PROVES the validation. " +
      "Parse, Don't Validate (Alexis King, 2019).",
    elaboratedFeedback: {
      whyCorrect: "After validation: You KNOW it is valid, but the TYPE does not say so. After parsing: The type IS the proof. Branded Types (L24) implement this principle: The brand is the proof.",
      commonMistake: "Some validate and then cast: if (isEmail(s)) { const e = s as Email }. Better: The parse function returns Email directly. No cast needed."
    }
  },

  // --- Question 9: Defensive Shell — correct: 2 ---
  {
    question: "Where should runtime validation (defensive typing) take place?",
    options: [
      "In every function — defensive programming should always be the top priority",
      "Only in test code — production code should rely on the type system",
      "At system boundaries: API handlers, forms, JSON.parse, external data sources",
      "Nowhere — the type system is fully sufficient to catch all errors",
    ],
    correct: 2,
    explanation:
      "System boundaries are the places where data comes from OUTSIDE — " +
      "there the type system cannot guarantee anything. Within the system the type system is sufficient.",
    elaboratedFeedback: {
      whyCorrect: "Defensive shell + offensive core: Validate at the boundary and convert to typed values. Trust the type system in the core. This is efficient and secure at the same time.",
      commonMistake: "Validating in EVERY function is paranoid and slow. In the core, types are guaranteed by the shell — double checking is redundant."
    }
  },

  // --- Question 10: is vs asserts — correct: 2 ---
  {
    question: "What is the difference between `value is T` and `asserts value is T`?",
    options: [
      "No difference — both are a Type Guard and work exactly the same at runtime",
      "'is' is for classes, 'asserts' is for interfaces — they have different areas of application",
      "'is' returns boolean (for if/else), 'asserts' throws on error (type applies directly afterwards)",
      "'is' only works with typeof, 'asserts' with instanceof — different checking mechanisms",
    ],
    correct: 2,
    explanation:
      "'is' is optional narrowing — you decide in the if/else. " +
      "'asserts' is forced narrowing — the function throws or the type applies. " +
      "No if needed after asserts.",
    elaboratedFeedback: {
      whyCorrect: "isUser(data) → boolean. In if: data is User. assertUser(data) → void (or throw). Afterwards: data is User. asserts is 'fail fast': Either the type is correct or it crashes.",
      commonMistake: "Some confuse asserts with try/catch. asserts THROWS when invalid — it does not return 'false'. The caller must handle the error or let it propagate."
    }
  },

  // --- Question 11: HttpClient — correct: 2 ---
  {
    question: "Why is `HttpClient.get<User>('/api/users')` in Angular not real type safety?",
    options: [
      "HttpClient does not support generics — the syntax is only present for backwards compatibility reasons",
      "The generic is removed at runtime and cannot be used for runtime checks",
      "The generic is a disguised assertion — TypeScript does NOT check whether the API actually returns User",
      "HttpClient always returns string — the generic is ignored and has no effect",
    ],
    correct: 2,
    explanation:
      "The generic <User> tells the compiler: 'Trust me, the API returns User.' " +
      "This is the same as 'as User'. Safe would be: get<unknown>() + Zod validation.",
    elaboratedFeedback: {
      whyCorrect: "Type Erasure: <User> disappears at runtime. If the API returns {error: 'not found'}, TypeScript still says 'this is a User'. Dangerous illusion of safety.",
      commonMistake: "Many Angular devs trust HttpClient.get<T> blindly. It is NOT proof — it is a promise. And promises can be broken (API change, network error)."
    }
  },

  // --- Question 12: Branded Types When — correct: 2 ---
  {
    question: "When are Branded Types NOT useful?",
    options: [
      "For entity IDs that could be confused — here brands are always useful",
      "For currency amounts of different currencies — USD and EUR should not be mixed up",
      "For local form fields that only exist in one component",
      "For validated values like Email or URL — here the brand protects against incorrect assignments",
    ],
    correct: 2,
    explanation:
      "Branded Types are worthwhile when confusion causes real bugs. " +
      "Form fields in one component won't be confused — " +
      "a simple interface is sufficient.",
    elaboratedFeedback: {
      whyCorrect: "The question: 'What happens in the worst case if the values are swapped?' For entity IDs: wrong user. For form fields: nothing bad — they stay in the component.",
      commonMistake: "Some brand EVERYTHING. This makes the code verbose and hard to use. Brands are for values that travel BETWEEN modules/services, not for local variables."
    }
  },

  // --- Question 13: Refactoring — correct: 3 ---
  {
    question: "Which refactoring pattern has the greatest impact on type safety?",
    options: [
      "String IDs → Branded Types — prevents ID confusion but affects only a few places",
      "Optional Chaining instead of Non-null Assertion — removes runtime crash risks but is syntactic",
      "Index Signature → Record/Map — improves the type safety of dictionary objects",
      "Boolean flags → Discriminated Union (prevents impossible states)",
    ],
    correct: 3,
    explanation:
      "Boolean flags → Discriminated Union eliminates entire classes of bugs: " +
      "impossible states, forgotten null checks, correlated data. " +
      "No other refactoring has this impact.",
    elaboratedFeedback: {
      whyCorrect: "{ isLoading: true, isError: true, data: null } is an impossible state that can exist with booleans. With DU: { status: 'loading' } cannot have an error state. Entire error category eliminated.",
      commonMistake: "Branded Types are important, but they only prevent confusion. DUs prevent entire CLASSES of bugs — state explosion, correlated nullability, forgotten cases."
    }
  },

  // --- Question 14: Metrics — correct: 3 ---
  {
    question: "What is a meaningful metric for TypeScript code quality?",
    options: [
      "Number of lines of TypeScript code — more code automatically means better type coverage",
      "Number of generics used — many generics show advanced type usage",
      "Number of Type Guards per file — the more guards the better the runtime safety",
      "any density: number of 'any' per 1000 lines (target: < 1 in new code)",
    ],
    correct: 3,
    explanation:
      "The any density directly measures how much of the code is untyped. " +
      "Less any = more compiler protection = fewer runtime bugs.",
    elaboratedFeedback: {
      whyCorrect: "any density is measurable, actionable and correlates with bug rate. 'grep -c any *.ts' / lines = metric. Target: 0 in new code, < 1/1000 in legacy code.",
      commonMistake: "Line count, generic count, or type guard count are not quality metrics. More generics ≠ better. Less any = almost always better."
    }
  },

  // --- Question 15: One Rule — correct: 3 ---
  {
    question: "What is the single most important best practice for TypeScript?",
    options: [
      "Use as many generics as possible — this demonstrates advanced TypeScript knowledge",
      "Explicitly annotate every type — inference is lazy and should be avoided",
      "Always use the latest TypeScript version — old versions are insecure",
      "Trust the compiler — don't use 'as' and 'any' to silence it",
    ],
    correct: 3,
    explanation:
      "The compiler is your partner. When it complains, it is usually right. " +
      "'as' and 'any' are symptom suppression, not problem solving.",
    elaboratedFeedback: {
      whyCorrect: "Every 'as' and 'any' is a place where you say: 'I know better than the compiler.' Most of the time that is not true. The few exceptions should be documented with a comment.",
      commonMistake: "Some annotate EVERYTHING explicitly — even where inference would be better. That is the other extreme. Balance: inference for local variables, explicit types for public APIs."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "What is the principle called that says 'Validate AND transform into a stronger type, instead of just returning boolean'?",
    expectedAnswer: "Parse, Don't Validate",
    acceptableAnswers: ["Parse, Don't Validate", "Parse Don't Validate", "parse dont validate"],
    explanation:
      "Parse, Don't Validate (Alexis King, 2019): parseEmail(s): Email instead of validateEmail(s): boolean. " +
      "The type is the proof of validation.",
  },

  {
    type: "short-answer",
    question: "What is the TypeScript assertion syntax called that narrows the type directly after the call (without if)?",
    expectedAnswer: "asserts",
    acceptableAnswers: ["asserts", "asserts value is T", "assertion function"],
    explanation:
      "asserts value is User: The function throws when invalid, afterwards value: User. " +
      "No if needed — the type applies directly after the call.",
  },

  {
    type: "short-answer",
    question: "What is the architecture called with runtime validation at system boundaries and type trust in the core?",
    expectedAnswer: "Defensive shell, offensive core",
    acceptableAnswers: ["Defensive shell", "defensive shell offensive core", "defensive shell", "defensive shell offensive core"],
    explanation:
      "Defensive shell validates external data (API, user input). " +
      "Offensive core trusts the type system — no redundant runtime checks.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Does this code compile with strict: true?",
    code:
      "function greet(name: string) {\n" +
      "  if (name) {\n" +
      "    return 'Hello ' + name;\n" +
      "  }\n" +
      "}\n\n" +
      "const result: string = greet('World');",
    expectedAnswer: "Error",
    acceptableAnswers: ["Error", "No", "Compile Error", "Error"],
    explanation:
      "greet() has no explicit return type. The inferred type is 'string | undefined' " +
      "(because the else branch has no return). Assignment to 'string' fails.",
  },

  {
    type: "predict-output",
    question: "What type does 'value' have after the assertion call?",
    code:
      "function assertString(v: unknown): asserts v is string {\n" +
      "  if (typeof v !== 'string') throw new Error('Not a string');\n" +
      "}\n\n" +
      "const value: unknown = 'hello';\n" +
      "assertString(value);\n" +
      "// What type is value here?",
    expectedAnswer: "string",
    acceptableAnswers: ["string"],
    explanation:
      "After assertString(value), value is narrowed to 'string'. " +
      "asserts changes the type in the surrounding scope — without if needed.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 question)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is the combination of 'Defensive Shell + Offensive Core' the optimal architecture " +
      "for TypeScript projects?",
    modelAnswer:
      "At system boundaries (API, user input, JSON.parse) TypeScript cannot provide guarantees — " +
      "the data comes from outside. There you need runtime validation (Zod, Type Guards). " +
      "In the core of the system the data is validated and typed by the shell. Here " +
      "additional runtime checks would be redundant and would bloat the code. The type system " +
      "guarantees correctness — compile errors instead of runtime crashes. This architecture is " +
      "efficient (minimal runtime checks) and secure (boundaries are protected).",
    keyPoints: [
      "System boundaries: data is unknown — runtime validation needed",
      "Core: data is typed — compiler guarantees correctness",
      "No double checks — efficient",
      "Parse, Don't Validate: validation yields stronger types for the core",
    ],
  },
];