/**
 * Exercise 04: Varianz-Annotationen (in/out Modifier)
 *
 * Fuege die korrekten in/out-Modifier hinzu und teste sie.
 *
 * Ausfuehren: npx tsx exercises/04-variance-annotationen.ts
 */

// ─── Setup ──────────────────────────────────────────────────────────────

interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// ─── TODO 1: Fuege den korrekten Modifier hinzu ────────────────────────
// Entscheide fuer jedes Interface: out, in, oder in out?

// TODO: Korrekten Modifier einfuegen (ersetze ??? durch out, in, oder in out)
interface EventSource</* ??? */ T> {
  getLatest(): T;
  subscribe(callback: (event: T) => void): void;
}

interface EventSink</* ??? */ T> {
  emit(event: T): void;
  emitAll(events: T[]): void;
}

interface StateContainer</* ??? */ T> {
  getState(): T;
  setState(newState: T): void;
}

interface ReadonlyConfig</* ??? */ T> {
  getValue(): T;
  readonly defaultValue: T;
}


// ─── TODO 2: Teste die Varianz ──────────────────────────────────────────
// Entkommentiere und teste welche Zuweisungen funktionieren.

// EventSource ist kovariant:
// declare const catSource: EventSource<Cat>;
// const animalSource: EventSource<Animal> = catSource; // Sollte OK sein

// EventSink ist kontravariant:
// declare const animalSink: EventSink<Animal>;
// const catSink: EventSink<Cat> = animalSink; // Sollte OK sein

// StateContainer ist invariant:
// declare const catState: StateContainer<Cat>;
// const animalState: StateContainer<Animal> = catState; // Sollte ERROR sein


// ─── TODO 3: Was passiert bei falschen Modifiern? ───────────────────────
// Erstelle absichtlich ein Interface mit dem FALSCHEN Modifier.
// Was sagt TypeScript?

// TODO: Teste:
// interface BadProducer<in T> {  // in statt out!
//   get(): T;                    // Was passiert?
// }

// TODO: Teste:
// interface BadConsumer<out T> { // out statt in!
//   accept(item: T): void;      // Was passiert?
// }


// ─── TODO 4: Transform mit zwei verschiedenen Modifiern ─────────────────
// Erstelle ein Transform<A, B> Interface:
// - A ist kontravariant (Input)
// - B ist kovariant (Output)
// - Methode: transform(input: A): B

// TODO: interface Transform<??? A, ??? B> { ... }


// Teste:
// declare const animalToCat: Transform<Animal, Cat>;
// const catToAnimal: Transform<Cat, Animal> = animalToCat; // OK?


console.log("Exercise 04: Implementiere die TODOs und pruefe die Varianz!");
console.log("Nutze den TypeScript-Compiler (tsc) um Fehler zu sehen.");
