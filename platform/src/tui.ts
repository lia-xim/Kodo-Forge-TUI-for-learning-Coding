/**
 * TypeScript Deep Learning — Fullscreen Terminal User Interface (TUI)
 *
 * Professionelle Fullscreen-Lern-Applikation die die gesamte Terminal-Groesse
 * nutzt. Integriert Lesen, Exercises, Quiz, Review, Hints und Diagramme.
 *
 * Features:
 *  - Smooth Scrolling (zeilenweise statt seitenweise)
 *  - Continue Where You Left Off (Resume-Banner)
 *  - VS Code Integration ([V] Shortcut)
 *  - Volltextsuche ([/] im Hauptmenue)
 *  - Lesezeichen ([M] setzen, [B] im Hauptmenue anzeigen)
 *  - Mastery-Levels pro Lektion
 *  - Text-to-Speech Vorlesen ([L] im Section-Reader, Windows Speech Synthese)
 *
 * Start: npx tsx tools/tui.ts   oder   npm start
 *
 * Keine externen Dependencies — nur Node.js built-ins.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawn, exec, type ChildProcess } from "node:child_process";
import {
  renderMarkdown,
  paginate,
  estimateReadTime,
  stripAnsi,
  extractMermaidBlocks,
  renderPreview,
  annotationsEnabled,
  setAnnotationsEnabled,
  extractSelfExplanationPrompts,
  type SelfExplanationPrompt,
} from "./markdown-renderer.ts";
import {
  progressBar as fineProgressBar,
  sparkline,
  colorSparkline,
  sectionDivider,
  colorBox,
  brailleChart,
} from "./visual-utils.ts";
import {
  getPretestQuestions,
  calculateDepth,
  calculateScore,
  buildPretestResult,
  getWarmUpQuestions,
  type PretestQuestion,
  type PretestResult,
} from "./pretest-engine.ts";
import {
  loadAdaptiveState,
  saveAdaptiveState,
  updateConceptScore,
  setSectionDepth,
  getSectionDepth,
  type AdaptiveState,
  type ContentDepth,
} from "./adaptive-engine.ts";
import {
  getInterleavedItems,
  type InterleavedItem,
} from "./interleave-engine.ts";

// ─── ANSI-Farben & Escape Codes ────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  inverse: "\x1b[7m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  bgGray: "\x1b[48;5;236m",
  bgDarkGray: "\x1b[48;5;234m",
};

// Alternate Screen Buffer
const ENTER_ALT_SCREEN = "\x1b[?1049h";
const LEAVE_ALT_SCREEN = "\x1b[?1049l";
const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
const CURSOR_HOME = "\x1b[H";
const CLEAR_SCREEN = "\x1b[2J";

// Mouse tracking
// ?1000h = button event tracking, ?1006h = SGR extended mode
// ?1007h = alternate scroll mode (scroll wheel sends arrow keys — most reliable on Windows Terminal)
// Note: ?1003h (all-motion tracking) removed to prevent double scroll events
const ENABLE_MOUSE =
  "\x1b[?1000h\x1b[?1006h\x1b[?1007h";
const DISABLE_MOUSE =
  "\x1b[?1007l\x1b[?1006l\x1b[?1000l";

// ─── Konstanten ─────────────────────────────────────────────────────────────

/** platform/ Ordner (Parent von src/) */
const PLATFORM_ROOT = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  ".."
);
/** Learning/ Ordner (Parent von platform/) — enthaelt alle Kursverzeichnisse */
const COURSES_ROOT = path.resolve(PLATFORM_ROOT, "..");
/** platform/platform.json */
const PLATFORM_FILE = path.join(PLATFORM_ROOT, "platform.json");
/** platform/state/ — Runtime State (Progress, Review, Adaptive, etc.) */
const STATE_DIR = path.join(PLATFORM_ROOT, "state");

/** Dynamisch pro Kurs: z.B. Learning/typescript/ */
let PROJECT_ROOT = path.join(COURSES_ROOT, "typescript");

// Abgeleitete Pfade — werden bei Kurswechsel neu berechnet
let TOOLS_DIR = path.join(PROJECT_ROOT, "tools");
let ACTIVE_COURSE_ID = "typescript";
let PROGRESS_FILE = path.join(STATE_DIR, `progress-${ACTIVE_COURSE_ID}.json`);
let REVIEW_DATA_FILE = path.join(STATE_DIR, `review-${ACTIVE_COURSE_ID}.json`);
const TODO_PATTERN = /\/\/\s*TODO:/g;

/** Pfade nach Kurswechsel aktualisieren */
function updateDerivedPaths(): void {
  TOOLS_DIR = path.join(PROJECT_ROOT, "tools");
  PROGRESS_FILE = path.join(STATE_DIR, `progress-${ACTIVE_COURSE_ID}.json`);
  REVIEW_DATA_FILE = path.join(STATE_DIR, `review-${ACTIVE_COURSE_ID}.json`);
}

// ─── Platform-Typen ─────────────────────────────────────────────────────────

interface PlatformCourse {
  id: string;
  name: string;
  description: string;
  directory: string;
  color: string;
  icon: string;
  totalLessons: number;
  totalSections?: number;
  estimatedHours?: number;
  exerciseTypes?: number;
  topics?: string[];
  prerequisite: string | null;
  prerequisiteDescription?: string;
  prerequisiteMinPhase?: number | null;
  status: "active" | "planned" | "coming_soon";
  recommendNext: string | null;
}

interface PlatformConfig {
  courses: PlatformCourse[];
  activeCourse: string;
  lastAccessed: Record<string, string>;
}

/** Fortschrittsdaten eines einzelnen Kurses (zusammengefasst) */
interface CourseProgressSummary {
  completedLessons: number;
  totalLessons: number;
  currentPhase: number;
  lastLessonTitle: string;
  percent: number;
}

// ─── Typen ──────────────────────────────────────────────────────────────────

interface LessonInfo {
  dirName: string;
  number: string;
  title: string;
  sections: SectionInfo[];
  exerciseFiles: string[];
  exampleFiles: string[];
  hasQuiz: boolean;
  hasCheatsheet: boolean;
  hasHints: boolean;
}

interface SectionInfo {
  fileName: string;
  filePath: string;
  title: string;
  index: number;
}

interface Bookmark {
  lessonIndex: number;
  sectionIndex: number;
  scrollOffset: number;
  note?: string;
  created: string; // ISO date
}

interface SectionProgress {
  status: "completed" | "in_progress";
  firstOpened?: string;   // ISO date
  completed?: string;     // ISO date
  scrollPercent: number;  // 0-100
}

type MasteryLevel = "newcomer" | "familiar" | "proficient" | "expert";

// ─── Misconception / Completion-Problem Interfaces ─────────────────────────

interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number;
}

interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

type Screen =
  | { type: "platform"; selectedIndex: number; scrollOffset: number; confirmUnlock?: boolean }
  | { type: "courseinfo"; courseId: string; scrollOffset: number; totalLines: number }
  | { type: "main"; selectedIndex: number }
  | { type: "lesson"; lessonIndex: number; selectedIndex: number }
  | {
      type: "section";
      lessonIndex: number;
      sectionIndex: number;
      scrollOffset: number;
      totalLines: number;
    }
  | { type: "cheatsheet"; lessonIndex: number; scrollOffset: number; totalLines: number }
  | { type: "stats"; scrollOffset: number }
  | {
      type: "search";
      query: string;
      results: SearchResult[];
      selectedResult: number;
    }
  | {
      type: "bookmarks";
      selectedIndex: number;
    }
  | {
      type: "hints";
      lessonIndex: number;
      exercises: string[];
      selectedExercise: number;
      selectedTask: number;
      hintsData: Record<string, Record<string, string[]>>;
      currentHints: string[];
      shownHintCount: number;
    }
  | {
      type: "warmup";
      questions: { lessonIndex: number; question: PretestQuestion }[];
      currentIndex: number;
      answers: { correct: boolean; skipped: boolean }[];
      showingFeedback: boolean;
      feedbackCorrect: boolean;
      feedbackExplanation: string;
      done: boolean;
      phase?: "question" | "confidence" | "feedback";
      pendingCorrect?: boolean;
      pendingExplanation?: string;
      confidence?: number;
    }
  | {
      type: "pretest";
      lessonIndex: number;
      sectionIndex: number;
      questions: PretestQuestion[];
      currentIndex: number;
      answers: { correct: boolean; skipped: boolean }[];
      showingFeedback: boolean;
      feedbackCorrect: boolean;
      feedbackExplanation: string;
      showingResult: boolean;
      recommendedDepth: "kurz" | "standard" | "vollständig";
      score: number;
      phase?: "question" | "confidence" | "feedback";
      pendingCorrect?: boolean;
      pendingExplanation?: string;
      confidence?: number;
    }
  | {
      type: "selfexplain";
      lessonIndex: number;
      sectionIndex: number;
      scrollOffset: number;
      totalLines: number;
      prompt: SelfExplanationPrompt;
      showKeyPoints: boolean;
      typingMode: boolean;
      typedText: string;
    }
  | {
      type: "misconceptions";
      lessonIndex: number;
      misconceptions: Misconception[];
      currentIndex: number;
      answered: boolean;
      selectedOption: number;
      showingResolution: boolean;
      score: number;
    }
  | {
      type: "completion";
      lessonIndex: number;
      problems: CompletionProblem[];
      currentProblem: number;
      currentBlank: number;
      userInput: string;
      filledBlanks: string[];
      showingHint: boolean;
      showingSolution: boolean;
      score: number;
    }
  | {
      type: "interleaved";
      items: InterleavedItem[];
      currentIndex: number;
      answers: { correct: boolean }[];
      showingFeedback: boolean;
      feedbackCorrect: boolean;
      feedbackExplanation: string;
      done: boolean;
      phase?: "question" | "confidence" | "feedback";
      pendingCorrect?: boolean;
      pendingExplanation?: string;
      confidence?: number;
    }
  | {
      type: "competence";
      scrollOffset: number;
    }
  | {
      type: "exercisemenu";
      lessonIndex: number;
      selectedIndex: number;
    }
  | {
      type: "help";
      previousScreen: Screen;
    }
  | {
      type: "history";
      selectedIndex: number;
    };

interface SearchResult {
  lessonIndex: number;
  sectionIndex: number;
  lessonNumber: string;
  sectionNumber: number;
  sectionTitle: string;
  contextLine: string;
  lineNumber: number; // line within rendered content for scroll targeting
}

interface ProgressData {
  sections: Record<string, SectionProgress | "completed" | "in_progress">;
  exercises: Record<string, { solved: number; total: number }>;
  quizzes: Record<string, { score: number; total: number; date: string }>;
  lastLesson: number;
  lastSection: number;
  lastScrollOffset: number;
  lastScreen: string;
  bookmarks: Bookmark[];
}

// ─── Globaler State ─────────────────────────────────────────────────────────

let currentScreen: Screen = { type: "main", selectedIndex: 0 };
let lessons: LessonInfo[] = [];
let progress: ProgressData = {
  sections: {},
  exercises: {},
  quizzes: {},
  lastLesson: 0,
  lastSection: 0,
  lastScrollOffset: 0,
  lastScreen: "main",
  bookmarks: [],
};
let W = 80; // Terminal-Breite
let H = 24; // Terminal-Hoehe
let isInAltScreen = false;

// Platform state
let platformConfig: PlatformConfig = {
  courses: [],
  activeCourse: "typescript",
  lastAccessed: {},
};
let courseProgressCache: Map<string, CourseProgressSummary> = new Map();

// Course info reader state (curriculum markdown)
let courseInfoRenderedLines: string[] = [];

// Section reader state — rendered lines (full document)
let sectionRenderedLines: string[] = [];
let sectionReadTime = 1;
let sectionMermaidBlocks: string[] = [];
let sectionSelfExplainPrompts: SelfExplanationPrompt[] = [];
let sectionSelfExplainTriggered: Set<number> = new Set();
let sectionRawMarkdown = ""; // Raw Markdown fuer TTS-Extraktion

// ─── Text-to-Speech (TTS) State ──────────────────────────────────────────
let ttsProcess: ChildProcess | null = null;
let ttsActive = false;
let ttsParagraphs: string[] = [];
let ttsCurrentParagraph = 0;

// Cheatsheet reader state
let cheatsheetRenderedLines: string[] = [];

// Search debounce timer
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Adaptive state
let adaptiveState: AdaptiveState = {
  sectionDepths: {},
  conceptScores: {},
  hintLevels: {},
};

// Pre-test results cache (tracks which sections had pre-tests taken)
let pretestsTaken: Set<string> = new Set();

// Warm-up was shown this session
let warmupShownThisSession = false;

// ─── Feature 3: Session-Timer + Tages-Zusammenfassung ─────────────────────
const SESSION_START = Date.now();
let sessionStats = { sectionsRead: 0, exercisesSolved: 0, quizzesTaken: 0, questionsAnswered: 0 };

