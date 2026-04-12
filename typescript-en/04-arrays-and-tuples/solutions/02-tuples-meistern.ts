/**
 * Lektion 04 — Loesung 02: Tuples meistern
 *
 * Hier findest du die vollstaendigen Loesungen mit Erklaerungen.
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 1: Erstelle einen grundlegenden Tuple-Typ
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Ein Tuple-Typ wird mit eckigen Klammern und Komma-getrennten
// Typen definiert. Die Reihenfolge ist wichtig!
type Person = [string, number];
const alice: Person = ["Alice", 30];

type Test1a = Expect<Equal<Person, [string, number]>>;
console.assert(alice[0] === "Alice", "Aufgabe 1: Name sollte Alice sein");
console.assert(alice[1] === 30, "Aufgabe 1: Alter sollte 30 sein");
console.log("✓ Aufgabe 1 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 2: Named / Labeled Tuple erstellen
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Labels werden mit 'name: type' Syntax angegeben.
// Sie sind rein dokumentarisch und beeinflussen den Typ nicht,
// aber verbessern IDE-Tooltips und Fehlermeldungen erheblich.
type Koordinate = [lat: number, lng: number];
const muenchen: Koordinate = [48.1351, 11.5820];

type Test2a = Expect<Equal<Koordinate, [lat: number, lng: number]>>;
console.assert(muenchen[0] === 48.1351, "Aufgabe 2: Latitude falsch");
console.assert(muenchen[1] === 11.5820, "Aufgabe 2: Longitude falsch");
console.log("✓ Aufgabe 2 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 3: Optionale Tuple-Elemente
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Das '?' nach dem Label oder Typ macht das Element optional.
// Optionale Elemente muessen IMMER am Ende stehen — genauso wie bei
// optionalen Funktionsparametern.
// Der Typ des optionalen Elements wird automatisch zu 'number | undefined'.
type RGB = [r: number, g: number, b: number, a?: number];
const rot: RGB = [255, 0, 0];
const halbtransparent: RGB = [255, 0, 0, 0.5];

type Test3a = Expect<Equal<RGB, [r: number, g: number, b: number, a?: number]>>;
console.assert(rot.length === 3, "Aufgabe 3: rot sollte 3 Elemente haben");
console.assert(halbtransparent.length === 4, "Aufgabe 3: halbtransparent sollte 4 Elemente haben");
console.assert(halbtransparent[3] === 0.5, "Aufgabe 3: Alpha sollte 0.5 sein");
console.log("✓ Aufgabe 3 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 4: Rest-Element Tuple erstellen
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: '...' vor einem Array-Typ erstellt ein Rest-Element.
// Das Tuple hat dann ein festes erstes Element und beliebig viele
// weitere Elemente des Rest-Typs.
type LogEntry = [timestamp: string, ...messages: string[]];
const log1: LogEntry = ["2024-01-01", "Server gestartet"];
const log2: LogEntry = ["2024-01-01", "Fehler", "in Zeile 42", "Modul: Auth"];

type Test4a = Expect<Equal<LogEntry, [timestamp: string, ...messages: string[]]>>;
console.assert(log1.length === 2, "Aufgabe 4: log1 sollte 2 Elemente haben");
console.assert(log2.length === 4, "Aufgabe 4: log2 sollte 4 Elemente haben");
console.log("✓ Aufgabe 4 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 5: Tuple mit Typen destructurieren
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Destructuring funktioniert bei Tuples genauso wie bei Arrays.
// Der entscheidende Unterschied: TypeScript kennt den EXAKTEN Typ
// jeder Position! statusCode ist number, nicht string | number | boolean.
const httpResponse: [number, string, boolean] = [200, "OK", true];
const [statusCode, statusText, success] = httpResponse;

type Test5a = Expect<Equal<typeof statusCode, number>>;
type Test5b = Expect<Equal<typeof statusText, string>>;
type Test5c = Expect<Equal<typeof success, boolean>>;
console.assert(statusCode === 200, "Aufgabe 5: statusCode sollte 200 sein");
console.assert(statusText === "OK", "Aufgabe 5: statusText sollte 'OK' sein");
console.assert(success === true, "Aufgabe 5: success sollte true sein");
console.log("✓ Aufgabe 5 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 6: Funktion mit Tuple-Rueckgabe (useState-Style)
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Die Funktion gibt ein Tuple zurueck.
// Dieses Pattern ist aus React bekannt (useState, useReducer, etc.).
// Der Vorteil gegenueber einem Object: Man kann die Variablen beim
// Destructuring frei benennen.
function useToggle(initial: boolean): [value: boolean, toggle: () => void] {
  let value = initial;
  const toggle = () => { value = !value; };
  return [value, toggle];
}

const [isOpen, toggleOpen] = useToggle(false);
type Test6a = Expect<Equal<typeof isOpen, boolean>>;
type Test6b = Expect<Equal<typeof toggleOpen, () => void>>;
console.assert(isOpen === false, "Aufgabe 6: isOpen sollte false sein");
console.assert(typeof toggleOpen === "function", "Aufgabe 6: toggleOpen sollte eine Funktion sein");
console.log("✓ Aufgabe 6 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 7: as const fuer Tuple-Inferenz verwenden
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: 'as const' macht drei Dinge auf einmal:
// 1. Das Array wird zu einem readonly Tuple
// 2. Alle Werte werden zu Literal-Typen (200 statt number)
// 3. Der Typ ist readonly [200, 404, 500]
//
// Mit (typeof statusCodes)[number] extrahieren wir die Union aller Werte.
// 'number' als Index-Typ gibt alle moeglichen Werte des Arrays zurueck.
const statusCodes = [200, 404, 500] as const;
type StatusCode = (typeof statusCodes)[number];

type Test7a = Expect<Equal<typeof statusCodes, readonly [200, 404, 500]>>;
type Test7b = Expect<Equal<StatusCode, 200 | 404 | 500>>;
console.log("✓ Aufgabe 7 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 8: Spread mit Tuples kombinieren
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Mit dem Spread-Operator (...) koennen Tuple-Typen
// kombiniert werden. Das Ergebnis ist ein neuer Tuple-Typ, der
// alle Elemente beider Tuples enthaelt.
// Beachte: Die Labels gehen beim Spread verloren — der Ergebnistyp
// hat nur die Basis-Typen.
type Anfang = [id: number, name: string];
type Ende = [active: boolean, role: string];
type UserRecord = [...Anfang, ...Ende];

const user: UserRecord = [1, "Alice", true, "admin"];

type Test8a = Expect<Equal<UserRecord, [number, string, boolean, string]>>;
console.assert(user.length === 4, "Aufgabe 8: user sollte 4 Elemente haben");
console.log("✓ Aufgabe 8 bestanden");

console.log("\n🏁 Alle Aufgaben bestanden!");
