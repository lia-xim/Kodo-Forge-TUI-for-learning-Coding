/**
 * Lektion 01 — Debugging Challenges: Setup & Erste Schritte
 *
 * 4 Challenges zu Type Assertions, instanceof, tsconfig, strictNullChecks.
 * Fokus: Unterschied Compile-Zeit vs. Laufzeit, Type Erasure.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: as string statt Konvertierung ──────────────────────────
  {
    id: "L01-D1",
    title: "Type Assertion ist kein Runtime-Cast",
    buggyCode: [
      "function toUpperCase(value: unknown): string {",
      "  const text = value as string;",
      "  return text.toUpperCase();",
      "}",
      "",
      "console.log(toUpperCase(42));",
    ].join("\n"),
    errorMessage: "TypeError: text.toUpperCase is not a function",
    bugType: "runtime-error",
    bugLine: 2,
    options: [
      "'as string' wandelt den Wert zur Laufzeit in einen String um",
      "'as string' ist nur ein Compile-Zeit-Hinweis und aendert nichts zur Laufzeit",
      "'as string' funktioniert nur mit Objekten, nicht mit Primitives",
      "Der Fehler liegt in toUpperCase(), nicht in der Assertion",
    ],
    correctOption: 1,
    hints: [
      "Type Assertions veraendern den Wert nicht — sie ueberschreiben nur den Compiler.",
      "Was passiert mit TypeScript-Typen nach der Kompilierung? (Type Erasure)",
      "Zur Laufzeit ist 'value as string' identisch mit einfach 'value'.",
    ],
    fixedCode: [
      "function toUpperCase(value: unknown): string {",
      "  if (typeof value === 'string') {",
      "    return value.toUpperCase();",
      "  }",
      "  return String(value).toUpperCase();",
      "}",
    ].join("\n"),
    explanation:
      "'as string' ist eine Type Assertion — sie sagt dem Compiler 'vertrau mir, " +
      "das ist ein String', aendert aber NICHTS zur Laufzeit. Nach Type Erasure " +
      "ist der Code identisch mit: const text = value; Wenn value eine Zahl ist, " +
      "hat sie keine .toUpperCase()-Methode. Loesung: typeof-Check oder String()-Konvertierung.",
    concept: "type-assertion",
    difficulty: 1,
  },

  // ─── Challenge 2: instanceof mit Interface ───────────────────────────────
  {
    id: "L01-D2",
    title: "instanceof funktioniert nicht mit Interfaces",
    buggyCode: [
      "interface Animal {",
      "  name: string;",
      "  sound: string;",
      "}",
      "",
      "function isAnimal(value: unknown): boolean {",
      "  return value instanceof Animal;",
      "}",
    ].join("\n"),
    errorMessage: "'Animal' only refers to a type, but is being used as a value here.",
    bugType: "type-error",
    bugLine: 7,
    options: [
      "instanceof kann nur mit Klassen verwendet werden, nicht mit Interfaces",
      "Der Parameter muss 'any' statt 'unknown' sein",
      "Man muss 'typeof value === Animal' schreiben",
      "Das Interface braucht ein 'export' davor",
    ],
    correctOption: 0,
    hints: [
      "Was passiert mit Interfaces nach der TypeScript-Kompilierung?",
      "Interfaces existieren zur Laufzeit nicht — sie werden durch Type Erasure entfernt.",
      "instanceof braucht einen Konstruktor (Klasse/Funktion) als rechten Operand.",
    ],
    fixedCode: [
      "interface Animal {",
      "  name: string;",
      "  sound: string;",
      "}",
      "",
      "function isAnimal(value: unknown): value is Animal {",
      "  return (",
      "    typeof value === 'object' &&",
      "    value !== null &&",
      "    'name' in value &&",
      "    'sound' in value",
      "  );",
      "}",
    ].join("\n"),
    explanation:
      "Interfaces existieren NUR zur Compile-Zeit. Nach Type Erasure gibt es kein " +
      "'Animal' mehr in JavaScript. instanceof braucht eine Klasse (einen Konstruktor), " +
      "der zur Laufzeit existiert. Fuer Interfaces muss man Property-Checks verwenden " +
      "('name' in value) und die Funktion als Type Predicate (value is Animal) markieren.",
    concept: "type-erasure",
    difficulty: 2,
  },

  // ─── Challenge 3: Falsches target in tsconfig ────────────────────────────
  {
    id: "L01-D3",
    title: "Falsches target in tsconfig",
    buggyCode: [
      "// tsconfig.json:",
      '// { "compilerOptions": { "target": "ES5" } }',
      "",
      "const greet = (name: string) => `Hallo ${name}!`;",
      "",
      "const nums = [1, 2, 3];",
      "const doubled = nums.map(n => n * 2);",
    ].join("\n"),
    errorMessage:
      "Bei target ES5: Arrow-Functions und Template-Literals werden umgeschrieben.",
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "ES5 unterstuetzt keine Arrow-Functions, der Code wird in function()-Syntax umgeschrieben",
      "ES5 kann keine Strings verarbeiten",
      "map() existiert in ES5 nicht, der Code stuerzt ab",
      "Template-Literals funktionieren in ES5 identisch",
    ],
    correctOption: 0,
    hints: [
      "Das 'target' in tsconfig bestimmt, in welche JavaScript-Version kompiliert wird.",
      "Arrow-Functions (=>) und Template-Literals (`...`) gibt es erst seit ES2015/ES6.",
      "Bei ES5 muss tsc diese Features durch aeltere Syntax ersetzen.",
    ],
    fixedCode: [
      "// tsconfig.json:",
      '// { "compilerOptions": { "target": "ES2022" } }',
      "",
      "const greet = (name: string) => `Hallo ${name}!`;",
      "",
      "const nums = [1, 2, 3];",
      "const doubled = nums.map(n => n * 2);",
    ].join("\n"),
    explanation:
      "Das 'target' in tsconfig.json bestimmt die Ziel-JavaScript-Version. Bei ES5 " +
      "werden Arrow-Functions zu function()-Ausdruecken und Template-Literals zu String-" +
      "Konkatenation. Das aendert zwar nicht die Logik, aber das Debugging wird " +
      "schwieriger und Performance leidet. " +
      "Empfehlung: Mindestens ES2022 fuer moderne Node.js-Projekte.",
    concept: "tsconfig",
    difficulty: 1,
  },

  // ─── Challenge 4: Fehlender strictNullChecks ─────────────────────────────
  {
    id: "L01-D4",
    title: "Fehlender strictNullChecks",
    buggyCode: [
      "// tsconfig.json: { \"compilerOptions\": { \"strict\": false } }",
      "",
      "function getFirst(items: string[]): string {",
      "  return items[0];",
      "}",
      "",
      "const result = getFirst([]);",
      "console.log(result.toUpperCase());",
    ].join("\n"),
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
    bugType: "soundness-hole",
    bugLine: 1,
    options: [
      "items[0] bei leerem Array gibt undefined zurueck, aber der Typ sagt 'string'",
      "getFirst() gibt immer einen leeren String zurueck",
      "strict: false bedeutet, dass TypeScript gar nicht prueft",
      "Das Array muss mit 'as const' deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Was gibt items[0] zurueck, wenn items ein leeres Array ist?",
      "Ohne strictNullChecks behandelt TypeScript undefined/null nicht separat.",
      "Der Return-Typ ist 'string', aber zur Laufzeit kommt undefined zurueck.",
    ],
    fixedCode: [
      "// tsconfig.json: { \"compilerOptions\": { \"strict\": true } }",
      "",
      "function getFirst(items: string[]): string | undefined {",
      "  return items[0];",
      "}",
      "",
      "const result = getFirst([]);",
      "if (result !== undefined) {",
      "  console.log(result.toUpperCase());",
      "}",
    ].join("\n"),
    explanation:
      "Ohne strictNullChecks erkennt TypeScript nicht, dass items[0] bei einem " +
      "leeren Array undefined ist. Der Typ sagt 'string', aber zur Laufzeit ist " +
      "es undefined — ein Soundness Hole. Mit strict: true und dem richtigen " +
      "Return-Typ (string | undefined) erzwingt TypeScript eine Null-Pruefung.",
    concept: "strict-mode",
    difficulty: 2,
  },
];
