# Section 6: Practice — Angular HttpClient Type-Safe, React fetch-Hooks

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - OpenAPI/Swagger → TypeScript](./05-openapi-swagger.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- How to make Angular's HttpClient truly type-safe with runtime validation
- How to combine React fetch-hooks with Zod schemas
- Concrete architecture patterns for type-safe API layers
- Decision guide: Which approach for which project?

---

## Angular: HttpClient + Zod = real type safety

In L31 we saw that `HttpClient.get<User[]>()` is a
"trust me". Now let's do it properly:

```typescript annotated
// user.schema.ts — Zod schemas as source of truth
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'viewer']),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
// ^ Type is derived from schema — single source of truth

export const CreateUserSchema = UserSchema.pick({ name: true, email: true }).extend({
  role: z.enum(['admin', 'user', 'viewer']).optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

```typescript annotated
// user.service.ts — Angular service with validation
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
      // ^ unknown instead of User[] — we validate ourselves!
      map(data => {
        const result = z.array(UserSchema).safeParse(data);
        if (result.success) {
          return { ok: true as const, value: result.data };
          // ^ result.data: User[] — GUARANTEED correct
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
    // Validate input BEFORE the request is sent!
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

> 📖 **Background: Why validate the response too?**
>
> Most developers only validate input (what the user enters).
> That's like a security check only at the entrance of an
> airport — but not at the exit. The API response is just as
> unsafe as user input: the backend team could change the schema,
> rename a field, or send null instead of a value.
> Without response validation you only notice when a user sees
> a `TypeError: Cannot read property 'name' of undefined`.
> With Zod validation you notice immediately — and can show
> meaningful error messages.

---

## Generic validated HttpClient wrapper

To avoid duplication:

```typescript annotated
// validated-http.service.ts
@Injectable({ providedIn: 'root' })
export class ValidatedHttpService {
  private http = inject(HttpClient);

  get<T>(url: string, schema: z.ZodType<T>): Observable<Result<T>> {
    // ^ Schema as parameter — validates the response
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

// Usage — clean and type-safe:
@Injectable({ providedIn: 'root' })
export class UserService {
  private vhttp = inject(ValidatedHttpService);

  getUsers() {
    return this.vhttp.get('/api/users', z.array(UserSchema));
    // ^ Observable<Result<User[]>> — validated and type-safe!
  }
}
```

> 🧠 **Explain to yourself:** Why is `ValidatedHttpService` better
> than validating manually in every service? Think about DRY and
> error handling.
>
> **Key points:** Central error handling (catchError) implemented once |
> Validation pattern consistent everywhere | Less boilerplate per service |
> Schema as the only parameter — everything else is automatic

---

## React: Type-safe fetch-hooks with Zod

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
      // ^ Validation as part of queryFn — errors are handled by React Query
    },
    ...options,
  });
}

// Usage:
function UserList() {
  const { data: users, error, isLoading } = useValidatedQuery(
    ['users'],
    '/api/users',
    z.array(UserSchema),
    // ^ Schema determines the type AND the validation
  );
  // ^ users: User[] | undefined — correct after validation

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  // ^ Validation errors are displayed here as Error!

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name} ({user.email})</li>
      ))}
    </ul>
  );
}
```

> 💭 **Think about it:** What happens when the API returns an additional field
> that is not in the schema? Does Zod throw an error?
>
> **Answer:** By default it does NOT. Zod's `.parse()` removes
> unknown fields from the output ("strips" them) but does not throw an error.
> With `.strict()` you can change that: unknown fields will then be
> rejected. In practice: `.strip()` (default) is usually better,
> because APIs often add extra fields.

---

## Architecture pattern: The API layer

```typescript
// Recommended structure for larger projects:
//
// src/
// ├── api/
// │   ├── schemas/           <- Zod schemas (source of truth)
// │   │   ├── user.schema.ts
// │   │   └── post.schema.ts
// │   ├── clients/           <- Validated HTTP clients
// │   │   ├── user.client.ts
// │   │   └── post.client.ts
// │   └── types/             <- Re-exported types (z.infer)
// │       └── index.ts
// ├── features/              <- Components/services that use clients
// │   ├── users/
// │   └── posts/
// └── shared/
//     └── validated-http.ts  <- Generic validated client
```

> ⚡ **Practical tip:** This structure works in both Angular
> and React. The difference: Angular uses Injectable Services,
> React uses Custom Hooks. The schemas and types are identical.

---

## Decision matrix: Which approach?

| Situation | Recommended approach |
|---|---|
| TypeScript fullstack (monorepo) | **tRPC** — best DX, no generation |
| GraphQL backend available | **graphql-codegen** — use the existing schema |
| REST API with OpenAPI spec | **openapi-typescript + openapi-fetch** |
| REST API without spec | **Zod schemas manually** — you define the contract |
| Externally consumed API | **OpenAPI** — language-agnostic documentation |
| Small app, quick start | **Zod directly** — no build step needed |

```typescript
// The pragmatic answer for most projects:
// 1. Define Zod schemas for all API endpoints
// 2. Derive TypeScript types with z.infer
// 3. Validate EVERY response coming from outside
// 4. If OpenAPI spec available: additionally generate types
// 5. If fullstack TypeScript: evaluate tRPC
```

> 🔬 **Experiment:** Refactor an existing service in your
> Angular project (or a practice project) following the pattern:
>
> ```typescript
> // BEFORE:
> getUsers(): Observable<User[]> {
>   return this.http.get<User[]>('/api/users');
> }
>
> // AFTER:
> getUsers(): Observable<Result<User[]>> {
>   return this.vhttp.get('/api/users', z.array(UserSchema));
> }
>
> // Question: What changes in the component that uses this service?
> // Answer: You have to handle the Result type (ok-check instead of
> // direct access to data). But in return you have GUARANTEED that
> // the data is correct.
> ```

---

## What you've learned

- Angular's HttpClient becomes truly type-safe with Zod validation: `get<unknown>()` + schema
- React fetch-hooks with Zod validate in the queryFn — errors are handled automatically
- A generic `ValidatedHttpService` (Angular) / `useValidatedQuery` (React) avoids duplication
- Response validation is just as important as input validation
- The decision matrix helps choose: tRPC, GraphQL, OpenAPI, or Zod directly

**Key concept to remember:** Type-safe APIs are a spectrum — like seat belts in a car: you can drive without one, and most of the time it's fine. But when there's a crash, you'll want it. From "no types at all" (fetch + any) through "trust me" (HttpClient.get<T>) to "provably safe" (Zod-validated): the closer you are to "provably safe", the fewer runtime errors you have. Zod is the most pragmatic path to get there.

---

> **Pause point** — You have completed Lesson 32! You can now make
> APIs type-safe at every level — from manual schemas all the way to
> end-to-end with tRPC.
>
> **Next lesson:** [L33: Testing TypeScript](../33-testing-typescript/sections/01-test-setup.md)