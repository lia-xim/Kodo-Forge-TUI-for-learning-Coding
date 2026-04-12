# Section 5: Recursive Type Challenges

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Pattern Matching](./04-pattern-matching.md)
> Next section: [06 - Practice: Type-safe Router and Query Builder](./06-praxis-router-query-builder.md)

---

## What you'll learn here

- How to implement **DeepReadonly**, **DeepPartial**, and **Flatten** recursively
- The **PathOf** type: all possible paths to nested properties as a union
- **Tail-call optimization** at the type level (accumulator pattern)
- Strategies for working around TypeScript's recursion limit

---

## Recursion at the type level: the rules

Type-level recursion follows the same principles as value-level recursion:
base case, recursive step, termination. But there are differences:

1. **No stack in the traditional sense** — the compiler builds a type tree
2. **Recursion limit at ~1000** (since TS 4.5 for tail-recursive types, previously ~50)
3. **No error messages** for infinite recursion — only "Type instantiation is excessively deep"
4. **No debugging** — you can't set a breakpoint; only hover-types in the editor

Every recursive type implementation follows this basic skeleton:

```typescript annotated
// Template for recursive types:
type MyRecursive<Input, Acc = DefaultAcc> =
  /* Base case: */ Input extends BaseCase
    ? Acc            // Termination condition reached → result
    /* Recursive step: */
    : MyRecursive<
        ReducedInput,   // Reduce the input
        UpdatedAcc      // Update the accumulator
      >;
// ^ Tail-recursive when MyRecursive is last (no wrapper around it)
```

> 📖 **Background: TypeScript's recursion revolution (TS 4.5)**
>
> Before TypeScript 4.5 (November 2021), the recursion depth was
> limited to about 50. This made many type-level algorithms impossible.
> The TypeScript team then introduced **tail-call elimination** for
> conditional types: when the recursive call is the last
> operation (no `[...Result, extra]` around it), the compiler
> recognizes this and optimizes — similar to TCO in Scheme or
> Erlang. This raised the depth to about 1000. The accumulator
> pattern you saw with `BuildTuple` is exactly this technique.
>
> Before TS 4.5, library authors had to work with `Lookup` arrays —
> predefined tuples of all possible lengths up to 50, then select
> the right one with a conditional type. That was impractical.
> Tail-call optimization was one of the biggest improvements
> for type-level programming in the history of TypeScript.

---

## Challenge 1: DeepReadonly

You know `Readonly<T>` — it only works one level deep. Build the
deep variant:

```typescript annotated
// Shallow: Only the top level is readonly
type ShallowReadonly<T> = { readonly [K in keyof T]: T[K] };

// Deep: All levels are readonly
type DeepReadonly<T> =
  T extends (...args: any[]) => any    // Function?
    ? T                                 // Yes → don't change it
    : T extends ReadonlyArray<infer U>  // Readonly array?
      ? ReadonlyArray<DeepReadonly<U>>  // Yes → elements also readonly
      : T extends object                // Object?
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        // ^ Recursion: every property becomes DeepReadonly
        : T;                            // Primitive → done

// Test:
interface Config {
  server: {
    host: string;
    ports: number[];
    ssl: { cert: string; key: string };
  };
  debug: boolean;
}

type FrozenConfig = DeepReadonly<Config>;
// FrozenConfig.server.ssl.cert is readonly!
// FrozenConfig.server.ports is ReadonlyArray<number>!
```

> 🧠 **Explain to yourself:** Why do functions need to be excluded from
> the recursive traversal? What would happen if you applied
> `DeepReadonly` to function types as well?
> **Key points:** Functions have properties (length, name) |
> DeepReadonly would break their signature | `readonly`
> on function properties is meaningless

---

## Challenge 2: Flatten (Deep)

