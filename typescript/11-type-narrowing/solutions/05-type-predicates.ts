/**
 * Lektion 11 - Solution 05: Type Predicates
 *
 * Ausfuehren mit: npx tsx solutions/05-type-predicates.ts
 */

// ═══ AUFGABE 1: Custom Type Guard ═══

interface Cat { meow: () => string; name: string; }
interface Dog { bark: () => string; name: string; }
type Pet = Cat | Dog;

// Loesung: Pruefe ob die "meow"-Property existiert.
// "in"-Operator funktioniert hier perfekt.
function isCat(pet: Pet): pet is Cat {
  return "meow" in pet;
}

function petSound(pet: Pet): string {
  if (isCat(pet)) return pet.meow();
  return pet.bark();
}

const myCat: Cat = { name: "Mimi", meow: () => "Miau!" };
const myDog: Dog = { name: "Rex", bark: () => "Wuff!" };
console.assert(petSound(myCat) === "Miau!", "1a");
console.assert(petSound(myDog) === "Wuff!", "1b");

// ═══ AUFGABE 2: Type Guard fuer API-Daten ═══

interface Product { id: number; name: string; price: number; inStock: boolean; }

// Loesung: Vierstufiges Narrowing — erst object, dann jede Property.
// Wichtig: typeof muss fuer ALLE Felder geprueft werden.
function isProduct(data: unknown): data is Product {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.price === "number" &&
    typeof obj.inStock === "boolean"
  );
}

console.assert(isProduct({ id: 1, name: "Laptop", price: 999, inStock: true }) === true, "2a");
console.assert(isProduct({ id: "1", name: "Laptop", price: 999, inStock: true }) === false, "2b");
console.assert(isProduct({ id: 1, name: "Laptop" }) === false, "2c");
console.assert(isProduct(null) === false, "2d");
console.assert(isProduct("text") === false, "2e");

// ═══ AUFGABE 3: Assertion Function ═══

// Loesung: asserts value is string — wenn die Funktion NICHT wirft,
// ist value ab dem Aufruf ein string fuer den Rest des Scopes.
// Wir pruefen typeof UND Laenge > 0.
function assertNonEmptyString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Erwartet nicht-leerer String, erhalten: ${typeof value}`);
  }
  if (value.length === 0) {
    throw new Error("String darf nicht leer sein");
  }
}

let testWert: unknown = "hallo";
try {
  assertNonEmptyString(testWert);
  console.assert(testWert.toUpperCase() === "HALLO", "3a");
} catch {
  console.assert(false, "3a: Sollte nicht werfen!");
}

try {
  assertNonEmptyString("");
  console.assert(false, "3b: Sollte werfen!");
} catch (e) {
  console.assert(e instanceof Error, "3b");
}

try {
  assertNonEmptyString(42);
  console.assert(false, "3c: Sollte werfen!");
} catch (e) {
  console.assert(e instanceof Error, "3c");
}

// ═══ AUFGABE 4: TS 5.5 Inferred Type Predicates mit filter ═══

const mixed: (string | number | null | undefined)[] = [
  "hallo", 42, null, "welt", undefined, 0, "", 99
];

// Loesung: Ab TS 5.5 narrowt filter() automatisch!
// Kein manueller Type Guard noetig.
const strings = mixed.filter(x => typeof x === "string");
// Typ: string[]

const numbers = mixed.filter(x => typeof x === "number");
// Typ: number[]

const defined = mixed.filter(x => x != null);
// Typ: (string | number)[] — null und undefined entfernt

console.assert(JSON.stringify(strings) === JSON.stringify(["hallo", "welt", ""]), "4a");
console.assert(JSON.stringify(numbers) === JSON.stringify([42, 0, 99]), "4b");
console.assert(JSON.stringify(defined) === JSON.stringify(["hallo", 42, "welt", 0, "", 99]), "4c");

// ═══ AUFGABE 5: Type Guard Komposition ═══

interface AdminUser { role: "admin"; name: string; permissions: string[]; }
interface RegularUser { role: "user"; name: string; }
type User = AdminUser | RegularUser;

// Loesung: Type Guard prueft die role-Property (Discriminant).
function isAdmin(user: User): user is AdminUser {
  return user.role === "admin";
}

// Loesung: Zuerst filter mit isAdmin (narrowt zu AdminUser[]),
// dann filter auf "delete" in permissions, dann map auf name.
function findDeleteAdmins(users: User[]): string[] {
  return users
    .filter(isAdmin)
    .filter(admin => admin.permissions.includes("delete"))
    .map(admin => admin.name);
}

const users: User[] = [
  { role: "admin", name: "Max", permissions: ["read", "write", "delete"] },
  { role: "user", name: "Anna" },
  { role: "admin", name: "Tom", permissions: ["read"] },
  { role: "user", name: "Lisa" },
  { role: "admin", name: "Eva", permissions: ["read", "delete"] },
];

console.assert(JSON.stringify(findDeleteAdmins(users)) === JSON.stringify(["Max", "Eva"]), "5");

console.log("Alle Loesungen korrekt!");
