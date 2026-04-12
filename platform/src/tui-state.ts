/**
 * tui-state.ts — Globaler State (Variablen, Progress, Config, Paths)
 *
 * WICHTIG: Dieses Modul importiert NICHTS von den Screen-Modulen,
 * um Circular Dependencies zu vermeiden.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ChildProcess } from "node:child_process";
import type {
  Screen,
  ProgressData,
  LessonInfo,
  SectionProgress,
  PlatformConfig,
  CourseProgressSummary,
  MasteryLevel,
  Bookmark,
  SearchResult,
} from "./tui-types.ts";
import type { SelfExplanationPrompt } from "./markdown-renderer.ts";
import type { AdaptiveState } from "./adaptive-engine.ts";
import {
  initI18n, t, setLocale, getLocale, loadLocalePreference, saveLocalePreference,
  type Locale,
} from "./i18n.ts";

// ─── Konstanten ─────────────────────────────────────────────────────────────

export const IS_STANDALONE = !!(process as any).isBun || path.basename(process.argv[1] || "").endsWith(".exe");

import { fileURLToPath } from "node:url";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

/** platform/ Ordner (Parent von src/ in dev, oder CWD in standalone) */
const devPlatformRoot = path.resolve(_dirname, "..");

export const PLATFORM_ROOT = IS_STANDALONE ? process.cwd() : devPlatformRoot;

/** Learning/ Ordner — enthaelt alle Kursverzeichnisse */
export const COURSES_ROOT = IS_STANDALONE ? process.cwd() : path.resolve(devPlatformRoot, "..");

/** platform/platform.json */
export const PLATFORM_FILE = path.join(PLATFORM_ROOT, "platform.json");

/** platform/state/ — Runtime State */
export const STATE_DIR = path.join(PLATFORM_ROOT, IS_STANDALONE ? ".kodo-state" : "state");

// ─── i18n Initialization ──────────────────────────────────────────────────
initI18n(loadLocalePreference(STATE_DIR));

/** Switch the UI locale, persist it, and reload course directory */
export function switchLocale(locale: Locale): void {
  setLocale(locale);
  saveLocalePreference(STATE_DIR, locale);
  // Re-resolve course path for new locale and rediscover lessons
  const courseDir = platformConfig?.courses?.find(
    (c: { id: string }) => c.id === ACTIVE_COURSE_ID
  )?.directory;
  if (courseDir) {
    PROJECT_ROOT = resolveCoursePath(courseDir);
    updateDerivedPaths();
    lessons = discoverLessons();
  }
}

// Re-export for convenience
export { t, getLocale, type Locale } from "./i18n.ts";

/**
 * Resolve a course directory path, using the locale-specific variant if available.
 * e.g. "typescript" → "typescript-en" when locale is "en" and that directory exists.
 * Falls back to the base directory (German original) if no translation exists.
 */
export function resolveCoursePath(courseDir: string): string {
  const locale = getLocale();
  if (locale !== "de") {
    const localizedDir = `${courseDir}-${locale}`;
    const localizedPath = path.join(COURSES_ROOT, localizedDir);
    if (fs.existsSync(localizedPath)) {
      return localizedPath;
    }
  }
  return path.join(COURSES_ROOT, courseDir);
}

/** Dynamisch pro Kurs: z.B. Learning/typescript/ */
export let PROJECT_ROOT = path.join(COURSES_ROOT, "typescript");

// Abgeleitete Pfade — werden bei Kurswechsel neu berechnet
export let TOOLS_DIR = path.join(PROJECT_ROOT, "tools");
export let ACTIVE_COURSE_ID = "typescript";
export let PROGRESS_FILE = path.join(STATE_DIR, `progress-${ACTIVE_COURSE_ID}.json`);
export let REVIEW_DATA_FILE = path.join(STATE_DIR, `review-${ACTIVE_COURSE_ID}.json`);
export const TODO_PATTERN = /\/\/\s*TODO:/g;

/** Pfade nach Kurswechsel aktualisieren */
export function updateDerivedPaths(): void {
  TOOLS_DIR = path.join(PROJECT_ROOT, "tools");
  PROGRESS_FILE = path.join(STATE_DIR, `progress-${ACTIVE_COURSE_ID}.json`);
  REVIEW_DATA_FILE = path.join(STATE_DIR, `review-${ACTIVE_COURSE_ID}.json`);
}

/** Setter fuer PROJECT_ROOT (bei Kurswechsel) */
export function setProjectRoot(newRoot: string): void {
  PROJECT_ROOT = newRoot;
}

/** Setter fuer ACTIVE_COURSE_ID */
export function setActiveCourseId(id: string): void {
  ACTIVE_COURSE_ID = id;
}

// ─── Globaler State ─────────────────────────────────────────────────────────

export let currentScreen: Screen = { type: "main", selectedIndex: 0 };
export let lessons: LessonInfo[] = [];
export let progress: ProgressData = {
  sections: {},
  exercises: {},
  quizzes: {},
  lastLesson: 0,
  lastSection: 0,
  lastScrollOffset: 0,
  lastScreen: "main",
  bookmarks: [],
};
let _W = 80; // Terminal-Breite
let _H = 24; // Terminal-Hoehe
export let isInAltScreen = false;

