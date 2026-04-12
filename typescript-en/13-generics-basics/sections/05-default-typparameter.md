# Section 5: Default Type Parameters

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Constraints](./04-constraints.md)
> Next section: [06 - Generics in Practice](./06-generics-in-der-praxis.md)

---

## What you'll learn here

- How default types work with type parameters (`<T = string>`)
- When default types make sense
- The ordering rules (defaults must come last)
- Patterns: event systems, factory functions, configurations

---

> 📖 **Background:** Default type parameters were introduced in **TypeScript 2.3**
> (April 2017). The inspiration came directly from C++, where
> *default template arguments* have existed since C++11:
> `template<typename T = int>`. Java has also discussed the concept for
> years but never introduced it — there you always have to be explicit.
> In TypeScript, defaults solve a real ergonomics problem: libraries
> can keep the "simple case" simple without sacrificing flexibility.

---

## The Problem: Always Having to Specify the Type

Sometimes there's a "typical" type, but you still want flexibility:

```typescript annotated
interface Container<T> {
  value: T;
  label: string;
}

// Without a default: you MUST always specify T
const a: Container<string> = { value: "hello", label: "text" };
const b: Container<number> = { value: 42, label: "number" };

// What if 90% of cases use string?
// Then it's tedious to write <string> every time.
```

---

## The Solution: Default Type Parameters

```typescript annotated
interface Container<T = string> {
  value: T;
  label: string;
}

// Without an explicit type: T is string (the default)
const a: Container = { value: "hello", label: "text" };
// ^ Container = Container<string>

// With an explicit type: default is overridden
const b: Container<number> = { value: 42, label: "number" };
// ^ Container<number> — default ignored
```

The syntax `<T = string>` works exactly like default parameters
in functions: if nothing is specified, the default applies.

> **Analogy:** Defaults in generics are like defaults in
> function parameters — if you don't provide anything, the default is used.
> Just as `function greet(name = "World")` uses `"World"` when called without
> an argument, `Container` uses `string` when no type argument is provided.
> The mechanism is the same, just at the type level instead of the value level.

---

## Combining Default with Constraint

Defaults and constraints can be used together:

```typescript annotated
interface Identifiable {
  id: string | number;
}

interface Repository<T extends Identifiable = { id: number; name: string }> {
  findById(id: T["id"]): Promise<T | null>;
  save(entity: T): Promise<T>;
}
// ^ T must satisfy Identifiable (constraint)
// ^ Without specification, T = { id: number; name: string } (default)

// Without a type: default kicks in
type DefaultRepo = Repository;
// ^ Repository<{ id: number; name: string }>

// With a custom type: constraint is checked
type UserRepo = Repository<{ id: string; name: string; email: string }>;
// ^ OK — has id: string (satisfies Identifiable)
```

> **Rule:** The default type must satisfy the constraint.
> `<T extends number = string>` would be an error — string does not satisfy number.

---

## Ordering Rules

Just like function parameters, defaults must come **last**:

```typescript annotated
// OK: defaults at the end
interface Cache<K, V = string> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

const stringCache: Cache<string> = { /* ... */ } as any;
// ^ K = string, V = string (default)

const numberCache: Cache<string, number> = { /* ... */ } as any;
// ^ K = string, V = number

// ERROR: default BEFORE non-default
// interface Bad<T = string, U> { ... }
//                          ^ Error! Required after optional
```

> 💭 **Think about it:** Why must default parameters come **last**?
> What would be the problem if they could come first?
>
> **Think for a moment before reading on...**
>
> Imagine: `interface Bad<T = string, U>`. If you write `Bad<number>` —
> is `number` now T (and U is missing) or U (and T uses the default)?
> It would be ambiguous. Just like with functions:
> `function f(a = 1, b)` — with `f(5)` it's unclear whether 5 is for a or b.
> That's why: defaults always at the end, so the assignment stays unambiguous.

> 🔬 **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> interface Response<T = string, E = Error> {
>   data: T | null;
>   error: E | null;
>   status: number;
> }
>
> // Without type arguments:
> const r1: Response = { data: "hello", error: null, status: 200 };
>
> // Override only the first default:
> const r2: Response<number> = { data: 42, error: null, status: 200 };
>
> // Override both:
> const r3: Response<User, string> = { data: null, error: "Not found", status: 404 };
>
> // Now: try reversing the order:
> interface Broken<T = string, U> { value: T; key: U; }
> // What does TypeScript say? Read the error message carefully.
> ```
>
> The error message *"Required type parameters may not follow optional type
> parameters"* explains exactly the ambiguity problem from the thought question.

With multiple defaults, all of them can be placed at the end:

```typescript annotated
interface EventBus<
  TPayload = unknown,     // Default: unknown
  TSource = string,       // Default: string
> {
  emit(event: string, payload: TPayload, source: TSource): void;
  on(event: string, handler: (payload: TPayload, source: TSource) => void): void;
}

// All defaults:
type SimpleEventBus = EventBus;
// ^ EventBus<unknown, string>

