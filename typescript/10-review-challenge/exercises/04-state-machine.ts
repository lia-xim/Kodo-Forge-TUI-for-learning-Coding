export {};

/**
 * Lektion 10 - Exercise 04: Typsichere State Machine
 *
 * INTEGRATIONS-CHALLENGE: Baue eine State Machine fuer einen
 * Bestellprozess mit Literal Types, Discriminated Unions und
 * exhaustive Checks.
 *
 * Konzepte die du brauchst:
 * - Literal Types (L09)
 * - as const (L09)
 * - Discriminated Unions (L07)
 * - Exhaustive Checks mit never (L09)
 * - Function Overloads (L06)
 * - Interfaces (L05)
 * - Readonly / Immutability (L04, L05)
 *
 * Ausfuehren: npx tsx exercises/04-state-machine.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 1: States definieren
// ═══════════════════════════════════════════════════════════════════════════════
//
// Definiere die States einer Bestellung als Discriminated Union.
// Discriminator: "state"
//
// IdleState:
//   - state: "idle"
//
// CartState:
//   - state: "cart"
//   - items: readonly { productId: string; name: string; price: number; qty: number }[]
//   - total: number
//
// CheckoutState:
//   - state: "checkout"
//   - items: (gleich wie CartState)
//   - total: number
//   - shippingAddress: { street: string; city: string; zip: string; country: string }
//   - billingAddress?: (gleich wie shippingAddress, optional)
//
// PaymentState:
//   - state: "payment"
//   - items: (gleich)
//   - total: number
//   - shippingAddress: (gleich)
//   - paymentMethod: "credit_card" | "paypal" | "bank_transfer"
//
// ProcessingState:
//   - state: "processing"
//   - orderId: string
//   - total: number
//
// ConfirmedState:
//   - state: "confirmed"
//   - orderId: string
//   - total: number
//   - estimatedDelivery: Date
//   - trackingUrl?: string (optional)
//
// FailedState:
//   - state: "failed"
//   - error: string
//   - canRetry: boolean
//   - previousState: "checkout" | "payment" | "processing"
//
// OrderState = IdleState | CartState | CheckoutState | PaymentState
//            | ProcessingState | ConfirmedState | FailedState

// TODO: Erstelle die State-Typen hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Erlaubte Transitionen definieren (as const)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle TRANSITIONS als const Object das definiert,
// welche Uebergaenge von welchem State erlaubt sind:
//
// {
//   idle: ["cart"],
//   cart: ["checkout", "idle"],
//   checkout: ["payment", "cart", "failed"],
//   payment: ["processing", "checkout", "failed"],
//   processing: ["confirmed", "failed"],
//   confirmed: ["idle"],       // Neue Bestellung starten
//   failed: ["checkout", "payment", "idle"],  // Je nach previousState
// }
//
// Leite den Typ StateName als Union aller Keys ab.

// TODO: Erstelle TRANSITIONS hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Actions (Events die Transitionen ausloesen)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Definiere Actions als Discriminated Union (Discriminator: "type"):
//
// AddToCartAction:
//   - type: "ADD_TO_CART"
//   - productId: string
//   - name: string
//   - price: number
//   - qty: number
//
// RemoveFromCartAction:
//   - type: "REMOVE_FROM_CART"
//   - productId: string
//
// ProceedToCheckoutAction:
//   - type: "PROCEED_TO_CHECKOUT"
//   - shippingAddress: { street: string; city: string; zip: string; country: string }
//
// SelectPaymentAction:
//   - type: "SELECT_PAYMENT"
//   - method: "credit_card" | "paypal" | "bank_transfer"
//
// ConfirmPaymentAction:
//   - type: "CONFIRM_PAYMENT"
//
// PaymentSuccessAction:
//   - type: "PAYMENT_SUCCESS"
//   - orderId: string
//   - estimatedDelivery: Date
//
// PaymentFailedAction:
//   - type: "PAYMENT_FAILED"
//   - error: string
//
// RetryAction:
//   - type: "RETRY"
//
// ResetAction:
//   - type: "RESET"
//
// Action = alle oben genannten als Union

// TODO: Erstelle die Action-Typen hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Reducer (State + Action → neuer State)
// ═══════════════════════════════════════════════════════════════════════════════
//
// function reducer(state: OrderState, action: Action): OrderState
//
// Implementiere die Logik:
//
// Wenn state === "idle":
//   ADD_TO_CART → CartState (neues Item-Array)
//   RESET → IdleState
//   Andere Actions → gleicher State (ignorieren)
//
// Wenn state === "cart":
//   ADD_TO_CART → CartState (Item hinzufuegen, total neu berechnen)
//   REMOVE_FROM_CART → CartState (Item entfernen) oder IdleState (wenn leer)
//   PROCEED_TO_CHECKOUT → CheckoutState
//   RESET → IdleState
//   Andere → gleicher State
//
// Wenn state === "checkout":
//   SELECT_PAYMENT → PaymentState
//   RESET → IdleState
//   Andere → gleicher State
//
// Wenn state === "payment":
//   CONFIRM_PAYMENT → ProcessingState (generiere eine orderId)
//   RESET → IdleState
//   Andere → gleicher State
//
// Wenn state === "processing":
//   PAYMENT_SUCCESS → ConfirmedState
//   PAYMENT_FAILED → FailedState (canRetry: true, previousState: "processing")
//   Andere → gleicher State
//
// Wenn state === "confirmed":
//   RESET → IdleState
//   Andere → gleicher State
//
// Wenn state === "failed":
//   RETRY → CheckoutState oder PaymentState (je nach previousState)
//   RESET → IdleState
//   Andere → gleicher State
//
// WICHTIG: Nutze einen switch auf state.state fuer den aeusseren Case,
//          und einen switch auf action.type fuer den inneren Case.
//          Verwende exhaustive Checks wo sinnvoll!

// TODO: Implementiere reducer hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 5: State Display (exhaustive)
// ═══════════════════════════════════════════════════════════════════════════════
//
// function getStateDisplay(state: OrderState): string
//
// Gibt fuer JEDEN State eine benutzerfreundliche Nachricht zurueck:
//
// idle → "Willkommen! Fuege Produkte zum Warenkorb hinzu."
// cart → "Warenkorb: {n} Artikel, Gesamt: {total} EUR"
// checkout → "Versand an: {city}, {country}"
// payment → "Zahlung via {method}"
// processing → "Bestellung {orderId} wird verarbeitet..."
// confirmed → "Bestellung {orderId} bestaetigt! Lieferung: {datum}"
// failed → "Fehler: {error}" + (canRetry ? " [Erneut versuchen]" : " [Neu starten]")
//
// PFLICHT: Exhaustive Check mit never!

// TODO: Implementiere getStateDisplay hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Verfuegbare Actions (je nach State)
// ═══════════════════════════════════════════════════════════════════════════════
//
// function getAvailableActions(state: OrderState): string[]
//
// Gibt die Namen der Actions zurueck, die im aktuellen State moeglich sind:
//
// idle → ["ADD_TO_CART"]
// cart → ["ADD_TO_CART", "REMOVE_FROM_CART", "PROCEED_TO_CHECKOUT", "RESET"]
// checkout → ["SELECT_PAYMENT", "RESET"]
// payment → ["CONFIRM_PAYMENT", "RESET"]
// processing → ["PAYMENT_SUCCESS", "PAYMENT_FAILED"] (normalerweise vom System)
// confirmed → ["RESET"]
// failed → canRetry ? ["RETRY", "RESET"] : ["RESET"]

// TODO: Implementiere getAvailableActions hier

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese, wenn du fertig bist!
// ═══════════════════════════════════════════════════════════════════════════════

/*
// Simuliere einen kompletten Bestellvorgang
let state: OrderState = { state: "idle" };
console.log(`1. ${getStateDisplay(state)}`);
console.log(`   Verfuegbar: ${getAvailableActions(state).join(", ")}`);

// Item hinzufuegen
state = reducer(state, {
  type: "ADD_TO_CART",
  productId: "p1",
  name: "TypeScript Buch",
  price: 39.99,
  qty: 1,
});
console.log(`\n2. ${getStateDisplay(state)}`);

// Noch ein Item
state = reducer(state, {
  type: "ADD_TO_CART",
  productId: "p2",
  name: "JavaScript Kurs",
  price: 29.99,
  qty: 2,
});
console.log(`3. ${getStateDisplay(state)}`);

// Checkout
state = reducer(state, {
  type: "PROCEED_TO_CHECKOUT",
  shippingAddress: { street: "Hauptstr. 1", city: "Berlin", zip: "10115", country: "DE" },
});
console.log(`4. ${getStateDisplay(state)}`);
console.log(`   Verfuegbar: ${getAvailableActions(state).join(", ")}`);

// Zahlung waehlen
state = reducer(state, {
  type: "SELECT_PAYMENT",
  method: "credit_card",
});
console.log(`5. ${getStateDisplay(state)}`);

// Zahlung bestaetigen
state = reducer(state, { type: "CONFIRM_PAYMENT" });
console.log(`6. ${getStateDisplay(state)}`);

// Erfolg!
state = reducer(state, {
  type: "PAYMENT_SUCCESS",
  orderId: "ORD-2025-001",
  estimatedDelivery: new Date("2025-04-05"),
});
console.log(`7. ${getStateDisplay(state)}`);

console.assert(state.state === "confirmed", "State sollte 'confirmed' sein");
console.log(`   Verfuegbar: ${getAvailableActions(state).join(", ")}`);

// Reset
state = reducer(state, { type: "RESET" });
console.assert(state.state === "idle", "State sollte nach Reset 'idle' sein");
console.log(`\n8. ${getStateDisplay(state)}`);

// Test: Fehlerfall
console.log("\n--- Fehlerfall-Test ---");
state = { state: "processing", orderId: "ORD-ERR", total: 99 };
state = reducer(state, { type: "PAYMENT_FAILED", error: "Karte abgelehnt" });
console.log(`Fehler: ${getStateDisplay(state)}`);
console.assert(state.state === "failed", "State sollte 'failed' sein");

if (state.state === "failed") {
  console.assert(state.canRetry === true, "canRetry sollte true sein");
}

console.log("\nAlle Tests bestanden!");
*/
