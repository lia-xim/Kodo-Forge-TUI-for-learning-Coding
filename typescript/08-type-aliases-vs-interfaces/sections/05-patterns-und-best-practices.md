# Sektion 5: Patterns und Best Practices

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Entscheidungsmatrix](./04-entscheidungsmatrix.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Warum **Angular Interfaces bevorzugt** und was dahinter steckt
- Warum die **React-Community Types bevorzugt** und warum das Sinn macht
- Reale **Patterns** die beide Konstrukte kombinieren
- Wie du **Team-Konventionen** definierst und durchsetzt

---

## Angular: Interfaces bevorzugt

Das Angular-Team und der offizielle Angular Style Guide empfehlen
`interface` fuer die meisten Objekt-Typen. Die Gruende:

### 1. Service-Contracts und Dependency Injection

Angular's Dependency Injection basiert auf Tokens. Interfaces
beschreiben die Form eines Services — die Klasse implementiert sie:

```typescript annotated
// Angular Style Guide: Interface fuer den Contract
interface UserRepository {
  findById(id: string): Observable<User>;
  findAll(): Observable<User[]>;
  save(user: User): Observable<User>;
}

// Klasse implementiert das Interface
@Injectable({ providedIn: 'root' })
class HttpUserRepository implements UserRepository {
// ^ implements prueft: Hat die Klasse alle Methoden?
  constructor(private http: HttpClient) {}

  findById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
  // ...
}
```

### 2. DTOs und Models

```typescript annotated
// Angular-Konvention: interface fuer Datenstrukturen
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Aber UserRole ist ein Union — hier MUSS es type sein:
type UserRole = "admin" | "editor" | "viewer";
// ^ Kein Widerspruch: Interface fuer Objekte, type fuer Unions.
```

### 3. Warum nicht alles type?

In Angular-Projekten ist `interface` bevorzugt weil:

- **Tradition**: Angular kommt aus der Java/C#-Welt, wo Interfaces
  zentral sind (Dependency Injection, SOLID-Prinzipien)
- **implements**: Angular-Services nutzen `implements` intensiv
- **Declaration Merging**: Angular-Libraries erweitern oft
  vorhandene Interfaces
- **Codegen**: Angular CLI generiert Interfaces, nicht Types

> 📖 **Hintergrund: Angular Style Guide**
>
> Der offizielle Angular Style Guide (angular.io/guide/styleguide)
> empfiehlt explizit:
> - "Do" use interfaces for data models
> - "Do" use interfaces for service contracts
> - "Consider" prefixing interfaces NOT with "I" (also `User`, nicht `IUser`)
>
> Das letzte Punkt ist interessant: In C#/Java ist das "I"-Prefix ueblich
> (`IUserService`). Angular hat sich bewusst dagegen entschieden, weil
> TypeScript's strukturelles Typsystem den Unterschied zwischen Interface
> und Implementierung weniger relevant macht.

---

## React: Types bevorzugt

Die React-Community und das offizielle React-Team nutzen ueberwiegend
`type`. Die Gruende:

### 1. Props sind oft Unions

```typescript annotated
// React-typisch: Props mit Union-Varianten
type ButtonProps = {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "danger";
// ^ Inline Union — nahtlos mit type.
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
};

// Discriminated Union fuer polymorphe Komponenten:
type LinkButtonProps = ButtonProps & { href: string; target?: string };
type SubmitButtonProps = ButtonProps & { form: string };
type ActionButtonProps = LinkButtonProps | SubmitButtonProps;
// ^ Union von Intersections — nur mit type moeglich.
```

### 2. Utility Types sind allgegenwaertig

```typescript annotated
// React-typisch: Utility Types fuer Props
type UserCardProps = Pick<User, "name" | "email"> & {
  showAvatar?: boolean;
};
// ^ Pick ist ein Mapped Type. Das Ergebnis mit & verbinden = type-Welt.

type ReadonlyProps<T> = { readonly [K in keyof T]: T[K] };
// ^ Generischer Mapped Type = nur type.

// Reales Beispiel: Alle Props optional machen fuer Default-Props
type WithDefaults<T, D extends Partial<T>> = Omit<T, keyof D> & Partial<Pick<T, keyof D>>;
```

### 3. React's eigene Typen sind Types

Die offiziellen React-Typ-Definitionen nutzen primaer `type`:

```typescript
// Aus @types/react:
type FC<P = {}> = FunctionComponent<P>;
type ReactNode = ReactElement | string | number | ...;
type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
```

> 📖 **Hintergrund: Warum hat React sich fuer type entschieden?**
>
> React's Typsystem dreht sich um **Komposition**, nicht Vererbung.
> Komponenten erben nicht voneinander — sie werden kombiniert. Und
> Komposition ist genau das, was `type` mit `&` (Intersection) und `|`
> (Union) ausdrueckt.
>
> Zudem sind React-Props oft **kurzlebig**: Sie werden fuer eine
> Komponente definiert und selten wiederverwendet. Declaration Merging
> (das Hauptargument fuer Interfaces) ist in React-Props fast nie noetig.
>
> Matt Pocock (TypeScript-Educator, bekannt fuer "Total TypeScript")
> empfiehlt ebenfalls `type` als Standard in React-Projekten.

---

## Patterns die beide kombinieren

In der Praxis wirst du BEIDE Konstrukte in einem Projekt verwenden.
Hier sind bewaehrte Patterns:

### Pattern 1: Interface fuer Contracts, type fuer Varianten

```typescript annotated
// Interface: Der stabile Contract
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// type: Die Varianten und Unions
type QueryResult<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

type SortDirection = "asc" | "desc";
type SortOption<T> = { field: keyof T; direction: SortDirection };
```

### Pattern 2: Interface fuer Basis, type fuer Ableitungen

```typescript annotated
// Interface: Die Basis-Entity
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface: Erweitert die Basis
interface User extends BaseEntity {
  name: string;
  email: string;
}

// type: Ableitung mit Utility Types
type CreateUserDTO = Omit<User, "id" | "createdAt" | "updatedAt">;
// ^ type weil Omit ein Mapped Type ist.

type UpdateUserDTO = Partial<CreateUserDTO>;
// ^ type weil Partial ein Mapped Type ist.

type UserSummary = Pick<User, "id" | "name">;
// ^ type weil Pick ein Mapped Type ist.
```

### Pattern 3: Declaration Merging + type-Helpers

```typescript annotated
// Interface: Erweiterbar durch Plugins
interface AppConfig {
  port: number;
  host: string;
}

// Plugin A erweitert Config:
interface AppConfig {
  database: { url: string; pool: number };
}

// Plugin B erweitert Config:
interface AppConfig {
  redis: { host: string; port: number };
}

// type: Helper fuer Teilkonfigurationen
type RequiredConfig = Required<AppConfig>;
type ConfigKeys = keyof AppConfig;
// ^ "port" | "host" | "database" | "redis"
```

> 🧠 **Erklaere dir selbst:** Warum ist das Pattern "Interface fuer Basis,
> type fuer Ableitungen" so verbreitet? Koenntest du es komplett ohne
> interface machen?
> **Kernpunkte:** Basis-Entities sind stabile Objekt-Formen (interface-Staerke) |
> Ableitungen nutzen Utility Types (type-Staerke) | Ja, alles mit type
> moeglich, aber extends-Performance und Klarheit gehen verloren

---

## Team-Konventionen definieren

### Variante A: "interface-first" (Angular-Style)

```
Regel: Verwende interface fuer alle Objekt-Typen.
       Verwende type nur wenn noetig (Unions, Mapped Types, etc.).

ESLint: @typescript-eslint/consistent-type-definitions: ["error", "interface"]

Vorteil: Klar und vorhersagbar. Neue Teammitglieder aus Java/C#
         fuehlen sich sofort wohl.
```

### Variante B: "type-first" (React-Style)

```
Regel: Verwende type fuer alles.
       Verwende interface nur fuer Declaration Merging und
       erweiterbare Library-Contracts.

ESLint: @typescript-eslint/consistent-type-definitions: ["error", "type"]

Vorteil: Einheitlich. Kein Nachdenken noetig ob type oder interface.
         Union-Erweiterungen sind nahtlos.
```

### Variante C: "Hybrid" (pragmatisch)

```
Regel: interface fuer Objekt-Formen (DTOs, Services, Entities).
       type fuer Unions, Intersections, Utility-Ableitungen.

ESLint: Keine strikte Regel — Code-Review sichert Konsistenz.

Vorteil: Nutzt die Staerken beider Konstrukte.
Nachteil: Erfordert Urteilsvermoegen — weniger dogmatisch.
```

> ⚡ **Praxis-Tipp:** Dokumentiere deine Konvention in einer
> `CONTRIBUTING.md` oder direkt in der `.eslintrc.json`. Zum Beispiel:
>
> ```markdown
> ## Type Conventions
> - `interface` fuer DTOs, Service-Contracts, und erweiterbare Objekte
> - `type` fuer Unions, Utility-Ableitungen, und Mapped Types
> - Kein "I"-Prefix: `User`, nicht `IUser`
> - Kein "Type"-Suffix: `UserRole`, nicht `UserRoleType`
> ```

---

## Anti-Patterns

### Anti-Pattern 1: "I"-Prefix fuer Interfaces

```typescript
// SCHLECHT:
interface IUser { name: string; }
interface IUserService { getUser(): IUser; }

// GUT:
interface User { name: string; }
interface UserService { getUser(): User; }
// ^ TypeScript's strukturelles Typsystem macht den Prefix ueberfluessig.
// Der Angular und React Style Guide empfehlen beide: Kein "I"-Prefix.
```

### Anti-Pattern 2: Type und Interface wahllos mischen

```typescript
// SCHLECHT: Kein erkennbares Muster
type User = { name: string };
interface Product { name: string; }
type Order = { items: string[] };
interface Cart { items: string[]; }

// GUT: Konsistentes Muster
interface User { name: string; }
interface Product { name: string; }
interface Order { items: string[]; }
interface Cart { items: string[]; }
```

### Anti-Pattern 3: Intersection statt extends fuer einfache Vererbung

```typescript
// SCHLECHT: Unnoetige Intersection
type Admin = User & { permissions: string[] };
// ^ Langsamer als extends. Kein Vorteil bei einfacher Erweiterung.

// GUT: extends fuer einfache Vererbung
interface Admin extends User { permissions: string[]; }
// ^ Schneller, klarere Fehlermeldungen.

// ABER — manchmal IST & die richtige Wahl:
type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
// ^ Generische Erweiterung — hier ist & das richtige Werkzeug.
```

---

## Was du gelernt hast

- **Angular** bevorzugt `interface` (DI, Service-Contracts, Style Guide)
- **React** bevorzugt `type` (Komposition, Unions, Utility Types)
- In der Praxis **kombiniert** man beide Konstrukte gezielt
- **Team-Konventionen** definieren und mit ESLint durchsetzen
- **Anti-Patterns** vermeiden: kein "I"-Prefix, kein wahlloses Mischen

> 🧠 **Erklaere dir selbst:** Du startest ein neues Projekt, das sowohl
> Angular (Backend-Admin) als auch React (Kunden-Frontend) nutzt. Beide
> Teams teilen sich Typen in einem shared Package. Welche Konvention
> waehlst du fuer das shared Package — und warum?
> **Kernpunkte:** Shared Types muessen von beiden konsumiert werden |
> interface fuer DTOs (funktioniert ueberall) | type fuer Unions
> (unvermeidbar) | Hybrid-Ansatz am pragmatischsten | API-Response-Typen
> sind fast immer Unions (type)

**Kernkonzept zum Merken:** Es gibt keine universell "richtige" Antwort.
Die beste Konvention ist die, die dein Team versteht, dokumentiert hat,
und konsistent einsetzt.

---

> **Experiment:** Gehe in ein bestehendes Projekt und zaehle: Wie viele
> `type`-Deklarationen und wie viele `interface`-Deklarationen gibt es?
> Gibt es ein erkennbares Muster oder ist es zufaellig? Was wuerdest du
> aendern, wenn du die Konvention festlegen koenntest?

---

> **Ende der Lektion.** Du hast jetzt ein tiefes Verstaendnis fuer
> `type` vs `interface`. Als naechstes: Arbeite die Examples und Exercises
> durch, um das Wissen zu festigen.
>
> Zurueck zur [Uebersicht](../README.md)
