# Section 5: Error Type Patterns

> Estimated reading time: **9 minutes**
>
> Previous section: [04 - Exhaustive Error Handling](./04-exhaustive-error-handling.md)
> Next section: [06 - Error Handling in Practice](./06-error-handling-praxis.md)

---

## What you'll learn here

- **Error hierarchies** modeled with union types instead of classes
- **Error conversion** between different layers (domain, API, UI)
- How to make `instanceof` with `class` errors type-safe
- The **Error Boundary Pattern** for React and Angular

---

## Error Hierarchies Without Classes

> **Background: Classes vs. Union Types for Errors**
>
> In Java/C# the standard pattern for error hierarchies is:
> `class ValidationError extends AppError { }`. This has problems:
> classes are hard to serialize (JSON), require `instanceof` checks,
> and can only exist in a single hierarchy.
>
> TypeScript community practice (2024): prefer **Discriminated Union Types**.
> They are serializable (JSON), easy to create, and allow
> "multiple hierarchies" (one error can appear in multiple contexts).
>
> Libraries like `neverthrow` popularized this approach in TypeScript.

```typescript annotated
// Bad approach: class hierarchy (Java-style)
class AppError extends Error { constructor(message: string) { super(message); } }
class ValidationError extends AppError { }
class NetworkError extends AppError { }
// Problem: Very inflexible, hard to serialize, instanceof checks

// Good approach: union types (TypeScript-style)
type DomainError =
  | { type: 'VALIDATION'; field: string; message: string }
  | { type: 'NOT_FOUND'; resource: string; id: string }
  | { type: 'DUPLICATE'; resource: string; field: string };

type InfraError =
  | { type: 'NETWORK'; status: number; message: string }
  | { type: 'DATABASE'; query: string; message: string }
  | { type: 'TIMEOUT'; timeout: number };

// Combined errors for the service layer:
type ServiceError = DomainError | InfraError;
//                  ^^^^^^^^^^^   ^^^^^^^^^
//                  All Domain Errors + All Infra Errors = Service can handle everything
```

---

## Error Conversion Between Layers
<!-- section:summary -->
In a real application, different layers have different error types.

<!-- depth:standard -->
In a real application, different layers have different error types.
A repository error should not pass raw DB errors up the stack:

```typescript annotated
// Infrastructure layer: raw DB errors
type DbError =
  | { type: 'DB_CONSTRAINT'; constraint: string }
  | { type: 'DB_CONNECTION'; message: string }
  | { type: 'DB_TIMEOUT'; timeout: number };

// Domain layer: business-understandable errors
type UserError =
  | { type: 'USER_NOT_FOUND'; userId: string }
  | { type: 'USER_ALREADY_EXISTS'; email: string }
  | { type: 'USER_UNAVAILABLE'; message: string };

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Repository translates DB errors → Domain errors:
function dbErrorToUserError(err: DbError, context: { email?: string; userId?: string }): UserError {
  switch (err.type) {
    case 'DB_CONSTRAINT':
      return { type: 'USER_ALREADY_EXISTS', email: context.email! };
    case 'DB_CONNECTION':
    case 'DB_TIMEOUT':
      return { type: 'USER_UNAVAILABLE', message: err.type === 'DB_TIMEOUT'
        ? 'Database timeout — please try again'
        : err.message
      };
    default:
      return assertNever(err);
  }
}

// UserRepository translates completely:
async function createUser(email: string, name: string): Promise<Result<User, UserError>> {
  const dbResult = await insertUserInDb(email, name); // returns Result<User, DbError>
  if (!dbResult.ok) {
    return { ok: false, error: dbErrorToUserError(dbResult.error, { email }) };
    // ^ DB error is translated to a domain error — clean API!
  }
  return dbResult; // ok: true with User — no conversion needed
}

function assertNever(x: never): never { throw new Error(`Unhandled: ${JSON.stringify(x)}`); }
type User = { id: string; email: string; name: string };
async function insertUserInDb(_e: string, _n: string): Promise<Result<User, DbError>> {
  return { ok: true, value: { id: 'u-1', email: _e, name: _n } };
}
```

> 🧠 **Explain to yourself:** Why is it bad when a repository
> passes raw `DbError` types up to the service layer? What does the
> service then know, and what should it know?
>
> **Key points:** Service should know business concepts, not SQL details |
> DbError: technical (Constraint, Connection) | UserError: business (not found, already exists) |
> Separation: layers communicate in their own language |
> Maintainability: DB technology can be swapped without changing the service

---

<!-- /depth -->
## Making `class` Errors Type-Safe
<!-- section:summary -->
Sometimes you need classes (for `instanceof`, stack traces, interop):

<!-- depth:standard -->
Sometimes you need classes (for `instanceof`, stack traces, interop):

```typescript annotated
// Type-safe error classes with discriminant:
class AppError extends Error {
  abstract readonly type: string;
  // ^ 'abstract' in abstract base classes — forces subclasses to define a type
}

class ValidationError extends AppError {
  readonly type = 'VALIDATION' as const;
  // ^ 'as const': literal type 'VALIDATION', not 'string'
  constructor(
    public readonly field: string,
    public readonly constraint: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError'; // For logging
  }
}

class NotFoundError extends AppError {
  readonly type = 'NOT_FOUND' as const;
  constructor(public readonly resource: string, public readonly id: string) {
    super(`${resource} with ID ${id} not found`);
    this.name = 'NotFoundError';
  }
}

type AppErrorTypes = ValidationError | NotFoundError;

// Type-safe error handler:
function handleAppError(error: AppErrorTypes): string {
  switch (error.type) {
    case 'VALIDATION':
      return `Validation error: ${error.field} — ${error.constraint}`;
    case 'NOT_FOUND':
      return `Not found: ${error.resource} #${error.id}`;
    default:
      // error.type must be 'never' when all cases are covered
      const _exhaustive: never = error;
      throw new Error(`Unhandled error: ${_exhaustive}`);
  }
}

