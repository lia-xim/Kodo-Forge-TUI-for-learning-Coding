/**
 * Lektion 08 - Solution 03: extends vs. Intersection (&)
 *
 * Ausfuehren mit: npx tsx solutions/03-extends-vs-intersection.ts
 */

// ─── Basis-Typen ────────────────────────────────────────────────────────────

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
// AUFGABE 1: extends-Kette
// ═══════════════════════════════════════════════════════════════════════════

interface Product extends HasId, HasTimestamps {
  name: string;
  price: number;
  inStock: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Intersection mit &
// ═══════════════════════════════════════════════════════════════════════════

// Gleicher Typ, andere Syntax:
type ProductT = HasId & HasTimestamps & {
  name: string;
  price: number;
  inStock: boolean;
};

// Beide erzeugen strukturell den GLEICHEN Typ!
// Der Unterschied: extends wird vom Compiler gecacht (schneller).

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Drei Basis-Typen kombinieren
// ═══════════════════════════════════════════════════════════════════════════

// Variante A: interface extends
// Geht! Interface kann auch von Type Aliases erben:
interface FullEntity extends HasId, HasTimestamps, HasSoftDelete {
  data: unknown;
}

// Variante B: type mit &
type FullEntityT = HasId & HasTimestamps & HasSoftDelete & {
  data: unknown;
};

// Beide funktionieren identisch.
// Besonderheit: HasSoftDelete ist ein type, nicht ein interface.
// extends akzeptiert beides (solange es ein Objekttyp ist).

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Konflikt-Verhalten
// ═══════════════════════════════════════════════════════════════════════════

type TypeX = { id: string; name: string };
type TypeY = { id: number; extra: boolean };

// Intersection: Stille Verschmelzung
type Merged = TypeX & TypeY;
// Merged["id"] ist 'string & number' = NEVER!
// Kein Fehler bei der Typ-Definition, aber kein Objekt erstellbar:
// const m: Merged = { id: ???, name: "x", extra: true };
// ^ Es gibt keinen Wert der gleichzeitig string UND number ist.

// extends: SOFORTIGER Fehler
// interface MergedI extends TypeX {
//   id: number;
// }
// ^ Error: Interface 'MergedI' incorrectly extends interface 'TypeX'.
//   Types of property 'id' are incompatible.
//   Type 'number' is not assignable to type 'string'.

// Fazit: extends gibt sofortiges Feedback (sicherer).
// & erzeugt stille never-Typen (flexibler aber gefaehrlicher).

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Utility-Type-Ableitung
// ═══════════════════════════════════════════════════════════════════════════

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  createdAt: Date;
}

// 1. CreateUserDTO: Alles ausser id und createdAt
type CreateUserDTO = Omit<User, "id" | "createdAt">;
// Ergebnis: { name: string; email: string; password: string; role: "admin" | "user" }

// 2. PublicUser: Alles ausser password
type PublicUser = Omit<User, "password">;
// Ergebnis: { id: string; name: string; email: string; role: ...; createdAt: Date }

// 3. UserUpdate: Wie CreateUserDTO, aber optional
type UserUpdate = Partial<CreateUserDTO>;
// Ergebnis: { name?: string; email?: string; password?: string; role?: ... }

// 4. UserSummary: Nur id, name und role
type UserSummary = Pick<User, "id" | "name" | "role">;
// Ergebnis: { id: string; name: string; role: "admin" | "user" }

// Warum type und nicht interface?
// Omit, Partial, Pick sind Mapped Types — ihr Ergebnis kann nur als type
// verwendet werden. Man KOENNTE ein interface drum wickeln:
//   interface CreateUserDTO extends Omit<User, "id" | "createdAt"> {}
// Aber das ist umstaendlicher und bringt keinen Vorteil.

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Test 1
const product: Product = {
  id: "p1", createdAt: new Date(), updatedAt: new Date(),
  name: "Buch", price: 29.99, inStock: true,
};
console.log(`Product (interface): ${product.name}`);

// Test 2
const productT: ProductT = {
  id: "p2", createdAt: new Date(), updatedAt: new Date(),
  name: "Kurs", price: 49.99, inStock: false,
};
console.log(`ProductT (type): ${productT.name}`);

// Cross-Zuweisung funktioniert (strukturelle Typisierung):
const crossCheck: Product = productT;  // OK!
console.log(`Cross-Check: ${crossCheck.name}`);

// Test 3
const entity: FullEntity = {
  id: "e1", createdAt: new Date(), updatedAt: new Date(),
  deletedAt: null, isDeleted: false, data: { some: "data" },
};
console.log(`FullEntity: ${entity.id}, deleted: ${entity.isDeleted}`);

// Test 5
const dto: CreateUserDTO = { name: "Max", email: "m@t.de", password: "secret", role: "user" };
const pub: PublicUser = { id: "1", name: "Max", email: "m@t.de", role: "user", createdAt: new Date() };
const upd: UserUpdate = { name: "Neuer Name" };
const sum: UserSummary = { id: "1", name: "Max", role: "admin" };

console.log(`DTO: ${dto.name}`);
console.log(`Public: ${pub.name}`);
console.log(`Update: ${upd.name}`);
console.log(`Summary: ${sum.name} (${sum.role})`);

console.log("\nAlle Tests bestanden!");
