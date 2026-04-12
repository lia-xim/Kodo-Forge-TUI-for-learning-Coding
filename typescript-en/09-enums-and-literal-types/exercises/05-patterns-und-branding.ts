/**
 * Lektion 09 - Exercise 05: Patterns und Branding
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-patterns-und-branding.ts
 *
 * 5 Aufgaben zu Branded Types, Exhaustive Checks und fortgeschrittenen Patterns.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Branded Types fuer Masseinheiten
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle Branded Types fuer Kilometer und Meilen,
// damit sie nicht verwechselt werden koennen
// type Kilometers = ...
// type Miles = ...

// TODO: Erstelle Konstruktor-Funktionen
// function km(value: number): Kilometers { ... }
// function miles(value: number): Miles { ... }

// TODO: Erstelle Konvertierungs-Funktionen
// function milesToKm(m: Miles): Kilometers { ... }
// function kmToMiles(k: Kilometers): Miles { ... }

// TODO: Erstelle eine Funktion "addDistances" die zwei Kilometer-Werte addiert
// function addDistances(a: Kilometers, b: Kilometers): Kilometers { ... }

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

// TODO: Erstelle eine Funktion "getStatusMessage" mit exhaustive Check.
// Jeder Status soll eine deutsche Nachricht zurueckgeben.
// Nutze das never-Pattern im default, damit der Compiler meldet
// wenn ein neuer Status hinzugefuegt wird.
// function getStatusMessage(status: OrderStatus): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Branded Types fuer IDs
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle Branded Types fuer verschiedene Entity-IDs
// type UserId = string & { readonly __brand: "UserId" };
// type OrderId = string & { readonly __brand: "OrderId" };
// type ProductId = string & { readonly __brand: "ProductId" };

// TODO: Erstelle Konstruktor-Funktionen mit Validierung
// (IDs muessen nicht-leer sein und ein bestimmtes Praefix haben)
// function userId(id: string): UserId { ... }    // Praefix: "usr_"
// function orderId(id: string): OrderId { ... }  // Praefix: "ord_"
// function productId(id: string): ProductId { ... } // Praefix: "prd_"

// TODO: Erstelle eine Funktion die zeigt dass man IDs nicht verwechseln kann
// function getUser(id: UserId): string { ... }
// function getOrder(id: OrderId): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Discriminated Union mit Literal Types
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Discriminated Union fuer verschiedene Benachrichtigungen:
// - EmailNotification: { type: "email", to: string, subject: string, body: string }
// - SmsNotification: { type: "sms", phoneNumber: string, message: string }
// - PushNotification: { type: "push", deviceId: string, title: string, body: string }

// type Notification = ...

// TODO: Erstelle eine Funktion "sendNotification" die je nach Typ
// eine passende Nachricht ausgibt und einen exhaustive Check hat
// function sendNotification(notification: Notification): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: State Machine mit Literal Types
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Modelliere eine einfache State Machine fuer einen Bestellprozess.
// Jeder Zustand kann nur in bestimmte Folgezustaende uebergehen:
// "idle" -> "processing"
// "processing" -> "success" | "error"
// "error" -> "processing" (retry)
// "success" -> "idle" (reset)

// type State = "idle" | "processing" | "success" | "error";

// TODO: Erstelle einen Typ "Transitions" der die erlaubten Uebergaenge definiert
// type Transitions = {
//   idle: "processing";
//   processing: "success" | "error";
//   error: "processing";
//   success: "idle";
// };

// TODO: Erstelle eine Funktion "transition" die typsicher
// den Zustandsuebergang durchfuehrt
// function transition<S extends State>(current: S, next: Transitions[S]): Transitions[S] { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// const berlin = km(42);
// const london = miles(26.2);
// const londonKm = milesToKm(london);
// const total = addDistances(berlin, londonKm);
// console.log(`Marathon in km: ${londonKm}`);

// console.log(getStatusMessage(OrderStatus.Shipped)); // "Bestellung wurde versandt"

// const user = userId("usr_abc123");
// const order = orderId("ord_xyz789");
// console.log(getUser(user));    // OK
// // console.log(getUser(order)); // Error! OrderId ist nicht UserId

// console.log(sendNotification({ type: "email", to: "a@b.com", subject: "Hi", body: "Hello" }));
// console.log(sendNotification({ type: "sms", phoneNumber: "+49123", message: "Hey" }));

// let state: State = "idle";
// const next = transition("idle", "processing");
// console.log(`idle -> ${next}`);
// const after = transition("processing", "success");
// console.log(`processing -> ${after}`);

console.log("Exercise 05 geladen. Ersetze die TODOs!");
