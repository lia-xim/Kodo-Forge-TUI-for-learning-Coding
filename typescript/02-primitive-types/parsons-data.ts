/**
 * Lektion 02 — Parson's Problems: Primitive Types
 *
 * 3 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Exhaustive Switch, Type Narrowing, null-sichere Funktion
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Exhaustive Switch mit never ──────────────────────────────
  {
    id: "L02-P1",
    title: "Exhaustive Switch mit never",
    description:
      "Ordne die Zeilen so, dass ein exhaustive Switch entsteht, " +
      "der alle Faelle eines Union-Typs abdeckt und bei neuen Faellen " +
      "einen Compile-Fehler erzeugt.",
    correctOrder: [
      "type Color = 'red' | 'green' | 'blue';",
      "function getHex(color: Color): string {",
      "  switch (color) {",
      "    case 'red': return '#ff0000';",
      "    case 'green': return '#00ff00';",
      "    case 'blue': return '#0000ff';",
      "    default: const _exhaustive: never = color; return _exhaustive;",
      "  }",
      "}",
    ],
    distractors: [
      "    default: return 'unknown';",
      "    default: throw new Error(color);",
    ],
    hint:
      "Der never-Typ stellt sicher, dass der Switch alle Faelle abdeckt — " +
      "ein einfacher default mit String oder Error tut das nicht.",
    concept: "exhaustive-switch",
    difficulty: 2,
  },

  // ─── Problem 2: Type Narrowing Kette ─────────────────────────────────────
  {
    id: "L02-P2",
    title: "Type Narrowing Kette",
    description:
      "Ordne die Zeilen so, dass der Typ schrittweise eingegrenzt wird: " +
      "von unknown ueber typeof-Checks bis zum konkreten Typ.",
    correctOrder: [
      "function describe(value: unknown): string {",
      "  if (typeof value === 'string') {",
      "    return `String: ${value.toUpperCase()}`;",
      "  }",
      "  if (typeof value === 'number') {",
      "    return `Number: ${value.toFixed(2)}`;",
      "  }",
      "  return 'Unbekannter Typ';",
      "}",
    ],
    distractors: [
      "  if (value instanceof string) {",
    ],
    hint:
      "typeof prueft primitive Typen (string, number). " +
      "instanceof funktioniert nur mit Klassen, nicht mit primitiven Typen.",
    concept: "type-narrowing",
    difficulty: 2,
  },

  // ─── Problem 3: null-sichere Funktion ────────────────────────────────────
  {
    id: "L02-P3",
    title: "null-sichere Funktion",
    description:
      "Ordne die Zeilen so, dass eine Funktion entsteht, die null-sicher " +
      "die Laenge eines Strings zurueckgibt — mit dem Nullish Coalescing Operator.",
    correctOrder: [
      "function safeLength(text: string | null): number {",
      "  return text?.length ?? 0;",
      "}",
    ],
    distractors: [
      "  return text.length || 0;",
      "  return text?.length ? text.length : 0;",
    ],
    hint:
      "Der || Operator behandelt 0 als falsy — bei einem leeren String " +
      "waere text.length === 0, und || wuerde trotzdem 0 zurueckgeben. " +
      "Der ?? Operator prueft nur auf null/undefined.",
    concept: "nullish-coalescing",
    difficulty: 2,
  },
];
