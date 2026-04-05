# Sektion 6: Praxis-Patterns — Union & Intersection in der echten Welt

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Union vs Intersection](./05-union-vs-intersection.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Wie du **State Machines** mit Discriminated Unions modellierst
- Das **Result-Pattern** fuer typsicheres Error Handling
- Wie **API Response Types** in der Praxis aussehen
- **Event Systems** und **Command Patterns** mit Union & Intersection

---

## Pattern 1: State Machines

Einer der staerksten Anwendungsfaelle fuer Discriminated Unions:
**Zustandsmaschinen**. Der Compiler verhindert ungueltige Zustaende:

```typescript annotated
// ─── Zustaende einer Bestellung ─────────────────────
type OrderState =
  | { status: "draft"; items: CartItem[] }
  | { status: "submitted"; items: CartItem[]; submittedAt: Date }
  | { status: "paid"; items: CartItem[]; submittedAt: Date; paidAt: Date; paymentId: string }
  | { status: "shipped"; items: CartItem[]; submittedAt: Date; paidAt: Date; paymentId: string; trackingNumber: string }
  | { status: "delivered"; items: CartItem[]; submittedAt: Date; paidAt: Date; paymentId: string; trackingNumber: string; deliveredAt: Date };

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

// ─── Zustandsuebergaenge: Nur gueltige Transitionen ─
function submitOrder(order: Extract<OrderState, { status: "draft" }>): Extract<OrderState, { status: "submitted" }> {
  return {
    ...order,
    status: "submitted",
    submittedAt: new Date(),
  };
}

function payOrder(
  order: Extract<OrderState, { status: "submitted" }>,
  paymentId: string
): Extract<OrderState, { status: "paid" }> {
  return {
    ...order,
    status: "paid",
    paidAt: new Date(),
    paymentId,
  };
}

// TypeScript VERHINDERT ungueltige Transitionen:
// payOrder(draftOrder, "pay-123");
// Error! "draft" ist nicht "submitted"
```

> 📖 **Hintergrund: Zustandsmaschinen und illegale Zustaende**
>
> Das Prinzip "Make illegal states unrepresentable" stammt von
> Yaron Minsky (Jane Street, OCaml). Die Idee: Wenn dein Typsystem
> ungueltige Zustaende gar nicht ausdruecken kann, brauchst du keine
> Laufzeit-Pruefungen dafuer.
>
> Beispiel: Eine "bezahlte Bestellung ohne Zahlungs-ID" ist mit dem
> obigen Typ **unmoegich** — das `paymentId`-Feld existiert nur im
> `"paid"`-Zustand. Kein `if (order.paymentId)` noetig!

> 🧠 **Erklaere dir selbst:** Warum ist die State-Machine mit
> Discriminated Union sicherer als ein einzelnes Interface mit
> optionalen Properties (`paymentId?: string, trackingNumber?: string`)?
> **Kernpunkte:** Optionale Properties erlauben ungueltige Kombinationen |
> z.B. trackingNumber ohne paymentId | Discriminated Union erzwingt
> gueltige Kombinationen | Compiler garantiert Konsistenz

---

## Pattern 2: Result Type — Error Handling ohne Exceptions

Statt Exceptions zu werfen, modelliere Erfolg und Fehler als **Typ**:

```typescript annotated
// ─── Generischer Result-Typ ────────────────────────
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ─── Hilfsfunktionen ──────────────────────────────
function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ─── Nutzung ──────────────────────────────────────
interface ValidationError {
  field: string;
  message: string;
}

function parseAge(input: string): Result<number, ValidationError> {
  const age = parseInt(input, 10);
  if (Number.isNaN(age)) {
    return err({ field: "age", message: "Keine gueltige Zahl" });
  }
  if (age < 0 || age > 150) {
    return err({ field: "age", message: "Alter muss zwischen 0 und 150 liegen" });
  }
  return ok(age);
}

// ─── Sicherer Umgang mit dem Ergebnis ─────────────
const result = parseAge("25");
if (result.ok) {
  // result.value: number — TypeScript weiss es!
  console.log(`Alter: ${result.value}`);
} else {
  // result.error: ValidationError
  console.log(`Fehler bei ${result.error.field}: ${result.error.message}`);
}
```

> ⚡ **Praxis-Tipp:** Dieses Pattern ist inspiriert von Rust's `Result<T, E>`
> und Haskell's `Either<L, R>`. In Angular/React siehst du es bei:
> - Form-Validierung (Errors als Daten, nicht als Exceptions)
> - API-Aufrufe (Success/Error als Union, nicht try/catch)
> - Zustandsverwaltung (NgRx Actions als Discriminated Unions)

---

## Pattern 3: API Response Types

Kombiniere Discriminated Unions mit Generics fuer **typsichere API-Layer**:

```typescript annotated
// ─── Generischer API-Response ─────────────────────
type ApiResponse<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T; timestamp: Date }
  | { status: "error"; error: string; statusCode: number };

// ─── Typsicheres Rendering ────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
}

function renderUserList(response: ApiResponse<User[]>): string {
  switch (response.status) {
    case "idle":
      return "Noch keine Daten geladen.";
    case "loading":
      return "Laden...";
    case "success":
      // response.data: User[] — NUR hier verfuegbar!
      return response.data
        .map(u => `${u.name} (${u.email})`)
        .join("\n");
    case "error":
      // response.error und response.statusCode — NUR hier verfuegbar!
      return `Fehler ${response.statusCode}: ${response.error}`;
  }
}
```

### Pagination mit Intersection

Erweitere den Response mit Intersection fuer **paginierte Daten**:

```typescript annotated
interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

type PaginatedResponse<T> = Extract<ApiResponse<T[]>, { status: "success" }> & {
  pagination: PaginationMeta;
};
// Hat: status: "success", data: T[], timestamp: Date, pagination: PaginationMeta

function renderPaginated(response: PaginatedResponse<User>): string {
  return `Seite ${response.pagination.page} von ${response.pagination.totalPages}:\n` +
    response.data.map(u => u.name).join(", ");
}
```

---

## Pattern 4: Event System

Union Types fuer **typsichere Events** mit automatischer Payload-Inferenz:

```typescript annotated
// ─── Event-Definitionen ───────────────────────────
type AppEvent =
  | { type: "USER_LOGIN"; payload: { userId: string; timestamp: Date } }
  | { type: "USER_LOGOUT"; payload: { userId: string } }
  | { type: "ITEM_ADDED"; payload: { itemId: string; quantity: number } }
  | { type: "ITEM_REMOVED"; payload: { itemId: string } }
  | { type: "ORDER_PLACED"; payload: { orderId: string; total: number } };

// ─── Typsicherer Event Handler ────────────────────
type EventHandler<T extends AppEvent["type"]> = (
  payload: Extract<AppEvent, { type: T }>["payload"]
) => void;

// Die Handler bekommen automatisch den richtigen Payload-Typ:
const handleLogin: EventHandler<"USER_LOGIN"> = (payload) => {
  // payload: { userId: string; timestamp: Date } — automatisch inferiert!
  console.log(`User ${payload.userId} logged in at ${payload.timestamp}`);
};

const handleItemAdded: EventHandler<"ITEM_ADDED"> = (payload) => {
  // payload: { itemId: string; quantity: number }
  console.log(`${payload.quantity}x ${payload.itemId} added`);
};

// ─── Event Dispatcher ─────────────────────────────
function dispatch(event: AppEvent): void {
  switch (event.type) {
    case "USER_LOGIN":
      console.log(`Login: ${event.payload.userId}`);
      break;
    case "USER_LOGOUT":
      console.log(`Logout: ${event.payload.userId}`);
      break;
    case "ITEM_ADDED":
      console.log(`Item: ${event.payload.itemId} x${event.payload.quantity}`);
      break;
    // ... weitere Handler
  }
}
```

> 💭 **Denkfrage:** Warum ist dieses Event-System typsicherer als
> ein einfaches `{ type: string; payload: any }`?
>
> **Antwort:** Mit `any` koennte jeder Payload zu jedem Event-Typ passen.
> Mit der Discriminated Union **erzwingt** TypeScript, dass `USER_LOGIN`
> immer `userId` und `timestamp` hat. Tippfehler werden sofort erkannt,
> und die IDE bietet Autovervollstaendigung fuer den Payload.

---

## Pattern 5: Command Pattern mit Intersection

Kombiniere ein **Basis-Interface** mit event-spezifischen Daten:

```typescript annotated
// ─── Basis fuer alle Commands ─────────────────────
interface CommandBase {
  id: string;
  timestamp: Date;
  userId: string;
}

// ─── Spezifische Commands per Intersection ────────
type CreateUserCommand = CommandBase & {
  type: "CREATE_USER";
  data: { name: string; email: string };
};

type UpdateUserCommand = CommandBase & {
  type: "UPDATE_USER";
  data: { userId: string; changes: Partial<{ name: string; email: string }> };
};

type DeleteUserCommand = CommandBase & {
  type: "DELETE_USER";
  data: { userId: string; reason: string };
};

// ─── Union aller Commands ─────────────────────────
type UserCommand = CreateUserCommand | UpdateUserCommand | DeleteUserCommand;

function executeCommand(command: UserCommand): void {
  // Jeder Command hat: id, timestamp, userId (von CommandBase)
  console.log(`[${command.timestamp.toISOString()}] User ${command.userId}:`);

  switch (command.type) {
    case "CREATE_USER":
      console.log(`Creating: ${command.data.name}`);
      break;
    case "UPDATE_USER":
      console.log(`Updating: ${command.data.userId}`);
      break;
    case "DELETE_USER":
      console.log(`Deleting: ${command.data.userId} — Reason: ${command.data.reason}`);
      break;
  }
}
```

Hier siehst du Union UND Intersection zusammen:
- **Intersection** (`&`): Jeder Command erbt von `CommandBase`
- **Union** (`|`): Alle Commands zusammen bilden `UserCommand`
- **Discriminated Union**: `type` ist der Diskriminator

---

## Zusammenfassung: Die fuenf Praxis-Patterns

| Pattern | Technik | Anwendung |
|---|---|---|
| State Machine | Discriminated Union | Zustandsbasierte Logik (Orders, Forms, Auth) |
| Result Type | Discriminated Union | Error Handling ohne Exceptions |
| API Response | Discriminated Union + Generic | HTTP-Response-Handling |
| Event System | Discriminated Union + Extract | Typsichere Events/Actions |
| Command Pattern | Intersection + Discriminated Union | CQRS, Message Passing |

---

## Was du gelernt hast

- **State Machines** mit Discriminated Unions machen ungueltige Zustaende undarstellbar
- Das **Result-Pattern** ersetzt Exceptions durch typsichere Rueckgabewerte
- **API-Response-Types** kombinieren Discriminated Unions mit Generics
- **Event-Systeme** nutzen `Extract` fuer automatische Payload-Inferenz
- **Union + Intersection** zusammen ergeben maechtige Patterns (Command Pattern)

**Kernkonzept zum Merken:** Die Kombination aus Union (Varianten) und Intersection (Erweiterung) ist eines der maechtigsten Werkzeuge in TypeScript. Die meisten professionellen TypeScript-Codebasen nutzen diese Patterns intensiv.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> type Result<T, E = string> =
>   | { ok: true;  value: T }
>   | { ok: false; error: E };
>
> function ok<T>(value: T): Result<T, never> {
>   return { ok: true, value };
> }
> function err<E>(error: E): Result<never, E> {
>   return { ok: false, error };
> }
>
> function divide(a: number, b: number): Result<number, string> {
>   // Implementiere hier: Fehler bei b === 0
> }
>
> const r1 = divide(10, 3);
> if (r1.ok) {
>   console.log(r1.value.toFixed(2));  // Was ist der Typ von r1.value?
> } else {
>   console.log(r1.error);             // Was ist der Typ von r1.error?
> }
> ```
> Implementiere `divide` so, dass sie bei `b === 0` `err("Division durch Null")`
> zurueckgibt. Beachte: TypeScript weiss im `if (r1.ok)`-Zweig genau,
> welche Properties verfuegbar sind!

---

## Die 10 wichtigsten Erkenntnisse dieser Lektion

<details>
<summary>Zusammenfassung aufklappen (erst NACH allen 6 Sektionen lesen)</summary>

1. **Union Types (`|`)** = "Entweder A oder B" — die Werte-Menge wird groesser
2. **Intersection Types (`&`)** = "Sowohl A als auch B" — die Werte-Menge wird kleiner
3. **Narrowing** verengt Union Types: typeof, instanceof, in, truthiness, assignment
4. **TS 5.5 Inferred Type Predicates**: `.filter(x => x !== null)` gibt automatisch den richtigen Typ
5. **Discriminated Unions** mit Tag-Property + Exhaustive Check = Compiler-garantierte Vollstaendigkeit
6. **assertNever** gibt sowohl Compile-Zeit als auch Laufzeit-Schutz
7. **Konflikte** bei `&` fuehren zu `never` (still!), bei `extends` zu Compile-Fehlern
8. **Literal Unions** sind meist besser als Enums (kein Laufzeit-Code, zusammensetzbar)
9. **Verteilungsgesetz**: `(A | B) & C = (A & C) | (B & C)`
10. **Union + Intersection zusammen** ermoeglichen Patterns wie State Machines, Result Types und Event Systems

</details>

---

> **Ende der Lektion 07** -- Du hast Union und Intersection Types
> gemeistert! Arbeite jetzt die Examples, Exercises und das Quiz durch.
>
> **Naechste Lektion:** 08 - Type Aliases und Mapped Types
