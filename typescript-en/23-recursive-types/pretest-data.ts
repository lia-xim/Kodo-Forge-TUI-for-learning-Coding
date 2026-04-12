/**
 * Lesson 23 — Pre-Test Questions: Recursive Types
 *
 * 3 questions per section, asked BEFORE reading.
 * Goal: 'Prime' the brain for the upcoming explanation.
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
  // ─── Section 1: What are recursive types? ─────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "What makes a type 'recursive'?",
    options: [
      "It uses generic parameters",
      "It references itself in its definition",
      "It has more than 3 properties",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "A recursive type references itself, e.g. " +
      "type List<T> = { value: T; next: List<T> | null }.",
  },
  {
    sectionIndex: 1,
    question:
      "What does every recursive type need besides self-reference?",
    options: [
      "A generic parameter",
      "A termination condition (Base Case)",
      "At least 3 properties",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Without a termination condition (e.g. | null) the type would be infinite " +
      "and no finite object could satisfy it.",
  },
  {
    sectionIndex: 1,
    question:
      "Can TypeScript process this type: type Infinite<T> = { value: T; next: Infinite<T> }?",
    code: "type Infinite<T> = { value: T; next: Infinite<T> };",
    options: [
      "No, Compile Error",
      "Yes, but you can't create a finite object from it",
      "Yes, TypeScript automatically adds null",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript accepts the type (lazy evaluation), but " +
      "no finite object can satisfy it because next always " +
      "requires another Infinite<T>.",
  },

  // ─── Section 2: Typing tree structures ────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Which everyday data type is recursive by definition?",
    options: [
      "CSV",
      "JSON",
      "Base64",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "JSON is recursively defined: a JSON value can be an array " +
      "of JSON values or an object with JSON values.",
  },
  {
    sectionIndex: 2,
    question:
      "What is 'indirect recursion' in types?",
    options: [
      "A type that is never resolved",
      "A type that references itself through another type (A → B → A)",
      "A type that is only optionally recursive",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Indirect recursion: Type A references Type B, which references back " +
      "to A. JsonValue → JsonArray → JsonValue is an example.",
  },
  {
    sectionIndex: 2,
    question:
      "Can the JSON type contain 'undefined'?",
    code: "type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };",
    options: [
      "No, undefined is not a valid JSON value",
      "Yes, undefined is implicitly included",
      "Only in arrays",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "JSON has no undefined. The JSON specification defines only " +
      "string, number, boolean, null, array, and object as value types.",
  },

  // ─── Section 3: Deep operations ──────────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "What does Partial<T> NOT do?",
    options: [
      "Make properties optional",
      "Operate on the first level",
      "Make nested properties optional",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Partial<T> only works shallowly (first level). Nested " +
      "objects remain unchanged. For that you need DeepPartial.",
  },
  {
    sectionIndex: 3,
    question:
      "What happens when DeepPartial encounters an array field?",
    options: [
      "It depends on the implementation — without special handling the array is resolved as an object",
      "The array always remains unchanged",
      "Arrays are automatically converted to tuples",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Arrays are objects (typeof [] === 'object'). Without " +
      "special detection DeepPartial would resolve the array properties " +
      "(length, push, etc.).",
  },
  {
    sectionIndex: 3,
    question:
      "Which modifier makes properties readonly in a Mapped Type?",
    code: "type ReadonlyVersion<T> = { ??? [K in keyof T]: T[K] };",
    options: [
      "readonly",
      "const",
      "immutable",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "readonly before [K in keyof T] makes all properties immutable. " +
      "With -readonly you can remove readonly again.",
  },

  // ─── Section 4: Recursive Conditional Types ───────────────────────────────

  {
    sectionIndex: 4,
    question:
      "From which TypeScript version are recursive Conditional Types allowed?",
    options: [
      "TypeScript 4.1",
      "TypeScript 3.0",
      "TypeScript 5.0",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript 4.1 (November 2020) introduced Template Literal Types " +
      "and recursive Conditional Types.",
  },
  {
    sectionIndex: 4,
    question:
      "How do you split a string type at a dot?",
    code: "type Split = 'a.b' extends `${infer H}.${infer T}` ? [H, T] : never;",
    options: [
      "With Template Literal Types and infer",
      "With string.split() at the type level",
      "That's not possible in TypeScript",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Template Literal Types with infer can split strings at the type level: " +
      "`${infer Head}.${infer Tail}` matches 'a.b' to Head='a', Tail='b'.",
  },
  {
    sectionIndex: 4,
    question:
      "What does Paths<T> compute for type Paths<T> = T extends object ? ... : never?",
    options: [
      "All keys at the top level",
      "The depth of the object",
      "All possible dot-separated paths of the object",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Paths<T> computes all possible dot-separated paths, " +
      "e.g. Paths<{a: {b: string}}> = 'a' | 'a.b'.",
  },

  // ─── Section 5: Limits and Performance ────────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "What is the approximate recursion limit for TypeScript types?",
    options: [
      "10 levels",
      "Unlimited",
      "50 levels (without Tail Recursion Optimization)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "TypeScript stops at approximately 50 recursion levels. " +
      "With Tail Recursion Optimization (TS 4.5+) it goes up to ~1000.",
  },
  {
    sectionIndex: 5,
    question:
      "What is Tail Recursion in types?",
    options: [
      "A special syntax for recursion",
      "Recursion that works from back to front",
      "When the recursive call is the last operation and TypeScript can reuse the stack frame",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Tail Recursion Optimization allows deeper recursion " +
      "when the recursive call is in tail position.",
  },
  {
    sectionIndex: 5,
    question:
      "How do you count at the type level in TypeScript?",
    options: [
      "With the ++ operator",
      "I don't know",
      "With a Counter API",
      "Via the length of tuples as a counter",
    ],
    correct: 3,
    briefExplanation:
      "TypeScript has no arithmetic at the type level. " +
      "The workaround: use tuple length as a counter. " +
      "[unknown, unknown, unknown]['length'] = 3.",
  },

  // ─── Section 6: Practical Patterns ───────────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "Why does Zod need z.lazy() for recursive schemas?",
    options: [
      "Because TypeScript requires it",
      "I don't know",
      "Because z.lazy() validates faster",
      "Because JavaScript objects are created immediately and cannot reference themselves before completion",
    ],
    correct: 3,
    briefExplanation:
      "Types are evaluated lazily, but JavaScript objects are evaluated immediately. " +
      "z.lazy() delays the evaluation of the schema.",
  },
  {
    sectionIndex: 6,
    question:
      "When should you NOT use recursive types?",
    options: [
      "With JSON data",
      "I don't know",
      "With tree structures",
      "When the IDE noticeably slows down or the team doesn't understand the type",
    ],
    correct: 3,
    briefExplanation:
      "Recursive types are problematic when they blow up compile time " +
      "or are too complex for the team.",
  },
  {
    sectionIndex: 6,
    question:
      "Which library uses Paths<T> for type-safe form fields?",
    options: [
      "Lodash",
      "I don't know",
      "Express",
      "React Hook Form",
    ],
    correct: 3,
    briefExplanation:
      "React Hook Form uses Path<FormValues> so that register('address.street') " +
      "is type-safe and provides autocomplete.",
  },
];