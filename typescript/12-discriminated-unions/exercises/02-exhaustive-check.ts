/**
 * Lektion 12 - Exercise 02: Exhaustive Checks
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-exhaustive-check.ts
 *
 * 4 Aufgaben zu switch/case, assertNever und vollstaendiger
 * Fallunterscheidung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: assertNever implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere die assertNever-Hilfsfunktion.
// Sie nimmt einen never-Wert und wirft einen Error.
// function assertNever(value: never): never { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Exhaustive switch/case mit assertNever
// ═══════════════════════════════════════════════════════════════════════════

type TrafficLight =
  | { color: "red"; duration: number }
  | { color: "yellow"; duration: number }
  | { color: "green"; duration: number };

// TODO: Erstelle eine Funktion "trafficAction" die fuer jede Ampelfarbe
// die passende Aktion zurueckgibt:
// red -> "Anhalten"
// yellow -> "Vorsicht"
// green -> "Fahren"
// Verwende switch/case mit assertNever im default-Branch!
// function trafficAction(light: TrafficLight): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Early Return Pattern
// ═══════════════════════════════════════════════════════════════════════════

type FormState =
  | { status: "pristine" }
  | { status: "dirty"; changedFields: string[] }
  | { status: "submitting"; changedFields: string[] }
  | { status: "submitted"; response: string }
  | { status: "error"; errorMessage: string };

// TODO: Erstelle eine Funktion "describeFormState" die den Zustand
// als lesbaren String zurueckgibt. Verwende das Early Return Pattern
// (kein switch, sondern if + return).
//
// pristine -> "Formular noch nicht bearbeitet"
// dirty -> "Geaenderte Felder: <fields kommasepariert>"
// submitting -> "Wird gesendet... (<fields.length> Felder)"
// submitted -> "Erfolgreich: <response>"
// error -> "Fehler: <errorMessage>"
//
// function describeFormState(state: FormState): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Exhaustive Check mit Return-Typ
// ═══════════════════════════════════════════════════════════════════════════

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

// TODO: Erstelle eine Funktion "workHours" die fuer jeden Wochentag
// die Arbeitsstunden zurueckgibt:
// monday-thursday -> 8
// friday -> 6
// Verwende einen switch mit explizitem Return-Typ number.
// Stelle sicher, dass der Compiler warnt, wenn ein Tag fehlt.
//
// function workHours(day: Weekday): number { ... }


// ═══════════════════════════════════════════════════════════════════════════
// TESTS (nicht aendern!)
// ═══════════════════════════════════════════════════════════════════════════

/*
// Entkommentiere nach dem Loesen:

console.log("=== Aufgabe 2: Traffic Light ===");
console.log(trafficAction({ color: "red", duration: 60 }));      // "Anhalten"
console.log(trafficAction({ color: "yellow", duration: 3 }));     // "Vorsicht"
console.log(trafficAction({ color: "green", duration: 45 }));     // "Fahren"

console.log("\n=== Aufgabe 3: Form State ===");
console.log(describeFormState({ status: "pristine" }));
console.log(describeFormState({ status: "dirty", changedFields: ["name", "email"] }));
console.log(describeFormState({ status: "submitting", changedFields: ["name"] }));
console.log(describeFormState({ status: "submitted", response: "User erstellt" }));
console.log(describeFormState({ status: "error", errorMessage: "Validierung fehlgeschlagen" }));

console.log("\n=== Aufgabe 4: Work Hours ===");
console.log(`Montag: ${workHours("monday")}h`);     // 8
console.log(`Freitag: ${workHours("friday")}h`);     // 6
*/
