// quiz.ts — L24 Quiz-Runner
import { quizData } from './quiz-data.js';

const questions = quizData;
let score = 0;

for (const q of questions) {
  console.log(`\nQuestion ${q.id}: ${q.question}`);
  q.options.forEach((opt, i) => {
    console.log(`  ${i}. ${opt}`);
  });
  console.log(`Correct answer: ${q.correct} — ${q.options[q.correct]}`);
  console.log(`Explanation: ${q.explanation}`);
  score++;
}

console.log(`\nQuiz loaded: ${questions.length} questions`);
console.log('Use the TUI platform for the interactive quiz: cd platform && npm start');