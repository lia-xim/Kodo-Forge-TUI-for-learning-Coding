# Sektion 3: Distributive Conditional Types — Wenn Unions sich aufspalten

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Das infer-Keyword](./02-infer-keyword.md)
> Naechste Sektion: [04 - Rekursive Conditional Types](./04-rekursive-conditional.md)

---

## Was du hier lernst

- Das ueberraschende Verhalten von Conditional Types bei Union-Typen
- Was "Distribution" bedeutet und warum TypeScript das so macht
- Wie man Distribution bewusst verhindert mit der `[T]`-Technik
- Die `never`-Sonderregel: warum `never` bei Distribution immer `never` bleibt
- Wie `Extract<T, U>` und `Exclude<T, U>` auf Distribution aufbauen

---

## Die Ueberraschung

Fangen wir mit einem Experiment an. Was glaubst du, gibt folgender Typ zurueck?

```typescript
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string>;           // ?
type B = ToArray<string | number>;  // ?
```

Intuitiv wuerde man erwarten: `(string | number)[]` — ein Array das entweder Strings oder Numbers enthaelt.

Aber TypeScript gibt etwas anderes zurueck:

```typescript
type A = ToArray<string>;           // string[]          — das war zu erwarten
type B = ToArray<string | number>;  // string[] | number[] — NICHT (string | number)[]!
```

Das ist **Distribution**: Wenn der Typparameter T ein Union-Typ ist, wird der Conditional Type **fuer jedes Union-Member einzeln ausgewertet** und die Ergebnisse werden wieder zu einem Union zusammengefuegt.

---

## Hintergrund: Warum macht TypeScript das?

Das klingt zuerst wie ein Bug, ist aber eine bewusste Designentscheidung von Anders Hejlsberg und dem TypeScript-Team.

Die Motivation kommt aus der Praxis. Stell dir vor, du hast `Extract<T, U>` — einen Utility Type der aus einem Union nur die Member behaelt, die einem bestimmten Typ entsprechen:

```typescript
type MyExtract<T, U> = T extends U ? T : never;
type A = MyExtract<string | number | boolean, string | number>; // ?
```

Ohne Distribution muesste das `never` sein (weil `string | number | boolean` als Ganzes nicht `string | number` ist). Das waere nutzlos.

Mit Distribution: TypeScript prueft jedes Member einzeln:
- `string extends string | number` → `string` (behalten)
- `number extends string | number` → `number` (behalten)
- `boolean extends string | number` → `never` (entfernen)
- Ergebnis: `string | number`

Das ist genau das gewuenschte Verhalten. Distribution macht Conditional Types zu einem maechtigen Werkzeug zum **Filtern von Unions**.

Die Entscheidung war ein Kompromiss: Ja, das Verhalten ist ueberraschend fuer Neueinsteiger. Aber es macht `Extract` und `Exclude` erst moeglich — und die sind unersetzlich.

---

## Distribution Schritt fuer Schritt

```typescript annotated
type IsString<T> = T extends string ? "ja" : "nein";

type Result = IsString<string | number>;
//
// TypeScript sieht einen Union-Typparameter und verteilt:
//
// Schritt 1: IsString<string>  → "ja"     (string extends string = true)
// Schritt 2: IsString<number>  → "nein"   (number extends string = false)
//
// Beide Ergebnisse werden zu einem Union vereinigt:
// "ja" | "nein"
//
// Das nennt sich: Distributive Conditional Type
```

Die Verteilung passiert **automatisch**, wenn zwei Bedingungen erfuellt sind:
1. T ist ein **nackter Typparameter** — also `T`, nicht `T[]`, nicht `[T]`, nicht `Readonly<T>`
2. T wird mit einem **Union-Typ** belegt

---

## Annotierter Code: Distribution in Aktion

```typescript annotated
// Distributiv (nackter Typparameter):
type Wrap<T> = T extends any ? { value: T } : never;
//             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//             T ist nackt — Distribution findet statt

type A = Wrap<string | number>;
// Distribution:
// Wrap<string> = { value: string }
// Wrap<number> = { value: number }
// Ergebnis: { value: string } | { value: number }

// Das ist KEIN Aequivalent zu:
type WrongWrap = { value: string | number };
// { value: string } | { value: number } ist breiter!
// (Das erste akzeptiert gemischte Werte nicht)

// Nicht-distributiv (T ist eingepackt in Tuple):
type WrapND<T> = [T] extends [any] ? { value: T } : never;
//              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//              [T] — T ist jetzt kein nackter Parameter mehr

type B = WrapND<string | number>;
// Distribution findet NICHT statt
// [string | number] extends [any] wird als GANZES geprueft
// Ergebnis: { value: string | number }
```

