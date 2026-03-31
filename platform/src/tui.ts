/**
 * TypeScript Deep Learning — Fullscreen Terminal User Interface (TUI)
 *
 * Entry-Point: Startet die Applikation, richtet Event-Listener ein
 * und delegiert an die modularen Screen-Handler.
 *
 * Start: npx tsx src/tui.ts   oder   npm start
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "url";

import {
  c, ENTER_ALT_SCREEN, HIDE_CURSOR, CLEAR_SCREEN, ENABLE_MOUSE,
} from "./tui-render.ts";
import {
  updateTermSize, setCurrentScreen, setLessons, setIsInAltScreen,
  platformConfig, setAdaptiveState, setProjectRoot, setActiveCourseId,
  updateDerivedPaths, discoverLessons, loadProgress,
  PLATFORM_ROOT, COURSES_ROOT, STATE_DIR,
} from "./tui-state.ts";
import { loadAdaptiveState } from "./adaptive-engine.ts";
import { handleInput } from "./tui-input.ts";
import { cleanup, loadPlatformConfig, exitTui } from "./tui-utils.ts";
import { renderPlatformScreen } from "./tui-platform.ts";
import { redraw } from "./tui-redraw.ts";
import { detectTtsEngine } from "./tui-tts.ts";

// ─── Cleanup — IMMER alternate buffer verlassen ────────────────────────────

process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(0); });
process.on("SIGTERM", () => { cleanup(); process.exit(0); });
process.on("uncaughtException", (err) => {
  cleanup();
  console.error("Unerwarteter Fehler:", err);
  process.exit(1);
});

// ─── Hauptprogramm ─────────────────────────────────────────────────────────

function main(): void {
  updateTermSize();

  // Platform-Konfiguration laden
  loadPlatformConfig();

  // Lektionen des aktiven Kurses entdecken
  setLessons(discoverLessons());

  // Fortschritt laden
  loadProgress();

  // State-Verzeichnis erstellen (falls nicht vorhanden)
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }

  // Aktiven Kurs als PROJECT_ROOT setzen
  const activeCourse = platformConfig.courses.find(
    co => co.id === platformConfig.activeCourse
  );
  if (activeCourse) {
    setProjectRoot(path.join(COURSES_ROOT, activeCourse.directory));
    setActiveCourseId(activeCourse.id);
    updateDerivedPaths();
  }

  // Adaptive State laden
  try {
    setAdaptiveState(loadAdaptiveState(STATE_DIR));
  } catch {
    setAdaptiveState({ sectionDepths: {}, conceptScores: {}, hintLevels: {} });
  }

  // TTS-Engine erkennen (edge-tts oder System-Fallback)
  detectTtsEngine();

  // Terminal-Check
  if (!process.stdin.isTTY) {
    console.error(
      `\n${c.red}  Fehler: Kein interaktives Terminal erkannt.${c.reset}\n` +
        `${c.dim}  Das TUI benoetigt ein interaktives Terminal.${c.reset}\n`
    );
    process.exit(1);
  }

  // Alternate Screen Buffer aktivieren
  process.stdout.write(ENTER_ALT_SCREEN);
  process.stdout.write(HIDE_CURSOR);
  process.stdout.write(CLEAR_SCREEN);
  process.stdout.write(ENABLE_MOUSE);
  setIsInAltScreen(true);

  // Raw Mode
  process.stdin.setRawMode(true);
  process.stdin.resume();

  // Terminal-Resize beobachten
  process.stdout.on("resize", redraw);

  // Eingaben verarbeiten
  process.stdin.on("data", (data: Buffer | string) => {
    const buf = typeof data === "string" ? Buffer.from(data) : data;
    handleInput(buf);
  });

  // Startbildschirm: Platform-Screen (Kursauswahl)
  const activeCourseIdx = platformConfig.courses.findIndex(
    co => co.id === platformConfig.activeCourse
  );
  setCurrentScreen({
    type: "platform",
    selectedIndex: Math.max(0, activeCourseIdx),
    scrollOffset: 0,
  });
  renderPlatformScreen();
}

// ─── Start ─────────────────────────────────────────────────────────────────

const isMainModule = process.argv[1] && (
  fileURLToPath(import.meta.url) === process.argv[1] ||
  process.argv[1].endsWith("tui.ts")
);

if (isMainModule) {
  main();
}

// Named exports for React App
export {
  platformConfig,
  discoverLessons,
  loadProgress,
  lessons,
  progress,
} from "./tui-state.ts";
export {
  loadPlatformConfig,
  switchToCourse,
  getCourseProgressSummary,
  getDefaultPlatformConfig,
} from "./tui-utils.ts";
