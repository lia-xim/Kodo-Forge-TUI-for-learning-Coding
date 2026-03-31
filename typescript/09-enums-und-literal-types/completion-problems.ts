/**
 * Lektion 09 — Completion Problems: Enums & Literal Types
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
  {
    id: "09-cp-as-const-object",
    title: "as const Object als Enum-Alternative",
    description: "Erstelle ein typsicheres Konstanten-Objekt mit as const.",
    template: `const HttpStatus = {
  Ok: 200,
  NotFound: 404,
  ServerError: 500,
} ______;

type HttpStatus = typeof HttpStatus[______];
// HttpStatus = 200 | 404 | 500

function handleStatus(status: HttpStatus): string {
  switch (status) {
    case HttpStatus.______: return "Alles gut";
    case HttpStatus.NotFound: return "Nicht gefunden";
    case HttpStatus.ServerError: return "Serverfehler";
  }
}`,
    solution: `const HttpStatus = {
  Ok: 200,
  NotFound: 404,
  ServerError: 500,
} as const;

type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];

function handleStatus(status: HttpStatus): string {
  switch (status) {
    case HttpStatus.Ok: return "Alles gut";
    case HttpStatus.NotFound: return "Nicht gefunden";
    case HttpStatus.ServerError: return "Serverfehler";
  }
}`,
    blanks: [
      { placeholder: "______", answer: "as const", hint: "Welche Assertion behaelt Literal Types bei?" },
      { placeholder: "______", answer: "keyof typeof HttpStatus", hint: "Wie greift man auf alle Werte eines as const Objects zu?" },
      { placeholder: "______", answer: "Ok", hint: "Welches Mitglied hat den Wert 200?" },
    ],
    concept: "as const Object / Enum-Alternative",
  },

  {
    id: "09-cp-template-literal",
    title: "Template Literal Type fuer CSS-Klassen",
    description: "Erstelle einen Template Literal Type der alle gueltigen CSS-Klassen generiert.",
    template: `type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary";

type ButtonClass = ______\${______}-\${______}______;
// "sm-primary" | "sm-secondary" | "md-primary" | "md-secondary" | "lg-primary" | "lg-secondary"

function setClass(cls: ButtonClass): void {
  console.log(\`Setting class: \${cls}\`);
}

setClass("md-primary");  // OK
// setClass("xl-primary"); // Error!`,
    solution: `type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary";

type ButtonClass = \`\${Size}-\${Variant}\`;

function setClass(cls: ButtonClass): void {
  console.log(\`Setting class: \${cls}\`);
}

setClass("md-primary");`,
    blanks: [
      { placeholder: "______", answer: "`", hint: "Template Literal Types verwenden Backticks." },
      { placeholder: "______", answer: "Size", hint: "Erster Union — welche Groessen gibt es?" },
      { placeholder: "______", answer: "Variant", hint: "Zweiter Union — welche Varianten gibt es?" },
      { placeholder: "______", answer: "`", hint: "Abschliessendes Backtick." },
    ],
    concept: "Template Literal Types",
  },

  {
    id: "09-cp-string-enum",
    title: "String Enum definieren",
    description: "Erstelle ein String Enum fuer Log-Level.",
    template: `______ LogLevel {
  Debug ______ "DEBUG",
  Info ______ "INFO",
  Warn ______ "WARN",
  Error ______ "ERROR",
}

function log(level: LogLevel, message: string): void {
  console.log(\`[\${level}] \${message}\`);
}

log(LogLevel.______, "Server gestartet");`,
    solution: `enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
}

function log(level: LogLevel, message: string): void {
  console.log(\`[\${level}] \${message}\`);
}

log(LogLevel.Info, "Server gestartet");`,
    blanks: [
      { placeholder: "______", answer: "enum", hint: "Welches Keyword definiert ein Enum?" },
      { placeholder: "______", answer: "=", hint: "String Enums brauchen explizite Werte mit = ." },
      { placeholder: "______", answer: "=", hint: "Jedes Mitglied braucht einen expliziten String-Wert." },
      { placeholder: "______", answer: "=", hint: "Gleiche Syntax fuer alle Mitglieder." },
      { placeholder: "______", answer: "=", hint: "Und das letzte Mitglied auch." },
      { placeholder: "______", answer: "Info", hint: "Welches Log-Level fuer 'Server gestartet'?" },
    ],
    concept: "String Enums",
  },

  {
    id: "09-cp-union-from-const",
    title: "Union Type aus as const Array ableiten",
    description: "Leite einen Union Type aus einem as const Array ab.",
    template: `const METHODS = ["GET", "POST", "PUT", "DELETE"] ______;

type HttpMethod = ______ METHODS[______];
// "GET" | "POST" | "PUT" | "DELETE"

function request(method: HttpMethod, url: string): void {
  console.log(\`\${method} \${url}\`);
}

request("GET", "/api/users"); // OK`,
    solution: `const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;

type HttpMethod = typeof METHODS[number];

function request(method: HttpMethod, url: string): void {
  console.log(\`\${method} \${url}\`);
}

request("GET", "/api/users");`,
    blanks: [
      { placeholder: "______", answer: "as const", hint: "Welche Assertion behaelt die Literal Types im Array?" },
      { placeholder: "______", answer: "typeof", hint: "Welches Keyword extrahiert den Typ einer Variable?" },
      { placeholder: "______", answer: "number", hint: "Welcher Index-Typ greift auf ALLE Array-Elemente zu?" },
    ],
    concept: "as const Array / typeof / Union",
  },

  {
    id: "09-cp-branded-type",
    title: "Branded Type fuer Waehrung",
    description: "Erstelle einen Branded Type der EUR und USD unterscheidet.",
    template: `type EUR = number ______ { ______: "EUR" };
type USD = number & { __brand: "USD" };

function createEUR(amount: number): ______ {
  return amount ______ EUR;
}

function addEUR(a: EUR, b: EUR): EUR {
  return createEUR((a as number) + (b as number));
}

const price = createEUR(9.99);
const tax = createEUR(1.90);
const total = addEUR(price, tax);
// addEUR(price, 5 as USD); // Error! USD !== EUR`,
    solution: `type EUR = number & { __brand: "EUR" };
type USD = number & { __brand: "USD" };

function createEUR(amount: number): EUR {
  return amount as EUR;
}

function addEUR(a: EUR, b: EUR): EUR {
  return createEUR((a as number) + (b as number));
}

const price = createEUR(9.99);
const tax = createEUR(1.90);
const total = addEUR(price, tax);`,
    blanks: [
      { placeholder: "______", answer: "&", hint: "Welcher Operator kombiniert number mit dem Brand?" },
      { placeholder: "______", answer: "__brand", hint: "Die Brand-Property heisst konventionell..." },
      { placeholder: "______", answer: "EUR", hint: "Was ist der Return-Typ der Konstruktor-Funktion?" },
      { placeholder: "______", answer: "as", hint: "Welches Keyword castet den Wert zum Branded Type?" },
    ],
    concept: "Branded Types",
  },

  {
    id: "09-cp-capitalize",
    title: "String-Manipulation auf Type-Level",
    description: "Verwende eingebaute String-Manipulation Types.",
    template: `type Event = "click" | "scroll" | "focus";

type OnEvent = \`on\${______<Event>}\`;
// "onClick" | "onScroll" | "onFocus"

type LOUD_EVENT = ______<Event>;
// "CLICK" | "SCROLL" | "FOCUS"

type Handler = {
  [K in OnEvent]: () => void;
};`,
    solution: `type Event = "click" | "scroll" | "focus";

type OnEvent = \`on\${Capitalize<Event>}\`;

type LOUD_EVENT = Uppercase<Event>;

type Handler = {
  [K in OnEvent]: () => void;
};`,
    blanks: [
      { placeholder: "______", answer: "Capitalize", hint: "Welcher Utility Type macht den ersten Buchstaben gross?" },
      { placeholder: "______", answer: "Uppercase", hint: "Welcher Utility Type macht ALLES gross?" },
    ],
    concept: "String Manipulation Types / Template Literal",
  },
];
