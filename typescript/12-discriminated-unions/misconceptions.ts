/**
 * Lektion 12 — Fehlkonzeption-Exercises: Discriminated Unions
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  {
    id: "12-string-discriminator-required",
    title: "Nur Strings funktionieren als Diskriminator",
    code: `type Success = { ok: true; data: string };
type Failure = { ok: false; error: string };
type Result = Success | Failure;

function handle(r: Result) {
  if (r.ok) { console.log(r.data); } // Funktioniert!
}`,
    commonBelief: "Nur String Literals koennen als Diskriminator dienen.",
    reality:
      "Boolean und Number Literals funktionieren ebenfalls als Diskriminator. " +
      "TypeScript narrowt bei `r.ok === true` genauso wie bei `r.kind === 'text'`. " +
      "Boolean-Diskriminatoren sind sogar natuerlich mit if/else verwendbar.",
    concept: "Diskriminator-Typen",
    difficulty: 1,
  },

  {
    id: "12-destructuring-narrowing",
    title: "Destrukturierung funktioniert mit Narrowing",
    code: `type Shape = { kind: "circle"; radius: number } | { kind: "rect"; w: number; h: number };

function area(shape: Shape) {
  const { kind } = shape;
  if (kind === "circle") {
    console.log(shape.radius); // Error! shape ist noch Shape
  }
}`,
    commonBelief: "Wenn ich kind destrukturiere und pruefe, wird shape automatisch narrowed.",
    reality:
      "Destrukturierung bricht die Verbindung zum Original-Objekt. " +
      "TypeScript kann nicht zurueckverfolgen, dass die separate Variable 'kind' " +
      "zum Objekt 'shape' gehoert. Loesung: Direkt `shape.kind` pruefen.",
    concept: "Destrukturierung / Narrowing",
    difficulty: 3,
  },

  {
    id: "12-any-string-as-discriminator",
    title: "'type: string' funktioniert als Diskriminator",
    code: `type A = { type: string; data: number };
type B = { type: string; items: string[] };
type Union = A | B;

function handle(u: Union) {
  if (u.type === "a") {
    // u ist immer noch Union — kein Narrowing!
  }
}`,
    commonBelief: "Wenn ich type: string verwende und den Wert pruefe, narrowt TypeScript.",
    reality:
      "Der Diskriminator muss ein LITERAL Type sein ('a', nicht string). " +
      "Bei `type: string` sind alle String-Werte in beiden Varianten gueltig — " +
      "TypeScript kann nicht unterscheiden welche Variante vorliegt. " +
      "Loesung: `type: 'a'` und `type: 'b'` als Literal Types.",
    concept: "Literal Type als Diskriminator",
    difficulty: 2,
  },

  {
    id: "12-exhaustive-check-always-needed",
    title: "assertNever ist immer noetig fuer Exhaustive Checks",
    code: `type Light = { color: "red" } | { color: "green" } | { color: "yellow" };

// Auch ohne assertNever:
function action(light: Light): string {
  switch (light.color) {
    case "red": return "Stop";
    case "green": return "Go";
    case "yellow": return "Caution";
    // Kein default noetig — TS weiss alle Faelle sind abgedeckt
  }
}`,
    commonBelief: "Man braucht immer assertNever fuer Exhaustive Checks.",
    reality:
      "Wenn die Funktion einen Return-Typ hat, erkennt TypeScript " +
      "automatisch ob alle Pfade einen Wert zurueckgeben. assertNever " +
      "ist nuetzlich wenn man OHNE Return-Typ arbeitet oder die " +
      "Fehlermeldung den fehlenden Typ anzeigen soll. " +
      "Beide Methoden sind gueltig.",
    concept: "Exhaustive Check / Return-Typ",
    difficulty: 2,
  },

  {
    id: "12-discriminated-unions-runtime-overhead",
    title: "Discriminated Unions erzeugen Laufzeit-Overhead",
    code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; w: number; h: number };

// Kompiliertes JavaScript:
// Kein Unterschied zu normalem JavaScript-Code!`,
    commonBelief: "Discriminated Unions erzeugen zusaetzlichen JavaScript-Code.",
    reality:
      "Discriminated Unions sind ein reines Typ-Feature — sie erzeugen " +
      "KEINEN zusaetzlichen Laufzeit-Code. Das Tag-Property ist ein normales " +
      "JavaScript-Property das sowieso existiert. Die Typ-Information " +
      "verschwindet bei der Kompilierung (Type Erasure). " +
      "Nur die Objekte und switch-Statements bleiben.",
    concept: "Type Erasure / Zero-Cost Abstraktion",
    difficulty: 2,
  },

  {
    id: "12-option-replaces-null",
    title: "Option<T> macht null/undefined komplett ueberfluessig",
    code: `type Option<T> = { tag: "some"; value: T } | { tag: "none" };

// In der Praxis: TypeScript hat eingebaute null-Checks
function find(id: string): User | undefined {
  // Funktioniert auch gut mit strictNullChecks!
}`,
    commonBelief: "Man sollte immer Option<T> statt T | null verwenden.",
    reality:
      "Option<T> ist ein Lernkonzept und nuetzlich fuer komplexe Workflows. " +
      "Fuer einfache Faelle reicht T | null oder T | undefined mit strictNullChecks " +
      "voellig aus. TypeScript hat eingebautes null-Narrowing. " +
      "Option<T> lohnt sich bei Verkettungen (map/flatMap) oder " +
      "wenn du das Result-Pattern konsequent nutzt.",
    concept: "Option<T> / Pragmatismus",
    difficulty: 3,
  },

  {
    id: "12-instanceof-is-better",
    title: "instanceof ist besser als Discriminated Unions",
    code: `// OOP-Ansatz:
class Circle { constructor(public radius: number) {} }
class Rect { constructor(public w: number, public h: number) {} }

function area(shape: Circle | Rect): number {
  if (shape instanceof Circle) return Math.PI * shape.radius ** 2;
  return shape.w * shape.h;
}

// DU-Ansatz: Funktioniert auch mit Plain Objects und JSON!`,
    commonBelief: "instanceof mit Klassen ist sauberer als Discriminated Unions.",
    reality:
      "instanceof funktioniert nur mit Klassen — nicht mit Plain Objects, " +
      "JSON-Daten oder API-Responses. Discriminated Unions funktionieren " +
      "mit JEDEM Objekt. JSON.parse gibt kein instanceof-kompatibles Objekt " +
      "zurueck. In der Praxis arbeitet man viel haeufiger mit Plain Objects " +
      "als mit Klassen.",
    concept: "DU vs instanceof / Plain Objects",
    difficulty: 3,
  },

  {
    id: "12-switch-only-pattern",
    title: "Discriminated Unions funktionieren nur mit switch",
    code: `type Result = { ok: true; data: string } | { ok: false; error: string };

// if/else funktioniert genauso:
function handle(r: Result) {
  if (r.ok) {
    console.log(r.data);   // TypeScript narrowt!
  } else {
    console.log(r.error);  // Auch hier!
  }
}`,
    commonBelief: "Man muss immer switch/case verwenden um Discriminated Unions zu narrowen.",
    reality:
      "if/else, Early Return und ternary Operatoren funktionieren alle " +
      "mit Discriminated Unions. TypeScript narrowt ueberall wo der " +
      "Diskriminator geprueft wird. switch/case ist besonders bei " +
      "vielen Varianten uebersichtlich — aber kein Muss.",
    concept: "Narrowing-Methoden",
    difficulty: 1,
  },
];
