/**
 * Lesson 44 — Pre-Test Questions: Design Patterns Advanced
 *
 * 3 questions per section (6 sections = 18 questions).
 * Asked BEFORE reading to prime the brain.
 */

export interface PretestQuestion {
  /** Which section the question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Short explanation (only relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: Creational Patterns ────────────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "What problem does a Factory Method solve?",
    options: [
      "Creating an object without knowing which concrete class is used",
      "Ensuring only one instance of a class exists",
      "Hiding multiple objects behind a simple API",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Factory Method decouples 'what is created' from 'who creates it'. " +
      "The caller only knows the interface — never the concrete class.",
  },
  {
    sectionIndex: 1,
    question:
      "In what year did the GoF book 'Design Patterns' appear, and which languages were targeted?",
    options: [
      "1994, Java and C++",
      "2000, Java and JavaScript",
      "1988, C and C++",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "The GoF book appeared in 1994 and targeted Java and C++. " +
      "TypeScript was still 18 years away.",
  },
  {
    sectionIndex: 1,
    question:
      "Why is the classic Singleton pattern problematic in tests?",
    options: [
      "It is too slow for unit tests",
      "The global instance retains state between tests — test order influences results",
      "TypeScript does not support private constructors",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Global state in a Singleton means: changes in test A affect test B. " +
      "Tests become order-dependent and non-deterministic.",
  },

  // ─── Section 2: Structural Patterns ────────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Your code expects `processPayment(request: PaymentRequest): Promise<PaymentResult>`. " +
      "A legacy library has `chargeCard(amount: number, card: string): { success: boolean }`. " +
      "Which pattern connects both?",
    options: [
      "Adapter — translates the old interface into the new one",
      "Facade — hides both behind a simpler API",
      "Strategy — swaps out the payment method",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Adapter = interface adaptation. You implement `PaymentService` " +
      "and delegate internally to the legacy system.",
  },
  {
    sectionIndex: 2,
    question:
      "What is the difference between Adapter and Facade?",
    options: [
      "Adapter adapts an existing interface — Facade creates a new, simplified interface",
      "Facade adapts an existing interface — Adapter creates a new interface",
      "Both solve the same problem, just with different names",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Adapter: adapting an incompatible interface. Facade: hiding the complexity of a " +
      "subsystem behind a simple door.",
  },
  {
    sectionIndex: 2,
    question:
      "Angular's HTTP Interceptors are an example of which pattern?",
    options: [
      "Factory — they create new HTTP requests",
      "Proxy or Decorator — they transparently intercept the actual HTTP call",
      "Observer — they observe HTTP events",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "An HTTP Interceptor intercepts requests, transforms them (e.g. Authorization header) " +
      "and forwards them — like a proxy that acts transparently.",
  },

  // ─── Section 3: Behavioral Patterns ────────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "You have a class `EmailValidator` with `validate(email: string): boolean`. " +
      "Later you need `PasswordValidator` and `IBANValidator`. " +
      "Which pattern abstracts this correctly?",
    options: [
      "Strategy — each validation rule is an interchangeable strategy",
      "Observer — each validation observes the input field",
      "Command — each validation is an executable command",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Strategy encapsulates interchangeable algorithms. A `ValidationStrategy<T>` interface " +
      "allows any number of validation rules without changing the calling code.",
  },
  {
    sectionIndex: 3,
    question:
      "Why does `bus.on('user:login', listener)` return a function?",
    code: "const unsubscribe = bus.on('user:login', ({ userId }) => console.log(userId));",
    options: [
      "Because TypeScript requires functions as return values",
      "As a cleanup function: the listener can be removed later without a separate off() method",
      "Because EventBus always returns Promises",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "The unsubscribe pattern: `on()` returns a function that, when called, " +
      "removes the listener. No separate `bus.off(event, listener)` needed.",
  },
  {
    sectionIndex: 3,
    question:
      "Which NgRx concepts correspond to the Command Pattern?",
    options: [
      "Effects — they execute side effects",
      "Actions — they encapsulate intentions as immutable objects",
      "Selectors — they read state from the store",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "NgRx Actions are Commands: immutable objects that describe an intention. " +
      "The Reducer is the Command Executor. Time-travel debugging is achieved by " +
      "replaying all stored Actions.",
  },

  // ─── Section 4: Repository Pattern ─────────────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "What is the core advantage of a Repository interface over direct HttpClient access in a service?",
    options: [
      "Repository interfaces are faster because they have no HTTP overhead",
      "Business logic can swap out the repository implementation — HTTP for InMemory in tests",
      "Angular's HttpClient cannot implement an interface",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "The Repository interface separates 'what is done' from 'how it is done'. " +
      "In tests: InMemoryRepository. In production: HttpRepository. " +
      "The service code never changes.",
  },
  {
    sectionIndex: 4,
    question:
      "Why does `findById()` in the Repository interface return `Promise<TEntity | null>` instead of throwing an exception?",
    options: [
      "Because async functions cannot throw exceptions",
      "Because TypeScript does not support exceptions in generic types",
      "Because 'not found' is a normal case — null is more explicit and safer than an exception",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "'Not found' is not an error — it is a normal state. " +
      "null forces the caller to handle it explicitly: `if (user === null) { ... }`. " +
      "An exception would be for unexpected errors (network failure, DB error).",
  },
  {
    sectionIndex: 4,
    question:
      "What does `Partial<TEntity>` as the type for the `filter` parameter in `findAll(filter?: Partial<TEntity>)` do?",
    options: [
      "It only allows half of the properties",
      "It restricts TEntity to primitive types",
      "All properties of TEntity become optional — you can filter by any number of fields",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "`Partial<T>` makes all properties of T optional (question mark). " +
      "This allows the filter to contain 0 to all properties — flexible without overloads.",
  },

  // ─── Section 5: SOLID with TypeScript ────────────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "What does a class `UserService` that contains authentication, email sending, and database access violate?",
    options: [
      "Open/Closed Principle — it is closed for extension",
      "I don't know",
      "Liskov Substitution Principle — it inherits incorrectly",
      "Single Responsibility Principle — it has three reasons to change",
    ],
    correct: 3,
    briefExplanation:
      "SRP: A class should have exactly one reason to change. " +
      "Auth changes, email template changes, and DB schema changes are three " +
      "different reasons — three responsibilities.",
  },
  {
    sectionIndex: 5,
    question:
      "Which SOLID principle makes it possible to add new payment methods without changing the `OrderCalculator` class?",
    options: [
      "Single Responsibility — each class has one responsibility",
      "I don't know",
      "Dependency Inversion — OrderCalculator depends on an abstraction",
      "Open/Closed — open for extension through new implementations, closed for modification",
    ],
    correct: 3,
    briefExplanation:
      "Open/Closed: New `DiscountStrategy` implementations extend the system " +
      "without changing `OrderCalculator`. The calculator iterates over strategies — " +
      "it does not know which ones they are.",
  },
  {
    sectionIndex: 5,
    question:
      "Why is `inject(DATABASE_TOKEN)` in Angular better than `inject(PostgresDatabase)`?",
    options: [
      "Because PostgresDatabase is not Injectable",
      "Because InjectionToken is faster than class injection",
      "Because the service depends on an abstraction — a different provider can be registered in tests",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Dependency Inversion: depend on abstractions. With `InjectionToken<Database>` " +
      "the concrete type is interchangeable. In tests: InMemoryDatabase. " +
      "In production: PostgresDatabase. The service code never changes.",
  },

  // ─── Section 6: When Not to Use a Pattern ───────────────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "What is the main criticism of 'pattern fetishism' in software development?",
    options: [
      "Patterns are too hard to learn and confuse junior developers",
      "I don't know",
      "Patterns only work in Java and C++, not in TypeScript",
      "Abstraction has costs — over-abstracted code solves problems that don't exist",
    ],
    correct: 3,
    briefExplanation:
      "Every abstraction increases complexity. If the abstraction solves no real problem, " +
      "it is pure overhead. DHH: 'Test-Induced Design Damage' — " +
      "code optimized for machines, not for humans.",
  },
  {
    sectionIndex: 6,
    question:
      "When is an abstraction worthwhile according to the 'Rule of Three'?",
    options: [
      "Immediately when first writing — forward-looking design is important",
      "On the second nearly-identical code block — duplication should be eliminated immediately",
      "On the third nearly-identical code block — only then do you know what truly recurs",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Rule of Three: write it directly once, notice the second time (duplication), " +
      "abstract the third time. Early abstraction often makes the wrong assumptions.",
  },
  {
    sectionIndex: 6,
    question:
      "Which signal indicates that a Strategy Pattern is now appropriate?",
    options: [
      "You have written a class with more than 100 lines of code",
      "I don't know",
      "You are using an interface that you only implement once",
      "You are adding a new if-else branch to the same switch for the fifth time (Open/Closed violation)",
    ],
    correct: 3,
    briefExplanation:
      "A growing if-else or switch cascade is the warning sign for Open/Closed violations. " +
      "From three concrete cases: consider the Strategy Pattern. " +
      "An interface with only one implementation is YAGNI — not needed.",
  },
];