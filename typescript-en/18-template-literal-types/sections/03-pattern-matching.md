# Section 3: Pattern Matching with Strings

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - String Utility Types](./02-utility-types.md)
> Next section: [04 - Type-Safe Event Systems](./04-event-names.md)

---

## What you'll learn here

- How `infer` inside Template Literals **extracts** string parts — at the type level
- The core principle of recursive types for string parsing (Split, Trim, Replace)
- How to use `DotPath` to generate type-safe paths for nested objects
- Where the limits of recursion lie and how TypeScript protects you

---

## Background story: String parsers without runtime

Imagine you're writing a function `getPath(obj, "user.address.city")`. At runtime, that's easy — just split on the dot and iterate. But how do you get TypeScript to correctly infer the **return type** of that function? If `obj` is a `{ user: { address: { city: string } } }`, the return type should be `string` — not `unknown`.

Before TypeScript 4.1, this was simply not possible. You had to work around it with overloads or use `any`. It was one of the most-requested feature requests in the TypeScript community.

The key to the solution was `infer` in Template Literals: you can tell the compiler "match this string against this pattern, and extract parts of it as new type variables". This is essentially a **type-level regex** — but static, safe, and fully integrated into the compiler.

The result: libraries like `zod`, `prisma`, and `tRPC` use this technique extensively to generate fully typed interfaces from string patterns. What once seemed "unsolvable" is now standard tooling.

---

## `infer` in Template Literals — the core principle

You already know `infer` from Conditional Types (L17). In Template Literals it works analogously: you describe a pattern, and TypeScript **extracts** the matching part:

```typescript annotated
type ExtractPrefix<T extends string> =
  T extends `${infer Prefix}_${string}`
  //                ^^^^^^^^^             // 'Prefix' becomes the part BEFORE the underscore
  //                          ^^^^^^^^    // The part after the underscore is irrelevant
    ? Prefix    // Match: return Prefix
    : never;    // No match: never (empty set)

type A = ExtractPrefix<"user_name">;     // "user"
type B = ExtractPrefix<"get_value">;     // "get"
type C = ExtractPrefix<"admin_user_id">; // "admin" (only the FIRST underscore!)
type D = ExtractPrefix<"noprefix">;      // never
```

The key point: `${infer Prefix}` means "match any number of characters and name them `Prefix`". TypeScript automatically finds the shortest possible match — which explains why `"admin_user_id"` becomes `"admin"` and not `"admin_user"`.

> **Explain to yourself:** Why does `ExtractPrefix<"admin_user_id">` produce `"admin"` and not `"admin_user"`? What regex term would you use to describe this behavior?
>
> **Key points:** Template Literal infer is "non-greedy" by default (finds the shortest match). `${infer Prefix}_${string}` matches at the FIRST underscore. This is identical to the regex concept of "lazy matching" with `?`. To match the last underscore, you would need to use recursion.

---

## Recursive types: Split

For the next step we need recursion. TypeScript allows a type to reference itself — as long as the recursion terminates at a base case:

```typescript annotated
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
  //                ^^^^                       // Part before the delimiter
  //                         ^                 // The delimiter itself
  //                          ^^^^^^^^^^^      // Everything after
    ? [Head, ...Split<Tail, D>]
    //        ^^^^^^^^^^^^^^^^^^  // Recursion: Tail is also split
    : [S];
    //  ^^  // Base case: no more delimiter -> [S] as the last element

type A = Split<"a.b.c", ".">;   // ["a", "b", "c"]
type B = Split<"hello", ".">;   // ["hello"] — no dot -> base case
type C = Split<"x-y-z", "-">;   // ["x", "y", "z"]
type D = Split<"a..b", ".">;    // ["a", "", "b"] — empty string between the dots
```

The recursion works like this:
1. `Split<"a.b.c", ".">` — finds dot, splits into `["a", ...Split<"b.c", ".">]`
2. `Split<"b.c", ".">` — finds dot, splits into `["b", ...Split<"c", ".">]`
3. `Split<"c", ".">` — no more dot, base case: `["c"]`
4. Assembled: `["a", "b", "c"]`

