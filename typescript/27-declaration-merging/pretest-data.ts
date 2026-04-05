// pretest-data.ts — L27: Declaration Merging
// 15 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Interface Merging Basics ─────────────────────────────────

  {
    sectionId: 1,
    question: "Was denkst du passiert wenn zwei Interfaces den gleichen Namen haben?",
    options: [
      "Compile-Error wegen Doppeldeklaration",
      "Sie werden automatisch vereint (Merging)",
      "Das zweite ueberschreibt das erste",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "TypeScript vereint gleichnamige Interfaces automatisch zu einem.",
  },
  {
    sectionId: 1,
    question: "Kann man auch 'type' Deklarationen mergen wie Interfaces?",
    options: [
      "Ja, alle Deklarationen koennen gemergt werden",
      "Nein, nur 'interface' unterstuetzt Merging — 'type' gibt einen Fehler bei Doppeldeklaration",
      "Nur mit speziellen Compiler-Flags",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "'interface' ist offen (erweiterbar), 'type' ist geschlossen (einmalige Zuweisung).",
  },
  {
    sectionId: 1,
    question: "Was passiert wenn beim Interface Merging dasselbe Property verschiedene Typen hat?",
    options: [
      "TypeScript bildet eine Union aus beiden Typen",
      "Der spaetere Typ gewinnt",
      "Compile-Error — Properties muessen den gleichen Typ haben",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Gleiche Properties muessen den gleichen Typ haben. Verschiedene Typen → Compile-Error.",
  },

  // ─── Sektion 2: Module Augmentation ──────────────────────────────────────

  {
    sectionId: 2,
    question: "Wie kann man in TypeScript die Typen eines npm-Pakets erweitern?",
    options: [
      "Die .d.ts-Datei im node_modules direkt editieren",
      "Mit 'declare module \"paketname\"' und Interface Merging",
      "Das geht nicht — npm-Typen sind unveraenderlich",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Module Augmentation mit 'declare module' erweitert fremde Module ohne ihre Dateien zu aendern.",
  },
  {
    sectionId: 2,
    question: "Express hat ein Request-Interface. Wie fuegst du 'user' hinzu?",
    options: [
      "interface Request extends Express.Request { user: User }",
      "declare module 'express-serve-static-core' { interface Request { user: User } }",
      "(req as any).user = currentUser",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Module Augmentation auf 'express-serve-static-core' erweitert das Request-Interface.",
  },
  {
    sectionId: 2,
    question: "Was passiert wenn der Modulname in 'declare module' falsch ist?",
    options: [
      "Compile-Error",
      "Ein neues, separates Modul wird erstellt — kein Merging",
      "TypeScript korrigiert den Namen automatisch",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Bei falschem Namen: kein Error, aber auch kein Merging. Ein neues Modul entsteht.",
  },

  // ─── Sektion 3: Global Augmentation ──────────────────────────────────────

  {
    sectionId: 3,
    question: "Wie erweitert man window um eigene Properties in TypeScript?",
    options: [
      "(window as any).myProp = value",
      "declare global { interface Window { myProp: string } }",
      "window.myProp ist automatisch typisiert",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Global Augmentation mit 'declare global' erweitert das Window-Interface typsicher.",
  },
  {
    sectionId: 3,
    question: "Welches Keyword braucht man fuer globale Variablen in 'declare global'?",
    options: [
      "const",
      "let",
      "var",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "'var' ist die korrekte Syntax fuer globale Variablen — let/const sind block-scoped.",
  },
  {
    sectionId: 3,
    question: "Kann man process.env in TypeScript typsicher machen?",
    options: [
      "Nein, process.env ist immer Record<string, string | undefined>",
      "Ja, mit Global Augmentation auf NodeJS.ProcessEnv",
      "Nur mit einer Validierungs-Bibliothek wie zod",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "declare global { namespace NodeJS { interface ProcessEnv { ... } } } macht env typsicher.",
  },

  // ─── Sektion 4: Declaration Files (.d.ts) ───────────────────────────────

  {
    sectionId: 4,
    question: "Was ist eine .d.ts-Datei?",
    options: [
      "Eine kompilierte TypeScript-Datei",
      "Eine reine Typ-Deklarationsdatei ohne Implementierung",
      "Eine Debug-Datei fuer TypeScript",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: ".d.ts-Dateien enthalten nur Typ-Deklarationen — keinen ausfuehrbaren Code.",
  },
  {
    sectionId: 4,
    question: "Was macht das 'declare' Keyword vor einer Funktion in einer .d.ts-Datei?",
    options: [
      "Es exportiert die Funktion",
      "Es sagt: 'Diese Funktion existiert woanders — hier ist nur der Typ'",
      "Es macht die Funktion abstract",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "'declare' beschreibt was existiert, ohne es zu implementieren.",
  },
  {
    sectionId: 4,
    question: "Was ist DefinitelyTyped (@types/*)?",
    options: [
      "TypeScript's eigener Compiler",
      "Eine Community-Sammlung von .d.ts-Dateien fuer JavaScript-Bibliotheken",
      "Ein Testing-Framework",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "DefinitelyTyped stellt @types/*-Pakete bereit — Typ-Definitionen fuer tausende JS-Libraries.",
  },

  // ─── Sektion 5: Praxis (Express/React erweitern) ────────────────────────

  {
    sectionId: 5,
    question: "Warum ist '(req as any).user' schlecht?",
    options: [
      "Es ist langsamer als typisierte Zugriffe",
      "'as any' deaktiviert Typsicherheit — Tippfehler werden nicht erkannt",
      "Express verbietet Casts auf Request",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "'as any' deaktiviert alle Typ-Pruefungen. req.usr (Tippfehler) → kein Error.",
  },
  {
    sectionId: 5,
    question: "Was ist der erste Debugging-Schritt wenn eine Augmentation nicht funktioniert?",
    options: [
      "TypeScript neu installieren",
      "Pruefen ob die .d.ts-Datei in tsconfig.json eingebunden ist",
      "Den Modulnamen grossschreiben",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Die haeufigste Ursache: Die .d.ts-Datei ist nicht im 'include'-Pfad der tsconfig.json.",
  },
  {
    sectionId: 5,
    question: "Wie typisiert man Custom Web Components in React/JSX?",
    options: [
      "Mit einer speziellen JSX-Compiler-Option",
      "declare module 'react' { namespace JSX { interface IntrinsicElements { ... } } }",
      "Custom Elements brauchen keine Typisierung",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "JSX.IntrinsicElements erweitern via Module Augmentation auf 'react'.",
  },
];
