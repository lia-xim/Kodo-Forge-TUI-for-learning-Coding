/**
 * Watch-Runner fuer das TypeScript-Lernprojekt
 *
 * Funktioniert wie Rustlings: beobachtet Exercise-Dateien,
 * prueft auf offene TODOs, Type-Fehler und Runtime-Fehler,
 * zeigt Fortschritt und Hinweise im Terminal.
 *
 * Nutzung:
 *   npx tsx tools/watch-runner.ts         — Uebersicht aller Lektionen
 *   npx tsx tools/watch-runner.ts 02      — Watch-Mode fuer Lektion 02
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

// ─── ANSI-Farben ────────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  underline: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgCyan: "\x1b[46m",
};

// ─── Konstanten ─────────────────────────────────────────────────────────────

const PLATFORM_ROOT = path.resolve(import.meta.dirname ?? __dirname, "..");
const COURSES_ROOT = path.resolve(PLATFORM_ROOT, "..");
// PROJECT_ROOT wird dynamisch anhand des aktiven Kurses gesetzt
const _platformFile = path.join(PLATFORM_ROOT, "platform.json");
let PROJECT_ROOT = path.join(COURSES_ROOT, "typescript");
try {
  if (fs.existsSync(_platformFile)) {
    const raw = JSON.parse(fs.readFileSync(_platformFile, "utf-8"));
    const active = raw.activeCourse ?? "typescript";
    const course = (raw.courses ?? []).find((c: { id: string; directory: string }) => c.id === active);
    if (course?.directory) {
      PROJECT_ROOT = path.join(COURSES_ROOT, course.directory);
    }
  }
} catch { /* Fallback auf typescript */ }

const TODO_PATTERN = /\/\/\s*TODO:/g;
const BOX_WIDTH = 60;

// ─── Typen ──────────────────────────────────────────────────────────────────

interface LessonInfo {
  /** Ordnername, z.B. "02-primitive-types" */
  dirName: string;
  /** Nummer als String, z.B. "02" */
  number: string;
  /** Titel aus README, z.B. "Primitive Types in TypeScript" */
  title: string;
  /** Absolute Pfade zu den Exercise-Dateien */
  exerciseFiles: string[];
}

interface TodoInfo {
  line: number;
  text: string;
}

interface ExerciseStatus {
  filePath: string;
  fileName: string;
  totalTodos: number;
  remainingTodos: TodoInfo[];
  typeErrors: TypeErrorInfo[];
  runtimeError: string | null;
  passed: boolean;
}

interface TypeErrorInfo {
  file: string;
  line: number;
  col: number;
  code: string;
  message: string;
}

// ─── Haeufige TS-Fehlercodes (deutsch) ──────────────────────────────────────

