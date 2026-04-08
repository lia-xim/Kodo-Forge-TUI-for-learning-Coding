# Sektion 5: Praktische Patterns mit Branded Types

> Geschätzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Mehrere Brands & Hierarchien](./04-mehrere-brands-hierarchien.md)
> Nächste Sektion: [06 - Branded Types in der Praxis](./06-branded-types-praxis.md)

---

## Was du hier lernst

- Das **ID-System Pattern** für typsichere Datenbank-IDs
- **Currency-Typen** — Wann man Dezimalzahlen als Brands wrappen sollte
- **Path-Typen** (AbsolutePath vs. RelativePath) für sicheres Dateisystem-Handling
- Wie **generische Entity-IDs** mit einem einzigen Typ-Parameter funktionieren

---

## Pattern 1: Das ID-System
<!-- section:summary -->
Das häufigste Use-Case für Branded Types in echten TypeScript-Projekten:

<!-- depth:standard -->
Das häufigste Use-Case für Branded Types in echten TypeScript-Projekten:
typsichere Entity-IDs die nicht verwechselt werden können.

<!-- depth:vollstaendig -->
> **Hintergrund: ID-Chaos in echten Projekten**
>
> In einer typischen CRUD-Applikation gibt es Dutzende von ID-Typen:
> userId, orderId, productId, cartId, couponId, sessionId, tenantId...
> In einem monolithischen System werden diese alle als `string` (oder `number`)
> übergeben — und Bugs entstehen, wenn durch Copy-Paste oder Refactoring
> die falsche ID an die falsche Funktion kommt.
>
> Stripe (Zahlungs-API) hat das Problem mit *Präfixen* gelöst: `user_123`,
> `py_456` (Payment), `ch_789` (Charge). Aber Präfixe sind ein Runtime-Check,
> kein Compile-Time-Check. Branded Types machen das zur Compilezeit sicher.

```typescript annotated
// Generischer ID-Typ — ein Brand-Factory für alle Entities
type Id<Entity extends string> = string & { readonly __idType: Entity };
//                               ^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                               Basis-Typ ist string
//                               Brand enthält den Entity-Namen

// Konkrete ID-Typen:
type UserId    = Id<'User'>;
type OrderId   = Id<'Order'>;
type ProductId = Id<'Product'>;
type CartId    = Id<'Cart'>;

// Typsicherer Lookup-Service:
interface Repository<T, TId extends string> {
  findById(id: Id<TId>): Promise<T | null>;
  save(entity: T): Promise<Id<TId>>;
  delete(id: Id<TId>): Promise<void>;
}

// UserRepository akzeptiert NUR UserId:
declare const userRepo: Repository<User, 'User'>;
// findById: (id: UserId) => Promise<User | null>

interface User { id: UserId; name: string; email: string; }
interface Order { id: OrderId; userId: UserId; total: number; }

const userId = 'user-abc' as UserId;
const orderId = 'order-xyz' as OrderId;

await userRepo.findById(userId);  // ✅
// await userRepo.findById(orderId); // ❌ COMPILE-ERROR: OrderId ≠ UserId
// ^ Schutz vor dem klassischen "falsche ID"-Bug!
```

> 🧠 **Erkläre dir selbst:** Was passiert, wenn du `Id<'User'>` und `Id<'Order'>`
> vergleichst? Sind sie kompatibel? Warum nicht?
>
> **Kernpunkte:** `Id<'User'> = string & { __idType: 'User' }` |
> `Id<'Order'> = string & { __idType: 'Order' }` |
> `'User' ≠ 'Order'` → in TypeScript's Literal Type Checking |
> Deshalb: `Id<'User'>` und `Id<'Order'>` sind inkompatibel ✅

---

<!-- /depth -->
## Pattern 2: Currency-Typen
<!-- section:summary -->
Geldbeträge sind notorisch fehleranfällig — falsche Einheit, falsche Währung,

<!-- depth:standard -->
Geldbeträge sind notorisch fehleranfällig — falsche Einheit, falsche Währung,
Integer vs. Float-Fehler:

```typescript annotated
// Schritt 1: Währungstypen als Brands
type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF';

// Cents/Kleinste Einheit vermeiden Float-Fehler:
type MoneyAmount<C extends Currency> = number & {
  readonly __currency: C;
  readonly __unit: 'cents'; // Immer in Cent, nie in Euro (keine Float-Fehler!)
};

type EurCents = MoneyAmount<'EUR'>;
type UsdCents = MoneyAmount<'USD'>;

// Smart Constructors:
function eurCents(cents: number): EurCents {
  if (!Number.isInteger(cents)) throw new Error('Cents müssen Ganzzahl sein');
  if (cents < 0) throw new Error('Betrag kann nicht negativ sein');
  return cents as EurCents;
}

// Operationen:
function addMoney<C extends Currency>(a: MoneyAmount<C>, b: MoneyAmount<C>): MoneyAmount<C> {
  return (a + b) as MoneyAmount<C>;
  // ^ Nur gleiche Währungen können addiert werden!
}

function convertEurToUsd(eur: EurCents, rate: number): UsdCents {
  return Math.round(eur * rate) as UsdCents;
  // ^ Explizite Konversion mit Math.round (Integer bleiben Integer)
}

// Verwendung:
const price  = eurCents(1999);  // 19,99 EUR
const tax    = eurCents(380);   // 3,80 EUR
const total  = addMoney(price, tax); // 2379 Cent = 23,79 EUR

// const wrong = addMoney(price, usdAmount); // ❌ COMPILE-ERROR
// ^ EUR + USD? Nein! TypeScript fängt das ab.
```

<!-- depth:vollstaendig -->
> **Experiment:** Öffne `examples/03-currency.ts` und:
> 1. Erstelle `GbpCents = MoneyAmount<'GBP'>`.
> 2. Versuche `addMoney(eurAmount, gbpAmount)` — was sagt TypeScript?
> 3. Schreibe `convertGbpToEur(gbp: GbpCents, rate: number): EurCents`.
> 4. Beobachte: TypeScript zwingt dich die Konversion explizit zu machen!

---

<!-- /depth -->
## Pattern 3: Path-Typen
<!-- section:summary -->
Datei-Pfade sind eine häufige Fehlerquelle — relative vs. absolute Pfade:

<!-- depth:standard -->
Datei-Pfade sind eine häufige Fehlerquelle — relative vs. absolute Pfade:

```typescript annotated
// Pfad-Typen mit Brands
type AbsolutePath = string & { readonly __pathType: 'absolute' };
type RelativePath = string & { readonly __pathType: 'relative' };
type NormalizedPath = string & { readonly __normalized: true };

// Smart Constructors mit OS-spezifischer Logik:
function createAbsolutePath(path: string): AbsolutePath {
  const isWindows = path.match(/^[A-Za-z]:\\/);
  const isUnix = path.startsWith('/');
  if (!isWindows && !isUnix) {
    throw new Error(`Kein absoluter Pfad: "${path}"`);
  }
  return path as AbsolutePath;
}

function createRelativePath(path: string): RelativePath {
  if (path.startsWith('/') || path.match(/^[A-Za-z]:\\/)) {
    throw new Error(`Kein relativer Pfad: "${path}"`);
  }
  return path as RelativePath;
}

// Pfad-Operationen nur mit kompatiblen Typen:
function joinPaths(base: AbsolutePath, relative: RelativePath): AbsolutePath {
  // Einfache Implementierung (in der Praxis: path.join() oder URL)
  return `${base}/${relative}`.replace(/\/+/g, '/') as AbsolutePath;
}

// Nur absolute Pfade dürfen als Entry Points verwendet werden:
function runScript(entry: AbsolutePath): void {
  console.log(`Ausführen: ${entry}`);
}

const projectRoot = createAbsolutePath('/home/user/project');
const mainFile    = createRelativePath('src/index.ts');
const fullPath    = joinPaths(projectRoot, mainFile);

runScript(fullPath);  // ✅ AbsolutePath
// runScript(mainFile); // ❌ COMPILE-ERROR: RelativePath ≠ AbsolutePath
```

> 💭 **Denkfrage:** Node.js-APIs wie `fs.readFile()` akzeptieren sowohl relative
> als auch absolute Pfade. Wenn dein Code intern immer absolute Pfade verwendet,
> wo wäre der beste Ort um relative Pfade zu konvertieren?
>
> **Antwort:** Am "Eintrittspunkt" der Anwendung — dort wo User-Input
> verarbeitet wird. Interne Funktionen arbeiten dann nur noch mit `AbsolutePath`.
> Das ist das **Parse, don't validate**-Prinzip: Am Rand validieren und Brand vergeben,
> danach in der Business-Logik nur noch typsichere Brands verwenden.

---

<!-- /depth -->
## Pattern 4: Token und Secrets
<!-- section:summary -->
Sicherheitskritische Strings können mit Brands geschützt werden:

<!-- depth:standard -->
Sicherheitskritische Strings können mit Brands geschützt werden:

