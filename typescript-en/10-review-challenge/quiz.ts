/**
 * Lesson 10 - Quiz: Review Challenge — Phase 1
 *
 * Start the quiz with: npx tsx quiz.ts
 *
 * 20 mixed questions from ALL lessons (L01-L09).
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

runQuiz(`Lesson 10: ${lessonTitle}`, questions);