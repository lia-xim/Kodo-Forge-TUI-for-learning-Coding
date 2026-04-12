/**
 * tui-section-reader.ts — Section Reader (Smooth Scrolling, Self-Explanation, TTS)
 *                        + Cheatsheet Reader
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  renderMarkdown, estimateReadTime, extractMermaidBlocks,
  annotationsEnabled, setAnnotationsEnabled, extractSelfExplanationPrompts,
  filterByDepth, validateDepthMarkers,
} from "./markdown-renderer.ts";
import {
  c, padR, truncate,
  flushScreen, renderHeader, renderFooter,
  getContentHeight, clampScrollOffset, getScrollPercent,
  computeScrollbar, scrollbarChar, bLine, bEmpty, boxTop, wordWrap,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, progress, saveProgress, debouncedSaveProgress,
  updateTermSize, W, H, formatSessionTime,
  getBreadcrumb, getSectionKey, getSectionStatus, migrateSectionProgress,
  sectionRenderedLines, setSectionRenderedLines, sectionReadTime, setSectionReadTime,
  sectionMermaidBlocks, setSectionMermaidBlocks,
  sectionSelfExplainPrompts, setSectionSelfExplainPrompts,
  sectionSelfExplainTriggered, setSectionSelfExplainTriggered,
  sectionRawMarkdown, setSectionRawMarkdown,
  cheatsheetRenderedLines, setCheatsheetRenderedLines,
  pushHistory, markSectionCompleted, sessionStats, countExerciseProgress,
  ttsActive, ttsEngineLabel, ttsLoading, PROJECT_ROOT,

} from "./tui-state.ts";

import { renderHeaderBar, modePill } from "./tui-components.ts";
import type { ParsedKey, SectionProgress, Screen, Bookmark } from "./tui-types.ts";
import { stopTTS, startTTSFromPosition, setRenderSectionReader } from "./tui-tts.ts";
import { openMermaidDiagram, openInVSCode } from "./tui-utils.ts";
import { renderLessonMenu } from "./tui-lesson-menu.ts";
import { HIDE_CURSOR, SHOW_CURSOR } from "./tui-render.ts";
import { adaptiveState, TOOLS_DIR } from "./tui-state.ts";
import { loadAdaptiveState, saveAdaptiveState } from "./adaptive-engine.ts";
import { stopAnimation } from "./tui-animation.ts";
import { t } from "./i18n.ts";

// ─── Section laden ─────────────────────────────────────────────────────────

/**
 * Laedt eine Sektion mit optionaler Tiefenfilterung.
 * Wenn die Sektion Depth-Marker enthaelt, wird der Inhalt entsprechend
 * der gewaehlten Tiefe gefiltert.
 */
function loadSection(
  lessonIndex: number,
  sectionIndex: number,
  depth?: "kurz" | "standard" | "vollständig"
): void {
  const lesson = lessons[lessonIndex];
  if (!lesson || !lesson.sections[sectionIndex]) return;

  const section = lesson.sections[sectionIndex];
  let content = fs.readFileSync(section.filePath, "utf-8");

  // Tiefe ermitteln: explizit > adaptive state > default "standard"
  let effectiveDepth = depth;
  if (effectiveDepth === undefined) {
    const key = getSectionKey(lessonIndex, sectionIndex);
    effectiveDepth = adaptiveState.sectionDepths[key];
  }
  if (effectiveDepth === undefined) {
    effectiveDepth = "standard";
  }

  // Depth-Filterung anwenden (wenn Marker vorhanden sind)
  const hasMarkers = content.includes("<!-- section:summary -->") ||
    content.includes("<!-- depth:standard -->") ||
    content.includes("<!-- depth:vollstaendig -->") ||
    content.includes("<!-- depth:vollständig -->");

  if (hasMarkers && effectiveDepth !== "standard") {
    content = filterByDepth(content, effectiveDepth);
  }

  setSectionReadTime(estimateReadTime(content));
  setSectionMermaidBlocks(extractMermaidBlocks(content));
  setSectionSelfExplainPrompts(extractSelfExplanationPrompts(content));
  setSectionSelfExplainTriggered(new Set());
  setSectionRawMarkdown(content);

  updateTermSize();
  const renderWidth = Math.max(30, W() - 6);
  const rendered = renderMarkdown(content, renderWidth);
  setSectionRenderedLines(rendered);
}

