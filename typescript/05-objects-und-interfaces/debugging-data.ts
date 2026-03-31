/**
 * Lektion 05 — Debugging Challenges: Objects & Interfaces
 *
 * 5 Challenges zu Excess Property Check Umgehung, readonly shallow,
 * Intersection-never, Omit-Tippfehler, leeres Interface.
 * Fokus: Objekt-Typsystem-Luecken und Interface-Fallstricke.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: Excess Property Check umgangen ────────────────────────
  {
    id: "L05-D1",
    title: "Excess Property Check wird durch Variable umgangen",
    buggyCode: [
      "interface Point {",
      "  x: number;",
      "  y: number;",
      "}",
      "",
      "const data = { x: 1, y: 2, z: 3 };",
      "const point: Point = data; // Kein Fehler!",
      "",
      "// Erwartet: Fehler wegen ueberzaehliger Property 'z'",
      "// Tatsaechlich: TypeScript akzeptiert es",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 7,
    options: [
      "Excess Property Checks greifen nur bei Objekt-Literalen, nicht bei Variablen",
      "data hat den Typ { x: number; y: number; z: number } der zu Point passt",
      "z wird automatisch entfernt bei der Zuweisung",
      "const-Deklaration deaktiviert Excess Property Checks",
    ],
    correctOption: 0,
    hints: [
      "Versuche das Objekt-Literal direkt zuzuweisen: const point: Point = { x: 1, y: 2, z: 3 };",
      "Excess Property Checks sind ein spezieller Mechanismus, der NUR bei " +
        "Objekt-Literalen greift. Bei Variablen gilt nur strukturelle Kompatibilitaet.",
      "Durch die Zwischenvariable 'data' wird der Check umgangen — das ist " +
        "beabsichtigtes Verhalten in TypeScript.",
    ],
    fixedCode: [
      "interface Point {",
      "  x: number;",
      "  y: number;",
      "}",
      "",
      "// Variante 1: Direkt zuweisen (Excess Check greift)",
      "const point: Point = { x: 1, y: 2 };",
      "",
      "// Variante 2: satisfies verwenden",
      "const data = { x: 1, y: 2 } satisfies Point;",
      "",
      "// Variante 3: Exakte Typen via Brand",
      "// Aktuell gibt es keine nativen exakten Typen in TypeScript",
    ].join("\n"),
    explanation:
      "Excess Property Checks sind ein spezieller Mechanismus in TypeScript, " +
      "der NUR bei Objekt-Literalen greift. Wird ein Objekt erst einer Variable " +
      "zugewiesen und dann an einen engeren Typ, prueft TypeScript nur strukturelle " +
      "Kompatibilitaet — und { x, y, z } ist kompatibel zu { x, y }. " +
      "Das ist kein Bug, sondern beabsichtigt: Strukturelle Typisierung erlaubt " +
      "ueberzaehlige Properties. Fuer Sicherheit: satisfies oder direkte Literal-Zuweisung.",
    concept: "excess-property-check",
    difficulty: 3,
  },

  // ─── Challenge 2: readonly ist shallow ──────────────────────────────────
  {
    id: "L05-D2",
    title: "Readonly ist nur oberflaechlich",
    buggyCode: [
      "interface Config {",
      "  readonly host: string;",
      "  readonly settings: {",
      "    port: number;",
      "    debug: boolean;",
      "  };",
      "}",
      "",
      "const config: Config = {",
      "  host: 'localhost',",
      "  settings: { port: 3000, debug: false },",
      "};",
      "",
      "// config.host = 'other'; // Korrekt: Fehler",
      "config.settings.port = 8080; // Erwartet: Fehler, tatsaechlich: OK!",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 15,
    options: [
      "readonly auf 'settings' schuetzt nur die Referenz, nicht die Properties des Objekts",
      "readonly funktioniert nicht mit verschachtelten Objekten",
      "port ist kein readonly-Feld",
      "config muss mit 'as const' deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Was genau bedeutet 'readonly settings'?",
      "'readonly settings' bedeutet: Man kann config.settings nicht neu zuweisen " +
        "(config.settings = {...}), aber die Properties VON settings sind mutable.",
      "Fuer tiefes readonly: readonly auf jeder Ebene deklarieren, oder einen " +
        "rekursiven DeepReadonly-Typ verwenden.",
    ],
    fixedCode: [
      "interface Config {",
      "  readonly host: string;",
      "  readonly settings: Readonly<{",
      "    port: number;",
      "    debug: boolean;",
      "  }>;",
      "}",
      "",
      "const config: Config = {",
      "  host: 'localhost',",
      "  settings: { port: 3000, debug: false },",
      "};",
      "",
      "// config.host = 'other';         // Fehler: readonly",
      "// config.settings.port = 8080;   // Fehler: readonly",
      "// config.settings = { ... };     // Fehler: readonly",
    ].join("\n"),
    explanation:
      "'readonly' in TypeScript ist shallow (oberflaechlich). " +
      "'readonly settings: { port: number }' bedeutet nur, dass man 'settings' " +
      "nicht neu zuweisen kann — die Properties innerhalb von settings sind " +
      "weiterhin mutable. Fuer tiefes readonly muss jede Ebene separat als " +
      "readonly markiert werden (Readonly<T>) oder man verwendet einen " +
      "rekursiven DeepReadonly-Utility-Typ.",
    concept: "readonly-shallow",
    difficulty: 3,
  },

  // ─── Challenge 3: Intersection wird zu never ───────────────────────────
  {
    id: "L05-D3",
    title: "Intersection inkompatibler Typen wird zu never",
    buggyCode: [
      "type StringId = { id: string };",
      "type NumberId = { id: number };",
      "",
      "type Combined = StringId & NumberId;",
      "",
      "// Erwartet: Objekt mit id das beides sein kann",
      "// Tatsaechlich: Combined['id'] ist 'never'",
      "function create(): Combined {",
      "  return { id: 'abc' }; // Fehler!",
      "}",
    ].join("\n"),
    errorMessage: "Type 'string' is not assignable to type 'never'.",
    bugType: "type-error",
    bugLine: 4,
    options: [
      "Intersection von string & number fuer 'id' ergibt never — es gibt keinen Wert der beides ist",
      "StringId und NumberId koennen nicht kombiniert werden",
      "Intersections funktionieren nur mit Interfaces, nicht mit Type-Aliases",
      "create() muss den Combined-Typ als Generic verwenden",
    ],
    correctOption: 0,
    hints: [
      "Was ergibt string & number? Gibt es einen Wert der gleichzeitig string UND number ist?",
      "Intersection (&) bei Property-Typen bedeutet: id muss GLEICHZEITIG " +
        "string und number sein. Da kein Wert beides ist, wird es never.",
      "Union (|) waere hier richtig: type Combined = StringId | NumberId; " +
        "Oder: { id: string | number }.",
    ],
    fixedCode: [
      "type StringId = { id: string };",
      "type NumberId = { id: number };",
      "",
      "// Variante 1: Union statt Intersection",
      "type Either = StringId | NumberId;",
      "",
      "// Variante 2: Flexible ID",
      "type Combined = { id: string | number };",
      "",
      "function create(): Combined {",
      "  return { id: 'abc' }; // OK",
      "}",
    ].join("\n"),
    explanation:
      "Bei einer Intersection (A & B) werden gleichnamige Properties ebenfalls " +
      "intersected: id wird zu string & number. Da es keinen Wert gibt, der " +
      "gleichzeitig string UND number ist, wird der Typ zu never. Der Typ " +
      "Combined ist zwar nicht selbst never (er hat weitere Properties), aber " +
      "die id-Property ist never und kann nie zugewiesen werden. " +
      "Loesung: Union (|) statt Intersection verwenden, wenn die Properties " +
      "unterschiedliche Typen haben sollen.",
    concept: "intersection-never",
    difficulty: 4,
  },

  // ─── Challenge 4: Omit mit Tippfehler ──────────────────────────────────
  {
    id: "L05-D4",
    title: "Omit prueft den Key-String nicht",
    buggyCode: [
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "  password: string;",
      "}",
      "",
      "type PublicUser = Omit<User, 'pasword'>; // Tippfehler!",
      "",
      "const user: PublicUser = {",
      "  id: 1,",
      "  name: 'Alice',",
      "  email: 'alice@example.com',",
      "  password: 'geheim', // Erwartet: Fehler. Tatsaechlich: OK!",
      "};",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 8,
    options: [
      "Omit akzeptiert beliebige Strings als Key — Tippfehler werden nicht erkannt",
      "Omit entfernt immer alle string-Properties",
      "password muss in Anfuehrungszeichen stehen",
      "PublicUser braucht eine explizite Property-Liste",
    ],
    correctOption: 0,
    hints: [
      "Schau dir den Key-Parameter von Omit genau an: 'pasword' vs. 'password'.",
      "Omit<T, K> akzeptiert K extends string — NICHT K extends keyof T. " +
        "Jeder beliebige String wird akzeptiert.",
      "Tipp: Schreibe einen typsicheren StrictOmit: " +
        "type StrictOmit<T, K extends keyof T> = Omit<T, K>;",
    ],
    fixedCode: [
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "  password: string;",
      "}",
      "",
      "// Typsicherer StrictOmit der nur gueltige Keys akzeptiert",
      "type StrictOmit<T, K extends keyof T> = Omit<T, K>;",
      "",
      "type PublicUser = StrictOmit<User, 'password'>; // Tippfehler wird erkannt!",
      "",
      "const user: PublicUser = {",
      "  id: 1,",
      "  name: 'Alice',",
      "  email: 'alice@example.com',",
      "  // password fehlt korrekt",
      "};",
    ].join("\n"),
    explanation:
      "Omit<T, K> hat die Signatur K extends string — nicht K extends keyof T. " +
      "Das bedeutet, dass beliebige Strings als Key akzeptiert werden, auch " +
      "Tippfehler. 'pasword' (mit einem 's') ist kein Key von User, daher " +
      "entfernt Omit nichts und password bleibt im Typ. " +
      "Loesung: Einen StrictOmit-Typ definieren, der K extends keyof T erzwingt.",
    concept: "omit-typo",
    difficulty: 3,
  },

  // ─── Challenge 5: Leeres Interface akzeptiert alles ─────────────────────
  {
    id: "L05-D5",
    title: "Leeres Interface akzeptiert fast alles",
    buggyCode: [
      "interface Serializable {}",
      "",
      "function serialize(obj: Serializable): string {",
      "  return JSON.stringify(obj);",
      "}",
      "",
      "// Alle diese Aufrufe kompilieren ohne Fehler:",
      "serialize(42);",
      "serialize('hello');",
      "serialize(true);",
      "serialize({ anything: 'goes' });",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 1,
    options: [
      "Ein leeres Interface {} akzeptiert jeden Wert ausser null und undefined",
      "Serializable wird als 'any' behandelt",
      "JSON.stringify akzeptiert alle Typen",
      "Die Funktion hat keinen Return-Typ und ignoriert daher den Parameter-Typ",
    ],
    correctOption: 0,
    hints: [
      "Welchem TypeScript-Typ entspricht ein leeres Interface?",
      "Ein leeres Interface {} ist strukturell aequivalent zu dem Typ {} — " +
        "und der akzeptiert alles ausser null und undefined.",
      "Fuer ein sinnvolles Serializable-Interface muessen Properties oder " +
        "Methoden deklariert werden, z.B. toJSON(): unknown.",
    ],
    fixedCode: [
      "interface Serializable {",
      "  toJSON(): unknown;",
      "}",
      "",
      "function serialize(obj: Serializable): string {",
      "  return JSON.stringify(obj.toJSON());",
      "}",
      "",
      "// serialize(42);      // Fehler: number hat kein toJSON()",
      "// serialize('hello'); // Fehler: string hat kein toJSON()",
      "",
      "const data: Serializable = {",
      "  value: 42,",
      "  toJSON() { return { value: this.value }; },",
      "};",
      "serialize(data); // OK",
    ].join("\n"),
    explanation:
      "Ein leeres Interface {} in TypeScript ist strukturell kompatibel mit " +
      "jedem Typ ausser null und undefined. Das liegt an der strukturellen " +
      "Typisierung: Ein Wert ist kompatibel zu einem Typ, wenn er alle " +
      "geforderten Properties hat. Ein leeres Interface fordert keine Properties, " +
      "also ist alles kompatibel. Das ist ein haeufiger Designfehler bei " +
      "Marker-Interfaces. Loesung: Mindestens eine Property oder Methode " +
      "deklarieren, um den Typ sinnvoll einzuschraenken.",
    concept: "empty-interface",
    difficulty: 4,
  },
];
