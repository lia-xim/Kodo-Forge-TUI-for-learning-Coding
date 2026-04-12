# Section 5: Real-World Generics

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Advanced Constraints](./04-generic-constraints-advanced.md)
> Next section: -- (end of lesson)

---

## What you'll learn here

- API Client\<T\> for type-safe HTTP calls — no more `any`
- Repository Pattern for generic CRUD: write once, use everywhere
- EventEmitter\<Events\> with type-safe event payloads
- DI Container with generic `resolve<T>()` — the cornerstone of modern frameworks

---

## Background: How React Hook Form popularized Generics

In 2019, React Hook Form solved an old problem: form libraries like Formik
or Redux Form were either type-unsafe or required a frightening amount of
boilerplate. React Hook Form brought a radical solution:

```typescript
const { register, handleSubmit } = useForm<LoginForm>();
```

A single generic `<LoginForm>` and suddenly TypeScript knew that
`register("email")` was valid, but `register("typo")` was a compile error.
`handleSubmit` returned a fully typed callback. In 2019, this was a moment
when many developers "felt" the power of Generics rather than just
understood it.

You now know the pattern behind it: a generic parameter is specified once at
the "entry point" (the hook) and then flows through ALL operations.
The four patterns in this section work on the same principle —
one type parameter, type-safe everywhere.

---

## API Client\<T\> — Type-Safe HTTP Calls

Every web application makes HTTP requests. Without Generics, the responses
are `unknown` or `any`. With Generics, the compiler knows exactly what
comes back:

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

// Usage:
interface User { id: number; name: string; email: string }
interface CreateUserDto { name: string; email: string }

const api = new ApiClient("https://api.example.com");

const users = await api.get<User[]>("/users");
// ^ Type: User[] — not unknown!
users[0].name; // Full autocomplete

const newUser = await api.post<CreateUserDto, User>(
  "/users",
  { name: "Max", email: "max@example.com" }
);
// ^ Type: User — the server returns the created user
```

### Type-Safe Route Map

The next level: a map that links routes with request/response types:

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
// ^ Type: User[] — inferred from the route map!
```

> 🧠 **Explain it to yourself:** What advantage does the route map have over
> the simple `get<T>()` pattern?
> **Key points:** Route map: type is automatically inferred from the path | No need to manually specify T | Wrong combinations are caught at compile time

> ⚡ **Angular connection:** Angular's `HttpClient` implements exactly this pattern.
> `this.http.get<User[]>('/api/users')` is `ApiClient.get<User[]>` —
> you specify the type explicitly, and `HttpClient` returns `Observable<User[]>`.
> The difference from the route map: HttpClient is generic without
> route-map constraints, because Angular apps often use dynamic URLs.
> With NestJS clients or tRPC you get the route-map variant.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> interface Routes {
>   "/ping": { response: { status: "ok" }; body: never };
>   "/echo": { response: { message: string }; body: { message: string } };
> }
>
> async function request<P extends keyof Routes>(
>   path: P,
>   body: Routes[P]["body"] extends never ? undefined : Routes[P]["body"]
> ): Promise<Routes[P]["response"]> {
>   // The real fetch call would go here
>   return null as any;
> }
>
> // What does TypeScript infer for the return type?
> const ping = await request("/ping", undefined);
> const echo = await request("/echo", { message: "hello" });
>
> // What happens if you try: request("/ping", { message: "x" })?
> ```

---

## Repository Pattern — Generic CRUD

The Repository Pattern abstracts data access. With Generics you write
the CRUD logic ONCE and use it for every entity:

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

// In-memory implementation — same logic for every type:
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

Usage for different entities:

```typescript annotated
interface User extends Entity { name: string; email: string }
interface Product extends Entity { title: string; price: number }

const userRepo = new InMemoryRepository<User>();
const productRepo = new InMemoryRepository<Product>();

const user = await userRepo.create({ name: "Max", email: "max@test.com" });
// ^ Type: User — with id, name, email

const product = await productRepo.create({ title: "Laptop", price: 999 });
// ^ Type: Product — with id, title, price

