# Cheatsheet: Advanced Design Patterns (L44)

## Creational Patterns

### Factory Method
```typescript
// Union Type + exhaustive Switch = type-safe Factory
type LoggerType = 'console' | 'silent' | 'remote';

function createLogger(type: LoggerType): Logger {
  switch (type) {
    case 'console': return new ConsoleLogger();
    case 'silent':  return new SilentLogger();
    case 'remote':  return new RemoteLogger();
    // No default — TypeScript checks exhaustiveness
  }
}
```

### Abstract Factory
```typescript
interface UIFactory {
  createButton(label: string): Button;
  createInput(placeholder: string): Input;
}
// Angular: InjectionToken<UIFactory> — swaps out entire family
```

### Singleton — BETTER: Angular DI
```typescript
// Not: static instance + getInstance()
// Better: @Injectable({ providedIn: 'root' })
// In tests: TestBed.overrideProvider(MyService, { useClass: Mock })
```

---

## Structural Patterns

### Adapter
```typescript
class LegacyPaymentAdapter implements PaymentService {
  constructor(private legacy: LegacyGateway) {}
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    const r = this.legacy.chargeCard(req.amount, req.cardToken);
    return { success: r.success, transactionId: r.transactionId, timestamp: new Date() };
  }
}
```

### Facade
```typescript
class OrderFacade {
  async placeOrder(userId: string, payment: PaymentRequest): Promise<OrderSummary> {
    const cart = await this.cart.validateCart(userId);
    const reservation = await this.inventory.reserveItems(cart.items);
    const result = await this.payment.processPayment(payment);
    await this.notifications.sendConfirmation(userId, result.transactionId);
    return { orderId: result.transactionId };
  }
}
```

### Proxy (type-safe)
```typescript
function createLoggingProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, key: string | symbol) {
      const value = Reflect.get(obj, key);
      if (typeof value === 'function') console.log(`Calling ${String(key)}`);
      return value;
    },
  });
}
```

---

## Behavioral Patterns

### Strategy
```typescript
interface ValidationStrategy<T> {
  validate(value: T): ValidationResult;
}

class Validator<T> {
  private strategies: ValidationStrategy<T>[] = [];
  addStrategy(s: ValidationStrategy<T>): this { this.strategies.push(s); return this; }
  isValid(value: T): boolean { return this.strategies.every(s => s.validate(value).valid); }
}
```

### Typed EventBus (without RxJS)
```typescript
type EventMap = {
  'user:login': { userId: string; timestamp: Date };
};

class TypedEventBus<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<(d: unknown) => void>>();

  on<K extends keyof Events>(event: K, fn: (d: Events[K]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn as (d: unknown) => void);
    return () => this.listeners.get(event)?.delete(fn as (d: unknown) => void);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}
```

### Command + Undo
```typescript
interface Command { execute(): void; undo(): void; description: string; }

class CommandHistory {
  private history: Command[] = [];
  execute(cmd: Command): void { cmd.execute(); this.history.push(cmd); }
  undo(): void { this.history.pop()?.undo(); }
  canUndo(): boolean { return this.history.length > 0; }
}
```

---

## Repository Pattern

### Generic Interface
```typescript
interface Repository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(filter?: Partial<TEntity>): Promise<TEntity[]>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}
```

### In-Memory Repository (for tests)
```typescript
class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  private data = new Map<string, T>();
  async findById(id: string): Promise<T | null> { return this.data.get(id) ?? null; }
  async save(entity: T): Promise<T> {
    const saved = { ...entity, id: entity.id || crypto.randomUUID() };
    this.data.set(saved.id, saved);
    return saved;
  }
  async findAll(filter?: Partial<T>): Promise<T[]> {
    const all = [...this.data.values()];
    return filter ? all.filter(e => Object.entries(filter).every(([k, v]) => e[k as keyof T] === v)) : all;
  }
  async delete(id: string): Promise<void> { this.data.delete(id); }
}
```

---

## SOLID — Quick Reference

| Principle | Mnemonic | TypeScript Feature |
|---|---|---|
| **S** Single Responsibility | One reason to change | Small, focused classes |
| **O** Open/Closed | Extendable without modification | Interface + new implementation |
| **L** Liskov Substitution | Subtypes are interchangeable | `implements` checks at compile time |
| **I** Interface Segregation | Many small over one large | `interface A extends B, C` |
| **D** Dependency Inversion | Depend on abstractions | `InjectionToken<Interface>` |

---

## YAGNI / Rule of Three

| Signal | Action |
|---|---|
| First occurrence | Write it directly |
| Second occurrence | Notice it (duplication) |
| Third occurrence | Abstract it |
| Growing if/switch cascade | Consider Strategy Pattern |
| Three classes with the same method | Extract an interface |
| One interface, one implementation | Probably YAGNI — leave it out |
| No test mock possible | DI missing — add Repository/Interface |

---

## Pattern Decision Tree

```
Problem?
├─ Creating an object, type varies?
│   ├─ One class: Factory Method / Function
│   └─ A family of classes: Abstract Factory
│
├─ Interfaces don't fit together?
│   ├─ Adapting legacy code: Adapter
│   ├─ Hiding subsystem complexity: Facade
│   └─ Transparently adding access/logging/caching: Proxy
│
├─ Behavior varies?
│   ├─ Swappable algorithms: Strategy
│   ├─ Events between components: Observer / EventBus
│   └─ Actions with undo: Command
│
├─ Abstract data access?
│   └─ Repository Pattern (always, when tests make sense)
│
└─ No clear problem?
    └─ YAGNI — write it directly, wait for Rule of Three
```