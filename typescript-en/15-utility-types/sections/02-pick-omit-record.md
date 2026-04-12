# Section 2: Pick, Omit, Record

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Partial, Required, Readonly](./01-partial-required-readonly.md)
> Next section: [03 - Extract, Exclude, NonNullable](./03-extract-exclude-nonnullable.md)

---

## What you'll learn here

- **Pick\<T, K\>** — Select specific properties
- **Omit\<T, K\>** — Exclude specific properties
- Why Omit is **not type-safe** and how to fix it (StrictOmit)
- **Record\<K, V\>** — Creating type-safe dictionaries

---

## Pick\<T, K\> — Selecting properties

> **Analogy:** Pick is like a SQL SELECT — you choose **only the
> relevant columns** from a database table. Instead of `SELECT *`
> you say `SELECT id, name, email FROM users`.

`Pick<T, K>` creates a new type with only the specified properties:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Only the public fields:
type PublicUser = Pick<User, "id" | "name" | "email">;
// ^ { id: number; name: string; email: string }

// For login you only need:
type LoginCredentials = Pick<User, "email" | "password">;
// ^ { email: string; password: string }
```

### Why Pick instead of a new interface?

```typescript annotated
// BAD: Manual — gets out of sync when User changes
interface PublicUserManual {
  id: number;
  name: string;
  email: string;
}

// GOOD: Automatically derived — always in sync with User
type PublicUserAuto = Pick<User, "id" | "name" | "email">;
```

> **Pick is type-safe:** If you specify a key that doesn't exist in T,
> you get a compile error. `Pick<User, "phone">` would be an error.

> ⚡ **Practical tip: Pick for child components**
>
> ```typescript
> // React: A child doesn't need all props from the parent type
> type UserListItemProps = Pick<User, "id" | "name" | "email">;
> function UserListItem({ id, name, email }: UserListItemProps) { ... }
>
> // Angular: Reduce service response to what's necessary
> type UserSummary = Pick<FullUserResponse, "id" | "name" | "avatar">;
> ```

> 🧠 **Explain to yourself:** Why is `Pick<User, "id" | "name">` better than a new `interface UserSummary { id: number; name: string }`?
> **Key points:** Pick stays in sync with User | If the type of name changes in User, it automatically changes in Pick | Less maintenance | DRY principle

---

## Omit\<T, K\> — Excluding properties

> **Analogy:** Omit is like "copy everything except the password field" — you
> take the entire record and **redact** certain fields. Perfect for
> API responses where sensitive data needs to be removed.

`Omit<T, K>` is the opposite of Pick — it removes the specified properties:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Everything EXCEPT password:
type SafeUser = Omit<User, "password">;
// ^ { id: number; name: string; email: string; createdAt: Date }

// For creation — without id and createdAt (set by the server):
type CreateUserInput = Omit<User, "id" | "createdAt">;
// ^ { name: string; email: string; password: string }
```

### The Omit trap: No type safety on keys!

```typescript annotated
// CAUTION: Omit accepts ANY string — no error!
type Broken = Omit<User, "passwrod">;  // Typo! No error!
// ^ This is identical to User — "passwrod" doesn't exist,
//   so nothing gets removed.
```

> 📖 **Background: Why is Omit not type-safe?**
>
> Omit is defined as `Omit<T, K extends string | number | symbol>` —
> K only needs to be a property-key type, not necessarily a key of T.
> This was deliberately designed for flexibility (e.g. Omit with
> computed strings). But it's a common source of bugs.
>
> Interestingly, Omit wasn't added to the standard library until
> **TypeScript 3.5** (May 2019) — almost 3 years after Pick.
> Before that, developers had to build it themselves:
> `type Omit<T, K> = Pick<T, Exclude<keyof T, K>>`.
> The community had so many different Omit implementations
> that the TS team eventually standardized it.

> 💭 **Think about it:** `Omit<T, K>` does NOT check whether K is a valid key
> of T. Why is that a problem? What would the safe alternative look like?
>
> **Answer:** With a typo like `Omit<User, "passwrod">` (instead of
> "password") you get no error — it simply removes nothing.
> During refactoring (e.g. `password` becomes `passwordHash`) the old
> string stays without any warning. StrictOmit (`K extends keyof T`) prevents
> both.

### StrictOmit — The type-safe alternative

```typescript annotated
// Custom StrictOmit that only allows existing keys:
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
//                   ^^^^^^^^^^^^^^ K MUST be a key of T!

type SafeUser = StrictOmit<User, "password">;     // OK
// type Broken = StrictOmit<User, "passwrod">;     // Error! "passwrod" is not a key of User
```

> 💡 **Best practice:** Use StrictOmit in your projects as the default.
> It prevents typos and makes refactoring safer.

---

