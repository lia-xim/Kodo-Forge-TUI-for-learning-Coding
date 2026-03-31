/**
 * Tracing Engine — Code-Tracing-System fuer TypeScript-Lernende
 *
 * Ermoeglicht schrittweises Durchgehen von Code-Beispielen mit Fragen
 * zu Variablen-Zustaenden, Typen und Laufzeitverhalten.
 *
 * Features:
 *  - Laden von TracingExercise-Daten aus Lektionsverzeichnissen
 *  - Validierung der geladenen Daten
 *  - Formatierung fuer die Anzeige im TUI
 *  - Statistik-Berechnung ueber Schwierigkeit und Konzepte
 *
 * Die Engine laedt tracing-data.ts Dateien aus Lektionsverzeichnissen
 * und stellt sie fuer das Lernsystem bereit.
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Typen ──────────────────────────────────────────────────────────────────

/**
 * Ein einzelner Tracing-Schritt durch den Code.
 *
 * Jeder Schritt repraesentiert eine Zeile (oder Gruppe von Zeilen),
 * die ausgefuehrt wird, und stellt eine Frage an den Lernenden.
 */
export interface TracingStep {
  /** Welche Zeile wird ausgefuehrt (0-basiert, bezogen auf code[]) */
  lineIndex: number;
  /** Frage an den Lernenden */
  question: string;
  /** Erwartete Antwort */
  expectedAnswer: string;
  /** Aktueller Variablen-Zustand nach dieser Zeile */
  variables: Record<string, string>;
  /** Erklaerung warum die Antwort korrekt ist */
  explanation: string;
}

/**
 * Eine vollstaendige Tracing-Exercise.
 *
 * Enthaelt den Code, die Schritte und Metadaten fuer die Anzeige
 * und Zuordnung im Lernsystem.
 */
