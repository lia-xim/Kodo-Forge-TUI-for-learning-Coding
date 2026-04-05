# Cheatsheet: Type-safe APIs

Schnellreferenz fuer Lektion 32.

---

## REST API Typing

```typescript
// Derived Types statt Duplikation:
type CreateUser = Pick<User, "name" | "email">;
type UpdateUser = Partial<Pick<User, "name" | "email" | "role">>;

// API-Typ-Map:
interface ApiRoutes {
  "GET /api/users": { query?: { role?: string }; response: User[] };
  "POST /api/users": { body: CreateUser; response: User };
}
```

---

## Zod — Runtime-Validierung

```typescript
import { z } from 'zod';

// Schema First: Schema → Typ
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "user", "viewer"]),
});
type User = z.infer<typeof UserSchema>;

// Validierung
UserSchema.parse(data);           // wirft ZodError bei Fehler
UserSchema.safeParse(data);       // { success, data/error }

// Derived Schemas
const CreateUserSchema = UserSchema.pick({ name: true, email: true });
const UpdateUserSchema = UserSchema.partial();
```

---

## Valibot — Leichtgewichtige Alternative

```typescript
import * as v from 'valibot';

const UserSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
});
type User = v.InferOutput<typeof UserSchema>;
```

---

## tRPC — End-to-End Type Safety

```typescript
// Server: Router als Typ-Quelle
const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => db.user.findUnique({ where: { id: input.id } })),
});
export type AppRouter = typeof appRouter;

// Client: import type — kein Runtime-Code!
import type { AppRouter } from '../server';
const client = createTRPCClient<AppRouter>({ url: '/api/trpc' });
const user = await client.getUser.query({ id: "123" }); // typsicher!
```

---

## GraphQL Code Generation

```bash
npx graphql-codegen  # Generiert Typen aus Schema + Queries
```

```typescript
// Generiert: Query-spezifische Typen
type GetUserQuery = { user: { id: string; name: string } | null };
// Nur angeforderte Felder im Typ!
```

---

## OpenAPI → TypeScript

```bash
npx openapi-typescript openapi.yaml -o api-types.d.ts
```

```typescript
import createClient from 'openapi-fetch';
import type { paths } from './api-types';

const client = createClient<paths>({ baseUrl: 'https://api.example.com' });
const { data } = await client.GET('/api/users', {
  params: { query: { role: 'admin' } }, // typsicher!
});
```

---

## Validierter HTTP-Client

```typescript
// Angular:
@Injectable()
export class ValidatedHttpService {
  get<T>(url: string, schema: z.ZodType<T>): Observable<Result<T>> {
    return this.http.get<unknown>(url).pipe(
      map(data => schema.safeParse(data)),
      // ...
    );
  }
}

// React:
function useValidatedQuery<T>(key: unknown[], url: string, schema: z.ZodType<T>) {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: async () => schema.parse(await fetch(url).then(r => r.json())),
  });
}
```

---

## Entscheidungsmatrix

| Situation | Empfehlung |
|---|---|
| TS Fullstack (Monorepo) | tRPC |
| GraphQL-Backend | graphql-codegen |
| REST + OpenAPI-Spec | openapi-typescript + openapi-fetch |
| REST ohne Spec | Zod-Schemas manuell |
| Oeffentliche API | OpenAPI |
| Kleine App | Zod direkt |

---

## Haeufige Fehler

| Fehler | Problem | Loesung |
|---|---|---|
| `get<User[]>()` ohne Validierung | Trust me — keine Laufzeit-Pruefung | `get<unknown>()` + Zod |
| Typ und Schema manuell parallel | Koennen auseinanderlaufen | Schema First (z.infer) |
| Nur Input validieren | Response kann sich aendern | Response UND Input validieren |
| Generierte Typen nicht aktualisieren | Stale Types | CI/CD-Integration |
| tRPC mit Nicht-TS-Backend | Funktioniert nicht | OpenAPI oder GraphQL |
