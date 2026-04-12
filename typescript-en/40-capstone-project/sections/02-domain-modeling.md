# Section 2: Domain Modeling — Branded Types and Discriminated Unions

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Project Overview](./01-projekt-ueberblick.md)
> Next section: [03 - API Layer](./03-api-layer.md)

---

## What you'll learn here

- How to build a **domain model** with Branded Types and Discriminated Unions
- **Smart Constructors** for type-safe entity creation
- The **Money type**: Why cents instead of euros and how to make arithmetic operations type-safe
- **Order status as a state machine** with a Discriminated Union

---

## Layer 1: The Domain Model

The domain model is the foundation. It defines the language
of your system — the types used everywhere.

```typescript annotated
// ── Branded ID types (L24) ──────────────────────────────────────
// Each entity gets its own ID type:

declare const UserIdBrand: unique symbol;
type UserId = string & { readonly [UserIdBrand]: typeof UserIdBrand };

declare const ProductIdBrand: unique symbol;
type ProductId = string & { readonly [ProductIdBrand]: typeof ProductIdBrand };

declare const OrderIdBrand: unique symbol;
type OrderId = string & { readonly [OrderIdBrand]: typeof OrderIdBrand };

// Smart Constructors (Parse, Don't Validate):
function createUserId(raw: string): UserId {
  if (!raw.startsWith("usr_")) throw new Error(`Invalid UserId: ${raw}`);
  return raw as UserId;
}

function createOrderId(): OrderId {
  return `ord_${crypto.randomUUID()}` as OrderId;
}
// ^ The Smart Constructors are the ONLY place that assigns brands
// ^ All other modules must use them
```

> 📖 **Background: Domain-Driven Design and TypeScript**
>
> Eric Evans coined the term "Domain-Driven Design" (DDD) in 2003.
> A core principle: the software structure should mirror the business
> domain. In TypeScript we achieve this with types: a `UserId` is not
> simply a `string` — it is a concept from the business domain.
> Branded Types make domain concepts first-class citizens in the type
> system. This not only prevents mix-ups but turns the code into an
> executable glossary of the business language.
>
> 💡 **Analogy:** Branded Types are like labels on medicine bottles.
> Without a label, all white pills look the same (`string`). With a
> label (`UserId`, `ProductId`) you immediately know which one is
> meant. A mix-up is caught at compile time — not only when the
> patient takes the wrong medication.

---

## The Money Type: Cents Instead of Euros

```typescript annotated
// ── Money type (L24 Branded + Newtype Pattern) ──────────────────
declare const CentsBrand: unique symbol;
type Cents = number & { readonly [CentsBrand]: typeof CentsBrand };

// Smart Constructor:
function cents(amount: number): Cents {
  if (!Number.isInteger(amount)) throw new Error("Cents must be integer");
  if (amount < 0) throw new Error("Cents must be non-negative");
  return amount as Cents;
}

// Arithmetic for Money — the brand is not lost with +:
function addMoney(a: Cents, b: Cents): Cents {
  return ((a as number) + (b as number)) as Cents;
}

function multiplyMoney(amount: Cents, factor: number): Cents {
  return Math.round((amount as number) * factor) as Cents;
}

// Conversion for display:
function formatEuro(amount: Cents): string {
  return `${((amount as number) / 100).toFixed(2)} EUR`;
}
// ^ cents(1999) → "19.99 EUR"
```

### Why Cents Instead of Euros?

```typescript annotated
// BAD: Floating-point errors
const price = 19.99;
const tax = price * 0.19;
console.log(tax);  // 3.7981000000000003 — NOT 3.80!

// GOOD: Integer arithmetic with cents
const priceInCents = cents(1999);
const taxInCents = multiplyMoney(priceInCents, 0.19);
// ^ Math.round(1999 * 0.19) = 380 → cents(380) → "3.80 EUR"
```

> 💡 **Analogy:** The Money type is like a safe for cash.
> You would never just leave banknotes lying on the table — you lock
> them in a safe with defined access points. Cents locks monetary
> values into a type with defined operations. Nobody can accidentally
> compute "19.99 + 0.19" and wonder why 20.17999999999999999999 comes out.

> ⚡ **Framework reference:** In Angular enterprise applications the
> Money type is typically provided in a shared/ directory as a barrel
> export. Every feature module imports `Cents` from
> `@app/shared/money`. In React/Next.js full-stack projects the same
> type is used on both the server (API Routes) and the client
> (Components) — that is the advantage of framework-agnostic types.
> Stripe's own TypeScript bindings use the same principle: all amounts
> are specified in cents/smallest currency unit.

> 🧠 **Explain it to yourself:** Why is `addMoney` necessary instead
> of simply writing `a + b`? What happens to the brand with normal
> addition?
> **Key points:** `a + b` yields `number`, not `Cents` | The brand
> is lost because `+` only works with `number` | `addMoney` casts
> the result back to Cents | This is the cost of Branded Types: custom
> operations are required

---

## Order Status as a State Machine