export interface TracingExercise {
  /** Eindeutige ID (z.B. "02-typeof-narrowing") */
  id: string;
  /** Anzeige-Titel */
  title: string;
  /** Kurze Beschreibung was getraced wird */
  description: string;
  /** Die Code-Zeilen (jedes Element = eine Zeile) */
  code: string[];
  /** Schritte durch den Code */
  steps: TracingStep[];
  /** Verwandtes Konzept (fuer adaptive Engine) */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

/**
 * Modul-Format einer tracing-data.ts Datei.
 *
 * Jede Lektion kann eine tracing-data.ts Datei exportieren mit:
 *   export const tracingExercises: TracingExercise[];
 */
interface TracingModule {
  tracingExercises: TracingExercise[];
}

// ─── Tracing-Daten laden ────────────────────────────────────────────────────

/**
 * Lade Tracing-Exercises fuer eine bestimmte Lektion.
 *
 * Sucht im Lektionsverzeichnis nach einer tracing-data.ts Datei
 * und parst die TracingExercise-Objekte daraus.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param lessonDir - Name des Lektionsverzeichnisses (z.B. "02-primitive-types")
 * @returns Array mit TracingExercise-Objekten (leer wenn keine Daten)
 */
export function loadTracingExercises(
  projectRoot: string,
  lessonDir: string
): TracingExercise[] {
  const tracingPath = path.join(projectRoot, lessonDir, "tracing-data.ts");

  if (!fs.existsSync(tracingPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(tracingPath, "utf-8");
    const exercises = parseTracingFile(content);
    return exercises.filter(isValidExercise);
  } catch {
    return [];
  }
}

/**
 * Lade Tracing-Exercises aus allen Lektionen.
 *
 * Durchsucht das Projekt-Root nach Lektionsverzeichnissen (beginnen mit
 * einer zweistelligen Nummer) und laedt die Tracing-Daten aus jeder Lektion.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @returns Array mit allen TracingExercises, sortiert nach Lektion und Schwierigkeit
 */
export function loadAllTracingExercises(
  projectRoot: string
): TracingExercise[] {
  const lessonDirs = getLessonDirectories(projectRoot);
  const allExercises: TracingExercise[] = [];

  for (const dir of lessonDirs) {
    const exercises = loadTracingExercises(projectRoot, dir);
    allExercises.push(...exercises);
  }

  return allExercises;
}

/**
 * Lade Tracing-Exercises fuer eine Lektion anhand des Lektionsindex.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param lessonIndex - 0-basierter Index der Lektion
 * @returns Array mit TracingExercise-Objekten (leer wenn keine Daten oder Index ungueltig)
 */
export function loadTracingExercisesByIndex(
  projectRoot: string,
  lessonIndex: number
): TracingExercise[] {
  const lessonDirs = getLessonDirectories(projectRoot);

  if (lessonIndex < 0 || lessonIndex >= lessonDirs.length) {
    return [];
  }

  return loadTracingExercises(projectRoot, lessonDirs[lessonIndex]);
}

// ─── Formatierung ───────────────────────────────────────────────────────────

/**
 * Formatiere eine TracingExercise als lesbaren Text fuer die Anzeige.
 *
 * Zeigt den Code mit Zeilennummern und Metadaten an.
 *
 * @param exercise - Die zu formatierende Exercise
 * @returns Mehrzeiliger formatierter String
 */
export function formatExercise(exercise: TracingExercise): string {
  const lines: string[] = [];

  lines.push(`=== ${exercise.title} ===`);
  lines.push(exercise.description);
  lines.push(`Konzept: ${exercise.concept} | Schwierigkeit: ${exercise.difficulty}/5`);
  lines.push("");
  lines.push("Code:");
  lines.push("─".repeat(60));

  for (let i = 0; i < exercise.code.length; i++) {
    const lineNum = String(i + 1).padStart(2, " ");
    lines.push(`  ${lineNum} | ${exercise.code[i]}`);
  }

  lines.push("─".repeat(60));

  return lines.join("\n");
}

/**
 * Formatiere einen einzelnen Tracing-Schritt fuer die Anzeige.
 *
 * Zeigt die aktuelle Zeile hervorgehoben, die Frage, und nach
 * Beantwortung die Erklaerung und den Variablen-Zustand.
 *
 * @param exercise - Die zugehoerige Exercise (fuer Code-Kontext)
 * @param stepIndex - Index des Schritts (0-basiert)
 * @param showAnswer - Ob die Antwort und Erklaerung angezeigt werden soll
 * @returns Mehrzeiliger formatierter String
 */
export function formatStep(
  exercise: TracingExercise,
  stepIndex: number,
  showAnswer: boolean
): string {
  if (stepIndex < 0 || stepIndex >= exercise.steps.length) {
    return "Ungueltiger Schritt-Index.";
  }

  const step = exercise.steps[stepIndex];
  const lines: string[] = [];

  lines.push(`--- Schritt ${stepIndex + 1}/${exercise.steps.length} ---`);
  lines.push("");

  // Code mit hervorgehobener Zeile
  for (let i = 0; i < exercise.code.length; i++) {
    const lineNum = String(i + 1).padStart(2, " ");
    const marker = i === step.lineIndex ? " >>>" : "    ";
    lines.push(`${marker} ${lineNum} | ${exercise.code[i]}`);
  }

  lines.push("");
  lines.push(`Frage: ${step.question}`);

  if (showAnswer) {
    lines.push("");
    lines.push(`Antwort: ${step.expectedAnswer}`);
    lines.push("");
    lines.push(`Erklaerung: ${step.explanation}`);
    lines.push("");

    // Variablen-Zustand anzeigen
    const varEntries = Object.entries(step.variables);
    if (varEntries.length > 0) {
      lines.push("Variablen-Zustand:");
      for (const [varName, varType] of varEntries) {
        lines.push(`  ${varName} = ${varType}`);
      }
    }
  }

  return lines.join("\n");
}

// ─── Statistiken ────────────────────────────────────────────────────────────

/**
 * Zaehle Exercises pro Schwierigkeitsstufe.
 *
 * @param exercises - Array mit TracingExercises
 * @returns Objekt mit Zaehler pro Schwierigkeit (1-5)
 */
export function getDifficultyDistribution(
  exercises: TracingExercise[]
): Record<number, number> {
  const distribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const exercise of exercises) {
    const diff = Math.max(1, Math.min(5, exercise.difficulty));
    distribution[diff] = (distribution[diff] ?? 0) + 1;
  }

  return distribution;
}

/**
 * Sammle alle eindeutigen Konzepte aus den Exercises.
 *
 * @param exercises - Array mit TracingExercises
 * @returns Sortiertes Array mit eindeutigen Konzept-Namen
 */
export function getUniqueConcepts(exercises: TracingExercise[]): string[] {
  const concepts = new Set<string>();
  for (const exercise of exercises) {
    concepts.add(exercise.concept);
  }
  return [...concepts].sort();
}

/**
 * Filtere Exercises nach Konzept.
 *
 * @param exercises - Array mit TracingExercises
 * @param concept - Name des Konzepts
 * @returns Gefilterte Exercises
 */
export function filterByConcept(
  exercises: TracingExercise[],
  concept: string
): TracingExercise[] {
  return exercises.filter((e) => e.concept === concept);
}

/**
 * Filtere Exercises nach Schwierigkeit.
 *
 * @param exercises - Array mit TracingExercises
 * @param minDifficulty - Minimale Schwierigkeit (inklusive)
 * @param maxDifficulty - Maximale Schwierigkeit (inklusive)
 * @returns Gefilterte Exercises
 */
export function filterByDifficulty(
  exercises: TracingExercise[],
  minDifficulty: number,
  maxDifficulty: number
): TracingExercise[] {
  return exercises.filter(
    (e) => e.difficulty >= minDifficulty && e.difficulty <= maxDifficulty
  );
}

/**
 * Berechne die Gesamtanzahl der Tracing-Schritte ueber alle Exercises.
 *
 * @param exercises - Array mit TracingExercises
 * @returns Gesamtanzahl der Schritte
 */
export function getTotalStepCount(exercises: TracingExercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.steps.length, 0);
}

