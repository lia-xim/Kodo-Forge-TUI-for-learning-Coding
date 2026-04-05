// pretest-data.ts — L36: Library Authoring
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Package.json exports und types ──────────────────────────

  {
    sectionId: 1,
    question: "Was definiert das 'exports'-Feld in der package.json?",
    options: [
      "Welche Pfade von Konsumenten importiert werden koennen",
      "Welche Dateien TypeScript kompiliert",
      "Welche Dependencies installiert werden",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Das exports-Feld definiert praezise welche Entrypoints importierbar sind — alles andere ist privat.",
  },
  {
    sectionId: 1,
    question: "Wo sucht TypeScript nach Typ-Informationen fuer eine importierte Library?",
    options: [
      "Im 'types'-Condition des exports-Feldes oder im Top-Level 'types'-Feld",
      "Immer in node_modules/@types",
      "In der tsconfig des Konsumenten",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "TypeScript prueft zuerst exports.'.'.types, dann das Top-Level types-Feld, dann @types.",
  },
  {
    sectionId: 1,
    question: "Was bedeutet 'type: module' in der package.json?",
    options: [
      ".js-Dateien werden als ES Modules interpretiert",
      "TypeScript-Typen werden aktiviert",
      "Das Paket ist nur fuer Node.js",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Ohne 'type: module' sind .js-Dateien CommonJS. Mit 'type: module' werden sie als ES Modules behandelt.",
  },

  // ─── Sektion 2: Declaration Files generieren ────────────────────────────

  {
    sectionId: 2,
    question: "Was erzeugt 'declaration: true' in der tsconfig?",
    options: [
      ".d.ts-Dateien mit Typ-Deklarationen",
      "JavaScript-Dateien mit eingebetteten Typen",
      "Eine separate Typ-Datenbank",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "declaration: true erzeugt .d.ts-Dateien — Typ-Deklarationen ohne Implementation.",
  },
  {
    sectionId: 2,
    question: "Was ermoeglicht 'declarationMap: true'?",
    options: [
      "'Go to Definition' springt in den Quellcode statt in die .d.ts",
      "Schnellere Kompilierung",
      "Automatisches Refactoring",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Declaration Maps verlinken .d.ts mit .ts — 'Go to Definition' zeigt den Quellcode statt die Deklaration.",
  },
  {
    sectionId: 2,
    question: "Wann nutzt du 'emitDeclarationOnly: true'?",
    options: [
      "Wenn ein Bundler den JavaScript-Output erzeugt und tsc nur fuer .d.ts zustaendig ist",
      "Wenn du keine JavaScript-Dateien brauchst",
      "Wenn du nur Tests ausfuehren willst",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "emitDeclarationOnly erzeugt nur .d.ts — der Bundler (tsup, esbuild) erzeugt den JS-Output schneller.",
  },

  // ─── Sektion 3: Dual Package (CJS + ESM) ───────────────────────────────

  {
    sectionId: 3,
    question: "Warum muessen manche Libraries sowohl CJS als auch ESM liefern?",
    options: [
      "Weil Konsumenten beide Formate verwenden (aeltere Projekte CJS, neuere ESM)",
      "Weil npm nur CJS unterstuetzt",
      "Weil TypeScript nur ESM versteht",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Das JS-Oekosystem ist im Uebergang von CJS zu ESM. Dual Packages bedienen beide Welten.",
  },
  {
    sectionId: 3,
    question: "Was ist das Dual Package Hazard?",
    options: [
      "CJS und ESM laden verschiedene Modul-Instanzen — interner State ist nicht geteilt",
      "Das Paket ist doppelt so gross",
      "Node.js kann nicht entscheiden welches Format es laden soll",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Wenn beide Formate geladen werden, entstehen zwei unabhaengige Instanzen — Caches und Singletons sind nicht geteilt.",
  },
  {
    sectionId: 3,
    question: "Welche Dateiendung hat eine CommonJS-JavaScript-Datei?",
    options: [
      ".cjs",
      ".common.js",
      ".node.js",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: ".cjs ist immer CommonJS, .mjs ist immer ES Module — unabhaengig vom 'type'-Feld in package.json.",
  },

  // ─── Sektion 4: Generische Library-Patterns ─────────────────────────────

  {
    sectionId: 4,
    question: "Was ist der Vorteil von Overloads in Library-APIs?",
    options: [
      "Verschiedene Signaturen fuer verschiedene Aufruf-Varianten mit praezisen Typen",
      "Schnellere Ausfuehrung zur Laufzeit",
      "Weniger Code in der Implementation",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Overloads erlauben verschiedene Parameter-/Rueckgabetyp-Kombinationen — die IDE zeigt die passende Signatur.",
  },
  {
    sectionId: 4,
    question: "Was ist das 'Schema = Typ'-Pattern (bekannt von Zod)?",
    options: [
      "TypeScript-Typen werden automatisch aus einer Runtime-Schema-Definition abgeleitet",
      "JSON-Schemas ersetzen TypeScript-Typen",
      "Typen werden zur Laufzeit geprueft",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Zod's Pattern: Das Schema definiert sowohl die Runtime-Validierung als auch den TypeScript-Typ — eine einzige Quelle der Wahrheit.",
  },
  {
    sectionId: 4,
    question: "Ist 'as any' in der Implementation einer Library-Funktion akzeptabel?",
    options: [
      "Ja, solange die oeffentlichen Typen (Overloads, Generics) korrekt sind",
      "Nein, 'as any' ist immer falsch",
      "Nur in Test-Dateien",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Die Implementation ist ein Implementationsdetail — der Konsument sieht sie nicht. 'as any' intern ist OK wenn die API-Typen stimmen.",
  },

  // ─── Sektion 5: Versionierung und Breaking Changes ─────────────────────

  {
    sectionId: 5,
    question: "Ist das Entfernen einer Property aus einem Rueckgabetyp ein Breaking Change?",
    options: [
      "Ja — Konsumenten die auf die Property zugreifen bekommen einen Compile-Error",
      "Nein — Typen sind nicht Teil der API",
      "Nur bei Libraries mit strict: true",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Jede Typ-Aenderung die Konsumenten-Code bricht ist ein Breaking Change — erfordert eine Major-Version.",
  },
  {
    sectionId: 5,
    question: "Was ist ein non-breaking Typ-Update?",
    options: [
      "Eine neue optionale Property zum Rueckgabetyp hinzufuegen",
      "Eine required Property entfernen",
      "Den Rueckgabetyp von T zu T | null aendern",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Neue optionale Properties brechen nichts — bestehender Code ignoriert sie einfach. Das ist ein Minor-Update.",
  },
  {
    sectionId: 5,
    question: "Ist das Erhoehen der minimalen TypeScript-Version ein Breaking Change?",
    options: [
      "Ja — Konsumenten auf der alten TS-Version koennen die Library nicht mehr nutzen",
      "Nein — TypeScript-Versionen sind abwaertskompatibel",
      "Nur bei Major-TypeScript-Updates",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Konsumenten die nicht updaten koennen, brechen. TS-Version erhoehen = Major-Version der Library.",
  },

  // ─── Sektion 6: Praxis — Utility-Library ───────────────────────────────

  {
    sectionId: 6,
    question: "Was macht 'npm pack' im Kontext von Library-Development?",
    options: [
      "Erzeugt eine .tgz-Datei die dem npm-Paket entspricht — zum lokalen Testen",
      "Optimiert die Paketgroesse",
      "Veroeffentlicht das Paket auf npm",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "npm pack erzeugt lokal genau das was npm publish hochladen wuerde — ideal zum Testen vor dem Publish.",
  },
  {
    sectionId: 6,
    question: "Sollten Libraries minifiziert veroeffentlicht werden?",
    options: [
      "Nein — Minification ist Sache des Konsumenten-Bundlers",
      "Ja — fuer kleinere Pakete",
      "Nur die ESM-Version",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Der Bundler des Konsumenten minifiziert alles zusammen. Vorab-Minification verhindert Debugging und Tree-Shaking.",
  },
  {
    sectionId: 6,
    question: "Was bewirkt 'prepublishOnly' im scripts-Feld der package.json?",
    options: [
      "Es laeuft automatisch vor jedem npm publish — ideal fuer Build + Tests",
      "Es verhindert versehentliches Publishen",
      "Es erstellt automatisch einen Git-Tag",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "prepublishOnly wird automatisch vor npm publish ausgefuehrt. Typisch: 'npm run build && npm test' — stellt sicher dass nur getesteter Code veroeffentlicht wird.",
  },
];
