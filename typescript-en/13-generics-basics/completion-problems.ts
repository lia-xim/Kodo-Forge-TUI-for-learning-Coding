/**
 * Lesson 13 — Completion Problems: Generics Basics
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
    id: "13-cp-identity",
    title: "Generic identity Function",
    description: "Complete the simplest generic function.",
    template: `function identity______(_____: T): ______ {
  return arg;
}

const str = identity("hallo"); // string
const num = identity(42);       // number`,
    solution: `function identity<T>(arg: T): T {
  return arg;
}

const str = identity("hallo"); // string
const num = identity(42);       // number`,
    blanks: [
      { placeholder: "______", answer: "<T>", hint: "How do you declare a type parameter?" },
      { placeholder: "_____", answer: "arg", hint: "The parameter name (value, not type)." },
      { placeholder: "______", answer: "T", hint: "What is the return type? The same as the input." },
    ],
    concept: "Generic Function / Type Parameter",
  },

  {
    id: "13-cp-generic-interface",
    title: "Generic API Response Interface",
    description: "Create a generic interface for API responses.",
    template: `interface ApiResponse______  {
  data: ______;
  status: number;
  message: string;
}

function handleResponse______(response: ApiResponse<T>): ______ {
  if (response.status >= 400) throw new Error(response.message);
  return response.data;
}`,
    solution: `interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.status >= 400) throw new Error(response.message);
  return response.data;
}`,
    blanks: [
      { placeholder: "______", answer: "<T>", hint: "Type parameter for the interface." },
      { placeholder: "______", answer: "T", hint: "What type does the data property have?" },
      { placeholder: "______", answer: "<T>", hint: "The function also needs a type parameter." },
      { placeholder: "______", answer: "T", hint: "The return type matches the data type." },
    ],
    concept: "Generic Interface / API Pattern",
  },

  {
    id: "13-cp-constraint",
    title: "Constraint with extends",
    description: "Restrict the type parameter with a constraint.",
    template: `function getLength<T ______ { length: number }>(arg: T): number {
  return arg.______;
}

getLength("hallo");     // OK — string has .length
getLength([1, 2, 3]);   // OK — Array has .length
// getLength(42);        // Error!`,
    solution: `function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

getLength("hallo");     // OK
getLength([1, 2, 3]);   // OK`,
    blanks: [
      { placeholder: "______", answer: "extends", hint: "Which keyword restricts a type parameter?" },
      { placeholder: "______", answer: "length", hint: "Which property does the function access?" },
    ],
    concept: "Constraint / extends",
  },

  {
    id: "13-cp-keyof",
    title: "Type-safe Property Access with keyof",
    description: "Use keyof for type-safe object access.",
    template: `function getProperty<T, K ______ ______ T>(obj: T, key: K): T[______] {
  return obj[key];
}

const user = { name: "Max", age: 30 };
const name = getProperty(user, "name");   // string
const age = getProperty(user, "age");     // number`,
    solution: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Max", age: 30 };
const name = getProperty(user, "name");   // string
const age = getProperty(user, "age");     // number`,
    blanks: [
      { placeholder: "______", answer: "extends", hint: "K must be a valid key — how do you restrict it?" },
      { placeholder: "______", answer: "keyof", hint: "Which keyword produces the union of all keys?" },
      { placeholder: "______", answer: "K", hint: "Which type index returns the precise property type?" },
    ],
    concept: "keyof Constraint / Indexed Access",
  },

  {
    id: "13-cp-default",
    title: "Default Type Parameter",
    description: "Create an interface with a default type parameter.",
    template: `interface Container<T ______ ______> {
  value: T;
  label: string;
}

// Without type annotation: default applies
const text: Container = { value: "Hallo", label: "text" };
// ^ Container = Container<string>

// With type annotation: default overridden
const num: Container<______> = { value: 42, label: "zahl" };`,
    solution: `interface Container<T = string> {
  value: T;
  label: string;
}

const text: Container = { value: "Hallo", label: "text" };
const num: Container<number> = { value: 42, label: "zahl" };`,
    blanks: [
      { placeholder: "______", answer: "=", hint: "How do you assign a default type?" },
      { placeholder: "______", answer: "string", hint: "Which default type fits 'Hallo'?" },
      { placeholder: "______", answer: "number", hint: "Which type overrides the default for 42?" },
    ],
    concept: "Default Type Parameter",
  },

  {
    id: "13-cp-multiple-constraints",
    title: "Combining Multiple Constraints",
    description: "Create a function that requires multiple constraints.",
    template: `interface HasId {
  id: number;
}

interface HasName {
  name: string;
}

function printEntity<T extends HasId ______ HasName>(entity: T): void {
  console.log(\`#\${entity.______}: \${entity.______}\`);
}

printEntity({ id: 1, name: "Max", email: "max@test.de" });`,
    solution: `interface HasId {
  id: number;
}

interface HasName {
  name: string;
}

function printEntity<T extends HasId & HasName>(entity: T): void {
  console.log(\`#\${entity.id}: \${entity.name}\`);
}

printEntity({ id: 1, name: "Max", email: "max@test.de" });`,
    blanks: [
      { placeholder: "______", answer: "&", hint: "Which operator combines two constraints?" },
      { placeholder: "______", answer: "id", hint: "Which property comes from HasId?" },
      { placeholder: "______", answer: "name", hint: "Which property comes from HasName?" },
    ],
    concept: "Multiple Constraints / Intersection",
  },
];