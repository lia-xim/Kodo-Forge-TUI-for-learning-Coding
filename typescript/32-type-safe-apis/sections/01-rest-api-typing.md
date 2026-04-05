# Sektion 1: REST API Typing — Request- und Response-Typen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Zod/Valibot Runtime-Validierung](./02-runtime-validierung.md)

---

## Was du hier lernst

- Wie du Request- und Response-Typen fuer REST APIs definierst
- Warum Typ-Parameter allein keine Sicherheit bieten (das "Trust me"-Problem aus L31)
- Wie du eine zentrale API-Typ-Map baust, die Autocomplete und Sicherheit bietet
- Das Pattern "Shared Types" zwischen Frontend und Backend

---

## Das Problem: Typen enden an der Netzwerkgrenze

In L31 haben wir gesehen, dass `HttpClient.get<User[]>()` ein
"Trust me, Compiler" ist. Dieses Problem existiert in jedem HTTP-Client
— Angular, React, Node.js. Die Netzwerkgrenze ist eine **Typen-Luecke**:

```typescript
// DAS passiert wirklich:
// 1. Du definierst einen Typ
interface User { id: string; name: string; email: string }

// 2. Du nutzt ihn im HTTP-Call
const users = await fetch('/api/users').then(r => r.json()) as User[];

// 3. Die API aendert ihr Schema (Backend-Team refactort):
// { id: number, fullName: string, emailAddress: string }
//   ^ number!    ^ umbenannt!     ^ umbenannt!

// 4. Dein Code kompiliert FEHLERFREI — aber crasht zur Laufzeit
users[0].name  // undefined — Feld heisst jetzt fullName!
users[0].id.startsWith("user-")  // TypeError — id ist jetzt number!
```

> 📖 **Hintergrund: Die Typen-Grenze in verteilten Systemen**
>
> Das Problem ist nicht TypeScript-spezifisch. In verteilten Systemen
> (Microservices, Client-Server) gibt es immer eine Grenze, an der
> Typen "brechen". Google's Protocol Buffers, Apache Thrift und
> GraphQL wurden alle erfunden, um dieses Problem zu loesen — mit
> Schema-Definitionen die beide Seiten teilen.
>
> In der TypeScript-Welt gibt es mehrere Ansaetze: Shared Types
> (Monorepo), OpenAPI/Swagger Code Generation, tRPC (End-to-End),
> und GraphQL Code Generation. Jeder hat Tradeoffs.

---

## Schritt 1: Solide Typ-Definitionen

Beginne mit klaren, wiederverwendbaren Typ-Definitionen:

```typescript annotated
// api-types.ts — Zentrale Typ-Definitionen

// Basis-Entitaeten
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
  // ^ Literal Union statt string — praeziser!
  createdAt: string;
  // ^ ISO 8601 String — Date-Objekte ueberleben JSON nicht
}

// Request-Typen (was der Client sendet)
interface CreateUserRequest {
  name: string;
  email: string;
  role?: "admin" | "user" | "viewer";
  // ^ Optional — Server setzt Default
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: "admin" | "user" | "viewer";
  // ^ Alles optional — Partial-Update
}

// Response-Typen (was die API zurueckgibt)
interface ApiResponse<T> {
  data: T;
  // ^ Generischer Daten-Typ
  meta?: { page: number; total: number; perPage: number };
  // ^ Optionale Pagination-Metadaten
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  // ^ Feld-spezifische Validierungsfehler
}
```

### Derived Types statt Duplikation

```typescript annotated
// SCHLECHT: Manuell duplizierte Typen
interface CreateUserRequest {
  name: string;
  email: string;
}
interface UpdateUserRequest {
  name?: string;
  email?: string;
}
// ^ Wenn User ein Feld bekommt, muss man 3 Stellen aendern!

// BESSER: Derived Types mit Utility Types
type CreateUserRequest = Pick<User, "name" | "email"> & {
  role?: User["role"];
  // ^ Rolle ist optional bei Create, aber nutzt den GLEICHEN Typ
};

type UpdateUserRequest = Partial<Pick<User, "name" | "email" | "role">>;
// ^ Partial + Pick — alles optional, nur die aenderbaren Felder

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;
// ^ Generische Response-Wrapper — konsistent fuer alle Endpunkte
```

> 🧠 **Erklaere dir selbst:** Warum sind Derived Types (Pick, Partial,
> Omit) besser als manuell definierte Request-Typen? Was passiert wenn
> User ein neues Pflichtfeld bekommt?
>
> **Kernpunkte:** Eine Aenderung am User-Typ propagiert automatisch |
> Derived Types koennen nicht "out of sync" geraten | Pick/Omit
> dokumentieren die Beziehung zum Basis-Typ | Manuelle Typen
> muessen bei jeder Aenderung manuell nachgezogen werden

---

## Schritt 2: Die API-Typ-Map

Fuer groessere Projekte: Eine zentrale Map aller Endpunkte:

```typescript annotated
// api-routes.ts — Zentrale Routen-Definition

interface ApiRoutes {
  "GET /api/users": {
    query?: { page?: number; role?: User["role"] };
    // ^ Query-Parameter mit Typen
    response: ApiResponse<User[]>;
  };
  "GET /api/users/:id": {
    params: { id: string };
    // ^ Path-Parameter
    response: ApiResponse<User>;
  };
  "POST /api/users": {
    body: CreateUserRequest;
    // ^ Request-Body
    response: ApiResponse<User>;
  };
  "PUT /api/users/:id": {
    params: { id: string };
    body: UpdateUserRequest;
    response: ApiResponse<User>;
  };
  "DELETE /api/users/:id": {
    params: { id: string };
    response: ApiResponse<void>;
  };
}
```

