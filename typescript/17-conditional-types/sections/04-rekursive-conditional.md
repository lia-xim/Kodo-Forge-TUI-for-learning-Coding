# Sektion 4: Rekursive Conditional Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Distributive Types](./03-distributive-types.md)
> Naechste Sektion: [05 - Praxis-Patterns](./05-praxis-patterns.md)

---

## Was du hier lernst

- Rekursive Typ-Definitionen
- Flatten: Verschachtelte Arrays aufloesen
- DeepAwaited: Verschachtelte Promises aufloesen
- Rekursions-Limits und Workarounds

---

## Grundidee: Typ referenziert sich selbst

Wie eine rekursive Funktion kann ein Typ sich SELBST aufrufen:

```typescript
type Flatten<T> = T extends (infer U)[]
  ? Flatten<U>     // Wenn Array -> rekursiv weiter
  : T;             // Wenn kein Array -> fertig

type A = Flatten<string[]>;          // string
type B = Flatten<string[][]>;        // string
type C = Flatten<string[][][]>;      // string
type D = Flatten<string>;            // string (kein Array)
```

> **Rekursion terminiert** wenn T kein Array mehr ist — dann greift der Else-Branch.

---

## DeepAwaited: Promises komplett entpacken

```typescript
type DeepAwaited<T> = T extends Promise<infer U>
  ? DeepAwaited<U>
  : T;

type A = DeepAwaited<Promise<string>>;                    // string
type B = DeepAwaited<Promise<Promise<number>>>;           // number
type C = DeepAwaited<Promise<Promise<Promise<boolean>>>>; // boolean
```

> TypeScripts eingebauter `Awaited<T>` (TS 4.5) funktioniert aehnlich —
> er kann auch verschachtelte Promises aufloesen.

---

## Rekursive Object-Transformation

```typescript
type DeepPartial<T> = T extends object
  ? T extends Function
    ? T
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface Config {
  db: {
    host: string;
    credentials: { user: string; pass: string };
  };
  port: number;
}

type PartialConfig = DeepPartial<Config>;
// Alle Ebenen sind optional — auch db.credentials.user
```

---

## JSON-Typ rekursiv definieren

```typescript
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Das ist ein rekursiver Typ — JsonValue referenziert sich in Array und Object
```

---

## Rekursive String-Manipulation

```typescript
type TrimLeft<S extends string> = S extends ` ${infer Rest}`
  ? TrimLeft<Rest>
  : S;

type A = TrimLeft<"   hello">;  // "hello"
type B = TrimLeft<"hello">;     // "hello"
```

---

## Rekursions-Limits

TypeScript hat ein eingebautes Rekursions-Limit (~50-100 Ebenen):

```typescript
// Das funktioniert:
type Repeat<S extends string, N extends number, Acc extends string = ""> =
  Acc["length"] extends N ? Acc : Repeat<S, N, `${Acc}${S}`>;

// Bei zu tiefer Rekursion:
// Error: Type instantiation is excessively deep and possibly infinite.
```

> **Pragmatischer Ansatz:** Wenn du mehr als ~20 Ebenen Rekursion brauchst,
> ist das Design vermutlich falsch. In der Praxis reichen 3-5 Ebenen.

---

## Pausenpunkt

**Kernerkenntnisse:**
- Rekursive Typen rufen sich selbst auf bis eine Terminierungsbedingung greift
- Flatten, DeepAwaited, DeepPartial — die wichtigsten rekursiven Patterns
- JSON-Typ ist rekursiv definierbar
- Rekursions-Limit bei ~50-100 Ebenen

> **Weiter:** [Sektion 05 - Praxis-Patterns](./05-praxis-patterns.md)
