/**
 * tui-quiz.ts — Quiz, Warmup, Pretest, Interleaved Review Screens (inkl. Metacognitive Prompts)
 */

import {
  c, padR, truncate, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter, wordWrap,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, progress, updateTermSize, W, H,
  formatSessionTime, getBreadcrumb, getConfidenceFeedback, sessionStats,
  adaptiveState, STATE_DIR, getCompletedLessonIndices, markPretestTaken,
} from "./tui-state.ts";
import { updateConceptScore, saveAdaptiveState, setSectionDepth, type ContentDepth } from "./adaptive-engine.ts";
import { calculateDepth } from "./pretest-engine.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { renderLessonMenu } from "./tui-lesson-menu.ts";
import { openSection } from "./tui-section-reader.ts";

// ─── Warm-Up Screen ───────────────────────────────────────────────────────

export function renderWarmup(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "warmup" }>;
  const { questions, currentIndex, showingFeedback, feedbackCorrect, feedbackExplanation, done, answers } = screen;
  const w = W();
  const h = H();

  if (done) {
    const correct = answers.filter((a) => a.correct).length;
    lines.push(renderHeader(" Warm-Up Zusammenfassung", `${correct}/${answers.length} richtig `));
    lines.push(boxTop(w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}Warm-Up abgeschlossen!${c.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  Ergebnis: ${c.bold}${correct}${c.reset}/${answers.length} richtig`, w));
    lines.push(bEmpty(w));

    if (correct === answers.length) {
      lines.push(bLine(`  ${c.green}Perfekt! Dein Wissen sitzt fest.${c.reset}`, w));
    } else if (correct >= answers.length / 2) {
      lines.push(bLine(`  ${c.yellow}Gut! Ein paar Themen koenntest du wiederholen.${c.reset}`, w));
    } else {
      lines.push(bLine(`  ${c.red}Das Wissen ist noch nicht gefestigt. Wiederholung hilft!${c.reset}`, w));
    }

    lines.push(bEmpty(w));
    const footerStart = h - 3;
    while (lines.length < footerStart) lines.push(bEmpty(w));
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Zum Hauptmenue`]));
    flushScreen(lines);
    return;
  }

  const q = questions[currentIndex];
  const lesson = lessons[q.lessonIndex];
  const lessonLabel = lesson ? `Lektion ${lesson.number}: ${lesson.title}` : `Lektion ${q.lessonIndex + 1}`;

  lines.push(renderHeader(` Warm-Up`, `Frage ${currentIndex + 1}/${questions.length} `));
  lines.push(boxTop(w));
  lines.push(bEmpty(w));
  lines.push(bLine(`  ${c.dim}Aus ${lessonLabel}${c.reset}`, w));
  lines.push(bEmpty(w));

  const questionLines = wordWrap(q.question.question, w - 6);
  for (const ql of questionLines) { lines.push(bLine(`  ${c.bold}${ql}${c.reset}`, w)); }
  lines.push(bEmpty(w));

  if (q.question.code) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    for (const cl of q.question.code.split("\n")) { lines.push(bLine(`  ${c.cyan}  ${cl}${c.reset}`, w)); }
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    lines.push(bEmpty(w));
  }

  const labels = ["A", "B", "C", "D"];
  for (let i = 0; i < q.question.options.length && i < 4; i++) {
    lines.push(bLine(`  ${c.bold}[${labels[i]}]${c.reset} ${truncate(q.question.options[i], w - 12)}`, w));
  }
  lines.push(bEmpty(w));

  if (screen.phase === "confidence") {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    lines.push(bLine(`  ${c.bold}${c.yellow}Wie sicher bist du bei deiner Antwort?${c.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}[1]${c.reset} Geraten`, w));
    lines.push(bLine(`  ${c.bold}[2]${c.reset} Unsicher`, w));
    lines.push(bLine(`  ${c.bold}[3]${c.reset} Ziemlich sicher`, w));
    lines.push(bLine(`  ${c.bold}[4]${c.reset} Absolut sicher`, w));
    lines.push(bEmpty(w));
  }

  if (showingFeedback) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    if (feedbackCorrect) { lines.push(bLine(`  ${c.green}${c.bold}Richtig!${c.reset}`, w)); }
    else { lines.push(bLine(`  ${c.red}${c.bold}Falsch!${c.reset}`, w)); }
    for (const el of wordWrap(feedbackExplanation, w - 8)) { lines.push(bLine(`  ${c.dim}${el}${c.reset}`, w)); }
    if (screen.confidence !== undefined) {
      const calibration = getConfidenceFeedback(screen.confidence >= 3, feedbackCorrect);
      lines.push(bEmpty(w));
      lines.push(bLine(`  ${calibration}`, w));
    }
    lines.push(bEmpty(w));
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));

  if (screen.phase === "confidence") {
    lines.push(...renderFooter([`${c.bold}[1-4]${c.reset} Sicherheit waehlen`]));
  } else if (showingFeedback) {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Naechste Frage`]));
  } else {
    lines.push(...renderFooter([`${c.bold}[A-D]${c.reset} Antworten`, `${c.bold}[S]${c.reset} Warm-Up ueberspringen`]));
  }
  flushScreen(lines);
}

export function handleWarmupInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "warmup" }>;

  if (screen.done) {
    if (key.name === "enter") { setCurrentScreen({ type: "main", selectedIndex: 0 }); renderMainMenu(); }
    return;
  }

  if (screen.phase === "confidence") {
    const confMap: Record<string, number> = { "1": 1, "2": 2, "3": 3, "4": 4 };
    const conf = confMap[key.raw];
    if (conf !== undefined) {
      screen.confidence = conf;
      const correct = screen.pendingCorrect ?? false;
      screen.answers.push({ correct, skipped: false });
      screen.showingFeedback = true;
      screen.feedbackCorrect = correct;
      screen.feedbackExplanation = screen.pendingExplanation || "";
      screen.phase = "feedback";
      renderWarmup();
    }
    return;
  }

  if (screen.phase === "feedback" || screen.showingFeedback) {
    if (key.name === "enter") {
      screen.showingFeedback = false; screen.phase = "question";
      screen.confidence = undefined; screen.pendingCorrect = undefined; screen.pendingExplanation = undefined;
      screen.currentIndex++;
      if (screen.currentIndex >= screen.questions.length) { screen.done = true; }
      renderWarmup();
    }
    return;
  }

  if (key.name === "s") { setCurrentScreen({ type: "main", selectedIndex: 0 }); renderMainMenu(); return; }

  const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  const answerIdx = answerMap[key.name];
  if (answerIdx !== undefined) {
    const q = screen.questions[screen.currentIndex];
    const correct = answerIdx === q.question.correct;
    sessionStats.questionsAnswered++;
    screen.pendingCorrect = correct;
    screen.pendingExplanation = q.question.briefExplanation || "";
    screen.phase = "confidence"; screen.confidence = undefined;
    if (q.question.concept) { updateConceptScore(adaptiveState, q.question.concept, correct); saveAdaptiveState(STATE_DIR, adaptiveState); }
    renderWarmup();
    return;
  }
}

// ─── Pre-Test Screen ──────────────────────────────────────────────────────

export function renderPretest(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "pretest" }>;
  const { lessonIndex, sectionIndex, questions, currentIndex, showingFeedback, feedbackCorrect, feedbackExplanation, showingResult, recommendedDepth, score } = screen;
  const w = W();
  const h = H();

  const lesson = lessons[lessonIndex];
  const section = lesson?.sections[sectionIndex];
  const sectionTitle = section ? section.title : `Sektion ${sectionIndex + 1}`;

  if (showingResult) {
    lines.push(renderHeader(` Pre-Test Ergebnis`, ``));
    lines.push(boxTop(w)); lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}Ergebnis: ${score}% richtig${c.reset}`, w));
    lines.push(bEmpty(w));

    let depthLabel: string, depthHint: string;
    if (recommendedDepth === "kurz") { depthLabel = `${c.green}Schnelldurchlauf${c.reset}`; depthHint = "Du kennst das Thema schon gut!"; }
    else if (recommendedDepth === "standard") { depthLabel = `${c.yellow}Normale Tiefe${c.reset}`; depthHint = "Du hast Grundkenntnisse — lies aufmerksam."; }
    else { depthLabel = `${c.cyan}Vollstaendige Tiefe${c.reset}`; depthHint = "Dieses Thema scheint neu fuer dich zu sein."; }

    lines.push(bLine(`  Empfehlung: ${depthLabel}`, w));
    lines.push(bLine(`  ${c.dim}(${depthHint})${c.reset}`, w));
    lines.push(bEmpty(w));
    const footerStart = h - 3;
    while (lines.length < footerStart) lines.push(bEmpty(w));
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Sektion lesen`, `${c.bold}[S]${c.reset} Ueberspringen`]));
    flushScreen(lines);
    return;
  }

  lines.push(renderHeader(` Pre-Test: ${truncate(sectionTitle, w - 40)}`, `Frage ${currentIndex + 1}/${questions.length} `));
  lines.push(boxTop(w)); lines.push(bEmpty(w));
  lines.push(bLine(`  ${c.dim}Bevor du liest — was weisst du schon?${c.reset}`, w));
  lines.push(bLine(`  ${c.dim}(Falsche Antworten sind OK — sie helfen beim Lernen!)${c.reset}`, w));
  lines.push(bEmpty(w));

  const q = questions[currentIndex];
  if (q.code) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, w - 6))}${c.reset}`, w));
    for (const cl of q.code.split("\n")) { lines.push(bLine(`  ${c.cyan}  ${cl}${c.reset}`, w)); }
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, w - 6))}${c.reset}`, w));
    lines.push(bEmpty(w));
  }

  for (const ql of wordWrap(q.question, w - 6)) { lines.push(bLine(`  ${c.bold}${ql}${c.reset}`, w)); }
  lines.push(bEmpty(w));

  const labels = ["A", "B", "C", "D"];
  for (let i = 0; i < q.options.length && i < 4; i++) { lines.push(bLine(`  ${c.bold}[${labels[i]}]${c.reset} ${truncate(q.options[i], w - 12)}`, w)); }
  lines.push(bLine(`  ${c.bold}[?]${c.reset} ${c.dim}Ich weiss es nicht${c.reset}`, w));
  lines.push(bEmpty(w));

  if (screen.phase === "confidence") {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    lines.push(bLine(`  ${c.bold}${c.yellow}Wie sicher bist du bei deiner Antwort?${c.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}[1]${c.reset} Geraten`, w));
    lines.push(bLine(`  ${c.bold}[2]${c.reset} Unsicher`, w));
    lines.push(bLine(`  ${c.bold}[3]${c.reset} Ziemlich sicher`, w));
    lines.push(bLine(`  ${c.bold}[4]${c.reset} Absolut sicher`, w));
    lines.push(bEmpty(w));
  }

  if (showingFeedback) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    if (feedbackCorrect) { lines.push(bLine(`  ${c.green}${c.bold}Richtig!${c.reset}`, w)); }
    else { lines.push(bLine(`  ${c.red}${c.bold}Falsch${c.reset} ${c.dim}— kein Problem, du lernst es gleich!${c.reset}`, w)); }
    for (const el of wordWrap(feedbackExplanation, w - 8)) { lines.push(bLine(`  ${c.dim}${el}${c.reset}`, w)); }
    if (screen.confidence !== undefined) {
      const calibration = getConfidenceFeedback(screen.confidence >= 3, feedbackCorrect);
      lines.push(bEmpty(w));
      lines.push(bLine(`  ${calibration}`, w));
    }
    lines.push(bEmpty(w));
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));

  if (screen.phase === "confidence") { lines.push(...renderFooter([`${c.bold}[1-4]${c.reset} Sicherheit waehlen`])); }
  else if (showingFeedback) { lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Naechste`])); }
  else { lines.push(...renderFooter([`${c.bold}[A-D]${c.reset} Antworten`, `${c.bold}[?]${c.reset} Weiss nicht`, `${c.bold}[S]${c.reset} Pre-Test ueberspringen`])); }
  flushScreen(lines);
}