/** Terminal-Breite als Funktion (um den aktuellen Wert zu erhalten) */
export function W(): number { return _W; }
/** Terminal-Hoehe als Funktion */
export function H(): number { return _H; }

export function setCurrentScreen(screen: Screen): void {
  currentScreen = screen;
}

export function setLessons(l: LessonInfo[]): void {
  lessons = l;
}

export function setIsInAltScreen(v: boolean): void {
  isInAltScreen = v;
}

// Platform state
export let platformConfig: PlatformConfig = {
  courses: [],
  activeCourse: "typescript",
  lastAccessed: {},
};
export let courseProgressCache: Map<string, CourseProgressSummary> = new Map();

export function setPlatformConfig(config: PlatformConfig): void {
  platformConfig = config;
}

// Course info reader state (curriculum markdown)
export let courseInfoRenderedLines: string[] = [];
export function setCourseInfoRenderedLines(lines: string[]): void {
  courseInfoRenderedLines = lines;
}

// Section reader state — rendered lines (full document)
export let sectionRenderedLines: string[] = [];
export let sectionRevealedLines = 0;
export let sectionReadTime = 1;
export let sectionMermaidBlocks: string[] = [];
export let sectionSelfExplainPrompts: SelfExplanationPrompt[] = [];
export let sectionSelfExplainTriggered: Set<number> = new Set();
export let sectionRawMarkdown = ""; // Raw Markdown fuer TTS-Extraktion

export function setSectionRenderedLines(lines: string[]): void {
  sectionRenderedLines = lines;
}
export function setSectionRevealedLines(n: number): void {
  sectionRevealedLines = n;
}
export function setSectionReadTime(t: number): void {
  sectionReadTime = t;
}
export function setSectionMermaidBlocks(blocks: string[]): void {
  sectionMermaidBlocks = blocks;
}
export function setSectionSelfExplainPrompts(prompts: SelfExplanationPrompt[]): void {
  sectionSelfExplainPrompts = prompts;
}
export function setSectionSelfExplainTriggered(s: Set<number>): void {
  sectionSelfExplainTriggered = s;
}
export function setSectionRawMarkdown(md: string): void {
  sectionRawMarkdown = md;
}

// ─── Text-to-Speech (TTS) State ──────────────────────────────────────────
export type TtsEngine = "edge-tts" | "system";
export let ttsEngine: TtsEngine = "edge-tts";
export let ttsVoice = "de-DE-ConradNeural"; // edge-tts default
export let ttsProcess: ChildProcess | null = null;
export let ttsActive = false;
export let ttsParagraphs: string[] = [];
export let ttsCurrentParagraph = 0;
/** Label der aktuell genutzten TTS-Engine (wird von tui-tts gesetzt) */
export let ttsEngineLabel = "";
export let ttsLoading = false;

export function setTtsEngine(e: TtsEngine): void {
  ttsEngine = e;
}
export function setTtsVoice(v: string): void {
  ttsVoice = v;
}
export function setTtsProcess(p: ChildProcess | null): void {
  ttsProcess = p;
}
export function setTtsActive(v: boolean): void {
  ttsActive = v;
}
export function setTtsLoading(v: boolean): void {
  ttsLoading = v;
}
export function setTtsParagraphs(p: string[]): void {
  ttsParagraphs = p;
}
export function setTtsCurrentParagraph(n: number): void {
  ttsCurrentParagraph = n;
}
export function setTtsEngineLabel(label: string): void {
  ttsEngineLabel = label;
}

// Cheatsheet reader state
export let cheatsheetRenderedLines: string[] = [];
export function setCheatsheetRenderedLines(lines: string[]): void {
  cheatsheetRenderedLines = lines;
}

// Search debounce timer
export let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
export function setSearchDebounceTimer(t: ReturnType<typeof setTimeout> | null): void {
  searchDebounceTimer = t;
}

// Adaptive state
export let adaptiveState: AdaptiveState = {
  sectionDepths: {},
  conceptScores: {},
  hintLevels: {},
};
export function setAdaptiveState(s: AdaptiveState): void {
  adaptiveState = s;
}

// Pre-test results cache (tracks which sections had pre-tests taken)
export let pretestsTaken: Set<string> = new Set();

// Warm-up was shown this session
export let warmupShownThisSession = false;
export function setWarmupShownThisSession(v: boolean): void {
  warmupShownThisSession = v;
}

// ─── Feature 3: Session-Timer + Tages-Zusammenfassung ─────────────────────
export const SESSION_START = Date.now();
export let sessionStats = { sectionsRead: 0, exercisesSolved: 0, quizzesTaken: 0, questionsAnswered: 0 };

