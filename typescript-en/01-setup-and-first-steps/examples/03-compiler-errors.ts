// ============================================================
// Beispiel 03: Haeufige Compiler-Fehler
// ============================================================
//
// Hier zeigen wir die haeufigsten TypeScript-Fehler und
// erklaeren, was sie bedeuten und wie man sie behebt.
//
// Jeder Fehler ist mit @ts-expect-error markiert, damit die
// Datei trotzdem kompiliert. Entferne die Markierung, um den
// echten Fehler zu sehen!
//
// Ausfuehren mit: tsx examples/03-compiler-errors.ts
// ============================================================

console.log("=== Haeufige TypeScript-Compiler-Fehler ===\n");

// -----------------------------------------------------------
// Fehler 1: Falscher Typ zugewiesen
// TS2322: Type 'X' is not assignable to type 'Y'
// -----------------------------------------------------------

console.log("Fehler 1: Falscher Typ zugewiesen (TS2322)");

let benutzername: string = "Anna";

// @ts-expect-error — number ist nicht an string zuweisbar
benutzername = 42;
// Erklaerung: Die Variable wurde als string deklariert.
// Du kannst ihr keine number zuweisen.
// Loesung: Verwende den richtigen Typ oder aendere die
// Deklaration zu `string | number`, wenn beides moeglich sein soll.

console.log("  -> Fix: Entweder string zuweisen oder Typ erweitern\n");

// -----------------------------------------------------------
// Fehler 2: Property existiert nicht
// TS2339: Property 'X' does not exist on type 'Y'
// -----------------------------------------------------------

console.log("Fehler 2: Property existiert nicht (TS2339)");

interface Hund {
  name: string;
  rasse: string;
  alter: number;
}

const bello: Hund = { name: "Bello", rasse: "Labrador", alter: 5 };

// @ts-expect-error — 'farbe' existiert nicht auf dem Typ 'Hund'
console.log(bello.farbe);
// Erklaerung: Das Interface Hund hat kein Property 'farbe'.
// TypeScript schuetzt dich vor Tippfehlern und Zugriff auf
// nicht-existierende Werte.
// Loesung: Fuege 'farbe' zum Interface hinzu oder korrigiere
// den Property-Namen.

console.log("  -> Fix: Property zum Interface hinzufuegen\n");

// -----------------------------------------------------------
// Fehler 3: Falsche Anzahl an Argumenten
// TS2554: Expected X arguments, but got Y
// -----------------------------------------------------------

console.log("Fehler 3: Falsche Anzahl an Argumenten (TS2554)");

function multipliziere(a: number, b: number): number {
  return a * b;
}

// @ts-expect-error — Erwartet 2 Argumente, aber 1 erhalten
multipliziere(5);

// @ts-expect-error — Erwartet 2 Argumente, aber 3 erhalten
multipliziere(5, 3, 1);

console.log(`  multipliziere(5, 3) = ${multipliziere(5, 3)}`);
console.log("  -> Fix: Korrekte Anzahl an Argumenten uebergeben\n");

// -----------------------------------------------------------
// Fehler 4: Fehlende Properties bei Objekt-Zuweisung
// TS2741: Property 'X' is missing in type 'Y'
// -----------------------------------------------------------

console.log("Fehler 4: Fehlende Properties (TS2741)");

interface Adresse {
  strasse: string;
  hausnummer: number;
  plz: string;
  ort: string;
}

// @ts-expect-error — 'plz' und 'ort' fehlen
const meineAdresse: Adresse = {
  strasse: "Hauptstrasse",
  hausnummer: 42,
};
// Erklaerung: Das Objekt muss ALLE Pflicht-Properties des
// Interfaces haben. Du kannst ein Property optional machen,
// indem du `?` anfuegst: `ort?: string`.

console.log("  -> Fix: Alle Pflicht-Properties angeben\n");

// -----------------------------------------------------------
// Fehler 5: Falscher Argument-Typ
// TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
// -----------------------------------------------------------

console.log("Fehler 5: Falscher Argument-Typ (TS2345)");

function begruessung(name: string): string {
  return `Hallo, ${name}!`;
}

// @ts-expect-error — number ist nicht an string zuweisbar
begruessung(123);
// Erklaerung: Die Funktion erwartet einen string, bekommt
// aber eine number.

console.log(`  begruessung("Welt") = "${begruessung("Welt")}"`);
console.log("  -> Fix: Richtigen Typ uebergeben\n");

