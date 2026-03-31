/**
 * LEKTION 03 - Loesung 2: Inference Vorhersagen
 *
 * Hier sind die korrekten Typen mit Erklaerungen.
 * Jede Loesung erklaert, WARUM TypeScript diesen Typ infert.
 *
 * Pruefen: npx tsc --noEmit
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

// ============================================================================
// GRUNDLAGEN (Aufgaben 1-5)
// ============================================================================

// ── AUFGABE 1: const Primitive ──────────────────────────────────────────────
// LOESUNG: "Hallo Welt" (Literal-Typ)
// WARUM: const-Variable mit String-Literal --> Literal-Typ bleibt erhalten
//        (kein Widening bei const Primitives)
// ─────────────────────────────────────────────────────────────────────────────

const greeting = "Hallo Welt";

type Test_1 = Expect<Equal<typeof greeting, "Hallo Welt">>;

// ── AUFGABE 2: let Primitive ────────────────────────────────────────────────
// LOESUNG: number
// WARUM: let-Variable --> Widening! 42 wird zu number erweitert,
//        weil die Variable spaeter andere Zahlen annehmen koennte.
// ─────────────────────────────────────────────────────────────────────────────

let counter = 42;

type Test_2 = Expect<Equal<typeof counter, number>>;

// ── AUFGABE 3: Mixed Array ──────────────────────────────────────────────────
// LOESUNG: (string | number | boolean)[]
// WARUM: TS bildet den "Best Common Type" -- den engsten Typ, der alle
//        Elemente umfasst. Das ist die Union aller Element-Typen.
// ─────────────────────────────────────────────────────────────────────────────

const items = [1, "hello", true];

type Test_3 = Expect<Equal<typeof items, (string | number | boolean)[]>>;

// ── AUFGABE 4: Object Literal ───────────────────────────────────────────────
// LOESUNG: { host: string; port: number; debug: boolean }
// WARUM: const schuetzt nur die Variable vor Neuzuweisung, nicht die
//        Properties. Deshalb werden Property-Typen geweitert:
//        "localhost" -> string, 3000 -> number, false -> boolean
// ─────────────────────────────────────────────────────────────────────────────

const config = {
  host: "localhost",
  port: 3000,
  debug: false,
};

type Test_4 = Expect<Equal<typeof config, {
  host: string;
  port: number;
  debug: boolean;
}>>;

// ── AUFGABE 5: Funktions-Return ─────────────────────────────────────────────
// LOESUNG: { first: number; second: string }
// WARUM: TS analysiert den return-Ausdruck. { first: a, second: b }
//        mit a: number und b: string ergibt diesen Objekttyp.
//        Die Property-Werte werden geweitert (wie bei Objekt-Literalen).
// ─────────────────────────────────────────────────────────────────────────────

function createPair(a: number, b: string) {
  return { first: a, second: b };
}

const pair = createPair(1, "hello");

type Test_5 = Expect<Equal<typeof pair, { first: number; second: string }>>;

// ============================================================================
// INTERMEDIATE (Aufgaben 6-10)
// ============================================================================

// ── AUFGABE 6: Conditional Return ───────────────────────────────────────────
// LOESUNG: string | null
// WARUM: Die Funktion hat zwei moegliche return-Pfade:
//        1. value.toString() --> string
//        2. null --> null
//        TS bildet die Union: string | null
// ─────────────────────────────────────────────────────────────────────────────

function maybeString(value: number) {
  if (value > 0) {
    return value.toString();
  }
  return null;
}

const result6 = maybeString(5);

type Test_6 = Expect<Equal<typeof result6, string | null>>;

// ── AUFGABE 7: Array.map() ─────────────────────────────────────────────────
// LOESUNG: number[]
// WARUM: names ist string[], .map() gibt ein Array zurueck.
//        name.length gibt number zurueck, also ist das Ergebnis number[].
// ─────────────────────────────────────────────────────────────────────────────

const names = ["Alice", "Bob", "Clara"];
const lengths = names.map(name => name.length);

type Test_7 = Expect<Equal<typeof lengths, number[]>>;

// ── AUFGABE 8: as const auf Array ──────────────────────────────────────────
// LOESUNG: readonly ["north", "south", "east", "west"]
// WARUM: `as const` macht das Array zu einem readonly Tuple mit
//        Literal-Typen. Jedes Element behaelt seinen exakten Wert als Typ.
// ─────────────────────────────────────────────────────────────────────────────

const directions = ["north", "south", "east", "west"] as const;

type Test_8 = Expect<Equal<typeof directions, readonly ["north", "south", "east", "west"]>>;

// ── AUFGABE 9: as const auf Objekt ─────────────────────────────────────────
// LOESUNG: { readonly theme: "dark"; readonly fontSize: 14 }
// WARUM: `as const` macht alle Properties readonly UND behaelt die
//        Literal-Typen ("dark" statt string, 14 statt number).
// ─────────────────────────────────────────────────────────────────────────────

const settings = {
  theme: "dark",
  fontSize: 14,
} as const;

type Test_9 = Expect<Equal<typeof settings, {
  readonly theme: "dark";
  readonly fontSize: 14;
}>>;

// ── AUFGABE 10: Ternary mit const ──────────────────────────────────────────
// LOESUNG: "yes" | 42
// WARUM: Bei einem Ternary-Ausdruck bildet TS die Union beider Zweige.
//        Da das Ergebnis in einer const-Variable gespeichert wird,
//        bleiben die Literal-Typen erhalten: "yes" | 42.
//        TS wertet den Ternary NICHT zur Compile-Zeit aus (obwohl flag
//        const true ist), sondern behaelt beide moeglichen Ergebnisse.
// ─────────────────────────────────────────────────────────────────────────────

const flag = true;
const value10 = flag ? "yes" : 42;

type Test_10 = Expect<Equal<typeof value10, "yes" | 42>>;

// ============================================================================
// FORTGESCHRITTEN (Aufgaben 11-15)
// ============================================================================

// ── AUFGABE 11: Object.keys() ──────────────────────────────────────────────
// LOESUNG: string[]
// WARUM: Object.keys() gibt IMMER string[] zurueck, nie die konkreten
//        Property-Namen als Literal-Union. Das ist eine bewusste Design-
//        Entscheidung: JS-Objekte koennen zur Laufzeit mehr Properties
//        haben als TS zur Compile-Zeit kennt (z.B. durch Vererbung oder
//        dynamische Zuweisung). Deshalb waere ("name" | "age" | "city")[]
//        technisch unsound.
// ─────────────────────────────────────────────────────────────────────────────

const user = { name: "Max", age: 30, city: "Berlin" };
const keys = Object.keys(user);

type Test_11 = Expect<Equal<typeof keys, string[]>>;

// ── AUFGABE 12: Array.find() ───────────────────────────────────────────────
// LOESUNG: number | undefined
// WARUM: find() kann nichts finden! Wenn kein Element die Bedingung
//        erfuellt, gibt find() undefined zurueck. Deshalb ist der
//        Typ immer `ElementTyp | undefined`.
// ─────────────────────────────────────────────────────────────────────────────

const numbers = [10, 20, 30, 40, 50];
const found = numbers.find(n => n > 25);

type Test_12 = Expect<Equal<typeof found, number | undefined>>;

// ── AUFGABE 13: Spread-Operator auf Objekte ────────────────────────────────
// LOESUNG: { a: number; b: number; c: boolean }
// WARUM: Der Spread-Operator mergt Objekte. Wenn ein Property in beiden
//        existiert (hier: 'b'), gewinnt das LETZTE Objekt.
//        base hat { a: number; b: string }, dann ueberschreibt { b: 42 }
//        das 'b' --> b wird number (nicht string).
//        Das 'c: true' kommt neu hinzu als boolean (Widening bei Objekt-Property).
// ─────────────────────────────────────────────────────────────────────────────

const base = { a: 1, b: "hello" };
const extended = { ...base, c: true, b: 42 };

type Test_13 = Expect<Equal<typeof extended, { a: number; b: number; c: boolean }>>;

// ── AUFGABE 14: Return mit Literal vs Widened ──────────────────────────────
// LOESUNG 14a: string (geweitert)
// LOESUNG 14b: "active" (Literal)
// WARUM: Return-Werte werden standardmaessig geweitert (wie let).
//        `as const` auf dem Return-Wert verhindert das Widening.
//        Der Grund fuer das Standard-Widening: Der Aufrufer koennte
//        den Wert in eine let-Variable speichern, die dann geaendert wird.
// ─────────────────────────────────────────────────────────────────────────────

function getStatus() {
  return "active";
}

function getStatusConst() {
  return "active" as const;
}

const status14a = getStatus();
const status14b = getStatusConst();

type Test_14a = Expect<Equal<typeof status14a, string>>;
type Test_14b = Expect<Equal<typeof status14b, "active">>;

// ── AUFGABE 15: Promise.all() ──────────────────────────────────────────────
// LOESUNG: [string, number, boolean]
// WARUM: Promise.all() hat spezielle Overloads, die den Typ jedes einzelnen
//        Promise-Arguments erhalten. Das Ergebnis ist ein Tuple mit den
//        aufgeloesten Typen in der gleichen Reihenfolge.
//        Promise.resolve("hello") -> string
//        Promise.resolve(42) -> number
//        Promise.resolve(true) -> boolean
//        Zusammen: [string, number, boolean]
// ─────────────────────────────────────────────────────────────────────────────

async function fetchBoth() {
  const result = await Promise.all([
    Promise.resolve("hello"),
    Promise.resolve(42),
    Promise.resolve(true),
  ]);
  return result;
}

type FetchResult = Awaited<ReturnType<typeof fetchBoth>>;

type Test_15 = Expect<Equal<FetchResult, [string, number, boolean]>>;

// ============================================================================
// BONUS-ANTWORTEN
// ============================================================================

// Bonus A: number[]
// filter() behaelt den Element-Typ (number). Es verengt NICHT automatisch,
// auch wenn die Bedingung Elemente ausschliesst.
const bonusA = [1, 2, 3].filter(n => n > 1);
type BonusTest_A = Expect<Equal<typeof bonusA, number[]>>;

// Bonus B: Readonly<{ x: 10; y: 20 }>
// Object.freeze() gibt Readonly<T> zurueck und behaelt die Literal-Typen,
// weil die Properties durch readonly nicht mehr geaendert werden koennen.
const bonusB = Object.freeze({ x: 10, y: 20 });
type BonusTest_B = Expect<Equal<typeof bonusB, Readonly<{ x: 10; y: 20 }>>>;

// Bonus C:
// bonusC: readonly ["hello", 42, null] (readonly Tuple mit Literal-Typen)
// bonusCElement: "hello" (Literal-Typ, weil Position 0 im Tuple bekannt ist)
const bonusC = ["hello", 42, null] as const;
const bonusCElement = bonusC[0];
type BonusTest_C1 = Expect<Equal<typeof bonusC, readonly ["hello", 42, null]>>;
type BonusTest_C2 = Expect<Equal<typeof bonusCElement, "hello">>;

// Bonus D: { value: "test" }
// Der Generic T extends string infert "test" (Literal), weil der Constraint
// string ist und der Wert ein String-Literal. In { value } wird T beibehalten.
function bonusFn<T extends string>(value: T) {
  return { value };
}
const bonusD = bonusFn("test");
type BonusTest_D = Expect<Equal<typeof bonusD, { value: "test" }>>;

// Bonus E: Record<number, number>
// reduce() infert den Akkumulator-Typ aus dem Startwert.
// Der Startwert ist `{} as Record<number, number>`, also bleibt
// der Akkumulator (und damit das Ergebnis) Record<number, number>.
const bonusE = [1, 2, 3].reduce((acc, n) => ({ ...acc, [n]: n * 2 }), {} as Record<number, number>);
type BonusTest_E = Expect<Equal<typeof bonusE, Record<number, number>>>;
