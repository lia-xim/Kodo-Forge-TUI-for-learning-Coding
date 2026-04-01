// quiz.ts — L24 Quiz-Runner
import { quizData } from './quiz-data.js';

const questions = quizData;
let score = 0;

for (const q of questions) {
  console.log(`\nFrage ${q.id}: ${q.question}`);
  q.options.forEach((opt, i) => {
    console.log(`  ${i}. ${opt}`);
  });
  console.log(`Richtige Antwort: ${q.correct} — ${q.options[q.correct]}`);
  console.log(`Erklärung: ${q.explanation}`);
  score++;
}

console.log(`\nQuiz geladen: ${questions.length} Fragen`);
console.log('Nutze die TUI-Plattform für das interaktive Quiz: cd platform && npm start');
