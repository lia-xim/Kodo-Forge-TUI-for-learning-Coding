/**
 * Lektion 09 — Parson's Problems: Enums & Literal Types
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L09-P1",
    title: "as const Object als Enum-Ersatz",
    description: "Ordne die Zeilen zu einem typsicheren Konstanten-Objekt mit Union-Type-Extraktion.",
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
    hint: "as const (nicht as readonly) und typeof Direction[keyof typeof Direction] fuer die WERTE (nicht die Keys).",
    concept: "as-const-object",
    difficulty: 3,
  },

  {
    id: "L09-P2",
    title: "Template Literal Type fuer Event-Handler",
    description: "Ordne die Zeilen zu einem Template Literal Type der Event-Handler-Namen generiert.",
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
    hint: "Capitalize macht nur den ersten Buchstaben gross (onClick). Uppercase macht alles gross (onCLICK). Ohne Transformation fehlt die Grossschreibung (onclick).",
    concept: "template-literal-capitalize",
    difficulty: 3,
  },

  {
    id: "L09-P3",
    title: "Branded Type fuer typsichere IDs",
    description: "Ordne die Zeilen zu einem Branded Type System fuer User- und Product-IDs.",
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
    hint: "Branded Types brauchen eine Konstruktor-Funktion (as-Cast). Direkte Zuweisung und string-Parameter verlieren die Typsicherheit.",
    concept: "branded-types",
    difficulty: 4,
  },
];
