# Sektion 2: Pattern Matching mit Discriminated Unions

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Tagged Unions](./01-tagged-unions.md)
> Naechste Sektion: [03 - Algebraische Datentypen](./03-algebraische-datentypen.md)

---

## Was du hier lernst

- Warum **switch/case** das natuerliche Pattern fuer Discriminated Unions ist
- Wie der **Exhaustive Check** funktioniert und warum er dich rettet
- if/else-Ketten als Alternative
- Wie `never` unbehandelte Faelle aufdeckt

---

## switch/case: Der natuerliche Partner

Discriminated Unions und switch/case sind fuereinander gemacht.
Der Diskriminator wird zum switch-Wert, jeder case-Branch narrowt
den Typ automatisch:

```typescript annotated
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      // shape: { kind: "circle"; radius: number }
      return `Kreis mit Radius ${shape.radius}`;

    case "rectangle":
      // shape: { kind: "rectangle"; width: number; height: number }
      return `Rechteck ${shape.width}x${shape.height}`;

    case "triangle":
      // shape: { kind: "triangle"; base: number; height: number }
      return `Dreieck mit Basis ${shape.base}`;
  }
}
```

Jeder `case`-Branch kennt den exakten Typ. Das ist kein Zufall —
TypeScript nutzt den Kontrollfluss (Control Flow Analysis aus L11),
um den Typ zu verengen.

---

## Der Exhaustive Check: Dein Sicherheitsnetz

Was passiert, wenn du einen neuen Shape-Typ hinzufuegst, aber den
switch vergisst zu aktualisieren? **TypeScript kann dich warnen.**

### Methode 1: Return-Typ erzwingt Vollstaendigkeit

```typescript annotated
// Mit explizitem Return-Typ:
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    // "triangle" fehlt!
    // Error: Function lacks ending return statement
    // and return type does not include 'undefined'.
  }
}
```

Wenn du den Return-Typ angibst (`number`), merkt TypeScript,
dass nicht alle Pfade einen Wert zurueckgeben.

### Methode 2: Der never-Trick (Exhaustive Check)

Die maechtigere Methode: Nutze `never`, um unbehandelte Faelle
zur **Compile-Zeit** zu erkennen:

```typescript annotated
function assertNever(value: never): never {
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // Wenn alle Faelle behandelt sind, hat shape den Typ never.
      // Wenn ein Fall fehlt, ist shape NICHT never -> Compile-Error!
      return assertNever(shape);
  }
}
```

> **Warum funktioniert das?** Nachdem alle bekannten `case`-Branches
> durchlaufen sind, bleibt im `default`-Branch nur das uebrig, was
> keinem case entsprach. Wenn alle Faelle abgedeckt sind, bleibt
> **nichts uebrig** — der Typ ist `never`. Fehlt ein case, bleibt
> ein konkreter Typ uebrig, und `assertNever(shape)` kompiliert nicht.

---

## Praxis: Neuen Typ hinzufuegen

Stell dir vor, du fuegst `Pentagon` zur Shape-Union hinzu:

```typescript annotated
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number }
  | { kind: "pentagon"; sideLength: number };  // NEU!

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);
      //                 ^^^^^
      // Error: Argument of type '{ kind: "pentagon"; sideLength: number }'
      //        is not assignable to parameter of type 'never'.
  }
}
```

**Der Compiler zeigt dir exakt, welcher Fall fehlt.** Das ist extrem
wertvoll in grossen Codebasen mit vielen switch-Statements.

> **Erklaere dir selbst:** Was ist der Unterschied zwischen dem
> "Return-Typ"-Ansatz und dem "never"-Ansatz? Wann ist welcher besser?
> **Kernpunkte:** Return-Typ warnt nur bei Funktionen mit Return | never warnt ueberall | never zeigt den fehlenden Typ in der Fehlermeldung

---

## if/else als Alternative

Nicht jede Situation braucht ein switch. Bei wenigen Varianten oder
komplexen Bedingungen sind if/else-Ketten oft lesbarer:

```typescript annotated
type Result =
  | { success: true; data: string[] }
  | { success: false; error: string };

function handleResult(result: Result) {
  if (result.success) {
    // result: { success: true; data: string[] }
    console.log(`${result.data.length} Eintraege geladen`);
  } else {
    // result: { success: false; error: string }
    console.log(`Fehler: ${result.error}`);
  }
}
```

TypeScript narrowt auch bei `if/else` anhand des Diskriminators.
Bei `boolean`-Diskriminatoren ist if/else sogar natuerlicher als switch.

---

## Narrowing durch Zuweisung

Ein subtiles aber nuetzliches Feature: TypeScript narrowt auch bei
**Variablen-Zuweisung**:

```typescript annotated
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; offset: number };

function logEvent(event: Event) {
  const { type } = event;

  if (type === "click") {
    // event ist immer noch Event — NICHT narrowed!
    // Warum? Weil TypeScript die Verbindung zwischen
    // der destrukturierten Variable und dem Original verliert.
  }

  // Stattdessen: direkt auf event.type pruefen
  if (event.type === "click") {
    // event: { type: "click"; x: number; y: number }
    console.log(`Klick bei ${event.x}, ${event.y}`);
  }
}
```

