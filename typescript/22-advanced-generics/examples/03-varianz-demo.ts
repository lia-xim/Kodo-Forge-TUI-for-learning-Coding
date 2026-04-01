/**
 * Beispiel 03: Varianz — Kovarianz, Kontravarianz, Invarianz
 *
 * Demonstriert Varianz-Konzepte mit konkreten Beispielen.
 *
 * Ausfuehren: npx tsx examples/03-varianz-demo.ts
 */

// ─── Setup: Typ-Hierarchie ──────────────────────────────────────────────

interface Animal {
  name: string;
}

interface Cat extends Animal {
  meow(): void;
}

interface Kitten extends Cat {
  isPlayful: boolean;
}

// Hierarchie: Kitten extends Cat extends Animal

// ─── Kovarianz: Producer (Output-Position) ──────────────────────────────

interface Producer<T> {
  get(): T;
}

// Kovarianz: Subtyprichtung BLEIBT
declare const kittenProducer: Producer<Kitten>;
declare const catProducer: Producer<Cat>;
declare const animalProducer: Producer<Animal>;

// Kitten → Cat → Animal (Original-Richtung)
// Producer<Kitten> → Producer<Cat> → Producer<Animal> (gleiche Richtung)

const a1: Producer<Animal> = kittenProducer; // OK ✓
const a2: Producer<Animal> = catProducer;    // OK ✓
const a3: Producer<Cat> = kittenProducer;    // OK ✓

// Umgekehrt geht NICHT:
// const a4: Producer<Cat> = animalProducer;    // ERROR ✗
// const a5: Producer<Kitten> = catProducer;    // ERROR ✗

console.log("=== Kovarianz (Producer) ===");
console.log("Producer<Kitten> → Producer<Cat> → Producer<Animal>");
console.log("Subtyprichtung bleibt erhalten ✓");

// ─── Kontravarianz: Consumer (Input-Position) ───────────────────────────

type Handler<T> = (item: T) => void;

// Kontravarianz: Subtyprichtung KEHRT UM
declare const animalHandler: Handler<Animal>;
declare const catHandler: Handler<Cat>;
declare const kittenHandler: Handler<Kitten>;

// Kitten → Cat → Animal (Original)
// Handler<Animal> → Handler<Cat> → Handler<Kitten> (UMGEKEHRT!)

const b1: Handler<Cat> = animalHandler;     // OK ✓ (Animal-Handler kann Cats)
const b2: Handler<Kitten> = animalHandler;  // OK ✓
const b3: Handler<Kitten> = catHandler;     // OK ✓

// Umgekehrt geht NICHT:
// const b4: Handler<Animal> = catHandler;     // ERROR ✗
// const b5: Handler<Cat> = kittenHandler;     // ERROR ✗

console.log("\n=== Kontravarianz (Handler) ===");
console.log("Handler<Animal> → Handler<Cat> → Handler<Kitten>");
console.log("Subtyprichtung kehrt sich um ✓");

// ─── Invarianz: MutableBox (Input + Output) ─────────────────────────────

interface MutableBox<T> {
  get(): T;
  set(value: T): void;
}

declare const catBox: MutableBox<Cat>;
declare const animalBox: MutableBox<Animal>;

// KEINE Richtung funktioniert:
// const c1: MutableBox<Animal> = catBox;    // UNSICHER: set(animal) koennte Hund sein
// const c2: MutableBox<Cat> = animalBox;    // UNSICHER: get() koennte Hund liefern

console.log("\n=== Invarianz (MutableBox) ===");
console.log("MutableBox<Cat> und MutableBox<Animal> sind NICHT zuweisbar.");
console.log("Invarianz: Keine Subtypbeziehung in keine Richtung.");

// ─── Warum Kontravarianz sicher ist ─────────────────────────────────────

function processAnimal(animal: Animal): void {
  console.log(`Processing: ${animal.name}`);
}

function processCat(cat: Cat): void {
  console.log(`Processing: ${cat.name}`);
  cat.meow();
}

const myCat: Cat = { name: "Minka", meow() { console.log("Miau!"); } };

// processAnimal kann Cats verarbeiten — sicher!
processAnimal(myCat); // OK: Katze IST ein Tier

// processCat kann NICHT alle Animals verarbeiten:
const myAnimal: Animal = { name: "Rex" };
// processCat(myAnimal); // Rex hat kein meow()!

console.log("\n=== Praktische Demonstration ===");
processAnimal(myCat); // Sicher: Animal-Handler akzeptiert Cat

// ─── ReadonlyArray ist kovariant ────────────────────────────────────────

const cats: readonly Cat[] = [
  { name: "Minka", meow() { console.log("Miau!"); } },
  { name: "Felix", meow() { console.log("Mew!"); } },
];

const animals: readonly Animal[] = cats; // OK — ReadonlyArray ist kovariant!
console.log("\n=== ReadonlyArray ist kovariant ===");
animals.forEach(a => console.log(a.name));

console.log("\n=== Zusammenfassung ===");
console.log("Kovariant (out): Producer, ReadonlyArray, Getter");
console.log("Kontravariant (in): Handler, Setter, Callback-Parameter");
console.log("Invariant: MutableBox, Array (technisch), State-Container");
