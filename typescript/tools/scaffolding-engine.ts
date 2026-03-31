/**
 * Scaffolding-Fading Engine
 *
 * Verwaltet das progressive Abbauen von Lernhilfen (Scaffolding Fading).
 * Basiert auf der Zone of Proximal Development: Lerner bekommen genau
 * so viel Hilfe wie noetig, und diese wird schrittweise reduziert.
 *
 * Scaffolding-Stufen:
 *  - Level 3: Worked Example zuerst, dann eigener Versuch
 *  - Level 2: Starke Hints (Schritt-fuer-Schritt-Anleitung sichtbar)
 *  - Level 1: Leichte Hints (Hint-Button verfuegbar, nicht automatisch)
 *  - Level 0: Kein Scaffolding (Lerner arbeitet selbststaendig)
 *
 * Fading-Logik:
 *  - Erfolg erhoeht den Streak-Zaehler
 *  - Misserfolg setzt den Streak zurueck und kann das Level erhoehen
 *  - Bei Erreichen des fadeThreshold wird das Level um 1 gesenkt
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Typen ──────────────────────────────────────────────────────────────────

/**
 * Konfiguration fuer das Scaffolding eines bestimmten Konzepts/einer Exercise.
 */
export interface ScaffoldingConfig {
  /** Aktuelle Scaffolding-Stufe (0-3) */
  level: number;
  /** Anzahl korrekter Antworten in Folge */
  streak: number;
  /** Schwelle um eine Stufe abzubauen (Fading) */
  fadeThreshold: number;
}

/**
 * Bestimmt welche Hilfen bei einer Exercise angezeigt werden.
 */
export interface ActiveScaffolds {
  /** Worked Example vor der eigentlichen Aufgabe zeigen */
  showWorkedExample: boolean;
  /** Schritt-fuer-Schritt-Anleitung sichtbar */
  showStepByStep: boolean;
  /** Hint-Button verfuegbar (Lerner kann klicken) */
  showHintButton: boolean;
  /** Ersten Hint automatisch anzeigen (ohne Button-Klick) */
  autoShowFirstHint: boolean;
}

/**
 * Persistierter State fuer Scaffolding pro Exercise/Konzept.
 */
export interface ScaffoldingState {
  /** Configs pro Schluessel: "lessonIdx-sectionIdx-exerciseIdx" oder Konzept-Name */
  configs: Record<string, ScaffoldingConfig>;
}

// ─── Legacy-Kompatibilitaet ─────────────────────────────────────────────────

/**
 * Legacy-Interface fuer Rueckwaertskompatibilitaet.
 * Entspricht dem alten ScaffoldingLevel-Format.
 */
export interface ScaffoldingLevel {
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
}

/**
 * Legacy-Konstante: Scaffolding-Level-Definitionen.
 * Beibehalten fuer Rueckwaertskompatibilitaet mit bestehendem Code.
 */
export const SCAFFOLDING_LEVELS: ScaffoldingLevel[] = [
  { level: 1, name: "Worked Examples", description: "Lesen & Nachvollziehen" },
  { level: 2, name: "Completion Problems", description: "Luecken fuellen" },
  { level: 3, name: "Full Exercises", description: "Selbst schreiben" },
  { level: 4, name: "Misconceptions", description: "Fallen erkennen" },
];

/**
 * Legacy-Funktion: Empfohlenes Scaffolding-Level basierend auf Fortschritt.
 *
 * Beibehalten fuer Rueckwaertskompatibilitaet. Nutzt intern die neue
 * Logik basierend auf Sektions-Fortschritt.
 *
 * @param _lessonIndex - Index der Lektion
 * @param sectionsRead - Anzahl gelesener Sektionen
 * @param totalSections - Gesamtanzahl Sektionen
 * @returns Empfohlenes Level (1-4)
 */
export function getRecommendedLevel(
  _lessonIndex: number,
  sectionsRead: number,
  totalSections: number
): number {
  if (totalSections === 0) return 1;
  const progress = sectionsRead / totalSections;
  if (progress < 0.25) return 1;
  if (progress < 0.5) return 2;
  if (progress < 0.75) return 3;
  return 4;
}

// ─── Konstanten ─────────────────────────────────────────────────────────────

const STATE_FILENAME = "scaffolding-state.json";

/**
 * Standard-Schwelle fuer Scaffolding-Fading.
 * Nach dieser Anzahl korrekter Antworten in Folge wird das Level gesenkt.
 */
const DEFAULT_FADE_THRESHOLD = 3;

/**
 * Maximales Scaffolding-Level.
 */
const MAX_LEVEL = 3;

/**
 * Minimales Scaffolding-Level.
 */
const MIN_LEVEL = 0;

// ─── Scaffolding-Fading-Logik ───────────────────────────────────────────────

/**
 * Berechne ob das Scaffolding reduziert werden soll.
 *
 * Scaffolding wird reduziert (gefadet) wenn der Lerner
 * mindestens fadeThreshold korrekte Antworten in Folge hat
 * UND das aktuelle Level ueber 0 liegt.
 *
 * @param config - Aktuelle Scaffolding-Konfiguration
 * @returns true wenn das Level gesenkt werden soll
 */
