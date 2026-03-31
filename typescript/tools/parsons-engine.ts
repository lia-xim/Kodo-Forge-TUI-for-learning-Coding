/**
 * Parson's Problems Engine
 *
 * Implementiert Parson's Problems: Der Lerner ordnet vorgegebene
 * Code-Zeilen in die richtige Reihenfolge. Optionale Distraktoren
 * (falsche Zeilen) erhoehen die Schwierigkeit.
 *
 * Parson's Problems sind besonders effektiv fuer:
 *  - Verstaendnis von Code-Struktur und Reihenfolge
 *  - Syntax-Training ohne Tippfehler-Frust
 *  - Konzentration auf Logik statt Syntax
 *
 * Features:
 *  - Laden von Parson's Problems aus parsons-data.ts Dateien
 *  - Fisher-Yates Shuffle fuer zufaellige Zeilenreihenfolge
 *  - Loesungspruefung mit detailliertem Feedback (falsche Indizes)
 *  - Distraktor-Unterstuetzung (falsche Zeilen erkennen)
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Typen ──────────────────────────────────────────────────────────────────

/**
 * Ein einzelnes Parson's Problem.
 *
 * Der Lerner erhaelt die Zeilen in gemischter Reihenfolge und muss
 * sie korrekt anordnen. Optionale Distraktoren sind falsche Zeilen
 * die nicht zum korrekten Code gehoeren.
 */
export interface ParsonsProblem {
  /** Eindeutige ID (z.B. "L01-P1") */
  id: string;
  /** Titel des Problems */
  title: string;
  /** Beschreibung was der Code tun soll */
  description: string;
  /** Code-Zeilen in der RICHTIGEN Reihenfolge */
  correctOrder: string[];
  /** Optionale falsche Zeilen (Distraktoren) */
  distractors?: string[];
  /** Optionaler Hinweis */
  hint?: string;
  /** Welches Konzept wird geuebt */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

/**
 * Ergebnis einer Loesungspruefung.
 */
export interface ParsonsCheckResult {
  /** Ob die Loesung vollstaendig korrekt ist */
  correct: boolean;
  /** Indizes der falsch platzierten Zeilen (0-basiert) */
  wrongIndices: number[];
  /** Ob Distraktoren korrekt ausgeschlossen wurden */
  distractorsCorrectlyExcluded: boolean;
  /** Welche Distraktoren faelschlicherweise inkludiert wurden */
  includedDistractors: string[];
}

/**
 * Modul-Format einer parsons-data.ts Datei.
 *
 * Jede Lektion exportiert:
 *   export const parsonsProblems: ParsonsProblem[];
 */
interface ParsonsModule {
  parsonsProblems: ParsonsProblem[];
}

// ─── Parson's Problems laden ────────────────────────────────────────────────

/**
 * Lade Parson's Problems fuer eine bestimmte Lektion.
 *
 * Sucht im Lektionsverzeichnis nach einer parsons-data.ts Datei
 * und parst die exportierten Problems.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param lessonDir - Name des Lektionsverzeichnisses (z.B. "01-setup-und-erste-schritte")
 * @returns Array mit Parson's Problems fuer die Lektion
 */
export function loadParsonsProblems(
  projectRoot: string,
  lessonDir: string
): ParsonsProblem[] {
  const filePath = path.join(projectRoot, lessonDir, "parsons-data.ts");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return parseParsonsFile(content);
  } catch {
    return [];
  }
}

/**
 * Lade Parson's Problems aus allen Lektionen.
 *
 * Durchsucht alle Lektionsverzeichnisse (Format: "XX-...") nach
 * parsons-data.ts Dateien und sammelt alle Problems.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @returns Array mit allen Parson's Problems, sortiert nach Lektion
 */
export function loadAllParsonsProblems(
  projectRoot: string
): ParsonsProblem[] {
  const lessonDirs = getLessonDirectories(projectRoot);
  const allProblems: ParsonsProblem[] = [];

  for (const dir of lessonDirs) {
    const problems = loadParsonsProblems(projectRoot, dir);
    allProblems.push(...problems);
  }

  return allProblems;
}

// ─── Zeilen mischen ────────────────────────────────────────────────────────

/**
 * Mische die Zeilen eines Parson's Problems (Fisher-Yates Shuffle).
 *
 * Kombiniert die korrekten Zeilen mit optionalen Distraktoren und
 * mischt alles zufaellig. Das Original-Array wird nicht veraendert.
 *
 * @param lines - Zu mischende Zeilen
 * @returns Neue, zufaellig gemischte Kopie
 */
