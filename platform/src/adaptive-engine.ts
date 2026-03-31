/**
 * Adaptive Engine — Inhaltstiefe und Scaffolding-Steuerung
 *
 * Verwaltet den adaptiven Lernzustand:
 *  - Tiefe pro Sektion ("kurz" / "standard" / "vollständig")
 *  - Performance pro Konzept (Erfolgsquote, letztes Datum)
 *  - Hint-Level pro Exercise (steigt bei Fehlern, sinkt bei Erfolgen)
 *  - Scaffolding-Level pro Konzept
 *  - Empfehlungen fuer naechste Schritte
 *
 * State wird als JSON in tools/adaptive-state.json persistiert.
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Typen ──────────────────────────────────────────────────────────────────

/** Inhaltstiefe fuer eine Sektion */
export type ContentDepth = "kurz" | "standard" | "vollständig";

/**
 * Gesamter adaptiver Zustand des Lernsystems.
 *
 * Wird in tools/adaptive-state.json persistiert und bei jeder
 * Interaktion aktualisiert.
 */
export interface AdaptiveState {
  /** Tiefe pro Sektion: Schluessel ist "lessonIdx-sectionIdx", Wert ist die Tiefe */
  sectionDepths: Record<string, ContentDepth>;
  /**
   * Performance pro Konzept.
   * Schluessel ist der Konzept-Name, Wert enthaelt Statistiken.
   */
  conceptScores: Record<
    string,
    { correct: number; total: number; lastSeen: string }
  >;
  /**
   * Hint-Level pro Exercise.
   * Schluessel ist "lessonIdx-sectionIdx-exerciseIdx",
   * Wert ist das aktuelle Hint-Level (0 = keine Hints, aufsteigend).
   */
  hintLevels: Record<string, number>;
}

/** Empfehlung fuer den naechsten Lernschritt */
export interface Recommendation {
  /** Art der Empfehlung */
  type: "section" | "review" | "misconception";
  /** Ziel: Sektions-Key, Konzept-Name, oder Lektions-Key */
  target: string;
  /** Begruendung auf Deutsch */
  reason: string;
}

// ─── Konstanten ─────────────────────────────────────────────────────────────

const STATE_FILENAME = "adaptive-state.json";

/**
 * Schwellenwerte fuer Scaffolding-Berechnung.
 *
 * - Erfolgsquote < 30%  ->  Level 3 (Worked Example zuerst)
 * - Erfolgsquote < 50%  ->  Level 2 (starke Hints)
 * - Erfolgsquote < 70%  ->  Level 1 (leichte Hints)
 * - Erfolgsquote >= 70% ->  Level 0 (kein Scaffolding)
 */
const SCAFFOLDING_THRESHOLDS = {
  LEVEL_3: 0.3,
  LEVEL_2: 0.5,
  LEVEL_1: 0.7,
} as const;

/**
 * Mindestanzahl an Antworten bevor Scaffolding angepasst wird.
 * Verhindert vorschnelle Anpassung bei wenigen Datenpunkten.
 */
const MIN_ANSWERS_FOR_SCAFFOLDING = 2;

/**
 * Schwellenwert fuer Review-Empfehlung.
 * Konzepte mit einer Erfolgsquote unter diesem Wert werden zur Wiederholung empfohlen.
 */
const REVIEW_THRESHOLD = 0.6;

/**
 * Tage nach denen ein Konzept als "vergessen" gilt und erneut angeboten wird.
 */
const FORGET_DAYS = 7;

// ─── State laden und speichern ──────────────────────────────────────────────

/**
 * Lade den adaptiven State aus der JSON-Datei.
 *
 * Gibt einen leeren State zurueck falls die Datei nicht existiert
 * oder nicht gelesen werden kann.
 *
 * @param toolsDir - Absoluter Pfad zum tools-Verzeichnis
 * @returns Der geladene oder ein leerer AdaptiveState
 */
