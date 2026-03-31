/**
 * Type Testing Utilities
 *
 * Diese Utility-Typen werden in den Type-Challenge-Exercises verwendet.
 * Sie erlauben es, auf TYPE-LEVEL zu testen — d.h. der TypeScript-Compiler
 * selbst wird zum Testrunner. Wenn der Code kompiliert, sind alle Tests bestanden!
 *
 * Nutzung:
 *   import type { Expect, Equal, NotEqual } from '../../tools/type-test.ts';
 *
 *   type test1 = Expect<Equal<string, string>>;   // ✓ kompiliert
 *   type test2 = Expect<Equal<string, number>>;   // ✗ Compiler-Fehler!
 */

// Prüft ob zwei Typen exakt gleich sind (nicht nur assignable)
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
    ? true
    : false;

// Prüft ob zwei Typen NICHT gleich sind
export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;

// Erzwingt, dass T 'true' ist — sonst Compiler-Fehler
export type Expect<T extends true> = T;

// Erzwingt, dass T 'false' ist
export type ExpectFalse<T extends false> = T;

// Prüft ob A ein Subtyp von B ist (A extends B)
export type IsSubtype<A, B> = A extends B ? true : false;

// Prüft ob ein Typ 'any' ist
export type IsAny<T> = 0 extends 1 & T ? true : false;

// Prüft ob ein Typ 'never' ist
export type IsNever<T> = [T] extends [never] ? true : false;

// Prüft ob ein Typ 'unknown' ist
export type IsUnknown<T> =
  IsAny<T> extends true
    ? false
    : unknown extends T
      ? true
      : false;

/*
 * ─── Beispiel ────────────────────────────────────────────────────────────
 *
 * // Deine Lösung:
 * type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
 *
 * // Tests (kompiliert = bestanden!):
 * type test1 = Expect<Equal<MyPick<{ a: 1; b: 2 }, "a">, { a: 1 }>>;
 * type test2 = Expect<Equal<MyPick<{ a: 1; b: 2 }, "a" | "b">, { a: 1; b: 2 }>>;
 *
 * ─────────────────────────────────────────────────────────────────────────
 */
