# Sektion 2: Domain Modeling — Branded Types und Discriminated Unions

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Projekt-Ueberblick](./01-projekt-ueberblick.md)
> Naechste Sektion: [03 - API Layer](./03-api-layer.md)

---

## Was du hier lernst

- Wie man ein **Domain Model** mit Branded Types und Discriminated Unions baut
- **Smart Constructors** fuer typsichere Entity-Erstellung
- Den **Money-Typ**: Warum Cents statt Euro und wie man arithmetische Operationen typsicher macht
- **Order-Status als State Machine** mit Discriminated Union

---

## Schicht 1: Das Domain Model

Das Domain Model ist das Fundament. Es definiert die Sprache
deines Systems — die Typen die ueberall verwendet werden.

```typescript annotated
// ── Branded ID-Typen (L24) ──────────────────────────────────────
// Jede Entity bekommt ihren eigenen ID-Typ:

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
// ^ Die Smart Constructors sind die EINZIGE Stelle die Brands vergeben
// ^ Alle anderen Module muessen sie verwenden
```

> 📖 **Hintergrund: Domain-Driven Design und TypeScript**
>
> Eric Evans praegte 2003 den Begriff "Domain-Driven Design" (DDD).
> Ein Kernprinzip: Die Software-Struktur soll die Geschaeftsdomaene
> widerspiegeln. In TypeScript setzen wir das mit Typen um: Ein
> `UserId` ist nicht einfach ein `string` — es ist ein Konzept aus
> der Geschaeftsdomaene. Branded Types machen Domain-Konzepte zu
> First-Class-Citizens im Typsystem. Das verhindert nicht nur
> Verwechslungen sondern macht den Code zum ausfuehrbaren
> Glossar der Geschaeftssprache.
>
> 💡 **Analogie:** Branded Types sind wie Etiketten auf
> Medikamentenflaschen. Ohne Etikett sehen alle weissen Pillen
> gleich aus (`string`). Mit Etikett (`UserId`, `ProductId`)
> weisst du sofort welche gemeint ist. Ein Vertauschen wird
> zur Compilezeit erkannt — nicht erst wenn der Patient
> das falsche Medikament nimmt.

---

## Der Money-Typ: Cents statt Euro

```typescript annotated
// ── Money-Typ (L24 Branded + Newtype-Pattern) ──────────────────
declare const CentsBrand: unique symbol;
type Cents = number & { readonly [CentsBrand]: typeof CentsBrand };

// Smart Constructor:
function cents(amount: number): Cents {
  if (!Number.isInteger(amount)) throw new Error("Cents must be integer");
  if (amount < 0) throw new Error("Cents must be non-negative");
  return amount as Cents;
}

// Arithmetik fuer Money — der Brand geht nicht bei + verloren:
function addMoney(a: Cents, b: Cents): Cents {
  return ((a as number) + (b as number)) as Cents;
}

function multiplyMoney(amount: Cents, factor: number): Cents {
  return Math.round((amount as number) * factor) as Cents;
}

// Konvertierung fuer Display:
function formatEuro(amount: Cents): string {
  return `${((amount as number) / 100).toFixed(2)} EUR`;
}
// ^ cents(1999) → "19.99 EUR"
```

### Warum Cents statt Euro?

```typescript annotated
// SCHLECHT: Floating-Point-Fehler
const price = 19.99;
const tax = price * 0.19;
console.log(tax);  // 3.7981000000000003 — NICHT 3.80!

// GUT: Integer-Arithmetik mit Cents
const priceInCents = cents(1999);
const taxInCents = multiplyMoney(priceInCents, 0.19);
// ^ Math.round(1999 * 0.19) = 380 → cents(380) → "3.80 EUR"
```

> 💡 **Analogie:** Der Money-Typ ist wie ein Tresor fuer Bargeld.
> Du wuerdest Banknoten nie einfach auf den Tisch legen — du
> sperrst sie in einen Tresor mit definierten Zugaengen. Cents
> sperrt Geldwerte in einen Typ mit definierten Operationen.
> Niemand kann versehentlich "19.99 + 0.19" rechnen und sich
> wundern dass 20.17999999999999999999 herauskommt.

> ⚡ **Framework-Bezug:** In Angular Enterprise-Anwendungen wird
> der Money-Typ typischerweise in einem shared/ Verzeichnis als
> Barrel Export bereitgestellt. Jede Feature-Module importiert
> `Cents` von `@app/shared/money`. In React/Next.js Full-Stack
> Projekten wird derselbe Typ sowohl auf Server (API Routes) als
> auch Client (Components) verwendet — das ist der Vorteil von
> framework-agnostischen Typen. Stripe's eigene TypeScript-Binding
> verwenden das gleiche Prinzip: Alle Betaege sind in Cents/Smallest
> Currency Unit spezifiziert.

> 🧠 **Erklaere dir selbst:** Warum ist `addMoney` noetig statt
> einfach `a + b` zu schreiben? Was passiert mit dem Brand bei
> normaler Addition?
> **Kernpunkte:** `a + b` ergibt `number`, nicht `Cents` | Der
> Brand geht verloren weil `+` nur mit `number` arbeitet |
> `addMoney` castet das Ergebnis zurueck zu Cents | Das ist der
> Preis von Branded Types: Eigene Operationen noetig

---

## Order-Status als State Machine

