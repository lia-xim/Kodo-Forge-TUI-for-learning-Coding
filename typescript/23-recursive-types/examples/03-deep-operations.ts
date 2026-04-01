/**
 * Example 03: Deep-Operationen — DeepPartial, DeepReadonly, etc.
 *
 * Ausfuehren: npx tsx examples/03-deep-operations.ts
 */

// ─── Testtyp ─────────────────────────────────────────────────────────────────

type AppState = {
  user: {
    profile: { name: string; email: string; age: number };
    preferences: { theme: "light" | "dark"; language: string };
  };
  cart: {
    items: { id: string; name: string; price: number; quantity: number }[];
    total: number;
  };
};

// ─── DeepPartial ─────────────────────────────────────────────────────────────

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

// Partielles Update — nur die Felder aendern die noetig sind:
const stateUpdate: DeepPartial<AppState> = {
  user: {
    preferences: {
      theme: "dark",
      // language muss NICHT angegeben werden!
    },
    // profile muss NICHT angegeben werden!
  },
  // cart muss NICHT angegeben werden!
};

console.log("Partielles Update:", JSON.stringify(stateUpdate, null, 2));

// ─── DeepReadonly ────────────────────────────────────────────────────────────

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[K] extends object
      ? DeepReadonly<T[K]>
      : T[K];
};

const immutableState: DeepReadonly<AppState> = {
  user: {
    profile: { name: "Max", email: "max@example.com", age: 30 },
    preferences: { theme: "light", language: "de" },
  },
  cart: {
    items: [{ id: "1", name: "TypeScript Buch", price: 39.99, quantity: 1 }],
    total: 39.99,
  },
};

// Alle diese Zeilen wuerden Compile-Errors geben:
// immutableState.user.profile.name = "Anna";        // Error! readonly
// immutableState.cart.total = 0;                      // Error! readonly
// immutableState.cart.items.push({ ... });            // Error! readonly array
// immutableState.cart.items[0].quantity = 2;          // Error! readonly

console.log("Immutable State:", JSON.stringify(immutableState, null, 2));

// ─── DeepRequired ────────────────────────────────────────────────────────────

type OptionalConfig = {
  server?: {
    host?: string;
    port?: number;
    tls?: { cert?: string; key?: string };
  };
  logging?: { level?: string };
};

type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends (infer U)[] | undefined
    ? DeepRequired<U>[]
    : T[K] extends object | undefined
      ? DeepRequired<NonNullable<T[K]>>
      : NonNullable<T[K]>;
};

// Alle Felder sind jetzt Pflicht:
const fullConfig: DeepRequired<OptionalConfig> = {
  server: {
    host: "localhost",
    port: 443,
    tls: { cert: "/path/to/cert", key: "/path/to/key" },
  },
  logging: { level: "info" },
};

console.log("\nRequired Config:", JSON.stringify(fullConfig, null, 2));

// ─── Deep Merge (Utility) ───────────────────────────────────────────────────

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: DeepPartial<T>
): T {
  const result = { ...target } as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    const sourceVal = (source as Record<string, unknown>)[key];
    const targetVal = result[key];
    if (
      sourceVal !== null &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as DeepPartial<Record<string, unknown>>
      );
    } else {
      result[key] = sourceVal;
    }
  }
  return result as T;
}

const baseState: AppState = {
  user: {
    profile: { name: "Max", email: "max@example.com", age: 30 },
    preferences: { theme: "light", language: "de" },
  },
  cart: { items: [], total: 0 },
};

const merged = deepMerge(baseState, stateUpdate);
console.log("\nMerged State:", JSON.stringify(merged, null, 2));
// → user.preferences.theme ist jetzt "dark", Rest unveraendert
