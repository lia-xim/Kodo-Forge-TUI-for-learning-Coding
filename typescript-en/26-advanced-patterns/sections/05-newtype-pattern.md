# Section 5: The Newtype Pattern

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Fluent API Pattern](./04-fluent-api-pattern.md)
> Next section: [06 - Practical Combination](./06-praxis-kombination.md)

---

## What you'll learn here

- What the **Newtype Pattern** is and how it differs from Branded Types
- How to build **wrapper types** with full type safety and zero runtime overhead
- When to choose **Newtype vs. Branded Type vs. Phantom Type**
- How the **Opaque Type Pattern** works in large codebases

---

## Background: Newtypes in Haskell and Rust

> **Feature Origin Story: Newtype**
>
> The Newtype Pattern originates from Haskell: `newtype UserId = UserId Int`.
> It creates a completely new type that is identical to the base type at
> runtime (the compiler optimizes away the wrapper).
>
> Rust has a similar concept: `struct UserId(i32)` — a tuple struct
> as a wrapper. Unlike Haskell, the Rust wrapper does have a runtime
> representation, but the compiler can often optimize it away.
>
> TypeScript has no built-in newtype. But by combining Branded Types,
> Phantom Types, and Utility Types, we can build a very similar pattern.
> The advantage over simple Branded Types: Newtypes can define their own
> **operations** that only work on that newtype.

---

## The Problem: Primitive Obsession

```typescript annotated
// "Primitive Obsession" — everything is string or number:
function createOrder(
  userId: string,      // User ID
  productId: string,   // Product ID
  quantity: number,     // Quantity
  priceInCents: number  // Price in cents
): void {
  // Which string is which ID?
  // Which number is quantity, which is price?
}

// Mixing them up is EASY:
createOrder(
  "prod-123",  // Oops! productId instead of userId
  "user-456",  // Oops! userId instead of productId
  1999,        // Is this the quantity or the price?
  3            // And this?
);
// ^ TypeScript: "All good!" — Everything is string/number.
```

> 💭 **Think about it:** You've learned about Branded Types (L24) and Phantom Types (L26.3).
> Both solve this problem. Why do we need yet
> another pattern?
>
> **Answer:** Branded Types and Phantom Types prevent mix-ups.
> Newtypes go one step further: they define **their own
> operations** that only work on that type. For example, you can't
> add two `UserId`s, even though internally it's a `number`.

---

## Newtype in TypeScript: The Complete Approach

```typescript annotated
// Step 1: Newtype foundation with unique symbol
// (unique symbol is guaranteed unique at compile time — perfect for branding)
declare const UserIdBrand: unique symbol;
declare const ProductIdBrand: unique symbol;
declare const CentsAmountBrand: unique symbol;

// Step 2: Newtype definitions
type UserId = string & { readonly [UserIdBrand]: typeof UserIdBrand };
type ProductId = string & { readonly [ProductIdBrand]: typeof ProductIdBrand };
type CentsAmount = number & { readonly [CentsAmountBrand]: typeof CentsAmountBrand };
// ^ Each type has a unique symbol as its brand
// ^ At runtime these are plain string/number values

// Step 3: Smart Constructors (validation at creation time)
function UserId(raw: string): UserId {
  if (!raw.startsWith("user-")) {
    throw new Error(`Invalid UserId: ${raw}`);
  }
  return raw as UserId;
}

function ProductId(raw: string): ProductId {
  if (!raw.startsWith("prod-")) {
    throw new Error(`Invalid ProductId: ${raw}`);
  }
  return raw as ProductId;
}

function CentsAmount(raw: number): CentsAmount {
  if (!Number.isInteger(raw) || raw < 0) {
    throw new Error(`Invalid cent amount: ${raw}`);
  }
  return raw as CentsAmount;
}

// Step 4: Type-safe functions
function createOrder(
  userId: UserId,
  productId: ProductId,
  quantity: number,
  price: CentsAmount
): void { /* ... */ }

// Now:
const uid = UserId("user-456");
const pid = ProductId("prod-123");
const price = CentsAmount(1999);

createOrder(uid, pid, 3, price); // OK
// createOrder(pid, uid, 3, price); // COMPILE ERROR!
// ^ ProductId is not UserId — even though both are internally strings
```

> 🧠 **Explain to yourself:** Why do we use `unique symbol` instead of
> a simple string literal as the brand? What would be the downside of
> `type UserId = string & { __brand: "UserId" }`?
>
> **Key points:** unique symbol is guaranteed unique at compile time |
> String literals could collide across different files |
> unique symbol cannot be accidentally duplicated |
> For small projects string brands are fine — for large ones use unique symbol

---

## Operations on Newtypes
<!-- section:summary -->
The core advantage of newtypes: defining their own operations:

<!-- depth:standard -->
The core advantage of newtypes: defining their own operations:

