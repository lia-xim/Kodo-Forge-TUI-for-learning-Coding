# Section 4: Multiple Brands & Brand Hierarchies

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Smart Constructors & Opaque Types](./03-smart-constructors-opaque-types.md)
> Next section: [05 - Practical Patterns](./05-praktische-patterns.md)

---

## What you'll learn here

- How to **combine multiple brands** on a type (e.g. `Trimmed & NonEmpty`)
- What **brand hierarchies** are and how they model subtypes
- How to track transformations with **multiply-branded types**
- Why brands also make sense for `number`, `boolean`, and other primitive types

---

## Combining multiple brands
<!-- section:summary -->
Brands can be combined — a value can have multiple properties:

<!-- depth:standard -->
Brands can be combined — a value can have multiple properties:

<!-- depth:vollstaendig -->
> **Background: The Refinement Pattern**
>
> This pattern comes from type theory: **Refinement Types** (also:
> Dependent Types). A type is refined by predicates:
> "A string that is non-empty and has no leading or trailing whitespace."
>
> Languages like Liquid Haskell or F* (Microsoft Research) have
> native support for this. TypeScript emulates it with multiple
> brand intersections.
>
> The pattern is well-known from string validation: instead of packing all
> rules into one function, we track each validation step as its own brand.
> This makes transformation chains type-safe.

```typescript annotated
type Brand<T, B> = T & { readonly __brand: B };

// Individual brands represent properties:
type Trimmed  = { readonly __trimmed: true };
//                         ^^^^^^^^^ No 'Brand<>' helper needed for simple flags
type NonEmpty = { readonly __nonEmpty: true };
type Lowercase = { readonly __lowercase: true };

// Combined types as intersections:
type TrimmedString   = string & Trimmed;
type NonEmptyString  = string & NonEmpty;
type SearchQuery     = string & Trimmed & NonEmpty & Lowercase;
//                              ^^^^^^^ All three properties guaranteed!

// Smart constructors that each verify their part:
function trim(value: string): string & Trimmed {
  return value.trim() as string & Trimmed;
  // ^ We KNOW: after .trim() the string is Trimmed
}

function assertNonEmpty(value: string & Trimmed): string & Trimmed & NonEmpty {
  if (value.length === 0) throw new Error('String must not be empty');
  return value as string & Trimmed & NonEmpty;
  // ^ We KNOW: non-empty after the check
}

function toLowercase(value: string & Trimmed & NonEmpty): SearchQuery {
  return value.toLowerCase() as SearchQuery;
  // ^ SearchQuery = string & Trimmed & NonEmpty & Lowercase
}

// Usage — chain of transformations:
function createSearchQuery(input: string): SearchQuery {
  const trimmed = trim(input);           // string & Trimmed
  const nonEmpty = assertNonEmpty(trimmed); // string & Trimmed & NonEmpty
  return toLowercase(nonEmpty);          // SearchQuery
}

function search(query: SearchQuery): void {
  console.log(`Searching for: ${query}`);
}

search(createSearchQuery('  TypeScript  ')); // ✅ "typescript"
// search('typescript') → ❌ COMPILE-ERROR: string ≠ SearchQuery
```

> 🧠 **Explain it to yourself:** Why is `string & Trimmed & NonEmpty & Lowercase`
> *safer* than plain `string`? What does the caller of `search(query: SearchQuery)` know
> without looking at the implementation?
>
> **Key points:** The type *documents* guarantees | search() knows: query is
> already validated and normalized | No double-validation needed |
> Compile-error prevents "forgotten" validation

---

<!-- /depth -->
## Brand Hierarchies: Modeling Subtypes
<!-- section:summary -->
The word "hierarchy" refers to the fact that a more specific brand

<!-- depth:standard -->
The word "hierarchy" refers to the fact that a more specific brand
is automatically assignable to a more general brand as well:

```typescript annotated
// Concept: All emails are strings, but not all strings are emails
// All verified emails are emails, but not all emails are verified

type Email          = string & { readonly __brand: 'Email' };
type VerifiedEmail  = string & { readonly __brand: 'Email' } & { readonly __verified: true };
//                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                             Also an Email!                  Plus: verified

// VerifiedEmail IS ALSO an Email (subtype):
function sendEmail(to: Email): void {
  console.log(`Sending to: ${to}`);
}

const normalEmail  = 'max@example.com' as Email;
const verifiedMail = 'max@example.com' as VerifiedEmail;

sendEmail(normalEmail);   // ✅ OK
sendEmail(verifiedMail);  // ✅ OK! VerifiedEmail has all properties of Email

// But the other way around:
function sendCriticalEmail(to: VerifiedEmail): void {
  console.log(`Critical email to verified recipient: ${to}`);
}

// sendCriticalEmail(normalEmail); // ❌ COMPILE-ERROR
// ^ Email has no __verified property → not a VerifiedEmail
```

