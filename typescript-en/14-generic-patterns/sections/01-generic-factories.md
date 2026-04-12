# Section 1: Generic Factories

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Generic Collections](./02-generic-collections.md)

---

## What you'll learn here

- How factory functions use generics to create arbitrary instances in a type-safe way
- The `createInstance<T>` pattern and its variants
- How the builder pattern is guided by the compiler — step by step
- Why generics in factories enable type inference instead of forcing it

---

## Background: How Lodash Woke Up TypeScript

In 2014, Lodash had a problem. The library was the most widely used
JavaScript utility toolkit in the world — but its type definitions were catastrophic.
`_.map(collection, iteratee)` returned `any[]`. `_.groupBy()` did too.
Every return value was a guessing game.

In 2016, Boris Yankov began the `DefinitelyTyped` project to
reimplement the Lodash types — this time with generics. Suddenly the compiler knew that
`_.map([1, 2, 3], n => n.toString())` returns a `string[]`. That was
a small revolution: it proved that generics aren't "academic" —
they directly improve the developer experience.

Today the fundamental principle is everywhere: React Hooks, Angular Services, RxJS
Operators — they all use generic factories. You're currently working on the
foundations of exactly that.

---

## The Problem: Factories Without Generics

Imagine you're building a system that creates various objects. Without
generics you lose type information:

```typescript annotated
function createObject(data: unknown): unknown {
  return data;
}

const user = createObject({ name: "Max", age: 30 });
// ^ Type: unknown — all type info is gone!
// user.name -> Error: Object is of type 'unknown'
```

It's like a delivery service that forgets the contents of every package. You get
your package back, but nobody can tell you what's inside.

> **The core question:** How do we create factories that PRESERVE the type of the
> created object — regardless of which type is passed in?

---

## createInstance: The Basic Pattern

The simplest generic factory takes a type parameter and returns it
in a type-safe way:

```typescript annotated
function createInstance<T>(data: T): T {
  return { ...data };
}

const user = createInstance({ name: "Max", age: 30 });
// ^ Type: { name: string; age: number } — fully inferred!

const config = createInstance({ debug: true, port: 3000 });
// ^ Type: { debug: boolean; port: number }
```

TypeScript infers `T` automatically from the argument. You don't have to
specify the type explicitly — but you can:

```typescript annotated
interface User {
  name: string;
  age: number;
  email?: string;
}

// Explicit type parameter — enforces the structure:
const user = createInstance<User>({ name: "Max", age: 30 });
// ^ Type: User — with optional email
```

> 🧠 **Explain to yourself:** When would you specify the type parameter explicitly
> instead of letting it be inferred?
> **Key points:** When you want to enforce an interface | When inference is too broad | When optional properties matter

---

## Factory With Constructor Signature

Often you don't want to copy an object but instantiate a class.
For that the factory needs the constructor signature:

```typescript annotated
// { new (...args: any[]): T } describes "something that can be called with new"
function createInstance<T>(Ctor: { new (): T }): T {
  return new Ctor();
}

class UserService {
  getUsers() { return ["Max", "Anna"]; }
}

class ProductService {
  getProducts() { return ["Laptop", "Phone"]; }
}

const userService = createInstance(UserService);
// ^ Type: UserService — with getUsers()

const productService = createInstance(ProductService);
// ^ Type: ProductService — with getProducts()
```

### With Constructor Arguments

```typescript annotated
// Args tuple for arbitrary constructor parameters:
function createInstance<T, Args extends unknown[]>(
  Ctor: { new (...args: Args): T },
  ...args: Args
): T {
  return new Ctor(...args);
}

class Database {
  constructor(public host: string, public port: number) {}
}

const db = createInstance(Database, "localhost", 5432);
// ^ Type: Database — TypeScript knows host and port!
// db.host -> "localhost", db.port -> 5432
```

> 📖 **Background: Construct Signatures in TypeScript**
>
> The `{ new (...args: Args): T }` pattern is called a "construct
> signature". It describes anything that can be called with `new`:
> classes and classic constructor functions. Unlike Java or C#,
> where classes and interfaces are clearly separated, TypeScript is structural —
> a class is "just" an object with a construct signature. This enables
> the pattern and makes dependency injection containers (like in Angular)
> possible with full type support.

> 💭 **Think about it:** A `createInstance` function only knows the type `T` at
> compile time. At runtime there is no `T`. How can it still instantiate the
> correct class? What actually happens in the JavaScript that gets generated?

---

## Factory With Defaults and Partials

A common pattern: creating objects with default values where the
caller only needs to specify some of the properties.

