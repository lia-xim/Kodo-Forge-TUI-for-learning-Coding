# Section 4: Business Logic — Generics and Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - API Layer](./03-api-layer.md)
> Next section: [05 - Conclusion](./05-abschluss.md)

---

## What you'll learn here

- How to build a **generic repository** that is reusable for any entity
- **Event system with discriminated unions** for loose coupling between modules
- How to **combine generics, conditional types, and mapped types** in business logic
- Why the offensive core **needs no runtime checks**

---

## Layer 3: Business Logic

At the core of the system we trust the type system. The data has
been validated by the defensive shell, the domain types are secured
through branded types and discriminated unions. Here it's about
**reusable patterns and clean abstractions**.

---

## Repository<T>: Generic Data Access Pattern

```typescript annotated
// ── Generic Repository (L13, L14, L22) ──────────────────────────

// Base constraint: every entity has an ID
interface Entity<Id> {
  readonly id: Id;
}

// The generic repository:
interface Repository<T extends Entity<unknown>> {
  findById(id: T["id"]): Promise<T | undefined>;
  // ^ T["id"] — the ID type is extracted from T (Indexed Access)
  findAll(): Promise<readonly T[]>;
  create(entity: Omit<T, "id">): Promise<T>;
  // ^ Omit removes "id" — it gets generated on creation
  update(id: T["id"], patch: Partial<Omit<T, "id">>): Promise<T | undefined>;
  delete(id: T["id"]): Promise<boolean>;
}

// Concrete implementation for User:
interface User extends Entity<UserId> {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
}

// In-memory implementation (for tests and demos):
class InMemoryRepository<T extends Entity<unknown>> implements Repository<T> {
  private items = new Map<unknown, T>();

  async findById(id: T["id"]): Promise<T | undefined> {
    return this.items.get(id);
  }

  async findAll(): Promise<readonly T[]> {
    return [...this.items.values()];
  }

  async create(entity: Omit<T, "id">): Promise<T> {
    // ID generation must come from the caller (via factory):
    throw new Error("Use factory method");
  }

  async update(id: T["id"], patch: Partial<Omit<T, "id">>): Promise<T | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch } as T;
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: T["id"]): Promise<boolean> {
    return this.items.delete(id);
  }
}
```

> 📖 **Background: Repository Pattern and Generics**
>
> The repository pattern comes from Martin Fowler (Patterns of
> Enterprise Application Architecture, 2002). It abstracts data
> access — whether database, API, or in-memory. Generics make it
> reusable: `Repository<User>` and `Repository<Order>` share the
> same implementation with different types. That is the essence of
> generics (L13): write code once, use it with any type.

> 🧠 **Explain it to yourself:** Why is `T["id"]` as a parameter
> type better than `string`? What happens when User has a `UserId`
> type and Order has an `OrderId` type?
> **Key points:** T["id"] extracts the specific ID type |
> Repository<User>.findById expects UserId, not string |
> Repository<Order>.findById expects OrderId |
> Mixing them up is impossible — the compiler checks

---

## Event System: Loose Coupling with Types

```typescript annotated
// ── Type-safe event system (L17, L26) ───────────────────────────

// Event definitions as discriminated union:
type DomainEvent =
  | { type: "order:created"; orderId: OrderId; userId: UserId; timestamp: Date }
  | { type: "order:paid"; orderId: OrderId; paymentId: string; timestamp: Date }
  | { type: "order:shipped"; orderId: OrderId; trackingId: string; timestamp: Date }
  | { type: "order:cancelled"; orderId: OrderId; reason: string; timestamp: Date }
  | { type: "user:registered"; userId: UserId; email: string; timestamp: Date };

// Event bus with generic handler:
type EventHandler<E extends DomainEvent["type"]> =
  (event: Extract<DomainEvent, { type: E }>) => Promise<void>;
// ^ Extract filters the DU down to the specific event type (L15)

class EventBus {
  private handlers = new Map<string, Array<(event: any) => Promise<void>>>();

  on<E extends DomainEvent["type"]>(
    eventType: E,
    handler: EventHandler<E>
  ): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as any);  // any only internally — public API is type-safe
    this.handlers.set(eventType, existing);
  }

  async emit<E extends DomainEvent["type"]>(
    event: Extract<DomainEvent, { type: E }>
  ): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? [];
    await Promise.all(handlers.map(h => h(event)));
  }
}
```

### Usage

