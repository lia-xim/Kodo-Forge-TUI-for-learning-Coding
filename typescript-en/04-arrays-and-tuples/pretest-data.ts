```typescript
/**
 * Lektion 04 -- Pre-Test-Fragen: Arrays & Tuples
 *
 * 3 Fragen pro Sektion, die VOR dem Lesen der Sektion gestellt werden.
 * Ziel: Vorwissen aktivieren, Neugier wecken, Fehlkonzeptionen aufdecken.
 *
 * Sektionen:
 *   1 — Array-Grundlagen
 *   2 — Readonly Arrays
 *   3 — Tuples Grundlagen
 *   4 — Fortgeschrittene Tuples
 *   5 — Kovarianz und Sicherheit
 *   6 — Praxis-Patterns
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ═══════════════════════════════════════════════════════════════
  // Sektion 1: Array-Grundlagen
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 1,
    question: "What does TypeScript infer for this variable?",
    code: `const items = [1, "hello", true];`,
    options: [
      "[number, string, boolean]  (Tuple)",
      "(number | string | boolean)[]  (Array with Union)",
      "any[]",
      "unknown[]",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript does NOT infer a Tuple — it becomes an array with a Union type. " +
      "You'll learn why in Section 1.",
  },

  {
    sectionIndex: 1,
    question:
      "Is there a difference between 'number[]' and 'Array<number>'?",
    options: [
      "Yes — number[] is faster at runtime",
      "Yes — Array<number> has more methods",
      "No — both produce exactly the same type",
      "Yes — number[] is a Tuple, Array<number> is an Array",
    ],
    correct: 2,
    briefExplanation:
      "Both notations are identical. number[] is syntactic sugar " +
      "for Array<number> — and that means you're already using Generics!",
  },

  {
    sectionIndex: 1,
    question: "What is the type of 'result'?",
    code: `const nums: number[] = [1, 2, 3];
const result = nums.map(n => n.toString());`,
    options: [
      "number[]",
      "string[]",
      "(number | string)[]",
      "any[]",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript tracks .map() callbacks: n is number, n.toString() " +
      "returns string, so the result is string[].",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 2: Readonly Arrays
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 2,
    question: "Which operation is allowed on 'readonly number[]'?",
    code: `const nums: readonly number[] = [1, 2, 3];`,
    options: [
      "nums.push(4)",
      "nums[0] = 99",
      "nums.sort()",
      "nums.filter(n => n > 1)",
    ],
    correct: 3,
    briefExplanation:
      "filter() returns a NEW array and does not mutate the original. " +
      "push(), sort() and index assignment are blocked on readonly arrays.",
  },

  {
    sectionIndex: 2,
    question:
      "Can a 'string[]' be assigned to a variable of type 'readonly string[]'?",
    options: [
      "Yes — mutable to readonly is safe (removing rights)",
      "No — the types are incompatible",
      "Only with a Type Assertion (as readonly string[])",
      "Only if the array is empty",
    ],
    correct: 0,
    briefExplanation:
      "mutable -> readonly is allowed (giving fewer rights). " +
      "But readonly -> mutable does NOT work (you could then mutate it).",
  },

  {
    sectionIndex: 2,
    question:
      "Does 'readonly' also prevent the array from being modified at runtime?",
    options: [
      "Yes — readonly arrays are automatically frozen (Object.freeze)",
      "Yes — .push() throws a runtime error",
      "No — readonly only exists in the type system and is removed during compilation",
      "Partially — .push() is blocked, but index access works",
    ],
    correct: 2,
    briefExplanation:
      "Type Erasure! All TypeScript types disappear at runtime. " +
      "readonly is purely compile-time — at runtime it's a normal array.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 3: Tuples Grundlagen
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 3,
    question: "What type does 'tup.length' have?",
    code: `const tup: [string, number, boolean] = ["hi", 42, true];
const len = tup.length;`,
    options: [
      "number",
      "3",
      "1 | 2 | 3",
      "number | undefined",
    ],
    correct: 1,
    briefExplanation:
      "For Tuples, .length is a literal type! The Tuple has a fixed length of 3, " +
      "so the type of .length is exactly 3 (not number).",
  },

  {
    sectionIndex: 3,
    question: "What happens here?",
    code: `const pair: [string, number] = ["hello", 42];
