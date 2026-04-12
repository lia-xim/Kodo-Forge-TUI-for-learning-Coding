// quiz-data.ts — L33: Testing TypeScript
// 9 MC + 3 short-answer + 2 predict-output + 1 explain-why = 15 Fragen
// MC correct-Index Verteilung: 3x0, 2x1, 2x2, 2x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "33";
export const lessonTitle = "Testing TypeScript";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (9 Fragen, correct: 0,0,0, 1,1, 2,2, 3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Vitest vs Jest — correct: 0 ---
  {
    question: "What is the main advantage of Vitest over Jest for TypeScript?",
    options: [
      "Native TypeScript support without a transformer (Zero-Config)",
      "Vitest has more matchers than Jest and thus covers more test cases out of the box",
      "Vitest can run tests in parallel, Jest cannot — which is crucial for large test suites",
      "Vitest only supports TypeScript, not JavaScript — which increases the focus on type safety",
    ],
    correct: 0,
    explanation:
      "Vitest is based on Vite and understands TypeScript natively. Jest requires ts-jest or " +
      "@swc/jest as a transformer, which means configuration overhead and performance costs.",
    elaboratedFeedback: {
      whyCorrect: "Vitest's Vite foundation transforms TypeScript automatically. No extra plugin, no moduleNameMapper configuration for path aliases, no separate tsconfig.spec.json for the transformer.",
      commonMistake: "Jest can handle TypeScript too — just not natively. Configuring ts-jest (tsconfig path, ESM mode, path aliases) is a common source of errors."
    }
  },

  // --- Frage 2: TypeScript vs Tests — correct: 0 ---
  {
    question: "What does TypeScript check that unit tests CANNOT check?",
    options: [
      "The correct shape (types, interfaces) — not the behavior",
      "The runtime performance of functions — TypeScript measures execution speed at compile time",
      "Whether a function crashes on certain inputs — TypeScript simulates all code paths",
      "The correct order of function calls — TypeScript validates the control flow graph",
    ],
    correct: 0,
    explanation:
      "TypeScript checks SHAPE (types match, interfaces satisfied), tests check " +
      "BEHAVIOR (correct results, correct side effects). TypeScript cannot " +
      "check whether add(1,2) actually returns 3 — only that the signature is correct.",
    elaboratedFeedback: {
      whyCorrect: "add(a: number, b: number): number — TypeScript says: signature is correct. Whether the implementation is a*b instead of a+b, TypeScript cannot know. Tests verify the implementation.",
      commonMistake: "Some believe TypeScript makes tests unnecessary. It complements them — TypeScript catches type errors, tests catch logic errors."
    }
  },

  // --- Frage 3: expect() Typen — correct: 0 ---
  {
    question: "What happens with: expect(42).toBe('hello')?",
    options: [
      "Compile error — TypeScript checks that the expected value has the same type as actual",
      "The test fails at runtime but compiles — toBe simply compares values without type checking",
      "The test passes because 42 and 'hello' are both truthy and toBe tests for truthiness",
      "TypeError at runtime due to different types — JavaScript detects the type conflict on comparison",
    ],
    correct: 0,
    explanation:
      "expect<T>(actual: T) returns Matchers<T>. toBe(expected: T) expects the " +
      "same type. Since T = number (from 42), 'hello' (string) is not assignable → compile error.",
    elaboratedFeedback: {
      whyCorrect: "The generic chain: expect(42) → T = number → Matchers<number> → toBe(expected: number). 'hello' is string, not number → compile error. TypeScript prevents nonsensical assertions.",
      commonMistake: "In older Jest versions or without strict types, this might compile. With current @types/jest and strict: true, it is an error."
    }
  },

  // --- Frage 4: vi.fn() Typen — correct: 1 ---
  {
    question: "What is the advantage of vi.fn<(id: string) => Promise<User>>() over vi.fn()?",
    options: [
      "vi.fn() with a type parameter is faster at runtime because the type is used for optimization",
      "The type parameter enforces correct arguments and return values on the mock",
      "vi.fn() without a type parameter causes a compile error because TypeScript cannot infer the type",
      "The type parameter makes the mock thread-safe and prevents race conditions in parallel tests",
    ],
    correct: 1,
    explanation:
      "vi.fn<Signature>() creates a typed mock. mockFn('123') is OK (string), " +
      "mockFn(123) is a compile error (number instead of string). mockResolvedValue must " +
      "return User. Without a type parameter everything is 'any'.",
    elaboratedFeedback: {
      whyCorrect: "The type parameter turns the mock into a contract: only correct calls and correct return values are accepted. This catches mock errors at compile time, not during test runs.",
      commonMistake: "Many use vi.fn() without a type parameter because it is simpler. This leads to 'any' mocks that report no errors — the test compiles but may test the wrong thing."
    }
  },

  // --- Frage 5: vi.mocked() — correct: 1 ---
  {
    question: "What does vi.mocked(service) do?",
    options: [
      "It creates a new mock of the service with empty implementations for all methods",
      "It casts the service to Mocked<T> — all methods become mock types",
      "It spies on all method calls of the service and logs them automatically",
      "It replaces the service with an auto-mock that intercepts all method calls",
    ],
    correct: 1,
    explanation:
      "vi.mocked() is a pure type cast (no-op at runtime). It converts all " +
      "methods to mock types so that .mockResolvedValue() etc. are available. " +
      "Prerequisite: the module must have been mocked beforehand with vi.mock().",
    elaboratedFeedback: {
      whyCorrect: "Mocked<UserService> maps all methods: getUser changes from (id: string) => Promise<User> to MockedFunction<(id: string) => Promise<User>>. This adds .mockResolvedValue, .mockReturnValue, etc.",
      commonMistake: "Many try vi.mocked() without a prior vi.mock(). That only changes the type, not the value — the real method is still called!"
    }
  },

  // --- Frage 6: expectTypeOf — correct: 2 ---
  {
    question: "What is the difference between expect() and expectTypeOf() in Vitest?",
    options: [
      "expect() is for Vitest, expectTypeOf() is for Jest — they are framework-specific",
      "expect() is synchronous and checks immediately, expectTypeOf() is asynchronous and needs a Promise",
      "expect() checks runtime values, expectTypeOf() checks compile-time types",
      "There is no difference — they are aliases that call the same function with different names",
    ],
    correct: 2,
    explanation:
      "expect(value).toBe(3) checks the VALUE at runtime. expectTypeOf(value).toBeNumber() " +
      "checks the TYPE at compile time. expect catches logic errors, expectTypeOf catches " +
      "type regressions (e.g. type becomes 'any').",
    elaboratedFeedback: {
      whyCorrect: "expectTypeOf checks: 'Does this expression have the type number?' — not 'Is the value 42?'. This is important for generic functions and utility types where the correct type is the API guarantee.",
      commonMistake: "Some think expectTypeOf replaces expect. No — they complement each other. Type tests catch type problems, value tests catch logic problems."
    }
  },

  // --- Frage 7: Test-Factory — correct: 2 ---
  {
    question: "Why does createTestUser() take a Partial<User> parameter instead of all fields individually?",
    options: [
      "Because Partial<User> is faster than individual parameters since fewer type checks are needed",
      "Because TypeScript does not support functions with many parameters and therefore prefers objects",
      "Because tests only override the fields relevant to them — the rest comes from defaults",
      "Because Partial<User> automatically sets optional fields to null and thus reduces boilerplate",
    ],
    correct: 2,
    explanation:
      "createTestUser({ role: 'admin' }) says: 'This test is about admin behavior.' " +
      "All other fields are irrelevant and are filled by defaults. This makes " +
      "tests shorter, clearer, and less susceptible to changes in the User type.",
    elaboratedFeedback: {
      whyCorrect: "When User gets a new field 'department': with manual creation EVERY test must be updated. With a factory: only the factory gets a default value. All tests remain unchanged.",
      commonMistake: "Some pass ALL fields in every test 'to be safe'. That is noise — the reader cannot tell what is actually relevant to the test."
    }
  },

  // --- Frage 8: Angular TestBed — correct: 3 ---
  {
    question: "Why is Angular's jasmine.createSpyObj<T>() type-safer than a manual mock?",
    options: [
      "createSpyObj is faster than manual mocks because it uses optimized spy functions",
      "createSpyObj supports more methods than manual mocks and covers the entire interface",
      "createSpyObj automatically creates spy implementations for all methods without manual effort",
      "createSpyObj checks method names against the interface — typos are detected",
    ],
    correct: 3,
    explanation:
      "jasmine.createSpyObj<UserService>('UserService', ['getUsr']) — compile error! " +
      "'getUsr' is not a method name of UserService. The type parameter checks the " +
      "array elements against the interface.",
    elaboratedFeedback: {
      whyCorrect: "The second parameter of createSpyObj is an array of keyof T. TypeScript checks every string against the interface's methods. Typos are caught immediately — not only when the test runs.",
      commonMistake: "Some mock with { getUser: jest.fn() } as any. That loses all type safety — typos in method names are not detected."
    }
  },

  // --- Frage 9: MSW — correct: 3 ---
  {
    question: "Why is MSW (Mock Service Worker) framework-independent?",
    options: [
      "MSW uses no HTTP library and is therefore completely independent of external dependencies",
      "MSW is written in WebAssembly which makes it platform-independent and framework-neutral",
      "MSW only tests TypeScript types, not runtime code — therefore it works with any framework",
      "MSW intercepts at the network level — independent of the HTTP client (fetch, axios, HttpClient)",
    ],
    correct: 3,
    explanation:
      "MSW intercepts fetch() and XMLHttpRequest at the network level (Service Worker in the " +
      "browser, Node.js interceptor in tests). Whether Angular's HttpClient, fetch(), or " +
      "axios — all use fetch/XHR internally. MSW catches them all.",
    elaboratedFeedback: {
      whyCorrect: "Angular's HttpClientTestingModule only mocks the Angular HttpClient. MSW mocks the network layer beneath it. That is why MSW works with Angular, React, Vue, Svelte — and even without a framework.",
      commonMistake: "Many think framework-specific HTTP mocking is required. For integration tests, MSW is often the better choice — the same handlers work for Angular AND React tests."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which Vitest function casts a mock import to typed mock methods?",
    expectedAnswer: "vi.mocked",
    acceptableAnswers: ["vi.mocked", "vi.mocked()", "mocked"],
    explanation:
      "vi.mocked(service) converts the type to Mocked<T> — all methods become " +
      "mock functions. At runtime it is a no-op (pure type cast).",
  },

  {
    type: "short-answer",
    question: "Which Vitest function checks TypeScript types instead of runtime values?",
    expectedAnswer: "expectTypeOf",
    acceptableAnswers: ["expectTypeOf", "expectTypeOf()", "expect-type-of"],
    explanation:
      "expectTypeOf(value).toBeString() checks the compile-time type, not the runtime value. " +
      "It is built into Vitest and requires no installation.",
  },

  {
    type: "short-answer",
    question: "Which utility type is used in test factories to make individual fields overridable?",
    expectedAnswer: "Partial",
    acceptableAnswers: ["Partial", "Partial<T>", "partial"],
    explanation:
      "Partial<T> makes all properties optional. createTestUser(overrides?: Partial<User>) " +
      "allows overriding only the fields relevant to the test.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Does this code compile? Answer with 'Yes' or 'No'.",
    code:
      "const mockFn = vi.fn<(id: string) => Promise<User>>();\n" +
      "mockFn(42);",
    expectedAnswer: "No",
    acceptableAnswers: ["No", "no", "Compile-Error"],
    explanation:
      "vi.fn<(id: string) => Promise<User>>() expects a string parameter. " +
      "42 is number, not string. TypeScript reports: Argument of type 'number' " +
      "is not assignable to parameter of type 'string'.",
  },

  {
    type: "predict-output",
    question: "What type does 'result' have?",
    code:
      "function createTestUser(overrides?: Partial<User>): User {\n" +
      "  return { id: '1', name: 'Test', email: 'test@test.de', role: 'user', createdAt: '2024', ...overrides };\n" +
      "}\n" +
      "const result = createTestUser({ role: 'admin' });",
    expectedAnswer: "User",
    acceptableAnswers: ["User", "user"],
    explanation:
      "createTestUser always returns User — regardless of the overrides. " +
      "Partial<User> allows overriding individual fields, but the return type " +
      "remains User. TypeScript checks: { role: 'admin' } is a valid Partial<User>.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why should TypeScript types be considered the 'base layer' of the test pyramid?",
    modelAnswer:
      "TypeScript types check the correctness of code CONSTANTLY — on every keystroke " +
      "in the IDE, on every build. They cost no runtime (type erasure) and no " +
      "test effort (no test to write). They catch an entire category of errors: " +
      "wrong arguments, missing properties, incompatible types. This is like a " +
      "permanent, free test that prevents approximately 15% of all bugs (according to a Microsoft study). " +
      "Unit tests, integration tests, and E2E tests build ON TOP of this — they test behavior, " +
      "while TypeScript guarantees shape.",
    keyPoints: [
      "TypeScript checks constantly — no manual test run required",
      "No runtime overhead (type erasure)",
      "Catches ~15% of all bugs (Microsoft study)",
      "Complements tests: types check shape, tests check behavior",
    ],
  },
];