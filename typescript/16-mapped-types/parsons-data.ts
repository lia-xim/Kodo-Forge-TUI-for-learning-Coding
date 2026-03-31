/**
 * Lektion 16 — Parson's Problems: Mapped Types
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L16-P1",
    title: "Getters<T> mit Key Remapping",
    description: "Ordne die Zeilen zu einem Mapped Type der Getter-Methoden generiert.",
    correctOrder: [
      "type Getters<T> = {",
      "  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];",
      "};",
    ],
    distractors: [
      "  [K in keyof T as `get${K}`]: () => T[K];",
      "  [K in keyof T]: () => T[K];",
    ],
    hint: "Key Remapping braucht 'as' und Capitalize macht den ersten Buchstaben gross. string & K filtert auf String-Keys.",
    concept: "key-remapping-template-literals",
    difficulty: 3,
  },
  {
    id: "L16-P2",
    title: "OmitByType<T, U>",
    description: "Ordne die Zeilen zu einem Mapped Type der Properties nach Wert-Typ filtert.",
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
    hint: "never muss im KEY Remapping stehen (as-Clause), nicht im Wert-Typ. Und es ist never fuer den zu entfernenden Fall.",
    concept: "key-filtering-never",
    difficulty: 3,
  },
  {
    id: "L16-P3",
    title: "DeepReadonly<T> — Rekursiver Mapped Type",
    description: "Ordne die Zeilen zu einem rekursiven DeepReadonly-Typ.",
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
    hint: "Zuerst object-Check, dann Function-Guard (Funktionen nicht einpacken), dann Rekursion fuer echte Objekte, sonst Primitive direkt.",
    concept: "recursive-mapped-type",
    difficulty: 4,
  },
  {
    id: "L16-P4",
    title: "FormState<T> — Praxis-Pattern",
    description: "Ordne die Zeilen zu einem vollstaendigen Form-State-System.",
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
    hint: "FormErrors hat ? (optionaler Fehler pro Feld). FormTouched hat keinen ? (jedes Feld hat touched-Status). errors nutzt FormErrors<T>, nicht Record.",
    concept: "form-state-pattern",
    difficulty: 2,
  },
];
