# Cheatsheet: Type-safe Error Handling

Quick reference for Lesson 25.

---

## Result<T, E> Pattern

```typescript
// Definition:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Helpers:
function ok<T>(value: T): { ok: true; value: T } {
  return { ok: true as const, value };
}

function err<E>(error: E): { ok: false; error: E } {
  return { ok: false as const, error };
}

// Usage:
function parseAge(raw: string): Result<number, string> {
  const n = parseInt(raw);
  if (isNaN(n)) return err('Not a number');
  if (n < 0 || n > 150) return err('Outside 0-150');
  return ok(n);
}

// Result check:
const result = parseAge("25");
if (result.ok) {
  console.log(result.value); // TypeScript knows: number
} else {
  console.log(result.error); // TypeScript knows: string
}
```

---

## Option / Maybe Pattern

```typescript
// Option = T | null (simple absence without error details)
type Option<T> = T | null;

// Helpers:
function fromNullable<T>(v: T | null | undefined): Option<T> {
  return v ?? null;
}

function mapOption<T, U>(v: Option<T>, fn: (x: T) => U): Option<U> {
  return v === null ? null : fn(v);
}

function getOrElse<T>(v: Option<T>, fallback: T): T {
  return v ?? fallback;
}
```

| When Option? | When Result? |
|---|---|
| `findUser()` — null = not found | `createUser()` — Err = validation error |
| `getConfig()` — null = not set | `fetchData()` — Err = network error |
| No error detail needed | Error cause must be known |

---

## Exhaustive Error Handling

### assertNever

```typescript
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

type ApiError = 'NOT_FOUND' | 'FORBIDDEN' | 'TIMEOUT';

function handle(e: ApiError): string {
  switch (e) {
    case 'NOT_FOUND': return '404';
    case 'FORBIDDEN': return '403';
    case 'TIMEOUT':   return '408';
    default: return assertNever(e); // Compile error if case is missing!
  }
}
```

### satisfies Record

```typescript
const messages = {
  NOT_FOUND: 'Not found',
  FORBIDDEN: 'No access',
  TIMEOUT:   'Timeout'
} satisfies Record<ApiError, string>;
// Checks: all keys present + retains literal types
```

---

## Error Type Hierarchies

```typescript
// Union types for errors (preferred over classes):
type ValidationError =
  | { type: 'REQUIRED'; field: string }
  | { type: 'TOO_SHORT'; field: string; min: number }
  | { type: 'INVALID_FORMAT'; field: string; expected: string };

// Each variant has `type` as discriminant.
// → Pattern matching with switch(error.type)
```

---

## Error Conversion Between Layers

```
Infrastructure         Domain              Presentation
─────────────          ──────              ────────────
DbError         →      UserError    →      HttpError
CONSTRAINT      →      ALREADY_EXISTS →    409 Conflict
CONNECTION      →      UNAVAILABLE  →      503 Service Unavail.
TIMEOUT         →      UNAVAILABLE  →      503 Service Unavail.
```

```typescript
function mapDbToDomain(e: DbError): UserError {
  switch (e.type) {
    case 'CONSTRAINT':  return { type: 'ALREADY_EXISTS', ... };
    case 'CONNECTION':  return { type: 'UNAVAILABLE', ... };
    case 'TIMEOUT':     return { type: 'UNAVAILABLE', ... };
    default: return assertNever(e);
  }
}
```

---

## mapResult / flatMapResult

```typescript
// map: Transform the success value
function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (!result.ok) return result;
  return ok(fn(result.value));
}

// flatMap: fn itself returns a Result
function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (!result.ok) return result;
  return fn(result.value);
}

// Chaining instead of nesting:
const emailResult = flatMapResult(
  parseEmail(raw),
  email => flatMapResult(
    validateDomain(email),
    domain => ok(domain.toUpperCase())
  )
);
```

---

## neverthrow Patterns (Library)

```typescript
// neverthrow provides Result as a class with fluent API:
import { ok, err, Result } from 'neverthrow';

function parse(s: string): Result<number, string> {
  const n = parseInt(s);
  return isNaN(n) ? err('NaN') : ok(n);
}

// Fluent chaining:
parse("42")
  .map(n => n * 2)
  .mapErr(e => `Parse error: ${e}`)
  .match(
    val => console.log(val),
    err => console.error(err)
  );
```

---

## When throw vs Result?

| Situation | Recommendation | Reason |
|---|---|---|
| Bug / invariant violation | `throw` | Should never happen |
| Missing env variable | `throw` | App cannot start |
| Validation error | `Result` | Expected error |
| Network error | `Result` | Expected error |
| "Not found" | `Option` (null) | Normal state |
| JSON.parse internally | `try/catch → Result` | Wrap once |

**Rule of thumb:** "Can a correct program reach this situation?"
- **No** → `throw` (it's a bug)
- **Yes** → `Result` or `Option` (it's expected)

---

## Important tsconfig Settings

| Setting | Effect |
|---|---|
| `strict: true` | Enables `useUnknownInCatchVariables` |
| `useUnknownInCatchVariables` | catch(e) has type `unknown` instead of `any` |
| `strictNullChecks` | null/undefined are their own types |

---

## Framework Integration

### Angular (RxJS)

```typescript
// Wrap Observable → Result:
this.http.get<User>('/api/user').pipe(
  map(user => ok(user)),
  catchError(e => of(err(toHttpError(e))))
);
```

### React (fetch)

```typescript
// Wrap fetch → Result:
async function fetchUser(id: string): Promise<Result<User, FetchError>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (res.status === 404) return err({ type: 'NOT_FOUND', id });
    const user = await res.json();
    return ok(user);
  } catch (e) {
    return err({ type: 'NETWORK', message: String(e) });
  }
}
```

---

## Common Mistakes

| Mistake | Problem | Solution |
|---|---|---|
| `{ ok: true, value }` without `as const` | ok becomes boolean | `ok: true as const` or helper |
| `Result<User, null>` | null as error type is pointless | `User \| null` instead of Result |
| `catch(e) { e.message }` | e is unknown (strict) | `if (e instanceof Error)` |
| All errors as string | No pattern matching | Use discriminated union |
| Result for everything | Over-engineering | throw for bugs, Result for expected |
| map instead of flatMap | `Result<Result<T,E>,E>` | flatMap when fn returns a Result |