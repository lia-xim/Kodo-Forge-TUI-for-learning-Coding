# Section 6: Practical Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Limits and Performance](./05-grenzen-und-performance.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- How libraries like **Zod**, **Prisma**, and **React Hook Form** use recursive types
- How to model **type-safe config objects** with recursive types
- How to build a **type-safe deep-get** — the showcase project of this lesson
- When you need **z.lazy()** and why Zod has a special API for it

---

## Zod: Recursive Schema Validation
<!-- section:summary -->
Zod is one of the most popular TypeScript validation libraries.

<!-- depth:standard -->
Zod is one of the most popular TypeScript validation libraries.
For recursive schemas, Zod has a special API: `z.lazy()`.

<!-- depth:vollstaendig -->
> **Background: Why Zod needs `z.lazy()`**
>
> TypeScript types are evaluated **lazily** — the compiler
> only unfolds them when needed. But Zod schemas are
> **JavaScript objects** that exist at runtime. A schema
> that references itself would create an **infinite loop**
> during creation:
>
> ```typescript
> // ❌ ERROR: Infinite loop during creation!
> const categorySchema = z.object({
>   name: z.string(),
>   subcategories: z.array(categorySchema),
>   //                      ^^^^^^^^^^^^^^ Not yet defined!
> });
>
> // ✅ SOLUTION: z.lazy() defers evaluation
> type Category = {
>   name: string;
>   subcategories: Category[];
> };
>
> const categorySchema: z.ZodType<Category> = z.object({
>   name: z.string(),
>   subcategories: z.array(z.lazy(() => categorySchema)),
>   //                     ^^^^^^^^^^^^^^^^^^^^^^^^^^
>   //                     Lambda → only resolved during validation
> });
> ```
>
> That is the fundamental difference: **types** can be directly
> recursive, **runtime objects** need lazy evaluation.

---

<!-- /depth -->
## Explain it to yourself: Why does Zod need z.lazy()?
<!-- section:summary -->
The answer: TypeScript types are evaluated **lazily** — the

<!-- depth:standard -->
> **Explain it to yourself:**
>
> Why does Zod need `z.lazy()` for recursive schemas, even though
> TypeScript allows recursive types directly?
>
> Hint: Think about the difference between compile time (types)
> and runtime (JavaScript objects).
>
> *Think for 30 seconds.*

The answer: TypeScript types are evaluated **lazily** — the
compiler doesn't need to fully unfold `LinkedList<T>` immediately.
But JavaScript objects are created **immediately**. Without `z.lazy()`,
`categorySchema` would reference itself **before it is fully defined** —
that's like using a variable before its declaration.

---

<!-- /depth -->
## Prisma: Recursive Includes and Selects
<!-- section:summary -->
Prisma's type system uses recursive types for nested

<!-- depth:standard -->
Prisma's type system uses recursive types for nested
database queries:

```typescript annotated
// Simplified: Prisma's Include type
type UserInclude = {
  posts?: boolean | {
    include?: {
      comments?: boolean | {
        include?: {
          author?: boolean | { include?: UserInclude };
          // ^ INDIRECT RECURSION: Comment → Author → User → Posts → ...
        };
      };
    };
  };
  profile?: boolean;
};

// In practice:
const user = await prisma.user.findFirst({
  include: {
    posts: {
      include: {
        comments: {
          include: {
            author: true,
            // ^ Prisma generates the matching return type!
          },
        },
      },
    },
  },
});
// user.posts[0].comments[0].author.name → type-safe!
```

---

<!-- /depth -->
## Config Objects with Recursive Types
<!-- section:summary -->
A common pattern: a configuration that can be nested arbitrarily

<!-- depth:standard -->
A common pattern: a configuration that can be nested arbitrarily
deep, but only allows certain value types:

