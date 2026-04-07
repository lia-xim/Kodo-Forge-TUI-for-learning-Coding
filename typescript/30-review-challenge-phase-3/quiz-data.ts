/**
 * Lektion 30 — Quiz-Daten: Review Challenge Phase 3
 *
 * Fragen verbinden Konzepte aus L21-L29.
 * correct-Indizes MC: 4x0, 4x1, 4x2, 3x3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "30";
export const lessonTitle = "Review Challenge Phase 3";

export const questions: QuizQuestion[] = [
  // ─── MC: correct: 0 (4x) ──────────────────────────────────────────────

  {
    question: "Was verhindert Branded Types (L24), das normale string/number-Typen nicht koennen?",
    options: [
      "Verwechslung gleichfoermiger Werte — z.B. UserId und OrderId sind beide string, aber nicht austauschbar",
      "Runtime-Fehler bei falschen Typen die erst zur Laufzeit sichtbar werden",
      "Dass Strings zu lang werden und die Lesbarkeit des Codes beeintrachtigen",
      "Dass number-Werte negativ sind und dadurch ungueltige IDs entstehen"
    ],
    correct: 0,
    explanation: "Branded Types fuegen einen 'unsichtbaren' Brand hinzu: type UserId = string & { __brand: 'UserId' }. Obwohl beide string sind, sind UserId und OrderId nicht zuweisbar.",
  },

  {
    question: "Was ist der Hauptvorteil des Result-Patterns (L25) gegenueber try/catch?",
    options: [
      "Fehler sind im Typ sichtbar — der Compiler erzwingt die Fehlerbehandlung",
      "Bessere Performance als try/catch weil keine Stack-Traces erstellt werden muessen",
      "Kuerzer zu schreiben und benoetigt weniger Boilerplate-Code im Projekt",
      "Funktioniert nur mit async/await und ist fuer synchronen Code nicht verwendbar"
    ],
    correct: 0,
    explanation: "Result<T,E> macht den Fehler zum Teil des Return-Typs. Der Compiler prueft, dass du den Fehlerfall behandelst — try/catch ist unsichtbar im Typ.",
  },

  {
    question: "Was macht `composite: true` in einer tsconfig (L29)?",
    options: [
      "Aktiviert inkrementelle Builds, erzwingt declaration, und ist Pflicht fuer Project References",
      "Kombiniert mehrere tsconfig-Dateien zu einer einzigen zentralen Konfiguration",
      "Komprimiert den Output und reduziert die Groesse der generierten JavaScript-Dateien",
      "Aktiviert experimentelle Features die noch nicht im offiziellen TypeScript-Standard sind"
    ],
    correct: 0,
    explanation: "composite: true ist Pflicht fuer referenzierte Projekte. Es aktiviert incremental automatisch und erzwingt declaration: true fuer .d.ts-Erzeugung.",
  },

  {
    question: "Warum hat Angular `experimentalDecorators: true` in der tsconfig (L28 + L29)?",
    options: [
      "Angular nutzt Legacy-Decorators (@Component etc.) die vor dem TC39-Standard existierten",
      "Fuer Performance-Optimierungen die nur mit experimentellen Decorators moeglich sind",
      "Fuer Template-Syntax die von Stage 3 Decorators nicht unterstuetzt wird",
      "Weil Angular kein strict unterstuetzt und deshalb auf experimentelle Features angewiesen ist"
    ],
    correct: 0,
    explanation: "Angular nutzt seit 2016 experimentelle Decorators. Die neuen TC39 Stage 3 Decorators haben andere Semantik — Angular muss auf Legacy bleiben bis zur Migration.",
  },

  // ─── MC: correct: 1 (4x) ──────────────────────────────────────────────

  {
    question: "Was bedeutet `out T` in `interface ReadonlyBox<out T>` (L22)?",
    options: [
      "T darf nur als Eingabe-Parameter verwendet werden und niemals als Rueckgabetyp",
      "T ist kovariant — ReadonlyBox<Dog> ist ReadonlyBox<Animal> zuweisbar",
      "T muss ein Output-Typ sein und darf nicht als Parameter verwendet werden",
      "T ist kontravariant und verhaelt sich genau umgekehrt zu kovariant"
    ],
    correct: 1,
    explanation: "out markiert T als kovariant: T erscheint nur in Output-Positionen (Return-Typen). ReadonlyBox<Dog> → ReadonlyBox<Animal> ist zuweisbar.",
  },

  {
    question: "Was macht DeepReadonly<T> anders als Readonly<T> (L23)?",
    options: [
      "Nichts — beide sind identisch und erzeugen denselben readonly-Typ",
      "Es macht alle verschachtelten Properties readonly, nicht nur die oberste Ebene",
      "Es entfernt alle Properties die nicht readonly sind und erzeugt einen leeren Typ",
      "Es macht nur Arrays readonly und laesst Objekte unveraendert mutable"
    ],
    correct: 1,
    explanation: "Readonly<T> wirkt nur eine Ebene tief. DeepReadonly<T> ist ein rekursiver Typ der ALLE verschachtelten Objekte und Arrays readonly macht.",
  },

  {
    question: "Was ist der Zweck von Smart Constructors bei Branded Types (L24)?",
    options: [
      "Performance-Optimierung die den Code zur Laufzeit schneller ausfuehrt",
      "Die einzige Stelle sein an der ein Brand vergeben wird — nach Validierung",
      "Branded Types zur Laufzeit erzeugen und den Brand als Property speichern",
      "Klassen-Konstruktoren ersetzen und die Objektorstellung vereinfachen"
    ],
    correct: 1,
    explanation: "Smart Constructors validieren den Input und vergeben den Brand nur nach erfolgreicher Pruefung. 'Parse, Don't Validate' — der Brand ist der Beweis.",
  },

  {
    question: "Was erzwingt `verbatimModuleSyntax: true` (L29)?",
    options: [
      "Alle Imports muessen absolut sein und duerfen keine relativen Pfade verwenden",
      "Explizites `import type` fuer reine Typ-Imports — was als type markiert wird, wird geloescht",
      "CommonJS-Syntax fuer alle Imports und die komplette Deaktivierung von ES Modules",
      "Dass alle Module exportiert werden und keine privaten Module erlaubt sind"
    ],
    correct: 1,
    explanation: "verbatimModuleSyntax macht import vs import type explizit. import type wird entfernt, import bleibt. Kein automatisches 'import elision' mehr.",
  },

  // ─── MC: correct: 2 (4x) ──────────────────────────────────────────────

  {
    question: "Warum ist `HttpResult<never>` ein gueltiger Return-Typ fuer eine Fehler-Funktion (L25 + L02)?",
    options: [
      "never ist der Default-Typ der verwendet wird wenn kein Typparameter angegeben ist",
      "never bedeutet 'kein Wert' und ist deshalb egal und kann ignoriert werden",
      "never ist der Bottom Type — HttpResult<never> ist jedem HttpResult<T> zuweisbar",
      "never ist dasselbe wie void und zeigt an dass die Funktion nichts zurueckgibt"
    ],
    correct: 2,
    explanation: "never als Bottom Type ist jedem Typ zuweisbar. Result<never, E> (nur Fehler moeglich) ist zu Result<T, E> zuweisbar — logisch korrekt.",
  },

  {
    question: "Was macht Phantom Types bei State Machines besonders nuetzlich (L26)?",
    options: [
      "Sie sind schneller als regulaere Typen und verbessern die Runtime-Performance",
      "Sie speichern den Zustand zur Laufzeit und ermoeglichen dynamische Uebergangspruefungen",
      "Sie machen ungueltige Zustandsuebergaenge zu Compile-Fehlern statt Runtime-Fehlern",
      "Sie ersetzen if/switch-Statements komplett und machen den Code kuerzer"
    ],
    correct: 2,
    explanation: "Phantom Types existieren nur auf Typ-Level. Der Compiler verhindert ungueltige Uebergaenge — z.B. publish(draftDoc) ist ein Fehler wenn publish nur ReviewDoc akzeptiert.",
  },

  {
    question: "Was ist der Unterschied zwischen Declaration Merging und Module Augmentation (L27)?",
    options: [
      "Kein Unterschied — beides ist dasselbe und kann austauschbar verwendet werden",
      "Declaration Merging funktioniert nur mit Klassen und nicht mit Interfaces oder Typen",
      "Declaration Merging erweitert Interfaces am selben Ort, Module Augmentation erweitert Interfaces in externen Modulen",
      "Module Augmentation funktioniert nur zur Laufzeit und hat keinen Einfluss auf den Compilezeit-Typ"
    ],
    correct: 2,
    explanation: "Declaration Merging: interface A {}; interface A {} verschmilzt zu einer. Module Augmentation: declare module 'express' { interface Request { ... } } erweitert externe Module.",
  },

  {
    question: "Welches Flag ist NICHT Teil von `strict: true` obwohl es in jede professionelle tsconfig gehoert (L29)?",
    options: [
      "strictNullChecks",
      "noImplicitAny",
      "noUncheckedIndexedAccess",
      "strictFunctionTypes"
    ],
    correct: 2,
    explanation: "noUncheckedIndexedAccess (Array-Zugriff gibt T | undefined) ist nicht in strict enthalten, verhindert aber Array-Out-of-Bounds-Fehler.",
  },

  // ─── MC: correct: 3 (3x) ──────────────────────────────────────────────

  {
    question: "Warum setzt man `noEmit: true` in React/Vite/Next.js-Projekten (L29)?",
    options: [
      "React braucht kein JavaScript und verwendet ausschliesslich TypeScript-Features",
      "Fuer schnelleres Linting das keine kompilierten Dateien benoetigt",
      "Weil TypeScript zu langsam kompiliert und die Developer Experience verschlechtert",
      "Weil esbuild/SWC die Transpilation uebernimmt — TypeScript prueft nur Typen"
    ],
    correct: 3,
    explanation: "esbuild/SWC sind 10-100x schneller als tsc bei der Transpilation. TypeScript wird zum reinen Type-Checker degradiert — noEmit verhindert doppelten Output.",
  },

  {
    question: "Was ist der Vorteil von `strictFunctionTypes` in Bezug auf Varianz (L22 + L29)?",
    options: [
      "Schnellere Kompilierung durch optimierte Varianz-Berechnung im Compiler",
      "Verbietet alle Funktionstypen die nicht explizit mit Kovarianz annotiert sind",
      "Erzwingt striktere Typ-Inferenz die implizite any-Typen verhindert",
      "Erzwingt kontravariante Parameter-Typen — ein Handler<MouseEvent> akzeptiert keinen Handler<Event>"
    ],
    correct: 3,
    explanation: "strictFunctionTypes erzwingt korrekte Kontravarianz bei Funktions-Parametern. Ohne dieses Flag erlaubt TypeScript unsichere Zuweisungen.",
  },

  {
    question: "Was ist das Prinzip 'Make Illegal States Unrepresentable' und welche Phase-3-Konzepte setzen es um?",
    options: [
      "Nur Branded Types setzen es um und sind dafuer das einzige gueltige Pattern",
      "Es bedeutet Runtime-Validierung fuer alle Daten die in die Anwendung fliessen",
      "Es ist nur fuer funktionale Programmierung relevant und hat in TypeScript keine Bedeutung",
      "Ungueltiger Zustand = Compile-Fehler — umgesetzt durch Branded Types (L24), Phantom Types (L26), Result-Pattern (L25)"
    ],
    correct: 3,
    explanation: "Das Prinzip: Wenn das Typsystem ungueltigen Zustand nicht darstellen KANN, brauchst du keine Runtime-Checks. Branded Types, Phantom Types und Result-Pattern setzen es um.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Neue Formate
  // ═══════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Wie heisst das Pattern bei dem Daten validiert UND in einen staerkeren Typ umgewandelt werden statt nur boolean zurueckzugeben? (L24)",
    expectedAnswer: "Parse, Don't Validate",
    acceptableAnswers: ["Parse, Don't Validate", "Parse Don't Validate", "parse dont validate", "parse don't validate", "Smart Constructor"],
    explanation: "Parse, Don't Validate (Alexis King, 2019): Statt validateEmail(s): boolean → parseEmail(s): Email | null. Der Brand ist der Beweis der Validierung.",
  },

  {
    type: "short-answer",
    question: "Welches TypeScript-Feature macht den Typparameter T kovariant (also 'nur lesen')? (L22)",
    expectedAnswer: "out",
    acceptableAnswers: ["out", "out T", "out modifier", "out-Modifier"],
    explanation: "interface Box<out T> markiert T als kovariant. T darf nur in Output-Positionen (Return-Typen) erscheinen. Box<Dog> ist dann Box<Animal> zuweisbar.",
  },

  {
    type: "short-answer",
    question: "Welcher Discriminated-Union-Member repraesentiert den Fehlerfall im Result-Pattern? (L25)",
    expectedAnswer: "{ ok: false; error: E }",
    acceptableAnswers: ["{ ok: false; error: E }", "ok: false", "false", "error"],
    explanation: "Result<T,E> = { ok: true; value: T } | { ok: false; error: E }. Das ok-Feld ist der Diskriminator — bei false gibt es error statt value.",
  },

  {
    type: "predict-output",
    question: "Kompiliert dieser Code? Wenn nein, warum nicht?",
    code: "type UserId = string & { readonly __brand: 'UserId' };\ntype OrderId = string & { readonly __brand: 'OrderId' };\n\nconst userId = 'u-1' as UserId;\nconst orderId: OrderId = userId;",
    expectedAnswer: "Fehler",
    acceptableAnswers: ["Fehler", "Nein", "Kompiliert nicht", "Error", "Type Error"],
    explanation: "UserId und OrderId haben verschiedene Brands (__brand: 'UserId' vs 'OrderId'). Obwohl beide string-basiert sind, sind sie nicht zuweisbar — genau der Sinn von Branded Types.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat `value` nach dem Check?",
    code: "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n\nfunction handle(r: Result<string, Error>) {\n  if (r.ok) {\n    const value = r.value;\n    // Welcher Typ ist value?\n  }\n}",
    expectedAnswer: "string",
    acceptableAnswers: ["string"],
    explanation: "Discriminated Union Narrowing: Nach if (r.ok) weiss TypeScript dass r vom Typ { ok: true; value: string } ist. Also ist value: string.",
  },

  {
    type: "explain-why",
    question: "Warum ist die Kombination aus Branded Types (L24), Result-Pattern (L25) und Phantom Types (L26) so maeachtig fuer Domain-Modellierung?",
    modelAnswer:
      "Diese drei Konzepte zusammen setzen das Prinzip 'Make Illegal States Unrepresentable' um. " +
      "Branded Types verhindern die Verwechslung von Werten (UserId vs OrderId). " +
      "Das Result-Pattern macht Fehler zum expliziten Teil der API — kein unsichtbares try/catch. " +
      "Phantom Types kodieren Zustaende im Typsystem — ungueltige Zustandsuebergaenge werden zu Compile-Fehlern. " +
      "Zusammen ergibt sich ein Domain-Modell das falsche Nutzung VERHINDERT statt zur Laufzeit zu pruefen.",
    keyPoints: [
      "Branded Types: Verwechslung gleichfoermiger Werte verhindern",
      "Result-Pattern: Fehler sichtbar im Typ statt unsichtbar in try/catch",
      "Phantom Types: Zustandsuebergaenge zur Compile-Zeit pruefen",
      "Zusammen: Make Illegal States Unrepresentable",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Branded Types fuegen einen __brand hinzu der strukturelle Gleichheit bricht. UserId und OrderId sind beide string, aber nicht zuweisbar.", commonMistake: "Denken string-basierte IDs seien sicher genug — sie sind es nicht, weil TypeScript strukturell typiert." },
  1: { whyCorrect: "Result<T,E> macht den Fehler zum Teil des Return-Typs. Der Compiler erzwingt dass du den Fehlerfall behandelst.", commonMistake: "Denken try/catch reicht — aber der Typ laut Signatur verraet nicht, dass ein Fehler moeglich ist." },
  2: { whyCorrect: "composite aktiviert inkrementelle Builds und erzwingt declaration fuer .d.ts-Erzeugung. Pflicht fuer Project References.", commonMistake: "composite mit incremental verwechseln. composite ist strenger — es erzwingt auch declaration." },
  3: { whyCorrect: "Angular nutzt Legacy-Decorators seit 2016. Die neuen TC39 Stage 3 Decorators haben andere Semantik.", commonMistake: "Denken experimentalDecorators ist nur eine Voreinstellung — es ist ein Kompatibilitaets-Flag fuer die aeltere API." },
  4: { whyCorrect: "out markiert T als kovariant. T darf nur in Output-Positionen erscheinen. ReadonlyBox<Dog> → ReadonlyBox<Animal>.", commonMistake: "out mit in verwechseln. out = kovariant (lesen), in = kontravariant (schreiben)." },
  5: { whyCorrect: "DeepReadonly wendet sich rekursiv auf verschachtelte Objekte an. Readonly ist nur eine Ebene tief.", commonMistake: "Denken Readonly reicht fuer verschachtelte Objekte — tut es nicht, innere Objekte bleiben mutable." },
  6: { whyCorrect: "Smart Constructors sind die einzige Stelle die einen Brand vergibt — nach Validierung. 'Parse, Don't Validate'.", commonMistake: "as-Casts ueberall verwenden statt den Smart Constructor. Dann ist der Brand bedeutungslos." },
  7: { whyCorrect: "verbatimModuleSyntax macht import vs import type explizit. Kein automatisches import elision mehr.", commonMistake: "Denken isolatedModules reicht. verbatimModuleSyntax ist strenger und ersetzt drei aeltere Flags." },
  8: { whyCorrect: "never ist der Bottom Type und jedem Typ zuweisbar. Result<never, E> passt zu jedem Result<T, E>.", commonMistake: "never mit void verwechseln. void ist ein Rueckgabetyp, never bedeutet 'existiert nicht'." },
  9: { whyCorrect: "Phantom Types existieren nur auf Typ-Level. Ungueltige Uebergaenge sind Compile-Fehler, nicht Runtime-Fehler.", commonMistake: "Denken State Machines brauchen Runtime-Logik. Mit Phantom Types prueft der Compiler." },
  10: { whyCorrect: "Declaration Merging = selber Ort (interface A + interface A). Module Augmentation = externe Module (declare module 'x').", commonMistake: "Beides verwechseln. Module Augmentation nutzt Declaration Merging, aber in einem declare-module-Block." },
  11: { whyCorrect: "noUncheckedIndexedAccess gibt T | undefined fuer Index-Zugriffe. Nicht in strict enthalten!", commonMistake: "Annehmen strict enthaelt alle sicherheitsrelevanten Flags. noUncheckedIndexedAccess fehlt." },
  12: { whyCorrect: "esbuild/SWC transpilieren 10-100x schneller als tsc. TypeScript wird zum reinen Type-Checker.", commonMistake: "Denken noEmit deaktiviert auch die Typ-Pruefung. Nein — nur der Output wird unterdrueckt." },
  13: { whyCorrect: "strictFunctionTypes erzwingt kontravariante Parameter. Handler<MouseEvent> akzeptiert keinen Handler<Event>.", commonMistake: "Kovarianz und Kontravarianz verwechseln. Parameter = kontravariant (in), Return = kovariant (out)." },
  14: { whyCorrect: "Branded Types + Phantom Types + Result = drei komplementaere Patterns fuer 'Make Illegal States Unrepresentable'.", commonMistake: "Nur ein Pattern verwenden. Die Kombination ist staerker als jedes einzelne." },
};
