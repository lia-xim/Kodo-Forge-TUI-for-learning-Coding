```typescript
// ============================================================
// Quiz: Lesson 01 -- Setup & First Steps
// ============================================================
//
// 12 questions on the topics of this lesson.
// Mix of factual knowledge, comprehension, and thinking questions.
//
// Run with: tsx quiz.ts
// ============================================================

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Start quiz
runQuiz(`Lesson 01: ${lessonTitle}`, questions);
```