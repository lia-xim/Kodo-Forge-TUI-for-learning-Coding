/**
 * LEKTION 03 - Quiz: Type Annotations & Type Inference
 *
 * 15 Fragen zu Annotations, Inference, Widening, Contextual Typing,
 * satisfies, und Control Flow Analysis.
 *
 * Ausfuehren: npx tsx 03-type-annotations-und-inference/quiz.ts
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 03: ${lessonTitle}`, questions);
