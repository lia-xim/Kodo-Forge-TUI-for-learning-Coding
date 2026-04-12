/**
 * Lektion 14 - Exercise 05: Real-World Generic Patterns
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-real-world-patterns.ts
 *
 * 5 Aufgaben zu Repository, EventEmitter, DI Container und API Client.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Generic Repository
// ═══════════════════════════════════════════════════════════════════════════

interface Entity {
  id: string;
}

// TODO: Implementiere ein generisches Repository-Interface mit:
// - findAll(): T[]
// - findById(id: string): T | undefined
// - create(data: Omit<T, "id">): T
// - update(id: string, data: Partial<Omit<T, "id">>): T
// - delete(id: string): boolean
//
// Dann implementiere "InMemoryRepo<T>" das dieses Interface umsetzt.
// Generiere IDs automatisch mit einem Counter.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Typed Event Emitter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere einen TypedEmitter<Events> mit:
// - on<K>(event: K, handler: (data: Events[K]) => void): () => void
// - emit<K>(event: K, data: Events[K]): void
// - off<K>(event: K, handler: (data: Events[K]) => void): void
//
// K soll auf keyof Events & string eingeschraenkt sein.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Simple DI Container
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere einen einfachen DI Container:
// - Klasse Token<T> mit einem name-Property
// - Klasse SimpleContainer mit:
//   - bind<T>(token: Token<T>, factory: () => T): void
//   - resolve<T>(token: Token<T>): T
//   - Falls kein Binding existiert: Error werfen

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Type-safe Config Loader
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe einen ConfigLoader der verschiedene Config-Abschnitte
// typsicher laden kann:
//
// interface ConfigSchema {
//   database: { host: string; port: number; name: string };
//   server: { port: number; cors: boolean };
//   auth: { secret: string; expiresIn: number };
// }
//
// class ConfigLoader<S extends Record<string, object>> {
//   set<K extends keyof S>(section: K, data: S[K]): void
//   get<K extends keyof S>(section: K): S[K]
// }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Middleware Pipeline
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere eine typsichere Middleware-Pipeline:
//
// type Middleware<T> = (data: T, next: (data: T) => T) => T;
//
// class Pipeline<T> {
//   use(middleware: Middleware<T>): Pipeline<T>
//   execute(data: T): T
// }
//
// Jede Middleware kann die Daten modifizieren und dann next() aufrufen.

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// interface User extends Entity { name: string; email: string }
//
// console.log("--- Tests ---");
//
// // Repository Test:
// const repo = new InMemoryRepo<User>();
// const alice = repo.create({ name: "Alice", email: "alice@test.de" });
// console.log("Created:", alice);
// console.log("FindAll:", repo.findAll());
//
// // EventEmitter Test:
// interface ChatEvents {
//   message: { from: string; text: string };
//   typing: { user: string };
// }
// const chat = new TypedEmitter<ChatEvents>();
// chat.on("message", (data) => console.log(`${data.from}: ${data.text}`));
// chat.emit("message", { from: "Alice", text: "Hallo!" });
//
// // DI Container Test:
// const DB = new Token<string>("db");
// const container = new SimpleContainer();
// container.bind(DB, () => "postgres://localhost/app");
// console.log("DB:", container.resolve(DB));
//
// // Config Loader Test:
// const config = new ConfigLoader<ConfigSchema>();
// config.set("database", { host: "localhost", port: 5432, name: "app" });
// console.log("DB Config:", config.get("database"));
//
// // Middleware Test:
// const pipeline = new Pipeline<string>()
//   .use((data, next) => next(data.trim()))
//   .use((data, next) => next(data.toUpperCase()))
//   .use((data, next) => next(`[${data}]`));
// console.log("Pipeline:", pipeline.execute("  hello  ")); // "[HELLO]"

console.log("Exercise 05 geladen. Ersetze die TODOs!");
