# Section 4: Runtime Validation as Protection

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - JavaScript Pitfalls in TypeScript](./03-javascript-fallen-in-typescript.md)
> Next section: [05 - Parse, don't validate](./05-parse-dont-validate.md)

---

## What you'll learn here

- How to use TypeScript-native **Type Guards** as a complete validation layer
- The **Validator Pattern** — a generic factory for reusable check functions
- How validators can be **composed** (length, format, value range)
- How Angular's **Reactive Forms** benefit from custom Type Guards

---

## Background: The Moment Netflix Crashed Production

In December 2015, Netflix experienced a production outage that affected tens of
thousands of users. The cause was surprisingly simple: an API response contained
a field that normally returned an array — but this time returned `null`.
The calling code had never validated that. "We know what the API returns" —
until it didn't.

Netflix engineer Ben Christensen later described in the Hystrix blog what came
out of it: **Defensive Programming as an architectural principle**. Don't blindly
trust what comes from outside. Validate every system boundary.

TypeScript alone wouldn't have prevented it. `HttpClient.get<Response>()` is
a cast, not a safeguard. What would have helped? Exactly what we learn in this
section: **Runtime validation at the system boundary**.

> **The principle:** Validate once, at the point of entry into your system. After
> that you can trust the type — because you've proven it, not because you've
> asserted it.

---

## The Type Guard Foundation

We saw in Section 1 that `HttpClient.get<User>()` is a promise,
not a check. Now we build the real check.

TypeScript gives us **Type Guards** — functions that check at runtime
and simultaneously inform the compiler about the type:

```typescript annotated
// The validator type signature: the core of the entire pattern
type Validator<T> = (value: unknown) => value is T;
//                                     ^^^^^^^^^^^
//                                     Type Predicate: tells the compiler:
//                                     "If this function returns true,
//                                     then value is a T"

// A simple example: string validator
const isString: Validator<string> = (value): value is string => {
  return typeof value === 'string';
  // ^ Runtime check: really a string?
};

// Now TypeScript can narrow:
function process(value: unknown): void {
  if (isString(value)) {
    console.log(value.toUpperCase()); // OK! TypeScript knows: value is string
    // ^ value was PROVEN, not asserted
  }
}
```

The Type Predicate (`value is T`) is the key mechanism: it connects the
runtime check to the compile-time type system. When the function returns
`true`, TypeScript knows: "In this branch, value is a T."

---

## The Complete User Validator

Let's build a realistic validator for a domain object:

```typescript annotated
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;  // ISO 8601
}

// Helper functions for primitives
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && !isNaN(v);

// The User guard: checks each property individually
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
    // ^ Not an object, not a User — early return prevents nested ifs
  }

  // TypeScript still knows value as 'object' — we cast for property access
  const v = value as Record<string, unknown>;
  // ^ This as is safe: we just checked that it's an object

  return (
    isString(v['id'])   && v['id'].length > 0          &&
    // ^ id: non-empty string

    isString(v['name']) && v['name'].length >= 2        &&
    // ^ name: at least 2 characters

    isString(v['email']) && v['email'].includes('@')    &&
    // ^ email: contains '@' — simple plausibility check

    (v['role'] === 'admin' || v['role'] === 'user' || v['role'] === 'moderator') &&
    // ^ role: only allowed values — prevents unexpected role strings

    isString(v['createdAt']) && !isNaN(Date.parse(v['createdAt']))
    // ^ createdAt: parseable date — prevents broken timestamps
  );
}

// Usage: no 'as' cast needed!
async function fetchUser(id: string): Promise<User> {
  const raw = await fetch(`/api/users/${id}`).then(r => r.json());
  if (!isUser(raw)) {
    throw new ValidationError(
      `Invalid User response from API: ${JSON.stringify(raw)}`
      // ^ Log the concrete value for easy debugging
    );
  }
  return raw;
  // ^ No 'as'! The Type Guard has proven the invariant.
  //   TypeScript knows: raw is User, because isUser(raw) was true.
}
```

---

## The Validator Factory: createValidator

Instead of writing every validator by hand, we can build a generic
factory. This reduces boilerplate and makes validators testable:

```typescript annotated
// A rule: takes a value, returns true/false
type Rule<T> = (value: T) => boolean;

// Factory for object validators
function createObjectValidator<T extends object>(
  checks: { [K in keyof T]: (value: unknown) => value is T[K] }
): Validator<T> {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;

    // Check each property with its corresponding validator
    for (const key of Object.keys(checks) as (keyof T)[]) {
      if (!checks[key](v[key as string])) {
        return false;
        // ^ Early exit: first failed check stops immediately
      }
    }
    return true;
  };
}

// Usage: describe the validator declaratively
const validateProduct = createObjectValidator<Product>({
  id:    (v): v is string  => typeof v === 'string' && v.length > 0,
  name:  (v): v is string  => typeof v === 'string' && v.length >= 2,
  price: (v): v is number  => typeof v === 'number' && v >= 0,
});
// No boilerplate loop — just declare the shapes
```

---

## Composable Validators

Individual rules can be combined into complex validators:

```typescript annotated
// String validators can be chained
function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isEmail(v: unknown): v is string {
  return typeof v === 'string' &&
    v.includes('@') &&
    v.split('@').length === 2 &&
    v.split('@')[1].includes('.');
}

function isInRange(min: number, max: number) {
  return (v: unknown): v is number =>
    typeof v === 'number' && !isNaN(v) && v >= min && v <= max;
}

// Collect all error messages at once (instead of stopping at the first error)
class ValidationError extends Error {
  constructor(
    public readonly messages: string[],
    public readonly rawValue: unknown
  ) {
    super(`Validation error: ${messages.join(', ')}`);
    this.name = 'ValidationError';
  }
}

function validateWithMessages<T>(
  value: unknown,
  checks: Array<{ guard: (v: unknown) => boolean; message: string }>
): T {
  const errors = checks
    .filter(check => !check.guard(value))
    .map(check => check.message);
  // ^ Collect all failed checks — don't stop at the first one

  if (errors.length > 0) {
    throw new ValidationError(errors, value);
    // ^ One exception with all errors — better than 5 separate exceptions
  }
  return value as T;  // as is safe here: all checks have passed
}

// Usage in practice:
function validatePassword(raw: unknown): string {
  return validateWithMessages<string>(raw, [
    { guard: (v): boolean => typeof v === 'string', message: 'Must be a string' },
    { guard: (v): boolean => typeof v === 'string' && v.length >= 8, message: 'At least 8 characters' },
    { guard: (v): boolean => typeof v === 'string' && /[A-Z]/.test(v), message: 'At least one uppercase letter' },
    { guard: (v): boolean => typeof v === 'string' && /[0-9]/.test(v), message: 'At least one digit' },
  ]);
  // All errors at once: "At least 8 characters, At least one uppercase letter"
  // Better than: "Error 1" → Fix → "Error 2" → Fix → ...
}
```

---

## Experiment Box: Type Guard in Action

Write this code in the TypeScript Playground and observe how TypeScript
narrows through the Type Guard — without a cast, without `any`:

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    typeof v['name'] === 'string' &&
    typeof v['price'] === 'number' &&
    v['price'] >= 0
  );
}

