# Section 2: Structural Patterns — Shaping Interfaces

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Creational Patterns](./01-creational-patterns.md)
> Next section: [03 - Behavioral Patterns](./03-behavioral-patterns.md)

---

## What you'll learn here

- How the **Adapter Pattern** connects incompatible interfaces — without touching legacy code
- How a **Facade** hides complexity and exposes a clean API to the outside world
- How TypeScript's built-in **Proxy object** becomes type-safe with generics
- Why Angular HTTP Interceptors are a classic Decorator/Proxy Pattern

---

## Background: The Problem of Incompatible Plugs

Imagine you're an electrician in Germany and you receive a British plug.
Three rectangular pins instead of two round ones. The device is perfect — but the plug doesn't fit.
You need an adapter, not a new device.

That's exactly the problem the **Adapter Pattern** solves in software. The real-world trigger:
you're using a third-party library you can't modify. Or you have legacy code with a different
interface than your new code expects.

The GoF called it "Adapter" — some books also call it "Wrapper". The name describes it perfectly:
you wrap something so it looks different from the outside.

The Adapter Pattern was described in the 1990s as an important technique for C++ and Java —
languages without duck typing. In TypeScript it's often even more elegant, because the
structural type system requires far less boilerplate: if your class has the right methods,
*it is* the interface — regardless of what it's called.

> **TypeScript makes the Adapter Pattern 90% unnecessary:**
>
> In Java you need an adapter when an external library expects `ILogger`,
> but your logger is called `MyLogger` with different method names:
>
> ```java
> // Java — ADAPTER REQUIRED:
> class MyLoggerAdapter implements ILogger {
>   private MyLogger logger;
>   public void log(String msg) { logger.write(msg); }  // adapting method names
> }
> ```
>
> In TypeScript: **You often don't need an adapter at all.** Because TypeScript
> uses structural typing:
>
> ```typescript
> // TypeScript — NO adapter needed:
> const myLogger = { log: (msg: string) => console.log(msg) };
> takeLogger(myLogger);  // Works! Has the right STRUCTURE.
> ```
>
> **Real adapter cases in TypeScript:**
> - API response → Domain model (field names differ: `user_id` → `userId`)
> - Callback-based library → Promise-based API
> - Old synchronous interface → new asynchronous interface

> 🧠 **Explain it to yourself:** What's the difference between modifying the legacy
> code directly and writing an adapter? When would you prefer which approach?
> **Key points:** Legacy code often can't be changed (3rd-party, other teams) |
> Adapter protects existing code | Adapter is testable | Original code stays unchanged

---

## Adapter Pattern — Bridging Legacy Code

You're taking over a project. There's an old payment gateway from 2015 — hardcoded,
synchronous, with an API nobody likes anymore. But it works. The new code expects a
modern, asynchronous interface. You can't touch the old system.

```typescript annotated
// Old interface — third-party, immutable
interface LegacyPaymentGateway {
  chargeCard(amount: number, cardNumber: string): { success: boolean; transactionId: string };
  // ^ Synchronous — blocks, returns directly
  // ^ Mixes amount and card number — no structure
}

// New interface — what your modern code expects
interface PaymentRequest {
  amount: number;
  cardToken: string;     // No raw cardNumber anymore — PCI compliant
  currency: 'EUR' | 'USD' | 'GBP';
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  timestamp: Date;       // New field — legacy doesn't know it
}

interface PaymentService {
  processPayment(payment: PaymentRequest): Promise<PaymentResult>;
  // ^ Asynchronous — modern API convention
}

// Adapter — bridges old and new without touching legacy code
class LegacyPaymentAdapter implements PaymentService {
  constructor(private readonly legacy: LegacyPaymentGateway) {}
  // ^ The legacy code is INJECTED — testable and replaceable

  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    // Translates new data structure into old API
    const result = this.legacy.chargeCard(payment.amount, payment.cardToken);
    // ^ The legacy method is called synchronously
    return {
      success: result.success,
      transactionId: result.transactionId,
      timestamp: new Date(),
      // ^ Timestamp is added by the adapter — legacy doesn't know it
    };
  }
}

// Usage: New code only sees PaymentService — never LegacyPaymentGateway
const legacyGateway: LegacyPaymentGateway = new OldPaymentSystem();
const paymentService: PaymentService = new LegacyPaymentAdapter(legacyGateway);
// ^ TypeScript checks: LegacyPaymentAdapter must fully implement PaymentService
await paymentService.processPayment({ amount: 99.99, cardToken: 'tok_xyz', currency: 'EUR' });
```

