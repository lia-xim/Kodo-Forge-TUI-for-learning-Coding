# Sektion 5: Error-Typen Patterns

> Geschätzte Lesezeit: **9 Minuten**
>
> Vorherige Sektion: [04 - Exhaustive Error Handling](./04-exhaustive-error-handling.md)
> Nächste Sektion: [06 - Error Handling in der Praxis](./06-error-handling-praxis.md)

---

## Was du hier lernst

- **Fehler-Hierarchien** mit Union-Typen statt Klassen modellieren
- **Error-Konvertierung** zwischen verschiedenen Ebenen (Domain, API, UI)
- Wie man `instanceof` mit `class`-Fehlern typsicher macht
- Das **Error-Boundary Pattern** für React und Angular

---

## Fehler-Hierarchien ohne Klassen

> **Hintergrund: Klassen vs. Union-Types für Fehler**
>
> In Java/C# ist das Standard-Pattern für Fehler-Hierarchien:
> `class ValidationError extends AppError { }`. Das hat Probleme:
> Klassen sind schwer zu serialisieren (JSON), erfordern `instanceof`-Checks,
> und können nur in einer Hierarchie stehen.
>
> TypeScript-Community-Praxis (2024): **Discriminated Union Types** bevorzugen.
> Sie sind serialisierbar (JSON), einfach zu erstellen, und erlauben
> "mehrere Hierarchien" (ein Fehler kann in mehreren Kontexten erscheinen).
>
> Bibliotheken wie `neverthrow` popularisierten diesen Ansatz in TypeScript.

```typescript annotated
// Schlechter Ansatz: Klassen-Hierarchie (Java-Stil)
class AppError extends Error { constructor(message: string) { super(message); } }
class ValidationError extends AppError { }
class NetworkError extends AppError { }
// Problem: Sehr unflexibel, schwer zu serialisieren, instanceof-Checks

// Guter Ansatz: Union-Typen (TypeScript-Stil)
type DomainError =
  | { type: 'VALIDATION'; field: string; message: string }
  | { type: 'NOT_FOUND'; resource: string; id: string }
  | { type: 'DUPLICATE'; resource: string; field: string };

type InfraError =
  | { type: 'NETWORK'; status: number; message: string }
  | { type: 'DATABASE'; query: string; message: string }
  | { type: 'TIMEOUT'; timeout: number };

// Kombinierte Fehler für Service-Ebene:
type ServiceError = DomainError | InfraError;
//                  ^^^^^^^^^^^   ^^^^^^^^^
//                  Alle Domain-Errors + Alle Infra-Errors = Service kann alles
```

---

## Error-Konvertierung zwischen Ebenen
<!-- section:summary -->
In einer echten Anwendung haben verschiedene Schichten verschiedene Fehler-Typen.

<!-- depth:standard -->
In einer echten Anwendung haben verschiedene Schichten verschiedene Fehler-Typen.
Ein Repository-Fehler sollte nicht rohe DB-Fehler nach oben durchleiten:

```typescript annotated
// Infrastruktur-Ebene: rohe DB-Fehler
type DbError =
  | { type: 'DB_CONSTRAINT'; constraint: string }
  | { type: 'DB_CONNECTION'; message: string }
  | { type: 'DB_TIMEOUT'; timeout: number };

// Domain-Ebene: Business-verständliche Fehler
type UserError =
  | { type: 'USER_NOT_FOUND'; userId: string }
  | { type: 'USER_ALREADY_EXISTS'; email: string }
  | { type: 'USER_UNAVAILABLE'; message: string };

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Repository übersetzt DB-Fehler → Domain-Fehler:
function dbErrorToUserError(err: DbError, context: { email?: string; userId?: string }): UserError {
  switch (err.type) {
    case 'DB_CONSTRAINT':
      return { type: 'USER_ALREADY_EXISTS', email: context.email! };
    case 'DB_CONNECTION':
    case 'DB_TIMEOUT':
      return { type: 'USER_UNAVAILABLE', message: err.type === 'DB_TIMEOUT'
        ? 'Datenbank-Timeout — bitte versuche es erneut'
        : err.message
      };
    default:
      return assertNever(err);
  }
}

// UserRepository übersetzt komplett:
async function createUser(email: string, name: string): Promise<Result<User, UserError>> {
  const dbResult = await insertUserInDb(email, name); // gibt Result<User, DbError>
  if (!dbResult.ok) {
    return { ok: false, error: dbErrorToUserError(dbResult.error, { email }) };
    // ^ DB-Fehler wird zu Domain-Fehler übersetzt — saubere API!
  }
  return dbResult; // ok: true mit User — kein Umwandeln nötig
}

function assertNever(x: never): never { throw new Error(`Unhandled: ${JSON.stringify(x)}`); }
type User = { id: string; email: string; name: string };
async function insertUserInDb(_e: string, _n: string): Promise<Result<User, DbError>> {
  return { ok: true, value: { id: 'u-1', email: _e, name: _n } };
}
```

