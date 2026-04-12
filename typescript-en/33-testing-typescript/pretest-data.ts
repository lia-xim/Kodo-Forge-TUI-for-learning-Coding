// pretest-data.ts — L33: Testing TypeScript
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: Test Setup ────────────────────────────────────────────

  {
    sectionId: 1,
    question: "What does Jest need to execute TypeScript files?",
    options: [
      "Nothing — Jest supports TypeScript natively",
      "A transformer like ts-jest or @swc/jest",
      "A special TypeScript version",
      "I don't know",
    ],
    correct: 1,
    explanation: "Jest only understands JavaScript. ts-jest or @swc/jest transform .ts files before execution.",
  },
  {
    sectionId: 1,
    question: "What is the main advantage of Vitest over Jest for TypeScript?",
    options: [
      "More matchers available",
      "Native TypeScript support without a transformer",
      "Better IDE integration",
      "I don't know",
    ],
    correct: 1,
    explanation: "Vitest is based on Vite and transforms TypeScript natively. No ts-jest, no extra configuration.",
  },
  {
    sectionId: 1,
    question: "Should strict: true apply to test files as well?",
    options: [
      "No — tests should be more flexible",
      "Yes — tests with lax types can hide real bugs",
      "Only for integration tests",
      "I don't know",
    ],
    correct: 1,
    explanation: "strict: true in tests prevents 'any' from sneaking in. A single 'any' in a test can mask real errors.",
  },

  // ─── Section 2: Typing Tests ──────────────────────────────────────────

  {
    sectionId: 2,
    question: "What is the return type of expect(42)?",
    options: [
      "number",
      "Matchers<number> — typed matcher chain",
      "boolean — whether the test passed",
      "I don't know",
    ],
    correct: 1,
    explanation: "expect<T>(actual: T) returns Matchers<T>. For expect(42), T = number, so Matchers<number>.",
  },
  {
    sectionId: 2,
    question: "Why can't describe() be async?",
    options: [
      "Because TypeScript doesn't support async describe",
      "Because the test runner must build the structure synchronously",
      "Because describe has no return values",
      "I don't know",
    ],
    correct: 1,
    explanation: "The test runner first registers all describes/its synchronously. Async would destroy parallelization.",
  },
  {
    sectionId: 2,
    question: "How do you extend Vitest/Jest with custom matchers?",
    options: [
      "Via expect.extend() and Declaration Merging (declare module)",
      "By inheriting from the Matcher class",
      "By installing a plugin",
      "I don't know",
    ],
    correct: 0,
    explanation: "expect.extend() registers the matcher. Declaration Merging extends the assertion interface with the TypeScript types.",
  },

  // ─── Section 3: Mocking with Types ────────────────────────────────────

  {
    sectionId: 3,
    question: "What is the fundamental problem with mocking in TypeScript?",
    options: [
      "TypeScript requires all properties of the type — but mocks are partial implementations",
      "TypeScript doesn't support mock functions",
      "Mocks only work with classes, not interfaces",
      "I don't know",
    ],
    correct: 0,
    explanation: "TypeScript's structural type system requires completeness. A mock with only one of 5 methods doesn't match the interface.",
  },
  {
    sectionId: 3,
    question: "What does vi.mocked() do?",
    options: [
      "It creates a new mock",
      "It spies on all calls",
      "It casts the type to Mocked<T> — methods become mock types",
      "I don't know",
    ],
    correct: 2,
    explanation: "vi.mocked() is a pure type cast. It makes .mockResolvedValue() etc. available without changing the value.",
  },
  {
    sectionId: 3,
    question: "What is Angular's jasmine.createSpyObj<T>()?",
    options: [
      "A factory for type-safe mock objects that validates method names against the interface",
      "A decorator for test classes",
      "A tool for generating test data",
      "I don't know",
    ],
    correct: 0,
    explanation: "createSpyObj<UserService>('svc', ['getUser']) checks whether 'getUser' is a method of UserService.",
  },

  // ─── Section 4: Type Testing ──────────────────────────────────────────

  {
    sectionId: 4,
    question: "What do type tests verify compared to regular tests?",
    options: [
      "The performance of types",
      "Whether the code compiles",
      "Compile-time behavior (correct types), not runtime behavior",
      "I don't know",
    ],
    correct: 2,
    explanation: "Type tests check: does this expression have the right type? E.g. 'Is identity(42) of type number and not any?'",
  },
  {
    sectionId: 4,
    question: "What does expectTypeOf(value).toEqualTypeOf<string>() do?",
    options: [
      "It checks whether value has the value 'string'",
      "It converts value to a string",
      "It checks whether the TypeScript TYPE of value is exactly string",
      "I don't know",
    ],
    correct: 2,
    explanation: "expectTypeOf checks the compile-time type, not the value. toEqualTypeOf checks for exact type equality.",
  },
  {
    sectionId: 4,
    question: "What can tsd do that expectTypeOf cannot?",
    options: [
      "Faster type checks",
      "More type comparisons",
      "Test whether code does NOT compile (expectError)",
      "I don't know",
    ],
    correct: 2,
    explanation: "tsd analyzes code statically and can check whether an expression causes a compile error. expectTypeOf runs at runtime — non-compiling code never reaches it.",
  },

  // ─── Section 5: Test Patterns ─────────────────────────────────────────

  {
    sectionId: 5,
    question: "What is a test factory function?",
    options: [
      "A function that automatically generates test files",
      "I don't know",
      "A function that runs tests in parallel",
      "A function that creates test data with sensible defaults and accepts Partial<T> for overrides",
    ],
    correct: 3,
    explanation: "createTestUser({ role: 'admin' }) — defaults for everything except role. Only the relevant fields are overridden.",
  },
  {
    sectionId: 5,
    question: "What is the advantage of a test fixture over individual factory calls?",
    options: [
      "Fixtures are faster",
      "I don't know",
      "Fixtures use less memory",
      "Fixtures bundle related data with consistent references (IDs etc.)",
    ],
    correct: 3,
    explanation: "A fixture contains admin, user, posts, comments — with correct references between them. Individual factories would have to synchronize IDs manually.",
  },
  {
    sectionId: 5,
    question: "How does faker.helpers.arrayElement(['a', 'b'] as const) produce a literal type?",
    options: [
      "'as const' makes the array readonly — the return type becomes 'a' | 'b' instead of string",
      "Faker has a special TypeScript integration",
      "This only works with Faker v9+",
      "I don't know",
    ],
    correct: 0,
    explanation: "Without 'as const': ['a', 'b'] has type string[]. With 'as const': readonly ['a', 'b']. arrayElement then infers 'a' | 'b'.",
  },

  // ─── Section 6: Practice — Angular & React ───────────────────────────

  {
    sectionId: 6,
    question: "What makes Angular's ComponentFixture<T> type-safe?",
    options: [
      "T determines the component type — componentInstance is exactly T",
      "T restricts the available templates",
      "T enforces certain test methods",
      "I don't know",
    ],
    correct: 0,
    explanation: "ComponentFixture<UserComponent>.componentInstance returns UserComponent — with full autocomplete for properties and methods.",
  },
  {
    sectionId: 6,
    question: "What is MSW (Mock Service Worker)?",
    options: [
      "A framework-specific HTTP mock for Angular",
      "I don't know",
      "A TypeScript compiler plugin for tests",
      "A framework-agnostic network mock that intercepts fetch/XHR",
    ],
    correct: 3,
    explanation: "MSW intercepts at the network level — works with Angular, React, Vue, and without a framework.",
  },
  {
    sectionId: 6,
    question: "Why is TypeScript the 'base layer' of the test pyramid?",
    options: [
      "Because TypeScript finds the most bugs",
      "I don't know",
      "Because TypeScript replaces unit tests",
      "Because type checks run constantly, have no runtime cost, and prevent ~15% of all bugs",
    ],
    correct: 3,
    explanation: "TypeScript checks with every keystroke. No test execution needed. Free, permanent safety checking.",
  },
];