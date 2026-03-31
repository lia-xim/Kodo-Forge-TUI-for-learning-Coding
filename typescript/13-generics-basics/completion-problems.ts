/**
 * Lektion 13 — Completion Problems: Generics Basics
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
    title: "Generische identity-Funktion",
    description: "Vervollstaendige die einfachste generische Funktion.",
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
      { placeholder: "______", answer: "<T>", hint: "Wie deklariert man einen Typparameter?" },
      { placeholder: "_____", answer: "arg", hint: "Der Parametername (Wert, nicht Typ)." },
      { placeholder: "______", answer: "T", hint: "Was ist der Rueckgabetyp? Derselbe wie der Input." },
    ],
    concept: "Generische Funktion / Typparameter",
  },

  {
    id: "13-cp-generic-interface",
    title: "Generisches API-Response-Interface",
    description: "Erstelle ein generisches Interface fuer API-Responses.",
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
      { placeholder: "______", answer: "<T>", hint: "Typparameter fuer das Interface." },
      { placeholder: "______", answer: "T", hint: "Welchen Typ hat die data-Property?" },
      { placeholder: "______", answer: "<T>", hint: "Die Funktion braucht auch einen Typparameter." },
      { placeholder: "______", answer: "T", hint: "Der Rueckgabetyp entspricht dem Datentyp." },
    ],
    concept: "Generisches Interface / API-Pattern",
  },

  {
    id: "13-cp-constraint",
    title: "Constraint mit extends",
    description: "Schraenke den Typparameter mit einem Constraint ein.",
    template: `function getLength<T ______ { length: number }>(arg: T): number {
  return arg.______;
}

getLength("hallo");     // OK — string hat .length
getLength([1, 2, 3]);   // OK — Array hat .length
// getLength(42);        // Error!`,
    solution: `function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

getLength("hallo");     // OK
getLength([1, 2, 3]);   // OK`,
    blanks: [
      { placeholder: "______", answer: "extends", hint: "Welches Keyword schraenkt einen Typparameter ein?" },
      { placeholder: "______", answer: "length", hint: "Auf welche Property greift die Funktion zu?" },
    ],
    concept: "Constraint / extends",
  },

  {
    id: "13-cp-keyof",
    title: "Typsicherer Property-Zugriff mit keyof",
    description: "Verwende keyof fuer typsicheren Objekt-Zugriff.",
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
      { placeholder: "______", answer: "extends", hint: "K muss ein gueltiger Schluessel sein — wie schraenkt man ein?" },
      { placeholder: "______", answer: "keyof", hint: "Welches Keyword erzeugt den Union aller Schluessel?" },
      { placeholder: "______", answer: "K", hint: "Welcher Typ-Index gibt den praezisen Property-Typ zurueck?" },
    ],
    concept: "keyof Constraint / Indexed Access",
  },

  {
    id: "13-cp-default",
    title: "Default-Typparameter",
    description: "Erstelle ein Interface mit Default-Typparameter.",
    template: `interface Container<T ______ ______> {
  value: T;
  label: string;
}

// Ohne Typangabe: Default greift
const text: Container = { value: "Hallo", label: "text" };
// ^ Container = Container<string>

// Mit Typangabe: Default ueberschrieben
const num: Container<______> = { value: 42, label: "zahl" };`,
    solution: `interface Container<T = string> {
  value: T;
  label: string;
}

const text: Container = { value: "Hallo", label: "text" };
const num: Container<number> = { value: 42, label: "zahl" };`,
    blanks: [
      { placeholder: "______", answer: "=", hint: "Wie weist man einen Default-Typ zu?" },
      { placeholder: "______", answer: "string", hint: "Welcher Default-Typ passt zu 'Hallo'?" },
      { placeholder: "______", answer: "number", hint: "Welcher Typ ueberschreibt den Default fuer 42?" },
    ],
    concept: "Default-Typparameter",
  },

  {
    id: "13-cp-multiple-constraints",
    title: "Mehrere Constraints kombinieren",
    description: "Erstelle eine Funktion die mehrere Constraints erfordert.",
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
      { placeholder: "______", answer: "&", hint: "Welcher Operator kombiniert zwei Constraints?" },
      { placeholder: "______", answer: "id", hint: "Welche Property kommt von HasId?" },
      { placeholder: "______", answer: "name", hint: "Welche Property kommt von HasName?" },
    ],
    concept: "Mehrere Constraints / Intersection",
  },
];