// -----------------------------------------------------------
// Fehler 6: Object is possibly 'undefined'
// TS2532: Object is possibly 'undefined'
// -----------------------------------------------------------

console.log("Fehler 6: Moeglicherweise undefined (TS2532)");

interface Konfiguration {
  datenbank?: {
    host: string;
    port: number;
  };
}

const config: Konfiguration = {};

// @ts-expect-error — config.datenbank koennte undefined sein
console.log(config.datenbank.host);
// Erklaerung: Da 'datenbank' optional ist (?), koennte es
// undefined sein. Du musst pruefen, ob es existiert.
// Loesungen:
//   1. Optional Chaining: config.datenbank?.host
//   2. if-Pruefung: if (config.datenbank) { ... }
//   3. Non-null Assertion: config.datenbank!.host (unsicher!)

console.log(`  config.datenbank?.host = ${config.datenbank?.host}`);
console.log("  -> Fix: Optional Chaining (?.) verwenden\n");

// -----------------------------------------------------------
// Fehler 7: Typ 'any' implizit
// TS7006: Parameter 'X' implicitly has an 'any' type
// -----------------------------------------------------------

console.log("Fehler 7: Implizites 'any' (TS7006)");

// Mit strict: true (noImplicitAny) wuerde diese Funktion
// einen Fehler erzeugen:

// @ts-expect-error — Parameter 'x' hat implizit den Typ 'any'
function verdoppeln(x): number {
  return x * 2;
}
// Erklaerung: Ohne Typ-Annotation weiss TypeScript nicht, was
// 'x' ist. Im Strict-Mode ist das ein Fehler.
// Loesung: function verdoppeln(x: number): number { ... }

console.log(`  Fix: Typ-Annotation hinzufuegen`);
console.log(`  verdoppeln(5) wuerde ${5 * 2} ergeben\n`);

// -----------------------------------------------------------
// Fehler 8: Nicht alle Pfade geben einen Wert zurueck
// TS7030: Not all code paths return a value
// -----------------------------------------------------------

console.log("Fehler 8: Nicht alle Code-Pfade (TS7030)");

// @ts-expect-error — Nicht alle Pfade geben einen Wert zurueck
function teile(a: number, b: number): number {
  if (b !== 0) {
    return a / b;
  }
  // Was passiert, wenn b === 0?
  // Hier fehlt ein return-Statement!
}
// Erklaerung: Die Funktion verspricht, immer eine number
// zurueckzugeben, aber wenn b === 0 ist, gibt sie undefined
// zurueck.
// Loesung: throw new Error("Division durch Null!") oder
// return 0 oder return NaN hinzufuegen.

console.log("  -> Fix: Alle Pfade muessen einen Wert zurueckgeben\n");

// -----------------------------------------------------------
// Fehler 9: Typ-Assertion auf inkompatiblen Typ
// TS2352: Conversion of type 'X' to type 'Y' may be a mistake
// -----------------------------------------------------------

console.log("Fehler 9: Ungueltige Typ-Assertion (TS2352)");

// @ts-expect-error — string kann nicht direkt zu number gecastet werden
const zahl: number = "hello" as number;
// Erklaerung: TypeScript erlaubt Typ-Assertions nur, wenn die
// Typen irgendwie kompatibel sind. string und number sind es nicht.
// Du kannst es erzwingen mit: "hello" as unknown as number
// Aber das ist fast immer ein Zeichen fuer ein Design-Problem.

console.log("  -> Fix: Richtigen Typ verwenden statt casten\n");

// -----------------------------------------------------------
// Zusammenfassung der haeufigsten Fehlercodes
// -----------------------------------------------------------

console.log("=== Zusammenfassung: Haeufige Fehlercodes ===");
console.log("  TS2322: Falscher Typ zugewiesen");
console.log("  TS2339: Property existiert nicht");
console.log("  TS2345: Falscher Argument-Typ");
console.log("  TS2554: Falsche Anzahl an Argumenten");
console.log("  TS2532: Moeglicherweise undefined/null");
console.log("  TS2741: Fehlende Properties");
console.log("  TS7006: Implizites 'any'");
console.log("  TS7030: Nicht alle Pfade geben Wert zurueck");
console.log("  TS2352: Ungueltige Typ-Assertion");
console.log("\nTipp: Google den Fehlercode (z.B. 'TS2322') fuer Details!");
