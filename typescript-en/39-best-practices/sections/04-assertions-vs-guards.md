# Section 4: Type Assertions vs Type Guards — When to Use What

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Avoiding Overengineering](./03-overengineering-vermeiden.md)
> Next section: [05 - Defensive vs Offensive Typing](./05-defensive-vs-offensive-typing.md)

---

## What you'll learn here

- The **fundamental difference** between assertions (Trust me) and guards (Prove it)
- When **Type Assertions** (`as`) are the only solution
- How to write **Custom Type Guards** (`is`, `asserts`) correctly
- The **decision matrix** for everyday work

---

## Trust me vs Prove it

This is the most important distinction in TypeScript. It determines
whether your code is safe at runtime or not.

```typescript annotated
// Type Assertion = "Trust me, Compiler"
const user = JSON.parse(data) as User;
// ^ You CLAIM it is a User
// ^ The compiler does NOT check whether that's true
// ^ If it isn't a User: Runtime crash

// Type Guard = "Prove it, Compiler"
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as any).name === "string"
  );
}
if (isUser(JSON.parse(data))) {
  // Here it is PROVEN to be a User
}
```

> 📖 **Background: The cost of "Trust me"**
>
> Microsoft's incident analysis for Azure shows that approximately 8% of all
> production bugs can be traced back to incorrect type assertions.
> The typical case: an API changes its response format, but the
> frontend code has `as OldFormat` and doesn't notice the change.
> In JavaScript the bug would be immediately visible (undefined access).
> In TypeScript with `as` it gets hidden — the compiler shows
> no warning, and the bug only surfaces in production.

This is how it happens in real projects: a backend team renames a
field from `user_name` to `username`. The frontend has
`response as User` — no compile error, because `as` doesn't check.
`user.username` is `undefined`, `user.user_name` exists. Three
days later a user reports that their name is displayed as "undefined"
everywhere. Had the frontend used `isUser(response)`, the
type guard would have thrown the error immediately: "Expected username:
string, got undefined."

---

## Type Assertions: When they are acceptable

### Case 1: The compiler doesn't know, but you do

```typescript annotated
// DOM access — the compiler doesn't know the HTML:
const input = document.getElementById("email") as HTMLInputElement;
// ^ Acceptable: you know that #email is an <input>
// ^ But better with a null check:
const input = document.getElementById("email");
if (input instanceof HTMLInputElement) {
  input.value = "test";  // Safe!
}
```

### Case 2: Test code

```typescript annotated
// In tests you often need partial mocks:
const mockUser = { name: "Test" } as User;
// ^ Acceptable in tests — the test SHOULD fail if User changes
// ^ In production code: NOT acceptable
```

### Case 3: Type system gaps (very rare)

```typescript annotated
// Array.filter with type guard:
const items: (string | null)[] = ["a", null, "b"];
const strings = items.filter((x): x is string => x !== null);
// ^ Since TS 5.5 the compiler infers this automatically!
// ^ Before TS 5.5 you needed: items.filter(Boolean) as string[]
```

---

## Type Guards: The safe alternatives

### Built-in Type Guards

```typescript annotated
// typeof — for primitives:
if (typeof value === "string") { /* value: string */ }
if (typeof value === "number") { /* value: number */ }

// instanceof — for classes:
if (value instanceof Date) { /* value: Date */ }
if (value instanceof Error) { /* value: Error */ }

// in — for property existence:
if ("name" in value) { /* value: { name: unknown; ... } */ }

// Truthiness — for null/undefined:
if (value) { /* value: without null/undefined */ }
if (value != null) { /* value: without null and undefined */ }
```

### Custom Type Guards (`is`)

```typescript annotated
// For complex types — the PROOF lives in the function:
interface ApiError {
  code: number;
  message: string;
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof (value as Record<string, unknown>).code === "number" &&
    "message" in value &&
    typeof (value as Record<string, unknown>).message === "string"
  );
}

// Usage:
try {
  await fetchUser(id);
} catch (err) {
  if (isApiError(err)) {
    console.log(`API Error ${err.code}: ${err.message}`);
    // ^ Type-safe! err is ApiError
  }
}
```

### Assertion Functions (`asserts`)

```typescript annotated
// Assertion functions throw when the condition is NOT met:
function assertUser(data: unknown): asserts data is User {
  if (typeof data !== "object" || data === null) {
    throw new Error("Expected object");
  }
  if (!("name" in data) || typeof (data as any).name !== "string") {
    throw new Error("Expected name: string, got " + typeof (data as any).name);
    // ^ Good error messages are crucial — show WHAT was expected and WHAT came
  }
}

// Usage — after this, data is: User (no if needed):
const data: unknown = JSON.parse(raw);
assertUser(data);
data.name;  // TypeScript knows: data is User
```

**When `is` vs `asserts`?**

```typescript annotated
// is: Optional — "Could be a User, check it"
function isUser(v: unknown): v is User { /* ... */ }

if (isUser(response)) {
  // User-specific path
} else {
  // Non-user path
}

// asserts: Enforced — "MUST be a User, otherwise throw"
function assertUser(v: unknown): asserts v is User { /* ... or throw */ }

// Good for initialization code where wrong data is a fatal error:
const config: unknown = loadConfig();
assertUser(config);  // Throws if config is not a User
// From here: config is User — no if needed
setupApp(config);
```

