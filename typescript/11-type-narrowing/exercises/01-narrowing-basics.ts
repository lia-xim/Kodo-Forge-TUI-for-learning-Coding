/**
 * Lektion 11 - Exercise 01: Narrowing Basics
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-narrowing-basics.ts
 *
 * 5 Aufgaben zum Grundkonzept von Type Narrowing.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfaches Narrowing
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die einen string | number entgegennimmt.
// Bei string: gib die Laenge zurueck.
// Bei number: gib den Wert verdoppelt zurueck.

// TODO: Implementiere die Funktion
function stringOderZahl(wert: string | number): number {
  // TODO
  return 0; // Placeholder
}

console.assert(stringOderZahl("hallo") === 5, "Aufgabe 1a: string Laenge");
console.assert(stringOderZahl(21) === 42, "Aufgabe 1b: number verdoppelt");
console.assert(stringOderZahl("") === 0, "Aufgabe 1c: leerer string");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Kumulatives Narrowing
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die einen string | number | boolean | null
// entgegennimmt und einen beschreibenden String zurueckgibt:
// null     -> "null"
// boolean  -> "boolean:true" oder "boolean:false"
// number   -> "number:42" (den Wert)
// string   -> "string:HALLO" (in Grossbuchstaben)

// TODO: Implementiere die Funktion
function beschreibe(wert: string | number | boolean | null): string {
  // TODO
  return ""; // Placeholder
}

console.assert(beschreibe(null) === "null", "Aufgabe 2a: null");
console.assert(beschreibe(true) === "boolean:true", "Aufgabe 2b: boolean");
console.assert(beschreibe(42) === "number:42", "Aufgabe 2c: number");
console.assert(beschreibe("hallo") === "string:HALLO", "Aufgabe 2d: string");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Early Return Pattern
// ═══════════════════════════════════════════════════════════════════════════

// Nutze Early Returns um null und undefined zu eliminieren.
// Gib dann die Laenge des Strings zurueck.

// TODO: Implementiere die Funktion
function sichereLaenge(wert: string | null | undefined): number {
  // TODO: Verwende early returns
  return 0; // Placeholder
}

console.assert(sichereLaenge("test") === 4, "Aufgabe 3a: normaler string");
console.assert(sichereLaenge(null) === 0, "Aufgabe 3b: null");
console.assert(sichereLaenge(undefined) === 0, "Aufgabe 3c: undefined");
console.assert(sichereLaenge("") === 0, "Aufgabe 3d: leerer string");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Unknown Narrowing
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die einen unknown-Wert entgegennimmt
// und ihn sicher als String zurueckgibt:
// string    -> der String selbst
// number    -> String-Darstellung (z.B. "42")
// boolean   -> "true" oder "false"
// null      -> "null"
// undefined -> "undefined"
// alles andere -> "unknown"

// TODO: Implementiere die Funktion
function sicherAlsString(wert: unknown): string {
  // TODO
  return ""; // Placeholder
}

console.assert(sicherAlsString("hi") === "hi", "Aufgabe 4a: string");
console.assert(sicherAlsString(42) === "42", "Aufgabe 4b: number");
console.assert(sicherAlsString(true) === "true", "Aufgabe 4c: boolean");
console.assert(sicherAlsString(null) === "null", "Aufgabe 4d: null");
console.assert(sicherAlsString(undefined) === "undefined", "Aufgabe 4e: undefined");
console.assert(sicherAlsString({}) === "unknown", "Aufgabe 4f: object");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Narrowing vs. Type Assertion
// ═══════════════════════════════════════════════════════════════════════════

// Diese Funktion verwendet unsichere Type Assertions (as).
// Schreibe sie um, sodass sie SICHERES Narrowing verwendet.
// Bei ungueltigem Input: gib undefined zurueck.

function unsicheresHolen(daten: unknown): string | undefined {
  // UNSICHER — bitte umschreiben mit echtem Narrowing:
  // return (daten as { name: string }).name;

  // TODO: Implementiere sicheres Narrowing
  return undefined; // Placeholder
}

console.assert(unsicheresHolen({ name: "Max" }) === "Max", "Aufgabe 5a: gueltig");
console.assert(unsicheresHolen({ name: 42 }) === undefined, "Aufgabe 5b: name ist kein string");
console.assert(unsicheresHolen(null) === undefined, "Aufgabe 5c: null");
console.assert(unsicheresHolen("text") === undefined, "Aufgabe 5d: kein Objekt");

console.log("Alle Aufgaben abgeschlossen! Pruefe die console.assert-Ausgaben.");
