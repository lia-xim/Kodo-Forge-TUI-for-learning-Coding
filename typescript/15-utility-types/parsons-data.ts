/**
 * Lektion 15 — Parson's Problems: Utility Types
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L15-P1",
    title: "StrictOmit implementieren",
    description: "Ordne die Zeilen zu einem typsicheren StrictOmit, der nur existierende Keys akzeptiert.",
    correctOrder: [
      "type StrictOmit<T, K extends keyof T> = Omit<T, K>;",
      "",
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  password: string;",
      "}",
      "",
      "type SafeUser = StrictOmit<User, 'password'>;",
      "// { id: number; name: string }",
    ],
    distractors: [
      "type StrictOmit<T, K extends string> = Omit<T, K>;",
      "type SafeUser = Omit<User, 'pasword'>;",
    ],
    hint: "K muss keyof T extenden (nicht string), damit nur existierende Keys akzeptiert werden. StrictOmit erkennt dann Tippfehler.",
    concept: "strict-omit",
    difficulty: 2,
  },

  {
    id: "L15-P2",
    title: "DeepPartial implementieren",
    description: "Ordne die Zeilen zu einem rekursiven DeepPartial-Typ.",
    correctOrder: [
      "type DeepPartial<T> = T extends (infer U)[]",
      "  ? DeepPartial<U>[]",
      "  : T extends object",
      "    ? { [P in keyof T]?: DeepPartial<T[P]> }",
      "    : T;",
    ],
    distractors: [
      "  ? Partial<U>[]",
      "    ? { [P in keyof T]: DeepPartial<T[P]> }",
    ],
    hint: "Arrays muessen separat behandelt werden (infer U). Objekte brauchen ? fuer optional UND Rekursion. Primitives bleiben unveraendert.",
    concept: "deep-partial",
    difficulty: 4,
  },

  {
    id: "L15-P3",
    title: "PartialExcept-Pattern aufbauen",
    description: "Ordne die Zeilen zum PartialExcept-Pattern: K bleibt required, Rest wird optional.",
    correctOrder: [
      "type PartialExcept<T, K extends keyof T> =",
      "  Pick<T, K> & Partial<Omit<T, K>>;",
      "",
      "interface Task {",
      "  id: number;",
      "  title: string;",
      "  done: boolean;",
      "}",
      "",
      "type TaskUpdate = PartialExcept<Task, 'id'>;",
      "// { id: number } & { title?: string; done?: boolean }",
    ],
    distractors: [
      "  Omit<T, K> & Partial<Pick<T, K>>;",
      "type TaskUpdate = Partial<Task>;",
    ],
    hint: "Pick<T, K> behaelt K als required. Partial<Omit<T, K>> macht den REST optional. Die Intersection (&) vereint beides.",
    concept: "partial-except-pattern",
    difficulty: 3,
  },

  {
    id: "L15-P4",
    title: "Awaited + ReturnType fuer async Funktion",
    description: "Ordne die Zeilen um den 'wahren' Rueckgabetyp einer async Funktion zu extrahieren.",
    correctOrder: [
      "async function fetchProducts() {",
      "  return [",
      "    { id: 1, name: 'Widget', price: 9.99 },",
      "    { id: 2, name: 'Gadget', price: 19.99 },",
      "  ];",
      "}",
      "",
      "type Products = Awaited<ReturnType<typeof fetchProducts>>;",
      "// { id: number; name: string; price: number }[]",
    ],
    distractors: [
      "type Products = ReturnType<typeof fetchProducts>;",
      "type Products = Awaited<typeof fetchProducts>;",
    ],
    hint: "ReturnType allein gibt Promise<...>. typeof ist noetig weil fetchProducts ein Wert ist. Awaited entpackt das Promise.",
    concept: "awaited-returntype",
    difficulty: 2,
  },
];
