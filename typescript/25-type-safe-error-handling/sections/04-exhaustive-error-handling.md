# Sektion 4: Exhaustive Error Handling

> Geschätzte Lesezeit: **9 Minuten**
>
> Vorherige Sektion: [03 - Option/Maybe Pattern](./03-option-maybe-pattern.md)
> Nächste Sektion: [05 - Error-Typen Patterns](./05-error-typen-patterns.md)

---

## Was du hier lernst

- Was **exhaustive Prüfung** bei discriminated unions bedeutet
- Den `never`-Trick für compile-Zeit-Vollständigkeitsprüfung
- Wie man **alle Fehlerfälle** sicher abdeckt ohne Runtime-Überraschungen
- `satisfies` (TS 4.9) als Alternative für exhaustive Pattern-Matching

---

## Das Problem: Vergessene Fehlerfälle

> **Hintergrund: Exhaustive Pattern Matching in anderen Sprachen**
>
> Rust's `match` ist **exhaustive by default**: Du musst alle `enum`-Varianten
> abdecken oder der Compiler verweigert die Kompilierung. Das verhindert
> "vergessene" Fehlerfälle zur Laufzeit.
>
> ```rust
> match error {
>   ParseError::Empty => ...,
>   ParseError::Invalid(s) => ...,
>   // Fehlt eine Variante? COMPILE-ERROR!
> }
> ```
>
> TypeScript's `switch` ist NICHT exhaustive by default. Wenn du einen
> neuen Fehler-Typ hinzufügst, kompiliert der Code weiterhin — der neue
> Fall wird stillschweigend ignoriert. Das führt zu Runtime-Bugs bei
> Refactoring.

```typescript annotated
type ApiError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'RATE_LIMITED'; retryAfter: number };

function handleError(error: ApiError): string {
  switch (error.type) {
    case 'NOT_FOUND':      return `404: ${error.message}`;
    case 'UNAUTHORIZED':   return `401: ${error.message}`;
    // 'RATE_LIMITED' vergessen! 
  }
  // TypeScript-Warnung hängt von Einstellungen ab...
  // Ohne Konfiguration: Kein Fehler — aber falsch!
  return 'Unbekannter Fehler'; // Stille Lücke
}

// Später: neuer Fehler-Typ hinzugefügt
type ApiError2 = ApiError | { type: 'SERVER_ERROR'; code: number };
// handleError() behandelt 'SERVER_ERROR' nicht — immer noch kein Compile-Error!
```

---

## Der `never`-Trick: Exhaustive Prüfung erzwingen

```typescript annotated
// Die magische Funktion:
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unhandled case: ${JSON.stringify(value)}`);
  // ^ 'never' als Parameter: TypeScript erlaubt nur Werte vom Typ 'never'
  //   d.h.: KEIN echter Wert kann hier ankommen wenn alle Cases behandelt wurden!
}

type ApiError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'RATE_LIMITED'; retryAfter: number };

function handleError(error: ApiError): string {
  switch (error.type) {
    case 'NOT_FOUND':
      return `404: ${error.message}`;
    case 'UNAUTHORIZED':
      return `401: ${error.message}`;
    case 'RATE_LIMITED':
      return `429: Retry after ${error.retryAfter}s`;
    default:
      return assertNever(error);
      // ^ Wenn alle Cases behandelt: error ist 'never' (unmöglich)
      //   TypeScript: OK ✅
      //   Wenn ein Case fehlt: error ist z.B. { type: 'RATE_LIMITED' }
      //   TypeScript: COMPILE-ERROR — '{ type: RATE_LIMITED }' ≠ 'never'
  }
}
```

> 🧠 **Erkläre dir selbst:** Warum wird `error` im `default`-Branch zu `never`
> wenn alle Cases behandelt wurden? Was bedeutet `never` in diesem Kontext?
>
> **Kernpunkte:** `never` = unmöglicher Typ — kein Wert kann diesen Typ haben |
> Nach `NOT_FOUND` + `UNAUTHORIZED` + `RATE_LIMITED` → `error` hat Typ `never` |
> (Alle Möglichkeiten sind erschöpft) | `assertNever(never)` = OK |
> Wenn eine Variante fehlt: error hat noch echten Typ → `never`-Parameter → COMPILE-ERROR

---

## Exhaustive Prüfung bei Result-Errors

```typescript annotated
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type ParseError =
  | { type: 'EMPTY'; message: string }
  | { type: 'TOO_SHORT'; min: number }
  | { type: 'INVALID_CHARS'; chars: string[] };

