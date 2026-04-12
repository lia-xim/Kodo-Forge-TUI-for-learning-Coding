/**
 * Lektion 12 - Solution 05: Praxis-Patterns
 *
 * Ausfuehren mit: npx tsx solutions/05-praxis-patterns.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════════════════════════

function assertNever(value: never): never {
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: API Response
// ═══════════════════════════════════════════════════════════════════════════

type ApiResponse =
  | { type: "success"; data: { id: number; name: string }[]; total: number }
  | { type: "empty"; message: string }
  | { type: "error"; code: number; message: string }
  | { type: "unauthorized"; redirectUrl: string };

// Loesung: switch/case mit erschoepfender Behandlung.
// Jede Variante hat andere Properties — der Diskriminator "type"
// ermoeglicht sicheren Zugriff.
function handleResponse(response: ApiResponse): string {
  switch (response.type) {
    case "success": {
      const names = response.data.map(d => d.name).join(", ");
      return `Geladen: ${response.total} Eintraege (${names})`;
    }
    case "empty":
      return `Leer: ${response.message}`;
    case "error":
      return `Fehler ${response.code}: ${response.message}`;
    case "unauthorized":
      return `Nicht autorisiert — Weiterleitung zu ${response.redirectUrl}`;
    default:
      return assertNever(response);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Counter Reducer
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: "type" als Diskriminator.
// Actions ohne Payload (INCREMENT, DECREMENT, RESET) haben kein payload.
// Actions mit Payload (ADD, SET) haben ein typisiertes payload-Objekt.
type CounterAction =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "ADD"; payload: { amount: number } }
  | { type: "RESET" }
  | { type: "SET"; payload: { value: number } };

type CounterState = { count: number };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "ADD":
      // action.payload ist hier { amount: number }
      return { count: state.count + action.payload.amount };
    case "RESET":
      return { count: 0 };
    case "SET":
      // action.payload ist hier { value: number }
      return { count: action.payload.value };
    default:
      return assertNever(action);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Error-Hierarchie mit Extract
// ═══════════════════════════════════════════════════════════════════════════

type AppError =
  | { kind: "network"; url: string; retryable: boolean }
  | { kind: "validation"; fields: { name: string; message: string }[] }
  | { kind: "auth"; reason: "expired" | "invalid" | "forbidden" }
  | { kind: "timeout"; operation: string; durationMs: number };

function describeError(error: AppError): string {
  switch (error.kind) {
    case "network":
      return `Netzwerk-Fehler: ${error.url}${error.retryable ? " (wiederholbar)" : ""}`;
    case "validation":
      return `Validierung: ${error.fields.map(f => `${f.name}: ${f.message}`).join(", ")}`;
    case "auth": {
      const reasons: Record<typeof error.reason, string> = {
        expired: "Sitzung abgelaufen",
        invalid: "Ungueltige Anmeldedaten",
        forbidden: "Zugriff verweigert",
      };
      return `Auth: ${reasons[error.reason]}`;
    }
    case "timeout":
      return `Timeout: ${error.operation} nach ${error.durationMs}ms`;
    default:
      return assertNever(error);
  }
}

// Extract zieht die Varianten heraus, die "retryable" sein koennen:
type RetryableError =
  | Extract<AppError, { kind: "network" }>
  | Extract<AppError, { kind: "timeout" }>;

// shouldRetry prueft ob ein Error wiederholt werden sollte.
// network: nur wenn retryable === true
// timeout: immer (Timeouts sind per Definition wiederholbar)
// auth/validation: nie
function shouldRetry(error: AppError): boolean {
  switch (error.kind) {
    case "network":
      return error.retryable;
    case "timeout":
      return true;
    case "auth":
    case "validation":
      return false;
    default:
      return assertNever(error);
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== Aufgabe 1: API Response ===");
console.log(handleResponse({ type: "success", data: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }], total: 2 }));
console.log(handleResponse({ type: "empty", message: "Keine Treffer" }));
console.log(handleResponse({ type: "error", code: 500, message: "Internal Server Error" }));
console.log(handleResponse({ type: "unauthorized", redirectUrl: "/login" }));

console.log("\n=== Aufgabe 2: Counter Reducer ===");
let state: CounterState = { count: 0 };
state = counterReducer(state, { type: "INCREMENT" });
console.log(`INCREMENT: ${state.count}`);
state = counterReducer(state, { type: "ADD", payload: { amount: 5 } });
console.log(`ADD 5: ${state.count}`);
state = counterReducer(state, { type: "DECREMENT" });
console.log(`DECREMENT: ${state.count}`);
state = counterReducer(state, { type: "SET", payload: { value: 100 } });
console.log(`SET 100: ${state.count}`);
state = counterReducer(state, { type: "RESET" });
console.log(`RESET: ${state.count}`);

console.log("\n=== Aufgabe 3: Error-Hierarchie ===");
console.log(describeError({ kind: "network", url: "/api/data", retryable: true }));
console.log(describeError({ kind: "validation", fields: [{ name: "email", message: "ungueltig" }] }));
console.log(describeError({ kind: "auth", reason: "expired" }));
console.log(describeError({ kind: "timeout", operation: "fetchUsers", durationMs: 5000 }));

console.log(`\nNetwork retryable: ${shouldRetry({ kind: "network", url: "/api", retryable: true })}`);
console.log(`Network not retryable: ${shouldRetry({ kind: "network", url: "/api", retryable: false })}`);
console.log(`Timeout: ${shouldRetry({ kind: "timeout", operation: "fetch", durationMs: 3000 })}`);
console.log(`Auth: ${shouldRetry({ kind: "auth", reason: "expired" })}`);

console.log("\n--- Alle Loesungen erfolgreich! ---");
