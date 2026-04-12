# Section 3: Extract, Exclude, NonNullable

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Pick, Omit, Record](./02-pick-omit-record.md)
> Next section: [04 - ReturnType, Parameters, Awaited](./04-returntype-parameters-awaited.md)

---

## What you'll learn here

- **Exclude\<T, U\>** — remove members from a union
- **Extract\<T, U\>** — keep members from a union
- **NonNullable\<T\>** — remove null and undefined
- How Conditional Types enable distribution over unions

---

## The difference: Object types vs. Union types

> 📖 **Background: Conditional Types and Distribution**
>
> Extract, Exclude, and NonNullable are all based on **Conditional Types**,
> which were also introduced piece by piece in TypeScript 2.1–2.8.
> The key mechanism — **Distributive Conditional Types** — arrived
> with TS 2.8 (March 2018). The idea: when a Conditional Type is applied to a
> union type, it is applied to EACH member individually
> and the results are merged back into a union. This is like
> `Array.filter()` — but for types instead of values.

In sections 01–02 we manipulated properties of **object types**.
Now we're manipulating **union types** themselves — we're filtering their members.

> **Analogy:** Think of a union type as a **deck of cards**.
> Pick/Omit select **columns on a single card**.
> Extract/Exclude select **entire cards** from the deck — they filter
> which cards you keep and which you discard.

```typescript annotated
// Object type: Pick/Omit select properties
type User = { id: number; name: string; email: string };
type Picked = Pick<User, "id" | "name">;

// Union type: Extract/Exclude select MEMBERS
type AllEvents = "click" | "scroll" | "keydown" | "keyup" | "focus" | "blur";
type KeyEvents = Extract<AllEvents, "keydown" | "keyup">;
// ^ "keydown" | "keyup"
```

---

## Exclude\<T, U\> — removing members

`Exclude<T, U>` removes all members from T that are assignable to U:

```typescript annotated
type Primitive = string | number | boolean | null | undefined;

// Remove null and undefined:
type DefinedPrimitive = Exclude<Primitive, null | undefined>;
// ^ string | number | boolean

// Remove number:
type NonNumeric = Exclude<Primitive, number>;
// ^ string | boolean | null | undefined

// Remove multiple:
type JustString = Exclude<Primitive, number | boolean | null | undefined>;
// ^ string
```

### Exclude with more complex unions

```typescript annotated
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Read-only methods only:
type ReadOnlyMethod = Exclude<HttpMethod, "POST" | "PUT" | "PATCH" | "DELETE">;
// ^ "GET"

// Everything except GET:
type WritingMethod = Exclude<HttpMethod, "GET">;
// ^ "POST" | "PUT" | "PATCH" | "DELETE"
```

### How does Exclude work internally?

```typescript annotated
// The built-in definition:
type Exclude<T, U> = T extends U ? never : T;
// ^ If T is assignable to U → disappear (never)
//                             ^ Otherwise: stay as you are
```

> 📖 **Background: Distributive Conditional Types**
>
> The trick is **distribution**: when T is a union, the
> Conditional Type is applied to EACH member individually.
>
> ```typescript
> Exclude<"a" | "b" | "c", "a">
> // Becomes:
> ("a" extends "a" ? never : "a") | ("b" extends "a" ? never : "b") | ("c" extends "a" ? never : "c")
> // = never | "b" | "c"
> // = "b" | "c"
> ```
>
> `never` in a union disappears automatically — it is the "identity
> element" of union types, like 0 in addition.

> 🔍 **Deeper knowledge: When distribution does NOT happen**
>
> Distribution only occurs when the type parameter is **naked** in
> the conditional. If you wrap T in a tuple, distribution does NOT occur:
>
> ```typescript
> // Distributive (T is naked):
> type D<T> = T extends string ? "yes" : "no";
> type R1 = D<string | number>;  // "yes" | "no"
>
> // NOT distributive (T is wrapped in [T]):
> type ND<T> = [T] extends [string] ? "yes" : "no";
> type R2 = ND<string | number>;  // "no" (the whole union is checked)
> ```
>
> You rarely need this trick, but it explains why the syntax
> works the way it does.

---

## Extract\<T, U\> — keeping members

`Extract<T, U>` is the opposite of Exclude — it keeps only the members
that are assignable to U:

```typescript annotated
type AllEvents = "click" | "scroll" | "keydown" | "keyup" | "focus" | "blur";

// Keyboard events only:
type KeyEvent = Extract<AllEvents, "keydown" | "keyup">;
// ^ "keydown" | "keyup"

// Focus events only:
type FocusEvent = Extract<AllEvents, "focus" | "blur">;
// ^ "focus" | "blur"
```

### Extract with pattern matching

```typescript annotated
type AllTypes = string | number | boolean | string[] | number[] | null;

// Keep only array types:
type ArrayTypes = Extract<AllTypes, any[]>;
// ^ string[] | number[]

// Keep only primitive types:
type PrimitiveTypes = Extract<AllTypes, string | number | boolean>;
// ^ string | number | boolean
```

