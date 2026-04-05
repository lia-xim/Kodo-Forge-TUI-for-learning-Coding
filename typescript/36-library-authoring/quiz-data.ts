// quiz-data.ts — L36: Library Authoring
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "36";
export const lessonTitle = "Library Authoring";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: exports-Feld — correct: 0 ---
  {
    question: "Warum muss 'types' im exports-Feld VOR 'import' und 'require' stehen?",
    options: [
      "TypeScript liest das exports-Objekt von oben nach unten — die erste passende Bedingung gewinnt",
      "Node.js sortiert die Felder alphabetisch",
      "'types' ueberschreibt die anderen Felder",
      "Es ist eine Konvention, aber technisch egal",
    ],
    correct: 0,
    explanation:
      "Das exports-Feld wird von oben nach unten ausgewertet. Wenn 'import' vor 'types' steht, " +
      "findet TypeScript keine Typ-Informationen weil es bei 'import' stoppt. 'types' muss " +
      "die erste Bedingung sein.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript und Node.js verwenden einen 'first match wins'-Algorithmus. 'types' ist eine TypeScript-spezifische Bedingung — Node.js ignoriert sie. Wenn 'types' nicht zuerst kommt, sieht TypeScript nur den .js-Pfad.",
      commonMistake: "Manche denken, die Reihenfolge sei wie bei JSON-Objekten (egal). Bei 'exports' ist die Reihenfolge der Conditions entscheidend — es ist ein geordnetes Matching."
    }
  },

  // --- Frage 2: declaration — correct: 0 ---
  {
    question: "Was erzeugt 'declaration: true' in der tsconfig?",
    options: [
      ".d.ts-Dateien die die oeffentliche API als Typ-Deklarationen beschreiben",
      "Automatische JSDoc-Kommentare im JavaScript-Output",
      "Eine package.json mit korrektem types-Feld",
      "Typ-sichere Test-Dateien fuer die Library",
    ],
    correct: 0,
    explanation:
      "declaration: true erzeugt .d.ts-Dateien neben den .js-Dateien. Diese enthalten " +
      "nur die Typ-Informationen (Interfaces, Funktionssignaturen) — keinen ausfuehrbaren Code.",
    elaboratedFeedback: {
      whyCorrect: ".d.ts-Dateien sind wie Header-Dateien in C/C++: Sie beschreiben die Schnittstelle, nicht die Implementation. Konsumenten brauchen sie fuer Autocomplete, Type-Checking und Fehlererkennung.",
      commonMistake: ".d.ts sind NICHT die kompletten TypeScript-Dateien. Sie enthalten keine Implementierungen, keine privaten Funktionen, keine internen Typen."
    }
  },

  // --- Frage 3: Dual Package Hazard — correct: 0 ---
  {
    question: "Was ist das 'Dual Package Hazard'?",
    options: [
      "CJS und ESM laden verschiedene Instanzen desselben Moduls — interner State ist nicht geteilt",
      "Das Paket ist doppelt so gross weil es zwei Formate enthaelt",
      "TypeScript kann nicht entscheiden welches Format es nutzen soll",
      "npm installiert zwei Kopien des Pakets",
    ],
    correct: 0,
    explanation:
      "Wenn ein Konsument sowohl CJS als auch ESM des gleichen Pakets laedt, entstehen " +
      "zwei separate Modul-Instanzen. Interner State (Caches, Singletons) ist nicht " +
      "geteilt — das fuehrt zu subtilen Bugs.",
    elaboratedFeedback: {
      whyCorrect: "Node.js behandelt CJS und ESM als verschiedene Module. Ein import und ein require des gleichen Pakets erzeugen zwei unabhaengige Instanzen. Stateless Libraries (reine Funktionen) sind davon nicht betroffen.",
      commonMistake: "Viele denken, Node.js wuerde erkennen dass es dasselbe Paket ist. Nein — CJS und ESM haben verschiedene Module-Registries. Es sind wirklich zwei unabhaengige Instanzen."
    }
  },

  // --- Frage 4: Breaking Change — correct: 0 ---
  {
    question: "Ist das Entfernen einer optionalen Property aus einem Rueckgabetyp ein Breaking Change?",
    options: [
      "Ja — Konsumenten die auf die Property zugreifen bekommen einen Compile-Error",
      "Nein — optionale Properties koennen jederzeit entfernt werden",
      "Nur wenn die Property required war",
      "Nur bei Libraries mit strict: true",
    ],
    correct: 0,
    explanation:
      "Auch optionale Properties koennen von Konsumenten genutzt werden. Wenn sie entfernt werden, " +
      "bricht jeder Code der auf die Property zugreift (user.email? → Property does not exist). " +
      "Das erfordert eine Major-Version.",
    elaboratedFeedback: {
      whyCorrect: "Optionale Properties sind Teil der API: if (result.email) { send(result.email); }. Wenn email entfernt wird, bricht dieser Code — auch wenn email optional war.",
      commonMistake: "Viele denken, 'optional' heisst 'unwichtig'. Nein — optional heisst nur, dass es fehlen DARF. Es kann trotzdem intensiv genutzt werden."
    }
  },

  // --- Frage 5: declarationMap — correct: 1 ---
  {
    question: "Was ermoeglicht 'declarationMap: true' fuer Konsumenten deiner Library?",
    options: [
      "Schnellere Compile-Zeiten bei Konsumenten",
      "'Go to Definition' springt in den TypeScript-Quellcode statt in die .d.ts-Datei",
      "Automatisches Refactoring ueber Paketgrenzen hinweg",
      "Type-Checking der Library-Interna durch Konsumenten",
    ],
    correct: 1,
    explanation:
      "Declaration Maps (.d.ts.map) verlinken .d.ts-Dateien mit den .ts-Quelldateien. " +
      "Wenn ein Konsument 'Go to Definition' drueckt, springt die IDE in den Quellcode " +
      "statt in die generierte .d.ts — viel hilfreicher.",
    elaboratedFeedback: {
      whyCorrect: "Ohne Declaration Map: 'Go to Definition' auf createUser() → dist/index.d.ts → 'export declare function createUser(...)'. Mit Declaration Map: → src/index.ts → voller Quellcode mit Kommentaren.",
      commonMistake: "Declaration Maps erfordern dass der Quellcode mitgeliefert wird (files: ['src']). Ohne Quellcode nuetzt die Map nichts — sie zeigt ins Leere."
    }
  },

  // --- Frage 6: emitDeclarationOnly — correct: 1 ---
  {
    question: "Wann nutzt du 'emitDeclarationOnly: true'?",
    options: [
      "Wenn du keine .d.ts-Dateien brauchst",
      "Wenn ein Bundler (tsup, esbuild) den JavaScript-Output erzeugt und tsc nur fuer .d.ts zustaendig ist",
      "Wenn du nur JavaScript ohne TypeScript-Typen liefern willst",
      "Wenn das Projekt keine Generics verwendet",
    ],
    correct: 1,
    explanation:
      "Wenn tsup/esbuild den .js-Output erzeugen (schneller als tsc), brauchst du tsc nur " +
      "fuer die .d.ts-Generierung. emitDeclarationOnly sagt tsc: 'Erzeuge NUR .d.ts, kein .js.'",
    elaboratedFeedback: {
      whyCorrect: "Der typische Library-Build-Workflow: 1) tsup/esbuild erzeugt .js (schnell). 2) tsc --emitDeclarationOnly erzeugt .d.ts (korrekt). Best of both worlds.",
      commonMistake: "emitDeclarationOnly allein erzeugt keinen JavaScript-Output. Ohne separaten Bundler hast du nur .d.ts-Dateien — die kann niemand ausfuehren."
    }
  },

  // --- Frage 7: Overloads — correct: 1 ---
  {
    question: "Warum sieht der Konsument die Implementation-Signatur einer Overloaded-Funktion NICHT?",
    options: [
      "Die Implementation wird automatisch entfernt",
      "Die Implementation ist zu breit — nur die praezisen Overload-Signaturen sind nuetzlich fuer Konsumenten",
      "TypeScript verbietet den Zugriff auf Implementations",
      "Overloads ersetzen die Implementation zur Compile-Zeit",
    ],
    correct: 1,
    explanation:
      "Die Implementation-Signatur muss alle Overloads abdecken und ist deshalb zu breit " +
      "(z.B. string | Config statt praezise). Konsumenten sollen nur die praezisen " +
      "Overloads sehen — das gibt besseres Autocomplete und klarere Fehlermeldungen.",
    elaboratedFeedback: {
      whyCorrect: "Overloads: createClient(url: string) und createClient(config: Config). Implementation: createClient(input: string | Config). Die Implementation ist ein Union — weniger informativ als die einzelnen Overloads.",
      commonMistake: "Manche denken, Overloads seien nur 'Zucker'. Nein — sie sind die einzige Moeglichkeit, VERSCHIEDENE Rueckgabetypen fuer verschiedene Parameter-Kombinationen zu definieren."
    }
  },

  // --- Frage 8: Version 0.x — correct: 1 ---
  {
    question: "Was signalisiert die Version 0.x.y bei einem npm-Paket?",
    options: [
      "Das Paket ist deprecated und sollte nicht mehr verwendet werden",
      "Das Paket ist in der Entwicklungsphase — die API kann sich jederzeit aendern",
      "Das Paket hat keine Tests",
      "Das Paket unterstuetzt nur Node.js (nicht den Browser)",
    ],
    correct: 1,
    explanation:
      "In Semantic Versioning bedeutet 0.x: 'Die oeffentliche API ist nicht stabil.' " +
      "Jede 0.x-Version kann Breaking Changes enthalten. Erst mit 1.0.0 versprichst du " +
      "API-Stabilitaet.",
    elaboratedFeedback: {
      whyCorrect: "SemVer-Spezifikation: '0.y.z is for initial development. Anything MAY change at any time. The public API SHOULD NOT be considered stable.' Viele erfolgreiche Pakete bleiben monatelang auf 0.x.",
      commonMistake: "0.x bedeutet nicht 'schlecht' oder 'unfertig'. Es bedeutet: 'Ich lerne noch was die beste API ist.' Zod war monatelang 0.x bevor es stabil wurde."
    }
  },

  // --- Frage 9: Conditional Return — correct: 2 ---
  {
    question: "Was ist der Vorteil von Conditional Return Types in Library-APIs?",
    options: [
      "Sie machen die Library schneller zur Laufzeit",
      "Sie reduzieren die Bundle-Groesse",
      "Der Rueckgabetyp passt sich automatisch an den Input an — praeziser als ein fester Typ",
      "Sie ersetzen Generics komplett",
    ],
    correct: 2,
    explanation:
      "Conditional Return Types wie 'T extends string ? number : boolean' berechnen den " +
      "praezisesten Rueckgabetyp basierend auf dem Input. Der Konsument bekommt exakte Typen " +
      "ohne manuell annotieren zu muessen.",
    elaboratedFeedback: {
      whyCorrect: "parse('42') → number, parse('true') → boolean, parse('hello') → string. Ohne Conditional Types waere der Rueckgabetyp 'string | number | boolean' — viel weniger nuetzlich.",
      commonMistake: "Conditional Return Types sind NICHT fuer jeden Fall noetig. Einfache Generics (Array<T> → T) reichen oft. Conditional Types lohnen sich wenn der Output-Typ vom Input-Wert abhaengt."
    }
  },

  // --- Frage 10: files-Feld — correct: 2 ---
  {
    question: "Was kontrolliert das 'files'-Feld in der package.json?",
    options: [
      "Welche Dateien TypeScript kompiliert",
      "Welche Dateien in .gitignore stehen",
      "Welche Dateien in das npm-Paket aufgenommen werden (bei npm publish)",
      "Welche Dateien Tests enthalten",
    ],
    correct: 2,
    explanation:
      "Das files-Feld ist eine Whitelist: Nur die aufgelisteten Dateien/Ordner landen im " +
      "npm-Paket. Alles andere wird nicht veroeffentlicht. Typisch: ['dist', 'src'] — " +
      "Build-Output und Quellcode (fuer Declaration Maps).",
    elaboratedFeedback: {
      whyCorrect: "Ohne files-Feld wird (fast) alles veroeffentlicht — auch Tests, Konfiguration, etc. Mit files: ['dist'] wird nur der Build-Output veroeffentlicht. Fuege 'src' hinzu wenn du Declaration Maps nutzt.",
      commonMistake: "package.json und README.md werden IMMER inkludiert, auch wenn sie nicht in 'files' stehen. node_modules wird IMMER ausgeschlossen."
    }
  },

  // --- Frage 11: peerDependencies — correct: 2 ---
  {
    question: "Warum sollten React und Angular als peerDependencies deklariert werden?",
    options: [
      "Weil sie zu gross sind um gebundelt zu werden",
      "Weil npm sie automatisch installiert",
      "Damit das Projekt des Konsumenten nur EINE Instanz des Frameworks hat — nicht zwei",
      "Weil Frameworks keine normalen Dependencies sein koennen",
    ],
    correct: 2,
    explanation:
      "Wenn React als normale Dependency im Bundle waere, haette der Konsument zwei React-Instanzen " +
      "(seine und deine). Das fuehrt zu Fehlern ('Invalid Hook Call'). peerDependencies sagen: " +
      "'Der Konsument muss React selbst installiert haben.'",
    elaboratedFeedback: {
      whyCorrect: "React Hooks brechen wenn zwei React-Instanzen existieren. Angular DI bricht wenn zwei Angular-Instanzen existieren. peerDependencies garantieren eine einzige Instanz im gesamten Projekt.",
      commonMistake: "Viele vergessen peerDependencies und packen React/Angular als normale Dependency rein. Das fuehrt zu subtilen Runtime-Fehlern die schwer zu debuggen sind."
    }
  },

  // --- Frage 12: npm pack — correct: 2 ---
  {
    question: "Warum solltest du 'npm pack' vor 'npm publish' ausfuehren?",
    options: [
      "npm pack optimiert die Paketgroesse",
      "npm pack ist Pflicht vor npm publish",
      "npm pack erzeugt lokal eine .tgz-Datei die GENAU dem npm-Paket entspricht — zum Testen",
      "npm pack installiert fehlende Dependencies",
    ],
    correct: 2,
    explanation:
      "npm pack erzeugt eine .tgz-Datei die du lokal in einem Test-Projekt installieren kannst. " +
      "So testest du die EXAKTE Paket-Struktur bevor du veroeffentlichst — exports, types, " +
      "files alles wird geprueft.",
    elaboratedFeedback: {
      whyCorrect: "Lokale Imports aus dem Quellcode testen NICHT die Paket-Struktur. npm pack + lokale Installation testet: Sind alle Dateien im Paket? Funktionieren die exports? Stimmen die types?",
      commonMistake: "Viele publishen direkt und testen dann mit 'npm install paket@latest'. Wenn etwas fehlt, muessen sie eine neue Version veroeffentlichen. npm pack verhindert das."
    }
  },

  // --- Frage 13: Minification — correct: 3 ---
  {
    question: "Warum sollten Libraries NICHT minifiziert veroeffentlicht werden?",
    options: [
      "Minifizierter Code ist langsamer",
      "TypeScript kann minifizierten Code nicht lesen",
      "npm lehnt minifizierte Pakete ab",
      "Minification ist Sache des Konsumenten-Bundlers — Library-Code soll lesbar und debuggbar bleiben",
    ],
    correct: 3,
    explanation:
      "Der Konsument verwendet einen Bundler (webpack, Vite, esbuild) der ALLE Dependencies " +
      "minifiziert. Wenn die Library schon minifiziert ist: Fehler in Stack-Traces sind " +
      "unlesbar, Source Maps brechen, und Konsumenten koennen den Code nicht inspizieren.",
    elaboratedFeedback: {
      whyCorrect: "Libraries werden von Bundlern konsumiert. Der Bundler minifiziert, tree-shaked, und bundled alles zusammen. Vorab-Minification verhindert effektives Tree-Shaking und macht Debugging unmoeglich.",
      commonMistake: "Manche minifizieren weil sie denken, es mache das Paket kleiner. npm-Pakete werden NICHT im Browser geladen — die Paketgroesse auf npm ist zweitrangig. Nur die Bundle-Groesse zaehlt."
    }
  },

  // --- Frage 14: SemVer Typen — correct: 3 ---
  {
    question: "Welche Aenderung erfordert eine Major-Version bei einer TypeScript-Library?",
    options: [
      "Eine neue optionale Property zum Rueckgabetyp hinzufuegen",
      "Einen neuen Export hinzufuegen",
      "Einen JSDoc-Kommentar aendern",
      "Die minimale TypeScript-Version von 4.5 auf 5.0 erhoehen",
    ],
    correct: 3,
    explanation:
      "Konsumenten auf TypeScript 4.5 koennen die Library nach dem Update nicht mehr nutzen. " +
      "Das ist ein Breaking Change — egal ob sich am Code nichts aendert. Die TS-Version " +
      "ist Teil der Kompatibilitaetsgarantie.",
    elaboratedFeedback: {
      whyCorrect: "Neue optionale Properties und neue Exports sind Minor-Changes (nichts bricht). TS-Version erhoehen bricht ALLE Konsumenten auf der alten Version — das ist definitiv Major.",
      commonMistake: "Viele erhoehen die TS-Mindestversion in einem Minor-Release. Das bricht Konsumenten die nicht sofort updaten koennen — besonders in Unternehmen mit Lockdown-Policies."
    }
  },

  // --- Frage 15: type: module — correct: 3 ---
  {
    question: "Was bewirkt '\"type\": \"module\"' in der package.json?",
    options: [
      "Es aktiviert TypeScript-Typen fuer das Paket",
      "Es deaktiviert CommonJS komplett",
      "Es setzt den Strict Mode fuer alle Dateien",
      ".js-Dateien werden als ES Modules interpretiert statt als CommonJS",
    ],
    correct: 3,
    explanation:
      "Ohne 'type: module' interpretiert Node.js .js-Dateien als CommonJS. " +
      "Mit 'type: module' werden sie als ES Modules interpretiert (import/export). " +
      ".cjs-Dateien bleiben immer CommonJS, .mjs bleiben immer ESM — unabhaengig von 'type'.",
    elaboratedFeedback: {
      whyCorrect: "Die Dateiendung allein reicht nicht: .js kann CJS oder ESM sein. 'type: module' klaert die Ambiguitaet. .cjs und .mjs sind IMMER eindeutig — sie ignorieren 'type'.",
      commonMistake: "Viele vergessen 'type: module' und wundern sich warum 'import' in .js-Dateien nicht funktioniert. Ohne 'type: module' erwartet Node.js require()."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welches Build-Tool wird fuer Dual-Package-Libraries (CJS + ESM + .d.ts) empfohlen?",
    expectedAnswer: "tsup",
    acceptableAnswers: ["tsup", "TSUP"],
    explanation:
      "tsup erzeugt CJS (.cjs), ESM (.js), und .d.ts in einem einzigen Build-Schritt. " +
      "Es basiert auf esbuild fuer schnelles Transpilieren und nutzt tsc fuer die " +
      "Declaration-Generierung.",
  },

  {
    type: "short-answer",
    question: "Welche Dateiendung hat eine TypeScript-Deklarationsdatei fuer CommonJS?",
    expectedAnswer: ".d.cts",
    acceptableAnswers: [".d.cts", "d.cts"],
    explanation:
      ".d.cts ist das Deklarations-Aequivalent zu .cjs. TypeScript 4.7+ unterscheidet " +
      "zwischen .d.ts (fuer .js/ESM) und .d.cts (fuer .cjs/CommonJS) um verschiedene " +
      "Export-Signaturen zu unterstuetzen.",
  },

  {
    type: "short-answer",
    question: "Welches npm-Kommando erzeugt lokal eine .tgz-Datei zum Testen des Pakets?",
    expectedAnswer: "npm pack",
    acceptableAnswers: ["npm pack", "pack"],
    explanation:
      "npm pack erzeugt eine .tgz-Datei die EXAKT dem entspricht was npm publish " +
      "hochladen wuerde. Du kannst sie in einem Test-Projekt installieren: " +
      "npm install ./paket-1.0.0.tgz",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Wird dieser Import funktionieren wenn 'exports' NUR '.' definiert? Antworte 'Ja' oder 'Nein'.",
    code:
      '// package.json: { "exports": { ".": { "import": "./dist/index.js" } } }\n' +
      '// Konsumenten-Code:\n' +
      'import { helper } from "my-lib/utils";',
    expectedAnswer: "Nein",
    acceptableAnswers: ["Nein", "nein", "No", "no"],
    explanation:
      "Das exports-Feld definiert EXAKT was importierbar ist. Nur '.' ist definiert — " +
      "'./utils' existiert nicht in exports. Der Import schlaegt fehl mit: " +
      "'Package subpath ./utils is not defined by exports'.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat 'result' bei diesem Overload-Aufruf?",
    code:
      "declare function parse(input: string): string;\n" +
      "declare function parse(input: number): boolean;\n" +
      "const result = parse(42);",
    expectedAnswer: "boolean",
    acceptableAnswers: ["boolean", "Boolean"],
    explanation:
      "TypeScript matched den Aufruf parse(42) gegen die Overloads. 42 ist number → " +
      "die zweite Signatur passt: parse(input: number): boolean. " +
      "result hat Typ boolean.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist das Aendern eines Rueckgabetyps von 'User' zu 'User | null' ein " +
      "Breaking Change, obwohl es 'nur' einen moeglichen Wert hinzufuegt?",
    modelAnswer:
      "Konsumenten-Code der den Rueckgabewert direkt nutzt (user.name, user.email) " +
      "kompiliert mit strictNullChecks nicht mehr, weil null keine Properties hat. " +
      "Der Konsument muss jetzt eine Null-Pruefung hinzufuegen — das ist eine " +
      "Code-Aenderung die erzwungen wird. Hinzufuegen von null zum Rueckgabetyp " +
      "VERENGT die Garantie (vorher: 'immer User', jetzt: 'vielleicht User, vielleicht null'). " +
      "Weniger Garantie = Breaking Change.",
    keyPoints: [
      "user.name → FEHLER: 'Object is possibly null'",
      "Konsumenten muessen Code aendern (if (user) {...})",
      "Weniger Garantie im Rueckgabetyp = Breaking Change",
      "Gilt nur mit strictNullChecks — aber die meisten Projekte nutzen es",
    ],
  },
];