function formatSessionTime(): string {
  const elapsed = Date.now() - SESSION_START;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ─── Feature 4: Navigation History ────────────────────────────────────────
const MAX_HISTORY = 20;
let navigationHistory: Screen[] = [];

function pushHistory(screen: Screen): void {
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
const shortcutsForScreen: Record<string, { key: string; desc: string }[]> = {
  platform: [
    { key: "\u2191 / \u2193", desc: "Kurs waehlen" },
    { key: "Enter", desc: "Kurs oeffnen" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Q", desc: "Beenden" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  courseinfo: [
    { key: "\u2191 / \u2193", desc: "Scrollen" },
    { key: "C", desc: "Curriculum anzeigen" },
    { key: "Esc / \u2190", desc: "Zurueck zur Kursauswahl" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  main: [
    { key: "\u2191 / \u2193", desc: "Navigieren" },
    { key: "Enter / \u2192", desc: "Oeffnen / Bestaetigen" },
    { key: "1-9", desc: "Lektion direkt oeffnen" },
    { key: "/", desc: "Volltextsuche" },
    { key: "B", desc: "Lesezeichen anzeigen" },
    { key: "R", desc: "Review starten" },
    { key: "I", desc: "Interleaved Review" },
    { key: "K", desc: "Kompetenzen" },
    { key: "P", desc: "Kursauswahl (Platform)" },
    { key: "Alt+\u2190", desc: "Letzte Stellen (History)" },
    { key: "Q", desc: "Beenden" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  lesson: [
    { key: "\u2191 / \u2193", desc: "Navigieren" },
    { key: "Enter / \u2192", desc: "Oeffnen / Bestaetigen" },
    { key: "Esc / \u2190", desc: "Zurueck" },
    { key: "1-9", desc: "Sektion oeffnen" },
    { key: "E", desc: "Exercises" },
    { key: "Z", desc: "Quiz" },
    { key: "H", desc: "Hints" },
    { key: "G", desc: "Misconceptions" },
    { key: "V", desc: "In VS Code oeffnen" },
    { key: "C", desc: "Cheatsheet" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  section: [
    { key: "\u2191 / \u2193", desc: "Zeilenweise scrollen" },
    { key: "Space / PgDn", desc: "Halbe Seite weiter" },
    { key: "PgUp", desc: "Halbe Seite zurueck" },
    { key: "Home / End", desc: "Anfang / Ende" },
    { key: "\u2192", desc: "Naechste Sektion" },
    { key: "\u2190", desc: "Vorherige Sektion" },
    { key: "1-9", desc: "Sektion direkt" },
    { key: "L", desc: "Vorlesen (Text-to-Speech)" },
    { key: "D", desc: "Diagramm oeffnen" },
    { key: "A", desc: "Annotationen umschalten" },
    { key: "M", desc: "Lesezeichen setzen" },
    { key: "V", desc: "In VS Code oeffnen" },
    { key: "Q / Esc", desc: "Zurueck zum Menue" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  warmup: [
    { key: "A-D", desc: "Antwort waehlen" },
    { key: "S", desc: "Warm-Up ueberspringen" },
    { key: "Enter", desc: "Naechste Frage (nach Feedback)" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  pretest: [
    { key: "A-D", desc: "Antwort waehlen" },
    { key: "?", desc: "Ich weiss es nicht" },
    { key: "S", desc: "Pre-Test ueberspringen" },
    { key: "Enter", desc: "Naechste Frage / Sektion oeffnen" },
    { key: "F1", desc: "Tastenbelegung" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  misconceptions: [
    { key: "A", desc: "Code ist korrekt" },
    { key: "B", desc: "Fehler gefunden" },
    { key: "Enter", desc: "Naechste" },
    { key: "Q / Esc", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  interleaved: [
    { key: "A-D", desc: "Antwort waehlen" },
    { key: "Enter", desc: "Naechste Frage" },
    { key: "Q / Esc", desc: "Abbrechen" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  cheatsheet: [
    { key: "\u2191 / \u2193", desc: "Scrollen" },
    { key: "Space / PgDn", desc: "Halbe Seite weiter" },
    { key: "PgUp", desc: "Halbe Seite zurueck" },
    { key: "Home / End", desc: "Anfang / Ende" },
    { key: "Q / Esc", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  search: [
    { key: "\u2191 / \u2193", desc: "Navigieren" },
    { key: "Enter", desc: "Ergebnis oeffnen" },
    { key: "Esc", desc: "Zurueck" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  bookmarks: [
    { key: "\u2191 / \u2193", desc: "Navigieren" },
    { key: "Enter", desc: "Oeffnen" },
    { key: "X", desc: "Loeschen" },
    { key: "Esc", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  stats: [
    { key: "\u2191 / \u2193", desc: "Scrollen" },
    { key: "Esc / \u2190", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  competence: [
    { key: "\u2191 / \u2193", desc: "Scrollen" },
    { key: "Esc / \u2190", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  hints: [
    { key: "\u2191 / \u2193", desc: "Exercise waehlen" },
    { key: "\u2190 / \u2192", desc: "Aufgabe waehlen" },
    { key: "N", desc: "Naechster Hint" },
    { key: "R", desc: "Reset" },
    { key: "Esc / Q", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  exercisemenu: [
    { key: "\u2191 / \u2193", desc: "Navigieren" },
    { key: "1-4", desc: "Stufe waehlen" },
    { key: "Enter", desc: "Oeffnen" },
    { key: "Esc / \u2190", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  selfexplain: [
    { key: "T", desc: "Erklaerung tippen" },
    { key: "Enter", desc: "Verstanden — weiter" },
    { key: "?", desc: "Kernpunkte zeigen" },
    { key: "F1", desc: "Tastenbelegung" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  completion: [
    { key: "Enter", desc: "Antwort pruefen / Weiter" },
    { key: "H", desc: "Hint anzeigen" },
    { key: "L", desc: "Loesung anzeigen" },
    { key: "Q / Esc", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
  history: [
    { key: "\u2191 / \u2193", desc: "Navigieren" },
    { key: "Enter", desc: "Oeffnen" },
    { key: "Esc", desc: "Zurueck" },
    { key: "?/F1", desc: "Diese Hilfe" },
    { key: "Ctrl+C", desc: "Beenden" },
  ],
};

// ─── Cleanup — IMMER alternate buffer verlassen ────────────────────────────

function cleanup(): void {
  stopTTS(); // TTS-Prozess beenden bei Cleanup
  if (isInAltScreen) {
    process.stdout.write(DISABLE_MOUSE);
    process.stdout.write(LEAVE_ALT_SCREEN);
    isInAltScreen = false;
  }
  process.stdout.write(SHOW_CURSOR);
  try {
    if (process.stdin.isTTY && process.stdin.isRaw) {
      process.stdin.setRawMode(false);
    }
  } catch {
    // stdin evtl. schon geschlossen
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});
process.on("uncaughtException", (err) => {
  cleanup();
  console.error("Unerwarteter Fehler:", err);
  process.exit(1);
});

// ─── Fortschritt ────────────────────────────────────────────────────────────

/** Migrate alte string-basierte SectionProgress zu neuem Objekt-Format */
function migrateSectionProgress(
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
function getSectionStatus(key: string): "completed" | "in_progress" | undefined {
  const entry = progress.sections[key];
  if (!entry) return undefined;
  if (typeof entry === "string") return entry;
  return entry.status;
}

/** Holt den scrollPercent einer Sektion */
function getSectionScrollPercent(key: string): number {
  const entry = progress.sections[key];
  if (!entry) return 0;
  if (typeof entry === "string") return entry === "completed" ? 100 : 0;
  return entry.scrollPercent ?? 0;
}

function loadProgress(): void {
  try {
    // Migration: Alte Fortschrittsdateien in neues Schema uebernehmen
    if (!fs.existsSync(PROGRESS_FILE)) {
      // Versuche Legacy-Pfade: platform/state/tui-progress.json oder kurs/tools/tui-progress.json
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

function saveProgress(): void {
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify(progress, null, 2) + "\n",
    "utf-8"
  );
}

/** Debounced version of saveProgress — used during scroll to reduce disk I/O */
let saveProgressTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSaveProgress(): void {
  if (saveProgressTimer) clearTimeout(saveProgressTimer);
  saveProgressTimer = setTimeout(() => {
    saveProgress();
    saveProgressTimer = null;
  }, 500);
}

function getSectionKey(lessonIndex: number, sectionIndex: number): string {
  const lesson = lessons[lessonIndex];
  if (!lesson) return "??-??";
  return `${lesson.number}-${String(sectionIndex + 1).padStart(2, "0")}`;
}

// ─── Platform-Konfiguration ────────────────────────────────────────────────

function getDefaultPlatformConfig(): PlatformConfig {
  return {
    courses: [
      {
        id: "typescript",
        name: "TypeScript Deep Learning",
        description: "Von den Basics bis zur Type-Level-Programmierung",
        directory: "typescript",
        color: "blue",
        icon: "TS",
        totalLessons: 40,
        totalSections: 212,
        estimatedHours: 68,
        exerciseTypes: 12,
        topics: ["Primitives", "Generics", "Mapped Types", "Conditional Types", "Decorators", "Compiler API"],
        prerequisite: null,
        prerequisiteDescription: "Keine",
        status: "active",
        recommendNext: "angular",
      },
    ],
    activeCourse: "typescript",
    lastAccessed: {},
  };
}

function loadPlatformConfig(): void {
  try {
    if (fs.existsSync(PLATFORM_FILE)) {
      const raw = fs.readFileSync(PLATFORM_FILE, "utf-8");
      const data = JSON.parse(raw);
      platformConfig = {
        courses: data.courses ?? getDefaultPlatformConfig().courses,
        activeCourse: data.activeCourse ?? "typescript",
        lastAccessed: data.lastAccessed ?? {},
      };
    } else {
      platformConfig = getDefaultPlatformConfig();
      savePlatformConfig();
    }
  } catch {
    platformConfig = getDefaultPlatformConfig();
  }
}

function savePlatformConfig(): void {
  try {
    fs.writeFileSync(
      PLATFORM_FILE,
      JSON.stringify(platformConfig, null, 2) + "\n",
      "utf-8"
    );
  } catch {
    // Schreibfehler ignorieren — nicht kritisch
  }
}

/** Lese Fortschrittsdaten fuer einen bestimmten Kurs (aus dessen tui-progress.json) */
function getCourseProgressSummary(course: PlatformCourse): CourseProgressSummary {
  const cached = courseProgressCache.get(course.id);
  if (cached) return cached;

  const courseDir = path.join(COURSES_ROOT, course.directory);
  // Zuerst im zentralen State-Verzeichnis suchen (Kurs-spezifisch),
  // dann Fallback auf das Kurs-eigene tools-Verzeichnis
  const centralProgressFile = path.join(STATE_DIR, `progress-${course.id}.json`);
  const legacyProgressFile = path.join(courseDir, "tools", "tui-progress.json");
  const progressFile = fs.existsSync(centralProgressFile)
    ? centralProgressFile
    : legacyProgressFile;

  let completedLessons = 0;
  let lastLessonTitle = "";
  let currentPhase = 1;

  try {
    if (fs.existsSync(progressFile)) {
      const raw = fs.readFileSync(progressFile, "utf-8");
      const data = JSON.parse(raw);
      const sections = data.sections ?? {};

      // Zaehle abgeschlossene Lektionen anhand der Sektionseintraege
      const lessonCompletions = new Map<string, { done: number; total: number }>();

      // Entdecke Lektionsverzeichnisse im Kursordner
      if (fs.existsSync(courseDir)) {
        const entries = fs.readdirSync(courseDir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const match = entry.name.match(/^(\d{2})-/);
          if (!match) continue;
          const lessonNum = match[1];
          const sectionsDir = path.join(courseDir, entry.name, "sections");
          if (fs.existsSync(sectionsDir)) {
            const sectionFiles = fs.readdirSync(sectionsDir).filter(f => f.endsWith(".md"));
            const total = sectionFiles.length;
            let done = 0;
            for (let s = 0; s < total; s++) {
              const key = `${lessonNum}-${String(s + 1).padStart(2, "0")}`;
              const entry2 = sections[key];
              if (entry2) {
                const status = typeof entry2 === "string" ? entry2 : entry2.status;
                if (status === "completed") done++;
              }
            }
            lessonCompletions.set(lessonNum, { done, total });
          }
        }
      }

      // Zaehle wie viele Lektionen >= 50% fertig sind
      for (const [, info] of lessonCompletions) {
        if (info.total > 0 && info.done >= info.total * 0.5) {
          completedLessons++;
        }
      }

      // Phase berechnen (je 10 Lektionen = 1 Phase)
      currentPhase = Math.min(4, Math.floor(completedLessons / 10) + 1);

      // Letzte Lektion ermitteln
      if (data.lastLesson !== undefined) {
        const lessonIdx = data.lastLesson;
        // Versuche den Lektionstitel zu lesen
        const entries = fs.existsSync(courseDir)
          ? fs.readdirSync(courseDir, { withFileTypes: true })
              .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [];
        if (lessonIdx >= 0 && lessonIdx < entries.length) {
          const lessonDir = entries[lessonIdx].name;
          const readmePath = path.join(courseDir, lessonDir, "README.md");
          if (fs.existsSync(readmePath)) {
            const firstLine = fs.readFileSync(readmePath, "utf-8").split("\n")[0];
            const titleMatch = firstLine.match(/^#\s*Lektion\s*\d+:\s*(.+)/);
            if (titleMatch) lastLessonTitle = titleMatch[1].trim();
          }
          if (!lastLessonTitle) {
            lastLessonTitle = lessonDir.replace(/^\d{2}-/, "").replace(/-/g, " ");
          }
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  // Tatsaechliche Lektionsanzahl im Verzeichnis zaehlen
  let actualLessons = 0;
  try {
    if (fs.existsSync(courseDir)) {
      actualLessons = fs.readdirSync(courseDir, { withFileTypes: true })
        .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name))
        .length;
    }
  } catch {
    // ignore
  }

  const totalForPercent = actualLessons > 0 ? actualLessons : course.totalLessons;
  const percent = totalForPercent > 0 ? Math.round((completedLessons / totalForPercent) * 100) : 0;

  const summary: CourseProgressSummary = {
    completedLessons,
    totalLessons: actualLessons > 0 ? actualLessons : course.totalLessons,
    currentPhase,
    lastLessonTitle,
    percent,
  };

  courseProgressCache.set(course.id, summary);
  return summary;
}

/** Pruefe ob ein Kurs freigeschaltet ist (Voraussetzung erfuellt) */
function isCourseUnlocked(course: PlatformCourse): boolean {
  if (!course.prerequisite) return true;

  const prereqCourse = platformConfig.courses.find(c => c.id === course.prerequisite);
  if (!prereqCourse) return true; // Voraussetzungskurs nicht gefunden — freigeben

  const prereqProgress = getCourseProgressSummary(prereqCourse);
  const minPhase = course.prerequisiteMinPhase ?? 1;
  return prereqProgress.currentPhase >= minPhase;
}

/** Empfehlung berechnen: Welcher Kurs sollte als naechstes gestartet werden */
function getRecommendedCourse(): { courseId: string; lessonTitle: string } | null {
  // Finde den aktiven Kurs
  const activeCourse = platformConfig.courses.find(co => co.id === platformConfig.activeCourse);
  if (activeCourse) {
    const prog = getCourseProgressSummary(activeCourse);
    if (prog.percent < 100) {
      return {
        courseId: activeCourse.id,
        lessonTitle: prog.lastLessonTitle || "Naechste Lektion",
      };
    }
    // Aktiver Kurs fertig — empfehle den naechsten
    if (activeCourse.recommendNext) {
      const next = platformConfig.courses.find(co => co.id === activeCourse.recommendNext);
      if (next) {
        return { courseId: next.id, lessonTitle: "Starte jetzt!" };
      }
    }
  }

  // Fallback: Erster nicht-fertiger Kurs
  for (const course of platformConfig.courses) {
    const prog = getCourseProgressSummary(course);
    if (prog.percent < 100) {
      return { courseId: course.id, lessonTitle: prog.lastLessonTitle || "Starten" };
    }
  }

  return null;
}

/** Wechsle zum angegebenen Kurs und lade dessen Daten */
function switchToCourse(courseId: string): void {
  const course = platformConfig.courses.find(co => co.id === courseId);
  if (!course) return;

  // Aktuellen Fortschritt speichern
  saveProgress();

  // Platform-Konfiguration aktualisieren
  platformConfig.activeCourse = courseId;
  platformConfig.lastAccessed[courseId] = new Date().toISOString();
  savePlatformConfig();

  // Pfade aktualisieren
  PROJECT_ROOT = path.join(COURSES_ROOT, course.directory);
  ACTIVE_COURSE_ID = courseId;
  updateDerivedPaths();

  // Lektionen und Fortschritt neu laden
  lessons = discoverLessons();
  loadProgress();

  // Adaptive State laden (wenn vorhanden)
  try {
    adaptiveState = loadAdaptiveState(STATE_DIR);
  } catch {
    adaptiveState = { sectionDepths: {}, conceptScores: {}, hintLevels: {} };
  }

  // Warm-Up-Flag zuruecksetzen (neuer Kurs, neues Warm-Up)
  warmupShownThisSession = false;

  // Progress-Cache invalidieren
  courseProgressCache.clear();
}

// ─── Lektions-Erkennung ────────────────────────────────────────────────────

function discoverLessons(): LessonInfo[] {
  const entries = fs.readdirSync(PROJECT_ROOT, { withFileTypes: true });
  const result: LessonInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^(\d{2})-/);
    if (!match) continue;

    const lessonDir = path.join(PROJECT_ROOT, entry.name);
    const number = match[1];

    // Titel aus README
    let title = entry.name.replace(/^\d{2}-/, "").replace(/-/g, " ");
    const readmePath = path.join(lessonDir, "README.md");
    if (fs.existsSync(readmePath)) {
      const firstLine = fs.readFileSync(readmePath, "utf-8").split("\n")[0];
      const titleMatch = firstLine.match(/^#\s*Lektion\s*\d+:\s*(.+)/);
      if (titleMatch) title = titleMatch[1].trim();
    }

    // Sektionen
    const sectionsDir = path.join(lessonDir, "sections");
    const sections: SectionInfo[] = [];
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
          /^#\s*(?:Sektion\s*\d+:\s*)?(.+)/
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

    // Exercises
    const exercisesDir = path.join(lessonDir, "exercises");
    let exerciseFiles: string[] = [];
    if (fs.existsSync(exercisesDir)) {
      exerciseFiles = fs
        .readdirSync(exercisesDir)
        .filter((f) => f.endsWith(".ts"))
        .sort()
        .map((f) => path.join(exercisesDir, f));
    }

    // Examples
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

// ─── Fortschritts-Berechnung ──────────────────────────────────────────────

function countExerciseProgress(lesson: LessonInfo): {
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

function getDueReviewCount(): number {
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

function getReviewStreak(): number {
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

function getLessonProgress(lessonIndex: number): number {
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

function getOverallProgress(): number {
  if (lessons.length === 0) return 0;
  let totalPct = 0;
  for (let i = 0; i < lessons.length; i++) {
    totalPct += getLessonProgress(i);
  }
  return Math.round(totalPct / lessons.length);
}

function getNextStep(): string {
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    for (let s = 0; s < lesson.sections.length; s++) {
      const key = getSectionKey(i, s);
      if (getSectionStatus(key) !== "completed") {
        return `Lektion ${lesson.number}, Sektion ${s + 1} lesen`;
      }
    }
    const ex = countExerciseProgress(lesson);
    if (ex.solved < ex.total) {
      return `Lektion ${lesson.number} Exercises loesen`;
    }
  }
  return "Alles erledigt — Glueckwunsch!";
}

// ─── Mastery-Levels (Feature 6) ───────────────────────────────────────────

function calculateMastery(lessonIndex: number): MasteryLevel {
  const lesson = lessons[lessonIndex];
  if (!lesson) return "newcomer";

  // Sektionen gelesen in %
  let sectionsRead = 0;
  for (let s = 0; s < lesson.sections.length; s++) {
    const key = getSectionKey(lessonIndex, s);
    if (getSectionStatus(key) === "completed") sectionsRead++;
  }
  const sectionsComplete =
    lesson.sections.length > 0
      ? Math.round((sectionsRead / lesson.sections.length) * 100)
      : 0;

  // Exercises geloest in %
  const ex = countExerciseProgress(lesson);
  const exercisesComplete =
    ex.total > 0 ? Math.round((ex.solved / ex.total) * 100) : 100;

  // Bestes Quiz-Ergebnis
  const quizData = progress.quizzes[lesson.number];
  const quizScore = quizData
    ? Math.round((quizData.score / quizData.total) * 100)
    : 0;

  if (sectionsComplete < 50) return "newcomer";
  if (exercisesComplete < 50) return "familiar";
  if (quizScore < 80 || exercisesComplete < 100) return "proficient";
  return "expert";
}

function masteryBar(level: MasteryLevel): string {
  const levels: Record<MasteryLevel, { filled: number; color: string; label: string }> = {
    newcomer:   { filled: 2, color: c.dim,    label: "Newcomer" },
    familiar:   { filled: 4, color: c.yellow, label: "Familiar" },
    proficient: { filled: 7, color: c.cyan,   label: "Proficient" },
    expert:     { filled: 10, color: c.green,  label: "Expert" },
  };
  const info = levels[level];
  const bar = `${info.color}${"█".repeat(info.filled)}${c.dim}${"░".repeat(10 - info.filled)}${c.reset}`;
  return `${bar}  ${info.color}${info.label}${c.reset}`;
}

/**
 * Berechnet die Lernaktivitaet der letzten N Tage.
 */
function getRecentActivityValues(days: number): number[] {
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

/** Lade Misconceptions fuer eine Lektion (graceful fallback mit Fehlermeldung) */
function loadMisconceptions(lessonIndex: number): Misconception[] {
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
    // Resolve template literals / string concat
    let prev = "";
    while (prev !== arrayStr) {
      prev = arrayStr;
      arrayStr = arrayStr.replace(/"([^"]*)"\s*\+\s*"([^"]*)"/g, '"$1$2"');
    }
    // Handle backtick template strings - convert to JSON strings
    arrayStr = arrayStr.replace(/`([^`]*)`/g, (_match, inner: string) => {
      const escaped = inner.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
      return `"${escaped}"`;
    });
    arrayStr = arrayStr.replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":');
    const parsed = JSON.parse(arrayStr) as Misconception[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[TUI] Fehler beim Laden der Misconceptions fuer Lektion ${lesson.number}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

/** Lade Completion Problems fuer eine Lektion (graceful fallback mit Fehlermeldung) */
function loadCompletionProblems(lessonIndex: number): CompletionProblem[] {
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
    arrayStr = arrayStr.replace(/`([^`]*)`/g, (_match, inner: string) => {
      const escaped = inner.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
      return `"${escaped}"`;
    });
    arrayStr = arrayStr.replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":');
    const parsed = JSON.parse(arrayStr) as CompletionProblem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[TUI] Fehler beim Laden der Completion-Problems fuer Lektion ${lesson.number}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

/** Pruefe ob eine Lektion genuegend abgeschlossene Sektionen hat */
function getCompletedLessonIndices(): number[] {
  const completed: number[] = [];
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    let sectDone = 0;
    for (let s = 0; s < lesson.sections.length; s++) {
      const key = getSectionKey(i, s);
      if (getSectionStatus(key) === "completed") sectDone++;
    }
    // Lektion gilt als abgeschlossen wenn >= 50% Sektionen gelesen
    if (lesson.sections.length > 0 && sectDone >= lesson.sections.length * 0.5) {
      completed.push(i);
    }
  }
  return completed;
}

/** Pruefe ob Pre-Test fuer diese Sektion schon gemacht wurde */
function hasTakenPretest(lessonIndex: number, sectionIndex: number): boolean {
  return pretestsTaken.has(`${lessonIndex}-${sectionIndex}`);
}

/** Markiere Pre-Test als gemacht */
function markPretestTaken(lessonIndex: number, sectionIndex: number): void {
  pretestsTaken.add(`${lessonIndex}-${sectionIndex}`);
}

// ─── Terminal-Groesse ──────────────────────────────────────────────────────

function updateTermSize(): void {
  W = process.stdout.columns || 80;
  H = process.stdout.rows || 24;
}

// ─── Layout-Hilfsfunktionen ────────────────────────────────────────────────

/** ANSI-freie Laenge */
function visLen(str: string): number {
  return stripAnsi(str).length;
}

/** Text auf sichtbare Laenge kuerzen (ANSI-aware) */
function truncate(str: string, maxLen: number): string {
  const stripped = stripAnsi(str);
  if (stripped.length <= maxLen) return str;
  // Strip ANSI codes, truncate visible content, add ellipsis
  return stripped.slice(0, maxLen - 1) + "\u2026";
}

/** Rechts-Padding mit sichtbarer Laengenmessung */
function padR(str: string, width: number): string {
  const vis = visLen(str);
  const pad = Math.max(0, width - vis);
  return str + " ".repeat(pad);
}

/** Zentriert einen String */
function center(str: string, width: number): string {
  const vis = visLen(str);
  const totalPad = Math.max(0, width - vis);
  const leftPad = Math.floor(totalPad / 2);
  const rightPad = totalPad - leftPad;
  return " ".repeat(leftPad) + str + " ".repeat(rightPad);
}

/** Fortschrittsbalken */
function progressBar(
  done: number,
  total: number,
  barWidth: number = 16
): string {
  if (total === 0) return `${c.dim}${"░".repeat(barWidth)}${c.reset}`;
  const pct = Math.min(1, done / total);
  const filled = Math.round(pct * barWidth);
  const empty = barWidth - filled;
  const color = pct >= 1 ? c.green : pct > 0 ? c.yellow : c.dim;
  return `${color}${"█".repeat(filled)}${c.dim}${"░".repeat(empty)}${c.reset}`;
}

/** Prozent-String */
function pctStr(pct: number): string {
  const color = pct >= 100 ? c.green : pct > 0 ? c.yellow : c.dim;
  return `${color}${String(pct).padStart(3)}%${c.reset}`;
}

// ─── Box-Drawing ───────────────────────────────────────────────────────────

function boxHLine(width: number, left: string, fill: string, right: string): string {
  return `${c.dim}${left}${fill.repeat(Math.max(0, width - 2))}${right}${c.reset}`;
}

function boxTop(width: number): string {
  return boxHLine(width, "┌", "─", "┐");
}

function boxBottom(width: number): string {
  return boxHLine(width, "└", "─", "┘");
}

function boxSep(width: number): string {
  return boxHLine(width, "├", "─", "┤");
}


/** Erstelle eine Box-Zeile: │ content ... │ */
function bLine(content: string, width: number): string {
  const innerWidth = width - 2;
  const vis = visLen(content);
  const pad = Math.max(0, innerWidth - vis);
  return `${c.dim}│${c.reset}${content}${" ".repeat(pad)}${c.dim}│${c.reset}`;
}

/** Erstelle eine leere Box-Zeile */
function bEmpty(width: number): string {
  return `${c.dim}│${c.reset}${" ".repeat(width - 2)}${c.dim}│${c.reset}`;
}

// ─── Scrollbar-Rendering ──────────────────────────────────────────────────

/**
 * Berechnet die Scrollbar-Positionen fuer die rechte Spalte.
 * Gibt ein Array zurueck das fuer jede sichtbare Zeile "track" oder "thumb" hat.
 */
function computeScrollbar(
  scrollOffset: number,
  totalLines: number,
  viewportHeight: number
): ("track" | "thumb")[] {
  const result: ("track" | "thumb")[] = [];
  if (totalLines <= viewportHeight) {
    // Alles sichtbar, kein Scrollbalken noetig
    for (let i = 0; i < viewportHeight; i++) result.push("track");
    return result;
  }

  const thumbSize = Math.max(1, Math.round((viewportHeight / totalLines) * viewportHeight));
  const maxOffset = totalLines - viewportHeight;
  const scrollFraction = maxOffset > 0 ? scrollOffset / maxOffset : 0;
  const thumbStart = Math.round(scrollFraction * (viewportHeight - thumbSize));

  for (let i = 0; i < viewportHeight; i++) {
    if (i >= thumbStart && i < thumbStart + thumbSize) {
      result.push("thumb");
    } else {
      result.push("track");
    }
  }
  return result;
}

/** Rendert ein Scrollbar-Zeichen */
function scrollbarChar(type: "track" | "thumb"): string {
  return type === "thumb" ? `${c.white}█${c.reset}` : `${c.dim}│${c.reset}`;
}

// ─── Render-Pipeline ───────────────────────────────────────────────────────

/**
 * Rendert den gesamten Screen in einem einzigen write-Aufruf
 * fuer flicker-free Darstellung.
 */
function flushScreen(lines: string[]): void {
  const buffer: string[] = [];
  buffer.push(CURSOR_HOME);

  for (let i = 0; i < H; i++) {
    if (i < lines.length) {
      buffer.push(lines[i] + "\x1b[K");
    } else {
      buffer.push("\x1b[K");
    }
    if (i < H - 1) {
      buffer.push("\n");
    }
  }

  process.stdout.write(buffer.join(""));
}

// ─── Header & Footer ──────────────────────────────────────────────────────

function renderHeader(leftText: string, rightText: string): string {
  const totalInner = W - 2;
  const leftVis = visLen(leftText);
  const rightVis = visLen(rightText);
  const middlePad = Math.max(1, totalInner - leftVis - rightVis);
  const inner = `${leftText}${" ".repeat(middlePad)}${rightText}`;
  return `${c.bgGray}${c.white}${c.bold} ${padR(inner, W - 2)}${c.reset}`;
}

function renderFooter(shortcuts: string[]): string[] {
  const line1 = boxSep(W);
  const shortcutText = " " + shortcuts.join("  ");
  const line2 = bLine(shortcutText, W);
  const line3 = boxBottom(W);
  return [line1, line2, line3];
}

// ─── Platform-Screen (Kursauswahl) ─────────────────────────────────────────

// ── Layout-Typen und Hilfsfunktionen fuer responsives Bento-Grid ──

type LayoutMode = "grid-2x2" | "column-1" | "ultra-compact";

function getLayoutMode(): LayoutMode {
  const w = process.stdout.columns || 80;
  if (w >= 100) return "grid-2x2";
  if (w >= 80) return "column-1";
  return "ultra-compact";
}

/** Kursfarbe aus Config-String aufloesen */
const courseColorMap: Record<string, string> = {
  blue: c.blue,
  red: c.red,
  cyan: c.cyan,
  white: c.white,
  yellow: c.yellow,
  green: c.green,
  magenta: c.magenta,
};

function getCourseColor(course: PlatformCourse): string {
  return courseColorMap[course.color] ?? c.white;
}

/** Grid-Position aus flachem Index (fuer 2x2 Grid) */
function gridPosition(index: number): { row: number; col: number } {
  return { row: Math.floor(index / 2), col: index % 2 };
}

/**
 * Zwei String-Arrays (Boxen) nebeneinander zusammensetzen.
 * ANSI-aware: nutzt visLen fuer korrekte Breitenberechnung.
 */
/**
 * Erzeuge einen String mit exakt `width` sichtbaren Zeichen.
 * ANSI-Codes werden ENTFERNT — nur Plain-Text + Padding.
 * Das ist der einzig zuverlaessige Weg fuer Spaltenausrichtung.
 */
function plainCell(text: string, width: number): string {
  const plain = stripAnsi(text);
  if (plain.length >= width) return plain.slice(0, width);
  return plain + " ".repeat(width - plain.length);
}

/**
 * Wie plainCell, aber behaelt Farben bei (fuer einfache Faelle).
 * Fuegt Padding am Ende hinzu basierend auf sichtbarer Laenge.
 */
function colorCell(text: string, width: number): string {
  const vis = stripAnsi(text).length;
  if (vis >= width) {
    // Fallback: strip and truncate
    return stripAnsi(text).slice(0, width);
  }
  return text + " ".repeat(width - vis) + c.reset;
}

/**
 * Rendere eine einzelne Kurs-Box als String-Array.
 * Je nach LayoutMode werden unterschiedlich viele Details angezeigt.
 */
function renderCourseBox(
  course: PlatformCourse,
  prog: CourseProgressSummary,
  isSelected: boolean,
  boxWidth: number,
  mode: LayoutMode
): string[] {
  const lines: string[] = [];
  const unlocked = isCourseUnlocked(course);
  const courseColor = getCourseColor(course);
  const borderColor = isSelected ? courseColor : c.dim;
  const textDim = isSelected ? "" : c.dim;
  const textReset = isSelected ? c.reset : c.reset;
  const innerW = boxWidth - 2; // abzgl. Raender links/rechts

  // ── Ultra-Kompakt: 2 Zeilen pro Kurs, kein aufwendiger Rahmen ──
  if (mode === "ultra-compact") {
    const barW = Math.max(4, Math.min(8, boxWidth - 30));
    const bar = fineProgressBar(prog.percent, barW);
    const lockStr = unlocked ? "" : " \uD83D\uDD12";
    const titleStr = truncate(course.name, boxWidth - visLen(course.icon) - barW - 16);
    const topLine = `${borderColor}\u250C${c.reset} ${courseColor}${c.bold}${course.icon}${c.reset}  ${textDim}${titleStr}${textReset}`;
    const topRight = `${bar} ${pctStr(prog.percent)}${lockStr} ${borderColor}\u2510${c.reset}`;
    const topVisLen = visLen(topLine) + visLen(topRight);
    const topGap = Math.max(1, boxWidth - topVisLen);
    lines.push(topLine + " ".repeat(topGap) + topRight);

    // Zweite Zeile: Kompakte Info
    let info = "";
    if (course.status === "active" && unlocked) {
      const nextInfo = prog.lastLessonTitle
        ? `L${String(prog.completedLessons + 1).padStart(2, "0")} ${truncate(prog.lastLessonTitle, boxWidth - 30)}`
        : "Bereit";
      info = `${prog.completedLessons}/${prog.totalLessons} \u00B7 ~${course.estimatedHours ?? "?"}h \u00B7 ${nextInfo}`;
    } else if (!unlocked) {
      info = `${prog.completedLessons}/${prog.totalLessons} \u00B7 ~${course.estimatedHours ?? "?"}h \u00B7 \uD83D\uDD12 ${course.prerequisiteDescription ?? ""}`;
    } else {
      info = `${prog.completedLessons}/${prog.totalLessons} \u00B7 ~${course.estimatedHours ?? "?"}h \u00B7 Geplant`;
    }
    const infoTrunc = truncate(info, boxWidth - 4);
    lines.push(`${borderColor}\u2502${c.reset} ${textDim}${infoTrunc}${textReset}${" ".repeat(Math.max(0, boxWidth - 3 - visLen(infoTrunc)))}${borderColor}\u2502${c.reset}`);
    lines.push(`${borderColor}\u2514${"─".repeat(Math.max(0, boxWidth - 2))}\u2518${c.reset}`);
    return lines;
  }

  // ── Box-Kopfzeile (fuer column-1 und grid-2x2) ──
  const iconLabel = `${courseColor}${c.bold}${course.icon}${c.reset}`;
  const titleLabel = `${isSelected ? c.bold : textDim}${course.name}${c.reset}`;
  const lockSuffix = unlocked ? "" : ` \uD83D\uDD12 `;
  const labelVisWidth = 2 + visLen(course.icon) + 3 + visLen(course.name) + 1;
  const lockVisWidth = unlocked ? 0 : visLen(lockSuffix) + 4;
  const dashFill = Math.max(0, innerW - labelVisWidth - lockVisWidth);

  if (unlocked) {
    lines.push(
      `${borderColor}\u250C\u2500 ${iconLabel} ${borderColor}\u2500 ${titleLabel} ${borderColor}${"─".repeat(dashFill)}\u2510${c.reset}`
    );
  } else {
    lines.push(
      `${borderColor}\u250C\u2500 ${iconLabel} ${borderColor}\u2500 ${titleLabel} ${borderColor}${"─".repeat(dashFill)}\u2500\u2500${c.yellow}${lockSuffix}${borderColor}\u2500\u2500\u2510${c.reset}`
    );
  }

  const bxL = `${borderColor}\u2502${c.reset}`;
  const bxR = bxL;
  const bxInner = innerW;

  // ── Column-1 / Schmal: Kompakte Box (2-3 Zeilen Inhalt) ──
  if (mode === "column-1") {
    // Zeile 1: Status + Fortschrittsbalken
    const statusLabel = !unlocked
      ? `${c.yellow}Gesperrt${c.reset}`
      : course.status === "active"
        ? `${c.green}${c.bold}Aktiv${c.reset}`
        : `${c.dim}Geplant${c.reset}`;
    const phaseStr = course.status === "active" && unlocked ? ` \u00B7 Phase ${prog.currentPhase}` : "";
    const lessonsStr = ` \u00B7 ${prog.completedLessons}/${prog.totalLessons}`;
    const barW = Math.max(6, Math.min(14, bxInner - 45));
    const bar = fineProgressBar(prog.percent, barW);
    const line1Left = `${textDim}${statusLabel}${textDim}${phaseStr}${lessonsStr}${textReset}`;
    const line1Right = `${bar} ${pctStr(prog.percent)}`;
    const line1Gap = Math.max(2, bxInner - 2 - visLen(line1Left) - visLen(line1Right));
    lines.push(`${bxL} ${line1Left}${" ".repeat(line1Gap)}${line1Right} ${bxR}`);

    // Zeile 2: Details
    let detailStr = "";
    if (course.status === "active" && unlocked && prog.lastLessonTitle) {
      const nextNum = String(prog.completedLessons + 1).padStart(2, "0");
      detailStr = `~${course.estimatedHours ?? "?"}h \u00B7 ${course.totalSections ?? "?"} Sektionen \u00B7 Naechste: L${nextNum} ${prog.lastLessonTitle}`;
    } else if (!unlocked) {
      detailStr = `~${course.estimatedHours ?? "?"}h \u00B7 Voraussetzung: ${course.prerequisiteDescription ?? "Keine"}`;
    } else {
      detailStr = `~${course.estimatedHours ?? "?"}h \u00B7 ${course.totalSections ?? "?"} Sektionen`;
      if (course.status === "active" && prog.lastLessonTitle) {
        const nextNum = String(prog.completedLessons + 1).padStart(2, "0");
        detailStr += ` \u00B7 L${nextNum} ${prog.lastLessonTitle}`;
      }
    }
    lines.push(`${bxL} ${textDim}${padR(truncate(detailStr, bxInner - 2), bxInner - 2)}${textReset} ${bxR}`);

    // Fusszeile
    lines.push(`${borderColor}\u2514${"─".repeat(innerW)}\u2518${c.reset}`);
    return lines;
  }

  // ── Grid-2x2: Kompakte aber informative Box (max 7 Zeilen) ──
  const estHours = course.estimatedHours ?? "?";
  const sections = course.totalSections ?? "?";
  const barWidth = Math.max(8, Math.min(16, bxInner - 35));
  const bar = fineProgressBar(prog.percent, barWidth);
  const topics = course.topics ?? [];

  if (course.status === "active" && unlocked) {
    // Zeile 1: Status + Progress
    const statusStr = `${c.green}${c.bold}Aktiv${c.reset} ${c.dim}\u00B7${c.reset} Phase ${prog.currentPhase} ${c.dim}\u00B7${c.reset} ${prog.completedLessons}/${prog.totalLessons}`;
    const line1Right = `${bar} ${pctStr(prog.percent)}`;
    const line1Gap = Math.max(1, bxInner - 2 - visLen(statusStr) - visLen(line1Right));
    lines.push(`${bxL} ${statusStr}${" ".repeat(line1Gap)}${line1Right} ${bxR}`);
    // Zeile 2: Details
    const exLine = course.exerciseTypes ? ` \u00B7 ${course.exerciseTypes} Uebungstypen` : "";
    lines.push(`${bxL} ${padR(`~${estHours}h \u00B7 ${sections} Sektionen${exLine}`, bxInner - 1)} ${bxR}`);
    // Zeile 3: Voraussetzung
    lines.push(`${bxL} ${padR(`Voraussetzung: ${c.dim}Keine${c.reset}`, bxInner - 1)} ${bxR}`);
    // Zeile 4: Themen
    if (topics.length > 0) {
      lines.push(`${bxL} ${padR(`${c.dim}${truncate(topics.join(", "), bxInner - 3)}${c.reset}`, bxInner - 1)} ${bxR}`);
    }
    // Zeile 5: Nächste Lektion
    if (prog.lastLessonTitle) {
      const nextNum = String(prog.completedLessons + 1).padStart(2, "0");
      const lastAccessed = platformConfig.lastAccessed[course.id];
      const ago = lastAccessed ? ` ${c.dim}\u00B7 ${formatTimeAgo(lastAccessed)}${c.reset}` : "";
      lines.push(`${bxL} ${padR(`${c.cyan}\u25B8 L${nextNum} ${truncate(prog.lastLessonTitle, bxInner - 20)}${c.reset}${ago}`, bxInner - 1)} ${bxR}`);
    } else {
      lines.push(`${bxL} ${padR(`${c.cyan}\u25B8 Bereit zum Starten${c.reset}`, bxInner - 1)} ${bxR}`);
    }
  } else {
    // Gesperrter oder geplanter Kurs
    const statusLabel = !unlocked ? `${c.yellow}Geplant${c.reset}` : `${c.dim}Geplant${c.reset}`;
    const statusStr = `${textDim}${statusLabel} ${c.dim}\u00B7${c.reset} ${prog.completedLessons}/${prog.totalLessons}`;
    const line1Right = `${bar} ${pctStr(prog.percent)}`;
    const line1Gap = Math.max(1, bxInner - 2 - visLen(statusStr) - visLen(line1Right));
    lines.push(`${bxL} ${statusStr}${" ".repeat(line1Gap)}${line1Right} ${bxR}`);
    // Details
    lines.push(`${bxL} ${padR(`~${estHours}h \u00B7 ${sections} Sektionen`, bxInner - 1)} ${bxR}`);
    // Voraussetzung
    const prereqDesc = course.prerequisiteDescription ?? "Keine";
    if (!unlocked) {
      lines.push(`${bxL} ${padR(`${c.yellow}Voraussetzung: ${prereqDesc}${c.reset}`, bxInner - 1)} ${bxR}`);
    } else {
      lines.push(`${bxL} ${padR(`Voraussetzung: ${c.dim}${prereqDesc}${c.reset}`, bxInner - 1)} ${bxR}`);
    }
    // Themen
    if (topics.length > 0) {
      lines.push(`${bxL} ${padR(`${c.dim}${truncate(topics.join(", "), bxInner - 3)}${c.reset}`, bxInner - 1)} ${bxR}`);
    }
  }

  // Fusszeile
  lines.push(`${borderColor}\u2514${"─".repeat(innerW)}\u2518${c.reset}`);
  return lines;
}

/**
 * Rendere die Empfehlungsbox am unteren Rand.
 */
function renderRecommendationBox(boxWidth: number, mode: LayoutMode): string[] {
  const rec = getRecommendedCourse();
  if (!rec) return [];

  const course = platformConfig.courses.find(co => co.id === rec.courseId);
  if (!course) return [];

  const lines: string[] = [];
  const innerW = boxWidth - 2;
  const borderCol = c.dim;

  if (mode === "ultra-compact") {
    const text = truncate(`${course.name} \u2014 ${rec.lessonTitle}`, boxWidth - 14);
    lines.push(`${borderCol}\u250C\u2500 Empfehlung ${"─".repeat(Math.max(0, boxWidth - 15))}\u2510${c.reset}`);
    lines.push(`${borderCol}\u2502${c.reset} ${padR(`${text}  ${c.bold}[Enter]${c.reset}`, innerW)} ${borderCol}\u2502${c.reset}`);
    lines.push(`${borderCol}\u2514${"─".repeat(innerW)}\u2518${c.reset}`);
    return lines;
  }

  // Header
  const headerDash = Math.max(0, innerW - 15);
  lines.push(`${borderCol}\u250C\u2500 ${c.reset}${c.bold}Empfehlung${c.reset} ${borderCol}${"─".repeat(headerDash)}\u2510${c.reset}`);

  // Inhalt
  const recText = `Mache weiter mit ${course.name} \u2014 ${truncate(rec.lessonTitle, innerW - 40)}`;
  const enterHint = `${c.bold}[Enter]${c.reset}`;
  const recVis = visLen(recText);
  const enterVis = visLen(enterHint);
  const recGap = Math.max(2, innerW - 2 - recVis - enterVis);
  lines.push(`${borderCol}\u2502${c.reset} ${recText}${" ".repeat(recGap)}${enterHint} ${borderCol}\u2502${c.reset}`);

  lines.push(`${borderCol}\u2514${"─".repeat(innerW)}\u2518${c.reset}`);
  return lines;
}

function renderPlatformScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "platform" }>;
  const selectedIdx = screen.selectedIndex;
  const mode = getLayoutMode();
  const courses = platformConfig.courses;

  // Header
  const timerStr = formatSessionTime();
  lines.push(renderHeader(` LEARN Platform`, `\u23F1 ${timerStr} `));

  const contentHeight = H - 4; // Header (1) + Footer (3)

  if (mode === "grid-2x2") {
    // ═══ 2x2 TABLE GRID ═══
    // Berechne Zellenbreite: 2 Spalten, Rand links/rechts, Trennlinie
    const margin = 2;
    const totalInner = W - margin * 2 - 3; // 3 = "| " + " |" + "|" Mitte
    const cellW = Math.floor(totalInner / 2);
    const tableW = cellW * 2 + 3; // "|" + cellW + "|" + cellW + "|"
    const indent = " ".repeat(margin);

    // Zelleninhalte generieren (4 Zeilen pro Kurs, kein ANSI fuer Alignment)
    function courseCell(idx: number): string[] {
      const co = courses[idx];
      if (!co) return Array(5).fill("");
      const pr = getCourseProgressSummary(co);
      const unlocked = isCourseUnlocked(co);
      const isSel = idx === selectedIdx;

      // Zeile 1: Icon + Name (mit Marker und Lock)
      const marker = isSel ? "\u25B8" : " ";
      const lockTxt = unlocked ? "" : "  \u2502 LOCKED";
      const line1 = ` ${marker} ${co.icon}  ${co.name}${lockTxt}`;

      // Zeile 2: Leer (Spacing)
      const line2 = "";

      // Zeile 3: Status + kompakter Fortschrittsbalken
      const isActive = co.status === "active" && unlocked;
      const barW = 12;
      const filled = Math.round(barW * pr.percent / 100);
      const barStr = "\u2588".repeat(filled) + "\u2500".repeat(barW - filled);
      const statusTxt = isActive
        ? `   Phase ${pr.currentPhase} \u00B7 ${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons} Lektionen`
        : `   ${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons} Lektionen`;
      const line3 = `   [${barStr}] ${String(pr.percent).padStart(3)}%${statusTxt}`;

      // Zeile 4: Details
      const hours = co.estimatedHours ?? "?";
      const sects = co.totalSections ?? "?";
      let detail = "";
      if (!unlocked) {
        detail = `   ~${hours}h \u00B7 ${sects} Sektionen \u00B7 Braucht: ${co.prerequisiteDescription ?? ""}`;
      } else {
        const exStr = co.exerciseTypes ? ` \u00B7 ${co.exerciseTypes} Aufgabentypen` : "";
        detail = `   ~${hours}h \u00B7 ${sects} Sektionen${exStr}`;
      }
      const line4 = detail;

      // Zeile 5: Naechste Lektion oder Themen
      let line5 = "";
      if (isActive && pr.lastLessonTitle) {
        const nextNum = String(pr.completedLessons + 1).padStart(2, "0");
        line5 = `   \u25B8 Naechste: L${nextNum} ${pr.lastLessonTitle}`;
      } else {
        const topics = (co.topics ?? []).slice(0, 5);
        if (topics.length > 0) {
          line5 = `   ${topics.join(", ")}`;
        }
      }

      return [line1, line2, line3, line4, line5];
    }

    const ROWS_PER_CELL = 5;

    // Zeichne die Tabelle
    const hLine = "\u2500".repeat(cellW);
    lines.push(`${indent}\u250C${hLine}\u252C${hLine}\u2510`);

    const rowCount = Math.ceil(courses.length / 2);
    for (let row = 0; row < rowCount; row++) {
      const leftCell = courseCell(row * 2);
      const rightCell = courseCell(row * 2 + 1);

      const leftSel = row * 2 === selectedIdx;
      const rightSel = row * 2 + 1 === selectedIdx;
      const leftColor = leftSel ? getCourseColor(courses[row * 2]) : "";
      const rightColor = rightSel && courses[row * 2 + 1] ? getCourseColor(courses[row * 2 + 1]) : "";

      for (let ln = 0; ln < ROWS_PER_CELL; ln++) {
        const lText = plainCell(leftCell[ln] ?? "", cellW);
        const rText = plainCell(rightCell[ln] ?? "", cellW);
        // Ausgewaehlte Zelle: Kursfarbe + Bold fuer Titel, sonst normal
        // Nicht-ausgewaehlte Zelle: normaler Text (NICHT dim — lesbar!)
        let lStyle = "";
        let rStyle = "";
        if (leftSel && ln === 0) lStyle = `${leftColor}${c.bold}`;
        else if (leftSel) lStyle = leftColor;
        if (rightSel && ln === 0) rStyle = `${rightColor}${c.bold}`;
        else if (rightSel) rStyle = rightColor;

        const lFinal = lStyle ? `${lStyle}${lText}${c.reset}` : lText;
        const rFinal = rStyle ? `${rStyle}${rText}${c.reset}` : rText;
        lines.push(`${indent}${c.dim}\u2502${c.reset}${lFinal}${c.dim}\u2502${c.reset}${rFinal}${c.dim}\u2502${c.reset}`);
      }

      // Trennlinie zwischen Reihen
      if (row < rowCount - 1) {
        lines.push(`${indent}${c.dim}\u251C${hLine}\u253C${hLine}\u2524${c.reset}`);
      }
    }

    lines.push(`${indent}${c.dim}\u2514${hLine}\u2534${hLine}\u2518${c.reset}`);

  } else {
    // ═══ 1-Spalte oder Ultra-Kompakt ═══
    const margin = mode === "ultra-compact" ? 1 : 2;
    const cellW = W - margin * 2 - 2; // "| content |"
    const indent = " ".repeat(margin);
    const hLine = "\u2500".repeat(cellW);

    lines.push(`${indent}${c.dim}\u250C${hLine}\u2510${c.reset}`);

    for (let i = 0; i < courses.length; i++) {
      const co = courses[i];
      const pr = getCourseProgressSummary(co);
      const unlocked = isCourseUnlocked(co);
      const isSel = i === selectedIdx;
      const selColor = isSel ? getCourseColor(co) : "";
      const marker = isSel ? "\u25B8" : " ";
      const lockTxt = unlocked ? "" : "  LOCKED";
      const isActive = co.status === "active" && unlocked;

      const name = ` ${marker} ${co.icon}  ${co.name}${lockTxt}`;
      const barW = 12;
      const filled = Math.round(barW * pr.percent / 100);
      const barStr = "\u2588".repeat(filled) + "\u2500".repeat(barW - filled);
      const statusTxt = isActive
        ? `Phase ${pr.currentPhase} \u00B7 ${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons}`
        : `${pr.completedLessons}/${co.totalLessons ?? pr.totalLessons} Lektionen`;
      const info = `   [${barStr}] ${String(pr.percent).padStart(3)}%  ${statusTxt}`;
      const hours = co.estimatedHours ?? "?";
      const prereq = !unlocked ? `Braucht: ${co.prerequisiteDescription ?? ""}` : "";
      const detail = prereq
        ? `   ~${hours}h \u00B7 ${prereq}`
        : `   ~${hours}h \u00B7 ${co.totalSections ?? "?"} Sektionen`;

      const cellLines = mode === "ultra-compact" ? [name, info] : [name, info, detail];

      for (const cl of cellLines) {
        const txt = plainCell(cl, cellW);
        const styled = selColor ? `${selColor}${txt}${c.reset}` : txt;
        lines.push(`${indent}${c.dim}\u2502${c.reset}${styled}${c.dim}\u2502${c.reset}`);
      }

      if (i < courses.length - 1) {
        lines.push(`${indent}${c.dim}\u251C${hLine}\u2524${c.reset}`);
      }
    }

    lines.push(`${indent}${c.dim}\u2514${hLine}\u2518${c.reset}`);
  }

  // ── Empfehlung ──
  const rec = getRecommendedCourse();
  if (rec) {
    const recCourse = platformConfig.courses.find(co => co.id === rec.courseId);
    if (recCourse) {
      lines.push("");
      const recText = ` Empfehlung: ${recCourse.name} -- ${rec.lessonTitle}  [Enter]`;
      const recW = W - 6;
      lines.push(`  ${c.dim}\u250C${"─".repeat(recW)}\u2510${c.reset}`);
      lines.push(`  ${c.dim}\u2502${c.reset} ${plainCell(recText, recW - 2)} ${c.dim}\u2502${c.reset}`);
      lines.push(`  ${c.dim}\u2514${"─".repeat(recW)}\u2518${c.reset}`);
    }
  }

  // ── Bestaetigungs-Dialog ──
  if (screen.confirmUnlock) {
    const course = courses[selectedIdx];
    if (course) {
      const prereqName = course.prerequisiteDescription ?? "";
      lines.push("");
      const dW = Math.min(W - 8, 60);
      const dIndent = " ".repeat(Math.max(1, Math.floor((W - dW) / 2)));
      lines.push(`${dIndent}${c.yellow}\u250C${"─".repeat(dW - 2)}\u2510${c.reset}`);
      lines.push(`${dIndent}${c.yellow}\u2502${c.reset} ${plainCell(`Voraussetzung: ${prereqName}`, dW - 4)} ${c.yellow}\u2502${c.reset}`);
      lines.push(`${dIndent}${c.yellow}\u2502${c.reset} ${plainCell("Trotzdem oeffnen? [J] Ja  [N] Nein", dW - 4)} ${c.yellow}\u2502${c.reset}`);
      lines.push(`${dIndent}${c.yellow}\u2514${"─".repeat(dW - 2)}\u2518${c.reset}`);
    }
  }

  // ── Restliche Zeilen auffuellen ──
  while (lines.length < H - 3) {
    lines.push("");
  }

  // Footer
  const navHint = mode === "grid-2x2"
    ? `${c.bold}[\u2191\u2193\u2190\u2192]${c.reset} Kurs waehlen`
    : `${c.bold}[\u2191\u2193]${c.reset} Kurs waehlen`;
  lines.push(...renderFooter([
    navHint,
    `${c.bold}[Enter]${c.reset} Oeffnen`,
    `${c.bold}[?]${c.reset} Hilfe`,
    `${c.bold}[Q]${c.reset} Beenden`,
  ]));

  platformContentTotalLines = lines.length;
  flushScreen(lines);
}

/** Berechne einen relativen Zeitstring (z.B. "vor 2 Stunden") */
function formatTimeAgo(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 0) return "gerade eben";

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "gerade eben";
    if (minutes < 60) return `vor ${minutes} Minute${minutes === 1 ? "" : "n"}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours} Stunde${hours === 1 ? "" : "n"}`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `vor ${days} Tag${days === 1 ? "" : "en"}`;

    const weeks = Math.floor(days / 7);
    return `vor ${weeks} Woche${weeks === 1 ? "" : "n"}`;
  } catch {
    return "";
  }
}

/** Gesamte Zeilen des Platform-Screen-Inhalts (fuer Scrolling) */
let platformContentTotalLines = 0;

// ─── Course-Info Screen (Kurs ohne Lektionen) ──────────────────────────────

function renderCourseInfoScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "courseinfo" }>;
  const course = platformConfig.courses.find(co => co.id === screen.courseId);
  if (!course) return;

  const timerStr = formatSessionTime();
  lines.push(
    renderHeader(
      ` ${course.name}`,
      `\u23F1 ${timerStr} `
    )
  );

  lines.push(boxTop(W));

  // Pruefen ob Curriculum im Reader angezeigt wird
  if (courseInfoRenderedLines.length > 0 && screen.totalLines > 0) {
    // Markdown-Reader Modus
    const contentHeight = getContentHeight();
    const scrollbar = computeScrollbar(screen.scrollOffset, screen.totalLines, contentHeight);

    for (let row = 0; row < contentHeight; row++) {
      const lineIdx = screen.scrollOffset + row;
      const content = lineIdx < courseInfoRenderedLines.length ? courseInfoRenderedLines[lineIdx] : "";
      const sbChar = row < scrollbar.length && scrollbar[row] === "thumb"
        ? `${c.cyan}\u2588${c.reset}`
        : `${c.dim}\u2502${c.reset}`;
      // Innerer Inhalt: 1 Padding links, scrollbar rechts
      const innerW = W - 4; // 2 box borders + 1 scrollbar + 1 padding
      lines.push(`${c.dim}\u2502${c.reset} ${padR(content, innerW)} ${sbChar}`);
    }
  } else {
    // Info-Box Modus (keine Lektionen vorhanden)
    const boxW = Math.min(W - 4, 65);
    const innerW = boxW - 4;
    const leftPad = Math.max(0, Math.floor((W - boxW - 2) / 2));
    const padStr = " ".repeat(leftPad);

    lines.push(bEmpty(W));
    lines.push(bEmpty(W));
    lines.push(bLine(`${padStr}${c.dim}\u250C\u2500 ${course.name} ${"─".repeat(Math.max(0, innerW - visLen(course.name) - 2))}\u2510${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR("Dieser Kurs ist noch in Planung.", innerW)}${c.dim}\u2502${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`Geplante Lektionen: ${c.bold}${course.totalLessons}${c.reset}`, innerW)}${c.dim}\u2502${c.reset}`, W));

    // Phasen berechnen (je 10 Lektionen = 1 Phase, gerundet)
    const phases = Math.max(1, Math.ceil(course.totalLessons / 10));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`Geplante Phasen: ${c.bold}${phases}${c.reset}`, innerW)}${c.dim}\u2502${c.reset}`, W));

    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR("Die Lektionen werden bald verfuegbar sein.", innerW)}${c.dim}\u2502${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR("In der Zwischenzeit: Arbeite am TypeScript-Kurs weiter!", innerW)}${c.dim}\u2502${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, W));

    // Pruefen ob CURRICULUM.md existiert
    const curriculumPath = path.join(COURSES_ROOT, course.directory, "CURRICULUM.md");
    if (fs.existsSync(curriculumPath)) {
      lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`${c.bold}[C]${c.reset} Curriculum anzeigen`, innerW)}${c.dim}\u2502${c.reset}`, W));
    }
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}  ${padR(`${c.bold}[\u2190]${c.reset} Zurueck zur Kursauswahl`, innerW)}${c.dim}\u2502${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2502${c.reset}${" ".repeat(innerW + 2)}${c.dim}\u2502${c.reset}`, W));
    lines.push(bLine(`${padStr}${c.dim}\u2514${"─".repeat(innerW + 2)}\u2518${c.reset}`, W));
  }

  // Auffuellen bis Footer
  const footerStart = H - 3;
  while (lines.length < footerStart) {
    lines.push(bEmpty(W));
  }
  while (lines.length > footerStart) {
    lines.pop();
  }

  // Footer
  const footerItems: string[] = courseInfoRenderedLines.length > 0
    ? [
        `${c.bold}[\u2191\u2193]${c.reset} Scrollen`,
        `${c.bold}[Esc]${c.reset} Zurueck`,
      ]
    : [
        `${c.bold}[C]${c.reset} Curriculum`,
        `${c.bold}[\u2190/Esc]${c.reset} Zurueck`,
      ];

  lines.push(...renderFooter(footerItems));
  flushScreen(lines);
}

// ─── Hauptmenue ────────────────────────────────────────────────────────────

function hasResumeTarget(): boolean {
  // Pruefe ob wir eine gueltige letzte Position haben
  if (progress.lastScreen === "section" || progress.lastScreen === "lesson") {
    const li = progress.lastLesson;
    if (li >= 0 && li < lessons.length) {
      return true;
    }
  }
  return false;
}

function renderMainMenu(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as { type: "main"; selectedIndex: number };
  const selectedIdx = screen.selectedIndex;

  // Gesamtfortschritt
  const overallPct = getOverallProgress();

  // Header mit Breadcrumb und Timer
  const timerStr = formatSessionTime();
  const headerBarWidth = Math.max(8, Math.floor(W * 0.20));
  const headerBar = fineProgressBar(overallPct, headerBarWidth);
  lines.push(
    renderHeader(
      ` ${getBreadcrumb(currentScreen)}`,
      `${headerBar} ${pctStr(overallPct)} \u23F1 ${timerStr} `
    )
  );

  // Haupt-Box oben
  lines.push(boxTop(W));

  // Resume-Banner (Feature 2)
  const showResume = hasResumeTarget();
  if (showResume) {
    const li = progress.lastLesson;
    const si = progress.lastSection;
    const lesson = lessons[li];
    const sectionTitle =
      lesson && lesson.sections[si]
        ? lesson.sections[si].title
        : "";
    const resumeInnerW = W - 6;
    const resumeSelected = selectedIdx === -1;
    const resumeMarker = resumeSelected
      ? `${c.cyan}${c.bold}\u25B8${c.reset} `
      : "  ";
    lines.push(
      bLine(
        ` ${c.dim}┌─ Weitermachen ${"─".repeat(Math.max(0, resumeInnerW - 16))}┐${c.reset}`,
        W
      )
    );
    const resumeText = `${resumeMarker}${c.bold}\u25B6 Lektion ${lesson?.number ?? "?"}: ${truncate(sectionTitle, Math.max(10, resumeInnerW - 40))}, Sektion ${si + 1}${c.reset}     ${c.dim}[Enter]${c.reset}`;
    lines.push(
      bLine(
        ` ${c.dim}│${c.reset} ${padR(resumeText, resumeInnerW - 2)}${c.dim}│${c.reset}`,
        W
      )
    );
    lines.push(
      bLine(
        ` ${c.dim}└${"─".repeat(resumeInnerW)}┘${c.reset}`,
        W
      )
    );
  }

  lines.push(bEmpty(W));

  // Zwei-Spalten-Layout berechnen
  const totalInner = W - 2;
  const leftColW = Math.max(28, Math.floor(totalInner * 0.54));
  const rightColW = Math.max(22, totalInner - leftColW - 1);

  const leftLines: string[] = [];
  const rightLines: string[] = [];

  // ── Linke Spalte: Lektionen mit Mastery ──
  leftLines.push(padR(`${c.bold}${c.cyan} Lektionen${c.reset}`, leftColW));
  leftLines.push(`${c.dim} ${"─".repeat(leftColW - 1)}${c.reset}`);

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const isSelected = i === selectedIdx;
    const mastery = calculateMastery(i);

    const marker = isSelected ? `${c.cyan}${c.bold} \u25B8${c.reset}` : "  ";
    const num = `${isSelected ? c.bold : ""}${i + 1}${c.reset}`;
    // Mastery bar takes ~22 chars visible, we shrink title accordingly
    const masteryStr = masteryBar(mastery);
    const titleMaxLen = Math.max(5, leftColW - 28);
    const displayTitle = truncate(lesson.title, titleMaxLen);
    const line = `${marker} ${num}  ${padR(displayTitle, titleMaxLen)} ${masteryStr}`;
    leftLines.push(padR(line, leftColW));
  }

  // Leerzeilen auffuellen
  const minLeftLines = Math.max(leftLines.length, 10);
  while (leftLines.length < minLeftLines) {
    leftLines.push(" ".repeat(leftColW));
  }

  // ── Rechte Spalte: Fortschritt ──
  rightLines.push(
    `${c.bold}${c.cyan} Dein Fortschritt${c.reset}`
  );
  rightLines.push(
    `${c.dim} ${"─".repeat(rightColW - 1)}${c.reset}`
  );

  let totalSections = 0;
  let doneSections = 0;
  let totalExercises = 0;
  let doneExercises = 0;
  let quizzesPassed = 0;
  let totalQuizzes = 0;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    totalSections += lesson.sections.length;
    for (let s = 0; s < lesson.sections.length; s++) {
      const key = getSectionKey(i, s);
      if (getSectionStatus(key) === "completed") doneSections++;
    }
    const ex = countExerciseProgress(lesson);
    totalExercises += ex.total;
    doneExercises += ex.solved;
    if (lesson.hasQuiz) {
      totalQuizzes++;
      if (progress.quizzes[lesson.number]) quizzesPassed++;
    }
  }

  const streak = getReviewStreak();

  rightLines.push(
    ` Sektionen gelesen:  ${c.bold}${String(doneSections).padStart(3)}${c.reset}/${totalSections}`
  );
  rightLines.push(
    ` Exercises geloest:  ${c.bold}${String(doneExercises).padStart(3)}${c.reset}/${totalExercises}`
  );
  rightLines.push(
    ` Quiz bestanden:     ${c.bold}${String(quizzesPassed).padStart(3)}${c.reset}/${totalQuizzes}`
  );
  rightLines.push(
    ` Reviews gesamt:   ${c.bold}${String(streak).padStart(3)}${c.reset}`
  );
  rightLines.push("");
  const overallBarWidth = Math.max(10, rightColW - 12);
  const overallBar = fineProgressBar(overallPct, overallBarWidth);
  rightLines.push(` ${overallBar} ${pctStr(overallPct)}`);

  // Lernverlauf der letzten 7 Tage als Sparkline
  const recentActivity = getRecentActivityValues(7);
  if (recentActivity.some((v) => v > 0)) {
    rightLines.push("");
    rightLines.push(` ${c.dim}Lernverlauf (7 Tage):${c.reset}`);
    const spark = colorSparkline(recentActivity);
    rightLines.push(` ${spark}`);
  }

  rightLines.push("");
  rightLines.push(
    `${c.dim} ${"─".repeat(rightColW - 1)}${c.reset}`
  );
  rightLines.push(
    `${c.bold} Naechster Schritt:${c.reset}`
  );
  const nextStep = getNextStep();
  const wrappedStep =
    nextStep.length > rightColW - 2
      ? nextStep.slice(0, rightColW - 5) + "..."
      : nextStep;
  rightLines.push(` ${c.cyan}${wrappedStep}${c.reset}`);

  // Rechte Spalte auffuellen
  while (rightLines.length < minLeftLines) {
    rightLines.push("");
  }

  // Spalten zusammensetzen
  const rowCount = Math.max(leftLines.length, rightLines.length);
  for (let row = 0; row < rowCount; row++) {
    const left = row < leftLines.length ? leftLines[row] : "";
    const right = row < rightLines.length ? rightLines[row] : "";
    const merged = `${padR(left, leftColW)}${c.dim}│${c.reset}${padR(right, rightColW)}`;
    lines.push(bLine(merged, W));
  }

  lines.push(bEmpty(W));

  // Review-Banner
  const dueCount = getDueReviewCount();
  const reviewSelected = selectedIdx === lessons.length;
  const reviewInnerW = W - 6;
  if (dueCount > 0) {
    lines.push(bLine(` ${c.dim}┌${"─".repeat(reviewInnerW)}┐${c.reset}`, W));
    const reviewMarker = reviewSelected
      ? `${c.cyan}${c.bold}\u25B8${c.reset} `
      : "  ";
    const reviewText = `${reviewMarker}${c.yellow}${c.bold}${dueCount} Fragen faellig${c.reset} ${c.dim}— Druecke [R] um die taegliche Wiederholung zu starten${c.reset}`;
    lines.push(bLine(` ${c.dim}│${c.reset} ${padR(reviewText, reviewInnerW - 2)}${c.dim}│${c.reset}`, W));
    lines.push(bLine(` ${c.dim}└${"─".repeat(reviewInnerW)}┘${c.reset}`, W));
  } else {
    lines.push(bLine(` ${c.dim}┌${"─".repeat(reviewInnerW)}┐${c.reset}`, W));
    lines.push(bLine(` ${c.dim}│${c.reset} ${padR(`${c.green}Review: Alles aktuell${c.reset}`, reviewInnerW - 2)}${c.dim}│${c.reset}`, W));
    lines.push(bLine(` ${c.dim}└${"─".repeat(reviewInnerW)}┘${c.reset}`, W));
  }

  lines.push(bEmpty(W));

  // Interleaved Review Banner (wenn >= 3 Lektionen abgeschlossen)
  const completedLessonCount = getCompletedLessonIndices().length;
  if (completedLessonCount >= 3) {
    const completedLessonNames = getCompletedLessonIndices()
      .slice(0, 3)
      .map((i) => lessons[i]?.title || "")
      .join(", ");
    const ilInnerW = W - 6;
    lines.push(bLine(` ${c.dim}┌${"─".repeat(ilInnerW)}┐${c.reset}`, W));
    lines.push(bLine(` ${c.dim}│${c.reset} ${padR(`${c.magenta}${c.bold}Interleaved Review${c.reset} ${c.dim}— 5 gemischte Aufgaben aus: ${truncate(completedLessonNames, ilInnerW - 45)}${c.reset}`, ilInnerW - 2)}${c.dim}│${c.reset}`, W));
    lines.push(bLine(` ${c.dim}│${c.reset} ${padR(`${c.dim}Druecke [I] zum Starten${c.reset}`, ilInnerW - 2)}${c.dim}│${c.reset}`, W));
    lines.push(bLine(` ${c.dim}└${"─".repeat(ilInnerW)}┘${c.reset}`, W));
    lines.push(bEmpty(W));
  }

  // Auffuellen bis Footer
  const footerStart = H - 3;
  while (lines.length < footerStart) {
    lines.push(bEmpty(W));
  }
  // Kuerzen wenn zu viele Zeilen
  while (lines.length > footerStart) {
    lines.pop();
  }

  // Footer
  const footerItems: string[] = [
    `${c.bold}[1-${lessons.length}]${c.reset} Lektion`,
    `${c.bold}[\u2191\u2193]${c.reset} Navigieren`,
    `${c.bold}[Enter]${c.reset} Oeffnen`,
    `${c.bold}[/]${c.reset} Suche`,
    `${c.bold}[B]${c.reset} Lesezeichen`,
    `${c.bold}[R]${c.reset} Review`,
    `${c.bold}[I]${c.reset} Interleaved`,
    `${c.bold}[K]${c.reset} Kompetenzen`,
    `${c.bold}[P]${c.reset} Kursauswahl`,
    `${c.bold}[?]${c.reset} Hilfe`,
    `${c.bold}[Q]${c.reset} Beenden`,
  ];

  lines.push(...renderFooter(footerItems));
  flushScreen(lines);
}

// ─── Lektions-Menue ────────────────────────────────────────────────────────

function renderLessonMenu(lessonIndex: number): void {
  updateTermSize();
  const lines: string[] = [];
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  const screen = currentScreen as {
    type: "lesson";
    lessonIndex: number;
    selectedIndex: number;
  };
  const selectedIdx = screen.selectedIndex;
  const lpct = getLessonProgress(lessonIndex);

  // Header mit Breadcrumb und Timer
  const timerStr = formatSessionTime();
  const lessonBarW = Math.max(6, Math.floor(W * 0.12));
  const lessonBar = fineProgressBar(lpct, lessonBarW);
  lines.push(
    renderHeader(
      ` ${getBreadcrumb(currentScreen)}: ${truncate(lesson.title, W - 50)}`,
      `${lessonBar} ${pctStr(lpct)} \u23F1 ${timerStr} `
    )
  );
  lines.push(boxTop(W));
  lines.push(bEmpty(W));

  // Zwei-Spalten-Layout
  const totalInnerL = W - 2;
  const leftColW = Math.max(28, Math.floor(totalInnerL * 0.50));
  const rightColW = Math.max(22, totalInnerL - leftColW - 1);

  const leftLines: string[] = [];
  const rightLines: string[] = [];

  // ── Linke Spalte: Sektionen ──
  leftLines.push(padR(`${c.bold}${c.cyan} Sektionen${c.reset}`, leftColW));
  leftLines.push(`${c.dim} ${"─".repeat(leftColW - 1)}${c.reset}`);

  for (let s = 0; s < lesson.sections.length; s++) {
    const section = lesson.sections[s];
    const key = getSectionKey(lessonIndex, s);
    const status = getSectionStatus(key);
    const isSelected = s === selectedIdx;

    let statusIcon: string;
    if (status === "completed") {
      statusIcon = `${c.green}\u2713${c.reset}`;
    } else if (status === "in_progress") {
      statusIcon = `${c.yellow}\u25B6${c.reset}`;
    } else {
      statusIcon = `${c.dim}\u25CB${c.reset}`;
    }

    // Lesezeit
    let readTime = "";
    try {
      const content = fs.readFileSync(section.filePath, "utf-8");
      readTime = `${c.dim}~${estimateReadTime(content)}m${c.reset}`;
    } catch {
      // ignorieren
    }

    const marker = isSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    const titleMaxLen = Math.max(5, leftColW - 16);
    const displayTitle = truncate(section.title, titleMaxLen);

    const line = `${marker} ${statusIcon} ${s + 1}  ${padR(displayTitle, titleMaxLen)} ${readTime}`;
    leftLines.push(padR(line, leftColW));
  }

  // Praxis-Bereich
  leftLines.push(" ".repeat(leftColW));
  leftLines.push(`${c.dim} ${"─".repeat(leftColW - 1)}${c.reset}`);
  leftLines.push(padR(`${c.bold} Praxis${c.reset}`, leftColW));
  leftLines.push(`${c.dim} ${"─".repeat(leftColW - 1)}${c.reset}`);

  // Exercise-Status
  const exProgress = countExerciseProgress(lesson);
  const exText =
    exProgress.total > 0
      ? `${exProgress.solved}/${exProgress.total} geloest`
      : `${c.dim}keine${c.reset}`;
  const exSelected = selectedIdx === lesson.sections.length;
  const exMarker = exSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  leftLines.push(padR(`${exMarker} ${c.bold}[E]${c.reset} Exercises     ${exText}`, leftColW));

  // Quiz
  if (lesson.hasQuiz) {
    const quizData = progress.quizzes[lesson.number];
    const quizText = quizData
      ? `Bestes: ${Math.round((quizData.score / quizData.total) * 100)}%`
      : `${c.dim}noch offen${c.reset}`;
    const qSelected = selectedIdx === lesson.sections.length + 1;
    const qMarker = qSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    leftLines.push(padR(`${qMarker} ${c.bold}[Z]${c.reset} Quiz          ${quizText}`, leftColW));
  }

  if (lesson.hasHints) {
    const hIdx = lesson.sections.length + (lesson.hasQuiz ? 2 : 1);
    const hSelected = selectedIdx === hIdx;
    const hMarker = hSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    leftLines.push(padR(`${hMarker} ${c.bold}[H]${c.reset} Hints`, leftColW));
  }

  // Misconceptions-Eintrag (wenn Datei existiert)
  const hasMisconceptions = fs.existsSync(
    path.join(PROJECT_ROOT, lesson.dirName, "misconceptions.ts")
  );
  if (hasMisconceptions) {
    const mIdx =
      lesson.sections.length +
      (lesson.hasQuiz ? 2 : 1) +
      (lesson.hasHints ? 1 : 0);
    const mSelected = selectedIdx === mIdx;
    const mMarker = mSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    leftLines.push(padR(`${mMarker} ${c.bold}[G]${c.reset} Misconceptions`, leftColW));
  }

  if (lesson.hasCheatsheet) {
    const cIdx =
      lesson.sections.length +
      (lesson.hasQuiz ? 2 : 1) +
      (lesson.hasHints ? 1 : 0) +
      (hasMisconceptions ? 1 : 0);
    const cSelected = selectedIdx === cIdx;
    const cMarker = cSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
    leftLines.push(padR(`${cMarker} ${c.bold}[C]${c.reset} Cheatsheet`, leftColW));
  }

  // Auffuellen
  const minLeft = Math.max(leftLines.length, 14);
  while (leftLines.length < minLeft) {
    leftLines.push(" ".repeat(leftColW));
  }

  // ── Rechte Spalte: Vorschau ──
  rightLines.push(`${c.bold}${c.cyan} Vorschau${c.reset}`);
  rightLines.push(`${c.dim} ${"─".repeat(rightColW - 1)}${c.reset}`);

  if (selectedIdx < lesson.sections.length) {
    const section = lesson.sections[selectedIdx];
    rightLines.push(`${c.bold} ${truncate(section.title, rightColW - 2)}${c.reset}`);
    rightLines.push("");

    try {
      const content = fs.readFileSync(section.filePath, "utf-8");
      const previewLines = renderPreview(content, rightColW - 2, minLeft - 6);
      for (const pl of previewLines) {
        const truncLine = truncate(pl, rightColW - 1);
        rightLines.push(` ${truncLine}`);
      }
    } catch {
      rightLines.push(` ${c.dim}(Vorschau nicht verfuegbar)${c.reset}`);
    }
  } else {
    rightLines.push("");
    rightLines.push(` ${c.dim}Waehle eine Sektion${c.reset}`);
    rightLines.push(` ${c.dim}fuer eine Vorschau${c.reset}`);
  }

  // Rechte Spalte auffuellen
  while (rightLines.length < minLeft) {
    rightLines.push("");
  }

  // Spalten zusammensetzen
  const rowCount = Math.max(leftLines.length, rightLines.length);
  for (let row = 0; row < rowCount; row++) {
    const left = row < leftLines.length ? leftLines[row] : "";
    const right = row < rightLines.length ? rightLines[row] : "";
    const merged = `${padR(left, leftColW)}${c.dim}│${c.reset}${padR(right, rightColW)}`;
    lines.push(bLine(merged, W));
  }

  lines.push(bEmpty(W));

  // Auffuellen bis Footer
  const footerStart = H - 3;
  while (lines.length < footerStart) {
    lines.push(bEmpty(W));
  }

  // Footer
  const shortcuts: string[] = [
    `${c.bold}[1-${lesson.sections.length}]${c.reset} Sektion`,
    `${c.bold}[\u2191\u2193]${c.reset} Navigieren`,
    `${c.bold}[Enter/\u2192]${c.reset} Oeffnen`,
    `${c.bold}[E]${c.reset} Exercises`,
    `${c.bold}[Z]${c.reset} Quiz`,
    `${c.bold}[V]${c.reset} VS Code`,
  ];
  if (lesson.hasHints) shortcuts.push(`${c.bold}[H]${c.reset} Hints`);
  if (hasMisconceptions) shortcuts.push(`${c.bold}[G]${c.reset} Misconceptions`);
  if (lesson.hasCheatsheet) shortcuts.push(`${c.bold}[C]${c.reset} Cheatsheet`);
  shortcuts.push(`${c.bold}[\u2190/Esc]${c.reset} Zurueck`);

  lines.push(...renderFooter(shortcuts));
  flushScreen(lines);
}

// ─── Sektions-Reader (Smooth Scrolling) ────────────────────────────────────

function loadSection(lessonIndex: number, sectionIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson || !lesson.sections[sectionIndex]) return;

  const section = lesson.sections[sectionIndex];
  const content = fs.readFileSync(section.filePath, "utf-8");

  sectionReadTime = estimateReadTime(content);
  sectionMermaidBlocks = extractMermaidBlocks(content);
  sectionSelfExplainPrompts = extractSelfExplanationPrompts(content);
  sectionSelfExplainTriggered = new Set();
  sectionRawMarkdown = content; // Fuer TTS-Extraktion aufbewahren

  updateTermSize();
  const renderWidth = Math.max(30, W - 6); // 2 for box borders, 2 for padding, 2 for scrollbar
  sectionRenderedLines = renderMarkdown(content, renderWidth);
}

// ─── Text-to-Speech (TTS) Funktionen ─────────────────────────────────────

/**
 * Extrahiert lesbaren Text aus Markdown-Quelltext.
 * Entfernt Code-Bloecke, Mermaid-Diagramme, Links und sonstige Markdown-Syntax.
 * Startet ab der angegebenen Zeile (basierend auf scrollOffset-Mapping).
 */
function extractReadableText(markdown: string, fromLine: number): string {
  const lines = markdown.split("\n");
  const relevantLines = lines.slice(fromLine);

  let text = relevantLines
    .join("\n")
    // Mermaid-Bloecke entfernen (vor allgemeinen Code-Bloecken)
    .replace(/```mermaid[\s\S]*?```/g, " Diagramm uebersprungen. ")
    // Code-Bloecke entfernen
    .replace(/```[\s\S]*?```/g, " Code-Beispiel uebersprungen. ")
    // Inline Code: Backticks entfernen, Inhalt behalten
    .replace(/`([^`]+)`/g, "$1")
    // Ueberschriften: # entfernen
    .replace(/^#{1,6}\s+/gm, "")
    // Bold/Italic
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Bilder ![alt](url) → alt
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Blockquotes
    .replace(/^>\s*/gm, "")
    // Horizontale Linien
    .replace(/^[-*_]{3,}$/gm, "")
    // Listen-Marker (-, *, +, 1.)
    .replace(/^(\s*)([-*+]|\d+\.)\s+/gm, "$1")
    // Box-Drawing-Zeichen entfernen
    .replace(/[─═╔╗╚╝║╠╣╦╩┌┐└┘├┤┬┴│─]/g, "")
    // HTML-Tags
    .replace(/<[^>]+>/g, "")
    // Mehrfache Leerzeilen → eine Pause
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Begrenze auf ~2000 Zeichen (PowerShell Command-Length-Limits)
  if (text.length > 2000) {
    // Am Satz-Ende abschneiden wenn moeglich
    const truncated = text.slice(0, 2000);
    const lastSentence = truncated.lastIndexOf(". ");
    if (lastSentence > 1500) {
      text = truncated.slice(0, lastSentence + 1) + " Weiter scrollen fuer mehr.";
    } else {
      text = truncated + ". Weiter scrollen fuer mehr.";
    }
  }

  return text;
}

/**
 * Mappt den Scroll-Offset (gerenderte Zeilen) auf eine ungefaehre
 * Zeilennummer im rohen Markdown-Quelltext.
 */
function getMarkdownLineFromScroll(
  scrollOffset: number,
  totalRendered: number,
  totalMarkdown: number
): number {
  if (totalRendered <= 0) return 0;
  return Math.floor((scrollOffset / totalRendered) * totalMarkdown);
}

/**
 * Stoppt den aktuell laufenden TTS-Prozess (falls vorhanden).
 * Verwendet taskkill /T /F um den PowerShell-Prozess und alle Kinder zu beenden.
 */
function stopTTS(): void {
  if (ttsProcess) {
    try {
      if (os.platform() === "darwin") {
        spawn("kill", ["-9", String(ttsProcess.pid)], { stdio: "ignore" });
      } else {
        spawn("taskkill", ["/PID", String(ttsProcess.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      }
    } catch {
      // Prozess war evtl. schon beendet
    }
    ttsProcess = null;
  }
  ttsActive = false;
  ttsParagraphs = [];
  ttsCurrentParagraph = 0;
}

/**
 * Startet TTS fuer einen einzelnen Text-Absatz.
 * Ruft onDone auf wenn der Absatz fertig vorgelesen wurde.
 */
function startTTSSingle(text: string, onDone: () => void): void {
  if (os.platform() === "darwin") {
    const cleanText = text.replace(/\r\n/g, " ").replace(/\n/g, " ");
    ttsProcess = spawn("say", [cleanText], {
      stdio: "ignore",
      detached: true,
    });
  } else {
    // Escape single quotes und Zeilenumbrueche fuer PowerShell
    const escaped = text
      .replace(/'/g, "''")
      .replace(/\r\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/"/g, "'");

    ttsProcess = spawn(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Add-Type -AssemblyName System.Speech; ` +
          `$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; ` +
          `$synth.Rate = 1; ` +
          `$deVoice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'de-*' } | Select-Object -First 1; ` +
          `if ($deVoice) { $synth.SelectVoice($deVoice.VoiceInfo.Name) }; ` +
          `$synth.Speak('${escaped}');`,
      ],
      {
        stdio: "ignore",
        detached: true,
      }
    );
  }

  ttsProcess.on("exit", () => {
    ttsProcess = null;
    onDone();
  });

  ttsProcess.on("error", () => {
    ttsProcess = null;
    ttsActive = false;
  });
}

/**
 * Liest den naechsten Absatz vor. Wird rekursiv aufgerufen bis alle
 * Absaetze gelesen sind oder TTS gestoppt wird.
 */
function readNextParagraph(): void {
  if (!ttsActive || ttsCurrentParagraph >= ttsParagraphs.length) {
    ttsActive = false;
    ttsProcess = null;
    // Redraw footer um Status zu aktualisieren
    if (currentScreen.type === "section") {
      const s = currentScreen as Extract<Screen, { type: "section" }>;
      renderSectionReader(s.lessonIndex, s.sectionIndex, s.scrollOffset);
    }
    return;
  }

  const para = ttsParagraphs[ttsCurrentParagraph];
  ttsCurrentParagraph++;

  startTTSSingle(para, () => {
    if (ttsActive) {
      readNextParagraph();
    }
  });
}

/**
 * Startet das Vorlesen ab der aktuellen Scroll-Position.
 * Extrahiert lesbaren Text, teilt ihn in Absaetze und liest sequenziell vor.
 */
function startTTSFromPosition(
  markdown: string,
  scrollOffset: number,
  totalRendered: number
): void {
  stopTTS(); // Alten Prozess beenden

  const totalMarkdown = markdown.split("\n").length;
  const fromLine = getMarkdownLineFromScroll(scrollOffset, totalRendered, totalMarkdown);
  const text = extractReadableText(markdown, fromLine);

  if (text.length === 0) return;

  ttsParagraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  ttsCurrentParagraph = 0;
  ttsActive = true;

  readNextParagraph();
}

function getContentHeight(): number {
  return Math.max(5, H - 4); // Header(1) + Footer(3)
}

function clampScrollOffset(offset: number, totalLines: number): number {
  const maxOffset = Math.max(0, totalLines - getContentHeight());
  return Math.max(0, Math.min(offset, maxOffset));
}

function getScrollPercent(scrollOffset: number, totalLines: number): number {
  const contentHeight = getContentHeight();
  if (totalLines <= contentHeight) return 100;
  const maxOffset = totalLines - contentHeight;
  return Math.round((scrollOffset / maxOffset) * 100);
}

function renderSectionReader(
  lessonIndex: number,
  sectionIndex: number,
  scrollOffset: number
): void {
  updateTermSize();
  const lines: string[] = [];
  const lesson = lessons[lessonIndex];
  if (!lesson || !lesson.sections[sectionIndex]) return;
  const section = lesson.sections[sectionIndex];

  const totalLines = sectionRenderedLines.length;
  const contentHeight = getContentHeight();
  const offset = clampScrollOffset(scrollOffset, totalLines);
  const currentLine = offset + 1;
  const pct = getScrollPercent(offset, totalLines);

  // Header mit Breadcrumb und Timer
  const sTimerStr = formatSessionTime();
  const headerLeft = ` ${getBreadcrumb(currentScreen)}: ${truncate(section.title, W - 65)}`;
  const headerRight = `${pct}% \u00B7 ~${sectionReadTime}m \u23F1 ${sTimerStr} `;
  lines.push(renderHeader(headerLeft, headerRight));

  // Scrollbar berechnen
  const scrollbar = computeScrollbar(offset, totalLines, contentHeight);

  // Inhalt mit Scrollbar
  const visibleLines = sectionRenderedLines.slice(offset, offset + contentHeight);

  for (let i = 0; i < contentHeight; i++) {
    const contentLine = i < visibleLines.length ? visibleLines[i] : "";
    const sb = scrollbarChar(scrollbar[i] ?? "track");
    // Box: │ <content padding> <scrollbar> │
    const innerW = W - 4; // 2 box borders + 1 scrollbar + 1 space before scrollbar
    const paddedContent = padR(` ${contentLine}`, innerW - 1);
    lines.push(`${c.dim}│${c.reset}${paddedContent}${sb}${c.dim}│${c.reset}`);
  }

  // Footer
  const navParts: string[] = [
    `${c.bold}[\u2191\u2193]${c.reset} Scrollen`,
    `${c.bold}[PgUp/PgDn]${c.reset} Seite`,
    `${c.bold}[Space]${c.reset} Weiter`,
    `${c.bold}[Home/End]${c.reset} Anfang/Ende`,
  ];
  if (lesson.sections.length > 1) {
    navParts.push(`${c.bold}[1-${lesson.sections.length}]${c.reset} Sektion`);
  }
  if (sectionMermaidBlocks.length > 0)
    navParts.push(`${c.bold}[D]${c.reset} Diagramm`);
  navParts.push(
    ttsActive
      ? `${c.bold}${c.green}[L]${c.reset} ${c.green}Vorlesen: AN${c.reset}`
      : `${c.bold}[L]${c.reset} Vorlesen`
  );
  navParts.push(`${c.bold}[A]${c.reset} Annotationen: ${annotationsEnabled ? "AN" : "AUS"}`);
  navParts.push(`${c.bold}[M]${c.reset} Merken`);
  navParts.push(`${c.bold}[V]${c.reset} VS Code`);
  navParts.push(`${c.bold}[Q/Esc]${c.reset} Zurueck`);

  lines.push(...renderFooter(navParts));
  flushScreen(lines);
}

// ─── Cheatsheet-Reader (Smooth Scrolling) ─────────────────────────────────

function loadCheatsheet(lessonIndex: number): boolean {
  const lesson = lessons[lessonIndex];
  if (!lesson || !lesson.hasCheatsheet) return false;

  const cheatPath = path.join(PROJECT_ROOT, lesson.dirName, "cheatsheet.md");
  if (!fs.existsSync(cheatPath)) return false;

  const content = fs.readFileSync(cheatPath, "utf-8");
  updateTermSize();
  const renderWidth = Math.max(30, W - 6);
  cheatsheetRenderedLines = renderMarkdown(content, renderWidth);
  return true;
}

function renderCheatsheetReader(lessonIndex: number, scrollOffset: number): void {
  updateTermSize();
  const lines: string[] = [];
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

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
    const innerW = W - 4;
    const paddedContent = padR(` ${contentLine}`, innerW - 1);
    lines.push(`${c.dim}│${c.reset}${paddedContent}${sb}${c.dim}│${c.reset}`);
  }

  const navParts: string[] = [
    `${c.bold}[\u2191\u2193]${c.reset} Scrollen`,
    `${c.bold}[PgUp/PgDn]${c.reset} Seite`,
    `${c.bold}[Space]${c.reset} Weiter`,
    `${c.bold}[Q/Esc]${c.reset} Zurueck`,
  ];
  lines.push(...renderFooter(navParts));
  flushScreen(lines);
}

// ─── Warm-Up Screen ───────────────────────────────────────────────────────

function renderWarmup(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "warmup" }>;
  const { questions, currentIndex, showingFeedback, feedbackCorrect, feedbackExplanation, done, answers } = screen;

  if (done) {
    // Zusammenfassung
    const correct = answers.filter((a) => a.correct).length;
    lines.push(renderHeader(" Warm-Up Zusammenfassung", `${correct}/${answers.length} richtig `));
    lines.push(boxTop(W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.bold}Warm-Up abgeschlossen!${c.reset}`, W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  Ergebnis: ${c.bold}${correct}${c.reset}/${answers.length} richtig`, W));
    lines.push(bEmpty(W));

    if (correct === answers.length) {
      lines.push(bLine(`  ${c.green}Perfekt! Dein Wissen sitzt fest.${c.reset}`, W));
    } else if (correct >= answers.length / 2) {
      lines.push(bLine(`  ${c.yellow}Gut! Ein paar Themen koenntest du wiederholen.${c.reset}`, W));
    } else {
      lines.push(bLine(`  ${c.red}Das Wissen ist noch nicht gefestigt. Wiederholung hilft!${c.reset}`, W));
    }

    lines.push(bEmpty(W));
    const footerStart = H - 3;
    while (lines.length < footerStart) lines.push(bEmpty(W));
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Zum Hauptmenue`]));
    flushScreen(lines);
    return;
  }

  const q = questions[currentIndex];
  const lesson = lessons[q.lessonIndex];
  const lessonLabel = lesson ? `Lektion ${lesson.number}: ${lesson.title}` : `Lektion ${q.lessonIndex + 1}`;

  lines.push(renderHeader(` Warm-Up`, `Frage ${currentIndex + 1}/${questions.length} `));
  lines.push(boxTop(W));
  lines.push(bEmpty(W));
  lines.push(bLine(`  ${c.dim}Aus ${lessonLabel}${c.reset}`, W));
  lines.push(bEmpty(W));

  // Frage
  const questionLines = wordWrap(q.question.question, W - 6);
  for (const ql of questionLines) {
    lines.push(bLine(`  ${c.bold}${ql}${c.reset}`, W));
  }
  lines.push(bEmpty(W));

  // Code-Block wenn vorhanden
  if (q.question.code) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    const codeLines = q.question.code.split("\n");
    for (const cl of codeLines) {
      lines.push(bLine(`  ${c.cyan}  ${cl}${c.reset}`, W));
    }
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    lines.push(bEmpty(W));
  }

  // Optionen
  const labels = ["A", "B", "C", "D"];
  for (let i = 0; i < q.question.options.length && i < 4; i++) {
    const optText = truncate(q.question.options[i], W - 12);
    lines.push(bLine(`  ${c.bold}[${labels[i]}]${c.reset} ${optText}`, W));
  }

  lines.push(bEmpty(W));

  // Feature 5: Confidence-Phase
  if (screen.phase === "confidence") {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    lines.push(bLine(`  ${c.bold}${c.yellow}Wie sicher bist du bei deiner Antwort?${c.reset}`, W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.bold}[1]${c.reset} Geraten`, W));
    lines.push(bLine(`  ${c.bold}[2]${c.reset} Unsicher`, W));
    lines.push(bLine(`  ${c.bold}[3]${c.reset} Ziemlich sicher`, W));
    lines.push(bLine(`  ${c.bold}[4]${c.reset} Absolut sicher`, W));
    lines.push(bEmpty(W));
  }

  // Feedback (with calibration comment)
  if (showingFeedback) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    if (feedbackCorrect) {
      lines.push(bLine(`  ${c.green}${c.bold}Richtig!${c.reset}`, W));
    } else {
      lines.push(bLine(`  ${c.red}${c.bold}Falsch!${c.reset}`, W));
    }
    const expLines = wordWrap(feedbackExplanation, W - 8);
    for (const el of expLines) {
      lines.push(bLine(`  ${c.dim}${el}${c.reset}`, W));
    }
    // Feature 5: Kalibrierungskommentar
    if (screen.confidence !== undefined) {
      const confident = screen.confidence >= 3;
      const calibration = getConfidenceFeedback(confident, feedbackCorrect);
      lines.push(bEmpty(W));
      const calLines = wordWrap(stripAnsi(calibration), W - 8);
      // Re-apply color from the original calibration string
      lines.push(bLine(`  ${calibration.split("\n")[0] || calibration}`, W));
      if (calLines.length > 1) {
        for (let ci = 1; ci < calLines.length; ci++) {
          lines.push(bLine(`  ${c.dim}${calLines[ci]}${c.reset}`, W));
        }
      }
    }
    lines.push(bEmpty(W));
  }

  const footerStart = H - 3;
  while (lines.length < footerStart) lines.push(bEmpty(W));

  if (screen.phase === "confidence") {
    lines.push(...renderFooter([`${c.bold}[1-4]${c.reset} Sicherheit waehlen`]));
  } else if (showingFeedback) {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Naechste Frage`]));
  } else {
    lines.push(...renderFooter([
      `${c.bold}[A-D]${c.reset} Antworten`,
      `${c.bold}[S]${c.reset} Warm-Up ueberspringen`,
    ]));
  }
  flushScreen(lines);
}

// ─── Pre-Test Screen ──────────────────────────────────────────────────────

function renderPretest(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "pretest" }>;
  const { lessonIndex, sectionIndex, questions, currentIndex, showingFeedback,
          feedbackCorrect, feedbackExplanation, showingResult, recommendedDepth, score } = screen;

  const lesson = lessons[lessonIndex];
  const section = lesson?.sections[sectionIndex];
  const sectionTitle = section ? section.title : `Sektion ${sectionIndex + 1}`;

  if (showingResult) {
    // Ergebnis-Screen
    lines.push(renderHeader(` Pre-Test Ergebnis`, ``));
    lines.push(boxTop(W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.bold}Ergebnis: ${score}% richtig${c.reset}`, W));
    lines.push(bEmpty(W));

    let depthLabel: string;
    let depthHint: string;
    if (recommendedDepth === "kurz") {
      depthLabel = `${c.green}Schnelldurchlauf${c.reset}`;
      depthHint = "Du kennst das Thema schon gut!";
    } else if (recommendedDepth === "standard") {
      depthLabel = `${c.yellow}Normale Tiefe${c.reset}`;
      depthHint = "Du hast Grundkenntnisse — lies aufmerksam.";
    } else {
      depthLabel = `${c.cyan}Vollstaendige Tiefe${c.reset}`;
      depthHint = "Dieses Thema scheint neu fuer dich zu sein.";
    }

    lines.push(bLine(`  Empfehlung: ${depthLabel}`, W));
    lines.push(bLine(`  ${c.dim}(${depthHint})${c.reset}`, W));
    lines.push(bEmpty(W));

    const footerStart = H - 3;
    while (lines.length < footerStart) lines.push(bEmpty(W));
    lines.push(...renderFooter([
      `${c.bold}[Enter]${c.reset} Sektion lesen`,
      `${c.bold}[S]${c.reset} Ueberspringen`,
    ]));
    flushScreen(lines);
    return;
  }

  lines.push(renderHeader(
    ` Pre-Test: ${truncate(sectionTitle, W - 40)}`,
    `Frage ${currentIndex + 1}/${questions.length} `
  ));
  lines.push(boxTop(W));
  lines.push(bEmpty(W));
  lines.push(bLine(`  ${c.dim}Bevor du liest — was weisst du schon?${c.reset}`, W));
  lines.push(bLine(`  ${c.dim}(Falsche Antworten sind OK — sie helfen beim Lernen!)${c.reset}`, W));
  lines.push(bEmpty(W));

  const q = questions[currentIndex];
  // Code-Block
  if (q.code) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, W - 6))}${c.reset}`, W));
    const codeLines = q.code.split("\n");
    for (const cl of codeLines) {
      lines.push(bLine(`  ${c.cyan}  ${cl}${c.reset}`, W));
    }
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, W - 6))}${c.reset}`, W));
    lines.push(bEmpty(W));
  }

  // Frage
  const questionLines = wordWrap(q.question, W - 6);
  for (const ql of questionLines) {
    lines.push(bLine(`  ${c.bold}${ql}${c.reset}`, W));
  }
  lines.push(bEmpty(W));

  // Optionen
  const labels = ["A", "B", "C", "D"];
  for (let i = 0; i < q.options.length && i < 4; i++) {
    lines.push(bLine(`  ${c.bold}[${labels[i]}]${c.reset} ${truncate(q.options[i], W - 12)}`, W));
  }
  lines.push(bLine(`  ${c.bold}[?]${c.reset} ${c.dim}Ich weiss es nicht${c.reset}`, W));

  lines.push(bEmpty(W));

  // Feature 5: Confidence-Phase
  if (screen.phase === "confidence") {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    lines.push(bLine(`  ${c.bold}${c.yellow}Wie sicher bist du bei deiner Antwort?${c.reset}`, W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.bold}[1]${c.reset} Geraten`, W));
    lines.push(bLine(`  ${c.bold}[2]${c.reset} Unsicher`, W));
    lines.push(bLine(`  ${c.bold}[3]${c.reset} Ziemlich sicher`, W));
    lines.push(bLine(`  ${c.bold}[4]${c.reset} Absolut sicher`, W));
    lines.push(bEmpty(W));
  }

  // Feedback (with calibration comment)
  if (showingFeedback) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    if (feedbackCorrect) {
      lines.push(bLine(`  ${c.green}${c.bold}Richtig!${c.reset}`, W));
    } else {
      lines.push(bLine(`  ${c.red}${c.bold}Falsch${c.reset} ${c.dim}— kein Problem, du lernst es gleich!${c.reset}`, W));
    }
    const expLines = wordWrap(feedbackExplanation, W - 8);
    for (const el of expLines) {
      lines.push(bLine(`  ${c.dim}${el}${c.reset}`, W));
    }
    // Feature 5: Kalibrierungskommentar
    if (screen.confidence !== undefined) {
      const confident = screen.confidence >= 3;
      const calibration = getConfidenceFeedback(confident, feedbackCorrect);
      lines.push(bEmpty(W));
      lines.push(bLine(`  ${calibration}`, W));
    }
    lines.push(bEmpty(W));
  }

  const footerStart = H - 3;
  while (lines.length < footerStart) lines.push(bEmpty(W));

  if (screen.phase === "confidence") {
    lines.push(...renderFooter([`${c.bold}[1-4]${c.reset} Sicherheit waehlen`]));
  } else if (showingFeedback) {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Naechste`]));
  } else {
    lines.push(...renderFooter([
      `${c.bold}[A-D]${c.reset} Antworten`,
      `${c.bold}[?]${c.reset} Weiss nicht`,
      `${c.bold}[S]${c.reset} Pre-Test ueberspringen`,
    ]));
  }
  flushScreen(lines);
}

// ─── Self-Explanation Screen ──────────────────────────────────────────────

function renderSelfExplanation(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "selfexplain" }>;
  const { prompt, showKeyPoints, typingMode, typedText } = screen;

  lines.push(renderHeader(" Erklaere dir selbst", ""));
  lines.push(boxTop(W));
  lines.push(bEmpty(W));

  // Frage anzeigen
  const questionLines = wordWrap(prompt.question, W - 6);
  for (const ql of questionLines) {
    lines.push(bLine(`  ${c.bold}${c.cyan}${ql}${c.reset}`, W));
  }
  lines.push(bEmpty(W));

  if (typingMode) {
    lines.push(bLine(`  ${c.dim}Deine Erklaerung:${c.reset}`, W));
    const typedLines = wordWrap(typedText + "\u2588", W - 8);
    for (const tl of typedLines) {
      lines.push(bLine(`    ${c.white}${tl}${c.reset}`, W));
    }
    lines.push(bEmpty(W));
  }

  if (showKeyPoints && prompt.keyPoints.length > 0) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    lines.push(bLine(`  ${c.yellow}${c.bold}Kernpunkte:${c.reset}`, W));
    for (const kp of prompt.keyPoints) {
      const kpLines = wordWrap(kp, W - 10);
      for (const kl of kpLines) {
        lines.push(bLine(`    ${c.yellow}${kl}${c.reset}`, W));
      }
    }
    lines.push(bEmpty(W));
  }

  const footerStart = H - 3;
  while (lines.length < footerStart) lines.push(bEmpty(W));

  if (typingMode) {
    lines.push(...renderFooter([
      `${c.bold}[Enter]${c.reset} Fertig`,
      `${c.bold}[Esc]${c.reset} Abbrechen`,
    ]));
  } else {
    lines.push(...renderFooter([
      `${c.bold}[T]${c.reset} Tippe Erklaerung`,
      `${c.bold}[Enter]${c.reset} Verstanden — weiter`,
      `${c.bold}[?]${c.reset} Kernpunkte zeigen`,
    ]));
  }
  flushScreen(lines);
}

// ─── Misconception Challenge Screen ──────────────────────────────────────

function renderMisconceptions(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "misconceptions" }>;
  const { misconceptions, currentIndex, answered, showingResolution, score } = screen;

  if (misconceptions.length === 0) {
    lines.push(renderHeader(" Misconception Challenge", ""));
    lines.push(boxTop(W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.dim}Keine Misconceptions fuer diese Lektion verfuegbar.${c.reset}`, W));
    lines.push(bLine(`  ${c.dim}Diese werden von einem parallelen Agenten erstellt.${c.reset}`, W));
    const footerStart = H - 3;
    while (lines.length < footerStart) lines.push(bEmpty(W));
    lines.push(...renderFooter([`${c.bold}[Q]${c.reset} Zurueck`]));
    flushScreen(lines);
    return;
  }

  const mc = misconceptions[currentIndex];
  lines.push(renderHeader(
    ` Misconception Challenge`,
    `${currentIndex + 1}/${misconceptions.length}  Punkte: ${score} `
  ));
  lines.push(boxTop(W));
  lines.push(bEmpty(W));

  if (!answered) {
    lines.push(bLine(`  ${c.bold}Dieser Code sieht richtig aus. Finde den Bug!${c.reset}`, W));
    lines.push(bEmpty(W));

    // Code-Block
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(55, W - 6))}${c.reset}`, W));
    const codeLines = mc.code.split("\n");
    for (const cl of codeLines) {
      lines.push(bLine(`  ${c.cyan}  ${truncate(cl, W - 10)}${c.reset}`, W));
    }
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(55, W - 6))}${c.reset}`, W));
    lines.push(bEmpty(W));

    lines.push(bLine(`  ${c.bold}Was denkst du?${c.reset}`, W));
    lines.push(bLine(`  ${c.bold}[A]${c.reset} Der Code ist korrekt`, W));
    lines.push(bLine(`  ${c.bold}[B]${c.reset} Es gibt einen subtilen Fehler`, W));
    lines.push(bEmpty(W));
  }

  if (showingResolution) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    lines.push(bLine(`  ${c.yellow}${c.bold}Aufloesung:${c.reset}`, W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.bold}Was die meisten denken:${c.reset}`, W));
    const beliefLines = wordWrap(mc.commonBelief, W - 8);
    for (const bl of beliefLines) {
      lines.push(bLine(`    ${c.dim}${bl}${c.reset}`, W));
    }
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.bold}Realitaet:${c.reset}`, W));
    const realityLines = wordWrap(mc.reality, W - 8);
    for (const rl of realityLines) {
      lines.push(bLine(`    ${c.cyan}${rl}${c.reset}`, W));
    }
    lines.push(bEmpty(W));
  }

  const footerStart = H - 3;
  while (lines.length < footerStart) lines.push(bEmpty(W));

  if (answered) {
    const footerItems: string[] = [];
    if (currentIndex < misconceptions.length - 1) {
      footerItems.push(`${c.bold}[Enter]${c.reset} Naechste`);
    }
    footerItems.push(`${c.bold}[Q]${c.reset} Zurueck`);
    lines.push(...renderFooter(footerItems));
  } else {
    lines.push(...renderFooter([
      `${c.bold}[A]${c.reset} Korrekt`,
      `${c.bold}[B]${c.reset} Fehler gefunden`,
      `${c.bold}[Q]${c.reset} Zurueck`,
    ]));
  }
  flushScreen(lines);
}

// ─── Completion Problem Screen ───────────────────────────────────────────

function renderCompletionProblem(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "completion" }>;
  const { problems, currentProblem, currentBlank, userInput, filledBlanks,
          showingHint, showingSolution, score } = screen;

  if (problems.length === 0) {
    lines.push(renderHeader(" Completion Problems", ""));
    lines.push(boxTop(W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.dim}Keine Completion Problems fuer diese Lektion verfuegbar.${c.reset}`, W));
    lines.push(bLine(`  ${c.dim}Diese werden von einem parallelen Agenten erstellt.${c.reset}`, W));
    const footerStart = H - 3;
    while (lines.length < footerStart) lines.push(bEmpty(W));
    lines.push(...renderFooter([`${c.bold}[Q]${c.reset} Zurueck`]));
    flushScreen(lines);
    return;
  }

  const prob = problems[currentProblem];
  const blank = prob.blanks[currentBlank];

  lines.push(renderHeader(
    ` Completion Problem`,
    `${currentProblem + 1}/${problems.length}  Punkte: ${score} `
  ));
  lines.push(boxTop(W));
  lines.push(bEmpty(W));

  // Beschreibung
  const descLines = wordWrap(prob.description, W - 6);
  for (const dl of descLines) {
    lines.push(bLine(`  ${c.bold}${dl}${c.reset}`, W));
  }
  lines.push(bEmpty(W));

  // Template mit ausgefuellten Luecken
  lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(55, W - 6))}${c.reset}`, W));
  let templateDisplay = prob.template;
  for (let i = 0; i < prob.blanks.length; i++) {
    const ph = prob.blanks[i].placeholder;
    if (i < filledBlanks.length) {
      templateDisplay = templateDisplay.replace(ph, `${c.green}${filledBlanks[i]}${c.reset}${c.cyan}`);
    } else if (i === currentBlank) {
      templateDisplay = templateDisplay.replace(ph, `${c.yellow}${c.bold}______${c.reset}${c.cyan}`);
    }
  }
  const tplLines = templateDisplay.split("\n");
  for (const tl of tplLines) {
    lines.push(bLine(`  ${c.cyan}  ${truncate(tl, W - 10)}${c.reset}`, W));
  }
  lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(55, W - 6))}${c.reset}`, W));
  lines.push(bEmpty(W));

  if (currentBlank < prob.blanks.length) {
    lines.push(bLine(`  Luecke ${currentBlank + 1}/${prob.blanks.length}: ${c.bold}${blank.placeholder}${c.reset}`, W));
    if (showingHint) {
      lines.push(bLine(`  ${c.yellow}Hint: ${blank.hint}${c.reset}`, W));
    }
    lines.push(bLine(`  > Deine Antwort: ${c.cyan}${userInput}\u2588${c.reset}`, W));
  } else {
    // Alle Luecken ausgefuellt
    lines.push(bLine(`  ${c.green}${c.bold}Alle Luecken ausgefuellt!${c.reset}`, W));
    if (showingSolution) {
      lines.push(bEmpty(W));
      lines.push(bLine(`  ${c.dim}Musterloesung:${c.reset}`, W));
      const solLines = prob.solution.split("\n");
      for (const sl of solLines) {
        lines.push(bLine(`  ${c.cyan}  ${truncate(sl, W - 10)}${c.reset}`, W));
      }
    }
  }

  lines.push(bEmpty(W));
  const footerStart = H - 3;
  while (lines.length < footerStart) lines.push(bEmpty(W));

  if (currentBlank >= prob.blanks.length) {
    const footerItems: string[] = [];
    if (currentProblem < problems.length - 1) {
      footerItems.push(`${c.bold}[Enter]${c.reset} Naechstes Problem`);
    }
    footerItems.push(`${c.bold}[L]${c.reset} Loesung`, `${c.bold}[Q]${c.reset} Zurueck`);
    lines.push(...renderFooter(footerItems));
  } else {
    lines.push(...renderFooter([
      `${c.bold}[Enter]${c.reset} Pruefen`,
      `${c.bold}[H]${c.reset} Hint`,
      `${c.bold}[Q]${c.reset} Zurueck`,
    ]));
  }
  flushScreen(lines);
}

// ─── Interleaved Review Screen ───────────────────────────────────────────

function renderInterleaved(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "interleaved" }>;
  const { items, currentIndex, answers, showingFeedback, feedbackCorrect, feedbackExplanation, done } = screen;

  if (items.length === 0) {
    lines.push(renderHeader(" Interleaved Review", ""));
    lines.push(boxTop(W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.dim}Noch nicht genug Lektionen abgeschlossen.${c.reset}`, W));
    lines.push(bLine(`  ${c.dim}Du brauchst mindestens 3 abgeschlossene Lektionen.${c.reset}`, W));
    const footerStart = H - 3;
    while (lines.length < footerStart) lines.push(bEmpty(W));
    lines.push(...renderFooter([`${c.bold}[Q]${c.reset} Zurueck`]));
    flushScreen(lines);
    return;
  }

  if (done) {
    const correct = answers.filter((a) => a.correct).length;
    lines.push(renderHeader(" Interleaved Review — Ergebnis", `${correct}/${answers.length} `));
    lines.push(boxTop(W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.bold}Interleaved Review abgeschlossen!${c.reset}`, W));
    lines.push(bLine(`  Ergebnis: ${c.bold}${correct}${c.reset}/${answers.length} richtig`, W));
    lines.push(bEmpty(W));
    if (correct === answers.length) {
      lines.push(bLine(`  ${c.green}Hervorragend! Alles sitzt.${c.reset}`, W));
    } else {
      lines.push(bLine(`  ${c.yellow}Gut gemacht! Wiederholung festigt das Wissen.${c.reset}`, W));
    }
    const footerStart = H - 3;
    while (lines.length < footerStart) lines.push(bEmpty(W));
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Zum Hauptmenue`]));
    flushScreen(lines);
    return;
  }

  const item = items[currentIndex];
  lines.push(renderHeader(
    ` Interleaved Review`,
    `${currentIndex + 1}/${items.length}  Aus: L${item.lessonNumber} `
  ));
  lines.push(boxTop(W));
  lines.push(bEmpty(W));
  lines.push(bLine(`  ${c.dim}Lektion ${item.lessonNumber}: ${item.lessonTitle}${c.reset}`, W));
  lines.push(bEmpty(W));

  // Code
  if (item.code) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, W - 6))}${c.reset}`, W));
    const codeLines = item.code.split("\n");
    for (const cl of codeLines) {
      lines.push(bLine(`  ${c.cyan}  ${cl}${c.reset}`, W));
    }
    lines.push(bLine(`  ${c.dim}${"─".repeat(Math.min(50, W - 6))}${c.reset}`, W));
    lines.push(bEmpty(W));
  }

  // Frage
  const qLines = wordWrap(item.question, W - 6);
  for (const ql of qLines) {
    lines.push(bLine(`  ${c.bold}${ql}${c.reset}`, W));
  }
  lines.push(bEmpty(W));

  // Optionen
  if (item.options) {
    const labels = ["A", "B", "C", "D"];
    for (let i = 0; i < item.options.length && i < 4; i++) {
      lines.push(bLine(`  ${c.bold}[${labels[i]}]${c.reset} ${truncate(item.options[i], W - 12)}`, W));
    }
    lines.push(bEmpty(W));
  }

  // Feature 5: Confidence-Phase
  if (screen.phase === "confidence") {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    lines.push(bLine(`  ${c.bold}${c.yellow}Wie sicher bist du bei deiner Antwort?${c.reset}`, W));
    lines.push(bEmpty(W));
    lines.push(bLine(`  ${c.bold}[1]${c.reset} Geraten`, W));
    lines.push(bLine(`  ${c.bold}[2]${c.reset} Unsicher`, W));
    lines.push(bLine(`  ${c.bold}[3]${c.reset} Ziemlich sicher`, W));
    lines.push(bLine(`  ${c.bold}[4]${c.reset} Absolut sicher`, W));
    lines.push(bEmpty(W));
  }

  // Feedback (with calibration comment)
  if (showingFeedback) {
    lines.push(bLine(`  ${c.dim}${"─".repeat(W - 6)}${c.reset}`, W));
    if (feedbackCorrect) {
      lines.push(bLine(`  ${c.green}${c.bold}Richtig!${c.reset}`, W));
    } else {
      lines.push(bLine(`  ${c.red}${c.bold}Falsch.${c.reset}`, W));
    }
    if (feedbackExplanation) {
      const expLines = wordWrap(feedbackExplanation, W - 8);
      for (const el of expLines) {
        lines.push(bLine(`  ${c.dim}${el}${c.reset}`, W));
      }
    }
    // Feature 5: Kalibrierungskommentar
    if (screen.confidence !== undefined) {
      const confident = screen.confidence >= 3;
      const calibration = getConfidenceFeedback(confident, feedbackCorrect);
      lines.push(bEmpty(W));
      lines.push(bLine(`  ${calibration}`, W));
    }
    lines.push(bEmpty(W));
  }

  const footerStart = H - 3;
  while (lines.length < footerStart) lines.push(bEmpty(W));

  if (screen.phase === "confidence") {
    lines.push(...renderFooter([`${c.bold}[1-4]${c.reset} Sicherheit waehlen`]));
  } else if (showingFeedback) {
    lines.push(...renderFooter([`${c.bold}[Enter]${c.reset} Naechste`]));
  } else {
    lines.push(...renderFooter([
      `${c.bold}[A-D]${c.reset} Antworten`,
      `${c.bold}[Q]${c.reset} Abbrechen`,
    ]));
  }
  flushScreen(lines);
}

// ─── Kompetenz-Dashboard ─────────────────────────────────────────────────

function renderCompetenceDashboard(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "competence" }>;
  const offset = screen.scrollOffset;

  lines.push(renderHeader(" Deine Kompetenzen", `${lessons.length} Lektionen `));
  lines.push(boxTop(W));

  const contentLines: string[] = [];
  contentLines.push("");

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const mastery = calculateMastery(i);
    const masteryLabel = masteryBar(mastery);

    contentLines.push(`  ${c.bold}${lesson.number} ${lesson.title}${c.reset}  ${masteryLabel}`);

    // Kompetenzbeschreibungen
    let sectDone = 0;
    for (let s = 0; s < lesson.sections.length; s++) {
      const key = getSectionKey(i, s);
      if (getSectionStatus(key) === "completed") sectDone++;
    }
    const exProg = countExerciseProgress(lesson);
    const quizData = progress.quizzes[lesson.number];

    if (sectDone > 0) {
      contentLines.push(`     ${c.green}\u2713${c.reset} Du kannst: ${sectDone}/${lesson.sections.length} Sektionen gelesen`);
    }
    if (exProg.solved > 0) {
      contentLines.push(`     ${c.green}\u2713${c.reset} Du kannst: ${exProg.solved}/${exProg.total} Exercises geloest`);
    }
    if (quizData) {
      const qPct = Math.round((quizData.score / quizData.total) * 100);
      contentLines.push(`     ${c.green}\u2713${c.reset} Quiz: ${qPct}% erreicht`);
    }

    // Empfehlung
    if (mastery === "newcomer") {
      if (sectDone === 0) {
        contentLines.push(`     ${c.cyan}\u2192${c.reset} Naechstes: Sektion 1 lesen`);
      } else {
        contentLines.push(`     ${c.cyan}\u2192${c.reset} Naechstes: Sektion ${sectDone + 1} lesen`);
      }
    } else if (mastery === "familiar") {
      contentLines.push(`     ${c.cyan}\u2192${c.reset} Naechstes: Exercises bearbeiten`);
    } else if (mastery === "proficient") {
      contentLines.push(`     ${c.cyan}\u2192${c.reset} Naechstes: Quiz oder Misconception-Challenge`);
    } else {
      contentLines.push(`     ${c.green}\u2713${c.reset} Gemeistert!`);
    }
    contentLines.push("");
  }

  // Lernverlauf
  const recentActivity = getRecentActivityValues(7);
  if (recentActivity.some((v) => v > 0)) {
    contentLines.push(` ${sectionDivider("Lernverlauf (letzte 7 Tage)", Math.max(10, W - 6))}`);
    contentLines.push("");
    const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const today = new Date().getDay();
    const startDay = ((today === 0 ? 7 : today) - 6 + 7) % 7;
    const spark = colorSparkline(recentActivity);
    const labelLine = recentActivity
      .map((_, idx) => {
        const dayIdx = (startDay + idx) % 7;
        return dayLabels[dayIdx];
      })
      .join(" ");
    contentLines.push(`  ${spark}`);
    contentLines.push(`  ${c.dim}${labelLine}${c.reset}`);
    contentLines.push("");
  }

  // Interleaved Review Empfehlung
  const completedCount = getCompletedLessonIndices().length;
  if (completedCount >= 3) {
    contentLines.push(`  ${c.yellow}${c.bold}Empfehlung:${c.reset} Du hast ${completedCount} Lektionen abgeschlossen.`);
    contentLines.push(`  ${c.cyan}\u2192 Starte eine Interleaved Review Challenge!${c.reset}`);
    contentLines.push("");
  }

  // Scrollbare Anzeige
  const contentHeight = H - 6;
  const visibleLines = contentLines.slice(offset, offset + contentHeight);

  for (const cl of visibleLines) {
    lines.push(bLine(` ${padR(cl, W - 4)}`, W));
  }

  for (let fill = visibleLines.length; fill < contentHeight; fill++) {
    lines.push(bEmpty(W));
  }

  lines.push(...renderFooter([
    `${c.bold}[\u2191\u2193]${c.reset} Scrollen`,
    `${c.bold}[\u2190/Esc]${c.reset} Zurueck`,
  ]));
  flushScreen(lines);
}

// ─── Exercise-Menue Screen ──────────────────────────────────────────────

function renderExerciseMenu(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "exercisemenu" }>;
  const { lessonIndex, selectedIndex } = screen;
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  const exProgress = countExerciseProgress(lesson);
  const mcCount = loadMisconceptions(lessonIndex).length;
  const cpCount = loadCompletionProblems(lessonIndex).length;

  lines.push(renderHeader(
    ` Exercises: Lektion ${lesson.number}`,
    `${lesson.title} `
  ));
  lines.push(boxTop(W));
  lines.push(bEmpty(W));
  lines.push(bLine(`  ${c.bold}${c.cyan}Waehle deine Stufe:${c.reset}`, W));
  lines.push(bEmpty(W));

  // Stufe 1: Worked Examples
  const s1Marker = selectedIndex === 0 ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  lines.push(bLine(`  ${s1Marker} ${c.bold}[1]${c.reset} Worked Examples      ${c.dim}— Lesen & Nachvollziehen${c.reset}`, W));
  lines.push(bLine(`       ${c.dim}(Empfohlen wenn du die Theorie gerade gelesen hast)${c.reset}`, W));
  lines.push(bEmpty(W));

  // Stufe 2: Completion Problems
  const s2Marker = selectedIndex === 1 ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  const cpStatus = cpCount > 0 ? `${c.dim}${cpCount} verfuegbar${c.reset}` : `${c.dim}noch nicht verfuegbar${c.reset}`;
  lines.push(bLine(`  ${s2Marker} ${c.bold}[2]${c.reset} Completion Problems  ${c.dim}— Luecken fuellen${c.reset}      ${cpStatus}`, W));
  lines.push(bLine(`       ${c.dim}(Der naechste Schritt nach Worked Examples)${c.reset}`, W));
  lines.push(bEmpty(W));

  // Stufe 3: Full Exercises
  const s3Marker = selectedIndex === 2 ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  const exStatus = exProgress.total > 0
    ? `${exProgress.solved}/${exProgress.total}`
    : `${c.dim}keine${c.reset}`;
  lines.push(bLine(`  ${s3Marker} ${c.bold}[3]${c.reset} Full Exercises       ${c.dim}— Selbst schreiben${c.reset}     ${exStatus}`, W));
  lines.push(bLine(`       ${c.dim}(Starte den Watch-Runner in VS Code)${c.reset}`, W));
  lines.push(bEmpty(W));

  // Stufe 4: Misconceptions
  const s4Marker = selectedIndex === 3 ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
  const mcStatus = mcCount > 0 ? `${c.dim}${mcCount} verfuegbar${c.reset}` : `${c.dim}noch nicht verfuegbar${c.reset}`;
  lines.push(bLine(`  ${s4Marker} ${c.bold}[4]${c.reset} Misconceptions       ${c.dim}— Fallen erkennen${c.reset}     ${mcStatus}`, W));
  lines.push(bLine(`       ${c.dim}(Teste dein Verstaendnis mit subtilen Fehlern)${c.reset}`, W));

  lines.push(bEmpty(W));

  const footerStart = H - 3;
  while (lines.length < footerStart) lines.push(bEmpty(W));

  lines.push(...renderFooter([
    `${c.bold}[1-4]${c.reset} Stufe waehlen`,
    `${c.bold}[\u2191\u2193]${c.reset} Navigieren`,
    `${c.bold}[Enter]${c.reset} Oeffnen`,
    `${c.bold}[\u2190/Esc]${c.reset} Zurueck`,
  ]));
  flushScreen(lines);
}

// ─── Word-Wrap Hilfsfunktion ─────────────────────────────────────────────

function wordWrap(text: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (stripAnsi(current).length === 0) {
      current = word;
    } else if (stripAnsi(current).length + 1 + stripAnsi(word).length <= maxWidth) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);
  if (lines.length === 0) lines.push("");
  return lines;
}

// ─── Statistiken (legacy — jetzt Kompetenz-Dashboard) ────────────────────

function renderStats(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as { type: "stats"; scrollOffset: number };
  const offset = screen.scrollOffset;

  lines.push(
    renderHeader(
      " Statistiken",
      `${lessons.length} Lektionen `
    )
  );
  lines.push(boxTop(W));
  lines.push(bEmpty(W));

  const contentLines: string[] = [];

  // Lernverlauf Sparkline (7 Tage)
  const recentActivity = getRecentActivityValues(7);
  const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const today = new Date().getDay();
  const startDay = ((today === 0 ? 7 : today) - 6 + 7) % 7;

  contentLines.push(
    ` ${sectionDivider("Lernverlauf (7 Tage)", Math.max(10, W - 6))}`
  );
  contentLines.push("");

  if (recentActivity.some((v) => v > 0)) {
    const spark = colorSparkline(recentActivity);
    const labelLine = recentActivity
      .map((_, idx) => {
        const dayIdx = (startDay + idx) % 7;
        return dayLabels[dayIdx];
      })
      .join(" ");
    contentLines.push(`  ${spark}`);
    contentLines.push(`  ${c.dim}${labelLine}${c.reset}`);
  } else {
    contentLines.push(`  ${c.dim}Noch keine Aktivitaeten aufgezeichnet${c.reset}`);
  }
  contentLines.push("");

  contentLines.push(
    ` ${sectionDivider("Fortschritt pro Lektion", Math.max(10, W - 6))}`
  );
  contentLines.push("");

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const mastery = calculateMastery(i);

    contentLines.push(
      `  ${c.bold}${lesson.number} ${lesson.title}${c.reset}  ${masteryBar(mastery)}`
    );

    let sectDone = 0;
    for (let s = 0; s < lesson.sections.length; s++) {
      const key = getSectionKey(i, s);
      if (getSectionStatus(key) === "completed") sectDone++;
    }

    const barWidth = Math.max(8, Math.floor((W - 50) / 2));
    const sectPct = lesson.sections.length > 0 ? Math.round((sectDone / lesson.sections.length) * 100) : 0;
    const exProg = countExerciseProgress(lesson);
    const exPct = exProg.total > 0 ? Math.round((exProg.solved / exProg.total) * 100) : 0;
    contentLines.push(
      `     Sektionen:  ${fineProgressBar(sectPct, barWidth)} ${sectDone}/${lesson.sections.length}   Exercises: ${fineProgressBar(exPct, barWidth)} ${exProg.solved}/${exProg.total}`
    );

    if (lesson.hasQuiz) {
      const quizData = progress.quizzes[lesson.number];
      const quizText = quizData
        ? `${quizData.score}/${quizData.total} (${Math.round((quizData.score / quizData.total) * 100)}%)`
        : `${c.dim}---${c.reset}`;
      contentLines.push(`     Quiz: ${quizText}`);
    }

    contentLines.push("");
  }

  // Review-Statistik
  contentLines.push(
    ` ${sectionDivider("Review-Statistik", Math.max(10, W - 6))}`
  );
  contentLines.push("");

  const dueCount = getDueReviewCount();
  const streak = getReviewStreak();
  contentLines.push(
    `  ${c.bold}Faellige Fragen:${c.reset}  ${c.yellow}${dueCount}${c.reset}   ${c.bold}Reviews:${c.reset} ${c.green}${streak} gesamt${c.reset}`
  );
  contentLines.push("");

  // Scrollbare Anzeige
  const contentHeight = H - 6;
  const visibleLines = contentLines.slice(
    offset,
    offset + contentHeight
  );

  for (const cl of visibleLines) {
    lines.push(bLine(` ${padR(cl, W - 4)}`, W));
  }

  for (let fill = visibleLines.length; fill < contentHeight; fill++) {
    lines.push(bEmpty(W));
  }

  const canScrollDown = offset + contentHeight < contentLines.length;
  const canScrollUp = offset > 0;

  const footerShortcuts: string[] = [];
  if (canScrollUp || canScrollDown) {
    footerShortcuts.push(`${c.bold}[\u2191\u2193]${c.reset} Scrollen`);
  }
  footerShortcuts.push(`${c.bold}[\u2190/Esc]${c.reset} Zurueck`);

  lines.push(...renderFooter(footerShortcuts));
  flushScreen(lines);
}

// ─── Suche (Feature 4) ────────────────────────────────────────────────────

/** Durchsucht alle Section-Dateien nach einem Suchbegriff */
function performSearch(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  for (let li = 0; li < lessons.length; li++) {
    const lesson = lessons[li];
    for (let si = 0; si < lesson.sections.length; si++) {
      const section = lesson.sections[si];
      try {
        const content = fs.readFileSync(section.filePath, "utf-8");
        const contentLines = content.split("\n");

        for (let lineIdx = 0; lineIdx < contentLines.length; lineIdx++) {
          const line = contentLines[lineIdx];
          if (line.toLowerCase().includes(lowerQuery)) {
            // Kontext-Zeile bereinigen
            const cleanLine = line
              .replace(/^#+\s*/, "")
              .replace(/\*\*/g, "")
              .replace(/`/g, "")
              .trim();
            if (cleanLine.length < 3) continue;

            // Nur maximal 3 Treffer pro Sektion
            const existingForSection = results.filter(
              (r) => r.lessonIndex === li && r.sectionIndex === si
            );
            if (existingForSection.length >= 3) continue;

            results.push({
              lessonIndex: li,
              sectionIndex: si,
              lessonNumber: lesson.number,
              sectionNumber: si + 1,
              sectionTitle: section.title,
              contextLine: cleanLine.length > 70
                ? cleanLine.slice(0, 67) + "..."
                : cleanLine,
              lineNumber: lineIdx,
            });
          }
        }
      } catch {
        // Datei nicht lesbar
      }
    }
  }

  return results.slice(0, 50); // Max 50 Ergebnisse
}

function renderSearchScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as {
    type: "search";
    query: string;
    results: SearchResult[];
    selectedResult: number;
  };

  // Header
  lines.push(
    renderHeader(
      " Suche",
      `[Esc] Abbrechen `
    )
  );
  lines.push(boxTop(W));
  lines.push(bEmpty(W));

  // Suchfeld
  const queryDisplay = screen.query + "\u2588"; // Block-Cursor
  lines.push(
    bLine(
      `  ${c.bold}Suchbegriff:${c.reset} ${c.cyan}${queryDisplay}${c.reset}`,
      W
    )
  );
  lines.push(bEmpty(W));

  // Ergebnisse
  if (screen.query.length < 2) {
    lines.push(
      bLine(
        `  ${c.dim}Mindestens 2 Zeichen eingeben...${c.reset}`,
        W
      )
    );
  } else if (screen.results.length === 0) {
    lines.push(
      bLine(
        `  ${c.dim}Keine Treffer gefunden.${c.reset}`,
        W
      )
    );
  } else {
    lines.push(
      bLine(
        `  ${c.bold}Ergebnisse (${screen.results.length} Treffer):${c.reset}`,
        W
      )
    );
    lines.push(bEmpty(W));

    // Sichtbare Ergebnisse berechnen (mit Scrolling)
    const resultAreaHeight = H - 12; // Header, search field, footer etc.
    const visibleResults = Math.max(1, Math.floor(resultAreaHeight / 3));
    const startIdx = Math.max(
      0,
      Math.min(
        screen.selectedResult - Math.floor(visibleResults / 2),
        screen.results.length - visibleResults
      )
    );

    for (
      let i = startIdx;
      i < Math.min(startIdx + visibleResults, screen.results.length);
      i++
    ) {
      const result = screen.results[i];
      const isSelected = i === screen.selectedResult;
      const marker = isSelected
        ? `${c.cyan}${c.bold}\u25B8${c.reset}`
        : " ";
      const title = `L${result.lessonNumber} S${result.sectionNumber}: ${truncate(result.sectionTitle, W - 20)}`;
      lines.push(
        bLine(
          `  ${marker} ${isSelected ? c.bold : ""}${title}${c.reset}`,
          W
        )
      );
      lines.push(
        bLine(
          `    ${c.dim}"...${truncate(result.contextLine, W - 12)}..."${c.reset}`,
          W
        )
      );
      lines.push(bEmpty(W));
    }
  }

  // Auffuellen bis Footer
  const footerStart = H - 3;
  while (lines.length < footerStart) {
    lines.push(bEmpty(W));
  }

  // Footer
  lines.push(
    ...renderFooter([
      `${c.bold}[\u2191\u2193]${c.reset} Navigieren`,
      `${c.bold}[Enter]${c.reset} Oeffnen`,
      `${c.bold}[Esc]${c.reset} Zurueck`,
    ])
  );
  flushScreen(lines);
}

// ─── Lesezeichen-Screen (Feature 5) ──────────────────────────────────────

function renderBookmarksScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as { type: "bookmarks"; selectedIndex: number };

  lines.push(
    renderHeader(
      " Lesezeichen",
      `${progress.bookmarks.length} gespeichert `
    )
  );
  lines.push(boxTop(W));
  lines.push(bEmpty(W));

  if (progress.bookmarks.length === 0) {
    lines.push(
      bLine(
        `  ${c.dim}Keine Lesezeichen vorhanden.${c.reset}`,
        W
      )
    );
    lines.push(bEmpty(W));
    lines.push(
      bLine(
        `  ${c.dim}Druecke [M] im Section-Reader um ein Lesezeichen zu setzen.${c.reset}`,
        W
      )
    );
  } else {
    lines.push(
      bLine(`  ${c.bold}${c.cyan}Lesezeichen:${c.reset}`, W)
    );
    lines.push(bEmpty(W));

    for (let i = 0; i < progress.bookmarks.length; i++) {
      const bm = progress.bookmarks[i];
      const isSelected = i === screen.selectedIndex;
      const marker = isSelected
        ? `${c.cyan}${c.bold}\u25B8${c.reset}`
        : " ";

      const lesson = lessons[bm.lessonIndex];
      const section = lesson?.sections[bm.sectionIndex];
      const title = section
        ? `L${lesson.number} S${bm.sectionIndex + 1}: ${truncate(section.title, W - 40)}`
        : `L?? S${bm.sectionIndex + 1}`;

      const dateStr = bm.created
        ? new Date(bm.created).toLocaleDateString("de-DE")
        : "";
      const noteStr = bm.note ? ` ${c.dim}— ${bm.note}${c.reset}` : "";
      const scrollInfo = `${c.dim}(Zeile ${bm.scrollOffset + 1})${c.reset}`;

      lines.push(
        bLine(
          `  ${marker} ${isSelected ? c.bold : ""}${title}${c.reset} ${scrollInfo}  ${c.dim}${dateStr}${c.reset}${noteStr}`,
          W
        )
      );
    }
  }

  // Auffuellen bis Footer
  const footerStart = H - 3;
  while (lines.length < footerStart) {
    lines.push(bEmpty(W));
  }

  const shortcuts: string[] = [
    `${c.bold}[\u2191\u2193]${c.reset} Navigieren`,
    `${c.bold}[Enter]${c.reset} Oeffnen`,
    `${c.bold}[X]${c.reset} Loeschen`,
    `${c.bold}[Esc]${c.reset} Zurueck`,
  ];
  lines.push(...renderFooter(shortcuts));
  flushScreen(lines);
}

// ─── Mermaid-Diagramm im Browser ──────────────────────────────────────────

function openMermaidDiagram(mermaidCode: string): void {
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>TypeScript Deep Learning — Diagramm</title>
  <style>
    body {
      background: #1e1e2e;
      color: #cdd6f4;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      font-family: system-ui, sans-serif;
    }
    .mermaid {
      max-width: 90vw;
    }
    h3 {
      text-align: center;
      color: #89b4fa;
      margin-top: 2rem;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
  <div>
    <h3>TypeScript Deep Learning — Diagramm</h3>
    <pre class="mermaid">
${mermaidCode}
    </pre>
  </div>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
  </script>
</body>
</html>`;

  const tmpFile = path.join(os.tmpdir(), "ts-learn-diagram.html");
  fs.writeFileSync(tmpFile, html, "utf-8");

  const openCmd =
    process.platform === "win32"
      ? `start "" "${tmpFile}"`
      : process.platform === "darwin"
        ? `open "${tmpFile}"`
        : `xdg-open "${tmpFile}"`;

  exec(openCmd, (err) => {
    // Fehler ignorieren — Browser oeffnet sich im Hintergrund
  });
}

// ─── VS Code Integration (Feature 3) ──────────────────────────────────────

function openInVSCode(targetPath: string): void {
  exec(`code "${targetPath}"`, () => {});
}

// ─── Child-Process Runner ──────────────────────────────────────────────────

function runChildProcess(
  command: string,
  args: string[],
  onExit: () => void
): void {
  // Alternate Screen verlassen fuer Child-Process
  if (isInAltScreen) {
    process.stdout.write(DISABLE_MOUSE);
    process.stdout.write(LEAVE_ALT_SCREEN);
    process.stdout.write(SHOW_CURSOR);
    isInAltScreen = false;
  }

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();

  const tsxPath = path.join(PLATFORM_ROOT, "node_modules", ".bin", "tsx");
  const child = spawn(tsxPath, [command, ...args], {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", () => {
    setTimeout(() => {
      process.stdout.write(ENTER_ALT_SCREEN);
      process.stdout.write(HIDE_CURSOR);
      process.stdout.write(ENABLE_MOUSE);
      isInAltScreen = true;

      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      onExit();
    }, 100);
  });

  child.on("error", (err) => {
    process.stderr.write(
      `\n${c.red}Fehler beim Starten: ${err.message}${c.reset}\n`
    );
    setTimeout(() => {
      process.stdout.write(ENTER_ALT_SCREEN);
      process.stdout.write(HIDE_CURSOR);
      process.stdout.write(ENABLE_MOUSE);
      isInAltScreen = true;

      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      onExit();
    }, 2000);
  });
}

// ─── Tastatur-Eingabe ──────────────────────────────────────────────────────

interface ParsedKey {
  name: string;
  raw: string;
  ctrl: boolean;
}

function parseKey(data: Buffer): ParsedKey {
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
    // Parse SGR mouse protocol
    const seq = raw.slice(3); // after ESC [ <
    const match = seq.match(/^(\d+);(\d+);(\d+)([Mm])$/);
    if (match) {
      const button = parseInt(match[1], 10);
      // const cx = parseInt(match[2], 10);
      // const cy = parseInt(match[3], 10);
      const isRelease = match[4] === "m";

      // Scroll wheel: button 64 = scroll up, button 65 = scroll down
      if (button === 64 && !isRelease) return { name: "mouse-scroll-up", raw, ctrl: false };
      if (button === 65 && !isRelease) return { name: "mouse-scroll-down", raw, ctrl: false };
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
        // Page Up: ESC [ 5 ~
        if (data[3] === 0x7e)
          return { name: "pageup", raw, ctrl: false };
        break;
      case 0x36:
        // Page Down: ESC [ 6 ~
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

function handleInput(data: Buffer): void {
  const key = parseKey(data);

  // Ctrl+C: Beenden
  if (key.name === "ctrl-c") {
    exitTui();
    return;
  }

  // ─── Feature 1: Globaler Help-Shortcut (F1 immer, ? kontextabhaengig) ───
  // F1 funktioniert in jedem Screen (ausser help und search/completion typing)
  if (key.name === "f1" && currentScreen.type !== "help") {
    if (currentScreen.type === "section") stopTTS();
    currentScreen = { type: "help", previousScreen: JSON.parse(JSON.stringify(currentScreen)) };
    renderHelpOverlay();
    return;
  }
  // ? nur in Screens wo es nicht anderweitig belegt ist
  // Belegt: pretest (= "Ich weiss es nicht"), selfexplain (= Kernpunkte), search (= Zeichen), completion (= Zeichen)
  if (
    key.name === "?" &&
    currentScreen.type !== "help" &&
    currentScreen.type !== "pretest" &&
    currentScreen.type !== "selfexplain" &&
    currentScreen.type !== "search" &&
    currentScreen.type !== "completion"
  ) {
    if (currentScreen.type === "section") stopTTS();
    currentScreen = { type: "help", previousScreen: JSON.parse(JSON.stringify(currentScreen)) };
    renderHelpOverlay();
    return;
  }

  // ─── Feature 4: Globaler History-Shortcut (Alt+Left) ───────────────────
  if (key.name === "alt-left" && currentScreen.type !== "help" && currentScreen.type !== "history") {
    if (currentScreen.type === "section") stopTTS();
    currentScreen = { type: "history", selectedIndex: 0 };
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

// ─── Feature 2: Breadcrumbs ──────────────────────────────────────────────

function getBreadcrumb(screen: Screen): string {
  switch (screen.type) {
    case "platform":
      return "Kursauswahl";
    case "courseinfo": {
      const co = platformConfig.courses.find(c2 => c2.id === screen.courseId);
      return `Kursauswahl > ${co?.name ?? screen.courseId}`;
    }
    case "main": {
      const activeCo = platformConfig.courses.find(c2 => c2.id === platformConfig.activeCourse);
      return activeCo ? `${activeCo.icon} ${activeCo.name}` : "Hauptmenue";
    }
    case "lesson": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"}`;
    }
    case "section": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > S${screen.sectionIndex + 1}`;
    }
    case "cheatsheet": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > Cheatsheet`;
    }
    case "pretest": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > Pre-Test`;
    }
    case "warmup":
      return "Warm-Up";
    case "misconceptions": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > Misconceptions`;
    }
    case "completion": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > Completion`;
    }
    case "interleaved":
      return "Interleaved Review";
    case "hints": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > Hints`;
    }
    case "exercisemenu": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > Exercises`;
    }
    case "selfexplain": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > Erklaerung`;
    }
    case "search":
      return "Suche";
    case "bookmarks":
      return "Lesezeichen";
    case "stats":
      return "Statistiken";
    case "competence":
      return "Kompetenzen";
    case "help":
      return "Tastenbelegung";
    case "history":
      return "Letzte Stellen";
  }
}

