/**
 * Lektion 07 - Example 04: Intersection Types
 *
 * Ausfuehren mit: npx tsx examples/04-intersection-types.ts
 *
 * & Operator, Object-Kombination, Konflikte, Mixins.
 */

// ─── GRUNDLAGEN: DER & OPERATOR ─────────────────────────────────────────────

interface HasName {
  name: string;
}

interface HasAge {
  age: number;
}

interface HasEmail {
  email: string;
}

// Intersection: MUSS alle Properties haben
type Person = HasName & HasAge & HasEmail;

const alice: Person = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
};

console.log("Intersection Grundlagen:");
console.log(`  ${alice.name}, ${alice.age}, ${alice.email}`);

// ─── OBJEKTE KOMBINIEREN ────────────────────────────────────────────────────

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt: Date | null;
  isDeleted: boolean;
}

interface HasId {
  id: string;
}

type DatabaseEntity = HasId & Timestamped & SoftDeletable;

const entity: DatabaseEntity = {
  id: "usr-001",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-06-20"),
  deletedAt: null,
  isDeleted: false,
};

console.log(`\nDatabaseEntity: ${entity.id} (erstellt: ${entity.createdAt.toLocaleDateString()})`);

// ─── PRAXIS: REQUEST-TYPEN ──────────────────────────────────────────────────

interface BaseRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
}

interface Authenticated {
  headers: { authorization: string };
}

interface WithBody {
  body: Record<string, unknown>;
}

type GetRequest = BaseRequest & Authenticated;
type PostRequest = BaseRequest & Authenticated & WithBody;

const getRequest: GetRequest = {
  url: "/api/users",
  method: "GET",
  headers: { authorization: "Bearer token123" },
};

const postRequest: PostRequest = {
  url: "/api/users",
  method: "POST",
  headers: { authorization: "Bearer token123" },
  body: { name: "Bob", email: "bob@example.com" },
};

console.log(`\nGET Request: ${getRequest.method} ${getRequest.url}`);
console.log(`POST Request: ${postRequest.method} ${postRequest.url} (body: ${JSON.stringify(postRequest.body)})`);

// ─── KONFLIKTE: KOMPATIBLE TYPEN ────────────────────────────────────────────

interface Config1 {
  mode: string;          // breit
  debug: boolean;
}

interface Config2 {
  mode: "production";    // eng (Literal-Typ)
  verbose: boolean;
}

type Combined = Config1 & Config2;
// mode: string & "production" = "production" (der engere Typ gewinnt)

const prodConfig: Combined = {
  mode: "production",    // Muss "production" sein!
  debug: false,
  verbose: true,
};

console.log(`\nKompatible Konflikte: mode = "${prodConfig.mode}"`);

// ─── KONFLIKTE: INKOMPATIBLE TYPEN → NEVER ─────────────────────────────────

interface TypeA {
  value: string;
}

interface TypeB {
  value: number;
}

type Impossible = TypeA & TypeB;
// value: string & number = never
// Dieser Typ ist unmoeglich zu erstellen!
// const x: Impossible = { value: ??? };  // Kein Wert passt!

console.log(`\nInkompatible Konflikte:`);
console.log(`  TypeA & TypeB erzeugt never fuer 'value' — unmoeglich zu erstellen`);

// ─── MIXIN PATTERN MIT GENERICS ─────────────────────────────────────────────

function withTimestamps<T extends object>(obj: T): T & Timestamped {
  return {
    ...obj,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function withId<T extends object>(obj: T): T & HasId {
  return {
    ...obj,
    id: `id-${Math.random().toString(36).slice(2, 9)}`,
  };
}

interface UserData {
  name: string;
  email: string;
}

const userData: UserData = { name: "Charlie", email: "charlie@example.com" };
const withTs = withTimestamps(userData);
// Typ: UserData & Timestamped
const withTsAndId = withId(withTs);
// Typ: UserData & Timestamped & HasId

console.log(`\nMixin Pattern:`);
console.log(`  Name: ${withTsAndId.name}`);
console.log(`  ID: ${withTsAndId.id}`);
console.log(`  Created: ${withTsAndId.createdAt.toISOString()}`);

// ─── EXTENDS VS & ───────────────────────────────────────────────────────────

// extends: Interface-Vererbung (Konflikte werden gemeldet)
interface Animal {
  name: string;
  sound: string;
}

interface Dog extends Animal {
  breed: string;
}

// &: Intersection (Konflikte erzeugen still never)
interface AnimalBase {
  name: string;
  sound: string;
}

interface DogTraits {
  breed: string;
}

type DogType = AnimalBase & DogTraits;

// Beide haben das gleiche Ergebnis fuer kompatible Typen:
const rex: Dog = { name: "Rex", sound: "Wuff!", breed: "Schaeferhund" };
const bello: DogType = { name: "Bello", sound: "Wau!", breed: "Dackel" };

console.log(`\nextends vs &:`);
console.log(`  extends: ${rex.name} (${rex.breed})`);
console.log(`  &: ${bello.name} (${bello.breed})`);

// Der Unterschied zeigt sich bei Konflikten:
// interface BadDog extends Animal {
//   name: number;  // Error! Property 'name' must be of type 'string'
// }

// Aber mit &:
type WeirdDog = Animal & { name: number };
// name: string & number = never — kein Compile-Fehler, aber unmoeglich!

console.log(`  extends meldet Konflikte sofort, & erzeugt still never`);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
