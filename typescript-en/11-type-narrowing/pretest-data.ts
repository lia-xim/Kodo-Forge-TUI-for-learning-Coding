/**
 * Lesson 11 — Pre-Test Questions: Type Narrowing
 *
 * 3 questions per section, asked BEFORE reading.
 * Goal: 'Prime' the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section the question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Brief explanation (only relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: What is Narrowing? ──────────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "You have a variable of type string | number. Can you " +
      "call .toUpperCase() on it directly?",
    code: "function f(x: string | number) {\n  x.toUpperCase(); // ???\n}",
    options: [
      "Yes, TypeScript just tries it",
      "No, TypeScript reports an error",
      "Only if x is a string at runtime",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript reports an error because number has no toUpperCase. " +
      "You must first PROVE that x is a string (Type Narrowing).",
  },
  {
    sectionIndex: 1,
    question:
      "What type does x have after the null-check with early return?",
    code: "function f(x: string | null) {\n  if (x === null) return;\n  // x has which type?\n}",
    options: [
      "string | null",
      "string",
      "null",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "After the early return (if null, return), null is eliminated. " +
      "TypeScript knows: if we continue in the code, x is string.",
  },
  {
    sectionIndex: 1,
    question:
      "Which is safer: 'wert as string' or 'if (typeof wert === \"string\")'?",
    options: [
      "'as' is safer because it informs the compiler",
      "'typeof' is safer because it performs a runtime check",
      "Both are equally safe",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "typeof performs a real runtime check (proof). " +
      "as is just a promise to the compiler without verification — " +
      "if it's wrong, the code crashes at runtime.",
  },

  // ─── Section 2: typeof Guards ───────────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "How many different strings can typeof return?",
    options: [
      "5 (string, number, boolean, object, undefined)",
      "6 (+ function)",
      "8 (+ symbol, bigint)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "typeof returns exactly 8 different strings: string, number, " +
      "boolean, undefined, object, function, symbol, bigint.",
  },
  {
    sectionIndex: 2,
    question:
      "What is the problem with typeof x === 'object' when narrowing?",
    code: "function f(x: object | null) {\n  if (typeof x === 'object') {\n    // x has which type?\n  }\n}",
    options: [
      "x is safely object here (null is gone)",
      "x could still be null",
      "typeof doesn't work with object",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "typeof null returns 'object'! After typeof === 'object' " +
      "the type is object | null. You must exclude null separately.",
  },
  {
    sectionIndex: 2,
    question:
      "Can typeof distinguish between different object types? " +
      "(e.g. Array vs. Date vs. RegExp)",
    options: [
      "Yes, typeof returns the class name",
      "No, typeof returns 'object' for all objects",
      "Only for arrays: typeof [] === 'array'",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "typeof returns 'object' for ALL objects (Array, Date, RegExp, etc.). " +
      "For finer distinctions you need instanceof, Array.isArray(), " +
      "or the in operator.",
  },

  // ─── Section 3: instanceof and in ──────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "Can instanceof be used with TypeScript interfaces?",
    code: "interface User { name: string }\n// if (x instanceof User) ???",
    options: [
      "No, interfaces only exist at compile time",
      "Yes, instanceof works with all types",
      "Only if the interface extends a class",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Interfaces are removed through type erasure. At runtime " +
      "there is no interface object. instanceof needs a class.",
  },
  {
    sectionIndex: 3,
    question:
      "What does the in operator do in TypeScript?",
    code: "if ('name' in obj) { ... }",
    options: [
      "Checks whether the property 'name' exists on the object",
      "Checks whether the value of obj.name is truthy",
      "Checks whether 'name' is a valid type",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "The in operator checks whether a PROPERTY exists on the object " +
      "(not the value!). TypeScript uses this for narrowing.",
  },
  {
    sectionIndex: 3,
    question:
      "What is a 'Discriminated Union'?",
    options: [
      "A union with a common property that has different literal values",
      "A union of only two types",
      "A union that is readonly",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "A Discriminated Union has a common property (e.g. 'type') " +
      "with different literal values (e.g. 'success' | 'error'). " +
      "TypeScript can narrow on it perfectly.",
  },

  // ─── Section 4: Equality and Truthiness ─────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Which values are 'falsy' in JavaScript?",
    options: [
      "Only null and undefined",
      "null, undefined, false",
      "false, 0, '', null, undefined, NaN",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Falsy values: false, 0, -0, 0n, '', null, undefined, NaN. " +
      "EVERYTHING else is truthy — including [], {}, and '0'!",
  },
  {
    sectionIndex: 4,
    question:
      "What is the difference between 'if (x)' and 'if (x != null)'?",
    options: [
      "No difference — both check for null",
      "'if (x != null)' is slower",
      "'if (x)' also excludes 0, '', and false",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "if (x) excludes ALL falsy values (null, undefined, 0, '', false, NaN). " +
      "if (x != null) excludes only null and undefined. " +
      "If 0, '', or false are valid, use != null.",
  },
  {
    sectionIndex: 4,
    question:
      "Is 'null == undefined' in JavaScript true or false?",
    options: [
      "true",
      "false",
      "TypeError",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "null == undefined is true (loose equality). " +
      "null === undefined is false (strict equality). " +
      "That's why x != null checks for both at once.",
  },

  // ─── Section 5: Type Predicates ─────────────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "What happens when you write an incorrect type guard?",
    code: "function isString(x: unknown): x is string {\n  return true; // always true!\n}",
    options: [
      "TypeScript reports an error",
      "I don't know",
      "The guard is ignored",
      "TypeScript trusts the guard blindly — runtime crash possible",
    ],
    correct: 3,
    briefExplanation:
      "TypeScript does NOT check whether your type guard is correct. " +
      "If you always return true, the compiler trusts you " +
      "and the code crashes at runtime for non-strings.",
  },
  {
    sectionIndex: 5,
    question:
      "Did you have to provide a manual type guard with filter() before TS 5.5?",
    code: "const x: (string | null)[] = ['a', null];\nconst y = x.filter(v => v !== null);\n// type of y?",
    options: [
      "No, filter always narrowed automatically",
      "I don't know",
      "filter() couldn't handle null values at all",
      "Yes, the type remained (string | null)[] without a manual guard",
    ],
    correct: 3,
    briefExplanation:
      "Before TS 5.5, the type after filter was still (string | null)[]. " +
      "You had to write .filter((v): v is string => v !== null). " +
      "From TS 5.5 onwards, TypeScript infers this automatically.",
  },
  {
    sectionIndex: 5,
    question:
      "What is the difference between a type guard and an assertion function?",
    options: [
      "Type guard returns boolean, assertion throws or returns void",
      "Type guard is faster",
      "Assertion only works with classes",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Type guards (is) return boolean — the caller decides. " +
      "Assertion functions (asserts) throw on error — the caller " +
      "doesn't need to worry, the scope is automatically narrowed.",
  },

  // ─── Section 6: Exhaustive Checks ──────────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "What is the type of a variable in the default branch when " +
      "all cases of a union type have been handled?",
    options: [
      "unknown",
      "any",
      "never",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "When all cases are covered, nothing remains: " +
      "the type is never (the empty type). That's why you can " +
      "write const _: never = x — it is never reached.",
  },
  {
    sectionIndex: 6,
    question:
      "What happens when you call assertNever(x) but x is NOT never?",
    options: [
      "Runtime error",
      "I don't know",
      "assertNever returns undefined",
      "Compile error: x is not assignable to never",
    ],
    correct: 3,
    briefExplanation:
      "assertNever expects never as a parameter. If x is not never " +
      "(because a case is missing), TypeScript reports a compile error: " +
      "'Type X is not assignable to type never'.",
  },
  {
    sectionIndex: 6,
    question:
      "Is there an alternative to switch + assertNever for exhaustive checks?",
    options: [
      "No, switch is the only option",
      "I don't know",
      "Yes, if/else chains are always exhaustive",
      "Yes, Record<UnionType, Value> with satisfies",
    ],
    correct: 3,
    briefExplanation:
      "Record<UnionType, Value> with satisfies ensures that an entry exists for " +
      "EVERY union value. If a value is missing, " +
      "TypeScript reports an error. An elegant alternative to switch.",
  },
];