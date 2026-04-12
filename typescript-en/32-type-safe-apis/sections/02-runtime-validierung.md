# Section 2: Zod and Valibot — Runtime Validation

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - REST API Typing](./01-rest-api-typing.md)
> Next section: [03 - End-to-End Type Safety (tRPC)](./03-end-to-end-type-safety.md)

---

## What you'll learn here

- Why runtime validation bridges the gap between TypeScript types and real data
- How Zod schemas define both TypeScript types AND runtime validation simultaneously
- How Valibot works as a lightweight alternative
- The "Schema First" pattern — schema as a single source of truth

---

## The Problem: Types Lie

TypeScript types only exist at compile time (type erasure, L02).
Data from the outside — APIs, LocalStorage, URL parameters, FormData —
have NO types at runtime. `as User[]` is like a sign on the
door that says "Authorized personnel only" — but checks no one.
Zod, on the other hand, is the border officer: checks every arrival,
turns them away if their papers don't check out:

```typescript
// TypeScript says: users is User[]
const users = await fetch('/api/users').then(r => r.json()) as User[];

// Reality: users could be ANYTHING
// - null (API returns null)
// - { error: "unauthorized" } (error response)
// - [{ id: 1, fullName: "Max" }] (different schema)
// - "Internal Server Error" (plain text)
```

> 📖 **Background: The Birth of Schema Validation**
>
> The problem is as old as web APIs. In the Java world, there was Jackson
> and Gson for JSON validation. In Python there's Pydantic. In the
> TypeScript world, `io-ts` (2017) by Giulio Canti was the pioneer.
> Then came **Zod** (2020) by Colin McDonnell, which with its
> developer-friendly API and excellent TypeScript integration
> became the de-facto standard. **Valibot** (2023) by Fabian Hiller
> offers the same idea with a radically smaller bundle (~1kb
> vs ~13kb for Zod).

---

## Zod: Schema as Source of Truth

Zod's core idea: you define a schema, and Zod automatically infers the
TypeScript type. The schema is like a stamp in a passport: it defines
WHAT is valid — and the inferred type is simply the TypeScript
translation of that. One single source, two representations:

```typescript annotated
import { z } from 'zod';

// Define the schema — this is the SINGLE source of truth
const UserSchema = z.object({
  id: z.string().uuid(),
  // ^ string with UUID validation
  name: z.string().min(1).max(100),
  // ^ string with length constraints
  email: z.string().email(),
  // ^ string with email format check
  role: z.enum(["admin", "user", "viewer"]),
  // ^ literal union — only these 3 values allowed
  createdAt: z.string().datetime(),
  // ^ ISO 8601 datetime string
});

// INFER the TypeScript type — don't define it manually!
type User = z.infer<typeof UserSchema>;
// ^ { id: string; name: string; email: string; role: "admin" | "user" | "viewer"; createdAt: string }
// The type is IDENTICAL to a manually defined interface —
// but it CANNOT diverge from the schema!
```

### Validation in Action

```typescript annotated
// parse() — throws on invalid input
function validateUser(data: unknown): User {
  return UserSchema.parse(data);
  // ^ If data doesn't match the schema: ZodError
  // ^ If data is valid: return type is User (exactly!)
}

// safeParse() — returns a result object (no throw)
function validateUserSafe(data: unknown): z.SafeParseReturnType<unknown, User> {
  const result = UserSchema.safeParse(data);
  if (result.success) {
    console.log(result.data.name);
    // ^ result.data: User — type-safe after the success check!
  } else {
    console.log(result.error.issues);
    // ^ Detailed error messages per field
  }
  return result;
}
```

> 💭 **Think about it:** Why is `z.infer<typeof Schema>` better than
> a manually defined interface `interface User { ... }`?
>
> **Answer:** Because the schema and type cannot diverge.
> With manual types you could change the interface but forget to update
> the validation — or vice versa. With z.infer the type is
> ALWAYS correct relative to the schema. Single source of truth.

---

## Zod Patterns for APIs

```typescript annotated
// Request validation
const CreateUserSchema = UserSchema.pick({ name: true, email: true }).extend({
  role: z.enum(["admin", "user", "viewer"]).optional(),
  // ^ Pick + extend — like Pick<User, ...> & { role?: ... } but with validation
});
type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// Response validation (verify API response)
const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.object({
      page: z.number(),
      total: z.number(),
      perPage: z.number(),
    }).optional(),
  });
// ^ Generic response wrapper — reusable for all endpoints

// Validated fetch
async function fetchUsers(): Promise<User[]> {
  const raw = await fetch('/api/users').then(r => r.json());
  const response = ApiResponseSchema(z.array(UserSchema)).parse(raw);
  // ^ Runtime validation! If the API returns a different schema → ZodError
  return response.data;
  // ^ response.data: User[] — GUARANTEED to be correct
}
```

