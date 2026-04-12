/**
 * LEKTION 03 - Loesung 4: Predict the Type
 *
 * Ausfuehrliche Loesungen mit Erklaerungen.
 * Jede Loesung erklaert WARUM TypeScript diesen Typ infert -- nicht nur WELCHEN.
 *
 * Pruefen: npx tsc --noEmit
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

// ============================================================================
// AUFGABE 1: Mixed Array
// LOESUNG: (string | number)[]
// WARUM: TypeScript bildet den "Best Common Type" -- die Union aller
//        Element-Typen. Ein Array-Literal ergibt IMMER ein Array, kein Tuple.
//        Tuples entstehen nur bei `as const` oder expliziter Annotation.
//        TS nimmt an, dass du spaeter weitere Elemente pushen willst,
//        also braucht es einen flexiblen Array-Typ.
// ============================================================================

const mixedArray = [1, "hello"];

type Test_1 = Expect<Equal<typeof mixedArray, (string | number)[]>>;

// Um ein Tuple zu bekommen:
// const mixedTuple = [1, "hello"] as const;  // readonly [1, "hello"]
// const mixedTuple2: [number, string] = [1, "hello"];  // [number, string]

// ============================================================================
// AUFGABE 2: Funktion mit bedingtem Return
// LOESUNG: (x: number) => "yes" | "no"
// WARUM: Das ueberrascht viele! Bei einem KONSTANTEN Ternary-Ausdruck mit
//        String-Literalen behaelt TypeScript die Literal-Typen im Return-Typ.
//        Der Compiler sieht, dass die Funktion NUR "yes" oder "no" zurueckgeben
//        kann, und bildet die Union "yes" | "no". Das Return-Widening zu
//        `string` tritt hier NICHT ein, weil der Ternary direkt zurueckgegeben
//        wird und TS die Zweige als eigenstaendige Literal-Kandidaten behandelt.
// ============================================================================

const fn2 = (x: number) => x > 0 ? "yes" : "no";

type Test_2 = Expect<Equal<typeof fn2, (x: number) => "yes" | "no">>;

// ============================================================================
// AUFGABE 3: Object Property mit `as const` vs. ohne
// LOESUNG 3a: number
// LOESUNG 3b: 1
// WARUM: `const` schuetzt nur die VARIABLE vor Neuzuweisung, nicht die
//        PROPERTIES. obj3a.x koennte spaeter auf 42 gesetzt werden, also
//        muss der Typ `number` sein (gewidened). Bei `1 as const` sagst du
//        TS explizit: "Dieser Wert ist exakt 1 und soll nicht gewidened werden."
// ============================================================================

const obj3a = { x: 1 };
const obj3b = { x: 1 as const };

type Test_3a = Expect<Equal<typeof obj3a.x, number>>;
type Test_3b = Expect<Equal<typeof obj3b.x, 1>>;

// ============================================================================
// AUFGABE 4: Object.keys()
// LOESUNG: string[]
// WARUM: Wegen struktureller Typisierung. In TypeScript kann ein Objekt
//        zur Laufzeit MEHR Properties haben als im Typ deklariert.
//        Beispiel: processUser(extendedUser) -- der User-Typ hat nur
//        name und age, aber das uebergebene Objekt koennte auch email haben.
//        Object.keys() gibt ALLE Runtime-Keys zurueck, nicht nur die deklarierten.
//        Deshalb waere (keyof typeof user)[] technisch unsound.
// ============================================================================

const user4 = { name: "Max", age: 30, active: true };
const userKeys = Object.keys(user4);

type Test_4 = Expect<Equal<typeof userKeys, string[]>>;

// ============================================================================
// AUFGABE 5: Array.filter() ohne Type Predicate
// LOESUNG: (string | null)[]
// WARUM: filter() gibt IMMER ein Array desselben Elementtyps zurueck.
//        TS kann nicht wissen, dass `item !== null` den Typ verengt, weil
//        der Callback-Return-Typ nur `boolean` ist (nicht ein Type Predicate).
//        Loesung: filter((item): item is string => item !== null)
// ============================================================================

const items5: (string | null)[] = ["hello", null, "world", null];
const filtered5 = items5.filter(item => item !== null);

type Test_5 = Expect<Equal<typeof filtered5, string[]>>;

// Mit Type Predicate:
// const filtered5b = items5.filter((item): item is string => item !== null);
// Typ: string[]

// ============================================================================
// AUFGABE 6: Ternary in const
// LOESUNG: 42 | "never reached"
// WARUM: TypeScript wertet Ternaries NICHT zur Compile-Zeit aus, auch
//        wenn die Bedingung konstant ist. TS ist ein Typ-Checker, kein
//        Interpreter. Es behaelt beide moeglichen Zweige als Union.
//        Da das Ergebnis in einer const-Variable liegt, bleiben die
//        Literal-Typen erhalten: 42 | "never reached".
// ============================================================================

const flag6 = true;
const result6 = flag6 ? 42 : "never reached";

type Test_6 = Expect<Equal<typeof result6, 42 | "never reached">>;

// ============================================================================
// AUFGABE 7: typeof Narrowing -- was bleibt im else?
// LOESUNG: boolean | null
// WARUM: Im ersten if wird string ausgeschlossen. Im zweiten if wird
//        number ausgeschlossen. Was bleibt? boolean | null.
//        TypeScript entfernt bei jedem Check die behandelten Typen
//        aus der Union -- wie ein Ausschlussverfahren.
// ============================================================================

function test7(x: string | number | boolean | null) {
  if (typeof x === "string") {
    return x;
  } else if (typeof x === "number") {
    return x;
  } else {
    type Remaining = typeof x;
    type Test_7 = Expect<Equal<Remaining, boolean | null>>;
    return x;
  }
}

// ============================================================================
// AUFGABE 8: Spread ueberschreibt Properties
// LOESUNG: number
// WARUM: Beim Spread gewinnt das LETZTE Objekt fuer gleichnamige Properties.
//        base8.x ist string, aber die explizite Zuweisung `x: 42` ueberschreibt
//        das. Da 42 ein Objekt-Property ist (nicht top-level const), wird es
//        zu number gewidened.
// ============================================================================

const base8 = { x: "hello", y: 10 };
const override8 = { ...base8, x: 42 };

type Test_8 = Expect<Equal<typeof override8.x, number>>;

// ============================================================================
// AUFGABE 9: Promise.all() Tuple-Inference
// LOESUNG: [number, string, boolean]
// WARUM: Promise.all() hat spezielle Overloads fuer bis zu 10 Argumente.
//        Diese Overloads nutzen Tuple-Typen, um die Position jedes Promise
//        zu erhalten. Deshalb ist das Ergebnis ein Tuple (geordnet), nicht
//        ein Array (ungeordnet Union).
//        Overload: Promise.all<T1, T2, T3>(values: [T1, T2, T3]): Promise<[T1, T2, T3]>
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

type Test_9 = Expect<Equal<Result9, [number, string, boolean]>>;

// ============================================================================
// AUFGABE 10: as const auf verschachtelten Objekten
// LOESUNG 10a: "localhost"
// LOESUNG 10b: readonly [5432, 5433]
// WARUM: `as const` wirkt REKURSIV auf die gesamte Struktur.
//        Alle Properties werden readonly, alle Werte Literal-Typen,
//        alle Arrays werden readonly Tuples.
//        OHNE as const waere host: string und ports: number[].
// ============================================================================

const config10 = {
  db: {
    host: "localhost",
    ports: [5432, 5433],
  },
  debug: true,
} as const;

type Test_10a = Expect<Equal<typeof config10.db.host, "localhost">>;
type Test_10b = Expect<Equal<typeof config10.db.ports, readonly [5432, 5433]>>;

// ============================================================================
// AUFGABE 11: Generic Inference bei aenderbarer Position
// LOESUNG: string
// WARUM: TypeScript erkennt, dass T an einer "aenderbaren" Position
//        verwendet wird (der update-Parameter). Wenn T = "hello" waere,
//        koennte update() nur mit exakt "hello" aufgerufen werden --
//        nicht mit "world" oder anderen Strings. Das waere unpraktisch.
//        Deshalb widened TS den Generic-Parameter zu string.
//        Um Literal-Typen zu erzwingen: createBox<"hello">("hello") oder
//        const T Parameter (ab TS 5.0): createBox<const T>(value: T).
// ============================================================================

function createBox<T>(value: T): { value: T; update: (v: T) => void } {
  let current = value;
  return {
    value: current,
    update: (v) => { current = v; },
  };
}

const box11 = createBox("hello");

type Test_11 = Expect<Equal<typeof box11.value, string>>;

// ============================================================================
// AUFGABE 12: Array.find() -- das vergessene undefined
// LOESUNG 12: number | undefined
// LOESUNG 12b: 10 | 20 | 30 | undefined
// WARUM: find() kann NICHTS finden -- in dem Fall gibt es undefined zurueck.
//        TypeScript bildet deshalb IMMER `ElementTyp | undefined`.
//        Bei einem as-const-Tuple kennt TS die exakten Werte (10, 20, 30),
//        also wird der Typ `10 | 20 | 30 | undefined`.
// ============================================================================

const nums12 = [10, 20, 30];
const found12 = nums12.find(n => n > 25);

type Test_12 = Expect<Equal<typeof found12, number | undefined>>;

const tuple12 = [10, 20, 30] as const;
const foundTuple12 = tuple12.find(n => n > 25);

type Test_12b = Expect<Equal<typeof foundTuple12, 10 | 20 | 30 | undefined>>;
