/**
 * Lesson 25 — Parson's Problems: Type-safe Error Handling
 *
 * 4 problems for arranging lines of code.
 * Concepts: Result type, exhaustive switch, option chaining, error conversion
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // --- Problem 1: Implement Result Type ---
  {
    id: "L25-P1",
    title: "Result Type with ok/err Helpers",
    description:
      "Arrange the lines so that a complete Result type with " +
      "ok() and err() helpers is created and a parseAge function " +
      "correctly uses the pattern.",
    correctOrder: [
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };",
      "",
      "function ok<T>(value: T) {",
      "  return { ok: true as const, value };",
      "}",
      "",
      "function err<E>(error: E) {",
      "  return { ok: false as const, error };",
      "}",
      "",
      "function parseAge(raw: string): Result<number, string> {",
      "  const n = parseInt(raw);",
      "  if (isNaN(n)) return err('Not a number');",
      "  if (n < 0 || n > 150) return err('Outside 0-150');",
      "  return ok(n);",
      "}",
    ],
    distractors: [
      "function ok<T>(value: T) { return { ok: true, value }; }",
      "type Result<T, E> = { ok: boolean; value?: T; error?: E };",
    ],
    hint:
      "The Result type must be a Discriminated Union (ok: true | false as a literal). " +
      "The helpers need 'as const' so TypeScript narrowing works. " +
      "Distractors: 'ok: true' without as const and 'ok: boolean' are wrong.",
    concept: "Result Pattern with Discriminated Union",
    difficulty: 2,
  },

  // --- Problem 2: Exhaustive Switch on Error Types ---
  {
    id: "L25-P2",
    title: "Exhaustive Switch with assertNever",
    description:
      "Arrange the lines so that an exhaustive error handler is created. " +
      "When a new error type is added, the compiler should warn.",
    correctOrder: [
      "type ApiError = 'NOT_FOUND' | 'FORBIDDEN' | 'TIMEOUT';",
      "",
      "function assertNever(x: never): never {",
      "  throw new Error(`Unhandled: ${JSON.stringify(x)}`);",
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
    ],
    distractors: [
      "default: throw new Error(e);",
      "default: return -1;",
    ],
    hint:
      "assertNever in the default branch is the key: when all cases are handled, " +
      "e has the type 'never'. Distractors use throw or a fallback instead of " +
      "assertNever — this means compile-time checking is missing.",
    concept: "Exhaustive Error Handling with assertNever",
    difficulty: 2,
  },

  // --- Problem 3: Option/Maybe Chaining ---
  {
    id: "L25-P3",
    title: "Option Chaining with mapMaybe and getOrElse",
    description:
      "Arrange the lines so that a pipeline is created that filters an " +
      "optional user, extracts the name, and provides a default value.",
    correctOrder: [
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
      "const user: Option<User> = { name: 'Max', age: 25 };",
      "const name = mapOption(user, u => u.name);",
      "const display = getOrElse(name, 'Unknown');",
    ],
    distractors: [
      "function mapOption<T, U>(v: T, fn: (x: T) => U): U { return fn(v); }",
    ],
    hint:
      "mapOption must perform null checking — the distractor skips it. " +
      "getOrElse uses the ?? operator (Nullish Coalescing). The pipeline " +
      "flows: Option<User> → mapOption → Option<string> → getOrElse → string.",
    concept: "Option/Maybe Chaining",
    difficulty: 2,
  },

  // --- Problem 4: Error Conversion Between Layers ---
  {
    id: "L25-P4",
    title: "Error Conversion: DB Errors to Domain Errors",
    description:
      "Arrange the lines so that a conversion function is created " +
      "that translates database errors into domain errors.",
    correctOrder: [
      "type DbError = { type: 'CONSTRAINT' } | { type: 'CONNECTION' } | { type: 'TIMEOUT' };",
      "type DomainError = { type: 'ALREADY_EXISTS' } | { type: 'UNAVAILABLE'; message: string };",
      "",
      "function assertNever(x: never): never { throw new Error('Unhandled'); }",
      "",
      "function toDomainError(e: DbError): DomainError {",
      "  switch (e.type) {",
      "    case 'CONSTRAINT': return { type: 'ALREADY_EXISTS' };",
      "    case 'CONNECTION': return { type: 'UNAVAILABLE', message: 'DB unreachable' };",
      "    case 'TIMEOUT': return { type: 'UNAVAILABLE', message: 'DB Timeout' };",
      "    default: return assertNever(e);",
      "  }",
      "}",
    ],
    distractors: [
      "case 'CONSTRAINT': throw new Error('Constraint violation');",
      "function toDomainError(e: DbError): DbError { return e; }",
    ],
    hint:
      "Each DB error is translated into a domain error — not passed through or thrown. " +
      "The first distractor throws instead of converting, the second returns the DB " +
      "error unchanged (layer violation).",
    concept: "Error Conversion / Anti-Corruption Layer",
    difficulty: 3,
  },
];