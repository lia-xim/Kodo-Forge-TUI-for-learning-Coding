/**
 * Lektion 07 - Example 06: Praxis-Patterns
 *
 * Ausfuehren mit: npx tsx examples/06-praxis-patterns.ts
 *
 * State Machines, Result Type, Event System, Command Pattern.
 */

// ─── PATTERN 1: STATE MACHINE ───────────────────────────────────────────────

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

type OrderState =
  | { status: "draft"; items: CartItem[] }
  | { status: "submitted"; items: CartItem[]; submittedAt: Date }
  | { status: "paid"; items: CartItem[]; submittedAt: Date; paidAt: Date; paymentId: string }
  | { status: "shipped"; items: CartItem[]; submittedAt: Date; paidAt: Date; paymentId: string; trackingNumber: string };

function submitOrder(order: Extract<OrderState, { status: "draft" }>): Extract<OrderState, { status: "submitted" }> {
  return { ...order, status: "submitted", submittedAt: new Date() };
}

function payOrder(
  order: Extract<OrderState, { status: "submitted" }>,
  paymentId: string
): Extract<OrderState, { status: "paid" }> {
  return { ...order, status: "paid", paidAt: new Date(), paymentId };
}

function shipOrder(
  order: Extract<OrderState, { status: "paid" }>,
  trackingNumber: string
): Extract<OrderState, { status: "shipped" }> {
  return { ...order, status: "shipped", trackingNumber };
}

function describeOrder(order: OrderState): string {
  switch (order.status) {
    case "draft":
      return `Entwurf: ${order.items.length} Artikel`;
    case "submitted":
      return `Eingereicht am ${order.submittedAt.toLocaleDateString()}`;
    case "paid":
      return `Bezahlt (${order.paymentId})`;
    case "shipped":
      return `Versendet (${order.trackingNumber})`;
  }
}

// State Machine in Aktion:
const items: CartItem[] = [
  { productId: "p1", name: "TypeScript-Buch", quantity: 1, price: 39.99 },
  { productId: "p2", name: "Tastatur", quantity: 1, price: 89.99 },
];

let order: OrderState = { status: "draft", items };
console.log("State Machine — Bestellung:");
console.log(`  1. ${describeOrder(order)}`);

const submitted = submitOrder(order as Extract<OrderState, { status: "draft" }>);
console.log(`  2. ${describeOrder(submitted)}`);

const paid = payOrder(submitted, "PAY-12345");
console.log(`  3. ${describeOrder(paid)}`);

const shipped = shipOrder(paid, "TRACK-67890");
console.log(`  4. ${describeOrder(shipped)}`);

// Ungueltige Transition wird verhindert:
// payOrder(order as any, "PAY-999");  // Wuerde zur Compilezeit warnen!

// ─── PATTERN 2: RESULT TYPE ────────────────────────────────────────────────

type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}
function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Verkettung von Result-Werten (Railway-Pattern)
function pipe<A, B, E>(
  result: Result<A, E>,
  fn: (value: A) => Result<B, E>
): Result<B, E> {
  if (!result.ok) return result;  // Fehler durchreichen
  return fn(result.value);
}

function parseNumber(input: string): Result<number> {
  const n = Number(input);
  return Number.isNaN(n) ? err(`"${input}" ist keine Zahl`) : ok(n);
}

function validateAge(age: number): Result<number> {
  if (age < 0 || age > 150) return err(`Alter ${age} ist ungueltig`);
  return ok(age);
}

function validateEven(n: number): Result<number> {
  if (n % 2 !== 0) return err(`${n} ist ungerade`);
  return ok(n);
}

console.log("\nResult Type — Railway Pattern:");
for (const input of ["42", "abc", "200", "30"]) {
  const result = pipe(pipe(parseNumber(input), validateAge), validateEven);
  if (result.ok) {
    console.log(`  "${input}" -> OK: ${result.value}`);
  } else {
    console.log(`  "${input}" -> Error: ${result.error}`);
  }
}

// ─── PATTERN 3: EVENT SYSTEM ────────────────────────────────────────────────

type AppEvent =
  | { type: "USER_LOGIN"; payload: { userId: string; timestamp: Date } }
  | { type: "USER_LOGOUT"; payload: { userId: string } }
  | { type: "ITEM_ADDED"; payload: { itemId: string; quantity: number } }
  | { type: "ORDER_PLACED"; payload: { orderId: string; total: number } };

// Typsicherer Event Handler
type EventHandler<T extends AppEvent["type"]> = (
  payload: Extract<AppEvent, { type: T }>["payload"]
) => void;

// Handler-Registry
const handlers: Partial<{ [K in AppEvent["type"]]: EventHandler<K> }> = {};

function on<T extends AppEvent["type"]>(type: T, handler: EventHandler<T>): void {
  (handlers as Record<string, Function>)[type] = handler;
}

function dispatch(event: AppEvent): void {
  const handler = (handlers as Record<string, Function>)[event.type];
  if (handler) {
    handler(event.payload);
  }
}

on("USER_LOGIN", (payload) => {
  console.log(`  Login: User ${payload.userId} at ${payload.timestamp.toISOString()}`);
});

on("ORDER_PLACED", (payload) => {
  console.log(`  Order: ${payload.orderId} (Total: ${payload.total} EUR)`);
});

console.log("\nEvent System:");
dispatch({ type: "USER_LOGIN", payload: { userId: "u-123", timestamp: new Date() } });
dispatch({ type: "ORDER_PLACED", payload: { orderId: "ord-456", total: 129.98 } });
dispatch({ type: "USER_LOGOUT", payload: { userId: "u-123" } }); // Kein Handler — wird ignoriert

// ─── PATTERN 4: COMMAND PATTERN (UNION + INTERSECTION) ──────────────────────

interface CommandBase {
  id: string;
  timestamp: Date;
  userId: string;
}

type CreateUserCmd = CommandBase & {
  type: "CREATE_USER";
  data: { name: string; email: string };
};

type UpdateUserCmd = CommandBase & {
  type: "UPDATE_USER";
  data: { targetId: string; changes: Partial<{ name: string; email: string }> };
};

type DeleteUserCmd = CommandBase & {
  type: "DELETE_USER";
  data: { targetId: string; reason: string };
};

type UserCommand = CreateUserCmd | UpdateUserCmd | DeleteUserCmd;

function executeCommand(cmd: UserCommand): string {
  const base = `[${cmd.timestamp.toISOString()}] User ${cmd.userId}:`;

  switch (cmd.type) {
    case "CREATE_USER":
      return `${base} Created ${cmd.data.name} (${cmd.data.email})`;
    case "UPDATE_USER":
      return `${base} Updated ${cmd.data.targetId}: ${JSON.stringify(cmd.data.changes)}`;
    case "DELETE_USER":
      return `${base} Deleted ${cmd.data.targetId} (${cmd.data.reason})`;
  }
}

console.log("\nCommand Pattern:");
const commands: UserCommand[] = [
  { id: "c1", timestamp: new Date(), userId: "admin", type: "CREATE_USER", data: { name: "Eve", email: "eve@x.com" } },
  { id: "c2", timestamp: new Date(), userId: "admin", type: "UPDATE_USER", data: { targetId: "u-1", changes: { name: "Eva" } } },
  { id: "c3", timestamp: new Date(), userId: "admin", type: "DELETE_USER", data: { targetId: "u-2", reason: "Inaktiv" } },
];

for (const cmd of commands) {
  console.log(`  ${executeCommand(cmd)}`);
}

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
