/**
 * tui-input.ts — parseKey(), handleInput() dispatch
 */

import type { ParsedKey, Screen } from "./tui-types.ts";
import { currentScreen, setCurrentScreen, navigationHistory } from "./tui-state.ts";
import { HIDE_CURSOR, SHOW_CURSOR } from "./tui-render.ts";
import { stopTTS } from "./tui-tts.ts";
import { exitTui } from "./tui-utils.ts";
import { renderHelpOverlay, handleHelpInput } from "./tui-help.ts";
import { renderHistoryScreen, handleHistoryInput } from "./tui-history.ts";
import { handlePlatformInput } from "./tui-platform.ts";
import { handleCourseInfoInput } from "./tui-platform.ts";
import { handleMainInput } from "./tui-main-menu.ts";
import { handleLessonInput } from "./tui-lesson-menu.ts";
import { handleSectionInput } from "./tui-section-reader.ts";
import { handleCheatsheetInput } from "./tui-section-reader.ts";
import { handleStatsInput } from "./tui-stats.ts";
import { handleSearchInput } from "./tui-search.ts";
import { handleBookmarksInput } from "./tui-bookmarks.ts";
import { handleHintsInput } from "./tui-exercises.ts";
import { handleWarmupInput, handlePretestInput, handleInterleavedInput } from "./tui-quiz.ts";
import { handleSelfExplainInput } from "./tui-section-reader.ts";
import { handleMisconceptionsInput, handleCompletionInput } from "./tui-challenges.ts";
import { handleCompetenceInput } from "./tui-stats.ts";
import { handleExerciseMenuInput } from "./tui-exercises.ts";

// ─── Tastatur-Eingabe ──────────────────────────────────────────────────────

export function parseKey(data: Buffer): ParsedKey {
  const raw = data.toString();
  const b0 = data[0];
  const b1 = data[1];
  const b2 = data[2];

  // Ctrl+C
  if (b0 === 0x03) return { name: "ctrl-c", raw, ctrl: true };

  // Escape
  if (b0 === 0x1b && data.length === 1) return { name: "escape", raw, ctrl: false };

  // SGR Mouse Events: ESC [ < Cb ; Cx ; Cy M/m
  if (b0 === 0x1b && b1 === 0x5b && b2 === 0x3c) {
    const seq = raw.slice(3);
    const match = seq.match(/^(\d+);(\d+);(\d+)([Mm])$/);
    if (match) {
      const button = parseInt(match[1], 10);
      const isRelease = match[4] === "m";

      if (button === 64 && !isRelease) return { name: "mouse-scroll-up", raw, ctrl: false };
      if (button === 65 && !isRelease) return { name: "mouse-scroll-down", raw, ctrl: false };
      if (button === 0 && !isRelease) {
        const cx = parseInt(match[2], 10);
        const cy = parseInt(match[3], 10);
        return { name: "mouse-click", raw, ctrl: false, x: cx, y: cy };
      }
    }
    return { name: "mouse-other", raw, ctrl: false };
  }

  // F1: ESC O P (VT220) or ESC [ 1 1 ~ (xterm) or ESC [ [ A (linux)
  if (b0 === 0x1b && b1 === 0x4f && b2 === 0x50) {
    return { name: "f1", raw, ctrl: false };
  }
  if (b0 === 0x1b && b1 === 0x5b && b2 === 0x31 && data[3] === 0x31 && data[4] === 0x7e) {
    return { name: "f1", raw, ctrl: false };
  }
  if (b0 === 0x1b && b1 === 0x5b && b2 === 0x5b && data[3] === 0x41) {
    return { name: "f1", raw, ctrl: false };
  }

  // Alt+Left: ESC ESC [ D  or  ESC [ 1 ; 3 D
  if (b0 === 0x1b && b1 === 0x5b && b2 === 0x31 && data[3] === 0x3b && data[4] === 0x33 && data[5] === 0x44) {
    return { name: "alt-left", raw, ctrl: false };
  }
  if (b0 === 0x1b && b1 === 0x1b && b2 === 0x5b && data[3] === 0x44) {
    return { name: "alt-left", raw, ctrl: false };
  }

  // Pfeiltasten: ESC [ A/B/C/D
  if (b0 === 0x1b && b1 === 0x5b) {
    switch (b2) {
      case 0x41:
        return { name: "up", raw, ctrl: false };
      case 0x42:
        return { name: "down", raw, ctrl: false };
      case 0x43:
        return { name: "right", raw, ctrl: false };
      case 0x44:
        return { name: "left", raw, ctrl: false };
      case 0x35:
        if (data[3] === 0x7e)
          return { name: "pageup", raw, ctrl: false };
        break;
      case 0x36:
        if (data[3] === 0x7e)
          return { name: "pagedown", raw, ctrl: false };
        break;
      case 0x48:
        return { name: "home", raw, ctrl: false };
      case 0x46:
        return { name: "end", raw, ctrl: false };
    }
    return { name: "unknown-escape", raw, ctrl: false };
  }

  // Enter
  if (b0 === 0x0d || b0 === 0x0a)
    return { name: "enter", raw, ctrl: false };

  // Backspace
  if (b0 === 0x7f || b0 === 0x08)
    return { name: "backspace", raw, ctrl: false };

  // Tab
  if (b0 === 0x09) return { name: "tab", raw, ctrl: false };

  // Space
  if (b0 === 0x20) return { name: "space", raw, ctrl: false };

  // Normales Zeichen
  return { name: raw.toLowerCase(), raw, ctrl: false };
}

