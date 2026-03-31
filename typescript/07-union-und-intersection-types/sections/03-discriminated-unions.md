# Sektion 3: Discriminated Unions — Algebraische Datentypen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Type Guards und Narrowing](./02-type-guards-und-narrowing.md)
> Naechste Sektion: [04 - Intersection Types](./04-intersection-types.md)

---

## Was du hier lernst

- Was eine **Discriminated Union** (Tagged Union) ist und warum sie so maechtig ist
- Wie du eine gemeinsame **Tag-Property** als Diskriminator nutzt
- Warum der **Exhaustive Check** mit `never` dein Code-Sicherheitsnetz ist
- Was **Algebraische Datentypen** (ADTs) sind und warum TypeScript sie unterstuetzt

---

## Das Problem: Unstrukturierte Unions

Stell dir vor, du modellierst verschiedene Formen (Shapes). Mit einfachen
Union Types wird es schnell unuebersichtlich:

```typescript
interface Circle {
  radius: number;
}
interface Rectangle {
  width: number;
  height: number;
}

// Problem: Wie unterscheide ich Circle von Rectangle?
function area(shape: Circle | Rectangle): number {
  if ("radius" in shape) {
    return Math.PI * shape.radius ** 2;
  }
  return shape.width * shape.height;
}
// Funktioniert... aber was wenn ein Objekt BEIDES hat?
// Was wenn ein neuer Shape-Typ dazukommt?
```

Die `in`-Pruefung funktioniert, ist aber **fragil**. Es gibt eine
wesentlich bessere Loesung.

---

## Die Loesung: Discriminated Unions

Eine **Discriminated Union** (auch "Tagged Union") hat eine gemeinsame
Property — den **Diskriminator** oder **Tag** — die TypeScript sagt,
welcher Typ vorliegt:

```typescript annotated
interface Circle {
  kind: "circle";     // <── Tag: ein String-Literal-Typ
  radius: number;
}
interface Rectangle {
  kind: "rectangle";  // <── Tag: ein anderer String-Literal-Typ
  width: number;
  height: number;
}
interface Triangle {
  kind: "triangle";   // <── Tag: noch ein anderer Wert
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;
//   ^^^^^
//   Discriminated Union: alle Mitglieder haben "kind" als Tag
```

Jetzt kann TypeScript den Typ **automatisch narrowen** ueber den Tag:

```typescript annotated
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // shape: Circle — TypeScript weiss es durch den Tag!
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      // shape: Rectangle
      return shape.width * shape.height;
    case "triangle":
      // shape: Triangle
      return (shape.base * shape.height) / 2;
  }
}
```

> 📖 **Hintergrund: Algebraische Datentypen (ADTs)**
>
> Discriminated Unions sind TypeScript's Version von **Algebraischen
> Datentypen** (ADTs), einem Konzept aus der funktionalen Programmierung.
> In funktionalen Sprachen heissen sie:
>
> - **Haskell:** `data Shape = Circle Float | Rectangle Float Float | Triangle Float Float`
> - **Rust:** `enum Shape { Circle(f64), Rectangle(f64, f64), Triangle(f64, f64) }`
> - **Scala:** `sealed trait Shape` + `case class Circle(...)` etc.
> - **F#:** `type Shape = Circle of float | Rectangle of float * float`
>
> Der Kerngedanke: Ein Typ ist die **Summe** (OR) seiner Varianten.
> Jede Variante traegt eigene Daten. Der Compiler erzwingt, dass alle
> Varianten behandelt werden. In der Typentheorie heisst das **Sum Type**
> (im Gegensatz zu **Product Types** wie Interfaces/Tuples, die
> Felder kombinieren).

---

## Der Exhaustive Check mit never

Das maechtigste Feature der Discriminated Unions: TypeScript kann
pruefen, ob du **alle Faelle** behandelt hast:

```typescript annotated
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // Wenn alle Faelle abgedeckt sind, ist shape hier "never"
      const _exhaustive: never = shape;
      //                         ^^^^^
      //    OK: shape ist never, weil alle Faelle behandelt sind
      return _exhaustive;
  }
}
```

Was passiert, wenn jemand einen neuen Shape-Typ hinzufuegt?

```typescript
// Jemand fuegt "pentagon" hinzu:
interface Pentagon {
  kind: "pentagon";
  sideLength: number;
}
type Shape = Circle | Rectangle | Triangle | Pentagon;

// JETZT meldet TypeScript im default-Zweig einen FEHLER:
// Type 'Pentagon' is not assignable to type 'never'.
//
// Der Compiler ERZWINGT, dass du den neuen Fall behandelst!
```

> 💭 **Denkfrage:** Warum funktioniert der Exhaustive Check? Was passiert
> intern mit dem Typ im default-Zweig?
>
> **Antwort:** TypeScript eliminiert bei jedem `case` einen Union-Mitglied.
> Nach allen `case`-Zweigen bleiben keine Mitglieder uebrig — der Typ
> wird `never` (die leere Menge). Wenn ein neues Mitglied hinzukommt
> und kein `case` dafuer existiert, ist der Typ im `default` nicht mehr
> `never`, sondern der neue Typ — und die Zuweisung an `never` schlaegt fehl.

