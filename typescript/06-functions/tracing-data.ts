/**
 * Lektion 06 — Tracing-Exercises: Functions
 *
 * Themen:
 *  - Overload-Aufloesung: Welcher Overload matcht?
 *  - void-Callback: Was passiert mit dem Return-Wert?
 *  - Currying: Schritt fuer Schritt durch die Kette
 *  - Type Narrowing mit Type Guard
 *
 * Schwierigkeit steigend: 2 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // --- Exercise 1: Overload-Aufloesung ─────────────────────────────────
  {
    id: "06-overload-resolution",
    title: "Overload-Aufloesung — welcher Overload wird gewaehlt?",
    description:
      "Verfolge wie TypeScript bei ueberladenen Funktionen " +
      "den richtigen Overload von oben nach unten auswaehlt.",
    code: [
      "function format(x: string): string;",
      "function format(x: number): string;",
      "function format(x: string | number): string {",
      "  return `[${x}]`;",
      "}",
      "",
      "const a = format('hello');",
      "const b = format(42);",
    ],
    steps: [
      {
        lineIndex: 6,
        question: "Welchen Typ hat 'a'? Welcher Overload matcht fuer format('hello')?",
        expectedAnswer: "string (Overload 1 matcht: string -> string)",
        variables: { "a": "'[hello]' (Typ: string)" },
        explanation:
          "'hello' ist ein string. TypeScript prueft von oben: Overload 1 " +
          "akzeptiert string — Treffer! Der Return-Typ ist string.",
      },
      {
        lineIndex: 7,
        question: "Welchen Typ hat 'b'? Welcher Overload matcht fuer format(42)?",
        expectedAnswer: "string (Overload 2 matcht: number -> string)",
        variables: { "a": "'[hello]' (Typ: string)", "b": "'[42]' (Typ: string)" },
        explanation:
          "42 ist ein number. Overload 1 (string) passt nicht. " +
          "Overload 2 (number) passt — Return-Typ ist string.",
      },
    ],
    concept: "function-overloads",
    difficulty: 2,
  },

  // --- Exercise 2: void-Callback-Verhalten ─────────────────────────────
  {
    id: "06-void-callback-behavior",
    title: "void-Callback — ignorierter Return-Wert",
    description:
      "Verfolge was passiert wenn ein void-Callback einen Wert zurueckgibt " +
      "und warum forEach das Ergebnis ignoriert.",
    code: [
      "const numbers: number[] = [];",
      "",
      "[1, 2, 3].forEach(n => numbers.push(n));",
      "",
      "console.log(numbers);",
      "console.log(numbers.length);",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Welchen Typ und Wert hat numbers nach der Initialisierung?",
        expectedAnswer: "[] (leeres number[])",
        variables: { "numbers": "[] (Typ: number[])" },
        explanation:
          "numbers ist ein leeres Array vom Typ number[]. " +
          "Die Annotation ist noetig, weil ein leeres Array sonst never[] waere.",
      },
      {
        lineIndex: 2,
        question:
          "Was gibt der Callback n => numbers.push(n) zurueck? " +
          "Ist das ein Problem fuer forEach?",
        expectedAnswer: "push() gibt number zurueck (neue Laenge), aber forEach ignoriert es",
        variables: { "numbers": "[1, 2, 3] (Typ: number[])" },
        explanation:
          "push() gibt die neue Array-Laenge zurueck (also 1, 2, 3). " +
          "forEach erwartet () => void — aber void-Callbacks DUERFEN Werte " +
          "zurueckgeben. Der Wert wird einfach ignoriert. Ohne diese Regel " +
          "waere dieses alltaegliche Pattern ein Compile-Fehler.",
      },
      {
        lineIndex: 4,
        question: "Was gibt console.log(numbers) aus?",
        expectedAnswer: "[1, 2, 3]",
        variables: { "numbers": "[1, 2, 3]" },
        explanation:
          "Alle drei Werte wurden erfolgreich per push hinzugefuegt.",
      },
    ],
    concept: "void-callback",
    difficulty: 2,
  },

  // --- Exercise 3: Currying Schritt fuer Schritt ────────────────────────
  {
    id: "06-currying-steps",
    title: "Currying — Schritt fuer Schritt durch die Funktionskette",
    description:
      "Verfolge wie eine Currying-Funktion zuerst konfiguriert " +
      "und dann mehrfach aufgerufen wird.",
    code: [
      "function multiply(factor: number): (x: number) => number {",
      "  return (x) => factor * x;",
      "}",
      "",
      "const double = multiply(2);",
      "const triple = multiply(3);",
      "",
      "const a = double(5);",
      "const b = triple(5);",
      "const c = double(triple(4));",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "Welchen Typ hat 'double'? Was ist der Wert?",
        expectedAnswer: "(x: number) => number — eine Funktion die x * 2 berechnet",
        variables: { "double": "(x) => 2 * x (Typ: (x: number) => number)" },
        explanation:
          "multiply(2) gibt eine neue Funktion zurueck, die 2 * x berechnet. " +
          "factor = 2 wird per Closure gespeichert.",
      },
      {
        lineIndex: 5,
        question: "Welchen Typ hat 'triple'?",
        expectedAnswer: "(x: number) => number — eine Funktion die x * 3 berechnet",
        variables: {
          "double": "(x) => 2 * x",
          "triple": "(x) => 3 * x (Typ: (x: number) => number)",
        },
        explanation:
          "multiply(3) gibt eine Funktion die 3 * x berechnet. " +
          "Jeder Aufruf von multiply erstellt eine NEUE Closure.",
      },
      {
        lineIndex: 7,
        question: "Was ist der Wert von 'a'?",
        expectedAnswer: "10 (double(5) = 2 * 5)",
        variables: { "a": "10 (Typ: number)" },
        explanation: "double(5) = 2 * 5 = 10. Die Closure verwendet factor = 2.",
      },
      {
        lineIndex: 8,
        question: "Was ist der Wert von 'b'?",
        expectedAnswer: "15 (triple(5) = 3 * 5)",
        variables: { "a": "10", "b": "15 (Typ: number)" },
        explanation: "triple(5) = 3 * 5 = 15. Die Closure verwendet factor = 3.",
      },
      {
        lineIndex: 9,
        question: "Was ist der Wert von 'c'? Berechne von innen nach aussen.",
        expectedAnswer: "24 (triple(4) = 12, dann double(12) = 24)",
        variables: { "a": "10", "b": "15", "c": "24 (Typ: number)" },
        explanation:
          "Von innen nach aussen: triple(4) = 3 * 4 = 12. " +
          "Dann: double(12) = 2 * 12 = 24. Currying-Funktionen " +
          "lassen sich beliebig kombinieren.",
      },
    ],
    concept: "currying",
    difficulty: 3,
  },

  // --- Exercise 4: Type Guard und Narrowing ─────────────────────────────
  {
    id: "06-type-guard-narrowing",
    title: "Type Guard verengt den Typ schrittweise",
    description:
      "Verfolge wie ein Type Guard den Typ einer Variable " +
      "Schritt fuer Schritt verengt.",
    code: [
      "function isString(value: unknown): value is string {",
      "  return typeof value === 'string';",
      "}",
      "",
      "function process(input: unknown) {",
      "  // input ist unknown",
      "  if (isString(input)) {",
      "    // input ist string",
      "    console.log(input.toUpperCase());",
      "  } else {",
      "    // input ist immer noch unknown",
      "    console.log('Kein String:', input);",
      "  }",
      "}",
      "",
      "process('hello');",
      "process(42);",
    ],
    steps: [
      {
        lineIndex: 6,
        question: "Welchen Typ hat 'input' VOR dem if-Check?",
        expectedAnswer: "unknown",
        variables: { "input": "(Typ: unknown)" },
        explanation:
          "Innerhalb der process-Funktion ist input als unknown deklariert. " +
          "Ohne Narrowing kann man nichts damit anfangen.",
      },
      {
        lineIndex: 7,
        question: "Welchen Typ hat 'input' INNERHALB des if-Blocks nach isString(input)?",
        expectedAnswer: "string",
        variables: { "input": "(Typ: string — durch Type Guard verengt)" },
        explanation:
          "isString hat den Return-Typ 'value is string'. Wenn die Funktion " +
          "true zurueckgibt, verengt TypeScript input auf string. " +
          "Deshalb funktioniert input.toUpperCase() ohne Fehler.",
      },
      {
        lineIndex: 10,
        question: "Welchen Typ hat 'input' im else-Block?",
        expectedAnswer: "unknown (Type Guard schloss nur string aus, aber unknown minus string = unknown)",
        variables: { "input": "(Typ: unknown)" },
        explanation:
          "Im else-Block weiss TypeScript nur, dass input KEIN string ist. " +
          "Da input als unknown deklariert ist und unknown minus string = unknown, " +
          "bleibt der Typ unknown.",
      },
      {
        lineIndex: 15,
        question: "Was gibt process('hello') aus?",
        expectedAnswer: "HELLO",
        variables: {},
        explanation:
          "'hello' ist ein string. isString gibt true zurueck. " +
          "Im if-Block wird 'hello'.toUpperCase() = 'HELLO' ausgegeben.",
      },
      {
        lineIndex: 16,
        question: "Was gibt process(42) aus?",
        expectedAnswer: "Kein String: 42",
        variables: {},
        explanation:
          "42 ist kein string. isString gibt false zurueck. " +
          "Im else-Block wird 'Kein String: 42' ausgegeben.",
      },
    ],
    concept: "type-guard-narrowing",
    difficulty: 3,
  },
];
