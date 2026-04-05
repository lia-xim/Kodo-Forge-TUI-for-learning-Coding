# Sektion 3: Generische Interfaces und Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Generische Funktionen](./02-generische-funktionen.md)
> Naechste Sektion: [04 - Constraints](./04-constraints.md)

---

## Was du hier lernst

- Wie du Interfaces mit Typparametern erstellst
- Generic Type Aliases und wann sie sinnvoll sind
- Warum `Array<T>` und `Promise<T>` generisch sind
- Generische Typen mit mehreren Parametern

---

> 📖 **Hintergrund: Das Wrapper-Problem in der Softwareentwicklung**
>
> Eine der aeltesten Herausforderungen in der Softwareentwicklung:
> Du hast einen allgemeinen Container (HTTP-Response, Array, Promise,
> Future) und musst ihn typsicher mit beliebigen Inhalten verwenden.
>
> In den 1990ern loeste C++ das mit *Template Classes*: `vector<int>`,
> `list<string>`. Der Compiler erzeugte fuer jeden konkreten Typ eine
> eigene Version der Klasse. Das funktionierte, fuehrte aber zu
> **Code-Bloat** — riesige Binaries mit vielen fast-identischen Klassen.
>
> Java und C# waehlten 2004 einen anderen Weg: Generics als
> Compilezeit-Konzept, die zur Laufzeit auf einen einzelnen Typ reduziert
> werden (Type Erasure in Java) oder als echte Runtime-Typen bleiben (C#).
>
> TypeScript's Ansatz kombiniert das Beste: Compilezeit-Sicherheit wie Java,
> strukturelle Typisierung fuer maximale Flexibilitaet, und kein Laufzeit-
> Overhead weil TypeScript sowieso zu JavaScript kompiliert.
>
> **Das Ergebnis:** `interface Box<T>` — eine einzige Definition, unendlich
> viele typsichere Verwendungen. Kein Code-Bloat, keine Laufzeit-Kosten.

---

## Generische Interfaces

Nicht nur Funktionen koennen generisch sein — auch Interfaces:

```typescript annotated
interface Box<T> {
  content: T;
  label: string;
}

const stringBox: Box<string> = {
  content: "Hallo Welt",
  label: "Begruessung",
};
// ^ Box<string> — content ist string

const numberBox: Box<number> = {
  content: 42,
  label: "Die Antwort",
};
// ^ Box<number> — content ist number

const userBox: Box<{ name: string; age: number }> = {
  content: { name: "Max", age: 30 },
  label: "Benutzer",
};
// ^ Box mit komplexem Typ — alles typsicher
```

Das Interface `Box<T>` ist eine **Schablone**. Erst wenn du `T` durch einen
konkreten Typ ersetzt, entsteht ein vollstaendiger Typ.

---

## API-Response — das klassische Beispiel

Fast jede API gibt Daten in einer gemeinsamen Huelle zurueck:

```typescript annotated
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

// Verschiedene Endpunkte, gleiche Struktur:
type UserResponse = ApiResponse<{ id: number; name: string; email: string }>;
type ProductResponse = ApiResponse<{ id: number; title: string; price: number }>;
type ListResponse = ApiResponse<{ items: string[]; total: number }>;

// Funktion die generische Responses verarbeitet:
function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.status >= 400) {
    throw new Error(response.message);
  }
  return response.data;
}
```

Die Struktur (`status`, `message`, `timestamp`) ist immer gleich — nur
`data` aendert sich. Genau das modellieren Generics perfekt.

---

## Generische Type Aliases

Type Aliases funktionieren genauso:

```typescript annotated
// Einfacher generischer Type Alias
type Nullable<T> = T | null;

const name: Nullable<string> = "Max";    // string | null
const age: Nullable<number> = null;       // number | null

// Result-Type fuer Fehlerbehandlung
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: "Division durch Null" };
  }
  return { success: true, data: a / b };
}

const result = divide(10, 3);
if (result.success) {
  console.log(result.data); // number — TypeScript weiss es!
} else {
  console.log(result.error); // string
}
```

---

## Array<T> — das Generikum das du schon kennst

Du hast Generics bereits benutzt — du wusstest es nur nicht:

```typescript annotated
// Diese beiden Schreibweisen sind IDENTISCH:
const a: number[] = [1, 2, 3];
const b: Array<number> = [1, 2, 3];

// number[] ist nur Syntactic Sugar fuer Array<number>
// TypeScript uebersetzt intern: number[] → Array<number>
```

Die TypeScript-Standardbibliothek definiert Array als generisches Interface:

```typescript annotated
// Vereinfacht aus lib.es5.d.ts:
interface Array<T> {
  length: number;
  push(...items: T[]): number;
  pop(): T | undefined;
  map<U>(fn: (value: T, index: number) => U): U[];
  filter(fn: (value: T) => boolean): T[];
  find(fn: (value: T) => boolean): T | undefined;
  // ... viele weitere Methoden
}
```

Jede Array-Methode nutzt `T` — deshalb weiss TypeScript,
dass `[1,2,3].map(n => String(n))` ein `string[]` ergibt.

---

## Mehrere Typparameter bei Interfaces

Interfaces koennen mehrere Typparameter haben:

```typescript annotated
interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

const setting: KeyValuePair<string, number> = {
  key: "maxRetries",
  value: 3,
};

const entry: KeyValuePair<number, string> = {
  key: 1,
  value: "eins",
};

// Praxis-Beispiel: Paginierte API
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

type UserPage = PaginatedResponse<{ id: number; name: string }>;
type ProductPage = PaginatedResponse<{ id: number; title: string; price: number }>;
```

---

> 💭 **Denkfrage:** Du siehst in einem Codebase diese zwei Definitionen:
>
> ```typescript
> // Version A:
> interface UserApiResponse { data: User; status: number; message: string; }
> interface ProductApiResponse { data: Product; status: number; message: string; }
>
> // Version B:
> interface ApiResponse<T> { data: T; status: number; message: string; }
> ```
>
> Stell dir vor, die API aendert das Response-Format — `message` wird zu
> `errorMessage`, und es kommt ein `requestId`-Feld dazu. **Wie viele
> Dateien musst du in Version A aendern vs. Version B?**
>
> Das ist das DRY-Prinzip (Don't Repeat Yourself) auf der Typ-Ebene.
> Mit `ApiResponse<T>` aenderst du **eine** Stelle. Mit separaten Interfaces
> aenderst du jedes einzeln — und vergisst garantiert eines.

---

## Generische Interfaces fuer Funktionstypen

Du kannst auch den Typ einer Funktion generisch beschreiben:

```typescript annotated
// Generisches Interface fuer eine Vergleichsfunktion
interface Comparator<T> {
  (a: T, b: T): number;
}

const numberCompare: Comparator<number> = (a, b) => a - b;
const stringCompare: Comparator<string> = (a, b) => a.localeCompare(b);

// Generisches Interface fuer einen Repository-Pattern
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Verschiedene Repositories mit dem gleichen Interface:
// class UserRepository implements Repository<User> { ... }
// class ProductRepository implements Repository<Product> { ... }
```

Das Repository-Pattern zeigt die Staerke: **Eine Interface-Definition,
beliebig viele typsichere Implementierungen.**

---

## Interface vs. Type Alias bei Generics

Beide funktionieren. Die Wahl folgt denselben Regeln wie ohne Generics:

```typescript annotated
// Interface: Fuer Objekt-Shapes, erweiterbar
interface Container<T> {
  value: T;
  transform<U>(fn: (value: T) => U): Container<U>;
}

// Type Alias: Fuer Unions, Intersections, Utility Types
type MaybePromise<T> = T | Promise<T>;
type ReadonlyDeep<T> = {
  readonly [K in keyof T]: ReadonlyDeep<T[K]>;
};
```

| Feature | Interface | Type Alias |
|---------|-----------|------------|
| Objekt-Shapes | Bevorzugt | Moeglich |
| Unions/Intersections | Nicht moeglich | Bevorzugt |
| Declaration Merging | Ja | Nein |
| Mapped Types | Nein | Ja |

---

## In deinem Angular-Projekt: Generische Interfaces in der Praxis

Das Repository-Pattern und das Response-Wrapper-Pattern gehoeren zu den
haeufigsten Generics-Anwendungen in Angular:

```typescript annotated
// Ein generischer Service-Layer fuer alle Entitaeten:
interface CrudService<T, TCreate = Omit<T, 'id'>> {
  getAll(): Observable<T[]>;
  getById(id: number): Observable<T>;
  create(data: TCreate): Observable<T>;
  update(id: number, data: Partial<T>): Observable<T>;
  delete(id: number): Observable<void>;
}

// user.service.ts — nur die User-spezifischen Teile:
@Injectable({ providedIn: 'root' })
class UserService implements CrudService<User> {
  getAll() { return this.http.get<User[]>('/api/users'); }
  // ... TypeScript prueft, dass ALLE Interface-Methoden implementiert werden
}

// product.service.ts — identische Struktur, anderer Typ:
@Injectable({ providedIn: 'root' })
class ProductService implements CrudService<Product> {
  getAll() { return this.http.get<Product[]>('/api/products'); }
  // ...
}
```

**In React:**

```typescript
// Ein generischer List-Component fuer alle Entitaeten:
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

function GenericList<T>({ items, renderItem, keyExtractor, emptyMessage = "Keine Eintraege" }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyMessage}</p>;
  return <ul>{items.map((item, i) => <li key={keyExtractor(item)}>{renderItem(item, i)}</li>)}</ul>;
}

// Verwendung — TypeScript inferiert T:
<GenericList
  items={users}
  renderItem={u => <span>{u.name}</span>}
  keyExtractor={u => u.id}
/>
// T = User — automatisch inferiert aus items={users}
```

---

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> // Generischer Cache mit Ablaufzeit:
> interface CacheEntry<T> {
>   value: T;
>   expiresAt: number;
> }
>
> class Cache<T> {
>   private store = new Map<string, CacheEntry<T>>();
>
>   set(key: string, value: T, ttlMs: number): void {
>     this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
>   }
>
>   get(key: string): T | null {
>     const entry = this.store.get(key);
>     if (!entry || entry.expiresAt < Date.now()) return null;
>     return entry.value;
>   }
> }
>
> const userCache = new Cache<{ id: number; name: string }>();
> userCache.set("user-1", { id: 1, name: "Max" }, 5000);
> const user = userCache.get("user-1");
> // Was ist der Typ von user? Hovere im Playground darueber.
> ```
>
> Aendere dann `new Cache<{ id: number; name: string }>()` zu `new Cache()` —
> was sagt TypeScript? Und was passiert bei `userCache.set("x", 42, 1000)`?

---

## Was du gelernt hast

- Generische Interfaces `interface Name<T>` sind Schablonen — erst mit konkretem Typ vollstaendig
- `ApiResponse<T>` ist das klassische Beispiel: Gleiche Huelle, verschiedene Daten
- Type Aliases `type Name<T>` funktionieren genau so — besser fuer Unions und Mapped Types
- `number[]` ist Syntactic Sugar fuer `Array<number>` — du hast Generics schon die ganze Zeit benutzt
- Das Repository-Pattern (`interface Repository<T>`) ist ein Generics-Paradebeispiel

**Kernkonzept:** Generische Interfaces bringen DRY auf die Typ-Ebene. Statt `UserApiResponse`, `ProductApiResponse`, `OrderApiResponse` schreibst du `ApiResponse<T>` — eine Definition, die mit jedem Typ funktioniert und trotzdem volle Typsicherheit garantiert.

---

## Zusammenfassung

| Konzept | Syntax | Beispiel |
|---------|--------|----------|
| Generic Interface | `interface Name<T>` | `interface Box<T> { content: T }` |
| Generic Type Alias | `type Name<T>` | `type Nullable<T> = T \| null` |
| Mehrere Parameter | `<K, V>` | `interface Map<K, V>` |
| Array-Schreibweise | `T[]` = `Array<T>` | `number[]` = `Array<number>` |

---

> 🧠 **Erklaere dir selbst:** Warum ist `ApiResponse<T>` besser als
> separate Interfaces `UserApiResponse`, `ProductApiResponse`, etc.?
> **Kernpunkte:** DRY-Prinzip | Aenderungen an der Struktur nur einmal noetig | Funktionen die generische Responses verarbeiten

---

> **Pausenpunkt** — Gut? Dann weiter zu [Sektion 04: Constraints](./04-constraints.md)
