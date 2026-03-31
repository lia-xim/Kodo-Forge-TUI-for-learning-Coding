# Sektion 3: Extract, Exclude, NonNullable

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Pick, Omit, Record](./02-pick-omit-record.md)
> Naechste Sektion: [04 - ReturnType, Parameters, Awaited](./04-returntype-parameters-awaited.md)

---

## Was du hier lernst

- **Exclude\<T, U\>** — Mitglieder aus einem Union entfernen
- **Extract\<T, U\>** — Mitglieder aus einem Union behalten
- **NonNullable\<T\>** — null und undefined entfernen
- Wie Conditional Types die Distribution ueber Unions ermoeglichen

---

## Der Unterschied: Objekt-Types vs Union-Types

> 📖 **Hintergrund: Conditional Types und Distribution**
>
> Extract, Exclude und NonNullable basieren alle auf **Conditional Types**,
> die ebenfalls in TypeScript 2.1-2.8 Stueck fuer Stueck eingefuehrt wurden.
> Der entscheidende Mechanismus — **Distributive Conditional Types** — kam
> mit TS 2.8 (Maerz 2018). Die Idee: Wenn ein Conditional Type auf einen
> Union-Typ angewendet wird, wird er auf JEDES Mitglied einzeln angewendet
> und die Ergebnisse wieder zu einem Union zusammengefasst. Das ist wie
> `Array.filter()` — aber fuer Typen statt fuer Werte.

In Sektion 01-02 haben wir Properties von **Objekt-Typen** manipuliert.
Jetzt manipulieren wir **Union-Typen** selbst — wir filtern ihre Mitglieder.

> **Analogie:** Stell dir einen Union-Typ als **Kartenstapel** vor.
> Pick/Omit waehlen **Spalten auf einer einzelnen Karte** aus.
> Extract/Exclude waehlen **ganze Karten** aus dem Stapel — sie filtern
> welche Karten du behaeltst und welche du wegwirfst.

```typescript annotated
// Objekt-Typ: Pick/Omit waehlen Properties
type User = { id: number; name: string; email: string };
type Picked = Pick<User, "id" | "name">;

// Union-Typ: Extract/Exclude waehlen MITGLIEDER
type AllEvents = "click" | "scroll" | "keydown" | "keyup" | "focus" | "blur";
type KeyEvents = Extract<AllEvents, "keydown" | "keyup">;
// ^ "keydown" | "keyup"
```

---

## Exclude\<T, U\> — Mitglieder entfernen

`Exclude<T, U>` entfernt alle Mitglieder aus T, die U zuweisbar sind:

```typescript annotated
type Primitive = string | number | boolean | null | undefined;

// Entferne null und undefined:
type DefinedPrimitive = Exclude<Primitive, null | undefined>;
// ^ string | number | boolean

// Entferne number:
type NonNumeric = Exclude<Primitive, number>;
// ^ string | boolean | null | undefined

// Entferne mehrere:
type JustString = Exclude<Primitive, number | boolean | null | undefined>;
// ^ string
```

### Exclude bei komplexeren Unions

```typescript annotated
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Nur lesende Methoden:
type ReadOnlyMethod = Exclude<HttpMethod, "POST" | "PUT" | "PATCH" | "DELETE">;
// ^ "GET"

// Alle ausser GET:
type WritingMethod = Exclude<HttpMethod, "GET">;
// ^ "POST" | "PUT" | "PATCH" | "DELETE"
```

### Wie funktioniert Exclude intern?

```typescript annotated
// Die eingebaute Definition:
type Exclude<T, U> = T extends U ? never : T;
// ^ Wenn T dem Typ U zuweisbar ist → verschwinde (never)
//                                    ^ Sonst: bleib wie du bist
```

> 📖 **Hintergrund: Distributive Conditional Types**
>
> Der Trick ist die **Distribution**: Wenn T ein Union ist, wird der
> Conditional Type auf JEDES Mitglied einzeln angewendet.
>
> ```typescript
> Exclude<"a" | "b" | "c", "a">
> // Wird zu:
> ("a" extends "a" ? never : "a") | ("b" extends "a" ? never : "b") | ("c" extends "a" ? never : "c")
> // = never | "b" | "c"
> // = "b" | "c"
> ```
>
> `never` in einem Union verschwindet automatisch — es ist das "neutrale
> Element" der Union-Typen, wie 0 bei der Addition.

> 🔍 **Tieferes Wissen: Wann Distribution NICHT passiert**
>
> Distribution passiert nur, wenn der Typ-Parameter **nackt** (naked) im
> Conditional steht. Wenn du T in ein Tuple packst, wird NICHT distribuiert:
>
> ```typescript
> // Distributiv (T ist nackt):
> type D<T> = T extends string ? "ja" : "nein";
> type R1 = D<string | number>;  // "ja" | "nein"
>
> // NICHT distributiv (T ist in [T] verpackt):
> type ND<T> = [T] extends [string] ? "ja" : "nein";
> type R2 = ND<string | number>;  // "nein" (der ganze Union wird geprueft)
> ```
>
> Diesen Trick braucht man selten, aber er erklaert, warum die Syntax
> so funktioniert wie sie funktioniert.

---

## Extract\<T, U\> — Mitglieder behalten

`Extract<T, U>` ist das Gegenteil von Exclude — es behaelt nur die Mitglieder,
die U zuweisbar sind:

```typescript annotated
type AllEvents = "click" | "scroll" | "keydown" | "keyup" | "focus" | "blur";

// Nur Keyboard-Events:
type KeyEvent = Extract<AllEvents, "keydown" | "keyup">;
// ^ "keydown" | "keyup"

// Nur Focus-Events:
type FocusEvent = Extract<AllEvents, "focus" | "blur">;
// ^ "focus" | "blur"
```

