# Section 5: Defensive vs Offensive Typing

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Type Assertions vs Type Guards](./04-assertions-vs-guards.md)
> Next section: [06 - Practice: Code Review Checklist](./06-praxis-code-review.md)

---

## What you'll learn here

- The two schools of thought: **Defensive Typing** (check everything) vs **Offensive Typing** (fail early)
- When each strategy is the right choice — it depends on the **system boundary**
- How to apply **Parse, Don't Validate** as a guiding principle
- The architecture: defensive shell, offensive core

---

## Two Schools of Thought

### Defensive Typing: Trust No One

```typescript annotated
// DEFENSIVE: Every function checks its own inputs
function calculateTotal(items: CartItem[]): number {
  if (!Array.isArray(items)) throw new Error("Expected array");
  // ^ Defensive: Check whether it's actually an array
  return items.reduce((sum, item) => {
    if (typeof item.price !== "number") throw new Error("Invalid price");
    if (typeof item.quantity !== "number") throw new Error("Invalid quantity");
    // ^ Defensive: Check every value
    return sum + item.price * item.quantity;
  }, 0);
}
```

Defensive typing creeps into internal code when developers don't trust
the type system — or when the type system genuinely can't provide
guarantees (external data). The problem: in internal code, defensive
typing is signal noise. It tells the reader: "I don't trust the types."
That's a false message and makes the code harder to read.

### Offensive Typing: Trust the Type System

```typescript annotated
// OFFENSIVE: The type GUARANTEES correct inputs
interface CartItem {
  readonly price: number;
  readonly quantity: number;
}

function calculateTotal(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // ^ Offensive: No runtime check needed — the type guarantees correctness
  // ^ If someone passes wrong input → compile error, not runtime error
  // ^ readonly: Signals that calculateTotal doesn't mutate the items
}
```

Offensive typing tells the reader: "The types are the contract.
Honor the contract and the code works." That's the heart of
TypeScript's promise. The types aren't just documentation —
they are declared invariants.

> 📖 **Background: Parse, Don't Validate (Alexis King, 2019)**
>
> The blog post "Parse, Don't Validate" by Alexis King is one of the
> most influential texts in modern type-driven programming. The core idea:
> validation checks whether data is correct and returns `boolean`.
> Parsing checks AND transforms — it returns the stronger type.
> `validateEmail(s): boolean` vs `parseEmail(s): Email`.
> After parsing you KNOW it's an email — the type proves it.
> After validation you only know the check passed — but the type
> remains `string`. In TypeScript: Branded Types and Smart Constructors
> (L24) are the implementation of Parse, Don't Validate.

---

## The Architecture: Defensive Shell, Offensive Core

The solution isn't "either/or" — it's **both in the right place**:

```
┌─────────────────────────────────────────────────────┐
│                  DEFENSIVE SHELL                     │
│                                                     │
│  System boundaries: API handlers, CLI inputs,       │
│  event handlers, deserialized data                  │
│                                                     │
│  → Here: runtime validation, type guards,           │
│    Zod schemas, assertion functions                  │
│  → unknown → validated → typed                      │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │             OFFENSIVE CORE                   │    │
│  │                                             │    │
│  │  Business logic: services, pure functions,  │    │
│  │  calculations, transformations              │    │
│  │                                             │    │
│  │  → Here: trust the type system completely   │    │
│  │  → No runtime checks needed                 │    │
│  │  → Wrong inputs = compile error             │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Example: API Handler (defensive) → Service (offensive)

```typescript annotated
// SHELL: API handler — defensive validation
import { z } from "zod";  // Example pattern only, not a dependency

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive(),
});
type CreateUserInput = z.infer<typeof CreateUserSchema>;

async function handleCreateUser(req: Request): Promise<Response> {
  const body: unknown = await req.json();
  // ^ unknown: We do NOT trust the request — it comes from outside
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }
  // From here: parsed.data is CreateUserInput — PROVEN by Zod
  const user = await userService.create(parsed.data);
  return new Response(JSON.stringify(user), { status: 201 });
}

// CORE: Service — offensive typing
class UserService {
  async create(input: CreateUserInput): Promise<User> {
    // No validation needed — the type GUARANTEES correct data
    // The shell already validated — here we can trust
    return this.db.users.insert({
      name: input.name,
      email: input.email,
      age: input.age,
    });
  }
}
```

**The decisive point:** `CreateUserInput` is not an ordinary interface
that anyone can construct. It's a **parsed type** — a type you can only
obtain through `CreateUserSchema.safeParse()`. That's "Parse, Don't
Validate" in action: whoever calls `create(input)` has proven that
`input` is valid. The proof is in the type.

> 🧠 **Explain it to yourself:** Why is it wrong to check again inside
> `UserService` whether `input.name` is a string? What would be the
> drawback?
> **Key points:** Double validation is redundant and slows things down |
> The type PROVES that name is a string — the shell already checked |
> Redundant checks make the code harder to read | If you don't trust
> the type system, why are you using it?

---

## Where Is the System Boundary?

```
DEFENSIVE (runtime checks required):
├── HTTP requests and responses
├── Form inputs (user input)
├── JSON.parse, localStorage.getItem
├── External APIs and webhooks
├── Event handlers (MessageEvent.data)
├── URL parameters and query strings
├── Database queries (when not ORM-typed)
└── Data from other microservices

