/**
 * Lektion 25 — Tracing-Exercises: Type-safe Error Handling
 *
 * Themen:
 *  - Result-Chain Ausfuehrung (ok/err Pfade)
 *  - Exhaustive Error Handling Flow (switch + assertNever)
 *  - Option unwrap/match Verhalten
 *  - Error-Propagation durch mapResult/flatMapResult
 *
 * Schwierigkeit steigend: 2 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // --- Exercise 1: Result-Chain Ausfuehrung ---
  {
    id: "25-result-chain",
    title: "Result-Chain — Welcher Pfad wird genommen?",
    description:
      "Verfolge den Fluss durch ok()- und err()-Pfade. " +
      "Welche console.log-Ausgaben erscheinen?",
    code: [
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };",
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }",
      "function err<E>(e: E) { return { ok: false as const, error: e }; }",
      "",
      "function parseAge(raw: string): Result<number, string> {",
      "  const n = parseInt(raw);",
      "  if (isNaN(n)) return err('Keine Zahl');",
      "  if (n < 0 || n > 150) return err('Ungueltig');",
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
        question: "Was gibt parseAge('25') zurueck? Welchen Typ hat r1?",
        expectedAnswer: "{ ok: true, value: 25 }",
        variables: { "r1": "{ ok: true, value: 25 }" },
        explanation:
          "parseInt('25') = 25. Nicht NaN, nicht <0 oder >150. " +
          "Also: return ok(25) = { ok: true, value: 25 }.",
      },
      {
        lineIndex: 12,
        question: "Was gibt parseAge('abc') zurueck?",
        expectedAnswer: "{ ok: false, error: 'Keine Zahl' }",
        variables: { "r1": "{ ok: true, value: 25 }", "r2": "{ ok: false, error: 'Keine Zahl' }" },
        explanation:
          "parseInt('abc') = NaN. isNaN(NaN) = true. " +
          "Also: return err('Keine Zahl').",
      },
      {
        lineIndex: 13,
        question: "Was gibt parseAge('200') zurueck?",
        expectedAnswer: "{ ok: false, error: 'Ungueltig' }",
        variables: { "r1": "{ ok: true, value: 25 }", "r2": "{ ok: false, error: 'Keine Zahl' }", "r3": "{ ok: false, error: 'Ungueltig' }" },
        explanation:
          "parseInt('200') = 200. Nicht NaN, aber 200 > 150. " +
          "Also: return err('Ungueltig').",
      },
      {
        lineIndex: 15,
        question: "Was gibt die erste console.log aus?",
        expectedAnswer: "true 25",
        variables: { "r1.ok": "true", "r1.value": "25" },
        explanation:
          "r1.ok = true, also wird r1.value (25) ausgegeben. " +
          "TypeScript narrowt im ternary: ok=true → value existiert.",
      },
    ],
    concept: "Result-Pattern und Narrowing",
    difficulty: 2,
  },

  // --- Exercise 2: Exhaustive Error Handling Flow ---
  {
    id: "25-exhaustive-flow",
    title: "Exhaustive Switch — Was passiert bei neuem Error-Typ?",
    description:
      "Verfolge was passiert wenn ein neuer Error-Typ zum Union hinzugefuegt " +
      "wird aber der Switch nicht aktualisiert wird.",
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
      "// Was wenn ApiError = 'NOT_FOUND' | 'FORBIDDEN' | 'TIMEOUT' | 'RATE_LIMITED'?",
    ],
    steps: [
      {
        lineIndex: 15,
        question: "Was gibt getStatusCode('NOT_FOUND') zurueck?",
        expectedAnswer: "404",
        variables: { "e": "'NOT_FOUND'" },
        explanation:
          "switch('NOT_FOUND') matcht case 'NOT_FOUND' → return 404.",
      },
      {
        lineIndex: 16,
        question: "Was gibt getStatusCode('TIMEOUT') zurueck?",
        expectedAnswer: "408",
        variables: { "e": "'TIMEOUT'" },
        explanation:
          "switch('TIMEOUT') matcht case 'TIMEOUT' → return 408.",
      },
      {
        lineIndex: 11,
        question: "Was ist der Typ von e im default-Branch mit dem aktuellen ApiError?",
        expectedAnswer: "never",
        variables: { "e": "never (alle Cases behandelt)" },
        explanation:
          "Alle drei Varianten sind in case-Branches behandelt. " +
          "Der Rest-Typ im default ist 'never'. assertNever(e) kompiliert.",
      },
      {
        lineIndex: 17,
        question:
          "Wenn 'RATE_LIMITED' zu ApiError hinzugefuegt wird: Was passiert im default?",
        expectedAnswer: "COMPILE-ERROR: Argument of type 'RATE_LIMITED' is not assignable to 'never'",
        variables: { "e": "'RATE_LIMITED' (nicht never!)" },
        explanation:
          "Mit 'RATE_LIMITED' im Union aber ohne case 'RATE_LIMITED' " +
          "hat e im default den Typ 'RATE_LIMITED' (nicht never). " +
          "assertNever(e: never) akzeptiert 'RATE_LIMITED' nicht → COMPILE-ERROR.",
      },
    ],
    concept: "Exhaustive Error Handling und assertNever",
    difficulty: 3,
  },

  // --- Exercise 3: Option unwrap/match ---
  {
    id: "25-option-chain",
    title: "Option-Kette — Null-Propagation verfolgen",
    description:
      "Verfolge wie null durch eine Kette von mapOption-Aufrufen propagiert " +
      "und wann getOrElse greift.",
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
      "console.log(getOrElse(name1, 'Unbekannt'));",
      "console.log(getOrElse(name2, 'Unbekannt'));",
    ],
    steps: [
      {
        lineIndex: 15,
        question: "Was ist name1 nach mapOption(user1, u => u.name)?",
        expectedAnswer: "'Max'",
        variables: { "user1": "{ name: 'Max', age: 25 }", "name1": "'Max'" },
        explanation:
          "user1 ist nicht null → fn wird aufgerufen: u.name = 'Max'. " +
          "mapOption gibt 'Max' zurueck.",
      },
      {
        lineIndex: 16,
        question: "Was ist name2 nach mapOption(user2, u => u.name)?",
        expectedAnswer: "null",
        variables: { "user2": "null", "name2": "null" },
        explanation:
          "user2 ist null → mapOption gibt sofort null zurueck. " +
          "fn wird NICHT aufgerufen. Das ist die Null-Propagation.",
      },
      {
        lineIndex: 18,
        question: "Was gibt getOrElse(name1, 'Unbekannt') zurueck?",
        expectedAnswer: "'Max'",
        variables: { "name1": "'Max'" },
        explanation:
          "name1 = 'Max' (nicht null). ?? gibt linke Seite zurueck. " +
          "Output: 'Max'.",
      },
      {
        lineIndex: 19,
        question: "Was gibt getOrElse(name2, 'Unbekannt') zurueck?",
        expectedAnswer: "'Unbekannt'",
        variables: { "name2": "null" },
        explanation:
          "name2 = null. ?? gibt rechte Seite zurueck (Fallback). " +
          "Output: 'Unbekannt'. Genau dafuer ist getOrElse da.",
      },
    ],
    concept: "Option/Maybe Chaining und Null-Propagation",
    difficulty: 2,
  },

  // --- Exercise 4: Error-Propagation mit flatMapResult ---
  {
    id: "25-error-propagation",
    title: "flatMapResult — Fehler-Durchleitung tracing",
    description:
      "Verfolge wie Fehler durch eine flatMapResult-Kette propagiert werden " +
      "und wann die Kette abbricht.",
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
      "  return n > 0 ? ok(n) : err('Nicht positiv');",
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
        question: "Was ist r1 nach flatMap(parseNum('42'), checkPositive)?",
        expectedAnswer: "{ ok: true, value: 42 }",
        variables: { "r1": "{ ok: true, value: 42 }" },
        explanation:
          "parseNum('42') = ok(42). flatMap: r.ok=true → fn(42). " +
          "checkPositive(42): 42 > 0 → ok(42). Ergebnis: { ok: true, value: 42 }.",
      },
      {
        lineIndex: 19,
        question: "Was ist r2? Wird checkPositive aufgerufen?",
        expectedAnswer: "{ ok: false, error: 'NaN' }",
        variables: { "r2": "{ ok: false, error: 'NaN' }" },
        explanation:
          "parseNum('abc') = err('NaN'). flatMap: r.ok=false → " +
          "return r sofort. checkPositive wird NICHT aufgerufen. " +
          "Der Fehler wird durchgeleitet ('Railway Oriented Programming').",
      },
      {
        lineIndex: 20,
        question: "Was ist r3? Welcher Fehler kommt?",
        expectedAnswer: "{ ok: false, error: 'Nicht positiv' }",
        variables: { "r3": "{ ok: false, error: 'Nicht positiv' }" },
        explanation:
          "parseNum('-5') = ok(-5). flatMap: r.ok=true → fn(-5). " +
          "checkPositive(-5): -5 nicht > 0 → err('Nicht positiv'). " +
          "Der Fehler kommt aus dem ZWEITEN Schritt, nicht dem ersten.",
      },
      {
        lineIndex: 22,
        question: "Welche drei Ausgaben erscheinen auf der Konsole?",
        expectedAnswer: "{ ok: true, value: 42 }, { ok: false, error: 'NaN' }, { ok: false, error: 'Nicht positiv' }",
        variables: {
          "r1": "{ ok: true, value: 42 }",
          "r2": "{ ok: false, error: 'NaN' }",
          "r3": "{ ok: false, error: 'Nicht positiv' }",
        },
        explanation:
          "r1: Beide Schritte erfolgreich. r2: Erster Schritt schlaegt fehl, " +
          "Fehler wird durchgeleitet. r3: Erster Schritt OK, zweiter schlaegt fehl. " +
          "flatMap macht Fehler-Propagation linear statt verschachtelt.",
      },
    ],
    concept: "flatMapResult und Railway Oriented Programming",
    difficulty: 4,
  },
];
