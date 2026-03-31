/**
 * Lektion 02 - Solution 05: Predict the Output
 *
 * Ausfuehren mit: npx tsx solutions/05-predict-the-output.ts
 *
 * Alle Vorhersagen mit den korrekten Antworten und ausfuehrlichen
 * Erklaerungen, warum JavaScript sich so verhaelt.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: typeof null — der historische Bug
// ═══════════════════════════════════════════════════════════════════════════

const aufgabe1 = typeof null;
const vorhersage1: string = "object";

// WARUM: In der ersten JavaScript-Implementierung (1995, Brendan Eich)
// wurden Werte intern als Tag + Daten gespeichert. Objekte hatten Tag 0,
// und null war der Null-Pointer (0x00). Da null-Bits ebenfalls 0 waren,
// wurde null als Objekt erkannt. Ein Fix-Versuch in ES2015 wurde
// abgelehnt — zu viel bestehender Code verlaesst sich auf dieses Verhalten.
//
// PRAXIS: Deshalb musst du bei typeof-Checks fuer Objekte IMMER
// auch auf null pruefen: if (typeof x === "object" && x !== null)

console.assert(aufgabe1 === vorhersage1, "Aufgabe 1 korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Gleitkomma-Arithmetik
// ═══════════════════════════════════════════════════════════════════════════

const aufgabe2 = (0.1 + 0.2 === 0.3);
const vorhersage2: boolean = false;

// WARUM: IEEE 754 kann 0.1 und 0.2 nicht exakt binaer darstellen —
// genau wie 1/3 im Dezimalsystem (0.333...) endlos ist. Das Ergebnis
// von 0.1 + 0.2 ist 0.30000000000000004, also knapp daneben.
//
// LOESUNG: Fuer Geld: in Cent rechnen. Fuer Vergleiche:
// Math.abs(a - b) < Number.EPSILON

console.assert(aufgabe2 === vorhersage2, "Aufgabe 2 korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: NaN — die Identitaetskrise
// ═══════════════════════════════════════════════════════════════════════════

const aufgabe3 = (NaN === NaN);
const vorhersage3: boolean = false;

// WARUM: NaN (Not a Number) ist laut IEEE 754 der EINZIGE Wert der
// sich selbst ungleich ist. NaN entsteht aus verschiedenen undefinierten
// Operationen (0/0, Math.sqrt(-1), parseInt("abc")), und da zwei
// verschiedene undefinierte Ergebnisse nicht identisch sein muessen,
// ist der Vergleich immer false.
//
// PRUEFEN: Verwende Number.isNaN(x) — NICHT x === NaN oder isNaN(x).
// Beachte: isNaN("hallo") === true (konvertiert!),
//          Number.isNaN("hallo") === false (konvertiert nicht!)

console.assert(aufgabe3 === vorhersage3, "Aufgabe 3 korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: typeof NaN
// ═══════════════════════════════════════════════════════════════════════════

const aufgabe4 = typeof NaN;
const vorhersage4: string = "number";

// WARUM: NaN ist ein spezieller IEEE 754 Wert INNERHALB des Number-Typs.
// Der Name "Not a Number" ist irrefuehrend. Besser waere:
// "Not a VALID number" — es ist ein numerischer Platzhalter fuer
// undefinierte Ergebnisse. In TypeScript ist NaN vom Typ number,
// und typeof NaN === "number".

console.assert(aufgabe4 === vorhersage4, "Aufgabe 4 korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: any in einer Berechnung
// ═══════════════════════════════════════════════════════════════════════════

const aufgabe5: any = true;
const ergebnis5 = aufgabe5 + 1;
const vorhersage5: number = 2;

// WARUM: JavaScript konvertiert Booleans bei arithmetischen Operationen:
// true  → 1
// false → 0
// Also: true + 1 = 1 + 1 = 2
//
// TypeScript haette GEWARNT: "Operator '+' cannot be applied to types
// 'boolean' and 'number'". Aber "any" schaltet die Pruefung ab.
// Der Code laeuft, aber das Ergebnis ist wahrscheinlich nicht gewollt.

console.assert(ergebnis5 === vorhersage5, "Aufgabe 5 korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: BigInt vs Number Praezision
// ═══════════════════════════════════════════════════════════════════════════

const maxSafe = Number.MAX_SAFE_INTEGER;
const alsNumber = maxSafe + 1;
const alsNumberPlus2 = maxSafe + 2;
const vorhersage6: boolean = true; // Sie sind GLEICH!

// WARUM: Jenseits von MAX_SAFE_INTEGER (2^53 - 1) verliert number
// die Faehigkeit, zwischen aufeinanderfolgenden Ganzzahlen zu unterscheiden.
// maxSafe + 1 = 9007199254740992
// maxSafe + 2 = 9007199254740992 (GLEICH! Praezision verloren!)
//
// MIT BigInt:
// BigInt(maxSafe) + 1n = 9007199254740992n
// BigInt(maxSafe) + 2n = 9007199254740993n (KORREKT!)
//
// PRAXIS: Twitter/X Snowflake IDs, PostgreSQL bigint-Spalten, und
// Kryptographie brauchen BigInt oder String-Darstellungen.

console.assert((alsNumber === alsNumberPlus2) === vorhersage6, "Aufgabe 6 korrekt");

// Beweis mit BigInt:
const bigMaxSafe = BigInt(maxSafe);
console.log(`  BigInt: ${bigMaxSafe + 1n} !== ${bigMaxSafe + 2n}: ${bigMaxSafe + 1n !== bigMaxSafe + 2n}`);

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 7: let vs const — Typinferenz
// ═══════════════════════════════════════════════════════════════════════════

const konstant = "hallo";     // Typ: "hallo" (Literal Type)
let variabel = "hallo";       // Typ: string (breit)

let testVariabel = "hallo";
let konntZuweisen = false;
try {
  testVariabel = "welt";
  konntZuweisen = true;
} catch {
  konntZuweisen = false;
}

const vorhersage7: boolean = true; // Ja, let kann neu zugewiesen werden

// WARUM: let inferiert den breiten Typ (string), also ist jeder String
// zuweisbar. const inferiert den Literal Type ("hallo"), und const-
// Variablen koennen gar nicht neu zugewiesen werden (SyntaxError).
//
// Das ist "Type Widening": const + Primitiv = engster Typ (Literal),
// let = breiterer Typ (string/number/boolean).

console.assert(konntZuweisen === vorhersage7, "Aufgabe 7 korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 8: Nullish Coalescing vs Logical OR
// ═══════════════════════════════════════════════════════════════════════════

const wert1 = 0 || "default";     // "default" — 0 ist falsy!
const wert2 = 0 ?? "default";     // 0         — 0 ist NICHT nullish!
const wert3 = "" || "default";    // "default" — "" ist falsy!
const wert4 = "" ?? "default";    // ""        — "" ist NICHT nullish!

const vorhersage8a: string | number = "default";
const vorhersage8b: string | number = 0;
const vorhersage8c: string = "default";
const vorhersage8d: string = "";

// WARUM:
// || (Logical OR): Gibt den rechten Wert bei ALLEN falsy-Werten
//   Falsy: false, 0, -0, 0n, "", null, undefined, NaN
//
// ?? (Nullish Coalescing): Gibt den rechten Wert NUR bei null/undefined
//   Also: 0, "", false, NaN sind fuer ?? GUELTIGE Werte!
//
// PRAXIS-BUG: Wenn du port || 3000 schreibst und port === 0 ist,
// bekommst du 3000 statt 0! Verwende port ?? 3000.

console.assert(wert1 === vorhersage8a, "Aufgabe 8a korrekt");
console.assert(wert2 === vorhersage8b, "Aufgabe 8b korrekt");
console.assert(wert3 === vorhersage8c, "Aufgabe 8c korrekt");
console.assert(wert4 === vorhersage8d, "Aufgabe 8d korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 9: undefined vs null Verhalten
// ═══════════════════════════════════════════════════════════════════════════

const aufgabe9a = (null == undefined);      // true
const aufgabe9b = (null === undefined);     // false
const aufgabe9c = (null == 0);              // false
const aufgabe9d = (undefined == false);     // false

const vorhersage9a: boolean = true;
const vorhersage9b: boolean = false;
const vorhersage9c: boolean = false;
const vorhersage9d: boolean = false;

// WARUM:
// 9a: null == undefined ist TRUE — sie sind das einzige Paar das
//     mit == gleich ist, obwohl es verschiedene Typen sind.
// 9b: null === undefined ist FALSE — === vergleicht auch den Typ,
//     und typeof null === "object", typeof undefined === "undefined".
// 9c: null == 0 ist FALSE — null ist NUR == null und undefined!
// 9d: undefined == false ist FALSE — undefined ist auch NUR == null/undefined!
//
// PRAXIS: x == null ist ein idiomatisches Pattern das sowohl null als
// auch undefined abfaengt, OHNE andere falsy-Werte mitzunehmen.

console.assert(aufgabe9a === vorhersage9a, "Aufgabe 9a korrekt");
console.assert(aufgabe9b === vorhersage9b, "Aufgabe 9b korrekt");
console.assert(aufgabe9c === vorhersage9c, "Aufgabe 9c korrekt");
console.assert(aufgabe9d === vorhersage9d, "Aufgabe 9d korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 10: as const — das Objekt-Raetsel
// ═══════════════════════════════════════════════════════════════════════════

const ohneConst = { name: "Max", alter: 25 };
const mitConst = { name: "Max", alter: 25 } as const;

let konntAendern = false;
try {
  ohneConst.name = "Anna";
  konntAendern = true;
} catch {
  konntAendern = false;
}

const vorhersage10: boolean = true; // Ja, OHNE as const kann man aendern!

// WARUM: const schuetzt nur die VARIABLE (du kannst ohneConst nicht
// auf ein anderes Objekt zeigen lassen), aber die PROPERTIES sind
// veraenderbar. Das ist ein fundamentaler Unterschied in JavaScript:
//
// const x = { a: 1 };
// x = { a: 2 };     // Error! (const schuetzt die Bindung)
// x.a = 2;          // OK!    (Properties sind frei)
//
// Mit "as const" werden alle Properties zu "readonly" + Literal Types:
// mitConst.name = "Anna"; // Error: Cannot assign to 'name' — read-only!

console.assert(konntAendern === vorhersage10, "Aufgabe 10 korrekt");

// ═══════════════════════════════════════════════════════════════════════════
// ERGEBNIS
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n--- Predict the Output: Alle Loesungen korrekt! ---");
console.log("\nDie wichtigsten Erkenntnisse:");
console.log("  1. typeof null === 'object'     — historischer Bug, nie gefixt");
console.log("  2. 0.1 + 0.2 !== 0.3            — IEEE 754 Gleitkomma");
console.log("  3. NaN !== NaN                   — einziger Wert, der sich selbst ungleich ist");
console.log("  4. typeof NaN === 'number'       — NaN ist ein Number-Wert");
console.log("  5. true + 1 === 2                — implizite Konvertierung");
console.log("  6. MAX_SAFE + 1 === MAX_SAFE + 2 — Praezisionsverlust");
console.log("  7. let widenet den Typ            — Type Widening");
console.log("  8. ?? vs || bei 0 und ''          — Nullish vs Falsy");
console.log("  9. null == undefined, aber !== 0   — spezielles Gleichheitsverhalten");
console.log("  10. const schuetzt nicht Properties — nur die Bindung");
