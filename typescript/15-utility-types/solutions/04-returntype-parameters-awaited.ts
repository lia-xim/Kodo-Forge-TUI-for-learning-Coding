/**
 * Lektion 15 - Solution 04: ReturnType, Parameters, Awaited
 *
 * Ausfuehren mit: npx tsx solutions/04-returntype-parameters-awaited.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: ReturnType fuer API-Funktionen
// ═══════════════════════════════════════════════════════════════════════════

function createProduct(name: string, price: number, category: string) {
  return {
    id: Math.floor(Math.random() * 10000),
    name,
    price,
    category,
    createdAt: new Date(),
    isActive: true,
  };
}

// Loesung: typeof gibt den Funktionstyp, ReturnType extrahiert den Rueckgabetyp
type Product = ReturnType<typeof createProduct>;

function displayProduct(product: Product): string {
  return `${product.name} (${product.category}) - ${product.price} EUR [${product.isActive ? "Aktiv" : "Inaktiv"}]`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Parameters fuer Wrapper
// ═══════════════════════════════════════════════════════════════════════════

function sendNotification(
  userId: number,
  title: string,
  message: string,
  priority: "low" | "medium" | "high" = "medium",
): void {
  console.log(`[${priority}] To ${userId}: ${title} - ${message}`);
}

// Loesung: Parameters<typeof fn> gibt die Parameter als Tuple
function queueNotification(...args: Parameters<typeof sendNotification>): void {
  console.log(`[QUEUED] Notification for user ${args[0]}: "${args[1]}"`);
  // In der Praxis: In eine Queue schreiben statt sofort senden
  sendNotification(...args);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Awaited mit async Funktionen
// ═══════════════════════════════════════════════════════════════════════════

async function fetchUserProfile(userId: number) {
  return {
    id: userId,
    username: "max_dev",
    displayName: "Max Developer",
    joinedAt: new Date("2020-01-15"),
    isPremium: true,
  };
}

// Loesung: Awaited entpackt das Promise, ReturnType extrahiert den Typ
type UserProfile = Awaited<ReturnType<typeof fetchUserProfile>>;

function formatProfile(profile: UserProfile): string {
  return `${profile.displayName} (@${profile.username}) - ${profile.isPremium ? "Premium" : "Free"} - Joined: ${profile.joinedAt.toISOString().split("T")[0]}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: ConstructorParameters
// ═══════════════════════════════════════════════════════════════════════════

class HttpClient {
  constructor(
    public baseUrl: string,
    public timeout: number = 5000,
    public retries: number = 3,
    public headers: Record<string, string> = {},
  ) {}

  get(path: string): string {
    return `GET ${this.baseUrl}${path}`;
  }
}

// Loesung: ConstructorParameters gibt die Konstruktor-Parameter als Tuple
type HttpClientConfig = ConstructorParameters<typeof HttpClient>;

function createHttpClient(...args: HttpClientConfig): HttpClient {
  console.log(`Creating HTTP client for ${args[0]}`);
  return new HttpClient(...args);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Einzelne Parameter extrahieren
// ═══════════════════════════════════════════════════════════════════════════

function processPayment(
  amount: number,
  currency: "EUR" | "USD" | "CHF",
  recipient: { name: string; iban: string },
  reference?: string,
): { transactionId: string; status: "success" | "pending" } {
  return {
    transactionId: `TX-${Date.now()}`,
    status: "success",
  };
}

// Loesung: Parameters<typeof fn>[index] fuer einzelne Parameter
type Amount = Parameters<typeof processPayment>[0];       // number
type Currency = Parameters<typeof processPayment>[1];      // "EUR" | "USD" | "CHF"
type Recipient = Parameters<typeof processPayment>[2];     // { name: string; iban: string }
type PaymentResult = ReturnType<typeof processPayment>;    // { transactionId: string; status: ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Generic UnwrapAsync-Helper
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Awaited + ReturnType in einem generischen Typ
type UnwrapAsync<T extends (...args: any[]) => Promise<any>> = Awaited<ReturnType<T>>;

async function fetchOrders() {
  return [
    { id: 1, total: 99.99, items: 3 },
    { id: 2, total: 149.50, items: 5 },
  ];
}

type Orders = UnwrapAsync<typeof fetchOrders>;
// ^ { id: number; total: number; items: number }[]

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");
const product = createProduct("Widget", 9.99, "Gadgets");
console.log(displayProduct(product));

queueNotification(1, "Welcome!", "Hello World", "high");

fetchUserProfile(42).then((profile) => {
  console.log(formatProfile(profile));
});

const client = createHttpClient("https://api.example.com", 3000);
console.log(client.get("/users"));

// Payment-Typ-Demo:
const payment: PaymentResult = processPayment(
  100,
  "EUR",
  { name: "Max", iban: "DE89..." },
);
console.log(`Transaction: ${payment.transactionId}, Status: ${payment.status}`);

console.log("\n--- Alle Tests bestanden! ---");
