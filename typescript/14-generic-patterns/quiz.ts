/**
 * Lektion 14 - Quiz: Generic Patterns
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu Generic Factories, Collections, HOFs,
 * Advanced Constraints und Real-World Patterns.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 14: ${lessonTitle}`, questions);
