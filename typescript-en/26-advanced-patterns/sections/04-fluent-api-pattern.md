# Section 4: The Fluent API Pattern

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Phantom Types](./03-phantom-types.md)
> Next section: [05 - Newtype Pattern](./05-newtype-pattern.md)

---

## What you'll learn here

- How to build **Fluent APIs** with type-safe method chaining in TypeScript
- Why the **return type** can change at each step
- How to control **context-dependent methods** with Conditional Types
- The difference between **simple chaining** and **type-safe chaining**

---

## Background: The Elegance of Fluent APIs

> **Feature Origin Story: Fluent Interfaces**
>
> The term "Fluent Interface" was coined in 2005 by Martin Fowler and
> Eric Evans. The idea: APIs that read like natural language,
> through method chaining.
>
> jQuery (2006) popularized the pattern: `$("div").addClass("active").show().fadeIn()`.
> Today you find it everywhere: Lodash, Knex (SQL Builder), Cypress
> (Testing), RxJS pipes, and even CSS-in-JS libraries.
>
> TypeScript has a decisive advantage over JavaScript:
> The return type can **change** at each step, thereby
> **unlocking or blocking other methods**. That is the
> difference between "chaining that works" and "chaining
> that is verified at compile time".

---

## Simple Method Chaining: `return this`
<!-- section:summary -->
The simplest fluent pattern: every method returns `this`:

<!-- depth:standard -->
The simplest fluent pattern: every method returns `this`:

```typescript annotated
class QueryBuilder {
  private parts: string[] = [];

  select(columns: string): this {
    // ^ 'this' as return type — important for inheritance!
    this.parts.push(`SELECT ${columns}`);
    return this;
  }

  from(table: string): this {
    this.parts.push(`FROM ${table}`);
    return this;
  }

  where(condition: string): this {
    this.parts.push(`WHERE ${condition}`);
    return this;
  }

  orderBy(column: string): this {
    this.parts.push(`ORDER BY ${column}`);
    return this;
  }

  build(): string {
    return this.parts.join(" ");
  }
}

// Fluent API in action:
const sql = new QueryBuilder()
  .select("name, email")
  .from("users")
  .where("active = true")
  .orderBy("name")
  .build();
// ^ Reads almost like SQL! Each method returns the builder.
```

> 💭 **Think about it:** What is the difference between `this` and the
> class name as a return type? Why is `this` better?
>
> **Answer:** `this` is polymorphic — when a subclass inherits, `this`
> returns the subclass type, not the parent class type.
> Using `QueryBuilder` as the return type would "lose" the
> subclass methods when inheriting.

---

<!-- /depth -->
## Problem: No Order Enforcement
<!-- section:summary -->
The simple builder allows nonsensical calls:

<!-- depth:standard -->
The simple builder allows nonsensical calls:

```typescript
// Syntactically OK, semantically wrong:
new QueryBuilder()
  .where("active = true")   // WHERE without SELECT and FROM?
  .orderBy("name")          // ORDER BY without FROM?
  .build();
// ^ TypeScript doesn't complain — every method returns 'this'.
```

---

<!-- /depth -->
## Type-Safe Chaining: Unlocking Methods Step by Step

```typescript annotated
// Step-by-step types:
interface SelectStep {
  select(columns: string): FromStep;
  // ^ After select() → only from() available
}

interface FromStep {
  from(table: string): WhereOrBuildStep;
  // ^ After from() → where() OR build()
}

interface WhereOrBuildStep {
  where(condition: string): OrderOrBuildStep;
  orderBy(column: string): BuildStep;
  build(): string;
  // ^ Three options: filter, sort, or finish
}

interface OrderOrBuildStep {
  orderBy(column: string): BuildStep;
  build(): string;
  // ^ Two options: sort or finish
}

interface BuildStep {
  build(): string;
  // ^ Only build() left — nothing else possible
}

// Implementation (simplified):
function createQuery(): SelectStep {
  const parts: string[] = [];

  const buildStep: BuildStep = {
    build: () => parts.join(" "),
  };

  const orderOrBuild: OrderOrBuildStep = {
    orderBy: (col) => { parts.push(`ORDER BY ${col}`); return buildStep; },
    build: buildStep.build,
  };

  const whereOrBuild: WhereOrBuildStep = {
    where: (cond) => { parts.push(`WHERE ${cond}`); return orderOrBuild; },
    orderBy: orderOrBuild.orderBy,
    build: buildStep.build,
  };

  return {
    select: (cols) => {
      parts.push(`SELECT ${cols}`);
      return {
        from: (table) => { parts.push(`FROM ${table}`); return whereOrBuild; },
      };
    },
  };
}

// Now: order is enforced!
createQuery().select("*").from("users").where("id = 1").build(); // OK
// createQuery().from("users"); // COMPILE ERROR: from() does not exist on SelectStep
// createQuery().select("*").build(); // COMPILE ERROR: build() does not exist on FromStep
```

