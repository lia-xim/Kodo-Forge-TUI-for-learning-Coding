/**
 * Lektion 15 - Solution 01: Partial, Required, Readonly
 *
 * Ausfuehren mit: npx tsx solutions/01-partial-required-readonly.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Partial fuer Update-Funktion
// ═══════════════════════════════════════════════════════════════════════════

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
}

// Loesung: Partial<Product> macht alle Felder optional
function updateProduct(id: number, changes: Partial<Product>): Product {
  const existing: Product = {
    id,
    name: "Default Product",
    price: 0,
    description: "No description",
    inStock: true,
  };
  return { ...existing, ...changes };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Required fuer validierte Daten
// ═══════════════════════════════════════════════════════════════════════════

interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "date" | "price";
  order?: "asc" | "desc";
}

// Loesung: Required macht alle optionalen Felder zu Pflichtfeldern
type ResolvedSearchParams = Required<SearchParams>;

function resolveParams(params: SearchParams): ResolvedSearchParams {
  return {
    query: params.query ?? "",
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sortBy: params.sortBy ?? "name",
    order: params.order ?? "asc",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Readonly fuer Funktionsparameter
// ═══════════════════════════════════════════════════════════════════════════

interface ShoppingCart {
  items: { name: string; price: number }[];
  total: number;
  discount: number;
}

// Loesung: Readonly<ShoppingCart> verhindert Aenderungen am Parameter
function calculateTotal(cart: Readonly<ShoppingCart>): number {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
  return subtotal - cart.discount;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Partial fuer Merge-Funktion
// ═══════════════════════════════════════════════════════════════════════════

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  fontFamily: string;
  borderRadius: number;
}

// Loesung: Partial<Theme> als Override
function mergeThemes(base: Theme, overrides: Partial<Theme>): Theme {
  return { ...base, ...overrides };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Readonly + Required kombiniert
// ═══════════════════════════════════════════════════════════════════════════

interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  ssl?: boolean;
}

// Loesung: Required + Readonly verschachtelt
type FinalDatabaseConfig = Readonly<Required<DatabaseConfig>>;

function finalizeDatabaseConfig(config: DatabaseConfig): FinalDatabaseConfig {
  return {
    host: config.host ?? "localhost",
    port: config.port ?? 5432,
    database: config.database ?? "mydb",
    ssl: config.ssl ?? false,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Shallow vs Deep Readonly
// ═══════════════════════════════════════════════════════════════════════════

interface AppState {
  user: {
    name: string;
    preferences: {
      theme: "light" | "dark";
      notifications: boolean;
    };
  };
  items: string[];
}

type ReadonlyState = Readonly<AppState>;

// Antwort 1: Nein — state.user ist readonly (erste Ebene)
// Antwort 2: Ja — state.user.name ist NICHT readonly (zweite Ebene, shallow!)
// Antwort 3: Nein — state.items ist readonly (erste Ebene)
// Antwort 4: Ja — state.items.push() funktioniert weil das Array
//            selbst nicht readonly ist (nur die Referenz ist readonly)

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");
const updated = updateProduct(1, { price: 29.99 });
console.log("Updated product:", updated);

const resolved = resolveParams({ query: "typescript", page: 3 });
console.log("Resolved params:", resolved);

const cart: ShoppingCart = {
  items: [{ name: "Book", price: 20 }, { name: "Pen", price: 5 }],
  total: 0,
  discount: 3,
};
console.log("Cart total:", calculateTotal(cart));

const defaultTheme: Theme = {
  primaryColor: "#007bff",
  secondaryColor: "#6c757d",
  fontSize: 16,
  fontFamily: "Arial",
  borderRadius: 4,
};
const merged = mergeThemes(defaultTheme, { fontSize: 18, borderRadius: 8 });
console.log("Merged theme:", merged);

const finalDb = finalizeDatabaseConfig({ host: "db.example.com", port: 5432 });
console.log("Final DB config:", finalDb);

console.log("\n--- Alle Tests bestanden! ---");
