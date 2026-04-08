// quiz-data.ts — L38: Compiler API
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "38";
export const lessonTitle = "Compiler API";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: AST — correct: 0 ---
  {
    question: "Was ist der Abstract Syntax Tree (AST)?",
    options: [
      "Eine Baumstruktur die die Syntax des Quellcodes repraesentiert — die gemeinsame Sprache aller Tools",
      "Ein Debugging-Tool fuer den TypeScript-Compiler das zur Laufzeit den Code analysiert",
      "Eine Datenbank die Typ-Informationen speichert und bei jedem Build aktualisiert wird",
      "Ein Build-Artefakt das beim Kompilieren entsteht und auf der Festplatte gespeichert wird",
    ],
    correct: 0,
    explanation:
      "Der AST repraesentiert den Code als Baum. Jeder Knoten (Node) hat einen Typ " +
      "(SyntaxKind), Position und Kinder. Alle Tools — Type Checker, Emitter, ESLint, " +
      "VS Code — arbeiten auf diesem Baum.",
    elaboratedFeedback: {
      whyCorrect: "Quellcode ist ein String — unstrukturiert. Der AST macht die Struktur explizit: Welche Funktion enthaelt welche Statements, welche Ausdruecke haben welche Operanden. Das ist die Basis fuer jede Code-Analyse.",
      commonMistake: "Der AST ist kein Build-Artefakt — er existiert nur im Speicher waehrend der Kompilierung. Er wird nicht auf die Festplatte geschrieben (anders als .js oder .d.ts Dateien)."
    }
  },

  // --- Frage 2: createProgram — correct: 0 ---
  {
    question: "Was gibt ts.createProgram zurueck?",
    options: [
      "Ein Program-Objekt mit Zugang zu SourceFiles, TypeChecker und Diagnostics",
      "Den kompilierten JavaScript-Code als String — die Ausgabe des Compilers",
      "Eine Liste aller Dateien im Projekt sortiert nach Abhaengigkeiten",
      "Ein Promise das auf die Kompilierung wartet und dann das Ergebnis liefert",
    ],
    correct: 0,
    explanation:
      "createProgram erzeugt ein Program-Objekt. Daraus bekommt man SourceFiles (ASTs), " +
      "den TypeChecker (Typ-Informationen) und Diagnostics (Fehler/Warnungen).",
    elaboratedFeedback: {
      whyCorrect: "Das Program ist der zentrale Einstiegspunkt: program.getSourceFile() fuer ASTs, program.getTypeChecker() fuer Typen, ts.getPreEmitDiagnostics(program) fuer Fehler.",
      commonMistake: "createProgram ist synchron — kein Promise. Es liest alle Dateien und baut den AST sofort auf. Fuer grosse Projekte kann das Sekunden dauern."
    }
  },

  // --- Frage 3: Node vs Symbol vs Type — correct: 0 ---
  {
    question: "Was ist der Unterschied zwischen Node, Symbol und Type in der Compiler API?",
    options: [
      "Node = Syntax (wo im Code), Symbol = Semantik (was bedeutet der Name), Type = Typ-Information",
      "Node = Datei, Symbol = Funktion, Type = Variable — die drei Hauptelemente eines Programms",
      "Node = Ausdruck, Symbol = Statement, Type = Deklaration — die Hierarchie der AST-Elemente",
      "Alle drei sind Synonyme fuer AST-Knoten — sie bezeichnen dasselbe Konzept aus verschiedenen Perspektiven",
    ],
    correct: 0,
    explanation:
      "Node ist ein Syntax-Knoten (Position im AST). Symbol ist eine benannte Entity " +
      "(Variable, Funktion — loest Imports auf). Type ist der aufgeloeste Typ.",
    elaboratedFeedback: {
      whyCorrect: "Ein Identifier-Node 'x' verweist auf ein Symbol. Das Symbol hat eine Deklaration und einen Type. Drei Ebenen: Syntax → Semantik → Typ. VS Code's 'Go to Definition' nutzt alle drei.",
      commonMistake: "Nicht jeder Node hat ein Symbol — nur Identifier und Deklarationen. Und nicht jedes Symbol hat einen sinnvollen Type (z.B. Namespaces)."
    }
  },

  // --- Frage 4: forEachChild — correct: 0 ---
  {
    question: "Was ist die Einschraenkung von ts.forEachChild?",
    options: [
      "Es besucht nur die Direktkinder — fuer tiefere Nodes braucht man eigene Rekursion",
      "Es kann nur SourceFile-Nodes besuchen — andere Node-Typen werden ignoriert",
      "Es ist langsamer als manuelle Iteration weil es einen Callback fuer jeden Node aufruft",
      "Es funktioniert nicht mit ClassDeclaration-Nodes — die haben eine spezielle Struktur",
    ],
    correct: 0,
    explanation:
      "forEachChild besucht nur die unmittelbaren Kinder. Fuer eine vollstaendige " +
      "Traversierung des Baums braucht man rekursive Aufrufe von forEachChild in der Callback-Funktion.",
    elaboratedFeedback: {
      whyCorrect: "SourceFile hat Top-Level-Statements als Kinder. Eine FunctionDeclaration hat name, parameters, body als Kinder. Aber die Statements IM body sind Enkel — dafuer braucht man Rekursion.",
      commonMistake: "Viele erwarten ein children-Array wie in anderen AST-Bibliotheken (Babel). TypeScript's AST hat spezifische Properties pro Node-Typ. forEachChild kennt die Struktur."
    }
  },

  // --- Frage 5: visitEachChild — correct: 1 ---
  {
    question: "Wofuer ist ts.visitEachChild konzipiert?",
    options: [
      "Fuer das Lesen von AST-Nodes in der richtigen Reihenfolge — von der Wurzel zu den Blaettern",
      "Fuer AST-Transformationen — es gibt neue Nodes zurueck statt die alten zu veraendern",
      "Fuer das Zaehlen von Nodes im AST — es iteriert ueber den gesamten Baum und summiert",
      "Fuer die Suche nach bestimmten Node-Typen — man kann nach SyntaxKind filtern",
    ],
    correct: 1,
    explanation:
      "visitEachChild besucht Kinder und gibt einen NEUEN Node zurueck mit den " +
      "transformierten Kindern. Der AST ist immutable — Aenderungen erzeugen neue Baeume.",
    elaboratedFeedback: {
      whyCorrect: "Die Immutability ist zentral: Mehrere Transformer koennen hintereinander laufen ohne sich zu stoeren. Jeder Transformer bekommt den AST des vorherigen und gibt einen neuen zurueck.",
      commonMistake: "visitEachChild ist NICHT fuer Analyse — dafuer ist forEachChild besser (kein neuer Baum noetig). visitEachChild ist fuer Custom Transformer die den AST veraendern."
    }
  },

  // --- Frage 6: Type Checker — correct: 1 ---
  {
    question: "Was gibt checker.getTypeAtLocation(node) zurueck?",
    options: [
      "Den annotierten Typ wie er im Quellcode steht — also das was der Entwickler geschrieben hat",
      "Den aufgeloesten Typ nach Inferenz, Narrowing und Generics-Aufloesung",
      "Einen String mit dem Typnamen — z.B. 'string[]' statt dem internen Type-Objekt",
      "Ein boolean ob der Node einen Typ hat — true fuer deklarierte Typen, false fuer implizite",
    ],
    correct: 1,
    explanation:
      "getTypeAtLocation gibt den AUFGELOESTEN Typ zurueck. Fuer `const x = [1, 2]` " +
      "ist das `number[]`, nicht das Literal `[1, 2]`. Es beruecksichtigt auch Narrowing.",
    elaboratedFeedback: {
      whyCorrect: "Der aufgeloeste Typ enthaelt alle Compiler-Berechnungen: Inferenz (kein Typ annotiert → inferiert), Narrowing (in if-Block eingeschraenkt), Generics (T wird zu konkretem Typ).",
      commonMistake: "Es gibt keinen String zurueck — sondern ein Type-Objekt. Fuer einen String: checker.typeToString(type). Das Type-Objekt hat Methoden wie isUnion(), getProperties() etc."
    }
  },

  // --- Frage 7: Custom Transformer — correct: 1 ---
  {
    question: "Was ist ein Before-Transformer?",
    options: [
      "Ein Transformer der vor dem Parsing laeuft und den rohen Quellcode veraendert bevor der AST entsteht",
      "Ein Transformer der VOR der Typ-Entfernung laeuft und Zugang zu TypeScript-Syntax hat",
      "Ein Transformer der den Quellcode vor dem Compiler veraendert — wie ein Preprocessor",
      "Ein Transformer der nur .d.ts-Dateien veraendert und den JavaScript-Output ignoriert",
    ],
    correct: 1,
    explanation:
      "Before-Transformer laufen vor der Typ-Entfernung. Sie sehen den vollen " +
      "TypeScript-AST inkl. Typ-Annotationen und Interfaces. After-Transformer " +
      "sehen nur den JavaScript-AST.",
    elaboratedFeedback: {
      whyCorrect: "Before = TypeScript-AST (mit Typen), After = JavaScript-AST (ohne Typen). Wenn dein Transformer Typ-Informationen braucht (z.B. 'Ist X ein Observable?'), muss er ein Before-Transformer sein.",
      commonMistake: "Before-Transformer laufen NICHT vor dem Parsing. Der AST muss bereits existieren. Sie laufen nach dem Parsing, vor der JavaScript-Generierung."
    }
  },

  // --- Frage 8: Diagnostics — correct: 1 ---
  {
    question: "Welche Information enthaelt ein Diagnostic-Objekt?",
    options: [
      "Nur die Fehlermeldung als String — mehr Informationen stellt ein Diagnostic nicht bereit",
      "Datei, Position, Laenge, Kategorie (Error/Warning), Code und Nachricht",
      "Den gesamten AST der fehlerhaften Datei — damit kann man die Stelle im Code genau lokalisieren",
      "Nur den Fehlercode und die Zeilennummer — die Spalte wird nicht gespeichert",
    ],
    correct: 1,
    explanation:
      "Diagnostics sind strukturiert: file (SourceFile), start (Offset), length, " +
      "category (Error/Warning/Message/Suggestion), code (z.B. 2322) und messageText.",
    elaboratedFeedback: {
      whyCorrect: "Die strukturierte Form ermoeglicht praezise Fehlerdarstellung: Unterstreichung im Editor (start + length), Filterung nach Schwere (category), Suche nach spezifischen Fehlern (code).",
      commonMistake: "Diagnostics sind nicht nur Fehler — sie koennen auch Warnungen (Warning), Nachrichten (Message) oder Vorschlaege (Suggestion) sein."
    }
  },

  // --- Frage 9: Language Service — correct: 2 ---
  {
    question: "Was unterscheidet den Language Service von ts.createProgram?",
    options: [
      "Der Language Service ist schneller weil er weniger prueft und nur die offensichtlichen Fehler findet",
      "Der Language Service hat keinen Zugang zum Type Checker — er arbeitet nur auf AST-Ebene",
      "Der Language Service arbeitet inkrementell — er aktualisiert nur geaenderte Dateien",
      "Der Language Service kann nur .d.ts-Dateien lesen — er ist auf Bibliotheks-Typen beschraenkt",
    ],
    correct: 2,
    explanation:
      "Der Language Service ist fuer interaktive Nutzung (IDE). Er cached Ergebnisse " +
      "und aktualisiert nur was sich geaendert hat. createProgram berechnet alles neu.",
    elaboratedFeedback: {
      whyCorrect: "VS Code sendet bei jedem Tastendruck Anfragen an den Language Service. Durch inkrementelles Parsing und Caching antwortet er in unter 100ms — auch bei grossen Projekten.",
      commonMistake: "Der Language Service HAT Zugang zum Type Checker — er nutzt ihn fuer Hover-Tooltips, Autocomplete und Refactoring. Er ist nicht 'weniger' als createProgram, sondern 'smarter'."
    }
  },

  // --- Frage 10: SyntaxKind — correct: 2 ---
  {
    question: "Was ist ts.SyntaxKind?",
    options: [
      "Ein Interface fuer benutzerdefinierte Node-Typen — man kann eigene SyntaxKind-Werte definieren",
      "Ein String der den Dateinamen enthaelt und fuer die Fehlerausgabe verwendet wird",
      "Ein Enum mit ueber 300 Eintraegen — einer fuer jeden moeglichen AST-Node-Typ",
      "Eine Konfigurationsoption fuer den Parser die bestimmt wie strikt Syntax geprüft wird",
    ],
    correct: 2,
    explanation:
      "SyntaxKind ist ein grosses Enum: FunctionDeclaration, ClassDeclaration, " +
      "Identifier, StringLiteral, CallExpression, etc. Jeder Node hat einen `.kind`.",
    elaboratedFeedback: {
      whyCorrect: "node.kind === ts.SyntaxKind.FunctionDeclaration prueft den Node-Typ. Type Guards wie ts.isFunctionDeclaration(node) machen dasselbe, sind aber typsicher.",
      commonMistake: "Man muss nicht alle 300+ Kinds kennen. Die haeufigsten 20-30 reichen fuer 95% der Anwendungsfaelle. Type Guards sind bequemer als .kind-Vergleiche."
    }
  },

  // --- Frage 11: checker.ts — correct: 2 ---
  {
    question: "Warum ist checker.ts (~50.000 Zeilen) die groesste Datei im TypeScript-Compiler?",
    options: [
      "Weil sie schlecht refactored ist — der Code stammt aus verschiedenen Epochen der TypeScript-Entwicklung",
      "Weil sie auch den Parser enthaelt — beides ist in einer Datei zusammengefasst",
      "Weil der Type Checker die komplexeste Komponente ist — er loest Generics, Narrowing, Zuweisungskompatibilitaet und mehr",
      "Weil sie Code fuer alle Zielplattformen enthaelt — ES5, ES6, ESNext und mehr",
    ],
    correct: 2,
    explanation:
      "Der Type Checker berechnet Typen fuer jeden Ausdruck, loest Generics auf, " +
      "fuehrt Narrowing durch, prueft Zuweisungskompatibilitaet und Overload-Resolution. " +
      "Das ist die aufwaendigste Aufgabe des Compilers.",
    elaboratedFeedback: {
      whyCorrect: "Typ-Inferenz, Conditional Types, Template Literal Types, Varianz-Pruefung, Mapped Types — all das wird in checker.ts berechnet. Es ist die Intelligenz des Compilers.",
      commonMistake: "Die Groesse ist nicht schlechtes Design — es ist die Komplexitaet des Typsystems. Jedes neue Feature (Conditional Types, infer, Template Literals) fuegt Tausende Zeilen hinzu."
    }
  },

  // --- Frage 12: ts.factory — correct: 2 ---
  {
    question: "Was ist ts.factory?",
    options: [
      "Eine Build-Tool-Konfiguration die TypeScript-Compiler-Optionen fuer verschiedene Umgebungen festlegt",
      "Ein Modul fuer Datei-Operationen — es bietet Funktionen zum Lesen und Schreiben von Dateien",
      "Eine API zum Erstellen neuer immutabler AST-Nodes fuer Custom Transformers",
      "Ein Pattern fuer Dependency Injection im Compiler — es verwaltet die Abhaengigkeiten zwischen Modulen",
    ],
    correct: 2,
    explanation:
      "ts.factory bietet Methoden wie createStringLiteral(), createCallExpression(), " +
      "createFunctionDeclaration() — alles was man braucht um neue AST-Nodes zu erzeugen.",
    elaboratedFeedback: {
      whyCorrect: "factory.createCallExpression(expr, typeArgs, args) erzeugt einen neuen CallExpression-Node. Da AST-Nodes immutable sind, MUSS man factory verwenden statt bestehende Nodes zu veraendern.",
      commonMistake: "Vor TS 4.0 nutzte man ts.createXxx() direkt. Seit TS 4.0 ist alles unter ts.factory gebundelt. Alte Tutorials verwenden noch die alte API."
    }
  },

  // --- Frage 13: Trivia — correct: 3 ---
  {
    question: "Wo stehen Kommentare im TypeScript-AST?",
    options: [
      "Als eigene Nodes im AST — Kommentare haben einen eigenen SyntaxKind wie alle anderen Code-Elemente",
      "Im Symbol jeder Deklaration — sie werden der benannten Entity als Metadaten angehaengt",
      "Im Type Checker als Metadaten — sie sind fuer die Typ-Inferenz relevant",
      "Als 'Trivia' an Nodes angehaengt — ueber getLeadingCommentRanges zugaenglich",
    ],
    correct: 3,
    explanation:
      "Kommentare sind keine eigenen Nodes. Sie sind 'Trivia' (Beiwerk) und an " +
      "den naechsten relevanten Node angehaengt. Zugriff ueber getLeadingCommentRanges().",
    elaboratedFeedback: {
      whyCorrect: "TypeScript's AST unterscheidet zwischen 'significant' Nodes (Code) und 'Trivia' (Whitespace, Kommentare). Trivia ist fuer die Semantik irrelevant, aber fuer Tools (Docs, Linter) wichtig.",
      commonMistake: "In manchen AST-Formaten (z.B. Babel) sind Kommentare eigenstaendige Nodes. In TypeScript nicht — man muss explizit getLeadingCommentRanges() aufrufen."
    }
  },

  // --- Frage 14: Praxis — correct: 3 ---
  {
    question: "Welches Tool nutzt die TypeScript Compiler API NICHT?",
    options: [
      "VS Code (Language Service fuer Autocomplete)",
      "ESLint mit @typescript-eslint (Type Checker fuer Regeln)",
      "Angular CLI (Custom Transformers fuer Templates)",
      "Prettier (formatiert nur — braucht keinen Type Checker)",
    ],
    correct: 3,
    explanation:
      "Prettier formatiert Code basierend auf Syntax allein — es nutzt seinen eigenen " +
      "Parser und braucht keine Typ-Informationen. VS Code, ESLint und Angular nutzen " +
      "die Compiler API.",
    elaboratedFeedback: {
      whyCorrect: "Prettier's Philosophie: 'opinionated formatter' — es trifft Formatierungsentscheidungen nur basierend auf AST-Struktur, nie auf Typen. Deshalb ist es so schnell.",
      commonMistake: "Prettier parst TypeScript durchaus — aber mit seinem eigenen Parser, nicht mit ts.createProgram. Es nutzt die TypeScript Compiler API nicht."
    }
  },

  // --- Frage 15: Architektur — correct: 3 ---
  {
    question: "Was ist der beste Anwendungsfall fuer die direkte Nutzung der Compiler API?",
    options: [
      "Einfache Syntax-Linting-Regeln (z.B. Naming Conventions) — dafuer ist die Compiler API optimiert",
      "Formatierung von TypeScript-Code — die Compiler API bietet AST-basierte Formatierungsfunktionen",
      "Unit Tests fuer TypeScript-Funktionen — die API kann Testfaelle automatisch generieren",
      "Typ-basierte Code-Analyse und Code-Generierung die ESLint-Regeln nicht abdecken",
    ],
    correct: 3,
    explanation:
      "Die Compiler API lohnt sich fuer Typ-basierte Analyse (z.B. alle Stellen finden " +
      "wo ein Promise nicht awaited wird) und Code-Generierung aus Typen. Fuer einfaches " +
      "Linting reicht ESLint, fuer Formatierung Prettier.",
    elaboratedFeedback: {
      whyCorrect: "Die Compiler API gibt Zugang zum Type Checker — das einzige Tool das den vollen Typ jedes Ausdrucks kennt. Fuer alles was Typ-Wissen braucht, ist die API unverzichtbar.",
      commonMistake: "Die API direkt zu nutzen fuer Dinge die ESLint-Regeln bereits abdecken ist Over-Engineering. @typescript-eslint hat 100+ Regeln — pruefe erst ob eine existiert."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welche Methode erstellt ein Program-Objekt aus TypeScript-Dateien?",
    expectedAnswer: "ts.createProgram",
    acceptableAnswers: ["ts.createProgram", "createProgram"],
    explanation:
      "ts.createProgram(fileNames, compilerOptions) liest die Dateien, baut den AST " +
      "und stellt Type Checker und Diagnostics bereit.",
  },

  {
    type: "short-answer",
    question: "Wie heisst die Methode die den aufgeloesten Typ eines AST-Nodes zurueckgibt?",
    expectedAnswer: "getTypeAtLocation",
    acceptableAnswers: ["getTypeAtLocation", "checker.getTypeAtLocation"],
    explanation:
      "checker.getTypeAtLocation(node) gibt den Typ nach Inferenz, Narrowing und " +
      "Generics-Aufloesung zurueck.",
  },

  {
    type: "short-answer",
    question: "Wie heissen Kommentare und Whitespace im TypeScript-AST?",
    expectedAnswer: "Trivia",
    acceptableAnswers: ["Trivia", "trivia"],
    explanation:
      "Kommentare und Whitespace sind 'Trivia' — sie sind keine eigenen Nodes, " +
      "sondern an den naechsten relevanten Node angehaengt.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Was gibt dieser Code aus? (Vereinfacht)",
    code:
      "const src = ts.createSourceFile('x.ts', 'const a = 1;', ts.ScriptTarget.Latest, true);\n" +
      "let count = 0;\n" +
      "ts.forEachChild(src, () => { count++; });\n" +
      "console.log(count);",
    expectedAnswer: "1",
    acceptableAnswers: ["1"],
    explanation:
      "'const a = 1;' erzeugt einen SourceFile mit einem Direktkind: " +
      "VariableStatement. forEachChild besucht nur Direktkinder, nicht Enkel.",
  },

  {
    type: "predict-output",
    question: "Was ist der SyntaxKind des innersten Nodes in 'const x = 42;'?",
    code:
      "// AST fuer 'const x = 42;':\n" +
      "// SourceFile → VariableStatement → VariableDeclarationList\n" +
      "//   → VariableDeclaration → Identifier('x') + NumericLiteral('42')\n" +
      "// Frage: Was ist der SyntaxKind von '42'?",
    expectedAnswer: "NumericLiteral",
    acceptableAnswers: ["NumericLiteral", "ts.SyntaxKind.NumericLiteral", "SyntaxKind.NumericLiteral"],
    explanation:
      "Die Zahl 42 wird im AST als NumericLiteral repraesentiert. " +
      "Andere Literals: StringLiteral, TrueKeyword, FalseKeyword, NullKeyword.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist die TypeScript Compiler API die Grundlage fuer das gesamte TypeScript-Oekosystem " +
      "(VS Code, ESLint, Angular CLI)?",
    modelAnswer:
      "Die Compiler API stellt drei entscheidende Dinge bereit: 1) Den AST als strukturierte " +
      "Repraesentaiton des Codes (Syntax). 2) Den Type Checker der den aufgeloesten Typ " +
      "jedes Ausdrucks kennt (Semantik). 3) Den Language Service fuer interaktive IDE-Features " +
      "(Autocomplete, Rename, Quick Fixes). Ohne diese API muesste jedes Tool seinen eigenen " +
      "TypeScript-Parser und Type Checker bauen — unmoeglich bei der Komplexitaet des " +
      "Typsystems. VS Code nutzt den Language Service, ESLint den Type Checker, Angular den " +
      "AST + Custom Transformers. Die API ist das gemeinsame Fundament.",
    keyPoints: [
      "AST: Strukturierte Code-Repraesentaiton fuer alle Tools",
      "Type Checker: Aufgeloeste Typen die kein anderes Tool berechnen kann",
      "Language Service: Inkrementelle IDE-Features in unter 100ms",
      "Ohne die API muesste jedes Tool seinen eigenen TypeScript-Parser bauen",
    ],
  },
];
