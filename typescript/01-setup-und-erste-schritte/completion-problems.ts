/**
 * Lektion 01 — Completion Problems: Setup & Erste Schritte
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
  // ─── 1: Erste Typ-Annotationen (leicht) ─────────────────────────────────
  {
    id: "01-cp-annotations",
    title: "Erste Typ-Annotationen",
    description:
      "Ergaenze die fehlenden Typ-Annotationen fuer Variablen und " +
      "die Funktion. TypeScript erwartet die korrekten primitiven Typen.",
    template: `let vorname: ______ = "Max";
let alter: ______ = 30;
let istStudent: ______ = true;

function addiere(a: number, b: number): ______ {
  return a + b;
}`,
    solution: `let vorname: string = "Max";
let alter: number = 30;
let istStudent: boolean = true;

function addiere(a: number, b: number): number {
  return a + b;
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "string",
        hint: "Welcher Typ passt zu einem Textwert wie \"Max\"?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "Welcher Typ passt zu einer Ganzzahl wie 30?",
      },
      {
        placeholder: "______",
        answer: "boolean",
        hint: "Welcher Typ passt zu true/false?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "Was gibt die Addition zweier Zahlen zurueck?",
      },
    ],
    concept: "Typ-Annotationen fuer Variablen und Funktionen",
  },

  // ─── 2: Interface definieren (leicht-mittel) ────────────────────────────
  {
    id: "01-cp-interface",
    title: "Interface definieren",
    description:
      "Definiere ein Interface fuer ein Fahrzeug. Beachte: " +
      "Die Farbe ist optional (nicht jedes Fahrzeug hat eine bekannte Farbe).",
    template: `______ Fahrzeug {
  marke: string;
  baujahr: ______;
  elektrisch: boolean;
  farbe______: string;
}

const meinAuto: Fahrzeug = {
  marke: "VW",
  baujahr: 2023,
  elektrisch: true,
  // farbe ist optional, also weglassen
};`,
    solution: `interface Fahrzeug {
  marke: string;
  baujahr: number;
  elektrisch: boolean;
  farbe?: string;
}

const meinAuto: Fahrzeug = {
  marke: "VW",
  baujahr: 2023,
  elektrisch: true,
  // farbe ist optional, also weglassen
};`,
    blanks: [
      {
        placeholder: "______",
        answer: "interface",
        hint: "Welches TypeScript-Schluesselwort definiert die Form eines Objekts?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "Welcher Typ passt zu einem Baujahr wie 2023?",
      },
      {
        placeholder: "______",
        answer: "?",
        hint: "Welches Zeichen macht ein Property optional?",
      },
    ],
    concept: "Interfaces / Optionale Properties",
  },

  // ─── 3: Type Guard fuer Runtime-Pruefung (mittel) ──────────────────────
  {
    id: "01-cp-type-guard",
    title: "Runtime-Pruefung statt instanceof",
    description:
      "Interfaces existieren zur Laufzeit nicht. Schreibe eine " +
      "Type Guard-Funktion, die prueft ob ein Objekt die Struktur " +
      "eines Users hat.",
    template: `interface User {
  name: string;
  email: string;
}

function isUser(obj: ______): obj ______ User {
  return (
    ______ obj === "object" &&
    obj !== null &&
    "name" ______ obj &&
    "email" in obj
  );
}

const data: unknown = { name: "Max", email: "max@test.de" };
if (isUser(data)) {
  console.log(data.name); // TypeScript weiss jetzt: data ist User
}`,
    solution: `interface User {
  name: string;
  email: string;
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "email" in obj
  );
}

const data: unknown = { name: "Max", email: "max@test.de" };
if (isUser(data)) {
  console.log(data.name); // TypeScript weiss jetzt: data ist User
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "unknown",
        hint: "Welcher sichere Typ akzeptiert jeden Wert?",
      },
      {
        placeholder: "______",
        answer: "is",
        hint: "Welches Schluesselwort macht eine Funktion zum Type Guard? (obj ___ User)",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Welcher JavaScript-Operator prueft den Laufzeit-Typ?",
      },
      {
        placeholder: "______",
        answer: "in",
        hint: "Welcher Operator prueft ob ein Property in einem Objekt existiert?",
      },
    ],
    concept: "Type Guards / Type Erasure / Laufzeit-Pruefung",
  },

  // ─── 4: Compiler-Output vorhersagen (mittel) ──────────────────────────
  {
    id: "01-cp-compiler-output",
    title: "Compiler-Output vorhersagen",
    description:
      "Vervollstaendige, was der TypeScript-Compiler aus dem Code macht. " +
      "Beachte: Alle Typen werden entfernt!",
    template: `// TypeScript-Input:
interface Produkt {
  name: string;
  preis: number;
}

function formatPreis(p: Produkt): string {
  return \`\${p.name}: \${p.preis} EUR\`;
}

// JavaScript-Output (nach tsc):
// (Fuelle die Luecken)

// ______ Produkt { ... }  ← Was passiert mit dem Interface?

function formatPreis(______) {
  return \`\$\{p.name\}: \$\{p.preis\} EUR\`;
}`,
    solution: `// TypeScript-Input:
interface Produkt {
  name: string;
  preis: number;
}

function formatPreis(p: Produkt): string {
  return \`\${p.name}: \${p.preis} EUR\`;
}

// JavaScript-Output (nach tsc):

// KOMPLETT WEG  ← Das Interface wird entfernt

function formatPreis(p) {
  return \`\$\{p.name\}: \$\{p.preis\} EUR\`;
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "KOMPLETT WEG",
        hint: "Was passiert mit Interfaces bei Type Erasure? Sie werden...",
      },
      {
        placeholder: "______",
        answer: "p",
        hint: "Was bleibt vom Parameter `p: Produkt` uebrig, wenn der Typ entfernt wird?",
      },
    ],
    concept: "Type Erasure / Compiler-Output",
  },

  // ─── 5: tsconfig verstehen (mittel-schwer) ─────────────────────────────
  {
    id: "01-cp-tsconfig",
    title: "tsconfig.json konfigurieren",
    description:
      "Erstelle eine tsconfig.json fuer ein neues Projekt mit strikten " +
      "Pruefungen, Ausgabe nach ./dist und Typ-Deklarationen.",
    template: `{
  "compilerOptions": {
    "______": true,
    "target": "ES2022",
    "module": "ESNext",
    "______": true,
    "outDir": "./dist",
    "sourceMap": true,
    "______": true
  },
  "include": ["src/**/*.ts"]
}`,
    solution: `{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "noEmitOnError": true,
    "outDir": "./dist",
    "sourceMap": true,
    "declaration": true
  },
  "include": ["src/**/*.ts"]
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "strict",
        hint: "Welche Option aktiviert ALLE strengen Pruefungen auf einmal?",
      },
      {
        placeholder: "______",
        answer: "noEmitOnError",
        hint: "Welche Option verhindert die JavaScript-Ausgabe bei Typ-Fehlern?",
      },
      {
        placeholder: "______",
        answer: "declaration",
        hint: "Welche Option erzeugt .d.ts-Dateien (Typ-Deklarationen)?",
      },
    ],
    concept: "tsconfig.json / Compiler-Optionen",
  },

  // ─── 6: Type Assertion vs. Konvertierung (schwer) ──────────────────────
  {
    id: "01-cp-assertion-vs-conversion",
    title: "Type Assertion vs. echte Konvertierung",
    description:
      "Korrigiere den Code. In Zeile A wird faelschlicherweise " +
      "eine Type Assertion verwendet, wo eine echte Konvertierung noetig ist. " +
      "In Zeile B ist eine echte Validierung noetig.",
    template: `// API-Daten sind zur Laufzeit unbekannt:
const apiData: unknown = fetchFromApi();

// Zeile A — FALSCH: as konvertiert nicht!
// const name = apiData as string;
// RICHTIG:
const name = ______(apiData);

// Zeile B — Sichere Pruefung:
if (______ apiData === "______") {
  // Hier weiss TypeScript: apiData ist string
  console.log(apiData.toUpperCase());
}`,
    solution: `// API-Daten sind zur Laufzeit unbekannt:
const apiData: unknown = fetchFromApi();

// Zeile A — RICHTIG: Echte Konvertierung
const name = String(apiData);

// Zeile B — Sichere Pruefung:
if (typeof apiData === "string") {
  // Hier weiss TypeScript: apiData ist string
  console.log(apiData.toUpperCase());
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "String",
        hint: "Welche JavaScript-Funktion konvertiert einen Wert TATSAECHLICH zu einem String?",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Welcher Operator prueft den Laufzeit-Typ?",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Gegen welchen typeof-Wert pruefst du auf String?",
      },
    ],
    concept: "Type Assertion vs. Konvertierung / typeof",
  },
];
