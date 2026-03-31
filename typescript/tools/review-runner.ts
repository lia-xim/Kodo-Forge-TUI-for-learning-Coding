/**
 * Spaced-Repetition Review-Runner
 *
 * Sammelt alle Quiz-Fragen aus allen Lektionen, verwaltet ein
 * intervallbasiertes Wiederholungssystem und stellt faellige
 * Fragen in einer interaktiven Terminal-Session.
 *
 * Ausfuehren: npx tsx tools/review-runner.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { QuizQuestion } from "./quiz-runner.ts";

// ─── Pfade ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(__dirname, "review-data.json");

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuestionRecord {
  lastCorrect: string | null;
  interval: number;
  streak: number;
}

interface ReviewData {
  questions: Record<string, QuestionRecord>;
  stats: {
    totalReviews: number;
    lastReviewDate: string | null;
  };
}

interface TaggedQuestion {
  /** Eindeutige ID: "01-03" = Lektion 01, Frage 3 (1-basiert) */
  id: string;
  lessonId: string;
  lessonTitle: string;
  questionIndex: number;
  question: QuizQuestion;
}

// ─── Terminal-Farben ────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  bgCyan: "\x1b[46m",
  bgYellow: "\x1b[43m",
  white: "\x1b[37m",
};

// ─── Konstanten ─────────────────────────────────────────────────────────────

const MAX_INTERVAL = 30;
const INITIAL_INTERVAL = 1;

// ─── Lektionsdaten laden ────────────────────────────────────────────────────

interface LessonModule {
  lessonId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
}

/** Alle Lektionsverzeichnisse finden und deren quiz-data.ts importieren */
async function loadAllQuestions(): Promise<TaggedQuestion[]> {
  const allQuestions: TaggedQuestion[] = [];

  // Suche nach Verzeichnissen, die mit einer Zahl beginnen
  const entries = fs.readdirSync(PROJECT_ROOT, { withFileTypes: true });
  const lessonDirs = entries
    .filter(
      (e) =>
        e.isDirectory() &&
        /^\d{2}-/.test(e.name) &&
        fs.existsSync(path.join(PROJECT_ROOT, e.name, "quiz-data.ts"))
    )
    .map((e) => e.name)
    .sort();

  for (const dir of lessonDirs) {
    const quizDataPath = path.join(PROJECT_ROOT, dir, "quiz-data.ts");
    try {
      const importUrl = pathToFileURL(quizDataPath).href;
      const mod = (await import(importUrl)) as LessonModule;
      for (let i = 0; i < mod.questions.length; i++) {
        const id = `${mod.lessonId}-${String(i + 1).padStart(2, "0")}`;
        allQuestions.push({
          id,
          lessonId: mod.lessonId,
          lessonTitle: mod.lessonTitle,
          questionIndex: i + 1,
          question: mod.questions[i],
        });
      }
    } catch (err) {
      console.error(
        `${c.red}Fehler beim Laden von ${quizDataPath}:${c.reset}`,
        err
      );
    }
  }

  return allQuestions;
}

// ─── Review-Daten lesen/schreiben ───────────────────────────────────────────

function loadReviewData(): ReviewData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ReviewData;
  } catch {
    return {
      questions: {},
      stats: { totalReviews: 0, lastReviewDate: null },
    };
  }
}

