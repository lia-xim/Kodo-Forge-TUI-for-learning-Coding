# Sektion 6: Error Handling in der Praxis — Angular & React

> Geschätzte Lesezeit: **9 Minuten**
>
> Vorherige Sektion: [05 - Error-Typen Patterns](./05-error-typen-patterns.md)
> Nächste Sektion: -- (Ende von L25)

---

## Was du hier lernst

- **Angular HTTP-Requests** mit Result-Typ statt try/catch
- **React async-Komponenten** mit exhaustiver Fehlerbehandlung
- Wann `throw` weiterhin sinnvoll ist (unerwartete Fehler, Initialisierungsfehler)
- Eine vollständige **Fehler-Architektur** für ein SPA

---

## Angular: HTTP-Service mit Result

> **Hintergrund: Observable Fehler-Handling**
>
> Angular's HttpClient throws Observable-Errors — technisch keine `throw`-Exceptions,
> aber semantisch ähnlich. `catchError` ist das Observable-Äquivalent von `try/catch`.
>
> Das Problem: Was ist der Rückgabetyp von `this.http.get<User>(url)`?
> `Observable<User>` — aber es kann `HttpErrorResponse` emittieren.
> Das ist unsichtbar im Typ, genau wie synchrones `throw`.
>
> Lösung: Den Observable-Wert in `Result<User, HttpError>` verpacken.
> Damit wird der Fehler sichtbar im Typ — und der observierende Code
> MUSS ihn behandeln.

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
  // HttpErrorResponse aus Angular — hier simuliert
  const httpErr = err as { status?: number; message?: string; error?: unknown };
  if (!httpErr.status) {
    return { type: 'NETWORK', message: 'Verbindung unterbrochen' };
  }
  switch (httpErr.status) {
    case 401: return { type: 'UNAUTHORIZED', message: 'Bitte anmelden' };
    case 403: return { type: 'FORBIDDEN', message: 'Keine Berechtigung' };
    case 404: return { type: 'NOT_FOUND', message: 'Seite nicht gefunden' };
    default:  return {
      type: 'SERVER_ERROR',
      status: httpErr.status,
      message: httpErr.message ?? 'Unbekannter Fehler'
    };
  }
}
```

Und der Service:

```typescript annotated
// services/user.service.ts (Angular-Stil)
// import { HttpClient } from '@angular/common/http';

class UserService {
  // http: HttpClient — simuliert:
  private http = { get: <T>(url: string) => Promise.resolve({ id: '1', email: 'a@b.de', name: 'Max' } as unknown as T) };

  // Rückgabetyp macht Fehler sichtbar:
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

// Im Component — typsichere Fehlerbehandlung:
async function loadUser(userId: string): Promise<void> {
  const service = new UserService();
  const result = await service.getUser(userId);

  if (result.ok) {
    console.log(`Willkommen, ${result.value.name}!`);
  } else {
    const error = result.error;
    switch (error.type) {
      case 'NOT_FOUND':    console.log('Benutzer nicht gefunden'); break;
      case 'UNAUTHORIZED': console.log('Bitte anmelden'); break;
      case 'NETWORK':      console.log('Keine Verbindung'); break;
      default:             console.log(`Fehler: ${error.type}`);
    }
  }
}
```

> 🧠 **Erkläre dir selbst:** Was ist der Vorteil wenn `getUser()` den
> Typ `Promise<Result<User, HttpError>>` statt `Promise<User>` hat?
> Was wird dadurch im Component-Code erzwungen?
>
> **Kernpunkte:** Component kann den Fehlerfall nicht einfach ignorieren |
> TypeScript erzwingt result.ok-Prüfung bevor value verwendet wird |
> Fehlertyp `HttpError` dokumentiert alle möglichen Fehler-Scenarien |
> switch mit assertNever (optional) verhindert vergessene Fälle

---

## React: async Data Loading mit Result

```typescript annotated
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type FetchError =
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'NETWORK'; message: string }
  | { type: 'PARSE'; message: string };

// Typsichere fetch-Wrapper:
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
      return { ok: false, error: { type: 'PARSE', message: 'Ungültiges Response-Format' } };
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

// Hook-Simulation (für React useEffect):
async function loadUserData(userId: string) {
  const result = await fetchUser(userId);

  // Exhaustive Behandlung:
  if (result.ok) {
    return { state: 'loaded', user: result.value };
  } else {
    const msg = (() => {
      switch (result.error.type) {
        case 'NOT_FOUND': return `Benutzer ${result.error.id} nicht gefunden`;
        case 'NETWORK':   return `Netzwerkfehler: ${result.error.message}`;
        case 'PARSE':     return `Datenfehler: ${result.error.message}`;
        // assertNever hier für exhaustive check
      }
    })();
    return { state: 'error', message: msg };
  }
}
```

---

## Wann weiterhin `throw` verwenden

Nicht alles muss `Result` sein. `throw` ist weiterhin richtig für:

```typescript annotated
// 1. INITIALISIERUNGSFEHLER — wenn die App ohne das nicht laufen kann:
function initDatabase(connectionString: string): Database {
  if (!connectionString) {
    throw new Error("DATABASE_URL ist nicht gesetzt — App kann nicht starten");
    // ^ throw ist richtig: App MUSS stoppen wenn DB fehlt
  }
  return connectToDb(connectionString);
}

