/**
 * Lektion 14 - Solution 05: Real-World Generic Patterns
 *
 * Ausfuehren mit: npx tsx solutions/05-real-world-patterns.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Generic Repository
// ═══════════════════════════════════════════════════════════════════════════

interface Entity {
  id: string;
}

interface Repository<T extends Entity> {
  findAll(): T[];
  findById(id: string): T | undefined;
  create(data: Omit<T, "id">): T;
  update(id: string, data: Partial<Omit<T, "id">>): T;
  delete(id: string): boolean;
}

class InMemoryRepo<T extends Entity> implements Repository<T> {
  private items = new Map<string, T>();
  private nextId = 1;

  findAll(): T[] {
    return [...this.items.values()];
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  create(data: Omit<T, "id">): T {
    const id = String(this.nextId++);
    const item = { ...data, id } as T;
    this.items.set(id, item);
    return item;
  }

  update(id: string, data: Partial<Omit<T, "id">>): T {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`Not found: ${id}`);
    const updated = { ...existing, ...data };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Typed Event Emitter
// ═══════════════════════════════════════════════════════════════════════════

class TypedEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof Events & string>(
    event: K,
    handler: (data: Events[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof Events & string>(
    event: K,
    handler: (data: Events[K]) => void
  ): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit<K extends keyof Events & string>(
    event: K,
    data: Events[K]
  ): void {
    this.listeners.get(event)?.forEach(h => h(data));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Simple DI Container
// ═══════════════════════════════════════════════════════════════════════════

class Token<T> {
  constructor(public readonly name: string) {}
}

class SimpleContainer {
  private bindings = new Map<Token<unknown>, () => unknown>();

  bind<T>(token: Token<T>, factory: () => T): void {
    this.bindings.set(token, factory);
  }

  resolve<T>(token: Token<T>): T {
    const factory = this.bindings.get(token);
    if (!factory) throw new Error(`No binding for: ${token.name}`);
    return factory() as T;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Type-safe Config Loader
// ═══════════════════════════════════════════════════════════════════════════

interface ConfigSchema {
  database: { host: string; port: number; name: string };
  server: { port: number; cors: boolean };
  auth: { secret: string; expiresIn: number };
}

class ConfigLoader<S extends Record<string, object>> {
  private sections = new Map<string, object>();

  set<K extends keyof S & string>(section: K, data: S[K]): void {
    this.sections.set(section, data);
  }

  get<K extends keyof S & string>(section: K): S[K] {
    const data = this.sections.get(section);
    if (!data) throw new Error(`Config section not loaded: ${section}`);
    return data as S[K];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Middleware Pipeline
// ═══════════════════════════════════════════════════════════════════════════

type Middleware<T> = (data: T, next: (data: T) => T) => T;

class Pipeline<T> {
  private middlewares: Middleware<T>[] = [];

  use(middleware: Middleware<T>): Pipeline<T> {
    this.middlewares.push(middleware);
    return this;
  }

  execute(data: T): T {
    // Baue die Kette von hinten nach vorne auf:
    const chain = this.middlewares.reduceRight(
      (next: (data: T) => T, middleware) => {
        return (d: T) => middleware(d, next);
      },
      (d: T) => d // Letzte "next" gibt einfach die Daten zurueck
    );

    return chain(data);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

// Repository Test:
interface User extends Entity { name: string; email: string }

const repo = new InMemoryRepo<User>();
const alice = repo.create({ name: "Alice", email: "alice@test.de" });
const bob = repo.create({ name: "Bob", email: "bob@test.de" });
console.log("Created:", alice, bob);
console.log("FindAll:", repo.findAll().map(u => u.name));

const updated = repo.update(alice.id, { name: "Alice Mueller" });
console.log("Updated:", updated);

console.log("FindById:", repo.findById(bob.id)?.email);
console.log("Delete:", repo.delete(bob.id));
console.log("After delete:", repo.findAll().map(u => u.name));

// EventEmitter Test:
interface ChatEvents {
  message: { from: string; text: string };
  typing: { user: string };
}

console.log("\nEvents:");
const chat = new TypedEmitter<ChatEvents>();
const unsub = chat.on("message", (data) => console.log(`  ${data.from}: ${data.text}`));
chat.on("typing", (data) => console.log(`  ${data.user} tippt...`));

chat.emit("message", { from: "Alice", text: "Hallo!" });
chat.emit("typing", { user: "Bob" });
unsub(); // Unsubscribe
chat.emit("message", { from: "Bob", text: "Tschüss!" }); // Kein Output

// DI Container Test:
console.log("\nDI Container:");
const DB_URL = new Token<string>("db-url");
const PORT = new Token<number>("port");

const container = new SimpleContainer();
container.bind(DB_URL, () => "postgres://localhost/app");
container.bind(PORT, () => 3000);

console.log("  DB:", container.resolve(DB_URL));
console.log("  Port:", container.resolve(PORT));

// Config Loader Test:
console.log("\nConfig Loader:");
const config = new ConfigLoader<ConfigSchema>();
config.set("database", { host: "localhost", port: 5432, name: "app" });
config.set("server", { port: 3000, cors: true });

console.log("  DB:", config.get("database"));
console.log("  Server:", config.get("server"));

// Middleware Pipeline Test:
console.log("\nPipeline:");
const pipeline = new Pipeline<string>()
  .use((data, next) => next(data.trim()))
  .use((data, next) => next(data.toUpperCase()))
  .use((data, next) => next(`[${data}]`));

console.log("  Result:", pipeline.execute("  hello  ")); // "[HELLO]"

const numPipeline = new Pipeline<number>()
  .use((data, next) => next(data * 2))
  .use((data, next) => next(data + 10))
  .use((data, next) => next(data * 3));

console.log("  Number:", numPipeline.execute(5)); // ((5 * 2) + 10) * 3 = 60

console.log("\n--- Alle Tests bestanden! ---");
