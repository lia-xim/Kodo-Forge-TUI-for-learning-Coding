/**
 * Interleave Engine — Gemischte Review-Challenges
 *
 * Generiert Review-Challenges die verschiedene Konzepte mischen
 * (Interleaved Practice). Basiert auf Forschung die zeigt, dass
 * gemischtes Ueben das Langzeitgedaechtnis staerkt.
 *
 * Features:
 *  - Generierung aus vordefinierten Templates (interleave-data.ts)
 *  - Filterung nach abgeschlossenen Lektionen
 *  - Zeitbasierte Pruefung ob ein Review faellig ist
 *  - Zufaellige Auswahl fuer Abwechslung
 *  - Rueckwaertskompatibilitaet: Exportiert auch das alte getInterleavedItems() API
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { challengeTemplates } from "./interleave-data.ts";
import type { ChallengeTemplate } from "./interleave-data.ts";

// ─── Typen ──────────────────────────────────────────────────────────────────

/** Konzept-Tag mit Zuordnung zu Lektion und Sektion */
export interface ConceptTag {
  /** Name des Konzepts */
  concept: string;
  /** Lektionsnummer (1-basiert) */
  lesson: number;
  /** Sektionsnummer (0-basiert) */
  section: number;
}

/** Eine einzelne Interleave-Challenge */
export interface InterleaveChallenge {
  /** Fragetext */
  question: string;
  /** Optionaler Codeblock */
  code?: string;
  /** Welche Konzepte werden gemischt */
  concepts: string[];
  /** Aufgabentyp */
  type: "predict-output" | "fix-error" | "complete-code" | "explain";
  /** Korrekte Antwort */
  answer: string;
  /** Ausfuehrliche Erklaerung */
  explanation: string;
}

/** Persistierter State fuer Interleave-Reviews */
export interface InterleaveState {
  /** Datum des letzten Reviews (ISO-String oder null) */
  lastReviewDate: string | null;
  /** Anzahl durchgefuehrter Reviews */
  totalReviews: number;
  /** IDs der zuletzt verwendeten Templates (um Wiederholung zu vermeiden) */
  recentTemplateIndices: number[];
}

// ─── Legacy-Kompatibilitaet ─────────────────────────────────────────────────

/**
 * Legacy-Interface fuer Rueckwaertskompatibilitaet mit dem bestehenden TUI.
 * Das alte API wird weiterhin exportiert.
 */
export interface InterleavedItem {
  lessonIndex: number;
  lessonNumber: string;
  lessonTitle: string;
  type: "quiz" | "misconception" | "completion";
  question: string;
  code?: string;
  options?: string[];
  correct?: number;
  explanation?: string;
}

// ─── Konstanten ─────────────────────────────────────────────────────────────

const STATE_FILENAME = "interleave-state.json";

/**
 * Mindestanzahl abgeschlossener Lektionen bevor Interleaved Review startet.
 * Unter 3 Lektionen gibt es zu wenig Material zum Mischen.
 */
const MIN_LESSONS_FOR_INTERLEAVE = 3;

/**
 * Mindesttage zwischen zwei Interleaved Reviews.
 * Verhindert uebertriebenes Wiederholen.
 */
const MIN_DAYS_BETWEEN_REVIEWS = 2;

/**
 * Anzahl der zuletzt verwendeten Template-Indizes die gespeichert werden.
 * Verhindert kurzfristige Wiederholung derselben Challenges.
 */
const RECENT_HISTORY_SIZE = 10;

// ─── Challenge-Generierung (neues API) ──────────────────────────────────────

/**
 * Generiere interleaved Review Challenges.
 *
 * Waehlt passende Templates basierend auf den abgeschlossenen Lektionen
 * und gibt sie in zufaelliger Reihenfolge zurueck.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param completedLessons - Array mit 1-basierten Lektionsnummern die abgeschlossen sind
 * @param count - Gewuenschte Anzahl an Challenges
 * @param stateDir - Optionaler Pfad zum State-Verzeichnis (Default: projectRoot/tools)
 * @returns Array mit Interleave-Challenges
 */
export function generateInterleaveChallenge(
  projectRoot: string,
  completedLessons: number[],
  count: number,
  stateDir?: string
): InterleaveChallenge[] {
  if (completedLessons.length < MIN_LESSONS_FOR_INTERLEAVE || count <= 0) {
    return [];
  }

  const completedSet = new Set(completedLessons);
  const toolsDir = stateDir ?? path.join(projectRoot, "tools");
  const state = loadInterleaveState(toolsDir);

  // Templates filtern: Nur solche deren requiredLessons alle abgeschlossen sind
  const eligible = getEligibleTemplates(completedSet);

  if (eligible.length === 0) {
    return [];
  }

  // Zuletzt verwendete Templates de-priorisieren
  const recentSet = new Set(state.recentTemplateIndices);
  const fresh = eligible.filter((t) => !recentSet.has(t.originalIndex));
  const pool = fresh.length >= count ? fresh : eligible;

  // Zufaellig mischen und gewuenschte Anzahl waehlen
  const selected = shuffleArray(pool).slice(0, count);

  // State aktualisieren
  const newRecent = [
    ...selected.map((s) => s.originalIndex),
    ...state.recentTemplateIndices,
  ].slice(0, RECENT_HISTORY_SIZE);

  state.recentTemplateIndices = newRecent;
  state.totalReviews += 1;
  state.lastReviewDate = getToday();
  saveInterleaveState(toolsDir, state);

  // Templates in Challenges umwandeln
  return selected.map((s) => templateToChallenge(s.template));
}