// ─── Feature 1: Help Overlay Rendering ───────────────────────────────────

function renderHelpOverlay(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "help" }>;
  const prevScreenType = screen.previousScreen.type;

  const timerStr = formatSessionTime();
  lines.push(renderHeader(` Tastenbelegung`, `\u23F1 ${timerStr} `));

  const boxW = Math.min(W, 62);
  const innerW = boxW - 2;
  const leftPad = Math.max(0, Math.floor((W - boxW) / 2));
  const padStr = " ".repeat(leftPad);

  lines.push(`${padStr}${boxTop(boxW)}`);
  lines.push(`${padStr}${bEmpty(boxW)}`);

  // Shortcuts fuer den vorherigen Screen holen
  const shortcuts = shortcutsForScreen[prevScreenType] ?? shortcutsForScreen["main"]!;

  // Gruppierung: Navigation, Aktionen, Global
  const navKeys = shortcuts.filter(s =>
    ["\u2191 / \u2193", "Enter / \u2192", "Esc / \u2190", "\u2192", "\u2190", "Space / PgDn", "PgUp",
     "Home / End", "\u2191 / \u2193", "\u2190 / \u2192", "Enter"].some(k => s.key.includes(k) || s.key === k)
    && !s.desc.includes("Beenden") && !s.desc.includes("Hilfe") && !s.desc.includes("Tastenbelegung")
  );
  const globalKeys = shortcuts.filter(s =>
    s.desc.includes("Beenden") || s.desc.includes("Hilfe") || s.desc.includes("Tastenbelegung")
  );
  const actionKeys = shortcuts.filter(s => !navKeys.includes(s) && !globalKeys.includes(s));

  const renderGroup = (title: string, items: { key: string; desc: string }[]): void => {
    if (items.length === 0) return;
    lines.push(`${padStr}${bLine(`  ${c.bold}${c.cyan}${title}${c.reset}`, boxW)}`);
    lines.push(`${padStr}${bLine(`  ${c.dim}${"─".repeat(Math.min(innerW - 4, title.length + 10))}${c.reset}`, boxW)}`);
    for (const s of items) {
      const keyPad = 14;
      const keyStr = padR(`  ${c.bold}${s.key}${c.reset}`, keyPad + 9); // +9 for ANSI
      lines.push(`${padStr}${bLine(`${keyStr}${s.desc}`, boxW)}`);
    }
    lines.push(`${padStr}${bEmpty(boxW)}`);
  };

  renderGroup("Navigation", navKeys);
  renderGroup(`Aktionen (${prevScreenType === "main" ? "Hauptmenue" : prevScreenType === "lesson" ? "Lektionsmenue" : prevScreenType})`, actionKeys);
  renderGroup("Global", globalKeys);

  lines.push(`${padStr}${boxSep(boxW)}`);
  lines.push(`${padStr}${bLine(`  ${c.dim}Druecke eine beliebige Taste um zurueckzukehren${c.reset}`, boxW)}`);
  lines.push(`${padStr}${boxBottom(boxW)}`);

  // Auffuellen
  while (lines.length < H) {
    lines.push("");
  }

  flushScreen(lines);
}