// 2. PROGRAMMIERFEHLER (Invariant-Verletzungen):
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Bug: Division durch Null — Aufrufer muss b ≠ 0 garantieren");
  return a / b;
}

// 3. UNRECOVERABLE ERRORS — kein sinnvoller Recovery-Pfad:
function assertAuthenticated(userId: string | null): string {
  if (!userId) throw new Error("FATAL: Operaton ohne Auth aufgerufen");
  return userId;
}

// 4. EXTERNALS die nativ werfen (JSON.parse, fs-Operationen, etc.):
function safeParseJson<T>(json: string): Result<T, string> {
  try {
    return { ok: true, value: JSON.parse(json) as T };    // JSON.parse wirft
  } catch {
    return { ok: false, error: `Ungültiges JSON: ${json.substring(0, 50)}` };
  }
}
// ^ Wrapper: externales throw → Result (sichere Grenze)
```

> 💭 **Denkfrage:** Die Faustregel lautet: `Result` für erwartete Fehler,
> `throw` für unerwartete. Aber was ist "erwartet"? Ist ein Netzwerkfehler
> erwartet oder unerwartet?
>
> **Antwort:** Netzwerkfehler sind ERWARTET — in einer Web-App MUSS man
> damit rechnen dass die Verbindung abbricht. Also: `Result<T, NetworkError>`.
> Ein `JSON.parse`-Crash wegen korrupten Daten ist erwartet wenn du externe
> Daten verarbeitest → Result. Aber ein Null-Pointer in einer internen
> Funktion ist ein Bug → throw. Die Frage: "Kann ein korrektes Programm
> in diese Situation kommen?"

> ⚡ **Experiment:** Oeffne `examples/05-error-types.ts` und baue einen
> eigenen `safeParseJson<T>(json: string): Result<T, ParseError>` Wrapper:
> 1. Fange den `JSON.parse`-throw ab und konvertiere ihn in ein Result
> 2. Verwende ihn in einer `fetchUser`-Funktion die `Result<User, FetchError | ParseError>` zurueckgibt
> 3. Beobachte: Das aeussere `throw` (JSON.parse) wird EINMAL gewrappt —
>    danach fliesst nur noch `Result` durch deine Anwendung.
> 4. Bonus: Schreibe die gleiche Funktion mit try/catch — vergleiche
>    die Lesbarkeit und Typsicherheit.

---

## Vollständige Fehler-Architektur

```typescript
// Empfohlene Schicht-Architektur:
//
// ┌─────────────────────────────────────────────────┐
// │ Presentation (Component/Page)                   │
// │   Result<User, HttpError> → UI anzeigen         │
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
// │   try/catch → Result (externe Systeme werfen)   │
// └─────────────────────────────────────────────────┘
```

> **In deinem Angular-Projekt — sofort anwendbar:**
>
> ```typescript
> // 1. Definiere HttpError in types/errors.ts
> // 2. UserService gibt Result<User, HttpError> zurück
> // 3. Component prüft result.ok und behandelt Fehler schichtenspezifisch
> // 4. assertNever im switch sichert Vollständigkeit
>
> // Das Resultat: Kein unbehandelter Fehler landet in der Console.
> // Jeder Fehler hat einen definierten UI-Zustand.
> ```

---

## Was du gelernt hast

- **Angular HTTP** mit `Result<T, HttpError>` — `catchError` konvertiert zu `Err`
- **React fetch** mit typsicheren Wrappern statt nackte `fetch().then()`
- `throw` bleibt richtig für: Initialisierungsfehler, Bugs, "unreachable" States, externe Systeme wrappen
- Eine vollständige **Fehler-Architektur** hat klare Ebenen: Infra → Domain → Service → Presentation

> 🧠 **Erkläre dir selbst:** Warum ist es wichtig dass auch Render/View-Ebene
> exhaustive Fehler-Behandlung hat (switch + assertNever)?
>
> **Kernpunkte:** Neue Fehler-Typen → Compile-Errors in der UI | Entwickler MUSS
> UI-Design für neuen Fehler liefern | Keine stummen "Unbekannter Fehler"-Anzeigen |
> Typsystem als Checkliste für Vollständigkeit

**Kernkonzept zum Merken:** Error Handling ist Architektur. Definiere Fehler-Typen
pro Schicht, konvertiere zwischen Schichten, und erzwinge Vollständigkeit mit `assertNever`.

---

> **Pausenpunkt** -- L25 abgesschlossen! Exzellent.
>
> Du kannst jetzt Fehler typsicher und exhaustiv behandeln:
> `Result<T,E>`, `Option`, `assertNever`, und schichtenübergreifende Fehler-Konvertierung.
>
> Weiter geht es mit: [L26 — Advanced Patterns](../../26-advanced-patterns/sections/01-builder-pattern.md)
