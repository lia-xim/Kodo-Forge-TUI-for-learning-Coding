/**
 * tui-main-menu.ts — Main Menu Screen
 */

import * as path from "node:path";
import {
  c, padR, truncate, visLen, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter, pctStr,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, progress, saveProgress,
  updateTermSize, W, H, formatSessionTime,
  getBreadcrumb, calculateMastery, masteryBar, hasResumeTarget,
  getSectionKey, getSectionStatus, countExerciseProgress,
  getLessonProgress, getOverallProgress, getNextStep,
  getDueReviewCount, getReviewStreak, getRecentActivityValues,
  getCompletedLessonIndices, pushHistory, courseProgressCache,
  platformConfig, PLATFORM_ROOT, PROJECT_ROOT,
} from "./tui-state.ts";
import { progressBar as fineProgressBar, colorSparkline } from "./visual-utils.ts";
import { getInterleavedItems } from "./interleave-engine.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { exitTui, runChildProcess } from "./tui-utils.ts";
import { renderLessonMenu } from "./tui-lesson-menu.ts";
import { renderCompetenceDashboard } from "./tui-stats.ts";
import { renderSearchScreen } from "./tui-search.ts";
import { renderBookmarksScreen } from "./tui-bookmarks.ts";
import { renderPlatformScreen } from "./tui-platform.ts";
import { renderInterleaved } from "./tui-quiz.ts";
import { openSection } from "./tui-section-reader.ts";
import { registerAnimation, hasAnimation, ensureMenuBlink } from "./tui-animation.ts";
import { theme, marker as themeMarker } from "./tui-theme.ts";
import { renderFooterBar, renderHeaderBar, renderPanel, renderBadge, type FooterHint } from "./tui-components.ts";

