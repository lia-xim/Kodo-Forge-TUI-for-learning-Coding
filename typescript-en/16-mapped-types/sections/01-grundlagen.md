# Section 1: Mapped Types — Fundamentals

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Key Remapping](./02-key-remapping.md)

---

## What you'll learn here

- What Mapped Types are and what problem they solve
- The basic syntax: `{ [K in keyof T]: ... }`
- Modifiers: `readonly`, `?`, `+`, `-`
- How TypeScript's built-in Utility Types work internally

---

> 📖 **Background: The Birth of Mapped Types**
>
> Mapped Types were released on **December 7, 2016** with TypeScript 2.1.
> They were Anders Hejlsberg's answer to the question:
> "How can we transform types without rewriting them completely?"
> The inspiration came from functional programming —
> `Array.map()` transforms **values** in an array, Mapped Types
> transform **types** in an object type.
>
> Hejlsberg demonstrated Mapped Types live at TSConf 2016 and
> implemented `Partial<T>`, `Readonly<T>`, and `Pick<T, K>` in
> a single line each. The audience was impressed —
> previously you needed a completely new interface for every
> variant of a type. Mapped Types made the TypeScript type system
> **Turing-complete** for type transformations for the first time.

> **Analogy:** Mapped Types are like a **photocopier with stamps**:
> You take an object, copy all the keys, and press a stamp onto each
> property (`readonly`, `optional`, new type). The original stays
> unchanged — you get a transformed copy.

## The Problem: Transforming Each Property Individually

In Lesson 15 you used Utility Types like `Partial<T>` and `Readonly<T>`.
But how do they work INTERNALLY? The answer: **Mapped Types**.

Imagine you have a User interface and want to make EVERY property optional.
Without Mapped Types you'd have to change each property individually:

```typescript
// Manual — doesn't scale!
interface UserOptional {
  id?: number;
  name?: string;
  email?: string;
}
```

---

## The Basic Syntax

A Mapped Type iterates over the keys of a type and transforms each property:

```typescript annotated
type MyPartial<T> = {
  [K in keyof T]?: T[K];
// ^              ^  ^
// |              |  +-- Indexed Access: the value type of property K in T
// |              +----- ? makes the property optional (modifier)
// +-------------------- Iteration: for EVERY key K in keyof T
};
```

Step by step:
1. `keyof T` — all keys of T as a union: `'id' | 'name' | 'email'`
2. `K in ...` — for EVERY key K in this union
3. `T[K]` — the value type of property K in T
4. `?` — makes the property optional

> **Think of it as a for-loop for types:**
> "For every key K in T, create a property K with type T[K]."
>
> ```
> // JavaScript analogy (values):
> const result = {};
> for (const key in original) {
>   result[key] = original[key];  // copy with same values
> }
>
> // TypeScript analogy (types):
> type Result = {
>   [K in keyof Original]: Original[K];  // copy with same types
> };
> ```

> 🧠 **Explain to yourself:** What is the difference between `[K in keyof T]` and `[key: string]`? When would you use which?
> **Key points:** `[K in keyof T]` iterates over KNOWN keys (finite set) | `[key: string]` allows ARBITRARY string keys | Mapped Types preserve structure | Index Signatures are open to new keys

---

## Example: Rebuilding Partial

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
}

type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type PartialUser = MyPartial<User>;
// How the compiler "thinks":
// K = "id"    → id?: number       (number comes from User["id"])
// K = "name"  → name?: string     (string comes from User["name"])
// K = "email" → email?: string    (string comes from User["email"])
// Result: { id?: number; name?: string; email?: string; }
```

> 🔬 **Experiment:** Write a Mapped Type `Stringify<T>` that turns ALL
> property types into `string`:
> `type Stringify<T> = { [K in keyof T]: string }`.
> Test it with `User`. What happens to `id`? Is the `number` information lost?

---

## Modifiers: readonly and optional

Mapped Types have four modifier variants:

```typescript annotated
// Add optional (+? or simply ?)
type AllOptional<T> = { [K in keyof T]+?: T[K] };
//                                    ^^ + is optional (shorthand: just ?)

// REMOVE optional (-?)
type AllRequired<T> = { [K in keyof T]-?: T[K] };
//                                    ^^ minus REMOVES the ? modifier

// Add readonly (+readonly or simply readonly)
type AllReadonly<T> = { +readonly [K in keyof T]: T[K] };
//                      ^^^^^^^^^ + is optional (shorthand: just readonly)

