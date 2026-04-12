/**
 * Lesson 11 - Quiz: Type Narrowing
 *
 * Start the quiz with: npx tsx quiz.ts
 *
 * 15 questions covering all narrowing mechanisms:
 * typeof, instanceof, in, ===, Truthiness,
 * Type Predicates, Assertion Functions,
 * TS 5.5 Inferred Predicates, Exhaustive Checks.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Start quiz
runQuiz(`Lesson 11: ${lessonTitle}`, questions);