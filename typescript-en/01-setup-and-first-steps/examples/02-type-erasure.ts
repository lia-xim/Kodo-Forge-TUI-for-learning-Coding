// ============================================================
// Beispiel 02: Type Erasure -- Typen verschwinden spurlos
// ============================================================
//
// Das ist eines der wichtigsten Konzepte in TypeScript:
// ALLE Typen werden bei der Kompilierung entfernt.
// Zur Laufzeit existiert kein einziger TypeScript-Typ mehr.
//
// Ausfuehren mit: tsx examples/02-type-erasure.ts
// ============================================================

// -----------------------------------------------------------
// 1. typeof zur Laufzeit vs. TypeScript-Typen
// -----------------------------------------------------------

// JavaScript hat seinen eigenen typeof-Operator, der zur
// LAUFZEIT funktioniert. Dieser hat NICHTS mit TypeScript zu tun.

let wert: number = 42;

// typeof zur Laufzeit -- das ist JavaScript, kein TypeScript:
console.log("=== typeof zur Laufzeit ===");
console.log(`typeof wert: "${typeof wert}"`); // "number"
console.log(`typeof "Hallo": "${typeof "Hallo"}"`); // "string"
console.log(`typeof true: "${typeof true}"`); // "boolean"
console.log(`typeof undefined: "${typeof undefined}"`); // "undefined"
console.log(`typeof null: "${typeof null}"`); // "object" (historischer Bug in JS!)
console.log(`typeof {}: "${typeof {}}"`); // "object"
console.log(`typeof []: "${typeof []}"`); // "object" (Arrays sind Objekte!)

// JavaScript kennt nur diese typeof-Ergebnisse:
// "string", "number", "boolean", "undefined", "object",
// "function", "symbol", "bigint"
//
// JavaScript kennt NICHT:
// "string[]", "Person", "MyInterface", "number | string", etc.
// Das sind alles TypeScript-Konstrukte, die zur Laufzeit nicht
// existieren.

// -----------------------------------------------------------
// 2. Interfaces verschwinden komplett
// -----------------------------------------------------------

console.log("\n=== Interfaces zur Laufzeit ===");

// Dieses Interface existiert NUR fuer den TypeScript-Compiler:
interface Fahrzeug {
  marke: string;
  baujahr: number;
  elektrisch: boolean;
}

// Dieses Objekt erfuellt das Interface:
const meinAuto: Fahrzeug = {
  marke: "VW",
  baujahr: 2023,
  elektrisch: true,
};

// Zur Laufzeit ist meinAuto ein ganz normales JavaScript-Objekt:
console.log(`typeof meinAuto: "${typeof meinAuto}"`); // "object"
console.log(`Ist es ein Fahrzeug? Keine Ahnung!`);
console.log(`JavaScript weiss nichts von "Fahrzeug".`);

// Du KANNST NICHT pruefen, ob ein Objekt ein bestimmtes
// Interface implementiert:
//
//   if (meinAuto instanceof Fahrzeug) { ... }
//   //  Fehler! 'Fahrzeug' only refers to a type, but is
//   //  being used as a value here.
//
// Warum? Weil Interfaces zur Laufzeit nicht existieren.
// instanceof braucht etwas, das zur Laufzeit da ist (eine Klasse,
// eine Konstruktorfunktion).

// Was du stattdessen tun kannst -- Property-Pruefung:
function istFahrzeug(obj: unknown): obj is Fahrzeug {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "marke" in obj &&
    "baujahr" in obj &&
    "elektrisch" in obj
  );
}

console.log(`istFahrzeug(meinAuto): ${istFahrzeug(meinAuto)}`); // true
console.log(`istFahrzeug({name: "X"}): ${istFahrzeug({ name: "X" })}`); // false

// -----------------------------------------------------------
// 3. Type Aliases verschwinden genauso
// -----------------------------------------------------------

console.log("\n=== Type Aliases zur Laufzeit ===");

// Auch type-Aliase existieren nur im Compiler:
type Koordinate = {
  x: number;
  y: number;
};

type Ergebnis = "erfolg" | "fehler" | "ausstehend";

const punkt: Koordinate = { x: 10, y: 20 };
const status1: Ergebnis = "erfolg";

// Zur Laufzeit:
console.log(`typeof punkt: "${typeof punkt}"`); // "object"
console.log(`typeof status1: "${typeof status1}"`); // "string"
// "Koordinate" und "Ergebnis" gibt es zur Laufzeit nicht.

