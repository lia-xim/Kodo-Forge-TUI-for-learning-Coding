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

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
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

---

## Key-Filterung mit never

Wenn das Remapping `never` ergibt, wird der Key **entfernt**:

```typescript
// Nur string-Properties behalten
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
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
> Das ist wie ein `filter()` fuer Object-Keys auf Type-Level.

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

```typescript
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}_${string & K}`]: T[K];
};

interface DbRow {
  id: number;
  name: string;
}

type UserRow = Prefixed<DbRow, 'user'>;
// { user_id: number; user_name: string; }
```

---

## Pausenpunkt

Du kannst jetzt Keys umbenennen, neue Key-Namen generieren und Keys filtern.

**Kernerkenntnisse:**
- `as NewKey` — Keys umbenennen im Mapped Type
- Template Literals — dynamische Key-Namen: `` `get${Capitalize<K>}` ``
- `as never` — Key herausfiltern (wie filter auf Type-Level)
- `string & K` — sicherstellen dass K ein String-Key ist

> **Weiter:** [Sektion 03 - Eigene Utility Types](./03-eigene-utility-types.md)
