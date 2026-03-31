/**
 * Lektion 12 - Exercise 01: Tagged Unions
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-tagged-unions.ts
 *
 * 4 Aufgaben zu Discriminated Unions und Tag-Properties.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Definiere eine Discriminated Union fuer geometrische Formen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle drei Typen Circle, Rectangle und Triangle mit dem
// Diskriminator "kind" und passenden Eigenschaften.
// Circle: radius (number)
// Rectangle: width und height (number)
// Triangle: a, b, c (Seitenlaengen, number)
//
// type Circle = ...
// type Rectangle = ...
// type Triangle = ...

// TODO: Erstelle den Union Type "Shape"
// type Shape = ...

// TODO: Erstelle eine Funktion "perimeter" die den Umfang berechnet.
// Kreis: 2 * Math.PI * radius
// Rechteck: 2 * (width + height)
// Dreieck: a + b + c
// function perimeter(shape: Shape): number { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Discriminated Union mit verschiedenen Diskriminator-Typen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Discriminated Union "HttpResult" mit dem
// NUMBER-Diskriminator "statusCode":
// - statusCode: 200, body: string
// - statusCode: 404, path: string
// - statusCode: 500, error: string
//
// type HttpResult = ...

// TODO: Erstelle eine Funktion "describeResult" die eine Beschreibung zurueckgibt
// function describeResult(result: HttpResult): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Boolean-Diskriminator
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Discriminated Union "ParseResult" mit dem
// Boolean-Diskriminator "success":
// - success: true, value: number
// - success: false, error: string, position: number
//
// type ParseResult = ...

// TODO: Erstelle eine Funktion "formatParseResult" die das Ergebnis formatiert.
// Erfolg: "Parsed: <value>"
// Fehler: "Error at position <position>: <error>"
// function formatParseResult(result: ParseResult): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Verschachtelte Discriminated Unions
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Discriminated Union "Notification" mit dem
// Diskriminator "channel":
// - channel: "email", to: string, subject: string, body: string
// - channel: "sms", phoneNumber: string, text: string
// - channel: "push", deviceId: string, title: string, payload: Record<string, unknown>
//
// type Notification = ...

// TODO: Erstelle eine Funktion "sendNotification" die eine
// Beschreibung des Versands zurueckgibt.
// Email: "Email an <to>: <subject>"
// SMS: "SMS an <phoneNumber>: <text>"
// Push: "Push an <deviceId>: <title>"
// function sendNotification(notification: Notification): string { ... }


// ═══════════════════════════════════════════════════════════════════════════
// TESTS (nicht aendern!)
// ═══════════════════════════════════════════════════════════════════════════

/*
// Entkommentiere nach dem Loesen:

console.log("=== Aufgabe 1: Shapes ===");
const circle: Shape = { kind: "circle", radius: 5 };
const rect: Shape = { kind: "rectangle", width: 10, height: 3 };
const tri: Shape = { kind: "triangle", a: 3, b: 4, c: 5 };
console.log(`Kreis: ${perimeter(circle).toFixed(2)}`);    // ~31.42
console.log(`Rechteck: ${perimeter(rect)}`);               // 26
console.log(`Dreieck: ${perimeter(tri)}`);                 // 12

console.log("\n=== Aufgabe 2: HttpResult ===");
console.log(describeResult({ statusCode: 200, body: '{"ok":true}' }));
console.log(describeResult({ statusCode: 404, path: "/api/users" }));
console.log(describeResult({ statusCode: 500, error: "Internal" }));

console.log("\n=== Aufgabe 3: ParseResult ===");
console.log(formatParseResult({ success: true, value: 42 }));
console.log(formatParseResult({ success: false, error: "Unexpected token", position: 15 }));

console.log("\n=== Aufgabe 4: Notifications ===");
console.log(sendNotification({ channel: "email", to: "alice@example.com", subject: "Hallo", body: "Welt" }));
console.log(sendNotification({ channel: "sms", phoneNumber: "+49123456", text: "Hi!" }));
console.log(sendNotification({ channel: "push", deviceId: "dev-42", title: "Update", payload: {} }));
*/
