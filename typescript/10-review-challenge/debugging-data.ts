/**
 * Lektion 10 — Debugging Challenges: Review Challenge
 *
 * 5 gemischte Challenges die Konzepte aus mehreren Lektionen kombinieren.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L10-D1",
    title: "Type Erasure + instanceof = Problem",
    buggyCode: [
      "interface Admin { name: string; role: 'admin'; }",
      "",
      "function isAdmin(data: unknown): boolean {",
      "  return data instanceof Admin;",
      "}",
    ].join("\n"),
    errorMessage: "'Admin' only refers to a type, but is being used as a value here.",
    bugType: "type-error",
    bugLine: 4,
    options: [
      "Interfaces existieren nicht zur Laufzeit — instanceof funktioniert nur mit Klassen",
      "Admin muss exportiert werden",
      "instanceof braucht den new-Operator",
      "data muss erst zu Admin gecastet werden",
    ],
    correctOption: 0,
    hints: [
      "Was passiert mit Interfaces bei der Kompilierung? (L02: Type Erasure)",
      "Interfaces verschwinden komplett im JavaScript — es gibt nichts wogegen instanceof pruefen koennte.",
      "Verwende einen Type Guard: function isAdmin(data: unknown): data is Admin (L06).",
    ],
    fixedCode: [
      "function isAdmin(data: unknown): data is Admin {",
      "  return typeof data === 'object' && data !== null && 'role' in data && (data as Admin).role === 'admin';",
      "}",
    ].join("\n"),
    explanation:
      "Type Erasure (L02): Interfaces existieren nicht zur Laufzeit. " +
      "instanceof prueft die Prototype-Chain — da Interfaces keine haben, " +
      "ist das ein Fehler. Loesung: Type Guard mit Laufzeit-Checks (L06).",
    concept: "type-erasure-instanceof (L02+L06)",
    difficulty: 3,
  },

  {
    id: "L10-D2",
    title: "Shallow Readonly taeuscht Sicherheit vor",
    buggyCode: [
      "interface AppState {",
      "  readonly user: { name: string; loggedIn: boolean };",
      "  readonly settings: { theme: 'light' | 'dark' };",
      "}",
      "",
      "const state: AppState = {",
      "  user: { name: 'Max', loggedIn: true },",
      "  settings: { theme: 'light' },",
      "};",
      "",
      "state.user.loggedIn = false; // Kein Fehler!",
      "// Aber: state.user = { ... } waere ein Fehler",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 11,
    options: [
      "readonly ist shallow — es schuetzt nur die direkte Property, nicht verschachtelte Objekte",
      "loggedIn muss auch readonly sein",
      "AppState braucht Readonly<T>",
      "state muss mit as const definiert werden",
    ],
    correctOption: 0,
    hints: [
      "Was schuetzt readonly genau? (L04/L05)",
      "readonly schuetzt die Zuweisung der Property selbst, nicht die Mutation des Wertes.",
      "Loesung: Readonly<T> rekursiv anwenden oder as const fuer tiefes Freeze.",
    ],
    fixedCode: [
      "const state = {",
      "  user: { name: 'Max', loggedIn: true },",
      "  settings: { theme: 'light' as const },",
      "} as const;",
      "// Jetzt ist ALLES readonly — auch verschachtelte Properties",
    ].join("\n"),
    explanation:
      "readonly ist shallow (L04/L05): state.user ist geschuetzt, aber " +
      "state.user.loggedIn nicht. Fuer tiefes Readonly: as const (L09) " +
      "oder eine rekursive DeepReadonly-Utility.",
    concept: "shallow-readonly (L04+L05+L09)",
    difficulty: 3,
  },

  {
    id: "L10-D3",
    title: "Excess Property Check nur bei frischen Literalen",
    buggyCode: [
      "interface Config { host: string; port: number; }",
      "",
      "const rawConfig = { host: 'localhost', port: 3000, debug: true, verbose: true };",
      "const config: Config = rawConfig; // Kein Fehler?!",
      "",
      "// Aber direkt wuerde es scheitern:",
      "// const config2: Config = { host: 'localhost', port: 3000, debug: true }; // Error!",
    ].join("\n"),
    bugType: "soundness-hole",
    bugLine: 4,
    options: [
      "Excess Property Check greift nur bei frischen Objekt-Literalen, nicht bei Variablen",
      "rawConfig hat automatisch den Typ Config",
      "debug und verbose werden ignoriert",
      "const verhindert den Check",
    ],
    correctOption: 0,
    hints: [
      "Wann prueft TypeScript auf 'extra' Properties? (L05)",
      "Nur bei FRISCHEN Objekt-Literalen — ueber Variablen greift der Check nicht.",
      "Strukturelle Typisierung: rawConfig hat host und port, das reicht fuer Config.",
    ],
    fixedCode: [
      "// Loesung 1: satisfies (prueft + behaelt Typ)",
      "const config = { host: 'localhost', port: 3000 } satisfies Config;",
      "",
      "// Loesung 2: Direkte Annotation",
      "const config: Config = { host: 'localhost', port: 3000 };",
    ].join("\n"),
    explanation:
      "Der Excess Property Check (L05) greift NUR bei frischen Literalen. " +
      "Ueber eine Variable prueft TypeScript nur die Struktur — extra Properties " +
      "sind bei struktureller Typisierung erlaubt. satisfies (L03) ist die moderne Loesung.",
    concept: "excess-property-check (L05+L03)",
    difficulty: 4,
  },

  {
    id: "L10-D4",
    title: "Enum + typeof Verwechslung",
    buggyCode: [
      "enum Status { Active = 'ACTIVE', Inactive = 'INACTIVE' }",
      "",
      "function isActive(status: Status): boolean {",
      "  return typeof status === 'string' && status === 'ACTIVE';",
      "}",
      "",
      "isActive(Status.Active); // true? false?",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 4,
    options: [
      "status === 'ACTIVE' funktioniert NICHT — String Enums sind nominal, man muss Status.Active verwenden",
      "typeof Status ist nicht 'string'",
      "isActive muss async sein",
      "Enums koennen nicht mit === verglichen werden",
    ],
    correctOption: 0,
    hints: [
      "Wie vergleicht man String-Enum-Werte korrekt? (L09)",
      "String Enums sind nominal — 'ACTIVE' (String-Literal) ist nicht gleich Status.Active.",
      "Verwende status === Status.Active statt status === 'ACTIVE'.",
    ],
    fixedCode: [
      "function isActive(status: Status): boolean {",
      "  return status === Status.Active;",
      "}",
    ].join("\n"),
    explanation:
      "String Enums sind nominal typisiert (L09): Status.Active ist nicht " +
      "der String 'ACTIVE' im Typsystem. Der Vergleich status === 'ACTIVE' " +
      "funktioniert zur LAUFZEIT, aber TypeScript wuerde einen Fehler melden " +
      "wenn man strikte Enum-Vergleiche erzwingt. " +
      "Verwende immer Enum-Mitglieder fuer Vergleiche.",
    concept: "string-enum-nominal (L09)",
    difficulty: 3,
  },

  {
    id: "L10-D5",
    title: "Union ohne Narrowing — gemeinsame Methoden fehlen",
    buggyCode: [
      "function processInput(input: string | string[]): string {",
      "  return input.join(', ');",
      "  // Error: Property 'join' does not exist on type 'string'",
      "}",
    ].join("\n"),
    errorMessage: "Property 'join' does not exist on type 'string'.",
    bugType: "type-error",
    bugLine: 2,
    options: [
      "join() existiert nur auf Arrays — bei Union muss man erst narrowen",
      "join braucht einen generischen Typ",
      "string[] muss als Array<string> geschrieben werden",
      "input muss erst sortiert werden",
    ],
    correctOption: 0,
    hints: [
      "Welche Operationen sind auf einem Union erlaubt? (L07)",
      "Nur Operationen die fuer ALLE Union-Mitglieder existieren.",
      "Loesung: if (Array.isArray(input)) { input.join(...) } else { input }",
    ],
    fixedCode: [
      "function processInput(input: string | string[]): string {",
      "  if (Array.isArray(input)) {",
      "    return input.join(', ');",
      "  }",
      "  return input;",
      "}",
    ].join("\n"),
    explanation:
      "Bei Union Types (L07) sind nur gemeinsame Operationen erlaubt. " +
      "join() existiert auf string[] aber nicht auf string. " +
      "Array.isArray() ist der Type Guard der auf string[] verengt.",
    concept: "union-narrowing (L07+L06)",
    difficulty: 2,
  },
];
