/**
 * Lesson 43 — Quiz Data: TypeScript with RxJS
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 *
 * correct-index distribution: 0=2, 1=2, 2=2, 3=2 (MC), then SA/PO/EW
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "43";
export const lessonTitle = "TypeScript with RxJS";

export const questions: QuizQuestion[] = [
  // --- Question 1: OperatorFunction (correct: 0) ---
  {
    question:
      "What is the return type of `map(user => user.email)` when `user: User`?",
    options: [
      "OperatorFunction<User, string> — a function from Observable<User> to Observable<string>",
      "Observable<string> — map returns an Observable directly, not a wrapper function",
      "string — the type of the emitted value, since map directly returns the projection's return type",
      "OperatorFunction<string, User> — the order is reversed, output becomes input",
    ],
    correct: 0,
    explanation:
      "map(fn) does NOT return Observable<R>, but OperatorFunction<T, R> — " +
      "a function that takes Observable<T> and returns Observable<R>. " +
      "Only .pipe() applies the operator to the preceding Observable.",
    elaboratedFeedback: {
      whyCorrect:
        "map is a higher-order function: it takes a projection and returns a " +
        "function that transforms Observables. This enables elegant pipe composition: " +
        "each operator is independent and composable.",
      commonMistake:
        "Many think map returns Observable<string>. It only does so when applied " +
        "inside .pipe(). Before that, it is an incomplete transformation.",
    },
  },

  // --- Question 2: BehaviorSubject initial value (correct: 1) ---
  {
    question:
      "Why is `new BehaviorSubject<User | null>(null)` better than `new BehaviorSubject<User>({} as User)`?",
    options: [
      "BehaviorSubject<User> does not allow an initial value — only BehaviorSubject<User | null> accepts union types",
      "null is semantically correct ('no user'), {} as User is a cast that hides missing fields",
      "The union type User | null has better runtime performance than a cast empty object",
      "TypeScript does not allow {} as User in strict mode — the cast is flagged as a compile error",
    ],
    correct: 1,
    explanation:
      "`{} as User` is a type cast that lies to TypeScript: the object has no " +
      "User fields at runtime. `null` is semantically honest: no user is logged in. " +
      "The union type enforces null checks before every access.",
    elaboratedFeedback: {
      whyCorrect:
        "Types should model reality. 'No user' is not the same as 'a user with empty fields'. " +
        "null is the correct representation of absence, and TypeScript then enforces " +
        "`if (user !== null)` before every access.",
      commonMistake:
        "Many avoid union types because they require more null checks. But that is " +
        "exactly the point: the checks ensure you never accidentally call undefined.name.",
    },
  },

  // --- Question 3: filter with type predicate (correct: 2) ---
  {
    question:
      "What is the type of `admin$` after this code?",
    code:
      "function isAdmin(user: User): user is Admin { return user.role === 'admin'; }\n" +
      "const admin$ = users$.pipe(filter(isAdmin));",
    options: [
      "Observable<User> — filter never changes the type",
      "Observable<User | Admin> — the type is widened",
      "Observable<Admin> — filter with a type predicate narrows the type",
      "Observable<boolean> — filter returns the return type of the predicate function",
    ],
    correct: 2,
    explanation:
      "A type predicate `user is Admin` tells TypeScript: 'If this function returns true, " +
      "user is of type Admin.' RxJS uses this: filter with a type predicate returns " +
      "OperatorFunction<T, S> (S is the narrowed type).",
    elaboratedFeedback: {
      whyCorrect:
        "filter has two signatures: with a normal boolean predicate it returns OperatorFunction<T, T>. " +
        "With a type predicate `(v: T) => v is S` it returns OperatorFunction<T, S>. " +
        "This is real type narrowing at the stream level.",
      commonMistake:
        "Without a type predicate (i.e. `filter(u => u.role === 'admin')`) the type stays " +
        "Observable<User>. TypeScript cannot derive type narrowing from a boolean return type.",
    },
  },

  // --- Question 4: combineLatest Tuple (correct: 3) ---
  {
    question:
      "What type does TypeScript infer for `combined$`?",
    code:
      "const a$ = of<string>('hallo');\n" +
      "const b$ = of<number>(42);\n" +
      "const combined$ = combineLatest([a$, b$]);",
    options: [
      "Observable<string | number> — union of all types, since combineLatest merges them into a common type",
      "Observable<[string | number, string | number]> — homogeneous tuple, both positions have the same union type",
      "Observable<Array<string | number>> — typed array, elements are either string or number",
      "Observable<[string, number]> — precise tuple with positional types",
    ],
    correct: 3,
    explanation:
      "Thanks to TypeScript 4.0 Variadic Tuple Types, combineLatest infers a precise " +
      "tuple: Observable<[string, number]>. Position 0 is always string, position 1 " +
      "always number. No union, no homogeneous array.",
    elaboratedFeedback: {
      whyCorrect:
        "Variadic Tuple Types allow TypeScript to describe fixed-length arrays with " +
        "position-dependent types. RxJS 7 uses this for all combination operators. " +
        "It makes destructuring completely type-safe.",
      commonMistake:
        "Before TypeScript 4.0 / RxJS 7 it was actually Observable<(string | number)[]>. " +
        "That was barely usable. The improvement came with the upgrade of both libraries.",
    },
  },

  // --- Question 5: toSignal without options (correct: 0) ---
  {
    question:
      "What type does `user` have in this component?",
    code:
      "class Comp {\n" +
      "  user = toSignal(this.userService.currentUser$);\n" +
      "  // currentUser$: Observable<User>\n" +
      "}",
    options: [
      "Signal<User | undefined> — undefined until the first emitted value",
      "Signal<User> — toSignal knows the Observable's type and infers it correctly",
      "Signal<User | null> — Angular initializes with null instead of undefined as the default value",
      "WritableSignal<User | undefined> — Signals are always writable and can be modified directly",
    ],
    correct: 0,
    explanation:
      "toSignal without options returns Signal<T | undefined>. The 'undefined' " +
      "is realistic: before the Observable emits, the signal has no value. " +
      "With `initialValue` or `requireSync` the type changes.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript models the semantics correctly: a signal from an asynchronous " +
        "Observable is initially undefined. Hiding that (Signal<User>) lies about " +
        "the state and risks runtime errors.",
      commonMistake:
        "Many want Signal<User> without undefined. This is only possible with " +
        "{ requireSync: true } — but only if the Observable emits synchronously " +
        "(e.g. BehaviorSubject or startWith).",
    },
  },

  // --- Question 6: EMPTY type (correct: 1) ---
  {
    question: "Why can `EMPTY` be returned as Observable<User> in `catchError`?",
    options: [
      "Because EMPTY is internally an Observable<any> and can therefore be assigned to any type parameter",
      "Because EMPTY has the type Observable<never> and never is a subtype of every T",
      "Because catchError ignores the type when EMPTY is returned — it is a special case",
      "Because User and never are structurally compatible — both have the same property structure",
    ],
    correct: 1,
    explanation:
      "EMPTY has the type Observable<never>. never is the bottom type in TypeScript — " +
      "it is a subtype of every other type. Therefore Observable<never> is assignable " +
      "to Observable<User>: EMPTY never emits, so there is no type conflict.",
    elaboratedFeedback: {
      whyCorrect:
        "The bottom-type rule: never extends every type T. This makes never the perfect " +
        "type for things that never happen (functions that never return, Observables that " +
        "never emit). EMPTY is the Observable equivalent of a function that throws.",
      commonMistake:
        "Many are surprised that TypeScript accepts EMPTY as Observable<User>. " +
        "The key is: no value is emitted, so no type error can occur.",
    },
  },

  // --- Question 7: forkJoin object syntax (correct: 2) ---
  {
    question: "What is the main advantage of forkJoin's object syntax over the array syntax?",
    options: [
      "The object syntax is faster because TypeScript has to infer fewer types than with the array syntax",
      "The object syntax allows more than 6 Observables (array syntax is limited to 6 elements)",
      "Named properties instead of positional indices — TypeScript infers { user: User, posts: Post[] }",
      "The object syntax allows different error handling per Observable — each key can have its own catchError",
    ],
    correct: 2,
    explanation:
      "forkJoin({ user: user$, posts: posts$ }) infers { user: User, posts: Post[] }. " +
      "The array syntax returns [User, Post[]] — positions must be counted. " +
      "When restructuring (adding a new Observable in between) everything shifts — dangerous.",
    elaboratedFeedback: {
      whyCorrect:
        "Named properties are self-documenting and refactor-safe. " +
        "Destructuring `{ user, posts }` is clearer than `[user, posts]` with multiple Observables. " +
        "TypeScript correctly infers the object type with the key names.",
      commonMistake:
        "Many use the array syntax out of habit from Promise.all. With 2 Observables that's fine. " +
        "With 4+ the object syntax is recommended for readability.",
    },
  },

  // --- Question 8: RxJS 7 error: unknown (correct: 3) ---
  {
    question: "Why is `error: unknown` in catchError safer than `error: any`?",
    options: [
      "unknown is faster to check than any at runtime — the type check is optimized by the compiler",
      "unknown prevents memory leaks in subscriptions — any can hold references that are not cleaned up",
      "unknown means the error is always an Error instance — any can have any arbitrary type",
      "unknown enforces type checking before property access, any disables all checks",
    ],
    correct: 3,
    explanation:
      "With `error: any` TypeScript accepts `error.message`, `error.status` etc. without checks. " +
      "With `error: unknown` you must first check `instanceof Error`. This enforces " +
      "correct error handling and prevents property access on undefined.",
    elaboratedFeedback: {
      whyCorrect:
        "any disables the type system entirely — every property access is accepted. " +
        "unknown says: 'I don't know what this is, check it first.' " +
        "RxJS 7 and TypeScript 4.4 introduced this change in sync.",
      commonMistake:
        "Some cast error to any: `(error as any).message`. That is the anti-pattern — " +
        "you bypass safety explicitly. Better: `instanceof` check and then safe access.",
    },
  },

  // ─── Short-Answer Questions ──────────────────────────────────────────────

  // --- Question 9: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which TypeScript feature (introduced in TS 4.0) enables " +
      "combineLatest([a$, b$, c$]) to infer the type Observable<[A, B, C]> " +
      "instead of Observable<(A | B | C)[]>?",
    expectedAnswer: "Variadic Tuple Types",
    acceptableAnswers: [
      "Variadic Tuple Types", "variadic tuple types", "Variadic Tuples",
      "variadic tuples", "Variadic Tuple", "variadic tuple",
    ],
    explanation:
      "Variadic Tuple Types (TypeScript 4.0) allow the compiler to describe fixed-length " +
      "arrays with position-dependent types. " +
      "RxJS 7 uses this in all combination operators.",
  },

  // --- Question 10: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which option must be specified with toSignal() so that the return type is " +
      "`Signal<T>` instead of `Signal<T | undefined>` — for an Observable that is " +
      "guaranteed to emit its first value synchronously (e.g. BehaviorSubject)?",
    expectedAnswer: "requireSync",
    acceptableAnswers: [
      "requireSync", "requireSync: true", "{ requireSync: true }",
    ],
    explanation:
      "{ requireSync: true } tells toSignal(): 'The Observable emits synchronously, " +
      "no undefined as the initial state.' Angular throws a runtime error if " +
      "the Observable does not emit synchronously. The type becomes Signal<T>.",
  },

  // --- Question 11: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which RxJS operator do you use to automatically end a subscription " +
      "when an Angular component is destroyed — without manual unsubscribe()?",
    expectedAnswer: "takeUntilDestroyed",
    acceptableAnswers: [
      "takeUntilDestroyed", "takeUntilDestroyed()", "takeUntilDestroyed(destroyRef)",
    ],
    explanation:
      "takeUntilDestroyed() (from @angular/core/rxjs-interop) automatically ends the subscription " +
      "when DestroyRef.onDestroy is triggered. In the constructor context it finds DestroyRef " +
      "automatically. Memory leaks from forgotten unsubscribe calls are avoided.",
  },

  // ─── Predict-Output Questions ────────────────────────────────────────────

  // --- Question 12: Predict-Output ---
  {
    type: "predict-output",
    question: "What values does `result$` emit and in what order?",
    code:
      "import { zip, of } from 'rxjs';\n\n" +
      "const names$ = of('Alice', 'Bob', 'Charlie');\n" +
      "const scores$ = of(95, 87);\n\n" +
      "const result$ = zip(names$, scores$);\n" +
      "result$.subscribe(([name, score]) => console.log(`${name}: ${score}`));",
    expectedAnswer: "Alice: 95\nBob: 87",
    acceptableAnswers: [
      "Alice: 95\nBob: 87",
      "Alice: 95, Bob: 87",
      "[Alice, 95], [Bob, 87]",
      "Alice: 95 Bob: 87",
    ],
    explanation:
      "zip forms strict 1:1 pairs. It takes one value from each Observable at a time. " +
      "scores$ has only 2 values — after the second pair, scores$ is complete, so zip " +
      "also completes. Charlie gets no counterpart and is ignored.",
  },

  // --- Question 13: Predict-Output ---
  {
    type: "predict-output",
    question: "What type does `result` have after the map operator?",
    code:
      "import { of } from 'rxjs';\n" +
      "import { map } from 'rxjs/operators';\n\n" +
      "const result$ = of({ name: 'Max', age: 30 }).pipe(\n" +
      "  map(user => ({\n" +
      "    display: `${user.name} (${user.age})`,\n" +
      "    isAdult: user.age >= 18,\n" +
      "  }))\n" +
      ");\n\n" +
      "// Type of result$ ?",
    expectedAnswer: "Observable<{ display: string; isAdult: boolean }>",
    acceptableAnswers: [
      "Observable<{ display: string; isAdult: boolean }>",
      "Observable<{display: string; isAdult: boolean}>",
      "Observable<{ display: string, isAdult: boolean }>",
    ],
    explanation:
      "TypeScript infers the object literal type from the map function. " +
      "No interface needed: { display: string; isAdult: boolean } is inferred as the " +
      "type of the object literal. Structural typing in action.",
  },

  // ─── Explain-Why Questions ───────────────────────────────────────────────

  // --- Question 14: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Explain why `filter(user => user.isActive)` in an RxJS pipeline does NOT change " +
      "the type Observable<User>, but `filter((user): user is Admin => user.role === 'admin')` " +
      "changes the type to Observable<Admin>. What is the technical difference?",
    modelAnswer:
      "filter has two signatures. Without a type predicate: `filter(predicate: (v: T) => boolean)` " +
      "returns OperatorFunction<T, T> — the type stays T. " +
      "With a type predicate: `filter(predicate: (v: T) => v is S)` returns OperatorFunction<T, S>. " +
      "The type predicate `user is Admin` tells TypeScript: 'If this function returns true, " +
      "I know that user is of type Admin.' TypeScript uses this to narrow the stream type. " +
      "Without a predicate TypeScript only sees boolean and cannot derive any type narrowing.",
    keyPoints: [
      "filter has two signatures (overloads)",
      "boolean as return: type stays T",
      "Type predicate `v is S`: type is narrowed to S",
      "Type predicates are a TypeScript compile-time concept",
      "No runtime difference, only different type signatures",
    ],
  },

  // --- Question 15: Explain-Why ---
  {
    type: "explain-why",
    question:
      "You are building an Angular service that loads user data. Explain why you should " +
      "treat errors in catchError as `unknown` instead of simply casting `error as HttpErrorResponse`. " +
      "What can go wrong?",
    modelAnswer:
      "Not every error is an HttpErrorResponse. Possible error types: " +
      "HttpErrorResponse (HTTP errors), TypeError (network problems, null access), " +
      "SyntaxError (invalid JSON response), DOMException (CORS), or even " +
      "primitive types like string when throwError(() => 'error') is used. " +
      "A cast `error as HttpErrorResponse` allows TypeScript to do this without checking — " +
      "but at runtime error.status can be undefined if error is not an HttpErrorResponse. " +
      "This leads to hard-to-debug errors. The correct solution is an instanceof check " +
      "that safely narrows the type.",
    keyPoints: [
      "Errors can be of any type — not just HttpErrorResponse",
      "as-cast lies to TypeScript — no runtime protection",
      "instanceof checks at runtime and narrows the type simultaneously",
      "RxJS 7 changed the type to unknown to enforce exactly that",
      "Each type of error needs its own handling",
    ],
  },
];