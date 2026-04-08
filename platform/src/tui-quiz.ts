/**
 * tui-quiz.ts — Quiz, Warmup, Pretest, Interleaved Review Screens (inkl. Metacognitive Prompts)
 *
 * Ab L21+ unterstuetzt das Quiz-System vier Fragetypen:
 *   - multiple-choice:  Klassisches A-D
 *   - short-answer:     Lernender tippt Antwort (Generation Effect)
 *   - predict-output:   Code lesen, Ausgabe vorhersagen
 *   - explain-why:      Offene Reflexion, Musterantwort zum Vergleich
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
import { calculateDepth, calculateDepthsFromPretest } from "./pretest-engine.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { renderLessonMenu } from "./tui-lesson-menu.ts";
import { openSection } from "./tui-section-reader.ts";
import { getQuestionType, checkFreeTextAnswer, type QuizQuestion } from "./quiz-runner.ts";

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

  // Lektionsweiter Pretest (sectionIndex === -1) mit Per-Sektion-Empfehlungen
  const isLessonPretest = sectionIndex === -1;

  if (showingResult) {
    lines.push(renderHeader(` Pre-Test Ergebnis`, `${score}% richtig `));
    lines.push(boxTop(w)); lines.push(bEmpty(w));

    if (isLessonPretest && Object.keys(screen.sectionDepths).length > 0) {
      // Per-Sektion Aufschluesselung
      lines.push(bLine(`  ${c.bold}Empfehlungen pro Sektion:${c.reset}`, w));
      lines.push(bEmpty(w));

      // Sammle Sektionen aus den Fragen
      const sectionMap = new Map<number, { correct: number; total: number }>();
      for (let i = 0; i < screen.questions.length; i++) {
        const q = screen.questions[i];
        const si = q.sectionIndex;
        if (!sectionMap.has(si)) sectionMap.set(si, { correct: 0, total: 0 });
        const entry = sectionMap.get(si)!;
        entry.total++;
        if (i < screen.answers.length && screen.answers[i].correct) entry.correct++;
      }

      for (const [si, { correct, total }] of sectionMap) {
        const zeroBasedSi = si - 1; // 1-basiert -> 0-basiert
        const key = `${lessonIndex}-${zeroBasedSi}`;
        const depth = screen.sectionDepths[key] || "standard";
        const section = lesson?.sections[zeroBasedSi];
        const sectionTitle = section ? section.title : `Sektion ${si}`;

        let depthIcon: string, depthColor: string;
        if (depth === "kurz") { depthIcon = c.green; depthColor = "Schnelldurchlauf"; }
        else if (depth === "standard") { depthIcon = c.yellow; depthColor = "Standard"; }
        else { depthIcon = c.cyan; depthColor = "Vollstaendig"; }

        const pctStr = `${correct}/${total}`;
        const depthLabel = `${depthIcon}${depthColor}${c.reset}`;
        const line = `  S${si}: ${truncate(sectionTitle, Math.max(10, w - 40))}  ${c.dim}[${pctStr}]${c.reset}  -> ${depthLabel}`;
        lines.push(bLine(line, w));
      }

      lines.push(bEmpty(w));
      lines.push(bLine(`  ${c.dim}[Enter] = Empfehlungen uebernehmen  [A] = Alle auf Standard  [S] = Ueberspringen${c.reset}`, w));
    } else {
      // Einzelner Sektions-Pretest (legacy)
      lines.push(bLine(`  ${c.bold}Ergebnis: ${score}% richtig${c.reset}`, w));
      lines.push(bEmpty(w));

      let depthLabel: string, depthHint: string;
      if (recommendedDepth === "kurz") { depthLabel = `${c.green}Schnelldurchlauf${c.reset}`; depthHint = "Du kennst das Thema schon gut!"; }
      else if (recommendedDepth === "standard") { depthLabel = `${c.yellow}Normale Tiefe${c.reset}`; depthHint = "Du hast Grundkenntnisse — lies aufmerksam."; }
      else { depthLabel = `${c.cyan}Vollstaendige Tiefe${c.reset}`; depthHint = "Dieses Thema scheint neu fuer dich zu sein."; }

      lines.push(bLine(`  Empfehlung: ${depthLabel}`, w));
      lines.push(bLine(`  ${c.dim}(${depthHint})${c.reset}`, w));
    }

    lines.push(bEmpty(w));
    const footerStart = h - 3;
    while (lines.length < footerStart) lines.push(bEmpty(w));
    if (isLessonPretest && Object.keys(screen.sectionDepths).length > 0) {
      lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Empfehlungen`, `${c.bold}[A]${c.reset} Alle Standard`, `${c.bold}[S]${c.reset} Ueberspringen`]));
    } else {
      lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Sektion lesen`, `${c.bold}[S]${c.reset} Ueberspringen`]));
    }
    flushScreen(lines);
    return;
  }

  const section = isLessonPretest ? null : lesson?.sections[sectionIndex];
  const sectionTitle = isLessonPretest
    ? lesson?.title || `Lektion ${lessonIndex + 1}`
    : (section ? section.title : `Sektion ${sectionIndex + 1}`);

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
    const isLessonPretest = screen.sectionIndex === -1;

    if (key.name === "enter") {
      if (isLessonPretest && Object.keys(screen.sectionDepths).length > 0) {
        // Empfehlungen uebernehmen: alle sectionDepths speichern
        // sectionDepths keys sind "lessonIdx-pretestSectionIdx" (1-basiert)
        // setSectionDepth erwartet 0-basierten sectionIndex
        for (const [key, depth] of Object.entries(screen.sectionDepths)) {
          const parts = key.split("-");
          const li = parseInt(parts[0], 10);
          const pretestSi = parseInt(parts[1], 10); // 1-basiert aus pretest-data
          const zeroBasedSi = pretestSi - 1; // zu 0-basiert konvertieren
          setSectionDepth(adaptiveState, li, zeroBasedSi, depth as ContentDepth);
        }
        saveAdaptiveState(STATE_DIR, adaptiveState);
        // Zur Lektion zurueck
        setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
        renderLessonMenu(screen.lessonIndex);
      } else {
        markPretestTaken(screen.lessonIndex, screen.sectionIndex);
        setSectionDepth(adaptiveState, screen.lessonIndex, screen.sectionIndex, screen.recommendedDepth as ContentDepth);
        saveAdaptiveState(STATE_DIR, adaptiveState);
        openSection(screen.lessonIndex, screen.sectionIndex);
      }
      return;
    }

    if (key.name === "a") {
      // Alle Sektionen auf Standard setzen
      if (isLessonPretest) {
        for (const q of screen.questions) {
          const zeroBasedSi = q.sectionIndex - 1; // 1-basiert -> 0-basiert
          setSectionDepth(adaptiveState, screen.lessonIndex, zeroBasedSi, "standard");
          const key = `${screen.lessonIndex}-${q.sectionIndex}`;
          screen.sectionDepths[key] = "standard";
        }
        saveAdaptiveState(STATE_DIR, adaptiveState);
        renderPretest();
      }
      return;
    }

    if (key.name === "s") {
      if (isLessonPretest) {
        setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
        renderLessonMenu(screen.lessonIndex);
      } else {
        markPretestTaken(screen.lessonIndex, screen.sectionIndex);
        setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: screen.sectionIndex });
        renderLessonMenu(screen.lessonIndex);
      }
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

        const isLessonPretest = screen.sectionIndex === -1;
        if (isLessonPretest) {
          // Per-Sektion Ergebnisse sammeln
          const sectionMap = new Map<number, { correct: number; total: number }>();
          for (let i = 0; i < screen.questions.length; i++) {
            const q = screen.questions[i];
            const si = q.sectionIndex;
            if (!sectionMap.has(si)) sectionMap.set(si, { correct: 0, total: 0 });
            const entry = sectionMap.get(si)!;
            entry.total++;
            if (i < screen.answers.length && screen.answers[i].correct) entry.correct++;
          }

          const sectionScores = Array.from(sectionMap.entries()).map(([sectionIndex, data]) => ({
            sectionIndex: sectionIndex - 1, // 1-basiert -> 0-basiert fuer setSectionDepth-Kompatibilitaet
            correct: data.correct,
            total: data.total,
          }));

          screen.sectionDepths = calculateDepthsFromPretest(screen.lessonIndex, sectionScores);
          screen.recommendedDepth = "standard"; // Fallback, wird nicht mehr einzeln genutzt
        } else {
          screen.recommendedDepth = calculateDepth(screen.answers);
        }
      }
      renderPretest();
    }
    return;
  }

  if (key.name === "s") {
    if (screen.sectionIndex === -1) {
      // Lektions-Pretest ueberspringen -> zurueck zum Lektionsmenue
      setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
      renderLessonMenu(screen.lessonIndex);
    } else {
      markPretestTaken(screen.lessonIndex, screen.sectionIndex);
      openSection(screen.lessonIndex, screen.sectionIndex);
    }
    return;
  }

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

// ─── Lesson Quiz Screen (mit Format-Mix) ─────────────────────────────────

function getFormatLabel(q: QuizQuestion): string {
  const t = getQuestionType(q);
  if (t === "short-answer") return "Kurzantwort";
  if (t === "predict-output") return "Predict-the-Output";
  if (t === "explain-why") return "Erklaere-warum";
  return "Multiple Choice";
}

function getExplanationText(q: QuizQuestion): string {
  const t = getQuestionType(q);
  if (t === "explain-why") return "";
  if ("explanation" in q && q.explanation) return q.explanation;
  return "";
}

function getElaboratedText(q: QuizQuestion, correct: boolean): string {
  if (!("elaboratedFeedback" in q) || !q.elaboratedFeedback) return "";
  return correct ? q.elaboratedFeedback.whyCorrect : q.elaboratedFeedback.commonMistake;
}

export function renderQuiz(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "quiz" }>;
  const { questions, currentIndex, showingFeedback, feedbackCorrect, feedbackExplanation, done, answers, score } = screen;
  const w = W();
  const h = H();
  const lesson = lessons[screen.lessonIndex];
  const lessonLabel = lesson ? `L${lesson.number}: ${lesson.title}` : `Lektion ${screen.lessonIndex + 1}`;

  // ─── Done Screen ───
  if (done) {
    const correctCount = answers.filter(a => a.correct).length;
    const pct = Math.round((correctCount / answers.length) * 100);
    lines.push(renderHeader(` Quiz — ${truncate(lessonLabel, w - 40)}`, `${correctCount}/${answers.length} `));
    lines.push(boxTop(w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}Quiz abgeschlossen!${c.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  Ergebnis: ${c.bold}${correctCount}${c.reset}/${answers.length} richtig (${pct}%)`, w));
    lines.push(bEmpty(w));
    if (pct >= 90) lines.push(bLine(`  ${c.green}Hervorragend! Du beherrschst das Thema.${c.reset}`, w));
    else if (pct >= 70) lines.push(bLine(`  ${c.yellow}Gut! Ein paar Konzepte nochmal anschauen.${c.reset}`, w));
    else lines.push(bLine(`  ${c.red}Das Thema braucht noch Wiederholung.${c.reset}`, w));
    lines.push(bEmpty(w));
    const footerStart = h - 3;
    while (lines.length < footerStart) lines.push(bEmpty(w));
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Zum Lektionsmenue`]));
    flushScreen(lines);
    return;
  }

  // ─── Question Screen ───
  const q = questions[currentIndex];
  const qType = getQuestionType(q);
  const formatLabel = getFormatLabel(q);

  lines.push(renderHeader(` Quiz — ${truncate(lessonLabel, w - 50)}`, `${currentIndex + 1}/${questions.length}  ${formatLabel} `));
  lines.push(boxTop(w));
  lines.push(bEmpty(w));

  // Question text
  const questionText = q.question;
  for (const ql of wordWrap(questionText, w - 6)) {
    lines.push(bLine(`  ${c.bold}${ql}${c.reset}`, w));
  }
  lines.push(bEmpty(w));

  // Code block (if present)
  const code = "code" in q ? q.code : undefined;
  if (code) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, w - 6))}${c.reset}`, w));
    for (const cl of code.split("\n")) {
      lines.push(bLine(`  ${c.cyan}  ${cl}${c.reset}`, w));
    }
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, w - 6))}${c.reset}`, w));
    lines.push(bEmpty(w));
  }

  // ─── Format-specific rendering ───

  if (qType === "multiple-choice" && "options" in q) {
    const labels = ["A", "B", "C", "D", "E", "F"];
    for (let i = 0; i < q.options.length && i < labels.length; i++) {
      lines.push(bLine(`  ${c.bold}[${labels[i]}]${c.reset} ${truncate(q.options[i], w - 12)}`, w));
    }
    lines.push(bEmpty(w));
  }

  if ((qType === "short-answer" || qType === "predict-output") && screen.phase === "freetext") {
    const input = screen.userInput || "";
    lines.push(bLine(`  Deine Antwort: ${c.cyan}${input}\u2588${c.reset}`, w));
    lines.push(bEmpty(w));
  } else if ((qType === "short-answer" || qType === "predict-output") && screen.phase === "question") {
    lines.push(bLine(`  ${c.dim}Tippe deine Antwort...${c.reset}`, w));
    const input = screen.userInput || "";
    lines.push(bLine(`  Deine Antwort: ${c.cyan}${input}\u2588${c.reset}`, w));
    lines.push(bEmpty(w));
  }

  if (qType === "explain-why" && (screen.phase === "question" || screen.phase === "freetext")) {
    lines.push(bLine(`  ${c.dim}Erklaere in eigenen Worten:${c.reset}`, w));
    const input = screen.userInput || "";
    const inputLines = wordWrap(input + "\u2588", w - 6);
    for (const il of inputLines) {
      lines.push(bLine(`  ${c.cyan}${il}${c.reset}`, w));
    }
    lines.push(bEmpty(w));
  }

  // ─── Confidence phase ───
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

  // ─── Explain-why review phase ───
  if (screen.phase === "explain-review" && qType === "explain-why" && "modelAnswer" in q) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    lines.push(bLine(`  ${c.bold}${c.yellow}Deine Erklaerung:${c.reset}`, w));
    for (const el of wordWrap(screen.userInput || "(leer)", w - 8)) {
      lines.push(bLine(`  ${c.dim}${el}${c.reset}`, w));
    }
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${c.bold}${c.green}Musterantwort:${c.reset}`, w));
    for (const ml of wordWrap(q.modelAnswer, w - 8)) {
      lines.push(bLine(`  ${ml}`, w));
    }
    lines.push(bEmpty(w));
    if (q.keyPoints && q.keyPoints.length > 0) {
      lines.push(bLine(`  ${c.bold}Kernpunkte:${c.reset}`, w));
      for (const kp of q.keyPoints) {
        lines.push(bLine(`  ${c.cyan}\u2022${c.reset} ${kp}`, w));
      }
      lines.push(bEmpty(w));
    }
  }

  // ─── Feedback phase ───
  if (showingFeedback && qType !== "explain-why") {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    if (feedbackCorrect) {
      lines.push(bLine(`  ${c.green}${c.bold}Richtig!${c.reset}`, w));
    } else {
      lines.push(bLine(`  ${c.red}${c.bold}Falsch.${c.reset}`, w));
      // Show correct answer for free-text questions
      if ((qType === "short-answer" || qType === "predict-output") && "expectedAnswer" in q) {
        lines.push(bLine(`  ${c.dim}Richtige Antwort: ${c.reset}${c.green}${q.expectedAnswer}${c.reset}`, w));
      }
    }
    if (feedbackExplanation) {
      for (const el of wordWrap(feedbackExplanation, w - 8)) {
        lines.push(bLine(`  ${c.dim}${el}${c.reset}`, w));
      }
    }
    const elaborated = getElaboratedText(q, feedbackCorrect);
    if (elaborated) {
      lines.push(bEmpty(w));
      for (const el of wordWrap(elaborated, w - 8)) {
        lines.push(bLine(`  ${el}`, w));
      }
    }
    if (screen.confidence !== undefined) {
      const calibration = getConfidenceFeedback(screen.confidence >= 3, feedbackCorrect);
      lines.push(bEmpty(w));
      lines.push(bLine(`  ${calibration}`, w));
    }
    lines.push(bEmpty(w));
  }

  // ─── Footer ───
  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));

  if (screen.phase === "confidence") {
    lines.push(...renderFooter([`${c.bold}[1-4]${c.reset} Sicherheit waehlen`]));
  } else if (screen.phase === "explain-review") {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Naechste Frage`]));
  } else if (showingFeedback) {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Naechste Frage`]));
  } else if (qType === "multiple-choice") {
    const optCount = "options" in q ? q.options.length : 4;
    const labels = ["A", "B", "C", "D", "E", "F"].slice(0, optCount);
    lines.push(...renderFooter([`${c.bold}[${labels.join("/")}]${c.reset} Antworten`, `${c.bold}[Q]${c.reset} Abbrechen`]));
  } else if (qType === "explain-why") {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Fertig`, `${c.bold}[S]${c.reset} Ueberspringen`]));
  } else {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Bestaetigen`, `${c.bold}[?]${c.reset} Keine Ahnung`]));
  }

  flushScreen(lines);
}

export function handleQuizInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "quiz" }>;

  // ─── Done ───
  if (screen.done) {
    if (key.name === "enter") {
      // Save quiz result
      const lesson = lessons[screen.lessonIndex];
      if (lesson) {
        const correctCount = screen.answers.filter(a => a.correct).length;
        const existing = progress.quizzes[lesson.number];
        if (!existing || correctCount > existing.score) {
          progress.quizzes[lesson.number] = { score: correctCount, total: screen.answers.length, date: new Date().toISOString() };
          // progress is saved by tui-state
        }
      }
      setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
      renderLessonMenu(screen.lessonIndex);
    }
    return;
  }

  const q = screen.questions[screen.currentIndex];
  const qType = getQuestionType(q);

  // ─── Confidence phase ───
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
      renderQuiz();
    }
    return;
  }

  // ─── Explain-why review phase ───
  if (screen.phase === "explain-review") {
    if (key.name === "enter") {
      advanceQuiz(screen);
    }
    return;
  }

  // ─── Feedback phase ───
  if (screen.phase === "feedback" || screen.showingFeedback) {
    if (key.name === "enter") {
      advanceQuiz(screen);
    }
    return;
  }

  // ─── Abort ───
  if (key.name === "q" || key.name === "escape") {
    setCurrentScreen({ type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 });
    renderLessonMenu(screen.lessonIndex);
    return;
  }

  // ─── Multiple Choice input ───
  if (qType === "multiple-choice" && "options" in q) {
    const labels: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5 };
    const idx = labels[key.name];
    if (idx !== undefined && idx < q.options.length) {
      const correct = idx === q.correct;
      sessionStats.questionsAnswered++;
      screen.pendingCorrect = correct;
      screen.pendingExplanation = getExplanationText(q);
      screen.phase = "confidence";
      screen.confidence = undefined;
      renderQuiz();
    }
    return;
  }

  // ─── Short-answer / Predict-output free-text input ───
  if (qType === "short-answer" || qType === "predict-output") {
    // "?" = skip / don't know
    if (key.name === "?" || key.raw === "?") {
      sessionStats.questionsAnswered++;
      screen.pendingCorrect = false;
      screen.pendingExplanation = getExplanationText(q);
      screen.phase = "confidence";
      screen.confidence = undefined;
      screen.userInput = "";
      renderQuiz();
      return;
    }

    // Enter = submit answer
    if (key.name === "enter" && screen.userInput.length > 0) {
      const correct = checkFreeTextAnswer(q as any, screen.userInput);
      sessionStats.questionsAnswered++;
      screen.pendingCorrect = correct;
      screen.pendingExplanation = getExplanationText(q);
      screen.phase = "confidence";
      screen.confidence = undefined;
      renderQuiz();
      return;
    }

    // Backspace
    if (key.name === "backspace") {
      if (screen.userInput.length > 0) {
        screen.userInput = screen.userInput.slice(0, -1);
        renderQuiz();
      }
      return;
    }

    // Regular character input
    if (key.raw && key.raw.length === 1 && key.raw.charCodeAt(0) >= 32) {
      screen.userInput += key.raw;
      renderQuiz();
      return;
    }

    // Space
    if (key.name === "space") {
      screen.userInput += " ";
      renderQuiz();
      return;
    }

    return;
  }

  // ─── Explain-why free-text input ───
  if (qType === "explain-why") {
    // Skip
    if (key.name === "s") {
      screen.answers.push({ correct: true, skipped: true });
      advanceQuiz(screen);
      return;
    }

    // Enter = done, show model answer
    if (key.name === "enter") {
      screen.phase = "explain-review";
      screen.answers.push({ correct: true, skipped: false }); // explain-why is always "correct" (self-assessment)
      renderQuiz();
      return;
    }

    // Backspace
    if (key.name === "backspace") {
      if (screen.userInput.length > 0) {
        screen.userInput = screen.userInput.slice(0, -1);
        renderQuiz();
      }
      return;
    }

    // Regular character input
    if (key.raw && key.raw.length === 1 && key.raw.charCodeAt(0) >= 32) {
      screen.userInput += key.raw;
      renderQuiz();
      return;
    }

    // Space
    if (key.name === "space") {
      screen.userInput += " ";
      renderQuiz();
      return;
    }

    return;
  }
}

function advanceQuiz(screen: Extract<Screen, { type: "quiz" }>): void {
  screen.showingFeedback = false;
  screen.phase = "question";
  screen.confidence = undefined;
  screen.pendingCorrect = undefined;
  screen.pendingExplanation = undefined;
  screen.userInput = "";
  screen.currentIndex++;
  if (screen.currentIndex >= screen.questions.length) {
    screen.done = true;
    screen.score = screen.answers.filter(a => a.correct).length;
  }
  renderQuiz();
}
