/**
 * Lektion 13 - Example 01: Warum Generics?
 *
 * Ausfuehren mit: npx tsx examples/01-warum-generics.ts
 *
 * Das Problem (Duplikation vs. any) und die Loesung (Typparameter <T>).
 */

// ─── DAS PROBLEM: CODE-DUPLIKATION ─────────────────────────────────────────

// Ohne Generics: Eine Funktion pro Typ
function firstString(arr: string[]): string | undefined {
  return arr[0];
}

function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}

function firstBoolean(arr: boolean[]): boolean | undefined {
  return arr[0];
}

console.log("=== Code-Duplikation ===");
console.log(firstString(["hallo", "welt"]));  // "hallo"
console.log(firstNumber([1, 2, 3]));           // 1
console.log(firstBoolean([true, false]));      // true
// ^ Drei identische Funktionen — nur der Typ unterscheidet sich!

// ─── DAS PROBLEM: ANY ──────────────────────────────────────────────────────

function firstAny(arr: any[]): any {
  return arr[0];
}

console.log("\n=== any — keine Typsicherheit ===");
const result = firstAny(["hallo", "welt"]);
console.log(result.toUpperCase()); // Funktioniert zufaellig
// result.foo.bar.baz; // Wuerde zur Laufzeit crashen — kein Compile-Error!

// ─── DIE LOESUNG: GENERICS ─────────────────────────────────────────────────

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log("\n=== Generics — eine Funktion, volle Typsicherheit ===");

const s = first(["hallo", "welt"]);
console.log(`String: ${s}`);           // "hallo"
// s ist string | undefined — TypeScript weiss es!

const n = first([1, 2, 3]);
console.log(`Number: ${n}`);           // 1
// n ist number | undefined

const b = first([true, false]);
console.log(`Boolean: ${b}`);          // true
// b ist boolean | undefined

// Auch mit komplexen Typen:
interface User {
  name: string;
  age: number;
}

const users: User[] = [
  { name: "Max", age: 30 },
  { name: "Anna", age: 25 },
];

const firstUser = first(users);
console.log(`User: ${firstUser?.name}`); // "Max"
// firstUser ist User | undefined — volle IDE-Unterstuetzung!

// ─── TYPPARAMETER-ANALOGIE ─────────────────────────────────────────────────

console.log("\n=== Explizite vs. Inferierte Typparameter ===");

// Explizit: Du sagst TypeScript welcher Typ
const explicit = first<string>(["a", "b", "c"]);
console.log(`Explizit: ${explicit}`);

// Inferiert: TypeScript erkennt es selbst (bevorzugt!)
const inferred = first(["a", "b", "c"]);
console.log(`Inferiert: ${inferred}`);

// Beide sind identisch — Inference ist kuerzer und bevorzugt.

// ─── WARUM GENERICS UEBERALL SIND ──────────────────────────────────────────

console.log("\n=== Generics in der Standardbibliothek ===");

// Array<T>
const numbers: Array<number> = [1, 2, 3];
console.log(`Array<number>: ${numbers}`);

// Map<K, V>
const scores = new Map<string, number>();
scores.set("Max", 95);
scores.set("Anna", 87);
console.log(`Map<string, number>: Max = ${scores.get("Max")}`);

// Set<T>
const uniqueIds = new Set<number>([1, 2, 3, 2, 1]);
console.log(`Set<number>: ${[...uniqueIds]}`); // [1, 2, 3]

// Promise<T>
const greetPromise: Promise<string> = Promise.resolve("Hallo Welt");
greetPromise.then(msg => console.log(`Promise<string>: ${msg}`));
