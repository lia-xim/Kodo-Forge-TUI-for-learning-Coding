/**
 * Lektion 10 -- Pre-Test-Fragen: Review Challenge — Phase 1
 *
 * 10 Fragen die das GESAMTE Phase-1-Wissen abpruefen.
 * Eine Frage pro Lektion (L01-L09) + eine Integrations-Frage.
 *
 * Diese Fragen sollen VOR dem Bearbeiten der Challenges gestellt werden,
 * um das aktuelle Wissensniveau einzuschaetzen.
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ═══ L01: Setup ═══════════════════════════════════════════════════════════
  {
    sectionIndex: 1,
    question:
      "Was passiert, wenn du ein TypeScript-Projekt OHNE 'strict: true' startest?",
    options: [
      "TypeScript funktioniert nicht — strict ist Pflicht",
      "Viele Fehlertypen werden nicht erkannt (null-Zugriffe, implizites any, etc.)",
      "Es gibt keinen Unterschied zur Laufzeit",
      "Nur die Ausfuehrungsgeschwindigkeit ist langsamer",
    ],
    correct: 1,
    briefExplanation:
      "Ohne strict: true uebersieht TypeScript viele potenzielle Fehler. " +
      "Parameter ohne Typ werden stillschweigend 'any', null/undefined werden " +
      "nicht geprueft, und vieles mehr. Immer strict: true verwenden!",
  },

  // ═══ L02: Primitive Types ═════════════════════════════════════════════════
  {
    sectionIndex: 2,
    question: "Was ist der Unterschied zwischen 'any' und 'unknown'?",
    code: `const a: any = getData();
a.whatever(); // ???

const b: unknown = getData();
b.whatever(); // ???`,
    options: [
      "Kein Unterschied — beide akzeptieren alles",
      "any deaktiviert den Compiler, unknown erzwingt Narrowing vor Nutzung",
      "unknown ist schneller als any",
      "any gibt es nur in JavaScript, unknown nur in TypeScript",
    ],
    correct: 1,
    briefExplanation:
      "any = Compiler schaut weg (a.whatever() kompiliert). " +
      "unknown = Compiler erzwingt Check (b.whatever() ist ein Fehler). " +
      "unknown ist die typsichere Alternative zu any.",
  },

  // ═══ L03: Annotations & Inference ═════════════════════════════════════════
  {
    sectionIndex: 3,
    question: "Wann solltest du KEINE explizite Type Annotation schreiben?",
    code: `// A: const name: string = "Max";
// B: function greet(name): string { return "Hi " + name; }
// C: const nums: number[] = [1, 2, 3];
// D: function getUser(): User { return { ... }; }`,
    options: [
      "A und C — TypeScript inferiert den Typ bei Initialisierung korrekt",
      "B — Parameter werden immer inferiert",
      "D — Return Types sind unnoetig",
      "Nirgends — immer annotieren ist Best Practice",
    ],
    correct: 0,
    briefExplanation:
      "Bei A (const name = 'Max') und C (const nums = [1, 2, 3]) inferiert TypeScript " +
      "den richtigen Typ. Die Annotation ist redundant. B BRAUCHT eine Annotation " +
      "(Parameter), D ist Best Practice fuer oeffentliche APIs.",
  },

  // ═══ L04: Arrays & Tuples ═════════════════════════════════════════════════
  {
    sectionIndex: 4,
    question: "Was ist der Typ von 'entry'?",
    code: `const data: [string, number, boolean] = ["Max", 30, true];
const entry = data[1];`,
    options: [
      "string | number | boolean",
      "number",
      "any",
      "unknown",
    ],
    correct: 1,
    briefExplanation:
      "Bei Tuples weiss TypeScript den Typ an jeder Position. data[1] ist " +
      "das zweite Element: number. Bei einem normalen Array (string | number | boolean)[] " +
      "waere der Zugriff string | number | boolean.",
  },

  // ═══ L05: Objects & Interfaces ════════════════════════════════════════════
  {
    sectionIndex: 5,
    question:
      "Warum kompiliert die Zuweisung ueber eine Variable, aber nicht als Literal?",
    code: `interface Point { x: number; y: number; }

// Fehler:
const p1: Point = { x: 1, y: 2, z: 3 };

// Kein Fehler:
const temp = { x: 1, y: 2, z: 3 };
const p2: Point = temp;`,
    options: [
      "p2 wird zur Laufzeit auf Point getrimmt",
      "Excess Property Check greift nur bei frischen Object Literals, nicht bei Variablen",
      "const-Variablen deaktivieren den Check",
      "temp hat den Typ 'any'",
    ],
    correct: 1,
    briefExplanation:
      "Der Excess Property Check ist ein spezieller Mechanismus der NUR bei " +
      "direkt geschriebenen Object Literals greift. Bei Variablen gilt nur " +
      "Structural Typing: 'Hat temp x und y? Ja → passt.'",
  },

  // ═══ L06: Functions ═══════════════════════════════════════════════════════
  {
    sectionIndex: 6,
    question: "Was ist der Vorteil von Function Overloads gegenueber Union Types?",
    code: `// Ohne Overload:
function parseA(input: string | string[]): number | number[] { ... }

// Mit Overload:
function parseB(input: string): number;
function parseB(input: string[]): number[];
function parseB(input: string | string[]): number | number[] { ... }

const result = parseB("42"); // Welchen Typ hat result?`,
    options: [
      "Overloads sind schneller zur Laufzeit",
      "Overloads geben praezisere Return Types: result ist 'number', nicht 'number | number[]'",
      "Overloads erlauben mehr Parameter-Typen",
      "Kein Vorteil — es ist nur syntaktischer Zucker",
    ],
    correct: 1,
    briefExplanation:
      "Der Hauptvorteil: TypeScript waehlt basierend auf den Argumenten den " +
      "passenden Overload und gibt den EXAKTEN Return Type. Ohne Overloads " +
      "muesste der Aufrufer selbst narrowen.",
  },

  // ═══ L07: Union & Intersection ════════════════════════════════════════════
  {
    sectionIndex: 7,
    question:
      "Was passiert, wenn zwei Interfaces mit gleichem Property aber verschiedenem Typ intersected werden?",
    code: `interface A { value: string; }
interface B { value: number; }
type C = A & B;

const c: C = { value: ??? };`,
    options: [
      "Compile-Fehler bei der Definition von C",
      "value wird zum Typ string | number",
      "value wird zum Typ string & number = never — kein Wert moeglich",
      "value wird zum Typ any",
    ],
    correct: 2,
    briefExplanation:
      "Intersection kombiniert: value muss string UND number sein. " +
      "string & number = never. Der Typ C existiert, aber kein Wert kann ihn " +
      "erfuellen. Der Fehler kommt erst beim Erstellen eines Objekts.",
  },

  // ═══ L08: Type Aliases vs Interfaces ══════════════════════════════════════
  {
    sectionIndex: 8,
    question: "Welches Feature ist EXKLUSIV fuer 'interface'?",
    options: [
      "Optional Properties",
      "Readonly Properties",
      "Declaration Merging (gleiches Interface nochmal oeffnen und erweitern)",
      "Extending anderer Typen",
    ],
    correct: 2,
    briefExplanation:
      "Declaration Merging ist einzigartig fuer interfaces. Du kannst dasselbe " +
      "Interface mehrfach deklarieren und die Properties werden zusammengefuehrt. " +
      "Bei 'type' gibt es einen 'Duplicate identifier' Fehler.",
  },

  // ═══ L09: Enums & Literal Types ══════════════════════════════════════════
  {
    sectionIndex: 9,
    question: "Was macht 'as const' mit diesem Objekt?",
    code: `const config = {
  api: "https://api.example.com",
  timeout: 5000,
  retries: 3,
} as const;`,
    options: [
      "Nichts — Objekte sind bereits const durch 'const'",
      "Macht alle Properties readonly und alle Werte zu Literal Types",
      "Konvertiert das Objekt in einen String",
      "Macht das Objekt immutable zur Laufzeit (wie Object.freeze)",
    ],
    correct: 1,
    briefExplanation:
      "as const macht das gesamte Objekt 'deep readonly' und wandelt alle " +
      "Werte in Literal Types um: api wird '\"https://api.example.com\"' statt string, " +
      "timeout wird '5000' statt number, etc. Es ist ein COMPILE-TIME Feature.",
  },

  // ═══ Integration ══════════════════════════════════════════════════════════
  {
    sectionIndex: 10,
    question:
      "Welche Kombination von Konzepten modelliert einen API-Response am SICHERSTEN?",
    options: [
      "Ein Interface mit optionalen Feldern (data?, error?, loading?)",
      "Discriminated Union + Literal Types + Exhaustive Switch",
      "Generics (kommen erst in Phase 2)",
      "any + Laufzeit-Checks",
    ],
    correct: 1,
    briefExplanation:
      "Discriminated Unions mit Literal Types und exhaustive Switches stellen " +
      "sicher, dass 1) nur gueltige Zustaende existieren, 2) jeder Zustand die " +
      "richtigen Daten hat, und 3) alle Faelle behandelt werden. " +
      "Das ist das maechtigste Pattern aus Phase 1.",
  },
];
