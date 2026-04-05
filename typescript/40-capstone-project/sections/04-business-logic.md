# Sektion 4: Business Logic — Generics und Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - API Layer](./03-api-layer.md)
> Naechste Sektion: [05 - Abschluss](./05-abschluss.md)

---

## Was du hier lernst

- Wie man ein **generisches Repository** baut das fuer jede Entity wiederverwendbar ist
- **Event-System mit Discriminated Unions** fuer lose Kopplung zwischen Modulen
- Wie man **Generics, Conditional Types und Mapped Types** in der Business Logic kombiniert
- Warum der offensieve Kern **keine Runtime-Checks** braucht

---

## Schicht 3: Business Logic

Im Kern des Systems vertrauen wir dem Typsystem. Die Daten sind
durch die defensive Schale validiert, die Domain-Typen sind durch
Branded Types und Discriminated Unions gesichert. Hier geht es um
**wiederverwendbare Patterns und saubere Abstraktionen**.

---

## Repository<T>: Generisches Datenzugriff-Pattern

```typescript annotated
// ── Generisches Repository (L13, L14, L22) ──────────────────────

// Basis-Constraint: Jede Entity hat eine ID
interface Entity<Id> {
  readonly id: Id;
}

// Das generische Repository:
interface Repository<T extends Entity<unknown>> {
  findById(id: T["id"]): Promise<T | undefined>;
  // ^ T["id"] — der ID-Typ wird aus T extrahiert (Indexed Access)
  findAll(): Promise<readonly T[]>;
  create(entity: Omit<T, "id">): Promise<T>;
  // ^ Omit entfernt "id" — die wird beim Erstellen generiert
  update(id: T["id"], patch: Partial<Omit<T, "id">>): Promise<T | undefined>;
  delete(id: T["id"]): Promise<boolean>;
}

// Konkrete Implementierung fuer User:
interface User extends Entity<UserId> {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
}

// In-Memory-Implementierung (fuer Tests und Demos):
class InMemoryRepository<T extends Entity<unknown>> implements Repository<T> {
  private items = new Map<unknown, T>();

  async findById(id: T["id"]): Promise<T | undefined> {
    return this.items.get(id);
  }

  async findAll(): Promise<readonly T[]> {
    return [...this.items.values()];
  }

  async create(entity: Omit<T, "id">): Promise<T> {
    // ID-Generierung muss vom Aufrufer kommen (via Factory):
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

> 📖 **Hintergrund: Repository-Pattern und Generics**
>
> Das Repository-Pattern stammt von Martin Fowler (Patterns of
> Enterprise Application Architecture, 2002). Es abstrahiert den
> Datenzugriff — ob Datenbank, API oder In-Memory. Generics machen
> es wiederverwendbar: `Repository<User>` und `Repository<Order>`
> teilen die gleiche Implementierung mit verschiedenen Typen. Das
> ist die Essenz von Generics (L13): Code einmal schreiben, mit
> beliebigen Typen verwenden.

> 🧠 **Erklaere dir selbst:** Warum ist `T["id"]` als Parameter-Typ
> besser als `string`? Was passiert wenn User einen `UserId`-Typ
> hat und Order einen `OrderId`-Typ?
> **Kernpunkte:** T["id"] extrahiert den spezifischen ID-Typ |
> Repository<User>.findById erwartet UserId, nicht string |
> Repository<Order>.findById erwartet OrderId |
> Verwechslung ist unmoeglich — der Compiler prueft

---

## Event-System: Lose Kopplung mit Typen

```typescript annotated
// ── Typsicheres Event-System (L17, L26) ─────────────────────────

// Event-Definitionen als Discriminated Union:
type DomainEvent =
  | { type: "order:created"; orderId: OrderId; userId: UserId; timestamp: Date }
  | { type: "order:paid"; orderId: OrderId; paymentId: string; timestamp: Date }
  | { type: "order:shipped"; orderId: OrderId; trackingId: string; timestamp: Date }
  | { type: "order:cancelled"; orderId: OrderId; reason: string; timestamp: Date }
  | { type: "user:registered"; userId: UserId; email: string; timestamp: Date };

// Event-Bus mit generischem Handler:
type EventHandler<E extends DomainEvent["type"]> =
  (event: Extract<DomainEvent, { type: E }>) => Promise<void>;
// ^ Extract filtert die DU auf den spezifischen Event-Typ (L15)

class EventBus {
  private handlers = new Map<string, Array<(event: any) => Promise<void>>>();

  on<E extends DomainEvent["type"]>(
    eventType: E,
    handler: EventHandler<E>
  ): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as any);  // any nur intern — oeffentliche API ist typsicher
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

### Verwendung

