# Sektion 5: Fehlerbehandlung in RxJS mit TypeScript

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Kombinations-Operatoren](./04-kombinations-operatoren-typen.md)
> Naechste Sektion: [06 - Angular-Patterns: toSignal, async pipe](./06-angular-patterns-tosignal-asyncpipe.md)

---

## Was du hier lernst

- Warum RxJS 7 den Fehlertyp auf `unknown` aenderte — und was das fuer deinen Code bedeutet
- Wie `catchError` mit `unknown` typsicher arbeitet: erst pruefen, dann verwenden
- Das `Result<T, E>`-Pattern mit RxJS fuer typsichere Fehlerbehandlung
- Die besonderen Observable-Typen fuer Fehler: `EMPTY`, `NEVER`, `throwError`

---

## Das groesste Problem: Fehler waren unkontrollierbar typisiert

In RxJS 6 und aelter war der Fehler-Typ in `catchError` und im `error`-Callback schlicht
`any`. Das bedeutete: Du konntest auf jeden Property zugreifen, ohne einen Compile-Fehler
zu bekommen — auch wenn der Zugriff zur Laufzeit crashte.

```typescript
// RxJS 6 — Fehler war 'any' (gefaehrlich!)
observable$.pipe(
  catchError((error) => {  // error: any — keine Sicherheit!
    console.log(error.message);  // Kein Fehler — auch wenn error kein Objekt ist
    console.log(error.status);   // Kein Fehler — auch wenn status nicht existiert
    return EMPTY;
  })
);
```

Dann kam RxJS 7 — und mit ihm eine bewusste Entscheidung, die parallel zur
TypeScript-Entwicklung stand.

> 📖 **Hintergrund: Die synchronisierte Entscheidung**
>
> TypeScript 4.0 (August 2020) fuehrte `useUnknownInCatchVariables` ein, um `catch`-Variablen
> von `any` auf `unknown` umzustellen. TypeScript 4.4 machte das mit dem Kompilierungsflag
> `useUnknownInCatchVariables` zum Standard in `strict`-Modus.
>
> RxJS 7 (April 2021) folgte demselben Prinzip: Fehler in `catchError`, im `error`-Callback
> und in `retry`-Callbacks sind jetzt `unknown`, nicht mehr `any`.
>
> Das war eine koordinierte Bewegung der JavaScript-Oekosystem hin zu sichererem
> Fehler-Handling. Die Botschaft: Fehler koennen ALLES sein — ein Error-Objekt,
> ein String, eine Zahl, `undefined`. Erzwinge Pruefungen bevor du auf Properties zugreifst.

---

## catchError mit unknown — Erst pruefen, dann verwenden

```typescript annotated
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface AppError {
  message: string;
  code: string;
  retryable: boolean;
}

// Seit RxJS 7: error ist 'unknown' — TypeScript erzwingt Pruefung
observable$.pipe(
  catchError((error: unknown) => {
    // ERST pruefen, DANN verwenden — Type Narrowing notwendig!

    if (error instanceof HttpErrorResponse) {
      // error: HttpErrorResponse — TypeScript narrowt hier automatisch
      if (error.status === 401) {
        this.authService.redirectToLogin();
        return EMPTY;  // Observable<never> — gibt nichts aus
      }
      if (error.status >= 500) {
        return throwError(() => ({
          message: 'Server-Fehler',
          code: `HTTP_${error.status}`,
          retryable: true,
        } satisfies AppError));  // satisfies prueft die Form
      }
    }

    if (error instanceof TypeError) {
      // error: TypeError — TypeScript narrowt
      console.error('Netzwerk- oder Programmfehler:', error.message);
      return throwError(() => ({
        message: error.message,
        code: 'TYPE_ERROR',
        retryable: false,
      } satisfies AppError));
    }

    // Fallback: Unbekannter Fehler — NICHT auf Properties zugreifen!
    return throwError(() => ({
      message: 'Unbekannter Fehler',
      code: 'UNKNOWN',
      retryable: false,
    } satisfies AppError));
  })
);
```

> 🧠 **Erklaere dir selbst:** Warum ist `error: unknown` sicherer als `error: any`?
> Was konkret verhindert TypeScript, wenn der Typ `unknown` ist?
> **Kernpunkte:** `unknown` erlaubt keinen Property-Zugriff ohne vorherige Pruefung |
> `any` deaktiviert alle Pruefungen komplett | `instanceof` narrowt von `unknown` zu
> dem konkreten Typ | `any` ist ansteckend — es breitet sich auf Properties aus |
> `unknown` zwingt zur expliziten Typ-Pruefung an jedem Punkt

---

## Das Result-Pattern — Fehler als Teil des Typs

Eine elegantere Loesung: Fehler werden nicht als Pipeline-Abbruch modelliert,
sondern als normaler Wert im Observable-Stream. Das Result-Pattern macht Fehler
zu einem **ersten Klasse-Wert**:

```typescript annotated
// Result<T, E> — typsicheres Either-Pattern
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Hilfsfunktionen — keine Laufzeit-Abhaengigkeit
const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
const err = <E>(error: E): Result<never, E> => ({ success: false, error });

// safeRequest: HTTP-Fehler werden zu Observable<Result<T, AppError>>
function safeRequest<T>(
  request$: Observable<T>
): Observable<Result<T, AppError>> {
  return request$.pipe(
    map(data => ok(data)),
    // ^ Erfolg: { success: true, data: T }
    catchError((error: unknown) => of(err(parseError(error))))
    // ^ Fehler: { success: false, error: AppError } — wird zu normalem Wert!
    // 'of' wrappt den Fehler als normalen Observable-Wert
  );
}

function parseError(error: unknown): AppError {
  if (error instanceof HttpErrorResponse) {
    return { message: error.message, code: `HTTP_${error.status}`, retryable: error.status >= 500 };
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'ERROR', retryable: false };
  }
  return { message: 'Unbekannter Fehler', code: 'UNKNOWN', retryable: false };
}

// Verwendung — kein catchError mehr noetig in der Pipeline!
const userResult$ = safeRequest(this.http.get<User>('/api/user'));
// Typ: Observable<Result<User, AppError>>

userResult$.pipe(
  map(result => {
    if (result.success) {
      return result.data.name;  // result.data: User — TypeScript weiss es
    }
    return `Fehler: ${result.error.message}`;  // result.error: AppError — typisiert
  })
).subscribe(console.log);
```

> 💭 **Denkfrage:** Das Result-Pattern klingt nach mehr Code. Wann ist es das wert,
> und wann genuegt einfaches `catchError`?
>
> **Antwort:** `catchError` genuegt wenn Fehler zu einem einheitlichen Fallback fuehren
> (z.B. leeres Array zeigen). Das Result-Pattern lohnt sich wenn die Komponente
> **unterschiedlich** auf Erfolg und Fehler reagieren muss — etwa Fehlermeldungen
> direkt im Template anzeigen ohne subscribe-Logik zu duplizieren. In Angular 17+
> mit Signals ist das Result-Pattern besonders elegant: `toSignal(safeRequest(...))`.

---

## retry und retryWhen — Mit Typen

`retry` ist vollstaendig typisiert und der Fehler bleibt `unknown`:

```typescript annotated
import { retry, timer } from 'rxjs';

// Einfaches retry — 3 Versuche
const withRetry$ = this.http.get<User[]>('/api/users').pipe(
  retry({ count: 3, delay: 1000 })
  // count: number, delay: number | ((error: unknown, retryCount: number) => Observable<unknown>)
);

// Exponential Backoff — Wartezeit verdoppelt sich mit jedem Versuch
const withBackoff$ = this.http.get<User[]>('/api/users').pipe(
  retry({
    count: 5,
    delay: (error: unknown, count: number) => {
      // error: unknown — TypeScript erzwingt auch hier Pruefungen
      if (error instanceof HttpErrorResponse && error.status === 404) {
        // 404 ist kein Netzwerkfehler — retry macht keinen Sinn
        return throwError(() => error);
      }
      const waitTime = Math.min(1000 * Math.pow(2, count), 30000);
      // ^ 1s, 2s, 4s, 8s, 16s — maximal 30s
      console.log(`Versuch ${count}/5, warte ${waitTime}ms...`);
      return timer(waitTime);  // Observable<number> — gibt nach waitTime ms aus
    }
  })
);
```

---

## EMPTY, NEVER und throwError — Die Sonder-Typen

Diese drei Konstanten/Funktionen haben besondere TypeScript-Typen:

```typescript annotated
import { EMPTY, NEVER, throwError } from 'rxjs';

// EMPTY: Observable<never>
// Emittiert sofort complete() ohne einen einzigen Wert
// 'never' passt: Es kommt kein Wert, und never ist der Bottom-Type
const nothingHere = EMPTY;
// Typ: Observable<never>
// Verwendung: In catchError wenn du die Pipeline einfach beenden willst

// NEVER: Observable<never>
// Emittiert nie — weder Wert noch complete() noch error()
// Simuliert einen unendlichen Strom ohne Inhalt
const infiniteBlank = NEVER;
// Typ: Observable<never>
// Verwendung: Zum Testen von Timeouts

// throwError: Gibt Observable<never> zurueck
// Erzeugt ein Observable das sofort mit einem Fehler abbricht
const failing$ = throwError(() => new Error('Etwas lief schief'));
// Typ: Observable<never> — es gibt keinen Wert, nur den Fehler

// Warum Observable<never>?
// 'never' passt perfekt: Diese Observables emittieren nie einen Wert T.
// In catchError kannst du sie trotzdem als Observable<T> zurueckgeben —
// denn never ist ein Subtyp von jedem T (Bottom-Type!)
const safe$ = this.http.get<User>('/api/user').pipe(
  catchError(() => EMPTY)
  // EMPTY ist Observable<never>, gibt zurück als Observable<User>
  // TypeScript akzeptiert das: never extends User (Bottom-Type-Regel)
);
```

