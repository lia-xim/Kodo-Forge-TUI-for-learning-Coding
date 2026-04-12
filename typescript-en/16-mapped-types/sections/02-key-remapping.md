# Section 2: Key Remapping

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Basics](./01-grundlagen.md)
> Next section: [03 - Custom Utility Types](./03-eigene-utility-types.md)

---

## What you'll learn here

- The `as` clause for renaming keys
- Template Literal Types for dynamic key names
- Key filtering via `never` in remapping
- Practical examples: getter/setter generation, event handler types

---

> 📖 **Background: Key Remapping — a late milestone**
>
> Key Remapping (the `as` clause in Mapped Types) was only introduced with
> **TypeScript 4.1** (November 2020) — four years after
> the original Mapped Types! Before that, it was impossible to rename keys
> in a Mapped Type. You had to use cumbersome workarounds
> with `Pick`, `Omit`, and Intersection Types. The `as` clause
> was one of the most-requested features in the TypeScript community
> (GitHub Issue #12754 had hundreds of upvotes).

## The problem: renaming or filtering keys

In Section 1 you learned how to transform properties. But what
if you want to change the **key names** themselves?

```typescript
interface User {
  name: string;
  email: string;
}

// Desired: getter methods
// { getName(): string; getEmail(): string; }
```

With the basic syntax `[K in keyof T]`, keys always stay the same.
The solution: **Key Remapping with `as`**.

---

## The as clause (TS 4.1)

> **Analogy:** Think of Mapped Types without `as` like a photocopier
> that can only change the **contents** (color, size). With the
> `as` clause, the machine can now also rename the **label** on each
> folder — "name" becomes "getName", "email" becomes "getEmail".

```typescript annotated
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
// ^              ^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^
// |              |  New key name (Template Literal)    Value: getter function
// |              +-- as clause: "rename the key to..."
// +----------------- Iteration over all original keys
};

interface User {
  name: string;
  email: string;
  age: number;
}

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getEmail: () => string;
//   getAge: () => number;
// }
```

Step by step:
1. `K in keyof T` — iterates over 'name', 'email', 'age'
2. `as \`get${Capitalize<string & K>}\`` — renames 'name' to 'getName'
3. `() => T[K]` — the value type becomes a getter function

> **`string & K`** is necessary because `keyof T` can also contain `number | symbol`.
> The intersection filters down to string keys.

> 🧠 **Explain to yourself:** What exactly does `Capitalize<string & K>` do? Why not just `Capitalize<K>`?
> **Key points:** `keyof T` is `string | number | symbol` | `Capitalize` expects `string` | `string & K` filters to string keys | `number` and `symbol` keys are excluded | Without `& string` you get a compile error

---

## Template Literal Types in keys

You can use arbitrary Template Literals as new key names:

```typescript
// Generate setters
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

// Generate event handlers
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (
    newValue: T[K],
    oldValue: T[K]
  ) => void;
};

interface Settings {
  theme: string;
  fontSize: number;
}

type SettingsHandlers = EventHandlers<Settings>;
// {
//   onThemeChange: (newValue: string, oldValue: string) => void;
//   onFontSizeChange: (newValue: number, oldValue: number) => void;
// }
```

> ⚡ **Practical tip: Event handlers in Angular and React**
>
> ```typescript
> // React: generate onChange handlers for all properties
> type ChangeHandlers<T> = {
>   [K in keyof T as `on${Capitalize<string & K>}Change`]: (value: T[K]) => void;
> };
> // For { name: string; age: number } this yields:
> // { onNameChange: (value: string) => void; onAgeChange: (value: number) => void; }
>
> // Angular: automatically derive Output events
> type OutputEvents<T> = {
>   [K in keyof T as `${string & K}Change`]: EventEmitter<T[K]>;
> };
> ```

---

## Key filtering with never

When the remapping produces `never`, the key is **removed**:

```typescript annotated
// Keep only string properties
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
//                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                 Conditional in the remapping:
//                 Is the value type string? → keep key
//                 Otherwise? → never → key is removed
};

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type StringProps = StringKeysOnly<User>;
// { name: string; email: string; }
// id and age were filtered out!
```

> **Rule of thumb:** `never` in Key Remapping = key is removed.
> This is like `Array.filter()` for object keys at the type level.

> 💭 **Think about it:** Can you recreate `Pick<T, K>` using Key Remapping
> that works WITHOUT the second parameter K — i.e., automatically
> selects all string properties?
>
> **Answer:** Yes! That's exactly what `StringKeysOnly<T>` above does.
> You can customize the "filter" however you like — e.g. only functions,
> only arrays, only types that match a certain interface.
> Key Remapping enables **type-based filtering**, which
> is not possible with the regular `Pick` (key-based).

---

## Practical example: OmitByType

```typescript
// Remove all properties of a given type
type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

// Keep only properties of a given type
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface Mixed {
  name: string;
  count: number;
  active: boolean;
  label: string;
}

type WithoutStrings = OmitByType<Mixed, string>;
// { count: number; active: boolean; }

type OnlyStrings = PickByType<Mixed, string>;
// { name: string; label: string; }
```

---

## Combination: prefix/suffix for keys

```typescript annotated
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}_${string & K}`]: T[K];
//                  ^^^^^^^^^^^^^^^^^^^^ Template Literal:
//                  P + "_" + original key name
};

interface DbRow {
  id: number;
  name: string;
}

type UserRow = Prefixed<DbRow, 'user'>;
// { user_id: number; user_name: string; }
```

> 🔍 **Deeper knowledge: Capitalize, Uncapitalize, Uppercase, Lowercase**
>
> TypeScript provides four built-in string manipulation types:
>
> ```typescript
> type A = Capitalize<"hello">;     // "Hello"
> type B = Uncapitalize<"Hello">;   // "hello"
> type C = Uppercase<"hello">;      // "HELLO"
> type D = Lowercase<"HELLO">;      // "hello"
> ```
>
> These are **intrinsic types** — they are hard-coded into the compiler
> and cannot be replicated with normal Conditional Types. They operate
> on **literal string types**, not on the general `string` type.

> 🔬 **Experiment:** Build a Mapped Type `Suffixed<T, S>` that appends
> a suffix (e.g. `Suffixed<{ name: string }, "Field">`
> yields `{ nameField: string }`). Hint: The syntax is almost
> identical to `Prefixed`, only the template order changes.

---

## What you learned

- The **`as` clause** (TS 4.1) enables key renaming in Mapped Types
- **Template Literal Types** create dynamic key names: `` `get${Capitalize<K>}` ``
- **`as never`** filters out keys — like `Array.filter()` at the type level
- **`string & K`** ensures K is a string key (filters out number/symbol)
- Getters, setters, event handlers, and prefixed keys are typical use cases

> 🧠 **Explain to yourself:** What is the difference between key filtering
> with `as ... ? K : never` (Key Remapping) and `Pick<T, K>` (Utility Type)?
> **Key points:** Pick filters by KEY NAMES (you provide the names explicitly) | Key Remapping filters by VALUE TYPES (automatically based on the type) | Pick requires a manual key list | Key Remapping is dynamic and adapts to T

**Core concept to remember:** Key Remapping transforms Mapped Types from a pure "photocopier" into a complete type transformation engine. You can rename, filter, and dynamically generate keys — all within a single type.

---

> **Pause point** — You've now learned the most powerful feature of Mapped Types.
> From here you'll build your own Utility Types.
>
> Continue with: [Section 03 - Custom Utility Types](./03-eigene-utility-types.md)