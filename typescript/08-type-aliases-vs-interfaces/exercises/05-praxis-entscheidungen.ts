/**
 * Lektion 08 - Exercise 05: Praxis-Entscheidungen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-praxis-entscheidungen.ts
 *
 * 5 realistische Szenarien: Entscheide type oder interface
 * und implementiere die Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SZENARIO 1: API-Response mit Varianten
// ═══════════════════════════════════════════════════════════════════════════

// Dein Backend kann drei verschiedene Antworten liefern:
// - "loading" (nur Status)
// - "success" (Status + Daten)
// - "error" (Status + Fehlermeldung + optional: Retry-Info)
//
// TODO: Waehle type oder interface und implementiere den Typ "ApiResponse<T>".
// Schreibe dann eine Funktion "handleResponse" die alle drei Varianten behandelt.

// ═══════════════════════════════════════════════════════════════════════════
// SZENARIO 2: Service-Contract fuer Dependency Injection
// ═══════════════════════════════════════════════════════════════════════════

// Du schreibst einen Angular-Service-Contract.
// Der AuthService braucht:
// - login(email: string, password: string): Promise<AuthToken>
// - logout(): Promise<void>
// - isAuthenticated(): boolean
// - getToken(): AuthToken | null
//
// AuthToken hat: token (string), expiresAt (Date)
//
// TODO: Waehle type oder interface fuer AuthToken und AuthService.
// Erstelle eine Mock-Implementierung.

// ═══════════════════════════════════════════════════════════════════════════
// SZENARIO 3: Formular-State mit vielen Zustaenden
// ═══════════════════════════════════════════════════════════════════════════

// Ein komplexes Formular hat folgende Zustaende:
// - "pristine" (unberuehrt, Initialwerte)
// - "dirty" (Aenderungen gemacht, noch nicht validiert)
// - "validating" (Server-Validierung laeuft)
// - "valid" (alles OK, Daten vorhanden)
// - "invalid" (Fehler vorhanden, Fehlerliste)
// - "submitting" (wird gesendet)
// - "submitted" (erfolgreich gesendet, Server-Antwort vorhanden)
//
// TODO: Modelliere den FormState<T> Typ.
// T ist der Typ der Formulardaten.

// ═══════════════════════════════════════════════════════════════════════════
// SZENARIO 4: Plugin-System mit erweiterbarer Config
// ═══════════════════════════════════════════════════════════════════════════

// Du baust ein Plugin-System. Die Basis-Plugin-Config hat:
// - name (string), version (string), enabled (boolean)
//
// Jedes Plugin kann die Config erweitern (z.B. Logging-Plugin fuegt
// "logLevel" hinzu, Auth-Plugin fuegt "secret" hinzu).
//
// TODO: Waehle das richtige Konstrukt und implementiere es.
// Denke daran: Plugins werden von ANDEREN Entwicklern geschrieben
// und sollen den Basis-Typ erweitern koennen, ohne den Quellcode zu aendern.

// ═══════════════════════════════════════════════════════════════════════════
// SZENARIO 5: Utility-Typen fuer ein ORM
// ═══════════════════════════════════════════════════════════════════════════

// Du baust Utility-Typen fuer ein einfaches ORM.
//
// Gegeben: Ein Entity-Interface
interface Entity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// TODO: Erstelle folgende Utility-Typen:
// 1. CreateInput<T extends Entity> — T ohne id, createdAt, updatedAt
// 2. UpdateInput<T extends Entity> — Wie CreateInput, aber alles optional
// 3. WhereClause<T> — Jede Property von T kann angegeben werden,
//    und der Wert ist entweder der Original-Typ oder ein Objekt
//    { equals: T[K] } | { not: T[K] } | { in: T[K][] }
// Tipp: Nur type kann das!

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test 1: API Response
const loading: ApiResponse<string[]> = { status: "loading" };
const success: ApiResponse<string[]> = { status: "success", data: ["a", "b"] };
const error: ApiResponse<string[]> = { status: "error", message: "Timeout" };
console.log(handleResponse(success));

// Test 2: AuthService
const authService = new MockAuthService();
authService.login("max@test.de", "secret123").then(token => {
  console.log(`Token: ${token.token}`);
});

// Test 3: FormState
const pristine: FormState<{ name: string }> = { status: "pristine", values: { name: "" } };
const invalid: FormState<{ name: string }> = {
  status: "invalid", values: { name: "" }, errors: ["Name ist erforderlich"],
};

// Test 5: ORM Utility Types
interface User extends Entity {
  name: string;
  email: string;
  role: "admin" | "user";
}

const createInput: CreateInput<User> = { name: "Max", email: "m@t.de", role: "user" };
const updateInput: UpdateInput<User> = { name: "Neuer Name" };
const where: WhereClause<User> = { role: { equals: "admin" } };

console.log("Alle Tests bestanden!");
*/