> 💭 **Think about it:** `VerifiedEmail` is a subtype of `Email`. That means:
> wherever `Email` is expected, `VerifiedEmail` can be used.
> But not vice versa. How does this relate to Liskov's Substitution Principle?
>
> **Answer:** Perfect alignment with LSP! A `VerifiedEmail` can do everything
> an `Email` can (it's a "stronger" type). Replacing `Email` with
> `VerifiedEmail` increases safety. TypeScript's structural typing
> and the hierarchy brands complement each other elegantly here.

> 🧪 **Experiment:** Create a brand hierarchy for different ID types:
>
> ```typescript
> type BaseId = string & { readonly __brand: 'BaseId' };
> type UserId = string & { readonly __brand: 'BaseId' } & { readonly __userBrand: true };
> type AdminId = string & { readonly __brand: 'BaseId' } & { readonly __userBrand: true } & { readonly __admin: true };
>
> function processUser(id: UserId): void { console.log(id); }
> function processAdmin(id: AdminId): void { console.log(id); }
>
> const admin = 'admin-1' as AdminId;
> processUser(admin);   // Does this compile?
> // processAdmin('user-1' as UserId);  // And this?
> ```
>
> Check: Can `AdminId` be passed to a function that expects `UserId`?
> And vice versa? Observe how TypeScript's structural typing enforces
> the hierarchy automatically — `AdminId` has all properties of `UserId` (plus more),
> so it is a subtype.

---

<!-- /depth -->
## Number Brands: Physical Units
<!-- section:summary -->
Brands shine especially with `number` types — a frequent source of bugs:

<!-- depth:standard -->
Brands shine especially with `number` types — a frequent source of bugs:

```typescript annotated
type Brand<T, B> = T & { readonly __brand: B };

// Physical units as brands:
type Meter      = Brand<number, 'Meter'>;
type Foot       = Brand<number, 'Foot'>;
type Kilogram   = Brand<number, 'Kilogram'>;
type Pound      = Brand<number, 'Pound'>;
type Celsius    = Brand<number, 'Celsius'>;
type Fahrenheit = Brand<number, 'Fahrenheit'>;

// Smart constructors:
const meter  = (n: number) => n as Meter;
const foot   = (n: number) => n as Foot;
const kg     = (n: number) => n as Kilogram;
const pound  = (n: number) => n as Pound;

// Conversion functions:
function footToMeter(f: Foot): Meter {
  return (f * 0.3048) as Meter;
  // ^ 'as Meter': safe after conversion (we know the result is Meter)
}

function poundToKg(p: Pound): Kilogram {
  return (p * 0.453592) as Kilogram;
}

// Functions that expect specific units:
function calculateBMI(weight: Kilogram, height: Meter): number {
  return weight / (height * height);
}

// Usage:
const myWeightKg    = kg(75);
const myHeightMeter = meter(1.80);

calculateBMI(myWeightKg, myHeightMeter); // ✅ 23.15

// Error scenarios:
const myWeightPound = pound(165);
// calculateBMI(myWeightPound, myHeightMeter); // ❌ COMPILE-ERROR
// ^ Pound ≠ Kilogram — TypeScript prevents the Mars Orbiter bug!

const myHeightFoot = foot(5.9);
const myHeightMeterConverted = footToMeter(myHeightFoot); // 1.798 Meter
calculateBMI(myWeightKg, myHeightMeterConverted); // ✅ OK after conversion
```

> 🔍 **Deeper knowledge: The Mars Orbiter Bug (1999)**
>
> On September 23, 1999, NASA lost the Mars Climate Orbiter (cost: $327
> million) because **one team worked in Imperial units (pound-force·seconds)
> and another in SI units (Newton·seconds)**. The data was passed
> without unit conversion.
>
> TypeScript brands would have prevented this bug — or at least triggered
> a compile-time error instead of a Mars orbital failure.
>
> Today, organizations like NASA and ESA use specialized type systems
> (Fortran with UNITS, Ada, or internal libraries) to prevent exactly this.
> TypeScript brands are the pragmatic JavaScript/TypeScript approach.

---

<!-- /depth -->
## Brands for Validation States (State Machines)
<!-- section:summary -->
Brands are also perfect for modeling **processing states**:

<!-- depth:standard -->
Brands are also perfect for modeling **processing states**:

```typescript annotated
// A form value can have different states:
type RawInput       = string & { readonly __brand: 'RawInput' };
type SanitizedInput = string & { readonly __brand: 'Sanitized' };
type ValidatedEmail = string & { readonly __brand: 'Validated' };

// Transformation chain:
function sanitize(raw: RawInput): SanitizedInput {
  // XSS protection, encoding, etc.
  return raw.replace(/<[^>]*>/g, '') as SanitizedInput;
}

function validateAsEmail(sanitized: SanitizedInput): ValidatedEmail | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) return null;
  return sanitized as ValidatedEmail;
}

// Database function only accepts fully processed values:
function storeEmail(email: ValidatedEmail): void {
  console.log(`Storing: ${email}`);
}

// Correct usage:
const userInput = 'max@example.com' as RawInput;
const sanitized = sanitize(userInput);
const validated = validateAsEmail(sanitized);

if (validated) {
  storeEmail(validated); // ✅ Only after sanitization + validation
}

// storeEmail(userInput);  // ❌ RawInput ≠ ValidatedEmail
// storeEmail(sanitized); // ❌ SanitizedInput ≠ ValidatedEmail
// ^ TypeScript enforces the entire chain!
```

<!-- depth:vollstaendig -->
> **In your Angular project** you can use this pattern for HTTP interceptors:
>
> ```typescript
> // Every API response starts as 'unsafe':
> type UnsafeApiData = unknown & { readonly __brand: 'UnsafeApiData' };
> type ValidApiData<T> = T & { readonly __brand: 'ValidApiData' };
>
> // Interceptor transforms safely:
> function validateApiResponse<T>(
>   schema: (data: unknown) => T,
>   raw: UnsafeApiData
> ): ValidApiData<T> {
>   const parsed = schema(raw); // Throws on error
>   return parsed as ValidApiData<T>;
> }
>
> // In React Query:
> const { data } = useQuery<ValidApiData<User>>(['user', id], async () => {
>   const raw = await fetch('/api/user').then(r => r.json()) as UnsafeApiData;
>   return validateApiResponse(UserSchema.parse, raw);
> });
> // data is ValidApiData<User> — we KNOW: it was validated
> ```

---

<!-- /depth -->
## Brands Across Multiple Primitives

```typescript annotated
// Brands work on ANY primitive type:
type NonNegativeNumber = number & { readonly __nonNegative: true };
type PortNumber        = number & { readonly __port: true };   // 1-65535
type PositiveInteger   = number & { readonly __positive: true; readonly __integer: true };

function createPort(n: number): PortNumber {
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    throw new Error(`Invalid port: ${n}`);
  }
  return n as PortNumber;
}

function createPositiveInteger(n: number): PositiveInteger {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Must be a positive integer: ${n}`);
  }
  return n as PositiveInteger;
}

