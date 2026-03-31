/**
 * Lektion 05 -- Pre-Test-Fragen: Objects & Interfaces
 *
 * 3 Fragen pro Sektion, die VOR dem Lesen der Sektion gestellt werden.
 * Ziel: Vorwissen aktivieren, Neugier wecken, Fehlkonzeptionen aufdecken.
 *
 * Sektionen:
 *   1 — Objekt-Typen Basics
 *   2 — Interfaces & Deklaration
 *   3 — Structural Typing
 *   4 — Excess Property Checking
 *   5 — Readonly & Optional
 *   6 — Index Signatures
 *   7 — Intersection & Utility Types
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
  // ═══════════════════════════════════════════════════════════════
  // Sektion 1: Objekt-Typen Basics
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 1,
    question: "Welchen Typ inferiert TypeScript fuer diese Variable?",
    code: `const user = { name: "Alice", age: 30 };`,
    options: [
      "any",
      "object",
      "{ name: string; age: number }",
      '{ name: "Alice"; age: 30 }',
    ],
    correct: 2,
    briefExplanation:
      "TypeScript inferiert einen Objekt-Typ mit widened Typen: " +
      "{ name: string; age: number }. Literal-Typen kommen nur bei 'as const'.",
  },

  {
    sectionIndex: 1,
    question: "Was passiert, wenn du ein Property weglässt?",
    code: `type User = { name: string; age: number };
const u: User = { name: "Alice" };`,
    options: [
      "Kompiliert — fehlende Properties werden undefined",
      "Compile-Fehler — 'age' fehlt",
      "Kompiliert mit Warnung",
      "Laufzeit-Fehler",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript erzwingt, dass ALLE nicht-optionalen Properties vorhanden sind. " +
      "Fuer optionale Properties nutzt du '?' Syntax: age?: number.",
  },

  {
    sectionIndex: 1,
    question: "Was ist der Typ von 'obj' hier?",
    code: `function process(obj: { x: number; y: number }) {
  return obj.x + obj.y;
}`,
    options: [
      "Man muss ein Interface definieren — inline Object Types gehen nicht",
      "Der Parameter akzeptiert nur Objekte mit GENAU x und y",
      "Der Parameter akzeptiert Objekte mit MINDESTENS x und y",
      "Der Parameter hat den Typ 'any'",
    ],
    correct: 2,
    briefExplanation:
      "Structural Typing: Jedes Objekt mit mindestens x: number und y: number " +
      "passt — Extra-Properties sind erlaubt (mit einer Ausnahme, die du spaeter lernst).",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 2: Interfaces & Deklaration
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 2,
    question: "Was passiert bei diesem Code?",
    code: `interface Config {
  host: string;
}
interface Config {
  port: number;
}
const c: Config = ???`,
    options: [
      "Compile-Fehler — 'Config' ist doppelt deklariert",
      "Nur die zweite Deklaration zaehlt — Config hat nur 'port'",
      "Beide werden zusammengefuegt — Config hat 'host' UND 'port'",
      "Die erste Deklaration gewinnt — Config hat nur 'host'",
    ],
    correct: 2,
    briefExplanation:
      "Declaration Merging! Interfaces koennen mehrfach deklariert werden — " +
      "die Properties werden zusammengefuegt. Bei 'type' waere das ein Fehler.",
  },

  {
    sectionIndex: 2,
    question: "Was hat das Interface 'Child' fuer Properties?",
    code: `interface Parent { x: number; y: string; }
interface Child extends Parent { z: boolean; }`,
    options: [
      "Nur z: boolean",
      "x: number und z: boolean",
      "x: number, y: string und z: boolean",
      "Fehler: Interfaces koennen nicht erweitert werden",
    ],
    correct: 2,
    briefExplanation:
      "'extends' uebernimmt ALLE Properties des Parents. " +
      "Child hat alles von Parent plus seine eigenen Definitionen.",
  },

  {
    sectionIndex: 2,
    question: "Welches Feature hat 'type' das 'interface' NICHT hat?",
    options: [
      "Optional Properties",
      "Union Types (type A = string | number)",
      "Readonly Properties",
      "Verschachtelte Objekte",
    ],
    correct: 1,
    briefExplanation:
      "Union Types koennen nur mit 'type' definiert werden. " +
      "Interfaces sind auf Objekt-Strukturen beschraenkt.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 3: Structural Typing
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 3,
    question: "Kompiliert dieser Code?",
    code: `interface Euro { betrag: number; }
interface Dollar { betrag: number; }
const preis: Euro = { betrag: 100 };
const kosten: Dollar = preis;`,
    options: [
      "Fehler — Euro und Dollar sind verschiedene Interfaces",
      "Kompiliert — TypeScript prueft nur die Struktur, nicht den Namen",
      "Fehler — verschiedene Interfaces sind nie kompatibel",
      "Kompiliert, aber mit Warnung",
    ],
    correct: 1,
    briefExplanation:
      "Structural Typing! Euro und Dollar haben die gleiche Struktur " +
      "{ betrag: number }, also sind sie kompatibel — egal was der Name ist.",
  },

  {
    sectionIndex: 3,
    question: "Was ist die 'Width Subtyping'-Regel?",
    code: `interface A { x: number; }
interface B { x: number; y: string; }
const b: B = { x: 1, y: "hi" };
const a: A = b; // Erlaubt?`,
    options: [
      "Nein — B hat extra Properties die A nicht kennt",
      "Ja — B hat MINDESTENS alles was A braucht (und mehr ist OK)",
      "Nur mit Type Assertion",
      "Nein — A und B muessen identisch sein",
    ],
    correct: 1,
    briefExplanation:
      "Width Subtyping: Ein Typ mit MEHR Properties ist ein Subtyp von einem " +
      "Typ mit weniger Properties. B hat alles von A plus y — also passt B zu A.",
  },

  {
    sectionIndex: 3,
    question:
      "Warum hat TypeScript sich fuer Structural statt Nominal Typing entschieden?",
    options: [
      "Weil Structural Typing schneller kompiliert",
      "Weil JavaScript dynamisch typisiert ist und Code oft ohne Klassenbeziehungen arbeitet",
      "Weil alle modernen Sprachen Structural Typing verwenden",
      "Weil Nominal Typing in TypeScript nicht implementierbar ist",
    ],
    correct: 1,
    briefExplanation:
      "JavaScript-Code verwendet staendig ad-hoc Objekte ohne Klassen. " +
      "Structural Typing passt zu dieser Realitaet — es prueft 'was hast du?' " +
      "statt 'woher kommst du?'.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 4: Excess Property Checking
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 4,
    question: "Welche Zuweisung verursacht einen Fehler?",
    code: `interface HasName { name: string; }

// A:
const data = { name: "Max", age: 30 };
const a: HasName = data;

// B:
const b: HasName = { name: "Max", age: 30 };`,
    options: [
      "Nur A — Variable hat Extra-Property 'age'",
      "Nur B — frisches Object Literal hat Extra-Property 'age'",
      "Beide — 'age' ist nicht in HasName",
      "Keines — Extra-Properties sind immer erlaubt",
    ],
    correct: 1,
    briefExplanation:
      "Excess Property Check greift NUR bei frischen Object Literals! " +
      "Bei A geht die Zuweisung ueber eine Variable — kein Check.",
  },

  {
    sectionIndex: 4,
    question:
      "Warum hat TypeScript den Excess Property Check eingefuehrt?",
    options: [
      "Aus Performance-Gruenden — weniger Properties sind schneller",
      "Um Tippfehler in Object Literals zu finden (haeufigste Fehlerquelle)",
      "Weil Structural Typing zu unsicher ist",
      "Weil JavaScript Extra-Properties verbietet",
    ],
    correct: 1,
    briefExplanation:
      "Eingefuehrt in TypeScript 1.6: Die Maintainer beobachteten, dass " +
      "Tippfehler in Object Literals eine der haeufigsten Fehlerquellen waren.",
  },

  {
    sectionIndex: 4,
    question: "Welcher dieser Wege umgeht den Excess Property Check NICHT?",
    options: [
      "Zuweisung ueber eine Zwischenvariable",
      "Type Assertion: { ... } as MyType",
      "Direkte Zuweisung eines frischen Object Literals",
      "Index Signature: [key: string]: unknown",
    ],
    correct: 2,
    briefExplanation:
      "Direkte Zuweisung eines frischen Object Literals ist genau der Fall, " +
      "in dem der Excess Property Check aktiv ist.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 5: Readonly & Optional
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 5,
    question: "Was passiert bei diesem Code?",
    code: `interface User {
  readonly address: { city: string; };
}
const u: User = { address: { city: "Berlin" } };
u.address.city = "Hamburg";`,
    options: [
      "Compile-Fehler — address ist readonly, also auch alles darunter",
      "Kein Fehler — readonly ist shallow, nur die Referenz 'address' ist geschuetzt",
      "Laufzeit-Fehler — das Objekt ist eingefroren",
      "Compile-Fehler bei 'city', weil es auch 'readonly' sein muesste",
    ],
    correct: 1,
    briefExplanation:
      "readonly ist SHALLOW! Es schuetzt nur die oberste Ebene. " +
      "'u.address = ...' waere ein Fehler, aber 'u.address.city = ...' ist erlaubt.",
  },

  {
    sectionIndex: 5,
    question: "Was ist der Unterschied zwischen diesen zwei Properties?",
    code: `interface A { x?: number; }
interface B { x: number | undefined; }`,
    options: [
      "Kein Unterschied — beide sind identisch",
      "Bei A kann x komplett fehlen, bei B muss x vorhanden sein (Wert darf undefined sein)",
      "Bei B ist x immer undefined",
      "Bei A ist x immer vorhanden aber optional",
    ],
    correct: 1,
    briefExplanation:
      "{} ist gueltig fuer A (x darf fehlen), aber NICHT fuer B " +
      "(x muss vorhanden sein, auch wenn der Wert undefined ist).",
  },

  {
    sectionIndex: 5,
    question:
      "Was brauchst du fuer deep-readonly auf einem verschachtelten Objekt?",
    options: [
      "Einfach 'readonly' auf die oberste Ebene setzen",
      "Object.freeze() aufrufen",
      "Einen rekursiven Utility Type wie DeepReadonly<T>",
      "'as const' auf das Objekt",
    ],
    correct: 2,
    briefExplanation:
      "Fuer echte tiefe Immutabilitaet im Typ-System brauchst du einen " +
      "rekursiven Typ. 'as const' funktioniert auch, aber nur bei Literal-Werten.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 6: Index Signatures
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 6,
    question: "Was ist das Problem bei diesem Interface?",
    code: `interface Config {
  name: string;
  port: number;
  [key: string]: string;
}`,
    options: [
      "Index Signatures duerfen nicht mit festen Properties kombiniert werden",
      "'port: number' widerspricht der Index Signature '[key: string]: string'",
      "Der Key-Typ 'string' ist nicht erlaubt",
      "Es gibt kein Problem",
    ],
    correct: 1,
    briefExplanation:
      "Alle festen Properties muessen zum Typ der Index Signature passen. " +
      "'port: number' widerspricht '[key: string]: string'. " +
      "Loesung: [key: string]: string | number.",
  },

  {
    sectionIndex: 6,
    question: "Was beschreibt Record<string, number>?",
    options: [
      "Ein Array von Zahlen",
      "Ein Objekt mit beliebigen String-Keys und number-Werten",
      "Ein Tuple [string, number]",
      "Einen Typ mit genau einer Property",
    ],
    correct: 1,
    briefExplanation:
      "Record<K, V> erstellt einen Typ mit Keys vom Typ K und Werten vom Typ V. " +
      "Record<string, number> ist { [key: string]: number }.",
  },

  {
    sectionIndex: 6,
    question:
      "Welchen Typ hat 'val' bei Index-Zugriff auf ein Objekt mit Index Signature?",
    code: `interface Dict { [key: string]: number; }
const d: Dict = { a: 1, b: 2 };
const val = d["xyz"];`,
    options: [
      "number",
      "number | undefined",
      "unknown",
      "any",
    ],
    correct: 0,
    briefExplanation:
      "Ohne 'noUncheckedIndexedAccess' gibt TypeScript den Value-Typ zurueck: " +
      "number. MIT der Option waere es number | undefined (sicherer!).",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 7: Intersection & Utility Types
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 7,
    question: "Was beschreibt der Typ 'A & B'?",
    code: `type A = { x: number; y: number };
type B = { y: number; z: number };
type C = A & B;`,
    options: [
      "{ y: number } — nur die gemeinsamen Properties",
      "{ x: number; y: number; z: number } — ALLE Properties aus A UND B",
      "Fehler — A und B haben die gleiche Property 'y'",
      "{ x: number; z: number } — nur die unterschiedlichen Properties",
    ],
    correct: 1,
    briefExplanation:
      "Intersection (&) bedeutet: ALLE Properties aus BEIDEN Typen. " +
      "Das ist eine Vereinigung der Anforderungen, nicht der gemeinsame Schnitt.",
  },

  {
    sectionIndex: 7,
    question: "Was passiert bei einem Property-Konflikt in einer Intersection?",
    code: `type A = { value: string };
type B = { value: number };
type C = A & B;`,
    options: [
      "Compile-Fehler — Konflikt wird erkannt",
      "string | number — Union beider Typen",
      "string — der erste Typ gewinnt",
      "never — string & number ist unmoeglich",
    ],
    correct: 3,
    briefExplanation:
      "string & number ergibt never — es gibt keinen Wert der gleichzeitig " +
      "string UND number ist. Kein Compile-Fehler, aber C ist unbenutzbar.",
  },

  {
    sectionIndex: 7,
    question: "Was beschreibt Partial<Pick<User, 'name' | 'email'>>?",
    code: `interface User { id: string; name: string; email: string; }`,
    options: [
      "{ id?: string; name?: string; email?: string }",
      "{ name?: string; email?: string }",
      "{ name: string; email: string }",
      "{ id: string; name?: string; email?: string }",
    ],
    correct: 1,
    briefExplanation:
      "Zuerst Pick: nur name und email. Dann Partial: beide optional. " +
      "Ergebnis: { name?: string; email?: string }.",
  },
];