function handleHelpInput(_key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "help" }>;
  // Jede Taste kehrt zurueck
  currentScreen = screen.previousScreen;
  redraw();
}

// ─── Feature 4: History Screen ───────────────────────────────────────────

function getHistoryLabel(screen: Screen): string {
  switch (screen.type) {
    case "main":
      return "Hauptmenue";
    case "lesson": {
      const l = lessons[screen.lessonIndex];
      return `L${l?.number ?? "?"} > Lektionsmenue`;
    }
    case "section": {
      const l = lessons[screen.lessonIndex];
      const sec = l?.sections[screen.sectionIndex];
      return `L${l?.number ?? "?"} > Sektion ${screen.sectionIndex + 1}: ${sec?.title ?? "?"}`;
    }
    case "cheatsheet": {
      const l = lessons[screen.lessonIndex];
      return `L${l?.number ?? "?"} > Cheatsheet`;
    }
    case "pretest": {
      const l = lessons[screen.lessonIndex];
      return `L${l?.number ?? "?"} > Pre-Test`;
    }
    case "warmup":
      return "Warm-Up";
    case "misconceptions": {
      const l = lessons[screen.lessonIndex];
      return `L${l?.number ?? "?"} > Misconceptions`;
    }
    case "exercisemenu": {
      const l = lessons[screen.lessonIndex];
      return `L${l?.number ?? "?"} > Exercises`;
    }
    case "interleaved":
      return "Interleaved Review";
    case "search":
      return "Suche";
    case "bookmarks":
      return "Lesezeichen";
    case "competence":
      return "Kompetenzen";
    case "stats":
      return "Statistiken";
    default:
      return screen.type;
  }
}

