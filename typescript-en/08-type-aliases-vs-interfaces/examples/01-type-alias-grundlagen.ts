/**
 * Lektion 08 - Example 01: Type Alias Grundlagen
 *
 * Ausfuehren mit: npx tsx examples/01-type-alias-grundlagen.ts
 *
 * Alle Facetten von Type Aliases: Primitive Aliases, Unions,
 * Intersections, Mapped Types und Conditional Types.
 */

// ─── PRIMITIVE ALIASES ─────────────────────────────────────────────────────

// Primitive Aliases geben existierenden Typen aussagekraeftige Namen.
// Sie erstellen KEINEN neuen Typ — nur einen Alias (Spitzname).

type UserID = string;
type Milliseconds = number;
type Pixels = number;
type EmailAddress = string;

const userId: UserID = "usr-abc-123";
const delay: Milliseconds = 5000;
const width: Pixels = 320;
const email: EmailAddress = "max@example.com";

// ACHTUNG: UserID und string sind DERSELBE Typ!
const normalString: string = userId;  // Kein Fehler!
const auchEineId: UserID = "einfach ein string";  // Auch kein Fehler!

console.log("--- Primitive Aliases ---");
console.log(`UserID: ${userId}`);
console.log(`Delay: ${delay}ms`);
console.log(`Width: ${width}px`);
console.log(`Email: ${email}`);
console.log(`UserID ist string: ${typeof userId === "string"}`);  // true

// ─── UNION TYPES ───────────────────────────────────────────────────────────

// Union Types: ENTWEDER A ODER B. Nur mit type moeglich!

type Status = "active" | "inactive" | "banned";
type StringOrNumber = string | number;

const userStatus: Status = "active";
// const invalidStatus: Status = "deleted";  // Error! Nur 3 Werte erlaubt.

const flexibel: StringOrNumber = 42;
const flexibel2: StringOrNumber = "hallo";
// const nein: StringOrNumber = true;  // Error! boolean ist nicht erlaubt.

console.log("\n--- Union Types ---");
console.log(`Status: ${userStatus}`);
console.log(`Flexibel (number): ${flexibel}`);
console.log(`Flexibel (string): ${flexibel2}`);

// Discriminated Unions — das maechtigste Pattern:
type ApiResponse =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function handleResponse(response: ApiResponse): string {
  switch (response.status) {
    case "loading":
      return "Laden...";
    case "success":
      return `${response.data.length} Ergebnisse`;
    case "error":
      return `Fehler: ${response.message}`;
  }
}

console.log(handleResponse({ status: "loading" }));
console.log(handleResponse({ status: "success", data: ["a", "b", "c"] }));
console.log(handleResponse({ status: "error", message: "Timeout" }));

// ─── INTERSECTION TYPES ────────────────────────────────────────────────────

// Intersection Types: SOWOHL A ALS AUCH B. Auch nur mit type.

type HasName = { name: string };
type HasAge = { age: number };
type HasEmail = { email: string };

type Person = HasName & HasAge & HasEmail;

const person: Person = {
  name: "Anna",
  age: 28,
  email: "anna@example.com",
};

console.log("\n--- Intersection Types ---");
console.log(`Person: ${person.name}, ${person.age}, ${person.email}`);

// Generische Intersections:
type Timestamped<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

type TimestampedPerson = Timestamped<Person>;

const tsPerson: TimestampedPerson = {
  name: "Max",
  age: 30,
  email: "max@example.com",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-06-15"),
};

console.log(`Erstellt: ${tsPerson.createdAt.toISOString()}`);

// ─── TUPLE TYPES ───────────────────────────────────────────────────────────

// Tuples: Arrays mit fester Laenge und Typ pro Position.
type Coordinate = [latitude: number, longitude: number];
type NameAge = [name: string, age: number];
type RGB = [red: number, green: number, blue: number];

const berlin: Coordinate = [52.52, 13.405];
const user: NameAge = ["Max", 30];
const red: RGB = [255, 0, 0];

console.log("\n--- Tuple Types ---");
console.log(`Berlin: ${berlin[0]}, ${berlin[1]}`);
console.log(`User: ${user[0]} (${user[1]})`);
console.log(`Rot: rgb(${red.join(", ")})`);

// ─── TEMPLATE LITERAL TYPES ───────────────────────────────────────────────

type EventName = `on${string}`;
type CssValue = `${number}px` | `${number}rem` | `${number}%`;

const clickEvent: EventName = "onClick";
const hoverEvent: EventName = "onMouseEnter";
const fontSize: CssValue = "16px";
const margin: CssValue = "2rem";

console.log("\n--- Template Literal Types ---");
console.log(`Event: ${clickEvent}`);
console.log(`Font: ${fontSize}`);

// ─── CONDITIONAL TYPES (Vorgeschmack) ──────────────────────────────────────

type IsString<T> = T extends string ? true : false;

// Compile-time:
type A = IsString<string>;   // true
type B = IsString<number>;   // false
type C = IsString<"hallo">;  // true (Literal extends string)

// Nuetzlicher: Typ extrahieren
type ArrayElement<T> = T extends (infer E)[] ? E : never;

type Nums = ArrayElement<number[]>;     // number
type Strs = ArrayElement<string[]>;     // string
type Nope = ArrayElement<boolean>;      // never — kein Array

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
