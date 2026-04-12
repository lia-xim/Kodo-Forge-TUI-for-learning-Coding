# Section 4: Option and Result Pattern

> Estimated reading time: **12 minutes**
>
> Previous section: [03 - Algebraic Data Types](./03-algebraische-datentypen.md)
> Next section: [05 - State Modeling](./05-zustandsmodellierung.md)

---

## What you'll learn here

- The **Option pattern** (Some/None) as a type-safe null alternative
- The **Result pattern** (Ok/Err) for elegant error handling
- Utility functions for Result values (map)
- Why Option/Result are better than `null` and `try/catch`

---

## Historical Background: Where Do Option and Result Come From?

Before diving into the details, a brief look back — because these
patterns are not a new invention, but have a long history.

The **Option pattern** originally comes from the functional
programming language **ML** (Meta Language, 1973), where it was defined as
`datatype 'a option = SOME of 'a | NONE`. From there it migrated to **Haskell**
(`Maybe`), **OCaml**, **F#**, and eventually into modern languages like
**Rust** (`Option<T>`), **Swift** (`Optional<T>`), and **Kotlin** (nullable
types). Even **Java** followed with `Optional<T>` in version 8 — though
only as a wrapper, not a true ADT.

The **Result pattern** was popularized by **Rust**, where it is the
standard approach to error handling. But the idea is older:
Eithers in **Haskell** (`Either e a`), `Validation` in **Scala** (cats),
and `Expected` in C++ (since C++23) all follow the same core principle:
**Make the error case a first-class, visible value.**

> **Self-Explanation:** Why have so many languages independently adopted this
> pattern? What does that say about the value of the pattern?
>
> **Core Point:** Because null/try-catch fundamentally *hide* what can
> happen in the code. Option/Result make it *visible*.

---

## The Option Pattern: Some / None

One of the most important ADT patterns: **Option** (also: Maybe in Haskell)
represents a value that may or may not be present.

### Three Analogies for Option\<T\>

Think of Option like a **locked treasure chest**: it can contain a
treasure (`some`) or be empty (`none`). The trick is: you must open
the chest (check the tag) before you can access the contents. You
can't just reach in and hope something is there.

Or think of a **search engine**: when you search for something, you get
either a result (`some`) or the message "No results found"
(`none`). Both are valid answers — neither is an "error".

A third analogy: Option is like an **envelope**. The envelope
has a clear exterior (the tag) that tells you whether a letter is inside.
You can't read the letter without opening the envelope. With null,
you simply get nothing — and if you try to read anyway, it crashes.

### The Problem With null/undefined

```typescript annotated
// Classic — null/undefined are invisible pitfalls:
function findUser(id: string): User | null {
  // ...
}

const user = findUser("123");
// user.name; // Runtime error if null!
// You MUST check, but easily forget to.
```

> **Think Question:** Tony Hoare, the inventor of null, called it his
> "billion-dollar mistake". What do you think he meant by that?
>
> *(Think time: ~15 seconds)*
>
> **Answer:** Not that null itself is bad — but that the cumulative
> cost of all null-pointer bugs throughout the history of
> software development amounts to roughly one billion dollars.
> Every developer occasionally forgets the null check.

### The ADT Solution: Option\<T\>

```typescript annotated
type Option<T> =
  | { tag: "some"; value: T }
  | { tag: "none" };

// Constructor functions:
function some<T>(value: T): Option<T> {
  return { tag: "some", value };
}

function none<T>(): Option<T> {
  return { tag: "none" };
}

// Usage:
function findUser(id: string): Option<User> {
  const user = database.get(id);
  return user ? some(user) : none();
}

const result = findUser("123");

// TypeScript ENFORCES the check:
if (result.tag === "some") {
  console.log(result.value.name); // Safe!
} else {
  console.log("User not found");
}
```

> **Advantage over null:** You cannot call `result.value` without
> first checking the tag. The compiler enforces handling of
> both cases.

### Line-by-Line Explanation of the Option Code

Let's take a close look at the key parts:

```typescript
// Lines 1-3: Option is a discriminated union with two variants
type Option<T> =
  | { tag: "some"; value: T }   // Case 1: value present, T is delivered
  | { tag: "none" };             // Case 2: no value, no data
// The discriminator "tag" lets the compiler narrow the type.
// Inside if(result.tag === "some"), TypeScript knows: result.value exists.

// Lines 6-9: some() is a smart constructor — it wraps a value
function some<T>(value: T): Option<T> {
  return { tag: "some", value };
}
// The generic type T is inferred automatically: some(42) gives Option<number>

// Lines 11-13: none() returns the empty variant
function none<T>(): Option<T> {
  return { tag: "none" };
}
// T is not needed here — none() is valid for any type.

// Lines 16-19: findUser returns Option<User> — the signature
// immediately tells you: "This function can fail!"
function findUser(id: string): Option<User> {
  const user = database.get(id);
  return user ? some(user) : none();
}
// With null/undefined the signature would read User | null —
// the "or null" is easy to overlook. Option is more explicit.
```

> **Self-Explanation:** Why is `Option<User>` more informative than
> `User | null`? Explain it out loud as if you were explaining it to a
> junior developer.
>
> **Core Point:** `Option<User>` is a deliberate, named type.
> `User | null` is a union that looks like a detail. Option
> communicates *intent*: "Something can be missing here, and that's okay."
> Null communicates nothing — it's a technical detail, not a
> semantic concept.

> **Experiment:** Create a `firstElement` function for arrays:
>
> ```typescript
> type Option<T> =
>   | { tag: "some"; value: T }
>   | { tag: "none" };
>
> function firstElement<T>(arr: T[]): Option<T> {
>   if (arr.length === 0) return { tag: "none" };
>   return { tag: "some", value: arr[0] };
> }
>
> // Test with an empty and a non-empty array:
> const empty = firstElement([]);
> const full = firstElement(["Hello", "World"]);
>
> // What does TypeScript show for empty.tag and full.tag?
> // What about empty.value (error!) vs. full.value (after check)?
> ```

---

## The Result Pattern: Ok / Err

Even more powerful: **Result** (the standard pattern in Rust) represents
an operation that can either succeed or fail:

### Three Analogies for Result\<T, E\>

Result is like a **package delivery**: either the package arrives (`ok`)
or it gets lost (`err`) — but in both cases you get a notification.
With try/catch the package would simply disappear, and you'd only
notice when you look at the empty shelf.

Result is like a **doctor's visit**: the doctor gives you either good
news (`ok: healthy`) or a diagnosis (`err: specific condition`).
Both are structured pieces of information — not an abstract "error".

Result is like a **vending machine**: you put money in and either get
your drink (`ok`) or an error message with your money back
(`err: "machine empty"`). The machine *communicates* the outcome, it
doesn't just explode.

### Why Result Instead of try/catch? — The Deeper Explanation

```typescript annotated
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Constructor functions:
function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Application: parsing without exceptions
function parseAge(input: string): Result<number, string> {
  const age = parseInt(input, 10);

  if (isNaN(age)) {
    return err(`"${input}" is not a valid number`);
  }
  if (age < 0 || age > 150) {
    return err(`Age ${age} is not realistic`);
  }

  return ok(age);
}

// Usage:
const result = parseAge("abc");

if (result.ok) {
  console.log(`Age: ${result.value}`);  // Type: number
} else {
  console.log(`Error: ${result.error}`); // Type: string
}
```

### Why Result Instead of try/catch?

| Aspect | try/catch | Result\<T, E\> |
|--------|-----------|--------------|
| Visibility | Error is invisible in the signature | Error is part of the type |
| Forced handling | No — catch is optional | Yes — compiler enforces checking |
| Type safety | Error is `unknown` in catch | Error has concrete type E |
| Composition | Hard to chain | Map/flatMap chains possible |

> **Important:** Result does NOT replace all exceptions. For
> unexpected programming errors (bugs), exceptions are correct.
> Result is for **expected failure cases** — validation,
> parsing, network timeouts.

### Why Option/Result Are Better Than null/try-catch — In Detail

**1. Composition:** Result values can be chained. You can
write `map`, `flatMap`, and `andThen` to connect Result operations
into a pipeline. With try/catch you have to wrap each operation
in its own try block:

```typescript
// Result pipeline — errors are automatically propagated:
const result = parseAge("25")
  .pipe(age => multiply(age, 2))
  .pipe(age => checkLegal(age));
// An error at ANY point breaks the pipeline cleanly.

// try/catch — each stage needs its own handling:
try {
  const age = parseAgeRaw("25");  // could throw
  try {
    const doubled = multiplyRaw(age, 2);
    try {
      const legal = checkLegalRaw(doubled);
    } catch (e) { /* legal check failed */ }
  } catch (e) { /* multiply failed */ }
} catch (e) { /* parse failed */ }
```

**2. Visibility:** The signature `Result<T, E>` immediately tells you
what errors can occur. With `try/catch` you have to read the
implementation — or guess.

**3. Explicitness:** `Option<User>` and `Result<T, ApiError>` are
*named intentions*. `null` and `throw` are *technical mechanisms*.
Good code communicates intention, not just mechanics.

> **Think Question:** When would you use `Option` and when `Result`?
> Are there cases where both fit?
>
> *(Think time: ~20 seconds)*
>
> **Answer:** `Option` says "value present or not" — without a reason.
> `Result` says "success OR failure WITH a reason". If you only want to know
> *whether* something exists: Option. If you want to know *why*
> something went wrong: Result. A `findUser` needs Option (either
> found or not). A `parseAge` needs Result (wrong format,
> invalid value, etc.).

---

## Utility Functions for Result

In practice, you write helper functions to process
Result values elegantly:

```typescript annotated
// map: Transform the success value
function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

// Usage:
const ageResult = parseAge("25");
const doubledAge = mapResult(ageResult, age => age * 2);
// Result<number, string> — error is propagated automatically!
```

> **Experiment:** Try the Result pattern directly:
>
> ```typescript
> type Result<T, E> =
>   | { ok: true; value: T }
>   | { ok: false; error: E };
>
> function divide(a: number, b: number): Result<number, string> {
>   if (b === 0) return { ok: false, error: "Division by zero!" };
>   return { ok: true, value: a / b };
> }
>
> const result = divide(10, 0);
> if (result.ok) {
>   console.log(result.value);
> } else {
>   console.log(result.error);
> }
> ```
>
> Try `divide(10, 2)` and `divide(10, 0)` — what gets printed in each case?

---

**In your Angular project:** The Result pattern is an excellent fit for HTTP calls. Instead of try/catch in every component, you can write a central service that returns `Result<T, ApiError>`:

```typescript
type ApiError =
  | { kind: "network"; message: string }
  | { kind: "unauthorized" }
  | { kind: "not_found"; resource: string }
  | { kind: "server_error"; statusCode: number };

@Injectable({ providedIn: 'root' })
class ApiService {
  getUser(id: string): Observable<Result<User, ApiError>> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      map(user => ({ ok: true as const, value: user })),
      catchError(err => {
        if (err.status === 401) return of({ ok: false as const, error: { kind: "unauthorized" as const } });
        return of({ ok: false as const, error: { kind: "server_error" as const, statusCode: err.status } });
      })
    );
  }
}

// In the component: clear case distinction without try/catch:
this.apiService.getUser("123").subscribe(result => {
  if (result.ok) {
    this.user = result.value;
  } else if (result.error.kind === "unauthorized") {
    this.router.navigate(['/login']);
  }
});
```

**In React:** The same pattern in a `useQuery` hook — `Result<T, ApiError>` instead of `{ data, error, isLoading }`.

**In RxJS:** The `materialize` operator converts Observable events into
structured notifications — the Result pattern for streams.

---

## What You've Learned

- The **Option pattern** (`Some<T> | None`) replaces `null`/`undefined` in a type-safe way and enforces handling of both cases
- The **Result pattern** (`Ok<T> | Err<E>`) makes failure cases visible in the type signature — no more hidden `throw`
- **Utility functions** like `mapResult` enable elegant transformation of the success value while errors are automatically propagated
- Result is for **expected failure cases** (validation, parsing, timeouts); exceptions remain for unexpected bugs

**Core concept:** Option and Result make the impossible unrepresentable — when a function returns `Result<T, E>`, the error case is no longer hidden or optional, but an explicit part of the type.

---

> **Pause Point:** You now know two of the most important ADT patterns.
> In the next section we apply this to one of the most common
> real-world cases: state modeling with Loading/Error/Success.
>
> Continue: [Section 05 - State Modeling](./05-zustandsmodellierung.md)