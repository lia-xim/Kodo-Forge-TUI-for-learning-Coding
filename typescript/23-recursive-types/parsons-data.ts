/**
 * Lektion 23 — Parson's Problems: Recursive Types
 *
 * 4 Problems zum Ordnen von Code-Zeilen.
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: LinkedList traversieren ───────────────────────────────────
  {
    id: "L23-P1",
    title: "LinkedList zu Array konvertieren",
    description:
      "Ordne die Zeilen so, dass eine Funktion entsteht die alle " +
      "Werte einer LinkedList in ein Array sammelt.",
    correctOrder: [
      "type LinkedList<T> = { value: T; next: LinkedList<T> | null };",
      "function toArray<T>(list: LinkedList<T>): T[] {",
      "  const result: T[] = [];",
      "  let current: LinkedList<T> | null = list;",
      "  while (current !== null) {",
      "    result.push(current.value);",
      "    current = current.next;",
      "  }",
      "  return result;",
      "}",
    ],
    distractors: [
      "  let current: LinkedList<T> = list.next;",
      "  while (current !== undefined) {",
    ],
    hint:
      "Die Traversierung beginnt beim uebergebenen Knoten (nicht bei next). " +
      "Die Schleife laeuft solange current nicht null ist.",
    concept: "linked-list-traversal",
    difficulty: 2,
  },

  // ─── Problem 2: DeepPartial ──────────────────────────────────────────────
  {
    id: "L23-P2",
    title: "DeepPartial mit Array-Behandlung",
    description:
      "Ordne die Zeilen so, dass ein DeepPartial-Typ entsteht der " +
      "Arrays korrekt behandelt.",
    correctOrder: [
      "type DeepPartial<T> = {",
      "  [K in keyof T]?: T[K] extends (infer U)[]",
      "    ? DeepPartial<U>[]",
      "    : T[K] extends object",
      "      ? DeepPartial<T[K]>",
      "      : T[K];",
      "};",
    ],
    distractors: [
      "  [K in keyof T]?: T[K] extends object",
      "    ? DeepPartial<T[K]>[]",
    ],
    hint:
      "Arrays muessen VOR dem object-Check erkannt werden, " +
      "weil Arrays auch Objekte sind. Die Reihenfolge der " +
      "extends-Pruefungen ist entscheidend.",
    concept: "deep-partial-with-arrays",
    difficulty: 3,
  },

  // ─── Problem 3: Flatten-Typ ──────────────────────────────────────────────
  {
    id: "L23-P3",
    title: "Flatten-Typ mit Tiefen-Limit",
    description:
      "Ordne die Zeilen so, dass ein Flatten-Typ mit kontrollierbarer " +
      "Tiefe entsteht.",
    correctOrder: [
      "type MinusOne<N extends number> = [never, 0, 1, 2, 3, 4, 5][N];",
      "type FlatN<T, Depth extends number> =",
      "  Depth extends 0",
      "    ? T",
      "    : T extends readonly (infer Inner)[]",
      "      ? FlatN<Inner, MinusOne<Depth>>",
      "      : T;",
    ],
    distractors: [
      "    : T extends (infer Inner)",
      "      ? FlatN<Inner[], MinusOne<Depth>>",
    ],
    hint:
      "Zuerst die Abbruchbedingung (Depth === 0), dann die Array-Pruefung " +
      "mit infer, dann die Rekursion mit verringerter Tiefe.",
    concept: "flatten-with-depth",
    difficulty: 3,
  },

  // ─── Problem 4: Typsicherer deep-get ─────────────────────────────────────
  {
    id: "L23-P4",
    title: "Typsicherer deep-get mit Paths",
    description:
      "Ordne die Zeilen so, dass eine typsichere get-Funktion entsteht " +
      "die auf verschachtelte Objekt-Properties zugreift.",
    correctOrder: [
      "type Paths<T> = T extends object",
      "  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]",
      "  : never;",
      "type PathValue<T, P extends string> =",
      "  P extends `${infer H}.${infer R}` ? (H extends keyof T ? PathValue<T[H], R> : never)",
      "  : P extends keyof T ? T[P] : never;",
      "function get<T extends object, P extends Paths<T> & string>(obj: T, path: P): PathValue<T, P> {",
      "  return path.split('.').reduce((acc, key) => (acc as any)[key], obj as any) as PathValue<T, P>;",
      "}",
    ],
    distractors: [
      "  ? { [K in keyof T]: K | `${K}.${Paths<T[K]>}` }[keyof T]",
      "function get<T, P extends string>(obj: T, path: P): unknown {",
    ],
    hint:
      "Erst Paths definieren, dann PathValue, dann die get-Funktion. " +
      "Beachte: keyof T & string filtert nur String-Schluessel. " +
      "Die get-Funktion constrainted P auf Paths<T> & string.",
    concept: "type-safe-deep-get",
    difficulty: 4,
  },
];
