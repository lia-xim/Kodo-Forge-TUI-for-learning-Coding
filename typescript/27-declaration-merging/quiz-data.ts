// quiz-data.ts — L27: Declaration Merging
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "27";
export const lessonTitle = "Declaration Merging";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- correct: 0 ---
  {
    question: "Was passiert wenn du zwei gleichnamige Interfaces in TypeScript deklarierst?",
    options: [
      "Sie werden automatisch zu einem Interface vereint (Declaration Merging)",
      "TypeScript meldet einen Compile-Error wegen doppelter Deklaration",
      "Das zweite Interface ueberschreibt das erste komplett",
      "Beide existieren unabhaengig voneinander",
    ],
    correct: 0,
    explanation:
      "TypeScript vereint gleichnamige Interfaces automatisch. Alle Properties aus " +
      "beiden Deklarationen werden zusammengefuegt. Das ist ein bewusstes Design-Feature.",
    elaboratedFeedback: {
      whyCorrect: "Interface Merging ist TypeScript's Antwort auf JavaScript's dynamische Natur. Es ermoeglicht das Erweitern von Typen ueber Dateigrenzen hinweg — ohne den Original-Typ zu aendern.",
      commonMistake: "Viele erwarten einen Fehler wie bei 'type' (Doppeldeklaration). Aber 'interface' ist bewusst 'offen' designed — 'type' ist 'geschlossen'. Das ist kein Bug, sondern ein Feature."
    }
  },

  {
    question: "Warum braucht Module Augmentation 'declare module' mit dem EXAKTEN Paketnamen?",
    options: [
      "Falscher Name erzeugt ein neues, separates Modul statt das existierende zu erweitern",
      "TypeScript ignoriert Augmentations mit falschem Namen komplett",
      "Falsche Namen verursachen einen Compile-Error",
      "Der Paketname muss nur ungefaehr stimmen",
    ],
    correct: 0,
    explanation:
      "Bei falschem Modulnamen erstellt TypeScript ein NEUES Modul mit dem falschen Namen. " +
      "Es gibt keinen Error — die Augmentation existiert einfach im falschen Namespace " +
      "und hat keine Wirkung auf das Zielmodul.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript kann nicht wissen ob du ein neues Modul deklarieren oder ein existierendes erweitern willst. Wenn der Name nicht passt, nimmt es an du willst ein neues Modul. Kein Error, aber auch kein Merging.",
      commonMistake: "Haeufigster Fehler bei Express: 'express' statt 'express-serve-static-core'. Die Augmentation scheint zu funktionieren (kein Error), aber req.user ist trotzdem 'unknown'."
    }
  },

  {
    question: "Was ist der Zweck von 'declare global { }' in TypeScript?",
    options: [
      "Den globalen Scope (window, globalThis, process) aus einem Modul heraus erweitern",
      "Alle Variablen in der aktuellen Datei global machen",
      "TypeScript's Strict Mode deaktivieren",
      "Globale Variablen vor anderen Modulen verstecken",
    ],
    correct: 0,
    explanation:
      "'declare global' ist ein 'Escape Hatch' aus dem Modul-System. Es fuegt " +
      "Deklarationen zum globalen Scope hinzu — nuetzlich fuer window.*, process.env, etc.",
    elaboratedFeedback: {
      whyCorrect: "Module sind isoliert — Deklarationen innerhalb eines Moduls sind nicht global sichtbar. 'declare global' bricht aus dieser Isolation aus und fuegt Typen zum globalen Scope hinzu.",
      commonMistake: "Viele vergessen 'export {}' in der Datei. Ohne import/export ist die Datei ein Script (schon global), und 'declare global' macht keinen Sinn — TypeScript ignoriert es oder zeigt einen Fehler."
    }
  },

  {
    question: "Was macht 'declare function add(a: number, b: number): number' in einer .d.ts-Datei?",
    options: [
      "Deklariert den Typ einer Funktion die WOANDERS implementiert ist — ohne Funktionskoerper",
      "Implementiert und exportiert die Funktion add",
      "Erstellt eine abstrakte Funktion die spaeter ueberschrieben werden muss",
      "Deklariert eine Funktion die nur im Typsystem existiert (Phantom Function)",
    ],
    correct: 0,
    explanation:
      "'declare' bedeutet: 'Dieser Wert existiert zur Laufzeit, ich beschreibe nur den Typ.' " +
      "Es gibt keine Implementierung — die kommt aus dem JavaScript-Code oder einer Bibliothek.",
    elaboratedFeedback: {
      whyCorrect: "'declare' ist TypeScript's Weg zu sagen: 'Vertrau mir, diese Funktion existiert.' Die Implementierung kommt von ausserhalb (JavaScript-Datei, globales Skript, CDN-Library). Die .d.ts beschreibt nur den Typ.",
      commonMistake: "Manche versuchen Funktionskoerper in .d.ts zu schreiben. Das gibt einen Error — .d.ts-Dateien duerfen nur Deklarationen enthalten, keine Implementierungen."
    }
  },

  // --- correct: 1 ---
  {
    question: "Was passiert wenn zwei Interface-Deklarationen das gleiche Property mit VERSCHIEDENEN Typen haben?",
    options: [
      "Der spaetere Typ ueberschreibt den frueheren",
      "TypeScript meldet einen Compile-Error",
      "Beide Typen werden zu einer Union vereint",
      "TypeScript waehlt den breiteren Typ automatisch",
    ],
    correct: 1,
    explanation:
      "Wenn dasselbe Property verschiedene Typen hat, ist das ein Compile-Error. " +
      "Interface Merging funktioniert nur wenn gleiche Properties auch den gleichen Typ haben. " +
      "Das verhindert versehentliche Typ-Konflikte.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript meldet: 'Subsequent property declarations must have the same type.' Das ist ein Sicherheits-Feature — stille Typ-Konflikte waeren gefaehrlicher als ein lauter Fehler.",
      commonMistake: "Manche erwarten dass TypeScript eine Union bildet (string | number). Nein — Properties muessen exakt uebereinstimmen. Nur bei Methoden-Overloads werden Deklarationen kombiniert."
    }
  },

  {
    question: "Warum muss eine Datei mit 'declare module' oder 'declare global' mindestens ein import/export haben?",
    options: [
      "TypeScript braucht den Import fuer die Typ-Aufloesung",
      "Ohne import/export ist die Datei ein 'Script' (global) statt ein 'Modul' (isoliert)",
      "Nur Module duerfen Deklarationen enthalten",
      "Das ist ein Bug in TypeScript der noch nicht behoben wurde",
    ],
    correct: 1,
    explanation:
      "TypeScript unterscheidet 'Scripts' (alles global) und 'Module' (isoliert). " +
      "declare global macht nur in Modulen Sinn — in Scripts ist alles bereits global. " +
      "'export {}' ist der minimale Weg eine Datei zum Modul zu machen.",
    elaboratedFeedback: {
      whyCorrect: "In einem Script waere 'declare global' redundant — alles ist schon global. 'declare module' in einem Script wuerde eine Ambient-Module-Deklaration erzeugen (anderes Verhalten!). Der 'export {}'-Trick macht die Datei explizit zum Modul.",
      commonMistake: "Viele vergessen das 'export {}' und wundern sich warum die Augmentation nicht funktioniert oder sich anders verhaelt als erwartet."
    }
  },

  {
    question: "Wie erweitert man Express' Request-Interface korrekt?",
    options: [
      "declare module 'express' { interface Request { user: User } }",
      "declare module 'express-serve-static-core' { interface Request { user: User } }",
      "interface Express.Request { user: User }",
      "type Request = import('express').Request & { user: User }",
    ],
    correct: 1,
    explanation:
      "Express re-exportiert Request aus 'express-serve-static-core'. Man muss das " +
      "QUELL-Modul erweitern, nicht das re-exportierende. Den richtigen Modulnamen " +
      "findet man in node_modules/@types/express/index.d.ts.",
    elaboratedFeedback: {
      whyCorrect: "In @types/express steht: import * as core from 'express-serve-static-core'. Request kommt aus core. Augmentiert man 'express' statt 'express-serve-static-core', trifft man das falsche Interface.",
      commonMistake: "Der haeufigste Express-Augmentation-Fehler. declare module 'express' erzeugt ein NEUES Request-Interface im express-Modul das mit dem Original nichts zu tun hat."
    }
  },

  {
    question: "Welche Vorrang-Regel gilt bei Methoden-Overloads durch Interface Merging?",
    options: [
      "Die fruehere Deklaration hat immer Vorrang",
      "Die spaetere Deklaration hat Vorrang (Overloads werden vorangestellt)",
      "TypeScript waehlt den spezifischsten Overload automatisch",
      "Die Reihenfolge ist undefiniert und kann variieren",
    ],
    correct: 1,
    explanation:
      "Bei Interface Merging werden Methoden-Overloads der spaeteren Deklaration VOR " +
      "die der frueheren gesetzt. Das ist sinnvoll: Erweiterungen (spaeter) sollen " +
      "Vorrang haben vor Originalen (frueher).",
    elaboratedFeedback: {
      whyCorrect: "TypeScript priorisiert den Erweiterer ueber den Ersteller. Wenn ein Plugin einen Overload hinzufuegt, soll dieser zuerst geprueft werden — nicht vom Original-Overload 'versteckt' werden.",
      commonMistake: "Die umgekehrte Reihenfolge ist kontraintuitiv. Viele erwarten 'first declared, first checked'. TypeScript macht das Gegenteil — aus gutem Grund."
    }
  },

  // --- correct: 2 ---
  {
    question: "Was ist der Unterschied zwischen Module Augmentation und Global Augmentation?",
    options: [
      "Module Augmentation ist fuer npm-Pakete, Global fuer lokale Dateien",
      "Module Augmentation braucht import, Global nicht",
      "Module erweitert ein spezifisches Paket, Global erweitert window/process/globalThis",
      "Es gibt keinen Unterschied — beide machen das gleiche",
    ],
    correct: 2,
    explanation:
      "Module Augmentation (declare module 'x') erweitert ein spezifisches npm-Paket. " +
      "Global Augmentation (declare global {}) erweitert den globalen Scope (window, process).",
    elaboratedFeedback: {
      whyCorrect: "Express-Request → Module Augmentation (gehoert zum Express-Paket). window.analytics → Global Augmentation (gehoert zum globalen Browser-Scope). process.env → Global Augmentation (NodeJS global).",
      commonMistake: "Manche verwenden declare global fuer Express-Erweiterungen. Das funktioniert nicht — Express-Request ist kein globaler Typ, sondern gehoert zum express-Modul."
    }
  },

  {
    question: "Was macht 'declare module \"*.png\" { ... }' in einer .d.ts-Datei?",
    options: [
      "Es konvertiert PNG-Dateien in TypeScript",
      "Es verhindert den Import von PNG-Dateien",
      "Es definiert den Typ fuer alle PNG-Imports (Wildcard Module Declaration)",
      "Es generiert automatisch Typ-Dateien fuer PNG-Assets",
    ],
    correct: 2,
    explanation:
      "Wildcard Module Declarations typisieren Imports die keine TypeScript/JavaScript-Dateien sind. " +
      "*.png, *.svg, *.css — alles was ein Bundler aufloest kann so typisiert werden.",
    elaboratedFeedback: {
      whyCorrect: "declare module '*.png' { const src: string; export default src; } — jetzt liefert import logo from './logo.png' einen string (die URL). Ohne diese Deklaration: Compile-Error 'Cannot find module'.",
      commonMistake: "Manche denken, die .d.ts generiert Code. Nein — sie beschreibt nur was der Bundler (Webpack, Vite) zur Laufzeit liefert. Die Typ-Deklaration muss mit dem Bundler-Output uebereinstimmen."
    }
  },

  {
    question: "Welches TypeScript-Compiler-Flag generiert automatisch .d.ts-Dateien?",
    options: [
      "emitDeclarationOnly",
      "strict",
      "declaration: true",
      "noEmit",
    ],
    correct: 2,
    explanation:
      "'declaration: true' in tsconfig.json weist den Compiler an, .d.ts-Dateien neben " +
      "den .js-Dateien zu generieren. 'declarationDir' steuert den Ablage-Ordner. " +
      "'emitDeclarationOnly' generiert NUR .d.ts (kein JavaScript).",
    elaboratedFeedback: {
      whyCorrect: "declaration: true → tsc erzeugt .d.ts fuer jede .ts-Datei. Die .d.ts enthaelt nur Typ-Informationen (Funktionssignaturen, Interfaces), keine Implementierung.",
      commonMistake: "Manche verwechseln 'declaration' mit 'declarationMap'. declaration generiert .d.ts-Dateien, declarationMap generiert .d.ts.map-Dateien (Source Maps fuer Typ-Dateien — nuetzlich fuer IDE-Navigation)."
    }
  },

  {
    question: "Was ist DefinitelyTyped?",
    options: [
      "Ein TypeScript-Compiler-Plugin",
      "TypeScript's offizielle Testumgebung",
      "Ein Community-Repository mit .d.ts-Dateien fuer tausende JavaScript-Pakete (@types/*)",
      "Ein Linting-Tool fuer TypeScript-Deklarationen",
    ],
    correct: 2,
    explanation:
      "DefinitelyTyped ist ein GitHub-Repository mit ueber 8.000 Typ-Definitionen. " +
      "Wenn du 'npm install @types/express' ausfuehrst, installierst du Typen aus " +
      "diesem Repository.",
    elaboratedFeedback: {
      whyCorrect: "DefinitelyTyped ermoeglichte TypeScript's Adoption: Bestehende JavaScript-Bibliotheken brauchten nicht umgeschrieben zu werden. Die Community schrieb die Typen — getrennt vom Code.",
      commonMistake: "Manche denken, @types-Pakete werden von den Bibliotheks-Autoren gepflegt. Meistens nicht — es sind Community-Beitraege. Deshalb koennen @types-Pakete veraltet oder unvollstaendig sein."
    }
  },

  // --- correct: 3 ---
  {
    question: "Warum funktioniert Interface Merging nur mit 'interface' und nicht mit 'type'?",
    options: [
      "type ist schneller als interface — Merging wuerde Performance kosten",
      "type wurde vor interface eingefuehrt und hat aeltere Regeln",
      "TypeScript-Compiler unterstuetzt type-Merging noch nicht",
      "interface ist 'offen' (erweiterbar), type ist 'geschlossen' (einmalige Zuweisung)",
    ],
    correct: 3,
    explanation:
      "'interface' wurde bewusst als offene Deklaration designed — erweiterbar ueber " +
      "Dateigrenzen hinweg. 'type' ist eine Zuweisung (wie const) — einmal definiert, fertig. " +
      "Das macht type vorhersagbarer, aber interface flexibler.",
    elaboratedFeedback: {
      whyCorrect: "interface User {} kann mehrfach deklariert werden → Merging. type User = {} kann nur einmal deklariert werden → Duplicate Error. Dieses Design-Decision macht interface ideal fuer erweiterbare APIs.",
      commonMistake: "Manche folgern: 'interface ist immer besser als type wegen Merging.' Nein — Merging ist ein Nischen-Feature. Fuer die meisten Faelle sind type und interface austauschbar. Merging ist nur bei Bibliotheks-Erweiterungen relevant."
    }
  },

  {
    question: "Welche Syntax deklariert eine globale Variable in 'declare global'?",
    options: [
      "let DEBUG: boolean",
      "const DEBUG: boolean",
      "export var DEBUG: boolean",
      "var DEBUG: boolean",
    ],
    correct: 3,
    explanation:
      "Globale Variablen muessen mit 'var' deklariert werden. 'let' und 'const' sind " +
      "block-scoped und werden NICHT zum globalen Objekt (window/globalThis) hinzugefuegt. " +
      "'var' in globalem Scope wird zu window.DEBUG.",
    elaboratedFeedback: {
      whyCorrect: "'var' im globalen Scope → Property auf globalThis/window. 'let'/'const' im globalen Scope → block-scoped, NICHT auf globalThis. In 'declare global' beschreibt man was auf dem globalen Objekt existiert → var ist korrekt.",
      commonMistake: "Viele verwenden instinktiv 'const' oder 'let' weil 'var' als veraltet gilt. In 'declare global' ist 'var' aber die einzig korrekte Syntax — es ist hier eine Typ-Deklaration, kein echter var-Statement."
    }
  },

  {
    question: "Welches Namespace-Merging-Pattern erlaubt eine Funktion die gleichzeitig Properties hat?",
    options: [
      "interface + class Merging",
      "type + declare Merging",
      "Generic Function mit Properties",
      "function + namespace Merging (wie jQuery)",
    ],
    correct: 3,
    explanation:
      "function jQuery() {} + namespace jQuery { export const version = '3.7' } " +
      "→ jQuery ist beides: aufrufbare Funktion UND Objekt mit Properties. " +
      "Das ist genau wie das echte jQuery funktioniert.",
    elaboratedFeedback: {
      whyCorrect: "JavaScript erlaubt Funktionen mit Properties (typeof jQuery === 'function' && typeof jQuery.ajax === 'function'). TypeScript bildet das mit function + namespace Merging ab. Ohne dieses Feature waeren jQuery-artige APIs nicht typisierbar.",
      commonMistake: "Manche denken, Namespaces seien veraltet. Fuer Modul-Organisation stimmt das. Aber Namespace-Merging mit Funktionen/Klassen ist weiterhin DER Weg um JavaScript-Patterns wie jQuery oder Mocha zu typisieren."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welches Keyword verwendest du um ein fremdes npm-Paket zu erweitern?",
    expectedAnswer: "declare module",
    acceptableAnswers: ["declare module", "declare module \"...\"", "declare module '...'"],
    explanation:
      "'declare module \"paketname\" { ... }' oeffnet das Modul fuer Erweiterungen. " +
      "Interface Merging innerhalb von declare module fuegt neue Properties hinzu.",
  },

  {
    type: "short-answer",
    question: "Wie machst du eine .d.ts-Datei zu einem Modul (minimale Syntax)?",
    expectedAnswer: "export {}",
    acceptableAnswers: ["export {}", "export{}", "export {};"],
    explanation:
      "'export {}' ist der minimale Weg eine Datei zum Modul zu machen. " +
      "Ohne import/export behandelt TypeScript die Datei als Script (global).",
  },

  {
    type: "short-answer",
    question: "Wie heisst das Community-Repository fuer @types/*-Pakete?",
    expectedAnswer: "DefinitelyTyped",
    acceptableAnswers: ["DefinitelyTyped", "definitelytyped", "Definitely Typed"],
    explanation:
      "DefinitelyTyped auf GitHub ist die groesste Sammlung von TypeScript-Typ-Definitionen. " +
      "Ueber 8.000 Pakete, gepflegt von der Community.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Wie viele Properties hat der Typ 'Config' nach diesem Code?",
    code:
      "interface Config { host: string; }\n" +
      "interface Config { port: number; }\n" +
      "interface Config { ssl: boolean; }",
    expectedAnswer: "3",
    acceptableAnswers: ["3", "drei", "Drei"],
    explanation:
      "Alle drei Interface-Deklarationen werden gemergt: host (string) + port (number) + " +
      "ssl (boolean) = 3 Properties. Interface Merging vereint alle Deklarationen.",
  },

  {
    type: "predict-output",
    question: "Kompiliert dieser Code? Antworte mit 'Ja' oder 'Nein'.",
    code:
      "interface Settings { port: number; }\n" +
      "interface Settings { port: string; }",
    expectedAnswer: "Nein",
    acceptableAnswers: ["Nein", "nein", "No", "no", "Compile-Error", "Fehler"],
    explanation:
      "Compile-Error: 'Subsequent property declarations must have the same type.' " +
      "port ist als number deklariert — die zweite Deklaration versucht string. " +
      "Gleiche Properties muessen den GLEICHEN Typ haben.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum hat TypeScript Declaration Merging als Feature eingefuehrt? " +
      "Was waere ohne Declaration Merging nicht moeglich?",
    modelAnswer:
      "Declaration Merging wurde eingefuehrt weil JavaScript-Bibliotheken Patterns verwenden " +
      "die in einer einzelnen Typ-Deklaration nicht ausdrueckbar sind: Funktionen mit Properties " +
      "(jQuery), Objekte die zur Laufzeit erweitert werden (Express-Middleware), globale " +
      "Variablen die von verschiedenen Skripten hinzugefuegt werden. Ohne Declaration Merging " +
      "muesste man auf 'as any' oder unsichere Casts zurueckgreifen um diese Patterns zu typisieren.",
    keyPoints: [
      "JavaScript-Patterns wie jQuery (Funktion + Objekt) erfordern Merging",
      "Plugin-Systeme (Express-Middleware) erweitern Objekte zur Laufzeit",
      "Drittanbieter-Typen muessen erweiterbar sein ohne Forking",
      "Ohne Merging: 'as any' — Typsicherheit geht verloren",
    ],
  },
];
