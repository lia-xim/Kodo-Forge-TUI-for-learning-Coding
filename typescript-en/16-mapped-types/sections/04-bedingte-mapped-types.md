# Section 4: Conditional Mapped Types

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Custom Utility Types](./03-eigene-utility-types.md)
> Next section: [05 - Practical Patterns](./05-praxis-patterns.md)

---

## What you'll learn here

- Conditional Types inside Mapped Types
- Selective transformation: changing only certain properties
- Property-type-dependent transformations
- Nested Conditional + Mapped patterns

---

> 📖 **Background: The Merging of Two Features**
>
> Mapped Types (TS 2.1, 2016) and Conditional Types (TS 2.8, 2018)
> were introduced independently of each other. But their **combination**
> is what makes TypeScript's type system truly powerful. It's like
> the invention of transistors and circuits — useful individually,
> revolutionary together. Conditional Types inside Mapped Types enable
> **selective, type-dependent transformations** — something barely
> possible in any other language.

> **Analogy:** Conditional Mapped Types are like a **sorting conveyor belt in a
> factory**: each item (property) passes by, a sensor checks the
> type (Conditional), and based on the result it's handled differently —
> numbers become strings, objects get frozen,
> functions stay unchanged.

## Conditionals Inside Mapped Types

You can use a Conditional Type in the value position of a Mapped Type:

```typescript annotated
type StringifyProps<T> = {
  [K in keyof T]: T[K] extends number ? string : T[K];
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                Conditional per property:
//                Is the value type number? → becomes string
//                Otherwise? → stays as is
};

interface Stats {
  name: string;
  score: number;
  active: boolean;
  points: number;
}

type StringifiedStats = StringifyProps<Stats>;
// {
//   name: string;     // was string -> stays string
//   score: string;    // was number -> becomes string
//   active: boolean;  // was boolean -> stays boolean
//   points: string;   // was number -> becomes string
// }
```

> **Think of it as:** "For each property: IF the type is number,
> make it string, ELSE leave it as is."

> 🧠 **Explain to yourself:** Why is `StringifyProps` useful? In what real-world scenario would you want to convert number properties to strings?
> **Key points:** API responses often deliver numbers as strings (JSON has no integer distinction) | Form values are always strings | CSV import: all values come as strings | Serialization: Date → string, BigInt → string

---

## Selective Readonly — Freezing Only Certain Types

```typescript
// Make only object properties readonly, primitives remain editable
type ReadonlyObjects<T> = {
  [K in keyof T]: T[K] extends object
    ? Readonly<T[K]>
    : T[K];
};

interface AppState {
  count: number;               // Primitive -> stays editable
  user: { name: string };      // Object -> becomes readonly
  tags: string[];              // Array (object) -> becomes readonly
}

type SafeState = ReadonlyObjects<AppState>;
// {
//   count: number;
//   user: Readonly<{ name: string }>;
//   tags: readonly string[];
// }
```

> 🔬 **Experiment:** Extend `ReadonlyObjects<T>` so that arrays also
> become readonly (`readonly string[]` instead of `string[]`),
> but Date objects do NOT. Hint: You need an additional
> condition: `T[K] extends Date ? T[K] : ...`.

---

## Property-Type-Based Validation

> ⚡ **Practical Tip: Validators in Angular and React**
>
> This pattern is the foundation for type-safe form validation:
> - Angular Reactive Forms use `Validators.required`, `Validators.min()` etc.
>   A Mapped Type can automatically generate the CORRECT validator type per field.
> - React Hook Form's `register()` accepts validation rules that
>   depend on the field type — a string field needs `maxLength`,
>   a number field needs `min`/`max`.

```typescript annotated
// Generate validation functions matching the property type
type Validators<T> = {
  [K in keyof T]: T[K] extends string
    ? (value: string) => boolean      // String fields get a string validator
    : T[K] extends number
    ? (value: number) => boolean      // Number fields get a number validator
    : T[K] extends boolean
    ? (value: boolean) => boolean     // Boolean fields get a boolean validator
    : (value: unknown) => boolean;    // Everything else: unknown (safe)
};

interface UserForm {
  name: string;
  age: number;
  active: boolean;
}

type UserValidators = Validators<UserForm>;
// {
//   name: (value: string) => boolean;
//   age: (value: number) => boolean;
//   active: (value: boolean) => boolean;
// }
```

