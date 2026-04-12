# Section 3: Writing Performant Types

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Type Instantiation and Depth Limits](./02-type-instantiation-und-depth-limits.md)
> Next section: [04 - Measuring and Optimizing Compile Time](./04-compile-zeit-messen-und-optimieren.md)

---

## What you'll learn here

- The difference between **shallow** and **deep** types and why it matters for performance
- Why **interface extends** is faster than **type intersection** (`&`)
- How to defuse **large union types**
- Concrete **refactoring patterns** that measurably reduce compile time

---

## The Core Principle: Shallow Is Fast

> **Background: How the checker compares types**
>
> When the checker verifies whether type A is assignable to type B, it must
> compare every property of A against every property of B. With shallow types
> (an interface with 10 properties) that's 10 comparisons. With nested types
> it becomes recursive — and with intersections the checker must "merge" the
> properties before it can compare.
>
> The TypeScript team found in performance audits: **Most slow projects don't
> have too many types, they have types that are too complex.**
> A project with 1000 simple interfaces compiles faster than one with
> 100 deeply nested intersection types.
>
> In TypeScript 4.2, the team introduced a new profiling mode that enables
> exactly these measurements. The results fed directly into the compiler
> optimizations of 4.5+. Since then, performance for intersection types has
> improved, but the fundamental problem remains:
> Shallow types are still measurably faster.

The golden rule for performant types:

> **The shallower the type, the faster the checker.**

Shallow means: little nesting, little indirection, little
computation the checker has to perform at compile time.

> 🏗️ **Analogy: Database indexes and type performance**
>
> Performant types are like well-designed database tables. A table
> with 50 columns that are all directly accessible is faster than a
> table with 5 columns that each contain JSON blobs with nested data.
> The JSON variant requires parsing first (like intersection merging)
> before you can access the actual values.
>
> Likewise, an interface with clear properties is like a table design
> with fixed columns: the compiler knows exactly where everything is and
> doesn't have to merge structures first.

> 🧠 **Explain it to yourself:** If you have an interface inherit from three
> other interfaces — are the parent interfaces recomputed each time or cached?
>
> **Key points:** Interface extends is computed ONCE and cached |
> All three parents are merged into a single property set |
> This merge is stored and reused every time it's referenced |
> In contrast: intersection types must be re-merged on every use,
> because the compiler doesn't know whether they've changed

---

## Interface extends vs. Type Intersection

This is the most important performance rule in TypeScript:

```typescript annotated
// SLOW: Intersection type
type UserWithRole = User & { role: string };
// ^ The checker must merge User and { role: string } on EVERY use
// ^ The result is NOT cached — every assignability check re-merges

// FAST: Interface extends
interface UserWithRole extends User {
  role: string;
}
// ^ The checker computes the interface ONCE and caches the property list
// ^ Every assignability check uses the cache
```

Why is this the case? Interfaces are evaluated **eagerly** by the compiler
and the property list is stored. Intersection types are evaluated
**lazily** — on every use, the checker must reassemble the properties.

```typescript annotated
// Especially expensive: Multiple intersections
type FullEntity = Base & Timestamps & SoftDelete & Versioned & Audited;
// ^ 5 types are merged on EVERY use
// ^ In a service with 20 methods that use FullEntity:
// ^ 20 * 5 merge operations = 100 merges

// Better: Interface chain
interface FullEntity extends Base, Timestamps, SoftDelete, Versioned, Audited {}
// ^ Computed ONCE, regardless of how often it's used
// ^ 20 methods using FullEntity: 0 additional merges
```

> 🧠 **Explain it to yourself:** Why can the compiler cache interfaces but not intersection types? What is the structural difference?
> **Key points:** Interfaces have a fixed, closed property list | Intersections can contain generics that are resolved later | With interfaces the compiler knows UPFRONT what's in them | With intersections it has to recompute on every use

---

## Defusing Union Types

Large union types are another performance killer. The reason:
assignability checks for unions are **O(n * m)** — every member
of one type is checked against every member of the other.

