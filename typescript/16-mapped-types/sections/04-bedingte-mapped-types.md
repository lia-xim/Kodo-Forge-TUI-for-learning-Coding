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

> 📖 **Hintergrund: Die Verschmelzung zweier Features**
>
> Mapped Types (TS 2.1, 2016) und Conditional Types (TS 2.8, 2018)
> wurden unabhaengig voneinander eingefuehrt. Aber ihre **Kombination**
> ist das, was TypeScripts Typsystem wirklich maechtig macht. Es ist
> wie die Erfindung von Transistoren und Schaltkreisen — einzeln
> nuetzlich, zusammen revolutionaer. Conditional Types innerhalb von
> Mapped Types ermoeglichen **selektive, typ-abhaengige Transformationen**
> — etwas, das in kaum einer anderen Sprache moeglich ist.

> **Analogie:** Bedingte Mapped Types sind wie ein **Sortierband in einer
> Fabrik**: Jedes Item (Property) faehrt vorbei, ein Sensor prueft den
> Typ (Conditional), und basierend auf dem Ergebnis wird es anders
> behandelt — Zahlen werden zu Strings, Objekte werden eingefroren,
> Funktionen bleiben unveraendert.

## Conditional innerhalb Mapped Types

Du kannst in der Wert-Position eines Mapped Types einen Conditional Type verwenden:

```typescript annotated
type StringifyProps<T> = {
  [K in keyof T]: T[K] extends number ? string : T[K];
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                Conditional pro Property:
//                Ist der Wert-Typ number? → wird zu string
//                Sonst? → bleibt wie er ist
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

> 🧠 **Erklaere dir selbst:** Warum ist `StringifyProps` nuetzlich? In welchem realen Szenario wuerdest du number-Properties zu string machen wollen?
> **Kernpunkte:** API-Responses liefern oft Zahlen als Strings (JSON hat keine Integer-Unterscheidung) | Formular-Werte sind immer Strings | CSV-Import: alle Werte kommen als String | Serialisierung: Date → string, BigInt → string

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

> 🔬 **Experiment:** Erweitere `ReadonlyObjects<T>` so, dass auch
> Arrays readonly werden (`readonly string[]` statt `string[]`),
> aber Date-Objekte NICHT. Tipp: Du brauchst eine zusaetzliche
> Bedingung: `T[K] extends Date ? T[K] : ...`.

---

## Property-Typ-basierte Validierung

> ⚡ **Praxis-Tipp: Validators in Angular und React**
>
> Dieses Pattern ist die Grundlage fuer typsichere Formular-Validierung:
> - Angular Reactive Forms nutzen `Validators.required`, `Validators.min()` etc.
>   Ein Mapped Type kann automatisch den RICHTIGEN Validator-Typ pro Feld generieren.
> - React Hook Form's `register()` akzeptiert Validierungsregeln die
>   vom Feld-Typ abhaengen — ein string-Feld braucht `maxLength`,
>   ein number-Feld braucht `min`/`max`.

```typescript annotated
// Generiere Validierungsfunktionen passend zum Property-Typ
type Validators<T> = {
  [K in keyof T]: T[K] extends string
    ? (value: string) => boolean      // String-Felder bekommen String-Validator
    : T[K] extends number
    ? (value: number) => boolean      // Number-Felder bekommen Number-Validator
    : T[K] extends boolean
    ? (value: boolean) => boolean     // Boolean-Felder bekommen Boolean-Validator
    : (value: unknown) => boolean;    // Alles andere: unknown (sicher)
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

> 💭 **Denkfrage:** Was passiert wenn ein Property den Typ
> `string | number` hat (ein Union)? Welcher Validator-Typ wird gewaehlt?
>
> **Antwort:** `string | number` extends `string` ist `false` (weil
> `number` nicht string ist). `string | number` extends `number` ist auch
> `false`. Es landet beim `unknown`-Fallback. Fuer Unions braucht man
> entweder spezifische Overloads oder einen generischeren Ansatz.
> Das zeigt eine wichtige Grenze von Conditional Types: Sie pruefen
> den GESAMTEN Typ, nicht die einzelnen Union-Mitglieder (weil T[K]
> kein nackter Typ-Parameter ist).

---

## Verschachtelung: Conditional im Key UND im Wert

> 🔍 **Tieferes Wissen: Zwei Dimensionen der Kontrolle**
>
> In einem Mapped Type mit Conditional hast du zwei unabhaengige
> Stellschrauben:
> 1. **Im Key (as-Clause):** Conditional entscheidet, ob der Key
>    ueberhaupt im Ergebnis erscheint (Filterung)
> 2. **Im Wert:** Conditional entscheidet, welchen TYP die Property
>    bekommt (Transformation)
>
> Beide gleichzeitig zu nutzen ist die **maechtigste Form** der
> Mapped Types — du filterst UND transformierst in einem Schritt.

Du kannst Conditionals sowohl fuer Key-Filterung als auch fuer
Wert-Transformation kombinieren:

```typescript annotated
// Nur string-Properties behalten UND in Uppercase umwandeln
type UppercaseStringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: Uppercase<T[K] & string>;
//                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Key-Filterung: nur string-Properties
//                                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^ Wert-Transformation: zu Uppercase
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

> **Analogie:** Dieses Pattern ist wie ein Regenschirm-Verleih:
> Wer schon einen Regenschirm hat (optional = "kann fehlen"), bekommt
> noch eine Plastikhulle dazu (null). Wer keinen braucht (required),
> wird in Ruhe gelassen.

```typescript annotated
type NullableOptionals<T> = {
  [K in keyof T]: undefined extends T[K]
//                ^^^^^^^^^^^^^^^^^^^^^ "Ist undefined Teil von T[K]?"
//                (= ist die Property optional?)
    ? T[K] | null      // Ja, optional → auch null erlauben
    : T[K];            // Nein, Pflicht → unveraendert lassen
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

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `undefined extends T[K]` und `T[K] extends undefined`?
> **Kernpunkte:** `undefined extends T[K]` fragt "Ist undefined TEIL von T[K]?" | `T[K] extends undefined` fragt "Ist T[K] NUR undefined?" | Erstes trifft auf `string | undefined` zu (optional) | Zweites trifft nur auf `undefined` allein zu | Richtung matters!

---

## Was du gelernt hast

- **Conditional im Wert**: `T[K] extends X ? Y : Z` — typsichere Wert-Transformation pro Property
- **Conditional im Key**: `as T[K] extends X ? K : never` — typsichere Key-Filterung
- Beide sind **kombinierbar** fuer maximale Praezision (filtern UND transformieren)
- `undefined extends T[K]` ist der Standardtrick zum Pruefen ob eine Property optional ist
- Die Kombination von Mapped Types + Conditional Types macht TypeScript einzigartig maechtig

> 🧠 **Erklaere dir selbst:** Du hast jetzt drei Werkzeuge fuer Mapped Types:
> Modifier (`?`, `readonly`), Key Remapping (`as`), Conditional Types.
> In welcher Reihenfolge werden sie angewendet? Was wird zuerst ausgewertet?
> **Kernpunkte:** 1. Iteration (`K in keyof T`) | 2. Key Remapping (`as ...`) bestimmt ob/welcher Key | 3. Modifier (`?`, `readonly`) werden auf den neuen Key angewendet | 4. Conditional im Wert bestimmt den Property-Typ

**Kernkonzept zum Merken:** Bedingte Mapped Types sind das "if-else" in der Typ-Schleife. Sie ermoeglichen es, VERSCHIEDENE Properties UNTERSCHIEDLICH zu behandeln — genau wie `Array.map(item => item.type === 'a' ? handleA(item) : handleB(item))`.

> 🔬 **Experiment:** Baue einen `SerializeType<T>` der Date-Properties
> zu `string` macht und alles andere behaelt:
> `type SerializeType<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] }`.
> Teste ihn mit `{ name: string; createdAt: Date; count: number }`.

---

> **Pausenpunkt** — Du hast jetzt alle Bausteine der Mapped Types
> kennengelernt. In der letzten Sektion siehst du, wie sie in der
> Praxis zusammenkommen.
>
> Weiter geht es mit: [Sektion 05 - Praxis-Patterns](./05-praxis-patterns.md)
