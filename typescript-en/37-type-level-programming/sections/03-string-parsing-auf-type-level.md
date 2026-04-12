# Section 3: String Parsing at the Type Level

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Arithmetic at the Type Level](./02-arithmetik-auf-type-level.md)
> Next section: [04 - Pattern Matching with Conditional Types](./04-pattern-matching.md)

---

## What you'll learn here

- How to **parse strings at compile time** with Template Literal Types and `infer`
- **Split**, **Join**, **Replace**, and **Trim** as pure type operations
- How to build a **URL path parser** at the type level
- Why string parsing at the type level is crucial for **routers and API definitions**

---

## Strings are data at the type level

In section 1 you saw that Template Literal Types can manipulate strings.
Now we go further: we **parse** strings. That means we decompose a string
into its parts — all at compile time.

If you've worked on a backend project, you've probably written code like this:

```typescript
// Without type-level parsing:
router.get('/users/:id', (req, res) => {
  const id = req.params.id;  // string — but TypeScript doesn't know whether "id" exists
});

// The developer has to know which parameters are present.
// Typo? → Runtime error. No autocomplete. No compile error.
```

Type-level string parsing solves exactly this problem: the path string
`"/users/:id"` is analyzed at compile time and `{ id: string }` is
automatically inferred from it. The string **describes** the type.

> 📖 **Background: Template Literal Types — the underrated revolution**
>
> Template Literal Types were introduced in TypeScript 4.1 (November 2020).
> Ryan Cavanaugh from the TypeScript team described them as "the most
> powerful type extension since Conditional Types." The reason: they make
> strings **structured** at the type level. Before, `"GET /users/:id"` was
> simply a `string`. Now TypeScript can extract `:id` and derive
> `{ id: string }` from it. This is the foundation for type-safe routers
> in Express, Next.js, and tRPC.
>
> The breakthrough came with **tRPC** (2021, Alex Johansson): the framework
> uses Template Literal Types to parse procedure names like `"user.getById"`
> at compile time — the dot separator is extracted, the namespace `"user"`
> and the name `"getById"` are separated. As a result, all tRPC calls are
> fully type-safe without code generation.

### The building blocks

```typescript annotated
// Split: decompose a string at a delimiter
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    // ^ Is there a delimiter D in S?
    ? [Head, ...Split<Tail, D>]  // Yes → head + recursively the rest
    : [S];                        // No → only one element left
// ^ Recursion: splits "a/b/c" at "/" into ["a", "b", "c"]

type Parts = Split<"users/posts/comments", "/">;
// ^ ["users", "posts", "comments"]

type Words = Split<"hello world foo", " ">;
// ^ ["hello", "world", "foo"]
```

---

## String operations as types

### Replace: substitute substrings

```typescript annotated
// Replace the first occurrence of From with To:
type Replace<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Before}${From}${infer After}`
    ? `${Before}${To}${After}`  // Replace and return the rest
    : S;                         // Nothing found → unchanged

type R1 = Replace<"hello world", "world", "TypeScript">;
// ^ "hello TypeScript"

// Replace ALL occurrences (recursively):
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Before}${From}${infer After}`
    ? ReplaceAll<`${Before}${To}${After}`, From, To>
    // ^ Recursion: continue searching after replacing
    : S;

type R2 = ReplaceAll<"a-b-c-d", "-", "_">;
// ^ "a_b_c_d"
```

### Join: concatenate strings

```typescript annotated
// Join: connect an array of strings with a delimiter
type Join<Parts extends string[], Sep extends string> =
  Parts extends [infer First extends string, ...infer Rest extends string[]]
    ? Rest extends []
      ? First                          // Last element: no separator
      : `${First}${Sep}${Join<Rest, Sep>}`  // Separator + rest recursively
    : "";                              // Empty array → empty string

type J1 = Join<["users", "posts", "comments"], "/">;  // "users/posts/comments"
type J2 = Join<["a", "b", "c"], "-">;                  // "a-b-c"
type J3 = Join<["hello"], " ">;                        // "hello" (no sep needed)
```

