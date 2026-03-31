/**
 * Lektion 08 - Example 05: Praxis-Patterns
 *
 * Ausfuehren mit: npx tsx examples/05-praxis-patterns.ts
 *
 * Realistische Patterns die type und interface kombinieren:
 * Angular-Style, React-Style, und Framework-agnostische Patterns.
 */

// ─── PATTERN 1: REPOSITORY-PATTERN (INTERFACE FUeR CONTRACTS) ──────────────

console.log("--- Pattern 1: Repository mit interface ---");

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, keyof BaseEntity>): Promise<T>;
  update(id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Entity:
interface User extends BaseEntity {
  name: string;
  email: string;
  role: "admin" | "user";
}

// type fuer Ableitungen:
type CreateUserDTO = Omit<User, keyof BaseEntity>;
type UpdateUserDTO = Partial<CreateUserDTO>;
type UserSummary = Pick<User, "id" | "name" | "role">;

// In-Memory-Implementierung:
class InMemoryUserRepo implements Repository<User> {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user: User = {
      id: `usr-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.users.push(user);
    return user;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error(`User ${id} nicht gefunden`);
    this.users[index] = { ...this.users[index], ...data, updatedAt: new Date() };
    return this.users[index];
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
  }
}

const repo = new InMemoryUserRepo();

async function demoRepository() {
  const user = await repo.create({ name: "Max", email: "max@test.de", role: "admin" });
  console.log(`Erstellt: ${user.name} (${user.id})`);

  await repo.update(user.id, { email: "max@neu.de" });
  const updated = await repo.findById(user.id);
  console.log(`Aktualisiert: ${updated?.email}`);

  const all = await repo.findAll();
  console.log(`Gesamt: ${all.length} User`);
}

// ─── PATTERN 2: DISCRIMINATED UNIONS (TYPE FUeR VARIANTEN) ──────────────────

console.log("\n--- Pattern 2: State Machine mit type ---");

type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: { name: string; token: string } }
  | { status: "error"; message: string; retryCount: number };

function renderAuth(state: AuthState): string {
  switch (state.status) {
    case "idle":
      return "Bitte einloggen";
    case "loading":
      return "Laden...";
    case "authenticated":
      return `Willkommen, ${state.user.name}!`;
    case "error":
      return `Fehler: ${state.message} (Versuch ${state.retryCount})`;
  }
}

const states: AuthState[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "authenticated", user: { name: "Max", token: "abc" } },
  { status: "error", message: "Netzwerkfehler", retryCount: 3 },
];

for (const state of states) {
  console.log(`  ${state.status}: ${renderAuth(state)}`);
}

// ─── PATTERN 3: BUILDER-PATTERN MIT GENERICS ───────────────────────────────

console.log("\n--- Pattern 3: Builder Pattern ---");

interface QueryBuilder<T> {
  where(field: keyof T, value: T[keyof T]): QueryBuilder<T>;
  orderBy(field: keyof T, direction: "asc" | "desc"): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  execute(): T[];
}

// Type fuer Konfiguration:
type QueryConfig<T> = {
  filters: Array<{ field: keyof T; value: unknown }>;
  sort?: { field: keyof T; direction: "asc" | "desc" };
  maxResults?: number;
};

// ─── PATTERN 4: EVENT SYSTEM ───────────────────────────────────────────────

console.log("\n--- Pattern 4: Typisiertes Event System ---");

// Interface fuer die Event-Map (erweiterbar via Declaration Merging):
interface AppEvents {
  userLoggedIn: { userId: string; timestamp: Date };
  userLoggedOut: { userId: string };
  pageViewed: { path: string; referrer?: string };
}

// type fuer Event-Handler:
type EventHandler<T> = (data: T) => void;

// type fuer den Listener:
type EventListener<E extends Record<string, unknown>> = {
  on<K extends keyof E>(event: K, handler: EventHandler<E[K]>): void;
  emit<K extends keyof E>(event: K, data: E[K]): void;
};

class TypedEventEmitter implements EventListener<AppEvents> {
  private handlers: Partial<Record<keyof AppEvents, Function[]>> = {};

  on<K extends keyof AppEvents>(event: K, handler: EventHandler<AppEvents[K]>): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(handler);
  }

  emit<K extends keyof AppEvents>(event: K, data: AppEvents[K]): void {
    const handlers = this.handlers[event];
    if (handlers) {
      handlers.forEach(h => h(data));
    }
  }
}

const emitter = new TypedEventEmitter();

emitter.on("userLoggedIn", (data) => {
  // TypeScript weiss: data hat userId und timestamp
  console.log(`  Login: ${data.userId} um ${data.timestamp.toISOString()}`);
});

emitter.on("pageViewed", (data) => {
  // TypeScript weiss: data hat path und optionales referrer
  console.log(`  Seite: ${data.path} (von ${data.referrer ?? "direkt"})`);
});

emitter.emit("userLoggedIn", { userId: "usr-001", timestamp: new Date() });
emitter.emit("pageViewed", { path: "/dashboard", referrer: "/login" });

// ─── PATTERN 5: CONFIGURATION MIT DECLARATION MERGING ──────────────────────

console.log("\n--- Pattern 5: Plugin-Konfiguration ---");

// Basis-Config:
interface PluginConfig {
  name: string;
  version: string;
}

// Plugin A erweitert:
interface PluginConfig {
  logging?: {
    level: "debug" | "info" | "warn" | "error";
    output: "console" | "file";
  };
}

// Plugin B erweitert:
interface PluginConfig {
  metrics?: {
    enabled: boolean;
    endpoint: string;
  };
}

// type fuer Validierung:
type RequiredPluginConfig = Required<PluginConfig>;
type PluginKeys = keyof PluginConfig;
// "name" | "version" | "logging" | "metrics"

const pluginConfig: PluginConfig = {
  name: "MeinPlugin",
  version: "1.0.0",
  logging: { level: "info", output: "console" },
  metrics: { enabled: true, endpoint: "/metrics" },
};

console.log(`Plugin: ${pluginConfig.name} v${pluginConfig.version}`);
console.log(`Logging: ${pluginConfig.logging?.level}`);
console.log(`Metrics: ${pluginConfig.metrics?.enabled ? "aktiv" : "inaktiv"}`);

// ─── ALLE DEMOS AUSFUeHREN ─────────────────────────────────────────────────

demoRepository().then(() => {
  console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
});