export function shouldFadeScaffolding(config: ScaffoldingConfig): boolean {
  return config.streak >= config.fadeThreshold && config.level > MIN_LEVEL;
}

/**
 * Passe die Scaffolding-Konfiguration nach einer Antwort an.
 *
 * Bei korrekter Antwort:
 *  - Streak wird erhoeht
 *  - Wenn fadeThreshold erreicht: Level wird gesenkt, Streak zurueckgesetzt
 *
 * Bei falscher Antwort:
 *  - Streak wird auf 0 zurueckgesetzt
 *  - Level wird um 1 erhoeht (maximal MAX_LEVEL)
 *
 * Die uebergebene Config wird NICHT mutiert — eine neue wird zurueckgegeben.
 *
 * @param config - Aktuelle Scaffolding-Konfiguration
 * @param wasCorrect - Ob die Antwort korrekt war
 * @returns Neue, angepasste Scaffolding-Konfiguration
 */
export function adjustScaffolding(
  config: ScaffoldingConfig,
  wasCorrect: boolean
): ScaffoldingConfig {
  if (wasCorrect) {
    const newStreak = config.streak + 1;

    // Pruefen ob Fading ausgeloest wird
    if (newStreak >= config.fadeThreshold && config.level > MIN_LEVEL) {
      return {
        level: config.level - 1,
        streak: 0,
        fadeThreshold: config.fadeThreshold,
      };
    }

    return {
      level: config.level,
      streak: newStreak,
      fadeThreshold: config.fadeThreshold,
    };
  }

  // Falsche Antwort: Streak zurueck, Level hoch
  return {
    level: Math.min(MAX_LEVEL, config.level + 1),
    streak: 0,
    fadeThreshold: config.fadeThreshold,
  };
}

/**
 * Bestimme welche Hilfen bei einem bestimmten Scaffolding-Level angezeigt werden.
 *
 * Level-Mapping:
 *  - Level 0: Keine Hilfen (Lerner arbeitet selbststaendig)
 *  - Level 1: Hint-Button verfuegbar (Lerner entscheidet selbst)
 *  - Level 2: Schritt-fuer-Schritt + Hints, erster Hint automatisch
 *  - Level 3: Worked Example + Schritte + automatische Hints
 *
 * @param level - Scaffolding-Level (0-3)
 * @returns Objekt mit den aktiven Hilfen
 */
export function getActiveScaffolds(level: number): ActiveScaffolds {
  // Level auf gueltige Grenzen beschraenken
  const clampedLevel = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));

  switch (clampedLevel) {
    case 3:
      return {
        showWorkedExample: true,
        showStepByStep: true,
        showHintButton: true,
        autoShowFirstHint: true,
      };
    case 2:
      return {
        showWorkedExample: false,
        showStepByStep: true,
        showHintButton: true,
        autoShowFirstHint: true,
      };
    case 1:
      return {
        showWorkedExample: false,
        showStepByStep: false,
        showHintButton: true,
        autoShowFirstHint: false,
      };
    case 0:
    default:
      return {
        showWorkedExample: false,
        showStepByStep: false,
        showHintButton: false,
        autoShowFirstHint: false,
      };
  }
}

// ─── Config-Erstellung ──────────────────────────────────────────────────────

/**
 * Erstelle eine neue Standard-Scaffolding-Konfiguration.
 *
 * Standard-Werte:
 *  - Level 1 (leichte Hints)
 *  - Streak 0
 *  - fadeThreshold: DEFAULT_FADE_THRESHOLD (3)
 *
 * @param initialLevel - Optionales Start-Level (Standard: 1)
 * @param fadeThreshold - Optionaler Schwellenwert (Standard: DEFAULT_FADE_THRESHOLD)
 * @returns Neue ScaffoldingConfig
 */
export function createScaffoldingConfig(
  initialLevel: number = 1,
  fadeThreshold: number = DEFAULT_FADE_THRESHOLD
): ScaffoldingConfig {
  return {
    level: Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, initialLevel)),
    streak: 0,
    fadeThreshold: Math.max(1, fadeThreshold),
  };
}

/**
 * Erstelle eine Scaffolding-Konfiguration basierend auf der Schwierigkeit.
 *
 * Schwierigkeit bestimmt das Start-Level:
 *  - "leicht":  Level 0 (kein Scaffolding)
 *  - "mittel":  Level 1 (leichte Hints)
 *  - "schwer":  Level 2 (starke Hints)
 *  - "komplex": Level 3 (Worked Example)
 *
 * @param difficulty - Schwierigkeitsgrad der Exercise
 * @returns Passende ScaffoldingConfig
 */
export function createConfigForDifficulty(
  difficulty: "leicht" | "mittel" | "schwer" | "komplex"
): ScaffoldingConfig {
  const levelMap: Record<string, number> = {
    leicht: 0,
    mittel: 1,
    schwer: 2,
    komplex: 3,
  };

  return createScaffoldingConfig(levelMap[difficulty] ?? 1);
}