const TS_ERROR_EXPLANATIONS: Record<string, string> = {
  TS1002: "Unerwartetes Ende der Datei. Pruefe ob alle Klammern und geschweifte Klammern geschlossen sind.",
  TS1005: "Es fehlt ein bestimmtes Zeichen (z.B. Semikolon, Klammer). Pruefe die Syntax.",
  TS1109: "Unerwarteter Ausdruck. Pruefe ob vor diesem Code etwas fehlt.",
  TS1128: "Deklaration oder Anweisung erwartet. Vielleicht ein fehlender Funktionskoerper?",
  TS2304: "Der Name ist nicht definiert. Pruefe die Schreibweise oder ob ein Import fehlt.",
  TS2305: "Dieses Modul exportiert das gewuenschte Element nicht. Pruefe den Export im Quellmodul.",
  TS2314: "Ein Typ-Argument fehlt. Generische Typen brauchen Typ-Parameter in spitzen Klammern <T>.",
  TS2322: "Typ-Zuweisung ungueltig. Der Wert hat einen anderen Typ als die Variable erwartet.",
  TS2339: "Diese Property existiert nicht auf dem Typ. Pruefe die Objektstruktur oder das Interface.",
  TS2345: "Argument-Typ stimmt nicht mit dem Parameter-Typ ueberein. Pruefe die Funktionssignatur.",
  TS2349: "Dieser Ausdruck ist nicht aufrufbar. Pruefe ob es wirklich eine Funktion ist.",
  TS2351: "Dieser Ausdruck ist nicht mit 'new' konstruierbar.",
  TS2355: "Die Funktion muss einen Wert zurueckgeben, da sie keinen void-Rueckgabetyp hat.",
  TS2365: "Operator kann nicht auf diese Typen angewandt werden.",
  TS2366: "Nicht alle Code-Pfade geben einen Wert zurueck. Pruefe alle if/else-Zweige.",
  TS2393: "Doppelte Funktionsimplementierung. Es gibt bereits eine Funktion mit diesem Namen.",
  TS2416: "Die Klasse implementiert das Interface nicht korrekt.",
  TS2451: "Variable wurde bereits deklariert. Verwende einen anderen Namen.",
  TS2532: "Objekt ist moeglicherweise 'undefined'. Pruefe mit einer if-Bedingung.",
  TS2533: "Objekt ist moeglicherweise 'null'. Pruefe mit einer if-Bedingung.",
  TS2551: "Property existiert nicht. Meintest du eine aehnliche Property?",
  TS2554: "Falsche Anzahl an Argumenten. Pruefe die Funktionssignatur.",
  TS2555: "Zu viele Argumente fuer die Funktion uebergeben.",
  TS2556: "Zu wenige Argumente. Spread-Argument muss ein Tuple sein.",
  TS2564: "Property hat keinen Initialisierer und wird nicht im Konstruktor zugewiesen.",
  TS2571: "Typ 'unknown' kann nicht direkt verwendet werden. Pruefe den Typ zuerst mit typeof oder instanceof.",
  TS2683: "'this' hat hier moeglicherweise den Typ 'any'. Gib den Typ von 'this' explizit an.",
  TS2693: "Dieser Name wird als Typ verwendet, ist aber ein Wert. Verwende 'typeof' um den Typ zu bekommen.",
  TS2741: "Eine erforderliche Property fehlt im Objekt.",
  TS2769: "Kein passender Ueberladungs-Kandidat. Keiner der Funktions-Signaturen passt.",
  TS2786: "Dieser Ausdruck kann nicht als JSX-Komponente verwendet werden.",
  TS2820: "Typ 'X' ist nicht zuweisbar an 'Y'. Pruefe ob der Zieltyp korrekt ist.",
  TS7006: "Parameter hat implizit den Typ 'any'. Fuege eine Typ-Annotation hinzu.",
  TS7015: "Index-Ausdruck hat nicht den Typ 'number'. Verwende einen numerischen Index.",
  TS7016: "Keine Typ-Deklaration fuer dieses Modul gefunden. Installiere @types/...",
  TS7031: "Binding-Element hat implizit den Typ 'any'. Fuege eine Typ-Annotation hinzu.",
  TS7053: "Element hat implizit einen 'any'-Typ, weil der Index-Typ nicht passt.",
  TS18046: "Variable ist vom Typ 'unknown'. Pruefe den Typ zuerst (typeof, instanceof).",
  TS18047: "Variable ist moeglicherweise 'null'. Pruefe mit einer if-Bedingung.",
  TS18048: "Variable ist moeglicherweise 'undefined'. Pruefe mit einer if-Bedingung.",
  TS2578: "Nicht genutzter '@ts-expect-error'. Die naechste Zeile hat keinen Fehler mehr — entferne den Kommentar.",
};

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function clearScreen(): void {
  process.stdout.write("\x1Bc");
}

/** Zeichnet eine Box-Zeile mit Inhalt */
function boxLine(text: string, width: number = BOX_WIDTH): string {
  // ANSI-Codes entfernen um echte Laenge zu messen
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, "");
  const padding = Math.max(0, width - 4 - stripped.length);
  return `${c.cyan}\u2551${c.reset}  ${text}${" ".repeat(padding)}${c.cyan}\u2551${c.reset}`;
}

function boxTop(width: number = BOX_WIDTH): string {
  return `${c.cyan}\u2554${"═".repeat(width - 2)}\u2557${c.reset}`;
}

function boxBottom(width: number = BOX_WIDTH): string {
  return `${c.cyan}\u255A${"═".repeat(width - 2)}\u255D${c.reset}`;
}

function boxSeparator(width: number = BOX_WIDTH): string {
  return `${c.cyan}\u2551${"─".repeat(width - 2)}\u2551${c.reset}`;
}

