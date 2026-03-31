# Sektion 1: Mapped Types — Grundlagen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Key Remapping](./02-key-remapping.md)

---

## Was du hier lernst

- Was Mapped Types sind und welches Problem sie loesen
- Die Grundsyntax: `{ [K in keyof T]: ... }`
- Modifier: `readonly`, `?`, `+`, `-`
- Wie TypeScripts eingebaute Utility Types intern funktionieren

---

> 📖 **Hintergrund: Die Geburt der Mapped Types**
>
> Mapped Types wurden am **7. Dezember 2016** mit TypeScript 2.1
> veroeffentlicht. Sie waren Anders Hejlsbergs Antwort auf die Frage:
> "Wie koennen wir Typen transformieren, ohne sie komplett neu zu
> schreiben?" Die Inspiration kam aus der funktionalen Programmierung —
> `Array.map()` transformiert **Werte** in einem Array, Mapped Types
> transformieren **Typen** in einem Objekt-Typ.
>
> Hejlsberg demonstrierte Mapped Types live auf der TSConf 2016 und
> implementierte `Partial<T>`, `Readonly<T>` und `Pick<T, K>` in
> jeweils einer einzigen Zeile. Das Publikum reagierte beeindruckt —
> vorher brauchte man fuer jede Variante eines Typs ein komplett neues
> Interface. Mapped Types machten das TypeScript-Typsystem zum ersten
> Mal **turingvollstaendig** fuer Typ-Transformationen.

> **Analogie:** Mapped Types sind wie eine **Kopiermaschine mit Stempeln**:
> Du nimmst ein Objekt, kopierst alle Keys, und drueckst auf jedes
> Property einen Stempel (`readonly`, `optional`, neuer Typ). Das
> Original bleibt unveraendert — du bekommst eine transformierte Kopie.

## Das Problem: Jede Property einzeln transformieren

In Lektion 15 hast du Utility Types wie `Partial<T>` und `Readonly<T>` benutzt.
Aber wie funktionieren die INTERN? Die Antwort: **Mapped Types**.

Stell dir vor, du hast ein User-Interface und willst JEDE Property optional machen.
Ohne Mapped Types muesstest du jede Property einzeln aendern:

```typescript
// Manuell — skaliert nicht!
interface UserOptional {
  id?: number;
  name?: string;
  email?: string;
}
```

---

## Die Grundsyntax

Ein Mapped Type iteriert ueber die Keys eines Typs und transformiert jede Property:

```typescript annotated
type MyPartial<T> = {
  [K in keyof T]?: T[K];
// ^              ^  ^
// |              |  +-- Indexed Access: der Wert-Typ der Property K in T
// |              +----- ? macht die Property optional (Modifier)
// +-------------------- Iteration: fuer JEDEN Key K in keyof T
};
```

Schritt fuer Schritt:
1. `keyof T` — alle Keys von T als Union: `'id' | 'name' | 'email'`
2. `K in ...` — fuer JEDEN Key K in dieser Union
3. `T[K]` — der Wert-Typ der Property K in T
4. `?` — macht die Property optional

> **Denke an eine for-Schleife fuer Typen:**
> "Fuer jeden Key K in T, erstelle eine Property K mit dem Typ T[K]."
>
> ```
> // JavaScript-Analogie (Werte):
> const result = {};
> for (const key in original) {
>   result[key] = original[key];  // Kopie mit gleichen Werten
> }
>
> // TypeScript-Analogie (Typen):
> type Result = {
>   [K in keyof Original]: Original[K];  // Kopie mit gleichen Typen
> };
> ```

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen `[K in keyof T]` und `[key: string]`? Wann wuerdest du welches verwenden?
> **Kernpunkte:** `[K in keyof T]` iteriert ueber BEKANNTE Keys (endliche Menge) | `[key: string]` erlaubt BELIEBIGE String-Keys | Mapped Types bewahren die Struktur | Index Signatures sind offen fuer neue Keys

---

## Beispiel: Partial nachbauen

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
}

