/**
 * Lektion 04 — Loesung 04: Predict the Type
 *
 * Jede Aufgabe zeigt den korrekten Typ und erklaert WARUM.
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 1: Array-Inferenz bei gemischten Werten
// ═══════════════════════════════════════════════════════════════════════════════

const gemischt = [1, "hello", true];
// Typ: (string | number | boolean)[]

type Test1 = Expect<Equal<typeof gemischt, (string | number | boolean)[]>>;

// WARUM: TypeScript schaut sich alle Elemente an und bildet den kleinsten
// gemeinsamen Union-Typ. Es wird KEIN Tuple inferiert, weil TypeScript
// annimmt, du koenntest spaeter push() aufrufen. Die Design-Entscheidung:
// Lieber zu flexibel als zu restriktiv.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 2: as const Effekt auf Arrays
// ═══════════════════════════════════════════════════════════════════════════════

const farben = ["rot", "gruen", "blau"] as const;
// Typ: readonly ["rot", "gruen", "blau"]

type Test2 = Expect<Equal<typeof farben, readonly ["rot", "gruen", "blau"]>>;

// WARUM: as const bewirkt DREI Dinge gleichzeitig:
// 1. Widening wird verhindert: "rot" statt string (Literal-Typen bleiben)
// 2. Array wird zu readonly Tuple: [x, y, z] statt x[]
// 3. Objekte werden tief readonly (hier nicht relevant, aber bei verschachtelten Daten)

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 3: map() Rueckgabetyp
// ═══════════════════════════════════════════════════════════════════════════════

const zahlen = [1, 2, 3];
const alsStrings = zahlen.map(n => String(n));
// Typ: string[]

type Test3 = Expect<Equal<typeof alsStrings, string[]>>;

// WARUM: map() ist generisch definiert als map<U>(fn: (value: T) => U): U[].
// Der Callback gibt string zurueck (String(n)), also ist U = string.
// map() gibt IMMER ein neues Array zurueck, nie ein Tuple, selbst wenn
// das Quell-Array ein Tuple waere.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 4: filter() mit typeof-Check (TS 5.5+ Inferred Type Predicates)
// ═══════════════════════════════════════════════════════════════════════════════

const gemischt2: (string | number)[] = ["a", 1, "b", 2];
const gefiltert = gemischt2.filter(x => typeof x === "string");
// Typ: string[]  -- Ab TS 5.5 wird der Type Predicate AUTOMATISCH inferiert!

type Test4 = Expect<Equal<typeof gefiltert, string[]>>;

// WARUM: Ab TypeScript 5.5 hat der Compiler "Inferred Type Predicates".
// Wenn der Callback-Body ein einfacher typeof-Check ist (typeof x === "string"),
// inferiert TypeScript automatisch (x): x is string als Rueckgabetyp.
//
// HISTORISCH: Vor TS 5.5 waere der Typ (string | number)[] gewesen, weil
// TypeScript nicht ueber Callback-Grenzen hinweg narrowen konnte. Man musste
// explizit (x): x is string schreiben. In altem Code oder aelteren TS-Versionen
// siehst du daher noch explizite Type Predicates bei filter().

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 5: filter() mit komplexer Bedingung (KEIN inferred Predicate)
// ═══════════════════════════════════════════════════════════════════════════════

const gemischt3: (string | number | boolean)[] = ["a", 1, "b", true, 2];
const grosseStrings = gemischt3.filter(x => typeof x === "string" && x.length > 0);
// Typ: (string | number | boolean)[]  -- Inferred Type Predicates greifen NICHT!

type Test5 = Expect<Equal<typeof grosseStrings, (string | number | boolean)[]>>;

// WARUM: Obwohl TS 5.5+ bei einem einfachen typeof-Check den Type Predicate
// automatisch inferiert (wie in Aufgabe 4), funktioniert das bei KOMPLEXEREN
// Bedingungen nicht. Die && x.length > 0 Bedingung verhindert die Inferenz.
//
// TypeScript kann nur dann einen Type Predicate inferieren, wenn der gesamte
// Callback-Body ein "einfacher" Type Guard ist. Sobald zusaetzliche Logik
// dazukommt, gibt TS auf und der Typ bleibt unverengt.
//
// LOESUNG: Ein explizites Type Predicate verwenden:
//   gemischt3.filter((x): x is string => typeof x === "string" && x.length > 0)
//   -> Typ: string[]

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 6: find() Rueckgabetyp
// ═══════════════════════════════════════════════════════════════════════════════

const namen: string[] = ["Alice", "Bob", "Charlie"];
const gefunden = namen.find(n => n.startsWith("B"));
// Typ: string | undefined

type Test6 = Expect<Equal<typeof gefunden, string | undefined>>;

// WARUM: find() kann KEIN Element finden — in dem Fall gibt es undefined zurueck.
// Deshalb ist der Rueckgabetyp T | undefined. Das ist in der generischen
// Definition von Array<T> so festgelegt: find(predicate: ...): T | undefined.
// Das ist ein Sicherheitsfeature: Du MUSST den undefined-Fall behandeln.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 7: Tuple-Zugriff vs Array-Zugriff
// ═══════════════════════════════════════════════════════════════════════════════

const tuple: [string, number, boolean] = ["test", 42, true];
const pos0 = tuple[0];  // string
const pos1 = tuple[1];  // number

const array: (string | number | boolean)[] = ["test", 42, true];
const elem0 = array[0]; // string | number | boolean

type Test7a = Expect<Equal<typeof pos0, string>>;
type Test7b = Expect<Equal<typeof pos1, number>>;
type Test7c = Expect<Equal<typeof elem0, string | number | boolean>>;

// WARUM: Bei einem Tuple kennt TypeScript den EXAKTEN Typ jeder Position.
// tuple[0] ist IMMER string, tuple[1] ist IMMER number. Bei einem Array
// kennt TypeScript nur den gemeinsamen Union-Typ aller Elemente. array[0]
// KOENNTE string, number ODER boolean sein — TypeScript weiss es nicht.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 8: as const auf Objekte in Arrays
// ═══════════════════════════════════════════════════════════════════════════════

const config = {
  routes: ["/home", "/about", "/contact"],
  port: 3000,
} as const;

type Routes = typeof config.routes;   // readonly ["/home", "/about", "/contact"]
type Port = typeof config.port;       // 3000

type Test8a = Expect<Equal<Routes, readonly ["/home", "/about", "/contact"]>>;
type Test8b = Expect<Equal<Port, 3000>>;

// WARUM: as const wirkt TIEF (deeply readonly):
// - routes wird von string[] zu readonly ["/home", "/about", "/contact"]
//   (Array -> readonly Tuple mit Literal-Typen)
// - port wird von number zu 3000 (Literal-Typ statt gewidenetem number)
// - Alle Properties des Objekts werden readonly

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 9: Union aus as const Array ableiten
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS = ["active", "inactive", "pending"] as const;
type StatusType = (typeof STATUS)[number];
// Typ: "active" | "inactive" | "pending"

type Test9 = Expect<Equal<StatusType, "active" | "inactive" | "pending">>;

// WARUM: Das Pattern funktioniert in drei Schritten:
// 1. typeof STATUS -> readonly ["active", "inactive", "pending"]
// 2. [number] -> Zugriff mit beliebigem numerischen Index
// 3. -> Union aller moeglichen Werte: "active" | "inactive" | "pending"
// Ohne as const waere typeof STATUS = string[] und [number] waere einfach string.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 10: Spread verliert Tuple-Information
// ═══════════════════════════════════════════════════════════════════════════════

function getPoint(): [number, number] {
  return [10, 20];
}

const point = getPoint();     // [number, number]
const spread = [...getPoint()]; // number[]

type Test10a = Expect<Equal<typeof point, [number, number]>>;
type Test10b = Expect<Equal<typeof spread, number[]>>;

// WARUM: Beim Spreaden in ein neues Array-Literal inferiert TypeScript ein
// normales Array, nicht ein Tuple. Es geht davon aus, dass das neue Array
// mutable und erweiterbar sein soll. Die Tuple-Information geht verloren.
// Loesung: Explizite Annotation: const s: [number, number] = [...getPoint()];

console.log("Alle Typen korrekt vorhergesagt!");
