/**
 * Lektion 05 Quiz-Daten: Objects and Interfaces
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from "../tools/quiz-runner.ts";

export const lessonId = "05";
export const lessonTitle = "Objects and Interfaces";

export const questions: QuizQuestion[] = [
  // --- Question 1: Interface vs Type ---
  {
    question:
      "Which feature does interface have that type does NOT?",
    options: [
      "Optional Properties (?)",
      "Readonly Properties",
      "Declaration Merging (reopening and extending an interface)",
      "Nested objects",
    ],
    correct: 2,
    explanation:
      "Declaration Merging is unique to interfaces. You can declare the same interface " +
      "multiple times and the properties will be merged. This is not possible with type -- " +
      "you get a Duplicate identifier error.",
  },
];
