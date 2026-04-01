# Sektion 3: Deep-Operationen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Baumstrukturen typen](./02-baumstrukturen-typen.md)
> Naechste Sektion: [04 - Rekursive Conditional Types](./04-rekursive-conditional-types.md)

---

## Was du hier lernst

- Wie du **DeepPartial\<T\>** baust — das vielleicht nuetzlichste rekursive Utility
- Warum TypeScript bewusst **kein eingebautes DeepPartial** hat
- Wie **DeepReadonly\<T\>**, **DeepRequired\<T\>** und **DeepMutable\<T\>** funktionieren
- Warum **Arrays in Deep-Operationen** besondere Behandlung brauchen

---

## Warum gibt es kein eingebautes DeepPartial?

Du kennst `Partial<T>` aus Lektion 15 — es macht alle Properties
eines Typs optional. Aber `Partial` ist **flach**: Es wirkt nur
auf der ersten Ebene.

```typescript
type User = {
  name: string;
  address: {
    street: string;
    city: string;
    country: {
      name: string;
      code: string;
    };
  };
};

type PartialUser = Partial<User>;
// Ergebnis:
// {
//   name?: string;
//   address?: {         ← Optional!
//     street: string;   ← NICHT optional! Partial wirkt nur flach.
//     city: string;     ← NICHT optional!
//     country: { ... }; ← NICHT optional!
//   };
// }
```

> **Hintergrund: Warum TypeScript kein DeepPartial eingebaut hat**
>
> Das TypeScript-Team hat diese Designentscheidung bewusst getroffen.
> Anders Hejlsberg (TypeScript-Erfinder) erklaerte in GitHub-Issues:
> Deep-Operationen sind **kontextabhaengig**. Soll `Date` aufgeloest
> werden? Soll `Map<K,V>` rekursiv behandelt werden? Was ist mit
> Funktionen, Klassen-Instanzen, `Promise<T>`? Jedes Projekt hat
> andere Antworten. Deshalb bietet TypeScript die **Bausteine**
> (Mapped Types + Conditional Types + Rekursion), aber nicht die
> fertige Deep-Version — du baust sie fuer deinen Kontext.

---

## DeepPartial: Schritt fuer Schritt

```typescript annotated
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
  // ^ Mapped Type: iteriert ueber alle Schluessel von T
  // ^ ? macht jede Property optional (wie Partial)
  // ^ extends object prueft: Ist der Wert ein Objekt?
    ? DeepPartial<T[K]>
    // ^ JA: Rekursiv DeepPartial auf den verschachtelten Typ anwenden
    : T[K];
    // ^ NEIN (primitiver Wert): Einfach uebernehmen
};

// Testen:
type DeepPartialUser = DeepPartial<User>;
// Ergebnis:
// {
//   name?: string;
//   address?: {
//     street?: string;       ← Jetzt auch optional!
//     city?: string;         ← Jetzt auch optional!
//     country?: {
//       name?: string;       ← Sogar 3. Ebene!
//       code?: string;
//     };
//   };
// }
```

Die Logik ist einfach:
1. **Mapped Type** iteriert ueber alle Schluessel
2. Fuer jeden Schluessel: Ist der Wert ein **Objekt**? → Rekursion
3. Ist der Wert **primitiv**? → Direkt uebernehmen
4. Das `?` nach `[K in keyof T]` macht alles optional

---

## Erklaere dir selbst: Wie funktioniert DeepPartial?

> **Erklaere dir selbst:**
>
> Warum brauchen wir `T[K] extends object ? DeepPartial<T[K]> : T[K]`?
> Was wuerde passieren, wenn wir einfach `DeepPartial<T[K]>` ohne
> die Bedingung schreiben wuerden?
>
> *Denke 30 Sekunden nach, bevor du weiterliest.*

Ohne die Bedingung wuerde TypeScript versuchen, `DeepPartial<string>`
zu berechnen — das ergibt `{ [K in keyof string]?: ... }`, also die
Properties des String-Objekts (length, charAt, etc.) als optionale
Felder. Das ist **nicht** was wir wollen!

