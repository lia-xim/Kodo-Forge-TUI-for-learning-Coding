/**
 * Lektion 11 - Solution 03: instanceof und in-Operator
 *
 * Ausfuehren mit: npx tsx solutions/03-instanceof-und-in.ts
 */

// ═══ AUFGABE 1: instanceof mit Fehler-Klassen ═══

class HttpError {
  constructor(public statusCode: number, public message: string) {}
}
class TimeoutError {
  constructor(public timeoutMs: number, public message: string) {}
}
class ParseError {
  constructor(public input: string, public message: string) {}
}
type AppError = HttpError | TimeoutError | ParseError;

// Loesung: instanceof prueft die Klasse. Jeder Zweig hat Zugriff
// auf die klassen-spezifischen Properties.
function formatError(error: AppError): string {
  if (error instanceof HttpError) {
    return `HTTP ${error.statusCode}: ${error.message}`;
  }
  if (error instanceof TimeoutError) {
    return `Timeout nach ${error.timeoutMs}ms: ${error.message}`;
  }
  // error: ParseError (uebrig)
  return `Parse-Fehler bei '${error.input}': ${error.message}`;
}

console.assert(formatError(new HttpError(404, "Not Found")) === "HTTP 404: Not Found", "1a");
console.assert(formatError(new TimeoutError(5000, "Verbindung fehlgeschlagen")) === "Timeout nach 5000ms: Verbindung fehlgeschlagen", "1b");
console.assert(formatError(new ParseError("{bad}", "Ungueltiges JSON")) === "Parse-Fehler bei '{bad}': Ungueltiges JSON", "1c");

// ═══ AUFGABE 2: in-Operator fuer Discriminated Unions ═══

interface TextMessage { type: "text"; content: string; }
interface ImageMessage { type: "image"; url: string; width: number; height: number; }
interface AudioMessage { type: "audio"; url: string; durationSeconds: number; }
type Message = TextMessage | ImageMessage | AudioMessage;

// Loesung: Verwende die type-Property als Discriminant.
// Bei langem Text: erste 20 Zeichen + "..."
function summarize(message: Message): string {
  switch (message.type) {
    case "text": {
      const text = message.content;
      const kurz = text.length > 20 ? text.slice(0, 20) + "..." : text;
      return `Text: ${kurz}`;
    }
    case "image":
      return `Bild: ${message.width}x${message.height}`;
    case "audio":
      return `Audio: ${message.durationSeconds}s`;
  }
}

console.assert(summarize({ type: "text", content: "Hallo Welt" }) === "Text: Hallo Welt", "2a");
console.assert(summarize({ type: "text", content: "Dies ist ein sehr langer Nachrichtentext" }) === "Text: Dies ist ein sehr la...", "2b");
console.assert(summarize({ type: "image", url: "pic.jpg", width: 1920, height: 1080 }) === "Bild: 1920x1080", "2c");
console.assert(summarize({ type: "audio", url: "song.mp3", durationSeconds: 180 }) === "Audio: 180s", "2d");

// ═══ AUFGABE 3: in-Operator mit unknown ═══

// Loesung: Vierstufiges Narrowing:
// 1. typeof === "object" (ist es ein Objekt?)
// 2. !== null (null ausschliessen)
// 3. "name" in data (hat es die Property?)
// 4. typeof name === "string" (ist die Property ein String?)
function extractName(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  if (!("name" in data)) return undefined;
  const name = (data as Record<string, unknown>).name;
  if (typeof name !== "string") return undefined;
  return name;
}

console.assert(extractName({ name: "Max" }) === "Max", "3a");
console.assert(extractName({ name: 42 }) === undefined, "3b");
console.assert(extractName({}) === undefined, "3c");
console.assert(extractName(null) === undefined, "3d");
console.assert(extractName("Max") === undefined, "3e");

// ═══ AUFGABE 4: Kombination instanceof + in ═══

class RegularUser {
  constructor(public name: string, public email: string) {}
}
class AdminUser {
  constructor(public name: string, public email: string, public permissions: string[]) {}
}

// Loesung: instanceof AdminUser gibt Zugriff auf permissions.
// RegularUser hat keine permissions.
function hasPermission(user: RegularUser | AdminUser, permission: string): boolean {
  if (user instanceof AdminUser) {
    return user.permissions.includes(permission);
  }
  return false;
}

const admin = new AdminUser("Max", "max@test.de", ["read", "write", "delete"]);
const regular = new RegularUser("Anna", "anna@test.de");
console.assert(hasPermission(admin, "write") === true, "4a");
console.assert(hasPermission(admin, "deploy") === false, "4b");
console.assert(hasPermission(regular, "read") === false, "4c");

// ═══ AUFGABE 5: Formular-Ergebnisse verarbeiten ═══

interface SuccessResult { success: true; data: { id: number; message: string }; }
interface ErrorResult { success: false; error: string; }
type FormResult = SuccessResult | ErrorResult;

// Loesung: Die success-Property ist der Discriminant.
// Bei true: data verfuegbar. Bei false: error verfuegbar.
function handleResult(result: FormResult): string {
  if (result.success) {
    return `OK: ${result.data.message} (ID: ${result.data.id})`;
  }
  return `FEHLER: ${result.error}`;
}

console.assert(handleResult({ success: true, data: { id: 1, message: "Gespeichert" } }) === "OK: Gespeichert (ID: 1)", "5a");
console.assert(handleResult({ success: false, error: "Netzwerk-Fehler" }) === "FEHLER: Netzwerk-Fehler", "5b");

console.log("Alle Loesungen korrekt!");
