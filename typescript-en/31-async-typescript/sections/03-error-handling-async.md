# Section 3: Error Handling in Async Code

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - async/await and Type Inference](./02-async-await-typinferenz.md)
> Next section: [04 - Generic Async Patterns](./04-generische-async-patterns.md)

---

## What you'll learn here

- Why `try/catch` in TypeScript treats the error type as `unknown` (or `any`)
- How to enable `useUnknownInCatchVariables` and why it matters
- Patterns for type-safe error handling with async/await
- How to combine the Result Pattern (L25) with async code

---

## The Problem: catch doesn't know the error type

The biggest problem with async error handling in TypeScript is that
`catch` doesn't know the error type — neither with `try/catch` nor with
`.catch()`:

```typescript annotated
async function fetchUser(id: string): Promise<User> {
  try {
    const res = await fetch(`/api/users/${id}`);
    return await res.json();
  } catch (error) {
    // ^ error: unknown (with useUnknownInCatchVariables)
    // ^ error: any (without the tsconfig option)
    // TypeScript does NOT know what gets caught here!
    console.log(error.message);
    // ^ ERROR with unknown: Property 'message' does not exist on 'unknown'
    throw error;
  }
}
```

> 📖 **Background: Why TypeScript doesn't know the catch type**
>
> In JavaScript, `throw` can throw ANY value — not just Error objects.
> A function like `fetch()` could throw a `TypeError`, `DOMException`,
> `AbortError`, or even a string. TypeScript would have to trace all
> possible throw paths through the entire call chain —
> including third-party code. That's practically impossible.
>
> Java solves this with "checked exceptions" (throws clause). TypeScript
> deliberately chose not to, because JavaScript has no exception
> specifications and the developer experience would suffer. The
> TypeScript community has been discussing this topic for years (GitHub Issue
> #13219), but there is no consensus.

---

## Enabling useUnknownInCatchVariables

Since TypeScript 4.4 there is the tsconfig option `useUnknownInCatchVariables`.
It has been part of `strict: true` since TS 4.4:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    // ↑ Automatically enables useUnknownInCatchVariables
    // Or individually:
    "useUnknownInCatchVariables": true
  }
}
```

### The difference in practice

```typescript annotated
// WITHOUT useUnknownInCatchVariables (error: any)
try {
  await riskyOperation();
} catch (error) {
  // ^ error: any — NO compile error for:
  console.log(error.message);      // OK (but unsafe!)
  console.log(error.stack);        // OK (but unsafe!)
  console.log(error.nonExistent);  // OK (DANGEROUS!)
}

// WITH useUnknownInCatchVariables (error: unknown)
try {
  await riskyOperation();
} catch (error) {
  // ^ error: unknown — access requires type narrowing:
  if (error instanceof Error) {
    console.log(error.message);    // OK — Error has .message
    console.log(error.stack);      // OK — Error has .stack
  } else {
    console.log(String(error));    // Safe fallback
  }
}
```

> 💭 **Think about it:** Why isn't `instanceof Error` always sufficient?
> In what situations is the caught value not an Error object?
>
> **Answer:** Libraries can throw strings, numbers, or plain objects.
> Cross-realm errors (e.g. from iframes) don't pass the
> `instanceof` check. And `JSON.parse()` throws a `SyntaxError`
> — which IS an Error subclass, but has extra properties.

---

## Pattern 1: Error Type Guard

The most robust approach is a reusable type guard:

```typescript annotated
// Reusable type guard for error handling
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// More specific type guard for HTTP errors
interface HttpError extends Error {
  status: number;
  // ^ Additional property that a regular Error doesn't have
  body: unknown;
}

function isHttpError(value: unknown): value is HttpError {
  return (
    value instanceof Error &&
    "status" in value &&
    typeof (value as HttpError).status === "number"
    // ^ Multiple checks — defensive programming
  );
}

// Usage:
async function fetchData<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`) as HttpError;
      (error as any).status = res.status;
      (error as any).body = await res.text();
      throw error;
    }
    return await res.json();
  } catch (error) {
    if (isHttpError(error)) {
      console.log(`HTTP Error ${error.status}: ${error.message}`);
      // ^ Full access to HttpError properties
    } else if (isError(error)) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error: ${String(error)}`);
    }
    throw error;
  }
}
```

---

## Pattern 2: Async Result Pattern

The Result Pattern from L25, adapted for async code:

```typescript annotated
// Result type (from L25)
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Async wrapper: converts Promise<T> into Promise<Result<T>>
async function trySafe<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const value = await promise;
    return { ok: true, value };
    // ^ Success case: value is T
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
    // ^ Error case: error is always normalized to Error
  }
}

