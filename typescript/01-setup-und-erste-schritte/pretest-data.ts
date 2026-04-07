/**
 * Lektion 01 — Pre-Test-Fragen: Setup & Erste Schritte
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
  // ─── Sektion 1: Was ist TypeScript? (Compiler, Transpiler) ────────────────

  {
    sectionIndex: 1,
    question:
      "TypeScript-Code wird in einer anderen Sprache ausgefuehrt. " +
      "Was denkst du — in welcher?",
    options: [
      "TypeScript hat eine eigene Laufzeitumgebung",
      "TypeScript wird zu JavaScript umgewandelt",
      "TypeScript wird zu Maschinencode kompiliert",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript ist ein Transpiler — er uebersetzt TS in JS. " +
      "Zur Laufzeit existiert kein einziger TypeScript-Typ mehr.",
  },
  {
    sectionIndex: 1,
    question:
      "Wenn TypeScript zu einer anderen Sprache kompiliert wird — " +
      "was passiert dann wohl mit den Typ-Annotationen wie `: string`?",
    options: [
      "Sie werden in Laufzeit-Pruefungen umgewandelt",
      "Sie bleiben als Kommentare erhalten",
      "Sie werden komplett entfernt",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Type Erasure: ALLE TypeScript-Typen werden bei der Kompilierung " +
      "restlos entfernt. Der JavaScript-Output enthaelt keine Spur davon.",
  },
  {
    sectionIndex: 1,
    question:
      "Stell dir vor, du definierst ein `interface User { name: string }`. " +
      "Kannst du zur Laufzeit pruefen, ob ein Objekt dieses Interface erfuellt?",
    options: [
      "Ja, mit `obj instanceof User`",
      "Ja, TypeScript fuegt automatische Pruefungen hinzu",
      "Nein, Interfaces existieren zur Laufzeit nicht",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Interfaces sind reine Compile-Zeit-Konstrukte. Sie verschwinden " +
      "bei der Kompilierung — instanceof funktioniert nur mit Klassen.",
  },

  // ─── Sektion 2: Compiler-Pipeline & tsconfig ─────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Wenn dein TypeScript-Code einen Typ-Fehler hat — " +
      "wird trotzdem JavaScript erzeugt?",
    options: [
      "Nein, bei Fehlern wird nichts erzeugt",
      "Ja, TypeScript erzeugt trotzdem JavaScript",
      "Nur wenn man einen speziellen Flag setzt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Standardmaessig erzeugt tsc JavaScript auch bei Typ-Fehlern. " +
      "Type Checking und Emit sind konzeptionell unabhaengig. " +
      "Mit `noEmitOnError: true` kann man das aendern.",
  },
  {
    sectionIndex: 2,
    question:
      "Was denkst du — was macht `strict: true` in der tsconfig.json?",
    options: [
      "Es aktiviert strenge Typ-Pruefungen (z.B. null-Checks)",
      "Es macht den Code schneller",
      "Es verhindert die Nutzung von `var`",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "`strict: true` aktiviert eine Reihe strenger Pruefungen, " +
      "darunter strictNullChecks — die wichtigste einzelne Option, " +
      "weil sie null/undefined-Fehler findet.",
  },
  {
    sectionIndex: 2,
    question:
      "In welcher Reihenfolge arbeitet ein Compiler normalerweise?",
    options: [
      "Code lesen (Parsen) → Pruefen → Ausgabe erzeugen",
      "Pruefen → Code lesen → Ausgabe erzeugen",
      "Ausgabe erzeugen → Code lesen → Pruefen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Die TypeScript-Compiler-Pipeline: Parsing (AST erzeugen) → " +
      "Type Checking (Typen pruefen) → Emit (JavaScript erzeugen).",
  },

  // ─── Sektion 3: Werkzeuge & Ausgabe-Dateien ──────────────────────────────

  {
    sectionIndex: 3,
    question:
      "Wenn du im Browser einen Fehler debuggst, siehst du normalerweise " +
      "die JavaScript-Datei. Wie findest du die Stelle in deiner TypeScript-Quelle?",
    options: [
      "Source Maps ordnen JS-Zeilen den TS-Zeilen zu",
      "Man muss manuell vergleichen",
      "Browser koennen TypeScript direkt lesen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Source Maps (.js.map) sind JSON-Dateien, die jede Zeile im " +
      "JavaScript-Output der entsprechenden Zeile im TypeScript-Quellcode " +
      "zuordnen. Browser und Node.js nutzen sie automatisch.",
  },
  {
    sectionIndex: 3,
    question:
      "Was denkst du — wofuer sind `.d.ts`-Dateien (Declaration Files) da?",
    options: [
      "Sie enthalten den kompilierten JavaScript-Code",
      "Ich weiss es nicht",
      "Sie sind Konfigurationsdateien fuer den Compiler",
      "Sie liefern Typ-Informationen fuer andere Entwickler/Libraries",
    ],
    correct: 3,
    briefExplanation:
      ".d.ts-Dateien enthalten NUR Typen, keinen ausfuehrbaren Code. " +
      "Sie dienen als Schnittstellen-Beschreibung, z.B. @types/react " +
      "fuer React.",
  },
  {
    sectionIndex: 3,
    question:
      "Wenn `as string` im Code steht — was passiert damit zur Laufzeit?",
    code: "const value = someData as string;",
    options: [
      "Der Wert wird in einen String konvertiert",
      "Es wird geprueft ob der Wert ein String ist",
      "Ich weiss es nicht",
      "Es wird komplett entfernt — der Wert aendert sich nicht",
    ],
    correct: 3,
    briefExplanation:
      "Type Assertions (`as string`) existieren nur zur Compile-Zeit. " +
      "Sie werden bei Type Erasure entfernt und aendern den Wert NICHT. " +
      "Fuer echte Konvertierung braucht man `String(value)`.",
  },
];
