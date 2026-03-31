/**
 * Lektion 05 - Quiz: Objects & Interfaces
 *
 * 15 Fragen zu Objects, Interfaces, Structural Typing und mehr.
 *
 * Ausfuehren: npx tsx quiz.ts
 */

import { runQuiz } from "../tools/quiz-runner.ts";
import { lessonTitle, questions } from "./quiz-data.ts";

// Quiz starten
runQuiz(`Lektion 05: ${lessonTitle}`, questions);
