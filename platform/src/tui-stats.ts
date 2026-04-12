/**
 * tui-stats.ts — Stats / Competence Dashboard
 */

import {
  c, padR, truncate, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter, getContentHeight,
} from "./tui-render.ts";
import { progressBar as fineProgressBar, colorSparkline, sectionDivider } from "./visual-utils.ts";
import {
  currentScreen, setCurrentScreen, lessons, progress, updateTermSize, W, H,
  getSectionKey, getSectionStatus, countExerciseProgress,
  calculateMastery, masteryBar, getRecentActivityValues,
  getDueReviewCount, getReviewStreak, getCompletedLessonIndices,
} from "./tui-state.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { theme } from "./tui-theme.ts";
import { renderHeaderBar, renderFooterBar, type FooterHint } from "./tui-components.ts";
import { t } from "./i18n.ts";

// ─── Statistiken ──────────────────────────────────────────────────────────

export function renderStats(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as { type: "stats"; scrollOffset: number };
  const offset = screen.scrollOffset;
  const w = W();
  const h = H();

  const th = theme;

  lines.push(renderHeaderBar(` ${t("breadcrumb.stats")}`, `${t("stats.lessonsLabel", { count: String(lessons.length) })} `, w));
  lines.push(boxTop(w)); lines.push(bEmpty(w));

  const contentLines: string[] = [];

  const recentActivity = getRecentActivityValues(7);
  const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const today = new Date().getDay();
  const startDay = ((today === 0 ? 7 : today) - 6 + 7) % 7;

  contentLines.push(` ${sectionDivider(t("stats.learningHistory7d"), Math.max(10, w - 6))}`);
  contentLines.push("");

  if (recentActivity.some((v) => v > 0)) {
    const spark = colorSparkline(recentActivity);
    const labelLine = recentActivity.map((_, idx) => dayLabels[(startDay + idx) % 7]).join(" ");
    contentLines.push(`  ${spark}`);
    contentLines.push(`  ${th.fg.muted}${labelLine}${th.mod.reset}`);
  } else { contentLines.push(`  ${th.fg.muted}${t("stats.noActivity")}${th.mod.reset}`); }
  contentLines.push("");

  contentLines.push(` ${sectionDivider(t("stats.progressPerLesson"), Math.max(10, w - 6))}`);
  contentLines.push("");

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const mastery = calculateMastery(i);
    contentLines.push(`  ${th.mod.bold}${lesson.number} ${lesson.title}${th.mod.reset}  ${masteryBar(mastery)}`);

    let sectDone = 0;
    for (let s = 0; s < lesson.sections.length; s++) { if (getSectionStatus(getSectionKey(i, s)) === "completed") sectDone++; }
    const barWidth = Math.max(8, Math.floor((w - 50) / 2));
    const sectPct = lesson.sections.length > 0 ? Math.round((sectDone / lesson.sections.length) * 100) : 0;
    const exProg = countExerciseProgress(lesson);
    const exPct = exProg.total > 0 ? Math.round((exProg.solved / exProg.total) * 100) : 0;
    contentLines.push(`     Sektionen:  ${fineProgressBar(sectPct, barWidth)} ${sectDone}/${lesson.sections.length}   Exercises: ${fineProgressBar(exPct, barWidth)} ${exProg.solved}/${exProg.total}`);
    if (lesson.hasQuiz) {
      const quizData = progress.quizzes[lesson.number];
      const quizText = quizData ? `${quizData.score}/${quizData.total} (${Math.round((quizData.score / quizData.total) * 100)}%)` : `${th.fg.muted}---${th.mod.reset}`;
      contentLines.push(`     Quiz: ${quizText}`);
    }
    contentLines.push("");
  }

  contentLines.push(` ${sectionDivider(t("stats.reviewStats"), Math.max(10, w - 6))}`);
  contentLines.push("");
  const dueCount = getDueReviewCount();
  const streak = getReviewStreak();
  contentLines.push(`  ${th.mod.bold}${t("stats.dueQuestions")}${th.mod.reset}  ${th.fg.warning}${dueCount}${th.mod.reset}   ${th.mod.bold}${t("stats.reviews")}${th.mod.reset} ${th.fg.success}${streak} ${t("stats.total")}${th.mod.reset}`);
  contentLines.push("");

  const contentHeight2 = h - 6;
  const visibleLines = contentLines.slice(offset, offset + contentHeight2);
  for (const cl of visibleLines) { lines.push(bLine(` ${padR(cl, w - 4)}`, w)); }
  for (let fill = visibleLines.length; fill < contentHeight2; fill++) { lines.push(bEmpty(w)); }

  const footerHints: FooterHint[] = [];
  if (offset > 0 || offset + contentHeight2 < contentLines.length) { footerHints.push({ key: "↑↓", label: t("competence.scroll") }); }
  footerHints.push({ key: "←/Esc", label: t("competence.back") });
  lines.push(...renderFooterBar(footerHints, w));
  flushScreen(lines);
}

export function handleStatsInput(key: ParsedKey): void {
  const screen = currentScreen as { type: "stats"; scrollOffset: number };
  const maxScrollOffset = Math.max(0, lessons.length * 8 + 20 - (H() - 6));

  if (key.name === "up" || key.name === "pageup" || key.name === "mouse-scroll-up") { screen.scrollOffset = Math.max(0, screen.scrollOffset - 3); renderStats(); return; }
  if (key.name === "down" || key.name === "pagedown" || key.name === "mouse-scroll-down") { screen.scrollOffset = Math.min(screen.scrollOffset + 3, maxScrollOffset); renderStats(); return; }
  if (key.name === "escape" || key.name === "backspace" || key.name === "left" || key.name === "q") {
    setCurrentScreen({ type: "main", selectedIndex: 0 }); renderMainMenu(); return;
  }
}

