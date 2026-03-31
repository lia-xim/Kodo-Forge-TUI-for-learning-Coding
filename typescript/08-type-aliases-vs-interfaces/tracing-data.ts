/**
 * Lektion 08 — Tracing-Exercises: Type Aliases vs Interfaces
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  {
    id: "08-declaration-merging",
    title: "Declaration Merging — Interfaces verschmelzen",
    description: "Verfolge wie Declaration Merging zwei Interface-Deklarationen zusammenfuehrt.",
    code: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "}",
      "",
      "interface Config {",
      "  debug: boolean;",
      "  logLevel: 'info' | 'warn' | 'error';",
      "}",
      "",
      "const config: Config = {",
      "  host: 'localhost',",
      "  port: 3000,",
      "  debug: true,",
      "  logLevel: 'info',",
      "};",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Welche Properties hat Config nach der ersten Deklaration?",
        expectedAnswer: "host: string, port: number",
        variables: { "Config": "{ host: string; port: number }" },
        explanation: "Die erste Deklaration definiert host und port.",
      },
      {
        lineIndex: 5,
        question: "Welche Properties hat Config nach der zweiten Deklaration?",
        expectedAnswer: "host, port, debug, logLevel — alle vier zusammengefuehrt",
        variables: { "Config": "{ host: string; port: number; debug: boolean; logLevel: 'info' | 'warn' | 'error' }" },
        explanation:
          "Declaration Merging fuegt die Properties der zweiten Deklaration " +
          "zur ersten hinzu. Config hat jetzt alle vier Properties.",
      },
      {
        lineIndex: 10,
        question: "Wuerde es kompilieren wenn 'debug: true' fehlt?",
        expectedAnswer: "Nein — alle Properties aus beiden Deklarationen sind Pflicht",
        variables: {},
        explanation:
          "Nach dem Merging hat Config alle vier Properties als Pflichtfelder. " +
          "Ein fehlendes Feld ist ein Compile-Error.",
      },
    ],
    concept: "declaration-merging",
    difficulty: 2,
  },

  {
    id: "08-extends-vs-intersection",
    title: "extends vs & — Konflikterkennung",
    description: "Vergleiche wie extends und & bei Property-Konflikten reagieren.",
    code: [
      "// Variante 1: extends",
      "interface A { x: string; }",
      "// interface B extends A { x: number; }  // FEHLER!",
      "",
      "// Variante 2: &",
      "type C = { x: string };",
      "type D = C & { x: number }; // Kein Fehler bei Definition!",
      "",
      "// Aber bei Verwendung:",
      "// const d: D = { x: 'hello' }; // FEHLER: string ist nicht never",
    ],
    steps: [
      {
        lineIndex: 2,
        question: "Was passiert bei interface B extends A { x: number; }?",
        expectedAnswer: "Compile-Error: Types of property 'x' are incompatible",
        variables: {},
        explanation:
          "extends meldet den Konflikt SOFORT als Fehler. " +
          "string und number sind nicht kompatibel.",
      },
      {
        lineIndex: 6,
        question: "Was ist der Typ von D.x bei type D = C & { x: number }?",
        expectedAnswer: "string & number = never",
        variables: { "D.x": "(Typ: string & number = never)" },
        explanation:
          "& erzeugt KEINEN Fehler bei der Definition! D.x wird zu " +
          "string & number = never — stiller Bug.",
      },
      {
        lineIndex: 9,
        question: "Wann wird der Fehler bei & sichtbar?",
        expectedAnswer: "Erst bei der Verwendung — wenn man einen Wert zuweisen will",
        variables: {},
        explanation:
          "Der Fehler zeigt sich erst wenn man versucht, einen Wert " +
          "vom Typ D zu erstellen. Kein Wert kann x: never erfuellen. " +
          "extends ist hier sicherer weil es den Fehler frueh meldet.",
      },
    ],
    concept: "extends-vs-intersection-conflicts",
    difficulty: 3,
  },

  {
    id: "08-implements-check",
    title: "implements prueft die Form",
    description: "Verfolge wie implements als Compile-Zeit-Check funktioniert.",
    code: [
      "interface Serializable {",
      "  serialize(): string;",
      "  deserialize(data: string): void;",
      "}",
      "",
      "class User implements Serializable {",
      "  name: string;",
      "  constructor(name: string) { this.name = name; }",
      "  serialize(): string { return JSON.stringify({ name: this.name }); }",
      "  deserialize(data: string): void { this.name = JSON.parse(data).name; }",
      "}",
    ],
    steps: [
      {
        lineIndex: 5,
        question: "Was prueft 'implements Serializable'?",
        expectedAnswer: "Ob User serialize() und deserialize() korrekt implementiert",
        variables: {},
        explanation:
          "implements ist ein Compile-Zeit-Check: Hat User alle Methoden " +
          "aus Serializable mit den richtigen Signaturen?",
      },
      {
        lineIndex: 8,
        question: "Vererbt implements die serialize-Methode?",
        expectedAnswer: "Nein — die Klasse muss sie selbst implementieren",
        variables: {},
        explanation:
          "implements vererbt NICHTS. Die Methode muss in der Klasse " +
          "selbst geschrieben werden. implements prueft nur die Form.",
      },
      {
        lineIndex: 5,
        question: "Was waere wenn deserialize() fehlte?",
        expectedAnswer: "Compile-Error: Class incorrectly implements interface",
        variables: {},
        explanation:
          "Ohne deserialize erfuellt User nicht die Serializable-Form. " +
          "TypeScript meldet den Fehler sofort.",
      },
    ],
    concept: "implements-compile-check",
    difficulty: 2,
  },

  {
    id: "08-type-alias-transparency",
    title: "Type Alias ist transparent — kein neuer Typ",
    description: "Verfolge wie Type Aliases strukturell identisch mit ihrem Zieltyp sind.",
    code: [
      "type UserID = string;",
      "type ProductID = string;",
      "",
      "function findUser(id: UserID): void {",
      "  console.log('Finding user:', id);",
      "}",
      "",
      "const productId: ProductID = 'prod-123';",
      "findUser(productId); // Funktioniert das?",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Ist UserID ein eigenstaendiger Typ?",
        expectedAnswer: "Nein — UserID ist nur ein Alias (Spitzname) fuer string",
        variables: { "UserID": "= string (Alias)" },
        explanation:
          "type UserID = string erstellt keinen neuen Typ. " +
          "UserID IST string — nur mit anderem Namen.",
      },
      {
        lineIndex: 8,
        question: "Kann man ProductID an eine Funktion uebergeben die UserID erwartet?",
        expectedAnswer: "Ja — beide sind string, TypeScript sieht keinen Unterschied",
        variables: {},
        explanation:
          "TypeScript ist strukturell typisiert. UserID und ProductID " +
          "sind beide string — voellig austauschbar. " +
          "Fuer echte Unterscheidung brauchst du Branded Types.",
      },
    ],
    concept: "type-alias-structural",
    difficulty: 1,
  },
];