export function formatSessionTime(): string {
  const elapsed = Date.now() - SESSION_START;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ─── Feature 4: Navigation History ────────────────────────────────────────
const MAX_HISTORY = 20;
export let navigationHistory: Screen[] = [];

export function pushHistory(screen: Screen): void {
  const last = navigationHistory[navigationHistory.length - 1];
  // Deduplizieren: Gleicher Screen-Typ UND gleiche Identifikation
  if (last && last.type === screen.type) {
    if (screen.type === "section" && last.type === "section"
      && screen.lessonIndex === last.lessonIndex && screen.sectionIndex === last.sectionIndex) return;
    if (screen.type === "lesson" && last.type === "lesson"
      && screen.lessonIndex === last.lessonIndex) return;
    if (screen.type === "main") return;
    if (screen.type === "competence" || screen.type === "bookmarks"
      || screen.type === "stats" || screen.type === "search") return;
  }
  navigationHistory.push(JSON.parse(JSON.stringify(screen)));
  if (navigationHistory.length > MAX_HISTORY) navigationHistory.shift();
}

// ─── Feature 1: Shortcut-Hilfe pro Screen ─────────────────────────────────
export function getShortcutsForScreen(): Record<string, { key: string; desc: string }[]> {
  return {
  platform: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.platform.selectCourse") },
    { key: "Enter", desc: t("shortcuts.platform.openCourse") },
    { key: "L", desc: t("shortcuts.platform.language") },
    { key: "?/F1", desc: t("shortcuts.platform.help") },
    { key: "Q", desc: t("shortcuts.platform.quit") },
    { key: "Ctrl+C", desc: t("shortcuts.platform.ctrlc") },
  ],
  courseinfo: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.courseinfo.scroll") },
    { key: "C", desc: t("shortcuts.courseinfo.curriculum") },
    { key: "Esc / \u2190", desc: t("shortcuts.courseinfo.back") },
    { key: "?/F1", desc: t("shortcuts.courseinfo.help") },
    { key: "Ctrl+C", desc: t("shortcuts.courseinfo.quit") },
  ],
  main: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.main.navigate") },
    { key: "Enter / \u2192", desc: t("shortcuts.main.open") },
    { key: "1-9", desc: t("shortcuts.main.directOpen") },
    { key: "/", desc: t("shortcuts.main.search") },
    { key: "B", desc: t("shortcuts.main.bookmarks") },
    { key: "R", desc: t("shortcuts.main.review") },
    { key: "I", desc: t("shortcuts.main.interleaved") },
    { key: "K", desc: t("shortcuts.main.competence") },
    { key: "P", desc: t("shortcuts.main.courseSelect") },
    { key: "Alt+\u2190", desc: t("shortcuts.main.history") },
    { key: "Q", desc: t("shortcuts.main.quit") },
    { key: "?/F1", desc: t("shortcuts.main.help") },
    { key: "Ctrl+C", desc: t("shortcuts.main.ctrlc") },
  ],
  lesson: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.lesson.navigate") },
    { key: "Enter / \u2192", desc: t("shortcuts.lesson.open") },
    { key: "Esc / \u2190", desc: t("shortcuts.lesson.back") },
    { key: "1-9", desc: t("shortcuts.lesson.openSection") },
    { key: "E", desc: t("shortcuts.lesson.exercises") },
    { key: "Z", desc: t("shortcuts.lesson.quiz") },
    { key: "H", desc: t("shortcuts.lesson.hints") },
    { key: "G", desc: t("shortcuts.lesson.misconceptions") },
    { key: "V", desc: t("shortcuts.lesson.vscode") },
    { key: "C", desc: t("shortcuts.lesson.cheatsheet") },
    { key: "?/F1", desc: t("shortcuts.lesson.help") },
    { key: "Ctrl+C", desc: t("shortcuts.lesson.quit") },
  ],
  section: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.section.scrollLine") },
    { key: "Space / PgDn", desc: t("shortcuts.section.halfPage") },
    { key: "PgUp", desc: t("shortcuts.section.halfPageBack") },
    { key: "Home / End", desc: t("shortcuts.section.startEnd") },
    { key: "\u2192", desc: t("shortcuts.section.nextSection") },
    { key: "\u2190", desc: t("shortcuts.section.prevSection") },
    { key: "1-9", desc: t("shortcuts.section.directSection") },
    { key: "L", desc: t("shortcuts.section.tts") },
    { key: "D", desc: t("shortcuts.section.diagram") },
    { key: "A", desc: t("shortcuts.section.annotations") },
    { key: "M", desc: t("shortcuts.section.bookmark") },
    { key: "V", desc: t("shortcuts.section.vscode") },
    { key: "Q / Esc", desc: t("shortcuts.section.back") },
    { key: "?/F1", desc: t("shortcuts.section.help") },
    { key: "Ctrl+C", desc: t("shortcuts.section.quit") },
  ],
  warmup: [
    { key: "A-D", desc: t("shortcuts.warmup.answer") },
    { key: "S", desc: t("shortcuts.warmup.skip") },
    { key: "Enter", desc: t("shortcuts.warmup.next") },
    { key: "?/F1", desc: t("shortcuts.warmup.help") },
    { key: "Ctrl+C", desc: t("shortcuts.warmup.quit") },
  ],
  pretest: [
    { key: "A-D", desc: t("shortcuts.pretest.answer") },
    { key: "?", desc: t("shortcuts.pretest.dontKnow") },
    { key: "S", desc: t("shortcuts.pretest.skip") },
    { key: "Enter", desc: t("shortcuts.pretest.next") },
    { key: "A", desc: t("shortcuts.pretest.allStandard") },
    { key: "F1", desc: t("shortcuts.pretest.help") },
    { key: "Ctrl+C", desc: t("shortcuts.pretest.quit") },
  ],
  misconceptions: [
    { key: "A", desc: t("shortcuts.misconceptions.correct") },
    { key: "B", desc: t("shortcuts.misconceptions.error") },
    { key: "Enter", desc: t("shortcuts.misconceptions.next") },
    { key: "Q / Esc", desc: t("shortcuts.misconceptions.back") },
    { key: "?/F1", desc: t("shortcuts.misconceptions.help") },
    { key: "Ctrl+C", desc: t("shortcuts.misconceptions.quit") },
  ],
  interleaved: [
    { key: "A-D", desc: t("shortcuts.interleaved.answer") },
    { key: "Enter", desc: t("shortcuts.interleaved.next") },
    { key: "Q / Esc", desc: t("shortcuts.interleaved.cancel") },
    { key: "?/F1", desc: t("shortcuts.interleaved.help") },
    { key: "Ctrl+C", desc: t("shortcuts.interleaved.quit") },
  ],
  cheatsheet: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.cheatsheet.scroll") },
    { key: "Space / PgDn", desc: t("shortcuts.cheatsheet.halfPage") },
    { key: "PgUp", desc: t("shortcuts.cheatsheet.halfPageBack") },
    { key: "Home / End", desc: t("shortcuts.cheatsheet.startEnd") },
    { key: "Q / Esc", desc: t("shortcuts.cheatsheet.back") },
    { key: "?/F1", desc: t("shortcuts.cheatsheet.help") },
    { key: "Ctrl+C", desc: t("shortcuts.cheatsheet.quit") },
  ],
  search: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.search.navigate") },
    { key: "Enter", desc: t("shortcuts.search.open") },
    { key: "Esc", desc: t("shortcuts.search.back") },
    { key: "Ctrl+C", desc: t("shortcuts.search.quit") },
  ],
  bookmarks: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.bookmarks.navigate") },
    { key: "Enter", desc: t("shortcuts.bookmarks.open") },
    { key: "X", desc: t("shortcuts.bookmarks.delete") },
    { key: "Esc", desc: t("shortcuts.bookmarks.back") },
    { key: "?/F1", desc: t("shortcuts.bookmarks.help") },
    { key: "Ctrl+C", desc: t("shortcuts.bookmarks.quit") },
  ],
  stats: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.stats.scroll") },
    { key: "Esc / \u2190", desc: t("shortcuts.stats.back") },
    { key: "?/F1", desc: t("shortcuts.stats.help") },
    { key: "Ctrl+C", desc: t("shortcuts.stats.quit") },
  ],
  competence: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.competence.scroll") },
    { key: "Esc / \u2190", desc: t("shortcuts.competence.back") },
    { key: "?/F1", desc: t("shortcuts.competence.help") },
    { key: "Ctrl+C", desc: t("shortcuts.competence.quit") },
  ],
  hints: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.hints.selectExercise") },
    { key: "\u2190 / \u2192", desc: t("shortcuts.hints.selectTask") },
    { key: "N", desc: t("shortcuts.hints.nextHint") },
    { key: "R", desc: t("shortcuts.hints.reset") },
    { key: "Esc / Q", desc: t("shortcuts.hints.back") },
    { key: "?/F1", desc: t("shortcuts.hints.help") },
    { key: "Ctrl+C", desc: t("shortcuts.hints.quit") },
  ],
  exercisemenu: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.exercisemenu.navigate") },
    { key: "1-4", desc: t("shortcuts.exercisemenu.selectLevel") },
    { key: "Enter", desc: t("shortcuts.exercisemenu.open") },
    { key: "Esc / \u2190", desc: t("shortcuts.exercisemenu.back") },
    { key: "?/F1", desc: t("shortcuts.exercisemenu.help") },
    { key: "Ctrl+C", desc: t("shortcuts.exercisemenu.quit") },
  ],
  selfexplain: [
    { key: "T", desc: t("shortcuts.selfexplain.type") },
    { key: "Enter", desc: t("shortcuts.selfexplain.understood") },
    { key: "?", desc: t("shortcuts.selfexplain.showKeyPoints") },
    { key: "F1", desc: t("shortcuts.selfexplain.help") },
    { key: "Ctrl+C", desc: t("shortcuts.selfexplain.quit") },
  ],
  completion: [
    { key: "Enter", desc: t("shortcuts.completion.checkNext") },
    { key: "H", desc: t("shortcuts.completion.hint") },
    { key: "L", desc: t("shortcuts.completion.solution") },
    { key: "Q / Esc", desc: t("shortcuts.completion.back") },
    { key: "?/F1", desc: t("shortcuts.completion.help") },
    { key: "Ctrl+C", desc: t("shortcuts.completion.quit") },
  ],
  history: [
    { key: "\u2191 / \u2193", desc: t("shortcuts.history.navigate") },
    { key: "Enter", desc: t("shortcuts.history.open") },
    { key: "Esc", desc: t("shortcuts.history.back") },
    { key: "?/F1", desc: t("shortcuts.history.help") },
    { key: "Ctrl+C", desc: t("shortcuts.history.quit") },
  ],
  quiz: [
    { key: "A-D", desc: t("shortcuts.quiz.letterAnswer") },
    { key: "Enter", desc: t("shortcuts.quiz.next") },
    { key: "Q / Esc", desc: t("shortcuts.quiz.back") },
    { key: "?/F1", desc: t("shortcuts.quiz.help") },
    { key: "Ctrl+C", desc: t("shortcuts.quiz.quit") },
  ],
  };
}

