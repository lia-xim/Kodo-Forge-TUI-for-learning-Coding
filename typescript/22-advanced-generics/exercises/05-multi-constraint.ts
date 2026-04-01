/**
 * Exercise 05: Multi-Constraints
 *
 * Intersection-Constraints, F-bounded Polymorphism,
 * und Conditional Constraints kombinieren.
 *
 * Ausfuehren: npx tsx exercises/05-multi-constraint.ts
 */

// ─── Setup ──────────────────────────────────────────────────────────────

interface HasId { id: number; }
interface HasName { name: string; }
interface HasEmail { email: string; }
interface Serializable { serialize(): string; }
interface Loggable { log(): void; }

// ─── TODO 1: Intersection-Constraint Funktion ───────────────────────────
// Schreibe eine Funktion createUser die ein Objekt akzeptiert das
// HasId UND HasName UND HasEmail implementiert.
// Die Funktion soll einen String zurueckgeben: "User #id: name (email)"

// TODO: function createUser<T extends ???>(user: T): string


// ─── TODO 2: Flexible Constraints mit Partial ───────────────────────────
// Schreibe eine Funktion displayEntity die:
// - HasId MUSS haben
// - HasName KANN haben (Partial)
// - Wenn name vorhanden: "Entity #id: name"
// - Wenn name fehlt: "Entity #id: (unnamed)"

// TODO: function displayEntity<T extends ???>(entity: T): string


// ─── TODO 3: F-bounded Polymorphism ────────────────────────────────────
// Implementiere ein Comparable<T> Interface und zwei Klassen:
// - Price: Vergleich nach Betrag (amount)
// - Priority: Vergleich nach Level (level)
// Schreibe eine max()-Funktion die das groessere Element zurueckgibt.

// TODO: interface Comparable<T extends Comparable<T>> { ... }
// TODO: class Price implements Comparable<Price> { ... }
// TODO: class Priority implements Comparable<Priority> { ... }
// TODO: function max<T extends Comparable<T>>(a: T, b: T): T


// ─── TODO 4: Conditional Constraint ─────────────────────────────────────
// Schreibe einen Typ RequiredActions<T>:
// - Wenn T extends Serializable → { save(): void; export(): string }
// - Wenn T extends Loggable → { audit(): void }
// - Sonst → {}
//
// Dann: Eine Funktion processItem die T & RequiredActions<T> akzeptiert.

// TODO: type RequiredActions<T> = ...
// TODO: function processItem<T extends HasId>(item: T & RequiredActions<T>): void


// ─── Tests ──────────────────────────────────────────────────────────────

/*
// Entkommentiere wenn implementiert:

// TODO 1:
console.log(createUser({ id: 1, name: "Max", email: "max@test.de" }));
// "User #1: Max (max@test.de)"

// TODO 2:
console.log(displayEntity({ id: 1, name: "Max" }));  // "Entity #1: Max"
console.log(displayEntity({ id: 2 }));                 // "Entity #2: (unnamed)"

// TODO 3:
const expensive = new Price(99.99);
const cheap = new Price(9.99);
console.log("Max price:", max(expensive, cheap)); // Price(99.99)

const high = new Priority(10);
const low = new Priority(1);
console.log("Max priority:", max(high, low)); // Priority(10)

// Das hier sollte NICHT kompilieren:
// max(expensive, high); // ERROR: Price und Priority nicht vergleichbar!

// TODO 4:
processItem({
  id: 1,
  serialize() { return "{}"; },
  save() { console.log("Saved!"); },
  export() { return "exported"; },
});
*/

console.log("Exercise 05: Implementiere die TODOs oben!");
