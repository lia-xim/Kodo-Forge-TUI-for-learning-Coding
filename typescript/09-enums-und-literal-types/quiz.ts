/**
 * Lektion 09 - Quiz: Enums & Literal Types
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu Literal Types, numerischen und String Enums,
 * as const, Template Literal Types, Branding und const enum.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 09: ${lessonTitle}`, questions);