---

## Das Array-Problem

Die naive Version hat ein Problem: `Array` ist auch ein `object`!

```typescript annotated
// Problem: Arrays werden "aufgeloest"
type Broken = DeepPartial<{ tags: string[] }>;
// Ergebnis OHNE Array-Behandlung:
// {
//   tags?: {
//     length?: number;        ← FALSCH! Array wurde als Objekt behandelt
//     [index: number]?: ...
//     push?: ...
//   }
// }

// Loesung: Arrays separat behandeln
type DeepPartialFixed<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartialFixed<U>[]
    // ^ Array? → Rekursion auf den Element-Typ, Array bleibt Array
    : T[K] extends object
      ? DeepPartialFixed<T[K]>
      // ^ Objekt? → Rekursion
      : T[K];
      // ^ Primitiv? → Direkt uebernehmen
};

// Jetzt korrekt:
type Fixed = DeepPartialFixed<{ tags: string[]; nested: { items: number[] } }>;
// {
//   tags?: string[];          ← Array bleibt Array!
//   nested?: {
//     items?: number[];       ← Auch in verschachtelten Objekten korrekt
//   }
// }
```

---

## Denkfrage: Was passiert mit Arrays in DeepReadonly?

> **Denkfrage:**
>
> Wenn du `DeepReadonly<{ data: string[] }>` baust:
> Soll `string[]` zu `readonly string[]` werden?
> Oder soll das Array ein normales Array bleiben,
> aber die Elemente readonly sein?
>
> Und was ist mit `Map<string, User[]>`? Soll die Map
> readonly werden? Die User-Arrays darin? Die Users selbst?

Es gibt keine "richtige" Antwort — es haengt von deinem Kontext ab.
Genau deshalb hat TypeScript kein eingebautes DeepReadonly.

---

## DeepReadonly: Immutable Daten

```typescript annotated
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (infer U)[]
  // ^ readonly macht jede Property unveraenderbar
    ? readonly DeepReadonly<U>[]
    // ^ Array? → readonly Array mit readonly Elementen
    : T[K] extends object
      ? DeepReadonly<T[K]>
      // ^ Objekt? → Rekursion
      : T[K];
      // ^ Primitiv? → Direkt uebernehmen
};

type Config = {
  server: {
    host: string;
    port: number;
    tls: { cert: string; key: string };
  };
  features: string[];
};

type ReadonlyConfig = DeepReadonly<Config>;
// {
//   readonly server: {
//     readonly host: string;
//     readonly port: number;
//     readonly tls: {
//       readonly cert: string;
//       readonly key: string;
//     };
//   };
//   readonly features: readonly string[];
// }

// Alles ist jetzt unveraenderbar:
declare const cfg: ReadonlyConfig;
// cfg.server.port = 3000;          // Error!
// cfg.server.tls.cert = "new";     // Error!
// cfg.features.push("new");        // Error! readonly Array
// cfg.features[0] = "changed";     // Error!
```

---

## DeepRequired und DeepMutable

Das Pattern ist immer dasselbe — nur der Modifier aendert sich:

```typescript annotated
// DeepRequired: Entfernt alle optionalen Marker rekursiv
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends (infer U)[]
  // ^ -? entfernt das optionale ? (Required)
    ? DeepRequired<U>[]
    : T[K] extends object | undefined
      ? DeepRequired<NonNullable<T[K]>>
      // ^ NonNullable entfernt undefined (das vom ? kam)
      : NonNullable<T[K]>;
};

// DeepMutable: Entfernt alle readonly Marker rekursiv
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends readonly (infer U)[]
  // ^ -readonly entfernt den readonly Modifier
    ? DeepMutable<U>[]
    : T[K] extends object
      ? DeepMutable<T[K]>
      : T[K];
};
```

**Die vier Deep-Operationen im Ueberblick:**

| Operation | Modifier | Macht was? |
|-----------|----------|------------|
| DeepPartial | `?` hinzufuegen | Alles optional |
| DeepRequired | `-?` entfernen | Alles pflicht |
| DeepReadonly | `readonly` hinzufuegen | Alles unveraenderbar |
| DeepMutable | `-readonly` entfernen | Alles aenderbar |

