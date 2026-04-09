/**
 * tui-redraw.ts — Redraw bei Resize
 */

import {
  currentScreen, updateTermSize, sectionRenderedLines,
  cheatsheetRenderedLines,
} from "./tui-state.ts";
import { setForceRenderFn } from "./tui-animation.ts";
import { clampScrollOffset } from "./tui-render.ts";
import { renderPlatformScreen, renderCourseInfoScreen } from "./tui-platform.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { renderLessonMenu } from "./tui-lesson-menu.ts";
import { renderSectionReader, loadSection, loadCheatsheet, openCheatsheet } from "./tui-section-reader.ts";
import { renderStats, renderCompetenceDashboard } from "./tui-stats.ts";
import { renderSearchScreen } from "./tui-search.ts";
import { renderBookmarksScreen } from "./tui-bookmarks.ts";
import { renderWarmup, renderPretest, renderInterleaved, renderQuiz } from "./tui-quiz.ts";
import { renderMisconceptions, renderCompletionProblem } from "./tui-challenges.ts";
import { renderExerciseMenu } from "./tui-exercises.ts";
import { renderHelpOverlay } from "./tui-help.ts";
import { renderHistoryScreen } from "./tui-history.ts";
import type { Screen } from "./tui-types.ts";

// Forward-declare selfexplain render to avoid circular
let _renderSelfExplanation: (() => void) | null = null;
export function setRenderSelfExplanation(fn: () => void): void {
  _renderSelfExplanation = fn;
}

export function redraw(): void {
  updateTermSize();
  switch (currentScreen.type) {
    case "platform":
      renderPlatformScreen();
      break;
    case "courseinfo":
      renderCourseInfoScreen();
      break;
    case "main":
      renderMainMenu();
      break;
    case "lesson":
      renderLessonMenu(
        (currentScreen as { lessonIndex: number }).lessonIndex
      );
      break;
    case "section": {
      const s = currentScreen as {
        lessonIndex: number;
        sectionIndex: number;
        scrollOffset: number;
        totalLines: number;
      };
      // Do NOT reload markdown here — sectionRenderedLines is the cached render.
      // Reloading on every animation tick (33ms) caused flickering + disk I/O thrash.
      // Resize reloads happen via resizeRedraw() below.
      renderSectionReader(s.lessonIndex, s.sectionIndex, s.scrollOffset);
      break;
    }
    case "cheatsheet": {
      const cs = currentScreen as {
        lessonIndex: number;
        scrollOffset: number;
        totalLines: number;
      };
      // Same as section: skip reload here, let resizeRedraw() handle width changes.
      openCheatsheet(cs.lessonIndex);
      break;
    }
    case "stats":
      renderStats();
      break;
    case "search":
      renderSearchScreen();
      break;
    case "bookmarks":
      renderBookmarksScreen();
      break;
    case "warmup":
      renderWarmup();
      break;
    case "pretest":
      renderPretest();
      break;
    case "selfexplain":
      // Self-explanation is rendered from section-reader
      if (_renderSelfExplanation) _renderSelfExplanation();
      break;
    case "misconceptions":
      renderMisconceptions();
      break;
    case "completion":
      renderCompletionProblem();
      break;
    case "interleaved":
      renderInterleaved();
      break;
    case "quiz":
      renderQuiz();
      break;
    case "competence":
      renderCompetenceDashboard();
      break;
    case "exercisemenu":
      renderExerciseMenu();
      break;
    case "help":
      renderHelpOverlay();
      break;
    case "history":
      renderHistoryScreen();
      break;
  }
}

// ─── Batched render for animation engine ─────────────────────────────────────
//
// The animation engine fires up to 30× per second. We batch those calls so
// at most one render runs per event-loop iteration — eliminating flicker from
// rapid successive writes to stdout.

let _animRenderPending = false;

function scheduleRedraw(): void {
  if (_animRenderPending) return;
  _animRenderPending = true;
  setImmediate(() => {
    _animRenderPending = false;
    redraw();
  });
}

// ─── Resize redraw — reloads markdown at new terminal width ──────────────────
//
// Called on SIGWINCH. Unlike the animation-driven redraw(), this reloads
// the markdown cache so content reflows to the new terminal width.

export function resizeRedraw(): void {
  updateTermSize();
  if (currentScreen.type === "section") {
    const s = currentScreen as {
      lessonIndex: number; sectionIndex: number;
      scrollOffset: number; totalLines: number;
    };
    loadSection(s.lessonIndex, s.sectionIndex);
    s.totalLines = sectionRenderedLines.length;
    s.scrollOffset = clampScrollOffset(s.scrollOffset, s.totalLines);
    renderSectionReader(s.lessonIndex, s.sectionIndex, s.scrollOffset);
    return;
  }
  if (currentScreen.type === "cheatsheet") {
    const cs = currentScreen as {
      lessonIndex: number; scrollOffset: number; totalLines: number;
    };
    loadCheatsheet(cs.lessonIndex);
    cs.totalLines = cheatsheetRenderedLines.length;
    cs.scrollOffset = clampScrollOffset(cs.scrollOffset, cs.totalLines);
    openCheatsheet(cs.lessonIndex);
    return;
  }
  redraw();
}

// Hook up the animation engine's force-render callback (batched)
setForceRenderFn(scheduleRedraw);
