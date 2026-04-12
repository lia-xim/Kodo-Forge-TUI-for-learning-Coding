/**
 * Lektion 12 - Example 02: Pattern Matching & Exhaustive Check
 *
 * Ausfuehren mit: npx tsx examples/02-pattern-matching.ts
 *
 * switch/case, Exhaustive Check mit never, if/else Ketten,
 * Early Return Pattern.
 */

// ─── SHAPE UNION ───────────────────────────────────────────────────────────

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

// ─── EXHAUSTIVE CHECK HELPER ───────────────────────────────────────────────

function assertNever(value: never): never {
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
}

// ─── SWITCH/CASE MIT EXHAUSTIVE CHECK ──────────────────────────────────────

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // Wenn alle Faelle behandelt sind, ist shape hier never
      return assertNever(shape);
  }
}

function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return `Kreis (r=${shape.radius})`;
    case "rectangle":
      return `Rechteck (${shape.width}x${shape.height})`;
    case "triangle":
      return `Dreieck (b=${shape.base}, h=${shape.height})`;
    default:
      return assertNever(shape);
  }
}

// ─── IF/ELSE PATTERN ───────────────────────────────────────────────────────

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>): string {
  // Boolean-Diskriminator — if/else ist natuerlicher als switch
  if (result.success) {
    return `Erfolg: ${JSON.stringify(result.data)}`;
  } else {
    return `Fehler: ${result.error}`;
  }
}

// ─── EARLY RETURN PATTERN ──────────────────────────────────────────────────

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: string[] };

function renderState(state: RequestState): string {
  // Frueh zurueckkehren — flacher Code statt verschachtelt
  if (state.status === "idle") {
    return "[Bereit]";
  }

  if (state.status === "loading") {
    return "[Lade...]";
  }

  if (state.status === "error") {
    return `[Fehler: ${state.message}]`;
  }

  // TypeScript weiss: state ist { status: "success"; data: string[] }
  return `[Daten: ${state.data.join(", ")}]`;
}

// ─── NARROWING BY ELIMINATION ──────────────────────────────────────────────

type PaymentMethod =
  | { type: "credit_card"; cardNumber: string; cvv: string }
  | { type: "paypal"; email: string }
  | { type: "bank_transfer"; iban: string; bic: string };

function processPayment(method: PaymentMethod): string {
  if (method.type !== "credit_card" && method.type !== "paypal") {
    // TypeScript hat credit_card und paypal ausgeschlossen
    // method ist hier: { type: "bank_transfer"; iban: string; bic: string }
    return `Ueberweisung an ${method.iban}`;
  }

  if (method.type === "credit_card") {
    return `Kreditkarte ****${method.cardNumber.slice(-4)}`;
  }

  // method ist hier: { type: "paypal"; email: string }
  return `PayPal: ${method.email}`;
}

// ─── DEMONSTRATION ─────────────────────────────────────────────────────────

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 10, height: 3 },
  { kind: "triangle", base: 8, height: 4 },
];

console.log("=== Shapes: Area & Description ===");
for (const shape of shapes) {
  console.log(`${describe(shape)}: Flaeche = ${area(shape).toFixed(2)}`);
}

console.log("\n=== Result Pattern ===");
console.log(handleResult({ success: true, data: [1, 2, 3] }));
console.log(handleResult({ success: false, error: "Timeout" }));

console.log("\n=== Request State (Early Return) ===");
const states: RequestState[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "error", message: "Netzwerkfehler" },
  { status: "success", data: ["Alice", "Bob", "Charlie"] },
];

for (const state of states) {
  console.log(renderState(state));
}

console.log("\n=== Payment Methods ===");
console.log(processPayment({ type: "credit_card", cardNumber: "4111111111111234", cvv: "123" }));
console.log(processPayment({ type: "paypal", email: "user@example.com" }));
console.log(processPayment({ type: "bank_transfer", iban: "DE89370400440532013000", bic: "COBADEFFXXX" }));

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