> 🧠 **Explain it to yourself:** Why do we define the steps as
> separate interfaces instead of putting everything in one class? What would be
> the downside of a single class?
>
> **Key points:** Separate interfaces = only allowed methods per step |
> One class = all methods always visible | IDE autocomplete shows only
> valid next steps | Impossible calls don't just error — they DON'T EXIST in the type

---

## Generic Fluent API: Type Accumulates Knowledge
<!-- section:summary -->
For more complex APIs, the generic parameter can collect information:

<!-- depth:standard -->
For more complex APIs, the generic parameter can collect information:

```typescript annotated
type QueryConfig = {
  hasSelect: boolean;
  hasFrom: boolean;
  hasWhere: boolean;
};

// Start config: nothing set
type EmptyConfig = { hasSelect: false; hasFrom: false; hasWhere: false };

class FluentQuery<Config extends QueryConfig = EmptyConfig> {
  private parts: string[] = [];

  // select() only available if not yet called:
  select(
    this: FluentQuery<Config & { hasSelect: false }>,
    columns: string
  ): FluentQuery<Config & { hasSelect: true }> {
    // ^ Before: hasSelect=false, After: hasSelect=true
    this.parts.push(`SELECT ${columns}`);
    return this as any;
  }

  // from() only available after select():
  from(
    this: FluentQuery<Config & { hasSelect: true; hasFrom: false }>,
    table: string
  ): FluentQuery<Config & { hasFrom: true }> {
    this.parts.push(`FROM ${table}`);
    return this as any;
  }

  // build() only available when both select AND from are set:
  build(
    this: FluentQuery<{ hasSelect: true; hasFrom: true; hasWhere: boolean }>
  ): string {
    return this.parts.join(" ");
  }
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Try the following calls — which ones compile?
>
> ```typescript
> const q = new FluentQuery();
>
> // 1:
> q.select("*").from("users").build();        // Compiles? ___
>
> // 2:
> q.from("users");                            // Compiles? ___
>
> // 3:
> q.select("*").select("name");               // Compiles? ___
>
> // 4:
> q.select("*").build();                      // Compiles? ___
> ```
>
> **Answers:** 1: Yes | 2: No (select missing) |
> 3: No (select already called) | 4: No (from missing)

---

<!-- /depth -->
## In Practice: Fluent APIs in Frameworks

> ⚡ **In your Angular project** you encounter Fluent APIs constantly:
>
> ```typescript
> // RxJS Pipe — a Fluent API:
> this.http.get<User[]>('/api/users').pipe(
>   filter(users => users.length > 0),
>   map(users => users.map(u => u.name)),
>   catchError(err => of([])),
> );
> // ^ pipe() is technically not method chaining (function, not method),
> //   but the same principle: composition in readable order.
>
> // Angular TestBed — a builder with Fluent API:
> TestBed.configureTestingModule({
>   declarations: [AppComponent],
>   imports: [HttpClientModule],
> }).compileComponents();
> // ^ configureTestingModule() returns TestBed → chaining possible
> ```
>
> In React, React Query is a classic example:
>
> ```typescript
> // TanStack Query — builder pattern for queries:
> queryOptions({
>   queryKey: ['users'],
>   queryFn: fetchUsers,
>   staleTime: 5 * 60 * 1000,
>   select: (data) => data.filter(u => u.active),
> });
> // ^ Not true chaining, but a "configuration builder"
> ```

---

## When to Use Fluent API, When Not To?
<!-- section:summary -->
| Situation | Fluent API | Alternative |

<!-- depth:standard -->
| Situation | Fluent API | Alternative |
|---|---|---|
| SQL/Query builder | Yes — reads naturally | — |
| Configurations | Yes — incremental construction | Object literal |
| Simple parameters | No — overkill | Direct function call |
| Library API | Yes — good DX | — |
| Internal code | Usually no | Simple functions |

---

<!-- /depth -->
## What you've learned

- **Fluent APIs** use method chaining for readable, naturally-worded calls
- **Simple chaining** (`return this`) allows any order — often too permissive
- **Type-safe chaining** with step interfaces enforces the correct order
- **Generic accumulation** can track which methods have already been called
- `this` as a return type is polymorphic and supports inheritance

> 🧠 **Explain it to yourself:** What is the connection between the
> type-safe builder (Section 1) and the type-safe Fluent API?
>
> **Key points:** Both use types as "memory" | Builder tracks
> set fields | Fluent API tracks called methods |
> Both return a new type at each step

**Core concept to remember:** A Fluent API is only as good as its
type information. Simple `return this` is convenient, but type-safe
step interfaces prevent incorrect ordering at compile time.

---

> **Pause point** — You've mastered Fluent APIs. Next topic:
> The Newtype Pattern — wrappers without runtime cost.
>
> Continue with: [Section 05: Newtype Pattern](./05-newtype-pattern.md)