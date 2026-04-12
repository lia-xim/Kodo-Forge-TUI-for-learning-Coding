export {};

/**
 * Lektion 10 - Exercise 01: E-Commerce Datenmodell
 *
 * INTEGRATIONS-CHALLENGE: Baue ein komplettes Typsystem fuer einen Online-Shop.
 *
 * Konzepte die du brauchst:
 * - Interfaces & Type Aliases (L05, L08)
 * - Optional & Readonly Properties (L05)
 * - Union Types & Discriminated Unions (L07)
 * - Literal Types & as const (L09)
 * - Arrays & Tuples (L04)
 * - Intersection Types (L07)
 *
 * Ausfuehren: npx tsx exercises/01-data-model.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Basis-Typen definieren
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle die folgenden Basistypen:
//
// a) ProductCategory — Union von Literal Types:
//    "electronics" | "clothing" | "books" | "food" | "toys"
//
// b) Currency — "EUR" | "USD" | "GBP"
//
// c) Money — Interface mit:
//    - amount: number
//    - currency: Currency
//
// d) HasId — Interface mit readonly id: string
//
// e) HasTimestamps — Interface mit:
//    - readonly createdAt: Date
//    - updatedAt: Date

// TODO: Erstelle die Basistypen hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Product Types mit Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle verschiedene Produkttypen als Discriminated Union.
// Gemeinsamer Discriminator: "type" (Literal Type)
//
// BaseProduct (Interface, extends HasId & HasTimestamps):
//   - name: string
//   - description: string
//   - price: Money
//   - category: ProductCategory
//   - inStock: boolean
//   - tags: readonly string[]
//   - imageUrl?: string  (optional)
//
// PhysicalProduct (extends BaseProduct):
//   - type: "physical"
//   - weight: number (in kg)
//   - dimensions: { width: number; height: number; depth: number }
//   - shippingClass: "standard" | "express" | "freight"
//
// DigitalProduct (extends BaseProduct):
//   - type: "digital"
//   - downloadUrl: string
//   - fileSizeInMB: number
//   - format: "pdf" | "epub" | "mp3" | "mp4" | "zip"
//
// SubscriptionProduct (extends BaseProduct):
//   - type: "subscription"
//   - interval: "monthly" | "yearly"
//   - trialDays: number
//   - cancelable: boolean
//
// Product = PhysicalProduct | DigitalProduct | SubscriptionProduct

// TODO: Erstelle die Produkttypen hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 3: User & Address
// ═══════════════════════════════════════════════════════════════════════════════
//
// Address Interface:
//   - street: string
//   - city: string
//   - zipCode: string
//   - country: string
//   - isDefault: boolean
//
// User Interface (extends HasId & HasTimestamps):
//   - email: string
//   - name: { first: string; last: string }  (verschachteltes Objekt)
//   - addresses: Address[]  (mindestens eine, aber TypeScript kann das nicht erzwingen)
//   - phone?: string  (optional)
//   - loyaltyPoints: number
//   - memberSince: Date
//   - preferredCurrency: Currency

// TODO: Erstelle User und Address hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Cart (Warenkorb)
// ═══════════════════════════════════════════════════════════════════════════════
//
// CartItem Interface:
//   - readonly product: Product
//   - quantity: number
//   - addedAt: Date
//
// Cart Interface (extends HasId):
//   - readonly userId: string
//   - items: CartItem[]
//   - couponCode?: string (optional)
//   - notes?: string (optional)

// TODO: Erstelle CartItem und Cart hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Order als Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════════
//
// Bestellstatus als Discriminated Union (Discriminator: "status"):
//
// PendingOrder:
//   - status: "pending"
//   - items: readonly CartItem[]
//   - total: Money
//
// PaidOrder:
//   - status: "paid"
//   - items: readonly CartItem[]
//   - total: Money
//   - paidAt: Date
//   - paymentMethod: "credit_card" | "paypal" | "bank_transfer"
//   - transactionId: string
//
// ShippedOrder:
//   - status: "shipped"
//   - items: readonly CartItem[]
//   - total: Money
//   - paidAt: Date
//   - shippedAt: Date
//   - trackingNumber: string
//   - carrier: "dhl" | "ups" | "dpd" | "hermes"
//
// DeliveredOrder:
//   - status: "delivered"
//   - items: readonly CartItem[]
//   - total: Money
//   - deliveredAt: Date
//
// CancelledOrder:
//   - status: "cancelled"
//   - items: readonly CartItem[]
//   - total: Money
//   - cancelledAt: Date
//   - reason: string
//   - refunded: boolean
//
// Alle Order-Typen sollen auch HasId & HasTimestamps & { userId: string } haben.
//
// Order = PendingOrder | PaidOrder | ShippedOrder | DeliveredOrder | CancelledOrder

// TODO: Erstelle die Order-Typen hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Hilfsfunktionen (Typ-sicher!)
// ═══════════════════════════════════════════════════════════════════════════════
//
// a) calculateCartTotal(cart: Cart): Money
//    — Summiert alle (product.price.amount * quantity)
//    — Nimmt die Currency vom ersten Item (oder EUR als Default)
//
// b) getOrderStatusMessage(order: Order): string
//    — Exhaustive switch ueber order.status
//    — Gibt fuer jeden Status eine passende Nachricht zurueck
//    — Nutzt den never-Trick fuer Exhaustive Checking
//
// c) getShippingInfo(product: Product): string
//    — Fuer "physical": Gewicht und Versandklasse
//    — Fuer "digital": "Digitaler Download"
//    — Fuer "subscription": "Kein Versand — Abo-Produkt"
//    — Exhaustive Check!
//
// d) formatUserName(user: User): string
//    — Gibt "Vorname Nachname" zurueck

// TODO: Implementiere die Funktionen hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 7: Konstanten mit as const
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle eine ORDER_TRANSITIONS-Konstante mit as const, die beschreibt,
// welche Statusuebergaenge erlaubt sind:
//
// const ORDER_TRANSITIONS = {
//   pending: ["paid", "cancelled"],
//   paid: ["shipped", "cancelled"],
//   shipped: ["delivered"],
//   delivered: [],
//   cancelled: [],
// } as const;
//
// Leite dann den Typ ValidTransition ab, der alle erlaubten
// [VonStatus, NachStatus]-Paare als Tuple-Union darstellt.
// Tipp: Das ist knifflig! Du brauchst typeof und Indexing.

// TODO: Erstelle ORDER_TRANSITIONS und ValidTransition hier

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese, wenn du fertig bist!
// ═══════════════════════════════════════════════════════════════════════════════

/*
// Test: Produkt erstellen
const laptop: PhysicalProduct = {
  id: "prod-001",
  type: "physical",
  name: "Gaming Laptop",
  description: "Leistungsstarker Gaming-Laptop",
  price: { amount: 1299.99, currency: "EUR" },
  category: "electronics",
  inStock: true,
  tags: ["gaming", "laptop", "electronics"],
  weight: 2.5,
  dimensions: { width: 35, height: 2.5, depth: 25 },
  shippingClass: "standard",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ebook: DigitalProduct = {
  id: "prod-002",
  type: "digital",
  name: "TypeScript Mastery",
  description: "Lerne TypeScript von Grund auf",
  price: { amount: 29.99, currency: "EUR" },
  category: "books",
  inStock: true,
  tags: ["typescript", "programming"],
  downloadUrl: "https://example.com/download/ts-mastery",
  fileSizeInMB: 15,
  format: "pdf",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test: User erstellen
const testUser: User = {
  id: "user-001",
  email: "max@test.de",
  name: { first: "Max", last: "Mustermann" },
  addresses: [{
    street: "Hauptstrasse 1",
    city: "Berlin",
    zipCode: "10115",
    country: "DE",
    isDefault: true,
  }],
  loyaltyPoints: 500,
  memberSince: new Date("2024-01-01"),
  preferredCurrency: "EUR",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date(),
};

// Test: Cart erstellen
const testCart: Cart = {
  id: "cart-001",
  userId: "user-001",
  items: [
    { product: laptop, quantity: 1, addedAt: new Date() },
    { product: ebook, quantity: 2, addedAt: new Date() },
  ],
};

// Test: Funktionen
const total = calculateCartTotal(testCart);
console.log(`Warenkorb-Total: ${total.amount} ${total.currency}`);
console.assert(total.amount === 1359.97, `Erwartet 1359.97, bekommen ${total.amount}`);

console.log(`Shipping (Laptop): ${getShippingInfo(laptop)}`);
console.log(`Shipping (eBook): ${getShippingInfo(ebook)}`);
console.log(`User: ${formatUserName(testUser)}`);

const pendingOrder: PendingOrder = {
  id: "order-001",
  userId: "user-001",
  status: "pending",
  items: testCart.items,
  total,
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log(`Order Status: ${getOrderStatusMessage(pendingOrder)}`);

console.log("\nAlle Tests bestanden!");
*/
