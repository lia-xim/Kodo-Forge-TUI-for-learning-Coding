/**
 * Lektion 15 - Example 02: Pick, Omit, Record
 *
 * Ausfuehren mit: npx tsx examples/02-pick-omit-record.ts
 *
 * Objekt-Transformation mit Pick, Omit und Record.
 */

// ─── BASIS-INTERFACE ────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  lastLogin: Date;
  role: "admin" | "user" | "guest";
}

// ─── PICK<T, K> — PROPERTIES AUSWAEHLEN ────────────────────────────────────

// Oeffentliches Profil — ohne sensible Daten:
type PublicUser = Pick<User, "id" | "name" | "role">;

const publicProfile: PublicUser = {
  id: 1,
  name: "Anna",
  role: "admin",
};
console.log("Public profile:", publicProfile);

// Login-Daten:
type LoginCredentials = Pick<User, "email" | "password">;

function login(credentials: LoginCredentials): boolean {
  console.log(`Login attempt: ${credentials.email}`);
  return true;
}

login({ email: "anna@example.com", password: "secret123" });

// ─── OMIT<T, K> — PROPERTIES AUSSCHLIESSEN ─────────────────────────────────

// Alles ausser Passwort (fuer API-Response):
type SafeUser = Omit<User, "password">;

// Fuer Erstellung (Server setzt id, createdAt, lastLogin):
type CreateUserInput = Omit<User, "id" | "createdAt" | "lastLogin">;

function createUser(input: CreateUserInput): User {
  const user: User = {
    ...input,
    id: Math.floor(Math.random() * 1000),
    createdAt: new Date(),
    lastLogin: new Date(),
  };
  console.log("Created user:", user.name, "with id:", user.id);
  return user;
}

createUser({
  name: "Ben",
  email: "ben@example.com",
  password: "secure456",
  role: "user",
});

// ─── OMIT IST NICHT TYPSICHER! ─────────────────────────────────────────────

// ACHTUNG: Kein Fehler bei Tippfehler!
type BrokenOmit = Omit<User, "passwort">; // Tippfehler — kein Error!
// ^ Identisch mit User — "passwort" existiert nicht, nichts wird entfernt

// StrictOmit — die sichere Alternative:
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type SafeUserStrict = StrictOmit<User, "password">; // OK
// type BrokenStrict = StrictOmit<User, "passwort">; // Error! Nicht in keyof User

console.log("StrictOmit verhindert Tippfehler!");

// ─── RECORD<K, V> — TYPSICHERE DICTIONARIES ────────────────────────────────

// Einfaches Dictionary:
const userCache: Record<string, User> = {};
// ^ Beliebige String-Keys mit User-Values

// Spezifische Keys:
type Role = "admin" | "user" | "guest";
type RoleConfig = Record<Role, { maxFileSize: number; canDelete: boolean }>;

const roleConfigs: RoleConfig = {
  admin: { maxFileSize: 100_000_000, canDelete: true },
  user: { maxFileSize: 10_000_000, canDelete: false },
  guest: { maxFileSize: 1_000_000, canDelete: false },
};

console.log("Admin max file size:", roleConfigs.admin.maxFileSize);

// ─── RECORD ALS LOOKUP-TABLE ────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const methodDescriptions: Record<HttpMethod, string> = {
  GET: "Daten abrufen",
  POST: "Neue Ressource erstellen",
  PUT: "Ressource aktualisieren",
  DELETE: "Ressource loeschen",
};

function describeMethod(method: HttpMethod): string {
  return methodDescriptions[method];
}

console.log(`GET: ${describeMethod("GET")}`);
console.log(`POST: ${describeMethod("POST")}`);

// ─── RECORD MIT BERECHNETEN KEYS ────────────────────────────────────────────

type StatusCode = 200 | 201 | 400 | 404 | 500;

const statusMessages: Record<StatusCode, string> = {
  200: "OK",
  201: "Created",
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error",
};

function getStatusMessage(code: StatusCode): string {
  return statusMessages[code];
}

console.log(`404: ${getStatusMessage(404)}`);

// ─── PICK + OMIT ZUSAMMEN ──────────────────────────────────────────────────

// Bei wenigen gewuenschten Feldern: Pick
type UserSummary = Pick<User, "id" | "name">;

// Bei wenigen ungewuenschten Feldern: Omit
type UserWithoutTimestamps = Omit<User, "createdAt" | "lastLogin">;

// Gleiche Ergebnis, andere Perspektive:
type A = Pick<User, "id" | "name" | "email" | "role">;
type B = Omit<User, "password" | "createdAt" | "lastLogin">;
// A und B sind identisch!

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
