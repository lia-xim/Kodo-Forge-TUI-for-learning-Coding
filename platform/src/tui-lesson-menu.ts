/**
 * tui-lesson-menu.ts — Lesson Menu Screen
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { estimateReadTime, renderPreview } from "./markdown-renderer.ts";
import { progressBar as fineProgressBar } from "./visual-utils.ts";
import {
  c, padR, truncate, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter, pctStr,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, progress, saveProgress,
  updateTermSize, W, H, formatSessionTime,
  getBreadcrumb, getSectionKey, getSectionStatus, countExerciseProgress,
  getLessonProgress, loadMisconceptions, pushHistory,
  PROJECT_ROOT, PLATFORM_ROOT,
} from "./tui-state.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { openInVSCode, runChildProcess } from "./tui-utils.ts";
import { openSection, openCheatsheet } from "./tui-section-reader.ts";
import { renderExerciseMenu, startHints } from "./tui-exercises.ts";
import { renderMisconceptions } from "./tui-challenges.ts";
import { renderPretest, renderQuiz } from "./tui-quiz.ts";
import type { QuizQuestion } from "./quiz-runner.ts";
import { getPretestQuestions } from "./pretest-engine.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { SHOW_CURSOR } from "./tui-render.ts";
import { loadCompletionProblems, hasTakenPretest, sessionStats } from "./tui-state.ts";
import { renderCompletionProblem } from "./tui-challenges.ts";

export function renderLessonMenu(lessonIndex: number): void {
  updateTermSize();
  const lines: string[] = [];
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  const screen = currentScreen as {
    type: "lesson";
    lessonIndex: number;
    selectedIndex: number;
  };
  const selectedIdx = screen.selectedIndex;
  const lpct = getLessonProgress(lessonIndex);
  const w = W();
  const h = H();

  const timerStr = formatSessionTime();
  const lessonBarW = Math.max(6, Math.floor(w * 0.12));
  const lessonBar = fineProgressBar(lpct, lessonBarW);
  lines.push(
    renderHeader(
      ` ${getBreadcrumb(currentScreen)}: ${truncate(lesson.title, w - 50)}`,
      `${lessonBar} ${pctStr(lpct)} \u23F1 ${timerStr} `
    )
  );
  lines.push(boxTop(w));
  lines.push(bEmpty(w));

  const totalInnerL = w - 2;
  const leftColW = Math.max(28, Math.floor(totalInnerL * 0.50));
  const rightColW = Math.max(22, totalInnerL - leftColW - 1);

  const leftLines: string[] = [];
  const rightLines: string[] = [];

  leftLines.push(padR(`${c.bold}${c.cyan} Sektionen${c.reset}`, leftColW));
  leftLines.push(`${c.dim} ${"─".repeat(leftColW - 1)}${c.reset}`);

  for (let s = 0; s < lesson.sections.length; s++) {
    const section = lesson.sections[s];
    const key = getSectionKey(lessonIndex, s);
    const status = getSectionStatus(key);
    const isSelected = s === selectedIdx;

    let statusIcon: string;
    if (status === "completed") {
      statusIcon = `${c.green}\u2713${c.reset}`;
    } else if (status === "in_progress") {
      statusIcon = `${c.yellow}\u25B6${c.reset}`;
    } else {
      statusIcon = `${c.dim}\u25CB${c.reset}`;
    }

    let readTime = "";
    try {
      const content = fs.readFileSync(section.filePath, "utf-8");
      readTime = `${c.dim}~${estimateReadTime(content)}m${c.reset}`;
    } catch {
      // ignorieren
    }

    const marker = isSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    const titleMaxLen = Math.max(5, leftColW - 16);
    const displayTitle = truncate(section.title, titleMaxLen);

    const line = `${marker} ${statusIcon} ${s + 1}  ${padR(displayTitle, titleMaxLen)} ${readTime}`;
    leftLines.push(padR(line, leftColW));
  }

  leftLines.push(" ".repeat(leftColW));
  leftLines.push(`${c.dim} ${"─".repeat(leftColW - 1)}${c.reset}`);
  leftLines.push(padR(`${c.bold} Praxis${c.reset}`, leftColW));
  leftLines.push(`${c.dim} ${"─".repeat(leftColW - 1)}${c.reset}`);

  const exProgress = countExerciseProgress(lesson);
  const exText =
    exProgress.total > 0
      ? `${exProgress.solved}/${exProgress.total} geloest`
      : `${c.dim}keine${c.reset}`;
  const exSelected = selectedIdx === lesson.sections.length;
  const exMarker = exSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  leftLines.push(padR(`${exMarker} ${c.bold}[E]${c.reset} Exercises     ${exText}`, leftColW));

  if (lesson.hasQuiz) {
    const quizData = progress.quizzes[lesson.number];
    const quizText = quizData
      ? `Bestes: ${Math.round((quizData.score / quizData.total) * 100)}%`
      : `${c.dim}noch offen${c.reset}`;
    const qSelected = selectedIdx === lesson.sections.length + 1;
    const qMarker = qSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    leftLines.push(padR(`${qMarker} ${c.bold}[Z]${c.reset} Quiz          ${quizText}`, leftColW));
  }

  if (lesson.hasHints) {
    const hIdx = lesson.sections.length + (lesson.hasQuiz ? 2 : 1);
    const hSelected = selectedIdx === hIdx;
    const hMarker = hSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    leftLines.push(padR(`${hMarker} ${c.bold}[H]${c.reset} Hints`, leftColW));
  }

  const hasMisconceptions = fs.existsSync(
    path.join(PROJECT_ROOT, lesson.dirName, "misconceptions.ts")
  );
  if (hasMisconceptions) {
    const mIdx =
      lesson.sections.length +
      (lesson.hasQuiz ? 2 : 1) +
      (lesson.hasHints ? 1 : 0);
    const mSelected = selectedIdx === mIdx;
    const mMarker = mSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    leftLines.push(padR(`${mMarker} ${c.bold}[G]${c.reset} Misconceptions`, leftColW));
  }

  if (lesson.hasCheatsheet) {
    const cIdx =
      lesson.sections.length +
      (lesson.hasQuiz ? 2 : 1) +
      (lesson.hasHints ? 1 : 0) +
      (hasMisconceptions ? 1 : 0);
    const cSelected = selectedIdx === cIdx;
    const cMarker = cSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    leftLines.push(padR(`${cMarker} ${c.bold}[C]${c.reset} Cheatsheet`, leftColW));
  }

  const minLeft = Math.max(leftLines.length, 14);
  while (leftLines.length < minLeft) {
    leftLines.push(" ".repeat(leftColW));
  }

  rightLines.push(`${c.bold}${c.cyan} Vorschau${c.reset}`);
  rightLines.push(`${c.dim} ${"─".repeat(rightColW - 1)}${c.reset}`);

  if (selectedIdx < lesson.sections.length) {
    const section = lesson.sections[selectedIdx];
    rightLines.push(`${c.bold} ${truncate(section.title, rightColW - 2)}${c.reset}`);
    rightLines.push("");

    try {
      const content = fs.readFileSync(section.filePath, "utf-8");
      const previewLines = renderPreview(content, rightColW - 2, minLeft - 6);
      for (const pl of previewLines) {
        const truncLine = truncate(pl, rightColW - 1);
        rightLines.push(` ${truncLine}`);
      }
    } catch {
      rightLines.push(` ${c.dim}(Vorschau nicht verfuegbar)${c.reset}`);
    }
  } else {
    rightLines.push("");
    rightLines.push(` ${c.dim}Waehle eine Sektion${c.reset}`);
    rightLines.push(` ${c.dim}fuer eine Vorschau${c.reset}`);
  }

  while (rightLines.length < minLeft) {
    rightLines.push("");
  }

  const rowCount = Math.max(leftLines.length, rightLines.length);
  for (let row = 0; row < rowCount; row++) {
    const left = row < leftLines.length ? leftLines[row] : "";
    const right = row < rightLines.length ? rightLines[row] : "";
    const merged = `${padR(left, leftColW)}${c.dim}│${c.reset}${padR(right, rightColW)}`;
    lines.push(bLine(merged, w));
  }

  lines.push(bEmpty(w));

  const footerStart = h - 3;
  while (lines.length < footerStart) {
    lines.push(bEmpty(w));
  }

  const shortcuts: string[] = [
    `${c.bold}[1-${lesson.sections.length}]${c.reset} Sektion`,
    `${c.bold}[\u2191\u2193]${c.reset} Navigieren`,
    `${c.bold}[Enter/\u2192]${c.reset} Oeffnen`,
    `${c.bold}[E]${c.reset} Exercises`,
    `${c.bold}[Z]${c.reset} Quiz`,
    `${c.bold}[V]${c.reset} VS Code`,
  ];
  if (lesson.hasHints) shortcuts.push(`${c.bold}[H]${c.reset} Hints`);
  if (hasMisconceptions) shortcuts.push(`${c.bold}[G]${c.reset} Misconceptions`);
  if (lesson.hasCheatsheet) shortcuts.push(`${c.bold}[C]${c.reset} Cheatsheet`);
  shortcuts.push(`${c.bold}[\u2190/Esc]${c.reset} Zurueck`);

  lines.push(...renderFooter(shortcuts));
  flushScreen(lines);
}

export function handleLessonInput(key: ParsedKey): void {
  const screen = currentScreen as {
    type: "lesson";
    lessonIndex: number;
    selectedIndex: number;
  };
  const lesson = lessons[screen.lessonIndex];
  if (!lesson) return;

  let maxIdx = lesson.sections.length - 1;
  maxIdx++; // Exercises
  if (lesson.hasQuiz) maxIdx++;
  if (lesson.hasHints) maxIdx++;
  const lessonHasMisconceptions = fs.existsSync(
    path.join(PROJECT_ROOT, lesson.dirName, "misconceptions.ts")
  );
  if (lessonHasMisconceptions) maxIdx++;
  if (lesson.hasCheatsheet) maxIdx++;

  if (key.name === "up") {
    screen.selectedIndex = Math.max(0, screen.selectedIndex - 1);
    renderLessonMenu(screen.lessonIndex);
    return;
  }
  if (key.name === "down") {
    screen.selectedIndex = Math.min(maxIdx, screen.selectedIndex + 1);
    renderLessonMenu(screen.lessonIndex);
    return;
  }

  if (
    key.name === "escape" ||
    key.name === "backspace" ||
    key.name === "left"
  ) {
    setCurrentScreen({ type: "main", selectedIndex: screen.lessonIndex });
    renderMainMenu();
    return;
  }

  if (key.name === "enter" || key.name === "right") {
    openLessonItem(screen.lessonIndex, screen.selectedIndex);
    return;
  }

  const num = parseInt(key.raw, 10);
  if (num >= 1 && num <= lesson.sections.length) {
    openSection(screen.lessonIndex, num - 1);
    return;
  }

  if (key.name === "e") {
    setCurrentScreen({
      type: "exercisemenu",
      lessonIndex: screen.lessonIndex,
      selectedIndex: 0,
    });
    renderExerciseMenu();
    return;
  }

  if (key.name === "g") {
    const mcs = loadMisconceptions(screen.lessonIndex);
    setCurrentScreen({
      type: "misconceptions",
      lessonIndex: screen.lessonIndex,
      misconceptions: mcs,
      currentIndex: 0,
      answered: false,
      selectedOption: -1,
      showingResolution: false,
      score: 0,
    });
    renderMisconceptions();
    return;
  }

  if (key.name === "z" && lesson.hasQuiz) {
    startQuiz(screen.lessonIndex);
    return;
  }

  if (key.name === "h" && lesson.hasHints) {
    startHints(screen.lessonIndex);
    return;
  }

  if (key.name === "c" && lesson.hasCheatsheet) {
    openCheatsheet(screen.lessonIndex);
    return;
  }

  if (key.name === "v") {
    const exercisesDir = path.join(PROJECT_ROOT, lesson.dirName, "exercises");
    if (fs.existsSync(exercisesDir)) {
      openInVSCode(exercisesDir);
    } else {
      openInVSCode(path.join(PROJECT_ROOT, lesson.dirName));
    }
    return;
  }

  if (key.name === "q") {
    setCurrentScreen({ type: "main", selectedIndex: screen.lessonIndex });
    renderMainMenu();
    return;
  }
}

function openLessonItem(lessonIndex: number, selectedIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  if (selectedIndex < lesson.sections.length) {
    const sKey = getSectionKey(lessonIndex, selectedIndex);
    const sectionStatus = getSectionStatus(sKey);
    if (!sectionStatus && !hasTakenPretest(lessonIndex, selectedIndex)) {
      const lessonDir = path.join(PROJECT_ROOT, lesson.dirName);
      const pretestQs = getPretestQuestions(lessonDir, selectedIndex + 1);
      if (pretestQs.length > 0) {
        setCurrentScreen({
          type: "pretest",
          lessonIndex,
          sectionIndex: selectedIndex,
          questions: pretestQs,
          currentIndex: 0,
          answers: [],
          showingFeedback: false,
          feedbackCorrect: false,
          feedbackExplanation: "",
          showingResult: false,
          recommendedDepth: "standard",
          score: 0,
        });
        renderPretest();
        return;
      }
    }
    openSection(lessonIndex, selectedIndex);
    return;
  }

  let idx = lesson.sections.length;

  if (selectedIndex === idx) {
    setCurrentScreen({
      type: "exercisemenu",
      lessonIndex,
      selectedIndex: 0,
    });
    renderExerciseMenu();
    return;
  }
  idx++;

  if (lesson.hasQuiz && selectedIndex === idx) {
    startQuiz(lessonIndex);
    return;
  }
  if (lesson.hasQuiz) idx++;

  if (lesson.hasHints && selectedIndex === idx) {
    startHints(lessonIndex);
    return;
  }
  if (lesson.hasHints) idx++;

  const hasMisconceptions = fs.existsSync(
    path.join(PROJECT_ROOT, lesson.dirName, "misconceptions.ts")
  );
  if (hasMisconceptions && selectedIndex === idx) {
    const mcs = loadMisconceptions(lessonIndex);
    setCurrentScreen({
      type: "misconceptions",
      lessonIndex,
      misconceptions: mcs,
      currentIndex: 0,
      answered: false,
      selectedOption: -1,
      showingResolution: false,
      score: 0,
    });
    renderMisconceptions();
    return;
  }
  if (hasMisconceptions) idx++;

  if (lesson.hasCheatsheet && selectedIndex === idx) {
    openCheatsheet(lessonIndex);
    return;
  }
}

function startQuiz(lessonIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  // Load quiz questions from quiz-data.ts
  const quizDataPath = path.join(PROJECT_ROOT, lesson.dirName, "quiz-data.ts");
  if (!fs.existsSync(quizDataPath)) {
    // Fallback: try old quiz.ts child process
    const quizPath = path.join(PROJECT_ROOT, lesson.dirName, "quiz.ts");
    if (fs.existsSync(quizPath)) {
      runChildProcess(quizPath, [], () => {
        sessionStats.quizzesTaken++;
        setCurrentScreen({ type: "lesson", lessonIndex, selectedIndex: 0 });
        renderLessonMenu(lessonIndex);
      });
    }
    return;
  }

  // Dynamic import of quiz-data.ts
  import(/* webpackIgnore: true */ `file://${quizDataPath}`).then((mod) => {
    const questions: QuizQuestion[] = mod.questions || mod.default || [];
    if (questions.length === 0) return;

    sessionStats.quizzesTaken++;
    pushHistory(currentScreen as Screen);
    setCurrentScreen({
      type: "quiz",
      lessonIndex,
      questions,
      currentIndex: 0,
      answers: [],
      showingFeedback: false,
      feedbackCorrect: false,
      feedbackExplanation: "",
      done: false,
      score: 0,
      phase: "question",
      userInput: "",
    });
    renderQuiz();
  }).catch(() => {
    // Fallback to child process on import error
    const quizPath = path.join(PROJECT_ROOT, lesson.dirName, "quiz.ts");
    if (fs.existsSync(quizPath)) {
      runChildProcess(quizPath, [], () => {
        sessionStats.quizzesTaken++;
        setCurrentScreen({ type: "lesson", lessonIndex, selectedIndex: 0 });
        renderLessonMenu(lessonIndex);
      });
    }
  });
}
