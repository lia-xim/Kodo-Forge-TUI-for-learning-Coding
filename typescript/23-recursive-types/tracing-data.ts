/**
 * Lektion 23 — Tracing-Exercises: Recursive Types
 *
 * Themen:
 *  - LinkedList-Traversierung
 *  - DeepPartial Typ-Aufloesung
 *  - Paths Berechnung
 *  - Flatten Rekursion
 *
 * Schwierigkeit steigend: 2 → 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: LinkedList-Traversierung ─────────────────────────────────
  {
    id: "23-linked-list-traverse",
    title: "LinkedList traversieren und Werte sammeln",
    description:
      "Verfolge wie die toArray-Funktion eine verkettete Liste " +
      "durchlaeuft und die Werte in ein Array sammelt.",
    code: [
      "type LinkedList<T> = { value: T; next: LinkedList<T> | null };",
      "",
      "const list: LinkedList<string> = {",
      "  value: 'a',",
      "  next: { value: 'b', next: { value: 'c', next: null } },",
      "};",
      "",
      "const result: string[] = [];",
      "let current: LinkedList<string> | null = list;",
      "while (current !== null) {",
      "  result.push(current.value);",
      "  current = current.next;",
      "}",
      "console.log(result);",
    ],
    steps: [
      {
        lineIndex: 8,
        question: "Was ist current.value nach der ersten Zuweisung?",
        expectedAnswer: "a",
        variables: { "current.value": "'a'", "result": "[]" },
        explanation:
          "current zeigt auf den ersten Knoten der Liste mit value 'a'.",
      },
      {
        lineIndex: 10,
        question: "Was enthaelt result nach dem ersten push?",
        expectedAnswer: "['a']",
        variables: { "current.value": "'a'", "result": "['a']" },
        explanation:
          "current.value ('a') wird zum Array hinzugefuegt.",
      },
      {
        lineIndex: 11,
        question: "Was ist current.value nach current = current.next?",
        expectedAnswer: "b",
        variables: { "current.value": "'b'", "result": "['a']" },
        explanation:
          "current zeigt jetzt auf den zweiten Knoten mit value 'b'.",
      },
      {
        lineIndex: 10,
        question: "Was enthaelt result nach dem zweiten push?",
        expectedAnswer: "['a', 'b']",
        variables: { "current.value": "'b'", "result": "['a', 'b']" },
        explanation:
          "current.value ('b') wird angefuegt. Nach dem naechsten next-Schritt " +
          "und push wird result ['a', 'b', 'c'] sein, dann ist current.next null.",
      },
      {
        lineIndex: 13,
        question: "Was gibt console.log(result) aus?",
        expectedAnswer: "['a', 'b', 'c']",
        variables: { "current": "null", "result": "['a', 'b', 'c']" },
        explanation:
          "Die Schleife hat alle drei Knoten durchlaufen. " +
          "current ist null → Schleife endet. result enthaelt alle Werte.",
      },
    ],
    concept: "recursive-data-traversal",
    difficulty: 2,
  },

  // ─── Exercise 2: DeepPartial Typ-Aufloesung ─────────────────────────────
  {
    id: "23-deep-partial-resolution",
    title: "DeepPartial Typ-Aufloesung nachvollziehen",
    description:
      "Verfolge wie TypeScript DeepPartial<T> Schritt fuer Schritt " +
      "aufloest bei einem verschachtelten Objekt.",
    code: [
      "type DeepPartial<T> = {",
      "  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];",
      "};",
      "",
      "type Config = {",
      "  server: { host: string; port: number };",
      "  debug: boolean;",
      "};",
      "",
      "type Result = DeepPartial<Config>;",
      "// Schritt 1: K = 'server' → Config['server'] extends object → true",
      "// Schritt 2: Rekursion auf { host: string; port: number }",
      "// Schritt 3: K = 'debug' → boolean extends object → false",
    ],
    steps: [
      {
        lineIndex: 9,
        question: "Was ist das Ergebnis fuer K='server'? (extends object = ?)",
        expectedAnswer: "true, also DeepPartial<{ host: string; port: number }>",
        variables: { "K": "'server'", "T[K]": "{ host: string; port: number }" },
        explanation:
          "{ host: string; port: number } extends object ist true. " +
          "Also wird rekursiv DeepPartial darauf angewendet.",
      },
      {
        lineIndex: 11,
        question: "Was ergibt DeepPartial<{ host: string; port: number }>?",
        expectedAnswer: "{ host?: string; port?: number }",
        variables: { "K": "'host' | 'port'", "extends object": "false fuer string und number" },
        explanation:
          "string extends object = false, number extends object = false. " +
          "Also werden host und port direkt uebernommen, nur mit ? (optional).",
      },
      {
        lineIndex: 12,
        question: "Was ist das Ergebnis fuer K='debug'? (boolean extends object = ?)",
        expectedAnswer: "false, also bleibt boolean direkt (mit ?)",
        variables: { "K": "'debug'", "T[K]": "boolean" },
        explanation:
          "boolean extends object ist false. Also wird debug?: boolean.",
      },
      {
        lineIndex: 9,
        question: "Was ist der vollstaendige Ergebnis-Typ von DeepPartial<Config>?",
        expectedAnswer: "{ server?: { host?: string; port?: number }; debug?: boolean }",
        variables: {
          "Result": "{ server?: { host?: string; port?: number }; debug?: boolean }",
        },
        explanation:
          "Alle Properties auf allen Ebenen sind jetzt optional (?).",
      },
    ],
    concept: "deep-partial-resolution",
    difficulty: 3,
  },

  // ─── Exercise 3: Paths Berechnung ────────────────────────────────────────
  {
    id: "23-paths-computation",
    title: "Paths<T> Schritt fuer Schritt berechnen",
    description:
      "Verfolge wie Paths<T> die Union aller Punkt-getrennten Pfade " +
      "eines verschachtelten Objekts berechnet.",
    code: [
      "type Paths<T> = T extends object",
      "  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]",
      "  : never;",
      "",
      "type Data = {",
      "  a: { b: string };",
      "  c: number;",
      "};",
      "",
      "type Result = Paths<Data>;",
    ],
    steps: [
      {
        lineIndex: 9,
        question: "Was berechnet Paths fuer K='a'? (a: { b: string })",
        expectedAnswer: "'a' | `a.${Paths<{ b: string }>}`",
        variables: { "K": "'a'", "T[K]": "{ b: string }" },
        explanation:
          "Fuer K='a': Der Pfad 'a' selbst, plus alle Unterpfade " +
          "mit 'a.' Prefix.",
      },
      {
        lineIndex: 9,
        question: "Was ergibt Paths<{ b: string }> (die Rekursion fuer a)?",
        expectedAnswer: "'b'",
        variables: { "K": "'b'", "T[K]": "string" },
        explanation:
          "K='b', Paths<string> = never (kein Objekt). " +
          "Also: 'b' | `b.${never}` = 'b' | never = 'b'.",
      },
      {
        lineIndex: 9,
        question: "Was berechnet Paths fuer K='c'? (c: number)",
        expectedAnswer: "'c'",
        variables: { "K": "'c'", "T[K]": "number" },
        explanation:
          "Paths<number> = never (kein Objekt). " +
          "Also: 'c' | `c.${never}` = 'c' | never = 'c'.",
      },
      {
        lineIndex: 9,
        question: "Was ist der vollstaendige Ergebnis-Typ von Paths<Data>?",
        expectedAnswer: "'a' | 'a.b' | 'c'",
        variables: { "Result": "'a' | 'a.b' | 'c'" },
        explanation:
          "Alle Pfade zusammen: 'a' (Objekt), 'a.b' (verschachtelter " +
          "String), 'c' (primitiver Wert auf oberster Ebene).",
      },
    ],
    concept: "paths-computation",
    difficulty: 4,
  },

  // ─── Exercise 4: Flatten Rekursion ────────────────────────────────────────
  {
    id: "23-flatten-recursion",
    title: "Flatten<T> Rekursionsschritte verfolgen",
    description:
      "Verfolge wie der Flatten-Typ verschachtelte Array-Typen " +
      "Schritt fuer Schritt aufloest.",
    code: [
      "type Flatten<T> = T extends (infer U)[]",
      "  ? Flatten<U>",
      "  : T;",
      "",
      "type A = Flatten<number[][][]>;",
      "type B = Flatten<string>;",
      "type C = Flatten<(boolean | number[])[]>;",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "Schritt 1: Flatten<number[][][]> — ist es ein Array?",
        expectedAnswer: "Ja, U = number[][], weiter mit Flatten<number[][]>",
        variables: { "T": "number[][][]", "U": "number[][]" },
        explanation:
          "number[][][] extends (infer U)[] ist true, U = number[][].",
      },
      {
        lineIndex: 4,
        question: "Schritt 2: Flatten<number[][]> — ist es ein Array?",
        expectedAnswer: "Ja, U = number[], weiter mit Flatten<number[]>",
        variables: { "T": "number[][]", "U": "number[]" },
        explanation:
          "number[][] extends (infer U)[] ist true, U = number[].",
      },
      {
        lineIndex: 4,
        question: "Schritt 3: Flatten<number[]> — ist es ein Array?",
        expectedAnswer: "Ja, U = number, weiter mit Flatten<number>",
        variables: { "T": "number[]", "U": "number" },
        explanation:
          "number[] extends (infer U)[] ist true, U = number.",
      },
      {
        lineIndex: 4,
        question: "Schritt 4: Flatten<number> — ist es ein Array?",
        expectedAnswer: "Nein! Abbruch. Ergebnis: number",
        variables: { "T": "number", "Result": "number" },
        explanation:
          "number extends (infer U)[] ist false. Abbruchbedingung erreicht. " +
          "Flatten<number[][][]> = number.",
      },
    ],
    concept: "flatten-recursion",
    difficulty: 3,
  },
];
