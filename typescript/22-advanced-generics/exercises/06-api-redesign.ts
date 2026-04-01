/**
 * Exercise 06: API Redesign
 *
 * Refactore eine "ueber-generische" API zu einer sauberen API.
 * Wende die Rule of Two an, entscheide Overloads vs Generics,
 * und verbessere die Inference.
 *
 * Ausfuehren: npx tsx exercises/06-api-redesign.ts
 */

// ─── Die schlecht designte API (refactore sie!) ─────────────────────────

// Problem 1: T nur einmal verwendet (Rule of Two verletzt)
function formatValue<T extends string | number>(value: T): string {
  return `Formatted: ${String(value)}`;
}

// Problem 2: T nur einmal verwendet
function logItem<T>(item: T): void {
  console.log(`[LOG] ${item}`);
}

// Problem 3: Generic wo Overloads besser waeren
function convert<T extends string | number>(
  input: T
): T extends string ? number : string {
  if (typeof input === "string") return parseInt(input, 10) as any;
  return String(input) as any;
}

// Problem 4: any als Default
function createStore<T = any>(initialValue: T): { get(): T; set(v: T): void } {
  let value = initialValue;
  return {
    get() { return value; },
    set(v: T) { value = v; },
  };
}

// Problem 5: Zu viele Typparameter
function transformData<A, B, C>(
  input: A,
  step1: (a: A) => B,
  step2: (b: B) => C
): C {
  return step2(step1(input));
}


// ─── TODO 1: Refactore formatValue ─────────────────────────────────────
// Ersetze das unnoetige Generic durch einen konkreten Typ.

// TODO: function formatValueFixed(...)


// ─── TODO 2: Refactore logItem ──────────────────────────────────────────
// T wird nur einmal verwendet — durch was ersetzen?

// TODO: function logItemFixed(...)


// ─── TODO 3: Refactore convert mit Overloads ────────────────────────────
// Ersetze den Conditional-Return-Typ durch saubere Overloads.

// TODO: function convertFixed(input: string): number;
// TODO: function convertFixed(input: number): string;
// TODO: function convertFixed(input: string | number): string | number { ... }


// ─── TODO 4: Refactore createStore mit besserem Default ─────────────────
// Ersetze any durch einen sicheren Default.

// TODO: function createStoreFixed<T = unknown>(...)


// ─── TODO 5: Behalte transformData — es ist GUT! ────────────────────────
// Erklaere WARUM dieses Generic berechtigt ist.
// (Hinweis: Wie oft kommt jeder Typparameter vor?)

// TODO: Schreibe einen Kommentar der erklaert warum A, B, C alle noetig sind.


// ─── TODO 6: Schreibe eine typsichere pipe-Funktion ────────────────────
// Kombiniere Overloads und Generics:
// pipe(value, fn1): Ergebnis von fn1
// pipe(value, fn1, fn2): Ergebnis von fn2
// pipe(value, fn1, fn2, fn3): Ergebnis von fn3

// TODO: function pipe(...)


// ─── Tests ──────────────────────────────────────────────────────────────

/*
// Entkommentiere wenn implementiert:

// TODO 1:
console.log(formatValueFixed("hello")); // "Formatted: hello"
console.log(formatValueFixed(42));       // "Formatted: 42"

// TODO 2:
logItemFixed("Test message");
logItemFixed(42);
logItemFixed({ key: "value" });

// TODO 3:
console.log(convertFixed("42"));  // 42 (number)
console.log(convertFixed(42));    // "42" (string)

// TODO 4:
const store = createStoreFixed(42);
console.log(store.get());  // 42
store.set(100);
console.log(store.get());  // 100

// TODO 6:
const result = pipe(
  "  Hello World  ",
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.split(" "),
);
console.log(result); // ["hello", "world"]
*/

console.log("Exercise 06: Refactore die API und implementiere die TODOs!");
