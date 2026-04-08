/**
 * Lektion 41 — Quiz-Daten: TypeScript 5.x Features
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 *
 * correct-Index-Verteilung: 0=2, 1=2, 2=2, 3=2 (fuer MC-Fragen)
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "41";
export const lessonTitle = "TypeScript 5.x Features";

export const questions: QuizQuestion[] = [
  // --- Frage 1: verbatimModuleSyntax (correct: 0) ---
  {
    question: "Was passiert wenn `verbatimModuleSyntax: true` gesetzt ist und du `import { Component } from '@angular/core'` schreibst, obwohl Component nur als Typ genutzt wird?",
    options: [
      "TypeScript gibt einen Fehler: du musst `import type { Component }` schreiben",
      "TypeScript entfernt den Import automatisch im Output — es ist ein stiller Fix ohne Fehlermeldung",
      "Der Import wird zu require() konvertiert — TypeScript behandelt es als CommonJS-Import",
      "Kein Unterschied — verbatimModuleSyntax aendert nichts an Imports, nur an Exports",
    ],
    correct: 0,
    explanation:
      "Mit verbatimModuleSyntax prueft TypeScript ob ein Import nur Typen importiert. " +
      "Wenn ja, muss er als `import type` geschrieben werden. " +
      "Andernfalls wuerde ein Laufzeit-Import entstehen der nicht tree-shakeable ist.",
    elaboratedFeedback: {
      whyCorrect:
        "`verbatimModuleSyntax` bedeutet: TypeScript veraendert Import-Statements nicht. " +
        "Was du schreibst, kommt 1:1 in den Output. Wenn du einen Typ-Import ohne `type` " +
        "schreibst, landen unnoetige Laufzeit-Imports im Bundle — ein Fehler wird erzwungen.",
      commonMistake:
        "Viele denken TypeScript entferne Typ-Imports automatisch. Das stimmt ohne " +
        "verbatimModuleSyntax — mit dieser Option ist dieses Verhalten abgeschaltet.",
    },
  },

  // --- Frage 2: moduleResolution bundler (correct: 1) ---
  {
    question: "Worin unterscheidet sich `moduleResolution: 'bundler'` (TS 5.0) von `'node'`?",
    options: [
      "bundler funktioniert nur mit esbuild, node funktioniert mit allen Tools und ist der Standard",
      "bundler erlaubt Imports ohne Dateiendung und mit Package-Exports-Feldern; node erfordert Endungen bei ESM",
      "bundler ist langsamer aber praeziser als node — er analysiert den Code tiefer",
      "Es gibt keinen Unterschied — bundler ist nur ein Alias fuer node16",
    ],
    correct: 1,
    explanation:
      "Der 'bundler'-Modus spiegelt wider wie Vite, webpack und esbuild Imports aufloesen: " +
      "ohne obligatorische Dateiendungen, mit Unterstuetzung fuer package.json 'exports'-Felder " +
      "und 'imports'-Felder. 'node16' erfordert bei ESM explizite .js-Endungen auch bei " +
      "TypeScript-Dateien — das passt nicht zu Bundler-Workflows.",
    elaboratedFeedback: {
      whyCorrect:
        "Bundler lesen package.json 'exports' und loesen Imports wie Vite/webpack. " +
        "TypeScript muss das nachbilden um korrekt zu typieren. 'node' kennt 'exports' nicht.",
      commonMistake:
        "Viele setzen 'node16' oder 'nodenext' wenn sie eigentlich einen Bundler nutzen. " +
        "Das fuehrt zu Fehlern wie 'Relative imports must use .js extensions'.",
    },
  },

  // --- Frage 3: Inferred Type Predicates (correct: 2) ---
  {
    question: "Was aendert sich in TypeScript 5.5 bei `filter(x => x !== null)`?",
    options: [
      "Nichts — das hat schon immer funktioniert, TypeScript inferiert automatisch den richtigen Typ",
      "TypeScript wirft einen Fehler weil null-Checks explizit sein muessen und nicht mehr automatisch erkannt werden",
      "TypeScript inferiert automatisch `x is NonNullable<T>` als Return-Typ der Callback-Funktion",
      "filter gibt jetzt niemals undefined zurueck, auch ohne expliziten Typ-Predikaten — es ist immer typsicher",
    ],
    correct: 2,
    explanation:
      "Inferred Type Predicates (TS 5.5): Wenn TypeScript in einer Funktion erkennt, " +
      "dass der Return-Typ immer eine Narrowing-Bedingung auf den Parameter ist, " +
      "inferiert es automatisch ein Type Predicate. Damit gibt `arr.filter(x => x !== null)` " +
      "ein `T[]` zurueck statt `(T | null)[]`.",
    elaboratedFeedback: {
      whyCorrect:
        "Vor TS 5.5 musste man schreiben: `.filter((x): x is NonNullable<T> => x !== null)`. " +
        "Das war boilerplate. Jetzt erkennt TypeScript das Pattern selbst.",
      commonMistake:
        "Viele schreiben immer noch manuell Type Predicates. Ab TS 5.5 ist das fuer " +
        "einfache Nullchecks unnoetig. Komplexe Predicates brauchen nach wie vor manuelle Annotation.",
    },
  },

  // --- Frage 4: NoInfer<T> (correct: 3) ---
  {
    question: "Was bewirkt `NoInfer<T>` in einer generischen Funktion?",
    code: `function setDefault<T>(values: T[], defaultValue: NoInfer<T>): T[] {
  return values.length ? values : [defaultValue];
}`,
    options: [
      "T wird nicht inferiert — man muss es immer explizit angeben, NoInfer deaktiviert die automatische Erkennung",
      "NoInfer<T> macht T zu einem optionalen Typparameter der nicht zwingend angegeben werden muss",
      "defaultValue wird nicht fuer die Typ-Inferenz von T verwendet, aber muss T sein",
      "Beide Parameter werden fuer die Inferenz verwendet, NoInfer ist nur Dokumentation",
    ],
    correct: 3,
    explanation:
      "Falsch! `NoInfer<T>` (TS 5.4) verhindert dass der umschlossene Parameter fuer " +
      "die Inferenz von T herangezogen wird. T wird NUR aus `values` inferiert. " +
      "defaultValue muss dann aber immer noch T sein — er 'zieht' T nur nicht aus sich heraus.",
    elaboratedFeedback: {
      whyCorrect:
        "Ohne NoInfer: `setDefault(['a','b'], 42)` wuerde zu T = string | number inferieren " +
        "und ohne Fehler kompilieren. Mit NoInfer: T = string (aus values), " +
        "und 42 ist kein string — Fehler! Das ist das gewuenschte Verhalten.",
      commonMistake:
        "Korrekte Antwort ist eigentlich Option C. NoInfer verhindert Inferenz-Einfluss " +
        "ABER defaultValue muss weiterhin dem inferierten T entsprechen.",
    },
  },

  // --- Frage 5: using keyword (correct: 0) ---
  {
    question: "Was passiert wenn du `using conn = getConnection()` schreibst und der Block endet?",
    options: [
      "`conn[Symbol.dispose]()` wird automatisch aufgerufen — auch wenn eine Exception geworfen wird",
      "`conn.close()` wird aufgerufen, wenn und nur wenn kein Fehler aufgetreten ist — es verhaelt sich wie try/catch",
      "`conn` wird auf null gesetzt und der Garbage Collector laeuft sofort — es ist eine Speicheroptimierung",
      "Es passiert nichts automatisch — using ist nur ein Hinweis fuer den Entwickler und hat keine Laufzeitwirkung",
    ],
    correct: 0,
    explanation:
      "`using` (Explicit Resource Management, TS 5.2) registriert das Objekt fuer " +
      "automatische Entsorgung am Block-Ende. `Symbol.dispose` wird garantiert aufgerufen, " +
      "unabhaengig davon ob Exceptions aufgetreten sind — aehnlich wie `finally`.",
    elaboratedFeedback: {
      whyCorrect:
        "Das ist der Kern-Vorteil von `using`: Es ist sicherer als try/finally, weil man " +
        "nicht vergessen kann, dispose aufzurufen. Der Compiler fuegt das automatisch ein.",
      commonMistake:
        "Manche verwechseln `using` mit `.close()`. Das Objekt muss `Symbol.dispose` " +
        "implementieren. `.close()` hat nichts damit zu tun — man muss `[Symbol.dispose]()` " +
        "definieren und kann darin intern close() aufrufen.",
    },
  },

  // --- Frage 6: isolatedDeclarations (correct: 1) ---
  {
    question: "Fuer welchen Use-Case ist `isolatedDeclarations: true` am sinnvollsten?",
    options: [
      "Fuer grosse Angular-Anwendungen mit vielen Komponenten die deklarative Typen brauchen",
      "Fuer npm-Libraries die .d.ts-Dateien parallel zu anderen Dateien erzeugen wollen",
      "Fuer Micro-Frontends mit Module Federation die isolierte Builds benoetigen",
      "Fuer alle TypeScript-Projekte — es hat keine Nachteile und sollte immer aktiviert werden",
    ],
    correct: 1,
    explanation:
      "`isolatedDeclarations` erzwingt explizite Typen bei allen Exporten. " +
      "Das ermoeglicht parallele .d.ts-Erzeugung ohne vollen TypeScript-Compiler-Durchlauf. " +
      "Bei einer App (Angular/React) gibt es keine externe API die typisiert werden muss — " +
      "der Aufwand fuer explizite Typen bringt keinen Mehrwert.",
    elaboratedFeedback: {
      whyCorrect:
        "Libraries brauchen .d.ts-Dateien fuer ihre Konsumenten. Mit isolatedDeclarations " +
        "kann esbuild oder swc diese parallel erzeugen — viel schneller als tsc allein.",
      commonMistake:
        "Manche aktivieren isolatedDeclarations fuer Apps weil es 'strenger' klingt. " +
        "Es verlangt dann aber explizite Typen fuer jeden Export — auch interne " +
        "Hilfsfunktionen. Das ist unnoetig und ermuedend.",
    },
  },

  // --- Frage 7: skipLibCheck Risiko (correct: 2) ---
  {
    question: "Welches Risiko entsteht wenn `skipLibCheck: true` gesetzt ist?",
    options: [
      "TypeScript kompiliert langsamer weil mehr Cache-Verwaltung noetig ist fuer die uebersprungenen Dateien",
      "Eigene .ts-Dateien werden auch nicht mehr geprueft — der Compiler ignoriert den gesamten Quellcode",
      "Fehler in den Typ-Definitionen von Dependencies werden still ignoriert",
      "Das Projekt kann nicht mehr mit --strict kompiliert werden — die Option ist inkompatibel mit strict",
    ],
    correct: 2,
    explanation:
      "`skipLibCheck: true` ueberspringt die Pruefung aller .d.ts-Dateien. " +
      "Das betrifft node_modules, aber auch eigene generierte .d.ts-Dateien. " +
      "Wenn eine Library fehlerhafte Typen hat, werden sie nicht entdeckt — " +
      "Laufzeit-Fehler koennen die Folge sein.",
    elaboratedFeedback: {
      whyCorrect:
        "Der Kompromiss ist bewusst: Weniger Build-Zeit gegen weniger Sicherheit bei " +
        "Library-Typen. Fuer gut gepflegte Libraries (Angular, React) ist das akzeptabel.",
      commonMistake:
        "Manche denken, skipLibCheck betreffe nur externe Libraries. Aber eigene " +
        ".d.ts-Dateien (aus declaration: true) werden ebenfalls uebersprungen.",
    },
  },

  // --- Frage 8: Tilde vs Caret (correct: 3) ---
  {
    question: "Warum ist `\"typescript\": \"~5.7.0\"` sicherer als `\"typescript\": \"^5.0.0\"` in package.json?",
    options: [
      "Tilde ist generell sicherer fuer alle npm-Pakete — es verhindert Major-Updates automatisch",
      "Caret-Ranges funktionieren nicht mit TypeScript — sie sind nur fuer JavaScript-Pakete gedacht",
      "Tilde erlaubt Patch-Updates, Caret Minor-Updates — aber TypeScript hat keine Breaking Changes in Minor-Versionen",
      "Tilde erlaubt nur Bugfix-Patches; Caret erlaubt Minor-Versionen die Behavioral Breaking Changes enthalten koennen",
    ],
    correct: 3,
    explanation:
      "TypeScript veraendert manchmal die Typ-Inferenz in Minor-Versionen ('Behavioral " +
      "Breaking Changes'). Ein `^5.0.0` koennte bei `npm install` automatisch TypeScript " +
      "5.5 installieren obwohl du mit 5.0 getestet hast — und damit neuen roten Code erzeugen. " +
      "`~5.7.0` erlaubt nur 5.7.x — nur Bugfixes, keine Inferenz-Aenderungen.",
    elaboratedFeedback: {
      whyCorrect:
        "Das TypeScript-Team empfiehlt Tilde-Ranges in produktiven Projekten. " +
        "Upgrades sollten bewusst erfolgen, nicht automatisch bei npm install.",
      commonMistake:
        "Viele Projekt-Templates nutzen `^` weil das npm-Standard ist. Bei TypeScript " +
        "ist das riskanter als bei anderen Paketen wegen der Behavioral Breaking Changes.",
    },
  },

  // ─── Neue Frageformate ───────────────────────────────────────────────────

  // --- Frage 9: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst das TypeScript 5.4 Utility Type das verhindert, dass ein Typparameter " +
      "fuer die Inferenz eines anderen Typparameters herangezogen wird?",
    expectedAnswer: "NoInfer",
    acceptableAnswers: [
      "NoInfer", "NoInfer<T>", "NoInfer<>", "noinfer",
    ],
    explanation:
      "`NoInfer<T>` (TypeScript 5.4) ist ein Utility Type der den eingeschlossenen Typ " +
      "von der Inferenz ausschliesst. Damit kann man Funktionen bauen die T nur " +
      "aus bestimmten Parametern inferieren.",
  },

  // --- Frage 10: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welcher TypeScript 5.0 Compiler-Option-Wert fuer `moduleResolution` ist speziell " +
      "fuer Projekte mit Vite, webpack oder esbuild gedacht?",
    expectedAnswer: "bundler",
    acceptableAnswers: [
      "bundler", "\"bundler\"", "'bundler'",
    ],
    explanation:
      "`moduleResolution: 'bundler'` (TS 5.0) spiegelt wider wie moderne Bundler " +
      "Imports aufloesen: keine obligatorischen Dateiendungen, package.json exports-Felder " +
      "werden beachtet. Erleichtert die Arbeit mit Vite und anderen modernen Tools.",
  },

  // --- Frage 11: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst das JavaScript-Symbol (Symbol.*) das implementiert werden muss, " +
      "damit ein Objekt mit `using` verwendet werden kann?",
    expectedAnswer: "Symbol.dispose",
    acceptableAnswers: [
      "Symbol.dispose", "symbol.dispose", "[Symbol.dispose]",
    ],
    explanation:
      "Das Explicit Resource Management Protocol (TC39 / TS 5.2) verlangt, dass " +
      "Objekte `[Symbol.dispose](): void` implementieren um mit `using` verwendet werden " +
      "zu koennen. Fuer asynchrone Ressourcen gibt es `[Symbol.asyncDispose]()`.",
  },

  // --- Frage 12: Predict-Output ---
  {
    type: "predict-output",
    question: "Welchen Typ hat `result` nach diesem TypeScript 5.5 Code?",
    code:
      "const values: (string | null)[] = ['a', null, 'b', null, 'c'];\n" +
      "const result = values.filter(x => x !== null);",
    expectedAnswer: "string[]",
    acceptableAnswers: [
      "string[]", "Array<string>",
    ],
    explanation:
      "Inferred Type Predicates (TS 5.5): TypeScript erkennt dass `x => x !== null` " +
      "ein Type Predicate `x is NonNullable<string | null>` = `x is string` ist. " +
      "Damit hat `.filter(...)` den Rueckgabetyp `string[]` statt `(string | null)[]`. " +
      "Vor TS 5.5 musste man `filter((x): x is string => x !== null)` schreiben.",
  },

  // --- Frage 13: Predict-Output ---
  {
    type: "predict-output",
    question: "Was ist der Typ von `b` in diesem TypeScript 5.4 Code?",
    code:
      "function setup<T>(items: T[], defaultItem: NoInfer<T>): T {\n" +
      "  return items[0] ?? defaultItem;\n" +
      "}\n" +
      "const b = setup(['hello', 'world'], 42);",
    expectedAnswer: "Compile-Error",
    acceptableAnswers: [
      "Compile-Error", "Fehler", "Error", "compile error", "type error",
    ],
    explanation:
      "T wird aus `items` als `string` inferiert (erster Parameter, keine NoInfer-Einschraenkung). " +
      "`defaultItem` ist `NoInfer<string>` — es muss string sein, aber 42 ist number. " +
      "TypeScript gibt einen Fehler: 'Argument of type number is not assignable to parameter " +
      "of type string'. Ohne NoInfer wuerde T als `string | number` inferiert.",
  },

  // --- Frage 14: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Warum fuehrt `verbatimModuleSyntax: true` in Kombination mit Angular zu besserer " +
      "Bundle-Groesse? Erklaere den Zusammenhang zwischen Import-Syntax und Tree-Shaking.",
    modelAnswer:
      "Ohne verbatimModuleSyntax kann TypeScript Typ-Imports zu leeren Imports " +
      "kompilieren die der Bundler nicht entfernen kann. Mit verbatimModuleSyntax " +
      "bleibt was du schreibst — `import type` wird komplett entfernt, normales import " +
      "bleibt. Das zwingt Entwickler, Typ-Imports als `import type` zu kennzeichnen. " +
      "Der Bundler sieht dann klar: dieses import ist nur fuer Typen, weg damit. " +
      "Weniger Laufzeit-Imports bedeuten kleinere Bundles und besseres Tree-Shaking.",
    keyPoints: [
      "import type wird vom Bundler komplett entfernt",
      "Normales import ohne type koennte Seiteneffekte haben — Bundler kann nicht entfernen",
      "verbatimModuleSyntax erzwingt diese Unterscheidung im Code",
      "Angular Standalone Components profitieren durch cleaner Dependency-Deklarationen",
    ],
  },

  // --- Frage 15: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Warum implementiert TypeScript nur TC39-Proposals ab Stage 3, und nicht " +
      "schon ab Stage 1 oder 2? Was war die historische Lektion dahinter?",
    modelAnswer:
      "Stage 3 bedeutet: Syntax und Semantik sind eingefroren. Das TC39-Komitee hat " +
      "die finale API beschlossen. Vor Stage 3 kann sich alles aendern — Syntax, " +
      "Semantik, Name des Features. TypeScript hat einmal einen Stage-2-Proposal " +
      "implementiert (Decorators in alter Form) der dann komplett redesignt wurde. " +
      "Das Ergebnis war eine Breaking Change in TypeScript 3.x und grosse Verwirrung. " +
      "Seitdem gilt informell: erst ab Stage 3 implementieren. So vermeidet TypeScript " +
      "dass Nutzer auf Features aufbauen die noch wegfallen oder sich aendern koennen.",
    keyPoints: [
      "Stage 3 = eingefrorene Syntax und Semantik",
      "Vor Stage 3 koennen sich Proposals komplett aendern",
      "Historische Lektion: alte Decorator-Implementation musste breaking geaendert werden",
      "TypeScript will keine instabile Fluktuation im Typsystem",
    ],
  },
];
