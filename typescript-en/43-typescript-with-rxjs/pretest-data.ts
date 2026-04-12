/**
 * Lesson 43 — Pre-Test Questions: TypeScript with RxJS
 *
 * 3 questions per section (6 sections = 18 questions), asked BEFORE reading.
 * Goal: 'Prime' the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section the question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Brief explanation (only becomes relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: RxJS and TypeScript — Why They Fit Together ─────────────

  {
    sectionIndex: 1,
    question:
      "What is the mathematical concept behind RxJS? Erik Meijer called it the 'dual' of what?",
    options: [
      "The dual of Promises — async instead of sync",
      "The dual of Iterables — push instead of pull",
      "The dual of Arrays — lazy instead of eager",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Iterables pull values (pull, you request them). Observables push values (push, " +
      "they deliver actively). This is the mathematical dual — not just a metaphor.",
  },
  {
    sectionIndex: 1,
    question:
      "You write `this.http.get('/api/users')` without a generic type. What is the problem?",
    options: [
      "There is a compile error — generic is required",
      "You get Observable<Object> — all type information in the pipeline is lost",
      "TypeScript automatically infers the type from the API response",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Without `<T>`, HttpClient.get() returns Observable<Object>. Every map(), filter() " +
      "afterwards works on Object — no autocomplete, no type checking.",
  },
  {
    sectionIndex: 1,
    question:
      "What is `OperatorFunction<T, R>` — the core type of all pipeable operators?",
    options: [
      "A class that extends Observable<T>",
      "A function that takes Observable<T> and returns Observable<R>",
      "An interface for error handling",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "`type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>`. " +
      "Every operator is a function that transforms Observables — and TypeScript " +
      "tracks T and R throughout the entire .pipe() chain.",
  },

  // ─── Section 2: Observable, Subject, BehaviorSubject ────────────────────

  {
    sectionIndex: 2,
    question:
      "What is the difference between Subject<T> and BehaviorSubject<T>?",
    options: [
      "Subject has an initial value, BehaviorSubject does not",
      "BehaviorSubject has an initial value and stores the last value — Subject does not",
      "BehaviorSubject can only be listened to by one subscriber",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "BehaviorSubject requires an initial value upon creation and stores the last value. " +
      "New subscribers receive it immediately. Subject has no state — " +
      "late subscribers miss past values.",
  },
  {
    sectionIndex: 2,
    question:
      "Why do Angular services return `subject.asObservable()` instead of the Subject itself?",
    options: [
      "asObservable() has better performance",
      "So that external consumers cannot call next() — encapsulating write access",
      "TypeScript does not allow direct Subject access",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Subject is both Observable and Observer. If you return it, consumers can call `.next()` " +
      "and directly manipulate the state. " +
      "asObservable() provides only the read-only Observable interface.",
  },
  {
    sectionIndex: 2,
    question:
      "Which Subject type emits ONLY the last value — and only when complete() is called?",
    options: [
      "BehaviorSubject",
      "ReplaySubject(1)",
      "AsyncSubject",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "AsyncSubject is the Observable equivalent of a Promise: it emits exactly once, " +
      "the last value, but only upon complete(). Good for one-time calculations.",
  },

  // ─── Section 3: Operator Types: map, filter, switchMap ──────────────────

  {
    sectionIndex: 3,
    question:
      "What is the difference between switchMap and mergeMap from a TypeScript perspective?",
    options: [
      "None — both have the same type signature, the difference lies in runtime behavior",
      "switchMap returns Observable<T | R>, mergeMap returns Observable<R>",
      "switchMap is more type-safe because it handles errors better",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "switchMap, mergeMap, concatMap, and exhaustMap all have the same type signature: " +
      "T => Observable<R> gives OperatorFunction<T, R>. Only the concurrency behavior " +
      "distinguishes them — and TypeScript cannot describe that.",
  },
  {
    sectionIndex: 3,
    question:
      "What happens to the type when you use `filter(user => user.isActive)` in an RxJS pipeline?",
    options: [
      "The type does NOT change — filter without a type predicate returns OperatorFunction<T, T>",
      "The type is narrowed to Observable<ActiveUser>",
      "The type becomes Observable<boolean>",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "filter without a type predicate returns OperatorFunction<T, T> — the type stays the same. " +
      "Only `filter((u): u is Admin => u.role === 'admin')` narrows the type to Observable<Admin>.",
  },
  {
    sectionIndex: 3,
    question:
      "Why were pipeable operators (`.pipe(map(...))` instead of `.map(...)`) introduced with RxJS 5.5?",
    options: [
      "To enable tree-shaking — standalone functions are only bundled when imported",
      "Because dot-chaining syntax is deprecated in JavaScript",
      "Because TypeScript cannot type method chaining",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Prototype methods are always bundled, even if unused. " +
      "Standalone pipeable operator functions are only included in the bundle when imported — " +
      "tree-shaking significantly reduces bundle size.",
  },

  // ─── Section 4: Combination Operators ───────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "What does `combineLatest([a$, b$])` emit when a$ has a new value but b$ has not yet emitted?",
    options: [
      "It does NOT emit — it waits until both have emitted at least once",
      "It emits immediately with undefined for b$",
      "It emits only the value of a$ as an array with one element",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "combineLatest waits until ALL participants have emitted at least once. " +
      "Only then does it emit — and then on every subsequent emission from any participant.",
  },
  {
    sectionIndex: 4,
    question:
      "Why is `forkJoin({ user: user$, posts: posts$ })` better than `forkJoin([user$, posts$])`?",
    options: [
      "Object syntax is faster",
      "Array syntax is limited to 3 Observables",
      "Named properties are refactor-safe — no need to count positions",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Object syntax gives `{ user: User, posts: Post[] }` — named properties. " +
      "Array syntax gives `[User, Post[]]` — positions must be counted. " +
      "When restructuring (inserting a new Observable), everything shifts.",
  },
  {
    sectionIndex: 4,
    question:
      "What is the difference between zip([a$, b$]) and combineLatest([a$, b$])?",
    options: [
      "zip waits for NEW values from both (1:1 pairs), combineLatest emits on every new value using the latest values",
      "zip returns objects, combineLatest returns arrays",
      "zip is deprecated, combineLatest is the modern replacement",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "zip forms strict 1:1 pairs: value 1 from a$ with value 1 from b$, etc. " +
      "combineLatest emits on EVERY new value from any participant — with the " +
      "latest values of the others.",
  },

  // ─── Section 5: Error Handling ───────────────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "In RxJS 7+, the error parameter in catchError has type 'unknown' instead of 'any'. " +
      "What must you do now before accessing error.message?",
    options: [
      "Cast error as any: (error as any).message",
      "I don't know",
      "Nothing — unknown allows the same access as any",
      "Check error with instanceof: if (error instanceof Error) then error.message",
    ],
    correct: 3,
    briefExplanation:
      "unknown enforces type checking. `instanceof Error` narrows the type from unknown " +
      "to Error — afterwards .message is safely accessible. any would have allowed this " +
      "without checking — dangerous with unknown error sources.",
  },
  {
    sectionIndex: 5,
    question:
      "What TypeScript type does `EMPTY` from RxJS have?",
    options: [
      "Observable<void>",
      "Observable<any>",
      "Observable<never>",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "EMPTY is Observable<never>. never is the bottom type — it never emits a value. " +
      "That is why it can be returned in catchError as Observable<any-type>: " +
      "never extends every type.",
  },
  {
    sectionIndex: 5,
    question:
      "What is the Result pattern in RxJS? What is it used for?",
    options: [
      "A pattern for combining multiple Observables",
      "I don't know",
      "A pattern for avoiding subscribe",
      "Errors are modeled as normal stream values: Observable<{ success: true, data: T } | { success: false, error: E }>",
    ],
    correct: 3,
    briefExplanation:
      "Instead of aborting the pipeline on error, success/failure is mapped as a normal value in the stream. " +
      "The component reacts to success: true vs false — type-safe, " +
      "without catchError duplication.",
  },

  // ─── Section 6: Angular Patterns ─────────────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "What does `toSignal(http.get<User>('/api/user'))` return without any additional options?",
    options: [
      "Signal<User>",
      "Signal<User | null>",
      "Signal<User | undefined>",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Without options, toSignal() returns Signal<T | undefined>. undefined is " +
      "the initial state before the Observable emits. HTTP requests are asynchronous — " +
      "undefined is realistic.",
  },
  {
    sectionIndex: 6,
    question:
      "What does `takeUntilDestroyed()` (from @angular/core/rxjs-interop) do?",
    options: [
      "It pauses the subscription when the component is not visible",
      "I don't know",
      "It returns a Signal instead of an Observable",
      "It ends the subscription when the Angular component is destroyed — automatically",
    ],
    correct: 3,
    briefExplanation:
      "takeUntilDestroyed() subscribes to DestroyRef.onDestroy and ends the subscription " +
      "automatically. No manual unsubscribe(), no ngOnDestroy() needed. " +
      "Memory leaks from forgotten subscriptions are prevented.",
  },
  {
    sectionIndex: 6,
    question:
      "The `async pipe` in an Angular template returns `T | null`, not T. Why?",
    options: [
      "Because Angular always makes async pipes optional",
      "I don't know",
      "Because TypeScript always adds null to Observables",
      "Because null is the initial state — before the Observable emits, the async pipe has no value",
    ],
    correct: 3,
    briefExplanation:
      "The async pipe returns null before the Observable emits its first value. " +
      "That is the main difference from toSignal with initialValue — there you control " +
      "the initial state explicitly.",
  },
];