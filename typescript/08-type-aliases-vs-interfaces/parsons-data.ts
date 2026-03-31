/**
 * Lektion 08 — Parson's Problems: Type Aliases vs Interfaces
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L08-P1",
    title: "Module Augmentation fuer Express",
    description: "Ordne die Zeilen um Express.Request mit einer userId-Property zu erweitern.",
    correctOrder: [
      "declare module 'express' {",
      "  export interface Request {",
      "    userId?: string;",
      "    role?: 'admin' | 'user';",
      "  }",
      "}",
    ],
    distractors: [
      "declare type 'express' {",
      "  export type Request = {",
    ],
    hint: "Module Augmentation braucht 'declare module' und INTERFACE (fuer Declaration Merging). type funktioniert hier nicht.",
    concept: "module-augmentation",
    difficulty: 3,
  },

  {
    id: "L08-P2",
    title: "Interface-Vererbungskette mit extends",
    description: "Ordne die Zeilen zu einer dreistufigen Vererbungshierarchie.",
    correctOrder: [
      "interface Identifiable {",
      "  id: string;",
      "}",
      "",
      "interface Timestamped extends Identifiable {",
      "  createdAt: Date;",
      "  updatedAt: Date;",
      "}",
      "",
      "interface User extends Timestamped {",
      "  name: string;",
      "  email: string;",
      "}",
    ],
    distractors: [
      "interface Timestamped implements Identifiable {",
      "type User = Timestamped & { name: string; email: string };",
    ],
    hint: "Interface erweitert Interface mit 'extends' (nicht implements — das ist fuer Klassen). Alle Properties werden geerbt.",
    concept: "interface-extends-chain",
    difficulty: 2,
  },

  {
    id: "L08-P3",
    title: "Entscheidung: type vs interface",
    description: "Ordne die Zeilen so, dass type und interface jeweils korrekt eingesetzt werden.",
    correctOrder: [
      "// Union → type",
      "type Status = 'active' | 'inactive' | 'banned';",
      "",
      "// Objekt-Form → interface",
      "interface User {",
      "  name: string;",
      "  status: Status;",
      "}",
      "",
      "// Mapped Type → type",
      "type ReadonlyUser = Readonly<User>;",
    ],
    distractors: [
      "interface Status = 'active' | 'inactive' | 'banned';",
      "type User { name: string; status: Status; }",
    ],
    hint: "Union Types und Mapped Types → type. Objekt-Formen → interface (oder type). interface hat keine = Syntax fuer Unions.",
    concept: "decision-matrix",
    difficulty: 2,
  },
];
