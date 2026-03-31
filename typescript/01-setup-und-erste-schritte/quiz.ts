// ============================================================
// Quiz: Lektion 01 -- Setup & Erste Schritte
// ============================================================
//
// 12 Fragen zu den Themen dieser Lektion.
// Mischung aus Faktenwissen, Verstaendnis und Denkfragen.
//
// Ausfuehren mit: tsx quiz.ts
// ============================================================

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lektion 01: ${lessonTitle}`, questions);
