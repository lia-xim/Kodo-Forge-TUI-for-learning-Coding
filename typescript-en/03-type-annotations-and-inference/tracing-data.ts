Here is the fully translated file:

```typescript
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
    title: "Widening — let vs const with Literal Types",
    description:
      "Trace how TypeScript infers different types for let and const " +
      "and why this matters for type safety.",
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
          "What TypeScript type does 'greeting' have (const with string literal)?",
        expectedAnswer: "\"hello\"",
        variables: { "greeting": "\"hello\" (literal type)" },
        explanation:
          "With const, TypeScript infers the narrowest possible type: " +
          "the literal type \"hello\". Since const can never be reassigned, " +
          "the value is always exactly \"hello\".",
      },
      {
        lineIndex: 1,
        question:
          "What TypeScript type does 'farewell' have (let with string literal)?",
        expectedAnswer: "string",
        variables: { "greeting": "\"hello\" (literal type)", "farewell": "\"bye\" (type: string)" },
        explanation:
          "With let, TypeScript 'widens' the type to the general type: " +
          "string instead of \"bye\". The reason: let variables can " +
          "later receive a different string value.",
      },
      {
        lineIndex: 2,
        question:
          "What TypeScript type does 'count' have (const with a number)?",
        expectedAnswer: "42",
        variables: {
          "greeting": "\"hello\" (literal type)",
          "farewell": "\"bye\" (type: string)",
          "count": "42 (literal type)",
        },
        explanation:
          "The same principle as with strings: const infers the " +
          "literal type 42. TypeScript knows that count will always " +
          "be exactly 42.",
      },
      {
        lineIndex: 3,
        question:
          "What TypeScript type does 'amount' have (let with a number)?",
        expectedAnswer: "number",
        variables: {
          "greeting": "\"hello\" (literal type)",
          "farewell": "\"bye\" (type: string)",
          "count": "42 (literal type)",
          "amount": "42 (type: number)",
        },
        explanation:
          "let widens 42 to the general type number. Pattern: " +
          "const -> literal type (narrow), let -> general type (wide). " +
          "This is called 'Literal Widening'.",
      },
      {
        lineIndex: 5,
        question:
          "Is the assignment farewell = 'see you' allowed? Why?",
        expectedAnswer: "Yes, because farewell has the type string",
        variables: { "farewell": "\"see you\" (type: string)" },
        explanation:
          "Since farewell is declared with let, it has the type string. " +
          "Any string value can be assigned. If farewell were const, " +
          "there would be a compile error.",
      },
    ],
    concept: "literal-widening",
    difficulty: 1,
  },

  // --- Exercise 2: Contextual Typing ----------------------------------------
  {
    id: "03-contextual-typing",
    title: "Contextual Typing — Type from Context",
    description:
      "Trace how TypeScript automatically infers the type of callback " +
      "parameters from context.",
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
          "What type does the parameter 'name' have in the map callback? " +
          "There is no annotation — how does TypeScript know the type?",
        expectedAnswer: "string",
        variables: { "names": "string[]", "name": "string" },
        explanation:
          "TypeScript knows the type of names (string[]). The " +
          "map() method expects a callback with the element type " +
          "as its parameter. Therefore name is automatically inferred " +
          "as string. This is called 'Contextual Typing'.",
      },
      {
        lineIndex: 3,
        question:
          "What type does 'lengths' have after map? " +
          "What is the return type of the callback?",
        expectedAnswer: "number[]",
        variables: { "lengths": "number[]" },
        explanation:
          "name.length returns number. map() collects the " +
          "return values into a new array. TypeScript infers: " +
          "string[].map(() => number) = number[].",
      },
      {
        lineIndex: 6,
        question:
          "What type does 'upper' have?",
        expectedAnswer: "string[]",
        variables: { "lengths": "number[]", "upper": "string[]" },
        explanation:
          "name.toUpperCase() returns string. Therefore the " +
          "type of upper is: string[]. The Contextual Typing mechanism " +
          "also works with arrow functions using implicit return.",
      },
      {
        lineIndex: 9,
        question:
          "What type does 'e' have in the handler callback? " +
          "Why does it not need to be annotated?",
        expectedAnswer: "MouseEvent",
        variables: { "e": "MouseEvent" },
        explanation:
          "The variable handler has an explicit type annotation: " +
          "(event: MouseEvent) => void. TypeScript infers from this " +
          "that the parameter e must be of type MouseEvent. " +
          "e.clientX is therefore a valid access.",
      },
    ],
    concept: "contextual-typing",
    difficulty: 2,
  },

  // --- Exercise 3: as const — Readonly Literal-Typen -----------------------
  {
    id: "03-as-const-effect",
    title: "as const — Everything becomes readonly and literal",
    description:
      "Trace the difference between normal declarations " +
      "and 'as const' for objects and arrays.",
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
          "What type does 'config.host' have? " +
          "(object WITHOUT as const)",
        expectedAnswer: "string",
        variables: { "config.host": "string", "config.port": "number" },
        explanation:
          "Without 'as const', TypeScript widens the property types: " +
          "host becomes string (not \"localhost\"), port becomes number " +
          "(not 3000). The properties are also not readonly.",
      },
      {
        lineIndex: 5,
        question:
          "What type does 'frozenConfig.host' have? " +
          "(object WITH as const)",
        expectedAnswer: "\"localhost\"",
        variables: { "frozenConfig.host": "\"localhost\"", "frozenConfig.port": "3000" },
        explanation:
          "'as const' does three things: (1) All properties become " +
          "readonly, (2) string values keep their literal type, " +
          "(3) numbers keep their literal type. " +
          "host is therefore readonly \"localhost\", not string.",
      },
      {
        lineIndex: 10,
        question:
          "What type does 'colors' have? " +
          "(array WITHOUT as const)",
        expectedAnswer: "string[]",
        variables: { "colors": "string[]" },
        explanation:
          "Without as const, TypeScript infers a normal string[]. " +
          "The elements could be any string, and " +
          "the array is mutable (push, pop, etc.).",
      },
      {
        lineIndex: 11,
        question:
          "What type does 'fixedColors' have? " +
          "(array WITH as const)",
        expectedAnswer: "readonly [\"red\", \"green\", \"blue\"]",
        variables: { "fixedColors": "readonly [\"red\", \"green\", \"blue\"]" },
        explanation:
          "With 'as const', the array becomes a readonly tuple " +
          "with literal types. TypeScript now knows exactly the " +
          "length (3), the position, and the value of each element. " +
          "push() and other mutating methods are forbidden.",
      },
    ],
    concept: "as-const",
    difficulty: 3,
  },

  // --- Exercise 4: Return Type Inference ------------------------------------
  {
    id: "03-return-type-inference",
    title: "Return Type Inference — What does the function return?",
    description:
      "Trace how TypeScript infers the return type of functions " +
      "from the return statements.",
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
          "What literal type does the return value on line 3 have?",
        expectedAnswer: "\"ok\"",
        variables: { "return": "\"ok\"" },
        explanation:
          "The return value 'ok' is a string literal. Since it appears " +
          "in a return statement, TypeScript remembers this type " +
          "for the return type calculation.",
      },
      {
        lineIndex: 5,
        question:
          "What literal type does the return value on line 6 have?",
        expectedAnswer: "\"not found\"",
        variables: { "return": "\"not found\"" },
        explanation:
          "Here too, TypeScript remembers the literal type " +
          "\"not found\". Both return paths are collected.",
      },
      {
        lineIndex: 7,
        question:
          "What type does the return value on line 8 have?",
        expectedAnswer: "null",
        variables: { "return": "null" },
        explanation:
          "The third return path returns null. TypeScript " +
          "collects all possible return types.",
      },
      {
        lineIndex: 10,
        question:
          "What type does 'result' have? How does TypeScript " +
          "calculate the return type of the entire function?",
        expectedAnswer: "\"ok\" | \"not found\" | null",
        variables: { "result": "\"ok\" | \"not found\" | null" },
        explanation:
          "TypeScript forms a union from all return paths: " +
          "\"ok\" | \"not found\" | null. Without an explicit annotation, " +
          "TS automatically infers the return type by analyzing " +
          "all return statements.",
      },
    ],
    concept: "return-type-inference",
    difficulty: 4,
  },
];
```