/**
 * Wechselt die Tiefe fuer die aktuelle Sektion.
 * Wird per [K]/[N]/[V] Tasten im Section Reader aufgerufen.
 */
function setSectionDepth(
  lessonIndex: number,
  sectionIndex: number,
  depth: "kurz" | "standard" | "vollständig"
): void {
  const key = getSectionKey(lessonIndex, sectionIndex);
  adaptiveState.sectionDepths[key] = depth;
  saveAdaptiveState(TOOLS_DIR, adaptiveState);

  // Sektion neu laden mit neuer Tiefe
  loadSection(lessonIndex, sectionIndex, depth);

  // Screen updaten
  const screen = currentScreen as {
    type: "section";
    lessonIndex: number;
    sectionIndex: number;
    scrollOffset: number;
    totalLines: number;
  };
  if (screen.type === "section" &&
    screen.lessonIndex === lessonIndex &&
    screen.sectionIndex === sectionIndex
  ) {
    // Scroll-Position anpassen (nicht ueber neues Maximum hinaus)
    const newTotal = sectionRenderedLines.length;
    const maxScroll = Math.max(0, newTotal - getContentHeight());
    screen.scrollOffset = Math.min(screen.scrollOffset, maxScroll);
    screen.totalLines = newTotal;
  }
}

// ─── Section Reader Rendering ──────────────────────────────────────────────

export function renderSectionReader(
  lessonIndex: number,
  sectionIndex: number,
  scrollOffset: number
): void {
  updateTermSize();
  const lines: string[] = [];
  const lesson = lessons[lessonIndex];
  if (!lesson || !lesson.sections[sectionIndex]) return;
  const section = lesson.sections[sectionIndex];
  const w = W();

  const totalLines = sectionRenderedLines.length;
  const contentHeight = getContentHeight();
  const offset = clampScrollOffset(scrollOffset, totalLines);
  const pct = getScrollPercent(offset, totalLines);

  const sTimerStr = formatSessionTime();
  const headerLeft = `${modePill("reading")} ${getBreadcrumb(currentScreen)}: ${truncate(section.title, w - 72)}`;
  const headerRight = `${pct}% · ~${sectionReadTime}m ⏱ ${sTimerStr} `;
  lines.push(renderHeaderBar(headerLeft, headerRight));

  const scrollbar = computeScrollbar(offset, totalLines, contentHeight);
  const visibleLines = sectionRenderedLines.slice(offset, offset + contentHeight);

  for (let i = 0; i < contentHeight; i++) {
    const contentLine = i < visibleLines.length ? visibleLines[i] : "";
    const sb = scrollbarChar(scrollbar[i] ?? "track");
    const innerW = w - 4;
    const paddedContent = padR(` ${contentLine}`, innerW - 1);
    lines.push(`${c.dim}│${c.reset}${paddedContent}${sb}${c.dim}│${c.reset}`);
  }

  const atEnd = offset >= Math.max(0, totalLines - contentHeight);
  const hasNextSection = lesson.sections.length > 1 && sectionIndex < lesson.sections.length - 1;
  const spaceLabel = atEnd && hasNextSection
    ? `${c.bold}${c.green}[Space/→]${c.reset} ${c.green}${t("reader.nextSection")}${c.reset}`
    : `${c.bold}[Space]${c.reset} ${t("reader.pageForward")}`;
  const navParts: string[] = [
    `${c.bold}[\u2191\u2193]${c.reset} ${t("reader.scroll")}`,
    spaceLabel,
    `${c.bold}[Home/End]${c.reset} ${t("reader.startEnd")}`,
  ];
  if (lesson.sections.length > 1) {
    navParts.push(`${c.bold}[1-${lesson.sections.length}]${c.reset} ${t("reader.section")}`);
  }
  if (sectionMermaidBlocks.length > 0)
    navParts.push(`${c.bold}[D]${c.reset} ${t("reader.diagram")}`);

  // Tiefe-Anzeige
  const depthKey = getSectionKey(lessonIndex, sectionIndex);
  const currentDepth = adaptiveState.sectionDepths[depthKey] || "standard";
  const depthLabel = currentDepth === "kurz" ? `${c.cyan}${t("reader.short")}${c.reset}` :
    currentDepth === "vollständig" ? `${c.magenta}${t("reader.full")}${c.reset}` :
      `${c.dim}${t("reader.standard")}${c.reset}`;
  navParts.push(`${c.bold}[K/N/V]${c.reset} ${t("reader.depth")} ${depthLabel}`);

  let ttsLabel = "";
  if (ttsActive) {
    if (ttsLoading) {
      ttsLabel = `${c.bold}${c.yellow}[L]${c.reset} ${c.yellow}${t("reader.readAloudLoading")}${c.reset}`;
    } else {
      ttsLabel = `${c.bold}${c.green}[L]${c.reset} ${c.green}${t("reader.readAloudOn")}${c.reset}`;
    }
  } else {
    ttsLabel = `${c.bold}[L]${c.reset} ${t("reader.readAloud")}`;
  }
  if (ttsEngineLabel) {
    ttsLabel += ` ${c.dim}(${ttsEngineLabel})${c.reset}`;
  }
  navParts.push(ttsLabel);
  navParts.push(`${c.bold}[A]${c.reset} ${t("reader.annotations")}: ${annotationsEnabled ? t("reader.on") : t("reader.off")}`);
  navParts.push(`${c.bold}[M]${c.reset} ${t("reader.bookmark")}`);
  navParts.push(`${c.bold}[V]${c.reset} ${t("reader.vscode")}`);
  navParts.push(`${c.bold}[Q/Esc]${c.reset} ${t("reader.back")}`);

  lines.push(...renderFooter(navParts));
  flushScreen(lines);
}

