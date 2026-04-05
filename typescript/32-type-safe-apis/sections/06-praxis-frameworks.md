# Sektion 6: Praxis — Angular HttpClient typsicher, React fetch-Hooks

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - OpenAPI/Swagger → TypeScript](./05-openapi-swagger.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wie du Angular's HttpClient mit Runtime-Validierung wirklich typsicher machst
- Wie du React fetch-Hooks mit Zod-Schemas kombinierst
- Konkrete Architektur-Patterns fuer typsichere API-Schichten
- Entscheidungshilfe: Welcher Ansatz fuer welches Projekt?

---

## Angular: HttpClient + Zod = echte Typ-Sicherheit

In L31 haben wir gesehen, dass `HttpClient.get<User[]>()` ein
"Trust me" ist. Jetzt machen wir es richtig:

```typescript annotated
// user.schema.ts — Zod-Schemas als Source of Truth
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'viewer']),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
// ^ Typ wird aus Schema abgeleitet — Single Source of Truth

export const CreateUserSchema = UserSchema.pick({ name: true, email: true }).extend({
  role: z.enum(['admin', 'user', 'viewer']).optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

```typescript annotated
// user.service.ts — Angular Service mit Validierung
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UserSchema, CreateUserSchema } from './user.schema';
import type { User, CreateUserInput } from './user.schema';

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = '/api/users';

  getUsers(): Observable<Result<User[]>> {
    return this.http.get<unknown>(this.baseUrl).pipe(
      // ^ unknown statt User[] — wir validieren selbst!
      map(data => {
        const result = z.array(UserSchema).safeParse(data);
        if (result.success) {
          return { ok: true as const, value: result.data };
          // ^ result.data: User[] — GARANTIERT korrekt
        }
        return { ok: false as const, error: new Error(result.error.message) };
      }),
      catchError(error => of({
        ok: false as const,
        error: error instanceof Error ? error : new Error(String(error))
      }))
    );
  }

  createUser(input: CreateUserInput): Observable<Result<User>> {
    // Input validieren BEVOR der Request gesendet wird!
    const parsed = CreateUserSchema.safeParse(input);
    if (!parsed.success) {
      return of({ ok: false, error: new Error(parsed.error.message) });
    }

    return this.http.post<unknown>(this.baseUrl, parsed.data).pipe(
      map(data => {
        const result = UserSchema.safeParse(data);
        return result.success
          ? { ok: true as const, value: result.data }
          : { ok: false as const, error: new Error(result.error.message) };
      }),
      catchError(error => of({
        ok: false as const,
        error: error instanceof Error ? error : new Error(String(error))
      }))
    );
  }
}
```

> 📖 **Hintergrund: Warum validierst du auch die Response?**
>
> Die meisten Entwickler validieren nur den Input (was der User eingibt).
> Das ist wie ein Sicherheitscheck nur an der Eingangstuer eines
> Airports — aber nicht beim Ausgang. Die API-Response ist genauso
> unsicher wie der User-Input: Das Backend-Team koennte das Schema
> aendern, ein Feld umbenennen, oder null statt eines Werts senden.
> Ohne Response-Validierung merkst du das erst, wenn ein User einen
> `TypeError: Cannot read property 'name' of undefined` sieht.
> Mit Zod-Validierung merkst du es sofort — und kannst sinnvolle
> Fehlermeldungen zeigen.

---

## Generischer validierter HttpClient-Wrapper

Um Duplikation zu vermeiden:

```typescript annotated
// validated-http.service.ts
@Injectable({ providedIn: 'root' })
export class ValidatedHttpService {
  private http = inject(HttpClient);

  get<T>(url: string, schema: z.ZodType<T>): Observable<Result<T>> {
    // ^ Schema als Parameter — validiert die Response
    return this.http.get<unknown>(url).pipe(
      map(data => {
        const result = schema.safeParse(data);
        return result.success
          ? { ok: true as const, value: result.data }
          : { ok: false as const, error: new Error(`Validation failed: ${result.error.message}`) };
      }),
      catchError(this.handleError)
    );
  }

