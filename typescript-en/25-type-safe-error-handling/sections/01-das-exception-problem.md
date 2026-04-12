# Section 1: The Exception Problem

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - The Result Pattern](./02-das-result-pattern.md)

---

## What you'll learn here

- Why `throw`-based error handling creates **invisible dependencies**
- The difference between **expected errors** (validation, network) and **unexpected errors** (bugs)
- How TypeScript functions with `throw` **hide** errors instead of documenting them
- Why other languages (Rust, Haskell, Go) prefer explicit error handling

---

## Background: Two Worlds of Error Handling

> **Feature Origin Story: Exceptions vs. explicit errors**
>
> Exceptions were introduced in LISP in the 1960s and popularized
> by Java (1995). The promise: error paths can be separated
> from normal control flow.
>
> But criticism came early. Tony Hoare (inventor of `null`,
> which he himself called the "Billion-Dollar Mistake") recognized:
> Exceptions make control flow invisible. If `doSomething()`
> throws, you have to read the documentation — the type says nothing.
>
> In 2015, Rust introduced `Result<T, E>`: errors are return values,
> not exceptions. The compiler enforces that you handle the error case.
> Go (2009) with `value, err := doSomething()`. Haskell with `Maybe` and `Either`.
>
> TypeScript doesn't have `Result<T, E>` built in — but you can
> implement it yourself. That's the core topic of this lesson.

---

## The Problem: Errors Are Invisible

```typescript annotated
// This function can fail — but its type says nothing about it:
function parseUserFromJson(jsonString: string): User {
  const data = JSON.parse(jsonString);
  // ^ can throw SyntaxError! But User in the return type doesn't reveal that.

  if (!data.id || !data.email) {
    throw new Error("Invalid user data");
    // ^ Can also throw! Invisible in the type.
  }

  return { id: data.id, email: data.email, name: data.name };
}

// Caller code — what can fail here?
function loadUserProfile(json: string): void {
  const user = parseUserFromJson(json);
  // ^ Which errors? SyntaxError? ValidationError? Who knows?
  // TypeScript gives us no hint.
  console.log(`Hello, ${user.name}`);
}
```

> 🧠 **Explain to yourself:** Why is a return type of `User` for a
> function that can throw a "lie"? What does the type promise the caller
> and what does it fail to deliver?
>
> **Key points:** Type `User` promises: "I always return a User" |
> In reality: Can throw, so sometimes returns nothing at all |
> The caller relies on the promise → unhandled exception |
> TypeScript doesn't check this — unlike `null` (strictNullChecks)

---

## Expected vs. Unexpected Errors
<!-- section:summary -->
An important distinction that many developers don't make explicitly:

<!-- depth:standard -->
An important distinction that many developers don't make explicitly:

```typescript
// UNEXPECTED errors (bugs) — should always throw:
function divideNumbers(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero — this is a bug!");
  // ^ This should NEVER happen if the code is correct.
  //   throw is right here: this is a programming error, not a user input error.
  return a / b;
}

// EXPECTED errors (user input, network, validation):
function parseAge(input: string): number {
  const n = parseInt(input, 10);
  if (isNaN(n) || n < 0 || n > 150) {
    throw new ValidationError(`Invalid age: ${input}`);
    // ^ This error is *expected* — the caller must account for it.
    //   But 'throw' makes it invisible.
  }
  return n;
}
```

> 💭 **Think about it:** What's the difference between a function that
> throws when the input is invalid, and one that returns `null`?
> Which one forces the caller to handle the error?
>
> **Answer:** With `null`, TypeScript forces the caller (with `strictNullChecks`)
> to check for `null`. With `throw` there's no compile-time enforcement — the caller
> **can** use `try/catch`, but doesn't have to. `null` is therefore
> "safer" than `throw` for expected errors — but limited to
> a single "error signal" with no error information.

---

<!-- /depth -->
## The `throw` Problem in TypeScript vs. Java
<!-- section:summary -->
Java has **Checked Exceptions** — a solution to the same problem:

