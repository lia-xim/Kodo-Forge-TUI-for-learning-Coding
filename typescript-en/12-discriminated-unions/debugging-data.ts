/**
 * Lesson 12 — Debugging Challenges: Discriminated Unions
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L12-D1",
    title: "Discriminator is not a Literal Type",
    buggyCode: [
      "type Dog = { animal: string; breed: string };",
      "type Cat = { animal: string; lives: number };",
      "type Pet = Dog | Cat;",
      "",
      "function describe(pet: Pet): string {",
      '  if (pet.animal === "dog") {',
      "    return `Dog: ${pet.breed}`;  // Error! breed does not exist on Pet",
      "  }",
      '  return `Cat: ${pet.lives} lives`;  // Error!',
      "}",
    ].join("\n"),
    errorMessage: "Property 'breed' does not exist on type 'Pet'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "animal is 'string' instead of a Literal Type — TypeScript cannot narrow",
      "if/else does not work with Discriminated Unions",
      "Pet needs a common base class",
      "describe must be async",
    ],
    correctOption: 0,
    hints: [
      "What type does 'animal' have in both variants?",
      "'animal: string' is too broad — TypeScript cannot distinguish 'dog' from 'cat'.",
      "Solution: animal: 'dog' and animal: 'cat' as Literal Types.",
    ],
    fixedCode: [
      '// Literal Types as discriminator:',
      'type Dog = { animal: "dog"; breed: string };',
      'type Cat = { animal: "cat"; lives: number };',
      "type Pet = Dog | Cat;",
    ].join("\n"),
    explanation:
      "Discriminated Unions require LITERAL Types as the discriminator. " +
      "'string' is too broad — TypeScript cannot know which " +
      "variant is present. Only 'dog' and 'cat' as String Literals " +
      "enable narrowing.",
    concept: "literal-discriminator",
    difficulty: 2,
  },

  {
    id: "L12-D2",
    title: "Destructuring breaks narrowing",
    buggyCode: [
      "type Shape =",
      '  | { kind: "circle"; radius: number }',
      '  | { kind: "rect"; width: number; height: number };',
      "",
      "function area(shape: Shape): number {",
      "  const { kind } = shape;",
      '  if (kind === "circle") {',
      "    return Math.PI * shape.radius ** 2;  // Error!",
      "  }",
      "  return shape.width * shape.height;  // Error!",
      "}",
    ].join("\n"),
    errorMessage: "Property 'radius' does not exist on type 'Shape'.",
    bugType: "type-error",
    bugLine: 6,
    options: [
      "Destructuring breaks the connection — shape is not narrowed",
      "kind must be const",
      "switch is required with Discriminated Unions",
      "Shape has a typo",
    ],
    correctOption: 0,
    hints: [
      "What happens when you destructure kind into a separate variable?",
      "TypeScript loses the connection between the variable 'kind' and 'shape'.",
      "Solution: Check shape.kind directly instead of destructuring.",
    ],
    fixedCode: [
      "function area(shape: Shape): number {",
      "  // Check shape.kind directly — no destructuring!",
      '  if (shape.kind === "circle") {',
      "    return Math.PI * shape.radius ** 2;  // OK!",
      "  }",
      "  return shape.width * shape.height;  // OK!",
      "}",
    ].join("\n"),
    explanation:
      "Destructuring separates the value from the object. TypeScript cannot " +
      "trace a separate variable back to the original object. " +
      "Solution: Always check shape.kind directly.",
    concept: "destructuring-narrowing",
    difficulty: 3,
  },

  {
    id: "L12-D3",
    title: "Missing Exhaustive Check",
    buggyCode: [
      "type Status = ",
      '  | { type: "active"; since: Date }',
      '  | { type: "inactive"; reason: string }',
      '  | { type: "banned"; until: Date };',
      "",
      "function statusText(status: Status): string {",
      "  switch (status.type) {",
      '    case "active": return `Active since ${status.since}`;',
      '    case "inactive": return `Inactive: ${status.reason}`;',
      "    // 'banned' is missing!",
      "  }",
      "  // No assertNever — the compiler does not warn clearly",
      "}",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 10,
    options: [
      "The case 'banned' is missing and there is no exhaustive check with assertNever",
      "switch does not work with Discriminated Unions",
      "Status needs a default variant",
      "statusText must return void",
    ],
    correctOption: 0,
    hints: [
      "What happens when status.type === 'banned'?",
      "Without assertNever, TypeScript does not give a clear warning for missing cases.",
      "Add assertNever in the default branch — then the compiler flags the missing case.",
    ],
    fixedCode: [
      "function assertNever(value: never): never {",
      '  throw new Error(`Unhandled: ${JSON.stringify(value)}`);',
      "}",
      "",
      "function statusText(status: Status): string {",
      "  switch (status.type) {",
      '    case "active": return `Active since ${status.since}`;',
      '    case "inactive": return `Inactive: ${status.reason}`;',
      '    case "banned": return `Banned until ${status.until}`;',
      "    default: return assertNever(status);",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "Without assertNever, TypeScript does not always clearly flag the missing case. " +
      "With assertNever in the default branch, you get a " +
      "clear compile error that names the missing type.",
    concept: "exhaustive-check",
    difficulty: 2,
  },

  {
    id: "L12-D4",
    title: "Impossible state through booleans",
    buggyCode: [
      "type FormState = {",
      "  isSubmitting: boolean;",
      "  isSuccess: boolean;",
      "  isError: boolean;",
      "  data: string | null;",
      "  error: string | null;",
      "};",
      "",
      "// Bug: This state should be impossible!",
      "const bug: FormState = {",
      "  isSubmitting: true,",
      "  isSuccess: true,   // Loading AND success at the same time?!",
      "  isError: true,     // AND error?!",
      "  data: 'result',    // AND data?!",
      "  error: 'oops',     // AND error message?!",
      "};",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 1,
    options: [
      "Booleans allow impossible state combinations — use a Discriminated Union instead",
      "isSubmitting must be readonly",
      "FormState needs validation",
      "null checks are missing",
    ],
    correctOption: 0,
    hints: [
      "How many combinations does this structure allow?",
      "2^3 * 2 * 2 = 32 possible states — most of them nonsensical.",
      'Model with a Discriminated Union: { status: "idle" | "submitting" | "success" | "error"; ... }',
    ],
    fixedCode: [
      "type FormState =",
      '  | { status: "idle" }',
      '  | { status: "submitting" }',
      '  | { status: "success"; data: string }',
      '  | { status: "error"; error: string };',
      "",
      "// Now only valid states are representable!",
    ].join("\n"),
    explanation:
      "Boolean flags allow nonsensical combinations (submitting + success + error). " +
      "With a Discriminated Union, each state has exactly the properties " +
      "that make sense for it. 'Make impossible states impossible.'",
    concept: "impossible-states",
    difficulty: 3,
  },

  {
    id: "L12-D5",
    title: "Result<T, E> without type check",
    buggyCode: [
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };",
      "",
      "function divide(a: number, b: number): Result<number, string> {",
      "  if (b === 0) return { ok: false, error: 'Division by 0' };",
      "  return { ok: true, value: a / b };",
      "}",
      "",
      "const result = divide(10, 0);",
      "console.log(result.value);  // Error! value does not exist on the error case",
    ].join("\n"),
    errorMessage: "Property 'value' does not exist on type '{ ok: false; error: string }'.",
    bugType: "type-error",
    bugLine: 9,
    options: [
      "You must check result.ok before accessing result.value",
      "divide must use try/catch",
      "Result always needs both properties",
      "const result must specify the type",
    ],
    correctOption: 0,
    hints: [
      "What type does result have after divide(10, 0)?",
      "result is Result<number, string> — it could be ok or error.",
      "Solution: if (result.ok) { result.value } else { result.error }",
    ],
    fixedCode: [
      "const result = divide(10, 0);",
      "if (result.ok) {",
      "  console.log(result.value);  // Safe — TypeScript has narrowed",
      "} else {",
      "  console.log(result.error);  // Safe — the error case",
      "}",
    ].join("\n"),
    explanation:
      "Result<T, E> enforces checking the discriminator 'ok'. " +
      "Without the check, TypeScript does not know whether value or error exists. " +
      "That is the whole point of Result — enforced error handling.",
    concept: "result-narrowing",
    difficulty: 2,
  },
];