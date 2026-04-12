# Section 6: Patterns and Alternatives

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Template Literal Types](./05-template-literal-types.md)
> Next section: — (End of this lesson)

---

## What you'll learn here

- What `const enum` is and why it's **almost never** the right choice
- The **`isolatedModules` warning** and why it affects all modern build tools
- The **`as const` pattern** as a universal alternative
- **Branding** with Literal Types for semantic type safety

---

## const enum: Inline Replacement

A `const enum` is completely **replaced inline** by the compiler — no
JavaScript object is generated:

```typescript annotated
const enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

const move = Direction.Up;
// ^ Compiles to: const move = "UP";
// No Direction object exists at runtime!
```

### Advantages of const enum

1. **No runtime overhead** — everything is replaced inline
2. **Smaller bundle size** — no enum object in the output
3. **Performance** — no property lookup at runtime

### The Problem: isolatedModules

And now the **critical warning**:

> **`const enum` is incompatible with `isolatedModules: true`.**
> And `isolatedModules` is ACTIVE in almost all modern build tools.

```typescript
// tsconfig.json:
// {
//   "compilerOptions": {
//     "isolatedModules": true  // <-- Default in Vite, Next.js, esbuild, swc
//   }
// }

// With isolatedModules: true, const enum CANNOT be used cross-file:
// file-a.ts:
export const enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

// file-b.ts:
// import { Status } from "./file-a";
// const s = Status.Active;
// ^ Error with isolatedModules! The compiler would need to read file-a.ts
//   to know that Status.Active = "ACTIVE".
//   But isolatedModules compiles each file individually.
```

> 📖 **Background: Why isolatedModules?**
>
> Modern build tools like **esbuild**, **swc**, and **Vite** compile
> each TypeScript file **individually** (in isolation), without analyzing
> the entire project. This makes builds 10-100x faster.
>
> But `const enum` requires the compiler to read the enum definition from
> another file in order to inline the value. This is impossible
> with isolated compilation.
>
> **Since TypeScript 5.0**, `isolatedModules: true` has been recommended
> as the default. Since TypeScript 5.4 there is `--verbatimModuleSyntax`,
> which is even stricter. The future belongs to isolated compilation —
> and `const enum` doesn't fit into it.

### The Solution

If you want to use `const enum`, there are two options:

```typescript
// Option 1: Use only within ONE file (no export)
const enum LocalDirection {
  Up = "UP",
  Down = "DOWN",
}
// Works because the compiler sees the definition in the same file

// Option 2: Don't use it. Instead:
const Direction = {
  Up: "UP",
  Down: "DOWN",
} as const;
type Direction = typeof Direction[keyof typeof Direction];
// Same functionality, no compatibility issues
```

> 🧠 **Explain it to yourself:** Why does the TypeScript team recommend
> `isolatedModules: true`? What do you gain from isolated compilation
> and what do you lose?
> **Key points:** 10-100x faster builds | Each file independently compilable | Compatible with esbuild/swc/Vite | Loses: const enum, some namespace features | The gain clearly outweighs the loss

---

## The as const Pattern: The Universal Alternative

Instead of enums, you can always use the `as const` pattern:

```typescript annotated
// ─── Simple replacement for String Enum ────────────────────────────
const LogLevel = {
  Debug: "DEBUG",
  Info: "INFO",
  Warning: "WARNING",
  Error: "ERROR",
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];
// ^ "DEBUG" | "INFO" | "WARNING" | "ERROR"

// ─── Replacement for numeric enum ──────────────────────────────────
const HttpStatus = {
  Ok: 200,
  NotFound: 404,
  InternalError: 500,
} as const;

type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];
// ^ 200 | 404 | 500

// ─── With additional information ───────────────────────────────────
const ErrorCode = {
  NotFound: { code: 404, message: "Not Found" },
  Forbidden: { code: 403, message: "Forbidden" },
  Internal: { code: 500, message: "Internal Server Error" },
} as const;

type ErrorCodeKey = keyof typeof ErrorCode;
// ^ "NotFound" | "Forbidden" | "Internal"
```

### Advantages of the as const Pattern

1. **No compatibility issues** with build tools
2. **More flexibility** — objects can have any structure
3. **Runtime access** to values AND derived types
4. **Structural compatibility** — no nominal type coercion

---

## Branding: Semantic Type Safety with Literal Types

An advanced pattern that uses Literal Types to distinguish
**semantically different values**:

```typescript annotated
// Problem: Both are number — easy to mix up!
function transfer(from: number, to: number, amount: number) {
  // What is from? An account ID? An amount? An index?
}

// Solution: Branded Types
type AccountId = number & { readonly __brand: "AccountId" };
type EUR = number & { readonly __brand: "EUR" };

// Constructor functions:
function accountId(id: number): AccountId {
  return id as AccountId;
}

function eur(amount: number): EUR {
  return amount as EUR;
}

// Now confusion is impossible:
function transferSafe(from: AccountId, to: AccountId, amount: EUR) {
  console.log(`Transfer ${amount} EUR from ${from} to ${to}`);
}

const sender = accountId(12345);
const receiver = accountId(67890);
const amount = eur(100);

transferSafe(sender, receiver, amount);  // OK
// transferSafe(sender, amount, receiver);
// ^ Error! EUR is not assignable to AccountId!

// transferSafe(12345, 67890, 100);
// ^ Error! number is not assignable to AccountId/EUR!
```

