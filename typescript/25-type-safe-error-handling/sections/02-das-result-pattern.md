# Sektion 2: Das Result-Pattern

> Geschätzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Das Exception-Problem](./01-das-exception-problem.md)
> Nächste Sektion: [03 - Option/Maybe Pattern](./03-option-maybe-pattern.md)

---

## Was du hier lernst

- Wie `Result<T, E>` aussieht und wie man ihn definiert
- **Discriminated Unions** als Basis für Result
- Wie man `Result` mit Hilfsfunktionen ergonomisch verwendet
- TypeScript's `as const` für schmale Typen in Result-Objekten

---

## Das Result-Pattern: Die Grundstruktur

> **Hintergrund: Haskell's `Either` und Rust's `Result`**
>
> In Haskell gibt es `Either a b` — ein Wert ist entweder `Left a` (Fehler)
> oder `Right b` (Erfolg). Die Konvention: `Left` = Fehler, `Right` = Erfolg
> (Merkhilfe: "right" = richtig).
>
> Rust hat `Result<T, E>` mit `Ok(T)` und `Err(E)`. Der `?`-Operator
> macht Error-Propagation syntaktisch schlank.
>
> TypeScript hat weder `Either` noch `Result` eingebaut. Aber mit
> **Discriminated Unions** und einem einfachen Interface können wir
> ein vollständiges Result-Pattern selbst aufbauen — ohne externe Dependencies.

```typescript annotated
// Die Basis-Definition: Discriminated Union
type Ok<T>  = { readonly ok: true;  readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
//             ^^^^^^^^^            ^^^^^^^^^^^^^^^^
//             Discriminant:        Fehler-Wert (typisiert!)
//             'ok' als boolean literal

type Result<T, E = string> = Ok<T> | Err<E>;
//                ^^^^^^^^^
//                Default: string für einfache Fälle

// TypeScript's Discriminated Union-Mechanismus:
// Wenn ok === true → TypeScript weiß: value existiert (Typ T)
// Wenn ok === false → TypeScript weiß: error existiert (Typ E)

// Helper-Konstruktoren (optional aber empfohlen):
function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

function err<E>(error: E): Err<E> {
  return { ok: false, error };
}
```

---

## Result in der Praxis: Email-Parsing

```typescript annotated
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

type Email = string & { readonly __brand: 'Email' };

function parseEmail(raw: string): Result<Email> {
  // Result<Email> = Result<Email, string> (Default E = string)
  const normalized = raw.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!normalized) {
    return { ok: false, error: 'E-Mail darf nicht leer sein' };
    // ^ ok: false + error: string → Err<string>
  }

  if (!emailRegex.test(normalized)) {
    return { ok: false, error: `'${raw}' ist keine gültige E-Mail-Adresse` };
  }

  return { ok: true, value: normalized as Email };
  // ^ ok: true + value: Email → Ok<Email>
}

// Verwendung — TypeScript erzwingt die Überprüfung:
const result = parseEmail("  MAX@EXAMPLE.COM  ");

if (result.ok) {
  // Hier: TypeScript weiß 'result' ist Ok<Email>!
  console.log(`Erfolgreich: ${result.value}`);
  //                          ^^^^^^^^^^^^ Typ: Email (nicht undefined!)
} else {
  // Hier: TypeScript weiß 'result' ist Err<string>!
  console.log(`Fehler: ${result.error}`);
  //                     ^^^^^^^^^^^^ Typ: string (nicht undefined!)
}

// KEIN Zugriff auf das andere Property möglich:
// if (result.ok) { result.error; } // ❌ COMPILE-ERROR
// ^ In ok-Branch: error existiert nicht; TypeScript prüft das!
```

> 🧠 **Erkläre dir selbst:** Warum nennt man es "Discriminated Union"?
> Was ist der "Discriminant" und was macht er für TypeScript?
>
> **Kernpunkte:** Discriminant = gemeinsames Property mit Literal-Typ |
> `ok: true` vs `ok: false` → Literals, nicht booleans! |
> TypeScript nutzt Literal-Werte um den Branch zu "verengen" (narrowing) |
> Im `if (result.ok)` Branch → TypeScript weiß: `Ok<T>` → `value` existiert

---

## `as const` für exaktere Typen

Ein häufiger Fallstrick bei Result-Objekten:

```typescript annotated
// PROBLEM: Boolean-Inferenz ist zu breit
const r1 = { ok: true, value: 42 };
// Typ: { ok: boolean, value: number }
//          ^^^^^^^ boolean — NICHT 'true'!
// Das ist kein Discriminated Union mehr!

// LÖSUNG 1: as const
const r2 = { ok: true as const, value: 42 };
// Typ: { ok: true, value: number }
//          ^^^^ 'true' (literal) — Discriminated Union ✅

// LÖSUNG 2: Explizite Typ-Annotation
const r3: { ok: true; value: number } = { ok: true, value: 42 };

// LÖSUNG 3: Helper-Funktion (empfohlen!)
function ok<T>(value: T) {
  return { ok: true as const, value };
  // 'true as const' → Rückgabetyp: { ok: true; value: T }
}

function err<E>(error: E) {
  return { ok: false as const, error };
}

// Elegante Verwendung:
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err('Division durch Null');
  return ok(a / b);
}
```

> 💭 **Denkfrage:** Warum ist `{ ok: boolean, value: number }` kein Discriminated
> Union? Was ist der Unterschied zwischen `boolean` und dem Literal `true`?
>
> **Antwort:** `boolean = true | false`. TypeScript kann mit `boolean` nicht
> narrowen — es weiß nicht welchen Wert `ok` hat. Erst `ok: true` (Literal)
> macht Narrowing möglich: Im `if(r.ok)`-Branch → `ok` ist definitiv `true`.

