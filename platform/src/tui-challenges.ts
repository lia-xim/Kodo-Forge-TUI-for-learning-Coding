/**
 * tui-challenges.ts — Misconceptions, Completion Problems
 */

import {
  c, padR, truncate, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter, wordWrap,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, updateTermSize, W, H,
  adaptiveState, STATE_DIR,
} from "./tui-state.ts";
import { updateConceptScore, saveAdaptiveState } from "./adaptive-engine.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { renderLessonMenu } from "./tui-lesson-menu.ts";
import { HIDE_CURSOR, SHOW_CURSOR } from "./tui-render.ts";

// ─── Misconception Challenge Screen ──────────────────────────────────────

export function renderMisconceptions(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "misconceptions" }>;
  const { misconceptions, currentIndex, answered, showingResolution, score } = screen;
  const w = W();
  const h = H();

  if (misconceptions.length === 0) {
    lines.push(renderHeader(" Misconception Challenge", ""));
    lines.push(boxTop(w)); lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.dim}Keine Misconceptions fuer diese Lektion verfuegbar.${c.reset}`, w));
    lines.push(bLine(`  ${c.dim}Diese werden von einem parallelen Agenten erstellt.${c.reset}`, w));
    const footerStart = h - 3;
    while (lines.length < footerStart) lines.push(bEmpty(w));
    lines.push(...renderFooter([`${c.bold}[Q]${c.reset} Zurueck`]));
    flushScreen(lines);
    return;
  }

  const mc = misconceptions[currentIndex];
  lines.push(renderHeader(` Misconception Challenge`, `${currentIndex + 1}/${misconceptions.length}  Punkte: ${score} `));
  lines.push(boxTop(w)); lines.push(bEmpty(w));

  if (!answered) {
    lines.push(bLine(`  ${c.bold}Dieser Code sieht richtig aus. Finde den Bug!${c.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(55, w - 6))}${c.reset}`, w));
    for (const cl of mc.code.split("\n")) { lines.push(bLine(`  ${c.cyan}  ${truncate(cl, w - 10)}${c.reset}`, w)); }
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(55, w - 6))}${c.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}Was denkst du?${c.reset}`, w));
    lines.push(bLine(`  ${c.bold}[A]${c.reset} Der Code ist korrekt`, w));
    lines.push(bLine(`  ${c.bold}[B]${c.reset} Es gibt einen subtilen Fehler`, w));
    lines.push(bEmpty(w));
  }

  if (showingResolution) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    lines.push(bLine(`  ${c.yellow}${c.bold}Aufloesung:${c.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}Was die meisten denken:${c.reset}`, w));
    for (const bl of wordWrap(mc.commonBelief, w - 8)) { lines.push(bLine(`    ${c.dim}${bl}${c.reset}`, w)); }
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}Realitaet:${c.reset}`, w));
    for (const rl of wordWrap(mc.reality, w - 8)) { lines.push(bLine(`    ${c.cyan}${rl}${c.reset}`, w)); }
    lines.push(bEmpty(w));
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));

  if (answered) {
    const footerItems: string[] = [];
    if (currentIndex < misconceptions.length - 1) { footerItems.push(`${c.bold}[Enter]${c.reset} Naechste`); }
    footerItems.push(`${c.bold}[Q]${c.reset} Zurueck`);
    lines.push(...renderFooter(footerItems));
  } else {
    lines.push(...renderFooter([`${c.bold}[A]${c.reset} Korrekt`, `${c.bold}[B]${c.reset} Fehler gefunden`, `${c.bold}[Q]${c.reset} Zurueck`]));
  }
  flushScreen(lines);
}

export function handleMisconceptionsInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "misconceptions" }>;

  if (screen.misconceptions.length === 0) {
    if (key.name === "q" || key.name === "escape") {
      setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
      renderLessonMenu(screen.lessonIndex);
    }
    return;
  }

  if (key.name === "q" || key.name === "escape") {
    setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
    renderLessonMenu(screen.lessonIndex);
    return;
  }

  if (screen.answered) {
    if (key.name === "enter") {
      if (screen.currentIndex < screen.misconceptions.length - 1) {
        screen.currentIndex++; screen.answered = false; screen.showingResolution = false;
        renderMisconceptions();
      } else {
        setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
        renderLessonMenu(screen.lessonIndex);
      }
    }
    return;
  }

  if (key.name === "a") {
    screen.answered = true; screen.showingResolution = true; screen.selectedOption = 0;
    renderMisconceptions();
    return;
  }
  if (key.name === "b") {
    screen.answered = true; screen.showingResolution = true; screen.selectedOption = 1; screen.score++;
    const mc = screen.misconceptions[screen.currentIndex];
    if (mc.concept) { updateConceptScore(adaptiveState, mc.concept, true); saveAdaptiveState(STATE_DIR, adaptiveState); }
    renderMisconceptions();
    return;
  }
}

// ─── Completion Problem Screen ───────────────────────────────────────────

export function renderCompletionProblem(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "completion" }>;
  const { problems, currentProblem, currentBlank, userInput, filledBlanks, showingHint, showingSolution, score } = screen;
  const w = W();
  const h = H();

  if (problems.length === 0) {
    lines.push(renderHeader(" Completion Problems", ""));
    lines.push(boxTop(w)); lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.dim}Keine Completion Problems fuer diese Lektion verfuegbar.${c.reset}`, w));
    lines.push(bLine(`  ${c.dim}Diese werden von einem parallelen Agenten erstellt.${c.reset}`, w));
    const footerStart = h - 3;
    while (lines.length < footerStart) lines.push(bEmpty(w));
    lines.push(...renderFooter([`${c.bold}[Q]${c.reset} Zurueck`]));
    flushScreen(lines);
    return;
  }

  const prob = problems[currentProblem];
  const blank = prob.blanks[currentBlank];

  lines.push(renderHeader(` Completion Problem`, `${currentProblem + 1}/${problems.length}  Punkte: ${score} `));
  lines.push(boxTop(w)); lines.push(bEmpty(w));

  for (const dl of wordWrap(prob.description, w - 6)) { lines.push(bLine(`  ${c.bold}${dl}${c.reset}`, w)); }
  lines.push(bEmpty(w));

  lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(55, w - 6))}${c.reset}`, w));
  let templateDisplay = prob.template;
  for (let i = 0; i < prob.blanks.length; i++) {
    const ph = prob.blanks[i].placeholder;
    if (i < filledBlanks.length) {
      templateDisplay = templateDisplay.replace(ph, `${c.green}${filledBlanks[i]}${c.reset}${c.cyan}`);
    } else if (i === currentBlank) {
      templateDisplay = templateDisplay.replace(ph, `${c.yellow}${c.bold}______${c.reset}${c.cyan}`);
    }
  }
  for (const tl of templateDisplay.split("\n")) { lines.push(bLine(`  ${c.cyan}  ${truncate(tl, w - 10)}${c.reset}`, w)); }
  lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(55, w - 6))}${c.reset}`, w));
  lines.push(bEmpty(w));

  if (currentBlank < prob.blanks.length) {
    lines.push(bLine(`  Luecke ${currentBlank + 1}/${prob.blanks.length}: ${c.bold}${blank.placeholder}${c.reset}`, w));
    if (showingHint) { lines.push(bLine(`  ${c.yellow}Hint: ${blank.hint}${c.reset}`, w)); }
    lines.push(bLine(`  > Deine Antwort: ${c.cyan}${userInput}\u2588${c.reset}`, w));
  } else {
    lines.push(bLine(`  ${c.green}${c.bold}Alle Luecken ausgefuellt!${c.reset}`, w));
    if (showingSolution) {
      lines.push(bEmpty(w));
      lines.push(bLine(`  ${c.dim}Musterloesung:${c.reset}`, w));
      for (const sl of prob.solution.split("\n")) { lines.push(bLine(`  ${c.cyan}  ${truncate(sl, w - 10)}${c.reset}`, w)); }
    }
  }

  lines.push(bEmpty(w));
  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));

  if (currentBlank >= prob.blanks.length) {
    const footerItems: string[] = [];
    if (currentProblem < problems.length - 1) { footerItems.push(`${c.bold}[Enter]${c.reset} Naechstes Problem`); }
    footerItems.push(`${c.bold}[L]${c.reset} Loesung`, `${c.bold}[Q]${c.reset} Zurueck`);
    lines.push(...renderFooter(footerItems));
  } else {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Pruefen`, `${c.bold}[H]${c.reset} Hint`, `${c.bold}[Q]${c.reset} Zurueck`]));
  }
  flushScreen(lines);
}

export function handleCompletionInput(key: ParsedKey, rawData: Buffer): void {
  const screen = currentScreen as Extract<Screen, { type: "completion" }>;

  if (screen.problems.length === 0) {
    if (key.name === "q" || key.name === "escape") {
      setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
      renderLessonMenu(screen.lessonIndex);
    }
    return;
  }

  if (key.name === "q" || key.name === "escape") {
    process.stdout.write(HIDE_CURSOR);
    setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
    renderLessonMenu(screen.lessonIndex);
    return;
  }

  const prob = screen.problems[screen.currentProblem];

  if (screen.currentBlank >= prob.blanks.length) {
    if (key.name === "enter") {
      if (screen.currentProblem < screen.problems.length - 1) {
        screen.currentProblem++; screen.currentBlank = 0; screen.userInput = "";
        screen.filledBlanks = []; screen.showingHint = false; screen.showingSolution = false;
        renderCompletionProblem();
      } else {
        process.stdout.write(HIDE_CURSOR);
        setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
        renderLessonMenu(screen.lessonIndex);
      }
      return;
    }
    if (key.name === "l") { screen.showingSolution = !screen.showingSolution; renderCompletionProblem(); return; }
    return;
  }

  if (key.raw === "h" && screen.userInput.length === 0) {
    screen.showingHint = !screen.showingHint; renderCompletionProblem(); return;
  }

  if (key.name === "enter") {
    const blank = prob.blanks[screen.currentBlank];
    const userAnswer = screen.userInput.trim().toLowerCase();
    const correctAnswer = blank.answer.trim().toLowerCase();
    if (userAnswer === correctAnswer) { screen.score++; }
    screen.filledBlanks.push(screen.userInput.trim() || blank.answer);
    screen.currentBlank++; screen.userInput = ""; screen.showingHint = false;
    renderCompletionProblem();
    return;
  }

  if (key.name === "backspace") { screen.userInput = screen.userInput.slice(0, -1); renderCompletionProblem(); return; }
  if (key.raw.length === 1 && key.raw.charCodeAt(0) >= 32) { screen.userInput += key.raw; renderCompletionProblem(); return; }
  if (key.name === "space") { screen.userInput += " "; renderCompletionProblem(); return; }
  if (rawData.length > 1 && rawData[0] !== 0x1b) { screen.userInput += rawData.toString("utf-8"); renderCompletionProblem(); return; }
}
