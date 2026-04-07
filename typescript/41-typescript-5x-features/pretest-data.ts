/**
 * Lektion 41 — Pre-Test-Fragen: TypeScript 5.x Features
 *
 * 3 Fragen pro Sektion, die VOR dem Lesen gestellt werden.
 * Ziel: Das Gehirn fuer die kommende Erklaerung "primen".
 */

export interface PretestQuestion {
  /** Auf welche Sektion sich die Frage bezieht (1-basiert) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Kurze Erklaerung (wird erst NACH der Sektion relevant) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Sektion 1: Die TypeScript 5.x Aera ─────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Welche Version war der erste Major-Release von TypeScript seit 2.x?",
    options: [
      "TypeScript 3.0",
      "TypeScript 4.0",
      "TypeScript 5.0",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "TypeScript 5.0 (Maerz 2023) war nach langen Jahren der 4.x-Serie der erste " +
      "neue Major-Release — obwohl er kaum Breaking Changes mitbrachte.",
  },
  {
    sectionIndex: 1,
    question:
      "Was war das Hauptthema von TypeScript 5.0?",
    options: [
      "Komplett neues Modulsystem",
      "Decorators (ECMAScript-Standard) und moduleResolution: bundler",
      "Entfernung von enum und namespace",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TS 5.0 standardisierte Decorators (TC39 Stage 3) und fuehrte " +
      "moduleResolution: bundler fuer moderne Build-Tools ein.",
  },
  {
    sectionIndex: 1,
    question:
      "Wie schnell veroeffentlicht das TypeScript-Team neue Versionen?",
    options: [
      "Einmal pro Jahr (wie Node.js LTS)",
      "Ungefaehr alle 3 Monate",
      "Einmal pro Monat",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript hat einen quartaligen Release-Rhythmus: etwa alle 3 Monate " +
      "erscheint eine neue Minor-Version mit neuen Features.",
  },

  // ─── Sektion 2: Moderne Module — verbatimModuleSyntax und bundler ────────

  {
    sectionIndex: 2,
    question:
      "Was macht `import type { User } from './types'`?",
    options: [
      "Importiert User sowohl als Typ als auch als Laufzeit-Wert",
      "Importiert User nur fuer die Typinformation — kein Laufzeit-Import",
      "Ist identisch mit normalem import",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`import type` erzeugt keinen JavaScript-Code im Output. " +
      "Der Bundler kann es vollstaendig entfernen — ideal fuer tree-shaking.",
  },
  {
    sectionIndex: 2,
    question:
      "Was ist das Hauptproblem das `verbatimModuleSyntax: true` loest?",
    options: [
      "TypeScript-Syntax die nicht zu JavaScript kompatibel ist",
      "Versehentliche Laufzeit-Imports von reinen Typen",
      "Zu langsames Bundling durch fehlende Parallelisierung",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Ohne verbatimModuleSyntax konnten Typen als normale Imports erscheinen. " +
      "Mit der Option wird erzwungen, Typ-Imports explizit zu kennzeichnen.",
  },
  {
    sectionIndex: 2,
    question:
      "Welchen Module-Resolution-Modus brauchst du fuer Vite-Projekte?",
    options: [
      "node",
      "node16",
      "bundler",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "`moduleResolution: 'bundler'` (TS 5.0) spiegelt das Verhalten moderner " +
      "Bundler wie Vite, esbuild und webpack 5 wider.",
  },

  // ─── Sektion 3: Inferred Type Predicates und NoInfer ────────────────────

  {
    sectionIndex: 3,
    question:
      "Was war das Problem mit `arr.filter(x => x !== null)` vor TypeScript 5.5?",
    code: "const nums: (number | null)[] = [1, null, 2];\nconst result = nums.filter(x => x !== null);",
    options: [
      "Es hat gar nicht funktioniert — man brauchte reduce",
      "result hatte Typ (number | null)[] statt number[]",
      "null wurde durch undefined ersetzt statt entfernt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript konnte das Type Predicate vor 5.5 nicht inferieren. " +
      "Man musste explizit schreiben: `.filter((x): x is number => x !== null)`.",
  },
  {
    sectionIndex: 3,
    question:
      "Was ist ein 'Type Predicate' in TypeScript?",
    options: [
      "Eine Bedingung in einer WHERE-Klausel fuer Type-Level Queries",
      "Eine Funktion die einen Typ in einen anderen umwandelt",
      "Eine Funktion mit Return-Typ `param is Type` die TypeScript ueber Narrowing informiert",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Type Predicates (`x is string`) teilen TypeScript mit: 'wenn diese Funktion true " +
      "zurueckgibt, dann ist x vom Typ string.' Damit funktioniert Narrowing in filter, " +
      "find und anderen Higher-Order-Funktionen.",
  },
  {
    sectionIndex: 3,
    question:
      "Wofuer steht das 'No' in `NoInfer<T>`?",
    options: [
      "T soll fuer diesen Parameter NICHT fuer die Inferenz herangezogen werden",
      "T darf nicht null oder undefined sein",
      "T ist ein negativer Typ (Complement Type)",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "`NoInfer<T>` verhindert dass dieser Parameter die Inferenz von T beeinflusst. " +
      "T wird aus anderen Parametern inferiert und dann dort nur validiert.",
  },

  // ─── Sektion 4: Array- und Controlflow-Verbesserungen ───────────────────

  {
    sectionIndex: 4,
    question:
      "Was bedeutet `using` in TypeScript 5.2?",
    options: [
      "Automatisches Aufrufen von `Symbol.dispose` am Block-Ende",
      "Eine neue Import-Syntax fuer Namespaces",
      "Eine Abkuerzung fuer using strict",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "`using` implementiert das Explicit Resource Management Pattern (TC39). " +
      "Am Block-Ende wird automatisch `[Symbol.dispose]()` aufgerufen.",
  },
  {
    sectionIndex: 4,
    question:
      "Was ist der Unterschied zwischen `using` und `await using`?",
    options: [
      "await using ruft `Symbol.asyncDispose` auf und wartet auf das Promise",
      "await using wartet auf den naechsten Microtask bevor dispose aufgerufen wird",
      "Es gibt keinen Unterschied",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "`await using` nutzt `Symbol.asyncDispose` statt `Symbol.dispose`. " +
      "Es wartet auf das zurueckgegebene Promise — fuer asynchrones Aufraeumen wie DB-Verbindungen.",
  },
  {
    sectionIndex: 4,
    question:
      "Was aendert sich mit `noUncheckedIndexedAccess: true` bei `arr[0]`?",
    options: [
      "arr[0] hat Typ T | undefined statt T",
      "arr[0] wirft sofort einen Fehler wenn arr leer ist",
      "Negativer Index-Zugriff wird verboten",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Mit `noUncheckedIndexedAccess` gibt TypeScript fuer jeden Index-Zugriff " +
      "`T | undefined` zurueck — weil das Array zur Laufzeit leer sein koennte.",
  },

  // ─── Sektion 5: Performance und Editor-Features ─────────────────────────

  {
    sectionIndex: 5,
    question:
      "Was macht `skipLibCheck: true` in tsconfig.json?",
    options: [
      "Ueberspringt das Pruefe der eigenen TypeScript-Dateien",
      "Ich weiss es nicht",
      "Deaktiviert Library-spezifische Compiler-Warnungen",
      "Ueberspringt die Pruefung von .d.ts-Dateien (inkl. node_modules)",
    ],
    correct: 3,
    briefExplanation:
      "`skipLibCheck: true` bringt erhebliche Performance-Gewinne in grossen Projekten. " +
      "Der Preis: Fehler in den Typ-Definitionen von Dependencies werden nicht entdeckt.",
  },
  {
    sectionIndex: 5,
    question:
      "Wofuer steht 'LSP' in 'TypeScript Language Server Protocol'?",
    options: [
      "Fuers Programm das Autocomplete und Fehlermeldungen im Editor bereitstellt",
      "Ein Protokoll fuer verteiltes TypeScript-Compiling im Netzwerk",
      "Eine Library fuer Serialisierung von TypeScript-ASTs",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Der Language Server (tsserver) kommuniziert mit deinem Editor ueber das Language " +
      "Server Protocol. Er berechnet Autocomplete, Go-to-Definition und Typ-Fehler.",
  },
  {
    sectionIndex: 5,
    question:
      "Wann ist `isolatedDeclarations: true` sinnvoll?",
    options: [
      "Immer — es macht TypeScript strenger und sicherer",
      "Ich weiss es nicht",
      "In grossen Angular-Anwendungen mit vielen Komponenten",
      "Bei npm-Libraries die parallele .d.ts-Erzeugung durch andere Tools ermoeglichen wollen",
    ],
    correct: 3,
    briefExplanation:
      "`isolatedDeclarations` erzwingt explizite Typen bei Exporten. " +
      "Dadurch kann jedes Tool (esbuild, swc) .d.ts-Dateien erzeugen — " +
      "ohne den vollen TypeScript-Compiler zu benoetigen.",
  },

  // ─── Sektion 6: Der Upgrade-Pfad und TypeScript Zukunft ─────────────────

  {
    sectionIndex: 6,
    question:
      "Was bedeutet `\"typescript\": \"~5.7.0\"` in package.json?",
    options: [
      "Genau Version 5.7.0 — nicht mehr, nicht weniger",
      "Mindestens 5.7.0, maximal kleiner als 6.0.0",
      "Mindestens 5.7.0, nur Patch-Updates erlaubt (5.7.x)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Tilde (~) erlaubt nur Patch-Versionen. `~5.7.0` = >=5.7.0 <5.8.0. " +
      "Das ist sicherer als Caret (^) weil TypeScript Behavioral Breaking Changes in " +
      "Minor-Versionen haben kann.",
  },
  {
    sectionIndex: 6,
    question:
      "Was ist `@ts-expect-error` und worin unterscheidet es sich von `@ts-ignore`?",
    options: [
      "Beide sind identisch — es sind Aliases",
      "Ich weiss es nicht",
      "@ts-expect-error funktioniert nur in Test-Dateien",
      "@ts-expect-error gibt selbst einen Fehler wenn kein Fehler darunter existiert; @ts-ignore ist immer still",
    ],
    correct: 3,
    briefExplanation:
      "`@ts-expect-error` ist ehrlicher: Es gibt einen Fehler wenn die naechste Zeile " +
      "keinen Fehler hat. Das zwingt dich, es wieder zu entfernen sobald der urspruengliche " +
      "Fehler behoben ist. `@ts-ignore` vergisst man leicht.",
  },
  {
    sectionIndex: 6,
    question:
      "Ab welcher TC39-Stage implementiert TypeScript normalerweise neue JavaScript-Features?",
    options: [
      "Stage 1 — sobald der Proposal-Champion eine Implementierung zeigt",
      "Stage 2 — wenn die erste Spezifikation vorliegt",
      "Ich weiss es nicht",
      "Stage 3 — wenn Syntax und Semantik eingefroren sind",
    ],
    correct: 3,
    briefExplanation:
      "Stage 3 bedeutet eingefrorene Syntax. TypeScript hat gelernt (durch Decorators), " +
      "dass fruehe Implementierungen zu Breaking Changes fuehren wenn sich der Proposal " +
      "noch aendert.",
  },
];
