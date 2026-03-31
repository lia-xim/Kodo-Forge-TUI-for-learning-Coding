/**
 * Lektion 13 - Loesung 04: Default-Typparameter
 */

// ═══ AUFGABE 1: Container mit Default ══════════════════════════════════════

interface Container<T = string> {
  value: T;
  label: string;
}

const c1: Container = { value: "Hallo", label: "text" };
const c2: Container<number> = { value: 42, label: "zahl" };
console.log(`${c1.label}: ${c1.value}`); // text: Hallo
console.log(`${c2.label}: ${c2.value}`); // zahl: 42

// ═══ AUFGABE 2: Cache mit zwei Defaults ════════════════════════════════════

interface SimpleCache<K = string, V = string> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

function createCache(): SimpleCache {
  const store = new Map<string, string>();
  return {
    get: (key) => store.get(key),
    set: (key, value) => { store.set(key, value); },
  };
}

const cache = createCache();
cache.set("lang", "TypeScript");
console.log(cache.get("lang")); // "TypeScript"

// ═══ AUFGABE 3: Logger mit Default ═════════════════════════════════════════

interface Logger<TContext = Record<string, unknown>> {
  log(message: string, context?: TContext): void;
  error(message: string, context?: TContext): void;
}

function createLogger(): Logger {
  return {
    log(message, context) {
      console.log(`[LOG] ${message}`, context ?? "");
    },
    error(message, context) {
      console.error(`[ERROR] ${message}`, context ?? "");
    },
  };
}

const logger = createLogger();
logger.log("Server started", { port: 3000 });
logger.error("Connection failed", { host: "localhost" });

// ═══ AUFGABE 4: ApiResult mit Default + Constraint ═════════════════════════

type ApiResult<T, E extends Error = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

const success: ApiResult<string> = { ok: true, data: "Hallo" };
const failure: ApiResult<string> = { ok: false, error: new Error("Fehler") };

class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}

const valError: ApiResult<string, ValidationError> = {
  ok: false, error: new ValidationError("email", "Ungueltig"),
};

console.log(success);
console.log(failure);
console.log(valError);