```typescript annotated
// ── Order status as Discriminated Union (L12, L26) ─────────────

interface CartItem {
  readonly productId: ProductId;
  readonly name: string;
  readonly price: Cents;
  readonly quantity: number;
}

type Order =
  | { readonly status: "draft";     readonly id: OrderId; readonly userId: UserId; readonly items: readonly CartItem[] }
  | { readonly status: "pending";   readonly id: OrderId; readonly userId: UserId; readonly items: readonly CartItem[]; readonly total: Cents }
  | { readonly status: "paid";      readonly id: OrderId; readonly userId: UserId; readonly items: readonly CartItem[]; readonly total: Cents; readonly paymentId: string }
  | { readonly status: "shipped";   readonly id: OrderId; readonly userId: UserId; readonly items: readonly CartItem[]; readonly total: Cents; readonly paymentId: string; readonly trackingId: string }
  | { readonly status: "cancelled"; readonly id: OrderId; readonly userId: UserId; readonly reason: string };

// Permitted state transitions (L26 Transition Map):
type OrderTransitions = {
  draft: "pending" | "cancelled";
  pending: "paid" | "cancelled";
  paid: "shipped";
  shipped: never;  // Terminal state
  cancelled: never;  // Terminal state
};

// Type-safe transition function:
function transitionOrder<S extends Order["status"]>(
  order: Extract<Order, { status: S }>,
  to: OrderTransitions[S]
): Order {
  // Implementation based on 'to'...
  switch (to) {
    case "pending":
      return { ...order, status: "pending", total: calculateTotal(order.items) } as Order;
    // ... further cases
    default:
      return order;
  }
}
```

> ⚡ **Framework reference:** In Angular projects the order status
> would live in the NgRx store. The Discriminated Union enforces that
> actions only trigger valid transitions: `dispatch(payOrder())` is
> only possible when the status is "pending". In React with
> useReducer, the reducer would use an exhaustive check to guarantee
> that all status transitions are handled.

> 💭 **Think about it:** Why are all properties `readonly`? What
> would happen if `items` were mutable?
>
> **Answer:** Immutability prevents side effects. If `items` were
> mutable, someone could call `order.items.push(...)` without the
> `total` being updated. With `readonly` the only way to make changes
> is to create a new Order with the updated values — and in doing so,
> the new `total` MUST be calculated.
>
> 💡 **Analogy:** `readonly` is like a museum exhibit behind glass.
> You can look at it and describe it, but not touch it. If you want
> to change it you have to photograph it (copy), edit the photo, and
> present it as a new exhibit. This preserves the history and nobody
> can secretly alter anything.

---

## Helper Functions for the Domain Model

```typescript annotated
// Calculate the total price of a shopping cart:
function calculateTotal(items: readonly CartItem[]): Cents {
  return items.reduce(
    (sum, item) => addMoney(sum, multiplyMoney(item.price, item.quantity)),
    cents(0)
  );
}

// Exhaustive handler for order status:
function getOrderDisplayText(order: Order): string {
  switch (order.status) {
    case "draft":     return `Draft (${order.items.length} items)`;
    case "pending":   return `Pending (${formatEuro(order.total)})`;
    case "paid":      return `Paid (Payment: ${order.paymentId})`;
    case "shipped":   return `Shipped (Tracking: ${order.trackingId})`;
    case "cancelled": return `Cancelled (${order.reason})`;
    default: {
      const _: never = order;
      // ^ Compile error if a status is missing!
      return _;
    }
  }
}
```

---

## Experiment: Extend the Domain Model

```typescript
// Task 1: Add a "refunded" status.
// What changes in the transition map?
// What new fields does the status need?

// Task 2: Create an Email Branded Type with Smart Constructor:
// type Email = string & { readonly [EmailBrand]: typeof EmailBrand };
// function parseEmail(raw: string): Result<Email, "invalid-email">

// Task 3: Create a Quantity type (positive integer):
// Why is number alone not safe for quantities?
// What happens with quantity = -3 or quantity = 2.5?

// Experiment: Try to set an Order with status "draft" directly to
// "shipped". What does the compiler say?
```

---

## What you've learned

- **Branded IDs** prevent confusion between UserId, ProductId, and OrderId
- The **Money type** (Cents) avoids floating-point errors with monetary amounts
- **Order status as a Discriminated Union** makes impossible states unrepresentable
- **Transition Maps** enforce valid state transitions at compile time
- All properties are **readonly** for immutability

> 🧠 **Explain it to yourself:** Which lessons are embedded in this
> domain model? Count the concepts: Branded Types (L24), Discriminated
> Unions (L12), Smart Constructors (L24), Readonly (L04), Exhaustive
> Checks (L12), never (L02). How many can you find?
> **Key points:** At least 6 concepts from different lessons |
> This is the synthesis — individual building blocks forming a whole

**Core concept to remember:** A good domain model is like a contract: it defines what is possible and what is not. TypeScript makes this contract verifiable at compile time — not only at runtime.

> 💭 **Think about it:** Looking at your current project —
> which three domain concepts would you immediately convert to Branded
> Types? Which would benefit most from Discriminated Unions?
> **Key points:** IDs are the easiest candidates (UserId, OrderId,
> ProductId) | Status fields with boolean flags are the best DU
> candidates | Monetary values should always be modelled as Cents

---

> **Pause point** — The domain model is in place. Next layer: the
> API with type-safe routes and validation.
>
> Continue with: [Section 03: API Layer](./03-api-layer.md)