// Registriere renderSectionReader fuer TTS-Callbacks
setRenderSectionReader(renderSectionReader);

// ─── Open Section ──────────────────────────────────────────────────────────

export function openSection(lessonIndex: number, sectionIndex: number, initialOffset?: number): void {
  stopTTS();
  // Stop menu-blink animation — it's only needed on platform/menu screens, not while reading.
  stopAnimation("menuBlink");

  const lesson = lessons[lessonIndex];
  if (!lesson || !lesson.sections[sectionIndex]) return;

  pushHistory({ type: "section", lessonIndex, sectionIndex, scrollOffset: initialOffset ?? 0, totalLines: 0 });

  const sKey = getSectionKey(lessonIndex, sectionIndex);
  const existing = progress.sections[sKey];
  if (!existing) {
    progress.sections[sKey] = {
      status: "in_progress",
      firstOpened: new Date().toISOString(),
      scrollPercent: 0,
    };
  } else if (typeof existing === "string") {
    progress.sections[sKey] = migrateSectionProgress(existing);
    if ((progress.sections[sKey] as SectionProgress).status !== "completed") {
      (progress.sections[sKey] as SectionProgress).firstOpened =
        (progress.sections[sKey] as SectionProgress).firstOpened ?? new Date().toISOString();
    }
  }

  progress.lastLesson = lessonIndex;
  progress.lastSection = sectionIndex;
  progress.lastScreen = "section";
  progress.lastScrollOffset = initialOffset ?? 0;
  saveProgress();

  loadSection(lessonIndex, sectionIndex);
  const totalLines = sectionRenderedLines.length;
  const offset = clampScrollOffset(initialOffset ?? 0, totalLines);

  setCurrentScreen({
    type: "section",
    lessonIndex,
    sectionIndex,
    scrollOffset: offset,
    totalLines,
  });

  renderSectionReader(lessonIndex, sectionIndex, offset);
}

