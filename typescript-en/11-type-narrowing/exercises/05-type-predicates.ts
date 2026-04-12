/**
 * Lektion 11 - Exercise 05: Type Predicates
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-type-predicates.ts
 *
 * 5 Aufgaben zu Custom Type Guards (is), Assertion Functions (asserts),
 * und TS 5.5 Inferred Type Predicates.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Custom Type Guard
// ═══════════════════════════════════════════════════════════════════════════

interface Cat {
  meow: () => string;
  name: string;
}

interface Dog {
  bark: () => string;
  name: string;
}

type Pet = Cat | Dog;

// Schreibe einen Type Guard der prueft ob ein Tier eine Katze ist.
// Tipp: Katzen haben die Methode "meow".

// TODO: Implementiere den Type Guard
function isCat(pet: Pet): pet is Cat {
  // TODO
  return false; // Placeholder
}

function petSound(pet: Pet): string {
  if (isCat(pet)) {
    return pet.meow();
  }
  return pet.bark();
}

const myCat: Cat = { name: "Mimi", meow: () => "Miau!" };
const myDog: Dog = { name: "Rex", bark: () => "Wuff!" };

console.assert(petSound(myCat) === "Miau!", "Aufgabe 1a: Katze");
console.assert(petSound(myDog) === "Wuff!", "Aufgabe 1b: Hund");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Type Guard fuer API-Daten
// ═══════════════════════════════════════════════════════════════════════════

interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

// Schreibe einen Type Guard der unknown-Daten als Product validiert.
// Pruefe ALLE vier Felder mit den korrekten Typen.

// TODO: Implementiere den Type Guard
function isProduct(data: unknown): data is Product {
  // TODO
  return false; // Placeholder
}

console.assert(
  isProduct({ id: 1, name: "Laptop", price: 999, inStock: true }) === true,
  "Aufgabe 2a: gueltiges Product"
);
console.assert(
  isProduct({ id: "1", name: "Laptop", price: 999, inStock: true }) === false,
  "Aufgabe 2b: id ist string"
);
console.assert(
  isProduct({ id: 1, name: "Laptop" }) === false,
  "Aufgabe 2c: Felder fehlen"
);
console.assert(isProduct(null) === false, "Aufgabe 2d: null");
console.assert(isProduct("text") === false, "Aufgabe 2e: kein object");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Assertion Function
// ═══════════════════════════════════════════════════════════════════════════

// Schreibe eine Assertion Function die prueft ob ein Wert ein
// nicht-leerer String ist. Bei leerem String oder anderem Typ: Error werfen.

// TODO: Implementiere die Assertion Function
function assertNonEmptyString(value: unknown): asserts value is string {
  // TODO: Wirf einen Error wenn value kein nicht-leerer String ist
}

// Test: Sollte NICHT werfen
let testWert: unknown = "hallo";
try {
  assertNonEmptyString(testWert);
  // Nach dem Assert ist testWert: string
  console.assert(testWert.toUpperCase() === "HALLO", "Aufgabe 3a: gueltiger String");
} catch {
  console.assert(false, "Aufgabe 3a: Sollte nicht werfen!");
}

// Test: Sollte werfen bei leerem String
try {
  assertNonEmptyString("");
  console.assert(false, "Aufgabe 3b: Sollte werfen bei leerem String!");
} catch (e) {
  console.assert(e instanceof Error, "Aufgabe 3b: Error geworfen");
}

// Test: Sollte werfen bei number
try {
  assertNonEmptyString(42);
  console.assert(false, "Aufgabe 3c: Sollte werfen bei number!");
} catch (e) {
  console.assert(e instanceof Error, "Aufgabe 3c: Error geworfen");
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: TS 5.5 Inferred Type Predicates mit filter
// ═══════════════════════════════════════════════════════════════════════════

// Verwende filter() um aus einem gemischten Array nur bestimmte Werte
// zu extrahieren. Dank TS 5.5 brauchst du KEINEN manuellen Type Guard!

const mixed: (string | number | null | undefined)[] = [
  "hallo", 42, null, "welt", undefined, 0, "", 99
];

// TODO: Filtere nur die strings heraus (ohne null/undefined)
const strings: string[] = []; // TODO: mixed.filter(...)

// TODO: Filtere nur die numbers heraus (ohne null/undefined)
const numbers: number[] = []; // TODO: mixed.filter(...)

// TODO: Filtere null und undefined heraus (behalte strings UND numbers)
const defined: (string | number)[] = []; // TODO: mixed.filter(...)

console.assert(
  JSON.stringify(strings) === JSON.stringify(["hallo", "welt", ""]),
  "Aufgabe 4a: nur strings"
);
console.assert(
  JSON.stringify(numbers) === JSON.stringify([42, 0, 99]),
  "Aufgabe 4b: nur numbers"
);
console.assert(
  JSON.stringify(defined) === JSON.stringify(["hallo", 42, "welt", 0, "", 99]),
  "Aufgabe 4c: ohne null/undefined"
);

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Type Guard Komposition
// ═══════════════════════════════════════════════════════════════════════════

interface AdminUser {
  role: "admin";
  name: string;
  permissions: string[];
}

interface RegularUser {
  role: "user";
  name: string;
}

type User = AdminUser | RegularUser;

// Schreibe einen Type Guard isAdmin und verwende ihn, um aus einem
// User-Array nur die Admins mit "delete"-Berechtigung zu finden.

// TODO: Implementiere den Type Guard
function isAdmin(user: User): user is AdminUser {
  // TODO
  return false; // Placeholder
}

// TODO: Finde alle Admins mit "delete" Berechtigung
function findDeleteAdmins(users: User[]): string[] {
  // TODO: Verwende isAdmin und filter
  return []; // Placeholder
}

const users: User[] = [
  { role: "admin", name: "Max", permissions: ["read", "write", "delete"] },
  { role: "user", name: "Anna" },
  { role: "admin", name: "Tom", permissions: ["read"] },
  { role: "user", name: "Lisa" },
  { role: "admin", name: "Eva", permissions: ["read", "delete"] },
];

console.assert(
  JSON.stringify(findDeleteAdmins(users)) === JSON.stringify(["Max", "Eva"]),
  "Aufgabe 5: Delete-Admins"
);

console.log("Alle Aufgaben abgeschlossen! Pruefe die console.assert-Ausgaben.");