// Server configuration — only validated values:
interface ServerConfig {
  port: PortNumber;
  maxConnections: PositiveInteger;
  timeout: NonNegativeNumber;
}

const config: ServerConfig = {
  port: createPort(8080),
  maxConnections: createPositiveInteger(100),
  timeout: 30 as NonNegativeNumber, // Direct cast for simple cases
};
```

---

## What you've learned

- Brands can be **combined**: `string & Trimmed & NonEmpty` — each brand
  represents a guaranteed property
- **Brand hierarchies**: `VerifiedEmail` is a subtype of `Email` → wherever `Email`
  is expected, `VerifiedEmail` can be used
- Brands are ideal for **units** (Meter vs. Foot) and **validation states**
- Number brands prevent real-world bugs like the Mars Orbiter accident (1999, $327M)

> 🧠 **Explain it to yourself:** Why is `string & Trimmed & NonEmpty` a *subtype*
> of both `string & Trimmed` and `string & NonEmpty`? And what does
> "subtype" mean in the context of assignability?
>
> **Key points:** More brands = stronger type (more guarantees) |
> Subtype = can be used anywhere the supertype is expected |
> A `SearchQuery` is also a `TrimmedString` (has all properties) |
> TypeScript checks this automatically via structural typing

**Core concept to remember:** Each brand is an additional guarantee.
Brand combinations model "a value that satisfies all of X, Y, and Z" — and
TypeScript enforces each guarantee individually.

---

> **Pause point** -- You now understand the full brand hierarchy.
>
> Continue with: [Section 05: Practical Patterns](./05-praktische-patterns.md)