export function renderMainMenu(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as { type: "main"; selectedIndex: number };
  const selectedIdx = screen.selectedIndex;
  const w = W();
  const h = H();

  const t = theme;
  const overallPct = getOverallProgress();
  const timerStr = formatSessionTime();
  const headerBarWidth = Math.max(8, Math.floor(w * 0.20));
  const headerBar = fineProgressBar(overallPct, headerBarWidth);
  lines.push(
    renderHeaderBar(
      ` ${getBreadcrumb(currentScreen)}`,
      `${headerBar} ${pctStr(overallPct)} \u23F1 ${timerStr} `,
      w
    )
  );

  lines.push(boxTop(w));

  const showResume = hasResumeTarget();
  if (showResume) {
    const li = progress.lastLesson;
    const si = progress.lastSection;
    const lesson = lessons[li];
    const sectionTitle =
      lesson && lesson.sections[si]
        ? lesson.sections[si].title
        : "";
    const resumeInnerW = w - 6;
    const resumeSelected = selectedIdx === -1;
    
    const mk = themeMarker(resumeSelected);
      
    lines.push(
      bLine(
        ` ${t.border.muted}┌─ ${t.fg.heading}Weitermachen${t.mod.reset} ${t.border.muted}${"─".repeat(Math.max(0, resumeInnerW - 16))}┐${t.mod.reset}`,
        w
      )
    );
    const resumeText = `${mk}${t.mod.bold}▶ Lektion ${lesson?.number ?? "?"}: ${truncate(sectionTitle, Math.max(10, resumeInnerW - 40))}, Sektion ${si + 1}${t.mod.reset}     ${t.fg.secondary}[Enter]${t.mod.reset}`;
    lines.push(
      bLine(
        ` ${t.border.muted}│${t.mod.reset} ${padR(resumeText, resumeInnerW - 2)}${t.border.muted}│${t.mod.reset}`,
        w
      )
    );
    lines.push(
      bLine(
        ` ${t.border.muted}└${"─".repeat(resumeInnerW)}┘${t.mod.reset}`,
        w
      )
    );
  }

  lines.push(bEmpty(w));

  const totalInner = w - 2;
  const leftColW = Math.max(28, Math.floor(totalInner * 0.54));
  const rightColW = Math.max(22, totalInner - leftColW - 1);

  const leftLines: string[] = [];
  const rightLines: string[] = [];

  leftLines.push(padR(`${t.mod.bold}${t.fg.info} Lektionen${t.mod.reset}`, leftColW));
  leftLines.push(`${t.border.default} ${"─".repeat(leftColW - 1)}${t.mod.reset}`);

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const isSelected = i === selectedIdx;
    const mastery = calculateMastery(i);

    const mk = themeMarker(isSelected);
    const num = `${isSelected ? t.mod.bold : ""}${i + 1}${t.mod.reset}`;
    const masteryStr = masteryBar(mastery);
    const titleMaxLen = Math.max(5, leftColW - 28);
    const displayTitle = truncate(lesson.title, titleMaxLen);
    const line = `${mk}${num}  ${padR(displayTitle, titleMaxLen)} ${masteryStr}`;
    leftLines.push(padR(line, leftColW));
  }

  const minLeftLines = Math.max(leftLines.length, 10);
  while (leftLines.length < minLeftLines) {
    leftLines.push(" ".repeat(leftColW));
  }

  rightLines.push(
    `${t.mod.bold}${t.fg.info} Dein Fortschritt${t.mod.reset}`
  );
  rightLines.push(
    `${t.border.default} ${"─".repeat(rightColW - 1)}${t.mod.reset}`
  );

  let totalSections = 0;
  let doneSections = 0;
  let totalExercises = 0;
  let doneExercises = 0;
  let quizzesPassed = 0;
  let totalQuizzes = 0;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    totalSections += lesson.sections.length;
    for (let s = 0; s < lesson.sections.length; s++) {
      const key = getSectionKey(i, s);
      if (getSectionStatus(key) === "completed") doneSections++;
    }
    const ex = countExerciseProgress(lesson);
    totalExercises += ex.total;
    doneExercises += ex.solved;
    if (lesson.hasQuiz) {
      totalQuizzes++;
      if (progress.quizzes[lesson.number]) quizzesPassed++;
    }
  }

  const streak = getReviewStreak();

  rightLines.push(
    ` Sektionen gelesen:  ${c.bold}${String(doneSections).padStart(3)}${c.reset}/${totalSections}`
  );
  rightLines.push(
    ` Exercises geloest:  ${c.bold}${String(doneExercises).padStart(3)}${c.reset}/${totalExercises}`
  );
  rightLines.push(
    ` Quiz bestanden:     ${c.bold}${String(quizzesPassed).padStart(3)}${c.reset}/${totalQuizzes}`
  );
  rightLines.push(
    ` Reviews gesamt:   ${c.bold}${String(streak).padStart(3)}${c.reset}`
  );
  rightLines.push("");
  const overallBarWidth = Math.max(10, rightColW - 12);
  const overallBar = fineProgressBar(overallPct, overallBarWidth);
  rightLines.push(` ${overallBar} ${pctStr(overallPct)}`);

  const recentActivity = getRecentActivityValues(7);
  if (recentActivity.some((v) => v > 0)) {
    rightLines.push("");
    rightLines.push(` ${c.dim}Lernverlauf (7 Tage):${c.reset}`);
    const spark = colorSparkline(recentActivity);
    rightLines.push(` ${spark}`);
  }

  rightLines.push("");
  rightLines.push(
    `${c.dim} ${"─".repeat(rightColW - 1)}${c.reset}`
  );
  rightLines.push(
    `${c.bold} Naechster Schritt:${c.reset}`
  );
  const nextStep = getNextStep();
  const wrappedStep =
    nextStep.length > rightColW - 2
      ? nextStep.slice(0, rightColW - 5) + "..."
      : nextStep;
  rightLines.push(` ${c.cyan}${wrappedStep}${c.reset}`);

  while (rightLines.length < minLeftLines) {
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

  const dueCount = getDueReviewCount();
  const reviewSelected = selectedIdx === lessons.length;
  const reviewInnerW = w - 6;
  if (dueCount > 0) {
    lines.push(bLine(` ${c.dim}┌${"─".repeat(reviewInnerW)}┐${c.reset}`, w));
    const reviewSelected = selectedIdx === lessons.length;
    const blinkFrame = Math.floor(Date.now() / 600) % 2 === 0;
    const markerColor = blinkFrame ? c.amber : c.paleWhite;
    const reviewMarker = reviewSelected
      ? `${markerColor}${c.bold}\u25B8${c.reset} `
      : "  ";
    const reviewText = `${reviewMarker}${c.yellow}${c.bold}${dueCount} Fragen faellig${c.reset} ${c.dim}— Druecke [R] um die taegliche Wiederholung zu starten${c.reset}`;
    lines.push(bLine(` ${c.dim}│${c.reset} ${padR(reviewText, reviewInnerW - 2)}${c.dim}│${c.reset}`, w));
    lines.push(bLine(` ${c.dim}└${"─".repeat(reviewInnerW)}┘${c.reset}`, w));
  } else {
    lines.push(bLine(` ${c.dim}┌${"─".repeat(reviewInnerW)}┐${c.reset}`, w));
    lines.push(bLine(` ${c.dim}│${c.reset} ${padR(`${c.green}Review: Alles aktuell${c.reset}`, reviewInnerW - 2)}${c.dim}│${c.reset}`, w));
    lines.push(bLine(` ${c.dim}└${"─".repeat(reviewInnerW)}┘${c.reset}`, w));
  }

  lines.push(bEmpty(w));

  const completedLessonCount = getCompletedLessonIndices().length;
  if (completedLessonCount >= 3) {
    const completedLessonNames = getCompletedLessonIndices()
      .slice(0, 3)
      .map((i) => lessons[i]?.title || "")
      .join(", ");
    const ilInnerW = w - 6;
    lines.push(bLine(` ${c.dim}┌${"─".repeat(ilInnerW)}┐${c.reset}`, w));
    lines.push(bLine(` ${c.dim}│${c.reset} ${padR(`${c.magenta}${c.bold}Interleaved Review${c.reset} ${c.dim}— 5 gemischte Aufgaben aus: ${truncate(completedLessonNames, ilInnerW - 45)}${c.reset}`, ilInnerW - 2)}${c.dim}│${c.reset}`, w));
    lines.push(bLine(` ${c.dim}│${c.reset} ${padR(`${c.dim}Druecke [I] zum Starten${c.reset}`, ilInnerW - 2)}${c.dim}│${c.reset}`, w));
    lines.push(bLine(` ${c.dim}└${"─".repeat(ilInnerW)}┘${c.reset}`, w));
    lines.push(bEmpty(w));
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) {
    lines.push(bEmpty(w));
  }
  while (lines.length > footerStart) {
    lines.pop();
  }

  const footerHints: FooterHint[] = [
    { key: `1-${lessons.length}`, label: "Lektion" },
    { key: "↑↓", label: "Navigieren" },
    { key: "Enter", label: "Öffnen", primary: true },
    { key: "/", label: "Suche" },
    { key: "B", label: "Lesezeichen" },
    { key: "R", label: "Review" },
    { key: "I", label: "Interleaved" },
    { key: "K", label: "Kompetenzen" },
    { key: "P", label: "Kursauswahl" },
    { key: "?", label: "Hilfe" },
    { key: "Q", label: "Beenden" },
  ];

  lines.push(...renderFooterBar(footerHints, w));
  
  // Ensure menu blink animation
  ensureMenuBlink();
  
  flushScreen(lines);
}

