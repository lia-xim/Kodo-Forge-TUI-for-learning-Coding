# Section 1: Type Aliases Deep Dive

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Interfaces Deep Dive](./02-interfaces-deep-dive.md)

---

## What you'll learn here

- What the `type` keyword actually does and what an **alias** means
- How to create **Primitive Aliases**, **Union Types**, and **Intersection Types**
- Why **Mapped Types** and **Conditional Types** only work with `type`

---

## The type Keyword: A Name for a Type

The word "alias" is the key to understanding this. A Type Alias
**does not create a new type** — it gives an existing type
**a name**. It's like a nickname: the person doesn't change,
they just get a shorter name.

```typescript annotated
type UserID = string;
// ^ No new type! UserID IS string. Just a different name.

type Age = number;
// ^ Age IS number. You could write number everywhere instead.

let id: UserID = "abc-123";
// ^ Identical to: let id: string = "abc-123"

let myId: string = id;
// ^ No error! UserID and string are THE SAME type.
```

> 📖 **Background: Why "alias" and not "new type"?**
>
> In languages like Haskell or Rust you can create truly NEW types using
> `newtype` or `struct` that are incompatible with the original type.
> TypeScript deliberately takes a different approach: its type system is
> **structural** (structural typing), not nominal. Two types are equal
> if they have the same structure — regardless of name.
>
> This means: `type UserID = string` and `type OrderID = string` are
> THE SAME type to TypeScript. You can assign a UserID to an OrderID
> without TypeScript complaining. If you want to prevent that, you need
> "Branded Types" (a pattern for later lessons).

---

## Primitive Aliases — simple, but powerful

Primitive Aliases are the simplest form of Type Aliases.
They give a primitive type a meaningful name:

```typescript annotated
type Milliseconds = number;
type Pixels = number;
type EmailAddress = string;
type CssColor = string;
// ^ All four are "just" number or string — but the code becomes MORE READABLE.

function delay(ms: Milliseconds): Promise<void> {
// ^ Immediately clear: milliseconds are expected here, not seconds!
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setWidth(element: HTMLElement, width: Pixels): void {
// ^ Clear: pixels, not percent or rem.
  element.style.width = `${width}px`;
}
```

> **Experiment:** Paste the following into the TypeScript Playground (typescriptlang.org/play):
>
> ```typescript
> // Type Alias: Defined once, cannot be redeclared
> type Config = { host: string; port: number };
>
> // Attempt: Declare a type alias a second time
> type Config = { database: string };
> // ^ What does the compiler say? Try it out!
>
> // For comparison: Interface can be declared multiple times
> interface ConfigI { host: string; port: number }
> interface ConfigI { database: string }
> // ^ No error! ConfigI now has host, port AND database.
>
> const cfg: ConfigI = {
>   host: "localhost",
>   port: 5432,
>   database: "myapp",  // all three are required
> };
> ```
>
> Declaration Merging is the unique selling point of `interface` —
> and precisely why the keyword still exists at all.

> 🧠 **Explain it to yourself:** Why is `type Milliseconds = number` still
> useful, even though TypeScript treats `Milliseconds` and `number` as equal?
> What kind of "protection" does it offer — and what kind does it not?
> **Key points:** Documentation value for developers | No runtime protection |
> No compile-time protection (string = string) | Branded Types for real protection

---

## Union Types — the strength of type

This is where `type` really becomes powerful. Union Types are **only possible with type**,
not with `interface`:

You already know Union Types from L07 — there you learned `string | number` as a basic principle. What becomes relevant here is why Union Types are *exclusively* expressible with `type`, and why that is crucial for Discriminated Unions (more on those in L12).

```typescript annotated
type Status = "active" | "inactive" | "banned";
// ^ A union of three string literals. Only these three values are valid.

type StringOrNumber = string | number;
// ^ A union of two types. Only possible with type, not with interface!

type ApiResponse =
  | { status: "success"; data: unknown }
  | { status: "error"; message: string };
// ^ Discriminated Union: the 'status' field determines the rest of the structure.
// This is one of the most powerful patterns in TypeScript.

function handleResponse(response: ApiResponse) {
  if (response.status === "success") {
// ^ TypeScript knows: here response has a 'data' field
    console.log(response.data);
  } else {
// ^ TypeScript knows: here response has a 'message' field
    console.error(response.message);
  }
}
```

> 📖 **Background: Why can't interface do unions?**
>
> Interfaces describe the **shape of an object** — they say "an object
> has these properties". A Union Type on the other hand says "the value is EITHER
> this OR that". These are fundamentally different concepts. An interface
> cannot express "I am sometimes a string and sometimes a number".
> It can only say "I am an object with these fields".
>
> That is why Discriminated Unions — one of the most powerful
> patterns in TypeScript — are always written with `type`.

