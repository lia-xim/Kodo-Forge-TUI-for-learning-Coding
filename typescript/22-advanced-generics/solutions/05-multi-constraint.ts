/**
 * Loesung 05: Multi-Constraints
 *
 * Ausfuehren: npx tsx solutions/05-multi-constraint.ts
 */

// ─── Setup ──────────────────────────────────────────────────────────────

interface HasId { id: number; }
interface HasName { name: string; }
interface HasEmail { email: string; }
interface Serializable { serialize(): string; }
interface Loggable { log(): void; }

// ─── TODO 1: Intersection-Constraint Funktion ───────────────────────────

function createUser<T extends HasId & HasName & HasEmail>(user: T): string {
  return `User #${user.id}: ${user.name} (${user.email})`;
}

console.log("=== Intersection-Constraint ===");
console.log(createUser({ id: 1, name: "Max", email: "max@test.de" }));
// "User #1: Max (max@test.de)"

// Extra Properties sind OK bei Generics:
console.log(createUser({
  id: 2, name: "Anna", email: "anna@test.de", role: "admin"
}));

// ─── TODO 2: Flexible Constraints mit Partial ───────────────────────────

function displayEntity<T extends HasId & Partial<HasName>>(entity: T): string {
  return entity.name
    ? `Entity #${entity.id}: ${entity.name}`
    : `Entity #${entity.id}: (unnamed)`;
}

console.log("\n=== Flexible Constraints (Partial) ===");
console.log(displayEntity({ id: 1, name: "Max" }));  // "Entity #1: Max"
console.log(displayEntity({ id: 2 }));                 // "Entity #2: (unnamed)"

// ─── TODO 3: F-bounded Polymorphism ────────────────────────────────────

interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number;
}

class Price implements Comparable<Price> {
  constructor(public amount: number) {}

  compareTo(other: Price): number {
    return this.amount - other.amount;
  }

  toString(): string {
    return `Price(${this.amount.toFixed(2)})`;
  }
}

class Priority implements Comparable<Priority> {
  constructor(public level: number) {}

  compareTo(other: Priority): number {
    return this.level - other.level;
  }

  toString(): string {
    return `Priority(${this.level})`;
  }
}

function max<T extends Comparable<T>>(a: T, b: T): T {
  return a.compareTo(b) >= 0 ? a : b;
}

console.log("\n=== F-bounded Polymorphism ===");
const expensive = new Price(99.99);
const cheap = new Price(9.99);
console.log("Max price:", max(expensive, cheap).toString()); // Price(99.99)

const high = new Priority(10);
const low = new Priority(1);
console.log("Max priority:", max(high, low).toString()); // Priority(10)

// Das kompiliert NICHT (verschiedene Comparable-Typen):
// max(expensive, high); // ERROR!

// ─── TODO 4: Conditional Constraint ─────────────────────────────────────

type RequiredActions<T> =
  T extends Serializable ? { save(): void; export(): string } :
  T extends Loggable ? { audit(): void } :
  {};

function processItem<T extends HasId>(item: T & RequiredActions<T>): void {
  console.log(`Processing entity #${item.id}`);

  if ('save' in item && typeof item.save === 'function') {
    item.save();
  }
  if ('audit' in item && typeof item.audit === 'function') {
    item.audit();
  }
}

console.log("\n=== Conditional Constraints ===");

// Serializable Entity → braucht save() und export()
processItem({
  id: 1,
  serialize() { return "{}"; },
  save() { console.log("  Saved!"); },
  export() { return "exported"; },
});

// Loggable Entity → braucht audit()
processItem({
  id: 2,
  log() { console.log("  Logged!"); },
  audit() { console.log("  Audited!"); },
});

// Einfache Entity → keine extra Methoden noetig
processItem({ id: 3 });

console.log("\n=== Zusammenfassung ===");
console.log("Intersection (&): Alle Properties muessen da sein");
console.log("Partial: Optionale Properties im Constraint");
console.log("F-bounded: Typ vergleicht sich nur mit sich selbst");
console.log("Conditional: Anforderungen haengen vom konkreten Typ ab");
