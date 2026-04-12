# Section 2: The Result Pattern

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - The Exception Problem](./01-das-exception-problem.md)
> Next section: [03 - Option/Maybe Pattern](./03-option-maybe-pattern.md)

---

## What you'll learn here

- What `Result<T, E>` looks like and how to define it
- **Discriminated Unions** as the foundation for Result
- How to use `Result` ergonomically with helper functions
- TypeScript's `as const` for narrow types in Result objects

---

## The Result Pattern: The Basic Structure

> **Background: Haskell's `Either` and Rust's `Result`**
>
> In Haskell there is `Either a b` — a value is either `Left a` (error)
> or `Right b` (success). The convention: `Left` = error, `Right` = success
> (mnemonic: "right" = correct).
>
> Rust has `Result<T, E>` with `Ok(T)` and `Err(E)`. The `?` operator
> makes error propagation syntactically lean.
>
> TypeScript has neither `Either` nor `Result` built in. But with
> **Discriminated Unions** and a simple interface we can
> build a complete Result pattern ourselves — without external dependencies.

```typescript annotated
// The base definition: Discriminated Union
type Ok<T>  = { readonly ok: true;  readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
//             ^^^^^^^^^            ^^^^^^^^^^^^^^^^
//             Discriminant:        Error value (typed!)
//             'ok' as boolean literal

type Result<T, E = string> = Ok<T> | Err<E>;
//                ^^^^^^^^^
//                Default: string for simple cases

// TypeScript's Discriminated Union mechanism:
// When ok === true → TypeScript knows: value exists (type T)
// When ok === false → TypeScript knows: error exists (type E)

// Helper constructors (optional but recommended):
function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

function err<E>(error: E): Err<E> {
  return { ok: false, error };
}
```

---

## Result in Practice: Email Parsing

```typescript annotated
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

type Email = string & { readonly __brand: 'Email' };

function parseEmail(raw: string): Result<Email> {
  // Result<Email> = Result<Email, string> (Default E = string)
  const normalized = raw.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!normalized) {
    return { ok: false, error: 'Email must not be empty' };
    // ^ ok: false + error: string → Err<string>
  }

  if (!emailRegex.test(normalized)) {
    return { ok: false, error: `'${raw}' is not a valid email address` };
  }

  return { ok: true, value: normalized as Email };
  // ^ ok: true + value: Email → Ok<Email>
}

// Usage — TypeScript enforces the check:
const result = parseEmail("  MAX@EXAMPLE.COM  ");

if (result.ok) {
  // Here: TypeScript knows 'result' is Ok<Email>!
  console.log(`Success: ${result.value}`);
  //                      ^^^^^^^^^^^^ Type: Email (not undefined!)
} else {
  // Here: TypeScript knows 'result' is Err<string>!
  console.log(`Error: ${result.error}`);
  //                    ^^^^^^^^^^^^ Type: string (not undefined!)
}

// NO access to the other property is possible:
// if (result.ok) { result.error; } // ❌ COMPILE-ERROR
// ^ In the ok-branch: error doesn't exist; TypeScript checks that!
```

> 🧠 **Explain to yourself:** Why is it called a "Discriminated Union"?
> What is the "discriminant" and what does it do for TypeScript?
>
> **Key points:** Discriminant = shared property with literal type |
> `ok: true` vs `ok: false` → literals, not booleans! |
> TypeScript uses literal values to "narrow" the branch |
> In the `if (result.ok)` branch → TypeScript knows: `Ok<T>` → `value` exists

---

## `as const` for More Precise Types
<!-- section:summary -->
A common pitfall with Result objects:

<!-- depth:standard -->
A common pitfall with Result objects:

```typescript annotated
// PROBLEM: Boolean inference is too broad
const r1 = { ok: true, value: 42 };
// Type: { ok: boolean, value: number }
//          ^^^^^^^ boolean — NOT 'true'!
// This is no longer a Discriminated Union!

// SOLUTION 1: as const
const r2 = { ok: true as const, value: 42 };
// Type: { ok: true, value: number }
//          ^^^^ 'true' (literal) — Discriminated Union ✅

// SOLUTION 2: Explicit type annotation
const r3: { ok: true; value: number } = { ok: true, value: 42 };

// SOLUTION 3: Helper function (recommended!)
function ok<T>(value: T) {
  return { ok: true as const, value };
  // 'true as const' → return type: { ok: true; value: T }
}

function err<E>(error: E) {
  return { ok: false as const, error };
}

// Elegant usage:
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err('Division by zero');
  return ok(a / b);
}
```

> 💭 **Think about it:** Why is `{ ok: boolean, value: number }` not a Discriminated
> Union? What is the difference between `boolean` and the literal `true`?
>
> **Answer:** `boolean = true | false`. TypeScript cannot narrow with `boolean` —
> it doesn't know which value `ok` has. Only `ok: true` (literal)
> enables narrowing: in the `if(r.ok)` branch → `ok` is definitely `true`.

---

<!-- /depth -->
## Chaining with Result: `map` and `flatMap`
<!-- section:summary -->
Result types become truly elegant with chaining methods:

<!-- depth:standard -->
Result types become truly elegant with chaining methods:

