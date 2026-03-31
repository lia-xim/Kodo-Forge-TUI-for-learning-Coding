/**
 * Lektion 03 — Quiz-Daten: Type Annotations & Type Inference
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "03";
export const lessonTitle = "Type Annotations & Type Inference";

export const questions: QuizQuestion[] = [

  // --- Frage 1: Grundlegendes Inference ---
  {
    question: "Welchen Typ infert TypeScript fuer die Variable `x`?",
    code: `const x = "hello";`,
    options: [
      'string',
      '"hello"',
      'any',
      'unknown',
    ],
    correct: 1,
    explanation:
      'Bei `const` bleibt der Literal-Typ erhalten. Da "hello" ein String-Literal ist ' +
      'und die Variable const ist, ist der Typ "hello" (nicht string).',
  },

  // --- Frage 2: let vs const ---
  {
    question: "Welchen Typ hat die Variable `y`?",
    code: `let y = "hello";`,
    options: [
      '"hello"',
      'string',
      'any',
      'string | undefined',
    ],
    correct: 1,
    explanation:
      'Bei `let` findet Widening statt: "hello" wird zu string erweitert, ' +
      'weil die Variable spaeter einen anderen String-Wert annehmen koennte.',
  },

  // --- Frage 3: Wann annotieren? ---
  {
    question: "Welche Annotation ist hier UEBERFLUESSIG?",
    code: `function greet(name: string): void {\n  const msg: string = \`Hallo \${name}\`;\n  console.log(msg);\n}`,
    options: [
      'name: string',
      ': void',
      'msg: string',
      'Keine -- alle sind noetig',
    ],
    correct: 2,
    explanation:
      '`msg: string` ist ueberfluessig, weil TS den Typ aus dem Template-Literal ' +
      'infert. Parameter-Annotationen (name: string) sind Pflicht, und der Return-Typ ' +
      '(: void) ist bei exportierten Funktionen Best Practice.',
  },

  // --- Frage 4: Object Widening ---
  {
    question: "Welchen Typ hat `config.host`?",
    code: `const config = {\n  host: "localhost",\n  port: 3000,\n};`,
    options: [
      '"localhost"',
      'string',
      'string | undefined',
      'any',
    ],
    correct: 1,
    explanation:
      'Obwohl `config` const ist, werden Object-Properties geweitert. ' +
      'Properties koennen ja geaendert werden (config.host = "other"). ' +
      'Deshalb ist der Typ string, nicht "localhost".',
  },

  // --- Frage 5: as const ---
  {
    question: "Was bewirkt `as const` auf einem Array?",
    code: `const colors = ["red", "green", "blue"] as const;`,
    options: [
      'Das Array wird zu string[]',
      'Das Array wird zu einem readonly Tuple mit Literal-Typen',
      'Das Array wird unveraenderbar, aber die Typen bleiben string',
      'Nichts -- as const funktioniert nur bei Primitiven',
    ],
    correct: 1,
    explanation:
      '`as const` macht das Array zu readonly ["red", "green", "blue"]. ' +
      'Jedes Element behaelt seinen Literal-Typ, und das gesamte Array ist readonly.',
  },

  // --- Frage 6: Contextual Typing ---
  {
    question: "Warum muss `n` hier NICHT annotiert werden?",
    code: `const nums = [1, 2, 3];\nconst doubled = nums.map(n => n * 2);`,
    options: [
      'Weil `n` automatisch `any` ist',
      'Weil TypeScript den Typ aus dem Array-Element ableitet (Contextual Typing)',
      'Weil Arrow Functions keine Annotationen brauchen',
      'Weil `n` immer number ist in JavaScript',
    ],
    correct: 1,
    explanation:
      'TypeScript kennt den Typ von nums (number[]) und weiss, dass der ' +
      'Callback von .map() den Element-Typ als Parameter bekommt. ' +
      'Das nennt man Contextual Typing.',
  },

  // --- Frage 7: Leere Arrays ---
  {
    question: "Welchen Typ hat `items`?",
    code: `const items = [];`,
    options: [
      'never[]',
      'unknown[]',
      'any[]',
      'undefined[]',
    ],
    correct: 2,
    explanation:
      'Ein leeres Array ohne Annotation wird als any[] infert. ' +
      'Das ist einer der wenigen Faelle, wo Inference zu einem unsicheren Typ fuehrt. ' +
      'Deshalb: leere Arrays immer annotieren!',
  },

  // --- Frage 8: Return Type Inference ---
  {
    question: "Welchen Return-Typ infert TypeScript?",
    code: `function transform(x: number) {\n  if (x > 0) return x.toString();\n  if (x === 0) return null;\n  return undefined;\n}`,
    options: [
      'string',
      'string | null',
      'string | null | undefined',
      'string | void',
    ],
    correct: 2,
    explanation:
      'TS analysiert ALLE return-Pfade: toString() gibt string, ' +
      'dann null, dann undefined. Der Return-Typ ist die Union ' +
      'aller moeglichen Return-Werte: string | null | undefined.',
  },

  // --- Frage 9: Widening bei Funktions-Return ---
  {
    question: "Wie behaelt man den Literal-Typ im Return-Wert?",
    code: `function getStatus() {\n  return "active";\n}\n// Return-Typ: string (geweitert!)`,
    options: [
      'Man kann Widening bei Returns nicht verhindern',
      'Man verwendet `return "active" as const`',
      'Man schreibt `const` vor `function`',
      'Man verwendet `return "active" as literal`',
    ],
    correct: 1,
    explanation:
      '`as const` auf dem Return-Wert verhindert Widening. ' +
      'Alternativ kann man den Return-Typ explizit annotieren: ' +
      '`function getStatus(): "active" { ... }`.',
  },

  // --- Frage 10: satisfies vs Annotation ---
  {
    question: "Was ist der entscheidende Unterschied zwischen Annotation (`: Typ`) und `satisfies Typ`?",
    code: `type Colors = Record<string, string | number[]>;\n\nconst a: Colors = { red: "#f00" };\nconst b = { red: "#f00" } satisfies Colors;`,
    options: [
      'Es gibt keinen Unterschied -- satisfies ist nur kuerzere Syntax',
      'satisfies validiert den Typ, behaelt aber die spezifischen inferierten Typen',
      'satisfies ist strenger und erlaubt keine Extra-Properties',
      'satisfies funktioniert nur mit Record-Typen',
    ],
    correct: 1,
    explanation:
      'Bei Annotation (`: Colors`) wird a.red zu `string | number[]` (der volle Union). ' +
      'Bei `satisfies` wird b.red zu `string` (der spezifische inferierte Typ). ' +
      'satisfies validiert gegen das Schema, aber der inferierte Typ bleibt praezise.',
  },

  // --- Frage 11: Control Flow Narrowing ---
  {
    question: "Welchen Typ hat `value` in der markierten Zeile?",
    code: `function process(value: string | number | null) {\n  if (value === null) return;\n  if (typeof value === "string") {\n    // <-- Hier: Welcher Typ?\n    console.log(value);\n  }\n}`,
    options: [
      'string | number | null',
      'string | number',
      'string',
      'string | null',
    ],
    correct: 2,
    explanation:
      'TS verengt den Typ schrittweise: ' +
      '1. Nach `if (value === null) return` ist null ausgeschlossen --> string | number. ' +
      '2. In `if (typeof value === "string")` wird weiter verengt --> string. ' +
      'Control Flow Analysis verfolgt jeden Schritt und verengt den Typ entsprechend.',
  },

  // --- Frage 12: Contextual Typing Verlust ---
  {
    question: "Warum hat `event` im folgenden Code den Typ `any`?",
    code: `const handler = (event) => {\n  console.log(event.clientX);\n};\ndocument.addEventListener("click", handler);`,
    options: [
      'Weil addEventListener den Event-Typ nicht kennt',
      'Weil handler getrennt definiert wird und TS den Kontext nicht hat',
      'Weil Arrow Functions keinen impliziten Typ fuer Parameter haben',
      'Weil der Event-Typ explizit als any definiert ist',
    ],
    correct: 1,
    explanation:
      'Contextual Typing funktioniert nur, wenn der Callback DIREKT als ' +
      'Argument uebergeben wird. Wenn handler getrennt definiert wird, ' +
      'hat TS an der Definitionsstelle keinen Kontext. Die Verbindung ' +
      'zu addEventListener entsteht erst spaeter -- zu spaet fuer Inference.',
  },

  // --- Frage 13: Object.keys() ---
  {
    question: "Warum gibt `Object.keys({ a: 1, b: 2 })` den Typ `string[]` zurueck?",
    options: [
      'Weil Object.keys() in JavaScript immer Strings zurueckgibt',
      'Das ist ein Bug in TypeScript',
      'Weil JS-Objekte zur Laufzeit mehr Properties haben koennen als TS kennt',
      'Weil "a" und "b" keine gueltige Literal-Typen sind',
    ],
    correct: 2,
    explanation:
      'TypeScript ist hier absichtlich konservativ. Ein Objekt vom Typ ' +
      '{ a: number; b: number } koennte zur Laufzeit auch Properties ' +
      'wie "c" oder "toString" haben (z.B. durch Vererbung oder dynamische ' +
      'Zuweisung). Deshalb waere `("a" | "b")[]` technisch unsound.',
  },

  // --- Frage 14: as const + satisfies ---
  {
    question: "Was ist der Typ von `route` nach dieser Definition?",
    code: `const ROUTES = {\n  home: "/",\n  users: "/users",\n} as const satisfies Record<string, string>;\n\ntype Route = (typeof ROUTES)[keyof typeof ROUTES];`,
    options: [
      'string',
      '"/" | "/users"',
      'string[]',
      '{ home: string; users: string }',
    ],
    correct: 1,
    explanation:
      '`as const` macht die Werte zu Literal-Typen ("/" und "/users"). ' +
      '`satisfies` validiert gegen Record<string, string>, ohne die Literal-Typen ' +
      'zu verlieren. `(typeof ROUTES)[keyof typeof ROUTES]` extrahiert dann die ' +
      'Union der Werte: "/" | "/users".',
  },

  // --- Frage 15: Best Practice Verstaendnis ---
  {
    question: "Eine Funktion hat einen komplexen Return-Typ (Union aus 5 Typen). " +
              "Was ist die beste Strategie?",
    code: `export function parseInput(input: string) {\n  if (...) return null;\n  if (...) return undefined;\n  if (...) return true;\n  if (...) return Number(input);\n  return input;\n}\n// Return: string | number | boolean | null | undefined`,
    options: [
      'Nichts tun -- Inference ist immer korrekt',
      'as const auf jeden Return-Wert schreiben',
      'Den Return-Typ explizit annotieren, um die Intention klar zu machen',
      'Die Funktion in eine any-Funktion umwandeln',
    ],
    correct: 2,
    explanation:
      'Bei komplexen Funktionen mit vielen Return-Pfaden ist ein expliziter ' +
      'Return-Typ Best Practice. Er dokumentiert die Intention (nicht nur das ' +
      'Ergebnis), gibt bessere Fehlermeldungen, und verhindert, dass eine ' +
      'Aenderung in der Implementierung versehentlich den oeffentlichen Typ aendert. ' +
      'Das ist das "Annotate at boundaries"-Prinzip in Aktion.',
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Zusaetzliche Erklaerungen fuer jede Frage: Warum die richtige Antwort
// richtig ist und welche Fehlkonzeption am haeufigsten vorkommt.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      'Bei `const` bleibt der Literal-Typ erhalten: `"hello"`. ' +
      "TypeScript weiss, dass sich der Wert nie aendern kann, also ist der " +
      "engstmoegliche Typ der exakte Wert selbst.",
    commonMistake:
      "Die meisten antworten `string`. Das waere korrekt bei `let`. " +
      "Bei `const` mit primitiven Werten ist der Literal-Typ praeziser " +
      "und TypeScript nutzt ihn automatisch.",
  },
  1: {
    whyCorrect:
      'Bei `let` findet Widening statt: `"hello"` wird zu `string` erweitert. ' +
      "Da die Variable spaeter einen anderen Wert annehmen koennte, " +
      "waehlt TypeScript den breiteren Typ.",
    commonMistake:
      'Manche denken, der Typ sei `"hello"` wie bei const. ' +
      "Widening bei let ist fundamental: TypeScript muss annehmen, " +
      "dass jeder andere String zugewiesen werden koennte.",
  },
  2: {
    whyCorrect:
      "`msg: string` ist ueberfluessig, weil TypeScript den Typ des Template-Literals " +
      "automatisch als `string` erkennt. Parameter-Annotationen (name: string) sind Pflicht " +
      "und Return-Typ (: void) ist Best Practice bei exportierten Funktionen.",
    commonMistake:
      "Viele denken, ALLE Annotationen seien noetig. Das fuehrt zu 'Annotation-Rauschen': " +
      "Redundante Annotationen machen den Code unleserlich und koennen sogar " +
      "die Inference verschlechtern (z.B. Verlust von Literal-Typen).",
  },
  3: {
    whyCorrect:
      "Obwohl `config` const ist, koennen Properties geaendert werden " +
      "(`config.host = 'other'` waere erlaubt). Deshalb erweitert TypeScript " +
      "den Typ zu `string`, nicht zum Literal `\"localhost\"`.",
    commonMistake:
      "Fast jeder erwartet `\"localhost\"` (Literal-Typ). " +
      "Das const schuetzt nur die Variable (kein `config = ...`), " +
      "nicht die Properties. Loesung: `as const` auf dem Objekt.",
  },
  4: {
    whyCorrect:
      "`as const` macht das Array zu einem readonly Tuple mit Literal-Typen: " +
      '`readonly ["red", "green", "blue"]`. Jedes Element behaelt seinen ' +
      "exakten String-Wert als Typ, und das Array ist unveraenderbar.",
    commonMistake:
      "Manche denken, `as const` mache nur readonly. Die Literal-Typ-Beibehaltung " +
      "und die Tuple-Konvertierung sind der eigentliche Hauptnutzen von `as const`.",
  },
  5: {
    whyCorrect:
      "Contextual Typing: TypeScript kennt den Typ von `nums` (`number[]`) und weiss, " +
      "dass der .map()-Callback ein `number` als Parameter bekommt. " +
      "Die Annotation `(n: number)` waere korrekt aber ueberfluessig.",
    commonMistake:
      "Einige denken, Arrow Functions haben immer implizit `any` als Parametertyp. " +
      "Das stimmt nur ohne Kontext. Bei Array-Methoden liefert der Array-Typ den Kontext.",
  },
  6: {
    whyCorrect:
      "Ein leeres Array ohne Annotation wird als `any[]` infert. " +
      "TypeScript kann nicht wissen, welche Elemente spaeter hinzugefuegt werden. " +
      "Das ist einer der wenigen Faelle, wo Inference zu einem unsicheren Typ fuehrt.",
    commonMistake:
      "Viele erwarten `never[]` (logisch: leeres Array, keine Elemente). " +
      "TypeScript waehlt pragmatisch `any[]`, weil ein `never[]` nutzlos waere — " +
      "man koennte nie etwas hinzufuegen.",
  },
  7: {
    whyCorrect:
      "TypeScript analysiert ALLE return-Pfade und bildet die Union aller moeglichen " +
      "Return-Werte: `toString()` gibt `string`, der zweite Pfad `null`, der dritte " +
      "`undefined`. Ergebnis: `string | null | undefined`.",
    commonMistake:
      "Manche vergessen `undefined` — weil `return undefined` explizit ist, " +
      "wirkt es wie ein Spezialfall. Aber TypeScript behandelt es wie jeden " +
      "anderen Return-Wert und fuegt es zur Union hinzu.",
  },
  8: {
    whyCorrect:
      "`as const` auf dem Return-Wert verhindert Widening. " +
      '`return "active" as const` gibt den Typ `"active"` zurueck, nicht `string`. ' +
      "Alternativ: expliziter Return-Typ `function getStatus(): \"active\"`.",
    commonMistake:
      "Viele versuchen `const` vor der Funktion zu schreiben. " +
      "`const function` ist keine gueltige Syntax — `as const` muss auf dem Wert stehen.",
  },
  9: {
    whyCorrect:
      "Bei Annotation (`: Colors`) wird `a.red` zum vollen Union-Typ `string | number[]`. " +
      "Bei `satisfies` wird `b.red` zum spezifischen Typ `string`. " +
      "satisfies validiert den Typ, behaelt aber die praezise Inference.",
    commonMistake:
      "Viele halten `satisfies` fuer reine Syntax-Variante der Annotation. " +
      "Der Kernunterschied: Annotation UEBERSCHREIBT den Typ, " +
      "satisfies VALIDIERT gegen den Typ und behaelt den inferierten Typ.",
  },
  10: {
    whyCorrect:
      "Control Flow Analysis: Nach `if (value === null) return` ist null ausgeschlossen. " +
      "In `if (typeof value === \"string\")` wird weiter zu `string` verengt. " +
      "TypeScript verfolgt jeden Kontrollfluss-Schritt praezise.",
    commonMistake:
      "Manche denken, TypeScript 'vergisst' fruehere Pruefungen. " +
      "Control Flow Analysis verfolgt ALLE Branches korrekt — " +
      "auch ueber mehrere if-Statements und return-Statements hinweg.",
  },
  11: {
    whyCorrect:
      "Contextual Typing funktioniert nur bei DIREKTER Uebergabe als Argument. " +
      "Wenn `handler` vorher definiert wird, hat TypeScript an der " +
      "Definitionsstelle keinen Kontext — die Verbindung entsteht zu spaet.",
    commonMistake:
      "Intuition: 'TypeScript verfolgt den Datenfluss.' " +
      "Fuer Werte stimmt das (Control Flow), aber fuer Contextual Typing " +
      "muss der Kontext an der DEFINITIONSSTELLE vorhanden sein.",
  },
  12: {
    whyCorrect:
      "TypeScript ist absichtlich konservativ: Ein Objekt vom Typ " +
      "`{ a: number; b: number }` koennte zur Laufzeit zusaetzliche Properties " +
      "haben (Vererbung, dynamische Zuweisung). `(\"a\" | \"b\")[]` waere technisch unsound.",
    commonMistake:
      "Viele halten es fuer einen Bug. Es ist eine bewusste Design-Entscheidung " +
      "fuer Type Safety — TypeScript bevorzugt konservative, korrekte Typen " +
      "ueber praktische, aber potenziell falsche.",
  },
  13: {
    whyCorrect:
      "`as const` macht die Werte zu Literal-Typen. `satisfies` validiert die Struktur, " +
      "ohne die Literal-Typen zu verlieren. `(typeof ROUTES)[keyof typeof ROUTES]` " +
      'extrahiert dann die Union der Werte: `"/" | "/users"`.',
    commonMistake:
      "Viele kennen entweder `as const` oder `satisfies`, aber nicht die Kombination. " +
      "`as const satisfies X` ist das maechtigste Pattern: " +
      "Literal-Typen + Validierung + Readonly — alles in einem.",
  },
  14: {
    whyCorrect:
      "Bei komplexen Funktionen mit vielen Return-Pfaden dokumentiert ein expliziter " +
      "Return-Typ die Intention. Er gibt bessere Fehlermeldungen (der Fehler ist IN " +
      "der Funktion, nicht beim Aufrufer) und verhindert versehentliche Aenderungen.",
    commonMistake:
      "Zwei Extrempositionen: 'Immer annotieren' (zu viel Rauschen) oder " +
      "'Nie annotieren' (API-Instabilitaet). Die goldene Mitte: " +
      "Annotiere an Grenzen (exports), vertraue Inference intern.",
  },
};
