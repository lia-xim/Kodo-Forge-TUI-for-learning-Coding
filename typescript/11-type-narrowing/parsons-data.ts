/**
 * Lektion 11 — Parson's Problems: Type Narrowing
 *
 * 4 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: typeof Guard, in-Operator, Type Predicate, Exhaustive Switch
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: typeof Narrowing-Kette ──────────────────────────────────
  {
    id: "L11-P1",
    title: "typeof Narrowing-Kette fuer unknown",
    description:
      "Ordne die Zeilen so, dass ein unknown-Wert schrittweise durch " +
      "typeof-Checks genarrowed wird. Beachte: null muss VOR typeof " +
      "object geprueft werden!",
    correctOrder: [
      "function describe(value: unknown): string {",
      "  if (value === null) return 'null';",
      "  if (typeof value === 'string') return `String: ${value}`;",
      "  if (typeof value === 'number') return `Number: ${value}`;",
      "  if (typeof value === 'object') return 'Object';",
      "  return 'Other';",
      "}",
    ],
    distractors: [
      "  if (typeof value === 'null') return 'null';",
      "  if (value instanceof string) return `String: ${value}`;",
    ],
    hint:
      "typeof null gibt 'object' zurueck, nicht 'null'. " +
      "Und instanceof funktioniert nicht mit primitiven Typen — " +
      "verwende typeof fuer string, number, etc.",
    concept: "typeof-narrowing",
    difficulty: 2,
  },

  // ─── Problem 2: Discriminated Union mit in-Operator ──────────────────────
  {
    id: "L11-P2",
    title: "Discriminated Union mit in-Operator",
    description:
      "Ordne die Zeilen so, dass die Flaeche verschiedener Formen " +
      "berechnet wird. Verwende den in-Operator fuer Narrowing.",
    correctOrder: [
      "interface Circle { radius: number }",
      "interface Rect { width: number; height: number }",
      "type Shape = Circle | Rect;",
      "function area(shape: Shape): number {",
      "  if ('radius' in shape) {",
      "    return Math.PI * shape.radius ** 2;",
      "  }",
      "  return shape.width * shape.height;",
      "}",
    ],
    distractors: [
      "  if (shape instanceof Circle) {",
      "  if (typeof shape === 'Circle') {",
    ],
    hint:
      "Circle ist ein Interface, keine Klasse — instanceof funktioniert " +
      "nicht. typeof gibt fuer Objekte immer 'object' zurueck, nicht " +
      "den Interface-Namen. Verwende den in-Operator!",
    concept: "in-operator",
    difficulty: 2,
  },

  // ─── Problem 3: Custom Type Guard ────────────────────────────────────────
  {
    id: "L11-P3",
    title: "Custom Type Guard fuer API-Daten",
    description:
      "Ordne die Zeilen so, dass ein Type Guard entsteht, der " +
      "unbekannte Daten als User validiert.",
    correctOrder: [
      "interface User { name: string; age: number }",
      "function isUser(data: unknown): data is User {",
      "  if (typeof data !== 'object' || data === null) return false;",
      "  const obj = data as Record<string, unknown>;",
      "  return typeof obj.name === 'string' && typeof obj.age === 'number';",
      "}",
    ],
    distractors: [
      "function isUser(data: unknown): boolean {",
      "  return data instanceof User;",
    ],
    hint:
      "Ein Type Guard muss 'data is User' als Rueckgabetyp haben, " +
      "nicht nur boolean — sonst narrowt TypeScript nicht. " +
      "Und instanceof funktioniert nicht mit Interfaces!",
    concept: "type-predicates",
    difficulty: 3,
  },

  // ─── Problem 4: Exhaustive Switch mit assertNever ────────────────────────
  {
    id: "L11-P4",
    title: "Exhaustive Switch mit assertNever",
    description:
      "Ordne die Zeilen so, dass ein exhaustive Switch entsteht. " +
      "Der default-Zweig mit assertNever stellt sicher, dass " +
      "alle Faelle abgedeckt sind.",
    correctOrder: [
      "function assertNever(value: never): never {",
      "  throw new Error(`Unbehandelt: ${value}`);",
      "}",
      "type Status = 'active' | 'paused' | 'stopped';",
      "function icon(status: Status): string {",
      "  switch (status) {",
      "    case 'active':  return '▶';",
      "    case 'paused':  return '⏸';",
      "    case 'stopped': return '⏹';",
      "    default: return assertNever(status);",
      "  }",
      "}",
    ],
    distractors: [
      "    default: return 'unknown';",
      "    default: throw new Error(status);",
    ],
    hint:
      "assertNever erwartet never als Parameter — das funktioniert " +
      "nur wenn alle Faelle abgedeckt sind. Ein einfacher default " +
      "mit string oder Error bietet KEINEN Compile-Schutz bei " +
      "neuen Union-Werten.",
    concept: "exhaustive-checks",
    difficulty: 3,
  },
];
