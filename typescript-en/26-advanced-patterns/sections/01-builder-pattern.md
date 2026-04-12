# Section 1: The Builder Pattern

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - State Machine Pattern](./02-state-machine-pattern.md)

---

## What you'll learn here

- How the Builder Pattern makes **complex object creation** type-safe
- Why method chaining with **Generics** validates the builder at compile time
- The difference between the **classic** Builder and the **type-safe** Builder
- How TypeScript Generics can map **accumulated state** into types

---

## Background: Why Builder?

> **Feature Origin Story: Builder Pattern**
>
> The Builder Pattern was described in the 1994 "Gang of Four" book (Design Patterns).
> In Java and C# it has been a standard for creating complex objects for
> decades — think `StringBuilder` or `HttpRequest.newBuilder()`.
>
> But in most languages, the builder only checks **at runtime** whether
> all required fields have been set. TypeScript can do better:
> With Generics and Conditional Types we can build a builder that
> **at compile time** guarantees all required fields are set.
>
> This is one of those moments where TypeScript's type system goes beyond
> what Java or C# offer — and entirely without runtime overhead.

---

## The Problem: Creating Complex Objects
<!-- section:summary -->
Imagine a configuration with required and optional fields:

<!-- depth:standard -->
Imagine a configuration with required and optional fields:

```typescript annotated
interface ServerConfig {
  host: string;       // Required
  port: number;       // Required
  ssl: boolean;       // Optional (default: false)
  timeout: number;    // Optional (default: 30000)
  maxRetries: number; // Optional (default: 3)
}

// Naive approach: All fields in the constructor
function createServer(config: ServerConfig): void { /* ... */ }

// Problem 1: Too many parameters — which one is which?
createServer({ host: "api.example.com", port: 443, ssl: true, timeout: 5000, maxRetries: 5 });
// ^ Works, but with 10+ fields it becomes unwieldy

// Problem 2: Partial makes EVERYTHING optional — no required-field check!
function createServerPartial(config: Partial<ServerConfig>): void { /* ... */ }
createServerPartial({}); // No error! But host and port are missing.
// ^ TypeScript doesn't complain — all fields are optional.
```

> 🧠 **Explain to yourself:** Why is `Partial<ServerConfig>` not a good
> solution for optional fields? What is lost in the process?
>
> **Key points:** Partial makes ALL fields optional | Required fields are
> no longer enforced | Errors only at runtime | No compile-time protection

---

<!-- /depth -->
## The Classic Builder (without type safety)

```typescript annotated
class ServerConfigBuilder {
  private config: Partial<ServerConfig> = {};
  // ^ Everything is Partial — we lose the required-field information

  host(h: string): this { this.config.host = h; return this; }
  port(p: number): this { this.config.port = p; return this; }
  ssl(s: boolean): this { this.config.ssl = s; return this; }

  build(): ServerConfig {
    if (!this.config.host) throw new Error("host is required!");
    if (!this.config.port) throw new Error("port is required!");
    // ^ Runtime check — TypeScript does NOT help us here
    return this.config as ServerConfig;
    // ^ Unsafe cast! We "promise" TypeScript that everything is present
  }
}

new ServerConfigBuilder().ssl(true).build();
// ^ NO compile error! Only at runtime: "host is required!"
```

> 💭 **Think about it:** This builder has the same problem as `throw` in
> error handling (Lesson 25): the type "lies". `build()` promises
> `ServerConfig`, but sometimes throws. How could you make the type more honest?
>
> **Answer:** By only making the return type of `build()` resolve to
> `ServerConfig` when the required fields have been demonstrably set —
> in the **type**, not at runtime.

---

## The Type-Safe Builder with Generics
<!-- section:summary -->
The core idea: We track in the **Generic parameter** which fields

<!-- depth:standard -->
The core idea: We track in the **Generic parameter** which fields
have already been set:

```typescript annotated
// Step 1: Define which fields are required
type RequiredFields = "host" | "port";

// Step 2: Builder with Generic parameter for "already set"
class TypedConfigBuilder<Set extends string = never> {
  // ^ 'Set' tracks which fields have already been set
  //   Initial value: 'never' (nothing set)
  private config: Partial<ServerConfig> = {};

  host(h: string): TypedConfigBuilder<Set | "host"> {
    // ^ Return type ADDS "host" to the Set
    this.config.host = h;
    return this as any; // Internal cast — type safety is in the return type
  }

  port(p: number): TypedConfigBuilder<Set | "port"> {
    // ^ Return type ADDS "port" to the Set
    this.config.port = p;
    return this as any;
  }

  ssl(s: boolean): TypedConfigBuilder<Set> {
    // ^ Optional field: Set does NOT change
    this.config.ssl = s;
    return this as any;
  }

  // build() is ONLY available when ALL required fields have been set:
  build(this: TypedConfigBuilder<RequiredFields>): ServerConfig {
    // ^ 'this' parameter: method only exists when Set = RequiredFields
    return { ssl: false, timeout: 30000, maxRetries: 3, ...this.config } as ServerConfig;
  }
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Work through these calls mentally — which ones compile?
>
> ```typescript
> // 1. All required fields set:
> new TypedConfigBuilder().host("api.example.com").port(443).build();
> // Compiles? ___
>
> // 2. Only host set:
> new TypedConfigBuilder().host("api.example.com").build();
> // Compiles? ___
>
> // 3. Optional field alone:
> new TypedConfigBuilder().ssl(true).build();
> // Compiles? ___
>
> // 4. Order doesn't matter:
> new TypedConfigBuilder().port(443).ssl(true).host("api.example.com").build();
> // Compiles? ___
> ```
>
> **Answers:** 1: Yes | 2: No (port missing) | 3: No (host+port missing) | 4: Yes

---

<!-- /depth -->
## Alternative: Builder with Mapped Types
<!-- section:summary -->
A more elegant approach uses Mapped Types to automate the tracking:

<!-- depth:standard -->
A more elegant approach uses Mapped Types to automate the tracking:

You already know the `[K in keyof T]` construct from L16 (Mapped Types). The Generic accumulation builds on L13 (Generics Basics) and L22 (Advanced Generics). And `type` as the sole tool for Mapped Types — that was already the core topic in L08.

```typescript annotated
type Builder<T, Required extends keyof T, Set extends keyof T = never> = {
  // ^ T = target type, Required = required fields, Set = already set
  [K in keyof T]-?: (value: T[K]) => Builder<T, Required, Set | K>;
  // ^ For EVERY field: method that takes the value and returns Builder
  //   with K added to the Set
} & (Required extends Set
  // ^ If ALL Required fields are contained in Set:
  ? { build(): T }
  // ^ build() is available
  : { build?: never }
  // ^ build() does NOT exist — compile error on call
);
```

> ⚡ **In your Angular project** you already know Builder-like APIs:
>
> ```typescript
> // Angular FormBuilder — similar pattern:
> this.fb.group({
>   name: ['', Validators.required],
>   email: ['', [Validators.required, Validators.email]],
> });
> // ^ FormBuilder is a builder! But without compile-time checking
> //   of required fields. A type-safe FormBuilder could
> //   report missing required fields at compile time.
> ```
>
> In React you know the pattern from query builders (e.g. TanStack Query):
>
> ```typescript
> useQuery({ queryKey: ['user', id], queryFn: fetchUser });
> // ^ queryKey and queryFn are "required" — but only through runtime checks
> ```

---

<!-- /depth -->
## When to use Builder, when not to?
<!-- section:summary -->
| Situation | Builder appropriate? | Alternative |

<!-- depth:standard -->
| Situation | Builder appropriate? | Alternative |
|---|---|---|
| 3-4 fields, all required | No — overkill | Direct object |
| 5+ fields, mix of required/optional | Yes | — |
| Object is built up incrementally | Yes | — |
| Validation between fields | Yes | — |
| Immutable configuration | Yes | `Readonly<T>` + Factory |

---

<!-- /depth -->
## What you've learned

- The **classic Builder Pattern** only validates required fields at runtime — the type "lies"
- With **Generics as an accumulator**, the builder type can track which fields have already been set
- `build()` only becomes available when all required fields are included in the Generic set
- The **order** of calls doesn't matter — only completeness counts

> 🧠 **Explain to yourself:** Why does the type-safe Builder need a
> Generic parameter `Set extends string`? What would happen if we
> simply used `this` as the return type?
>
> **Key points:** `this` would return the same type — no tracking |
> The Generic accumulates information about set fields |
> Without accumulation, no compile-time check for build()

**Core concept to remember:** A type-safe builder uses Generics as
"memory" — each method call adds information to the type, until
the compiler unlocks `build()`.

---

> **Pause point** -- You've understood the Builder Pattern. Next up:
> State machines that forbid impossible transitions.
>
> Continue with: [Section 02: State Machine Pattern](./02-state-machine-pattern.md)