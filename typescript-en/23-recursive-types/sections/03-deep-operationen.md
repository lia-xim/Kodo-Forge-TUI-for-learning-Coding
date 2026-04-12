# Section 3: Deep Operations

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Typing tree structures](./02-baumstrukturen-typen.md)
> Next section: [04 - Recursive Conditional Types](./04-rekursive-conditional-types.md)

---

## What you'll learn here

- How to build **DeepPartial\<T\>** — arguably the most useful recursive utility
- Why TypeScript deliberately has **no built-in DeepPartial**
- How **DeepReadonly\<T\>**, **DeepRequired\<T\>**, and **DeepMutable\<T\>** work
- Why **arrays in deep operations** require special handling

---

## Why is there no built-in DeepPartial?
<!-- section:summary -->
You know `Partial<T>` from lesson 15 — it makes all properties

<!-- depth:standard -->
You know `Partial<T>` from lesson 15 — it makes all properties
of a type optional. But `Partial` is **shallow**: it only acts
on the first level.

```typescript
type User = {
  name: string;
  address: {
    street: string;
    city: string;
    country: {
      name: string;
      code: string;
    };
  };
};

type PartialUser = Partial<User>;
// Result:
// {
//   name?: string;
//   address?: {         ← Optional!
//     street: string;   ← NOT optional! Partial only acts shallowly.
//     city: string;     ← NOT optional!
//     country: { ... }; ← NOT optional!
//   };
// }
```

