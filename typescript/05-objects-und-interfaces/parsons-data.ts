/**
 * Lektion 05 — Parson's Problems: Objects & Interfaces
 *
 * 3 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Discriminated Union + Switch, extends-Kette, Utility Type Kombination
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Discriminated Union mit Switch ──────────────────────────
  {
    id: "L05-P1",
    title: "Discriminated Union mit exhaustive Switch",
    description:
      "Ordne die Zeilen so, dass eine Discriminated Union fuer geometrische " +
      "Formen entsteht und eine exhaustive Switch-Funktion die Flaeche berechnet.",
    correctOrder: [
      "type Circle = { kind: 'circle'; radius: number };",
      "type Rect = { kind: 'rect'; width: number; height: number };",
      "type Shape = Circle | Rect;",
      "",
      "function area(shape: Shape): number {",
      "  switch (shape.kind) {",
      "    case 'circle': return Math.PI * shape.radius ** 2;",
      "    case 'rect': return shape.width * shape.height;",
      "  }",
      "}",
    ],
    distractors: [
      "type Shape = Circle & Rect;",
      "  switch (typeof shape) {",
    ],
    hint:
      "Discriminated Unions verwenden eine gemeinsame Literal-Property (hier: 'kind') " +
      "als Diskriminator. Der Switch prueft shape.kind, nicht typeof shape. " +
      "Union (|) statt Intersection (&) ist korrekt.",
    concept: "discriminated-union",
    difficulty: 3,
  },

  // ─── Problem 2: Interface extends-Kette ─────────────────────────────────
  {
    id: "L05-P2",
    title: "Interface-Vererbung mit extends",
    description:
      "Ordne die Zeilen so, dass eine Interface-Hierarchie entsteht: " +
      "Entity -> User -> Admin, wobei jedes Interface neue Properties hinzufuegt.",
    correctOrder: [
      "interface Entity {",
      "  id: number;",
      "  createdAt: Date;",
      "}",
      "",
      "interface User extends Entity {",
      "  name: string;",
      "  email: string;",
      "}",
      "",
      "interface Admin extends User {",
      "  permissions: string[];",
      "}",
    ],
    distractors: [
      "interface Admin implements User {",
      "interface User extends Entity, Admin {",
    ],
    hint:
      "Interfaces verwenden 'extends', nicht 'implements' (das ist fuer Klassen). " +
      "Die Kette muss linear sein: Entity <- User <- Admin. " +
      "User kann nicht gleichzeitig Entity und Admin erweitern (zirkulaer).",
    concept: "interface-extends",
    difficulty: 2,
  },

  // ─── Problem 3: Utility Type Kombination ────────────────────────────────
  {
    id: "L05-P3",
    title: "Utility Types kombinieren: Pick, Partial, Required",
    description:
      "Ordne die Zeilen so, dass ein Update-Typ entsteht, der " +
      "die 'id' immer erfordert, aber alle anderen Felder optional macht.",
    correctOrder: [
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "  age: number;",
      "}",
      "",
      "type UserUpdate = Pick<User, 'id'> & Partial<Omit<User, 'id'>>;",
    ],
    distractors: [
      "type UserUpdate = Omit<User, 'id'> & Partial<User>;",
      "type UserUpdate = Required<Pick<User, 'id'>> & Partial<User>;",
    ],
    hint:
      "Pick<User, 'id'> nimmt nur die 'id' (required). " +
      "Omit<User, 'id'> entfernt die 'id'. " +
      "Partial<Omit<User, 'id'>> macht den Rest optional. " +
      "Die Intersection (&) kombiniert beides. " +
      "Die Distraktoren funktionieren auch, aber die correctOrder-Variante " +
      "ist die praeziseste.",
    concept: "utility-types",
    difficulty: 4,
  },
];