```typescript annotated
const bus = new EventBus();

// Handler registrieren — vollstaendig typsicher:
bus.on("order:paid", async (event) => {
  event.orderId;   // OrderId — Autocomplete!
  event.paymentId; // string — Autocomplete!
  // event.reason; // FEHLER: 'reason' existiert nicht auf "order:paid"
  await sendPaymentConfirmation(event.orderId);
});

// Event emittieren — Payload wird geprueft:
bus.emit({
  type: "order:paid",
  orderId: createOrderId(),
  paymentId: "pay_123",
  timestamp: new Date(),
});

// bus.emit({ type: "order:paid", reason: "test" });
// ^ FEHLER: 'reason' existiert nicht, 'paymentId' fehlt
```

> ⚡ **Framework-Bezug:** In Angular mit NgRx ist der EventBus
> der Store: Actions sind Events, Effects sind Handler. Die
> Discriminated Union der Actions entspricht unserem `DomainEvent`.
> In React mit Redux Toolkit: `createSlice` definiert Actions als
> Discriminated Union. Das Event-System-Pattern ist identisch —
> nur die Infrastruktur unterscheidet sich.

---

## Order-Service: Alles zusammen

```typescript annotated
// ── Order-Service — der offensive Kern ──────────────────────────

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

    // Keine Validierung noetig — Typen garantieren Korrektheit:
    // userId ist UserId (nicht string), items ist CartItem[] (nicht any[])
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

    // TypeScript weiss: order.status ist "pending" nach dem Check
    // Also hat order.total (Cents) — Narrowing in Aktion!

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

> 💭 **Denkfrage:** Der OrderService hat KEINE Runtime-Validierung.
> Ist das ein Problem? Was schuetzt ihn vor falschen Daten?
>
> **Antwort:** Der Typ-Vertrag schuetzt ihn. `userId: UserId` kann
> nur durch einen Smart Constructor erzeugt werden (validiert).
> `items: CartItem[]` ist durch die API-Schicht validiert. Innerhalb
> des offensiven Kerns ist der Typ der Beweis. Runtime-Checks waeren
> redundant und wuerden den Code aufblaahen.

---

## Experiment: Notification-Service

Baue einen Notification-Service der auf Events reagiert:

```typescript
// Der Service hoert auf Events und sendet Benachrichtigungen:
class NotificationService {
  constructor(private readonly eventBus: EventBus) {
    // Registriere Handler fuer relevante Events:
    this.eventBus.on("order:paid", async (event) => {
      await this.sendEmail(
        event.orderId,
        `Zahlung ${event.paymentId} erhalten`
      );
    });

    this.eventBus.on("order:shipped", async (event) => {
      await this.sendEmail(
        event.orderId,
        `Versand mit Tracking: ${event.trackingId}`
      );
    });
  }

  private async sendEmail(orderId: OrderId, message: string): Promise<void> {
    console.log(`[Notification] Order ${orderId}: ${message}`);
  }
}

// Experiment: Fuege einen "order:cancelled" Handler hinzu.
// Was passiert wenn du auf event.trackingId zugreifst?
// (Antwort: Compile-Error — cancelled hat kein trackingId!)
```

---

## Was du gelernt hast

- **Repository<T>** abstrahiert Datenzugriff fuer beliebige Entities — Generics in Reinform
- **Event-System** mit Discriminated Unions fuer typsichere lose Kopplung
- Der **offensive Kern** braucht keine Runtime-Checks — Typen sind der Beweis
- **Extract<DomainEvent, { type: E }>** filtert die richtige Event-Variante (L15)
- Alle Konzepte aus 40 Lektionen fliessen in eine kohaerente Business-Logic-Schicht

> 🧠 **Erklaere dir selbst:** Zaehle alle TypeScript-Konzepte in
> dieser Sektion: Generics, Indexed Access Types, Omit, Partial,
> Extract, Discriminated Unions, Branded Types, Result Pattern,
> Exhaustive Narrowing, Readonly. Wie viele einzelne Konzepte
> arbeiten hier zusammen?
> **Kernpunkte:** Mindestens 10 verschiedene Konzepte | Keines
> davon ist neu — alles aus L02-L39 | Die Kunst liegt nicht im
> einzelnen Konzept sondern in der Kombination

**Kernkonzept zum Merken:** Im offensiven Kern ist der Code ueberraschend einfach. Keine null-Checks, keine Validierung, keine unsicheren Casts. Die Komplexitaet steckt in den Typen — und die verschwinden zur Laufzeit.

---

> **Pausenpunkt** — Business Logic steht. Die letzte Sektion bringt
> alles zusammen: Rueckblick und Ausblick.
>
> Weiter geht es mit: [Sektion 05: Abschluss](./05-abschluss.md)