// ─── Section Input ─────────────────────────────────────────────────────────

export function handleSectionInput(key: ParsedKey): void {
  const screen = currentScreen as {
    type: "section";
    lessonIndex: number;
    sectionIndex: number;
    scrollOffset: number;
    totalLines: number;
  };

  const { lessonIndex, sectionIndex, scrollOffset, totalLines } = screen;
  const lesson = lessons[lessonIndex];
  const contentHeight = getContentHeight();
  const halfPage = Math.max(1, Math.floor(contentHeight / 2));
  const maxOffset = Math.max(0, totalLines - contentHeight);

  const scrollTo = (newOffset: number): void => {
    const clamped = clampScrollOffset(newOffset, totalLines);

    if (clamped > scrollOffset) {
      for (const prompt of sectionSelfExplainPrompts) {
        if (
          prompt.lineIndex > scrollOffset &&
          prompt.lineIndex <= clamped + contentHeight &&
          !sectionSelfExplainTriggered.has(prompt.lineIndex)
        ) {
          sectionSelfExplainTriggered.add(prompt.lineIndex);
          setCurrentScreen({
            type: "selfexplain",
            lessonIndex,
            sectionIndex,
            scrollOffset: clamped,
            totalLines,
            prompt,
            showKeyPoints: false,
            typingMode: false,
            typedText: "",
          });
          renderSelfExplanation();
          return;
        }
      }
    }

    screen.scrollOffset = clamped;

    const pct = getScrollPercent(clamped, totalLines);
    const sKey = getSectionKey(lessonIndex, sectionIndex);
    const entry = progress.sections[sKey];
    if (entry && typeof entry !== "string") {
      entry.scrollPercent = Math.max(entry.scrollPercent, pct);
      if (pct >= 80 && entry.status !== "completed") {
        entry.status = "completed";
        entry.completed = new Date().toISOString();
        sessionStats.sectionsRead++;
      }
    }

    progress.lastScrollOffset = clamped;
    debouncedSaveProgress();
    renderSectionReader(lessonIndex, sectionIndex, clamped);
  };

  if (key.name === "up" || key.name === "mouse-scroll-up") {
    scrollTo(scrollOffset - 1);
    return;
  }
  if (key.name === "mouse-click" && key.y !== undefined) {
    const contentY = key.y - 3; // Row 1 is header, Row 2 is border
    if (contentY >= 0 && contentY < contentHeight) {
      const clickedRenderedLine = scrollOffset + contentY;
      if (clickedRenderedLine < totalLines) {
        startTTSFromPosition(sectionRawMarkdown, clickedRenderedLine, totalLines);
        renderSectionReader(lessonIndex, sectionIndex, scrollOffset);
      }
    }
    return;
  }
  if (key.name === "down" || key.name === "mouse-scroll-down") {
    scrollTo(scrollOffset + 1);
    return;
  }
  if (key.name === "space" || key.name === "pagedown") {
    if (scrollOffset >= maxOffset) {
      // At the very bottom → go to next section
      if (lesson && sectionIndex < lesson.sections.length - 1) {
        const sKey = getSectionKey(lessonIndex, sectionIndex);
        markSectionCompleted(sKey);
        saveProgress();
        openSection(lessonIndex, sectionIndex + 1);
      }
    } else {
      scrollTo(scrollOffset + halfPage);
    }
    return;
  }
  if (key.name === "pageup") {
    scrollTo(scrollOffset - halfPage);
    return;
  }
  if (key.name === "right") {
    if (lesson && sectionIndex < lesson.sections.length - 1) {
      const sKey = getSectionKey(lessonIndex, sectionIndex);
      markSectionCompleted(sKey);
      saveProgress();
      openSection(lessonIndex, sectionIndex + 1);
    }
    return;
  }
  if (key.name === "left") {
    if (sectionIndex > 0) {
      openSection(lessonIndex, sectionIndex - 1);
    } else {
      stopTTS();
      setCurrentScreen({
        type: "lesson",
        lessonIndex,
        selectedIndex: sectionIndex,
      });
      renderLessonMenu(lessonIndex);
    }
    return;
  }
  if (key.name === "home") {
    scrollTo(0);
    return;
  }
  if (key.name === "end") {
    scrollTo(maxOffset);
    return;
  }

  if (lesson) {
    const num = parseInt(key.raw, 10);
    if (num >= 1 && num <= lesson.sections.length) {
      openSection(lessonIndex, num - 1);
      return;
    }
  }

  if (key.name === "d" && sectionMermaidBlocks.length > 0) {
    openMermaidDiagram(sectionMermaidBlocks[0]);
    return;
  }
  if (key.name === "a") {
    setAnnotationsEnabled(!annotationsEnabled);
    loadSection(lessonIndex, sectionIndex);
    screen.totalLines = sectionRenderedLines.length;
    screen.scrollOffset = clampScrollOffset(scrollOffset, screen.totalLines);
    renderSectionReader(lessonIndex, sectionIndex, screen.scrollOffset);
    return;
  }

  // ─── Depth switching [K/N/V] ──────────────────────────────────────────
  if (key.name === "k") {
    setSectionDepth(lessonIndex, sectionIndex, "kurz");
    renderSectionReader(lessonIndex, sectionIndex, screen.scrollOffset);
    return;
  }
  if (key.name === "n") {
    setSectionDepth(lessonIndex, sectionIndex, "standard");
    renderSectionReader(lessonIndex, sectionIndex, screen.scrollOffset);
    return;
  }
  if (key.name === "v") {
    setSectionDepth(lessonIndex, sectionIndex, "vollständig");
    renderSectionReader(lessonIndex, sectionIndex, screen.scrollOffset);
    return;
  }

  if (key.name === "m") {
    const bm: Bookmark = {
      lessonIndex,
      sectionIndex,
      scrollOffset,
      created: new Date().toISOString(),
    };
    progress.bookmarks.push(bm);
    saveProgress();
    renderSectionReader(lessonIndex, sectionIndex, scrollOffset);
    return;
  }
  if (key.name === "v") {
    const section = lesson?.sections[sectionIndex];
    if (section) {
      openInVSCode(section.filePath);
    }
    return;
  }
  if (key.name === "l") {
    if (ttsActive) {
      stopTTS();
    } else {
      startTTSFromPosition(sectionRawMarkdown, scrollOffset, totalLines);
    }
    renderSectionReader(lessonIndex, sectionIndex, scrollOffset);
    return;
  }
  if (key.name === "q" || key.name === "escape" || key.name === "backspace") {
    stopTTS();
    setCurrentScreen({
      type: "lesson",
      lessonIndex,
      selectedIndex: sectionIndex,
    });
    renderLessonMenu(lessonIndex);
    return;
  }
}

