# Section 4: Exhaustive Error Handling

> Estimated reading time: **9 minutes**
>
> Previous section: [03 - Option/Maybe Pattern](./03-option-maybe-pattern.md)
> Next section: [05 - Error Type Patterns](./05-error-typen-patterns.md)

---

## What you'll learn here

- What **exhaustive checking** means for discriminated unions
- The `never` trick for compile-time completeness checking
- How to safely cover **all error cases** without runtime surprises
- `satisfies` (TS 4.9) as an alternative for exhaustive pattern matching

---

## The Problem: Forgotten Error Cases

> **Background: Exhaustive Pattern Matching in Other Languages**
>
> Rust's `match` is **exhaustive by default**: You must cover all `enum` variants
> or the compiler refuses to compile. This prevents
> "forgotten" error cases at runtime.
>
> ```rust
> match error {
>   ParseError::Empty => ...,
>   ParseError::Invalid(s) => ...,
>   // Missing a variant? COMPILE-ERROR!
> }
> ```
>
> TypeScript's `switch` is NOT exhaustive by default. If you add a
> new error type, the code continues to compile — the new
> case is silently ignored. This leads to runtime bugs during refactoring.

```typescript annotated
type ApiError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'RATE_LIMITED'; retryAfter: number };

function handleError(error: ApiError): string {
  switch (error.type) {
    case 'NOT_FOUND':      return `404: ${error.message}`;
    case 'UNAUTHORIZED':   return `401: ${error.message}`;
    // 'RATE_LIMITED' forgotten! 
  }
  // TypeScript warning depends on settings...
  // Without configuration: No error — but wrong!
  return 'Unknown Error'; // Silent gap
}

// Later: new error type added
type ApiError2 = ApiError | { type: 'SERVER_ERROR'; code: number };
// handleError() doesn't handle 'SERVER_ERROR' — still no compile error!
```

---

## The `never` Trick: Enforcing Exhaustive Checking

```typescript annotated
// The magic function:
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unhandled case: ${JSON.stringify(value)}`);
  // ^ 'never' as parameter: TypeScript only allows values of type 'never'
  //   i.e.: NO real value can arrive here if all cases were handled!
}

type ApiError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'RATE_LIMITED'; retryAfter: number };

function handleError(error: ApiError): string {
  switch (error.type) {
    case 'NOT_FOUND':
      return `404: ${error.message}`;
    case 'UNAUTHORIZED':
      return `401: ${error.message}`;
    case 'RATE_LIMITED':
      return `429: Retry after ${error.retryAfter}s`;
    default:
      return assertNever(error);
      // ^ When all cases handled: error is 'never' (impossible)
      //   TypeScript: OK ✅
      //   If a case is missing: error is e.g. { type: 'RATE_LIMITED' }
      //   TypeScript: COMPILE-ERROR — '{ type: RATE_LIMITED }' ≠ 'never'
  }
}
```

> 🧠 **Explain to yourself:** Why does `error` become `never` in the `default` branch
> when all cases have been handled? What does `never` mean in this context?
>
> **Key points:** `never` = impossible type — no value can have this type |
> After `NOT_FOUND` + `UNAUTHORIZED` + `RATE_LIMITED` → `error` has type `never` |
> (All possibilities are exhausted) | `assertNever(never)` = OK |
> If a variant is missing: error still has real type → `never` parameter → COMPILE-ERROR

---

## Exhaustive Checking with Result Errors

```typescript annotated
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type ParseError =
  | { type: 'EMPTY'; message: string }
  | { type: 'TOO_SHORT'; min: number }
  | { type: 'INVALID_CHARS'; chars: string[] };