// Backwards-compatible accessor (was previously a const)
export const shortcutsForScreen: Record<string, { key: string; desc: string }[]> = new Proxy({} as Record<string, { key: string; desc: string }[]>, {
  get(_target, prop: string) {
    return getShortcutsForScreen()[prop];
  },
  ownKeys() {
    return Object.keys(getShortcutsForScreen());
  },
  getOwnPropertyDescriptor(_target, prop: string) {
    const data = getShortcutsForScreen();
    if (prop in data) {
      return { configurable: true, enumerable: true, value: data[prop] };
    }
    return undefined;
  },
  has(_target, prop: string) {
    return prop in getShortcutsForScreen();
  },
});

// ─── Terminal-Groesse ──────────────────────────────────────────────────────

export function updateTermSize(): void {
  _W = process.stdout.columns || 80;
  _H = process.stdout.rows || 24;
}

// ─── Fortschritt ────────────────────────────────────────────────────────────

/** Migrate alte string-basierte SectionProgress zu neuem Objekt-Format */
export function migrateSectionProgress(
  value: SectionProgress | "completed" | "in_progress"
): SectionProgress {
  if (typeof value === "string") {
    return {
      status: value,
      scrollPercent: value === "completed" ? 100 : 0,
    };
  }
  return value;
}

