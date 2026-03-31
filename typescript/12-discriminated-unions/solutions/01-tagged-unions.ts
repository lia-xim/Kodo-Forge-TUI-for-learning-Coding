/**
 * Lektion 12 - Solution 01: Tagged Unions
 *
 * Ausfuehren mit: npx tsx solutions/01-tagged-unions.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Discriminated Union fuer geometrische Formen
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Jeder Typ hat das Tag-Property "kind" mit einem
// eindeutigen String Literal Wert.
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Triangle = { kind: "triangle"; a: number; b: number; c: number };

type Shape = Circle | Rectangle | Triangle;

function perimeter(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return 2 * Math.PI * shape.radius;
    case "rectangle":
      return 2 * (shape.width + shape.height);
    case "triangle":
      return shape.a + shape.b + shape.c;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Number-Diskriminator
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: statusCode als Number Literal Diskriminator.
// Das funktioniert genauso wie String Literals.
type HttpResult =
  | { statusCode: 200; body: string }
  | { statusCode: 404; path: string }
  | { statusCode: 500; error: string };

function describeResult(result: HttpResult): string {
  switch (result.statusCode) {
    case 200:
      return `OK: ${result.body}`;
    case 404:
      return `Nicht gefunden: ${result.path}`;
    case 500:
      return `Server-Fehler: ${result.error}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Boolean-Diskriminator
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: "success" als Boolean Literal Diskriminator.
// Bei Boolean-Diskriminatoren ist if/else oft natuerlicher als switch.
type ParseResult =
  | { success: true; value: number }
  | { success: false; error: string; position: number };

function formatParseResult(result: ParseResult): string {
  if (result.success) {
    return `Parsed: ${result.value}`;
  } else {
    return `Error at position ${result.position}: ${result.error}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Verschachtelte Discriminated Unions
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: "channel" als Diskriminator mit drei Varianten.
// Jede Variante hat andere Properties — passend zum Kanal.
type Notification =
  | { channel: "email"; to: string; subject: string; body: string }
  | { channel: "sms"; phoneNumber: string; text: string }
  | { channel: "push"; deviceId: string; title: string; payload: Record<string, unknown> };

function sendNotification(notification: Notification): string {
  switch (notification.channel) {
    case "email":
      return `Email an ${notification.to}: ${notification.subject}`;
    case "sms":
      return `SMS an ${notification.phoneNumber}: ${notification.text}`;
    case "push":
      return `Push an ${notification.deviceId}: ${notification.title}`;
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== Aufgabe 1: Shapes ===");
const circle: Shape = { kind: "circle", radius: 5 };
const rect: Shape = { kind: "rectangle", width: 10, height: 3 };
const tri: Shape = { kind: "triangle", a: 3, b: 4, c: 5 };
console.log(`Kreis: ${perimeter(circle).toFixed(2)}`);
console.log(`Rechteck: ${perimeter(rect)}`);
console.log(`Dreieck: ${perimeter(tri)}`);

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

console.log("\n--- Alle Loesungen erfolgreich! ---");
