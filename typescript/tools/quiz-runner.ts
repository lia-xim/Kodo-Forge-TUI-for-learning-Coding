/**
 * Interaktiver Quiz-Runner für die TypeScript-Lektionen
 *
 * Nutzung in einer Lektion:
 *   import { runQuiz, QuizQuestion } from '../../tools/quiz-runner.ts';
 *
 *   const questions: QuizQuestion[] = [ ... ];
 *   runQuiz("Lektion 02: Primitive Types", questions);
 */

import * as readline from "node:readline";

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Quiz Question Types (Discriminated Union) ─────────────────────────────

export interface MultipleChoiceQuestion {
  type?: "multiple-choice";
  /** Die Frage */
  question: string;
  /** Antwortmöglichkeiten */
  options: string[];
  /** Index der korrekten Antwort (0-basiert) */
  correct: number;
  /** Erklärung, die nach der Antwort gezeigt wird */
  explanation: string;
  /** Optional: Codeblock der vor der Frage angezeigt wird */
  code?: string;
  /** Optional: Elaboriertes Feedback */
  elaboratedFeedback?: { whyCorrect: string; commonMistake: string };
}

export interface ShortAnswerQuestion {
  type: "short-answer";
  question: string;
  expectedAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  code?: string;
  elaboratedFeedback?: { whyCorrect: string; commonMistake: string };
}

export interface PredictOutputQuestion {
  type: "predict-output";
  question: string;
  code: string;
  expectedAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  elaboratedFeedback?: { whyCorrect: string; commonMistake: string };
}

export interface ExplainWhyQuestion {
  type: "explain-why";
  question: string;
  code?: string;
  modelAnswer: string;
  keyPoints: string[];
  elaboratedFeedback?: { whyCorrect: string; commonMistake: string };
}

/** Alle Quiz-Frage-Typen — abwärtskompatibel (type ist optional bei MC) */
export type QuizQuestion =
  | MultipleChoiceQuestion
  | ShortAnswerQuestion
  | PredictOutputQuestion
  | ExplainWhyQuestion;

interface QuizResult {
  total: number;
  correct: number;
  wrong: number;
  percentage: number;
  wrongQuestions: number[];
}

// ─── Terminal Colors ─────────────────────────────────────────────────────────

