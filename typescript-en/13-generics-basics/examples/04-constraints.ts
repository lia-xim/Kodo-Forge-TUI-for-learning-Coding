/**
 * Lektion 13 - Example 04: Constraints
 *
 * Ausfuehren mit: npx tsx examples/04-constraints.ts
 *
 * extends, keyof-Constraint, mehrere Constraints, Praxis-Patterns.
 */

// ─── DAS PROBLEM: T KANN ALLES SEIN ────────────────────────────────────────

// Ohne Constraint: TypeScript weiss nichts ueber T
// function getLength<T>(arg: T): number {
//   return arg.length; // Error! T hat vielleicht kein .length
// }

// ─── EXTENDS ALS CONSTRAINT ────────────────────────────────────────────────

function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

console.log("=== extends Constraint ===");
console.log(`String-Laenge: ${getLength("hallo")}`);       // 5
console.log(`Array-Laenge: ${getLength([1, 2, 3])}`);      // 3
console.log(`Object-Laenge: ${getLength({ length: 42 })}`); // 42
// getLength(42);  // Error! number hat kein .length

// ─── CONSTRAINT MIT INTERFACE ───────────────────────────────────────────────

interface HasId {
  id: number;
}

function printId<T extends HasId>(entity: T): void {
  console.log(`ID: ${entity.id}`);
}

console.log("\n=== Constraint mit Interface ===");
printId({ id: 1, name: "Max", email: "max@test.de" });
printId({ id: 2, title: "Product", price: 9.99 });
// printId({ name: "Kein Id" }); // Error! Kein id-Property

// Der volle Typ bleibt erhalten:
function findAndReturn<T extends HasId>(items: T[], targetId: number): T | undefined {
  return items.find(item => item.id === targetId);
}

const users = [
  { id: 1, name: "Max", role: "admin" },
  { id: 2, name: "Anna", role: "user" },
];

const found = findAndReturn(users, 1);
if (found) {
  console.log(`Gefunden: ${found.name}, Rolle: ${found.role}`);
  // ^ found hat alle Properties — nicht nur id!
}

// ─── KEYOF CONSTRAINT ───────────────────────────────────────────────────────

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

console.log("\n=== keyof Constraint ===");

const user = { name: "Max", age: 30, active: true };

const name = getProperty(user, "name");     // string
const age = getProperty(user, "age");       // number
const active = getProperty(user, "active"); // boolean

console.log(`Name: ${name}`);
console.log(`Age: ${age}`);
console.log(`Active: ${active}`);
// getProperty(user, "email"); // Error! "email" ist kein Key von user

// ─── PLUCK — MEHRERE WERTE EXTRAHIEREN ──────────────────────────────────────

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

console.log("\n=== pluck mit keyof ===");

const products = [
  { id: 1, title: "Laptop", price: 999 },
  { id: 2, title: "Mouse", price: 29 },
  { id: 3, title: "Keyboard", price: 79 },
];

const titles = pluck(products, "title");
console.log(`Titles: ${titles}`);  // ["Laptop", "Mouse", "Keyboard"]

const prices = pluck(products, "price");
console.log(`Prices: ${prices}`);  // [999, 29, 79]

// ─── MEHRERE CONSTRAINTS ────────────────────────────────────────────────────

interface Serializable {
  toJSON(): string;
}

function saveEntity<T extends HasId & Serializable>(entity: T): void {
  console.log(`Saving entity ${entity.id}: ${entity.toJSON()}`);
}

console.log("\n=== Mehrere Constraints ===");

const serializableUser = {
  id: 1,
  name: "Max",
  toJSON() { return JSON.stringify({ id: this.id, name: this.name }); },
};

saveEntity(serializableUser); // OK — hat id UND toJSON

// ─── CONSTRAINT BEI MEHREREN TYPPARAMETERN ──────────────────────────────────

function merge<T extends object, U extends object>(target: T, source: U): T & U {
  return { ...target, ...source };
}

console.log("\n=== Constraints bei mehreren Typparametern ===");

const merged = merge(
  { name: "Max" },
  { age: 30, active: true }
);
console.log(merged);
// ^ Typ: { name: string } & { age: number; active: boolean }
// merged.name, merged.age, merged.active — alles typsicher

// ─── PRAXIS: VERGLEICHBARE WERTE ────────────────────────────────────────────

function max<T extends number | string>(a: T, b: T): T {
  return a > b ? a : b;
}

console.log("\n=== Vergleichbare Werte ===");
console.log(`max(10, 20) = ${max(10, 20)}`);          // 20
console.log(`max("abc", "xyz") = ${max("abc", "xyz")}`); // "xyz"
// max(10, "abc"); // Error! number und string gemischt

// ─── PRAXIS: KONSTRUKTOR-CONSTRAINT ─────────────────────────────────────────

function createInstance<T>(Constructor: new () => T): T {
  return new Constructor();
}

console.log("\n=== Konstruktor-Constraint ===");

class Logger {
  log(msg: string) { console.log(`[LOG] ${msg}`); }
}

const logger = createInstance(Logger);
logger.log("Instance erstellt via Generic!"); // [LOG] Instance erstellt via Generic!
