/**
 * Beispiel 05: Fortgeschrittene Constraints
 *
 * Intersection-Constraints, F-bounded Polymorphism,
 * und Distributive Conditional Types.
 *
 * Ausfuehren: npx tsx examples/05-advanced-constraints.ts
 */

// ─── Intersection-Constraints ──────────────────────────────────────────

interface HasId { id: number; }
interface HasName { name: string; }
interface Serializable { serialize(): string; }

// T muss ALLE drei Interfaces erfuellen:
function processEntity<T extends HasId & HasName & Serializable>(item: T): void {
  console.log(`Entity ${item.name} (ID: ${item.id})`);
  console.log(`Serialized: ${item.serialize()}`);
}

const user = {
  id: 1,
  name: "Max",
  email: "max@test.de", // Extra property — OK bei Generics!
  serialize() { return JSON.stringify({ id: this.id, name: this.name }); },
};

console.log("=== Intersection-Constraints ===");
processEntity(user);

// processEntity({ id: 1 }); // ERROR: name und serialize fehlen
// processEntity({ id: 1, name: "Max" }); // ERROR: serialize fehlt

// ─── F-bounded Polymorphism ──────────────────────────────────────────────

interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number;
}

class Temperature implements Comparable<Temperature> {
  constructor(public celsius: number) {}

  compareTo(other: Temperature): number {
    return this.celsius - other.celsius;
  }

  toString(): string {
    return `${this.celsius}°C`;
  }
}

class Weight implements Comparable<Weight> {
  constructor(public kg: number) {}

  compareTo(other: Weight): number {
    return this.kg - other.kg;
  }

  toString(): string {
    return `${this.kg}kg`;
  }
}

function sortItems<T extends Comparable<T>>(items: T[]): T[] {
  return [...items].sort((a, b) => a.compareTo(b));
}

console.log("\n=== F-bounded Polymorphism ===");
const temps = sortItems([
  new Temperature(30),
  new Temperature(10),
  new Temperature(20),
]);
console.log("Temperatures sorted:", temps.map(t => t.toString()));

const weights = sortItems([
  new Weight(80),
  new Weight(60),
  new Weight(70),
]);
console.log("Weights sorted:", weights.map(w => w.toString()));

// Das hier wuerde NICHT kompilieren:
// sortItems([new Temperature(30), new Weight(70)]);
// ERROR: Temperature und Weight sind verschiedene Comparable-Typen

// ─── Distributive Conditional Types ──────────────────────────────────────

type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;          // "yes"
type B = IsString<number>;          // "no"
type C = IsString<string | number>; // "yes" | "no" (distributiv!)
type D = IsString<never>;           // never (leerer Union)

console.log("\n=== Distributive Conditional Types ===");
console.log('IsString<string> = "yes"');
console.log('IsString<number> = "no"');
console.log('IsString<string | number> = "yes" | "no" (distributiv)');
console.log('IsString<never> = never (leerer Union)');

// ─── Distribution verhindern ────────────────────────────────────────────

type IsStringStrict<T> = [T] extends [string] ? "yes" : "no";

type E = IsStringStrict<string>;          // "yes"
type F = IsStringStrict<string | number>; // "no" (KEINE Distribution!)
type G = IsStringStrict<never>;           // "yes" (never extends alles)

console.log("\n=== Nicht-distributiv (Tuple-Wrapping) ===");
console.log('IsStringStrict<string> = "yes"');
console.log('IsStringStrict<string | number> = "no" (nicht verteilt!)');
console.log('IsStringStrict<never> = "yes" (never extends [string])');

// ─── Praktisches Beispiel: Conditional Validator ────────────────────────

interface StringValidator { minLength: number; pattern: RegExp; }
interface NumberValidator { min: number; max: number; }

type ValidatorFor<T> = T extends string ? StringValidator
                     : T extends number ? NumberValidator
                     : never;

function validate<T extends string | number>(
  value: T,
  _validator: ValidatorFor<T>
): boolean {
  // Vereinfachte Implementation
  console.log(`Validating ${typeof value}: ${value}`);
  return true;
}

console.log("\n=== Conditional Validator ===");
validate("hello", { minLength: 3, pattern: /^[a-z]+$/ });
validate(42, { min: 0, max: 100 });
// validate("hello", { min: 0, max: 100 }); // ERROR: falscher Validator!

// ─── Kombination: Intersection + Conditional ────────────────────────────

interface HasVersion { version: number; }

type RequiredMethods<T> = T extends HasVersion
  ? { serialize(): string; validate(): boolean }
  : { validate(): boolean };

function process<T extends HasId>(
  entity: T & RequiredMethods<T>
): void {
  console.log(`Processing entity #${entity.id}`);
  entity.validate();
}

console.log("\n=== Intersection + Conditional ===");
process({
  id: 1,
  validate() { console.log("  Validated!"); return true; },
});

console.log("\nMit Version:");
process({
  id: 2,
  version: 1,
  validate() { console.log("  Validated!"); return true; },
  serialize() { return "{}"; },
});
