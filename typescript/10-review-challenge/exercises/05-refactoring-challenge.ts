export {};

/**
 * Lektion 10 - Exercise 05: Refactoring Challenge
 *
 * INTEGRATIONS-CHALLENGE: Nimm schlecht typisierten Code (voller any, as, !)
 * und refactore ihn zu sauberem, typsicherem TypeScript.
 *
 * Das ist die realistischste Uebung: In der Praxis wirst du staendig
 * bestehenden Code verbessern muessen. Hier uebst du das.
 *
 * Konzepte die du brauchst:
 * - ALLE Phase-1-Konzepte!
 * - Besonderer Fokus: any eliminieren, Unions statt Flags,
 *   Discriminated Unions statt optionale Felder
 *
 * Ausfuehren: npx tsx exercises/05-refactoring-challenge.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 1: any → Korrekte Typen
// ═══════════════════════════════════════════════════════════════════════════════
//
// Refactore diese Funktionen: Ersetze JEDES 'any' durch den richtigen Typ.
// Die Logik soll gleich bleiben — nur die Typen aendern sich.
//
// TIPP: Lies den Code genau, um zu verstehen welche Typen erwartet werden.

// --- Schlecht: any ueberall ---
function processPaymentBad(payment: any): any {
  if (payment.type === "credit_card") {
    return {
      success: true,
      transactionId: `CC-${Date.now()}`,
      last4: payment.cardNumber.slice(-4),
    };
  } else if (payment.type === "paypal") {
    return {
      success: true,
      transactionId: `PP-${Date.now()}`,
      paypalEmail: payment.email,
    };
  } else if (payment.type === "bank_transfer") {
    return {
      success: false,
      error: "Bank transfer requires manual approval",
      referenceId: `BT-${Date.now()}`,
    };
  }
  return { success: false, error: "Unknown payment type" };
}

// TODO: Refactore processPayment mit:
// - Discriminated Union fuer Payment-Input (type: "credit_card" | "paypal" | "bank_transfer")
// - Discriminated Union fuer Result (success: true | false)
// - Exhaustive Switch
// - KEIN any!

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Optionale Felder → Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════════
//
// Dieser Code nutzt ein einziges Interface mit vielen optionalen Feldern.
// Das erlaubt ungueltige Zustaende (z.B. imageUrl ohne type === "image").

// --- Schlecht: Optionale Felder-Suppe ---
interface NotificationBad {
  id: string;
  type: string; // "email" | "sms" | "push" | "in_app"
  recipient: string;
  subject?: string; // Nur fuer email
  body: string;
  phoneNumber?: string; // Nur fuer sms
  deviceToken?: string; // Nur fuer push
  imageUrl?: string; // Nur fuer push
  priority?: string; // "low" | "medium" | "high"
  read?: boolean; // Nur fuer in_app
  sentAt?: Date;
  error?: string;
}

function sendNotificationBad(notification: NotificationBad): string {
  switch (notification.type) {
    case "email":
      return `Email an ${notification.recipient}: ${notification.subject}`;
    case "sms":
      return `SMS an ${notification.phoneNumber}: ${notification.body}`;
    case "push":
      return `Push an ${notification.deviceToken}: ${notification.body}`;
    case "in_app":
      return `In-App fuer ${notification.recipient}: ${notification.body}`;
    default:
      return "Unbekannter Typ";
  }
}

// TODO: Refactore zu einer Discriminated Union:
//
// Basis: id, body, priority ("low" | "medium" | "high"), sentAt?: Date
//
// EmailNotification: type "email", recipient (email), subject
// SmsNotification: type "sms", phoneNumber, (kein subject!)
// PushNotification: type "push", deviceToken, imageUrl? (optional)
// InAppNotification: type "in_app", userId, read (boolean)
//
// Die sendNotification-Funktion soll typsicher sein:
// - Exhaustive switch
// - Jeder Case kann nur auf die Properties zugreifen, die fuer seinen Typ existieren

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Boolean Flags → Union Types
// ═══════════════════════════════════════════════════════════════════════════════
//
// Dieser Code nutzt boolean Flags fuer Zustaende. Das erlaubt ungueltige
// Kombinationen (z.B. isLoading: true UND isError: true).

// --- Schlecht: Boolean-Flag-Hoelle ---
interface DataStateBad {
  data: any;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isEmpty: boolean;
  lastFetched: Date | null;
}

function renderDataBad(state: DataStateBad): string {
  if (state.isLoading) return "Laden...";
  if (state.isError) return `Fehler: ${state.errorMessage}`;
  if (state.isEmpty) return "Keine Daten vorhanden";
  return `Daten: ${JSON.stringify(state.data)} (geladen: ${state.lastFetched})`;
}

// Ungueltig, aber TypeScript erlaubt es:
const invalidState: DataStateBad = {
  data: null,
  isLoading: true,
  isError: true, // Laden UND Fehler gleichzeitig???
  errorMessage: "Irgendwas",
  isEmpty: false,
  lastFetched: null,
};

// TODO: Refactore zu einer Discriminated Union DataState:
//
// IdleState:    { status: "idle" }
// LoadingState: { status: "loading" }
// ErrorState:   { status: "error"; error: string; retryCount: number }
// EmptyState:   { status: "empty"; lastChecked: Date }
// SuccessState: { status: "success"; data: unknown[]; lastFetched: Date; total: number }
//
// Implementiere renderData(state: DataState): string mit exhaustive switch.
// Ungueltige Kombinationen sind jetzt UNMOOEGLICH!

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 4: String-basierte API → Literal Types + Overloads
// ═══════════════════════════════════════════════════════════════════════════════
//
// Diese Funktion akzeptiert einen String und gibt "irgendwas" zurueck.

// --- Schlecht: Alles string/any ---
function formatValueBad(value: any, formatType: string): string {
  if (formatType === "currency") {
    return `${value.toFixed(2)} EUR`;
  } else if (formatType === "percent") {
    return `${(value * 100).toFixed(1)}%`;
  } else if (formatType === "date") {
    return value.toLocaleDateString("de-DE");
  } else if (formatType === "phone") {
    return value.replace(/(\d{4})(\d{3})(\d+)/, "$1 $2 $3");
  }
  return String(value);
}

// TODO: Refactore mit Overloads:
//
// formatValue(value: number, format: "currency"): string
// formatValue(value: number, format: "percent"): string
// formatValue(value: Date, format: "date"): string
// formatValue(value: string, format: "phone"): string
//
// Die Implementation soll den passenden Wert-Typ erzwingen:
// - "currency" und "percent" brauchen number
// - "date" braucht Date
// - "phone" braucht string
//
// Erstelle auch FormatType = "currency" | "percent" | "date" | "phone"

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Unsichere Casts → Type Guards
// ═══════════════════════════════════════════════════════════════════════════════
//
// Dieser Code castet wild mit 'as'. Entferne die Casts und nutze
// stattdessen typeof-Checks und Narrowing.

// --- Schlecht: Unsichere Casts ---
function parseBad(input: unknown): string {
  if ((input as any).name) {
    return `Name: ${(input as any).name}`;
  }
  if ((input as any).length > 0) {
    return `Array mit ${(input as any).length} Elementen`;
  }
  if ((input as number) > 0) {
    return `Positive Zahl: ${input as number}`;
  }
  return `Unbekannt: ${String(input)}`;
}

// TODO: Refactore parseValue(input: unknown): string
//
// Nutze NUR diese Narrowing-Techniken (kein 'as'!):
// - typeof input === "string" → "String: {value}"
// - typeof input === "number" → "Zahl: {value}"
// - typeof input === "boolean" → "Boolean: {value}"
// - typeof input === "object" && input !== null:
//     - Array.isArray(input) → "Array: [{laenge} Elemente]"
//     - "name" in input → "Objekt mit Name: {name}"
//     - sonst → "Objekt: {keys}"
// - input === null → "Null"
// - input === undefined → "Undefined"

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese, wenn du fertig bist!
// ═══════════════════════════════════════════════════════════════════════════════

/*
// --- Test Aufgabe 1: processPayment ---
const ccResult = processPayment({
  type: "credit_card",
  cardNumber: "4111111111111111",
  expiryDate: "12/25",
  cvv: "123",
});
console.log("CC Result:", ccResult);
console.assert(ccResult.success === true, "CC sollte erfolgreich sein");

const ppResult = processPayment({
  type: "paypal",
  email: "user@paypal.com",
});
console.log("PP Result:", ppResult);

const btResult = processPayment({
  type: "bank_transfer",
  iban: "DE89370400440532013000",
  bic: "COBADEFFXXX",
});
console.log("BT Result:", btResult);

// --- Test Aufgabe 2: Notification ---
const emailNotif = sendNotification({
  id: "n1",
  type: "email",
  recipient: "user@test.de",
  subject: "Willkommen!",
  body: "Hallo und willkommen!",
  priority: "high",
});
console.log("\n" + emailNotif);

const pushNotif = sendNotification({
  id: "n2",
  type: "push",
  deviceToken: "abc-123-def",
  body: "Neue Nachricht!",
  priority: "medium",
  imageUrl: "https://example.com/img.png",
});
console.log(pushNotif);

// --- Test Aufgabe 3: DataState ---
console.log("\n" + renderData({ status: "loading" }));
console.log(renderData({ status: "error", error: "Timeout", retryCount: 2 }));
console.log(renderData({ status: "success", data: [1, 2, 3], lastFetched: new Date(), total: 3 }));

// --- Test Aufgabe 4: formatValue ---
console.log("\n" + formatValue(42.5, "currency"));   // "42.50 EUR"
console.log(formatValue(0.856, "percent"));           // "85.6%"
console.log(formatValue(new Date(), "date"));         // Datum im DE-Format
console.log(formatValue("017612345678", "phone"));    // "0176 123 45678"

// --- Test Aufgabe 5: parseValue ---
console.log("\n" + parseValue("Hallo"));              // "String: Hallo"
console.log(parseValue(42));                           // "Zahl: 42"
console.log(parseValue([1, 2, 3]));                    // "Array: [3 Elemente]"
console.log(parseValue({ name: "Max" }));              // "Objekt mit Name: Max"
console.log(parseValue(null));                         // "Null"

console.log("\nAlle Refactoring-Tests bestanden!");
*/
