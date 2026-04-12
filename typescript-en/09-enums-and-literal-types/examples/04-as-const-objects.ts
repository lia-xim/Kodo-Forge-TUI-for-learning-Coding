/**
 * Lektion 09 - Example 04: as const Objects
 *
 * Ausfuehren mit: npx tsx examples/04-as-const-objects.ts
 *
 * Das as const Pattern als moderne Alternative zu Enums.
 * Laufzeit-Werte + abgeleitete Typen ohne Enum-Overhead.
 */

// ─── EINFACHES AS CONST PATTERN ─────────────────────────────────────────────

const HttpMethod = {
  Get: "GET",
  Post: "POST",
  Put: "PUT",
  Delete: "DELETE",
  Patch: "PATCH",
} as const;

// Union Type ableiten:
type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod];
// ^ "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

function sendRequest(method: HttpMethod, url: string) {
  console.log(`${method} ${url}`);
}

// Benannte Konstanten verwenden:
sendRequest(HttpMethod.Get, "/api/users");
sendRequest(HttpMethod.Post, "/api/users");

// Oder direkt den String (strukturell kompatibel!):
sendRequest("DELETE", "/api/users/1");
// ^ Funktioniert! Anders als bei Enums!

console.log("--- as const Object ---");
console.log("Keys:", Object.keys(HttpMethod));
console.log("Values:", Object.values(HttpMethod));

// ─── VERGLEICH: ENUM VS AS CONST ────────────────────────────────────────────

enum StatusEnum {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING",
}

const StatusConst = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Pending: "PENDING",
} as const;
type StatusConst = typeof StatusConst[keyof typeof StatusConst];

console.log("\n--- Enum vs as const ---");

// Beide koennen als Parameter-Typ verwendet werden:
function printStatusEnum(s: StatusEnum) { console.log(`Enum: ${s}`); }
function printStatusConst(s: StatusConst) { console.log(`Const: ${s}`); }

printStatusEnum(StatusEnum.Active);
printStatusConst(StatusConst.Active);

// Aber: as const ist mit Strings kompatibel!
// printStatusEnum("ACTIVE");  // Error! String !== StatusEnum (nominal)
printStatusConst("ACTIVE");    // OK! String === "ACTIVE" (strukturell)

// ─── TYPEOF + KEYOF SCHRITT FUER SCHRITT ────────────────────────────────────

const Colors = {
  Red: "#ff0000",
  Green: "#00ff00",
  Blue: "#0000ff",
} as const;

// Schritt 1: typeof gibt den Typ des Objekts
type ColorsObject = typeof Colors;
// { readonly Red: "#ff0000"; readonly Green: "#00ff00"; readonly Blue: "#0000ff" }

// Schritt 2: keyof gibt die Keys als Union
type ColorKey = keyof typeof Colors;
// "Red" | "Green" | "Blue"

// Schritt 3: Indexed Access gibt die Werte als Union
type ColorValue = typeof Colors[keyof typeof Colors];
// "#ff0000" | "#00ff00" | "#0000ff"

// Kurzform — gleicher Name fuer Wert und Typ:
type Colors = typeof Colors[keyof typeof Colors];

console.log("\n--- typeof + keyof ---");
console.log("Color keys:", Object.keys(Colors));
console.log("Color values:", Object.values(Colors));

// ─── MIT ZUSAETZLICHEN INFORMATIONEN ────────────────────────────────────────

const Severity = {
  Low: { level: 1, label: "Niedrig", color: "#2ecc71" },
  Medium: { level: 2, label: "Mittel", color: "#f1c40f" },
  High: { level: 3, label: "Hoch", color: "#e74c3c" },
  Critical: { level: 4, label: "Kritisch", color: "#c0392b" },
} as const;

type SeverityKey = keyof typeof Severity;
type SeverityLevel = typeof Severity[SeverityKey]["level"];
// ^ 1 | 2 | 3 | 4

function logSeverity(key: SeverityKey) {
  const info = Severity[key];
  console.log(`[${info.label}] Level ${info.level} (${info.color})`);
}

console.log("\n--- Zusaetzliche Informationen ---");
logSeverity("Low");
logSeverity("Critical");

// ─── ARRAY MIT AS CONST ─────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://example.com",
  "https://staging.example.com",
  "http://localhost:3000",
] as const;

type AllowedOrigin = typeof ALLOWED_ORIGINS[number];
// ^ "https://example.com" | "https://staging.example.com" | "http://localhost:3000"

function isAllowedOrigin(origin: string): origin is AllowedOrigin {
  return (ALLOWED_ORIGINS as readonly string[]).includes(origin);
}

console.log("\n--- Array mit as const ---");
console.log(`example.com erlaubt: ${isAllowedOrigin("https://example.com")}`);
console.log(`evil.com erlaubt: ${isAllowedOrigin("https://evil.com")}`);

// ─── ERWEITERBARKEIT ────────────────────────────────────────────────────────

const BasePermissions = {
  Read: "read",
  Write: "write",
} as const;

const AdminPermissions = {
  ...BasePermissions,
  Delete: "delete",
  Admin: "admin",
} as const;

type Permission = typeof AdminPermissions[keyof typeof AdminPermissions];
// ^ "read" | "write" | "delete" | "admin"

console.log("\n--- Erweiterbarkeit ---");
console.log("Admin Permissions:", Object.values(AdminPermissions));

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
