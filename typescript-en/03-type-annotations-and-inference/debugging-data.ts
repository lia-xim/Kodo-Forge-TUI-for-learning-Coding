```typescript
/**
 * Lektion 03 — Debugging Challenges: Type Annotations & Inference
 *
 * 5 Challenges zu Object.keys, leeres Array, Callback-Context,
 * satisfies-Verwechslung, Generic Inference.
 * Fokus: Inference-Grenzen und Type-System-Eigenheiten.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: Object.keys gibt string[] zurueck ─────────────────────
  {
    id: "L03-D1",
    title: "Object.keys returns string[], not keyof T",
    buggyCode: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "  debug: boolean;",
      "}",
      "",
      "const config: Config = { host: 'localhost', port: 3000, debug: true };",
      "",
      "Object.keys(config).forEach(key => {",
      "  console.log(config[key]);",
      "});",
    ].join("\n"),
    errorMessage:
      "Element implicitly has an 'any' type because expression of type " +
      "'string' can't be used to index type 'Config'.",
    bugType: "type-error",
    bugLine: 10,
    options: [
      "Object.keys() returns string[], not (keyof Config)[]",
      "forEach cannot be called on arrays",
      "config needs an index signature",
      "key must be declared as 'any'",
    ],
    correctOption: 0,
    hints: [
      "What type does Object.keys(config) have?",
      "Object.keys ALWAYS returns string[] — TypeScript cannot guarantee " +
        "that an object has no additional properties.",
      "Solution: Explicit cast with (key as keyof Config) or " +
        "a type-safe helper function.",
    ],
    fixedCode: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "  debug: boolean;",
      "}",
      "",
      "const config: Config = { host: 'localhost', port: 3000, debug: true };",
      "",
      "(Object.keys(config) as (keyof Config)[]).forEach(key => {",
      "  console.log(config[key]);",
      "});",
    ].join("\n"),
    explanation:
      "Object.keys() always returns string[], not (keyof T)[]. This is " +
      "intentional: TypeScript uses structural typing, so an object can have " +
      "more properties than its interface declares. " +
      "If Object.keys returned the type (keyof Config)[], that would be unsound. " +
      "Solution: Explicit cast when you are sure, or a for-in loop with narrowing.",
    concept: "object-keys-typing",
    difficulty: 3,
  },

  // ─── Challenge 2: Leeres Array wird zu never[] ──────────────────────────
  {
    id: "L03-D2",
    title: "Empty array becomes never[]",
    buggyCode: [
      "const items = [];",
      "",
      "function addItem(item: string) {",
      "  items.push(item);",
      "}",
      "",
      "addItem('hello');",
    ].join("\n"),
    errorMessage:
      "Argument of type 'string' is not assignable to parameter of type 'never'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "An empty array without type annotation is inferred as never[]",
      "push() does not accept strings",
      "const arrays cannot be modified",
      "items must be declared with 'let'",
    ],
    correctOption: 0,
    hints: [
      "What type does an empty array literal [] have without annotation?",
      "TypeScript infers [] as never[] when the type cannot be derived from context. " +
        "never[] means: 'array that can never contain elements'.",
      "Solution: Explicit annotation const items: string[] = [];",
    ],
    fixedCode: [
      "const items: string[] = [];",
      "",
      "function addItem(item: string) {",
      "  items.push(item);",
      "}",
      "",
      "addItem('hello');",
    ].join("\n"),
    explanation:
      "When TypeScript sees an empty array literal and cannot infer the type " +
      "from context, it infers never[] — an array that can never contain elements. " +
      "This causes push() with 'string' to fail because string is not assignable to never. " +
      "Solution: Always provide an explicit type annotation for empty arrays.",
    concept: "never-inference",
    difficulty: 2,
  },

  // ─── Challenge 3: Callback verliert this-Context ────────────────────────
  {
    id: "L03-D3",
    title: "Callback loses this context",
    buggyCode: [
      "class Counter {",
      "  count = 0;",
      "",
      "  increment() {",
      "    this.count++;",
      "  }",
      "",
      "  startTimer() {",
      "    setInterval(this.increment, 1000);",
      "  }",
      "}",
      "",
      "const c = new Counter();",
      "c.startTimer(); // count stays 0 or TypeError",
    ].join("\n"),
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'count')",
    bugType: "runtime-error",
    bugLine: 9,
    options: [
      "setInterval does not expect a method reference",
      "this.increment loses the this context when passed as a callback",
      "setInterval needs a time value in seconds, not milliseconds",
      "count must be declared as static",
    ],
    correctOption: 1,
    hints: [
      "What is 'this' inside increment when it is called as a callback?",
      "In JavaScript, 'this' is determined at call time, not at definition time. " +
        "When increment is passed as a callback, this is no longer the Counter instance.",
      "Solution: Use an arrow function to bind 'this': " +
        "setInterval(() => this.increment(), 1000) or increment as an arrow property.",
    ],
    fixedCode: [
      "class Counter {",
      "  count = 0;",
      "",
      "  increment = () => {",
      "    this.count++;",
      "  };",
      "",
      "  startTimer() {",
      "    setInterval(this.increment, 1000);",
      "  }",
      "}",
      "",
      "const c = new Counter();",
      "c.startTimer(); // count increments",
    ].join("\n"),
    explanation:
      "When a method is passed as a callback (this.increment without ()), " +
      "it loses its this context. With setInterval, increment is called with " +
      "this === undefined (strict mode) or this === window. " +
      "TypeScript does NOT detect this problem by default. " +
      "Solutions: (1) Arrow function as property (increment = () => {...}), " +
      "(2) Wrapper: setInterval(() => this.increment(), 1000), " +
      "(3) .bind(this) in the constructor.",
    concept: "this-context",
    difficulty: 3,
  },

  // ─── Challenge 4: satisfies vs as Verwechslung ──────────────────────────
  {
    id: "L03-D4",
    title: "satisfies vs as — wrong operator",
    buggyCode: [
      "type Theme = {",
      "  primary: string;",
      "  secondary: string;",
      "};",
      "",
      "const theme = {",
      "  primary: '#ff0000',",
      "  secondary: '#00ff00',",
      "  accent: '#0000ff',",
      "} as Theme;",
      "",
      "// Expected: error because of 'accent' (not in Theme)",
      "// Actually: no error, accent is silently removed",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 10,
    options: [
      "'as Theme' is a type assertion — it suppresses excess property checks",
      "The object has too few properties for Theme",
      "'accent' is a reserved word",
      "Color strings must be written without #",
    ],
    correctOption: 0,
    hints: [
      "What is the difference between 'as Theme' and 'satisfies Theme'?",
      "'as' is an assertion: 'I know better than the compiler'. " +
        "'satisfies' is a validation: 'Check whether it matches, but preserve the type'.",
      "With 'satisfies', TypeScript would report the extra property 'accent'.",
    ],
    fixedCode: [
      "type Theme = {",
      "  primary: string;",
      "  secondary: string;",
      "};",
      "",
      "const theme = {",
      "  primary: '#ff0000',",
      "  secondary: '#00ff00',",
      "} satisfies Theme;",
      "",
      "// satisfies checks the type AND preserves the literal type",
    ].join("\n"),
    explanation:
      "'as Theme' is a type assertion — it tells the compiler 'treat this object as Theme'. " +
      "This bypasses excess property checks, and the extra property 'accent' is ignored by the type system. " +
      "'satisfies Theme', on the other hand, CHECKS whether the object conforms to Theme and reports " +
      "extra properties as errors. Additionally, satisfies preserves the precise literal type of the object.",
    concept: "satisfies-vs-as",
    difficulty: 3,
  },

  // ─── Challenge 5: Inference bei ueberladenen Funktionen ─────────────────
  {
    id: "L03-D5",
    title: "Generic inference with nested calls",
    buggyCode: [
      "function first<T>(arr: T[]): T {",
      "  return arr[0];",
      "}",
      "",
      "function wrap<U>(value: U): { data: U } {",
      "  return { data: value };",
      "}",
      "",
      "const result = wrap(first([]));",
      "// result.data is never — not undefined",
      "console.log(result.data.toUpperCase());",
    ].join("\n"),
    errorMessage: "Property 'toUpperCase' does not exist on type 'never'.",
    bugType: "type-error",
    bugLine: 9,
    options: [
      "first([]) infers T as never, and wrap propagates the never type further",
      "wrap() cannot have function calls as arguments",
      "first() must be called before wrap()",
      "result.data is always undefined",
    ],
    correctOption: 0,
    hints: [
      "What type does TypeScript infer for first([])?",
      "An empty array [] has the type never[]. So T becomes never.",
      "never propagates through generics: wrap(never) results in { data: never }.",
    ],
    fixedCode: [
      "function first<T>(arr: T[]): T | undefined {",
      "  return arr[0];",
      "}",
      "",
      "function wrap<U>(value: U): { data: U } {",
      "  return { data: value };",
      "}",
      "",
      "const result = wrap(first<string>([]));",
      "// result.data is string | undefined",
      "if (result.data) {",
      "  console.log(result.data.toUpperCase());",
      "}",
    ].join("\n"),
    explanation:
      "first([]) infers T as never, because an empty array has the type never[]. " +
      "This never type propagates through wrap(): result is { data: never }. " +
      "You cannot call methods on never. Solutions: (1) Explicit type argument: first<string>([]), " +
      "(2) Return type T | undefined for first(), which is more realistic since arr[0] " +
      "returns undefined for an empty array.",
    concept: "never-propagation",
    difficulty: 4,
  },
];
```