/**
 * Solution 03: DeepPartial — Rekursive Utility Types
 */

// Loesung 1: DeepPartial mit Array-Behandlung
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

// Loesung 2: DeepReadonly mit readonly Arrays
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[K] extends object
      ? DeepReadonly<T[K]>
      : T[K];
};

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

// Loesung 3: Partielles Config-Update
const configUpdate: DeepPartial<AppConfig> = {
  server: {
    port: 8080,
  },
  database: {
    pool: {
      max: 20,
    },
  },
};

// Loesung 4: deepMerge-Funktion
function deepMerge<T extends Record<string, unknown>>(
  base: T,
  update: DeepPartial<T>
): T {
  const result = { ...base } as Record<string, unknown>;

  for (const key of Object.keys(update)) {
    const updateVal = (update as Record<string, unknown>)[key];
    const baseVal = result[key];

    if (
      updateVal !== null &&
      updateVal !== undefined &&
      typeof updateVal === "object" &&
      !Array.isArray(updateVal) &&
      baseVal !== null &&
      baseVal !== undefined &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        updateVal as DeepPartial<Record<string, unknown>>
      );
    } else if (updateVal !== undefined) {
      result[key] = updateVal;
    }
  }

  return result as T;
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
console.log("Merged port:", merged.server.port);       // 8080
console.log("Merged host:", merged.server.host);       // "localhost" (unveraendert)
console.log("Merged pool max:", merged.database.pool.max); // 20
console.log("Merged pool min:", merged.database.pool.min); // 1 (unveraendert)

const frozen: DeepReadonly<AppConfig> = baseConfig;
// frozen.server.port = 8080;     // Error! readonly
// frozen.features.push("new");   // Error! readonly array
console.log("DeepReadonly funktioniert:", frozen.server.host);
