/**
 * Lektion 05 - Exercise 05: Fehlermeldungen lesen
 *
 * Das Lesen von TypeScript-Fehlermeldungen ist eine eigene Faehigkeit.
 * In dieser Uebung lernst du, typische Object/Interface-Fehler zu
 * erkennen, zu verstehen und zu beheben.
 *
 * Fuer jede Aufgabe:
 * 1. Lies den fehlerhaften Code
 * 2. Lies die Fehlermeldung im Kommentar
 * 3. Erklaere in eigenen Worten, WAS der Fehler bedeutet
 * 4. Behebe den Fehler auf die beschriebene Weise
 *
 * Ausfuehren: npx tsc --noEmit exercises/05-fehlermeldungen-lesen.ts
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 1: "Object literal may only specify known properties"
// ═══════════════════════════════════════════════════════════════════════════
//
// FEHLERMELDUNG:
// Object literal may only specify known properties, and 'colour'
// does not exist in type 'Theme'.
//
// WAS BEDEUTET DAS?
// TypeScript fuehrt einen Excess Property Check durch, weil du ein
// FRISCHES Object Literal direkt einem Typ zuweist. 'colour' ist nicht
// im Zieltyp 'Theme' definiert -- vermutlich ein Tippfehler (color vs colour).
//
// WICHTIG: Dieser Fehler sagt dir ZWEI Dinge:
// 1. Es ist ein FRISCHES Object Literal (sonst kaeme dieser Fehler nicht)
// 2. Die Extra-Property ist NICHT im Zieltyp
//
// AUFGABE: Behebe den Tippfehler.

interface Theme {
  color: string;
  fontSize: number;
}

// TODO: Behebe den Fehler (Tipp: Schau genau auf den Property-Namen)
const theme: Theme = {
  // @ts-expect-error -- Entferne diese Zeile wenn du den Fehler behoben hast
  colour: "blue",   // <-- Tippfehler!
  fontSize: 14,
};

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 2: "Property 'x' is missing in type 'Y'"
// ═══════════════════════════════════════════════════════════════════════════
//
// FEHLERMELDUNG:
// Type '{ host: string; }' is not assignable to type 'ServerConfig'.
//   Property 'port' is missing in type '{ host: string; }'
//   but required in type 'ServerConfig'.
//
// WAS BEDEUTET DAS?
// Dem Objekt FEHLT eine Pflicht-Property. Das ist ein ANDERER Fehler als
// Excess Property Checking! Hier hat das Objekt ZU WENIG, nicht ZU VIEL.
//
// DER UNTERSCHIED:
// - "Object literal may only specify known properties" = ZU VIEL (Excess)
// - "Property 'x' is missing" = ZU WENIG (Missing)
//
// AUFGABE: Fuege die fehlende Property hinzu.

interface ServerConfig {
  host: string;
  port: number;
  protocol: "http" | "https";
}

// TODO: Fuege die fehlenden Properties hinzu
// @ts-expect-error -- Entferne diese Zeile wenn du den Fehler behoben hast
const server: ServerConfig = {
  host: "localhost",
};

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 3: "Type 'X' is not assignable to type 'Y'"
// ═══════════════════════════════════════════════════════════════════════════
//
// FEHLERMELDUNG:
// Type 'string' is not assignable to type '"admin" | "user" | "guest"'.
//
// WAS BEDEUTET DAS?
// Du versuchst einen BREITEN Typ (string) einem ENGEN Typ
// ("admin" | "user" | "guest") zuzuweisen. TypeScript weiss nicht,
// ob der String tatsaechlich einer der erlaubten Werte ist.
//
// AUFGABE: Behebe den Fehler, indem du den Typ des Parameters einschraenkst.
// HINWEIS: Verwende KEINE Type Assertion (as). Aendere stattdessen die
//          Variable-Deklaration.

interface UserProfile {
  name: string;
  role: "admin" | "user" | "guest";
}

// TODO: Behebe den Fehler -- aendere die Deklaration von 'userRole',
//       sodass TypeScript den Literal-Typ "admin" inferiert statt 'string'.
//       Hinweis: 'let' ist das Problem hier!
let userRole = "admin";  // TypeScript inferiert 'string', nicht '"admin"'

const profile: UserProfile = {
  name: "Max",
  // @ts-expect-error -- Entferne diese Zeile wenn du den Fehler behoben hast
  role: userRole,  // string ist nicht assignable zu "admin" | "user" | "guest"
};

// Tipp: Wie machst du aus 'let role = "admin"' einen Literal-Typ?
// Denke an: const, as const, oder explizite Typ-Annotation.

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 4: "Index signature -- Type 'X' is not assignable to type 'Y'"
// ═══════════════════════════════════════════════════════════════════════════
//
// FEHLERMELDUNG:
// Property 'version' of type 'number' is not assignable to 'string'
// index type 'string'.
//
// WAS BEDEUTET DAS?
// Du hast eine Index Signature [key: string]: string, aber eine feste
// Property 'version' mit Typ 'number'. Alle festen Properties muessen
// zum Index-Typ kompatibel sein.
//
// AUFGABE: Aendere die Index Signature, sodass sie BEIDE Typen abdeckt.

interface PackageJson {
  name: string;
  // @ts-expect-error -- Entferne diese Zeile wenn du den Fehler behoben hast
  version: number;     // number passt nicht zu [key: string]: string!
  // TODO: Aendere die Index Signature, sodass sie string UND number abdeckt
  [key: string]: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 5: "Cannot assign to 'x' because it is a read-only property"
// ═══════════════════════════════════════════════════════════════════════════
//
// FEHLERMELDUNG:
// Cannot assign to 'id' because it is a read-only property.
//
// WAS BEDEUTET DAS?
// Du versuchst eine readonly-Property zu aendern. TypeScript verbietet das
// auf Typ-Ebene (zur Laufzeit wuerde es trotzdem funktionieren!).
//
// AUFGABE: Erstelle ein NEUES Objekt mit der gewuenschten Aenderung,
//          statt das bestehende zu mutieren.

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

// TODO: Erstelle 'updatedDoc' als NEUES Objekt mit dem aktualisierten Titel.
//       Verwende den Spread-Operator: { ...doc, title: "Fertig" }
//       NICHT: doc.title = "Fertig" (wuerde hier funktionieren, aber
//       das Pattern ist der Spread-Weg, weil er auch mit readonly funktioniert)

// @ts-expect-error -- Entferne und ersetze durch { ...doc, title: "Fertig" }
const updatedDoc: Document = "TODO: Ersetze mich durch den Spread-Operator";

// ═══════════════════════════════════════════════════════════════════════════
// Fehler 6: "Property 'x' does not exist on type 'Y | Z'"
// ═══════════════════════════════════════════════════════════════════════════
//
// FEHLERMELDUNG:
// Property 'email' does not exist on type 'UserContact | CompanyContact'.
//   Property 'email' does not exist on type 'CompanyContact'.
//
// WAS BEDEUTET DAS?
// Du greifst auf eine Property zu, die nicht in ALLEN Varianten der Union
// existiert. TypeScript weiss nicht, ob das Objekt ein UserContact oder
// CompanyContact ist -- und auf CompanyContact gibt es kein 'email'.
//
// AUFGABE: Nutze Type Narrowing (Discriminated Union Pattern),
//          um den Zugriff sicher zu machen.

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
  // TODO: Nutze eine if-Abfrage oder switch auf contact.type,
  //       um sicher auf email bzw. phone zuzugreifen.
  //       Gib "Email: ..." fuer User und "Phone: ..." fuer Company zurueck.

  // @ts-expect-error -- Entferne und ersetze durch deine Loesung
  return contact.email;
}

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

// Entkommentiere wenn alle Fehler behoben sind:

/*
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
*/

console.log("\nEntkommentiere die Tests am Ende der Datei, wenn du alle Fehler behoben hast.");
