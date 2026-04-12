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
    title: "as const Object as Enum Alternative",
    description: "Create a type-safe constants object with as const.",
    template: `const HttpStatus = {
  Ok: 200,
  NotFound: 404,
  ServerError: 500,
} ______;

type HttpStatus = typeof HttpStatus[______];
// HttpStatus = 200 | 404 | 500

function handleStatus(status: HttpStatus): string {
  switch (status) {
    case HttpStatus.______: return "All good";
    case HttpStatus.NotFound: return "Not found";
    case HttpStatus.ServerError: return "Server error";
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
    case HttpStatus.Ok: return "All good";
    case HttpStatus.NotFound: return "Not found";
    case HttpStatus.ServerError: return "Server error";
  }
}`,
    blanks: [
      { placeholder: "______", answer: "as const", hint: "Which assertion preserves Literal Types?" },
      { placeholder: "______", answer: "keyof typeof HttpStatus", hint: "How do you access all values of an as const object?" },
      { placeholder: "______", answer: "Ok", hint: "Which member has the value 200?" },
    ],
    concept: "as const Object / Enum Alternative",
  },

  {
    id: "09-cp-template-literal",
    title: "Template Literal Type for CSS Classes",
    description: "Create a Template Literal Type that generates all valid CSS classes.",
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
      { placeholder: "______", answer: "`", hint: "Template Literal Types use backticks." },
      { placeholder: "______", answer: "Size", hint: "First union — which sizes are there?" },
      { placeholder: "______", answer: "Variant", hint: "Second union — which variants are there?" },
      { placeholder: "______", answer: "`", hint: "Closing backtick." },
    ],
    concept: "Template Literal Types",
  },

  {
    id: "09-cp-string-enum",
    title: "Define a String Enum",
    description: "Create a String Enum for log levels.",
    template: `______ LogLevel {
  Debug ______ "DEBUG",
  Info ______ "INFO",
  Warn ______ "WARN",
  Error ______ "ERROR",
}

function log(level: LogLevel, message: string): void {
  console.log(\`[\${level}] \${message}\`);
}

log(LogLevel.______, "Server started");`,
    solution: `enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
}

function log(level: LogLevel, message: string): void {
  console.log(\`[\${level}] \${message}\`);
}

log(LogLevel.Info, "Server started");`,
    blanks: [
      { placeholder: "______", answer: "enum", hint: "Which keyword defines an enum?" },
      { placeholder: "______", answer: "=", hint: "String Enums require explicit values with = ." },
      { placeholder: "______", answer: "=", hint: "Each member needs an explicit string value." },
      { placeholder: "______", answer: "=", hint: "Same syntax for all members." },
      { placeholder: "______", answer: "=", hint: "And the last member too." },
      { placeholder: "______", answer: "Info", hint: "Which log level for 'Server started'?" },
    ],
    concept: "String Enums",
  },

  {
    id: "09-cp-union-from-const",
    title: "Derive Union Type from as const Array",
    description: "Derive a Union Type from an as const Array.",
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
      { placeholder: "______", answer: "as const", hint: "Which assertion preserves the Literal Types in the array?" },
      { placeholder: "______", answer: "typeof", hint: "Which keyword extracts the type of a variable?" },
      { placeholder: "______", answer: "number", hint: "Which index type accesses ALL array elements?" },
    ],
    concept: "as const Array / typeof / Union",
  },

  {
    id: "09-cp-branded-type",
    title: "Branded Type for Currency",
    description: "Create a Branded Type that distinguishes EUR and USD.",
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
      { placeholder: "______", answer: "&", hint: "Which operator combines number with the brand?" },
      { placeholder: "______", answer: "__brand", hint: "The brand property is conventionally named..." },
      { placeholder: "______", answer: "EUR", hint: "What is the return type of the constructor function?" },
      { placeholder: "______", answer: "as", hint: "Which keyword casts the value to the Branded Type?" },
    ],
    concept: "Branded Types",
  },

  {
    id: "09-cp-capitalize",
    title: "String Manipulation at Type Level",
    description: "Use built-in String Manipulation Types.",
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
      { placeholder: "______", answer: "Capitalize", hint: "Which Utility Type capitalizes the first letter?" },
      { placeholder: "______", answer: "Uppercase", hint: "Which Utility Type makes EVERYTHING uppercase?" },
    ],
    concept: "String Manipulation Types / Template Literal",
  },
];