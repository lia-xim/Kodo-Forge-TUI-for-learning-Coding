# Section 3: The Big Comparison

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Interfaces Deep Dive](./02-interfaces-deep-dive.md)
> Next section: [04 - Decision Matrix](./04-entscheidungsmatrix.md)

---

## What you'll learn here

- A **complete comparison table** of all differences
- Why **extends is faster than &** for the compiler
- How error messages differ between `type` and `interface`
- When the differences are **truly** relevant in practice

---

## The Big Comparison Table

| Feature | `type` | `interface` |
|---|---|---|
| Primitive Aliases | `type ID = string` | Not possible |
| Union Types | `type A = B \| C` | Not possible |
| Intersection Types | `type A = B & C` | Not possible (but `extends`) |
| Mapped Types | `type R = { [K in keyof T]: ... }` | Not possible |
| Conditional Types | `type R = T extends U ? A : B` | Not possible |
| Tuple Types | `type T = [string, number]` | Not possible |
| Declaration Merging | Not possible | Yes — can be declared multiple times |
| extends | Not possible (but `&`) | `interface B extends A` |
| implements (class) | Yes (object types only) | Yes |
| Computed Properties | Yes | Yes |
| Generics | Yes | Yes |
| Index Signatures | Yes | Yes |
| Call Signatures | Yes | Yes |
| Construct Signatures | Yes | Yes |
| Performance | Slower with `&` | Faster with `extends` |
| Error Messages | Sometimes more cryptic | Usually clearer |

> 🧠 **Explain it to yourself:** Which rows in the table are most relevant to YOUR
> daily work? Which capability do you use most often that only one
> side has?
> **Key points:** Union Types (type-exclusive) are very common |
> Declaration Merging (interface-exclusive) is rarer but critical |
> For pure object shapes both are interchangeable

---

## Performance: extends is faster than &

This is one of the lesser-known but **practically relevant** differences.
The TypeScript team has documented this in the official Performance Wiki:

```typescript annotated
// SLOWER: Intersection with &
type UserWithTimestamps = User & {
  createdAt: Date;
  updatedAt: Date;
};
// ^ The compiler must recalculate the intersection EVERY time it's used.
// No caching possible.

// FASTER: Interface with extends
interface UserWithTimestamps extends User {
  createdAt: Date;
  updatedAt: Date;
}
// ^ The compiler creates a fixed type and caches it.
// Subsequent uses read from the cache.
```

> 📖 **Background: Why is extends faster?**
>
> The TypeScript compiler handles `extends` and `&` in completely
> different ways internally:
>
> **extends:** When first encountered, the compiler creates a **flat
> type cache**. All properties are merged into a single structure
> and stored. Every subsequent use reads from the cache.
>
> **& (Intersection):** The compiler must **resolve the intersection anew
> every time**. For `A & B & C`, it first computes `A & B`, then merges
> the result with `C`. This is barely noticeable for simple types,
> but in large projects with deep inheritance chains (e.g., 10+ levels)
> it can measurably increase compile time.
>
> The TypeScript team therefore recommends in their official
> Performance documentation: "Prefer interfaces over type aliases
> for extending types."
>
> Source: github.com/microsoft/TypeScript/wiki/Performance

### When is the performance difference relevant?

Be honest: in most projects you won't notice a difference.
The difference becomes relevant with:

- **Very large projects** (1000+ files, deep type hierarchies)
- **Generic library code** that gets instantiated hundreds of times
- **Complex intersection chains** with 5+ types

```typescript
// Problematic in large projects:
type HugeType = A & B & C & D & E & F & G & H;
// ^ 8-way intersection = 7 computation steps on EVERY use

// Better:
interface HugeType extends A, B, C, D, E, F, G, H {}
// ^ Computed once, then cached
```

---

## Error Messages: interface is often clearer

A frequently overlooked practical difference: the compiler's
error messages differ.

### Example: Missing property

```typescript
// With interface:
interface UserI {
  name: string;
  age: number;
}

// const u: UserI = { name: "Max" };
// Error: Property 'age' is missing in type '{ name: string; }'
//        but required in type 'UserI'.
// ^ Clear: "missing in UserI"

// With type:
type UserT = {
  name: string;
  age: number;
};

// const u: UserT = { name: "Max" };
// Error: Property 'age' is missing in type '{ name: string; }'
//        but required in type 'UserT'.
// ^ Similarly clear.
```

The difference becomes more pronounced with **complex types**:

```typescript
// With intersection (type):
type Base = { id: string };
type WithName = { name: string };
type WithAge = { age: number };
type Complex = Base & WithName & WithAge;

// const c: Complex = { id: "1", name: "Max" };
// Error: ... but required in type 'Base & WithName & WithAge'
// ^ The ENTIRE intersection is shown. Can be long and confusing.

// With extends (interface):
interface ComplexI extends Base, WithName, WithAge {}

// const c: ComplexI = { id: "1", name: "Max" };
// Error: ... but required in type 'ComplexI'
// ^ Just the interface name. Much shorter.
```

> ⚡ **Practical tip:** When you hover over a variable in VSCode,
> the tooltip shows the **interface name** for interfaces.
> For complex type aliases it often shows the **resolved type**
> (the full structure). This can become cluttered for large types.
> Interfaces retain their name in tooltips.

> **Experiment:** Paste the following into the TypeScript Playground and hover
> your mouse over variables `a` and `b` — notice the tooltip difference:
>
> ```typescript
> // Case 1: Interface is clearly better — library extension
> interface RequestBase { url: string; method: string }
> interface AuthRequest extends RequestBase { token: string }
> // Interface is the only sensible choice here because:
> // - Other modules can extend AuthRequest via Declaration Merging
> // - The tooltip cleanly shows "AuthRequest", not the whole structure
>
> const a: AuthRequest = { url: "/api", method: "GET", token: "abc" };
>
> // Case 2: Type is clearly better — Discriminated Union
> type ApiResult =
>   | { status: "ok"; data: string }
>   | { status: "err"; message: string };
> // Type is the only choice here — interface can't do unions.
>
> function handle(r: ApiResult) {
>   if (r.status === "ok") console.log(r.data);
>   //                                    ^ TypeScript knows 'data' here
>   else console.error(r.message);
>   //                   ^ TypeScript knows 'message' here
> }
>
> const b: ApiResult = { status: "ok", data: "Result" };
> ```
>
> Then change `type ApiResult` to `interface ApiResult` and observe
> the compiler error — you'll see the difference in real time.

---

## Conflict behavior: extends vs &

What happens when properties collide?

### extends: Strict checking

```typescript
interface A {
  id: string;
}

// interface B extends A {
//   id: number;
// ^ Error! 'number' is not assignable to 'string'.
// extends does NOT allow incompatible overrides.
// }

// Compatible narrowing is fine:
interface C extends A {
  id: "admin" | "user";
// ^ OK! "admin" | "user" is a subtype of string.
}
```

### & (Intersection): Silent merging

```typescript annotated
type X = { id: string };
type Y = { id: number };
type Z = X & Y;
// ^ No error! But id is now 'string & number' = 'never'.

// const z: Z = { id: ??? };
// ^ There is no value that is simultaneously a string AND a number.
// The type is un-constructable, but TypeScript only complains
// when you actually try to create an object.
```

> 🧠 **Explain it to yourself:** Which behavior do you prefer — the
> immediate error from `extends` or the silent merging of `&`?
> In which situation is which behavior more helpful?
> **Key points:** extends gives immediate feedback | & is more flexible
> but can produce hidden never types | extends is safer for
> inheritance hierarchies | & is useful for mixins

---

## Redeclaring vs. Extending

A subtle difference that often causes confusion:

```typescript
// interface: Redeclaring ADDS to it (Declaration Merging)
interface User { name: string; }
interface User { age: number; }
// User now has: name + age

// type: Redeclaring is an ERROR
type User2 = { name: string };
// type User2 = { age: number };  // Error: Duplicate identifier

// If you want to extend a type alias:
type User2Extended = User2 & { age: number };
// ^ New name required!
```

---

## What you learned

- `type` can do **more** (unions, mapped types, conditionals) — `interface` can do **declaration merging**
- `extends` is **faster** than `&` for the compiler (caching)
- **Error messages** are often clearer and shorter with interfaces
- `extends` checks conflicts **immediately** — `&` produces silent `never` types
- In practice both are largely interchangeable for **simple object types**

> 🧠 **Explain it to yourself:** Someone says "Interfaces are always better because
> they're faster." Is that true? In which cases MUST you use `type`?
> **Key points:** The performance advantage only applies to extends vs & |
> Union Types, Mapped Types, Conditional Types are ONLY possible with type |
> "Always interface" breaks down as soon as you need unions

**Core concept to remember:** The choice between `type` and `interface` is rarely
a performance decision. It's a question of **capabilities**: what does
your type need to do?

---

> **Pause point** — Good moment for a break. You now know all
> technical differences in detail.
>
> Continue with: [Section 04: Decision Matrix](./04-entscheidungsmatrix.md)