/**
 * Lektion 12 - Exercise 05: Praxis-Patterns
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-praxis-patterns.ts
 *
 * 3 Aufgaben zu API Responses, Action Types und Error-Hierarchien.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Typsichere API-Response verarbeiten
// ═══════════════════════════════════════════════════════════════════════════

type ApiResponse =
  | { type: "success"; data: { id: number; name: string }[]; total: number }
  | { type: "empty"; message: string }
  | { type: "error"; code: number; message: string }
  | { type: "unauthorized"; redirectUrl: string };

// TODO: Erstelle eine Funktion "handleResponse" die fuer jede Variante
// eine passende Meldung zurueckgibt:
// success -> "Geladen: <total> Eintraege (<erstes name>, ...)"
// empty -> "Leer: <message>"
// error -> "Fehler <code>: <message>"
// unauthorized -> "Nicht autorisiert — Weiterleitung zu <redirectUrl>"
//
// function handleResponse(response: ApiResponse): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Action Types fuer einen Counter-Reducer
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere eine Discriminated Union "CounterAction" mit:
// - { type: "INCREMENT" }
// - { type: "DECREMENT" }
// - { type: "ADD"; payload: { amount: number } }
// - { type: "RESET" }
// - { type: "SET"; payload: { value: number } }
//
// type CounterAction = ...

type CounterState = { count: number };

// TODO: Erstelle eine Reducer-Funktion "counterReducer":
// INCREMENT -> count + 1
// DECREMENT -> count - 1
// ADD -> count + payload.amount
// RESET -> count = 0
// SET -> count = payload.value
//
// function counterReducer(state: CounterState, action: CounterAction): CounterState { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Error-Hierarchie mit Extract
// ═══════════════════════════════════════════════════════════════════════════

type AppError =
  | { kind: "network"; url: string; retryable: boolean }
  | { kind: "validation"; fields: { name: string; message: string }[] }
  | { kind: "auth"; reason: "expired" | "invalid" | "forbidden" }
  | { kind: "timeout"; operation: string; durationMs: number };

// TODO: Erstelle eine Funktion "describeError" die den Error als
// lesbaren String formatiert:
// network -> "Netzwerk-Fehler: <url>" + " (wiederholbar)" falls retryable
// validation -> "Validierung: <field1>: <msg1>, <field2>: <msg2>, ..."
// auth -> "Auth: <reason>"  (expired/invalid/forbidden auf Deutsch)
// timeout -> "Timeout: <operation> nach <durationMs>ms"
//
// function describeError(error: AppError): string { ... }

// TODO: Nutze Extract um einen Typ "RetryableError" zu erstellen,
// der NUR die Netzwerk- und Timeout-Fehler enthaelt:
// type RetryableError = ...

// TODO: Erstelle eine Funktion "shouldRetry" die prueft,
// ob ein AppError wiederholt werden sollte:
// network: nur wenn retryable === true
// timeout: immer true
// andere: false
//
// function shouldRetry(error: AppError): boolean { ... }


// ═══════════════════════════════════════════════════════════════════════════
// TESTS (nicht aendern!)
// ═══════════════════════════════════════════════════════════════════════════

/*
// Entkommentiere nach dem Loesen:

console.log("=== Aufgabe 1: API Response ===");
console.log(handleResponse({ type: "success", data: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }], total: 2 }));
console.log(handleResponse({ type: "empty", message: "Keine Treffer" }));
console.log(handleResponse({ type: "error", code: 500, message: "Internal Server Error" }));
console.log(handleResponse({ type: "unauthorized", redirectUrl: "/login" }));

console.log("\n=== Aufgabe 2: Counter Reducer ===");
let state: CounterState = { count: 0 };
state = counterReducer(state, { type: "INCREMENT" });
console.log(`INCREMENT: ${state.count}`);  // 1
state = counterReducer(state, { type: "ADD", payload: { amount: 5 } });
console.log(`ADD 5: ${state.count}`);      // 6
state = counterReducer(state, { type: "DECREMENT" });
console.log(`DECREMENT: ${state.count}`);  // 5
state = counterReducer(state, { type: "SET", payload: { value: 100 } });
console.log(`SET 100: ${state.count}`);    // 100
state = counterReducer(state, { type: "RESET" });
console.log(`RESET: ${state.count}`);      // 0

console.log("\n=== Aufgabe 3: Error-Hierarchie ===");
console.log(describeError({ kind: "network", url: "/api/data", retryable: true }));
console.log(describeError({ kind: "validation", fields: [{ name: "email", message: "ungueltig" }] }));
console.log(describeError({ kind: "auth", reason: "expired" }));
console.log(describeError({ kind: "timeout", operation: "fetchUsers", durationMs: 5000 }));

console.log(`\nNetwork retryable: ${shouldRetry({ kind: "network", url: "/api", retryable: true })}`);  // true
console.log(`Network not retryable: ${shouldRetry({ kind: "network", url: "/api", retryable: false })}`); // false
console.log(`Timeout: ${shouldRetry({ kind: "timeout", operation: "fetch", durationMs: 3000 })}`);        // true
console.log(`Auth: ${shouldRetry({ kind: "auth", reason: "expired" })}`);                                 // false
*/
