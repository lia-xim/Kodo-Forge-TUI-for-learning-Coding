/**
 * Lektion 12 — Pre-Test-Fragen: Discriminated Unions
 *
 * 3 Fragen pro Sektion (5 Sektionen = 15 Fragen).
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
  // ═══ Sektion 1: Tagged Unions ═══════════════════════════════════════════
  {
    sectionIndex: 1,
    question: "Was ist der Diskriminator in einer Discriminated Union?",
    options: [
      "Ein beliebiges Property",
      "Ein Property mit einem Literal Type, das jede Variante eindeutig identifiziert",
      "Das erste Property des Objekts",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Der Diskriminator muss ein Literal Type sein (String, Number, Boolean) und in jeder Variante einen anderen Wert haben.",
  },
  {
    sectionIndex: 1,
    question: "Welche Literal Types sind als Diskriminator gueltig?",
    options: [
      "Nur Strings",
      "String, Number und Boolean Literals",
      "Alle Typen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "String, Number und Boolean Literals funktionieren alle als Diskriminator. Best Practice: String Literals verwenden.",
  },
  {
    sectionIndex: 1,
    question: "Was sind die drei Zutaten einer Discriminated Union?",
    options: [
      "class, interface, type",
      "Tag-Property mit Literal Type, Union Type, Narrowing",
      "extends, implements, typeof",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Drei Zutaten: (1) Gemeinsames Tag-Property mit Literal-Werten, (2) Union Type, (3) Narrowing durch den Diskriminator.",
  },

  // ═══ Sektion 2: Pattern Matching ═══════════════════════════════════════
  {
    sectionIndex: 2,
    question: "Was macht assertNever(value: never) im default-Branch eines switch?",
    options: [
      "Gibt einen Default-Wert zurueck",
      "Erzeugt einen Compile-Error wenn nicht alle Faelle behandelt sind",
      "Loggt den Wert",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "assertNever erwartet 'never'. Fehlt ein case, hat der Wert noch einen konkreten Typ — Compile-Error!",
  },
  {
    sectionIndex: 2,
    question: "Was ist das 'Early Return Pattern' bei Discriminated Unions?",
    options: [
      "Jeden Fall mit if + return pruefen — flacher Code statt verschachteltem if/else",
      "Alle Faelle mit switch behandeln",
      "Die Funktion sofort beenden",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Statt verschachteltem if/else: Jeden Status mit if pruefen und sofort returnen. TypeScript narrowt durch Elimination.",
  },
  {
    sectionIndex: 2,
    question: "Funktioniert Narrowing nach Destrukturierung des Diskriminators?",
    code: 'const { kind } = shape;\nif (kind === "circle") { /* shape.radius? */ }',
    options: [
      "Nein — TypeScript verliert die Verbindung zum Original-Objekt",
      "Ja, genau wie direkt",
      "Nur bei const",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Destrukturierung bricht das Narrowing. TypeScript kann die separate Variable nicht zum Objekt zurueck verfolgen.",
  },

  // ═══ Sektion 3: Algebraische Datentypen ════════════════════════════════
  {
    sectionIndex: 3,
    question: "Was ist ein Sum Type?",
    options: [
      "Ein Typ der genau eine Variante repraesentiert (ODER)",
      "Ein Typ der mehrere Properties hat (UND)",
      "Ein mathematischer Typ",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Sum Type = ODER: Genau eine Variante ist aktiv. Das Gegenteil ist Product Type (UND) = Interface.",
  },
  {
    sectionIndex: 3,
    question: "Was modelliert Option<T>?",
    code: 'type Option<T> = { tag: "some"; value: T } | { tag: "none" };',
    options: [
      "Einen Wert der da sein kann (Some) oder nicht (None) — typsichere null-Alternative",
      "Einen optionalen Parameter",
      "Eine Checkbox",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Option<T> erzwingt die Pruefung ob ein Wert vorhanden ist. Typsicherer als T | null.",
  },
  {
    sectionIndex: 3,
    question: "Was ist der Vorteil von Result<T, E> gegenueber try/catch?",
    options: [
      "Schneller",
      "Funktioniert ohne async",
      "Der Fehlertyp E ist Teil der Signatur — der Aufrufer weiss was schiefgehen kann",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "Bei try/catch ist der Error 'unknown'. Bei Result<T, E> ist der Fehlertyp explizit in der Signatur.",
  },

  // ═══ Sektion 4: Zustandsmodellierung ═══════════════════════════════════
  {
    sectionIndex: 4,
    question: 'Was bedeutet "Make impossible states impossible"?',
    options: [
      "Alle Exceptions abfangen",
      "Alle Inputs validieren",
      "Zustaende so modellieren, dass ungueltige Kombinationen nicht darstellbar sind",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "Discriminated Unions statt Booleans: Nur gueltige Zustaende sind als Typ darstellbar.",
  },
  {
    sectionIndex: 4,
    question: "Wie viele sinnlose Zustaende erlaubt { isLoading: boolean; isError: boolean; data: T | null; error: string | null }?",
    options: [
      "0",
      "4",
      "12 (von 16 Kombinationen sind nur 4 sinnvoll)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "2^4 = 16 Kombinationen, aber nur ~4 sind sinnvoll (idle, loading, error, success). 12 unsinnige Zustaende!",
  },
  {
    sectionIndex: 4,
    question: "Ist AsyncState<T> framework-abhaengig?",
    options: [
      "Ja, nur fuer React",
      "Ja, nur fuer Angular",
      "Nein — derselbe Typ funktioniert in React, Angular, Vue und purem TypeScript",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "AsyncState<T> ist ein reiner TypeScript-Typ — framework-agnostisch. Funktioniert ueberall.",
  },

  // ═══ Sektion 5: Praxis-Patterns ════════════════════════════════════════
  {
    sectionIndex: 5,
    question: "Was ist der Diskriminator bei Redux/NgRx Actions?",
    options: [
      '"payload"',
      "Ich weiss es nicht",
      '"action"',
      '"type"',
    ],
    correct: 3,
    briefExplanation: "Redux/NgRx verwenden konventionell 'type' als Diskriminator fuer Actions.",
  },
  {
    sectionIndex: 5,
    question: "Was macht Extract<Shape, { kind: 'circle' }>?",
    options: [
      "Entfernt die Circle-Variante",
      "Ich weiss es nicht",
      "Erstellt einen neuen Circle-Typ",
      "Extrahiert die Circle-Variante aus der Union",
    ],
    correct: 3,
    briefExplanation: "Extract filtert die Union auf Varianten die zum zweiten Argument passen. Exclude tut das Gegenteil.",
  },
  {
    sectionIndex: 5,
    question: "Wie modelliert man verschiedene API-Fehlertypen typsicher?",
    options: [
      "Ein Error-Objekt mit vielen optionalen Properties",
      "Ich weiss es nicht",
      "try/catch mit instanceof",
      "Eine Discriminated Union mit einer Variante pro Fehlertyp",
    ],
    correct: 3,
    briefExplanation: "Jeder Fehlertyp als eigene Variante mit Tag und spezifischen Properties. Der switch deckt alle Faelle ab.",
  },
];