> 🧠 **Erkläre dir selbst:** Warum ist es schlecht wenn ein Repository
> rohe `DbError`-Typen an die Service-Schicht durchleitet? Was weiß der
> Service dann und was sollte er wissen?
>
> **Kernpunkte:** Service sollte Business-Konzepte kennen, keine SQL-Details |
> DbError: technisch (Constraint, Connection) | UserError: Business (nicht gefunden, existiert bereits) |
> Trennung: Layers kommunizieren in ihrer eigenen Sprache |
> Wartbarkeit: DB-Technologie kann gewechselt werden ohne Service zu ändern

---

<!-- /depth -->
## `class`-Fehler typsicher machen
<!-- section:summary -->
Manchmal braucht man Klassen (für `instanceof`, Stacktrace, interop):

<!-- depth:standard -->
Manchmal braucht man Klassen (für `instanceof`, Stacktrace, interop):

```typescript annotated
// Typsichere Error-Klassen mit Discriminant:
class AppError extends Error {
  abstract readonly type: string;
  // ^ 'abstract' in abstrakten Basisklassen — zwingt Subklassen einen Typ zu definieren
}

class ValidationError extends AppError {
  readonly type = 'VALIDATION' as const;
  // ^ 'as const': Literal-Typ 'VALIDATION', nicht 'string'
  constructor(
    public readonly field: string,
    public readonly constraint: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError'; // Für Logging
  }
}

class NotFoundError extends AppError {
  readonly type = 'NOT_FOUND' as const;
  constructor(public readonly resource: string, public readonly id: string) {
    super(`${resource} mit ID ${id} nicht gefunden`);
    this.name = 'NotFoundError';
  }
}

type AppErrorTypes = ValidationError | NotFoundError;

// Typsicherer Error-Handler:
function handleAppError(error: AppErrorTypes): string {
  switch (error.type) {
    case 'VALIDATION':
      return `Validierungsfehler: ${error.field} — ${error.constraint}`;
    case 'NOT_FOUND':
      return `Nicht gefunden: ${error.resource} #${error.id}`;
    default:
      // error.type muss 'never' sein wenn alle Cases abgedeckt
      const _exhaustive: never = error;
      throw new Error(`Unbehandelter Fehler: ${_exhaustive}`);
  }
}

// instanceof funktioniert auch:
try {
  throw new ValidationError('email', 'required', 'E-Mail ist Pflichtfeld');
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(`Feld: ${e.field}`); // ✅ TypeScript weiß: ValidationError
  }
}
```

> 💭 **Denkfrage:** Wann ist `class`-basiertes Error Handling besser als
> Union-Typen? Und wann ist es schlechter?
>
> **Antwort:** Klassen besser:  `instanceof`-Checks, Stacktrace automatisch,
> Interop mit Bibliotheken die Klassen erwarten, Methoden auf Fehlern.
> Union-Typen besser: JSON-Serialisierbarkeit, einfache Erstellung, Deserialisierung,
> Pattern-Matching ohne instanceof, leichter zu testen.
> Empfehlung: Union-Typen als Default, Klassen nur wenn ein konkreter Grund existiert.

---

<!-- /depth -->
## Error-Boundary Pattern
<!-- section:summary -->
In React und Angular gibt es Error Boundaries — Stellen wo Fehler abgefangen werden:

<!-- depth:standard -->
In React und Angular gibt es Error Boundaries — Stellen wo Fehler abgefangen werden:

```typescript annotated
// Generischer Error-Boundary-Typ:
type ErrorBoundary<T, E> = {
  run: () => Promise<T>;
  onError: (error: E) => void;
  onSuccess: (result: T) => void;
};

// Generische Wrapper-Funktion:
async function withErrorBoundary<T, E>(
  operation: () => Promise<Result<T, E>>,
  handlers: {
    onSuccess: (value: T) => void;
    onError: (error: E) => void;
  }
): Promise<void> {
  try {
    const result = await operation();
    if (result.ok) {
      handlers.onSuccess(result.value);
    } else {
      handlers.onError(result.error);
    }
  } catch (unexpected) {
    // Unerwartete Fehler (Bugs) weiterleiten:
    console.error('Unerwarteter Fehler:', unexpected);
    throw unexpected; // Re-throw für globales Error-Handling
  }
}

