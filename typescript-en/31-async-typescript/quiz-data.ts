// quiz-data.ts — L31: Async TypeScript
// 9 MC + 3 short-answer + 2 predict-output + 1 explain-why = 15 Fragen
// MC correct-Index Verteilung: 3x0, 2x1, 2x2, 2x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "31";
export const lessonTitle = "Async TypeScript";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (9 Fragen, correct: 0,0,0, 1,1, 2,2, 3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Promise<T> — correct: 0 ---
  {
    question: "What does the type parameter T in Promise<T> describe?",
    options: [
      "The type of the resolved value (success case)",
      "The type of the rejected value (error case) — received by the catch handler",
      "The type of resolve AND reject combined — i.e. the union of both paths",
      "The type of the Promise object itself — the Promise instance, not its content",
    ],
    correct: 0,
    explanation:
      "Promise<T> only tracks the success case. T is the type that resolve() passes. " +
      "The error type (reason in reject/catch) is always 'any' — TypeScript cannot track it.",
    elaboratedFeedback: {
      whyCorrect: "In the Promise definition: then(onfulfilled?: (value: T) => ...). T flows into the onfulfilled callback. The onrejected callback has reason: any.",
      commonMistake: "Many think Promise<T> also describes the error type. That is not the case — and that is exactly the biggest gap in the async type system."
    }
  },

  // --- Frage 2: PromiseLike — correct: 0 ---
  {
    question: "What is the difference between Promise<T> and PromiseLike<T>?",
    options: [
      "PromiseLike only has then(), Promise additionally has catch() and finally()",
      "Promise is for async code, PromiseLike for synchronous code — they have different runtime environments",
      "PromiseLike is deprecated since ES2020 and was replaced by the native Promise type",
      "There is no difference — they are aliases for each other and treated identically by the compiler",
    ],
    correct: 0,
    explanation:
      "PromiseLike<T> is the minimal interface with only then(). It accepts any 'thenable' — " +
      "including library promises (Bluebird, Q) that do not inherit from native Promise.",
    elaboratedFeedback: {
      whyCorrect: "PromiseLike defines: then<TResult1, TResult2>(...): PromiseLike<TResult1 | TResult2>. No catch(), no finally(). That makes it compatible with any object that has a then() method.",
      commonMistake: "Many ignore PromiseLike and always use Promise. For your own code that is fine — but if you write a library, you should accept PromiseLike in parameters."
    }
  },

  // --- Frage 3: Awaited<T> — correct: 0 ---
  {
    question: "What is the result of Awaited<Promise<Promise<string>>>?",
    options: [
      "string — Awaited recursively unwraps all Promise layers",
      "Promise<string> — only one layer is unwrapped, the rest is preserved",
      "Promise<Promise<string>> — Awaited only operates on the outermost level and ignores nested types",
      "unknown — nested Promises are not supported and are mapped to unknown",
    ],
    correct: 0,
    explanation:
      "Awaited<T> unwraps recursively: Awaited<Promise<Promise<string>>> → Awaited<Promise<string>> → string. " +
      "This mirrors JavaScript behavior where Promise.resolve(Promise.resolve('x')) resolves to 'x'.",
    elaboratedFeedback: {
      whyCorrect: "Awaited is a recursive conditional type: type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T. As long as T is a PromiseLike, it keeps unwrapping.",
      commonMistake: "Before TS 4.5 Awaited did not exist. Promise.all() had issues with nested Promises. Awaited resolved this long-standing issue."
    }
  },

  // --- Frage 4: async Rueckgabetyp — correct: 1 ---
  {
    question: "What is the return type of: async function f() { return 42; }?",
    options: [
      "number — async does not change the return type",
      "Promise<number> — async ALWAYS wraps in Promise",
      "Promise<number> | number — depending on the call context",
      "Awaited<number> — async uses Awaited internally",
    ],
    correct: 1,
    explanation:
      "Every async function returns Promise<T>, regardless of what you return. " +
      "'return 42' inside an async function becomes Promise.resolve(42). " +
      "The return type is ALWAYS Promise<T>.",
    elaboratedFeedback: {
      whyCorrect: "This is JavaScript specification, not TypeScript-specific. async function f() { return 42; } — f() returns a Promise. TypeScript models this correctly.",
      commonMistake: "Some think that if there is no await in the function, TypeScript would not wrap the type. But async alone is enough."
    }
  },

  // --- Frage 5: catch-Typ — correct: 1 ---
  {
    question: "What type does 'error' have in a catch block with useUnknownInCatchVariables: true?",
    options: [
      "Error — catch always catches Error objects, so the type is narrowed to Error",
      "unknown — TypeScript does not know what was thrown",
      "any — catch variables are always any, since JavaScript can throw arbitrary values",
      "never — the catch block is unreachable, so the type is set to never",
    ],
    correct: 1,
    explanation:
      "With useUnknownInCatchVariables: true (part of strict since TS 4.4) the catch variable is 'unknown'. " +
      "You must use type narrowing (e.g. instanceof Error) before accessing properties.",
    elaboratedFeedback: {
      whyCorrect: "JavaScript can throw ANYTHING: strings, numbers, objects, undefined. TypeScript cannot statically analyze what gets thrown. 'unknown' enforces a check — that is safer than 'any'.",
      commonMistake: "Without useUnknownInCatchVariables, error is 'any'. That means: error.message compiles without errors, even if error is a string or undefined."
    }
  },

  // --- Frage 6: Promise.all Typ — correct: 2 ---
  {
    question: "What type does the result of: await Promise.all([fetchUser(), fetchPosts()]) have?",
    options: [
      "(User | Post[])[] — an array of the union, since Promise.all combines all results",
      "Promise<[User, Post[]]> — the Promise is not resolved because await only unwraps the outermost layer",
      "[User, Post[]] — a tuple with exact types per position",
      "User & Post[] — an intersection, since both types must be satisfied simultaneously",
    ],
    correct: 2,
    explanation:
      "Promise.all() with an array literal produces a tuple type. Each position " +
      "in the result corresponds to the resolved type of the Promise at that position. " +
      "await unwraps the outer Promise.",
    elaboratedFeedback: {
      whyCorrect: "Promise.all has overloads for tuples: all<T extends readonly unknown[]>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>. This maps over the tuple and unwraps each element.",
      commonMistake: "Many expect an array of the union. That would be the case with Promise.all(array), but with Promise.all([a, b]) TypeScript recognizes the array literal as a tuple."
    }
  },

  // --- Frage 7: forEach mit async — correct: 2 ---
  {
    question: "What is the problem with: ids.forEach(async id => { await deleteUser(id); })?",
    options: [
      "forEach does not accept async callbacks, so the code does not compile",
      "deleteUser is called synchronously instead of asynchronously, which destroys the order",
      "The Promises are not collected — the function returns before all of them are done",
      "The type of ids is changed to Promise<string>[], causing compile errors later",
    ],
    correct: 2,
    explanation:
      "forEach ignores the return type of the callback. Since async callbacks return Promise<void>, " +
      "the Promises are created but never awaited. The outer function returns " +
      "while the deletes are still running. Solution: for...of or Promise.all.",
    elaboratedFeedback: {
      whyCorrect: "forEach has the signature: forEach(callback: (item: T) => void): void. The void return type means: whatever the callback returns is ignored. The Promises vanish into thin air.",
      commonMistake: "This is a common bug that is hard to find because no compile error occurs. TypeScript allows async callbacks in forEach — it just does not warn that the Promises are lost."
    }
  },

  // --- Frage 8: retry Pattern — correct: 3 ---
  {
    question: "Why does retry() take a function () => Promise<T> instead of directly a Promise<T>?",
    options: [
      "Because functions use less memory than Promises, which matters when retrying many times",
      "Because TypeScript can only infer generics from functions and not from concrete Promise values at compile time",
      "Because Promises cannot be passed as parameters in TypeScript — only function types are allowed",
      "Because a Promise starts immediately — with a function, retry can restart fresh on each attempt",
    ],
    correct: 3,
    explanation:
      "A Promise begins executing immediately upon creation. If retry took a " +
      "Promise<T>, it could not repeat the operation — the Promise has already " +
      "started. With () => Promise<T>, retry can call the function fresh on each attempt.",
    elaboratedFeedback: {
      whyCorrect: "retry(fetchUser('123'), ...) — fetchUser is already called, the Promise is running. retry(() => fetchUser('123'), ...) — fetchUser is only called on each attempt.",
      commonMistake: "This is a fundamental difference between 'eager' and 'lazy' execution. Promises are eager (start immediately), functions are lazy (start on call)."
    }
  },

  // --- Frage 9: AsyncGenerator — correct: 3 ---
  {
    question: "What does the type parameter 'Y' in AsyncGenerator<Y, R, N> represent?",
    options: [
      "The type of the yielded value when 'done: true' — i.e. the last value when the generator finishes",
      "The type passed into next() — i.e. the parameter you supply when calling next()",
      "The type of the final return value — i.e. the result when the generator finishes with return()",
      "The type of the values delivered at each yield",
    ],
    correct: 3,
    explanation:
      "AsyncGenerator<Y, R, N>: Y = Yield type (what is returned at each yield), " +
      "R = Return type (what is returned at return), N = Next type (what is passed into next()). " +
      "for-await-of iterates over Y values.",
    elaboratedFeedback: {
      whyCorrect: "async function* gen(): AsyncGenerator<string, number, boolean> — yield 'hello' delivers string (Y), return 42 delivers number (R), gen.next(true) accepts boolean (N).",
      commonMistake: "Most generator usages only need Y: AsyncGenerator<string>. R and N have defaults (any and unknown). Only for bidirectional communication (next with value) do you need N."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which utility type recursively unwraps nested Promises (since TS 4.5)?",
    expectedAnswer: "Awaited",
    acceptableAnswers: ["Awaited", "Awaited<T>", "awaited"],
    explanation:
      "Awaited<T> unwraps recursively: Awaited<Promise<Promise<string>>> = string. " +
      "It mirrors JavaScript behavior where nested Promises are automatically resolved.",
  },

  {
    type: "short-answer",
    question: "Which tsconfig option makes catch variables 'unknown' instead of 'any'?",
    expectedAnswer: "useUnknownInCatchVariables",
    acceptableAnswers: ["useUnknownInCatchVariables", "useunknownincatchvariables"],
    explanation:
      "useUnknownInCatchVariables (since TS 4.4, part of strict) changes the type of the " +
      "catch variable from 'any' to 'unknown'. This enforces type narrowing before accessing properties.",
  },

  {
    type: "short-answer",
    question: "What is the minimal Promise interface called that only has then()?",
    expectedAnswer: "PromiseLike",
    acceptableAnswers: ["PromiseLike", "PromiseLike<T>", "promiselike"],
    explanation:
      "PromiseLike<T> defines only then() — no catch(), no finally(). It is " +
      "compatible with any 'thenable' object, including library promises " +
      "that do not inherit from native Promise.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Does this code compile? Answer with 'Yes' or 'No'.",
    code:
      "async function f(): Promise<string> {\n" +
      "  return 42;\n" +
      "}",
    expectedAnswer: "No",
    acceptableAnswers: ["No", "no", "Nein", "nein", "Compile-Error", "Error"],
    explanation:
      "The function declares Promise<string> as its return type, but returns 42 (number). " +
      "TypeScript reports: Type 'number' is not assignable to type 'string'. " +
      "async wraps 42 in Promise.resolve(42), but Promise<number> is not Promise<string>.",
  },

  {
    type: "predict-output",
    question: "What type does 'result' have?",
    code:
      "const p1 = Promise.resolve(42);\n" +
      "const p2 = Promise.resolve('hello');\n" +
      "const result = await Promise.all([p1, p2]);",
    expectedAnswer: "[number, string]",
    acceptableAnswers: [
      "[number, string]",
      "[ number, string ]",
      "readonly [number, string]",
    ],
    explanation:
      "Promise.all with an array literal produces a tuple type. p1 is Promise<number>, " +
      "p2 is Promise<string>. await Promise.all([p1, p2]) unwraps to [number, string]. " +
      "The order is preserved.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is HttpClient.get<User[]>('/api/users') in Angular a 'trust me, compiler' " +
      "and not real type safety? What is missing?",
    modelAnswer:
      "HttpClient.get<T>() is a generic cast: you tell the compiler that the API " +
      "returns T. TypeScript does NOT verify whether the API actually delivers T. The " +
      "type parameter is a compile-time promise without a runtime guarantee. If the API " +
      "changes its schema (e.g. 'name' becomes 'fullName'), the code continues to compile " +
      "without errors — the error only occurs at runtime. What is missing: runtime validation " +
      "with Zod, Valibot, or a similar schema validator that checks the actual " +
      "API response against the expected type.",
    keyPoints: [
      "HttpClient.get<T>() is a compile-time cast, not a runtime check",
      "The API can deliver arbitrary data — TypeScript does not see it",
      "API schema changes break the code only at runtime",
      "Solution: runtime validation with Zod/Valibot (L32)",
    ],
  },
];