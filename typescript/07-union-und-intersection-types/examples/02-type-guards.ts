/**
 * Lektion 07 - Example 02: Type Guards und Narrowing
 *
 * Ausfuehren mit: npx tsx examples/02-type-guards.ts
 *
 * Alle Narrowing-Techniken: typeof, instanceof, in,
 * truthiness, assignment, Type Predicates, TS 5.5 filter.
 */

// ─── TYPEOF GUARD ───────────────────────────────────────────────────────────

function stringify(value: string | number | boolean): string {
  if (typeof value === "string") {
    return value.toUpperCase();  // value: string
  }
  if (typeof value === "number") {
    return value.toFixed(2);     // value: number
  }
  return value ? "ja" : "nein"; // value: boolean
}

console.log("typeof Guards:");
console.log(` string: ${stringify("hallo")}`);   // "HALLO"
console.log(` number: ${stringify(3.14159)}`);    // "3.14"
console.log(` boolean: ${stringify(true)}`);      // "ja"

// ─── INSTANCEOF GUARD ───────────────────────────────────────────────────────

class ApiError {
  constructor(public statusCode: number, public message: string) {}
}

class NetworkError {
  constructor(public cause: string) {}
}

function handleError(error: ApiError | NetworkError): string {
  if (error instanceof ApiError) {
    return `API Error ${error.statusCode}: ${error.message}`;
  }
  // error: NetworkError
  return `Network Error: ${error.cause}`;
}

console.log("\ninstanceof Guards:");
console.log(` ${handleError(new ApiError(404, "Not Found"))}`);
console.log(` ${handleError(new NetworkError("timeout"))}`);

// ─── IN GUARD ───────────────────────────────────────────────────────────────

interface Fish {
  swim: () => string;
  habitat: string;
}

interface Bird {
  fly: () => string;
  wingspan: number;
}

function describeAnimal(animal: Fish | Bird): string {
  if ("swim" in animal) {
    // animal: Fish
    return `Fish: ${animal.swim()} (lives in ${animal.habitat})`;
  }
  // animal: Bird
  return `Bird: ${animal.fly()} (wingspan: ${animal.wingspan}cm)`;
}

const nemo: Fish = { swim: () => "splashing", habitat: "ocean" };
const eagle: Bird = { fly: () => "soaring", wingspan: 200 };

console.log("\nin Guards:");
console.log(` ${describeAnimal(nemo)}`);
console.log(` ${describeAnimal(eagle)}`);

// ─── TRUTHINESS NARROWING ───────────────────────────────────────────────────

function greet(name: string | null | undefined): string {
  if (name) {
    return `Hallo, ${name}!`;  // name: string (null/undefined eliminiert)
  }
  return "Hallo, Unbekannter!";
  // ACHTUNG: Leerer String "" landet auch hier!
}

console.log("\nTruthiness Narrowing:");
console.log(` ${greet("Max")}`);
console.log(` ${greet(null)}`);
console.log(` ${greet("")}`);  // "Hallo, Unbekannter!" — evtl. ungewollt!

// Sicherer: Expliziter null-Check
function greetSafe(name: string | null): string {
  if (name !== null) {
    return `Hallo, ${name}!`;  // Auch leerer String ist OK
  }
  return "Hallo, Unbekannter!";
}

console.log(` Safe mit "": ${greetSafe("")}`);  // "Hallo, !"

// ─── ASSIGNMENT NARROWING ───────────────────────────────────────────────────

let value: string | number;

value = "hallo";
console.log(`\nAssignment Narrowing: ${value.toUpperCase()}`);  // value: string

value = 42;
console.log(`Assignment Narrowing: ${value.toFixed(1)}`);       // value: number

// ─── CUSTOM TYPE PREDICATES ─────────────────────────────────────────────────

interface User {
  name: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string"
  );
}

const data: unknown = { name: "Alice", email: "alice@example.com" };
const bad: unknown = { name: "Bob" };

console.log("\nCustom Type Predicates:");
if (isUser(data)) {
  console.log(` Valid user: ${data.name} (${data.email})`);
}
if (!isUser(bad)) {
  console.log(` Not a valid user: missing email`);
}

// ─── TS 5.5: INFERRED TYPE PREDICATES MIT FILTER ────────────────────────────

const mixed: (string | null)[] = ["hallo", null, "welt", null, "!"];

// Ab TS 5.5: TypeScript inferiert automatisch den Type Predicate
const strings = mixed.filter(x => x !== null);
// Typ: string[] (nicht mehr (string | null)[] wie vor TS 5.5)

console.log("\nTS 5.5 Inferred Type Predicates:");
console.log(` Filtered: [${strings.join(", ")}]`);
console.log(` Typ-korrekt: Alle sind Strings`);

// Auch mit undefined:
const numbers: (number | undefined)[] = [1, undefined, 3, undefined, 5];
const defined = numbers.filter(x => x !== undefined);
// Typ: number[]
console.log(` Defined numbers: [${defined.join(", ")}]`);

// Komplexeres Beispiel: Objekte filtern
interface Admin { name: string; role: "admin"; }
interface Guest { name: string; }

const users: (Admin | Guest)[] = [
  { name: "Alice", role: "admin" },
  { name: "Bob" },
  { name: "Charlie", role: "admin" },
];

const admins = users.filter((u): u is Admin => "role" in u && (u as Admin).role === "admin");
console.log(` Admins: ${admins.map(a => a.name).join(", ")}`);

// ─── SWITCH NARROWING ───────────────────────────────────────────────────────

type Shape = "circle" | "square" | "triangle";

function describe(shape: Shape): string {
  switch (shape) {
    case "circle":    return "Ein runder Kreis";
    case "square":    return "Ein eckiges Quadrat";
    case "triangle":  return "Ein spitzes Dreieck";
  }
}

console.log("\nSwitch Narrowing:");
console.log(` ${describe("circle")}`);
console.log(` ${describe("square")}`);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
