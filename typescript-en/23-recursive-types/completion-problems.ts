/**
 * Lesson 23 — Completion Problems: Recursive Types
 *
 * Code templates with strategic gaps (______).
 * The learner fills in the gaps — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code with ______ as placeholder for gaps */
  template: string;
  /** Solution with filled gaps */
  solution: string;
  /** Which gap has which answer */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Related concept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: LinkedList Type (easy) ────────────────────────────────────────────
  {
    id: "23-cp-linked-list",
    title: "Define LinkedList Type",
    description:
      "Complete the definition of a recursive LinkedList type " +
      "with a value and a reference to the next node.",
    template: `type LinkedList<T> = {
  value: ______;
  next: ______ | ______;
};

const list: LinkedList<number> = {
  value: 1,
  next: { value: 2, next: { value: 3, next: ______ } },
};`,
    solution: `type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

const list: LinkedList<number> = {
  value: 1,
  next: { value: 2, next: { value: 3, next: null } },
};`,
    blanks: [
      { placeholder: "______ (value type)", answer: "T", hint: "The generic parameter for the value" },
      { placeholder: "______ (next type)", answer: "LinkedList<T>", hint: "Self-reference — the next node has the same type" },
      { placeholder: "______ (terminator)", answer: "null", hint: "The termination condition — the end of the list" },
      { placeholder: "______ (last next)", answer: "null", hint: "The last node has no next" },
    ],
    concept: "Recursive Type Definition",
  },

  // ─── 2: JSON Type (easy-medium) ───────────────────────────────────────────
  {
    id: "23-cp-json-type",
    title: "Complete JSON Type",
    description:
      "Complete the recursive JSON type that covers all valid " +
      "JSON values.",
    template: `type JsonValue =
  | string
  | number
  | ______
  | null
  | ______[]
  | { [key: ______]: ______ };`,
    solution: `type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };`,
    blanks: [
      { placeholder: "______ (primitive)", answer: "boolean", hint: "The third primitive JSON type alongside string and number" },
      { placeholder: "______[] (array element)", answer: "JsonValue", hint: "JSON arrays contain JSON values — self-reference!" },
      { placeholder: "______ (key type)", answer: "string", hint: "JSON object keys are always strings" },
      { placeholder: "______ (value type)", answer: "JsonValue", hint: "JSON object values are again JSON values — self-reference!" },
    ],
    concept: "JSON as a recursive type",
  },

  // ─── 3: DeepPartial (medium) ──────────────────────────────────────────────
  {
    id: "23-cp-deep-partial",
    title: "Implement DeepPartial",
    description:
      "Complete DeepPartial — all properties should become " +
      "optional at all levels.",
    template: `type DeepPartial<T> = {
  [K in keyof T]______: T[K] extends ______
    ? DeepPartial<______>
    : T[K];
};`,
    solution: `type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};`,
    blanks: [
      { placeholder: "______ (modifier)", answer: "?", hint: "Which character makes a property optional?" },
      { placeholder: "______ (condition)", answer: "object", hint: "Check if the value is an object to recurse deeper" },
      { placeholder: "______ (recursion arg)", answer: "T[K]", hint: "Which type should DeepPartial be applied to recursively?" },
    ],
    concept: "Recursive Utility Types",
  },

  // ─── 4: Flatten (medium) ──────────────────────────────────────────────────
  {
    id: "23-cp-flatten",
    title: "Implement Flatten Type",
    description:
      "Complete the Flatten type that removes all array levels.",
    template: `type Flatten<T> = T extends (______ U)[]
  ? ______<U>
  : ______;`,
    solution: `type Flatten<T> = T extends (infer U)[]
  ? Flatten<U>
  : T;`,
    blanks: [
      { placeholder: "______ (keyword)", answer: "infer", hint: "Which keyword extracts a type from a pattern?" },
      { placeholder: "______ (recursion)", answer: "Flatten", hint: "Self-reference — check if U itself is an array" },
      { placeholder: "______ (base case)", answer: "T", hint: "If T is not an array, return it directly" },
    ],
    concept: "Recursive Conditional Types",
  },

  // ─── 5: Paths (hard) ──────────────────────────────────────────────────────
  {
    id: "23-cp-paths",
    title: "Implement Paths Type",
    description:
      "Complete the Paths type that computes all dot-separated " +
      "paths of an object.",
    template: `type Paths<T> = T extends object
  ? {
      [K in keyof T & ______]:
        | K
        | \`\${K}.______\`
    }[keyof T & string]
  : ______;`,
    solution: `type Paths<T> = T extends object
  ? {
      [K in keyof T & string]:
        | K
        | \`\${K}.\${Paths<T[K]>}\`
    }[keyof T & string]
  : never;`,
    blanks: [
      { placeholder: "______ (key constraint)", answer: "string", hint: "Only string keys can be used in paths" },
      { placeholder: "______ (recursion)", answer: "${Paths<T[K]>}", hint: "Recursion: compute the sub-paths of the current key" },
      { placeholder: "______ (base case)", answer: "never", hint: "Primitive types have no paths — which bottom type fits?" },
    ],
    concept: "Type-safe object paths",
  },

  // ─── 6: PathValue (hard) ──────────────────────────────────────────────────
  {
    id: "23-cp-path-value",
    title: "Implement PathValue Type",
    description:
      "Complete the PathValue type that determines the value type at a " +
      "dot-separated path.",
    template: `type PathValue<T, P extends string> =
  P extends \`\${infer Head}.______\`
    ? Head extends keyof T
      ? PathValue<______, ______>
      : never
    : P extends keyof T
      ? ______
      : never;`,
    solution: `type PathValue<T, P extends string> =
  P extends \`\${infer Head}.\${infer Tail}\`
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      : never
    : P extends keyof T
      ? T[P]
      : never;`,
    blanks: [
      { placeholder: "______ (rest pattern)", answer: "${infer Tail}", hint: "Extract the rest of the path after the dot" },
      { placeholder: "______ (deeper type)", answer: "T[Head]", hint: "Navigate one level deeper in the type" },
      { placeholder: "______ (rest path)", answer: "Tail", hint: "The remaining path for the recursion" },
      { placeholder: "______ (leaf value)", answer: "T[P]", hint: "No more dot: P is the last key, return the value" },
    ],
    concept: "Recursive string decomposition",
  },
];