# Sektion 3: Error Handling in Async Code

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - async/await und Typinferenz](./02-async-await-typinferenz.md)
> Naechste Sektion: [04 - Generische Async-Patterns](./04-generische-async-patterns.md)

---

## Was du hier lernst

- Warum `try/catch` in TypeScript den Fehlertyp als `unknown` (oder `any`) behandelt
- Wie du `useUnknownInCatchVariables` aktivierst und warum es wichtig ist
- Patterns fuer typsicheres Error Handling bei async/await
- Wie du das Result-Pattern (L25) mit Async-Code kombinierst

---

## Das Problem: catch kennt den Fehlertyp nicht

Das groesste Problem bei Async Error Handling in TypeScript ist, dass
`catch` den Fehlertyp nicht kennt — weder bei `try/catch` noch bei
`.catch()`:

```typescript annotated
async function fetchUser(id: string): Promise<User> {
  try {
    const res = await fetch(`/api/users/${id}`);
    return await res.json();
  } catch (error) {
    // ^ error: unknown (mit useUnknownInCatchVariables)
    // ^ error: any (ohne die tsconfig-Option)
    // TypeScript weiss NICHT was hier gefangen wird!
    console.log(error.message);
    // ^ FEHLER mit unknown: Property 'message' does not exist on 'unknown'
    throw error;
  }
}
```

> 📖 **Hintergrund: Warum TypeScript den catch-Typ nicht kennt**
>
> In JavaScript kann `throw` JEDEN Wert werfen — nicht nur Error-Objekte.
> Eine Funktion wie `fetch()` koennte einen `TypeError`, `DOMException`,
> `AbortError` oder sogar einen String werfen. TypeScript muesste alle
> moeglichen throw-Pfade durch die gesamte Aufrufkette verfolgen —
> inklusive Third-Party-Code. Das ist praktisch unmoeglich.
>
> Java loest das mit "checked exceptions" (throws-Klausel). TypeScript
> hat sich bewusst dagegen entschieden, weil JavaScript keine Exception-
> Spezifikationen hat und die Developer Experience leiden wuerde. Die
> TypeScript-Community diskutiert das Thema seit Jahren (GitHub Issue
> #13219), aber es gibt keinen Konsens.

---

## useUnknownInCatchVariables aktivieren

Seit TypeScript 4.4 gibt es die tsconfig-Option `useUnknownInCatchVariables`.
Sie ist Teil von `strict: true` seit TS 4.4:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    // ↑ Aktiviert automatisch useUnknownInCatchVariables
    // Oder einzeln:
    "useUnknownInCatchVariables": true
  }
}
```

### Der Unterschied in der Praxis

```typescript annotated
// OHNE useUnknownInCatchVariables (error: any)
try {
  await riskyOperation();
} catch (error) {
  // ^ error: any — KEIN Compile-Error bei:
  console.log(error.message);      // OK (aber unsicher!)
  console.log(error.stack);        // OK (aber unsicher!)
  console.log(error.nonExistent);  // OK (GEFAEHRLICH!)
}

// MIT useUnknownInCatchVariables (error: unknown)
try {
  await riskyOperation();
} catch (error) {
  // ^ error: unknown — Zugriff erfordert Type Narrowing:
  if (error instanceof Error) {
    console.log(error.message);    // OK — Error hat .message
    console.log(error.stack);      // OK — Error hat .stack
  } else {
    console.log(String(error));    // Sicherer Fallback
  }
}
```

> 💭 **Denkfrage:** Warum reicht `instanceof Error` nicht immer aus?
> In welchen Situationen ist der gefangene Wert kein Error-Objekt?
>
> **Antwort:** Bibliotheken koennen Strings, Zahlen oder Plain Objects
> werfen. Cross-Realm Errors (z.B. aus iframes) bestehen den
> `instanceof`-Check nicht. Und `JSON.parse()` wirft einen `SyntaxError`
> — der IST eine Error-Subklasse, aber hat extra Properties.

---

## Pattern 1: Error Type Guard

Der robusteste Ansatz ist ein wiederverwendbarer Type Guard:

```typescript annotated
// Wiederverwendbarer Type Guard fuer Error-Handling
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// Spezifischerer Type Guard fuer HTTP-Fehler
interface HttpError extends Error {
  status: number;
  // ^ Zusaetzliches Property das ein normaler Error nicht hat
  body: unknown;
}

function isHttpError(value: unknown): value is HttpError {
  return (
    value instanceof Error &&
    "status" in value &&
    typeof (value as HttpError).status === "number"
    // ^ Mehrere Pruefungen — Defensive Programmierung
  );
}

// Verwendung:
async function fetchData<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`) as HttpError;
      (error as any).status = res.status;
      (error as any).body = await res.text();
      throw error;
    }
    return await res.json();
  } catch (error) {
    if (isHttpError(error)) {
      console.log(`HTTP Error ${error.status}: ${error.message}`);
      // ^ Voller Zugriff auf HttpError-Properties
    } else if (isError(error)) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error: ${String(error)}`);
    }
    throw error;
  }
}
```

---

## Pattern 2: Async Result Pattern

Das Result-Pattern aus L25, angepasst fuer Async-Code:

```typescript annotated
// Result-Typ (aus L25)
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Async-Wrapper: Konvertiert Promise<T> in Promise<Result<T>>
async function trySafe<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const value = await promise;
    return { ok: true, value };
    // ^ Erfolgsfall: value ist T
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
    // ^ Fehlerfall: error wird immer zu Error normalisiert
  }
}