// ─── Self-Explanation Screen ──────────────────────────────────────────────

function renderSelfExplanation(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "selfexplain" }>;
  const { prompt, showKeyPoints, typingMode, typedText } = screen;
  const w = W();
  const h = H();

  lines.push(renderHeader(` ${t("selfexplain.title")}`, ""));
  lines.push(boxTop(w));
  lines.push(bEmpty(w));

  const questionLines = wordWrap(prompt.question, w - 6);
  for (const ql of questionLines) {
    lines.push(bLine(`  ${c.bold}${c.cyan}${ql}${c.reset}`, w));
  }
  lines.push(bEmpty(w));

  if (typingMode) {
    lines.push(bLine(`  ${c.dim}${t("selfexplain.yourExplanation")}${c.reset}`, w));
    const typedLines = wordWrap(typedText + "\u2588", w - 8);
    for (const tl of typedLines) {
      lines.push(bLine(`    ${c.white}${tl}${c.reset}`, w));
    }
    lines.push(bEmpty(w));
  }

  if (showKeyPoints && prompt.keyPoints.length > 0) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(w - 6)}${c.reset}`, w));
    lines.push(bLine(`  ${c.yellow}${c.bold}${t("selfexplain.keyPoints")}${c.reset}`, w));
    for (const kp of prompt.keyPoints) {
      const kpLines = wordWrap(kp, w - 10);
      for (const kl of kpLines) {
        lines.push(bLine(`    ${c.yellow}${kl}${c.reset}`, w));
      }
    }
    lines.push(bEmpty(w));
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));

  if (typingMode) {
    lines.push(...renderFooter([
      `${c.bold}[Enter]${c.reset} ${t("selfexplain.done")}`,
      `${c.bold}[Esc]${c.reset} ${t("selfexplain.cancel")}`,
    ]));
  } else {
    lines.push(...renderFooter([
      `${c.bold}[T]${c.reset} ${t("selfexplain.typeExplanation")}`,
      `${c.bold}[Enter]${c.reset} ${t("selfexplain.understoodContinue")}`,
      `${c.bold}[?]${c.reset} ${t("selfexplain.showKeyPoints")}`,
    ]));
  }
  flushScreen(lines);
}

export function handleSelfExplainInput(key: ParsedKey, rawData: Buffer): void {
  const screen = currentScreen as Extract<Screen, { type: "selfexplain" }>;

  if (screen.typingMode) {
    if (key.name === "enter" || key.name === "escape") {
      screen.typingMode = false;
      process.stdout.write(HIDE_CURSOR);
      renderSelfExplanation();
      return;
    }
    if (key.name === "backspace") {
      screen.typedText = screen.typedText.slice(0, -1);
      renderSelfExplanation();
      return;
    }
    if (key.raw.length === 1 && key.raw.charCodeAt(0) >= 32) {
      screen.typedText += key.raw;
      renderSelfExplanation();
      return;
    }
    if (key.name === "space") {
      screen.typedText += " ";
      renderSelfExplanation();
      return;
    }
    if (rawData.length > 1 && rawData[0] !== 0x1b) {
      screen.typedText += rawData.toString("utf-8");
      renderSelfExplanation();
      return;
    }
    return;
  }

  if (key.name === "t") {
    screen.typingMode = true;
    process.stdout.write(SHOW_CURSOR);
    renderSelfExplanation();
    return;
  }
  if (key.name === "?") {
    screen.showKeyPoints = !screen.showKeyPoints;
    renderSelfExplanation();
    return;
  }
  if (key.name === "enter") {
    sectionSelfExplainTriggered.add(screen.prompt.lineIndex);
    setCurrentScreen({
      type: "section",
      lessonIndex: screen.lessonIndex,
      sectionIndex: screen.sectionIndex,
      scrollOffset: screen.scrollOffset,
      totalLines: screen.totalLines,
    });
    renderSectionReader(screen.lessonIndex, screen.sectionIndex, screen.scrollOffset);
    return;
  }
  if (key.name === "escape") {
    sectionSelfExplainTriggered.add(screen.prompt.lineIndex);
    setCurrentScreen({
      type: "section",
      lessonIndex: screen.lessonIndex,
      sectionIndex: screen.sectionIndex,
      scrollOffset: screen.scrollOffset,
      totalLines: screen.totalLines,
    });
    renderSectionReader(screen.lessonIndex, screen.sectionIndex, screen.scrollOffset);
    return;
  }
}

// ─── Cheatsheet ──────────────────────────────────────────────────────────

function loadCheatsheetData(lessonIndex: number): boolean {
  const lesson = lessons[lessonIndex];
  if (!lesson || !lesson.hasCheatsheet) return false;

  const cheatPath = path.join(PROJECT_ROOT, lesson.dirName, "cheatsheet.md");
  if (!fs.existsSync(cheatPath)) return false;

  const content = fs.readFileSync(cheatPath, "utf-8");
  updateTermSize();
  const renderWidth = Math.max(30, W() - 6);
  setCheatsheetRenderedLines(renderMarkdown(content, renderWidth));
  return true;
}

export function openCheatsheet(lessonIndex: number): void {
  if (loadCheatsheetData(lessonIndex)) {
    setCurrentScreen({
      type: "cheatsheet",
      lessonIndex,
      scrollOffset: 0,
      totalLines: cheatsheetRenderedLines.length,
    });
    renderCheatsheetReader(lessonIndex, 0);
  }
}

function renderCheatsheetReader(lessonIndex: number, scrollOffset: number): void {
  updateTermSize();
  const lines: string[] = [];
  const lesson = lessons[lessonIndex];
  if (!lesson) return;
  const w = W();

  const totalLines = cheatsheetRenderedLines.length;
  const contentHeight = getContentHeight();
  const offset = clampScrollOffset(scrollOffset, totalLines);
  const pct = getScrollPercent(offset, totalLines);

  const csTimerStr = formatSessionTime();
  lines.push(
    renderHeader(
      ` ${getBreadcrumb(currentScreen)}`,
      `${pct}% \u23F1 ${csTimerStr} `
    )
  );

  const scrollbar = computeScrollbar(offset, totalLines, contentHeight);
  const visibleLines = cheatsheetRenderedLines.slice(offset, offset + contentHeight);

  for (let i = 0; i < contentHeight; i++) {
    const contentLine = i < visibleLines.length ? visibleLines[i] : "";
    const sb = scrollbarChar(scrollbar[i] ?? "track");
    const innerW = w - 4;
    const paddedContent = padR(` ${contentLine}`, innerW - 1);
    lines.push(`${c.dim}│${c.reset}${paddedContent}${sb}${c.dim}│${c.reset}`);
  }

  const navParts: string[] = [
    `${c.bold}[\u2191\u2193]${c.reset} ${t("cheatsheet.scroll")}`,
    `${c.bold}[PgUp/PgDn]${c.reset} ${t("cheatsheet.page")}`,
    `${c.bold}[Space]${c.reset} ${t("cheatsheet.forward")}`,
    `${c.bold}[Q/Esc]${c.reset} ${t("cheatsheet.back")}`,
  ];
  lines.push(...renderFooter(navParts));
  flushScreen(lines);
}

export function handleCheatsheetInput(key: ParsedKey): void {
  const screen = currentScreen as {
    type: "cheatsheet";
    lessonIndex: number;
    scrollOffset: number;
    totalLines: number;
  };
  const { lessonIndex, scrollOffset, totalLines } = screen;
  const contentHeight = getContentHeight();
  const halfPage = Math.max(1, Math.floor(contentHeight / 2));
  const maxOffset = Math.max(0, totalLines - contentHeight);

  const scrollTo = (newOffset: number): void => {
    const clamped = clampScrollOffset(newOffset, totalLines);
    screen.scrollOffset = clamped;
    renderCheatsheetReader(lessonIndex, clamped);
  };

  if (key.name === "up" || key.name === "mouse-scroll-up") { scrollTo(scrollOffset - 1); return; }
  if (key.name === "down" || key.name === "mouse-scroll-down") { scrollTo(scrollOffset + 1); return; }
  if (key.name === "space" || key.name === "pagedown") { scrollTo(scrollOffset + halfPage); return; }
  if (key.name === "pageup") { scrollTo(scrollOffset - halfPage); return; }
  if (key.name === "home") { scrollTo(0); return; }
  if (key.name === "end") { scrollTo(maxOffset); return; }

  if (
    key.name === "q" ||
    key.name === "escape" ||
    key.name === "backspace" ||
    key.name === "left"
  ) {
    setCurrentScreen({ type: "lesson", lessonIndex, selectedIndex: 0 });
    renderLessonMenu(lessonIndex);
    return;
  }
}

// ─── Export loadSection and loadCheatsheet for redraw ─────────────────────

export { loadSection, loadCheatsheetData as loadCheatsheet };
