/**
 * Lektion 15 — Debugging Challenges: Utility Types
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L15-D1",
    title: "Readonly schuetzt verschachtelte Objekte nicht",
    buggyCode: [
      "interface Config {",
      "  server: { host: string; port: number };",
      "  debug: boolean;",
      "}",
      "",
      "function freeze(config: Readonly<Config>): void {",
      "  // Soll NICHTS aendern koennen!",
      "  config.server.port = 9999;  // Kein Error?!",
      "  console.log(`Port: ${config.server.port}`);",
      "}",
      "",
      "const c: Config = { server: { host: 'localhost', port: 3000 }, debug: false };",
      "freeze(c);",
      "// c.server.port ist jetzt 9999 — obwohl Readonly verwendet wurde!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 8,
    options: [
      "Readonly ist shallow — verschachtelte Objekte werden nicht geschuetzt",
      "config muss als const deklariert werden",
      "freeze muss einen neuen Config zurueckgeben",
      "Readonly funktioniert nicht mit Funktionsparametern",
    ],
    correctOption: 0,
    hints: [
      "Welche Ebene schuetzt Readonly<T>?",
      "Readonly macht nur die Properties der ERSTEN Ebene readonly.",
      "Loesung: Eigenes DeepReadonly<T> verwenden.",
    ],
    fixedCode: [
      "type DeepReadonly<T> = T extends object",
      "  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }",
      "  : T;",
      "",
      "function freeze(config: DeepReadonly<Config>): void {",
      "  // config.server.port = 9999;  // Jetzt: Error!",
      "  console.log(`Port: ${config.server.port}`);",
      "}",
    ].join("\n"),
    explanation:
      "Readonly<T> ist shallow — nur die erste Ebene ist readonly. " +
      "config.server ist readonly (Referenz), aber config.server.port ist es nicht. " +
      "DeepReadonly<T> mit Rekursion loest das Problem.",
    concept: "readonly-shallow",
    difficulty: 2,
  },

  {
    id: "L15-D2",
    title: "Omit mit Tippfehler entfernt nichts",
    buggyCode: [
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "  password: string;",
      "}",
      "",
      "// Soll password entfernen:",
      "type SafeUser = Omit<User, 'pasword'>; // Tippfehler!",
      "",
      "function toSafe(user: User): SafeUser {",
      "  return user; // Kein Error — aber password ist noch drin!",
      "}",
      "",
      "const safe = toSafe({ id: 1, name: 'Max', email: 'max@test.com', password: 'secret' });",
      "console.log(safe); // { id, name, email, password } — Oops!",
    ].join("\n"),
    errorMessage: "No error — that's the bug! Omit accepts any string.",
    bugType: "logic-error",
    bugLine: 9,
    options: [
      "Omit akzeptiert beliebige Strings — der Tippfehler wird nicht erkannt",
      "User hat kein password-Feld",
      "Omit funktioniert nicht mit Interfaces",
      "toSafe muss den User destructuren",
    ],
    correctOption: 0,
    hints: [
      "Was passiert wenn du Omit einen nicht-existierenden Key gibst?",
      "Omit<T, K> erfordert nur K extends string — nicht K extends keyof T.",
      "Verwende StrictOmit<T, K extends keyof T> = Omit<T, K> stattdessen.",
    ],
    fixedCode: [
      "type StrictOmit<T, K extends keyof T> = Omit<T, K>;",
      "",
      "type SafeUser = StrictOmit<User, 'password'>; // Tippfehler waere ein Error!",
    ].join("\n"),
    explanation:
      "Omit ist nicht typsicher bei den Keys. 'pasword' (Tippfehler) wird akzeptiert, " +
      "aber da der Key nicht existiert, wird nichts entfernt. " +
      "StrictOmit mit K extends keyof T erkennt den Fehler.",
    concept: "omit-not-typesafe",
    difficulty: 3,
  },

  {
    id: "L15-D3",
    title: "ReturnType bei async Funktion gibt Promise",
    buggyCode: [
      "async function fetchUser(id: number) {",
      "  return { id, name: 'Max', email: 'max@test.com' };",
      "}",
      "",
      "type User = ReturnType<typeof fetchUser>;",
      "// Erwartet: { id: number; name: string; email: string }",
      "// Tatsaechlich: Promise<{ id: number; name: string; email: string }>",
      "",
      "function displayUser(user: User): void {",
      "  console.log(user.name); // Error! Property 'name' does not exist on type 'Promise<...>'",
      "}",
    ].join("\n"),
    errorMessage: "Property 'name' does not exist on type 'Promise<{ id: number; name: string; email: string }>'.",
    bugType: "type-error",
    bugLine: 5,
    options: [
      "ReturnType bei async Funktionen gibt Promise<...> — man braucht Awaited dazu",
      "fetchUser muss synchron sein",
      "typeof ist falsch hier",
      "ReturnType funktioniert nicht mit async",
    ],
    correctOption: 0,
    hints: [
      "Was gibt eine async Funktion zurueck?",
      "Async Funktionen geben IMMER ein Promise zurueck.",
      "Awaited<ReturnType<typeof fn>> entpackt das Promise.",
    ],
    fixedCode: [
      "type User = Awaited<ReturnType<typeof fetchUser>>;",
      "// ^ { id: number; name: string; email: string } — ohne Promise!",
    ].join("\n"),
    explanation:
      "Async Funktionen geben immer ein Promise zurueck. ReturnType extrahiert " +
      "den tatsaechlichen Rueckgabetyp (Promise<...>). " +
      "Awaited entpackt das Promise zum inneren Typ.",
    concept: "returntype-async-awaited",
    difficulty: 2,
  },

  {
    id: "L15-D4",
    title: "Exclude statt Omit fuer Objekt-Properties",
    buggyCode: [
      "interface Product {",
      "  id: number;",
      "  name: string;",
      "  price: number;",
      "}",
      "",
      "// Soll id entfernen:",
      "type CreateInput = Exclude<Product, 'id'>;",
      "// Erwartet: { name: string; price: number }",
      "// Tatsaechlich: Product (unveraendert!)",
      "",
      "function create(input: CreateInput): void {",
      "  // input.id existiert immer noch!",
      "  console.log(input);",
      "}",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Exclude arbeitet auf Union-Mitgliedern, nicht auf Objekt-Properties — Omit ist richtig",
      "Exclude braucht den vollstaendigen Property-Typ",
      "Product muss ein Union sein",
      "CreateInput muss generisch sein",
    ],
    correctOption: 0,
    hints: [
      "Worauf arbeitet Exclude? Auf Unions oder auf Objekt-Properties?",
      "Exclude<Product, 'id'> prueft: Ist Product dem Typ 'id' zuweisbar? Nein — also bleibt Product.",
      "Fuer Objekt-Properties: Omit<Product, 'id'>.",
    ],
    fixedCode: [
      "type CreateInput = Omit<Product, 'id'>;",
      "// ^ { name: string; price: number } — korrekt!",
    ].join("\n"),
    explanation:
      "Exclude<T, U> arbeitet auf UNION-Mitgliedern — es entfernt Mitglieder aus T " +
      "die U zuweisbar sind. Ein Objekt-Typ ist kein String, also passiert nichts. " +
      "Fuer Objekt-Properties: Omit<T, K>.",
    concept: "exclude-vs-omit",
    difficulty: 3,
  },

  {
    id: "L15-D5",
    title: "Partial-Property ohne Narrowing verwenden",
    buggyCode: [
      "interface User {",
      "  name: string;",
      "  email: string;",
      "}",
      "",
      "function greet(update: Partial<User>): string {",
      "  return `Hello ${update.name.toUpperCase()}`;",
      "  // Error! update.name koennte undefined sein!",
      "}",
    ].join("\n"),
    errorMessage: "Object is possibly 'undefined'.",
    bugType: "type-error",
    bugLine: 7,
    options: [
      "Partial macht Properties optional — name koennte undefined sein und braucht Narrowing",
      "toUpperCase funktioniert nicht mit Partial",
      "Partial entfernt die string-Methoden",
      "greet muss den User als Required<User> nehmen",
    ],
    correctOption: 0,
    hints: [
      "Was ist der Typ von update.name bei Partial<User>?",
      "string | undefined — weil name? optional ist.",
      "Pruefe mit if (update.name) oder verwende update.name ?? 'Guest'.",
    ],
    fixedCode: [
      "function greet(update: Partial<User>): string {",
      "  return `Hello ${(update.name ?? 'Guest').toUpperCase()}`;",
      "}",
    ].join("\n"),
    explanation:
      "Partial<T> macht alle Properties optional: name?: string. " +
      "Das bedeutet name hat den Typ string | undefined. " +
      "Man muss mit Narrowing (if-Check, ??, !) pruefen bevor man " +
      "String-Methoden wie toUpperCase() aufruft.",
    concept: "partial-optional-undefined",
    difficulty: 2,
  },
];
