/**
 * Lektion 02 — Tracing-Exercises: Primitive Types
 *
 * Themen:
 *  - typeof null, NaN === NaN, 0.1 + 0.2
 *  - Type Narrowing mit unknown
 *  - ?? vs || mit falsy-Werten
 *  - never und void
 *
 * Schwierigkeit steigend: 1 → 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: JavaScript-Eigenheiten bei Primitives ───────────────────
  {
    id: "02-primitive-gotchas",
    title: "Primitive Gotchas — typeof, NaN, Gleitkomma",
    description:
      "Verfolge die ueberraschenden Ergebnisse von typeof null, " +
      "NaN-Vergleichen und Gleitkomma-Arithmetik.",
    code: [
      "const a = typeof null;",
      "const b = typeof undefined;",
      "const c = NaN === NaN;",
      "const d = 0.1 + 0.2 === 0.3;",
      "const e = 0.1 + 0.2;",
      "",
      "console.log(a);",
      "console.log(b);",
      "console.log(c);",
      "console.log(d);",
      "console.log(e);",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Was ist der Wert von 'a' (typeof null)?",
        expectedAnswer: "object",
        variables: { "a": "object" },
        explanation:
          "typeof null gibt 'object' zurueck — ein historischer Bug aus " +
          "JavaScript 1.0 (1995). Er wurde nie behoben, weil zu viel " +
          "bestehender Code darauf basiert.",
      },
      {
        lineIndex: 1,
        question: "Was ist der Wert von 'b' (typeof undefined)?",
        expectedAnswer: "undefined",
        variables: { "a": "object", "b": "undefined" },
        explanation:
          "typeof undefined gibt korrekt 'undefined' zurueck. " +
          "Im Gegensatz zu null verhaelt sich typeof bei undefined erwartungsgemaess.",
      },
      {
        lineIndex: 2,
        question: "Was ist der Wert von 'c' (NaN === NaN)?",
        expectedAnswer: "false",
        variables: { "a": "object", "b": "undefined", "c": "false" },
        explanation:
          "NaN ist der einzige Wert in JavaScript, der NICHT gleich sich " +
          "selbst ist. NaN === NaN ist false. " +
          "Zum Pruefen auf NaN verwendet man Number.isNaN().",
      },
      {
        lineIndex: 3,
        question: "Was ist der Wert von 'd' (0.1 + 0.2 === 0.3)?",
        expectedAnswer: "false",
        variables: { "a": "object", "b": "undefined", "c": "false", "d": "false" },
        explanation:
          "IEEE 754 Gleitkomma: 0.1 + 0.2 ergibt 0.30000000000000004, " +
          "nicht exakt 0.3. Daher ist der Vergleich false. " +
          "Fuer Geldbetraege verwendet man besser Ganzzahlen (Cent).",
      },
      {
        lineIndex: 4,
        question: "Was ist der exakte Wert von 'e' (0.1 + 0.2)?",
        expectedAnswer: "0.30000000000000004",
        variables: { "a": "object", "b": "undefined", "c": "false", "d": "false", "e": "0.30000000000000004" },
        explanation:
          "Das ist der tatsaechliche IEEE 754 Gleitkommawert. " +
          "Die winzige Abweichung entsteht, weil 0.1 und 0.2 " +
          "binaer nicht exakt darstellbar sind.",
      },
    ],
    concept: "primitive-types",
    difficulty: 1,
  },

  // ─── Exercise 2: Type Narrowing mit unknown ──────────────────────────────
  {
    id: "02-typeof-narrowing",
    title: "Type Narrowing mit typeof",
    description:
      "Verfolge den TypeScript-Typ der Variable x durch jeden " +
      "Kontrollfluss-Zweig.",
    code: [
      "function process(x: string | number | null) {",
      "  // x hat Typ: string | number | null",
      "  if (x === null) {",
      "    return 'nichts';",
      "  }",
      "  // x hat jetzt Typ: ???",
      "  if (typeof x === 'string') {",
      "    console.log(x.toUpperCase());",
      "    // x hat Typ: ???",
      "  } else {",
      "    console.log(x.toFixed(2));",
      "    // x hat Typ: ???",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Welchen TypeScript-Typ hat x am Anfang der Funktion?",
        expectedAnswer: "string | number | null",
        variables: { "x": "string | number | null" },
        explanation:
          "Der Parameter x ist als Union Type deklariert: " +
          "string | number | null. TypeScript kennt den konkreten " +
          "Wert noch nicht.",
      },
      {
        lineIndex: 5,
        question:
          "Welchen Typ hat x NACH dem null-Check in Zeile 3-4? " +
          "(Wenn wir Zeile 6 erreichen)",
        expectedAnswer: "string | number",
        variables: { "x": "string | number" },
        explanation:
          "Der null-Check mit early return eliminiert null aus dem Union Type. " +
          "TypeScript's Control Flow Analysis erkennt: wenn wir hier " +
          "ankommen, kann x nicht null sein. Also: string | number.",
      },
      {
        lineIndex: 8,
        question:
          "Welchen Typ hat x im if-Zweig (typeof x === 'string')?",
        expectedAnswer: "string",
        variables: { "x": "string" },
        explanation:
          "Der typeof-Check narrowt den Typ weiter. Im if-Zweig " +
          "weiss TypeScript: x ist ein string. Deshalb ist " +
          "x.toUpperCase() erlaubt ohne Fehler.",
      },
      {
        lineIndex: 11,
        question:
          "Welchen Typ hat x im else-Zweig?",
        expectedAnswer: "number",
        variables: { "x": "number" },
        explanation:
          "Im else-Zweig eliminiert TypeScript string (das war der " +
          "if-Fall) und null (das war der fruehe return). " +
          "Uebrig bleibt: number. Deshalb ist x.toFixed(2) erlaubt.",
      },
    ],
    concept: "type-narrowing",
    difficulty: 2,
  },

  // ─── Exercise 3: ?? vs || mit falsy-Werten ──────────────────────────────
  {
    id: "02-nullish-vs-or",
    title: "Nullish Coalescing (??) vs. Logisches OR (||)",
    description:
      "Verfolge den Unterschied zwischen ?? und || bei " +
      "falsy-Werten wie 0, '' und false.",
    code: [
      "const a = 0 || 'fallback';",
      "const b = 0 ?? 'fallback';",
      "const c = '' || 'fallback';",
      "const d = '' ?? 'fallback';",
      "const e = false || 'fallback';",
      "const f = false ?? 'fallback';",
      "const g = null || 'fallback';",
      "const h = null ?? 'fallback';",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Was ist der Wert von 'a'? (0 || 'fallback')",
        expectedAnswer: "fallback",
        variables: { "a": "fallback" },
        explanation:
          "|| prueft auf 'falsy'. 0 ist falsy in JavaScript, " +
          "also wird 'fallback' zurueckgegeben. " +
          "Das ist oft ungewollt wenn 0 ein gueltiger Wert ist.",
      },
      {
        lineIndex: 1,
        question:
          "Was ist der Wert von 'b'? (0 ?? 'fallback')",
        expectedAnswer: "0",
        variables: { "a": "fallback", "b": "0" },
        explanation:
          "?? prueft NUR auf null und undefined. 0 ist weder null " +
          "noch undefined, also bleibt der Wert 0. " +
          "Das ist der grosse Vorteil von ?? bei numerischen Werten.",
      },
      {
        lineIndex: 2,
        question:
          "Was ist der Wert von 'c'? ('' || 'fallback')",
        expectedAnswer: "fallback",
        variables: { "a": "fallback", "b": "0", "c": "fallback" },
        explanation:
          "Ein leerer String '' ist falsy. || gibt daher 'fallback' " +
          "zurueck. Das kann problematisch sein wenn ein leerer String " +
          "ein gueltiger Eingabewert ist.",
      },
      {
        lineIndex: 3,
        question:
          "Was ist der Wert von 'd'? ('' ?? 'fallback')",
        expectedAnswer: "",
        variables: { "a": "fallback", "b": "0", "c": "fallback", "d": "" },
        explanation:
          "'' ist nicht null und nicht undefined. ?? behaelt den " +
          "leeren String bei. Faustregel: ?? fuer null/undefined-Checks, " +
          "|| fuer allgemeine Falsy-Checks.",
      },
      {
        lineIndex: 6,
        question:
          "Was ist der Wert von 'g'? (null || 'fallback') " +
          "Und was ist der Wert von 'h'? (null ?? 'fallback')",
        expectedAnswer: "Beide: fallback",
        variables: {
          "e": "fallback",
          "f": "false",
          "g": "fallback",
          "h": "fallback",
        },
        explanation:
          "Bei null (und undefined) verhalten sich || und ?? identisch: " +
          "Beide geben 'fallback' zurueck. Der Unterschied zeigt sich " +
          "NUR bei 0, '' und false.",
      },
    ],
    concept: "nullish-coalescing",
    difficulty: 2,
  },

  // ─── Exercise 4: unknown — Zwang zum Pruefen ────────────────────────────
  {
    id: "02-unknown-narrowing",
    title: "unknown — Schritt fuer Schritt einschraenken",
    description:
      "Verfolge wie ein unknown-Wert durch verschiedene Pruefungen " +
      "schrittweise eingeschraenkt wird.",
    code: [
      "function handleInput(val: unknown) {",
      "  // val hat Typ: unknown",
      "  if (typeof val === 'object') {",
      "    // val hat Typ: ???",
      "    if (val !== null) {",
      "      // val hat Typ: ???",
      "      console.log(Object.keys(val));",
      "    }",
      "  }",
      "  if (typeof val === 'string') {",
      "    // val hat Typ: ???",
      "    console.log(val.length);",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Welchen Typ hat val am Anfang?",
        expectedAnswer: "unknown",
        variables: { "val": "unknown" },
        explanation:
          "unknown ist der sichere 'Top Type'. Jeder Wert kann " +
          "zugewiesen werden, aber man kann damit nichts anfangen " +
          "ohne den Typ vorher einzuschraenken.",
      },
      {
        lineIndex: 3,
        question:
          "Welchen Typ hat val nach 'typeof val === \"object\"'?",
        expectedAnswer: "object | null",
        variables: { "val": "object | null" },
        explanation:
          "typeof gibt 'object' zurueck fuer Objekte UND fuer null " +
          "(der historische Bug). Daher ist val nach diesem Check " +
          "vom Typ 'object | null' — null ist noch nicht ausgeschlossen!",
      },
      {
        lineIndex: 5,
        question:
          "Welchen Typ hat val nach dem zusaetzlichen null-Check?",
        expectedAnswer: "object",
        variables: { "val": "object" },
        explanation:
          "Nach 'val !== null' wird null eliminiert. Jetzt hat val " +
          "den Typ 'object'. Erst jetzt ist Object.keys(val) sicher. " +
          "Ohne den null-Check wuerde TypeScript einen Fehler melden.",
      },
      {
        lineIndex: 10,
        question:
          "Welchen Typ hat val im string-Check (Zeile 10)?",
        expectedAnswer: "string",
        variables: { "val": "string" },
        explanation:
          "Jeder typeof-Check in einem eigenen if-Block narrowt " +
          "unabhaengig. Hier wird val zu 'string' eingeschraenkt. " +
          "val.length ist jetzt sicher aufrufbar.",
      },
    ],
    concept: "type-narrowing",
    difficulty: 3,
  },

  // ─── Exercise 5: never und exhaustive Checks ────────────────────────────
  {
    id: "02-never-exhaustive",
    title: "never — Exhaustive Type Checking",
    description:
      "Verfolge wie TypeScript den never-Typ nutzt um sicherzustellen " +
      "dass alle Faelle abgedeckt sind.",
    code: [
      "type Shape = 'circle' | 'square' | 'triangle';",
      "",
      "function area(shape: Shape): number {",
      "  switch (shape) {",
      "    case 'circle':",
      "      return Math.PI * 10 * 10;",
      "    case 'square':",
      "      return 10 * 10;",
      "    case 'triangle':",
      "      return (10 * 10) / 2;",
      "    default:",
      "      const _exhaustive: never = shape;",
      "      return _exhaustive;",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Welchen Typ hat 'shape' in der switch-Anweisung vor " +
          "den case-Pruefungen?",
        expectedAnswer: "circle | square | triangle",
        variables: { "shape": "circle | square | triangle" },
        explanation:
          "Shape ist ein Union Type aus drei String-Literalen. " +
          "TypeScript kennt alle moeglichen Werte.",
      },
      {
        lineIndex: 6,
        question:
          "Welchen Typ hat 'shape' nach dem case 'circle'? " +
          "(Also im verbleibenden Code)",
        expectedAnswer: "square | triangle",
        variables: { "shape": "square | triangle" },
        explanation:
          "Der case 'circle' mit return eliminiert 'circle' aus dem " +
          "Union Type. TypeScript weiss: wenn wir hier weitermachen, " +
          "kann shape nicht 'circle' sein.",
      },
      {
        lineIndex: 11,
        question:
          "Welchen Typ hat 'shape' im default-Zweig, wenn alle " +
          "drei Faelle abgedeckt sind?",
        expectedAnswer: "never",
        variables: { "shape": "never" },
        explanation:
          "Nachdem alle drei Werte (circle, square, triangle) durch " +
          "case-Zweige abgedeckt wurden, bleibt nichts uebrig. " +
          "TypeScript inferiert 'never' — der Typ fuer 'unmoeglich'.",
      },
      {
        lineIndex: 11,
        question:
          "Was passiert wenn jemand 'rectangle' zum Shape-Typ " +
          "hinzufuegt aber keinen case ergaenzt?",
        expectedAnswer: "Compile-Fehler: 'rectangle' ist nicht 'never' zuweisbar",
        variables: { "shape": "rectangle (nicht never!)" },
        explanation:
          "Das ist der Trick: Wenn ein neuer Wert zum Union kommt " +
          "und kein case dafuer existiert, hat shape im default den " +
          "Typ 'rectangle'. Die Zuweisung an 'never' schlaegt fehl — " +
          "TypeScript meldet den Fehler. Exhaustive Check!",
      },
    ],
    concept: "never-type",
    difficulty: 4,
  },
];
