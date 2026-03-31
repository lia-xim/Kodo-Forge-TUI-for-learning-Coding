/**
 * Lektion 12 — Completion Problems: Discriminated Unions
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
    id: "12-cp-basic-du",
    title: "Grundlegende Discriminated Union",
    description: "Erstelle eine Discriminated Union fuer Formen und eine Flaechenberechnung.",
    template: `type Circle = { ______: "circle"; radius: number };
type Rectangle = { ______: "rectangle"; width: number; height: number };

type Shape = Circle ______ Rectangle;

function area(shape: Shape): number {
  ______(shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.______ * shape.height;
  }
}`,
    solution: `type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };

type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  switch(shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "kind", hint: "Wie heisst das Tag-Property konventionell?" },
      { placeholder: "______", answer: "kind", hint: "Gleiches Tag-Property in allen Varianten." },
      { placeholder: "______", answer: "|", hint: "Welcher Operator verbindet Union-Mitglieder?" },
      { placeholder: "______", answer: "switch", hint: "Welches Statement ist ideal fuer mehrere Faelle?" },
      { placeholder: "______", answer: "width", hint: "Welche Property hat das Rectangle neben height?" },
    ],
    concept: "Discriminated Union Grundlagen",
  },

  {
    id: "12-cp-exhaustive-check",
    title: "Exhaustive Check mit assertNever",
    description: "Implementiere eine Funktion mit Exhaustive Check.",
    template: `function assertNever(value: ______): never {
  throw new Error(\`Unbehandelt: \${value}\`);
}

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

function reduce(count: number, action: Action): number {
  switch (action.______) {
    case "increment": return count + 1;
    case "decrement": return count - 1;
    case "reset": return 0;
    ______:
      return assertNever(______);
  }
}`,
    solution: `function assertNever(value: never): never {
  throw new Error(\`Unbehandelt: \${value}\`);
}

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

function reduce(count: number, action: Action): number {
  switch (action.type) {
    case "increment": return count + 1;
    case "decrement": return count - 1;
    case "reset": return 0;
    default:
      return assertNever(action);
  }
}`,
    blanks: [
      { placeholder: "______", answer: "never", hint: "Welcher Typ repraesentiert 'sollte nie passieren'?" },
      { placeholder: "______", answer: "type", hint: "Wie heisst das Tag-Property der Action?" },
      { placeholder: "______", answer: "default", hint: "Welcher Branch faengt alle uebrigen Faelle?" },
      { placeholder: "______", answer: "action", hint: "Was uebergeben wir an assertNever?" },
    ],
    concept: "Exhaustive Check / assertNever",
  },

  {
    id: "12-cp-option-type",
    title: "Option<T> Typ definieren",
    description: "Erstelle den Option-Typ mit Konstruktoren und unwrapOr.",
    template: `type Option<T> =
  | { tag: "______"; value: T }
  | { tag: "______" };

function some<T>(value: T): Option<T> {
  return { tag: "some", ______ };
}

function none<T>(): Option<T> {
  return { tag: "none" };
}

function unwrapOr<T>(opt: Option<T>, fallback: T): T {
  if (opt.______ === "some") {
    return opt.value;
  }
  return ______;
}`,
    solution: `type Option<T> =
  | { tag: "some"; value: T }
  | { tag: "none" };

function some<T>(value: T): Option<T> {
  return { tag: "some", value };
}

function none<T>(): Option<T> {
  return { tag: "none" };
}

function unwrapOr<T>(opt: Option<T>, fallback: T): T {
  if (opt.tag === "some") {
    return opt.value;
  }
  return fallback;
}`,
    blanks: [
      { placeholder: "______", answer: "some", hint: "Die Variante MIT Wert heisst..." },
      { placeholder: "______", answer: "none", hint: "Die Variante OHNE Wert heisst..." },
      { placeholder: "______", answer: "value", hint: "Welche Property traegt den Wert?" },
      { placeholder: "______", answer: "tag", hint: "Wie heisst der Diskriminator?" },
      { placeholder: "______", answer: "fallback", hint: "Welcher Parameter ist der Default-Wert?" },
    ],
    concept: "Option<T> / ADT",
  },

  {
    id: "12-cp-async-state",
    title: "AsyncState<T> modellieren",
    description: "Erstelle einen typsicheren Loading-State.",
    template: `type AsyncState<T> =
  | { status: "idle" }
  | { status: "______" }
  | { status: "error"; ______: string }
  | { status: "success"; ______: T };

function render<T>(state: AsyncState<T>): string {
  switch (state.______) {
    case "idle": return "Bereit";
    case "loading": return "Lade...";
    case "error": return \`Fehler: \${state.error}\`;
    case "success": return \`OK: \${JSON.stringify(state.data)}\`;
  }
}`,
    solution: `type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

function render<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case "idle": return "Bereit";
    case "loading": return "Lade...";
    case "error": return \`Fehler: \${state.error}\`;
    case "success": return \`OK: \${JSON.stringify(state.data)}\`;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "loading", hint: "Welcher Status ist aktiv waehrend Daten geladen werden?" },
      { placeholder: "______", answer: "error", hint: "Welche Property traegt die Fehlermeldung?" },
      { placeholder: "______", answer: "data", hint: "Welche Property traegt die geladenen Daten?" },
      { placeholder: "______", answer: "status", hint: "Wie heisst der Diskriminator?" },
    ],
    concept: "AsyncState / Zustandsmodellierung",
  },

  {
    id: "12-cp-result-type",
    title: "Result<T, E> mit Fehlerbehandlung",
    description: "Erstelle eine Validierungsfunktion mit Result-Typ.",
    template: `type Result<T, E> =
  | { ok: ______; value: T }
  | { ok: ______; error: E };

function parseAge(input: string): Result<number, string> {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    return { ok: false, ______: \`"\${input}" ist keine Zahl\` };
  }
  return { ok: true, ______: num };
}

const result = parseAge("25");
if (result.______) {
  console.log(\`Alter: \${result.value}\`);
}`,
    solution: `type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseAge(input: string): Result<number, string> {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    return { ok: false, error: \`"\${input}" ist keine Zahl\` };
  }
  return { ok: true, value: num };
}

const result = parseAge("25");
if (result.ok) {
  console.log(\`Alter: \${result.value}\`);
}`,
    blanks: [
      { placeholder: "______", answer: "true", hint: "Welcher Boolean-Wert steht fuer Erfolg?" },
      { placeholder: "______", answer: "false", hint: "Welcher Boolean-Wert steht fuer Fehler?" },
      { placeholder: "______", answer: "error", hint: "Welche Property traegt den Fehler?" },
      { placeholder: "______", answer: "value", hint: "Welche Property traegt den Erfolgs-Wert?" },
      { placeholder: "______", answer: "ok", hint: "Welcher Diskriminator wird geprueft?" },
    ],
    concept: "Result<T, E> / Fehlerbehandlung",
  },

  {
    id: "12-cp-extract-utility",
    title: "Extract mit Discriminated Unions",
    description: "Nutze Extract um eine spezialisierte Funktion zu schreiben.",
    template: `type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; offset: number };

// Nur Click-Events:
type ClickEvent = ______<Event, { type: "______" }>;

// Alle Events AUSSER Click:
type NonClickEvent = ______<Event, { type: "click" }>;

function handleClick(event: ClickEvent): string {
  return \`Klick bei \${event.______}, \${event.y}\`;
}`,
    solution: `type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; offset: number };

type ClickEvent = Extract<Event, { type: "click" }>;

type NonClickEvent = Exclude<Event, { type: "click" }>;

function handleClick(event: ClickEvent): string {
  return \`Klick bei \${event.x}, \${event.y}\`;
}`,
    blanks: [
      { placeholder: "______", answer: "Extract", hint: "Welcher Utility Type BEHAELT passende Varianten?" },
      { placeholder: "______", answer: "click", hint: "Welcher Event-Type soll extrahiert werden?" },
      { placeholder: "______", answer: "Exclude", hint: "Welcher Utility Type ENTFERNT passende Varianten?" },
      { placeholder: "______", answer: "x", hint: "Welche Property hat das Click-Event neben y?" },
    ],
    concept: "Extract / Exclude Utility Types",
  },
];