> 💭 **Think about it:** What happens when a property has the type
> `string | number` (a union)? Which validator type gets chosen?
>
> **Answer:** `string | number` extends `string` is `false` (because
> `number` is not a string). `string | number` extends `number` is also
> `false`. It falls through to the `unknown` fallback. For unions you need
> either specific overloads or a more generic approach.
> This reveals an important limitation of Conditional Types: they check
> the ENTIRE type, not the individual union members (because T[K]
> is not a bare type parameter).

---

## Nesting: Conditional in the Key AND the Value

> 🔍 **Deeper Knowledge: Two Dimensions of Control**
>
> In a Mapped Type with Conditionals you have two independent
> control knobs:
> 1. **In the key (`as` clause):** The Conditional decides whether the key
>    appears in the result at all (filtering)
> 2. **In the value:** The Conditional decides which TYPE the property
>    gets (transformation)
>
> Using both at the same time is the **most powerful form** of
> Mapped Types — you filter AND transform in a single step.

You can combine Conditionals for both key filtering and value transformation:

```typescript annotated
// Keep only string properties AND convert them to Uppercase
type UppercaseStringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: Uppercase<T[K] & string>;
//                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Key filtering: only string properties
//                                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^ Value transformation: to Uppercase
};

interface Mixed {
  name: string;     // kept, becomes Uppercase
  count: number;    // removed
  label: string;    // kept, becomes Uppercase
}

type Result = UppercaseStringProps<Mixed>;
// { name: Uppercase<string>; label: Uppercase<string>; }
```

---

## Practical Pattern: Nullable Only for Optional Properties

> **Analogy:** This pattern is like an umbrella rental service:
> whoever already has an umbrella (optional = "can be missing") gets
> an extra plastic cover (null). Whoever doesn't need one (required)
> is left alone.

```typescript annotated
type NullableOptionals<T> = {
  [K in keyof T]: undefined extends T[K]
//                ^^^^^^^^^^^^^^^^^^^^^ "Is undefined part of T[K]?"
//                (= is the property optional?)
    ? T[K] | null      // Yes, optional → also allow null
    : T[K];            // No, required → leave unchanged
};

interface User {
  id: number;
  name: string;
  bio?: string;
  website?: string;
}

type NullableUser = NullableOptionals<User>;
// {
//   id: number;                        // Required -> unchanged
//   name: string;                      // Required -> unchanged
//   bio?: string | null;               // Optional -> null added
//   website?: string | null;           // Optional -> null added
// }
```

> **Trick:** `undefined extends T[K]` checks whether K is optional — because
> optional properties implicitly have `| undefined` in their type.

> 🧠 **Explain to yourself:** What is the difference between
> `undefined extends T[K]` and `T[K] extends undefined`?
> **Key points:** `undefined extends T[K]` asks "Is undefined PART of T[K]?" | `T[K] extends undefined` asks "Is T[K] ONLY undefined?" | The first matches `string | undefined` (optional) | The second only matches `undefined` alone | Direction matters!

---

## What you've learned

- **Conditional in the value**: `T[K] extends X ? Y : Z` — type-safe value transformation per property
- **Conditional in the key**: `as T[K] extends X ? K : never` — type-safe key filtering
- Both are **combinable** for maximum precision (filter AND transform)
- `undefined extends T[K]` is the standard trick for checking whether a property is optional
- The combination of Mapped Types + Conditional Types makes TypeScript uniquely powerful

> 🧠 **Explain to yourself:** You now have three tools for Mapped Types:
> modifiers (`?`, `readonly`), key remapping (`as`), Conditional Types.
> In what order are they applied? What gets evaluated first?
> **Key points:** 1. Iteration (`K in keyof T`) | 2. Key remapping (`as ...`) determines whether/which key | 3. Modifiers (`?`, `readonly`) are applied to the new key | 4. Conditional in the value determines the property type

**Core concept to remember:** Conditional Mapped Types are the "if-else" inside the type loop. They allow DIFFERENT properties to be treated DIFFERENTLY — just like `Array.map(item => item.type === 'a' ? handleA(item) : handleB(item))`.

> 🔬 **Experiment:** Build a `SerializeType<T>` that converts Date properties
> to `string` and keeps everything else:
> `type SerializeType<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] }`.
> Test it with `{ name: string; createdAt: Date; count: number }`.

---

> **Pause point** — You have now learned all the building blocks of Mapped Types.
> In the final section you'll see how they come together in practice.
>
> Continue with: [Section 05 - Practical Patterns](./05-praxis-patterns.md)