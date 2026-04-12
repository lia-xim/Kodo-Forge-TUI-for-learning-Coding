# Section 3: Generic Interfaces and Types

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Generic Functions](./02-generische-funktionen.md)
> Next section: [04 - Constraints](./04-constraints.md)

---

## What you'll learn here

- How to create interfaces with type parameters
- Generic type aliases and when they're useful
- Why `Array<T>` and `Promise<T>` are generic
- Generic types with multiple parameters

---

> 📖 **Background: The Wrapper Problem in Software Development**
>
> One of the oldest challenges in software development:
> You have a general-purpose container (HTTP response, array, promise,
> future) and need to use it type-safely with arbitrary content.
>
> In the 1990s, C++ solved this with *template classes*: `vector<int>`,
> `list<string>`. The compiler generated a separate version of the class
> for each concrete type. This worked, but led to
> **code bloat** — massive binaries with many nearly-identical classes.
>
> Java and C# took a different approach in 2004: generics as a
> compile-time concept, reduced to a single type at runtime
> (type erasure in Java) or kept as true runtime types (C#).
>
> TypeScript's approach combines the best of both: compile-time safety like Java,
> structural typing for maximum flexibility, and no runtime
> overhead since TypeScript compiles to JavaScript anyway.
>
> **The result:** `interface Box<T>` — a single definition, infinitely
> many type-safe usages. No code bloat, no runtime costs.

---

## Generic Interfaces

Not only functions can be generic — interfaces can too:

```typescript annotated
interface Box<T> {
  content: T;
  label: string;
}

const stringBox: Box<string> = {
  content: "Hello World",
  label: "Greeting",
};
// ^ Box<string> — content is string

const numberBox: Box<number> = {
  content: 42,
  label: "The Answer",
};
// ^ Box<number> — content is number

const userBox: Box<{ name: string; age: number }> = {
  content: { name: "Max", age: 30 },
  label: "User",
};
// ^ Box with complex type — fully type-safe
```

The interface `Box<T>` is a **template**. Only when you replace `T` with a
concrete type does a complete type emerge.

---

## API Response — the classic example

Almost every API returns data wrapped in a common envelope:

```typescript annotated
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

// Different endpoints, same structure:
type UserResponse = ApiResponse<{ id: number; name: string; email: string }>;
type ProductResponse = ApiResponse<{ id: number; title: string; price: number }>;
type ListResponse = ApiResponse<{ items: string[]; total: number }>;

// Function that processes generic responses:
function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.status >= 400) {
    throw new Error(response.message);
  }
  return response.data;
}
```

The structure (`status`, `message`, `timestamp`) is always the same — only
`data` changes. That's exactly what generics model perfectly.

---

## Generic Type Aliases

Type aliases work the same way:

```typescript annotated
// Simple generic type alias
type Nullable<T> = T | null;

const name: Nullable<string> = "Max";    // string | null
const age: Nullable<number> = null;       // number | null

// Result type for error handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, data: a / b };
}

const result = divide(10, 3);
if (result.success) {
  console.log(result.data); // number — TypeScript knows it!
} else {
  console.log(result.error); // string
}
```

---

## Array<T> — the generic you already know

You've already been using generics — you just didn't know it:

```typescript annotated
// These two forms are IDENTICAL:
const a: number[] = [1, 2, 3];
const b: Array<number> = [1, 2, 3];

// number[] is just syntactic sugar for Array<number>
// TypeScript translates internally: number[] → Array<number>
```

The TypeScript standard library defines Array as a generic interface:

```typescript annotated
// Simplified from lib.es5.d.ts:
interface Array<T> {
  length: number;
  push(...items: T[]): number;
  pop(): T | undefined;
  map<U>(fn: (value: T, index: number) => U): U[];
  filter(fn: (value: T) => boolean): T[];
  find(fn: (value: T) => boolean): T | undefined;
  // ... many more methods
}
```

Every array method uses `T` — that's why TypeScript knows
that `[1,2,3].map(n => String(n))` produces a `string[]`.

---

## Multiple Type Parameters in Interfaces

Interfaces can have multiple type parameters:

```typescript annotated
interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

const setting: KeyValuePair<string, number> = {
  key: "maxRetries",
  value: 3,
};

const entry: KeyValuePair<number, string> = {
  key: 1,
  value: "one",
};

// Practical example: Paginated API
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

type UserPage = PaginatedResponse<{ id: number; name: string }>;
type ProductPage = PaginatedResponse<{ id: number; title: string; price: number }>;
```

---

> 💭 **Think about it:** You see these two definitions in a codebase:
>
> ```typescript
> // Version A:
> interface UserApiResponse { data: User; status: number; message: string; }
> interface ProductApiResponse { data: Product; status: number; message: string; }
>
> // Version B:
> interface ApiResponse<T> { data: T; status: number; message: string; }
> ```
>
> Imagine the API changes its response format — `message` becomes
> `errorMessage`, and a `requestId` field is added. **How many
> files do you need to change in Version A vs. Version B?**
>
> This is the DRY principle (Don't Repeat Yourself) at the type level.
> With `ApiResponse<T>` you change **one** place. With separate interfaces
> you change each one individually — and you're guaranteed to miss one.

---

## Generic Interfaces for Function Types

You can also describe the type of a function generically:

```typescript annotated
// Generic interface for a comparison function
interface Comparator<T> {
  (a: T, b: T): number;
}

const numberCompare: Comparator<number> = (a, b) => a - b;
const stringCompare: Comparator<string> = (a, b) => a.localeCompare(b);

// Generic interface for the repository pattern
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Different repositories with the same interface:
// class UserRepository implements Repository<User> { ... }
// class ProductRepository implements Repository<Product> { ... }
```

The repository pattern demonstrates the power: **One interface definition,
any number of type-safe implementations.**

---

## Interface vs. Type Alias with Generics

Both work. The choice follows the same rules as without generics:

```typescript annotated
// Interface: for object shapes, extensible
interface Container<T> {
  value: T;
  transform<U>(fn: (value: T) => U): Container<U>;
}

// Type alias: for unions, intersections, utility types
type MaybePromise<T> = T | Promise<T>;
type ReadonlyDeep<T> = {
  readonly [K in keyof T]: ReadonlyDeep<T[K]>;
};
```

| Feature | Interface | Type Alias |
|---------|-----------|------------|
| Object shapes | Preferred | Possible |
| Unions/Intersections | Not possible | Preferred |
| Declaration Merging | Yes | No |
| Mapped Types | No | Yes |

---

## In your Angular project: Generic interfaces in practice

The repository pattern and the response-wrapper pattern are among the
most common uses of generics in Angular:

```typescript annotated
// A generic service layer for all entities:
interface CrudService<T, TCreate = Omit<T, 'id'>> {
  getAll(): Observable<T[]>;
  getById(id: number): Observable<T>;
  create(data: TCreate): Observable<T>;
  update(id: number, data: Partial<T>): Observable<T>;
  delete(id: number): Observable<void>;
}

// user.service.ts — only the user-specific parts:
@Injectable({ providedIn: 'root' })
class UserService implements CrudService<User> {
  getAll() { return this.http.get<User[]>('/api/users'); }
  // ... TypeScript verifies that ALL interface methods are implemented
}

// product.service.ts — identical structure, different type:
@Injectable({ providedIn: 'root' })
class ProductService implements CrudService<Product> {
  getAll() { return this.http.get<Product[]>('/api/products'); }
  // ...
}
```

**In React:**

```typescript
// A generic list component for all entities:
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

function GenericList<T>({ items, renderItem, keyExtractor, emptyMessage = "No entries" }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyMessage}</p>;
  return <ul>{items.map((item, i) => <li key={keyExtractor(item)}>{renderItem(item, i)}</li>)}</ul>;
}

// Usage — TypeScript infers T:
<GenericList
  items={users}
  renderItem={u => <span>{u.name}</span>}
  keyExtractor={u => u.id}
/>
// T = User — automatically inferred from items={users}
```

---

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> // Generic cache with expiry time:
> interface CacheEntry<T> {
>   value: T;
>   expiresAt: number;
> }
>
> class Cache<T> {
>   private store = new Map<string, CacheEntry<T>>();
>
>   set(key: string, value: T, ttlMs: number): void {
>     this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
>   }
>
>   get(key: string): T | null {
>     const entry = this.store.get(key);
>     if (!entry || entry.expiresAt < Date.now()) return null;
>     return entry.value;
>   }
> }
>
> const userCache = new Cache<{ id: number; name: string }>();
> userCache.set("user-1", { id: 1, name: "Max" }, 5000);
> const user = userCache.get("user-1");
> // What is the type of user? Hover over it in the Playground.
> ```
>
> Then change `new Cache<{ id: number; name: string }>()` to `new Cache()` —
> what does TypeScript say? And what happens with `userCache.set("x", 42, 1000)`?

---

## What you've learned

- Generic interfaces `interface Name<T>` are templates — only complete once given a concrete type
- `ApiResponse<T>` is the classic example: same envelope, different data
- Type aliases `type Name<T>` work exactly the same — better for unions and mapped types
- `number[]` is syntactic sugar for `Array<number>` — you've been using generics all along
- The repository pattern (`interface Repository<T>`) is a textbook example of generics

**Core concept:** Generic interfaces bring DRY to the type level. Instead of `UserApiResponse`, `ProductApiResponse`, `OrderApiResponse`, you write `ApiResponse<T>` — one definition that works with any type while still guaranteeing full type safety.

---

## Summary

| Concept | Syntax | Example |
|---------|--------|---------|
| Generic interface | `interface Name<T>` | `interface Box<T> { content: T }` |
| Generic type alias | `type Name<T>` | `type Nullable<T> = T \| null` |
| Multiple parameters | `<K, V>` | `interface Map<K, V>` |
| Array notation | `T[]` = `Array<T>` | `number[]` = `Array<number>` |

---

> 🧠 **Explain it to yourself:** Why is `ApiResponse<T>` better than
> separate interfaces `UserApiResponse`, `ProductApiResponse`, etc.?
> **Key points:** DRY principle | Structural changes only needed in one place | Functions that process generic responses

---

> **Pause point** — Ready? Then continue to [Section 04: Constraints](./04-constraints.md)