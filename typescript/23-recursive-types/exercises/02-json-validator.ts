/**
 * Exercise 02: JSON-Validator — Rekursiver JSON-Typ
 *
 * Implementiere einen vollstaendigen JSON-Typ und eine Validierungsfunktion.
 *
 * Ausfuehren: npx tsx exercises/02-json-validator.ts
 * Hints: Siehe hints.json "exercises/02-json-validator.ts"
 */

// TODO 1: Definiere den vollstaendigen JSON-Typ
// JSON kennt: string, number, boolean, null, Array von JSON-Werten,
// Objekt mit String-Schluesseln und JSON-Werten
type JsonValue = unknown; // ← Ersetze unknown

// TODO 2: Schreibe eine Funktion die prueft ob ein Wert JSON-kompatibel ist
// (Keine Funktionen, keine undefined, keine Symbols, keine Date, etc.)
function isJsonValue(value: unknown): value is JsonValue {
  // TODO: Implementiere die rekursive Validierung
  return false;
}

// TODO 3: Schreibe eine typsichere parse-Funktion
// Die JSON.parse zurueckgibt als JsonValue (nicht als any)
function safeJsonParse(text: string): JsonValue | Error {
  // TODO: Implementiere
  return new Error("Not implemented");
}

// TODO 4: Schreibe eine Funktion die alle Pfade eines JSON-Objekts auflistet
// Beispiel: { a: 1, b: { c: 2 } } → ["a", "b", "b.c"]
function getJsonPaths(value: JsonValue, prefix?: string): string[] {
  // TODO: Implementiere rekursiv
  return [];
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log("=== JSON Validator Tests ===");

// isJsonValue Tests:
console.log("string:", isJsonValue("hello"));         // true
console.log("number:", isJsonValue(42));               // true
console.log("null:", isJsonValue(null));               // true
console.log("nested:", isJsonValue({ a: { b: 1 } })); // true
console.log("undefined:", isJsonValue(undefined));     // false
console.log("function:", isJsonValue(() => {}));       // false
console.log("Date:", isJsonValue(new Date()));         // false

// safeJsonParse Tests:
const parsed = safeJsonParse('{"name": "Max", "age": 30}');
console.log("\nParsed:", parsed);

const invalid = safeJsonParse("not json");
console.log("Invalid:", invalid instanceof Error);    // true

// getJsonPaths Tests:
const testObj: JsonValue = {
  name: "Max",
  address: {
    street: "Hauptstr. 1",
    city: "Berlin",
    country: { code: "DE" },
  },
};
console.log("\nPaths:", getJsonPaths(testObj));
// Erwartet: ["name", "address", "address.street", "address.city",
//            "address.country", "address.country.code"]