/**
 * Pruefe ob ein Interleaved Review faellig ist.
 *
 * Ein Review ist faellig wenn:
 *  1. Mindestens MIN_LESSONS_FOR_INTERLEAVE Lektionen abgeschlossen sind
 *  2. Das letzte Review mindestens MIN_DAYS_BETWEEN_REVIEWS Tage her ist
 *     (oder noch nie stattgefunden hat)
 *
 * @param completedLessons - Array mit 1-basierten Lektionsnummern
 * @param lastReviewDate - ISO-Datum des letzten Reviews oder null
 * @returns true wenn ein Review faellig ist
 */
export function isInterleaveReviewDue(
  completedLessons: number[],
  lastReviewDate: string | null
): boolean {
  // Mindestens 3 Lektionen abgeschlossen?
  if (completedLessons.length < MIN_LESSONS_FOR_INTERLEAVE) {
    return false;
  }

  // Noch nie ein Review gemacht?
  if (lastReviewDate === null) {
    return true;
  }

  // Genuegend Tage seit letztem Review?
  const today = getToday();
  const daysSince = daysBetween(lastReviewDate, today);
  return daysSince >= MIN_DAYS_BETWEEN_REVIEWS;
}

// ─── Legacy API (Rueckwaertskompatibilitaet) ────────────────────────────────

/**
 * Generiert gemischte Aufgaben aus abgeschlossenen Lektionen.
 *
 * Legacy-Funktion fuer Rueckwaertskompatibilitaet mit dem bestehenden TUI.
 * Nutzt intern das neue Template-System und konvertiert das Ergebnis
 * in das alte InterleavedItem-Format.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param completedLessons - Array mit index, number, title der abgeschlossenen Lektionen
 * @param count - Gewuenschte Anzahl
 * @returns Array mit gemischten Aufgaben im Legacy-Format
 */
export function getInterleavedItems(
  projectRoot: string,
  completedLessons: { index: number; number: string; title: string }[],
  count: number
): InterleavedItem[] {
  if (completedLessons.length < MIN_LESSONS_FOR_INTERLEAVE || count <= 0) {
    return [];
  }

  // Versuche zuerst das neue Template-System
  const lessonNumbers = completedLessons.map((l) => parseInt(l.number, 10));
  const challenges = generateInterleaveChallenge(projectRoot, lessonNumbers, count);

  if (challenges.length > 0) {
    // Konvertiere neue Challenges in Legacy-Format
    return challenges.map((ch) => ({
      lessonIndex: completedLessons[0].index,
      lessonNumber: completedLessons[0].number,
      lessonTitle: "Gemischte Wiederholung",
      type: "quiz" as const,
      question: ch.question,
      code: ch.code,
      explanation: ch.explanation,
    }));
  }

  // Fallback: Direkt aus quiz-data.ts laden (altes Verhalten)
  return loadQuizItemsFallback(projectRoot, completedLessons, count);
}

/**
 * Fallback-Implementierung: Laedt Quiz-Fragen direkt aus quiz-data.ts Dateien.
 *
 * Wird nur verwendet wenn keine Templates verfuegbar sind.
 */
function loadQuizItemsFallback(
  projectRoot: string,
  completedLessons: { index: number; number: string; title: string }[],
  count: number
): InterleavedItem[] {
  const items: InterleavedItem[] = [];

  for (const lesson of completedLessons) {
    const lessonDir = fs
      .readdirSync(projectRoot, { withFileTypes: true })
      .filter(
        (e) => e.isDirectory() && e.name.startsWith(lesson.number + "-")
      )
      .map((e) => e.name)[0];

    if (!lessonDir) continue;

    const quizPath = path.join(projectRoot, lessonDir, "quiz-data.ts");
    if (!fs.existsSync(quizPath)) continue;

    try {
      const content = fs.readFileSync(quizPath, "utf-8");
      const questionsMatch = content.match(
        /export\s+const\s+questions\s*(?::\s*QuizQuestion\[\])?\s*=\s*(\[[\s\S]*?\]);/m
      );
      if (!questionsMatch?.[1]) continue;

      let arrayStr = questionsMatch[1];
      arrayStr = arrayStr.replace(/\/\/[^\n]*/g, "");
      arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, "");
      arrayStr = arrayStr.replace(/,\s*([}\]])/g, "$1");
      let prev = "";
      while (prev !== arrayStr) {
        prev = arrayStr;
        arrayStr = arrayStr.replace(/"([^"]*)"\s*\+\s*"([^"]*)"/g, '"$1$2"');
      }
      arrayStr = arrayStr.replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":');

      const parsed = JSON.parse(arrayStr) as {
        question: string;
        options: string[];
        correct: number;
        explanation: string;
        code?: string;
      }[];

      if (Array.isArray(parsed)) {
        for (const q of parsed) {
          items.push({
            lessonIndex: lesson.index,
            lessonNumber: lesson.number,
            lessonTitle: lesson.title,
            type: "quiz",
            question: q.question,
            code: q.code,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
          });
        }
      }
    } catch {
      // Parse-Fehler oder Datei nicht lesbar — weiter
    }
  }

  // Shuffle und limitieren
  return shuffleArray(items).slice(0, count);
}