## Record\<K, V\> — Type-safe dictionaries

> **Analogy:** Record is like a **dictionary**: for every key (word)
> there is exactly one value (definition). When you write `Record<"de" | "en" | "fr", string>`,
> you're saying: "For each of these three languages there must be a string."

`Record<K, V>` creates a type with keys of type K and values of type V:

```typescript annotated
// Simple dictionary:
type UserMap = Record<string, User>;
// ^ { [key: string]: User }

// With specific keys (union literal):
type RolePermissions = Record<"admin" | "user" | "guest", string[]>;
// ^ {
//     admin: string[];
//     user: string[];
//     guest: string[];
//   }

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
  guest: ["read"],
};
```

### Record vs index signature

```typescript annotated
// Index signature — keys are arbitrary strings:
type MapA = { [key: string]: number };

// Record with string — equivalent:
type MapB = Record<string, number>;

// Record with union — MUCH more precise:
type StatusCodes = Record<"ok" | "error" | "loading", string>;
// ^ Exactly three keys — no more, no less!
```

### Record for lookup tables

```typescript annotated
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface MethodConfig {
  hasBody: boolean;
  idempotent: boolean;
}

const methodConfigs: Record<HttpMethod, MethodConfig> = {
  GET:    { hasBody: false, idempotent: true },
  POST:   { hasBody: true,  idempotent: false },
  PUT:    { hasBody: true,  idempotent: true },
  DELETE: { hasBody: false, idempotent: true },
};
// ^ Missing a key? Compile error!
// ^ Wrong key? Compile error!
```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
>
> interface MethodConfig { hasBody: boolean; idempotent: boolean; }
>
> const methodConfigs: Record<HttpMethod, MethodConfig> = {
>   GET:    { hasBody: false, idempotent: true },
>   POST:   { hasBody: true,  idempotent: false },
>   PUT:    { hasBody: true,  idempotent: true },
>   DELETE: { hasBody: false, idempotent: true },
> };
> ```
> Remove `DELETE` from the object. What does the compiler report? Then add `PATCH: { ... }`. How does `Record<HttpMethod, ...>` protect in both directions?

> 🧠 **Explain to yourself:** What is the difference between
> `Record<string, T>` and `Map<string, T>`?
> **Key points:** Record is a type alias for an object | Map is a runtime data structure | Record properties are directly accessible (.key) | Map requires .get()/.set() | Record is JSON-serializable

---

## Pick + Omit: Complementary tools

```typescript annotated
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

// Pick: "I want ONLY these fields"
type ProductSummary = Pick<Product, "id" | "name" | "price">;

// Omit: "I want EVERYTHING EXCEPT these fields"
type ProductPreview = Omit<Product, "stock" | "description">;

// Both yield the same result here!
// When to use which? Pick when you want few fields, Omit when you want to exclude few fields.
```

> 🔍 **Deeper knowledge: Pick and Omit internals**
>
> ```typescript annotated
> // Pick: Mapped type over the specified keys
> type Pick<T, K extends keyof T> = {
>   [P in K]: T[P];
> // ^ Only iterate over K (not keyof T!)
> };
>
> // Omit: Pick with the INVERTED keys
> type Omit<T, K extends string | number | symbol> =
>   Pick<T, Exclude<keyof T, K>>;
> // ^ Exclude filters K out of keyof T, Pick takes the rest
> ```
>
> This also shows why Pick is type-safe (`K extends keyof T`) and
> Omit is not (`K extends string | number | symbol`).

---

## What you've learned

- **Pick\<T, K\>** selects specific properties — type-safe
- **Omit\<T, K\>** excludes properties — NOT type-safe (accepts arbitrary strings)
- **StrictOmit** is the safe alternative: `type StrictOmit<T, K extends keyof T> = Omit<T, K>`
- **Record\<K, V\>** creates type-safe dictionaries with defined keys

> 🧠 **Explain to yourself:** Why should you prefer StrictOmit over standard Omit?
> **Key points:** Omit accepts arbitrary strings | Typos go undetected | StrictOmit enforces existing keys | Refactoring safety

**Core concept to remember:** Pick and Omit are like SELECT and EXCEPT in SQL — they choose columns (properties) from a table (type).

> **Experiment:** Test in the TypeScript Playground:
> ```typescript
> interface User { id: number; name: string; password: string; }
> type StrictOmit<T, K extends keyof T> = Omit<T, K>;
>
> type A = Omit<User, "passwrod">;       // Typo — no error!
> type B = StrictOmit<User, "passwrod">; // Error! "passwrod" is not a key
> ```
> Why does standard `Omit` report no error on the typo?

---

> **Pause point** — You now know the most important object transformations.
>
> Continue with: [Section 03: Extract, Exclude, NonNullable](./03-extract-exclude-nonnullable.md)