export function handlePretestInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "pretest" }>;

  if (screen.showingResult) {
    if (key.name === "enter") {
      markPretestTaken(screen.lessonIndex, screen.sectionIndex);
      setSectionDepth(adaptiveState, screen.lessonIndex, screen.sectionIndex, screen.recommendedDepth as ContentDepth);
      saveAdaptiveState(STATE_DIR, adaptiveState);
      openSection(screen.lessonIndex, screen.sectionIndex);
      return;
    }
    if (key.name === "s") {
      markPretestTaken(screen.lessonIndex, screen.sectionIndex);
      setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: screen.sectionIndex });
      renderLessonMenu(screen.lessonIndex);
      return;
    }
    return;
  }

  if (screen.phase === "confidence") {
    const confMap: Record<string, number> = { "1": 1, "2": 2, "3": 3, "4": 4 };
    const conf = confMap[key.raw];
    if (conf !== undefined) {
      screen.confidence = conf;
      const correct = screen.pendingCorrect ?? false;
      screen.answers.push({ correct, skipped: false });
      screen.showingFeedback = true; screen.feedbackCorrect = correct;
      screen.feedbackExplanation = screen.pendingExplanation || "";
      screen.phase = "feedback";
      renderPretest();
    }
    return;
  }

  if (screen.phase === "feedback" || screen.showingFeedback) {
    if (key.name === "enter") {
      screen.showingFeedback = false; screen.phase = "question";
      screen.confidence = undefined; screen.pendingCorrect = undefined; screen.pendingExplanation = undefined;
      screen.currentIndex++;
      if (screen.currentIndex >= screen.questions.length) {
        const correctCount = screen.answers.filter((a) => a.correct).length;
        const score2 = screen.questions.length > 0 ? Math.round((correctCount / screen.questions.length) * 100) : 0;
        screen.showingResult = true; screen.score = score2;
        screen.recommendedDepth = calculateDepth(screen.answers);
      }
      renderPretest();
    }
    return;
  }

  if (key.name === "s") { markPretestTaken(screen.lessonIndex, screen.sectionIndex); openSection(screen.lessonIndex, screen.sectionIndex); return; }

  if (key.name === "?") {
    sessionStats.questionsAnswered++;
    screen.answers.push({ correct: false, skipped: true });
    screen.showingFeedback = true; screen.feedbackCorrect = false;
    const q = screen.questions[screen.currentIndex];
    screen.feedbackExplanation = q.briefExplanation || "Du wirst es gleich lernen!";
    screen.phase = "feedback";
    renderPretest();
    return;
  }

  const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  const answerIdx = answerMap[key.name];
  if (answerIdx !== undefined) {
    const q = screen.questions[screen.currentIndex];
    const correct = answerIdx === q.correct;
    sessionStats.questionsAnswered++;
    screen.pendingCorrect = correct; screen.pendingExplanation = q.briefExplanation || "";
    screen.phase = "confidence"; screen.confidence = undefined;
    renderPretest();
    return;
  }
}

