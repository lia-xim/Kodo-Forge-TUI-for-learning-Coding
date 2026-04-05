/**
 * tui-redraw.ts — Redraw bei Resize
 */

import {
  currentScreen, updateTermSize, sectionRenderedLines,
  cheatsheetRenderedLines,
} from "./tui-state.ts";
import { clampScrollOffset } from "./tui-render.ts";
import { renderPlatformScreen, renderCourseInfoScreen } from "./tui-platform.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { renderLessonMenu } from "./tui-lesson-menu.ts";
import { renderSectionReader, loadSection, loadCheatsheet } from "./tui-section-reader.ts";
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
      loadSection(s.lessonIndex, s.sectionIndex);
      s.totalLines = sectionRenderedLines.length;
      s.scrollOffset = clampScrollOffset(s.scrollOffset, s.totalLines);
      renderSectionReader(s.lessonIndex, s.sectionIndex, s.scrollOffset);
      break;
    }
    case "cheatsheet": {
      const cs = currentScreen as {
        lessonIndex: number;
        scrollOffset: number;
        totalLines: number;
      };
      loadCheatsheet(cs.lessonIndex);
      cs.totalLines = cheatsheetRenderedLines.length;
      cs.scrollOffset = clampScrollOffset(cs.scrollOffset, cs.totalLines);
      // Re-render by going back to the cheatsheet screen flow
      // (renderCheatsheetReader is private, but opening the cheatsheet re-renders)
      // We need to re-import and call directly — the handleCheatsheetInput sets screen
      // Let's just re-set the screen and call redraw on the section reader module
      // Actually, loadCheatsheet returns bool and the cheatsheet render is private
      // Use a workaround: reset to lesson and back
      // Simplest: just export a renderCheatsheet function
      // For now, just re-open the cheatsheet
      const { openCheatsheet } = require("./tui-section-reader.ts") as typeof import("./tui-section-reader.ts");
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
