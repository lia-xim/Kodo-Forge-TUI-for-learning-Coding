/**
 * Lektion 02 — Debugging Challenges: Primitive Types
 *
 * 4 Challenges zu typeof null, NaN===NaN, any-Ansteckung, || vs ?? bei 0.
 * Fokus: JavaScript-Eigenheiten, die TypeScript nicht abfaengt.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: typeof null === "object" ──────────────────────────────
  {
    id: "L02-D1",
    title: "typeof null ist nicht 'null'",
    buggyCode: [
      "function isNull(value: unknown): boolean {",
      "  return typeof value === 'null';",
      "}",
      "",
      "console.log(isNull(null));    // erwartet: true",
      "console.log(isNull('hello')); // erwartet: false",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "typeof null gibt 'null' zurueck — der Vergleich ist korrekt",
      "typeof null gibt 'object' zurueck — ein historischer JavaScript-Bug",
      "typeof null gibt 'undefined' zurueck",
      "null hat keinen typeof-Wert",
    ],
    correctOption: 1,
    hints: [
      "Fuehre typeof null in einer Konsole aus. Was kommt zurueck?",
      "Das ist ein bekannter JavaScript-Bug seit 1995 — er wird nie behoben.",
      "typeof null === 'object' ist true. Man muss direkt value === null pruefen.",
    ],
    fixedCode: [
      "function isNull(value: unknown): boolean {",
      "  return value === null;",
      "}",
      "",
      "console.log(isNull(null));    // true",
      "console.log(isNull('hello')); // false",
    ].join("\n"),
    explanation:
      "typeof null gibt 'object' zurueck — ein Designfehler aus den Anfaengen " +
      "von JavaScript (1995), der nie behoben wurde, weil zu viel Code davon " +
      "abhaengt. TypeScript warnt nicht davor, weil typeof null === 'null' " +
      "zwar immer false ist, aber syntaktisch kein Fehler. Korrekt prueft man " +
      "null mit striktem Vergleich: value === null.",
    concept: "typeof-null",
    difficulty: 1,
  },

  // ─── Challenge 2: NaN === NaN ist false ─────────────────────────────────
  {
    id: "L02-D2",
    title: "NaN ist nicht gleich NaN",
    buggyCode: [
      "function hasInvalidNumber(values: number[]): boolean {",
      "  return values.some(v => v === NaN);",
      "}",
      "",
      "console.log(hasInvalidNumber([1, NaN, 3])); // erwartet: true",
      "console.log(hasInvalidNumber([1, 2, 3]));    // erwartet: false",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "some() funktioniert nicht mit NaN",
      "NaN === NaN ist false — NaN ist der einzige Wert, der sich selbst nicht gleicht",
      "Der Vergleich muss != statt === verwenden",
      "NaN ist kein gueltiger number-Wert in TypeScript",
    ],
    correctOption: 1,
    hints: [
      "Was ergibt NaN === NaN in JavaScript?",
      "NaN ist laut IEEE 754 der einzige Wert, der sich selbst nicht gleicht.",
      "Verwende Number.isNaN() oder Object.is() statt ===.",
    ],
    fixedCode: [
      "function hasInvalidNumber(values: number[]): boolean {",
      "  return values.some(v => Number.isNaN(v));",
      "}",
      "",
      "console.log(hasInvalidNumber([1, NaN, 3])); // true",
      "console.log(hasInvalidNumber([1, 2, 3]));    // false",
    ].join("\n"),
    explanation:
      "NaN === NaN ergibt false — das ist im IEEE-754-Standard so definiert. " +
      "TypeScript warnt nicht davor, weil der Ausdruck syntaktisch korrekt ist. " +
      "Stattdessen muss Number.isNaN(v) verwendet werden. Achtung: Das globale " +
      "isNaN() konvertiert den Wert zuerst (isNaN('hello') === true), waehrend " +
      "Number.isNaN() nur bei echtem NaN true zurueckgibt.",
    concept: "NaN-vergleich",
    difficulty: 2,
  },

  // ─── Challenge 3: any-Ansteckung ───────────────────────────────────────
  {
    id: "L02-D3",
    title: "any steckt andere Typen an",
    buggyCode: [
      "function getConfig(): any {",
      "  return { port: '3000' };",
      "}",
      "",
      "const config = getConfig();",
      "const port: number = config.port;",
      "const doubled = port * 2;",
      "",
      "console.log(doubled); // erwartet: 6000",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 6,
    options: [
      "config.port ist '3000' (String), wird aber ohne Fehler als number akzeptiert",
      "getConfig() gibt kein gueltiges Objekt zurueck",
      "port * 2 funktioniert nicht mit number",
      "console.log kann keine Zahlen ausgeben",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat config? Und was bedeutet das fuer config.port?",
      "any breitet sich aus: config ist any, also ist config.port auch any.",
      "'3000' * 2 ergibt in JavaScript 6000 (implizite Konvertierung), " +
        "aber '3000' + 2 ergaebe '30002' (String-Konkatenation).",
    ],
    fixedCode: [
      "interface Config {",
      "  port: number;",
      "}",
      "",
      "function getConfig(): Config {",
      "  return { port: 3000 };",
      "}",
      "",
      "const config = getConfig();",
      "const doubled = config.port * 2;",
      "",
      "console.log(doubled); // 6000",
    ].join("\n"),
    explanation:
      "any ist ansteckend: Wenn getConfig() als any typisiert ist, ist auch " +
      "config.port any. Ein any-Wert kann ohne Pruefung an jeden Typ zugewiesen " +
      "werden — TypeScript meldet keinen Fehler. Hier ist port zur Laufzeit " +
      "ein String ('3000'), wird aber als number behandelt. Bei * funktioniert " +
      "das zufaellig (implizite Konvertierung), aber bei + wuerde String-" +
      "Konkatenation statt Addition passieren. Loesung: Konkreten Return-Typ angeben.",
    concept: "any-propagation",
    difficulty: 2,
  },

  // ─── Challenge 4: || vs ?? bei 0 ───────────────────────────────────────
  {
    id: "L02-D4",
    title: "|| vs ?? bei falsy-Werten",
    buggyCode: [
      "interface Settings {",
      "  volume: number;",
      "  brightness: number;",
      "}",
      "",
      "function applySettings(partial: Partial<Settings>): Settings {",
      "  return {",
      "    volume: partial.volume || 50,",
      "    brightness: partial.brightness || 75,",
      "  };",
      "}",
      "",
      "const s = applySettings({ volume: 0, brightness: 0 });",
      "console.log(s.volume);     // erwartet: 0, tatsaechlich: 50",
      "console.log(s.brightness); // erwartet: 0, tatsaechlich: 75",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 8,
    options: [
      "|| behandelt 0 als falsy und nimmt den Fallback-Wert",
      "Partial macht die Werte zu undefined",
      "0 ist kein gueltiger number-Wert",
      "|| kann nicht mit Zahlen verwendet werden",
    ],
    correctOption: 0,
    hints: [
      "Welche Werte sind in JavaScript 'falsy'?",
      "falsy-Werte: false, 0, '', null, undefined, NaN. Der ||-Operator nimmt " +
        "den rechten Wert bei JEDEM falsy-Wert.",
      "Der ??-Operator (Nullish Coalescing) prueft nur auf null und undefined.",
    ],
    fixedCode: [
      "interface Settings {",
      "  volume: number;",
      "  brightness: number;",
      "}",
      "",
      "function applySettings(partial: Partial<Settings>): Settings {",
      "  return {",
      "    volume: partial.volume ?? 50,",
      "    brightness: partial.brightness ?? 75,",
      "  };",
      "}",
      "",
      "const s = applySettings({ volume: 0, brightness: 0 });",
      "console.log(s.volume);     // 0",
      "console.log(s.brightness); // 0",
    ].join("\n"),
    explanation:
      "Der ||-Operator gibt den rechten Operand zurueck, wenn der linke 'falsy' " +
      "ist. In JavaScript ist 0 ein falsy-Wert — deshalb wird 0 || 50 zu 50. " +
      "Das ist ein haeufiger Bug, wenn 0 ein gueltiger Wert ist (z.B. Lautstaerke). " +
      "Der ??-Operator (Nullish Coalescing) prueft nur auf null und undefined, " +
      "sodass 0 ?? 50 korrekt 0 zurueckgibt.",
    concept: "nullish-coalescing",
    difficulty: 2,
  },
];
