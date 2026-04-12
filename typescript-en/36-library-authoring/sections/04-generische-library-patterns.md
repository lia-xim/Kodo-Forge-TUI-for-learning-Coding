# Section 4: Generic Library Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Dual Package (CJS + ESM)](./03-dual-package-cjs-esm.md)
> Next section: [05 - Versioning and Breaking Changes in Types](./05-versionierung-und-breaking-changes.md)

---

## What you'll learn here

- How to use **overloads** for flexible and type-safe APIs
- Why **conditional return types** improve developer ergonomics
- How to design **generic wrappers** that feel "magical"
- Which **patterns** successful libraries (Zod, tRPC, Prisma) use

---

## Background: The Art of Library Types

> **Origin Story: How Zod Defined TypeScript-First Library Design**
>
> Colin McDonnell released Zod in 2020 with a radical approach:
> The schema IS the type. `z.object({ name: z.string() })` automatically
> generates the TypeScript type `{ name: string }` — without manual
> type definitions. This works through a brilliant combination
> of generics, conditional types, and method chaining.
>
> Zod proved that library types don't just need to be "correct" —
> they also need to FEEL good. Autocomplete should suggest the right
> options, error messages should be understandable, and
> the consumer should need to annotate as little as possible.
>
> Before Zod, the standard was: define the type manually, then write the validator,
> then make sure both stay in sync. Three
> artifacts for one thing. Zod turned that into: define the schema,
> derive the type from it. Two artifacts become one. That's the magic
> of TypeScript-first design — and the principle behind tRPC, Prisma,
> and many other modern libraries.

Good library types have three properties:
1. **Inference:** The consumer annotates as little as possible
2. **Precision:** Return types are as specific as possible
3. **Ergonomics:** Error messages are understandable

Why does this matter so much? Because bad types drive consumers to
despair. A return type of `any` forces the consumer into manual
annotation — type safety becomes an illusion.
A union type that's too broad requires unnecessary type guards. Confusing
error messages cost hours. Good library types "disappear" —
the consumer stops thinking about types entirely, because everything just
works.

---

## Pattern 1: Overloads for Flexible APIs

Overloads allow different signatures for the same function:

```typescript annotated
// One function, multiple call variants:
export function createClient(url: string): Client;
export function createClient(config: ClientConfig): Client;
export function createClient(urlOrConfig: string | ClientConfig): Client {
  // ^ Implementation signature — NOT visible to consumers
  const config = typeof urlOrConfig === "string"
    ? { url: urlOrConfig }
    : urlOrConfig;
  return new Client(config);
}

// Consumers only see the overload signatures:
createClient("https://api.example.com");        // OK (signature 1)
createClient({ url: "https://...", timeout: 5000 }); // OK (signature 2)
createClient(42);                                // ERROR
// ^ TypeScript shows both signatures as suggestions
```

Advanced: **Overloads with different return types:**

```typescript annotated
export function fetch<T>(url: string): Promise<T>;
export function fetch<T>(url: string, options: { stream: true }): AsyncIterable<T>;
export function fetch<T>(url: string, options?: { stream?: boolean }): Promise<T> | AsyncIterable<T> {
  // ^ Different return types depending on parameters
  if (options?.stream) {
    return createStream<T>(url);
  }
  return fetchJson<T>(url);
}

// Consumers experience:
const data = await fetch<User>("/api/users");
// ^ Type: User (Promise variant)

const stream = fetch<LogEntry>("/api/logs", { stream: true });
// ^ Type: AsyncIterable<LogEntry> (stream variant)
```

> 🧠 **Explain to yourself:** Why doesn't TypeScript show the implementation signature in the IDE? What would the problem be if it did?
> **Key points:** Implementation signature is too broad (string | ClientConfig) | Consumers should see the precise overloads | IDE only shows overloads as suggestions | Implementation must cover all overloads

---

## Pattern 2: Conditional Return Types

Instead of overloads, you can also compute the return type conditionally:

```typescript annotated
// The return type depends on the input:
type ParseResult<T extends string> =
  T extends `${number}` ? number :
  T extends "true" | "false" ? boolean :
  string;

export function parse<T extends string>(value: T): ParseResult<T> {
  if (!isNaN(Number(value))) return Number(value) as any;
  if (value === "true" || value === "false") return (value === "true") as any;
  return value as any;
  // ^ 'as any' in the implementation is OK — the types are correct
  // ^ The consumer only sees the conditional return type
}

// Consumers experience:
const n = parse("42");      // Type: number
const b = parse("true");    // Type: boolean
const s = parse("hello");   // Type: string
// ^ The type ADAPTS to the input — magical for the consumer
```

