/**
 * Lektion 14 - Example 05: Real-World Generics
 *
 * Ausfuehren mit: npx tsx examples/05-real-world-generics.ts
 *
 * API Client<T>, Repository Pattern, Event Emitter, DI Container.
 */

// ─── REPOSITORY PATTERN ─────────────────────────────────────────────────────

interface Entity {
  id: string;
}

interface Repository<T extends Entity> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<Omit<T, "id">>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

class InMemoryRepository<T extends Entity> implements Repository<T> {
  private items = new Map<string, T>();
  private nextId = 1;

  async findAll(): Promise<T[]> {
    return [...this.items.values()];
  }

  async findById(id: string): Promise<T | undefined> {
    return this.items.get(id);
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const id = String(this.nextId++);
    const item = { ...data, id } as T;
    this.items.set(id, item);
    return item;
  }

  async update(id: string, data: Partial<Omit<T, "id">>): Promise<T> {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`Not found: ${id}`);
    const updated = { ...existing, ...data };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}

interface User extends Entity {
  name: string;
  email: string;
}

interface Product extends Entity {
  title: string;
  price: number;
}

async function demoRepository() {
  console.log("=== Repository Pattern ===\n");

  const userRepo = new InMemoryRepository<User>();
  const productRepo = new InMemoryRepository<Product>();

  // User erstellen:
  const alice = await userRepo.create({ name: "Alice", email: "alice@test.de" });
  const bob = await userRepo.create({ name: "Bob", email: "bob@test.de" });
  console.log("Created users:", alice, bob);

  // Product erstellen:
  const laptop = await productRepo.create({ title: "Laptop", price: 999 });
  console.log("Created product:", laptop);

  // Update:
  const updated = await userRepo.update(alice.id, { name: "Alice Mueller" });
  console.log("Updated:", updated);

  // Find all:
  const allUsers = await userRepo.findAll();
  console.log("All users:", allUsers.map(u => u.name));

  // Find by id:
  const found = await userRepo.findById(bob.id);
  console.log("Found Bob:", found?.email);
}

// ─── TYPED EVENT EMITTER ────────────────────────────────────────────────────

type EventMapType = Record<string, unknown>;

class TypedEventEmitter<Events extends EventMapType> {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof Events & string>(
    event: K,
    handler: (data: Events[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => { this.listeners.get(event)?.delete(handler); };
  }

  emit<K extends keyof Events & string>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }
}

interface AppEvents {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "cart:update": { items: string[]; total: number };
  "error": { message: string; code: number };
}

function demoEventEmitter() {
  console.log("\n=== Typed Event Emitter ===\n");

  const emitter = new TypedEventEmitter<AppEvents>();

  const unsubLogin = emitter.on("user:login", (data) => {
    console.log(`Login: ${data.userId} at ${data.timestamp.toISOString()}`);
  });

  emitter.on("cart:update", (data) => {
    console.log(`Cart: ${data.items.length} items, ${data.total} EUR`);
  });

  emitter.on("error", (data) => {
    console.log(`Error [${data.code}]: ${data.message}`);
  });

  // Events emittieren:
  emitter.emit("user:login", { userId: "alice", timestamp: new Date() });
  emitter.emit("cart:update", { items: ["Laptop", "Maus"], total: 1028 });
  emitter.emit("error", { message: "Connection lost", code: 503 });

  // Unsubscribe:
  unsubLogin();
  console.log("(Login handler removed)");
  emitter.emit("user:login", { userId: "bob", timestamp: new Date() });
  console.log("(No output — handler was removed)");
}

// ─── DI CONTAINER ───────────────────────────────────────────────────────────

class Token<T> {
  constructor(public readonly name: string) {}
}

class Container {
  private bindings = new Map<Token<unknown>, () => unknown>();
  private singletons = new Map<Token<unknown>, unknown>();

  bind<T>(token: Token<T>, factory: () => T): void {
    this.bindings.set(token, factory);
  }

  singleton<T>(token: Token<T>, factory: () => T): void {
    this.bindings.set(token, () => {
      if (!this.singletons.has(token)) {
        this.singletons.set(token, factory());
      }
      return this.singletons.get(token);
    });
  }

  resolve<T>(token: Token<T>): T {
    const factory = this.bindings.get(token);
    if (!factory) throw new Error(`No binding: ${token.name}`);
    return factory() as T;
  }
}

class LoggerService {
  private count = 0;
  log(msg: string) {
    this.count++;
    console.log(`  [Logger #${this.count}] ${msg}`);
  }
}

class DatabaseService {
  constructor(private logger: LoggerService) {}
  query(sql: string) {
    this.logger.log(`Query: ${sql}`);
    return [{ id: 1, result: "data" }];
  }
}

const LOGGER = new Token<LoggerService>("logger");
const DATABASE = new Token<DatabaseService>("database");

function demoDIContainer() {
  console.log("\n=== DI Container ===\n");

  const container = new Container();

  // Logger als Singleton (immer dieselbe Instanz):
  container.singleton(LOGGER, () => new LoggerService());

  // Database braucht Logger — Dependency Injection:
  container.bind(DATABASE, () => {
    const logger = container.resolve(LOGGER);
    return new DatabaseService(logger);
  });

  const db1 = container.resolve(DATABASE);
  db1.query("SELECT * FROM users");

  const db2 = container.resolve(DATABASE);
  db2.query("INSERT INTO logs");

  // Beide verwenden denselben Logger (Singleton):
  const logger = container.resolve(LOGGER);
  logger.log("Direct log — gleiche Instanz wie in DB");
}

// ─── ALLES AUSFUEHREN ──────────────────────────────────────────────────────

async function main() {
  await demoRepository();
  demoEventEmitter();
  demoDIContainer();
  console.log("\n--- Alle Real-World-Beispiele erfolgreich! ---");
}

main();