// Override only the first default:
type TypedEventBus = EventBus<{ type: string; data: unknown }>;
// ^ EventBus<{ type: string; data: unknown }, string>

// Override both:
type FullEventBus = EventBus<{ type: string }, number>;
// ^ EventBus<{ type: string }, number>
```

---

## Practical Pattern: Configuration Objects

```typescript annotated
interface AppConfig<
  TAuth = { token: string },
  TLogger = Console,
> {
  auth: TAuth;
  logger: TLogger;
  baseUrl: string;
}

// Simplest case: all defaults
const simpleConfig: AppConfig = {
  auth: { token: "abc123" },
  logger: console,
  baseUrl: "https://api.example.com",
};

// Custom auth:
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

const oauthConfig: AppConfig<OAuthConfig> = {
  auth: { clientId: "...", clientSecret: "...", redirectUri: "..." },
  logger: console,
  baseUrl: "https://api.example.com",
};
```

---

## Practical Pattern: Event System

```typescript annotated
// Event map defines which events carry which payloads
interface EventMap {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "error": { message: string; code: number };
}

// Default event map is an open record
interface TypedEventEmitter<TEvents extends Record<string, unknown> = Record<string, unknown>> {
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
  on<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): void;
}

// Untyped emitter (default):
const simpleEmitter: TypedEventEmitter = {} as any;
simpleEmitter.emit("anything", { any: "data" }); // OK — open

// Typed emitter (with event map):
const typedEmitter: TypedEventEmitter<EventMap> = {} as any;
typedEmitter.emit("user:login", { userId: "123", timestamp: new Date() }); // OK
// typedEmitter.emit("user:login", { wrong: true }); // Error!
```

---

## In Your Angular Project: Default Type Parameters

Default types are an important API design tool in Angular libraries
and in large projects with many generic services:

```typescript annotated
// A generic state store with sensible defaults:
interface StoreConfig<
  TState = Record<string, unknown>,
  TActions = Record<string, (...args: unknown[]) => void>,
> {
  initialState: TState;
  actions: TActions;
  persistKey?: string;
}

// Simplest case — no type argument needed:
const simpleStore: StoreConfig = {
  initialState: { count: 0 },
  actions: { increment: () => {} },
};

// Typed store:
interface CounterState { count: number; step: number; }
const typedStore: StoreConfig<CounterState> = {
  initialState: { count: 0, step: 1 },
  actions: { increment: () => {} },
};

// Angular's HttpClient internally uses similar defaults:
// get<T = Object>(url: string): Observable<T>
// ^ Default is Object when no type is specified — better to be explicit!
this.http.get('/api/users');           // Observable<Object>   — bad
this.http.get<User[]>('/api/users');   // Observable<User[]>   — good
```

**In React — generic hooks with defaults:**

```typescript
// A cache hook with a default type:
function useLocalStorage<T = string>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });
  // ...
  return [value, setValue] as const;
}

// Without a type argument: T = string (default)
const [name, setName] = useLocalStorage("username", "Anonymous");
// name is string

// With a type argument: default is overridden
const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
// theme is "light" | "dark"
```

---

## When Are Defaults Useful?

| Situation | Default useful? | Example |
|-----------|-----------------|---------|
| 90%+ use the same type | Yes | `Container<T = string>` |
| Library with "simple" and "advanced" usage | Yes | `EventBus<T = unknown>` |
| Every call has a different type | No | `Array<T>` has no default |
| Constraint alone is sufficient | No | Better to use a constraint |

> **Rule of thumb:** Defaults are for **API design**. When you're building a
> library or a reusable system, defaults make the simple scenario simple while
> keeping the complex scenario possible.

---

## What You've Learned

- `<T = DefaultType>` gives a type parameter a fallback — exactly like default parameters in functions
- Default + constraint: `<T extends X = Y>` — the default must satisfy the constraint
- Ordering rule: defaults must come last (otherwise the assignment is ambiguous)
- Default types are an **API design tool** — they make the common case convenient without sacrificing flexibility
- Angular's `http.get()` internally has `T = Object` as a default — but explicit specification is always better

**Core concept:** Default type parameters are the bridge between "simple" and "possible". A library with `Container<T = string>` can write just `Container` for the standard case, while advanced users can use `Container<CustomType>`.

---

## Summary

| Concept | Syntax | Example |
|---------|--------|---------|
| Default type | `<T = Type>` | `interface Box<T = string>` |
| Default + constraint | `<T extends X = Y>` | Y must satisfy X |
| Ordering | Defaults at the end | `<K, V = string>` not `<V = string, K>` |
| Multiple defaults | All at the end | `<T = string, U = number>` |

---

> 🧠 **Explain it to yourself:** Why does `Array<T>` have no default type?
> What would be problematic about `Array<T = any>`?
> **Key points:** Every array has a specific element type | Default any would undermine type safety | Inference is better than defaults for function calls

---

> **Pause point** — Ready? Then on to [Section 06: Generics in Practice](./06-generics-in-der-praxis.md)