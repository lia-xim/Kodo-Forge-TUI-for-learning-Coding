/**
 * Lektion 11 - Solution 04: Equality und Truthiness Narrowing
 *
 * Ausfuehren mit: npx tsx solutions/04-equality-und-truthiness.ts
 */

// ═══ AUFGABE 1: null/undefined mit != eliminieren ═══

// Loesung: != null prueft gleichzeitig auf null und undefined.
// Wenn wert weder null noch undefined ist, gib ihn zurueck.
// Wichtig: 0, "", false sind NICHT null/undefined — sie sind gueltig!
function mitDefault<T>(wert: T | null | undefined, fallback: T): T {
  if (wert != null) return wert;
  return fallback;
}

console.assert(mitDefault("hallo", "standard") === "hallo", "1a");
console.assert(mitDefault(null, "standard") === "standard", "1b");
console.assert(mitDefault(undefined, "standard") === "standard", "1c");
console.assert(mitDefault(0, 99) === 0, "1d");
console.assert(mitDefault("", "leer") === "", "1e");

// ═══ AUFGABE 2: Truthiness-Falle vermeiden ═══

// Loesung: Statt if (wert) verwende wert != null.
// if (wert) wuerde 0, "" und false faelschlicherweise als "nicht gesetzt" behandeln.
function getDisplayValue(wert: string | number | null | undefined): string {
  if (wert != null) {
    return String(wert);
  }
  return "(nicht gesetzt)";
}

console.assert(getDisplayValue("test") === "test", "2a");
console.assert(getDisplayValue(42) === "42", "2b");
console.assert(getDisplayValue(0) === "0", "2c");
console.assert(getDisplayValue("") === "", "2d");
console.assert(getDisplayValue(null) === "(nicht gesetzt)", "2e");
console.assert(getDisplayValue(undefined) === "(nicht gesetzt)", "2f");

// ═══ AUFGABE 3: Switch mit Literal Types ═══

// Loesung: switch narrowt automatisch auf den jeweiligen Literal Type.
// POST und PUT senden typischerweise Daten im Body.
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function hasBody(method: HttpMethod): boolean {
  switch (method) {
    case "POST":
    case "PUT":
      return true;
    case "GET":
    case "DELETE":
      return false;
  }
}

console.assert(hasBody("GET") === false, "3a");
console.assert(hasBody("POST") === true, "3b");
console.assert(hasBody("PUT") === true, "3c");
console.assert(hasBody("DELETE") === false, "3d");

// ═══ AUFGABE 4: Equality Narrowing beider Seiten ═══

// Loesung: Pruefe zuerst ob beide den gleichen Typ haben (typeof),
// dann ob sie gleich sind (===).
function vergleicheWerte(a: string | number, b: string | number): string {
  if (a === b) return "gleich";
  if (typeof a !== typeof b) return `${typeof a} vs ${typeof b}`;
  return "ungleich";
}

console.assert(vergleicheWerte("a", "a") === "gleich", "4a");
console.assert(vergleicheWerte(42, 42) === "gleich", "4b");
console.assert(vergleicheWerte("42", 42) === "string vs number", "4c");
console.assert(vergleicheWerte("a", "b") === "ungleich", "4d");

// ═══ AUFGABE 5: Sichere Config mit ?? und ?. ═══

interface ServerConfig {
  host?: string;
  port?: number;
  ssl?: boolean;
  database?: { host?: string; port?: number };
}

// Loesung: ?? fuer Defaults (sicher fuer 0, "", false).
// ?. fuer optionales database-Objekt.
function buildConnectionUrl(config: ServerConfig): string {
  const protocol = (config.ssl ?? false) ? "https" : "http";
  const host = config.host ?? "localhost";
  const port = config.port ?? 3000;

  let url = `${protocol}://${host}:${port}`;

  // Wenn database gesetzt ist (auch als leeres Objekt):
  if (config.database != null) {
    const dbHost = config.database.host ?? "localhost";
    const dbPort = config.database.port ?? 5432;
    url += `&db=${dbHost}:${dbPort}`;
  }

  return url;
}

console.assert(buildConnectionUrl({}) === "http://localhost:3000", "5a");
console.assert(buildConnectionUrl({ host: "api.com", port: 8080, ssl: true }) === "https://api.com:8080", "5b");
console.assert(buildConnectionUrl({ database: {} }) === "http://localhost:3000&db=localhost:5432", "5c");
console.assert(buildConnectionUrl({ port: 0 }) === "http://localhost:0", "5d");

console.log("Alle Loesungen korrekt!");