// Usage — no more try/catch needed!
async function loadUserProfile(id: string) {
  const userResult = await trySafe(fetchUser(id));
  if (!userResult.ok) {
    console.log(`Error: ${userResult.error.message}`);
    return null;
  }
  // ^ From here: userResult.value is User (narrowed by ok check)

  const postsResult = await trySafe(fetchPosts(userResult.value.id));
  if (!postsResult.ok) {
    return { user: userResult.value, posts: [] };
  }

  return { user: userResult.value, posts: postsResult.value };
}
```

> 🧠 **Explain it to yourself:** What is the advantage of the Result Pattern
> over try/catch with async code? Think about type inference and the
> question "which operations can fail?".
>
> **Key points:** Result makes errors visible in the type | try/catch
> loses the specific error type | Result forces error handling
> (ok check before value access) | Each operation has its own
> Result — no "all-or-nothing" like with try/catch

---

## Pattern 3: Error Mapping

Often you want to translate external errors into your own error types:

```typescript annotated
// Own error types
type AppError =
  | { type: "network"; message: string; retryable: boolean }
  | { type: "auth"; message: string }
  | { type: "notFound"; resource: string; id: string }
  | { type: "unknown"; originalError: unknown };

// Error mapper — translates arbitrary errors into AppError
function toAppError(error: unknown): AppError {
  if (error instanceof TypeError) {
    return { type: "network", message: error.message, retryable: true };
    // ^ TypeError often comes from fetch() on network problems
  }
  if (isHttpError(error)) {
    if (error.status === 401 || error.status === 403) {
      return { type: "auth", message: "Not authorized" };
    }
    if (error.status === 404) {
      return { type: "notFound", resource: "unknown", id: "unknown" };
    }
  }
  return { type: "unknown", originalError: error };
  // ^ Fallback — never swallow errors!
}

// Usage in the async chain:
async function getUser(id: string): Promise<Result<User, AppError>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw Object.assign(new Error(), { status: res.status });
    return { ok: true, value: await res.json() };
  } catch (error) {
    return { ok: false, error: toAppError(error) };
    // ^ Error is now AppError — type-safe and structured
  }
}
```

> ⚡ **Practical tip for Angular:** In Angular services you use
> RxJS `catchError` instead of try/catch. The pattern is identical:
>
> ```typescript
> // Angular service with error mapping
> getUser(id: string): Observable<Result<User, AppError>> {
>   return this.http.get<User>(`/api/users/${id}`).pipe(
>     map(user => ({ ok: true as const, value: user })),
>     catchError(error => of({ ok: false as const, error: toAppError(error) }))
>   );
> }
> ```

---

## The Combination: Async + Result + Discriminated Union

The full pattern brings type safety to asynchronous code:

```typescript
async function checkout(cartId: string): Promise<Result<Order, CheckoutError>> {
  const cart = await trySafe(fetchCart(cartId));
  if (!cart.ok) return { ok: false, error: { type: "cartNotFound", cartId } };

  const payment = await trySafe(processPayment(cart.value));
  if (!payment.ok) return { ok: false, error: { type: "paymentFailed", reason: payment.error.message } };

  const order = await trySafe(createOrder(cart.value, payment.value));
  if (!order.ok) return { ok: false, error: { type: "orderCreationFailed", details: order.error.message } };

  return { ok: true, value: order.value };
}
// Each step has a specific error type — nothing gets lost!
```

> 🔬 **Experiment:** Build the `trySafe` function yourself and test it
> with different error types:
>
> ```typescript
> async function trySafe<T>(promise: Promise<T>): Promise<Result<T>> {
>   try {
>     return { ok: true, value: await promise };
>   } catch (error) {
>     return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
>   }
> }
>
> // Test with:
> const r1 = await trySafe(Promise.resolve(42));
> // r1.ok === true, r1.value === 42
>
> const r2 = await trySafe(Promise.reject(new Error("fail")));
> // r2.ok === false, r2.error.message === "fail"
>
> const r3 = await trySafe(Promise.reject("a string"));
> // r3.ok === false, r3.error.message === "a string"
> ```

---

## What you've learned

- `catch` always has `unknown` (or `any`) — TypeScript cannot track error types
- `useUnknownInCatchVariables` enforces type narrowing in catch blocks
- Type guards like `isError()` and `isHttpError()` make catch blocks type-safe
- The Async Result Pattern (`trySafe`) makes errors visible in the type
- Error mapping translates external errors into your own discriminated unions

**Core concept to remember:** In async code, errors are inevitable. The question is not WHETHER errors occur, but whether your type system makes them visible. The Result Pattern makes errors first-class citizens in the type — instead of letting them disappear into an `any` hole.

---

> **Pause point** — Good moment for a break. You now have the three
> foundations: types, inference, and error handling. From here on we build
> on top of them.
>
> Continue with: [Section 04: Generic Async Patterns](./04-generische-async-patterns.md)