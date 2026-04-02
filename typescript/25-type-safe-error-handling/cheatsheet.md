# Cheatsheet: Type-safe Error Handling

Schnellreferenz fuer Lektion 25.

---

## Result<T, E> Pattern

```typescript
// Definition:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Helfer:
function ok<T>(value: T): { ok: true; value: T } {
  return { ok: true as const, value };
}

function err<E>(error: E): { ok: false; error: E } {
  return { ok: false as const, error };
}

// Verwendung:
function parseAge(raw: string): Result<number, string> {
  const n = parseInt(raw);
  if (isNaN(n)) return err('Keine Zahl');
  if (n < 0 || n > 150) return err('Ausserhalb 0-150');
  return ok(n);
}

// Auswertung:
const result = parseAge("25");
if (result.ok) {
  console.log(result.value); // TypeScript weiss: number
} else {
  console.log(result.error); // TypeScript weiss: string
}
```

---

## Option / Maybe Pattern

```typescript
// Option = T | null (einfaches Fehlen ohne Fehlerdetails)
type Option<T> = T | null;

// Helfer:
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

| Wann Option? | Wann Result? |
|---|---|
| `findUser()` — null = nicht gefunden | `createUser()` — Err = Validierungsfehler |
| `getConfig()` — null = nicht gesetzt | `fetchData()` — Err = Netzwerkfehler |
| Kein Fehlerdetail noetig | Fehlerursache muss bekannt sein |

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
    default: return assertNever(e); // Compile-Error wenn Case fehlt!
  }
}
```

### satisfies Record

```typescript
const messages = {
  NOT_FOUND: 'Nicht gefunden',
  FORBIDDEN: 'Kein Zugriff',
  TIMEOUT:   'Zeitueberschreitung'
} satisfies Record<ApiError, string>;
// Prueft: Alle Keys vorhanden + behaelt Literal-Typen
```

---

## Error-Typ Hierarchien

```typescript
// Union-Typen fuer Fehler (bevorzugt gegenueber Klassen):
type ValidationError =
  | { type: 'REQUIRED'; field: string }
  | { type: 'TOO_SHORT'; field: string; min: number }
  | { type: 'INVALID_FORMAT'; field: string; expected: string };

// Jede Variante hat `type` als Discriminant.
// → Pattern Matching mit switch(error.type)
```

---

## Error-Konvertierung zwischen Schichten

```
Infrastruktur          Domain              Presentation
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
// map: Transformiere den Erfolgs-Wert
function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (!result.ok) return result;
  return ok(fn(result.value));
}

// flatMap: fn gibt selbst ein Result zurueck
function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (!result.ok) return result;
  return fn(result.value);
}

// Chaining statt Verschachtelung:
const emailResult = flatMapResult(
  parseEmail(raw),
  email => flatMapResult(
    validateDomain(email),
    domain => ok(domain.toUpperCase())
  )
);
```

---

## neverthrow-Patterns (Bibliothek)

```typescript
// neverthrow bietet Result als Klasse mit fluent API:
import { ok, err, Result } from 'neverthrow';

function parse(s: string): Result<number, string> {
  const n = parseInt(s);
  return isNaN(n) ? err('NaN') : ok(n);
}

// Fluent Chaining:
parse("42")
  .map(n => n * 2)
  .mapErr(e => `Parse-Fehler: ${e}`)
  .match(
    val => console.log(val),
    err => console.error(err)
  );
```

---

## Wann throw vs Result?

| Situation | Empfehlung | Grund |
|---|---|---|
| Bug / Invariant-Verletzung | `throw` | Sollte nie passieren |
| Fehlende Env-Variable | `throw` | App kann nicht starten |
| Validierungsfehler | `Result` | Erwarteter Fehler |
| Netzwerkfehler | `Result` | Erwarteter Fehler |
| "Nicht gefunden" | `Option` (null) | Normaler Zustand |
| JSON.parse intern | `try/catch → Result` | Einmal wrappen |

**Faustregel:** "Kann ein korrektes Programm in diese Situation kommen?"
- **Nein** → `throw` (es ist ein Bug)
- **Ja** → `Result` oder `Option` (es ist erwartbar)

---

## Wichtige tsconfig-Settings

| Setting | Effekt |
|---|---|
| `strict: true` | Aktiviert `useUnknownInCatchVariables` |
| `useUnknownInCatchVariables` | catch(e) hat Typ `unknown` statt `any` |
| `strictNullChecks` | null/undefined sind eigene Typen |

---

## Framework-Integration

### Angular (RxJS)

```typescript
// Observable → Result wrappen:
this.http.get<User>('/api/user').pipe(
  map(user => ok(user)),
  catchError(e => of(err(toHttpError(e))))
);
```

### React (fetch)

```typescript
// fetch → Result wrappen:
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

## Haeufige Fehler

| Fehler | Problem | Loesung |
|---|---|---|
| `{ ok: true, value }` ohne `as const` | ok wird zu boolean | `ok: true as const` oder Helper |
| `Result<User, null>` | null als Error-Typ sinnlos | `User \| null` statt Result |
| `catch(e) { e.message }` | e ist unknown (strict) | `if (e instanceof Error)` |
| Alle Fehler als string | Kein Pattern Matching | Discriminated Union verwenden |
| Result fuer alles | Over-Engineering | throw fuer Bugs, Result fuer Erwartetes |
| map statt flatMap | `Result<Result<T,E>,E>` | flatMap wenn fn ein Result zurueckgibt |