// -----------------------------------------------------------
// 4. Generics verschwinden
// -----------------------------------------------------------

console.log("\n=== Generics zur Laufzeit ===");

// Generics sind ein maechtig wirkendes Feature, aber sie
// verschwinden komplett:

function erstes<T>(array: T[]): T | undefined {
  return array[0];
}

// TypeScript weiss: ersteZahl ist number | undefined
const ersteZahl = erstes([10, 20, 30]);

// TypeScript weiss: ersterName ist string | undefined
const ersterName = erstes(["Anna", "Ben", "Clara"]);

console.log(`Erstes Element (Zahlen): ${ersteZahl}`);
console.log(`Erstes Element (Namen): ${ersterName}`);

// Nach der Kompilierung sieht die Funktion so aus:
//
//   function erstes(array) {
//     return array[0];
//   }
//
// Kein <T>, kein T[], kein T | undefined. Alles weg.

// -----------------------------------------------------------
// 5. Beweis: Erzeugte JavaScript-Ausgabe
// -----------------------------------------------------------

console.log("\n=== Beweis: Was bei der Kompilierung passiert ===");

// Hier ist eine Funktion mit vielen TypeScript-Features:
interface Benutzer {
  id: number;
  name: string;
  aktiv: boolean;
}

type BenutzerListe = Benutzer[];

function findeAktiveBenutzer(benutzer: BenutzerListe): Benutzer[] {
  return benutzer.filter((b: Benutzer) => b.aktiv);
}

const alleBenutzer: BenutzerListe = [
  { id: 1, name: "Anna", aktiv: true },
  { id: 2, name: "Ben", aktiv: false },
  { id: 3, name: "Clara", aktiv: true },
];

const aktive = findeAktiveBenutzer(alleBenutzer);
console.log("Aktive Benutzer:", aktive.map((b) => b.name));

// Nach der Kompilierung (tsc) wird daraus:
//
//   function findeAktiveBenutzer(benutzer) {
//     return benutzer.filter(function (b) { return b.aktiv; });
//   }
//
//   var alleBenutzer = [
//     { id: 1, name: "Anna", aktiv: true },
//     { id: 2, name: "Ben", aktiv: false },
//     { id: 3, name: "Clara", aktiv: true },
//   ];
//
//   var aktive = findeAktiveBenutzer(alleBenutzer);
//
// Beachte:
//   - interface Benutzer: KOMPLETT WEG
//   - type BenutzerListe: KOMPLETT WEG
//   - : Benutzer[], : BenutzerListe: WEG
//   - (b: Benutzer) => ...: wird zu (b) => ...
//   - Nur der funktionale Code bleibt.

// -----------------------------------------------------------
// 6. Was NICHT von Type Erasure betroffen ist
// -----------------------------------------------------------

console.log("\n=== Was NICHT entfernt wird ===");

// Enums erzeugen tatsaechlich JavaScript-Code:
enum Farbe {
  Rot = "ROT",
  Gruen = "GRUEN",
  Blau = "BLAU",
}

console.log(`Farbe.Rot: "${Farbe.Rot}"`); // "ROT"
console.log(`typeof Farbe: "${typeof Farbe}"`); // "object"

// Enums sind die AUSNAHME! Sie existieren auch zur Laufzeit,
// weil TypeScript fuer sie echten JavaScript-Code erzeugt.
//
// Deshalb bevorzugen manche Entwickler `as const`-Objekte:
const FarbenConst = {
  Rot: "ROT",
  Gruen: "GRUEN",
  Blau: "BLAU",
} as const;

// Das ist reines JavaScript und verhaelt sich vorhersagbarer.

// -----------------------------------------------------------
// Zusammenfassung
// -----------------------------------------------------------
//
// Was zur Laufzeit VERSCHWINDET:
//   - interface-Deklarationen
//   - type-Aliase
//   - Typ-Annotationen (: string, : number, etc.)
//   - Generics (<T>, <K, V>)
//   - as-Casts (x as string)
//
// Was zur Laufzeit BLEIBT:
//   - Aller JavaScript-Code
//   - enum-Deklarationen (erzeugen JS-Objekte)
//   - class-Deklarationen (sind JS-Features)
//   - Decorator-Metadaten (experimentell)
//
// Merke: TypeScript ist ein Werkzeug fuer Entwickler, nicht
// fuer die JavaScript-Engine!