```typescript annotated
// Configuration that only allows primitive values and nested
// configurations (no arrays, no functions)
type ConfigValue = string | number | boolean;
type ConfigSection = {
  [key: string]: ConfigValue | ConfigSection;
  // ^ Recursive: values are primitive OR further sections
};

// Type-safe configuration:
const appConfig: ConfigSection = {
  app: {
    name: "MyProject",
    version: "1.0.0",
    debug: false,
  },
  database: {
    host: "localhost",
    port: 5432,
    pool: {
      min: 2,
      max: 10,
      idle: {
        timeout: 30000,
        // ^ Arbitrarily deeply nested — TypeScript checks it
      },
    },
  },
  // app: [1, 2, 3],    // Error! Arrays not allowed
  // app: () => {},      // Error! Functions not allowed
};
```

---

<!-- /depth -->
## The Type-Safe deep-get: The Masterpiece
<!-- section:summary -->
Now we build the showcase project of this lesson — a `get` function

<!-- depth:standard -->
Now we build the showcase project of this lesson — a `get` function
that accesses nested objects **type-safely**:

```typescript annotated
// Step 1: Compute paths (from section 4)
type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
  : never;

// Step 2: Compute PathValue (from section 4)
type PathValue<T, P extends string> =
  P extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      : never
    : P extends keyof T
      ? T[P]
      : never;

// Step 3: The get function
function deepGet<T extends object, P extends Paths<T> & string>(
  obj: T,
  path: P
): PathValue<T, P> {
  // ^ Return type is COMPUTED from the path!
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined as PathValue<T, P>;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current as PathValue<T, P>;
}

// Usage:
type AppConfig = {
  server: {
    host: string;
    port: number;
    tls: { enabled: boolean; cert: string };
  };
  logging: { level: "debug" | "info" | "warn" | "error" };
};

declare const config: AppConfig;

const host = deepGet(config, "server.host");
// ^ Type: string ✓

const port = deepGet(config, "server.port");
// ^ Type: number ✓

const tlsEnabled = deepGet(config, "server.tls.enabled");
// ^ Type: boolean ✓

const level = deepGet(config, "logging.level");
// ^ Type: "debug" | "info" | "warn" | "error" ✓

// deepGet(config, "server.invalid");
// ^ Error: '"server.invalid"' is not assignable to parameter ✓
```

---

<!-- /depth -->
## Think About It: Where Is the Limit?

> **Think about it:**
>
> When is a recursive type **too clever**?
>
> Imagine a colleague opens your code and sees:
>
> ```typescript
> type DeepMerge<T, U> = {
>   [K in keyof T | keyof U]:
>     K extends keyof T & keyof U
>       ? T[K] extends object
>         ? U[K] extends object
>           ? DeepMerge<T[K], U[K]>
>           : U[K]
>         : U[K]
>       : K extends keyof T ? T[K]
>       : K extends keyof U ? U[K]
>       : never;
> };
> ```
>
> Will they understand it in 30 seconds? If not, you should
> perhaps consider a **comment** or a **simpler alternative**.

---

## Experiment: Build a Type-Safe deep-get