<!-- depth:standard -->
Java has **Checked Exceptions** — a solution to the same problem:

```java
// Java: Checked Exception — compiler enforces handling!
public User parseUserFromJson(String json) throws ValidationException, IOException {
  // 'throws' in the method signature: caller MUST use try/catch
}

// Caller code must explicitly handle it:
try {
  User user = parseUserFromJson(json);
} catch (ValidationException e) {
  // MUST be handled — compile error if not!
}
```

TypeScript has no checked exceptions. The type never says which errors
are possible. This leads to three common problems:

```typescript annotated
// Problem 1: Forgotten try/catch
function loadUser(json: string): void {
  const user = parseUserFromJson(json); // Throws — but nobody knows!
  // ^ If parseUserFromJson throws, the app crashes unhandled.
}

// Problem 2: Overly broad catch — all errors treated the same
try {
  loadUser(jsonString);
} catch (error) {
  console.log("Something went wrong"); // What exactly? No idea.
  // ^ 'error' has type 'unknown' — no type checking possible!
}

// Problem 3: Error type unclear
try {
  loadUser(jsonString);
} catch (error) {
  // Is this a SyntaxError? ValidationError? NetworkError?
  // TypeScript doesn't know — you have to guess!
  if (error instanceof ValidationError) { /* validation */ }
  else if (error instanceof SyntaxError) { /* JSON */ }
  // else: unknown! Now what? Re-throw? Ignore?
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> type User = { id: string; name: string };
>
> // Function that CAN throw — the type doesn't show it!
> function parseUserFromJson(jsonString: string): User {
>   const data = JSON.parse(jsonString) as Record<string, unknown>;
>   if (!data['id'] || !data['name']) throw new Error('Missing fields');
>   return { id: String(data['id']), name: String(data['name']) };
> }
>
> // Caller without try/catch — no compile error!
> function loadUser(json: string): void {
>   const user = parseUserFromJson(json); // Can throw — TypeScript stays silent
>   console.log(`Hello, ${user.name}`);
> }
>
> // Now with Result type — errors visible in the type:
> type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };
>
> function parseUserSafe(jsonString: string): Result<User> {
>   try {
>     const data = JSON.parse(jsonString) as Record<string, unknown>;
>     if (!data['id'] || !data['name']) return { ok: false, error: 'Missing fields' };
>     return { ok: true, value: { id: String(data['id']), name: String(data['name']) } };
>   } catch {
>     return { ok: false, error: 'Invalid JSON' };
>   }
> }
>
> const r1 = parseUserSafe('{"id":"1","name":"Max"}');
> const r2 = parseUserSafe('{invalid}');
> if (r1.ok) console.log(`User: ${r1.value.name}`);   // Max
> if (!r2.ok) console.log(`Error: ${r2.error}`);      // Invalid JSON
> ```
>
> What happens if you call `parseUserSafe` and leave out the `if (r1.ok)` check?
> TypeScript immediately shows: `r1.value` is not accessible without the `ok` check.

---

<!-- /depth -->
## The `unknown` Problem with try/catch
<!-- section:summary -->
TypeScript 4.0 introduced `useUnknownInCatchVariables`:

<!-- depth:standard -->
TypeScript 4.0 introduced `useUnknownInCatchVariables`:

```typescript annotated
// Before TS 4.0 (outdated):
try {
  throw "error-string";
} catch (error) {
  console.log(error.message); // Was allowed before (and wrong)
  // ^ Problem: 'error' was implicitly 'any' — all methods were allowed
}

// From TS 4.0 with useUnknownInCatchVariables (included in strict):
try {
  throw new Error("Error");
} catch (error) {
  // error: unknown — must be checked!
  console.log(error.message); // ❌ 'error' is 'unknown'
  // ^ COMPILE ERROR: Object is of type 'unknown'

  if (error instanceof Error) {
    console.log(error.message); // ✅ Now OK — narrowed to Error
  }
}
```

This is good — but doesn't solve the core problem: the **existence** of errors
is still invisible in the return type.

