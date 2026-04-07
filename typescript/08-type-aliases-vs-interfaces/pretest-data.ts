/**
 * Lektion 08 — Pre-Test-Fragen: Type Aliases vs Interfaces
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
  // ═══ Sektion 1: Type Aliases Deep Dive ══════════════════════════════════
  { sectionIndex: 1, question: "Erstellt `type UserID = string` einen neuen, eigenstaendigen Typ?", options: ["Ja", "Nein — nur ein Alias/Spitzname", "Nur in strict mode", "Ich weiss es nicht"], correct: 1, briefExplanation: "Type Aliases erstellen keinen neuen Typ. UserID IST string — nur mit anderem Namen." },
  { sectionIndex: 1, question: "Koennen Type Aliases Union Types beschreiben?", options: ["Nein, nur Interfaces", "Ja — type A = B | C", "Nur mit Workaround", "Ich weiss es nicht"], correct: 1, briefExplanation: "Union Types sind ein Kernfeature von type. Interfaces koennen das nicht." },
  { sectionIndex: 1, question: "Was sind Mapped Types?", code: "type Readonly<T> = { readonly [K in keyof T]: T[K] };", options: ["Ein Pattern fuer for-Schleifen", "Typen die ueber Properties iterieren und sie transformieren", "Ein Interface-Feature", "Ich weiss es nicht"], correct: 1, briefExplanation: "Mapped Types transformieren Properties — z.B. alle readonly oder optional machen. Nur mit type moeglich." },

  // ═══ Sektion 2: Interfaces Deep Dive ════════════════════════════════════
  { sectionIndex: 2, question: "Was passiert wenn man ein Interface zweimal deklariert?", options: ["Fehler — doppelte Deklaration", "Declaration Merging — beide werden zusammengefuehrt", "Die zweite ueberschreibt die erste", "Ich weiss es nicht"], correct: 1, briefExplanation: "Declaration Merging fuegt Properties aus allen gleichnamigen Interface-Deklarationen zusammen." },
  { sectionIndex: 2, question: "Was macht `implements` bei einer Klasse?", options: ["Prueft ob die Klasse die Interface-Form erfuellt (Compile-Zeit)", "Vererbt Methoden vom Interface", "Erzeugt Laufzeit-Code", "Ich weiss es nicht"], correct: 0, briefExplanation: "implements vererbt nichts — es ist ein reiner Compile-Zeit-Check. Die Klasse muss selbst implementieren." },
  { sectionIndex: 2, question: "Kann ein Interface ein anderes erweitern?", code: "interface Admin extends User { ... }", options: ["Ja, mit extends — Admin erbt alle Properties von User", "Nein, extends ist nur fuer Klassen", "Nur mit Intersection", "Ich weiss es nicht"], correct: 0, briefExplanation: "Interfaces koennen andere Interfaces mit extends erweitern. Alle Properties werden geerbt." },

  // ═══ Sektion 3: Der grosse Vergleich ════════════════════════════════════
  { sectionIndex: 3, question: "Was kann type was interface NICHT kann?", options: ["Union Types, Mapped Types, Conditional Types, Tuples", "Objekte beschreiben", "Methoden definieren", "Ich weiss es nicht"], correct: 0, briefExplanation: "type ist das Allzweck-Werkzeug fuer alles was ueber Objekt-Formen hinausgeht." },
  { sectionIndex: 3, question: "Was kann interface was type NICHT kann?", options: ["Declaration Merging", "Funktionen beschreiben", "Generics verwenden", "Ich weiss es nicht"], correct: 0, briefExplanation: "Declaration Merging ist das Alleinstellungsmerkmal von Interfaces." },
  { sectionIndex: 3, question: "Was ist schneller fuer den Compiler: extends oder &?", options: ["Kein Unterschied", "& — einfachere Auswertung", "extends — wird gecached und meldet Konflikte frueh", "Ich weiss es nicht"], correct: 2, briefExplanation: "extends ist effizienter (gecached) und meldet Konflikte als Fehler statt stille never-Properties." },

  // ═══ Sektion 4: Entscheidungsmatrix ═════════════════════════════════════
  { sectionIndex: 4, question: "Was ist die wichtigste Regel bei type vs interface?", options: ["Immer type verwenden", "Immer interface verwenden", "Konsistenz im Team — die Wahl ist weniger wichtig als Einheitlichkeit", "Ich weiss es nicht"], correct: 2, briefExplanation: "Konsistenz ist wichtiger als die 'perfekte' Wahl. ESLint kann das erzwingen." },
  { sectionIndex: 4, question: "Wann MUSS man type verwenden?", options: ["Fuer Objekte", "Immer", "Fuer Union Types, Mapped Types, Conditional Types", "Ich weiss es nicht"], correct: 2, briefExplanation: "Diese Typ-Konstruktionen sind nur mit type moeglich." },
  { sectionIndex: 4, question: "Wann MUSS man interface verwenden?", options: ["Fuer alle Objekt-Typen", "Nie — type kann alles", "Fuer Declaration Merging (z.B. Library-Augmentation)", "Ich weiss es nicht"], correct: 2, briefExplanation: "Declaration Merging geht nur mit interface. Fuer Library-Erweiterung ist es Pflicht." },

  // ═══ Sektion 5: Patterns und Best Practices ═════════════════════════════
  { sectionIndex: 5, question: "Was bevorzugt der Angular Style Guide?", options: ["Immer type", "Ich weiss es nicht", "Nie Interfaces", "Interface fuer Objekt-Typen (Services, DTOs)"], correct: 3, briefExplanation: "Angular bevorzugt Interfaces fuer die meisten Objekt-Typen — wegen DI und extends." },
  { sectionIndex: 5, question: "Was bevorzugt die React-Community?", options: ["Interface fuer alles", "Ich weiss es nicht", "Keine Praeferenz", "type — wegen Unions, funktionalem Stil"], correct: 3, briefExplanation: "React nutzt viel Unions und funktionale Patterns — type passt besser." },
  { sectionIndex: 5, question: "Welches Tool erzwingt team-weite Konsistenz?", options: ["TypeScript Compiler", "Ich weiss es nicht", "Prettier", "ESLint mit consistent-type-definitions"], correct: 3, briefExplanation: "ESLint kann erzwingen ob immer type oder immer interface fuer Objekt-Typen verwendet wird." },
];