### Trim: remove whitespace

```typescript annotated
// Remove leading whitespace:
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}`   // Does S start with a space?
    ? TrimLeft<Rest>            // Yes → remove it, keep checking
    : S;                        // No → done

// Remove trailing whitespace:
type TrimRight<S extends string> =
  S extends `${infer Rest} `   // Does S end with a space?
    ? TrimRight<Rest>           // Yes → remove it, keep checking
    : S;

// Combined:
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type T1 = Trim<"  hello  ">;           // "hello"
type T2 = Trim<"   spaces   ">;        // "spaces"
type T3 = Trim<"no-spaces">;           // "no-spaces" (unchanged)

// In practice: CSV parsing with Trim
type ParseCSVField<S extends string> = Trim<S>;
type CSVFields = Split<"  Alice  ,  Bob  ,  Charlie  ", ",">;
// ^ ["  Alice  ", "  Bob  ", "  Charlie  "]
// Then: { [K in CSVFields[number]]: ParseCSVField<K> }
```

> 🧠 **Explain it to yourself:** Why does `TrimLeft` need to be recursive?
> Couldn't you just apply `S extends ` ${infer Rest}`` once and be done?
> **Key points:** One application only removes ONE space | Multiple
> consecutive spaces require repeated removal | Recursion replaces the loop

---

## In practice: URL path parser

The most practical example of type-level string parsing: a router that
extracts URL parameters from the path.

```typescript annotated
// Extract parameters from a URL path:
// "/users/:id/posts/:postId" → { id: string; postId: string }

type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    // ^ Is there a ":param" followed by "/"?
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    // ^ Create { param: string } and parse the rest
    : Path extends `${string}:${infer Param}`
      // ^ Is there a ":param" at the end?
      ? { [K in Param]: string }
      // ^ Last parameter
      : {};
      // ^ No more parameters

type UserParams = ExtractParams<"/users/:id">;
// ^ { id: string }

type PostParams = ExtractParams<"/users/:userId/posts/:postId">;
// ^ { userId: string } & { postId: string }

type NoParams = ExtractParams<"/about">;
// ^ {}
```

### Building the router

```typescript
// Type-safe route handler:
function createRoute<Path extends string>(
  path: Path,
  handler: (params: ExtractParams<Path>) => void
): void {
  // Runtime implementation...
}

// The magic: TypeScript knows what params contains!
createRoute("/users/:userId/posts/:postId", (params) => {
  params.userId;  // string — autocomplete!
  params.postId;  // string — autocomplete!
  // params.foo;  // ERROR: Property 'foo' does not exist
});
```

> ⚡ **Framework connection — Next.js:** Next.js's App Router system uses
> exactly this pattern. A file `app/users/[id]/page.tsx` automatically
> generates the type `{ params: { id: string } }`:
>
> ```typescript
> // Next.js App Router — automatically generated by the framework:
> interface PageProps {
>   params: ExtractParams<"/users/[id]">;  // { id: string }
>   // Internally Next.js uses the same logic (with "[]" instead of ":")
> }
>
> export default function UserPage({ params }: PageProps) {
>   params.id;  // string — type-safe with autocomplete!
> }
> ```

> ⚡ **Framework connection — Angular:** Angular's Router exposes
> `ActivatedRoute.params` as `Observable<ParamMap>`. The problem:
> `paramMap.get('userId')` returns `string | null` — with no compiler
> guarantee that `userId` is even defined in the path. With type-level
> parsing you could build a type-safe alternative:
>
> ```typescript
> // Hypothetical — what it could look like:
> type AngularRoute<Path extends string> = {
>   params: ExtractParams<Path>;
> };
>
> // Then in component code:
> // this.route.snapshot.params // would be { userId: string }, not ParamMap
> ```
>
> The difference: with type-level parsing the type is automatically derived
> from the path string — no manual interface definition required.

> 💭 **Think about it:** What happens when a URL path has optional parameters,
> e.g. `/users/:id?`? How would you model that at the type level?
>
> **Answer:** You could check whether the parameter ends with `?`:
> `Param extends `${infer Name}?`` → `{ [K in Name]?: string }`.
> That makes the parameter optional in the resulting type. This is exactly
> how it works in libraries like type-fest.

---

## Experiment: query string parser

Build a type that parses query strings:

```typescript
// Goal: "name=Max&age=30&city=Berlin"
//     → { name: string; age: string; city: string }

