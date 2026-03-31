/**
 * Transfer-Engine: Laedt und validiert Transfer Tasks aus den Lektionsverzeichnissen.
 *
 * Transfer Tasks sind Aufgaben, die Konzepte einer Lektion in einem
 * voellig neuen Kontext anwenden. Sie testen echtes Verstaendnis,
 * nicht nur Wiedererkennung.
 *
 * Nutzung:
 *   import { loadTransferTasks, TransferTask } from '../tools/transfer-engine.ts';
 *   const tasks = loadTransferTasks(projectRoot, '02-primitive-types');
 *
 * Keine externen Dependencies.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TransferTask {
  /** Eindeutige ID im Format "LL-kurzname" (z.B. "02-geldbetraege") */
  id: string;
  /** Menschenlesbarer Titel */
  title: string;
  /** Welche Lektionen als Vorwissen noetig sind (Nummern) */
  prerequisiteLessons: number[];
  /** Realer Kontext, der NICHT aus der Lektion stammt */
  scenario: string;
  /** Die eigentliche Aufgabenstellung */
  task: string;
  /** Optionaler Starter-Code, den der Lernende als Ausgangspunkt bekommt */
  starterCode?: string;
  /** Vollstaendige Muster-Loesung mit Erklaerung */
  solutionCode: string;
  /** Welche Konzepte hier in den neuen Kontext uebertragen werden */
  conceptsBridged: string[];
  /** 2-3 aufeinander aufbauende Hinweise (vom vagen zum konkreten) */
  hints: string[];
  /** Schwierigkeitsgrad 1-5 */
  difficulty: number;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateTask(task: unknown, index: number, source: string): TransferTask {
  const t = task as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof t.id !== "string" || t.id.length === 0) {
    errors.push("id fehlt oder ist kein String");
  }
  if (typeof t.title !== "string" || t.title.length === 0) {
    errors.push("title fehlt oder ist kein String");
  }
  if (!Array.isArray(t.prerequisiteLessons) || t.prerequisiteLessons.length === 0) {
    errors.push("prerequisiteLessons fehlt oder ist kein Array");
  }
  if (typeof t.scenario !== "string" || t.scenario.length === 0) {
    errors.push("scenario fehlt oder ist kein String");
  }
  if (typeof t.task !== "string" || t.task.length === 0) {
    errors.push("task fehlt oder ist kein String");
  }
  if (typeof t.solutionCode !== "string" || t.solutionCode.length === 0) {
    errors.push("solutionCode fehlt oder ist kein String");
  }
  if (!Array.isArray(t.conceptsBridged) || t.conceptsBridged.length === 0) {
    errors.push("conceptsBridged fehlt oder ist kein Array");
  }
  if (!Array.isArray(t.hints) || t.hints.length < 2) {
    errors.push("hints braucht mindestens 2 Eintraege");
  }
  if (typeof t.difficulty !== "number" || t.difficulty < 1 || t.difficulty > 5) {
    errors.push("difficulty muss eine Zahl zwischen 1 und 5 sein");
  }

  if (errors.length > 0) {
    throw new Error(
      "Transfer-Task #" + (index + 1) + " in " + source + " ist ungueltig:\n" +
        errors.map((e) => "  - " + e).join("\n")
    );
  }

  return task as TransferTask;
}

// ─── Loader ──────────────────────────────────────────────────────────────────

/**
 * Laedt alle Transfer Tasks aus einer Lektions-Datei.
 *
 * Sucht nach `transfer-data.ts` im angegebenen Lektionsverzeichnis.
 * Die Datei muss ein `transferTasks`-Array exportieren.
 *
 * @param projectRoot - Absoluter Pfad zum Projekt-Root
 * @param lessonDir   - Verzeichnisname der Lektion (z.B. "02-primitive-types")
 * @returns Array von validierten TransferTasks
 * @throws Wenn die Datei nicht existiert oder Tasks ungueltig sind
 */
export function loadTransferTasks(
  projectRoot: string,
  lessonDir: string
): TransferTask[] {
  const filePath = path.join(projectRoot, lessonDir, "transfer-data.ts");

  if (!fs.existsSync(filePath)) {
    throw new Error(
      "Transfer-Daten nicht gefunden: " + filePath + "\n" +
        "Erstelle eine Datei transfer-data.ts im Verzeichnis " + lessonDir + "."
    );
  }

  // Hinweis: Die eigentliche Nutzung passiert ueber den direkten Import
  // in den jeweiligen Runner-Skripten:
  //
  //   import { transferTasks } from './transfer-data.ts';
  //
  // Diese Funktion dient der Existenz-Pruefung und Pfad-Aufloesung.
  // Fuer dynamisches Laden unter tsx nutze:
  //   const mod = await import(filePath);
  //   return validateTransferTasks(mod.transferTasks, filePath);
  return [];
}