function handleParseError(error: ParseError): string {
  switch (error.type) {
    case 'EMPTY':
      return error.message;
    case 'TOO_SHORT':
      return `At least ${error.min} characters required`;
    case 'INVALID_CHARS':
      return `Invalid characters: ${error.chars.join(', ')}`;
    default:
      return assertNever(error); // ✅ Exhaustive!
  }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled: ${JSON.stringify(x)}`);
}

// Usage with Result:
function displayError(result: Result<string, ParseError>): void {
  if (result.ok) {
    console.log(`Success: ${result.value}`);
  } else {
    const message = handleParseError(result.error);
    console.log(`Error: ${message}`);
  }
}
```

> 💭 **Thought question:** What happens when you add a new type
> `| { type: 'TOO_LONG'; max: number }` to `ParseError` but don't update `handleParseError`?
> When does the error become visible?
>
> **Answer:** Immediately in the editor — COMPILE-ERROR! In the default branch:
> `error` has type `{ type: 'TOO_LONG'; max: number }` — that is not `never`.
> `assertNever(error)` fails at compile time. TypeScript has
> reminded you before you published the gap.

---

## Exhaustive Checks with Object Maps
<!-- section:summary -->
An alternative to `switch` — more elegant for simple transformations:

<!-- depth:standard -->
An alternative to `switch` — more elegant for simple transformations:

```typescript annotated
type Status = 'LOADING' | 'SUCCESS' | 'ERROR' | 'IDLE';

// Exhaustive map: ALL states must be present!
const statusMessages: Record<Status, string> = {
  LOADING: 'Loading...',
  SUCCESS: 'Successful!',
  ERROR:   'An error occurred',
  IDLE:    'Ready',
};
// ^ Record<Status, string> enforces ALL keys!
// Missing 'IDLE'? COMPILE-ERROR ✅

function getStatusMessage(status: Status): string {
  return statusMessages[status]; // Always a value — no undefined!
}

// With error types:
type ApiError = 'NOT_FOUND' | 'UNAUTHORIZED' | 'RATE_LIMITED';

const errorHandlers: Record<ApiError, (data: unknown) => string> = {
  NOT_FOUND:    () => 'Resource not found',
  UNAUTHORIZED: () => 'Not logged in',
  RATE_LIMITED: () => 'Too many requests',
};

function handleApiError(error: ApiError): string {
  return errorHandlers[error](null);
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> function assertNever(x: never): never {
>   throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
> }
>
> type TrafficLight = 'RED' | 'YELLOW' | 'GREEN';
>
> // Exhaustive with Record — all keys must be present:
> const lightActions = {
>   RED:    'Wait',
>   YELLOW: 'Prepare to brake',
>   GREEN:  'Drive',
> } satisfies Record<TrafficLight, string>;
>
> // Exhaustive with switch + assertNever:
> function describeLight(light: TrafficLight): string {
>   switch (light) {
>     case 'RED':    return lightActions.RED;
>     case 'YELLOW': return lightActions.YELLOW;
>     case 'GREEN':  return lightActions.GREEN;
>     default:       return assertNever(light);
>   }
> }
>
> console.log(describeLight('RED'));   // Wait
> console.log(describeLight('GREEN')); // Drive
> ```
>
> Now add `'BLINKING'` to `TrafficLight` — TypeScript immediately shows two
> compile errors: once in the `Record` (missing key) and once in the `default` branch
> (`light` is no longer `never`). Both places you need to update!

---

<!-- /depth -->
## Exhaustive Union Types with `satisfies` (TS 4.9)
<!-- section:summary -->
TypeScript 4.9 added `satisfies` — a powerful tool:

<!-- depth:standard -->
TypeScript 4.9 added `satisfies` — a powerful tool:

```typescript annotated
type ApiError = 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR';

// satisfies: check type WITHOUT narrowing the inferred type
const errorConfig = {
  NOT_FOUND:    { message: 'Not found', code: 404 },
  UNAUTHORIZED: { message: 'Not authorized', code: 401 },
  SERVER_ERROR: { message: 'Server error', code: 500 },
} satisfies Record<ApiError, { message: string; code: number }>;
// ^ 'satisfies' checks: Do we have all ApiError keys?
// COMPILE-ERROR if a key is missing!

// But: errorConfig retains its specific type!
console.log(errorConfig.NOT_FOUND.code); // ✅ TypeScript knows: code is number
// (not 'unknown' as with explicit Record annotation)

// Vs. direct annotation:
const errorConfig2: Record<ApiError, { message: string; code: number }> = {
  NOT_FOUND:    { message: '...', code: 404 },
  UNAUTHORIZED: { message: '...', code: 401 },
  SERVER_ERROR: { message: '...', code: 500 },
};
// errorConfig2.NOT_FOUND.code is 'number' — less specific
// (TypeScript doesn't know it's 404, only that it's a number)
```

> 🔍 **Deeper Knowledge: `satisfies` vs `: Type`**
>
> `const x: Record<K, V> = {...}` — TypeScript checks the type AND
> widens the inferred type to `Record<K, V>`. You lose
> specific information.
>
> `const x = {...} satisfies Record<K, V>` — TypeScript checks the type
> BUT retains the original inferred type. Best of both worlds:
> Completeness checking + specific types.
>
> `satisfies` is perfect for exhaustive lookup tables that will later
> be processed further with their specific types.

---

<!-- /depth -->
## Exhaustive Checking in Production Code

```typescript
// In a real Angular application:
type AppError =
  | { type: 'API_ERROR'; status: number; message: string }
  | { type: 'VALIDATION_ERROR'; fields: string[]; message: string }
  | { type: 'AUTH_ERROR'; reason: 'expired' | 'invalid' | 'missing' }
  | { type: 'NETWORK_ERROR'; message: string };

function getErrorMessage(error: AppError): string {
  switch (error.type) {
    case 'API_ERROR':
      return `API ${error.status}: ${error.message}`;
    case 'VALIDATION_ERROR':
      return `Validation failed: ${error.fields.join(', ')}`;
    case 'AUTH_ERROR':
      return error.reason === 'expired'
        ? 'Session expired — please log in again'
        : 'Not authorized';
    case 'NETWORK_ERROR':
      return `Network error: ${error.message}`;
    default:
      return assertNever(error); // ← Always the guardian!
  }
}
```

---

## What You've Learned

- `switch` without `assertNever` is NOT exhaustive — new errors are ignored
- **`assertNever(x: never): never`** enforces exhaustive handling at compile time
- `Record<UnionType, Value>` enforces all keys — is an exhaustive object map
- **`satisfies`** (TS 4.9) checks completeness without widening the inferred type
- When a new error type is added → Compile errors show all places that need to be handled

> 🧠 **Explain to yourself:** Why does `assertNever` have the parameter type `never`?
> What happens when you call `assertNever(something)` and `something` is not `never`?
>
> **Key points:** `never` = impossible type | No real value can be `never` |
> `something` is not `never` → COMPILE-ERROR (type error) |
> That's the trick: TypeScript checks whether all cases are covered |
> If all cases: exhausted → `error` narrowed to `never` → OK!

**Core concept to remember:** `assertNever(error)` in the `default` branch is your
guardian against forgotten error cases. A mandatory pattern in every `switch` over error unions.

---

> **Pause point** -- Exhaustive Error Handling understood!
>
> Continue with: [Section 05: Error Type Patterns](./05-error-typen-patterns.md)