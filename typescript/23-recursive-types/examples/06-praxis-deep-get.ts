/**
 * Example 06: Praxis — Typsicherer deep-get und Konfigurationen
 *
 * Ausfuehren: npx tsx examples/06-praxis-deep-get.ts
 */

// ─── Typ-Utilities ──────────────────────────────────────────────────────────

type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
  : never;

type PathValue<T, P extends string> =
  P extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      : never
    : P extends keyof T
      ? T[P]
      : never;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[K] extends object
      ? DeepReadonly<T[K]>
      : T[K];
};

// ─── Anwendungsbeispiel: Config-System ──────────────────────────────────────

type ServerConfig = {
  server: {
    host: string;
    port: number;
    tls: {
      enabled: boolean;
      cert: string;
      key: string;
    };
  };
  database: {
    url: string;
    pool: { min: number; max: number };
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
    format: "json" | "text";
  };
};

// ─── Typsicheres Config-Objekt ──────────────────────────────────────────────

class TypedConfig<T extends object> {
  private data: DeepReadonly<T>;

  constructor(data: T) {
    this.data = data as DeepReadonly<T>;
  }

  get<P extends Paths<T> & string>(path: P): PathValue<T, P> {
    const keys = path.split(".");
    let current: unknown = this.data;
    for (const key of keys) {
      if (current === null || current === undefined) {
        throw new Error(`Pfad "${path}" nicht gefunden bei "${key}"`);
      }
      current = (current as Record<string, unknown>)[key];
    }
    return current as PathValue<T, P>;
  }

  update(partial: DeepPartial<T>): TypedConfig<T> {
    const merged = this.deepMerge(
      this.data as unknown as Record<string, unknown>,
      partial as Record<string, unknown>
    );
    return new TypedConfig(merged as T);
  }

  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const sv = source[key];
      const tv = result[key];
      if (
        sv && typeof sv === "object" && !Array.isArray(sv) &&
        tv && typeof tv === "object" && !Array.isArray(tv)
      ) {
        result[key] = this.deepMerge(
          tv as Record<string, unknown>,
          sv as Record<string, unknown>
        );
      } else {
        result[key] = sv;
      }
    }
    return result;
  }
}

// ─── Verwendung ──────────────────────────────────────────────────────────────

const config = new TypedConfig<ServerConfig>({
  server: {
    host: "localhost",
    port: 3000,
    tls: { enabled: false, cert: "", key: "" },
  },
  database: {
    url: "postgresql://localhost:5432/dev",
    pool: { min: 2, max: 10 },
  },
  logging: { level: "debug", format: "text" },
});

// Typsicherer Zugriff:
const host = config.get("server.host");           // string
const port = config.get("server.port");           // number
const level = config.get("logging.level");        // "debug" | "info" | "warn" | "error"
const poolMax = config.get("database.pool.max");  // number

console.log(`Server: ${host}:${port}`);
console.log(`Logging: ${level}`);
console.log(`DB Pool max: ${poolMax}`);

// Typsicheres Update:
const prodConfig = config.update({
  server: {
    host: "0.0.0.0",
    port: 443,
    tls: { enabled: true, cert: "/etc/ssl/cert.pem", key: "/etc/ssl/key.pem" },
  },
  database: {
    url: "postgresql://prod-db:5432/production",
  },
  logging: { level: "warn" },
});

console.log(`\nProd Server: ${prodConfig.get("server.host")}:${prodConfig.get("server.port")}`);
console.log(`Prod TLS: ${prodConfig.get("server.tls.enabled")}`);
console.log(`Prod Log Level: ${prodConfig.get("logging.level")}`);

// Compile-Error bei falschem Pfad oder Wert:
// config.get("server.invalid");               // Error!
// config.update({ server: { port: "443" } }); // Error! port ist number
