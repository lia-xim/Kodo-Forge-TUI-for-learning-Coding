# Cheatsheet: Design Patterns Erweitert (L44)

## Creational Patterns

### Factory Method
```typescript
// Union Type + exhaustiver Switch = typsichere Factory
type LoggerType = 'console' | 'silent' | 'remote';

function createLogger(type: LoggerType): Logger {
  switch (type) {
    case 'console': return new ConsoleLogger();
    case 'silent':  return new SilentLogger();
    case 'remote':  return new RemoteLogger();
    // Kein default — TypeScript prueft Exhaustiveness
  }
}
```

### Abstract Factory
```typescript
interface UIFactory {
  createButton(label: string): Button;
  createInput(placeholder: string): Input;
}
// Angular: InjectionToken<UIFactory> — tauscht ganze Familie aus
```

### Singleton — BESSER: Angular DI
```typescript
// Nicht: static instance + getInstance()
// Besser: @Injectable({ providedIn: 'root' })
// In Tests: TestBed.overrideProvider(MyService, { useClass: Mock })
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

### Proxy (typsicher)
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

### Typisierter EventBus (ohne RxJS)
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

### Generisches Interface
```typescript
interface Repository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(filter?: Partial<TEntity>): Promise<TEntity[]>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}
```

### In-Memory-Repository (fuer Tests)
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

## SOLID — Kurzreferenz

| Prinzip | Merkregel | TypeScript-Feature |
|---|---|---|
| **S** Single Responsibility | Ein Grund zur Aenderung | Kleine fokussierte Klassen |
| **O** Open/Closed | Erweiterbar ohne Modifikation | Interface + neue Implementierung |
| **L** Liskov Substitution | Subtypen sind austauschbar | `implements` prueft zur Compile-Zeit |
| **I** Interface Segregation | Viele kleine statt einem grossen | `interface A extends B, C` |
| **D** Dependency Inversion | Haenge von Abstraktionen ab | `InjectionToken<Interface>` |

---

## YAGNI / Rule of Three

| Signal | Aktion |
|---|---|
| Erstes Vorkommen | Direkt schreiben |
| Zweites Vorkommen | Bemerken (Duplikation) |
| Drittes Vorkommen | Abstrahieren |
| Wachsende if/switch-Kaskade | Strategy Pattern erwaegen |
| Drei Klassen mit gleicher Methode | Interface extrahieren |
| Ein Interface, eine Implementierung | Probably YAGNI — weglassen |
| Kein Test-Mock moeglich | DI fehlt — Repository/Interface einbauen |

---

## Pattern-Entscheidungsbaum

```
Problem?
├─ Objekt erzeugen, Typ variabel?
│   ├─ Eine Klasse: Factory Method / Function
│   └─ Eine Familie von Klassen: Abstract Factory
│
├─ Schnittstellen passen nicht zusammen?
│   ├─ Legacy-Code anpassen: Adapter
│   ├─ Subsystem-Komplexitaet verstecken: Facade
│   └─ Zugriff/Logging/Caching transparent hinzufuegen: Proxy
│
├─ Verhalten variiert?
│   ├─ Auswechselbare Algorithmen: Strategy
│   ├─ Ereignisse zwischen Komponenten: Observer / EventBus
│   └─ Aktionen mit Undo: Command
│
├─ Datenzugriff abstrahieren?
│   └─ Repository Pattern (immer, wenn Tests sinnvoll sind)
│
└─ Kein klares Problem?
    └─ YAGNI — direkt schreiben, Rule of Three abwarten
```
