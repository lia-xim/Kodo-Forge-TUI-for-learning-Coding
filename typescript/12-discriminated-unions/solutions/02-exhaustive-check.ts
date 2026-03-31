/**
 * Lektion 12 - Solution 02: Exhaustive Checks
 *
 * Ausfuehren mit: npx tsx solutions/02-exhaustive-check.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: assertNever
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: assertNever nimmt einen never-Wert und wirft immer einen Error.
// Wenn alle Faelle behandelt sind, ist der Wert im default-Branch never.
// Wenn ein Fall fehlt, kompiliert der Code nicht — weil der Wert
// noch einen konkreten Typ hat und nicht never zuweisbar ist.
function assertNever(value: never): never {
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Traffic Light mit assertNever
// ═══════════════════════════════════════════════════════════════════════════

type TrafficLight =
  | { color: "red"; duration: number }
  | { color: "yellow"; duration: number }
  | { color: "green"; duration: number };

// Loesung: switch/case mit assertNever im default-Branch.
// Wenn eine neue Farbe hinzukommt (z.B. "flashing"), warnt der Compiler.
function trafficAction(light: TrafficLight): string {
  switch (light.color) {
    case "red":
      return "Anhalten";
    case "yellow":
      return "Vorsicht";
    case "green":
      return "Fahren";
    default:
      return assertNever(light);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Early Return Pattern
// ═══════════════════════════════════════════════════════════════════════════

type FormState =
  | { status: "pristine" }
  | { status: "dirty"; changedFields: string[] }
  | { status: "submitting"; changedFields: string[] }
  | { status: "submitted"; response: string }
  | { status: "error"; errorMessage: string };

// Loesung: if + return fuer jeden Status.
// Der Code ist flach (kein verschachteltes if/else) und leicht lesbar.
// TypeScript narrowt nach jedem return die verbleibenden Varianten.
function describeFormState(state: FormState): string {
  if (state.status === "pristine") {
    return "Formular noch nicht bearbeitet";
  }

  if (state.status === "dirty") {
    return `Geaenderte Felder: ${state.changedFields.join(", ")}`;
  }

  if (state.status === "submitting") {
    return `Wird gesendet... (${state.changedFields.length} Felder)`;
  }

  if (state.status === "submitted") {
    return `Erfolgreich: ${state.response}`;
  }

  // TypeScript weiss: state.status ist "error"
  return `Fehler: ${state.errorMessage}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Exhaustive Check mit Return-Typ
// ═══════════════════════════════════════════════════════════════════════════

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

// Loesung: Der explizite Return-Typ ": number" stellt sicher,
// dass jeder Branch einen Wert zurueckgibt. Wenn ein Fall fehlt,
// meldet TypeScript "Function lacks ending return statement".
function workHours(day: Weekday): number {
  switch (day) {
    case "monday":
    case "tuesday":
    case "wednesday":
    case "thursday":
      return 8;
    case "friday":
      return 6;
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== Aufgabe 2: Traffic Light ===");
console.log(trafficAction({ color: "red", duration: 60 }));
console.log(trafficAction({ color: "yellow", duration: 3 }));
console.log(trafficAction({ color: "green", duration: 45 }));

console.log("\n=== Aufgabe 3: Form State ===");
console.log(describeFormState({ status: "pristine" }));
console.log(describeFormState({ status: "dirty", changedFields: ["name", "email"] }));
console.log(describeFormState({ status: "submitting", changedFields: ["name"] }));
console.log(describeFormState({ status: "submitted", response: "User erstellt" }));
console.log(describeFormState({ status: "error", errorMessage: "Validierung fehlgeschlagen" }));

console.log("\n=== Aufgabe 4: Work Hours ===");
console.log(`Montag: ${workHours("monday")}h`);
console.log(`Freitag: ${workHours("friday")}h`);

console.log("\n--- Alle Loesungen erfolgreich! ---");