```typescript annotated
// Helper functions for Result transformations:

function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (!result.ok) return result;
  // ^ Pass error through — fn is not called
  return ok(fn(result.value));
  // ^ Success: apply fn and create new Ok
}

function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (!result.ok) return result;
  return fn(result.value);
  // ^ fn returns a Result itself — no nested Ok(Ok(..))!
}

// Usage — chain without .ok checks:
const emailResult = parseEmail("max@example.com");

const uppercasedResult = mapResult(
  emailResult,
  email => email.toUpperCase() // string method — Email is subtype of string!
);

console.log(uppercasedResult);
// ok === true  → { ok: true, value: 'MAX@EXAMPLE.COM' }
// ok === false → { ok: false, error: '...' } (unchanged)

// Chain multiple steps:
function processInput(raw: string): Result<number, string> {
  return flatMapResult(
    parseEmail(raw),
    email => {
      const len = email.length;
      return len > 5 ? ok(len) : err('Email too short');
    }
  );
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> type Ok<T>  = { readonly ok: true;  readonly value: T };
> type Err<E> = { readonly ok: false; readonly error: E };
> type Result<T, E = string> = Ok<T> | Err<E>;
>
> function ok<T>(value: T): Ok<T>  { return { ok: true,  value }; }
> function err<E>(e: E):   Err<E>  { return { ok: false, error: e }; }
>
> type Email = string & { readonly __brand: 'Email' };
>
> function parseEmail(raw: string): Result<Email> {
>   const normalized = raw.trim().toLowerCase();
>   if (!normalized) return err('Email empty');
>   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
>   if (!regex.test(normalized)) return err(`Invalid format: ${raw}`);
>   return ok(normalized as Email);
> }
>
> function mapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
>   return r.ok ? ok(fn(r.value)) : r;
> }
>
> function flatMapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {
>   return r.ok ? fn(r.value) : r;
> }
>
> // Chain: parseEmail → length check → uppercase
> const result = flatMapResult(
>   parseEmail('max@example.com'),
>   email => email.length > 5 ? ok(email) : err('Email too short')
> );
> const final = mapResult(result, e => e.toUpperCase());
> console.log(final); // { ok: true, value: 'MAX@EXAMPLE.COM' }
>
> // Test error passthrough:
> const error = flatMapResult(
>   parseEmail(''),  // fails
>   email => ok(email.toUpperCase())  // never called
> );
> console.log(error); // { ok: false, error: 'Email empty' }
> ```
>
> What happens when you replace the empty input with `'x@y.z'` (5 characters)?
> Observe: errors from each step are automatically passed through!

---

<!-- /depth -->
## Typed Errors: Error Discriminated Unions
<!-- section:summary -->
Instead of `string` as the error type, **specific error types** are more powerful:

<!-- depth:standard -->
Instead of `string` as the error type, **specific error types** are more powerful:

```typescript annotated
// Typed error union:
type ParseError =
  | { type: 'EMPTY_INPUT'; message: string }
  | { type: 'INVALID_FORMAT'; message: string; input: string }
  | { type: 'TOO_SHORT'; message: string; minLength: number };

type Email = string & { readonly __brand: 'Email' };

function parseEmail(raw: string): Result<Email, ParseError> {
  if (!raw.trim()) {
    return err({ type: 'EMPTY_INPUT', message: 'Email must not be empty' });
  }

  const normalized = raw.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(normalized)) {
    return err({
      type: 'INVALID_FORMAT',
      message: `Invalid email address`,
      input: raw
    });
  }

  if (normalized.length < 5) {
    return err({ type: 'TOO_SHORT', message: 'Email too short', minLength: 5 });
  }

  return ok(normalized as Email);
}

// Exhaustive error handling:
const result = parseEmail("x");

if (result.ok) {
  console.log(`Email: ${result.value}`);
} else {
  const error = result.error; // Type: ParseError
  switch (error.type) {
    case 'EMPTY_INPUT':
      console.log(`Empty: ${error.message}`);
      break;
    case 'INVALID_FORMAT':
      console.log(`Invalid: ${error.input} → ${error.message}`);
      break;
    case 'TOO_SHORT':
      console.log(`Too short: min ${error.minLength} characters`);
      break;
    // TypeScript warns if a case is missing (with noImplicitReturns!)
  }
}
```

<!-- depth:vollstaendig -->
> **In your Angular project:**
>
> ```typescript
> type HttpError =
>   | { type: 'NOT_FOUND'; id: string }
>   | { type: 'UNAUTHORIZED'; message: string }
>   | { type: 'SERVER_ERROR'; status: number; message: string };
>
> @Injectable({ providedIn: 'root' })
> class UserService {
>   getUser(id: UserId): Observable<Result<User, HttpError>> {
>     return this.http.get<User>(`/api/users/${id}`).pipe(
>       map(user => ok(user)),
>       catchError((err: HttpErrorResponse) => {
>         const error: HttpError = err.status === 404
>           ? { type: 'NOT_FOUND', id }
>           : err.status === 401
>           ? { type: 'UNAUTHORIZED', message: err.message }
>           : { type: 'SERVER_ERROR', status: err.status, message: err.message };
>         return of(this.err(error));
>       })
>     );
>   }
> }
> ```

---

<!-- /depth -->
## What you've learned

- `Result<T, E>` is a Discriminated Union: `{ ok: true; value: T } | { ok: false; error: E }`
- **Narrowing** via discriminant: in the `if(result.ok)` branch TypeScript knows the exact type
- `as const` prevents overly broad type inference from `ok: boolean` → `ok: true`
- `mapResult`/`flatMapResult` enable chaining without nested `if` blocks
- **Typed errors** (`ParseError` as discriminated union) enable exhaustive error handling

> 🧠 **Explain to yourself:** What is the difference between `Result<T, string>` and
> `Result<T, ParseError>` as an error type? When is which approach better?
>
> **Key points:** string → simple but information-poor | ParseError → information + type |
> string good for: prototyping, simple validation | ParseError good for: production code,
> errors that need to be handled differently | Exhaustive switch only with union type

**Core concept to remember:** `Result<T, E>` makes errors visible and forces handling.
The compiler becomes the guardian — not you.

---

> **Pause point** -- You now have a solid grasp of the Result pattern.
>
> Continue with: [Section 03: Option/Maybe Pattern](./03-option-maybe-pattern.md)