```typescript annotated
// Cent amounts can be added — the result is another CentsAmount:
function addCents(a: CentsAmount, b: CentsAmount): CentsAmount {
  return ((a as number) + (b as number)) as CentsAmount;
  // ^ Internal cast: we know that number + number = number
  //   and the result is still a valid CentsAmount
}

// Cent amounts can be multiplied by a factor:
function multiplyCents(amount: CentsAmount, factor: number): CentsAmount {
  return Math.round((amount as number) * factor) as CentsAmount;
}

// BUT: Adding two UserIds makes no sense!
// addCents(UserId("user-1"), UserId("user-2")); // COMPILE ERROR!
// ^ UserId is not CentsAmount — even though both are internally string/number.

// Formatting as its own operation:
function formatCents(amount: CentsAmount): string {
  const euros = (amount as number) / 100;
  return `${euros.toFixed(2)} EUR`;
}

console.log(formatCents(CentsAmount(1999))); // "19.99 EUR"
```

<!-- depth:vollstaendig -->
> **Experiment:** Build a newtype system for temperature:
>
> ```typescript
> // Define Celsius and Fahrenheit as newtypes:
> declare const CelsiusBrand: unique symbol;
> declare const FahrenheitBrand: unique symbol;
>
> type Celsius = number & { readonly [CelsiusBrand]: typeof CelsiusBrand };
> type Fahrenheit = number & { readonly [FahrenheitBrand]: typeof FahrenheitBrand };
>
> // Conversion function:
> function toFahrenheit(c: Celsius): Fahrenheit {
>   return ((c as number) * 9/5 + 32) as Fahrenheit;
> }
>
> // What happens with: toFahrenheit(72 as Fahrenheit)?
> // Answer: COMPILE ERROR! Fahrenheit is not Celsius.
> // Without newtypes: 72°F would be interpreted as 161.6°F — a silent bug.
> ```

---

<!-- /depth -->
## Opaque Types: Newtypes in Large Codebases
<!-- section:summary -->
In large projects the **Opaque Type Pattern** is commonly used:

<!-- depth:standard -->
In large projects the **Opaque Type Pattern** is commonly used:
The type's internal structure is only known within a single module:

```typescript annotated
// user-id.ts — Only this module knows the internal structure
declare const brand: unique symbol;
export type UserId = string & { readonly [brand]: "UserId" };

// Smart Constructor — the ONLY way to create a UserId:
export function createUserId(raw: string): UserId {
  if (!/^user-\d+$/.test(raw)) {
    throw new Error(`Invalid UserId format: ${raw}`);
  }
  return raw as UserId;
}

// Helper functions:
export function userIdToString(id: UserId): string {
  return id; // Implicit conversion: UserId is a string
}

// Other modules CANNOT create a UserId themselves:
// const fake = "user-123" as UserId; // Technically works,
// but the convention is: use ONLY createUserId().
// In strict code reviews, `as UserId` is rejected.
```

> ⚡ **In your Angular project** you can use Opaque Types for
> entity IDs:
>
> ```typescript
> // entity-ids.ts
> export type UserId = string & { readonly __entity: "User" };
> export type OrderId = string & { readonly __entity: "Order" };
>
> // user.service.ts
> @Injectable({ providedIn: 'root' })
> export class UserService {
>   getUser(id: UserId): Observable<User> {
>     return this.http.get<User>(`/api/users/${id}`);
>   }
> }
>
> // Now: this.userService.getUser(orderId) → COMPILE ERROR!
> // An OrderId is not a UserId. Mix-ups are impossible.
> ```
>
> In React with TypeScript:
>
> ```typescript
> // Type-safe route parameters:
> type RouteParams = { userId: UserId; orderId: OrderId };
> const { userId, orderId } = useParams<RouteParams>();
> // userId is UserId, orderId is OrderId — no mix-ups
> ```

---

<!-- /depth -->
## Decision Matrix: Which Pattern When?
<!-- section:summary -->
| Criterion | Branded Type | Phantom Type | Newtype |

<!-- depth:standard -->
| Criterion | Branded Type | Phantom Type | Newtype |
|---|---|---|---|
| Prevent mix-ups | Yes | Yes | Yes |
| Custom operations | No | Limited | Yes |
| State tracking | No | Yes | Possible |
| Validation at creation | Optional | Optional | Recommended |
| Complexity | Low | Medium | Medium-High |
| Recommendation | Simple IDs | States | Domain values |

---

<!-- /depth -->
## What you've learned

- The **Newtype Pattern** creates semantically distinct types from the same base type
- **Smart Constructors** validate at creation time and are the only way to create newtypes
- **Custom operations** (addCents, multiplyCents) only work on the correct newtype
- **Opaque Types** hide the internal structure behind a module boundary
- `unique symbol` provides stronger uniqueness guarantees than string literals as a brand

> 🧠 **Explain to yourself:** What is the difference between
> `type UserId = string & { __brand: "UserId" }` and the newtype approach
> with `unique symbol`? When is the simple brand sufficient?
>
> **Key points:** String brand is fine for small projects | unique symbol
> for large codebases | Newtype with Smart Constructor enforces validation |
> Branded Type allows `as UserId` without validation

**Key concept to remember:** Newtypes are "wrappers without wrappers" —
they give primitive values a domain meaning, with validation at creation
time and custom operations, without any runtime overhead.

---

> **Pause point** -- You now know 5 advanced patterns.
> In the final section we'll combine everything.
>
> Continue with: [Section 06: Practical Combination](./06-praxis-kombination.md)