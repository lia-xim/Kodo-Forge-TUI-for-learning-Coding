// pretest-data.ts — L34: Performance & Compiler
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Wie der Compiler arbeitet ────────────────────────────────

  {
    sectionId: 1,
    question: "Welche Phasen durchlaeuft der TypeScript-Compiler?",
    options: [
      "Scanner, Parser, Binder, Checker, Emitter",
      "Lexer, Optimizer, Transpiler",
      "Parser, Bundler, Minifier",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Der Compiler hat 5 Phasen: Scanner (Tokenisierung), Parser (AST), Binder (Symbole), Checker (Typen), Emitter (Output).",
  },
  {
    sectionId: 1,
    question: "Was ist ein AST (Abstract Syntax Tree)?",
    options: [
      "Eine Optimierung fuer schnellere Kompilierung",
      "Eine Baumstruktur die die Programmstruktur repraesentiert",
      "Ein alternatives Dateiformat zu JavaScript",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Der AST repraesentiert den Quellcode als hierarchischen Baum — die zentrale Datenstruktur des Compilers.",
  },
  {
    sectionId: 1,
    question: "Welche Compiler-Phase verbraucht die meiste Zeit?",
    options: [
      "Der Parser",
      "Der Emitter",
      "Der Type Checker",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Der Type Checker verbraucht 60-80% der Compile-Zeit weil er alle Typen berechnen und pruefen muss.",
  },

  // ─── Sektion 2: Type Instantiation und Depth Limits ─────────────────────

  {
    sectionId: 2,
    question: "Was passiert bei 'Type instantiation is excessively deep'?",
    options: [
      "Der Compiler hat das Rekursions-Limit von 50 erreicht",
      "Es gibt zu viele Dateien im Projekt",
      "Der Speicher ist voll",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "TS2589 tritt auf wenn ein rekursiver Typ die maximale Tiefe von 50 ueberschreitet.",
  },
  {
    sectionId: 2,
    question: "Was ist eine Type Instantiation?",
    options: [
      "Das Erstellen einer Klasseninstanz",
      "Das Einsetzen konkreter Typen in einen generischen Typ",
      "Das Deklarieren einer Typvariable",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Wenn Array<string> aus Array<T> entsteht, ist das eine Instantiierung — T wird durch string ersetzt.",
  },
  {
    sectionId: 2,
    question: "Warum gibt es ein Depth Limit fuer rekursive Typen?",
    options: [
      "Um den Compiler vor Endlosschleifen zu schuetzen",
      "Um Speicher zu sparen",
      "Weil JavaScript keine Rekursion unterstuetzt",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Ohne Limit koennten rekursive Typen den Compiler in eine Endlosschleife treiben.",
  },

  // ─── Sektion 3: Performante Typen schreiben ─────────────────────────────

  {
    sectionId: 3,
    question: "Ist 'interface A extends B {}' schneller oder langsamer als 'type A = B & { ... }'?",
    options: [
      "Langsamer — Interfaces haben mehr Overhead",
      "Gleich schnell",
      "Schneller — Interfaces werden gecacht",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Interfaces werden eagerly evaluiert und gecacht. Intersections werden bei jeder Verwendung neu berechnet.",
  },
  {
    sectionId: 3,
    question: "Was ist eine performante Alternative zu einem Conditional Type fuer Property-Zugriff?",
    options: [
      "Ein runtime typeof-Check",
      "Ein Constraint mit direktem Lookup (T['id'])",
      "Ein switch-Statement im Typ",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Constraints + Lookup (T extends { id: X } => T['id']) ist schneller als Conditional + infer.",
  },
  {
    sectionId: 3,
    question: "Warum sind grosse Union-Types langsam?",
    options: [
      "Weil Zuweisbarkeits-Checks O(n*m) sind",
      "Weil der Parser sie nicht effizient parsen kann",
      "Weil Unions nicht gecacht werden koennen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Jedes Member des einen Union-Typs muss gegen jedes Member des anderen geprueft werden: O(n*m).",
  },

  // ─── Sektion 4: Compile-Zeit messen und optimieren ──────────────────────

  {
    sectionId: 4,
    question: "Mit welchem Flag misst man die Compile-Zeit pro Phase?",
    options: [
      "--verbose",
      "--extendedDiagnostics",
      "--profile",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "--extendedDiagnostics zeigt Parse time, Bind time, Check time, Emit time und Memory.",
  },
  {
    sectionId: 4,
    question: "Was macht 'skipLibCheck: true'?",
    options: [
      "Ueberspringt Type-Checking von .d.ts-Dateien",
      "Ignoriert alle node_modules",
      "Deaktiviert den gesamten Type-Check",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "skipLibCheck ueberspringt die Pruefung von Deklarationsdateien (.d.ts) und spart 10-30% Compile-Zeit.",
  },
  {
    sectionId: 4,
    question: "Was ist der Vorteil von 'tsc --noEmit'?",
    options: [
      "Es erzeugt nur .d.ts-Dateien",
      "Es erzeugt JavaScript ohne Typen zu pruefen",
      "Es prueft Typen ohne JavaScript zu erzeugen — ideal fuer CI",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "tsc --noEmit prueft nur die Typen ohne die Emitter-Phase — spart Zeit wenn JavaScript von esbuild/swc erzeugt wird.",
  },

  // ─── Sektion 5: Inkrementelle Kompilierung ──────────────────────────────

  {
    sectionId: 5,
    question: "Was speichert die .tsBuildInfo-Datei?",
    options: [
      "Kompiliertes JavaScript als Cache",
      "Hashes und Diagnostics pro Datei fuer inkrementelles Build",
      "Die tsconfig-Optionen fuer den naechsten Build",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Die .tsBuildInfo speichert Version-Hashes und Signature-Hashes pro Datei um zu erkennen was sich geaendert hat.",
  },
  {
    sectionId: 5,
    question: "Was ist Voraussetzung fuer Project References?",
    options: [
      "npm workspaces muessen konfiguriert sein",
      "Ich weiss es nicht",
      "Alle Projekte muessen das gleiche outDir verwenden",
      "composite: true in der tsconfig des referenzierten Projekts",
    ],
    correct: 3,
    explanation: "composite: true ist Pflicht — es erzwingt declaration: true und stellt sicher dass alle Dateien bekannt sind.",
  },
  {
    sectionId: 5,
    question: "Wie startet man einen inkrementellen Build mit Project References?",
    options: [
      "npx tsc --incremental",
      "Ich weiss es nicht",
      "npx tsc --watch --fast",
      "npx tsc --build",
    ],
    correct: 3,
    explanation: "tsc --build (oder tsc -b) baut Projekte in der richtigen Abhaengigkeitsreihenfolge und nutzt inkrementelles Build.",
  },

  // ─── Sektion 6: Praxis — Monorepo-Performance ───────────────────────────

  {
    sectionId: 6,
    question: "Welches Build-Tool wird fuer Angular-Monorepos empfohlen?",
    options: [
      "Webpack",
      "Ich weiss es nicht",
      "Rollup",
      "Nx",
    ],
    correct: 3,
    explanation: "Nx wurde vom ehemaligen Angular-Team gebaut und hat erstklassige Angular-Unterstuetzung.",
  },
  {
    sectionId: 6,
    question: "Warum sollte .tsBuildInfo in CI gecacht werden?",
    options: [
      "Weil CI sonst abstuerzt",
      "Weil es die Tests beschleunigt",
      "Weil es den naechsten Build um 50-90% schneller macht",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Die gecachte .tsBuildInfo ermoeglicht inkrementelles Build in CI — nur geaenderte Dateien werden geprueft.",
  },
  {
    sectionId: 6,
    question: "Was ist die optimale Schichtung eines TypeScript-Monorepos?",
    options: [
      "Ich weiss es nicht",
      "Alles in einem Paket",
      "Ein Paket pro Datei",
      "Types → Utilities → Apps (drei Schichten)",
    ],
    correct: 3,
    explanation: "Drei Schichten: Shared Types (keine Logik), Shared Utilities, Apps. Aenderungen in Apps triggern keinen Rebuild der unteren Schichten.",
  },
];
