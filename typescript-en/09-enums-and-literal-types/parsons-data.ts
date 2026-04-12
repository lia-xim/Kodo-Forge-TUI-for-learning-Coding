/**
 * Lesson 09 — Parson's Problems: Enums & Literal Types
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L09-P1",
    title: "as const Object as Enum Replacement",
    description: "Arrange the lines into a type-safe constant object with union type extraction.",
    correctOrder: [
      "const Direction = {",
      "  Up: 'UP',",
      "  Down: 'DOWN',",
      "  Left: 'LEFT',",
      "  Right: 'RIGHT',",
      "} as const;",
      "",
      "type Direction = typeof Direction[keyof typeof Direction];",
      "// 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'",
    ],
    distractors: [
      "} as readonly;",
      "type Direction = keyof typeof Direction;",
    ],
    hint: "as const (not as readonly) and typeof Direction[keyof typeof Direction] for the VALUES (not the keys).",
    concept: "as-const-object",
    difficulty: 3,
  },

  {
    id: "L09-P2",
    title: "Template Literal Type for Event Handlers",
    description: "Arrange the lines into a template literal type that generates event handler names.",
    correctOrder: [
      "type DOMEvent = 'click' | 'scroll' | 'focus' | 'blur';",
      "",
      "type EventHandler = `on${Capitalize<DOMEvent>}`;",
      "// 'onClick' | 'onScroll' | 'onFocus' | 'onBlur'",
      "",
      "type Handlers = {",
      "  [K in EventHandler]?: () => void;",
      "};",
    ],
    distractors: [
      "type EventHandler = `on${Uppercase<DOMEvent>}`;",
      "type EventHandler = `on${DOMEvent}`;",
    ],
    hint: "Capitalize only uppercases the first letter (onClick). Uppercase makes everything uppercase (onCLICK). Without a transformation, capitalization is missing (onclick).",
    concept: "template-literal-capitalize",
    difficulty: 3,
  },

  {
    id: "L09-P3",
    title: "Branded Type for Type-Safe IDs",
    description: "Arrange the lines into a branded type system for user and product IDs.",
    correctOrder: [
      "type UserID = string & { __brand: 'UserID' };",
      "type ProductID = string & { __brand: 'ProductID' };",
      "",
      "function createUserID(id: string): UserID {",
      "  return id as UserID;",
      "}",
      "",
      "function findUser(id: UserID): void {",
      "  console.log('Finding user:', id);",
      "}",
      "",
      "const userId = createUserID('user-123');",
      "findUser(userId); // OK",
    ],
    distractors: [
      "const userId: UserID = 'user-123';",
      "function findUser(id: string): void {",
    ],
    hint: "Branded types require a constructor function (as-cast). Direct assignment and string parameters lose type safety.",
    concept: "branded-types",
    difficulty: 4,
  },
];