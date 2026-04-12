```typescript
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
    title: "Array Methods — What Types Come Back?",
    description:
      "Trace the return types of map, filter, and find and " +
      "why find can contain 'undefined'.",
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
          "What type does 'doubled' have (nums.map with n * 2)?",
        expectedAnswer: "number[]",
        variables: { "nums": "number[]", "doubled": "number[]" },
        explanation:
          "map() returns a new array with the type of the callback return value. " +
          "n * 2 returns number, so doubled: number[]. " +
          "map never changes the length.",
      },
      {
        lineIndex: 3,
        question:
          "What type does 'evens' have (nums.filter with condition)?",
        expectedAnswer: "number[]",
        variables: { "doubled": "number[]", "evens": "number[]" },
        explanation:
          "filter() returns an array of the same type: number[]. " +
          "The runtime value is [2, 4], but the TypeScript type " +
          "remains number[] — TS doesn't know which elements will remain. " +
          "The length is unknown.",
      },
      {
        lineIndex: 4,
        question:
          "What type does 'found' have (nums.find)? " +
          "Why is it different from filter?",
        expectedAnswer: "number | undefined",
        variables: { "doubled": "number[]", "evens": "number[]", "found": "number | undefined" },
        explanation:
          "find() returns a single element, NOT an array. " +
          "Since find() may not find anything, the type is " +
          "number | undefined. The undefined must be handled " +
          "before you can work with found.",
      },
      {
        lineIndex: 6,
        question:
          "What type does 'strings' have (map with String())?",
        expectedAnswer: "string[]",
        variables: { "strings": "string[]" },
        explanation:
          "String(n) returns string. map() collects the results " +
          "into string[]. The transformation number[] -> string[] " +
          "shows the power of map with type inference.",
      },
      {
        lineIndex: 7,
        question:
          "What type does 'bools' have (map with n > 3)?",
        expectedAnswer: "boolean[]",
        variables: { "strings": "string[]", "bools": "boolean[]" },
        explanation:
          "The comparison n > 3 returns boolean. " +
          "Therefore bools: boolean[]. The runtime value is " +
          "[false, false, false, true, true]. map always infers " +
          "the type from the callback return.",
      },
    ],
    concept: "array-methods",
    difficulty: 1,
  },

  // --- Exercise 2: Tuple-Destructuring --------------------------------------
  {
    id: "04-tuple-destructuring",
    title: "Tuple Destructuring — Position-Based Types",
    description:
      "Trace how TypeScript assigns the correct type to each element " +
      "during tuple destructuring.",
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
          "What types do 'name' and 'age' have after destructuring " +
          "the tuple [string, number]?",
        expectedAnswer: "name: string, age: number",
        variables: { "name": "string (\"Alice\")", "age": "number (30)" },
        explanation:
          "With tuple destructuring, TypeScript assigns each element " +
          "the type of its position. Position 0 is string, " +
          "position 1 is number. This is the advantage of tuples " +
          "over regular arrays.",
      },
      {
        lineIndex: 4,
        question:
          "What types do success, message, and code have?",
        expectedAnswer: "success: boolean, message: string, code: number",
        variables: {
          "success": "boolean (true)",
          "message": "string (\"ok\")",
          "code": "number (200)",
        },
        explanation:
          "Each position in the tuple has its own type. " +
          "A tuple [boolean, string, number] returns exactly " +
          "these types in the correct order when destructured.",
      },
      {
        lineIndex: 6,
        question:
          "What types do 'first' and 'rest' have in rest destructuring " +
          "of [10, 20, 30, 40]?",
        expectedAnswer: "first: number, rest: number[]",
        variables: { "first": "number (10)", "rest": "number[] ([20, 30, 40])" },
        explanation:
          "The array [10, 20, 30, 40] is inferred as number[] " +
          "(not as a tuple, since there is no 'as const'). In rest destructuring " +
          "first: number and ...rest collects the rest as number[].",
      },
      {
        lineIndex: 12,
        question:
          "What types do 'state' and 'setState' have after " +
          "destructuring the useState return?",
        expectedAnswer: "state: string, setState: (v: string) => void",
        variables: {
          "state": "string (\"hello\")",
          "setState": "(v: string) => void",
        },
        explanation:
          "The function returns a tuple [string, (v: string) => void]. " +
          "When destructured, state gets the type string " +
          "and setState gets the function type. This pattern is familiar " +
          "from React's useState hook.",
      },
    ],
    concept: "tuple-types",
    difficulty: 2,
  },

  // --- Exercise 3: as const auf Arrays -------------------------------------
  {
    id: "04-as-const-arrays",
    title: "as const — From Array to readonly Tuple",
    description:
      "Trace how 'as const' transforms a regular array into a " +
      "readonly tuple with literal types.",
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
          "What type does 'colors' have (without as const)?",
        expectedAnswer: "string[]",
        variables: { "colors": "string[]" },
        explanation:
          "Without 'as const', TypeScript infers a regular " +
          "mutable string[]. The concrete values 'red', " +
          "'green', 'blue' are widened to the general type string.",
      },
      {
        lineIndex: 1,
        question:
          "What type does 'fixedColors' have (with as const)?",
        expectedAnswer: "readonly [\"red\", \"green\", \"blue\"]",
        variables: { "fixedColors": "readonly [\"red\", \"green\", \"blue\"]" },
        explanation:
          "With 'as const', the array becomes a readonly tuple with " +
          "literal types. TypeScript now knows exactly 3 elements " +
          "at fixed positions with fixed values. No mutation allowed.",
      },
      {
        lineIndex: 6,
        question:
          "What type does 'first' have (fixedColors[0])?",
        expectedAnswer: "\"red\"",
        variables: { "first": "\"red\" (literal type)" },
        explanation:
          "Since fixedColors is a tuple, TypeScript knows the " +
          "exact type at position 0: the literal type \"red\". " +
          "With a regular string[], the type would only be string.",
      },
      {
        lineIndex: 7,
        question:
          "What type does 'any_color' have (colors[0])? " +
          "Why is it different from 'first'?",
        expectedAnswer: "string",
        variables: { "first": "\"red\" (literal type)", "any_color": "string" },
        explanation:
          "With a regular string[], index access always returns " +
          "string — not the concrete value. " +
          "TypeScript doesn't know which element is at position 0 " +
          "because the array is mutable.",
      },
      {
        lineIndex: 9,
        question:
          "What type does 'point' have and what is 'PointType'?",
        expectedAnswer: "readonly [10, 20]",
        variables: { "point": "readonly [10, 20]", "PointType": "readonly [10, 20]" },
        explanation:
          "as const also works with numbers. [10, 20] as const " +
          "becomes readonly [10, 20] — a tuple with the literal types " +
          "10 and 20. typeof extracts exactly this type.",
      },
    ],
    concept: "as-const-arrays",
    difficulty: 3,
  },

  // --- Exercise 4: Type Guard mit filter ------------------------------------
  {
    id: "04-filter-type-narrowing",
    title: "filter() with Type Predicates",
    description:
      "Trace why a normal filter does not narrow the type " +
      "and how type predicates solve the problem.",
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
          "What type does 'mixed' have?",
        expectedAnswer: "(string | null)[]",
        variables: { "mixed": "(string | null)[]" },
        explanation:
          "The array contains both strings and null values. " +
          "The element type is the union string | null.",
      },
      {
        lineIndex: 2,
        question:
          "What type does 'filtered1' have after the normal filter? " +
          "Is null removed?",
        expectedAnswer: "string[]",
        variables: { "filtered1": "string[]" },
        explanation:
          "From TypeScript 5.5 onwards, filter() automatically recognizes " +
          "Inferred Type Predicates for simple null checks. The callback " +
          "`x => x !== null` is inferred as a type guard, narrowing the " +
          "type to string[]. In older TS versions (before 5.5), " +
          "the type remained (string | null)[].",
      },
      {
        lineIndex: 5,
        question:
          "What type does 'filtered2' have after the filter with " +
          "type predicate (x is string)?",
        expectedAnswer: "string[]",
        variables: { "filtered2": "string[]" },
        explanation:
          "The type predicate 'x is string' tells TypeScript: " +
          "If the callback returns true, x is a string. " +
          "This allows filter() to narrow the type to string[]. " +
          "This is the only way to narrow the type through filter.",
      },
      {
        lineIndex: 6,
        question:
          "What does the syntax '(x): x is string => ...' mean? " +
          "Is this a normal return type?",
        expectedAnswer: "No, it is a type predicate — a special return type annotation",
        variables: {},
        explanation:
          "'x is string' is a type predicate. It tells the compiler: " +
          "'If this function returns true, then the parameter x is of type string.' " +
          "It is like a boolean return type with additional type information.",
      },
    ],
    concept: "type-predicates",
    difficulty: 4,
  },
];
```