// ─── Interleaved Review Screen ───────────────────────────────────────────

export function renderInterleaved(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "interleaved" }>;
  const { items, currentIndex, answers, showingFeedback, feedbackCorrect, feedbackExplanation, done } = screen;
  const w = W();
  const h = H();

  if (items.length === 0) {
    lines.push(renderHeader(" Interleaved Review", ""));
    lines.push(boxTop(w)); lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.dim}Noch nicht genug Lektionen abgeschlossen.${c.reset}`, w));
    lines.push(bLine(`  ${c.dim}Du brauchst mindestens 3 abgeschlossene Lektionen.${c.reset}`, w));
    const footerStart = h - 3;
    while (lines.length < footerStart) lines.push(bEmpty(w));
    lines.push(...renderFooter([`${c.bold}[Q]${c.reset} Zurueck`]));
    flushScreen(lines);
    return;
  }

  if (done) {
    const correct = answers.filter((a) => a.correct).length;
    lines.push(renderHeader(" Interleaved Review — Ergebnis", `${correct}/${answers.length} `));
    lines.push(boxTop(w)); lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}Interleaved Review abgeschlossen!${c.reset}`, w));
    lines.push(bLine(`  Ergebnis: ${c.bold}${correct}${c.reset}/${answers.length} richtig`, w));
    lines.push(bEmpty(w));
    if (correct === answers.length) { lines.push(bLine(`  ${c.green}Hervorragend! Alles sitzt.${c.reset}`, w)); }
    else { lines.push(bLine(`  ${c.yellow}Gut gemacht! Wiederholung festigt das Wissen.${c.reset}`, w)); }
    const footerStart = h - 3;
    while (lines.length < footerStart) lines.push(bEmpty(w));
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Zum Hauptmenue`]));
    flushScreen(lines);
    return;
  }

  const item = items[currentIndex];
  lines.push(renderHeader(` Interleaved Review`, `${currentIndex + 1}/${items.length}  Aus: L${item.lessonNumber} `));
  lines.push(boxTop(w)); lines.push(bEmpty(w));
  lines.push(bLine(`  ${c.dim}Lektion ${item.lessonNumber}: ${item.lessonTitle}${c.reset}`, w));
  lines.push(bEmpty(w));

  if (item.code) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, w - 6))}${c.reset}`, w));
    for (const cl of item.code.split("\n")) { lines.push(bLine(`  ${c.cyan}  ${cl}${c.reset}`, w)); }
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, w - 6))}${c.reset}`, w));
    lines.push(bEmpty(w));
  }

  for (const ql of wordWrap(item.question, w - 6)) { lines.push(bLine(`  ${c.bold}${ql}${c.reset}`, w)); }
  lines.push(bEmpty(w));

  if (item.options) {
    const labels = ["A", "B", "C", "D"];
    for (let i = 0; i < item.options.length && i < 4; i++) { lines.push(bLine(`  ${c.bold}[${labels[i]}]${c.reset} ${truncate(item.options[i], w - 12)}`, w)); }
    lines.push(bEmpty(w));
  }

  if (screen.phase === "confidence") {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    lines.push(bLine(`  ${c.bold}${c.yellow}Wie sicher bist du bei deiner Antwort?${c.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}[1]${c.reset} Geraten`, w));
    lines.push(bLine(`  ${c.bold}[2]${c.reset} Unsicher`, w));
    lines.push(bLine(`  ${c.bold}[3]${c.reset} Ziemlich sicher`, w));
    lines.push(bLine(`  ${c.bold}[4]${c.reset} Absolut sicher`, w));
    lines.push(bEmpty(w));
  }

  if (showingFeedback) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    if (feedbackCorrect) { lines.push(bLine(`  ${c.green}${c.bold}Richtig!${c.reset}`, w)); }
    else { lines.push(bLine(`  ${c.red}${c.bold}Falsch.${c.reset}`, w)); }
    if (feedbackExplanation) { for (const el of wordWrap(feedbackExplanation, w - 8)) { lines.push(bLine(`  ${c.dim}${el}${c.reset}`, w)); } }
    if (screen.confidence !== undefined) {
      const calibration = getConfidenceFeedback(screen.confidence >= 3, feedbackCorrect);
      lines.push(bEmpty(w));
      lines.push(bLine(`  ${calibration}`, w));
    }
    lines.push(bEmpty(w));
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));

  if (screen.phase === "confidence") { lines.push(...renderFooter([`${c.bold}[1-4]${c.reset} Sicherheit waehlen`])); }
  else if (showingFeedback) { lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Naechste`])); }
  else { lines.push(...renderFooter([`${c.bold}[A-D]${c.reset} Antworten`, `${c.bold}[Q]${c.reset} Abbrechen`])); }
  flushScreen(lines);
}

