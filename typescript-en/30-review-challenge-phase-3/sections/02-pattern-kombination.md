# Section 2: Pattern Combination — Connecting Concepts

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Phase 3 Overview](./01-phase-3-ueberblick.md)
> Next section: [03 - Type-Level Programming](./03-typ-level-programmierung.md)

---

## What you'll learn here

- How Branded Types + Result Pattern together form a robust error system
- How Classes + Generics + Variance enable a safe Repository Pattern
- How Recursive Types + Branded Types enable deep validation
- Why the combination provides more safety than any single concept alone

---

## Combination 1: Branded Types + Result Pattern
<!-- section:summary -->
In L24 you learned how to make types distinguishable through brands.

<!-- depth:standard -->
In L24 you learned how to make types distinguishable through brands.
In L25 you learned the Result Pattern. Together they form a system
where both values and errors are type-safe:

```typescript annotated
// Branded Types from L24:
type Email = string & { readonly __brand: 'Email' };
type Username = string & { readonly __brand: 'Username' };

// Result Pattern from L25:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Branded Error Types — the combination:
type ValidationError = { kind: 'validation'; field: string; message: string };
type NotFoundError = { kind: 'not-found'; id: string };

// Smart Constructor with Result return:
function parseEmail(input: string): Result<Email, ValidationError> {
  if (!input.includes('@')) {
    return {
      ok: false,
      error: { kind: 'validation', field: 'email', message: 'No @ symbol' }
    };
    // ^ Error is visible in the type — no try/catch needed
  }
  return { ok: true, value: input as Email };
  // ^ Brand is only assigned here — after validation
}

// Usage — the compiler enforces error handling:
const result = parseEmail(userInput);
if (result.ok) {
  sendMail(result.value);
  // ^ result.value is Email (branded!), not string
} else {
  showError(result.error.message);
  // ^ result.error is ValidationError — type-safe
}
```

> 📖 **Background: Parse, Don't Validate**
>
> Alexis King published the influential blog post
> "Parse, Don't Validate" in 2019. The core idea: instead of validating
> data and then passing it along as a `string` (where the validation is
> lost), you should PARSE it — meaning transform it into a stronger type.
> The brand in `Email` is proof that the validation took place.
> This is exactly the pattern of L24 + L25 combined.

> 💭 **Think about it:** What is the advantage over a simple
> `validateEmail(input: string): boolean` function?
>
> **Answer:** With boolean you lose the information AFTER the
> check. You have a `string`, not an `Email`. Every
> function that expects an `Email` would have to check again.
> With Branded Types + Result, the validation is "baked into" the type.

---

<!-- /depth -->
## Combination 2: Classes + Generics + Variance
<!-- section:summary -->
A generic repository with correct variance (L21 + L22):

<!-- depth:standard -->
A generic repository with correct variance (L21 + L22):

```typescript annotated
// Base types with Branded IDs (L24):
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

// Entity base class (L21):
abstract class Entity<Id> {
  constructor(public readonly id: Id) {}
  // ^ readonly — IDs must never be changed
}

class User extends Entity<UserId> {
  constructor(id: UserId, public name: string) { super(id); }
}

class Post extends Entity<PostId> {
  constructor(id: PostId, public title: string, public authorId: UserId) {
    super(id);
  }
}

// Generic Repository (L22 — note variance!):
interface ReadRepository<out T extends Entity<unknown>> {
  // ^ out = covariant: ReadRepository<User> is assignable to ReadRepository<Entity<unknown>>
  findById(id: T extends Entity<infer Id> ? Id : never): Promise<T | null>;
  findAll(): Promise<T[]>;
}

interface WriteRepository<in T extends Entity<unknown>> {
  // ^ in = contravariant: WriteRepository<Entity<unknown>> is assignable to WriteRepository<User>
  save(entity: T): Promise<void>;
  delete(entity: T): Promise<void>;
}

interface Repository<T extends Entity<unknown>>
  extends ReadRepository<T>, WriteRepository<T> {}
// ^ Combination: Read + Write = invariant
```

> 🧠 **Explain to yourself:** Why is `ReadRepository<out T>`
> covariant, but `WriteRepository<in T>` contravariant?
> Recall L22: Where does the type parameter appear — in the return
> (out/covariant) or in the parameter (in/contravariant)?
> **Key points:** ReadRepository returns T (out-position) |
> WriteRepository accepts T (in-position) | Covariance =
> more specific type assignable | Contravariance = more general type
> assignable

---

<!-- /depth -->
## Combination 3: Recursive Types + Branded Types
<!-- section:summary -->
In L23 you learned recursive types. Combined with Branded

<!-- depth:standard -->
In L23 you learned recursive types. Combined with Branded
Types from L24, a system for deep, type-safe
validation emerges:

```typescript annotated
// Branded Primitive Types (L24):
type PositiveNumber = number & { readonly __brand: 'Positive' };
type NonEmptyString = string & { readonly __brand: 'NonEmpty' };

// Recursive type that "brands" all fields (L23):
type DeepValidated<T> = T extends object
  ? { [K in keyof T]: DeepValidated<T[K]> }
  // ^ Recursion: nested objects are also validated
  : T extends number
    ? PositiveNumber
    // ^ All numbers become PositiveNumber
    : T extends string
      ? NonEmptyString
      // ^ All strings become NonEmptyString
      : T;

// Application:
type Config = {
  server: { host: string; port: number };
  db: { url: string; poolSize: number };
};

type ValidatedConfig = DeepValidated<Config>;
// Result:
// {
//   server: { host: NonEmptyString; port: PositiveNumber };
//   db: { url: NonEmptyString; poolSize: PositiveNumber };
// }
```

