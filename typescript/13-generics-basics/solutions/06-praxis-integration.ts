/**
 * Lektion 13 - Loesung 06: Praxis-Integration
 */

// ═══ AUFGABE 1: Typsicherer Event-Emitter ══════════════════════════════════

interface TypedEmitter<TEvents extends object> {
  on<K extends keyof TEvents & string>(
    event: K,
    handler: (payload: TEvents[K]) => void
  ): void;
  emit<K extends keyof TEvents & string>(
    event: K,
    payload: TEvents[K]
  ): void;
}

function createEmitter<TEvents extends object>(): TypedEmitter<TEvents> {
  const handlers = new Map<string, Function[]>();
  return {
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event)!.push(handler);
    },
    emit(event, payload) {
      handlers.get(event)?.forEach(fn => fn(payload));
    },
  };
}

interface AppEvents {
  "user:login": { userId: string };
  "user:logout": { userId: string };
  "message": { text: string; from: string };
}

const emitter = createEmitter<AppEvents>();
emitter.on("user:login", data => console.log(`Login: ${data.userId}`));
emitter.on("message", data => console.log(`Message from ${data.from}: ${data.text}`));
emitter.emit("user:login", { userId: "123" });
emitter.emit("message", { text: "Hallo", from: "System" });

// ═══ AUFGABE 2: Generic Repository Pattern ═════════════════════════════════

interface Entity {
  id: number;
}

interface Repository<T extends Entity> {
  findById(id: number): T | undefined;
  findAll(): T[];
  save(entity: T): void;
  update(id: number, updates: Partial<Omit<T, "id">>): T | undefined;
  delete(id: number): boolean;
}

function createRepository<T extends Entity>(): Repository<T> {
  const store = new Map<number, T>();
  return {
    findById: (id) => store.get(id),
    findAll: () => [...store.values()],
    save: (entity) => { store.set(entity.id, entity); },
    update(id, updates) {
      const entity = store.get(id);
      if (!entity) return undefined;
      const updated = { ...entity, ...updates };
      store.set(id, updated);
      return updated;
    },
    delete: (id) => store.delete(id),
  };
}

interface User extends Entity { name: string; email: string; }

const userRepo = createRepository<User>();
userRepo.save({ id: 1, name: "Max", email: "max@test.de" });
userRepo.save({ id: 2, name: "Anna", email: "anna@test.de" });
console.log(userRepo.findById(1));
console.log(userRepo.findAll());
userRepo.update(1, { name: "Maximilian" });
console.log(userRepo.findById(1));

// ═══ AUFGABE 3: Typsichere Konfiguration ═══════════════════════════════════

function createConfig<T extends Record<string, unknown>>(defaults: T) {
  const values = { ...defaults };
  return {
    get<K extends keyof T>(key: K): T[K] {
      return values[key];
    },
    set<K extends keyof T>(key: K, value: T[K]): void {
      values[key] = value;
    },
  };
}

const config = createConfig({
  host: "localhost",
  port: 3000,
  debug: false,
});

const host = config.get("host"); // string
const port = config.get("port"); // number
console.log(`${host}:${port}`);

config.set("port", 8080);        // OK
// config.set("port", "8080");   // Error! string !== number
console.log(`New port: ${config.get("port")}`);

// ═══ AUFGABE 4: Async Pipeline ═════════════════════════════════════════════

async function asyncPipe<T>(
  initial: T,
  ...fns: ((arg: T) => Promise<T>)[]
): Promise<T> {
  let result = initial;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
}

const pipeResult = await asyncPipe(
  5,
  async n => n * 2,     // 10
  async n => n + 3,     // 13
  async n => n * n,     // 169
);
console.log(`asyncPipe result: ${pipeResult}`); // 169
