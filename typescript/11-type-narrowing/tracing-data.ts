/**
 * Lektion 11 — Tracing-Exercises: Type Narrowing
 *
 * BESONDERS WICHTIG fuer Narrowing: Der Typ aendert sich bei JEDEM Guard!
 * Themen:
 *  - typeof Narrowing-Kette
 *  - in-Operator Narrowing
 *  - Truthiness vs. Nullish
 *  - Exhaustive Narrowing bis never
 *
 * Schwierigkeit steigend: 1 → 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: typeof Narrowing-Kette ─────────────────────────────────
  {
    id: "11-typeof-chain",
    title: "typeof Narrowing — Typ aendert sich bei jedem Check",
    description:
      "Verfolge wie der Typ von 'x' sich bei jedem typeof-Check " +
      "aendert. Nach jedem Check wird der gepruefte Typ eliminiert.",
    code: [
      "function trace(x: string | number | boolean | null) {",
      "  // x: string | number | boolean | null",
      "  if (x === null) {",
      "    console.log('null');",
      "    return;",
      "  }",
      "  // x: ???",
      "  if (typeof x === 'string') {",
      "    console.log(x.toUpperCase());",
      "    return;",
      "  }",
      "  // x: ???",
      "  if (typeof x === 'number') {",
      "    console.log(x.toFixed(2));",
      "    return;",
      "  }",
      "  // x: ???",
      "  console.log(x ? 'wahr' : 'falsch');",
      "}",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Welchen Typ hat x am Anfang der Funktion?",
        expectedAnswer: "string | number | boolean | null",
        variables: { "x": "string | number | boolean | null" },
        explanation:
          "Der Parameter hat vier moegliche Typen. TypeScript " +
          "kennt den konkreten Wert noch nicht.",
      },
      {
        lineIndex: 6,
        question: "Welchen Typ hat x nach dem null-Check (Zeile 3-5)?",
        expectedAnswer: "string | number | boolean",
        variables: { "x": "string | number | boolean" },
        explanation:
          "Der null-Check mit early return eliminiert null. " +
          "Wenn wir Zeile 7 erreichen, ist null unmoeglich.",
      },
      {
        lineIndex: 11,
        question: "Welchen Typ hat x nach dem string-Check (Zeile 8-10)?",
        expectedAnswer: "number | boolean",
        variables: { "x": "number | boolean" },
        explanation:
          "typeof === 'string' mit early return eliminiert string. " +
          "Uebrig: number | boolean.",
      },
      {
        lineIndex: 16,
        question: "Welchen Typ hat x nach dem number-Check (Zeile 13-15)?",
        expectedAnswer: "boolean",
        variables: { "x": "boolean" },
        explanation:
          "number wurde auch eliminiert. Uebrig: boolean. " +
          "Deshalb kann Zeile 17 den boolean-Ternary verwenden " +
          "ohne weiteren Check.",
      },
    ],
    concept: "typeof-narrowing",
    difficulty: 1,
  },

  // ─── Exercise 2: in-Operator und Discriminated Union ────────────────────
  {
    id: "11-in-narrowing",
    title: "in-Operator — Property-basiertes Narrowing",
    description:
      "Verfolge wie der in-Operator den Typ bei einer " +
      "Discriminated Union verengt.",
    code: [
      "interface Dog { bark(): string; legs: number }",
      "interface Fish { swim(): string; fins: number }",
      "interface Bird { fly(): string; wings: number }",
      "type Animal = Dog | Fish | Bird;",
      "",
      "function describe(animal: Animal): string {",
      "  // animal: Dog | Fish | Bird",
      "  if ('bark' in animal) {",
      "    // animal: ???",
      "    return animal.bark();",
      "  }",
      "  // animal: ???",
      "  if ('swim' in animal) {",
      "    // animal: ???",
      "    return animal.swim();",
      "  }",
      "  // animal: ???",
      "  return animal.fly();",
      "}",
    ],
    steps: [
      {
        lineIndex: 6,
        question: "Welchen Typ hat animal am Anfang?",
        expectedAnswer: "Dog | Fish | Bird",
        variables: { "animal": "Dog | Fish | Bird" },
        explanation:
          "Der Union Type hat drei Moeglichkeiten. Wir muessen " +
          "Narrowing verwenden um den konkreten Typ zu bestimmen.",
      },
      {
        lineIndex: 8,
        question: "Welchen Typ hat animal nach 'bark' in animal?",
        expectedAnswer: "Dog",
        variables: { "animal": "Dog" },
        explanation:
          "Nur Dog hat die Property 'bark'. Der in-Operator " +
          "narrowt zu Dog — bark() und legs sind verfuegbar.",
      },
      {
        lineIndex: 11,
        question: "Welchen Typ hat animal nach dem bark-Check (falls nicht Dog)?",
        expectedAnswer: "Fish | Bird",
        variables: { "animal": "Fish | Bird" },
        explanation:
          "Dog wurde eliminiert (im if behandelt). " +
          "Uebrig bleiben Fish und Bird.",
      },
      {
        lineIndex: 13,
        question: "Welchen Typ hat animal nach 'swim' in animal?",
        expectedAnswer: "Fish",
        variables: { "animal": "Fish" },
        explanation:
          "Nur Fish hat 'swim'. TypeScript narrowt zu Fish.",
      },
      {
        lineIndex: 16,
        question: "Welchen Typ hat animal am Ende (kein Dog, kein Fish)?",
        expectedAnswer: "Bird",
        variables: { "animal": "Bird" },
        explanation:
          "Dog und Fish wurden eliminiert. Uebrig: Bird. " +
          "Deshalb ist animal.fly() ohne Check erlaubt.",
      },
    ],
    concept: "in-operator-narrowing",
    difficulty: 2,
  },

  // ─── Exercise 3: Truthiness vs. Nullish ─────────────────────────────────
  {
    id: "11-truthiness-vs-nullish",
    title: "Truthiness vs. Nullish — Welche Werte ueberleben?",
    description:
      "Verfolge den Unterschied zwischen Truthiness-Check (if (x)), " +
      "Nullish-Check (x != null) und striktem Check (x !== null).",
    code: [
      "function truthiness(x: number | null | undefined) {",
      "  if (x) { return `truthy: ${x}`; }",
      "  return `falsy: ${x}`;",
      "}",
      "",
      "function nullish(x: number | null | undefined) {",
      "  if (x != null) { return `defined: ${x}`; }",
      "  return `nullish: ${x}`;",
      "}",
      "",
      "console.log(truthiness(42));",
      "console.log(truthiness(0));",
      "console.log(truthiness(null));",
      "console.log(nullish(42));",
      "console.log(nullish(0));",
      "console.log(nullish(null));",
    ],
    steps: [
      {
        lineIndex: 10,
        question: "Was gibt truthiness(42) zurueck?",
        expectedAnswer: "truthy: 42",
        variables: { "x": "42", "result": "truthy: 42" },
        explanation:
          "42 ist truthy. if (x) ist true, also 'truthy: 42'.",
      },
      {
        lineIndex: 11,
        question: "Was gibt truthiness(0) zurueck?",
        expectedAnswer: "falsy: 0",
        variables: { "x": "0", "result": "falsy: 0" },
        explanation:
          "0 ist FALSY! if (0) ist false. 0 wird faelschlicherweise " +
          "als 'nicht vorhanden' behandelt. Das ist die Truthiness-Falle!",
      },
      {
        lineIndex: 12,
        question: "Was gibt truthiness(null) zurueck?",
        expectedAnswer: "falsy: null",
        variables: { "x": "null", "result": "falsy: null" },
        explanation:
          "null ist falsy. Hier ist das gewuenscht — null SOLL " +
          "als nicht vorhanden gelten.",
      },
      {
        lineIndex: 14,
        question: "Was gibt nullish(0) zurueck?",
        expectedAnswer: "defined: 0",
        variables: { "x": "0", "result": "defined: 0" },
        explanation:
          "!= null prueft nur auf null/undefined. 0 ist weder null " +
          "noch undefined, also 'defined: 0'. Das ist das KORREKTE " +
          "Verhalten — 0 ist ein gueltiger Wert!",
      },
      {
        lineIndex: 15,
        question: "Was gibt nullish(null) zurueck?",
        expectedAnswer: "nullish: null",
        variables: { "x": "null", "result": "nullish: null" },
        explanation:
          "null == null ist true (lose Gleichheit). Also ist " +
          "x != null false und wir geben 'nullish: null' zurueck.",
      },
    ],
    concept: "truthiness-vs-nullish",
    difficulty: 2,
  },

  // ─── Exercise 4: Exhaustive Narrowing bis never ─────────────────────────
  {
    id: "11-exhaustive-never",
    title: "Exhaustive Narrowing — Typ wird zu never",
    description:
      "Verfolge wie der Typ bei einem switch-Statement nach jedem " +
      "case enger wird, bis er im default zu never wird.",
    code: [
      "type Action = 'create' | 'read' | 'update' | 'delete';",
      "",
      "function handle(action: Action) {",
      "  // action: 'create' | 'read' | 'update' | 'delete'",
      "  switch (action) {",
      "    case 'create':",
      "      // action: 'create'",
      "      return 'POST';",
      "    case 'read':",
      "      // action (remaining): ???",
      "      return 'GET';",
      "    case 'update':",
      "      // action (remaining): ???",
      "      return 'PUT';",
      "    case 'delete':",
      "      // action (remaining): ???",
      "      return 'DELETE';",
      "    default:",
      "      // action: ???",
      "      const _: never = action;",
      "      return _;",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 3,
        question: "Welchen Typ hat action vor dem switch?",
        expectedAnswer: "create | read | update | delete",
        variables: { "action": "create | read | update | delete" },
        explanation:
          "Alle vier Werte sind moeglich. Der switch wird sie " +
          "einen nach dem anderen eliminieren.",
      },
      {
        lineIndex: 9,
        question:
          "Welchen Typ hat action nach case 'create' (im verbleibenden Code)?",
        expectedAnswer: "read | update | delete",
        variables: { "action": "read | update | delete" },
        explanation:
          "case 'create' mit return eliminiert 'create'. " +
          "Drei Moeglichkeiten bleiben.",
      },
      {
        lineIndex: 12,
        question:
          "Welchen Typ hat action nach case 'read' (im verbleibenden Code)?",
        expectedAnswer: "update | delete",
        variables: { "action": "update | delete" },
        explanation:
          "'read' wird auch eliminiert. Zwei Moeglichkeiten bleiben.",
      },
      {
        lineIndex: 15,
        question:
          "Welchen Typ hat action nach case 'update' (im verbleibenden Code)?",
        expectedAnswer: "delete",
        variables: { "action": "delete" },
        explanation:
          "Nur noch 'delete' ist uebrig.",
      },
      {
        lineIndex: 18,
        question: "Welchen Typ hat action im default-Zweig?",
        expectedAnswer: "never",
        variables: { "action": "never" },
        explanation:
          "Alle vier Werte wurden durch cases behandelt. " +
          "Es bleibt NICHTS uebrig — der Typ ist never. " +
          "Deshalb funktioniert const _: never = action. " +
          "Wenn ein fuenfter Wert hinzukommt, waere action " +
          "nicht mehr never und der Compile schlaegt fehl!",
      },
    ],
    concept: "exhaustive-narrowing",
    difficulty: 3,
  },
];
