/**
 * Example 05: Rekursionslimits und Tail Recursion Optimization
 *
 * Ausfuehren: npx tsx examples/05-recursion-limits.ts
 */

// ─── Einfacher Zaehler (Tail-Recursive) ─────────────────────────────────────

type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc
    : BuildTuple<N, [...Acc, unknown]>;

// Tail Recursion → funktioniert bis ~999
type Ten = BuildTuple<10>;
type Fifty = BuildTuple<50>;

// ─── Type-Level Arithmetik ──────────────────────────────────────────────────

type Length<T extends unknown[]> = T["length"];

type Add<A extends number, B extends number> =
  Length<[...BuildTuple<A>, ...BuildTuple<B>]>;

type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
    ? Rest["length"]
    : never;

// Tests:
type Sum = Add<3, 4>;        // 7
type Diff = Subtract<10, 3>; // 7

// ─── Flatten mit Tiefen-Limit ───────────────────────────────────────────────

type MinusOne<N extends number> =
  [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N];

type FlatArray<Arr, Depth extends number> =
  Depth extends 0
    ? Arr
    : Arr extends readonly (infer Inner)[]
      ? FlatArray<Inner, MinusOne<Depth>>
      : Arr;

// Tests:
type Nested = number[][][];
type Flat1 = FlatArray<Nested, 1>; // number[][]
type Flat2 = FlatArray<Nested, 2>; // number[]
type Flat3 = FlatArray<Nested, 3>; // number

// ─── Performance-Demonstration ──────────────────────────────────────────────

// GUTES Pattern: Mapped Type + Rekursion (linear)
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// SCHLECHTES Pattern: Distributive Conditional + Rekursion (exponentiell)
// AUSKOMMENTIERT weil es den Compiler verlangsamen kann:
// type BadDeep<T> = T extends object
//   ? { [K in keyof T]?: BadDeep<T[K]> }
//   : T;

// ─── Tail vs Non-Tail Recursion ─────────────────────────────────────────────

// Tail-Recursive: Rekursiver Aufruf ist die letzte Operation
type TailCount<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc["length"]
    : TailCount<N, [...Acc, unknown]>;
// ^ In Tail Position → TS optimiert → bis ~999

// NICHT Tail-Recursive: Rekursiver Aufruf ist in einem Wrapper
// type NonTailCount<N extends number, Acc extends unknown[] = []> =
//   Acc["length"] extends N
//     ? Acc["length"]
//     : [NonTailCount<N, [...Acc, unknown]>][0];
// ^ In Tuple-Index → NICHT Tail Position → bricht bei ~50 ab

// ─── Demonstration ──────────────────────────────────────────────────────────

// Diese Typen funktionieren dank Tail Recursion:
type Count100 = TailCount<100>;  // 100
type Count500 = TailCount<500>;  // 500

console.log("=== Rekursionslimits Demo ===");
console.log("Add<3,4> =", 3 + 4, "(Type-Level: 7)");
console.log("Subtract<10,3> =", 10 - 3, "(Type-Level: 7)");
console.log("Tail Recursion erlaubt bis ~999 Ebenen");
console.log("Ohne Tail Recursion: Limit bei ~50 Ebenen");

// ─── Praktischer Tipp: Rekursionstiefe begrenzen ────────────────────────────

// Wenn du einen rekursiven Typ schreibst, baue ein Tiefenlimit ein:
type SafeDeepPartial<T, Depth extends number = 10> = Depth extends 0
  ? T // Abbruch: Keine weitere Rekursion
  : {
      [K in keyof T]?: T[K] extends object
        ? SafeDeepPartial<T[K], MinusOne<Depth>>
        : T[K];
    };

// Funktioniert sicher fuer beliebig tiefe Objekte:
type DeepNested = {
  a: { b: { c: { d: { e: { f: { g: string } } } } } };
};

type Safe = SafeDeepPartial<DeepNested>; // OK
console.log("SafeDeepPartial mit Tiefenlimit = sicher");
