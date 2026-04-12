# Section 5: Practical Patterns with Branded Types

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Multiple Brands & Hierarchies](./04-mehrere-brands-hierarchien.md)
> Next section: [06 - Branded Types in Practice](./06-branded-types-praxis.md)

---

## What you'll learn here

- The **ID system pattern** for type-safe database IDs
- **Currency types** — When to wrap decimal numbers as brands
- **Path types** (AbsolutePath vs. RelativePath) for safe filesystem handling
- How **generic entity IDs** work with a single type parameter

---

## Pattern 1: The ID System
<!-- section:summary -->
The most common use case for branded types in real TypeScript projects:

<!-- depth:standard -->
The most common use case for branded types in real TypeScript projects:
type-safe entity IDs that can't be mixed up.

<!-- depth:vollstaendig -->
> **Background: ID chaos in real projects**
>
> In a typical CRUD application there are dozens of ID types:
> userId, orderId, productId, cartId, couponId, sessionId, tenantId...
> In a monolithic system these are all passed as `string` (or `number`)
> — and bugs arise when copy-paste or refactoring causes
> the wrong ID to be passed to the wrong function.
>
> Stripe (payment API) solved the problem with *prefixes*: `user_123`,
> `py_456` (Payment), `ch_789` (Charge). But prefixes are a runtime check,
> not a compile-time check. Branded types make this safe at compile time.

```typescript annotated
// Generic ID type — a brand factory for all entities
type Id<Entity extends string> = string & { readonly __idType: Entity };
//                               ^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                               Base type is string
//                               Brand contains the entity name

// Concrete ID types:
type UserId    = Id<'User'>;
type OrderId   = Id<'Order'>;
type ProductId = Id<'Product'>;
type CartId    = Id<'Cart'>;

// Type-safe lookup service:
interface Repository<T, TId extends string> {
  findById(id: Id<TId>): Promise<T | null>;
  save(entity: T): Promise<Id<TId>>;
  delete(id: Id<TId>): Promise<void>;
}

// UserRepository accepts ONLY UserId:
declare const userRepo: Repository<User, 'User'>;
// findById: (id: UserId) => Promise<User | null>

interface User { id: UserId; name: string; email: string; }
interface Order { id: OrderId; userId: UserId; total: number; }

const userId = 'user-abc' as UserId;
const orderId = 'order-xyz' as OrderId;

await userRepo.findById(userId);  // ✅
// await userRepo.findById(orderId); // ❌ COMPILE-ERROR: OrderId ≠ UserId
// ^ Protection against the classic "wrong ID" bug!
```

> 🧠 **Explain to yourself:** What happens when you compare `Id<'User'>` and `Id<'Order'>`?
> Are they compatible? Why not?
>
> **Key points:** `Id<'User'> = string & { __idType: 'User' }` |
> `Id<'Order'> = string & { __idType: 'Order' }` |
> `'User' ≠ 'Order'` → in TypeScript's literal type checking |
> Therefore: `Id<'User'>` and `Id<'Order'>` are incompatible ✅

---

<!-- /depth -->
## Pattern 2: Currency Types
<!-- section:summary -->
Monetary amounts are notoriously error-prone — wrong unit, wrong currency,

<!-- depth:standard -->
Monetary amounts are notoriously error-prone — wrong unit, wrong currency,
integer vs. float errors:

```typescript annotated
// Step 1: Currency types as brands
type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF';

// Cents/smallest unit avoids float errors:
type MoneyAmount<C extends Currency> = number & {
  readonly __currency: C;
  readonly __unit: 'cents'; // Always in cents, never in euros (no float errors!)
};

type EurCents = MoneyAmount<'EUR'>;
type UsdCents = MoneyAmount<'USD'>;

// Smart constructors:
function eurCents(cents: number): EurCents {
  if (!Number.isInteger(cents)) throw new Error('Cents must be an integer');
  if (cents < 0) throw new Error('Amount cannot be negative');
  return cents as EurCents;
}

// Operations:
function addMoney<C extends Currency>(a: MoneyAmount<C>, b: MoneyAmount<C>): MoneyAmount<C> {
  return (a + b) as MoneyAmount<C>;
  // ^ Only same currencies can be added!
}

function convertEurToUsd(eur: EurCents, rate: number): UsdCents {
  return Math.round(eur * rate) as UsdCents;
  // ^ Explicit conversion with Math.round (integers stay integers)
}

// Usage:
const price  = eurCents(1999);  // €19.99
const tax    = eurCents(380);   // €3.80
const total  = addMoney(price, tax); // 2379 cents = €23.79

// const wrong = addMoney(price, usdAmount); // ❌ COMPILE-ERROR
// ^ EUR + USD? No! TypeScript catches this.
```

<!-- depth:vollstaendig -->
> **Experiment:** Open `examples/03-currency.ts` and:
> 1. Create `GbpCents = MoneyAmount<'GBP'>`.
> 2. Try `addMoney(eurAmount, gbpAmount)` — what does TypeScript say?
> 3. Write `convertGbpToEur(gbp: GbpCents, rate: number): EurCents`.
> 4. Observe: TypeScript forces you to make the conversion explicit!

---

<!-- /depth -->
## Pattern 3: Path Types
<!-- section:summary -->
File paths are a common source of errors — relative vs. absolute paths:

<!-- depth:standard -->
File paths are a common source of errors — relative vs. absolute paths:

```typescript annotated
// Path types with brands
type AbsolutePath = string & { readonly __pathType: 'absolute' };
type RelativePath = string & { readonly __pathType: 'relative' };
type NormalizedPath = string & { readonly __normalized: true };

// Smart constructors with OS-specific logic:
function createAbsolutePath(path: string): AbsolutePath {
  const isWindows = path.match(/^[A-Za-z]:\\/);
  const isUnix = path.startsWith('/');
  if (!isWindows && !isUnix) {
    throw new Error(`Not an absolute path: "${path}"`);
  }
  return path as AbsolutePath;
}

function createRelativePath(path: string): RelativePath {
  if (path.startsWith('/') || path.match(/^[A-Za-z]:\\/)) {
    throw new Error(`Not a relative path: "${path}"`);
  }
  return path as RelativePath;
}

// Path operations only with compatible types:
function joinPaths(base: AbsolutePath, relative: RelativePath): AbsolutePath {
  // Simple implementation (in practice: path.join() or URL)
  return `${base}/${relative}`.replace(/\/+/g, '/') as AbsolutePath;
}

// Only absolute paths may be used as entry points:
function runScript(entry: AbsolutePath): void {
  console.log(`Running: ${entry}`);
}

const projectRoot = createAbsolutePath('/home/user/project');
const mainFile    = createRelativePath('src/index.ts');
const fullPath    = joinPaths(projectRoot, mainFile);

runScript(fullPath);  // ✅ AbsolutePath
// runScript(mainFile); // ❌ COMPILE-ERROR: RelativePath ≠ AbsolutePath
```

> 💭 **Think about it:** Node.js APIs like `fs.readFile()` accept both relative
> and absolute paths. If your code always uses absolute paths internally,
> where would be the best place to convert relative paths?
>
> **Answer:** At the "entry point" of the application — where user input
> is processed. Internal functions then only ever work with `AbsolutePath`.
> This is the **Parse, don't validate** principle: validate at the boundary and assign the brand,
> then use only type-safe brands in business logic.

---

<!-- /depth -->
## Pattern 4: Tokens and Secrets
<!-- section:summary -->
Security-critical strings can be protected with brands:

<!-- depth:standard -->
Security-critical strings can be protected with brands:

