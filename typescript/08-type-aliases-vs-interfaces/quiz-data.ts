/**
 * Lektion 08 — Quiz-Daten: Type Aliases vs Interfaces
 *
 * 15 Fragen zu type vs interface, Declaration Merging,
 * extends vs &, Entscheidungsmatrix, Patterns.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "08";
export const lessonTitle = "Type Aliases vs Interfaces";

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const questions: QuizQuestion[] = [
  {
    question: "Erstellt `type UserID = string` einen neuen Typ?",
    options: [
      "Ja — UserID ist ein eigener Typ, unabhaengig von string",
      "Nein — es ist nur ein Alias (Spitzname) fuer string",
      "Ja, aber nur in strict mode",
      "Nur wenn UserID exportiert wird",
    ],
    correct: 1,
    explanation:
      "Ein Type Alias erstellt KEINEN neuen Typ — er gibt einem existierenden " +
      "Typ nur einen Namen. UserID IS string. Ueberall wo string erwartet wird, " +
      "kann UserID verwendet werden und umgekehrt.",
  },

  {
    question: "Was kann `type` was `interface` NICHT kann?",
    options: [
      "Objekt-Typen beschreiben",
      "Union Types, Mapped Types, Conditional Types, Tuple Types",
      "Methoden definieren",
      "Von Klassen implementiert werden",
    ],
    correct: 1,
    explanation:
      "type ist das Allzweck-Werkzeug: Es kann Unions, Intersections, " +
      "Mapped Types, Conditional Types und Tuples — alles was interfaces " +
      "nicht koennen. Interfaces sind auf Objekt-Formen spezialisiert.",
  },

  {
    question: "Was ist Declaration Merging?",
    code: "interface User { name: string; }\ninterface User { email: string; }\n// User hat jetzt name UND email",
    options: [
      "Ein Fehler — man kann ein Interface nicht zweimal deklarieren",
      "Beide Deklarationen werden zu einem Interface zusammengefuehrt",
      "Die zweite Deklaration ueberschreibt die erste",
      "Nur die gemeinsamen Properties bleiben",
    ],
    correct: 1,
    explanation:
      "Declaration Merging ist ein Feature von Interfaces: Mehrere " +
      "Deklarationen mit demselben Namen werden automatisch zusammengefuegt. " +
      "Type Aliases koennen das NICHT — eine doppelte type-Deklaration ist ein Fehler.",
  },

  {
    question: "Wann ist Declaration Merging nuetzlich?",
    options: [
      "Nie — es ist ein Designfehler",
      "Beim Erweitern von Bibliotheks-Typen (z.B. Window, Express.Request)",
      "Nur fuer Legacy-Code",
      "Nur in .d.ts Dateien",
    ],
    correct: 1,
    explanation:
      "Declaration Merging erlaubt es, Bibliotheks-Interfaces zu erweitern " +
      "ohne den Quellcode zu aendern. Z.B. kann man Window um eigene Properties " +
      "erweitern oder Express.Request um Custom-Felder.",
  },

  {
    question: "Was ist der Unterschied zwischen `extends` und `&`?",
    code: "interface B extends A { extra: string; }\ntype B = A & { extra: string; }",
    options: [
      "Kein Unterschied — sie sind austauschbar",
      "extends ist schneller fuer den Compiler und meldet Konflikte als Fehler",
      "& ist schneller",
      "extends funktioniert nur mit Klassen",
    ],
    correct: 1,
    explanation:
      "extends ist fuer den Compiler effizienter (wird gecached) und meldet " +
      "Property-Konflikte direkt als Fehler. & erzeugt bei Konflikten " +
      "stillschweigend never-Properties. Fuer Objekt-Vererbung ist extends besser.",
  },

  {
    question: "Was passiert bei einem Property-Konflikt mit `extends`?",
    code: "interface A { x: string; }\ninterface B extends A { x: number; }",
    options: [
      "x wird zu string & number = never",
      "Compile-Error: Types of property 'x' are incompatible",
      "x wird zu string | number",
      "Die zweite Deklaration gewinnt",
    ],
    correct: 1,
    explanation:
      "extends meldet Konflikte DIREKT als Compile-Error. Das ist ein " +
      "Vorteil gegenueber &, das stillschweigend never-Properties erzeugt. " +
      "extends schuetzt dich vor versehentlichen Inkompatibilitaeten.",
  },

  {
    question: "Kann ein Interface einen Union-Typ beschreiben?",
    options: [
      "Ja: interface StringOrNumber { ... }",
      "Nein — Interfaces koennen nur Objekt-Formen beschreiben",
      "Ja, mit dem | Operator im Interface",
      "Nur in Kombination mit type",
    ],
    correct: 1,
    explanation:
      "Interfaces sind auf Objekt-Formen spezialisiert. Sie koennen keine " +
      "Union Types, Tuple Types oder Primitive-Aliases beschreiben. " +
      "Dafuer braucht man `type`.",
  },

  {
    question: "Was passiert bei einem Property-Konflikt mit `&`?",
    code: "type A = { x: string };\ntype B = { x: number };\ntype AB = A & B; // x ist ???",
    options: [
      "Compile-Error",
      "x wird zu string & number = never (kein Fehler, aber unbrauchbar)",
      "x wird zu string | number",
      "x wird zu string (erstes gewinnt)",
    ],
    correct: 1,
    explanation:
      "Intersection-Konflikte erzeugen KEINEN Fehler! Die Property wird " +
      "string & number = never — technisch gueltig aber kein Wert kann " +
      "je zugewiesen werden. Das ist ein stiller Bug.",
  },

  {
    question: "Welche Aussage ueber `implements` ist korrekt?",
    code: "interface Printable { print(): void; }\nclass Report implements Printable { ... }",
    options: [
      "implements erzeugt Laufzeit-Code",
      "implements ist ein Compile-Zeit-Check dass die Klasse die Interface-Form erfuellt",
      "Nur Interfaces koennen implementiert werden, nicht Types",
      "implements vererbt die Methoden automatisch",
    ],
    correct: 1,
    explanation:
      "implements ist ein reiner Compile-Zeit-Check: TypeScript prueft ob " +
      "die Klasse alle Properties und Methoden des Interfaces hat. " +
      "Es vererbt nichts — die Klasse muss alles selbst implementieren. " +
      "Uebrigens: Auch type-Aliases koennen mit implements verwendet werden.",
  },

  {
    question: "Kann ein Interface eine Funktion beschreiben?",
    code: "interface Formatter {\n  (input: string): string;\n}",
    options: [
      "Nein — Interfaces sind nur fuer Objekte",
      "Ja — mit der Call-Signature-Syntax",
      "Nur mit extends von Function",
      "Nur in .d.ts Deklarationsdateien",
    ],
    correct: 1,
    explanation:
      "Interfaces koennen Call Signatures haben: interface Formatter { (input: string): string; }. " +
      "Das beschreibt eine aufrufbare Funktion. In der Praxis ist " +
      "type Formatter = (input: string) => string haeufiger.",
  },

  {
    question: "Wann empfiehlt der Angular Style Guide Interfaces?",
    options: [
      "Nie — Angular bevorzugt type",
      "Fuer Service-Contracts, DTOs und alles was Objekt-Formen beschreibt",
      "Nur fuer Dependency Injection",
      "Nur fuer Components",
    ],
    correct: 1,
    explanation:
      "Angular bevorzugt Interfaces fuer die meisten Objekt-Typen: " +
      "Service-Contracts, DTOs, Component-Inputs. Declaration Merging " +
      "ist nuetzlich fuer die erweiterbaren Anglar-Oekosystem-Typen.",
  },

  {
    question: "Wann bevorzugt die React-Community `type`?",
    options: [
      "Nie — React bevorzugt interface",
      "Fuer Props (oft Unions), State, und allgemein weil type flexibler ist",
      "Nur fuer Hooks",
      "Nur fuer Styled Components",
    ],
    correct: 1,
    explanation:
      "Die React-Community bevorzugt type: Props sind oft Unions, " +
      "Discriminated Unions fuer State, und type ist flexibler fuer " +
      "die funktionale Programmier-Stil den React foerdert.",
  },

  {
    question: "Was sind die drei Faustregeln fuer type vs interface?",
    options: [
      "Immer type, nie interface",
      "Union/Mapped/Conditional → type, Objekt-Formen → interface (oder type), Konsistenz im Team",
      "Immer interface, nur type fuer Primitives",
      "Es gibt keine klaren Regeln",
    ],
    correct: 1,
    explanation:
      "1) Brauchst du Union/Mapped/Conditional Types → type. " +
      "2) Beschreibst du eine Objekt-Form → interface (oder type — beides OK). " +
      "3) Sei konsistent im Team — die Wahl ist weniger wichtig als Einheitlichkeit.",
  },

  {
    question: "Was kann `interface` was `type` NICHT kann?",
    options: [
      "Union Types definieren",
      "Declaration Merging — ein Interface mehrfach deklarieren und zusammenfuehren",
      "Funktionstypen beschreiben",
      "In Generics verwendet werden",
    ],
    correct: 1,
    explanation:
      "Declaration Merging ist das einzige Feature das nur Interfaces haben. " +
      "Eine doppelte type-Deklaration ist ein Fehler. Interfaces koennen " +
      "erweitert werden, ohne die urspruengliche Deklaration zu aendern.",
  },

  {
    question: "Welches Tool erzwingt team-weite type/interface-Konsistenz?",
    options: [
      "TypeScript Compiler",
      "ESLint mit @typescript-eslint/consistent-type-definitions",
      "Prettier",
      "tsconfig.json",
    ],
    correct: 1,
    explanation:
      "Die ESLint-Regel @typescript-eslint/consistent-type-definitions kann " +
      "erzwingen, ob das Team immer type oder immer interface fuer Objekt-Typen " +
      "verwendet. Konsistenz ist wichtiger als die 'richtige' Wahl.",
  },
];

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect: "Type Aliases sind Spitznamen — sie erstellen keinen strukturell neuen Typ. UserID und string sind identisch.",
    commonMistake: "Viele erwarten nominale Typisierung wie in Java. TypeScript ist strukturell typisiert — der Alias aendert nichts am Typ.",
  },
  1: {
    whyCorrect: "type ist das Allzweck-Werkzeug. Union, Mapped, Conditional und Tuple Types gehen nur mit type.",
    commonMistake: "Manche denken, interface kann alles was type kann. Fuer Nicht-Objekt-Typen ist type Pflicht.",
  },
  2: {
    whyCorrect: "Interfaces mit gleichem Namen werden zusammengefuehrt. Alle Properties aus beiden Deklarationen bilden ein Interface.",
    commonMistake: "Aus anderen Sprachen kommend erwartet man einen Fehler bei doppelter Deklaration.",
  },
  3: {
    whyCorrect: "Declaration Merging erweitert Bibliotheks-Typen ohne deren Quellcode zu aendern — Module Augmentation.",
    commonMistake: "Viele denken, es ist nur ein Versehen wenn man ein Interface zweimal deklariert.",
  },
  4: {
    whyCorrect: "extends wird gecached und meldet Konflikte. & ist flexibler aber erzeugt stille never-Properties.",
    commonMistake: "Viele halten extends und & fuer identisch. Der Compiler behandelt sie unterschiedlich.",
  },
  5: {
    whyCorrect: "extends schlaegt sofort Alarm bei inkompatiblen Properties. Das ist sicherer als das stille never von &.",
    commonMistake: "Manche erwarten, dass extends die Property ueberschreibt. Es erzwingt Kompatibilitaet.",
  },
  6: {
    whyCorrect: "Interfaces sind auf Objekt-Formen spezialisiert. Fuer alles andere braucht man type.",
    commonMistake: "Einige versuchen Union Types mit Interfaces zu simulieren. Das funktioniert nicht.",
  },
  7: {
    whyCorrect: "Intersection-Konflikte erzeugen nie einen Fehler — nur eine never-Property. Still und gefaehrlich.",
    commonMistake: "Fast jeder erwartet einen Compile-Error. Das stille never ist ein haeufiger Bug.",
  },
  8: {
    whyCorrect: "implements ist rein ein Compile-Zeit-Check. Es erzeugt keinen Code und vererbt nichts.",
    commonMistake: "Viele denken, implements vererbt Methoden wie extends bei Klassen.",
  },
  9: {
    whyCorrect: "Interfaces koennen Call Signatures haben. In der Praxis ist die type-Syntax haeufiger.",
    commonMistake: "Manche denken, nur type kann Funktionen beschreiben. Interfaces koennen es auch.",
  },
  10: {
    whyCorrect: "Angular bevorzugt Interfaces fuer Objekt-Typen wegen Declaration Merging und extends.",
    commonMistake: "Manche denken, Angular verlangt Interfaces. Es ist eine Empfehlung, keine Pflicht.",
  },
  11: {
    whyCorrect: "React nutzt viel funktionale Muster: Union-Props, Discriminated States — type passt besser.",
    commonMistake: "Manche denken, in React muss man type verwenden. Interface funktioniert auch fuer Props.",
  },
  12: {
    whyCorrect: "Die drei Regeln decken 95% der Faelle ab. Konsistenz ist das Wichtigste.",
    commonMistake: "Viele suchen die 'perfekte' Regel. In Wahrheit ist Teamkonsistenz wichtiger.",
  },
  13: {
    whyCorrect: "Declaration Merging ist das Alleinstellungsmerkmal von Interfaces. Type Aliases koennen das nicht.",
    commonMistake: "Einige verwechseln Declaration Merging mit Intersection. Es sind verschiedene Mechanismen.",
  },
  14: {
    whyCorrect: "ESLint erzwingt team-weite Konsistenz. Der Compiler hat keine Meinung zu type vs interface.",
    commonMistake: "Manche denken, tsconfig.json kann type vs interface erzwingen. Das geht nur ueber Linting.",
  },
};
