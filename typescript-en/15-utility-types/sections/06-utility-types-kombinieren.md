# Section 6: Combining Utility Types

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Custom Utility Types](./05-eigene-utility-types.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- **Composition**: Nesting multiple Utility Types
- **Pick + Partial**: Making specific fields optional
- **Omit + Required**: Making specific fields mandatory
- Practical patterns for **Forms**, **APIs**, and **State Management**
- The "Swiss Army Knife" pattern for flexible type transformations

---

## The Principle: Composition

> 📖 **Background: Composition over Inheritance — even for types**
>
> The principle of "Composition over Inheritance" is one of the most important
> design principles in software development (Gang of Four, 1994).
> It applies not only to classes but also to types: instead of writing a new
> interface for every use case, you **combine** existing Utility Types into new
> types. It's like LEGO — with a few basic building blocks (Partial, Pick,
> Omit, Required, Readonly) you can assemble nearly any type you need.

> **Analogy:** Utility Types are like **Unix pipes**: each tool does
> one thing well. `cat file | grep "error" | sort | uniq` — every
> command transforms its input. Similarly: `Readonly<Partial<Pick<User, "name" | "email">>>` —
> each Utility Type transforms the type one step further.

Utility Types are like functions — they can be **nested**:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "admin" | "user";
}

// Readonly + Partial = Immutable partial update
type ReadonlyPartialUser = Readonly<Partial<User>>;

// Pick + Required = Specific fields as mandatory
type RequiredNameEmail = Required<Pick<User, "name" | "email">>;
// ^ { name: string; email: string }  — both required
```

---

## Pattern 1: Certain fields optional, rest required

Typical for **update forms** where id is required but everything else is optional:

```typescript annotated
// "K stays required, everything else becomes optional"
type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

type UserUpdate = PartialExcept<User, "id">;
// ^ { id: number } & { name?: string; email?: string; avatar?: string; bio?: string; role?: "admin" | "user" }

function updateUser(data: PartialExcept<User, "id">): void {
  console.log(`Updating user ${data.id}`);
  // data.id is GUARANTEED to be present
  // data.name is optional
}

updateUser({ id: 1 });                          // OK — id only
updateUser({ id: 1, name: "Max" });              // OK — id + name
// updateUser({ name: "Max" });                  // Error! id is missing!
```

> 🧠 **Explain to yourself:** Why does `PartialExcept` need an **intersection** (`&`) instead of a single mapped type? Could this be solved with just one mapped type?
> **Key points:** A mapped type can only perform ONE transformation per key | We need different behavior for different key groups | Pick selects the required keys, Partial+Omit handles the optional ones | Intersection combines both halves

### Pattern 2: Certain fields required, rest optional

The opposite — for **forms with minimum requirements**:

```typescript annotated
// "K becomes required, everything else stays as-is"
type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type UserWithAvatar = RequireKeys<User, "avatar">;
// avatar is now string (no longer string | undefined)!

function displayProfile(user: RequireKeys<User, "avatar" | "bio">): void {
  // avatar and bio are GUARANTEED to be present
  console.log(`Avatar: ${user.avatar}, Bio: ${user.bio}`);
}
```

---

## Pattern 3: Create-input type (without server-generated fields)

For API calls where `id` and `createdAt` come from the server:

```typescript annotated
interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}

// Fields the server sets:
type ServerGenerated = "id" | "createdAt" | "updatedAt";

// Create: Without server fields, published optional
type CreateArticle = Omit<Article, ServerGenerated> & { published?: boolean };

// Update: id required, rest optional
type UpdateArticle = Pick<Article, "id"> & Partial<Omit<Article, "id" | ServerGenerated>>;

