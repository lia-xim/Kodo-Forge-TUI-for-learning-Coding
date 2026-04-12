/**
 * Lektion 06 - Exercise 05: Predict the Output
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-predict-the-output.ts
 *
 * 8 Code-Schnipsel. Sage voraus was passiert:
 * - Was gibt der Code aus?
 * - Gibt es einen Compile-Error?
 * - Welchen Typ hat die Variable?
 *
 * Schreibe deine Vorhersage in den Kommentar, dann entkommentiere und pruefe.
 */

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 1: Return-Typ-Inferenz
// ═══════════════════════════════════════════════════════════════════════════

function mystery1(x: number) {
  if (x > 0) return "positiv";
  if (x < 0) return "negativ";
  return 0;
}

// TODO: Welchen Return-Typ inferiert TypeScript?
// Deine Vorhersage: ???

// console.log(typeof mystery1(5));    // ???
// console.log(typeof mystery1(-5));   // ???
// console.log(typeof mystery1(0));    // ???

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 2: void-Callback-Regel
// ═══════════════════════════════════════════════════════════════════════════

type DoWork = () => void;

const fn1: DoWork = () => 42;
const fn2: DoWork = () => "hallo";

// TODO: Was geben diese Aufrufe zurueck?
// Deine Vorhersage: ???

// console.log(fn1());  // ???
// console.log(fn2());  // ???

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 3: Optionale vs Default-Parameter
// ═══════════════════════════════════════════════════════════════════════════

function greet(name: string, greeting: string = "Hallo") {
  return `${greeting}, ${name}!`;
}

// TODO: Was ist das Ergebnis?
// Deine Vorhersage: ???

// console.log(greet("Max"));              // ???
// console.log(greet("Max", undefined));   // ???
// console.log(greet("Max", ""));          // ???

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 4: Overload-Auswahl
// ═══════════════════════════════════════════════════════════════════════════

function convert(value: string): number;
function convert(value: number): string;
function convert(value: string | number): string | number {
  if (typeof value === "string") return Number(value);
  return String(value);
}

// TODO: Welche Typen haben die Variablen?
// Deine Vorhersage: ???

// const a = convert("42");     // Typ: ???, Wert: ???
// const b = convert(42);       // Typ: ???, Wert: ???

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 5: Rest-Parameter und Spread
// ═══════════════════════════════════════════════════════════════════════════

function sum(...args: number[]): number {
  return args.reduce((a, b) => a + b, 0);
}

const zahlen = [1, 2, 3] as const;

// TODO: Was passiert hier?
// Deine Vorhersage: ???

// console.log(sum(...zahlen));        // ???
// console.log(sum(10, ...zahlen));    // ???

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

// TODO: Was ist das Ergebnis?
// Deine Vorhersage: ???

// counter.increment();
// counter.increment();
// counter.decrement();
// console.log(counter.value());  // ???

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 7: Type Guard Verhalten
// ═══════════════════════════════════════════════════════════════════════════

function isString(value: unknown): value is string {
  return typeof value === "string";
}

const werte: unknown[] = [1, "zwei", 3, "vier", true];

// TODO: Was ist das Ergebnis und welchen Typ hat filtered?
// Deine Vorhersage: ???

// const filtered = werte.filter(isString);
// console.log(filtered);        // ???
// // Typ von filtered: ???

// ═══════════════════════════════════════════════════════════════════════════
// VORHERSAGE 8: this in verschiedenen Kontexten
// ═══════════════════════════════════════════════════════════════════════════

const obj = {
  name: "TypeScript",
  greet: function () {
    return `Hallo von ${this.name}`;
  },
  greetArrow: () => {
    // @ts-ignore — this ist hier nicht obj!
    return `Hallo von ${(globalThis as Record<string, unknown>).name ?? "nirgendwo"}`;
  },
};

// TODO: Was ist das Ergebnis?
// Deine Vorhersage: ???

// console.log(obj.greet());        // ???
// console.log(obj.greetArrow());   // ???