type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type PartialUser = MyPartial<User>;
// So "denkt" der Compiler:
// K = "id"    → id?: number       (number kommt von User["id"])
// K = "name"  → name?: string     (string kommt von User["name"])
// K = "email" → email?: string    (string kommt von User["email"])
// Ergebnis: { id?: number; name?: string; email?: string; }
```

> 🔬 **Experiment:** Schreibe einen Mapped Type `Stringify<T>` der ALLE
> Property-Typen zu `string` macht:
> `type Stringify<T> = { [K in keyof T]: string }`.
> Teste ihn mit `User`. Was passiert mit `id`? Geht die `number`-Information verloren?

---

## Modifier: readonly und optional

Mapped Types haben vier Modifier-Varianten:

```typescript annotated
// Optional hinzufuegen (+? oder einfach ?)
type AllOptional<T> = { [K in keyof T]+?: T[K] };
//                                    ^^ + ist optional (Kurzform: einfach ?)

// Optional ENTFERNEN (-?)
type AllRequired<T> = { [K in keyof T]-?: T[K] };
//                                    ^^ Minus ENTFERNT den ?-Modifier

// readonly hinzufuegen (+readonly oder einfach readonly)
type AllReadonly<T> = { +readonly [K in keyof T]: T[K] };
//                      ^^^^^^^^^ + ist optional (Kurzform: einfach readonly)

// readonly ENTFERNEN (-readonly)
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
//                  ^^^^^^^^^ Minus ENTFERNT den readonly-Modifier
```

> **Plus fuegt hinzu, Minus entfernt.** Das ist die gesamte Modifier-Logik.
> `+?` = optional machen, `-?` = optional entfernen.
> `+readonly` = readonly machen, `-readonly` = readonly entfernen.

> 🔍 **Tieferes Wissen: Modifier-Algebra**
>
> Die Modifier `+` und `-` wurden in **TypeScript 2.8** (Maerz 2018)
> eingefuehrt. Vorher konnte man nur `?` und `readonly` hinzufuegen,
> aber nicht entfernen. Das `-`-Zeichen war die fehlende Haelfte:
>
> | Modifier | Wirkung | Eingebaut als |
> |---|---|---|
> | `?` / `+?` | Property optional machen | `Partial<T>` |
> | `-?` | Optional entfernen | `Required<T>` |
> | `readonly` / `+readonly` | Property readonly machen | `Readonly<T>` |
> | `-readonly` | Readonly entfernen | *(kein Builtin!)* |
>
> Dass es kein eingebautes `Mutable<T>` gibt, ist eine bewusste
> Design-Entscheidung: Readonly hinzuzufuegen ist "sicher", es zu
> entfernen ist "gefaehrlich" und sollte eine bewusste Entscheidung sein.

> 🧠 **Erklaere dir selbst:** Was passiert, wenn du `+?` und `-?` gleichzeitig auf verschiedene Properties anwenden willst — z.B. "name" soll optional werden, "email" soll required werden? Geht das mit einem einzigen Mapped Type?
> **Kernpunkte:** Nein, ein Mapped Type wendet den gleichen Modifier auf ALLE Keys an | Man braucht eine Kombination (Pick + Partial + Omit) | Oder Key Remapping mit Conditional (Sektion 4) | Das ist der Grund warum Composition so wichtig ist

---

## Homomorphe Mapped Types

Wenn du `keyof T` als Source verwendest, bewahrt TypeScript die Original-Modifier:

```typescript annotated
interface Config {
  readonly host: string;
  port?: number;
}

