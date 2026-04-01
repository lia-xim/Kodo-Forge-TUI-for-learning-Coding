/**
 * Loesung 01: Generic Container
 *
 * Ausfuehren: npx tsx solutions/01-generic-container.ts
 */

// ─── Container-Interface ────────────────────────────────────────────────

interface Container<T> {
  get(index: number): T | undefined;
  add(item: T): void;
  size(): number;
  toArray(): T[];
}

// ─── ArrayContainer ────────────────────────────────────────────────────

class ArrayContainer<T> implements Container<T> {
  private items: T[] = [];

  get(index: number): T | undefined {
    return this.items[index];
  }

  add(item: T): void {
    this.items.push(item);
  }

  size(): number {
    return this.items.length;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// ─── SetContainer ──────────────────────────────────────────────────────

class SetContainer<T> implements Container<T> {
  private items = new Set<T>();

  get(index: number): T | undefined {
    return Array.from(this.items)[index];
  }

  add(item: T): void {
    this.items.add(item);
  }

  size(): number {
    return this.items.size;
  }

  toArray(): T[] {
    return Array.from(this.items);
  }
}

// ─── Container-Factory mit Overloads ───────────────────────────────────

function createContainer<T>(type: "array"): ArrayContainer<T>;
function createContainer<T>(type: "set"): SetContainer<T>;
function createContainer<T>(type: "array" | "set"): Container<T> {
  switch (type) {
    case "array": return new ArrayContainer<T>();
    case "set": return new SetContainer<T>();
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────

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
console.log("\nSet-Container:", setContainer.toArray());  // ["hello", "world"]
console.log("Size:", setContainer.size());                // 2

// Typ-Check: Factory gibt den korrekten Typ zurueck
const arr: ArrayContainer<number> = createContainer<number>("array");
const set: SetContainer<string> = createContainer<string>("set");
console.log("\nTyp-Check: Overloads funktionieren ✓");
