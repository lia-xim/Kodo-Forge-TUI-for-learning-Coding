/**
 * Lektion 11 - Exercise 03: instanceof und in-Operator
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-instanceof-und-in.ts
 *
 * 5 Aufgaben zu instanceof (Klassen) und in (Properties).
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: instanceof mit Fehler-Klassen
// ═══════════════════════════════════════════════════════════════════════════

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

// Schreibe eine Funktion die den Fehler als String formatiert:
// HttpError    -> "HTTP 404: Not Found"
// TimeoutError -> "Timeout nach 5000ms: Verbindung fehlgeschlagen"
// ParseError   -> "Parse-Fehler bei '...': Ungueltiges JSON"

// TODO: Implementiere die Funktion
function formatError(error: AppError): string {
  // TODO: Verwende instanceof
  return ""; // Placeholder
}

console.assert(
  formatError(new HttpError(404, "Not Found")) === "HTTP 404: Not Found",
  "Aufgabe 1a: HttpError"
);
console.assert(
  formatError(new TimeoutError(5000, "Verbindung fehlgeschlagen")) ===
    "Timeout nach 5000ms: Verbindung fehlgeschlagen",
  "Aufgabe 1b: TimeoutError"
);
console.assert(
  formatError(new ParseError("{bad}", "Ungueltiges JSON")) ===
    "Parse-Fehler bei '{bad}': Ungueltiges JSON",
  "Aufgabe 1c: ParseError"
);

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: in-Operator fuer Discriminated Unions
// ═══════════════════════════════════════════════════════════════════════════

interface TextMessage {
  type: "text";
  content: string;
}

interface ImageMessage {
  type: "image";
  url: string;
  width: number;
  height: number;
}

interface AudioMessage {
  type: "audio";
  url: string;
  durationSeconds: number;
}

type Message = TextMessage | ImageMessage | AudioMessage;

// Schreibe eine Funktion die eine Zusammenfassung erstellt:
// TextMessage  -> "Text: <content>" (max 20 Zeichen + "...")
// ImageMessage -> "Bild: <width>x<height>"
// AudioMessage -> "Audio: <durationSeconds>s"

// TODO: Implementiere die Funktion
function summarize(message: Message): string {
  // TODO: Verwende den in-Operator oder die type-Property
  return ""; // Placeholder
}

console.assert(
  summarize({ type: "text", content: "Hallo Welt" }) === "Text: Hallo Welt",
  "Aufgabe 2a: kurzer Text"
);
console.assert(
  summarize({ type: "text", content: "Dies ist ein sehr langer Nachrichtentext" }) ===
    "Text: Dies ist ein sehr la...",
  "Aufgabe 2b: langer Text"
);
console.assert(
  summarize({ type: "image", url: "pic.jpg", width: 1920, height: 1080 }) ===
    "Bild: 1920x1080",
  "Aufgabe 2c: Bild"
);
console.assert(
  summarize({ type: "audio", url: "song.mp3", durationSeconds: 180 }) ===
    "Audio: 180s",
  "Aufgabe 2d: Audio"
);

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: in-Operator mit unknown
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Funktion die aus unknown-Daten sicher einen
// "name"-String extrahiert.
// Pruefe: (1) object, (2) nicht null, (3) "name" existiert, (4) name ist string

// TODO: Implementiere die Funktion
function extractName(data: unknown): string | undefined {
  // TODO
  return undefined; // Placeholder
}

console.assert(extractName({ name: "Max" }) === "Max", "Aufgabe 3a: gueltig");
console.assert(extractName({ name: 42 }) === undefined, "Aufgabe 3b: name kein string");
console.assert(extractName({}) === undefined, "Aufgabe 3c: kein name");
console.assert(extractName(null) === undefined, "Aufgabe 3d: null");
console.assert(extractName("Max") === undefined, "Aufgabe 3e: kein object");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Kombination instanceof + in
// ═══════════════════════════════════════════════════════════════════════════

class RegularUser {
  constructor(public name: string, public email: string) {}
}

class AdminUser {
  constructor(public name: string, public email: string, public permissions: string[]) {}
}

// Schreibe eine Funktion die prueft ob ein Benutzer eine bestimmte
// Berechtigung hat. RegularUser haben NIE Berechtigungen.
// AdminUser haben Berechtigungen wenn sie im permissions-Array stehen.

// TODO: Implementiere die Funktion
function hasPermission(user: RegularUser | AdminUser, permission: string): boolean {
  // TODO
  return false; // Placeholder
}

const admin = new AdminUser("Max", "max@test.de", ["read", "write", "delete"]);
const regular = new RegularUser("Anna", "anna@test.de");

console.assert(hasPermission(admin, "write") === true, "Aufgabe 4a: Admin hat write");
console.assert(hasPermission(admin, "deploy") === false, "Aufgabe 4b: Admin hat kein deploy");
console.assert(hasPermission(regular, "read") === false, "Aufgabe 4c: Regular hat nichts");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Formular-Ergebnisse verarbeiten
// ═══════════════════════════════════════════════════════════════════════════

interface SuccessResult {
  success: true;
  data: { id: number; message: string };
}

interface ErrorResult {
  success: false;
  error: string;
}

type FormResult = SuccessResult | ErrorResult;

// Schreibe eine Funktion die das Ergebnis in einen User-String umwandelt:
// Erfolg: "OK: <message> (ID: <id>)"
// Fehler: "FEHLER: <error>"

// TODO: Implementiere die Funktion
function handleResult(result: FormResult): string {
  // TODO: Nutze die discriminant-Property "success"
  return ""; // Placeholder
}

console.assert(
  handleResult({ success: true, data: { id: 1, message: "Gespeichert" } }) ===
    "OK: Gespeichert (ID: 1)",
  "Aufgabe 5a: Erfolg"
);
console.assert(
  handleResult({ success: false, error: "Netzwerk-Fehler" }) ===
    "FEHLER: Netzwerk-Fehler",
  "Aufgabe 5b: Fehler"
);

console.log("Alle Aufgaben abgeschlossen! Pruefe die console.assert-Ausgaben.");