TypeScript makes the pattern safer than in Java: the structural type system means that
`LegacyPaymentAdapter implements PaymentService` immediately gives a compile error if a
method is missing or incorrectly typed. No runtime surprises.

> 💭 **Think about it:** If you have two different legacy systems (OldPaymentGateway and
> ThirdPartyStripe) and want to adapt both — do you need two adapter classes or can
> you write a generic adapter?
>
> **Answer:** You need two separate adapters, because each legacy API has a different
> signature. But both implement `PaymentService` — your new code doesn't need to know
> which adapter is behind it. That's the value of the pattern.

---

## Facade Pattern — Hiding Complexity Behind a Simple Door

You have an online shop. Placing an order internally involves: validating the cart,
processing payment, updating inventory, sending notification, initiating shipping.
Five services, five different APIs. The controller shouldn't know any of this.

```typescript annotated
// The individual services — internally complex, many methods
class CartService {
  validateCart(userId: string): Promise<Cart> { /* ... */ }
  clearCart(userId: string): Promise<void> { /* ... */ }
}

class PaymentService {
  processPayment(payment: PaymentRequest): Promise<PaymentResult> { /* ... */ }
  refund(transactionId: string): Promise<void> { /* ... */ }
}

class InventoryService {
  reserveItems(items: CartItem[]): Promise<Reservation> { /* ... */ }
  releaseReservation(reservationId: string): Promise<void> { /* ... */ }
}

class NotificationService {
  sendOrderConfirmation(userId: string, orderId: string): Promise<void> { /* ... */ }
}

class ShippingService {
  createShipment(order: Order): Promise<TrackingInfo> { /* ... */ }
}

// Facade: A simple door to a complex world
class OrderFacade {
  constructor(
    private cart: CartService,
    private payment: PaymentService,
    private inventory: InventoryService,
    private notifications: NotificationService,
    private shipping: ShippingService,
  ) {}

  // The controller calls ONLY this — one call, one intent
  async placeOrder(userId: string, paymentInfo: PaymentRequest): Promise<OrderSummary> {
    // ^ Facade orchestrates all steps internally in the correct order
    const cart = await this.cart.validateCart(userId);
    // ^ Step 1: Validate cart — can throw CartValidationError
    const reservation = await this.inventory.reserveItems(cart.items);
    // ^ Step 2: Reserve inventory — before payment! Otherwise you pay for nothing
    const paymentResult = await this.payment.processPayment(paymentInfo);
    // ^ Step 3: Pay — if this fails: reservation.releaseReservation()
    await this.cart.clearCart(userId);
    await this.notifications.sendOrderConfirmation(userId, paymentResult.transactionId);
    const tracking = await this.shipping.createShipment({ userId, cart, paymentResult });
    return { orderId: paymentResult.transactionId, tracking };
    // ^ Simple result — controller doesn't need the details
  }
}
```

> ⚡ **Angular connection:** In your Angular projects, a good Facade Pattern is an
> `OrderFacade` service injected into the component:
>
> ```typescript
> @Injectable({ providedIn: 'root' })
> export class OrderFacade {
>   constructor(
>     private cartStore: CartStore,     // NgRx Store Slice
>     private orderApi: OrderApiService,
>     private router: Router,
>   ) {}
>
>   async checkout(): Promise<void> {
>     const cart = await firstValueFrom(this.cartStore.cart$);
>     const order = await this.orderApi.placeOrder(cart).toPromise();
>     this.cartStore.dispatch(clearCart());
>     this.router.navigate(['/order-confirmation', order.id]);
>   }
> }
>
> // Component is now thin — no business logic:
> @Component({ /* ... */ })
> export class CheckoutComponent {
>   constructor(private facade: OrderFacade) {}
>   onCheckout() { this.facade.checkout(); }
> }
> ```

---

## Proxy Pattern — Type-Safe with TypeScript's Built-in Proxy

JavaScript has had a built-in `Proxy` object since ES2015. TypeScript makes it type-safe
with generics. The Proxy Pattern is ideal for: caching, logging, access control, lazy loading.