/** Holt den Status einer Sektion (kompatibel mit altem und neuem Format) */
export function getSectionStatus(key: string): "completed" | "in_progress" | undefined {
  const entry = progress.sections[key];
  if (!entry) return undefined;
  if (typeof entry === "string") return entry;
  return entry.status;
}

/** Holt den scrollPercent einer Sektion */
export function getSectionScrollPercent(key: string): number {
  const entry = progress.sections[key];
  if (!entry) return 0;
  if (typeof entry === "string") return entry === "completed" ? 100 : 0;
  return entry.scrollPercent ?? 0;
}

export function loadProgress(): void {
  try {
    // Migration: Alte Fortschrittsdateien in neues Schema uebernehmen
    if (!fs.existsSync(PROGRESS_FILE)) {
      const legacyStateFile = path.join(STATE_DIR, "tui-progress.json");
      const legacyCourseFile = path.join(PROJECT_ROOT, "tools", "tui-progress.json");
      if (fs.existsSync(legacyStateFile)) {
        fs.copyFileSync(legacyStateFile, PROGRESS_FILE);
      } else if (fs.existsSync(legacyCourseFile)) {
        fs.copyFileSync(legacyCourseFile, PROGRESS_FILE);
      }
    }
    const raw = fs.readFileSync(PROGRESS_FILE, "utf-8");
    const data = JSON.parse(raw);
    progress = {
      sections: data.sections ?? {},
      exercises: data.exercises ?? {},
      quizzes: data.quizzes ?? {},
      lastLesson: data.lastLesson ?? 0,
      lastSection: data.lastSection ?? 0,
      lastScrollOffset: data.lastScrollOffset ?? 0,
      lastScreen: data.lastScreen ?? "main",
      bookmarks: data.bookmarks ?? [],
    };
    // Migration: Konvertiere alte String-Eintraege zu SectionProgress
    for (const key of Object.keys(progress.sections)) {
      if (typeof progress.sections[key] === "string") {
        progress.sections[key] = migrateSectionProgress(
          progress.sections[key]
        );
      }
    }
  } catch {
    // Datei existiert nicht — Standardwerte behalten
  }
}

export function saveProgress(): void {
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify(progress, null, 2) + "\n",
    "utf-8"
  );
}

/** Debounced version of saveProgress — used during scroll to reduce disk I/O */
let saveProgressTimer: ReturnType<typeof setTimeout> | null = null;
export function debouncedSaveProgress(): void {
  if (saveProgressTimer) clearTimeout(saveProgressTimer);
  saveProgressTimer = setTimeout(() => {
    saveProgress();
    saveProgressTimer = null;
  }, 500);
}

export function getSectionKey(lessonIndex: number, sectionIndex: number): string {
  const lesson = lessons[lessonIndex];
  if (!lesson) return "??-??";
  return `${lesson.number}-${String(sectionIndex + 1).padStart(2, "0")}`;
}

/** Markiert eine Sektion als abgeschlossen */
export function markSectionCompleted(sKey: string): void {
  const entry = progress.sections[sKey];
  const wasAlreadyCompleted = entry
    ? (typeof entry === "string" ? entry === "completed" : entry.status === "completed")
    : false;

  if (!entry) {
    progress.sections[sKey] = {
      status: "completed",
      completed: new Date().toISOString(),
      scrollPercent: 100,
    };
  } else if (typeof entry === "string") {
    progress.sections[sKey] = {
      status: "completed",
      completed: new Date().toISOString(),
      scrollPercent: 100,
    };
  } else {
    entry.status = "completed";
    entry.completed = entry.completed ?? new Date().toISOString();
    entry.scrollPercent = 100;
  }

  // Feature 3: Session-Statistik
  if (!wasAlreadyCompleted) {
    sessionStats.sectionsRead++;
  }
}

// ─── Fortschritts-Berechnung ──────────────────────────────────────────────

export function countExerciseProgress(lesson: LessonInfo): {
  solved: number;
  total: number;
} {
  let solved = 0;
  const total = lesson.exerciseFiles.length;

  for (const file of lesson.exerciseFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const todos = content.match(TODO_PATTERN);
      if (!todos || todos.length === 0) {
        solved++;
      }
    } catch {
      // Datei nicht lesbar
    }
  }

  return { solved, total };
}