const color = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function askQuestion(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

function printHeader(title: string): void {
  const line = "═".repeat(60);
  console.log(`\n${color.cyan}${line}${color.reset}`);
  console.log(`${color.bold}${color.cyan}  ${title}${color.reset}`);
  console.log(`${color.cyan}${line}${color.reset}\n`);
}

function isMC(q: QuizQuestion): q is MultipleChoiceQuestion {
  return !q.type || q.type === "multiple-choice";
}

function printQuestion(index: number, total: number, q: MultipleChoiceQuestion): void {
  console.log(
    `${color.bold}Frage ${index + 1}/${total}${color.reset}${color.dim} ─────────────────────────────────${color.reset}`
  );
  console.log();

  if (q.code) {
    console.log(`${color.dim}┌─ Code ────────────────────────────────┐${color.reset}`);
    for (const line of q.code.split("\n")) {
      console.log(`${color.dim}│${color.reset} ${color.yellow}${line}${color.reset}`);
    }
    console.log(`${color.dim}└───────────────────────────────────────┘${color.reset}`);
    console.log();
  }

  console.log(`  ${q.question}\n`);

  const letters = ["A", "B", "C", "D", "E", "F"];
  for (let i = 0; i < q.options.length; i++) {
    console.log(`  ${color.cyan}${letters[i]}${color.reset}) ${q.options[i]}`);
  }
  console.log();
}

function printResult(isCorrect: boolean, q: MultipleChoiceQuestion): void {
  if (isCorrect) {
    console.log(`  ${color.green}${color.bold}✓ Richtig!${color.reset}`);
  } else {
    const letters = ["A", "B", "C", "D", "E", "F"];
    console.log(
      `  ${color.red}${color.bold}✗ Falsch!${color.reset} Die richtige Antwort war: ${color.green}${letters[q.correct]}) ${q.options[q.correct]}${color.reset}`
    );
  }
  console.log();
  console.log(
    `  ${color.dim}Erklärung: ${q.explanation}${color.reset}`
  );
  console.log();
}

function printSummary(title: string, result: QuizResult): void {
  const line = "═".repeat(60);
  console.log(`\n${color.cyan}${line}${color.reset}`);
  console.log(`${color.bold}  Ergebnis: ${title}${color.reset}`);
  console.log(`${color.cyan}${line}${color.reset}\n`);

  const bar = "█".repeat(Math.round(result.percentage / 2.5));
  const emptyBar = "░".repeat(40 - Math.round(result.percentage / 2.5));
  const barColor = result.percentage >= 80 ? color.green : result.percentage >= 50 ? color.yellow : color.red;

  console.log(`  ${barColor}${bar}${color.dim}${emptyBar}${color.reset} ${result.percentage}%`);
  console.log();
  console.log(`  ${color.green}✓ Richtig:${color.reset}  ${result.correct}/${result.total}`);
  console.log(`  ${color.red}✗ Falsch:${color.reset}   ${result.wrong}/${result.total}`);
  console.log();

  if (result.percentage === 100) {
    console.log(`  ${color.green}${color.bold}Perfekt! Du hast diese Lektion gemeistert!${color.reset}`);
  } else if (result.percentage >= 80) {
    console.log(`  ${color.green}Sehr gut! Du hast den Stoff verstanden.${color.reset}`);
    if (result.wrongQuestions.length > 0) {
      console.log(`  ${color.dim}Schau dir noch mal Frage ${result.wrongQuestions.map((q) => q + 1).join(", ")} an.${color.reset}`);
    }
  } else if (result.percentage >= 50) {
    console.log(`  ${color.yellow}Okay, aber es gibt noch Lücken. Lies die Lektion nochmal durch.${color.reset}`);
    console.log(`  ${color.dim}Besonders Frage ${result.wrongQuestions.map((q) => q + 1).join(", ")} wiederholen.${color.reset}`);
  } else {
    console.log(`  ${color.red}Das war noch nicht genug. Geh die Lektion und Examples nochmal durch,${color.reset}`);
    console.log(`  ${color.red}bevor du zur nächsten Lektion weitergehst.${color.reset}`);
  }
  console.log();
}

// ─── Main Quiz Runner ────────────────────────────────────────────────────────

export async function runQuiz(
  title: string,
  questions: QuizQuestion[]
): Promise<QuizResult> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printHeader(title);

  const letters = ["a", "b", "c", "d", "e", "f"];
  let correct = 0;
  const wrongQuestions: number[] = [];

  const mcQuestions = questions.filter(isMC);

  for (let i = 0; i < mcQuestions.length; i++) {
    const q = mcQuestions[i];
    printQuestion(i, mcQuestions.length, q);

    let answer = "";
    while (true) {
      answer = (
        await askQuestion(rl, `  ${color.bold}Deine Antwort (${letters.slice(0, q.options.length).join("/")}): ${color.reset}`)
      ).toLowerCase();

      const validLetters = letters.slice(0, q.options.length);
      if (validLetters.includes(answer)) break;

      console.log(`  ${color.dim}Bitte gib einen Buchstaben ein (${validLetters.join(", ")})${color.reset}`);
    }

    const answerIndex = letters.indexOf(answer);
    const isCorrect = answerIndex === q.correct;

    if (isCorrect) {
      correct++;
    } else {
      wrongQuestions.push(i);
    }

    printResult(isCorrect, q);

    if (i < mcQuestions.length - 1) {
      await askQuestion(rl, `  ${color.dim}Drücke Enter für die nächste Frage...${color.reset}`);
    }
  }

  const result: QuizResult = {
    total: mcQuestions.length,
    correct,
    wrong: mcQuestions.length - correct,
    percentage: mcQuestions.length > 0 ? Math.round((correct / mcQuestions.length) * 100) : 0,
    wrongQuestions,
  };

  printSummary(title, result);
  rl.close();
  return result;
}
