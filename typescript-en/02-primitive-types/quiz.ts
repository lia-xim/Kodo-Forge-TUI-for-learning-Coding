/**
 * Lesson 02 - Quiz: Primitive Types
 *
 * Start the quiz with: npx tsx quiz.ts
 *
 * 15 questions on all primitive types, the type hierarchy,
 * Type Widening, Literal Types, any vs unknown,
 * and common pitfalls.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Start quiz
runQuiz(`Lesson 02: ${lessonTitle}`, questions);