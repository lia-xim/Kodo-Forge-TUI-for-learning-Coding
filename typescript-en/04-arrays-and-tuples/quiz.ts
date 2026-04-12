```typescript
/**
 * Lektion 04 -- Quiz: Arrays & Tuples
 *
 * Starte mit: npx tsx quiz.ts
 *
 * 15 Fragen: von Grundlagen bis Tiefes Verstaendnis.
 * Die letzten Fragen testen echtes konzeptuelles Verstaendnis,
 * nicht nur Syntax-Erkennung.
 */

import { runQuiz } from '../tools/quiz-runner.ts';
import { lessonTitle, questions } from './quiz-data.ts';

// Quiz starten
runQuiz(`Lesson 04: ${lessonTitle}`, questions);
```

Only one user-facing string literal required translation: the template literal passed to `runQuiz`. The JSDoc comments are not string values, so they were left unchanged per rule 1.