> 🔍 **Deeper knowledge: How does branding work?**
>
> The trick is based on the intersection: `number & { __brand: "EUR" }`.
> At runtime the value is a normal number — the `__brand` property
> doesn't actually exist. But at compile time TypeScript sees
> `AccountId` and `EUR` as different types because their brands
> are different.
>
> The `as` in the constructor function is the only "leap of faith"
> to the compiler. From that point on, everything is type-safe.
>
> This pattern is also used in libraries like **zod** (z.brand()),
> **io-ts** and **Effect**.

> 💭 **Think about it:** Could you also use Branding with String Literal Types
> instead of `"EUR"`? What would be the advantage?
>
> **Answer:** Yes, and that's exactly what we're doing! The brand value `"EUR"` IS
> a String Literal Type. You could also use `unique symbol` for
> even stronger isolation, but String Literals are easier
> to read and debug.

---

## Summary: Which Pattern When?

| Scenario | Recommendation |
|---|---|
| Simple choice (3-10 options) | `type Status = "active" \| "inactive"` |
| Named constants with runtime access | `as const` Object |
| Stable public API (library) | String Enum |
| Bitwise flags | Numeric Enum |
| Semantic distinction (EUR vs USD) | Branded Types |
| String patterns (CSS, events) | Template Literal Types |
| Cross-file constants (modern tooling) | `as const` Object (never `const enum`) |

---

## What you've learned

- `const enum` is replaced inline, but is **incompatible with isolatedModules**
- Modern build tools (Vite, esbuild, swc) all use `isolatedModules`
- The `as const` pattern is the **universal alternative** to enums
- **Branding** uses Intersection Types with Literal Types for semantic safety
- Every pattern has its place — the choice depends on context

> 🧠 **Explain it to yourself:** Why is an `as const` Object better than
> `const enum` in a modern TypeScript project?
> **Key points:** Compatible with isolatedModules | No special compiler trick needed | Runtime values available | Iteration possible | Future-proof

**Core concept to remember:** In a modern TypeScript project (2024+),
`as const` with a derived Union Type is almost always the best choice. Enums have
their place, but it's getting smaller — and `const enum` should be completely
avoided in new projects.

> ⚡ **In your Angular project:**
>
> ```typescript
> // Branded Types for type-safe IDs — prevents mix-ups:
> type UserId   = string & { readonly __brand: "UserId" };
> type ProductId = string & { readonly __brand: "ProductId" };
>
> function userId(id: string): UserId     { return id as UserId; }
> function productId(id: string): ProductId { return id as ProductId; }
>
> // Angular Service with Branded Types:
> @Injectable({ providedIn: "root" })
> export class UserService {
>   getUser(id: UserId): Observable<User> {
>     return this.http.get<User>(`/api/users/${id}`);
>   }
> }
>
> const uid = userId("usr-123");
> const pid = productId("prod-456");
>
> userService.getUser(uid);  // OK
> userService.getUser(pid);  // Error! ProductId is not UserId!
> // No more accidentally mixing up IDs.
>
> // In React: Same technique for props that are both strings
> // but semantically different (e.g. SlugId vs DisplayName).
> ```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> // Refactoring: String Enum → as const Object
>
> // BEFORE: String Enum
> enum ThemeEnum {
>   Light = "LIGHT",
>   Dark  = "DARK",
> }
>
> function applyEnum(theme: ThemeEnum) {
>   console.log(theme);
> }
> applyEnum(ThemeEnum.Light);
> // applyEnum("LIGHT");  // Error! Not possible
>
> // AFTER: as const Object
> const Theme = { Light: "LIGHT", Dark: "DARK" } as const;
> type Theme = typeof Theme[keyof typeof Theme];
>
> function applyConst(theme: Theme) {
>   console.log(theme);
> }
> applyConst(Theme.Light);   // Same syntax as with the enum
> applyConst("LIGHT");        // Bonus: Direct strings work now!
>
> // What changes do you need to make when refactoring?
> ```
> Compare both variants: Which lines do you need to change when refactoring,
> which stay identical? Which advantage of the `as const` pattern
> were you unaware of before?

---

> **End of lesson** — You've completed all six sections!
>
> **Next steps:**
> - Work through the `examples/` and experiment
> - Solve the `exercises/` and compare with `solutions/`
> - Test your knowledge with `npx tsx quiz.ts`
> - Keep `cheatsheet.md` as a quick reference
>
> **Next lesson:** 10 — Generics —
> How to write functions and types that work with ANY type.