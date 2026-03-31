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

> 📖 **Hintergrund: Die Luecken der Standardbibliothek**
>
> TypeScript liefert bewusst nur ~20 Utility Types in der Standardbibliothek.
> Die Philosophie dahinter: Liefere **Bausteine**, nicht fertige Loesungen.
> Mapped Types + Conditional Types + `infer` sind so maechtig, dass
> Entwickler fast jeden gewuenschten Typ selbst bauen koennen.
>
> Die Community-Bibliothek **`type-fest`** (von Sindre Sorhus) fuellt
> diese Luecke mit ueber 200 Utility Types. Andere beliebte Bibliotheken
> sind `ts-toolbelt` und `utility-types`. In grossen Projekten findet
> man oft eine eigene `types/utils.ts` mit projektspezifischen
> Utility Types.

TypeScript hat ~20 eingebaute Utility Types. Fuer viele Projekte reicht
das nicht. Haeufige Beduerfnisse:

- `Mutable<T>` — readonly entfernen (Gegenteil von Readonly)
- `Nullable<T>` — jede Property kann auch null sein
- `DeepPartial<T>` — rekursiv alles optional
- `RequiredKeys<T>` — nur die Pflicht-Keys extrahieren

---

## Mutable\<T\> — Readonly rueckgaengig machen

> **Analogie:** Wenn `Readonly<T>` das Einschliessen eines Dokuments
> in eine Vitrine ist, dann ist `Mutable<T>` das **Oeffnen der Vitrine** —
> das Dokument wird wieder bearbeitbar.

```typescript annotated
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
// ^^^^^^^^^ Das Minus-Zeichen ENTFERNT den readonly-Modifier
};

interface FrozenConfig {
  readonly host: string;
  readonly port: number;
}

type EditableConfig = Mutable<FrozenConfig>;
// { host: string; port: number; }
// readonly ist weg!
```

> 🧠 **Erklaere dir selbst:** Wann braucht man `Mutable<T>` in der Praxis? Ist es nicht gefaehrlich, readonly zu entfernen?
> **Kernpunkte:** Tests brauchen oft schreibbare Versionen von readonly State | Builder-Pattern: erst mutable aufbauen, dann als readonly einfrieren | Library-Code gibt Readonly zurueck, intern braucht man Mutable | Bewusste Entscheidung, daher kein Builtin

---

## Nullable\<T\> — Jede Property kann null sein

```typescript annotated
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
//                      ^^^^^^ Union mit null: der Original-Typ ODER null
};

interface FormData {
  name: string;
  age: number;
}

type NullableForm = Nullable<FormData>;
// { name: string | null; age: number | null; }
```

> 💭 **Denkfrage:** Was ist der Unterschied zwischen `Nullable<T>`
> (jede Property kann null sein) und `Partial<T>` (jede Property kann
> fehlen)? Wann wuerdest du welches verwenden?
>
> **Antwort:** `Partial<T>` macht Properties optional (`?`) — der Key
> kann komplett fehlen oder `undefined` sein. `Nullable<T>` behaelt den
> Key als Pflichtfeld, erlaubt aber `null` als Wert. In APIs und
> Datenbanken ist der Unterschied wichtig: Ein fehlendes Feld ("nicht
> gesendet") ist etwas anderes als ein explizit auf null gesetztes Feld
> ("bewusst geloescht"). JSON unterscheidet beides!

---

## DeepReadonly\<T\> — Rekursiv readonly

```typescript annotated
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
// ^^^^^^^^ readonly auf dieser Ebene
    ? T[K] extends Function
      ? T[K]                    // Funktionen nicht einpacken (bleiben aufrufbar)
      : DeepReadonly<T[K]>      // Objekte: REKURSION — gehe eine Ebene tiefer
    : T[K];                     // Primitive: Rekursionsende (number, string etc.)
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

> ⚡ **Praxis-Tipp: DeepReadonly im State Management**
>
> ```typescript
> // Angular NgRx: Store-State sollte IMMER immutable sein
> // DeepReadonly stellt sicher, dass auch verschachtelte Objekte
> // nicht versehentlich mutiert werden:
> type AppState = DeepReadonly<{
>   auth: { user: { name: string; roles: string[] } | null };
>   ui: { theme: 'light' | 'dark'; sidebar: { collapsed: boolean } };
> }>;
>
> // React Redux: Gleicher Nutzen — verhindert direkte State-Mutation
> // Besonders wichtig bei useSelector, wo man leicht vergisst
> // dass der State nicht mutiert werden darf.
> ```

> 🔬 **Experiment:** Teste `DeepReadonly` mit einem Typ der ein `Date`
> enthaelt. Was passiert mit den Date-Methoden wie `.setTime()`?
> Tipp: `Date` ist ein Objekt aber keine Function — es wird also
> rekursiv behandelt. Ist das immer das gewuenschte Verhalten?

---

## RequiredKeys\<T\> und OptionalKeys\<T\>

```typescript annotated
// Extrahiere nur die Pflicht-Keys
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
// ^ Iteration    ^ -? verhindert dass K selbst optional wird
//                  ^ {} extends Pick<T, K>: Kann ein leeres Objekt zugewiesen werden?
//                    ^ Wenn ja: K ist optional → never (rausfiltern)
//                               ^ Wenn nein: K ist Pflicht → behalten
}[keyof T];
// ^^^^^^^^ Index Access: Sammle alle Values als Union (never verschwindet)

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

