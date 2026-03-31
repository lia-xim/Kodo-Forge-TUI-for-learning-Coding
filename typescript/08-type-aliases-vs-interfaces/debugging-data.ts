/**
 * Lektion 08 — Debugging Challenges: Type Aliases vs Interfaces
 *
 * 5 Challenges zu Declaration Merging, extends-Konflikten,
 * Intersection-never, implements-Missverstaendnis, Mapped Types.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L08-D1",
    title: "Stille never-Property durch Intersection-Konflikt",
    buggyCode: [
      "type ApiUser = { id: string; role: 'user' };",
      "type DbUser = { id: number; role: string; createdAt: Date };",
      "type FullUser = ApiUser & DbUser;",
      "",
      "const user: FullUser = {",
      "  id: '123', // Fehler — aber warum?",
      "  role: 'user',",
      "  createdAt: new Date(),",
      "};",
    ].join("\n"),
    errorMessage: "Type 'string' is not assignable to type 'never'.",
    bugType: "type-error",
    bugLine: 3,
    options: [
      "id ist string & number = never — Intersection-Konflikt ohne Warnung bei der Typ-Definition",
      "FullUser kann nicht aus zwei type-Aliases erstellt werden",
      "createdAt muss optional sein",
      "role muss ein Enum sein",
    ],
    correctOption: 0,
    hints: [
      "Was ergibt string & number?",
      "Intersection-Konflikte erzeugen keinen Fehler bei der Definition — nur bei der Verwendung.",
      "id ist string & number = never. Verwende extends statt & um Konflikte frueh zu erkennen.",
    ],
    fixedCode: [
      "interface BaseUser { id: string; role: string; }",
      "interface ApiUser extends BaseUser { role: 'user'; }",
      "interface FullUser extends ApiUser { createdAt: Date; }",
    ].join("\n"),
    explanation:
      "ApiUser.id ist string, DbUser.id ist number. Die Intersection " +
      "ergibt id: string & number = never. TypeScript meldet das erst bei " +
      "der Zuweisung, nicht bei der Typ-Definition. extends haette den " +
      "Konflikt sofort als Fehler gemeldet.",
    concept: "intersection-conflict",
    difficulty: 4,
  },

  {
    id: "L08-D2",
    title: "Declaration Merging unerwartet — doppeltes Interface",
    buggyCode: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "}",
      "",
      "// In einer anderen Datei oder weiter unten:",
      "interface Config {",
      "  port: string; // Anderer Typ!",
      "  debug: boolean;",
      "}",
    ].join("\n"),
    errorMessage:
      "Subsequent property declarations must have the same type. " +
      "Property 'port' must be of type 'number', but here has type 'string'.",
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Declaration Merging erlaubt keine inkompatiblen Property-Typen fuer denselben Key",
      "Man darf ein Interface nicht zweimal deklarieren",
      "Config muss als type deklariert werden",
      "debug muss in der ersten Deklaration stehen",
    ],
    correctOption: 0,
    hints: [
      "Was passiert wenn Declaration Merging denselben Key mit verschiedenen Typen findet?",
      "port ist in der ersten Deklaration number, in der zweiten string — Konflikt!",
      "Bei Declaration Merging muessen gemeinsame Properties denselben Typ haben.",
    ],
    fixedCode: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "}",
      "interface Config {",
      "  port: number; // Muss derselbe Typ sein!",
      "  debug: boolean;",
      "}",
    ].join("\n"),
    explanation:
      "Declaration Merging fuegt neue Properties hinzu, aber GEMEINSAME " +
      "Properties muessen denselben Typ haben. port: number in der ersten " +
      "und port: string in der zweiten Deklaration ist ein Fehler.",
    concept: "declaration-merging-conflict",
    difficulty: 3,
  },

  {
    id: "L08-D3",
    title: "implements vererbt keine Implementierung",
    buggyCode: [
      "interface Logger {",
      "  log(message: string): void;",
      "  warn(message: string): void;",
      "}",
      "",
      "class AppLogger implements Logger {",
      "  log(message: string): void {",
      "    console.log(message);",
      "  }",
      "  // warn() fehlt — aber implements sollte es doch mitbringen?",
      "}",
    ].join("\n"),
    errorMessage:
      "Class 'AppLogger' incorrectly implements interface 'Logger'. " +
      "Property 'warn' is missing.",
    bugType: "type-error",
    bugLine: 6,
    options: [
      "implements prueft nur ob die Klasse die Form erfuellt — es vererbt KEINE Implementierung",
      "Logger muss als abstract class deklariert werden",
      "warn muss optional sein (?)",
      "AppLogger braucht einen Konstruktor",
    ],
    correctOption: 0,
    hints: [
      "Was macht implements genau?",
      "implements ist ein reiner Compile-Zeit-Check — es vererbt nichts.",
      "Die Klasse muss ALLE Interface-Methoden selbst implementieren.",
    ],
    fixedCode: [
      "class AppLogger implements Logger {",
      "  log(message: string): void { console.log(message); }",
      "  warn(message: string): void { console.warn(message); }",
      "}",
    ].join("\n"),
    explanation:
      "implements vererbt keine Methoden — es prueft nur ob die Klasse " +
      "die richtige Form hat. Jede Methode aus dem Interface muss in der " +
      "Klasse implementiert werden. Fuer Vererbung: extends (bei Klassen).",
    concept: "implements-no-inheritance",
    difficulty: 2,
  },

  {
    id: "L08-D4",
    title: "Mapped Type in Interface — geht nicht",
    buggyCode: [
      "interface User {",
      "  name: string;",
      "  age: number;",
      "}",
      "",
      "// Versuch: Mapped Type in Interface",
      "interface ReadonlyUser {",
      "  readonly [K in keyof User]: User[K];",
      "}",
    ].join("\n"),
    errorMessage: "A mapped type may not declare properties or methods.",
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Mapped Types funktionieren nur mit type, nicht mit interface",
      "readonly ist nicht erlaubt in Interfaces",
      "keyof funktioniert nicht mit Interfaces",
      "User muss als type deklariert sein",
    ],
    correctOption: 0,
    hints: [
      "Welches Keyword unterstuetzt Mapped Types?",
      "Die [K in keyof T] Syntax ist ein Mapped Type — nur mit type verwendbar.",
      "Loesung: type ReadonlyUser = Readonly<User>; oder type ReadonlyUser = { readonly [K in keyof User]: User[K] };",
    ],
    fixedCode: [
      "type ReadonlyUser = {",
      "  readonly [K in keyof User]: User[K];",
      "};",
      "// Oder kuerzer: type ReadonlyUser = Readonly<User>;",
    ].join("\n"),
    explanation:
      "Mapped Types ([K in keyof T]) sind ein type-only Feature. " +
      "Interfaces unterstuetzen diese Syntax nicht. Verwende type " +
      "oder den eingebauten Utility-Type Readonly<User>.",
    concept: "mapped-type-type-only",
    difficulty: 2,
  },

  {
    id: "L08-D5",
    title: "extends mit inkompatiblem Property",
    buggyCode: [
      "interface Animal {",
      "  name: string;",
      "  legs: number;",
      "}",
      "",
      "interface Snake extends Animal {",
      "  legs: 0; // Snake hat keine Beine",
      "  venomous: boolean;",
      "}",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 7,
    options: [
      "legs: 0 ist ein Subtyp von number — das funktioniert tatsaechlich!",
      "extends erlaubt keine Literal Types fuer geerbte Properties",
      "Snake kann Animal nicht erweitern",
      "legs muss als optional deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Ist der Literal-Typ 0 kompatibel mit number?",
      "0 ist ein Subtyp von number — extends erlaubt VERENGUNG des Typs.",
      "Dieser Code kompiliert tatsaechlich! extends erlaubt kompatible Ueberschreibungen.",
    ],
    fixedCode: [
      "// Dieser Code ist korrekt!",
      "interface Snake extends Animal {",
      "  legs: 0; // 0 ist ein Subtyp von number — erlaubt!",
      "  venomous: boolean;",
      "}",
      "",
      "const cobra: Snake = { name: 'Cobra', legs: 0, venomous: true };",
    ].join("\n"),
    explanation:
      "Ueberraschung: Dieser Code ist KORREKT! 0 (Literal Type) ist " +
      "ein Subtyp von number. extends erlaubt die Verengung (narrowing) " +
      "von geerbten Properties — solange der neue Typ ein Subtyp ist. " +
      "legs: string waere ein Fehler, aber legs: 0 ist erlaubt.",
    concept: "extends-narrowing",
    difficulty: 3,
  },
];
