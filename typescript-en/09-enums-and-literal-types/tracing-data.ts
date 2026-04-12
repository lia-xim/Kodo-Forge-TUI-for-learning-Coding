/**
 * Lesson 09 — Tracing Exercises: Enums & Literal Types
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  {
    id: "09-enum-runtime",
    title: "What does a numeric enum generate?",
    description: "Trace what TypeScript makes out of a numeric enum.",
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
        question: "What values do Red, Green, Blue have?",
        expectedAnswer: "Red = 0, Green = 1, Blue = 2 (auto-increment starting at 0)",
        variables: { "Color.Red": "0", "Color.Green": "1", "Color.Blue": "2" },
        explanation: "Without explicit values, auto-increment starts at 0.",
      },
      {
        lineIndex: 2,
        question: "What does Color.Red output?",
        expectedAnswer: "0",
        variables: {},
        explanation: "Color.Red is the numeric value 0.",
      },
      {
        lineIndex: 3,
        question: "What does Color[0] output?",
        expectedAnswer: "'Red' — reverse mapping",
        variables: {},
        explanation: "Numeric enums have reverse mapping: Color[0] returns the name 'Red'.",
      },
      {
        lineIndex: 5,
        question: "How many keys does Object.keys(Color) have?",
        expectedAnswer: "6 — three names + three numbers (reverse mapping)",
        variables: { "keys": "['0', '1', '2', 'Red', 'Green', 'Blue']" },
        explanation: "Double entries: name→value AND value→name = 6 keys.",
      },
    ],
    concept: "numeric-enum-runtime",
    difficulty: 2,
  },

  {
    id: "09-as-const-effects",
    title: "The three effects of as const",
    description: "Trace how as const changes arrays and objects.",
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
        question: "What type does arr have?",
        expectedAnswer: "readonly ['GET', 'POST'] — tuple with literal types",
        variables: { "arr": "(type: readonly ['GET', 'POST'])" },
        explanation: "as const: (1) readonly, (2) literal types, (3) tuple instead of array.",
      },
      {
        lineIndex: 1,
        question: "What type does obj.method have?",
        expectedAnswer: "'GET' (literal type, not string)",
        variables: { "obj.method": "(type: 'GET')" },
        explanation: "as const preserves the literal type 'GET' instead of widening to string.",
      },
      {
        lineIndex: 3,
        question: "What happens with arr.push('PUT')?",
        expectedAnswer: "Compile error: readonly prevents mutations",
        variables: {},
        explanation: "as const makes the array readonly — push, pop, etc. are forbidden.",
      },
      {
        lineIndex: 6,
        question: "What is the type of Methods?",
        expectedAnswer: "'GET' | 'POST'",
        variables: { "Methods": "'GET' | 'POST'" },
        explanation: "typeof arr[number] accesses all elements and produces the union.",
      },
    ],
    concept: "as-const-triple-effect",
    difficulty: 2,
  },

  {
    id: "09-template-literal-expansion",
    title: "Template literal types — Cartesian product",
    description: "Trace how template literal types generate all combinations.",
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
        question: "How many members does Token have? Which ones?",
        expectedAnswer: "6 (3 x 2): 'sm-red' | 'sm-blue' | 'md-red' | 'md-blue' | 'lg-red' | 'lg-blue'",
        variables: { "Token": "6 members (3 x 2)" },
        explanation: "Cartesian product: every Size combined with every Color.",
      },
      {
        lineIndex: 4,
        question: "How many members does PrefixedSize have?",
        expectedAnswer: "3: 'size-sm' | 'size-md' | 'size-lg'",
        variables: { "PrefixedSize": "3 members" },
        explanation: "A fixed prefix with a union: 1 x 3 = 3 combinations.",
      },
      {
        lineIndex: 5,
        question: "What is Capitalized?",
        expectedAnswer: "'Red' | 'Blue'",
        variables: { "Capitalized": "'Red' | 'Blue'" },
        explanation: "Capitalize uppercases the first letter. Distributed over each union member.",
      },
    ],
    concept: "template-literal-cartesian",
    difficulty: 3,
  },

  {
    id: "09-branded-type-flow",
    title: "Branded type — flow of type safety",
    description: "Trace how a branded type flows through the code.",
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
        question: "What type does price have?",
        expectedAnswer: "EUR (number & { __brand: 'EUR' })",
        variables: { "price": "9.99 (type: EUR)" },
        explanation: "The eur() function casts the number to the branded type.",
      },
      {
        lineIndex: 6,
        question: "Why is 'as number' needed for the addition?",
        expectedAnswer: "EUR + EUR does not work directly — you must cast to number",
        variables: { "total": "11.89 (type: number — not EUR!)" },
        explanation: "Arithmetic only works with number. The result loses the brand.",
      },
      {
        lineIndex: 7,
        question: "What type does typedTotal have?",
        expectedAnswer: "EUR — rebranded by calling eur() again",
        variables: { "typedTotal": "11.89 (type: EUR)" },
        explanation: "To restore the brand, the constructor function must be called again.",
      },
    ],
    concept: "branded-type-flow",
    difficulty: 4,
  },
];