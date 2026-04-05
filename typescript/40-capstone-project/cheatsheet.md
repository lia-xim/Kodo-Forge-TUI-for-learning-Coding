# Cheatsheet: Capstone Project — Alles zusammen

Schnellreferenz fuer Lektion 40 und den gesamten Kurs.

---

## Architektur-Prinzipien

```
1. Defensive Schale, offensiver Kern
   → Grenzen validieren, Kern vertrauen

2. Make Impossible States Impossible
   → Discriminated Unions statt Boolean-Flags

3. Parse, Don't Validate
   → Smart Constructors geben den staerkeren Typ zurueck
```

---

## Domain Model

```typescript
// Branded IDs:
declare const UserIdBrand: unique symbol;
type UserId = string & { readonly [UserIdBrand]: typeof UserIdBrand };
function createUserId(raw: string): UserId { /* validate */ return raw as UserId; }

// Money (Cents):
declare const CentsBrand: unique symbol;
type Cents = number & { readonly [CentsBrand]: typeof CentsBrand };
function cents(n: number): Cents { return n as Cents; }
function addMoney(a: Cents, b: Cents): Cents { return ((a as number) + (b as number)) as Cents; }

// Order Status (Discriminated Union + Transition Map):
type Order =
  | { status: "draft"; id: OrderId; items: CartItem[] }
  | { status: "pending"; id: OrderId; items: CartItem[]; total: Cents }
  | { status: "paid"; id: OrderId; items: CartItem[]; total: Cents; paymentId: string }
  | { status: "shipped"; id: OrderId; items: CartItem[]; total: Cents; paymentId: string; trackingId: string }
  | { status: "cancelled"; id: OrderId; reason: string };

type OrderTransitions = {
  draft: "pending" | "cancelled";
  pending: "paid" | "cancelled";
  paid: "shipped";
  shipped: never;
  cancelled: never;
};
```

---

## API Layer

```typescript
// Route-Definition als Single Source of Truth:
interface ApiRoute<Method, Path, Req, Res, Err> {
  method: Method; path: Path;
  _request: Req; _response: Res; _error: Err;
}

// Route-Parameter extrahieren (Type-Level Programming):
type ExtractRouteParams<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : P extends `${string}:${infer Param}`
      ? { [K in Param]: string } : {};

// Validierung an der Systemgrenze:
function isCreateOrderInput(data: unknown): data is CreateOrderInput { /* ... */ }
```

---

## Business Logic

```typescript
// Generisches Repository:
interface Repository<T extends Entity<unknown>> {
  findById(id: T["id"]): Promise<T | undefined>;
  findAll(): Promise<readonly T[]>;
  create(entity: Omit<T, "id">): Promise<T>;
  update(id: T["id"], patch: Partial<Omit<T, "id">>): Promise<T | undefined>;
  delete(id: T["id"]): Promise<boolean>;
}

// Event System:
type EventHandler<E extends DomainEvent["type"]> =
  (event: Extract<DomainEvent, { type: E }>) => Promise<void>;

// Result Pattern:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

---

## Konzept-Referenz: 40 Lektionen

| # | Lektion | Kern-Takeaway |
|---|---------|--------------|
| 02 | Primitives | Type Erasure — Typen verschwinden zur Laufzeit |
| 07 | Unions | Typen kombinieren mit \| und & |
| 11 | Narrowing | typeof, instanceof, in — Typen eingrenzen |
| 12 | Discriminated Unions | Unmoegliche Zustaende eliminieren |
| 13 | Generics | Wiederverwendbare typsichere APIs |
| 15 | Utility Types | Partial, Pick, Omit, Extract, Exclude |
| 16 | Mapped Types | Eigene Typ-Transformationen |
| 17 | Conditional Types | Typen dynamisch berechnen |
| 22 | Advanced Generics | Varianz, in/out Modifier |
| 24 | Branded Types | Verwechslung verhindern, Smart Constructors |
| 25 | Error Handling | Result<T,E>, Fehler als Typen |
| 26 | Advanced Patterns | Builder, State Machine, Phantom Types |
| 37 | Type-Level Prog. | Router-Typen, Query Builder |
| 39 | Best Practices | any-Audit, Defensive Schale |

---

## Die goldene Regel

> **Schreibe den einfachsten Typ der den Job erledigt.**
> Komplex nur wenn es echte Bugs verhindert.
> Der Compiler ist dein Partner, nicht dein Feind.
