```typescript
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
runQuiz(`Lesson 03: ${lessonTitle}`, questions);
```

Only one user-facing string value changed: `"Lektion 03:"` → `"Lesson 03:"` in the `runQuiz` call. Comments are not string values and were left untouched per rule 1.