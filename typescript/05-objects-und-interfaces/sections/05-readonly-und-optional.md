# 05 -- Readonly & Optional

> Geschaetzte Lesezeit: ~10 Minuten

## Was du hier lernst

- Wie `readonly` Properties funktionieren und warum sie **shallow** sind
- Den Unterschied zwischen `optional` und `undefined`
- Wie `Readonly<T>` und `Required<T>` arbeiten
- Die korrekte Syntax fuer Object Destructuring mit Typen
- Praxis-Patterns fuer immutable State (Angular/React)

---

## Readonly Properties

Mit `readonly` markierst du Properties, die nach der Erstellung nicht mehr geaendert
werden duerfen:

```typescript annotated
interface Point {
  readonly x: number;
// ^^^^^^^^ 'readonly' Modifier: Diese Property kann nach Erstellung nicht geaendert werden
  readonly y: number;
// ^^^^^^^^ Gilt fuer die Referenz (Zuweisung), nicht fuer das referenzierte Objekt!
}

const p: Point = { x: 10, y: 20 };
// p.x = 30;
// ^^^^^^^ FEHLER: Cannot assign to 'x' because it is a read-only property.
// Wichtig: 'readonly' ist ein reines TYPSYSTEM-Konzept -- zur Laufzeit kein Unterschied!
```

> 🧠 **Erklaere dir selbst:** Was genau schuetzt `readonly`? Ist eine Property mit
> `readonly` tief unveraenderlich -- oder nur oberflaelich? Was passiert zur Laufzeit
> mit `readonly`?
>
> **Kernpunkte:** readonly schuetzt nur die direkte Zuweisung (p.x = ...) | Nicht
> das Innere verschachtelter Objekte (shallow!) | Zur Laufzeit gibt es kein readonly --
> reines Typsystem-Konstrukt | Object.freeze() fuer Laufzeit-Immutabilitaet noetig |
> Bekannte Soundness-Luecke: readonly-Objekte koennen mutablen Typen zugewiesen werden

> **Analogie:** `readonly` ist wie **laminiertes Papier**. Du kannst den Text lesen,
> aber nicht ueberschreiben. Allerdings -- und das ist der entscheidende Punkt --
> wenn auf dem Papier eine **Adresse** steht, ist nur die Adresse laminiert.
> Was an der Adresse passiert (das referenzierte Objekt), ist nicht geschuetzt.

---

## Die Shallow-Falle

`readonly` in TypeScript schuetzt nur die **oberste Ebene**. Verschachtelte Objekte
sind weiterhin mutable:

```typescript
interface Company {
  readonly name: string;
  readonly address: {
    street: string;
    city: string;
  };
}

const company: Company = {
  name: "ACME",
  address: { street: "Hauptstr. 1", city: "Berlin" },
};

// company.name = "Foo";             // FEHLER -- readonly
// company.address = { ... };        // FEHLER -- readonly (die Referenz!)
company.address.street = "Neue Str.";  // KEIN FEHLER! Das Objekt selbst ist mutable!
```

```
  Readonly ist SHALLOW (oberflaechlich)
  ──────────────────────────────────────

  company ─────────────────────────────────
  |  name: "ACME"           GESCHUETZT    |
  |  address: ──────┐       GESCHUETZT    |  (nur die Referenz!)
  ─────────────────│──────────────────────
                   |
                   v
  address-Objekt ─────────────────────────────────
  |  street: "Hauptstr. 1"  NICHT geschuetzt!    |
  |  city: "Berlin"         NICHT geschuetzt!    |
  ────────────────────────────────────────────────
```

> **Tieferes Wissen:** Warum ist `readonly` shallow? Weil TypeScript zur Laufzeit
> keinen Code einfuegt. `readonly` existiert nur im Typsystem -- zur Laufzeit ist
> es normales JavaScript, und JavaScript-Objekte sind standardmaessig mutable.
>
> `Object.freeze()` macht Objekte zur Laufzeit immutable -- aber auch nur shallow!
> Fuer tiefe Immutabilitaet brauchst du Libraries wie Immer oder ein rekursives
> `DeepReadonly`-Pattern (Lektion 16, Mapped Types).

### Readonly bei Arrays

Dieselbe Falle gilt fuer Arrays:

```typescript
interface TodoList {
  readonly items: string[];
}

const list: TodoList = { items: ["Einkaufen"] };
// list.items = [];            // FEHLER -- Referenz ist readonly
list.items.push("Kochen");    // KEIN FEHLER! Array-Inhalt ist mutable!

// Loesung: readonly Array
interface SafeTodoList {
  readonly items: readonly string[];
  // Alternativ: readonly items: ReadonlyArray<string>;
}

const safeList: SafeTodoList = { items: ["Einkaufen"] };
// safeList.items.push("Kochen");  // FEHLER! push existiert nicht auf readonly string[]
```

---

## Readonly<T> -- Das Utility Type

`Readonly<T>` macht **alle** Properties eines Typs readonly -- aber auch nur shallow:

```typescript
interface User {
  name: string;
  age: number;
}

const frozenUser: Readonly<User> = { name: "Max", age: 30 };
// frozenUser.name = "Foo";  // FEHLER!
// frozenUser.age = 31;      // FEHLER!
```

> **Praxis-Tipp:** In Angular-Services, die State halten, ist `Readonly<T>` nuetzlich:
> ```typescript
> private _state: UserState = { /* ... */ };
>
> // Expose als Readonly -- Consumer koennen nicht direkt mutieren
> get state(): Readonly<UserState> { return this._state; }
> ```
>
> In React ist `Readonly<Props>` weniger noetig, weil React Props ohnehin als
> immutable behandelt. Aber fuer State-Objekte (useReducer) ist es hilfreich.

---

## Optional Properties

Das `?` markiert Properties, die fehlen duerfen:

```typescript
interface Config {
  host: string;
  port: number;
  debug?: boolean;     // Kann fehlen ODER undefined sein
  logFile?: string;    // Kann fehlen ODER undefined sein
}

// Gueltig -- debug und logFile werden weggelassen
const config: Config = {
  host: "localhost",
  port: 3000,
};
```

### Optional vs. `undefined` -- Der feine Unterschied

```typescript
interface A {
  x?: number;              // Property kann FEHLEN oder undefined sein
}

interface B {
  x: number | undefined;   // Property MUSS existieren, Wert kann undefined sein
}

const a: A = {};               // OK -- x fehlt
// const b: B = {};            // FEHLER! Property 'x' is missing
const b: B = { x: undefined }; // OK -- x existiert, Wert ist undefined
```

> **Denkfrage:** Wann ist der Unterschied relevant?
>
> Stell dir eine Funktion `updateUser(changes: Partial<User>)` vor.
> Wenn du `{ name: undefined }` uebergibst, setzt du den Namen aktiv auf undefined.
> Wenn du `{}` uebergibst (ohne name), aenderst du den Namen gar nicht.
>
> Mit `exactOptionalPropertyTypes` (tsconfig-Option, seit TS 4.4) macht TypeScript
> diesen Unterschied explizit: `x?` erlaubt dann NUR das Fehlen der Property,
> NICHT `undefined` als Wert. Das ist strenger, aber praeziser.

---

## Die Readonly-Soundness-Luecke

> **Tieferes Wissen:** TypeScript hat eine **bekannte Soundness-Luecke** bei `readonly`.
> Ein `readonly`-Objekt kann einem nicht-readonly-Typ zugewiesen werden -- und dann
> mutiert werden:
>
> ```typescript
> interface ReadonlyPoint { readonly x: number; readonly y: number; }
> interface MutablePoint { x: number; y: number; }
>
> const fixed: ReadonlyPoint = { x: 1, y: 2 };
> const mutable: MutablePoint = fixed;  // KEIN Fehler!
> mutable.x = 99;  // Aendert das "readonly" Objekt!
> console.log(fixed.x);  // 99 -- ueberraschung!
> ```
>
> Warum erlaubt TypeScript das? Weil `ReadonlyPoint` und `MutablePoint` **strukturell
> kompatibel** sind. Structural Typing prueft ob alle Properties vorhanden und
> typ-kompatibel sind -- `readonly` ist dabei kein Hindernis fuer die Assignability.
>
> **Das ist ein bewusster Trade-off:** Strikte readonly-Checks wuerden sehr viel
> bestehenden Code brechen. Die TypeScript-Maintainer haben sich dagegen entschieden.
>
> **Denkfrage:** Warum waere es so teuer, `readonly` strikt zu erzwingen? Denke an
> eine Funktion `function process(point: MutablePoint)` -- wenn du ein `ReadonlyPoint`
> nicht mehr uebergeben koenntest, muessten ALLE Funktionen, die Objekte entgegennehmen,
> explizit `Readonly<T>` akzeptieren. Das waere ein riesiger Breaking Change.

---

## Object Destructuring mit Typen

Beim Destructuring kann die Typ-Annotation ungewohnt aussehen:

```typescript
// FALSCH -- das ist JavaScript-Syntax fuer UMBENENNUNG!
// const { name: string } = user;  // Benennt 'name' in 'string' um!

// RICHTIG -- Typ nach dem gesamten Pattern
const { name, age }: { name: string; age: number } = user;

// Besser: Interface verwenden
const { name, age }: User = user;

// In Funktionsparametern (Angular/React Best Practice):
function UserCard({ name, age }: { name: string; age: number }) {
  return `${name}, ${age} Jahre`;
}
```

> **Warnung:** Die Verwechslung von Destructuring-Umbenennung und Typ-Annotation ist
> einer der haeufigsten Anfaengerfehler. Die Syntax `{ name: string }` bedeutet in
> JavaScript "nimm `name` und nenne es `string`" -- nicht "name hat den Typ string".

### React-Pattern: Props destrukturieren

```typescript
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  showAvatar?: boolean;
}

// Destrukturierung direkt im Parameter:
function UserCard({ user, onEdit, showAvatar = false }: UserCardProps) {
  // showAvatar hat Default-Wert -- TypeScript weiss: boolean, nicht undefined
  return (
    <div>
      {showAvatar && <Avatar />}
      <span>{user.name}</span>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
}
```

---

## Required<T> -- Das Gegenstueck zu Optional

`Required<T>` macht ALLE Properties zur Pflicht -- auch die optionalen:

```typescript
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// Required<Config> = { host: string; port: number; debug: boolean }
const fullConfig: Required<Config> = {
  host: "localhost",
  port: 3000,
  debug: false,
  // Jede Property MUSS angegeben werden!
};
```

> **Praxis-Tipp:** `Required<T>` ist nuetzlich fuer Validierungsfunktionen:
> ```typescript
> function validateConfig(partial: Config): Required<Config> {
>   return {
>     host: partial.host ?? "localhost",
>     port: partial.port ?? 3000,
>     debug: partial.debug ?? false,
>   };
> }
> ```
> Die Funktion nimmt eine optionale Config entgegen und gibt eine vollstaendige zurueck.

---

## Experiment-Box: Optional vs. Undefined live erleben

> **Experiment:** Aktiviere `exactOptionalPropertyTypes` im Playground (unter
> "TS Config" rechts oben) und schreibe:
> ```typescript
> interface Prefs {
>   theme?: "light" | "dark";
> }
>
> const p1: Prefs = {};                    // OK -- theme fehlt
> const p2: Prefs = { theme: "light" };    // OK
> const p3: Prefs = { theme: undefined };  // ???
> ```
> Mit `exactOptionalPropertyTypes: true` gibt `p3` einen Fehler!
> Ohne die Option ist es erlaubt. Das zeigt: TypeScript unterscheidet
> "Property fehlt" und "Property ist undefined" -- aber nur wenn du es
> explizit einschaltest.
>
> **Denkfrage:** Wann ist dieser Unterschied in der Praxis relevant?
> Denke an `Object.keys(p1)` vs. `Object.keys(p3)` -- bei `p1` gibt es
> keinen Key `theme`, bei `p3` schon (mit Wert `undefined`). Das kann bei
> Serialisierung (JSON.stringify) und Iterations-Logik zu Bugs fuehren.

---

## Zusammenfassung

| Konzept | Beschreibung |
|---------|-------------|
| `readonly` | Property kann nach Erstellung nicht geaendert werden |
| Shallow readonly | Nur die oberste Ebene ist geschuetzt! |
| `readonly T[]` | Array-Inhalt ist auch readonly |
| `Readonly<T>` | Alle Properties readonly machen (shallow!) |
| Readonly-Soundness | readonly-Objekte koennen mutablen Typen zugewiesen werden! |
| `x?` (optional) | Property kann fehlen |
| `x: T \| undefined` | Property MUSS existieren, Wert kann undefined sein |
| `exactOptionalPropertyTypes` | Striktere Trennung von fehlt vs. undefined |
| `Required<T>` | Alle optionalen Properties werden Pflicht |
| Destructuring | Typ nach dem Pattern: `{ x, y }: Type` |

---

**Was du gelernt hast:** Du verstehst die Shallow-Falle von `readonly`, den Unterschied
zwischen optional und undefined, und wie Destructuring mit Typen funktioniert.

| [<-- Vorherige Sektion](04-excess-property-checking.md) | [Zurueck zur Uebersicht](../README.md) | [Naechste Sektion: Index Signatures -->](06-index-signatures.md) |
