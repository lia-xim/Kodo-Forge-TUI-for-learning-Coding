# Section 4: ReturnType, Parameters, Awaited

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Extract, Exclude, NonNullable](./03-extract-exclude-nonnullable.md)
> Next section: [05 - Custom Utility Types](./05-eigene-utility-types.md)

---

## What you'll learn here

- **ReturnType\<T\>** — extracting the return type of a function
- **Parameters\<T\>** — extracting parameter types as a tuple
- **ConstructorParameters\<T\>** — extracting constructor parameters
- **InstanceType\<T\>** — extracting the instance type of a class
- **Awaited\<T\>** — recursively unwrapping Promise types

---

## ReturnType\<T\> — What does the function return?

> 📖 **Background: Using type inference in reverse**
>
> ReturnType, Parameters and similar utilities leverage a powerful feature of
> Conditional Types: the **`infer` keyword** (introduced in TS 2.8).
> `infer` lets TypeScript **pull a type out of a structure**.
> Internally, ReturnType looks like this:
>
> ```typescript
> type ReturnType<T extends (...args: any) => any> =
>   T extends (...args: any) => infer R ? R : any;
> //                            ^^^^^^^ "If T is a function,
> //                                      name the return type R
> //                                      and return R"
> ```
>
> The `infer` keyword is like a variable in a pattern match:
> TypeScript fills in the matching type and hands it back to you.

`ReturnType<T>` extracts the return type of a function:

```typescript annotated
function createUser(name: string, email: string) {
  return { id: Math.random(), name, email, createdAt: new Date() };
}

// Instead of defining the return type manually:
type User = ReturnType<typeof createUser>;
// ^ { id: number; name: string; email: string; createdAt: Date }
```

### Why typeof is necessary

```typescript annotated
// ReturnType expects a FUNCTION TYPE, not the function name:
type Result = ReturnType<typeof createUser>;  // OK — typeof yields the type
// type Wrong = ReturnType<createUser>;       // Error! createUser is a value

// With type definitions directly:
type Formatter = (input: string) => { formatted: string; length: number };
type FormatterResult = ReturnType<Formatter>;
// ^ { formatted: string; length: number }
// No typeof needed — Formatter IS already a type
```

> 🧠 **Explain it to yourself:** Why is it better to derive the return type with `ReturnType<typeof fn>` instead of defining it manually?
> **Key points:** Single source of truth | If the function changes, the type updates automatically | No risk of the type and implementation diverging | Less code to maintain

### Practical use: Deriving API response types

```typescript annotated
// The API functions implicitly define their return types:
function fetchUsers() {
  return [
    { id: 1, name: "Anna", role: "admin" as const },
    { id: 2, name: "Ben", role: "user" as const },
  ];
}

function fetchProduct(id: number) {
  return { id, name: "Widget", price: 9.99, inStock: true };
}

// Derive types instead of defining them manually:
type UsersResponse = ReturnType<typeof fetchUsers>;
// ^ { id: number; name: string; role: "admin" | "user" }[]

type ProductResponse = ReturnType<typeof fetchProduct>;
// ^ { id: number; name: string; price: number; inStock: boolean }
```

---

## Parameters\<T\> — What does the function expect?

`Parameters<T>` extracts the parameters as a tuple:

```typescript annotated
function sendEmail(to: string, subject: string, body: string, urgent?: boolean) {
  console.log(`Sending to ${to}: ${subject}`);
}

type EmailParams = Parameters<typeof sendEmail>;
// ^ [to: string, subject: string, body: string, urgent?: boolean]

// Extracting individual parameters:
type Recipient = Parameters<typeof sendEmail>[0];  // string
type Subject = Parameters<typeof sendEmail>[1];     // string
```

### Pattern: Wrapper functions with identical parameters

```typescript annotated
function originalFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, options);
}

// Wrapper with identical parameters:
function loggingFetch(...args: Parameters<typeof originalFetch>): Promise<Response> {
  console.log(`Fetching: ${args[0]}`);
  return originalFetch(...args);
}
```

> 🧠 **Explain it to yourself:** Why does Parameters return a tuple
> and not an object with named properties?
> **Key points:** Function parameters have an order | Tuples preserve order and length | Optional parameters become optional tuple elements | Spread syntax works with tuples

> ⚡ **Practical tip: ReturnType in Angular and React**
>
> ```typescript
> // Angular: Deriving service method return types
> class UserService {
>   getUser(id: number) {
>     return this.http.get<{ id: number; name: string }>(`/api/users/${id}`);
>   }
> }
> type UserObservable = ReturnType<UserService['getUser']>;
> // Observable<{ id: number; name: string }>
>
> // React: Deriving custom hook return types
> function useAuth() {
>   return { user: null as User | null, login: async () => {}, logout: () => {} };
> }
> type AuthContext = ReturnType<typeof useAuth>;
> // { user: User | null; login: () => Promise<void>; logout: () => void }
> ```

---

## ConstructorParameters\<T\> and InstanceType\<T\>

For classes there are specialized variants:

```typescript annotated
class DatabaseConnection {
  constructor(
    public host: string,
    public port: number,
    public database: string,
  ) {}

  query(sql: string) {
    return `Executing on ${this.host}: ${sql}`;
  }
}

// Constructor parameters:
type DBParams = ConstructorParameters<typeof DatabaseConnection>;
// ^ [host: string, port: number, database: string]

// Instance type:
type DBInstance = InstanceType<typeof DatabaseConnection>;
// ^ DatabaseConnection

// Useful for factory functions:
function createConnection(...args: ConstructorParameters<typeof DatabaseConnection>) {
  return new DatabaseConnection(...args);
}
```