> 🧠 **Erklaere dir selbst:** Warum ist es korrekt, `EMPTY` (Observable<never>) in einem
> `catchError` zurueckzugeben, das eigentlich `Observable<User>` erwartet?
> **Kernpunkte:** never ist der Bottom-Type — er ist jedem Typ zuweisbar |
> `catchError` erwartet ein Observable des urspruenglichen Typs ODER never |
> EMPTY emittiert nie einen Wert — es kann also nie einen falschen Typ zurueckgeben |
> Das Typsystem und das Laufzeit-Verhalten stimmen ueberein: Keine Emission, kein Typ-Problem

---

## Experiment-Box: Fehlerbehandlung in der Praxis

Probiere das Result-Pattern mit einem simulierten HTTP-Request:

```typescript
import { Observable, of, throwError, EMPTY } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';

type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function simulatedRequest(fail: boolean): Observable<{ id: number; name: string }> {
  if (fail) {
    return throwError(() => new Error('Netzwerkfehler'));
  }
  return of({ id: 1, name: 'Test-User' });
}

function safeGet<T>(req: Observable<T>): Observable<Result<T>> {
  return req.pipe(
    map(value => ({ ok: true as const, value })),
    catchError((err: unknown) => of({
      ok: false as const,
      error: err instanceof Error ? err.message : 'Unbekannt',
    }))
  );
}

// Hover ueber result$ — welchen Typ inferiert TypeScript?
const result$ = safeGet(simulatedRequest(true));

result$.subscribe(result => {
  if (result.ok) {
    console.log('Name:', result.value.name);  // result.value: { id: number; name: string }
  } else {
    console.log('Fehler:', result.error);     // result.error: string
  }
});
```

---

## Angular-Bezug: Fehlerbehandlung in Services

```typescript annotated
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Typsichere Fehlerbehandlung mit Result-Pattern
  getUser(id: string): Observable<Result<User, AppError>> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      map(user => ok(user)),
      catchError((error: unknown) => {
        // error: unknown — erzwingt Typ-Pruefung
        const appError = this.parseError(error);
        // Nicht throwError — Fehler als normaler Wert!
        return of(err(appError));
      })
    );
  }

  private parseError(error: unknown): AppError {
    if (error instanceof HttpErrorResponse) {
      return {
        message: error.error?.message ?? error.message,
        code: `HTTP_${error.status}`,
        retryable: error.status >= 500,
      };
    }
    return { message: 'Unbekannter Fehler', code: 'UNKNOWN', retryable: false };
  }
}

// In der Komponente:
@Component({ ... })
class UserComponent {
  private api = inject(ApiService);

  user$ = this.api.getUser('123').pipe(
    // result: Result<User, AppError> — vollstaendig typisiert
    map(result => result.success ? result.data : null)
  );
}
```

> ⚡ **Praxis-Tipp:** In Angular mit HttpInterceptors kann man Fehler global abfangen.
> Aber selbst dort solltest du den Fehler-Typ pruefen: `error instanceof HttpErrorResponse`
> bevor du Properties verwendest. Der Interceptor bekommt `unknown` — nicht `HttpErrorResponse`.

---

## Was du gelernt hast

- RxJS 7 aenderte Fehler-Typen von `any` auf `unknown` — synchron mit TypeScript 4.0's `useUnknownInCatchVariables`
- `catchError((error: unknown) => ...)` erzwingt Type Narrowing: erst `instanceof`-Pruefung, dann Property-Zugriff
- Das Result-Pattern macht Fehler zu normalen Stream-Werten: `Observable<Result<T, E>>` statt Pipeline-Abbruch
- `EMPTY` und `throwError()` haben den Typ `Observable<never>` — der Bottom-Type macht sie zu gueltigem Rueckgabewert in `catchError`
- `retry({ count, delay })` gibt bei `delay`-Funktion den Fehler als `unknown` — auch dort kein direkter Property-Zugriff ohne Pruefung

**Kernkonzept:** `unknown` in `catchError` ist kein Hindernis, sondern Schutz. Es erzwingt
das, was guter Fehler-Handling-Code sowieso tun sollte: Erst verstehen was der Fehler ist,
dann handeln. Das Typsystem macht diese Best Practice zur Pflicht.

---

> **Pausenpunkt** — Fehlerbehandlung ist das Thema das in Produktionssystemen den
> Unterschied macht. Du weisst jetzt wie TypeScript dabei hilft, Fehler nicht zu verpassen.
>
> Weiter geht es mit: [Sektion 06: Angular-Patterns — toSignal, async pipe](./06-angular-patterns-tosignal-asyncpipe.md)
