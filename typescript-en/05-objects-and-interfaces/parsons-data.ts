/**
 * Lesson 05 — Parson's Problems: Objects & Interfaces
 *
 * 3 problems for ordering lines of code.
 * Concepts: Discriminated Union + Switch, extends chain, Utility Type combination
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Discriminated Union with Switch ──────────────────────────
  {
    id: "L05-P1",
    title: "Discriminated Union with exhaustive Switch",
    description:
      "Arrange the lines so that a Discriminated Union for geometric " +
      "shapes is created and an exhaustive switch function calculates the area.",
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
      "Discriminated Unions use a shared literal property (here: 'kind') " +
      "as discriminator. The switch checks shape.kind, not typeof shape. " +
      "Union (|) instead of Intersection (&) is correct.",
    concept: "discriminated-union",
    difficulty: 3,
  },

  // ─── Problem 2: Interface extends Chain ─────────────────────────────────
  {
    id: "L05-P2",
    title: "Interface Inheritance with extends",
    description:
      "Arrange the lines so that an interface hierarchy is created: " +
      "Entity -> User -> Admin, where each interface adds new properties.",
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
      "Interfaces use 'extends', not 'implements' (that is for classes). " +
      "The chain must be linear: Entity <- User <- Admin. " +
      "User cannot extend both Entity and Admin simultaneously (circular).",
    concept: "interface-extends",
    difficulty: 2,
  },

  // ─── Problem 3: Utility Type Combination ────────────────────────────────
  {
    id: "L05-P3",
    title: "Combining Utility Types: Pick, Partial, Required",
    description:
      "Arrange the lines so that an update type is created that " +
      "always requires 'id' but makes all other fields optional.",
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
      "Pick<User, 'id'> takes only the 'id' (required). " +
      "Omit<User, 'id'> removes the 'id'. " +
      "Partial<Omit<User, 'id'>> makes the rest optional. " +
      "The Intersection (&) combines both. " +
      "The distractors also work, but the correctOrder variant " +
      "is the most precise.",
    concept: "utility-types",
    difficulty: 4,
  },
];