// ─── Eingabe-Verarbeitung ──────────────────────────────────────────────────

export function handleInput(data: Buffer): void {
  const key = parseKey(data);

  // Ctrl+C: Beenden
  if (key.name === "ctrl-c") {
    exitTui();
    return;
  }

  // ─── Feature 1: Globaler Help-Shortcut (F1 immer, ? kontextabhaengig) ───
  if (key.name === "f1" && currentScreen.type !== "help") {
    if (currentScreen.type === "section") stopTTS();
    setCurrentScreen({ type: "help", previousScreen: JSON.parse(JSON.stringify(currentScreen)) });
    renderHelpOverlay();
    return;
  }
  if (
    key.name === "?" &&
    currentScreen.type !== "help" &&
    currentScreen.type !== "pretest" &&
    currentScreen.type !== "selfexplain" &&
    currentScreen.type !== "search" &&
    currentScreen.type !== "completion"
  ) {
    if (currentScreen.type === "section") stopTTS();
    setCurrentScreen({ type: "help", previousScreen: JSON.parse(JSON.stringify(currentScreen)) });
    renderHelpOverlay();
    return;
  }

  // ─── Feature 4: Globaler History-Shortcut (Alt+Left) ───────────────────
  if (key.name === "alt-left" && currentScreen.type !== "help" && currentScreen.type !== "history") {
    if (currentScreen.type === "section") stopTTS();
    setCurrentScreen({ type: "history", selectedIndex: 0 });
    renderHistoryScreen();
    return;
  }

  switch (currentScreen.type) {
    case "platform":
      handlePlatformInput(key);
      break;
    case "courseinfo":
      handleCourseInfoInput(key);
      break;
    case "main":
      handleMainInput(key);
      break;
    case "lesson":
      handleLessonInput(key);
      break;
    case "section":
      handleSectionInput(key);
      break;
    case "cheatsheet":
      handleCheatsheetInput(key);
      break;
    case "stats":
      handleStatsInput(key);
      break;
    case "search":
      handleSearchInput(key, data);
      break;
    case "bookmarks":
      handleBookmarksInput(key);
      break;
    case "hints":
      handleHintsInput(key);
      break;
    case "warmup":
      handleWarmupInput(key);
      break;
    case "pretest":
      handlePretestInput(key);
      break;
    case "selfexplain":
      handleSelfExplainInput(key, data);
      break;
    case "misconceptions":
      handleMisconceptionsInput(key);
      break;
    case "completion":
      handleCompletionInput(key, data);
      break;
    case "interleaved":
      handleInterleavedInput(key);
      break;
    case "competence":
      handleCompetenceInput(key);
      break;
    case "exercisemenu":
      handleExerciseMenuInput(key);
      break;
    case "help":
      handleHelpInput(key);
      break;
    case "history":
      handleHistoryInput(key);
      break;
  }
}
