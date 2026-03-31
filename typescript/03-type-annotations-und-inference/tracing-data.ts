/**
 * Lektion 03 — Tracing-Exercises: Type Annotations & Inference
 *
 * Themen:
 *  - Widening: let vs const bei Literal-Typen
 *  - Contextual Typing: Woher kennt TS den Typ?
 *  - as const: Readonly Literal-Typen erzwingen
 *  - Return Type Inference
 *
 * Schwierigkeit steigend: 1 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // --- Exercise 1: Widening — let vs const ---------------------------------
  {
    id: "03-widening-let-vs-const",
    title: "Widening — let vs const bei Literal-Typen",
    description:
      "Verfolge wie TypeScript bei let und const unterschiedliche Typen " +
      "inferiert und warum das fuer die Typsicherheit wichtig ist.",
    code: [
      "const greeting = 'hello';",
      "let farewell = 'bye';",
      "const count = 42;",
      "let amount = 42;",
      "",
      "farewell = 'see you';",
      "// farewell = 123;",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Welchen TypeScript-Typ hat 'greeting' (const mit String-Literal)?",
        expectedAnswer: "\"hello\"",
        variables: { "greeting": "\"hello\" (Literal-Typ)" },
        explanation:
          "Bei const inferiert TypeScript den engstmoeglichen Typ: " +
          "den Literal-Typ \"hello\". Da const nie neu zugewiesen werden " +
          "kann, ist der Wert immer genau \"hello\".",
      },
      {
        lineIndex: 1,
        question:
          "Welchen TypeScript-Typ hat 'farewell' (let mit String-Literal)?",
        expectedAnswer: "string",
        variables: { "greeting": "\"hello\" (Literal-Typ)", "farewell": "\"bye\" (Typ: string)" },
        explanation:
          "Bei let 'widened' TypeScript den Typ zum allgemeinen Typ: " +
          "string statt \"bye\". Der Grund: let-Variablen koennen " +
          "spaeter einen anderen String-Wert erhalten.",
      },
      {
        lineIndex: 2,
        question:
          "Welchen TypeScript-Typ hat 'count' (const mit Zahl)?",
        expectedAnswer: "42",
        variables: {
          "greeting": "\"hello\" (Literal-Typ)",
          "farewell": "\"bye\" (Typ: string)",
          "count": "42 (Literal-Typ)",
        },
        explanation:
          "Dasselbe Prinzip wie bei Strings: const inferiert den " +
          "Literal-Typ 42. TypeScript weiss, dass count immer " +
          "exakt 42 sein wird.",
      },
      {
        lineIndex: 3,
        question:
          "Welchen TypeScript-Typ hat 'amount' (let mit Zahl)?",
        expectedAnswer: "number",
        variables: {
          "greeting": "\"hello\" (Literal-Typ)",
          "farewell": "\"bye\" (Typ: string)",
          "count": "42 (Literal-Typ)",
          "amount": "42 (Typ: number)",
        },
        explanation:
          "let widened 42 zum allgemeinen Typ number. Muster: " +
          "const -> Literal-Typ (eng), let -> allgemeiner Typ (weit). " +
          "Das nennt man 'Literal Widening'.",
      },
      {
        lineIndex: 5,
        question:
          "Ist die Zuweisung farewell = 'see you' erlaubt? Warum?",
        expectedAnswer: "Ja, weil farewell den Typ string hat",
        variables: { "farewell": "\"see you\" (Typ: string)" },
        explanation:
          "Da farewell als let deklariert ist, hat es den Typ string. " +
          "Jeder String-Wert kann zugewiesen werden. Waere farewell " +
          "const, gaebe es einen Compile-Fehler.",
      },
    ],
    concept: "literal-widening",
    difficulty: 1,
  },

  // --- Exercise 2: Contextual Typing ----------------------------------------
  {
    id: "03-contextual-typing",
    title: "Contextual Typing — Typ aus dem Kontext",
    description:
      "Verfolge wie TypeScript den Typ von Callback-Parametern " +
      "automatisch aus dem Kontext ableitet.",
    code: [
      "const names: string[] = ['Anna', 'Ben', 'Clara'];",
      "",
      "const lengths = names.map((name) => {",
      "  return name.length;",
      "});",
      "",
      "const upper = names.map((name) => name.toUpperCase());",
      "",
      "const handler: (event: MouseEvent) => void =",
      "  (e) => console.log(e.clientX);",
    ],
    steps: [
      {
        lineIndex: 2,
        question:
          "Welchen Typ hat der Parameter 'name' im map-Callback? " +
          "Es gibt keine Annotation — woher weiss TypeScript den Typ?",
        expectedAnswer: "string",
        variables: { "names": "string[]", "name": "string" },
        explanation:
          "TypeScript kennt den Typ von names (string[]). Die " +
          "Methode map() erwartet ein Callback mit dem Element-Typ " +
          "als Parameter. Daher wird name automatisch als string " +
          "inferiert. Das nennt man 'Contextual Typing'.",
      },
      {
        lineIndex: 3,
        question:
          "Welchen Typ hat 'lengths' nach dem map? " +
          "Was ist der Return-Typ des Callbacks?",
        expectedAnswer: "number[]",
        variables: { "lengths": "number[]" },
        explanation:
          "name.length gibt number zurueck. map() sammelt die " +
          "Return-Werte in ein neues Array. TypeScript inferiert: " +
          "string[].map(() => number) = number[].",
      },
      {
        lineIndex: 6,
        question:
          "Welchen Typ hat 'upper'?",
        expectedAnswer: "string[]",
        variables: { "lengths": "number[]", "upper": "string[]" },
        explanation:
          "name.toUpperCase() gibt string zurueck. Daher ist der " +
          "Typ von upper: string[]. Der Contextual Typing Mechanismus " +
          "funktioniert auch bei Pfeilfunktionen mit implizitem Return.",
      },
      {
        lineIndex: 9,
        question:
          "Welchen Typ hat 'e' im handler-Callback? " +
          "Warum muss man ihn nicht annotieren?",
        expectedAnswer: "MouseEvent",
        variables: { "e": "MouseEvent" },
        explanation:
          "Die Variable handler hat eine explizite Typ-Annotation: " +
          "(event: MouseEvent) => void. TypeScript leitet daraus ab, " +
          "dass der Parameter e vom Typ MouseEvent sein muss. " +
          "e.clientX ist daher ein gueltiger Zugriff.",
      },
    ],
    concept: "contextual-typing",
    difficulty: 2,
  },

  // --- Exercise 3: as const — Readonly Literal-Typen -----------------------
  {
    id: "03-as-const-effect",
    title: "as const — Alles wird readonly und literal",
    description:
      "Verfolge den Unterschied zwischen normalen Deklarationen " +
      "und 'as const' bei Objekten und Arrays.",
    code: [
      "const config = {",
      "  host: 'localhost',",
      "  port: 3000,",
      "};",
      "",
      "const frozenConfig = {",
      "  host: 'localhost',",
      "  port: 3000,",
      "} as const;",
      "",
      "const colors = ['red', 'green', 'blue'];",
      "const fixedColors = ['red', 'green', 'blue'] as const;",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Welchen Typ hat 'config.host'? " +
          "(Objekt OHNE as const)",
        expectedAnswer: "string",
        variables: { "config.host": "string", "config.port": "number" },
        explanation:
          "Ohne 'as const' widened TypeScript die Property-Typen: " +
          "host wird string (nicht \"localhost\"), port wird number " +
          "(nicht 3000). Die Properties sind auch nicht readonly.",
      },
      {
        lineIndex: 5,
        question:
          "Welchen Typ hat 'frozenConfig.host'? " +
          "(Objekt MIT as const)",
        expectedAnswer: "\"localhost\"",
        variables: { "frozenConfig.host": "\"localhost\"", "frozenConfig.port": "3000" },
        explanation:
          "'as const' bewirkt drei Dinge: (1) Alle Properties werden " +
          "readonly, (2) String-Werte behalten ihren Literal-Typ, " +
          "(3) Zahlen behalten ihren Literal-Typ. " +
          "host ist also readonly \"localhost\", nicht string.",
      },
      {
        lineIndex: 10,
        question:
          "Welchen Typ hat 'colors'? " +
          "(Array OHNE as const)",
        expectedAnswer: "string[]",
        variables: { "colors": "string[]" },
        explanation:
          "Ohne as const inferiert TypeScript ein normales string[]. " +
          "Die Elemente koennten jeder beliebige String sein, und " +
          "das Array ist veraenderbar (push, pop, etc.).",
      },
      {
        lineIndex: 11,
        question:
          "Welchen Typ hat 'fixedColors'? " +
          "(Array MIT as const)",
        expectedAnswer: "readonly [\"red\", \"green\", \"blue\"]",
        variables: { "fixedColors": "readonly [\"red\", \"green\", \"blue\"]" },
        explanation:
          "Mit 'as const' wird das Array zu einem readonly Tuple " +
          "mit Literal-Typen. TypeScript kennt jetzt exakt die " +
          "Laenge (3), die Position und den Wert jedes Elements. " +
          "push() und andere mutierende Methoden sind verboten.",
      },
    ],
    concept: "as-const",
    difficulty: 3,
  },

  // --- Exercise 4: Return Type Inference ------------------------------------
  {
    id: "03-return-type-inference",
    title: "Return Type Inference — Was gibt die Funktion zurueck?",
    description:
      "Verfolge wie TypeScript den Rueckgabetyp von Funktionen " +
      "aus den return-Anweisungen ableitet.",
    code: [
      "function getStatus(code: number) {",
      "  if (code === 200) {",
      "    return 'ok';",
      "  }",
      "  if (code === 404) {",
      "    return 'not found';",
      "  }",
      "  return null;",
      "}",
      "",
      "const result = getStatus(200);",
    ],
    steps: [
      {
        lineIndex: 2,
        question:
          "Welchen Literal-Typ hat der Return-Wert in Zeile 3?",
        expectedAnswer: "\"ok\"",
        variables: { "return": "\"ok\"" },
        explanation:
          "Der Return-Wert 'ok' ist ein String-Literal. Da es in " +
          "einem return-Statement steht, merkt sich TypeScript " +
          "diesen Typ fuer die Return-Typ-Berechnung.",
      },
      {
        lineIndex: 5,
        question:
          "Welchen Literal-Typ hat der Return-Wert in Zeile 6?",
        expectedAnswer: "\"not found\"",
        variables: { "return": "\"not found\"" },
        explanation:
          "Auch hier merkt sich TypeScript den Literal-Typ " +
          "\"not found\". Beide Return-Pfade werden gesammelt.",
      },
      {
        lineIndex: 7,
        question:
          "Welchen Typ hat der Return-Wert in Zeile 8?",
        expectedAnswer: "null",
        variables: { "return": "null" },
        explanation:
          "Der dritte Return-Pfad gibt null zurueck. TypeScript " +
          "sammelt alle moeglichen Return-Typen.",
      },
      {
        lineIndex: 10,
        question:
          "Welchen Typ hat 'result'? Wie berechnet TypeScript " +
          "den Return-Typ der gesamten Funktion?",
        expectedAnswer: "\"ok\" | \"not found\" | null",
        variables: { "result": "\"ok\" | \"not found\" | null" },
        explanation:
          "TypeScript bildet einen Union aus allen return-Pfaden: " +
          "\"ok\" | \"not found\" | null. Ohne explizite Annotation " +
          "inferiert TS den Return-Typ automatisch durch Analyse " +
          "aller return-Anweisungen.",
      },
    ],
    concept: "return-type-inference",
    difficulty: 4,
  },
];
