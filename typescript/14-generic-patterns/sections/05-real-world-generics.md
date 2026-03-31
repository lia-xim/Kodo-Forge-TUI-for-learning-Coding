# Sektion 5: Real-World Generics

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Advanced Constraints](./04-generic-constraints-advanced.md)
> Naechste Sektion: -- (Lektionsende)

---

## Was du hier lernst

- API Client\<T\> fuer typsichere HTTP-Aufrufe
- Repository Pattern fuer generisches CRUD
- EventEmitter\<Events\> mit typsicheren Event-Payloads
- DI Container mit generischem `resolve<T>()`

---

## API Client\<T\> — Typsichere HTTP-Aufrufe

Jede Webanwendung macht HTTP-Requests. Ohne Generics sind die Antworten
`unknown` oder `any`. Mit Generics weiss der Compiler exakt, was
zurueckkommt:

```typescript annotated
class ApiClient {
  constructor(private baseUrl: string) {}

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<T>;
  }

  async post<TBody, TResponse>(
    path: string,
    body: TBody
  ): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<TResponse>;
  }
}

// Verwendung:
interface User { id: number; name: string; email: string }
interface CreateUserDto { name: string; email: string }

const api = new ApiClient("https://api.example.com");

const users = await api.get<User[]>("/users");
// ^ Typ: User[] — nicht unknown!
users[0].name; // Volle Autovervollstaendigung

const newUser = await api.post<CreateUserDto, User>(
  "/users",
  { name: "Max", email: "max@example.com" }
);
// ^ Typ: User — der Server gibt den erstellten User zurueck
```

### Typsichere Route-Map

Das naechste Level: Eine Map die Routen mit Request/Response-Typen verknuepft:

```typescript annotated
interface ApiRoutes {
  "/users": { response: User[]; body: never };
  "/users/:id": { response: User; body: never };
  "/users/create": { response: User; body: CreateUserDto };
}

class TypedApiClient {
  constructor(private baseUrl: string) {}

  async get<P extends keyof ApiRoutes>(
    path: P
  ): Promise<ApiRoutes[P]["response"]> {
    const res = await fetch(`${this.baseUrl}${path}`);
    return res.json();
  }
}

const client = new TypedApiClient("https://api.example.com");
const users = await client.get("/users");
// ^ Typ: User[] — abgeleitet aus der Route-Map!
```

> 🧠 **Erklaere dir selbst:** Welchen Vorteil hat die Route-Map gegenueber
> dem einfachen `get<T>()` Pattern?
> **Kernpunkte:** Route-Map: Typ wird automatisch aus dem Pfad abgeleitet | Kein manuelles Angeben von T noetig | Falsche Kombinationen werden beim Kompilieren erkannt

---

## Repository Pattern — Generisches CRUD

Das Repository Pattern abstrahiert den Datenzugriff. Mit Generics schreibst
du die CRUD-Logik EINMAL und verwendest sie fuer jede Entity:

```typescript annotated
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

// In-Memory-Implementierung — gleiche Logik fuer jeden Typ:
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
```

Verwendung fuer verschiedene Entities:

```typescript annotated
interface User extends Entity { name: string; email: string }
interface Product extends Entity { title: string; price: number }

const userRepo = new InMemoryRepository<User>();
const productRepo = new InMemoryRepository<Product>();

const user = await userRepo.create({ name: "Max", email: "max@test.de" });
// ^ Typ: User — mit id, name, email

const product = await productRepo.create({ title: "Laptop", price: 999 });
// ^ Typ: Product — mit id, title, price

await userRepo.update(user.id, { name: "Maximilian" });
// Nur User-Properties — nicht Product-Properties!
```

---

## EventEmitter\<Events\> — Typsichere Events

Ein EventEmitter ohne Generics akzeptiert jeden Event-Namen mit jedem Payload.
Mit Generics erzwingst du: Jeder Event hat seinen definierten Datentyp.

```typescript annotated
type EventMap = Record<string, unknown>;

class TypedEventEmitter<Events extends EventMap> {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof Events & string>(
    event: K,
    handler: (data: Events[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Unsubscribe-Funktion zurueckgeben
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit<K extends keyof Events & string>(
    event: K,
    data: Events[K]
  ): void {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }
}
```

Verwendung:

```typescript annotated
interface AppEvents {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "cart:update": { items: string[]; total: number };
  "error": { message: string; code: number };
}

const emitter = new TypedEventEmitter<AppEvents>();

emitter.on("user:login", (data) => {
  console.log(data.userId, data.timestamp);
  // data hat Typ { userId: string; timestamp: Date } — automatisch!
});

emitter.emit("user:login", {
  userId: "123",
  timestamp: new Date(),
});

// emitter.emit("user:login", { wrong: true });
// Error! { wrong: boolean } ist nicht { userId: string; timestamp: Date }
```

---

## DI Container — Dependency Injection mit Generics

Dependency Injection (DI) Container sind die Basis moderner Frameworks
(Angular, NestJS). Mit Generics kann `resolve<T>()` den richtigen Typ
zurueckgeben — ohne Casts.

```typescript annotated
// Token: Ein eindeutiger Schluessel fuer einen Service
class Token<T> {
  constructor(public readonly name: string) {}
}

class Container {
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

// Tokens definieren:
const DATABASE = new Token<DatabaseService>("database");
const LOGGER = new Token<LoggerService>("logger");

class DatabaseService {
  query(sql: string) { return [{ id: 1 }]; }
}

class LoggerService {
  log(msg: string) { console.log(msg); }
}

// Container konfigurieren:
const container = new Container();
container.bind(DATABASE, () => new DatabaseService());
container.bind(LOGGER, () => new LoggerService());

// Aufloesung — vollstaendig typsicher:
const db = container.resolve(DATABASE);
// ^ Typ: DatabaseService
db.query("SELECT * FROM users"); // Volle Autovervollstaendigung

const logger = container.resolve(LOGGER);
// ^ Typ: LoggerService
logger.log("App started");
```

> **Warum Token\<T\>?** Der Token traegt den Typ `T` als Phantom-Typ mit.
> `Token<DatabaseService>` und `Token<LoggerService>` sind verschiedene Typen.
> Beim `resolve()` leitet TypeScript `T` aus dem Token ab — kein Cast noetig.

---

## Zusammenfassung

| Pattern | Einsatz | Generics-Nutzen |
|---------|---------|-----------------|
| ApiClient\<T\> | HTTP-Aufrufe | Rueckgabetyp = erwartete Daten |
| Repository\<T\> | CRUD-Operationen | Einmal schreiben, fuer jede Entity nutzen |
| EventEmitter\<E\> | Event-System | Event-Name und Payload-Typ verknuepft |
| DI Container | Dependency Injection | Token\<T\> traegt den Service-Typ |

---

## Lektionsende

Du hast alle fuenf Sektionen abgeschlossen. Generics sind nicht mehr nur
Typparameter — du hast gesehen, wie sie ganze Architektur-Patterns
typsicher machen.

> **Naechster Schritt:** Arbeite die Examples (`examples/`) durch, loese die
> Exercises (`exercises/`) und teste dein Wissen mit `npx tsx quiz.ts`.
>
> **Naechste Lektion:** 15 — Utility Types Deep Dive
