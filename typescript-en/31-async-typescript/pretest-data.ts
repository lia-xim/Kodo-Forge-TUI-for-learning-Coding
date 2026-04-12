// pretest-data.ts — L31: Async TypeScript
// 18 questions (3 per section)
// correct-index distribution: 5×0, 4×1, 5×2, 4×3

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: Promise Types ──────────────────────────────────────────

  // Q1 → correct:0 (unchanged — was already correct:0)
  {
    sectionIndex: 1,
    question: "What does the type parameter in Promise<string> describe?",
    options: [
      "The type of the resolved value",
      "The type of the error",
      "The type of the Promise object itself",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Promise<T> describes the type of the value passed to resolve().",
  },

  // Q2 → correct:1 (unchanged)
  {
    sectionIndex: 1,
    question: "What does Awaited<Promise<Promise<number>>> produce?",
    options: [
      "Promise<number>",
      "number — recursively unwraps all Promise layers",
      "Compile error — nested Promises not supported",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "Awaited<T> recursively unwraps all Promise layers down to the base type.",
  },

  // Q3 → correct:0 (correct answer moved to front)
  {
    sectionIndex: 1,
    question: "What is PromiseLike<T>?",
    options: [
      "The minimal interface with only then() — for 'thenable' objects",
      "An alias for Promise<T>",
      "A deprecated type from older TypeScript versions",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "PromiseLike<T> only has then() and is compatible with any object that has a then() method.",
  },

  // ─── Section 2: async/await and Type Inference ────────────────────────────

  // Q4 → correct:2 (correct answer at position 2)
  {
    sectionIndex: 2,
    question: "What is the return type of an async function that has 'return 42'?",
    options: [
      "number",
      "Promise<number> | number",
      "Promise<number>",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "async functions ALWAYS wrap the return type in Promise<T>.",
  },

  // Q5 → correct:0 (correct answer moved to front)
  {
    sectionIndex: 2,
    question: "What does response.json() return in fetch?",
    options: [
      "Promise<any> — a type hole",
      "Promise<unknown>",
      "The parsed JSON type",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "json() returns Promise<any>. The 'any' infects all derived types.",
  },

  // Q6 → correct:1 (unchanged)
  {
    sectionIndex: 2,
    question: "What happens when you write 'await' before a non-Promise value?",
    options: [
      "Compile error",
      "The value is returned unchanged (no-op in the type)",
      "The value is wrapped in a Promise and immediately resolved",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "await on a non-Promise returns the value directly. In types: Awaited<number> = number.",
  },

  // ─── Section 3: Error Handling in Async ────────────────────────────────

  // Q7 → correct:2 (unchanged — was already correct:2)
  {
    sectionIndex: 3,
    question: "What type does the catch variable have with 'strict: true' since TS 4.4?",
    options: [
      "Error",
      "any",
      "unknown",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "With useUnknownInCatchVariables (part of strict) the catch variable is 'unknown'.",
  },

  // Q8 → correct:1 (unchanged)
  {
    sectionIndex: 3,
    question: "Why can't TypeScript determine the exact error type in catch?",
    options: [
      "Because catch only catches Error objects",
      "Because JavaScript allows throw with ANY value",
      "Because TypeScript doesn't support exception types",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "throw can throw strings, numbers, objects, undefined. TypeScript would have to track all throw paths.",
  },

  // Q9 → correct:2 (correct answer at position 2)
  {
    sectionIndex: 3,
    question: "What is the Async Result Pattern?",
    options: [
      "A special try/catch syntax for async",
      "An Angular-specific error handling pattern",
      "A pattern that converts Promise<T> into Promise<Result<T>>",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "trySafe<T>(promise) catches errors and returns Result<T> — errors become visible in the type.",
  },

  // ─── Section 4: Generic Async Patterns ──────────────────────────────────

  // Q10 → correct:0 (correct answer moved to front)
  {
    sectionIndex: 4,
    question: "Why does a retry function take () => Promise<T> instead of Promise<T>?",
    options: [
      "Because a Promise starts immediately — the function enables repetition",
      "Because TypeScript can't infer the type otherwise",
      "Because Promises can't be passed as parameters",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "Promises are eager (start immediately). A function is lazy and can be called fresh on each retry.",
  },

  // Q11 → correct:2 (correct answer at position 2)
  {
    sectionIndex: 4,
    question: "What does AbortController do better than Promise.race for a timeout?",
    options: [
      "AbortController is faster",
      "AbortController has better types",
      "AbortController actually cancels the operation, race lets it keep running",
      "I don't know",
    ],
    correct: 2,
    briefExplanation: "Promise.race returns the fastest result, but the slow Promise keeps running. AbortController cancels it.",
  },

  // Q12 → correct:3 (correct answer moved to end)
  {
    sectionIndex: 4,
    question: "Why does 'never' disappear in Promise.race([Promise<T>, Promise<never>])?",
    options: [
      "never is an error type",
      "TypeScript ignores Promise<never>",
      "never is converted to unknown",
      "never is the empty set — T | never = T",
    ],
    correct: 3,
    briefExplanation: "never is the bottom type (empty set). In a union it disappears: T | never = T.",
  },

  // ─── Section 5: AsyncIterable and Generators ──────────────────────────

  // Q13 → correct:0 (correct answer moved to front)
  {
    sectionIndex: 5,
    question: "What does 'async function*' mean in TypeScript?",
    options: [
      "An async generator that can yield values asynchronously",
      "A function that creates Promises",
      "A function with a star operator for multiplication",
      "I don't know",
    ],
    correct: 0,
    briefExplanation: "async function* defines an async generator. It can deliver values asynchronously with yield.",
  },

  // Q14 → correct:1 (unchanged)
  {
    sectionIndex: 5,
    question: "What is IteratorResult<T, TReturn>?",
    options: [
      "A Promise that returns T",
      "A discriminated union: { done: false; value: T } | { done: true; value: TReturn }",
      "An error type for iterator errors",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "IteratorResult is a discriminated union. 'done' is the discriminant — value has different types depending on done.",
  },

  // Q15 → correct:3 (correct answer moved to end)
  {
    sectionIndex: 5,
    question: "What happens on 'break' in a for-await-of loop?",
    options: [
      "The generator keeps running in the background",
      "There is a compile error",
      "The next yield is still executed",
      "gen.return() is automatically called",
    ],
    correct: 3,
    briefExplanation: "break implicitly calls return() on the iterator. The generator is cleanly terminated.",
  },

  // ─── Section 6: Practice — Frameworks ────────────────────────────────────

  // Q16 → correct:2 (correct answer at position 2) — note: original was correct:1, keeping as-is per source
  {
    sectionIndex: 6,
    question: "What is the problem with HttpClient.get<User[]>('/api/users') in Angular?",
    options: [
      "The type is wrong — it should be Observable<User[]>",
      "It's a 'trust me, compiler' — no runtime check that the API actually returns User[]",
      "HttpClient doesn't accept generics",
      "I don't know",
    ],
    correct: 1,
    briefExplanation: "HttpClient.get<T>() is a compile-time promise. TypeScript doesn't verify what the API actually returns.",
  },

  // Q17 → correct:3 (correct answer moved to end)
  {
    sectionIndex: 6,
    question: "What is the advantage of Typed API Routes as a central type map?",
    options: [
      "They make HTTP calls faster",
      "They replace REST with GraphQL",
      "They reduce bundle size",
      "Autocomplete and type safety for all endpoints in one place",
    ],
    correct: 3,
    briefExplanation: "A central type map defines all endpoints with their request/response types. IDE autocomplete and compile checks included.",
  },

  // Q18 → correct:3 (correct answer moved to end)
  {
    sectionIndex: 6,
    question: "What closes the gap between TypeScript types and actual API data?",
    options: [
      "Stricter tsconfig options",
      "More generics in the code",
      "Readonly types in interfaces",
      "Runtime validation with Zod, Valibot, or similar libraries",
    ],
    correct: 3,
    briefExplanation: "Runtime validation checks the actual data against a schema — not just the TypeScript type.",
  },
];