> 🔍 **Tieferes Wissen: Der `{} extends Pick<T, K>`-Trick**
>
> Wie erkennt man, ob eine Property optional ist? Der Trick nutzt
> **Zuweisbarkeit**: Wenn K optional ist, kann ein leeres Objekt `{}`
> zu `Pick<T, K>` zugewiesen werden — weil K ja fehlen darf. Wenn K
> required ist, kann `{}` NICHT zugewiesen werden (weil K vorhanden
> sein muss). Diese Asymmetrie nutzen wir als Test.
>
> ```typescript
> // Beispiel:
> {} extends { name: string } ? "optional" : "required"  // "required"
> {} extends { bio?: string } ? "optional" : "required"  // "optional"
> ```

---

## Zusammengesetzte Utility Types

Du kannst eigene Utility Types kombinieren — das ist die wahre Staerke:

```typescript annotated
// Mache bestimmte Keys optional, Rest bleibt Pflicht
type PartialBy<T, K extends keyof T> =
  Omit<T, K> & Partial<Pick<T, K>>;
// ^ Rest ohne K  ^ K wird optional gemacht
// Intersection vereint beide Haelften

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

> 🧠 **Erklaere dir selbst:** Warum braucht `PartialBy` eine Intersection (`&`) statt eines einzelnen Mapped Types? Koennte man das eleganter loesen?
> **Kernpunkte:** Ein Mapped Type wendet den gleichen Modifier auf ALLE Keys an | Wir brauchen unterschiedliches Verhalten fuer verschiedene Key-Gruppen | Omit nimmt den "Rest", Partial+Pick den selektiven Teil | Die Intersection vereint beide | Mit Key Remapping (Sektion 4) gaebe es eine Alternative

---

## Wann eigene Utility Types bauen?

| Situation | Loesung |
|-----------|---------|
| Typ taucht in 3+ Dateien auf | -> Eigenen Utility Type extrahieren |
| Komplexe Pick+Omit+Partial Kombination | -> Benannter Utility Type |
| Rekursive Transformation noetig | -> DeepPartial, DeepReadonly, etc. |
| Eingebaute Utility Types reichen nicht | -> Eigenen bauen |

---

## Was du gelernt hast

- **Mutable\<T\>** entfernt readonly mit `-readonly` — das Gegenteil von Readonly
- **Nullable\<T\>** fuegt `| null` zu jedem Property-Typ hinzu
- **DeepReadonly\<T\>** nutzt Rekursion fuer tiefe Unveraenderlichkeit
- **RequiredKeys/OptionalKeys** extrahieren Key-Namen mit dem `{} extends Pick<T, K>`-Trick
- **PartialBy/RequiredBy** kombinieren Omit + Partial/Required fuer selektive Transformationen

> 🧠 **Erklaere dir selbst:** Was ist das gemeinsame Muster hinter allen
> eigenen Utility Types die du hier gesehen hast?
> **Kernpunkte:** Mapped Type als Grundlage | Conditional Type fuer Fallunterscheidung | Rekursion fuer verschachtelte Objekte | Index Access [keyof T] fuer Key-Extraktion | Die vier Bausteine reichen fuer fast alles

**Kernkonzept zum Merken:** Die eingebauten Utility Types sind nur die Spitze des Eisbergs. Mit Mapped Types + Conditional Types + Rekursion kannst du jeden gewuenschten Typ-Transformer selbst bauen.

> 🔬 **Experiment:** Baue einen `DeepNullable<T>` — das rekursive
> Gegenstueck zu `Nullable<T>`. Teste ihn mit einem verschachtelten
> Objekt und pruefe: Werden auch die tiefen Properties nullable?

---

> **Pausenpunkt** — Du kannst jetzt eigene Utility Types erstellen,
> die ueber die eingebauten hinausgehen. Ab jetzt kombinierst du
> Mapped Types mit Conditional Types.
>
> Weiter geht es mit: [Sektion 04 - Bedingte Mapped Types](./04-bedingte-mapped-types.md)
