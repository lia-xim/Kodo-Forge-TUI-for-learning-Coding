/**
 * Exercise 03: DeepPartial — Rekursive Utility Types
 *
 * Implementiere DeepPartial und eine deepMerge-Funktion.
 *
 * Ausfuehren: npx tsx exercises/03-deep-partial.ts
 * Hints: Siehe hints.json "exercises/03-deep-partial.ts"
 */

// TODO 1: Implementiere DeepPartial<T>
// Alle Properties auf ALLEN Ebenen sollen optional werden.
// Beachte: Arrays sollen Arrays bleiben, nicht aufgeloest werden!
type DeepPartial<T> = unknown; // ← Ersetze unknown

// TODO 2: Implementiere DeepReadonly<T>
// Alle Properties auf ALLEN Ebenen sollen readonly werden.
// Arrays sollen zu readonly Arrays werden.
type DeepReadonly<T> = unknown; // ← Ersetze unknown

// Test-Typ:
type AppConfig = {
  server: {
    host: string;
    port: number;
    tls: { enabled: boolean; cert: string };
  };
  database: {
    url: string;
    pool: { min: number; max: number };
  };
  features: string[];
};

// TODO 3: Erstelle ein partielles Config-Update
// Nur server.port und database.pool.max sollen gesetzt werden
const configUpdate: DeepPartial<AppConfig> = {
  // TODO: Fulle die Felder
};

// TODO 4: Implementiere eine deepMerge-Funktion
function deepMerge<T extends Record<string, unknown>>(
  base: T,
  update: DeepPartial<T>
): T {
  // TODO: Implementiere rekursives Merging
  return base;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const baseConfig: AppConfig = {
  server: {
    host: "localhost",
    port: 3000,
    tls: { enabled: false, cert: "" },
  },
  database: {
    url: "postgres://localhost/dev",
    pool: { min: 1, max: 5 },
  },
  features: ["auth"],
};

console.log("=== DeepPartial Tests ===");

const merged = deepMerge(baseConfig, configUpdate);
console.log("Merged port:", merged.server.port);
// Erwartet: neuer Wert aus configUpdate

console.log("Merged host:", merged.server.host);
// Erwartet: "localhost" (unveraendert)

// DeepReadonly Test:
const frozen: DeepReadonly<AppConfig> = baseConfig;
// Die folgenden Zeilen sollten Compile-Errors geben (auskommentiert):
// frozen.server.port = 8080;
// frozen.features.push("new");
// frozen.database.pool.max = 20;

console.log("DeepReadonly funktioniert:", frozen.server.host);
