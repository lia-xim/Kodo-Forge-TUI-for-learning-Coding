/**
 * Lesson 11 — Tracing Exercises: Type Narrowing
 *
 * PARTICULARLY IMPORTANT for Narrowing: The type changes at EVERY guard!
 * Topics:
 *  - typeof narrowing chain
 *  - in-operator narrowing
 *  - Truthiness vs. Nullish
 *  - Exhaustive narrowing until never
 *
 * Difficulty increasing: 1 → 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: typeof Narrowing Chain ─────────────────────────────────
  {
    id: "11-typeof-chain",
    title: "typeof Narrowing — Type changes at every check",
    description:
      "Trace how the type of 'x' changes at every typeof check. " +
      "After each check, the checked type is eliminated.",
    code: [
      "function trace(x: string | number | boolean | null) {",
      "  // x: string | number | boolean | null",
      "  if (x === null) {",
      "    console.log('null');",
      "    return;",
      "  }",
      "  // x: ???",
      "  if (typeof x === 'string') {",
      "    console.log(x.toUpperCase());",
      "    return;",
      "  }",
      "  // x: ???",
      "  if (typeof x === 'number') {",
      "    console.log(x.toFixed(2));",
      "    return;",
      "  }",
      "  // x: ???",
      "  console.log(x ? 'true' : 'false');",
      "}",
    ],
    steps: [
      {
        lineIndex: 0,
        question: "What type does x have at the start of the function?",
        expectedAnswer: "string | number | boolean | null",
        variables: { "x": "string | number | boolean | null" },
        explanation:
          "The parameter has four possible types. TypeScript " +
          "does not yet know the concrete value.",
      },
      {
        lineIndex: 6,
        question: "What type does x have after the null check (lines 3-5)?",
        expectedAnswer: "string | number | boolean",
        variables: { "x": "string | number | boolean" },
        explanation:
          "The null check with early return eliminates null. " +
          "When we reach line 7, null is impossible.",
      },
      {
        lineIndex: 11,
        question: "What type does x have after the string check (lines 8-10)?",
        expectedAnswer: "number | boolean",
        variables: { "x": "number | boolean" },
        explanation:
          "typeof === 'string' with early return eliminates string. " +
          "Remaining: number | boolean.",
      },
      {
        lineIndex: 16,
        question: "What type does x have after the number check (lines 13-15)?",
        expectedAnswer: "boolean",
        variables: { "x": "boolean" },
        explanation:
          "number was also eliminated. Remaining: boolean. " +
          "This is why line 17 can use the boolean ternary " +
          "without an additional check.",
      },
    ],
    concept: "typeof-narrowing",
    difficulty: 1,
  },

  // ─── Exercise 2: in-Operator and Discriminated Union ────────────────────
  {
    id: "11-in-narrowing",
    title: "in-operator — Property-based narrowing",
    description:
      "Trace how the in-operator narrows the type of a " +
      "discriminated union.",
    code: [
      "interface Dog { bark(): string; legs: number }",
      "interface Fish { swim(): string; fins: number }",
      "interface Bird { fly(): string; wings: number }",
      "type Animal = Dog | Fish | Bird;",
      "",
      "function describe(animal: Animal): string {",
      "  // animal: Dog | Fish | Bird",
      "  if ('bark' in animal) {",
      "    // animal: ???",
      "    return animal.bark();",
      "  }",
      "  // animal: ???",
      "  if ('swim' in animal) {",
      "    // animal: ???",
      "    return animal.swim();",
      "  }",
      "  // animal: ???",
      "  return animal.fly();",
      "}",
    ],
    steps: [
      {
        lineIndex: 6,
        question: "What type does animal have at the start?",
        expectedAnswer: "Dog | Fish | Bird",
        variables: { "animal": "Dog | Fish | Bird" },
        explanation:
          "The union type has three possibilities. We must " +
          "use narrowing to determine the concrete type.",
      },
      {
        lineIndex: 8,
        question: "What type does animal have after 'bark' in animal?",
        expectedAnswer: "Dog",
        variables: { "animal": "Dog" },
        explanation:
          "Only Dog has the property 'bark'. The in-operator " +
          "narrows to Dog — bark() and legs are available.",
      },
      {
        lineIndex: 11,
        question: "What type does animal have after the bark check (if not Dog)?",
        expectedAnswer: "Fish | Bird",
        variables: { "animal": "Fish | Bird" },
        explanation:
          "Dog was eliminated (handled in the if). " +
          "Fish and Bird remain.",
      },
      {
        lineIndex: 13,
        question: "What type does animal have after 'swim' in animal?",
        expectedAnswer: "Fish",
        variables: { "animal": "Fish" },
        explanation:
          "Only Fish has 'swim'. TypeScript narrows to Fish.",
      },
      {
        lineIndex: 16,
        question: "What type does animal have at the end (no Dog, no Fish)?",
        expectedAnswer: "Bird",
        variables: { "animal": "Bird" },
        explanation:
          "Dog and Fish were eliminated. Remaining: Bird. " +
          "This is why animal.fly() is allowed without a check.",
      },
    ],
    concept: "in-operator-narrowing",
    difficulty: 2,
  },

  // ─── Exercise 3: Truthiness vs. Nullish ─────────────────────────────────
  {
    id: "11-truthiness-vs-nullish",
    title: "Truthiness vs. Nullish — Which values survive?",
    description:
      "Trace the difference between a truthiness check (if (x)), " +
      "a nullish check (x != null), and a strict check (x !== null).",
    code: [
      "function truthiness(x: number | null | undefined) {",
      "  if (x) { return `truthy: ${x}`; }",
      "  return `falsy: ${x}`;",
      "}",
      "",
      "function nullish(x: number | null | undefined) {",
      "  if (x != null) { return `defined: ${x}`; }",
      "  return `nullish: ${x}`;",
      "}",
      "",
      "console.log(truthiness(42));",
      "console.log(truthiness(0));",
      "console.log(truthiness(null));",
      "console.log(nullish(42));",
      "console.log(nullish(0));",
      "console.log(nullish(null));",
    ],
    steps: [
      {
        lineIndex: 10,
        question: "What does truthiness(42) return?",
        expectedAnswer: "truthy: 42",
        variables: { "x": "42", "result": "truthy: 42" },
        explanation:
          "42 is truthy. if (x) is true, so 'truthy: 42'.",
      },
      {
        lineIndex: 11,
        question: "What does truthiness(0) return?",
        expectedAnswer: "falsy: 0",
        variables: { "x": "0", "result": "falsy: 0" },
        explanation:
          "0 is FALSY! if (0) is false. 0 is incorrectly treated " +
          "as 'not present'. This is the truthiness trap!",
      },
      {
        lineIndex: 12,
        question: "What does truthiness(null) return?",
        expectedAnswer: "falsy: null",
        variables: { "x": "null", "result": "falsy: null" },
        explanation:
          "null is falsy. This is intended here — null SHOULD " +
          "be treated as not present.",
      },
      {
        lineIndex: 14,
        question: "What does nullish(0) return?",
        expectedAnswer: "defined: 0",
        variables: { "x": "0", "result": "defined: 0" },
        explanation:
          "!= null only checks for null/undefined. 0 is neither null " +
          "nor undefined, so 'defined: 0'. This is the CORRECT " +
          "behavior — 0 is a valid value!",
      },
      {
        lineIndex: 15,
        question: "What does nullish(null) return?",
        expectedAnswer: "nullish: null",
        variables: { "x": "null", "result": "nullish: null" },
        explanation:
          "null == null is true (loose equality). So x != null is false " +
          "and we return 'nullish: null'.",
      },
    ],
    concept: "truthiness-vs-nullish",
    difficulty: 2,
  },

  // ─── Exercise 4: Exhaustive Narrowing until never ────────────────────────
  {
    id: "11-exhaustive-never",
    title: "Exhaustive Narrowing — Type becomes never",
    description:
      "Trace how the type narrows with each case in a switch statement, " +
      "until it becomes never in the default branch.",
    code: [
      "type Action = 'create' | 'read' | 'update' | 'delete';",
      "",
      "function handle(action: Action) {",
      "  // action: 'create' | 'read' | 'update' | 'delete'",
      "  switch (action) {",
      "    case 'create':",
      "      // action: 'create'",
      "      return 'POST';",
      "    case 'read':",
      "      // action (remaining): ???",
      "      return 'GET';",
      "    case 'update':",
      "      // action (remaining): ???",
      "      return 'PUT';",
      "    case 'delete':",
      "      // action (remaining): ???",
      "      return 'DELETE';",
      "    default:",
      "      // action: ???",
      "      const _: never = action;",
      "      return _;",
      "  }",
      "}",
    ],
    steps: [
      {
        lineIndex: 3,
        question: "What type does action have before the switch?",
        expectedAnswer: "create | read | update | delete",
        variables: { "action": "create | read | update | delete" },
        explanation:
          "All four values are possible. The switch will eliminate " +
          "them one by one.",
      },
      {
        lineIndex: 9,
        question:
          "What type does action have after case 'create' (in the remaining code)?",
        expectedAnswer: "read | update | delete",
        variables: { "action": "read | update | delete" },
        explanation:
          "case 'create' with return eliminates 'create'. " +
          "Three possibilities remain.",
      },
      {
        lineIndex: 12,
        question:
          "What type does action have after case 'read' (in the remaining code)?",
        expectedAnswer: "update | delete",
        variables: { "action": "update | delete" },
        explanation:
          "'read' is also eliminated. Two possibilities remain.",
      },
      {
        lineIndex: 15,
        question:
          "What type does action have after case 'update' (in the remaining code)?",
        expectedAnswer: "delete",
        variables: { "action": "delete" },
        explanation:
          "Only 'delete' remains.",
      },
      {
        lineIndex: 18,
        question: "What type does action have in the default branch?",
        expectedAnswer: "never",
        variables: { "action": "never" },
        explanation:
          "All four values were handled by cases. " +
          "NOTHING remains — the type is never. " +
          "This is why const _: never = action works. " +
          "If a fifth value is added, action would no longer be never " +
          "and compilation would fail!",
      },
    ],
    concept: "exhaustive-narrowing",
    difficulty: 3,
  },
];