```typescript annotated
function createWithDefaults<T>(defaults: T) {
  return (overrides: Partial<T>): T => {
    return { ...defaults, ...overrides };
  };
}

interface ButtonConfig {
  label: string;
  variant: "primary" | "secondary" | "danger";
  disabled: boolean;
  size: "sm" | "md" | "lg";
}

const createButton = createWithDefaults<ButtonConfig>({
  label: "Click me",
  variant: "primary",
  disabled: false,
  size: "md",
});

const dangerBtn = createButton({ variant: "danger", label: "Delete" });
// ^ Type: ButtonConfig — all properties are present
// dangerBtn.disabled -> false (from default)
// dangerBtn.variant -> "danger" (overridden)
```

This is the **Partial Factory Pattern**: the outer function fixes the
defaults, the inner one only accepts the changes.

> ⚡ **Angular connection:** This exact pattern underlies `InjectionToken` with
> default values. When you write `new InjectionToken('myToken',
> { providedIn: 'root', factory: () => defaultValue })` in Angular, that's
> a generic factory creating a type-safe token. The token carries
> its type `T` at compile time — and Angular resolves it at runtime.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> function createWithDefaults<T>(defaults: T) {
>   return (overrides: Partial<T>): T => ({ ...defaults, ...overrides });
> }
> interface Theme { primary: string; secondary: string; radius: number }
> const createTheme = createWithDefaults<Theme>({
>   primary: "#3b82f6",
>   secondary: "#64748b",
>   radius: 4,
> });
> const darkTheme = createTheme({ primary: "#1e40af" });
> // Hover over darkTheme — what type does the editor show?
> // Try: createTheme({ unknown: "x" }) — what does TypeScript say?
> ```
> What happens when you replace `Partial<T>` with `T`? Try it out.

---

## Builder Pattern With Generics

The builder pattern creates objects step by step. With generics the
builder can track the growing type:

```typescript annotated
class Builder<T extends Record<string, unknown> = {}> {
  private data: T;

  constructor(data: T = {} as T) {
    this.data = data;
  }

  set<K extends string, V>(
    key: K,
    value: V
  ): Builder<T & Record<K, V>> {
    return new Builder({ ...this.data, [key]: value } as T & Record<K, V>);
  }

  build(): T {
    return this.data;
  }
}

const result = new Builder()
  .set("name", "Max")
  .set("age", 30)
  .set("active", true)
  .build();
// ^ Type: {} & Record<"name", string> & Record<"age", number> & Record<"active", boolean>
// Simplified: { name: string; age: number; active: boolean }
```

Every `.set()` call EXTENDS the type. TypeScript knows after `.build()` which
properties exist — even though they were added dynamically.

> **Why a new instance?** `set()` returns a NEW builder instead of
> mutating `this`. This is "immutable builder" — each step creates
> a new type. If you returned `this`, TypeScript wouldn't be able to track
> the growing type.

---

## Registry Pattern: Factory of Factories

An advanced pattern: a registry that stores factories by name
and calls the right factory in a type-safe way.

```typescript annotated
interface ServiceMap {
  user: { name: string; role: string };
  product: { title: string; price: number };
  order: { items: string[]; total: number };
}

function createServiceFactory<M extends Record<string, unknown>>() {
  const factories = new Map<string, () => unknown>();

  return {
    register<K extends keyof M>(key: K, factory: () => M[K]) {
      factories.set(key as string, factory);
    },
    create<K extends keyof M>(key: K): M[K] {
      const factory = factories.get(key as string);
      if (!factory) throw new Error(`No factory for ${String(key)}`);
      return factory() as M[K];
    },
  };
}

const registry = createServiceFactory<ServiceMap>();

registry.register("user", () => ({ name: "Max", role: "admin" }));
registry.register("product", () => ({ title: "Laptop", price: 999 }));

const user = registry.create("user");
// ^ Type: { name: string; role: string }

const product = registry.create("product");
// ^ Type: { title: string; price: number }
```

> ⚡ **React connection:** The registry pattern is everywhere in the React ecosystem.
> `React.createContext<T>()` is a generic factory that creates a
> type-safe context token. `createSlice` in Redux Toolkit registers
> type-safe action creator factories. The pattern is always the same: a
> generic key connects registration and invocation.

---

## What you've learned

- Generic factories preserve the type of the created object through the type parameter `T`
- Constructor signatures (`{ new (): T }`) describe anything that can be called with `new`
- The partial factory pattern combines defaults with optional overrides
- The immutable builder pattern extends the type with every `.set()` call
- The registry pattern connects factory names to their return types in a type-safe way

**Core concept:** A generic factory does not discard the type of the created object —
it carries it as a type parameter through the entire creation process
and delivers it fully to the caller at the end.

> 🧠 **Explain to yourself:** What is the difference between a generic
> factory and an ordinary function with `any` as the return type? Why
> is one not a simple replacement for the other?
> **Key points:** any disables type safety completely | A generic factory returns the exact type | With any you lose autocomplete and error hints at the call site

---

> **Pause point** — You now have the foundation for generic factories.
> The patterns here appear in every large TypeScript project.
>
> Continue with: [Section 02 — Generic Collections](./02-generic-collections.md)