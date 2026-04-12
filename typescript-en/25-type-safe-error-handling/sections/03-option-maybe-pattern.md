# Section 3: Option/Maybe Pattern

> Estimated reading time: **9 minutes**
>
> Previous section: [02 - The Result Pattern](./02-das-result-pattern.md)
> Next section: [04 - Exhaustive Error Handling](./04-exhaustive-error-handling.md)

---

## What you'll learn here

- What `Option<T>` (also `Maybe<T>`) is and when it's better than `T | null`
- The difference between "no value" (`Option`) and "error" (`Result`)
- How TypeScript's `strictNullChecks` already provides a native `Option` system
- When to choose `Option<T>` vs `Result<T,E>` vs `null`

---

## Option<T>: "Maybe a value"

> **Background: Haskell's `Maybe` and the Null Problem**
>
> Tony Hoare called `null` his "Billion Dollar Mistake" (2009): "I couldn't
> resist the temptation to put in a null reference [...] This has led to
> innumerable errors, vulnerabilities, and system crashes."
>
> Haskell never introduced `null`. Instead it has `Maybe a`:
> either `Nothing` (no value) or `Just a` (a value). This is explicit
> and safe.
>
> Scala has `Option[T]` (Some/None), Rust has `Option<T>` (Some/None).
> TypeScript has no built-in `Maybe` — but `T | null` with `strictNullChecks`
> achieves the same goal. `Option<T>` is therefore a
> **documentary** pattern in TypeScript, not a technical necessity.

```typescript annotated
// TypeScript definition:
type Option<T> = T | null;
//              ^^^^^^  'null' = no value
// With strictNullChecks: null can never be ignored!

// Alternative: explicit Some/None (Haskell style):
type Some<T> = { readonly some: true;  readonly value: T };
type None    = { readonly some: false };
type Maybe<T> = Some<T> | None;

const some = <T>(value: T): Some<T> => ({ some: true, value });
const none: None = { some: false };

// Both approaches have pros/cons (more on that later in this section)
```

---

## When Option, when Result?
<!-- section:summary -->
The key question: What does the absence of a value mean?

<!-- depth:standard -->
The key question: What does the absence of a value mean?

```typescript annotated
// OPTION: No value is a normal state (not an error!)
function findUserById(id: string): User | null {
  // null = "not found" — this is NORMAL, not an error
  const user = db.find(u => u.id === id);
  return user ?? null;
}

// RESULT: Errors are an exceptional state WITH details
function createUser(data: unknown): Result<User, ValidationError> {
  // Err = validation failed — this is an ERROR with a cause
  if (!isValidUserData(data)) {
    return { ok: false, error: { type: 'INVALID_DATA', message: '...' } };
  }
  return { ok: true, value: buildUser(data) };
}

// NULL: Simplest case — no error context needed, no framework
function getFirstElement<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[0] : null;
  // null = "array empty" — very simple, no detail needed
}
```

> 🧠 **Explain to yourself:** Explain the difference between these three
> situations: `findUser()` returns null | `createUser()` returns Err |
> `getFirstElement()` returns null. Why is only the middle one an "error"?
>
> **Key points:** findUser null = normal search result (not-found) |
> createUser Err = validation problem that needs explaining |
> getFirstElement null = trivial edge case without need for detail |
> Error = unexpected result that requires context

---

<!-- /depth -->
## `strictNullChecks` as a native Option system
<!-- section:summary -->
TypeScript's `strictNullChecks` is effectively a built-in `Option` system:

<!-- depth:standard -->
TypeScript's `strictNullChecks` is effectively a built-in `Option` system:

```typescript annotated
// With strictNullChecks: true (should always be enabled!)

function getUsername(userId: string): string | null {
  // Return type explicit: string OR null — both must be handled
  if (userId === 'admin') return 'Administrator';
  return null;
}

const name = getUsername('user-123');

// COMPILE-ERROR without null check:
console.log(name.toUpperCase()); // ❌ 'name' is possibly 'null'

// Correct handling:
if (name !== null) {
  console.log(name.toUpperCase()); // ✅ TypeScript knows: string (not null)
}

// Optional chaining (?.) as shorthand:
console.log(name?.toUpperCase()); // ✅ Returns string | undefined
//               ^ '?' = only call if name is not null/undefined

// Nullish coalescing (??) as default:
console.log(name ?? 'Unknown'); // ✅ 'Unknown' if null/undefined
```

> 💭 **Think about it:** If TypeScript already has `T | null` with `strictNullChecks`,
> do we even need `Option<T>` or `Maybe<T>`?
>
> **Answer:** `T | null` is sufficient for most cases. `Option<T>` as a
> type alias is primarily **documentary**: the name communicates
> "this value is optional". `Maybe<T>` (Some/None Discriminated Union)
> is only worthwhile if you want chaining methods (map, flatMap) without
> manual null checks.

---

<!-- /depth -->
## Maybe<T> with chaining methods

```typescript annotated
type Some<T> = { readonly kind: 'some'; readonly value: T };
type None    = { readonly kind: 'none' };
type Maybe<T> = Some<T> | None;

function some<T>(value: T): Some<T> { return { kind: 'some', value }; }
const none: None = { kind: 'none' };

// Chaining helpers:
function mapMaybe<T, U>(maybe: Maybe<T>, fn: (value: T) => U): Maybe<U> {
  if (maybe.kind === 'none') return none;
  return some(fn(maybe.value));
}

function flatMapMaybe<T, U>(maybe: Maybe<T>, fn: (value: T) => Maybe<U>): Maybe<U> {
  if (maybe.kind === 'none') return none;
  return fn(maybe.value);
}

function getOrElse<T>(maybe: Maybe<T>, defaultValue: T): T {
  return maybe.kind === 'some' ? maybe.value : defaultValue;
}

// Usage:
const users: Map<string, { name: string; age: number }> = new Map([
  ['user-1', { name: 'Max', age: 30 }]
]);

function findUser(id: string): Maybe<{ name: string; age: number }> {
  const user = users.get(id);
  return user ? some(user) : none;
}

const result = flatMapMaybe(
  findUser('user-1'),
  user => user.age >= 18 ? some(user.name) : none
);

console.log(getOrElse(result, 'Unknown')); // 'Max'
console.log(getOrElse(flatMapMaybe(findUser('x'), _ => none), 'Unknown')); // 'Unknown'
```

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> type Some<T> = { readonly kind: 'some'; readonly value: T };
> type None    = { readonly kind: 'none' };
> type Maybe<T> = Some<T> | None;
>
> const some = <T>(value: T): Some<T> => ({ kind: 'some', value });
> const none: None = { kind: 'none' };
>
> function mapMaybe<T, U>(maybe: Maybe<T>, fn: (v: T) => U): Maybe<U> {
>   return maybe.kind === 'none' ? none : some(fn(maybe.value));
> }
>
> function flatMapMaybe<T, U>(maybe: Maybe<T>, fn: (v: T) => Maybe<U>): Maybe<U> {
>   return maybe.kind === 'none' ? none : fn(maybe.value);
> }
>
> function getOrElse<T>(maybe: Maybe<T>, def: T): T {
>   return maybe.kind === 'some' ? maybe.value : def;
> }
>
> // Implement these two yourself:
> function fromNullable<T>(value: T | null | undefined): Maybe<T> {
>   return value != null ? some(value) : none;
> }
>
> function filterMaybe<T>(maybe: Maybe<T>, pred: (v: T) => boolean): Maybe<T> {
>   if (maybe.kind === 'none') return none;
>   return pred(maybe.value) ? maybe : none;
> }
>
> // Test data:
> const users = new Map([
>   ['u1', { name: 'Max', age: 30 }],
>   ['u2', { name: 'Anna', age: 16 }],
> ]);
>
> function findUser(id: string): Maybe<{ name: string; age: number }> {
>   return fromNullable(users.get(id));
> }
>
> // Chain: find → filterMaybe (adults only) → mapMaybe (name only)
> const name = getOrElse(
>   mapMaybe(filterMaybe(findUser('u1'), u => u.age >= 18), u => u.name),
>   'Minor or not found'
> );
> console.log(name); // 'Max'
>
> const minor = getOrElse(
>   mapMaybe(filterMaybe(findUser('u2'), u => u.age >= 18), u => u.name),
>   'Minor or not found'
> );
> console.log(minor); // 'Minor or not found'
> ```
>
> What happens if you replace `u.age >= 18` with `u.age >= 30`?
> What does `findUser('unknown')` return after the filter?

---

## `Option` vs `null` — A pragmatic decision

```typescript annotated
// When T | null is sufficient (pragmatic):

