/**
 * Lektion 11 - Solution 01: Narrowing Basics
 *
 * Ausfuehren mit: npx tsx solutions/01-narrowing-basics.ts
 */

// ═══ AUFGABE 1: Einfaches Narrowing ═══

// Loesung: typeof-Check um string und number zu unterscheiden.
// Bei string: .length gibt die Laenge. Bei number: * 2 verdoppelt.
function stringOderZahl(wert: string | number): number {
  if (typeof wert === "string") {
    return wert.length;
  }
  return wert * 2;
}

console.assert(stringOderZahl("hallo") === 5, "Aufgabe 1a");
console.assert(stringOderZahl(21) === 42, "Aufgabe 1b");
console.assert(stringOderZahl("") === 0, "Aufgabe 1c");

// ═══ AUFGABE 2: Kumulatives Narrowing ═══

// Loesung: Zuerst null pruefen (=== null), dann typeof fuer die anderen.
// Reihenfolge ist wichtig: null muss VOR typeof kommen, weil
// typeof null === "object" ist!
function beschreibe(wert: string | number | boolean | null): string {
  if (wert === null) return "null";
  if (typeof wert === "boolean") return `boolean:${wert}`;
  if (typeof wert === "number") return `number:${wert}`;
  return `string:${wert.toUpperCase()}`;
}

console.assert(beschreibe(null) === "null", "Aufgabe 2a");
console.assert(beschreibe(true) === "boolean:true", "Aufgabe 2b");
console.assert(beschreibe(42) === "number:42", "Aufgabe 2c");
console.assert(beschreibe("hallo") === "string:HALLO", "Aufgabe 2d");

// ═══ AUFGABE 3: Early Return Pattern ═══

// Loesung: Early Returns fuer null und undefined. Danach ist
// TypeScript sicher, dass wert ein string ist.
function sichereLaenge(wert: string | null | undefined): number {
  if (wert === null) return 0;
  if (wert === undefined) return 0;
  // Alternativ: if (wert == null) return 0; (prueft beides)
  return wert.length;
}

console.assert(sichereLaenge("test") === 4, "Aufgabe 3a");
console.assert(sichereLaenge(null) === 0, "Aufgabe 3b");
console.assert(sichereLaenge(undefined) === 0, "Aufgabe 3c");
console.assert(sichereLaenge("") === 0, "Aufgabe 3d");

// ═══ AUFGABE 4: Unknown Narrowing ═══

// Loesung: Pruefe null und undefined explizit (mit ===),
// dann typeof fuer die primitiven Typen.
// Reihenfolge: null/undefined VOR typeof, weil typeof null === "object"
function sicherAlsString(wert: unknown): string {
  if (wert === null) return "null";
  if (wert === undefined) return "undefined";
  if (typeof wert === "string") return wert;
  if (typeof wert === "number") return String(wert);
  if (typeof wert === "boolean") return String(wert);
  return "unknown";
}

console.assert(sicherAlsString("hi") === "hi", "Aufgabe 4a");
console.assert(sicherAlsString(42) === "42", "Aufgabe 4b");
console.assert(sicherAlsString(true) === "true", "Aufgabe 4c");
console.assert(sicherAlsString(null) === "null", "Aufgabe 4d");
console.assert(sicherAlsString(undefined) === "undefined", "Aufgabe 4e");
console.assert(sicherAlsString({}) === "unknown", "Aufgabe 4f");

// ═══ AUFGABE 5: Narrowing vs. Type Assertion ═══

// Loesung: Statt (daten as ...) Narrowing verwenden:
// 1. typeof === "object" (und nicht null)
// 2. "name" in daten
// 3. typeof name === "string"
function unsicheresHolen(daten: unknown): string | undefined {
  if (typeof daten !== "object" || daten === null) return undefined;
  if (!("name" in daten)) return undefined;
  const name = (daten as Record<string, unknown>).name;
  if (typeof name !== "string") return undefined;
  return name;
}

console.assert(unsicheresHolen({ name: "Max" }) === "Max", "Aufgabe 5a");
console.assert(unsicheresHolen({ name: 42 }) === undefined, "Aufgabe 5b");
console.assert(unsicheresHolen(null) === undefined, "Aufgabe 5c");
console.assert(unsicheresHolen("text") === undefined, "Aufgabe 5d");

console.log("Alle Loesungen korrekt!");