> 🧠 **Explain to yourself:** What is the difference between
> `value is User` and `asserts value is User`? When would you
> use which?
> **Key points:** `is` returns boolean — for if/else |
> `asserts` throws on failure — for "fail fast" | `is` is for
> optional narrowing, `asserts` for enforced narrowing |
> `asserts` needs no if — the type applies after the call |
> In Angular: `asserts` in resolver/guard code, `is` in template logic

---

## The Decision Matrix

| Situation | Method | Example |
|-----------|--------|---------|
| External input (API, JSON) | Custom Type Guard (`is`) | `isUser(data)` |
| Enforced validation | Assertion Function (`asserts`) | `assertUser(data)` |
| Primitive type check | `typeof` | `typeof x === "string"` |
| Class instance | `instanceof` | `x instanceof Date` |
| Property existence | `in` operator | `"name" in x` |
| DOM elements | `instanceof` + null check | `input instanceof HTMLInputElement` |
| Test mocks | `as` (in tests only!) | `{} as User` |
| Type system boundary | `as` (with comment) | `x as unknown as Y` |
| Discriminated unions | Switch on discriminator | `switch(x.kind)` |

> ⚡ **Angular connection:** Angular's template syntax has built-in
> narrowing: `@if (user) { user.name }`. But for complex types
> this isn't enough — an `@if (isUser(data))` in templates is
> poor code. Better: encapsulate type guards in services and only
> supply the component with already-validated types.
>
> In Angular resolvers `asserts` is particularly useful:
> ```typescript
> // Route resolver with assertion:
> resolve(): User {
>   const data = this.api.getUser();
>   assertUser(data);  // Throws if backend is broken
>   return data;       // Type: User — guaranteed
> }
> ```
>
> In React with `useEffect` and fetch:
> ```typescript
> useEffect(() => {
>   fetch("/api/user")
>     .then(r => r.json())
>     .then((data: unknown) => {
>       if (isUser(data)) setUser(data);  // is-guard for optional handling
>       else console.error("Unexpected data:", data);
>     });
> }, []);
> ```

> 💭 **Think about it:** A colleague argues: "Type guards are
> runtime overhead — with `as` the code is faster." What do you say?
>
> **Answer:** The overhead is minimal (a few typeof checks).
> The compiler removes the type annotations, but the runtime
> checks remain — and that is GOOD. They catch errors that
> would otherwise cause crashes. A typeof check costs
> nanoseconds. A production bug costs hours.

---

## Experiment: Building a Type Guard Library

Build a small collection of reusable type guards. The core pattern:
one "is" function and one "assert" function per type:

```typescript
// guards.ts — Reusable Type Guards

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function assertString(value: unknown): asserts value is string {
  if (!isString(value)) throw new TypeError(`Expected string, got ${typeof value}`);
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

// Task 1: Build isArrayOf<T>
// function isArrayOf<T>(arr: unknown, guard: (v: unknown) => v is T): arr is T[]
// Test: isArrayOf(["a", "b"], isString) → true
// Test: isArrayOf(["a", 1], isString) → false (1 is not a string)

// Task 2: Build hasProperties (check multiple properties at once)
// function hasProperties<K extends string>(obj: unknown, ...keys: K[]): obj is Record<K, unknown>
// Test: hasProperties(data, "name", "email", "age") → data is { name: unknown; email: unknown; age: unknown }

// Task 3: Combine both into a User guard:
interface User { name: string; email: string; age: number; }

function isUser(data: unknown): data is User {
  return (
    hasProperties(data, "name", "email", "age") &&
    isString(data.name) &&
    isString(data.email) &&
    isNumber(data.age)
  );
}
// This guard is now compositional — it builds on primitive guards.
// If User changes, only the isUser guard changes, not the primitives.
```

---

## What you've learned

- **Type Assertions** (`as`) = "Trust me" — no runtime check, unsafe with external data
- API field rename + `as` = silent bug that only surfaces in production
- **Type Guards** = "Prove it" — runtime check, safe
- `as` is acceptable in **tests**, for **DOM access**, and at **type system boundaries**
- **Custom Type Guards** (`is`) for optional narrowing, **Assertion Functions** (`asserts`) for enforced narrowing
- The **decision matrix** provides the right method for every situation
- Type guards are compositional: primitive guards build complex guards
- In Angular: `asserts` in resolvers, `is` in template logic; always encapsulate guards in services

> 🧠 **Explain to yourself:** Why are type guards "more expensive" than
> assertions (runtime overhead), yet still the better choice
> for production code?
> **Key points:** Type guards are runtime checks — they cost
> CPU time | But: they catch errors that would otherwise be crashes |
> A typeof check: ~1ns | A production bug: hours/days |
> Assertions just shift the error — guards prevent it |
> A typeof check costs less than the coffee break a
> production debugging session demands

**Core concept to remember:** Type assertions are a contract you make with the compiler. Type guards are proof you deliver to the compiler. Contracts can be broken — proofs cannot. And when the backend changes its data, having proof through guards is invaluably worthwhile.

---

> **Pause point** — Assertions vs guards understood. Next
> step: the two schools of thought in typing.
>
> Continue with: [Section 05: Defensive vs Offensive Typing](./05-defensive-vs-offensive-typing.md)