function renderHistoryScreen(): void {
  updateTermSize();
  const lines: string[] = [];

  const timerStr = formatSessionTime();
  lines.push(renderHeader(` Letzte Stellen`, `\u23F1 ${timerStr} `));
  lines.push(boxTop(W));
  lines.push(bEmpty(W));

  const screen = currentScreen as Extract<Screen, { type: "history" }>;

  if (navigationHistory.length === 0) {
    lines.push(bLine(`  ${c.dim}Noch keine Navigation aufgezeichnet.${c.reset}`, W));
  } else {
    // Von neuest zu aeltestem anzeigen
    const reversed = [...navigationHistory].reverse();
    for (let i = 0; i < reversed.length; i++) {
      const entry = reversed[i];
      const isSelected = i === screen.selectedIndex;
      const marker = isSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
      const label = getHistoryLabel(entry);
      const style = isSelected ? c.bold : "";
      lines.push(bLine(`  ${marker} ${style}${truncate(label, W - 8)}${c.reset}`, W));
    }
  }

  lines.push(bEmpty(W));

  const footerStart = H - 3;
  while (lines.length < footerStart) lines.push(bEmpty(W));

  lines.push(...renderFooter([
    `${c.bold}[\u2191\u2193]${c.reset} Navigieren`,
    `${c.bold}[Enter]${c.reset} Oeffnen`,
    `${c.bold}[Esc]${c.reset} Zurueck`,
  ]));
  flushScreen(lines);
}

function handleHistoryInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "history" }>;
  const reversed = [...navigationHistory].reverse();

  if (key.name === "up") {
    screen.selectedIndex = Math.max(0, screen.selectedIndex - 1);
    renderHistoryScreen();
    return;
  }
  if (key.name === "down") {
    screen.selectedIndex = Math.min(reversed.length - 1, screen.selectedIndex + 1);
    renderHistoryScreen();
    return;
  }
  if (key.name === "enter") {
    if (reversed.length > 0 && screen.selectedIndex < reversed.length) {
      const target = JSON.parse(JSON.stringify(reversed[screen.selectedIndex])) as Screen;
      // Bei Section-Screens muessen wir die Daten neu laden
      if (target.type === "section") {
        openSection(target.lessonIndex, target.sectionIndex, target.scrollOffset);
        return;
      }
      // Bei Cheatsheet laden
      if (target.type === "cheatsheet") {
        openCheatsheet(target.lessonIndex);
        return;
      }
      // Sonstige Screens
      currentScreen = target;
      redraw();
    }
    return;
  }
  if (key.name === "escape" || key.name === "backspace" || key.name === "q") {
    currentScreen = { type: "main", selectedIndex: 0 };
    renderMainMenu();
    return;
  }
}

// ─── Feature 5: Metacognitive Confidence Feedback ────────────────────────

function getConfidenceFeedback(confident: boolean, correct: boolean): string {
  if (confident && correct) {
    return `${c.green}Gut kalibriert! Du weisst was du weisst.${c.reset}`;
  }
  if (confident && !correct) {
    return `${c.yellow}\u26A0 Achtung: Du warst dir sicher, aber lagst falsch. Dieses Konzept solltest du vertiefen.${c.reset}`;
  }
  if (!confident && correct) {
    return `${c.cyan}Mehr Vertrauen! Du weisst mehr als du denkst.${c.reset}`;
  }
  // unsicher + falsch
  return `${c.dim}Kein Problem — du wusstest dass du unsicher warst. Das ist gute Selbsteinschaetzung.${c.reset}`;
}

// ─── Platform Input ──────────────────────────────────────────────────────

function handlePlatformInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "platform" }>;
  const maxIdx = platformConfig.courses.length - 1;
  const mode = getLayoutMode();

  // Bestaetigungsdialog fuer gesperrten Kurs
  if (screen.confirmUnlock) {
    if (key.name === "j" || key.name === "y") {
      // Trotzdem oeffnen
      screen.confirmUnlock = false;
      const course = platformConfig.courses[screen.selectedIndex];
      if (course) {
        openCourseFromPlatform(course);
      }
      return;
    }
    if (key.name === "n" || key.name === "escape") {
      screen.confirmUnlock = false;
      renderPlatformScreen();
      return;
    }
    return; // Andere Tasten ignorieren im Dialog
  }

  // ── Navigation: Layout-abhaengig ──
  if (mode === "grid-2x2") {
    // Grid-Navigation: Pfeiltasten in 4 Richtungen
    // Layout:  0  1
    //          2  3
    //          4  (5, falls vorhanden)
    const pos = gridPosition(screen.selectedIndex);
    const cols = 2;
    const rows = Math.ceil(platformConfig.courses.length / cols);

    if (key.name === "up") {
      if (pos.row > 0) {
        const newIdx = (pos.row - 1) * cols + pos.col;
        if (newIdx <= maxIdx) {
          screen.selectedIndex = newIdx;
          // Scroll nach oben wenn noetig
          if (screen.scrollOffset > 0) {
            screen.scrollOffset = Math.max(0, screen.scrollOffset - 6);
          }
        }
      }
      renderPlatformScreen();
      return;
    }
    if (key.name === "down") {
      if (pos.row < rows - 1) {
        const newIdx = (pos.row + 1) * cols + pos.col;
        if (newIdx <= maxIdx) {
          screen.selectedIndex = newIdx;
          // Scroll nach unten wenn noetig
          const contentHeight = H - 5;
          if (platformContentTotalLines > contentHeight) {
            const maxScroll = Math.max(0, platformContentTotalLines - contentHeight);
            screen.scrollOffset = Math.min(maxScroll, screen.scrollOffset + 6);
          }
        }
      }
      renderPlatformScreen();
      return;
    }
    if (key.name === "left") {
      if (pos.col > 0) {
        const newIdx = pos.row * cols + (pos.col - 1);
        if (newIdx >= 0 && newIdx <= maxIdx) {
          screen.selectedIndex = newIdx;
        }
      }
      renderPlatformScreen();
      return;
    }
    if (key.name === "right") {
      if (pos.col < cols - 1) {
        const newIdx = pos.row * cols + (pos.col + 1);
        if (newIdx <= maxIdx) {
          screen.selectedIndex = newIdx;
        }
      }
      renderPlatformScreen();
      return;
    }
  } else {
    // 1-Spalte und Ultra-Kompakt: Nur vertikal
    if (key.name === "up") {
      screen.selectedIndex = Math.max(0, screen.selectedIndex - 1);
      if (screen.scrollOffset > 0) {
        screen.scrollOffset = Math.max(0, screen.scrollOffset - 4);
      }
      renderPlatformScreen();
      return;
    }
    if (key.name === "down") {
      screen.selectedIndex = Math.min(maxIdx, screen.selectedIndex + 1);
      const contentHeight = H - 5;
      if (platformContentTotalLines > contentHeight) {
        const maxScroll = Math.max(0, platformContentTotalLines - contentHeight);
        screen.scrollOffset = Math.min(maxScroll, screen.scrollOffset + 4);
      }
      renderPlatformScreen();
      return;
    }
  }

  // Page Up / Page Down fuer schnelles Scrollen
  if (key.name === "pageup") {
    screen.scrollOffset = Math.max(0, screen.scrollOffset - (H - 8));
    renderPlatformScreen();
    return;
  }
  if (key.name === "pagedown") {
    const contentHeight = H - 5;
    const maxScroll = Math.max(0, platformContentTotalLines - contentHeight);
    screen.scrollOffset = Math.min(maxScroll, screen.scrollOffset + (H - 8));
    renderPlatformScreen();
    return;
  }

  // Enter: Kurs oeffnen (right-Taste nur oeffnen wenn NICHT im Grid-Modus)
  if (key.name === "enter" || (key.name === "right" && mode !== "grid-2x2")) {
    const course = platformConfig.courses[screen.selectedIndex];
    if (!course) return;

    // Pruefen ob gesperrt
    if (!isCourseUnlocked(course)) {
      screen.confirmUnlock = true;
      renderPlatformScreen();
      return;
    }

    openCourseFromPlatform(course);
    return;
  }

  if (key.name === "q") {
    exitTui();
    return;
  }
}

/** Hilfsfunktion: Kurs vom Platform-Screen aus oeffnen */
function openCourseFromPlatform(course: PlatformCourse): void {
  // Zum Kurs wechseln
  switchToCourse(course.id);

  // Pruefen ob Lektionen vorhanden sind
  if (lessons.length === 0) {
    // Kein Lektionen — CourseInfo anzeigen
    courseInfoRenderedLines = [];
    currentScreen = { type: "courseinfo", courseId: course.id, scrollOffset: 0, totalLines: 0 };
    renderCourseInfoScreen();
    return;
  }

  // Warm-Up Check (wie in main())
  const completedForWarmup = getCompletedLessonIndices();
  if (completedForWarmup.length > 0 && !warmupShownThisSession) {
    warmupShownThisSession = true;
    const warmupQs = getWarmUpQuestions(PROJECT_ROOT, completedForWarmup, 3);
    if (warmupQs.length > 0) {
      currentScreen = {
        type: "warmup",
        questions: warmupQs,
        currentIndex: 0,
        answers: [],
        showingFeedback: false,
        feedbackCorrect: false,
        feedbackExplanation: "",
        done: false,
      };
      renderWarmup();
      return;
    }
  }

  // Kurs-Hauptmenue anzeigen
  const startIdx = hasResumeTarget() ? -1 : 0;
  currentScreen = { type: "main", selectedIndex: startIdx };
  renderMainMenu();
}

