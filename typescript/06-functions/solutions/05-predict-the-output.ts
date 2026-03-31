/**
 * Lektion 06 - Solution 05: Predict the Output
 *
 * Ausfuehren mit: npx tsx solutions/05-predict-the-output.ts
 *
 * Alle Vorhersagen mit Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 1: Return-Typ-Inferenz
// ═══════════════════════════════════════════════════════════════════════════

function mystery1(x: number) {
  if (x > 0) return "positiv";
  if (x < 0) return "negativ";
  return 0;
}

// Antwort: TypeScript inferiert den Return-Typ als string | number
// (genauer: "positiv" | "negativ" | 0 — Literal Types!)
// Aber typeof gibt die Laufzeit-Typen:
console.log("--- Vorhersage 1 ---");
console.log(typeof mystery1(5));    // "string"
console.log(typeof mystery1(-5));   // "string"
console.log(typeof mystery1(0));    // "number"
// Erklaerung: TypeScript inferiert den Union aus allen moeglichen return-Werten.
// Da ein Pfad string und ein anderer number zurueckgibt, ist der Typ string | number.

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 2: void-Callback-Regel
// ═══════════════════════════════════════════════════════════════════════════

type DoWork = () => void;

const fn1: DoWork = () => 42;
const fn2: DoWork = () => "hallo";

console.log("\n--- Vorhersage 2 ---");
console.log(fn1());  // 42
console.log(fn2());  // "hallo"
// Erklaerung: void bei Callback-Typen ist TOLERANT — die Funktion darf
// einen Wert zurueckgeben, er wird einfach ignoriert vom Typsystem.
// Zur LAUFZEIT wird der Wert aber trotzdem zurueckgegeben!

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 3: Optionale vs Default-Parameter
// ═══════════════════════════════════════════════════════════════════════════

function greet(name: string, greeting: string = "Hallo") {
  return `${greeting}, ${name}!`;
}

console.log("\n--- Vorhersage 3 ---");
console.log(greet("Max"));              // "Hallo, Max!"
console.log(greet("Max", undefined));   // "Hallo, Max!"
// ^ undefined loest den Default-Wert aus!
console.log(greet("Max", ""));          // ", Max!"
// ^ Leerer String ist NICHT undefined — kein Default!
// Erklaerung: Default-Werte greifen nur bei undefined, nicht bei anderen
// falsy-Werten wie "" oder 0. Das ist anders als bei || ("Hallo" || greeting).

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 4: Overload-Auswahl
// ═══════════════════════════════════════════════════════════════════════════

function convert(value: string): number;
function convert(value: number): string;
function convert(value: string | number): string | number {
  if (typeof value === "string") return Number(value);
  return String(value);
}

console.log("\n--- Vorhersage 4 ---");
const a = convert("42");     // Typ: number, Wert: 42
const b = convert(42);       // Typ: string, Wert: "42"
console.log(`a: ${a} (typeof: ${typeof a})`);   // a: 42 (typeof: number)
console.log(`b: ${b} (typeof: ${typeof b})`);   // b: 42 (typeof: string)
// Erklaerung: Der erste Overload (string → number) matcht bei "42".
// Der zweite Overload (number → string) matcht bei 42.

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 5: Rest-Parameter und Spread
// ═══════════════════════════════════════════════════════════════════════════

function sum(...args: number[]): number {
  return args.reduce((a, b) => a + b, 0);
}

const zahlen = [1, 2, 3] as const;

console.log("\n--- Vorhersage 5 ---");
console.log(sum(...zahlen));        // 6
console.log(sum(10, ...zahlen));    // 16 (10 + 1 + 2 + 3)
// Erklaerung: as const macht zahlen zu readonly [1, 2, 3].
// readonly-Tuples sind mit number[] kompatibel als Spread-Argument.
// sum(10, ...zahlen) wird zu sum(10, 1, 2, 3).

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 6: Closures und Currying
// ═══════════════════════════════════════════════════════════════════════════

function createCounter(start: number) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

const counter = createCounter(10);

console.log("\n--- Vorhersage 6 ---");
counter.increment();   // count: 11
counter.increment();   // count: 12
counter.decrement();   // count: 11
console.log(counter.value());  // 11
// Erklaerung: Closures! Alle drei Funktionen teilen sich die gleiche
// count-Variable. increment → 11, increment → 12, decrement → 11.

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 7: Type Guard Verhalten
// ═══════════════════════════════════════════════════════════════════════════

function isString(value: unknown): value is string {
  return typeof value === "string";
}

const werte: unknown[] = [1, "zwei", 3, "vier", true];

console.log("\n--- Vorhersage 7 ---");
const filtered = werte.filter(isString);
console.log(filtered);        // ["zwei", "vier"]
// Typ von filtered: string[]
// Erklaerung: Array.filter mit einem Type Guard als Predicate
// bewirkt, dass TypeScript den Ergebnis-Typ narrowt.
// Statt unknown[] ist das Ergebnis string[].

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 8: this in verschiedenen Kontexten
// ═══════════════════════════════════════════════════════════════════════════

const obj = {
  name: "TypeScript",
  greet: function () {
    return `Hallo von ${this.name}`;
  },
  greetArrow: () => {
    // @ts-ignore
    return `Hallo von ${(globalThis as Record<string, unknown>).name ?? "nirgendwo"}`;
  },
};

console.log("\n--- Vorhersage 8 ---");
console.log(obj.greet());        // "Hallo von TypeScript"
console.log(obj.greetArrow());   // "Hallo von nirgendwo"
// Erklaerung: Die regulaere Funktion (greet) bindet this an das Objekt.
// Die Arrow Function (greetArrow) erbt this vom umgebenden Scope —
// und im Modul-Scope gibt es kein "name" auf globalThis.
// Arrow Functions in Objekt-Literalen sind fast nie gewollt!

console.log("\nAlle Vorhersagen durchgegangen!");
