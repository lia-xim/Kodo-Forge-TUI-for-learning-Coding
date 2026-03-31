# Sektion 3: Eigene Utility Types bauen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Key Remapping](./02-key-remapping.md)
> Naechste Sektion: [04 - Bedingte Mapped Types](./04-bedingte-mapped-types.md)

---

## Was du hier lernst

- Eigene Utility Types mit Mapped Types erstellen
- Mutable\<T\>, Nullable\<T\>, DeepReadonly\<T\> implementieren
- RequiredKeys und OptionalKeys extrahieren
- Wann eigene Utility Types sinnvoll sind

---

## Warum eigene Utility Types?

TypeScript hat ~20 eingebaute Utility Types. Fuer viele Projekte reicht
das nicht. Haeufige Beduerfnisse:

- `Mutable<T>` — readonly entfernen (Gegenteil von Readonly)
- `Nullable<T>` — jede Property kann auch null sein
- `DeepPartial<T>` — rekursiv alles optional
- `RequiredKeys<T>` — nur die Pflicht-Keys extrahieren

---

## Mutable\<T\> — Readonly rueckgaengig machen

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

interface FrozenConfig {
  readonly host: string;
  readonly port: number;
}

type EditableConfig = Mutable<FrozenConfig>;
// { host: string; port: number; }
// readonly ist weg!
```

---

## Nullable\<T\> — Jede Property kann null sein

```typescript
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface FormData {
  name: string;
  age: number;
}

type NullableForm = Nullable<FormData>;
// { name: string | null; age: number | null; }
```

---

## DeepReadonly\<T\> — Rekursiv readonly

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]                    // Funktionen nicht einpacken
      : DeepReadonly<T[K]>      // Objekte rekursiv
    : T[K];                     // Primitive direkt
};

interface Config {
  db: {
    host: string;
    credentials: {
      user: string;
      pass: string;
    };
  };
  port: number;
}

type FrozenConfig = DeepReadonly<Config>;
// Alle Ebenen sind readonly — auch db.credentials.user!
```

> **Achtung:** Ohne den Function-Check wuerden auch Methoden
> "eingepackt" — das will man normalerweise nicht.

---

## RequiredKeys\<T\> und OptionalKeys\<T\>

```typescript
// Extrahiere nur die Pflicht-Keys
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// Extrahiere nur die optionalen Keys
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface User {
  id: number;
  name: string;
  nickname?: string;
  bio?: string;
}

type Required = RequiredKeys<User>;  // 'id' | 'name'
type Optional = OptionalKeys<User>;  // 'nickname' | 'bio'
```

> **Der Trick:** `{} extends Pick<T, K>` prueft ob K optional ist.
> Wenn K optional ist, kann `{}` (ohne K) zu `Pick<T, K>` zugewiesen werden.

---

## Zusammengesetzte Utility Types

Du kannst eigene Utility Types kombinieren:

```typescript
// Mache bestimmte Keys optional, Rest bleibt Pflicht
type PartialBy<T, K extends keyof T> =
  Omit<T, K> & Partial<Pick<T, K>>;

// Mache bestimmte Keys zur Pflicht, Rest bleibt optional
type RequiredBy<T, K extends keyof T> =
  Omit<T, K> & Required<Pick<T, K>>;

interface User {
  id: number;
  name: string;
  email?: string;
  bio?: string;
}

type UserDraft = PartialBy<User, 'id'>;
// { name: string; email?: string; bio?: string; id?: number; }
```

---

## Wann eigene Utility Types bauen?

| Situation | Loesung |
|-----------|---------|
| Typ taucht in 3+ Dateien auf | -> Eigenen Utility Type extrahieren |
| Komplexe Pick+Omit+Partial Kombination | -> Benannter Utility Type |
| Rekursive Transformation noetig | -> DeepPartial, DeepReadonly, etc. |
| Eingebaute Utility Types reichen nicht | -> Eigenen bauen |

---

## Pausenpunkt

Du kannst jetzt eigene Utility Types erstellen, die ueber die eingebauten hinausgehen.

**Kernerkenntnisse:**
- `-readonly` und `-?` — Modifier entfernen
- Rekursive Mapped Types — `T[K] extends object ? Deep...<T[K]> : T[K]`
- RequiredKeys/OptionalKeys — Keys nach Eigenschaft extrahieren
- Combination Pattern — Omit + Partial, Pick + Required

> **Weiter:** [Sektion 04 - Bedingte Mapped Types](./04-bedingte-mapped-types.md)
