/**
 * Lektion 13 — Parson's Problems: Generics Basics
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L13-P1",
    title: "Generische identity-Funktion",
    description: "Ordne die Zeilen zu einer generischen identity-Funktion mit Aufruf.",
    correctOrder: [
      "function identity<T>(arg: T): T {",
      "  return arg;",
      "}",
      "",
      "const str = identity('hallo');",
      "const num = identity(42);",
    ],
    distractors: [
      "function identity(arg: any): any {",
      "const str = identity<any>('hallo');",
    ],
    hint: "Die generische Version benutzt <T> statt any. Bei der Verwendung braucht man keinen expliziten Typ — TypeScript inferiert.",
    concept: "generic-function-basics",
    difficulty: 1,
  },

  {
    id: "L13-P2",
    title: "Generisches Interface mit Constraint",
    description: "Ordne die Zeilen zu einem Repository-Interface mit HasId-Constraint.",
    correctOrder: [
      "interface HasId {",
      "  id: number;",
      "}",
      "",
      "interface Repository<T extends HasId> {",
      "  findById(id: number): T | null;",
      "  findAll(): T[];",
      "  save(entity: T): void;",
      "}",
    ],
    distractors: [
      "interface Repository<T> {",
      "interface Repository<T extends string> {",
    ],
    hint: "T extends HasId stellt sicher dass jedes Entity eine id hat. Ohne Constraint koennte T alles sein.",
    concept: "generic-interface-constraint",
    difficulty: 2,
  },

  {
    id: "L13-P3",
    title: "Typsicherer Property-Zugriff mit keyof",
    description: "Ordne die Zeilen zu einer getProperty-Funktion mit keyof-Constraint.",
    correctOrder: [
      "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {",
      "  return obj[key];",
      "}",
      "",
      "const user = { name: 'Max', age: 30, active: true };",
      "const name = getProperty(user, 'name');",
      "const age = getProperty(user, 'age');",
    ],
    distractors: [
      "function getProperty<T>(obj: T, key: string): unknown {",
      "function getProperty<T, K>(obj: T, key: K): T[K] {",
    ],
    hint: "K extends keyof T erzwingt gueltige Keys. Ohne extends keyof T waere K ein beliebiger Typ.",
    concept: "keyof-constraint-pattern",
    difficulty: 3,
  },

  {
    id: "L13-P4",
    title: "Generischer groupBy mit Constraint",
    description: "Ordne die Zeilen zu einer generischen groupBy-Funktion.",
    correctOrder: [
      "function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {",
      "  const result: Record<string, T[]> = {};",
      "  for (const item of items) {",
      "    const key = keyFn(item);",
      "    if (!result[key]) result[key] = [];",
      "    result[key].push(item);",
      "  }",
      "  return result;",
      "}",
    ],
    distractors: [
      "function groupBy(items: any[], keyFn: (item: any) => string): Record<string, any[]> {",
      "  const result: Record<string, unknown[]> = {};",
    ],
    hint: "Die generische Version behaelt den Typ T durch die gesamte Funktion. Die any-Version verliert den Typ.",
    concept: "generic-utility-function",
    difficulty: 3,
  },
];