### Extract mit Pattern-Matching

```typescript annotated
type AllTypes = string | number | boolean | string[] | number[] | null;

// Nur Array-Typen behalten:
type ArrayTypes = Extract<AllTypes, any[]>;
// ^ string[] | number[]

// Nur primitive Typen behalten:
type PrimitiveTypes = Extract<AllTypes, string | number | boolean>;
// ^ string | number | boolean
```

### Extract bei Discriminated Unions

```typescript annotated
type ApiResponse =
  | { status: "success"; data: string }
  | { status: "error"; message: string }
  | { status: "loading" };

// Nur die Erfolgs-Response:
type SuccessResponse = Extract<ApiResponse, { status: "success" }>;
// ^ { status: "success"; data: string }

// Nur Responses mit message:
type ErrorResponse = Extract<ApiResponse, { message: string }>;
// ^ { status: "error"; message: string }
```

> ⚡ **Praxis-Tipp: Extract bei Discriminated Unions in Angular/React**
>
> ```typescript
> // Angular: NgRx Actions filtern
> type AllActions = LoadUsers | LoadUsersSuccess | LoadUsersFailure;
> type SuccessActions = Extract<AllActions, { type: `[Users] ${string} Success` }>;
>
> // React: Reducer-States filtern
> type AppState =
>   | { status: "idle" }
>   | { status: "loading" }
>   | { status: "success"; data: User[] }
>   | { status: "error"; error: string };
> type ActiveState = Exclude<AppState, { status: "idle" }>;
> // Nur die States in denen "etwas passiert ist"
> ```

> 🧠 **Erklaere dir selbst:** Was ist der Zusammenhang zwischen
> Extract/Exclude und Pick/Omit?
> **Kernpunkte:** Pick/Omit arbeiten auf Objekt-Properties | Extract/Exclude arbeiten auf Union-Mitglieder | Omit nutzt intern Exclude (fuer die Keys) | Alle vier sind komplementaere Paare

---

## NonNullable\<T\> — null/undefined entfernen

`NonNullable<T>` entfernt `null` und `undefined` aus einem Typ:

```typescript annotated
type MaybeString = string | null | undefined;

type DefiniteString = NonNullable<MaybeString>;
// ^ string

// Praktisch bei optionalen Feldern:
interface User {
  name: string;
  nickname?: string;  // string | undefined
}

type DefiniteNickname = NonNullable<User["nickname"]>;
// ^ string
```

### NonNullable ist ein Spezialfall von Exclude

```typescript annotated
// NonNullable ist intern:
type NonNullable<T> = Exclude<T, null | undefined>;
// ^ Entferne null       ^ und undefined aus dem Union

// Identisch:
type A = NonNullable<string | null | undefined>;
type B = Exclude<string | null | undefined, null | undefined>;
// Beide: string
```

> 🔬 **Experiment:** Oeffne `examples/03-extract-exclude-nonnullable.ts` und
> schreibe `type Test = NonNullable<0 | "" | false | null | undefined>`.
> Welche Werte bleiben uebrig? Tipp: NonNullable entfernt nur `null` und
> `undefined`, nicht "falsy values" wie `0` oder `""`.

### Typisches Pattern: Nach einer Null-Pruefung

```typescript annotated
function processUser(users: Map<string, User>, id: string): void {
  const user = users.get(id);  // User | undefined

  if (!user) {
    throw new Error(`User ${id} not found`);
  }

  // Nach der Pruefung: user ist User (nicht mehr undefined)
  // Aber manchmal braucht man den Typ EXPLIZIT:
  type VerifiedUser = NonNullable<ReturnType<typeof users.get>>;
  // ^ User
}
```

---

## Zusammenspiel: Exclude + Extract + NonNullable

```typescript annotated
type Input = string | number | boolean | null | undefined | string[];

// Schritt 1: Null/undefined entfernen
type Defined = NonNullable<Input>;
// ^ string | number | boolean | string[]

// Schritt 2: Nur primitive Typen
type Primitives = Extract<Defined, string | number | boolean>;
// ^ string | number | boolean

// Schritt 3: Ohne boolean
type StringOrNumber = Exclude<Primitives, boolean>;
// ^ string | number
```

---

## Was du gelernt hast

- **Exclude\<T, U\>** entfernt Union-Mitglieder die U zuweisbar sind
- **Extract\<T, U\>** behaelt nur Union-Mitglieder die U zuweisbar sind
- **NonNullable\<T\>** ist `Exclude<T, null | undefined>`
- Alle drei nutzen **Distributive Conditional Types** — der Conditional wird auf jedes Union-Mitglied einzeln angewendet
- `never` verschwindet aus Unions — es ist das neutrale Element

> 🧠 **Erklaere dir selbst:** Was passiert bei `Extract<string | number, string>`?
> Und bei `Extract<"a" | "b" | "c", "a" | "b">`?
> **Kernpunkte:** Erstes: string | Zweites: "a" | "b" | Extract prueft Zuweisbarkeit pro Mitglied

**Kernkonzept zum Merken:** Pick/Omit filtern Properties, Extract/Exclude filtern Union-Mitglieder. Vier Werkzeuge, zwei Ebenen.

> **Experiment:** Oeffne `examples/03-extract-exclude-nonnullable.ts` und
> experimentiere mit verschachtelten Extract/Exclude-Aufrufen.

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Ab jetzt werden die
> Utility Types funktionsbezogen.
>
> Weiter geht es mit: [Sektion 04: ReturnType, Parameters, Awaited](./04-returntype-parameters-awaited.md)
