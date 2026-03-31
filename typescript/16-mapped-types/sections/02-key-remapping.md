# Sektion 2: Key Remapping

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Grundlagen](./01-grundlagen.md)
> Naechste Sektion: [03 - Eigene Utility Types](./03-eigene-utility-types.md)

---

## Was du hier lernst

- Die `as`-Clause zum Umbenennen von Keys
- Template Literal Types fuer dynamische Key-Namen
- Key-Filterung durch `never` im Remapping
- Praxisbeispiele: Getter/Setter-Generierung, Event-Handler-Typen

---

> 📖 **Hintergrund: Key Remapping — ein spaeter Meilenstein**
>
> Key Remapping (`as`-Clause in Mapped Types) wurde erst mit
> **TypeScript 4.1** (November 2020) eingefuehrt — vier Jahre nach
> den urspruenglichen Mapped Types! Vorher war es unmoeglich, Keys
> in einem Mapped Type umzubenennen. Man musste umstaendliche Workarounds
> mit `Pick`, `Omit` und Intersection Types nutzen. Die `as`-Clause
> war eines der meistgewuenschten Features in der TypeScript-Community
> (GitHub Issue #12754 hatte hunderte Upvotes).

## Das Problem: Keys umbenennen oder filtern

In Sektion 1 hast du gelernt, Properties zu transformieren. Aber was
wenn du die **Key-Namen** selbst aendern willst?

```typescript
interface User {
  name: string;
  email: string;
}

// Gewuenscht: Getter-Methoden
// { getName(): string; getEmail(): string; }
```

Mit der Grundsyntax `[K in keyof T]` bleiben die Keys immer gleich.
Die Loesung: **Key Remapping mit `as`**.

---

## Die as-Clause (TS 4.1)

> **Analogie:** Stell dir Mapped Types ohne `as` wie eine Kopiermaschine
> vor, die nur den **Inhalt** aendern kann (Farbe, Groesse). Mit der
> `as`-Clause kann die Maschine jetzt auch das **Etikett** auf jedem
> Ordner umbenennen — "name" wird zu "getName", "email" wird zu "getEmail".

```typescript annotated
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
// ^              ^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^
// |              |  Neuer Key-Name (Template Literal)  Wert: Getter-Funktion
// |              +-- as-Clause: "nenne den Key um in..."
// +----------------- Iteration ueber alle Original-Keys
};

interface User {
  name: string;
  email: string;
  age: number;
}

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getEmail: () => string;
//   getAge: () => number;
// }
```

Schritt fuer Schritt:
1. `K in keyof T` — iteriert ueber 'name', 'email', 'age'
2. `as \`get${Capitalize<string & K>}\`` — benennt 'name' in 'getName' um
3. `() => T[K]` — der Wert-Typ wird eine Getter-Funktion

> **`string & K`** ist noetig weil `keyof T` auch `number | symbol` enthalten
> kann. Die Intersection filtert auf string-Keys.

> 🧠 **Erklaere dir selbst:** Was macht `Capitalize<string & K>` genau? Warum nicht einfach `Capitalize<K>`?
> **Kernpunkte:** `keyof T` ist `string | number | symbol` | `Capitalize` erwartet `string` | `string & K` filtert auf string-Keys | `number`- und `symbol`-Keys werden ausgeschlossen | Ohne `& string` gibt es einen Compile-Error

---

## Template Literal Types in Keys

Du kannst beliebige Template Literals als neue Key-Namen verwenden:

```typescript
// Setter generieren
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

// Event-Handler generieren
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (
    newValue: T[K],
    oldValue: T[K]
  ) => void;
};

interface Settings {
  theme: string;
  fontSize: number;
}

type SettingsHandlers = EventHandlers<Settings>;
// {
//   onThemeChange: (newValue: string, oldValue: string) => void;
//   onFontSizeChange: (newValue: number, oldValue: number) => void;
// }
```

> ⚡ **Praxis-Tipp: Event-Handler in Angular und React**
>
> ```typescript
> // React: onChange-Handler fuer alle Properties generieren
> type ChangeHandlers<T> = {
>   [K in keyof T as `on${Capitalize<string & K>}Change`]: (value: T[K]) => void;
> };
> // Fuer { name: string; age: number } ergibt das:
> // { onNameChange: (value: string) => void; onAgeChange: (value: number) => void; }
>
> // Angular: Output-Events automatisch ableiten
> type OutputEvents<T> = {
>   [K in keyof T as `${string & K}Change`]: EventEmitter<T[K]>;
> };
> ```

---

## Key-Filterung mit never

Wenn das Remapping `never` ergibt, wird der Key **entfernt**:

```typescript annotated
// Nur string-Properties behalten
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
//                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                 Conditional im Remapping:
//                 Ist der Wert-Typ string? → Key behalten
//                 Sonst? → never → Key wird entfernt
};

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type StringProps = StringKeysOnly<User>;
// { name: string; email: string; }
// id und age wurden herausgefiltert!
```

> **Merksatz:** `never` im Key Remapping = Key wird entfernt.
> Das ist wie ein `Array.filter()` fuer Object-Keys auf Type-Level.

> 💭 **Denkfrage:** Kannst du mit Key Remapping ein `Pick<T, K>`
> nachbauen, das OHNE den zweiten Parameter K funktioniert — also
> automatisch alle string-Properties auswaehlt?
>
> **Antwort:** Ja! Das ist genau was `StringKeysOnly<T>` oben tut.
> Man kann den "Filter" beliebig anpassen — z.B. nur Funktionen,
> nur Arrays, nur Typen die einem bestimmten Interface entsprechen.
> Key Remapping macht **typ-basiertes Filtern** moeglich, was
> mit dem normalen `Pick` (key-basiert) nicht geht.

---

## Praxisbeispiel: OmitByType

```typescript
// Entferne alle Properties eines bestimmten Typs
type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

// Behalte nur Properties eines bestimmten Typs
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface Mixed {
  name: string;
  count: number;
  active: boolean;
  label: string;
}

type WithoutStrings = OmitByType<Mixed, string>;
// { count: number; active: boolean; }

type OnlyStrings = PickByType<Mixed, string>;
// { name: string; label: string; }
```

---

## Kombination: Prefix/Suffix fuer Keys

```typescript annotated
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}_${string & K}`]: T[K];
//                  ^^^^^^^^^^^^^^^^^^^^ Template Literal:
//                  P + "_" + originaler Key-Name
};

