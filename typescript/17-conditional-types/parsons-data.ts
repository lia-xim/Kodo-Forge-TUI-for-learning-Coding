/**
 * Lektion 17 — Parson's Problems: Conditional Types
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  { id: "L17-P1", title: "UnpackPromise mit infer", description: "Ordne die Zeilen zu einem Typ der den inneren Typ eines Promise extrahiert.", correctOrder: ["type UnpackPromise<T> =", "  T extends Promise<infer U>", "    ? U", "    : T;"], distractors: ["  T extends Promise<T>", "    ? T"], hint: "infer U deklariert die Variable. Bei Match wird U zurueckgegeben, sonst T.", concept: "infer-promise", difficulty: 2 },
  { id: "L17-P2", title: "Rekursives Flatten", description: "Ordne die Zeilen zu einem rekursiven Array-Flatten-Typ.", correctOrder: ["type Flatten<T> =", "  T extends (infer U)[]", "    ? Flatten<U>", "    : T;"], distractors: ["    ? U", "  T extends infer U[]"], hint: "Rekursion: Flatten<U> ruft sich selbst auf. (infer U)[] — Klammern um infer U!", concept: "recursive-flatten", difficulty: 3 },
  { id: "L17-P3", title: "Extract nachbauen", description: "Ordne die Zeilen zum distributiven Extract-Typ.", correctOrder: ["type MyExtract<T, U> =", "  T extends U", "    ? T", "    : never;", "", "type Result = MyExtract<'a' | 'b' | 'c', 'a' | 'c'>;", "// 'a' | 'c'"], distractors: ["    ? U", "    ? never"], hint: "Extract BEHAELT Member die U matchen (T zurueckgeben), entfernt andere (never).", concept: "distributive-extract", difficulty: 2 },
];