```typescript annotated
type JwtToken      = string & { readonly __brand: 'JwtToken' };
type RefreshToken  = string & { readonly __brand: 'RefreshToken' };
type ApiKey        = string & { readonly __brand: 'ApiKey' };
type HashedPassword = string & { readonly __brand: 'HashedPassword' };
// ACHTUNG: Niemals PlaintextPassword als Typ — nur gehasht speichern!

// Auth-Service API:
interface AuthService {
  login(email: Email, password: string): Promise<{ jwt: JwtToken; refresh: RefreshToken }>;
  refresh(token: RefreshToken): Promise<JwtToken>;
  verifyJwt(token: JwtToken): Promise<UserId | null>;
}

// HTTP-Client der nur JWT akzeptiert:
function authenticatedRequest(endpoint: string, token: JwtToken): void {
  // fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
  console.log(`Request mit JWT: ${endpoint}`);
}

// Mit Brands kann man RefreshToken NICHT als JwtToken verwenden:
// authenticatedRequest('/api/data', refreshToken); // ❌ COMPILE-ERROR
// ^ Sicherheitslücke vermieden: Refresh-Token darf nicht als Auth-Token verwendet werden
```

<!-- depth:vollstaendig -->
> **In deinem Angular-Projekt** kannst du dies im Auth-Interceptor verwenden:
>
> ```typescript
> @Injectable()
> export class AuthInterceptor implements HttpInterceptor {
>   constructor(private authService: AuthService) {}
>
>   intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
>     const token = this.authService.getJwtToken();
>     // getJwtToken() gibt JwtToken | null zurück — nicht null prüfen!
>     if (!token) return next.handle(req);
>
>     const authReq = req.clone({
>       headers: req.headers.set('Authorization', `Bearer ${token}`)
>       // 'token' ist JwtToken — kann als string in Template Literal verwendet werden
>     });
>     return next.handle(authReq);
>   }
> }
> ```

---

<!-- /depth -->
## Das `Newtype`-Utility: Wiederverwendbares Muster
<!-- section:summary -->
Mehrere TypeScript-Open-Source-Projekte definieren ein universelles `Newtype`:

<!-- depth:standard -->
Mehrere TypeScript-Open-Source-Projekte definieren ein universelles `Newtype`:

```typescript annotated
// Das 'newtype' Pattern — sauber und wiederverwendbar
declare const _brand: unique symbol;

type Newtype<A, Brand> = A & { readonly [_brand]: Brand };
//                                     ^^^^^^ Private unique symbol

// Convenience-Typen mit Newtype:
type Make<Brand, A = string> = Newtype<A, Brand>;

// Verwendung:
type UserId    = Make<'UserId'>;              // string (default)
type OrderId   = Make<'OrderId'>;            // string
type Price     = Make<'Price', number>;       // number
type Quantity  = Make<'Quantity', number>;    // number

// Generic Cast-Helper (vorsichtig verwenden!):
function unsafeCoerce<T>(value: unknown): T {
  return value as T;
}

// Bessere Variante: typisierter Cast
function makeNewtype<T extends Newtype<unknown, unknown>>(
  value: T extends Newtype<infer A, unknown> ? A : never
): T {
  return value as unknown as T;
}

const userId = makeNewtype<UserId>('user-123');
// ^ TypeScript inferiert: Argument muss string sein (weil UserId = Newtype<string, ...>)
```

---

<!-- /depth -->
## Was du gelernt hast

- **ID-System Pattern**: `Id<Entity>` — ein generischer Brand für alle Entity-IDs,
  verhindert Verwechslungen zwischen `UserId`, `OrderId`, etc.
- **Currency-Pattern**: `MoneyAmount<Currency>` mit Cent-Einheit — verhindert Float-Fehler
  und Währungsverwechslungen
- **Path-Pattern**: `AbsolutePath` vs. `RelativePath` — sichere Dateisystem-Operationen
- **Token-Typen**: JwtToken, RefreshToken, ApiKey — sicherheitskritische Strings unterscheiden

> 🧠 **Erkläre dir selbst:** Wie verhindert das `Id<Entity>`-Pattern Bugs bei
> Repository-Operationen? Was ist der Vorteil gegenüber einfachem `string`?
>
> **Kernpunkte:** `findById(userId: UserId)` akzeptiert keine `OrderId` |
> Compiler-Fehler sofort im Editor — kein Runtime-Fehler |
> Dokumentation im Typ selbst | Refactoring sicher: IDE findet alle Verwendungsstellen

**Kernkonzept zum Merken:** Branded Types gläznen bei IDs, Einheiten, Pfaden
und Tokens — überall wo primitive Typen verwechselt werden können und Fehler
gefährlich wären.

---

> **Pausenpunkt** -- Du kennst die wichtigsten praktischen Patterns.
>
> Weiter geht es mit: [Sektion 06: Branded Types in der Praxis](./06-branded-types-praxis.md)
