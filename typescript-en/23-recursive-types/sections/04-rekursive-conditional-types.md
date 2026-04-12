# Section 4: Recursive Conditional Types

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Deep Operations](./03-deep-operationen.md)
> Next section: [05 - Limits and Performance](./05-grenzen-und-performance.md)

---

## What you'll learn here

- How to build a **Flatten type** that resolves nested arrays
- How **Paths\<T\>** computes type-safe dot-separated paths (`'a.b.c'`)
- How **PathValue\<T, P\>** determines the value type at a given path
- How **recursive string manipulation** works with Template Literal Types

---

## The Royal Class: Recursion + Conditional Types
<!-- section:summary -->
In section 3 you combined Mapped Types with recursion. Now

<!-- depth:standard -->
In section 3 you combined Mapped Types with recursion. Now
we go one step further: **Conditional Types** that call
themselves. This is the most powerful combination in TypeScript's
type system.

<!-- depth:vollstaendig -->
> **Background: TypeScript 4.1 (November 2020)**
>
> Before TypeScript 4.1, recursive Conditional Types were **forbidden** —
> the compiler rejected them with "Type alias circularly references itself".
> With version 4.1, the team introduced two groundbreaking features:
>
> 1. **Template Literal Types** (`\`hello ${string}\``)
> 2. **Recursive Conditional Types** (a Conditional Type may reference
>    itself in its resolution)
>
> Together they opened up an entirely new world of type-level
> programming. Suddenly you could manipulate strings, flatten arrays,
> and compute object paths — all at the type level.

---

<!-- /depth -->
## Flatten: Resolving Nested Arrays
<!-- section:summary -->
The simplest example of recursive Conditional Types is **Flatten** —

<!-- depth:standard -->
The simplest example of recursive Conditional Types is **Flatten** —
a type that "flattens" nested arrays:

```typescript annotated
type Flatten<T> = T extends (infer U)[]
  // ^ Is T an array? If so, extract the element type U
  ? Flatten<U>
  // ^ YES: Recursion! Check whether U itself is an array
  : T;
  // ^ NO: Base case — T is no longer an array

// Testing:
type A = Flatten<string[]>;           // string
// ^ string[] → Flatten<string> → string (no longer an array)

type B = Flatten<number[][]>;         // number
// ^ number[][] → Flatten<number[]> → Flatten<number> → number

type C = Flatten<boolean[][][]>;      // boolean
// ^ Three levels: boolean[][][] → boolean[][] → boolean[] → boolean

type D = Flatten<string>;             // string
// ^ Not an array → base case immediately
```

The recursion removes **one array level per step** until
a non-array type remains.

---

<!-- /depth -->
## Flatten with Depth Limit
<!-- section:summary -->
In practice you often only want to flatten **a certain depth**

<!-- depth:standard -->
In practice you often only want to flatten **a certain depth**
(like `Array.prototype.flat(depth)`):

```typescript annotated
type FlatArray<Arr, Depth extends number> =
  Depth extends 0
    ? Arr
    // ^ Depth 0: Nothing left to flatten (base case)
    : Arr extends readonly (infer InnerArr)[]
      ? FlatArray<InnerArr, MinusOne<Depth>>
      // ^ Array? → Recursion with depth - 1
      : Arr;
      // ^ Not an array? → Return directly

// Helper: reduce depth by 1 (tuple trick)
type MinusOne<N extends number> =
  [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N];
  // ^ Index access: MinusOne<3> = [never,0,1,2,...][3] = 2
  // ^ This is a well-known trick for arithmetic at the type level

// Testing:
type E = FlatArray<number[][][], 1>;  // number[][]
// ^ Only one level removed

type F = FlatArray<number[][][], 2>;  // number[]
// ^ Two levels removed

type G = FlatArray<number[][][], 3>;  // number
// ^ Three levels — completely flat
```

