/**
 * Lektion 08 - Exercise 03: extends vs. Intersection (&)
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-extends-vs-intersection.ts
 *
 * 5 Aufgaben zum Vergleich von extends und &.
 * Lerne wann welches Konstrukt passt und welche Fallstricke es gibt.
 */

// ─── Basis-Typen fuer die Aufgaben ─────────────────────────────────────────

interface HasId {
  id: string;
}

interface HasTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

type HasSoftDelete = {
  deletedAt: Date | null;
  isDeleted: boolean;
};

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: extends — Erstelle eine Vererbungskette
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Interface "Product" das HasId UND HasTimestamps
// erweitert und folgende eigene Properties hat:
// name (string), price (number), inStock (boolean)

// interface Product extends ... { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Intersection — Erstelle den gleichen Typ mit &
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle den GLEICHEN Typ wie in Aufgabe 1, aber mit Type Alias
// und dem & Operator. Nenne ihn "ProductT".

// type ProductT = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Drei Basis-Typen kombinieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ "FullEntity" der HasId, HasTimestamps UND
// HasSoftDelete kombiniert, plus eine eigene Property "data" vom Typ unknown.
// Beachte: HasSoftDelete ist ein type (nicht interface).
// Geht das mit extends? Geht das mit &? Probiere beides!

// Variante A (mit interface):
// interface FullEntity extends ... { ... }

// Variante B (mit type):
// type FullEntityT = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Konflikt-Verhalten
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle zwei Typen mit einem id-Feld das unterschiedliche Typen hat:
// TypeX: { id: string; name: string }
// TypeY: { id: number; value: boolean }
//
// Versuche sie mit & zu kombinieren: type Merged = TypeX & TypeY
// Was ist der Typ von Merged["id"]? Schreibe die Antwort als Kommentar.
//
// Versuche dann dasselbe mit extends:
// interface MergedI extends TypeX { id: number; }
// Was passiert? Schreibe die Antwort als Kommentar.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Utility-Type-Ableitung
// ═══════════════════════════════════════════════════════════════════════════

// Gegeben:
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  createdAt: Date;
}

// TODO: Erstelle folgende abgeleitete Typen (mit type, nicht interface):
// 1. CreateUserDTO — Alles ausser id und createdAt
// 2. PublicUser — Alles ausser password
// 3. UserUpdate — Alles aus CreateUserDTO, aber optional
// 4. UserSummary — Nur id, name und role

// type CreateUserDTO = ...
// type PublicUser = ...
// type UserUpdate = ...
// type UserSummary = ...

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test 1
const product: Product = {
  id: "p1", createdAt: new Date(), updatedAt: new Date(),
  name: "Buch", price: 29.99, inStock: true,
};
console.log(`Product: ${product.name}`);

// Test 2
const productT: ProductT = {
  id: "p2", createdAt: new Date(), updatedAt: new Date(),
  name: "Kurs", price: 49.99, inStock: false,
};
console.log(`ProductT: ${productT.name}`);

// Test 5
const dto: CreateUserDTO = { name: "Max", email: "m@t.de", password: "secret", role: "user" };
const pub: PublicUser = { id: "1", name: "Max", email: "m@t.de", role: "user", createdAt: new Date() };
const upd: UserUpdate = { name: "Neuer Name" };
const sum: UserSummary = { id: "1", name: "Max", role: "admin" };

console.log(`DTO: ${dto.name}`);
console.log(`Public: ${pub.name}`);
console.log(`Update: ${upd.name}`);
console.log(`Summary: ${sum.name}`);

console.log("Alle Tests bestanden!");
*/