/** Fortschrittsbalken */
function progressBar(done: number, total: number, width: number = 20): string {
  if (total === 0) return "░".repeat(width);
  const filled = Math.round((done / total) * width);
  const empty = width - filled;
  const filledColor = done === total ? c.green : c.yellow;
  return `${filledColor}${"█".repeat(filled)}${c.dim}${"░".repeat(empty)}${c.reset}`;
}

/** Prozent-Anzeige formatiert */
function percentStr(done: number, total: number): string {
  if (total === 0) return `${c.dim}  ---${c.reset}`;
  const pct = Math.round((done / total) * 100);
  const color = pct === 100 ? c.green : pct > 0 ? c.yellow : c.dim;
  return `${color}${String(pct).padStart(3)}%${c.reset}`;
}

// ─── Lektion-Erkennung ─────────────────────────────────────────────────────

function discoverLessons(): LessonInfo[] {
  const entries = fs.readdirSync(PROJECT_ROOT, { withFileTypes: true });
  const lessons: LessonInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^(\d{2})-/);
    if (!match) continue;

    const lessonDir = path.join(PROJECT_ROOT, entry.name);
    const exerciseDir = path.join(lessonDir, "exercises");

    if (!fs.existsSync(exerciseDir)) continue;

    // Titel aus README lesen
    let title = entry.name.replace(/^\d{2}-/, "").replace(/-/g, " ");
    const readmePath = path.join(lessonDir, "README.md");
    if (fs.existsSync(readmePath)) {
      const firstLine = fs.readFileSync(readmePath, "utf-8").split("\n")[0];
      const titleMatch = firstLine.match(/^#\s*Lektion\s*\d+:\s*(.+)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
    }

    // Exercise-Dateien sortiert sammeln
    const exerciseFiles = fs
      .readdirSync(exerciseDir)
      .filter((f) => f.endsWith(".ts"))
      .sort()
      .map((f) => path.join(exerciseDir, f));

    if (exerciseFiles.length > 0) {
      lessons.push({
        dirName: entry.name,
        number: match[1],
        title,
        exerciseFiles,
      });
    }
  }

  return lessons.sort((a, b) => a.number.localeCompare(b.number));
}

function findLesson(query: string): LessonInfo | undefined {
  const lessons = discoverLessons();
  const padded = query.padStart(2, "0");
  return lessons.find((l) => l.number === padded);
}

// ─── TODO-Zaehlung ──────────────────────────────────────────────────────────

function countTodos(filePath: string): TodoInfo[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const todos: TodoInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (/\/\/\s*TODO:/.test(lines[i])) {
      todos.push({
        line: i + 1,
        text: lines[i].trim(),
      });
    }
  }

  return todos;
}

/** Zaehlt die Gesamtzahl an TODOs in allen Dateien einer Lektion */
function countLessonTodos(lesson: LessonInfo): { total: number; remaining: number } {
  let total = 0;
  let remaining = 0;

  for (const file of lesson.exerciseFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const matches = content.match(TODO_PATTERN);
    const count = matches ? matches.length : 0;
    total += count;
    remaining += count;
  }

  // Wenn keine TODOs definiert sind, behandle jede Datei als eine Aufgabe
  if (total === 0) {
    total = lesson.exerciseFiles.length;
  }

  return { total, remaining };
}

// ─── Type-Check ─────────────────────────────────────────────────────────────

/**
 * Cache fuer tsc-Ergebnisse. Da tsc --project das gesamte Projekt prueft,
 * genuegt ein einziger Aufruf pro Check-Zyklus. Der Cache wird vor jedem
 * Zyklus geleert (siehe checkAllExercises).
 */
let tscErrorCache: Map<string, TypeErrorInfo[]> | null = null;

