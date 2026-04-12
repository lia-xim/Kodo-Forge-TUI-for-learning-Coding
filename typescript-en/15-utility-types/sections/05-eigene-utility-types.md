# Section 5: Custom Utility Types

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - ReturnType, Parameters, Awaited](./04-returntype-parameters-awaited.md)
> Next section: [06 - Combining Utility Types](./06-utility-types-kombinieren.md)

---

## What you'll learn here

- How to build **DeepPartial\<T\>** — recursive Partial
- How to build **DeepReadonly\<T\>** — recursive Readonly
- **Mutable\<T\>** — the opposite of Readonly
- **RequiredKeys\<T\>** and **OptionalKeys\<T\>** — filtering keys by optionality
- The mental model: Mapped Types + Conditional Types = custom Utility Types

---

## Why custom Utility Types?

> 📖 **Background: Why doesn't TypeScript have a built-in DeepPartial?**
>
> The TypeScript team under Anders Hejlsberg made a deliberate choice in favor of
> **minimalism** in the standard library. The philosophy:
> provide powerful building blocks (Mapped Types, Conditional Types, `infer`),
> not ready-made solutions for every use case. The reason: there are
> too many edge cases. Should `DeepPartial<Date>` make the properties of Date
> optional? Should `DeepReadonly<Map<K,V>>` lock the Map methods?
> Every project has slightly different answers to these questions.
>
> The community library `type-fest` (by Sindre Sorhus, 10M+ downloads
> per week) fills this gap with over 200 Utility Types.

The built-in Utility Types are **shallow** — they only transform
the first level. For nested objects you need recursive variants:

```typescript annotated
interface User {
  id: number;
  name: string;
  address: {
    street: string;
    city: string;
    geo: {
      lat: number;
      lng: number;
    };
  };
}

type ShallowPartial = Partial<User>;
// address? is optional, but address.street is STILL required!

// What we want: EVERYTHING optional, including nested properties
```

---

## DeepPartial\<T\> — Recursive Partial

> **Analogy:** `Partial<T>` is like a photocopier that only changes the
> **first page** of a document. `DeepPartial<T>` goes through
> **every page** and makes the same change everywhere — recursively,
> down to the last nested level.

```typescript annotated
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
  //            ^ ? makes this level optional
    ? DeepPartial<T[P]>   // Recursion: if property is an object → go deeper
    : T[P];                // Base case: primitives stay as they are (end of recursion)
};

// Usage:
type DeepPartialUser = DeepPartial<User>;
// {
//   id?: number;
//   name?: string;
//   address?: {
//     street?: string;
//     city?: string;
//     geo?: {
//       lat?: number;
//       lng?: number;
//     };
//   };
// }

function patchUser(id: number, changes: DeepPartial<User>): void {
  // Now you can update only the geo coordinates:
  console.log(`Patching user ${id}`);
}

patchUser(1, { address: { geo: { lat: 48.137 } } });  // OK!
```

### More robust version with array handling

```typescript annotated
type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]           // Arrays: element type recursively
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }  // Objects: recursion
    : T;                       // Primitives: unchanged
```

> 🧠 **Explain it to yourself:** Why does the more robust version need a
> separate check for arrays (`T extends (infer U)[]`)? What happens
> without this check when T is a `string[]`?
> **Key points:** Without the array check the array is treated like an object | keyof string[] gives "length", "push", "pop" etc. | But you want to make the ELEMENTS optional, not the methods | infer U extracts the element type

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> type DeepPartial<T> = T extends (infer U)[]
>   ? DeepPartial<U>[]
>   : T extends object
>     ? { [P in keyof T]?: DeepPartial<T[P]> }
>     : T;
>
> type Test = DeepPartial<{ users: { name: string; age: number }[] }>;
> // Hover over Test — is users optional?
> // Are the elements in the array also partial?
> ```
> Compare with the simpler version without the array check: `type SimpleDeepPartial<T> = { [P in keyof T]?: T extends object ? SimpleDeepPartial<T[P]> : T[P] }`. What happens with a `string[]`?

---

## DeepReadonly\<T\> — Recursive Readonly

```typescript annotated
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

// Usage:
type ImmutableUser = DeepReadonly<User>;
// {
//   readonly id: number;
//   readonly name: string;
//   readonly address: {
//     readonly street: string;
//     readonly city: string;
//     readonly geo: {
//       readonly lat: number;
//       readonly lng: number;
//     };
//   };
// }

function displayUser(user: DeepReadonly<User>): void {
  console.log(user.name);
  // user.name = "other";          // Error!
  // user.address.city = "other";  // Also an error! Deep readonly!
}
```

> ⚡ **Practical tip: DeepReadonly in state management**
>
> ```typescript
> // React: Redux store state as DeepReadonly
> type AppState = DeepReadonly<{
>   user: { name: string; preferences: { theme: string } };
>   posts: { id: number; title: string }[];
> }>;
> // EVERYTHING is readonly — including user.preferences.theme!
>
> // Angular: NgRx store state
> // NgRx already uses Readonly internally for state,
> // but DeepReadonly goes one step further and protects
> // nested objects from accidental mutation as well.
> ```

---

## Mutable\<T\> — The opposite of Readonly

Sometimes you receive a `Readonly<T>` and need the writable version:

```typescript annotated
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
// ^ -readonly REMOVES the readonly modifier!