> **Experiment:**
>
> Copy the complete deep-get into a TypeScript file:
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
> function deepGet<T extends object, P extends Paths<T> & string>(
>   obj: T,
>   path: P
> ): PathValue<T, P> {
>   const keys = path.split(".");
>   let current: unknown = obj;
>   for (const key of keys) {
>     current = (current as Record<string, unknown>)[key];
>   }
>   return current as PathValue<T, P>;
> }
>
> // Test with your own data:
> const testObj = {
>   user: { name: "Max", age: 30 },
>   settings: { theme: "dark" as const, lang: "de" as const },
> };
>
> const name = deepGet(testObj, "user.name");       // string
> const theme = deepGet(testObj, "settings.theme");  // "dark"
>
> console.log(name, theme);
> ```
>
> Try out:
> 1. Type `deepGet(testObj, "` — do you see autocomplete?
> 2. Hover over the variables — are the types correct?
> 3. Try an invalid path — do you get an error?

---

## Router Types: Nested Routes Type-Safe
<!-- section:summary -->
An advanced practical pattern: **type-safe router definitions**:

<!-- depth:standard -->
An advanced practical pattern: **type-safe router definitions**:

```typescript annotated
// Route definition with recursive child routes
type RouteConfig = {
  path: string;
  component?: string;
  children?: RouteConfig[];
  // ^ RECURSION: children are RouteConfigs again
};

// Extract all paths from a route configuration
type ExtractPaths<R extends RouteConfig> =
  R extends { path: infer P extends string; children?: infer C }
    ? C extends RouteConfig[]
      ? P | `${P}/${ExtractPaths<C[number]>}`
      // ^ Recursion: parent path / child paths
      : P
    : never;

// Example:
type AppRoutes = {
  path: "";
  children: [
    { path: "home" },
    {
      path: "users";
      children: [
        { path: ":id" },
        { path: ":id/edit" },
      ];
    },
    { path: "settings" },
  ];
};

type AllPaths = ExtractPaths<AppRoutes>;
// "" | "home" | "users" | "users/:id" | "users/:id/edit" | "settings"
```

---

<!-- /depth -->
## Framework Reference: Type-Safe Navigation

> **In React with React Router:**
>
> ```typescript
> // React Router v6 doesn't use recursive typing (yet),
> // but community libraries do:
>
> // typesafe-routes (community library):
> const routes = {
>   home: route("home"),
>   users: route("users", {
>     detail: route(":id"),
>     edit: route(":id/edit"),
>   }),
> } as const;
>
> // Paths are recursively computed from the configuration
> navigate(routes.users.detail, { id: "42" });
> // ^ Type-safe: id must be a string
> ```
>
> **In Angular:**
>
> ```typescript
> // Angular Router has its own recursive route types:
> const routes: Routes = [
>   { path: "home", component: HomeComponent },
>   {
>     path: "users",
>     children: [  // ← Recursive route definition
>       { path: ":id", component: UserDetailComponent },
>       { path: ":id/edit", component: UserEditComponent },
>     ],
>   },
> ];
> // Angular's Routes type: Route[] with children?: Routes
> // That IS a recursive type!
> ```

---

## Checklist: When to Use Recursive Types?
<!-- section:summary -->
| Situation | Recursive Type? | Why? |

<!-- depth:standard -->
| Situation | Recursive Type? | Why? |
|-----------|----------------|--------|
| Typing JSON data | ✅ Yes | JSON is recursive by definition |
| Tree structures (menus, DOM) | ✅ Yes | Naturally recursive |
| DeepPartial/DeepReadonly | ✅ Yes | Frequently needed, good performance |
| Paths\<T\> for custom types | ✅ Usually yes | As long as types aren't too broad |
| Type-level arithmetic | ⚠️ Caution | Only in library code |
| Paths on external/generated types | ❌ Usually no | Can explode compile time |
| Recursive string parsers | ❌ Usually no | Better to parse at runtime |

---

<!-- /depth -->
## Summary

### What you've learned

You've seen recursive types in **real-world practice**:

- **Zod** needs `z.lazy()` for recursive schemas (runtime vs compile time)
- **Prisma** uses recursive include types for nested queries
- A **type-safe deep-get** combines Paths + PathValue + Generics
- **Router types** can recursively compute paths from a configuration
- The **checklist** helps you decide: recursive or not?

> **Core concept:** Recursive types are most powerful when they
> model **naturally recursive data structures** (JSON, trees,
> routes). They become problematic when used for things better
> solved at runtime (complex string parsers, arithmetic). The
> question is always: **Does the type safety justify the compile-time cost?**

---

## End of Lesson: Recursive Types
<!-- section:summary -->
You've worked through all six sections and now understand:

<!-- depth:standard -->
You've worked through all six sections and now understand:

1. **Fundamentals:** Self-reference + base case
2. **Tree structures:** JSON, DOM, ASTs as recursive types
3. **Deep operations:** DeepPartial, DeepReadonly and their mechanics
4. **Recursive conditionals:** Flatten, Paths, PathValue
5. **Limits:** Recursion limit, tail recursion, performance pitfalls
6. **Practice:** Zod, Prisma, deep-get, router types

**Recommended next step:**
1. Review the concepts once more in `cheatsheet.md`
2. Test your knowledge directly in the TUI via "Start quiz"
3. Take a break before moving on to the next topic

> **Next lesson:** 24 — Type-Level Programming
> There you'll go even deeper: string parsers, state machines,
> and complete programs at the type level.

<!-- /depth -->