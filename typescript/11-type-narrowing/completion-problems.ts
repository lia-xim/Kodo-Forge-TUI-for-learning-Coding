/**
 * Lektion 11 — Completion Problems: Type Narrowing
 *
 * Code-Templates mit strategischen Luecken (______).
 * Der Lernende fuellt die Luecken — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code mit ______ als Platzhalter fuer Luecken */
  template: string;
  /** Loesung mit gefuellten Luecken */
  solution: string;
  /** Welche Luecke welche Antwort hat */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Verwandtes Konzept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: typeof Guard (leicht) ──────────────────────────────────────────
  {
    id: "11-cp-typeof-guard",
    title: "typeof Guard fuer string | number",
    description:
      "Fuege den richtigen typeof-Check ein, um den Typ von 'wert' " +
      "zu verengen und sichere Operationen durchzufuehren.",
    template: `function formatiere(wert: string | number): string {
  if (______ wert === "______") {
    return wert.toUpperCase();
  }
  return wert.______(2);
}`,
    solution: `function formatiere(wert: string | number): string {
  if (typeof wert === "string") {
    return wert.toUpperCase();
  }
  return wert.toFixed(2);
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Welcher Operator prueft den Laufzeit-Typ?",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Welcher typeof-Wert steht fuer Texte?",
      },
      {
        placeholder: "______",
        answer: "toFixed",
        hint: "Welche number-Methode formatiert auf Dezimalstellen?",
      },
    ],
    concept: "typeof Narrowing",
  },

  // ─── 2: null-Check mit Early Return (leicht) ──────────────────────────
  {
    id: "11-cp-null-check",
    title: "null-Elimination mit Early Return",
    description:
      "Verwende einen Early Return um null zu eliminieren, " +
      "bevor du auf String-Methoden zugreifst.",
    template: `function safeTrim(text: string | ______): string {
  if (text ______ null) ______ "";
  return text.trim();
}`,
    solution: `function safeTrim(text: string | null): string {
  if (text === null) return "";
  return text.trim();
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "null",
        hint: "Welcher Typ repraesentiert 'bewusst kein Wert'?",
      },
      {
        placeholder: "______",
        answer: "===",
        hint: "Welcher Operator prueft strikte Gleichheit?",
      },
      {
        placeholder: "______",
        answer: "return",
        hint: "Welches Keyword beendet die Funktion frueh?",
      },
    ],
    concept: "null Narrowing / Early Return",
  },

  // ─── 3: in-Operator (mittel) ──────────────────────────────────────────
  {
    id: "11-cp-in-operator",
    title: "in-Operator fuer Discriminated Union",
    description:
      "Verwende den in-Operator um zwischen verschiedenen " +
      "Nachrichtentypen zu unterscheiden.",
    template: `interface TextMsg { content: string }
interface ImageMsg { url: string; width: number }
type Message = TextMsg | ImageMsg;

function describe(msg: Message): string {
  if ("______" ______ msg) {
    return \`Bild: \${msg.url}\`;
  }
  return \`Text: \${msg.content}\`;
}`,
    solution: `interface TextMsg { content: string }
interface ImageMsg { url: string; width: number }
type Message = TextMsg | ImageMsg;

function describe(msg: Message): string {
  if ("url" in msg) {
    return \`Bild: \${msg.url}\`;
  }
  return \`Text: \${msg.content}\`;
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "url",
        hint: "Welche Property hat nur ImageMsg?",
      },
      {
        placeholder: "______",
        answer: "in",
        hint: "Welcher Operator prueft ob eine Property existiert?",
      },
    ],
    concept: "in Operator / Discriminated Unions",
  },

  // ─── 4: Custom Type Guard (mittel) ────────────────────────────────────
  {
    id: "11-cp-type-guard",
    title: "Custom Type Guard mit is-Keyword",
    description:
      "Schreibe einen Type Guard der unbekannte Daten als User validiert.",
    template: `interface User {
  name: string;
  age: number;
}

function isUser(data: unknown): data ______ User {
  return (
    ______ data === "object" &&
    data !== ______ &&
    "name" in data &&
    typeof (data as Record<string, unknown>).name === "string" &&
    "age" in data &&
    typeof (data as Record<string, unknown>).age === "number"
  );
}`,
    solution: `interface User {
  name: string;
  age: number;
}

function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as Record<string, unknown>).name === "string" &&
    "age" in data &&
    typeof (data as Record<string, unknown>).age === "number"
  );
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "is",
        hint: "Welches Keyword macht eine Funktion zum Type Guard?",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Welcher Operator prueft den Laufzeit-Typ?",
      },
      {
        placeholder: "______",
        answer: "null",
        hint: "typeof null === 'object' — was muss ausgeschlossen werden?",
      },
    ],
    concept: "Type Predicates / is-Keyword",
  },

  // ─── 5: assertNever (mittel-schwer) ───────────────────────────────────
  {
    id: "11-cp-assert-never",
    title: "Exhaustive Switch mit assertNever",
    description:
      "Implementiere die assertNever-Funktion und verwende sie " +
      "in einem exhaustive Switch.",
    template: `function assertNever(value: ______): ______ {
  throw new Error(\`Unbehandelter Fall: \${value}\`);
}

type Light = "red" | "yellow" | "green";

function action(light: Light): string {
  switch (light) {
    case "red":    return "Stop";
    case "yellow": return "Vorsicht";
    case "green":  return "Fahren";
    default:       return ______(light);
  }
}`,
    solution: `function assertNever(value: never): never {
  throw new Error(\`Unbehandelter Fall: \${value}\`);
}

type Light = "red" | "yellow" | "green";

function action(light: Light): string {
  switch (light) {
    case "red":    return "Stop";
    case "yellow": return "Vorsicht";
    case "green":  return "Fahren";
    default:       return assertNever(light);
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "never",
        hint: "Welcher Typ repraesentiert 'sollte nie auftreten'?",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "Welchen Return-Typ hat eine Funktion die immer wirft?",
      },
      {
        placeholder: "______",
        answer: "assertNever",
        hint: "Wie heisst die Hilfsfunktion die du gerade definiert hast?",
      },
    ],
    concept: "Exhaustive Checks / never / assertNever",
  },

  // ─── 6: TS 5.5 Inferred Predicates (schwer) ──────────────────────────
  {
    id: "11-cp-inferred-predicates",
    title: "TS 5.5 Inferred Type Predicates mit filter",
    description:
      "Verwende filter() um null/undefined aus Arrays zu entfernen. " +
      "Ab TS 5.5 narrowt TypeScript automatisch.",
    template: `const items: (string | null | undefined)[] = ["a", null, "b", undefined, "c"];

// Entferne null und undefined (TS 5.5+ narrowt automatisch):
const clean = items.______(x => x ______ null && x ______ undefined);
// Typ: string[]

// Filtere nur strings mit Laenge > 1:
const long = clean.filter(s => s.______ > 1);`,
    solution: `const items: (string | null | undefined)[] = ["a", null, "b", undefined, "c"];

const clean = items.filter(x => x !== null && x !== undefined);
// Typ: string[]

const long = clean.filter(s => s.length > 1);`,
    blanks: [
      {
        placeholder: "______",
        answer: "filter",
        hint: "Welche Array-Methode filtert Elemente?",
      },
      {
        placeholder: "______",
        answer: "!==",
        hint: "Welcher Operator prueft strikte Ungleichheit?",
      },
      {
        placeholder: "______",
        answer: "!==",
        hint: "Gleicher Operator — auch undefined ausschliessen.",
      },
      {
        placeholder: "______",
        answer: "length",
        hint: "Welche String-Property gibt die Laenge zurueck?",
      },
    ],
    concept: "TS 5.5 Inferred Type Predicates / filter",
  },
];
