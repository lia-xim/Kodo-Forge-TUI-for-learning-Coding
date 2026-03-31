/**
 * Hint-System fuer TypeScript-Exercises
 *
 * Zeigt progressive Hinweise fuer Aufgaben, ohne die Loesung zu verraten.
 * Beim ersten Aufruf bekommst du Hint 1, beim zweiten Hint 2, usw.
 *
 * Nutzung:
 *   npx tsx tools/hint.ts <lektion> <exercise> <aufgabe>
 *   npx tsx tools/hint.ts 02 01 3
 *   npm run hint -- 02 01 3
 *
 * Optionen:
 *   --reset    Setzt den Hint-Zaehler fuer diese Aufgabe zurueck
 *   --reset-all  Setzt ALLE Hint-Zaehler zurueck
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// --- Terminal-Farben ---

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

// --- Pfade ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLATFORM_ROOT = path.resolve(__dirname, "..");
const COURSES_ROOT = path.resolve(PLATFORM_ROOT, "..");
const STATE_DIR = path.join(PLATFORM_ROOT, "state");
// ROOT_DIR wird dynamisch anhand des aktiven Kurses gesetzt
const _platformFile = path.join(PLATFORM_ROOT, "platform.json");
let ROOT_DIR = path.join(COURSES_ROOT, "typescript");
try {
  if (fs.existsSync(_platformFile)) {
    const raw = JSON.parse(fs.readFileSync(_platformFile, "utf-8"));
    const active = raw.activeCourse ?? "typescript";
    const course = (raw.courses ?? []).find((co: { id: string; directory: string }) => co.id === active);
    if (course?.directory) {
      ROOT_DIR = path.join(COURSES_ROOT, course.directory);
    }
  }
} catch { /* Fallback auf typescript */ }
const USAGE_FILE = path.resolve(STATE_DIR, "hint-usage.json");

// --- Lektionsverzeichnis-Mapping ---

const LEKTION_DIRS: Record<string, string> = {
  "01": "01-setup-und-erste-schritte",
  "02": "02-primitive-types",
  "03": "03-type-annotations-und-inference",
  "04": "04-arrays-und-tuples",
  "05": "05-objects-und-interfaces",
};

// --- Typen ---

interface HintsFile {
  [exerciseFile: string]: {
    [aufgabe: string]: string[];
  };
}

interface HintUsage {
  [key: string]: number; // key = "lektion:exercise:aufgabe" -> Anzahl bereits gesehener Hints
}

// --- Hilfsfunktionen ---

function loadUsage(): HintUsage {
  try {
    const raw = fs.readFileSync(USAGE_FILE, "utf-8");
    return JSON.parse(raw) as HintUsage;
  } catch {
    return {};
  }
}

function saveUsage(usage: HintUsage): void {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2), "utf-8");
}

function findExerciseFile(lektionDir: string, exerciseNr: string): string | null {
  const exercisesDir = path.join(ROOT_DIR, lektionDir, "exercises");

  if (!fs.existsSync(exercisesDir)) {
    return null;
  }

  const files = fs.readdirSync(exercisesDir).filter((f) => f.endsWith(".ts"));
  const prefix = exerciseNr.padStart(2, "0");

  const match = files.find((f) => f.startsWith(prefix + "-"));
  return match ?? null;
}

function listAvailableLektionen(): void {
  console.log(`\n  ${c.cyan}${c.bold}Verfuegbare Lektionen:${c.reset}\n`);

  for (const [nr, dir] of Object.entries(LEKTION_DIRS)) {
    const hintsPath = path.join(ROOT_DIR, dir, "hints.json");
    const hasHints = fs.existsSync(hintsPath);
    const marker = hasHints ? `${c.green}(Hints vorhanden)${c.reset}` : `${c.dim}(keine Hints)${c.reset}`;
    console.log(`    ${c.bold}${nr}${c.reset}  ${dir}  ${marker}`);
  }

  console.log();
}

function listAvailableExercises(lektionNr: string, lektionDir: string): void {
  const hintsPath = path.join(ROOT_DIR, lektionDir, "hints.json");

  if (!fs.existsSync(hintsPath)) {
    console.log(`\n  ${c.red}Keine Hints fuer Lektion ${lektionNr} gefunden.${c.reset}\n`);
    return;
  }

  const hints: HintsFile = JSON.parse(fs.readFileSync(hintsPath, "utf-8"));

  console.log(`\n  ${c.cyan}${c.bold}Lektion ${lektionNr} — Verfuegbare Exercises:${c.reset}\n`);

  for (const [file, aufgaben] of Object.entries(hints)) {
    const aufgabenNummern = Object.keys(aufgaben).sort();
    console.log(
      `    ${c.bold}${file}${c.reset}  ${c.dim}(Aufgaben: ${aufgabenNummern.join(", ")})${c.reset}`
    );
  }

  console.log(`\n  ${c.dim}Nutzung: npx tsx tools/hint.ts ${lektionNr} <exercise-nr> <aufgabe-nr>${c.reset}\n`);
}

// --- Box-Zeichnung ---

