/**
 * Solution 04: Flatten — Verschachtelte Arrays aufloesen
 */

// Loesung 1: DeepFlatten — Entfernt alle Array-Ebenen
type DeepFlatten<T> = T extends (infer U)[]
  ? DeepFlatten<U>
  : T;

// Loesung 2: FlatN — Flatten mit Tiefen-Limit
type MinusOne<N extends number> =
  [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N];

type FlatN<T, Depth extends number> =
  Depth extends 0
    ? T
    : T extends readonly (infer Inner)[]
      ? FlatN<Inner, MinusOne<Depth>>
      : T;

// Loesung 3: Runtime flatten
function deepFlatten<T>(arr: unknown[]): T[] {
  const result: T[] = [];

  function flatten(items: unknown[]): void {
    for (const item of items) {
      if (Array.isArray(item)) {
        flatten(item);
      } else {
        result.push(item as T);
      }
    }
  }

  flatten(arr);
  return result;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log("=== Flatten Tests ===");

// Typ-Tests:
type Test1 = DeepFlatten<number[]>;         // number
type Test2 = DeepFlatten<string[][]>;       // string
type Test3 = DeepFlatten<boolean[][][]>;    // boolean

type TestN1 = FlatN<number[][][], 0>;  // number[][][]
type TestN2 = FlatN<number[][][], 1>;  // number[][]
type TestN3 = FlatN<number[][][], 2>;  // number[]
type TestN4 = FlatN<number[][][], 3>;  // number

// Runtime-Tests:
const nested = [1, [2, 3], [4, [5, 6]], [[7, [8]]]];
const flat = deepFlatten<number>(nested);
console.log("Flattened:", flat);
// → [1, 2, 3, 4, 5, 6, 7, 8]

const words = ["hello", ["world", ["deep"]]];
const flatWords = deepFlatten<string>(words);
console.log("Flat words:", flatWords);
// → ["hello", "world", "deep"]