### Extract with discriminated unions

```typescript annotated
type ApiResponse =
  | { status: "success"; data: string }
  | { status: "error"; message: string }
  | { status: "loading" };

// Only the success response:
type SuccessResponse = Extract<ApiResponse, { status: "success" }>;
// ^ { status: "success"; data: string }

// Only responses with message:
type ErrorResponse = Extract<ApiResponse, { message: string }>;
// ^ { status: "error"; message: string }
```

> ⚡ **Practical tip: Extract with discriminated unions in Angular/React**
>
> ```typescript
> // Angular: filtering NgRx actions
> type AllActions = LoadUsers | LoadUsersSuccess | LoadUsersFailure;
> type SuccessActions = Extract<AllActions, { type: `[Users] ${string} Success` }>;
>
> // React: filtering reducer states
> type AppState =
>   | { status: "idle" }
>   | { status: "loading" }
>   | { status: "success"; data: User[] }
>   | { status: "error"; error: string };
> type ActiveState = Exclude<AppState, { status: "idle" }>;
> // Only the states where "something has happened"
> ```

> 🧠 **Explain to yourself:** What is the relationship between
> Extract/Exclude and Pick/Omit?
> **Key points:** Pick/Omit work on object properties | Extract/Exclude work on union members | Omit uses Exclude internally (for the keys) | All four are complementary pairs

---

## NonNullable\<T\> — removing null/undefined

`NonNullable<T>` removes `null` and `undefined` from a type:

```typescript annotated
type MaybeString = string | null | undefined;

type DefiniteString = NonNullable<MaybeString>;
// ^ string

// Useful for optional fields:
interface User {
  name: string;
  nickname?: string;  // string | undefined
}

type DefiniteNickname = NonNullable<User["nickname"]>;
// ^ string
```

### NonNullable is a special case of Exclude

```typescript annotated
// NonNullable is defined internally as:
type NonNullable<T> = Exclude<T, null | undefined>;
// ^ Remove null        ^ and undefined from the union

// Identical:
type A = NonNullable<string | null | undefined>;
type B = Exclude<string | null | undefined, null | undefined>;
// Both: string
```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> type Test = NonNullable<0 | "" | false | null | undefined>;
> // Hover over Test — which values remain?
>
> type Falsy = NonNullable<false | 0 | "" | null | undefined>;
> // Hint: NonNullable removes ONLY null and undefined,
> // not "falsy values" like 0, "" or false!
> ```
> What is the difference between `NonNullable` and "remove all falsy values"?

### Typical pattern: after a null check

```typescript annotated
function processUser(users: Map<string, User>, id: string): void {
  const user = users.get(id);  // User | undefined

  if (!user) {
    throw new Error(`User ${id} not found`);
  }

  // After the check: user is User (no longer undefined)
  // But sometimes you need the type EXPLICITLY:
  type VerifiedUser = NonNullable<ReturnType<typeof users.get>>;
  // ^ User
}
```

---

## Working together: Exclude + Extract + NonNullable

```typescript annotated
type Input = string | number | boolean | null | undefined | string[];

// Step 1: Remove null/undefined
type Defined = NonNullable<Input>;
// ^ string | number | boolean | string[]

// Step 2: Only primitive types
type Primitives = Extract<Defined, string | number | boolean>;
// ^ string | number | boolean

// Step 3: Without boolean
type StringOrNumber = Exclude<Primitives, boolean>;
// ^ string | number
```

---

## What you've learned

- **Exclude\<T, U\>** removes union members that are assignable to U
- **Extract\<T, U\>** keeps only union members that are assignable to U
- **NonNullable\<T\>** is `Exclude<T, null | undefined>`
- All three use **Distributive Conditional Types** — the conditional is applied to each union member individually
- `never` disappears from unions — it is the identity element

> 🧠 **Explain to yourself:** What happens with `Extract<string | number, string>`?
> And with `Extract<"a" | "b" | "c", "a" | "b">`?
> **Key points:** First: string | Second: "a" | "b" | Extract checks assignability per member

**Core concept to remember:** Pick/Omit filter properties, Extract/Exclude filter union members. Four tools, two levels.

> **Experiment:** Test nested calls in the TypeScript Playground:
> ```typescript
> type Input = string | number | boolean | null | undefined | string[];
> type Step1 = NonNullable<Input>;                        // null/undefined gone
> type Step2 = Extract<Step1, string | number | boolean>; // only primitives
> type Step3 = Exclude<Step2, boolean>;                   // boolean gone
> // Hover over each Step — what is the type after each step?
> ```

---

> **Pause point** — Good moment for a break. From here on,
> the utility types become function-oriented.
>
> Continue with: [Section 04: ReturnType, Parameters, Awaited](./04-returntype-parameters-awaited.md)