// ─── Kompetenz-Dashboard ─────────────────────────────────────────────────

export function renderCompetenceDashboard(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "competence" }>;
  const offset = screen.scrollOffset;
  const w = W();
  const h = H();

  const th = theme;

  lines.push(renderHeaderBar(` ${t("competence.title")}`, `${t("stats.lessonsLabel", { count: String(lessons.length) })} `, w));
  lines.push(boxTop(w));

  const contentLines: string[] = [];
  contentLines.push("");

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const mastery = calculateMastery(i);
    contentLines.push(`  ${th.mod.bold}${lesson.number} ${lesson.title}${th.mod.reset}  ${masteryBar(mastery)}`);

    let sectDone = 0;
    for (let s = 0; s < lesson.sections.length; s++) { if (getSectionStatus(getSectionKey(i, s)) === "completed") sectDone++; }
    const exProg = countExerciseProgress(lesson);
    const quizData = progress.quizzes[lesson.number];

    if (sectDone > 0) { contentLines.push(`     ${th.fg.success}✓${th.mod.reset} ${t("competence.youCan")} ${t("competence.sectionsRead", { done: String(sectDone), total: String(lesson.sections.length) })}`); }
    if (exProg.solved > 0) { contentLines.push(`     ${th.fg.success}✓${th.mod.reset} ${t("competence.youCan")} ${t("competence.exercisesSolved", { solved: String(exProg.solved), total: String(exProg.total) })}`); }
    if (quizData) { contentLines.push(`     ${th.fg.success}✓${th.mod.reset} ${t("competence.quizReached", { pct: String(Math.round((quizData.score / quizData.total) * 100)) })}`); }

    if (mastery === "newcomer") {
      const sectionNum = sectDone === 0 ? "1" : String(sectDone + 1);
      contentLines.push(`     ${th.fg.info}→${th.mod.reset} ${t("competence.next")} ${t("competence.readSection", { num: sectionNum })}`);
    } else if (mastery === "familiar") { contentLines.push(`     ${th.fg.info}→${th.mod.reset} ${t("competence.next")} ${t("competence.doExercises")}`); }
    else if (mastery === "proficient") { contentLines.push(`     ${th.fg.info}→${th.mod.reset} ${t("competence.next")} ${t("competence.quizOrMisconception")}`); }
    else { contentLines.push(`     ${th.fg.success}✓${th.mod.reset} ${t("competence.mastered")}`); }
    contentLines.push("");
  }

  const recentActivity = getRecentActivityValues(7);
  if (recentActivity.some((v) => v > 0)) {
    contentLines.push(` ${sectionDivider(t("stats.learningHistoryLast7d"), Math.max(10, w - 6))}`);
    contentLines.push("");
    const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const today = new Date().getDay();
    const startDay = ((today === 0 ? 7 : today) - 6 + 7) % 7;
    const spark = colorSparkline(recentActivity);
    const labelLine = recentActivity.map((_, idx) => dayLabels[(startDay + idx) % 7]).join(" ");
    contentLines.push(`  ${spark}`);
    contentLines.push(`  ${th.fg.muted}${labelLine}${th.mod.reset}`);
    contentLines.push("");
  }

  const completedCount = getCompletedLessonIndices().length;
  if (completedCount >= 3) {
    contentLines.push(`  ${th.fg.accent}${th.mod.bold}${t("competence.recommendation")}${th.mod.reset} ${t("competence.completedLessons", { count: String(completedCount) })}`);
    contentLines.push(`  ${th.fg.info}${t("competence.interleavedHint")}${th.mod.reset}`);
    contentLines.push("");
  }

  const contentHeight2 = h - 6;
  const visibleLines = contentLines.slice(offset, offset + contentHeight2);
  for (const cl of visibleLines) { lines.push(bLine(` ${padR(cl, w - 4)}`, w)); }
  for (let fill = visibleLines.length; fill < contentHeight2; fill++) { lines.push(bEmpty(w)); }

  const footerHints: FooterHint[] = [
    { key: "↑↓", label: t("competence.scroll") },
    { key: "←/Esc", label: t("competence.back") },
  ];
  lines.push(...renderFooterBar(footerHints, w));
  flushScreen(lines);
}

export function handleCompetenceInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "competence" }>;
  const maxScrollOffset = Math.max(0, lessons.length * 10 + 30 - (H() - 6));

  if (key.name === "up" || key.name === "pageup" || key.name === "mouse-scroll-up") { screen.scrollOffset = Math.max(0, screen.scrollOffset - 3); renderCompetenceDashboard(); return; }
  if (key.name === "down" || key.name === "pagedown" || key.name === "mouse-scroll-down") { screen.scrollOffset = Math.min(screen.scrollOffset + 3, maxScrollOffset); renderCompetenceDashboard(); return; }
  if (key.name === "escape" || key.name === "backspace" || key.name === "left" || key.name === "q") {
    setCurrentScreen({ type: "main", selectedIndex: 0 }); renderMainMenu(); return;
  }
}