  post<T>(url: string, body: unknown, schema: z.ZodType<T>): Observable<Result<T>> {
    return this.http.post<unknown>(url, body).pipe(
      map(data => {
        const result = schema.safeParse(data);
        return result.success
          ? { ok: true as const, value: result.data }
          : { ok: false as const, error: new Error(`Validation failed: ${result.error.message}`) };
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: unknown): Observable<Result<never>> =>
    of({ ok: false, error: error instanceof Error ? error : new Error(String(error)) });
}

// Verwendung — clean und typsicher:
@Injectable({ providedIn: 'root' })
export class UserService {
  private vhttp = inject(ValidatedHttpService);

  getUsers() {
    return this.vhttp.get('/api/users', z.array(UserSchema));
    // ^ Observable<Result<User[]>> — validiert und typsicher!
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum ist `ValidatedHttpService` besser
> als in jedem Service manuell zu validieren? Denke an DRY und an
> Fehlerbehandlung.
>
> **Kernpunkte:** Zentrale Fehlerbehandlung (catchError) einmal implementiert |
> Validierungs-Pattern konsistent ueberall | Weniger Boilerplate pro Service |
> Schema als einziger Parameter — alles andere ist automatisch

---

## React: Typsichere fetch-Hooks mit Zod

```typescript annotated
// hooks/use-validated-query.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';

function useValidatedQuery<T>(
  queryKey: unknown[],
  url: string,
  schema: z.ZodType<T>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return schema.parse(data);
      // ^ Validierung als Teil der queryFn — Fehler werden von React Query gehandelt
    },
    ...options,
  });
}

// Verwendung:
function UserList() {
  const { data: users, error, isLoading } = useValidatedQuery(
    ['users'],
    '/api/users',
    z.array(UserSchema),
    // ^ Schema bestimmt den Typ UND die Validierung
  );
  // ^ users: User[] | undefined — korrekt nach Validierung

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  // ^ Validierungsfehler werden hier als Error angezeigt!

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name} ({user.email})</li>
      ))}
    </ul>
  );
}
```

> 💭 **Denkfrage:** Was passiert wenn die API ein zusaetzliches Feld
> zurueckgibt das nicht im Schema ist? Wirft Zod einen Fehler?
>
> **Antwort:** Standardmaessig NICHT. Zod's `.parse()` entfernt
> unbekannte Felder im Output ("strips" sie), wirft aber keinen Fehler.
> Mit `.strict()` kannst du das aendern: Unbekannte Felder werden dann
> abgelehnt. In der Praxis: `.strip()` (Standard) ist meist besser,
> weil APIs oft zusaetzliche Felder hinzufuegen.

---

## Architektur-Pattern: Die API-Schicht

```typescript
// Empfohlene Struktur fuer groessere Projekte:
//
// src/
// ├── api/
// │   ├── schemas/           <- Zod-Schemas (Source of Truth)
// │   │   ├── user.schema.ts
// │   │   └── post.schema.ts
// │   ├── clients/           <- Validierte HTTP-Clients
// │   │   ├── user.client.ts
// │   │   └── post.client.ts
// │   └── types/             <- Re-exportierte Typen (z.infer)
// │       └── index.ts
// ├── features/              <- Components/Services die Clients nutzen
// │   ├── users/
// │   └── posts/
// └── shared/
//     └── validated-http.ts  <- Generischer validierter Client
```

> ⚡ **Praxis-Tipp:** Diese Struktur funktioniert sowohl in Angular
> als auch in React. Der Unterschied: Angular nutzt Injectable Services,
> React nutzt Custom Hooks. Die Schemas und Typen sind identisch.

---

## Entscheidungsmatrix: Welcher Ansatz?

| Situation | Empfohlener Ansatz |
|---|---|
| TypeScript Fullstack (Monorepo) | **tRPC** — beste DX, keine Generation |
| GraphQL-Backend vorhanden | **graphql-codegen** — nutze das vorhandene Schema |
| REST API mit OpenAPI-Spec | **openapi-typescript + openapi-fetch** |
| REST API ohne Spec | **Zod-Schemas manuell** — du definierst den Vertrag |
| Extern konsumierte API | **OpenAPI** — sprachunabhaengig dokumentiert |
| Kleine App, schneller Start | **Zod direkt** — kein Build-Step noetig |

```typescript
// Die pragmatische Antwort fuer die meisten Projekte:
// 1. Definiere Zod-Schemas fuer alle API-Endpunkte
// 2. Leite TypeScript-Typen mit z.infer ab
// 3. Validiere JEDE Response die von aussen kommt
// 4. Wenn OpenAPI-Spec verfuegbar: generiere zusaetzlich Typen
// 5. Wenn Fullstack TypeScript: evaluiere tRPC
```

> 🔬 **Experiment:** Refactore einen bestehenden Service in deinem
> Angular-Projekt (oder einem Uebungsprojekt) nach dem Pattern:
>
> ```typescript
> // VORHER:
> getUsers(): Observable<User[]> {
>   return this.http.get<User[]>('/api/users');
> }
>
> // NACHHER:
> getUsers(): Observable<Result<User[]>> {
>   return this.vhttp.get('/api/users', z.array(UserSchema));
> }
>
> // Frage: Was aendert sich in der Component die diesen Service nutzt?
> // Antwort: Du musst den Result-Typ behandeln (ok-Check statt
> // direktem Zugriff auf data). Aber dafuer hast du GARANTIE dass
> // die Daten korrekt sind.
> ```

---

## Was du gelernt hast

- Angular's HttpClient wird mit Zod-Validierung wirklich typsicher: `get<unknown>()` + Schema
- React fetch-Hooks mit Zod validieren in der queryFn — Fehler werden automatisch gehandelt
- Ein generischer `ValidatedHttpService` (Angular) / `useValidatedQuery` (React) vermeidet Duplikation
- Response-Validierung ist genauso wichtig wie Input-Validierung
- Die Entscheidungsmatrix hilft bei der Wahl: tRPC, GraphQL, OpenAPI oder Zod direkt

**Kernkonzept zum Merken:** Typsichere APIs sind ein Spektrum — wie Sicherheitsgurte im Auto: Du kannst ohne fahren, und meistens geht es gut. Aber wenn es kracht, willst du ihn haben. Von "gar keine Typen" (fetch + any) ueber "Trust me" (HttpClient.get<T>) bis "bewiesen sicher" (Zod-validiert): Je naeher du an "bewiesen sicher" bist, desto weniger Runtime-Fehler hast du. Zod ist der pragmatischste Weg dorthin.

---

> **Pausenpunkt** — Du hast Lektion 32 abgeschlossen! Du kannst jetzt
> APIs auf jeder Ebene typsicher machen — von manuellen Schemas bis
> End-to-End mit tRPC.
>
> **Naechste Lektion:** [L33: Testing TypeScript](../33-testing-typescript/sections/01-test-setup.md)