function runTscForProject(): Map<string, TypeErrorInfo[]> {
  const errorsByFile = new Map<string, TypeErrorInfo[]>();

  try {
    const tscPath = path.join(PROJECT_ROOT, "node_modules", ".bin", "tsc");
    const tsconfig = path.join(PROJECT_ROOT, "tsconfig.json");

    execSync(
      `"${tscPath}" --noEmit --pretty false --project "${tsconfig}" 2>&1`,
      {
        cwd: PROJECT_ROOT,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }
    );
  } catch (err: unknown) {
    const output = (err as { stdout?: string }).stdout ?? "";
    const stderrOutput = (err as { stderr?: string }).stderr ?? "";
    const combined = output + "\n" + stderrOutput;

    // Parse tsc-Output: Datei(Zeile,Spalte): error TSxxxx: Nachricht
    const errorLines = combined.split("\n");
    for (const line of errorLines) {
      const match = line.match(
        /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)/
      );
      if (match) {
        const normalizedFile = path.normalize(path.resolve(PROJECT_ROOT, match[1])).toLowerCase();
        const errorInfo: TypeErrorInfo = {
          file: match[1],
          line: parseInt(match[2], 10),
          col: parseInt(match[3], 10),
          code: match[4],
          message: match[5].trim(),
        };

        if (!errorsByFile.has(normalizedFile)) {
          errorsByFile.set(normalizedFile, []);
        }
        errorsByFile.get(normalizedFile)!.push(errorInfo);
      }
    }
  }

  return errorsByFile;
}

function getTypeErrors(filePath: string): TypeErrorInfo[] {
  if (!tscErrorCache) {
    tscErrorCache = runTscForProject();
  }
  const normalizedTarget = path.normalize(filePath).toLowerCase();
  return tscErrorCache.get(normalizedTarget) ?? [];
}

// ─── Runtime-Check ──────────────────────────────────────────────────────────

function runRuntimeCheck(filePath: string): string | null {
  try {
    const tsxPath = path.join(PROJECT_ROOT, "node_modules", ".bin", "tsx");

    execSync(`"${tsxPath}" "${filePath}" 2>&1`, {
      cwd: path.dirname(filePath),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 10000,
    });
    return null;
  } catch (err: unknown) {
    const output = (err as { stdout?: string }).stdout ?? "";
    const stderr = (err as { stderr?: string }).stderr ?? "";
    const combined = (output + "\n" + stderr).trim();

    // Suche nach Assert-Fehlern
    const assertMatch = combined.match(/AssertionError|Assertion failed:?\s*(.*)/i);
    if (assertMatch) {
      return assertMatch[1] || "Assertion fehlgeschlagen";
    }

    // Suche nach allgemeinen Fehlern
    const errorMatch = combined.match(/Error:\s*(.*)/);
    if (errorMatch) {
      return errorMatch[1];
    }

    // Gib die letzten relevanten Zeilen zurueck
    const lines = combined.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length > 0) {
      // Nimm die letzte aussagekraeftige Zeile
      return lines[lines.length > 3 ? lines.length - 3 : 0];
    }

    return "Unbekannter Laufzeitfehler";
  }
}

// ─── Exercise-Pruefung ──────────────────────────────────────────────────────

function checkExercise(filePath: string): ExerciseStatus {
  const fileName = path.basename(filePath);
  const remainingTodos = countTodos(filePath);

  // Type-Check (nutzt gecachtes tsc-Ergebnis fuer den ganzen Zyklus)
  const typeErrors = getTypeErrors(filePath);

  // Runtime nur pruefen wenn keine Type-Fehler (sonst crasht tsx)
  let runtimeError: string | null = null;
  if (typeErrors.length === 0 && remainingTodos.length === 0) {
    runtimeError = runRuntimeCheck(filePath);
  }

  const passed =
    remainingTodos.length === 0 &&
    typeErrors.length === 0 &&
    runtimeError === null;

  return {
    filePath,
    fileName,
    totalTodos: remainingTodos.length, // aktuell verbleibende
    remainingTodos,
    typeErrors,
    runtimeError,
    passed,
  };
}

function checkAllExercises(lesson: LessonInfo): ExerciseStatus[] {
  // Cache leeren, damit tsc einmal fuer den gesamten Zyklus laeuft
  tscErrorCache = null;
  return lesson.exerciseFiles.map((f) => checkExercise(f));
}

// ─── Anzeige: Uebersicht ───────────────────────────────────────────────────