---

## Intersection Types — combining types

While Union Types express "either A or B", Intersection
Types say "both A and B":

```typescript annotated
type HasName = { name: string };
type HasAge = { age: number };
type HasEmail = { email: string };

type Person = HasName & HasAge & HasEmail;
// ^ Person has ALL properties: name, age AND email.

const user: Person = {
  name: "Max",
  age: 30,
  email: "max@example.com",
// ^ All three fields are required.
};
```

Intersections with `&` are the equivalent of `extends` for interfaces.
But there is an **important difference** that we cover in Section 03:
`extends` is faster for the compiler.

```typescript annotated
type Timestamped<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};
// ^ A generic Intersection Type: adds timestamps to any type.

type TimestampedPerson = Timestamped<Person>;
// ^ Has all Person fields PLUS createdAt and updatedAt.
```

> 🧠 **Explain it to yourself:** What happens when you combine two types with `&`
> that have a field with the same name but different types?
> e.g. `type A = { id: string } & { id: number }` — what is the type of `id`?
> **Key points:** id becomes `string & number` = `never` | The object becomes
> un-creatable | No compiler error, but impossible to use

---

## Mapped Types — only possible with type

Mapped Types are one of TypeScript's most advanced capabilities
and work **exclusively with type**, not with interface:

```typescript annotated
type User = {
  name: string;
  age: number;
  email: string;
};

type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
// ^ Iterates over ALL keys of User and makes them readonly.
// K is "name" first, then "age", then "email".
// User[K] is the respective type: string, number, string.
};

// ReadonlyUser is now:
// { readonly name: string; readonly age: number; readonly email: string }

type OptionalUser = {
  [K in keyof User]?: User[K];
// ^ Makes all properties optional.
};

// OptionalUser is now:
// { name?: string; age?: number; email?: string }
```

TypeScript ships many of these Mapped Types as built-in **Utility Types**:

```typescript
// These are Mapped Types built into TypeScript:
type A = Readonly<User>;     // All properties readonly
type B = Partial<User>;      // All properties optional
type C = Required<User>;     // All properties required
type D = Pick<User, "name" | "email">;  // Only name and email
type E = Omit<User, "age">;  // Everything except age
type F = Record<string, number>;  // { [key: string]: number }
```

> 📖 **Background: Why can't interface do Mapped Types?**
>
> Interfaces use a **static declaration**: you write out each
> property individually. Mapped Types use **iteration** over
> another type. The `[K in keyof T]` construct is a kind of "loop"
> at the type level — and such dynamic constructs are only possible in
> Type Aliases. It's like the difference between a hand-written list
> and a formula in a spreadsheet.

---

## Conditional Types — the crown of Type Aliases

Conditional Types are the most complex capability and are only possible with `type`:

```typescript annotated
type IsString<T> = T extends string ? "yes" : "no";
// ^ If T is a string, the type is "yes". Otherwise "no".

type A = IsString<string>;   // "yes"
type B = IsString<number>;   // "no"
type C = IsString<"hello">;  // "yes" — "hello" extends string

// Practical example: Extract the return type of a function
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
// ^ 'infer R' pulls out the return type. Magic!

type FnReturn = ReturnOf<() => string>;  // string
```

> 💭 **Think about it:** Why do you need Conditional Types? Can you imagine
> a case where you need to determine the return type of a function
> dynamically?
>
> **Answer:** Libraries like React use Conditional Types extensively.
> For example, `useState<T>` determines the type of the setter based on T.
> Or Prisma generates types based on your database schema —
> the return type of a query depends on the selected fields.

---

## What you've learned

- `type` does not create a new type, but an **alias** (name)
- **Primitive Aliases** improve readability
- **Union Types** (`|`) and **Intersection Types** (`&`) are only possible with `type`
- **Mapped Types** and **Conditional Types** are exclusively `type` constructs
- TypeScript ships many Mapped Types as built-in **Utility Types** (`Readonly`, `Partial`, `Pick`, etc.)

> 🧠 **Explain it to yourself:** Name three things that `type` can do but `interface` cannot.
> Why is `type` then NOT always the better choice?
> **Key points:** Unions, Mapped Types, Conditional Types | interface has
> Declaration Merging + better performance with extends | Both have
> their strengths

**Core concept to remember:** `type` is the more versatile tool — it can express
everything TypeScript has to offer in terms of types. But versatility alone
doesn't make it the best choice for every situation.

---

> **Break point** — Good moment for a break. You now know the
> full range of Type Aliases.
>
> Continue with: [Section 02: Interfaces Deep Dive](./02-interfaces-deep-dive.md)