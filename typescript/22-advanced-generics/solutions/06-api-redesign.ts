/**
 * Loesung 06: API Redesign
 *
 * Ausfuehren: npx tsx solutions/06-api-redesign.ts
 */

// ─── TODO 1: formatValue — Generic durch Union ersetzt ──────────────────
// T kommt nur einmal vor → Generic ist ueberfluessig

function formatValueFixed(value: string | number): string {
  return `Formatted: ${String(value)}`;
}

console.log("=== formatValue (Union statt Generic) ===");
console.log(formatValueFixed("hello")); // "Formatted: hello"
console.log(formatValueFixed(42));       // "Formatted: 42"

// ─── TODO 2: logItem — Generic durch unknown ersetzt ────────────────────
// T kommt nur einmal vor → unknown ist sicherer und einfacher

function logItemFixed(item: unknown): void {
  console.log(`[LOG] ${item}`);
}

console.log("\n=== logItem (unknown statt Generic) ===");
logItemFixed("Test message");
logItemFixed(42);
logItemFixed({ key: "value" });

// ─── TODO 3: convert — Overloads statt Conditional Return ───────────────
// Diskrete Mappings: string→number, number→string

function convertFixed(input: string): number;
function convertFixed(input: number): string;
function convertFixed(input: string | number): string | number {
  if (typeof input === "string") return parseInt(input, 10);
  return String(input);
}

console.log("\n=== convert (Overloads) ===");
const num: number = convertFixed("42");  // 42 — Typ ist number!
const str: string = convertFixed(42);    // "42" — Typ ist string!
console.log("convertFixed('42'):", num);
console.log("convertFixed(42):", str);

// ─── TODO 4: createStore — unknown statt any ────────────────────────────

function createStoreFixed<T = unknown>(initialValue: T): {
  get(): T;
  set(v: T): void;
} {
  let value = initialValue;
  return {
    get() { return value; },
    set(v: T) { value = v; },
  };
}

console.log("\n=== createStore (unknown statt any) ===");
const store = createStoreFixed(42); // T = number (inferiert)
console.log("store.get():", store.get()); // 42
store.set(100);
console.log("store.get():", store.get()); // 100

// store.set("hello"); // ERROR: string ist kein number

// Mit Default (kein Argument → T = unknown):
const emptyStore = createStoreFixed(undefined);
console.log("emptyStore.get():", emptyStore.get()); // undefined

// ─── TODO 5: transformData ist GUT — Erklaerung ────────────────────────
// A kommt 2x vor: input (Parameter) und step1 Parameter
// B kommt 3x vor: step1 Return, step2 Parameter
// C kommt 2x vor: step2 Return, Funktions-Return
// → Alle 3 Typparameter korrelieren echte Beziehungen!

function transformData<A, B, C>(
  input: A,
  step1: (a: A) => B,
  step2: (b: B) => C
): C {
  return step2(step1(input));
}

console.log("\n=== transformData (behalten — gutes Generic!) ===");
const result = transformData(
  "42",
  s => parseInt(s, 10),   // A=string → B=number
  n => n > 0,             // B=number → C=boolean
);
console.log("transformData('42', parseInt, >0):", result); // true

// ─── TODO 6: pipe-Funktion mit Overloads + Generics ────────────────────

function pipe<A, B>(value: A, fn1: (a: A) => B): B;
function pipe<A, B, C>(
  value: A, fn1: (a: A) => B, fn2: (b: B) => C
): C;
function pipe<A, B, C, D>(
  value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D
): D;
function pipe<A, B, C, D, E>(
  value: A, fn1: (a: A) => B, fn2: (b: B) => C,
  fn3: (c: C) => D, fn4: (d: D) => E
): E;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}

console.log("\n=== pipe-Funktion ===");

const r1 = pipe("42", s => parseInt(s, 10));
console.log("pipe 1 step:", r1); // 42

const r2 = pipe("42", s => parseInt(s, 10), n => n * 2);
console.log("pipe 2 steps:", r2); // 84

const r3 = pipe(
  "  Hello World  ",
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.split(" "),
);
console.log("pipe 3 steps:", r3); // ["hello", "world"]

const r4 = pipe(
  [3, 1, 4, 1, 5],
  arr => arr.sort((a, b) => a - b),
  arr => arr.filter(x => x > 2),
  arr => arr.map(x => x * 10),
  arr => arr.join(", "),
);
console.log("pipe 4 steps:", r4); // "30, 40, 50"

// ─── Design-Zusammenfassung ────────────────────────────────────────────

console.log("\n=== Design-Zusammenfassung ===");
console.log("formatValue: Generic → Union (T nur 1x)");
console.log("logItem: Generic → unknown (T nur 1x)");
console.log("convert: Conditional-Return → Overloads (diskrete Faelle)");
console.log("createStore: any → unknown Default (sicherer)");
console.log("transformData: BEHALTEN (alle T-Parameter korrelieren)");
console.log("pipe: Overloads + Generics kombiniert (bestes aus beiden Welten)");
