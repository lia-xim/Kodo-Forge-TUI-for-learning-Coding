# Section 1: The Nominal Typing Problem

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - The Brand Technique](./02-die-brand-technik.md)

---

## What you'll learn here

- Why `type UserId = string` provides **no real type safety**
- The difference between **Structural Typing** (TypeScript) and **Nominal Typing** (Java/C#)
- What real bugs arise from interchangeable types
- Why the compiler doesn't protect you when you write `loginUser(orderId, userId)`

---

## Background: Two Worlds of Type Systems

> **Feature Origin Story: Structural vs. Nominal Typing**
>
> There are two fundamental philosophies in type theory:
> **Structural Typing** and **Nominal Typing**.
>
> Java, C#, Swift — they all use **Nominal Typing**: a type is identified by its
> *name*. A `UserId` class and an `OrderId` class are different types, even if
> both contain only a `String`.
>
> TypeScript uses **Structural Typing**: types are identified by their *structure*.
> If two types have the same structure, they are interchangeable — regardless of
> what they're called.
>
> Anders Hejlsberg (TypeScript's creator) deliberately chose Structural Typing
> because TypeScript is meant to type *JavaScript* — and JavaScript has no classes
> in the traditional sense. Structural Typing fits better with the dynamic nature
> of JavaScript objects.
>
> But this has a consequence: aliases for primitive types bring no additional type
> safety. `type Meter = number` and `type Second = number` are **identical** to
> TypeScript.

---

## The Problem: Type Aliases Don't Help
<!-- section:summary -->
Imagine you have a user management API:

<!-- depth:standard -->
Imagine you have a user management API:

```typescript annotated
// You think this makes your code safer:
type UserId = string;
type OrderId = string;
type SessionToken = string;

function getUser(id: UserId): User { /* ... */ return {} as User; }
function getOrder(id: OrderId): Order { /* ... */ return {} as Order; }
function validateSession(token: SessionToken): boolean { return true; }

// But look at what TypeScript allows:
const userId: UserId = "user-123";
const orderId: OrderId = "order-456";
const token: SessionToken = "abc-token";

getUser(orderId);     // NO ERROR! OrderId is structurally identical to UserId
// ^ This is a bug: we're passing an Order ID to a User function

getOrder(token);      // NO ERROR! SessionToken is identical to OrderId
// ^ Even worse: a session token as an Order ID

validateSession(userId); // NO ERROR! Literal string
// ^ TypeScript sees: "string" = "string". No problem.
```

> 🧠 **Explain it to yourself:** Why doesn't `type UserId = string` help?
> What does TypeScript do when comparing types? And what would TypeScript need to do
> for `UserId` to truly be different from `string`?
>
> **Key points:** TypeScript checks structure, not names | `UserId = string`
> means: "UserId IS string" (alias, not a new type) | For real protection
> we need a structural difference | Solution: add a unique property

> 🧪 **Experiment:** Open your TypeScript Playground or editor and try:
>
> ```typescript
> type UserId = string;
> type OrderId = string;
>
> function getOrder(id: OrderId): void {
>   console.log(`Order for: ${id}`);
> }
>
> const userId: UserId = "user-42";
> getOrder(userId);  // What happens?
> ```
>
> TypeScript does **NOT** complain — that's exactly the problem that Branded Types
> solve. To the compiler, `UserId` is exactly the same as `OrderId` and `string`.
> There is no structural difference. The type alias is just a label for
> humans, not for the compiler.
>
> Now try the counterexample:
>
> ```typescript
> type UserId = string & { readonly __brand: 'UserId' };
> type OrderId = string & { readonly __brand: 'OrderId' };
>
> function getOrder(id: OrderId): void {
>   console.log(`Order for: ${id}`);
> }
>
> const userId = "user-42" as UserId;
> getOrder(userId);  // Now: COMPILE ERROR!
> ```
>
> See the difference? The `__brand` property value differs
> (`'UserId'` vs `'OrderId'`), so the types are structurally incompatible.

---

<!-- /depth -->
## Why Structural Typing Creates This Problem
<!-- section:summary -->
The problem is not that Structural Typing is bad — it's that

<!-- depth:standard -->
The problem is not that Structural Typing is bad — it's that
**primitive types have no inner structure**.

When you have two interfaces with different properties, TypeScript immediately
recognizes the difference:

```typescript annotated
interface User { name: string; email: string; }
interface Product { title: string; price: number; }

// TypeScript recognizes: User ≠ Product (different properties)
function greetUser(user: User): void { /* ... */ }
// greetUser({ title: "Laptop", price: 999 }); // ❌ COMPILE ERROR
// ^ "title" does not exist in User
```

But for primitive types — `string`, `number`, `boolean` — there are **no**
properties TypeScript could use to distinguish them:

```typescript annotated
type UserId = string;    // Structure: string ← no own properties
type OrderId = string;   // Structure: string ← identical!

// TypeScript sees: string === string → compatible
```

This is the core of the problem. **Structural Typing works perfectly with
objects** (different properties → different types). It only fails where there is
no structure to compare — with primitive aliases.

> 💭 **Think about it:** If Structural Typing correctly distinguishes objects,
> why isn't it enough to model all IDs as objects?
> E.g. `{ value: string, type: 'UserId' }` instead of `type UserId = string`?
>
> **Answer:** That would work — but it changes the runtime representation.
> Everywhere a `string` is expected (APIs, JSON, database queries), you'd have to
> extract `.value`. Branded Types are more elegant: they exist **only at
> compile time** and disappear entirely in the transpiled JavaScript.

---

<!-- /depth -->
## Real Bugs from Type Confusion
<!-- section:summary -->
This is not a theoretical problem. It happens in practice:

<!-- depth:standard -->
This is not a theoretical problem. It happens in practice:

```typescript annotated
// E-Commerce Backend
type ProductId = string;
type CartId = string;
type CouponCode = string;

// All three: structurally identical to string

function applyDiscount(cartId: CartId, coupon: CouponCode): void {
  // Processing...
}

function deleteProduct(productId: ProductId): void {
  // DANGEROUS operation!
}

// Somewhere in the code:
const productId: ProductId = "prod-789";
const cartId: CartId = "cart-456";
const coupon: CouponCode = "SAVE20";

// TypeScript says: OK!
applyDiscount(productId, cartId);
// ^ Bug: productId as cartId, cartId as coupon

deleteProduct(coupon);
// ^ Bug: CouponCode as ProductId — could trigger product deletion
```

> 💭 **Think about it:** This bug would cause a runtime error in the database
> — but only then, not at compile time. What would be different
> if TypeScript could warn us at compile time?
>
> **Answer:** Compile-time errors are "free" — they consume no server time,
> leave no inconsistent database state, and are noticed immediately by the developer
> (in the editor). Runtime errors often only appear in production,
> when real data is being moved. TypeScript's goal: catch errors as early as possible.

---

<!-- /depth -->
## Nominal Typing in Other Languages
<!-- section:summary -->
For comparison: in Java, this problem wouldn't be possible:

<!-- depth:standard -->
For comparison: in Java, this problem wouldn't be possible:

```java
// Java: Nominal Typing
class UserId {
    private final String value;
    UserId(String value) { this.value = value; }
}

class OrderId {
    private final String value;
    OrderId(String value) { this.value = value; }
}

// Java: COMPILE ERROR!
// getUser(new OrderId("order-456")); // Type mismatch: UserId vs OrderId
```

Java's type system says: `UserId ≠ OrderId`, even though both contain only `String`,
because they have different **names** (Nominal).

TypeScript says: `UserId = OrderId`, because both are structurally `string`.

> 🔍 **Deeper knowledge: Why doesn't TypeScript have built-in Nominal Typing?**
>
> The TypeScript designers have discussed Nominal Typing multiple times (GitHub Issues
> #202, #9455, #33148). The main argument against it: TypeScript must interoperate with
> existing JavaScript code. JavaScript objects have no "class identity" in the Java sense.
>
> Furthermore, Nominal Typing would destroy the ergonomic advantage of TypeScript:
> if `{ name: string, age: number }` and `Person` (with the same fields) were
> incompatible, you'd have to explicitly convert everywhere. That's the TypeScript
> nightmare — all the benefits of "just works with JS" would be gone.
>
> The solution is therefore a **workaround**: we *simulate* Nominal Typing
> within the Structural Type System — the so-called "Brand Technique".

---

<!-- /depth -->
## The Structural Typing Dilemma
<!-- section:summary -->
We want the best of both worlds:

<!-- depth:standard -->
The problem is clear:

```
Structural Typing (TypeScript):
  UserId = string → usable EVERYWHERE a string is expected
  type Aliases → documentation only, no real protection

Nominal Typing (Java):
  UserId ≠ OrderId → even if both are string-based
  Classes → real type identity, but: explicit conversions everywhere
```

We want the best of both worlds:
- TypeScript's ergonomics (no explicit casting everywhere)
- Java's safety (interchangeable? → compile error)

That's exactly what **Branded Types** deliver.

<!-- depth:vollstaendig -->
> **In your Angular project**, type confusion is especially dangerous
> in services that process IDs. If you have an `HttpClient` service with
> `getUserById(id: string)` and `deleteAccount(userId: string)`, a mix-up
> (wrong ID type) can delete the wrong account.
>
> ```typescript
> // Typical Angular service — vulnerable to confusion:
> @Injectable({ providedIn: 'root' })
> export class UserService {
>   getUserById(id: string) { /* ... */ }
>   deleteAccount(userId: string) { /* DANGEROUS without Branded Types */ }
> }
>
> // With Branded Types (coming in Section 02):
> type UserId = string & { readonly __brand: 'UserId' };
> deleteAccount(userId: UserId) { /* Only accepts UserId now! */ }
> ```

---

<!-- /depth -->
## Summary: What's Missing

| Approach | Type Safety | Ergonomics | Problem |
|----------|:-----------:|:----------:|---------|
| `type UserId = string` | ❌ None | ✅ Maximum | No real protection |
| `class UserId { ... }` | ✅ Good | ❌ Minimal | `new UserId(...)` everywhere |
| Interface with Phantom | ✅ Good | ✅ Good | Must be explicitly cast |
| **Branded Types** | ✅ Good | ✅ Good | Our solution! |

---

## What you've learned

- TypeScript's **Structural Typing** means: `type UserId = string` offers
  no protection — UserId and OrderId are identical to TypeScript
- **Type aliases** are just documentation, not a new type identity
- This difference leads to real bugs: wrong IDs passed to wrong functions
- **Nominal Typing** (Java/C#) solves this, but is incompatible with TypeScript's design
- The solution: **Branded Types** — Nominal Typing simulated within the Structural system

> 🧠 **Explain it to yourself:** What is the fundamental difference between
> `type UserId = string` and a Java class `UserId`? What does TypeScript
> vs. Java check when comparing types?
>
> **Key points:** TypeScript: structure (string = string) | Java: name (UserId ≠ OrderId) |
> Type alias = renaming, not a new type | Branded Types: make the structure artificially different

**Core concept to remember:** `type UserId = string` is just a comment for
humans — the TypeScript compiler only sees `string`. To get real type safety,
we need to make the *structure* of the types different.

---

> **Pause point** -- You understand the problem. Now comes the solution.
>
> Continue with: [Section 02: The Brand Technique](./02-die-brand-technik.md)