```typescript annotated
// Flatten a nested array of arbitrary depth:
type DeepFlatten<T extends unknown[]> =
  T extends [infer First, ...infer Rest]
    // ^ Destructure into first element and rest
    ? First extends unknown[]
      // ^ Is the first element itself an array?
      ? [...DeepFlatten<First>, ...DeepFlatten<Rest>]
      // ^ Yes → flatten both and merge
      : [First, ...DeepFlatten<Rest>]
      // ^ No → keep element, flatten rest
    : [];
    // ^ Empty array → done (base case)

type F1 = DeepFlatten<[1, [2, 3], [4, [5, 6]]]>;
// ^ [1, 2, 3, 4, 5, 6]

type F2 = DeepFlatten<[[["deep"]], "flat"]>;
// ^ ["deep", "flat"]
```

> 🧠 **Explain to yourself:** `DeepFlatten` is NOT tail-recursive —
> both branches spread the result: `[...DeepFlatten<First>, ...]`.
> What does this mean for the recursion depth? When would this
> become a problem?
> **Key points:** Non-TCO = limit ~50 | With very deeply
> nested arrays, worst case is a compiler error |
> For real production use: limit the depth or
> use the accumulator pattern

---

## Challenge 3: PathOf — all paths of an object

The king of types: generate a union of all possible paths to
nested properties.

```typescript annotated
// All paths as a string union:
type PathOf<T, Prefix extends string = ""> =
  T extends object
    ? {
        [K in keyof T & string]:
          // ^ Only string keys (no symbol/number)
          | `${Prefix}${K}`
          // ^ Current path (e.g. "server")
          | PathOf<T[K], `${Prefix}${K}.`>
          // ^ Recursion: nested paths (e.g. "server.host")
      }[keyof T & string]
      // ^ Collect all paths as a union
    : never;

interface AppConfig {
  server: {
    host: string;
    port: number;
  };
  db: {
    url: string;
    pool: { min: number; max: number };
  };
}

type ConfigPaths = PathOf<AppConfig>;
// ^ "server" | "server.host" | "server.port"
//   | "db" | "db.url" | "db.pool" | "db.pool.min" | "db.pool.max"
```

### PathOf in practice: type-safe get()

```typescript annotated
// Determine the type at a given path:
type GetByPath<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    // ^ Is there a dot? Then split
    ? Key extends keyof T
      ? GetByPath<T[Key], Rest>  // Recursion: go deeper
      : never
    : Path extends keyof T
      ? T[Path]                   // Last key → value type
      : never;

function get<T, P extends PathOf<T>>(
  obj: T,
  path: P
): GetByPath<T, P> {
  return path.split(".").reduce((o: any, k) => o[k], obj) as any;
}

declare const config: AppConfig;
const host = get(config, "server.host");  // string
const max = get(config, "db.pool.max");    // number
// get(config, "server.foo");              // ERROR: not in PathOf
```

> ⚡ **Framework connection Angular:** Angular's `FormGroup.get('address.street')`
> uses a similar path pattern. Unfortunately, Angular's
> forms are not this deeply typed — `get()` returns `AbstractControl | null`
> instead of the specific type. With the PathOf pattern you could
> build a type-safe wrapper function:
>
> ```typescript
> // Hypothetical type-safe FormGroup helper:
> function getControl<
>   F extends Record<string, AbstractControl>,
>   P extends PathOf<F>
> >(form: FormGroup<F>, path: P): GetByPath<F, P> | null {
>   return form.get(path) as any;
> }
>
> // Then instead of:
> const ctrl = this.form.get('user.address.street');  // AbstractControl | null
> // Like this:
> const ctrl = getControl(this.form, 'user.address.street');  // fully typed
> ```

> ⚡ **Framework connection React Hook Form:** The library actually uses
> a PathOf-like pattern for `register('address.street')` and
> `useWatch({ name: 'address.street' })`. When you define a React Hook Form
> `useForm<MyFormSchema>()`, all path strings are
> typed — typos are compile errors, not runtime problems.

> 💭 **Think about it:** PathOf produces very large union types for
> deeply nested objects. At what depth does this become a problem
> for the compiler?
>
> **Answer:** From about 4–5 levels with many properties, the
> union becomes large enough to noticeably slow down the compiler. In
> practice, the depth is limited with a counter parameter:
> `PathOf<T, Prefix, Depth>` that stops at 0. Libraries like
> `type-fest` and `ts-toolbelt` use this technique.

---

## Accumulator pattern for tail-call optimization

