/**
 * Lektion 22 - Quiz: Advanced Generics
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu Higher-Order Types, Varianz, in/out-Modifier,
 * fortgeschrittenen Constraints und API-Design.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 22: ${lessonTitle}`, questions);