```typescript annotated
// SLOW: Huge string union
type AllIcons =
  | "home" | "settings" | "user" | "mail" | "search"
  | "close" | "menu" | "add" | "delete" | "edit"
  | "save" | "cancel" | "refresh" | "download" | "upload"
  // ... 200 more icons
  ;
// ^ Every assignability check iterates over ALL members
// ^ "Is 'home' in AllIcons?" → 200+ comparisons

// FASTER: Grouped unions
type NavigationIcons = "home" | "menu" | "search" | "settings";
type ActionIcons = "add" | "delete" | "edit" | "save" | "cancel";
type FileIcons = "download" | "upload" | "refresh";

type AllIcons = NavigationIcons | ActionIcons | FileIcons;
// ^ The compiler can evaluate the groups individually
// ^ And if you only need NavigationIcons: smaller check
```

Even more important: don't use union types where an **index type**
would be better:

```typescript annotated
// SLOW: Union of 100 object types
type ApiResponse =
  | { type: "user"; data: User }
  | { type: "post"; data: Post }
  | { type: "comment"; data: Comment }
  // ... 97 more variants
  ;
// ^ Discriminated union with 100 variants
// ^ switch(response.type) requires the checker to evaluate 100 narrowings

// FASTER: Mapped type + lookup
interface ResponseMap {
  user: User;
  post: Post;
  comment: Comment;
  // ... more types
}

type ApiResponse<T extends keyof ResponseMap> = {
  type: T;
  data: ResponseMap[T];
};
// ^ A single generic definition instead of 100 union members
// ^ The checker only instantiates the specific type you need
```

> 💭 **Think about it:** If a discriminated union has 100 variants and you
> write a `switch` with 100 cases — how many assignability checks does
> the checker have to perform?
>
> **Answer:** In each case the checker must determine which variants are
> still possible (narrowing). In the worst case: 100 + 99 + 98 + ... + 1 =
> 5050 checks. With mapped types: 1 lookup per case.

> ⚡ **Framework context (React):** React Redux's `Action` types are a
> classic example of large discriminated unions. In a medium-sized
> application with 50+ action types, reducer type-checking becomes slow.
> The solution: instead of one giant `AppAction` union, use separate
> reducers per domain (User, Posts, Comments), each with their own small
> unions. Redux Toolkit does this automatically with `createSlice` —
> another reason why RTK improves not just DX but also compile performance.

---

## Simplifying Conditional Types

Conditional types are powerful but expensive. Every branch must be
evaluated, and with distributive conditional types this happens
separately for each union member:

```typescript annotated
// SLOW: Nested conditional types
type DeepExtract<T, Path extends string> =
  Path extends `${infer Head}.${infer Rest}`
    ? Head extends keyof T
      ? DeepExtract<T[Head], Rest>
      // ^ Recursion + template literal parsing + keyof check
      // ^ At depth 5: 5 conditional evaluations per call
      : never
    : Path extends keyof T
    ? T[Path]
    : never;

// FASTER: Overloads for known depths
type Get1<T, K1 extends keyof T> = T[K1];
type Get2<T, K1 extends keyof T, K2 extends keyof T[K1]> = T[K1][K2];
type Get3<T, K1 extends keyof T, K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]> = T[K1][K2][K3];
// ^ No recursion, no template literal parsing
// ^ For 95% of cases, 3 levels is enough
```

> ⚡ **Framework context (Angular):** Angular's `FormGroup` typing is
> a real-world example: Typed Reactive Forms (since Angular 14) use
> recursive types to type nested FormGroups. In projects with
> 50+ forms this can increase compile time by 15-20%. The
> Angular tip: use `FormRecord` instead of deeply nested
> `FormGroup<{ nested: FormGroup<{ ... }> }>`.

> 💭 **Think about it:** Why are overloads for known depths faster than
> recursive template literal types?
>
> **Answer:** Overloads are discrete, final types — the compiler
> can compute and cache all of them upfront. Recursive template literals
> must be "calculated" at type-checker runtime, including
> string concatenation and pattern matching. A `Get1<T, K1>` is a
> simple lookup. `DeepExtract<T, "a.b.c">` requires parsing the string,
> recursion, and multiple conditional evaluations.

