/**
 * Lektion 10 - Quiz: Review Challenge — Phase 1
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 20 gemischte Fragen aus ALLEN Lektionen (L01-L09).
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

runQuiz(`Lektion 10: ${lessonTitle}`, questions);
