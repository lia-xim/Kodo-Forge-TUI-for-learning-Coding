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
import { getAllPretestQuestions } from "./pretest-engine.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { SHOW_CURSOR } from "./tui-render.ts";
import { hasTakenLessonPretest, markLessonPretestTaken, sessionStats } from "./tui-state.ts";
import { renderCompletionProblem } from "./tui-challenges.ts";
import { registerAnimation, hasAnimation, ensureMenuBlink } from "./tui-animation.ts";
import { theme, marker as themeMarker } from "./tui-theme.ts";
import { renderFooterBar, renderHeaderBar, type FooterHint } from "./tui-components.ts";

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

  const t = theme;
  const timerStr = formatSessionTime();
  const lessonBarW = Math.max(6, Math.floor(w * 0.12));
  const lessonBar = fineProgressBar(lpct, lessonBarW);
  lines.push(
    renderHeaderBar(
      ` ${getBreadcrumb(currentScreen)}: ${truncate(lesson.title, w - 50)}`,
      `${lessonBar} ${pctStr(lpct)} \u23F1 ${timerStr} `,
      w
    )
  );
  lines.push(boxTop(w));
  lines.push(bEmpty(w));

  const totalInnerL = w - 2;
  const leftColW = Math.max(28, Math.floor(totalInnerL * 0.50));
  const rightColW = Math.max(22, totalInnerL - leftColW - 1);

  const leftLines: string[] = [];
  const rightLines: string[] = [];

  leftLines.push(padR(`${t.mod.bold}${t.fg.info} Sektionen${t.mod.reset}`, leftColW));
  leftLines.push(`${t.border.default} ${"─".repeat(leftColW - 1)}${t.mod.reset}`);

  for (let s = 0; s < lesson.sections.length; s++) {
    const section = lesson.sections[s];
    const key = getSectionKey(lessonIndex, s);
    const status = getSectionStatus(key);
    const isSelected = s === selectedIdx;

    let statusIc: string;
    if (status === "completed") {
      statusIc = `${t.fg.success}✓${t.mod.reset}`;
    } else if (status === "in_progress") {
      statusIc = `${t.fg.accent}▶${t.mod.reset}`;
    } else {
      statusIc = `${t.fg.muted}○${t.mod.reset}`;
    }

    let readTime = "";
    try {
      const content = fs.readFileSync(section.filePath, "utf-8");
      readTime = `${t.fg.muted}~${estimateReadTime(content)}m${t.mod.reset}`;
    } catch {
      // ignorieren
    }

    const mk = themeMarker(isSelected);
    const titleMaxLen = Math.max(5, leftColW - 16);
    const displayTitle = truncate(section.title, titleMaxLen);

    const line = `${mk}${statusIc} ${s + 1}  ${padR(displayTitle, titleMaxLen)} ${readTime}`;
    leftLines.push(padR(line, leftColW));
  }

  leftLines.push(" ".repeat(leftColW));
  leftLines.push(`${t.border.default} ${"─".repeat(leftColW - 1)}${t.mod.reset}`);
  leftLines.push(padR(`${t.mod.bold}${t.fg.heading} Praxis${t.mod.reset}`, leftColW));
  leftLines.push(`${t.border.default} ${"─".repeat(leftColW - 1)}${t.mod.reset}`);

  const exProgress = countExerciseProgress(lesson);
  const exText =
    exProgress.total > 0
      ? `${exProgress.solved}/${exProgress.total} geloest`
      : `${t.fg.muted}keine${t.mod.reset}`;
  const exSelected = selectedIdx === lesson.sections.length;
  const exMk = themeMarker(exSelected);
  leftLines.push(padR(`${exMk}${t.mod.bold}[E]${t.mod.reset} Exercises     ${exText}`, leftColW));

  if (lesson.hasQuiz) {
    const quizData = progress.quizzes[lesson.number];
    const quizText = quizData
      ? `Bestes: ${Math.round((quizData.score / quizData.total) * 100)}%`
      : `${t.fg.muted}noch offen${t.mod.reset}`;
    const qSelected = selectedIdx === lesson.sections.length + 1;
    const qMk = themeMarker(qSelected);
    leftLines.push(padR(`${qMk}${t.mod.bold}[Z]${t.mod.reset} Quiz          ${quizText}`, leftColW));
  }

  if (lesson.hasHints) {
    const hIdx = lesson.sections.length + (lesson.hasQuiz ? 2 : 1);
    const hSelected = selectedIdx === hIdx;
    const hMk = themeMarker(hSelected);
    leftLines.push(padR(`${hMk}${t.mod.bold}[H]${t.mod.reset} Hints`, leftColW));
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
    const mMk = themeMarker(mSelected);
    leftLines.push(padR(`${mMk}${t.mod.bold}[G]${t.mod.reset} Misconceptions`, leftColW));
  }

  if (lesson.hasCheatsheet) {
    const cIdx =
      lesson.sections.length +
      (lesson.hasQuiz ? 2 : 1) +
      (lesson.hasHints ? 1 : 0) +
      (hasMisconceptions ? 1 : 0);
    const cSelected = selectedIdx === cIdx;
    const cMk = themeMarker(cSelected);
    leftLines.push(padR(`${cMk}${t.mod.bold}[C]${t.mod.reset} Cheatsheet`, leftColW));
  }

  const minLeft = Math.max(leftLines.length, 14);
  while (leftLines.length < minLeft) {
    leftLines.push(" ".repeat(leftColW));
  }

  rightLines.push(`${t.mod.bold}${t.fg.info} Vorschau${t.mod.reset}`);
  rightLines.push(`${t.border.default} ${"─".repeat(rightColW - 1)}${t.mod.reset}`);

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

  const footerHints: FooterHint[] = [
    { key: `1-${lesson.sections.length}`, label: "Sektion" },
    { key: "↑↓", label: "Navigieren" },
    { key: "Enter/→", label: "Öffnen", primary: true },
    { key: "E", label: "Exercises" },
    { key: "Z", label: "Quiz" },
    { key: "V", label: "VS Code" },
  ];
  if (lesson.hasHints) footerHints.push({ key: "H", label: "Hints" });
  if (hasMisconceptions) footerHints.push({ key: "G", label: "Misconceptions" });
  if (lesson.hasCheatsheet) footerHints.push({ key: "C", label: "Cheatsheet" });
  footerHints.push({ key: "←/Esc", label: "Zurück" });

  lines.push(...renderFooterBar(footerHints, w));
  
  // Ensure menu blink animation
  ensureMenuBlink();
  
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
    // Lektions-Pretest starten (einmalig pro Lektion, vor der ersten ungelesenen Sektion)
    if (!sectionStatus && !hasTakenLessonPretest(lessonIndex)) {
      const lessonDir = path.join(PROJECT_ROOT, lesson.dirName);
      const allPretestQs = getAllPretestQuestions(lessonDir);
      if (allPretestQs.length > 0) {
        markLessonPretestTaken(lessonIndex);
        setCurrentScreen({
          type: "pretest",
          lessonIndex,
          sectionIndex: -1,
          questions: allPretestQs,
          currentIndex: 0,
          answers: [],
          showingFeedback: false,
          feedbackCorrect: false,
          feedbackExplanation: "",
          showingResult: false,
          recommendedDepth: "standard",
          score: 0,
          sectionDepths: {},
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
