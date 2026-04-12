# Section 4: Repository Pattern and Data Access

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Behavioral Patterns](./03-behavioral-patterns.md)
> Next section: [05 - SOLID with TypeScript](./05-solid-mit-typescript.md)

---

## What you'll learn here

- Why the **Repository Pattern** is the most important enterprise pattern for Angular developers
- How a **generic repository interface** is expressed in a type-safe way in TypeScript
- How an **in-memory repository** implements the same contract and makes testing easy
- How the **Unit of Work Pattern** groups multiple operations together transactionally

---

## Background: The lie of direct database access

1997. Martin Fowler and his team are working on an enterprise project. SQL queries are
scattered directly throughout the business logic. When the database schema changes — and
it always does — everything breaks apart. They search for a better way.

The solution: a layer that hides data access behind a clean interface.
**Business logic should not know whether data comes from a Postgres database, an
in-memory cache, or an API.** It should simply call `findById('123')` and get back a
`User` object.

Fowler called it "Repository" in his book "Patterns of Enterprise Application
Architecture" (2002). Since then it has been standard in every serious project.

In TypeScript this pattern takes on a new dimension: generics allow a
*generic* repository interface that works for all entities. And the
structural type system allows swapping out the implementation without changing
the calling code — perfect for tests.

> 🧠 **Explain to yourself:** What is the difference between a repository and
> a service? Both are classes, both have methods. What is the deciding
> criterion?
> **Key points:** Repository = data access (CRUD) | Service = business logic |
> Repository has no business knowledge | Service orchestrates repositories |
> Separation principle: "Single Responsibility"

---

## The generic repository interface

TypeScript generics allow an interface that works for any entity.
This is the first advantage over Java: no `UserRepository extends BaseRepository<User>` —
the interface itself is generic.

```typescript annotated
// The central interface — parameterized over entity and ID type
interface Repository<TEntity, TId = string> {
  // ^ TId = string: default type parameter — most IDs are strings
  findById(id: TId): Promise<TEntity | null>;
  // ^ null instead of exception when not found — explicit and TypeScript-idiomatic
  findAll(filter?: Partial<TEntity>): Promise<TEntity[]>;
  // ^ Partial<TEntity>: all properties optional — filter can be anything
  save(entity: TEntity): Promise<TEntity>;
  // ^ save() does both: insert (new) and update (existing)
  // Convention: entity has an 'id' property — if present: update, otherwise: insert
  delete(id: TId): Promise<void>;
}

// Entity — always has an ID
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'cancelled';
}

// Each repository implements the same interface — different types
type UserRepository = Repository<User>;
type OrderRepository = Repository<Order>;
// Type aliases make the code more readable without boilerplate classes
```

> 💭 **Think about it:** Why does `save()` use the same type for insert and update instead of
> two separate methods `insert()` and `update()`?
>
> **Answer:** "Save" (also: "upsert") is idiomatic because the caller often doesn't
> know — and shouldn't need to know — whether an object is new or already exists.
> This reduces the caller's responsibility. Internally the repository can check:
> Is an ID present? Update. Otherwise: insert.

---

## Concrete implementation: Angular HTTP repository

In Angular, a service implements the repository interface against a REST API.
This is the real value: the repository interface defines the contract, the concrete
class knows how to fulfill it.

```typescript annotated
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
class HttpUserRepository implements Repository<User> {
  // ^ implements Repository<User>: TypeScript checks all 4 methods
  private readonly baseUrl = '/api/users';

  constructor(private readonly http: HttpClient) {}

  findById(id: string): Promise<User | null> {
    return firstValueFrom(
      this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
        catchError(() => of(null)),
        // ^ HTTP 404 -> return null instead of exception (repository convention)
      ),
    );
  }

  findAll(filter?: Partial<User>): Promise<User[]> {
    const params = filter ? this.toQueryParams(filter) : {};
    return firstValueFrom(
      this.http.get<User[]>(this.baseUrl, { params }),
    );
  }

  save(user: User): Promise<User> {
    if (user.id) {
      // Update: PUT with complete object (or PATCH for partial)
      return firstValueFrom(this.http.put<User>(`${this.baseUrl}/${user.id}`, user));
    } else {
      // Insert: POST — backend assigns the ID
      return firstValueFrom(this.http.post<User>(this.baseUrl, user));
    }
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`),
    );
  }

  private toQueryParams(filter: Partial<User>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(filter)
        .filter(([, value]) => value !== undefined)
        // ^ TS 5.5 Inferred Type Predicates: filter returns Record<string, string>[]
        .map(([key, value]) => [key, String(value)]),
    );
  }
}
```

---

## In-memory repository — the real value of the pattern

This is the moment where the repository pattern shows its true value: an
in-memory repository implements the *same interface* as the HTTP repository.
Your tests need no HTTP mock library, no TestBed, no server.

```typescript annotated
// In-memory implementation — for tests only (and prototypes)
class InMemoryUserRepository implements Repository<User> {
  private data: Map<string, User>;