export function shuffleLines(lines: string[]): string[] {
  const result = [...lines];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Bereite ein Parson's Problem fuer die Anzeige vor.
 *
 * Kombiniert korrekte Zeilen und Distraktoren, mischt alles
 * und gibt die gemischten Zeilen zurueck.
 *
 * @param problem - Das Parson's Problem
 * @returns Gemischte Zeilen (inklusive Distraktoren)
 */
export function prepareShuffledLines(problem: ParsonsProblem): string[] {
  const allLines = [...problem.correctOrder, ...(problem.distractors ?? [])];
  return shuffleLines(allLines);
}

// ─── Loesung pruefen ───────────────────────────────────────────────────────

/**
 * Pruefe ob die Loesung des Lerners korrekt ist.
 *
 * Vergleicht die vom Lerner gewaehlte Reihenfolge mit der korrekten
 * Reihenfolge. Beruecksichtigt auch Distraktoren: Zeilen die in der
 * Loesung enthalten sind aber nicht zur korrekten Loesung gehoeren
 * werden als Fehler gewertet.
 *
 * @param userOrder - Die vom Lerner gewaehlte Zeilenreihenfolge
 * @param correctOrder - Die korrekte Zeilenreihenfolge
 * @returns Detailliertes Ergebnis mit falschen Indizes
 */
export function checkSolution(
  userOrder: string[],
  correctOrder: string[]
): { correct: boolean; wrongIndices: number[] } {
  const wrongIndices: number[] = [];

  // Laengenunterschied: alle ueberzaehligen oder fehlenden markieren
  const maxLen = Math.max(userOrder.length, correctOrder.length);

  for (let i = 0; i < maxLen; i++) {
    const userLine = i < userOrder.length ? userOrder[i] : undefined;
    const correctLine = i < correctOrder.length ? correctOrder[i] : undefined;

    if (userLine !== correctLine) {
      wrongIndices.push(i);
    }
  }

  return {
    correct: wrongIndices.length === 0,
    wrongIndices,
  };
}

/**
 * Erweiterte Loesungspruefung mit Distraktor-Erkennung.
 *
 * Prueft zusaetzlich ob der Lerner Distraktoren korrekt
 * ausgeschlossen hat.
 *
 * @param userOrder - Die vom Lerner gewaehlte Zeilenreihenfolge
 * @param problem - Das vollstaendige Parson's Problem
 * @returns Detailliertes Ergebnis inkl. Distraktor-Info
 */
export function checkSolutionDetailed(
  userOrder: string[],
  problem: ParsonsProblem
): ParsonsCheckResult {
  const basicResult = checkSolution(userOrder, problem.correctOrder);
  const distractors = problem.distractors ?? [];
  const distractorSet = new Set(distractors);

  // Pruefe ob Distraktoren in der Loesung enthalten sind
  const includedDistractors = userOrder.filter((line) =>
    distractorSet.has(line)
  );

  return {
    correct: basicResult.correct && includedDistractors.length === 0,
    wrongIndices: basicResult.wrongIndices,
    distractorsCorrectlyExcluded: includedDistractors.length === 0,
    includedDistractors,
  };
}

// ─── Feedback-Generierung ──────────────────────────────────────────────────

/**
 * Generiere eine menschenlesbare Rueckmeldung zur Loesung.
 *
 * @param result - Ergebnis der Loesungspruefung
 * @param totalLines - Gesamtanzahl der korrekten Zeilen
 * @returns Feedback-String auf Deutsch
 */
export function generateFeedback(
  result: ParsonsCheckResult,
  totalLines: number
): string {
  if (result.correct) {
    return "Perfekt! Alle Zeilen sind in der richtigen Reihenfolge.";
  }

  const lines: string[] = [];

  if (result.includedDistractors.length > 0) {
    lines.push(
      `${result.includedDistractors.length} Zeile(n) gehoeren nicht zum Code ` +
        `und muessen entfernt werden.`
    );
  }

  if (result.wrongIndices.length > 0) {
    const correctCount = totalLines - result.wrongIndices.length;
    const percentage = Math.round((correctCount / totalLines) * 100);
    lines.push(
      `${result.wrongIndices.length} von ${totalLines} Zeilen sind an ` +
        `der falschen Position (${percentage}% korrekt).`
    );
  }

  return lines.join(" ");
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
 * Parse eine parsons-data.ts Datei synchron.
 *
 * Extrahiert ParsonsProblem-Objekte aus dem Datei-Inhalt mittels
 * Regex-basiertem Parsing. Da dynamisches import() asynchron ist,
 * verwenden wir diese Methode fuer synchrone Kontexte.
 *
 * Erwartet das Format:
 *   export const parsonsProblems: ParsonsProblem[] = [ { ... }, { ... } ];
 *
 * @param content - Inhalt der parsons-data.ts Datei
 * @returns Array mit geparsten ParsonsProblem-Objekten
 */
function parseParsonsFile(content: string): ParsonsProblem[] {
  try {
    // Finde den parsonsProblems-Array im Datei-Inhalt
    const match = content.match(
      /export\s+const\s+parsonsProblems\s*(?::\s*ParsonsProblem\[\])?\s*=\s*(\[[\s\S]*\]);?\s*$/m
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

    const parsed = JSON.parse(arrayStr) as ParsonsProblem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
