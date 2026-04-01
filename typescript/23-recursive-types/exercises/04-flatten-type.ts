/**
 * Exercise 04: Flatten — Verschachtelte Arrays aufloesen
 *
 * Implementiere Flatten-Typen und eine flatten-Funktion.
 *
 * Ausfuehren: npx tsx exercises/04-flatten-type.ts
 * Hints: Siehe hints.json "exercises/04-flatten-type.ts"
 */

// TODO 1: Implementiere einen Flatten-Typ
// Entfernt ALLE Array-Ebenen (beliebig tief)
type DeepFlatten<T> = unknown; // ← Ersetze unknown

// TODO 2: Implementiere einen Flatten-Typ MIT Tiefen-Limit
// FlatN<number[][][], 1> = number[][]
// FlatN<number[][][], 2> = number[]
// FlatN<number[][][], 0> = number[][][] (unveraendert)
type FlatN<T, Depth extends number> = unknown; // ← Ersetze unknown

// Hilfstool (darfst du verwenden):
type MinusOne<N extends number> =
  [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N];

// TODO 3: Implementiere eine flatten-Funktion fuer Arrays
// Soll beliebig verschachtelte Arrays zu einem flachen Array machen
function deepFlatten<T>(arr: unknown[]): T[] {
  // TODO: Implementiere rekursives Flattening
  return [];
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log("=== Flatten Tests ===");

// Typ-Tests (hovere im Editor):
type Test1 = DeepFlatten<number[]>;         // number
type Test2 = DeepFlatten<string[][]>;       // string
type Test3 = DeepFlatten<boolean[][][]>;    // boolean

// FlatN Tests:
type TestN1 = FlatN<number[][][], 0>;  // number[][][]
type TestN2 = FlatN<number[][][], 1>;  // number[][]
type TestN3 = FlatN<number[][][], 2>;  // number[]
type TestN4 = FlatN<number[][][], 3>;  // number

// Runtime Tests:
const nested = [1, [2, 3], [4, [5, 6]], [[7, [8]]]];
const flat = deepFlatten<number>(nested);
console.log("Flattened:", flat);
// Erwartet: [1, 2, 3, 4, 5, 6, 7, 8]

const words = ["hello", ["world", ["deep"]]];
const flatWords = deepFlatten<string>(words);
console.log("Flat words:", flatWords);
// Erwartet: ["hello", "world", "deep"]
