/**
 * Lektion 02 - Exercise 06: Fehlermeldungen lesen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/06-fehlermeldungen-lesen.ts
 *
 * In dieser Uebung lernst du, TypeScript-Fehlermeldungen zu LESEN und zu
 * VERSTEHEN. Jede Aufgabe enthaelt Code mit einem Typfehler.
 *
 * Fuer jede Aufgabe:
 * 1. Lies den Code und die Fehlermeldung im Kommentar
 * 2. Erklaere IN EIGENEN WORTEN was der Fehler bedeutet (im TODO-Kommentar)
 * 3. Fixe den Fehler
 *
 * Schwierigkeitsgrad: Mittel — trainiert das wichtigste Debugging-Skill
 *
 * WICHTIG: Die @ts-expect-error Kommentare unterdruecken die Fehler
 * temporaer. Wenn du den Fehler gefixt hast, ENTFERNE den @ts-expect-error
 * Kommentar — dann darf KEIN Fehler mehr kommen!
 */

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 1: Type 'string' is not assignable to type 'number'
// ═══════════════════════════════════════════════════════════════════════════

// Die Funktion soll das Alter einer Person zurueckgeben.
// Aber irgendwas stimmt nicht mit dem Rueckgabetyp.

function getAlter(): number {
  const geburtsjahr = 1995;
  const aktuellesJahr = 2026;

  // @ts-expect-error — Fehler hier! Lies die Meldung und fixe den Code.
  const alter: number = `${aktuellesJahr - geburtsjahr}`;
  return alter;
}

// TODO: Erklaere den Fehler in eigenen Worten:
// ___________________________________________
//
// TODO: Fixe den Fehler (Tipp: Template Literals erzeugen immer Strings!)

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 2: Argument of type 'string' is not assignable to parameter
//           of type '"GET" | "POST" | "PUT" | "DELETE"'
// ═══════════════════════════════════════════════════════════════════════════

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function sendRequest(method: HttpMethod, url: string): string {
  return `${method} ${url}`;
}

// Dieser Code sieht korrekt aus — aber TypeScript beschwert sich!

let method = "GET";

// @ts-expect-error — Fehler hier!
const result2 = sendRequest(method, "/api/users");

// TODO: Erklaere den Fehler in eigenen Worten:
// ___________________________________________
// Hinweis: Warum ist "GET" als let-Variable ein Problem?
// Was ist der Unterschied zum Literal Type "GET"?
//
// TODO: Fixe den Fehler (mindestens 2 verschiedene Loesungen moeglich!)

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 3: Object is possibly 'null'
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du fixst — erklaere kurz:
// 1. Was bedeutet "Object is possibly null"? ___
// 2. Warum erscheint dieser Fehler bei strictNullChecks? ___

function getNameLength(name: string | null): number {
  // @ts-expect-error — Fehler hier!
  return name.length;
}

// TODO: Erklaere den Fehler in eigenen Worten:
// ___________________________________________
// Hinweis: Was passiert zur Laufzeit wenn name === null ist?
//
// TODO: Fixe den Fehler (denke an null-Pruefung oder ??)

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 4: Property 'toFixed' does not exist on type 'string | number'
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du fixst — erklaere kurz:
// 1. Was bedeutet es, wenn eine Property auf einem Union Type nicht existiert? ___
// 2. Welche Methoden KANN man auf string | number aufrufen? ___

function formatWert(wert: string | number): string {
  // @ts-expect-error — Fehler hier!
  return wert.toFixed(2);
}

// TODO: Erklaere den Fehler in eigenen Worten:
// ___________________________________________
// Hinweis: toFixed existiert auf number, aber NICHT auf string.
// TypeScript erlaubt nur Methoden die auf ALLEN Typen im Union existieren.
//
// TODO: Fixe den Fehler (du brauchst Type Narrowing!)

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 5: Type 'undefined' is not assignable to type 'string'
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du fixst — erklaere kurz:
// 1. Was gibt Array.find() zurueck wenn es nichts findet? ___
// 2. Warum kann man das Ergebnis nicht direkt einem string zuweisen? ___

const namen = ["Max", "Anna", "Tim"];

function findeNamen(suchbegriff: string): string {
  // @ts-expect-error — Fehler hier!
  const gefunden: string = namen.find(n => n === suchbegriff);
  return gefunden;
}

// TODO: Erklaere den Fehler in eigenen Worten:
// ___________________________________________
// Hinweis: Array.find() gibt T | undefined zurueck — was wenn nichts gefunden wird?
//
// TODO: Fixe den Fehler (Tipp: Rueckgabetyp oder Fallback-Wert anpassen)

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 6: Type 'number' is not assignable to type 'never'
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du fixst — erklaere kurz:
// 1. Wann tritt der Typ "never" auf? ___
// 2. Was bedeutet es, wenn TypeScript sagt, ein Wert sei vom Typ never? ___

type Status = "aktiv" | "inaktiv" | "gesperrt";

function getStatusCode(status: Status): number {
  switch (status) {
    case "aktiv":
      return 1;
    case "inaktiv":
      return 0;
    // "gesperrt" fehlt!
  }

  // @ts-expect-error — Fehler hier!
  const exhaustive: never = status;
  return exhaustive;
}

// TODO: Erklaere den Fehler in eigenen Worten:
// ___________________________________________
// Hinweis: Der Exhaustive Check schlaegt fehl, weil ein case fehlt.
// TypeScript weiss: nach den behandelten Faellen ist status noch "gesperrt" —
// und "gesperrt" ist NICHT never zuweisbar.
//
// TODO: Fixe den Fehler (fuege den fehlenden case hinzu!)

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entferne die Kommentare wenn du die Aufgaben geloest hast
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test 1: Alter berechnen
console.assert(getAlter() === 31, "Fehler 1: Alter muss 31 sein");

// Test 2: HTTP Request
console.assert(result2 === "GET /api/users", "Fehler 2: Request muss funktionieren");

// Test 3: Name Length
console.assert(getNameLength("Hallo") === 5, "Fehler 3a: Laenge von 'Hallo' ist 5");
console.assert(getNameLength(null) === 0, "Fehler 3b: Laenge von null ist 0");

// Test 4: Format Wert
console.assert(formatWert(3.14159) === "3.14", "Fehler 4a: Zahl formatieren");
console.assert(formatWert("hallo") === "hallo", "Fehler 4b: String durchreichen");

// Test 5: Name finden
console.assert(findeNamen("Max") === "Max", "Fehler 5a: Max finden");
console.assert(findeNamen("xyz") === "nicht gefunden", "Fehler 5b: Nicht gefunden");

// Test 6: Status Code
console.assert(getStatusCode("aktiv") === 1, "Fehler 6a: aktiv = 1");
console.assert(getStatusCode("inaktiv") === 0, "Fehler 6b: inaktiv = 0");
console.assert(getStatusCode("gesperrt") === -1, "Fehler 6c: gesperrt = -1");

console.log("\n Alle Fehlermeldungen verstanden und gefixt!");
*/

console.log("Entferne die Kommentare um die Tests auszufuehren,");
console.log("nachdem du alle Fehler gefixt hast.");
console.log("\nFuer jeden Fehler:");
console.log("  1. Lies die Fehlermeldung im Kommentar");
console.log("  2. Erklaere in EIGENEN WORTEN was sie bedeutet");
console.log("  3. Fixe den Code");
console.log("  4. Entferne @ts-expect-error");