<!-- depth:vollstaendig -->
> **Background: Why TypeScript has no built-in DeepPartial**
>
> The TypeScript team made this design decision deliberately.
> Anders Hejlsberg (TypeScript's creator) explained in GitHub issues:
> Deep operations are **context-dependent**. Should `Date` be
> resolved? Should `Map<K,V>` be treated recursively? What about
> functions, class instances, `Promise<T>`? Every project has
> different answers. That's why TypeScript provides the **building
> blocks** (Mapped Types + Conditional Types + Recursion), but not
> the ready-made deep version — you build it for your context.

---

<!-- /depth -->
## DeepPartial: Step by step
<!-- section:summary -->
1. **Mapped Type** iterates over all keys

<!-- depth:standard -->
```typescript annotated
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
  // ^ Mapped Type: iterates over all keys of T
  // ^ ? makes each property optional (like Partial)
  // ^ extends object checks: is the value an object?
    ? DeepPartial<T[K]>
    // ^ YES: recursively apply DeepPartial to the nested type
    : T[K];
    // ^ NO (primitive value): pass through as-is
};

// Testing:
type DeepPartialUser = DeepPartial<User>;
// Result:
// {
//   name?: string;
//   address?: {
//     street?: string;       ← Now optional too!
//     city?: string;         ← Now optional too!
//     country?: {
//       name?: string;       ← Even 3rd level!
//       code?: string;
//     };
//   };
// }
```

The logic is simple:
1. **Mapped Type** iterates over all keys
2. For each key: is the value an **object**? → Recurse
3. Is the value **primitive**? → Pass through directly
4. The `?` after `[K in keyof T]` makes everything optional

---

<!-- /depth -->
## Explain it to yourself: How does DeepPartial work?
<!-- section:summary -->
Without the condition, TypeScript would try to compute `DeepPartial<string>`

<!-- depth:standard -->
> **Explain it to yourself:**
>
> Why do we need `T[K] extends object ? DeepPartial<T[K]> : T[K]`?
> What would happen if we simply wrote `DeepPartial<T[K]>` without
> the condition?
>
> *Think for 30 seconds before reading on.*

Without the condition, TypeScript would try to compute `DeepPartial<string>`
— which results in `{ [K in keyof string]?: ... }`, i.e. the
properties of the String object (length, charAt, etc.) as optional
fields. That is **not** what we want!

---

<!-- /depth -->
## The array problem
<!-- section:summary -->
The naive version has a problem: `Array` is also an `object`!

<!-- depth:standard -->
The naive version has a problem: `Array` is also an `object`!

```typescript annotated
// Problem: arrays get "dissolved"
type Broken = DeepPartial<{ tags: string[] }>;
// Result WITHOUT array handling:
// {
//   tags?: {
//     length?: number;        ← WRONG! Array was treated as an object
//     [index: number]?: ...
//     push?: ...
//   }
// }

// Solution: handle arrays separately
type DeepPartialFixed<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartialFixed<U>[]
    // ^ Array? → recurse on the element type, array stays array
    : T[K] extends object
      ? DeepPartialFixed<T[K]>
      // ^ Object? → recurse
      : T[K];
      // ^ Primitive? → pass through directly
};

// Now correct:
type Fixed = DeepPartialFixed<{ tags: string[]; nested: { items: number[] } }>;
// {
//   tags?: string[];          ← Array stays array!
//   nested?: {
//     items?: number[];       ← Also correct in nested objects
//   }
// }
```

---

<!-- /depth -->
## Think about it: What happens with arrays in DeepReadonly?
<!-- section:summary -->
There is no "right" answer — it depends on your context.

<!-- depth:standard -->
> **Think about it:**
>
> When you build `DeepReadonly<{ data: string[] }>`:
> Should `string[]` become `readonly string[]`?
> Or should the array remain a normal array,
> but the elements be readonly?
>
> And what about `Map<string, User[]>`? Should the Map
> become readonly? The user arrays inside it? The users themselves?

There is no "right" answer — it depends on your context.
That's exactly why TypeScript has no built-in DeepReadonly.

---

<!-- /depth -->
## DeepReadonly: Immutable data

```typescript annotated
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (infer U)[]
  // ^ readonly makes each property immutable
    ? readonly DeepReadonly<U>[]
    // ^ Array? → readonly array with readonly elements
    : T[K] extends object
      ? DeepReadonly<T[K]>
      // ^ Object? → recurse
      : T[K];
      // ^ Primitive? → pass through directly
};

type Config = {
  server: {
    host: string;
    port: number;
    tls: { cert: string; key: string };
  };
  features: string[];
};

type ReadonlyConfig = DeepReadonly<Config>;
// {
//   readonly server: {
//     readonly host: string;
//     readonly port: number;
//     readonly tls: {
//       readonly cert: string;
//       readonly key: string;
//     };
//   };
//   readonly features: readonly string[];
// }

// Everything is now immutable:
declare const cfg: ReadonlyConfig;
// cfg.server.port = 3000;          // Error!
// cfg.server.tls.cert = "new";     // Error!
// cfg.features.push("new");        // Error! readonly array
// cfg.features[0] = "changed";     // Error!
```

---

## DeepRequired and DeepMutable
<!-- section:summary -->
The pattern is always the same — only the modifier changes:

<!-- depth:standard -->
The pattern is always the same — only the modifier changes:

```typescript annotated
// DeepRequired: removes all optional markers recursively
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends (infer U)[]
  // ^ -? removes the optional ? (Required)
    ? DeepRequired<U>[]
    : T[K] extends object | undefined
      ? DeepRequired<NonNullable<T[K]>>
      // ^ NonNullable removes undefined (which came from ?)
      : NonNullable<T[K]>;
};

// DeepMutable: removes all readonly markers recursively
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends readonly (infer U)[]
  // ^ -readonly removes the readonly modifier
    ? DeepMutable<U>[]
    : T[K] extends object
      ? DeepMutable<T[K]>
      : T[K];
};
```

**The four deep operations at a glance:**

| Operation | Modifier | Does what? |
|-----------|----------|------------|
| DeepPartial | add `?` | Everything optional |
| DeepRequired | remove `-?` | Everything required |
| DeepReadonly | add `readonly` | Everything immutable |
| DeepMutable | remove `-readonly` | Everything mutable |

---

<!-- /depth -->
## Experiment: Build DeepPartial yourself

> **Experiment:**
>
> Implement DeepPartial and test it:
>
> ```typescript
> type DeepPartial<T> = {
>   [K in keyof T]?: T[K] extends object
>     ? DeepPartial<T[K]>
>     : T[K];
> };
>
> // Test: 3 levels deep
> type AppConfig = {
>   database: {
>     connection: {
>       host: string;
>       port: number;
>       ssl: boolean;
>     };
>     name: string;
>   };
>   logging: {
>     level: "debug" | "info" | "warn" | "error";
>     file: string;
>   };
> };
>
> // Create a partial update:
> const update: DeepPartial<AppConfig> = {
>   database: {
>     connection: {
>       port: 5433,  // Only change the port!
>     },
>   },
> };
> // Works! All other fields are optional.
>
> // Bonus: What happens with an array field?
> type WithArray = { items: { name: string }[] };
> type Test = DeepPartial<WithArray>;
> // Hover over Test — what do you see?
> ```

---

## Framework connection: DeepReadonly in state management

> **In your Angular project** with NgRx:
>
> ```typescript
> // NgRx Store: state should be IMMUTABLE
> interface AppState {
>   user: {
>     profile: { name: string; email: string };
>     preferences: { theme: "light" | "dark"; language: string };
>   };
>   cart: {
>     items: { id: string; quantity: number }[];
>     total: number;
>   };
> }
>
> // DeepReadonly enforces immutability on ALL levels:
> type ImmutableState = DeepReadonly<AppState>;
>
> // In reducers:
> function reducer(state: ImmutableState, action: Action): ImmutableState {
>   // state.user.profile.name = "new";  // Error! readonly
>   // state.cart.items.push(...);         // Error! readonly array
>   return { ...state, /* spread for updates */ };
> }
> ```
>
> **In React** with Immer:
>
> ```typescript
> // Immer allows "mutative" syntax that actually works immutably
> import { produce } from "immer";
>
> const nextState = produce(state, draft => {
>   draft.user.profile.name = "new";  // Looks mutative...
>   // ...but Immer produces a new, unchanged state
> });
>
> // DeepReadonly<State> + Immer is the best of both worlds:
> // compile-time protection + ergonomic updates
> ```

---

## Summary

### What you've learned

You've mastered the **four fundamental deep operations**:

- **DeepPartial\<T\>** makes everything optional at all levels
- **DeepReadonly\<T\>** makes everything immutable at all levels
- **DeepRequired\<T\>** and **DeepMutable\<T\>** are their counterparts
- **Arrays need special handling** — `(infer U)[]` extracts the element type
- TypeScript deliberately has no built-in deep utility because the semantics are context-dependent

> **Core concept:** Deep operations combine **Mapped Types**
> (iteration over keys) with **Conditional Types** (checking
> for object vs. primitive) and **Recursion** (self-reference for
> nested levels). The pattern is always: check if object →
> apply recursively, otherwise → pass through directly.

---

> **Pause point** — You've built the most practical recursive types!
> In the next section we tackle the king's class: Recursive
> Conditional Types for Flatten, Paths, and string manipulation.
>
> Continue: [Section 04 - Recursive Conditional Types](./04-rekursive-conditional-types.md)