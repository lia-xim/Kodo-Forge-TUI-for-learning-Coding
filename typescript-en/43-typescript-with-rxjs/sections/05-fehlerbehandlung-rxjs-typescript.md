# Section 5: Error Handling in RxJS with TypeScript

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Combination Operators](./04-kombinations-operatoren-typen.md)
> Next section: [06 - Angular Patterns: toSignal, async pipe](./06-angular-patterns-tosignal-asyncpipe.md)

---

## What you'll learn here

- Why RxJS 7 changed the error type to `unknown` — and what that means for your code
- How `catchError` works type-safely with `unknown`: check first, then use
- The `Result<T, E>` pattern with RxJS for type-safe error handling
- The special Observable types for errors: `EMPTY`, `NEVER`, `throwError`

---

## The biggest problem: errors were uncontrollably typed

In RxJS 6 and earlier, the error type in `catchError` and in the `error` callback was simply
`any`. That meant: you could access any property without getting a compile error —
even if the access crashed at runtime.

```typescript
// RxJS 6 — error was 'any' (dangerous!)
observable$.pipe(
  catchError((error) => {  // error: any — no safety!
    console.log(error.message);  // No error — even if error is not an object
    console.log(error.status);   // No error — even if status doesn't exist
    return EMPTY;
  })
);
```

Then came RxJS 7 — and with it a deliberate decision that ran parallel to
TypeScript's development.

> 📖 **Background: The synchronized decision**
>
> TypeScript 4.0 (August 2020) introduced `useUnknownInCatchVariables` to change `catch`
> variables from `any` to `unknown`. TypeScript 4.4 made this the default in `strict` mode
> with the `useUnknownInCatchVariables` compiler flag.
>
> RxJS 7 (April 2021) followed the same principle: errors in `catchError`, in the `error`
> callback, and in `retry` callbacks are now `unknown`, no longer `any`.
>
> This was a coordinated move by the JavaScript ecosystem toward safer error handling.
> The message: errors can be ANYTHING — an Error object, a string, a number, `undefined`.
> Enforce checks before accessing properties.

---

## catchError with unknown — Check first, then use

```typescript annotated
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface AppError {
  message: string;
  code: string;
  retryable: boolean;
}

// Since RxJS 7: error is 'unknown' — TypeScript enforces checks
observable$.pipe(
  catchError((error: unknown) => {
    // CHECK FIRST, then USE — type narrowing is required!

    if (error instanceof HttpErrorResponse) {
      // error: HttpErrorResponse — TypeScript narrows automatically here
      if (error.status === 401) {
        this.authService.redirectToLogin();
        return EMPTY;  // Observable<never> — emits nothing
      }
      if (error.status >= 500) {
        return throwError(() => ({
          message: 'Server error',
          code: `HTTP_${error.status}`,
          retryable: true,
        } satisfies AppError));  // satisfies checks the shape
      }
    }

    if (error instanceof TypeError) {
      // error: TypeError — TypeScript narrows
      console.error('Network or program error:', error.message);
      return throwError(() => ({
        message: error.message,
        code: 'TYPE_ERROR',
        retryable: false,
      } satisfies AppError));
    }

    // Fallback: unknown error — do NOT access properties!
    return throwError(() => ({
      message: 'Unknown error',
      code: 'UNKNOWN',
      retryable: false,
    } satisfies AppError));
  })
);
```

> 🧠 **Explain to yourself:** Why is `error: unknown` safer than `error: any`?
> What specifically does TypeScript prevent when the type is `unknown`?
> **Key points:** `unknown` disallows property access without prior checking |
> `any` disables all checks completely | `instanceof` narrows from `unknown` to
> the concrete type | `any` is contagious — it spreads to properties |
> `unknown` forces explicit type checking at every point

---

## The Result Pattern — Errors as part of the type

A more elegant solution: errors are not modeled as pipeline termination,
but as normal values in the Observable stream. The Result pattern makes errors
a **first-class value**:

```typescript annotated
// Result<T, E> — type-safe Either pattern
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions — no runtime dependency
const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
const err = <E>(error: E): Result<never, E> => ({ success: false, error });

// safeRequest: HTTP errors become Observable<Result<T, AppError>>
function safeRequest<T>(
  request$: Observable<T>
): Observable<Result<T, AppError>> {
  return request$.pipe(
    map(data => ok(data)),
    // ^ Success: { success: true, data: T }
    catchError((error: unknown) => of(err(parseError(error))))
    // ^ Error: { success: false, error: AppError } — becomes a normal value!
    // 'of' wraps the error as a normal Observable value
  );
}

function parseError(error: unknown): AppError {
  if (error instanceof HttpErrorResponse) {
    return { message: error.message, code: `HTTP_${error.status}`, retryable: error.status >= 500 };
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'ERROR', retryable: false };
  }
  return { message: 'Unknown error', code: 'UNKNOWN', retryable: false };
}

// Usage — no more catchError needed in the pipeline!
const userResult$ = safeRequest(this.http.get<User>('/api/user'));
// Type: Observable<Result<User, AppError>>

userResult$.pipe(
  map(result => {
    if (result.success) {
      return result.data.name;  // result.data: User — TypeScript knows it
    }
    return `Error: ${result.error.message}`;  // result.error: AppError — typed
  })
).subscribe(console.log);
```

> 💭 **Think about it:** The Result pattern seems like more code. When is it worth it,
> and when is simple `catchError` enough?
>
> **Answer:** `catchError` is sufficient when errors lead to a uniform fallback
> (e.g. showing an empty array). The Result pattern pays off when the component
> needs to **react differently** to success and error — for example, displaying error
> messages directly in the template without duplicating subscribe logic. In Angular 17+
> with Signals, the Result pattern is particularly elegant: `toSignal(safeRequest(...))`.

---

## retry and retryWhen — With types

`retry` is fully typed and the error remains `unknown`:

```typescript annotated
import { retry, timer } from 'rxjs';

// Simple retry — 3 attempts
const withRetry$ = this.http.get<User[]>('/api/users').pipe(
  retry({ count: 3, delay: 1000 })
  // count: number, delay: number | ((error: unknown, retryCount: number) => Observable<unknown>)
);

// Exponential Backoff — wait time doubles with each attempt
const withBackoff$ = this.http.get<User[]>('/api/users').pipe(
  retry({
    count: 5,
    delay: (error: unknown, count: number) => {
      // error: unknown — TypeScript enforces checks here too
      if (error instanceof HttpErrorResponse && error.status === 404) {
        // 404 is not a network error — retry makes no sense
        return throwError(() => error);
      }
      const waitTime = Math.min(1000 * Math.pow(2, count), 30000);
      // ^ 1s, 2s, 4s, 8s, 16s — maximum 30s
      console.log(`Attempt ${count}/5, waiting ${waitTime}ms...`);
      return timer(waitTime);  // Observable<number> — emits after waitTime ms
    }
  })
);
```

---

## EMPTY, NEVER, and throwError — The special types

These three constants/functions have special TypeScript types:

```typescript annotated
import { EMPTY, NEVER, throwError } from 'rxjs';

// EMPTY: Observable<never>
// Immediately emits complete() without a single value
// 'never' fits: no value comes, and never is the bottom type
const nothingHere = EMPTY;
// Type: Observable<never>
// Usage: In catchError when you simply want to end the pipeline

// NEVER: Observable<never>
// Never emits — neither a value nor complete() nor error()
// Simulates an infinite stream with no content
const infiniteBlank = NEVER;
// Type: Observable<never>
// Usage: For testing timeouts

// throwError: Returns Observable<never>
// Creates an Observable that immediately terminates with an error
const failing$ = throwError(() => new Error('Something went wrong'));
// Type: Observable<never> — there is no value, only the error

// Why Observable<never>?
// 'never' fits perfectly: these Observables never emit a value T.
// In catchError you can still return them as Observable<T> —
// because never is a subtype of every T (bottom type!)
const safe$ = this.http.get<User>('/api/user').pipe(
  catchError(() => EMPTY)
  // EMPTY is Observable<never>, returned as Observable<User>
  // TypeScript accepts this: never extends User (bottom type rule)
);
```

