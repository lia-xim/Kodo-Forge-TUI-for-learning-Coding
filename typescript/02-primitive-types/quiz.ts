/**
 * Lektion 02 - Quiz: Primitive Types
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu allen primitiven Typen, der Typhierarchie,
 * Type Widening, Literal Types, any vs unknown,
 * und haeufigen Fallstricken.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 02: ${lessonTitle}`, questions);
