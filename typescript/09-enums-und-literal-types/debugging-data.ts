/**
 * Lektion 09 — Debugging Challenges: Enums & Literal Types
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L09-D1",
    title: "Numerisches Enum akzeptiert jede Zahl",
    buggyCode: [
      "enum Permission { Read = 1, Write = 2, Execute = 4 }",
      "",
      "function checkPermission(p: Permission): string {",
      "  if (p === Permission.Read) return 'read';",
      "  if (p === Permission.Write) return 'write';",
      "  if (p === Permission.Execute) return 'execute';",
      "  return 'unknown';",
      "}",
      "",
      "console.log(checkPermission(999)); // 'unknown' — aber kein Compile-Error!",
    ].join("\n"),
    bugType: "soundness-hole",
    bugLine: 10,
    options: [
      "Numerische Enums erlauben JEDE Zahl — TypeScript prueft die Werte nicht",
      "checkPermission muss async sein",
      "Permission braucht einen default-Case",
      "999 wird automatisch zu Permission.Read",
    ],
    correctOption: 0,
    hints: [
      "Welche Zahlen akzeptiert ein numerisches Enum?",
      "TypeScript erlaubt jede Zahl — wegen Bitwise-Flags (Read | Write = 3).",
      "Verwende String Enums oder Union Literal Types fuer echte Typsicherheit.",
    ],
    fixedCode: [
      "// String Enum — kein Soundness-Loch!",
      "enum Permission { Read = 'READ', Write = 'WRITE', Execute = 'EXECUTE' }",
    ].join("\n"),
    explanation:
      "Numerische Enums haben ein Soundness-Loch: JEDE Zahl ist als Wert zulaessig. " +
      "Das existiert fuer Bitwise-Flags (Read | Write = 3). " +
      "String Enums und Union Literal Types haben dieses Problem nicht.",
    concept: "numeric-enum-soundness",
    difficulty: 3,
  },

  {
    id: "L09-D2",
    title: "Object.keys zaehlt Reverse Mapping mit",
    buggyCode: [
      "enum Direction { North, South, East, West }",
      "",
      "const allDirections = Object.keys(Direction);",
      "console.log(`${allDirections.length} Richtungen`);",
      "// Erwartet: '4 Richtungen'",
      "// Tatsaechlich: '8 Richtungen'!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 3,
    options: [
      "Object.keys zaehlt auch die Reverse-Mapping-Eintraege (Zahl→Name) mit",
      "Direction hat heimlich 8 Mitglieder",
      "Object.keys funktioniert nicht mit Enums",
      "const allDirections hat den falschen Typ",
    ],
    correctOption: 0,
    hints: [
      "Was generiert TypeScript fuer ein numerisches Enum?",
      "Das generierte Objekt hat: { 0: 'North', North: 0, 1: 'South', South: 1, ... }",
      "Loesung: Object.keys(Direction).filter(k => isNaN(Number(k))) fuer nur die Namen.",
    ],
    fixedCode: [
      "const names = Object.keys(Direction).filter(k => isNaN(Number(k)));",
      "console.log(`${names.length} Richtungen`); // '4 Richtungen'",
    ].join("\n"),
    explanation:
      "Numerische Enums haben doppelte Eintraege durch Reverse Mapping. " +
      "Object.keys zaehlt Name→Wert UND Wert→Name. " +
      "Filtern mit isNaN(Number(k)) gibt nur die String-Namen.",
    concept: "reverse-mapping-object-keys",
    difficulty: 3,
  },

  {
    id: "L09-D3",
    title: "let verliert den Literal-Typ",
    buggyCode: [
      "function fetchData(method: 'GET' | 'POST', url: string): void {",
      "  console.log(`${method} ${url}`);",
      "}",
      "",
      "let method = 'GET';",
      "fetchData(method, '/api/users');",
      "// Error: string ist nicht 'GET' | 'POST'!",
    ].join("\n"),
    errorMessage: "Argument of type 'string' is not assignable to parameter of type '\"GET\" | \"POST\"'.",
    bugType: "type-error",
    bugLine: 5,
    options: [
      "let widened 'GET' zu string — der Literal-Typ geht verloren",
      "fetchData akzeptiert keine Variablen",
      "method muss als enum definiert sein",
      "'GET' ist kein gueltiger String",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat let method = 'GET'?",
      "let widened zu string. const haette den Literal-Typ 'GET' behalten.",
      "Drei Loesungen: const statt let, 'GET' as const, oder let method: 'GET' | 'POST' = 'GET'.",
    ],
    fixedCode: [
      "// Loesung 1: const",
      "const method = 'GET';",
      "",
      "// Loesung 2: as const",
      "let method = 'GET' as const;",
      "",
      "// Loesung 3: explizite Annotation",
      "let method: 'GET' | 'POST' = 'GET';",
    ].join("\n"),
    explanation:
      "let widened Literal-Werte zum allgemeinen Typ (string). " +
      "fetchData erwartet den Literal-Typ 'GET' | 'POST'. " +
      "const, as const oder explizite Annotation beheben das.",
    concept: "literal-widening-let",
    difficulty: 2,
  },

  {
    id: "L09-D4",
    title: "const enum mit isolatedModules",
    buggyCode: [
      "// constants.ts",
      "export const enum Color { Red = 'RED', Green = 'GREEN', Blue = 'BLUE' }",
      "",
      "// app.ts",
      "import { Color } from './constants';",
      "console.log(Color.Red);",
      "// Error mit isolatedModules: const enum not allowed",
    ].join("\n"),
    errorMessage: "Cannot access ambient const enums when 'isolatedModules' flag is provided.",
    bugType: "type-error",
    bugLine: 2,
    options: [
      "const enum ist nicht kompatibel mit isolatedModules (Vite, esbuild, Next.js)",
      "export funktioniert nicht mit const enum",
      "Color braucht eine default-Exporte",
      "const enum existiert nicht in TypeScript",
    ],
    correctOption: 0,
    hints: [
      "Was macht isolatedModules?",
      "isolatedModules kompiliert jede Datei einzeln — cross-file const enum geht nicht.",
      "Verwende ein regulaeres enum oder ein as const Object.",
    ],
    fixedCode: [
      "// Loesung: as const Object statt const enum",
      "export const Color = { Red: 'RED', Green: 'GREEN', Blue: 'BLUE' } as const;",
      "export type Color = typeof Color[keyof typeof Color];",
    ].join("\n"),
    explanation:
      "const enum wird inline ersetzt — der Compiler braucht die Definition. " +
      "Mit isolatedModules (Standard bei modernen Build-Tools) wird jede Datei " +
      "einzeln kompiliert — cross-file const enum funktioniert nicht. " +
      "as const Objects sind die moderne Alternative.",
    concept: "const-enum-isolated-modules",
    difficulty: 4,
  },

  {
    id: "L09-D5",
    title: "Branded Type ohne Konstruktor-Funktion",
    buggyCode: [
      "type EUR = number & { __brand: 'EUR' };",
      "",
      "const price: EUR = 9.99;",
      "// Error: number ist nicht EUR!",
    ].join("\n"),
    errorMessage: "Type 'number' is not assignable to type 'EUR'.",
    bugType: "type-error",
    bugLine: 3,
    options: [
      "Man braucht eine Konstruktor-Funktion oder as-Cast — direkte Zuweisung geht nicht",
      "EUR muss als interface definiert sein",
      "__brand muss ein Symbol sein",
      "Branded Types funktionieren nicht mit number",
    ],
    correctOption: 0,
    hints: [
      "Warum kann man eine normale Zahl nicht an einen Branded Type zuweisen?",
      "9.99 hat den Typ number — nicht number & { __brand: 'EUR' }.",
      "Erstelle eine Konstruktor-Funktion: function eur(n: number): EUR { return n as EUR; }",
    ],
    fixedCode: [
      "type EUR = number & { __brand: 'EUR' };",
      "",
      "function eur(amount: number): EUR { return amount as EUR; }",
      "const price = eur(9.99); // OK!",
    ].join("\n"),
    explanation:
      "Branded Types brauchen einen expliziten 'Eintrittspunkt' — " +
      "eine Konstruktor-Funktion oder as-Cast. Direkte Zuweisung einer " +
      "normalen Zahl funktioniert nicht, weil number nicht die __brand-Property hat. " +
      "Das ist beabsichtigt — es verhindert versehentliche Verwechslungen.",
    concept: "branded-type-constructor",
    difficulty: 3,
  },
];