```typescript annotated
type JwtToken      = string & { readonly __brand: 'JwtToken' };
type RefreshToken  = string & { readonly __brand: 'RefreshToken' };
type ApiKey        = string & { readonly __brand: 'ApiKey' };
type HashedPassword = string & { readonly __brand: 'HashedPassword' };
// WARNING: Never use PlaintextPassword as a type — only store hashed!

// Auth service API:
interface AuthService {
  login(email: Email, password: string): Promise<{ jwt: JwtToken; refresh: RefreshToken }>;
  refresh(token: RefreshToken): Promise<JwtToken>;
  verifyJwt(token: JwtToken): Promise<UserId | null>;
}

// HTTP client that only accepts JWT:
function authenticatedRequest(endpoint: string, token: JwtToken): void {
  // fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
  console.log(`Request with JWT: ${endpoint}`);
}

// With brands you CANNOT use RefreshToken as JwtToken:
// authenticatedRequest('/api/data', refreshToken); // ❌ COMPILE-ERROR
// ^ Security vulnerability avoided: refresh token must not be used as auth token
```

<!-- depth:vollstaendig -->
> **In your Angular project** you can use this in the auth interceptor:
>
> ```typescript
> @Injectable()
> export class AuthInterceptor implements HttpInterceptor {
>   constructor(private authService: AuthService) {}
>
>   intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
>     const token = this.authService.getJwtToken();
>     // getJwtToken() returns JwtToken | null — check for null!
>     if (!token) return next.handle(req);
>
>     const authReq = req.clone({
>       headers: req.headers.set('Authorization', `Bearer ${token}`)
>       // 'token' is JwtToken — can be used as string in template literal
>     });
>     return next.handle(authReq);
>   }
> }
> ```

---

<!-- /depth -->
## The `Newtype` Utility: Reusable Pattern
<!-- section:summary -->
Several TypeScript open-source projects define a universal `Newtype`:

<!-- depth:standard -->
Several TypeScript open-source projects define a universal `Newtype`:

```typescript annotated
// The 'newtype' pattern — clean and reusable
declare const _brand: unique symbol;

type Newtype<A, Brand> = A & { readonly [_brand]: Brand };
//                                     ^^^^^^ Private unique symbol

// Convenience types with Newtype:
type Make<Brand, A = string> = Newtype<A, Brand>;

// Usage:
type UserId    = Make<'UserId'>;              // string (default)
type OrderId   = Make<'OrderId'>;            // string
type Price     = Make<'Price', number>;       // number
type Quantity  = Make<'Quantity', number>;    // number

// Generic cast helper (use with caution!):
function unsafeCoerce<T>(value: unknown): T {
  return value as T;
}

// Better variant: typed cast
function makeNewtype<T extends Newtype<unknown, unknown>>(
  value: T extends Newtype<infer A, unknown> ? A : never
): T {
  return value as unknown as T;
}

const userId = makeNewtype<UserId>('user-123');
// ^ TypeScript infers: argument must be string (because UserId = Newtype<string, ...>)
```

---

<!-- /depth -->
## What you've learned

- **ID system pattern**: `Id<Entity>` — a generic brand for all entity IDs,
  prevents mix-ups between `UserId`, `OrderId`, etc.
- **Currency pattern**: `MoneyAmount<Currency>` with cent unit — prevents float errors
  and currency mix-ups
- **Path pattern**: `AbsolutePath` vs. `RelativePath` — safe filesystem operations
- **Token types**: JwtToken, RefreshToken, ApiKey — distinguishing security-critical strings

> 🧠 **Explain to yourself:** How does the `Id<Entity>` pattern prevent bugs in
> repository operations? What is the advantage over plain `string`?
>
> **Key points:** `findById(userId: UserId)` does not accept `OrderId` |
> Compiler error immediately in the editor — no runtime error |
> Documentation in the type itself | Safe refactoring: IDE finds all usages

**Core concept to remember:** Branded types shine with IDs, units, paths,
and tokens — wherever primitive types can be mixed up and mistakes
would be dangerous.

---

> **Pause point** -- You now know the most important practical patterns.
>
> Continue with: [Section 06: Branded Types in Practice](./06-branded-types-praxis.md)