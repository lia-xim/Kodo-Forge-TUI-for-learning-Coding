// Lösung 01: Brand-Typen definieren
// =================================

type Brand<T, B extends string> = T & { readonly __brand: B };

// Lösung 1: Brand-Typen
type UserId     = Brand<string, 'UserId'>;
type ProductId  = Brand<string, 'ProductId'>;
type CartId     = Brand<string, 'CartId'>;
type PriceCents = Brand<number, 'PriceCents'>;

// Lösung 2: Smart Constructors

function createUserId(raw: string): UserId {
  if (!raw || raw.trim().length < 5) {
    throw new Error(`Ungültige UserId (min 5 Zeichen): "${raw}"`);
  }
  return raw.trim() as UserId;
}

function createProductId(raw: string): ProductId {
  if (!raw.startsWith('prod-')) {
    throw new Error(`ProductId muss mit 'prod-' beginnen: "${raw}"`);
  }
  return raw as ProductId;
}

function createPriceCents(cents: number): PriceCents {
  if (!Number.isInteger(cents)) {
    throw new Error(`Cents muss Ganzzahl sein: ${cents}`);
  }
  if (cents < 0) {
    throw new Error(`Preis kann nicht negativ sein: ${cents}`);
  }
  return cents as PriceCents;
}

// Lösung 3: Typsichere Funktionen

function addToCart(cartId: CartId, productId: ProductId): void {
  console.log(`Füge Produkt ${productId} zu Cart ${cartId} hinzu`);
}

function checkout(cartId: CartId, totalCents: PriceCents): void {
  console.log(`Checkout: Cart ${cartId}, Total: ${(totalCents / 100).toFixed(2)}€`);
}

// Lösung 4: Tests

const userId    = createUserId('user-001');
const productId = createProductId('prod-abc');
const cartId    = 'cart-001' as CartId;
const price     = createPriceCents(2999);

addToCart(cartId, productId); // "Füge Produkt prod-abc zu Cart cart-001 hinzu"
checkout(cartId, price);       // "Checkout: Cart cart-001, Total: 29.99€"

// Zeige dass Verwechslungen compile-Zeit-Fehler sind:
// addToCart(cartId, userId);   // ❌ UserId ≠ ProductId
// checkout(userId, price);     // ❌ UserId ≠ CartId

// Lösung 5: Generischer Id-Typ
type Id<E extends string> = string & { readonly __idType: E };
type UserId2   = Id<'User'>;
type ProductId2 = Id<'Product'>;

// Beide sind äquivalent zu den oben definierten Typen (andere Struktur, gleiche Idee)
const userId2: UserId2 = 'user-abc' as UserId2;
console.log(`\nGenerischer ID: ${userId2}`);

// Erklärung: Warum Brand<string, 'UserId'> und Id<'User'> NICHT kompatibel sind:
// UserId  = string & { __brand: 'UserId' }
// UserId2 = string & { __idType: 'User' }
// Verschiedene Property-Namen → verschiedene Strukturen → kompatibel!

console.log('\n✅ Lösung 01 erfolgreich!');
