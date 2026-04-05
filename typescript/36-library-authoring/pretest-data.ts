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
      "Welche Dateien/Pfade von Konsumenten importiert werden koennen",
      "Welche Dateien TypeScript kompiliert",
      "Welche Dateien in Git getrackt werden",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Das exports-Feld definiert praezise was importierbar ist. Alles was nicht in exports steht, ist nicht importierbar.",
  },
  {
    sectionId: 1,
    question: "Wo sucht TypeScript nach Typ-Definitionen einer Library?",
    options: [
      "Im 'types'-Feld der exports oder im Top-Level 'types'-Feld der package.json",
      "Immer in node_modules/@types",
      "Im 'main'-Feld der package.json",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "TypeScript liest das 'types'-Condition in exports (modern) oder das Top-Level 'types'-Feld (Legacy).",
  },
  {
    sectionId: 1,
    question: "Was ist ein Subpath Export?",
    options: [
      "Ein zusaetzlicher Entrypoint wie '@my-lib/hooks' neben dem Hauptimport '@my-lib'",
      "Ein versteckter Import der nicht in der Dokumentation steht",
      "Ein Import aus einem Unterordner von node_modules",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Subpath Exports definieren zusaetzliche Importpfade: exports './hooks' → import { x } from 'my-lib/hooks'.",
  },

  // ─── Sektion 2: Declaration Files generieren ────────────────────────────

  {
    sectionId: 2,
    question: "Was ist eine .d.ts-Datei?",
    options: [
      "Eine Typ-Deklarationsdatei ohne ausfuehrbaren Code",
      "Eine komprimierte TypeScript-Datei",
      "Eine Debug-Datei",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: ".d.ts-Dateien enthalten nur Typ-Informationen — sie beschreiben die API ohne Implementation.",
  },
  {
    sectionId: 2,
    question: "Was ermoeglicht 'declarationMap: true'?",
    options: [
      "'Go to Definition' springt in den Quellcode statt in die .d.ts",
      "Schnellere Compile-Zeiten",
      "Automatische Typ-Generierung",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Declaration Maps verlinken .d.ts mit .ts-Quellcode — die IDE springt zum Originalcode statt zur Deklaration.",
  },
  {
    sectionId: 2,
    question: "Wann nutzt man 'emitDeclarationOnly: true'?",
    options: [
      "Wenn ein Bundler den JS-Output erzeugt und tsc nur .d.ts generieren soll",
      "Wenn man keine JavaScript-Dateien braucht",
      "Wenn man nur Interfaces hat",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "emitDeclarationOnly ist ideal wenn tsup/esbuild den JS-Output erzeugen und tsc nur fuer .d.ts zustaendig ist.",
  },

  // ─── Sektion 3: Dual Package (CJS + ESM) ───────────────────────────────

  {
    sectionId: 3,
    question: "Warum muessen Libraries oft CJS und ESM gleichzeitig liefern?",
    options: [
      "Weil verschiedene Konsumenten verschiedene Module-Systeme nutzen",
      "Weil TypeScript beide Formate benoetigt",
      "Weil npm beide Formate erfordert",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Aeltere Node.js-Projekte und Jest nutzen CJS, moderne Projekte und Bundler nutzen ESM. Beide bedienen = maximale Kompatibilitaet.",
  },
  {
    sectionId: 3,
    question: "Was bedeutet '\"type\": \"module\"' in der package.json?",
    options: [
      ".js-Dateien werden als ES Modules interpretiert statt als CommonJS",
      "Das Paket hat TypeScript-Typen",
      "Das Paket unterstuetzt nur Browser",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Ohne 'type: module' interpretiert Node.js .js als CommonJS. Mit 'type: module' als ES Modules (import/export).",
  },
  {
    sectionId: 3,
    question: "Was ist das Dual Package Hazard?",
    options: [
      "CJS und ESM laden verschiedene Instanzen — interner State ist nicht geteilt",
      "Das Paket ist doppelt so gross",
      "TypeScript kann nicht entscheiden welches Format es nutzen soll",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "CJS und ESM haben getrennte Module-Registries. Beide zu laden erzeugt zwei unabhaengige Instanzen — problematisch bei State.",
  },

  // ─── Sektion 4: Generische Library-Patterns ─────────────────────────────

  {
    sectionId: 4,
    question: "Was ist der Vorteil von Overloads in Library-APIs?",
    options: [
      "Verschiedene Parameter-Kombinationen mit verschiedenen Rueckgabetypen",
      "Schnellere Ausfuehrung",
      "Weniger Speicherverbrauch",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Overloads erlauben praezise Typen fuer jede Aufruf-Variante — der Rueckgabetyp haengt von den Parametern ab.",
  },
  {
    sectionId: 4,
    question: "Was ist das 'Schema = Typ'-Pattern (wie bei Zod)?",
    options: [
      "Der TypeScript-Typ wird automatisch aus der Konfiguration abgeleitet",
      "Typen werden in einer separaten Schema-Datei definiert",
      "Schemas ersetzen Interfaces",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Bei Zod definierst du ein Schema (z.object({name: z.string()})) und der TypeScript-Typ wird automatisch daraus abgeleitet — keine manuelle Typ-Definition noetig.",
  },
  {
    sectionId: 4,
    question: "Ist 'as any' in der Implementation einer Library-Funktion akzeptabel?",
    options: [
      "Ja, wenn die oeffentlichen Typen (Overloads, Generics) korrekt sind",
      "Nein, 'as any' ist immer falsch",
      "Nur in Tests",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Die Implementation ist ein internes Detail. Solange die oeffentliche API korrekt getypt ist, ist 'as any' intern akzeptabel.",
  },

  // ─── Sektion 5: Versionierung und Breaking Changes ─────────────────────

  {
    sectionId: 5,
    question: "Ist das Entfernen einer Property aus einem Rueckgabetyp ein Breaking Change?",
    options: [
      "Ja — Konsumenten die die Property nutzen bekommen Compile-Fehler",
      "Nein — Properties koennen jederzeit entfernt werden",
      "Nur bei required Properties",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Jede Property die Konsumenten nutzen KOENNTEN ist Teil der API. Entfernen = Breaking Change = Major-Version.",
  },
  {
    sectionId: 5,
    question: "Ist das Erhoehen der minimalen TypeScript-Version ein Breaking Change?",
    options: [
      "Ja — Konsumenten auf aelterem TypeScript koennen die Library nicht mehr nutzen",
      "Nein — TypeScript-Versionen sind abwaertskompatibel",
      "Nur bei Major-TS-Versionen (z.B. 4 → 5)",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Konsumenten die ihre TS-Version nicht updaten koennen, brechen. Das erfordert eine Major-Version deiner Library.",
  },
  {
    sectionId: 5,
    question: "Wie macht man Typen erweiterungsfreundlich?",
    options: [
      "Options-Objekte statt fester Parameter — neue optionale Properties brechen nichts",
      "Alle Properties als 'any' deklarieren",
      "Keine Interfaces verwenden",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Options-Objekte mit optionalen Properties sind der sicherste Weg — neue optionale Properties sind kein Breaking Change.",
  },

  // ─── Sektion 6: Praxis — Utility-Library ────────────────────────────────

  {
    sectionId: 6,
    question: "Was macht 'npm pack'?",
    options: [
      "Erzeugt eine .tgz-Datei die dem npm-Paket entspricht — zum lokalen Testen",
      "Komprimiert den Quellcode",
      "Installiert alle Dependencies",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "npm pack erzeugt EXAKT das was npm publish hochladen wuerde. Du kannst es lokal installieren und testen.",
  },
  {
    sectionId: 6,
    question: "Warum sollten Libraries NICHT minifiziert werden?",
    options: [
      "Minification ist Sache des Konsumenten-Bundlers — Library-Code soll debuggbar bleiben",
      "Minifizierung macht den Code langsamer",
      "npm lehnt minifizierte Pakete ab",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Der Konsumenten-Bundler minifiziert alles. Vorab-Minification verhindert Tree-Shaking und macht Debugging unmoeglich.",
  },
  {
    sectionId: 6,
    question: "Was ist die empfohlene Startversion fuer eine neue Library?",
    options: [
      "0.1.0 — signalisiert 'API noch nicht stabil'",
      "1.0.0 — signalisiert 'fertig'",
      "0.0.1 — die kleinste moegliche Version",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "0.1.0 signalisiert: 'Entwicklungsphase, API kann sich aendern.' Erst 1.0.0 verspricht Stabilitaet.",
  },
];
