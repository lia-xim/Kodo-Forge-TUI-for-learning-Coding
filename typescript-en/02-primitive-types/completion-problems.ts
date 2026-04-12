/**
 * Lesson 02 — Completion Problems: Primitive Types
 *
 * Code templates with strategic blanks (______).
 * The learner fills in the blanks — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code with ______ as placeholder for blanks */
  template: string;
  /** Solution with filled blanks */
  solution: string;
  /** Which blank has which answer */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Related concept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Null-safe Function (easy) ───────────────────────────────────────
  {
    id: "02-cp-null-safe",
    title: "Null-safe String Function",
    description:
      "Write a function that returns the length of a string. " +
      "The string can be null or undefined — handle both cases.",
    template: `function safeLength(text: string | ______ | ______): number {
  if (text ______ null || text ______ undefined) {
    return 0;
  }
  return text.length;
}

console.log(safeLength("Hello")); // 5
console.log(safeLength(null));     // 0
console.log(safeLength(undefined));// 0`,
    solution: `function safeLength(text: string | null | undefined): number {
  if (text === null || text === undefined) {
    return 0;
  }
  return text.length;
}

console.log(safeLength("Hello")); // 5
console.log(safeLength(null));     // 0
console.log(safeLength(undefined));// 0`,
    blanks: [
      {
        placeholder: "______",
        answer: "null",
        hint: "Which type represents 'intentionally empty'?",
      },
      {
        placeholder: "______",
        answer: "undefined",
        hint: "Which type represents 'was never set'?",
      },
      {
        placeholder: "______",
        answer: "===",
        hint: "Which comparison operator checks for exact equality (without type conversion)?",
      },
      {
        placeholder: "______",
        answer: "===",
        hint: "Same operator as before — always use strict equality.",
      },
    ],
    concept: "null / undefined / strictNullChecks",
  },

  // ─── 2: Safe Handling of unknown (easy-medium) ──────────────────────────
  {
    id: "02-cp-unknown-narrowing",
    title: "Using unknown Safely",
    description:
      "A function receives an unknown value. Use Type Narrowing " +
      "to process the value safely.",
    template: `function processValue(value: ______) {
  if (______ value === "string") {
    // TypeScript knows: value is string
    console.log("String:", value.toUpperCase());
  } else if (typeof value === "______") {
    // TypeScript knows: value is number
    console.log("Number:", value.toFixed(2));
  } else {
    console.log("Other type:", value);
  }
}

processValue("hallo");  // String: HALLO
processValue(3.14159);  // Number: 3.14
processValue(true);     // Other type: true`,
    solution: `function processValue(value: unknown) {
  if (typeof value === "string") {
    // TypeScript knows: value is string
    console.log("String:", value.toUpperCase());
  } else if (typeof value === "number") {
    // TypeScript knows: value is number
    console.log("Number:", value.toFixed(2));
  } else {
    console.log("Other type:", value);
  }
}

processValue("hallo");  // String: HALLO
processValue(3.14159);  // Number: 3.14
processValue(true);     // Other type: true`,
    blanks: [
      {
        placeholder: "______",
        answer: "unknown",
        hint: "Which type is the safe alternative to 'any'?",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Which operator checks the runtime type and enables Type Narrowing?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "What is the typeof value for numbers?",
      },
    ],
    concept: "unknown / Type Narrowing / typeof",
  },

  // ─── 3: never for Exhaustive Checks (medium) ────────────────────────────
  {
    id: "02-cp-exhaustive-check",
    title: "Exhaustive Check with never",
    description:
      "Use the never type to ensure that all cases " +
      "of a union type are handled. When a new case is added, " +
      "TypeScript automatically produces an error.",
    template: `type TrafficLight = "red" | "yellow" | "green";

function getAction(light: TrafficLight): string {
  switch (light) {
    case "red":
      return "Stop!";
    case "yellow":
      return "Caution!";
    case "green":
      return "Go!";
    default:
      // When all cases are covered, light is 'never' here.
      // This pattern produces a compile error when a
      // new value is added to the union:
      const _exhaustive: ______ = light;
      return _exhaustive;
  }
}

// Error-throwing helper function:
function assertNever(value: ______): ______ {
  throw new Error(\`Unexpected value: \${value}\`);
}`,
    solution: `type TrafficLight = "red" | "yellow" | "green";

function getAction(light: TrafficLight): string {
  switch (light) {
    case "red":
      return "Stop!";
    case "yellow":
      return "Caution!";
    case "green":
      return "Go!";
    default:
      const _exhaustive: never = light;
      return _exhaustive;
  }
}

function assertNever(value: never): never {
  throw new Error(\`Unexpected value: \${value}\`);
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "never",
        hint: "Which type represents 'can never occur'?",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "The parameter has the same type — it should NEVER receive a real value.",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "What return type does a function have that ALWAYS throws an error?",
      },
    ],
    concept: "never / Exhaustive Checks / Union Types",
  },

  // ─── 4: Using Nullish Coalescing Correctly (medium) ─────────────────────
  {
    id: "02-cp-nullish-coalescing",
    title: "Nullish Coalescing vs. Logical OR",
    description:
      "Replace the incorrect ||-operator with the correct " +
      "operator, so that 0, '' and false are recognized as valid values.",
    template: `interface UserSettings {
  volume: number;       // 0 is valid (muted)
  nickname: string;     // "" is valid (no nickname)
  darkMode: boolean;    // false is valid
}

function applySettings(settings: Partial<UserSettings>) {
  // WRONG: || treats 0, "" and false as "missing"
  // const volume = settings.volume || 50;

  // CORRECT: Only treat null and undefined as "missing"
  const volume = settings.volume ______ 50;
  const nickname = settings.nickname ______ "Anonymous";
  const darkMode = settings.darkMode ______ true;

  console.log({ volume, nickname, darkMode });
}

// Test: All values are set (including the "falsy" values)
applySettings({ volume: 0, nickname: "", darkMode: false });
// Expected: { volume: 0, nickname: "", darkMode: false }`,
    solution: `interface UserSettings {
  volume: number;
  nickname: string;
  darkMode: boolean;
}

function applySettings(settings: Partial<UserSettings>) {
  const volume = settings.volume ?? 50;
  const nickname = settings.nickname ?? "Anonymous";
  const darkMode = settings.darkMode ?? true;

  console.log({ volume, nickname, darkMode });
}

applySettings({ volume: 0, nickname: "", darkMode: false });
// Result: { volume: 0, nickname: "", darkMode: false }`,
    blanks: [
      {
        placeholder: "______",
        answer: "??",
        hint: "Which operator checks ONLY for null/undefined (not for falsy)?",
      },
      {
        placeholder: "______",
        answer: "??",
        hint: "Same operator — use consistently for all defaults.",
      },
      {
        placeholder: "______",
        answer: "??",
        hint: "Same operator — so that false is not treated as 'missing'.",
      },
    ],
    concept: "Nullish Coalescing (??) vs. Logical OR (||)",
  },

  // ─── 5: Applying the Type Hierarchy (medium-hard) ───────────────────────
  {
    id: "02-cp-type-hierarchy",
    title: "Understanding the Type Hierarchy",
    description:
      "Insert the correct types based on the TypeScript type hierarchy. " +
      "unknown is the Top Type, never is the Bottom Type.",
    template: `// unknown is the Top Type: EVERYTHING is assignable to unknown
let top: ______ = "hello";
top = 42;
top = true;
top = null;
top = undefined;

// never is the Bottom Type: never is assignable to EVERYTHING
function impossible(): ______ {
  throw new Error("Impossible!");
}

let str: string = impossible();  // OK: never is assignable to string
let num: number = impossible();  // OK: never is assignable to number

// any breaks the rules: It is NOT a Top/Bottom Type
let unsicher: ______ = "hello";
let zahl: number = unsicher;  // OK (unsafe!) — any bypasses the check`,
    solution: `let top: unknown = "hello";
top = 42;
top = true;
top = null;
top = undefined;

function impossible(): never {
  throw new Error("Impossible!");
}

let str: string = impossible();
let num: number = impossible();

let unsicher: any = "hello";
let zahl: number = unsicher;`,
    blanks: [
      {
        placeholder: "______",
        answer: "unknown",
        hint: "Which type is the Top Type that EVERYTHING is assignable to?",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "Which type is the Bottom Type that is assignable to EVERYTHING and means 'never returns'?",
      },
      {
        placeholder: "______",
        answer: "any",
        hint: "Which type 'breaks the rules' and bypasses all checks?",
      },
    ],
    concept: "Type Hierarchy / unknown / never / any",
  },

  // ─── 6: as const and Literal Types (hard) ───────────────────────────────
  {
    id: "02-cp-as-const",
    title: "as const for Type-Safe Configuration",
    description:
      "Use as const to create a configuration with literal types. " +
      "Then derive a union type from the values.",
    template: `const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] ______ ______;
// Type: readonly ["GET", "POST", "PUT", "DELETE"]

// Derive a Union Type from the array values:
type HttpMethod = ______ HTTP_METHODS[______];
// Result: "GET" | "POST" | "PUT" | "DELETE"

function sendRequest(method: HttpMethod, url: string) {
  console.log(\`\${method} \${url}\`);
}

sendRequest("GET", "/api/users");     // OK
// sendRequest("PATCH", "/api/users"); // Error! "PATCH" is not allowed`,
    solution: `const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
// Type: readonly ["GET", "POST", "PUT", "DELETE"]

type HttpMethod = typeof HTTP_METHODS[number];
// Result: "GET" | "POST" | "PUT" | "DELETE"

function sendRequest(method: HttpMethod, url: string) {
  console.log(\`\${method} \${url}\`);
}

sendRequest("GET", "/api/users");     // OK
// sendRequest("PATCH", "/api/users"); // Error! "PATCH" is not allowed`,
    blanks: [
      {
        placeholder: "______",
        answer: "as",
        hint: "First part of the keyword for constant assertions (... _____ const).",
      },
      {
        placeholder: "______",
        answer: "const",
        hint: "Second part: as _____",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Which operator extracts the TYPE from a variable?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "Which index type accesses ALL elements of a readonly array?",
      },
    ],
    concept: "as const / typeof / Literal Types / Index Access",
  },
];