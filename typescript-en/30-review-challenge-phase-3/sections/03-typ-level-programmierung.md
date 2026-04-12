# Section 3: Type-Level Programming in Practice

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Pattern Combination](./02-pattern-kombination.md)
> Next section: [04 - Framework Integration](./04-framework-integration.md)

---

## What you'll learn here

- How Phase 2 concepts (Mapped, Conditional, Template Literal Types) interact with Phase 3 concepts
- How to use recursive Conditional Types for real-world problems
- How variance and generics work together in type-level computations
- Practical type-level challenges that connect all phases

---

## Recap: The Triumvirate Meets Phase 3
<!-- section:summary -->
In Phase 2 you learned the "Triumvirate": Mapped Types (L16),

<!-- depth:standard -->
In Phase 2 you learned the "Triumvirate": Mapped Types (L16),
Conditional Types (L17), Template Literal Types (L18). In Phase 3
you learned tools that extend these building blocks:

```
Phase 2:                    Phase 3:
Mapped Types (L16)    ←→    Recursive Types (L23)
Conditional Types (L17) ←→  Advanced Generics (L22)
Template Literals (L18) ←→  Branded Types (L24)
```

Together they enable **arbitrarily complex type transformations**.
Let's look at this in practice.

---

<!-- /depth -->
## Challenge 1: Type-safe API Client
<!-- section:summary -->
You want to build an API client that derives its endpoints from a

<!-- depth:standard -->
You want to build an API client that derives its endpoints from a
type — with Branded Types for the IDs:

```typescript annotated
// API definition as a type:
type ApiRoutes = {
  '/users': { GET: User[]; POST: User };
  '/users/:id': { GET: User; PUT: User; DELETE: void };
  '/posts': { GET: Post[]; POST: Post };
};

// Step 1: Extract parameters from route (L18 — Template Literals)
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;
// ^ Recursive template literal extraction!

type Test1 = ExtractParams<'/users/:id'>;
// ^ "id"

type Test2 = ExtractParams<'/orgs/:orgId/members/:memberId'>;
// ^ "orgId" | "memberId"

// Step 2: Branded IDs for parameters (L24)
type ParamMap<T extends string> = {
  [K in ExtractParams<T>]: string & { readonly __brand: K };
};
// ^ Each parameter gets its own brand!

type UserParams = ParamMap<'/users/:id'>;
// ^ { id: string & { __brand: 'id' } }

// Step 3: The type-safe client (L22 — Generics)
type ApiClient = {
  [Route in keyof ApiRoutes]: {
    [Method in keyof ApiRoutes[Route]]:
      ExtractParams<Route & string> extends never
        ? () => Promise<ApiRoutes[Route][Method]>
        // ^ No parameters → no arguments
        : (params: ParamMap<Route & string>) =>
            Promise<ApiRoutes[Route][Method]>;
        // ^ With parameters → Branded Params as argument
  };
};
```

> 📖 **Background: Type-Level Programming in the Real World**
>
> This pattern isn't academic — libraries like tRPC, Hono,
> and Elysia use exactly this technique. tRPC extracts the
> input/output types from the API definition and generates a
> fully type-safe client. The idea goes back to Giulio Canti,
> who demonstrated with io-ts and fp-ts that TypeScript's
> type system is more powerful than most people think.

> 💭 **Think about it:** Which Phase 2 concepts are combined in this
> example? List them.
>
> **Answer:** (1) Template Literal Types for route parsing,
> (2) Mapped Types for the client type, (3) Conditional Types for
> distinguishing with/without parameters, (4) Generics for the
> route/method type parameters, (5) infer for parameter extraction.

---

<!-- /depth -->
## Challenge 2: DeepBrand — Recursive Branded Types
<!-- section:summary -->
How would you automatically brand ALL string fields in a nested object

<!-- depth:standard -->
How would you automatically brand ALL string fields in a nested object
as NonEmptyString?

```typescript annotated
type NonEmptyString = string & { readonly __brand: 'NonEmpty' };

// Step 1: Recursive type (L23 + L17)
type DeepBrand<T> =
  T extends string
    ? NonEmptyString
    // ^ Base case: string → NonEmptyString
  : T extends (infer U)[]
    ? DeepBrand<U>[]
    // ^ Array: apply recursively to elements (L23)
  : T extends object
    ? { [K in keyof T]: DeepBrand<T[K]> }
    // ^ Object: Mapped Type + recursion (L16 + L23)
  : T;
    // ^ Everything else: unchanged

// Test:
type UserInput = {
  name: string;
  address: {
    street: string;
    city: string;
    zip: number;
    // ^ number stays number — only strings get branded
  };
  tags: string[];
};

type BrandedUser = DeepBrand<UserInput>;
// Result:
// {
//   name: NonEmptyString;
//   address: {
//     street: NonEmptyString;
//     city: NonEmptyString;
//     zip: number;
//   };
//   tags: NonEmptyString[];
// }
```

> 🧠 **Explain to yourself:** Why does the order of the
> extends checks matter? What happens if you check `T extends object`
> BEFORE `T extends string`?
> **Key points:** In JavaScript, string is NOT an object (primitive) |
> BUT: TypeScript's extends checks assignability | string extends
> object is false | Still: order matters with unions |
> Array before object, because arrays are also objects

---

<!-- /depth -->
## Challenge 3: Variance with Recursive Types
<!-- section:summary -->
How does variance (L22) interact with recursive types (L23)?

<!-- depth:standard -->
How does variance (L22) interact with recursive types (L23)?