### Die assertNever-Hilfsfunktion

Statt den `never`-Check manuell zu schreiben, ist eine Hilfsfunktion
ueblich:

```typescript annotated
function assertNever(value: never): never {
  throw new Error(`Unerwarteter Wert: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    case "triangle":  return (shape.base * shape.height) / 2;
    default:          return assertNever(shape);
    //                       ^^^^^^^^^^^^^^^^
    //   Compile-Fehler wenn ein Fall fehlt + Laufzeit-Schutz
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum gibt `assertNever` den Typ `never`
> zurueck UND wirft einen Error? Welchen Zweck erfuellt jeder Aspekt?
> **Kernpunkte:** never-Return: Funktion kehrt nie zurueck | throw: Laufzeit-Schutz |
> never-Parameter: Compile-Zeit-Pruefung dass alle Faelle behandelt sind

---

## Praxisbeispiel: API-Responses

Discriminated Unions sind **das** Pattern fuer API-Responses:

```typescript annotated
// ─── API Response als Discriminated Union ─────────────────
type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string; code: number };

function renderUsers(response: ApiResponse<User[]>): string {
  switch (response.status) {
    case "loading":
      return "Laden...";
    case "success":
      // response.data existiert NUR bei status === "success"
      return response.data.map(u => u.name).join(", ");
    case "error":
      // response.error und response.code existieren NUR bei status === "error"
      return `Fehler ${response.code}: ${response.error}`;
  }
}
```

Dieses Pattern siehst du ueberall:

```typescript
// React: useQuery, SWR, TanStack Query
// Angular: NgRx Actions, HttpClient States
// Allgemein: Result<T, E> Pattern, Option<T>, Either<L, R>
```

---

## Regeln fuer gute Discriminated Unions

1. **Der Diskriminator muss ein Literal-Typ sein** (`"circle"`, nicht `string`)
2. **Alle Mitglieder muessen den gleichen Property-Namen haben** (z.B. `kind`, `type`, `status`)
3. **Die Literal-Werte muessen eindeutig sein** (kein doppeltes `"circle"`)
4. **Konvention:** Die haeufigsten Tag-Namen sind `kind`, `type`, `tag`, `status`, `_tag`

```typescript
// SCHLECHT: Diskriminator ist string (zu breit)
interface Bad { kind: string; }

// GUT: Diskriminator ist ein Literal
interface Good { kind: "circle"; }

// SCHLECHT: Verschiedene Property-Namen
interface A { type: "a"; }
interface B { kind: "b"; }  // type vs kind — kein automatisches Narrowing!

// GUT: Gleicher Property-Name
interface A { kind: "a"; }
interface B { kind: "b"; }
```

> ⚡ **Praxis-Tipp:** In Angular-Projekten mit NgRx sind Actions bereits
> Discriminated Unions:
> ```typescript
> // NgRx Action Pattern:
> const loadUsers = createAction('[Users] Load');
> const loadUsersSuccess = createAction('[Users] Load Success', props<{ users: User[] }>());
> const loadUsersFailure = createAction('[Users] Load Failure', props<{ error: string }>());
> // Der Action-type ist automatisch der Diskriminator
> ```

---

## Discriminated Unions mit if statt switch

Du brauchst nicht zwingend `switch`. Auch `if`-Ketten funktionieren:

```typescript
function describe(shape: Shape): string {
  if (shape.kind === "circle") {
    return `Kreis mit Radius ${shape.radius}`;
  }
  if (shape.kind === "rectangle") {
    return `Rechteck ${shape.width}x${shape.height}`;
  }
  // shape: Triangle (einzige verbleibende Option)
  return `Dreieck mit Basis ${shape.base}`;
}
```

**Empfehlung:** Verwende `switch` mit Exhaustive Check, wenn du **alle**
Faelle explizit behandeln willst. Verwende `if`, wenn du nur
**bestimmte** Faelle brauchst.

---

## Was du gelernt hast

- **Discriminated Unions** nutzen ein gemeinsames **Tag-Property** als Diskriminator
- TypeScript **narrowt automatisch** den Typ im switch/if basierend auf dem Tag
- Der **Exhaustive Check** mit `never` erzwingt die Behandlung aller Faelle
- `assertNever` bietet **Compile-Zeit- UND Laufzeit-Schutz**
- Discriminated Unions sind TypeScript's Version von **Algebraischen Datentypen**

**Kernkonzept zum Merken:** Discriminated Unions + Exhaustive Check = Compiler-garantierte Vollstaendigkeit. Wenn du einen neuen Fall hinzufuegst, zeigt TypeScript dir JEDE Stelle, die aktualisiert werden muss.

> **Experiment:** Oeffne `examples/03-discriminated-unions.ts` und fuege
> einen vierten Shape-Typ `Pentagon` hinzu. Beobachte, wo TypeScript
> ueberall Fehler meldet — das sind die Stellen, die du aktualisieren musst.

---

> **Pausenpunkt** -- Discriminated Unions sind eines der wichtigsten
> Patterns in TypeScript. Lass das sacken, bevor du weitermachst.
>
> Weiter geht es mit: [Sektion 04: Intersection Types](./04-intersection-types.md)
