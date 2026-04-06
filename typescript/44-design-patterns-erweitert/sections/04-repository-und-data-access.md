# Sektion 4: Repository Pattern und Data Access

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Behavioral Patterns](./03-behavioral-patterns.md)
> Naechste Sektion: [05 - SOLID mit TypeScript](./05-solid-mit-typescript.md)

---

## Was du hier lernst

- Warum das **Repository Pattern** das wichtigste Enterprise-Pattern fuer Angular-Entwickler ist
- Wie ein **generisches Repository-Interface** in TypeScript typsicher formuliert wird
- Wie ein **In-Memory-Repository** denselben Vertrag implementiert und Tests einfach macht
- Wie das **Unit of Work Pattern** mehrere Operationen transaktional zusammenfasst

---

## Hintergrund: Die Luege der direkten Datenbankanbindung

1997. Martin Fowler und sein Team arbeiten an einem Enterprise-Projekt. Ueberall im Code
stehen SQL-Queries direkt in Businesslogik. Wenn sich das Datenbankschema aendert — und
es aendert sich immer — bricht alles zusammen. Sie suchen nach einem besseren Weg.

Die Loesung: Ein Layer, der den Datenzugriff hinter einem sauberen Interface versteckt.
**Die Businesslogik soll nicht wissen, ob Daten aus einer Postgres-Datenbank, einem
In-Memory-Cache oder einer API kommen.** Sie soll nur `findById('123')` aufrufen und ein
`User`-Objekt zurueckbekommen.

Fowler nannte es "Repository" in seinem Buch "Patterns of Enterprise Application
Architecture" (2002). Seitdem ist es Standard in jedem ernsthaften Projekt.

In TypeScript bekommt dieses Pattern eine neue Dimension: Generics erlauben ein
*generisches* Repository-Interface, das fuer alle Entitaeten funktioniert. Und das
strukturelle Typsystem erlaubt das Austauschen der Implementierung ohne Aenderung
des aufrufenden Codes — perfekt fuer Tests.

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen einem Repository und
> einem Service? Beide sind Klassen, beide haben Methoden. Was ist das entscheidende
> Kriterium?
> **Kernpunkte:** Repository = Datenzugriff (CRUD) | Service = Businesslogik |
> Repository hat kein Business-Wissen | Service orchestriert Repositories |
> Trennungsprinzip: "Single Responsibility"

---

## Das generische Repository-Interface

TypeScript-Generics erlauben ein Interface, das fuer jede Entitaet funktioniert.
Das ist der erste Vorteil gegenueber Java: Kein `UserRepository extends BaseRepository<User>` —
das Interface selbst ist generisch.

```typescript annotated
// Das zentrale Interface — parametrisch ueber Entitaet und ID-Typ
interface Repository<TEntity, TId = string> {
  // ^ TId = string: Default-Typparameter — die meisten IDs sind strings
  findById(id: TId): Promise<TEntity | null>;
  // ^ null statt Exception wenn nicht gefunden — expliziter und TypeScript-idiomatisch
  findAll(filter?: Partial<TEntity>): Promise<TEntity[]>;
  // ^ Partial<TEntity>: Alle Properties optional — filter kann alles sein
  save(entity: TEntity): Promise<TEntity>;
  // ^ save() macht beides: insert (neu) und update (bestehend)
  // Konvention: Entitaet hat eine 'id'-Property — wenn vorhanden: update, sonst: insert
  delete(id: TId): Promise<void>;
}

// Entitaet — hat immer eine ID
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

// Jedes Repository implementiert dasselbe Interface — verschiedene Typen
type UserRepository = Repository<User>;
type OrderRepository = Repository<Order>;
// Typalias machen den Code lesbarer ohne Boilerplate-Klassen
```

> 💭 **Denkfrage:** Warum hat `save()` denselben Typ fuer Insert und Update statt
> zwei getrennter Methoden `insert()` und `update()`?
>
> **Antwort:** "Save" (auch: "Upsert") ist idiomatisch, weil der Aufrufer oft nicht
> weiss — und nicht wissen soll — ob ein Objekt neu ist oder bereits existiert.
> Das reduziert die Verantwortung des Aufrufers. Intern kann das Repository pruefen:
> Ist eine ID vorhanden? Update. Sonst: Insert.

---

## Konkrete Implementierung: Angular HTTP-Repository

In Angular implementiert ein Service das Repository-Interface gegen eine REST-API.
Das ist der echte Wert: Das Repository-Interface definiert den Vertrag, die konkrete
Klasse weiss wie sie ihn erfullt.

```typescript annotated
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
class HttpUserRepository implements Repository<User> {
  // ^ implements Repository<User>: TypeScript prueft alle 4 Methoden
  private readonly baseUrl = '/api/users';

  constructor(private readonly http: HttpClient) {}

  findById(id: string): Promise<User | null> {
    return firstValueFrom(
      this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
        catchError(() => of(null)),
        // ^ HTTP 404 -> null zurueckgeben statt Exception (Repository-Konvention)
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
      // Update: PUT mit vollstaendigem Objekt (oder PATCH fuer Partial)
      return firstValueFrom(this.http.put<User>(`${this.baseUrl}/${user.id}`, user));
    } else {
      // Insert: POST — Backend vergibt die ID
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
        // ^ TS 5.5 Inferred Type Predicates: filter gibt Record<string, string>[] zurueck
        .map(([key, value]) => [key, String(value)]),
    );
  }
}
```