function createArticle(input: CreateArticle): Article {
  return {
    ...input,
    id: Math.random(),
    published: input.published ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
```

---

## Pattern 4: Form state with validation

> ⚡ **Practical tip: The form pattern in the real world**
>
> This pattern is the foundation of:
> - **Angular Reactive Forms**: `FormGroup` internally uses mapped types
>   to generate controls, validators, and status for each field
> - **React Hook Form**: `useForm<T>()` automatically derives errors, touched, and
>   dirty state from the form type T
> - **Formik**: `FormikErrors<T>` is exactly `Partial<Record<keyof T, string>>`
>
> If you understand this pattern, you understand how these libraries work.

```typescript annotated
interface FormFields {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Form state: All fields optional (not yet filled in)
type FormState = Partial<FormFields>;

// Validated state: Everything filled in
type ValidatedForm = Required<FormFields>;

// Error map: An optional error string for each field
type FormErrors = Partial<Record<keyof FormFields, string>>;

// Touched state: Which fields have been touched?
type TouchedFields = Partial<Record<keyof FormFields, boolean>>;

interface FormStore {
  values: FormState;
  errors: FormErrors;
  touched: TouchedFields;
  isValid: boolean;
}
```

> 🧠 **Explain to yourself:** Why is `Record<keyof FormFields, string>`
> better than `{ [key: string]: string }` for the error map?
> **Key points:** Record with keyof only allows the actual field names | An index signature allows arbitrary strings | Typos are caught with Record | Record is self-documenting

---

## Pattern 5: API response transformation

```typescript annotated
// Server response (snake_case, all fields):
interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
}

// Frontend model (only relevant fields):
type UserViewModel = Pick<ApiUser, "id" | "email" | "is_admin">;

// Readonly for the store:
type StoredUser = Readonly<UserViewModel>;

// For lists: Array of readonly users
type UserList = readonly StoredUser[];
```

---

## Pattern 6: The "Swiss Army Knife" pattern

A generic type that combines multiple transformations:

```typescript annotated
/**
 * Flexible type transformation:
 * - R: Required keys (must be present)
 * - O: Optional keys (may be absent)
 * - X: Excluded keys (are removed)
 */
type TransformType<T, R extends keyof T, O extends keyof T = never, X extends keyof T = never> =
  Required<Pick<T, R>> &
  Partial<Pick<T, O>> &
  Omit<T, R | O | X>;

// Examples:
type CreateUser = TransformType<User, "name" | "email", "avatar" | "bio", "id">;
// name + email: required
// avatar + bio: optional
// id: removed
// role: stays as in the original (required)

type UpdateUser = TransformType<User, "id", "name" | "email" | "role", "avatar" | "bio">;
// id: required
// name + email + role: optional
// avatar + bio: removed
```

> 📖 **Background: Composition in practice**
>
> In large codebases (Angular, React, Next.js) these patterns appear
> everywhere. Instead of manually defining a separate type for each API
> operation, all types are derived from a single base type. This
> guarantees consistency and drastically reduces maintenance overhead.
>
> A real-world example: The Next.js framework internally uses complex
> utility type combinations for `getServerSideProps`, `getStaticProps`,
> and API routes. The return type of `getServerSideProps` is automatically
> passed to the page component using `InferGetServerSidePropsType`
> (an Awaited+ReturnType combination).

> **Experiment:** Build a `FormType<T, RequiredFields, OptionalFields>` in the TypeScript Playground:
> ```typescript
> type FormType<
>   T,
>   R extends keyof T,
>   O extends keyof T
> > = Required<Pick<T, R>> & Partial<Pick<T, O>>;
>
> interface User { id: number; name: string; email: string; bio?: string; role: "admin" | "user" }
>
> type LoginForm = FormType<User, "email", "name">;
> // email: string (required), name?: string (optional), everything else is absent
> ```
> Test different key combinations. What happens when a key appears in both R and O at the same time?

> 💭 **Think about it:** What happens if a key in `TransformType<T, R, O, X>` appears
> in both R and O simultaneously? Is that an error?
>
> **Answer:** TypeScript does not throw an error — but the behavior is
> undefined (the key appears in both halves of the intersection).
> In practice, Required "wins" because `Required<Pick<T, K>>` explicitly
> marks the key as mandatory. Even so, this should be avoided —
> a more robust TransformType would validate the constraints.

---

## Summary of patterns

| Pattern | Combination | Use case |
|---|---|---|
| Partial except K | `Pick<T,K> & Partial<Omit<T,K>>` | Update with required id |
| Require keys K | `Omit<T,K> & Required<Pick<T,K>>` | Enforce mandatory fields |
| Create input | `Omit<T, ServerKeys>` | Creating new entities |
| Form state | `Partial<T>` + `Record<keyof T, E>` | Forms with validation |
| Readonly store | `Readonly<Pick<T, K>>` | Immutable view models |

---

## What you've learned

- Utility Types can be **nested** like functions
- **Pick + Partial** and **Omit + Required** are the most common combinations
- **PartialExcept** and **RequireKeys** solve 90% of form/API problems
- **Record\<keyof T, V\>** creates type-safe maps over all fields
- The "Swiss Army Knife" pattern combines Required + Partial + Omit

> 🧠 **Explain to yourself:** Why is `Pick<T, K> & Partial<Omit<T, K>>`
> not the same as `Partial<T> & Required<Pick<T, K>>`?
> **Key points:** First: K stays exactly as in T, rest becomes optional | Second: K becomes explicitly required (even if it was optional in T!) | For optional keys in T this makes a difference | Both patterns have their place

**Core concept to remember:** The true power of Utility Types lies not in the individual types, but in their composition. Think in transformation chains: base type -> Pick/Omit -> Partial/Required -> Readonly.

> **Experiment:** Test the `TransformType` pattern in the TypeScript Playground
> with your own interface — for example an `Article` type from your Angular project.
> What derived types (Create, Update, View) can you generate from it?

---

> **End of lesson** — You have now mastered TypeScript's Utility Types!
>
> Next steps:
> 1. Work through the quiz
> 2. Keep the cheatsheet as a reference
>
> **Next lesson:** 16 — Mapped Types & Conditional Types