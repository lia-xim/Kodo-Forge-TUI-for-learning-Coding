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
} from "./tui-state.ts";
import { progressBar as fineProgressBar } from "./visual-utils.ts";
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
import { renderFooterBar, renderHeaderBar, renderPanel, renderBadge, renderDivider, type FooterHint } from "./tui-components.ts";

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

  // ─── Header ───
  const timerStr = formatSessionTime();
  lines.push(renderHeaderBar(` Kodo Forge`, `\u23F1 ${timerStr} `, w));

  // ─── ASCII Logo (Muted Retro Amber) ───
  const logo = [
    `  ${t.mod.bold}${t.fg.accent}    __ __          __         ____                           ${t.mod.reset}`,
    `  ${t.mod.bold}${t.fg.accent}   / //_/____   __/ /____    / __/____   _____ ____ _ ___    ${t.mod.reset}`,
    `  ${t.mod.bold}${t.fg.accent}  / ,<  / __ \\ / __  / __ \\  / /_ / __ \\ / ___// __ \`// _ \\   ${t.mod.reset}`,
    `  ${t.mod.bold}${t.fg.accent} / /| |/ /_/ // /_/ / /_/ / / __// /_/ // /   / /_/ //  __/   ${t.mod.reset}`,
    `  ${t.mod.bold}${t.fg.accent}/_/ |_|\\____/ \\__,_/\\____/ /_/   \\____//_/    \\__, / \\___/    ${t.mod.reset}`,
    `  ${t.mod.bold}${t.fg.accent}                                             /____/          ${t.mod.reset}`,
  ];
  lines.push("");
  lines.push(...logo);
  lines.push("");

  const contentHeight = h - 11;

  // ─── Course Grid / List ───
  if (mode === "grid-2x2") {
    const margin = 2;
    const totalInner = w - margin * 2 - 3;
    const cellW = Math.floor(totalInner / 2);
    const indent = " ".repeat(margin);

    function courseCell(idx: number): string[] {
      const co = courses[idx];
      if (!co) return Array(6).fill("");
      const pr = getCourseProgressSummary(co);
      const unlocked = isCourseUnlocked(co);
      const isSel = idx === selectedIdx;

      const mk = themeMarker(isSel);
      const lockBadge = unlocked ? "" : `  ${renderBadge("LOCKED", "locked")}`;
      const line1 = ` ${mk}${co.icon}  ${isSel ? `${t.mod.bold}` : ""}${co.name}${t.mod.reset}${lockBadge}`;

      const isActive = co.status === "active" && unlocked;
      const barW = 12;
      const filled = Math.round(barW * pr.percent / 100);
      const fillColor = pr.percent >= 100 ? t.fg.success : pr.percent > 0 ? t.fg.accent : t.fg.secondary;
      const barStr = `${fillColor}${"\u2588".repeat(filled)}${t.fg.secondary}${"░".repeat(barW - filled)}${t.mod.reset}`;
      const pctColor = pr.percent >= 100 ? t.fg.success : t.fg.accent;
      const statusTxt = isActive
        ? `  ${t.fg.secondary}Phase ${pr.currentPhase} · ${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons}${t.mod.reset}`
        : `  ${t.fg.secondary}${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons} Lektionen${t.mod.reset}`;
      const line2 = `   ${barStr} ${pctColor}${String(pr.percent).padStart(3)}%${t.mod.reset}${statusTxt}`;

      const hours = pr.actualHours > 0 ? pr.actualHours : (co.estimatedHours ?? "?");
      const sects = pr.actualSections > 0 ? pr.actualSections : (co.totalSections ?? "?");
      const exCount = pr.actualExercises > 0 ? pr.actualExercises : null;
      let detail = "";
      if (!unlocked) {
        detail = `   ${t.fg.secondary}~${hours}h · ${sects} Sektionen · ${co.prerequisiteDescription ?? ""}${t.mod.reset}`;
      } else {
        const exStr = exCount ? ` · ${exCount} Übungen` : "";
        detail = `   ${t.fg.secondary}~${hours}h · ${sects} Sektionen${exStr}${t.mod.reset}`;
      }
      const line3 = detail;

      let line4 = "";
      if (isActive && pr.lastLessonTitle) {
        const nextNum = String(pr.completedLessons + 1).padStart(2, "0");
        line4 = `   ${t.fg.info}▸ Nächste: L${nextNum} ${pr.lastLessonTitle}${t.mod.reset}`;
      } else {
        const topics = (co.topics ?? []).slice(0, 5);
        if (topics.length > 0) {
          line4 = `   ${t.fg.secondary}${topics.join(", ")}${t.mod.reset}`;
        }
      }

      return [line1, "", line2, line3, line4, ""];
    }

    const ROWS_PER_CELL = 6;
    const hLine = `${t.border.default}${"─".repeat(cellW)}${t.mod.reset}`;
    lines.push(`${indent}${t.border.default}╭${"─".repeat(cellW)}┬${"─".repeat(cellW)}╮${t.mod.reset}`);

    const rowCount = Math.ceil(courses.length / 2);
    for (let row = 0; row < rowCount; row++) {
      const leftCell = courseCell(row * 2);
      const rightCell = courseCell(row * 2 + 1);

      const leftSel = row * 2 === selectedIdx;
      const rightSel = row * 2 + 1 === selectedIdx;
      const leftColor = leftSel ? getCourseColor(courses[row * 2]) : "";
      const rightColor = rightSel && courses[row * 2 + 1] ? getCourseColor(courses[row * 2 + 1]) : "";

      for (let ln = 0; ln < ROWS_PER_CELL; ln++) {
        const lText = plainCell(leftCell[ln] ?? "", cellW);
        const rText = plainCell(rightCell[ln] ?? "", cellW);
        let lStyle = "";
        let rStyle = "";
        if (leftSel && ln === 0) lStyle = `${leftColor}${t.mod.bold}`;
        else if (leftSel) lStyle = leftColor;
        if (rightSel && ln === 0) rStyle = `${rightColor}${t.mod.bold}`;
        else if (rightSel) rStyle = rightColor;

        const lFinal = lStyle ? `${lStyle}${lText}${t.mod.reset}` : lText;
        const rFinal = rStyle ? `${rStyle}${rText}${t.mod.reset}` : rText;
        lines.push(`${indent}${t.border.default}│${t.mod.reset}${lFinal}${t.border.default}│${t.mod.reset}${rFinal}${t.border.default}│${t.mod.reset}`);
      }

      if (row < rowCount - 1) {
        lines.push(`${indent}${t.border.default}├${"─".repeat(cellW)}┼${"─".repeat(cellW)}┤${t.mod.reset}`);
      }
    }

    lines.push(`${indent}${t.border.default}╰${"─".repeat(cellW)}┴${"─".repeat(cellW)}╯${t.mod.reset}`);

  } else {
    // ─── Column / Ultra-Compact Mode ───
    const margin = mode === "ultra-compact" ? 1 : 2;
    const cellW = w - margin * 2 - 2;
    const indent = " ".repeat(margin);

    lines.push(`${indent}${t.border.default}╭${"─".repeat(cellW)}╮${t.mod.reset}`);

    for (let i = 0; i < courses.length; i++) {
      const co = courses[i];
      const pr = getCourseProgressSummary(co);
      const unlocked = isCourseUnlocked(co);
      const isSel = i === selectedIdx;
      const selColor = isSel ? getCourseColor(co) : "";
      const mk = themeMarker(isSel);
      const lockBadge = unlocked ? "" : `  ${renderBadge("LOCKED", "locked")}`;
      const isActive = co.status === "active" && unlocked;

      const name = ` ${mk}${co.icon}  ${isSel ? t.mod.bold : ""}${co.name}${t.mod.reset}${lockBadge}`;
      const barW = 12;
      const filled = Math.round(barW * pr.percent / 100);
      const fillColor = pr.percent >= 100 ? t.fg.success : pr.percent > 0 ? t.fg.accent : t.fg.secondary;
      const barStr = `${fillColor}${"\u2588".repeat(filled)}${t.fg.secondary}${"░".repeat(barW - filled)}${t.mod.reset}`;
      const statusTxt = isActive
        ? `${t.fg.secondary}Phase ${pr.currentPhase} · ${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons}${t.mod.reset}`
        : `${t.fg.secondary}${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons} Lektionen${t.mod.reset}`;
      const info = `   ${barStr} ${t.fg.accent}${String(pr.percent).padStart(3)}%${t.mod.reset}  ${statusTxt}`;
      const colHours = pr.actualHours > 0 ? pr.actualHours : (co.estimatedHours ?? "?");
      const colSects = pr.actualSections > 0 ? pr.actualSections : (co.totalSections ?? "?");
      const prereq = !unlocked ? `Braucht: ${co.prerequisiteDescription ?? ""}` : "";
      const detail = prereq
        ? `   ${t.fg.secondary}~${colHours}h · ${prereq}${t.mod.reset}`
        : `   ${t.fg.secondary}~${colHours}h · ${colSects} Sektionen${t.mod.reset}`;

      const cellLines = mode === "ultra-compact" ? [name, info] : [name, info, detail];

      for (const cl of cellLines) {
        const txt = plainCell(cl, cellW);
        const stl = selColor ? `${selColor}${txt}${t.mod.reset}` : txt;
        lines.push(`${indent}${t.border.default}│${t.mod.reset}${stl}${t.border.default}│${t.mod.reset}`);
      }

      if (i < courses.length - 1) {
        lines.push(`${indent}${t.border.default}├${"─".repeat(cellW)}┤${t.mod.reset}`);
      }
    }

    lines.push(`${indent}${t.border.default}╰${"─".repeat(cellW)}╯${t.mod.reset}`);
  }

  // ─── Recommendation Panel ───
  const rec = getRecommendedCourse();
  if (rec) {
    const recCourse = platformConfig.courses.find(co => co.id === rec.courseId);
    if (recCourse) {
      lines.push("");
      const recLines = renderPanel("Empfehlung", [
        `${t.fg.info}${recCourse.name}${t.mod.reset} ${t.fg.secondary}—${t.mod.reset} ${rec.lessonTitle}  ${t.mod.bold}[Enter]${t.mod.reset}`,
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
        `${t.fg.warning}${prereqName}${t.mod.reset}`,
        `Trotzdem oeffnen? ${t.mod.bold}[J]${t.mod.reset} Ja  ${t.mod.bold}[N]${t.mod.reset} Nein`,
      ], { width: Math.min(w - 8, 60), variant: "warning", boxStyle: "rounded" });
      const dIndent = " ".repeat(Math.max(1, Math.floor((w - Math.min(w - 8, 60)) / 2)));
      for (const dl of dLines) lines.push(`${dIndent}${dl}`);
    }
  }

  // ─── Pad to footer ───
  while (lines.length < h - 3) {
    lines.push("");
  }

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

  // ─── Animation ───
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
