/**
 * Lektion 20 - Quiz: Review Challenge Phase 2
 * Starte das Quiz mit: npx tsx quiz.ts
 */
import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';
runQuiz(`Lektion 20: ${lessonTitle}`, questions);