> 🧠 **Explain it to yourself:** What is the difference between
> `response.json() as User[]` and `UserSchema.array().parse(response.json())`?
> When would the first approach work and the second would not?
>
> **Key points:** `as User[]` is a cast — no checking, blindly trusts you |
> `.parse()` validates every value — throws on any deviation | First approach
> "works" always (compiles) — errors only appear later | Second
> approach fails immediately if the API response doesn't match

---

## Valibot: The Lightweight Alternative

Valibot offers the same functionality with radical tree-shaking:

```typescript annotated
import * as v from 'valibot';

// Schema — similar API to Zod, but more modular
const UserSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  // ^ pipe() instead of method chaining — better for tree-shaking
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  email: v.pipe(v.string(), v.email()),
  role: v.picklist(["admin", "user", "viewer"]),
  // ^ picklist instead of enum — same functionality
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
});

// Infer type — identical to Zod
type User = v.InferOutput<typeof UserSchema>;

// Validation
const result = v.safeParse(UserSchema, data);
if (result.success) {
  result.output.name; // type-safe!
}
```

### Zod vs Valibot: Decision Guide

```typescript
// Zod: method chaining (ergonomic, but larger bundle)
z.string().min(1).max(100).email()    // ~13kb min (gzip)

// Valibot: pipe-based (smaller bundle, more imports)
v.pipe(v.string(), v.minLength(1), v.maxLength(100), v.email())  // ~1kb min (gzip)
```

| Criterion | Zod | Valibot |
|---|---|---|
| Bundle size | ~13kb gzip | ~1kb gzip |
| API style | Method chaining | Pipe/functional |
| Tree-shaking | Limited | Excellent |
| Ecosystem | Very large | Growing |
| Recommendation | Server, larger apps | Client, bundle-critical |

> ⚡ **Practical tip for Angular:** In Angular projects, bundle size is
> less critical (no SSR overhead like in Next.js).
> Zod is often the better choice here due to its larger ecosystem.
> In React/Next.js projects, Valibot can score points with smaller bundles.

---

## The "Schema First" Pattern

Best practice: define the schema first, then infer the type.
"Schema First" is like drawing the blueprint first and then deriving
the materials list from it — never the other way around. If you change the
plan, the list updates automatically. If you maintain both separately,
they'll eventually diverge:

```typescript annotated
// ❌ BAD: type first, schema added afterward
interface User { name: string; email: string; }
const UserSchema = z.object({ name: z.string(), email: z.string() });
// ^ Schema and interface COULD diverge!

// ✅ GOOD: schema first, infer the type
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;
// ^ Type is GUARANTEED to be identical to the schema
```

> 🔬 **Experiment:** Build a validated fetch wrapper with Zod:
>
> ```typescript
> import { z } from 'zod';
>
> async function validatedFetch<T extends z.ZodType>(
>   url: string,
>   schema: T
> ): Promise<z.infer<T>> {
>   const response = await fetch(url);
>   const data = await response.json();
>   return schema.parse(data);
>   // What happens if the API returns an unexpected format?
>   // Answer: ZodError with detailed error messages per field
> }
>
> // Usage:
> const users = await validatedFetch('/api/users', z.array(UserSchema));
> // users: User[] — GUARANTEED to be correct, not just "trust me"
> ```

---

## Transform and Coercion

Zod can transform data during validation:

```typescript annotated
const EventSchema = z.object({
  name: z.string(),
  date: z.string().datetime().transform(s => new Date(s)),
  // ^ Input: string, Output: Date — transformation inside the schema!
  attendees: z.coerce.number(),
  // ^ Coercion: "42" → 42, accepts string OR number
});

type EventInput = z.input<typeof EventSchema>;
// ^ { name: string; date: string; attendees: string | number }
type EventOutput = z.output<typeof EventSchema>;
// ^ { name: string; date: Date; attendees: number }
// Input and output have DIFFERENT types!
```

---

## What you've learned

- Runtime validation bridges the gap between TypeScript types and real data
- Zod defines schemas that are simultaneously TypeScript types AND validation logic
- `z.infer<typeof Schema>` infers the type automatically — single source of truth
- Valibot offers the same functionality with ~1kb instead of ~13kb bundle size
- Transform/coercion converts data during validation

**Core concept to remember:** "Schema First" is the key. Define the schema first (what is ACTUALLY valid), then infer the TypeScript type. That way schema and type can never diverge — and your code is safe at both compile time AND runtime.

---

> **Pause point** — You now know how to close the type gap.
> Next up: end-to-end type safety.
>
> Continue with: [Section 03: End-to-End Type Safety (tRPC)](./03-end-to-end-type-safety.md)