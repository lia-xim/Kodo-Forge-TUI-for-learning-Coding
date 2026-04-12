/**
 * Lektion 14 - Exercise 03: Generic Higher-Order Functions
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-generic-hof.ts
 *
 * 5 Aufgaben zu pipe, compose, map, curry und memoize.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: pipe() implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere pipe() mit Overloads fuer 2, 3 und 4 Funktionen.
// pipe(value, fn1, fn2, ...) — jeder Schritt soll typsicher sein.
//
// function pipe<A, B>(v: A, f1: (a: A) => B): B;
// function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;
// function pipe<A, B, C, D>(...): D;
// function pipe(value: unknown, ...fns: Function[]): unknown { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: curry() fuer 2 und 3 Parameter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere curry fuer Funktionen mit 2 Parametern:
// function curry2<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C

// TODO: Implementiere curry fuer Funktionen mit 3 Parametern:
// function curry3<A, B, C, D>(fn: (a: A, b: B, c: C) => D): (a: A) => (b: B) => (c: C) => D

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Generisches mapResult
// ═══════════════════════════════════════════════════════════════════════════

type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// TODO: Implementiere mapResult und flatMapResult:
// function mapResult<T, U, E>(result: Result<T, E>, fn: (v: T) => U): Result<U, E>
// function flatMapResult<T, U, E>(result: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E>

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: memoize() mit Generics
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere eine generische memoize-Funktion:
// - Akzeptiert eine Funktion mit beliebig vielen Argumenten
// - Cached Ergebnisse basierend auf JSON.stringify der Argumente
// - Gibt gecachte Ergebnisse zurueck wenn die Argumente gleich sind
//
// function memoize<Args extends unknown[], R>(
//   fn: (...args: Args) => R
// ): (...args: Args) => R

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: retry() HOF mit Generics
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere eine generische retry-Funktion:
// - Nimmt eine Funktion und die Anzahl der Versuche
// - Versucht die Funktion bis zu maxRetries Mal
// - Gibt das Ergebnis des ersten erfolgreichen Versuchs zurueck
// - Wirft den letzten Fehler wenn alle Versuche fehlschlagen
//
// function retry<T>(fn: () => T, maxRetries: number): T

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
//
// const piped = pipe(
//   "  Hello World  ",
//   (s) => s.trim(),
//   (s) => s.toUpperCase(),
//   (s) => s.split(" ")
// );
// console.log("Pipe:", piped); // ["HELLO", "WORLD"]
//
// const add = curry2((a: number, b: number) => a + b);
// console.log("Curry2:", add(3)(4)); // 7
//
// const add3 = curry3((a: number, b: number, c: number) => a + b + c);
// console.log("Curry3:", add3(1)(2)(3)); // 6
//
// const r: Result<string> = { ok: true, value: "42" };
// const mapped = mapResult(r, parseInt);
// console.log("MapResult:", mapped); // { ok: true, value: 42 }
//
// const cachedFn = memoize((x: number) => {
//   console.log("  Computing...");
//   return x * 2;
// });
// console.log("Memo 1:", cachedFn(5)); // Computing... 10
// console.log("Memo 2:", cachedFn(5)); // 10 (cached)
//
// let attempt = 0;
// const result = retry(() => {
//   attempt++;
//   if (attempt < 3) throw new Error("Not yet");
//   return "Success!";
// }, 5);
// console.log("Retry:", result); // "Success!"

console.log("Exercise 03 geladen. Ersetze die TODOs!");
