# Sektion 4: Generische Async-Patterns — retry, timeout, race

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Error Handling in Async](./03-error-handling-async.md)
> Naechste Sektion: [05 - AsyncIterable und Generators](./05-async-iterable-generators.md)

---

## Was du hier lernst

- Wie du generische Wrapper-Funktionen fuer Async-Operationen baust
- Das `retry<T>`-Pattern mit exponential Backoff und Typsicherheit
- Das `timeout<T>`-Pattern mit AbortController und Typ-Narrowing
- Wie `Promise.race()` fuer Timeout-Patterns genutzt wird

---

## Das Prinzip: Generische Async-Wrapper

Viele Async-Operationen folgen dem gleichen Muster: Du hast eine
Operation, die fehlschlagen kann, und willst Retry-Logik, Timeouts
oder Fallbacks hinzufuegen — ohne den Typ der Operation zu verlieren.

> 📖 **Hintergrund: Das Decorator-Prinzip bei Async**
>
> In der funktionalen Programmierung nennt man das "Higher-Order Functions":
> Funktionen die andere Funktionen wrappen und Verhalten hinzufuegen.
> In der OOP-Welt ist es das Decorator-Pattern. TypeScript's Generics
> machen beides typsicher — der Wrapper-Typ wird vom gewrappten Typ
> bestimmt, ohne manuelles Casten.
>
> Dieses Prinzip wurde populaer durch Libraries wie `p-retry`, `p-timeout`
> und `p-queue` von Sindre Sorhus — einzelne, fokussierte Utility-Funktionen
> die sich kombinieren lassen.

---

## Pattern 1: retry<T> mit Typsicherheit

```typescript annotated
interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff?: "linear" | "exponential";
  // ^ Optionaler Backoff-Modus — Standardwert in der Implementierung
  shouldRetry?: (error: unknown) => boolean;
  // ^ Optional: Entscheidet ob ein Fehler retryable ist
}

async function retry<T>(
  fn: () => Promise<T>,
  // ^ Generischer Parameter T — wird aus fn inferiert!
  options: RetryOptions
): Promise<T> {
  // ^ Rueckgabetyp ist Promise<T> — gleicher Typ wie fn()
  const { maxAttempts, delayMs, backoff = "exponential", shouldRetry } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
      // ^ Bei Erfolg: T wird direkt zurueckgegeben
    } catch (error) {
      lastError = error;
      if (shouldRetry && !shouldRetry(error)) {
        throw error;
        // ^ Nicht-retryable Fehler sofort weitergeben
      }
      if (attempt < maxAttempts) {
        const delay = backoff === "exponential"
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
  // ^ Nach maxAttempts: letzten Fehler weiterwerfen
}

// Verwendung — T wird automatisch inferiert:
const user = await retry(
  () => fetchUser("123"),
  // ^ fn: () => Promise<User> → T = User
  { maxAttempts: 3, delayMs: 1000 }
);
// ^ user: User — volle Typinferenz!
```

> 💭 **Denkfrage:** Warum nimmt `retry` eine Funktion `() => Promise<T>`
> statt direkt ein `Promise<T>`? Was waere der Unterschied?
>
> **Antwort:** Ein Promise wird sofort gestartet wenn es erstellt wird.
> Wenn du `retry(fetchUser("123"), ...)` schreibst, ist der fetch
> schon gestartet — retry koennte ihn nicht nochmal starten. Mit
> `() => fetchUser("123")` kann retry die Funktion bei jedem Versuch
> NEU aufrufen.

---

## Pattern 2: timeout<T> mit AbortController

```typescript annotated
class TimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
    // ^ Eigener Error-Name fuer instanceof-Checks
  }
}

async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  // ^ Die Funktion bekommt ein AbortSignal — damit kann sie abbrechen
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await fn(controller.signal);
    // ^ T wird aus fn inferiert
    return result;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new TimeoutError(timeoutMs);
      // ^ Timeout-Fall: eigene Error-Klasse werfen
    }
    throw error;
    // ^ Anderer Fehler: weiterwerfen
  } finally {
    clearTimeout(timeoutId);
    // ^ Immer aufraeumen — sonst Memory Leak!
  }
}

// Verwendung:
const user = await withTimeout(
  (signal) => fetch("/api/users/123", { signal }).then(r => r.json()),
  // ^ signal wird an fetch weitergegeben — fetch bricht bei Timeout ab
  5000
);
// ^ user: any — wegen json(). Besser: explizite Annotation oder Zod
```

> 🧠 **Erklaere dir selbst:** Warum ist `AbortController` besser als
> ein einfaches `Promise.race()` mit einem Timeout-Promise? Was passiert
> mit der Original-Operation bei einem reinen race?
>
> **Kernpunkte:** Promise.race ignoriert das langsame Promise — es laeuft
> weiter! | AbortController bricht die Operation tatsaechlich ab |
> Ohne Abort: Netzwerk-Request laueft weiter, verbraucht Bandbreite |
> fetch() unterstuetzt signal nativ

---

## Pattern 3: Promise.race fuer Competitive Patterns

Manchmal willst du die schnellste von mehreren Quellen:

```typescript annotated
// Typ: Promise.race<T[]>(promises: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>
// → Der Rueckgabetyp ist die Union aller moeglichen Werte

// Pattern: Fastest Response Wins
async function fetchWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  // ^ T fuer beide Quellen gleich — Rueckgabetyp ist Promise<T>
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs)
  );
  // ^ Promise<never> — resolve wird nie aufgerufen
  // Dadurch ist der Union-Typ: T | never = T (never verschwindet)

  try {
    return await Promise.race([primary(), timeoutPromise]);
    // ^ Typ: Promise<T | never> = Promise<T>
  } catch {
    return fallback();
    // ^ Fallback bei Timeout oder Fehler
  }
}

// Verwendung:
const config = await fetchWithFallback(
  () => fetchRemoteConfig(),
  () => loadLocalConfig(),
  3000
);
// ^ config: Config — Typ-Inferenz aus den Funktionen
```

> 🔬 **Experiment:** Kombiniere retry und timeout zu einem robusten
> Fetch-Wrapper:
>
> ```typescript
> async function robustFetch<T>(
>   url: string,
>   options?: { retries?: number; timeoutMs?: number }
> ): Promise<T> {
>   const { retries = 3, timeoutMs = 5000 } = options ?? {};
>
>   return retry(
>     () => withTimeout(
>       (signal) => fetch(url, { signal }).then(r => {
>         if (!r.ok) throw new Error(`HTTP ${r.status}`);
>         return r.json() as Promise<T>;
>       }),
>       timeoutMs
>     ),
>     { maxAttempts: retries, delayMs: 1000 }
>   );
> }
>
> // Teste: Was ist der Typ von result?
> const result = await robustFetch<User[]>("/api/users");
> // result: User[] — der Typ-Parameter wird durchgereicht
> ```

---

## Pattern 4: Debounce und Throttle mit Typen

Besonders in UIs (Angular, React) brauchst du typsichere Debounce:

```typescript annotated
function debounceAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  // ^ Generics fuer Argumente UND Rueckgabetyp
  delayMs: number
): (...args: TArgs) => Promise<TResult> {
  // ^ Rueckgabetyp: gleiche Signatur wie fn
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingReject: ((reason: Error) => void) | null = null;

  return (...args: TArgs): Promise<TResult> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingReject?.(new Error("Debounced"));
    }
    return new Promise<TResult>((resolve, reject) => {
      pendingReject = reject;
      timeoutId = setTimeout(async () => {
        try {
          resolve(await fn(...args));
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  };
}

// Verwendung — Typen werden korrekt inferiert:
const debouncedSearch = debounceAsync(
  (query: string) => searchAPI(query),
  // ^ TArgs = [string], TResult = SearchResult[]
  300
);
const results = await debouncedSearch("typescript");
// ^ results: SearchResult[] — volle Typinferenz
```

> ⚡ **Praxis-Tipp fuer Angular und React:**
>
> ```typescript
> // Angular: debounceTime ist das RxJS-Aequivalent
> this.searchInput.valueChanges.pipe(
>   debounceTime(300),
>   switchMap(query => this.searchService.search(query))
> ).subscribe(results => { /* results: SearchResult[] */ });
>
> // React: useDeferredValue oder custom Hook
> function useDebounced<T>(value: T, delayMs: number): T {
>   const [debounced, setDebounced] = useState(value);
>   useEffect(() => {
>     const id = setTimeout(() => setDebounced(value), delayMs);
>     return () => clearTimeout(id);
>   }, [value, delayMs]);
>   return debounced;
> }
> ```

---

## Kombination: Die Utility-Toolbox

Die Patterns lassen sich beliebig kombinieren, und TypeScript
behaelt die Typen bei:

```typescript
// Alles zusammen:
async function loadDashboard(userId: string) {
  const [user, posts, notifications] = await Promise.all([
    retry(() => withTimeout(
      (signal) => fetchUser(userId, signal),
      5000
    ), { maxAttempts: 3, delayMs: 1000 }),

    retry(() => fetchPosts(userId), { maxAttempts: 2, delayMs: 500 }),

    fetchWithFallback(
      () => fetchNotifications(userId),
      () => Promise.resolve([]),
      3000
    ),
  ]);
  // user: User, posts: Post[], notifications: Notification[]
  // Alle Typen korrekt inferiert durch Promise.all Tupel!
  return { user, posts, notifications };
}
```

---

## Was du gelernt hast

- Generische Wrapper (`retry<T>`, `withTimeout<T>`) erhalten den Typ der gewrappten Operation
- `retry` nimmt `() => Promise<T>` (nicht `Promise<T>`), damit die Operation wiederholbar ist
- `AbortController` bricht Operationen wirklich ab — `Promise.race` laesst sie weiterlaufen
- `Promise<never>` als Timeout-Promise verschwindet in der Union: `T | never = T`
- Alle Patterns sind kombinierbar — TypeScript behaelt die Tupel-Typen bei `Promise.all`

**Kernkonzept zum Merken:** Generische Async-Wrapper sind Higher-Order Functions fuer Promises. Der Typparameter `T` fliesst durch jede Schicht hindurch — du brauchst nie manuell zu casten, wenn die Signaturen stimmen.

---

> **Pausenpunkt** — Du hast jetzt eine solide Toolbox fuer robusten
> Async-Code. Die naechste Sektion taucht in die Welt der Async
> Iterators ein.
>
> Weiter geht es mit: [Sektion 05: AsyncIterable und Generators](./05-async-iterable-generators.md)
