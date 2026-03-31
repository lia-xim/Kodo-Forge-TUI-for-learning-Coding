/**
 * Lektion 04 — Loesung 03: Fortgeschrittene Array & Tuple Challenges
 *
 * Hier findest du die vollstaendigen Loesungen mit ausfuehrlichen Erklaerungen.
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 1: Kovarianz-Bug finden
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG DES BUGS:
// Die originale Funktion nimmt string[] (mutable) als Parameter.
// Durch Kovarianz kann man ("admin" | "user")[] uebergeben, weil
// ("admin" | "user") ein Subtyp von string ist.
// Die Funktion pusht dann "default" (ein string, aber kein "admin" | "user")
// in das Array — und korrumpiert damit den Typ.
//
// LÖSUNG: Statt das Array zu mutieren, eine neue Kopie zurueckgeben.
// Der Parameter wird readonly gemacht, damit Mutation unmoeglich ist.

function addDefault(items: readonly string[]): string[] {
  return [...items, "default"];
}

const specificItems: ("admin" | "user")[] = ["admin", "user"];
const result = addDefault(specificItems);
// specificItems ist unveraendert: ["admin", "user"]
// result ist ein neues Array: ["admin", "user", "default"]

console.assert(result.includes("default"), "Aufgabe 1: default sollte enthalten sein");
console.assert(specificItems.length === 2, "Aufgabe 1: Original unveraendert");
console.log("✓ Aufgabe 1 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 2: Type Predicate mit filter()
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// filter() allein verengt den Typ NICHT. TypeScript kann nicht automatisch
// erkennen, dass dein Predicate eine Typ-Einschraenkung ausdrueckt.
// Du musst es explizit mit einem Type Predicate angeben: (x): x is string =>
//
// Das ': x is string' nach dem Parameter sagt TypeScript:
// "Wenn diese Funktion true zurueckgibt, ist x definitiv ein string."

const daten: (string | number | null | undefined)[] = [
  "hello", 42, null, "world", undefined, 7, "typescript", null
];

const nurStrings = daten.filter(
  (x): x is string => typeof x === "string"
);

type Test2 = Expect<Equal<typeof nurStrings, string[]>>;
console.assert(nurStrings.length === 3, "Aufgabe 2: sollte 3 Strings finden");
console.assert(nurStrings[0] === "hello", "Aufgabe 2: erster String sollte 'hello' sein");
console.log("✓ Aufgabe 2 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 3: as const + typeof fuer Union-Typ
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// 1. 'as const' macht das Array zu readonly ["GET", "POST", "PUT", "DELETE"]
//    mit Literal-Typen (nicht string[]).
// 2. (typeof HTTP_METHODS)[number] extrahiert die Union aller Elemente:
//    - typeof HTTP_METHODS = readonly ["GET", "POST", "PUT", "DELETE"]
//    - [number] = Zugriff mit beliebigem Index = Union aller Moeglichkeiten
// 3. Der Type Guard nutzt Array.includes(), aber wir muessen casten,
//    weil includes() auf readonly Literal-Arrays nur Literal-Werte akzeptiert.

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

function isValidMethod(method: string): method is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(method);
}

type Test3a = Expect<Equal<HttpMethod, "GET" | "POST" | "PUT" | "DELETE">>;
console.assert(isValidMethod("GET") === true, "Aufgabe 3: GET sollte gueltig sein");
console.assert(isValidMethod("PATCH") === false, "Aufgabe 3: PATCH sollte ungueltig sein");
const method: string = "POST";
if (isValidMethod(method)) {
  type Test3b = Expect<Equal<typeof method, HttpMethod>>;
}
console.log("✓ Aufgabe 3 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 4: Variadic Tuple Type — Prepend und Append
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// Variadic Tuple Types erlauben es, Tuple-Typen mit dem Spread-Operator
// zu manipulieren. Das ist dasselbe Prinzip wie bei Laufzeit-Spreads,
// aber auf Typ-Ebene.
//
// Prepend: [Elem, ...T] — Elem vorne, dann alle Elemente von T
// Append: [...T, Elem] — alle Elemente von T, dann Elem

type Prepend<Elem, T extends readonly unknown[]> = [Elem, ...T];
type Append<T extends readonly unknown[], Elem> = [...T, Elem];

type Test4a = Expect<Equal<Prepend<number, [string, boolean]>, [number, string, boolean]>>;
type Test4b = Expect<Equal<Prepend<string, []>, [string]>>;
type Test4c = Expect<Equal<Append<[string, boolean], number>, [string, boolean, number]>>;
type Test4d = Expect<Equal<Append<[], string>, [string]>>;
console.log("✓ Aufgabe 4 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 5: Head und Tail Utility-Typen
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// Head nutzt Conditional Types mit 'infer':
// "Wenn T ein Tuple ist, das mit einem Element 'First' beginnt,
// dann gib First zurueck. Sonst never."
//
// Tail nutzt dasselbe Prinzip, aber inferiert den Rest:
// "Wenn T ein Tuple ist, das mit einem Element beginnt gefolgt von Rest,
// dann gib Rest zurueck. Sonst ein leeres Tuple."

type Head<T extends readonly unknown[]> =
  T extends readonly [infer First, ...unknown[]] ? First : never;

type Tail<T extends readonly unknown[]> =
  T extends readonly [unknown, ...infer Rest] ? Rest : [];

type Test5a = Expect<Equal<Head<[string, number, boolean]>, string>>;
type Test5b = Expect<Equal<Head<[42]>, 42>>;
type Test5c = Expect<Equal<Tail<[string, number, boolean]>, [number, boolean]>>;
type Test5d = Expect<Equal<Tail<[string]>, []>>;
console.log("✓ Aufgabe 5 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 6: Readonly-sichere Funktion schreiben
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// 1. 'readonly T[]' als Parameter: Die Funktion KANN das Original nicht aendern.
//    Das ist wichtig fuer Defensive Programming — der Aufrufer weiss, dass
//    sein Array nicht veraendert wird.
// 2. [...arr] erstellt eine Kopie. sort() wird auf der Kopie aufgerufen.
// 3. Generics machen die Funktion fuer jeden Typ wiederverwendbar.
// 4. Die optionale compareFn ermoeglicht benutzerdefinierte Sortierung.

function sortedCopy<T>(arr: readonly T[], compareFn?: (a: T, b: T) => number): T[] {
  return [...arr].sort(compareFn);
}

const originalNamen = ["Charlie", "Alice", "Bob"];
const sortiert = sortedCopy(originalNamen);
console.assert(JSON.stringify(sortiert) === '["Alice","Bob","Charlie"]', "Aufgabe 6a: falsch sortiert");
console.assert(originalNamen[0] === "Charlie", "Aufgabe 6b: Original veraendert!");
const readonlyNamen: readonly string[] = ["Z", "A", "M"];
const sortiert2 = sortedCopy(readonlyNamen);
console.assert(sortiert2[0] === "A", "Aufgabe 6c: readonly Array falsch sortiert");
console.log("✓ Aufgabe 6 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 7: Result-Tuple mit Diskriminierung
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// Dies ist ein "Discriminated Tuple Union". Der erste Wert (boolean)
// dient als Diskriminator — aehnlich wie ein 'type' oder 'kind' Feld
// bei Discriminated Unions mit Objects.
//
// [true, T] — Erfolg, der zweite Wert ist vom Typ T
// [false, string] — Fehler, der zweite Wert ist die Fehlermeldung
//
// TypeScript kann anhand des ersten Werts den Typ des zweiten verengen!

type Result<T> = [success: true, data: T] | [success: false, error: string];

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return [false, "Division durch Null!"];
  }
  return [true, a / b];
}

const [ok1, val1] = divide(10, 2);
if (ok1) {
  type Test7a = Expect<Equal<typeof val1, number>>;
  console.assert(val1 === 5, "Aufgabe 7a: 10/2 sollte 5 sein");
}
const [ok2, val2] = divide(10, 0);
if (!ok2) {
  type Test7b = Expect<Equal<typeof val2, string>>;
  console.assert(typeof val2 === "string", "Aufgabe 7b: Fehlermeldung sollte string sein");
}
console.log("✓ Aufgabe 7 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 8: Tuple-basierter Event-Emitter (Typ-Challenge)
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// Das Interface EventMap definiert fuer jedes Event einen Tuple-Typ,
// der die erwarteten Argumente beschreibt.
//
// Die emit-Funktion nutzt:
// 1. K extends keyof EventMap — K muss ein gueltiger Event-Name sein
// 2. ...args: EventMap[K] — die Rest-Argumente muessen zum Tuple-Typ passen
//
// Das ist dasselbe Prinzip, das Libraries wie socket.io oder EventEmitter3
// verwenden, um typsichere Events zu implementieren.

interface EventMap {
  click: [x: number, y: number];
  keypress: [key: string, modifiers: string[]];
  resize: [width: number, height: number];
  logout: [];
}

function emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
  console.log(`  Event: ${event}`, ...args);
}

emit("click", 100, 200);
emit("keypress", "Enter", ["ctrl"]);
emit("resize", 1920, 1080);
emit("logout");
// emit("click", "wrong");  // Fehler: string ist nicht number
// emit("unknown", 1);      // Fehler: "unknown" ist nicht in keyof EventMap
console.log("✓ Aufgabe 8 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 9: TupleToUnion Utility-Typ
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// T[number] auf einem Tuple-Typ gibt die Union aller moeglichen Werte zurueck.
// Das ist dasselbe Prinzip wie bei (typeof arr)[number] mit as const.
//
// Warum funktioniert das?
// Ein Tuple [string, number, boolean] hat die Indizes 0, 1, 2.
// T[number] fragt: "Was bekomme ich, wenn ich mit einem beliebigen
// numerischen Index zugreife?" — Die Antwort ist die Union aller Moeglichkeiten.

type TupleToUnion<T extends readonly unknown[]> = T[number];

type Test9a = Expect<Equal<TupleToUnion<[string, number, boolean]>, string | number | boolean>>;
type Test9b = Expect<Equal<TupleToUnion<["a", "b", "c"]>, "a" | "b" | "c">>;
type Test9c = Expect<Equal<TupleToUnion<[42]>, 42>>;
console.log("✓ Aufgabe 9 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 10: Length Utility-Typ fuer Tuples
// ═══════════════════════════════════════════════════════════════════════════════

// ERKLÄRUNG:
// Tuples haben ein spezielles .length Property: Es ist kein generisches
// 'number', sondern ein Literal-Typ! [string, number, boolean] hat
// length: 3, nicht length: number.
//
// T["length"] nutzt Indexed Access, um diesen Literal-Typ zu extrahieren.
// Das funktioniert NUR bei Tuples — bei normalen Arrays ist T["length"]
// immer number.

type Length<T extends readonly unknown[]> = T["length"];

type Test10a = Expect<Equal<Length<[string, number, boolean]>, 3>>;
type Test10b = Expect<Equal<Length<[]>, 0>>;
type Test10c = Expect<Equal<Length<[42]>, 1>>;
type Test10d = Expect<Equal<Length<readonly ["a", "b"]>, 2>>;
console.log("✓ Aufgabe 10 bestanden");

console.log("\n🏁 Alle Aufgaben bestanden!");
