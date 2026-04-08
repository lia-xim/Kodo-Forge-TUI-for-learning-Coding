/**
 * tui-types.ts — Alle Interfaces und Type-Definitionen fuer das TUI
 */

import type { SelfExplanationPrompt } from "./markdown-renderer.ts";
import type { PretestQuestion } from "./pretest-engine.ts";
import type { InterleavedItem } from "./interleave-engine.ts";

// ─── Platform-Typen ─────────────────────────────────────────────────────────

export interface PlatformCourse {
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

export interface PlatformConfig {
  courses: PlatformCourse[];
  activeCourse: string;
  lastAccessed: Record<string, string>;
}

/** Fortschrittsdaten eines einzelnen Kurses (zusammengefasst) */
export interface CourseProgressSummary {
  completedLessons: number;
  totalLessons: number;
  currentPhase: number;
  lastLessonTitle: string;
  percent: number;
  /** Dynamisch berechnet: tatsaechliche Sektionen auf der Festplatte */
  actualSections: number;
  /** Dynamisch berechnet: geschaetzte Stunden (Sektionen * 10min + Uebungen) */
  actualHours: number;
  /** Dynamisch berechnet: Anzahl vorhandener Exercise-Dateien */
  actualExercises: number;
}

// ─── Lektions-Typen ─────────────────────────────────────────────────────────

export interface LessonInfo {
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

export interface SectionInfo {
  fileName: string;
  filePath: string;
  title: string;
  index: number;
}

export interface Bookmark {
  lessonIndex: number;
  sectionIndex: number;
  scrollOffset: number;
  note?: string;
  created: string; // ISO date
}

export interface SectionProgress {
  status: "completed" | "in_progress";
  firstOpened?: string;   // ISO date
  completed?: string;     // ISO date
  scrollPercent: number;  // 0-100
}

export type MasteryLevel = "newcomer" | "familiar" | "proficient" | "expert";

// ─── Misconception / Completion-Problem Interfaces ─────────────────────────

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number;
}

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

// ─── Screen-Typen ──────────────────────────────────────────────────────────

export type Screen =
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
      phase?: "question" | "confidence" | "feedback" | "freetext";
      pendingCorrect?: boolean;
      pendingExplanation?: string;
      confidence?: number;
      /** Free-text input buffer for short-answer, predict-output, explain-why */
      userInput?: string;
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
      /** Per-Sektion Tiefen-Empfehlungen nach Pre-Test-Abschluss */
      sectionDepths: Record<string, "kurz" | "standard" | "vollständig">;
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
      phase?: "question" | "confidence" | "feedback" | "freetext";
      pendingCorrect?: boolean;
      pendingExplanation?: string;
      confidence?: number;
      /** Free-text input buffer for short-answer, predict-output, explain-why */
      userInput?: string;
    }
  | {
      type: "quiz";
      lessonIndex: number;
      questions: import("./quiz-runner.ts").QuizQuestion[];
      currentIndex: number;
      answers: { correct: boolean; skipped: boolean }[];
      showingFeedback: boolean;
      feedbackCorrect: boolean;
      feedbackExplanation: string;
      done: boolean;
      score: number;
      phase: "question" | "confidence" | "feedback" | "freetext" | "explain-review";
      pendingCorrect?: boolean;
      pendingExplanation?: string;
      confidence?: number;
      /** Free-text input buffer */
      userInput: string;
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

export interface SearchResult {
  lessonIndex: number;
  sectionIndex: number;
  lessonNumber: string;
  sectionNumber: number;
  sectionTitle: string;
  contextLine: string;
  lineNumber: number; // line within rendered content for scroll targeting
}

export interface ProgressData {
  sections: Record<string, SectionProgress | "completed" | "in_progress">;
  exercises: Record<string, { solved: number; total: number }>;
  quizzes: Record<string, { score: number; total: number; date: string }>;
  lastLesson: number;
  lastSection: number;
  lastScrollOffset: number;
  lastScreen: string;
  bookmarks: Bookmark[];
}

export interface ParsedKey {
  name: string;
  raw: string;
  ctrl: boolean;
  x?: number;
  y?: number;
}
