// quiz-data.ts — L25: Type-safe Error Handling
// 15 questions, correct-index distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export interface MCQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  elaboratedFeedback: { whyCorrect: string; commonMistake: string };
}

export const lessonId = "25";
export const lessonTitle = "Type-safe Error Handling";

export const questions: (MCQuizQuestion | QuizQuestion)[] = [
  // correct: 0 (1-4)
  {
    id: 1,
    question: "What is the main problem with `function parseUser(): User` when the function can throw?",
    options: [
      "The return type 'lies' — it promises User, but can return nothing at all",
      "TypeScript won't compile such functions and shows an error on the return type",
      "throw doesn't work in functions with an explicit return type and causes a compile error",
      "User types cannot represent errors and require a separate Error type for that"
    ],
    correct: 0,
    explanation: "The type `User` promises: always a User. throw = nothing at all. That is a lie in the type system that the caller cannot see.",
    elaboratedFeedback: {
      whyCorrect: "The return type is a promise to the caller. `User` → 'I always return a User'. If the function can throw, it doesn't keep that promise — sometimes it returns nothing at all. TypeScript doesn't check for this.",
      commonMistake: "Many think TypeScript will protect them if they forget try/catch. No — without checked exceptions there is no compiler protection. The error only shows up at runtime."
    }
  },
  {
    id: 2,
    question: "What is the 'discriminant' in a Result discriminated union?",
    options: [
      "The `ok` property with the literal type `true` or `false` — enables TypeScript narrowing",
      "The `.isOk()` method that checks the type at runtime and returns a boolean",
      "The type parameter `T` in `Result<T, E>` that defines the success case",
      "The optional `error` property that is only set in the error case and otherwise undefined"
    ],
    correct: 0,
    explanation: "The discriminant is `ok: true | false` as a literal type. In the `if(result.ok)` branch TypeScript narrows to `{ ok: true; value: T }` — TypeScript knows value exists.",
    elaboratedFeedback: {
      whyCorrect: "Discriminated unions need a shared property with literal values. `ok: true` and `ok: false` are literals (not `boolean`!). TypeScript uses these literals for narrowing: in the `if(result.ok)` branch → TypeScript knows `ok` is exclusively `true`.",
      commonMistake: "Common mistake: `{ ok: boolean, value: T }` instead of `{ ok: true, value: T }`. boolean is too broad for narrowing — TypeScript cannot know whether ok is true or false without `as const`."
    }
  },
  {
    id: 3,
    question: "Why do you need `ok: true as const` and not just `ok: true`?",
    options: [
      "Without `as const` TypeScript infers `ok: boolean` instead of `ok: true` — no narrowing possible",
      "`as const` is required in TypeScript 5.0 for all boolean properties in discriminated unions",
      "`true` is not a valid literal type in TypeScript — only `as const` makes it valid",
      "Without `as const` the value would be converted to `false` at runtime and narrowing fails"
    ],
    correct: 0,
    explanation: "TypeScript infers `{ ok: true }` as `{ ok: boolean }` — too broad for narrowing. `as const` (or a helper function) enforces the literal type `true`.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript widens literal types by default. `{ ok: true }` → `{ ok: boolean }`. That is good for flexibility, but bad for discriminated unions. `as const` ('constant assertion') prevents widening: `ok: true as const` → the type is `true` (literal), not `boolean`.",
      commonMistake: "Many write helper functions correctly (`ok: true as const`) but then forget it in direct object literals. Recommendation: always use helper functions `ok()` and `err()`, never direct objects."
    }
  },
  {
    id: 4,
    question: "What does `function assertNever(x: never): never` do?",
    options: [
      "Enforces exhaustive handling: if x is not 'never', there is a compile error",
      "Disables TypeScript type checking for parameter x and treats it as any",
      "Throws a runtime error if x is undefined and immediately stops program execution",
      "Converts x to a different type at runtime, enabling a type adjustment"
    ],
    correct: 0,
    explanation: "`never` parameter: only a value of type `never` may be passed. When all union variants have been handled, the remaining type is `never`. If not → compile error.",
    elaboratedFeedback: {
      whyCorrect: "In the `default` branch of a switch over `ApiError`: when all cases are handled, `error` is impossible → type `never`. `assertNever(error)` is fine. If a case is missing: `error` still has a real type → the `never` parameter won't accept it → COMPILE ERROR. That is the exhaustive-check trick.",
      commonMistake: "Many think assertNever is only for runtime safety. It is primarily a compile-time check. If the code is correct, assertNever is never called — the type `never` guarantees that."
    }
  },

  // correct: 1 (5-8)
  {
    id: 5,
    question: "What is the difference between `Option<T>` and `Result<T, E>`?",
    options: [
      "Option always contains an error type; Result can also exist without an error and only deliver values",
      "Option = 'maybe a value' (no error); Result = operation that can fail (with error details)",
      "Option and Result are identical — just different naming conventions from different languages",
      "Option is only used in React; Result in Angular and other frameworks with dependency injection"
    ],
    correct: 1,
    explanation: "Option (T|null) = normal absence without details. Result = error that needs an explanation. Example: findUser (Option) vs. createUser (Result with validation error).",
    elaboratedFeedback: {
      whyCorrect: "`Option<T>` = `T | null`. null means: no value — that is normal and needs no explanation. `Result<T, E>` contains a specific error type E. For findUser: null = 'not found' (normal). For createUser: Err = 'validation failed' (needs details about why).",
      commonMistake: "Common mistake: `Result<User, null>` instead of `User | null`. Result with null as E makes no sense — just use `T | null` directly. Result is only worthwhile when E actually contains error information."
    }
  },
  {
    id: 6,
    question: "What does `strictNullChecks: true` give a TypeScript codebase?",
    options: [
      "Prevents null values from being used in TypeScript code and shows errors",
      "Enforces explicit handling of null/undefined — effectively a built-in Option system",
      "Automatically converts all null values to undefined and unifies their handling",
      "Only allows primitive types to be assigned null and forbids it for object types"
    ],
    correct: 1,
    explanation: "strictNullChecks makes null and undefined their own types. `string` ≠ `string | null`. Every optional value must be handled explicitly — just like with Option types.",
    elaboratedFeedback: {
      whyCorrect: "Without strictNullChecks: `string` implicitly includes `null | undefined`. With strictNullChecks: `string` is ONLY string. To allow null: `string | null`. That enforces explicit null checking everywhere — exactly what the Option pattern is meant to provide.",
      commonMistake: "Many don't enable strictNullChecks because of 'all the compile errors'. That is a mistake. strictNullChecks is the most important TypeScript setting — without it there is no protection against null-reference exceptions."
    }
  },
  {
    id: 7,
    question: "What does `satisfies Record<Status, string>` do differently from `: Record<Status, string>`?",
    options: [
      "satisfies is only available in React; Record annotation for all frameworks",
      "satisfies checks completeness WITHOUT widening the inferred type — specific types are preserved",
      "satisfies is deprecated (TypeScript 5.0+) and should no longer be used",
      "satisfies allows additional keys not in Status and automatically extends the type"
    ],
    correct: 1,
    explanation: "`satisfies` = completeness check (all keys) + keeps specific types. `: Record<Status, V>` = completeness check but loses specific types (everything becomes V).",
    elaboratedFeedback: {
      whyCorrect: "With `: Record<Status, string>` TypeScript only knows: all values are `string`. With `satisfies Record<Status, string>`: TypeScript knows all keys are present PLUS retains the specific string literal types (e.g. `'NOT_FOUND'` instead of just `string`). Best of both worlds.",
      commonMistake: "Some think satisfies is just syntactic sugar. No — it changes the inferred type. Especially important for lookup tables that are later processed with their specific types."
    }
  },
  {
    id: 8,
    question: "In which situations is `throw` still the right choice?",
    options: [
      "For all errors — always use throw; Result is over-engineering and not necessary",
      "For initialization errors, bugs/invariant violations, and as a wrapper for external systems that throw",
      "Never — Result<T, E> should be used in all cases to guarantee maximum type safety",
      "Only in async functions — in synchronous ones always use Result to keep errors in the type system"
    ],
    correct: 1,
    explanation: "throw = right for: bugs (division by zero), initialization (missing env vars), unrecoverable states. Result = right for expected errors (validation, network, not found).",
    elaboratedFeedback: {
      whyCorrect: "The rule of thumb: 'Can a correct program end up in this situation?' No → throw (it's a bug). Yes → Result (it's expected). Network error? Expected → Result. Null pointer in an internal module? Bug → throw.",
      commonMistake: "Using Result for absolutely everything is over-engineering. `JSON.parse` throws — you wrap it once in a Result function. Internally you then use Result. But the innermost level (JSON.parse itself) is allowed to throw."
    }
  },

  // correct: 2 (9-12)
  {
    id: 9,
    question: "What is `mapResult<T, U, E>(result, fn): Result<U, E>`?",
    options: [
      "A function that transforms the error object without changing T",
      "A function that converts TypeScript errors into JavaScript errors",
      "A function that transforms the value on Ok; passes the error through unchanged on Err",
      "A TypeScript 5.0 built-in operator similar to `.then()` on Promises"
    ],
    correct: 2,
    explanation: "`mapResult` applies `fn` to `result.value` when `result.ok === true`. On false → returns the error unchanged. Like `.then()` but for Result instead of Promise.",
    elaboratedFeedback: {
      whyCorrect: "mapResult is analogous to Array.map() — over the success value. On Err: fn is not called, the error is passed through. This enables chaining: `mapResult(parseEmail(raw), email => email.length)` — length is only computed in the success case.",
      commonMistake: "flatMapResult vs mapResult: map → fn returns U. flatMap → fn returns Result<U, E>. When fn can itself fail (returning a Result), you need flatMap instead of map."
    }
  },
  {
    id: 10,
    question: "Why is error conversion between layers (DB → Domain → HTTP) important?",
    options: [
      "Because TypeScript throws compile errors without conversion",
      "Because different error types cannot be stored in the same variable",
      "To ensure decoupling: each layer speaks its own 'language' without leaking implementation details",
      "Because JSON.stringify serializes different error types differently"
    ],
    correct: 2,
    explanation: "DB errors (ORA-12345) don't belong in business logic. Service errors don't belong in HTTP responses. Each layer translates: DB → Domain → HTTP. Decoupling enables technology changes without cascading failures.",
    elaboratedFeedback: {
      whyCorrect: "Anti-Corruption Layer principle: the service should not know whether you use PostgreSQL or MySQL. It only knows UserError (domain language). The repository translates DB error codes to domain errors. Context-specific and maintainable.",
      commonMistake: "Passing errors through directly ('throw dbError through all layers') means every layer has to know DB implementation details. When switching databases → changes everywhere."
    }
  },
  {
    id: 11,
    question: "What is the difference between `null` and `undefined` in TypeScript?",
    options: [
      "Both are identical — TypeScript treats them the same",
      "undefined is a type, null is only a value (not a type)",
      "null = deliberately set 'no value'; undefined = not initialized / missing optional property",
      "null can only be combined with primitive types; undefined with object types"
    ],
    correct: 2,
    explanation: "Convention: null = explicitly 'no value' (deliberate). undefined = missing (not initialized, optional property absent). Array.find() returns undefined → historical (JS compatibility).",
    elaboratedFeedback: {
      whyCorrect: "In TypeScript: `null` is a semantically loaded value ('there is nothing here'). `undefined` signals more 'the thing doesn't exist' or 'not yet assigned'. For Option<T>, null is better: it communicates a deliberate state.",
      commonMistake: "Many use null and undefined interchangeably. That leads to inconsistent code. Better: use null for 'no value', undefined for optional properties. `??` treats both the same (nullish coalescing)."
    }
  },
  {
    id: 12,
    question: "What is Haskell's `Either a b` and how does it relate to TypeScript's `Result<T, E>`?",
    options: [
      "Either is Haskell's error monad; Result is the TypeScript equivalent without monad properties",
      "Either and Result are identical — both come from functional programming",
      "Either is the mathematical origin (Left=error, Right=success) that TypeScript's Result<T,E> is modelled after",
      "Either = binary choice without semantics; Result = always with ok/error fields and type safety"
    ],
    correct: 2,
    explanation: "Haskell's `Either a b` = either Left(a) or Right(b). Convention: Left=error, Right=success ('right'=correct). TypeScript's Result<T,E> = semantically the same, but with ok/value/error instead of Left/Right.",
    elaboratedFeedback: {
      whyCorrect: "'Either a b' in Haskell is either `Left a` (error) or `Right b` (success). The convention Left=Error, Right=Success comes from: 'right' = correct. TypeScript's `{ ok: true; value: T } | { ok: false; error: E }` is the pragmatic TS version of the same concept.",
      commonMistake: "Haskell's Either has monad operations (>>=, fmap) built in. TypeScript doesn't have those natively — you write mapResult/flatMapResult yourself. Libraries like 'neverthrow' offer these as a fluent API."
    }
  },

  // correct: 3 (13-15) — 3x3
  {
    id: 13,
    question: "Which tsconfig option is responsible for `useUnknownInCatchVariables`?",
    options: [
      "`strict: true` makes it optional; `catchUnknown: true` must be set separately",
      "`noImplicitAny: true` is enough to type and protect catch variables",
      "`useUnknownInCatchVariables: true` is a separate setting outside of strict",
      "`useUnknownInCatchVariables` is included in `strict: true` by default (since TS 4.4)"
    ],
    correct: 3,
    explanation: "Since TypeScript 4.4, `useUnknownInCatchVariables: true` is part of `strict: true`. Catch variables have type `unknown` instead of implicit `any`.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript 4.4 added `useUnknownInCatchVariables` as part of the `strict` bundle. Previously `e` in catch was implicitly `any`. Now: `e: unknown` — you must use `instanceof Error` or other type guards before accessing properties.",
      commonMistake: "Some think they need to set it separately. With `strict: true` it runs automatically — that is the TypeScript recommendation for all new projects."
    }
  },
  {
    id: 14,
    question: "Why is `Record<ApiError, string>` an exhaustive check?",
    options: [
      "Because Record has a built-in exhaustiveness guarantee in TypeScript that replaces switch",
      "Because ApiError as a string union defines all keys that must appear in the Record",
      "Because TypeScript automatically generates and executes switch statements for Record types",
      "Record<K, V> enforces that ALL values of K must be present as keys — if one is missing → COMPILE ERROR"
    ],
    correct: 3,
    explanation: "`Record<K, V>` defines: for EVERY value of K a key with value V must exist. If ApiError = 'A' | 'B' | 'C', all three must be present. If 'C' is missing → COMPILE ERROR.",
    elaboratedFeedback: {
      whyCorrect: "`Record<'A' | 'B' | 'C', string>` requires: the object MUST have exactly the keys 'A', 'B', 'C' — all three. If one is missing → TypeScript error. That makes Record maps a natural exhaustiveness check without switch+assertNever.",
      commonMistake: "Many see Record only as 'a map with types'. But Record with a union as the key type is also an exhaustiveness instrument. `satisfies Record<Union, V>` is often the most elegant solution."
    }
  },
  {
    id: 15,
    question: "What does the `flatMapResult` helper provide over nested `if(result.ok)` blocks?",
    options: [
      "flatMapResult is faster — fewer function calls at runtime",
      "flatMapResult makes error information more detailed",
      "No difference — both are semantically identical",
      "Flat chain instead of nesting: errors from each step are automatically passed through"
    ],
    correct: 3,
    explanation: "flatMapResult enables `flatMap(parseA, a => flatMap(parseB(a), b => ...))` instead of `if(a.ok) { if(b.ok) { ... } }`. Less nesting, more readable.",
    elaboratedFeedback: {
      whyCorrect: "Without flatMap: every error check leads to deeper indentation. With flatMap: a linear chain. `flatMapResult(parseEmail(raw), email => flatMapResult(validateDomain(email), domain => ok(domain.toUpperCase())))` — errors from each step propagate automatically.",
      commonMistake: "Some use map instead of flatMap when the fn function returns a Result. That leads to `Result<Result<T, E>, E>` instead of `Result<T, E>`. flatMap 'flattens' the nested Result."
    }
  },

  // ─── Additional question formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  // --- Question 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the property in a discriminated union called that TypeScript uses for " +
      "narrowing (e.g. 'ok: true' vs. 'ok: false' in the Result type)?",
    expectedAnswer: "Discriminant",
    acceptableAnswers: [
      "Discriminant", "discriminant", "Diskriminant", "Tag", "tag",
      "Discriminator", "discriminator",
    ],
    explanation:
      "The discriminant is a shared property with literal values " +
      "that TypeScript uses for narrowing. In the Result type it is 'ok: true | false'. " +
      "In the if(result.ok) branch TypeScript knows that value exists.",
  },

  // --- Question 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the function called that serves as an exhaustive check by " +
      "expecting a parameter of type 'never'?",
    expectedAnswer: "assertNever",
    acceptableAnswers: [
      "assertNever", "assert never", "Assert Never", "assertNever()",
    ],
    explanation:
      "assertNever(x: never): never enforces that all union variants " +
      "have been handled. If a case is missing, x still has a real type " +
      "and doesn't match 'never' — compile error.",
  },

  // --- Question 18: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which tsconfig option (since TS 4.4, part of strict) makes catch variables " +
      "'unknown' instead of 'any'?",
    expectedAnswer: "useUnknownInCatchVariables",
    acceptableAnswers: [
      "useUnknownInCatchVariables", "useUnknownInCatchVariables: true",
    ],
    explanation:
      "useUnknownInCatchVariables enforces that catch variables have type 'unknown' " +
      "instead of implicit 'any'. You must use type guards (instanceof Error) " +
      "before accessing properties.",
  },

  // --- Question 19: Predict-Output ---
  {
    type: "predict-output",
    question: "What is the type of 'value' in the true branch?",
    code:
      "type Result<T, E> =\n" +
      "  | { ok: true; value: T }\n" +
      "  | { ok: false; error: E };\n\n" +
      "function handle(r: Result<string, Error>) {\n" +
      "  if (r.ok) {\n" +
      "    const value = r.value; // type of value?\n" +
      "  }\n" +
      "}",
    expectedAnswer: "string",
    acceptableAnswers: ["string", "String"],
    explanation:
      "TypeScript narrows in the if(r.ok) branch: r is { ok: true; value: string }. " +
      "Therefore r.value is of type string. That is the strength of discriminated unions " +
      "with literal types as the discriminant.",
  },

  // --- Question 20: Predict-Output ---
  {
    type: "predict-output",
    question: "What happens with this code?",
    code:
      "type Status = 'active' | 'inactive' | 'banned';\n" +
      "const messages: Record<Status, string> = {\n" +
      "  active: 'Welcome!',\n" +
      "  inactive: 'Account deactivated.',\n" +
      "};",
    expectedAnswer: "Compile-Error",
    acceptableAnswers: [
      "Compile-Error", "Compile Error", "Fehler", "Error", "Nein",
      "kompiliert nicht",
    ],
    explanation:
      "Record<Status, string> requires ALL Status values as keys. " +
      "'banned' is missing — TypeScript reports a compile error. " +
      "That is the exhaustive-check effect of Record with union keys.",
  },

  // --- Question 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why is Result<T, E> better than try/catch for expected errors " +
      "(e.g. validation, network), but try/catch is still right " +
      "for bugs and invariant violations?",
    modelAnswer:
      "Result<T, E> makes errors visible in the type system: the caller MUST " +
      "handle the error case, because the return type enforces it. " +
      "With try/catch errors are invisible — the compiler does not warn " +
      "when catch is missing. For bugs (division by zero, null pointer) " +
      "throw is correct, because a correct program should never reach that " +
      "state and recovery makes no sense.",
    keyPoints: [
      "Result makes errors visible in the type system",
      "Caller is forced to handle the error",
      "try/catch has no compile-time safety",
      "Bugs/invariants: throw because recovery is pointless",
    ],
  },
];