// ✅ Simple lookups:
function getConfig(key: string): string | null {
  return config.get(key) ?? null;
}

// ✅ Array operations:
function findFirst<T>(arr: T[], pred: (t: T) => boolean): T | null {
  return arr.find(pred) ?? null;
}

// When Maybe<T> is worthwhile:

// ✅ When many chained optional operations:
const result = flatMapMaybe(
  flatMapMaybe(
    findUser('user-1'),
    user => getAddress(user.id)
  ),
  addr => getCity(addr.id)
);
// Vs. manually:
const user = findUser('user-1');
if (!user) { /* ... */ }
const addr = getAddress(user.id);
if (!addr) { /* ... */ }
const city = getCity(addr.id);
```

> 🔍 **Deeper knowledge: `undefined` vs `null` in TypeScript**
>
> TypeScript has both: `null` and `undefined`. Conventions:
> - `null`: Explicitly "no value" (intentionally set)
> - `undefined`: Not initialized, missing optional property
>
> For `Option<T>`, `null` is the better choice: it semantically means
> "no value" (an explicit state). `undefined` signals more
> "not present" (implicit state, e.g. optional object properties).
>
> TypeScript's `Array.prototype.find()` returns `undefined`, not `null`.
> That's historical (JavaScript compatibility), not ideal.
> Therefore: `arr.find(pred) ?? null` to normalize to `Option<T>`.

---

## Option in Angular services

```typescript
// Typical Angular pattern:
@Injectable({ providedIn: 'root' })
class CacheService {
  private cache = new Map<string, unknown>();

  // Optional chaining + null makes Option elegant:
  get<T>(key: string): T | null {
    return (this.cache.get(key) as T) ?? null;
  }

  // In the component:
  ngOnInit(): void {
    const cachedUser = this.cache.get<User>('current-user');

    if (cachedUser) {
      // cachedUser is User here (not null) — TypeScript knows this!
      this.name = cachedUser.name;
    } else {
      // No cache hit — load from API
      this.loadUser();
    }
  }
}
```

---

## What you've learned

- `Option<T>` = `T | null` — "maybe a value", not an error
- `Maybe<T>` (Some/None) enables elegant chaining without manual null checks
- **Difference**: Option = normal absence | Result = error with cause | null = simple edge case
- `strictNullChecks` turns TypeScript into a native Option system — without extra framework
- Pragmatically: `T | null` for simple cases, `Maybe<T>` for many chained optional operations

> 🧠 **Explain to yourself:** A function `findUser(id): User | null` — is
> this the Result or Option pattern? What does `null` mean here?
>
> **Key points:** Option — not-found is NORMAL | Result would communicate an error |
> null here = "user does not exist in the DB" — perfectly fine, not an error |
> Result would be over-engineering for this case

**Core concept to remember:** `Option/null` for optional data. `Result` for operations
that can fail. Never confuse the two.

---

> **Pause point** -- Option vs Result — you know the difference.
>
> Continue with: [Section 04: Exhaustive Error Handling](./04-exhaustive-error-handling.md)