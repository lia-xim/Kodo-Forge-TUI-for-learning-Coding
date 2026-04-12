/**
 * Lektion 13 - Example 02: Generische Funktionen
 *
 * Ausfuehren mit: npx tsx examples/02-generische-funktionen.ts
 *
 * Syntax, Inference, mehrere Typparameter, Arrow Functions.
 */

// ─── GRUNDSYNTAX ────────────────────────────────────────────────────────────

function identity<T>(arg: T): T {
  return arg;
}

console.log("=== identity<T> ===");
console.log(identity("hallo"));    // T = string (inferiert)
console.log(identity(42));          // T = number (inferiert)
console.log(identity(true));        // T = boolean (inferiert)

// ─── INFERENCE BEI FUNKTIONSAUFRUFEN ────────────────────────────────────────

function wrap<T>(value: T): { wrapped: T } {
  return { wrapped: value };
}

console.log("\n=== Type Inference ===");

const w1 = wrap("hallo");
console.log(w1); // { wrapped: "hallo" } — Typ: { wrapped: string }

const w2 = wrap(42);
console.log(w2); // { wrapped: 42 } — Typ: { wrapped: number }

const w3 = wrap({ name: "Max", age: 30 });
console.log(w3); // { wrapped: { name: "Max", age: 30 } }
// ^ Typ: { wrapped: { name: string; age: number } }

// ─── MEHRERE TYPPARAMETER ───────────────────────────────────────────────────

function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

console.log("\n=== Mehrere Typparameter ===");
console.log(pair("Max", 30));         // ["Max", 30] — [string, number]
console.log(pair(true, [1, 2, 3]));   // [true, [1,2,3]] — [boolean, number[]]

// ─── MAP-FUNKTION — KLASSISCHES GENERICS-BEISPIEL ───────────────────────────

function myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}

console.log("\n=== Generische map-Funktion ===");

const numbers = [1, 2, 3, 4, 5];

// T = number, U = string
const strings = myMap(numbers, n => `Nummer ${n}`);
console.log(strings); // ["Nummer 1", "Nummer 2", ...]

// T = string, U = number
const names = ["Max", "Anna", "Bob"];
const lengths = myMap(names, name => name.length);
console.log(lengths); // [3, 4, 3]

// T = number, U = { value: number; squared: number }
const enriched = myMap(numbers, n => ({ value: n, squared: n * n }));
console.log(enriched);

// ─── ARROW FUNCTIONS MIT GENERICS ───────────────────────────────────────────

console.log("\n=== Arrow Functions ===");

const toArray = <T>(value: T): T[] => [value];
console.log(toArray("hallo"));  // ["hallo"]
console.log(toArray(42));        // [42]

const swap = <T, U>(tuple: [T, U]): [U, T] => [tuple[1], tuple[0]];
console.log(swap(["hallo", 42]));  // [42, "hallo"]
console.log(swap([true, "ja"]));   // ["ja", true]

// ─── WANN EXPLIZITE TYPANGABE NOETIG IST ────────────────────────────────────

console.log("\n=== Explizite Typangabe ===");

// Fall 1: Kein Argument aus dem T inferiert werden kann
function createArray<T>(): T[] {
  return [];
}

// const bad = createArray(); // T unbekannt!
const good = createArray<string>(); // T = string — explizit
console.log(`Leeres string-Array: [${good}]`);

// Fall 2: Gewuenschter Typ breiter als inferiert
function parseInput<T>(input: string): T {
  return JSON.parse(input) as T;
}

interface Config {
  debug: boolean;
  port: number;
}

const config = parseInput<Config>('{"debug":true,"port":3000}');
console.log(`Config: debug=${config.debug}, port=${config.port}`);

// ─── FILTER MIT TYPE PREDICATE ──────────────────────────────────────────────

console.log("\n=== Generischer Filter ===");

function filterDefined<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item != null);
}

const mixed = ["Max", null, "Anna", undefined, "Bob"];
const clean = filterDefined(mixed);
console.log(clean); // ["Max", "Anna", "Bob"] — Typ: string[]
