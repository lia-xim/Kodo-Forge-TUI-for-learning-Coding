/**
 * Lesson 44 — Quiz Data: Advanced Design Patterns
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 *
 * correct-index distribution: 0=4, 1=4, 2=4, 3=3
 * Question format mix: 7 MC, 4 short-answer, 2 predict-output, 2 explain-why
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "44";
export const lessonTitle = "Advanced Design Patterns";

export const questions: QuizQuestion[] = [
  // ─── Multiple Choice ────────────────────────────────────────────────────────

  // --- Question 1: Adapter Pattern (correct: 0) ---
  {
    question:
      "When do you use the Adapter Pattern?",
    options: [
      "When you need to adapt an incompatible interface from a third-party library to your own interface",
      "When you want to hide multiple objects behind a simplified API — that is the Facade Pattern",
      "When you want to encapsulate interchangeable algorithms for the same step — that is the Strategy Pattern",
      "When you want to ensure a class is only instantiated once — that is the Singleton Pattern",
    ],
    correct: 0,
    explanation:
      "The Adapter bridges two incompatible interfaces — typically legacy code or " +
      "third-party libraries. It implements the new interface and delegates internally " +
      "to the old one. Facade (option 2), Strategy (3), and Singleton (4) solve different problems.",
    elaboratedFeedback: {
      whyCorrect:
        "Adapter = interface adaptation. You have something that works (legacy) and " +
        "something you expect (new interface). The Adapter translates between the two " +
        "without touching the legacy code.",
      commonMistake:
        "Many confuse Adapter and Facade. The difference: Adapter adapts an existing class " +
        "to an expected interface. Facade creates a new, simplified interface " +
        "for an entire subsystem.",
    },
  },

  // --- Question 2: Strategy Pattern (correct: 1) ---
  {
    question:
      "What is the main advantage of the Strategy Pattern over an if-else cascade?",
    options: [
      "It is faster at runtime because no branching is executed — the strategy calls the method directly",
      "New strategies can be added without changing existing code (Open/Closed)",
      "It creates fewer objects on the heap and thus saves memory — the strategy objects are shared",
      "It only works with TypeScript interfaces, not abstract classes — it requires structural types",
    ],
    correct: 1,
    explanation:
      "Strategy implements the Open/Closed Principle: you can add new strategies " +
      "by creating a new class that implements the interface — without changing the " +
      "calling code. An if-else cascade must be modified with every new case.",
    elaboratedFeedback: {
      whyCorrect:
        "Each new strategy is a new implementation of the interface — no existing " +
        "code is touched. The validator (or OrderCalculator) knows nothing about the " +
        "concrete strategies and does not need to change when extended.",
      commonMistake:
        "Option 1 is wrong: Strategy creates more objects (delegation overhead), " +
        "not fewer. The advantage is extensibility, not performance.",
    },
  },

  // --- Question 3: Repository Pattern (correct: 2) ---
  {
    question:
      "What concrete advantage does an In-Memory Repository have in tests over a mock?",
    options: [
      "In-Memory repositories are faster than mocks because they have no overhead and access data directly",
      "Mocks cannot implement interfaces — only In-Memory repositories can do that",
      "The In-Memory repository is a real implementation of the contract — it also tests the interaction of multiple methods (e.g. save then findById)",
      "In-Memory repositories do not need a TypeScript interface because they are duck-typed and automatically compatible",
    ],
    correct: 2,
    explanation:
      "A mock only simulates return values. An In-Memory repository is a real " +
      "implementation: save() actually saves, findById() actually finds. " +
      "You can therefore call save() and then findById() — the test verifies the real interaction.",
    elaboratedFeedback: {
      whyCorrect:
        "Integration between methods: when you call save({ id: '1', name: 'Max' }) " +
        "and then findById('1'), you get the object back. A mock would " +
        "simulate findById() independently of the save() call.",
      commonMistake:
        "Mocks are not worse — they are different. Mocks are ideal when you want to " +
        "simulate a specific return value (e.g. an HTTP error). " +
        "In-Memory is better for integration tests of the repository itself.",
    },
  },

  // --- Question 4: SOLID — Liskov (correct: 3) ---
  {
    question:
      "How does TypeScript automatically check the Liskov Substitution Principle (L in SOLID)?",
    options: [
      "Through runtime checks that ensure subclasses correctly inherit and override all methods",
      "Through the `extends` keyword which checks whether the base class is correctly implemented",
      "Through the `override` keyword available since TypeScript 4.3",
      "Through `implements`: TypeScript checks that all methods are present with correct types — wrong signatures are compile errors",
    ],
    correct: 3,
    explanation:
      "When a class writes `Shape implements ShapeInterface`, TypeScript checks " +
      "whether all methods are present and whether the types are correct. A method " +
      "`area(): string` instead of `area(): number` is a compile error — Liskov violated.",
    elaboratedFeedback: {
      whyCorrect:
        "`implements` is the Liskov check at compile time. The class declares: " +
        "'I am a Shape.' TypeScript checks: 'Do you actually conform to the Shape contract?' " +
        "If not: immediate compile error, no runtime crash.",
      commonMistake:
        "`override` (option 3) checks whether a method really overrides a base-class method " +
        "(no accidental additions). That is a different concept " +
        "from the Liskov conformance of the entire type.",
    },
  },

  // --- Question 5: Facade Pattern (correct: 0) ---
  {
    question:
      "An OrderFacade internally calls CartService, PaymentService, InventoryService, and NotificationService. " +
      "Which design principle does it violate when it also contains business logic?",
    options: [
      "Single Responsibility — the Facade orchestrates AND decides business logic",
      "Open/Closed — the Facade is closed for extension and cannot be modified",
      "Liskov Substitution — because the Facade does not implement an interface and is therefore not substitutable",
      "Interface Segregation — the Facade has too many methods and violates the principle of small interfaces",
    ],
    correct: 0,
    explanation:
      "A Facade should *orchestrate*, not *decide*. When it contains business logic " +
      "(e.g. 'if amount > 500, calculate a special discount'), it has " +
      "two responsibilities: coordination AND business decisions. " +
      "That violates Single Responsibility.",
    elaboratedFeedback: {
      whyCorrect:
        "The Facade's responsibility is: call the services in the correct order " +
        "and handle errors. Business decisions belong in the respective service " +
        "(e.g. DiscountService.calculateDiscount()).",
      commonMistake:
        "Option 4 (Interface Segregation) refers to interfaces, not to the " +
        "number of methods on a class. ISP says: clients should not depend on methods " +
        "they do not use — that concerns interface design.",
    },
  },

  // --- Question 6: Command Pattern (correct: 1) ---
  {
    question:
      "Which feature of the Command Pattern explains why NgRx supports Time-Travel Debugging?",
    options: [
      "Commands store all data as immutable snapshots in memory for later access",
      "Each action (Command) is an immutable object — the entire state is produced by replaying all Commands from the beginning",
      "NgRx automatically stores all actions in a database for later analysis and debugging",
      "TypeScript generics allow Commands to be serialized at compile time and thus persist state",
    ],
    correct: 1,
    explanation:
      "The Command Pattern encapsulates actions as objects. NgRx actions are immutable Commands. " +
      "The entire application state is produced by `initialState + Actions[0..n]`. " +
      "Time-Travel: replay only the first k actions — you are at time k.",
    elaboratedFeedback: {
      whyCorrect:
        "Redux/NgRx: `state = reducer(previousState, action)`. If you have stored all actions " +
        "(Redux DevTools do this), you can reconstruct the state at any point in time. " +
        "That is Time-Travel — and it works because Commands (actions) " +
        "are immutable and serializable.",
      commonMistake:
        "Option 1 sounds similar but is wrong: NgRx does not store all states, " +
        "only the current state plus the action history. " +
        "States are recalculated on demand.",
    },
  },

  // --- Question 7: YAGNI and Rule of Three (correct: 2) ---
  {
    question:
      "You are writing almost the same HTTP fetch code for the second time. What does the 'Rule of Three' recommend?",
    options: [
      "Abstract immediately — writing it a second time already shows that duplication is emerging and should be avoided",
      "Always write it directly — abstractions increase complexity without demonstrable benefit",
      "Wait for the third time — only then do you know what will really be reused",
      "Abstract when the function is more than 10 lines — that is the threshold for reuse",
    ],
    correct: 2,
    explanation:
      "The Rule of Three: write it directly the first time. Notice it the second time (duplication). " +
      "Abstract on the third time — now you know which parts really vary and " +
      "which are really the same. Premature abstraction often makes the wrong assumptions.",
    elaboratedFeedback: {
      whyCorrect:
        "On the second occurrence you do not yet know whether the abstraction is right. " +
        "Perhaps the two places have subtle differences that you recognize on the third. " +
        "The abstraction you build on the third time is almost always better " +
        "than the one you would have built on the second.",
      commonMistake:
        "Option 1 leads to over-engineering: abstractions built for requirements " +
        "that never arrived. 'The wrong abstraction is worse " +
        "than duplication.' (Sandi Metz)",
    },
  },

  // ─── Short-Answer ────────────────────────────────────────────────────────────

  // --- Question 8: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which TypeScript keyword ensures that a class implements all methods of an interface " +
      "with the correct types — and otherwise produces a compile error?",
    expectedAnswer: "implements",
    acceptableAnswers: [
      "implements", "Implements",
    ],
    explanation:
      "`implements` is the Liskov check at compile time. TypeScript verifies that all " +
      "methods of the interface are present and that the signatures match. " +
      "Missing or incorrectly typed methods are immediate compile errors.",
  },

  // --- Question 9: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which acronym stands for 'You Ain't Gonna Need It' — the principle of not writing code " +
      "for requirements that do not yet exist?",
    expectedAnswer: "YAGNI",
    acceptableAnswers: [
      "YAGNI", "yagni", "Yagni",
    ],
    explanation:
      "YAGNI (You Ain't Gonna Need It) from Extreme Programming: do not write code " +
      "for speculative future requirements. Abstraction costs complexity — " +
      "it only pays off when the requirement actually arrives.",
  },

  // --- Question 10: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the name of the generic TypeScript object (since ES2015) that enables transparent " +
      "control over property accesses and assignments on another object?",
    expectedAnswer: "Proxy",
    acceptableAnswers: [
      "Proxy", "proxy", "new Proxy",
    ],
    explanation:
      "The JavaScript `Proxy` object intercepts property accesses (`get`), assignments (`set`) " +
      "and other operations. TypeScript makes it type-safe with generics: " +
      "`new Proxy(target, handler)` returns a type T.",
  },

  // --- Question 11: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Name the pattern that provides a simplified interface for a complex " +
      "subsystem of multiple services (one word, English).",
    expectedAnswer: "Facade",
    acceptableAnswers: [
      "Facade", "facade", "Fassade", "fassade",
    ],
    explanation:
      "The Facade Pattern hides subsystem complexity behind " +
      "a simple API. `OrderFacade.placeOrder()` internally orchestrates Cart, Payment, " +
      "Inventory, and Notification — the controller sees only one method.",
  },

  // ─── Predict-Output ─────────────────────────────────────────────────────────

  // --- Question 12: Predict-Output ---
  {
    type: "predict-output",
    question: "What TypeScript error occurs here? Name the core term of the error.",
    code:
      "interface Shape {\n" +
      "  area(): number;\n" +
      "}\n\n" +
      "class Square implements Shape {\n" +
      "  constructor(private side: number) {}\n" +
      "  area(): string {\n" +
      "    return `${this.side * this.side} qm`;\n" +
      "  }\n" +
      "}",
    expectedAnswer: "implements",
    acceptableAnswers: [
      "implements",
      "Property 'area' in type 'Square' is not assignable to the same property in base type 'Shape'",
      "Type 'string' is not assignable to type 'number'",
      "Return type string does not match number",
      "string is not assignable to number",
    ],
    explanation:
      "TypeScript reports an error because `area()` in the Shape interface must " +
      "return `number`, but Square returns `string`. The error occurs at " +
      "`implements Shape` — TypeScript checks signature compatibility.",
  },

  // --- Question 13: Predict-Output ---
  {
    type: "predict-output",
    question: "What does this code output? (Exact value)",
    code:
      "type EventMap = {\n" +
      "  'price:updated': { newPrice: number };\n" +
      "};\n\n" +
      "class Bus<E extends Record<string, unknown>> {\n" +
      "  private listeners = new Map<keyof E, Set<(d: unknown) => void>>();\n\n" +
      "  on<K extends keyof E>(event: K, fn: (d: E[K]) => void): void {\n" +
      "    if (!this.listeners.has(event)) this.listeners.set(event, new Set());\n" +
      "    this.listeners.get(event)!.add(fn as (d: unknown) => void);\n" +
      "  }\n\n" +
      "  emit<K extends keyof E>(event: K, data: E[K]): void {\n" +
      "    this.listeners.get(event)?.forEach(fn => fn(data));\n" +
      "  }\n" +
      "}\n\n" +
      "const bus = new Bus<EventMap>();\n" +
      "bus.on('price:updated', ({ newPrice }) => console.log(newPrice * 2));\n" +
      "bus.emit('price:updated', { newPrice: 21 });",
    expectedAnswer: "42",
    acceptableAnswers: ["42", "42\n"],
    explanation:
      "The listener multiplies `newPrice * 2`. `newPrice` is 21, so " +
      "the output is 42. TypeScript knows at compile time: `{ newPrice: number }` — " +
      "`newPrice * 2` is valid and returns number.",
  },

  // ─── Explain-Why ────────────────────────────────────────────────────────────

  // --- Question 14: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why does Angular's `@Injectable({ providedIn: 'root' })` solve the Singleton problem " +
      "better than the classic Singleton Pattern with a private constructor and " +
      "`getInstance()`? Explain the difference in testability.",
    modelAnswer:
      "The classic Singleton holds the instance as a static property of the class. " +
      "This instance is global — in tests every test case gets the same instance, " +
      "and state changes from one test affect the next. " +
      "You also cannot inject a mock instance because getInstance() always " +
      "returns the same class. " +
      "Angular's DI container manages the instance externally. " +
      "In tests you register a different provider: " +
      "TestBed.overrideProvider(MyService, { useClass: MockMyService }). " +
      "Every test can get a fresh instance or a mock. " +
      "The Singleton behavior (only one instance per application) is preserved, " +
      "but control lies with the container, not with the class itself.",
    keyPoints: [
      "Classic Singleton: global, hard to mock, test-order dependent",
      "Angular DI: provider can be overridden in tests",
      "TestBed.overrideProvider() replaces the implementation",
      "Instance lifetime is controlled by the container, not the class",
    ],
  },

  // --- Question 15: Explain-Why ---
  {
    type: "explain-why",
    question:
      "The SOLID principle 'Dependency Inversion' (D) states: 'Depend on abstractions, " +
      "not on concrete implementations.' Using Angular's " +
      "`InjectionToken`, explain why directly injecting a concrete class " +
      "(`inject(PostgresDatabase)`) is a problem, and how a token solves it.",
    modelAnswer:
      "When you write `inject(PostgresDatabase)`, your service is directly bound to " +
      "PostgresDatabase. In tests you must either create a real PostgresDatabase " +
      "or use jest.mock() to replace the class — both are fragile. " +
      "Also: if you switch to MySQL, you must change every service that " +
      "directly injects PostgresDatabase. " +
      "With InjectionToken you define an abstraction: " +
      "const DATABASE = new InjectionToken<Database>('Database'). " +
      "The service class injects inject(DATABASE) and knows nothing of Postgres or MySQL. " +
      "In the production module you register { provide: DATABASE, useClass: PostgresDatabase }. " +
      "In the test module you register { provide: DATABASE, useClass: InMemoryDatabase }. " +
      "The service code never changes — only the registration in the DI container.",
    keyPoints: [
      "Direct injection binds to a concrete implementation",
      "InjectionToken is the abstraction (the interface equivalent in Angular's DI)",
      "Tests: provide: DATABASE, useClass: InMemoryDatabase",
      "No code in the service class changes when swapping implementations",
    ],
  },
];