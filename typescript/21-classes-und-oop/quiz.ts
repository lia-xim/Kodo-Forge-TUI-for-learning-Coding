/**
 * Lektion 21 - Quiz: Classes & OOP
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

runQuiz(`Lektion 21: ${lessonTitle}`, questions);
