// Beispiel 01: Brand-Grundlagen und das Verwechslungs-Problem
// =============================================================
// Zeigt: Warum type aliases nicht helfen, und wie Brands es lösen.
// Ausführen: npx tsx examples/01-brand-basics.ts

// ─── Das Problem: type aliases helfen nicht ───────────────────

type UserIdAlias = string;  // Nur ein Alias — identisch mit string
type OrderIdAlias = string; // Identisch!

function getUserAlias(id: UserIdAlias): string {
  return `User: ${id}`;
}

const orderId1 = "order-456";
// TypeScript sagt: OK! (Kein Fehler, aber logisch falsch!)
console.log(getUserAlias(orderId1)); // "User: order-456"

// ─── Die Lösung: Brand-Typen ───────────────────────────────────

type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId  = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

function getUser(id: UserId): string {
  return `User: ${id}`;
}

function getOrder(id: OrderId): string {
  return `Order: ${id}`;
}

// Smart Constructor:
function createUserId(value: string): UserId {
  if (!value || value.length < 3) {
    throw new Error(`Ungültige UserId: "${value}"`);
  }
  return value as UserId;
}

function createOrderId(value: string): OrderId {
  if (!value || value.length < 3) {
    throw new Error(`Ungültige OrderId: "${value}"`);
  }
  return value as OrderId;
}

// Korrekte Verwendung:
const userId = createUserId("user-123");
const orderId = createOrderId("order-456");

console.log(getUser(userId));   // "User: user-123" ✅
console.log(getOrder(orderId)); // "Order: order-456" ✅

// Brands verhalten sich wie string:
console.log(userId.toUpperCase());       // "USER-123"
console.log(userId.length);             // 8
console.log(`ID: ${userId}`);           // "ID: user-123"
console.log(userId.startsWith("user-")); // true

// Upcast funktioniert (UserId → string):
function logRaw(s: string): void {
  console.log(`Raw: ${s}`);
}
logRaw(userId);  // ✅ OK — UserId ist Subtyp von string

// COMPILE-ERRORS (auskommentiert, zum Testen einkommentieren):
// getUser(orderId);     // ❌ OrderId ≠ UserId
// getOrder(userId);     // ❌ UserId ≠ OrderId
// getUser("user-789"); // ❌ string ≠ UserId

// ─── Hierarchie: VerifiedEmail ──────────────────────────────────

type Email         = Brand<string, 'Email'>;
type VerifiedEmail = Email & { readonly __verified: true };

function sendEmail(to: Email): void {
  console.log(`E-Mail an: ${to}`);
}

function sendCriticalNotification(to: VerifiedEmail): void {
  console.log(`Kritische Benachrichtigung an: ${to}`);
}

const email = "max@example.com" as Email;
const verified = "anna@example.com" as VerifiedEmail;

sendEmail(email);             // ✅
sendEmail(verified);          // ✅ VerifiedEmail ist auch Email
sendCriticalNotification(verified); // ✅

// sendCriticalNotification(email); // ❌ Email ist nicht VerifiedEmail

console.log("\n✅ Alle Beispiele erfolgreich!");
