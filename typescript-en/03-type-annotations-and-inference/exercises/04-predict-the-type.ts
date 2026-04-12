/**
 * LEKTION 03 - Exercise 4: Predict the Type
 *
 * Diese Uebung fokussiert auf UEBERRASCHENDE Inference-Ergebnisse.
 * Bei jedem Snippet: Sage den Typ voraus, BEVOR du hoverst!
 *
 * Schreibe deinen vermuteten Typ in die `Expect<Equal<...>>` Tests.
 * Wenn der Code kompiliert, hast du richtig geraten.
 *
 * WICHTIG: Die meisten dieser Faelle sind Stellen, an denen viele
 * Entwickler den falschen Typ erwarten. Lass dich ueberraschen!
 *
 * Pruefen: npx tsc --noEmit
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

// ============================================================================
// AUFGABE 1: Mixed Array -- was ist der Elementtyp?
//
// Die meisten Entwickler erwarten ein "Tuple" -- aber bekommst du eins?
// Hinweis: Was macht TypeScript bei einem Array-Literal mit verschiedenen Typen?
// ============================================================================

const mixedArray = [1, "hello"];

// Welchen Typ hat mixedArray?
// TODO: Ersetze 'unknown' durch den richtigen Typ
type Test_1 = Expect<Equal<typeof mixedArray, unknown>>;

// RUBBER DUCK: Erklaere in einem Satz, warum das Ergebnis ein Array
// und kein Tuple ist. Was muesste man tun, damit es ein Tuple wird?

// ============================================================================
// AUFGABE 2: Funktion mit bedingtem Return -- praeziser als du denkst?
//
// Was ist der Return-Typ dieser Funktion?
// Denke an Return Type Inference: TS analysiert ALLE Return-Pfade.
// ============================================================================

const fn2 = (x: number) => x > 0 ? "yes" : "no";

// Welchen Typ hat fn2?
type Test_2 = Expect<Equal<typeof fn2, unknown>>;

// RUBBER DUCK: Ist der Return-Typ `string` oder `"yes" | "no"`?
// Denke daran: Wie behandelt TS Literal-Werte in einem Ternary,
// der direkt zurueckgegeben wird? Werden sie gewidened?

// ============================================================================
// AUFGABE 3: Object Property mit `as const` vs. ohne
//
// Zwei fast identische Objekte -- aber die Typen sind VOELLIG verschieden.
// ============================================================================

const obj3a = { x: 1 };
const obj3b = { x: 1 as const };

// Welchen Typ hat obj3a.x?
type Test_3a = Expect<Equal<typeof obj3a.x, unknown>>;

// Welchen Typ hat obj3b.x?
type Test_3b = Expect<Equal<typeof obj3b.x, unknown>>;

// RUBBER DUCK: Warum ist obj3a.x geweidet, obwohl obj3a mit `const` deklariert ist?
// Was genau schuetzt `const` bei Objekten -- und was nicht?

// ============================================================================
// AUFGABE 4: Object.keys() -- die groesste Ueberraschung
//
// Fast jeder erwartet hier (keyof typeof obj)[].
// Aber TypeScript hat einen guten Grund dagegen.
// ============================================================================

const user4 = { name: "Max", age: 30, active: true };
const userKeys = Object.keys(user4);

// Welchen Typ hat userKeys?
type Test_4 = Expect<Equal<typeof userKeys, unknown>>;

// RUBBER DUCK: Warum gibt Object.keys() nicht ("name" | "age" | "active")[]
// zurueck? Denke an strukturelle Typisierung: Kann ein Objekt zur Laufzeit
// MEHR Properties haben als der TypeScript-Typ deklariert?

// ============================================================================
// AUFGABE 5: Array.filter() ohne Type Predicate
//
// Das ueberrascht fast jeden: filter() verengt den Typ NICHT automatisch.
// ============================================================================

const items5: (string | null)[] = ["hello", null, "world", null];
const filtered5 = items5.filter(item => item !== null);

// Welchen Typ hat filtered5?
// ACHTUNG: Ist es string[] oder (string | null)[]?
type Test_5 = Expect<Equal<typeof filtered5, unknown>>;

// RUBBER DUCK: Warum narrowt .filter() den Typ nicht, obwohl die
// Bedingung eindeutig null ausschliesst? Was brauchst du stattdessen?
// (Stichwort: Type Predicate)

// ============================================================================
// AUFGABE 6: Ternary in const -- wertet TS den Ausdruck aus?
//
// flag ist definitiv `true` (const!). Wertet TS den Ternary aus?
// ============================================================================

const flag6 = true;
const result6 = flag6 ? 42 : "never reached";

// Welchen Typ hat result6?
type Test_6 = Expect<Equal<typeof result6, unknown>>;

// RUBBER DUCK: TypeScript kennt den Wert von flag6 (es ist `true`).
// Trotzdem ist der Typ nicht nur `42`. Warum wertet TS Ternaries
// nicht zur Compile-Zeit aus?

// ============================================================================
// AUFGABE 7: typeof in einem Narrowing-Block -- was bleibt uebrig?
//
// Achte auf den Typ im ELSE-Block, nicht im IF-Block.
// ============================================================================

function test7(x: string | number | boolean | null) {
  if (typeof x === "string") {
    return x; // Was ist x hier?
  } else if (typeof x === "number") {
    return x; // Was ist x hier?
  } else {
    // Was ist x hier? (Was bleibt nach string und number uebrig?)
    type Remaining = typeof x;
    // TODO: Was ist Remaining?
    type Test_7 = Expect<Equal<Remaining, unknown>>;
    return x;
  }
}

// ============================================================================
// AUFGABE 8: Spread ueberschreibt Properties -- welcher Typ gewinnt?
//
// Wenn ein Property in beiden Objekten existiert, gewinnt das letzte.
// Aber was passiert mit dem TYP?
// ============================================================================

const base8 = { x: "hello", y: 10 };
const override8 = { ...base8, x: 42 };

// Welchen Typ hat override8.x?
type Test_8 = Expect<Equal<typeof override8.x, unknown>>;

// RUBBER DUCK: base8.x ist string, aber override8.x ist ____. Warum?
// Was passiert mit dem Typ, wenn ein Spread-Property ueberschrieben wird?

// ============================================================================
// AUFGABE 9: Promise.all() Tuple-Inference
//
// Promise.all() hat spezielle Overloads. Was kommt raus?
// ============================================================================

async function test9() {
  const result = await Promise.all([
    Promise.resolve(42),
    Promise.resolve("hello"),
    Promise.resolve(true),
  ]);
  return result;
}

type Result9 = Awaited<ReturnType<typeof test9>>;

// Welchen Typ hat Result9?
type Test_9 = Expect<Equal<Result9, unknown>>;

// RUBBER DUCK: Warum ist das Ergebnis ein Tuple und nicht ein Array?
// Welcher Mechanismus in TypeScript ermoeglicht das?

// ============================================================================
// AUFGABE 10: as const auf verschachtelten Objekten
//
// `as const` wirkt REKURSIV. Was bedeutet das fuer verschachtelte Strukturen?
// ============================================================================

const config10 = {
  db: {
    host: "localhost",
    ports: [5432, 5433],
  },
  debug: true,
} as const;

// Welchen Typ hat config10.db.host?
type Test_10a = Expect<Equal<typeof config10.db.host, unknown>>;

// Welchen Typ hat config10.db.ports?
type Test_10b = Expect<Equal<typeof config10.db.ports, unknown>>;

// RUBBER DUCK: Was waeren die Typen OHNE `as const`?
// (host waere ____, ports waere ____)

// ============================================================================
// AUFGABE 11: Generic Inference bei aenderbarer Position
//
// TypeScript "widened" Generic-Typ-Parameter, wenn sie an einer
// aenderbaren Position verwendet werden. Was bedeutet das?
// ============================================================================

function createBox<T>(value: T): { value: T; update: (v: T) => void } {
  let current = value;
  return {
    value: current,
    update: (v) => { current = v; },
  };
}

const box11 = createBox("hello");

// Welchen Typ hat box11.value?
type Test_11 = Expect<Equal<typeof box11.value, unknown>>;

// RUBBER DUCK: Warum wird T zu "string" gewidened und nicht "hello" behalten?
// Denke an: Was wuerde passieren, wenn T = "hello" waere und du
// box11.update("world") aufrufst?

// ============================================================================
// AUFGABE 12: Array.find() -- das vergessene undefined
//
// .find() kann NICHTS finden. Was bedeutet das fuer den Typ?
// ============================================================================

const nums12 = [10, 20, 30];
const found12 = nums12.find(n => n > 25);

// Welchen Typ hat found12?
type Test_12 = Expect<Equal<typeof found12, unknown>>;

// Und was passiert bei .find() auf einem Tuple mit as const?
const tuple12 = [10, 20, 30] as const;
const foundTuple12 = tuple12.find(n => n > 25);

// Welchen Typ hat foundTuple12?
type Test_12b = Expect<Equal<typeof foundTuple12, unknown>>;

// RUBBER DUCK: Warum fuegt TypeScript bei .find() immer `| undefined` hinzu?
// Was wuerde passieren, wenn es das NICHT taete und find() tatsaechlich
// nichts findet?
