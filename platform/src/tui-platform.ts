/**
 * tui-platform.ts — Platform-Screen (Kursauswahl) + Course-Info Screen
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { stripAnsi } from "./markdown-renderer.ts";
import { renderMarkdown } from "./markdown-renderer.ts";
import {
  c, padR, truncate, visLen, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter, pctStr,
  getContentHeight, clampScrollOffset, computeScrollbar,
  plainCell,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, platformConfig, courseProgressCache,
  updateTermSize, W, H, formatSessionTime,
  lessons, progress, saveProgress, setLessons,
  getCompletedLessonIndices, warmupShownThisSession, setWarmupShownThisSession,
  hasResumeTarget, courseInfoRenderedLines, setCourseInfoRenderedLines,
  COURSES_ROOT, PROJECT_ROOT,
  getDueReviewCount, getReviewStreak, getRecentActivityValues,
} from "./tui-state.ts";
import { progressBar as fineProgressBar, sparkline } from "./visual-utils.ts";
import type { ParsedKey, PlatformCourse, Screen } from "./tui-types.ts";
import {
  getCourseProgressSummary, isCourseUnlocked, getRecommendedCourse,
  switchToCourse, exitTui, formatTimeAgo,
} from "./tui-utils.ts";
import { getWarmUpQuestions } from "./pretest-engine.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { renderWarmup } from "./tui-quiz.ts";
import { ensureMenuBlink } from "./tui-animation.ts";
import { theme, marker as themeMarker, box } from "./tui-theme.ts";
import { renderFooterBar, renderHeaderBar, renderPanel, renderBadge, renderDivider, smoothProgress, modePill, type FooterHint } from "./tui-components.ts";

// ─── Layout-Typen ──────────────────────────────────────────────────────────

type LayoutMode = "grid-2x2" | "column-1" | "ultra-compact";

function getLayoutMode(): LayoutMode {
  const w = process.stdout.columns || 80;
  if (w >= 100) return "grid-2x2";
  if (w >= 80) return "column-1";
  return "ultra-compact";
}

const courseColorMap: Record<string, string> = {
  blue: c.blue,
  red: c.red,
  cyan: c.cyan,
  white: c.white,
  yellow: c.yellow,
  green: c.green,
  magenta: c.magenta,
};

function getCourseColor(course: PlatformCourse): string {
  return courseColorMap[course.color] ?? c.white;
}

function gridPosition(index: number): { row: number; col: number } {
  return { row: Math.floor(index / 2), col: index % 2 };
}

let platformContentTotalLines = 0;

// ─── Platform-Screen Rendering ─────────────────────────────────────────────

export function renderPlatformScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "platform" }>;
  const selectedIdx = screen.selectedIndex;
  const mode = getLayoutMode();
  const courses = platformConfig.courses;
  const w = W();
  const h = H();
  const t = theme;
  const reset = t.mod.reset;

  // ─── Header ───
  const timerStr = formatSessionTime();
  lines.push(renderHeaderBar(` Kodo Forge`, `\u23F1 ${timerStr} `, w));

  // ─── Stats Strip ───
  const dueCount = getDueReviewCount();
  const streak = getReviewStreak();
  const activityVals = getRecentActivityValues(14);
  const activeCourse = courses.find(co => co.id === platformConfig.activeCourse);
  const activePr = activeCourse ? getCourseProgressSummary(activeCourse) : null;
  const totalSections = activePr?.actualSections ?? 0;
  const totalHours = activePr?.actualHours ?? 0;

  const statParts: string[] = [
    `  ${t.fg.secondary}Σ${reset} ${t.mod.bold}${totalSections}${reset}${t.fg.secondary} Sektionen${reset}`,
    streak > 0
      ? `  ${t.fg.accent}★${reset} ${t.mod.bold}${streak}${reset}${t.fg.secondary} Tage${reset}`
      : "",
    dueCount > 0
      ? `  ${t.fg.warning}●${reset} ${t.mod.bold}${dueCount}${reset}${t.fg.warning} fällig${reset}`
      : `  ${t.fg.success}✓${reset}${t.fg.secondary} aktuell${reset}`,
    totalHours > 0
      ? `  ${t.fg.info}⊙${reset} ${t.mod.bold}${totalHours}h${reset}${t.fg.secondary} gelernt${reset}`
      : "",
  ].filter(s => s.length > 0);

  const statsLine = statParts.join("   ");
  lines.push(statsLine.padEnd(w));
  lines.push(`${t.border.muted}${"─".repeat(w)}${reset}`);
  lines.push("");

  // ─── Card Rendering Helpers ───

  const CARD_HEIGHT = 9; // top border + 7 content rows + bottom border
  const GAP = 2; // space between cards in grid

  // Render one self-contained course card (with borders) as an array of strings.
  // cardW includes the border characters (so inner content = cardW - 2).
  function renderCourseCard(idx: number, cardW: number): string[] {
    const co = courses[idx];
    if (!co) {
      // Empty card placeholder
      return Array(CARD_HEIGHT).fill(" ".repeat(cardW));
    }

    const pr = getCourseProgressSummary(co);
    const unlocked = isCourseUnlocked(co);
    const isSel = idx === selectedIdx;
    const isActiveCourse = co.id === platformConfig.activeCourse;

    // Pick border style and color
    const bSet = isSel && isActiveCourse ? box.heavy
                : (isSel || isActiveCourse) ? box.rounded
                : box.rounded;
    const borderColor = isSel && isActiveCourse ? t.border.active
                      : isActiveCourse           ? t.fg.accentDim
                      : isSel                    ? getCourseColor(co)
                      :                            t.border.muted;

    const inner = cardW - 2;

    // Helper: pad a content string to inner width
    function padInner(s: string): string {
      const vis = stripAnsi(s).length;
      return s + " ".repeat(Math.max(0, inner - vis));
    }

    const cardLines: string[] = [];

    // ─ Top border with title inset ─
    const titleStr = `${co.icon}  ${isSel ? t.mod.bold : ""}${co.name}${reset}`;
    const titleVis = stripAnsi(titleStr).length;
    const titleFill = bSet.horizontal.repeat(Math.max(0, inner - titleVis - 4));
    const activeMark = isSel ? `${t.fg.accent}▸${reset}` : " ";
    cardLines.push(
      `${borderColor}${bSet.topLeft}${bSet.horizontal}${bSet.horizontal} ${reset}` +
      `${titleStr}` +
      `${borderColor} ${titleFill}${bSet.topRight}${reset}`
    );

    // ─ Selection marker row ─
    if (isSel) {
      cardLines.push(
        `${borderColor}${bSet.vertical}${reset}${padInner(` ${activeMark} ← ausgewählt`)}${borderColor}${bSet.vertical}${reset}`
      );
    } else {
      cardLines.push(
        `${borderColor}${bSet.vertical}${reset}${" ".repeat(inner)}${borderColor}${bSet.vertical}${reset}`
      );
    }

    // ─ Progress bar ─
    const barW = Math.max(8, Math.floor(inner * 0.45));
    const bar = smoothProgress(pr.percent, barW);
    const pctColor = pr.percent >= 100 ? t.fg.success : pr.percent > 0 ? t.fg.accent : t.fg.secondary;
    const lessonCount = `L${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons}`;
    const barLine = ` ${bar}  ${pctColor}${String(pr.percent).padStart(3)}%${reset}  ${t.fg.secondary}${lessonCount}${reset}`;
    cardLines.push(
      `${borderColor}${bSet.vertical}${reset}${padInner(barLine)}${borderColor}${bSet.vertical}${reset}`
    );

    // ─ Segment dots + phase ─
    if (unlocked) {
      const total = Math.max(1, co.totalLessons ?? pr.totalLessons);
      const maxDots = Math.min(20, Math.floor(inner * 0.55));
      const filledDots = Math.round((pr.completedLessons / total) * maxDots);
      const dotBar = `${t.fg.accent}${"●".repeat(filledDots)}${t.fg.secondary}${"○".repeat(maxDots - filledDots)}${reset}`;
      const phaseText = pr.currentPhase ? `  Phase ${pr.currentPhase}` : "";
      const dotsLine = ` ${dotBar}${t.fg.secondary}${phaseText}${reset}`;
      cardLines.push(
        `${borderColor}${bSet.vertical}${reset}${padInner(dotsLine)}${borderColor}${bSet.vertical}${reset}`
      );
    } else {
      const prereq = co.prerequisiteDescription ?? "Voraussetzung: andere Kurse";
      const lockLine = ` ${t.fg.muted}${prereq}${reset}`;
      cardLines.push(
        `${borderColor}${bSet.vertical}${reset}${padInner(lockLine)}${borderColor}${bSet.vertical}${reset}`
      );
    }

    // ─ Stats row ─
    let statsRow = "";
    if (unlocked) {
      const hours = pr.actualHours > 0 ? `~${pr.actualHours}h` : co.estimatedHours ? `~${co.estimatedHours}h` : "";
      const sects = pr.actualSections > 0 ? `${pr.actualSections} Sektionen` : co.totalSections ? `${co.totalSections} Sektionen` : "";
      statsRow = ` ${t.fg.secondary}${[hours, sects].filter(Boolean).join(" · ")}${reset}`;
    } else {
      const badge = renderBadge("LOCK", "locked");
      statsRow = `  ${badge}`;
    }
    cardLines.push(
      `${borderColor}${bSet.vertical}${reset}${padInner(statsRow)}${borderColor}${bSet.vertical}${reset}`
    );

    // ─ Next lesson or topics ─
    let infoRow = "";
    if (isActiveCourse && unlocked && pr.lastLessonTitle) {
      const nextNum = String(pr.completedLessons + 1).padStart(2, "0");
      infoRow = ` ${t.fg.info}▸ L${nextNum}: ${pr.lastLessonTitle}${reset}`;
    } else if (!unlocked) {
      const topics = (co.topics ?? []).slice(0, 3).join(", ");
      if (topics) infoRow = ` ${t.fg.muted}${topics}${reset}`;
    } else {
      const topics = (co.topics ?? []).slice(0, 3).join(", ");
      if (topics) infoRow = ` ${t.fg.secondary}${topics}${reset}`;
    }
    cardLines.push(
      `${borderColor}${bSet.vertical}${reset}${padInner(infoRow)}${borderColor}${bSet.vertical}${reset}`
    );

    // ─ Empty row ─
    cardLines.push(
      `${borderColor}${bSet.vertical}${reset}${" ".repeat(inner)}${borderColor}${bSet.vertical}${reset}`
    );

    // ─ Bottom border ─
    const sigText = isActiveCourse ? ` [ aktiv ] ` : "";
    const sigVis = sigText.length;
    const bottomFillLeft = Math.max(0, inner - sigVis);
    cardLines.push(
      `${borderColor}${bSet.bottomLeft}${bSet.horizontal.repeat(bottomFillLeft)}${reset}` +
      (sigVis > 0 ? `${isActiveCourse ? t.fg.accent : t.fg.secondary}${sigText}${reset}` : "") +
      `${borderColor}${bSet.bottomRight}${reset}`
    );

    return cardLines;
  }

  // ─── Grid Layout ───
  if (mode === "grid-2x2") {
    const margin = 2;
    const totalAvail = w - margin * 2 - GAP;
    const cardW = Math.floor(totalAvail / 2);
    const indent = " ".repeat(margin);

    const rowCount = Math.ceil(courses.length / 2);
    for (let row = 0; row < rowCount; row++) {
      const leftCard = renderCourseCard(row * 2, cardW);
      const rightCard = renderCourseCard(row * 2 + 1, cardW);
      for (let ln = 0; ln < CARD_HEIGHT; ln++) {
        const lLine = leftCard[ln] ?? " ".repeat(cardW);
        const rLine = rightCard[ln] ?? " ".repeat(cardW);
        lines.push(`${indent}${lLine}${" ".repeat(GAP)}${rLine}`);
      }
      if (row < rowCount - 1) lines.push("");
    }

  } else {
    // ─── Column / Ultra-Compact ───
    const margin = mode === "ultra-compact" ? 1 : 2;
    const cardW = w - margin * 2;
    const indent = " ".repeat(margin);

    for (let i = 0; i < courses.length; i++) {
      const card = renderCourseCard(i, cardW);
      for (const cl of card) {
        lines.push(`${indent}${cl}`);
      }
      if (i < courses.length - 1) lines.push("");
    }
  }

  // ─── Activity Sparkline ───
  const hasActivity = activityVals.some(v => v > 0);
  if (hasActivity && w >= 80) {
    lines.push("");
    const spark = sparkline(activityVals);
    const todayCount = activityVals[activityVals.length - 1] ?? 0;
    const todayText = todayCount > 0 ? `  Heute: ${todayCount} Sektionen` : "";
    const sparkLine = ` ${t.fg.secondary}14 Tage:${reset}  ${t.fg.accent}${spark}${reset}${t.fg.secondary}${todayText}${reset}`;
    const sparkInner = w - 4;
    const sparkVis = stripAnsi(sparkLine).length;
    const sparkPad = " ".repeat(Math.max(0, sparkInner - sparkVis));
    lines.push(`  ${t.border.muted}╭${"─".repeat(sparkInner)}╮${reset}`);
    lines.push(`  ${t.border.muted}│${reset}${sparkLine}${sparkPad}${t.border.muted}│${reset}`);
    lines.push(`  ${t.border.muted}╰${"─".repeat(sparkInner)}╯${reset}`);
  }

  // ─── Recommendation Panel ───
  const rec = getRecommendedCourse();
  if (rec) {
    const recCourse = platformConfig.courses.find(co => co.id === rec.courseId);
    if (recCourse) {
      lines.push("");
      const recLines = renderPanel("Empfehlung", [
        `${t.fg.info}${recCourse.name}${reset} ${t.fg.secondary}—${reset} ${rec.lessonTitle}  ${t.mod.bold}[Enter]${reset}`,
      ], { width: w - 4, variant: "info", accentBorder: true, padding: 1 });
      for (const rl of recLines) lines.push(`  ${rl}`);
    }
  }

  // ─── Unlock Confirmation Dialog ───
  if (screen.confirmUnlock) {
    const course = courses[selectedIdx];
    if (course) {
      const prereqName = course.prerequisiteDescription ?? "";
      lines.push("");
      const dLines = renderPanel("Voraussetzung", [
        `${t.fg.warning}${prereqName}${reset}`,
        `Trotzdem öffnen? ${t.mod.bold}[J]${reset} Ja  ${t.mod.bold}[N]${reset} Nein`,
      ], { width: Math.min(w - 8, 60), variant: "warning", boxStyle: "rounded" });
      const dIndent = " ".repeat(Math.max(1, Math.floor((w - Math.min(w - 8, 60)) / 2)));
      for (const dl of dLines) lines.push(`${dIndent}${dl}`);
    }
  }

  // ─── Pad to footer ───
  while (lines.length < h - 3) lines.push("");

  // ─── Footer ───
  const navKey = mode === "grid-2x2" ? "↑↓←→" : "↑↓";
  const footerHints: FooterHint[] = [
    { key: navKey, label: "Kurs wählen" },
    { key: "Enter", label: "Öffnen", primary: true },
    { key: "I", label: "Info" },
    { key: "?", label: "Hilfe" },
    { key: "Q", label: "Beenden" },
  ];
  lines.push(...renderFooterBar(footerHints, w));

  platformContentTotalLines = lines.length;
  ensureMenuBlink();
  flushScreen(lines);
}

// ─── Platform Input ────────────────────────────────────────────────────────

export function handlePlatformInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "platform" }>;
  const maxIdx = platformConfig.courses.length - 1;
  const mode = getLayoutMode();
  const h = H();

  if (screen.confirmUnlock) {
    if (key.name === "j" || key.name === "y") {
      screen.confirmUnlock = false;
      const course = platformConfig.courses[screen.selectedIndex];
      if (course) {
        openCourseFromPlatform(course);
      }
      return;
    }
    if (key.name === "n" || key.name === "escape") {
      screen.confirmUnlock = false;
      renderPlatformScreen();
      return;
    }
    return;
  }

  if (mode === "grid-2x2") {
    const pos = gridPosition(screen.selectedIndex);
    const cols = 2;
    const rows = Math.ceil(platformConfig.courses.length / cols);

    if (key.name === "up") {
      if (pos.row > 0) {
        const newIdx = (pos.row - 1) * cols + pos.col;
        if (newIdx <= maxIdx) {
          screen.selectedIndex = newIdx;
          if (screen.scrollOffset > 0) {
            screen.scrollOffset = Math.max(0, screen.scrollOffset - 6);
          }
        }
      }
      renderPlatformScreen();
      return;
    }
    if (key.name === "down") {
      if (pos.row < rows - 1) {
        const newIdx = (pos.row + 1) * cols + pos.col;
        if (newIdx <= maxIdx) {
          screen.selectedIndex = newIdx;
          const contentHeight = h - 5;
          if (platformContentTotalLines > contentHeight) {
            const maxScroll = Math.max(0, platformContentTotalLines - contentHeight);
            screen.scrollOffset = Math.min(maxScroll, screen.scrollOffset + 6);
          }
        }
      }
      renderPlatformScreen();
      return;
    }
    if (key.name === "left") {
      if (pos.col > 0) {
        const newIdx = pos.row * cols + (pos.col - 1);
        if (newIdx >= 0 && newIdx <= maxIdx) {
          screen.selectedIndex = newIdx;
        }
      }
      renderPlatformScreen();
      return;
    }
    if (key.name === "right") {
      if (pos.col < cols - 1) {
        const newIdx = pos.row * cols + (pos.col + 1);
        if (newIdx <= maxIdx) {
          screen.selectedIndex = newIdx;
        }
      }
      renderPlatformScreen();
      return;
    }
  } else {
    if (key.name === "up") {
      screen.selectedIndex = Math.max(0, screen.selectedIndex - 1);
      if (screen.scrollOffset > 0) {
        screen.scrollOffset = Math.max(0, screen.scrollOffset - 4);
      }
      renderPlatformScreen();
      return;
    }
    if (key.name === "down") {
      screen.selectedIndex = Math.min(maxIdx, screen.selectedIndex + 1);
      const contentHeight = h - 5;
      if (platformContentTotalLines > contentHeight) {
        const maxScroll = Math.max(0, platformContentTotalLines - contentHeight);
        screen.scrollOffset = Math.min(maxScroll, screen.scrollOffset + 4);
      }
      renderPlatformScreen();
      return;
    }
  }

  if (key.name === "pageup") {
    screen.scrollOffset = Math.max(0, screen.scrollOffset - (h - 8));
    renderPlatformScreen();
    return;
  }
  if (key.name === "pagedown") {
    const contentHeight = h - 5;
    const maxScroll = Math.max(0, platformContentTotalLines - contentHeight);
    screen.scrollOffset = Math.min(maxScroll, screen.scrollOffset + (h - 8));
    renderPlatformScreen();
    return;
  }

  if (key.name === "enter" || (key.name === "right" && mode !== "grid-2x2")) {
    const course = platformConfig.courses[screen.selectedIndex];
    if (!course) return;

    if (!isCourseUnlocked(course)) {
      screen.confirmUnlock = true;
      renderPlatformScreen();
      return;
    }

    openCourseFromPlatform(course);
    return;
  }

  if (key.name === "q") {
    exitTui();
    return;
  }
}

function openCourseFromPlatform(course: PlatformCourse): void {
  switchToCourse(course.id);

  if (lessons.length === 0) {
    setCourseInfoRenderedLines([]);
    setCurrentScreen({ type: "courseinfo", courseId: course.id, scrollOffset: 0, totalLines: 0 });
    renderCourseInfoScreen();
    return;
  }

  const completedForWarmup = getCompletedLessonIndices();
  if (completedForWarmup.length > 0 && !warmupShownThisSession) {
    setWarmupShownThisSession(true);
    const warmupQs = getWarmUpQuestions(PROJECT_ROOT, completedForWarmup, 3);
    if (warmupQs.length > 0) {
      setCurrentScreen({
        type: "warmup",
        questions: warmupQs,
        currentIndex: 0,
        answers: [],
        showingFeedback: false,
        feedbackCorrect: false,
        feedbackExplanation: "",
        done: false,
      });
      renderWarmup();
      return;
    }
  }

  const startIdx = hasResumeTarget() ? -1 : 0;
  setCurrentScreen({ type: "main", selectedIndex: startIdx });
  renderMainMenu();
}

// ─── Course-Info Screen ──────────────────────────────────────────────────

export function renderCourseInfoScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "courseinfo" }>;
  const course = platformConfig.courses.find(co => co.id === screen.courseId);
  if (!course) return;
  const w = W();
  const h = H();

  const timerStr = formatSessionTime();
  lines.push(
    renderHeader(
      ` ${course.name}`,
      `\u23F1 ${timerStr} `
    )
  );

  lines.push(boxTop(w));

  if (courseInfoRenderedLines.length > 0 && screen.totalLines > 0) {
    const contentHeight = getContentHeight();
    const scrollbar = computeScrollbar(screen.scrollOffset, screen.totalLines, contentHeight);

    for (let row = 0; row < contentHeight; row++) {
      const lineIdx = screen.scrollOffset + row;
      const content = lineIdx < courseInfoRenderedLines.length ? courseInfoRenderedLines[lineIdx] : "";
      const sbChar = row < scrollbar.length && scrollbar[row] === "thumb"
        ? `${c.cyan}\u2588${c.reset}`
        : `${c.dim}\u2502${c.reset}`;
      const innerW = w - 4;
      lines.push(`${c.dim}\u2502${c.reset} ${padR(content, innerW)} ${sbChar}`);
    }
  } else {
    const boxW = Math.min(w - 4, 65);
    const innerW = boxW - 4;
    const leftPad = Math.max(0, Math.floor((w - boxW - 2) / 2));
    const padStr = " ".repeat(leftPad);

    lines.push(bEmpty(w));
    lines.push(bEmpty(w));
    lines.push(bLine(`${padStr}${c.dim}\u250C\u2500 ${course.name} ${"─".repeat(Math.max(0, innerW - visLen(course.name) - 2))}\u2510${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR("Dieser Kurs ist noch in Planung.", innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`Geplante Lektionen: ${c.bold}${course.totalLessons}${c.reset}`, innerW)}${c.dim}\u2502${c.reset}`, w));
    const phases = Math.max(1, Math.ceil(course.totalLessons / 10));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`Geplante Phasen: ${c.bold}${phases}${c.reset}`, innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR("Die Lektionen werden bald verfuegbar sein.", innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR("In der Zwischenzeit: Arbeite am TypeScript-Kurs weiter!", innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, w));

    const curriculumPath = path.join(COURSES_ROOT, course.directory, "CURRICULUM.md");
    if (fs.existsSync(curriculumPath)) {
      lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`${c.bold}[C]${c.reset} Curriculum anzeigen`, innerW)}${c.dim}\u2502${c.reset}`, w));
    }
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`${c.bold}[\u2190]${c.reset} Zurueck zur Kursauswahl`, innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2514${"─".repeat(innerW + 2)}\u2518${c.reset}`, w));
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) {
    lines.push(bEmpty(w));
  }
  while (lines.length > footerStart) {
    lines.pop();
  }

  const footerItems: string[] = courseInfoRenderedLines.length > 0
    ? [
        `${c.bold}[\u2191\u2193]${c.reset} Scrollen`,
        `${c.bold}[Esc]${c.reset} Zurueck`,
      ]
    : [
        `${c.bold}[C]${c.reset} Curriculum`,
        `${c.bold}[\u2190/Esc]${c.reset} Zurueck`,
      ];

  lines.push(...renderFooter(footerItems));
  flushScreen(lines);
}

export function handleCourseInfoInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "courseinfo" }>;

  if (key.name === "escape" || key.name === "left" || key.name === "backspace") {
    if (courseInfoRenderedLines.length > 0) {
      setCourseInfoRenderedLines([]);
      screen.scrollOffset = 0;
      screen.totalLines = 0;
      renderCourseInfoScreen();
      return;
    }
    courseProgressCache.clear();
    const courseIdx = platformConfig.courses.findIndex(co => co.id === screen.courseId);
    setCurrentScreen({ type: "platform", selectedIndex: Math.max(0, courseIdx), scrollOffset: 0 });
    renderPlatformScreen();
    return;
  }

  if (key.name === "c" && courseInfoRenderedLines.length === 0) {
    const course = platformConfig.courses.find(co => co.id === screen.courseId);
    if (course) {
      const curriculumPath = path.join(COURSES_ROOT, course.directory, "CURRICULUM.md");
      if (fs.existsSync(curriculumPath)) {
        const content = fs.readFileSync(curriculumPath, "utf-8");
        updateTermSize();
        const renderWidth = Math.max(30, W() - 6);
        const rendered = renderMarkdown(content, renderWidth);
        setCourseInfoRenderedLines(rendered);
        screen.totalLines = rendered.length;
        screen.scrollOffset = 0;
        renderCourseInfoScreen();
        return;
      }
    }
  }

  if (courseInfoRenderedLines.length > 0) {
    const contentHeight = getContentHeight();
    if (key.name === "up") {
      screen.scrollOffset = Math.max(0, screen.scrollOffset - 1);
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "down") {
      screen.scrollOffset = clampScrollOffset(screen.scrollOffset + 1, screen.totalLines);
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "space" || key.name === "pagedown") {
      const jump = Math.floor(contentHeight / 2);
      screen.scrollOffset = clampScrollOffset(screen.scrollOffset + jump, screen.totalLines);
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "pageup") {
      const jump = Math.floor(contentHeight / 2);
      screen.scrollOffset = Math.max(0, screen.scrollOffset - jump);
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "home") {
      screen.scrollOffset = 0;
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "end") {
      screen.scrollOffset = clampScrollOffset(screen.totalLines, screen.totalLines);
      renderCourseInfoScreen();
      return;
    }
  }
}