/**
 * Erstelle eine Zusammenfassung der Tracing-Exercises.
 *
 * @param exercises - Array mit TracingExercises
 * @returns Zusammenfassung als mehrzeiliger String
 */
export function getTracingSummary(exercises: TracingExercise[]): string {
  if (exercises.length === 0) {
    return "Keine Tracing-Exercises vorhanden.";
  }

  const dist = getDifficultyDistribution(exercises);
  const concepts = getUniqueConcepts(exercises);
  const totalSteps = getTotalStepCount(exercises);

  const lines: string[] = [
    `Tracing-Exercises gesamt: ${exercises.length}`,
    `Schritte gesamt: ${totalSteps}`,
    "",
    "Schwierigkeitsverteilung:",
    `  Stufe 1 (Grundlagen):     ${dist[1]}`,
    `  Stufe 2 (Einfach):        ${dist[2]}`,
    `  Stufe 3 (Mittel):         ${dist[3]}`,
    `  Stufe 4 (Fortgeschritten): ${dist[4]}`,
    `  Stufe 5 (Experte):        ${dist[5]}`,
    "",
    `Konzepte (${concepts.length}): ${concepts.join(", ")}`,
  ];

  return lines.join("\n");
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

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
 * Pruefe ob eine TracingExercise gueltige Daten enthaelt.
 *
 * Validiert:
 *  - Pflichtfelder sind vorhanden und nicht leer
 *  - Schwierigkeit liegt zwischen 1 und 5
 *  - Mindestens ein Schritt ist vorhanden
 *  - lineIndex-Werte liegen innerhalb des Code-Arrays
 *
 * @param exercise - Zu pruefende Exercise
 * @returns true wenn die Exercise gueltig ist
 */
function isValidExercise(exercise: TracingExercise): boolean {
  if (!exercise.id || !exercise.title || !exercise.concept) {
    return false;
  }

  if (!Array.isArray(exercise.code) || exercise.code.length === 0) {
    return false;
  }

  if (!Array.isArray(exercise.steps) || exercise.steps.length === 0) {
    return false;
  }

  if (exercise.difficulty < 1 || exercise.difficulty > 5) {
    return false;
  }

  // Pruefe dass alle lineIndex-Werte gueltig sind
  for (const step of exercise.steps) {
    if (step.lineIndex < 0 || step.lineIndex >= exercise.code.length) {
      return false;
    }
    if (!step.question || !step.expectedAnswer || !step.explanation) {
      return false;
    }
  }

  return true;
}

/**
 * Parse eine tracing-data.ts Datei synchron.
 *
 * Extrahiert TracingExercise-Objekte aus dem Datei-Inhalt.
 * Verwendet eine JSON-aehnliche Parsing-Strategie, da synchrones
 * import() nicht moeglich ist.
 *
 * Erwartet das Format:
 *   export const tracingExercises: TracingExercise[] = [ { ... } ];
 *
 * @param content - Inhalt der tracing-data.ts Datei
 * @returns Array mit geparsten TracingExercise-Objekten
 */
function parseTracingFile(content: string): TracingExercise[] {
  try {
    // Finde den tracingExercises-Array im Datei-Inhalt
    const exercisesMatch = content.match(
      /export\s+const\s+tracingExercises\s*(?::\s*TracingExercise\[\])?\s*=\s*(\[[\s\S]*\]);?\s*$/m
    );

    if (!exercisesMatch?.[1]) {
      return [];
    }

    let arrayStr = exercisesMatch[1];

    // Entferne einzeilige Kommentare (// ...)
    arrayStr = arrayStr.replace(/\/\/[^\n]*/g, "");
    // Entferne mehrzeilige Kommentare (/* ... */)
    arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, "");

    // Trailing Commas vor ] oder } entfernen (JSON-kompatibel machen)
    arrayStr = arrayStr.replace(/,\s*([}\]])/g, "$1");

    // Einfache String-Konkatenation aufloesen ("a" + "b" -> "ab")
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

    const parsed = JSON.parse(arrayStr) as TracingExercise[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
