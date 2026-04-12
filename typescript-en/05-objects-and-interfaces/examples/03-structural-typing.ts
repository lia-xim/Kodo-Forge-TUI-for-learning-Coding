export {};

/**
 * Lektion 05 - Beispiel 03: Structural Typing (Deep Dive)
 *
 * DAS WICHTIGSTE KONZEPT DIESER LEKTION!
 *
 * TypeScript verwendet Structural Typing (auch "Duck Typing" genannt):
 * "Wenn es wie eine Ente aussieht und wie eine Ente quakt, dann ist es eine Ente."
 *
 * Das bedeutet: TypeScript prueft die STRUKTUR eines Objekts, nicht seinen NAMEN.
 *
 * Ausfuehren: npx tsx examples/03-structural-typing.ts
 */

// ─── 1. Grundprinzip: Struktur zaehlt, nicht der Name ─────────────────────

interface Punkt2D {
  x: number;
  y: number;
}

interface Position {
  x: number;
  y: number;
}

// Punkt2D und Position haben VERSCHIEDENE NAMEN, aber die GLEICHE STRUKTUR.
// Fuer TypeScript sind sie daher kompatibel!

const punkt: Punkt2D = { x: 10, y: 20 };
const position: Position = punkt; // OK! Gleiche Struktur.

console.log("=== Grundprinzip ===");
console.log("Punkt als Position:", position);

// In Java/C# waere das ein Fehler -- dort zaehlt der Typname (Nominal Typing).
// In TypeScript zaehlt nur die Struktur.

// ─── 2. Extra Properties sind OK (bei Variablen) ──────────────────────────

interface HatNamen {
  name: string;
}

// Dieses Objekt hat MEHR Properties als HatNamen verlangt
const person = {
  name: "Max",
  alter: 30,
  email: "max@test.de",
  hobbys: ["TypeScript", "Kochen"],
};

// Trotzdem ist die Zuweisung OK -- person hat mindestens 'name: string'
const benannt: HatNamen = person;

console.log("\n=== Extra Properties erlaubt ===");
console.log(`benannt.name: ${benannt.name}`);
// console.log(benannt.alter);  // Fehler! HatNamen kennt 'alter' nicht

// WICHTIG: Ueber die Variable 'benannt' kannst du NUR auf 'name' zugreifen,
// obwohl das echte Objekt mehr Properties hat. Das ist typsicher!

// ─── 3. Funktionsparameter und Structural Typing ──────────────────────────

interface Druckbar {
  toString(): string;
}

function druckeAus(item: Druckbar): void {
  console.log(`Ausgabe: ${item.toString()}`);
}

// ALLE diese Aufrufe sind gueltig, weil alle Objekte toString() haben:
console.log("\n=== Funktionsparameter ===");
druckeAus({ toString: () => "Hallo Welt" });
const druckItem = { toString: () => "42", extraProp: true };
druckeAus(druckItem); // Extra Property OK, weil ueber Variable
druckeAus(42); // Zahlen haben toString()
druckeAus("Text"); // Strings haben toString()
druckeAus([1, 2, 3]); // Arrays haben toString()

// ─── 4. Excess Property Checking -- Die Ausnahme! ────────────────────────

interface Konfiguration {
  host: string;
  port: number;
}

// FEHLER bei frischem Object Literal:
// const config: Konfiguration = {
//   host: "localhost",
//   port: 3000,
//   debug: true,    // Error: 'debug' does not exist in type 'Konfiguration'
// };

// OK ueber Variable:
const serverDaten = {
  host: "localhost",
  port: 3000,
  debug: true,
  logLevel: "verbose",
};
const config: Konfiguration = serverDaten; // Kein Fehler!

console.log("\n=== Excess Property Checking ===");
console.log(`Config: ${config.host}:${config.port}`);

// ─── 5. Warum Excess Property Checking existiert ──────────────────────────

