/**
 * Lektion 04 — Tracing-Exercises: Arrays & Tuples
 *
 * Themen:
 *  - filter/map/find Return-Typen und wie TS sie inferiert
 *  - Tuple-Destructuring und positionsbasierte Typen
 *  - as const auf Arrays: Tuple-Literale und readonly
 *  - Array-Methoden mit Union-Typen
 *
 * Schwierigkeit steigend: 1 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // --- Exercise 1: filter/map/find Return-Typen ----------------------------
  {
    id: "04-array-method-types",
    title: "Array-Methoden — Welche Typen kommen zurueck?",
    description:
      "Verfolge die Return-Typen von map, filter und find und " +
      "warum find 'undefined' enthalten kann.",
    code: [
      "const nums: number[] = [1, 2, 3, 4, 5];",
      "",
      "const doubled = nums.map((n) => n * 2);",
      "const evens = nums.filter((n) => n % 2 === 0);",
      "const found = nums.find((n) => n > 3);",
      "",
      "const strings = nums.map((n) => String(n));",
      "const bools = nums.map((n) => n > 3);",
    ],
    steps: [
      {
        lineIndex: 2,
        question:
          "Welchen Typ hat 'doubled' (nums.map mit n * 2)?",
        expectedAnswer: "number[]",
        variables: { "nums": "number[]", "doubled": "number[]" },
        explanation:
          "map() gibt ein neues Array zurueck mit dem Typ des " +
          "Callback-Return-Werts. n * 2 gibt number zurueck, " +
          "also ist doubled: number[]. map aendert nie die Laenge.",
      },
      {
        lineIndex: 3,
        question:
          "Welchen Typ hat 'evens' (nums.filter mit Bedingung)?",
        expectedAnswer: "number[]",
        variables: { "doubled": "number[]", "evens": "number[]" },
        explanation:
          "filter() gibt ein Array desselben Typs zurueck: number[]. " +
          "Der Laufzeit-Wert ist [2, 4], aber der TypeScript-Typ " +
          "bleibt number[] — TS weiss nicht welche Elemente uebrig " +
          "bleiben. Die Laenge ist unbekannt.",
      },
      {
        lineIndex: 4,
        question:
          "Welchen Typ hat 'found' (nums.find)? " +
          "Warum unterscheidet es sich von filter?",
        expectedAnswer: "number | undefined",
        variables: { "doubled": "number[]", "evens": "number[]", "found": "number | undefined" },
        explanation:
          "find() gibt ein einzelnes Element zurueck, NICHT ein Array. " +
          "Da find() moeglicherweise nichts findet, ist der Typ " +
          "number | undefined. Das undefined muss behandelt werden " +
          "bevor man mit found rechnen kann.",
      },
      {
        lineIndex: 6,
        question:
          "Welchen Typ hat 'strings' (map mit String())?",
        expectedAnswer: "string[]",
        variables: { "strings": "string[]" },
        explanation:
          "String(n) gibt string zurueck. map() sammelt die Ergebnisse " +
          "zu string[]. Die Transformation number[] -> string[] " +
          "zeigt die Staerke von map mit Type Inference.",
      },
      {
        lineIndex: 7,
        question:
          "Welchen Typ hat 'bools' (map mit n > 3)?",
        expectedAnswer: "boolean[]",
        variables: { "strings": "string[]", "bools": "boolean[]" },
        explanation:
          "Der Vergleich n > 3 gibt boolean zurueck. " +
          "Daher ist bools: boolean[]. Der Laufzeit-Wert ist " +
          "[false, false, false, true, true]. map inferiert " +
          "den Typ immer aus dem Callback-Return.",
      },
    ],
    concept: "array-methods",
    difficulty: 1,
  },

  // --- Exercise 2: Tuple-Destructuring --------------------------------------
  {
    id: "04-tuple-destructuring",
    title: "Tuple-Destructuring — Positionsbasierte Typen",
    description:
      "Verfolge wie TypeScript bei Tuple-Destructuring jedem Element " +
      "den richtigen Typ zuweist.",
    code: [
      "const pair: [string, number] = ['Alice', 30];",
      "const [name, age] = pair;",
      "",
      "const triple: [boolean, string, number] = [true, 'ok', 200];",
      "const [success, message, code] = triple;",
      "",
      "const [first, ...rest] = [10, 20, 30, 40];",
      "",
      "function useState(init: string): [string, (v: string) => void] {",
      "  let val = init;",
      "  return [val, (v) => { val = v; }];",
      "}",
      "const [state, setState] = useState('hello');",
    ],
    steps: [
      {
        lineIndex: 1,
        question:
          "Welche Typen haben 'name' und 'age' nach dem Destructuring " +
          "des Tuples [string, number]?",
        expectedAnswer: "name: string, age: number",
        variables: { "name": "string (\"Alice\")", "age": "number (30)" },
        explanation:
          "Bei Tuple-Destructuring weist TypeScript jedem Element " +
          "den Typ seiner Position zu. Position 0 ist string, " +
          "Position 1 ist number. Das ist der Vorteil von Tuples " +
          "gegenueber normalen Arrays.",
      },
      {
        lineIndex: 4,
        question:
          "Welche Typen haben success, message und code?",
        expectedAnswer: "success: boolean, message: string, code: number",
        variables: {
          "success": "boolean (true)",
          "message": "string (\"ok\")",
          "code": "number (200)",
        },
        explanation:
          "Jede Position im Tuple hat ihren eigenen Typ. " +
          "Ein Tuple [boolean, string, number] gibt bei " +
          "Destructuring genau diese Typen in der richtigen " +
          "Reihenfolge zurueck.",
      },
      {
        lineIndex: 6,
        question:
          "Welche Typen haben 'first' und 'rest' beim Rest-Destructuring " +
          "von [10, 20, 30, 40]?",
        expectedAnswer: "first: number, rest: number[]",
        variables: { "first": "number (10)", "rest": "number[] ([20, 30, 40])" },
        explanation:
          "Das Array [10, 20, 30, 40] wird als number[] inferiert " +
          "(nicht als Tuple, da kein 'as const'). Beim Rest-Destructuring " +
          "ist first: number und ...rest sammelt den Rest als number[].",
      },
      {
        lineIndex: 12,
        question:
          "Welche Typen haben 'state' und 'setState' nach dem " +
          "Destructuring des useState-Returns?",
        expectedAnswer: "state: string, setState: (v: string) => void",
        variables: {
          "state": "string (\"hello\")",
          "setState": "(v: string) => void",
        },
        explanation:
          "Die Funktion gibt ein Tuple [string, (v: string) => void] " +
          "zurueck. Beim Destructuring bekommt state den Typ string " +
          "und setState den Funktions-Typ. Dieses Muster kennt man " +
          "aus React's useState Hook.",
      },
    ],
    concept: "tuple-types",
    difficulty: 2,
  },

  // --- Exercise 3: as const auf Arrays -------------------------------------
  {
    id: "04-as-const-arrays",
    title: "as const — Vom Array zum readonly Tuple",
    description:
      "Verfolge wie 'as const' ein normales Array in ein " +
      "readonly Tuple mit Literal-Typen verwandelt.",
    code: [
      "const colors = ['red', 'green', 'blue'];",
      "const fixedColors = ['red', 'green', 'blue'] as const;",
      "",
      "colors.push('yellow');",
      "// fixedColors.push('yellow');  // Fehler!",
      "",
      "const first = fixedColors[0];",
      "const any_color = colors[0];",
      "",
      "const point = [10, 20] as const;",
      "type PointType = typeof point;",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Welchen Typ hat 'colors' (ohne as const)?",
        expectedAnswer: "string[]",
        variables: { "colors": "string[]" },
        explanation:
          "Ohne 'as const' inferiert TypeScript ein normales " +
          "veraenderbares string[]. Die konkreten Werte 'red', " +
          "'green', 'blue' werden zum allgemeinen Typ string widened.",
      },
      {
        lineIndex: 1,
        question:
          "Welchen Typ hat 'fixedColors' (mit as const)?",
        expectedAnswer: "readonly [\"red\", \"green\", \"blue\"]",
        variables: { "fixedColors": "readonly [\"red\", \"green\", \"blue\"]" },
        explanation:
          "Mit 'as const' wird das Array ein readonly Tuple mit " +
          "Literal-Typen. TypeScript kennt jetzt exakt 3 Elemente " +
          "an festen Positionen mit festen Werten. Keine Mutation erlaubt.",
      },
      {
        lineIndex: 6,
        question:
          "Welchen Typ hat 'first' (fixedColors[0])?",
        expectedAnswer: "\"red\"",
        variables: { "first": "\"red\" (Literal-Typ)" },
        explanation:
          "Da fixedColors ein Tuple ist, kennt TypeScript den " +
          "exakten Typ an Position 0: den Literal-Typ \"red\". " +
          "Bei einem normalen string[] waere der Typ nur string.",
      },
      {
        lineIndex: 7,
        question:
          "Welchen Typ hat 'any_color' (colors[0])? " +
          "Warum unterscheidet es sich von 'first'?",
        expectedAnswer: "string",
        variables: { "first": "\"red\" (Literal-Typ)", "any_color": "string" },
        explanation:
          "Bei einem normalen string[] gibt der Index-Zugriff " +
          "immer string zurueck — nicht den konkreten Wert. " +
          "TypeScript weiss nicht welches Element an Position 0 " +
          "steht, weil das Array veraenderbar ist.",
      },
      {
        lineIndex: 9,
        question:
          "Welchen Typ hat 'point' und was ist 'PointType'?",
        expectedAnswer: "readonly [10, 20]",
        variables: { "point": "readonly [10, 20]", "PointType": "readonly [10, 20]" },
        explanation:
          "as const funktioniert auch mit Zahlen. [10, 20] as const " +
          "wird zu readonly [10, 20] — ein Tuple mit den Literal-Typen " +
          "10 und 20. typeof extrahiert genau diesen Typ.",
      },
    ],
    concept: "as-const-arrays",
    difficulty: 3,
  },

  // --- Exercise 4: Type Guard mit filter ------------------------------------
  {
    id: "04-filter-type-narrowing",
    title: "filter() mit Type Predicates",
    description:
      "Verfolge warum ein normaler filter den Typ nicht einschraenkt " +
      "und wie Type Predicates das Problem loesen.",
    code: [
      "const mixed: (string | null)[] = ['a', null, 'b', null, 'c'];",
      "",
      "const filtered1 = mixed.filter((x) => x !== null);",
      "// filtered1 Typ: ???",
      "",
      "const filtered2 = mixed.filter(",
      "  (x): x is string => x !== null",
      ");",
      "// filtered2 Typ: ???",
    ],
    steps: [
      {
        lineIndex: 0,
        question:
          "Welchen Typ hat 'mixed'?",
        expectedAnswer: "(string | null)[]",
        variables: { "mixed": "(string | null)[]" },
        explanation:
          "Das Array enthaelt sowohl Strings als auch null-Werte. " +
          "Der Element-Typ ist die Union string | null.",
      },
      {
        lineIndex: 2,
        question:
          "Welchen Typ hat 'filtered1' nach dem normalen filter? " +
          "Wird null entfernt?",
        expectedAnswer: "string[]",
        variables: { "filtered1": "string[]" },
        explanation:
          "Ab TypeScript 5.5 erkennt filter() bei einfachen Null-Checks " +
          "automatisch Inferred Type Predicates. Der Callback " +
          "`x => x !== null` wird als Type Guard inferiert, sodass " +
          "der Typ zu string[] verengt wird. In aelteren TS-Versionen " +
          "(vor 5.5) blieb der Typ (string | null)[].",
      },
      {
        lineIndex: 5,
        question:
          "Welchen Typ hat 'filtered2' nach dem filter mit " +
          "Type Predicate (x is string)?",
        expectedAnswer: "string[]",
        variables: { "filtered2": "string[]" },
        explanation:
          "Das Type Predicate 'x is string' sagt TypeScript: " +
          "Wenn der Callback true zurueckgibt, ist x ein string. " +
          "Dadurch kann filter() den Typ zu string[] einschraenken. " +
          "Das ist der einzige Weg, den Typ durch filter zu narrowen.",
      },
      {
        lineIndex: 6,
        question:
          "Was bedeutet die Syntax '(x): x is string => ...'? " +
          "Ist das ein normaler Return-Typ?",
        expectedAnswer: "Nein, es ist ein Type Predicate — eine spezielle Return-Typ-Annotation",
        variables: {},
        explanation:
          "'x is string' ist ein Type Predicate. Es sagt dem Compiler: " +
          "'Wenn diese Funktion true zurueckgibt, dann ist der " +
          "Parameter x vom Typ string.' Es ist wie ein boolean " +
          "Return-Typ mit zusaetzlicher Typ-Information.",
      },
    ],
    concept: "type-predicates",
    difficulty: 4,
  },
];
