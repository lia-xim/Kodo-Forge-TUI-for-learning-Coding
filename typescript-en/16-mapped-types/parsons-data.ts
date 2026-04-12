/**
 * Lesson 16 — Parson's Problems: Mapped Types
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L16-P1",
    title: "Getters<T> with Key Remapping",
    description: "Arrange the lines into a Mapped Type that generates getter methods.",
    correctOrder: [
      "type Getters<T> = {",
      "  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];",
      "};",
    ],
    distractors: [
      "  [K in keyof T as `get${K}`]: () => T[K];",
      "  [K in keyof T]: () => T[K];",
    ],
    hint: "Key Remapping requires 'as' and Capitalize capitalizes the first letter. string & K filters to string keys.",
    concept: "key-remapping-template-literals",
    difficulty: 3,
  },
  {
    id: "L16-P2",
    title: "OmitByType<T, U>",
    description: "Arrange the lines into a Mapped Type that filters properties by value type.",
    correctOrder: [
      "type OmitByType<T, U> = {",
      "  [K in keyof T as T[K] extends U ? never : K]: T[K];",
      "};",
      "",
      "interface Mixed { name: string; count: number; active: boolean; }",
      "type WithoutStrings = OmitByType<Mixed, string>;",
      "// { count: number; active: boolean; }",
    ],
    distractors: [
      "  [K in keyof T]: T[K] extends U ? never : T[K];",
      "  [K in keyof T as T[K] extends U ? K : never]: T[K];",
    ],
    hint: "never must go in the KEY remapping (as-clause), not in the value type. And it is never for the case to be removed.",
    concept: "key-filtering-never",
    difficulty: 3,
  },
  {
    id: "L16-P3",
    title: "DeepReadonly<T> — Recursive Mapped Type",
    description: "Arrange the lines into a recursive DeepReadonly type.",
    correctOrder: [
      "type DeepReadonly<T> = {",
      "  readonly [K in keyof T]: T[K] extends object",
      "    ? T[K] extends Function",
      "      ? T[K]",
      "      : DeepReadonly<T[K]>",
      "    : T[K];",
      "};",
    ],
    distractors: [
      "    ? DeepReadonly<T[K]>",
      "  readonly [K in keyof T]: DeepReadonly<T[K]>;",
    ],
    hint: "First the object check, then the Function guard (don't wrap functions), then recursion for real objects, otherwise primitives directly.",
    concept: "recursive-mapped-type",
    difficulty: 4,
  },
  {
    id: "L16-P4",
    title: "FormState<T> — Practical Pattern",
    description: "Arrange the lines into a complete form state system.",
    correctOrder: [
      "type FormErrors<T> = { [K in keyof T]?: string };",
      "type FormTouched<T> = { [K in keyof T]: boolean };",
      "",
      "interface FormState<T> {",
      "  values: T;",
      "  errors: FormErrors<T>;",
      "  touched: FormTouched<T>;",
      "  isValid: boolean;",
      "}",
    ],
    distractors: [
      "type FormErrors<T> = { [K in keyof T]: string };",
      "  errors: Record<string, string>;",
    ],
    hint: "FormErrors has ? (optional error per field). FormTouched has no ? (every field has a touched status). errors uses FormErrors<T>, not Record.",
    concept: "form-state-pattern",
    difficulty: 2,
  },
];