export function getDueReviewCount(): number {
  try {
    const raw = fs.readFileSync(REVIEW_DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    let due = 0;

    const questions = data.questions ?? {};
    for (const key of Object.keys(questions)) {
      const rec = questions[key];
      if (!rec || !rec.lastCorrect) {
        due++;
        continue;
      }
      const dueDate = new Date(rec.lastCorrect);
      dueDate.setDate(dueDate.getDate() + (rec.interval ?? 1));
      if (dueDate.toISOString().slice(0, 10) <= today) {
        due++;
      }
    }

    return due;
  } catch {
    return 0;
  }
}

export function getReviewStreak(): number {
  try {
    const raw = fs.readFileSync(REVIEW_DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!data.stats?.lastReviewDate) return 0;
    const today = new Date();
    const last = new Date(data.stats.lastReviewDate);
    const diffDays = Math.floor(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays > 1) return 0;
    return data.stats.totalReviews > 0 ? Math.min(data.stats.totalReviews, 99) : 0;
  } catch {
    return 0;
  }
}

export function getLessonProgress(lessonIndex: number): number {
  const lesson = lessons[lessonIndex];
  if (!lesson) return 0;

  let done = 0;
  let total = 0;

  for (let s = 0; s < lesson.sections.length; s++) {
    total++;
    const key = getSectionKey(lessonIndex, s);
    if (getSectionStatus(key) === "completed") done++;
  }

  const ex = countExerciseProgress(lesson);
  total += ex.total;
  done += ex.solved;

  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function getOverallProgress(): number {
  if (lessons.length === 0) return 0;
  let totalPct = 0;
  for (let i = 0; i < lessons.length; i++) {
    totalPct += getLessonProgress(i);
  }
  return Math.round(totalPct / lessons.length);
}

export function getNextStep(): string {
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    for (let s = 0; s < lesson.sections.length; s++) {
      const key = getSectionKey(i, s);
      if (getSectionStatus(key) !== "completed") {
        return t("nextStep.readSection", { lesson: lesson.number, section: String(s + 1) });
      }
    }
    const ex = countExerciseProgress(lesson);
    if (ex.solved < ex.total) {
      return t("nextStep.solveExercises", { lesson: lesson.number });
    }
  }
  return t("nextStep.allDone");
}

// ─── Mastery-Levels (Feature 6) ───────────────────────────────────────────

export function calculateMastery(lessonIndex: number): MasteryLevel {
  const lesson = lessons[lessonIndex];
  if (!lesson) return "newcomer";

  let sectionsRead = 0;
  for (let s = 0; s < lesson.sections.length; s++) {
    const key = getSectionKey(lessonIndex, s);
    if (getSectionStatus(key) === "completed") sectionsRead++;
  }
  const sectionsComplete =
    lesson.sections.length > 0
      ? Math.round((sectionsRead / lesson.sections.length) * 100)
      : 0;

  const ex = countExerciseProgress(lesson);
  const exercisesComplete =
    ex.total > 0 ? Math.round((ex.solved / ex.total) * 100) : 100;

  const quizData = progress.quizzes[lesson.number];
  const quizScore = quizData
    ? Math.round((quizData.score / quizData.total) * 100)
    : 0;

  if (sectionsComplete < 50) return "newcomer";
  if (exercisesComplete < 50) return "familiar";
  if (quizScore < 80 || exercisesComplete < 100) return "proficient";
  return "expert";
}

export function masteryBar(level: MasteryLevel): string {
  // Inline ANSI um Circular Dependency mit tui-render.ts zu vermeiden
  const _c = { reset: "\x1b[0m", dim: "\x1b[2m", yellow: "\x1b[33m", cyan: "\x1b[36m", green: "\x1b[32m" };
  const levels: Record<MasteryLevel, { filled: number; color: string; label: string }> = {
    newcomer:   { filled: 2, color: _c.dim,    label: "Newcomer" },
    familiar:   { filled: 4, color: _c.yellow, label: "Familiar" },
    proficient: { filled: 7, color: _c.cyan,   label: "Proficient" },
    expert:     { filled: 10, color: _c.green,  label: "Expert" },
  };
  const info = levels[level];
  const bar = `${info.color}${"█".repeat(info.filled)}${_c.dim}${"░".repeat(10 - info.filled)}${_c.reset}`;
  return `${bar}  ${info.color}${info.label}${_c.reset}`;
}

export function getRecentActivityValues(days: number): number[] {
  const values: number[] = Array.from({ length: days }, () => 0);

  try {
    const raw = fs.readFileSync(REVIEW_DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    const questions = data.questions ?? {};
    const today = new Date();

    for (const key of Object.keys(questions)) {
      const rec = questions[key];
      if (rec?.lastCorrect) {
        const reviewDate = new Date(rec.lastCorrect);
        const diffMs = today.getTime() - reviewDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < days) {
          values[days - 1 - diffDays]++;
        }
      }
    }
  } catch {
    // review-data nicht verfuegbar
  }

  const totalCompleted = Object.values(progress.sections).filter((s) => {
    const status = typeof s === "string" ? s : s.status;
    return status === "completed";
  }).length;
  const hasActivity = values.some((v) => v > 0);
  if (totalCompleted > 0 && !hasActivity) {
    values[days - 1] = totalCompleted;
  }

  return values;
}

// ─── Daten-Loader fuer Lektionsdateien ────────────────────────────────────

export function loadMisconceptions(lessonIndex: number): import("./tui-types.ts").Misconception[] {
  const lesson = lessons[lessonIndex];
  if (!lesson) return [];
  const filePath = path.join(PROJECT_ROOT, lesson.dirName, "misconceptions.ts");
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const match = content.match(
      /export\s+const\s+misconceptions\s*(?::\s*Misconception\[\])?\s*=\s*(\[[\s\S]*\]);?\s*$/m
    );
    if (!match?.[1]) {
      console.error(`[TUI] Misconceptions-Datei konnte nicht geparst werden: ${filePath}`);
      return [];
    }
    let arrayStr = match[1];
    arrayStr = arrayStr.replace(/\/\/[^\n]*/g, "");
    arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, "");
    arrayStr = arrayStr.replace(/,\s*([}\]])/g, "$1");
    let prev = "";
    while (prev !== arrayStr) {
      prev = arrayStr;
      arrayStr = arrayStr.replace(/"([^"]*)"\s*\+\s*"([^"]*)"/g, '"$1$2"');
    }
    arrayStr = arrayStr.replace(/`([^`]*)`/g, (_match: string, inner: string) => {
      const escaped = inner.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
      return `"${escaped}"`;
    });
    arrayStr = arrayStr.replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":');
    const parsed = JSON.parse(arrayStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[TUI] Fehler beim Laden der Misconceptions fuer Lektion ${lesson.number}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

export function loadCompletionProblems(lessonIndex: number): import("./tui-types.ts").CompletionProblem[] {
  const lesson = lessons[lessonIndex];
  if (!lesson) return [];
  const filePath = path.join(PROJECT_ROOT, lesson.dirName, "completion-problems.ts");
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const match = content.match(
      /export\s+const\s+completionProblems\s*(?::\s*CompletionProblem\[\])?\s*=\s*(\[[\s\S]*\]);?\s*$/m
    );
    if (!match?.[1]) {
      console.error(`[TUI] Completion-Problems-Datei konnte nicht geparst werden: ${filePath}`);
      return [];
    }
    let arrayStr = match[1];
    arrayStr = arrayStr.replace(/\/\/[^\n]*/g, "");
    arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, "");
    arrayStr = arrayStr.replace(/,\s*([}\]])/g, "$1");
    let prev2 = "";
    while (prev2 !== arrayStr) {
      prev2 = arrayStr;
      arrayStr = arrayStr.replace(/"([^"]*)"\s*\+\s*"([^"]*)"/g, '"$1$2"');
    }
    arrayStr = arrayStr.replace(/`([^`]*)`/g, (_match: string, inner: string) => {
      const escaped = inner.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
      return `"${escaped}"`;
    });
    arrayStr = arrayStr.replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":');
    const parsed = JSON.parse(arrayStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[TUI] Fehler beim Laden der Completion-Problems fuer Lektion ${lesson.number}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

export function getCompletedLessonIndices(): number[] {
  const completed: number[] = [];
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    let sectDone = 0;
    for (let s = 0; s < lesson.sections.length; s++) {
      const key = getSectionKey(i, s);
      if (getSectionStatus(key) === "completed") sectDone++;
    }
    if (lesson.sections.length > 0 && sectDone >= lesson.sections.length * 0.5) {
      completed.push(i);
    }
  }
  return completed;
}

export function hasTakenPretest(lessonIndex: number, sectionIndex: number): boolean {
  return pretestsTaken.has(`${lessonIndex}-${sectionIndex}`);
}

export function markPretestTaken(lessonIndex: number, sectionIndex: number): void {
  pretestsTaken.add(`${lessonIndex}-${sectionIndex}`);
}

/** Prueft ob der Lektions-Pretest (alle Sektionen) bereits absolviert wurde. */
export function hasTakenLessonPretest(lessonIndex: number): boolean {
  return pretestsTaken.has(`lesson-${lessonIndex}`);
}

/** Markiert den Lektions-Pretest als absolviert. */
export function markLessonPretestTaken(lessonIndex: number): void {
  pretestsTaken.add(`lesson-${lessonIndex}`);
}

export function hasResumeTarget(): boolean {
  if (progress.lastScreen === "section" || progress.lastScreen === "lesson") {
    const li = progress.lastLesson;
    if (li >= 0 && li < lessons.length) {
      return true;
    }
  }
  return false;
}

// ─── Lektions-Erkennung ────────────────────────────────────────────────────

export function discoverLessons(): LessonInfo[] {
  const entries = fs.readdirSync(PROJECT_ROOT, { withFileTypes: true });
  const result: LessonInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^(\d{2})-/);
    if (!match) continue;

    const lessonDir = path.join(PROJECT_ROOT, entry.name);
    const number = match[1];

    let title = entry.name.replace(/^\d{2}-/, "").replace(/-/g, " ");
    const readmePath = path.join(lessonDir, "README.md");
    if (fs.existsSync(readmePath)) {
      const firstLine = fs.readFileSync(readmePath, "utf-8").split("\n")[0];
      const titleMatch = firstLine.match(/^#\s*(?:Lektion|Lesson)\s*\d+:\s*(.+)/);
      if (titleMatch) title = titleMatch[1].trim();
    }

    const sectionsDir = path.join(lessonDir, "sections");
    const sections: import("./tui-types.ts").SectionInfo[] = [];
    if (fs.existsSync(sectionsDir)) {
      const sectionFiles = fs
        .readdirSync(sectionsDir)
        .filter((f) => f.endsWith(".md"))
        .sort();

      for (let idx = 0; idx < sectionFiles.length; idx++) {
        const fp = path.join(sectionsDir, sectionFiles[idx]);
        const content = fs.readFileSync(fp, "utf-8");
        const firstLine = content.split("\n")[0] || "";
        let sTitle = sectionFiles[idx]
          .replace(/^\d+-/, "")
          .replace(/\.md$/, "")
          .replace(/-/g, " ");
        const headerMatch = firstLine.match(
          /^#\s*(?:(?:Sektion|Section)\s*\d+:\s*)?(.+)/
        );
        if (headerMatch) sTitle = headerMatch[1].trim();

        sections.push({
          fileName: sectionFiles[idx],
          filePath: fp,
          title: sTitle,
          index: idx,
        });
      }
    }

    const exercisesDir = path.join(lessonDir, "exercises");
    let exerciseFiles: string[] = [];
    if (fs.existsSync(exercisesDir)) {
      exerciseFiles = fs
        .readdirSync(exercisesDir)
        .filter((f) => f.endsWith(".ts"))
        .sort()
        .map((f) => path.join(exercisesDir, f));
    }

    const examplesDir = path.join(lessonDir, "examples");
    let exampleFiles: string[] = [];
    if (fs.existsSync(examplesDir)) {
      exampleFiles = fs
        .readdirSync(examplesDir)
        .filter((f) => f.endsWith(".ts"))
        .sort()
        .map((f) => path.join(examplesDir, f));
    }

    result.push({
      dirName: entry.name,
      number,
      title,
      sections,
      exerciseFiles,
      exampleFiles,
      hasQuiz: fs.existsSync(path.join(lessonDir, "quiz-data.ts")),
      hasCheatsheet: fs.existsSync(path.join(lessonDir, "cheatsheet.md")),
      hasHints: fs.existsSync(path.join(lessonDir, "hints.json")),
    });
  }

  return result.sort((a, b) => a.number.localeCompare(b.number));
}