// REMOVE readonly (-readonly)
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
//                  ^^^^^^^^^ minus REMOVES the readonly modifier
```

> **Plus adds, minus removes.** That's the entire modifier logic.
> `+?` = make optional, `-?` = remove optional.
> `+readonly` = make readonly, `-readonly` = remove readonly.

> 🔍 **Deeper knowledge: Modifier Algebra**
>
> The modifiers `+` and `-` were introduced in **TypeScript 2.8** (March 2018).
> Before that you could only add `?` and `readonly`,
> but not remove them. The `-` sign was the missing half:
>
> | Modifier | Effect | Built-in as |
> |---|---|---|
> | `?` / `+?` | Make property optional | `Partial<T>` |
> | `-?` | Remove optional | `Required<T>` |
> | `readonly` / `+readonly` | Make property readonly | `Readonly<T>` |
> | `-readonly` | Remove readonly | *(no built-in!)* |
>
> The absence of a built-in `Mutable<T>` is a deliberate
> design decision: adding readonly is "safe", removing it
> is "dangerous" and should be a conscious decision.

> 🧠 **Explain to yourself:** What happens if you want to apply `+?` and `-?` simultaneously to different properties — e.g. "name" should become optional, "email" should become required? Is that possible with a single Mapped Type?
> **Key points:** No, a Mapped Type applies the same modifier to ALL keys | You need a combination (Pick + Partial + Omit) | Or Key Remapping with Conditional (Section 4) | That's why composition is so important

---

## Homomorphic Mapped Types

When you use `keyof T` as the source, TypeScript preserves the original modifiers:

```typescript annotated
interface Config {
  readonly host: string;
  port?: number;
}

type Copy<T> = { [K in keyof T]: T[K] };
type ConfigCopy = Copy<Config>;
// { readonly host: string; port?: number; }
// readonly and optional are PRESERVED!
```

This is called **homomorphic** — the Mapped Type preserves the structure of the original.
Only explicit modifiers (`+?`, `-?`, `+readonly`, `-readonly`) change anything.

> 📖 **Background: Why "homomorphic"?**
>
> The term comes from mathematics and means "structure-preserving".
> A homomorphic Mapped Type preserves the modifiers of the original — it
> "copies" the structure faithfully. This matters because it means:
> if you write `Partial<Readonly<T>>`, `readonly` is preserved.
> The modifiers **accumulate**, they don't overwrite each other.
>
> Non-homomorphic Mapped Types (e.g. `{ [K in "a" | "b"]: string }`)
> have no reference to an original type and therefore cannot
> preserve modifiers.

> 💭 **Think about it:** If `Copy<T>` preserves the modifiers, why doesn't
> `Copy<Config>` simply equal `Config`? Is it really a copy?
>
> **Answer:** It IS an identical copy — the type is structurally
> equivalent. TypeScript treats them as compatible. The difference
> only shows up when hovering in the IDE: the resolved type is displayed
> instead of the alias name. That can be useful for debugging!

---

## Background: How TypeScript's Utility Types Work

Now you understand what's happening behind the scenes:

```typescript annotated
// TypeScript's real definitions (simplified):
type Partial<T>   = { [K in keyof T]?: T[K] };           // add ?
type Required<T>  = { [K in keyof T]-?: T[K] };          // remove ?
type Readonly<T>  = { readonly [K in keyof T]: T[K] };   // add readonly
type Mutable<T>   = { -readonly [K in keyof T]: T[K] };  // remove readonly (not built-in!)
```

> ⚡ **Practical tip: Mapped Types in Angular and React**
>
> ```typescript
> // Angular Reactive Forms use Mapped Types internally:
> // FormGroup<T> maps each property to a FormControl
> type FormControls<T> = {
>   [K in keyof T]: FormControl<T[K]>;
> };
> // That's a Mapped Type!
>
> // React: Readonly<Props> for immutable component props
> // Since React 18, props are implicitly Readonly —
> // TypeScript's Readonly<T> ensures you don't accidentally
> // write props.name = "other".
> ```

---

## What you learned

- Mapped Types are **for-loops for types**: `{ [K in keyof T]: ... }`
- The syntax has three parts: **iteration** (`K in keyof T`), **modifier** (`?`, `readonly`), **value** (`T[K]`)
- `+` adds modifiers, `-` removes them — that's the entire modifier logic
- **Homomorphic** Mapped Types preserve the original modifiers (`readonly`, `?`)
- All built-in Utility Types (`Partial`, `Required`, `Readonly`) are internally Mapped Types

> 🧠 **Explain to yourself:** Now that you understand `Partial<T>` and `Required<T>`
> internally — could you also build a `ReadonlyPartial<T>` that
> does BOTH at the same time? What would the definition look like?
> **Key points:** `{ readonly [K in keyof T]?: T[K] }` — both modifiers at once | Or: `Readonly<Partial<T>>` as composition | Both lead to the same result | Composition is more readable

**Core concept to remember:** Mapped Types are the **foundation** of all Utility Types. Anyone who understands Mapped Types understands how TypeScript transforms types — not as magic, but as iteration over properties.

> 🔬 **Experiment:** Open a TypeScript file and write:
> ```typescript
> type AllString<T> = { [K in keyof T]: string };
> type Test = AllString<{ x: number; y: boolean; z: Date }>;
> ```
> Hover over `Test`. Have all types really become `string`?
> Then change `string` to `T[K][]` — what happens?

---

> **Pause point** — You now know the basic syntax of Mapped Types
> and how modifiers work. This is the foundation for everything that follows.
>
> Continue with: [Section 02 - Key Remapping](./02-key-remapping.md)