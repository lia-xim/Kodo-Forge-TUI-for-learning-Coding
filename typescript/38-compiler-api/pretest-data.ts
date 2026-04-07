// pretest-data.ts — L38: Compiler API
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: ts.createProgram und AST ────────────────────────────────

  {
    sectionId: 1,
    question: "Was ist ein Abstract Syntax Tree (AST)?",
    options: [
      "Eine Baumstruktur die die Syntax von Quellcode repraesentiert",
      "Ein Debugging-Tool",
      "Eine Art von Datenbank",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Der AST repraesentiert Code als Baum — jeder Knoten steht fuer ein Syntax-Element (Funktion, Variable, Ausdruck, etc.).",
  },
  {
    sectionId: 1,
    question: "Kann man den TypeScript-Compiler programmatisch in eigenem Code verwenden?",
    options: [
      "Nein, tsc ist nur ein CLI-Tool",
      "Ja, ueber die Compiler API (import * as ts from 'typescript')",
      "Nur mit speziellen Plugins",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Die Compiler API ist im npm-Paket 'typescript' enthalten und kann direkt importiert werden.",
  },
  {
    sectionId: 1,
    question: "Was ist der Unterschied zwischen Node, Symbol und Type in der Compiler API?",
    options: [
      "Alles dasselbe — verschiedene Namen fuer AST-Knoten",
      "Node = Syntax, Symbol = benannte Entity, Type = Typ-Information",
      "Node = Datei, Symbol = Funktion, Type = Variable",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Drei Ebenen: Node (wo steht es), Symbol (was bedeutet der Name), Type (welcher Typ).",
  },

  // ─── Sektion 2: Nodes traversieren ──────────────────────────────────────

  {
    sectionId: 2,
    question: "Was macht ts.forEachChild?",
    options: [
      "Besucht alle Nodes im gesamten AST",
      "Besucht nur die direkten Kinder eines Nodes",
      "Besucht nur Identifier-Nodes",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "forEachChild besucht nur Direktkinder. Fuer den gesamten Baum braucht man rekursive Aufrufe.",
  },
  {
    sectionId: 2,
    question: "Was ist das Visitor-Pattern im Kontext von ASTs?",
    options: [
      "Ein Pattern bei dem ein Objekt verschiedene Node-Typen unterschiedlich behandelt",
      "Ein Pattern fuer parallele Verarbeitung",
      "Ein Pattern fuer Fehlerbehandlung",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Der Visitor traversiert den Baum und reagiert auf spezifische Node-Typen mit spezifischen Aktionen.",
  },
  {
    sectionId: 2,
    question: "Warum hat TypeScript's AST kein generisches 'children'-Array?",
    options: [
      "Das waere zu langsam",
      "Jeder Node-Typ hat spezifische Properties — forEachChild kennt die Struktur",
      "TypeScript-AST ist kein richtiger Baum",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "FunctionDeclaration hat .name, .parameters, .body als spezifische Properties statt eines generischen children-Arrays.",
  },

  // ─── Sektion 3: Type Checker API ────────────────────────────────────────

  {
    sectionId: 3,
    question: "Was gibt checker.getTypeAtLocation(node) zurueck?",
    options: [
      "Einen String mit dem Typnamen",
      "Den aufgeloesten Typ (nach Inferenz und Narrowing) als Type-Objekt",
      "Einen Boolean ob der Node typisiert ist",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "getTypeAtLocation gibt ein Type-Objekt zurueck das den vollstaendig aufgeloesten Typ repraesentiert.",
  },
  {
    sectionId: 3,
    question: "Wofuer ist checker.getSymbolAtLocation nützlich?",
    options: [
      "Um herauszufinden wo ein Name deklariert wurde — die Basis fuer 'Go to Definition'",
      "Um den Typ eines Ausdrucks zu bekommen",
      "Um den AST zu traversieren",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "getSymbolAtLocation loest einen Namen (Identifier) auf seine Deklaration auf — inklusive Import-Aufloesung.",
  },
  {
    sectionId: 3,
    question: "Warum ist der Type Checker die teuerste Compiler-Komponente?",
    options: [
      "Weil er viele Dateien liest",
      "Weil er JavaScript generiert",
      "Weil er alle Typen fuer alle Ausdruecke berechnet — Inferenz, Generics, Narrowing",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Der Type Checker berechnet Typen, loest Generics, fuehrt Narrowing durch und prueft Kompatibilitaet — ~50.000 Zeilen Code.",
  },

  // ─── Sektion 4: Custom Transformers ─────────────────────────────────────

  {
    sectionId: 4,
    question: "Was ist ein Custom Transformer in TypeScript?",
    options: [
      "Eine Funktion die den AST veraendert bevor JavaScript generiert wird",
      "Ein Plugin fuer VS Code",
      "Eine tsconfig-Option",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Custom Transformers veraendern den AST — z.B. Code injizieren, entfernen oder umschreiben — vor der Ausgabe.",
  },
  {
    sectionId: 4,
    question: "Warum sind AST-Nodes in TypeScript immutable?",
    options: [
      "Weil JavaScript keine Objekt-Mutation unterstuetzt",
      "Weil es schneller ist als mutable Nodes",
      "Damit mehrere Transformer hintereinander laufen koennen ohne sich zu stoeren",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Immutability stellt sicher dass jeder Transformer den richtigen Input bekommt — keine Seiteneffekte zwischen Transformern.",
  },
  {
    sectionId: 4,
    question: "Was ist ts.factory?",
    options: [
      "Ein Build-Tool fuer TypeScript-Projekte",
      "Ein Modul fuer Datei-Operationen",
      "Eine API zum Erstellen neuer AST-Nodes",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "ts.factory.createStringLiteral(), ts.factory.createCallExpression() etc. erzeugen neue immutable AST-Nodes.",
  },

  // ─── Sektion 5: Diagnostics und Language Service ────────────────────────

  {
    sectionId: 5,
    question: "Was enthaelt ein TypeScript-Diagnostic-Objekt?",
    options: [
      "Nur die Fehlermeldung",
      "Den gesamten Quellcode",
      "Datei, Position, Kategorie (Error/Warning), Fehlercode und Nachricht",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Diagnostics sind strukturiert: Position, Laenge, Kategorie, Code und Nachricht — nicht nur ein String.",
  },
  {
    sectionId: 5,
    question: "Was unterscheidet den Language Service von createProgram?",
    options: [
      "Der Language Service kann keine Typen pruefen",
      "Ich weiss es nicht",
      "Der Language Service ist nur fuer .d.ts-Dateien",
      "Der Language Service arbeitet inkrementell — ideal fuer IDEs",
    ],
    correct: 3,
    explanation: "Der Language Service cached Ergebnisse und aktualisiert nur geaenderte Dateien — schnell genug fuer jeden Tastendruck.",
  },
  {
    sectionId: 5,
    question: "Wie nutzt VS Code die TypeScript Compiler API?",
    options: [
      "Es startet tsc als separaten Prozess",
      "Ich weiss es nicht",
      "Es nutzt die API nicht — VS Code hat seinen eigenen Parser",
      "Es nutzt den Language Service fuer Autocomplete, Hover, Rename und Quick Fixes",
    ],
    correct: 3,
    explanation: "VS Code startet einen tsserver-Prozess der den Language Service hostet. Jede IDE-Aktion wird an den Language Service delegiert.",
  },

  // ─── Sektion 6: Praxis ─────────────────────────────────────────────────

  {
    sectionId: 6,
    question: "Kann ein Linter mit der Compiler API Regeln pruefen die ESLint nicht kann?",
    options: [
      "Nein, ESLint kann alles was die Compiler API kann",
      "Ich weiss es nicht",
      "Nur fuer TypeScript-spezifische Syntax",
      "Ja, Typ-basierte Regeln die den aufgeloesten Typ eines Ausdrucks brauchen",
    ],
    correct: 3,
    explanation: "Regeln wie 'ist der Rueckgabewert ein Promise?' brauchen den Type Checker. @typescript-eslint nutzt deshalb die Compiler API.",
  },
  {
    sectionId: 6,
    question: "Was ist ein realistischer Anwendungsfall fuer Code-Generierung mit der Compiler API?",
    options: [
      "CSS-Dateien generieren",
      "Ich weiss es nicht",
      "HTML-Templates kompilieren",
      "Aus TypeScript-Interfaces automatisch Validierungsfunktionen erzeugen",
    ],
    correct: 3,
    explanation: "Interface lesen → Properties und Typen extrahieren → Runtime-Validierungscode generieren. Wie Zod, aber aus bestehenden Interfaces.",
  },
  {
    sectionId: 6,
    question: "Wann sollte man die Compiler API NICHT direkt verwenden?",
    options: [
      "Fuer einfache Linting-Regeln die ESLint bereits abdeckt",
      "Fuer Typ-basierte Analyse",
      "Fuer Code-Generierung aus Typen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Fuer Standard-Linting-Regeln ist ESLint besser — es hat ein Plugin-System, Community-Regeln und einfachere Konfiguration.",
  },
];
