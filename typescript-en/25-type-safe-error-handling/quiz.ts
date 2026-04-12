/**
 * Lesson 25 - Quiz: Type-safe Error Handling
 *
 * Start the quiz with: npx tsx quiz.ts
 *
 * 15 questions on Result<T,E>, Option/Maybe, exhaustive error handling,
 * assertNever, satisfies, error conversion and practical patterns.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

runQuiz(`Lesson 25: ${lessonTitle}`, questions);