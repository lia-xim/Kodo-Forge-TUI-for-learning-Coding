/**
 * Lektion 29 — Quiz-Daten: tsconfig Deep Dive
 *
 * 15 MC + 5 Short-Answer + 2 Predict-Output + 1 Explain-Why = 23 Fragen
 * correct-Indizes MC: 4x0, 4x1, 4x2, 3x3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "29";
export const lessonTitle = "tsconfig Deep Dive";

export const questions: QuizQuestion[] = [
  // ─── MC: correct: 0 (4x) ──────────────────────────────────────────────

  {
    question: "Was passiert mit `include` wenn eine Kind-tsconfig `extends` verwendet und eigenes `include` setzt?",
    options: [
      "Das `include` der Eltern-Datei wird komplett ueberschrieben",
      "Beide `include`-Listen werden zusammengefuehrt (merged) und beide gelten",
      "Das Kind-`include` wird ignoriert und nur die Eltern-Liste wird verwendet",
      "TypeScript wirft einen Fehler weil include nicht ueberschrieben werden darf"
    ],
    correct: 0,
    explanation: "Im Gegensatz zu compilerOptions (die gemerged werden) wird include/exclude/files bei extends KOMPLETT ueberschrieben. Die Eltern-Liste wird ignoriert.",
  },

  {
    question: "Welches Flag ist PFLICHT fuer ein Projekt das mit Project References (`references`) referenziert wird?",
    options: [
      "`composite: true` — aktiviert inkrementelle Builds und erzwingt declaration",
      "`incremental: true` — fuer schnellere Builds durch Caching von Compiler-Informationen",
      "`declaration: true` — fuer .d.ts-Erzeugung die die Typen fuer andere Projekte bereitstellt",
      "`noEmit: true` — fuer reine Typ-Pruefung ohne JavaScript-Output"
    ],
    correct: 0,
    explanation: "composite: true ist Pflicht fuer referenzierte Projekte. Es aktiviert incremental automatisch und erzwingt declaration: true.",
  },

  {
    question: "Was bewirkt `noEmit: true` in der tsconfig?",
    options: [
      "TypeScript prueft Typen, erzeugt aber KEINE Dateien — ideal wenn esbuild/Vite transpiliert",
      "TypeScript erzeugt nur .d.ts Dateien und ueberspringt die JavaScript-Generierung komplett",
      "TypeScript ueberspringt die Typ-Pruefung und verlaesst sich ausschliesslich auf den Bundler",
      "TypeScript erzeugt minifizierten Output der direkt im Browser verwendet werden kann"
    ],
    correct: 0,
    explanation: "noEmit macht TypeScript zum reinen Type-Checker. Kein .js, kein .d.ts — nur Fehlermeldungen. Der Bundler uebernimmt die Transpilation.",
  },

  {
    question: "Was macht `verbatimModuleSyntax` anders als `isolatedModules`?",
    options: [
      "Es erzwingt explizites `import type` fuer reine Typ-Imports und ersetzt drei aeltere Flags",
      "Es ist nur ein Alias fuer isolatedModules und aendert nichts am bestehenden Verhalten",
      "Es deaktiviert die Modul-Aufloesung komplett und verwendet ausschliesslich relative Pfade",
      "Es erzwingt CommonJS-Syntax und verhindert die Verwendung von ES Modules"
    ],
    correct: 0,
    explanation: "verbatimModuleSyntax (TS 5.0) ersetzt isolatedModules + preserveValueImports + importsNotUsedAsValues. Die Regel: import type wird geloescht, import bleibt.",
  },

  // ─── MC: correct: 1 (4x) ──────────────────────────────────────────────

  {
    question: "Was aktiviert `strict: true` in TypeScript?",
    options: [
      "Nur strictNullChecks und noImplicitAny",
      "11 einzelne Strict-Flags gleichzeitig als Buendel",
      "Alle moeglichen Compiler-Flags auf ihre strengste Einstellung",
      "Nur die Flags die keinen bestehenden Code brechen"
    ],
    correct: 1,
    explanation: "strict ist ein Meta-Flag das 11 Flags buendelt: strictNullChecks, strictFunctionTypes, noImplicitAny, strictPropertyInitialization, und weitere.",
  },

  {
    question: "Warum erzwingt `moduleResolution: 'nodenext'` die `.js`-Endung in Imports?",
    options: [
      "Weil TypeScript nur .js-Dateien lesen kann",
      "Weil der Import dem Output-Format entsprechen muss — Node.js sieht nur .js",
      "Weil .ts-Endungen von Node.js verboten sind",
      "Weil nodenext nur CommonJS unterstuetzt"
    ],
    correct: 1,
    explanation: "TypeScript schreibt Import-Pfade NICHT um. Der Pfad muss im JavaScript-Output funktionieren. Da Node.js nur .js sieht, muss der Import auf .js zeigen.",
  },

  {
    question: "Was ist der Unterschied zwischen `target` und `lib`?",
    options: [
      "`target` bestimmt die APIs die verfuegbar sind, `lib` bestimmt die Syntax-Transformation",
      "`target` bestimmt die Syntax-Transformation, `lib` bestimmt die verfuegbaren API-Typen",
      "Es gibt keinen Unterschied zwischen target und lib sie sind vollstaendig austauschbar",
      "`target` ist ausschliesslich fuer Browser-Projekte, `lib` ist nur fuer Node.js relevant"
    ],
    correct: 1,
    explanation: "target steuert, WELCHE Syntax heruntertransformiert wird (z.B. class → function). lib steuert, WELCHE APIs TypeScript kennt (z.B. DOM, ES2023).",
  },

  {
    question: "Was bewirkt `skipLibCheck: true`?",
    options: [
      "Ueberspringt die Pruefung aller importierten Module und behandelt sie als vertrauenswuerdig",
      "Ueberspringt die Pruefung von .d.ts Dateien — dein eigener Code wird trotzdem voll geprueft",
      "Deaktiviert TypeScript komplett fuer externe Libraries und behandelt sie als any",
      "Ueberspringt die Pruefung von .ts Dateien in node_modules aber nicht von .d.ts Dateien"
    ],
    correct: 1,
    explanation: "skipLibCheck prueft .d.ts-Dateien nicht INTERN, aber dein Code wird trotzdem GEGEN diese .d.ts-Dateien geprueft. Nur Konflikte innerhalb der .d.ts werden ignoriert.",
  },

  // ─── MC: correct: 2 (4x) ──────────────────────────────────────────────

  {
    question: "Warum ist `const enum` mit `isolatedModules` inkompatibel?",
    options: [
      "const enum ist generell veraltet und sollte nicht mehr in modernen Projekten verwendet werden",
      "const enum erzeugt zu viel Code und verlaengert die Build-Zeit erheblich",
      "const enum erfordert Cross-File-Kontext — esbuild/swc verarbeiten aber nur einzelne Dateien",
      "const enum funktioniert nur mit CommonJS und ist mit ES Modules nicht kompatibel"
    ],
    correct: 2,
    explanation: "const enum wird inline ersetzt (der Wert wird eingesetzt). esbuild verarbeitet Dateien einzeln und kann Werte aus anderen Dateien nicht nachschlagen.",
  },

  {
    question: "Was macht `esModuleInterop: true`?",
    options: [
      "Erlaubt ES Module in CommonJS-Projekten und konvertiert sie automatisch zur Laufzeit",
      "Deaktiviert die Modul-Pruefung und erlaubt beliebige Import-Syntax ohne Validierung",
      "Ermoeglicht Default-Imports von CommonJS-Modulen durch Hilfsfunktionen",
      "Konvertiert alle Imports zu require() und entfernt ES-Module-Syntax komplett"
    ],
    correct: 2,
    explanation: "CommonJS hat kein default-Export-Konzept. esModuleInterop fuegt Hilfsfunktionen ein, die module.exports so wrappen, dass import x from 'pkg' funktioniert.",
  },

  {
    question: "In Angular: Warum wird die tsconfig in app und spec aufgeteilt?",
    options: [
      "Performance — kleinere tsconfig bedeutet schnelleren Build und weniger Speicherbedarf",
      "Angular CLI erfordert diese Struktur und verweigert den Build ohne sie",
      "Test-Isolation — `types: ['jasmine']` nur in Tests, nicht im Produktionscode",
      "Historische Gruende ohne praktischen Nutzen die aus Kompatibilitaetsgruenden beibehalten werden"
    ],
    correct: 2,
    explanation: "Ohne Trennung waeren describe(), it(), expect() im Produktionscode verfuegbar. Die types-Option steuert, welche globalen Typen sichtbar sind.",
  },

  {
    question: "Was bewirkt `noUncheckedIndexedAccess: true`?",
    options: [
      "Verbietet Index-Zugriffe auf Arrays komplett und erzwingt die Verwendung von Methoden",
      "Erzwingt Bounds-Checks zur Laufzeit die bei fehlerhaften Zugriffen eine Exception ausloesen",
      "Array/Objekt-Zugriff per Index gibt `T | undefined` statt nur `T`",
      "Aktiviert stricte Array-Typen die nur spezifische Elemente anstelle von any erlauben"
    ],
    correct: 2,
    explanation: "arr[5] gibt mit diesem Flag number | undefined statt number zurueck. Das verhindert Array-Out-of-Bounds-Fehler zur Compile-Zeit.",
  },

  // ─── MC: correct: 3 (3x) ──────────────────────────────────────────────

  {
    question: "Was ist der Hauptvorteil von `moduleResolution: 'bundler'` gegenueber `'node'`?",
    options: [
      "Schnellere Kompilierung",
      "Kompatibilitaet mit CommonJS",
      "Automatische .js-Endungen",
      "Unterstuetzt package.json `exports`-Feld und braucht keine Datei-Endungen in Imports"
    ],
    correct: 3,
    explanation: "bundler versteht moderne package.json-Features (exports, imports) und braucht keine .js-Endungen — weil der Bundler die Datei-Aufloesung uebernimmt.",
  },

  {
    question: "Was passiert wenn du in einer tsconfig `lib` explizit setzt?",
    options: [
      "Die angegebenen Libs werden zum Default hinzugefuegt",
      "Nur die erste Lib wird geladen",
      "TypeScript ignoriert die lib-Option wenn target gesetzt ist",
      "Der target-basierte Default wird KOMPLETT ueberschrieben — vergisst du DOM, gibt es kein document"
    ],
    correct: 3,
    explanation: "lib ueberschreibt den Default komplett. Wenn du ES2022 angibst aber DOM vergisst, kennt TypeScript weder document noch window noch fetch.",
  },

  {
    question: "Was erzeugt `declarationMap: true`?",
    options: [
      "Source Maps fuer JavaScript-Dateien",
      "Eine Uebersicht aller Typ-Deklarationen",
      "Eine Karte der Modul-Abhaengigkeiten",
      ".d.ts.map Dateien die 'Go to Definition' zur Original-Source ermoeglichen statt zur .d.ts"
    ],
    correct: 3,
    explanation: "declarationMap erzeugt .d.ts.map-Dateien. In der IDE springt 'Go to Definition' dann zur originalen .ts-Datei statt zur generierten .d.ts.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Neue Formate: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welches tsconfig-Flag macht TypeScript zum reinen Type-Checker ohne JavaScript-Output?",
    expectedAnswer: "noEmit",
    acceptableAnswers: ["noEmit", "noEmit: true", "\"noEmit\": true"],
    explanation: "noEmit: true verhindert jeglichen Output. TypeScript prueft Typen, erzeugt aber keine .js oder .d.ts Dateien. Ideal wenn esbuild/Vite/SWC transpiliert.",
  },

  {
    type: "short-answer",
    question: "Wie viele einzelne Flags aktiviert `strict: true` in TypeScript 5.6+?",
    expectedAnswer: "11",
    acceptableAnswers: ["11", "elf", "Elf"],
    explanation: "strict buendelt 11 Flags: strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitAny, noImplicitThis, alwaysStrict, useUnknownInCatchVariables, exactOptionalPropertyTypes, noImplicitOverride, strictBuiltinIteratorReturn.",
  },

  {
    type: "short-answer",
    question: "Welches Flag ist Pflicht fuer Projekte die mit `references` in einem Monorepo referenziert werden?",
    expectedAnswer: "composite",
    acceptableAnswers: ["composite", "composite: true", "\"composite\": true"],
    explanation: "composite: true aktiviert inkrementelle Builds, erzwingt declaration: true und erzeugt .tsbuildinfo. Es ist Pflicht fuer jedes Projekt das in references aufgefuehrt wird.",
  },

  {
    type: "short-answer",
    question: "Welche moduleResolution-Strategie ist fuer Projekte mit Webpack, Vite oder esbuild empfohlen?",
    expectedAnswer: "bundler",
    acceptableAnswers: ["bundler", "\"bundler\"", "moduleResolution: bundler"],
    explanation: "bundler versteht package.json exports, braucht keine .js-Endungen, und ist optimiert fuer Bundler die ihre eigene Modul-Aufloesung haben.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat `x` mit `noUncheckedIndexedAccess: true`?",
    code: "const arr: number[] = [1, 2, 3];\nconst x = arr[0];",
    expectedAnswer: "number | undefined",
    acceptableAnswers: ["number | undefined", "number|undefined"],
    explanation: "Mit noUncheckedIndexedAccess gibt Index-Zugriff T | undefined zurueck. arr[0] ist number | undefined, weil TypeScript nicht garantieren kann, dass Index 0 existiert.",
  },

  {
    type: "predict-output",
    question: "Was passiert mit diesem Import bei `verbatimModuleSyntax: true`?",
    code: "import type { User } from './types';\nimport { formatDate } from './utils';\n// Welcher Import bleibt im JavaScript-Output?",
    expectedAnswer: "formatDate",
    acceptableAnswers: ["formatDate", "import { formatDate } from './utils'", "nur formatDate", "der zweite"],
    explanation: "import type wird komplett entfernt. import (ohne type) bleibt im Output. verbatimModuleSyntax macht dieses Verhalten explizit und erzwingbar.",
  },

  {
    type: "explain-why",
    question: "Warum ist der Trend 'TypeScript als Type-Checker statt als Compiler' (noEmit + esbuild/swc) so dominant? Welche Vorteile hat diese Architektur?",
    modelAnswer:
      "esbuild und SWC sind in Go bzw. Rust geschrieben und transpilieren 10-100x schneller als tsc. " +
      "Da TypeScript-Typ-Informationen zur Laufzeit sowieso verschwinden (Type Erasure), braucht die " +
      "Transpilation keinen Typchecker — sie muss nur Typ-Annotationen entfernen. Das kann esbuild " +
      "trivial leisten. TypeScript bleibt als Type-Checker verantwortlich fuer die Korrektheitspruefung, " +
      "waehrend der schnellere Transpiler den Output erzeugt. Das Ergebnis: schnellere Builds bei " +
      "gleicher Typsicherheit.",
    keyPoints: [
      "esbuild/swc sind 10-100x schneller als tsc bei der Transpilation",
      "Transpilation braucht keine Typ-Information (Type Erasure)",
      "TypeScript bleibt fuer die Typ-Pruefung zustaendig",
      "isolatedModules/verbatimModuleSyntax stellen Kompatibilitaet sicher",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect: "include/exclude/files werden bei extends KOMPLETT ueberschrieben, nicht gemerged. Nur compilerOptions werden zusammengefuehrt.",
    commonMistake: "Annehmen dass include gemerged wird wie compilerOptions — dann fehlen ploetzlich Dateien im Build.",
  },
  1: {
    whyCorrect: "composite: true ist die Voraussetzung fuer Project References. Es aktiviert incremental und erzwingt declaration.",
    commonMistake: "declaration: true allein reichen lassen — ohne composite funktioniert tsc --build nicht.",
  },
  2: {
    whyCorrect: "noEmit macht TypeScript zum reinen Type-Checker. Kein Output — ideal wenn Vite/esbuild die Transpilation uebernimmt.",
    commonMistake: "Denken noEmit deaktiviert auch die Typ-Pruefung. Nein — es deaktiviert nur den Output.",
  },
  3: {
    whyCorrect: "verbatimModuleSyntax macht import vs import type explizit. Was als import type markiert ist wird geloescht, alles andere bleibt.",
    commonMistake: "Denken verbatimModuleSyntax ist nur ein Rename von isolatedModules. Es ist strenger und ersetzt drei Flags.",
  },
  4: {
    whyCorrect: "strict ist ein Meta-Flag das 11 einzelne Flags buendelt. Mit jedem TS-Release koennen neue Flags dazukommen.",
    commonMistake: "Denken strict aktiviert ALLE Compiler-Flags. Nein — nur die sicherheitsrelevanten Strict-Flags.",
  },
  5: {
    whyCorrect: "TypeScript schreibt Import-Pfade nicht um. Der Import muss im JS-Output funktionieren — und dort gibt es nur .js.",
    commonMistake: "Die .js-Endung als 'Bug' oder 'Unsinn' ansehen. Es ist logisch konsequent: emit fidelity.",
  },
  6: {
    whyCorrect: "target steuert Syntax-Downleveling (class → function, async → generators). lib steuert welche API-Typen geladen werden.",
    commonMistake: "target und lib fuer dasselbe halten. Sie sind unabhaengig — du kannst target ES2015 mit lib ES2023 haben.",
  },
  7: {
    whyCorrect: "skipLibCheck ueberspringt nur die INTERNE Pruefung von .d.ts. Dein Code wird trotzdem gegen die .d.ts-Typen geprueft.",
    commonMistake: "Denken skipLibCheck deaktiviert alle Typ-Pruefungen fuer externe Libraries.",
  },
  8: {
    whyCorrect: "const enum wird inline ersetzt — der Wert wird direkt eingesetzt. esbuild kennt aber nur die aktuelle Datei.",
    commonMistake: "Regulaere enums werden auch von isolatedModules blockiert — stimmt nicht, die erzeugen ein Runtime-Objekt.",
  },
  9: {
    whyCorrect: "esModuleInterop fuegt __importDefault-Hilfsfunktionen ein die module.exports als default-Export wrappen.",
    commonMistake: "Verwechslung mit allowSyntheticDefaultImports — das erlaubt nur die Syntax, fuegt keine Hilfsfunktionen ein.",
  },
  10: {
    whyCorrect: "Die types-Option steuert globale Typen. In tsconfig.spec.json: types: ['jasmine']. In tsconfig.app.json: types: [].",
    commonMistake: "Denken die Trennung ist nur fuer Uebersichtlichkeit — sie hat aber echten Einfluss auf die Typ-Sichtbarkeit.",
  },
  11: {
    whyCorrect: "noUncheckedIndexedAccess gibt T | undefined fuer Index-Zugriffe. arr[0] ist number | undefined statt nur number.",
    commonMistake: "Dieses Flag mit strict verwechseln. noUncheckedIndexedAccess ist NICHT Teil von strict!",
  },
  12: {
    whyCorrect: "bundler versteht exports/imports in package.json und braucht keine .js-Endungen. Der Bundler loest Dateien auf.",
    commonMistake: "bundler mit node verwechseln. node versteht KEIN exports-Feld in package.json.",
  },
  13: {
    whyCorrect: "lib ueberschreibt den Default komplett. Fehlt DOM, sind document/window/fetch unbekannt.",
    commonMistake: "Annehmen lib wird zum Default addiert. Nein — explizites lib = KEIN Default mehr.",
  },
  14: {
    whyCorrect: "declarationMap ermoeglicht Go-to-Definition zur Original-Source statt zur generierten .d.ts.",
    commonMistake: "declarationMap mit sourceMap verwechseln. sourceMap ist fuer JS-Debugging, declarationMap fuer Typ-Navigation.",
  },
};
