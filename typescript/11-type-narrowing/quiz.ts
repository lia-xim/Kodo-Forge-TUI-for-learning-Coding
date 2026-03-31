/**
 * Lektion 11 - Quiz: Type Narrowing
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu allen Narrowing-Mechanismen:
 * typeof, instanceof, in, ===, Truthiness,
 * Type Predicates, Assertion Functions,
 * TS 5.5 Inferred Predicates, Exhaustive Checks.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 11: ${lessonTitle}`, questions);
