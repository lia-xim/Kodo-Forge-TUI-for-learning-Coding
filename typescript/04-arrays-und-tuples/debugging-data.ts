/**
 * Lektion 04 — Debugging Challenges: Arrays & Tuples
 *
 * 5 Challenges zu filter ohne Predicate, Kovarianz-Bug, Spread verliert Tuple,
 * Array-out-of-bounds, readonly-Mutation.
 * Fokus: Array-Typsystem-Luecken und Tuple-Eigenheiten.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: filter mit komplexer Bedingung ohne Type Predicate ────
  {
    id: "L04-D1",
    title: "filter() mit komplexer Bedingung verengt nicht",
    buggyCode: [
      "const values: (string | null)[] = ['hello', null, '', 'world', null];",
      "",
      "const strings = values.filter(v => v !== null && v.length > 0);",
      "",
      "// Erwartet: string[], tatsaechlich: (string | null)[]",
      "strings.forEach(s => {",
      "  console.log(s.toUpperCase());",
      "});",
    ].join("\n"),
    errorMessage:
      "Property 'toUpperCase' does not exist on type 'string | null'.",
    bugType: "type-error",
    bugLine: 3,
    options: [
      "filter() mit komplexer Bedingung verengt den Typ nicht — es braucht ein explizites Type Predicate",
      "typeof kann nicht in Arrow-Functions verwendet werden",
      "forEach funktioniert nicht auf gefilterten Arrays",
      "Der Callback muss 'true' oder 'false' zurueckgeben, nicht einen Boolean-Ausdruck",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat 'strings' nach dem filter?",
      "Ab TS 5.5 inferiert filter() Type Predicates bei EINFACHEN Checks (z.B. v !== null). " +
        "Aber bei KOMPLEXEN Bedingungen (v !== null && v.length > 0) greift das nicht.",
      "Loesung: .filter((v): v is string => v !== null && v.length > 0)",
    ],
    fixedCode: [
      "const values: (string | null)[] = ['hello', null, '', 'world', null];",
      "",
      "const strings = values.filter((v): v is string => v !== null && v.length > 0);",
      "",
      "// Jetzt ist strings: string[]",
      "strings.forEach(s => {",
      "  console.log(s.toUpperCase());",
      "});",
    ].join("\n"),
    explanation:
      "Ab TypeScript 5.5 kann filter() bei einfachen Checks (z.B. `v !== null`) " +
      "automatisch Type Predicates inferieren. ABER bei komplexeren Bedingungen " +
      "wie `v !== null && v.length > 0` greift die automatische Inferenz nicht. " +
      "Man braucht weiterhin ein explizites Type Predicate ((v): v is string => ...) " +
      "um den Typ zu verengen.",
    concept: "type-predicate-filter",
    difficulty: 3,
  },

  // ─── Challenge 2: Array-Kovarianz-Bug ───────────────────────────────────
  {
    id: "L04-D2",
    title: "Array-Kovarianz erlaubt unsichere Zuweisung",
    buggyCode: [
      "const strings: string[] = ['hello', 'world'];",
      "const values: (string | number)[] = strings;",
      "",
      "values.push(42);",
      "",
      "// strings enthaelt jetzt [\"hello\", \"world\", 42]",
      "console.log(strings[2].toUpperCase());",
    ].join("\n"),
    errorMessage: "TypeError: strings[2].toUpperCase is not a function",
    bugType: "soundness-hole",
    bugLine: 2,
    options: [
      "string[] ist zu (string | number)[] zuweisbar — das ist ein Soundness Hole",
      "push() funktioniert nicht auf zugewiesenen Arrays",
      "strings[2] existiert nicht und gibt null zurueck",
      "toUpperCase ist keine gueltige String-Methode",
    ],
    correctOption: 0,
    hints: [
      "Beide Variablen zeigen auf dasselbe Array im Speicher — es wird nicht kopiert.",
      "TypeScript erlaubt die Zuweisung string[] -> (string | number)[] " +
        "(Kovarianz), obwohl das unsicher ist.",
      "Ueber 'values' kann man eine Zahl pushen, die dann auch in 'strings' landet.",
    ],
    fixedCode: [
      "const strings: readonly string[] = ['hello', 'world'];",
      "const values: readonly (string | number)[] = strings;",
      "",
      "// values.push(42); // Fehler: Property 'push' does not exist on readonly",
      "",
      "// Wenn Mutation noetig: Kopie erstellen",
      "const mutableValues: (string | number)[] = [...strings];",
      "mutableValues.push(42); // Sicher: eigenes Array",
    ].join("\n"),
    explanation:
      "TypeScript behandelt Arrays kovariant: string[] ist zu (string | number)[] " +
      "zuweisbar. Da beide Variablen auf dasselbe Array zeigen, kann man ueber " +
      "'values' eine Zahl einfuegen, die dann auch in 'strings' sichtbar ist. " +
      "Das ist ein bekanntes Soundness Hole in TypeScript. Loesung: readonly " +
      "Arrays verwenden oder explizit kopieren mit Spread.",
    concept: "array-covariance",
    difficulty: 4,
  },

  // ─── Challenge 3: Spread verliert Tuple-Typ ─────────────────────────────
  {
    id: "L04-D3",
    title: "Spread-Operator verliert Tuple-Laenge",
    buggyCode: [
      "function getPoint(): [number, number] {",
      "  return [10, 20];",
      "}",
      "",
      "const coords = [...getPoint()];",
      "",
      "// Erwartet: [number, number]",
      "// Tatsaechlich: number[]",
      "const [x, y] = coords;",
      "const z = coords[2]; // Kein Fehler, obwohl out-of-bounds",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 5,
    options: [
      "Spread auf einem Tuple erzeugt number[] statt [number, number]",
      "getPoint() gibt kein Array zurueck",
      "Destructuring funktioniert nicht mit Spread-Ergebnissen",
      "coords[2] wirft einen Laufzeitfehler",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat [...tuple]? Pruefe mit Hover in der IDE.",
      "Der Spread-Operator auf einem Tuple erzeugt ein normales Array, " +
        "die Tuple-Laengen-Information geht verloren.",
      "Loesung: Direkt zuweisen ohne Spread, oder 'as const' verwenden.",
    ],
    fixedCode: [
      "function getPoint(): [number, number] {",
      "  return [10, 20];",
      "}",
      "",
      "const coords: [number, number] = getPoint();",
      "",
      "const [x, y] = coords;",
      "// coords[2] wuerde jetzt einen Fehler erzeugen:",
      "// Tuple type '[number, number]' of length '2' has no element at index '2'.",
    ].join("\n"),
    explanation:
      "Der Spread-Operator [...tuple] erzeugt ein neues Array mit dem Typ " +
      "number[] — die Tuple-Laengen-Information geht verloren. Das bedeutet, " +
      "dass TypeScript keinen Fehler bei coords[2] meldet, obwohl das Element " +
      "nicht existiert. Loesung: Das Tuple direkt zuweisen (const coords = getPoint()) " +
      "oder eine explizite Tuple-Annotation verwenden.",
    concept: "tuple-spread",
    difficulty: 3,
  },

  // ─── Challenge 4: Array out-of-bounds ───────────────────────────────────
  {
    id: "L04-D4",
    title: "Array-Zugriff ausserhalb der Grenzen",
    buggyCode: [
      "const colors = ['red', 'green', 'blue'];",
      "",
      "function getColor(index: number): string {",
      "  return colors[index];",
      "}",
      "",
      "const color = getColor(5);",
      "console.log(color.toUpperCase()); // Laufzeitfehler!",
    ].join("\n"),
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
    bugType: "soundness-hole",
    bugLine: 4,
    options: [
      "Array-Zugriff mit Index gibt immer den Element-Typ zurueck, auch bei ungueltigem Index",
      "getColor braucht eine Pruefung ob index < colors.length ist",
      "colors muss mit 'as const' deklariert werden",
      "Der Index muss ein String sein, keine Zahl",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat colors[5] laut TypeScript?",
      "TypeScript sagt 'string', aber zur Laufzeit ist es undefined. " +
        "Das ist ein bekanntes Soundness Hole.",
      "Loesung: noUncheckedIndexedAccess in tsconfig aktivieren — dann wird " +
        "der Typ zu 'string | undefined'.",
    ],
    fixedCode: [
      "// tsconfig: { \"compilerOptions\": { \"noUncheckedIndexedAccess\": true } }",
      "",
      "const colors = ['red', 'green', 'blue'];",
      "",
      "function getColor(index: number): string | undefined {",
      "  return colors[index];",
      "}",
      "",
      "const color = getColor(5);",
      "if (color !== undefined) {",
      "  console.log(color.toUpperCase());",
      "}",
    ].join("\n"),
    explanation:
      "Standardmaessig gibt TypeScript bei Array-Zugriff den Element-Typ zurueck " +
      "(hier: string), ohne undefined zu beruecksichtigen — auch wenn der Index " +
      "ausserhalb der Grenzen liegt. Das ist ein Soundness Hole, das mit der " +
      "tsconfig-Option 'noUncheckedIndexedAccess: true' behoben werden kann. " +
      "Dann wird jeder Index-Zugriff zu T | undefined und erfordert eine Pruefung.",
    concept: "unchecked-index-access",
    difficulty: 3,
  },

  // ─── Challenge 5: readonly ist shallow ──────────────────────────────────
  {
    id: "L04-D5",
    title: "readonly Array mit mutierbaren Elementen",
    buggyCode: [
      "const users: readonly { name: string; age: number }[] = [",
      "  { name: 'Alice', age: 30 },",
      "  { name: 'Bob', age: 25 },",
      "];",
      "",
      "// users.push({...}); // Korrekt: Fehler",
      "users[0].age = 99; // Erwartet: Fehler, tatsaechlich: OK!",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 7,
    options: [
      "readonly schuetzt nur das Array (kein push/pop), nicht die Objekte darin",
      "readonly verhindert alle Aenderungen an Elementen",
      "users[0] gibt eine Kopie zurueck",
      "age ist ein primitiver Wert und daher immer aenderbar",
    ],
    correctOption: 0,
    hints: [
      "Was genau schuetzt 'readonly' bei einem Array?",
      "'readonly T[]' verhindert nur Operationen auf dem Array selbst " +
        "(push, pop, splice, Zuweisung). Die Elemente im Array sind weiterhin mutable.",
      "Fuer tiefes readonly braucht man: Readonly<{ name: string; age: number }>[] " +
        "oder einen rekursiven DeepReadonly-Typ.",
    ],
    fixedCode: [
      "type User = Readonly<{ name: string; age: number }>;",
      "",
      "const users: readonly User[] = [",
      "  { name: 'Alice', age: 30 },",
      "  { name: 'Bob', age: 25 },",
      "];",
      "",
      "// users.push({...}); // Fehler: readonly array",
      "// users[0].age = 99; // Fehler: readonly property",
    ].join("\n"),
    explanation:
      "'readonly T[]' (oder ReadonlyArray<T>) schuetzt nur die Array-Struktur: " +
      "kein push, pop, splice oder Index-Zuweisung. Die Objekte innerhalb des " +
      "Arrays bleiben mutable. Um auch die Elemente zu schuetzen, muss der " +
      "Element-Typ selbst readonly sein: Readonly<T> fuer flache Objekte, " +
      "oder ein rekursiver DeepReadonly-Typ fuer verschachtelte Strukturen.",
    concept: "readonly-shallow",
    difficulty: 3,
  },
];
