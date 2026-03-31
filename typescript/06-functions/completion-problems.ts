/**
 * Lektion 06 — Completion Problems: Functions
 *
 * 6 Code-Templates mit strategischen Luecken (______).
 * Faded Worked Examples fuer Funktionstypen, Overloads,
 * Callbacks, Type Guards und Currying.
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
  // ─── 1: Function Type Expression (leicht) ─────────────────────────────
  {
    id: "06-cp-function-type",
    title: "Function Type Expression definieren",
    description:
      "Definiere einen Funktionstyp und verwende ihn als Parameter-Typ.",
    template: `// Definiere den Typ fuer eine Vergleichsfunktion
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
      { placeholder: "______", answer: "number", hint: "Welchen Typ haben die zu vergleichenden Werte?" },
      { placeholder: "______", answer: "number", hint: "Beide Parameter haben denselben Typ." },
      { placeholder: "______", answer: "number", hint: "sort() erwartet eine Zahl: negativ, 0 oder positiv." },
      { placeholder: "______", answer: "Comparator", hint: "Verwende den Typ-Alias den du gerade definiert hast." },
    ],
    concept: "Function Type Expressions",
  },

  // ─── 2: Options-Objekt-Pattern (leicht-mittel) ────────────────────────
  {
    id: "06-cp-options-object",
    title: "Options-Objekt-Pattern mit Defaults",
    description:
      "Erstelle eine Funktion mit dem Options-Objekt-Pattern. " +
      "Nutze Destructuring und Default-Werte.",
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
      { placeholder: "______", answer: "?:", hint: "Optionale Properties im Interface brauchen welches Zeichen vor dem Doppelpunkt?" },
      { placeholder: "______", answer: "?:", hint: "Auch timeout soll optional sein." },
      { placeholder: "______", answer: "=", hint: "Default-Werte in Destructuring werden mit welchem Operator zugewiesen?" },
      { placeholder: "______", answer: "=", hint: "Gleiche Syntax wie beim method-Default." },
    ],
    concept: "Options-Objekt-Pattern / Destructuring / Default-Werte",
  },

  // ─── 3: Function Overload (mittel) ────────────────────────────────────
  {
    id: "06-cp-overload",
    title: "Function Overload schreiben",
    description:
      "Schreibe Overload-Signaturen fuer eine Funktion die " +
      "je nach Input-Typ einen anderen Output-Typ hat.",
    template: `// Overload 1: string rein -> string raus
function double(x: ______): ______;
// Overload 2: number rein -> number raus
function double(x: ______): ______;
// Implementation:
function double(x: string | number): string | number {
  if (typeof x === "string") {
    return x + x;
  }
  return x * 2;
}

const a = double("ha");  // Typ: string -> "haha"
const b = double(21);    // Typ: number -> 42`,
    solution: `function double(x: string): string;
function double(x: number): number;
function double(x: string | number): string | number {
  if (typeof x === "string") {
    return x + x;
  }
  return x * 2;
}

const a = double("ha");  // Typ: string -> "haha"
const b = double(21);    // Typ: number -> 42`,
    blanks: [
      { placeholder: "______", answer: "string", hint: "Erster Overload: Was ist der Input-Typ?" },
      { placeholder: "______", answer: "string", hint: "Erster Overload: Was ist der Output-Typ bei String-Input?" },
      { placeholder: "______", answer: "number", hint: "Zweiter Overload: Was ist der Input-Typ?" },
      { placeholder: "______", answer: "number", hint: "Zweiter Overload: Was ist der Output-Typ bei Number-Input?" },
    ],
    concept: "Function Overloads",
  },

  // ─── 4: Type Guard (mittel) ───────────────────────────────────────────
  {
    id: "06-cp-type-guard",
    title: "Benutzerdefinierten Type Guard schreiben",
    description:
      "Schreibe einen Type Guard der prueft ob ein Wert ein User ist.",
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
    console.log(\`Hallo \${data.name}\`); // TypeScript weiss: data ist User
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
      { placeholder: "______", answer: "value is User", hint: "Type Guard Return-Typ: 'value is ...' — welcher Typ?" },
      { placeholder: "______", answer: "object", hint: "typeof prueft ob der Wert ein Objekt ist." },
      { placeholder: "______", answer: "in", hint: "Welcher Operator prueft ob eine Property in einem Objekt existiert?" },
      { placeholder: "______", answer: "in", hint: "Gleicher Operator fuer die zweite Property." },
    ],
    concept: "Type Guards / value is Type",
  },

  // ─── 5: Generischer Callback (mittel-schwer) ─────────────────────────
  {
    id: "06-cp-generic-callback",
    title: "Generischer Callback-Typ",
    description:
      "Definiere einen generischen Mapper-Typ und verwende ihn " +
      "in einer mapArray-Funktion.",
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
      { placeholder: "______", answer: "T", hint: "Erster Generik-Parameter: Input-Typ." },
      { placeholder: "______", answer: "U", hint: "Zweiter Generik-Parameter: Output-Typ." },
      { placeholder: "______", answer: "T", hint: "Das Array enthaelt Elemente vom Input-Typ." },
      { placeholder: "______", answer: "T", hint: "Mapper bekommt den Input-Typ als erstes Generic." },
      { placeholder: "______", answer: "U", hint: "Mapper gibt den Output-Typ als zweites Generic zurueck." },
    ],
    concept: "Generics / Callbacks / Type Inference",
  },

  // ─── 6: Currying-Pattern (schwer) ─────────────────────────────────────
  {
    id: "06-cp-currying",
    title: "Currying-Funktion schreiben",
    description:
      "Schreibe eine Currying-Funktion die Konfiguration und " +
      "Ausfuehrung trennt.",
    template: `function createGreeter(greeting: string): ______ {
  return (name______) ______ \`\${greeting}, \${name}!\`;
}

const hallo = createGreeter("Hallo");
// hallo hat den Typ: (name: string) => string

console.log(hallo("Max"));   // "Hallo, Max!"
console.log(hallo("Anna"));  // "Hallo, Anna!"`,
    solution: `function createGreeter(greeting: string): (name: string) => string {
  return (name: string) => \`\${greeting}, \${name}!\`;
}

const hallo = createGreeter("Hallo");
console.log(hallo("Max"));   // "Hallo, Max!"
console.log(hallo("Anna"));  // "Hallo, Anna!"`,
    blanks: [
      { placeholder: "______", answer: "(name: string) => string", hint: "Was ist der Return-Typ? Eine Funktion die string nimmt und string zurueckgibt." },
      { placeholder: "______", answer: ": string", hint: "Der Parameter der inneren Funktion braucht eine Typ-Annotation." },
      { placeholder: "______", answer: "=>", hint: "Arrow Function Syntax: (param) => ausdruck" },
    ],
    concept: "Currying / Higher-Order Functions",
  },
];