> 💭 **Think about it:** Why is `as any` acceptable in the implementation,
> but `as any` in the public API is not?
>
> **Answer:** The implementation is an implementation detail — the
> consumer never sees it (it's not in the .d.ts). As long as the
> public types (overloads, conditional returns) are correct,
> `as any` internally is fine. It's like a kitchen door: what happens
> behind it, the guest never sees.

---

## Pattern 3: Builder with Type Accumulation

The builder pattern from L26 is especially powerful in libraries:

```typescript annotated
// Type-safe query builder (similar to Prisma, Knex)
type TableNames = "users" | "posts" | "comments";
type TableColumns = {
  users: "id" | "name" | "email";
  posts: "id" | "title" | "authorId";
  comments: "id" | "text" | "postId";
};

class QueryBuilder<
  T extends TableNames = never,
  Selected extends string = never
> {
  from<Table extends TableNames>(table: Table): QueryBuilder<Table, never> {
    // ^ Sets the table type — now only columns of this table are available
    return this as any;
  }

  select<Col extends TableColumns[T]>(
    ...columns: Col[]
  ): QueryBuilder<T, Selected | Col> {
    // ^ Accumulates selected columns in the generic
    return this as any;
  }

  where(column: TableColumns[T], value: unknown): this {
    // ^ Only columns of the current table are allowed
    return this;
  }

  execute(): Promise<Record<Selected, unknown>[]> {
    // ^ Return type is based on the SELECTED columns
    return Promise.resolve([]);
  }
}

// Consumers experience:
const query = new QueryBuilder()
  .from("users")
  .select("name", "email")
  // ^ Autocomplete shows: "id" | "name" | "email"
  .where("name", "Max");
  // ^ Autocomplete shows: "id" | "name" | "email"

const result = await query.execute();
// ^ Type: Record<"name" | "email", unknown>[]
```

> ⚡ **Framework connection (Angular):** Angular's `HttpClient` uses a
> similar pattern — the generic type is accumulated through the method chain:
>
> ```typescript
> this.http.get<User[]>('/api/users')          // Type: Observable<User[]>
>   .pipe(map(users => users.length))          // Type: Observable<number>
>   .subscribe(count => console.log(count));   // count: number
> ```
>
> Each operator in the pipe refines the type. This is the same
> principle as the builder above. The type "flows" through the chain and
> each step makes it more precise — never broader, always more specific.
>
> In your own Angular library you could use the same pattern
> to build, for example, a type-safe state manager:
> `.select("users")` returns `Observable<User[]>`, not
> `Observable<unknown>`. This is no accident — it's builder with
> type accumulation in action.

---

## Pattern 4: Inference from Configuration Objects

The Zod pattern — the type emerges from the configuration:

```typescript annotated
// The configuration DEFINES the type:
function defineSchema<T extends Record<string, "string" | "number" | "boolean">>(
  schema: T
): {
  parse: (data: unknown) => {
    [K in keyof T]: T[K] extends "string" ? string
      : T[K] extends "number" ? number
      : T[K] extends "boolean" ? boolean
      : never
  }
} {
  return {
    parse(data: unknown) {
      // Runtime validation here...
      return data as any;
    }
  };
}

// Consumers experience:
const userSchema = defineSchema({
  name: "string",
  age: "number",
  active: "boolean"
});

const user = userSchema.parse(rawData);
// ^ Type: { name: string; age: number; active: boolean }
// ^ The type was AUTOMATICALLY derived from the schema!
// ^ No manual type definition needed
```

> 🧪 **Experiment:** Build a mini version of the Zod pattern:
>
> ```typescript
> function define<T extends Record<string, "string" | "number">>(schema: T) {
>   return {
>     validate: (data: unknown): { [K in keyof T]: T[K] extends "string" ? string : number } => {
>       return data as any; // Simplified
>     }
>   };
> }
>
> const s = define({ name: "string", count: "number" });
> const result = s.validate({});
> // Hover over 'result' — what type does the IDE show?
> // Expected: { name: string; count: number }
> ```
>
> This is the essence of "schema = type" — a configuration that derives the
> TypeScript type at compile time.

---

## What you've learned

- **Overloads** provide different signatures for flexible APIs
- **Conditional return types** adapt the return type to the input
- **Builder with type accumulation** tracks state in generics (Prisma, query builders)
- **Schema-to-type inference** derives types from configuration (Zod pattern)
- `as any` in implementations is **acceptable** when the public types are correct

**Core concept to remember:** Good library types feel "magical" — the consumer writes minimal code and gets maximum type safety. You achieve this through inference (the compiler calculates the type), precision (conditional returns), and ergonomics (overloads + autocomplete).

---

> **Pause point** — Good moment for a break. You now know the
> patterns that professional libraries use.
>
> Continue with: [Section 05: Versioning and Breaking Changes in Types](./05-versionierung-und-breaking-changes.md)