/**
 * Lesson 25 — Tracing Exercises: Type-safe Error Handling
 *
 * Topics:
 *  - Result-Chain execution (ok/err paths)
 *  - Exhaustive Error Handling Flow (switch + assertNever)
 *  - Option unwrap/match behavior
 *  - Error propagation through mapResult/flatMapResult
 *
 * Difficulty increasing: 2 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // --- Exercise 1: Result-Chain Execution ---
  {
    id: "25-result-chain",
    title: "Result-Chain — Which path is taken?",
    description:
      "Trace the flow through ok() and err() paths. " +
      "Which console.log outputs appear?",
    code: [
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };",
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }",
      "function err<E>(e: E) { return { ok: false as const, error: e }; }",
      "",
      "function parseAge(raw: string): Result<number, string> {",
      "  const n = parseInt(raw);",
      "  if (isNaN(n)) return err('Not a number');",
      "  if (n < 0 || n > 150) return err('Invalid');",
      "  return ok(n);",
      "}",
      "",
      "const r1 = parseAge('25');",
      "const r2 = parseAge('abc');",
      "const r3 = parseAge('200');",
      "",
      "console.log(r1.ok, r1.ok ? r1.value : r1.error);",
      "console.log(r2.ok, r2.ok ? r2.value : r2.error);",
      "console.log(r3.ok, r3.ok ? r3.value : r3.error);",
    ],
    steps: [
      {
        lineIndex: 11,
        question: "What does parseAge('25') return? What type does r1 have?",
        expectedAnswer: "{ ok: true, value: 25 }",
        variables: { "r1": "{ ok: true, value: 25 }" },
        explanation:
          "parseInt('25') = 25. Not NaN, not <0 or >150. " +
          "So: return ok(25) = { ok: true, value: 25 }.",
      },
      {
        lineIndex: 12,
        question: "What does parseAge('abc') return?",
        expectedAnswer: "{ ok: false, error: 'Not a number' }",
        variables: { "r1": "{ ok: true, value: 25 }", "r2": "{ ok: false, error: 'Not a number' }" },
        explanation:
          "parseInt('abc') = NaN. isNaN(NaN) = true. " +
          "So: return err('Not a number').",
      },
      {
        lineIndex: 13,
        question: "What does parseAge('200') return?",
        expectedAnswer: "{ ok: false, error: 'Invalid' }",
        variables: { "r1": "{ ok: true, value: 25 }", "r2": "{ ok: false, error: 'Not a number' }", "r3": "{ ok: false, error: 'Invalid' }" },
        explanation:
          "parseInt('200') = 200. Not NaN, but 200 > 150. " +
          "So: return err('Invalid').",
      },
      {
        lineIndex: 15,
        question: "What does the first console.log output?",
        expectedAnswer: "true 25",
        variables: { "r1.ok": "true", "r1.value": "25" },
        explanation:
          "r1.ok = true, so r1.value (25) is output. " +
          "TypeScript narrows in the ternary: ok=true → value exists.",
      },
    ],
    concept: "Result Pattern and Narrowing",
    difficulty: 2,
  },

  // --- Exercise 2: Exhaustive Error Handling Flow ---
  {
    id: "25-exhaustive-flow",
    title: "Exhaustive Switch — What happens with a new error type?",
    description:
      "Trace what happens when a new error type is added to the union " +
      "but the switch is not updated.",
    code: [
      "type ApiError = 'NOT_FOUND' | 'FORBIDDEN' | 'TIMEOUT';",
      "",
      "function assertNever(x: never): never {",
      "  throw new Error(`Unhandled: ${x}`);",
      "}",
      "",
      "function getStatusCode(e: ApiError): number {",
      "  switch (e) {",
      "    case 'NOT_FOUND': return 404;",
      "    case 'FORBIDDEN': return 403;",
      "    case 'TIMEOUT': return 408;",
      "    default: return assertNever(e);",
      "  }",
      "}",
      "",
      "console.log(getStatusCode('NOT_FOUND'));",
      "console.log(getStatusCode('TIMEOUT'));",
      "// What if ApiError = 'NOT_FOUND' | 'FORBIDDEN' | 'TIMEOUT' | 'RATE_LIMITED'?",
    ],
    steps: [
      {
        lineIndex: 15,
        question: "What does getStatusCode('NOT_FOUND') return?",
        expectedAnswer: "404",
        variables: { "e": "'NOT_FOUND'" },
        explanation:
          "switch('NOT_FOUND') matches case 'NOT_FOUND' → return 404.",
      },
      {
        lineIndex: 16,
        question: "What does getStatusCode('TIMEOUT') return?",
        expectedAnswer: "408",
        variables: { "e": "'TIMEOUT'" },
        explanation:
          "switch('TIMEOUT') matches case 'TIMEOUT' → return 408.",
      },
      {
        lineIndex: 11,
        question: "What is the type of e in the default branch with the current ApiError?",
        expectedAnswer: "never",
        variables: { "e": "never (all cases handled)" },
        explanation:
          "All three variants are handled in case branches. " +
          "The remaining type in the default is 'never'. assertNever(e) compiles.",
      },
      {
        lineIndex: 17,
        question:
          "If 'RATE_LIMITED' is added to ApiError: What happens in the default branch?",
        expectedAnswer: "COMPILE-ERROR: Argument of type 'RATE_LIMITED' is not assignable to 'never'",
        variables: { "e": "'RATE_LIMITED' (not never!)" },
        explanation:
          "With 'RATE_LIMITED' in the union but without case 'RATE_LIMITED' " +
          "e in the default has type 'RATE_LIMITED' (not never). " +
          "assertNever(e: never) does not accept 'RATE_LIMITED' → COMPILE-ERROR.",
      },
    ],
    concept: "Exhaustive Error Handling and assertNever",
    difficulty: 3,
  },

  // --- Exercise 3: Option unwrap/match ---
  {
    id: "25-option-chain",
    title: "Option Chain — Tracing null propagation",
    description:
      "Trace how null propagates through a chain of mapOption calls " +
      "and when getOrElse takes effect.",
    code: [
      "type Option<T> = T | null;",
      "",
      "function mapOption<T, U>(v: Option<T>, fn: (x: T) => U): Option<U> {",
      "  return v === null ? null : fn(v);",
      "}",
      "",
      "function getOrElse<T>(v: Option<T>, fallback: T): T {",
      "  return v ?? fallback;",
      "}",
      "",
      "interface User { name: string; age: number; }",
      "",
      "const user1: Option<User> = { name: 'Max', age: 25 };",
      "const user2: Option<User> = null;",
      "",
      "const name1 = mapOption(user1, u => u.name);",
      "const name2 = mapOption(user2, u => u.name);",
      "",
      "console.log(getOrElse(name1, 'Unknown'));",
      "console.log(getOrElse(name2, 'Unknown'));",
    ],
    steps: [
      {
        lineIndex: 15,
        question: "What is name1 after mapOption(user1, u => u.name)?",
        expectedAnswer: "'Max'",
        variables: { "user1": "{ name: 'Max', age: 25 }", "name1": "'Max'" },
        explanation:
          "user1 is not null → fn is called: u.name = 'Max'. " +
          "mapOption returns 'Max'.",
      },
      {
        lineIndex: 16,
        question: "What is name2 after mapOption(user2, u => u.name)?",
        expectedAnswer: "null",
        variables: { "user2": "null", "name2": "null" },
        explanation:
          "user2 is null → mapOption returns null immediately. " +
          "fn is NOT called. This is null propagation.",
      },
      {
        lineIndex: 18,
        question: "What does getOrElse(name1, 'Unknown') return?",
        expectedAnswer: "'Max'",
        variables: { "name1": "'Max'" },
        explanation:
          "name1 = 'Max' (not null). ?? returns the left side. " +
          "Output: 'Max'.",
      },
      {
        lineIndex: 19,
        question: "What does getOrElse(name2, 'Unknown') return?",
        expectedAnswer: "'Unknown'",
        variables: { "name2": "null" },
        explanation:
          "name2 = null. ?? returns the right side (fallback). " +
          "Output: 'Unknown'. That is exactly what getOrElse is for.",
      },
    ],
    concept: "Option/Maybe Chaining and Null Propagation",
    difficulty: 2,
  },

  // --- Exercise 4: Error Propagation with flatMapResult ---
  {
    id: "25-error-propagation",
    title: "flatMapResult — Error propagation tracing",
    description:
      "Trace how errors propagate through a flatMapResult chain " +
      "and when the chain short-circuits.",
    code: [
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };",
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }",
      "function err<E>(e: E) { return { ok: false as const, error: e }; }",
      "",
      "function flatMap<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {",
      "  if (!r.ok) return r;",
      "  return fn(r.value);",
      "}",
      "",
      "function parseNum(s: string): Result<number, string> {",
      "  const n = parseInt(s);",
      "  return isNaN(n) ? err('NaN') : ok(n);",
      "}",
      "",
      "function checkPositive(n: number): Result<number, string> {",
      "  return n > 0 ? ok(n) : err('Not positive');",
      "}",
      "",
      "const r1 = flatMap(parseNum('42'), checkPositive);",
      "const r2 = flatMap(parseNum('abc'), checkPositive);",
      "const r3 = flatMap(parseNum('-5'), checkPositive);",
      "",
      "console.log(r1);",
      "console.log(r2);",
      "console.log(r3);",
    ],
    steps: [
      {
        lineIndex: 18,
        question: "What is r1 after flatMap(parseNum('42'), checkPositive)?",
        expectedAnswer: "{ ok: true, value: 42 }",
        variables: { "r1": "{ ok: true, value: 42 }" },
        explanation:
          "parseNum('42') = ok(42). flatMap: r.ok=true → fn(42). " +
          "checkPositive(42): 42 > 0 → ok(42). Result: { ok: true, value: 42 }.",
      },
      {
        lineIndex: 19,
        question: "What is r2? Is checkPositive called?",
        expectedAnswer: "{ ok: false, error: 'NaN' }",
        variables: { "r2": "{ ok: false, error: 'NaN' }" },
        explanation:
          "parseNum('abc') = err('NaN'). flatMap: r.ok=false → " +
          "return r immediately. checkPositive is NOT called. " +
          "The error is propagated through ('Railway Oriented Programming').",
      },
      {
        lineIndex: 20,
        question: "What is r3? Which error occurs?",
        expectedAnswer: "{ ok: false, error: 'Not positive' }",
        variables: { "r3": "{ ok: false, error: 'Not positive' }" },
        explanation:
          "parseNum('-5') = ok(-5). flatMap: r.ok=true → fn(-5). " +
          "checkPositive(-5): -5 not > 0 → err('Not positive'). " +
          "The error comes from the SECOND step, not the first.",
      },
      {
        lineIndex: 22,
        question: "Which three outputs appear on the console?",
        expectedAnswer: "{ ok: true, value: 42 }, { ok: false, error: 'NaN' }, { ok: false, error: 'Not positive' }",
        variables: {
          "r1": "{ ok: true, value: 42 }",
          "r2": "{ ok: false, error: 'NaN' }",
          "r3": "{ ok: false, error: 'Not positive' }",
        },
        explanation:
          "r1: Both steps successful. r2: First step fails, " +
          "error is propagated through. r3: First step OK, second fails. " +
          "flatMap makes error propagation linear instead of nested.",
      },
    ],
    concept: "flatMapResult and Railway Oriented Programming",
    difficulty: 4,
  },
];