// Stell dir vor, du hast einen Tippfehler:
interface ButtonOptionen {
  label: string;
  color: string;
  disabled?: boolean;
}

// OHNE Excess Property Checking wuerde dieser Tippfehler durchrutschen:
// const btn: ButtonOptionen = {
//   label: "Klick mich",
//   colour: "red",     // Tippfehler! 'colour' statt 'color'
//   disabled: false,
// };
// --> 'color' wuerde fehlen und 'colour' wuerde ignoriert!

// MIT Excess Property Checking bekommst du einen Fehler. Gut so!

// ─── 6. Ueberraschende Beispiele ──────────────────────────────────────────

console.log("\n=== Ueberraschende Beispiele ===");

// Beispiel 1: Leeres Interface akzeptiert ALLES (fast)
interface Leer {}

const a: Leer = { x: 1, y: 2 }; // Ueber Variable: OK
const b: Leer = 42; // Sogar Zahlen! (haben keine fehlenden Props)
const c: Leer = "hello"; // Strings auch!
const d: Leer = [1, 2, 3]; // Arrays auch!
// const e: Leer = null;      // NUR null und undefined nicht (mit strictNullChecks)

console.log("Leeres Interface akzeptiert:", typeof a, typeof b, typeof c);

// Beispiel 2: Mehr Properties = speziellerer Typ
interface Basis {
  id: number;
}

interface Erweitert {
  id: number;
  name: string;
  email: string;
}

// Erweitert ist ein SUBTYP von Basis (hat alles was Basis hat + mehr)
const erweitert: Erweitert = { id: 1, name: "Max", email: "max@test.de" };
const basis: Basis = erweitert; // OK! Erweitert "ist ein" Basis

// Aber NICHT umgekehrt:
// const zurueck: Erweitert = basis;  // Fehler! Basis hat nicht name und email

console.log(`Basis ID: ${basis.id}`);

// Beispiel 3: Structural Typing mit Funktionen
interface HatLaenge {
  length: number;
}

function zeigelaenge(item: HatLaenge): void {
  console.log(`Laenge: ${item.length}`);
}

// Alles mit 'length: number' funktioniert:
zeigelaenge("Hallo"); // string hat length
zeigelaenge([1, 2, 3]); // Array hat length
const eigenesObjekt = { length: 42, anderesProp: true };
zeigelaenge(eigenesObjekt); // Eigenes Objekt via Variable

// ─── 7. Structural Typing vs. Nominal Typing ─────────────────────────────

// In TypeScript:
interface Euro {
  betrag: number;
}
interface Dollar {
  betrag: number;
}

const preis: Euro = { betrag: 100 };
const kosten: Dollar = preis; // OK! Gleiche Struktur.

// Das ist ein PROBLEM! Du kannst versehentlich Euro mit Dollar mischen.
// In Java/C# waere das ein Fehler (verschiedene Typen).
//
// Loesung: "Branded Types" -- kommt in Lektion 24!
// Vorschau:
// type Euro = number & { readonly __brand: 'EUR' };
// type Dollar = number & { readonly __brand: 'USD' };

console.log("\n=== Structural = kompatibel ===");
console.log(`Euro: ${preis.betrag}, Dollar: ${kosten.betrag} -- gleiche Struktur!`);

// ─── 8. Zusammenfassung ───────────────────────────────────────────────────

console.log("\n=== ZUSAMMENFASSUNG: Structural Typing Regeln ===");
console.log("1. TypeScript prueft STRUKTUR, nicht NAMEN");
console.log("2. Extra Properties bei Variablen-Zuweisung: ERLAUBT");
console.log("3. Extra Properties bei frischen Object Literals: FEHLER (Excess Check)");
console.log("4. Mehr Properties = speziellerer Typ (Subtyp)");
console.log("5. Leeres Interface {} akzeptiert fast alles");
console.log("6. Gleiche Struktur = kompatibel (auch wenn Namen verschieden)");
