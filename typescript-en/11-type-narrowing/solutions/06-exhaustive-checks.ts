/**
 * Lektion 11 - Solution 06: Exhaustive Checks
 *
 * Ausfuehren mit: npx tsx solutions/06-exhaustive-checks.ts
 */

function assertNever(value: never): never {
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
}

// ═══ AUFGABE 1: Exhaustive Switch ═══

type Season = "spring" | "summer" | "autumn" | "winter";

// Loesung: switch mit allen Faellen + assertNever im default.
// Wenn jemand eine neue Season hinzufuegt, meldet TypeScript einen Fehler.
function averageTemp(season: Season): number {
  switch (season) {
    case "spring": return 15;
    case "summer": return 25;
    case "autumn": return 10;
    case "winter": return 0;
    default: return assertNever(season);
  }
}

console.assert(averageTemp("spring") === 15, "1a");
console.assert(averageTemp("summer") === 25, "1b");
console.assert(averageTemp("autumn") === 10, "1c");
console.assert(averageTemp("winter") === 0, "1d");

// ═══ AUFGABE 2: Exhaustive Discriminated Union ═══

interface Circle { kind: "circle"; radius: number; }
interface Square { kind: "square"; side: number; }
interface Triangle { kind: "triangle"; base: number; height: number; }
type Shape = Circle | Square | Triangle;

// Loesung: switch auf den Discriminant (kind).
// assertNever stellt sicher, dass alle Formen behandelt werden.
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
    case "triangle": return (shape.base * shape.height) / 2;
    default: return assertNever(shape);
  }
}

console.assert(Math.abs(area({ kind: "circle", radius: 5 }) - 78.54) < 0.01, "2a");
console.assert(area({ kind: "square", side: 4 }) === 16, "2b");
console.assert(area({ kind: "triangle", base: 6, height: 3 }) === 9, "2c");

// ═══ AUFGABE 3: Exhaustive Event Handler ═══

type UIEvent =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string }
  | { type: "scroll"; direction: "up" | "down"; amount: number };

// Loesung: switch auf type mit assertNever.
function logEvent(event: UIEvent): string {
  switch (event.type) {
    case "click":
      return `Klick bei (${event.x}, ${event.y})`;
    case "keypress":
      return `Taste: ${event.key}`;
    case "scroll":
      return `Scroll ${event.direction} um ${event.amount}px`;
    default:
      return assertNever(event);
  }
}

console.assert(logEvent({ type: "click", x: 100, y: 200 }) === "Klick bei (100, 200)", "3a");
console.assert(logEvent({ type: "keypress", key: "Enter" }) === "Taste: Enter", "3b");
console.assert(logEvent({ type: "scroll", direction: "down", amount: 50 }) === "Scroll down um 50px", "3c");

// ═══ AUFGABE 4: Zustandsmaschine ═══

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

// Loesung: Jeder Status hat einen klaren Nachfolger.
// delivered bleibt delivered (Endzustand).
function nextStatus(current: OrderStatus): OrderStatus {
  switch (current) {
    case "pending": return "confirmed";
    case "confirmed": return "shipped";
    case "shipped": return "delivered";
    case "delivered": return "delivered";
    default: return assertNever(current);
  }
}

console.assert(nextStatus("pending") === "confirmed", "4a");
console.assert(nextStatus("confirmed") === "shipped", "4b");
console.assert(nextStatus("shipped") === "delivered", "4c");
console.assert(nextStatus("delivered") === "delivered", "4d");

// ═══ AUFGABE 5: Record + satisfies als Alternative ═══

type LogLevel = "debug" | "info" | "warn" | "error";

// Loesung: Das Record-Objekt muss ALLE LogLevel als Keys haben.
// satisfies prueft das zur Compilezeit — wie ein exhaustive Check.
const logPrefixes = {
  debug: "[DEBUG]",
  info: "[INFO]",
  warn: "[WARN]",
  error: "[ERROR]",
} satisfies Record<LogLevel, string>;

// Der LogLevel als Key gibt direkt den Prefix zurueck.
function formatLog(level: LogLevel, message: string): string {
  return `${logPrefixes[level]} ${message}`;
}

console.assert(formatLog("debug", "test") === "[DEBUG] test", "5a");
console.assert(formatLog("error", "crash") === "[ERROR] crash", "5b");

console.log("Alle Loesungen korrekt!");
