/**
 * Lektion 25 — Parson's Problems: Type-safe Error Handling
 *
 * 4 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Result-Typ, exhaustive Switch, Option Chaining, Error-Konvertierung
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // --- Problem 1: Result-Typ implementieren ---
  {
    id: "L25-P1",
    title: "Result-Typ mit ok/err Helfern",
    description:
      "Ordne die Zeilen so, dass ein vollstaendiger Result-Typ mit " +
      "ok()- und err()-Helfern entsteht und eine parseAge-Funktion " +
      "das Pattern korrekt verwendet.",
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
      "  if (isNaN(n)) return err('Keine Zahl');",
      "  if (n < 0 || n > 150) return err('Ausserhalb 0-150');",
      "  return ok(n);",
      "}",
    ],
    distractors: [
      "function ok<T>(value: T) { return { ok: true, value }; }",
      "type Result<T, E> = { ok: boolean; value?: T; error?: E };",
    ],
    hint:
      "Der Result-Typ muss eine Discriminated Union sein (ok: true | false als Literal). " +
      "Die Helfer brauchen 'as const' damit TypeScript Narrowing funktioniert. " +
      "Distraktoren: 'ok: true' ohne as const und 'ok: boolean' sind falsch.",
    concept: "Result-Pattern mit Discriminated Union",
    difficulty: 2,
  },

  // --- Problem 2: Exhaustive Switch auf Error-Typen ---
  {
    id: "L25-P2",
    title: "Exhaustive Switch mit assertNever",
    description:
      "Ordne die Zeilen so, dass ein exhaustiver Error-Handler entsteht. " +
      "Wenn ein neuer Error-Typ hinzukommt, soll der Compiler warnen.",
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
      "assertNever im default-Branch ist der Schluessel: Wenn alle Cases behandelt " +
      "sind, hat e den Typ 'never'. Distraktoren verwenden throw oder einen Fallback " +
      "statt assertNever — damit fehlt die Compile-Time-Pruefung.",
    concept: "Exhaustive Error Handling mit assertNever",
    difficulty: 2,
  },

  // --- Problem 3: Option/Maybe Chaining ---
  {
    id: "L25-P3",
    title: "Option-Chaining mit mapMaybe und getOrElse",
    description:
      "Ordne die Zeilen so, dass eine Pipeline entsteht die einen " +
      "optionalen User filtert, den Namen extrahiert und einen Default liefert.",
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
      "const display = getOrElse(name, 'Unbekannt');",
    ],
    distractors: [
      "function mapOption<T, U>(v: T, fn: (x: T) => U): U { return fn(v); }",
    ],
    hint:
      "mapOption muss null-Pruefung machen — der Distraktor ueberspringt sie. " +
      "getOrElse nutzt den ?? Operator (Nullish Coalescing). Die Pipeline " +
      "fliesst: Option<User> → mapOption → Option<string> → getOrElse → string.",
    concept: "Option/Maybe Chaining",
    difficulty: 2,
  },

  // --- Problem 4: Error-Konvertierung zwischen Schichten ---
  {
    id: "L25-P4",
    title: "Error-Konvertierung: DB-Fehler zu Domain-Fehler",
    description:
      "Ordne die Zeilen so, dass eine Konvertierungsfunktion entsteht " +
      "die Datenbank-Fehler in Domain-Fehler uebersetzt.",
    correctOrder: [
      "type DbError = { type: 'CONSTRAINT' } | { type: 'CONNECTION' } | { type: 'TIMEOUT' };",
      "type DomainError = { type: 'ALREADY_EXISTS' } | { type: 'UNAVAILABLE'; message: string };",
      "",
      "function assertNever(x: never): never { throw new Error('Unhandled'); }",
      "",
      "function toDomainError(e: DbError): DomainError {",
      "  switch (e.type) {",
      "    case 'CONSTRAINT': return { type: 'ALREADY_EXISTS' };",
      "    case 'CONNECTION': return { type: 'UNAVAILABLE', message: 'DB nicht erreichbar' };",
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
      "Jeder DB-Fehler wird zu einem Domain-Fehler uebersetzt — nicht durchgeleitet " +
      "oder geworfen. Der erste Distraktor wirft statt zu konvertieren, der zweite " +
      "gibt den DB-Fehler unveraendert zurueck (Schichtenverletzung).",
    concept: "Error-Konvertierung / Anti-Corruption Layer",
    difficulty: 3,
  },
];
