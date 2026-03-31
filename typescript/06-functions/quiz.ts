/**
 * Lektion 06 - Quiz: Functions
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu Parameter-Typen, Return-Typen, Overloads, Callbacks,
 * this-Parameter, Arrow vs Function, Type Guards, Assertion Functions.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 06: ${lessonTitle}`, questions);
