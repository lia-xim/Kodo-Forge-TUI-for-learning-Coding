/**
 * Pre-Test & Warm-Up Engine
 *
 * Stellt Funktionen bereit fuer:
 *  - Pre-Tests vor Sektionen (Vorwissens-Check)
 *  - Retrieval Warm-Ups aus abgeschlossenen Lektionen
 *  - Tiefenberechnung basierend auf Pre-Test-Ergebnissen
 *
 * Die Engine laedt pretest-data.ts Dateien aus Lektionsverzeichnissen
 * und berechnet die empfohlene Inhaltstiefe adaptiv.
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

// ─── Typen ──────────────────────────────────────────────────────────────────

/**
 * Eine einzelne Pre-Test-Frage fuer eine Sektion.
 *
 * Wird aus pretest-data.ts Dateien in Lektionsverzeichnissen geladen.
 */
export interface PretestQuestion {
  /** Die Frage */
  question: string;
  /** Antwortmoeglichkeiten */
  options: string[];
  /** Index der korrekten Antwort (0-basiert) */
  correct: number;
  /** Erklaerung nach Beantwortung */
  explanation: string;
  /** Kurze Erklaerung (Alias fuer UI-Kompatibilitaet) */
  briefExplanation?: string;
  /** Optional: Codeblock der vor der Frage angezeigt wird */
  code?: string;
  /** Konzept-Tag fuer adaptive Engine */
  concept?: string;
  /** Sektionsindex auf den sich die Frage bezieht (0-basiert) */
  sectionIndex: number;
}

/**
 * Ergebnis eines Pre-Tests fuer eine Sektion.
 */
export interface PretestResult {
  /** Index der Lektion (0-basiert in der Lektionsliste) */
  lessonIndex: number;
  /** Index der Sektion innerhalb der Lektion (0-basiert) */
  sectionIndex: number;
  /** Einzelergebnisse pro Frage */
  answers: { questionIndex: number; correct: boolean; skipped: boolean }[];
  /** Empfohlene Tiefe basierend auf Ergebnis */
  recommendedDepth: "kurz" | "standard" | "vollständig";
  /** Score 0-100 */
  score: number;
}

/**
 * Modul-Format einer pretest-data.ts Datei.
 *
 * Jede Lektion kann eine pretest-data.ts exportieren mit:
 *   export const lessonId: string;
 *   export const questions: PretestQuestion[];
 */
interface PretestModule {
  lessonId: string;
  questions: PretestQuestion[];
}

// ─── Schwellenwerte ─────────────────────────────────────────────────────────

/**
 * Schwellenwerte fuer die Tiefenberechnung.
 *
 * - >= 80% korrekt  ->  "kurz" (Stoff wird nur kurz zusammengefasst)
 * - >= 40% korrekt  ->  "standard" (normale Darstellung)
 * - <  40% korrekt  ->  "vollständig" (ausfuehrliche Erklaerung mit Beispielen)
 */
const DEPTH_THRESHOLD_HIGH = 80;
const DEPTH_THRESHOLD_MID = 40;

// ─── Pre-Test-Fragen laden ──────────────────────────────────────────────────

/**
 * Lade Pre-Test-Fragen fuer eine bestimmte Sektion.
 *
 * Sucht im Lektionsverzeichnis nach einer pretest-data.ts Datei
 * und filtert die Fragen fuer den angegebenen Sektionsindex.
 *
 * @param lessonDir - Absoluter Pfad zum Lektionsverzeichnis
 * @param sectionIndex - 0-basierter Index der Sektion
 * @returns Array mit Pre-Test-Fragen fuer die Sektion
 */
export function getPretestQuestions(
  lessonDir: string,
  sectionIndex: number
): PretestQuestion[] {
  const pretestPath = path.join(lessonDir, "pretest-data.ts");

  if (!fs.existsSync(pretestPath)) {
    return [];
  }

  try {
    // Synchrones Laden: Datei parsen statt dynamischem Import,
    // da synchrones import() nicht moeglich ist.
    // Wir verwenden eine einfache Parsing-Strategie.
    const content = fs.readFileSync(pretestPath, "utf-8");
    const questions = parsePretestFile(content);
    return questions.filter((q) => q.sectionIndex === sectionIndex);
  } catch {
    return [];
  }
}

