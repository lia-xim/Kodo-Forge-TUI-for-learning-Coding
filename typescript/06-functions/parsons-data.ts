/**
 * Lektion 06 — Parson's Problems: Functions
 *
 * 4 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Type Guard, Overload, Currying, Assertion Function
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Type Guard ────────────────────────────────────────────
  {
    id: "L06-P1",
    title: "Benutzerdefinierten Type Guard implementieren",
    description:
      "Ordne die Zeilen so, dass ein Type Guard entsteht, der prueft " +
      "ob ein Wert ein User mit name und email ist.",
    correctOrder: [
      "interface User {",
      "  name: string;",
      "  email: string;",
      "}",
      "",
      "function isUser(value: unknown): value is User {",
      "  return (",
      "    typeof value === 'object' &&",
      "    value !== null &&",
      "    'name' in value &&",
      "    'email' in value",
      "  );",
      "}",
    ],
    distractors: [
      "function isUser(value: unknown): boolean {",
      "function isUser(value: User): value is User {",
    ],
    hint:
      "Ein Type Guard hat den Return-Typ 'value is Type' — nicht einfach boolean. " +
      "Der Parameter muss 'unknown' sein, nicht schon den Zieltyp haben.",
    concept: "type-guard",
    difficulty: 2,
  },

  // ─── Problem 2: Function Overload ─────────────────────────────────────
  {
    id: "L06-P2",
    title: "Function Overload fuer createElement",
    description:
      "Ordne die Zeilen so, dass createElement per Overload " +
      "den richtigen Element-Typ zurueckgibt.",
    correctOrder: [
      "function createElement(tag: 'img'): HTMLImageElement;",
      "function createElement(tag: 'input'): HTMLInputElement;",
      "function createElement(tag: string): HTMLElement {",
      "  return document.createElement(tag);",
      "}",
      "",
      "const img = createElement('img');",
      "// img hat Typ: HTMLImageElement",
    ],
    distractors: [
      "function createElement(tag: string): HTMLImageElement | HTMLInputElement {",
      "function createElement(tag: 'img' | 'input'): HTMLElement;",
    ],
    hint:
      "Spezifische Overloads kommen ZUERST, die Implementation Signature zuletzt. " +
      "Die Implementation hat den breitesten Typ (string -> HTMLElement).",
    concept: "function-overloads",
    difficulty: 3,
  },

  // ─── Problem 3: Currying-Pattern ──────────────────────────────────────
  {
    id: "L06-P3",
    title: "Currying-Funktion fuer Konfiguration",
    description:
      "Ordne die Zeilen so, dass eine Currying-Funktion entsteht, " +
      "die einen Formatter konfiguriert und dann wiederverwendbar ist.",
    correctOrder: [
      "function createFormatter(locale: string): (amount: number) => string {",
      "  const formatter = new Intl.NumberFormat(locale, {",
      "    style: 'currency',",
      "    currency: locale === 'de-DE' ? 'EUR' : 'USD',",
      "  });",
      "  return (amount) => formatter.format(amount);",
      "}",
      "",
      "const formatEuro = createFormatter('de-DE');",
      "console.log(formatEuro(1234.56));",
    ],
    distractors: [
      "function createFormatter(locale: string, amount: number): string {",
      "return formatter.format(locale);",
    ],
    hint:
      "createFormatter gibt eine FUNKTION zurueck (Return-Typ ist ein Funktionstyp). " +
      "Die innere Funktion verwendet die locale-Variable per Closure.",
    concept: "currying",
    difficulty: 3,
  },

  // ─── Problem 4: Assertion Function ────────────────────────────────────
  {
    id: "L06-P4",
    title: "Assertion Function mit asserts",
    description:
      "Ordne die Zeilen so, dass eine Assertion Function entsteht, " +
      "die garantiert dass ein Wert nicht null/undefined ist.",
    correctOrder: [
      "function assertDefined<T>(",
      "  value: T | null | undefined,",
      "  message: string",
      "): asserts value is T {",
      "  if (value === null || value === undefined) {",
      "    throw new Error(message);",
      "  }",
      "}",
      "",
      "const name: string | null = getName();",
      "assertDefined(name, 'Name is required');",
      "console.log(name.toUpperCase()); // name ist string",
    ],
    distractors: [
      "): value is T {",
      "): asserts value is NonNullable<T> {",
    ],
    hint:
      "Assertion Functions verwenden 'asserts value is T' als Return-Typ. " +
      "Nach dem Aufruf (ohne throw) ist der Typ garantiert — hier wird T " +
      "von null/undefined befreit.",
    concept: "assertion-function",
    difficulty: 4,
  },
];
