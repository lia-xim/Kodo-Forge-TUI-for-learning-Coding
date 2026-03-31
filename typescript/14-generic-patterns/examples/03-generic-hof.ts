/**
 * Lektion 14 - Example 03: Generic Higher-Order Functions
 *
 * Ausfuehren mit: npx tsx examples/03-generic-hof.ts
 *
 * pipe(), compose(), generisches map/filter/reduce, Currying.
 */

// ─── PIPE ───────────────────────────────────────────────────────────────────

function pipe<A, B>(v: A, f1: (a: A) => B): B;
function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;
function pipe<A, B, C, D>(
  v: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D
): D;
function pipe<A, B, C, D, E>(
  v: A, f1: (a: A) => B, f2: (b: B) => C,
  f3: (c: C) => D, f4: (d: D) => E
): E;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((v, fn) => fn(v), value);
}

// Beispiel: String-Verarbeitung
const result1 = pipe(
  "  Hello, World!  ",
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/[^a-z ]/g, ""),
  (s) => s.split(" ")
);
console.log("Pipe result:", result1); // ["hello", "world"]

// Beispiel: Zahlen-Verarbeitung
const result2 = pipe(
  [3, 1, 4, 1, 5, 9, 2, 6],
  (nums) => nums.filter(n => n > 3),
  (nums) => nums.map(n => n * 10),
  (nums) => nums.reduce((a, b) => a + b, 0),
  (total) => `Summe: ${total}`
);
console.log("Pipe numbers:", result2); // "Summe: 240"

// ─── COMPOSE ────────────────────────────────────────────────────────────────

function compose<A, B>(f1: (a: A) => B): (a: A) => B;
function compose<A, B, C>(
  f2: (b: B) => C,
  f1: (a: A) => B
): (a: A) => C;
function compose<A, B, C, D>(
  f3: (c: C) => D,
  f2: (b: B) => C,
  f1: (a: A) => B
): (a: A) => D;
function compose(...fns: Function[]): Function {
  return (value: unknown) =>
    fns.reduceRight((v, fn) => fn(v), value);
}

// Wiederverwendbare Pipeline:
const processName = compose(
  (s: string) => `[${s}]`,
  (s: string) => s.toUpperCase(),
  (s: string) => s.trim()
);

console.log("\nCompose:", processName("  alice  ")); // "[ALICE]"

// Pipeline fuer Zahlenformatierung:
const formatPrice = compose(
  (s: string) => s + " EUR",
  (n: number) => n.toFixed(2),
  (n: number) => Math.round(n * 100) / 100
);

console.log("Price:", formatPrice(9.999)); // "10.00 EUR"

// ─── GENERISCHES MAP/FLATMAP ────────────────────────────────────────────────

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function err<E = Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

function mapResult<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) return { ok: true, value: fn(result.value) };
  return result;
}

function flatMap<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) return fn(result.value);
  return result;
}

// Verkettete Verarbeitung:
console.log("\nResult-Kette:");

function parseNumber(input: string): Result<number> {
  const n = parseFloat(input);
  if (isNaN(n)) return err(new Error(`'${input}' ist keine Zahl`));
  return ok(n);
}

function validatePositive(n: number): Result<number> {
  if (n <= 0) return err(new Error(`${n} ist nicht positiv`));
  return ok(n);
}

const parsed = flatMap(
  flatMap(ok("42.5"), parseNumber),
  validatePositive
);
const formatted = mapResult(parsed, n => `Wert: ${n.toFixed(1)}`);
console.log("  Erfolg:", formatted);

const failed = flatMap(
  flatMap(ok("-5"), parseNumber),
  validatePositive
);
console.log("  Fehler:", failed);

// ─── CURRYING ───────────────────────────────────────────────────────────────

function curry<A, B, C>(
  fn: (a: A, b: B) => C
): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

console.log("\nCurrying:");

const multiply = curry((a: number, b: number) => a * b);
const double = multiply(2);
const triple = multiply(3);

console.log("  double(5):", double(5));   // 10
console.log("  triple(5):", triple(5));   // 15

// Konfigurierbare Formatter:
const formatWith = curry(
  (prefix: string, value: string) => `[${prefix}] ${value}`
);

const logError = formatWith("ERROR");
const logInfo = formatWith("INFO");
const logDebug = formatWith("DEBUG");

console.log("  " + logError("Connection failed"));
console.log("  " + logInfo("Server started"));
console.log("  " + logDebug("Loading config"));

// ─── MEMOIZE MIT GENERICS ──────────────────────────────────────────────────

function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const cache = new Map<string, R>();

  return (...args: Args): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(`  [cache hit] ${key}`);
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

console.log("\nMemoize:");
const expensiveCalc = memoize((x: number, y: number) => {
  console.log(`  [computing] ${x} + ${y}`);
  return x + y;
});

console.log("  Result:", expensiveCalc(2, 3)); // [computing] -> 5
console.log("  Result:", expensiveCalc(2, 3)); // [cache hit] -> 5
console.log("  Result:", expensiveCalc(4, 5)); // [computing] -> 9

console.log("\n--- Alle HOF-Beispiele erfolgreich! ---");