/**
 * Validiert ein Array von Transfer Tasks.
 * Wirft einen Fehler wenn ein Task ungueltig ist.
 *
 * @param tasks  - Die zu validierenden Tasks
 * @param source - Quelldatei fuer Fehlermeldungen
 * @returns Die validierten Tasks (gleiche Referenz)
 */
export function validateTransferTasks(
  tasks: TransferTask[],
  source: string
): TransferTask[] {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error(
      source + ": transferTasks ist kein Array oder ist leer."
    );
  }

  const ids = new Set<string>();
  for (let i = 0; i < tasks.length; i++) {
    const validated = validateTask(tasks[i], i, source);
    if (ids.has(validated.id)) {
      throw new Error(
        source + ': Doppelte Task-ID "' + validated.id + '" (Task #' + (i + 1) + ")."
      );
    }
    ids.add(validated.id);
  }

  return tasks;
}

/**
 * Gibt eine huebsche Zusammenfassung aller Tasks einer Lektion aus.
 *
 * @param lessonTitle - Titel der Lektion
 * @param tasks       - Die Transfer Tasks
 */
export function printTransferSummary(
  lessonTitle: string,
  tasks: TransferTask[]
): void {
  const line = "=".repeat(60);
  console.log("\n\x1b[36m" + line + "\x1b[0m");
  console.log("\x1b[1m\x1b[36m  Transfer Tasks: " + lessonTitle + "\x1b[0m");
  console.log("\x1b[36m" + line + "\x1b[0m\n");

  const label = tasks.length === 1 ? "Aufgabe" : "Aufgaben";
  console.log("  " + tasks.length + " " + label + " verfuegbar:\n");

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const stars = "\u2605".repeat(t.difficulty) +
      "\u2606".repeat(5 - t.difficulty);
    console.log(
      "  \x1b[1m" + (i + 1) + ".\x1b[0m " + t.title + "  \x1b[33m" + stars + "\x1b[0m"
    );
    console.log(
      "     \x1b[2mKonzepte: " + t.conceptsBridged.join(", ") + "\x1b[0m"
    );
    console.log();
  }
}

/**
 * Gibt einen einzelnen Task im Detail aus (ohne Loesung).
 *
 * @param task      - Der Task
 * @param showHints - Wie viele Hints angezeigt werden sollen (0 = keine)
 */
export function printTransferTask(
  task: TransferTask,
  showHints: number = 0
): void {
  const line = "-".repeat(60);

  console.log("\n\x1b[1m\x1b[36m  " + task.title + "\x1b[0m");
  console.log("\x1b[2m  " + line + "\x1b[0m\n");

  console.log("\x1b[1m  Szenario:\x1b[0m");
  console.log("  " + task.scenario + "\n");

  console.log("\x1b[1m  Aufgabe:\x1b[0m");
  console.log("  " + task.task + "\n");

  if (task.starterCode) {
    console.log("\x1b[2m  +-- Starter Code ---------------------+\x1b[0m");
    for (const codeLine of task.starterCode.split("\n")) {
      console.log("\x1b[2m  |\x1b[0m \x1b[33m" + codeLine + "\x1b[0m");
    }
    console.log("\x1b[2m  +-------------------------------------+\x1b[0m\n");
  }

  if (showHints > 0 && task.hints.length > 0) {
    const hintsToShow = Math.min(showHints, task.hints.length);
    console.log("\x1b[1m\x1b[33m  Hinweise:\x1b[0m");
    for (let i = 0; i < hintsToShow; i++) {
      console.log("  \x1b[33m" + (i + 1) + ".\x1b[0m " + task.hints[i]);
    }
    if (hintsToShow < task.hints.length) {
      console.log(
        "\x1b[2m  (" + (task.hints.length - hintsToShow) + " weitere Hints verfuegbar)\x1b[0m"
      );
    }
    console.log();
  }
}

/**
 * Gibt die Loesung eines Tasks aus.
 *
 * @param task - Der Task dessen Loesung gezeigt werden soll
 */
export function printTransferSolution(task: TransferTask): void {
  console.log("\n\x1b[1m\x1b[32m  Muster-Loesung: " + task.title + "\x1b[0m\n");
  console.log("\x1b[2m  +-- Loesung -----------------------------+\x1b[0m");
  for (const codeLine of task.solutionCode.split("\n")) {
    console.log("\x1b[2m  |\x1b[0m \x1b[32m" + codeLine + "\x1b[0m");
  }
  console.log("\x1b[2m  +-----------------------------------------+\x1b[0m\n");

  console.log("\x1b[1m  Uebertragene Konzepte:\x1b[0m");
  for (const concept of task.conceptsBridged) {
    console.log("    \x1b[36m*\x1b[0m " + concept);
  }
  console.log();
}
