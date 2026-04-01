/**
 * Beispiel 01: Grenzen einfacher Generics
 *
 * Zeigt wo einfache Generics an ihre Grenzen stossen
 * und warum man Advanced Generics braucht.
 *
 * Ausfuehren: npx tsx examples/01-generics-grenzen.ts
 */

// ─── Einfache Generics (funktioniert) ──────────────────────────────────────

function identity<T>(value: T): T {
  return value;
}

function wrapInArray<T>(value: T): T[] {
  return [value];
}

console.log("=== Einfache Generics ===");
console.log(identity("hello"));      // "hello" — T = string
console.log(identity(42));           // 42 — T = number
console.log(wrapInArray(true));      // [true] — T = boolean

// ─── Die Grenze: "Irgendein Container" ────────────────────────────────────

// Wir wollen eine Funktion die mit VERSCHIEDENEN Container-Typen arbeitet:
// - Array<T>
// - Set<T>
// - Map<K, V>

// Versuch 1: Konkreter Typ — nicht generisch genug
function mapOverArray<T, U>(arr: T[], fn: (x: T) => U): U[] {
  return arr.map(fn);
}

// Versuch 2: Union — skaliert nicht
function getFirstElement(container: unknown[] | Set<unknown>): unknown {
  if (Array.isArray(container)) return container[0];
  return container.values().next().value;
}

console.log("\n=== Grenzen ===");
console.log(mapOverArray([1, 2, 3], x => x * 2)); // [2, 4, 6]
console.log(getFirstElement([10, 20, 30]));        // 10 — aber Typ ist unknown!

// ─── Das eigentliche Problem ──────────────────────────────────────────────

// Was wir WOLLEN aber NICHT schreiben koennen:
//
// type Apply<F, A> = F<A>;  // ERROR: F ist nicht generisch
//
// function mapAny<F, A, B>(container: F<A>, fn: (a: A) => B): F<B>;
// ERROR: F ist ein konkreter Typ, kein Type Constructor!

// ─── Workaround: Conditional Type Dispatch ─────────────────────────────────

type Unwrap<T> =
  T extends Array<infer U> ? U :
  T extends Set<infer U> ? U :
  T extends Promise<infer U> ? U :
  T;

type A = Unwrap<string[]>;          // string
type B = Unwrap<Set<number>>;       // number
type C = Unwrap<Promise<boolean>>;  // boolean
type D = Unwrap<string>;            // string (kein Container)

console.log("\n=== Conditional Type Dispatch ===");
console.log("Unwrap<string[]> = string");
console.log("Unwrap<Set<number>> = number");
console.log("Unwrap<Promise<boolean>> = boolean");

// ─── Fazit ────────────────────────────────────────────────────────────────

console.log("\n=== Fazit ===");
console.log("Einfache Generics: gut fuer identity, wrap, map ueber EINEN Typ.");
console.log("Advanced Generics: noetig fuer 'irgendein Container', Varianz, APIs.");
console.log("In Sektion 02 lernen wir Higher-Order Types als Loesung.");
