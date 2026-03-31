/**
 * Lektion 15 - Example 01: Partial, Required, Readonly
 *
 * Ausfuehren mit: npx tsx examples/01-partial-required-readonly.ts
 *
 * Die drei "Modifier"-Utility-Types: Partial, Required, Readonly.
 */

// ─── DAS BASIS-INTERFACE ────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

// ─── PARTIAL<T> — ALLES OPTIONAL ────────────────────────────────────────────

type UserUpdate = Partial<User>;
// ^ { id?: number; name?: string; email?: string; role?: "admin" | "user" }

function updateUser(id: number, changes: Partial<User>): User {
  // Simuliert DB-Update: bestehenden User laden und mergen
  const existing: User = { id, name: "Max", email: "max@example.com", role: "user" };
  const updated = { ...existing, ...changes };
  console.log(`Updated user ${id}:`, updated);
  return updated;
}

// Nur einzelne Felder senden:
updateUser(1, { name: "Maximilian" });
updateUser(1, { email: "new@mail.com", role: "admin" });
updateUser(1, {}); // Auch OK — leeres Update

// ─── REQUIRED<T> — ALLES VERPFLICHTEND ─────────────────────────────────────

interface AppConfig {
  host?: string;
  port?: number;
  debug?: boolean;
  logLevel?: "error" | "warn" | "info" | "debug";
}

const defaults: Required<AppConfig> = {
  host: "localhost",
  port: 3000,
  debug: false,
  logLevel: "info",
};

function createConfig(overrides: AppConfig): Required<AppConfig> {
  const resolved = { ...defaults, ...overrides };
  console.log("Config:", resolved);
  return resolved;
}

const config = createConfig({ port: 8080, debug: true });
// config.host ist string, NICHT string | undefined!
console.log(`Server: ${config.host}:${config.port}`);

// ─── READONLY<T> — ALLES UNVERAENDERLICH ────────────────────────────────────

type FrozenUser = Readonly<User>;

function displayUser(user: Readonly<User>): void {
  console.log(`User: ${user.name} (${user.email})`);
  // user.name = "other"; // Error! readonly
}

const immutableUser: FrozenUser = {
  id: 1,
  name: "Anna",
  email: "anna@example.com",
  role: "admin",
};
displayUser(immutableUser);

// ─── READONLY IST SHALLOW ──────────────────────────────────────────────────

interface UserProfile {
  name: string;
  settings: {
    theme: "light" | "dark";
    language: string;
  };
}

const profile: Readonly<UserProfile> = {
  name: "Max",
  settings: { theme: "dark", language: "de" },
};

// profile.name = "Anna";  // Error — readonly!
profile.settings.theme = "light"; // KEIN Error! Nur shallow readonly!
console.log(`Theme geaendert auf: ${profile.settings.theme}`);

// ─── KOMBINATION ────────────────────────────────────────────────────────────

// Readonly + Partial = Unveraenderliches Partial-Update-Objekt
type ReadonlyUpdate = Readonly<Partial<User>>;

// Required + Readonly = Vollstaendige, eingefrorene Daten
type CompleteImmutableUser = Readonly<Required<User>>;

// Partial + Required heben sich auf:
type BackToOriginal = Required<Partial<User>>;
// ^ Identisch mit User

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