<!-- depth:vollstaendig -->
> **Think about it:**
>
> Why isn't `FlatArray` from `lib.es2019.d.ts` simply
> `T extends (infer U)[] ? FlatArray<U> : T`?
>
> Hint: `[1, [2], [[3]]].flat(1)` yields `[1, 2, [3]]` —
> not `[1, 2, 3]`. The built-in `flat()` method has a
> **controlled depth**, not unlimited recursion.

---

<!-- /depth -->
## Paths\<T\>: Type-Safe Object Paths
<!-- section:summary -->
Now it gets really interesting. Imagine you want to compute all

<!-- depth:standard -->
Now it gets really interesting. Imagine you want to compute all
possible dot-separated paths of an object as a type:

```typescript annotated
type Paths<T> = T extends object
  ? {
      [K in keyof T & string]:
        // ^ Iterate over all string keys of T
        | K
        // ^ The key itself is a valid path
        | `${K}.${Paths<T[K]>}`
        // ^ RECURSION + Template Literal: "key.subpath"
    }[keyof T & string]
    // ^ [keyof T & string] "collects" all values of the Mapped Type
  : never;
  // ^ A primitive type has no paths

// Testing:
type UserPaths = Paths<{
  name: string;
  address: {
    street: string;
    city: string;
    country: { code: string };
  };
}>;
// Result:
// "name" | "address" | "address.street" | "address.city"
// | "address.country" | "address.country.code"
```

This is **Template Literal Types + Recursion + Mapped Types** —
three features working together.

---

<!-- /depth -->
## Explain it to yourself: How does Paths compute the paths?

> **Explain it to yourself:**
>
> How does `Paths<{ a: { b: { c: string } } }>` compute the type
> `'a' | 'a.b' | 'a.b.c'`?
>
> Trace the recursion step by step:
> 1. K = "a" → Paths: "a" | `a.${Paths<{b:{c:string}}>}`
> 2. For Paths<{b:{c:string}}>: K = "b" → "b" | `b.${Paths<{c:string}>}`
> 3. For Paths<{c:string}>: K = "c" → "c" | `c.${Paths<string>}`
> 4. Paths<string> = never (not an object!)
> 5. Substituting back: "c" | "c.never" → "c"
> 6. "b" | "b.c" → union with "a" | "a.b" | "a.b.c"

---

## PathValue\<T, P\>: Getting the Value at a Path
<!-- section:summary -->
If we can compute paths, we can also determine the **type of the

<!-- depth:standard -->
If we can compute paths, we can also determine the **type of the
value** at a given path:

```typescript annotated
type PathValue<T, P extends string> =
  P extends `${infer Head}.${infer Tail}`
    // ^ Does the path contain a dot? Decompose into "Head.Tail"
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      // ^ RECURSION: Go one level deeper with the remaining path
      : never
    : P extends keyof T
      ? T[P]
      // ^ No dot: P is the last key → return the value
      : never;

// Testing:
type User = {
  name: string;
  address: {
    street: string;
    zip: number;
    country: { code: string; name: string };
  };
};

type A = PathValue<User, "name">;                  // string
type B = PathValue<User, "address.street">;         // string
type C = PathValue<User, "address.zip">;            // number
type D = PathValue<User, "address.country.code">;   // string
type E = PathValue<User, "invalid">;                // never
```

---

<!-- /depth -->
## Recursive String Manipulation
<!-- section:summary -->
Template Literal Types also enable **string manipulation at the

<!-- depth:standard -->
Template Literal Types also enable **string manipulation at the
type level**:

```typescript annotated
// Split: split a string at a delimiter
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    // ^ Find the delimiter D in string S
    ? [Head, ...Split<Tail, D>]
    // ^ RECURSION: First part + recursively split the rest
    : [S];
    // ^ No more delimiter → last element

type Result = Split<"a.b.c.d", ".">;
// ["a", "b", "c", "d"]

// Join: combine tuple into string (counterpart)
type Join<T extends string[], D extends string> =
  T extends []
    ? ""
    : T extends [infer Head extends string]
      ? Head
      : T extends [infer Head extends string, ...infer Tail extends string[]]
        ? `${Head}${D}${Join<Tail, D>}`
        // ^ RECURSION: First element + delimiter + rest
        : never;

type Joined = Join<["a", "b", "c"], ".">;
// "a.b.c"
```