type Copy<T> = { [K in keyof T]: T[K] };
type ConfigCopy = Copy<Config>;
// { readonly host: string; port?: number; }
// readonly und optional werden BEIBEHALTEN!
```

Das nennt man **homomorph** — der Mapped Type bewahrt die Struktur des Originals.
Nur explizite Modifier (`+?`, `-?`, `+readonly`, `-readonly`) aendern etwas.

> 📖 **Hintergrund: Warum "homomorph"?**
>
> Der Begriff kommt aus der Mathematik und bedeutet "strukturerhaltend".
> Ein homomorpher Mapped Type bewahrt die Modifier des Originals — er
> "kopiert" die Struktur treu. Das ist wichtig, weil es bedeutet:
> Wenn du `Partial<Readonly<T>>` schreibst, bleibt `readonly` erhalten.
> Die Modifier **akkumulieren**, sie ueberschreiben sich nicht.
>
> Nicht-homomorphe Mapped Types (z.B. `{ [K in "a" | "b"]: string }`)
> haben keinen Bezug zu einem Original-Typ und koennen daher keine
> Modifier bewahren.

> 💭 **Denkfrage:** Wenn `Copy<T>` die Modifier behaelt, warum ergibt
> `Copy<Config>` nicht einfach `Config`? Ist es wirklich eine Kopie?
>
> **Antwort:** Es IST eine identische Kopie — der Typ ist strukturell
> gleich. TypeScript behandelt sie als kompatibel. Der Unterschied
> zeigt sich nur im Hover der IDE: Der aufgeloeste Typ wird angezeigt
> statt des Alias-Namens. Das kann beim Debugging nuetzlich sein!

---

## Hintergrund: So funktionieren TypeScripts Utility Types

Jetzt verstehst du, was hinter den Kulissen passiert:

```typescript annotated
// TypeScripts echte Definitionen (vereinfacht):
type Partial<T>   = { [K in keyof T]?: T[K] };           // ? hinzufuegen
type Required<T>  = { [K in keyof T]-?: T[K] };          // ? entfernen
type Readonly<T>  = { readonly [K in keyof T]: T[K] };   // readonly hinzufuegen
type Mutable<T>   = { -readonly [K in keyof T]: T[K] };  // readonly entfernen (nicht eingebaut!)
```

> ⚡ **Praxis-Tipp: Mapped Types in Angular und React**
>
> ```typescript
> // Angular Reactive Forms nutzen intern Mapped Types:
> // FormGroup<T> mapped jede Property zu einem FormControl
> type FormControls<T> = {
>   [K in keyof T]: FormControl<T[K]>;
> };
> // Das ist ein Mapped Type!
>
> // React: Readonly<Props> fuer immutable Component Props
> // Seit React 18 sind Props implizit Readonly —
> // TypeScript's Readonly<T> stellt sicher dass du nicht
> // versehentlich props.name = "other" schreibst.
> ```

---

## Was du gelernt hast

- Mapped Types sind **for-Schleifen fuer Typen**: `{ [K in keyof T]: ... }`
- Die Syntax hat drei Teile: **Iteration** (`K in keyof T`), **Modifier** (`?`, `readonly`), **Wert** (`T[K]`)
- `+` fuegt Modifier hinzu, `-` entfernt sie — das ist die gesamte Modifier-Logik
- **Homomorphe** Mapped Types bewahren die Original-Modifier (`readonly`, `?`)
- Alle eingebauten Utility Types (`Partial`, `Required`, `Readonly`) sind intern Mapped Types

> 🧠 **Erklaere dir selbst:** Wenn du `Partial<T>` und `Required<T>` nun
> intern verstehst — koenntest du auch ein `ReadonlyPartial<T>` bauen,
> das BEIDES gleichzeitig macht? Wie saehe die Definition aus?
> **Kernpunkte:** `{ readonly [K in keyof T]?: T[K] }` — beide Modifier gleichzeitig | Oder: `Readonly<Partial<T>>` als Composition | Beides fuehrt zum gleichen Ergebnis | Composition ist lesbarer

**Kernkonzept zum Merken:** Mapped Types sind das **Fundament** aller Utility Types. Wer Mapped Types versteht, versteht wie TypeScript Typen transformiert — nicht als Magie, sondern als Iteration ueber Properties.

> 🔬 **Experiment:** Oeffne eine TypeScript-Datei und schreibe:
> ```typescript
> type AllString<T> = { [K in keyof T]: string };
> type Test = AllString<{ x: number; y: boolean; z: Date }>;
> ```
> Hovere ueber `Test`. Sind wirklich alle Typen zu `string` geworden?
> Aendere dann `string` zu `T[K][]` — was passiert?

---

> **Pausenpunkt** — Du kennst jetzt die Grundsyntax von Mapped Types
> und wie Modifier funktionieren. Das ist das Fundament fuer alles Weitere.
>
> Weiter geht es mit: [Sektion 02 - Key Remapping](./02-key-remapping.md)
