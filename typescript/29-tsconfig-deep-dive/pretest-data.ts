/**
 * Lektion 29 — Pre-Test-Fragen: tsconfig Deep Dive
 *
 * 3 Fragen pro Sektion, die VOR dem Lesen gestellt werden.
 * Ziel: Das Gehirn fuer die kommende Erklaerung "primen".
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Sektion 1: tsconfig-Grundstruktur ──────────────────────────────────

  {
    sectionIndex: 1,
    question: "Was passiert mit `include` in einer Kind-tsconfig die `extends` verwendet?",
    options: [
      "Es wird mit dem Eltern-include zusammengefuehrt",
      "Es ueberschreibt das Eltern-include komplett",
      "Es wird ignoriert",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "compilerOptions werden gemerged, aber include/exclude/files werden komplett ueberschrieben.",
  },
  {
    sectionIndex: 1,
    question: "Wofuer braucht man `composite: true` in einer tsconfig?",
    options: [
      "Fuer schnellere Kompilierung",
      "Fuer Project References in Monorepos",
      "Fuer JSX-Support",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "composite: true ist Pflicht fuer jedes Projekt das in references referenziert wird. Es aktiviert inkrementelle Builds.",
  },
  {
    sectionIndex: 1,
    question: "Wenn eine Datei in `files` UND in `exclude` steht — wird sie kompiliert?",
    options: [
      "Nein, exclude hat Prioritaet",
      "Ja, files hat absolute Prioritaet ueber exclude",
      "Fehler — beides gleichzeitig ist ungueltig",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "files hat hoechste Prioritaet. exclude filtert nur include, niemals files.",
  },

  // ─── Sektion 2: Strict-Mode-Familie ─────────────────────────────────────

  {
    sectionIndex: 2,
    question: "Wie viele einzelne Flags aktiviert `strict: true`?",
    options: [
      "3 Flags",
      "11 Flags",
      "Alle Compiler-Flags",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "strict buendelt 11 Flags: strictNullChecks, noImplicitAny, strictFunctionTypes und 8 weitere.",
  },
  {
    sectionIndex: 2,
    question: "Welches Strict-Flag verhindert, dass null/undefined jeden Typ 'infizieren'?",
    options: [
      "noImplicitAny",
      "strictNullChecks",
      "strictFunctionTypes",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "strictNullChecks macht null und undefined zu eigenen Typen statt sie in jedem Typ zu verstecken.",
  },
  {
    sectionIndex: 2,
    question: "Kann man `strict: true` setzen und einzelne Flags deaktivieren?",
    options: [
      "Ja, einzelne Flags koennen ueberschrieben werden",
      "Nein, strict ist alles-oder-nichts",
      "Nur in tsconfig.base.json",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "strict: true aktiviert alle Strict-Flags, aber einzelne koennen danach auf false gesetzt werden.",
  },

  // ─── Sektion 3: Module Resolution ───────────────────────────────────────

  {
    sectionIndex: 3,
    question: "Was ist `moduleResolution` — was steuert dieses Flag?",
    options: [
      "Das Format der Ausgabe (ESM vs CommonJS)",
      "Wie TypeScript Import-Pfade zu Dateien aufloest",
      "Welche Module exportiert werden duerfen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "moduleResolution bestimmt den Algorithmus mit dem TypeScript import-Pfade zu konkreten Dateien aufloest.",
  },
  {
    sectionIndex: 3,
    question: "Warum muss man bei `moduleResolution: 'nodenext'` die .js-Endung in Imports schreiben?",
    options: [
      "Weil TypeScript nur .js lesen kann",
      "Weil Node.js zur Laufzeit nur .js sieht und TypeScript Imports nicht umschreibt",
      "Weil .ts-Imports verboten sind",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "TypeScript schreibt Import-Pfade nicht um. Der Import muss im Output funktionieren — und dort gibt es nur .js.",
  },
  {
    sectionIndex: 3,
    question: "Reicht es, `paths` in der tsconfig zu konfigurieren fuer Pfad-Aliase?",
    options: [
      "Ja, TypeScript und Bundler nutzen dieselbe Konfiguration",
      "Nein, der Bundler braucht seine eigene Alias-Konfiguration",
      "paths existiert nicht in der tsconfig",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "paths loest nur die TypeScript-Seite auf. Der Bundler braucht eigene Konfiguration (Ausnahme: Next.js liest paths direkt).",
  },

  // ─── Sektion 4: Output-Konfiguration ───────────────────────────────────

  {
    sectionIndex: 4,
    question: "Was ist der Unterschied zwischen `target` und `module`?",
    options: [
      "target = Syntax-Level (ES5, ES2022), module = Import/Export-Format (ESM, CJS)",
      "Kein Unterschied — beides steuert die JavaScript-Version",
      "target = Node.js, module = Browser",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "target bestimmt die JavaScript-Syntax-Version. module bestimmt das Modul-Format (import/export vs require/module.exports).",
  },
  {
    sectionIndex: 4,
    question: "Was erzeugt `declaration: true`?",
    options: [
      "Source Maps fuer Debugging",
      ".d.ts Dateien mit Typ-Informationen",
      "Minifizierten JavaScript-Output",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "declaration erzeugt .d.ts Dateien die nur Typ-Informationen enthalten — kein JavaScript. Pflicht fuer Libraries.",
  },
  {
    sectionIndex: 4,
    question: "Wenn du `lib` explizit setzt und `DOM` vergisst — was passiert?",
    options: [
      "TypeScript fuegt DOM automatisch hinzu",
      "TypeScript kennt document, window und fetch nicht mehr",
      "Kein Effekt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "lib ueberschreibt den Default komplett. Ohne DOM kennt TypeScript keine Browser-APIs.",
  },

  // ─── Sektion 5: Fortgeschrittene Flags ──────────────────────────────────

  {
    sectionIndex: 5,
    question: "Was prueft `skipLibCheck: true` NICHT mehr?",
    options: [
      "Deinen eigenen Code",
      ".d.ts Dateien (Typ-Definitionen)",
      "Alle importierten Module",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "skipLibCheck ueberspringt die INTERNE Pruefung von .d.ts Dateien. Dein Code wird weiterhin gegen die .d.ts-Typen geprueft.",
  },
  {
    sectionIndex: 5,
    question: "Warum ist `isolatedModules` fuer esbuild/swc/Vite Pflicht?",
    options: [
      "Performance-Gruende",
      "Diese Tools verarbeiten Dateien einzeln — Features die Cross-File-Kontext brauchen funktionieren nicht",
      "Sicherheitsgruende",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "esbuild/swc kennen nur die aktuelle Datei. const enum, re-export ohne type — das braucht Kontext aus anderen Dateien.",
  },
  {
    sectionIndex: 5,
    question: "Was ist `esModuleInterop` und warum braucht man es?",
    options: [
      "Fuer ES Module in alten Browsern",
      "Fuer Default-Imports von CommonJS-Modulen (z.B. import express from 'express')",
      "Fuer Tree Shaking",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "CommonJS hat kein default-Export. esModuleInterop fuegt Hilfsfunktionen ein die Default-Imports von CommonJS-Modulen ermoeglichen.",
  },

  // ─── Sektion 6: Praxis-Configs ──────────────────────────────────────────

  {
    sectionIndex: 6,
    question: "Warum hat Angular `experimentalDecorators: true` in der tsconfig?",
    options: [
      "Fuer Performance-Optimierungen",
      "Weil Angular Legacy-Decorators nutzt die vor dem TC39-Standard existierten",
      "Fuer Template-Syntax",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Angular nutzt experimentelle Decorators (@Component, @Injectable) seit 2016. Die neuen Standard-Decorators haben andere Semantik.",
  },
  {
    sectionIndex: 6,
    question: "Warum hat eine React/Vite-tsconfig `noEmit: true`?",
    options: [
      "React braucht kein JavaScript",
      "Vite/esbuild uebernimmt die Transpilation — TypeScript prueft nur Typen",
      "Fuer Hot Module Replacement",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "noEmit macht TypeScript zum reinen Type-Checker. Vite nutzt esbuild fuer die schnelle Transpilation.",
  },
  {
    sectionIndex: 6,
    question: "Welches Flag fehlt bei `strict: true` das trotzdem in jede professionelle tsconfig gehoert?",
    options: [
      "skipLibCheck",
      "esModuleInterop",
      "noUncheckedIndexedAccess",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "noUncheckedIndexedAccess ist nicht Teil von strict, gibt aber T | undefined fuer Index-Zugriffe — verhindert Array-Out-of-Bounds.",
  },
];
