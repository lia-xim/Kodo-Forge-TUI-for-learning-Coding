# Section 4: Decision Matrix

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - The Big Comparison](./03-der-grosse-vergleich.md)
> Next section: [05 - Patterns and Best Practices](./05-patterns-und-best-practices.md)

---

## What you'll learn here

- A **clear decision tree**: When to use `type`, when to use `interface`?
- The **three rules of thumb** that cover 95% of cases
- Why **consistency** matters more than the "perfect" choice
- How to establish the decision framework within your team

---

## The Decision Tree

Follow this flowchart from top to bottom. The first question you can
answer with "Yes" gives you your answer:

```
  Do you need a Union Type? (A | B)
  ├── Yes ──> type
  │
  Do you need Mapped or Conditional Types?
  ├── Yes ──> type
  │
  Do you need a Primitive Alias? (type ID = string)
  ├── Yes ──> type
  │
  Do you need a Tuple Type? ([string, number])
  ├── Yes ──> type
  │
  Do you need Declaration Merging?
  ├── Yes ──> interface
  │
  Are you describing an object shape that should be extended?
  ├── Yes ──> interface
  │
  Otherwise: Follow the team convention.
  └── No convention? ──> interface for objects, type for everything else
```

> 🧠 **Explain it to yourself:** Walk through the decision tree with three
> concrete examples: (1) A type for an API response with success/error variants,
> (2) A type for a user with name and email, (3) A type that makes an
> array readonly. Where do you end up in each case?
> **Key points:** (1) Union = type | (2) Object shape = interface |
> (3) Mapped Type = type

---

## The Three Rules of Thumb

### Rule 1: Union Types = type (always)

There is no alternative. If you need `|`, use `type`:

```typescript annotated
// This ONLY works with type:
type Status = "active" | "inactive" | "banned";
// ^ Three string literals as a union.

type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
// ^ Discriminated Union. The most powerful pattern in TypeScript.

type InputValue = string | number | boolean;
// ^ Primitive union.
```

### Rule 2: Extensible objects = interface (preferred)

When you're describing an object that others might extend,
use `interface`:

```typescript annotated
// DTOs, Entities, Service Contracts:
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
// ^ Clean extension with extends.
  permissions: string[];
  lastLogin: Date;
}
```

### Rule 3: Everything else = type

Mapped Types, Conditional Types, Utility Types, Primitive Aliases:

```typescript annotated
// Mapped Type:
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// Conditional Type:
type NonNullable<T> = T extends null | undefined ? never : T;

// Primitive Alias:
type Milliseconds = number;

// Tuple:
type Coordinate = [latitude: number, longitude: number];

// Template Literal:
type EventHandler = `on${string}`;
```

---

## Real-World Decisions: Examples

### Example 1: Props for a React component

```typescript
// React community convention: type for props
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "primary" | "secondary" | "danger";
// ^ variant is a union — that's why type fits well here.
};
```

Could you use `interface` here? Yes, for the pure properties.
But the union type on `variant` and the React convention both favor
`type`.

### Example 2: Angular service contract

```typescript
// Angular convention: interface for service contracts
interface UserService {
  getUser(id: string): Observable<User>;
  updateUser(id: string, data: Partial<User>): Observable<User>;
  deleteUser(id: string): Observable<void>;
}

// Class implements the interface:
class UserServiceImpl implements UserService {
  // ...
}
```

Could you use `type` here? Yes, `implements` also works with
type aliases. But the Angular convention and the ability to use `extends`
favor `interface`.

### Example 3: API response with variants

```typescript
// Discriminated Union — ONLY possible with type:
type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string; retryAfter?: number };

// Usage:
function handleResponse(response: ApiResponse<User[]>) {
  switch (response.status) {
    case "loading":
      showSpinner();
      break;
    case "success":
      renderUsers(response.data);
// ^ TypeScript knows: data exists here.
      break;
    case "error":
      showError(response.error);
// ^ TypeScript knows: error exists here.
      break;
  }
}
```

There is no choice here — `type` is the only option.

### Example 4: Configuration type for a library

```typescript
// interface — because users should be able to extend the type:
interface PluginConfig {
  name: string;
  version: string;
}

// A plugin author can extend PluginConfig:
interface PluginConfig {
  hooks?: {
    onInit?: () => void;
    onDestroy?: () => void;
  };
}
// ^ Declaration Merging! PluginConfig now has name, version AND hooks.
```

---

## The "Consistency Beats Perfection" Rule

> **The most important rule: Be consistent within your project.**

A project that uses `type` everywhere is better than a project
that switches randomly between `type` and `interface`. Inconsistency
confuses team members and makes code reviews harder.

```typescript
// BAD: Inconsistent
type UserProps = { name: string };
interface ProductProps { name: string; }
type OrderState = { items: string[] };
interface CartState { items: string[]; }
// ^ Why is UserProps a type and ProductProps an interface?
// No recognizable pattern = confusion.

// GOOD: Consistent (Variant A — type-first)
type UserProps = { name: string };
type ProductProps = { name: string };
type OrderState = { items: string[] };

// GOOD: Consistent (Variant B — interface-first)
interface UserProps { name: string; }
interface ProductProps { name: string; }
interface OrderState { items: string[]; }
```

> ⚡ **Practical tip:** Use an ESLint rule to enforce consistency:
>
> ```json
> // .eslintrc.json
> {
>   "rules": {
>     "@typescript-eslint/consistent-type-definitions": ["error", "interface"]
>     // Or: ["error", "type"] — depending on the team's decision
>   }
> }
> ```
>
> This rule enforces that object types are defined uniformly either as `type`
> or as `interface`.

---

## Frequently Asked Questions

### "Should I always use interface, as the TypeScript team recommends?"

The TypeScript team has historically recommended `interface` for object types
— primarily for performance with `extends`. But
this recommendation comes with nuance:

1. It only applies to **object types**, not to unions, tuples, etc.
2. The performance difference is **not measurable** in most projects
3. Many modern projects (React, Prisma) primarily use `type`

### "Does the choice really not matter?"

No! There are cases where the choice is clear:

- **Union type needed** → `type` (no alternative)
- **Declaration Merging needed** → `interface` (no alternative)
- **Mapped/Conditional Type** → `type` (no alternative)
- **Just an object type** → Either works, follow the convention

### "What if I change my mind later?"

Refactoring from `type` to `interface` (or vice versa) is
trivial in most cases — as long as you're not using `type`-exclusive features
(unions, mapped types, etc.). A good IDE refactoring tool
handles this in seconds.

---

## What you've learned

- The **decision tree** guides you to the right choice in 5 steps
- **Three rules of thumb**: Unions → type, extensible objects → interface, rest → type
- **Consistency** within the project matters more than the "perfect" choice
- ESLint can **automatically enforce** the convention

> 🧠 **Explain it to yourself:** Your team asks you: "Should we always use type
> or always use interface?" — What do you say and why?
> **Key points:** No "always" is possible because unions can only use type |
> Recommendation: interface for objects, type for the rest | ESLint rule
> for consistency | Performance argument only relevant for very large projects

**Core concept to remember:** The "right" choice matters less than a
**consistent** choice. Define a team convention, document it, and
enforce it with ESLint.

---

> **Pause point** — Good moment for a break. You now have a
> clear decision framework.
>
> Continue with: [Section 05: Patterns and Best Practices](./05-patterns-und-best-practices.md)