function padRight(str: string, len: number): string {
  // Zaehle nur sichtbare Zeichen (ohne ANSI-Escape-Codes)
  const visibleLength = str.replace(/\x1b\[[0-9;]*m/g, "").length;
  const padding = Math.max(0, len - visibleLength);
  return str + " ".repeat(padding);
}

function printHintBox(
  lektionNr: string,
  exerciseFile: string,
  aufgabeNr: string,
  hintIndex: number,
  totalHints: number,
  hintText: string
): void {
  const exerciseName = exerciseFile.replace(/\.ts$/, "");
  const innerWidth = 50;

  const titleLine = `  Hint fuer Aufgabe ${aufgabeNr}`;
  const subtitleLine = `  Lektion ${lektionNr} - ${exerciseName}`;
  const hintCountLine = `  Hint ${hintIndex + 1}/${totalHints}:`;
  const remainingHints = totalHints - hintIndex - 1;

  // Breche langen Hint-Text um
  const hintWords = hintText.split(" ");
  const hintLines: string[] = [];
  let currentLine = "";

  for (const word of hintWords) {
    if ((currentLine + " " + word).trim().length > innerWidth - 4) {
      hintLines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  }
  if (currentLine.trim()) {
    hintLines.push(currentLine.trim());
  }

  // Berechne Box-Breite (Minimum innerWidth, aber breiter wenn noetig)
  const allLines = [titleLine, subtitleLine, hintCountLine, ...hintLines.map((l) => `  ${l}`)];
  const maxContentLen = Math.max(innerWidth, ...allLines.map((l) => l.length)) + 2;

  const topBorder = `${c.yellow}+${"=".repeat(maxContentLen)}+${c.reset}`;
  const midBorder = `${c.yellow}+${"-".repeat(maxContentLen)}+${c.reset}`;
  const bottomBorder = `${c.yellow}+${"=".repeat(maxContentLen)}+${c.reset}`;
  const emptyLine = `${c.yellow}|${c.reset}${" ".repeat(maxContentLen)}${c.yellow}|${c.reset}`;

  console.log();
  console.log(topBorder);
  console.log(
    `${c.yellow}|${c.reset} ${c.bold}${c.cyan}${padRight(titleLine.trim(), maxContentLen - 2)}${c.reset} ${c.yellow}|${c.reset}`
  );
  console.log(
    `${c.yellow}|${c.reset} ${c.dim}${padRight(subtitleLine.trim(), maxContentLen - 2)}${c.reset} ${c.yellow}|${c.reset}`
  );
  console.log(midBorder);
  console.log(emptyLine);
  console.log(
    `${c.yellow}|${c.reset} ${c.bold}${c.magenta}${padRight(hintCountLine.trim(), maxContentLen - 2)}${c.reset} ${c.yellow}|${c.reset}`
  );

  for (const line of hintLines) {
    console.log(
      `${c.yellow}|${c.reset} ${padRight(`  ${line}`, maxContentLen - 1)}${c.yellow}|${c.reset}`
    );
  }

  console.log(emptyLine);

  if (remainingHints > 0) {
    const moreText = `  Noch ${remainingHints} weitere${remainingHints === 1 ? "r" : ""} Hint${remainingHints === 1 ? "" : "s"} verfuegbar.`;
    const againText = "  Nochmal aufrufen fuer den naechsten Hint.";
    console.log(
      `${c.yellow}|${c.reset} ${c.green}${padRight(moreText, maxContentLen - 2)}${c.reset} ${c.yellow}|${c.reset}`
    );
    console.log(
      `${c.yellow}|${c.reset} ${c.dim}${padRight(againText, maxContentLen - 2)}${c.reset} ${c.yellow}|${c.reset}`
    );
  } else {
    const noMoreText = "  Das war der letzte Hint fuer diese Aufgabe.";
    const tryText = "  Versuche es jetzt selbst!";
    console.log(
      `${c.yellow}|${c.reset} ${c.red}${padRight(noMoreText, maxContentLen - 2)}${c.reset} ${c.yellow}|${c.reset}`
    );
    console.log(
      `${c.yellow}|${c.reset} ${c.bold}${padRight(tryText, maxContentLen - 2)}${c.reset} ${c.yellow}|${c.reset}`
    );
  }

  console.log(bottomBorder);
  console.log();
}

// --- Hauptlogik ---

function main(): void {
  const args = process.argv.slice(2);

  // --reset-all: Alle Zaehler zuruecksetzen
  if (args.includes("--reset-all")) {
    saveUsage({});
    console.log(`\n  ${c.green}Alle Hint-Zaehler wurden zurueckgesetzt.${c.reset}\n`);
    return;
  }

  // Keine Argumente: Hilfe anzeigen
  if (args.length === 0) {
    console.log(`
  ${c.bold}${c.cyan}TypeScript Hint-System${c.reset}

  ${c.bold}Nutzung:${c.reset}
    npx tsx tools/hint.ts ${c.yellow}<lektion> <exercise> <aufgabe>${c.reset}
    npx tsx tools/hint.ts 02 01 3

  ${c.bold}Optionen:${c.reset}
    ${c.yellow}--reset${c.reset}       Setzt den Zaehler fuer die angegebene Aufgabe zurueck
    ${c.yellow}--reset-all${c.reset}   Setzt ALLE Hint-Zaehler zurueck

  ${c.bold}Beispiele:${c.reset}
    npx tsx tools/hint.ts 02 01 3         ${c.dim}# Hint fuer Lektion 02, Exercise 01, Aufgabe 3${c.reset}
    npx tsx tools/hint.ts 01 01 1 --reset ${c.dim}# Zaehler zuruecksetzen${c.reset}
    npm run hint -- 02 01 3               ${c.dim}# Ueber npm script${c.reset}
`);
    listAvailableLektionen();
    return;
  }

  // Nur Lektionsnummer: Exercises anzeigen
  const lektionNr = args[0].padStart(2, "0");
  const lektionDir = LEKTION_DIRS[lektionNr];

  if (!lektionDir) {
    console.log(`\n  ${c.red}Lektion ${lektionNr} nicht gefunden.${c.reset}`);
    listAvailableLektionen();
    return;
  }

  if (args.length === 1) {
    listAvailableExercises(lektionNr, lektionDir);
    return;
  }

  if (args.length < 3 && !args.includes("--reset")) {
    console.log(`\n  ${c.red}Zu wenige Argumente. Nutzung: npx tsx tools/hint.ts <lektion> <exercise> <aufgabe>${c.reset}\n`);
    return;
  }

  const exerciseNr = args[1].padStart(2, "0");
  const aufgabeNr = args[2];
  const shouldReset = args.includes("--reset");

  // Hints-Datei laden
  const hintsPath = path.join(ROOT_DIR, lektionDir, "hints.json");

  if (!fs.existsSync(hintsPath)) {
    console.log(`\n  ${c.red}Keine Hints fuer Lektion ${lektionNr} gefunden.${c.reset}`);
    console.log(`  ${c.dim}Erwartet: ${hintsPath}${c.reset}\n`);
    return;
  }

  const allHints: HintsFile = JSON.parse(fs.readFileSync(hintsPath, "utf-8"));

  // Exercise-Datei finden
  const exerciseFile = findExerciseFile(lektionDir, exerciseNr);

  if (!exerciseFile) {
    console.log(`\n  ${c.red}Exercise ${exerciseNr} in Lektion ${lektionNr} nicht gefunden.${c.reset}`);
    listAvailableExercises(lektionNr, lektionDir);
    return;
  }

  const exerciseKey = `exercises/${exerciseFile}`;
  const exerciseHints = allHints[exerciseKey];

  if (!exerciseHints) {
    console.log(`\n  ${c.red}Keine Hints fuer ${exerciseKey} gefunden.${c.reset}`);
    console.log(`  ${c.dim}Verfuegbare Exercise-Keys:${c.reset}`);
    for (const key of Object.keys(allHints)) {
      console.log(`    ${c.dim}- ${key}${c.reset}`);
    }
    console.log();
    return;
  }

  const aufgabeHints = exerciseHints[aufgabeNr];

  if (!aufgabeHints || aufgabeHints.length === 0) {
    console.log(`\n  ${c.red}Keine Hints fuer Aufgabe ${aufgabeNr} in ${exerciseKey} gefunden.${c.reset}`);
    const verfuegbar = Object.keys(exerciseHints).sort();
    console.log(`  ${c.dim}Verfuegbare Aufgaben: ${verfuegbar.join(", ")}${c.reset}\n`);
    return;
  }

  // Usage-Key
  const usageKey = `${lektionNr}:${exerciseNr}:${aufgabeNr}`;
  const usage = loadUsage();

  // Reset-Modus
  if (shouldReset) {
    delete usage[usageKey];
    saveUsage(usage);
    console.log(`\n  ${c.green}Hint-Zaehler fuer Aufgabe ${aufgabeNr} (Lektion ${lektionNr}, Exercise ${exerciseNr}) zurueckgesetzt.${c.reset}\n`);
    return;
  }

  // Aktuellen Hint-Index bestimmen
  const currentIndex = usage[usageKey] ?? 0;

  if (currentIndex >= aufgabeHints.length) {
    // Alle Hints bereits gezeigt — zeige den letzten nochmal
    printHintBox(
      lektionNr,
      exerciseFile,
      aufgabeNr,
      aufgabeHints.length - 1,
      aufgabeHints.length,
      aufgabeHints[aufgabeHints.length - 1]
    );
    console.log(
      `  ${c.dim}Du hast bereits alle Hints fuer diese Aufgabe gesehen.${c.reset}`
    );
    console.log(
      `  ${c.dim}Nutze --reset um den Zaehler zurueckzusetzen.${c.reset}\n`
    );
    return;
  }

  // Hint anzeigen
  printHintBox(
    lektionNr,
    exerciseFile,
    aufgabeNr,
    currentIndex,
    aufgabeHints.length,
    aufgabeHints[currentIndex]
  );

  // Zaehler erhoehen
  usage[usageKey] = currentIndex + 1;
  saveUsage(usage);
}

main();
