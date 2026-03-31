/**
 * Lektion 13 - Loesung 01: Erste generische Funktionen
 */

// ═══ AUFGABE 1: identity ═══════════════════════════════════════════════════

function identity<T>(arg: T): T {
  return arg;
}

const s = identity("hallo"); // string
const n = identity(42);       // number
console.log(`identity("hallo") = ${s}`);
console.log(`identity(42) = ${n}`);

// ═══ AUFGABE 2: last ═══════════════════════════════════════════════════════

function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

console.log(last([1, 2, 3]));          // 3
console.log(last(["a", "b", "c"]));    // "c"
console.log(last([]));                  // undefined

// ═══ AUFGABE 3: wrap ═══════════════════════════════════════════════════════

function wrap<T>(value: T): { value: T } {
  return { value };
}

const w1 = wrap("hallo");  // { value: string }
const w2 = wrap(42);        // { value: number }
console.log(w1); // { value: "hallo" }
console.log(w2); // { value: 42 }

// ═══ AUFGABE 4: makePair ═══════════════════════════════════════════════════

function makePair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p = makePair("Max", 30); // [string, number]
console.log(p); // ["Max", 30]

// ═══ AUFGABE 5: filterDefined ══════════════════════════════════════════════

function filterDefined<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item != null);
}

const mixed = ["Max", null, "Anna", undefined, "Bob"];
const clean = filterDefined(mixed); // string[]
console.log(clean); // ["Max", "Anna", "Bob"]
