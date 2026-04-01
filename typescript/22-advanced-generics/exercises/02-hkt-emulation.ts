/**
 * Exercise 02: HKT-Emulation
 *
 * Emuliere Higher-Kinded Types mit dem Interface-Map-Pattern.
 *
 * Ausfuehren: npx tsx exercises/02-hkt-emulation.ts
 */

// ─── TODO 1: Interface-Map (URItoKind) ──────────────────────────────────
// Erstelle ein Interface URItoKind<A> das folgende Typen registriert:
// - "Array" → Array<A>
// - "Set" → Set<A>
// - "Maybe" → Maybe<A> (siehe unten)

class Maybe<T> {
  constructor(private value: T | null) {}

  static of<T>(value: T): Maybe<T> { return new Maybe(value); }
  static empty<T>(): Maybe<T> { return new Maybe<T>(null); }

  map<U>(fn: (x: T) => U): Maybe<U> {
    return this.value !== null ? Maybe.of(fn(this.value)) : Maybe.empty();
  }

  getOrElse(defaultValue: T): T {
    return this.value !== null ? this.value : defaultValue;
  }

  toString(): string {
    return this.value !== null ? `Maybe(${this.value})` : "Maybe.empty";
  }
}

// TODO: interface URItoKind<A> { ... }


// ─── TODO 2: URIS und Kind-Typen ───────────────────────────────────────
// - type URIS = keyof URItoKind<any>
// - type Kind<URI extends URIS, A> = URItoKind<A>[URI]

// TODO: Deine Typ-Definitionen hier


// ─── TODO 3: Mappable-Interface ─────────────────────────────────────────
// Erstelle ein Interface Mappable<URI extends URIS> mit einer map-Methode:
// map<A, B>(fa: Kind<URI, A>, fn: (a: A) => B): Kind<URI, B>

// TODO: interface Mappable<URI extends URIS> { ... }


// ─── TODO 4: Implementierungen ──────────────────────────────────────────
// Implementiere Mappable fuer "Array", "Set", und "Maybe"

// TODO: const arrayMappable: Mappable<"Array"> = { ... }
// TODO: const setMappable: Mappable<"Set"> = { ... }
// TODO: const maybeMappable: Mappable<"Maybe"> = { ... }


// ─── TODO 5: Generische doubleAll-Funktion ──────────────────────────────
// Schreibe eine Funktion die mit JEDEM Mappable funktioniert:
// function doubleAll<URI extends URIS>(M: Mappable<URI>, fa: Kind<URI, number>): Kind<URI, number>

// TODO: function doubleAll(...)


// ─── Tests ──────────────────────────────────────────────────────────────

/*
// Entkommentiere wenn implementiert:

console.log("=== Array ===");
console.log(doubleAll(arrayMappable, [1, 2, 3]));           // [2, 4, 6]

console.log("=== Set ===");
console.log([...doubleAll(setMappable, new Set([10, 20]))]);  // [20, 40]

console.log("=== Maybe ===");
console.log(doubleAll(maybeMappable, Maybe.of(21)).toString()); // Maybe(42)
console.log(doubleAll(maybeMappable, Maybe.empty()).toString()); // Maybe.empty
*/

console.log("Exercise 02: Implementiere die TODOs oben!");