```typescript annotated
// BAD: Not tail-recursive (result is still processed)
type ReverseNaive<T extends unknown[]> =
  T extends [infer First, ...infer Rest]
    ? [...ReverseNaive<Rest>, First]  // Recursion + spread = no tail-call
    : [];

// GOOD: Tail-recursive with accumulator
type Reverse<T extends unknown[], Acc extends unknown[] = []> =
  T extends [infer First, ...infer Rest]
    ? Reverse<Rest, [First, ...Acc]>  // Recursion IS the result = tail-call
    // ^ The compiler recognizes: the result is directly the recursive call
    : Acc;

type R = Reverse<[1, 2, 3, 4, 5]>;  // [5, 4, 3, 2, 1]
```

---

## Experiment: Build DeepPick

Combine PathOf and GetByPath into a type that selects deeply nested
properties:

```typescript
// Goal: DeepPick<AppConfig, "server.host" | "db.pool.max">
// Result: { server: { host: string }; db: { pool: { max: number } } }

// Hint: Split the path at the first dot and build the object recursively.
// type DeepPick<T, Paths extends string> = ???

// Bonus: What happens when two paths share the same parent key?
// e.g. "server.host" and "server.port" — both need to be merged under "server".

// Start with the simple case: just one path, one level deep.
type SimplePick<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? { [K in Key]: SimplePick<T[K], Rest> }
      : never
    : Path extends keyof T
      ? { [K in Path]: T[Path] }
      : never;

type SP = SimplePick<AppConfig, "server.host">;
// ^ { server: { host: string } }
```

---

## Diagnosing and debugging recursion

Since you have no debugger for type-level code, you need
other strategies to find problems:

```typescript
// Technique 1: Create intermediate types and hover over them
type Step1 = BuildTuple<5>;
//   ^ Hover: [unknown, unknown, unknown, unknown, unknown]  ✓

type Step2 = [...BuildTuple<3>, ...BuildTuple<4>];
//   ^ Hover: [unknown, unknown, unknown, unknown, unknown, unknown, unknown]  ✓

type FinalResult = Add<3, 4>;
//   ^ Hover: 7  ✓

// Technique 2: Test with simple types before complex inputs
type Test1 = PathOf<{ a: string }>;
//   ^ Hover: "a"  ✓ (simple case first)

type Test2 = PathOf<{ a: { b: string } }>;
//   ^ Hover: "a" | "a.b"  ✓ (one level deeper)

// If Test1 is wrong, the bug is in the base logic.
// If Test2 is wrong, the bug is in the recursion.

// Technique 3: Use never as a "breakpoint"
type DebugPathOf<T> =
  T extends object
    ? keyof T extends string  // What are the keys?
      ? keyof T               // Pause here: see what comes out
      : never
    : never;
```

---

## What you've learned

- **DeepReadonly, DeepFlatten** — recursive types that process all levels
- **PathOf** generates a union of all paths to nested properties
- **GetByPath** determines the type at a given path — the foundation for `get(obj, "a.b.c")`
- **Accumulator pattern** for tail-call optimization at the type level (recursion depth ~1000)
- Deep recursion has limits — in practice, depth is bounded explicitly
- **Debugging strategy**: create intermediate types, test simple inputs first, use `never` as a breakpoint

> 🧠 **Explain to yourself:** Why is the accumulator pattern
> important not just for performance, but also for
> correctness? What happens when you hit the recursion limit
> without an accumulator?
> **Key points:** Without TCO the compiler stops at ~50 |
> With accumulator ~1000 is possible | On abort: "Type
> instantiation is excessively deep" — the type degrades to `any` |
> This is dangerous because no error is raised —
> the code compiles, but with wrong types

**Core concept to remember:** Recursive types are the equivalent of loops. The accumulator pattern is the equivalent of tail-call-optimized functions. Both together enable deep type computations. And intermediate types are your only debugging tool — use them generously.

---

> **Pause point** — Recursive type challenges are complete. In the
> final section we'll build real practical projects.
>
> Continue with: [Section 06: Practice — Type-safe Router and Query Builder](./06-praxis-router-query-builder.md)