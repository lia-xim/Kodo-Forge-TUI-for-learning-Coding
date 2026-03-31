/**
 * Lektion 13 - Exercise 05: Eigene generische Utility-Funktionen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-utility-funktionen.ts
 *
 * 5 Aufgaben — eigene wiederverwendbare generische Funktionen bauen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: groupBy
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "groupBy" die ein Array
// und eine Key-Funktion nimmt und ein Record zurueckgibt.
// function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]>
// function groupBy...

// Tests:
// const users = [
//   { name: "Max", role: "admin" },
//   { name: "Anna", role: "user" },
//   { name: "Bob", role: "admin" },
// ];
// const byRole = groupBy(users, u => u.role);
// console.log(byRole.admin); // [{ name: "Max", ... }, { name: "Bob", ... }]

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: chunk
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "chunk" die ein Array
// in Gruppen fester Groesse aufteilt.
// function chunk...

// Tests:
// console.log(chunk([1, 2, 3, 4, 5], 2)); // [[1,2], [3,4], [5]]
// console.log(chunk(["a", "b", "c"], 2)); // [["a","b"], ["c"]]

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: uniqueBy
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "uniqueBy" die Duplikate
// basierend auf einer Key-Funktion entfernt.
// function uniqueBy...

// Tests:
// const items = [
//   { id: 1, name: "Max" },
//   { id: 2, name: "Anna" },
//   { id: 1, name: "Max (Duplikat)" },
// ];
// const unique = uniqueBy(items, item => item.id);
// console.log(unique); // [{ id: 1, name: "Max" }, { id: 2, name: "Anna" }]

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: mapValues
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "mapValues" die die Werte
// eines Objekts transformiert (die Keys bleiben gleich).
// function mapValues<T, U>(obj: Record<string, T>, fn: (value: T) => U): Record<string, U>
// function mapValues...

// Tests:
// const prices = { laptop: 999, mouse: 29, keyboard: 79 };
// const withTax = mapValues(prices, p => p * 1.19);
// console.log(withTax); // { laptop: 1188.81, mouse: 34.51, keyboard: 94.01 }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: createStateMachine (Bonus)
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine generische State-Machine:
// function createStateMachine<TState extends string>(
//   initialState: TState,
//   transitions: Record<TState, TState[]>
// )
// Rueckgabe: { getState(): TState, transition(to: TState): boolean }
// transition gibt true zurueck wenn der Uebergang gueltig ist

// Tests:
// type TrafficLight = "red" | "yellow" | "green";
// const light = createStateMachine<TrafficLight>("red", {
//   red: ["green"],
//   green: ["yellow"],
//   yellow: ["red"],
// });
// console.log(light.getState());         // "red"
// console.log(light.transition("green")); // true
// console.log(light.getState());         // "green"
// console.log(light.transition("red"));  // false (nicht erlaubt!)
