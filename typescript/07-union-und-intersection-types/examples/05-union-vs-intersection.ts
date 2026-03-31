/**
 * Lektion 07 - Example 05: Union vs Intersection
 *
 * Ausfuehren mit: npx tsx examples/05-union-vs-intersection.ts
 *
 * Wann was? Verteilungsgesetz, Identitaetselemente,
 * Kontravarianz bei Funktionen.
 */

// ─── BREITER VS ENGER ───────────────────────────────────────────────────────

interface HasName { name: string; }
interface HasAge { age: number; }

// Union: MEHR Werte passen
type PersonUnion = HasName | HasAge;
const u1: PersonUnion = { name: "Alice" };          // OK
const u2: PersonUnion = { age: 30 };                 // OK
const u3: PersonUnion = { name: "Alice", age: 30 };  // OK

// Intersection: WENIGER Werte passen, aber MEHR Properties
type PersonIntersection = HasName & HasAge;
// const i1: PersonIntersection = { name: "Alice" };  // Error! age fehlt
const i2: PersonIntersection = { name: "Alice", age: 30 };  // OK: beides

console.log("Union vs Intersection:");
console.log(`  Union akzeptiert: nur name, nur age, oder beides`);
console.log(`  Intersection verlangt: name UND age`);

// ─── PROPERTY-ZUGRIFF ───────────────────────────────────────────────────────

function showUnion(p: PersonUnion): string {
  // Nur Properties die ALLE Mitglieder haben:
  // p.name — Error! HasAge hat kein name
  // p.age — Error! HasName hat kein age
  return `Union: ${JSON.stringify(p)}`;
}

function showIntersection(p: PersonIntersection): string {
  // ALLE Properties von ALLEN Mitgliedern:
  return `Intersection: ${p.name}, ${p.age}`;  // Beides OK!
}

console.log(`\n${showUnion({ name: "Bob" })}`);
console.log(`${showIntersection({ name: "Bob", age: 25 })}`);

// ─── VERTEILUNGSGESETZ ──────────────────────────────────────────────────────

// (A | B) & C = (A & C) | (B & C)
type StringOrNumber = string | number;

// (string | number) & string
// = (string & string) | (number & string)
// = string | never
// = string
type OnlyString = StringOrNumber & string;

// Beweis:
const proof: OnlyString = "hallo";  // OK
// const bad: OnlyString = 42;      // Error! number passt nicht

console.log(`\nVerteilungsgesetz:`);
console.log(`  (string | number) & string = string`);

// Praxisbeispiel:
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type SafeMethod = HttpMethod & ("GET" | "HEAD" | "OPTIONS");
// = ("GET" & ("GET"|"HEAD"|"OPTIONS")) | ("POST" & ("GET"|"HEAD"|"OPTIONS"))
//   | ("PUT" & ("GET"|"HEAD"|"OPTIONS")) | ("DELETE" & ("GET"|"HEAD"|"OPTIONS"))
// = "GET" | never | never | never
// = "GET"

const safe: SafeMethod = "GET";  // Einziger gueltiger Wert
console.log(`  HttpMethod & SafeMethods = "GET" only: "${safe}"`);

// ─── IDENTITAETSELEMENTE ────────────────────────────────────────────────────

// never ist das Identitaetselement fuer Union
type A = string | never;   // = string

// unknown ist das Identitaetselement fuer Intersection
type B = string & unknown;  // = string

// unknown ist das "absorbierende Element" fuer Union
type C = string | unknown;  // = unknown

// never ist das "absorbierende Element" fuer Intersection
type D = string & never;    // = never

console.log(`\nIdentitaetselemente:`);
console.log(`  string | never = string`);
console.log(`  string & unknown = string`);
console.log(`  string | unknown = unknown`);
console.log(`  string & never = never`);

// ─── FUNKTIONSTYPEN: KONTRAVARIANZ ──────────────────────────────────────────

type StringFn = (x: string) => void;
type NumberFn = (x: number) => void;

// Intersection von Funktionen = Ueberladung (flexibler)
type BothFn = StringFn & NumberFn;

const overloaded: BothFn = ((x: string | number) => {
  console.log(`  Received: ${x} (${typeof x})`);
}) as BothFn;

console.log(`\nFunktionstypen — Intersection (Ueberladung):`);
overloaded("hallo");  // OK
overloaded(42);       // OK

// Union von Funktionen = restriktiver (nur gemeinsame Argumente)
type EitherFn = StringFn | NumberFn;
// Aufruf nur mit string & number = never moeglich
// In der Praxis: Nur aufrufbar wenn du den Typ erst narrowst

console.log(`  Union von Funktionen: Nur aufrufbar nach Narrowing`);

// ─── PRAXIS: TYP-VERFEINERUNG MIT & ────────────────────────────────────────

interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Verfeinerung: role von string zu spezifischen Werten
type AdminUser = BaseUser & { role: "admin"; permissions: string[] };
type EditorUser = BaseUser & { role: "editor"; sections: string[] };
type ViewerUser = BaseUser & { role: "viewer" };

type AppUser = AdminUser | EditorUser | ViewerUser;

function describeUser(user: AppUser): string {
  switch (user.role) {
    case "admin":
      return `Admin ${user.name} (${user.permissions.length} Permissions)`;
    case "editor":
      return `Editor ${user.name} (Sections: ${user.sections.join(", ")})`;
    case "viewer":
      return `Viewer ${user.name}`;
  }
}

const users: AppUser[] = [
  { id: "1", name: "Alice", email: "a@x.com", role: "admin", permissions: ["read", "write", "delete"] },
  { id: "2", name: "Bob", email: "b@x.com", role: "editor", sections: ["blog", "docs"] },
  { id: "3", name: "Charlie", email: "c@x.com", role: "viewer" },
];

console.log(`\nTyp-Verfeinerung mit &:`);
for (const user of users) {
  console.log(`  ${describeUser(user)}`);
}

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
