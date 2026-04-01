/**
 * Loesung 02: HKT-Emulation
 *
 * Ausfuehren: npx tsx solutions/02-hkt-emulation.ts
 */

// ─── Maybe-Klasse ──────────────────────────────────────────────────────

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

// ─── Interface-Map (URItoKind) ──────────────────────────────────────────

interface URItoKind<A> {
  Array: Array<A>;
  Set: Set<A>;
  Maybe: Maybe<A>;
}

// ─── URIS und Kind ─────────────────────────────────────────────────────

type URIS = keyof URItoKind<any>;
type Kind<URI extends URIS, A> = URItoKind<A>[URI];

// ─── Mappable-Interface ─────────────────────────────────────────────────

interface Mappable<URI extends URIS> {
  readonly URI: URI;
  map<A, B>(fa: Kind<URI, A>, fn: (a: A) => B): Kind<URI, B>;
}

// ─── Implementierungen ─────────────────────────────────────────────────

const arrayMappable: Mappable<"Array"> = {
  URI: "Array",
  map: <A, B>(fa: A[], fn: (a: A) => B): B[] => fa.map(fn),
};

const setMappable: Mappable<"Set"> = {
  URI: "Set",
  map: <A, B>(fa: Set<A>, fn: (a: A) => B): Set<B> => {
    const result = new Set<B>();
    fa.forEach(item => result.add(fn(item)));
    return result;
  },
};

const maybeMappable: Mappable<"Maybe"> = {
  URI: "Maybe",
  map: <A, B>(fa: Maybe<A>, fn: (a: A) => B): Maybe<B> => fa.map(fn),
};

// ─── Generische doubleAll-Funktion ─────────────────────────────────────

function doubleAll<URI extends URIS>(
  M: Mappable<URI>,
  fa: Kind<URI, number>
): Kind<URI, number> {
  return M.map(fa, x => x * 2);
}

// ─── Tests ──────────────────────────────────────────────────────────────

console.log("=== Array ===");
console.log(doubleAll(arrayMappable, [1, 2, 3])); // [2, 4, 6]

console.log("\n=== Set ===");
console.log([...doubleAll(setMappable, new Set([10, 20]))]); // [20, 40]

console.log("\n=== Maybe ===");
console.log(doubleAll(maybeMappable, Maybe.of(21)).toString()); // Maybe(42)
console.log(doubleAll(maybeMappable, Maybe.empty<number>()).toString()); // Maybe.empty

// ─── Bonus: Generische stringify-Funktion ───────────────────────────────

function stringifyAll<URI extends URIS>(
  M: Mappable<URI>,
  fa: Kind<URI, number>
): Kind<URI, string> {
  return M.map(fa, x => `#${x}`);
}

console.log("\n=== Bonus: stringifyAll ===");
console.log(stringifyAll(arrayMappable, [1, 2, 3])); // ["#1", "#2", "#3"]
console.log(stringifyAll(maybeMappable, Maybe.of(42)).toString()); // Maybe(#42)
