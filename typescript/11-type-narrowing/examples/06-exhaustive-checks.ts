/**
 * Lektion 11 - Example 06: Exhaustive Checks
 *
 * Ausfuehren mit: npx tsx examples/06-exhaustive-checks.ts
 *
 * Zeigt das assertNever-Pattern, exhaustive switch/if,
 * und wie never als Sicherheitsnetz funktioniert.
 */

// ─── HILFSFUNKTION: assertNever ─────────────────────────────────────────────

function assertNever(value: never): never {
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
}

// ─── EXHAUSTIVE SWITCH ──────────────────────────────────────────────────────

type TrafficLight = "red" | "yellow" | "green";

function getAction(light: TrafficLight): string {
  switch (light) {
    case "red":
      return "Stop!";
    case "yellow":
      return "Vorsicht!";
    case "green":
      return "Fahren!";
    default:
      // light ist hier never — alle Faelle abgedeckt
      return assertNever(light);
  }
}

console.log("--- Exhaustive Switch ---");
console.log(`Rot:    ${getAction("red")}`);
console.log(`Gelb:   ${getAction("yellow")}`);
console.log(`Gruen:  ${getAction("green")}`);

// Wenn du jetzt "blinking" zum TrafficLight-Typ hinzufuegst:
// type TrafficLight = "red" | "yellow" | "green" | "blinking";
// -> Compile-Fehler im default: Type '"blinking"' is not assignable to type 'never'
// -> Du siehst GENAU welcher Fall fehlt!

// ─── EXHAUSTIVE IF-KETTE ───────────────────────────────────────────────────

type Shape = "circle" | "square" | "triangle";

function describe(shape: Shape): string {
  if (shape === "circle") return "Rund, kein Eck";
  if (shape === "square") return "Vier gleiche Seiten";
  if (shape === "triangle") return "Drei Ecken";
  return assertNever(shape); // Sicherheitsnetz
}

console.log("\n--- Exhaustive if-Kette ---");
console.log(`Kreis:   ${describe("circle")}`);
console.log(`Quadrat: ${describe("square")}`);
console.log(`Dreieck: ${describe("triangle")}`);

// ─── DISCRIMINATED UNIONS MIT EXHAUSTIVE CHECK ──────────────────────────────

interface LoadingState {
  kind: "loading";
}

interface SuccessState {
  kind: "success";
  data: string[];
}

interface ErrorState {
  kind: "error";
  message: string;
}

interface EmptyState {
  kind: "empty";
}

type AppState = LoadingState | SuccessState | ErrorState | EmptyState;

function render(state: AppState): string {
  switch (state.kind) {
    case "loading":
      return "[Spinner]";
    case "success":
      return `[Liste: ${state.data.join(", ")}]`;
    case "error":
      return `[Fehler: ${state.message}]`;
    case "empty":
      return "[Keine Daten]";
    default:
      return assertNever(state);
  }
}

console.log("\n--- Discriminated Unions ---");
console.log(render({ kind: "loading" }));
console.log(render({ kind: "success", data: ["A", "B", "C"] }));
console.log(render({ kind: "error", message: "Timeout" }));
console.log(render({ kind: "empty" }));

// ─── PRAXIS: EVENT HANDLER ─────────────────────────────────────────────────

type AppEvent =
  | { type: "LOGIN"; username: string }
  | { type: "LOGOUT" }
  | { type: "ADD_ITEM"; item: string; quantity: number }
  | { type: "REMOVE_ITEM"; itemId: number };

function handleEvent(event: AppEvent): string {
  switch (event.type) {
    case "LOGIN":
      return `User "${event.username}" eingeloggt`;
    case "LOGOUT":
      return "User ausgeloggt";
    case "ADD_ITEM":
      return `${event.quantity}x "${event.item}" hinzugefuegt`;
    case "REMOVE_ITEM":
      return `Item #${event.itemId} entfernt`;
    default:
      return assertNever(event);
  }
}

console.log("\n--- Event Handler ---");
console.log(handleEvent({ type: "LOGIN", username: "max" }));
console.log(handleEvent({ type: "ADD_ITEM", item: "Laptop", quantity: 1 }));
console.log(handleEvent({ type: "REMOVE_ITEM", itemId: 42 }));
console.log(handleEvent({ type: "LOGOUT" }));

// ─── LAUFZEIT-SCHUTZ: WAS PASSIERT BEI UNERWARTETEN WERTEN? ────────────────

console.log("\n--- Laufzeit-Schutz ---");

// In der Praxis koennten Werte von einer API kommen, die
// TypeScript nicht kennt. assertNever schuetzt auch hier:
try {
  const unbekannt = "blinking" as TrafficLight; // Boeses as!
  getAction(unbekannt);
} catch (e) {
  console.log(`Gefangen: ${(e as Error).message}`);
  // "Unbehandelter Fall: "blinking""
}

// ─── ALTERNATIVE: SATISFIES UND RECORD ──────────────────────────────────────

console.log("\n--- Record + satisfies Pattern ---");

// Statt switch kannst du auch ein Record verwenden.
// Der Compile-Fehler kommt, wenn ein Schluessel fehlt:
type Severity = "info" | "warn" | "error";

const severityColors = {
  info: "blue",
  warn: "yellow",
  error: "red",
} satisfies Record<Severity, string>;
// ^ Wenn du "error" vergisst, meldet TypeScript:
//   Property 'error' is missing

function getColor(severity: Severity): string {
  return severityColors[severity];
}

console.log(`info  -> ${getColor("info")}`);
console.log(`warn  -> ${getColor("warn")}`);
console.log(`error -> ${getColor("error")}`);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
