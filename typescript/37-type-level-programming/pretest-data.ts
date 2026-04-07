// pretest-data.ts — L37: Type-Level Programming
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Types als Sprache ───────────────────────────────────────

  {
    sectionId: 1,
    question: "Was bedeutet 'Turing-vollstaendig' fuer ein Typsystem?",
    options: [
      "Es kann jede berechenbare Funktion ausdruecken",
      "Es kann JavaScript-Code ausfuehren",
      "Es unterstuetzt alle Datentypen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Turing-Vollstaendigkeit bedeutet dass das System Variablen, Bedingungen, Schleifen und Datenstrukturen hat.",
  },
  {
    sectionId: 1,
    question: "Welche drei Bausteine machen TypeScript's Typsystem zu einer Programmiersprache?",
    options: [
      "Interfaces, Classes, Enums",
      "Conditional Types, Rekursion, Mapped Types",
      "Generics, Unions, Intersections",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Conditional Types = Bedingungen, Rekursion = Schleifen, Mapped Types = Iteration ueber Datenstrukturen.",
  },
  {
    sectionId: 1,
    question: "Was ist das Aequivalent von 'if/else' auf Type-Level?",
    options: [
      "Mapped Types",
      "Union Types",
      "Conditional Types (T extends U ? A : B)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "T extends U ? A : B prueft eine Bedingung und gibt basierend darauf verschiedene Typen zurueck.",
  },

  // ─── Sektion 2: Arithmetik auf Type-Level ───────────────────────────────

  {
    sectionId: 2,
    question: "Warum kann man auf Type-Level nicht einfach '3 + 4' schreiben?",
    options: [
      "TypeScript hat keinen + Operator fuer Typen",
      "Zahlen existieren nicht auf Type-Level",
      "Das waere zu langsam",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Es gibt keinen arithmetischen Operator auf Type-Level. Man nutzt den Tuple-Length-Trick als Workaround.",
  },
  {
    sectionId: 2,
    question: "Was ist der 'Tuple-Length-Trick'?",
    options: [
      "Arrays werden automatisch nach Laenge sortiert",
      "Zahlen werden durch Tuple-Laengen repraesentiert — [unknown, unknown, unknown]['length'] = 3",
      "Tuples koennen nur eine bestimmte Laenge haben",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Tuples haben Literal-Laengen. Durch Hinzufuegen/Entfernen von Elementen simuliert man Arithmetik.",
  },
  {
    sectionId: 2,
    question: "Was ist NTuple<string, 3>?",
    options: [
      "string[]",
      "[string, string, string]",
      "Array<3>",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "NTuple erzeugt ein Tuple mit exakt N Elementen vom Typ T. NTuple<string, 3> = [string, string, string].",
  },

  // ─── Sektion 3: String-Parsing auf Type-Level ──────────────────────────

  {
    sectionId: 3,
    question: "Kann TypeScript Strings zur Compilezeit zerlegen?",
    options: [
      "Nein, Strings sind immer 'string' auf Type-Level",
      "Ja, mit Template Literal Types und infer",
      "Nur mit externen Plugins",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Template Literal Types + infer ermoeglichen Pattern-Matching auf Strings: `${infer A}/${infer B}` zerlegt 'a/b'.",
  },
  {
    sectionId: 3,
    question: "Was koennte ein Type-Level URL-Parser aus '/users/:id' extrahieren?",
    options: [
      "Den String '/users/:id' unveraendert",
      "Den Typ { id: string }",
      "Die URL als number",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Template Literal Types koennen :id erkennen und daraus { id: string } ableiten — die Basis fuer typsichere Router.",
  },
  {
    sectionId: 3,
    question: "Welche String-Operationen kann man auf Type-Level implementieren?",
    options: [
      "Split, Replace, Trim und mehr — alles mit Template Literals und Rekursion",
      "Keine — Strings sind zur Compilezeit nicht manipulierbar",
      "Nur Uppercase und Lowercase",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Mit Template Literal Types + infer + Rekursion kann man Split, Replace, Trim und beliebig komplexe String-Operationen bauen.",
  },

  // ─── Sektion 4: Pattern Matching ────────────────────────────────────────

  {
    sectionId: 4,
    question: "Was macht 'infer' in einem Conditional Type?",
    options: [
      "Es extrahiert Teile eines Typs in Variablen — wie Destructuring auf Type-Level",
      "Es inferiert den Rueckgabetyp einer Funktion",
      "Es macht einen Typ optional",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "infer bindet eine Typ-Variable an den passenden Teil des Patterns. T extends [infer F, ...infer R] extrahiert erstes Element und Rest.",
  },
  {
    sectionId: 4,
    question: "Kann man mehrere infer-Variablen in einem Conditional Type verwenden?",
    options: [
      "Nein, nur eine pro Conditional Type",
      "Nur in verschachtelten Conditional Types",
      "Ja, beliebig viele — z.B. T extends (a: infer A, b: infer B) => infer R",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Mehrfaches infer erlaubt komplexe Destrukturierung in einem einzigen Pattern.",
  },
  {
    sectionId: 4,
    question: "Was ist 'infer K extends string' (TypeScript 4.7+)?",
    options: [
      "K wird als string festgelegt",
      "Ein Syntax-Fehler",
      "K wird inferiert UND muss den Constraint string erfuellen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Kombiniert Inferenz und Constraint: K wird extrahiert, aber nur wenn es string zuweisbar ist.",
  },

  // ─── Sektion 5: Recursive Type Challenges ──────────────────────────────

  {
    sectionId: 5,
    question: "Was ist das TypeScript-Rekursionslimit fuer Typen?",
    options: [
      "Es gibt kein Limit",
      "Genau 100",
      "Ca. 1000 mit Tail-Call-Optimierung (seit TS 4.5)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Seit TS 4.5 erkennt der Compiler Tail-Recursive Conditional Types und erlaubt ca. 1000 Rekursionsschritte.",
  },
  {
    sectionId: 5,
    question: "Was ist PathOf<T>?",
    options: [
      "Der Dateipfad eines TypeScript-Moduls",
      "Ich weiss es nicht",
      "Ein Utility-Typ fuer Node.js-Pfade",
      "Ein Typ der alle moeglichen Pfade zu verschachtelten Properties als Union erzeugt",
    ],
    correct: 3,
    explanation: "PathOf<{ a: { b: string } }> = 'a' | 'a.b' — alle Pfade als String-Literal-Union.",
  },
  {
    sectionId: 5,
    question: "Was ist der Accumulator-Pattern auf Type-Level?",
    options: [
      "Ein Pattern das Zahlen akkumuliert",
      "Ich weiss es nicht",
      "Ein Pattern fuer Array-Reduktionen",
      "Ein zusaetzlicher Typparameter der das Zwischenergebnis traegt fuer Tail-Call-Optimierung",
    ],
    correct: 3,
    explanation: "Der Accumulator traegt das Ergebnis im Parameter statt es nach der Rekursion zusammenzubauen — das ermoeglicht Tail-Call-Optimierung.",
  },

  // ─── Sektion 6: Praxis ─────────────────────────────────────────────────

  {
    sectionId: 6,
    question: "Was ist UnionToIntersection?",
    options: [
      "Ein Typ der Unions in Intersections umwandelt — z.B. A | B wird A & B",
      "Ein Typ der Intersections in Unions umwandelt",
      "Ein Compiler-Feature fuer Performance",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "UnionToIntersection nutzt kontravariante Funktions-Parameter um A | B zu A & B zu machen.",
  },
  {
    sectionId: 6,
    question: "Wann lohnt sich Type-Level Programming am meisten?",
    options: [
      "Fuer alle Typen im Projekt",
      "Ich weiss es nicht",
      "Nur fuer Tests",
      "An Schnittstellen: APIs, Router, ORMs, Bibliotheken",
    ],
    correct: 3,
    explanation: "Schnittstellen sind stabil und werden oft aufgerufen — Type-Level-Sicherheit dort verhindert ganze Fehlerkategorien.",
  },
  {
    sectionId: 6,
    question: "Was ist die wichtigste Frage vor dem Einsatz von Type-Level Programming?",
    options: [
      "Ist es technisch moeglich?",
      "Ich weiss es nicht",
      "Wie viele Zeilen spart es?",
      "Braucht der Nutzer diese Typsicherheit — oder ist es Over-Engineering?",
    ],
    correct: 3,
    explanation: "Die Frage ist nicht 'kann ich?' sondern 'sollte ich?'. Type-Level-Komplexitaet muss durch echten Nutzen gerechtfertigt sein.",
  },
];