// ─── Feature 2: Breadcrumbs ──────────────────────────────────────────────

export function getBreadcrumb(screen: Screen): string {
  const mainMenu = t("breadcrumb.mainMenu");
  switch (screen.type) {
    case "platform":
      return t("breadcrumb.courseSelect");
    case "courseinfo": {
      const co = platformConfig.courses.find(c2 => c2.id === screen.courseId);
      return `${t("breadcrumb.courseSelect")} > ${co?.name ?? screen.courseId}`;
    }
    case "main": {
      const activeCo = platformConfig.courses.find(c2 => c2.id === platformConfig.activeCourse);
      return activeCo ? `${activeCo.icon} ${activeCo.name}` : mainMenu;
    }
    case "lesson": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"}`;
    }
    case "section": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > S${screen.sectionIndex + 1}`;
    }
    case "cheatsheet": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > ${t("breadcrumb.cheatsheet")}`;
    }
    case "pretest": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > ${t("breadcrumb.pretest")}`;
    }
    case "warmup":
      return t("breadcrumb.warmup");
    case "misconceptions": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > ${t("breadcrumb.misconceptions")}`;
    }
    case "completion": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > ${t("breadcrumb.completion")}`;
    }
    case "interleaved":
      return t("breadcrumb.interleavedReview");
    case "hints": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > ${t("breadcrumb.hints")}`;
    }
    case "exercisemenu": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > ${t("breadcrumb.exercises")}`;
    }
    case "selfexplain": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > ${t("breadcrumb.explanation")}`;
    }
    case "search":
      return t("breadcrumb.search");
    case "bookmarks":
      return t("breadcrumb.bookmarks");
    case "stats":
      return t("breadcrumb.stats");
    case "competence":
      return t("breadcrumb.competence");
    case "help":
      return t("breadcrumb.help");
    case "history":
      return t("breadcrumb.history");
    case "quiz": {
      const l = lessons[screen.lessonIndex];
      return `${mainMenu} > L${l?.number ?? "?"} > ${t("breadcrumb.quiz")}`;
    }
    default:
      return "";
  }
}

// ─── Metacognitive Confidence Feedback ──────────────────────────────────

export function getConfidenceFeedback(confident: boolean, correct: boolean): string {
  // Inline ANSI um Circular Dependency mit tui-render.ts zu vermeiden
  const _c = { reset: "\x1b[0m", dim: "\x1b[2m", yellow: "\x1b[33m", cyan: "\x1b[36m", green: "\x1b[32m" };
  if (confident && correct) {
    return `${_c.green}${t("confidence.goodCalibration")}${_c.reset}`;
  }
  if (confident && !correct) {
    return `${_c.yellow}${t("confidence.overconfident")}${_c.reset}`;
  }
  if (!confident && correct) {
    return `${_c.cyan}${t("confidence.underconfident")}${_c.reset}`;
  }
  return `${_c.dim}${t("confidence.goodSelfAssessment")}${_c.reset}`;
}
