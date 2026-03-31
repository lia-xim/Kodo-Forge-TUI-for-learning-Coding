/**
 * Debugging Challenges Engine
 *
 * Implementiert Debugging-Aufgaben: Der Lerner analysiert fehlerhaften Code,
 * identifiziert den Bug und waehlt die korrekte Erklaerung per Multiple Choice.
 *
 * Debugging Challenges sind besonders effektiv fuer:
 *  - Verstaendnis von TypeScript-Eigenheiten und Fallstricken
 *  - Erkennen gaengiger Fehlerquellen (Soundness Holes, Laufzeit vs. Compile-Zeit)
 *  - Vertiefen des Verstaendnisses durch Fehleranalyse
 *  - Progressive Hints schulen systematisches Debugging
 *
 * Bug-Typen:
 *  - type-error:     TypeScript-Compiler meldet Fehler
 *  - logic-error:    Code kompiliert, verhaelt sich aber falsch
 *  - runtime-error:  Code kompiliert, wirft Laufzeitfehler
 *  - soundness-hole: TypeScript erkennt den Bug NICHT (Design-Luecke)
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Typen ──────────────────────────────────────────────────────────────────

/**
 * Eine einzelne Debugging Challenge.
 *
 * Der Lerner sieht fehlerhaften Code und muss den Bug identifizieren.
 * Progressive Hints fuehren bei Bedarf zum Bug. Multiple-Choice-Optionen
 * testen das Verstaendnis des Fehlers.
 */
export interface DebuggingChallenge {
  /** Eindeutige ID (z.B. "L01-D1") */
  id: string;
  /** Titel der Challenge */
  title: string;
  /** Der fehlerhafte Code */
  buggyCode: string;
  /** Optional: Compiler-Fehlermeldung die angezeigt wird */
  errorMessage?: string;
  /** Art des Bugs */
  bugType: "type-error" | "logic-error" | "runtime-error" | "soundness-hole";
  /** Welche Zeile enthaelt den Bug (1-basiert) */
  bugLine: number;
  /** Was ist der Bug? (Multiple Choice Optionen) */
  options: string[];
  /** Korrekte Option (0-basiert) */
  correctOption: number;
  /** Progressive Hints (vom allgemeinsten zum spezifischsten) */
  hints: string[];
  /** Der korrigierte Code */
  fixedCode: string;
  /** Ausfuehrliche Erklaerung des Bugs und der Loesung */
  explanation: string;
  /** Welches Konzept wird geuebt */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

/**
 * Ergebnis einer Debugging-Antwort.
 */
export interface DebuggingResult {
  /** Ob die gewaehlte Option korrekt ist */
  correct: boolean;
  /** Wie viele Hints wurden angefordert (0-3) */
  hintsUsed: number;
  /** Score basierend auf Korrektheit und Hint-Nutzung */
  score: number;
}

/**
 * Modul-Format einer debugging-data.ts Datei.
 *
 * Jede Lektion exportiert:
 *   export const debuggingChallenges: DebuggingChallenge[];
 */
interface DebuggingModule {
  debuggingChallenges: DebuggingChallenge[];
}

// ─── Konstanten ─────────────────────────────────────────────────────────────

/**
 * Maximaler Score pro Challenge (ohne Hints).
 */
const MAX_SCORE = 100;

/**
 * Score-Abzug pro verwendetem Hint.
 */
const HINT_PENALTY = 20;

/**
 * Minimaler Score bei korrekter Antwort (auch mit allen Hints).
 */
const MIN_CORRECT_SCORE = 30;

// ─── Debugging Challenges laden ─────────────────────────────────────────────

/**
 * Lade Debugging Challenges fuer eine bestimmte Lektion.
 *
 * Sucht im Lektionsverzeichnis nach einer debugging-data.ts Datei
 * und parst die exportierten Challenges.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param lessonDir - Name des Lektionsverzeichnisses (z.B. "01-setup-und-erste-schritte")
 * @returns Array mit Debugging Challenges fuer die Lektion
 */
export function loadDebuggingChallenges(
  projectRoot: string,
  lessonDir: string
): DebuggingChallenge[] {
  const filePath = path.join(projectRoot, lessonDir, "debugging-data.ts");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return parseDebuggingFile(content);
  } catch {
    return [];
  }
}

