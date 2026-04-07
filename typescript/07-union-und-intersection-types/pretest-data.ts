/**
 * Lektion 07 — Pre-Test-Fragen: Union & Intersection Types
 *
 * 3 Fragen pro Sektion (6 Sektionen = 18 Fragen).
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
  // ═══ Sektion 1: Union Types Grundlagen ══════════════════════════════════
  {
    sectionIndex: 1,
    question: "Was bedeutet `string | number` in TypeScript?",
    options: [
      "Ein neuer Typ der string und number kombiniert",
      "Ein Wert der ENTWEDER string ODER number sein kann",
      "string wird in number umgewandelt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Der | Operator erstellt einen Union Type: ein Wert kann einen von mehreren Typen haben.",
  },
  {
    sectionIndex: 1,
    question: "Kann man auf einem `string | number` Wert toUpperCase() aufrufen?",
    options: [
      "Ja, TypeScript probiert es einfach",
      "Nein, nur gemeinsame Operationen sind erlaubt",
      "Ja, wenn man strict mode deaktiviert",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Bei Unions nur Operationen die fuer ALLE Mitglieder existieren. Man muss erst narrowen.",
  },
  {
    sectionIndex: 1,
    question: "Was ist ein Literal Union?",
    code: "type Direction = 'north' | 'south' | 'east' | 'west';",
    options: [
      "Ein Union aus Strings",
      "Ein Union aus konkreten Werten — nur diese 4 Strings sind erlaubt",
      "Ein Enum mit Strings",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Literal Unions erlauben nur die angegebenen konkreten Werte — mit IDE-Autocomplete.",
  },

  // ═══ Sektion 2: Type Guards und Narrowing ═══════════════════════════════
  {
    sectionIndex: 2,
    question: "Was macht TypeScript nach `if (typeof x === 'string')`?",
    options: [
      "Nichts — der Typ bleibt gleich",
      "Verengt den Typ von x auf string (Type Narrowing)",
      "Konvertiert x in einen string",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "TypeScripts Control Flow Analysis verengt den Typ automatisch basierend auf Checks.",
  },
  {
    sectionIndex: 2,
    question: "Was ist neu bei filter() in TS 5.5?",
    options: [
      "filter() gibt jetzt Sets zurueck",
      "TypeScript erkennt Type Guards in filter-Callbacks automatisch",
      "filter() ist schneller geworden",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Inferred Type Predicates: x => x !== null wird als Type Guard erkannt — kein expliziter Guard noetig.",
  },
  {
    sectionIndex: 2,
    question: "Welche Narrowing-Techniken kennt TypeScript?",
    options: [
      "typeof, instanceof, in, Truthiness, Assignment",
      "Nur typeof",
      "Nur typeof und instanceof",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "TypeScript hat 5 eingebaute Narrowing-Techniken plus benutzerdefinierte Type Guards.",
  },

  // ═══ Sektion 3: Discriminated Unions ═════════════════════════════════════
  {
    sectionIndex: 3,
    question: "Was braucht eine Discriminated Union?",
    options: [
      "Eine gemeinsame Tag-Property mit verschiedenen Literal-Typen",
      "Mindestens 3 Union-Mitglieder",
      "Einen Exhaustive Check",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Die Tag-Property (z.B. type: 'circle') identifiziert eindeutig welcher Typ vorliegt.",
  },
  {
    sectionIndex: 3,
    question: "Was bewirkt `const _: never = shape` im default-Case?",
    options: [
      "Ein Exhaustive Check — Compile-Error wenn ein Case fehlt",
      "Nichts — es ist toter Code",
      "Es verhindert Laufzeit-Fehler",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Wenn alle Cases behandelt sind, ist shape 'never'. Ein neues Mitglied bricht das — Compile-Error.",
  },
  {
    sectionIndex: 3,
    question: "Was sind Algebraische Datentypen (ADTs)?",
    options: [
      "Typen die aus Summentypen (Union) und Produkttypen (Objekte) zusammengesetzt sind",
      "Datentypen fuer mathematische Berechnungen",
      "Eine spezielle TypeScript-Feature",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "ADTs kommen aus der funktionalen Programmierung. Discriminated Unions sind Summentypen.",
  },

  // ═══ Sektion 4: Intersection Types ══════════════════════════════════════
  {
    sectionIndex: 4,
    question: "Was bedeutet `A & B` fuer Objekt-Typen?",
    options: [
      "Ein Objekt das ALLE Properties aus A UND B haben muss",
      "Entweder A oder B",
      "Nur die gemeinsamen Properties",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Intersection kombiniert alle Properties. Ein Wert muss beide Typen gleichzeitig erfuellen.",
  },
  {
    sectionIndex: 4,
    question: "Was ergibt `string & number`?",
    options: [
      "string | number",
      "any",
      "never — kein Wert ist beides gleichzeitig",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "Inkompatible Primitive ergeben never. Kein Wert kann gleichzeitig string UND number sein.",
  },
  {
    sectionIndex: 4,
    question: "Was passiert bei Property-Konflikten in Intersections?",
    code: "type A = { x: string };\ntype B = { x: number };\ntype AB = A & B;",
    options: [
      "Compile-Error",
      "x wird zu string | number",
      "x wird zu string & number = never (kein Fehler, aber unbrauchbar)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "Intersection-Konflikte erzeugen keinen Fehler! Die Property wird never — still und unbrauchbar.",
  },

  // ═══ Sektion 5: Union vs Intersection ════════════════════════════════════
  {
    sectionIndex: 5,
    question: "Was ist der Unterschied zwischen | und & bei der Wertemenge?",
    options: [
      "Kein Unterschied",
      "| macht sie kleiner, & groesser",
      "| macht die Wertemenge groesser, & macht sie kleiner",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "Union = mehr Werte passen. Intersection = weniger Werte passen (muessen mehr erfuellen).",
  },
  {
    sectionIndex: 5,
    question: "Was ist schneller fuer den Compiler: extends oder &?",
    options: [
      "Kein Unterschied",
      "& ist schneller",
      "extends ist schneller und meldet Konflikte besser",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "extends ist fuer den Compiler effizienter und meldet Konflikte direkt als Fehler.",
  },
  {
    sectionIndex: 5,
    question: "Was ergibt (A | B) & C?",
    options: [
      "A | B | C",
      "Ich weiss es nicht",
      "never",
      "(A & C) | (B & C) — distributiv",
    ],
    correct: 3,
    briefExplanation: "Intersection verteilt sich ueber Union: Distributives Gesetz aus der Mengenlehre.",
  },

  // ═══ Sektion 6: Praxis-Patterns ═════════════════════════════════════════
  {
    sectionIndex: 6,
    question: "Welches Pattern modelliert Erfolg/Fehler typsicher?",
    options: [
      "try/catch",
      "Ich weiss es nicht",
      "Optionale Properties",
      "Das Result-Pattern mit Discriminated Union",
    ],
    correct: 3,
    briefExplanation: "Das Result-Pattern nutzt Discriminated Unions: success hat data, error hat error-Info.",
  },
  {
    sectionIndex: 6,
    question: "Warum sind Discriminated Unions ideal fuer State Machines?",
    options: [
      "Weil sie schneller sind",
      "Ich weiss es nicht",
      "Weil sie weniger Code brauchen",
      "Weil der Compiler ungueltige Zustaende und fehlende Behandlung verhindert",
    ],
    correct: 3,
    briefExplanation: "Jeder Zustand hat eigene Properties. Der Compiler verhindert Zugriffe auf Zustand-fremde Properties.",
  },
  {
    sectionIndex: 6,
    question: "Was ist das Command-Pattern mit Discriminated Unions?",
    options: [
      "Ein Pattern fuer CLI-Tools",
      "Ich weiss es nicht",
      "Ein Ersatz fuer Funktionen",
      "Verschiedene Aktionen als Union mit typ-spezifischen Payloads",
    ],
    correct: 3,
    briefExplanation: "Jede Aktion ist ein Union-Mitglied mit eigenem Payload-Typ — typsicher und erweiterbar.",
  },
];
