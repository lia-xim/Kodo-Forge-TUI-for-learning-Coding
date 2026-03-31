/**
 * Lektion 03 — Debugging Challenges: Type Annotations & Inference
 *
 * 5 Challenges zu Object.keys, leeres Array, Callback-Context,
 * satisfies-Verwechslung, Generic Inference.
 * Fokus: Inference-Grenzen und Type-System-Eigenheiten.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: Object.keys gibt string[] zurueck ─────────────────────
  {
    id: "L03-D1",
    title: "Object.keys gibt string[] zurueck, nicht keyof T",
    buggyCode: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "  debug: boolean;",
      "}",
      "",
      "const config: Config = { host: 'localhost', port: 3000, debug: true };",
      "",
      "Object.keys(config).forEach(key => {",
      "  console.log(config[key]);",
      "});",
    ].join("\n"),
    errorMessage:
      "Element implicitly has an 'any' type because expression of type " +
      "'string' can't be used to index type 'Config'.",
    bugType: "type-error",
    bugLine: 10,
    options: [
      "Object.keys() gibt string[] zurueck, nicht (keyof Config)[]",
      "forEach kann nicht auf Arrays aufgerufen werden",
      "config braucht einen Index-Signature",
      "key muss als 'any' deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat Object.keys(config)?",
      "Object.keys gibt IMMER string[] zurueck — TypeScript kann nicht " +
        "garantieren, dass ein Objekt keine zusaetzlichen Properties hat.",
      "Loesung: Expliziter Cast mit (key as keyof Config) oder " +
        "eine typsichere Hilfsfunktion.",
    ],
    fixedCode: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "  debug: boolean;",
      "}",
      "",
      "const config: Config = { host: 'localhost', port: 3000, debug: true };",
      "",
      "(Object.keys(config) as (keyof Config)[]).forEach(key => {",
      "  console.log(config[key]);",
      "});",
    ].join("\n"),
    explanation:
      "Object.keys() gibt immer string[] zurueck, nicht (keyof T)[]. Das ist " +
      "beabsichtigt: TypeScript verwendet strukturelle Typisierung, sodass ein " +
      "Objekt mehr Properties haben kann als sein Interface deklariert. " +
      "Wuerde Object.keys den Typ (keyof Config)[] zurueckgeben, waere das unsound. " +
      "Loesung: Expliziter Cast, wenn man sicher ist, oder eine for-in-Schleife " +
      "mit Narrowing.",
    concept: "object-keys-typing",
    difficulty: 3,
  },

  // ─── Challenge 2: Leeres Array wird zu never[] ──────────────────────────
  {
    id: "L03-D2",
    title: "Leeres Array wird zu never[]",
    buggyCode: [
      "const items = [];",
      "",
      "function addItem(item: string) {",
      "  items.push(item);",
      "}",
      "",
      "addItem('hello');",
    ].join("\n"),
    errorMessage:
      "Argument of type 'string' is not assignable to parameter of type 'never'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "Ein leeres Array ohne Typ-Annotation wird als never[] inferiert",
      "push() akzeptiert keine Strings",
      "const-Arrays koennen nicht veraendert werden",
      "items muss mit 'let' deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat ein leeres Array-Literal [] ohne Annotation?",
      "TypeScript inferiert [] als never[] wenn der Typ nicht aus dem Kontext " +
        "ableitbar ist. never[] bedeutet: 'Array das nie Elemente enthalten kann'.",
      "Loesung: Explizite Annotation const items: string[] = [];",
    ],
    fixedCode: [
      "const items: string[] = [];",
      "",
      "function addItem(item: string) {",
      "  items.push(item);",
      "}",
      "",
      "addItem('hello');",
    ].join("\n"),
    explanation:
      "Wenn TypeScript ein leeres Array-Literal sieht und den Typ nicht aus " +
      "dem Kontext ableiten kann, inferiert es never[] — ein Array das niemals " +
      "Elemente enthalten kann. Das fuehrt dazu, dass push() mit 'string' fehlschlaegt, " +
      "weil string nicht zu never zuweisbar ist. Loesung: Immer eine explizite " +
      "Typ-Annotation fuer leere Arrays angeben.",
    concept: "never-inference",
    difficulty: 2,
  },

  // ─── Challenge 3: Callback verliert this-Context ────────────────────────
  {
    id: "L03-D3",
    title: "Callback verliert this-Context",
    buggyCode: [
      "class Counter {",
      "  count = 0;",
      "",
      "  increment() {",
      "    this.count++;",
      "  }",
      "",
      "  startTimer() {",
      "    setInterval(this.increment, 1000);",
      "  }",
      "}",
      "",
      "const c = new Counter();",
      "c.startTimer(); // count bleibt 0 oder TypeError",
    ].join("\n"),
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'count')",
    bugType: "runtime-error",
    bugLine: 9,
    options: [
      "setInterval erwartet keine Methoden-Referenz",
      "this.increment verliert den this-Kontext bei Uebergabe als Callback",
      "setInterval braucht eine Zeitangabe in Sekunden, nicht Millisekunden",
      "count muss als static deklariert werden",
    ],
    correctOption: 1,
    hints: [
      "Was ist 'this' innerhalb von increment, wenn es als Callback aufgerufen wird?",
      "In JavaScript wird 'this' beim Aufruf bestimmt, nicht bei der Definition. " +
        "Wenn increment als Callback uebergeben wird, ist this nicht mehr die Counter-Instanz.",
      "Loesung: Arrow-Function benutzen, um 'this' zu binden: " +
        "setInterval(() => this.increment(), 1000) oder increment als Arrow-Property.",
    ],
    fixedCode: [
      "class Counter {",
      "  count = 0;",
      "",
      "  increment = () => {",
      "    this.count++;",
      "  };",
      "",
      "  startTimer() {",
      "    setInterval(this.increment, 1000);",
      "  }",
      "}",
      "",
      "const c = new Counter();",
      "c.startTimer(); // count zaehlt hoch",
    ].join("\n"),
    explanation:
      "Wenn eine Methode als Callback uebergeben wird (this.increment ohne ()), " +
      "verliert sie ihren this-Kontext. Bei setInterval wird increment mit " +
      "this === undefined (strict mode) oder this === window aufgerufen. " +
      "TypeScript erkennt dieses Problem standardmaessig NICHT. " +
      "Loesungen: (1) Arrow-Function als Property (increment = () => {...}), " +
      "(2) Wrapper: setInterval(() => this.increment(), 1000), " +
      "(3) .bind(this) im Konstruktor.",
    concept: "this-context",
    difficulty: 3,
  },

  // ─── Challenge 4: satisfies vs as Verwechslung ──────────────────────────
  {
    id: "L03-D4",
    title: "satisfies vs as — falscher Operator",
    buggyCode: [
      "type Theme = {",
      "  primary: string;",
      "  secondary: string;",
      "};",
      "",
      "const theme = {",
      "  primary: '#ff0000',",
      "  secondary: '#00ff00',",
      "  accent: '#0000ff',",
      "} as Theme;",
      "",
      "// Erwartet: Fehler wegen 'accent' (nicht in Theme)",
      "// Tatsaechlich: Kein Fehler, accent wird stillschweigend entfernt",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 10,
    options: [
      "'as Theme' ist eine Type Assertion — sie unterdrückt Excess-Property-Checks",
      "Das Objekt hat zu wenige Properties fuer Theme",
      "'accent' ist ein reserviertes Wort",
      "Farb-Strings muessen ohne # geschrieben werden",
    ],
    correctOption: 0,
    hints: [
      "Was ist der Unterschied zwischen 'as Theme' und 'satisfies Theme'?",
      "'as' ist eine Assertion: 'Ich weiss es besser als der Compiler'. " +
        "'satisfies' ist eine Validierung: 'Pruefe ob es passt, aber behalte den Typ'.",
      "Mit 'satisfies' wuerde TypeScript die ueberzaehlige Property 'accent' melden.",
    ],
    fixedCode: [
      "type Theme = {",
      "  primary: string;",
      "  secondary: string;",
      "};",
      "",
      "const theme = {",
      "  primary: '#ff0000',",
      "  secondary: '#00ff00',",
      "} satisfies Theme;",
      "",
      "// satisfies prueft den Typ UND behaelt den Literal-Typ",
    ].join("\n"),
    explanation:
      "'as Theme' ist eine Type Assertion — sie sagt dem Compiler 'behandle " +
      "dieses Objekt als Theme'. Dabei werden Excess-Property-Checks umgangen, " +
      "und die ueberzaehlige Property 'accent' wird vom Typsystem ignoriert. " +
      "'satisfies Theme' hingegen PRUEFT ob das Objekt zu Theme passt und meldet " +
      "ueberzaehlige Properties als Fehler. Zusaetzlich behaelt satisfies den " +
      "praezisen Literal-Typ des Objekts.",
    concept: "satisfies-vs-as",
    difficulty: 3,
  },

  // ─── Challenge 5: Inference bei ueberladenen Funktionen ─────────────────
  {
    id: "L03-D5",
    title: "Generic Inference bei verschachtelten Aufrufen",
    buggyCode: [
      "function first<T>(arr: T[]): T {",
      "  return arr[0];",
      "}",
      "",
      "function wrap<U>(value: U): { data: U } {",
      "  return { data: value };",
      "}",
      "",
      "const result = wrap(first([]));",
      "// result.data ist never — nicht undefined",
      "console.log(result.data.toUpperCase());",
    ].join("\n"),
    errorMessage: "Property 'toUpperCase' does not exist on type 'never'.",
    bugType: "type-error",
    bugLine: 9,
    options: [
      "first([]) inferiert T als never, und wrap propagiert den never-Typ weiter",
      "wrap() kann keine Funktionsaufrufe als Argument haben",
      "first() muss vor wrap() aufgerufen werden",
      "result.data ist immer undefined",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ inferiert TypeScript fuer first([])?",
      "Ein leeres Array [] hat den Typ never[]. Also wird T zu never.",
      "never propagiert durch Generics hindurch: wrap(never) ergibt { data: never }.",
    ],
    fixedCode: [
      "function first<T>(arr: T[]): T | undefined {",
      "  return arr[0];",
      "}",
      "",
      "function wrap<U>(value: U): { data: U } {",
      "  return { data: value };",
      "}",
      "",
      "const result = wrap(first<string>([]));",
      "// result.data ist string | undefined",
      "if (result.data) {",
      "  console.log(result.data.toUpperCase());",
      "}",
    ].join("\n"),
    explanation:
      "first([]) inferiert T als never, weil ein leeres Array den Typ never[] hat. " +
      "Dieser never-Typ propagiert durch wrap() hindurch: result ist { data: never }. " +
      "Auf never kann man keine Methoden aufrufen. Loesungen: (1) Explizites " +
      "Typ-Argument: first<string>([]), (2) Return-Typ T | undefined fuer first(), " +
      "was realistischer ist, da arr[0] bei leerem Array undefined zurueckgibt.",
    concept: "never-propagation",
    difficulty: 4,
  },
];
