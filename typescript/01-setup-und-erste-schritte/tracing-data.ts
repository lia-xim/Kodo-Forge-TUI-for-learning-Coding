/**
 * Lektion 01 — Tracing-Exercises: Setup & Erste Schritte
 *
 * Themen:
 *  - Type Assertions und Laufzeitverhalten
 *  - Enum-Werte zur Laufzeit
 *  - Type Erasure: Was bleibt nach der Kompilierung?
 *
 * Schwierigkeit steigend: 1 → 3
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: Type Erasure — Was bleibt nach der Kompilierung? ────────
  {
    id: "01-type-erasure-basics",
    title: "Type Erasure — Was bleibt uebrig?",
    description:
      "Verfolge was der TypeScript-Compiler entfernt und was als " +
      "JavaScript-Code uebrig bleibt.",
    code: [
      "interface User {",
      "  name: string;",
      "  age: number;",
      "}",
      "",
      "const user: User = { name: 'Max', age: 25 };",
      "console.log(typeof user);",
      "console.log(user.name);",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Das Interface 'User' wird definiert. Existiert es nach der " +
          "Kompilierung zu JavaScript noch?",
        expectedAnswer: "Nein",
        variables: {},
        explanation:
          "Interfaces sind reine Compile-Zeit-Konstrukte. Sie werden bei " +
          "Type Erasure komplett entfernt. Im JavaScript-Output existiert " +
          "kein Interface — nur das Objekt-Literal bleibt.",
      },
      {
        lineIndex: 5,
        question:
          "Welchen Typ hat die Variable 'user' im JavaScript-Output? " +
          "Bleibt die Annotation ': User' erhalten?",
        expectedAnswer: "Nein, die Annotation wird entfernt. user ist ein normales Objekt.",
        variables: { "user": "{ name: 'Max', age: 25 }" },
        explanation:
          "Die Typ-Annotation ': User' wird bei der Kompilierung entfernt. " +
          "Im JavaScript steht nur: const user = { name: 'Max', age: 25 }; " +
          "Der Wert selbst bleibt identisch.",
      },
      {
        lineIndex: 6,
        question: "Was gibt 'typeof user' zur Laufzeit aus?",
        expectedAnswer: "object",
        variables: { "user": "{ name: 'Max', age: 25 }", "typeof user": "object" },
        explanation:
          "JavaScript's typeof-Operator kennt keine TypeScript-Typen. " +
          "Er gibt 'object' zurueck, nicht 'User'. Das Interface " +
          "existiert zur Laufzeit nicht.",
      },
      {
        lineIndex: 7,
        question: "Was gibt console.log(user.name) aus?",
        expectedAnswer: "Max",
        variables: { "user": "{ name: 'Max', age: 25 }" },
        explanation:
          "Der Property-Zugriff funktioniert normal — das Objekt selbst " +
          "wurde nicht veraendert, nur die Typ-Informationen wurden entfernt.",
      },
    ],
    concept: "type-erasure",
    difficulty: 1,
  },

  // ─── Exercise 2: Enum-Werte zur Laufzeit ─────────────────────────────────
  {
    id: "01-enum-runtime-values",
    title: "Enum-Werte — Was existiert zur Laufzeit?",
    description:
      "Verfolge welche Werte ein Enum zur Laufzeit hat und wie sich " +
      "numerische und String-Enums unterscheiden.",
    code: [
      "enum Direction {",
      "  Up,",
      "  Down,",
      "  Left,",
      "  Right,",
      "}",
      "",
      "console.log(Direction.Up);",
      "console.log(Direction[0]);",
      "console.log(typeof Direction);",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Ein numerisches Enum wird definiert. Im Gegensatz zu Interfaces — " +
          "existiert es nach der Kompilierung?",
        expectedAnswer: "Ja",
        variables: {},
        explanation:
          "Enums sind eine der wenigen TypeScript-Konstrukte die zur Laufzeit " +
          "existieren. Der Compiler erzeugt ein JavaScript-Objekt mit den " +
          "Enum-Werten. Nur 'const enum' wird komplett entfernt.",
      },
      {
        lineIndex: 7,
        question: "Was gibt Direction.Up aus? Welchen Wert hat es?",
        expectedAnswer: "0",
        variables: { "Direction.Up": "0", "Direction.Down": "1", "Direction.Left": "2", "Direction.Right": "3" },
        explanation:
          "Numerische Enums starten bei 0 (wenn kein Startwert angegeben). " +
          "Up = 0, Down = 1, Left = 2, Right = 3. " +
          "Diese Werte existieren als echte JavaScript-Werte.",
      },
      {
        lineIndex: 8,
        question:
          "Was gibt Direction[0] aus? (Reverse Mapping)",
        expectedAnswer: "Up",
        variables: { "Direction[0]": "Up" },
        explanation:
          "Numerische Enums haben ein 'Reverse Mapping': Man kann sowohl " +
          "Direction.Up (= 0) als auch Direction[0] (= 'Up') verwenden. " +
          "String-Enums haben dieses Feature NICHT.",
      },
      {
        lineIndex: 9,
        question: "Was gibt typeof Direction zurueck?",
        expectedAnswer: "object",
        variables: { "typeof Direction": "object" },
        explanation:
          "Zur Laufzeit ist ein Enum ein normales JavaScript-Objekt. " +
          "typeof gibt daher 'object' zurueck. Es ist kein spezieller " +
          "Enum-Typ — nur ein Objekt mit Schluessel-Wert-Paaren.",
      },
    ],
    concept: "enums",
    difficulty: 2,
  },

  // ─── Exercise 3: Type Assertions vs. Laufzeit ────────────────────────────
  {
    id: "01-type-assertions-runtime",
    title: "Type Assertions — Compile-Zeit vs. Laufzeit",
    description:
      "Verfolge was 'as' zur Compile-Zeit und zur Laufzeit bewirkt " +
      "und wo die Gefahren liegen.",
    code: [
      "const input: unknown = 42;",
      "const text = input as string;",
      "console.log(typeof text);",
      "console.log(text);",
      "// console.log(text.toUpperCase());",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Welchen TypeScript-Typ hat 'input'?",
        expectedAnswer: "unknown",
        variables: { "input": "42 (Typ: unknown)" },
        explanation:
          "Die Variable wird explizit als 'unknown' typisiert. " +
          "Der tatsaechliche Wert ist die Zahl 42, aber TypeScript " +
          "behandelt sie als 'unknown'.",
      },
      {
        lineIndex: 1,
        question:
          "Welchen TypeScript-Typ hat 'text' nach 'as string'? " +
          "Und welchen Laufzeit-Wert?",
        expectedAnswer: "TypeScript-Typ: string. Laufzeit-Wert: 42 (number)",
        variables: { "input": "42", "text": "42 (TS denkt: string, tatsaechlich: number)" },
        explanation:
          "'as string' ist eine Type Assertion — sie ueberzeugt nur den " +
          "Compiler, NICHT die Laufzeit. Der Wert bleibt 42 (eine Zahl). " +
          "TypeScript vertraut dir hier, prueft aber nicht.",
      },
      {
        lineIndex: 2,
        question: "Was gibt typeof text zur Laufzeit aus?",
        expectedAnswer: "number",
        variables: { "text": "42", "typeof text": "number" },
        explanation:
          "Hier wird der Widerspruch sichtbar: TypeScript denkt text ist " +
          "ein 'string', aber typeof gibt 'number' zurueck. Type Assertions " +
          "aendern den Wert nicht — sie luegen nur den Compiler an.",
      },
      {
        lineIndex: 4,
        question:
          "Was wuerde passieren, wenn Zeile 5 (text.toUpperCase()) " +
          "ausgefuehrt wird?",
        expectedAnswer: "Runtime Error: text.toUpperCase is not a function",
        variables: { "text": "42 (number)" },
        explanation:
          "Da text tatsaechlich eine Zahl ist, hat sie keine toUpperCase()-Methode. " +
          "TypeScript meldet keinen Fehler (es denkt text ist string), " +
          "aber zur Laufzeit crasht es. Deshalb sind Type Assertions gefaehrlich.",
      },
    ],
    concept: "type-assertions",
    difficulty: 3,
  },

  // ─── Exercise 4: const enum vs. regulaeres enum ──────────────────────────
  {
    id: "01-const-enum-erasure",
    title: "const enum — Komplett entfernt",
    description:
      "Vergleiche was bei einem regulaeren Enum und einem const Enum " +
      "nach der Kompilierung uebrig bleibt.",
    code: [
      "const enum Color {",
      "  Red = 'RED',",
      "  Green = 'GREEN',",
      "  Blue = 'BLUE',",
      "}",
      "",
      "const myColor = Color.Red;",
      "console.log(myColor);",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Ein 'const enum' wird definiert. Existiert es nach der " +
          "Kompilierung als Objekt?",
        expectedAnswer: "Nein",
        variables: {},
        explanation:
          "Im Gegensatz zu regulaeren Enums wird ein 'const enum' bei der " +
          "Kompilierung komplett entfernt. Es wird kein JavaScript-Objekt erzeugt.",
      },
      {
        lineIndex: 6,
        question:
          "Wie sieht die kompilierte JavaScript-Zeile fuer " +
          "'const myColor = Color.Red' aus?",
        expectedAnswer: "const myColor = 'RED';",
        variables: { "myColor": "RED" },
        explanation:
          "Der Compiler ersetzt Color.Red direkt durch den Wert 'RED' " +
          "(Inlining). Im JavaScript steht nur noch: const myColor = 'RED'; " +
          "Kein Verweis auf Color, kein Enum-Objekt.",
      },
      {
        lineIndex: 7,
        question: "Was gibt console.log(myColor) aus?",
        expectedAnswer: "RED",
        variables: { "myColor": "RED" },
        explanation:
          "Da der Wert inline ersetzt wurde, gibt es einfach 'RED' aus. " +
          "Das Ergebnis ist identisch zu einem regulaeren Enum — " +
          "aber der generierte Code ist kleiner und schneller.",
      },
    ],
    concept: "type-erasure",
    difficulty: 2,
  },
];
