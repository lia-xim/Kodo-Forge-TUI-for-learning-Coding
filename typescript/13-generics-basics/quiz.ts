/**
 * Lektion 13 - Quiz: Generics Basics
 *
 * Starte das Quiz mit: npx tsx quiz.ts
 *
 * 15 Fragen zu Typparametern, Inference, generischen Interfaces,
 * Constraints, Default-Typen und Praxis-Patterns.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 13: ${lessonTitle}`, questions);
