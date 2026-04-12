# Section 3: Building Custom Utility Types

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Key Remapping](./02-key-remapping.md)
> Next section: [04 - Conditional Mapped Types](./04-bedingte-mapped-types.md)

---

## What you'll learn here

- Creating custom utility types with mapped types
- Implementing `Mutable<T>`, `Nullable<T>`, `DeepReadonly<T>`
- Extracting `RequiredKeys` and `OptionalKeys`
- When custom utility types make sense

---

## Why custom utility types?

> 📖 **Background: The gaps in the standard library**
>
> TypeScript deliberately ships only ~20 utility types in its standard library.
> The philosophy behind this: provide **building blocks**, not ready-made solutions.
> Mapped types + conditional types + `infer` are powerful enough that
> developers can build almost any type they need themselves.
>
> The community library **`type-fest`** (by Sindre Sorhus) fills
> this gap with over 200 utility types. Other popular libraries
> are `ts-toolbelt` and `utility-types`. In large projects you often
> find a project-specific `types/utils.ts` with custom utility types.

TypeScript has ~20 built-in utility types. For many projects,
that's not enough. Common needs:

- `Mutable<T>` — remove readonly (opposite of Readonly)
- `Nullable<T>` — every property can also be null
- `DeepPartial<T>` — recursively make everything optional
- `RequiredKeys<T>` — extract only the required keys

---

## `Mutable<T>` — Undoing readonly

> **Analogy:** If `Readonly<T>` is locking a document
> inside a display case, then `Mutable<T>` is **opening the case** —
> the document becomes editable again.

```typescript annotated
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
// ^^^^^^^^^ The minus sign REMOVES the readonly modifier
};

interface FrozenConfig {
  readonly host: string;
  readonly port: number;
}

type EditableConfig = Mutable<FrozenConfig>;
// { host: string; port: number; }
// readonly is gone!
```

> 🧠 **Explain to yourself:** When do you need `Mutable<T>` in practice? Isn't it dangerous to remove readonly?
> **Key points:** Tests often need writable versions of readonly state | Builder pattern: build mutably first, then freeze as readonly | Library code returns readonly, but internally you need mutable | A deliberate decision, hence not a built-in

---

## `Nullable<T>` — Every property can be null

```typescript annotated
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
//                      ^^^^^^ Union with null: the original type OR null
};

interface FormData {
  name: string;
  age: number;
}

type NullableForm = Nullable<FormData>;
// { name: string | null; age: number | null; }
```

> 💭 **Think about it:** What is the difference between `Nullable<T>`
> (every property can be null) and `Partial<T>` (every property can
> be absent)? When would you use which?
>
> **Answer:** `Partial<T>` makes properties optional (`?`) — the key
> can be completely absent or `undefined`. `Nullable<T>` keeps the
> key as a required field but allows `null` as a value. In APIs and
> databases the distinction matters: a missing field ("not sent") is
> different from a field explicitly set to null ("deliberately cleared").
> JSON distinguishes between the two!

---

## `DeepReadonly<T>` — Recursively readonly

```typescript annotated
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
// ^^^^^^^^ readonly at this level
    ? T[K] extends Function
      ? T[K]                    // Don't wrap functions (keep them callable)
      : DeepReadonly<T[K]>      // Objects: RECURSION — go one level deeper
    : T[K];                     // Primitives: base case (number, string, etc.)
};

interface Config {
  db: {
    host: string;
    credentials: {
      user: string;
      pass: string;
    };
  };
  port: number;
}

type FrozenConfig = DeepReadonly<Config>;
// All levels are readonly — including db.credentials.user!
```

> **Note:** Without the Function check, methods would also be
> "wrapped" — which is usually not what you want.

> ⚡ **Practical tip: DeepReadonly in state management**
>
> ```typescript
> // Angular NgRx: Store state should ALWAYS be immutable
> // DeepReadonly ensures that even nested objects
> // are not accidentally mutated:
> type AppState = DeepReadonly<{
>   auth: { user: { name: string; roles: string[] } | null };
>   ui: { theme: 'light' | 'dark'; sidebar: { collapsed: boolean } };
> }>;
>
> // React Redux: Same benefit — prevents direct state mutation
> // Especially important with useSelector, where it's easy to forget
> // that the state must not be mutated.
> ```

