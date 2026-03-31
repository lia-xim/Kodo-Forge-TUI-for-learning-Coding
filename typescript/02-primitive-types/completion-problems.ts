/**
 * Lektion 02 — Completion Problems: Primitive Types
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
  // ─── 1: Null-sichere Funktion (leicht) ──────────────────────────────────
  {
    id: "02-cp-null-safe",
    title: "Null-sichere String-Funktion",
    description:
      "Schreibe eine Funktion, die die Laenge eines Strings zurueckgibt. " +
      "Der String kann null oder undefined sein — behandle beide Faelle.",
    template: `function safeLength(text: string | ______ | ______): number {
  if (text ______ null || text ______ undefined) {
    return 0;
  }
  return text.length;
}

console.log(safeLength("Hallo")); // 5
console.log(safeLength(null));     // 0
console.log(safeLength(undefined));// 0`,
    solution: `function safeLength(text: string | null | undefined): number {
  if (text === null || text === undefined) {
    return 0;
  }
  return text.length;
}

console.log(safeLength("Hallo")); // 5
console.log(safeLength(null));     // 0
console.log(safeLength(undefined));// 0`,
    blanks: [
      {
        placeholder: "______",
        answer: "null",
        hint: "Welcher Typ repraesentiert 'bewusst leer'?",
      },
      {
        placeholder: "______",
        answer: "undefined",
        hint: "Welcher Typ repraesentiert 'wurde nie gesetzt'?",
      },
      {
        placeholder: "______",
        answer: "===",
        hint: "Welcher Vergleichsoperator prueft auf exakte Gleichheit (ohne Typkonvertierung)?",
      },
      {
        placeholder: "______",
        answer: "===",
        hint: "Gleicher Operator wie zuvor — immer strikte Gleichheit verwenden.",
      },
    ],
    concept: "null / undefined / strictNullChecks",
  },

  // ─── 2: Sicherer Umgang mit unknown (leicht-mittel) ────────────────────
  {
    id: "02-cp-unknown-narrowing",
    title: "unknown sicher verwenden",
    description:
      "Eine Funktion erhaelt einen unknown-Wert. Verwende Type Narrowing, " +
      "um den Wert sicher zu verarbeiten.",
    template: `function processValue(value: ______) {
  if (______ value === "string") {
    // TypeScript weiss: value ist string
    console.log("String:", value.toUpperCase());
  } else if (typeof value === "______") {
    // TypeScript weiss: value ist number
    console.log("Number:", value.toFixed(2));
  } else {
    console.log("Anderer Typ:", value);
  }
}

processValue("hallo");  // String: HALLO
processValue(3.14159);  // Number: 3.14
processValue(true);     // Anderer Typ: true`,
    solution: `function processValue(value: unknown) {
  if (typeof value === "string") {
    // TypeScript weiss: value ist string
    console.log("String:", value.toUpperCase());
  } else if (typeof value === "number") {
    // TypeScript weiss: value ist number
    console.log("Number:", value.toFixed(2));
  } else {
    console.log("Anderer Typ:", value);
  }
}

processValue("hallo");  // String: HALLO
processValue(3.14159);  // Number: 3.14
processValue(true);     // Anderer Typ: true`,
    blanks: [
      {
        placeholder: "______",
        answer: "unknown",
        hint: "Welcher Typ ist die sichere Alternative zu 'any'?",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Welcher Operator prueft den Laufzeit-Typ und ermoeglicht Type Narrowing?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "Wie heisst der typeof-Wert fuer Zahlen?",
      },
    ],
    concept: "unknown / Type Narrowing / typeof",
  },

  // ─── 3: never fuer exhaustive Checks (mittel) ──────────────────────────
  {
    id: "02-cp-exhaustive-check",
    title: "Exhaustive Check mit never",
    description:
      "Verwende den never-Typ, um sicherzustellen, dass alle Faelle " +
      "eines Union-Typs behandelt werden. Wenn ein neuer Fall hinzukommt, " +
      "erzeugt TypeScript automatisch einen Fehler.",
    template: `type TrafficLight = "red" | "yellow" | "green";

function getAction(light: TrafficLight): string {
  switch (light) {
    case "red":
      return "Stopp!";
    case "yellow":
      return "Vorsicht!";
    case "green":
      return "Fahren!";
    default:
      // Wenn alle Faelle abgedeckt sind, ist light hier 'never'.
      // Dieses Pattern erzeugt einen Compile-Fehler, wenn ein
      // neuer Wert zum Union hinzugefuegt wird:
      const _exhaustive: ______ = light;
      return _exhaustive;
  }
}

// Fehler-werfende Hilfsfunktion:
function assertNever(value: ______): ______ {
  throw new Error(\`Unerwarteter Wert: \${value}\`);
}`,
    solution: `type TrafficLight = "red" | "yellow" | "green";

function getAction(light: TrafficLight): string {
  switch (light) {
    case "red":
      return "Stopp!";
    case "yellow":
      return "Vorsicht!";
    case "green":
      return "Fahren!";
    default:
      const _exhaustive: never = light;
      return _exhaustive;
  }
}

function assertNever(value: never): never {
  throw new Error(\`Unerwarteter Wert: \${value}\`);
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "never",
        hint: "Welcher Typ repraesentiert 'kann nie auftreten'?",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "Der Parameter hat denselben Typ — er soll NIE einen echten Wert erhalten.",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "Welchen Return-Typ hat eine Funktion die IMMER einen Error wirft?",
      },
    ],
    concept: "never / Exhaustive Checks / Union Types",
  },

  // ─── 4: Nullish Coalescing richtig verwenden (mittel) ──────────────────
  {
    id: "02-cp-nullish-coalescing",
    title: "Nullish Coalescing vs. Logical OR",
    description:
      "Ersetze den fehlerhaften ||-Operator durch den korrekten " +
      "Operator, damit 0, '' und false als gueltige Werte erkannt werden.",
    template: `interface UserSettings {
  volume: number;       // 0 ist gueltig (stumm)
  nickname: string;     // "" ist gueltig (kein Nickname)
  darkMode: boolean;    // false ist gueltig
}

function applySettings(settings: Partial<UserSettings>) {
  // FALSCH: || behandelt 0, "" und false als "fehlend"
  // const volume = settings.volume || 50;

  // RICHTIG: Nur null und undefined als "fehlend" behandeln
  const volume = settings.volume ______ 50;
  const nickname = settings.nickname ______ "Anonym";
  const darkMode = settings.darkMode ______ true;

  console.log({ volume, nickname, darkMode });
}

// Test: Alle Werte sind gesetzt (auch die "falsy"-Werte)
applySettings({ volume: 0, nickname: "", darkMode: false });
// Soll: { volume: 0, nickname: "", darkMode: false }`,
    solution: `interface UserSettings {
  volume: number;
  nickname: string;
  darkMode: boolean;
}

function applySettings(settings: Partial<UserSettings>) {
  const volume = settings.volume ?? 50;
  const nickname = settings.nickname ?? "Anonym";
  const darkMode = settings.darkMode ?? true;

  console.log({ volume, nickname, darkMode });
}

applySettings({ volume: 0, nickname: "", darkMode: false });
// Ergebnis: { volume: 0, nickname: "", darkMode: false }`,
    blanks: [
      {
        placeholder: "______",
        answer: "??",
        hint: "Welcher Operator prueft NUR auf null/undefined (nicht auf falsy)?",
      },
      {
        placeholder: "______",
        answer: "??",
        hint: "Gleicher Operator — konsistent fuer alle Defaults verwenden.",
      },
      {
        placeholder: "______",
        answer: "??",
        hint: "Gleicher Operator — damit false nicht als 'fehlend' gilt.",
      },
    ],
    concept: "Nullish Coalescing (??) vs. Logical OR (||)",
  },

  // ─── 5: Typ-Hierarchie anwenden (mittel-schwer) ────────────────────────
  {
    id: "02-cp-type-hierarchy",
    title: "Typ-Hierarchie verstehen",
    description:
      "Fuege die korrekten Typen ein, basierend auf der TypeScript-Typhierarchie. " +
      "unknown ist der Top Type, never ist der Bottom Type.",
    template: `// unknown ist der Top Type: ALLES ist unknown zuweisbar
let top: ______ = "hello";
top = 42;
top = true;
top = null;
top = undefined;

// never ist der Bottom Type: never ist ALLEM zuweisbar
function impossible(): ______ {
  throw new Error("Unmoeglich!");
}

let str: string = impossible();  // OK: never ist string zuweisbar
let num: number = impossible();  // OK: never ist number zuweisbar

// any bricht die Regeln: Es ist KEIN Top/Bottom Type
let unsicher: ______ = "hello";
let zahl: number = unsicher;  // OK (unsicher!) — any umgeht die Pruefung`,
    solution: `let top: unknown = "hello";
top = 42;
top = true;
top = null;
top = undefined;

function impossible(): never {
  throw new Error("Unmoeglich!");
}

let str: string = impossible();
let num: number = impossible();

let unsicher: any = "hello";
let zahl: number = unsicher;`,
    blanks: [
      {
        placeholder: "______",
        answer: "unknown",
        hint: "Welcher Typ ist der Top Type, dem ALLES zuweisbar ist?",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "Welcher Typ ist der Bottom Type, der ALLEM zuweisbar ist und 'nie zurueckkehrt' bedeutet?",
      },
      {
        placeholder: "______",
        answer: "any",
        hint: "Welcher Typ 'bricht die Regeln' und umgeht alle Pruefungen?",
      },
    ],
    concept: "Typ-Hierarchie / unknown / never / any",
  },

  // ─── 6: as const und Literal Types (schwer) ────────────────────────────
  {
    id: "02-cp-as-const",
    title: "as const fuer typsichere Konfiguration",
    description:
      "Verwende as const, um eine Konfiguration mit Literal-Typen zu erstellen. " +
      "Leite dann einen Union-Typ aus den Werten ab.",
    template: `const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] ______ ______;
// Typ: readonly ["GET", "POST", "PUT", "DELETE"]

// Union-Typ aus den Array-Werten ableiten:
type HttpMethod = ______ HTTP_METHODS[______];
// Ergebnis: "GET" | "POST" | "PUT" | "DELETE"

function sendRequest(method: HttpMethod, url: string) {
  console.log(\`\${method} \${url}\`);
}

sendRequest("GET", "/api/users");     // OK
// sendRequest("PATCH", "/api/users"); // Fehler! "PATCH" ist nicht erlaubt`,
    solution: `const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
// Typ: readonly ["GET", "POST", "PUT", "DELETE"]

type HttpMethod = typeof HTTP_METHODS[number];
// Ergebnis: "GET" | "POST" | "PUT" | "DELETE"

function sendRequest(method: HttpMethod, url: string) {
  console.log(\`\${method} \${url}\`);
}

sendRequest("GET", "/api/users");     // OK
// sendRequest("PATCH", "/api/users"); // Fehler! "PATCH" ist nicht erlaubt`,
    blanks: [
      {
        placeholder: "______",
        answer: "as",
        hint: "Erster Teil des Schluesselsorts fuer konstante Assertions (... _____ const).",
      },
      {
        placeholder: "______",
        answer: "const",
        hint: "Zweiter Teil: as _____",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Welcher Operator extrahiert den TYPE aus einer Variable?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "Mit welchem Index-Typ greift man auf ALLE Elemente eines readonly Arrays zu?",
      },
    ],
    concept: "as const / typeof / Literal Types / Index Access",
  },
];