---

<!-- /depth -->
## Experiment: Paths in Action

> **Experiment:**
>
> Implement `Paths` and test it with a nested object:
>
> ```typescript
> type Paths<T> = T extends object
>   ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
>   : never;
>
> type PathValue<T, P extends string> =
>   P extends `${infer Head}.${infer Tail}`
>     ? Head extends keyof T
>       ? PathValue<T[Head], Tail>
>       : never
>     : P extends keyof T
>       ? T[P]
>       : never;
>
> // Test type
> type Config = {
>   database: {
>     host: string;
>     port: number;
>     credentials: { user: string; password: string };
>   };
>   cache: { ttl: number; maxSize: number };
> };
>
> // Test: hover over these types
> type AllPaths = Paths<Config>;
> type HostType = PathValue<Config, "database.host">;
> type PasswordType = PathValue<Config, "database.credentials.password">;
>
> // Type-safe get function:
> function get<T, P extends Paths<T> & string>(
>   obj: T,
>   path: P
> ): PathValue<T, P> {
>   return path.split(".").reduce(
>     (acc, key) => (acc as any)[key],
>     obj as any
>   ) as PathValue<T, P>;
> }
>
> declare const config: Config;
> const host = get(config, "database.host");       // string
> const port = get(config, "database.port");        // number
> // get(config, "database.invalid");                // Error!
> ```
>
> This is exactly the pattern that libraries like **React Hook Form**
> use for `register('address.street')`!

---

## Framework Connection: React Hook Form and Paths

> **In React with React Hook Form:**
>
> ```typescript
> // React Hook Form uses EXACTLY this Paths pattern:
> import { useForm, Path } from "react-hook-form";
>
> type FormValues = {
>   user: {
>     name: string;
>     address: { street: string; city: string };
>   };
>   newsletter: boolean;
> };
>
> function MyForm() {
>   const { register } = useForm<FormValues>();
>
>   return (
>     <form>
>       <input {...register("user.name")} />
>       {/* ^ Autocomplete shows: "user" | "user.name" | ... */}
>       <input {...register("user.address.street")} />
>       {/* ^ Type-safe all the way down */}
>       {/* register("user.invalid") → Compile Error! */}
>     </form>
>   );
> }
> ```
>
> **In Angular** with Reactive Forms there are similar patterns:
>
> ```typescript
> // Angular 14+ Typed Reactive Forms
> const form = new FormGroup({
>   user: new FormGroup({
>     name: new FormControl(''),
>     address: new FormGroup({
>       street: new FormControl(''),
>     }),
>   }),
> });
>
> // form.get('user.name') — Angular uses string paths,
> // but since Angular 14 they are (partially) typed
> ```

---

## Summary

### What you learned

You've learned the **most powerful recursive type patterns**:

- **Flatten\<T\>** removes array levels through recursive Conditional Types
- **Paths\<T\>** computes all possible dot-separated paths of an object
- **PathValue\<T, P\>** determines the value type at a given path
- **Template Literal Types + Recursion** enable string manipulation at the type level
- Libraries like React Hook Form use exactly these patterns

> **Core concept:** Recursive Conditional Types combine the
> `extends` check with self-reference. The key is always:
> **decompose the problem** (infer Head/Tail), **process one part**,
> **recurse over the rest**. The base case is the situation where
> there is nothing left to decompose.

---

> **Pause point** — You've now seen the full power of recursive types.
> But power comes with responsibility: in the next
> section you'll learn about the **limits and performance pitfalls**.
>
> Continue: [Section 05 - Limits and Performance](./05-grenzen-und-performance.md)