```typescript annotated
// Generic Proxy factory — works with ANY object type
function createLoggingProxy<T extends object>(target: T, label: string): T {
  // ^ T extends object: primitive types (string, number) cannot be proxied
  return new Proxy(target, {
    get(obj: T, key: string | symbol): unknown {
      // ^ key is string | symbol (JavaScript property types)
      const value = Reflect.get(obj, key);
      // ^ Reflect.get is safer than obj[key] — handles prototype chain correctly
      if (typeof value === 'function') {
        console.log(`[${label}] Method called: ${String(key)}`);
        // ^ String(key) because key could also be a Symbol
      }
      return value;
    },
    set(obj: T, key: string | symbol, value: unknown): boolean {
      console.log(`[${label}] Property set: ${String(key)} =`, value);
      return Reflect.set(obj, key, value);
      // ^ return true: operation was successful
    },
  });
  // Return type is T — the proxy behaves identically to the original
  // TypeScript knows nothing about the Proxy — to the type system it's a T
}

// Caching proxy for expensive API calls:
function createCachingProxy<T extends object>(
  target: T,
  ttlMs: number = 60_000,
): T {
  const cache = new Map<string, { value: unknown; expiresAt: number }>();

  return new Proxy(target, {
    get(obj: T, key: string | symbol) {
      const fn = Reflect.get(obj, key);
      if (typeof fn !== 'function') return fn;

      return async (...args: unknown[]) => {
        const cacheKey = `${String(key)}:${JSON.stringify(args)}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() < cached.expiresAt) {
          console.log(`[Cache HIT] ${cacheKey}`);
          return cached.value;
        }
        const result = await fn.apply(obj, args);
        cache.set(cacheKey, { value: result, expiresAt: Date.now() + ttlMs });
        return result;
      };
    },
  });
}
```

> ⚡ **Angular HTTP Interceptors = Proxy Pattern:**
> Angular's `HttpInterceptor` is a classic Decorator/Proxy Pattern.
> The interceptor places itself "in front of" the real HTTP call and can transform
> the request, add logging, or inject retry logic:
>
> ```typescript
> @Injectable()
> export class AuthInterceptor implements HttpInterceptor {
>   intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
>     // Like a proxy: modifies the request, then forwards it
>     const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${this.token}` } });
>     return next.handle(authReq);
>   }
> }
> ```

---

## Experiment Box: Type-Safe Logging Proxy

Paste this code into the TypeScript Playground:

```typescript
interface UserService {
  getUser(id: string): Promise<{ name: string; email: string }>;
  updateUser(id: string, data: Partial<{ name: string; email: string }>): Promise<void>;
}

// Simulated implementation:
const realUserService: UserService = {
  async getUser(id) {
    return { name: 'Max Mustermann', email: 'max@example.com' };
  },
  async updateUser(id, data) {
    console.log('Updating user:', id, data);
  },
};

function createLoggingProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, key: string | symbol) {
      const value = Reflect.get(obj, key);
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          console.log(`Calling ${String(key)} with:`, args);
          return (value as Function).apply(obj, args);
        };
      }
      return value;
    },
  });
}

const loggedService = createLoggingProxy(realUserService);
// loggedService has the same type as UserService!
// TypeScript knows: loggedService.getUser exists
loggedService.getUser('123');  // Logs: "Calling getUser with: ['123']"

// Try: loggedService.doesNotExist('test')
// TypeScript immediately reports: Property 'doesNotExist' does not exist on type 'UserService'
// The proxy protects you at compile time — not just at runtime!
```

---

## What you've learned

- **Adapter** bridges incompatible interfaces — TypeScript's structural type system
  makes the adapter safer than in Java
- **Facade** hides complexity behind a simple API — ideal for Angular services
  that orchestrate multiple stores and APIs
- **Proxy** gives you transparent control over object access — TypeScript's `Proxy<T>`
  with generics is type-safe and powerful
- HTTP Interceptors in Angular are a perfect real-world example of the Proxy/Decorator Pattern

**Core concept:** Structural Patterns don't change *what* an object is, but *how*
it appears from the outside or how it's accessed. TypeScript's structural type system
makes many of these patterns more lightweight than in Java or C++.

> 🧠 **Explain it to yourself:** When would you use Adapter, when Facade, and when Proxy?
> What's the guiding principle of each pattern?
> **Key points:** Adapter = bridge incompatible interfaces |
> Facade = hide complexity | Proxy = transparent access control

---

> **Break point** — You now know the three most important Structural Patterns and
> can recognize them in Angular (DI, Interceptors, Facade Services).
>
> Continue with: [Section 03: Behavioral Patterns](./03-behavioral-patterns.md)