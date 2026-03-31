/**
 * Lektion 13 - Exercise 03: Constraints
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-constraints.ts
 *
 * 5 Aufgaben zu extends, keyof und mehreren Constraints.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Length-Constraint
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "longest" die zwei Werte
// mit .length vergleicht und den laengeren zurueckgibt.
// Constraint: T muss { length: number } haben.
// function longest...

// Tests:
// console.log(longest("ab", "xyz"));       // "xyz"
// console.log(longest([1, 2], [1, 2, 3])); // [1, 2, 3]
// longest(10, 20); // Soll Error sein! number hat kein .length

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: keyof Constraint — getProperty
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "getProperty" die ein Objekt
// und einen Key nimmt und den Wert typsicher zurueckgibt.
// function getProperty...

// Tests:
// const user = { name: "Max", age: 30, active: true };
// const name = getProperty(user, "name");     // string
// const age = getProperty(user, "age");       // number
// console.log(`${name}, ${age}`);
// getProperty(user, "email"); // Soll Error sein!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: pluck — Werte aus Array von Objekten extrahieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "pluck" die ein Array von
// Objekten und einen Key nimmt und ein Array der Werte zurueckgibt.
// function pluck...

// Tests:
// const products = [
//   { id: 1, title: "Laptop", price: 999 },
//   { id: 2, title: "Mouse", price: 29 },
// ];
// const titles = pluck(products, "title");  // string[]
// const prices = pluck(products, "price");  // number[]
// console.log(titles); // ["Laptop", "Mouse"]
// console.log(prices); // [999, 29]

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: merge mit object-Constraint
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "merge" die zwei Objekte
// zusammenfuehrt. Beide Parameter muessen Objekte sein (extends object).
// Der Rueckgabetyp soll T & U sein.
// function merge...

// Tests:
// const merged = merge({ name: "Max" }, { age: 30 });
// console.log(merged.name); // "Max"
// console.log(merged.age);  // 30
// merge("hallo", 42); // Soll Error sein! Keine Objekte

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Mehrere Constraints — updateEntity
// ═══════════════════════════════════════════════════════════════════════════

// interface HasId { id: number; }
// interface HasTimestamp { updatedAt: Date; }

// TODO: Schreibe eine generische Funktion "updateEntity" die:
// - T extends HasId & HasTimestamp (muss id UND updatedAt haben)
// - Ein Entity und ein Partial<T> nimmt
// - Das Entity mit den Updates merged und updatedAt aktualisiert
// function updateEntity...

// Tests:
// const user = { id: 1, name: "Max", age: 30, updatedAt: new Date("2024-01-01") };
// const updated = updateEntity(user, { name: "Maximilian" });
// console.log(updated.name);      // "Maximilian"
// console.log(updated.id);        // 1 (unveraendert)
// console.log(updated.updatedAt); // Neues Datum