---

## Awaited\<T\> — Unwrapping Promises

`Awaited<T>` unwraps the inner type of a Promise — even **recursively**:

```typescript annotated
type A = Awaited<Promise<string>>;
// ^ string

type B = Awaited<Promise<Promise<number>>>;
// ^ number (recursively unwrapped!)

type C = Awaited<string>;
// ^ string (not a Promise? Stays unchanged)

type D = Awaited<Promise<string | number>>;
// ^ string | number
```

> **Analogy:** Awaited is like opening a Russian nesting doll —
> no matter how many layers (`Promise<Promise<Promise<string>>>`) are
> inside, Awaited unpacks them ALL and gives you the innermost value.

### Before Awaited: Manual unwrapping was tedious

```typescript annotated
// TypeScript < 4.5: You had to unwrap manually
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// Problem: Nested Promises!
type Nested = UnwrapPromise<Promise<Promise<string>>>;
// ^ Promise<string> — only ONE level unwrapped!

// Awaited solves this elegantly:
type DeepUnwrap = Awaited<Promise<Promise<Promise<string>>>>;
// ^ string — ALL levels unwrapped!
```

### Practical use: Async function return types

```typescript annotated
async function fetchUserData(id: number) {
  // Simulates async API call
  return { id, name: "Max", lastLogin: new Date() };
}

// ReturnType returns Promise<...>:
type AsyncResult = ReturnType<typeof fetchUserData>;
// ^ Promise<{ id: number; name: string; lastLogin: Date }>

// Awaited unwraps the Promise:
type UserData = Awaited<ReturnType<typeof fetchUserData>>;
// ^ { id: number; name: string; lastLogin: Date }
```

> 📖 **Background: Why was Awaited introduced?**
>
> Before TypeScript 4.5 (November 2021), unwrapping Promises was
> a common pain point. Everyone wrote their own `UnwrapPromise`
> helper, and nested Promises were a nightmare.
> Awaited standardized this and correctly handles edge cases like
> `PromiseLike` and thenable objects.
>
> The decisive motivation came from `Promise.all()`: its return type
> was extremely difficult to type correctly, because it needs to turn
> a tuple of Promises into a Promise of a tuple. With Awaited, the
> implementation of `Promise.all`, `Promise.race`, and `Promise.allSettled`
> became significantly simpler and more correct.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> type Test = Awaited<Promise<Promise<Promise<string>>>>;
> // Hover over Test — how many layers are unwrapped?
>
> type Manual = Promise<Promise<Promise<string>>> extends Promise<infer U> ? U : never;
> // Hover over Manual — how many layers does the manual pattern unwrap?
> ```
> What is the difference between `Awaited` (recursive) and the manual `infer` pattern (only one level)?

---

## Combining: ReturnType + Awaited

The pattern `Awaited<ReturnType<typeof fn>>` is extremely common:

```typescript annotated
// Multiple async functions:
async function getUser(id: number) {
  return { id, name: "Anna", email: "anna@example.com" };
}

async function getProducts() {
  return [
    { id: 1, name: "Widget", price: 9.99 },
    { id: 2, name: "Gadget", price: 19.99 },
  ];
}

// The "true" return types (without the Promise wrapper):
type User = Awaited<ReturnType<typeof getUser>>;
// ^ { id: number; name: string; email: string }

type Products = Awaited<ReturnType<typeof getProducts>>;
// ^ { id: number; name: string; price: number }[]
```

> 💭 **Think about it:** What happens with `Awaited<ReturnType<typeof Math.random>>`?
>
> **Answer:** `ReturnType<typeof Math.random>` is `number`. `Awaited<number>`
> is `number`. Awaited leaves non-Promises unchanged.

---

## What you've learned

- **ReturnType\<T\>** extracts the return type — use `typeof` with function values
- **Parameters\<T\>** gives the parameters as a tuple — for wrapper functions
- **ConstructorParameters/InstanceType** are the class variants
- **Awaited\<T\>** unwraps Promises recursively — since TypeScript 4.5
- **Awaited\<ReturnType\<typeof fn\>\>** is THE pattern for async functions

> 🧠 **Explain it to yourself:** Why do you need `typeof` in `ReturnType<typeof myFunc>` but not in `ReturnType<(x: string) => number>`?
> **Key points:** typeof extracts the type from a value | myFunc is a value (function) | (x: string) => number is already a type | Type parameters expect types, not values

**Core concept to remember:** ReturnType and Parameters extract information from function types. Awaited unwraps Promises. Together they form the toolkit for "I want the type that this function returns".

> **Experiment:** Test in the TypeScript Playground:
> ```typescript
> async function getData() { return { id: 1, name: "Max" }; }
>
> type WithPromise = ReturnType<typeof getData>;
> // ^ Promise<{ id: number; name: string }>
>
> type WithoutPromise = Awaited<ReturnType<typeof getData>>;
> // ^ { id: number; name: string }
> ```
> The pattern `Awaited<ReturnType<typeof fn>>` is very common in real-world projects.

---

> **Break point** — Starting with the next section, you'll build your own utility types!
>
> Continue with: [Section 05: Custom Utility Types](./05-eigene-utility-types.md)