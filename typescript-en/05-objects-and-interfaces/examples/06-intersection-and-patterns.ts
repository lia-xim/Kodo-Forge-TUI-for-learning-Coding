export {};

/**
 * Lektion 05 - Beispiel 06: Intersection Types & Praxis-Patterns
 *
 * Themen:
 * - Intersection Types (&) fuer Objekte
 * - Intersection vs Extends
 * - Intersection-Konflikte (die Fallen!)
 * - Utility Types: Partial, Pick, Omit, Required
 * - Praxis-Patterns: API Response, Config, Discriminated Union
 *
 * Ausfuehren: npx tsx examples/06-intersection-and-patterns.ts
 */

// ─── 1. Intersection Types (&) Grundlagen ─────────────────────────────────

// Intersection kombiniert zwei Typen: Das Ergebnis muss BEIDE erfuellen.
type HasId = { id: string };
type HasTimestamps = { createdAt: Date; updatedAt: Date };
type HasName = { name: string };

// User muss ALLE drei Typen gleichzeitig erfuellen:
type User = HasId & HasTimestamps & HasName & {
  email: string;
  role: "admin" | "user";
};

const user: User = {
  id: "u-001",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-06-15"),
  name: "Max Mustermann",
  email: "max@test.de",
  role: "admin",
};

console.log("=== Intersection Types ===");
console.log(`User: ${user.name} (${user.role}), ID: ${user.id}`);

// ─── 2. Intersection vs Extends ──────────────────────────────────────────

// Vergleich: Gleicher Effekt, unterschiedliche Syntax

// Mit extends (Interface):
interface AnimalBase {
  name: string;
  legs: number;
}

interface Dog extends AnimalBase {
  breed: string;
  bark(): string;
}

// Mit & (Type Alias):
type AnimalBase2 = {
  name: string;
  legs: number;
};

type Dog2 = AnimalBase2 & {
  breed: string;
  bark(): string;
};

// Beide erzeugen den gleichen Typ:
const rex: Dog = {
  name: "Rex",
  legs: 4,
  breed: "Schaeferhund",
  bark: () => "Wuff!",
};

const buddy: Dog2 = {
  name: "Buddy",
  legs: 4,
  breed: "Labrador",
  bark: () => "Wau!",
};

console.log("\n=== Intersection vs Extends ===");
console.log(`${rex.name}: ${rex.bark()}`);
console.log(`${buddy.name}: ${buddy.bark()}`);

// ─── 3. Intersection-Konflikte -- DIE GROSSE FALLE! ─────────────────────

// Was passiert, wenn die gleiche Property in beiden Typen vorkommt?

// Fall A: Kompatible Typen -- Verengung
type Broad = { value: string | number };
type Narrow = { value: number };
type Combined = Broad & Narrow;
// value ist: (string | number) & number = number
// Die Intersection VERENGT den Typ!

const combined: Combined = { value: 42 };
// const bad: Combined = { value: "text" };  // Fehler! value muss number sein

console.log("\n=== Kompatible Intersection ===");
console.log(`Combined value: ${combined.value} (Typ: number)`);

// Fall B: Inkompatible Typen -- never!
type HasStringStatus = { status: string };
type HasNumberStatus = { status: number };
type Impossible = HasStringStatus & HasNumberStatus;
// status ist: string & number = never!
// Dieses Objekt kann NICHT erstellt werden.

// const impossible: Impossible = { status: ??? };  // Unmoeglich!

console.log("Inkompatible Intersection: status waere 'never' (nicht erstellbar)");

// Fall C: Literal Types -- Verengung zum spezifischeren Literal
type HasStatusActive = { status: "active" | "inactive" };
type HasStatusActive2 = { status: "active" | "deleted" };
type StrictlyActive = HasStatusActive & HasStatusActive2;
// status ist: ("active" | "inactive") & ("active" | "deleted") = "active"
// Nur "active" ist in BEIDEN enthalten!

const strictlyActive: StrictlyActive = { status: "active" };
console.log(`StrictlyActive status: "${strictlyActive.status}"`);

// ─── 4. Utility Types: Partial, Pick, Omit, Required ─────────────────────

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
}

// Partial<T> -- alle Properties optional
function updateProduct(id: number, changes: Partial<Product>): void {
  console.log(`Update Product #${id}:`, changes);
}

console.log("\n=== Partial<T> ===");
updateProduct(1, { price: 19.99 });              // Nur Preis aendern
updateProduct(2, { name: "Neu", inStock: true }); // Name + Verfuegbarkeit

// Pick<T, K> -- nur bestimmte Properties
type ProductPreview = Pick<Product, "id" | "name" | "price">;

const preview: ProductPreview = {
  id: 1,
  name: "TypeScript Buch",
  price: 39.99,
  // description und inStock sind NICHT erlaubt
};

console.log("\n=== Pick<T, K> ===");
console.log("Preview:", preview);

// Omit<T, K> -- bestimmte Properties entfernen
type CreateProductDto = Omit<Product, "id">;

