Since writing outside the working directory requires explicit permission, here is the translated file:

```typescript
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
  // ─── 1: Null-sichere Funktion (leicht) ──────────────────────────────────
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

  // ─── 2: Sicherer Umgang mit unknown (leicht-mittel) ────────────────────
  {
    id: "02-cp-unknown-narrowing",
    title: "Using unknown Safely",
    description:
      "A function receives an unknown value. Use Type Narrowing, " +
      "to process the value safely.",
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

  // ─── 3: never fuer exhaustive Checks (mittel) ──────────────────────────
  {
    id: "02-cp-exhaustive-check",
    title: "Exhaustive Check with never",
    description:
      "Use the never type to ensure that all cases " +
      "of a Union type are handled. When a new case is added, " +
      "TypeScript automatically generates an error.",
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

  // ─── 4: Nullish Coalescing richtig verwenden (mittel) ──────────────────
  {
    id: "02-cp-nullish-coalescing",
    title: "Nullish Coalescing vs. Logical OR",
    description:
      "Replace the faulty || operator with the correct " +
      "operator, so that 0, '' and false are recognized as valid values.",
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

  // ─── 5: Typ-Hierarchie anwenden (mittel-schwer) ────────────────────────
  {
    id: "02-cp-type-hierarchy",
    title: "Understanding the Type Hierarchy",
    description:
      "Insert the correct types, based on the TypeScript type hierarchy. " +
      "unknown is the Top Type, never is the Bottom Type.",
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
        hint: "Which type is the Top Type that EVERYTHING can be assigned to?",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "Which type is the Bottom Type that can be assigned to EVERYTHING and means 'never returns'?",
      },
      {
        placeholder: "______",
        answer: "any",
        hint: "Which type 'breaks the rules' and bypasses all checks?",
      },
    ],
    concept: "Type Hierarchy / unknown / never / any",
  },

  // ─── 6: as const und Literal Types (schwer) ────────────────────────────
  {
    id: "02-cp-as-const",
    title: "as const for Type-safe Configuration",
    description:
      "Use as const to create a configuration with Literal Types. " +
      "Then derive a Union type from the values.",
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
```