---

## In-Memory-Repository — der echte Wert des Patterns

Das ist der Moment, wo das Repository-Pattern seinen wahren Wert zeigt: Ein
In-Memory-Repository implementiert *dasselbe Interface* wie das HTTP-Repository.
Deine Tests brauchen keine HTTP-Mock-Bibliothek, kein TestBed, keinen Server.

```typescript annotated
// In-Memory-Implementierung — nur fuer Tests (und Prototypen)
class InMemoryUserRepository implements Repository<User> {
  private data: Map<string, User>;

  constructor(initialData: User[] = []) {
    // Map fuer O(1)-Zugriff per ID statt O(n) Array-Suche
    this.data = new Map(initialData.map(u => [u.id, u]));
  }

  async findById(id: string): Promise<User | null> {
    return this.data.get(id) ?? null;
    // ^ Nullish Coalescing: undefined -> null (Repository-Konvention)
  }

  async findAll(filter?: Partial<User>): Promise<User[]> {
    const all = Array.from(this.data.values());
    if (!filter) return all;
    // Filtert nach allen angegeben Properties
    return all.filter(user =>
      Object.entries(filter).every(([key, value]) =>
        user[key as keyof User] === value,
      ),
    );
  }

  async save(user: User): Promise<User> {
    const saved = { ...user, id: user.id || crypto.randomUUID() };
    // ^ Neue ID generieren wenn keine vorhanden — Browser-native crypto.randomUUID()
    this.data.set(saved.id, saved);
    return saved;
  }

  async delete(id: string): Promise<void> {
    this.data.delete(id);
    // Kein Fehler wenn ID nicht existiert — idempotent (mehrfaches delete = ok)
  }

  // Hilfsmethode fuer Tests: aktuellen Zustand inspizieren
  snapshot(): User[] {
    return Array.from(this.data.values());
  }
}

// Test ohne Angular TestBed:
async function testUserService() {
  const repo = new InMemoryUserRepository([
    { id: '1', name: 'Anna', email: 'anna@example.com', createdAt: new Date() },
  ]);
  // Derselbe Service-Code — nur mit anderem Repository
  const service = new UserService(repo);
  const user = await service.findUserByEmail('anna@example.com');
  console.assert(user?.name === 'Anna');
}
```

> ⚡ **Angular-Bezug:** In Angular-Tests kannst du das In-Memory-Repository als
> Provider uebergeben:
>
> ```typescript
> TestBed.configureTestingModule({
>   providers: [
>     UserService,
>     { provide: UserRepository, useClass: InMemoryUserRepository },
>     // ^ Kein HttpClientTestingModule noetig — kein HTTP wird gemacht
>   ],
> });
> ```

---

## Experiment-Box: Generisches Repository selbst aufbauen

Fuege diesen Code in den TypeScript Playground ein — er ist self-contained:

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

// Typsichere Verwendung — InMemoryRepository<Product> kennt alle Product-Felder
const productRepo = new InMemoryRepository<Product>();
const saved = await productRepo.save({ name: 'Laptop', price: 999, category: 'Electronics' });
console.log(saved.id);    // UUID — automatisch vergeben
console.log(saved.name);  // 'Laptop' — TypeScript weiss: saved ist Product

// Probiere: productRepo.save({ name: 'Laptop' })
// TypeScript meldet: Fehlendes 'price' und 'category'
```

---

## Was du gelernt hast

- Das **Repository-Interface** entkoppelt Businesslogik von Datenzugriff — TypeScript-Generics
  erlauben ein einziges Interface fuer alle Entitaeten
- **HttpUserRepository** implementiert den Vertrag gegen eine REST-API — Angular's HttpClient
  und `firstValueFrom()` machen es idiomatisch
- **InMemoryUserRepository** implementiert denselben Vertrag — Tests brauchen kein TestBed,
  kein HTTP, kein Mock-Setup
- Das Pattern lohnt sich erst dann, wenn du mindestens zwei Implementierungen hast —
  die echte und die Test-Implementierung

**Kernkonzept:** Das Repository Pattern ist die Antwort auf "Wie teste ich Code der auf
eine Datenbank zugreift?" Die Antwort ist: Gib dem Code ein Interface statt einer
konkreten Klasse. Dann kannst du jederzeit die Implementierung austauschen.

> 🧠 **Erklaere dir selbst:** Was waere der Nachteil wenn du statt eines Interfaces
> eine abstrakte Basisklasse verwendest? Wann koennte eine abstrakte Klasse trotzdem
> sinnvoll sein?
> **Kernpunkte:** Interface = mehr Flexibilitaet (keine Vererbung noetig) |
> Abstrakte Klasse = geteilte Implementierung | TypeScript erlaubt nur eine Basisklasse |
> Interfaces koennen mehrfach implementiert werden

---

> **Pausenpunkt** — Das Repository Pattern ist eines der wichtigsten Enterprise-Patterns
> und direkt in deinen Angular-Projekten anwendbar. Das In-Memory-Repository wird
> deine Tests drastisch vereinfachen.
>
> Weiter geht es mit: [Sektion 05: SOLID mit TypeScript](./05-solid-mit-typescript.md)
