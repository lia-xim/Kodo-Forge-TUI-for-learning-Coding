# Section 3: Smart Constructors & Opaque Types

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - The Brand Technique](./02-die-brand-technik.md)
> Next section: [04 - Multiple Brands & Hierarchies](./04-mehrere-brands-hierarchien.md)

---

## What you'll learn here

- How **Smart Constructors** combine validation and type assignment
- The **Opaque Type** pattern with `unique symbol` for maximum safety
- How to elegantly define brands with a **generic helper type**
- When brand types should return `never` (invalid values)

---

## Smart Constructors: Validation + Safety
<!-- section:summary -->
A Smart Constructor is a function that:

<!-- depth:standard -->
A Smart Constructor is a function that:
1. Accepts a raw value
2. **Validates** it
3. On success: returns a typed (branded) value
4. On failure: throws an error *or* returns a `null`/`Error` value

<!-- depth:vollstaendig -->
> **Background: Smart Constructors from the Haskell World**
>
> Smart Constructors come from functional programming, especially
> from Haskell. There they are known as the "Newtype" pattern: a type that
> only wraps another type, but has its own name (and therefore safety).
>
> In Haskell:
> ```haskell
> newtype UserId = UserId String  -- Newtype: Nominal, no overhead
> makeUserId :: String -> Maybe UserId
> makeUserId s = if isValid s then Just (UserId s) else Nothing
> ```
>
> TypeScript has no `newtype` — but with the brand technique + Smart Constructors
> we emulate exactly this pattern. This is one of many ideas
> TypeScript borrows from the functional world.

---

<!-- /depth -->
## Three Variants of Smart Constructors

```typescript annotated
type Email = string & { readonly __brand: 'Email' };

// Variant 1: throw on invalid value
function createEmail(value: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error(`Invalid email: "${value}"`);
    // ^ Caller must handle with try/catch
  }
  return value as Email;
  // ^ The as-cast is safe here: we've already validated!
}

// Variant 2: null on invalid value (Result-style, safer)
function tryCreateEmail(value: string): Email | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return null;
    // ^ No throw: caller must handle the null case (compiler enforces this!)
  }
  return value as Email;
}

// Variant 3: Result type (even more explicit, covered in L25)
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parseEmail(value: string): Result<Email> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { ok: false, error: `Invalid email: "${value}"` };
    // ^ Explicit error type instead of exception
  }
  return { ok: true, value: value as Email };
}
```

> 🧠 **Explain to yourself:** What is the difference between Variant 1
> (`throw`) and Variant 2 (`null`)? With which variant does TypeScript *force*
> the caller to handle the error case?
>
> **Key points:** throw → caller can ignore it (no compile error) |
> null → compiler enforces: "handle null too!" | Result<T> → most explicit |
> In production code: prefer Variant 2 or 3

---

## The Generic Brand Helper Type
<!-- section:summary -->
Instead of repeating the `& { readonly __brand: ... }` syntax for every brand,

<!-- depth:standard -->
Instead of repeating the `& { readonly __brand: ... }` syntax for every brand,
TypeScript projects often use a generic helper:

```typescript annotated
// The Brand helper — define once, use everywhere
type Brand<T, B extends string> = T & { readonly __brand: B };
//         ^  ^^^^^^^^^^^^^^^^
//         |  B: The brand name (must be a string literal)
//         T: The base type (string, number, etc.)

// Elegant brand definitions:
type UserId  = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type Email   = Brand<string, 'Email'>;
type Age     = Brand<number, 'Age'>;      // Brand on number!
type Seconds = Brand<number, 'Seconds'>; // Seconds ≠ Age!

// Before it looked like this:
type UserId  = string & { readonly __brand: 'UserId' };  // Repeated
type OrderId = string & { readonly __brand: 'OrderId' }; // Repeated
// Now it's more consistent and readable.
```

And the Smart Constructors:

```typescript annotated
type Meters  = Brand<number, 'Meters'>;
type Seconds = Brand<number, 'Seconds'>;

function createMeters(value: number): Meters {
  if (value < 0) throw new Error(`Negative length: ${value}`);
  return value as Meters; // Safe after validation
}

function createSeconds(value: number): Seconds {
  if (value < 0) throw new Error(`Negative time: ${value}`);
  return value as Seconds;
}

// Now:
function speed(distance: Meters, time: Seconds): number {
  return distance / time;
  // ^ 'distance' and 'time' behave like 'number'!
  //   Arithmetic works directly.
}

const d = createMeters(100);
const t = createSeconds(10);

speed(d, t);   // ✅ 10 m/s
speed(t, d);   // ❌ COMPILE ERROR! Seconds ≠ Meters, Meters ≠ Seconds
// ^ Physically wrong — and TypeScript catches it!
```

<!-- depth:vollstaendig -->
> **Experiment:** Open `examples/02-smart-constructors.ts` and try:
> 1. Create `Kelvin = Brand<number, 'Kelvin'>` and `Celsius = Brand<number, 'Celsius'>`.
> 2. Write `toFahrenheit(celsius: Celsius): number`.
> 3. Try passing a `Kelvin` value into it. What does TypeScript say?

---

<!-- /depth -->
## Opaque Types with `unique symbol`
<!-- section:summary -->
The standard brand technique has a weakness: someone could write `as UserId`

<!-- depth:standard -->
The standard brand technique has a weakness: someone could write `as UserId`
and bypass the protection. For maximum safety there are
**Opaque Types** with `unique symbol`:

```typescript annotated
// In 'user-id.ts' (a separate module):
declare const userIdBrand: unique symbol;
//            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//            'unique symbol': A symbol type that is UNIQUE!
//            Every 'unique symbol' declaration creates a NEW type.
//            Nobody outside this module can reproduce it.

export type UserId = string & { readonly [userIdBrand]: true };
//                                        ^^^^^^^^^^^^ Computed property with the secret symbol!

export function createUserId(value: string): UserId {
  return value as UserId;
  // ^ As the only function in this module, it has access to 'userIdBrand'
}

// In 'order-id.ts' (separate module):
declare const orderIdBrand: unique symbol; // A DIFFERENT unique symbol!
export type OrderId = string & { readonly [orderIdBrand]: true };
```

> 💭 **Think about it:** What is the advantage of `unique symbol` over
> the simple string brand `{ __brand: 'UserId' }`? Could you
> bypass the protection with `unique symbol`?
>
> **Answer:** With a string brand, you could theoretically write `value as UserId`
> in any module. With `unique symbol` that's no longer possible:
> the symbol is only known in the defining module. This makes the
> Smart Constructor the *only* legal way to create a UserId.
> External modules must use the exported function.

---

<!-- /depth -->
## The `Branded` Pattern from Open Source
<!-- section:summary -->
Libraries like `@effect/schema` or `zod` use similar patterns.

<!-- depth:standard -->
Libraries like `@effect/schema` or `zod` use similar patterns.
Here is an elegant open-source variant:

```typescript annotated
// From the TypeScript community: Branded helper
type Branded<T, B> = T & { readonly [K in B & string]: K };
//                                 ^^^^^^^^^^^^^^^^^^^
//                                 Mapped type over B as key!

// Or even simpler (the widespread variant):
declare const phantom: unique symbol;
type Newtype<T, Brand> = T & { readonly [phantom]: Brand };
//                               ^^^^^^^ Single invisible property

type UserId  = Newtype<string, 'UserId'>;
type OrderId = Newtype<string, 'OrderId'>;
type Kg      = Newtype<number, 'Kg'>;
type Liter   = Newtype<number, 'Liter'>;

// Generic Smart Constructor:
function brand<T extends Newtype<unknown, unknown>>(
  value: T extends Newtype<infer V, unknown> ? V : never
): T {
  return value as T;
}
// Usage:
const id = brand<UserId>('user-123');
```

> 🔍 **Deeper knowledge: `declare const` without a value**
>
> `declare const userIdBrand: unique symbol` stands out: no value after `=`!
> This is an **ambient declaration** — TypeScript knows the thing exists,
> but doesn't define it. It is NEVER compiled (type erasure!).
>
> `unique symbol` is a special TypeScript type: every `unique symbol` variable
> has its own type — even two `declare const x: unique symbol; declare const y: unique symbol`
> have different types! This makes them perfect for distinct property keys.

---

<!-- /depth -->
## Brands for Validated Strings: The Complete Email Example

```typescript annotated
// Complete Email module
export type Email = Brand<string, 'Email'>;

export class InvalidEmailError extends Error {
  constructor(value: string) {
    super(`"${value}" is not a valid email address`);
    this.name = 'InvalidEmailError';
  }
}

export function createEmail(raw: string): Email {
  const trimmed = raw.trim().toLowerCase();
  // ^ Normalization as part of the Smart Constructor

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    throw new InvalidEmailError(raw);
  }

  return trimmed as Email;
  // ^ Now it's safe: validated AND normalized
}

// Usage:
function sendWelcomeEmail(to: Email): void {
  console.log(`Sending email to: ${to}`); // String template works!
  // Fetch, SMTP, etc.
}

try {
  const email = createEmail('  Max.Mustermann@Example.CO  ');
  // email = 'max.mustermann@example.co' (normalized!)
  sendWelcomeEmail(email); // ✅ OK
} catch (e) {
  if (e instanceof InvalidEmailError) {
    console.error(e.message); // Type-safe!
  }
}

sendWelcomeEmail('max@example.com');
// ^ COMPILE ERROR: string ≠ Email. createEmail() must be used!
```

> **In your Angular project:** You can combine Branded Types with Reactive Forms:
>
> ```typescript
> // In a FormService:
> validateAndGetEmail(control: AbstractControl): Email | null {
>   const value = control.value as string;
>   try {
>     return createEmail(value);
>   } catch {
>     return null;
>   }
> }
>
> onSubmit(form: FormGroup): void {
>   const email = this.validateAndGetEmail(form.controls['email']);
>   if (!email) {
>     // Error handling
>     return;
>   }
>   this.userService.register(email); // Type: Email — safe!
> }
> ```

---

## What you've learned

- **Smart Constructors** centralize `as`-casts and combine validation with type assignment
- The generic **`Brand<T, B>`** helper makes brand definitions more elegant
- **`unique symbol`** for Opaque Types: maximum safety — only the defining
  module can create values of the type
- Brands can contain validation + normalization (trim, toLowerCase, etc.)

> 🧠 **Explain to yourself:** What is the difference between a simple
> `as`-cast and a Smart Constructor? Why is the Smart Constructor safer?
>
> **Key points:** as-cast: anywhere in the code, invisible, no validation |
> Smart Constructor: central location, visible, enforces validation |
> Audit: check 1 function vs. 100 places in the code | APIs remain safe

**Core concept to remember:** Smart Constructor = validation + `as`-cast in one
single safe place. The rest of the code must never write `as Brand` directly.

---

> **Pause point** -- You now know Smart Constructors and Opaque Types.
>
> Continue with: [Section 04: Multiple Brands & Hierarchies](./04-mehrere-brands-hierarchien.md)