// ─── State-Management ───────────────────────────────────────────────────────

/**
 * Lade den Interleave-State aus der JSON-Datei.
 *
 * @param toolsDir - Absoluter Pfad zum tools-Verzeichnis
 * @returns Der geladene oder ein leerer InterleaveState
 */
export function loadInterleaveState(toolsDir: string): InterleaveState {
  const filePath = path.join(toolsDir, STATE_FILENAME);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as Partial<InterleaveState>;

    return {
      lastReviewDate: data.lastReviewDate ?? null,
      totalReviews: data.totalReviews ?? 0,
      recentTemplateIndices: data.recentTemplateIndices ?? [],
    };
  } catch {
    return createEmptyInterleaveState();
  }
}

/**
 * Speichere den Interleave-State in die JSON-Datei.
 *
 * @param toolsDir - Absoluter Pfad zum tools-Verzeichnis
 * @param state - Der zu speichernde InterleaveState
 */
export function saveInterleaveState(
  toolsDir: string,
  state: InterleaveState
): void {
  const filePath = path.join(toolsDir, STATE_FILENAME);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/**
 * Erstelle einen leeren InterleaveState.
 *
 * @returns Neuer, leerer InterleaveState
 */
export function createEmptyInterleaveState(): InterleaveState {
  return {
    lastReviewDate: null,
    totalReviews: 0,
    recentTemplateIndices: [],
  };
}

// ─── Template-Verwaltung ────────────────────────────────────────────────────

/** Internes Format: Template mit Original-Index fuer Tracking */
interface IndexedTemplate {
  originalIndex: number;
  template: ChallengeTemplate;
}

/**
 * Filtere Templates nach abgeschlossenen Lektionen.
 *
 * Ein Template ist nur dann verfuegbar wenn ALLE requiredLessons
 * in der completedSet enthalten sind.
 *
 * @param completedSet - Set mit 1-basierten Lektionsnummern
 * @returns Array mit passenden Templates inkl. Original-Index
 */
function getEligibleTemplates(
  completedSet: Set<number>
): IndexedTemplate[] {
  const result: IndexedTemplate[] = [];

  for (let i = 0; i < challengeTemplates.length; i++) {
    const template = challengeTemplates[i];
    const allRequired = template.requiredLessons.every((l) =>
      completedSet.has(l)
    );

    if (allRequired) {
      result.push({ originalIndex: i, template });
    }
  }

  return result;
}

/**
 * Konvertiere ein ChallengeTemplate in eine InterleaveChallenge.
 *
 * @param template - Das Template aus interleave-data.ts
 * @returns Fertige InterleaveChallenge
 */
function templateToChallenge(
  template: ChallengeTemplate
): InterleaveChallenge {
  return {
    question: template.question,
    code: template.code,
    concepts: [...template.concepts],
    type: template.type,
    answer: template.answer,
    explanation: template.explanation,
  };
}

/**
 * Hole alle verfuegbaren Konzepte aus den Templates.
 *
 * Nuetzlich fuer Statistiken und UI-Anzeige.
 *
 * @returns Sortiertes Array mit eindeutigen Konzept-Namen
 */
export function getAllConcepts(): string[] {
  const concepts = new Set<string>();
  for (const template of challengeTemplates) {
    for (const concept of template.concepts) {
      concepts.add(concept);
    }
  }
  return [...concepts].sort();
}

/**
 * Hole die Anzahl verfuegbarer Templates fuer eine Menge abgeschlossener Lektionen.
 *
 * @param completedLessons - Array mit 1-basierten Lektionsnummern
 * @returns Anzahl verfuegbarer Templates
 */
export function getAvailableTemplateCount(
  completedLessons: number[]
): number {
  const completedSet = new Set(completedLessons);
  return getEligibleTemplates(completedSet).length;
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

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
 * Heutiges Datum im Format "YYYY-MM-DD".
 *
 * @returns Datum-String
 */
function getToday(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Berechne die Anzahl Tage zwischen zwei Datumsangaben.
 *
 * @param dateA - Frueheres Datum im Format "YYYY-MM-DD"
 * @param dateB - Spaeteres Datum im Format "YYYY-MM-DD"
 * @returns Anzahl Tage (positiv wenn dateB nach dateA)
 */
function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
