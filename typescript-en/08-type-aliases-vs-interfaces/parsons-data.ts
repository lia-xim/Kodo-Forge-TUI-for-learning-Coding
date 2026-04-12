/**
 * Lesson 08 — Parson's Problems: Type Aliases vs Interfaces
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L08-P1",
    title: "Module Augmentation for Express",
    description: "Arrange the lines to extend Express.Request with a userId property.",
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
    hint: "Module Augmentation requires 'declare module' and INTERFACE (for Declaration Merging). type does not work here.",
    concept: "module-augmentation",
    difficulty: 3,
  },

  {
    id: "L08-P2",
    title: "Interface Inheritance Chain with extends",
    description: "Arrange the lines into a three-level inheritance hierarchy.",
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
    hint: "Interface extends interface with 'extends' (not implements — that is for classes). All properties are inherited.",
    concept: "interface-extends-chain",
    difficulty: 2,
  },

  {
    id: "L08-P3",
    title: "Decision: type vs interface",
    description: "Arrange the lines so that type and interface are each used correctly.",
    correctOrder: [
      "// Union → type",
      "type Status = 'active' | 'inactive' | 'banned';",
      "",
      "// Object form → interface",
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
    hint: "Union Types and Mapped Types → type. Object forms → interface (or type). interface has no = syntax for unions.",
    concept: "decision-matrix",
    difficulty: 2,
  },
];