// ─── State-Management ───────────────────────────────────────────────────────

/**
 * Lade den Scaffolding-State aus der JSON-Datei.
 *
 * @param toolsDir - Absoluter Pfad zum tools-Verzeichnis
 * @returns Der geladene oder ein leerer ScaffoldingState
 */
export function loadScaffoldingState(toolsDir: string): ScaffoldingState {
  const filePath = path.join(toolsDir, STATE_FILENAME);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as Partial<ScaffoldingState>;

    return {
      configs: data.configs ?? {},
    };
  } catch {
    return { configs: {} };
  }
}

/**
 * Speichere den Scaffolding-State in die JSON-Datei.
 *
 * @param toolsDir - Absoluter Pfad zum tools-Verzeichnis
 * @param state - Der zu speichernde ScaffoldingState
 */
export function saveScaffoldingState(
  toolsDir: string,
  state: ScaffoldingState
): void {
  const filePath = path.join(toolsDir, STATE_FILENAME);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/**
 * Hole die Scaffolding-Config fuer einen bestimmten Schluessel.
 *
 * Erstellt eine neue Standard-Config falls noch keine existiert.
 *
 * @param state - Aktueller ScaffoldingState
 * @param key - Schluessel (z.B. "0-2-1" fuer Lektion 0, Sektion 2, Exercise 1)
 * @returns Die gespeicherte oder eine neue ScaffoldingConfig
 */
export function getOrCreateConfig(
  state: ScaffoldingState,
  key: string
): ScaffoldingConfig {
  if (state.configs[key]) {
    return state.configs[key];
  }

  const newConfig = createScaffoldingConfig();
  state.configs[key] = newConfig;
  return newConfig;
}

/**
 * Aktualisiere die Scaffolding-Config fuer einen bestimmten Schluessel.
 *
 * @param state - Aktueller ScaffoldingState (wird direkt mutiert)
 * @param key - Schluessel (z.B. "0-2-1")
 * @param config - Neue ScaffoldingConfig
 */
export function updateConfig(
  state: ScaffoldingState,
  key: string,
  config: ScaffoldingConfig
): void {
  state.configs[key] = config;
}

// ─── Hilfs- und Analysefunktionen ───────────────────────────────────────────

/**
 * Berechne den durchschnittlichen Scaffolding-Level ueber alle Configs.
 *
 * Nuetzlich fuer Statistiken und Fortschrittsanzeige.
 *
 * @param state - Aktueller ScaffoldingState
 * @returns Durchschnittliches Level (0.0 - 3.0) oder null wenn keine Configs
 */
export function getAverageLevel(state: ScaffoldingState): number | null {
  const configs = Object.values(state.configs);
  if (configs.length === 0) {
    return null;
  }

  const sum = configs.reduce((acc, cfg) => acc + cfg.level, 0);
  return sum / configs.length;
}

/**
 * Zaehle wie viele Exercises auf jedem Level sind.
 *
 * @param state - Aktueller ScaffoldingState
 * @returns Objekt mit Zaehler pro Level
 */
export function getLevelDistribution(
  state: ScaffoldingState
): Record<number, number> {
  const distribution: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  };

  for (const config of Object.values(state.configs)) {
    const level = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, config.level));
    distribution[level] = (distribution[level] ?? 0) + 1;
  }

  return distribution;
}

/**
 * Beschreibung des Scaffolding-Levels auf Deutsch.
 *
 * @param level - Scaffolding-Level (0-3)
 * @returns Menschenlesbare Beschreibung
 */
export function getLevelDescription(level: number): string {
  const clampedLevel = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));

  switch (clampedLevel) {
    case 3:
      return "Maximale Hilfe: Worked Example + Schritt-fuer-Schritt-Anleitung";
    case 2:
      return "Starke Hilfe: Schritt-fuer-Schritt-Anleitung mit automatischen Hints";
    case 1:
      return "Leichte Hilfe: Hints auf Anfrage verfuegbar";
    case 0:
      return "Selbststaendig: Keine Hilfen noetig";
    default:
      return "Unbekanntes Level";
  }
}

/**
 * Erstelle eine Zusammenfassung des Scaffolding-Fortschritts.
 *
 * @param state - Aktueller ScaffoldingState
 * @returns Zusammenfassung als mehrzeiliger String
 */
export function getProgressSummary(state: ScaffoldingState): string {
  const dist = getLevelDistribution(state);
  const avg = getAverageLevel(state);
  const total = Object.values(dist).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return "Noch keine Exercises bearbeitet.";
  }

  const lines: string[] = [
    `Exercises gesamt: ${total}`,
    `  Level 0 (selbststaendig):   ${dist[0]}`,
    `  Level 1 (leichte Hilfe):    ${dist[1]}`,
    `  Level 2 (starke Hilfe):     ${dist[2]}`,
    `  Level 3 (Worked Examples):  ${dist[3]}`,
  ];

  if (avg !== null) {
    lines.push(`Durchschnittliches Level: ${avg.toFixed(1)}`);
  }

  return lines.join("\n");
}
