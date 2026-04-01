// Beispiel 05: Opaque Types mit unique symbol und Newtype-Pattern
// ================================================================
// Zeigt: Maximale Kapselung mit unique symbol, generische Newtype-Muster
// Ausfuehren: npx tsx examples/05-opaque-newtype.ts

// ─── Strategie 1: unique symbol (maximale Kapslung) ────────────

// HINWEIS: 'declare const' + 'unique symbol' ist ein Typ-Level-Konstrukt.
// Es existiert nicht zur Laufzeit (Type Erasure). Jede 'declare const'
// mit 'unique symbol' erzeugt einen einzigartigen Typ.

const SESSION_BRAND = Symbol('SessionToken');
const API_KEY_BRAND = Symbol('ApiKey');

// Simulation mit normalen Symbols (für Runtime-Demo):
type SessionToken = string & { readonly __sessionBrand: typeof SESSION_BRAND };
type ApiKey       = string & { readonly __apiBrand: typeof API_KEY_BRAND };

// Factory-Funktionen (die einzige Art valide Werte zu erstellen):
function createSessionToken(value: string): SessionToken {
  if (value.length < 32) {
    throw new Error('Session Token muss mindestens 32 Zeichen haben');
  }
  return value as SessionToken;
}

function createApiKey(value: string): ApiKey {
  if (!value.startsWith('ak_')) {
    throw new Error('API Key muss mit "ak_" beginnen');
  }
  return value as ApiKey;
}

// Verwendung:
function authenticateRequest(token: SessionToken): boolean {
  console.log(`Authentifiziere mit Token: ${token.substring(0, 8)}...`);
  return true;
}

function callInternalApi(key: ApiKey): void {
  console.log(`API-Aufruf mit Key: ${key.substring(0, 8)}...`);
}

const session = createSessionToken('abcdefghijklmnopqrstuvwxyz123456');
const apiKey  = createApiKey('ak_production_key_value_here_1234');

authenticateRequest(session); // ✅
callInternalApi(apiKey);      // ✅

// COMPILE-ERRORS:
// authenticateRequest(apiKey);  // ❌ ApiKey ≠ SessionToken
// callInternalApi(session);     // ❌ SessionToken ≠ ApiKey

// ─── Strategie 2: Generischer Newtype-Helper ───────────────────

// Das universelle Pattern (häufig in TypeScript-Bibliotheken):
declare const phantom: unique symbol;
type Newtype<A, Brand> = A & { readonly [phantom]: Brand };

type Make<Brand, A = string> = Newtype<A, Brand>;

// Verschiedene Typen mit dem gleichen Helfer:
type CustomerId  = Make<'CustomerId'>;
type InvoiceId   = Make<'InvoiceId'>;
type Price       = Make<'Price', number>;    // number-basiert
type Quantity    = Make<'Quantity', number>; // number-basiert

// Generischer Smart Constructor:
function makeId<T extends string>(value: string): Make<T> {
  if (!value || value.length < 3) {
    throw new Error(`Ungültige ID: "${value}"`);
  }
  return value as Make<T>;
}

const customerId = makeId<'CustomerId'>('cust-001');
const invoiceId  = makeId<'InvoiceId'>('inv-001');

console.log(`Customer: ${customerId}`);  // Verhält sich wie string
console.log(`Invoice:  ${invoiceId}`);

// ─── Praxis: Abrechnung ──────────────────────────────────────────

interface Invoice {
  id: InvoiceId;
  customerId: CustomerId;
  priceCents: Price;
  quantity: Quantity;
}

function createInvoice(
  customerId: CustomerId,
  priceCents: Price,
  quantity: Quantity
): Invoice {
  const id: InvoiceId = `inv-${Date.now()}` as InvoiceId;
  return { id, customerId, priceCents, quantity };
}

const myPrice    = 9999 as Price;    // 99,99 EUR in Cents
const myQuantity = 3 as Quantity;     // 3 Stück
const cId        = makeId<'CustomerId'>('cust-abc');

const invoice = createInvoice(cId, myPrice, myQuantity);
console.log(`\nRechnung für Customer: ${invoice.customerId}`);
console.log(`Preis: ${invoice.priceCents / 100}€ × ${invoice.quantity} = ${
  (invoice.priceCents * invoice.quantity) / 100
}€`);

// Brands verhalten sich arithmetisch wie number:
const totalCents = invoice.priceCents * invoice.quantity;
// ^ number (Ergebnis der Multiplikation ist nicht mehr gebrandeted — korrekt!)
console.log(`Total in Cents: ${totalCents}`);

console.log("\n✅ Alle Opaque/Newtype-Beispiele erfolgreich!");