> 🔍 **Deeper knowledge: Rust's approach — the `?` operator**
>
> Rust has the `?` operator which makes explicit error handling ergonomic:
>
> ```rust
> fn parse_user(json: &str) -> Result<User, ParseError> {
>     // Type says: CAN return User OR ParseError
>     let data: Value = serde_json::from_str(json)?;
>     // ^ '?' automatically propagates the error to the caller!
>     // No try/catch, but also no unhandled error.
>     Ok(User { id: data["id"].as_str()?.to_string() })
> }
> ```
>
> TypeScript has no `?` operator — but with async/await and
> `Result<T, E>` we get very close.

---

<!-- /depth -->
## Why Not Just Always Return `null`?

```typescript annotated
// Simple solution: null on error
function parseAge(input: string): number | null {
  const n = parseInt(input, 10);
  if (isNaN(n) || n < 0 || n > 150) return null;
  return n;
}

// Problem 1: No error details
const age = parseAge("abc");
if (age === null) {
  // Why null? What was wrong? We don't know!
  console.log("Something is wrong...");
}

// Problem 2: null and "no value" get mixed up
function findUser(id: string): User | null { /* search in DB */ return null; }
// Here null means: "not found" — completely different from the error-null!

// With Result<T, E>:
function parseAgeResult(input: string): Result<number, string> {
  const n = parseInt(input, 10);
  if (isNaN(n)) return { ok: false, error: `'${input}' is not a number` };
  if (n < 0)    return { ok: false, error: `Age cannot be negative: ${n}` };
  if (n > 150)  return { ok: false, error: `Unrealistic age: ${n}` };
  return { ok: true, value: n };
}

// Now: errors ARE in the type, WITH details
const result = parseAgeResult("abc");
if (!result.ok) {
  console.log(result.error); // "'abc' is not a number"
  // ^ Type: string — we know the error!
}
```

> **In your Angular project** you'll see this often with HTTP requests:
>
> ```typescript
> // Typical problem:
> getUserById(id: string): Observable<User> {
>   return this.http.get<User>(`/api/users/${id}`);
>   // ^ Throws on 404, 500, network errors — but type says: "always User"!
> }
>
> // Better (next section):
> getUserById(id: string): Observable<Result<User, ApiError>> {
>   return this.http.get<User>(`/api/users/${id}`).pipe(
>     map(user => ({ ok: true as const, value: user })),
>     catchError(err => of({ ok: false as const, error: toApiError(err) }))
>   );
>   // ^ Errors are in the type! Caller MUST handle the error case.
> }
> ```

---

## Summary: What's Missing with throw

| Aspect | throw | null | Result<T,E> |
|--------|:----:|:----:|:-----------:|
| Visible in type? | ❌ | ✅ (but no detail) | ✅ (with detail) |
| Compiler enforces handling? | ❌ | ✅ (strictNullChecks) | ✅ |
| Error details available? | ✅ (catch) | ❌ | ✅ |
| Stackable (multiple errors)? | ❌ | ❌ | ✅ (with types) |
| Ergonomic? | ✅ Familiar | ✅ Simple | ⚠️ More code |

---

## What you've learned

- `throw`-based error handling creates **invisible dependencies** — the return type lies
- **Expected errors** (validation, network) should be explicit in the return type
- **Unexpected errors** (bugs, invariant violations) → keep using `throw`
- TypeScript's `useUnknownInCatchVariables` helps with type safety in `catch`, but doesn't solve the visibility problem
- `null` is better than `throw` for errors, but loses error details

> 🧠 **Explain to yourself:** Why is a function `parseUser(): User` that
> can throw a "lie"? What would be the most honest signature?
>
> **Key points:** User promises: "always a User" | throw = no return value |
> Honest signature: `parseUser(): User | never` (inadequate) |
> Better: `parseUser(): Result<User, ParseError>` (visible, complete)

**Core concept to remember:** Errors that are expected belong **in the return type**.
Everything else is a lie in the type system.

---

> **Pause point** -- You understand the problem. Now comes the solution.
>
> Continue with: [Section 02: The Result Pattern](./02-das-result-pattern.md)