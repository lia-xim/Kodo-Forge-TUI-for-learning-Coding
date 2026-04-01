// Exercise 01: Brand-Typen definieren
// ====================================
// Ziel: Erstelle typsichere Brands für ein E-Commerce-System
// Öffne die Lösung ERST nachdem du 10 Minuten selbst probiert hast!

type Brand<T, B extends string> = T & { readonly __brand: B };

// TODO 1: Definiere folgende Brand-Typen:
//   - UserId (string & Brand 'UserId')
//   - ProductId (string & Brand 'ProductId')
//   - CartId (string & Brand 'CartId')
//   - PriceCents (number & Brand 'PriceCents')

// TODO: type UserId    = ...
// TODO: type ProductId = ...
// TODO: type CartId    = ...
// TODO: type PriceCents = ...

// TODO 2: Schreibe Smart Constructors für jeden Typ:
//   - createUserId(raw: string): UserId — validiert: min 5 Zeichen
//   - createProductId(raw: string): ProductId — validiert: beginnt mit 'prod-'
//   - createPriceCents(cents: number): PriceCents — validiert: positiv und Integer

// TODO: function createUserId(raw: string): UserId { ... }
// TODO: function createProductId(raw: string): ProductId { ... }
// TODO: function createPriceCents(cents: number): PriceCents { ... }

// TODO 3: Schreibe diese Funktionen die explizit die Brands erwarten:

// TODO: function addToCart(cartId: CartId, productId: ProductId): void {
//   console.log(`Füge ${productId} zu Cart ${cartId} hinzu`);
// }

// TODO: function checkout(cartId: CartId, totalCents: PriceCents): void {
//   console.log(`Checkout: Cart ${cartId}, Total: ${totalCents / 100}€`);
// }

// TODO 4: Teste deine Implementierung:
// const userId = createUserId('user-001');
// const productId = createProductId('prod-abc');
// const cartId = 'cart-001' as CartId;  // direkter Cast nur für Tests
// const price = createPriceCents(2999);
//
// addToCart(cartId, productId);   // ✅ soll funktionieren
// checkout(cartId, price);         // ✅ soll funktionieren
// addToCart(cartId, userId);       // ❌ soll COMPILE-ERROR sein

// TODO 5 (Bonus): Erstelle einen generischen Id<Entity>-Typ:
// type Id<E extends string> = string & { readonly __idType: E };
// type UserId2 = Id<'User'>;  // Äquivalent zu UserId

export {};
