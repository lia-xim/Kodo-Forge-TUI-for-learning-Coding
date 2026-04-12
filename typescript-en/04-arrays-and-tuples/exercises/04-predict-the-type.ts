/**
 * Lektion 04 — Uebung 04: Predict the Type
 *
 * Bei jeder Aufgabe: Schreibe den Typ den du ERWARTEST in den
 * Expect<Equal<...>>-Check ein. Wenn der Code kompiliert, hast du
 * den Typ korrekt vorhergesagt!
 *
 * Pruefung: npx tsx exercises/04-predict-the-type.ts
 *
 * Tipp: Versuche den Typ ZUERST im Kopf zu bestimmen, bevor du
 * in der IDE hoverst. Das trainiert dein mentales TypeScript-Modell.
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 1: Array-Inferenz bei gemischten Werten
// ═══════════════════════════════════════════════════════════════════════════════

// Was inferiert TypeScript hier?
const gemischt = [1, "hello", true];

// TODO: Ersetze 'unknown' durch den korrekten Typ
type Test1 = Expect<Equal<typeof gemischt, unknown>>;
// Hinweis: Denke an die Union-Typ-Inferenz bei gemischten Arrays.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 2: as const Effekt auf Arrays
// ═══════════════════════════════════════════════════════════════════════════════

// Was passiert mit as const?
const farben = ["rot", "gruen", "blau"] as const;

// TODO: Ersetze 'unknown' durch den korrekten Typ
type Test2 = Expect<Equal<typeof farben, unknown>>;
// Hinweis: as const hat DREI Effekte gleichzeitig. Welche?

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 3: map() Rueckgabetyp
// ═══════════════════════════════════════════════════════════════════════════════

const zahlen = [1, 2, 3];
const alsStrings = zahlen.map(n => String(n));

// TODO: Ersetze 'unknown' durch den korrekten Typ von alsStrings
type Test3 = Expect<Equal<typeof alsStrings, unknown>>;
// Hinweis: Was gibt map() zurueck wenn der Callback string liefert?

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 4: filter() mit typeof-Check (TS 5.5+ Inferred Type Predicates)
// ═══════════════════════════════════════════════════════════════════════════════

const gemischt2: (string | number)[] = ["a", 1, "b", 2];
const gefiltert = gemischt2.filter(x => typeof x === "string");

// TODO: Ersetze 'unknown' durch den korrekten Typ
type Test4 = Expect<Equal<typeof gefiltert, unknown>>;
// Hinweis: Ab TypeScript 5.5 inferiert TS automatisch Type Predicates
// bei einfachen typeof-Checks in filter(). Das war frueher anders!

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 5: filter() mit komplexer Bedingung (KEIN inferred Predicate)
// ═══════════════════════════════════════════════════════════════════════════════

const gemischt3: (string | number | boolean)[] = ["a", 1, "b", true, 2];
const grosseStrings = gemischt3.filter(x => typeof x === "string" && x.length > 0);

// TODO: Ersetze 'unknown' durch den korrekten Typ
type Test5 = Expect<Equal<typeof grosseStrings, unknown>>;
// Hinweis: TS 5.5+ kann bei EINFACHEN typeof-Checks den Typ automatisch
// verengen (Aufgabe 4). Aber gilt das auch bei komplexeren Bedingungen mit &&?

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 6: find() Rueckgabetyp
// ═══════════════════════════════════════════════════════════════════════════════

const namen: string[] = ["Alice", "Bob", "Charlie"];
const gefunden = namen.find(n => n.startsWith("B"));

// TODO: Ersetze 'unknown' durch den korrekten Typ
type Test6 = Expect<Equal<typeof gefunden, unknown>>;
// Hinweis: Was gibt find() zurueck, wenn es nichts findet?

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 7: Tuple-Zugriff vs Array-Zugriff
// ═══════════════════════════════════════════════════════════════════════════════

const tuple: [string, number, boolean] = ["test", 42, true];
const pos0 = tuple[0];
const pos1 = tuple[1];

const array: (string | number | boolean)[] = ["test", 42, true];
const elem0 = array[0];

// TODO: Ersetze alle 'unknown' durch die korrekten Typen
type Test7a = Expect<Equal<typeof pos0, unknown>>;
type Test7b = Expect<Equal<typeof pos1, unknown>>;
type Test7c = Expect<Equal<typeof elem0, unknown>>;
// Hinweis: Bei Tuples kennt TS den Typ JEDER Position.
// Bei Arrays kennt TS nur den gemeinsamen Typ.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 8: as const auf Objekte in Arrays
// ═══════════════════════════════════════════════════════════════════════════════

const config = {
  routes: ["/home", "/about", "/contact"],
  port: 3000,
} as const;

type Routes = typeof config.routes;
type Port = typeof config.port;

// TODO: Ersetze alle 'unknown' durch die korrekten Typen
type Test8a = Expect<Equal<Routes, unknown>>;
type Test8b = Expect<Equal<Port, unknown>>;
// Hinweis: as const wirkt TIEF — auch auf verschachtelte Arrays und Werte.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 9: Union aus as const Array ableiten
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS = ["active", "inactive", "pending"] as const;
type StatusType = (typeof STATUS)[number];

// TODO: Ersetze 'unknown' durch den korrekten Typ
type Test9 = Expect<Equal<StatusType, unknown>>;
// Hinweis: [number] greift auf ALLE numerischen Indizes zu und bildet eine Union.

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 10: Spread verliert Tuple-Information
// ═══════════════════════════════════════════════════════════════════════════════

function getPoint(): [number, number] {
  return [10, 20];
}

const point = getPoint();
const spread = [...getPoint()];

// TODO: Ersetze alle 'unknown' durch die korrekten Typen
type Test10a = Expect<Equal<typeof point, unknown>>;
type Test10b = Expect<Equal<typeof spread, unknown>>;
// Hinweis: Was passiert mit dem Tuple-Typ beim Spreaden?

// ═══════════════════════════════════════════════════════════════════════════════

console.log("Wenn dieser Code kompiliert, hast du alle Typen korrekt vorhergesagt!");
console.log("Pruefe mit: npx tsc --noEmit exercises/04-predict-the-type.ts");
