/**
 * Lesson 07 — Tracing Exercises: Union & Intersection Types
 *
 * Topics: Narrowing flow, Discriminated Union switch, Intersection combination
 * Difficulty: 2 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  {
    id: "07-narrowing-flow",
    title: "Narrowing Flow — Type changes through control flow",
    description:
      "Trace how TypeScript changes the type of a variable through " +
      "different branches.",
    code: [
      "function describe(x: string | number | boolean): string {",
      "  if (typeof x === 'string') {",
      "    return `Text: ${x.toUpperCase()}`;",
      "  }",
      "  // x is now number | boolean",
      "  if (typeof x === 'number') {",
      "    return `Number: ${x.toFixed(2)}`;",
      "  }",
      "  // x is now boolean",
      "  return `Bool: ${x}`;",
      "}",
    ],
    steps: [
      {
        lineIndex: 1,
        question: "What type does x have BEFORE the first if?",
        expectedAnswer: "string | number | boolean",
        variables: { "x": "(Type: string | number | boolean)" },
        explanation: "x has the full union type from the function signature.",
      },
      {
        lineIndex: 2,
        question: "What type does x have INSIDE the first if block?",
        expectedAnswer: "string",
        variables: { "x": "(Type: string)" },
        explanation:
          "typeof x === 'string' narrows to string. " +
          "toUpperCase() is now safely callable.",
      },
      {
        lineIndex: 4,
        question: "What type does x have AFTER the first if block (line 5)?",
        expectedAnswer: "number | boolean",
        variables: { "x": "(Type: number | boolean)" },
        explanation:
          "TypeScript knows: if we reach this point, x was NOT a string " +
          "(otherwise we would have returned). So: number | boolean.",
      },
      {
        lineIndex: 8,
        question: "What type does x have at the end (line 9)?",
        expectedAnswer: "boolean",
        variables: { "x": "(Type: boolean)" },
        explanation:
          "Both previous checks have excluded string and number. " +
          "What remains: boolean.",
      },
    ],
    concept: "sequential-narrowing",
    difficulty: 2,
  },

  {
    id: "07-discriminated-switch",
    title: "Discriminated Union — Switch narrows the type",
    description:
      "Trace how a switch on the tag property narrows the type.",
    code: [
      "type Event =",
      "  | { type: 'click'; x: number; y: number }",
      "  | { type: 'keypress'; key: string }",
      "  | { type: 'scroll'; offset: number };",
      "",
      "function handleEvent(event: Event): string {",
      "  switch (event.type) {",
      "    case 'click':",
      "      return `Click at (${event.x}, ${event.y})`;",
      "    case 'keypress':",
      "      return `Key: ${event.key}`;",
      "    case 'scroll':",
      "      return `Scroll: ${event.offset}px`;",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 7,
        question: "What type does event have in the case 'click'?",
        expectedAnswer: "{ type: 'click'; x: number; y: number }",
        variables: { "event": "(Type: { type: 'click'; x: number; y: number })" },
        explanation:
          "switch on event.type with case 'click' narrows to the " +
          "union member with type: 'click'. event.x and event.y are accessible.",
      },
      {
        lineIndex: 9,
        question: "What type does event have in the case 'keypress'?",
        expectedAnswer: "{ type: 'keypress'; key: string }",
        variables: { "event": "(Type: { type: 'keypress'; key: string })" },
        explanation:
          "case 'keypress' narrows to the member with type: 'keypress'. " +
          "event.key is accessible, but event.x would be an error.",
      },
      {
        lineIndex: 11,
        question: "What type does event have in the case 'scroll'?",
        expectedAnswer: "{ type: 'scroll'; offset: number }",
        variables: { "event": "(Type: { type: 'scroll'; offset: number })" },
        explanation:
          "Each case narrows to exactly the matching union member. " +
          "That is the strength of Discriminated Unions.",
      },
    ],
    concept: "discriminated-union-switch",
    difficulty: 2,
  },

  {
    id: "07-intersection-merge",
    title: "Intersection combines properties",
    description:
      "Trace how Intersection Types merge properties from multiple types.",
    code: [
      "type Base = { id: number; createdAt: Date };",
      "type WithName = { name: string };",
      "type WithEmail = { email: string };",
      "",
      "type User = Base & WithName & WithEmail;",
      "",
      "const user: User = {",
      "  id: 1,",
      "  createdAt: new Date(),",
      "  name: 'Max',",
      "  email: 'max@test.de',",
      "};",
      "",
      "const nameAndEmail = `${user.name} <${user.email}>`;",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "What properties does the type User have?",
        expectedAnswer: "id, createdAt, name, email — all properties from all three types",
        variables: { "User": "{ id: number; createdAt: Date; name: string; email: string }" },
        explanation:
          "Intersection (&) combines ALL properties. User has " +
          "the properties from Base AND WithName AND WithEmail.",
      },
      {
        lineIndex: 6,
        question: "Would { id: 1, name: 'Max' } work as a User value?",
        expectedAnswer: "No — createdAt and email are missing",
        variables: {},
        explanation:
          "An intersection type requires ALL properties. " +
          "Missing properties are a compile error.",
      },
      {
        lineIndex: 13,
        question: "What value does nameAndEmail have?",
        expectedAnswer: "\"Max <max@test.de>\"",
        variables: { "nameAndEmail": "\"Max <max@test.de>\" (Type: string)" },
        explanation:
          "user.name and user.email are both accessible because User " +
          "is an intersection of all three types.",
      },
    ],
    concept: "intersection-properties",
    difficulty: 2,
  },

  {
    id: "07-narrowing-with-assertion",
    title: "Exhaustive Check with never",
    description:
      "Trace what happens when a new union member is added " +
      "and the exhaustive check triggers.",
    code: [
      "type Light = 'red' | 'yellow' | 'green';",
      "",
      "function nextLight(current: Light): Light {",
      "  switch (current) {",
      "    case 'red': return 'green';",
      "    case 'yellow': return 'red';",
      "    case 'green': return 'yellow';",
      "    default:",
      "      const _exhaustive: never = current;",
      "      return _exhaustive;",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "What type does current have in the case 'red'?",
        expectedAnswer: "'red' (literal type)",
        variables: { "current": "'red'" },
        explanation: "switch/case narrows to the exact literal type.",
      },
      {
        lineIndex: 8,
        question: "What type does current have in the default block when all cases are handled?",
        expectedAnswer: "never — no value possible",
        variables: { "current": "(Type: never)" },
        explanation:
          "When all union members are handled in case blocks, " +
          "the default block has type 'never' — no value can reach here.",
      },
      {
        lineIndex: 8,
        question: "What happens if you add 'blue' to the Light union?",
        expectedAnswer: "Compile error: 'blue' is not assignable to 'never'",
        variables: { "current": "(Type: 'blue' — not never!)" },
        explanation:
          "With 'blue' in the union, current in the default block would be 'blue' instead of never. " +
          "The assignment to never fails — a compile error forces you to " +
          "handle the new case.",
      },
    ],
    concept: "exhaustive-check-never",
    difficulty: 3,
  },
];