> **Think about it:** What happens when you evaluate `Split<"", ".">`? Is the empty string a valid string? And what happens with `Split<"a", "ab">` — when the delimiter is longer than the string?
>
> **Answer:** `Split<"", ".">` yields `[""]` — the empty string matches the base case (no delimiter). `Split<"a", "ab">` also yields `["a"]` — because `"a"` cannot satisfy the pattern `${infer Head}${"ab"}${infer Tail}` (the sequence "ab" doesn't appear in "a").

---

## Trim: removing whitespace

Another classic pattern — removing spaces from the start and end:

```typescript annotated
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}`
  //          ^^             // Matches exactly one space at the start
    ? TrimLeft<Rest>         // Recursion: remove another space
    : S;                     // Base case: no leading space

type TrimRight<S extends string> =
  S extends `${infer Rest} `
    ? TrimRight<Rest>
    : S;

type Trim<S extends string> = TrimLeft<TrimRight<S>>;
//                             Trim right first, then left

type A = Trim<"  hello  ">; // "hello"
type B = Trim<"  hello">;   // "hello"
type C = Trim<"hello  ">;   // "hello"
type D = Trim<"hello">;     // "hello" — unchanged, base case
```

---

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> type Replace<
>   S extends string,
>   From extends string,
>   To extends string
> > = S extends `${infer Head}${From}${infer Tail}`
>   ? `${Head}${To}${Tail}`
>   : S;
>
> type A = Replace<"hello world", "world", "TypeScript">;
> // What does this produce?
>
> type ReplaceAll<
>   S extends string,
>   From extends string,
>   To extends string
> > = S extends `${infer Head}${From}${infer Tail}`
>   ? ReplaceAll<`${Head}${To}${Tail}`, From, To>
>   : S;
>
> type B = ReplaceAll<"a.b.c", ".", "/">;
> // What does this produce?
>
> // Now the difference: What happens with Replace vs ReplaceAll for
> // a string that contains the pattern multiple times?
> type C = Replace<"a.b.c", ".", "/">;    // Only the first replacement
> type D = ReplaceAll<"a.b.c", ".", ">">; // All replacements
> ```
>
> Explain the difference between `Replace` and `ReplaceAll` in terms of recursion.

---

## DotPath: the most important pattern in practice

All the previous examples were instructive — but this one you'll actually see in real projects. `DotPath` generates all possible paths through a nested object as a type:

```typescript annotated
type DotPath<T, Prefix extends string = ""> =
  T extends object
  //         ^^^^^^  // Only for objects (not for primitives)
    ? {
        [K in keyof T & string]:       // Iterate all string keys
          T[K] extends object
          //         ^^^^^^   // Is the value itself an object?
            ? DotPath<T[K], `${Prefix}${K}.`>
            //              ^^^^^^^^^^^^^^^^  // Prefix: path so far + key + dot
            : `${Prefix}${K}`;
            //  ^^^^^^^^^^^^^^  // Base case: primitive value = complete path
      }[keyof T & string]     // All values of the map as a union
    : never;

interface User {
  name: string;
  age: number;
  address: {
    city: string;
    zip: string;
    country: {
      code: string;
      name: string;
    };
  };
}

type UserPaths = DotPath<User>;
// "name" | "age" | "address.city" | "address.zip"
// | "address.country.code" | "address.country.name"
```

This isn't just theoretically elegant — it has direct practical application:

```typescript
// Type-safe getPath function:
function getPath<T extends object>(obj: T, path: DotPath<T>): unknown {
  return path.split(".").reduce((current: unknown, key) => {
    return (current as Record<string, unknown>)[key];
  }, obj);
}

const user: User = {
  name: "Max",
  age: 30,
  address: {
    city: "Berlin",
    zip: "10115",
    country: { code: "DE", name: "Germany" }
  }
};

getPath(user, "address.city");          // OK — "Berlin"
getPath(user, "address.country.code");  // OK — "DE"
// getPath(user, "address.phone");      // ERROR! "address.phone" doesn't exist
// getPath(user, "address");            // ERROR! "address" is an object, not a leaf
```

**In React:** This exact pattern is what `react-hook-form` uses for the `name` parameter of `register()`. The form knows which nested fields exist, and the TypeScript compiler ensures you only register paths that actually exist:

```typescript
// react-hook-form concept (simplified)
interface FormData {
  user: {
    firstName: string;
    lastName: string;
    address: { city: string };
  };
}

// Internally react-hook-form uses DotPath-like types:
type FieldPath = DotPath<FormData>;
// "user.firstName" | "user.lastName" | "user.address.city"

const { register } = useForm<FormData>();
register("user.firstName");          // OK
register("user.address.city");       // OK
// register("user.middleName");      // ERROR! Doesn't exist in the type
```

---

## The limits of recursion

TypeScript has a built-in safeguard against infinite recursion. When a recursive type goes too deep, the compiler aborts with an error:

```typescript
// TypeScript limits the recursion depth (typically ~1000)
type TooDeep = Split<"a.b.c.d.e.f.g.....(1000 dots)...", ".">;
// Error: Type instantiation is excessively deep and possibly infinite.
```

This isn't a weakness — it's a feature. Without this limit, a buggy recursive type could send the compiler into an infinite loop. In practice, 1000 levels deep is sufficient for all realistic use cases.

**Rule of thumb:** When you see the "excessively deep" error, your recursive type is either too deep (too many levels) or is missing a base case (which would lead to true infinite recursion). Check the base case first.

---

## What you've learned

- `infer` in Template Literals extracts string parts: `T extends \`${infer Prefix}_${string}\`` extracts everything before the underscore as `Prefix`
- Recursive types enable string operations at the type level: `Split`, `Trim`, `Replace`, `ReplaceAll`
- `DotPath<T>` generates all possible dot-notation paths through a nested object — the foundation of type-safe form libraries and state management
- TypeScript protects against infinite recursion with a depth limit of ~1000 levels

> **Explain to yourself:** Why is the base case in a recursive type so important? What happens without it? And why is TypeScript's depth limit a safeguard, not a limitation?
>
> **Key points:** Without a base case = infinite recursion = compiler hangs | TypeScript detects this and aborts | In practice: always define the "no match" case as the base case first | The depth limit prevents accidental performance disasters

**Core concept to remember:** `infer` in Template Literals is a type-level parser. You describe a string pattern, and TypeScript extracts the marked parts as new types. Combined with recursion, this creates a complete string processing system — one that exists only at compile time and therefore produces zero runtime overhead.

---

> **Pause point** — Recursive types are the heaviest topic in this lesson. If `DotPath<T>` isn't fully clear yet, read through the section again and manually trace the recursion for `User.address.city`: what is `Prefix` at each step?
>
> Continue with: [Section 04: Type-Safe Event Systems](./04-event-names.md)