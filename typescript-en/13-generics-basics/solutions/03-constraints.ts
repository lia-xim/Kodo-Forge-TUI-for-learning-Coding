/**
 * Lektion 13 - Loesung 03: Constraints
 */

// ═══ AUFGABE 1: longest ════════════════════════════════════════════════════

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest("ab", "xyz"));       // "xyz"
console.log(longest([1, 2], [1, 2, 3])); // [1, 2, 3]

// ═══ AUFGABE 2: getProperty ════════════════════════════════════════════════

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Max", age: 30, active: true };
const name = getProperty(user, "name");     // string
const age = getProperty(user, "age");       // number
console.log(`${name}, ${age}`);

// ═══ AUFGABE 3: pluck ══════════════════════════════════════════════════════

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const products = [
  { id: 1, title: "Laptop", price: 999 },
  { id: 2, title: "Mouse", price: 29 },
];
const titles = pluck(products, "title");  // string[]
const prices = pluck(products, "price");  // number[]
console.log(titles); // ["Laptop", "Mouse"]
console.log(prices); // [999, 29]

// ═══ AUFGABE 4: merge ══════════════════════════════════════════════════════

function merge<T extends object, U extends object>(target: T, source: U): T & U {
  return { ...target, ...source };
}

const merged = merge({ name: "Max" }, { age: 30 });
console.log(merged.name); // "Max"
console.log(merged.age);  // 30

// ═══ AUFGABE 5: updateEntity ═══════════════════════════════════════════════

interface HasId { id: number; }
interface HasTimestamp { updatedAt: Date; }

function updateEntity<T extends HasId & HasTimestamp>(
  entity: T,
  updates: Partial<Omit<T, "id" | "updatedAt">>
): T {
  return {
    ...entity,
    ...updates,
    updatedAt: new Date(),
  };
}

const userEntity = { id: 1, name: "Max", age: 30, updatedAt: new Date("2024-01-01") };
const updated = updateEntity(userEntity, { name: "Maximilian" });
console.log(updated.name);      // "Maximilian"
console.log(updated.id);        // 1
console.log(updated.updatedAt); // Neues Datum
