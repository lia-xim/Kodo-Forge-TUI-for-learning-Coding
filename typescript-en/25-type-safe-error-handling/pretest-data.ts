// pretest-data.ts — L25: Type-safe Error Handling
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // Section 1: The Exception Problem
  { sectionId: 1, question: "Which TypeScript function lies about its return type?",
    options: ["function safe(): string | null", "function risky(): User // can throw", "function async(): Promise<void>", "function option(): T | undefined"],
    correct: 1, explanation: "`User` promises a User every time. When the function throws, it returns nothing." },
  { sectionId: 1, question: "What is Java's solution to the 'invisible errors' problem?",
    options: ["Optional<T> as a wrapper", "Checked Exceptions: `throws` in the method signature forces the caller to catch", "try-with-resources for automatic closing", "Java doesn't have this problem — the JVM catches all errors"],
    correct: 1, explanation: "Checked Exceptions in Java: `void foo() throws IOException` forces the caller to use try/catch. TypeScript has no equivalent." },
  { sectionId: 1, question: "What type does `error` have in a catch block with `useUnknownInCatchVariables: true`?",
    options: ["any — the classic type", "Error — always an Error object", "never — unreachable is impossible", "unknown — must be explicitly checked"],
    correct: 3, explanation: "With useUnknownInCatchVariables (part of strict): error: unknown. You must check with instanceof." },

  // Section 2: The Result Pattern
  { sectionId: 2, question: "What is `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`?",
    options: ["A wrapper class", "A Discriminated Union — narrowing via the 'ok' literal", "A generic interface", "A mapped type"],
    correct: 1, explanation: "Discriminated Union with discriminant `ok: true/false`. TypeScript narrows to the exact type in each if-branch." },
  { sectionId: 2, question: "What does `ok: true as const` do when creating a Result?",
    options: ["Makes the value immutable", "Enforces the literal type 'true' instead of the wider 'boolean' — enables narrowing", "Disables strictness for this object", "Forces compile-time evaluation"],
    correct: 1, explanation: "`as const` prevents type widening. `true` (literal) instead of `boolean` is required for Discriminated Union narrowing." },
  { sectionId: 2, question: "What does `flatMapResult(result, fn)` do when result.ok === false?",
    options: ["Throws an exception", "Calls fn with undefined", "Returns result unchanged (passes the error through)", "Returns null"],
    correct: 2, explanation: "flatMap: On Err → don't call fn, pass the Err through. This is 'Railway Oriented Programming' — errors travel past the success track." },

  // Section 3: Option/Maybe Pattern
  { sectionId: 3, question: "When is `User | null` better than `Result<User, E>`?",
    options: ["Only in JavaScript (not TypeScript)", "When 'not found' is a normal state, not an error", "When performance is critical", "Always — Result is always over-engineering"],
    correct: 1, explanation: "null = normal absence (not found). Result = error with a cause. findUser → null. createUser → Result." },
  { sectionId: 3, question: "What does optional chaining `user?.name` do?",
    options: ["Returns undefined if user is null/undefined, otherwise returns user.name", "Throws if user is null", "Converts null to undefined", "Is identical to user && user.name"],
    correct: 0, explanation: "`user?.name` returns `undefined` if user is null/undefined, otherwise `user.name`. Short for null-safe property access." },
  { sectionId: 3, question: "What does `null ?? 'Default'` return?",
    options: ["null", "false", "'Default' — ?? is Nullish Coalescing", "Throws TypeError"],
    correct: 2, explanation: "Nullish Coalescing `??`: Returns the right side if the left side is null or undefined. `null ?? 'Default'` → 'Default'." },

  // Section 4: Exhaustive Error Handling
  { sectionId: 4, question: "What is the `never` type in TypeScript?",
    options: ["An alias for void", "The type that always has errors", "The impossible type — no value can be never", "Types that are never defined"],
    correct: 2, explanation: "`never` is the bottom type: no value can be never. Exhausted union types become never. assertNever(never) is type-safe." },
  { sectionId: 4, question: "What happens when you use `satisfies Record<Status, string>` and a key is missing?",
    options: ["Runtime warning", "undefined is inserted for missing keys", "COMPILE ERROR: missing property for the Status value", "The object is automatically filled with an empty string"],
    correct: 2, explanation: "satisfies checks that all keys of the union type are present. If one is missing → TypeScript reports: Missing key." },
  { sectionId: 4, question: "Which TypeScript version introduced `satisfies`?",
    options: ["TypeScript 4.0", "TypeScript 4.5", "TypeScript 5.0", "TypeScript 4.9"],
    correct: 3, explanation: "`satisfies` was introduced in TypeScript 4.9. It checks whether an expression matches a type without widening the inferred type." },

  // Section 5: Error Type Patterns
  { sectionId: 5, question: "Why are union types for errors better than class hierarchies?",
    options: ["Union types are JSON-serializable, require no instanceof, are more flexible across multiple contexts", "Classes cannot be used in TypeScript", "Union types have better performance", "Classes have no narrowing"],
    correct: 0, explanation: "Union types: serializable, easy to create, pattern matching. Classes: require instanceof, not JSON-compatible, single parent type." },
  { sectionId: 5, question: "What is an 'Anti-Corruption Layer' in error architecture?",
    options: ["A layer that converts external error types into internal domain types", "A try/catch block in the middleware", "A TypeScript linter rule", "An abstraction layer for network errors"],
    correct: 0, explanation: "ACL: External errors (DB codes, HTTP status) are converted to domain errors (UserNotFound, ValidationError). Each layer speaks its own language." },
  { sectionId: 5, question: "What is `readonly type = 'VALIDATION' as const` in an error class?",
    options: ["It defines a constant method call", "It makes the class immutable", "as const is not allowed in classes", "It adds a discriminant property that enables narrowing in switch/case"],
    correct: 3, explanation: "`type = 'VALIDATION' as const` → literal type 'VALIDATION'. This makes class instances participants in a discriminated union — switching over `error.type` works." },

  // Section 6: Practice
  { sectionId: 6, question: "How do you wrap an Angular HTTP request into Result<User, HttpError>?",
    options: ["map(user => ok(user)), catchError(e => of(err(toHttpError(e))))", "By implementing HttpInterceptor", "HttpClient returns Result automatically", "By extending HttpClient"],
    correct: 0, explanation: ".pipe(map(user => ok(user)), catchError(err => of(err(toHttpError(err))))) wraps the Observable into Result values." },
  { sectionId: 6, question: "For which situation is `throw` wrong in a fetch wrapper?",
    options: ["When the server returns 500", "When JSON.parse fails", "When the URL parameter is invalid", "For all three — fetch wrappers should always return Result"],
    correct: 3, explanation: "All three errors (500, JSON parse, invalid URL) are 'expected' for HTTP operations. The wrapper should always return Result instead of throwing." },
  { sectionId: 6, question: "What is the recommended error architecture for a SPA?",
    options: ["Result types per layer with translation between layers", "A global try/catch in main.ts", "Serialize all errors as strings", "Error boundaries only in the root component"],
    correct: 0, explanation: "Infra (try/catch → Result) → Repository (DB error → Domain error) → Service → Presentation (exhaustive switch). Each layer speaks its own language." }
];