// ─── CourseInfo Input ────────────────────────────────────────────────────

function handleCourseInfoInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "courseinfo" }>;

  // Zurueck zur Kursauswahl
  if (key.name === "escape" || key.name === "left" || key.name === "backspace") {
    // Wenn im Curriculum-Reader, zurueck zur Info-Ansicht
    if (courseInfoRenderedLines.length > 0) {
      courseInfoRenderedLines = [];
      screen.scrollOffset = 0;
      screen.totalLines = 0;
      renderCourseInfoScreen();
      return;
    }
    // Zurueck zur Platform
    courseProgressCache.clear();
    const courseIdx = platformConfig.courses.findIndex(co => co.id === screen.courseId);
    currentScreen = { type: "platform", selectedIndex: Math.max(0, courseIdx), scrollOffset: 0 };
    renderPlatformScreen();
    return;
  }

  // Curriculum anzeigen
  if (key.name === "c" && courseInfoRenderedLines.length === 0) {
    const course = platformConfig.courses.find(co => co.id === screen.courseId);
    if (course) {
      const curriculumPath = path.join(COURSES_ROOT, course.directory, "CURRICULUM.md");
      if (fs.existsSync(curriculumPath)) {
        const content = fs.readFileSync(curriculumPath, "utf-8");
        updateTermSize();
        const renderWidth = Math.max(30, W - 6);
        courseInfoRenderedLines = renderMarkdown(content, renderWidth);
        screen.totalLines = courseInfoRenderedLines.length;
        screen.scrollOffset = 0;
        renderCourseInfoScreen();
        return;
      }
    }
  }

  // Scrollen (wenn Curriculum angezeigt wird)
  if (courseInfoRenderedLines.length > 0) {
    const contentHeight = getContentHeight();
    if (key.name === "up") {
      screen.scrollOffset = Math.max(0, screen.scrollOffset - 1);
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "down") {
      screen.scrollOffset = clampScrollOffset(screen.scrollOffset + 1, screen.totalLines);
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "space" || key.name === "pagedown") {
      const jump = Math.floor(contentHeight / 2);
      screen.scrollOffset = clampScrollOffset(screen.scrollOffset + jump, screen.totalLines);
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "pageup") {
      const jump = Math.floor(contentHeight / 2);
      screen.scrollOffset = Math.max(0, screen.scrollOffset - jump);
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "home") {
      screen.scrollOffset = 0;
      renderCourseInfoScreen();
      return;
    }
    if (key.name === "end") {
      screen.scrollOffset = clampScrollOffset(screen.totalLines, screen.totalLines);
      renderCourseInfoScreen();
      return;
    }
  }
}

// ─── Main-Menu Input ──────────────────────────────────────────────────────

function handleMainInput(key: ParsedKey): void {
  const screen = currentScreen as { type: "main"; selectedIndex: number };
  const showResume = hasResumeTarget();
  const minIdx = showResume ? -1 : 0; // -1 = Resume-Banner
  const maxIdx = lessons.length; // 0..lessons.length-1 = Lektionen, lessons.length = Review

  // Pfeiltasten
  if (key.name === "up") {
    screen.selectedIndex = Math.max(minIdx, screen.selectedIndex - 1);
    renderMainMenu();
    return;
  }
  if (key.name === "down") {
    screen.selectedIndex = Math.min(maxIdx, screen.selectedIndex + 1);
    renderMainMenu();
    return;
  }

  // Enter oder Pfeil rechts: Auswahl oeffnen
  if (key.name === "enter" || key.name === "right" || key.name === "space") {
    // Resume-Banner
    if (screen.selectedIndex === -1 && showResume) {
      const li = progress.lastLesson;
      const si = progress.lastSection;
      progress.lastScreen = "section";
      saveProgress();
      openSection(li, si, progress.lastScrollOffset);
      return;
    }

    if (screen.selectedIndex >= 0 && screen.selectedIndex < lessons.length) {
      const idx = screen.selectedIndex;
      progress.lastLesson = idx;
      progress.lastScreen = "lesson";
      saveProgress();
      pushHistory({ type: "lesson", lessonIndex: idx, selectedIndex: 0 });
      currentScreen = { type: "lesson", lessonIndex: idx, selectedIndex: 0 };
      renderLessonMenu(idx);
      return;
    }
    if (screen.selectedIndex === lessons.length) {
      startReview();
      return;
    }
  }

  // Zifferntasten 1-9
  const num = parseInt(key.raw, 10);
  if (num >= 1 && num <= lessons.length) {
    progress.lastLesson = num - 1;
    progress.lastScreen = "lesson";
    saveProgress();
    pushHistory({ type: "lesson", lessonIndex: num - 1, selectedIndex: 0 });
    currentScreen = {
      type: "lesson",
      lessonIndex: num - 1,
      selectedIndex: 0,
    };
    renderLessonMenu(num - 1);
    return;
  }

  // Shortcuts
  if (key.name === "r") {
    startReview();
    return;
  }

  if (key.name === "s") {
    pushHistory({ type: "competence", scrollOffset: 0 });
    currentScreen = { type: "competence", scrollOffset: 0 };
    renderCompetenceDashboard();
    return;
  }

  // Kompetenzen (alias)
  if (key.name === "k") {
    pushHistory({ type: "competence", scrollOffset: 0 });
    currentScreen = { type: "competence", scrollOffset: 0 };
    renderCompetenceDashboard();
    return;
  }

  // Interleaved Review
  if (key.name === "i") {
    startInterleavedReview();
    return;
  }

  // Suche (Feature 4)
  if (key.name === "/") {
    currentScreen = { type: "search", query: "", results: [], selectedResult: 0 };
    process.stdout.write(SHOW_CURSOR);
    renderSearchScreen();
    return;
  }

  // Lesezeichen (Feature 5)
  if (key.name === "b") {
    pushHistory({ type: "bookmarks", selectedIndex: 0 });
    currentScreen = { type: "bookmarks", selectedIndex: 0 };
    renderBookmarksScreen();
    return;
  }

  // Platform (Kursauswahl)
  if (key.name === "p" || key.name === "escape") {
    // Fortschritt speichern und Progress-Cache invalidieren
    saveProgress();
    courseProgressCache.clear();
    const courseIdx = platformConfig.courses.findIndex(co => co.id === platformConfig.activeCourse);
    currentScreen = { type: "platform", selectedIndex: Math.max(0, courseIdx), scrollOffset: 0 };
    renderPlatformScreen();
    return;
  }

  if (key.name === "q") {
    exitTui();
    return;
  }
}

function startInterleavedReview(): void {
  const completedIndices = getCompletedLessonIndices();
  const completedLessons = completedIndices.map((i) => ({
    index: i,
    number: lessons[i].number,
    title: lessons[i].title,
  }));
  const items = getInterleavedItems(PROJECT_ROOT, completedLessons, 5);

  pushHistory({ type: "interleaved", items, currentIndex: 0, answers: [],
    showingFeedback: false, feedbackCorrect: false, feedbackExplanation: "", done: false });
  currentScreen = {
    type: "interleaved",
    items,
    currentIndex: 0,
    answers: [],
    showingFeedback: false,
    feedbackCorrect: false,
    feedbackExplanation: "",
    done: false,
  };
  renderInterleaved();
}

function startReview(): void {
  runChildProcess(
    path.join(PLATFORM_ROOT, "src", "review-runner.ts"),
    [],
    () => {
      currentScreen = { type: "main", selectedIndex: 0 };
      renderMainMenu();
    }
  );
}

// ─── Lesson-Menu Input ────────────────────────────────────────────────────

function handleLessonInput(key: ParsedKey): void {
  const screen = currentScreen as {
    type: "lesson";
    lessonIndex: number;
    selectedIndex: number;
  };
  const lesson = lessons[screen.lessonIndex];
  if (!lesson) return;

  let maxIdx = lesson.sections.length - 1;
  maxIdx++; // Exercises
  if (lesson.hasQuiz) maxIdx++;
  if (lesson.hasHints) maxIdx++;
  const lessonHasMisconceptions = fs.existsSync(
    path.join(PROJECT_ROOT, lesson.dirName, "misconceptions.ts")
  );
  if (lessonHasMisconceptions) maxIdx++;
  if (lesson.hasCheatsheet) maxIdx++;

  // Pfeiltasten
  if (key.name === "up") {
    screen.selectedIndex = Math.max(0, screen.selectedIndex - 1);
    renderLessonMenu(screen.lessonIndex);
    return;
  }
  if (key.name === "down") {
    screen.selectedIndex = Math.min(maxIdx, screen.selectedIndex + 1);
    renderLessonMenu(screen.lessonIndex);
    return;
  }

  // Zurueck
  if (
    key.name === "escape" ||
    key.name === "backspace" ||
    key.name === "left"
  ) {
    currentScreen = { type: "main", selectedIndex: screen.lessonIndex };
    renderMainMenu();
    return;
  }

  // Enter oder Pfeil rechts: Auswahl oeffnen
  if (key.name === "enter" || key.name === "right") {
    openLessonItem(screen.lessonIndex, screen.selectedIndex);
    return;
  }

  // Sektionen per Nummer
  const num = parseInt(key.raw, 10);
  if (num >= 1 && num <= lesson.sections.length) {
    openSection(screen.lessonIndex, num - 1);
    return;
  }

  // Shortcuts
  if (key.name === "e") {
    // Oeffne Exercise-Menue statt direkt Watch-Runner
    currentScreen = {
      type: "exercisemenu",
      lessonIndex: screen.lessonIndex,
      selectedIndex: 0,
    };
    renderExerciseMenu();
    return;
  }

  // Misconceptions shortcut
  if (key.name === "g") {
    const mcs = loadMisconceptions(screen.lessonIndex);
    currentScreen = {
      type: "misconceptions",
      lessonIndex: screen.lessonIndex,
      misconceptions: mcs,
      currentIndex: 0,
      answered: false,
      selectedOption: -1,
      showingResolution: false,
      score: 0,
    };
    renderMisconceptions();
    return;
  }

  if (key.name === "z" && lesson.hasQuiz) {
    startQuiz(screen.lessonIndex);
    return;
  }

  if (key.name === "h" && lesson.hasHints) {
    startHints(screen.lessonIndex);
    return;
  }

  if (key.name === "c" && lesson.hasCheatsheet) {
    openCheatsheet(screen.lessonIndex);
    return;
  }

  // VS Code (Feature 3): Oeffne Exercise-Ordner
  if (key.name === "v") {
    const exercisesDir = path.join(PROJECT_ROOT, lesson.dirName, "exercises");
    if (fs.existsSync(exercisesDir)) {
      openInVSCode(exercisesDir);
    } else {
      // Fallback: oeffne Lektionsordner
      openInVSCode(path.join(PROJECT_ROOT, lesson.dirName));
    }
    return;
  }

  if (key.name === "q") {
    currentScreen = { type: "main", selectedIndex: screen.lessonIndex };
    renderMainMenu();
    return;
  }
}

function openLessonItem(lessonIndex: number, selectedIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  if (selectedIndex < lesson.sections.length) {
    // Pruefe ob Pre-Test fuer diese Sektion noetig ist
    const sKey = getSectionKey(lessonIndex, selectedIndex);
    const sectionStatus = getSectionStatus(sKey);
    if (!sectionStatus && !hasTakenPretest(lessonIndex, selectedIndex)) {
      // Noch nicht gelesen + kein Pre-Test -> Biete Pre-Test an
      const lessonDir = path.join(PROJECT_ROOT, lesson.dirName);
      const pretestQs = getPretestQuestions(lessonDir, selectedIndex + 1);
      if (pretestQs.length > 0) {
        currentScreen = {
          type: "pretest",
          lessonIndex,
          sectionIndex: selectedIndex,
          questions: pretestQs,
          currentIndex: 0,
          answers: [],
          showingFeedback: false,
          feedbackCorrect: false,
          feedbackExplanation: "",
          showingResult: false,
          recommendedDepth: "standard",
          score: 0,
        };
        renderPretest();
        return;
      }
    }
    openSection(lessonIndex, selectedIndex);
    return;
  }

  let idx = lesson.sections.length;

  if (selectedIndex === idx) {
    // Exercise-Menue statt direkt Watch-Runner
    currentScreen = {
      type: "exercisemenu",
      lessonIndex,
      selectedIndex: 0,
    };
    renderExerciseMenu();
    return;
  }
  idx++;

  if (lesson.hasQuiz && selectedIndex === idx) {
    startQuiz(lessonIndex);
    return;
  }
  if (lesson.hasQuiz) idx++;

  if (lesson.hasHints && selectedIndex === idx) {
    startHints(lessonIndex);
    return;
  }
  if (lesson.hasHints) idx++;

  // Misconceptions
  const hasMisconceptions = fs.existsSync(
    path.join(PROJECT_ROOT, lesson.dirName, "misconceptions.ts")
  );
  if (hasMisconceptions && selectedIndex === idx) {
    const mcs = loadMisconceptions(lessonIndex);
    currentScreen = {
      type: "misconceptions",
      lessonIndex,
      misconceptions: mcs,
      currentIndex: 0,
      answered: false,
      selectedOption: -1,
      showingResolution: false,
      score: 0,
    };
    renderMisconceptions();
    return;
  }
  if (hasMisconceptions) idx++;

  if (lesson.hasCheatsheet && selectedIndex === idx) {
    openCheatsheet(lessonIndex);
    return;
  }
}

function openSection(lessonIndex: number, sectionIndex: number, initialOffset?: number): void {
  stopTTS(); // TTS bei Sektionswechsel stoppen

  const lesson = lessons[lessonIndex];
  if (!lesson || !lesson.sections[sectionIndex]) return;

  // Feature 4: History
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
    // Migration
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

  currentScreen = {
    type: "section",
    lessonIndex,
    sectionIndex,
    scrollOffset: offset,
    totalLines,
  };
  renderSectionReader(lessonIndex, sectionIndex, offset);
}

function startExercises(lessonIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  // VS Code Integration (Feature 3): Oeffne Exercise-Ordner vor dem Watch-Runner
  const exercisesDir = path.join(PROJECT_ROOT, lesson.dirName, "exercises");
  if (fs.existsSync(exercisesDir)) {
    openInVSCode(exercisesDir);
  }

  runChildProcess(
    path.join(PLATFORM_ROOT, "src", "watch-runner.ts"),
    [lesson.number],
    () => {
      const exBefore = progress.exercises[lesson.number];
      const ex = countExerciseProgress(lesson);
      // Feature 3: Zaehle neu geloeste Exercises
      const prevSolved = exBefore?.solved ?? 0;
      if (ex.solved > prevSolved) {
        sessionStats.exercisesSolved += ex.solved - prevSolved;
      }
      progress.exercises[lesson.number] = ex;
      saveProgress();
      currentScreen = { type: "lesson", lessonIndex, selectedIndex: 0 };
      renderLessonMenu(lessonIndex);
    }
  );
}

function startQuiz(lessonIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  const quizPath = path.join(PROJECT_ROOT, lesson.dirName, "quiz.ts");
  runChildProcess(quizPath, [], () => {
    sessionStats.quizzesTaken++;
    currentScreen = { type: "lesson", lessonIndex, selectedIndex: 0 };
    renderLessonMenu(lessonIndex);
  });
}

function startHints(lessonIndex: number): void {
  const lesson = lessons[lessonIndex];
  if (!lesson) return;

  // Lade hints.json für diese Lektion
  const hintsPath = path.join(PROJECT_ROOT, lesson.dirName, "hints.json");
  if (!fs.existsSync(hintsPath)) return;

  let hintsData: Record<string, Record<string, string[]>>;
  try {
    hintsData = JSON.parse(fs.readFileSync(hintsPath, "utf-8"));
  } catch {
    return;
  }

  const exercises = Object.keys(hintsData);
  if (exercises.length === 0) return;

  const firstExercise = exercises[0];
  const firstTasks = Object.keys(hintsData[firstExercise] || {});
  const firstHints = firstTasks.length > 0
    ? hintsData[firstExercise][firstTasks[0]] || []
    : [];

  currentScreen = {
    type: "hints",
    lessonIndex,
    exercises,
    selectedExercise: 0,
    selectedTask: 0,
    hintsData,
    currentHints: firstHints,
    shownHintCount: 1,
  };
  renderHintsScreen();
}

function renderHintsScreen(): void {
  updateTermSize();
  const screen = currentScreen as Extract<Screen, { type: "hints" }>;
  const { lessonIndex, exercises, selectedExercise, selectedTask, hintsData, currentHints, shownHintCount } = screen;
  const lesson = lessons[lessonIndex];
  const lines: string[] = [];

  // Header
  const header = ` Lektion ${lesson.number}: ${lesson.title} — Hints `;
  lines.push(`${c.bgGray}${c.white}${c.bold}${header.padEnd(W)}${c.reset}`);
  lines.push("");

  // Zwei Spalten: Exercises links, Hints rechts
  const leftW = Math.min(38, Math.floor(W * 0.35));
  const rightW = W - leftW - 3;

  // Linke Spalte: Exercise + Task Liste
  const leftLines: string[] = [];
  leftLines.push(`${c.bold}${c.cyan} Exercises${c.reset}`);
  leftLines.push(`${c.dim} ${"─".repeat(leftW - 2)}${c.reset}`);

  const currentExercise = exercises[selectedExercise] || "";
  const tasks = Object.keys(hintsData[currentExercise] || {});

  for (let i = 0; i < exercises.length; i++) {
    const exName = exercises[i].replace("exercises/", "").replace(".ts", "");
    const marker = i === selectedExercise ? `${c.cyan}▸${c.reset}` : " ";
    const style = i === selectedExercise ? `${c.bold}${c.white}` : c.dim;
    leftLines.push(` ${marker} ${style}${exName}${c.reset}`);

    if (i === selectedExercise) {
      for (let t = 0; t < tasks.length; t++) {
        const tMarker = t === selectedTask ? `${c.yellow}▸${c.reset}` : " ";
        const tStyle = t === selectedTask ? `${c.bold}${c.yellow}` : c.dim;
        leftLines.push(`     ${tMarker} ${tStyle}Aufgabe ${tasks[t]}${c.reset}`);
      }
    }
  }

  // Rechte Spalte: Hints
  const rightLines: string[] = [];
  rightLines.push(`${c.bold}${c.yellow} Hints für Aufgabe ${tasks[selectedTask] || "?"}${c.reset}`);
  rightLines.push(`${c.dim} ${"─".repeat(rightW - 2)}${c.reset}`);
  rightLines.push("");

  if (currentHints.length === 0) {
    rightLines.push(`  ${c.dim}Keine Hints verfügbar.${c.reset}`);
  } else {
    const showing = Math.min(shownHintCount, currentHints.length);
    for (let h = 0; h < showing; h++) {
      rightLines.push(`  ${c.yellow}${c.bold}Hint ${h + 1}/${currentHints.length}:${c.reset}`);
      // Word-wrap the hint
      const words = currentHints[h].split(" ");
      let line = "  ";
      for (const word of words) {
        if (stripAnsi(line).length + word.length + 1 > rightW - 2) {
          rightLines.push(line);
          line = "  " + word;
        } else {
          line += (line === "  " ? "" : " ") + word;
        }
      }
      if (line.trim()) rightLines.push(line);
      rightLines.push("");
    }

    if (showing < currentHints.length) {
      rightLines.push(`  ${c.dim}Noch ${currentHints.length - showing} weitere Hints.${c.reset}`);
      rightLines.push(`  ${c.dim}Drücke ${c.bold}[N]${c.reset}${c.dim} für den nächsten Hint.${c.reset}`);
    } else {
      rightLines.push(`  ${c.green}Alle Hints angezeigt.${c.reset}`);
    }
  }

  // Spalten zusammenführen
  const maxRows = Math.max(leftLines.length, rightLines.length);
  for (let r = 0; r < Math.min(maxRows, H - 5); r++) {
    const left = r < leftLines.length ? padR(leftLines[r], leftW) : " ".repeat(leftW);
    const right = r < rightLines.length ? rightLines[r] : "";
    lines.push(`${left} ${c.dim}│${c.reset} ${right}`);
  }

  // Fill remaining space
  while (lines.length < H - 3) lines.push("");

  // Footer
  lines.push(`${c.dim}${"─".repeat(W)}${c.reset}`);
  lines.push(
    ` ${c.bold}[↑↓]${c.reset} Exercise  ${c.bold}[←→]${c.reset} Aufgabe  ${c.bold}[N]${c.reset} Nächster Hint  ${c.bold}[R]${c.reset} Reset  ${c.bold}[Esc/Q]${c.reset} Zurück`
  );
  lines.push(`${c.dim}${"─".repeat(W)}${c.reset}`);

  flushScreen(lines);
}

function handleHintsInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "hints" }>;
  const { lessonIndex, exercises, selectedExercise, hintsData } = screen;

  const currentExercise = exercises[selectedExercise] || "";
  const tasks = Object.keys(hintsData[currentExercise] || {});

  if (key.name === "escape" || key.name === "q" || key.name === "backspace") {
    currentScreen = { type: "lesson", lessonIndex, selectedIndex: 0 };
    renderLessonMenu(lessonIndex);
    return;
  }

  if (key.name === "up") {
    if (screen.selectedExercise > 0) {
      screen.selectedExercise--;
      screen.selectedTask = 0;
      updateHintSelection(screen);
    }
    renderHintsScreen();
    return;
  }

  if (key.name === "down") {
    if (screen.selectedExercise < exercises.length - 1) {
      screen.selectedExercise++;
      screen.selectedTask = 0;
      updateHintSelection(screen);
    }
    renderHintsScreen();
    return;
  }

  if (key.name === "left") {
    if (screen.selectedTask > 0) {
      screen.selectedTask--;
      updateHintSelection(screen);
    }
    renderHintsScreen();
    return;
  }

  if (key.name === "right") {
    if (screen.selectedTask < tasks.length - 1) {
      screen.selectedTask++;
      updateHintSelection(screen);
    }
    renderHintsScreen();
    return;
  }

  if (key.name === "n") {
    if (screen.shownHintCount < screen.currentHints.length) {
      screen.shownHintCount++;
    }
    renderHintsScreen();
    return;
  }

  if (key.name === "r") {
    screen.shownHintCount = 1;
    renderHintsScreen();
    return;
  }
}

function updateHintSelection(screen: Extract<Screen, { type: "hints" }>): void {
  const exercise = screen.exercises[screen.selectedExercise] || "";
  const tasks = Object.keys(screen.hintsData[exercise] || {});
  const task = tasks[screen.selectedTask] || "";
  screen.currentHints = (screen.hintsData[exercise] || {})[task] || [];
  screen.shownHintCount = 1;
}

function openCheatsheet(lessonIndex: number): void {
  if (loadCheatsheet(lessonIndex)) {
    currentScreen = {
      type: "cheatsheet",
      lessonIndex,
      scrollOffset: 0,
      totalLines: cheatsheetRenderedLines.length,
    };
    renderCheatsheetReader(lessonIndex, 0);
  }
}

// ─── Section-Reader Input (Smooth Scrolling) ─────────────────────────────

