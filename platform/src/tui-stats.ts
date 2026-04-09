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

// ─── Statistiken ──────────────────────────────────────────────────────────

export function renderStats(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as { type: "stats"; scrollOffset: number };
  const offset = screen.scrollOffset;
  const w = W();
  const h = H();

  const t = theme;

  lines.push(renderHeaderBar(" Statistiken", `${lessons.length} Lektionen `, w));
  lines.push(boxTop(w)); lines.push(bEmpty(w));

  const contentLines: string[] = [];

  const recentActivity = getRecentActivityValues(7);
  const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const today = new Date().getDay();
  const startDay = ((today === 0 ? 7 : today) - 6 + 7) % 7;

  contentLines.push(` ${sectionDivider("Lernverlauf (7 Tage)", Math.max(10, w - 6))}`);
  contentLines.push("");

  if (recentActivity.some((v) => v > 0)) {
    const spark = colorSparkline(recentActivity);
    const labelLine = recentActivity.map((_, idx) => dayLabels[(startDay + idx) % 7]).join(" ");
    contentLines.push(`  ${spark}`);
    contentLines.push(`  ${t.fg.muted}${labelLine}${t.mod.reset}`);
  } else { contentLines.push(`  ${t.fg.muted}Noch keine Aktivitäten aufgezeichnet${t.mod.reset}`); }
  contentLines.push("");

  contentLines.push(` ${sectionDivider("Fortschritt pro Lektion", Math.max(10, w - 6))}`);
  contentLines.push("");

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const mastery = calculateMastery(i);
    contentLines.push(`  ${t.mod.bold}${lesson.number} ${lesson.title}${t.mod.reset}  ${masteryBar(mastery)}`);

    let sectDone = 0;
    for (let s = 0; s < lesson.sections.length; s++) { if (getSectionStatus(getSectionKey(i, s)) === "completed") sectDone++; }
    const barWidth = Math.max(8, Math.floor((w - 50) / 2));
    const sectPct = lesson.sections.length > 0 ? Math.round((sectDone / lesson.sections.length) * 100) : 0;
    const exProg = countExerciseProgress(lesson);
    const exPct = exProg.total > 0 ? Math.round((exProg.solved / exProg.total) * 100) : 0;
    contentLines.push(`     Sektionen:  ${fineProgressBar(sectPct, barWidth)} ${sectDone}/${lesson.sections.length}   Exercises: ${fineProgressBar(exPct, barWidth)} ${exProg.solved}/${exProg.total}`);
    if (lesson.hasQuiz) {
      const quizData = progress.quizzes[lesson.number];
      const quizText = quizData ? `${quizData.score}/${quizData.total} (${Math.round((quizData.score / quizData.total) * 100)}%)` : `${t.fg.muted}---${t.mod.reset}`;
      contentLines.push(`     Quiz: ${quizText}`);
    }
    contentLines.push("");
  }

  contentLines.push(` ${sectionDivider("Review-Statistik", Math.max(10, w - 6))}`);
  contentLines.push("");
  const dueCount = getDueReviewCount();
  const streak = getReviewStreak();
  contentLines.push(`  ${t.mod.bold}Fällige Fragen:${t.mod.reset}  ${t.fg.warning}${dueCount}${t.mod.reset}   ${t.mod.bold}Reviews:${t.mod.reset} ${t.fg.success}${streak} gesamt${t.mod.reset}`);
  contentLines.push("");

  const contentHeight2 = h - 6;
  const visibleLines = contentLines.slice(offset, offset + contentHeight2);
  for (const cl of visibleLines) { lines.push(bLine(` ${padR(cl, w - 4)}`, w)); }
  for (let fill = visibleLines.length; fill < contentHeight2; fill++) { lines.push(bEmpty(w)); }

  const footerHints: FooterHint[] = [];
  if (offset > 0 || offset + contentHeight2 < contentLines.length) { footerHints.push({ key: "↑↓", label: "Scrollen" }); }
  footerHints.push({ key: "←/Esc", label: "Zurück" });
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

  const t = theme;

  lines.push(renderHeaderBar(" Deine Kompetenzen", `${lessons.length} Lektionen `, w));
  lines.push(boxTop(w));

  const contentLines: string[] = [];
  contentLines.push("");

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const mastery = calculateMastery(i);
    contentLines.push(`  ${t.mod.bold}${lesson.number} ${lesson.title}${t.mod.reset}  ${masteryBar(mastery)}`);

    let sectDone = 0;
    for (let s = 0; s < lesson.sections.length; s++) { if (getSectionStatus(getSectionKey(i, s)) === "completed") sectDone++; }
    const exProg = countExerciseProgress(lesson);
    const quizData = progress.quizzes[lesson.number];

    if (sectDone > 0) { contentLines.push(`     ${t.fg.success}✓${t.mod.reset} Du kannst: ${sectDone}/${lesson.sections.length} Sektionen gelesen`); }
    if (exProg.solved > 0) { contentLines.push(`     ${t.fg.success}✓${t.mod.reset} Du kannst: ${exProg.solved}/${exProg.total} Exercises gelöst`); }
    if (quizData) { contentLines.push(`     ${t.fg.success}✓${t.mod.reset} Quiz: ${Math.round((quizData.score / quizData.total) * 100)}% erreicht`); }

    if (mastery === "newcomer") {
      contentLines.push(`     ${t.fg.info}→${t.mod.reset} Nächstes: ${sectDone === 0 ? "Sektion 1" : `Sektion ${sectDone + 1}`} lesen`);
    } else if (mastery === "familiar") { contentLines.push(`     ${t.fg.info}→${t.mod.reset} Nächstes: Exercises bearbeiten`); }
    else if (mastery === "proficient") { contentLines.push(`     ${t.fg.info}→${t.mod.reset} Nächstes: Quiz oder Misconception-Challenge`); }
    else { contentLines.push(`     ${t.fg.success}✓${t.mod.reset} Gemeistert!`); }
    contentLines.push("");
  }

  const recentActivity = getRecentActivityValues(7);
  if (recentActivity.some((v) => v > 0)) {
    contentLines.push(` ${sectionDivider("Lernverlauf (letzte 7 Tage)", Math.max(10, w - 6))}`);
    contentLines.push("");
    const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const today = new Date().getDay();
    const startDay = ((today === 0 ? 7 : today) - 6 + 7) % 7;
    const spark = colorSparkline(recentActivity);
    const labelLine = recentActivity.map((_, idx) => dayLabels[(startDay + idx) % 7]).join(" ");
    contentLines.push(`  ${spark}`);
    contentLines.push(`  ${t.fg.muted}${labelLine}${t.mod.reset}`);
    contentLines.push("");
  }

  const completedCount = getCompletedLessonIndices().length;
  if (completedCount >= 3) {
    contentLines.push(`  ${t.fg.accent}${t.mod.bold}Empfehlung:${t.mod.reset} Du hast ${completedCount} Lektionen abgeschlossen.`);
    contentLines.push(`  ${t.fg.info}→ Starte eine Interleaved Review Challenge!${t.mod.reset}`);
    contentLines.push("");
  }

  const contentHeight2 = h - 6;
  const visibleLines = contentLines.slice(offset, offset + contentHeight2);
  for (const cl of visibleLines) { lines.push(bLine(` ${padR(cl, w - 4)}`, w)); }
  for (let fill = visibleLines.length; fill < contentHeight2; fill++) { lines.push(bEmpty(w)); }

  const footerHints: FooterHint[] = [
    { key: "↑↓", label: "Scrollen" },
    { key: "←/Esc", label: "Zurück" },
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
