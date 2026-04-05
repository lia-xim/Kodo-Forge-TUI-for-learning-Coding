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
      "Union Types, Mapped Types, Conditional Types, Tuple Types",
      "Objekt-Typen beschreiben",
      "Methoden definieren",
      "Von Klassen implementiert werden",
    ],
    correct: 0,
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
      "Die zweite Deklaration ueberschreibt die erste",
      "Beide Deklarationen werden zu einem Interface zusammengefuehrt",
      "Nur die gemeinsamen Properties bleiben",
    ],
    correct: 2,
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
      "extends ist schneller fuer den Compiler und meldet Konflikte als Fehler",
      "Kein Unterschied — sie sind austauschbar",
      "& ist schneller",
      "extends funktioniert nur mit Klassen",
    ],
    correct: 0,
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
      "x wird zu string | number",
      "Compile-Error: Types of property 'x' are incompatible",
      "Die zweite Deklaration gewinnt",
    ],
    correct: 2,
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
      "x wird zu string & number = never (kein Fehler, aber unbrauchbar)",
      "Compile-Error",
      "x wird zu string | number",
      "x wird zu string (erstes gewinnt)",
    ],
    correct: 0,
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
      "Nur Interfaces koennen implementiert werden, nicht Types",
      "implements ist ein Compile-Zeit-Check dass die Klasse die Interface-Form erfuellt",
      "implements vererbt die Methoden automatisch",
    ],
    correct: 2,
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
      "Fuer Service-Contracts, DTOs und alles was Objekt-Formen beschreibt",
      "Nie — Angular bevorzugt type",
      "Nur fuer Dependency Injection",
      "Nur fuer Components",
    ],
    correct: 0,
    explanation:
      "Angular bevorzugt Interfaces fuer die meisten Objekt-Typen: " +
      "Service-Contracts, DTOs, Component-Inputs. Declaration Merging " +
      "ist nuetzlich fuer die erweiterbaren Anglar-Oekosystem-Typen.",
  },

  {
    question: "Wann bevorzugt die React-Community `type`?",
    options: [
      "Nie — React bevorzugt interface",
      "Nur fuer Hooks",
      "Nur fuer Styled Components",
      "Fuer Props (oft Unions), State, und allgemein weil type flexibler ist",
    ],
    correct: 3,
    explanation:
      "Die React-Community bevorzugt type: Props sind oft Unions, " +
      "Discriminated Unions fuer State, und type ist flexibler fuer " +
      "die funktionale Programmier-Stil den React foerdert.",
  },

  {
    question: "Was sind die drei Faustregeln fuer type vs interface?",
    options: [
      "Immer type, nie interface",
      "Immer interface, nur type fuer Primitives",
      "Es gibt keine klaren Regeln",
      "Union/Mapped/Conditional → type, Objekt-Formen → interface (oder type), Konsistenz im Team",
    ],
    correct: 3,
    explanation:
      "1) Brauchst du Union/Mapped/Conditional Types → type. " +
      "2) Beschreibst du eine Objekt-Form → interface (oder type — beides OK). " +
      "3) Sei konsistent im Team — die Wahl ist weniger wichtig als Einheitlichkeit.",
  },

  {
    question: "Was kann `interface` was `type` NICHT kann?",
    options: [
      "Union Types definieren",
      "Funktionstypen beschreiben",
      "Declaration Merging — ein Interface mehrfach deklarieren und zusammenfuehren",
      "In Generics verwendet werden",
    ],
    correct: 2,
    explanation:
      "Declaration Merging ist das einzige Feature das nur Interfaces haben. " +
      "Eine doppelte type-Deklaration ist ein Fehler. Interfaces koennen " +
      "erweitert werden, ohne die urspruengliche Deklaration zu aendern.",
  },

  {
    question: "Welches Tool erzwingt team-weite type/interface-Konsistenz?",
    options: [
      "TypeScript Compiler",
      "Prettier",
      "tsconfig.json",
      "ESLint mit @typescript-eslint/consistent-type-definitions",
    ],
    correct: 3,
    explanation:
      "Die ESLint-Regel @typescript-eslint/consistent-type-definitions kann " +
      "erzwingen, ob das Team immer type oder immer interface fuer Objekt-Typen " +
      "verwendet. Konsistenz ist wichtiger als die 'richtige' Wahl.",
  },

  // ─── Zusaetzliche Formate ────────────────────────────────────────────────────

  // --- Frage 16: Short-Answer — Declaration Merging ---
  {
    type: "short-answer",
    question: "Welches Keyword unterstuetzt Declaration Merging — type oder interface?",
    expectedAnswer: "interface",
    acceptableAnswers: ["interface", "Interface", "interfaces"],
    explanation:
      "Nur Interfaces unterstuetzen Declaration Merging. Mehrere Deklarationen mit " +
      "demselben Namen werden automatisch zusammengefuegt. Bei type wuerde eine " +
      "doppelte Deklaration einen 'Duplicate identifier'-Fehler erzeugen.",
  },

  // --- Frage 17: Short-Answer — Property-Konflikt bei & ---
  {
    type: "short-answer",
    question: "Was wird der Typ von `x` in `type AB = { x: string } & { x: number }`?",
    expectedAnswer: "never",
    acceptableAnswers: ["never", "string & number", "string & number = never"],
    explanation:
      "Bei Intersection-Konflikten wird die Property zu string & number = never. " +
      "Das erzeugt keinen Compile-Error, macht die Property aber unbrauchbar — " +
      "kein Wert ist gleichzeitig string UND number. Ein stiller Bug!",
  },

  // --- Frage 18: Short-Answer — ESLint-Regel ---
  {
    type: "short-answer",
    question: "Wie heisst die ESLint-Regel die type vs interface Konsistenz erzwingt?",
    expectedAnswer: "consistent-type-definitions",
    acceptableAnswers: [
      "consistent-type-definitions",
      "@typescript-eslint/consistent-type-definitions",
      "typescript-eslint/consistent-type-definitions",
    ],
    explanation:
      "Die Regel @typescript-eslint/consistent-type-definitions erzwingt, ob " +
      "das Team fuer Objekt-Typen immer type oder immer interface verwendet.",
  },

  // --- Frage 19: Predict-Output — Declaration Merging ---
  {
    type: "predict-output",
    question: "Kompiliert dieser Code fehlerfrei? Antworte mit 'ja' oder 'nein'.",
    code: "interface Settings {\n  theme: string;\n}\ninterface Settings {\n  lang: string;\n}\nconst s: Settings = { theme: 'dark', lang: 'de' };",
    expectedAnswer: "ja",
    acceptableAnswers: ["ja", "Ja", "yes"],
    explanation:
      "Declaration Merging fuegt beide Interface-Deklarationen zusammen. " +
      "Settings hat am Ende sowohl theme als auch lang. Das Objekt erfuellt " +
      "beide Properties — kein Fehler.",
  },

  // --- Frage 20: Predict-Output — extends-Konflikt ---
  {
    type: "predict-output",
    question: "Kompiliert dieser Code fehlerfrei? Antworte mit 'ja' oder 'nein'.",
    code: "interface Base {\n  id: string;\n}\ninterface Extended extends Base {\n  id: number;\n}",
    expectedAnswer: "nein",
    acceptableAnswers: ["nein", "Nein", "no"],
    explanation:
      "extends meldet Property-Konflikte direkt als Compile-Error: " +
      "'Types of property id are incompatible'. id ist in Base string, " +
      "aber Extended will number — das ist inkompatibel. " +
      "Bei & wuerde id stillschweigend zu never werden.",
  },

  // --- Frage 21: Explain-Why — type vs interface ---
  {
    type: "explain-why",
    question: "Warum ist Konsistenz im Team oft wichtiger als die 'richtige' Wahl zwischen type und interface?",
    modelAnswer:
      "Fuer die meisten Objekt-Typen sind type und interface funktional gleichwertig. " +
      "Unterschiede (Declaration Merging, Compiler-Performance) betreffen nur Randfaelle. " +
      "Inkonsistenter Stil im Team erzeugt unnoetige kognitive Last beim Code-Review " +
      "und macht den Code uneinheitlich. Eine klare Team-Konvention (egal welche) " +
      "reduziert Diskussionen und verbessert die Lesbarkeit.",
    keyPoints: [
      "Funktional meist gleichwertig fuer Objekt-Typen",
      "Konsistenz reduziert kognitive Last",
      "Team-Konvention wichtiger als technische Nuancen",
    ],
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
