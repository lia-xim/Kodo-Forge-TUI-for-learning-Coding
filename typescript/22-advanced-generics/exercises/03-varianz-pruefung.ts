/**
 * Exercise 03: Varianz-Pruefung
 *
 * Teste dein Verstaendnis von Kovarianz, Kontravarianz und Invarianz.
 *
 * Ausfuehren: npx tsx exercises/03-varianz-pruefung.ts
 */

// ─── Setup: Typ-Hierarchie ──────────────────────────────────────────────

interface Vehicle { brand: string; }
interface Car extends Vehicle { doors: number; }
interface SportsCar extends Car { topSpeed: number; }

// Hierarchie: SportsCar extends Car extends Vehicle

// ─── TODO 1: Producer (kovariant) ──────────────────────────────────────
// Definiere ein Producer<T> Interface mit get(): T
// Teste dann: Welche Zuweisungen sind erlaubt?

// TODO: interface Producer<T> { ... }

// declare const sportsCarProducer: Producer<SportsCar>;
// declare const carProducer: Producer<Car>;
// declare const vehicleProducer: Producer<Vehicle>;

// TODO: Welche der folgenden Zuweisungen kompilieren?
// Markiere mit // OK oder // ERROR und erklaere warum.
//
// const a: Producer<Vehicle> = sportsCarProducer;  // ???
// const b: Producer<Car> = sportsCarProducer;      // ???
// const c: Producer<Car> = vehicleProducer;        // ???
// const d: Producer<SportsCar> = carProducer;      // ???


// ─── TODO 2: Consumer (kontravariant) ──────────────────────────────────
// Definiere ein Consumer<T> Interface mit accept(item: T): void
// Teste dann: Welche Zuweisungen sind erlaubt?

// TODO: interface Consumer<T> { ... }

// declare const vehicleConsumer: Consumer<Vehicle>;
// declare const carConsumer: Consumer<Car>;
// declare const sportsCarConsumer: Consumer<SportsCar>;

// TODO: Welche der folgenden Zuweisungen kompilieren?
//
// const e: Consumer<SportsCar> = vehicleConsumer;  // ???
// const f: Consumer<Car> = vehicleConsumer;        // ???
// const g: Consumer<Vehicle> = carConsumer;        // ???
// const h: Consumer<Vehicle> = sportsCarConsumer;  // ???


// ─── TODO 3: MutableBox (invariant) ────────────────────────────────────
// Definiere MutableBox<T> mit get(): T und set(value: T): void
// Zeige dass KEINE Zuweisung in KEINE Richtung funktioniert.

// TODO: interface MutableBox<T> { ... }

// declare const carBox: MutableBox<Car>;
// declare const vehicleBox: MutableBox<Vehicle>;

// TODO: Zeige dass beide Zuweisungen fehlschlagen und erklaere warum.
// const i: MutableBox<Vehicle> = carBox;   // ???
// const j: MutableBox<Car> = vehicleBox;   // ???


// ─── TODO 4: ReadonlyBox (kovariant) ───────────────────────────────────
// Definiere ReadonlyBox<T> mit NUR get(): T (kein set!)
// Zeige den Unterschied zu MutableBox.

// TODO: interface ReadonlyBox<T> { ... }

// declare const readonlyCarBox: ReadonlyBox<Car>;
// const k: ReadonlyBox<Vehicle> = readonlyCarBox; // ??? (Kovariant!)


console.log("Exercise 03: Implementiere die TODOs und teste die Zuweisungen!");
console.log("Tipp: Aktiviere die declare-Statements und pruefe mit tsc.");
