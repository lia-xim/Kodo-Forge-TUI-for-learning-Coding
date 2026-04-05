# Cheatsheet: Advanced Patterns

Schnellreferenz fuer Lektion 26.

---

## Builder Pattern (typsicher)

```typescript
// Generic akkumuliert gesetzte Felder:
class TypedBuilder<Set extends string = never> {
  host(h: string): TypedBuilder<Set | "host"> { /* ... */ return this as any; }
  port(p: number): TypedBuilder<Set | "port"> { /* ... */ return this as any; }

  // build() nur wenn alle Pflichtfelder gesetzt:
  build(this: TypedBuilder<"host" | "port">): Config {
    return this.config as Config;
  }
}

new TypedBuilder().host("x").port(80).build(); // OK
new TypedBuilder().host("x").build();          // COMPILE-ERROR
```

---

## State Machine Pattern

```typescript
// Discriminated Union fuer Zustaende:
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// Transition Map fuer erlaubte Uebergaenge:
type Transitions = {
  idle:    "loading";
  loading: "success" | "error";
  success: "idle";
  error:   "loading" | "idle";
};

function transition<C extends keyof Transitions>(
  current: C, next: Transitions[C]
): void {}
```

---

## Phantom Types

```typescript
// Phantom-Typ-Wrapper:
type Phantom<Base, Tag> = Base & { readonly __phantom: Tag };

// Semantisch verschiedene Typen:
type Email   = Phantom<string, "Email">;
type Subject = Phantom<string, "Subject">;

function sendEmail(to: Email, subject: Subject): void {}
// sendEmail(subject, email) → COMPILE-ERROR
```

---

## Fluent API (typsicher mit Step-Interfaces)

```typescript
interface SelectStep { select(cols: string): FromStep; }
interface FromStep   { from(table: string): WhereOrBuildStep; }
interface WhereOrBuildStep {
  where(cond: string): BuildStep;
  build(): string;
}
interface BuildStep  { build(): string; }

// createQuery().select("*").from("users").build(); // OK
// createQuery().from("users");  // COMPILE-ERROR: from() nicht auf SelectStep
```

---

## Newtype Pattern

```typescript
// Mit unique symbol fuer einzigartige Brands:
declare const UserIdBrand: unique symbol;
type UserId = string & { readonly [UserIdBrand]: typeof UserIdBrand };

// Smart Constructor (validiert + castet):
function UserId(raw: string): UserId {
  if (!raw.startsWith("user-")) throw new Error("Invalid");
  return raw as UserId;
}

// Eigene Operationen:
declare const CentsBrand: unique symbol;
type Cents = number & { readonly [CentsBrand]: typeof CentsBrand };

function addCents(a: Cents, b: Cents): Cents {
  return ((a as number) + (b as number)) as Cents;
}
```

---

## Opaque Types

```typescript
// user-id.ts — Nur dieses Modul kann UserId erstellen
declare const brand: unique symbol;
export type UserId = string & { readonly [brand]: "UserId" };
export function createUserId(raw: string): UserId { /* validate */ return raw as UserId; }
// Andere Module: koennen UserId verwenden aber nicht erstellen (Konvention)
```

---

## Entscheidungsbaum

```
Verwechslung verhindern?
├── Einfache IDs → Branded Type
└── Werte mit Operationen → Newtype

Zustaende modellieren?
├── Mit Daten pro Zustand → Discriminated Union
└── Unsichtbar (Draft/Published) → Phantom Type

Schrittweiser Aufbau?
├── Pflichtfelder pruefen → Builder
└── Reihenfolge erzwingen → Fluent API mit Steps

Pragmatische Regel:
→ Branded Types + Discriminated Unions decken 90% ab
```

---

## Wann welches Pattern?

| Situation | Empfehlung |
|---|---|
| Entity-IDs (UserId, OrderId) | Branded Type |
| Waehrungsbetraege, Einheiten | Newtype |
| Loading/Error/Success State | Discriminated Union |
| Artikel-Lifecycle (Draft→Published) | Phantom Type |
| SQL/Query Builder | Fluent API |
| Config mit Pflicht+Optional | Builder |
| 3 Felder, alle Pflicht | Einfaches Interface! |

---

## Haeufige Fehler

| Fehler | Problem | Loesung |
|---|---|---|
| Boolean-Flags fuer State | 2^n unmoegliche Zustaende | Discriminated Union |
| `as BrandedType` ueberall | Umgeht Validierung | Smart Constructor |
| Builder fuer 3 Felder | Over-Engineering | Einfaches Interface |
| Alle Patterns kombinieren | Unlesbarer Code | Pragmatisch waehlen |
| `return this` statt Steps | Keine Reihenfolge-Pruefung | Step-Interfaces |
