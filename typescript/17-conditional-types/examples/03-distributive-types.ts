/**
 * Lektion 17 - Beispiel 03: Distributive Types
 * Ausfuehren mit: npx tsx examples/03-distributive-types.ts
 */

// ─── Distribution in Aktion ───────────────────────────────────────────────

type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string>;           // string[]
type B = ToArray<string | number>;  // string[] | number[]

// ─── Nicht-distributiv mit [T] ────────────────────────────────────────────

type ToArrayND<T> = [T] extends [any] ? T[] : never;

type C = ToArrayND<string | number>;  // (string | number)[]

// ─── Extract und Exclude ──────────────────────────────────────────────────

type Animals = "cat" | "dog" | "fish" | "bird";

type Pets = Extract<Animals, "cat" | "dog">;           // "cat" | "dog"
type WildAnimals = Exclude<Animals, "cat" | "dog">;    // "fish" | "bird"

// ─── never-Sonderregel ───────────────────────────────────────────────────

type IsString<T> = T extends string ? true : false;

type D = IsString<never>;  // never (NICHT false!)

// never erkennen:
type IsNever<T> = [T] extends [never] ? true : false;

type E = IsNever<never>;   // true
type F = IsNever<string>;  // false

// ─── Praxis: Union filtern ────────────────────────────────────────────────

type OnlyFunctions<T> = T extends Function ? T : never;

type Mixed = string | number | (() => void) | ((x: number) => string);
type Fns = OnlyFunctions<Mixed>;
// (() => void) | ((x: number) => string)

console.log("Distributive Types loaded. Check types in your editor!");