export function handleInterleavedInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "interleaved" }>;

  if (screen.items.length === 0 || screen.done) {
    if (key.name === "enter" || key.name === "q" || key.name === "escape") { setCurrentScreen({ type: "main", selectedIndex: 0 }); renderMainMenu(); }
    return;
  }

  if (screen.phase === "confidence") {
    const confMap: Record<string, number> = { "1": 1, "2": 2, "3": 3, "4": 4 };
    const conf = confMap[key.raw];
    if (conf !== undefined) {
      screen.confidence = conf;
      const correct = screen.pendingCorrect ?? false;
      screen.answers.push({ correct });
      screen.showingFeedback = true; screen.feedbackCorrect = correct;
      screen.feedbackExplanation = screen.pendingExplanation || "";
      screen.phase = "feedback";
      renderInterleaved();
    }
    return;
  }

  if (screen.phase === "feedback" || screen.showingFeedback) {
    if (key.name === "enter") {
      screen.showingFeedback = false; screen.phase = "question";
      screen.confidence = undefined; screen.pendingCorrect = undefined; screen.pendingExplanation = undefined;
      screen.currentIndex++;
      if (screen.currentIndex >= screen.items.length) { screen.done = true; }
      renderInterleaved();
    }
    return;
  }

  if (key.name === "q" || key.name === "escape") { setCurrentScreen({ type: "main", selectedIndex: 0 }); renderMainMenu(); return; }

  const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  const answerIdx = answerMap[key.name];
  if (answerIdx !== undefined) {
    const item = screen.items[screen.currentIndex];
    const correct = answerIdx === item.correct;
    sessionStats.questionsAnswered++;
    screen.pendingCorrect = correct ?? false;
    screen.pendingExplanation = item.explanation || "";
    screen.phase = "confidence"; screen.confidence = undefined;
    renderInterleaved();
    return;
  }
}
