/**
 * Lektion 15 - Quiz: Utility Types
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu Partial, Required, Readonly, Pick, Omit, Record,
 * Extract, Exclude, NonNullable, ReturnType, Parameters, Awaited,
 * eigene Utility Types und deren Komposition.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 15: ${lessonTitle}`, questions);
