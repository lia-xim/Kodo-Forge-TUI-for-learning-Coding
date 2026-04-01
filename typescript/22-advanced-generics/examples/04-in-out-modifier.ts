/**
 * Beispiel 04: in/out Modifier (TypeScript 4.7+)
 *
 * Explizite Varianz-Annotationen fuer Interfaces und Klassen.
 *
 * Ausfuehren: npx tsx examples/04-in-out-modifier.ts
 */

// ─── Setup ──────────────────────────────────────────────────────────────

interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// ─── out: Kovarianz deklarieren ─────────────────────────────────────────

interface Producer<out T> {
  get(): T;
  peek(): T;
  // set(value: T): void;  // ERROR! T in Input-Position verletzt "out"
}

// Test: Kovarianz funktioniert
declare const catProducer: Producer<Cat>;
const animalProducer: Producer<Animal> = catProducer; // OK ✓

console.log("=== out-Modifier (Kovarianz) ===");
console.log("Producer<out T>: T nur in Output-Position.");
console.log("Producer<Cat> ist Subtyp von Producer<Animal> ✓");

// ─── in: Kontravarianz deklarieren ──────────────────────────────────────

interface Consumer<in T> {
  accept(item: T): void;
  process(item: T): boolean;
  // get(): T;  // ERROR! T in Output-Position verletzt "in"
}

// Test: Kontravarianz funktioniert
declare const animalConsumer: Consumer<Animal>;
const catConsumer: Consumer<Cat> = animalConsumer; // OK ✓

console.log("\n=== in-Modifier (Kontravarianz) ===");
console.log("Consumer<in T>: T nur in Input-Position.");
console.log("Consumer<Animal> ist Subtyp von Consumer<Cat> ✓");

// ─── in out: Invarianz deklarieren ──────────────────────────────────────

interface MutableBox<in out T> {
  get(): T;            // Output ✓ (durch "out")
  set(value: T): void; // Input ✓ (durch "in")
}

// Test: Keine Zuweisung in keine Richtung
declare const catBox: MutableBox<Cat>;
// const animalBox: MutableBox<Animal> = catBox;    // ERROR ✗
// const catBox2: MutableBox<Cat> = animalBox;      // ERROR ✗

console.log("\n=== in out-Modifier (Invarianz) ===");
console.log("MutableBox<in out T>: T in beiden Positionen.");
console.log("Keine Zuweisung moeglich — invariant ✓");

// ─── Mehrere Typparameter mit verschiedenen Modifiern ───────────────────

interface Transform<in A, out B> {
  run(input: A): B;
}

// A ist kontravariant (in), B ist kovariant (out):
// Transform<Animal, Cat> extends Transform<Cat, Animal>
// Weil: Animal "breiter" als Cat (in-Position → kontravariant → umgekehrt)
//       Cat "enger" als Animal (out-Position → kovariant → bleibt)

declare const animalToCat: Transform<Animal, Cat>;
const catToAnimal: Transform<Cat, Animal> = animalToCat; // OK ✓

console.log("\n=== Mehrere Modifier ===");
console.log("Transform<in A, out B>: A kontravariant, B kovariant.");
console.log("Transform<Animal, Cat> ist Subtyp von Transform<Cat, Animal> ✓");

// ─── Praktisches Beispiel: Event-System ─────────────────────────────────

interface EventEmitter<out E> {
  lastEvent(): E | null;
  subscribe(callback: (event: E) => void): void;
}

interface EventListener<in E> {
  handle(event: E): void;
}

interface GameEvent { type: string; timestamp: number; }
interface CollisionEvent extends GameEvent {
  objectA: string;
  objectB: string;
}

declare const collisionEmitter: EventEmitter<CollisionEvent>;
const gameEmitter: EventEmitter<GameEvent> = collisionEmitter; // Kovariant ✓

declare const gameListener: EventListener<GameEvent>;
const collisionListener: EventListener<CollisionEvent> = gameListener; // Kontravariant ✓

console.log("\n=== Event-System ===");
console.log("EventEmitter<out E>: Kovariant — CollisionEmitter ist GameEmitter ✓");
console.log("EventListener<in E>: Kontravariant — GameListener ist CollisionListener ✓");

// ─── ReadonlyArray vs Array ─────────────────────────────────────────────

// TypeScript's eingebauter ReadonlyArray<T> waere:
// interface ReadonlyArray<out T> { ... }

const readonlyCats: readonly Cat[] = [
  { name: "Minka", meow() {} },
];
const readonlyAnimals: readonly Animal[] = readonlyCats; // Kovariant ✓

console.log("\n=== ReadonlyArray ===");
console.log("readonly Cat[] ist Subtyp von readonly Animal[] ✓");
console.log("Kovariant weil ReadonlyArray nur liest (Output-Position).");

console.log("\n=== Zusammenfassung ===");
console.log("out T = kovariant (nur Output)");
console.log("in T = kontravariant (nur Input)");
console.log("in out T = invariant (beides)");
console.log("Modifier sind Annotationen — sie aendern kein Verhalten!");
