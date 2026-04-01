/**
 * Loesung 04: Varianz-Annotationen (in/out Modifier)
 *
 * Ausfuehren: npx tsx solutions/04-variance-annotationen.ts
 */

// ─── Setup ──────────────────────────────────────────────────────────────

interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// ─── EventSource: KOVARIANT (out T) ────────────────────────────────────
// T steht nur in Output-Position: getLatest() und callback-Parameter
// Hinweis: callback: (event: T) => void — T ist hier in der
// Output-Position des Interfaces (es GIBT events heraus an den Callback)

interface EventSource<out T> {
  getLatest(): T;
  subscribe(callback: (event: T) => void): void;
}

// Test:
declare const catSource: EventSource<Cat>;
const animalSource: EventSource<Animal> = catSource; // OK ✓

console.log("=== EventSource<out T> (Kovariant) ===");
console.log("EventSource<Cat> → EventSource<Animal> ✓");

// ─── EventSink: KONTRAVARIANT (in T) ───────────────────────────────────
// T steht nur in Input-Position: emit(event: T) und emitAll(events: T[])

interface EventSink<in T> {
  emit(event: T): void;
  emitAll(events: T[]): void;
}

// Test:
declare const animalSink: EventSink<Animal>;
const catSink: EventSink<Cat> = animalSink; // OK ✓

console.log("\n=== EventSink<in T> (Kontravariant) ===");
console.log("EventSink<Animal> → EventSink<Cat> ✓");

// ─── StateContainer: INVARIANT (in out T) ──────────────────────────────
// T steht in BEIDEN Positionen: getState() (output) und setState() (input)

interface StateContainer<in out T> {
  getState(): T;
  setState(newState: T): void;
}

// Test: KEINE Zuweisung moeglich
declare const catState: StateContainer<Cat>;
// const animalState: StateContainer<Animal> = catState; // ERROR ✗

console.log("\n=== StateContainer<in out T> (Invariant) ===");
console.log("StateContainer<Cat> ≠ StateContainer<Animal> ✓");

// ─── ReadonlyConfig: KOVARIANT (out T) ─────────────────────────────────
// T steht nur in Output-Position: getValue() und readonly defaultValue

interface ReadonlyConfig<out T> {
  getValue(): T;
  readonly defaultValue: T;
}

// Test:
declare const catConfig: ReadonlyConfig<Cat>;
const animalConfig: ReadonlyConfig<Animal> = catConfig; // OK ✓

console.log("\n=== ReadonlyConfig<out T> (Kovariant) ===");
console.log("ReadonlyConfig<Cat> → ReadonlyConfig<Animal> ✓");

// ─── Falsche Modifier (Demonstration) ──────────────────────────────────

// Wenn man den falschen Modifier verwendet:
// interface BadProducer<in T> {
//   get(): T;  // ERROR: Type 'T' is not assignable... (T in output, aber "in" deklariert)
// }

// interface BadConsumer<out T> {
//   accept(item: T): void;  // ERROR: T in input, aber "out" deklariert
// }

console.log("\n=== Falsche Modifier ===");
console.log("BadProducer<in T> { get(): T } → ERROR (T in Output verletzt 'in')");
console.log("BadConsumer<out T> { accept(T) } → ERROR (T in Input verletzt 'out')");

// ─── Transform: Zwei verschiedene Modifier ─────────────────────────────

interface Transform<in A, out B> {
  transform(input: A): B;
}

// A ist kontravariant (in), B ist kovariant (out)
declare const animalToCat: Transform<Animal, Cat>;
const catToAnimal: Transform<Cat, Animal> = animalToCat; // OK ✓
// Weil: Transform<Animal, Cat> extends Transform<Cat, Animal>
// A: Animal → Cat (kontravariant, Richtung kehrt um)
// B: Cat → Animal (kovariant, Richtung bleibt)

console.log("\n=== Transform<in A, out B> ===");
console.log("Transform<Animal, Cat> → Transform<Cat, Animal> ✓");
console.log("A kontravariant (in): Animal → Cat");
console.log("B kovariant (out): Cat → Animal");
