/**
 * Beispiel 02: Higher-Order Types — HKT-Emulation
 *
 * Zeigt wie man Higher-Kinded Types in TypeScript emuliert
 * mit dem Interface-Map-Pattern (URI-to-Kind).
 *
 * Ausfuehren: npx tsx examples/02-higher-order-types.ts
 */

// ─── Schritt 1: Die Interface-Map definieren ──────────────────────────────

interface URItoKind<A> {
  Array: Array<A>;
  Set: Set<A>;
  Promise: Promise<A>;
}

// Alle bekannten URIs:
type URIS = keyof URItoKind<any>;
// URIS = "Array" | "Set" | "Promise"

// Der "Apply"-Typ: Schlaegt in der Map nach
type Kind<URI extends URIS, A> = URItoKind<A>[URI];

// ─── Schritt 2: Testen ───────────────────────────────────────────────────

type Test1 = Kind<"Array", string>;   // string[]
type Test2 = Kind<"Set", number>;     // Set<number>
type Test3 = Kind<"Promise", boolean>; // Promise<boolean>

console.log("=== Kind-Typ Aufloesung ===");
console.log('Kind<"Array", string> = string[]');
console.log('Kind<"Set", number> = Set<number>');
console.log('Kind<"Promise", boolean> = Promise<boolean>');

// ─── Schritt 3: Generische Operationen ueber Container ───────────────────

// Ein "Mappable" Interface das mit jedem registrierten Container funktioniert:
interface Mappable<URI extends URIS> {
  readonly URI: URI;
  map<A, B>(fa: Kind<URI, A>, fn: (a: A) => B): Kind<URI, B>;
}

// Konkrete Implementierung fuer Array:
const arrayMappable: Mappable<"Array"> = {
  URI: "Array",
  map: <A, B>(fa: A[], fn: (a: A) => B): B[] => fa.map(fn),
};

// Konkrete Implementierung fuer Set:
const setMappable: Mappable<"Set"> = {
  URI: "Set",
  map: <A, B>(fa: Set<A>, fn: (a: A) => B): Set<B> => {
    const result = new Set<B>();
    fa.forEach(item => result.add(fn(item)));
    return result;
  },
};

// ─── Schritt 4: Generische Funktion die jeden Container akzeptiert ───────

function doubleAll<URI extends URIS>(
  M: Mappable<URI>,
  container: Kind<URI, number>
): Kind<URI, number> {
  return M.map(container, x => x * 2);
}

console.log("\n=== Generisches Mapping ===");
const doubledArray = doubleAll(arrayMappable, [1, 2, 3]);
console.log("Array:", doubledArray); // [2, 4, 6]

const doubledSet = doubleAll(setMappable, new Set([10, 20, 30]));
console.log("Set:", [...doubledSet]); // [20, 40, 60]

// ─── Alternative: Conditional Type Dispatch ──────────────────────────────

type MapOver<Container, NewItem> =
  Container extends Array<any> ? Array<NewItem> :
  Container extends Set<any> ? Set<NewItem> :
  Container extends Promise<any> ? Promise<NewItem> :
  never;

type R1 = MapOver<string[], number>;        // number[]
type R2 = MapOver<Set<string>, boolean>;    // Set<boolean>
type R3 = MapOver<Promise<string>, number>; // Promise<number>

console.log("\n=== Conditional Type Dispatch ===");
console.log("MapOver<string[], number> = number[]");
console.log("MapOver<Set<string>, boolean> = Set<boolean>");

console.log("\n=== Fazit ===");
console.log("URI-to-Kind: Erweiterbar (Declaration Merging), fuer Libraries.");
console.log("Conditional Dispatch: Einfacher, fuer App-Code.");
