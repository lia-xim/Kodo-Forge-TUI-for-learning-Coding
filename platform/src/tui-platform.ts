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
  SESSION_START, sessionStats,
  switchLocale, getLocale, type Locale,
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
import { t } from "./i18n.ts";

// ─── Layout-Typen ──────────────────────────────────────────────────────────

type LayoutMode = "grid-2x2" | "column-1" | "ultra-compact" | "list";

function getLayoutMode(): LayoutMode {
  const w = process.stdout.columns || 80;
  if (w >= 130) return "grid-2x2";
  if (w >= 80)  return "column-1";
  if (w >= 55)  return "ultra-compact";
  return "list";
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

// ─── ASCII Art Logo ────────────────────────────────────────────────────────

const LOGO_LINES = [
  `██╗  ██╗ ██████╗ ██████╗  ██████╗     ███████╗ ██████╗ ██████╗   ██████╗ ███████╗`,
  `██║ ██╔╝██╔═══██╗██╔══██╗██╔═══██╗    ██╔════╝██╔═══██╗██╔══██╗ ██╔════╝ ██╔════╝`,
  `█████╔╝ ██║   ██║██║  ██║██║   ██║    █████╗  ██║   ██║██████╔╝ ██║  ███╗█████╗  `,
  `██╔═██╗ ██║   ██║██║  ██║██║   ██║    ██╔══╝  ██║   ██║██╔══██╗ ██║   ██║██╔══╝  `,
  `██║  ██╗╚██████╔╝██████╔╝╚██████╔╝    ██║     ╚██████╔╝██║  ██║ ╚██████╔╝███████╗`,
  `╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝  ╚═════╝ ╚══════╝`,
];

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
  const th = theme;
  const reset = th.mod.reset;

  // ─── Section A: Header with right-aligned stats ───
  const timerStr = formatSessionTime();
  const dueCount = getDueReviewCount();
  const streak = getReviewStreak();

  const headerRightParts: string[] = [];
  if (streak > 0) {
    headerRightParts.push(`${th.fg.accent}★${reset} ${th.mod.bold}${streak}${reset}${th.fg.secondary}d${reset}`);
  }
  if (dueCount > 0) {
    headerRightParts.push(`${th.fg.warning}●${reset} ${th.mod.bold}${dueCount}${reset}${th.fg.warning} ${t("platform.due")}${reset}`);
  } else {
    headerRightParts.push(`${th.fg.success}✓${reset}${th.fg.secondary} ${t("platform.current")}${reset}`);
  }
  headerRightParts.push(`\u23F1 ${timerStr}`);
  const headerRight = ` ${headerRightParts.join("  ")} `;
  lines.push(renderHeaderBar(` Kodo Forge`, headerRight, w));

  // ─── Responsive breakpoints ───────────────────────────────────────────────
  const W_XL  = w >= 130;   // 2x2 grid + full logo + horizontal lernpfad
  const W_L   = w >= 88;    // single column + ASCII logo + horizontal lernpfad
  const W_M   = w >= 55;    // single column + wordmark + vertical lernpfad
  // W_S = w < 55           // ultra-minimal course list only
  const H_TALL = h >= 30;   // enough vertical room for logo

  // ─── Section B: Logo / Wordmark ─────────────────────────────────────────
  if (W_L && H_TALL) {
    // Full 6-line ASCII art (fits at w≥88, logo is ~82 chars wide)
    lines.push("");
    const logoColors = [
      `${th.mod.bold}${th.fg.accent}`,
      `${th.mod.bold}${th.fg.accent}`,
      `${th.fg.accent}`,
      `${th.fg.accent}`,
      `${th.fg.accentDim}`,
      `${th.fg.accentDim}`,
    ];
    for (let i = 0; i < LOGO_LINES.length; i++) {
      const ll = LOGO_LINES[i];
      const leftPad = Math.max(0, Math.floor((w - ll.length) / 2));
      lines.push(`${" ".repeat(leftPad)}${logoColors[i]}${ll}${reset}`);
    }
    const tagline = t("platform.tagline");
    const tagPad = Math.max(0, Math.floor((w - tagline.length) / 2));
    lines.push(`${" ".repeat(tagPad)}${th.fg.secondary}${tagline}${reset}`);
    lines.push("");
    lines.push(`${th.border.muted}${"─".repeat(w)}${reset}`);
    lines.push("");
  } else if (W_M) {
    // Compact wordmark on one line
    lines.push(`  ${th.mod.bold}${th.fg.accent}KODO FORGE${reset}   ${th.fg.secondary}${t("platform.title")}${reset}`);
    lines.push(`${th.border.muted}${"─".repeat(w)}${reset}`);
    lines.push("");
  } else {
    // S: header already shows "Kodo Forge", just a separator
    lines.push(`${th.border.muted}${"─".repeat(w)}${reset}`);
    lines.push("");
  }

  // ─── Section C: Learning Path + Activity Stats ───

  // Shared stats data
  const activityVals = getRecentActivityValues(28);
  const spark = sparkline(activityVals.slice(-14));
  const actStreak = getReviewStreak();
  const actDueCount = getDueReviewCount();
  const today = activityVals[activityVals.length - 1] ?? 0;
  const weekTotal = activityVals.slice(-7).reduce((a, b) => a + b, 0);
  const elapsed = Date.now() - SESSION_START;
  const sessionMins = Math.floor(elapsed / 60000);
  const sessionTime = sessionMins >= 60
    ? `${Math.floor(sessionMins / 60)}h ${sessionMins % 60}m`
    : `${sessionMins}m`;
  const statParts = [
    actStreak > 0 ? `${th.fg.accent}★ ${actStreak}d${reset}` : `${th.fg.secondary}–${reset}`,
    `${th.fg.info}⏱ ${sessionTime}${reset}`,
    today > 0 ? `${th.fg.success}��� ${today} ${t("platform.today")}${reset}` : `${th.fg.secondary}0 ${t("platform.today")}${reset}`,
    `${th.fg.secondary}∑ ${weekTotal}${t("platform.week")}${reset}`,
    actDueCount > 0
      ? `${th.fg.warning}�� ${actDueCount} ${t("platform.due")}${reset}`
      : `${th.fg.success}✓ ${t("platform.current")}${reset}`,
  ];

  if (W_L) {
    // C1: Horizontal Lernpfad-Flowchart
    const nodeCount = courses.length;
    const arrowStr = ` ──▶ `;
    const arrowVis = 5;
    const nodeW = Math.max(12, Math.floor((w - 4 - arrowVis * (nodeCount - 1)) / nodeCount));

    let topLine = "  ";
    let botLine = "  ";

    for (let i = 0; i < nodeCount; i++) {
      const co = courses[i];
      const pr = getCourseProgressSummary(co);
      const unlocked = isCourseUnlocked(co);
      const isActive = co.id === platformConfig.activeCourse;

      const borderCol = isActive ? th.border.active : unlocked ? th.border.default : th.border.muted;
      const textCol   = isActive ? th.fg.accent     : unlocked ? th.fg.primary    : th.fg.muted;

      const name = truncate(co.name, nodeW - 2);
      const nameVis = stripAnsi(name).length;
      const namePad = " ".repeat(Math.max(0, nodeW - 2 - nameVis));
      topLine += `${borderCol}[${reset}${textCol}${name}${reset}${namePad}${borderCol}]${reset}`;

      let statusStr: string;
      if (isActive && unlocked) {
        const total = co.totalLessons ?? pr.totalLessons;
        statusStr = `${th.fg.accent}▸ L${pr.completedLessons}/${total}${reset}`;
      } else if (unlocked) {
        const total = co.totalLessons ?? pr.totalLessons;
        statusStr = `${th.fg.secondary}  L${pr.completedLessons}/${total}${reset}`;
      } else {
        statusStr = `${th.fg.muted}  ${t("platform.locked")}${reset}`;
      }
      const statusVis = stripAnsi(statusStr).length;
      const statusPad = " ".repeat(Math.max(0, nodeW - statusVis));
      botLine += `${statusStr}${statusPad}`;

      if (i < nodeCount - 1) {
        const arrowCol = unlocked ? th.fg.accentDim : th.fg.muted;
        topLine += `${arrowCol}${arrowStr}${reset}`;
        botLine += " ".repeat(arrowVis);
      }
    }

    lines.push(`  ${th.fg.secondary}${t("platform.lernpfad")}${reset}`);
    lines.push("");
    lines.push(topLine);
    lines.push(botLine);
    lines.push("");

    // C2: Full stats strip with sparkline
    const statsRow = `  ${th.fg.secondary}${t("platform.activity")}${reset}  ${th.fg.accent}${spark}${reset}    ${statParts.join("   ")}`;
    lines.push(statsRow);

  } else if (W_M) {
    // C1: Compact vertical Lernpfad list
    lines.push(`  ${th.fg.secondary}${t("platform.lernpfad")}${reset}`);
    lines.push("");
    for (let i = 0; i < courses.length; i++) {
      const co = courses[i];
      const pr = getCourseProgressSummary(co);
      const unlocked = isCourseUnlocked(co);
      const isActive = co.id === platformConfig.activeCourse;
      const borderCol = isActive ? th.border.active : unlocked ? th.fg.accentDim : th.border.muted;
      const textCol   = isActive ? th.fg.accent     : unlocked ? th.fg.primary   : th.fg.muted;
      const treeChar  = i < courses.length - 1 ? "├─" : "└─";
      let statusStr: string;
      if (isActive && unlocked) {
        const total = co.totalLessons ?? pr.totalLessons;
        statusStr = `${th.fg.accent}▸ L${pr.completedLessons}/${total}${reset}`;
      } else if (unlocked) {
        const total = co.totalLessons ?? pr.totalLessons;
        statusStr = `${th.fg.secondary}L${pr.completedLessons}/${total}${reset}`;
      } else {
        statusStr = `${th.fg.muted}${t("platform.locked")}${reset}`;
      }
      lines.push(`  ${borderCol}${treeChar}${reset} ${textCol}${co.icon} ${co.name}${reset}  ${statusStr}`);
    }
    lines.push("");

    // C2: 3 key stats only (no sparkline)
    lines.push(`  ${statParts[0]}   ${statParts[2]}   ${statParts[4]}`);

  } else {
    // W_S: Just a minimal one-line stat strip, no lernpfad
    lines.push(`  ${statParts[1]}   ${statParts[0]}`);
  }

  lines.push(`${th.border.muted}${"─".repeat(w)}${reset}`);
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
    const borderColor = isSel && isActiveCourse ? th.border.active
                      : isActiveCourse           ? th.fg.accentDim
                      : isSel                    ? getCourseColor(co)
                      :                            th.border.muted;

    const inner = cardW - 2;

    // Helper: pad a content string to inner width
    function padInner(s: string): string {
      const vis = stripAnsi(s).length;
      return s + " ".repeat(Math.max(0, inner - vis));
    }

    const cardLines: string[] = [];

    // ─ Top border with title inset ─
    const titleStr = `${co.icon}  ${isSel ? th.mod.bold : ""}${co.name}${reset}`;
    const titleVis = stripAnsi(titleStr).length;
    const titleFill = bSet.horizontal.repeat(Math.max(0, inner - titleVis - 4));
    const activeMark = isSel ? `${th.fg.accent}▸${reset}` : " ";
    cardLines.push(
      `${borderColor}${bSet.topLeft}${bSet.horizontal}${bSet.horizontal} ${reset}` +
      `${titleStr}` +
      `${borderColor} ${titleFill}${bSet.topRight}${reset}`
    );

    // ─ Selection marker row ─
    if (isSel) {
      cardLines.push(
        `${borderColor}${bSet.vertical}${reset}${padInner(` ${activeMark} ${t("platform.selected")}`)}${borderColor}${bSet.vertical}${reset}`
      );
    } else {
      cardLines.push(
        `${borderColor}${bSet.vertical}${reset}${" ".repeat(inner)}${borderColor}${bSet.vertical}${reset}`
      );
    }

    // ─ Progress bar ─
    const barW = Math.max(8, Math.floor(inner * 0.45));
    const bar = smoothProgress(pr.percent, barW);
    const pctColor = pr.percent >= 100 ? th.fg.success : pr.percent > 0 ? th.fg.accent : th.fg.secondary;
    const lessonCount = `L${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons}`;
    const barLine = ` ${bar}  ${pctColor}${String(pr.percent).padStart(3)}%${reset}  ${th.fg.secondary}${lessonCount}${reset}`;
    cardLines.push(
      `${borderColor}${bSet.vertical}${reset}${padInner(barLine)}${borderColor}${bSet.vertical}${reset}`
    );

    // ─ Segment dots + phase ─
    if (unlocked) {
      const total = Math.max(1, co.totalLessons ?? pr.totalLessons);
      const maxDots = Math.min(20, Math.floor(inner * 0.55));
      const filledDots = Math.round((pr.completedLessons / total) * maxDots);
      const dotBar = `${th.fg.accent}${"●".repeat(filledDots)}${th.fg.secondary}${"○".repeat(maxDots - filledDots)}${reset}`;
      const phaseText = pr.currentPhase ? `  Phase ${pr.currentPhase}` : "";
      const dotsLine = ` ${dotBar}${th.fg.secondary}${phaseText}${reset}`;
      cardLines.push(
        `${borderColor}${bSet.vertical}${reset}${padInner(dotsLine)}${borderColor}${bSet.vertical}${reset}`
      );
    } else {
      const prereq = co.prerequisiteDescription ?? t("platform.prerequisiteDefault");
      const lockLine = ` ${th.fg.muted}${prereq}${reset}`;
      cardLines.push(
        `${borderColor}${bSet.vertical}${reset}${padInner(lockLine)}${borderColor}${bSet.vertical}${reset}`
      );
    }

    // ─ Stats row ─
    let statsRow = "";
    if (unlocked) {
      const hours = pr.actualHours > 0 ? `~${pr.actualHours}h` : co.estimatedHours ? `~${co.estimatedHours}h` : "";
      const sects = pr.actualSections > 0 ? `${pr.actualSections} ${t("platform.sections")}` : co.totalSections ? `${co.totalSections} ${t("platform.sections")}` : "";
      statsRow = ` ${th.fg.secondary}${[hours, sects].filter(Boolean).join(" · ")}${reset}`;
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
      infoRow = ` ${th.fg.info}▸ L${nextNum}: ${pr.lastLessonTitle}${reset}`;
    } else if (!unlocked) {
      const topics = (co.topics ?? []).slice(0, 3).join(", ");
      if (topics) infoRow = ` ${th.fg.muted}${topics}${reset}`;
    } else {
      const topics = (co.topics ?? []).slice(0, 3).join(", ");
      if (topics) infoRow = ` ${th.fg.secondary}${topics}${reset}`;
    }
    cardLines.push(
      `${borderColor}${bSet.vertical}${reset}${padInner(infoRow)}${borderColor}${bSet.vertical}${reset}`
    );

    // ─ Empty row ─
    cardLines.push(
      `${borderColor}${bSet.vertical}${reset}${" ".repeat(inner)}${borderColor}${bSet.vertical}${reset}`
    );

    // ─ Bottom border ─
    const sigText = isActiveCourse ? ` [ ${t("platform.active")} ] ` : "";
    const sigVis = sigText.length;
    const bottomFillLeft = Math.max(0, inner - sigVis);
    cardLines.push(
      `${borderColor}${bSet.bottomLeft}${bSet.horizontal.repeat(bottomFillLeft)}${reset}` +
      (sigVis > 0 ? `${isActiveCourse ? th.fg.accent : th.fg.secondary}${sigText}${reset}` : "") +
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

  } else if (mode === "list") {
    // ─── Ultra-compact list rows (w < 55) ───
    for (let i = 0; i < courses.length; i++) {
      const co = courses[i];
      const pr = getCourseProgressSummary(co);
      const unlocked = isCourseUnlocked(co);
      const isSel = i === selectedIdx;
      const isActive = co.id === platformConfig.activeCourse;

      const selMark = isSel ? `${th.fg.accent}▸ ${reset}` : `  `;
      const textCol = isSel && isActive ? th.fg.accent
                    : isSel             ? getCourseColor(co)
                    : isActive          ? th.fg.accentDim
                    : unlocked          ? th.fg.primary
                    :                    th.fg.muted;

      const nameRaw = truncate(co.name, 14);
      const nameVis = stripAnsi(nameRaw).length;
      const namePad = " ".repeat(Math.max(0, 14 - nameVis));

      let rightPart: string;
      if (unlocked) {
        const barW = Math.max(4, w - 22);
        const bar = smoothProgress(pr.percent, barW);
        rightPart = `${bar} ${th.fg.secondary}${String(pr.percent).padStart(3)}%${reset}`;
      } else {
        rightPart = `${th.fg.muted}${t("platform.locked")}${reset}`;
      }

      lines.push(`${selMark}${textCol}${nameRaw}${reset}${namePad}  ${rightPart}`);
      if (i < courses.length - 1) lines.push("");
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

  // ─── Recommendation Panel ───
  const rec = getRecommendedCourse();
  if (rec && W_M) {
    const recCourse = platformConfig.courses.find(co => co.id === rec.courseId);
    if (recCourse) {
      lines.push("");
      const recLines = renderPanel(t("platform.recommendation"), [
        `${th.fg.info}${recCourse.name}${reset} ${th.fg.secondary}—${reset} ${rec.lessonTitle}  ${th.mod.bold}[Enter]${reset}`,
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
      const dLines = renderPanel(t("platform.prerequisite"), [
        `${th.fg.warning}${prereqName}${reset}`,
        `${t("platform.unlockConfirm")} ${th.mod.bold}[J]${reset} ${t("platform.yes")}  ${th.mod.bold}[N]${reset} ${t("platform.no")}`,
      ], { width: Math.min(w - 8, 60), variant: "warning", boxStyle: "rounded" });
      const dIndent = " ".repeat(Math.max(1, Math.floor((w - Math.min(w - 8, 60)) / 2)));
      for (const dl of dLines) lines.push(`${dIndent}${dl}`);
    }
  }

  // ─── Pad to footer ───
  while (lines.length < h - 3) lines.push("");

  // ─── Footer ───
  const navKey = mode === "grid-2x2" ? "↑↓←→" : "↑↓";
  const langLabel = `${t("language.label")}: ${getLocale() === "de" ? "DE" : "EN"}`;
  const footerHints: FooterHint[] = [
    { key: navKey, label: t("platform.selectCourse") },
    { key: "Enter", label: t("platform.open"), primary: true },
    { key: "I", label: t("platform.info") },
    { key: "L", label: langLabel },
    { key: "?", label: t("platform.help") },
    { key: "Q", label: t("platform.quit") },
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

  // Language toggle: DE ↔ EN
  if (key.name === "l") {
    const next: Locale = getLocale() === "de" ? "en" : "de";
    switchLocale(next);
    renderPlatformScreen();
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
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(t("platform.coursePlanned"), innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`${t("platform.plannedLessons", { count: String(course.totalLessons) })}: ${c.bold}${course.totalLessons}${c.reset}`, innerW)}${c.dim}\u2502${c.reset}`, w));
    const phases = Math.max(1, Math.ceil(course.totalLessons / 10));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`${t("platform.plannedPhases", { count: String(phases) })}: ${c.bold}${phases}${c.reset}`, innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(t("platform.soonAvailable"), innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(t("platform.continueTs"), innerW)}${c.dim}\u2502${c.reset}`, w));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, w));

    const curriculumPath = path.join(COURSES_ROOT, course.directory, "CURRICULUM.md");
    if (fs.existsSync(curriculumPath)) {
      lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`${c.bold}[C]${c.reset} ${t("platform.showCurriculum")}`, innerW)}${c.dim}\u2502${c.reset}`, w));
    }
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`${c.bold}[\u2190]${c.reset} ${t("platform.backToCourseSelect")}`, innerW)}${c.dim}\u2502${c.reset}`, w));
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
        `${c.bold}[\u2191\u2193]${c.reset} ${t("reader.scroll")}`,
        `${c.bold}[Esc]${c.reset} ${t("reader.back")}`,
      ]
    : [
        `${c.bold}[C]${c.reset} ${t("platform.curriculum")}`,
        `${c.bold}[\u2190/Esc]${c.reset} ${t("reader.back")}`,
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