---

## Chaining mit Result: `map` und `flatMap`

Result-Typen werden erst wirklich elegant mit Chaining-Methoden:

```typescript annotated
// Helfer-Funktionen für Result-Transformationen:

function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (!result.ok) return result;
  // ^ Fehler durchleiten — fn wird nicht aufgerufen
  return ok(fn(result.value));
  // ^ Erfolg: fn anwenden und neues Ok erstellen
}

function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (!result.ok) return result;
  return fn(result.value);
  // ^ fn gibt selbst ein Result zurück — kein verschachteltes Ok(Ok(..))!
}

// Verwendung — Kette ohne .ok-Checks:
const emailResult = parseEmail("max@example.com");

const uppercasedResult = mapResult(
  emailResult,
  email => email.toUpperCase() // string-Methode — Email ist Subtyp von string!
);

console.log(uppercasedResult);
// ok === true  → { ok: true, value: 'MAX@EXAMPLE.COM' }
// ok === false → { ok: false, error: '...' } (unverändert)

// Mehrere Schritte chain:
function processInput(raw: string): Result<number, string> {
  return flatMapResult(
    parseEmail(raw),
    email => {
      const len = email.length;
      return len > 5 ? ok(len) : err('E-Mail zu kurz');
    }
  );
}
```

> **Experiment:** Öffne `examples/02-result-pattern.ts` und:
> 1. Schreibe `mapResult` und `flatMapResult` selbst.
> 2. Kette drei Schritte: `parseEmail → mapToUserId → validateUserExists`.
> 3. Beobachte: Fehler aus jedem Schritt werden automatisch durchgeleitet!

---

## Typisierte Fehler: Error-Discriminated-Unions

Statt `string` als Fehler-Typ sind **spezifische Fehler-Typen** mächtiger:

```typescript annotated
// Typisierte Error-Union:
type ParseError =
  | { type: 'EMPTY_INPUT'; message: string }
  | { type: 'INVALID_FORMAT'; message: string; input: string }
  | { type: 'TOO_SHORT'; message: string; minLength: number };

type Email = string & { readonly __brand: 'Email' };

function parseEmail(raw: string): Result<Email, ParseError> {
  if (!raw.trim()) {
    return err({ type: 'EMPTY_INPUT', message: 'E-Mail darf nicht leer sein' });
  }

  const normalized = raw.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(normalized)) {
    return err({
      type: 'INVALID_FORMAT',
      message: `Ungültige E-Mail-Adresse`,
      input: raw
    });
  }

  if (normalized.length < 5) {
    return err({ type: 'TOO_SHORT', message: 'E-Mail zu kurz', minLength: 5 });
  }

  return ok(normalized as Email);
}

// Exhaustive Fehlerbehandlung:
const result = parseEmail("x");

if (result.ok) {
  console.log(`E-Mail: ${result.value}`);
} else {
  const error = result.error; // Typ: ParseError
  switch (error.type) {
    case 'EMPTY_INPUT':
      console.log(`Leer: ${error.message}`);
      break;
    case 'INVALID_FORMAT':
      console.log(`Ungültig: ${error.input} → ${error.message}`);
      break;
    case 'TOO_SHORT':
      console.log(`Zu kurz: min ${error.minLength} Zeichen`);
      break;
    // TypeScript warnt wenn ein case fehlt (mit noImplicitReturns!)
  }
}
```

> **In deinem Angular-Projekt:**
>
> ```typescript
> type HttpError =
>   | { type: 'NOT_FOUND'; id: string }
>   | { type: 'UNAUTHORIZED'; message: string }
>   | { type: 'SERVER_ERROR'; status: number; message: string };
>
> @Injectable({ providedIn: 'root' })
> class UserService {
>   getUser(id: UserId): Observable<Result<User, HttpError>> {
>     return this.http.get<User>(`/api/users/${id}`).pipe(
>       map(user => ok(user)),
>       catchError((err: HttpErrorResponse) => {
>         const error: HttpError = err.status === 404
>           ? { type: 'NOT_FOUND', id }
>           : err.status === 401
>           ? { type: 'UNAUTHORIZED', message: err.message }
>           : { type: 'SERVER_ERROR', status: err.status, message: err.message };
>         return of(this.err(error));
>       })
>     );
>   }
> }
> ```

---

## Was du gelernt hast

- `Result<T, E>` ist eine Discriminated Union: `{ ok: true; value: T } | { ok: false; error: E }`
- **Narrowing** durch Discriminant: Im `if(result.ok)`-Branch weiß TypeScript den genauen Typ
- `as const` verhindert zu breite Typ-Inferenz bei `ok: boolean` → `ok: true`
- `mapResult`/`flatMapResult` ermöglichen Chaining ohne geschachtelte `if`-Blöcke
- **Typisierte Fehler** (`ParseError` als discriminated union) ermöglichen exhaustive Fehlerbehandlung

> 🧠 **Erkläre dir selbst:** Was ist der Unterschied zwischen `Result<T, string>` und
> `Result<T, ParseError>` als Fehler-Typ? Wann ist welcher Ansatz besser?
>
> **Kernpunkte:** string → einfach aber informationsarm | ParseError → Information+Typ |
> string gut für: prototyping, einfache Validierung | ParseError gut für: produktiver Code,
> Fehler die unterschiedlich behandelt werden sollen | Exhaustive switch nur mit Union-Typ

**Kernkonzept zum Merken:** `Result<T, E>` macht Fehler sichtbar und erzwingt Behandlung.
Der Compiler wird zum Wächter — nicht du.

---

> **Pausenpunkt** -- Du beherrschst jetzt das Result-Pattern.
>
> Weiter geht es mit: [Sektion 03: Option/Maybe Pattern](./03-option-maybe-pattern.md)
