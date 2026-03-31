/**
 * Lektion 12 - Example 04: Zustandsmodellierung
 *
 * Ausfuehren mit: npx tsx examples/04-state-modeling.ts
 *
 * State Machines als Typen, Loading/Error/Success Pattern,
 * "Make impossible states impossible".
 */

// ─── ANTI-PATTERN: BOOLEAN-BASIERTER STATE ─────────────────────────────────

// SCHLECHT: 2^3 = 8 moegliche Zustaende — die meisten ungueltig!
type OldState = {
  isLoading: boolean;
  isError: boolean;
  data: string[] | null;
  error: string | null;
};

// Diese unsinnigen Zustaende sind erlaubt:
const nonsense: OldState = {
  isLoading: true,
  isError: true,     // Laden UND Fehler gleichzeitig?
  data: ["abc"],     // Daten waehrend des Ladens?
  error: "Oops",     // Fehler UND Daten?
};

console.log("=== Anti-Pattern: Boolean-State ===");
console.log("nonsense state:", JSON.stringify(nonsense));
console.log("(Dieser Zustand sollte unmoegliche sein!)\n");

// ─── BESSER: DISCRIMINATED UNION STATE ─────────────────────────────────────

type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// Nur 4 gueltige Zustaende — alle sinnvoll!

function render<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case "idle":
      return "Bereit zum Laden.";
    case "loading":
      return "Lade Daten...";
    case "error":
      return `Fehler: ${state.error}`;
    case "success":
      return `Daten: ${JSON.stringify(state.data)}`;
  }
}

console.log("=== AsyncState<T> ===");
const states: AsyncState<string[]>[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "error", error: "Netzwerk-Timeout" },
  { status: "success", data: ["Alice", "Bob", "Charlie"] },
];

for (const state of states) {
  console.log(`  ${state.status}: ${render(state)}`);
}

// ─── STATE MACHINE: BESTELLUNG ─────────────────────────────────────────────

type CartItem = { name: string; price: number; quantity: number };

type OrderState =
  | { status: "draft"; items: CartItem[] }
  | { status: "submitted"; items: CartItem[]; submittedAt: Date }
  | { status: "paid"; items: CartItem[]; submittedAt: Date; paidAt: Date }
  | { status: "shipped"; items: CartItem[]; trackingCode: string }
  | { status: "delivered"; items: CartItem[]; deliveredAt: Date };

function orderTotal(order: OrderState): number {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function orderSummary(order: OrderState): string {
  const total = orderTotal(order).toFixed(2);

  switch (order.status) {
    case "draft":
      return `Entwurf: ${order.items.length} Artikel, ${total} EUR`;
    case "submitted":
      return `Bestellt am ${order.submittedAt.toLocaleDateString()}: ${total} EUR`;
    case "paid":
      return `Bezahlt am ${order.paidAt.toLocaleDateString()}: ${total} EUR`;
    case "shipped":
      return `Versendet: Tracking ${order.trackingCode}`;
    case "delivered":
      return `Zugestellt am ${order.deliveredAt.toLocaleDateString()}`;
  }
}

// State Transitions:
function submitOrder(order: Extract<OrderState, { status: "draft" }>): OrderState {
  return { status: "submitted", items: order.items, submittedAt: new Date() };
}

function payOrder(order: Extract<OrderState, { status: "submitted" }>): OrderState {
  return { status: "paid", items: order.items, submittedAt: order.submittedAt, paidAt: new Date() };
}

console.log("\n=== Order State Machine ===");

let order: OrderState = {
  status: "draft",
  items: [
    { name: "TypeScript Buch", price: 39.99, quantity: 1 },
    { name: "Kaffee", price: 4.50, quantity: 3 },
  ],
};
console.log(`  1. ${orderSummary(order)}`);

if (order.status === "draft") {
  order = submitOrder(order);
  console.log(`  2. ${orderSummary(order)}`);
}

if (order.status === "submitted") {
  order = payOrder(order);
  console.log(`  3. ${orderSummary(order)}`);
}

// ─── MAP UEBER ASYNC STATE ────────────────────────────────────────────────

function mapAsyncState<T, U>(
  state: AsyncState<T>,
  fn: (data: T) => U
): AsyncState<U> {
  if (state.status === "success") {
    return { status: "success", data: fn(state.data) };
  }
  return state; // idle, loading, error bleiben unveraendert
}

console.log("\n=== mapAsyncState ===");

const userState: AsyncState<{ name: string; age: number }[]> = {
  status: "success",
  data: [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
  ],
};

const namesState = mapAsyncState(userState, users =>
  users.map(u => u.name)
);

console.log(`  Users: ${render(userState)}`);
console.log(`  Names: ${render(namesState)}`);

// Map ueber einen Error-State veraendert nichts:
const errorState: AsyncState<string[]> = { status: "error", error: "Timeout" };
const mapped = mapAsyncState(errorState, data => data.length);
console.log(`  Error mapped: ${render(mapped)}`);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