OFFENSIVE (type system is sufficient):
├── Function calls within your own code
├── Service-to-service (within the same process)
├── Pure functions
├── State management (Redux/NgRx actions)
├── Utility functions
└── Everything known at compile time
```

The boundary isn't always clear. A few edge cases:

- **`localStorage.getItem`**: Defensive — the user could have manually
  modified storage. `JSON.parse(localStorage.getItem("user")!) as User`
  is doubly dangerous: `!` for a potentially missing key, `as`
  for unvalidated JSON.

- **NgRx/Redux Actions**: In theory offensive (you dispatch typed
  actions). In practice: reducer code that checks `action.type === "LOAD"`
  is a built-in guard. The dispatch system handles the defensive step.

- **Angular Signals**: `signal<User | null>(null)` is offensive —
  the generic guarantees the type. But the initial value `null` means:
  on first render you must check defensively. `@if (user())` is
  the built-in guard here.

> ⚡ **Framework connection:** Angular's `HttpClient.get<User>()` is
> an example of **misplaced trust** at the system boundary:
> `<User>` is an assertion, not validation! The API could return
> a completely different format. Better: `get<unknown>()` +
> Zod validation. In React with `fetch()` the same problem exists:
> `const data: User = await res.json()` — that's an unsafe
> assertion. Always use `unknown` + validation.

> 💭 **Think about it:** Is `HttpClient.get<User[]>('/api/users')` in
> Angular defensive or offensive? Why is it problematic?
>
> **Answer:** It's neither — it's a **disguised assertion**.
> It looks type-safe, but TypeScript does NOT check whether the API
> actually returns `User[]`. The generic `<User[]>` is a
> "trust me" to the compiler. Defensive would be:
> `get<unknown>().pipe(map(validateUsers))`.

---

## Experiment: Implementing a Defensive Shell

Build a defensive shell without external dependencies. The trick:
each validation rule states exactly what went wrong:

```typescript
// Result type for validation:
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

// Type guard for CreateUserInput:
interface CreateUserInput {
  name: string;
  email: string;
  age: number;
}

function validateCreateUserInput(
  raw: unknown
): ValidationResult<CreateUserInput> {
  if (typeof raw !== "object" || raw === null) {
    return { success: false, errors: ["Expected object, got " + typeof raw] };
  }

  const obj = raw as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof obj.name !== "string") errors.push("name: expected string");
  else if (obj.name.length === 0) errors.push("name: must not be empty");

  if (typeof obj.email !== "string") errors.push("email: expected string");
  else if (!obj.email.includes("@")) errors.push("email: must contain @");

  if (typeof obj.age !== "number") errors.push("age: expected number");
  else if (!Number.isInteger(obj.age)) errors.push("age: must be integer");
  else if (obj.age < 0) errors.push("age: must be positive");

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: obj as CreateUserInput };
}

// Usage:
const result = validateCreateUserInput(JSON.parse(requestBody));
if (!result.success) {
  console.error("Validation failed:", result.errors.join(", "));
  // → "Validation failed: email: must contain @, age: must be integer"
} else {
  // result.data is CreateUserInput — safe
  userService.create(result.data);
}

// Challenge: Build a generic 'validate' function:
// function validate<T>(
//   data: unknown,
//   validator: (d: unknown) => ValidationResult<T>
// ): T  // throws on failure with all error messages
```

---

## What You Learned

- **Defensive Typing** = runtime checks at system boundaries (API, user input, external data)
- **Offensive Typing** = trust the type system in the core (services, business logic)
- Defensive typing in internal code is signal noise — it says "I don't trust the types"
- The **architecture**: defensive shell validates and parses, offensive core trusts
- **Parse, Don't Validate**: validation returns `boolean`, parsing returns a stronger type
- `HttpClient.get<T>()` and `fetch()` are **disguised assertions** — always use `unknown` + validation
- **ValidationResult<T>** type delivers precise error messages instead of just "invalid"
- Angular Signals with a `null` initial value require template guards (`@if`)

> 🧠 **Explain it to yourself:** What is the connection between
> "Parse, Don't Validate", Branded Types (L24), and the
> defensive/offensive model?
> **Key points:** Parse, Don't Validate = validate at the boundary
> and transform into a stronger type | Branded Types = the
> stronger type (Email instead of string) | The shell parses, the
> core works with the branded type | It all fits together |
> `CreateUserInput` from Zod is not an ordinary interface —
> it's a proven type

---

## The Big Picture: The Three Layers

The defensive/offensive model fits into a larger architectural picture:

```
Layer 1: OUTSIDE WORLD (always defensive)
  HTTP, localStorage, URL params, events
  → Type: unknown
  → Action: validate, parse, type guard

Layer 2: BOUNDARY (once defensive, then offensive)
  Route handlers, API controllers, form validators
  → Type: validated branded type / parsed interface
  → Action: wrap the external data in a shell

Layer 3: CORE (always offensive)
  Services, business logic, pure functions
  → Type: known, validated interfaces
  → Action: trust the type system completely
```

In Angular: Layer 1 is HttpClient, Layer 2 is the service with
validation, Layer 3 is components and further services. A
component should **never** contain `unknown` or validation logic —
it operates in the core.

In React: Layer 1 is `fetch()` and `localStorage`, Layer 2
is custom hooks with validation, Layer 3 is UI components.
A component renders validated data — it doesn't validate it itself.

**Core concept to remember:** Defend your system boundaries aggressively — with runtime validation, type guards, and assertion functions. Inside the boundaries, trust the type system completely — no redundant checks, no defensive noise. That's the most efficient balance between safety and simplicity.

---

> **Pause point** — The two schools of thought are understood. In the
> final section you'll consolidate everything into a code review checklist.
>
> Continue with: [Section 06: Practice — Code Review Checklist](./06-praxis-code-review.md)