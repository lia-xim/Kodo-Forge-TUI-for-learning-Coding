/**
 * LEKTION 03 - Exercise 2: Inference Vorhersagen
 *
 * Bei jeder Aufgabe siehst du einen Code-Schnipsel.
 * Deine Aufgabe: Sage voraus, welchen Typ TypeScript infert.
 *
 * Schreibe deinen vermuteten Typ in den `type Test_X = Expect<Equal<...>>`
 * Ausdruck ein. Wenn dein Typ stimmt, kompiliert der Code ohne Fehler.
 * Wenn nicht, zeigt dir der Compiler genau, was falsch ist.
 *
 * TIPP: Versuche zuerst OHNE Hovern den Typ zu erraten!
 *       Dann hover ueber die Variable, um zu pruefen.
 *
 * Pruefen: npx tsc --noEmit
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

// ============================================================================
// GRUNDLAGEN (Aufgaben 1-5)
// ============================================================================

// ── AUFGABE 1: const Primitive ──────────────────────────────────────────────

const greeting = "Hallo Welt";

// Welchen Typ hat 'greeting'?
// TODO: Ersetze 'unknown' durch den richtigen Typ
type Test_1 = Expect<Equal<typeof greeting, unknown>>;

// ── AUFGABE 2: let Primitive ────────────────────────────────────────────────

let counter = 42;

// Welchen Typ hat 'counter'?
type Test_2 = Expect<Equal<typeof counter, unknown>>;

// ── AUFGABE 3: Mixed Array ──────────────────────────────────────────────────

const items = [1, "hello", true];

// Welchen Typ hat 'items'?
type Test_3 = Expect<Equal<typeof items, unknown>>;

// ── AUFGABE 4: Object Literal ───────────────────────────────────────────────

const config = {
  host: "localhost",
  port: 3000,
  debug: false,
};

// Welchen Typ hat 'config'?
type Test_4 = Expect<Equal<typeof config, unknown>>;

// ── AUFGABE 5: Funktions-Return ─────────────────────────────────────────────

function createPair(a: number, b: string) {
  return { first: a, second: b };
}

const pair = createPair(1, "hello");

// Welchen Typ hat 'pair'?
type Test_5 = Expect<Equal<typeof pair, unknown>>;

// ============================================================================
// INTERMEDIATE (Aufgaben 6-10)
// ============================================================================

// ── AUFGABE 6: Conditional Return ───────────────────────────────────────────

function maybeString(value: number) {
  if (value > 0) {
    return value.toString();
  }
  return null;
}

const result6 = maybeString(5);

// Welchen Typ hat 'result6'?
type Test_6 = Expect<Equal<typeof result6, unknown>>;

// ── AUFGABE 7: Array.map() ─────────────────────────────────────────────────

const names = ["Alice", "Bob", "Clara"];
const lengths = names.map(name => name.length);

// Welchen Typ hat 'lengths'?
type Test_7 = Expect<Equal<typeof lengths, unknown>>;

// ── AUFGABE 8: as const auf Array ──────────────────────────────────────────

const directions = ["north", "south", "east", "west"] as const;

// Welchen Typ hat 'directions'?
type Test_8 = Expect<Equal<typeof directions, unknown>>;

// ── AUFGABE 9: as const auf Objekt ─────────────────────────────────────────

const settings = {
  theme: "dark",
  fontSize: 14,
} as const;

// Welchen Typ hat 'settings'?
type Test_9 = Expect<Equal<typeof settings, unknown>>;

// ── AUFGABE 10: Ternary mit const ──────────────────────────────────────────

const flag = true;
const value10 = flag ? "yes" : 42;

// HINWEIS: Wertet TS den Ternary bei const aus? Oder behaelt es beide Zweige?
type Test_10 = Expect<Equal<typeof value10, unknown>>;

// ============================================================================
// FORTGESCHRITTEN (Aufgaben 11-15)
// ============================================================================

// ── AUFGABE 11: Object.keys() ──────────────────────────────────────────────

const user = { name: "Max", age: 30, city: "Berlin" };
const keys = Object.keys(user);

// Welchen Typ hat 'keys'?
// HINWEIS: Gibt Object.keys() die Literal-Keys zurueck?
type Test_11 = Expect<Equal<typeof keys, unknown>>;

// ── AUFGABE 12: Array.find() ───────────────────────────────────────────────

const numbers = [10, 20, 30, 40, 50];
const found = numbers.find(n => n > 25);

// Welchen Typ hat 'found'?
// HINWEIS: Was passiert, wenn find() nichts findet?
type Test_12 = Expect<Equal<typeof found, unknown>>;

// ── AUFGABE 13: Spread-Operator auf Objekte ────────────────────────────────

const base = { a: 1, b: "hello" };
const extended = { ...base, c: true, b: 42 };

// Welchen Typ hat 'extended'?
// HINWEIS: Was passiert mit 'b', das in beiden Objekten existiert?
type Test_13 = Expect<Equal<typeof extended, unknown>>;

// ── AUFGABE 14: Return mit Literal vs Widened ──────────────────────────────

function getStatus() {
  return "active";
}

function getStatusConst() {
  return "active" as const;
}

const status14a = getStatus();
const status14b = getStatusConst();

// Welchen Typ hat 'status14a'?
type Test_14a = Expect<Equal<typeof status14a, unknown>>;

// Welchen Typ hat 'status14b'?
type Test_14b = Expect<Equal<typeof status14b, unknown>>;

// ── AUFGABE 15: Promise.all() ──────────────────────────────────────────────

async function fetchBoth() {
  const result = await Promise.all([
    Promise.resolve("hello"),
    Promise.resolve(42),
    Promise.resolve(true),
  ]);
  return result;
}

type FetchResult = Awaited<ReturnType<typeof fetchBoth>>;

// Welchen Typ hat FetchResult?
type Test_15 = Expect<Equal<FetchResult, unknown>>;

// ============================================================================
// BONUS-AUFGABEN (schwierig, keine Tests -- nur zum Nachdenken)
// ============================================================================

// Bonus A: Was ist der Typ?
const bonusA = [1, 2, 3].filter(n => n > 1);
// Antwort: ???

// Bonus B: Was ist der Typ?
const bonusB = Object.freeze({ x: 10, y: 20 });
// Antwort: ???

// Bonus C: Was ist der Typ des Arrays vs. des Elements?
const bonusC = ["hello", 42, null] as const;
const bonusCElement = bonusC[0];
// bonusC Typ: ???
// bonusCElement Typ: ???

// Bonus D: Was ist der Typ?
function bonusFn<T extends string>(value: T) {
  return { value };
}
const bonusD = bonusFn("test");
// bonusD Typ: ???

// Bonus E: Was ist der Typ?
const bonusE = [1, 2, 3].reduce((acc, n) => ({ ...acc, [n]: n * 2 }), {} as Record<number, number>);
// bonusE Typ: ???
