/**
 * Lektion 12 - Quiz: Discriminated Unions
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu Tagged Unions, Exhaustive Checks, ADTs,
 * Zustandsmodellierung und Praxis-Patterns.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 12: ${lessonTitle}`, questions);
