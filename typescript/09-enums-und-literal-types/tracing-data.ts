/**
 * Lektion 09 — Tracing-Exercises: Enums & Literal Types
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  {
    id: "09-enum-runtime",
    title: "Was generiert ein numerisches Enum?",
    description: "Verfolge was TypeScript aus einem numerischen Enum macht.",
    code: [
      "enum Color { Red, Green, Blue }",
      "",
      "console.log(Color.Red);",
      "console.log(Color[0]);",
      "console.log(Object.keys(Color));",
      "console.log(Object.keys(Color).length);",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Welche Werte haben Red, Green, Blue?",
        expectedAnswer: "Red = 0, Green = 1, Blue = 2 (Auto-Increment ab 0)",
        variables: { "Color.Red": "0", "Color.Green": "1", "Color.Blue": "2" },
        explanation: "Ohne explizite Werte startet Auto-Increment bei 0.",
      },
      {
        lineIndex: 2,
        question: "Was gibt Color.Red aus?",
        expectedAnswer: "0",
        variables: {},
        explanation: "Color.Red ist der numerische Wert 0.",
      },
      {
        lineIndex: 3,
        question: "Was gibt Color[0] aus?",
        expectedAnswer: "'Red' — Reverse Mapping",
        variables: {},
        explanation: "Numerische Enums haben Reverse Mapping: Color[0] gibt den Namen 'Red'.",
      },
      {
        lineIndex: 5,
        question: "Wie viele Keys hat Object.keys(Color)?",
        expectedAnswer: "6 — drei Namen + drei Zahlen (Reverse Mapping)",
        variables: { "keys": "['0', '1', '2', 'Red', 'Green', 'Blue']" },
        explanation: "Doppelte Eintraege: Name→Wert UND Wert→Name = 6 Keys.",
      },
    ],
    concept: "numeric-enum-runtime",
    difficulty: 2,
  },

  {
    id: "09-as-const-effects",
    title: "Die drei Effekte von as const",
    description: "Verfolge wie as const Arrays und Objekte veraendert.",
    code: [
      "const arr = ['GET', 'POST'] as const;",
      "const obj = { method: 'GET', url: '/api' } as const;",
      "",
      "// arr.push('PUT');",
      "// obj.method = 'POST';",
      "",
      "type Methods = typeof arr[number];",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "Welchen Typ hat arr?",
        expectedAnswer: "readonly ['GET', 'POST'] — Tuple mit Literal Types",
        variables: { "arr": "(Typ: readonly ['GET', 'POST'])" },
        explanation: "as const: (1) readonly, (2) Literal Types, (3) Tuple statt Array.",
      },
      {
        lineIndex: 1,
        question: "Welchen Typ hat obj.method?",
        expectedAnswer: "'GET' (Literal Type, nicht string)",
        variables: { "obj.method": "(Typ: 'GET')" },
        explanation: "as const behaelt den Literal-Typ 'GET' statt zu string zu widenen.",
      },
      {
        lineIndex: 3,
        question: "Was passiert bei arr.push('PUT')?",
        expectedAnswer: "Compile-Error: readonly verhindert Mutationen",
        variables: {},
        explanation: "as const macht das Array readonly — push, pop, etc. sind verboten.",
      },
      {
        lineIndex: 6,
        question: "Was ist der Typ Methods?",
        expectedAnswer: "'GET' | 'POST'",
        variables: { "Methods": "'GET' | 'POST'" },
        explanation: "typeof arr[number] greift auf alle Elemente zu und erzeugt den Union.",
      },
    ],
    concept: "as-const-triple-effect",
    difficulty: 2,
  },

  {
    id: "09-template-literal-expansion",
    title: "Template Literal Types — kartesisches Produkt",
    description: "Verfolge wie Template Literal Types alle Kombinationen erzeugen.",
    code: [
      "type Size = 'sm' | 'md' | 'lg';",
      "type Color = 'red' | 'blue';",
      "",
      "type Token = `${Size}-${Color}`;",
      "type PrefixedSize = `size-${Size}`;",
      "type Capitalized = Capitalize<Color>;",
    ],
    steps: [
      {
        lineIndex: 3,
        question: "Wie viele Mitglieder hat Token? Welche?",
        expectedAnswer: "6 (3 x 2): 'sm-red' | 'sm-blue' | 'md-red' | 'md-blue' | 'lg-red' | 'lg-blue'",
        variables: { "Token": "6 Mitglieder (3 x 2)" },
        explanation: "Kartesisches Produkt: Jede Size mit jeder Color kombiniert.",
      },
      {
        lineIndex: 4,
        question: "Wie viele Mitglieder hat PrefixedSize?",
        expectedAnswer: "3: 'size-sm' | 'size-md' | 'size-lg'",
        variables: { "PrefixedSize": "3 Mitglieder" },
        explanation: "Ein fester Praefix mit einem Union: 1 x 3 = 3 Kombinationen.",
      },
      {
        lineIndex: 5,
        question: "Was ist Capitalized?",
        expectedAnswer: "'Red' | 'Blue'",
        variables: { "Capitalized": "'Red' | 'Blue'" },
        explanation: "Capitalize macht den ersten Buchstaben gross. Distributiv auf jeden Union-Member.",
      },
    ],
    concept: "template-literal-cartesian",
    difficulty: 3,
  },

  {
    id: "09-branded-type-flow",
    title: "Branded Type — Fluss der Typsicherheit",
    description: "Verfolge wie ein Branded Type durch den Code fliesst.",
    code: [
      "type EUR = number & { __brand: 'EUR' };",
      "",
      "function eur(amount: number): EUR { return amount as EUR; }",
      "",
      "const price = eur(9.99);",
      "const tax = eur(1.90);",
      "const total = (price as number) + (tax as number);",
      "const typedTotal = eur(total);",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "Welchen Typ hat price?",
        expectedAnswer: "EUR (number & { __brand: 'EUR' })",
        variables: { "price": "9.99 (Typ: EUR)" },
        explanation: "Die eur()-Funktion castet die Zahl zum Branded Type.",
      },
      {
        lineIndex: 6,
        question: "Warum braucht man 'as number' bei der Addition?",
        expectedAnswer: "EUR + EUR funktioniert nicht direkt — man muss zum number casten",
        variables: { "total": "11.89 (Typ: number — nicht EUR!)" },
        explanation: "Arithmetik funktioniert nur mit number. Das Ergebnis verliert den Brand.",
      },
      {
        lineIndex: 7,
        question: "Welchen Typ hat typedTotal?",
        expectedAnswer: "EUR — durch erneuten Aufruf von eur() rebranded",
        variables: { "typedTotal": "11.89 (Typ: EUR)" },
        explanation: "Um den Brand wiederherzustellen, muss man die Konstruktor-Funktion erneut aufrufen.",
      },
    ],
    concept: "branded-type-flow",
    difficulty: 4,
  },
];