function showOverview(): void {
  clearScreen();
  const lessons = discoverLessons();

  console.log(boxTop());
  console.log(boxLine(`${c.bold}TypeScript Lernen — Uebersicht${c.reset}`));
  console.log(boxBottom());
  console.log();

  // Pruefe alle Lektionen einmal und speichere Ergebnisse
  const lessonResults: { lesson: LessonInfo; done: number; total: number }[] = [];

  for (const lesson of lessons) {
    const statuses = checkAllExercises(lesson);
    const totalExercises = statuses.length;
    const doneExercises = statuses.filter((s) => s.passed).length;
    lessonResults.push({ lesson, done: doneExercises, total: totalExercises });

    const bar = progressBar(doneExercises, totalExercises);
    const pct = percentStr(doneExercises, totalExercises);
    const titleTruncated =
      lesson.title.length > 28
        ? lesson.title.substring(0, 25) + "..."
        : lesson.title;

    const icon =
      doneExercises === totalExercises
        ? `${c.green}\u2713${c.reset}`
        : doneExercises > 0
          ? `${c.yellow}\u25CB${c.reset}`
          : `${c.dim}\u25CB${c.reset}`;

    console.log(
      `  ${icon} ${c.bold}${lesson.number}${c.reset}  ${titleTruncated.padEnd(30)} ${bar} ${pct}`
    );
  }

  console.log();
  console.log(
    `  ${c.dim}Starte mit:${c.reset} ${c.cyan}npx tsx tools/watch-runner.ts ${c.bold}<nummer>${c.reset}`
  );

  // Finde die naechste unfertige Lektion (aus gecachten Ergebnissen)
  const nextIncomplete = lessonResults.find((r) => r.done < r.total);

  if (nextIncomplete) {
    console.log(
      `  ${c.dim}Vorschlag:${c.reset}  ${c.green}npx tsx tools/watch-runner.ts ${nextIncomplete.lesson.number}${c.reset}`
    );
  }

  console.log();
}

// ─── Anzeige: Watch-Mode ────────────────────────────────────────────────────