interface FrozenConfig {
  readonly host: string;
  readonly port: number;
  readonly debug: boolean;
}

type WritableConfig = Mutable<FrozenConfig>;
// ^ { host: string; port: number; debug: boolean }  — no more readonly!
```

> 🧠 **Explain it to yourself:** What does the minus sign in `-readonly` mean?
> **Key points:** + adds a modifier (the default) | - removes a modifier | -readonly removes readonly | -? removes optional (that's what Required does internally!)

### Deep Mutable

```typescript annotated
type DeepMutable<T> = T extends (infer U)[]
  ? DeepMutable<U>[]
  : T extends object
    ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
    : T;
```

> 💭 **Think about it:** Why is there no built-in `Mutable<T>` in TypeScript,
> even though there is a `Readonly<T>`?
>
> **Answer:** The TypeScript philosophy favors **safety by default**.
> Adding readonly is a tightening (safer), removing readonly is a
> loosening (less safe). That's why Readonly is provided as a Utility
> Type, but Mutable is deliberately left to the developer —
> as a signal that removing readonly should be a conscious decision.

---

## RequiredKeys\<T\> and OptionalKeys\<T\>

Sometimes you only need the **names** of the required or optional keys:

```typescript annotated
interface UserProfile {
  id: number;          // required
  name: string;        // required
  bio?: string;        // optional
  avatar?: string;     // optional
  settings: {          // required
    theme: string;
  };
}

// OptionalKeys: keys that are optional
type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

// RequiredKeys: keys that are NOT optional
type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

type Optional = OptionalKeys<UserProfile>;
// ^ "bio" | "avatar"

type Required = RequiredKeys<UserProfile>;
// ^ "id" | "name" | "settings"
```

### How does this work?

```typescript annotated
// Step by step (using OptionalKeys as an example):

// 1. Mapped type produces: { id: never; name: never; bio: "bio"; avatar: "avatar"; settings: never }
//    ^ required keys become never     ^ optional keys become their own name
// 2. [keyof T] extracts all values: never | never | "bio" | "avatar" | never
//    ^ index access on all keys simultaneously
// 3. never disappears from the union: "bio" | "avatar"
//    ^ never is the identity element of a union
```

> 🔍 **Deeper knowledge: The `{} extends Pick<T, K>` trick**
>
> How do you tell whether a property is optional? The trick uses
> assignability: if K is optional, an empty object `{}`
> can be assigned to `Pick<T, K>` (because K may be absent).
> If K is required, `{}` CANNOT be assigned (because K
> must be present). We use this asymmetry as a test.

> 💭 **Think about it:** How would you build **ReadonlyKeys\<T\>** — meaning keys
> that are readonly?
>
> **Answer:** That's trickier — TypeScript has no direct `readonly`
> predicate at the type level. You have to work with `Equal` comparisons:
> ```typescript
> type ReadonlyKeys<T> = {
>   [K in keyof T]-?: Equal<{ [P in K]: T[K] }, { readonly [P in K]: T[K] }> extends true ? K : never;
> }[keyof T];
> ```

---

## The mental model for custom Utility Types

```
1. Mapped Type:        [P in keyof T]: ...
2. Conditional Type:   T[P] extends X ? A : B
3. Recursion:          MyType<T[P]> for nested types
4. Index Access:       [keyof T] at the end for a union of values
```

These four building blocks are enough for almost any custom Utility Type.

---

## What you've learned

- **DeepPartial\<T\>** makes everything recursively optional — with object detection and recursion
- **DeepReadonly\<T\>** makes everything recursively readonly
- **Mutable\<T\>** removes readonly with the `-readonly` modifier
- **RequiredKeys/OptionalKeys** extract key names by property characteristic
- The pattern is always: **Mapped Type + Conditional Type + Recursion**

> 🧠 **Explain it to yourself:** What is the difference between `Partial<T>` and `DeepPartial<T>` for a flat object like `{ id: number; name: string }`?
> **Key points:** For flat objects they are identical | The difference only shows with nested properties | DeepPartial recurses into object properties | Partial stops after the first level

**Core concept to remember:** Custom Utility Types follow the pattern "Mapped Type + condition + recursion". The built-in types are the shallow variants — you build the deep ones.

> **Experiment:** Build a `DeepRequired<T>` in the TypeScript Playground —
> the opposite of DeepPartial:
> ```typescript
> type DeepRequired<T> = T extends (infer U)[]
>   ? DeepRequired<U>[]
>   : T extends object
>     ? { [P in keyof T]-?: DeepRequired<T[P]> }
>     : T;
> ```
> Test it with `{ host?: string; ssl?: { cert?: string; key?: string } }`.
> Are all properties — including nested ones — now required?

---

> **Pause point** — You can now build custom Utility Types!
>
> Continue with: [Section 06: Combining Utility Types](./06-utility-types-kombinieren.md)