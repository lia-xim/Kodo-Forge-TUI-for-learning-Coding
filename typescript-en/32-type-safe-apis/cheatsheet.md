# Cheatsheet: Type-safe APIs

Quick reference for Lesson 32.

---

## REST API Typing

```typescript
// Derived types instead of duplication:
type CreateUser = Pick<User, "name" | "email">;
type UpdateUser = Partial<Pick<User, "name" | "email" | "role">>;

// API type map:
interface ApiRoutes {
  "GET /api/users": { query?: { role?: string }; response: User[] };
  "POST /api/users": { body: CreateUser; response: User };
}
```

---

## Zod — Runtime Validation

```typescript
import { z } from 'zod';

// Schema First: Schema → Type
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "user", "viewer"]),
});
type User = z.infer<typeof UserSchema>;

// Validation
UserSchema.parse(data);           // throws ZodError on failure
UserSchema.safeParse(data);       // { success, data/error }

// Derived Schemas
const CreateUserSchema = UserSchema.pick({ name: true, email: true });
const UpdateUserSchema = UserSchema.partial();
```

---

## Valibot — Lightweight Alternative

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
// Server: Router as type source
const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => db.user.findUnique({ where: { id: input.id } })),
});
export type AppRouter = typeof appRouter;

// Client: import type — no runtime code!
import type { AppRouter } from '../server';
const client = createTRPCClient<AppRouter>({ url: '/api/trpc' });
const user = await client.getUser.query({ id: "123" }); // type-safe!
```

---

## GraphQL Code Generation

```bash
npx graphql-codegen  # Generates types from schema + queries
```

```typescript
// Generated: query-specific types
type GetUserQuery = { user: { id: string; name: string } | null };
// Only requested fields in the type!
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
  params: { query: { role: 'admin' } }, // type-safe!
});
```

---

## Validated HTTP Client

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

## Decision Matrix

| Situation | Recommendation |
|---|---|
| TS Fullstack (Monorepo) | tRPC |
| GraphQL backend | graphql-codegen |
| REST + OpenAPI spec | openapi-typescript + openapi-fetch |
| REST without spec | Zod schemas manually |
| Public API | OpenAPI |
| Small app | Zod directly |

---

## Common Mistakes

| Mistake | Problem | Solution |
|---|---|---|
| `get<User[]>()` without validation | Trust me — no runtime check | `get<unknown>()` + Zod |
| Type and schema maintained in parallel | Can drift apart | Schema First (z.infer) |
| Only validating input | Response can change | Validate response AND input |
| Not updating generated types | Stale types | CI/CD integration |
| tRPC with non-TS backend | Does not work | OpenAPI or GraphQL |