function handleSectionInput(key: ParsedKey): void {
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

  /**
   * Hilfsfunktion: Scroll-Offset aktualisieren, rendern, Progress speichern
   */
  const scrollTo = (newOffset: number): void => {
    const clamped = clampScrollOffset(newOffset, totalLines);

    // Self-Explanation Prompt Check: wenn beim Scrollen nach unten
    // eine Prompt-Zeile ueberquert wird, pausiere
    if (clamped > scrollOffset) {
      for (const prompt of sectionSelfExplainPrompts) {
        if (
          prompt.lineIndex > scrollOffset &&
          prompt.lineIndex <= clamped + contentHeight &&
          !sectionSelfExplainTriggered.has(prompt.lineIndex)
        ) {
          sectionSelfExplainTriggered.add(prompt.lineIndex);
          currentScreen = {
            type: "selfexplain",
            lessonIndex,
            sectionIndex,
            scrollOffset: clamped,
            totalLines,
            prompt,
            showKeyPoints: false,
            typingMode: false,
            typedText: "",
          };
          renderSelfExplanation();
          return;
        }
      }
    }

    screen.scrollOffset = clamped;

    // Progress tracking
    const pct = getScrollPercent(clamped, totalLines);
    const sKey = getSectionKey(lessonIndex, sectionIndex);
    const entry = progress.sections[sKey];
    if (entry && typeof entry !== "string") {
      entry.scrollPercent = Math.max(entry.scrollPercent, pct);
      // Markiere als gelesen wenn >= 80% gescrollt
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

  // Einzelne Zeile hoch
  if (key.name === "up" || key.name === "mouse-scroll-up") {
    scrollTo(scrollOffset - 1);
    return;
  }

  // Einzelne Zeile runter
  if (key.name === "down" || key.name === "mouse-scroll-down") {
    scrollTo(scrollOffset + 1);
    return;
  }

  // Halbe Seite runter
  if (key.name === "space" || key.name === "pagedown") {
    if (scrollOffset >= maxOffset) {
      // Am Ende: Naechste Sektion
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

  // Halbe Seite hoch
  if (key.name === "pageup") {
    scrollTo(scrollOffset - halfPage);
    return;
  }

  // Pfeil rechts: Naechste Sektion
  if (key.name === "right") {
    if (lesson && sectionIndex < lesson.sections.length - 1) {
      const sKey = getSectionKey(lessonIndex, sectionIndex);
      markSectionCompleted(sKey);
      saveProgress();
      openSection(lessonIndex, sectionIndex + 1);
    }
    return;
  }

  // Pfeil links: Vorherige Sektion oder zurueck
  if (key.name === "left") {
    if (sectionIndex > 0) {
      openSection(lessonIndex, sectionIndex - 1); // stopTTS() wird in openSection aufgerufen
    } else {
      stopTTS();
      currentScreen = {
        type: "lesson",
        lessonIndex,
        selectedIndex: sectionIndex,
      };
      renderLessonMenu(lessonIndex);
    }
    return;
  }

  // Home
  if (key.name === "home") {
    scrollTo(0);
    return;
  }

  // End
  if (key.name === "end") {
    scrollTo(maxOffset);
    return;
  }

  // Sektionen per Nummer
  if (lesson) {
    const num = parseInt(key.raw, 10);
    if (num >= 1 && num <= lesson.sections.length) {
      openSection(lessonIndex, num - 1);
      return;
    }
  }

  // Diagramm
  if (key.name === "d" && sectionMermaidBlocks.length > 0) {
    openMermaidDiagram(sectionMermaidBlocks[0]);
    return;
  }

  // Annotationen toggle
  if (key.name === "a") {
    setAnnotationsEnabled(!annotationsEnabled);
    // Re-rendere Section mit neuer Annotations-Einstellung
    loadSection(lessonIndex, sectionIndex);
    screen.totalLines = sectionRenderedLines.length;
    screen.scrollOffset = clampScrollOffset(scrollOffset, screen.totalLines);
    renderSectionReader(lessonIndex, sectionIndex, screen.scrollOffset);
    return;
  }

  // Lesezeichen setzen (Feature 5)
  if (key.name === "m") {
    const bm: Bookmark = {
      lessonIndex,
      sectionIndex,
      scrollOffset,
      created: new Date().toISOString(),
    };
    progress.bookmarks.push(bm);
    saveProgress();
    // Kurzes visuelles Feedback: Header flasht
    renderSectionReader(lessonIndex, sectionIndex, scrollOffset);
    return;
  }

  // VS Code (Feature 3): Oeffne die aktuelle Markdown-Datei
  if (key.name === "v") {
    const section = lesson?.sections[sectionIndex];
    if (section) {
      openInVSCode(section.filePath);
    }
    return;
  }

  // Vorlesen (TTS) Toggle
  if (key.name === "l") {
    if (ttsActive) {
      stopTTS();
    } else {
      startTTSFromPosition(sectionRawMarkdown, scrollOffset, totalLines);
    }
    renderSectionReader(lessonIndex, sectionIndex, scrollOffset);
    return;
  }

  // Zurueck (b entfernt — kollidiert mit Lesezeichen-Anzeige im Hauptmenue)
  if (key.name === "q" || key.name === "escape" || key.name === "backspace") {
    stopTTS(); // TTS bei Verlassen stoppen
    currentScreen = {
      type: "lesson",
      lessonIndex,
      selectedIndex: sectionIndex,
    };
    renderLessonMenu(lessonIndex);
    return;
  }
}

/** Markiert eine Sektion als abgeschlossen */
function markSectionCompleted(sKey: string): void {
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

// ─── Cheatsheet Input (Smooth Scrolling) ─────────────────────────────────

function handleCheatsheetInput(key: ParsedKey): void {
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

  if (key.name === "up" || key.name === "mouse-scroll-up") {
    scrollTo(scrollOffset - 1);
    return;
  }
  if (key.name === "down" || key.name === "mouse-scroll-down") {
    scrollTo(scrollOffset + 1);
    return;
  }
  if (key.name === "space" || key.name === "pagedown") {
    scrollTo(scrollOffset + halfPage);
    return;
  }
  if (key.name === "pageup") {
    scrollTo(scrollOffset - halfPage);
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

  if (
    key.name === "q" ||
    key.name === "escape" ||
    key.name === "backspace" ||
    key.name === "left"
  ) {
    currentScreen = { type: "lesson", lessonIndex, selectedIndex: 0 };
    renderLessonMenu(lessonIndex);
    return;
  }
}

// ─── Stats Input ──────────────────────────────────────────────────────────

function handleStatsInput(key: ParsedKey): void {
  const screen = currentScreen as { type: "stats"; scrollOffset: number };
  // Upper bound: estimate max content lines from lessons (sections + exercises + overhead)
  const maxScrollOffset = Math.max(0, lessons.length * 8 + 20 - (H - 6));

  if (key.name === "up" || key.name === "pageup" || key.name === "mouse-scroll-up") {
    screen.scrollOffset = Math.max(0, screen.scrollOffset - 3);
    renderStats();
    return;
  }

  if (key.name === "down" || key.name === "pagedown" || key.name === "mouse-scroll-down") {
    screen.scrollOffset = Math.min(screen.scrollOffset + 3, maxScrollOffset);
    renderStats();
    return;
  }

  if (
    key.name === "escape" ||
    key.name === "backspace" ||
    key.name === "left" ||
    key.name === "q"
  ) {
    currentScreen = { type: "main", selectedIndex: 0 };
    renderMainMenu();
    return;
  }
}

// ─── Search Input (Feature 4) ─────────────────────────────────────────────

function handleSearchInput(key: ParsedKey, rawData: Buffer): void {
  const screen = currentScreen as {
    type: "search";
    query: string;
    results: SearchResult[];
    selectedResult: number;
  };

  // Escape: zurueck zum Hauptmenue
  if (key.name === "escape") {
    process.stdout.write(HIDE_CURSOR);
    currentScreen = { type: "main", selectedIndex: 0 };
    renderMainMenu();
    return;
  }

  // Enter: ausgewaehltes Ergebnis oeffnen
  if (key.name === "enter") {
    if (screen.results.length > 0 && screen.selectedResult < screen.results.length) {
      const result = screen.results[screen.selectedResult];
      process.stdout.write(HIDE_CURSOR);
      // Oeffne die Sektion und versuche zum Treffer zu scrollen
      // Wir muessen die Sektion laden um die gerenderte Zeile zu finden
      openSection(result.lessonIndex, result.sectionIndex);
    }
    return;
  }

  // Navigation in Ergebnissen
  if (key.name === "up") {
    screen.selectedResult = Math.max(0, screen.selectedResult - 1);
    renderSearchScreen();
    return;
  }
  if (key.name === "down") {
    screen.selectedResult = Math.min(
      screen.results.length - 1,
      screen.selectedResult + 1
    );
    renderSearchScreen();
    return;
  }

  // Backspace
  if (key.name === "backspace") {
    screen.query = screen.query.slice(0, -1);
    triggerSearchDebounced(screen);
    renderSearchScreen();
    return;
  }

  // Ignore non-printable keys in search mode
  if (
    key.name === "space" ||
    key.name === "tab" ||
    key.name.startsWith("mouse-") ||
    key.name.startsWith("unknown-") ||
    key.name === "pageup" ||
    key.name === "pagedown" ||
    key.name === "home" ||
    key.name === "end" ||
    key.name === "left" ||
    key.name === "right"
  ) {
    if (key.name === "space") {
      screen.query += " ";
      triggerSearchDebounced(screen);
      renderSearchScreen();
    }
    return;
  }

  // Normales Zeichen hinzufuegen
  if (key.raw.length === 1 && key.raw.charCodeAt(0) >= 32) {
    screen.query += key.raw;
    triggerSearchDebounced(screen);
    renderSearchScreen();
    return;
  }

  // Multi-byte UTF-8 Zeichen (Umlaute etc.)
  if (rawData.length > 1 && rawData[0] !== 0x1b) {
    screen.query += rawData.toString("utf-8");
    triggerSearchDebounced(screen);
    renderSearchScreen();
    return;
  }
}

function triggerSearchDebounced(screen: {
  query: string;
  results: SearchResult[];
  selectedResult: number;
}): void {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    screen.results = performSearch(screen.query);
    screen.selectedResult = 0;
    renderSearchScreen();
  }, 150);
}

// ─── Bookmarks Input (Feature 5) ─────────────────────────────────────────

function handleBookmarksInput(key: ParsedKey): void {
  const screen = currentScreen as { type: "bookmarks"; selectedIndex: number };

  if (key.name === "up") {
    screen.selectedIndex = Math.max(0, screen.selectedIndex - 1);
    renderBookmarksScreen();
    return;
  }
  if (key.name === "down") {
    screen.selectedIndex = Math.min(
      progress.bookmarks.length - 1,
      screen.selectedIndex + 1
    );
    renderBookmarksScreen();
    return;
  }

  // Enter: Lesezeichen oeffnen
  if (key.name === "enter") {
    if (progress.bookmarks.length > 0 && screen.selectedIndex < progress.bookmarks.length) {
      const bm = progress.bookmarks[screen.selectedIndex];
      openSection(bm.lessonIndex, bm.sectionIndex, bm.scrollOffset);
    }
    return;
  }

  // X: Lesezeichen loeschen
  if (key.name === "x") {
    if (progress.bookmarks.length > 0 && screen.selectedIndex < progress.bookmarks.length) {
      progress.bookmarks.splice(screen.selectedIndex, 1);
      saveProgress();
      if (screen.selectedIndex >= progress.bookmarks.length) {
        screen.selectedIndex = Math.max(0, progress.bookmarks.length - 1);
      }
      renderBookmarksScreen();
    }
    return;
  }

  // Zurueck
  if (
    key.name === "escape" ||
    key.name === "backspace" ||
    key.name === "left" ||
    key.name === "q"
  ) {
    currentScreen = { type: "main", selectedIndex: 0 };
    renderMainMenu();
    return;
  }
}

// ─── Warm-Up Input ───────────────────────────────────────────────────────

function handleWarmupInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "warmup" }>;

  if (screen.done) {
    if (key.name === "enter") {
      currentScreen = { type: "main", selectedIndex: 0 };
      renderMainMenu();
    }
    return;
  }

  // Feature 5: Confidence-Phase
  if (screen.phase === "confidence") {
    const confMap: Record<string, number> = { "1": 1, "2": 2, "3": 3, "4": 4 };
    const conf = confMap[key.raw];
    if (conf !== undefined) {
      screen.confidence = conf;
      // Weiter zu Feedback
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

  // Feature 5: Feedback-Phase (mit Kalibrierungskommentar)
  if (screen.phase === "feedback" || screen.showingFeedback) {
    if (key.name === "enter") {
      screen.showingFeedback = false;
      screen.phase = "question";
      screen.confidence = undefined;
      screen.pendingCorrect = undefined;
      screen.pendingExplanation = undefined;
      screen.currentIndex++;
      if (screen.currentIndex >= screen.questions.length) {
        screen.done = true;
      }
      renderWarmup();
    }
    return;
  }

  // Ueberspringen
  if (key.name === "s") {
    currentScreen = { type: "main", selectedIndex: 0 };
    renderMainMenu();
    return;
  }

  // Antwort A-D
  const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  const answerIdx = answerMap[key.name];
  if (answerIdx !== undefined) {
    const q = screen.questions[screen.currentIndex];
    const correct = answerIdx === q.question.correct;
    sessionStats.questionsAnswered++;

    // Feature 5: Metacognitive Phase — speichere Ergebnis, gehe zu Confidence
    screen.pendingCorrect = correct;
    screen.pendingExplanation = q.question.briefExplanation || "";
    screen.phase = "confidence";
    screen.confidence = undefined;

    // Update adaptive state
    if (q.question.concept) {
      updateConceptScore(adaptiveState, q.question.concept, correct);
      saveAdaptiveState(STATE_DIR, adaptiveState);
    }

    renderWarmup();
    return;
  }
}

// ─── Pre-Test Input ──────────────────────────────────────────────────────

function handlePretestInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "pretest" }>;

  if (screen.showingResult) {
    if (key.name === "enter") {
      // Sektion oeffnen
      markPretestTaken(screen.lessonIndex, screen.sectionIndex);
      setSectionDepth(adaptiveState, screen.lessonIndex, screen.sectionIndex,
        screen.recommendedDepth as ContentDepth);
      saveAdaptiveState(STATE_DIR, adaptiveState);
      openSection(screen.lessonIndex, screen.sectionIndex);
      return;
    }
    if (key.name === "s") {
      markPretestTaken(screen.lessonIndex, screen.sectionIndex);
      currentScreen = {
        type: "lesson",
        lessonIndex: screen.lessonIndex,
        selectedIndex: screen.sectionIndex,
      };
      renderLessonMenu(screen.lessonIndex);
      return;
    }
    return;
  }

  // Feature 5: Confidence-Phase
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
      renderPretest();
    }
    return;
  }

  // Feature 5: Feedback-Phase (mit Kalibrierungskommentar)
  if (screen.phase === "feedback" || screen.showingFeedback) {
    if (key.name === "enter") {
      screen.showingFeedback = false;
      screen.phase = "question";
      screen.confidence = undefined;
      screen.pendingCorrect = undefined;
      screen.pendingExplanation = undefined;
      screen.currentIndex++;
      if (screen.currentIndex >= screen.questions.length) {
        // Ergebnis berechnen
        const correctCount = screen.answers.filter((a) => a.correct).length;
        const score = screen.questions.length > 0
          ? Math.round((correctCount / screen.questions.length) * 100)
          : 0;
        const depth = calculateDepth(screen.answers);
        screen.showingResult = true;
        screen.score = score;
        screen.recommendedDepth = depth;
      }
      renderPretest();
    }
    return;
  }

  // Ueberspringen
  if (key.name === "s") {
    markPretestTaken(screen.lessonIndex, screen.sectionIndex);
    openSection(screen.lessonIndex, screen.sectionIndex);
    return;
  }

  // Weiss nicht
  if (key.name === "?") {
    sessionStats.questionsAnswered++;
    // Direkt zu Feedback (keine Confidence-Frage bei "Weiss nicht")
    screen.answers.push({ correct: false, skipped: true });
    screen.showingFeedback = true;
    screen.feedbackCorrect = false;
    const q = screen.questions[screen.currentIndex];
    screen.feedbackExplanation = q.briefExplanation || "Du wirst es gleich lernen!";
    screen.phase = "feedback";
    renderPretest();
    return;
  }

  // Antwort A-D
  const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  const answerIdx = answerMap[key.name];
  if (answerIdx !== undefined) {
    const q = screen.questions[screen.currentIndex];
    const correct = answerIdx === q.correct;
    sessionStats.questionsAnswered++;

    // Feature 5: Metacognitive Phase
    screen.pendingCorrect = correct;
    screen.pendingExplanation = q.briefExplanation || "";
    screen.phase = "confidence";
    screen.confidence = undefined;
    renderPretest();
    return;
  }
}

// ─── Self-Explanation Input ──────────────────────────────────────────────

function handleSelfExplainInput(key: ParsedKey, rawData: Buffer): void {
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
    // Normales Zeichen
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
    // Multi-byte
    if (rawData.length > 1 && rawData[0] !== 0x1b) {
      screen.typedText += rawData.toString("utf-8");
      renderSelfExplanation();
      return;
    }
    return;
  }

  // Typing-Modus starten
  if (key.name === "t") {
    screen.typingMode = true;
    process.stdout.write(SHOW_CURSOR);
    renderSelfExplanation();
    return;
  }

  // Kernpunkte zeigen
  if (key.name === "?") {
    screen.showKeyPoints = !screen.showKeyPoints;
    renderSelfExplanation();
    return;
  }

  // Weiter
  if (key.name === "enter") {
    // Zurueck zum Section-Reader, markiere Prompt als gesehen
    sectionSelfExplainTriggered.add(screen.prompt.lineIndex);
    currentScreen = {
      type: "section",
      lessonIndex: screen.lessonIndex,
      sectionIndex: screen.sectionIndex,
      scrollOffset: screen.scrollOffset,
      totalLines: screen.totalLines,
    };
    renderSectionReader(screen.lessonIndex, screen.sectionIndex, screen.scrollOffset);
    return;
  }

  if (key.name === "escape") {
    sectionSelfExplainTriggered.add(screen.prompt.lineIndex);
    currentScreen = {
      type: "section",
      lessonIndex: screen.lessonIndex,
      sectionIndex: screen.sectionIndex,
      scrollOffset: screen.scrollOffset,
      totalLines: screen.totalLines,
    };
    renderSectionReader(screen.lessonIndex, screen.sectionIndex, screen.scrollOffset);
    return;
  }
}

// ─── Misconceptions Input ────────────────────────────────────────────────

function handleMisconceptionsInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "misconceptions" }>;

  if (screen.misconceptions.length === 0) {
    if (key.name === "q" || key.name === "escape") {
      currentScreen = { type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 };
      renderLessonMenu(screen.lessonIndex);
    }
    return;
  }

  // Zurueck
  if (key.name === "q" || key.name === "escape") {
    currentScreen = { type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 };
    renderLessonMenu(screen.lessonIndex);
    return;
  }

  if (screen.answered) {
    if (key.name === "enter") {
      if (screen.currentIndex < screen.misconceptions.length - 1) {
        screen.currentIndex++;
        screen.answered = false;
        screen.showingResolution = false;
        renderMisconceptions();
      } else {
        // Fertig
        currentScreen = { type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 };
        renderLessonMenu(screen.lessonIndex);
      }
    }
    return;
  }

  // Antwort A (korrekt) oder B (Fehler gefunden)
  if (key.name === "a") {
    // User denkt Code ist korrekt — aber Misconceptions haben immer einen Bug
    screen.answered = true;
    screen.showingResolution = true;
    screen.selectedOption = 0;
    renderMisconceptions();
    return;
  }

  if (key.name === "b") {
    // User hat den Fehler erkannt!
    screen.answered = true;
    screen.showingResolution = true;
    screen.selectedOption = 1;
    screen.score++;

    const mc = screen.misconceptions[screen.currentIndex];
    if (mc.concept) {
      updateConceptScore(adaptiveState, mc.concept, true);
      saveAdaptiveState(STATE_DIR, adaptiveState);
    }

    renderMisconceptions();
    return;
  }
}

// ─── Completion Problem Input ────────────────────────────────────────────

function handleCompletionInput(key: ParsedKey, rawData: Buffer): void {
  const screen = currentScreen as Extract<Screen, { type: "completion" }>;

  if (screen.problems.length === 0) {
    if (key.name === "q" || key.name === "escape") {
      currentScreen = { type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 };
      renderLessonMenu(screen.lessonIndex);
    }
    return;
  }

  // Zurueck
  if (key.name === "q" || key.name === "escape") {
    process.stdout.write(HIDE_CURSOR);
    currentScreen = { type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 };
    renderLessonMenu(screen.lessonIndex);
    return;
  }

  const prob = screen.problems[screen.currentProblem];

  // Alle Luecken ausgefuellt
  if (screen.currentBlank >= prob.blanks.length) {
    if (key.name === "enter") {
      if (screen.currentProblem < screen.problems.length - 1) {
        screen.currentProblem++;
        screen.currentBlank = 0;
        screen.userInput = "";
        screen.filledBlanks = [];
        screen.showingHint = false;
        screen.showingSolution = false;
        renderCompletionProblem();
      } else {
        process.stdout.write(HIDE_CURSOR);
        currentScreen = { type: "lesson", lessonIndex: screen.lessonIndex, selectedIndex: 0 };
        renderLessonMenu(screen.lessonIndex);
      }
      return;
    }
    if (key.name === "l") {
      screen.showingSolution = !screen.showingSolution;
      renderCompletionProblem();
      return;
    }
    return;
  }

  // Hint toggle (nur wenn nichts im Input steht)
  if (key.raw === "h" && screen.userInput.length === 0) {
    screen.showingHint = !screen.showingHint;
    renderCompletionProblem();
    return;
  }

  // Enter: Antwort pruefen
  if (key.name === "enter") {
    const blank = prob.blanks[screen.currentBlank];
    const userAnswer = screen.userInput.trim().toLowerCase();
    const correctAnswer = blank.answer.trim().toLowerCase();
    if (userAnswer === correctAnswer) {
      screen.score++;
    }
    screen.filledBlanks.push(screen.userInput.trim() || blank.answer);
    screen.currentBlank++;
    screen.userInput = "";
    screen.showingHint = false;
    renderCompletionProblem();
    return;
  }

  // Backspace
  if (key.name === "backspace") {
    screen.userInput = screen.userInput.slice(0, -1);
    renderCompletionProblem();
    return;
  }

  // Normales Zeichen
  if (key.raw.length === 1 && key.raw.charCodeAt(0) >= 32) {
    screen.userInput += key.raw;
    renderCompletionProblem();
    return;
  }
  if (key.name === "space") {
    screen.userInput += " ";
    renderCompletionProblem();
    return;
  }
  // Multi-byte
  if (rawData.length > 1 && rawData[0] !== 0x1b) {
    screen.userInput += rawData.toString("utf-8");
    renderCompletionProblem();
    return;
  }
}

// ─── Interleaved Review Input ────────────────────────────────────────────

function handleInterleavedInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "interleaved" }>;

  if (screen.items.length === 0 || screen.done) {
    if (key.name === "enter" || key.name === "q" || key.name === "escape") {
      currentScreen = { type: "main", selectedIndex: 0 };
      renderMainMenu();
    }
    return;
  }

  // Feature 5: Confidence-Phase
  if (screen.phase === "confidence") {
    const confMap: Record<string, number> = { "1": 1, "2": 2, "3": 3, "4": 4 };
    const conf = confMap[key.raw];
    if (conf !== undefined) {
      screen.confidence = conf;
      const correct = screen.pendingCorrect ?? false;
      screen.answers.push({ correct });
      screen.showingFeedback = true;
      screen.feedbackCorrect = correct;
      screen.feedbackExplanation = screen.pendingExplanation || "";
      screen.phase = "feedback";
      renderInterleaved();
    }
    return;
  }

  // Feature 5: Feedback-Phase
  if (screen.phase === "feedback" || screen.showingFeedback) {
    if (key.name === "enter") {
      screen.showingFeedback = false;
      screen.phase = "question";
      screen.confidence = undefined;
      screen.pendingCorrect = undefined;
      screen.pendingExplanation = undefined;
      screen.currentIndex++;
      if (screen.currentIndex >= screen.items.length) {
        screen.done = true;
      }
      renderInterleaved();
    }
    return;
  }

  // Zurueck
  if (key.name === "q" || key.name === "escape") {
    currentScreen = { type: "main", selectedIndex: 0 };
    renderMainMenu();
    return;
  }

  // Antwort A-D
  const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  const answerIdx = answerMap[key.name];
  if (answerIdx !== undefined) {
    const item = screen.items[screen.currentIndex];
    const correct = answerIdx === item.correct;
    sessionStats.questionsAnswered++;

    // Feature 5: Metacognitive Phase
    screen.pendingCorrect = correct ?? false;
    screen.pendingExplanation = item.explanation || "";
    screen.phase = "confidence";
    screen.confidence = undefined;
    renderInterleaved();
    return;
  }
}

// ─── Kompetenz-Dashboard Input ───────────────────────────────────────────

function handleCompetenceInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "competence" }>;
  // Upper bound: estimate max content lines from lessons (concepts + charts + overhead)
  const maxScrollOffset = Math.max(0, lessons.length * 10 + 30 - (H - 6));

  if (key.name === "up" || key.name === "pageup" || key.name === "mouse-scroll-up") {
    screen.scrollOffset = Math.max(0, screen.scrollOffset - 3);
    renderCompetenceDashboard();
    return;
  }

  if (key.name === "down" || key.name === "pagedown" || key.name === "mouse-scroll-down") {
    screen.scrollOffset = Math.min(screen.scrollOffset + 3, maxScrollOffset);
    renderCompetenceDashboard();
    return;
  }

  if (
    key.name === "escape" ||
    key.name === "backspace" ||
    key.name === "left" ||
    key.name === "q"
  ) {
    currentScreen = { type: "main", selectedIndex: 0 };
    renderMainMenu();
    return;
  }
}

// ─── Exercise-Menue Input ────────────────────────────────────────────────

function handleExerciseMenuInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "exercisemenu" }>;
  const { lessonIndex } = screen;

  // Navigation
  if (key.name === "up") {
    screen.selectedIndex = Math.max(0, screen.selectedIndex - 1);
    renderExerciseMenu();
    return;
  }
  if (key.name === "down") {
    screen.selectedIndex = Math.min(3, screen.selectedIndex + 1);
    renderExerciseMenu();
    return;
  }

  // Zurueck
  if (key.name === "escape" || key.name === "backspace" || key.name === "left") {
    currentScreen = { type: "lesson", lessonIndex, selectedIndex: 0 };
    renderLessonMenu(lessonIndex);
    return;
  }

  // Stufen-Auswahl per Nummer oder Enter
  const openLevel = (level: number): void => {
    switch (level) {
      case 0: {
        // Worked Examples — oeffne Examples in VS Code
        const lesson = lessons[lessonIndex];
        if (lesson && lesson.exampleFiles.length > 0) {
          const examplesDir = path.join(PROJECT_ROOT, lesson.dirName, "examples");
          openInVSCode(examplesDir);
        }
        break;
      }
      case 1: {
        // Completion Problems
        const cps = loadCompletionProblems(lessonIndex);
        process.stdout.write(SHOW_CURSOR);
        currentScreen = {
          type: "completion",
          lessonIndex,
          problems: cps,
          currentProblem: 0,
          currentBlank: 0,
          userInput: "",
          filledBlanks: [],
          showingHint: false,
          showingSolution: false,
          score: 0,
        };
        renderCompletionProblem();
        break;
      }
      case 2: {
        // Full Exercises — Watch-Runner
        startExercises(lessonIndex);
        break;
      }
      case 3: {
        // Misconceptions
        const mcs = loadMisconceptions(lessonIndex);
        currentScreen = {
          type: "misconceptions",
          lessonIndex,
          misconceptions: mcs,
          currentIndex: 0,
          answered: false,
          selectedOption: -1,
          showingResolution: false,
          score: 0,
        };
        renderMisconceptions();
        break;
      }
    }
  };

  if (key.name === "enter") {
    openLevel(screen.selectedIndex);
    return;
  }

  const numMap: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
  const level = numMap[key.raw];
  if (level !== undefined) {
    openLevel(level);
    return;
  }

  if (key.name === "q") {
    currentScreen = { type: "lesson", lessonIndex, selectedIndex: 0 };
    renderLessonMenu(lessonIndex);
    return;
  }
}

// ─── Aufraemen und Beenden ─────────────────────────────────────────────────

function exitTui(): void {
  stopTTS(); // TTS beim Beenden stoppen
  saveProgress();
  cleanup();

  // ─── Feature 3: Tages-Zusammenfassung nach Verlassen des Alt-Screens ───
  const elapsed = Date.now() - SESSION_START;
  const mins = Math.floor(elapsed / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  const timeStr = mins > 0 ? `${mins} Min ${secs} Sek` : `${secs} Sek`;

  console.log("");
  console.log(`  ${c.bold}${c.cyan}--- Tages-Zusammenfassung ---${c.reset}`);
  console.log(`  ${c.dim}Lernzeit:${c.reset}              ${c.bold}${timeStr}${c.reset}`);
  if (sessionStats.sectionsRead > 0) {
    console.log(`  ${c.dim}Sektionen gelesen:${c.reset}     ${c.bold}${sessionStats.sectionsRead}${c.reset}`);
  }
  if (sessionStats.questionsAnswered > 0) {
    console.log(`  ${c.dim}Fragen beantwortet:${c.reset}    ${c.bold}${sessionStats.questionsAnswered}${c.reset}`);
  }
  if (sessionStats.exercisesSolved > 0) {
    console.log(`  ${c.dim}Exercises geloest:${c.reset}     ${c.bold}${sessionStats.exercisesSolved}${c.reset}`);
  }
  if (sessionStats.quizzesTaken > 0) {
    console.log(`  ${c.dim}Quizzes absolviert:${c.reset}    ${c.bold}${sessionStats.quizzesTaken}${c.reset}`);
  }
  const totalActions = sessionStats.sectionsRead + sessionStats.questionsAnswered
    + sessionStats.exercisesSolved + sessionStats.quizzesTaken;
  if (totalActions === 0) {
    console.log(`  ${c.dim}(Noch keine Aktivitaeten in dieser Session.)${c.reset}`);
  }
  console.log("");
  console.log(`  ${c.dim}Bis zum naechsten Mal! Weiter lernen mit:${c.reset} ${c.cyan}npm start${c.reset}`);
  console.log("");

  process.exit(0);
}

// ─── Redraw bei Resize ────────────────────────────────────────────────────

function redraw(): void {
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
      renderCheatsheetReader(cs.lessonIndex, cs.scrollOffset);
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
      renderSelfExplanation();
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

// ─── Hauptprogramm ─────────────────────────────────────────────────────────

function main(): void {
  updateTermSize();

  // Platform-Konfiguration laden
  loadPlatformConfig();

  // Lektionen des aktiven Kurses entdecken
  lessons = discoverLessons();

  // Fortschritt laden (kein fataler Fehler wenn keine Lektionen)
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
    PROJECT_ROOT = path.join(COURSES_ROOT, activeCourse.directory);
    ACTIVE_COURSE_ID = activeCourse.id;
    updateDerivedPaths();
  }

  // Adaptive State laden
  try {
    adaptiveState = loadAdaptiveState(STATE_DIR);
  } catch {
    adaptiveState = { sectionDepths: {}, conceptScores: {}, hintLevels: {} };
  }

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
  isInAltScreen = true;

  // Raw Mode
  process.stdin.setRawMode(true);
  process.stdin.resume();

  // Event-Listener laufen fuer die gesamte Lebensdauer der Applikation
  // Terminal-Resize beobachten
  process.stdout.on("resize", redraw);

  // Eingaben verarbeiten
  process.stdin.on("data", (data: Buffer | string) => {
    const buf = typeof data === "string" ? Buffer.from(data) : data;
    handleInput(buf);
  });

  // Startbildschirm: Platform-Screen (Kursauswahl)
  // Aktiven Kurs vorselektieren
  const activeCourseIdx = platformConfig.courses.findIndex(
    co => co.id === platformConfig.activeCourse
  );
  currentScreen = { type: "platform", selectedIndex: Math.max(0, activeCourseIdx), scrollOffset: 0 };
  renderPlatformScreen();
}

// ─── Start ─────────────────────────────────────────────────────────────────

main();
