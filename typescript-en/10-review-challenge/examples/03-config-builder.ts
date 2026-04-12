export {};

/**
 * Lektion 10 - Beispiel 03: Config Builder Pattern
 *
 * Ein Konfigurationssystem das zeigt, wie as const, Literal Types
 * und Function Overloads zusammenspielen.
 *
 * Verwendete Konzepte:
 * - as const & Literal Types (L09)
 * - Function Overloads (L06)
 * - Interfaces mit readonly (L05)
 * - Union Types (L07)
 * - Type Aliases (L08)
 * - Tuples (L04)
 * - Type Narrowing mit typeof (L07)
 *
 * Ausfuehren: npx tsx examples/03-config-builder.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. KONFIGURATION MIT as const — Maximale Praezision
// ═══════════════════════════════════════════════════════════════════════════════

// Ohne as const: Typen werden "widened"
const configLoose = {
  environment: "production",
  port: 3000,
  features: ["auth", "logging"],
};
// Typ: { environment: string; port: number; features: string[] }
// Problem: environment akzeptiert JEDEN string, nicht nur "production"

// Mit as const: Literal Types bleiben erhalten
const configStrict = {
  environment: "production",
  port: 3000,
  features: ["auth", "logging"],
  database: {
    host: "localhost",
    port: 5432,
    ssl: true,
  },
  cors: {
    origins: ["https://app.example.com", "https://admin.example.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
} as const;

// Typ ist jetzt ULTRA-praezise:
// {
//   readonly environment: "production";
//   readonly port: 3000;
//   readonly features: readonly ["auth", "logging"];
//   readonly database: { readonly host: "localhost"; ... };
//   ...
// }

// Typen aus der Config ableiten (L09: typeof + as const)
type Environment = typeof configStrict.environment; // "production"
type Feature = (typeof configStrict.features)[number]; // "auth" | "logging"
type HttpMethod = (typeof configStrict.cors.methods)[number]; // "GET" | "POST" | "PUT" | "DELETE"
type AllowedOrigin = (typeof configStrict.cors.origins)[number];

console.log("=== as const Config ===");
console.log(`Environment: ${configStrict.environment}`);
console.log(`Features: ${configStrict.features.join(", ")}`);
console.log(`DB Port: ${configStrict.database.port}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ENVIRONMENT-SPEZIFISCHE CONFIGS — Discriminated Union (L07)
// ═══════════════════════════════════════════════════════════════════════════════

interface BaseConfig {
  readonly appName: string;
  readonly version: string;
  readonly logLevel: "debug" | "info" | "warn" | "error";
}

interface DevConfig extends BaseConfig {
  readonly env: "development";
  readonly debug: true;
  readonly hotReload: true;
  readonly mockApi: boolean;
}

interface StagingConfig extends BaseConfig {
  readonly env: "staging";
  readonly debug: false;
  readonly apiUrl: string;
  readonly testUsers: readonly string[];
}

interface ProdConfig extends BaseConfig {
  readonly env: "production";
  readonly debug: false;
  readonly apiUrl: string;
  readonly cdn: string;
  readonly sentryDsn: string;
}

// Discriminated Union auf dem "env" Feld
type AppConfig = DevConfig | StagingConfig | ProdConfig;

// Exhaustive Handler (L09)
function getApiBaseUrl(config: AppConfig): string {
  switch (config.env) {
    case "development":
      return config.mockApi
        ? "http://localhost:3001/mock"
        : "http://localhost:3000/api";
    case "staging":
      return config.apiUrl;
    case "production":
      return config.apiUrl;
    default: {
      const _: never = config;
      return _;
    }
  }
}

const devConfig: DevConfig = {
  appName: "MyApp",
  version: "1.0.0",
  logLevel: "debug",
  env: "development",
  debug: true,
  hotReload: true,
  mockApi: true,
};

console.log("\n=== Environment-spezifische Config ===");
console.log(`API URL (dev): ${getApiBaseUrl(devConfig)}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CONFIG BUILDER — Function Overloads (L06)
// ═══════════════════════════════════════════════════════════════════════════════

// Verschiedene Config-Abschnitte
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  ssl: boolean;
  poolSize?: number;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: "lru" | "fifo" | "lfu";
}

interface AuthConfig {
  provider: "jwt" | "session" | "oauth";
  secret: string;
  expiresIn: number;
  refreshEnabled: boolean;
}

// Config-Schluessel als Literal Types (L09)
type ConfigSection = "database" | "cache" | "auth";

// Config-Map: Welcher Schluessel gehoert zu welchem Typ
interface ConfigMap {
  database: DatabaseConfig;
  cache: CacheConfig;
  auth: AuthConfig;
}

// Function Overloads: get() gibt den GENAUEN Typ zurueck (L06)
function getConfig(section: "database"): DatabaseConfig;
function getConfig(section: "cache"): CacheConfig;
function getConfig(section: "auth"): AuthConfig;
function getConfig(section: ConfigSection): DatabaseConfig | CacheConfig | AuthConfig {
  const configs: ConfigMap = {
    database: {
      host: "localhost",
      port: 5432,
      database: "myapp",
      ssl: false,
      poolSize: 10,
    },
    cache: {
      enabled: true,
      ttl: 3600,
      maxSize: 1000,
      strategy: "lru",
    },
    auth: {
      provider: "jwt",
      secret: "super-secret-key",
      expiresIn: 86400,
      refreshEnabled: true,
    },
  };

  return configs[section];
}

console.log("\n=== Config Builder mit Overloads ===");

// Dank Overloads: TypeScript weiss den exakten Return Type!
const dbConfig = getConfig("database"); // Typ: DatabaseConfig
const cacheConfig = getConfig("cache"); // Typ: CacheConfig
const authConfig = getConfig("auth"); // Typ: AuthConfig

console.log(`DB: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
console.log(`Cache: ${cacheConfig.strategy}, TTL: ${cacheConfig.ttl}s`);
console.log(`Auth: ${authConfig.provider}, Expires: ${authConfig.expiresIn}s`);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. VALIDATION MIT LITERAL TYPES — Typsichere Defaults
// ═══════════════════════════════════════════════════════════════════════════════

// Default-Werte als as const (L09)
const DEFAULT_DATABASE: Readonly<DatabaseConfig> = {
  host: "localhost",
  port: 5432,
  database: "app",
  ssl: false,
  poolSize: 5,
};

const DEFAULT_CACHE: Readonly<CacheConfig> = {
  enabled: false,
  ttl: 300,
  maxSize: 100,
  strategy: "lru",
};

// Merge-Funktion: Partielle Config mit Defaults zusammenfuehren
// Nutzt Optional Properties (L05) und Spread
function mergeWithDefaults(
  section: "database",
  overrides: Partial<DatabaseConfig>
): DatabaseConfig;
function mergeWithDefaults(
  section: "cache",
  overrides: Partial<CacheConfig>
): CacheConfig;
function mergeWithDefaults(
  section: "database" | "cache",
  overrides: Partial<DatabaseConfig> | Partial<CacheConfig>
): DatabaseConfig | CacheConfig {
  if (section === "database") {
    return { ...DEFAULT_DATABASE, ...(overrides as Partial<DatabaseConfig>) };
  }
  return { ...DEFAULT_CACHE, ...(overrides as Partial<CacheConfig>) };
}

console.log("\n=== Merge mit Defaults ===");

const customDb = mergeWithDefaults("database", {
  host: "db.production.com",
  ssl: true,
  poolSize: 20,
});
console.log(`Custom DB: ${customDb.host}:${customDb.port} (SSL: ${customDb.ssl})`);

const customCache = mergeWithDefaults("cache", {
  enabled: true,
  ttl: 7200,
});
console.log(`Custom Cache: TTL ${customCache.ttl}s, Max: ${customCache.maxSize}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CONFIG VALIDATION — Type Narrowing (L07)
// ═══════════════════════════════════════════════════════════════════════════════

// Validation Result als Discriminated Union
type ValidationResult =
  | { valid: true; config: AppConfig }
  | { valid: false; errors: string[] };

function validateConfig(input: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Type Narrowing mit typeof (L07)
  if (typeof input["appName"] !== "string") {
    errors.push("appName muss ein String sein");
  }

  if (typeof input["version"] !== "string") {
    errors.push("version muss ein String sein");
  }

  const validEnvs = ["development", "staging", "production"];
  if (typeof input["env"] !== "string" || !validEnvs.includes(input["env"])) {
    errors.push(`env muss einer von ${validEnvs.join(", ")} sein`);
  }

  const validLogLevels = ["debug", "info", "warn", "error"];
  if (
    typeof input["logLevel"] !== "string" ||
    !validLogLevels.includes(input["logLevel"])
  ) {
    errors.push(`logLevel muss einer von ${validLogLevels.join(", ")} sein`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Hier wissen wir: Alle Felder sind valide
  return { valid: true, config: input as unknown as AppConfig };
}

console.log("\n=== Config Validation ===");

const result1 = validateConfig({
  appName: "MyApp",
  version: "2.0.0",
  env: "development",
  logLevel: "debug",
  debug: true,
  hotReload: true,
  mockApi: false,
});

if (result1.valid) {
  console.log(`Valide Config: ${result1.config.appName} v${result1.config.version}`);
} else {
  console.log(`Fehler: ${result1.errors.join(", ")}`);
}

const result2 = validateConfig({
  appName: 42,
  env: "testing",
});

if (!result2.valid) {
  console.log(`Erwartete Fehler: ${result2.errors.join("; ")}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. FEATURE FLAGS — as const + Literal Types (L09)
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURE_FLAGS = {
  darkMode: { enabled: true, rolloutPercent: 100 },
  newDashboard: { enabled: true, rolloutPercent: 50 },
  betaApi: { enabled: false, rolloutPercent: 0 },
  exportPdf: { enabled: true, rolloutPercent: 25 },
} as const;

type FeatureFlag = keyof typeof FEATURE_FLAGS;

function isFeatureEnabled(flag: FeatureFlag, userId?: string): boolean {
  const feature = FEATURE_FLAGS[flag];
  if (!feature.enabled) return false;
  if (feature.rolloutPercent === 100) return true;

  // Simpler Hash fuer Rollout-Entscheidung
  if (userId) {
    const hash = userId.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
    return hash % 100 < feature.rolloutPercent;
  }

  return false;
}

console.log("\n=== Feature Flags ===");
console.log(`Dark Mode: ${isFeatureEnabled("darkMode")}`);
console.log(`New Dashboard (user-001): ${isFeatureEnabled("newDashboard", "user-001")}`);
console.log(`Beta API: ${isFeatureEnabled("betaApi")}`);

// FEHLER: Unbekanntes Feature Flag wuerde nicht kompilieren
// isFeatureEnabled("nonExistent"); // TS Error!

console.log("\n=== Fazit ===");
console.log("Der Config Builder kombiniert:");
console.log("  - as const fuer praezise Literal Types (L09)");
console.log("  - Discriminated Unions fuer Environment-Configs (L07)");
console.log("  - Function Overloads fuer typsichere Getter (L06)");
console.log("  - Readonly Interfaces fuer immutable Defaults (L05)");
console.log("  - Type Narrowing fuer Validierung (L07)");
