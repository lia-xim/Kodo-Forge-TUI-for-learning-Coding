/**
 * Lektion 06 - Exercise 02: Overloads und Callbacks
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-overloads-und-callbacks.ts
 *
 * 6 Aufgaben zu Function Overloads und Callback-Typisierung.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfacher Overload
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "reverse" mit Overloads:
// - Wenn ein string uebergeben wird: string zurueck (umgedrehter String)
// - Wenn ein number[] uebergeben wird: number[] zurueck (umgedrehtes Array)
//
// Beispiel:
// reverse("hallo") → "ollah"
// reverse([1, 2, 3]) → [3, 2, 1]

// function reverse(value: string): string;
// function reverse(value: number[]): number[];
// function reverse(...) { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Overload mit verschiedener Parameter-Anzahl
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "createDate" mit Overloads:
// - createDate(isoString: string): Date
// - createDate(year: number, month: number, day: number): Date
//
// Hinweis: new Date(year, month - 1, day) — Monate sind 0-basiert!

// function createDate(...) { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Callback-Typ definieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere einen Typ "Transformer<T>" fuer eine Funktion die
// ein T nimmt und ein T zurueckgibt.
// Schreibe dann eine Funktion "applyAll" die ein Array von Transformern
// nacheinander auf einen Wert anwendet.

// type Transformer<T> = ...
// function applyAll<T>(value: T, transformers: Transformer<T>[]): T { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: void-Callback verstehen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "forEach" (eigene Implementation, nicht Array.forEach)
// die ein Array und einen void-Callback nimmt.
// Der Callback bekommt das Element und den Index.

// function forEach<T>(items: T[], callback: ???): void { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Event-System mit Callbacks
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Baue ein einfaches Event-System:
// - on(event: string, listener: Function): unsubscribe-Funktion
// - emit(event: string, data: unknown): void
// Typisiere alles korrekt — kein "any"!

// type Listener = ...
// type Unsubscribe = ...
// interface EventSystem { ... }
// function createEventSystem(): EventSystem { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Comparator und sortBy
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe einen generischen Typ "Comparator<T>" und eine
// Funktion "sortBy" die ein Array und einen Comparator nimmt.
// Das Original-Array darf NICHT veraendert werden!

// type Comparator<T> = ...
// function sortBy<T>(items: T[], compare: Comparator<T>): T[] { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese nach dem Loesen
// ═══════════════════════════════════════════════════════════════════════════

/*
// Aufgabe 1
console.assert(reverse("hallo") === "ollah", "A1: reverse string");
console.assert(JSON.stringify(reverse([1, 2, 3])) === "[3,2,1]", "A1: reverse array");

// Aufgabe 2
const d1 = createDate("2024-03-15");
console.assert(d1 instanceof Date, "A2: createDate string");
const d2 = createDate(2024, 3, 15);
console.assert(d2.getFullYear() === 2024, "A2: createDate numbers year");
console.assert(d2.getMonth() === 2, "A2: createDate numbers month (0-basiert)");
console.assert(d2.getDate() === 15, "A2: createDate numbers day");

// Aufgabe 3
const result = applyAll("hallo", [
  s => s.toUpperCase(),
  s => s + "!",
  s => s + s,
]);
console.assert(result === "HALLO!HALLO!", "A3: applyAll");

// Aufgabe 4
const collected: string[] = [];
forEach(["a", "b", "c"], (item, index) => {
  collected.push(`${index}:${item}`);
});
console.assert(JSON.stringify(collected) === '["0:a","1:b","2:c"]', "A4: forEach");

// Aufgabe 5
const events = createEventSystem();
let received = "";
const unsub = events.on("greet", (data: unknown) => { received = String(data); });
events.emit("greet", "hallo");
console.assert(received === "hallo", "A5: event received");
unsub();
events.emit("greet", "nochmal");
console.assert(received === "hallo", "A5: event after unsub");

// Aufgabe 6
const original = [3, 1, 2];
const sorted = sortBy(original, (a, b) => a - b);
console.assert(JSON.stringify(sorted) === "[1,2,3]", "A6: sortBy aufsteigend");
console.assert(JSON.stringify(original) === "[3,1,2]", "A6: original unveraendert");

console.log("Alle Tests bestanden!");
*/
