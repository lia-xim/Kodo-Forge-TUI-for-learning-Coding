# Sektion 4: Bedingte Mapped Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Eigene Utility Types](./03-eigene-utility-types.md)
> Naechste Sektion: [05 - Praxis-Patterns](./05-praxis-patterns.md)

---

## Was du hier lernst

- Conditional Types innerhalb von Mapped Types
- Selektive Transformation: Nur bestimmte Properties aendern
- Property-Typ-abhaengige Transformationen
- Verschachtelte Conditional + Mapped Patterns

---

## Conditional innerhalb Mapped Types

Du kannst in der Wert-Position eines Mapped Types einen Conditional Type verwenden:

```typescript
type StringifyProps<T> = {
  [K in keyof T]: T[K] extends number ? string : T[K];
};

interface Stats {
  name: string;
  score: number;
  active: boolean;
  points: number;
}

type StringifiedStats = StringifyProps<Stats>;
// {
//   name: string;     // war string -> bleibt string
//   score: string;    // war number -> wird string
//   active: boolean;  // war boolean -> bleibt boolean
//   points: string;   // war number -> wird string
// }
```

> **Denke daran als:** "Fuer jede Property: WENN der Typ number ist,
> mache string daraus, SONST lass ihn wie er ist."

---

## Selektive Readonly — Nur bestimmte Typen einfrieren

```typescript
// Nur Objekt-Properties readonly machen, Primitive bleiben editierbar
type ReadonlyObjects<T> = {
  [K in keyof T]: T[K] extends object
    ? Readonly<T[K]>
    : T[K];
};

interface AppState {
  count: number;               // Primitive -> bleibt editierbar
  user: { name: string };      // Objekt -> wird readonly
  tags: string[];              // Array (object) -> wird readonly
}

type SafeState = ReadonlyObjects<AppState>;
// {
//   count: number;
//   user: Readonly<{ name: string }>;
//   tags: readonly string[];
// }
```

---

## Property-Typ-basierte Validierung

```typescript
// Generiere Validierungsfunktionen passend zum Property-Typ
type Validators<T> = {
  [K in keyof T]: T[K] extends string
    ? (value: string) => boolean
    : T[K] extends number
    ? (value: number) => boolean
    : T[K] extends boolean
    ? (value: boolean) => boolean
    : (value: unknown) => boolean;
};

interface UserForm {
  name: string;
  age: number;
  active: boolean;
}

type UserValidators = Validators<UserForm>;
// {
//   name: (value: string) => boolean;
//   age: (value: number) => boolean;
//   active: (value: boolean) => boolean;
// }
```

---

## Verschachtelung: Conditional im Key UND im Wert

Du kannst Conditionals sowohl fuer Key-Filterung als auch fuer
Wert-Transformation kombinieren:

```typescript
// Nur string-Properties behalten UND in Uppercase umwandeln
type UppercaseStringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: Uppercase<T[K] & string>;
};

interface Mixed {
  name: string;     // bleibt, wird Uppercase
  count: number;    // wird entfernt
  label: string;    // bleibt, wird Uppercase
}

type Result = UppercaseStringProps<Mixed>;
// { name: Uppercase<string>; label: Uppercase<string>; }
```

---

## Praxismuster: Nullable nur fuer optionale Properties

```typescript
type NullableOptionals<T> = {
  [K in keyof T]: undefined extends T[K]
    ? T[K] | null      // Optionale -> auch null erlauben
    : T[K];            // Pflicht -> unveraendert
};

interface User {
  id: number;
  name: string;
  bio?: string;
  website?: string;
}

type NullableUser = NullableOptionals<User>;
// {
//   id: number;                        // Pflicht -> unveraendert
//   name: string;                      // Pflicht -> unveraendert
//   bio?: string | null;               // Optional -> null hinzugefuegt
//   website?: string | null;           // Optional -> null hinzugefuegt
// }
```

> **Trick:** `undefined extends T[K]` prueft ob K optional ist — denn
> optionale Properties haben implizit `| undefined` im Typ.

---

## Pausenpunkt

Du kannst jetzt Conditional Types innerhalb von Mapped Types einsetzen
fuer selektive, typsichere Transformationen.

**Kernerkenntnisse:**
- Conditional im Wert: `T[K] extends X ? Y : Z` — typsichere Wert-Transformation
- Conditional im Key: `as T[K] extends X ? K : never` — typsichere Key-Filterung
- Beide kombinierbar fuer maximale Praezision
- `undefined extends T[K]` — Check ob Property optional ist

> **Weiter:** [Sektion 05 - Praxis-Patterns](./05-praxis-patterns.md)
