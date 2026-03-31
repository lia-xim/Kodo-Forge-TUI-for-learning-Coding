/**
 * Lektion 07 — Fehlkonzeption-Exercises: Union & Intersection Types
 *
 * 8 Fehlkonzeptionen rund um Union/Intersection, Narrowing,
 * Discriminated Unions und Typ-Kompatibilitaet.
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
    id: "07-union-all-methods",
    title: "Union gibt Zugang zu allen Methoden",
    code: `function format(value: string | number): string {
  return value.toUpperCase(); // Erlaubt?
}`,
    commonBelief:
      "string | number erlaubt sowohl string-Methoden als auch number-Methoden.",
    reality:
      "Bei Unions sind nur GEMEINSAME Operationen erlaubt. toUpperCase() " +
      "existiert nur auf string, nicht auf number. Man muss erst narrowen " +
      "mit typeof. Unions VEREINIGEN die Werte, aber VERENGEN die Methoden.",
    concept: "Union / gemeinsame Operationen",
    difficulty: 1,
  },

  {
    id: "07-intersection-means-either",
    title: "Intersection bedeutet 'entweder oder'",
    code: `type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const p: Person = { name: "Max" }; // Reicht das?`,
    commonBelief:
      "Person ist Named ODER Aged — man braucht nur eines von beiden.",
    reality:
      "Intersection (&) bedeutet UND, nicht ODER. Ein Person-Wert muss " +
      "SOWOHL name als auch age haben. { name: 'Max' } fehlt age " +
      "und ist ein Compile-Fehler. Union (|) waere 'oder'.",
    concept: "Intersection / Wertemenge",
    difficulty: 1,
  },

  {
    id: "07-typeof-null",
    title: "typeof null ist 'null'",
    code: `function process(x: string | null) {
  if (typeof x === "object") {
    // x ist jetzt string? Oder null?
    console.log(x.toUpperCase());
  }
}`,
    commonBelief:
      "typeof null ist 'null', also wuerde typeof x === 'object' nur Objekte matchen.",
    reality:
      "typeof null === 'object' — das ist ein beruechtigter JavaScript-Bug " +
      "seit 1995! Nach typeof x === 'object' kann x immer noch null sein. " +
      "TypeScript verengt string | null auf null (da null typeof 'object' hat). " +
      "Fuer null-Checks: if (x !== null) oder if (x).",
    concept: "typeof null / JavaScript-Quirk",
    difficulty: 3,
  },

  {
    id: "07-exhaustive-without-never",
    title: "Switch ohne Exhaustive Check ist sicher",
    code: `type Shape = { type: 'circle'; r: number } | { type: 'rect'; w: number; h: number };

function area(shape: Shape): number {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.r ** 2;
    case 'rect': return shape.w * shape.h;
  }
}
// Spaeter: type Shape = ... | { type: 'triangle'; base: number; height: number };`,
    commonBelief:
      "Der Switch behandelt alle Faelle — das reicht zur Sicherheit.",
    reality:
      "Ohne Exhaustive Check (default: const _: never = shape) bemerkt " +
      "TypeScript NICHT, wenn ein neues Union-Mitglied hinzugefuegt wird. " +
      "Die Funktion wuerde stillschweigend undefined zurueckgeben. " +
      "Der never-Trick ist das Sicherheitsnetz.",
    concept: "Exhaustive Check / never",
    difficulty: 3,
  },

  {
    id: "07-intersection-conflict-silent",
    title: "Intersection-Konflikte werden gemeldet",
    code: `type A = { name: string; id: number };
type B = { name: number; email: string };
type AB = A & B;

// Was ist der Typ von AB.name?`,
    commonBelief:
      "TypeScript meldet einen Fehler weil name in A string und in B number ist.",
    reality:
      "Intersection-Konflikte erzeugen KEINEN Fehler! AB.name wird zu " +
      "string & number = never. Das Objekt ist theoretisch gueltig, " +
      "aber kein Wert kann je name erfuellen. Bei extends wuerde " +
      "TypeScript den Konflikt als Fehler melden — ein Grund extends zu bevorzugen.",
    concept: "Intersection Konflikte / never",
    difficulty: 4,
  },

  {
    id: "07-narrowing-reassignment",
    title: "Narrowing bleibt nach Reassignment erhalten",
    code: `function process(x: string | number) {
  if (typeof x === "string") {
    // x ist string
    x = 42; // Reassignment
    console.log(x.toUpperCase()); // Geht das noch?
  }
}`,
    commonBelief:
      "Einmal narrowed, bleibt x im gesamten if-Block ein string.",
    reality:
      "TypeScript trackt Reassignments! Nach x = 42 ist x wieder number. " +
      "x.toUpperCase() ist ein Fehler. TypeScripts Control Flow Analysis " +
      "ist extrem praezise — sie verfolgt jeden Zuweisungspfad.",
    concept: "Control Flow Analysis / Reassignment",
    difficulty: 3,
  },

  {
    id: "07-discriminated-any-property",
    title: "Jede gemeinsame Property ist ein Diskriminator",
    code: `type A = { label: string; value: number };
type B = { label: string; data: string[] };
type AB = A | B;

function process(item: AB) {
  if (item.label === "test") {
    // Ist item jetzt A oder B?
  }
}`,
    commonBelief:
      "label ist eine gemeinsame Property, also kann man darauf narrowen. " +
      "item.label === 'test' verengt den Typ.",
    reality:
      "Ein Diskriminator braucht LITERAL TYPES die eindeutig ein Mitglied " +
      "identifizieren. label ist in beiden Typen string — 'test' kann " +
      "in BEIDEN vorkommen. Kein Narrowing moeglich. Fuer einen Diskriminator " +
      "brauchst du: { type: 'a' } | { type: 'b' } mit verschiedenen Literalen.",
    concept: "Discriminated Unions / Diskriminator-Anforderungen",
    difficulty: 3,
  },

  {
    id: "07-union-property-access",
    title: "Optionale Properties in Union-Mitgliedern sind zugreifbar",
    code: `type Success = { status: 'ok'; data: string };
type Error = { status: 'error'; message: string };
type Result = Success | Error;

function handle(result: Result) {
  console.log(result.data); // Geht das?
}`,
    commonBelief:
      "result.data sollte zugreifbar sein — es existiert in einem der Union-Mitglieder.",
    reality:
      "data existiert nur in Success, nicht in Error. Ohne Narrowing " +
      "erlaubt TypeScript nur gemeinsame Properties — hier nur 'status'. " +
      "Erst nach if (result.status === 'ok') ist result.data zugreifbar. " +
      "Das ist der Kern von Discriminated Unions.",
    concept: "Union-Property-Zugriff / Narrowing",
    difficulty: 2,
  },
];