function showWatchStatus(lesson: LessonInfo, statuses: ExerciseStatus[]): void {
  clearScreen();

  const totalExercises = statuses.length;
  const doneExercises = statuses.filter((s) => s.passed).length;

  // Header
  console.log(boxTop());
  console.log(boxLine(`${c.bold}TypeScript Lernen — Watch Mode${c.reset}`));
  console.log(
    boxLine(
      `${c.dim}Lektion ${lesson.number}: ${lesson.title}${c.reset}`
    )
  );
  console.log(boxBottom());
  console.log();

  // Fortschritt
  const bar = progressBar(doneExercises, totalExercises, 30);
  console.log(
    `  Fortschritt: ${bar} ${c.bold}${doneExercises}/${totalExercises}${c.reset} Uebungen`
  );
  console.log();

  // Datei-Uebersicht
  for (const status of statuses) {
    const icon = status.passed
      ? `${c.green}\u2713${c.reset}`
      : `${c.red}\u2717${c.reset}`;
    const name = status.fileName.replace(/\.ts$/, "");
    const todoInfo =
      status.remainingTodos.length > 0
        ? `${c.yellow}(${status.remainingTodos.length} TODO${status.remainingTodos.length > 1 ? "s" : ""})${c.reset}`
        : "";
    const errInfo =
      status.typeErrors.length > 0
        ? `${c.red}(${status.typeErrors.length} Typ-Fehler)${c.reset}`
        : "";

    console.log(`  ${icon} ${name} ${todoInfo}${errInfo}`);
  }
  console.log();

  // Alle bestanden?
  if (doneExercises === totalExercises) {
    console.log(
      `  ${c.green}${c.bold}\u2728 Alle Uebungen dieser Lektion bestanden! Gut gemacht!${c.reset}`
    );
    console.log();

    // Naechste Lektion vorschlagen
    const allLessons = discoverLessons();
    const currentIdx = allLessons.findIndex((l) => l.number === lesson.number);
    if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
      const next = allLessons[currentIdx + 1];
      console.log(
        `  ${c.dim}Weiter mit:${c.reset} ${c.cyan}npx tsx tools/watch-runner.ts ${next.number}${c.reset}`
      );
      console.log();
    }

    console.log(
      `  ${c.dim}Warte auf Aenderungen... (Ctrl+C zum Beenden)${c.reset}`
    );
    return;
  }

  // Finde die erste nicht bestandene Aufgabe
  const currentExercise = statuses.find((s) => !s.passed);
  if (!currentExercise) return;

  const divider = `  ${c.dim}${"─".repeat(55)}${c.reset}`;
  console.log(divider);
  console.log();

  // Aktuelle Aufgabe anzeigen
  const displayName = currentExercise.fileName.replace(/\.ts$/, "");
  console.log(
    `  ${c.bold}Aktuelle Aufgabe:${c.reset} ${c.cyan}${displayName}${c.reset}`
  );
  console.log();

  // 1. Offene TODOs
  if (currentExercise.remainingTodos.length > 0) {
    console.log(`  ${c.yellow}Offene TODOs:${c.reset}`);
    console.log(`  ${c.dim}\u250C${"─".repeat(53)}\u2510${c.reset}`);

    for (const todo of currentExercise.remainingTodos.slice(0, 5)) {
      const todoText = todo.text.replace(/\/\/\s*TODO:\s*/, "");
      const truncated =
        todoText.length > 49 ? todoText.substring(0, 46) + "..." : todoText;
      console.log(
        `  ${c.dim}\u2502${c.reset} ${c.yellow}Zeile ${String(todo.line).padStart(3)}:${c.reset} ${truncated}`
      );
    }

    if (currentExercise.remainingTodos.length > 5) {
      console.log(
        `  ${c.dim}\u2502${c.reset} ${c.dim}... und ${currentExercise.remainingTodos.length - 5} weitere TODOs${c.reset}`
      );
    }

    console.log(`  ${c.dim}\u2514${"─".repeat(53)}\u2518${c.reset}`);
    console.log();
  }

  // 2. Type-Fehler
  if (currentExercise.typeErrors.length > 0) {
    console.log(`  ${c.red}Typ-Fehler:${c.reset}`);
    console.log(`  ${c.dim}\u250C${"─".repeat(53)}\u2510${c.reset}`);

    for (const err of currentExercise.typeErrors.slice(0, 5)) {
      // Fehler-Nachricht
      const msgLines = wrapText(err.message, 49);
      console.log(
        `  ${c.dim}\u2502${c.reset} ${c.red}Zeile ${err.line}:${c.reset} ${msgLines[0]}`
      );
      for (let i = 1; i < msgLines.length; i++) {
        console.log(
          `  ${c.dim}\u2502${c.reset}           ${msgLines[i]}`
        );
      }

      // Quellcode-Kontext anzeigen
      showSourceContext(currentExercise.filePath, err.line);

      // Erklaerung
      const explanation = TS_ERROR_EXPLANATIONS[err.code];
      if (explanation) {
        console.log(`  ${c.dim}\u2502${c.reset}`);
        const hintLines = wrapText(explanation, 47);
        console.log(
          `  ${c.dim}\u2502${c.reset} ${c.cyan}Tipp:${c.reset} ${hintLines[0]}`
        );
        for (let i = 1; i < hintLines.length; i++) {
          console.log(
            `  ${c.dim}\u2502${c.reset}       ${hintLines[i]}`
          );
        }
      } else {
        console.log(
          `  ${c.dim}\u2502${c.reset} ${c.dim}[${err.code}]${c.reset}`
        );
      }

      // Trennlinie zwischen Fehlern
      if (
        currentExercise.typeErrors.indexOf(err) <
        Math.min(currentExercise.typeErrors.length, 5) - 1
      ) {
        console.log(
          `  ${c.dim}\u2502${" ".repeat(53)}\u2502${c.reset}`
        );
      }
    }

    if (currentExercise.typeErrors.length > 5) {
      console.log(
        `  ${c.dim}\u2502${c.reset} ${c.dim}... und ${currentExercise.typeErrors.length - 5} weitere Fehler${c.reset}`
      );
    }

    console.log(`  ${c.dim}\u2514${"─".repeat(53)}\u2518${c.reset}`);
    console.log();
  }

  // 3. Runtime-Fehler
  if (currentExercise.runtimeError) {
    console.log(`  ${c.red}Laufzeit-Fehler:${c.reset}`);
    console.log(`  ${c.dim}\u250C${"─".repeat(53)}\u2510${c.reset}`);

    const errLines = wrapText(currentExercise.runtimeError, 51);
    for (const line of errLines) {
      console.log(`  ${c.dim}\u2502${c.reset} ${c.red}${line}${c.reset}`);
    }

    console.log(`  ${c.dim}\u2514${"─".repeat(53)}\u2518${c.reset}`);
    console.log();
  }

  // Hinweis
  console.log(
    `  ${c.dim}Datei oeffnen: ${c.reset}${c.underline}${currentExercise.filePath}${c.reset}`
  );
  console.log();
  console.log(
    `  ${c.dim}Warte auf Aenderungen... (Ctrl+C zum Beenden)${c.reset}`
  );
}