pair.push("world");`,
    options: [
      "Compile error: push is not allowed on Tuples",
      "Compile error: 'world' is not string | number... actually it is, it's allowed!",
      "No compile error: push accepts string | number on mutable Tuples",
      "Runtime error: Tuples have a fixed length",
    ],
    correct: 2,
    briefExplanation:
      "push() is allowed on mutable Tuples and accepts the union " +
      "of all element types (string | number). This is a known " +
      "security gap — readonly Tuples prevent this.",
  },

  {
    sectionIndex: 3,
    question: "What do labels do in a Tuple type?",
    code: `type Point = [x: number, y: number];`,
    options: [
      "You can write point.x instead of point[0]",
      "They change the type — [x: number, y: number] is different from [number, number]",
      "They are purely documentary — they only improve IDE tooltips",
      "They make the Tuple readonly",
    ],
    correct: 2,
    briefExplanation:
      "Labels are purely documentary. They don't affect the type — " +
      "[x: number, y: number] and [number, number] are identical.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 4: Fortgeschrittene Tuples
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 4,
    question: "What type does 'as const' produce?",
    code: `const config = ["localhost", 3000] as const;`,
    options: [
      "(string | number)[]",
      "[string, number]",
      "readonly [string, number]",
      'readonly ["localhost", 3000]',
    ],
    correct: 3,
    briefExplanation:
      "'as const' does two things: (1) readonly Tuple and (2) literal types. " +
      'So: readonly ["localhost", 3000] — not readonly [string, number]!',
  },

  {
    sectionIndex: 4,
    question: "What happens when spreading a Tuple?",
    code: `const pair: [string, number] = ["hello", 42];
const copy = [...pair];`,
    options: [
      "copy has the type (string | number)[]",
      "copy has the type readonly [string, number]",
      "copy has the type [string, number]",
      "Compile error: spread on Tuples not allowed",
    ],
    correct: 0,
    briefExplanation:
      "Spreading a Tuple LOSES the Tuple type! TypeScript instead infers " +
      "(string | number)[]. This is a common pitfall.",
  },

  {
    sectionIndex: 4,
    question: "Which values are valid for this type?",
    code: `type T = [string, ...number[]];`,
    options: [
      '["hello", 1, 2, 3] only — at least one number required',
      '["hello"] only — rest element can be empty',
      '[] — empty array is also valid',
      '["hello"], ["hello", 1], ["hello", 1, 2, 3] — all valid',
    ],
    correct: 3,
    briefExplanation:
      "A rest element (...number[]) can have 0 or more elements. " +
      'So: ["hello"] with 0 numbers is valid, an empty [] is not ' +
      "(the string is missing).",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 5: Kovarianz und Sicherheit
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 5,
    question: "Is this assignment allowed?",
    code: `const narrow: ("admin" | "mod")[] = ["admin", "mod"];
const wide: string[] = narrow;`,
    options: [
      "Yes — a subtype array can be assigned to a wider array",
      "No — the types are not compatible",
      "Only with 'as string[]'",
      "Yes, but only for readonly arrays",
    ],
    correct: 0,
    briefExplanation:
      "That's covariance: (\"admin\" | \"mod\")[] is a subtype of string[]. " +
      "But be careful — via 'wide' you could now push arbitrary strings!",
  },

  {
    sectionIndex: 5,
    question:
      "With 'noUncheckedIndexedAccess: true' — what type does 'val' have?",
    code: `const arr: string[] = ["hello"];
const val = arr[0];`,
    options: [
      "string",
      "string | undefined",
      "string | null",
      '"hello"',
    ],
    correct: 1,
    briefExplanation:
      "With this compiler option, every index access on arrays " +
      "is treated as potentially undefined — including arr[0].",
  },

  {
    sectionIndex: 5,
    question:
      "Why does 'readonly' solve the covariance problem with arrays?",
    options: [
      "Because readonly arrays are slower and TypeScript treats them differently",
      "Because a readonly array cannot be mutated — no push() possible",
      "Because readonly completely prohibits assignment of subtypes",
      "readonly doesn't solve the problem at all",
    ],
    correct: 1,
    briefExplanation:
      "If no one can mutate the array, covariance is safe. " +
      "The problem only arises when mutating through the wider type.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 6: Praxis-Patterns
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 6,
    question: "What type does 'result' have?",
    code: `const mixed: (string | null)[] = ["a", null, "b", null];
const result = mixed.filter(x => x !== null);`,
    options: [
      "string[]",
      "(string | null)[]",
      "NonNullable<string | null>[]",
      "never[]",
    ],
    correct: 0,
    briefExplanation:
      "From TypeScript 5.5, filter() automatically recognizes Inferred Type Predicates " +
      "for simple null checks. The callback `x => x !== null` is inferred as a type guard, " +
      "so the result is string[].",
  },

  {
    sectionIndex: 6,
    question: "What is the best type annotation for an array parameter " +
      "that should not be modified?",
    code: `function sum(numbers: ???) {
  return numbers.reduce((a, b) => a + b, 0);
}`,
    options: [
      "number[]",
      "Array<number>",
      "const number[]",
      "readonly number[]",
    ],
    correct: 3,
    briefExplanation:
      "'readonly number[]' signals to the caller that the function " +
      "does not modify the array. Bonus: you can also pass readonly arrays.",
  },

  {
    sectionIndex: 6,
    question: "What does 'satisfies' do in combination with 'as const'?",
    code: `const ROLES = ["admin", "user", "guest"] as const satisfies readonly string[];`,
    options: [
      "It validates the structure but retains the narrow literal types",
      "It makes no difference at all",
      "It converts the values into strings",
      "It removes the readonly",
    ],
    correct: 0,
    briefExplanation:
      "'satisfies' checks at compile-time that the value matches a wider type " +
      "— WITHOUT losing the literal types.",
  },
];
```