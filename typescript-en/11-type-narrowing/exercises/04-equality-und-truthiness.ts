/**
 * Lektion 11 - Exercise 04: Equality und Truthiness Narrowing
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-equality-und-truthiness.ts
 *
 * 5 Aufgaben zu ===, !==, ==, !=, Truthiness und Nullish Narrowing.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: null/undefined mit != eliminieren
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die den Wert zurueckgibt wenn er weder
// null noch undefined ist, sonst den Default-Wert.
// Verwende != null (lose Gleichheit) als Kurzform.

// TODO: Implementiere die Funktion
function mitDefault<T>(wert: T | null | undefined, fallback: T): T {
  // TODO: Verwende != null
  return fallback; // Placeholder
}

console.assert(mitDefault("hallo", "standard") === "hallo", "Aufgabe 1a");
console.assert(mitDefault(null, "standard") === "standard", "Aufgabe 1b");
console.assert(mitDefault(undefined, "standard") === "standard", "Aufgabe 1c");
console.assert(mitDefault(0, 99) === 0, "Aufgabe 1d: 0 ist gueltig!");
console.assert(mitDefault("", "leer") === "", "Aufgabe 1e: '' ist gueltig!");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Truthiness-Falle vermeiden
// ═══════════════════════════════════════════════════════════════════════════

// Diese Funktion hat einen Bug: Sie behandelt 0 und "" als "nicht gesetzt".
// Fixe den Bug, sodass nur null und undefined als "nicht gesetzt" gelten.

// BUGGY — bitte fixen:
function getDisplayValue(wert: string | number | null | undefined): string {
  // TODO: Fixe den Bug — 0 und "" sind gueltige Werte!
  if (wert) {
    return String(wert);
  }
  return "(nicht gesetzt)";
}

console.assert(getDisplayValue("test") === "test", "Aufgabe 2a: string");
console.assert(getDisplayValue(42) === "42", "Aufgabe 2b: number");
console.assert(getDisplayValue(0) === "0", "Aufgabe 2c: 0 ist gueltig!");
console.assert(getDisplayValue("") === "", "Aufgabe 2d: '' ist gueltig!");
console.assert(getDisplayValue(null) === "(nicht gesetzt)", "Aufgabe 2e: null");
console.assert(getDisplayValue(undefined) === "(nicht gesetzt)", "Aufgabe 2f: undefined");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Switch mit Literal Types
// ═══════════════════════════════════════════════════════════════════════════

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Schreibe eine Funktion die true zurueckgibt, wenn die Methode
// Daten im Body senden kann (POST und PUT).
// Verwende ein switch-Statement.

// TODO: Implementiere die Funktion
function hasBody(method: HttpMethod): boolean {
  // TODO: Verwende switch
  return false; // Placeholder
}

console.assert(hasBody("GET") === false, "Aufgabe 3a: GET");
console.assert(hasBody("POST") === true, "Aufgabe 3b: POST");
console.assert(hasBody("PUT") === true, "Aufgabe 3c: PUT");
console.assert(hasBody("DELETE") === false, "Aufgabe 3d: DELETE");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Equality Narrowing beider Seiten
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die prueft ob zwei Werte gleich sind.
// Nur wenn beide den gleichen Typ haben UND gleich sind, gib "gleich" zurueck.
// Sonst gib den Typ-Vergleich zurueck: "string vs number" etc.

// TODO: Implementiere die Funktion
function vergleicheWerte(
  a: string | number,
  b: string | number
): string {
  // TODO
  return ""; // Placeholder
}

console.assert(vergleicheWerte("a", "a") === "gleich", "Aufgabe 4a: gleiche strings");
console.assert(vergleicheWerte(42, 42) === "gleich", "Aufgabe 4b: gleiche numbers");
console.assert(vergleicheWerte("42", 42) === "string vs number", "Aufgabe 4c: verschiedene Typen");
console.assert(vergleicheWerte("a", "b") === "ungleich", "Aufgabe 4d: verschiedene Werte");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Sichere Config mit ?? und ?.
// ═══════════════════════════════════════════════════════════════════════════

interface ServerConfig {
  host?: string;
  port?: number;
  ssl?: boolean;
  database?: {
    host?: string;
    port?: number;
  };
}

// Schreibe eine Funktion die eine Connection-URL erstellt.
// Defaults: host="localhost", port=3000, ssl=false
// Wenn database gesetzt ist: haenge "&db=<host>:<port>" an
// Database defaults: host="localhost", port=5432
// Format: "http(s)://host:port" oder "http(s)://host:port&db=dbhost:dbport"

// TODO: Implementiere die Funktion
function buildConnectionUrl(config: ServerConfig): string {
  // TODO: Verwende ?? und ?.
  return ""; // Placeholder
}

console.assert(
  buildConnectionUrl({}) === "http://localhost:3000",
  "Aufgabe 5a: alle Defaults"
);
console.assert(
  buildConnectionUrl({ host: "api.com", port: 8080, ssl: true }) ===
    "https://api.com:8080",
  "Aufgabe 5b: mit SSL"
);
console.assert(
  buildConnectionUrl({ database: {} }) ===
    "http://localhost:3000&db=localhost:5432",
  "Aufgabe 5c: mit DB (Defaults)"
);
console.assert(
  buildConnectionUrl({ port: 0 }) === "http://localhost:0",
  "Aufgabe 5d: Port 0 ist gueltig!"
);

console.log("Alle Aufgaben abgeschlossen! Pruefe die console.assert-Ausgaben.");