// In Angular-Komponenten:
// await withErrorBoundary(
//   () => userService.createUser(data),
//   {
//     onSuccess: user => this.router.navigate(['/dashboard']),
//     onError: err => this.errorMessage = getErrorMessage(err)
//   }
// );
```

<!-- depth:vollstaendig -->
> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> function assertNever(x: never): never { throw new Error(`Unhandled: ${JSON.stringify(x)}`); }
>
> type FormError =
>   | { type: 'REQUIRED';    field: string }
>   | { type: 'MIN_LENGTH';  field: string; min: number }
>   | { type: 'MAX_LENGTH';  field: string; max: number }
>   | { type: 'PATTERN';     field: string; pattern: string };
>
> function handleFormError(e: FormError): string {
>   switch (e.type) {
>     case 'REQUIRED':   return `${e.field} ist Pflichtfeld`;
>     case 'MIN_LENGTH': return `${e.field}: mind. ${e.min} Zeichen`;
>     case 'MAX_LENGTH': return `${e.field}: max. ${e.max} Zeichen`;
>     case 'PATTERN':    return `${e.field}: Format ${e.pattern} erwartet`;
>     default:           return assertNever(e);
>   }
> }
>
> const errors: FormError[] = [
>   { type: 'REQUIRED',   field: 'email' },
>   { type: 'MIN_LENGTH', field: 'password', min: 8 },
>   { type: 'PATTERN',    field: 'phone', pattern: '+49...' },
> ];
> errors.forEach(e => console.log(handleFormError(e)));
> ```
>
> Füge jetzt `| { type: 'EMAIL_FORMAT'; field: string }` zur `FormError`-Union hinzu.
> Beobachte: Der Compile-Error erscheint im `default`-Branch von `handleFormError` —
> genau dort wo du vergessen hast, den neuen Fall zu behandeln!

---

<!-- /depth -->
## Fehler-Serialisierung für APIs

```typescript annotated
// Fehler müssen oft als JSON serialisiert werden (HTTP API):
type ApiErrorResponse = {
  error: {
    type: string;
    message: string;
    details?: Record<string, unknown>;
  };
  statusCode: number;
};

type DomainError =
  | { type: 'NOT_FOUND'; resource: string; id: string }
  | { type: 'VALIDATION'; field: string; message: string };

function toApiError(error: DomainError): ApiErrorResponse {
  switch (error.type) {
    case 'NOT_FOUND':
      return {
        statusCode: 404,
        error: {
          type: 'NOT_FOUND',
          message: `${error.resource} #${error.id} nicht gefunden`,
          details: { resource: error.resource, id: error.id }
        }
      };
    case 'VALIDATION':
      return {
        statusCode: 422,
        error: {
          type: 'VALIDATION_ERROR',
          message: error.message,
          details: { field: error.field }
        }
      };
    default:
      return assertNever(error);
  }
}
```

---

## Was du gelernt hast

- **Fehler-Hierarchien mit Union-Typen** sind flexibler als Klassen — serialisierbar, keine instanceof-Fallstricke
- **Error-Konvertierung** zwischen Schichten: DB-Fehler → Domain-Fehler → API-Fehler (jede Schicht spricht ihre Sprache)
- `class`-Fehler mit `readonly type = '...' as const` können auch als Discriminated Union behandelt werden
- **Error-Boundary Pattern**: Erwartete Fehler mit `Result`, unerwartete mit `throw` weiterleiten

> 🧠 **Erkläre dir selbst:** Warum ist es wichtig dass jede Schicht
> (Repository, Service, Controller) eigene Fehler-Typen hat? Was wäre das
> Problem wenn alle Schichten die gleichen Fehler-Typen verwenden?
>
> **Kernpunkte:** Kopplung vermeiden: Service sollte DB-Implementierung nicht kennen |
> Separation of Concerns: DB-Fehlercodes (ORA-12345) gehören nicht in Business-Logik |
> Austauschbarkeit: DB kann gewechselt werden ohne Service zu ändern |
> Testbarkeit: Jede Schicht kann unabhängig getestet werden

**Kernkonzept zum Merken:** Jede Schicht übersetzt Fehler in ihre eigene "Sprache".
Error-Mapping ist Architektur-Arbeit, kein Detail.

---

> **Pausenpunkt** -- Du kennst die wichtigsten Error-Typen-Patterns.
>
> Weiter geht es mit: [Sektion 06: Error Handling in der Praxis](./06-error-handling-praxis.md)
