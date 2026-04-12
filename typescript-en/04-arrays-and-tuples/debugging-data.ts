```typescript
/**
 * Lesson 04 — Debugging Challenges: Arrays & Tuples
 *
 * 5 challenges on filter without predicate, covariance bug, spread loses tuple,
 * array out-of-bounds, readonly mutation.
 * Focus: Array type system gaps and tuple quirks.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: filter mit komplexer Bedingung ohne Type Predicate ────
  {
    id: "L04-D1",
    title: "filter() with complex condition doesn't narrow",
    buggyCode: [
      "const values: (string | null)[] = ['hello', null, '', 'world', null];",
      "",
      "const strings = values.filter(v => v !== null && v.length > 0);",
      "",
      "// Expected: string[], actual: (string | null)[]",
      "strings.forEach(s => {",
      "  console.log(s.toUpperCase());",
      "});",
    ].join("\n"),
    errorMessage:
      "Property 'toUpperCase' does not exist on type 'string | null'.",
    bugType: "type-error",
    bugLine: 3,
    options: [
      "filter() with a complex condition doesn't narrow the type — it needs an explicit type predicate",
      "typeof cannot be used in arrow functions",
      "forEach doesn't work on filtered arrays",
      "The callback must return 'true' or 'false', not a boolean expression",
    ],
    correctOption: 0,
    hints: [
      "What type does 'strings' have after the filter?",
      "As of TS 5.5, filter() infers type predicates for SIMPLE checks (e.g. v !== null). " +
        "But for COMPLEX conditions (v !== null && v.length > 0), this doesn't apply.",
      "Solution: .filter((v): v is string => v !== null && v.length > 0)",
    ],
    fixedCode: [
      "const values: (string | null)[] = ['hello', null, '', 'world', null];",
      "",
      "const strings = values.filter((v): v is string => v !== null && v.length > 0);",
      "",
      "// Now strings is: string[]",
      "strings.forEach(s => {",
      "  console.log(s.toUpperCase());",
      "});",
    ].join("\n"),
    explanation:
      "As of TypeScript 5.5, filter() can automatically infer type predicates for simple checks (e.g. `v !== null`). " +
      "BUT for more complex conditions like `v !== null && v.length > 0`, automatic inference doesn't apply. " +
      "An explicit type predicate ((v): v is string => ...) is still needed " +
      "to narrow the type.",
    concept: "type-predicate-filter",
    difficulty: 3,
  },

  // ─── Challenge 2: Array-Kovarianz-Bug ───────────────────────────────────
  {
    id: "L04-D2",
    title: "Array covariance allows unsafe assignment",
    buggyCode: [
      "const strings: string[] = ['hello', 'world'];",
      "const values: (string | number)[] = strings;",
      "",
      "values.push(42);",
      "",
      '// strings now contains ["hello", "world", 42]',
      "console.log(strings[2].toUpperCase());",
    ].join("\n"),
    errorMessage: "TypeError: strings[2].toUpperCase is not a function",
    bugType: "soundness-hole",
    bugLine: 2,
    options: [
      "string[] is assignable to (string | number)[] — this is a soundness hole",
      "push() doesn't work on assigned arrays",
      "strings[2] doesn't exist and returns null",
      "toUpperCase is not a valid string method",
    ],
    correctOption: 0,
    hints: [
      "Both variables point to the same array in memory — it is not copied.",
      "TypeScript allows the assignment string[] -> (string | number)[] " +
        "(covariance), even though this is unsafe.",
      "Through 'values', a number can be pushed, which then also ends up in 'strings'.",
    ],
    fixedCode: [
      "const strings: readonly string[] = ['hello', 'world'];",
      "const values: readonly (string | number)[] = strings;",
      "",
      "// values.push(42); // Error: Property 'push' does not exist on readonly",
      "",
      "// If mutation is needed: create a copy",
      "const mutableValues: (string | number)[] = [...strings];",
      "mutableValues.push(42); // Safe: own array",
    ].join("\n"),
    explanation:
      "TypeScript treats arrays covariantly: string[] is assignable to (string | number)[]. " +
      "Since both variables point to the same array, a number can be inserted via " +
      "'values' that then becomes visible in 'strings' as well. " +
      "This is a known soundness hole in TypeScript. Solution: use readonly " +
      "arrays or explicitly copy with spread.",
    concept: "array-covariance",
    difficulty: 4,
  },

  // ─── Challenge 3: Spread verliert Tuple-Typ ─────────────────────────────
  {
    id: "L04-D3",
    title: "Spread operator loses tuple length",
    buggyCode: [
      "function getPoint(): [number, number] {",
      "  return [10, 20];",
      "}",
      "",
      "const coords = [...getPoint()];",
      "",
      "// Expected: [number, number]",
      "// Actual: number[]",
      "const [x, y] = coords;",
      "const z = coords[2]; // No error, even though out-of-bounds",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 5,
    options: [
      "Spread on a tuple produces number[] instead of [number, number]",
      "getPoint() doesn't return an array",
      "Destructuring doesn't work with spread results",
      "coords[2] throws a runtime error",
    ],
    correctOption: 0,
    hints: [
      "What type does [...tuple] have? Check with hover in the IDE.",
      "The spread operator on a tuple produces a regular array, " +
        "the tuple length information is lost.",
      "Solution: Assign directly without spread, or use 'as const'.",
    ],
    fixedCode: [
      "function getPoint(): [number, number] {",
      "  return [10, 20];",
      "}",
      "",
      "const coords: [number, number] = getPoint();",
      "",
      "const [x, y] = coords;",
      "// coords[2] would now produce an error:",
      "// Tuple type '[number, number]' of length '2' has no element at index '2'.",
    ].join("\n"),
    explanation:
      "The spread operator [...tuple] produces a new array with type " +
      "number[] — the tuple length information is lost. This means " +
      "TypeScript reports no error for coords[2], even though the element " +
      "doesn't exist. Solution: Assign the tuple directly (const coords = getPoint()) " +
      "or use an explicit tuple annotation.",
    concept: "tuple-spread",
    difficulty: 3,
  },

  // ─── Challenge 4: Array out-of-bounds ───────────────────────────────────
  {
    id: "L04-D4",
    title: "Array access out of bounds",
    buggyCode: [
      "const colors = ['red', 'green', 'blue'];",
      "",
      "function getColor(index: number): string {",
      "  return colors[index];",
      "}",
      "",
      "const color = getColor(5);",
      "console.log(color.toUpperCase()); // Runtime error!",
    ].join("\n"),
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
    bugType: "soundness-hole",
    bugLine: 4,
    options: [
      "Array access by index always returns the element type, even for an invalid index",
      "getColor needs a check whether index < colors.length",
      "colors must be declared with 'as const'",
      "The index must be a string, not a number",
    ],
    correctOption: 0,
    hints: [
      "What type does colors[5] have according to TypeScript?",
      "TypeScript says 'string', but at runtime it is undefined. " +
        "This is a known soundness hole.",
      "Solution: Enable noUncheckedIndexedAccess in tsconfig — then the " +
        "type becomes 'string | undefined'.",
    ],
    fixedCode: [
      '// tsconfig: { "compilerOptions": { "noUncheckedIndexedAccess": true } }',
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
      "By default, TypeScript returns the element type for array access " +
      "(here: string), without considering undefined — even when the index " +
      "is out of bounds. This is a soundness hole that can be fixed with the " +
      "tsconfig option 'noUncheckedIndexedAccess: true'. " +
      "Then every index access becomes T | undefined and requires a check.",
    concept: "unchecked-index-access",
    difficulty: 3,
  },

  // ─── Challenge 5: readonly ist shallow ──────────────────────────────────
  {
    id: "L04-D5",
    title: "readonly array with mutable elements",
    buggyCode: [
      "const users: readonly { name: string; age: number }[] = [",
      "  { name: 'Alice', age: 30 },",
      "  { name: 'Bob', age: 25 },",
      "];",
      "",
      "// users.push({...}); // Correct: Error",
      "users[0].age = 99; // Expected: Error, actual: OK!",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 7,
    options: [
      "readonly only protects the array (no push/pop), not the objects inside it",
      "readonly prevents all changes to elements",
      "users[0] returns a copy",
      "age is a primitive value and therefore always mutable",
    ],
    correctOption: 0,
    hints: [
      "What exactly does 'readonly' protect in an array?",
      "'readonly T[]' only prevents operations on the array itself " +
        "(push, pop, splice, assignment). The elements inside the array remain mutable.",
      "For deep readonly, you need: Readonly<{ name: string; age: number }>[] " +
        "or a recursive DeepReadonly type.",
    ],
    fixedCode: [
      "type User = Readonly<{ name: string; age: number }>;",
      "",
      "const users: readonly User[] = [",
      "  { name: 'Alice', age: 30 },",
      "  { name: 'Bob', age: 25 },",
      "];",
      "",
      "// users.push({...}); // Error: readonly array",
      "// users[0].age = 99; // Error: readonly property",
    ].join("\n"),
    explanation:
      "'readonly T[]' (or ReadonlyArray<T>) only protects the array structure: " +
      "no push, pop, splice, or index assignment. The objects inside the " +
      "array remain mutable. To also protect the elements, the element type " +
      "itself must be readonly: Readonly<T> for shallow objects, " +
      "or a recursive DeepReadonly type for nested structures.",
    concept: "readonly-shallow",
    difficulty: 3,
  },
];
```