```typescript annotated
// Covariant container (L22):
interface Tree<out T> {
  value: T;
  children: Tree<T>[];
  // ^ Recursive! (L23)
}

// Because Tree is covariant:
declare const dogTree: Tree<Dog>;
const animalTree: Tree<Animal> = dogTree;
// ^ OK! Tree<Dog> is assignable to Tree<Animal> (covariance)
// This also works for the nested children!

// Contravariant visitor (L22):
interface TreeVisitor<in T> {
  visit(node: T): void;
  visitChildren(children: T[]): void;
}

// Because TreeVisitor is contravariant:
declare const animalVisitor: TreeVisitor<Animal>;
const dogVisitor: TreeVisitor<Dog> = animalVisitor;
// ^ OK! TreeVisitor<Animal> is assignable to TreeVisitor<Dog> (contravariance)
```

> 🔬 **Experiment:** What happens when you make `Tree` invariant
> (both reading and writing)?
>
> ```typescript
> interface MutableTree<T> {
>   value: T;            // out-position (read)
>   children: MutableTree<T>[];
>   setValue(v: T): void; // in-position (write)
> }
>
> declare const dogTree: MutableTree<Dog>;
> // const animalTree: MutableTree<Animal> = dogTree;
> // ^ Error! MutableTree is invariant
> // Using a Dog-Tree as an Animal-Tree would allow
> // calling setValue(cat) — Cat is not a Dog!
> ```

---

<!-- /depth -->
## Challenge 4: Type-Level String Parsing
<!-- section:summary -->
Template Literal Types + Recursive Types = a parser at the type level:

<!-- depth:standard -->
Template Literal Types + Recursive Types = a parser at the type level:

```typescript annotated
// Parsing a CSS color value (simplified):
type ParseColor<S extends string> =
  S extends `#${infer Hex}`
    ? Hex extends `${infer _}${infer _}${infer _}${infer _}${infer _}${infer _}`
      ? { type: 'hex'; value: S }
      // ^ 6-digit hex code
      : { type: 'invalid'; reason: 'Hex must be 6 characters' }
  : S extends `rgb(${infer _})`
    ? { type: 'rgb'; value: S }
    // ^ rgb() notation
  : S extends `${infer Name}`
    ? { type: 'named'; value: Name }
    // ^ Named color
  : never;

type Test1 = ParseColor<'#ff0000'>;
// ^ { type: 'hex'; value: '#ff0000' }

type Test2 = ParseColor<'rgb(255,0,0)'>;
// ^ { type: 'rgb'; value: 'rgb(255,0,0)' }

type Test3 = ParseColor<'red'>;
// ^ { type: 'named'; value: 'red' }
```

> ⚡ **Practical tip:** In React projects with styled-components or
> Tailwind CSS there are libraries that use Template Literal Types for
> CSS validation. In Angular this is less common, but for custom design
> systems the pattern can be useful — e.g. to ensure that only valid
> theme colors are used.

---

<!-- /depth -->
## The Limits of Type-Level Programming
<!-- section:summary -->
Not everything SHOULD be solved at the type level:

<!-- depth:standard -->
Not everything SHOULD be solved at the type level:

```typescript annotated
// TOO complex — better as runtime validation:
// type ValidateEmail<S extends string> = ...
// ^ Building a complete email validator at the type level
// is possible, but unreadable and slow

// Better: Branded Type + runtime validation (L24):
type Email = string & { readonly __brand: 'Email' };
function parseEmail(s: string): Email | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s as Email : null;
}
// ^ Runtime check + Branded Type = pragmatic and safe
```

> 📖 **Background: Type-Level Turing Completeness**
>
> TypeScript's type system is Turing-complete — you can
> theoretically express any algorithm at the type level.
> There are implementations of Tetris, an SQL parser, and
> even a complete TypeScript compiler — all purely at the
> type level. But: just because you CAN doesn't mean you
> SHOULD. Compile time explodes, error messages become
> unreadable, and colleagues can't understand the code.
>
> **Rule of thumb:** Type-level logic for API contracts and
> configuration. Runtime logic for business rules and
> validation.

> 💭 **Think about it:** Where is the line between "useful
> type-level programming" and "overengineering"?
>
> **Consideration:** Type-level logic is worth it when (1) the type
> is reused often, (2) errors are costly (API contracts),
> (3) the team understands the type. It's NOT worth it when
> (1) the type is only used once, (2) a runtime check suffices,
> (3) the error messages become unreadable.

---

<!-- /depth -->
## What you've learned

- Template Literal Types + Recursive Types enable type-level parsing
- Variance (L22) works correctly with recursive types (L23)
- DeepBrand combines Mapped Types, Conditional Types, and recursion
- Type-level programming has limits — runtime validation + Branded Types is often more pragmatic

> 🧠 **Explain to yourself:** When is type-level programming worth it
> and when is runtime validation + Branded Types better?
> **Key points:** Type-level for API contracts and framework types |
> Runtime for business logic and user input | Rule of thumb:
> If the error message becomes unreadable, it's too complex |
> Branded Types as a pragmatic middle ground

**Core concept to remember:** The Triumvirate (Phase 2) plus recursion,
variance, and Branded Types (Phase 3) together form a complete
type-level programming system. The art lies in knowing WHEN
to use it — and when not to.

---

> **Pause point** — Type-level challenges mastered. Next topic:
> How does all of this integrate into Angular and React?
>
> Continue with: [Section 04: Framework Integration](./04-framework-integration.md)