// Verwendung — kein try/catch mehr noetig!
async function loadUserProfile(id: string) {
  const userResult = await trySafe(fetchUser(id));
  if (!userResult.ok) {
    console.log(`Fehler: ${userResult.error.message}`);
    return null;
  }
  // ^ Ab hier: userResult.value ist User (Narrowing durch ok-Check)

  const postsResult = await trySafe(fetchPosts(userResult.value.id));
  if (!postsResult.ok) {
    return { user: userResult.value, posts: [] };
  }

  return { user: userResult.value, posts: postsResult.value };
}
```

> 🧠 **Erklaere dir selbst:** Was ist der Vorteil des Result-Patterns
> gegenueber try/catch bei Async-Code? Denke an Typinferenz und an
> die Frage "welche Operationen koennen fehlschlagen?".
>
> **Kernpunkte:** Result macht Fehler im Typ sichtbar | try/catch
> verliert den spezifischen Fehlertyp | Result erzwingt Fehlerbehandlung
> (ok-Check vor value-Zugriff) | Jede Operation hat ihren eigenen
> Result — kein "alles-oder-nichts" wie bei try/catch

---

## Pattern 3: Error Mapping

Oft willst du externe Fehler in deine eigenen Fehlertypen uebersetzen:

```typescript annotated
// Eigene Fehlertypen
type AppError =
  | { type: "network"; message: string; retryable: boolean }
  | { type: "auth"; message: string }
  | { type: "notFound"; resource: string; id: string }
  | { type: "unknown"; originalError: unknown };

// Error Mapper — uebersetzt beliebige Fehler in AppError
function toAppError(error: unknown): AppError {
  if (error instanceof TypeError) {
    return { type: "network", message: error.message, retryable: true };
    // ^ TypeError kommt oft von fetch() bei Netzwerkproblemen
  }
  if (isHttpError(error)) {
    if (error.status === 401 || error.status === 403) {
      return { type: "auth", message: "Nicht autorisiert" };
    }
    if (error.status === 404) {
      return { type: "notFound", resource: "unknown", id: "unknown" };
    }
  }
  return { type: "unknown", originalError: error };
  // ^ Fallback — niemals Fehler verschlucken!
}

// Verwendung in der Async-Kette:
async function getUser(id: string): Promise<Result<User, AppError>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw Object.assign(new Error(), { status: res.status });
    return { ok: true, value: await res.json() };
  } catch (error) {
    return { ok: false, error: toAppError(error) };
    // ^ Fehler ist jetzt AppError — typsicher und strukturiert
  }
}
```

> ⚡ **Praxis-Tipp fuer Angular:** In Angular-Services verwendest du
> RxJS `catchError` statt try/catch. Das Pattern ist identisch:
>
> ```typescript
> // Angular Service mit Error Mapping
> getUser(id: string): Observable<Result<User, AppError>> {
>   return this.http.get<User>(`/api/users/${id}`).pipe(
>     map(user => ({ ok: true as const, value: user })),
>     catchError(error => of({ ok: false as const, error: toAppError(error) }))
>   );
> }
> ```

---

## Die Kombination: Async + Result + Discriminated Union

Das volle Pattern bringt Typ-Safety in asynchronen Code:

```typescript
async function checkout(cartId: string): Promise<Result<Order, CheckoutError>> {
  const cart = await trySafe(fetchCart(cartId));
  if (!cart.ok) return { ok: false, error: { type: "cartNotFound", cartId } };

  const payment = await trySafe(processPayment(cart.value));
  if (!payment.ok) return { ok: false, error: { type: "paymentFailed", reason: payment.error.message } };

  const order = await trySafe(createOrder(cart.value, payment.value));
  if (!order.ok) return { ok: false, error: { type: "orderCreationFailed", details: order.error.message } };

  return { ok: true, value: order.value };
}
// Jeder Schritt hat einen spezifischen Fehlertyp — nichts geht verloren!
```

> 🔬 **Experiment:** Baue die `trySafe`-Funktion selbst und teste sie
> mit verschiedenen Fehlertypen:
>
> ```typescript
> async function trySafe<T>(promise: Promise<T>): Promise<Result<T>> {
>   try {
>     return { ok: true, value: await promise };
>   } catch (error) {
>     return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
>   }
> }
>
> // Teste mit:
> const r1 = await trySafe(Promise.resolve(42));
> // r1.ok === true, r1.value === 42
>
> const r2 = await trySafe(Promise.reject(new Error("fail")));
> // r2.ok === false, r2.error.message === "fail"
>
> const r3 = await trySafe(Promise.reject("ein string"));
> // r3.ok === false, r3.error.message === "ein string"
> ```

---

## Was du gelernt hast

- `catch` hat immer `unknown` (oder `any`) — TypeScript kann Fehlertypen nicht tracken
- `useUnknownInCatchVariables` erzwingt Type Narrowing in catch-Bloecken
- Type Guards wie `isError()` und `isHttpError()` machen catch-Bloecke typsicher
- Das Async Result Pattern (`trySafe`) macht Fehler im Typ sichtbar
- Error Mapping uebersetzt externe Fehler in eigene Discriminated Unions

**Kernkonzept zum Merken:** In Async-Code sind Fehler unvermeidlich. Die Frage ist nicht OB Fehler auftreten, sondern ob dein Typsystem sie sichtbar macht. Das Result-Pattern macht Fehler zu First-Class Citizens im Typ — statt sie in einem `any`-Loch verschwinden zu lassen.

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Du hast die drei
> Grundlagen: Typen, Inferenz und Error Handling. Ab jetzt bauen wir
> darauf auf.
>
> Weiter geht es mit: [Sektion 04: Generische Async-Patterns](./04-generische-async-patterns.md)
