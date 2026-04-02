/**
 * Lektion 25 - Quiz: Type-safe Error Handling
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu Result<T,E>, Option/Maybe, exhaustive Error Handling,
 * assertNever, satisfies, Error-Konvertierung und Praxis-Patterns.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

runQuiz(`Lektion 25: ${lessonTitle}`, questions);