/**
 * Lade Debugging Challenges aus allen Lektionen.
 *
 * Durchsucht alle Lektionsverzeichnisse (Format: "XX-...") nach
 * debugging-data.ts Dateien und sammelt alle Challenges.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @returns Array mit allen Debugging Challenges, sortiert nach Lektion
 */
export function loadAllDebuggingChallenges(
  projectRoot: string
): DebuggingChallenge[] {
  const lessonDirs = getLessonDirectories(projectRoot);
  const allChallenges: DebuggingChallenge[] = [];

  for (const dir of lessonDirs) {
    const challenges = loadDebuggingChallenges(projectRoot, dir);
    allChallenges.push(...challenges);
  }

  return allChallenges;
}

// ─── Antwort pruefen ───────────────────────────────────────────────────────

/**
 * Pruefe die Antwort des Lerners und berechne den Score.
 *
 * Der Score beruecksichtigt:
 *  - Korrektheit der Antwort (0 bei falscher Antwort)
 *  - Anzahl verwendeter Hints (Abzug pro Hint)
 *  - Mindest-Score bei korrekter Antwort
 *
 * @param challenge - Die Debugging Challenge
 * @param selectedOption - Vom Lerner gewaehlte Option (0-basiert)
 * @param hintsUsed - Anzahl der angeforderten Hints
 * @returns Ergebnis mit Korrektheit und Score
 */
export function checkAnswer(
  challenge: DebuggingChallenge,
  selectedOption: number,
  hintsUsed: number
): DebuggingResult {
  const correct = selectedOption === challenge.correctOption;

  if (!correct) {
    return { correct: false, hintsUsed, score: 0 };
  }

  // Score berechnen: Abzug pro Hint, aber Minimum garantiert
  const rawScore = MAX_SCORE - hintsUsed * HINT_PENALTY;
  const score = Math.max(MIN_CORRECT_SCORE, rawScore);

  return { correct: true, hintsUsed, score };
}

/**
 * Hole den naechsten Hint fuer eine Challenge.
 *
 * Gibt den Hint am angegebenen Index zurueck oder null wenn
 * alle Hints bereits angezeigt wurden.
 *
 * @param challenge - Die Debugging Challenge
 * @param hintIndex - Index des gewuenschten Hints (0-basiert)
 * @returns Hint-Text oder null wenn kein weiterer Hint verfuegbar
 */
export function getNextHint(
  challenge: DebuggingChallenge,
  hintIndex: number
): string | null {
  if (hintIndex < 0 || hintIndex >= challenge.hints.length) {
    return null;
  }
  return challenge.hints[hintIndex];
}

/**
 * Pruefe ob weitere Hints verfuegbar sind.
 *
 * @param challenge - Die Debugging Challenge
 * @param hintsUsed - Bereits angezeigte Hints
 * @returns true wenn noch mindestens ein Hint verfuegbar ist
 */
export function hasMoreHints(
  challenge: DebuggingChallenge,
  hintsUsed: number
): boolean {
  return hintsUsed < challenge.hints.length;
}

// ─── Feedback-Generierung ──────────────────────────────────────────────────

/**
 * Generiere menschenlesbare Rueckmeldung nach einer Antwort.
 *
 * @param challenge - Die Debugging Challenge
 * @param result - Das Ergebnis der Antwort
 * @returns Mehrzeiliger Feedback-String auf Deutsch
 */
export function generateDebuggingFeedback(
  challenge: DebuggingChallenge,
  result: DebuggingResult
): string {
  const lines: string[] = [];

  if (result.correct) {
    lines.push("Richtig! Du hast den Bug gefunden.");

    if (result.hintsUsed === 0) {
      lines.push("Ohne Hints — ausgezeichnet!");
    } else {
      lines.push(
        `${result.hintsUsed} Hint(s) verwendet. ` +
          `Score: ${result.score}/${MAX_SCORE}`
      );
    }
  } else {
    lines.push("Leider nicht korrekt.");
    lines.push(
      `Die richtige Antwort war: ${challenge.options[challenge.correctOption]}`
    );
  }

  lines.push("");
  lines.push("Erklaerung:");
  lines.push(challenge.explanation);

  if (challenge.fixedCode) {
    lines.push("");
    lines.push("Korrigierter Code:");
    lines.push(challenge.fixedCode);
  }

  return lines.join("\n");
}

