/**
 * Lektion 15 - Example 04: ReturnType, Parameters, Awaited
 *
 * Ausfuehren mit: npx tsx examples/04-returntype-parameters-awaited.ts
 *
 * Funktions-bezogene Utility Types und Promise-Entpackung.
 */

// ─── RETURNTYPE<T> ─────────────────────────────────────────────────────────

function createUser(name: string, email: string) {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    createdAt: new Date(),
    role: "user" as const,
  };
}

// Rueckgabetyp ableiten statt manuell definieren:
type User = ReturnType<typeof createUser>;
// ^ { id: number; name: string; email: string; createdAt: Date; role: "user" }

function displayUser(user: User): void {
  console.log(`User: ${user.name} (${user.email}), Role: ${user.role}`);
}

const user = createUser("Anna", "anna@example.com");
displayUser(user);

// ─── RETURNTYPE MIT FUNKTIONS-TYPEN ─────────────────────────────────────────

type Formatter = (input: string, uppercase: boolean) => { result: string; length: number };

type FormatResult = ReturnType<Formatter>;
// ^ { result: string; length: number }
// Kein typeof noetig — Formatter IST bereits ein Typ

// ─── PARAMETERS<T> ─────────────────────────────────────────────────────────

function sendEmail(to: string, subject: string, body: string, urgent?: boolean): void {
  console.log(`${urgent ? "[URGENT] " : ""}To: ${to}, Subject: ${subject}`);
}

type EmailParams = Parameters<typeof sendEmail>;
// ^ [to: string, subject: string, body: string, urgent?: boolean]

// Einzelne Parameter extrahieren:
type Recipient = Parameters<typeof sendEmail>[0]; // string
type Subject = Parameters<typeof sendEmail>[1];   // string

// ─── WRAPPER-FUNKTIONEN MIT PARAMETERS ──────────────────────────────────────

function loggingSendEmail(...args: Parameters<typeof sendEmail>): void {
  console.log(`[LOG] Sending email to ${args[0]}...`);
  sendEmail(...args);
}

loggingSendEmail("bob@example.com", "Hello", "World", true);

// ─── CONSTRUCTORPARAMETERS UND INSTANCETYPE ─────────────────────────────────

class ApiClient {
  constructor(
    public baseUrl: string,
    public timeout: number = 5000,
    public headers: Record<string, string> = {},
  ) {}

  async get(path: string): Promise<string> {
    return `Response from ${this.baseUrl}${path}`;
  }
}

type ApiParams = ConstructorParameters<typeof ApiClient>;
// ^ [baseUrl: string, timeout?: number, headers?: Record<string, string>]

type ApiInstance = InstanceType<typeof ApiClient>;
// ^ ApiClient

function createApiClient(...args: ConstructorParameters<typeof ApiClient>): ApiClient {
  console.log(`Creating API client for ${args[0]}`);
  return new ApiClient(...args);
}

const client = createApiClient("https://api.example.com", 3000);
console.log(`Client base URL: ${client.baseUrl}`);

// ─── AWAITED<T> — PROMISES ENTPACKEN ────────────────────────────────────────

type A = Awaited<Promise<string>>;
// ^ string

type B = Awaited<Promise<Promise<number>>>;
// ^ number (rekursiv!)

type C = Awaited<string>;
// ^ string (kein Promise? Bleibt gleich)

type D = Awaited<Promise<string | number>>;
// ^ string | number

console.log("Awaited entpackt Promises — auch verschachtelt");

// ─── AWAITED + RETURNTYPE ───────────────────────────────────────────────────

async function fetchUserData(id: number) {
  // Simuliert async API-Call
  return {
    id,
    name: "Max",
    email: "max@example.com",
    lastLogin: new Date(),
  };
}

// ReturnType gibt das Promise:
type AsyncUserResult = ReturnType<typeof fetchUserData>;
// ^ Promise<{ id: number; name: string; email: string; lastLogin: Date }>

// Awaited entpackt das Promise:
type UserData = Awaited<ReturnType<typeof fetchUserData>>;
// ^ { id: number; name: string; email: string; lastLogin: Date }

async function displayUserData(): Promise<void> {
  const userData: UserData = await fetchUserData(1);
  console.log(`Fetched user: ${userData.name} (${userData.email})`);
}

displayUserData();

// ─── AWAITED MIT PROMISE.ALL ────────────────────────────────────────────────

async function fetchName(): Promise<string> {
  return "Anna";
}

async function fetchAge(): Promise<number> {
  return 30;
}

async function fetchAll() {
  const results = await Promise.all([fetchName(), fetchAge()]);
  return results;
}

type AllResults = Awaited<ReturnType<typeof fetchAll>>;
// ^ [string, number]

// ─── PRAXIS: GENERIC FETCH WRAPPER ─────────────────────────────────────────

type AsyncFunction = (...args: any[]) => Promise<any>;

type UnwrapAsync<T extends AsyncFunction> = Awaited<ReturnType<T>>;

// Jetzt kann man den "wahren" Typ jeder async Funktion extrahieren:
type UserDataType = UnwrapAsync<typeof fetchUserData>;
// ^ { id: number; name: string; email: string; lastLogin: Date }

type NameType = UnwrapAsync<typeof fetchName>;
// ^ string

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