export function handleMainInput(key: ParsedKey): void {
  const screen = currentScreen as { type: "main"; selectedIndex: number };
  const showResume = hasResumeTarget();
  const minIdx = showResume ? -1 : 0;
  const maxIdx = lessons.length;

  if (key.name === "up") {
    screen.selectedIndex = Math.max(minIdx, screen.selectedIndex - 1);
    renderMainMenu();
    return;
  }
  if (key.name === "down") {
    screen.selectedIndex = Math.min(maxIdx, screen.selectedIndex + 1);
    renderMainMenu();
    return;
  }

  if (key.name === "enter" || key.name === "right" || key.name === "space") {
    if (screen.selectedIndex === -1 && showResume) {
      const li = progress.lastLesson;
      const si = progress.lastSection;
      progress.lastScreen = "section";
      saveProgress();
      openSection(li, si, progress.lastScrollOffset);
      return;
    }

    if (screen.selectedIndex >= 0 && screen.selectedIndex < lessons.length) {
      const idx = screen.selectedIndex;
      progress.lastLesson = idx;
      progress.lastScreen = "lesson";
      saveProgress();
      pushHistory({ type: "lesson", lessonIndex: idx, selectedIndex: 0 });
      setCurrentScreen({ type: "lesson", lessonIndex: idx, selectedIndex: 0 });
      renderLessonMenu(idx);
      return;
    }
    if (screen.selectedIndex === lessons.length) {
      startReview();
      return;
    }
  }

  const num = parseInt(key.raw, 10);
  if (num >= 1 && num <= lessons.length) {
    progress.lastLesson = num - 1;
    progress.lastScreen = "lesson";
    saveProgress();
    pushHistory({ type: "lesson", lessonIndex: num - 1, selectedIndex: 0 });
    setCurrentScreen({
      type: "lesson",
      lessonIndex: num - 1,
      selectedIndex: 0,
    });
    renderLessonMenu(num - 1);
    return;
  }

  if (key.name === "r") {
    startReview();
    return;
  }

  if (key.name === "s" || key.name === "k") {
    pushHistory({ type: "competence", scrollOffset: 0 });
    setCurrentScreen({ type: "competence", scrollOffset: 0 });
    renderCompetenceDashboard();
    return;
  }

  if (key.name === "i") {
    startInterleavedReview();
    return;
  }

  if (key.name === "/") {
    setCurrentScreen({ type: "search", query: "", results: [], selectedResult: 0 });
    process.stdout.write("\x1b[?25h"); // SHOW_CURSOR
    renderSearchScreen();
    return;
  }

  if (key.name === "b") {
    pushHistory({ type: "bookmarks", selectedIndex: 0 });
    setCurrentScreen({ type: "bookmarks", selectedIndex: 0 });
    renderBookmarksScreen();
    return;
  }

  if (key.name === "p" || key.name === "escape") {
    saveProgress();
    courseProgressCache.clear();
    const courseIdx = platformConfig.courses.findIndex(co => co.id === platformConfig.activeCourse);
    setCurrentScreen({ type: "platform", selectedIndex: Math.max(0, courseIdx), scrollOffset: 0 });
    renderPlatformScreen();
    return;
  }

  if (key.name === "q") {
    exitTui();
    return;
  }
}

function startInterleavedReview(): void {
  const completedIndices = getCompletedLessonIndices();
  const completedLessons = completedIndices.map((i) => ({
    index: i,
    number: lessons[i].number,
    title: lessons[i].title,
  }));
  const items = getInterleavedItems(PROJECT_ROOT, completedLessons, 5);

  pushHistory({ type: "interleaved", items, currentIndex: 0, answers: [],
    showingFeedback: false, feedbackCorrect: false, feedbackExplanation: "", done: false });
  setCurrentScreen({
    type: "interleaved",
    items,
    currentIndex: 0,
    answers: [],
    showingFeedback: false,
    feedbackCorrect: false,
    feedbackExplanation: "",
    done: false,
  });
  renderInterleaved();
}

function startReview(): void {
  runChildProcess(
    path.join(PLATFORM_ROOT, "src", "review-runner.ts"),
    [],
    () => {
      setCurrentScreen({ type: "main", selectedIndex: 0 });
      renderMainMenu();
    }
  );
}