> 🧠 **Explain to yourself:** Why is it correct to return `EMPTY` (Observable<never>) in a
> `catchError` that actually expects `Observable<User>`?
> **Key points:** never is the bottom type — it is assignable to every type |
> `catchError` expects an Observable of the original type OR never |
> EMPTY never emits a value — so it can never return the wrong type |
> The type system and runtime behavior agree: no emission, no type problem

---

## Experiment Box: Error handling in practice

Try the Result pattern with a simulated HTTP request:

```typescript
import { Observable, of, throwError, EMPTY } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';

type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function simulatedRequest(fail: boolean): Observable<{ id: number; name: string }> {
  if (fail) {
    return throwError(() => new Error('Network error'));
  }
  return of({ id: 1, name: 'Test-User' });
}

function safeGet<T>(req: Observable<T>): Observable<Result<T>> {
  return req.pipe(
    map(value => ({ ok: true as const, value })),
    catchError((err: unknown) => of({
      ok: false as const,
      error: err instanceof Error ? err.message : 'Unknown',
    }))
  );
}

// Hover over result$ — what type does TypeScript infer?
const result$ = safeGet(simulatedRequest(true));

result$.subscribe(result => {
  if (result.ok) {
    console.log('Name:', result.value.name);  // result.value: { id: number; name: string }
  } else {
    console.log('Error:', result.error);      // result.error: string
  }
});
```

---

## Angular reference: Error handling in services

```typescript annotated
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Type-safe error handling with Result pattern
  getUser(id: string): Observable<Result<User, AppError>> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      map(user => ok(user)),
      catchError((error: unknown) => {
        // error: unknown — forces type checking
        const appError = this.parseError(error);
        // Not throwError — error as a normal value!
        return of(err(appError));
      })
    );
  }

  private parseError(error: unknown): AppError {
    if (error instanceof HttpErrorResponse) {
      return {
        message: error.error?.message ?? error.message,
        code: `HTTP_${error.status}`,
        retryable: error.status >= 500,
      };
    }
    return { message: 'Unknown error', code: 'UNKNOWN', retryable: false };
  }
}

// In the component:
@Component({ ... })
class UserComponent {
  private api = inject(ApiService);

  user$ = this.api.getUser('123').pipe(
    // result: Result<User, AppError> — fully typed
    map(result => result.success ? result.data : null)
  );
}
```

> ⚡ **Practical tip:** In Angular with HttpInterceptors you can catch errors globally.
> But even there you should check the error type: `error instanceof HttpErrorResponse`
> before using properties. The interceptor receives `unknown` — not `HttpErrorResponse`.

---

## What you learned

- RxJS 7 changed error types from `any` to `unknown` — in sync with TypeScript 4.0's `useUnknownInCatchVariables`
- `catchError((error: unknown) => ...)` enforces type narrowing: `instanceof` check first, then property access
- The Result pattern turns errors into normal stream values: `Observable<Result<T, E>>` instead of pipeline termination
- `EMPTY` and `throwError()` have the type `Observable<never>` — the bottom type makes them a valid return value in `catchError`
- `retry({ count, delay })` passes the error as `unknown` in the `delay` function — no direct property access there either without checking

**Core concept:** `unknown` in `catchError` is not an obstacle, but protection. It enforces
what good error-handling code should do anyway: first understand what the error is,
then act. The type system makes this best practice mandatory.

---

> **Pause point** — Error handling is the topic that makes the difference in production
> systems. You now know how TypeScript helps you not miss errors.
>
> Continue with: [Section 06: Angular Patterns — toSignal, async pipe](./06-angular-patterns-tosignal-asyncpipe.md)