// Step 1: Split at "&"
type QueryPairs = Split<"name=Max&age=30&city=Berlin", "&">;
// ^ ["name=Max", "age=30", "city=Berlin"]

// Step 2: Extract key from "key=value"
type ExtractKey<S extends string> =
  S extends `${infer Key}=${string}` ? Key : never;

type K = ExtractKey<"name=Max">;  // "name"

// Step 3: Combine into an object
type ParseQuery<S extends string> =
  S extends `${infer Pair}&${infer Rest}`
    ? { [K in ExtractKey<Pair>]: string } & ParseQuery<Rest>
    : S extends `${infer Key}=${string}`
      ? { [K in Key]: string }
      : {};

type Query = ParseQuery<"name=Max&age=30&city=Berlin">;
// ^ { name: string } & { age: string } & { city: string }

// Experiment: Extend ParseQuery to also handle "key" without "=value"
// (e.g. "verbose&debug" → { verbose: true; debug: true }).
// Hint: Check whether the pair contains a "=".
```

---

## Pitfalls in string parsing

Before you use these techniques, an important note about limitations:

```typescript
// PROBLEM 1: Distributivity with unions
type TestSplit = Split<"a/b" | "c/d", "/">;
// ^ ["a", "b"] | ["c", "d"]  — Good, works!

// PROBLEM 2: Empty strings
type EmptySplit = Split<"", "/">;
// ^ [""]  — Not [], because the empty string is still one element

// PROBLEM 3: Delimiter at start/end
type SlashSplit = Split<"/users/", "/">;
// ^ ["", "users", ""]  — Empty strings at the ends!

// Solution: combine with FilterEmpty
type FilterEmpty<T extends string[]> = {
  [K in keyof T]: T[K] extends "" ? never : T[K]
}[number];

// PROBLEM 4: Duplicate parameters
type Weird = ExtractParams<"/:a/:a">;
// ^ { a: string } — Duplicate is overwritten, no error!
```

These cases are why production libraries like `path-to-regexp` include
additional validation logic. Type-level parsing covers the happy path —
edge case handling belongs at runtime.

---

## What you've learned

- **Template Literal Types + `infer`** enable string parsing at compile time
- **Split, Join, Replace, Trim** — classic string operations as pure type operations
- **URL path parser**: extracts parameter names from paths and produces typed objects
- **Query string parser**: decomposes key-value pairs into a typed object
- Limitations: empty strings, duplicates, and edge case handling require additional types or runtime validation
- This pattern is the foundation for type-safe routers in Next.js, tRPC, and Express

> 🧠 **Explain it to yourself:** Why is type-level string parsing so much
> more valuable than a generic `Record<string, string>` for route parameters?
> What does the developer concretely gain?
> **Key points:** Autocomplete for parameter names | Compile errors on typos |
> No manual type mapping needed | Type and definition are always in sync |
> Refactoring the path string automatically updates all dependent types

**Core concept to remember:** Type-level string parsing transforms unstructured strings into structured types. A path string like `"/users/:id"` becomes `{ id: string }` — automatically, safely, and with zero runtime overhead. The string is the single source of truth.

---

> **Pause point** — You can now parse strings at the type level.
> Next we'll deepen our understanding of pattern matching with Conditional Types.
>
> Continue with: [Section 04: Pattern Matching with Conditional Types](./04-pattern-matching.md)