await userRepo.update(user.id, { name: "Maximilian" });
// Only User properties — not Product properties!
```

> 📖 **Background: The Repository Pattern in Angular and NestJS**
>
> The Repository Pattern comes from Eric Evans' "Domain-Driven Design" (2003).
> In Angular projects it is typically implemented via services:
> `UserService` encapsulates all HTTP calls to `/api/users`, `ProductService`
> those to `/api/products`. With Generics you can write a `BaseService<T extends
> Entity>` that implements the entire CRUD interface — and only
> override the API URL in the concrete class. TypeORM and Prisma
> (for NestJS) use the same pattern internally.

> 💭 **Think about it:** `InMemoryRepository<T>` works for tests and
> prototypes. For production you need an `HttpRepository<T>` or
> `DatabaseRepository<T>`. Both can implement `Repository<T>`.
> What advantage is there in using the `Repository<T>` interface
> instead of the concrete class as the type in Angular services?
> And how does this connect to `InjectionToken<T>`?

---

## EventEmitter\<Events\> — Type-Safe Events

An EventEmitter without Generics accepts any event name with any payload.
With Generics you enforce: every event has its defined data type.

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

    // Return unsubscribe function
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

Usage:

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
  // data has type { userId: string; timestamp: Date } — automatically!
});

emitter.emit("user:login", {
  userId: "123",
  timestamp: new Date(),
});

// emitter.emit("user:login", { wrong: true });
// Error! { wrong: boolean } is not { userId: string; timestamp: Date }
```

> ⚡ **React connection:** React itself uses type-safe events through the
> `SyntheticEvent<T>` hierarchy. `onChange` on an `<input>` returns
> `React.ChangeEvent<HTMLInputElement>` — no manual type annotation needed.
> Custom event systems (e.g. with `useReducer` and action types) follow
> exactly the `TypedEventEmitter` pattern: the `dispatch` type is a
> type-safe version of `emit`.

---

## DI Container — Dependency Injection with Generics

Dependency Injection (DI) containers are the foundation of modern frameworks
(Angular, NestJS). With Generics, `resolve<T>()` can return the correct type
— without casts.

```typescript annotated
// Token: a unique key for a service
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

// Define tokens:
const DATABASE = new Token<DatabaseService>("database");
const LOGGER = new Token<LoggerService>("logger");

class DatabaseService {
  query(sql: string) { return [{ id: 1 }]; }
}

class LoggerService {
  log(msg: string) { console.log(msg); }
}

// Configure the container:
const container = new Container();
container.bind(DATABASE, () => new DatabaseService());
container.bind(LOGGER, () => new LoggerService());

// Resolution — fully type-safe:
const db = container.resolve(DATABASE);
// ^ Type: DatabaseService
db.query("SELECT * FROM users"); // Full autocomplete

const logger = container.resolve(LOGGER);
// ^ Type: LoggerService
logger.log("App started");
```

> **Why Token\<T\>?** The token carries the type `T` as a phantom type.
> `Token<DatabaseService>` and `Token<LoggerService>` are different types.
> During `resolve()`, TypeScript infers `T` from the token — no cast needed.

> ⚡ **Angular connection:** Angular's `InjectionToken<T>` is exactly this pattern.
> ```typescript
> const API_URL = new InjectionToken<string>('api-url');
> // ^ Token<string> — carries string as a phantom type
>
> // In the provider:
> { provide: API_URL, useValue: 'https://api.example.com' }
>
> // In the service:
> constructor(@Inject(API_URL) private apiUrl: string) {}
> // ^ TypeScript knows: apiUrl is string — inferred from the token
> ```
> Angular's entire DI system is a sophisticated version of the
> `Container` pattern above. The `@Inject()` decorator replaces `resolve()`,
> but the type tracking through the token is identical.

---

## What you've learned

- `ApiClient<T>` gives the compiler exactly the type of the HTTP response — not `unknown` or `any`
- A route map links path strings and payload types: a wrong path is a compile error
- The Repository Pattern writes CRUD logic once and uses it for every entity
- `TypedEventEmitter<Events>` makes it impossible to emit the wrong payload
- DI containers use `Token<T>` as phantom types: `resolve()` returns exactly the right type

**Core concept:** Real-world Generics are not an end in themselves — they
shift errors from runtime to compile time. A wrong API response, a
wrong event payload, an unregistered service: with Generics these are
compile errors instead of runtime crashes. That is the primary value of
Generics in production code.

> 🧠 **Explain it to yourself:** All four patterns (ApiClient, Repository,
> EventEmitter, DI Container) share the characteristic that a type parameter
> is "specified once, used everywhere." Why is this better than specifying
> the type at every point of use?
> **Key points:** Specify once = one source of error | Consistency enforced by the compiler | Changes to the type only need to be made in one place

---

> **Pause point** — You have completed all five sections. Generics
> are no longer just type parameters — you've seen how they make entire
> architectural patterns type-safe.
>
> **Next lesson:** 15 — Utility Types Deep Dive