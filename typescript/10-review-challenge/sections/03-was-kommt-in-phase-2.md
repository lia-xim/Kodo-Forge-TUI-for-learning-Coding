# 03 -- Was kommt in Phase 2: Type System Core

> Geschaetzte Lesezeit: ~10 Minuten

## Der Sprung von "TypeScript nutzen" zu "TypeScript beherrschen"

Phase 1 hat dir die **Vokabeln** der TypeScript-Sprache beigebracht. Phase 2 bringt dir
die **Grammatik** bei -- wie du diese Vokabeln zu maechtigem, wiederverwendbarem Code
kombinierst.

> **Analogie:** Phase 1 war wie das Lernen einzelner Musiknoten und Akkorde. Phase 2 ist
> wie das Lernen von Harmonielehre und Komposition. Du wirst nicht einfach nur Noten
> spielen -- du wirst Musik schreiben.

---

## Vorschau: Die naechsten 10 Lektionen

### L11: Type Narrowing

Du kennst bereits `typeof` und einfaches Narrowing aus L07. In Phase 2 wirst du ALLE
Narrowing-Techniken meistern:

```typescript
// Du kennst schon:
function process(x: string | number) {
  if (typeof x === "string") { /* x ist string */ }
}

// Du wirst lernen:
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "name" in obj;
}
// Custom Type Guards -- du definierst SELBST, was einen Typ ausmacht!
```

### L12: Discriminated Unions (Deep Dive)

Du hast Discriminated Unions kennengelernt. In Phase 2 wirst du damit **komplexe
Zustandsmaschinen** modellieren -- mit garantierter Vollstaendigkeit:

```typescript
// State Machine fuer einen Bestellprozess
type OrderState =
  | { status: "draft"; items: Item[] }
  | { status: "submitted"; items: Item[]; submittedAt: Date }
  | { status: "paid"; items: Item[]; paidAt: Date; transactionId: string }
  | { status: "shipped"; trackingNumber: string }
  | { status: "delivered"; deliveredAt: Date };
```

### L13-L14: Generics

Das groesste neue Konzept. Generics machen Typen **wiederverwendbar**:

```typescript
// Ohne Generics: Eine Funktion pro Typ
function firstString(arr: string[]): string | undefined { return arr[0]; }
function firstNumber(arr: number[]): number | undefined { return arr[0]; }

// Mit Generics: EINE Funktion fuer ALLE Typen
function first<T>(arr: T[]): T | undefined { return arr[0]; }

const s = first(["a", "b"]);  // string | undefined
const n = first([1, 2, 3]);   // number | undefined
```

**Warum brauchst du Phase 1 dafuer?** Generics bauen direkt auf Interfaces, Unions und
Function Types auf. Ohne dieses Fundament wuerdest du Generics nur mechanisch kopieren,
statt sie zu verstehen.

### L15: Utility Types

TypeScript hat eingebaute Typ-Transformationen:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Omit<User, "password">;          // Ohne password
type UserUpdate = Partial<Omit<User, "id">>;       // Alles optional, ohne id
type UserKeys = keyof User;                        // "id" | "name" | "email" | "password"
type ReadonlyUser = Readonly<User>;                // Alles readonly
```

### L16: Mapped Types

Du wirst lernen, **eigene** Utility Types zu bauen:

```typescript
// So funktioniert Readonly intern:
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Oder: Mache alle Properties optional und nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};
```

### L17: Conditional Types

Typen, die **Entscheidungen** treffen:

```typescript
// Wenn T ein Array ist, extrahiere den Element-Typ
type Unwrap<T> = T extends Array<infer U> ? U : T;

type A = Unwrap<string[]>;  // string
type B = Unwrap<number>;    // number
```

### L18: Template Literal Types

String-Manipulation auf **Typ-Ebene**:

```typescript
type EventName = "click" | "focus" | "blur";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"
```

### L19: Modules & Declarations

Wie TypeScript Module organisiert, `.d.ts`-Dateien funktionieren, und wie du
Types fuer existierende JavaScript-Libraries bereitstellst.

### L20: Review Challenge -- Phase 2

Genau wie diese Lektion -- aber fuer alles aus Phase 2.

---

## Was Phase 1 fuer Phase 2 bedeutet

Jedes Phase-2-Konzept baut auf Phase-1-Wissen auf:

```
Phase 1 Konzept           →  Phase 2 Anwendung
──────────────────────────────────────────────────
Interfaces (L05)          →  Generic Constraints
Union Types (L07)         →  Conditional Types
Literal Types (L09)       →  Template Literal Types
Type Aliases (L08)        →  Mapped Types
Function Overloads (L06)  →  Generic Overloads
as const (L09)            →  const Type Parameters
Structural Typing (L05)   →  Generic Variance
Narrowing (L07)           →  Custom Type Guards
```

**Deshalb ist diese Review Challenge so wichtig.** Wenn du hier sicher bist, wird Phase 2
ein natuerlicher naechster Schritt. Wenn nicht, wird sie ein Kampf.

---

## Dein Weg nach vorne

1. **Jetzt:** Mache die Challenges dieser Lektion
2. **Danach:** Pruefe deine Selbsteinschaetzung aus Sektion 02
3. **Bei Luecken:** Zurueck zu den einzelnen Lektionen
4. **Wenn alles sitzt:** Phase 2 beginnt mit L11 -- Type Narrowing

> **Motivation:** Nach Phase 2 wirst du TypeScript-Code lesen und schreiben koennen, der
> fuer die meisten Entwickler wie schwarze Magie aussieht. Aber du wirst wissen, dass es
> keine Magie ist -- es ist ein logisches System, das auf den Grundlagen aufbaut, die du
> in Phase 1 gelernt hast.
