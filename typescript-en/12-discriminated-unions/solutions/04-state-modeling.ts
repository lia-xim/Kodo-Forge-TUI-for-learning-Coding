/**
 * Lektion 12 - Solution 04: Zustandsmodellierung
 *
 * Ausfuehren mit: npx tsx solutions/04-state-modeling.ts
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
// AUFGABE 1: AsyncState<T>
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Vier Zustaende, jeder mit genau den Properties die sinnvoll sind.
// "idle" und "loading" haben keine zusaetzlichen Daten.
// "error" hat einen Error-String, "success" hat die Daten.
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

function renderAsync<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case "idle":
      return "Bereit";
    case "loading":
      return "Lade...";
    case "error":
      return `Fehler: ${state.error}`;
    case "success":
      return `Daten: ${JSON.stringify(state.data)}`;
    default:
      return assertNever(state);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Media Player State Machine
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Vier Zustaende fuer den Player.
// "stopped" hat keine Zusatzinfos.
// "playing" und "paused" merken sich Track und Position.
// "buffering" hat einen Fortschritt.
type PlayerState =
  | { status: "stopped" }
  | { status: "playing"; track: string; position: number }
  | { status: "paused"; track: string; position: number }
  | { status: "buffering"; track: string; progress: number };

// State Transitions:
// play aus "stopped" braucht einen Track-Namen
function playFromStopped(
  _state: Extract<PlayerState, { status: "stopped" }>,
  track: string
): PlayerState {
  return { status: "playing", track, position: 0 };
}

// play aus "paused" setzt den Track fort
function resume(
  state: Extract<PlayerState, { status: "paused" }>
): PlayerState {
  return { status: "playing", track: state.track, position: state.position };
}

// pause nur aus "playing"
function pause(
  state: Extract<PlayerState, { status: "playing" }>
): PlayerState {
  return { status: "paused", track: state.track, position: state.position };
}

// stop aus jedem Zustand
function stop(_state: PlayerState): PlayerState {
  return { status: "stopped" };
}

function describePlayer(state: PlayerState): string {
  switch (state.status) {
    case "stopped":
      return "Gestoppt";
    case "playing":
      return `Spielt: ${state.track} bei ${state.position}s`;
    case "paused":
      return `Pausiert: ${state.track} bei ${state.position}s`;
    case "buffering":
      return `Puffert: ${state.track} (${state.progress}%)`;
    default:
      return assertNever(state);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: mapAsyncState
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Nur im "success"-Fall die Daten transformieren.
// Alle anderen Zustaende bleiben unveraendert.
// Das ist das gleiche Prinzip wie Array.map — aber fuer States.
function mapAsyncState<T, U>(
  state: AsyncState<T>,
  fn: (data: T) => U
): AsyncState<U> {
  if (state.status === "success") {
    return { status: "success", data: fn(state.data) };
  }
  // idle, loading, error haben kein T — sicher zu casten
  return state as AsyncState<U>;
}


// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== Aufgabe 1: AsyncState ===");
console.log(renderAsync({ status: "idle" }));
console.log(renderAsync({ status: "loading" }));
console.log(renderAsync({ status: "error", error: "Timeout" }));
console.log(renderAsync({ status: "success", data: [1, 2, 3] }));

console.log("\n=== Aufgabe 2: Media Player ===");
let player: PlayerState = { status: "stopped" };
console.log(describePlayer(player));

player = { status: "playing", track: "Bohemian Rhapsody", position: 42 };
console.log(describePlayer(player));

player = { status: "paused", track: "Bohemian Rhapsody", position: 42 };
console.log(describePlayer(player));

player = { status: "buffering", track: "Bohemian Rhapsody", progress: 65 };
console.log(describePlayer(player));

console.log("\n=== Aufgabe 3: mapAsyncState ===");
const state: AsyncState<number[]> = { status: "success", data: [1, 2, 3] };
const mapped = mapAsyncState(state, data => data.reduce((a, b) => a + b, 0));
console.log(renderAsync(mapped));

const errorState: AsyncState<number[]> = { status: "error", error: "Timeout" };
const mappedError = mapAsyncState(errorState, data => data.length);
console.log(renderAsync(mappedError));

console.log("\n--- Alle Loesungen erfolgreich! ---");
