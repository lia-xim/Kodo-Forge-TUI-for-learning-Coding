/**
 * Lektion 15 - Exercise 01: Partial, Required, Readonly
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-partial-required-readonly.ts
 *
 * 6 Aufgaben zu den drei Modifier-Utility-Types.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
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

// TODO: Erstelle eine Funktion "updateProduct" die eine id und ein
// Partial-Update-Objekt nimmt. Die Funktion soll ein vollstaendiges
// Product zurueckgeben (bestehend + changes gemerged).
// function updateProduct(id: number, changes: ???): Product { ... }

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

// TODO: Erstelle einen Typ "ResolvedSearchParams" der alle Felder required macht
// type ResolvedSearchParams = ...

// TODO: Erstelle eine Funktion "resolveParams" die SearchParams nimmt
// und ResolvedSearchParams zurueckgibt (mit Default-Werten).
// Defaults: query="", page=1, limit=20, sortBy="name", order="asc"
// function resolveParams(params: SearchParams): ResolvedSearchParams { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Readonly fuer Funktionsparameter
// ═══════════════════════════════════════════════════════════════════════════

interface ShoppingCart {
  items: { name: string; price: number }[];
  total: number;
  discount: number;
}

// TODO: Erstelle eine Funktion "calculateTotal" die einen Readonly-Cart nimmt
// und die Summe berechnet (items + discount beruecksichtigen).
// Die Funktion soll den Cart NICHT veraendern koennen!
// function calculateTotal(cart: ???): number { ... }

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

// TODO: Erstelle eine Funktion "mergeThemes" die einen Default-Theme
// und ein Partial-Override nimmt und den gemergten Theme zurueckgibt.
// function mergeThemes(base: Theme, overrides: ???): Theme { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Readonly + Required kombiniert
// ═══════════════════════════════════════════════════════════════════════════

interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  ssl?: boolean;
}

// TODO: Erstelle einen Typ "FinalDatabaseConfig" der:
// 1. Alle Felder required macht (keine optionalen mehr)
// 2. Alle Felder readonly macht (keine Aenderungen mehr)
// type FinalDatabaseConfig = ...

// TODO: Erstelle eine Funktion die DatabaseConfig -> FinalDatabaseConfig konvertiert
// function finalizeDatabaseConfig(config: DatabaseConfig): FinalDatabaseConfig { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Shallow vs Deep Readonly verstehen
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

// TODO: Erstelle den Typ ReadonlyState = Readonly<AppState>
// Dann beantworte (als Kommentar):
// 1. Kann man state.user neu zuweisen? (ja/nein)
// 2. Kann man state.user.name aendern? (ja/nein)
// 3. Kann man state.items neu zuweisen? (ja/nein)
// 4. Kann man state.items.push("new") aufrufen? (ja/nein)

// type ReadonlyState = ...
// Antwort 1: ???
// Antwort 2: ???
// Antwort 3: ???
// Antwort 4: ???

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// const updated = updateProduct(1, { price: 29.99 });
// console.log("Updated product:", updated);
//
// const resolved = resolveParams({ query: "typescript", page: 3 });
// console.log("Resolved params:", resolved);
//
// const cart: ShoppingCart = {
//   items: [{ name: "Book", price: 20 }, { name: "Pen", price: 5 }],
//   total: 0,
//   discount: 3,
// };
// console.log("Cart total:", calculateTotal(cart));
//
// const defaultTheme: Theme = {
//   primaryColor: "#007bff",
//   secondaryColor: "#6c757d",
//   fontSize: 16,
//   fontFamily: "Arial",
//   borderRadius: 4,
// };
// const merged = mergeThemes(defaultTheme, { fontSize: 18, borderRadius: 8 });
// console.log("Merged theme:", merged);
//
// const finalDb = finalizeDatabaseConfig({ host: "db.example.com", port: 5432 });
// console.log("Final DB config:", finalDb);

console.log("Exercise 01 geladen. Ersetze die TODOs!");
