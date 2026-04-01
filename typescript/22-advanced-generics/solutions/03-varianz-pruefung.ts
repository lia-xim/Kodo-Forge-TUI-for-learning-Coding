/**
 * Loesung 03: Varianz-Pruefung
 *
 * Ausfuehren: npx tsx solutions/03-varianz-pruefung.ts
 */

// ─── Setup: Typ-Hierarchie ──────────────────────────────────────────────

interface Vehicle { brand: string; }
interface Car extends Vehicle { doors: number; }
interface SportsCar extends Car { topSpeed: number; }

// Hierarchie: SportsCar extends Car extends Vehicle

// ─── Producer (kovariant) ──────────────────────────────────────────────

interface Producer<T> {
  get(): T;
}

declare const sportsCarProducer: Producer<SportsCar>;
declare const carProducer: Producer<Car>;
declare const vehicleProducer: Producer<Vehicle>;

// Kovariant: Subtyprichtung BLEIBT (SportsCar → Car → Vehicle)
const a: Producer<Vehicle> = sportsCarProducer;  // OK — SportsCar ist Vehicle
const b: Producer<Car> = sportsCarProducer;      // OK — SportsCar ist Car
// const c: Producer<Car> = vehicleProducer;      // ERROR — Vehicle ist KEIN Car
// const d: Producer<SportsCar> = carProducer;    // ERROR — Car ist KEIN SportsCar

console.log("=== Producer (Kovariant) ===");
console.log("Producer<SportsCar> → Producer<Car> → Producer<Vehicle> ✓");
console.log("Umgekehrt: ERROR ✗");

// ─── Consumer (kontravariant) ──────────────────────────────────────────

interface Consumer<T> {
  accept(item: T): void;
}

declare const vehicleConsumer: Consumer<Vehicle>;
declare const carConsumer: Consumer<Car>;
declare const sportsCarConsumer: Consumer<SportsCar>;

// Kontravariant: Subtyprichtung KEHRT UM
const e: Consumer<SportsCar> = vehicleConsumer;  // OK — Vehicle-Handler kann SportsCar
const f: Consumer<Car> = vehicleConsumer;        // OK — Vehicle-Handler kann Car
// const g: Consumer<Vehicle> = carConsumer;      // ERROR — Car-Handler kann nicht alle Vehicles
// const h: Consumer<Vehicle> = sportsCarConsumer; // ERROR — SportsCar-Handler noch weniger

console.log("\n=== Consumer (Kontravariant) ===");
console.log("Consumer<Vehicle> → Consumer<Car> → Consumer<SportsCar> ✓");
console.log("(Umgekehrte Richtung der Typhierarchie!)");

// ─── MutableBox (invariant) ────────────────────────────────────────────

interface MutableBox<T> {
  get(): T;            // Output → will kovariant
  set(value: T): void; // Input → will kontravariant
  // Zusammen: INVARIANT
}

declare const carBox: MutableBox<Car>;
declare const vehicleBox: MutableBox<Vehicle>;

// KEINE Richtung funktioniert:
// const i: MutableBox<Vehicle> = carBox;
// ERROR: Unsicher weil set(vehicle) koennte Motorrad reinschreiben

// const j: MutableBox<Car> = vehicleBox;
// ERROR: Unsicher weil get() koennte Motorrad liefern

console.log("\n=== MutableBox (Invariant) ===");
console.log("MutableBox<Car> ≠ MutableBox<Vehicle> — keine Zuweisung moeglich ✓");
console.log("Grund: get() will kovariant, set() will kontravariant → Widerspruch");

// ─── ReadonlyBox (kovariant) ───────────────────────────────────────────

interface ReadonlyBox<T> {
  get(): T;
  // Kein set() → nur Output → KOVARIANT
}

declare const readonlyCarBox: ReadonlyBox<Car>;
const k: ReadonlyBox<Vehicle> = readonlyCarBox; // OK! Kovariant!

console.log("\n=== ReadonlyBox (Kovariant) ===");
console.log("ReadonlyBox<Car> → ReadonlyBox<Vehicle> ✓");
console.log("Ohne set() ist der Typ kovariant — nur Output-Position.");

// ─── Zusammenfassung ───────────────────────────────────────────────────

console.log("\n=== Zusammenfassung ===");
console.log("Producer<T>   (nur Output) → KOVARIANT:     Richtung bleibt");
console.log("Consumer<T>   (nur Input)  → KONTRAVARIANT: Richtung kehrt um");
console.log("MutableBox<T> (beides)     → INVARIANT:     Keine Zuweisung");
console.log("ReadonlyBox<T>(nur Output) → KOVARIANT:     Wie Producer");
