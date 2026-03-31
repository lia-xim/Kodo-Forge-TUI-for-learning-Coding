/**
 * Lektion 11 - Exercise 06: Exhaustive Checks
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/06-exhaustive-checks.ts
 *
 * 5 Aufgaben zum never-Typ als Sicherheitsnetz.
 */

// Hilfsfunktion — verwende sie in deinen Loesungen!
function assertNever(value: never): never {
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Exhaustive Switch
// ═══════════════════════════════════════════════════════════════════════════

type Season = "spring" | "summer" | "autumn" | "winter";

// Schreibe eine Funktion die die Durchschnittstemperatur zurueckgibt:
// spring -> 15, summer -> 25, autumn -> 10, winter -> 0
// Verwende einen exhaustive switch mit assertNever.

// TODO: Implementiere die Funktion
function averageTemp(season: Season): number {
  // TODO
  return 0; // Placeholder
}

console.assert(averageTemp("spring") === 15, "Aufgabe 1a: spring");
console.assert(averageTemp("summer") === 25, "Aufgabe 1b: summer");
console.assert(averageTemp("autumn") === 10, "Aufgabe 1c: autumn");
console.assert(averageTemp("winter") === 0, "Aufgabe 1d: winter");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Exhaustive Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════

interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  side: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Square | Triangle;

// Berechne die Flaeche mit exhaustive check.
// circle:   PI * r^2
// square:   side^2
// triangle: (base * height) / 2

// TODO: Implementiere die Funktion
function area(shape: Shape): number {
  // TODO: Exhaustive switch
  return 0; // Placeholder
}

console.assert(Math.abs(area({ kind: "circle", radius: 5 }) - 78.54) < 0.01, "Aufgabe 2a: circle");
console.assert(area({ kind: "square", side: 4 }) === 16, "Aufgabe 2b: square");
console.assert(area({ kind: "triangle", base: 6, height: 3 }) === 9, "Aufgabe 2c: triangle");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Exhaustive Event Handler
// ═══════════════════════════════════════════════════════════════════════════

type UIEvent =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string }
  | { type: "scroll"; direction: "up" | "down"; amount: number };

// Schreibe einen Handler der einen Log-String zurueckgibt:
// click    -> "Klick bei (x, y)"
// keypress -> "Taste: <key>"
// scroll   -> "Scroll <direction> um <amount>px"

// TODO: Implementiere die Funktion
function logEvent(event: UIEvent): string {
  // TODO: Exhaustive switch mit assertNever
  return ""; // Placeholder
}

console.assert(
  logEvent({ type: "click", x: 100, y: 200 }) === "Klick bei (100, 200)",
  "Aufgabe 3a: click"
);
console.assert(
  logEvent({ type: "keypress", key: "Enter" }) === "Taste: Enter",
  "Aufgabe 3b: keypress"
);
console.assert(
  logEvent({ type: "scroll", direction: "down", amount: 50 }) ===
    "Scroll down um 50px",
  "Aufgabe 3c: scroll"
);

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Zustandsmaschine
// ═══════════════════════════════════════════════════════════════════════════

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

// Schreibe eine Funktion die den NAECHSTEN Status zurueckgibt.
// pending   -> confirmed
// confirmed -> shipped
// shipped   -> delivered
// delivered -> delivered (bleibt gleich)
// Verwende einen exhaustive switch.

// TODO: Implementiere die Funktion
function nextStatus(current: OrderStatus): OrderStatus {
  // TODO
  return "pending"; // Placeholder
}

console.assert(nextStatus("pending") === "confirmed", "Aufgabe 4a");
console.assert(nextStatus("confirmed") === "shipped", "Aufgabe 4b");
console.assert(nextStatus("shipped") === "delivered", "Aufgabe 4c");
console.assert(nextStatus("delivered") === "delivered", "Aufgabe 4d");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Record + satisfies als Alternative
// ═══════════════════════════════════════════════════════════════════════════

type LogLevel = "debug" | "info" | "warn" | "error";

// Erstelle ein Record-Objekt das jedem LogLevel ein Praefix zuordnet:
// debug -> "[DEBUG]"
// info  -> "[INFO]"
// warn  -> "[WARN]"
// error -> "[ERROR]"
// Verwende satisfies Record<LogLevel, string> fuer den exhaustive Check.

// TODO: Implementiere das Record-Objekt
const logPrefixes = {} as Record<LogLevel, string>; // TODO: Implementiere mit satisfies

// TODO: Implementiere die Funktion die den Prefix fuer ein Level zurueckgibt
function formatLog(level: LogLevel, message: string): string {
  // TODO: Verwende logPrefixes
  return ""; // Placeholder
}

console.assert(
  formatLog("debug", "test") === "[DEBUG] test",
  "Aufgabe 5a: debug"
);
console.assert(
  formatLog("error", "crash") === "[ERROR] crash",
  "Aufgabe 5b: error"
);

console.log("Alle Aufgaben abgeschlossen! Pruefe die console.assert-Ausgaben.");
