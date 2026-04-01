/**
 * Exercise 01: Generic Container
 *
 * Erstelle einen generischen Container-Typ der verschiedene
 * Datenstrukturen wrappen kann.
 *
 * Ausfuehren: npx tsx exercises/01-generic-container.ts
 */

// ─── TODO 1: Container-Interface ────────────────────────────────────────
// Definiere ein generisches Container<T> Interface mit:
// - get(index: number): T | undefined
// - add(item: T): void
// - size(): number
// - toArray(): T[]

// TODO: Dein Interface hier


// ─── TODO 2: ArrayContainer ────────────────────────────────────────────
// Implementiere Container<T> mit einem internen Array.

// TODO: class ArrayContainer<T> implements Container<T>


// ─── TODO 3: SetContainer ──────────────────────────────────────────────
// Implementiere Container<T> mit einem internen Set.
// Hinweis: Set hat keinen Index-Zugriff — nutze Array.from() fuer get().

// TODO: class SetContainer<T> implements Container<T>


// ─── TODO 4: Container-Factory ─────────────────────────────────────────
// Schreibe eine Factory-Funktion mit Overloads:
// - createContainer("array"): ArrayContainer<T>
// - createContainer("set"): SetContainer<T>

// TODO: function createContainer<T>(type: "array" | "set"): Container<T>


// ─── Tests ──────────────────────────────────────────────────────────────

/*
// Entkommentiere wenn implementiert:

const arrContainer = createContainer<number>("array");
arrContainer.add(10);
arrContainer.add(20);
arrContainer.add(30);
console.log("Array-Container:", arrContainer.toArray());  // [10, 20, 30]
console.log("Size:", arrContainer.size());                // 3
console.log("Get(1):", arrContainer.get(1));              // 20

const setContainer = createContainer<string>("set");
setContainer.add("hello");
setContainer.add("world");
setContainer.add("hello"); // Duplikat!
console.log("Set-Container:", setContainer.toArray());    // ["hello", "world"]
console.log("Size:", setContainer.size());                // 2
*/

console.log("Exercise 01: Implementiere die TODOs oben!");
