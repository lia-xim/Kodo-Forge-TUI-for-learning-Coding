/**
 * Lektion 02 - Example 01: string, number, boolean
 *
 * Ausfuehren mit: npx tsx examples/01-string-number-boolean.ts
 *
 * Die drei grundlegendsten primitiven Typen in TypeScript.
 * Hier lernst du die Nuancen, die viele Entwickler uebersehen.
 */

// ─── STRING ─────────────────────────────────────────────────────────────────

// Einfache String-Deklarationen
const vorname: string = "Matthias";
const nachname: string = 'Mueller';  // Einfache oder doppelte Anfuehrungszeichen

// Template Literals — besonders maechtig in TypeScript
const begruessung: string = `Hallo, ${vorname} ${nachname}!`;
console.log(begruessung);  // "Hallo, Matthias Mueller!"

// Mehrzeilige Strings mit Template Literals
const adresse: string = `
  Musterstrasse 42
  12345 Berlin
  Deutschland
`;

// Template Literal Types — ein Vorgeschmack auf fortgeschrittene Typen
// TypeScript kann Strings auf Type-Ebene manipulieren!
type EventName = `on${string}`;
const click: EventName = "onClick";    // OK
const hover: EventName = "onHover";    // OK
// const bad: EventName = "click";     // Error! Muss mit "on" anfangen

// String-Methoden funktionieren wie erwartet
const laut: string = vorname.toUpperCase();
const leise: string = vorname.toLowerCase();
const laenge: number = vorname.length;       // length ist number, nicht string!

console.log(`${vorname}: Laenge=${laenge}, GROSS=${laut}, klein=${leise}`);

// ─── NUMBER ─────────────────────────────────────────────────────────────────

// number ist IMMER ein 64-bit IEEE 754 Gleitkommazahl
// Es gibt keinen Unterschied zwischen int und float!
const ganzzahl: number = 42;
const dezimal: number = 3.14;
const negativ: number = -100;

// Verschiedene Zahlendarstellungen
const hex: number = 0xff;           // 255
const binaer: number = 0b11111111;  // 255
const oktal: number = 0o377;        // 255

console.log(`hex=${hex}, binaer=${binaer}, oktal=${oktal}`);
// Alle drei sind 255!

// DIE KLASSISCHE FALLE: Gleitkomma-Praezision
console.log("\n--- Gleitkomma-Praezision ---");
console.log(`0.1 + 0.2 = ${0.1 + 0.2}`);           // 0.30000000000000004
console.log(`0.1 + 0.2 === 0.3? ${0.1 + 0.2 === 0.3}`); // false!

// Loesung fuer Vergleiche: Epsilon-Vergleich
const EPSILON = Number.EPSILON;
const istGleich = Math.abs(0.1 + 0.2 - 0.3) < EPSILON;
console.log(`Mit Epsilon-Vergleich: ${istGleich}`);  // true

// Spezielle number-Werte
const unendlich: number = Infinity;
const negativUnendlich: number = -Infinity;
const keineZahl: number = NaN;  // "Not a Number" ist eine number! Ironisch.

console.log("\n--- Spezielle Werte ---");
console.log(`Infinity ist number: ${typeof Infinity === "number"}`);    // true
console.log(`NaN ist number: ${typeof NaN === "number"}`);              // true
console.log(`NaN === NaN: ${NaN === NaN}`);                             // false! NaN ist nie gleich sich selbst
console.log(`Number.isNaN(NaN): ${Number.isNaN(NaN)}`);                // true — der sichere Weg

// Sichere Ganzzahl-Grenzen
console.log("\n--- Ganzzahl-Grenzen ---");
console.log(`MAX_SAFE_INTEGER: ${Number.MAX_SAFE_INTEGER}`);   // 9007199254740991
console.log(`MIN_SAFE_INTEGER: ${Number.MIN_SAFE_INTEGER}`);   // -9007199254740991

// Jenseits der sicheren Grenze verliert number Praezision
const gross = 9007199254740991;
console.log(`${gross} + 1 = ${gross + 1}`);  // 9007199254740992 — OK
console.log(`${gross} + 2 = ${gross + 2}`);  // 9007199254740992 — FALSCH! Gleich wie +1!

// ─── BOOLEAN ────────────────────────────────────────────────────────────────

const istAktiv: boolean = true;
const istFertig: boolean = false;

// TypeScript erzwingt echte booleans — kein "truthy/falsy" Unsinn
function setzeStatus(aktiv: boolean): void {
  console.log(`Status: ${aktiv ? "aktiv" : "inaktiv"}`);
}

setzeStatus(true);     // OK
setzeStatus(false);    // OK
// setzeStatus(1);     // Error! Argument of type 'number' is not assignable to parameter of type 'boolean'
// setzeStatus("ja");  // Error! Argument of type 'string' is not assignable to parameter of type 'boolean'

// Wenn du wirklich einen truthy-Wert in boolean umwandeln willst:
const truthyWert: number = 42;
const alsBool: boolean = Boolean(truthyWert);   // true
const alsBool2: boolean = !!truthyWert;          // true (doppelte Negation)

console.log(`\n42 als boolean: ${alsBool}`);

// ─── WARUM KLEINBUCHSTABEN? string vs String ────────────────────────────────

console.log("\n--- string vs String ---");

// string (klein) = primitiver Typ — DAS WILLST DU
const primitiv: string = "hallo";

// String (gross) = Wrapper-Objekt — DAS WILLST DU NICHT
const objekt: String = new String("hallo");

// Der Unterschied:
console.log(`typeof primitiv: ${typeof primitiv}`);   // "string"
console.log(`typeof objekt: ${typeof objekt}`);        // "object" !!!

// Vergleich zeigt das Problem:
console.log(`primitiv === "hallo": ${primitiv === "hallo"}`);                    // true
console.log(`objekt === "hallo": ${objekt === "hallo" as unknown}`);             // false! Objekt !== Primitiv

// TypeScript warnt:
// let falsch: string = new String("hallo");  // Error! String ist nicht string zuweisbar

// MERKE: Immer die Kleinbuchstaben-Variante verwenden:
// string, number, boolean — NICHT String, Number, Boolean

// ─── LITERAL TYPES — ein Vorgeschmack ──────────────────────────────────────

// TypeScript kann Typen auf einen bestimmten WERT einschraenken
const exakt: "hallo" = "hallo";  // Nur "hallo" ist gueltig
// exakt = "welt";  // Error! "welt" ist nicht "hallo"

// Mit let wird der Typ breiter:
let breit = "hallo";    // TypeScript inferiert: string
const eng = "hallo";     // TypeScript inferiert: "hallo" (Literal Type)

// Das ist die Grundlage fuer Union Types (kommt in spaeteren Lektionen):
type Richtung = "nord" | "sued" | "ost" | "west";
let richtung: Richtung = "nord";  // Nur diese 4 Werte sind gueltig

console.log(`\nRichtung: ${richtung}`);
console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