```typescript annotated
// ── Order-Status als Discriminated Union (L12, L26) ─────────────

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

// Erlaubte Zustandsuebergaenge (L26 Transition Map):
type OrderTransitions = {
  draft: "pending" | "cancelled";
  pending: "paid" | "cancelled";
  paid: "shipped";
  shipped: never;  // Endzustand
  cancelled: never;  // Endzustand
};

// Typsichere Transition-Funktion:
function transitionOrder<S extends Order["status"]>(
  order: Extract<Order, { status: S }>,
  to: OrderTransitions[S]
): Order {
  // Implementation basierend auf 'to'...
  switch (to) {
    case "pending":
      return { ...order, status: "pending", total: calculateTotal(order.items) } as Order;
    // ... weitere Cases
    default:
      return order;
  }
}
```

> ⚡ **Framework-Bezug:** In Angular-Projekten wuerde der
> Order-Status im NgRx Store liegen. Die Discriminated Union
> erzwingt dass Actions nur gueltige Uebergaenge ausloeisen:
> `dispatch(payOrder())` ist nur moeglich wenn der Status "pending"
> ist. In React mit useReducer wuerde der Reducer per Exhaustive
> Check garantieren dass alle Status-Uebergaenge behandelt sind.

> 💭 **Denkfrage:** Warum sind alle Properties `readonly`? Was
> wuerde passieren wenn `items` mutable waere?
>
> **Antwort:** Immutability verhindert Seiteneffekte. Wenn `items`
> mutable waere, koennte jemand `order.items.push(...)` aufrufen
> ohne dass der `total` aktualisiert wird. Mit `readonly` ist
> die einzige Moeglichkeit Aenderungen vorzunehmen eine neue
> Order mit den aktualisierten Werten zu erstellen — und dabei
> MUSS der neue `total` berechnet werden.
>
> 💡 **Analogie:** `readonly` ist wie ein Museumsexponat hinter
> Glas. Du kannst es anschauen und beschreiben aber nicht
> anfassen. Wenn du es aendern willst musst du es fotografieren
> (kopieren), das Foto bearbeiten und als neues Exponat
> praesentieren. So bleibt die Historie erhalten und niemand
> kann heimlich etwas veraendern.

---

## Hilfs-Funktionen fuer das Domain Model

```typescript annotated
// Berechne den Gesamtpreis eines Warenkorbs:
function calculateTotal(items: readonly CartItem[]): Cents {
  return items.reduce(
    (sum, item) => addMoney(sum, multiplyMoney(item.price, item.quantity)),
    cents(0)
  );
}

// Exhaustive Handler fuer Order-Status:
function getOrderDisplayText(order: Order): string {
  switch (order.status) {
    case "draft":     return `Entwurf (${order.items.length} Artikel)`;
    case "pending":   return `Wartend (${formatEuro(order.total)})`;
    case "paid":      return `Bezahlt (Payment: ${order.paymentId})`;
    case "shipped":   return `Versendet (Tracking: ${order.trackingId})`;
    case "cancelled": return `Storniert (${order.reason})`;
    default: {
      const _: never = order;
      // ^ Compile-Error wenn ein Status fehlt!
      return _;
    }
  }
}
```

---

## Experiment: Erweitere das Domain Model

```typescript
// Aufgabe 1: Fuege einen "refunded" Status hinzu.
// Was aendert sich in der Transition Map?
// Welche neuen Felder braucht der Status?

// Aufgabe 2: Erstelle einen Email-Branded-Type mit Smart Constructor:
// type Email = string & { readonly [EmailBrand]: typeof EmailBrand };
// function parseEmail(raw: string): Result<Email, "invalid-email">

// Aufgabe 3: Erstelle einen Quantity-Typ (positive Ganzzahl):
// Warum ist number allein nicht sicher fuer Mengenangaben?
// Was passiert bei quantity = -3 oder quantity = 2.5?

// Experiment: Versuche eine Order mit status "draft" direkt auf
// "shipped" zu setzen. Was sagt der Compiler?
```

---

## Was du gelernt hast

- **Branded IDs** verhindern die Verwechslung von UserId, ProductId und OrderId
- Der **Money-Typ** (Cents) vermeidet Floating-Point-Fehler bei Geldbetraegen
- **Order-Status als Discriminated Union** macht unmoegliche Zustaende undarstellbar
- **Transition Maps** erzwingen gueltige Zustandsuebergaenge zur Compilezeit
- Alle Properties sind **readonly** fuer Immutability

> 🧠 **Erklaere dir selbst:** Welche Lektionen stecken in diesem
> Domain Model? Zaehle die Konzepte: Branded Types (L24),
> Discriminated Unions (L12), Smart Constructors (L24), Readonly
> (L04), Exhaustive Checks (L12), never (L02). Wie viele findest du?
> **Kernpunkte:** Mindestens 6 Konzepte aus verschiedenen Lektionen |
> Das ist die Synthese — einzelne Bausteine zu einem Ganzen

**Kernkonzept zum Merken:** Ein gutes Domain Model ist wie ein Vertrag: Es definiert was moeglich ist und was nicht. TypeScript macht diesen Vertrag zur Compilezeit ueberpruefbar — nicht erst zur Laufzeit.

> 💭 **Denkfrage:** Wenn du dein aktuelles Projekt durchgehst —
> welche drei Domain-Konzepte wuerdest du sofort als Branded Types
> umwandeln? Welche wuerden am meisten von Discriminated Unions
> profitieren?
> **Kernpunkte:** IDs sind die einfachsten Kandidaten (UserId,
> OrderId, ProductId) | Status-Felder mit Boolean-Flags sind
> die besten DU-Kandidaten | Geldwerte sollten immer als Cents
> modelliert werden

---

> **Pausenpunkt** — Das Domain Model steht. Naechste Schicht: Die
> API mit typsicheren Routes und Validierung.
>
> Weiter geht es mit: [Sektion 03: API Layer](./03-api-layer.md)
