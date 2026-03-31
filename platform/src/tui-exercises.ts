/**
 * tui-exercises.ts — Exercise Menu, Hints, Watch-Runner Integration
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { stripAnsi } from "./markdown-renderer.ts";
import {
  c, padR, truncate, flushScreen, renderHeader, renderFooter,
  boxTop, bLine, bEmpty,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, progress, saveProgress,
  updateTermSize, W, H,
  countExerciseProgress, loadMisconceptions, loadCompletionProblems,
  sessionStats, PROJECT_ROOT, PLATFORM_ROOT,
} from "./tui-state.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { openInVSCode, runChildProcess } from "./tui-utils.ts";
import { renderLessonMenu } from "./tui-lesson-menu.ts";
import { renderMisconceptions, renderCompletionProblem } from "./tui-challenges.ts";
import { SHOW_CURSOR } from "./tui-render.ts";

// ─── Exercise Menu ─────────────────────────────────────────────────────────

export function renderExerciseMenu(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "exercisemenu" }>;
  const { lessonIndex, selectedIndex } = screen;
  const lesson = lessons[lessonIndex];
  if (!lesson) return;
  const w = W();
  const h = H();

  const exProgress = countExerciseProgress(lesson);
  const mcCount = loadMisconceptions(lessonIndex).length;
  const cpCount = loadCompletionProblems(lessonIndex).length;

  lines.push(renderHeader(` Exercises: Lektion ${lesson.number}`, `${lesson.title} `));
  lines.push(boxTop(w));
  lines.push(bEmpty(w));
  lines.push(bLine(`  ${c.bold}${c.cyan}Waehle deine Stufe:${c.reset}`, w));
  lines.push(bEmpty(w));

  const s1Marker = selectedIndex === 0 ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  lines.push(bLine(`  ${s1Marker} ${c.bold}[1]${c.reset} Worked Examples      ${c.dim}— Lesen & Nachvollziehen${c.reset}`, w));
  lines.push(bLine(`       ${c.dim}(Empfohlen wenn du die Theorie gerade gelesen hast)${c.reset}`, w));
  lines.push(bEmpty(w));

  const s2Marker = selectedIndex === 1 ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  const cpStatus = cpCount > 0 ? `${c.dim}${cpCount} verfuegbar${c.reset}` : `${c.dim}noch nicht verfuegbar${c.reset}`;
  lines.push(bLine(`  ${s2Marker} ${c.bold}[2]${c.reset} Completion Problems  ${c.dim}— Luecken fuellen${c.reset}      ${cpStatus}`, w));
  lines.push(bLine(`       ${c.dim}(Der naechste Schritt nach Worked Examples)${c.reset}`, w));
  lines.push(bEmpty(w));

  const s3Marker = selectedIndex === 2 ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  const exStatus = exProgress.total > 0 ? `${exProgress.solved}/${exProgress.total}` : `${c.dim}keine${c.reset}`;
  lines.push(bLine(`  ${s3Marker} ${c.bold}[3]${c.reset} Full Exercises       ${c.dim}— Selbst schreiben${c.reset}     ${exStatus}`, w));
  lines.push(bLine(`       ${c.dim}(Starte den Watch-Runner in VS Code)${c.reset}`, w));
  lines.push(bEmpty(w));

  const s4Marker = selectedIndex === 3 ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  const mcStatus = mcCount > 0 ? `${c.dim}${mcCount} verfuegbar${c.reset}` : `${c.dim}noch nicht verfuegbar${c.reset}`;
  lines.push(bLine(`  ${s4Marker} ${c.bold}[4]${c.reset} Misconceptions       ${c.dim}— Fallen erkennen${c.reset}     ${mcStatus}`, w));
  lines.push(bLine(`       ${c.dim}(Teste dein Verstaendnis mit subtilen Fehlern)${c.reset}`, w));
  lines.push(bEmpty(w));

  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));

  lines.push(...renderFooter([
    `${c.bold}[1-4]${c.reset} Stufe waehlen`,
    `${c.bold}[\u2191\u2193]${c.reset} Navigieren`,
    `${c.bold}[Enter]${c.reset} Oeffnen`,
    `${c.bold}[\u2190/Esc]${c.reset} Zurueck`,
  ]));
  flushScreen(lines);
}

export function handleExerciseMenuInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "exercisemenu" }>;
  const { lessonIndex } = screen;

  if (key.name === "up") { screen.selectedIndex = Math.max(0, screen.selectedIndex - 1); renderExerciseMenu(); return; }
  if (key.name === "down") { screen.selectedIndex = Math.min(3, screen.selectedIndex + 1); renderExerciseMenu(); return; }

  if (key.name === "escape" || key.name === "backspace" || key.name === "left") {
    setCurrentScreen({ type: "lesson", lessonIndex, selectedIndex: 0 });
    renderLessonMenu(lessonIndex);
    return;
  }

  const openLevel = (level: number): void => {
    switch (level) {
      case 0: {
        const lesson = lessons[lessonIndex];
        if (lesson && lesson.exampleFiles.length > 0) {
          openInVSCode(path.join(PROJECT_ROOT, lesson.dirName, "examples"));
        }
        break;
      }
      case 1: {
        const cps = loadCompletionProblems(lessonIndex);
        process.stdout.write(SHOW_CURSOR);
        setCurrentScreen({
          type: "completion", lessonIndex, problems: cps,
          currentProblem: 0, currentBlank: 0, userInput: "",
          filledBlanks: [], showingHint: false, showingSolution: false, score: 0,
        });
        renderCompletionProblem();
        break;
      }
      case 2: { startExercises(lessonIndex); break; }
      case 3: {
        const mcs = loadMisconceptions(lessonIndex);
        setCurrentScreen({
          type: "misconceptions", lessonIndex, misconceptions: mcs,
          currentIndex: 0, answered: false, selectedOption: -1,
          showingResolution: false, score: 0,
        });
        renderMisconceptions();
        break;
      }
    }
  };

  if (key.name === "enter") { openLevel(screen.selectedIndex); return; }

  const numMap: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
  const level = numMap[key.raw];
  if (level !== undefined) { openLevel(level); return; }

  if (key.name === "q") {
    setCurrentScreen({ type: "lesson", lessonIndex, selectedIndex: 0 });
    renderLessonMenu(lessonIndex);
    return;
  }
}

function startExercises(lessonIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  const exercisesDir = path.join(PROJECT_ROOT, lesson.dirName, "exercises");
  if (fs.existsSync(exercisesDir)) { openInVSCode(exercisesDir); }

  runChildProcess(
    path.join(PLATFORM_ROOT, "src", "watch-runner.ts"),
    [lesson.number],
    () => {
      const exBefore = progress.exercises[lesson.number];
      const ex = countExerciseProgress(lesson);
      const prevSolved = exBefore?.solved ?? 0;
      if (ex.solved > prevSolved) { sessionStats.exercisesSolved += ex.solved - prevSolved; }
      progress.exercises[lesson.number] = ex;
      saveProgress();
      setCurrentScreen({ type: "lesson", lessonIndex, selectedIndex: 0 });
      renderLessonMenu(lessonIndex);
    }
  );
}

// ─── Hints Screen ──────────────────────────────────────────────────────────

export function startHints(lessonIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  const hintsPath = path.join(PROJECT_ROOT, lesson.dirName, "hints.json");
  if (!fs.existsSync(hintsPath)) return;

  let hintsData: Record<string, Record<string, string[]>>;
  try { hintsData = JSON.parse(fs.readFileSync(hintsPath, "utf-8")); } catch { return; }

  const exercises = Object.keys(hintsData);
  if (exercises.length === 0) return;

  const firstExercise = exercises[0];
  const firstTasks = Object.keys(hintsData[firstExercise] || {});
  const firstHints = firstTasks.length > 0 ? hintsData[firstExercise][firstTasks[0]] || [] : [];

  setCurrentScreen({
    type: "hints", lessonIndex, exercises, selectedExercise: 0,
    selectedTask: 0, hintsData, currentHints: firstHints, shownHintCount: 1,
  });
  renderHintsScreen();
}

function renderHintsScreen(): void {
  updateTermSize();
  const screen = currentScreen as Extract<Screen, { type: "hints" }>;
  const { lessonIndex, exercises, selectedExercise, selectedTask, hintsData, currentHints, shownHintCount } = screen;
  const lesson = lessons[lessonIndex];
  const lines: string[] = [];
  const w = W();
  const h = H();

  const header = ` Lektion ${lesson.number}: ${lesson.title} — Hints `;
  lines.push(`${c.bgGray}${c.white}${c.bold}${header.padEnd(w)}${c.reset}`);
  lines.push("");

  const leftW = Math.min(38, Math.floor(w * 0.35));
  const rightW = w - leftW - 3;

  const leftLines: string[] = [];
  leftLines.push(`${c.bold}${c.cyan} Exercises${c.reset}`);
  leftLines.push(`${c.dim} ${"─".repeat(leftW - 2)}${c.reset}`);

  const currentExercise = exercises[selectedExercise] || "";
  const tasks = Object.keys(hintsData[currentExercise] || {});

  for (let i = 0; i < exercises.length; i++) {
    const exName = exercises[i].replace("exercises/", "").replace(".ts", "");
    const marker = i === selectedExercise ? `${c.cyan}▸${c.reset}` : " ";
    const style = i === selectedExercise ? `${c.bold}${c.white}` : c.dim;
    leftLines.push(` ${marker} ${style}${exName}${c.reset}`);

    if (i === selectedExercise) {
      for (let t = 0; t < tasks.length; t++) {
        const tMarker = t === selectedTask ? `${c.yellow}▸${c.reset}` : " ";
        const tStyle = t === selectedTask ? `${c.bold}${c.yellow}` : c.dim;
        leftLines.push(`     ${tMarker} ${tStyle}Aufgabe ${tasks[t]}${c.reset}`);
      }
    }
  }

  const rightLines: string[] = [];
  rightLines.push(`${c.bold}${c.yellow} Hints für Aufgabe ${tasks[selectedTask] || "?"}${c.reset}`);
  rightLines.push(`${c.dim} ${"─".repeat(rightW - 2)}${c.reset}`);
  rightLines.push("");

  if (currentHints.length === 0) {
    rightLines.push(`  ${c.dim}Keine Hints verfügbar.${c.reset}`);
  } else {
    const showing = Math.min(shownHintCount, currentHints.length);
    for (let h2 = 0; h2 < showing; h2++) {
      rightLines.push(`  ${c.yellow}${c.bold}Hint ${h2 + 1}/${currentHints.length}:${c.reset}`);
      const words = currentHints[h2].split(" ");
      let line = "  ";
      for (const word of words) {
        if (stripAnsi(line).length + word.length + 1 > rightW - 2) { rightLines.push(line); line = "  " + word; }
        else { line += (line === "  " ? "" : " ") + word; }
      }
      if (line.trim()) rightLines.push(line);
      rightLines.push("");
    }
    if (showing < currentHints.length) {
      rightLines.push(`  ${c.dim}Noch ${currentHints.length - showing} weitere Hints.${c.reset}`);
      rightLines.push(`  ${c.dim}Drücke ${c.bold}[N]${c.reset}${c.dim} für den nächsten Hint.${c.reset}`);
    } else { rightLines.push(`  ${c.green}Alle Hints angezeigt.${c.reset}`); }
  }

  const maxRows = Math.max(leftLines.length, rightLines.length);
  for (let r = 0; r < Math.min(maxRows, h - 5); r++) {
    const left = r < leftLines.length ? padR(leftLines[r], leftW) : " ".repeat(leftW);
    const right = r < rightLines.length ? rightLines[r] : "";
    lines.push(`${left} ${c.dim}│${c.reset} ${right}`);
  }

  while (lines.length < h - 3) lines.push("");

  lines.push(`${c.dim}${"─".repeat(w)}${c.reset}`);
  lines.push(` ${c.bold}[↑↓]${c.reset} Exercise  ${c.bold}[←→]${c.reset} Aufgabe  ${c.bold}[N]${c.reset} Nächster Hint  ${c.bold}[R]${c.reset} Reset  ${c.bold}[Esc/Q]${c.reset} Zurück`);
  lines.push(`${c.dim}${"─".repeat(w)}${c.reset}`);

  flushScreen(lines);
}

export function handleHintsInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "hints" }>;
  const { lessonIndex, exercises, selectedExercise, hintsData } = screen;
  const currentExercise = exercises[selectedExercise] || "";
  const tasks = Object.keys(hintsData[currentExercise] || {});

  if (key.name === "escape" || key.name === "q" || key.name === "backspace") {
    setCurrentScreen({ type: "lesson", lessonIndex, selectedIndex: 0 });
    renderLessonMenu(lessonIndex);
    return;
  }
  if (key.name === "up") {
    if (screen.selectedExercise > 0) { screen.selectedExercise--; screen.selectedTask = 0; updateHintSelection(screen); }
    renderHintsScreen(); return;
  }
  if (key.name === "down") {
    if (screen.selectedExercise < exercises.length - 1) { screen.selectedExercise++; screen.selectedTask = 0; updateHintSelection(screen); }
    renderHintsScreen(); return;
  }
  if (key.name === "left") {
    if (screen.selectedTask > 0) { screen.selectedTask--; updateHintSelection(screen); }
    renderHintsScreen(); return;
  }
  if (key.name === "right") {
    if (screen.selectedTask < tasks.length - 1) { screen.selectedTask++; updateHintSelection(screen); }
    renderHintsScreen(); return;
  }
  if (key.name === "n") {
    if (screen.shownHintCount < screen.currentHints.length) { screen.shownHintCount++; }
    renderHintsScreen(); return;
  }
  if (key.name === "r") { screen.shownHintCount = 1; renderHintsScreen(); return; }
}

function updateHintSelection(screen: Extract<Screen, { type: "hints" }>): void {
  const exercise = screen.exercises[screen.selectedExercise] || "";
  const tasks = Object.keys(screen.hintsData[exercise] || {});
  const task = tasks[screen.selectedTask] || "";
  screen.currentHints = (screen.hintsData[exercise] || {})[task] || [];
  screen.shownHintCount = 1;
}
