/**
 * Lektion 21 — Exercise 03: Interface-Implementierung
 *
 * Implementiere verschiedene Interfaces und erlebe Structural Typing.
 *
 * Ausfuehren: npx tsx exercises/03-interface-implementierung.ts
 * Hinweise:   hints.json → "exercises/03-interface-implementierung.ts"
 */

// ═══ Aufgabe 1: Mehrere Interfaces implementieren ═══
// Definiere zwei Interfaces:
// - Serializable: serialize(): string
// - Comparable<T>: compareTo(other: T): number (-1, 0, 1)
//
// Erstelle eine Klasse 'Task' die BEIDE implementiert.
// Task hat: title (string), priority (number 1-5), done (boolean)
// - serialize() gibt JSON zurueck
// - compareTo() vergleicht nach priority (hoeher = wichtiger)

// TODO: interface Serializable { ... }
// TODO: interface Comparable<T> { ... }
// TODO: class Task implements Serializable, Comparable<Task> { ... }

// ═══ Aufgabe 2: Generisches Repository ═══
// Erstelle ein Interface 'Repository<T>' mit:
// - findById(id: string): T | undefined
// - findAll(): T[]
// - save(entity: T): void
// - delete(id: string): boolean
//
// Implementiere 'InMemoryTaskRepo implements Repository<Task>'

// TODO: interface Repository<T> { ... }
// TODO: class InMemoryTaskRepo implements Repository<Task> { ... }

// ═══ Aufgabe 3: Structural Typing demonstrieren ═══
// Erstelle eine Funktion 'printSerializable(item: Serializable)'
// Uebergib ein Objekt-Literal (OHNE implements) das .serialize() hat.
// Funktioniert das? Warum?

// TODO: function printSerializable(item: Serializable): void { ... }
// TODO: Teste mit einem Objekt-Literal

// ═══ Tests ═══
function testInterfaces(): void {
  // Kommentiere die Tests ein:
  // const t1 = new Task("Dringend", 5, false);
  // const t2 = new Task("Spaeter", 2, false);
  // console.assert(t1.compareTo(t2) > 0, "t1 should be higher priority");
  // console.assert(JSON.parse(t1.serialize()).title === "Dringend", "Serialize failed");

  console.log("Exercise 03: Erstelle die Klassen und kommentiere die Tests ein!");
}

testInterfaces();