> 🔬 **Experiment:** Test `DeepReadonly` with a type that contains a `Date`.
> What happens to the Date methods like `.setTime()`?
> Hint: `Date` is an object but not a Function — so it gets treated
> recursively. Is that always the desired behavior?

---

## `RequiredKeys<T>` and `OptionalKeys<T>`

```typescript annotated
// Extract only the required keys
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
// ^ iteration    ^ -? prevents K itself from becoming optional
//                  ^ {} extends Pick<T, K>: Can an empty object be assigned?
//                    ^ If yes: K is optional → never (filter out)
//                               ^ If no: K is required → keep
}[keyof T];
// ^^^^^^^^ Index access: collect all values as a union (never disappears)

// Extract only the optional keys
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface User {
  id: number;
  name: string;
  nickname?: string;
  bio?: string;
}

type Required = RequiredKeys<User>;  // 'id' | 'name'
type Optional = OptionalKeys<User>;  // 'nickname' | 'bio'
```

> 🔍 **Deeper knowledge: The `{} extends Pick<T, K>` trick**
>
> How do you tell whether a property is optional? The trick uses
> **assignability**: if K is optional, an empty object `{}`
> can be assigned to `Pick<T, K>` — because K is allowed to be absent. If K is
> required, `{}` CANNOT be assigned (because K must be present).
> We use this asymmetry as a test.
>
> ```typescript
> // Example:
> {} extends { name: string } ? "optional" : "required"  // "required"
> {} extends { bio?: string } ? "optional" : "required"  // "optional"
> ```

---

## Composing utility types

You can combine custom utility types — that is their true power:

```typescript annotated
// Make certain keys optional, the rest stays required
type PartialBy<T, K extends keyof T> =
  Omit<T, K> & Partial<Pick<T, K>>;
// ^ rest without K  ^ K gets made optional
// The intersection merges both halves

// Make certain keys required, the rest stays optional
type RequiredBy<T, K extends keyof T> =
  Omit<T, K> & Required<Pick<T, K>>;

interface User {
  id: number;
  name: string;
  email?: string;
  bio?: string;
}

type UserDraft = PartialBy<User, 'id'>;
// { name: string; email?: string; bio?: string; id?: number; }
```

> 🧠 **Explain to yourself:** Why does `PartialBy` need an intersection (`&`) instead of a single mapped type? Could this be solved more elegantly?
> **Key points:** A mapped type applies the same modifier to ALL keys | We need different behavior for different key groups | Omit takes the "rest", Partial+Pick handles the selective part | The intersection unites both | With key remapping (section 4) there would be an alternative

---

## When to build custom utility types

| Situation | Solution |
|-----------|---------|
| A type appears in 3+ files | → Extract a custom utility type |
| Complex Pick+Omit+Partial combination | → Named utility type |
| Recursive transformation needed | → DeepPartial, DeepReadonly, etc. |
| Built-in utility types are not enough | → Build your own |

---

## What you've learned

- **`Mutable<T>`** removes readonly with `-readonly` — the opposite of Readonly
- **`Nullable<T>`** adds `| null` to every property type
- **`DeepReadonly<T>`** uses recursion for deep immutability
- **`RequiredKeys`/`OptionalKeys`** extract key names with the `{} extends Pick<T, K>` trick
- **`PartialBy`/`RequiredBy`** combine Omit + Partial/Required for selective transformations

> 🧠 **Explain to yourself:** What is the common pattern behind all the
> custom utility types you've seen here?
> **Key points:** Mapped type as the foundation | Conditional type for branching | Recursion for nested objects | Index access `[keyof T]` for key extraction | These four building blocks cover almost everything

**Core concept to remember:** The built-in utility types are just the tip of the iceberg. With mapped types + conditional types + recursion you can build any type transformer you want.

> 🔬 **Experiment:** Build a `DeepNullable<T>` — the recursive
> counterpart to `Nullable<T>`. Test it with a nested object and check:
> are the deeply nested properties also made nullable?

---

> **Pause point** — You can now create custom utility types that go
> beyond the built-ins. From here on, you'll be combining mapped types
> with conditional types.
>
> Continue with: [Section 04 - Conditional Mapped Types](./04-bedingte-mapped-types.md)