export function loadAdaptiveState(toolsDir: string): AdaptiveState {
  const filePath = path.join(toolsDir, STATE_FILENAME);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as Partial<AdaptiveState>;

    return {
      sectionDepths: data.sectionDepths ?? {},
      conceptScores: data.conceptScores ?? {},
      hintLevels: data.hintLevels ?? {},
    };
  } catch {
    return createEmptyState();
  }
}

/**
 * Speichere den adaptiven State in die JSON-Datei.
 *
 * Schreibt den State formatiert (2 Spaces Einrueckung) in die Datei.
 *
 * @param toolsDir - Absoluter Pfad zum tools-Verzeichnis
 * @param state - Der zu speichernde AdaptiveState
 */
export function saveAdaptiveState(
  toolsDir: string,
  state: AdaptiveState
): void {
  const filePath = path.join(toolsDir, STATE_FILENAME);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/**
 * Erstelle einen leeren AdaptiveState.
 *
 * @returns Neuer, leerer AdaptiveState
 */
export function createEmptyState(): AdaptiveState {
  return {
    sectionDepths: {},
    conceptScores: {},
    hintLevels: {},
  };
}

// ─── Sektionstiefe ──────────────────────────────────────────────────────────

/**
 * Setze die Inhaltstiefe fuer eine Sektion.
 *
 * @param state - Aktueller AdaptiveState (wird direkt mutiert)
 * @param lessonIndex - 0-basierter Lektionsindex
 * @param sectionIndex - 0-basierter Sektionsindex
 * @param depth - Gewuenschte Inhaltstiefe
 */
export function setSectionDepth(
  state: AdaptiveState,
  lessonIndex: number,
  sectionIndex: number,
  depth: ContentDepth
): void {
  const key = `${lessonIndex}-${sectionIndex}`;
  state.sectionDepths[key] = depth;
}

/**
 * Hole die Inhaltstiefe fuer eine Sektion.
 *
 * @param state - Aktueller AdaptiveState
 * @param lessonIndex - 0-basierter Lektionsindex
 * @param sectionIndex - 0-basierter Sektionsindex
 * @returns Die gespeicherte Tiefe oder "standard" als Fallback
 */
export function getSectionDepth(
  state: AdaptiveState,
  lessonIndex: number,
  sectionIndex: number
): ContentDepth {
  const key = `${lessonIndex}-${sectionIndex}`;
  return state.sectionDepths[key] ?? "standard";
}

// ─── Konzept-Scores ─────────────────────────────────────────────────────────

/**
 * Aktualisiere den Konzept-Score nach einer Antwort.
 *
 * Erhoeht den Zaehler fuer korrekte und/oder gesamte Antworten
 * und aktualisiert das Datum der letzten Interaktion.
 *
 * @param state - Aktueller AdaptiveState (wird direkt mutiert)
 * @param concept - Name des Konzepts (z.B. "type-erasure", "strict-mode")
 * @param correct - Ob die Antwort korrekt war
 */
export function updateConceptScore(
  state: AdaptiveState,
  concept: string,
  correct: boolean
): void {
  const today = getToday();

  if (!state.conceptScores[concept]) {
    state.conceptScores[concept] = {
      correct: 0,
      total: 0,
      lastSeen: today,
    };
  }

  const score = state.conceptScores[concept];
  score.total += 1;
  if (correct) {
    score.correct += 1;
  }
  score.lastSeen = today;
}

/**
 * Berechne die Erfolgsquote fuer ein Konzept.
 *
 * @param state - Aktueller AdaptiveState
 * @param concept - Name des Konzepts
 * @returns Erfolgsquote als Zahl zwischen 0.0 und 1.0, oder null wenn keine Daten
 */
export function getConceptSuccessRate(
  state: AdaptiveState,
  concept: string
): number | null {
  const score = state.conceptScores[concept];
  if (!score || score.total === 0) {
    return null;
  }
  return score.correct / score.total;
}

// ─── Hint-Levels ────────────────────────────────────────────────────────────

/**
 * Hole das aktuelle Hint-Level fuer eine Exercise.
 *
 * @param state - Aktueller AdaptiveState
 * @param exerciseKey - Schluessel im Format "lessonIdx-sectionIdx-exerciseIdx"
 * @returns Aktuelles Hint-Level (0 = keine Hints)
 */
export function getHintLevel(
  state: AdaptiveState,
  exerciseKey: string
): number {
  return state.hintLevels[exerciseKey] ?? 0;
}

/**
 * Passe das Hint-Level fuer eine Exercise an.
 *
 * Bei Fehlern wird das Level erhoeht (max 3),
 * bei Erfolgen wird es verringert (min 0).
 *
 * @param state - Aktueller AdaptiveState (wird direkt mutiert)
 * @param exerciseKey - Schluessel im Format "lessonIdx-sectionIdx-exerciseIdx"
 * @param wasCorrect - Ob die Antwort korrekt war
 */
export function adjustHintLevel(
  state: AdaptiveState,
  exerciseKey: string,
  wasCorrect: boolean
): void {
  const current = state.hintLevels[exerciseKey] ?? 0;

  if (wasCorrect) {
    // Bei Erfolg: Level senken, aber nicht unter 0
    state.hintLevels[exerciseKey] = Math.max(0, current - 1);
  } else {
    // Bei Fehler: Level erhoehen, aber nicht ueber 3
    state.hintLevels[exerciseKey] = Math.min(3, current + 1);
  }
}

// ─── Scaffolding ────────────────────────────────────────────────────────────

/**
 * Berechne das Scaffolding-Level fuer ein Konzept.
 *
 * Basiert auf der bisherigen Erfolgsquote:
 *  - Level 0: Kein Scaffolding (>= 70% korrekt)
 *  - Level 1: Leichte Hints (50-69% korrekt)
 *  - Level 2: Starke Hints (30-49% korrekt)
 *  - Level 3: Worked Example zuerst (< 30% korrekt)
 *
 * Bei weniger als MIN_ANSWERS_FOR_SCAFFOLDING Antworten
 * wird Level 1 (leichte Hints) als Standardwert zurueckgegeben.
 *
 * @param state - Aktueller AdaptiveState
 * @param concept - Name des Konzepts
 * @returns Scaffolding-Level von 0 (kein Scaffolding) bis 3 (maximale Hilfe)
 */
export function getScaffoldingLevel(
  state: AdaptiveState,
  concept: string
): number {
  const score = state.conceptScores[concept];

  // Zu wenige Daten: Standard-Scaffolding
  if (!score || score.total < MIN_ANSWERS_FOR_SCAFFOLDING) {
    return 1;
  }

  const rate = score.correct / score.total;

  if (rate < SCAFFOLDING_THRESHOLDS.LEVEL_3) {
    return 3;
  }
  if (rate < SCAFFOLDING_THRESHOLDS.LEVEL_2) {
    return 2;
  }
  if (rate < SCAFFOLDING_THRESHOLDS.LEVEL_1) {
    return 1;
  }
  return 0;
}

// ─── Empfehlungen ───────────────────────────────────────────────────────────

/**
 * Berechne den empfohlenen naechsten Lernschritt.
 *
 * Prioritaeten:
 *  1. Misconception-Review: Konzepte mit Erfolgsquote < 60%
 *  2. Vergessene Konzepte: Nicht gesehen seit > FORGET_DAYS Tagen
 *  3. Naechste verfuegbare Sektion im Curriculum
 *
 * @param state - Aktueller AdaptiveState
 * @param completedSections - Bereits abgeschlossene Sektions-Keys ("lessonIdx-sectionIdx")
 * @param availableSections - Alle verfuegbaren Sektions-Keys
 * @returns Empfehlung mit Typ, Ziel und Begruendung
 */
export function getRecommendation(
  state: AdaptiveState,
  completedSections: string[],
  availableSections: string[]
): Recommendation {
  const today = getToday();
  const completedSet = new Set(completedSections);

  // 1. Pruefe auf Misconceptions (schwache Konzepte)
  const weakConcept = findWeakestConcept(state);
  if (weakConcept) {
    return {
      type: "misconception",
      target: weakConcept.concept,
      reason:
        `Das Konzept "${weakConcept.concept}" hat eine Erfolgsquote von ` +
        `${Math.round(weakConcept.rate * 100)}%. ` +
        `Eine gezielte Wiederholung wird empfohlen.`,
    };
  }

  // 2. Pruefe auf vergessene Konzepte
  const forgottenConcept = findForgottenConcept(state, today);
  if (forgottenConcept) {
    return {
      type: "review",
      target: forgottenConcept,
      reason:
        `Das Konzept "${forgottenConcept}" wurde seit mehr als ` +
        `${FORGET_DAYS} Tagen nicht wiederholt. ` +
        `Ein kurzer Review staerkt das Langzeitgedaechtnis.`,
    };
  }

  // 3. Naechste verfuegbare Sektion
  const nextSection = findNextSection(completedSet, availableSections);
  if (nextSection) {
    return {
      type: "section",
      target: nextSection,
      reason: "Naechste Sektion im Curriculum.",
    };
  }

  // Fallback: Alle Sektionen abgeschlossen
  return {
    type: "review",
    target: "all",
    reason:
      "Alle verfuegbaren Sektionen sind abgeschlossen. " +
      "Ein Gesamtreview wird empfohlen.",
  };
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

/**
 * Finde das schwaechste Konzept mit Erfolgsquote unter REVIEW_THRESHOLD.
 *
 * @param state - Aktueller AdaptiveState
 * @returns Schwachstes Konzept mit Rate, oder null wenn keins unter Schwellenwert
 */
function findWeakestConcept(
  state: AdaptiveState
): { concept: string; rate: number } | null {
  let weakest: { concept: string; rate: number } | null = null;

  for (const [concept, score] of Object.entries(state.conceptScores)) {
    if (score.total < MIN_ANSWERS_FOR_SCAFFOLDING) {
      continue;
    }

    const rate = score.correct / score.total;
    if (rate < REVIEW_THRESHOLD) {
      if (!weakest || rate < weakest.rate) {
        weakest = { concept, rate };
      }
    }
  }

  return weakest;
}

/**
 * Finde ein Konzept das seit mehr als FORGET_DAYS Tagen nicht gesehen wurde.
 *
 * @param state - Aktueller AdaptiveState
 * @param today - Heutiges Datum im Format "YYYY-MM-DD"
 * @returns Name des vergessenen Konzepts oder null
 */
function findForgottenConcept(
  state: AdaptiveState,
  today: string
): string | null {
  let oldest: { concept: string; daysSince: number } | null = null;

  for (const [concept, score] of Object.entries(state.conceptScores)) {
    const daysSince = daysBetween(score.lastSeen, today);

    if (daysSince > FORGET_DAYS) {
      if (!oldest || daysSince > oldest.daysSince) {
        oldest = { concept, daysSince };
      }
    }
  }

  return oldest?.concept ?? null;
}

/**
 * Finde die naechste noch nicht abgeschlossene Sektion.
 *
 * Sortiert die verfuegbaren Sektionen numerisch und gibt
 * die erste nicht-abgeschlossene zurueck.
 *
 * @param completedSet - Set mit abgeschlossenen Sektions-Keys
 * @param availableSections - Alle verfuegbaren Sektions-Keys
 * @returns Naechster Sektions-Key oder null
 */
function findNextSection(
  completedSet: Set<string>,
  availableSections: string[]
): string | null {
  // Sortiere numerisch: "0-0", "0-1", "1-0", "1-1", ...
  const sorted = [...availableSections].sort((a, b) => {
    const [aLesson, aSection] = a.split("-").map(Number);
    const [bLesson, bSection] = b.split("-").map(Number);
    if (aLesson !== bLesson) return aLesson - bLesson;
    return aSection - bSection;
  });

  for (const key of sorted) {
    if (!completedSet.has(key)) {
      return key;
    }
  }

  return null;
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