interface DbRow {
  id: number;
  name: string;
}

type UserRow = Prefixed<DbRow, 'user'>;
// { user_id: number; user_name: string; }
```

> 🔍 **Tieferes Wissen: Capitalize, Uncapitalize, Uppercase, Lowercase**
>
> TypeScript stellt vier eingebaute String-Manipulation-Types bereit:
>
> ```typescript
> type A = Capitalize<"hello">;     // "Hello"
> type B = Uncapitalize<"Hello">;   // "hello"
> type C = Uppercase<"hello">;      // "HELLO"
> type D = Lowercase<"HELLO">;      // "hello"
> ```
>
> Diese sind **intrinsische Typen** — sie sind im Compiler fest
> eingebaut und koennen nicht mit normalen Conditional Types
> nachgebaut werden. Sie arbeiten auf **Literal-String-Typen**,
> nicht auf dem allgemeinen `string`-Typ.

> 🔬 **Experiment:** Baue einen Mapped Type `Suffixed<T, S>` der
> einen Suffix anhaengt (z.B. `Suffixed<{ name: string }, "Field">`
> ergibt `{ nameField: string }`). Tipp: Die Syntax ist fast
> identisch mit `Prefixed`, nur die Template-Reihenfolge aendert sich.

---

## Was du gelernt hast

- Die **`as`-Clause** (TS 4.1) ermoeglicht Key-Umbenennung in Mapped Types
- **Template Literal Types** erzeugen dynamische Key-Namen: `` `get${Capitalize<K>}` ``
- **`as never`** filtert Keys heraus — wie `Array.filter()` auf Type-Level
- **`string & K`** stellt sicher, dass K ein String-Key ist (filtert number/symbol)
- Getter, Setter, Event-Handler und Prefixed Keys sind typische Anwendungen

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen Key-Filterung
> mit `as ... ? K : never` (Key Remapping) und `Pick<T, K>` (Utility Type)?
> **Kernpunkte:** Pick filtert nach KEY-NAMEN (du gibst die Namen explizit an) | Key Remapping filtert nach WERT-TYPEN (automatisch basierend auf dem Typ) | Pick braucht manuelle Key-Liste | Key Remapping ist dynamisch und passt sich an T an

**Kernkonzept zum Merken:** Key Remapping macht Mapped Types von einer reinen "Kopiermaschine" zu einer vollstaendigen Typ-Transformations-Engine. Du kannst Keys umbenennen, filtern und dynamisch generieren — alles in einem einzigen Typ.

---

> **Pausenpunkt** — Du hast jetzt das maechtigste Feature der Mapped Types
> kennengelernt. Ab hier baust du eigene Utility Types.
>
> Weiter geht es mit: [Sektion 03 - Eigene Utility Types](./03-eigene-utility-types.md)
