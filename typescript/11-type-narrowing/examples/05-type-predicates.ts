/**
 * Lektion 11 - Example 05: Type Predicates
 *
 * Ausfuehren mit: npx tsx examples/05-type-predicates.ts
 *
 * Zeigt Custom Type Guards (is), Assertion Functions (asserts),
 * und TS 5.5 Inferred Type Predicates bei filter().
 */

// ─── CUSTOM TYPE GUARD MIT "IS" ─────────────────────────────────────────────

interface Fish {
  swim: () => void;
  name: string;
}

interface Bird {
  fly: () => void;
  name: string;
}

// Type Guard Funktion mit is-Keyword:
function isFish(animal: Fish | Bird): animal is Fish {
  return "swim" in animal;
}

function move(animal: Fish | Bird) {
  if (isFish(animal)) {
    // animal: Fish
    console.log(`${animal.name} schwimmt!`);
    animal.swim();
  } else {
    // animal: Bird
    console.log(`${animal.name} fliegt!`);
    animal.fly();
  }
}

console.log("--- Custom Type Guards ---");
move({ name: "Nemo", swim: () => console.log("  *schwimm*") });
move({ name: "Tweety", fly: () => console.log("  *flatter*") });

// ─── TYPE GUARD FUE R API-DATEN ─────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
}

function isUser(data: unknown): data is User {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string"
  );
}

console.log("\n--- Type Guard fuer API-Daten ---");

const apiResponses: unknown[] = [
  { id: 1, name: "Max", email: "max@test.de" },
  { id: "2", name: "Anna" },
  null,
  { id: 3, name: "Tom", email: "tom@test.de" },
];

for (const response of apiResponses) {
  if (isUser(response)) {
    // response: User — sicher typisiert
    console.log(`  User: ${response.name} (${response.email})`);
  } else {
    console.log(`  Kein User: ${JSON.stringify(response)}`);
  }
}

// ─── ASSERTION FUNCTIONS ────────────────────────────────────────────────────

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Erwartet string, erhalten: ${typeof value}`);
  }
}

function assertIsDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error("Wert darf nicht null/undefined sein");
  }
}

console.log("\n--- Assertion Functions ---");

function verarbeiteEingabe(eingabe: unknown) {
  // Nach dem Assert: eingabe ist string fuer den REST des Scopes
  assertIsString(eingabe);
  // eingabe: string — ohne if-Block!
  console.log(`  Eingabe: "${eingabe.toUpperCase()}"`);
}

verarbeiteEingabe("hallo");
// verarbeiteEingabe(42);  // Wuerde werfen: "Erwartet string, erhalten: number"

function verarbeiteConfig(port: number | null) {
  assertIsDefined(port);
  // port: number — null ist ausgeschlossen
  console.log(`  Port: ${port.toFixed(0)}`);
}

verarbeiteConfig(8080);
// verarbeiteConfig(null);  // Wuerde werfen

// ─── TS 5.5: INFERRED TYPE PREDICATES BEI FILTER ───────────────────────────

console.log("\n--- TS 5.5 Inferred Type Predicates ---");

// Vor TS 5.5 war das Ergebnis (string | null)[] — jetzt ist es string[]
const mixed: (string | null)[] = ["hallo", null, "welt", null, "!"];
const onlyStrings = mixed.filter(x => x !== null);
// Typ ab TS 5.5: string[]  (vorher: (string | null)[])
console.log(`  filter(x => x !== null): [${onlyStrings.join(", ")}]`);

// Funktioniert auch mit undefined:
const numbers: (number | undefined)[] = [1, undefined, 2, undefined, 3];
const definedNumbers = numbers.filter(x => x !== undefined);
// Typ: number[]
console.log(`  filter(x => x !== undefined): [${definedNumbers.join(", ")}]`);

// Und mit typeof:
const values: (string | number | boolean)[] = ["a", 1, true, "b", 2, false];
const strings = values.filter(x => typeof x === "string");
// Typ ab TS 5.5: string[]
console.log(`  filter(typeof === "string"): [${strings.join(", ")}]`);

const nums = values.filter(x => typeof x === "number");
// Typ ab TS 5.5: number[]
console.log(`  filter(typeof === "number"): [${nums.join(", ")}]`);

// ─── VERGLEICH: MANUELL VS. INFERRED ───────────────────────────────────────

console.log("\n--- Manuell vs. Inferred ---");

// Alt (vor TS 5.5): Manueller Type Guard noetig
const altManuell = mixed.filter((x): x is string => x !== null);
console.log(`  Manuell:   Typ ist string[] = [${altManuell.join(", ")}]`);

// Neu (ab TS 5.5): TypeScript inferiert es automatisch
const neuAuto = mixed.filter(x => x !== null);
console.log(`  Inferred:  Typ ist string[] = [${neuAuto.join(", ")}]`);

// Komplexeres Beispiel: filter + map Kette
interface Product {
  name: string;
  price: number | null;
}

const products: Product[] = [
  { name: "Laptop", price: 999 },
  { name: "Gratis-Sticker", price: null },
  { name: "Maus", price: 29 },
];

// TS 5.5: price !== null narrowt automatisch
const preise = products
  .map(p => p.price)
  .filter(p => p !== null);
// Typ: number[] (nicht mehr (number | null)[])
console.log(`  Preise: [${preise.join(", ")}]`);
console.log(`  Summe:  ${preise.reduce((a, b) => a + b, 0)}`);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
