// Beispiel 04: Angular/React Pattern-Simulation (ohne Framework-Dependencies)
// ==========================================================================
// Zeigt: Anti-Corruption Layer, Service-Muster, ID-System
// Ausfuehren: npx tsx examples/04-angular-react.ts

type Brand<T, B extends string> = T & { readonly __brand: B };
type Id<Entity extends string> = string & { readonly __idType: Entity };

// ─── Domain Typen ───────────────────────────────────────────────

type UserId    = Id<'User'>;
type ProductId = Id<'Product'>;
type OrderId   = Id<'Order'>;
type Email     = Brand<string, 'Email'>;

// Smart Constructors:
function createUserId(raw: string): UserId {
  if (!raw || raw.length < 5) throw new Error(`Ungültige UserId: "${raw}"`);
  return raw as UserId;
}

function createProductId(raw: string): ProductId {
  if (!raw || raw.length < 5) throw new Error(`Ungültige ProductId: "${raw}"`);
  return raw as ProductId;
}

function createEmail(raw: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(raw.trim())) throw new Error(`Ungültige E-Mail: "${raw}"`);
  return raw.trim().toLowerCase() as Email;
}

// ─── Domain Entities ──────────────────────────────────────────

interface User {
  id: UserId;
  email: Email;
  name: string;
}

interface Product {
  id: ProductId;
  name: string;
  priceCents: number;
}

interface Order {
  id: OrderId;
  userId: UserId;
  productIds: ProductId[];
  totalCents: number;
}

// ─── Raw API Response Typen (kein Brand!) ────────────────────

interface RawUserResponse {
  id: string;
  email: string;
  name: string;
}

interface RawProductResponse {
  id: string;
  name: string;
  price_cents: number;  // Snake case von API
}

// ─── Anti-Corruption Layer (Mapper) ─────────────────────────

function mapUser(raw: RawUserResponse): User {
  return {
    id: createUserId(raw.id),       // string → UserId ✅
    email: createEmail(raw.email),  // string → Email (validiert) ✅
    name: raw.name,
  };
}

function mapProduct(raw: RawProductResponse): Product {
  return {
    id: createProductId(raw.id),
    name: raw.name,
    priceCents: raw.price_cents,
  };
}

// ─── Service-Simulation (Angular-Stil) ──────────────────────

class UserService {
  private db: Map<string, User> = new Map();

  // Akzeptiert nur UserId — nicht OrderId oder plain string!
  getUser(id: UserId): User | undefined {
    return this.db.get(id as string);
  }

  deleteUser(id: UserId): boolean {
    return this.db.delete(id as string);
  }

  // Gibt User-Objekt zurück (bereits mit Brands):
  createUser(rawData: RawUserResponse): User {
    const user = mapUser(rawData); // Anti-Corruption Layer
    this.db.set(user.id as string, user);
    return user;
  }
}

class ProductService {
  private db: Map<string, Product> = new Map();

  getProduct(id: ProductId): Product | undefined {
    return this.db.get(id as string);
  }

  createProduct(rawData: RawProductResponse): Product {
    const product = mapProduct(rawData);
    this.db.set(product.id as string, product);
    return product;
  }
}

// ─── Anwendung ──────────────────────────────────────────────

const userService    = new UserService();
const productService = new ProductService();

// Entities erstellen (aus "API-Daten"):
const user = userService.createUser({
  id: "user-001",
  email: "max@example.com",
  name: "Max Mustermann"
});

const product = productService.createProduct({
  id: "prod-001",
  name: "TypeScript Buch",
  price_cents: 3999
});

console.log(`User: ${user.name} (${user.email})`);
console.log(`Product: ${product.name} (${product.priceCents / 100}€)`);

// Typsichere Lookups:
const foundUser = userService.getUser(user.id);   // ✅ UserId
console.log(`Gefunden: ${foundUser?.name}`);

// COMPILE-ERRORS (einkommentieren zum Testen):
// userService.getUser(product.id);   // ❌ ProductId ≠ UserId
// userService.deleteUser("user-001"); // ❌ string ≠ UserId

// user.id verhält sich wie string:
console.log(`\nUser-ID als string: ${user.id}`);     // Template Literal
console.log(`Länge: ${user.id.length}`);              // string-Method
console.log(`Startet mit user-: ${user.id.startsWith('user-')}`);

console.log("\n✅ Angular/React-Pattern erfolgreich!");