### Typsicherer Client aus der Map

```typescript annotated
// Extrahiere Method und Path aus dem Key
type RouteKey = keyof ApiRoutes;
// ^ "GET /api/users" | "GET /api/users/:id" | "POST /api/users" | ...

type ExtractResponse<K extends RouteKey> = ApiRoutes[K]["response"];
// ^ Conditional Zugriff auf den Response-Typ

// Vereinfachter typsicherer Fetch
async function apiRequest<K extends RouteKey>(
  route: K,
  options?: Omit<ApiRoutes[K], "response">
): Promise<ExtractResponse<K>> {
  // ^ Rueckgabetyp wird aus der Map extrahiert
  const [method, path] = (route as string).split(" ");
  // Implementierung: fetch mit method, path, options...
  const res = await fetch(path, { method });
  return res.json();
}

// Verwendung — volle Autocomplete!
const users = await apiRequest("GET /api/users");
// ^ users: ApiResponse<User[]>
const user = await apiRequest("POST /api/users", { body: { name: "Max", email: "max@test.de" } });
// ^ user: ApiResponse<User>
```

> 💭 **Denkfrage:** Was ist der Vorteil einer String-basierten
> Routen-Map ("GET /api/users") gegenueber separaten Funktionen
> (getUsers, createUser)? Was sind die Nachteile?
>
> **Antwort:** Vorteil: Eine einzige Stelle fuer alle Routen,
> automatische Konsistenz, einfacher Code-Generator. Nachteil:
> String-basierte Keys sind weniger ergonomisch als Funktionsnamen.
> In der Praxis: Die Map ist die "Source of Truth", typsichere
> Wrapper-Funktionen bauen darauf auf.

---

## Schritt 3: Path-Parameter Typisierung

Path-Parameter wie `:id` sollen typsicher sein:

```typescript annotated
// Template Literal Type fuer Path-Parameter
type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<Rest>
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};
// ^ Rekursiver Conditional Type — extrahiert alle :param aus dem Pfad

// Beispiele:
type P1 = ExtractParams<"/api/users/:id">;
// ^ { id: string }
type P2 = ExtractParams<"/api/users/:userId/posts/:postId">;
// ^ { userId: string } & { postId: string }
```

> ⚡ **Praxis-Tipp fuer Angular:** Angular's Router nutzt ein
> aehnliches Pattern — `ActivatedRoute.params` ist `Observable<Params>`
> wobei `Params` ein `Record<string, string>` ist. Mit einer Typ-Map
> kannst du das typsicherer machen:
>
> ```typescript
> // Statt:
> const id = this.route.snapshot.params['id']; // string | undefined
>
> // Besser: Typsicherer Wrapper
> type RouteParams = { '/users/:id': { id: string } };
> function getParam<P extends keyof RouteParams>(
>   route: ActivatedRouteSnapshot, path: P, param: keyof RouteParams[P]
> ): string {
>   return route.params[param as string];
> }
> ```

---

## Das Shared-Types Pattern

In Monorepos koennest du Typen zwischen Frontend und Backend teilen:

```typescript
// packages/shared-types/src/user.ts
export interface User { id: string; name: string; email: string; }
export type CreateUserRequest = Pick<User, "name" | "email">;
export type UpdateUserRequest = Partial<CreateUserRequest>;

// packages/backend/src/routes/users.ts
import type { User, CreateUserRequest } from '@myapp/shared-types';

// packages/frontend/src/services/user.service.ts
import type { User, CreateUserRequest } from '@myapp/shared-types';
```

> 🔬 **Experiment:** Definiere eine API-Typ-Map fuer eine einfache
> Todo-App und baue einen typsicheren Client:
>
> ```typescript
> interface Todo { id: string; title: string; done: boolean; }
> type CreateTodo = Pick<Todo, "title">;
>
> interface TodoRoutes {
>   "GET /todos": { response: Todo[] };
>   "POST /todos": { body: CreateTodo; response: Todo };
>   "PUT /todos/:id": { body: Partial<Todo>; response: Todo };
>   "DELETE /todos/:id": { response: void };
> }
>
> // Frage: Welchen Typ hat das Ergebnis von
> // apiRequest("POST /todos", { body: { title: "Test" } })?
> // Antwort: Todo — aus der Map extrahiert
> ```

---

## Was du gelernt hast

- REST API-Typen brauchen Request-Typen (Body, Query, Params) UND Response-Typen
- Derived Types (Pick, Partial, Omit) verhindern Duplikation und Inkonsistenz
- Eine zentrale API-Typ-Map bietet Autocomplete und Konsistenz fuer alle Endpunkte
- Template Literal Types koennen Path-Parameter automatisch extrahieren
- Shared Types in Monorepos synchronisieren Frontend- und Backend-Typen

**Kernkonzept zum Merken:** Typen allein reichen nicht. Sie sind ein Vertrag — aber ein Vertrag ist nur so gut wie seine Durchsetzung. Die naechste Sektion zeigt, wie Runtime-Validierung den Vertrag durchsetzt.

---

> **Pausenpunkt** — Du hast die Grundlagen der API-Typisierung.
> Naechster Schritt: Runtime-Validierung.
>
> Weiter geht es mit: [Sektion 02: Zod/Valibot Runtime-Validierung](./02-runtime-validierung.md)