// instanceof works too:
try {
  throw new ValidationError('email', 'required', 'Email is required');
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(`Field: ${e.field}`); // ✅ TypeScript knows: ValidationError
  }
}
```

> 💭 **Think about it:** When is `class`-based error handling better than
> union types? And when is it worse?
>
> **Answer:** Classes better: `instanceof` checks, automatic stack traces,
> interop with libraries that expect classes, methods on errors.
> Union types better: JSON serializability, easy creation, deserialization,
> pattern matching without instanceof, easier to test.
> Recommendation: union types as default, classes only when there is a concrete reason.

---

<!-- /depth -->
## Error Boundary Pattern
<!-- section:summary -->
In React and Angular there are error boundaries — places where errors are caught:

<!-- depth:standard -->
In React and Angular there are error boundaries — places where errors are caught:

```typescript annotated
// Generic error boundary type:
type ErrorBoundary<T, E> = {
  run: () => Promise<T>;
  onError: (error: E) => void;
  onSuccess: (result: T) => void;
};

// Generic wrapper function:
async function withErrorBoundary<T, E>(
  operation: () => Promise<Result<T, E>>,
  handlers: {
    onSuccess: (value: T) => void;
    onError: (error: E) => void;
  }
): Promise<void> {
  try {
    const result = await operation();
    if (result.ok) {
      handlers.onSuccess(result.value);
    } else {
      handlers.onError(result.error);
    }
  } catch (unexpected) {
    // Forward unexpected errors (bugs):
    console.error('Unexpected error:', unexpected);
    throw unexpected; // Re-throw for global error handling
  }
}

// In Angular components:
// await withErrorBoundary(
//   () => userService.createUser(data),
//   {
//     onSuccess: user => this.router.navigate(['/dashboard']),
//     onError: err => this.errorMessage = getErrorMessage(err)
//   }
// );
```

<!-- depth:vollstaendig -->
> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> function assertNever(x: never): never { throw new Error(`Unhandled: ${JSON.stringify(x)}`); }
>
> type FormError =
>   | { type: 'REQUIRED';    field: string }
>   | { type: 'MIN_LENGTH';  field: string; min: number }
>   | { type: 'MAX_LENGTH';  field: string; max: number }
>   | { type: 'PATTERN';     field: string; pattern: string };
>
> function handleFormError(e: FormError): string {
>   switch (e.type) {
>     case 'REQUIRED':   return `${e.field} is required`;
>     case 'MIN_LENGTH': return `${e.field}: at least ${e.min} characters`;
>     case 'MAX_LENGTH': return `${e.field}: max ${e.max} characters`;
>     case 'PATTERN':    return `${e.field}: expected format ${e.pattern}`;
>     default:           return assertNever(e);
>   }
> }
>
> const errors: FormError[] = [
>   { type: 'REQUIRED',   field: 'email' },
>   { type: 'MIN_LENGTH', field: 'password', min: 8 },
>   { type: 'PATTERN',    field: 'phone', pattern: '+1...' },
> ];
> errors.forEach(e => console.log(handleFormError(e)));
> ```
>
> Now add `| { type: 'EMAIL_FORMAT'; field: string }` to the `FormError` union.
> Observe: the compile error appears in the `default` branch of `handleFormError` —
> exactly where you forgot to handle the new case!

---

<!-- /depth -->
## Error Serialization for APIs

```typescript annotated
// Errors often need to be serialized as JSON (HTTP API):
type ApiErrorResponse = {
  error: {
    type: string;
    message: string;
    details?: Record<string, unknown>;
  };
  statusCode: number;
};

type DomainError =
  | { type: 'NOT_FOUND'; resource: string; id: string }
  | { type: 'VALIDATION'; field: string; message: string };

function toApiError(error: DomainError): ApiErrorResponse {
  switch (error.type) {
    case 'NOT_FOUND':
      return {
        statusCode: 404,
        error: {
          type: 'NOT_FOUND',
          message: `${error.resource} #${error.id} not found`,
          details: { resource: error.resource, id: error.id }
        }
      };
    case 'VALIDATION':
      return {
        statusCode: 422,
        error: {
          type: 'VALIDATION_ERROR',
          message: error.message,
          details: { field: error.field }
        }
      };
    default:
      return assertNever(error);
  }
}
```

---

## What You've Learned

- **Error hierarchies with union types** are more flexible than classes — serializable, no instanceof pitfalls
- **Error conversion** between layers: DB errors → domain errors → API errors (each layer speaks its own language)
- `class` errors with `readonly type = '...' as const` can also be treated as discriminated unions
- **Error Boundary Pattern**: expected errors with `Result`, unexpected ones forwarded with `throw`

> 🧠 **Explain to yourself:** Why is it important that each layer
> (repository, service, controller) has its own error types? What would the
> problem be if all layers used the same error types?
>
> **Key points:** Avoid coupling: service should not know the DB implementation |
> Separation of Concerns: DB error codes (ORA-12345) don't belong in business logic |
> Replaceability: DB can be swapped without changing the service |
> Testability: each layer can be tested independently

**Core concept to remember:** Each layer translates errors into its own "language".
Error mapping is architectural work, not a detail.

---

> **Pause point** -- You now know the most important error type patterns.
>
> Continue with: [Section 06: Error Handling in Practice](./06-error-handling-praxis.md)