```typescript annotated
const bus = new EventBus();

// Register handler — fully type-safe:
bus.on("order:paid", async (event) => {
  event.orderId;   // OrderId — autocomplete!
  event.paymentId; // string — autocomplete!
  // event.reason; // ERROR: 'reason' does not exist on "order:paid"
  await sendPaymentConfirmation(event.orderId);
});

// Emit event — payload is checked:
bus.emit({
  type: "order:paid",
  orderId: createOrderId(),
  paymentId: "pay_123",
  timestamp: new Date(),
});

// bus.emit({ type: "order:paid", reason: "test" });
// ^ ERROR: 'reason' does not exist, 'paymentId' is missing
```

> ⚡ **Framework connection:** In Angular with NgRx the event bus
> is the store: actions are events, effects are handlers. The
> discriminated union of actions corresponds to our `DomainEvent`.
> In React with Redux Toolkit: `createSlice` defines actions as
> a discriminated union. The event system pattern is identical —
> only the infrastructure differs.

---

## Order Service: Everything Together

```typescript annotated
// ── Order Service — the offensive core ──────────────────────────

class OrderService {
  constructor(
    private readonly orderRepo: Repository<Order & Entity<OrderId>>,
    private readonly eventBus: EventBus,
  ) {}

  async createOrder(userId: UserId, items: readonly CartItem[]): Promise<Result<Order, "empty-cart">> {
    if (items.length === 0) {
      return { ok: false, error: "empty-cart" };
    }

    const order: Order = {
      status: "draft",
      id: createOrderId(),
      userId,
      items,
    };

    // No validation needed — types guarantee correctness:
    // userId is UserId (not string), items is CartItem[] (not any[])
    await this.eventBus.emit({
      type: "order:created",
      orderId: order.id,
      userId: order.userId,
      timestamp: new Date(),
    });

    return { ok: true, value: order };
  }

  async payOrder(orderId: OrderId, paymentId: string): Promise<Result<Order, "not-found" | "invalid-status">> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) return { ok: false, error: "not-found" };
    if (order.status !== "pending") return { ok: false, error: "invalid-status" };

    // TypeScript knows: order.status is "pending" after the check
    // So order.total (cents) is available — narrowing in action!

    const paidOrder: Order = {
      ...order,
      status: "paid",
      paymentId,
    };

    await this.eventBus.emit({
      type: "order:paid",
      orderId: paidOrder.id,
      paymentId,
      timestamp: new Date(),
    });

    return { ok: true, value: paidOrder };
  }
}
```

> 💭 **Think about it:** The OrderService has NO runtime validation.
> Is that a problem? What protects it from incorrect data?
>
> **Answer:** The type contract protects it. `userId: UserId` can
> only be created through a smart constructor (validated).
> `items: CartItem[]` is validated by the API layer. Inside
> the offensive core the type is the proof. Runtime checks would
> be redundant and would bloat the code.

---

## Experiment: Notification Service

Build a notification service that reacts to events:

```typescript
// The service listens to events and sends notifications:
class NotificationService {
  constructor(private readonly eventBus: EventBus) {
    // Register handlers for relevant events:
    this.eventBus.on("order:paid", async (event) => {
      await this.sendEmail(
        event.orderId,
        `Payment ${event.paymentId} received`
      );
    });

    this.eventBus.on("order:shipped", async (event) => {
      await this.sendEmail(
        event.orderId,
        `Shipped with tracking: ${event.trackingId}`
      );
    });
  }

  private async sendEmail(orderId: OrderId, message: string): Promise<void> {
    console.log(`[Notification] Order ${orderId}: ${message}`);
  }
}

// Experiment: Add an "order:cancelled" handler.
// What happens when you access event.trackingId?
// (Answer: compile error — cancelled has no trackingId!)
```

---

## What you've learned

- **Repository<T>** abstracts data access for any entity — generics in pure form
- **Event system** with discriminated unions for type-safe loose coupling
- The **offensive core** needs no runtime checks — types are the proof
- **Extract<DomainEvent, { type: E }>** filters the correct event variant (L15)
- All concepts from 40 lessons flow into a coherent business logic layer

> 🧠 **Explain it to yourself:** Count all TypeScript concepts in
> this section: generics, indexed access types, Omit, Partial,
> Extract, discriminated unions, branded types, result pattern,
> exhaustive narrowing, readonly. How many individual concepts are
> working together here?
> **Key points:** At least 10 different concepts | None of them
> are new — all from L02–L39 | The art lies not in the individual
> concept but in the combination

**Key concept to remember:** In the offensive core the code is surprisingly simple. No null checks, no validation, no unsafe casts. The complexity lives in the types — and those disappear at runtime.

---

> **Pause point** — Business logic is done. The final section brings
> everything together: review and outlook.
>
> Continue with: [Section 05: Conclusion](./05-abschluss.md)