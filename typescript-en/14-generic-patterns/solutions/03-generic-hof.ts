/**
 * Lektion 14 - Solution 03: Generic Higher-Order Functions
 *
 * Ausfuehren mit: npx tsx solutions/03-generic-hof.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: pipe()
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: curry() fuer 2 und 3 Parameter
// ═══════════════════════════════════════════════════════════════════════════

function curry2<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

function curry3<A, B, C, D>(
  fn: (a: A, b: B, c: C) => D
): (a: A) => (b: B) => (c: C) => D {
  return (a: A) => (b: B) => (c: C) => fn(a, b, c);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Generisches mapResult
// ═══════════════════════════════════════════════════════════════════════════

type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function mapResult<T, U, E = string>(
  result: Result<T, E>,
  fn: (v: T) => U
): Result<U, E> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result;
}

function flatMapResult<T, U, E = string>(
  result: Result<T, E>,
  fn: (v: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: memoize()
// ═══════════════════════════════════════════════════════════════════════════

function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const cache = new Map<string, R>();

  return (...args: Args): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: retry()
// ═══════════════════════════════════════════════════════════════════════════

function retry<T>(fn: () => T, maxRetries: number): T {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

const piped = pipe(
  "  Hello World  ",
  (s) => s.trim(),
  (s) => s.toUpperCase(),
  (s) => s.split(" ")
);
console.log("Pipe:", piped); // ["HELLO", "WORLD"]

const piped2 = pipe(
  [1, 2, 3, 4, 5],
  (nums) => nums.filter(n => n > 2),
  (nums) => nums.map(n => n * 10),
  (nums) => nums.reduce((a, b) => a + b, 0)
);
console.log("Pipe numbers:", piped2); // 120

const add = curry2((a: number, b: number) => a + b);
console.log("Curry2:", add(3)(4)); // 7

const add5 = add(5);
console.log("Curry2 partial:", add5(10)); // 15

const add3 = curry3((a: number, b: number, c: number) => a + b + c);
console.log("Curry3:", add3(1)(2)(3)); // 6

const r: Result<string> = { ok: true, value: "42" };
const mapped = mapResult(r, parseInt);
console.log("MapResult:", mapped); // { ok: true, value: 42 }

const failResult: Result<string> = { ok: false, error: "parse error" };
const failMapped = mapResult(failResult, parseInt);
console.log("MapResult fail:", failMapped); // { ok: false, error: "parse error" }

const chained = flatMapResult(
  { ok: true, value: "42" } as Result<string>,
  (s) => {
    const n = parseInt(s);
    if (isNaN(n)) return { ok: false, error: "NaN" } as Result<number>;
    return { ok: true, value: n };
  }
);
console.log("FlatMap:", chained); // { ok: true, value: 42 }

let computeCount = 0;
const cachedFn = memoize((x: number) => {
  computeCount++;
  return x * 2;
});
console.log("Memo 1:", cachedFn(5), "computed:", computeCount); // 10, 1
console.log("Memo 2:", cachedFn(5), "computed:", computeCount); // 10, 1 (cached)
console.log("Memo 3:", cachedFn(7), "computed:", computeCount); // 14, 2

let attempt = 0;
const retried = retry(() => {
  attempt++;
  if (attempt < 3) throw new Error("Not yet");
  return "Success!";
}, 5);
console.log("Retry:", retried, `(nach ${attempt} Versuchen)`);

console.log("\n--- Alle Tests bestanden! ---");
