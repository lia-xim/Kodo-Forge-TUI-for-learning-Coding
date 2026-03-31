/**
 * Lektion 15 - Exercise 04: ReturnType, Parameters, Awaited
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-returntype-parameters-awaited.ts
 *
 * 6 Aufgaben zu funktionsbezogenen Utility Types.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
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

// TODO: Leite den Typ "Product" aus der createProduct-Funktion ab
// type Product = ...

// TODO: Erstelle eine Funktion "displayProduct" die ein Product nimmt
// und eine formatierte Beschreibung zurueckgibt
// function displayProduct(product: Product): string { ... }

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

// TODO: Erstelle eine Funktion "queueNotification" die die gleichen
// Parameter wie sendNotification nimmt, aber das Senden verzoegert.
// Verwende Parameters<typeof sendNotification> fuer die Parameterliste.
// function queueNotification(...args: ???): void { ... }

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

// TODO: Erstelle den Typ "UserProfile" aus der async Funktion
// (Tipp: Awaited + ReturnType)
// type UserProfile = ...

// TODO: Erstelle eine Funktion "formatProfile" die ein UserProfile nimmt
// function formatProfile(profile: UserProfile): string { ... }

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

// TODO: Erstelle einen Typ "HttpClientConfig" der die Konstruktor-Parameter enthaelt
// type HttpClientConfig = ...

// TODO: Erstelle eine Factory-Funktion die einen HttpClient erstellt
// function createHttpClient(...args: HttpClientConfig): HttpClient { ... }

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

// TODO: Extrahiere die einzelnen Parameter-Typen:
// type Amount = ...     // number (erster Parameter)
// type Currency = ...   // "EUR" | "USD" | "CHF" (zweiter Parameter)
// type Recipient = ...  // { name: string; iban: string } (dritter Parameter)
// type PaymentResult = ... // Return-Typ der Funktion

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Generic UnwrapAsync-Helper
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen generischen Typ "UnwrapAsync<T>" der den
// Rueckgabetyp einer async Funktion entpackt.
// T muss eine Funktion sein die ein Promise zurueckgibt.
// type UnwrapAsync<T extends (...args: any[]) => Promise<any>> = ...

// Teste mit:
async function fetchOrders() {
  return [
    { id: 1, total: 99.99, items: 3 },
    { id: 2, total: 149.50, items: 5 },
  ];
}

// type Orders = UnwrapAsync<typeof fetchOrders>;
// Erwartet: { id: number; total: number; items: number }[]

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// const product = createProduct("Widget", 9.99, "Gadgets");
// console.log(displayProduct(product));
//
// queueNotification(1, "Welcome!", "Hello World", "high");
//
// fetchUserProfile(42).then(profile => {
//   console.log(formatProfile(profile));
// });
//
// const client = createHttpClient("https://api.example.com", 3000);
// console.log(client.get("/users"));

console.log("Exercise 04 geladen. Ersetze die TODOs!");
