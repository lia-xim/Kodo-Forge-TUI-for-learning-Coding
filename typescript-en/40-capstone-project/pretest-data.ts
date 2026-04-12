// pretest-data.ts — L40: Capstone Project
// 15 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Projekt-Ueberblick ─────────────────────────────────────

  {
    sectionId: 1,
    question: "What is the goal of a capstone project?",
    options: [
      "Connect all learned concepts in one cohesive project",
      "Learn a new concept",
      "Find the fastest implementation",
      "I don't know",
    ],
    correct: 0,
    explanation: "A capstone connects everything: Branded Types + DUs + Generics + Result Pattern + more in a coherent architecture.",
  },
  {
    sectionId: 1,
    question: "What does 'end-to-end type safety' mean?",
    options: [
      "The type contract is consistent from the API definition through validation to business logic",
      "All variables have a type",
      "The code runs without errors",
      "I don't know",
    ],
    correct: 0,
    explanation: "End-to-end: The type contract holds from the outermost layer (API) to the innermost (business logic). No 'any' breaks the chain.",
  },
  {
    sectionId: 1,
    question: "Which three principles guide the capstone architecture?",
    options: [
      "DRY, SOLID, KISS",
      "Defensive Shell + Make Impossible States Impossible + Parse Don't Validate",
      "Microservices, Event Sourcing, CQRS",
      "I don't know",
    ],
    correct: 1,
    explanation: "Defensive Shell protects boundaries, Make Impossible States Impossible models the core, Parse Don't Validate connects both.",
  },

  // ─── Sektion 2: Domain Modeling ─────────────────────────────────────────

  {
    sectionId: 2,
    question: "Why store monetary amounts as cents instead of euros?",
    options: [
      "Floating-point has rounding errors, integer arithmetic with cents is exact",
      "Cents require less memory",
      "TypeScript doesn't support floats",
      "I don't know",
    ],
    correct: 0,
    explanation: "0.1 + 0.2 = 0.30000000000000004 in float. 10 + 20 = 30 in integer. Cents avoid this problem.",
  },
  {
    sectionId: 2,
    question: "What is a transition map for an order status?",
    options: [
      "A type that defines the allowed subsequent states for each status",
      "A database table for status changes",
      "A UI element for status display",
      "I don't know",
    ],
    correct: 0,
    explanation: "type Transitions = { draft: 'pending' | 'cancelled'; pending: 'paid' | 'cancelled'; ... }. Invalid transitions → compile error.",
  },
  {
    sectionId: 2,
    question: "Why are all properties in the domain model 'readonly'?",
    options: [
      "Because TypeScript requires it",
      "Because immutability prevents side effects and enforces consistent data",
      "Because it is faster",
      "I don't know",
    ],
    correct: 1,
    explanation: "Readonly prevents order.items.push() without updating total. Changes require a new object with all consistent fields.",
  },

  // ─── Sektion 3: API Layer ──────────────────────────────────────────────

  {
    sectionId: 3,
    question: "What is an API route type?",
    options: [
      "A string with the URL",
      "A type that connects method, path, request body, response body, and error body",
      "An HTTP header",
      "I don't know",
    ],
    correct: 1,
    explanation: "ApiRoute<'POST', '/api/orders', RequestBody, ResponseBody, ErrorBody> connects everything in one type. Single source of truth.",
  },
  {
    sectionId: 3,
    question: "Why validate API inputs even though the type already describes them?",
    options: [
      "Because TypeScript types can be incorrect",
      "Because types don't exist at runtime (type erasure) and external data can be anything",
      "Because it is a best practice with no technical justification",
      "I don't know",
    ],
    correct: 1,
    explanation: "Types disappear at runtime. An HTTP request can contain arbitrary data. Validation is the defensive shell.",
  },
  {
    sectionId: 3,
    question: "Why model API errors as a discriminated union?",
    options: [
      "Because it is the only way to represent errors in TypeScript",
      "Because discriminated unions are faster than exceptions",
      "Because exhaustive checks ensure every error case is handled",
      "I don't know",
    ],
    correct: 2,
    explanation: "{ code: 'NOT_FOUND' } | { code: 'VALIDATION_ERROR'; fields: ... } enforces specific handling per error type.",
  },

  // ─── Sektion 4: Business Logic ─────────────────────────────────────────

  {
    sectionId: 4,
    question: "Why does the 'offensive core' not need runtime validation?",
    options: [
      "Because the core does not process external data",
      "Because runtime validation is not possible in TypeScript",
      "Because the defensive shell has already validated and the types carry the proof",
      "I don't know",
    ],
    correct: 2,
    explanation: "The shell validates and produces typed values (smart constructors). In the core the type is the proof — double-checking is redundant.",
  },
  {
    sectionId: 4,
    question: "What makes a generic Repository<T> useful?",
    options: [
      "It completely replaces ORMs",
      "It is faster than direct database access",
      "It abstracts data access for arbitrary entities — write code once, use with different types",
      "I don't know",
    ],
    correct: 2,
    explanation: "Repository<User> and Repository<Order> share the same implementation. Generics make it type-safe for any entity.",
  },
  {
    sectionId: 4,
    question: "Why is an event system with discriminated unions type-safe?",
    options: [
      "Discriminated unions are the only way to represent events",
      "Events are faster than direct function calls",
      "Each event type has specific fields — handlers only receive the fields of their event",
      "I don't know",
    ],
    correct: 2,
    explanation: "bus.on('order:paid', (event) => event.paymentId) — TypeScript knows that 'order:paid' has a paymentId. event.trackingId → compile error.",
  },

  // ─── Sektion 5: Abschluss ──────────────────────────────────────────────

  {
    sectionId: 5,
    question: "What is the difference between a TypeScript user and a TypeScript master?",
    options: [
      "I don't know",
      "The master knows more syntax",
      "The master always writes the most complex types",
      "The master knows when simple types suffice and when complex ones are needed",
    ],
    correct: 3,
    explanation: "Mastery is balance: the simplest type that gets the job done is the best. Complexity only when it prevents bugs.",
  },
  {
    sectionId: 5,
    question: "Which concept transfers most directly to Angular and React?",
    options: [
      "I don't know",
      "Type-level programming",
      "Compiler API",
      "Discriminated unions for state management (NgRx actions, Redux actions)",
    ],
    correct: 3,
    explanation: "NgRx actions in Angular and Redux actions in React ARE discriminated unions. The pattern is central in both frameworks.",
  },
  {
    sectionId: 5,
    question: "What is the most important insight from 40 lessons of TypeScript?",
    options: [
      "I don't know",
      "TypeScript is too complex for small projects",
      "You always need the latest version",
      "The compiler is your partner — use it to find bugs before runtime",
    ],
    correct: 3,
    explanation: "TypeScript shifts errors from runtime to compile time. That is the fundamental value of the entire course.",
  },
];