/**
 * Beschreibung des Bug-Typs auf Deutsch.
 *
 * @param bugType - Art des Bugs
 * @returns Menschenlesbare Beschreibung
 */
export function getBugTypeDescription(
  bugType: DebuggingChallenge["bugType"]
): string {
  switch (bugType) {
    case "type-error":
      return "Typ-Fehler: TypeScript meldet einen Compile-Fehler";
    case "logic-error":
      return "Logik-Fehler: Code kompiliert, verhaelt sich aber falsch";
    case "runtime-error":
      return "Laufzeit-Fehler: Code kompiliert, stuerzt aber zur Laufzeit ab";
    case "soundness-hole":
      return "Soundness-Luecke: TypeScript erkennt diesen Bug nicht";
    default:
      return "Unbekannter Bug-Typ";
  }
}

// ─── Statistik ─────────────────────────────────────────────────────────────

/**
 * Berechne Statistiken ueber eine Reihe von Debugging-Ergebnissen.
 *
 * @param results - Array mit Debugging-Ergebnissen
 * @returns Zusammenfassung der Ergebnisse
 */
export function calculateStats(
  results: DebuggingResult[]
): {
  totalChallenges: number;
  correctCount: number;
  averageScore: number;
  averageHints: number;
  perfectCount: number;
} {
  if (results.length === 0) {
    return {
      totalChallenges: 0,
      correctCount: 0,
      averageScore: 0,
      averageHints: 0,
      perfectCount: 0,
    };
  }

  const correctCount = results.filter((r) => r.correct).length;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0);
  const perfectCount = results.filter(
    (r) => r.correct && r.hintsUsed === 0
  ).length;

  return {
    totalChallenges: results.length,
    correctCount,
    averageScore: Math.round(totalScore / results.length),
    averageHints: Math.round((totalHints / results.length) * 10) / 10,
    perfectCount,
  };
}

// ─── Hilfsfunktionen ───────────────────────────────────────────────────────

/**
 * Finde alle Lektionsverzeichnisse (sortiert nach Nummer).
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @returns Sortiertes Array mit Verzeichnisnamen
 */
function getLessonDirectories(projectRoot: string): string[] {
  try {
    const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * Parse eine debugging-data.ts Datei synchron.
 *
 * Extrahiert DebuggingChallenge-Objekte aus dem Datei-Inhalt mittels
 * Regex-basiertem Parsing. Da dynamisches import() asynchron ist,
 * verwenden wir diese Methode fuer synchrone Kontexte.
 *
 * Erwartet das Format:
 *   export const debuggingChallenges: DebuggingChallenge[] = [ { ... } ];
 *
 * @param content - Inhalt der debugging-data.ts Datei
 * @returns Array mit geparsten DebuggingChallenge-Objekten
 */
function parseDebuggingFile(content: string): DebuggingChallenge[] {
  try {
    // Finde den debuggingChallenges-Array im Datei-Inhalt
    const match = content.match(
      /export\s+const\s+debuggingChallenges\s*(?::\s*DebuggingChallenge\[\])?\s*=\s*(\[[\s\S]*\]);?\s*$/m
    );

    if (!match?.[1]) {
      return [];
    }

    let arrayStr = match[1];

    // Entferne einzeilige Kommentare (// ...)
    arrayStr = arrayStr.replace(/\/\/[^\n]*/g, "");
    // Entferne mehrzeilige Kommentare (/* ... */)
    arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, "");

    // Trailing Commas vor ] und } entfernen (JSON-kompatibel machen)
    arrayStr = arrayStr.replace(/,\s*([}\]])/g, "$1");

    // Einfache String-Konkatenation aufloesen ("a" + "b" -> "ab")
    let prev = "";
    while (prev !== arrayStr) {
      prev = arrayStr;
      arrayStr = arrayStr.replace(
        /"([^"]*)"\s*\+\s*"([^"]*)"/g,
        '"$1$2'
      );
    }

    // Property-Namen ohne Anfuehrungszeichen in JSON-Format bringen
    arrayStr = arrayStr.replace(
      /(\{|,)\s*(\w+)\s*:/g,
      '$1"$2":'
    );

    const parsed = JSON.parse(arrayStr) as DebuggingChallenge[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
