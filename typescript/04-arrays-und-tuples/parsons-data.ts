/**
 * Lektion 04 — Parson's Problems: Arrays & Tuples
 *
 * 3 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: filter mit Type Predicate, Tuple-Destructuring, readonly-Funktion
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: filter mit Type Predicate ───────────────────────────────
  {
    id: "L04-P1",
    title: "Array.filter mit Type Predicate",
    description:
      "Ordne die Zeilen so, dass eine Funktion entsteht, die " +
      "null-Werte aus einem Array filtert und TypeScript den " +
      "gefilterten Typ korrekt erkennt.",
    correctOrder: [
      "function isNotNull<T>(value: T | null): value is T {",
      "  return value !== null;",
      "}",
      "",
      "const mixed: (string | null)[] = ['hello', null, 'world'];",
      "const strings: string[] = mixed.filter(isNotNull);",
    ],
    distractors: [
      "function isNotNull<T>(value: T | null): boolean {",
      "const strings = mixed.filter(v => v !== null);",
    ],
    hint:
      "Ohne Type Predicate (value is T) erkennt TypeScript den gefilterten " +
      "Typ nicht — das Ergebnis bleibt (string | null)[]. Die Funktion muss " +
      "'value is T' statt 'boolean' als Return-Typ haben.",
    concept: "type-predicate",
    difficulty: 3,
  },

  // ─── Problem 2: Tuple-Destructuring ─────────────────────────────────────
  {
    id: "L04-P2",
    title: "Tuple mit benanntem Destructuring",
    description:
      "Ordne die Zeilen so, dass ein Tuple-Typ fuer HTTP-Responses " +
      "definiert und per Destructuring verwendet wird.",
    correctOrder: [
      "type HttpResponse = [status: number, body: string, ok: boolean];",
      "",
      "function fetchData(): HttpResponse {",
      "  return [200, '{\"data\": 42}', true];",
      "}",
      "",
      "const [status, body, ok] = fetchData();",
      "console.log(`Status ${status}: ${ok ? body : 'Fehler'}`);",
    ],
    distractors: [
      "type HttpResponse = { status: number; body: string; ok: boolean };",
      "const { status, body, ok } = fetchData();",
    ],
    hint:
      "Tuples verwenden Array-Syntax [a, b, c] — nicht Objekt-Syntax { a, b, c }. " +
      "Tuple-Destructuring nutzt eckige Klammern, Objekt-Destructuring geschweifte.",
    concept: "tuple-destructuring",
    difficulty: 2,
  },

  // ─── Problem 3: readonly-Funktion ───────────────────────────────────────
  {
    id: "L04-P3",
    title: "Funktion mit readonly-Parameter",
    description:
      "Ordne die Zeilen so, dass eine Funktion entsteht, die ein " +
      "readonly-Array akzeptiert und die Summe berechnet — ohne " +
      "das Original-Array zu veraendern.",
    correctOrder: [
      "function sum(numbers: readonly number[]): number {",
      "  let total = 0;",
      "  for (const n of numbers) {",
      "    total += n;",
      "  }",
      "  return total;",
      "}",
    ],
    distractors: [
      "function sum(numbers: number[]): number {",
      "  numbers.push(0); // Initialisierung",
    ],
    hint:
      "readonly number[] verhindert, dass die Funktion das Array veraendert " +
      "(kein push, pop, splice etc.). Der Parameter-Typ number[] ohne readonly " +
      "wuerde Mutationen erlauben.",
    concept: "readonly-arrays",
    difficulty: 2,
  },
];