/**
 * Lade ALLE Pre-Test-Fragen fuer eine gesamte Lektion.
 *
 * Im Gegensatz zu getPretestQuestions() wird nicht nach Sektion gefiltert —
 * alle Fragen der Lektion werden zurueckgegeben.
 *
 * @param lessonDir - Absoluter Pfad zum Lektionsverzeichnis
 * @returns Array mit allen Pre-Test-Fragen der Lektion
 */
export function getAllPretestQuestions(
  lessonDir: string
): PretestQuestion[] {
  const pretestPath = path.join(lessonDir, "pretest-data.ts");

  if (!fs.existsSync(pretestPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(pretestPath, "utf-8");
    return parsePretestFile(content);
  } catch {
    return [];
  }
}

/**
 * Lade Pre-Test-Fragen asynchron (fuer Kontexte mit await).
 *
 * Nutzt dynamisches import() fuer korrekte TypeScript-Module.
 *
 * @param lessonDir - Absoluter Pfad zum Lektionsverzeichnis
 * @param sectionIndex - 0-basierter Index der Sektion
 * @returns Promise mit Pre-Test-Fragen fuer die Sektion
 */
export async function getPretestQuestionsAsync(
  lessonDir: string,
  sectionIndex: number
): Promise<PretestQuestion[]> {
  const pretestPath = path.join(lessonDir, "pretest-data.ts");

  if (!fs.existsSync(pretestPath)) {
    return [];
  }

  try {
    const importUrl = pathToFileURL(pretestPath).href;
    const mod = (await import(importUrl)) as PretestModule;
    return (mod.questions ?? []).filter((q) => q.sectionIndex === sectionIndex);
  } catch {
    return [];
  }
}

// ─── Tiefenberechnung ───────────────────────────────────────────────────────

/**
 * Berechne empfohlene Inhaltstiefe basierend auf Pre-Test-Antworten.
 *
 * Algorithmus:
 *  - Uebersprungene Fragen zaehlen als falsch
 *  - >= 80% korrekt -> "kurz" (Lerner kennt den Stoff bereits)
 *  - >= 40% korrekt -> "standard" (teilweises Vorwissen)
 *  - <  40% korrekt -> "vollständig" (wenig Vorwissen, ausfuehrlich)
 *
 * @param results - Array mit Einzelergebnissen pro Frage
 * @returns Empfohlene Inhaltstiefe
 */
export function calculateDepth(
  results: { correct: boolean; skipped: boolean }[]
): "kurz" | "standard" | "vollständig" {
  if (results.length === 0) {
    return "standard";
  }

  const correctCount = results.filter((r) => r.correct && !r.skipped).length;
  const score = Math.round((correctCount / results.length) * 100);

  if (score >= DEPTH_THRESHOLD_HIGH) {
    return "kurz";
  }
  if (score >= DEPTH_THRESHOLD_MID) {
    return "standard";
  }
  return "vollständig";
}

/**
 * Berechne den Score (0-100) aus Pre-Test-Antworten.
 *
 * @param results - Array mit Einzelergebnissen pro Frage
 * @returns Score als Ganzzahl von 0 bis 100
 */
export function calculateScore(
  results: { correct: boolean; skipped: boolean }[]
): number {
  if (results.length === 0) {
    return 0;
  }

  const correctCount = results.filter((r) => r.correct && !r.skipped).length;
  return Math.round((correctCount / results.length) * 100);
}

/**
 * Berechnet empfohlene Inhaltstiefen basierend auf Pre-Test-Ergebnissen.
 *
 * Logik:
 * - >= 80% richtig → "kurz" (du kennst das schon)
 * - >= 40% richtig → "standard" (Grundlagen da, Details fehlen)
 * - < 40% richtig → "vollständig" (Neuland, tiefer einsteigen)
 *
 * @param lessonIndex - Index der Lektion
 * @param sectionScores - Array mit Ergebnissen pro Sektion
 * @returns Record mit Tiefen-Empfehlungen (key: "lessonIdx-sectionIdx")
 */
export function calculateDepthsFromPretest(
  lessonIndex: number,
  sectionScores: { sectionIndex: number; correct: number; total: number }[]
): Record<string, "kurz" | "standard" | "vollständig"> {
  const depths: Record<string, "kurz" | "standard" | "vollständig"> = {};

  for (const { sectionIndex, correct, total } of sectionScores) {
    const key = `${lessonIndex}-${sectionIndex}`;
    const ratio = total > 0 ? correct / total : 0;

    if (ratio >= 0.8) {
      depths[key] = "kurz";
    } else if (ratio >= 0.4) {
      depths[key] = "standard";
    } else {
      depths[key] = "vollständig";
    }
  }

  return depths;
}

/**
 * Erstelle ein vollstaendiges PretestResult aus Einzelantworten.
 *
 * @param lessonIndex - Index der Lektion
 * @param sectionIndex - Index der Sektion
 * @param answers - Array mit Einzelergebnissen
 * @returns Vollstaendiges PretestResult-Objekt
 */
export function buildPretestResult(
  lessonIndex: number,
  sectionIndex: number,
  answers: { questionIndex: number; correct: boolean; skipped: boolean }[]
): PretestResult {
  const simpleResults = answers.map((a) => ({
    correct: a.correct,
    skipped: a.skipped,
  }));

  return {
    lessonIndex,
    sectionIndex,
    answers,
    recommendedDepth: calculateDepth(simpleResults),
    score: calculateScore(simpleResults),
  };
}

// ─── Warm-Up-Fragen ─────────────────────────────────────────────────────────

/**
 * Waehle zufaellige Warm-Up-Fragen aus bereits abgeschlossenen Lektionen.
 *
 * Diese Funktion implementiert Retrieval Practice: Vor einer neuen Lektion
 * werden Fragen aus frueheren Lektionen gestellt, um das Langzeitgedaechtnis
 * zu staerken.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param completedLessons - Array mit Indizes abgeschlossener Lektionen (0-basiert)
 * @param count - Gewuenschte Anzahl an Warm-Up-Fragen
 * @returns Array mit Warm-Up-Fragen inkl. Lektionsindex
 */
export function getWarmUpQuestions(
  projectRoot: string,
  completedLessons: number[],
  count: number
): { lessonIndex: number; question: PretestQuestion }[] {
  if (completedLessons.length === 0 || count <= 0) {
    return [];
  }

  // Alle Lektionsverzeichnisse finden
  const lessonDirs = getLessonDirectories(projectRoot);

  // Fragen aus allen abgeschlossenen Lektionen sammeln
  const allQuestions: { lessonIndex: number; question: PretestQuestion }[] = [];

  for (const lessonIdx of completedLessons) {
    if (lessonIdx < 0 || lessonIdx >= lessonDirs.length) {
      continue;
    }

    const lessonDir = path.join(projectRoot, lessonDirs[lessonIdx]);
    const pretestPath = path.join(lessonDir, "pretest-data.ts");

    if (!fs.existsSync(pretestPath)) {
      continue;
    }

    try {
      const content = fs.readFileSync(pretestPath, "utf-8");
      const questions = parsePretestFile(content);
      for (const q of questions) {
        allQuestions.push({ lessonIndex: lessonIdx, question: q });
      }
    } catch {
      // Datei konnte nicht gelesen werden — weiter
    }
  }

  if (allQuestions.length === 0) {
    return [];
  }

  // Zufaellig mischen (Fisher-Yates Shuffle)
  return shuffleArray(allQuestions).slice(0, count);
}

/**
 * Asynchrone Variante von getWarmUpQuestions.
 *
 * Nutzt dynamisches import() fuer pretest-data.ts Module.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param completedLessons - Array mit Indizes abgeschlossener Lektionen (0-basiert)
 * @param count - Gewuenschte Anzahl an Warm-Up-Fragen
 * @returns Promise mit Array von Warm-Up-Fragen inkl. Lektionsindex
 */
export async function getWarmUpQuestionsAsync(
  projectRoot: string,
  completedLessons: number[],
  count: number
): Promise<{ lessonIndex: number; question: PretestQuestion }[]> {
  if (completedLessons.length === 0 || count <= 0) {
    return [];
  }

  const lessonDirs = getLessonDirectories(projectRoot);
  const allQuestions: { lessonIndex: number; question: PretestQuestion }[] = [];

  for (const lessonIdx of completedLessons) {
    if (lessonIdx < 0 || lessonIdx >= lessonDirs.length) {
      continue;
    }

    const lessonDir = path.join(projectRoot, lessonDirs[lessonIdx]);
    const pretestPath = path.join(lessonDir, "pretest-data.ts");

    if (!fs.existsSync(pretestPath)) {
      continue;
    }

    try {
      const importUrl = pathToFileURL(pretestPath).href;
      const mod = (await import(importUrl)) as PretestModule;
      for (const q of mod.questions ?? []) {
        allQuestions.push({ lessonIndex: lessonIdx, question: q });
      }
    } catch {
      // Modul konnte nicht geladen werden — weiter
    }
  }

  if (allQuestions.length === 0) {
    return [];
  }

  return shuffleArray(allQuestions).slice(0, count);
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

/**
 * Finde alle Lektionsverzeichnisse (sortiert nach Nummer).
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @returns Sortiertes Array mit Verzeichnisnamen (z.B. ["01-setup-und-erste-schritte", ...])
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
 * Fisher-Yates Shuffle — mische ein Array zufaellig.
 *
 * Erstellt eine Kopie des Arrays und mischt diese.
 * Das Original-Array wird nicht veraendert.
 *
 * @param array - Zu mischendes Array
 * @returns Neue, zufaellig gemischte Kopie
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Parse eine pretest-data.ts Datei synchron.
 *
 * Diese Funktion extrahiert PretestQuestion-Objekte aus dem Datei-Inhalt
 * mittels JSON-aehnlichem Parsing. Da dynamisches import() asynchron ist,
 * verwenden wir diese Methode fuer synchrone Kontexte.
 *
 * Erwartet das Format:
 *   export const questions: PretestQuestion[] = [ { ... }, { ... } ];
 *
 * @param content - Inhalt der pretest-data.ts Datei
 * @returns Array mit geparsten PretestQuestion-Objekten
 */
function parsePretestFile(content: string): PretestQuestion[] {
  try {
    // Finde den questions-Array im Datei-Inhalt
    const questionsMatch = content.match(
      /export\s+const\s+questions\s*(?::\s*PretestQuestion\[\])?\s*=\s*(\[[\s\S]*\]);?\s*$/m
    );

    if (!questionsMatch?.[1]) {
      return [];
    }

    let arrayStr = questionsMatch[1];

    // Entferne einzeilige Kommentare (// ...)
    arrayStr = arrayStr.replace(/\/\/[^\n]*/g, "");
    // Entferne mehrzeilige Kommentare (/* ... */)
    arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, "");

    // Trailing Commas vor ] entfernen (JSON-kompatibel machen)
    arrayStr = arrayStr.replace(/,\s*([}\]])/g, "$1");

    // Einfache String-Konkatenation aufloesen ("a" + "b" -> "ab")
    // Iterativ anwenden fuer mehrstufige Konkatenation
    let prev = "";
    while (prev !== arrayStr) {
      prev = arrayStr;
      arrayStr = arrayStr.replace(
        /"([^"]*)"\s*\+\s*"([^"]*)"/g,
        '"$1$2"'
      );
    }

    // Property-Namen ohne Anfuehrungszeichen in JSON-Format bringen
    arrayStr = arrayStr.replace(
      /(\{|,)\s*(\w+)\s*:/g,
      '$1"$2":'
    );

    const parsed = JSON.parse(arrayStr) as PretestQuestion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