// Simulate an API response with incorrect data:
const apiResponse: unknown = JSON.parse(`{
  "id": "prod-1",
  "name": "Laptop",
  "preis": 999
}`);
// Note: 'preis' (German) instead of 'price'

if (isProduct(apiResponse)) {
  console.log('Valid product:', apiResponse.name);
  // TypeScript allows .name — Type Guard has proven: apiResponse is Product
} else {
  console.log('INVALID API response!');
  // This branch executes — because 'price' is missing
  // The error is caught IMMEDIATELY at the API boundary, not later
}

// Question to think about: What happens if you use 'price' instead of 'preis'
// in the JSON? What if 'price' is -5?
```

The crucial difference from `as Product`: if the API suddenly
sends `preis` instead of `price`, the guard catches it immediately. With `as`
you'd only notice when `undefined * 0.19 = NaN` surfaces somewhere.

---

## Angular Connection: Reactive Forms with Type Guards

In your Angular project you produce form data with `FormGroup.value`.
The problem: the TypeScript type is often `Partial<T>` or even `any`.
Type Guards help:

```typescript annotated
// Form interface
interface OrderForm {
  customerId: string;
  items: string[];
  deliveryAddress: string;
  paymentMethod: 'creditcard' | 'paypal' | 'banktransfer';
}

// Type Guard for form data
function isOrderForm(value: unknown): value is OrderForm {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v['customerId'] === 'string' && v['customerId'].length > 0 &&
    Array.isArray(v['items']) && v['items'].length > 0 &&
    typeof v['deliveryAddress'] === 'string' && v['deliveryAddress'].length >= 10 &&
    (v['paymentMethod'] === 'creditcard' ||
     v['paymentMethod'] === 'paypal' ||
     v['paymentMethod'] === 'banktransfer')
  );
}

// In the component: clean and type-safe
@Component({ /* ... */ })
export class OrderComponent {
  form = new FormGroup({
    customerId: new FormControl(''),
    items: new FormControl<string[]>([]),
    deliveryAddress: new FormControl(''),
    paymentMethod: new FormControl(''),
  });

  onSubmit(): void {
    const raw = this.form.value;
    // ^ raw is Partial<{ customerId: string | null, ... }>

    if (!isOrderForm(raw)) {
      // Show error in the UI
      this.formError = 'Please fill in all required fields';
      return;
    }
    // From here: raw is OrderForm — TypeScript is convinced, no cast needed
    this.orderService.placeOrder(raw);
    // ^ raw.customerId, raw.items — everything fully typed
  }
}
```

The Reactive Form returns `Partial<T>` or `any`-adjacent types. The Type Guard
builds the bridge between "form data" and "domain type" — without `as`.

---

## What you've learned

- **Type Guards** (`value is T`) connect runtime checks with compile-time knowledge
- The cast `as Record<string, unknown>` after a `typeof === 'object'` check is safe,
  because you've already verified the invariant
- **Validator factories** reduce boilerplate and make validation testable
- **Error collection** instead of early exit: showing all validation errors at once
  improves the user experience
- In Angular: Type Guards solve the `FormGroup.value` type problem without casts

> 🧠 **Explain to yourself:** Why is `return value as T` at the end of a
> validator function (after all checks) an acceptable `as` — even though
> we normally avoid `as`?
>
> **Key points:** `as` is safe when you've proven the invariant |
> All checks have passed → the type is actually correct | This is the
> "Trust after verify" principle | The `as` reflects proven facts,
> not assertions | There is no better alternative without external libraries

**Core concept to remember:** A Type Guard is a contract between runtime
and compile-time. It says: "I'm checking this for real right now, so that TypeScript
can believe it later." This is the only way to honestly bring external data into
the type system.

---

> **Break point** — You've understood the Validator Pattern from the ground up.
> This is the tool that the next section elevates to an elegant design
> philosophy.
>
> Continue with: [Section 05: Parse, don't validate](./05-parse-dont-validate.md)