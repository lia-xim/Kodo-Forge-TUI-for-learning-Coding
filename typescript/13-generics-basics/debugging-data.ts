/**
 * Lektion 13 — Debugging Challenges: Generics Basics
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L13-D1",
    title: "T hat keine Properties ohne Constraint",
    buggyCode: [
      "function getLength<T>(arg: T): number {",
      "  return arg.length;",
      "}",
      "",
      "console.log(getLength('hallo')); // Soll 5 sein",
    ].join("\n"),
    errorMessage: "Property 'length' does not exist on type 'T'.",
    bugType: "type-error",
    bugLine: 2,
    options: [
      "T ist uneingeschraenkt — TypeScript weiss nicht ob T .length hat",
      "getLength kann nicht mit Strings aufgerufen werden",
      "length ist keine gueltige Property",
      "T muss durch string ersetzt werden",
    ],
    correctOption: 0,
    hints: [
      "Was weiss TypeScript ueber T ohne Constraint?",
      "Ohne extends kann T alles sein — auch number (hat kein .length).",
      "Loesung: T extends { length: number } als Constraint.",
    ],
    fixedCode: [
      "function getLength<T extends { length: number }>(arg: T): number {",
      "  return arg.length; // OK — T hat garantiert .length",
      "}",
    ].join("\n"),
    explanation:
      "Ohne Constraint weiss TypeScript nichts ueber T. T koennte number, " +
      "boolean, oder jeder andere Typ sein. Mit `T extends { length: number }` " +
      "garantierst du dass T mindestens .length hat.",
    concept: "constraint-missing",
    difficulty: 2,
  },

  {
    id: "L13-D2",
    title: "Typparameter nicht inferierbar",
    buggyCode: [
      "function createArray<T>(): T[] {",
      "  return [];",
      "}",
      "",
      "const arr = createArray();",
      "arr.push('hallo');",
      "// arr ist unknown[] — nicht string[]!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 5,
    options: [
      "T kann nicht aus den Argumenten inferiert werden — es gibt keine Argumente",
      "createArray ist falsch implementiert",
      "push funktioniert nicht mit Generics",
      "Leere Arrays haben immer den Typ unknown[]",
    ],
    correctOption: 0,
    hints: [
      "Woraus inferiert TypeScript den Typparameter T?",
      "T kommt nur im Rueckgabetyp vor — nicht in den Parametern.",
      "Loesung: Explizite Typangabe: createArray<string>().",
    ],
    fixedCode: [
      "function createArray<T>(): T[] {",
      "  return [];",
      "}",
      "",
      "const arr = createArray<string>(); // T explizit angeben!",
      "arr.push('hallo'); // OK — arr ist string[]",
    ].join("\n"),
    explanation:
      "TypeScript inferiert Typparameter aus den ARGUMENTEN. Wenn T nur im " +
      "Rueckgabetyp vorkommt und die Funktion keine Argumente hat, kann " +
      "TypeScript T nicht inferieren. Dann muss man T explizit angeben.",
    concept: "inference-limitation",
    difficulty: 2,
  },

  {
    id: "L13-D3",
    title: "Ungueltiger Key trotz keyof",
    buggyCode: [
      "function getProperty<T>(obj: T, key: string): unknown {",
      "  return obj[key];",
      "}",
      "",
      "const user = { name: 'Max', age: 30 };",
      "const email = getProperty(user, 'email');",
      "// Kein Fehler — aber 'email' existiert nicht!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 1,
    options: [
      "key ist string statt K extends keyof T — kein Key-Check",
      "obj[key] funktioniert nicht bei Generics",
      "user hat kein email-Property",
      "getProperty braucht einen Return Type",
    ],
    correctOption: 0,
    hints: [
      "Was ist der Typ von key? Wird geprueft ob er gueltig ist?",
      "key: string akzeptiert JEDEN String — auch ungueltige Keys.",
      "Loesung: Zweiten Typparameter K extends keyof T verwenden.",
    ],
    fixedCode: [
      "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {",
      "  return obj[key];",
      "}",
      "",
      "const user = { name: 'Max', age: 30 };",
      "// getProperty(user, 'email'); // Error! 'email' ist nicht in keyof user",
      "const name = getProperty(user, 'name'); // string",
    ].join("\n"),
    explanation:
      "Mit key: string kann jeder beliebige String uebergeben werden — " +
      "auch Keys die nicht existieren. K extends keyof T erzwingt dass " +
      "nur gueltige Schluessel akzeptiert werden UND der Rueckgabetyp " +
      "T[K] ist praezise statt unknown.",
    concept: "keyof-constraint-missing",
    difficulty: 3,
  },

  {
    id: "L13-D4",
    title: "Default-Typ verletzt Constraint",
    buggyCode: [
      "interface Repository<T extends { id: number } = string> {",
      "  findById(id: number): T | null;",
      "  save(entity: T): void;",
      "}",
      "",
      "// Error bei der Interface-Definition!",
    ].join("\n"),
    errorMessage: "Type 'string' does not satisfy the constraint '{ id: number }'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "Der Default-Typ string erfuellt den Constraint { id: number } nicht",
      "Interfaces koennen keine Defaults haben",
      "Repository braucht zwei Typparameter",
      "findById muss generisch sein",
    ],
    correctOption: 0,
    hints: [
      "Welchen Constraint hat T? Erfuellt string diesen Constraint?",
      "T extends { id: number } — string hat kein .id!",
      "Der Default-Typ muss den Constraint erfuellen. Verwende z.B. { id: number; name: string }.",
    ],
    fixedCode: [
      "interface Repository<T extends { id: number } = { id: number; name: string }> {",
      "  findById(id: number): T | null;",
      "  save(entity: T): void;",
      "}",
    ].join("\n"),
    explanation:
      "Der Default-Typ MUSS den Constraint erfuellen. string hat keine " +
      "id-Property und erfuellt daher nicht { id: number }. " +
      "Der Default muss ein Typ sein der mindestens { id: number } hat.",
    concept: "default-violates-constraint",
    difficulty: 3,
  },

  {
    id: "L13-D5",
    title: "Typparameter nur einmal verwendet — Anti-Pattern",
    buggyCode: [
      "function logValue<T>(value: T): void {",
      "  console.log(value);",
      "}",
      "",
      "function logArray<T>(arr: T[]): void {",
      "  arr.forEach(item => console.log(item));",
      "}",
      "",
      "// Funktioniert — aber warum ist es ein Anti-Pattern?",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 1,
    options: [
      "T wird nur einmal verwendet — es stellt keine Typ-Beziehung her",
      "logValue und logArray sind falsch implementiert",
      "void kann nicht mit Generics verwendet werden",
      "forEach funktioniert nicht mit generischen Arrays",
    ],
    correctOption: 0,
    hints: [
      "Wie oft kommt T in jeder Funktion vor? Nur im Parameter oder auch im Rueckgabetyp?",
      "T kommt jeweils nur im Parameter vor. Es gibt keinen Rueckgabetyp der T nutzt.",
      "Ersetze T durch unknown — der Code funktioniert identisch.",
    ],
    fixedCode: [
      "// Besser: unknown statt unnoetigem Typparameter",
      "function logValue(value: unknown): void {",
      "  console.log(value);",
      "}",
      "",
      "function logArray(arr: unknown[]): void {",
      "  arr.forEach(item => console.log(item));",
      "}",
    ].join("\n"),
    explanation:
      "Ein Typparameter der nur EINMAL vorkommt verbindet nichts. " +
      "Er koennte durch unknown ersetzt werden ohne Informationsverlust. " +
      "Generics sollten eine BEZIEHUNG herstellen — z.B. Input-Typ = Output-Typ. " +
      "Mindestens zweimal verwenden!",
    concept: "unnecessary-type-parameter",
    difficulty: 2,
  },
];
