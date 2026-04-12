// quiz-data.ts — L40: Capstone Project
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3
// Fragen verbinden Konzepte aus L01-L39.

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "40";
export const lessonTitle = "Capstone Project";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Architektur — correct: 0 ---
  {
    question: "What is the 'Defensive Shell, Offensive Core' architecture?",
    options: [
      "Validate at system boundaries at runtime (unknown → typed), trust the type system in the core (no checks)",
      "Wrap everything in try/catch — that is the safest way to handle errors",
      "Validate every parameter in every function — defensive programming at every point",
      "Only use defensive types in tests — production code should remain unchecked",
    ],
    correct: 0,
    explanation:
      "System boundaries (API, user input) receive unknown and validate. " +
      "In the core, data is typed by the shell — no redundant checks needed.",
    elaboratedFeedback: {
      whyCorrect: "The shell is the transition from 'untrusted' to 'trusted'. The core trusts — because the shell has proven the data is correct.",
      commonMistake: "Validating in every function is paranoid and redundant. The types ARE the proof — if userId: UserId, it has been validated (Smart Constructor)."
    }
  },

  // --- Frage 2: Domain Modeling — correct: 0 ---
  {
    question: "Why are Branded IDs (UserId, OrderId) better than plain strings?",
    options: [
      "They prevent mixing up IDs of different entities at compile time",
      "They are faster at runtime because brands compile to optimized machine code",
      "They use less memory because the brand is only an invisible marker property",
      "They are the only way to use IDs in TypeScript — without a brand there are compile errors",
    ],
    correct: 0,
    explanation:
      "function transfer(from: UserId, to: UserId) instead of (from: string, to: string). " +
      "Swapping with an OrderId → compile error instead of runtime bug.",
    elaboratedFeedback: {
      whyCorrect: "Branded Types add an invisible brand: UserId ≠ OrderId, even though both are strings. The structural type system would otherwise treat them as identical.",
      commonMistake: "At runtime BOTH are plain strings (type erasure). The protection is purely at compile time. That is enough — most mix-ups happen while programming, not at runtime."
    }
  },

  // --- Frage 3: Money-Typ — correct: 0 ---
  {
    question: "Why store monetary amounts as cents (integer) instead of euros (float)?",
    options: [
      "Floating-point arithmetic has rounding errors — 19.99 * 0.19 does NOT equal exactly 3.80",
      "Integers are faster than floats in JavaScript because the CPU processes them directly",
      "TypeScript does not support float types — there is only number and integer",
      "This is an outdated convention from the COBOL era that no longer applies in modern systems",
    ],
    correct: 0,
    explanation:
      "IEEE 754 floating-point cannot represent 0.1 exactly. " +
      "0.1 + 0.2 = 0.30000000000000004. With cents (integers) there are no rounding errors.",
    elaboratedFeedback: {
      whyCorrect: "1999 cents * 0.19 → Math.round(379.81) = 380 cents = 3.80 EUR. Exact. 19.99 * 0.19 → 3.7981000000000003. Not exact. Across millions of transactions the errors accumulate.",
      commonMistake: "It is not an outdated convention — Stripe, PayPal, and every banking API use cents/minor units. It is the CORRECT representation for money in every computer system."
    }
  },

  // --- Frage 4: State Machine — correct: 0 ---
  {
    question: "What does the transition map in the order status prevent?",
    options: [
      "Invalid state transitions become compile errors — e.g. 'draft' directly to 'shipped'",
      "Performance problems with many states — the transition map becomes too slow at runtime",
      "Duplicate event emission — the map sends events twice on every transition",
      "Memory leaks with circular transitions — the map prevents garbage collection",
    ],
    correct: 0,
    explanation:
      "The transition map defines the allowed successor states for each status. " +
      "transitionOrder(draftOrder, 'shipped') → compile error, not runtime error.",
    elaboratedFeedback: {
      whyCorrect: "OrderTransitions['draft'] = 'pending' | 'cancelled'. 'shipped' is not in this union → compile error. The bug is found BEFORE execution.",
      commonMistake: "Without a transition map you could set any status to any other. That leads to invalid states: an unpaid order gets marked as 'shipped'."
    }
  },

  // --- Frage 5: Repository<T> — correct: 1 ---
  {
    question: "Why does Repository<T> use the type T['id'] instead of 'string' for the ID parameter?",
    options: [
      "Because T['id'] is longer and therefore communicates the purpose of the parameter more clearly",
      "Because T['id'] extracts the specific ID type — Repository<User>.findById expects UserId, not string",
      "Because TypeScript does not support 'string' as an ID type — only generic index accesses are allowed",
      "Because T['id'] is faster than string — the compiler optimizes index accesses better",
    ],
    correct: 1,
    explanation:
      "Indexed Access Type T['id'] extracts the concrete ID type. " +
      "For User that is UserId, for Order that is OrderId. Mix-ups are impossible.",
    elaboratedFeedback: {
      whyCorrect: "Repository<User>.findById(orderId) → compile error! orderId is OrderId, UserId is expected. Without T['id'] (i.e. with 'string') the call would be valid — and wrong.",
      commonMistake: "Some always use 'string' for IDs. That is Primitive Obsession (L24). Branded Types + Indexed Access Types make generics type-safe down to the detail."
    }
  },

  // --- Frage 6: Event System — correct: 1 ---
  {
    question: "What does Extract<DomainEvent, { type: 'order:paid' }> do in the event system?",
    options: [
      "It deletes all events except 'order:paid' from the event bus — it is a filter operator",
      "It filters the discriminated union to the variant with type: 'order:paid' — with all associated fields",
      "It creates a new event of type 'order:paid' and adds it to the event stream",
      "It converts the event type to a string — DomainEvent becomes 'order:paid' as a string",
    ],
    correct: 1,
    explanation:
      "Extract is a utility type (L15) that filters from a union the members " +
      "that are assignable to the given type. Result: { type: 'order:paid'; orderId: OrderId; paymentId: string; timestamp: Date }.",
    elaboratedFeedback: {
      whyCorrect: "Extract<U, T> returns all members of U that extend T. With DomainEvent and { type: 'order:paid' } exactly the 'order:paid' variant remains — with all its fields.",
      commonMistake: "Some confuse Extract with Pick. Pick selects properties from an object. Extract filters members from a union. Both are utility types, but for different purposes."
    }
  },

  // --- Frage 7: Result Pattern — correct: 1 ---
  {
    question: "Why does createOrder() return a Result<Order, 'empty-cart'> instead of throwing?",
    options: [
      "Because exceptions are not supported in TypeScript — you must always use Result",
      "Because the error is visible in the type — the caller MUST handle the error case",
      "Because Result is faster than throw — exceptions have high runtime overhead in TypeScript",
      "Because throw disrupts the event bus — the error handler is not called correctly",
    ],
    correct: 1,
    explanation:
      "The Result pattern (L25) makes errors part of the return type. " +
      "The compiler enforces error handling — with throw the error is invisible in the type.",
    elaboratedFeedback: {
      whyCorrect: "const result = await orderService.createOrder(...); if (!result.ok) { /* MUST be handled */ }. With throw: const order = await orderService.createOrder(...); — no hint of a possible error in the type.",
      commonMistake: "Result is NOT always better than throw. For unexpected errors (network timeout, out of memory) throw is correct. Result is for EXPECTED business errors ('empty-cart', 'not-found')."
    }
  },

  // --- Frage 8: Parse Don't Validate — correct: 1 ---
  {
    question: "What is the connection between Smart Constructors, Parse Don't Validate, and the defensive shell?",
    options: [
      "No connection — three independent concepts that solve different problems",
      "Smart Constructors ARE the parse pattern — they validate and return the stronger type. The shell uses them.",
      "Smart Constructors replace the defensive shell — you only need one of the two",
      "Parse Don't Validate is only for JSON parsing — it has nothing to do with Smart Constructors",
    ],
    correct: 1,
    explanation:
      "createUserId(raw): UserId validates AND returns the stronger type. " +
      "The defensive shell calls Smart Constructors — the core receives typed values.",
    elaboratedFeedback: {
      whyCorrect: "Smart Constructor = parse function = transition from 'untyped' to 'typed'. The shell uses them to convert external data into domain types. The core only works with domain types.",
      commonMistake: "Smart Constructors do NOT replace the shell — they are a PART of the shell. The shell validates the entire input; Smart Constructors validate individual values."
    }
  },

  // --- Frage 9: Readonly — correct: 2 ---
  {
    question: "Why are all properties in the domain model 'readonly'?",
    options: [
      "Because TypeScript requires readonly as default — all properties must be explicitly mutable",
      "Because readonly makes the code faster — the compiler optimizes immutable properties",
      "Because immutability prevents side effects — changes require a new object with consistent data",
      "Because readonly improves compiler error messages — they are more precise with immutable types",
    ],
    correct: 2,
    explanation:
      "Without readonly someone could call order.items.push(item) without " +
      "updating total. Readonly enforces: new object with new total.",
    elaboratedFeedback: {
      whyCorrect: "Immutability = consistent data. When items and total must be updated together, readonly prevents items from being changed alone. The new object MUST contain both.",
      commonMistake: "Readonly is not a runtime protection — it is erased at runtime (type erasure). It is a compile-time protection that documents intent and prevents accidental mutation."
    }
  },

  // --- Frage 10: End-to-End — correct: 2 ---
  {
    question: "What does 'end-to-end type safety' mean in the TypeShop architecture?",
    options: [
      "That all tests pass — type safety is guaranteed by tests",
      "That every variable has a type — explicit annotations everywhere in the code",
      "That the type is consistent from the API route definition through validation to the business logic",
      "That the code runs in all browsers — cross-browser compatibility through types",
    ],
    correct: 2,
    explanation:
      "The API route definition determines the type. Validation produces this type. " +
      "Business logic consumes it. A break anywhere → compile error.",
    elaboratedFeedback: {
      whyCorrect: "Route → Handler → Validator → Service → Repository: each layer passes typed data to the next. Type changes propagate automatically through all layers.",
      commonMistake: "End-to-end is NOT the same as 'strict: true'. Strict mode checks individual files. End-to-end type safety checks consistency BETWEEN layers."
    }
  },

  // --- Frage 11: Exhaustive Check — correct: 2 ---
  {
    question: "What happens when a new OrderStatus ('refunded') is added?",
    options: [
      "Nothing — the new status works automatically and all switch statements update themselves",
      "A runtime error in the transition map — it must be updated manually",
      "Compile errors at EVERY place that has an exhaustive switch over OrderStatus",
      "Only the transition map needs to be updated — the rest adapts automatically",
    ],
    correct: 2,
    explanation:
      "Every exhaustive switch (with never check) produces a compile error. " +
      "This forces all handlers to handle the new status. No case is forgotten.",
    elaboratedFeedback: {
      whyCorrect: "The compiler shows ALL affected places: getOrderDisplayText, mapErrorToStatus, event handlers. That is the power of discriminated unions + exhaustive checks.",
      commonMistake: "Updating only the transition map is not enough. All switch statements, event handlers, and renderers must know the new status. Exhaustive checks find them all."
    }
  },

  // --- Frage 12: Generics Kombination — correct: 2 ---
  {
    question: "How many different TypeScript concepts work together in the capstone project?",
    options: [
      "3-5 (Branded Types, Generics, Discriminated Unions)",
      "5-8 (plus Conditional Types, Mapped Types, Template Literals)",
      "10+ (plus Result Pattern, Exhaustive Checks, Readonly, Indexed Access, Extract, Phantom Types)",
      "All 40 lessons — every lesson is directly applied in the capstone project",
    ],
    correct: 2,
    explanation:
      "Branded Types, Discriminated Unions, Generics, Indexed Access, Mapped Types, " +
      "Conditional Types, Template Literals, Extract, Readonly, Result Pattern, " +
      "Exhaustive Checks, Phantom Types — at least 12 different concepts.",
    elaboratedFeedback: {
      whyCorrect: "Each concept has its place: Branded Types for IDs, DUs for status, Generics for Repository, Extract for events, Result for errors. None is redundant.",
      commonMistake: "Not ALL 40 lessons appear directly — L01 (Setup) or L28 (Decorators) do not. But concepts from roughly 25 lessons flow in directly."
    }
  },

  // --- Frage 13: Meisterschaft — correct: 3 ---
  {
    question: "What is the most important difference between a TypeScript user and a TypeScript master?",
    options: [
      "The master knows more syntax — they have all TypeScript features memorized",
      "The master writes more complex types — type-level programming is their specialty",
      "The master always uses the latest version — they update immediately on every release",
      "The master knows when simple types are enough and when complex ones are needed — the balance",
    ],
    correct: 3,
    explanation:
      "Mastery is not maximum complexity but optimal complexity. " +
      "The simplest type that does the job is the best type.",
    elaboratedFeedback: {
      whyCorrect: "A master uses Branded Types where they prevent bugs — and plain strings where they suffice. They write type-level code for libraries — and simple interfaces for business logic.",
      commonMistake: "Many think mastery = complex types. No — mastery = the right decision in every situation. Sometimes 'string' is the correct answer."
    }
  },

  // --- Frage 14: Framework — correct: 3 ---
  {
    question: "Which TypeScript concept from this course transfers MOST DIRECTLY to Angular and React?",
    options: [
      "Type-Level Programming (L37) — it is the most advanced concept and the most valuable",
      "Compiler API (L38) — it provides access to the full power of the TypeScript compiler",
      "Template Literal Types (L18) — they enable string parsing at the type level",
      "Discriminated Unions for state management (L12) — NgRx Actions, Redux Actions, useReducer",
    ],
    correct: 3,
    explanation:
      "Discriminated Unions are the state management pattern in BOTH frameworks. " +
      "NgRx Actions in Angular and Redux Actions in React ARE Discriminated Unions.",
    elaboratedFeedback: {
      whyCorrect: "type Action = { type: 'add'; item: Item } | { type: 'remove'; id: string } — that is a DU. Every reducer/effect handles one case. Exhaustive checks prevent forgotten actions.",
      commonMistake: "Type-Level Programming and Compiler API are advanced and rarely used directly in framework code. DUs are EVERYWHERE in state management."
    }
  },

  // --- Frage 15: Ein Rat — correct: 3 ---
  {
    question: "What is the most important insight from 40 lessons of TypeScript?",
    options: [
      "TypeScript is complicated and requires a lot of practice — you must master all features",
      "You should always use the newest features — old syntax is bad code",
      "Types are only useful for large projects — small projects do not need them",
      "The compiler is your partner — use it to find bugs at compile time instead of in production",
    ],
    correct: 3,
    explanation:
      "TypeScript shifts errors from runtime to compile time. " +
      "That is the fundamental value — not the syntax, not the features, " +
      "but the ability to find bugs BEFORE execution.",
    elaboratedFeedback: {
      whyCorrect: "Studies show: static type systems prevent roughly 15% of all bugs. On large projects that is thousands of errors. The compiler finds them in seconds — instead of hours of manual testing.",
      commonMistake: "TypeScript is not 'complicated' — it is powerful. The complexity is optional: you can start with string, number, interface and only reach for Generics and Conditional Types when needed."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "What is the architectural principle called: 'Impossible states should be prevented by the type system'?",
    expectedAnswer: "Make impossible states impossible",
    acceptableAnswers: ["Make impossible states impossible", "make impossible states impossible"],
    explanation:
      "Instead of checking impossible states at runtime, you model the type so " +
      "that they cannot be expressed in the first place. Discriminated Unions are the implementation.",
  },

  {
    type: "short-answer",
    question: "Which utility type filters from a union the members that are assignable to a given type?",
    expectedAnswer: "Extract",
    acceptableAnswers: ["Extract", "Extract<U, T>"],
    explanation:
      "Extract<DomainEvent, { type: 'order:paid' }> returns the 'order:paid' variant " +
      "of the DomainEvent union — with all associated fields.",
  },

  {
    type: "short-answer",
    question: "What do you call a function that validates a raw value and returns it as a branded type?",
    expectedAnswer: "Smart Constructor",
    acceptableAnswers: ["Smart Constructor", "smart constructor", "Smart constructor"],
    explanation:
      "Smart Constructors are the only place that assigns a brand — after validation. " +
      "createUserId(raw): UserId checks and casts. Other modules must use the constructor.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Does this code compile?",
    code:
      "type UserId = string & { __brand: 'UserId' };\n" +
      "type OrderId = string & { __brand: 'OrderId' };\n\n" +
      "function findUser(id: UserId): void {}\n\n" +
      "const orderId = 'ord_123' as OrderId;\n" +
      "findUser(orderId);",
    expectedAnswer: "No",
    acceptableAnswers: ["No", "Error", "Does not compile", "Nein", "Fehler", "Kompiliert nicht"],
    explanation:
      "OrderId has __brand: 'OrderId', UserId expects __brand: 'UserId'. " +
      "Even though both are string-based, the brands are different → compile error.",
  },

  {
    type: "predict-output",
    question: "What type does 'total' have after this code?",
    code:
      "type Cents = number & { __brand: 'Cents' };\n" +
      "const a: Cents = 100 as Cents;\n" +
      "const b: Cents = 200 as Cents;\n" +
      "const total = a + b;\n" +
      "// What type is total?",
    expectedAnswer: "number",
    acceptableAnswers: ["number"],
    explanation:
      "a + b yields 'number', NOT 'Cents'. The brand is lost in arithmetic " +
      "operations. You need a function addCents(a, b): Cents.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is a type-safe architecture (Defensive Shell + Domain Model + Offensive Core) " +
      "worth more than the sum of its parts?",
    modelAnswer:
      "Individual types only protect locally — one function, one module. A consistent " +
      "architecture protects BETWEEN layers: API contract → validation → domain type → " +
      "business logic → event system. Changes to one type propagate automatically through " +
      "all layers — the compiler shows ALL affected places. That is end-to-end " +
      "type safety: no 'any' breaks the chain. Errors that would normally only surface in " +
      "production (wrong ID, missing status case, invalid transition) become " +
      "compile errors. The architecture turns the compiler into an automated code reviewer.",
    keyPoints: [
      "Individual types protect locally, architecture protects BETWEEN layers",
      "Type changes propagate automatically — the compiler finds all affected places",
      "No 'any' breaks the chain — end-to-end consistency",
      "Compile errors instead of production bugs — the compiler as code reviewer",
    ],
  },
];