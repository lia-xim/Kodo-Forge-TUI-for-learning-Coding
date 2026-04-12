/**
 * Lesson 06 — Completion Problems: Functions
 *
 * 6 code templates with strategic blanks (______).
 * Faded Worked Examples for function types, overloads,
 * callbacks, type guards, and currying.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Function Type Expression (easy) ──────────────────────────────
  {
    id: "06-cp-function-type",
    title: "Defining a Function Type Expression",
    description:
      "Define a function type and use it as a parameter type.",
    template: `// Define the type for a comparison function
type Comparator = (a: ______, b: ______) => ______;

function sortArray(items: number[], compare: ______): number[] {
  return [...items].sort(compare);
}

const ascending: Comparator = (a, b) => a - b;
const result = sortArray([3, 1, 2], ascending);`,
    solution: `type Comparator = (a: number, b: number) => number;

function sortArray(items: number[], compare: Comparator): number[] {
  return [...items].sort(compare);
}

const ascending: Comparator = (a, b) => a - b;
const result = sortArray([3, 1, 2], ascending);`,
    blanks: [
      { placeholder: "______", answer: "number", hint: "What type are the values being compared?" },
      { placeholder: "______", answer: "number", hint: "Both parameters have the same type." },
      { placeholder: "______", answer: "number", hint: "sort() expects a number: negative, 0, or positive." },
      { placeholder: "______", answer: "Comparator", hint: "Use the type alias you just defined." },
    ],
    concept: "Function Type Expressions",
  },

  // ─── 2: Options Object Pattern (easy-medium) ─────────────────────────
  {
    id: "06-cp-options-object",
    title: "Options Object Pattern with Defaults",
    description:
      "Create a function using the options object pattern. " +
      "Use destructuring and default values.",
    template: `interface FetchOptions {
  url: string;
  method______ "GET" | "POST";
  timeout______ number;
}

function fetchData({
  url,
  method ______ "GET",
  timeout ______ 5000,
}: FetchOptions): void {
  console.log(\`\${method} \${url} (timeout: \${timeout}ms)\`);
}

fetchData({ url: "https://api.example.com" });`,
    solution: `interface FetchOptions {
  url: string;
  method?: "GET" | "POST";
  timeout?: number;
}

function fetchData({
  url,
  method = "GET",
  timeout = 5000,
}: FetchOptions): void {
  console.log(\`\${method} \${url} (timeout: \${timeout}ms)\`);
}

fetchData({ url: "https://api.example.com" });`,
    blanks: [
      { placeholder: "______", answer: "?:", hint: "What character do optional properties in an interface need before the colon?" },
      { placeholder: "______", answer: "?:", hint: "timeout should also be optional." },
      { placeholder: "______", answer: "=", hint: "What operator assigns default values in destructuring?" },
      { placeholder: "______", answer: "=", hint: "Same syntax as the method default." },
    ],
    concept: "Options Object Pattern / Destructuring / Default Values",
  },

  // ─── 3: Function Overload (medium) ───────────────────────────────────
  {
    id: "06-cp-overload",
    title: "Writing a Function Overload",
    description:
      "Write overload signatures for a function that returns a different " +
      "output type depending on the input type.",
    template: `// Overload 1: string in -> string out
function double(x: ______): ______;
// Overload 2: number in -> number out
function double(x: ______): ______;
// Implementation:
function double(x: string | number): string | number {
  if (typeof x === "string") {
    return x + x;
  }
  return x * 2;
}

const a = double("ha");  // Type: string -> "haha"
const b = double(21);    // Type: number -> 42`,
    solution: `function double(x: string): string;
function double(x: number): number;
function double(x: string | number): string | number {
  if (typeof x === "string") {
    return x + x;
  }
  return x * 2;
}

const a = double("ha");  // Type: string -> "haha"
const b = double(21);    // Type: number -> 42`,
    blanks: [
      { placeholder: "______", answer: "string", hint: "First overload: What is the input type?" },
      { placeholder: "______", answer: "string", hint: "First overload: What is the output type for string input?" },
      { placeholder: "______", answer: "number", hint: "Second overload: What is the input type?" },
      { placeholder: "______", answer: "number", hint: "Second overload: What is the output type for number input?" },
    ],
    concept: "Function Overloads",
  },

  // ─── 4: Type Guard (medium) ──────────────────────────────────────────
  {
    id: "06-cp-type-guard",
    title: "Writing a Custom Type Guard",
    description:
      "Write a type guard that checks whether a value is a User.",
    template: `interface User {
  name: string;
  email: string;
}

function isUser(value: unknown): ______ {
  return (
    typeof value === "______" &&
    value !== null &&
    "name" ______ value &&
    "email" ______ value
  );
}

function greet(data: unknown) {
  if (isUser(data)) {
    console.log(\`Hallo \${data.name}\`); // TypeScript knows: data is User
  }
}`,
    solution: `interface User {
  name: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value
  );
}

function greet(data: unknown) {
  if (isUser(data)) {
    console.log(\`Hallo \${data.name}\`);
  }
}`,
    blanks: [
      { placeholder: "______", answer: "value is User", hint: "Type guard return type: 'value is ...' — which type?" },
      { placeholder: "______", answer: "object", hint: "typeof checks whether the value is an object." },
      { placeholder: "______", answer: "in", hint: "Which operator checks whether a property exists in an object?" },
      { placeholder: "______", answer: "in", hint: "Same operator for the second property." },
    ],
    concept: "Type Guards / value is Type",
  },

  // ─── 5: Generic Callback (medium-hard) ───────────────────────────────
  {
    id: "06-cp-generic-callback",
    title: "Generic Callback Type",
    description:
      "Define a generic Mapper type and use it " +
      "in a mapArray function.",
    template: `type Mapper<______, ______> = (item: T, index: number) => U;

function mapArray<T, U>(items: ______[], mapper: Mapper<______, ______)): U[] {
  return items.map((item, index) => mapper(item, index));
}

const lengths = mapArray(["hallo", "welt"], (s) => s.length);
// lengths: number[]`,
    solution: `type Mapper<T, U> = (item: T, index: number) => U;

function mapArray<T, U>(items: T[], mapper: Mapper<T, U>): U[] {
  return items.map((item, index) => mapper(item, index));
}

const lengths = mapArray(["hallo", "welt"], (s) => s.length);
// lengths: number[]`,
    blanks: [
      { placeholder: "______", answer: "T", hint: "First generic parameter: input type." },
      { placeholder: "______", answer: "U", hint: "Second generic parameter: output type." },
      { placeholder: "______", answer: "T", hint: "The array contains elements of the input type." },
      { placeholder: "______", answer: "T", hint: "Mapper receives the input type as the first generic." },
      { placeholder: "______", answer: "U", hint: "Mapper returns the output type as the second generic." },
    ],
    concept: "Generics / Callbacks / Type Inference",
  },

  // ─── 6: Currying Pattern (hard) ──────────────────────────────────────
  {
    id: "06-cp-currying",
    title: "Writing a Currying Function",
    description:
      "Write a currying function that separates configuration from execution.",
    template: `function createGreeter(greeting: string): ______ {
  return (name______) ______ \`\${greeting}, \${name}!\`;
}

const hallo = createGreeter("Hallo");
// hallo has the type: (name: string) => string

console.log(hallo("Max"));   // "Hallo, Max!"
console.log(hallo("Anna"));  // "Hallo, Anna!"`,
    solution: `function createGreeter(greeting: string): (name: string) => string {
  return (name: string) => \`\${greeting}, \${name}!\`;
}

const hallo = createGreeter("Hallo");
console.log(hallo("Max"));   // "Hallo, Max!"
console.log(hallo("Anna"));  // "Hallo, Anna!"`,
    blanks: [
      { placeholder: "______", answer: "(name: string) => string", hint: "What is the return type? A function that takes a string and returns a string." },
      { placeholder: "______", answer: ": string", hint: "The inner function's parameter needs a type annotation." },
      { placeholder: "______", answer: "=>", hint: "Arrow function syntax: (param) => expression" },
    ],
    concept: "Currying / Higher-Order Functions",
  },
];