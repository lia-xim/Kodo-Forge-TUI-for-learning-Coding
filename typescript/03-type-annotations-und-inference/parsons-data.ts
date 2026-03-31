/**
 * Lektion 03 — Parson's Problems: Type Annotations & Inference
 *
 * 4 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Generic mit Constraint, satisfies + as const, Contextual Typing
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Generic mit Constraint ──────────────────────────────────
  {
    id: "L03-P1",
    title: "Generic Funktion mit extends-Constraint",
    description:
      "Ordne die Zeilen so, dass eine generische Funktion entsteht, " +
      "die nur Objekte mit einer 'id'-Property akzeptiert und die ID zurueckgibt.",
    correctOrder: [
      "function getId<T extends { id: number }>(item: T): number {",
      "  return item.id;",
      "}",
      "",
      "const user = { id: 1, name: 'Alice' };",
      "const result = getId(user); // number",
    ],
    distractors: [
      "function getId<T>(item: T): number {",
      "function getId(item: { id: number }): number {",
    ],
    hint:
      "T extends { id: number } ist ein Generic Constraint — es stellt sicher, " +
      "dass T mindestens eine 'id'-Property hat, behaelt aber den vollen Typ von T.",
    concept: "generic-constraint",
    difficulty: 3,
  },

  // ─── Problem 2: satisfies + as const ────────────────────────────────────
  {
    id: "L03-P2",
    title: "satisfies mit as const fuer typsichere Konfiguration",
    description:
      "Ordne die Zeilen so, dass eine Konfiguration entsteht, die " +
      "sowohl typgeprueft ist (satisfies) als auch Literal-Typen behaelt (as const).",
    correctOrder: [
      "type Route = {",
      "  path: string;",
      "  method: 'GET' | 'POST';",
      "};",
      "",
      "const routes = {",
      "  home: { path: '/', method: 'GET' },",
      "  login: { path: '/login', method: 'POST' },",
      "} as const satisfies Record<string, Route>;",
    ],
    distractors: [
      "} satisfies Record<string, Route> as const;",
      "} as Record<string, Route>;",
    ],
    hint:
      "'as const' muss VOR 'satisfies' stehen. Die Reihenfolge ist: " +
      "Wert as const satisfies Typ. 'as Record' wuerde den Literal-Typ verlieren.",
    concept: "satisfies-as-const",
    difficulty: 3,
  },

  // ─── Problem 3: Contextual Typing bei Callbacks ─────────────────────────
  {
    id: "L03-P3",
    title: "Contextual Typing bei Array-Methoden",
    description:
      "Ordne die Zeilen so, dass Contextual Typing genutzt wird — " +
      "TypeScript leitet die Parameter-Typen im Callback automatisch her.",
    correctOrder: [
      "const names: string[] = ['Alice', 'Bob', 'Charlie'];",
      "",
      "const lengths = names.map(name => {",
      "  return name.length;",
      "});",
      "",
      "const upper = names.filter(n => n.startsWith('A'));",
    ],
    distractors: [
      "const lengths = names.map((name: any) => {",
    ],
    hint:
      "Bei Contextual Typing leitet TypeScript den Typ von 'name' aus dem " +
      "Array-Typ (string[]) ab. Explizite Typ-Annotationen wie ': any' sind " +
      "nicht noetig und kontraproduktiv.",
    concept: "contextual-typing",
    difficulty: 2,
  },

  // ─── Problem 4: Generic Identity mit explizitem Typ ─────────────────────
  {
    id: "L03-P4",
    title: "Generic Funktion mit Typ-Argument und Inference",
    description:
      "Ordne die Zeilen so, dass eine generische Funktion definiert wird " +
      "und sowohl mit explizitem Typ-Argument als auch mit Inference aufgerufen wird.",
    correctOrder: [
      "function wrap<T>(value: T): { wrapped: T } {",
      "  return { wrapped: value };",
      "}",
      "",
      "const a = wrap<string>('hello');  // explizit",
      "const b = wrap(42);               // Inference: T = number",
    ],
    distractors: [
      "function wrap<T>(value: any): { wrapped: T } {",
      "const a = wrap('hello' as string);",
    ],
    hint:
      "Bei Generics wird T aus dem Argument-Typ hergeleitet (Inference). " +
      "Man KANN den Typ explizit angeben (wrap<string>), muss aber nicht. " +
      "'value: any' wuerde die Verknuepfung zwischen Parameter und Return-Typ brechen.",
    concept: "generic-inference",
    difficulty: 3,
  },
];
