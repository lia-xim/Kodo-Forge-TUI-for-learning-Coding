/**
 * Lektion 02 - Exercise 03: Type Narrowing Challenge
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-type-narrowing-challenge.ts
 *
 * In dieser Uebung geht es um den SICHEREN Umgang mit unknown.
 * Du musst Type Narrowing verwenden, um Werte sicher zu verarbeiten.
 *
 * Schwierigkeitsgrad: Mittel bis Fortgeschritten
 *
 * REGEL: Kein `any` und kein unsicheres `as` (Record<string, unknown> als
 *        Zwischenschritt ist erlaubt).
 *        Alles muss mit typeof, instanceof, oder anderen Pruefungen geloest werden.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfaches Type Narrowing
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion "beschreibe" die einen unknown-Wert nimmt
// und eine deutsche Beschreibung als string zurueckgibt:
//
// - string → "Text: <wert>"
// - number → "Zahl: <wert>" (auf 2 Dezimalstellen formatiert)
// - boolean → "Wahrheitswert: ja" oder "Wahrheitswert: nein"
// - null → "Kein Wert (null)"
// - undefined → "Kein Wert (undefined)"
// - alles andere → "Unbekannter Typ: <typeof>"

// TODO: Implementiere die Funktion
// function beschreibe(wert: unknown): string {
// }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Verschachtelte Objektvalidierung
// ═══════════════════════════════════════════════════════════════════════════

// Du empfaengst Daten von einer API als unknown.
// Schreibe einen Type Guard "istProdukt", der prueft ob die Daten
// einem Produkt entsprechen.

interface Produkt {
  name: string;
  preis: number;
  aufLager: boolean;
}

// TODO: Implementiere den Type Guard
// function istProdukt(daten: unknown): daten is Produkt {
// }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Type Narrowing mit mehreren Typen
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion "addiereSicher" die zwei unknown-Werte nimmt
// und versucht sie zu addieren:
//
// - Beide number → gibt ihre Summe zurueck
// - Beide string → gibt ihre Konkatenation zurueck
// - Beide bigint → gibt ihre Summe zurueck
// - Alles andere → gibt null zurueck
//
// KEIN "any" und KEIN "as" erlaubt!

// TODO: Implementiere die Funktion
// function addiereSicher(a: unknown, b: unknown): string | number | bigint | null {
// }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Sichere JSON-Verarbeitung
// ═══════════════════════════════════════════════════════════════════════════

// JSON.parse gibt "any" zurueck. Schreibe eine sichere Wrapper-Funktion
// "parseJSON" die:
// - Einen string entgegennimmt
// - Den String als JSON parsed
// - Den Typ unknown zurueckgibt (nicht any!)
// - Bei einem Parse-Fehler null zurueckgibt (nicht wirft!)

// TODO: Implementiere die Funktion
// function parseJSON(text: string): unknown {
// }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Exhaustive Type Guard
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du codest — erklaere kurz:
// 1. Was ist das Problem?
//    ___________________________________________________________
// 2. Welche TypeScript-Konzepte brauchst du?
//    ___________________________________________________________
// 3. In welcher Reihenfolge wuerdest du die Pruefungen durchfuehren?
//    ___________________________________________________________

// Schreibe eine Funktion "formatApiAntwort" die verschiedene API-Antworten
// verarbeitet. Die Antwort kommt als unknown und kann folgende Formen haben:
//
// Erfolg: { status: "success", data: string }
// Fehler: { status: "error", message: string, code: number }
// Laden:  { status: "loading" }
//
// Die Funktion soll zurueckgeben:
// - Erfolg: "Erfolg: <data>"
// - Fehler: "Fehler [<code>]: <message>"
// - Laden:  "Wird geladen..."
// - Ungueltig: "Unbekannte Antwort"
//
// Hinweis: Du brauchst mehrere verschachtelte Pruefungen.
// Tipp: Pruefe erst ob es ein Objekt ist, dann ob "status" existiert, usw.

// TODO: Implementiere die Funktion
// function formatApiAntwort(antwort: unknown): string {
// }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entferne die Kommentare wenn du die Aufgaben geloest hast
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test 1: beschreibe
console.assert(beschreibe("Hallo") === "Text: Hallo", "1a: String");
console.assert(beschreibe(3.14159) === "Zahl: 3.14", "1b: Number");
console.assert(beschreibe(true) === "Wahrheitswert: ja", "1c: Boolean true");
console.assert(beschreibe(false) === "Wahrheitswert: nein", "1d: Boolean false");
console.assert(beschreibe(null) === "Kein Wert (null)", "1e: null");
console.assert(beschreibe(undefined) === "Kein Wert (undefined)", "1f: undefined");
console.assert(beschreibe({}) === "Unbekannter Typ: object", "1g: Objekt");

// Test 2: istProdukt
console.assert(istProdukt({ name: "Laptop", preis: 999, aufLager: true }) === true, "2a: Gueltiges Produkt");
console.assert(istProdukt({ name: "Laptop", preis: "999" }) === false, "2b: preis ist string");
console.assert(istProdukt({ name: "Laptop" }) === false, "2c: Fehlende Felder");
console.assert(istProdukt(null) === false, "2d: null");
console.assert(istProdukt("Laptop") === false, "2e: String");
console.assert(istProdukt({ name: 42, preis: 999, aufLager: true }) === false, "2f: name ist number");

// Test 3: addiereSicher
console.assert(addiereSicher(10, 20) === 30, "3a: number + number");
console.assert(addiereSicher("Hallo ", "Welt") === "Hallo Welt", "3b: string + string");
console.assert(addiereSicher(10n, 20n) === 30n, "3c: bigint + bigint");
console.assert(addiereSicher(10, "20") === null, "3d: Gemischt → null");
console.assert(addiereSicher(true, false) === null, "3e: boolean → null");

// Test 4: parseJSON
console.assert(typeof parseJSON('{"a": 1}') === "object", "4a: Gueltiges JSON");
console.assert(parseJSON("ungueltig!!!") === null, "4b: Ungueltiges JSON");
console.assert(parseJSON('42') === 42, "4c: Zahl-JSON");
console.assert(parseJSON('"hallo"') === "hallo", "4d: String-JSON");

// Test 5: formatApiAntwort
console.assert(
  formatApiAntwort({ status: "success", data: "Daten geladen" }) === "Erfolg: Daten geladen",
  "5a: Erfolg"
);
console.assert(
  formatApiAntwort({ status: "error", message: "Nicht gefunden", code: 404 }) === "Fehler [404]: Nicht gefunden",
  "5b: Fehler"
);
console.assert(
  formatApiAntwort({ status: "loading" }) === "Wird geladen...",
  "5c: Laden"
);
console.assert(
  formatApiAntwort({ status: "????" }) === "Unbekannte Antwort",
  "5d: Unbekannter Status"
);
console.assert(
  formatApiAntwort("Kein Objekt") === "Unbekannte Antwort",
  "5e: Kein Objekt"
);

console.log("\n Alle Tests bestanden! Gut gemacht!");
*/

console.log("Entferne die Kommentare um die Tests auszufuehren,");
console.log("nachdem du alle TODO-Aufgaben geloest hast.");
console.log("\nHINWEIS: Kein 'any' und kein unsicheres 'as' erlaubt! (Record<string, unknown> als Zwischenschritt ist OK)");
