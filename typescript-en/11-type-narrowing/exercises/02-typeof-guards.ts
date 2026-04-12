/**
 * Lektion 11 - Exercise 02: typeof Guards
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-typeof-guards.ts
 *
 * 5 Aufgaben zu typeof als Narrowing-Werkzeug.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: typeof im switch
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die den Typ und Wert eines Parameters beschreibt.
// Verwende ein switch-Statement mit typeof.
// Format: "string:hallo", "number:42", "boolean:true", "undefined:undefined"

// TODO: Implementiere die Funktion
function beschreibeTyp(wert: string | number | boolean | undefined): string {
  // TODO: Verwende switch (typeof wert)
  return ""; // Placeholder
}

console.assert(beschreibeTyp("hallo") === "string:hallo", "Aufgabe 1a");
console.assert(beschreibeTyp(42) === "number:42", "Aufgabe 1b");
console.assert(beschreibeTyp(true) === "boolean:true", "Aufgabe 1c");
console.assert(beschreibeTyp(undefined) === "undefined:undefined", "Aufgabe 1d");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Die typeof-null-Falle
// ═══════════════════════════════════════════════════════════════════════════

// Diese Funktion soll Objects und Arrays unterscheiden,
// und null korrekt behandeln (trotz typeof null === "object").
// Gib zurueck:
//   null    -> "null"
//   Array   -> "array:3" (Laenge)
//   Object  -> "object:2" (Anzahl Keys)
//   string  -> "string"

// TODO: Implementiere die Funktion
function typSicher(wert: string | object | null | unknown[]): string {
  // TODO: Beachte typeof null === "object" und Array.isArray()
  return ""; // Placeholder
}

console.assert(typSicher(null) === "null", "Aufgabe 2a: null");
console.assert(typSicher([1, 2, 3]) === "array:3", "Aufgabe 2b: array");
console.assert(typSicher({ a: 1, b: 2 }) === "object:2", "Aufgabe 2c: object");
console.assert(typSicher("test") === "string", "Aufgabe 2d: string");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: typeof mit Negation
// ═══════════════════════════════════════════════════════════════════════════

// Verwende typeof mit NEGATION (typeof !== "...") um alle
// Nicht-String-Werte herauszufiltern.
// Gibt den String in Grossbuchstaben zurueck oder null.

// TODO: Implementiere die Funktion
function nurString(wert: string | number | boolean | null): string | null {
  // TODO: Verwende typeof !== "string" mit early return
  return null; // Placeholder
}

console.assert(nurString("hallo") === "HALLO", "Aufgabe 3a: string");
console.assert(nurString(42) === null, "Aufgabe 3b: number");
console.assert(nurString(true) === null, "Aufgabe 3c: boolean");
console.assert(nurString(null) === null, "Aufgabe 3d: null");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: typeof-Kette fuer unknown
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die einen unknown-Wert "verdoppelt":
// string    -> String verdoppeln ("ab" -> "abab")
// number    -> Zahl verdoppeln (5 -> 10)
// boolean   -> Negieren (true -> false, false -> true)
// alles andere -> null

// TODO: Implementiere die Funktion
function verdopple(wert: unknown): string | number | boolean | null {
  // TODO
  return null; // Placeholder
}

console.assert(verdopple("ab") === "abab", "Aufgabe 4a: string");
console.assert(verdopple(5) === 10, "Aufgabe 4b: number");
console.assert(verdopple(true) === false, "Aufgabe 4c: boolean true");
console.assert(verdopple(false) === true, "Aufgabe 4d: boolean false");
console.assert(verdopple(null) === null, "Aufgabe 4e: anderer Typ");
console.assert(verdopple({}) === null, "Aufgabe 4f: object");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Sichere JSON-Feld-Extraktion
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die aus einem unknown-Wert sicher ein
// numerisches Feld extrahiert. Pruefe:
// 1. Ist es ein object? (und nicht null)
// 2. Hat es das gewuenschte Feld?
// 3. Ist das Feld eine number?
// Wenn alles passt: gib die Zahl zurueck, sonst undefined.

// TODO: Implementiere die Funktion
function holeZahl(daten: unknown, feld: string): number | undefined {
  // TODO
  return undefined; // Placeholder
}

console.assert(holeZahl({ alter: 30 }, "alter") === 30, "Aufgabe 5a: gueltig");
console.assert(holeZahl({ alter: "30" }, "alter") === undefined, "Aufgabe 5b: string statt number");
console.assert(holeZahl({}, "alter") === undefined, "Aufgabe 5c: Feld fehlt");
console.assert(holeZahl(null, "alter") === undefined, "Aufgabe 5d: null");
console.assert(holeZahl("text", "length") === undefined, "Aufgabe 5e: kein object");

console.log("Alle Aufgaben abgeschlossen! Pruefe die console.assert-Ausgaben.");
