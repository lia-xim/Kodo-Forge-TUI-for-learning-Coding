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

// ─── Konstanten ─────────────────────────────────────────────────────────────

/** platform/ Ordner (Parent von src/) */
export const PLATFORM_ROOT = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  ".."
);
/** Learning/ Ordner (Parent von platform/) — enthaelt alle Kursverzeichnisse */
export const COURSES_ROOT = path.resolve(PLATFORM_ROOT, "..");
/** platform/platform.json */
export const PLATFORM_FILE = path.join(PLATFORM_ROOT, "platform.json");
/** platform/state/ — Runtime State (Progress, Review, Adaptive, etc.) */
export const STATE_DIR = path.join(PLATFORM_ROOT, "state");

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
export const shortcutsForScreen: Record<string, { key: string; desc: string }[]> = {
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
    { key: "Enter", desc: "Naechste Frage / Empfehlungen uebernehmen" },
    { key: "A", desc: "Alle Sektionen auf Standard (Ergebnis-Screen)" },
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
      const titleMatch = firstLine.match(/^#\s*Lektion\s*\d+:\s*(.+)/);
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
    case "quiz": {
      const l = lessons[screen.lessonIndex];
      return `Hauptmenue > L${l?.number ?? "?"} > Quiz`;
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
    return `${_c.green}Gut kalibriert! Du weisst was du weisst.${_c.reset}`;
  }
  if (confident && !correct) {
    return `${_c.yellow}\u26A0 Achtung: Du warst dir sicher, aber lagst falsch. Dieses Konzept solltest du vertiefen.${_c.reset}`;
  }
  if (!confident && correct) {
    return `${_c.cyan}Mehr Vertrauen! Du weisst mehr als du denkst.${_c.reset}`;
  }
  return `${_c.dim}Kein Problem — du wusstest dass du unsicher warst. Das ist gute Selbsteinschaetzung.${_c.reset}`;
}