---

## Distribution verhindern: Die [T]-Technik

Es gibt Situationen, in denen du den Union als Ganzes pruefen willst — nicht distributed. Die Technik: Wickle T in ein Tuple:

```typescript annotated
// Nutzt distributive Conditional Types um zu pruefen ob T genau "string" ist:
type IsExactlyString<T> = T extends string ? true : false;

type A = IsExactlyString<string>;        // true  — korrekt
type B = IsExactlyString<"hello">;       // true  — korrekt (Literal ist Subtyp)
type C = IsExactlyString<string | null>; // boolean  — FALSCH! (true | false)
//                                        Distribution: string→true, null→false

// Nicht-distributive Version:
type IsExactlyStringND<T> = [T] extends [string] ? true : false;
//                          ^^^         ^^^^^^
//                          Beide Seiten in Tuples einwickeln

type D = IsExactlyStringND<string>;        // true
type E = IsExactlyStringND<"hello">;       // true
type F = IsExactlyStringND<string | null>; // false  — KORREKT!
//                          [string | null] extends [string] ist false
//                          weil null kein Subtyp von string ist
```

Wann brauchst du die `[T]`-Technik?
- Wenn du einen Union als **atomare Einheit** pruefen willst
- Wenn du einen `IsExactly<T, U>`-Typ bauen willst
- Wenn du verhindern willst, dass `never` die Pruefung "kurzschliesst" (dazu sofort)

---

## Die never-Sonderregel

`never` ist in der Typtheorie die **leere Menge** — ein Union ohne Member. Wenn TypeScript ueber einen leeren Union distribuiert, gibt es keine Member zum Verarbeiten. Das Ergebnis ist immer `never`:

```typescript annotated
type IsString<T> = T extends string ? "ja" : "nein";

type A = IsString<string>;  // "ja"
type B = IsString<number>;  // "nein"
type C = IsString<never>;   // never  — NICHT "nein"!
//
// Warum? Distribution ueber never:
// never = leerer Union = keine Member
// Fuer jedes Member von never: (kein Member!)
// Ergebnis: never (leere Union)
```

Das ist counterintuitiv: Logisch koennte man erwarten, dass `never extends string` `"nein"` ergibt. Aber Distribution macht daraus "fuer kein Member": kein Ergebnis, also `never`.

Um `never` explizit zu testen, brauchst du die `[T]`-Technik:

```typescript annotated
// Korrekte IsNever-Implementierung:
type IsNever<T> = [T] extends [never] ? true : false;
//           ^^^        ^^^^^^
//           Keine Distribution! never als Ganzes pruefen.

type A = IsNever<never>;     // true   — korrekt
type B = IsNever<string>;    // false  — korrekt
type C = IsNever<0>;         // false  — korrekt

// Das Gleiche mit Distribution waere falsch:
type IsNeverBroken<T> = T extends never ? true : false;
type D = IsNeverBroken<never>;  // never  — nicht "true"!
```

---

