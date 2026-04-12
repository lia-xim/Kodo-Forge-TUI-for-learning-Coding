/**
 * Lektion 07 - Exercise 02: Type Narrowing
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-type-narrowing.ts
 *
 * 5 Aufgaben zu typeof, instanceof, in, Type Predicates.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: typeof Narrowing Kette
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "describeValue" die einen unknown-Wert
// analysiert und eine Beschreibung zurueckgibt:
// - string: "String mit X Zeichen"
// - number: "Zahl: X" (mit toFixed(2))
// - boolean: "Boolean: true/false"
// - null: "Null-Wert"
// - undefined: "Undefiniert"
// - object (Array): "Array mit X Elementen"
// - object (nicht Array): "Objekt"
// - alles andere: "Unbekannter Typ"

// function describeValue(value: unknown): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: instanceof Narrowing
// ═══════════════════════════════════════════════════════════════════════════

class ValidationError {
  constructor(public field: string, public message: string) {}
}

class NetworkError {
  constructor(public url: string, public statusCode: number) {}
}

class AuthError {
  constructor(public reason: string) {}
}

type AppError = ValidationError | NetworkError | AuthError;

// TODO: Schreibe eine Funktion "formatError" die einen AppError
// in eine benutzerfreundliche Fehlermeldung umwandelt.

// function formatError(error: AppError): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: in Narrowing
// ═══════════════════════════════════════════════════════════════════════════

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
}

interface SmsNotification {
  phoneNumber: string;
  message: string;
}

interface PushNotification {
  deviceId: string;
  title: string;
  body: string;
}

type Notification = EmailNotification | SmsNotification | PushNotification;

// TODO: Schreibe eine Funktion "sendNotification" die den Kanal erkennt
// und eine passende Log-Nachricht zurueckgibt:
// - Email: "Email an {to}: {subject}"
// - SMS: "SMS an {phoneNumber}: {message}"
// - Push: "Push an {deviceId}: {title}"
// Nutze den "in" Operator um die Typen zu unterscheiden.

// function sendNotification(notification: Notification): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Custom Type Predicate
// ═══════════════════════════════════════════════════════════════════════════

interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

// TODO: Schreibe einen Type Guard "isProduct" der prueft ob ein
// unknown-Wert ein gueltiges Product ist. Pruefe alle 4 Properties
// und ihre Typen.

// function isProduct(value: unknown): value is Product { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Filter mit Narrowing (TS 5.5+)
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Gegeben ist ein Array mit gemischten Werten.
// Verwende .filter() um:
// a) Nur die Strings zu extrahieren (Typ soll string[] sein)
// b) Nur die nicht-null Werte zu extrahieren
// c) Nur die Produkte aus einem unknown[] zu extrahieren (nutze isProduct)

const mixedValues: (string | number | null | boolean)[] = [
  "hello", 42, null, true, "world", null, 0, false, "!"
];

// const onlyStrings: string[] = ...
// const nonNull: (string | number | boolean)[] = ...

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test Aufgabe 1
console.assert(describeValue("hi") === "String mit 2 Zeichen", "describeValue string");
console.assert(describeValue(3.14159) === "Zahl: 3.14", "describeValue number");
console.assert(describeValue(true) === "Boolean: true", "describeValue boolean");
console.assert(describeValue(null) === "Null-Wert", "describeValue null");
console.assert(describeValue(undefined) === "Undefiniert", "describeValue undefined");
console.assert(describeValue([1,2,3]) === "Array mit 3 Elementen", "describeValue array");
console.assert(describeValue({}) === "Objekt", "describeValue object");

// Test Aufgabe 2
console.assert(formatError(new ValidationError("email", "ungueltig")).includes("email"), "formatError validation");
console.assert(formatError(new NetworkError("/api", 503)).includes("503"), "formatError network");
console.assert(formatError(new AuthError("Token abgelaufen")).includes("abgelaufen"), "formatError auth");

// Test Aufgabe 3
console.assert(sendNotification({ to: "a@b.c", subject: "Hi", body: "" }).includes("a@b.c"), "send email");
console.assert(sendNotification({ phoneNumber: "+49", message: "Hi" }).includes("+49"), "send sms");
console.assert(sendNotification({ deviceId: "d1", title: "Hi", body: "" }).includes("d1"), "send push");

// Test Aufgabe 4
console.assert(isProduct({ id: "1", name: "Test", price: 10, inStock: true }) === true, "valid product");
console.assert(isProduct({ id: "1", name: "Test" }) === false, "missing fields");
console.assert(isProduct(null) === false, "null");
console.assert(isProduct("string") === false, "string");

// Test Aufgabe 5
console.assert(onlyStrings.length === 3, "filter strings");
console.assert(nonNull.length === 7, "filter non-null");

console.log("Alle Tests bestanden!");
*/
