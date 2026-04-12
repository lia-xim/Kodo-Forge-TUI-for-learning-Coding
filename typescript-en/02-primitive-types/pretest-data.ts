/**
 * Lesson 02 — Pre-Test Questions: Primitive Types
 *
 * 3 questions per section, asked BEFORE reading.
 * Goal: To 'prime' the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section this question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Brief explanation (only becomes relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: string, number, boolean ──────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "In TypeScript there is `string` (lowercase) and `String` (uppercase). " +
      "Which one should you use?",
    options: [
      "`String` (uppercase) — like in Java",
      "`string` (lowercase) — the primitive type",
      "Both are equivalent",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Always use `string` (lowercase). `String` is a wrapper object " +
      "from JavaScript and leads to subtle bugs. The same applies to " +
      "number/Number and boolean/Boolean.",
  },
  {
    sectionIndex: 1,
    question: "What is the result of `0.1 + 0.2` in JavaScript/TypeScript?",
    code: "console.log(0.1 + 0.2);",
    options: [
      "0.3",
      "0.30000000000000004",
      "NaN",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "IEEE 754 floating-point arithmetic: 0.1 + 0.2 yields " +
      "0.30000000000000004, not exactly 0.3. This is not a TypeScript problem, " +
      "but a fundamental issue with floating-point representation.",
  },
  {
    sectionIndex: 1,
    question:
      "TypeScript has no `int` type. How are integers represented?",
    options: [
      "As their own type `integer`",
      "As `number` — everything is floating-point",
      "As `bigint` — always",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "In JavaScript/TypeScript there is only `number` (IEEE 754 64-bit float). " +
      "There is no separate integer type. For arbitrarily large integers " +
      "there is `bigint`, but that is a separate type.",
  },

  // ─── Section 2: null, undefined, strictNullChecks ────────────────────────

  {
    sectionIndex: 2,
    question:
      "JavaScript has two values for 'nothing': `null` and `undefined`. " +
      "What does `typeof null` return?",
    code: "console.log(typeof null);",
    options: [
      '"null"',
      '"undefined"',
      '"object"',
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      '`typeof null` returns "object" — a notorious bug ' +
      "from 1995 that was never fixed because too much code depends on it.",
  },
  {
    sectionIndex: 2,
    question:
      "If a variable can be `string | null` — " +
      "does TypeScript let you call `.length` on it?",
    code: "function len(s: string | null) {\n  return s.length;\n}",
    options: [
      "No, you must first check whether s is not null",
      "Yes, TypeScript converts null automatically",
      "Yes, null also has a length property",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "With `strictNullChecks` (default), TypeScript reports an error. " +
      "You must first exclude null, e.g. with `if (s !== null)`.",
  },
  {
    sectionIndex: 2,
    question:
      "What is the difference between `??` and `||` for the value `0`?",
    code: "const a = 0 || 42;\nconst b = 0 ?? 42;",
    options: [
      "`||` returns 42, `??` returns 0",
      "Both return 42",
      "Both return 0",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`||` checks for all falsy values (0 is falsy!) and returns 42. " +
      "`??` only checks for null/undefined — since 0 is neither null nor undefined, " +
      "the value stays 0.",
  },

  // ─── Section 3: any vs unknown ───────────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "TypeScript has `any` and `unknown`. Both accept any value. " +
      "What do you think — where is the difference?",
    options: [
      "`unknown` forces you to check before you use the value",
      "`any` is safer than `unknown`",
      "There is no difference",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`unknown` is the safe way: You cannot use an unknown value directly — " +
      "you must first check (Type Narrowing). " +
      "`any` disables all checks completely.",
  },
  {
    sectionIndex: 3,
    question:
      "If a variable has the type `any` — what type do " +
      "expressions derived from it have?",
    code: "let x: any = { name: 'Max' };\nlet y = x.name;\nlet z = y.length;",
    options: [
      "`y` is `string`, `z` is `number`",
      "I don't know",
      "`y` is `any`, `z` is `number`",
      "`y` and `z` are both `any`",
    ],
    correct: 3,
    briefExplanation:
      "`any` is contagious! Everything derived from an `any` value becomes " +
      "`any` again. The entire chain loses type safety.",
  },
  {
    sectionIndex: 3,
    question:
      "Which type is appropriate for a function that NEVER returns " +
      "(e.g. always throws an Error)?",
    code: "function fail(msg: string): ??? {\n  throw new Error(msg);\n}",
    options: [
      "`void` — returns nothing",
      "`undefined` — returns undefined",
      "`never` — never returns",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "`never` means 'NEVER returns'. `void` means 'returns nothing " +
      "meaningful, but does return'. A throw or an infinite loop has the type `never`.",
  },

  // ─── Section 4: Type Hierarchy ──────────────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "In TypeScript there is a type that is assignable TO every other type. " +
      "Which one could that be?",
    options: [
      "`any` — fits everywhere",
      "`unknown` — the universal type",
      "`never` — the empty type",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "`never` (bottom type) is assignable to every type — because a never value " +
      "never exists, the assignment is logically always 'safe'. `unknown` is " +
      "the top type, to which everything IS assignable (but not vice versa).",
  },
  {
    sectionIndex: 4,
    question:
      "Can you directly assign an `unknown` value to a `string` variable?",
    code: "let x: unknown = 'hello';\nlet y: string = x; // Does this work?",
    options: [
      "Yes, because the value actually is a string",
      "I don't know",
      "Yes, `unknown` is like `any`",
      "No, you must first check whether it is a string",
    ],
    correct: 3,
    briefExplanation:
      "`unknown` CANNOT be directly assigned. You must first " +
      "check (Type Narrowing), e.g. with `typeof x === 'string'`. " +
      "This is the decisive safety advantage over `any`.",
  },
  {
    sectionIndex: 4,
    question:
      "What do you think — what is the type of `const x = 'hallo'`?",
    code: "const x = 'hallo';",
    options: [
      "`string`",
      "I don't know",
      "`any`",
      '`"hallo"` (the exact value as a type)',
    ],
    correct: 3,
    briefExplanation:
      "const variables with primitive values get a literal type. " +
      'Since const never changes, the type is exactly `"hallo"` — not `string`. ' +
      "With `let` it would be `string` (type widening).",
  },
];