function saveReviewData(data: ReviewData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ─── Intervall-Logik ────────────────────────────────────────────────────────

function getToday(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Bestimmt, ob eine Frage heute faellig ist.
 * - Neue Frage (kein Record): immer faellig
 * - lastCorrect + interval <= heute: faellig
 */
function isDue(record: QuestionRecord | undefined, today: string): boolean {
  if (!record || record.lastCorrect === null) {
    return true;
  }
  const daysElapsed = daysBetween(record.lastCorrect, today);
  return daysElapsed >= record.interval;
}

/** Aktualisiert den Record nach einer Antwort */
function updateRecord(
  record: QuestionRecord | undefined,
  isCorrect: boolean,
  today: string
): QuestionRecord {
  if (isCorrect) {
    const currentInterval = record?.interval ?? INITIAL_INTERVAL;
    const currentStreak = record?.streak ?? 0;
    const newInterval = Math.min(currentInterval * 2, MAX_INTERVAL);
    return {
      lastCorrect: today,
      interval: record ? newInterval : INITIAL_INTERVAL,
      streak: currentStreak + 1,
    };
  }
  // Falsch: zurueck auf Anfang
  return {
    lastCorrect: today,
    interval: INITIAL_INTERVAL,
    streak: 0,
  };
}

// ─── Terminal UI ────────────────────────────────────────────────────────────

function askUser(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

function printBanner(): void {
  const line = "═".repeat(60);
  console.log();
  console.log(`${c.cyan}${line}${c.reset}`);
  console.log(
    `${c.bold}${c.cyan}  Spaced Repetition — TypeScript Review${c.reset}`
  );
  console.log(`${c.cyan}${line}${c.reset}`);
  console.log();
}

function printQuestionHeader(
  index: number,
  total: number,
  tq: TaggedQuestion,
  record: QuestionRecord | undefined
): void {
  const streak = record?.streak ?? 0;
  const streakDisplay =
    streak > 0
      ? ` ${c.yellow}Streak: ${streak}${c.reset}`
      : ` ${c.dim}Neu${c.reset}`;

  console.log(
    `${c.bold}Frage ${index + 1}/${total}${c.reset} ` +
      `${c.dim}[${tq.id}]${c.reset} ` +
      `${c.magenta}Lektion ${tq.lessonId}: ${tq.lessonTitle}${c.reset}` +
      streakDisplay
  );
  console.log(
    `${c.dim}${"─".repeat(58)}${c.reset}`
  );
  console.log();

  const q = tq.question;

  if (q.code) {
    console.log(
      `${c.dim}┌─ Code ────────────────────────────────┐${c.reset}`
    );
    for (const line of q.code.split("\n")) {
      console.log(`${c.dim}│${c.reset} ${c.yellow}${line}${c.reset}`);
    }
    console.log(
      `${c.dim}└───────────────────────────────────────┘${c.reset}`
    );
    console.log();
  }

  console.log(`  ${q.question}\n`);

  const letters = ["A", "B", "C", "D", "E", "F"];
  for (let i = 0; i < q.options.length; i++) {
    console.log(`  ${c.cyan}${letters[i]}${c.reset}) ${q.options[i]}`);
  }
  console.log();
}

function printResult(isCorrect: boolean, q: QuizQuestion): void {
  if (isCorrect) {
    console.log(`  ${c.green}${c.bold}Richtig!${c.reset}`);
  } else {
    const letters = ["A", "B", "C", "D", "E", "F"];
    console.log(
      `  ${c.red}${c.bold}Falsch!${c.reset} ` +
        `Die richtige Antwort war: ${c.green}${letters[q.correct]}) ${q.options[q.correct]}${c.reset}`
    );
  }
  console.log();
  console.log(`  ${c.dim}Erklaerung: ${q.explanation}${c.reset}`);
  console.log();
}

function printSessionSummary(
  data: ReviewData,
  totalAsked: number,
  correctCount: number,
  allQuestions: TaggedQuestion[]
): void {
  const line = "═".repeat(60);
  const today = getToday();

  console.log(`\n${c.cyan}${line}${c.reset}`);
  console.log(`${c.bold}${c.cyan}  Review-Zusammenfassung${c.reset}`);
  console.log(`${c.cyan}${line}${c.reset}\n`);

  // Ergebnis dieser Session
  const percentage =
    totalAsked > 0 ? Math.round((correctCount / totalAsked) * 100) : 0;
  const barLen = 40;
  const filled = Math.round((percentage / 100) * barLen);
  const barColor =
    percentage >= 80 ? c.green : percentage >= 50 ? c.yellow : c.red;
  const bar = barColor + "\u2588".repeat(filled) + c.dim + "\u2591".repeat(barLen - filled) + c.reset;

  console.log(`  ${c.bold}Diese Session:${c.reset}`);
  console.log(`  ${bar} ${percentage}%`);
  console.log(
    `  ${c.green}Richtig:${c.reset} ${correctCount}/${totalAsked}   ` +
      `${c.red}Falsch:${c.reset} ${totalAsked - correctCount}/${totalAsked}`
  );
  console.log();

  // Gesamtstatistiken
  console.log(`  ${c.bold}Gesamt:${c.reset}`);
  console.log(
    `  ${c.dim}Bisherige Reviews:${c.reset} ${data.stats.totalReviews}`
  );

  // Fortschritt pro Lektion
  const lessonMap = new Map<string, { total: number; mastered: number; learning: number; neue: number }>();
  for (const tq of allQuestions) {
    if (!lessonMap.has(tq.lessonId)) {
      lessonMap.set(tq.lessonId, { total: 0, mastered: 0, learning: 0, neue: 0 });
    }
    const entry = lessonMap.get(tq.lessonId)!;
    entry.total++;

    const rec = data.questions[tq.id];
    if (!rec || rec.lastCorrect === null) {
      entry.neue++;
    } else if (rec.interval >= 16) {
      entry.mastered++;
    } else {
      entry.learning++;
    }
  }

  console.log();
  console.log(`  ${c.bold}Fortschritt pro Lektion:${c.reset}`);
  console.log();

  for (const [lessonId, info] of [...lessonMap.entries()].sort()) {
    const tq = allQuestions.find((q) => q.lessonId === lessonId);
    const title = tq?.lessonTitle ?? lessonId;
    const masteredPct = Math.round((info.mastered / info.total) * 100);

    const miniBar =
      c.green +
      "\u2588".repeat(Math.round((info.mastered / info.total) * 20)) +
      c.yellow +
      "\u2588".repeat(Math.round((info.learning / info.total) * 20)) +
      c.dim +
      "\u2591".repeat(
        20 -
          Math.round((info.mastered / info.total) * 20) -
          Math.round((info.learning / info.total) * 20)
      ) +
      c.reset;

    console.log(
      `  ${c.cyan}${lessonId}${c.reset} ${title.padEnd(32)} ${miniBar} ${masteredPct}%`
    );
    console.log(
      `     ${c.green}Gemeistert: ${info.mastered}${c.reset}  ` +
        `${c.yellow}Lernend: ${info.learning}${c.reset}  ` +
        `${c.dim}Neu: ${info.neue}${c.reset}`
    );
  }

  // Naechste Review berechnen
  console.log();
  let nextDueDate: string | null = null;
  let nextDueCount = 0;

  for (const tq of allQuestions) {
    const rec = data.questions[tq.id];
    if (!rec || rec.lastCorrect === null) {
      // Neue Fragen zaehlen als "morgen faellig"
      continue;
    }
    const dueDate = addDays(rec.lastCorrect, rec.interval);
    if (dueDate <= today) {
      // Heute schon faellig (sollte nicht passieren nach der Session)
      continue;
    }
    if (!nextDueDate || dueDate < nextDueDate) {
      nextDueDate = dueDate;
      nextDueCount = 1;
    } else if (dueDate === nextDueDate) {
      nextDueCount++;
    }
  }

  // Zaehle neue Fragen
  const totalNeue = allQuestions.filter((tq) => {
    const rec = data.questions[tq.id];
    return !rec || rec.lastCorrect === null;
  }).length;

  if (nextDueDate) {
    const daysUntil = daysBetween(today, nextDueDate);
    console.log(
      `  ${c.bold}Naechste Wiederholung:${c.reset} ` +
        `${nextDueCount} Frage${nextDueCount !== 1 ? "n" : ""} in ${daysUntil} Tag${daysUntil !== 1 ? "en" : ""} ` +
        `${c.dim}(${nextDueDate})${c.reset}`
    );
  }

  if (totalNeue > 0) {
    console.log(
      `  ${c.dim}${totalNeue} neue Frage${totalNeue !== 1 ? "n" : ""} noch nicht geuebt${c.reset}`
    );
  }

  // Motivationstext
  console.log();
  if (percentage === 100 && totalAsked > 0) {
    console.log(
      `  ${c.green}${c.bold}Perfekt! Alle Fragen richtig beantwortet!${c.reset}`
    );
  } else if (percentage >= 80) {
    console.log(
      `  ${c.green}Sehr gut! Dein Wissen festigt sich.${c.reset}`
    );
  } else if (percentage >= 50) {
    console.log(
      `  ${c.yellow}Weiter so! Regelmaessiges Wiederholen hilft.${c.reset}`
    );
  } else if (totalAsked > 0) {
    console.log(
      `  ${c.red}Nicht aufgeben! Lies die Lektionen nochmal durch und probiere es morgen wieder.${c.reset}`
    );
  }

  console.log();
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Mischen mit Fisher-Yates */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Hauptprogramm ─────────────────────────────────────────────────────────

async function main(): Promise<void> {
  printBanner();

  // Alle Fragen laden
  console.log(`${c.dim}  Lade Fragen...${c.reset}`);
  const allQuestions = await loadAllQuestions();

  if (allQuestions.length === 0) {
    console.log(
      `\n${c.red}  Keine Fragen gefunden!${c.reset}`
    );
    console.log(
      `${c.dim}  Stelle sicher, dass quiz-data.ts Dateien in den Lektionsverzeichnissen existieren.${c.reset}\n`
    );
    process.exit(1);
  }

  console.log(
    `${c.dim}  ${allQuestions.length} Fragen aus ${new Set(allQuestions.map((q) => q.lessonId)).size} Lektionen geladen.${c.reset}\n`
  );

  // Review-Daten laden
  const data = loadReviewData();
  const today = getToday();

  // Faellige Fragen filtern
  const dueQuestions = allQuestions.filter((tq) =>
    isDue(data.questions[tq.id], today)
  );

  if (dueQuestions.length === 0) {
    // Naechste faellige Frage finden
    let nextDate: string | null = null;
    for (const tq of allQuestions) {
      const rec = data.questions[tq.id];
      if (rec && rec.lastCorrect) {
        const due = addDays(rec.lastCorrect, rec.interval);
        if (!nextDate || due < nextDate) {
          nextDate = due;
        }
      }
    }

    console.log(
      `  ${c.green}${c.bold}Keine Fragen faellig!${c.reset}`
    );
    console.log(
      `  ${c.green}Du bist auf dem aktuellen Stand.${c.reset}`
    );

    if (nextDate) {
      const daysUntil = daysBetween(today, nextDate);
      console.log(
        `\n  ${c.dim}Naechste Wiederholung in ${daysUntil} Tag${daysUntil !== 1 ? "en" : ""} (${nextDate})${c.reset}`
      );
    }

    printSessionSummary(data, 0, 0, allQuestions);
    process.exit(0);
  }

  // Faellige Fragen mischen
  const shuffled = shuffle(dueQuestions);

  console.log(
    `  ${c.bold}${c.yellow}${shuffled.length} Frage${shuffled.length !== 1 ? "n" : ""} faellig zur Wiederholung${c.reset}\n`
  );

  // readline Interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const letters = ["a", "b", "c", "d", "e", "f"];
  let correctCount = 0;

  for (let i = 0; i < shuffled.length; i++) {
    const tq = shuffled[i];
    const record = data.questions[tq.id];

    printQuestionHeader(i, shuffled.length, tq, record);

    // Antwort einlesen
    let answer = "";
    const validLetters = letters.slice(0, tq.question.options.length);
    while (true) {
      answer = (
        await askUser(
          rl,
          `  ${c.bold}Deine Antwort (${validLetters.join("/")}): ${c.reset}`
        )
      ).toLowerCase();

      if (validLetters.includes(answer)) break;
      console.log(
        `  ${c.dim}Bitte gib einen Buchstaben ein (${validLetters.join(", ")})${c.reset}`
      );
    }

    const answerIndex = letters.indexOf(answer);
    const isCorrect = answerIndex === tq.question.correct;

    if (isCorrect) {
      correctCount++;
    }

    printResult(isCorrect, tq.question);

    // Record aktualisieren
    data.questions[tq.id] = updateRecord(record, isCorrect, today);

    // Zwischenspeichern (damit bei Abbruch nichts verloren geht)
    data.stats.totalReviews++;
    data.stats.lastReviewDate = today;
    saveReviewData(data);

    if (i < shuffled.length - 1) {
      await askUser(
        rl,
        `  ${c.dim}Druecke Enter fuer die naechste Frage...${c.reset}`
      );
    }
  }

  rl.close();

  // Zusammenfassung
  printSessionSummary(data, shuffled.length, correctCount, allQuestions);
}

// ─── Start ──────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(`${c.red}Unerwarteter Fehler:${c.reset}`, err);
  process.exit(1);
});
