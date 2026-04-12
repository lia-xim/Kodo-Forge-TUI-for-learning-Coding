# Cheatsheet: Branded/Nominal Types (L24)

## The Core Problem

```typescript
// type alias ≠ new type — no protection!
type UserId  = string;  // Just a rename
type OrderId = string;  // Identical to UserId!

// Brand types = real protection:
type UserId  = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };
```

---

## Generic Brand Helper

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

// Elegant definitions:
type UserId  = Brand<string, 'UserId'>;
type Email   = Brand<string, 'Email'>;
type Meter   = Brand<number, 'Meter'>;
type PriceCents = Brand<number, 'PriceCents'>;
```

---

## Smart Constructor (Validation + Type Assignment)

```typescript
// Throw variant:
function createEmail(raw: string): Email {
  const normalized = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error(`Invalid email: "${raw}"`);
  }
  return normalized as Email;  // The only permitted 'as' cast!
}

// Null variant (enforced error handling):
function tryCreateEmail(raw: string): Email | null { ... }

// Result variant (structured error):
function parseEmail(raw: string): Result<Email> { ... }
```

**Rule:** `as Brand` ONLY in Smart Constructors. Never in business code!

---

## Brand Subtypes (Hierarchies)

```typescript
type Email         = string & { readonly __brand: 'Email' };
type VerifiedEmail = Email & { readonly __verified: true };
//                  ^^^^^ Intersection = subtype!

// VerifiedEmail is a subtype of Email:
const ve: VerifiedEmail = '...' as VerifiedEmail;
sendEmail(ve);       // ✅ VerifiedEmail → Email (upcast, OK)
sendCritical(ve);    // ✅ VerifiedEmail → VerifiedEmail
// sendCritical(email); // ❌ Email → VerifiedEmail (downcast, error)
```

---

## Multi-Brand Flags

```typescript
type Trimmed  = { readonly __trimmed: true };
type NonEmpty = { readonly __nonEmpty: true };

type TrimmedString = string & Trimmed;
type SearchQuery   = string & Trimmed & NonEmpty;

// Transformation chain:
function trim(s: string): TrimmedString { return s.trim() as TrimmedString; }
function assertNonEmpty(s: TrimmedString): string & Trimmed & NonEmpty { ... }
```

---

## Generic ID Type

```typescript
type Id<Entity extends string> = string & { readonly __idType: Entity };

type UserId    = Id<'User'>;
type ProductId = Id<'Product'>;

// Different entities → different ID types:
// Id<'User'> ≠ Id<'Product'> → compile error on mix-up!
```

---

## Currency Pattern (Cent-Based)

```typescript
type MoneyAmount<C extends 'EUR' | 'USD'> = number & {
  readonly __currency: C;
  readonly __cents: true;  // Always integer cents!
};
type EurCents = MoneyAmount<'EUR'>;

// Only same currencies can be added:
function addMoney<C extends 'EUR' | 'USD'>(
  a: MoneyAmount<C>, b: MoneyAmount<C>): MoneyAmount<C> {
  return (a + b) as MoneyAmount<C>;
}
```

---

## Opaque Types (Maximum Safety)

```typescript
declare const _brand: unique symbol;  // Accessible only within this module!
type Newtype<A, Brand> = A & { readonly [_brand]: Brand };

type UserId = Newtype<string, 'UserId'>;
// External modules cannot write 'as UserId' (they don't know _brand)
```

---

## Assignability Rules

| From → To | Allowed? |
|-----------|:--------:|
| `string → UserId` | ❌ Missing `__brand` |
| `UserId → string` | ✅ Subtype (has all string properties) |
| `UserId → OrderId` | ❌ `__brand: 'UserId' ≠ 'OrderId'` |
| `VerifiedEmail → Email` | ✅ Subtype (has all Email properties + more) |
| `Email → VerifiedEmail` | ❌ Missing `__verified` |

---

## Architecture Strategy

```
Boundary (Services/Mappers):
  raw string   →  createUserId()  →  UserId
  raw string   →  createEmail()   →  Email
  API response →  mapUser()       →  User (with brands)

Inner layers (business logic, components):
  Only brand types — no as, no raw strings
```

---

## When to Use Brands?

| Scenario | Recommendation |
|----------|:--------------:|
| Entity IDs (User, Product, Order) | ✅ Always |
| Currencies with mix-up risk | ✅ Yes |
| Email, URL, UUID with validation | ✅ Yes |
| Security-critical tokens | ✅ Always |
| Local calculations (2–3 vars) | ❌ Over-engineering |
| Simple internal helper strings | ❌ Unnecessary |