/**
 * Lektion 05 - Solution 05: Fehlermeldungen lesen
 *
 * Alle Fehler behoben mit Erklaerungen.
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 1: Tippfehler behoben -- 'colour' -> 'color'
// ═══════════════════════════════════════════════════════════════════════════
//
// ERKENNTNIS: "Object literal may only specify known properties"
// bedeutet IMMER, dass ein Excess Property Check bei einem frischen
// Literal zugeschlagen hat. In der Praxis ist es meistens ein Tippfehler.

interface Theme {
  color: string;
  fontSize: number;
}

const theme: Theme = {
  color: "blue",    // FIX: 'colour' -> 'color'
  fontSize: 14,
};

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 2: Fehlende Properties ergaenzt
// ═══════════════════════════════════════════════════════════════════════════
//
// ERKENNTNIS: "Property 'x' is missing" ist ein ANDERER Fehler als
// Excess Property Checking. Hier fehlt etwas, dort ist etwas zuviel.

interface ServerConfig {
  host: string;
  port: number;
  protocol: "http" | "https";
}

const server: ServerConfig = {
  host: "localhost",
  port: 3000,             // FIX: fehlende Property ergaenzt
  protocol: "https",      // FIX: fehlende Property ergaenzt
};

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 3: Literal Type korrekt deklarieren
// ═══════════════════════════════════════════════════════════════════════════
//
// ERKENNTNIS: 'const role = "admin"' inferiert den LITERAL-Typ "admin",
// nicht den breiten Typ 'string'. Aber nur bei const!
// 'let role = "admin"' wuerde 'string' inferieren.
// Alternative: explizite Annotation: const role: "admin" = "admin"

interface UserProfile {
  name: string;
  role: "admin" | "user" | "guest";
}

// FIX: 'const' statt 'let' -- TypeScript inferiert jetzt "admin" statt string
// Alternativ: const role: "admin" | "user" | "guest" = "admin";
// Oder: const role = "admin" as const;
const role = "admin" as const;

const profile: UserProfile = {
  name: "Max",
  role: role,
};

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 4: Index Signature kompatibel machen
// ═══════════════════════════════════════════════════════════════════════════
//
// ERKENNTNIS: Alle festen Properties muessen zum Index-Typ passen.
// Wenn du string UND number Properties hast, muss die Index Signature
// 'string | number' erlauben.

interface PackageJson {
  name: string;
  version: number;
  [key: string]: string | number;  // FIX: Union-Typ statt nur string
}

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 5: Neues Objekt statt Mutation
// ═══════════════════════════════════════════════════════════════════════════
//
// ERKENNTNIS: readonly-Properties koennen nicht geaendert werden.
// Der Spread-Operator erstellt ein NEUES Objekt -- die readonly-Constraints
// des alten Objekts gelten fuer das neue nicht.
// Das ist das "Immutable Update"-Pattern aus React/Redux.

interface Document {
  readonly id: string;
  readonly createdAt: Date;
  title: string;
  content: string;
}

const doc: Document = {
  id: "doc-001",
  createdAt: new Date("2025-01-01"),
  title: "Entwurf",
  content: "...",
};

// FIX: Neues Objekt mit Spread
const updatedDoc: Document = { ...doc, title: "Fertig" };

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 6: Discriminated Union narrowing
// ═══════════════════════════════════════════════════════════════════════════
//
// ERKENNTNIS: Bei Unions musst du TypeScript sagen, WELCHE Variante
// vorliegt, bevor du auf varianten-spezifische Properties zugreifen kannst.
// Die 'type'-Property ist der Discriminant -- sie unterscheidet die Varianten.

interface UserContact {
  type: "user";
  name: string;
  email: string;
}

interface CompanyContact {
  type: "company";
  name: string;
  phone: string;
}

type Contact = UserContact | CompanyContact;

function getContactInfo(contact: Contact): string {
  // FIX: Discriminated Union Pattern mit switch
  switch (contact.type) {
    case "user":
      // TypeScript weiss: contact ist jetzt UserContact
      return `Email: ${contact.email}`;
    case "company":
      // TypeScript weiss: contact ist jetzt CompanyContact
      return `Phone: ${contact.phone}`;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

// Test 1
console.assert(theme.color === "blue", "Fehler 1: color sollte 'blue' sein");

// Test 2
console.assert(server.port !== undefined, "Fehler 2: port sollte gesetzt sein");
console.assert(server.protocol !== undefined, "Fehler 2: protocol sollte gesetzt sein");

// Test 3
console.assert(profile.role === "admin", "Fehler 3: role sollte 'admin' sein");

// Test 5
console.assert(updatedDoc.title === "Fertig", "Fehler 5: title sollte 'Fertig' sein");
console.assert(updatedDoc.id === "doc-001", "Fehler 5: id sollte unveraendert sein");

// Test 6
const userContact: Contact = { type: "user", name: "Max", email: "max@test.de" };
const companyContact: Contact = { type: "company", name: "ACME", phone: "+49123" };
console.assert(
  getContactInfo(userContact) === "Email: max@test.de",
  "Fehler 6: UserContact Info"
);
console.assert(
  getContactInfo(companyContact) === "Phone: +49123",
  "Fehler 6: CompanyContact Info"
);

console.log("\n✓ Alle Fehlermeldungen verstanden und behoben!");