> 🔬 **Experiment:** Extend the `DeepValidated` type in your head.
> What happens when `Config` has an array field?
>
> ```typescript
> type ConfigV2 = {
>   server: { host: string; ports: number[] };
> };
>
> // What is DeepValidated<ConfigV2>?
> // Hint: Arrays are also "objects" in JavaScript.
> // Would ports become PositiveNumber[]?
> // Not quite — you'd need to handle the array case separately:
> type DeepValidatedV2<T> = T extends (infer U)[]
>   ? DeepValidatedV2<U>[]
>   : T extends object
>     ? { [K in keyof T]: DeepValidatedV2<T[K]> }
>     : T extends number ? PositiveNumber
>     : T extends string ? NonEmptyString
>     : T;
> ```

---

<!-- /depth -->
## Combination 4: Error Handling + Decorators
<!-- section:summary -->
L25 (Result Pattern) + L28 (Decorators) — automatic error wrapping:

<!-- depth:standard -->
L25 (Result Pattern) + L28 (Decorators) — automatic error wrapping:

```typescript annotated
// A decorator that converts try/catch into Result (L28 + L25):
function catchToResult<T>(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = async function(...args: any[]) {
    try {
      const value = await original.apply(this, args);
      return { ok: true, value } as const;
      // ^ Success → Result.ok
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error))
      } as const;
      // ^ Error → Result.error
    }
  };
}

// Usage in an Angular service class:
class UserService {
  @catchToResult
  async getUser(id: UserId): Promise<User> {
    // ^ Decorator converts Promise<User> to Promise<Result<User, Error>>
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Not found');
    return response.json();
  }
}
```

> ⚡ **Practical tip:** In your Angular project you could use such a
> decorator for HTTP service methods. Instead of writing try/catch
> in every component, every service method automatically returns
> a Result. This makes error handling in the template declarative
> rather than imperative:
>
> ```typescript
> // In the component:
> const result = await this.userService.getUser(id);
> if (result.ok) {
>   this.user = result.value;
> } else {
>   this.errorMessage = result.error.message;
> }
> ```

---

<!-- /depth -->
## Combination 5: State Machine + Branded Types + Phantom Types
<!-- section:summary -->
Perhaps the most powerful pattern from Phase 3 — a type-safe

<!-- depth:standard -->
Perhaps the most powerful pattern from Phase 3 — a type-safe
state machine that prevents invalid transitions at compile time:

```typescript annotated
// Phantom Types for states (L26):
type Draft = { readonly __state: 'draft' };
type Review = { readonly __state: 'review' };
type Published = { readonly __state: 'published' };

// Document with Phantom Type parameter:
class Document<State> {
  private constructor(
    public readonly title: string,
    public readonly content: string
  ) {}

  static create(title: string): Document<Draft> {
    // ^ New document is ALWAYS in the Draft state
    return new Document(title, '');
  }
}

// State transitions as functions:
function submitForReview(doc: Document<Draft>): Document<Review> {
  // ^ ONLY Draft → Review is permitted
  return doc as unknown as Document<Review>;
}

function publish(doc: Document<Review>): Document<Published> {
  // ^ ONLY Review → Published is permitted
  return doc as unknown as Document<Published>;
}

// Usage:
const doc = Document.create('My Article');       // Document<Draft>
const reviewed = submitForReview(doc);            // Document<Review>
const published = publish(reviewed);              // Document<Published>

// publish(doc);
// ^ Error! Document<Draft> is not Document<Review>
// The compiler prevents the invalid transition!
```

> 🧠 **Explain to yourself:** Why is this pattern better than
> a simple `state: 'draft' | 'review' | 'published'` field?
> What happens with runtime state checks vs compile-time checks?
> **Key points:** Runtime check: error only at execution |
> Compile-time check: error while writing | Phantom Types:
> impossible to encode an invalid transition | Runtime state: can
> be forgotten to check

---

<!-- /depth -->
## Summary: The Pattern Library

| Combination | Lessons | Result |
|-------------|---------|--------|
| Branded + Result | L24 + L25 | Type-safe validation with explicit errors |
| Classes + Generics + Variance | L21 + L22 | Safe Repository/Service abstraction |
| Recursive + Branded | L23 + L24 | Deep validation of nested data |
| Error Handling + Decorators | L25 + L28 | Automatic error wrapping |
| State Machine + Phantom Types | L24 + L26 | Invalid states = compile error |

---

## What you've learned

- Branded Types + Result Pattern form a complete validation system
- Variance from L22 is essential for generic repositories
- Recursive Types + Branded Types enable deep validation
- Phantom Types + State Machines prevent invalid state transitions at compile time

> 🧠 **Explain to yourself:** Which combination would you introduce
> first in an e-commerce project? Why?
> **Key points:** Branded IDs (L24) for CustomerId vs OrderId |
> Result Pattern (L25) for payment errors | State Machine (L26)
> for order status (draft → paid → shipped → delivered)

**Core concept to remember:** Every Phase 3 concept is useful on its own.
But the **combination** makes the real difference — it transforms
the type system from a checking tool into a design tool.

---

> **Pause point** -- Pattern combinations mastered. Next up:
> Type-level programming in practice.
>
> Continue with: [Section 03: Type-Level Programming](./03-typ-level-programmierung.md)