  constructor(initialData: User[] = []) {
    // Map for O(1) access by ID instead of O(n) array search
    this.data = new Map(initialData.map(u => [u.id, u]));
  }

  async findById(id: string): Promise<User | null> {
    return this.data.get(id) ?? null;
    // ^ Nullish coalescing: undefined -> null (repository convention)
  }

  async findAll(filter?: Partial<User>): Promise<User[]> {
    const all = Array.from(this.data.values());
    if (!filter) return all;
    // Filters by all specified properties
    return all.filter(user =>
      Object.entries(filter).every(([key, value]) =>
        user[key as keyof User] === value,
      ),
    );
  }

  async save(user: User): Promise<User> {
    const saved = { ...user, id: user.id || crypto.randomUUID() };
    // ^ Generate new ID if none present — browser-native crypto.randomUUID()
    this.data.set(saved.id, saved);
    return saved;
  }

  async delete(id: string): Promise<void> {
    this.data.delete(id);
    // No error if ID doesn't exist — idempotent (multiple deletes = ok)
  }

  // Helper method for tests: inspect current state
  snapshot(): User[] {
    return Array.from(this.data.values());
  }
}

// Test without Angular TestBed:
async function testUserService() {
  const repo = new InMemoryUserRepository([
    { id: '1', name: 'Anna', email: 'anna@example.com', createdAt: new Date() },
  ]);
  // Same service code — just with a different repository
  const service = new UserService(repo);
  const user = await service.findUserByEmail('anna@example.com');
  console.assert(user?.name === 'Anna');
}
```

> ⚡ **Angular reference:** In Angular tests you can pass the in-memory repository as a
> provider:
>
> ```typescript
> TestBed.configureTestingModule({
>   providers: [
>     UserService,
>     { provide: UserRepository, useClass: InMemoryUserRepository },
>     // ^ No HttpClientTestingModule needed — no HTTP is made
>   ],
> });
> ```

---

## Experiment box: Building a generic repository yourself

Paste this code into the TypeScript Playground — it is self-contained:

```typescript
interface Entity { id: string; }

interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: Omit<T, 'id'> & { id?: string }): Promise<T>;
  delete(id: string): Promise<void>;
}

interface Product extends Entity {
  name: string;
  price: number;
  category: string;
}

class InMemoryRepository<T extends Entity> implements Repository<T> {
  private store = new Map<string, T>();

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<T[]> {
    return [...this.store.values()];
  }

  async save(entity: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const saved = { ...entity, id: entity.id ?? crypto.randomUUID() } as T;
    this.store.set(saved.id, saved);
    return saved;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

// Type-safe usage — InMemoryRepository<Product> knows all Product fields
const productRepo = new InMemoryRepository<Product>();
const saved = await productRepo.save({ name: 'Laptop', price: 999, category: 'Electronics' });
console.log(saved.id);    // UUID — assigned automatically
console.log(saved.name);  // 'Laptop' — TypeScript knows: saved is Product

// Try: productRepo.save({ name: 'Laptop' })
// TypeScript reports: missing 'price' and 'category'
```

---

## What you've learned

- The **repository interface** decouples business logic from data access — TypeScript generics
  allow a single interface for all entities
- **HttpUserRepository** implements the contract against a REST API — Angular's HttpClient
  and `firstValueFrom()` make it idiomatic
- **InMemoryUserRepository** implements the same contract — tests need no TestBed,
  no HTTP, no mock setup
- The pattern only pays off when you have at least two implementations —
  the real one and the test implementation

**Core concept:** The Repository Pattern is the answer to "How do I test code that accesses
a database?" The answer is: give the code an interface instead of a concrete class. Then
you can swap the implementation at any time.

> 🧠 **Explain to yourself:** What would be the disadvantage of using an abstract base class
> instead of an interface? When might an abstract class still make sense?
> **Key points:** Interface = more flexibility (no inheritance required) |
> Abstract class = shared implementation | TypeScript allows only one base class |
> Interfaces can be implemented multiple times

---

> **Break point** — The Repository Pattern is one of the most important enterprise patterns
> and directly applicable in your Angular projects. The in-memory repository will
> drastically simplify your tests.
>
> Continue with: [Section 05: SOLID with TypeScript](./05-solid-mit-typescript.md)