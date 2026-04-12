/**
 * Lektion 09 - Solution 05: Patterns und Branding
 *
 * Ausfuehren mit: npx tsx solutions/05-patterns-und-branding.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Branded Types fuer Masseinheiten
// ═══════════════════════════════════════════════════════════════════════════

// Branded Types: Intersection mit einer __brand-Property die zur
// Laufzeit nicht existiert, aber zur Compilezeit unterscheidet.
type Kilometers = number & { readonly __brand: "Kilometers" };
type Miles = number & { readonly __brand: "Miles" };

function km(value: number): Kilometers {
  return value as Kilometers;
}

function miles(value: number): Miles {
  return value as Miles;
}

function milesToKm(m: Miles): Kilometers {
  return km(m * 1.60934);
}

function kmToMiles(k: Kilometers): Miles {
  return miles(k / 1.60934);
}

function addDistances(a: Kilometers, b: Kilometers): Kilometers {
  return km(a + b);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Exhaustive Switch mit as const
// ═══════════════════════════════════════════════════════════════════════════

const OrderStatus = {
  Pending: "PENDING",
  Confirmed: "CONFIRMED",
  Shipped: "SHIPPED",
  Delivered: "DELIVERED",
  Cancelled: "CANCELLED",
} as const;
type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

function getStatusMessage(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending:
      return "Bestellung wartet auf Bestaetigung";
    case OrderStatus.Confirmed:
      return "Bestellung wurde bestaetigt";
    case OrderStatus.Shipped:
      return "Bestellung wurde versandt";
    case OrderStatus.Delivered:
      return "Bestellung wurde zugestellt";
    case OrderStatus.Cancelled:
      return "Bestellung wurde storniert";
    default:
      // Exhaustive Check: Wenn ein neuer Status hinzugefuegt wird
      // und kein case existiert, meldet TypeScript hier einen Fehler.
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Branded Types fuer IDs
// ═══════════════════════════════════════════════════════════════════════════

type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };
type ProductId = string & { readonly __brand: "ProductId" };

function userId(id: string): UserId {
  if (!id.startsWith("usr_")) {
    throw new Error(`Ungueltige UserId: muss mit "usr_" beginnen, erhalten: "${id}"`);
  }
  return id as UserId;
}

function orderId(id: string): OrderId {
  if (!id.startsWith("ord_")) {
    throw new Error(`Ungueltige OrderId: muss mit "ord_" beginnen, erhalten: "${id}"`);
  }
  return id as OrderId;
}

function productId(id: string): ProductId {
  if (!id.startsWith("prd_")) {
    throw new Error(`Ungueltige ProductId: muss mit "prd_" beginnen, erhalten: "${id}"`);
  }
  return id as ProductId;
}

function getUser(id: UserId): string {
  return `User: ${id}`;
}

function getOrder(id: OrderId): string {
  return `Order: ${id}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════

type EmailNotification = {
  type: "email";
  to: string;
  subject: string;
  body: string;
};

type SmsNotification = {
  type: "sms";
  phoneNumber: string;
  message: string;
};

type PushNotification = {
  type: "push";
  deviceId: string;
  title: string;
  body: string;
};

type Notification = EmailNotification | SmsNotification | PushNotification;

function sendNotification(notification: Notification): string {
  switch (notification.type) {
    case "email":
      return `Email an ${notification.to}: ${notification.subject}`;
    case "sms":
      return `SMS an ${notification.phoneNumber}: ${notification.message}`;
    case "push":
      return `Push an ${notification.deviceId}: ${notification.title}`;
    default:
      const _exhaustive: never = notification;
      return _exhaustive;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: State Machine
// ═══════════════════════════════════════════════════════════════════════════

type State = "idle" | "processing" | "success" | "error";

type Transitions = {
  idle: "processing";
  processing: "success" | "error";
  error: "processing";
  success: "idle";
};

function transition<S extends State>(current: S, next: Transitions[S]): Transitions[S] {
  console.log(`  ${current} -> ${next}`);
  return next;
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

// Branded Types: Masseinheiten
const berlin = km(42.195);
const marathon = miles(26.2);
const marathonKm = milesToKm(marathon);
const total = addDistances(berlin, marathonKm);
console.log(`Marathon in km: ${Number(marathonKm).toFixed(2)}`);
console.log(`Gesamt: ${Number(total).toFixed(2)} km`);

// addDistances(berlin, marathon);  // Error! Miles ist nicht Kilometers

// Exhaustive Switch
console.log(getStatusMessage(OrderStatus.Shipped));    // "Bestellung wurde versandt"
console.log(getStatusMessage(OrderStatus.Delivered));  // "Bestellung wurde zugestellt"

// Branded IDs
const user = userId("usr_abc123");
const order = orderId("ord_xyz789");
console.log(getUser(user));    // "User: usr_abc123"
console.log(getOrder(order));  // "Order: ord_xyz789"
// getUser(order);  // Error! OrderId ist nicht UserId

// Discriminated Union
console.log(sendNotification({
  type: "email", to: "max@example.com", subject: "Hallo", body: "Welt"
}));
console.log(sendNotification({
  type: "sms", phoneNumber: "+49123456", message: "Hey!"
}));
console.log(sendNotification({
  type: "push", deviceId: "device-001", title: "News", body: "Neuer Beitrag"
}));

// State Machine
console.log("\nState Machine:");
const s1 = transition("idle", "processing");
const s2 = transition("processing", "success");
const s3 = transition("success", "idle");
// transition("idle", "success");  // Error! idle kann nur zu "processing"

console.log("\n--- Alle Tests bestanden! ---");