---

## Experiment: DeepPartial selbst bauen

> **Experiment:**
>
> Implementiere DeepPartial und teste es:
>
> ```typescript
> type DeepPartial<T> = {
>   [K in keyof T]?: T[K] extends object
>     ? DeepPartial<T[K]>
>     : T[K];
> };
>
> // Test: 3 Ebenen tief
> type AppConfig = {
>   database: {
>     connection: {
>       host: string;
>       port: number;
>       ssl: boolean;
>     };
>     name: string;
>   };
>   logging: {
>     level: "debug" | "info" | "warn" | "error";
>     file: string;
>   };
> };
>
> // Erstelle ein partielles Update:
> const update: DeepPartial<AppConfig> = {
>   database: {
>     connection: {
>       port: 5433,  // Nur den Port aendern!
>     },
>   },
> };
> // Funktioniert! Alle anderen Felder sind optional.
>
> // Bonus: Was passiert mit einem Array-Feld?
> type WithArray = { items: { name: string }[] };
> type Test = DeepPartial<WithArray>;
> // Hovere ueber Test — was siehst du?
> ```

---

## Framework-Bezug: DeepReadonly in State-Management

> **In deinem Angular-Projekt** mit NgRx:
>
> ```typescript
> // NgRx Store: State soll IMMUTABLE sein
> interface AppState {
>   user: {
>     profile: { name: string; email: string };
>     preferences: { theme: "light" | "dark"; language: string };
>   };
>   cart: {
>     items: { id: string; quantity: number }[];
>     total: number;
>   };
> }
>
> // DeepReadonly erzwingt Immutability auf ALLEN Ebenen:
> type ImmutableState = DeepReadonly<AppState>;
>
> // In Reducern:
> function reducer(state: ImmutableState, action: Action): ImmutableState {
>   // state.user.profile.name = "new";  // Error! readonly
>   // state.cart.items.push(...);         // Error! readonly array
>   return { ...state, /* spread fuer Updates */ };
> }
> ```
>
> **In React** mit Immer:
>
> ```typescript
> // Immer erlaubt "mutative" Syntax, die tatsaechlich immutable arbeitet
> import { produce } from "immer";
>
> const nextState = produce(state, draft => {
>   draft.user.profile.name = "new";  // Sieht mutativ aus...
>   // ...aber Immer erzeugt einen neuen, unveraenderten State
> });
>
> // DeepReadonly<State> + Immer ist das beste aus beiden Welten:
> // Compile-Time-Schutz + ergonomische Updates
> ```

---

## Zusammenfassung

### Was du gelernt hast

Du hast die **vier grundlegenden Deep-Operationen** gemeistert:

- **DeepPartial\<T\>** macht alles auf allen Ebenen optional
- **DeepReadonly\<T\>** macht alles auf allen Ebenen unveraenderbar
- **DeepRequired\<T\>** und **DeepMutable\<T\>** sind die Gegenstuecke
- **Arrays brauchen Sonderbehandlung** — `(infer U)[]` extrahiert den Element-Typ
- TypeScript hat bewusst kein eingebautes Deep-Utility, weil die Semantik kontextabhaengig ist

> **Kernkonzept:** Deep-Operationen kombinieren **Mapped Types**
> (Iteration ueber Schluessel) mit **Conditional Types** (Pruefung
> auf Objekt vs Primitiv) und **Rekursion** (Selbstverweis fuer
> verschachtelte Ebenen). Das Pattern ist immer: pruefe ob Objekt →
> rekursiv anwenden, sonst → direkt uebernehmen.

---

> **Pausenpunkt** — Du hast die praktischsten rekursiven Typen gebaut!
> In der naechsten Sektion geht es um die Koenigsklasse: Rekursive
> Conditional Types fuer Flatten, Paths und String-Manipulation.
>
> Weiter: [Sektion 04 - Rekursive Conditional Types](./04-rekursive-conditional-types.md)
