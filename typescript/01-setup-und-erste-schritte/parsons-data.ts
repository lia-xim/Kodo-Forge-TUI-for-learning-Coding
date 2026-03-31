/**
 * Lektion 01 — Parson's Problems: Setup & Erste Schritte
 *
 * 3 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Type Guards, Interfaces, tsconfig.json
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Type Guard Funktion ──────────────────────────────────────
  {
    id: "L01-P1",
    title: "Type Guard Funktion",
    description:
      "Ordne die Zeilen so, dass eine Type-Guard-Funktion entsteht, " +
      "die prüft ob ein Wert ein String ist und seine Laenge zurueckgibt.",
    correctOrder: [
      "function getLength(value: unknown): number {",
      "  if (typeof value === 'string') {",
      "    return value.length;",
      "  }",
      "  return 0;",
      "}",
    ],
    distractors: [
      "  if (value instanceof String) {",
      "  return value.size;",
    ],
    hint: "typeof prueft primitive Typen — instanceof prueft Klassen-Instanzen.",
    concept: "type-guards",
    difficulty: 1,
  },

  // ─── Problem 2: Interface + Objekt ───────────────────────────────────────
  {
    id: "L01-P2",
    title: "Interface definieren und verwenden",
    description:
      "Ordne die Zeilen so, dass ein Interface 'User' definiert " +
      "und ein Objekt davon erstellt wird.",
    correctOrder: [
      "interface User {",
      "  name: string;",
      "  age: number;",
      "}",
      "const alice: User = {",
      "  name: 'Alice',",
      "  age: 30,",
      "};",
    ],
    distractors: [
      "class User {",
    ],
    hint: "Interfaces beginnen mit dem Schluesselwort 'interface', nicht 'class'.",
    concept: "interfaces",
    difficulty: 1,
  },

  // ─── Problem 3: tsconfig.json Reihenfolge ────────────────────────────────
  {
    id: "L01-P3",
    title: "tsconfig.json Grundstruktur",
    description:
      "Ordne die Zeilen zu einer gueltigen tsconfig.json mit " +
      "strict-Mode und ES2022-Target.",
    correctOrder: [
      "{",
      '  "compilerOptions": {',
      '    "target": "ES2022",',
      '    "strict": true,',
      '    "noEmit": true',
      "  }",
      "}",
    ],
    distractors: [
      '    "strict": "yes",',
      '  "options": {',
    ],
    hint: "'strict' ist ein Boolean (true/false), kein String.",
    concept: "tsconfig",
    difficulty: 1,
  },
];