const newProduct: CreateProductDto = {
  name: "Neues Buch",
  price: 29.99,
  description: "Ein tolles Buch",
  inStock: true,
  // id ist NICHT enthalten (wird vom Server generiert)
};

console.log("\n=== Omit<T, K> ===");
console.log("Neues Produkt (ohne ID):", newProduct);

// Required<T> -- alle optionalen Properties pflichtmachen
interface AppConfig {
  host?: string;
  port?: number;
  debug?: boolean;
  logLevel?: "info" | "warn" | "error";
}

function startServer(config: Required<AppConfig>): void {
  console.log(`Server startet: ${config.host}:${config.port}`);
  console.log(`Debug: ${config.debug}, Log Level: ${config.logLevel}`);
}

console.log("\n=== Required<T> ===");
startServer({
  host: "localhost",
  port: 3000,
  debug: false,
  logLevel: "info",
  // ALLE muessen angegeben werden!
});

// ─── 5. Praxis-Pattern: API Response Typen ───────────────────────────────

// Ein generischer Wrapper fuer API-Responses
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Das ist eine Discriminated Union! (Vorschau auf Lektion 12)
// 'success' ist der Discriminant.

interface UserDto {
  id: string;
  name: string;
  email: string;
}

function handleResponse(response: ApiResponse<UserDto>): void {
  if (response.success === true) {
    // TypeScript weiss: response ist ApiSuccessResponse<UserDto>
    console.log(`User: ${response.data.name}`);
    if (response.meta) {
      console.log(`Seite ${response.meta.page} von ${response.meta.totalPages}`);
    }
  } else {
    // TypeScript weiss: response ist ApiErrorResponse
    console.log(`Fehler: ${response.error.code} - ${response.error.message}`);
  }
}

console.log("\n=== API Response Pattern ===");
handleResponse({
  success: true,
  data: { id: "u1", name: "Max", email: "max@test.de" },
  meta: { page: 1, totalPages: 5, totalItems: 42 },
});

handleResponse({
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "User nicht gefunden",
  },
});

// ─── 6. Praxis-Pattern: Config mit Defaults ─────────────────────────────

interface ServerConfig {
  host: string;
  port: number;
  cors: boolean;
  maxBodySize: number;
  ssl: boolean;
}

// Defaults definieren -- Partial, weil nicht alle Defaults haben muessen
const DEFAULTS: Partial<ServerConfig> = {
  host: "0.0.0.0",
  port: 3000,
  cors: false,
  maxBodySize: 1_048_576,  // 1 MB
  ssl: false,
};

// User-Config ist Partial -- nur das Noetige angeben
function createConfig(userConfig: Partial<ServerConfig>): ServerConfig {
  // Spread-Operator: Defaults werden von User-Config ueberschrieben
  return { ...DEFAULTS, ...userConfig } as ServerConfig;
}

console.log("\n=== Config mit Defaults ===");
const config = createConfig({ port: 8080, ssl: true });
console.log(config);

// ─── 7. Praxis-Pattern: Discriminated Union (Event System) ──────────────

// Events mit verschiedenen Payloads, unterscheidbar durch 'type'
interface UserCreatedEvent {
  type: "user.created";
  payload: { userId: string; name: string; email: string };
  timestamp: Date;
}

interface UserUpdatedEvent {
  type: "user.updated";
  payload: { userId: string; changes: Partial<UserDto> };
  timestamp: Date;
}

interface UserDeletedEvent {
  type: "user.deleted";
  payload: { userId: string; reason?: string };
  timestamp: Date;
}

type UserEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

function logEvent(event: UserEvent): void {
  console.log(`[${event.type}] at ${event.timestamp.toISOString()}`);

  switch (event.type) {
    case "user.created":
      console.log(`  Neuer User: ${event.payload.name} (${event.payload.email})`);
      break;
    case "user.updated":
      console.log(`  User ${event.payload.userId} geaendert:`, event.payload.changes);
      break;
    case "user.deleted":
      console.log(`  User ${event.payload.userId} geloescht`);
      if (event.payload.reason) {
        console.log(`  Grund: ${event.payload.reason}`);
      }
      break;
  }
}

console.log("\n=== Discriminated Union: Events ===");
logEvent({
  type: "user.created",
  payload: { userId: "u1", name: "Max", email: "max@test.de" },
  timestamp: new Date(),
});

logEvent({
  type: "user.deleted",
  payload: { userId: "u1", reason: "Account-Loeschung auf Nutzerwunsch" },
  timestamp: new Date(),
});

// ─── 8. Zusammenfassung ─────────────────────────────────────────────────

console.log("\n=== ZUSAMMENFASSUNG ===");
console.log("1. & (Intersection) = UND-Verknuepfung: Muss ALLE Typen erfuellen");
console.log("2. Kompatible Properties werden VERENGT, inkompatible werden 'never'");
console.log("3. Partial<T>, Pick<T,K>, Omit<T,K>, Required<T> = Objekte transformieren");
console.log("4. API-Responses: Generischer Wrapper + Discriminated Union");
console.log("5. Config-Pattern: Defaults + Partial + Spread");
console.log("6. Event-System: Discriminated Union mit 'type'-Discriminant");
