/**
 * Lektion 08 - Example 03: Unterschiede in Aktion
 *
 * Ausfuehren mit: npx tsx examples/03-unterschiede-in-aktion.ts
 *
 * Direkte Gegenueber­stellung: Wo verhalten sich type und interface
 * unterschiedlich? Konflikte, Fehlermeldungen, Performance-Implikationen.
 */

// ─── KONFLIKT-VERHALTEN: extends vs & ──────────────────────────────────────

console.log("--- Konflikt-Verhalten ---");

// extends: SOFORTIGER Fehler bei inkompatiblen Typen
interface Base {
  id: string;
  name: string;
}

// Das wuerde einen Compile-Fehler erzeugen:
// interface BadExtend extends Base {
//   id: number;  // Error! 'number' is not assignable to 'string'
// }

// ABER: Kompatible Einschraenkung geht!
interface AdminUser extends Base {
  id: `admin-${string}`;  // OK! Template Literal ist Subtyp von string
  permissions: string[];
}

const admin: AdminUser = {
  id: "admin-001",
  name: "Super Admin",
  permissions: ["read", "write", "delete"],
};

console.log(`Admin: ${admin.id} — ${admin.permissions.join(", ")}`);

// Intersection: STILLE Verschmelzung — kann never erzeugen!
type TypeA = { id: string; value: string };
type TypeB = { id: number; extra: boolean };
type Merged = TypeA & TypeB;
// Merged.id ist jetzt 'string & number' = 'never'!
// Kein Compile-Fehler bei der Type-Definition...
// ...aber du kannst KEIN Objekt erstellen:
// const m: Merged = { id: ???, value: "x", extra: true };
// ^ Es gibt keinen Wert der string UND number gleichzeitig ist.

console.log("Intersection mit Konflikt: id wird 'never' (un-erstellbar)");

// ─── REDECLARATION: MERGING vs FEHLER ──────────────────────────────────────

console.log("\n--- Declaration Merging vs Error ---");

// Interface: Zweite Deklaration FUEGT HINZU
interface Animal {
  name: string;
}

interface Animal {
  sound: string;
}

// Animal hat jetzt name UND sound:
const cat: Animal = { name: "Katze", sound: "Miau" };
console.log(`${cat.name} sagt: ${cat.sound}`);

// type: Zweite Deklaration ist ein FEHLER:
type Plant = { name: string };
// type Plant = { color: string };  // Error: Duplicate identifier 'Plant'

// Wenn du einen Type erweitern willst:
type PlantWithColor = Plant & { color: string };
const rose: PlantWithColor = { name: "Rose", color: "rot" };
console.log(`${rose.name} ist ${rose.color}`);

// ─── UNION TYPES: NUR MIT TYPE ─────────────────────────────────────────────

console.log("\n--- Union Types (type-exklusiv) ---");

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

const circle: Shape = { kind: "circle", radius: 5 };
const rect: Shape = { kind: "rectangle", width: 10, height: 20 };
const tri: Shape = { kind: "triangle", base: 8, height: 6 };

console.log(`Kreis: ${calculateArea(circle).toFixed(2)}`);
console.log(`Rechteck: ${calculateArea(rect)}`);
console.log(`Dreieck: ${calculateArea(tri)}`);

// Mit interface koennte man die einzelnen Varianten definieren,
// aber der Union Type selbst MUSS ein type sein:
interface Circle { kind: "circle"; radius: number; }
interface Rectangle { kind: "rectangle"; width: number; height: number; }
type ShapeAlt = Circle | Rectangle;  // Union = type!

// ─── MAPPED TYPES: NUR MIT TYPE ────────────────────────────────────────────

console.log("\n--- Mapped Types (type-exklusiv) ---");

interface UserProfile {
  name: string;
  email: string;
  age: number;
  isAdmin: boolean;
}

// Alle Properties optional machen:
type PartialProfile = {
  [K in keyof UserProfile]?: UserProfile[K];
};

// Alle Properties readonly machen:
type FrozenProfile = {
  readonly [K in keyof UserProfile]: UserProfile[K];
};

// Nur string-Properties extrahieren:
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type ProfileStringKeys = StringKeys<UserProfile>;
// Ergebnis: "name" | "email"

const partial: PartialProfile = { name: "Max" };  // Nur name — rest optional
console.log(`Partial: name=${partial.name}, email=${partial.email ?? "nicht gesetzt"}`);

// ─── EXTENDS VS & — GLEICHE ERGEBNISSE, ANDERE MECHANIK ────────────────────

console.log("\n--- extends vs & ---");

// Mit interface extends:
interface HasIdI { id: string; }
interface HasNameI { name: string; }
interface PersonI extends HasIdI, HasNameI {
  age: number;
}

// Mit type & (Intersection):
type HasIdT = { id: string };
type HasNameT = { name: string };
type PersonT = HasIdT & HasNameT & { age: number };

// Beide erzeugen denselben Typ:
const personI: PersonI = { id: "1", name: "Max", age: 30 };
const personT: PersonT = { id: "2", name: "Anna", age: 25 };

// Und sind sogar zueinander kompatibel (strukturelle Typisierung):
const cross1: PersonI = personT;  // OK!
const cross2: PersonT = personI;  // OK!

console.log(`Interface-Person: ${personI.name}`);
console.log(`Type-Person: ${personT.name}`);
console.log("Beide sind strukturell identisch und austauschbar.");

// ─── IMPLEMENTS MIT BEIDEN ─────────────────────────────────────────────────

console.log("\n--- implements mit type und interface ---");

// Interface:
interface Printable {
  print(): void;
}

// Type:
type Loggable = {
  log(message: string): void;
};

// Klasse implementiert BEIDES:
class Document implements Printable, Loggable {
  constructor(public title: string) {}

  print(): void {
    console.log(`[PRINT] ${this.title}`);
  }

  log(message: string): void {
    console.log(`[LOG] ${this.title}: ${message}`);
  }
}

const doc = new Document("Bericht");
doc.print();
doc.log("wurde erstellt");

// ABER: Union Types kann man nicht implementieren:
// type StringOrNumber = string | number;
// class Bad implements StringOrNumber {}
// ^ Error! Kann keinen Union Type implementieren.

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