function handleParseError(error: ParseError): string {
  switch (error.type) {
    case 'EMPTY':
      return error.message;
    case 'TOO_SHORT':
      return `Mindestens ${error.min} Zeichen erforderlich`;
    case 'INVALID_CHARS':
      return `Ungültige Zeichen: ${error.chars.join(', ')}`;
    default:
      return assertNever(error); // ✅ Exhaustive!
  }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled: ${JSON.stringify(x)}`);
}

// Verwendung mit Result:
function displayError(result: Result<string, ParseError>): void {
  if (result.ok) {
    console.log(`Erfolg: ${result.value}`);
  } else {
    const message = handleParseError(result.error);
    console.log(`Fehler: ${message}`);
  }
}
```

> 💭 **Denkfrage:** Was passiert wenn du `ParseError` einen neuen Typ
> `| { type: 'TOO_LONG'; max: number }` hinzufügst aber `handleParseError`
> nicht aktualisierst? Wann wird der Fehler sichtbar?
>
> **Antwort:** Sofort im Editor — COMPILE-ERROR! Im default-Branch:
> `error` hat Typ `{ type: 'TOO_LONG'; max: number }` — das ist nicht `never`.
> `assertNever(error)` schlägt bei der Kompilierung fehl. TypeScript hat
> dich erinnert bevor du die Lücke veröffentlicht hast.

---

## Exhaustive Checks mit Objekt-Maps
<!-- section:summary -->
Eine Alternative zu `switch` — eleganter für einfache Transformationen:

<!-- depth:standard -->
Eine Alternative zu `switch` — eleganter für einfache Transformationen:

```typescript annotated
type Status = 'LOADING' | 'SUCCESS' | 'ERROR' | 'IDLE';

// Exhaustive Map: ALLE Zustände müssen vorkommen!
const statusMessages: Record<Status, string> = {
  LOADING: 'Wird geladen...',
  SUCCESS: 'Erfolgreich!',
  ERROR:   'Ein Fehler ist aufgetreten',
  IDLE:    'Bereit',
};
// ^ Record<Status, string> erzwingt ALLE Keys!
// Fehlt 'IDLE'? COMPILE-ERROR ✅

function getStatusMessage(status: Status): string {
  return statusMessages[status]; // Immer ein Wert — kein undefined!
}

// Mit Error-Typen:
type ApiError = 'NOT_FOUND' | 'UNAUTHORIZED' | 'RATE_LIMITED';

const errorHandlers: Record<ApiError, (data: unknown) => string> = {
  NOT_FOUND:    () => 'Ressource nicht gefunden',
  UNAUTHORIZED: () => 'Nicht angemeldet',
  RATE_LIMITED: () => 'Zu viele Anfragen',
};

function handleApiError(error: ApiError): string {
  return errorHandlers[error](null);
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> function assertNever(x: never): never {
>   throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
> }
>
> type TrafficLight = 'RED' | 'YELLOW' | 'GREEN';
>
> // Exhaustive mit Record — alle Keys müssen vorkommen:
> const lightActions = {
>   RED:    'Warten',
>   YELLOW: 'Bremsen vorbereiten',
>   GREEN:  'Fahren',
> } satisfies Record<TrafficLight, string>;
>
> // Exhaustive mit switch + assertNever:
> function describeLight(light: TrafficLight): string {
>   switch (light) {
>     case 'RED':    return lightActions.RED;
>     case 'YELLOW': return lightActions.YELLOW;
>     case 'GREEN':  return lightActions.GREEN;
>     default:       return assertNever(light);
>   }
> }
>
> console.log(describeLight('RED'));   // Warten
> console.log(describeLight('GREEN')); // Fahren
> ```
>
> Füge jetzt `'BLINKING'` zu `TrafficLight` hinzu — TypeScript zeigt sofort zwei
> Compile-Errors: einmal im `Record` (fehlender Key) und einmal im `default`-Branch
> (`light` ist nicht mehr `never`). Beide Stellen die du anpassen musst!

---

<!-- /depth -->
## Exhaustive Union-Typen mit `satisfies` (TS 4.9)
<!-- section:summary -->
TypeScript 4.9 fügte `satisfies` hinzu — ein mächtiges Werkzeug:

<!-- depth:standard -->
TypeScript 4.9 fügte `satisfies` hinzu — ein mächtiges Werkzeug:

```typescript annotated
type ApiError = 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR';

// satisfies: Typ prüfen OHNE den Inferenz-Typ zu verengen
const errorConfig = {
  NOT_FOUND:    { message: 'Nicht gefunden', code: 404 },
  UNAUTHORIZED: { message: 'Nicht berechtigt', code: 401 },
  SERVER_ERROR: { message: 'Serverfehler', code: 500 },
} satisfies Record<ApiError, { message: string; code: number }>;
// ^ 'satisfies' prüft: Haben wir alle ApiError-Keys?
// COMPILE-ERROR wenn ein Key fehlt!

// Aber: errorConfig behält seinen spezifischen Typ!
console.log(errorConfig.NOT_FOUND.code); // ✅ TypeScript weiß: code ist number
// (nicht 'unknown' wie bei expliziter Record-Annotation)

// Vs. direkte Annotation:
const errorConfig2: Record<ApiError, { message: string; code: number }> = {
  NOT_FOUND:    { message: '...', code: 404 },
  UNAUTHORIZED: { message: '...', code: 401 },
  SERVER_ERROR: { message: '...', code: 500 },
};
// errorConfig2.NOT_FOUND.code ist 'number' — weniger spezifisch
// (TypeScript weiß nicht dass es 404 ist, nur dass es eine Zahl ist)
```

> 🔍 **Tieferes Wissen: `satisfies` vs `: Type`**
>
> `const x: Record<K, V> = {...}` — TypeScript prüft den Typ UND
> verbreitert den Inferenz-Typ auf `Record<K, V>`. Du verlierst
> spezifische Informationen.
>
> `const x = {...} satisfies Record<K, V>` — TypeScript prüft den Typ
> ABER behält den ursprünglichen Inferenz-Typ. Bestes aus beiden Welten:
> Vollständigkeitsprüfung + spezifische Typen.
>
> `satisfies` ist perfekt für exhaustive Lookup-Tabellen die später
> mit ihren spezifischen Typen weiterverarbeitet werden.

---

<!-- /depth -->
## Exhaustive Prüfung in Produktions-Code

```typescript
// In einer echten Angular-Anwendung:
type AppError =
  | { type: 'API_ERROR'; status: number; message: string }
  | { type: 'VALIDATION_ERROR'; fields: string[]; message: string }
  | { type: 'AUTH_ERROR'; reason: 'expired' | 'invalid' | 'missing' }
  | { type: 'NETWORK_ERROR'; message: string };

function getErrorMessage(error: AppError): string {
  switch (error.type) {
    case 'API_ERROR':
      return `API ${error.status}: ${error.message}`;
    case 'VALIDATION_ERROR':
      return `Validierung fehlgeschlagen: ${error.fields.join(', ')}`;
    case 'AUTH_ERROR':
      return error.reason === 'expired'
        ? 'Sitzung abgelaufen — bitte neu anmelden'
        : 'Nicht autorisiert';
    case 'NETWORK_ERROR':
      return `Netzwerkfehler: ${error.message}`;
    default:
      return assertNever(error); // ← Immer der Guardian!
  }
}
```

---

## Was du gelernt hast

- `switch` ohne `assertNever` ist NICHT exhaustive — neue Fehler werden ignoriert
- **`assertNever(x: never): never`** erzwingt exhaustive Behandlung zur Compile-Zeit
- `Record<UnionType, Value>` erzwingt alle Keys — ist ein exhaustives Objekt-Map
- **`satisfies`** (TS 4.9) prüft Vollständigkeit ohne den Inferenz-Typ zu verbreitern
- Wenn ein neuer Fehler-Typ hinzukommt → Compile-Errors zeigen alle Stellen die behandelt werden müssen

> 🧠 **Erkläre dir selbst:** Warum hat `assertNever` den Parametertyp `never`?
> Was passiert wenn du `assertNever(something)` rufst und `something` nicht `never` ist?
>
> **Kernpunkte:** `never` = unmöglicher Typ | Kein echter Wert kann `never` haben |
> `something` ist nicht `never` → COMPILE-ERROR (Typfehler) |
> Das ist der Trick: TypeScript prüft ob alle Cases abgedeckt sind |
> Wenn alle Cases: exhausted → `error` narrowed to `never` → OK!

**Kernkonzept zum Merken:** `assertNever(error)` im `default`-Branch ist dein
Wächter gegen vergessene Fehlerfälle. Ein Pflicht-Pattern in jedem `switch` über Fehler-Unions.

---

> **Pausenpunkt** -- Exhaustive Error Handling verstanden!
>
> Weiter geht es mit: [Sektion 05: Error-Typen Patterns](./05-error-typen-patterns.md)
