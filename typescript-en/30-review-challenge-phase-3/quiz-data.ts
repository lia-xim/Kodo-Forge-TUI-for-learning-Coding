/**
 * Lesson 30 — Quiz Data: Review Challenge Phase 3
 *
 * Questions connect concepts from L21-L29.
 * correct indices MC: 4x0, 4x1, 4x2, 3x3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "30";
export const lessonTitle = "Review Challenge Phase 3";

export const questions: QuizQuestion[] = [
  // ─── MC: correct: 0 (4x) ──────────────────────────────────────────────

  {
    question: "What do Branded Types (L24) prevent that normal string/number types cannot?",
    options: [
      "Confusion of uniform values — e.g. UserId and OrderId are both string, but not interchangeable",
      "Runtime errors for wrong types that only become visible at runtime",
      "That strings become too long and impair the readability of the code",
      "That number values are negative and thereby invalid IDs are created"
    ],
    correct: 0,
    explanation: "Branded Types add an 'invisible' brand: type UserId = string & { __brand: 'UserId' }. Although both are string, UserId and OrderId are not assignable to each other.",
  },

  {
    question: "What is the main advantage of the Result pattern (L25) over try/catch?",
    options: [
      "Errors are visible in the type — the compiler enforces error handling",
      "Better performance than try/catch because no stack traces need to be created",
      "Shorter to write and requires less boilerplate code in the project",
      "Only works with async/await and cannot be used for synchronous code"
    ],
    correct: 0,
    explanation: "Result<T,E> makes the error part of the return type. The compiler checks that you handle the error case — try/catch is invisible in the type.",
  },

  {
    question: "What does `composite: true` do in a tsconfig (L29)?",
    options: [
      "Enables incremental builds, enforces declaration, and is required for Project References",
      "Combines multiple tsconfig files into a single central configuration",
      "Compresses the output and reduces the size of generated JavaScript files",
      "Enables experimental features that are not yet in the official TypeScript standard"
    ],
    correct: 0,
    explanation: "composite: true is required for referenced projects. It enables incremental automatically and enforces declaration: true for .d.ts generation.",
  },

  {
    question: "Why does Angular have `experimentalDecorators: true` in the tsconfig (L28 + L29)?",
    options: [
      "Angular uses legacy decorators (@Component etc.) that existed before the TC39 standard",
      "For performance optimizations that are only possible with experimental decorators",
      "For template syntax that is not supported by Stage 3 Decorators",
      "Because Angular does not support strict and therefore depends on experimental features"
    ],
    correct: 0,
    explanation: "Angular has been using experimental decorators since 2016. The new TC39 Stage 3 Decorators have different semantics — Angular must stay on legacy until the migration.",
  },

  // ─── MC: correct: 1 (4x) ──────────────────────────────────────────────

  {
    question: "What does `out T` mean in `interface ReadonlyBox<out T>` (L22)?",
    options: [
      "T may only be used as an input parameter and never as a return type",
      "T is covariant — ReadonlyBox<Dog> is assignable to ReadonlyBox<Animal>",
      "T must be an output type and may not be used as a parameter",
      "T is contravariant and behaves exactly opposite to covariant"
    ],
    correct: 1,
    explanation: "out marks T as covariant: T appears only in output positions (return types). ReadonlyBox<Dog> → ReadonlyBox<Animal> is assignable.",
  },

  {
    question: "What does DeepReadonly<T> do differently than Readonly<T> (L23)?",
    options: [
      "Nothing — both are identical and produce the same readonly type",
      "It makes all nested properties readonly, not just the top level",
      "It removes all properties that are not readonly and produces an empty type",
      "It only makes arrays readonly and leaves objects unchanged as mutable"
    ],
    correct: 1,
    explanation: "Readonly<T> only works one level deep. DeepReadonly<T> is a recursive type that makes ALL nested objects and arrays readonly.",
  },

  {
    question: "What is the purpose of Smart Constructors with Branded Types (L24)?",
    options: [
      "Performance optimization that makes the code run faster at runtime",
      "Being the only place where a brand is assigned — after validation",
      "Creating Branded Types at runtime and storing the brand as a property",
      "Replacing class constructors and simplifying object creation"
    ],
    correct: 1,
    explanation: "Smart Constructors validate the input and assign the brand only after successful validation. 'Parse, Don't Validate' — the brand is the proof.",
  },

  {
    question: "What does `verbatimModuleSyntax: true` enforce (L29)?",
    options: [
      "All imports must be absolute and may not use relative paths",
      "Explicit `import type` for pure type imports — what is marked as type is erased",
      "CommonJS syntax for all imports and complete deactivation of ES Modules",
      "That all modules are exported and no private modules are allowed"
    ],
    correct: 1,
    explanation: "verbatimModuleSyntax makes import vs import type explicit. import type is removed, import remains. No more automatic 'import elision'.",
  },

  // ─── MC: correct: 2 (4x) ──────────────────────────────────────────────

  {
    question: "Why is `HttpResult<never>` a valid return type for an error function (L25 + L02)?",
    options: [
      "never is the default type used when no type parameter is specified",
      "never means 'no value' and is therefore irrelevant and can be ignored",
      "never is the bottom type — HttpResult<never> is assignable to any HttpResult<T>",
      "never is the same as void and indicates that the function returns nothing"
    ],
    correct: 2,
    explanation: "never as the bottom type is assignable to every type. Result<never, E> (only error possible) is assignable to Result<T, E> — logically correct.",
  },

  {
    question: "What makes Phantom Types particularly useful for State Machines (L26)?",
    options: [
      "They are faster than regular types and improve runtime performance",
      "They store the state at runtime and enable dynamic transition checks",
      "They make invalid state transitions compile errors instead of runtime errors",
      "They completely replace if/switch statements and make the code shorter"
    ],
    correct: 2,
    explanation: "Phantom Types exist only at the type level. The compiler prevents invalid transitions — e.g. publish(draftDoc) is an error when publish only accepts ReviewDoc.",
  },

  {
    question: "What is the difference between Declaration Merging and Module Augmentation (L27)?",
    options: [
      "No difference — both are the same and can be used interchangeably",
      "Declaration Merging only works with classes and not with interfaces or types",
      "Declaration Merging extends interfaces at the same location, Module Augmentation extends interfaces in external modules",
      "Module Augmentation only works at runtime and has no effect on the compile-time type"
    ],
    correct: 2,
    explanation: "Declaration Merging: interface A {}; interface A {} merges into one. Module Augmentation: declare module 'express' { interface Request { ... } } extends external modules.",
  },

  {
    question: "Which flag is NOT part of `strict: true` even though it belongs in every professional tsconfig (L29)?",
    options: [
      "strictNullChecks",
      "noImplicitAny",
      "noUncheckedIndexedAccess",
      "strictFunctionTypes"
    ],
    correct: 2,
    explanation: "noUncheckedIndexedAccess (array access returns T | undefined) is not included in strict, but prevents array out-of-bounds errors.",
  },

  // ─── MC: correct: 3 (3x) ──────────────────────────────────────────────

  {
    question: "Why does one set `noEmit: true` in React/Vite/Next.js projects (L29)?",
    options: [
      "React does not need JavaScript and uses exclusively TypeScript features",
      "For faster linting that does not need compiled files",
      "Because TypeScript compiles too slowly and degrades the developer experience",
      "Because esbuild/SWC handle the transpilation — TypeScript only checks types"
    ],
    correct: 3,
    explanation: "esbuild/SWC are 10-100x faster than tsc for transpilation. TypeScript is reduced to a pure type checker — noEmit prevents duplicate output.",
  },

  {
    question: "What is the advantage of `strictFunctionTypes` with respect to variance (L22 + L29)?",
    options: [
      "Faster compilation through optimized variance calculation in the compiler",
      "Prohibits all function types that are not explicitly annotated with covariance",
      "Enforces stricter type inference that prevents implicit any types",
      "Enforces contravariant parameter types — a Handler<MouseEvent> does not accept a Handler<Event>"
    ],
    correct: 3,
    explanation: "strictFunctionTypes enforces correct contravariance for function parameters. Without this flag, TypeScript allows unsafe assignments.",
  },

  {
    question: "What is the principle 'Make Illegal States Unrepresentable' and which Phase 3 concepts implement it?",
    options: [
      "Only Branded Types implement it and are the only valid pattern for this",
      "It means runtime validation for all data flowing into the application",
      "It is only relevant for functional programming and has no significance in TypeScript",
      "Invalid state = compile error — implemented by Branded Types (L24), Phantom Types (L26), Result pattern (L25)"
    ],
    correct: 3,
    explanation: "The principle: if the type system CANNOT represent invalid state, you don't need runtime checks. Branded Types, Phantom Types, and Result pattern implement it.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // New Formats
  // ═══════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "What is the pattern called where data is validated AND converted into a stronger type instead of just returning a boolean? (L24)",
    expectedAnswer: "Parse, Don't Validate",
    acceptableAnswers: ["Parse, Don't Validate", "Parse Don't Validate", "parse dont validate", "parse don't validate", "Smart Constructor"],
    explanation: "Parse, Don't Validate (Alexis King, 2019): Instead of validateEmail(s): boolean → parseEmail(s): Email | null. The brand is the proof of validation.",
  },

  {
    type: "short-answer",
    question: "Which TypeScript feature makes the type parameter T covariant (i.e. 'read only')? (L22)",
    expectedAnswer: "out",
    acceptableAnswers: ["out", "out T", "out modifier", "out-Modifier"],
    explanation: "interface Box<out T> marks T as covariant. T may only appear in output positions (return types). Box<Dog> is then assignable to Box<Animal>.",
  },

  {
    type: "short-answer",
    question: "Which Discriminated Union member represents the error case in the Result pattern? (L25)",
    expectedAnswer: "{ ok: false; error: E }",
    acceptableAnswers: ["{ ok: false; error: E }", "ok: false", "false", "error"],
    explanation: "Result<T,E> = { ok: true; value: T } | { ok: false; error: E }. The ok field is the discriminator — when false, there is error instead of value.",
  },

  {
    type: "predict-output",
    question: "Does this code compile? If not, why not?",
    code: "type UserId = string & { readonly __brand: 'UserId' };\ntype OrderId = string & { readonly __brand: 'OrderId' };\n\nconst userId = 'u-1' as UserId;\nconst orderId: OrderId = userId;",
    expectedAnswer: "Error",
    acceptableAnswers: ["Error", "No", "Does not compile", "Error", "Type Error"],
    explanation: "UserId and OrderId have different brands (__brand: 'UserId' vs 'OrderId'). Although both are string-based, they are not assignable to each other — that is exactly the point of Branded Types.",
  },

  {
    type: "predict-output",
    question: "What type does `value` have after the check?",
    code: "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n\nfunction handle(r: Result<string, Error>) {\n  if (r.ok) {\n    const value = r.value;\n    // What type is value?\n  }\n}",
    expectedAnswer: "string",
    acceptableAnswers: ["string"],
    explanation: "Discriminated Union Narrowing: After if (r.ok) TypeScript knows that r is of type { ok: true; value: string }. Therefore value: string.",
  },

  {
    type: "explain-why",
    question: "Why is the combination of Branded Types (L24), Result pattern (L25), and Phantom Types (L26) so powerful for domain modeling?",
    modelAnswer:
      "These three concepts together implement the principle 'Make Illegal States Unrepresentable'. " +
      "Branded Types prevent the confusion of values (UserId vs OrderId). " +
      "The Result pattern makes errors an explicit part of the API — no invisible try/catch. " +
      "Phantom Types encode states in the type system — invalid state transitions become compile errors. " +
      "Together they form a domain model that PREVENTS incorrect usage instead of checking at runtime.",
    keyPoints: [
      "Branded Types: prevent confusion of uniform values",
      "Result pattern: errors visible in the type instead of invisible in try/catch",
      "Phantom Types: check state transitions at compile time",
      "Together: Make Illegal States Unrepresentable",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Branded Types add a __brand that breaks structural equality. UserId and OrderId are both string, but not assignable to each other.", commonMistake: "Thinking string-based IDs are safe enough — they are not, because TypeScript is structurally typed." },
  1: { whyCorrect: "Result<T,E> makes the error part of the return type. The compiler enforces that you handle the error case.", commonMistake: "Thinking try/catch is sufficient — but the type according to the signature does not reveal that an error is possible." },
  2: { whyCorrect: "composite enables incremental builds and enforces declaration for .d.ts generation. Required for Project References.", commonMistake: "Confusing composite with incremental. composite is stricter — it also enforces declaration." },
  3: { whyCorrect: "Angular has been using legacy decorators since 2016. The new TC39 Stage 3 Decorators have different semantics.", commonMistake: "Thinking experimentalDecorators is just a default setting — it is a compatibility flag for the older API." },
  4: { whyCorrect: "out marks T as covariant. T may only appear in output positions. ReadonlyBox<Dog> → ReadonlyBox<Animal>.", commonMistake: "Confusing out with in. out = covariant (read), in = contravariant (write)." },
  5: { whyCorrect: "DeepReadonly applies recursively to nested objects. Readonly is only one level deep.", commonMistake: "Thinking Readonly is sufficient for nested objects — it is not, inner objects remain mutable." },
  6: { whyCorrect: "Smart Constructors are the only place that assigns a brand — after validation. 'Parse, Don't Validate'.", commonMistake: "Using as-casts everywhere instead of the Smart Constructor. Then the brand is meaningless." },
  7: { whyCorrect: "verbatimModuleSyntax makes import vs import type explicit. No more automatic import elision.", commonMistake: "Thinking isolatedModules is sufficient. verbatimModuleSyntax is stricter and replaces three older flags." },
  8: { whyCorrect: "never is the bottom type and is assignable to every type. Result<never, E> fits any Result<T, E>.", commonMistake: "Confusing never with void. void is a return type, never means 'does not exist'." },
  9: { whyCorrect: "Phantom Types exist only at the type level. Invalid transitions are compile errors, not runtime errors.", commonMistake: "Thinking State Machines need runtime logic. With Phantom Types, the compiler checks." },
  10: { whyCorrect: "Declaration Merging = same location (interface A + interface A). Module Augmentation = external modules (declare module 'x').", commonMistake: "Confusing the two. Module Augmentation uses Declaration Merging, but within a declare-module block." },
  11: { whyCorrect: "noUncheckedIndexedAccess returns T | undefined for index accesses. Not included in strict!", commonMistake: "Assuming strict contains all safety-relevant flags. noUncheckedIndexedAccess is missing." },
  12: { whyCorrect: "esbuild/SWC transpile 10-100x faster than tsc. TypeScript becomes a pure type checker.", commonMistake: "Thinking noEmit also disables type checking. No — only the output is suppressed." },
  13: { whyCorrect: "strictFunctionTypes enforces contravariant parameters. Handler<MouseEvent> does not accept a Handler<Event>.", commonMistake: "Confusing covariance and contravariance. Parameters = contravariant (in), return = covariant (out)." },
  14: { whyCorrect: "Branded Types + Phantom Types + Result = three complementary patterns for 'Make Illegal States Unrepresentable'.", commonMistake: "Using only one pattern. The combination is stronger than any single one." },
};