---

## Generics: Constraints Instead of Conditional Types

Often you can replace conditional types with constraints — this is
both more readable and more performant:

```typescript annotated
// SLOW: Conditional type for type extraction
type ExtractId<T> = T extends { id: infer Id } ? Id : never;
// ^ For every use: evaluate conditional + resolve infer

// FASTER: Constraint + lookup
type ExtractId<T extends { id: unknown }> = T["id"];
// ^ No conditional needed — T is GUARANTEED to have an id property
// ^ Direct lookup instead of pattern matching

// SLOW: Conditional for array check
type Flatten<T> = T extends Array<infer U> ? U : T;

// FASTER: Overloads
type Flatten<T> = T extends Array<infer U> ? U : T;
// ^ Unfortunately there's no better alternative here
// ^ But you can cache the result:
type FlattenedItems = Flatten<Items>; // Compute once, use everywhere
```

> 🧪 **Experiment:** Create a file with this code and observe
> the IDE response time:
>
> ```typescript
> // Version 1: Intersection chain
> type Base = { id: string; created: Date };
> type V1 = Base & { name: string } & { email: string } & { role: string }
>   & { department: string } & { manager: string } & { salary: number };
>
> // Version 2: Interface extends
> interface V2 extends Base {
>   name: string; email: string; role: string;
>   department: string; manager: string; salary: number;
> }
>
> // Type: const user: V1 = { ... } and const user2: V2 = { ... }
> // Observe: Autocomplete for V2 appears faster
> ```
>
> In small examples the difference is minimal. In projects with
> hundreds of such types it adds up.

> 🧪 **Bonus experiment: Measuring union grouping**
>
> Test the difference between a large union and grouped unions:
>
> ```typescript
> // Bad: One giant union
> type AllRoutes =
>   | { path: "/home"; component: HomePage }
>   | { path: "/about"; component: AboutPage }
>   | { path: "/users"; component: UsersPage }
>   | { path: "/users/:id"; component: UserDetailPage }
>   | { path: "/settings"; component: SettingsPage }
>   | { path: "/settings/profile"; component: ProfilePage }
>   | { path: "/settings/security"; component: SecurityPage }
>   // ... 50 more routes
>   ;
>
> // Better: Grouped by domain
> type AuthRoutes =
>   | { path: "/login"; component: LoginPage }
>   | { path: "/register"; component: RegisterPage };
>
> type UserRoutes =
>   | { path: "/users"; component: UsersPage }
>   | { path: "/users/:id"; component: UserDetailPage };
>
> type AllRoutes = AuthRoutes | UserRoutes;
> // ^ The compiler can evaluate domains separately
> ```
>
> Measure the IDE response time for `const route: AllRoutes = ...` in both
> variants. The difference is barely visible in small projects, but
> becomes noticeable at 100+ routes.

---

## Summary: The Performance Rules

| Rule | Slow | Fast |
|------|------|------|
| Inheritance | `type A = B & C & D` | `interface A extends B, C, D {}` |
| Unions | 200+ members in one union | Grouped sub-unions |
| Recursion | Unbounded recursion depth | Counter-based termination |
| Conditional | Deeply nested conditionals | Constraints + lookup |
| Caching | Computing the same type multiple times | Type alias = compute once |

---

## What you've learned

- **Interface extends** is faster than **type intersection** (`&`) because interfaces are cached
- Large **union types** cause O(n*m) assignability checks — group them
- **Conditional types** are expensive — replace them with constraints where possible
- **Type aliases** cache computations — use them instead of repeating types inline
- Most performance problems come from **a few complex types**, not from many simple ones

**Core concept to remember:** Performant types are like performant code — prefer simple, flat structures. Interface extends over intersection, lookup over conditional, and cache expensive computations in type aliases.

---

> **Pause point** — Good moment for a break. You now know how to write
> types that don't bring the checker to its knees.
>
> Continue with: [Section 04: Measuring and Optimizing Compile Time](./04-compile-zeit-messen-und-optimieren.md)