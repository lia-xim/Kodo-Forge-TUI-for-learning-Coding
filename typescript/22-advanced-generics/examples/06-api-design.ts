/**
 * Beispiel 06: Generische APIs designen
 *
 * Rule of Two, Overloads vs Generics, Inference lenken,
 * Default-Typparameter, Anti-Patterns.
 *
 * Ausfuehren: npx tsx examples/06-api-design.ts
 */

// ─── Rule of Two ────────────────────────────────────────────────────────

// ANTI-PATTERN: T nur einmal (korreliert nichts)
function logBad<T>(value: T): void {
  console.log(value);
}

// GUT: T durch unknown ersetzen
function logGood(value: unknown): void {
  console.log(value);
}

// GUT: T kommt 2x vor (Input → Output)
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

// GUT: T verbindet zwei Parameter
function merge<T extends object>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

console.log("=== Rule of Two ===");
console.log("firstElement([1,2,3]):", firstElement([1, 2, 3]));
console.log("merge:", merge({ name: "Max", age: 30 }, { age: 31 }));

// ─── Overloads vs Generics ──────────────────────────────────────────────

// Diskrete Mappings → Overloads
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number): string | number {
  if (typeof input === "string") return parseInt(input, 10);
  return String(input);
}

// Parametrische Beziehungen → Generics
function identity<T>(value: T): T {
  return value;
}

function wrapInArray<T>(value: T): T[] {
  return [value];
}

console.log("\n=== Overloads vs Generics ===");
console.log('parse("42"):', parse("42"));        // number: 42
console.log("parse(42):", parse(42));             // string: "42"
console.log("identity(true):", identity(true));    // boolean: true
console.log("wrapInArray(7):", wrapInArray(7));   // number[]: [7]

// ─── Inference lenken ───────────────────────────────────────────────────

// Problem: Inference-Konflikt
function createPairBad<T>(a: T, b: T): [T, T] {
  return [a, b];
}

// createPairBad("hello", 42); // ERROR: T kann nicht string UND number sein

// Loesung: Zwei Typparameter
function createPair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

console.log("\n=== Inference lenken ===");
console.log("createPair('hello', 42):", createPair("hello", 42));

// ─── Default-Typparameter ──────────────────────────────────────────────

function createBox<T = unknown>(value?: T): { value: T | undefined } {
  return { value };
}

// Inference hat Vorrang:
const box1 = createBox(42);          // T = number (inferiert)
const box2 = createBox("hello");     // T = string (inferiert)

// Default greift wenn keine Inference moeglich:
const box3 = createBox();            // T = unknown (Default)

// Explizit hat hoechste Prioritaet:
const box4 = createBox<number>(42);  // T = number (explizit)

console.log("\n=== Default-Typparameter ===");
console.log("Prioritaet: Explizit > Inference > Default");
console.log("createBox(42) → T = number (inferiert)");
console.log("createBox() → T = unknown (Default)");
console.log("createBox<number>(42) → T = number (explizit)");

// ─── Pipe-Funktion: Overloads + Generics kombiniert ────────────────────

function pipe<A, B>(value: A, fn1: (a: A) => B): B;
function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
function pipe<A, B, C, D>(
  value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D
): D;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}

console.log("\n=== Pipe-Funktion ===");
const result1 = pipe("42", s => parseInt(s, 10));
console.log("pipe('42', parseInt):", result1); // 42

const result2 = pipe(
  "42",
  s => parseInt(s, 10),
  n => n * 2,
);
console.log("pipe('42', parseInt, *2):", result2); // 84

const result3 = pipe(
  "42",
  s => parseInt(s, 10),
  n => n * 2,
  n => `Result: ${n}`,
);
console.log("pipe('42', parseInt, *2, format):", result3); // "Result: 84"

// ─── Anti-Patterns in der Praxis ────────────────────────────────────────

console.log("\n=== Anti-Patterns ===");

// Anti-Pattern 1: Generic mit sofortigem Cast (UNSICHER!)
function unsafeParse<T>(json: string): T {
  return JSON.parse(json) as T; // Kein Type Safety!
}
const parsed = unsafeParse<{ name: string }>('{"name": "Max"}');
console.log("unsafeParse (unsicher!):", parsed);
// Funktioniert zufaellig — aber keine Garantie!

// Anti-Pattern 2: T extends Union ohne Mehrwert
function formatBad<T extends string | number>(value: T): string {
  return String(value);
}
// Besser:
function formatGood(value: string | number): string {
  return String(value);
}

console.log("format('hello'):", formatGood("hello"));
console.log("format(42):", formatGood(42));

// ─── Design-Checkliste ─────────────────────────────────────────────────

console.log("\n=== Design-Checkliste ===");
console.log("1. Rule of Two: Typparameter mind. 2x verwenden");
console.log("2. Inference: Kann TS den Typ ableiten?");
console.log("3. Defaults: unknown statt any");
console.log("4. Constraints: So eng wie noetig");
console.log("5. Overloads vs Generics: Diskret vs parametrisch");
