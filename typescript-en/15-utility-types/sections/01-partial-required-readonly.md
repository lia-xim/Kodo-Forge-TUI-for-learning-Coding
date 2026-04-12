# Section 1: Partial, Required, Readonly

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Pick, Omit, Record](./02-pick-omit-record.md)

---

## What you'll learn here

- Why Utility Types exist and what problem they solve
- **Partial\<T\>** — making all properties optional
- **Required\<T\>** — making all properties mandatory
- **Readonly\<T\>** — making all properties immutable
- When each modifier type is the right choice

---

## The Problem: Type Duplication

> 📖 **Background: The Birth of Utility Types**
>
> Utility Types are internally based on **Mapped Types**, which Anders Hejlsberg
> introduced in TypeScript 2.1 (December 2016). The idea came from
> functional programming — specifically from Haskell's **Functor concept**:
> A functor is something that preserves a structure while transforming its content.
> `Array.map()` transforms values inside an array,
> Mapped Types transform **types** inside an object type.
>
> Hejlsberg demonstrated them live at TSConf, showing how you can define
> `Partial<T>`, `Readonly<T>`, and `Pick<T, K>` in just a few lines.
> The audience was impressed — previously you had to write a completely
> new interface for every variant of a type.
> The first Utility Types (`Partial`, `Readonly`, `Record`, `Pick`)
> were included directly in the standard library with TS 2.1.

In lessons 13–14 you learned how generics make types parametric.
Utility Types go a step further: they **transform** existing types.

Imagine you have a User interface:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}
```

For an update function you need a type where all fields are
optional. Without Utility Types you'd have to duplicate the entire type:

```typescript annotated
// BAD: Duplication — if User changes, this has to change too!
interface UserUpdate {
  id?: number;
  name?: string;
  email?: string;
  role?: "admin" | "user";
}
```

> **This is the core problem:** Type duplication leads to inconsistencies.
> Utility Types solve this by DERIVING new types from existing ones.

> 🧠 **Explain it to yourself:** What is the risk of maintaining `UserUpdate` as a separate interface instead of deriving it from `User`? What happens during a `User` refactor?
> **Key points:** Manual interfaces fall out of sync | Fields get changed in User but forgotten in UserUpdate | Bugs only visible at runtime | Utility Types keep everything in sync automatically

---

## Partial\<T\> — Everything Optional

> **Analogy:** Partial is like a change-of-address form at the registry office —
> you fill in **only the fields that are changing**. You don't have to re-enter
> your full name, place of birth, and everything else
> just because you're updating your address.

`Partial<T>` makes **all** properties of a type optional:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

type UserUpdate = Partial<User>;
// ^ Equivalent to:
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   role?: "admin" | "user";
// }

function updateUser(id: number, changes: Partial<User>): User {
  const existing: User = { id, name: "Max", email: "max@example.com", role: "user" };
  return { ...existing, ...changes };
}

// Only send the fields that are changing:
updateUser(1, { name: "Maximilian" });           // OK
updateUser(1, { email: "new@mail.com" });         // OK
updateUser(1, { name: "Max", role: "admin" });    // OK
updateUser(1, {});                                // Also OK — change nothing
```

> 🧠 **Explain it to yourself:** Why do you need `Partial<T>` for update functions? What happens if you keep all properties required?
> **Key points:** Not all fields change at once | Without Partial you'd have to pass ALL fields | DRY principle | The caller has to supply data they don't even want to change

> ⚡ **Practical tip: Partial in Angular and React**
>
> ```typescript
> // Angular: Partial for optional component inputs
> @Component({ selector: 'user-card' })
> class UserCardComponent {
>   @Input() config: Partial<UserCardConfig> = {};
>   // Not all config fields need to be set
> }
>
> // React: Partial for defaultProps / optional props
> interface ButtonProps {
>   label: string;
>   variant: 'primary' | 'secondary';
>   size: 'sm' | 'md' | 'lg';
> }
> function Button(props: { label: string } & Partial<Omit<ButtonProps, 'label'>>) {
>   const { variant = 'primary', size = 'md' } = props;
>   // ...
> }
> ```

### How does Partial work internally?

```typescript annotated
// The built-in definition of Partial:
type Partial<T> = {
// ^ Generic type: takes any type T as input
  [P in keyof T]?: T[P];
// ^ Mapped Type: iterates over all keys of T
//               ^ ? makes each property optional (that's the whole trick!)
//                    ^ T[P] preserves the original type (Indexed Access)
};
```

> 📖 **Background: Mapped Types as a Foundation**
>
> All Utility Types are internally implemented with Mapped Types — a
> feature we'll cover in detail in a later lesson. For
> now it's enough to know: `[P in keyof T]` iterates over all
> property keys of T, similar to a `for...in` loop.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> interface User {
>   id: number;
>   name: string;
>   email: string;
>   role: "admin" | "user";
> }
>
> type A = Partial<User>;
> type B = Required<Partial<User>>;
> type C = Readonly<Partial<User>>;
> ```
> Hover over `A`, `B`, and `C`. Do `Required<Partial<...>>` cancel each other out? What changes with `Readonly<Partial<...>>`?

---

## Required\<T\> — Everything Mandatory

> **Analogy:** Required is like a pre-flight checklist — ALL
> items must be checked off before you can depart. No "optional",
> no "later". Everything must be present.

`Required<T>` is the **opposite** of Partial — it makes all optional
properties mandatory:

```typescript annotated
interface FormInput {
  username: string;
  password: string;
  rememberMe?: boolean;
  newsletter?: boolean;
}

