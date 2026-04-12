/**
 * Lektion 13 - Exercise 04: Default-Typparameter
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-default-typparameter.ts
 *
 * 4 Aufgaben zu Defaults, Reihenfolge und Praxis-Patterns.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Container mit Default
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein generisches Interface "Container<T>" mit einem
// Default-Typ von string. Properties: value: T, label: string.
// interface Container...

// Tests:
// const c1: Container = { value: "Hallo", label: "text" };
// const c2: Container<number> = { value: 42, label: "zahl" };
// console.log(`${c1.label}: ${c1.value}`); // text: Hallo
// console.log(`${c2.label}: ${c2.value}`); // zahl: 42

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Cache mit zwei Defaults
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein generisches Interface "SimpleCache<K, V>"
// mit Defaults K = string, V = string.
// Methoden: get(key: K): V | undefined, set(key: K, value: V): void
// interface SimpleCache...

// TODO: Implementiere createCache ohne Typparameter (nutzt Defaults)
// function createCache...

// Tests:
// const cache = createCache();      // SimpleCache<string, string>
// cache.set("lang", "TypeScript");
// console.log(cache.get("lang")); // "TypeScript"

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Logger mit Default
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein generisches Interface "Logger<TContext>"
// mit Default TContext = Record<string, unknown>.
// Methoden: log(message: string, context?: TContext): void,
//           error(message: string, context?: TContext): void
// interface Logger...

// TODO: Implementiere createLogger das den Default nutzt
// function createLogger...

// Tests:
// const logger = createLogger();
// logger.log("Server started", { port: 3000 });
// logger.error("Connection failed", { host: "localhost" });

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Response mit Default + Constraint
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Type Alias "ApiResult<T, E>" wobei:
// - T hat keinen Default
// - E extends Error hat einen Default von Error
// - ApiResult ist { ok: true; data: T } | { ok: false; error: E }
// type ApiResult...

// Tests:
// const success: ApiResult<string> = { ok: true, data: "Hallo" };
// const failure: ApiResult<string> = { ok: false, error: new Error("Fehler") };
//
// class ValidationError extends Error {
//   constructor(public field: string, message: string) {
//     super(message);
//   }
// }
// const valError: ApiResult<string, ValidationError> = {
//   ok: false, error: new ValidationError("email", "Ungueltig")
// };
