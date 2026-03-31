/**
 * Lektion 07 — Tracing-Exercises: Union & Intersection Types
 *
 * Themen: Narrowing-Flow, Discriminated Union Switch, Intersection-Kombination
 * Schwierigkeit: 2 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  {
    id: "07-narrowing-flow",
    title: "Narrowing-Flow — Typ aendert sich durch Kontrollfluss",
    description:
      "Verfolge wie TypeScript den Typ einer Variable durch " +
      "verschiedene Branches veraendert.",
    code: [
      "function describe(x: string | number | boolean): string {",
      "  if (typeof x === 'string') {",
      "    return `Text: ${x.toUpperCase()}`;",
      "  }",
      "  // x ist jetzt number | boolean",
      "  if (typeof x === 'number') {",
      "    return `Zahl: ${x.toFixed(2)}`;",
      "  }",
      "  // x ist jetzt boolean",
      "  return `Bool: ${x}`;",
      "}",
    ],
    steps: [
      {
        lineIndex: 1,
        question: "Welchen Typ hat x VOR dem ersten if?",
        expectedAnswer: "string | number | boolean",
        variables: { "x": "(Typ: string | number | boolean)" },
        explanation: "x hat den vollen Union-Typ aus der Funktionssignatur.",
      },
      {
        lineIndex: 2,
        question: "Welchen Typ hat x INNERHALB des ersten if-Blocks?",
        expectedAnswer: "string",
        variables: { "x": "(Typ: string)" },
        explanation:
          "typeof x === 'string' verengt auf string. " +
          "toUpperCase() ist jetzt sicher aufrufbar.",
      },
      {
        lineIndex: 4,
        question: "Welchen Typ hat x NACH dem ersten if-Block (Zeile 5)?",
        expectedAnswer: "number | boolean",
        variables: { "x": "(Typ: number | boolean)" },
        explanation:
          "TypeScript weiss: Wenn wir hier ankommen, war x KEIN string " +
          "(sonst haetten wir returned). Also: number | boolean.",
      },
      {
        lineIndex: 8,
        question: "Welchen Typ hat x am Ende (Zeile 9)?",
        expectedAnswer: "boolean",
        variables: { "x": "(Typ: boolean)" },
        explanation:
          "Beide vorherigen Checks haben string und number ausgeschlossen. " +
          "Uebrig bleibt: boolean.",
      },
    ],
    concept: "sequential-narrowing",
    difficulty: 2,
  },

  {
    id: "07-discriminated-switch",
    title: "Discriminated Union — Switch verengt den Typ",
    description:
      "Verfolge wie ein switch auf der Tag-Property den Typ verengt.",
    code: [
      "type Event =",
      "  | { type: 'click'; x: number; y: number }",
      "  | { type: 'keypress'; key: string }",
      "  | { type: 'scroll'; offset: number };",
      "",
      "function handleEvent(event: Event): string {",
      "  switch (event.type) {",
      "    case 'click':",
      "      return `Klick bei (${event.x}, ${event.y})`;",
      "    case 'keypress':",
      "      return `Taste: ${event.key}`;",
      "    case 'scroll':",
      "      return `Scroll: ${event.offset}px`;",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 7,
        question: "Welchen Typ hat event im case 'click'?",
        expectedAnswer: "{ type: 'click'; x: number; y: number }",
        variables: { "event": "(Typ: { type: 'click'; x: number; y: number })" },
        explanation:
          "switch auf event.type mit case 'click' verengt auf das " +
          "Union-Mitglied mit type: 'click'. event.x und event.y sind zugreifbar.",
      },
      {
        lineIndex: 9,
        question: "Welchen Typ hat event im case 'keypress'?",
        expectedAnswer: "{ type: 'keypress'; key: string }",
        variables: { "event": "(Typ: { type: 'keypress'; key: string })" },
        explanation:
          "case 'keypress' verengt auf das Mitglied mit type: 'keypress'. " +
          "event.key ist zugreifbar, aber event.x waere ein Fehler.",
      },
      {
        lineIndex: 11,
        question: "Welchen Typ hat event im case 'scroll'?",
        expectedAnswer: "{ type: 'scroll'; offset: number }",
        variables: { "event": "(Typ: { type: 'scroll'; offset: number })" },
        explanation:
          "Jeder case verengt auf genau das passende Union-Mitglied. " +
          "Das ist die Staerke von Discriminated Unions.",
      },
    ],
    concept: "discriminated-union-switch",
    difficulty: 2,
  },

  {
    id: "07-intersection-merge",
    title: "Intersection kombiniert Properties",
    description:
      "Verfolge wie Intersection Types Properties aus mehreren Typen vereinen.",
    code: [
      "type Base = { id: number; createdAt: Date };",
      "type WithName = { name: string };",
      "type WithEmail = { email: string };",
      "",
      "type User = Base & WithName & WithEmail;",
      "",
      "const user: User = {",
      "  id: 1,",
      "  createdAt: new Date(),",
      "  name: 'Max',",
      "  email: 'max@test.de',",
      "};",
      "",
      "const nameAndEmail = `${user.name} <${user.email}>`;",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "Welche Properties hat der Typ User?",
        expectedAnswer: "id, createdAt, name, email — alle Properties aus allen drei Typen",
        variables: { "User": "{ id: number; createdAt: Date; name: string; email: string }" },
        explanation:
          "Intersection (&) kombiniert ALLE Properties. User hat " +
          "die Properties aus Base UND WithName UND WithEmail.",
      },
      {
        lineIndex: 6,
        question: "Wuerde { id: 1, name: 'Max' } als User-Wert funktionieren?",
        expectedAnswer: "Nein — createdAt und email fehlen",
        variables: {},
        explanation:
          "Ein Intersection-Typ verlangt ALLE Properties. " +
          "Fehlende Properties sind ein Compile-Fehler.",
      },
      {
        lineIndex: 13,
        question: "Welchen Wert hat nameAndEmail?",
        expectedAnswer: "\"Max <max@test.de>\"",
        variables: { "nameAndEmail": "\"Max <max@test.de>\" (Typ: string)" },
        explanation:
          "user.name und user.email sind beide zugreifbar weil User " +
          "ein Intersection aller drei Typen ist.",
      },
    ],
    concept: "intersection-properties",
    difficulty: 2,
  },

  {
    id: "07-narrowing-with-assertion",
    title: "Exhaustive Check mit never",
    description:
      "Verfolge was passiert wenn ein neues Union-Mitglied hinzugefuegt wird " +
      "und der Exhaustive Check greift.",
    code: [
      "type Light = 'red' | 'yellow' | 'green';",
      "",
      "function nextLight(current: Light): Light {",
      "  switch (current) {",
      "    case 'red': return 'green';",
      "    case 'yellow': return 'red';",
      "    case 'green': return 'yellow';",
      "    default:",
      "      const _exhaustive: never = current;",
      "      return _exhaustive;",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "Welchen Typ hat current im case 'red'?",
        expectedAnswer: "'red' (Literal Type)",
        variables: { "current": "'red'" },
        explanation: "switch/case verengt auf den exakten Literal-Typ.",
      },
      {
        lineIndex: 8,
        question: "Welchen Typ hat current im default-Block, wenn alle Cases behandelt sind?",
        expectedAnswer: "never — kein Wert moeglich",
        variables: { "current": "(Typ: never)" },
        explanation:
          "Wenn alle Union-Mitglieder in case-Bloecken behandelt sind, " +
          "bleibt im default-Block 'never' — kein Wert kann hier ankommen.",
      },
      {
        lineIndex: 8,
        question: "Was passiert wenn du 'blue' zum Light-Union hinzufuegst?",
        expectedAnswer: "Compile-Error: 'blue' ist nicht 'never' zuweisbar",
        variables: { "current": "(Typ: 'blue' — nicht never!)" },
        explanation:
          "Mit 'blue' im Union wuerde current im default 'blue' statt never sein. " +
          "Die Zuweisung an never scheitert — ein Compile-Fehler zwingt dich, " +
          "den neuen Case zu behandeln.",
      },
    ],
    concept: "exhaustive-check-never",
    difficulty: 3,
  },
];