type ValidatedForm = Required<FormInput>;
// ^ Equivalent to:
// {
//   username: string;
//   password: string;
//   rememberMe: boolean;   // No longer optional!
//   newsletter: boolean;    // No longer optional!
// }

function processForm(data: ValidatedForm): void {
  // ALL fields are guaranteed to be present here
  console.log(`User: ${data.username}, Newsletter: ${data.newsletter}`);
}
```

### Typical Pattern: Optional Input, Required After Validation

```typescript annotated
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

const defaults: Required<Config> = {
  host: "localhost",
  port: 3000,
  debug: false,
};

function createConfig(overrides: Config): Required<Config> {
  return { ...defaults, ...overrides };
}

const config = createConfig({ port: 8080 });
// config.host is GUARANTEED to be present — type is string, not string | undefined
```

> 🧠 **Explain it to yourself:** Why is `Required<T>` useful when you
> could also just define all properties as required directly?
> **Key points:** Input types often have optional fields for defaults | After processing you want guarantees | Required documents the transformation in the type system

---

## Readonly\<T\> — Everything Immutable

> **Analogy:** Readonly is like a display case in a museum — you can
> **see** everything, but you can't **touch** anything. The objects are there,
> but they are protected from modification.

`Readonly<T>` makes all properties `readonly`:

> ⚡ **Practical tip: Readonly in React and Angular**
>
> ```typescript
> // React: Props should ALWAYS be treated as immutable
> // Readonly<Props> makes this explicit:
> function UserCard(props: Readonly<UserCardProps>) {
>   // props.name = "other";  // Error! That's exactly what you want to prevent
> }
>
> // Angular: Readonly for @Input data that should not be mutated
> @Component({ ... })
> class UserListComponent {
>   @Input() users: Readonly<User[]> = [];
>   // this.users.push(newUser);  // Error! Array is readonly
> }
> ```

```typescript annotated
interface AppState {
  currentUser: string;
  theme: "light" | "dark";
  notifications: number;
}

type FrozenState = Readonly<AppState>;
// ^ Equivalent to:
// {
//   readonly currentUser: string;
//   readonly theme: "light" | "dark";
//   readonly notifications: number;
// }

function displayState(state: Readonly<AppState>): void {
  console.log(state.currentUser);
  // state.currentUser = "other"; // Error! readonly
}
```

### Important: Readonly is SHALLOW

```typescript annotated
interface UserProfile {
  name: string;
  settings: {
    theme: string;
    language: string;
  };
}

const profile: Readonly<UserProfile> = {
  name: "Max",
  settings: { theme: "dark", language: "de" },
};

// profile.name = "Anna";  // Error — readonly!
profile.settings.theme = "light";  // NO Error! The settings object is NOT readonly!
```

> **Note:** `Readonly<T>` only protects the **first level**. For deep
> immutability you need **DeepReadonly** — we'll build that ourselves in
> section 05.

> 💭 **Think about it:** Why is `Readonly<T>` only shallow? Wouldn't it
> be better if TypeScript ALWAYS made things deep readonly?
>
> **Answer:** Deep readonly would be very expensive for the compiler with large,
> nested types. It would also "freeze" types like `Date` or `Map`
> whose methods (`.setTime()`, `.set()`) would then no longer be
> callable. The shallow variant is the pragmatic compromise.

---

## When to Use Which Modifier?

| Utility Type | Effect | Typical Use Case |
|---|---|---|
| `Partial<T>` | All props optional | Update operations, patch requests |
| `Required<T>` | All props required | Validated data, resolved defaults |
| `Readonly<T>` | All props readonly | Immutable state, function parameters |

> 💭 **Think about it:** Can you combine Partial and Required? What would
> `Required<Partial<User>>` be?
>
> **Answer:** `Required<Partial<User>>` first makes everything optional and
> then everything required — the result is identical to the original `User`.
> The transformations cancel each other out!

---

## What you've learned

- **Utility Types** transform existing types instead of duplicating them
- **Partial\<T\>** makes all properties optional — ideal for updates
- **Required\<T\>** makes everything mandatory — ideal after validation
- **Readonly\<T\>** protects against mutation, but only shallowly (first level)
- All three are internally **Mapped Types** — they iterate over `keyof T`

> 🧠 **Explain it to yourself:** What is the difference between
> `Readonly<T>` and `as const`?
> **Key points:** Readonly\<T\> acts on a type (compile-time) | as const acts on a value | Readonly is shallow, as const is deep | as const also produces Literal Types

**Core concept to remember:** Utility Types are type-level functions — they take a type as input and return a transformed type as output.

> **Experiment:** Test in the TypeScript Playground: What is the type of
> `Readonly<Partial<User>>`? Are the properties both readonly AND optional?
> How does it differ from `Partial<Readonly<User>>`?

---

> **Pause point** — Good moment for a break. The three modifier types
> are the foundation for everything that follows.
>
> Continue with: [Section 02: Pick, Omit, Record](./02-pick-omit-record.md)