## Experiment: Extract selbst verstehen

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> // Baue Extract und Exclude selbst:
> type MeinExtract<T, U> = T extends U ? T : never;
> type MeinExclude<T, U> = T extends U ? never : T;
>
> type Tier = "hund" | "katze" | "fisch" | "vogel";
>
> // Welche Tiere sind "haustier"-artig?
> type Haustier = MeinExtract<Tier, "hund" | "katze">;
> // Erwartung: "hund" | "katze"
>
> // Welche sind KEINE Hunde?
> type KeinHund = MeinExclude<Tier, "hund">;
> // Erwartung: "katze" | "fisch" | "vogel"
>
> // Was passiert mit never?
> type Nichts = MeinExtract<Tier, never>;
> // Erwartung: ???
>
> // Fahre mit der Maus ueber jeden Typ um das Ergebnis zu sehen.
> // Versuche zu erklaeren, warum jedes Ergebnis so ist wie es ist.
> ```
>
> Aendere `Tier` und fuege neue Typen hinzu. Beobachte wie Extract und Exclude automatisch reagieren — das ist distributive Conditional Types in Aktion.

---

## Erklaere dir selbst

> **Erklaere dir selbst:** Was ist der Unterschied zwischen `ToArray<string | number>` (ergibt `string[] | number[]`) und einem Typ der `(string | number)[]` ergibt? In welchem Fall waere welches Ergebnis nuetzlicher?
> **Kernpunkte:** `string[] | number[]` — entweder ein String-Array ODER ein Number-Array (nie gemischt) | `(string | number)[]` — ein Array das beides enthalten kann | Ersteres ist praeziser: eine Funktion die string[] ergibt kann nicht nachtraeglich numbers hinzufuegen | Letztes ist flexibler: zum Hinzufuegen gemischter Daten

---

## In deinem Angular-Projekt: Typ-sichere Event-Filterung

```typescript annotated
// Angular Material hat verschiedene Event-Typen.
// Mit Distribution kannst du spezifisch filtern:

type AllEvents =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "focus"; target: string }
  | { type: "blur"; target: string };

// Nur Maus-Events extrahieren:
type MausEvent = Extract<AllEvents, { type: "click" }>;
// { type: "click"; x: number; y: number }

// Alle Fokus-Events extrahieren:
type FokusEvents = Extract<AllEvents, { type: "focus" | "blur" }>;
// { type: "focus"; target: string } | { type: "blur"; target: string }

// Im Component:
@Component({ /* ... */ })
export class EventDemoComponent {
  handleMausEvent(event: MausEvent) {
    // TypeScript weiss: event hat x und y — kein type-check noetig!
    console.log(event.x, event.y);
  }

  handleFokus(event: FokusEvents) {
    // TypeScript weiss: event hat target
    console.log(event.target);
  }
}
```

---

## Denkfrage

> **Denkfrage:** Warum ist `string[] | number[]` praeziser als `(string | number)[]`?
>
> **Antwort:** `string[] | number[]` bedeutet: "Entweder ein Array das NUR Strings enthaelt, ODER ein Array das NUR Numbers enthaelt." Das ist ein **Entweder-oder** auf Array-Ebene. `(string | number)[]` bedeutet: "Ein Array das beliebig gemischte Strings und Numbers enthaelt." Das zweite ist lockerer — ein `(string | number)[]`-Array koennte `["hallo", 42, "welt"]` enthalten, was bei `string[] | number[]` nicht erlaubt waere.
>
> In der Praxis: Wenn eine Funktion `string[] | number[]` zurueckgibt, weisst du: Du bekommst entweder lauter Strings oder lauter Numbers. Das ist eine staerkere Garantie, die bei der Verarbeitung hilft.

---

## Was du gelernt hast

- Wenn T ein **nackter Typparameter** und ein Union ist, wird der Conditional Type **distribuiert**: fuer jedes Member einzeln ausgewertet
- Distribution passiert automatisch — kein explizites Einschalten noetig
- `[T] extends [U]` verhindert Distribution: T wird als atomare Einheit geprueft
- `never extends X` ergibt bei Distribution immer `never` (leerer Union hat keine Member)
- `IsNever<T>` muss `[T] extends [never]` nutzen — nicht `T extends never`
- `Extract<T, U>` und `Exclude<T, U>` sind distributive Conditional Types — das ist ihr Kern

**Kernkonzept:** Distribution ist kein Bug, sondern ein Feature — es macht Conditional Types zu Filter-Werkzeugen fuer Unions. Wenn du einen Union auseinandernehmen willst, nutze Distribution. Wenn du einen Union als Ganzes pruefen willst, nutze `[T] extends [U]`.

---

> **Pausenpunkt** — Distribution ist das konzeptuell schwierigste Konzept in Conditional Types. Wenn es sich noch nicht ganz festgesetzt hat, mache eine kurze Pause und lese die `IsNever`-Beispiele nochmal durch. Das Klick-Moment kommt, wenn man `never` als "leere Menge" denkt.
>
> Weiter geht es mit: [Sektion 04: Rekursive Conditional Types](./04-rekursive-conditional.md)