/** Zeigt den Quellcode-Kontext um eine bestimmte Zeile */
function showSourceContext(filePath: string, errorLine: number): void {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const startLine = Math.max(0, errorLine - 3);
    const endLine = Math.min(lines.length - 1, errorLine + 1);

    console.log(`  ${c.dim}\u2502${c.reset}`);
    for (let i = startLine; i <= endLine; i++) {
      const lineNum = String(i + 1).padStart(4);
      const lineContent = lines[i];
      const truncated =
        lineContent.length > 44
          ? lineContent.substring(0, 41) + "..."
          : lineContent;

      if (i === errorLine - 1) {
        // Fehler-Zeile hervorheben
        console.log(
          `  ${c.dim}\u2502${c.reset} ${c.red}${c.bold}${lineNum} >${c.reset} ${c.red}${truncated}${c.reset}`
        );
      } else {
        console.log(
          `  ${c.dim}\u2502${c.reset} ${c.dim}${lineNum}  ${truncated}${c.reset}`
        );
      }
    }
  } catch {
    // Quellcode nicht lesbar — ignorieren
  }
}

/** Bricht langen Text in Zeilen mit maximaler Breite um */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length + word.length + 1 > maxWidth && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current.length > 0 ? `${current} ${word}` : word;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

// ─── Watch-Mode ─────────────────────────────────────────────────────────────

function startWatch(lesson: LessonInfo): void {
  // Initiale Pruefung
  let statuses = checkAllExercises(lesson);
  showWatchStatus(lesson, statuses);

  // Debounce-Timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const DEBOUNCE_MS = 500;

  const exerciseDir = path.join(
    PROJECT_ROOT,
    lesson.dirName,
    "exercises"
  );

  // Beobachte das Exercise-Verzeichnis
  const watcher = fs.watch(exerciseDir, { recursive: false }, (_event, filename) => {
    if (!filename || !filename.endsWith(".ts")) return;

    // Debounce: Warte bis Aenderungen abgeschlossen sind
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      statuses = checkAllExercises(lesson);
      showWatchStatus(lesson, statuses);
    }, DEBOUNCE_MS);
  });

  // Cleanup bei Beendigung
  process.on("SIGINT", () => {
    watcher.close();
    console.log();
    console.log(`  ${c.dim}Watch beendet.${c.reset}`);
    console.log();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    watcher.close();
    process.exit(0);
  });
}

// ─── Hauptprogramm ──────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Uebersichts-Modus
    showOverview();
    return;
  }

  const query = args[0];

  // Hilfe
  if (query === "--help" || query === "-h") {
    console.log();
    console.log(`  ${c.bold}TypeScript Lernen — Watch Runner${c.reset}`);
    console.log();
    console.log(`  ${c.cyan}Nutzung:${c.reset}`);
    console.log(`    npx tsx tools/watch-runner.ts           Uebersicht aller Lektionen`);
    console.log(`    npx tsx tools/watch-runner.ts ${c.bold}<nr>${c.reset}      Watch-Mode fuer eine Lektion`);
    console.log();
    console.log(`  ${c.cyan}Beispiele:${c.reset}`);
    console.log(`    npx tsx tools/watch-runner.ts 01        Lektion 01`);
    console.log(`    npx tsx tools/watch-runner.ts 02        Lektion 02`);
    console.log();
    return;
  }

  // Lektion finden
  const lesson = findLesson(query);

  if (!lesson) {
    console.error();
    console.error(
      `  ${c.red}Lektion "${query}" nicht gefunden.${c.reset}`
    );
    console.error();

    const lessons = discoverLessons();
    console.error(`  ${c.dim}Verfuegbare Lektionen:${c.reset}`);
    for (const l of lessons) {
      console.error(`    ${c.cyan}${l.number}${c.reset} — ${l.title}`);
    }
    console.error();
    process.exit(1);
  }

  // Watch starten
  console.log(
    `  ${c.dim}Starte Watch-Mode fuer Lektion ${lesson.number}...${c.reset}`
  );
  startWatch(lesson);
}

main();
