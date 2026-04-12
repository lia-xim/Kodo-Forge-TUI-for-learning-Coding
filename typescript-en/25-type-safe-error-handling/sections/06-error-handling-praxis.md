# Section 6: Error Handling in Practice — Angular & React

> Estimated reading time: **9 minutes**
>
> Previous section: [05 - Error Type Patterns](./05-error-typen-patterns.md)
> Next section: -- (End of L25)

---

## What you'll learn here

- **Angular HTTP requests** with Result type instead of try/catch
- **React async components** with exhaustive error handling
- When `throw` is still appropriate (unexpected errors, initialization errors)
- A complete **error architecture** for an SPA

---

## Angular: HTTP Service with Result

> **Background: Observable Error Handling**
>
> Angular's HttpClient throws Observable errors — technically not `throw` exceptions,
> but semantically similar. `catchError` is the Observable equivalent of `try/catch`.
>
> The problem: What is the return type of `this.http.get<User>(url)`?
> `Observable<User>` — but it can emit `HttpErrorResponse`.
> This is invisible in the type, just like synchronous `throw`.
>
> Solution: Wrap the Observable value in `Result<User, HttpError>`.
> This makes the error visible in the type — and the observing code
> MUST handle it.

```typescript annotated
// types/http-errors.ts
export type HttpError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'FORBIDDEN'; message: string }
  | { type: 'VALIDATION'; errors: Record<string, string[]> }
  | { type: 'SERVER_ERROR'; status: number; message: string }
  | { type: 'NETWORK'; message: string };

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// helpers/http-result.ts
export function toHttpError(err: unknown): HttpError {
  // HttpErrorResponse from Angular — simulated here
  const httpErr = err as { status?: number; message?: string; error?: unknown };
  if (!httpErr.status) {
    return { type: 'NETWORK', message: 'Connection interrupted' };
  }
  switch (httpErr.status) {
    case 401: return { type: 'UNAUTHORIZED', message: 'Please log in' };
    case 403: return { type: 'FORBIDDEN', message: 'No permission' };
    case 404: return { type: 'NOT_FOUND', message: 'Page not found' };
    default:  return {
      type: 'SERVER_ERROR',
      status: httpErr.status,
      message: httpErr.message ?? 'Unknown error'
    };
  }
}
```

And the service:

```typescript annotated
// services/user.service.ts (Angular-style)
// import { HttpClient } from '@angular/common/http';

class UserService {
  // http: HttpClient — simulated:
  private http = { get: <T>(url: string) => Promise.resolve({ id: '1', email: 'a@b.de', name: 'Max' } as unknown as T) };

  // Return type makes error visible:
  async getUser(id: string): Promise<Result<User, HttpError>> {
    try {
      const user = await this.http.get<User>(`/api/users/${id}`);
      return { ok: true, value: user };
    } catch (err) {
      return { ok: false, error: toHttpError(err) };
    }
  }
}

type User = { id: string; email: string; name: string };

// In the component — type-safe error handling:
async function loadUser(userId: string): Promise<void> {
  const service = new UserService();
  const result = await service.getUser(userId);

  if (result.ok) {
    console.log(`Welcome, ${result.value.name}!`);
  } else {
    const error = result.error;
    switch (error.type) {
      case 'NOT_FOUND':    console.log('User not found'); break;
      case 'UNAUTHORIZED': console.log('Please log in'); break;
      case 'NETWORK':      console.log('No connection'); break;
      default:             console.log(`Error: ${error.type}`);
    }
  }
}
```

> 🧠 **Explain to yourself:** What is the advantage when `getUser()` has the
> type `Promise<Result<User, HttpError>>` instead of `Promise<User>`?
> What does this enforce in the component code?
>
> **Key points:** Component cannot simply ignore the error case |
> TypeScript enforces the result.ok check before value is used |
> Error type `HttpError` documents all possible error scenarios |
> switch with assertNever (optional) prevents forgotten cases

---

## React: Async Data Loading with Result

```typescript annotated
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type FetchError =
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'NETWORK'; message: string }
  | { type: 'PARSE'; message: string };

// Type-safe fetch wrapper:
async function fetchUser(id: string): Promise<Result<User, FetchError>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { ok: false, error: { type: 'NOT_FOUND', id } };
      }
      return { ok: false, error: { type: 'NETWORK', message: `HTTP ${response.status}` } };
    }
    const data: unknown = await response.json();
    if (!isUser(data)) {
      return { ok: false, error: { type: 'PARSE', message: 'Invalid response format' } };
    }
    return { ok: true, value: data };
  } catch (e) {
    return { ok: false, error: { type: 'NETWORK', message: (e as Error).message } };
  }
}

// Type Guard:
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data && 'email' in data;
}

type User = { id: string; email: string; name: string };

// Hook simulation (for React useEffect):
async function loadUserData(userId: string) {
  const result = await fetchUser(userId);

  // Exhaustive handling:
  if (result.ok) {
    return { state: 'loaded', user: result.value };
  } else {
    const msg = (() => {
      switch (result.error.type) {
        case 'NOT_FOUND': return `User ${result.error.id} not found`;
        case 'NETWORK':   return `Network error: ${result.error.message}`;
        case 'PARSE':     return `Data error: ${result.error.message}`;
        // assertNever here for exhaustive check
      }
    })();
    return { state: 'error', message: msg };
  }
}
```

---

## When to Continue Using `throw`
<!-- section:summary -->
Not everything needs `Result`. `throw` is still appropriate for:

<!-- depth:standard -->
Not everything needs `Result`. `throw` is still appropriate for:

```typescript annotated
// 1. INITIALIZATION ERRORS — when the app cannot run without this:
function initDatabase(connectionString: string): Database {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — app cannot start");
    // ^ throw is correct: App MUST stop if DB is missing
  }
  return connectToDb(connectionString);
}

// 2. PROGRAMMING ERRORS (invariant violations):
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Bug: Division by zero — caller must guarantee b ≠ 0");
  return a / b;
}

// 3. UNRECOVERABLE ERRORS — no meaningful recovery path:
function assertAuthenticated(userId: string | null): string {
  if (!userId) throw new Error("FATAL: Operation called without auth");
  return userId;
}

// 4. EXTERNALS that natively throw (JSON.parse, fs operations, etc.):
function safeParseJson<T>(json: string): Result<T, string> {
  try {
    return { ok: true, value: JSON.parse(json) as T };    // JSON.parse throws
  } catch {
    return { ok: false, error: `Invalid JSON: ${json.substring(0, 50)}` };
  }
}
// ^ Wrapper: external throw → Result (safe boundary)
```

> 💭 **Think about it:** The rule of thumb is: `Result` for expected errors,
> `throw` for unexpected ones. But what is "expected"? Is a network error
> expected or unexpected?
>
> **Answer:** Network errors are EXPECTED — in a web app, you MUST account for
> the connection dropping. So: `Result<T, NetworkError>`.
> A `JSON.parse` crash due to corrupted data is expected when processing external
> data → Result. But a null pointer in an internal function is a bug → throw.
> The question: "Can a correct program end up in this situation?"

<!-- depth:vollstaendig -->
> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
>
> type ParseError = { type: 'PARSE'; message: string };
> type FetchError =
>   | { type: 'NOT_FOUND'; id: string }
>   | { type: 'NETWORK';   message: string };
>
> // Step 1: JSON.parse throw → Result
> function safeParseJson<T>(json: string): Result<T, ParseError> {
>   try {
>     return { ok: true, value: JSON.parse(json) as T };
>   } catch (e) {
>     return { ok: false, error: { type: 'PARSE', message: (e as Error).message } };
>   }
> }
>
> // Step 2: fetchUser with combined error type
> type User = { id: string; name: string };
>
> async function fetchUser(id: string): Promise<Result<User, FetchError | ParseError>> {
>   try {
>     const response = await fetch(`/api/users/${id}`);
>     if (response.status === 404) {
>       return { ok: false, error: { type: 'NOT_FOUND', id } };
>     }
>     const raw = await response.text();
>     return safeParseJson<User>(raw); // ParseError flows as Result
>   } catch (e) {
>     return { ok: false, error: { type: 'NETWORK', message: (e as Error).message } };
>   }
> }
>
> // For testing without real fetch:
> const validJson   = safeParseJson<User>('{"id":"1","name":"Max"}');
> const invalidJson = safeParseJson<User>('{ invalid }');
> console.log(validJson);   // { ok: true, value: { id: '1', name: 'Max' } }
> console.log(invalidJson); // { ok: false, error: { type: 'PARSE', message: '...' } }
> ```
>
> Observe: The external `throw` from `JSON.parse` is caught ONCE —
> after that, only `Result` flows through your application.
> Bonus: Write the same logic with pure try/catch — compare where type safety is lost.

---

<!-- /depth -->
## Complete Error Architecture

```typescript
// Recommended layer architecture:
//
// ┌─────────────────────────────────────────────────┐
// │ Presentation (Component/Page)                   │
// │   Result<User, HttpError> → display UI          │
// │   switch(error.type) + assertNever              │
// └──────────────────────┬──────────────────────────┘
//                        │ Result<User, HttpError>
// ┌──────────────────────▼──────────────────────────┐
// │ Application (Service)                            │
// │   Result<User, DomainError>                     │
// │   toHttpError(domainErr): HttpError             │
// └──────────────────────┬──────────────────────────┘
//                        │ Result<User, DomainError>
// ┌──────────────────────▼──────────────────────────┐
// │ Domain (Repository)                              │
// │   Result<User, DbError> → mapToUserError()      │
// └──────────────────────┬──────────────────────────┘
//                        │ Result<User, DbError>
// ┌──────────────────────▼──────────────────────────┐
// │ Infrastructure (DB/HTTP)                         │
// │   try/catch → Result (external systems throw)   │
// └─────────────────────────────────────────────────┘
```

> **In your Angular project — immediately applicable:**
>
> ```typescript
> // 1. Define HttpError in types/errors.ts
> // 2. UserService returns Result<User, HttpError>
> // 3. Component checks result.ok and handles errors layer-specifically
> // 4. assertNever in switch ensures completeness
>
> // The result: No unhandled error ends up in the console.
> // Every error has a defined UI state.
> ```

---

## What you've learned

- **Angular HTTP** with `Result<T, HttpError>` — `catchError` converts to `Err`
- **React fetch** with type-safe wrappers instead of bare `fetch().then()`
- `throw` remains appropriate for: initialization errors, bugs, unreachable states, wrapping external systems
- A complete **error architecture** has clear layers: Infra → Domain → Service → Presentation

> 🧠 **Explain to yourself:** Why is it important that the Render/View layer
> also has exhaustive error handling (switch + assertNever)?
>
> **Key points:** New error types → compile errors in the UI | Developer MUST
> provide UI design for new error | No silent "Unknown Error" displays |
> Type system as a checklist for completeness

**Core concept to remember:** Error handling is architecture. Define error types
per layer, convert between layers, and enforce completeness with `assertNever`.

---

> **Pause point** -- L25 complete! Excellent.
>
> You can now handle errors type-safely and exhaustively:
> `Result<T,E>`, `Option`, `assertNever`, and cross-layer error conversion.
>
> Continue with: [L26 — Advanced Patterns](../../26-advanced-patterns/sections/01-builder-pattern.md)