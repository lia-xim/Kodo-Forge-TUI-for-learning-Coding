/**
 * Lektion 17 - Beispiel 01: Extends-Bedingung
 * Ausfuehren mit: npx tsx examples/01-extends-bedingung.ts
 */

// ─── Grundsyntax ──────────────────────────────────────────────────────────

type IsString<T> = T extends string ? true : false;

type A = IsString<string>;    // true
type B = IsString<number>;    // false
type C = IsString<"hello">;   // true

// ─── Verschachtelte Conditionals ──────────────────────────────────────────

type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends null ? "null" :
  T extends Function ? "function" :
  "object";

type T1 = TypeName<string>;        // "string"
type T2 = TypeName<42>;            // "number"
type T3 = TypeName<true>;          // "boolean"
type T4 = TypeName<() => void>;    // "function"
type T5 = TypeName<{ x: 1 }>;     // "object"

// ─── Praxis: NonNullable nachbauen ────────────────────────────────────────

type MyNonNullable<T> = T extends null | undefined ? never : T;

type Clean = MyNonNullable<string | null | undefined>;
// string (null und undefined werden durch never entfernt)

console.log("Conditional Type Examples loaded.");
console.log("Tipp: Hover ueber die Type-Aliases in deinem Editor!");
