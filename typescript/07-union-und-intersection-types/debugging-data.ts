/**
 * Lektion 07 — Debugging Challenges: Union & Intersection Types
 *
 * 5 Challenges zu typeof null, fehlender Exhaustive Check,
 * Intersection-Konflikte, Narrowing-Verlust, in-Operator.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L07-D1",
    title: "typeof null === 'object' — der JavaScript-Klassiker",
    buggyCode: [
      "function getLength(value: string | null): number {",
      "  if (typeof value === 'object') {",
      "    // Hier ist value sicher ein Objekt... oder?",
      "    return 0; // null-Fall",
      "  }",
      "  return value.length;",
      "}",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "typeof null === 'object' — null wird faelschlich als Objekt erkannt",
      "value.length funktioniert nicht fuer strings",
      "Der Return-Typ muss angegeben werden",
      "string hat keinen typeof-Check",
    ],
    correctOption: 0,
    hints: [
      "Was gibt typeof null in JavaScript zurueck?",
      "typeof null === 'object' ist ein bekannter JavaScript-Bug seit 1995.",
      "Verwende value === null oder value !== null statt typeof-Check.",
    ],
    fixedCode: [
      "function getLength(value: string | null): number {",
      "  if (value === null) {",
      "    return 0;",
      "  }",
      "  return value.length;",
      "}",
    ].join("\n"),
    explanation:
      "typeof null === 'object' ist ein beruechtigter JavaScript-Bug. " +
      "Der Code trifft den 'object'-Branch fuer null UND echte Objekte. " +
      "Fuer null-Checks immer === null oder !== null verwenden.",
    concept: "typeof-null-quirk",
    difficulty: 2,
  },

  {
    id: "L07-D2",
    title: "Fehlender Exhaustive Check — neues Union-Mitglied vergessen",
    buggyCode: [
      "type Action =",
      "  | { type: 'increment' }",
      "  | { type: 'decrement' }",
      "  | { type: 'reset'; value: number };",
      "",
      "function reducer(state: number, action: Action): number {",
      "  switch (action.type) {",
      "    case 'increment': return state + 1;",
      "    case 'decrement': return state - 1;",
      "    // 'reset' vergessen!",
      "  }",
      "  return state; // Fallback — aber reset wird nie behandelt",
      "}",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 7,
    options: [
      "Ohne Exhaustive Check wird 'reset' stillschweigend ignoriert",
      "Der switch braucht geschweifte Klammern",
      "Action muss als enum definiert werden",
      "reducer muss async sein",
    ],
    correctOption: 0,
    hints: [
      "Was passiert wenn ein neues Union-Mitglied hinzugefuegt wird?",
      "Ohne Exhaustive Check laeuft der Code durch zum Fallback-Return.",
      "Fuege einen default-Case mit const _: never = action hinzu.",
    ],
    fixedCode: [
      "function reducer(state: number, action: Action): number {",
      "  switch (action.type) {",
      "    case 'increment': return state + 1;",
      "    case 'decrement': return state - 1;",
      "    case 'reset': return action.value;",
      "    default:",
      "      const _exhaustive: never = action;",
      "      return _exhaustive;",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "Ohne Exhaustive Check (never im default) bemerkt TypeScript nicht, " +
      "wenn ein Union-Mitglied nicht behandelt wird. 'reset' wird stillschweigend " +
      "ignoriert. Der never-Trick erzwingt, dass ALLE Faelle behandelt werden.",
    concept: "exhaustive-check",
    difficulty: 3,
  },

  {
    id: "L07-D3",
    title: "Intersection-Konflikt erzeugt stilles never",
    buggyCode: [
      "type Strict = { mode: 'strict'; level: number };",
      "type Loose = { mode: 'loose'; tolerance: number };",
      "type Config = Strict & Loose;",
      "",
      "const config: Config = {",
      "  mode: 'strict', // Was ist der Typ von mode?",
      "  level: 5,",
      "  tolerance: 0.1,",
      "};",
    ].join("\n"),
    errorMessage:
      "Type '\"strict\"' is not assignable to type 'never'.",
    bugType: "type-error",
    bugLine: 3,
    options: [
      "mode ist 'strict' & 'loose' = never — kein Wert kann beide Literale gleichzeitig sein",
      "Strict und Loose koennen nicht intersected werden",
      "Config braucht einen Diskriminator",
      "mode muss als optional deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Was ergibt 'strict' & 'loose'?",
      "Intersection von verschiedenen Literalen = never. Kein Wert erfuellt beides.",
      "Verwende Union (Strict | Loose) statt Intersection, oder entferne den mode-Konflikt.",
    ],
    fixedCode: [
      "type Config = Strict | Loose;",
      "",
      "const config: Config = {",
      "  mode: 'strict',",
      "  level: 5,",
      "};",
    ].join("\n"),
    explanation:
      "Intersection von Literal-Typen 'strict' & 'loose' ergibt never — " +
      "kein Wert kann gleichzeitig 'strict' UND 'loose' sein. " +
      "TypeScript meldet das erst bei der Zuweisung, nicht bei der Typ-Definition. " +
      "Verwende Union (|) statt Intersection (&) fuer verschiedene Varianten.",
    concept: "intersection-literal-conflict",
    difficulty: 4,
  },

  {
    id: "L07-D4",
    title: "Narrowing geht nach Funktionsaufruf verloren",
    buggyCode: [
      "let value: string | number = 'hello';",
      "",
      "function maybeChange() {",
      "  // Koennte value aendern...",
      "}",
      "",
      "if (typeof value === 'string') {",
      "  maybeChange();",
      "  console.log(value.toUpperCase()); // Fehler?",
      "}",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 9,
    options: [
      "TypeScript verliert das Narrowing nach einem Funktionsaufruf weil die Funktion value aendern koennte",
      "typeof funktioniert nicht fuer let-Variablen",
      "maybeChange muss einen Return-Typ haben",
      "console.log veraendert den Typ",
    ],
    correctOption: 0,
    hints: [
      "Was koennte maybeChange() mit value machen?",
      "Da value mit let deklariert ist, koennte jede Funktion den Wert aendern.",
      "Loesung: const statt let, oder value in eine lokale const-Variable kopieren.",
    ],
    fixedCode: [
      "let value: string | number = 'hello';",
      "",
      "function maybeChange() { /* ... */ }",
      "",
      "if (typeof value === 'string') {",
      "  const str = value; // Lokale Kopie behaelt den Typ",
      "  maybeChange();",
      "  console.log(str.toUpperCase()); // OK — str ist const string",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript verliert das Narrowing fuer let-Variablen nach " +
      "Funktionsaufrufen, weil die Funktion die Variable aendern koennte. " +
      "Loesung: Wert in eine const-Variable kopieren oder const verwenden.",
    concept: "narrowing-invalidation",
    difficulty: 3,
  },

  {
    id: "L07-D5",
    title: "Diskriminator mit string statt Literal",
    buggyCode: [
      "interface Dog { kind: string; bark(): void; }",
      "interface Cat { kind: string; meow(): void; }",
      "type Animal = Dog | Cat;",
      "",
      "function handle(animal: Animal) {",
      "  if (animal.kind === 'dog') {",
      "    animal.bark(); // Fehler — warum?",
      "  }",
      "}",
    ].join("\n"),
    errorMessage:
      "Property 'bark' does not exist on type 'Animal'.",
    bugType: "type-error",
    bugLine: 6,
    options: [
      "kind ist string in beiden Typen — kein eindeutiger Diskriminator fuer Narrowing",
      "animal.bark() muss mit ?. aufgerufen werden",
      "Dog und Cat muessen Klassen sein",
      "if-Statements funktionieren nicht mit Unions",
    ],
    correctOption: 0,
    hints: [
      "Was braucht eine Discriminated Union als Tag-Property?",
      "kind ist in beiden Interfaces 'string' — TypeScript kann nicht unterscheiden.",
      "Aendere zu kind: 'dog' und kind: 'cat' (Literal Types als Diskriminator).",
    ],
    fixedCode: [
      "interface Dog { kind: 'dog'; bark(): void; }",
      "interface Cat { kind: 'cat'; meow(): void; }",
      "type Animal = Dog | Cat;",
      "",
      "function handle(animal: Animal) {",
      "  if (animal.kind === 'dog') {",
      "    animal.bark(); // OK — TypeScript verengt auf Dog",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "Fuer Discriminated Unions muss die Tag-Property LITERAL TYPES haben, " +
      "nicht string. kind: string kann jeden Wert haben — TypeScript kann " +
      "nicht wissen ob 'dog' nur in Dog vorkommt. " +
      "Mit kind: 'dog' | kind: 'cat' erkennt TypeScript den Diskriminator.",
    concept: "discriminated-union-literal-tag",
    difficulty: 3,
  },
];
