/**
 * Lektion 14 - Example 01: Generic Factories
 *
 * Ausfuehren mit: npx tsx examples/01-generic-factories.ts
 *
 * Factory Functions, createInstance<T>, Builder Pattern
 * und Registry Pattern mit Generics.
 */

// ─── EINFACHE GENERIC FACTORY ──────────────────────────────────────────────

function createInstance<T>(data: T): T {
  return { ...data };
}

const user = createInstance({ name: "Max", age: 30, active: true });
// ^ Typ: { name: string; age: number; active: boolean }
console.log("User:", user);

const config = createInstance({ debug: true, port: 3000, host: "localhost" });
// ^ Typ: { debug: boolean; port: number; host: string }
console.log("Config:", config);

// ─── FACTORY MIT CONSTRUCTOR SIGNATURE ──────────────────────────────────────

function createFromClass<T, Args extends unknown[]>(
  Ctor: new (...args: Args) => T,
  ...args: Args
): T {
  return new Ctor(...args);
}

class Database {
  constructor(public host: string, public port: number) {}
  connect() { console.log(`Connecting to ${this.host}:${this.port}`); }
}

class Logger {
  constructor(public prefix: string) {}
  log(msg: string) { console.log(`[${this.prefix}] ${msg}`); }
}

const db = createFromClass(Database, "localhost", 5432);
db.connect(); // "Connecting to localhost:5432"

const logger = createFromClass(Logger, "APP");
logger.log("Started"); // "[APP] Started"

// ─── FACTORY MIT DEFAULTS ───────────────────────────────────────────────────

function createWithDefaults<T>(defaults: T) {
  return (overrides: Partial<T>): T => {
    return { ...defaults, ...overrides };
  };
}

interface ButtonConfig {
  label: string;
  variant: "primary" | "secondary" | "danger";
  disabled: boolean;
  size: "sm" | "md" | "lg";
}

const createButton = createWithDefaults<ButtonConfig>({
  label: "Click me",
  variant: "primary",
  disabled: false,
  size: "md",
});

const defaultBtn = createButton({});
console.log("Default:", defaultBtn);
// { label: "Click me", variant: "primary", disabled: false, size: "md" }

const dangerBtn = createButton({ variant: "danger", label: "Delete" });
console.log("Danger:", dangerBtn);
// { label: "Delete", variant: "danger", disabled: false, size: "md" }

const smallBtn = createButton({ size: "sm", disabled: true });
console.log("Small:", smallBtn);

// ─── BUILDER PATTERN ────────────────────────────────────────────────────────

class Builder<T extends Record<string, unknown> = {}> {
  private data: T;

  constructor(data: T = {} as T) {
    this.data = data;
  }

  set<K extends string, V>(
    key: K,
    value: V
  ): Builder<T & Record<K, V>> {
    return new Builder({ ...this.data, [key]: value } as T & Record<K, V>);
  }

  build(): T {
    return this.data;
  }
}

const person = new Builder()
  .set("name", "Alice")
  .set("age", 28)
  .set("email", "alice@example.com")
  .set("active", true)
  .build();

console.log("Built person:", person);
// { name: "Alice", age: 28, email: "alice@example.com", active: true }

// ─── REGISTRY PATTERN ───────────────────────────────────────────────────────

interface ServiceMap {
  logger: Logger;
  database: Database;
}

function createRegistry<M extends Record<string, unknown>>() {
  const factories = new Map<string, () => unknown>();

  return {
    register<K extends keyof M & string>(key: K, factory: () => M[K]) {
      factories.set(key, factory);
    },
    create<K extends keyof M & string>(key: K): M[K] {
      const factory = factories.get(key);
      if (!factory) throw new Error(`No factory for: ${key}`);
      return factory() as M[K];
    },
  };
}

const registry = createRegistry<ServiceMap>();
registry.register("logger", () => new Logger("REGISTRY"));
registry.register("database", () => new Database("db.local", 3306));

const regLogger = registry.create("logger");
regLogger.log("Created via registry"); // "[REGISTRY] Created via registry"

const regDb = registry.create("database");
regDb.connect(); // "Connecting to db.local:3306"

console.log("\n--- Alle Factory-Beispiele erfolgreich! ---");
