# Cheatsheet: Branded/Nominal Types (L24)

## Das Kernproblem

```typescript
// type alias ≠ neuer Typ — kein Schutz!
type UserId  = string;  // Nur Umbenennung
type OrderId = string;  // Identisch mit UserId!

// Brand-Typen = echter Schutz:
type UserId  = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };
```

---

## Generischer Brand-Helfer

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

// Elegante Definitionen:
type UserId  = Brand<string, 'UserId'>;
type Email   = Brand<string, 'Email'>;
type Meter   = Brand<number, 'Meter'>;
type PriceCents = Brand<number, 'PriceCents'>;
```

---

## Smart Constructor (Validierung + Typ-Vergabe)

```typescript
// Throw-Variante:
function createEmail(raw: string): Email {
  const normalized = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error(`Ungültige E-Mail: "${raw}"`);
  }
  return normalized as Email;  // Einziger erlaubter 'as'-Cast!
}

// Null-Variante (erfoced Error-Handling):
function tryCreateEmail(raw: string): Email | null { ... }

// Result-Variante (strukturierter Fehler):
function parseEmail(raw: string): Result<Email> { ... }
```

**Regel:** `as Brand` NUR in Smart Constructors. Nie im Business-Code!

---

## Brand-Subtypen (Hierarchien)

```typescript
type Email         = string & { readonly __brand: 'Email' };
type VerifiedEmail = Email & { readonly __verified: true };
//                  ^^^^^ Intersection = Subtyp!

// VerifiedEmail ist Subtyp von Email:
const ve: VerifiedEmail = '...' as VerifiedEmail;
sendEmail(ve);       // ✅ VerifiedEmail → Email (Upcast, OK)
sendCritical(ve);    // ✅ VerifiedEmail → VerifiedEmail
// sendCritical(email); // ❌ Email → VerifiedEmail (Downcast, Error)
```

---

## Multi-Brand Flags

```typescript
type Trimmed  = { readonly __trimmed: true };
type NonEmpty = { readonly __nonEmpty: true };

type TrimmedString = string & Trimmed;
type SearchQuery   = string & Trimmed & NonEmpty;

// Transformationskette:
function trim(s: string): TrimmedString { return s.trim() as TrimmedString; }
function assertNonEmpty(s: TrimmedString): string & Trimmed & NonEmpty { ... }
```

---

## Generischer ID-Typ

```typescript
type Id<Entity extends string> = string & { readonly __idType: Entity };

type UserId    = Id<'User'>;
type ProductId = Id<'Product'>;

// Verschiedene Entities → verschiedene ID-Typen:
// Id<'User'> ≠ Id<'Product'> → Compile-Error bei Verwechslung!
```

---

## Currency-Pattern (Cent-basiert)

```typescript
type MoneyAmount<C extends 'EUR' | 'USD'> = number & {
  readonly __currency: C;
  readonly __cents: true;  // Immer Ganzzahl-Cents!
};
type EurCents = MoneyAmount<'EUR'>;

// Nur gleiche Währungen können addiert werden:
function addMoney<C extends 'EUR' | 'USD'>(
  a: MoneyAmount<C>, b: MoneyAmount<C>): MoneyAmount<C> {
  return (a + b) as MoneyAmount<C>;
}
```

---

## Opaque Types (maximale Sicherheit)

```typescript
declare const _brand: unique symbol;  // Nur in diesem Modul zugänglich!
type Newtype<A, Brand> = A & { readonly [_brand]: Brand };

type UserId = Newtype<string, 'UserId'>;
// Externe Module können 'as UserId' nicht schreiben (kennen _brand nicht)
```

---

## Zuweisbarkeitsregeln

| Von → Nach | Erlaubt? |
|-----------|:--------:|
| `string → UserId` | ❌ Fehlt `__brand` |
| `UserId → string` | ✅ Subtyp (hat alle string-Properties) |
| `UserId → OrderId` | ❌ `__brand: 'UserId' ≠ 'OrderId'` |
| `VerifiedEmail → Email` | ✅ Subtyp (hat alle Email-Properties + mehr) |
| `Email → VerifiedEmail` | ❌ Fehlt `__verified` |

---

## Architektur-Strategie

```
Rand (Services/Mapper):
  raw string   →  createUserId()  →  UserId
  raw string  →  createEmail()   →  Email
  API-Response →  mapUser()      →  User (mit Brands)

Innere Schichten (Business Logic, Components):
  Nur noch Brand-Typen — kein as, kein raw string
```

---

## Wann Brands verwenden?

| Szenario | Empfehlung |
|----------|:----------:|
| Entity-IDs (User, Product, Order) | ✅ Immer |
| Währungen mit Mischgefahr | ✅ Ja |
| E-Mail, URL, UUID mit Validierung | ✅ Ja |
| Sicherheitskritische Tokens | ✅ Immer |
| Lokale Berechnungen (2-3 Var.) | ❌ Over-Engineering |
| Einfache interne Helper-Strings | ❌ Unnötig |