> **Achtung:** Destrukturierung bricht das Narrowing! Pruefe immer
> direkt auf `obj.discriminator`, nicht auf eine destrukturierte Variable.
> (Ausnahme: TypeScript 5.x hat hier teilweise Verbesserungen.)

---

## Return-basiertes Narrowing

Ein elegantes Pattern: Statt verschachtelte if/else zu schreiben,
kehre frueh zurueck:

```typescript annotated
type ApiResult =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: unknown };

function processResult(result: ApiResult): string {
  if (result.status === "loading") {
    return "Laden...";
  }

  if (result.status === "error") {
    return `Fehler: ${result.message}`;
  }

  // Hier weiss TypeScript: result ist { status: "success"; data: unknown }
  // Ohne expliziten Check — durch Ausschluss der anderen Faelle!
  return `Daten: ${JSON.stringify(result.data)}`;
}
```

Das ist **Narrowing by Elimination** — TypeScript schliesst die
bereits behandelten Varianten aus.

---

## satisfies fuer bessere Typpruefung

Mit dem `satisfies`-Operator (TypeScript 5.0+) kannst du sicherstellen,
dass ein Objekt-Literal zu einem Typ passt, ohne den inferierten Typ
zu verlieren:

```typescript annotated
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

// Mit satisfies prueft TypeScript den Wert UND behaelt den Literal-Typ:
const myShape = {
  kind: "circle" as const,
  radius: 5,
} satisfies Shape;
// myShape.kind hat Typ "circle" — nicht string!
```

> **Experiment:** Probiere den Exhaustive Check direkt im TypeScript Playground (typescriptlang.org/play) aus:
>
> ```typescript
> function assertNever(value: never): never {
>   throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
> }
>
> type Shape =
>   | { kind: "circle"; radius: number }
>   | { kind: "rectangle"; width: number; height: number };
>
> function area(shape: Shape): number {
>   switch (shape.kind) {
>     case "circle": return Math.PI * shape.radius ** 2;
>     case "rectangle": return shape.width * shape.height;
>     default: return assertNever(shape);
>   }
> }
>
> // Jetzt fuege eine neue Variante zur Union hinzu:
> // | { kind: "triangle"; base: number; height: number }
> ```
>
> Was passiert im `default`-Branch nachdem du `triangle` hinzugefuegt hast? Welche Fehlermeldung gibt TypeScript aus? Was veraendert sich wenn du stattdessen `return 0` im default schreibst?

---

**In deinem Angular-Projekt:** NgRx Reducer sind klassische switch/case-Funktionen auf einer Action-Union. Der Exhaustive Check ist hier besonders wertvoll — wenn ein Kollege eine neue Action hinzufuegt aber den Reducer vergisst, faengt der Compiler es sofort ab:

```typescript
import { createReducer, on } from '@ngrx/store';
import { loadUsers, loadUsersSuccess, loadUsersFailure } from './user.actions';

// Mit manuellem Exhaustive Pattern (ohne NgRx-Makros):
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case '[User] Load':
      return { ...state, loading: true, error: null };
    case '[User] Load Success':
      return { ...state, loading: false, users: action.users };
    case '[User] Load Failure':
      return { ...state, loading: false, error: action.error };
    default:
      // assertNever(action) hier => Compile-Error wenn neue Action fehlt!
      return state;
  }
}
```

**In React:** Der `useReducer`-Hook ist dasselbe Muster. Dein Reducer erhaelt eine Action-Union und gibt neuen State zurueck — switch/case auf den Diskriminator, assertNever im default.

---

## Was du gelernt hast

- **switch/case** ist der natuerliche Partner fuer Discriminated Unions — jeder case-Branch narrowt den Typ automatisch
- Der **Exhaustive Check mit `never`** deckt fehlende Faelle zur Compile-Zeit auf und zeigt exakt welche Variante fehlt
- **if/else mit Early Return** ("Narrowing by Elimination") ist bei wenigen Varianten oft lesbarer als switch
- **Destrukturierung bricht das Narrowing** — pruefe immer direkt `obj.tag`, nicht eine destrukturierte Variable
- Der `satisfies`-Operator behaelt den inferierten Literal-Typ bei und prueft gleichzeitig die Typ-Konformitaet

**Kernkonzept:** Der Exhaustive Check mit `assertNever` ist dein Sicherheitsnetz in jeder grossen Codebasis — er verwandelt das Vergessen einer Union-Variante von einem Laufzeitfehler in einen Compilerfehler.

---

> **Pausenpunkt:** Du weisst jetzt, wie du Discriminated Unions sicher
> und vollstaendig behandelst. In der naechsten Sektion schauen wir uns an,
> woher dieses Konzept kommt — und warum Haskell und Rust es schon
> seit Jahrzehnten nutzen.
>
> Weiter: [Sektion 03 - Algebraische Datentypen](./03-algebraische-datentypen.md)
